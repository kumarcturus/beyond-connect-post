# Beyond Connect POST - VercelのKV（Database）設定手順

KV Error: `@vercel/kv: Missing required environment variables` は、VercelのプロジェクトにKVデータベースがまだ接続されていないことによるエラーです。

以下の手順で、無料で作成できるVercel KVデータベースを設定してください。

### 手順

1. [Vercelダッシュボード](https://vercel.com/) にアクセスし、`beyond-connect-post` のプロジェクト画面を開きます。
2. 画面上部のタブから **「Storage」** をクリックします。
3. 画面中央の **「Connect Database」** または **「Create Database」** ボタンをクリックします。
4. **「KV」**（または **「Upstash Redis」**）を選択します。
5. データベース名（例: `beyond-connect-kv` 等）を入力し、Regionは「Washington, D.C.」などそのままで **「Create & Continue」** をクリックします。
6. このプロジェクトに接続（Connect）する画面が出るので、そのまま **「Connect」** をクリックします。

### 設定の反映

データベースを接続すると、自動的に必要な環境変数（`KV_REST_API_...` など）が設定されます。
**この変更を反映するためには、もう一度デプロイ（再ビルド）が必要です。**

1. 画面上部のタブから **「Deployments」** をクリックします。
2. 一番上にある最新のデプロイの右側の「...」メニューから **「Redeploy」** をクリックします。
3. デプロイ完了後、再度メッセージの送信をお試しください！
