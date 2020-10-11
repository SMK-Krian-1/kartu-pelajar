const httpProxy = require("http-proxy");
const fs = require("fs");

let hostname = "kartuskarisa.io";
let sslKey = "localurl.key";
let sslCrt = "localurl.crt";

const proxy = httpProxy
  .createProxyServer({ target: { host: hostname, port: 3000 } })
  .listen(80);

const secureProxy = httpProxy
  .createProxyServer({
    target: { host: hostname, port: 3000 },
    ssl: {
      key: fs.readFileSync(sslKey, "utf8"),
      cert: fs.readFileSync(sslCrt, "utf8"),
    }, secure: true })
  .listen(443);

// Listen for the `error` event on `proxy`.
proxy.on("error", function (err, req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });

  console.log(" Error ", err);
  res.end("Something went wrong. And we are reporting a custom error message." + err);
});

// Listen for the `error` event on `proxy`.
secureProxy.on("error", function (err, req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });

  res.end("Something went wrong. And we are reporting a custom error message." + err);
});
