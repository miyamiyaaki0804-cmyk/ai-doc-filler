"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type FileKind = "excel" | "word" | "unknown";
type Step =
  | "idle"
  | "extracting"
  | "ai-processing"
  | "generating"
  | "done"
  | "error";

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

interface FilledCell {
  sheet: string;
  row: number;
  col: number;
  value: string | number;
}

interface FilledSection {
  heading?: string;
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers: detect file type                                           */
/* ------------------------------------------------------------------ */
function getFileKind(file: File): FileKind {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv"))
    return "excel";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "word";
  return "unknown";
}

function kindLabel(kind: FileKind) {
  if (kind === "excel") return "Excel";
  if (kind === "word") return "Word";
  return "不明";
}

function kindIcon(kind: FileKind) {
  if (kind === "excel")
    return (
      <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-0.5 rounded-full">
        XLS
      </span>
    );
  if (kind === "word")
    return (
      <span className="text-blue-600 font-bold text-xs bg-blue-100 px-2 py-0.5 rounded-full">
        DOC
      </span>
    );
  return null;
}

/* ------------------------------------------------------------------ */
/*  File extraction (client-side, no server)                           */
/*  ⚠️ 元ファイルは絶対に変更しない: File オブジェクトは読み取り専用、    */
/*     arrayBuffer() は毎回新しいコピーを返す（ブラウザ仕様）           */
/* ------------------------------------------------------------------ */
async function extractExcel(file: File): Promise<ExtractedExcel> {
  const XLSX = await import("xlsx");
  // .slice(0) で防御的コピーを作成 → 元データへの副作用を完全にゼロに
  const buffer = (await file.arrayBuffer()).slice(0);
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheets: SheetData[] = workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
    }) as (string | number | boolean | null)[][];
    return { name, data };
  });
  return { type: "excel", sheets };
}

async function extractWord(file: File): Promise<ExtractedWord> {
  const mammoth = await import("mammoth");
  // .slice(0) で防御的コピーを作成 → 元データへの副作用を完全にゼロに
  const buffer = (await file.arrayBuffer()).slice(0);
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return { type: "word", text: result.value };
}

async function extract(file: File): Promise<ExtractedData> {
  const kind = getFileKind(file);
  if (kind === "excel") return extractExcel(file);
  if (kind === "word") return extractWord(file);
  throw new Error(`サポートされていないファイル形式: ${file.name}`);
}

/* ------------------------------------------------------------------ */
/*  Output generation (client-side)                                    */
/* ------------------------------------------------------------------ */
async function generateExcelBlob(
  templateFile: File,
  cells: FilledCell[]
): Promise<Blob> {
  const XLSX = await import("xlsx");

  // .slice(0) で防御的コピー → テンプレートの元ファイルは一切変更しない
  const buffer = (await templateFile.arrayBuffer()).slice(0);

  // cellStyles: true で書式（色・フォント・罫線）を保持して読み込み
  const wb = XLSX.read(buffer, {
    type: "array",
    cellStyles: true,
    cellDates: true,   // 日付セルを Date オブジェクトとして扱う
    cellNF: true,      // 数値フォーマット文字列を保持
  });

  for (const c of cells) {
    const ws = wb.Sheets[c.sheet];
    if (!ws) continue;
    const ref = XLSX.utils.encode_cell({ r: c.row, c: c.col });

    // 値に応じてセル型を自動判定
    const existing = ws[ref] || {};
    let cellType: string;
    let cellValue = c.value;

    if (typeof c.value === "number") {
      cellType = "n"; // 数値
    } else if (typeof c.value === "boolean") {
      cellType = "b"; // ブール
    } else {
      // 数値文字列は数値型に変換（例: "1234" → 1234）
      const num = Number(c.value);
      if (c.value !== "" && !isNaN(num)) {
        cellType = "n";
        cellValue = num;
      } else {
        cellType = "s"; // 文字列
      }
    }

    ws[ref] = {
      ...existing,       // 既存の書式・スタイルを引き継ぐ
      v: cellValue,
      t: cellType,
      w: String(cellValue), // 表示文字列
    };
  }

  // Excel 形式（.xlsx）で書き出し・書式を保持
  const out = XLSX.write(wb, {
    type: "array",
    bookType: "xlsx",
    cellStyles: true,  // 書式を出力にも反映
  });

  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

async function generateWordBlob(sections: FilledSection[]): Promise<Blob> {
  const {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    Packer,
    AlignmentType,
  } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [];

  for (const sec of sections) {
    if (sec.heading) {
      children.push(
        new Paragraph({
          text: sec.heading,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 120 },
        })
      );
    }
    const lines = sec.content.split("\n");
    for (const line of lines) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({
              text: line || " ",
              size: 22,
              font: "游明朝",
            }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(doc);
}

/* ------------------------------------------------------------------ */
/*  Drop Zone Component                                                 */
/* ------------------------------------------------------------------ */
function DropZone({
  label,
  hint,
  file,
  onFile,
  accept,
  disabled,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  accept: string;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const kind = file ? getFileKind(file) : null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer select-none
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-indigo-400 hover:bg-indigo-50/50"}
        ${isDragging ? "border-indigo-500 bg-indigo-50 drop-active" : "border-gray-300 bg-white"}
        ${file ? "border-indigo-300 bg-indigo-50/30" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file ? (
        <div className="flex items-center gap-3 fade-in">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
            {kind === "excel" ? "📊" : "📄"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {file.name}
              </p>
              {kind && kindIcon(kind)}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {(file.size / 1024).toFixed(1)} KB · {kindLabel(kind!)}
            </p>
          </div>
          <div className="text-indigo-500 text-lg">✓</div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">
            {isDragging ? "📂" : "📁"}
          </div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">{hint}</p>
          <p className="text-xs text-indigo-400 mt-2 font-medium">
            クリックまたはドラッグ＆ドロップ
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Badge                                                          */
/* ------------------------------------------------------------------ */
function StepBadge({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
        w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all
        ${done ? "bg-indigo-600 text-white" : active ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400" : "bg-gray-100 text-gray-400"}
      `}
      >
        {done ? "✓" : num}
      </div>
      <span
        className={`text-sm font-medium ${active || done ? "text-indigo-700" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                        */
/* ------------------------------------------------------------------ */
const STEPS: { step: Step; label: string; pct: number }[] = [
  { step: "extracting", label: "ファイルを読み込み中…", pct: 25 },
  { step: "ai-processing", label: "AIが分析・入力中…", pct: 60 },
  { step: "generating", label: "ドキュメントを生成中…", pct: 90 },
  { step: "done", label: "完成！", pct: 100 },
];

function ProcessingBar({ step }: { step: Step }) {
  const current = STEPS.find((s) => s.step === step) ?? STEPS[0];
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-indigo-700">
          {current.label}
        </span>
        <span className="text-sm text-gray-400">{current.pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
          style={{ width: `${current.pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alternative Methods Section                                         */
/* ------------------------------------------------------------------ */
function AlternativeMethods() {
  const [open, setOpen] = useState(false);
  const alts = [
    {
      icon: "⚡",
      title: "Edge Functions (Vercel Edge)",
      desc: "軽量処理に最適。コールドスタートが速く、テキスト抽出のみ Edge で行い Claude API 呼び出しも可。ファイル生成はクライアント側（本アプリの方式）。",
      tag: "低負荷",
      tagColor: "bg-green-100 text-green-700",
    },
    {
      icon: "🌐",
      title: "完全クライアント処理（APIキー直接呼び出し）",
      desc: "SheetJS/mammoth でブラウザ内ファイル解析し、Claude API をブラウザから直接呼び出し。サーバーコスト ゼロ。ただしAPIキーが露出するため、自社利用限定推奨。",
      tag: "サーバーレス",
      tagColor: "bg-blue-100 text-blue-700",
    },
    {
      icon: "🐍",
      title: "Google Apps Script + Gemini",
      desc: "Google スプレッドシート・ドキュメントと連携。スクリプトエディタで動くためサーバー不要。既存 G Suite 環境ならコスト最小。",
      tag: "Google連携",
      tagColor: "bg-yellow-100 text-yellow-700",
    },
    {
      icon: "🖥️",
      title: "Electronデスクトップアプリ",
      desc: "ユーザーのPC上でファイル処理。ネットワーク転送ゼロでサーバー完全不要。大容量ファイルも安全に処理可能。",
      tag: "オフライン対応",
      tagColor: "bg-purple-100 text-purple-700",
    },
    {
      icon: "🐳",
      title: "Python FastAPI + Docker (自前サーバー)",
      desc: "openpyxl / python-docx で完全なフォーマット保持。GPU不要、月$20前後のVPSでも動作。大量バッチ処理に向く。",
      tag: "高機能",
      tagColor: "bg-red-100 text-red-700",
    },
    {
      icon: "📦",
      title: "Word/Excel アドイン (Office JS API)",
      desc: "Office アプリ内のサイドパネルで動作。既存テンプレートのスタイルを完全保持したまま AI 入力が可能。IT部門への展開に最適。",
      tag: "Office統合",
      tagColor: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-semibold text-gray-700">
            サーバー負荷を抑える代替手法
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            6 つの方法
          </span>
        </div>
        <span
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 grid gap-3 fade-in">
          {alts.map((a) => (
            <div
              key={a.title}
              className="flex gap-3 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/40 transition-colors"
            >
              <div className="text-2xl shrink-0">{a.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-gray-800">
                    {a.title}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.tagColor}`}
                  >
                    {a.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [saveKey, setSaveKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");

  /* Load saved API key */
  useEffect(() => {
    const saved = localStorage.getItem("ai_doc_filler_key");
    if (saved) {
      setApiKey(saved);
      setSaveKey(true);
    }
  }, []);

  /* Cleanup blob URLs */
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  // 環境変数にキーが設定済みの場合はUI入力不要
  const serverHasKey = process.env.NEXT_PUBLIC_HAS_API_KEY === "true";
  const canProcess =
    sourceFile && templateFile && (serverHasKey || apiKey.trim().length > 10) && step === "idle";

  const reset = () => {
    setStep("idle");
    setError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setDownloadName("");
  };

  /* ---- Main process handler ---- */
  const handleProcess = async () => {
    if (!sourceFile || !templateFile || !apiKey) return;

    const templateKind = getFileKind(templateFile);
    if (templateKind === "unknown") {
      setError("テンプレートファイルの形式がサポートされていません。");
      return;
    }

    setError(null);
    setStep("extracting");

    try {
      /* 1. Extract data from both files */
      const [sourceData, templateData] = await Promise.all([
        extract(sourceFile),
        extract(templateFile),
      ]);

      /* 2. Call Claude via API route */
      setStep("ai-processing");

      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          sourceData,
          templateData,
          templateType: templateKind,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `APIエラー: ${res.status}`);
      }

      const result = await res.json();

      /* 3. Generate output file */
      setStep("generating");

      let blob: Blob;
      let filename: string;

      if (templateKind === "excel") {
        blob = await generateExcelBlob(templateFile, result.cells ?? []);
        // 拡張子を必ず .xlsx に統一（.xls → .xlsx も変換）
        const baseName = templateFile.name.replace(/\.(xls|xlsx|csv)$/i, "");
        filename = `filled_${baseName}.xlsx`;
      } else {
        blob = await generateWordBlob(result.sections ?? []);
        // Ensure .docx extension
        filename = `filled_${templateFile.name.replace(/\.doc$/, ".docx")}`;
      }

      /* 4. Save key & set download */
      if (saveKey) {
        localStorage.setItem("ai_doc_filler_key", apiKey.trim());
      } else {
        localStorage.removeItem("ai_doc_filler_key");
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(filename);

      // ✅ 元データ・テンプレートをメモリから即座に消去
      // 完成ファイル（blob URL）だけを残す
      setSourceFile(null);
      setTemplateFile(null);

      setStep("done");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
      setStep("error");
    }
  };

  /* ---- Derived UI state ---- */
  const isProcessing =
    step === "extracting" || step === "ai-processing" || step === "generating";

  const stepNum = ((): number => {
    if (!sourceFile) return 1;
    if (!templateFile) return 2;
    if (!apiKey.trim()) return 3;
    if (step === "done") return 5;
    return 4;
  })();

  /* ------------------------------------------------------------------ */
  /*  Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg shadow-sm">
            🤖
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              AI ドキュメント自動補完
            </h1>
            <p className="text-xs text-gray-400">
              顧客データをテンプレートへ自動入力
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Gemini Powered
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Step indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { num: 1, label: "元データ" },
            { num: 2, label: "テンプレート" },
            { num: 3, label: "APIキー" },
            { num: 4, label: "生成" },
            { num: 5, label: "ダウンロード" },
          ].map((s, i, arr) => (
            <div key={s.num} className="flex items-center gap-2">
              <StepBadge
                num={s.num}
                label={s.label}
                active={stepNum === s.num}
                done={stepNum > s.num}
              />
              {i < arr.length - 1 && (
                <div
                  className={`h-0.5 w-4 rounded-full transition-colors ${stepNum > s.num ? "bg-indigo-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card 1: Source File */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📋</span>
            <h2 className="font-bold text-gray-800">
              ① 元データファイル（情報が入ったファイル）
            </h2>
          </div>
          <DropZone
            label="顧客情報・データが含まれるファイル"
            hint="Excel (.xlsx) または Word (.docx) をアップロード"
            file={sourceFile}
            onFile={setSourceFile}
            accept=".xlsx,.xls,.docx,.doc,.csv"
            disabled={isProcessing}
          />
          {sourceFile && (
            <p className="text-xs text-gray-400 mt-2 ml-1">
              ✓ AIがこのファイルからデータを読み取ります
              <span className="ml-2 text-green-600 font-medium">🔒 元ファイルは変更されません</span>
            </p>
          )}
        </section>

        {/* Card 2: Template File */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📝</span>
            <h2 className="font-bold text-gray-800">
              ② テンプレートファイル（下書き・空白のフォーム）
            </h2>
          </div>
          <DropZone
            label="データを入力したいテンプレート"
            hint="空欄になっているExcel・Wordテンプレートをアップロード"
            file={templateFile}
            onFile={setTemplateFile}
            accept=".xlsx,.xls,.docx,.doc"
            disabled={isProcessing}
          />
          {templateFile && sourceFile && (
            <p className="text-xs text-gray-400 mt-2 ml-1">
              ✓ AIが①のデータをこのテンプレートへ自動マッピングします
              <span className="ml-2 text-green-600 font-medium">🔒 元ファイルは変更されません</span>
            </p>
          )}
          {templateFile && sourceFile && getFileKind(templateFile) !== getFileKind(sourceFile) && (
            <p className="text-xs text-amber-600 mt-2 ml-1 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠ 元データとテンプレートのファイル形式が異なります。どちらも同じ形式が推奨です。
            </p>
          )}
        </section>

        {/* Card 3: API Key（環境変数設定済みなら非表示） */}
        {serverHasKey ? (
          <section className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">🔑</span>
            <div>
              <p className="text-sm font-semibold text-green-800">③ APIキー設定済み</p>
              <p className="text-xs text-green-600">サーバーの環境変数から自動で読み込まれます</p>
            </div>
            <span className="ml-auto text-green-500 text-lg">✓</span>
          </section>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔑</span>
              <h2 className="font-bold text-gray-800">③ Gemini APIキー（無料）</h2>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-indigo-500 hover:underline"
              >
                無料で取得 →
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                disabled={isProcessing}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent disabled:opacity-50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              >
                {showKey ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                id="save-key"
                type="checkbox"
                checked={saveKey}
                onChange={(e) => setSaveKey(e.target.checked)}
                className="rounded accent-indigo-500"
                disabled={isProcessing}
              />
              <label htmlFor="save-key" className="text-xs text-gray-500 cursor-pointer">
                このブラウザに保存する（サーバーへは送信しません）
              </label>
            </div>
          </section>
        )}

        {/* Card 4: Process & Result */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

          {/* Processing progress */}
          {isProcessing && (
            <div className="fade-in">
              <ProcessingBar step={step} />
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full spin" />
                AIが処理中です。しばらくお待ちください…
              </div>
            </div>
          )}

          {/* Error */}
          {step === "error" && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 fade-in">
              <p className="text-sm font-semibold text-red-700 mb-1">
                エラーが発生しました
              </p>
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={reset}
                className="mt-3 text-xs font-medium text-red-600 hover:underline"
              >
                ← やり直す
              </button>
            </div>
          )}

          {/* Success download */}
          {step === "done" && downloadUrl && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 fade-in">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl bounce-once">🎉</span>
                <div>
                  <p className="font-bold text-green-800">生成完了！</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    AIがデータの入力を完了しました
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2.5 mb-4 border border-green-100 text-sm text-gray-600 font-mono truncate">
                📄 {downloadName}
              </div>
              <div className="flex gap-3">
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity shadow-sm text-sm"
                >
                  ⬇ ダウンロード
                </a>
                <button
                  onClick={reset}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  新しく処理
                </button>
              </div>
            </div>
          )}

          {/* Generate button */}
          {step === "idle" && (
            <button
              onClick={handleProcess}
              disabled={!canProcess}
              className={`
                w-full py-4 rounded-xl font-bold text-base transition-all shadow-sm
                ${canProcess
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 hover:shadow-md active:scale-[0.99]"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"}
              `}
            >
              {canProcess
                ? "🤖 AIで自動補完して生成する"
                : !sourceFile
                  ? "① 元データファイルを選択してください"
                  : !templateFile
                    ? "② テンプレートファイルを選択してください"
                    : "③ APIキーを入力してください"}
            </button>
          )}

          {/* Info */}
          {step === "idle" && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: "🔒", text: "ファイルはサーバーに保存されません" },
                { icon: "🧠", text: "Gemini AI が内容を理解してマッピング" },
                { icon: "⚡", text: "数秒〜数十秒で生成完了" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex flex-col items-center gap-1 text-center p-3 rounded-xl bg-gray-50"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs text-gray-500 leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Alternative methods accordion */}
        <AlternativeMethods />

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-8 space-y-1">
          <div className="flex justify-center gap-4 mb-2">
            <a href="/howto" className="text-indigo-400 hover:underline">使い方・機能一覧</a>
            <a href="/privacy" className="text-indigo-400 hover:underline">プライバシーポリシー</a>
          </div>
          <p>
            ファイルはブラウザ内で処理され、クラウドへのアップロードは行われません
          </p>
          <p>
            Powered by{" "}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              Google Gemini
            </a>
            {" · "}
            <a
              href="https://github.com/miyam/ai-doc-filler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              GitHub
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
