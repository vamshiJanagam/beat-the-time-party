function normalizeWord(word) {
  return String(word || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+/g, ' ');
}

function isValidWordFormat(word) {
  return /^[a-z0-9][a-z0-9 '&-]*$/i.test(word);
}

module.exports = { normalizeWord, isValidWordFormat };
