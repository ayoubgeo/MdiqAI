const { createServer } = require('http');
const { createServer: createSecureServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, './privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, './fullchain.pem'))
};

app.prepare().then(() => {
  createSecureServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(443, err => {
    if (err) throw err;
    console.log('> Ready on https://localhost:443');
  });

  createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80, err => {
    if (err) throw err;
    console.log('> Redirecting all http traffic to https');
  });
});
