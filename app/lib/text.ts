// =============================================================
// UI文言を一元管理するファイル
// 文言を変えたいときはここだけ修正すればOK
//
// ルール:
//   - 改行したい場所には \n を入れ、表示側で className="pre-line" を付ける
//   - 動的な値（名前など）は関数にする
//   - 絵文字はテキストの一部としてここに含める
// =============================================================

export const TEXT = {
  // ─── 共通 ───
  common: {
    backToTop: "← トップに戻る",
    loading: "読み込み中...",
    serverError: "サーバーエラーが発生しました。もう一度お試しください。",
  },

  // ─── トップページ (/) ───
  top: {
    icon: "✉️",
    title: "Beyond Connect POST",
    subtitle: "スクールアイドルの卒業生に\nメッセージを届ける",
    sendButton: "✉️ メッセージを送る",
    loginButton: "スクールアイドルOGログイン",
    footer: "Beyond Connect POST © 2026",
    termsLink: "ご利用にあたって",
    guideLink: "使い方",
  },

  // ─── 送信ページ (/send) ───
  send: {
    title: "✉️ メッセージを送る",
    subtitle: "　",
    // 宛先セクション
    recipientLabel: "宛先",
    recipientSearchPlaceholder: "🔍 氏名・学校名で検索",
    favoritesLabel: "⭐ お気に入り",
    recentLabel: "🕐 最近",
    searching: "検索中...",
    noResults: "見つかりませんでした",
    recipientNotSelected: "宛先を選んでください",
    // ニックネーム
    nicknameLabel: "ニックネーム",
    nicknameSub: "　",
    nicknamePlaceholder: "　",
    nicknameRequired: "ニックネームを入力してください",
    // メッセージ本文
    messageLabel: "メッセージ",
    messageMaxLength: 1000,
    messagePlaceholder: "1000文字以内で入力してください",
    messageRequired: "メッセージを入力してください",
    messageTooLong: "メッセージは1000文字以内で入力してください",
    // 送信ボタン
    submitButton: "✉️ メッセージを送る",
    submitting: "送信中...",
    submitError: "送信に失敗しました。もう一度お試しください。",
    // 送信成功
    successIcon: "💌",
    successTitle: "送信しました！",
    successMessage: (name: string) =>
      `メッセージは${name}さんに届けられました。`,
  },

  // ─── OGログインページ (/login) ───
  login: {
    title: "スクールアイドルOG\nログイン",
    subtitle: "届いたメッセージを確認しよう",
    schoolLabel: "学校名",
    schoolDefault: "（学校を選択してください）",
    nameLabel: "氏名",
    namePlaceholder: "登録した氏名",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワード",
    submitButton: "ログイン",
    submitting: "ログイン中...",
    validationError: "学校名・氏名・パスワードをすべて入力してください",
    loginFailed: "ログインに失敗しました",
    registerLink: "招待コードをお持ちの方はこちらから登録",
    requestLink: "アカウント登録をリクエスト",
    registeredSuccess: "登録が完了しました！ログインしてください。",
  },

  // ─── OG登録ページ (/register) ───
  register: {
    title: "スクールアイドルOG登録",
    subtitle: "招待コードを使ってアカウントを作成",
    inviteCodeLabel: "招待コード",
    inviteCodePlaceholder: "招待コードを入力",
    inviteCodeRequired: "招待コードを入力してください",
    schoolLabel: "学校名",
    schoolDefault: "（学校を選択してください）",
    schoolRequired: "学校名を選択してください",
    nameLabel: "氏名",
    namePlaceholder: "氏名を入力",
    nameRequired: "氏名を入力してください",
    passwordLabel: "パスワード",
    passwordSub: "（8文字以上）",
    passwordPlaceholder: "パスワード",
    passwordTooShort: "パスワードは8文字以上で入力してください",
    passwordConfirmLabel: "パスワード（確認）",
    passwordConfirmPlaceholder: "もう一度入力",
    passwordMismatch: "パスワードが一致しません",
    submitButton: "アカウントを作成",
    submitting: "登録中...",
    registerFailed: "登録に失敗しました",
    loginLink: "既にアカウントをお持ちの方はこちら",
    requestLink: "招待コードをお持ちでない方はこちら",
  },

  // ─── アカウント登録リクエスト (/request) ───
  request: {
    title: "📝 アカウント登録リクエスト",
    subtitle: "運営にアカウント登録をリクエストします",
    schoolLabel: "学校名",
    schoolPlaceholder: "正式名称で入力してください",
    schoolRequired: "学校名を入力してください",
    nameLabel: "氏名",
    namePlaceholder: "　",
    nameRequired: "氏名を入力してください",
    submitButton: "リクエストを送信",
    submitting: "送信中...",
    submitFailed: "リクエストの送信に失敗しました",
    successIcon: "✅",
    successTitle: "リクエストを送信しました！",
    successMessage: "運営が確認後、スクコネポストに招待コードを\nお届けします。しばらくお待ちください。",
    backToLogin: "← 登録ページに戻る",
  },

  // ─── OGダッシュボード (/dashboard) ───
  dashboard: {
    title: "📬 届いたメッセージ",
    logoutButton: "ログアウト",
    emptyIcon: "📭",
    emptyMessage: "まだメッセージはありません",
    senderSuffix: (nickname: string) => `${nickname} さんより`,
    fetchError: "メッセージの取得に失敗しました",
    connectionError: "サーバーに接続できません",
  },

  // ─── 管理画面 (/admin) ───
  admin: {
    title: "管理画面",
    subtitle: "宛先マスタ・招待コード・OGステータス",
    fetchError: "データの読み込みに失敗しました",
    // 宛先追加
    addRecipientTitle: "宛先を追加",
    addNameLabel: "氏名",
    addNamePlaceholder: "例：大沢瑠璃乃",
    addSchoolLabel: "学校名",
    addSchoolPlaceholder: "例：私立蓮ノ空女学院",
    addSchoolShortLabel: "学校名略称",
    addSchoolShortPlaceholder: "例：蓮ノ空",
    addSubmitButton: "追加する",
    addSubmitting: "追加中...",
    addFailed: "宛先の追加に失敗しました",
    // 削除
    deleteConfirm: (name: string) =>
      `${name} を削除しますか？\n※ OGアカウント・招待コードも削除されます（メッセージは保持）`,
    deleteConfirmFinal: (name: string) =>
      `【最終確認】本当に ${name} を削除しますか？この操作は取り消せません。`,
    deleteButton: "削除",
    deleteFailed: "削除に失敗しました",
    // 招待コード
    inviteTitle: "招待コードを生成",
    inviteTargetLabel: "リンク先の宛先",
    inviteTargetDefault: "（選択してください）",
    inviteSubmitButton: "招待コードを生成",
    inviteSubmitting: "生成中...",
    inviteFailed: "招待コードの生成に失敗しました",
    inviteResultLabel: "生成された招待コード：",
    inviteCopyButton: "コピー",
    // 宛先一覧
    recipientListTitle: "宛先一覧",
    recipientListEmpty: "まだ宛先が登録されていません",
    messageCount: (count: number) => `メッセージ: ${count}件`,
    ogStatusLabel: "OG登録:",
    badgeRegistered: "登録済",
    badgeInvited: "招待済",
    badgeNone: "未招待",
    inviteCodeLabel: (code: string) => `招待コード: ${code}`,
    adminNameLabel: (adminName: string) => `管理名: ${adminName}`,
    // 登録リクエスト
    requestsTitle: "登録リクエスト",
    requestsEmpty: "リクエストはありません",
    requestSchool: (school: string) => `学校: ${school}`,
    requestName: (name: string) => `氏名: ${name}`,
    requestDate: (date: string) => `申請日: ${date}`,
    badgePending: "未対応",
    badgeHandled: "対応済",
    requestMarkHandled: "対応済にする",
  },
  // ─── ご利用にあたって (/terms) ───
  terms: {
    title: "ご利用にあたって",
    // セクション1
    aboutTitle: "このサービスについて",
    aboutBody:
      "Beyond Connect POSTは、スクールアイドルの卒業生（OG）にメッセージを届けるための非公式・非営利のファンメイドサービスです。",
    // セクション2
    guidelinesTitle: "ご利用にあたってのお願い",
    guidelinesForSenders: "メッセージを送るすべての方へ：",
    guidelineSenderRules: [
      "相手を傷つける内容、誹謗中傷、脅迫、わいせつな表現を含むメッセージは送らないでください",
      "個人情報（住所、電話番号、メールアドレスなど）をメッセージに含めないでください",
      "他者の権利を侵害する内容を含めないでください",
      "返事を強要する内容は控えてください",
      "送信されたメッセージは取り消しできません",
    ],
    guidelinesForOgs: "スクールアイドルOGの方へ：",
    guidelineOgRules: [
      "アカウントのパスワードは他人に教えないでください",
      "招待コードはアカウント登録のための鍵です。登録は必ずご本人が行ってください。",
    ],
    // セクション3
    privacyTitle: "プライバシーについて",
    privacyRules: [
      "送信者のログインや個人情報の入力は不要です。送信者を特定できる情報は収集しません",
      "スクールアイドルOGのパスワードはハッシュ化して保存しており、運営を含め誰も知ることができません",
      "運営はメッセージの内容を閲覧できません",
      "本サービスはCookieを認証目的でのみ使用します",
    ],
    // セクション4
    disclaimerTitle: "免責事項",
    disclaimerRules: [
      "本サービスは個人が非営利で運営しています。サービスの継続・安定性を保証するものではありません",
      "メッセージの送受信に関して生じたトラブルについて、運営は責任を負いかねます",
      "本サービスは予告なく変更・停止する場合があります",
      "送信されたメッセージのバックアップや復旧は保証しません",
    ],
    // セクション5
    rightsTitle: "権利について",
    rightsRules: [
      "本サービスは「Link！Like！ラブライブ！」の非公式ファンメイドサービスです",
      "「Link！Like！ラブライブ！」に関するすべての権利は、株式会社オッドナンバーおよび関連するライセンサーに帰属します",
      "本サービスはリンクラのコンテンツ（画像、映像、音声、テキスト等）を使用していません",
    ],
    // セクション6
    prohibitedTitle: "禁止事項",
    prohibitedIntro:
      "以下の行為を禁止します。該当する場合、メッセージの削除やアクセスの制限を行うことがあります。",
    prohibitedRules: [
      "誹謗中傷、脅迫、ハラスメントに該当するメッセージの送信",
      "わいせつ・暴力的な内容の送信",
      "他者の個人情報の掲載",
      "商業目的での利用",
      "本サービスへの不正アクセス、サーバーへの過度な負荷をかける行為",
      "なりすまし行為（他者の招待コードを使用しての登録等）",
    ],
    // セクション7
    contactTitle: "お問い合わせ",
    contactBody:
      "本サービスに関するご質問やご報告は、XアカウントのDMにてお受けしています。",
    // フッター
    lastUpdated: "最終更新: 2026年3月",
  },

  // ─── 使い方ページ (/guide) ───
  guide: {
    title: "Beyond Connect POST — 使い方",
    conceptBeyond: "Beyond — スクコネポストの「現役のスクールアイドルにしか送れない」制約を越えて",
    conceptConnect: "Connect — 卒業したスクールアイドルと繋がる",
    conceptPost: "POST",
    conceptDescription: "Beyond Connect POST は、卒業したスクールアイドルにメッセージを届けられるサービスです。",
    // サービスについて
    serviceTitle: "サービスについて",
    serviceDescription: "Beyond Connect POST（BCP）は、スクールアイドルの卒業生へ想いを届けるためのメッセージサービスです。",
    serviceFeatures: [
      "誰でも ログインや会員登録なし で、すぐにメッセージを送れます",
      "スクールアイドル卒業生は OGログイン することで自分宛てに届いたメッセージを、いつでも読むことができます",
      "メッセージの内容は 本人以外には見えません",
    ],
    serviceUrl: "https://beyond-connect-post.vercel.app/",
    // みなさまへ
    sendTitle: "みなさまへ — メッセージの送り方",
    sendFlowTitle: "送信の流れ",
    sendFlowSteps: [
      "トップページの 「✉️ メッセージを送る」 を押す",
      "宛先を選ぶ — 検索ボックスに名前や学校名を入力するとアカウント登録されている宛先候補が表示されます",
      "ニックネームを入力 — 相手に表示される名前です（自由に決められます）",
      "メッセージを書く — 1000文字以内で、想いを綴ってください",
      "「送信」 を押して完了！",
    ],
    sendFeaturesTitle: "便利な機能",
    sendFeatures: [
      "⭐ お気に入り — よく送る相手をお気に入りに登録しておくと、次回すぐに選べます",
      "🕐 送信履歴 — 最近メッセージを送った相手が表示されます",
    ],
    sendNotesTitle: "注意事項",
    sendNotes: [
      "送ったメッセージの編集・削除はできません",
      "不適切な表現を含むメッセージは送信できない場合があります",
    ],
    // スクールアイドルOGの方へ
    ogTitle: "スクールアイドルOGの方へ — メッセージの読み方",
    ogRegisterIntro: "はじめに：アカウント登録（在学中）",
    ogRegisterDescription: "メッセージを受け取るには、アカウント登録が必要です。",
    ogRegisterNote: "アカウント登録は、在学中に実施してください。",
    ogWithCodeTitle: "招待コードをお持ちの場合",
    ogWithCodeSteps: [
      "ログイン画面の 「アカウント登録」 を押す",
      "招待コード を入力",
      "学校名 をプルダウンから選択",
      "氏名 を入力",
      "パスワード を設定（8文字以上、確認のため2回入力）",
      "「登録」を押して完了 → ログイン画面に戻ります",
    ],
    ogWithoutCodeTitle: "招待コードをお持ちでない場合",
    ogWithoutCodeSteps: [
      "ログイン画面の 「アカウント登録」 を押し、登録画面の 「招待コードをお持ちでない方はこちら」 を押す",
      "学校名 と 氏名 を入力して送信",
      "運営が確認後、 スクコネポスト で 招待コード をお送りします",
      "届いたら上の手順で登録してください",
    ],
    ogLoginTitle: "ログインとメッセージ閲覧",
    ogLoginSteps: [
      "ログイン画面で 学校名（プルダウン）・ 氏名 ・ パスワード を入力",
      "ログインすると、届いたメッセージが新しい順に一覧表示されます",
      "メッセージをタップすると全文が読めます",
    ],
    ogFaqTitle: "FAQ",
    ogFaqItems: [
      {
        q: "登録前に届いたメッセージはどうなりますか？",
        a: "アカウント登録前でも、ファンから送られたメッセージはすべて保存されています。登録・ログインすれば、過去のメッセージもすべて読めます。",
      },
      {
        q: "パスワードを忘れてしまいました",
        a: "フォームから運営にご連絡ください。パスワードのリセットを行います。",
      },
      {
        q: "ログインの有効期限はありますか？",
        a: "ログイン状態は7日間有効です。期限が切れた場合は、再度ログインしてください。",
      },
    ],
    // セキュリティ
    securityTitle: "セキュリティについて",
    securityDescription: "Beyond Connect POST では、安心してご利用いただけるよう以下の対策を行っています。",
    securityMessageTitle: "メッセージの安全性",
    securityMessageItems: [
      "NGワードフィルタ を搭載しており、不適切な表現を含むメッセージは自動的にブロックされます",
      "送信されたメッセージは 宛先の本人のみ が閲覧できます（運営は閲覧できません）",
    ],
    securityAccountTitle: "アカウントの安全性",
    securityAccountItems: [
      "パスワードは 暗号化して保存 されており、運営を含め誰も原文を見ることはできません",
      "ログインには 学校名・氏名・パスワードの3つ が必要です",
      "アカウント登録には 運営が発行した招待コード が必要なため、第三者がなりすまして登録することはできません",
      "ログインセッションは 7日間で自動的に期限切れ になります",
    ],
    securityServiceTitle: "サービス全体の保護",
    securityServiceItems: [
      "サービス公開前はアクセス制限をかけており、関係者以外はアクセスできません",
      "通信はすべて HTTPS（暗号化通信） で保護されています",
    ],
    securityOtherTitle: "その他注意事項",
    securityOtherNote: "素人制作です。注意して利用してください。",
    securitySourceNote: "ソースコードはGitHubから確認できます。",
  },

  // ─── パスワードリセット ───
  passwordReset: {
    linkText: "パスワードを忘れた方",
    message:
      "パスワードリセットはまだご利用いただけません。\n運営にご連絡ください。",
    requestSent: "パスワードリセットのリクエストを送信しました。\n運営からのご連絡をお待ちください。",
    requestFailed: "リクエストの送信に失敗しました",
    inputRequired: "学校名と氏名を入力してからお試しください",
  },
} as const;
