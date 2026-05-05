/**
 * GitHub API ke saath baat karne ka layer
 */

/**
 * Pull Request mein jo files hain unki list mangwata hai.
 * @param {import('octokit').Octokit} octokit 
 * @param {Object} params - { owner, repo, pull_number }
 */
async function getPRFiles(octokit, { owner, repo, pull_number }) {
  try {
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number,
      per_page: 100 // Minimal app hai toh 100 kafi honi chahiye
    });
    return files;
  } catch (error) {
    console.error("PR files fetch karne mein error:", error.message);
    return [];
  }
}

/**
 * Pull Request pe comment post karta hai.
 * @param {import('octokit').Octokit} octokit 
 * @param {Object} params - { owner, repo, pull_number, body }
 */
async function postPRComment(octokit, { owner, repo, pull_number, body }) {
  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body
    });
  } catch (error) {
    console.error("PR comment post karne mein error:", error.message);
  }
}

module.exports = {
  getPRFiles,
  postPRComment
};
