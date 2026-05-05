/**
 * GlimOko Scoring Engine
 * PR quality check karne ka logic yahan hai.
 */

const CONFIG = {
  MIN_DESCRIPTION_LENGTH: 50,
  PENALTY_SHORT_DESCRIPTION: 20,
  PENALTY_NO_ISSUE_REF: 10,
  LARGE_DIFF_FILE_THRESHOLD: 5,
  LARGE_DIFF_DESC_THRESHOLD: 100,
  PENALTY_LARGE_DIFF_WEAK_DESC: 20,
  PENALTY_NO_TESTS: 15,
  SINGLE_COMMIT_THRESHOLD: 1,
  LARGE_ADDITIONS_THRESHOLD: 200,
  PENALTY_SINGLE_COMMIT_LARGE_DIFF: 10
};

/**
 * PR metadata aur changed files ke basis pe PR score calculate karta hai.
 * @param {Object} prData - PR details jaise title, body, commits, wagera.
 * @param {Array} files - Jo files change hui hain unki list.
 * @returns {Object} - { score, observations, suggestions }
 */
function evaluatePR(prData, files) {
  let score = 100;
  const observations = [];
  const suggestions = [];

  const { body, commits, additions, changed_files } = prData;
  const description = body || "";

  // 1. Description ki length check karna
  if (description.length < CONFIG.MIN_DESCRIPTION_LENGTH) {
    score -= CONFIG.PENALTY_SHORT_DESCRIPTION;
    observations.push(`PR description bahut choti hai (${description.length} chars).`);
    suggestions.push("Thoda detail mein batayein ki kya changes kiye hain.");
  }

  // 2. Issue reference check karna
  const issueRefRegex = /#\d+|https:\/\/github\.com\/.*\/issues\/\d+/;
  if (!issueRefRegex.test(description)) {
    score -= CONFIG.PENALTY_NO_ISSUE_REF;
    observations.push("Description mein koi issue reference (#123) nahi mila.");
    suggestions.push("Context ke liye kisi relevant issue ko link karein.");
  }

  // 3. Agar files 5 se zyada hain par description 100 characters se kam hai
  if (changed_files > CONFIG.LARGE_DIFF_FILE_THRESHOLD && description.length < CONFIG.LARGE_DIFF_DESC_THRESHOLD) {
    score -= CONFIG.PENALTY_LARGE_DIFF_WEAK_DESC;
    observations.push(`Bada change set hai (${changed_files} files) par explanation kam hai.`);
    suggestions.push("Bade PRs ke liye achi description likhna zaroori hai.");
  }

  // 4. Check karna ki test files change hui hain ya nahi
  const testFileRegex = /(test|spec|__tests__)/i;
  const hasTests = files.some(f => testFileRegex.test(f.filename));
  if (!hasTests) {
    score -= CONFIG.PENALTY_NO_TESTS;
    observations.push("Koi test files change nahi hui.");
    suggestions.push("Changes verify karne ke liye tests zaroori hain.");
  }

  // 5. Agar sirf ek commit hai aur additions 200 se zyada hain
  if (commits === CONFIG.SINGLE_COMMIT_THRESHOLD && additions > CONFIG.LARGE_ADDITIONS_THRESHOLD) {
    score -= CONFIG.PENALTY_SINGLE_COMMIT_LARGE_DIFF;
    observations.push("Ek hi commit mein bahut zyada code add kiya gaya hai.");
    suggestions.push("Behtar review ke liye code ko chote commits mein divide karein.");
  }

  // Score ko 0 aur 100 ke beech mein rakhna
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    observations,
    suggestions
  };
}

module.exports = {
  evaluatePR,
  CONFIG
};
