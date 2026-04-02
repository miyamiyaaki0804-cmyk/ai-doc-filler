import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Vercel: 最大60秒まで許可
export const maxDuration = 60;

// ⚠️ 安全設計: このAPIルートはデータを「読み取り・分析」するのみ。
// 元ファイルのバイナリデータはサーバーに送信されず、変更・保存も一切しない。
// Gemini APIへはテキスト抽出済みのデータのみ送信する。

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface SheetData {
  name: string;
  data: (string | number | boolean | null)[][];
}

interface ExtractedExcel {
  type: "excel";
  sheets: SheetData[];
}

interface ExtractedWord {
  type: "word";
  text: string;
}

type ExtractedData = ExtractedExcel | ExtractedWord;

/* ------------------------------------------------------------------ */
/*  Prompt builder                                                      */
/* ------------------------------------------------------------------ */
function buildPrompt(
  sourceData: ExtractedData,
  templateData: ExtractedData,
  templateType: "excel" | "word"
): string {
  const sourceStr =
    sourceData.type === "excel"
      ? JSON.stringify(
          sourceData.sheets.map((s) => ({
            sheet: s.name,
            rows: s.data.slice(0, 200),
          })),
          null,
          2
        )
      : sourceData.text.slice(0, 8000);

  const templateStr =
    templateData.type === "excel"
      ? JSON.stringify(
          templateData.sheets.map((s) => ({
            sheet: s.name,
            rows: s.data.slice(0, 200),
          })),
          null,
          2
        )
      : templateData.text.slice(0, 4000);

  if (templateType === "excel") {
    return `あなたはドキュメント自動補完AIです。

## 指示
以下の「元データ」から顧客情報や各種データを読み取り、
「テンプレート（空白Excelシート）」の適切なセルへ入力してください。

## 元データ (Source)
\`\`\`json
${sourceStr}
\`\`\`

## テンプレート構造 (Template)
\`\`\`json
${templateStr}
\`\`\`

## 出力ルール（厳守）
- 必ず有効なJSONのみを返すこと。説明文・コメント・コードブロック記号は一切不要。
- row/col はすべて 0 始まりのインデックス（0-indexed）で指定すること。
- 元データに存在しない値は推測せず、空欄のままにすること。
- テンプレートにすでに値が入っているヘッダーセルは上書きしないこと。
- 空白セルや、明らかに値を入力すべきセルのみを埋めること。

## 出力フォーマット（JSON）
{
  "type": "excel",
  "cells": [
    { "sheet": "シート名", "row": 行番号, "col": 列番号, "value": "入力値" },
    ...
  ]
}`;
  } else {
    return `あなたはドキュメント自動補完AIです。

## 指示
以下の「元データ」から顧客情報や各種データを読み取り、
「テンプレート（Wordドキュメントの下書き）」の空欄や該当箇所を埋めて
完成したドキュメントの内容を返してください。

## 元データ (Source)
${sourceStr}

## テンプレート (Template)
${templateStr}

## 出力ルール（厳守）
- 必ず有効なJSONのみを返すこと。説明文・コメント・コードブロック記号は一切不要。
- 元データに存在しない値は推測せず、空欄のままにすること。
- テンプレートの構成・見出し・段落構造を可能な限り維持すること。
- 各セクション(section)のheadingはWord見出しになります。
- contentは改行区切りのプレーンテキストで記述してください。

## 出力フォーマット（JSON）
{
  "type": "word",
  "sections": [
    { "heading": "見出し（任意）", "content": "本文テキスト\\n続き..." },
    { "content": "見出しなしの段落..." },
    ...
  ]
}`;
  }
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                        */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  let body: {
    apiKey?: string;
    sourceData: ExtractedData;
    templateData: ExtractedData;
    templateType: "excel" | "word";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの解析に失敗しました。" }, { status: 400 });
  }

  const { apiKey, sourceData, templateData, templateType } = body;

  // 環境変数優先、なければクライアントから受け取ったキーを使用
  const resolvedKey = process.env.GEMINI_API_KEY || apiKey || "";

  if (!resolvedKey || !sourceData || !templateData || !templateType) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。Vercelの環境変数またはUI上で入力してください。" },
      { status: 400 }
    );
  }

  if (!resolvedKey.startsWith("AIza")) {
    return NextResponse.json(
      { error: "Gemini APIキーの形式が正しくありません（AIza で始まる必要があります）。" },
      { status: 400 }
    );
  }

  /* Build prompt */
  const prompt = buildPrompt(sourceData, templateData, templateType);

  /* Call Gemini */
  let rawText: string;
  try {
    const genAI = new GoogleGenerativeAI(resolvedKey);
    // gemini-1.5-flash は無料枠あり（1日1500リクエスト）
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isAuthErr = msg.includes("API_KEY_INVALID") || msg.includes("401") || msg.includes("403");
    return NextResponse.json(
      {
        error: isAuthErr
          ? "APIキーが無効です。Google AI Studioで確認してください。"
          : `Gemini APIエラー: ${msg}`,
      },
      { status: 500 }
    );
  }

  /* Parse JSON from Gemini's response */
  let parsed: { type: string; cells?: unknown[]; sections?: unknown[] };
  try {
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          { error: "AIの応答を解析できませんでした。再度お試しください。", raw: rawText.slice(0, 500) },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "AIの応答にJSON形式のデータが含まれていませんでした。", raw: rawText.slice(0, 500) },
        { status: 500 }
      );
    }
  }

  // ✅ サーバーはリクエストデータを一切保存・キャッシュしない
  return NextResponse.json(parsed);
}
