# GlimOko

A minimal GitHub App that evaluates Pull Request quality and posts automated, explainable feedback.

## Features

- Automated Scoring: Evaluates PRs on a scale of 0-100 based on deterministic signals.
- Explainable Feedback: Provides "Key Observations" and "Suggestions" to help contributors improve.
- Lightweight: Built with Node.js and Octokit, no database required.

## Scoring Logic

| Signal | Penalty |
| :--- | :--- |
| Description length < 50 chars | -20 |
| No issue reference (#123 etc.) | -10 |
| Files changed > 5 AND description < 100 chars | -20 |
| No test files changed | -15 |
| Only 1 commit AND additions > 200 | -10 |

## Setup Instructions

### 1. Create a GitHub App
1. Go to your GitHub Developer Settings.
2. Click New GitHub App.
3. Set GitHub App name to GlimOko.
4. Set Homepage URL (can be your GitHub profile for now).
5. Set Webhook URL to your server endpoint (use smee.io for local development).
6. Set a Webhook secret.
7. Permissions:
   - Pull requests: Read & Write (to read metadata and post comments).
   - Contents: Read-only (to check file names).
8. Events:
   - Subscribe to Pull request events.
9. Click Create GitHub App.

### 2. Configure Environment
1. Download the Private Key (PEM file) from the App settings page.
2. Copy .env.example to .env.
3. Fill in the values:
   - APP_ID: Found in the General settings.
   - WEBHOOK_SECRET: The secret you defined.
   - PRIVATE_KEY: The contents of the .pem file. Important: Replace newlines with \n if pasting as a single line, or wrap in quotes.

### 3. Install and Run
```bash
npm install
npm start
```

### 4. Local Development (Optional)
If running locally, use smee to forward webhooks:
```bash
npx smee-client --url https://smee.io/YOUR_ID --target http://localhost:3000/api/webhook
```

## Project Structure
```
/src
  app.js      # Entry point and server setup
  webhook.js  # Event handling and processing
  scorer.js   # Scoring engine logic
  github.js   # GitHub API wrappers
```

## Example Payload Handling
The app listens for pull_request.opened and pull_request.synchronize. When triggered, it:
1. Extracts PR metadata (title, body, additions, etc.).
2. Fetches the list of changed files via Octokit.
3. Passes data to the evaluatePR engine.
4. Posts a structured markdown comment back to the PR.
