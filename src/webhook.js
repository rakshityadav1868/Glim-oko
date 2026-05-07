var express = require("express")

var github = require("./github")
var scorer = require("./scorer")

var path = process.env.WEBHOOK_PATH || "/api/github/webhook"
var lastError = ""

var router = express.Router()

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async function (req, res) {
    var event = req.get("x-github-event") || ""

    var text = req.body.toString("utf8")
    if (!text || text[0] !== "{") {
      res.status(400).send("bad json")
      return
    }

    var payload = JSON.parse(text)

    if (event !== "pull_request") {
      res.status(200).send("ignored")
      return
    }

    var action = payload.action
    if (action !== "opened" && action !== "synchronize") {
      res.status(200).send("ignored")
      return
    }

    if (process.env.GITHUB_DEBUG === "1") {
      res.status(200).json({ ok: true, lastError: lastError })
      return
    }

    res.status(200).send("ok")

    handlePullRequest(payload).catch(function (e) {
      if (e && e.message) {
        lastError = e.message
        return
      }
      lastError = "failed"
    })
  }
)

async function handlePullRequest(payload) {
  var owner = payload.repository && payload.repository.owner && payload.repository.owner.login
  var repo = payload.repository && payload.repository.name
  var number = payload.pull_request && payload.pull_request.number
  var installationId = payload.installation && payload.installation.id

  if (!owner || !repo || !number || !installationId) {
    return
  }

  var client = await github.getInstallationClient(installationId)

  var pr = await github.getPullRequest(client, owner, repo, number)
  var files = await github.getPullRequestFiles(client, owner, repo, number)
  var commits = await github.getPullRequestCommits(client, owner, repo, number)

  var report = scorer.scorePullRequest({
    title: pr.title,
    body: pr.body,
    additions: pr.additions,
    deletions: pr.deletions,
    commits: pr.commits,
    files: files,
    commitMessages: commits
  })

  var markdown = scorer.toMarkdown(report)

  await github.upsertComment(client, owner, repo, number, markdown)
}

module.exports = {
  path: path,
  router: router
}
