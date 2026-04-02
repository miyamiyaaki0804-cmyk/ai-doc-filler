import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm shadow">
              🤖
            </div>
            <span className="font-bold text-gray-900">AI Doc Filler</span>
          </div>
          <Link
            href="/app"
            className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
          >
            無料で使う →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-indigo-50 via-white to-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            Gemini AI 搭載（無料）
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            顧客データを<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              AIが自動で
            </span>
            <br />テンプレートに入力
          </h1>

          <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-xl mx-auto">
            Excelの顧客リストやWordの報告書など、<br />
            面倒なデータ入力作業をAIが数秒で完了。<br />
            元ファイルは一切変更されません。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg text-base"
            >
              🚀 今すぐ無料で使う
            </Link>
            <a
              href="#how-it-works"
              className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-base"
            >
              使い方を見る ↓
            </a>
          </div>

          {/* 実績バッジ */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-400">
            {[
              { icon: "🔒", text: "ファイルはサーバーに保存されない" },
              { icon: "⚡", text: "数秒〜数十秒で完了" },
              { icon: "📄", text: "Excel・Word 両対応" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
            こんな作業が一瞬で終わります
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">😩</span>
                <span className="font-bold text-red-500">Before（今まで）</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "顧客リストを見ながら手入力",
                  "コピー＆ペーストを何十回も繰り返す",
                  "入力ミスや転記漏れが発生",
                  "1件あたり5〜10分かかる",
                  "大量データは残業が必要…",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎉</span>
                <span className="font-bold text-green-600">After（AI導入後）</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "元データとテンプレートをアップするだけ",
                  "AIが内容を理解して自動マッピング",
                  "転記ミスゼロ・人的エラーなし",
                  "100件でも数十秒で完了",
                  "ダウンロードして即使える",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              たった3ステップで完成
            </h2>
            <p className="text-gray-500">難しい操作は一切不要。ファイルを選ぶだけ。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "📋",
                title: "元データをアップ",
                desc: "顧客名・住所・数値など情報が入ったExcel・Wordファイルを選択します。",
                color: "from-blue-500 to-indigo-500",
              },
              {
                step: "02",
                icon: "📝",
                title: "テンプレートをアップ",
                desc: "データを入力したい空白の下書きファイルをアップします。",
                color: "from-indigo-500 to-violet-500",
              },
              {
                step: "03",
                icon: "⬇️",
                title: "完成ファイルをDL",
                desc: "AIが自動でデータを入力した完成ファイルをダウンロードするだけ。",
                color: "from-violet-500 to-purple-500",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-md mx-auto mb-4`}>
                  {item.icon}
                </div>
                <div className="absolute top-0 right-0 md:right-auto md:left-0 text-xs font-black text-gray-200 text-6xl leading-none -z-10 select-none">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Arrow connector */}
          <div className="hidden md:flex justify-center gap-28 -mt-32 mb-16 text-gray-300 text-2xl pointer-events-none">
            <span>→</span>
            <span>→</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-14">
            選ばれる理由
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "AIが内容を理解",
                desc: "項目名が違っていても、AIが意味を読み取って正しくマッピング。単純な検索置換と違います。",
              },
              {
                icon: "🔒",
                title: "元ファイルは絶対安全",
                desc: "アップしたファイルは読み取り専用。サーバーへの保存・変更は一切行いません。",
              },
              {
                icon: "📊",
                title: "Excel・Word両対応",
                desc: "表形式のExcel（.xlsx）も文章のWord（.docx）も、どちらのテンプレートにも対応。",
              },
              {
                icon: "⚡",
                title: "驚くほど高速",
                desc: "数十件のデータでも数秒〜数十秒で完了。残業ゼロへ。",
              },
              {
                icon: "🌐",
                title: "インストール不要",
                desc: "ブラウザだけで動作。Windowsでも Macでも、どのデバイスからでも使えます。",
              },
              {
                icon: "💰",
                title: "自分のAPIキーで使える",
                desc: "Google Gemini APIキーを入力するだけ。無料枠内なら費用ゼロで使えます。",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
            こんな場面で活躍
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🏢", title: "営業・顧客管理", desc: "顧客リストから見積書・請求書・案内状を一括作成" },
              { icon: "🏥", title: "医療・介護", desc: "患者情報から各種書類・報告書を自動作成" },
              { icon: "🏫", title: "教育・学校", desc: "生徒名簿から通知表・証明書類を効率化" },
              { icon: "🏗️", title: "建設・不動産", desc: "物件情報から契約書・報告書を瞬時に作成" },
              { icon: "📦", title: "物流・在庫管理", desc: "在庫データから発注書・納品書を自動生成" },
              { icon: "🎯", title: "イベント・セミナー", desc: "参加者リストから名札・資料を一括作成" },
            ].map((u) => (
              <div key={u.title} className="flex gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                <span className="text-3xl shrink-0">{u.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{u.title}</p>
                  <p className="text-xs text-gray-500">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">
            今すぐ無料で試してみる
          </h2>
          <p className="text-indigo-200 mb-10 text-base leading-relaxed">
            アカウント登録不要。<br />
            Google Gemini APIキーだけあればすぐ使えます。
          </p>
          <Link
            href="/app"
            className="inline-block bg-white text-indigo-700 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl"
          >
            🚀 アプリを使う
          </Link>
          <p className="text-xs text-indigo-300 mt-6">
            APIキーの取得は{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              aistudio.google.com/apikey
            </a>{" "}
            から
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs">
            🤖
          </div>
          <span className="font-semibold text-gray-600">AI Doc Filler</span>
        </div>
        <p>Powered by Google Gemini · ファイルはブラウザ内で処理されます</p>
        <p className="mt-1">
          <a
            href="https://github.com/miyamiyaaki0804-cmyk/ai-doc-filler"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
