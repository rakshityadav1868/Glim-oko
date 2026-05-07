var { Octokit } = require("octokit")
var crypto = require("crypto")

async function getInstallationClient(installationId) {
  var appId = process.env.GITHUB_APP_ID
  if (!appId) {
    throw new Error("missing GITHUB_APP_ID")
  }

  var pem = readPrivateKey()
  if (!pem) {
    throw new Error("missing GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_BASE64")
  }

  var jwt = makeAppJwt(String(appId), pem)

  var baseUrl = process.env.GITHUB_API_BASE_URL || "https://api.github.com"
  var appClient = new Octokit({ auth: jwt, baseUrl: baseUrl })

  var tok = await appClient.request("POST /app/installations/{installation_id}/access_tokens", {
    installation_id: installationId
  })

  var token = tok && tok.data && tok.data.token
  if (!token) {
    throw new Error("failed to create installation token")
  }

  return new Octokit({ auth: token, baseUrl: baseUrl })
}

function readPrivateKey() {
  if (process.env.GITHUB_PRIVATE_KEY && process.env.GITHUB_PRIVATE_KEY.trim()) {
    return process.env.GITHUB_PRIVATE_KEY
  }

  if (process.env.GITHUB_PRIVATE_KEY_BASE64 && process.env.GITHUB_PRIVATE_KEY_BASE64.trim()) {
    return Buffer.from(process.env.GITHUB_PRIVATE_KEY_BASE64, "base64").toString("utf8")
  }

  return ""
}

function makeAppJwt(appId, pem) {
  var header = { alg: "RS256", typ: "JWT" }

  var now = Math.floor(Date.now() / 1000)
  var payload = {
    iat: now - 30,
    exp: now + 9 * 60,
    iss: appId
  }

  var unsigned = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(payload))

  var sign = crypto.createSign("RSA-SHA256")
  sign.update(unsigned)
  sign.end()

  var sig = sign.sign(pem)
  return unsigned + "." + base64urlBuffer(sig)
}

function base64url(text) {
  var s = Buffer.from(text, "utf8").toString("base64")
  s = s.split("=").join("")
  s = s.split("+").join("-")
  s = s.split("/").join("_")
  return s
}

function base64urlBuffer(buf) {
  var s = Buffer.from(buf).toString("base64")
  s = s.split("=").join("")
  s = s.split("+").join("-")
  s = s.split("/").join("_")
  return s
}

async function getPullRequest(client, owner, repo, number) {
  var res = await client.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner: owner,
    repo: repo,
    pull_number: number
  })

  return res.data
}

async function getPullRequestFiles(client, owner, repo, number) {
  var all = []
  var page = 1

  while (true) {
    var res = await client.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
      owner: owner,
      repo: repo,
      pull_number: number,
      per_page: 100,
      page: page
    })

    for (var i = 0; i < res.data.length; i++) {
      all.push(res.data[i])
    }

    if (res.data.length < 100) {
      break
    }

    page = page + 1
    if (page > 20) {
      break
    }
  }

  return all
}

async function getPullRequestCommits(client, owner, repo, number) {
  var msgs = []
  var page = 1

  while (true) {
    var res = await client.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", {
      owner: owner,
      repo: repo,
      pull_number: number,
      per_page: 100,
      page: page
    })

    for (var i = 0; i < res.data.length; i++) {
      var c = res.data[i]
      var m = c && c.commit && c.commit.message
      if (m) {
        msgs.push(m)
      }
    }

    if (res.data.length < 100) {
      break
    }

    page = page + 1
    if (page > 20) {
      break
    }
  }

  return msgs
}

async function upsertComment(client, owner, repo, number, body) {
  var marker = "<!-- pr-slop-checker -->"
  var finalBody = marker + "\n" + body

  var comments = []
  var page = 1

  while (true) {
    var res = await client.request("GET /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner: owner,
      repo: repo,
      issue_number: number,
      per_page: 100,
      page: page
    })

    for (var i = 0; i < res.data.length; i++) {
      comments.push(res.data[i])
    }

    if (res.data.length < 100) {
      break
    }

    page = page + 1
    if (page > 10) {
      break
    }
  }

  var existing = null
  for (var j = 0; j < comments.length; j++) {
    var c = comments[j]
    if (c && c.body && c.body.indexOf(marker) !== -1) {
      existing = c
      break
    }
  }

  if (existing) {
    await client.request("PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}", {
      owner: owner,
      repo: repo,
      comment_id: existing.id,
      body: finalBody
    })
    return
  }

  await client.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner: owner,
    repo: repo,
    issue_number: number,
    body: finalBody
  })
}

module.exports = {
  getInstallationClient: getInstallationClient,
  getPullRequest: getPullRequest,
  getPullRequestFiles: getPullRequestFiles,
  getPullRequestCommits: getPullRequestCommits,
  upsertComment: upsertComment
}
