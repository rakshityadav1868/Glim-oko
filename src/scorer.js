function scorePullRequest(pr) {
  var obs = []
  var sug = []
  var score = 100

  var checks = [
    checkTitle(pr.title),
    checkDescription(pr.body),
    checkGenericBody(pr.body),
    checkIssueReference(pr.title, pr.body),
    checkManyFilesLowBody(pr.files, pr.body),
    checkHugeAddOneCommit(pr.additions, pr.commits),
    checkTestsTouched(pr.files),
    checkAIPhrases(pr.body),
    checkCommitMessages(pr.commitMessages),
    checkBigDump(pr.additions, pr.deletions, pr.files, pr.body),
    checkNoImplementationDetails(pr.body)
  ]

  for (var i = 0; i < checks.length; i++) {
    var c = checks[i]
    if (c && c.penalty) {
      score = score - c.penalty
      if (c.message) {
        obs.push("- " + c.message + ".")
      }
      if (c.suggestion) {
        sug.push("- " + c.suggestion + ".")
      }
    }
  }

  if (score < 0) score = 0
  if (score > 100) score = 100

  if (obs.length === 0) {
    obs.push("- Nothing obvious flagged.")
  }

  if (sug.length === 0) {
    sug.push("- Keep the description practical and include any testing notes.")
  }

  return {
    score: score,
    observations: uniq(obs),
    suggestions: uniq(sug)
  }
}

function checkTitle(title) {
  var t = (title || "").trim()
  if (!t) {
    return { penalty: 10, message: "Missing PR title", suggestion: "Add a short, specific title" }
  }

  if (t.length < 8) {
    return { penalty: 8, message: "Title is very short", suggestion: "Make the title more specific" }
  }

  var low = t.toLowerCase()
  if (t.length < 18) {
    if (startsWithWord(low, "update") || startsWithWord(low, "fix") || startsWithWord(low, "changes") || startsWithWord(low, "improvements")) {
      return { penalty: 6, message: "Title looks generic", suggestion: "Mention what was actually changed" }
    }
  }

  return { penalty: 0 }
}

function checkDescription(body) {
  var b = (body || "").trim()
  if (!b) {
    return { penalty: 22, message: "Description is empty", suggestion: "Explain what you changed and why" }
  }

  if (b.length < 60) {
    return { penalty: 18, message: "Description is too short", suggestion: "Add a couple sentences about the approach" }
  }

  if (b.length < 120) {
    return { penalty: 8, message: "Description is pretty short", suggestion: "Add context and testing notes" }
  }

  return { penalty: 0 }
}

function checkGenericBody(body) {
  var b = (body || "").toLowerCase()
  if (!b) return { penalty: 0 }

  var bad = [
    "this pr includes",
    "this pr updates",
    "minor changes",
    "various improvements",
    "general cleanup",
    "code refactor",
    "small refactor",
    "bug fixes",
    "updated dependencies"
  ]

  var hits = 0
  for (var i = 0; i < bad.length; i++) {
    if (b.indexOf(bad[i]) !== -1) {
      hits = hits + 1
    }
  }

  if (hits >= 2) {
    return {
      penalty: 14,
      message: "PR explanation looks generic",
      suggestion: "Call out the key change and any behavior differences"
    }
  }

  return { penalty: 0 }
}

function checkIssueReference(title, body) {
  var t = title || ""
  var b = body || ""
  var tLow = t.toLowerCase()
  var bLow = b.toLowerCase()

  if (hasIssueNumber(tLow) || hasClosesFixes(bLow)) {
    return { penalty: 0 }
  }

  return { penalty: 8, message: "No issue reference found", suggestion: "Link an issue or add context for why this exists" }
}

function checkManyFilesLowBody(files, body) {
  var count = Array.isArray(files) ? files.length : 0
  var b = (body || "").trim()

  if (count >= 25 && b.length < 200) {
    return {
      penalty: 16,
      message: "Many files changed with little explanation",
      suggestion: "Summarize the main parts of the change and why so many files moved"
    }
  }

  if (count >= 60 && b.length < 400) {
    return {
      penalty: 22,
      message: "Huge set of file changes with poor context",
      suggestion: "Break this up or add a clear breakdown of what changed"
    }
  }

  return { penalty: 0 }
}

function checkHugeAddOneCommit(additions, commits) {
  var add = Number(additions || 0)
  var c = Number(commits || 0)

  if (add >= 800 && c <= 1) {
    return {
      penalty: 18,
      message: "Large code additions with a single commit",
      suggestion: "Split it into a few commits that explain the steps"
    }
  }

  if (add >= 2000 && c <= 2) {
    return {
      penalty: 24,
      message: "Very large PR with very few commits",
      suggestion: "Consider smaller PRs or a clearer commit story"
    }
  }

  return { penalty: 0 }
}

function checkTestsTouched(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return { penalty: 0 }
  }

  var touched = false
  for (var i = 0; i < files.length; i++) {
    var name = files[i] && files[i].filename
    if (!name) continue

  var low = String(name).toLowerCase()
  if (hasTestPath(low)) {
      touched = true
      break
    }
  }

  if (!touched) {
    return { penalty: 10, message: "No test files were modified", suggestion: "Add or update tests (or mention why not)" }
  }

  return { penalty: 0 }
}

function startsWithWord(text, word) {
  if (text.indexOf(word) !== 0) {
    return false
  }

  if (text.length === word.length) {
    return true
  }

  var ch = text[word.length]
  if (ch === " " || ch === ":" || ch === "-" || ch === "/" || ch === "_") {
    return true
  }

  return false
}

function hasIssueNumber(text) {
  var i = text.indexOf("#")
  while (i !== -1) {
    var j = i + 1
    var count = 0
    while (j < text.length) {
      var ch = text[j]
      if (ch < "0" || ch > "9") {
        break
      }
      count = count + 1
      if (count > 7) {
        break
      }
      j = j + 1
    }

    if (count >= 1 && count <= 7) {
      return true
    }

    i = text.indexOf("#", i + 1)
  }

  return false
}

function hasClosesFixes(text) {
  var a = text.indexOf("closes #")
  if (a !== -1) {
    return true
  }

  var b = text.indexOf("fixes #")
  if (b !== -1) {
    return true
  }

  return false
}

function hasTestPath(name) {
  if (name.indexOf("/test/") !== -1 || name.indexOf("/tests/") !== -1) {
    return true
  }

  if (name.indexOf(".test.") !== -1 || name.indexOf(".spec.") !== -1) {
    return true
  }

  var start = 0
  while (true) {
    var idx = name.indexOf("/", start)
    var part = ""
    if (idx === -1) {
      part = name.slice(start)
    } else {
      part = name.slice(start, idx)
    }

    if (part === "test" || part === "tests") {
      return true
    }

    if (idx === -1) {
      break
    }
    start = idx + 1
  }

  return false
}

function checkAIPhrases(body) {
  var b = (body || "").toLowerCase()
  if (!b) return { penalty: 0 }

  var phrases = [
    "as an ai",
    "i apologize",
    "hopefully this helps",
    "let me know if you have any questions",
    "comprehensive",
    "robust",
    "seamless",
    "leverage",
    "cutting-edge",
    "best practices",
    "enhanced overall",
    "future-proof"
  ]

  var hits = 0
  for (var i = 0; i < phrases.length; i++) {
    if (b.indexOf(phrases[i]) !== -1) {
      hits = hits + 1
    }
  }

  if (hits >= 2) {
    return {
      penalty: 16,
      message: "Repeated generic AI-style phrases",
      suggestion: "Replace generic wording with concrete behavior notes"
    }
  }

  if (hits === 1) {
    return {
      penalty: 6,
      message: "Some wording looks templated",
      suggestion: "Make the description more specific to the change"
    }
  }

  return { penalty: 0 }
}

function checkCommitMessages(msgs) {
  if (!Array.isArray(msgs) || msgs.length === 0) return { penalty: 0 }

  var bad = 0
  for (var i = 0; i < msgs.length; i++) {
    var m = (msgs[i] || "").trim().toLowerCase()
    if (!m) continue

    if (m === "update" || m === "fix" || m === "changes" || m === "wip" || m === "tmp") {
      bad = bad + 1
      continue
    }

    if (m.indexOf("generated") !== -1 || m.indexOf("chatgpt") !== -1 || m.indexOf("copilot") !== -1) {
      bad = bad + 1
      continue
    }

    if (m.length < 6) {
      bad = bad + 1
      continue
    }
  }

  if (bad >= 2) {
    return {
      penalty: 12,
      message: "Suspicious or low-signal commit messages",
      suggestion: "Use commit messages that describe the actual change"
    }
  }

  return { penalty: 0 }
}

function checkBigDump(additions, deletions, files, body) {
  var add = Number(additions || 0)
  var del = Number(deletions || 0)
  var total = add + del
  var count = Array.isArray(files) ? files.length : 0
  var b = (body || "").trim()

  if (total >= 5000 && b.length < 500) {
    return {
      penalty: 22,
      message: "Large code dump with little explanation",
      suggestion: "Add a short breakdown (what moved, what changed, what stayed the same)"
    }
  }

  if (count >= 80 && total >= 2000 && b.length < 600) {
    return {
      penalty: 18,
      message: "Massive refactor with poor context",
      suggestion: "Explain the motivation and how you verified behavior"
    }
  }

  return { penalty: 0 }
}

function checkNoImplementationDetails(body) {
  var b = (body || "").toLowerCase()
  if (!b) return { penalty: 0 }

  var has = false
  var hints = ["how", "why", "because", "tradeoff", "tested", "test", "steps", "approach", "note", "risk"]
  for (var i = 0; i < hints.length; i++) {
    if (b.indexOf(hints[i]) !== -1) {
      has = true
      break
    }
  }

  if (!has && b.length < 350) {
    return {
      penalty: 10,
      message: "No implementation details in the description",
      suggestion: "Add a couple bullets about what you changed and how you tested"
    }
  }

  return { penalty: 0 }
}

function toMarkdown(report) {
  var lines = []
  lines.push("## PR Quality Report")
  lines.push("")
  lines.push("Score: " + report.score + "/100")
  lines.push("")
  lines.push("### Observations")
  lines.push(report.observations.join("\n"))
  lines.push("")
  lines.push("### Suggestions")
  lines.push(report.suggestions.join("\n"))
  lines.push("")
  lines.push("_This is a simple heuristic report. It can be wrong._")
  return lines.join("\n")
}

function uniq(items) {
  var out = []
  for (var i = 0; i < items.length; i++) {
    var s = items[i]
    var seen = false
    for (var j = 0; j < out.length; j++) {
      if (out[j] === s) {
        seen = true
        break
      }
    }
    if (!seen) {
      out.push(s)
    }
  }
  return out
}

module.exports = {
  scorePullRequest: scorePullRequest,
  toMarkdown: toMarkdown
}
