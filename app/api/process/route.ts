import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Vercel: 最大60秒まで許可（Proプランは60s、Hobbyは10s）
export const maxDuration = 60;

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
            rows: s.data.slice(0, 200), // cap for token safety
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
    apiKey: string;
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

  if (!apiKey || !sourceData || !templateData || !templateType) {
    return NextResponse.json(
      { error: "必須パラメータが不足しています。" },
      { status: 400 }
    );
  }

  if (!apiKey.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "Anthropic APIキーの形式が正しくありません（sk-ant- で始まる必要があります）。" },
      { status: 400 }
    );
  }

  /* Build prompt */
  const prompt = buildPrompt(sourceData, templateData, templateType);

  /* Call Claude */
  let rawText: string;
  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Claudeからテキスト応答が得られませんでした。");
    }
    rawText = block.text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isAuthErr = msg.includes("401") || msg.includes("authentication");
    return NextResponse.json(
      {
        error: isAuthErr
          ? "APIキーが無効です。Anthropicコンソールで確認してください。"
          : `Claude APIエラー: ${msg}`,
      },
      { status: 500 }
    );
  }

  /* Parse JSON from Claude's response */
  let parsed: { type: string; cells?: unknown[]; sections?: unknown[] };
  try {
    // Strip possible markdown code fences
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON substring
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          {
            error:
              "AIの応答を解析できませんでした。再度お試しください。",
            raw: rawText.slice(0, 500),
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "AIの応答にJSON形式のデータが含まれていませんでした。",
          raw: rawText.slice(0, 500),
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(parsed);
}
