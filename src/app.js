require("dotenv").config()

var express = require("express")
var webhook = require("./webhook")

var app = express()

app.get("/health", function (req, res) {
  res.json({ ok: true })
})

app.use(webhook.path, webhook.router)

var port = Number(process.env.PORT || 3000)

app.listen(port, function () {
})
