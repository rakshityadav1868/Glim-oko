# PR Slop Checker

This is a small GitHub App that watches Pull Requests and leaves a comment with a quick “PR Quality Report”.

It uses simple, deterministic checks (not AI) to flag PRs that look low-effort or overly generic.

### What it does

- Listens to `pull_request` webhooks (`opened` and `synchronize`)
- Pulls PR info (title/body/files/commits/additions/deletions)
- Computes a 0–100 score with short observations + suggestions
- Posts (or updates) a comment on the PR
