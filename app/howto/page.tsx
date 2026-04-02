import Link from "next/link";

export default function HowToPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm">
              🤖
            </div>
            <span className="font-bold text-gray-900">AI Doc Filler</span>
          </Link>
          <Link
            href="/app"
            className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            アプリを使う →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">使い方・機能一覧</h1>
        <p className="text-gray-400 text-sm mb-12">AI Doc Filler の操作手順と機能の詳細</p>

        {/* ── 基本的な使い方 ── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-black">1</span>
            基本的な使い方
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "STEP 1",
                icon: "📋",
                title: "元データファイルをアップロード",
                desc: "顧客名・住所・数値など、入力したい情報が含まれた Excel（.xlsx）または Word（.docx）ファイルを選択します。ドラッグ＆ドロップまたはクリックでファイルを選べます。",
                note: "例：顧客リスト、売上データ、名簿など",
              },
              {
                step: "STEP 2",
                icon: "📝",
                title: "テンプレートファイルをアップロード",
                desc: "データを入力したい空白の下書きファイルをアップロードします。Excel・Word どちらも対応しています。",
                note: "例：請求書テンプレート、報告書フォーム、申請書など",
              },
              {
                step: "STEP 3",
                icon: "🤖",
                title: "「AIで自動補完して生成する」をクリック",
                desc: "ボタンをクリックすると AI が元データを読み取り、テンプレートの適切な箇所に自動入力します。通常数秒〜数十秒で完了します。",
                note: "処理中はプログレスバーで進捗を確認できます",
              },
              {
                step: "STEP 4",
                icon: "⬇️",
                title: "完成ファイルをダウンロード",
                desc: "生成が完了したら「ダウンロード」ボタンをクリック。Excel はそのまま編集可能な .xlsx 形式、Word は .docx 形式でダウンロードされます。",
                note: "ダウンロード後、元データとテンプレートはメモリから自動削除されます",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-indigo-50/30 transition-colors">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">{item.step}</span>
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-1">{item.desc}</p>
                  <p className="text-xs text-indigo-400">💡 {item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 機能一覧 ── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-black">2</span>
            機能一覧
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📊", title: "Excel 対応（.xlsx / .xls）", desc: "セルの書式・数値・日付を保持したまま AI がデータを入力。編集可能な .xlsx でダウンロードできます。" },
              { icon: "📄", title: "Word 対応（.docx）", desc: "文章の構成・見出しを維持しながらデータを補完。.docx 形式でダウンロードできます。" },
              { icon: "🧠", title: "AI によるインテリジェントマッピング", desc: "項目名が異なっていても AI が意味を読み取り、適切なセルや段落に自動でマッピングします。" },
              { icon: "🔒", title: "元ファイル保護", desc: "アップロードしたファイルは読み取り専用。サーバーへの保存・変更は一切行いません。" },
              { icon: "🗑️", title: "処理後の自動消去", desc: "完成ファイル生成後、元データとテンプレートはブラウザのメモリから即座に削除されます。" },
              { icon: "📁", title: "ドラッグ＆ドロップ対応", desc: "ファイルをブラウザにドラッグするだけでアップロードできます。" },
              { icon: "🌐", title: "インストール不要", desc: "ブラウザだけで動作。Windows・Mac・スマートフォンからでも使えます。" },
              { icon: "⚡", title: "高速処理", desc: "Google Gemini AI による高速処理。通常 10〜30 秒で完了します。" },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-bold text-sm text-gray-900 mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 対応ファイル形式 ── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-black">3</span>
            対応ファイル形式
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-200">形式</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-200">拡張子</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-200">元データ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 border border-gray-200">テンプレート</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { fmt: "Excel", ext: ".xlsx / .xls", src: "✅", tmpl: "✅" },
                  { fmt: "Word", ext: ".docx / .doc", src: "✅", tmpl: "✅" },
                  { fmt: "CSV", ext: ".csv", src: "✅", tmpl: "—" },
                ].map((row) => (
                  <tr key={row.fmt} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border border-gray-200 font-medium">{row.fmt}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-500 font-mono text-xs">{row.ext}</td>
                    <td className="px-4 py-3 border border-gray-200 text-center">{row.src}</td>
                    <td className="px-4 py-3 border border-gray-200 text-center">{row.tmpl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── よくある質問 ── */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-black">4</span>
            よくある質問
          </h2>
          <div className="space-y-3">
            {[
              { q: "元のファイルは変更されますか？", a: "いいえ。アップロードしたファイルは読み取り専用で処理されます。元ファイルが変更されることは一切ありません。" },
              { q: "ファイルはサーバーに保存されますか？", a: "保存されません。ファイルの内容はブラウザ内で処理され、AI への送信もテキストデータのみです。処理完了後はメモリから自動削除されます。" },
              { q: "AIが間違った箇所に入力することはありますか？", a: "AIは内容を理解してマッピングしますが、完璧ではありません。ダウンロード後に必ず内容を確認してください。" },
              { q: "大量のデータでも処理できますか？", a: "1ファイルあたり数百行程度のデータは問題なく処理できます。非常に大きなファイルは処理時間が長くなる場合があります。" },
              { q: "無料で使えますか？", a: "Google Gemini APIの無料枠（1日1,500回）の範囲内であれば無料でご利用いただけます。" },
            ].map((item) => (
              <details key={item.q} className="border border-gray-200 rounded-xl overflow-hidden group">
                <summary className="px-5 py-4 cursor-pointer font-semibold text-sm text-gray-800 hover:bg-gray-50 flex items-center justify-between list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 py-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-100 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-8">
          <p className="font-bold text-gray-800 mb-4">さっそく使ってみる</p>
          <Link
            href="/app"
            className="inline-block bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            🚀 アプリを開く
          </Link>
        </div>
      </main>
    </div>
  );
}
