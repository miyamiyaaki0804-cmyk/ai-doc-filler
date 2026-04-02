import Link from "next/link";

const LAST_UPDATED = "2026年4月2日";

export default function PrivacyPage() {
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
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← トップへ戻る
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-gray-400 text-sm mb-12">最終更新日：{LAST_UPDATED}</p>

        <div className="prose prose-sm max-w-none space-y-12">

          {/* 1. 事業者情報 */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              1. 事業者情報
            </h2>
            <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600 space-y-2">
              <p>本サービス「AI Doc Filler」は以下の事業者が運営しています。</p>
              <table className="w-full text-sm mt-3">
                <tbody className="space-y-1">
                  {[
                    { label: "サービス名", value: "AI Doc Filler" },
                    { label: "運営者", value: "miyamiyaaki0804-cmyk" },
                    { label: "お問い合わせ", value: "GitHub Issues よりご連絡ください" },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 pr-4 font-semibold text-gray-700 w-32">{row.label}</td>
                      <td className="py-2 text-gray-500">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 収集する情報 */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              2. 収集する情報
            </h2>
            <p className="text-sm text-gray-600 mb-4">本サービスでは、以下の情報を収集する場合があります。</p>
            <div className="space-y-3">
              {[
                {
                  title: "アップロードファイルのテキストデータ",
                  desc: "処理のために、アップロードされたファイルからテキストを抽出しAIへ送信します。ファイルのバイナリデータはサーバーに送信・保存されません。テキストデータも処理完了後に即座に破棄されます。",
                  badge: "一時的",
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  title: "Gemini APIキー",
                  desc: "ユーザーが入力したAPIキーは、AIへのリクエスト時にのみ使用されます。サーバーへの永続的な保存は行いません。「このブラウザに保存する」を選択した場合のみ、お使いのブラウザのローカルストレージに保存されます（サーバーには送信されません）。",
                  badge: "ローカル保存のみ",
                  color: "bg-green-100 text-green-700",
                },
                {
                  title: "IPアドレス・ブラウザ情報",
                  desc: "不正アクセスの防止・セキュリティ監視のため、サーバーへのリクエスト時にIPアドレスおよびブラウザ情報（User-Agent）がホスティングサービス（Vercel）のサーバーログに記録される場合があります。",
                  badge: "自動収集",
                  color: "bg-amber-100 text-amber-700",
                },
                {
                  title: "アクセスログ",
                  desc: "ページの閲覧日時、参照元URLなどのアクセスログが、ホスティングサービスにより自動的に収集される場合があります。",
                  badge: "自動収集",
                  color: "bg-amber-100 text-amber-700",
                },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.color}`}>{item.badge}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. 情報の利用目的 */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              3. 情報の利用目的
            </h2>
            <p className="text-sm text-gray-600 mb-3">収集した情報は以下の目的に限り使用します。</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "ドキュメントの自動補完機能の提供",
                "不正アクセス・不正利用の検知および防止",
                "サービスの安定稼働・障害対応",
                "サービス改善および機能追加のための統計的分析",
                "法令に基づく対応が必要な場合",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. 第三者提供・外部サービス */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              4. 第三者提供・外部サービスの利用
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              本サービスは以下の外部サービスを利用しており、各サービスのプライバシーポリシーが適用されます。
            </p>
            <div className="space-y-3">
              {[
                {
                  name: "Google Gemini API（Google LLC）",
                  purpose: "AI によるドキュメント補完処理",
                  data: "ファイルから抽出したテキストデータ",
                  link: "https://policies.google.com/privacy",
                },
                {
                  name: "Vercel（Vercel Inc.）",
                  purpose: "本サービスのホスティング・配信",
                  data: "IPアドレス、アクセスログ",
                  link: "https://vercel.com/legal/privacy-policy",
                },
              ].map((svc) => (
                <div key={svc.name} className="p-5 rounded-xl border border-gray-100 bg-gray-50 text-sm">
                  <p className="font-semibold text-gray-800 mb-2">{svc.name}</p>
                  <div className="space-y-1 text-gray-500">
                    <p>利用目的：{svc.purpose}</p>
                    <p>送信データ：{svc.data}</p>
                    <p>
                      プライバシーポリシー：{" "}
                      <a href={svc.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                        {svc.link}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              上記以外の第三者へ個人情報を提供することは、法令に基づく場合を除き行いません。
            </p>
          </section>

          {/* 5. データの保管・セキュリティ */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              5. データの保管・セキュリティ
            </h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>本サービスは以下のセキュリティ対策を実施しています。</p>
              <ul className="space-y-2">
                {[
                  "通信はすべて HTTPS（TLS暗号化）で保護されます",
                  "アップロードされたファイルのバイナリデータはサーバーに送信・保存されません",
                  "AIへ送信するのはファイルから抽出したテキストのみです",
                  "処理完了後、元データおよびテンプレートデータはブラウザのメモリから即座に削除されます",
                  "APIキーはユーザーのブラウザのローカルストレージにのみ保存され、サーバーへは処理のリクエスト時のみ送信されます",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">🔒</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-gray-400 text-xs mt-2">
                ※ インターネット上の通信において完全なセキュリティを保証することはできません。ご了承ください。
              </p>
            </div>
          </section>

          {/* 6. データの削除 */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              6. データの削除
            </h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>本サービスでは、ユーザーデータを以下のタイミングで削除します。</p>
              <ul className="space-y-2">
                {[
                  "ファイル処理完了後：元データ・テンプレートはブラウザのメモリから即時削除",
                  "ブラウザのタブ・ウィンドウを閉じた時：完成ファイルのダウンロードURLも自動削除",
                  "ローカルストレージのAPIキー：ブラウザの設定からいつでも削除可能",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 shrink-0">🗑️</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                サーバーにユーザーデータを保存していないため、削除申請は原則不要です。
                サーバーログの削除については、ホスティングサービス（Vercel）のポリシーに従います。
              </p>
            </div>
          </section>

          {/* 7. Cookie について */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              7. Cookie について
            </h2>
            <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                本サービス自体はトラッキング目的の Cookie を使用していません。
                ただし、以下の場合に Cookie が使用される場合があります。
              </p>
              <ul className="space-y-2">
                {[
                  "ホスティングサービス（Vercel）による負荷分散・セキュリティ用の技術的 Cookie",
                  "ブラウザのセッション管理のための一時的な Cookie",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5 shrink-0">🍪</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                ユーザーはブラウザの設定から Cookie を無効にすることができます。
                ただし、一部の機能が正常に動作しなくなる場合があります。
              </p>
            </div>
          </section>

          {/* 8. ポリシーの変更 */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
              8. プライバシーポリシーの変更
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800 leading-relaxed">
              <p className="font-semibold mb-2">⚠️ 予告なく変更される場合があります</p>
              <p>
                本プライバシーポリシーは、法令の改正・サービスの変更・その他必要に応じて、
                <strong>予告なく変更される場合があります。</strong>
                変更後のポリシーは本ページに掲載した時点より効力を生じます。
                重要な変更がある場合は可能な限りお知らせしますが、定期的に本ページをご確認いただくことをお勧めします。
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-3">最終更新日：{LAST_UPDATED}</p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/" className="hover:text-indigo-500 transition-colors">トップ</Link>
          <Link href="/howto" className="hover:text-indigo-500 transition-colors">使い方</Link>
          <Link href="/privacy" className="hover:text-indigo-500 transition-colors">プライバシーポリシー</Link>
        </div>
      </footer>
    </div>
  );
}
