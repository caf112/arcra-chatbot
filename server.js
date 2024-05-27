const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// 環境変数PORTを使用してポートを設定
const port = process.env.PORT || 8080;

app.prepare().then(() => {
  const server = express();

  // すべてのルートをNext.jsハンドラに委譲
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // ポートでサーバーを起動
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Server ready on http://localhost:${port}`);
  });
});