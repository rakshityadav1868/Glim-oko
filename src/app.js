require('dotenv').config();
const express = require('express');
const { App } = require('octokit');
const { createNodeMiddleware } = require('@octokit/webhooks');
const { handlePullRequestEvent } = require('./webhook');

// Zaroori environment variables check karo
const { APP_ID, PRIVATE_KEY, WEBHOOK_SECRET, PORT } = process.env;

if (!APP_ID || !PRIVATE_KEY || !WEBHOOK_SECRET) {
  console.error('Error: APP_ID, PRIVATE_KEY, ya WEBHOOK_SECRET missing hai');
  process.exit(1);
}

// Octokit App initialize karo
const app = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET
  }
});

// Webhook Listeners set up karo
app.webhooks.on('pull_request.opened', async ({ octokit, payload }) => {
  await handlePullRequestEvent(octokit, payload);
});

app.webhooks.on('pull_request.synchronize', async ({ octokit, payload }) => {
  await handlePullRequestEvent(octokit, payload);
});

app.webhooks.onError((error) => {
  console.error(`Webhook handle karne mein error: ${error.message}`);
});

// Express Server set up karo
const expressApp = express();
const port = PORT || 3000;

// Octokit ka middleware use karo webhook requests ke liye
// Ye middleware signature verification automatically kar leta hai
const middleware = createNodeMiddleware(app.webhooks, { path: '/api/webhook' });
expressApp.use(middleware);

expressApp.get('/', (req, res) => {
  res.send('GlimOko GitHub App chal rahi hai!');
});

expressApp.listen(port, () => {
  console.log(`GlimOko webhooks ke liye listen kar raha hai: http://localhost:${port}/api/webhook`);
});
