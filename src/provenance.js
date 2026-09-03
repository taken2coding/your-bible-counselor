// KJV 1769 Wikisource Provenance Resolver
// Canonical Source: https://en.wikisource.org/wiki/The_Holy_Bible_(King_James_Version,_1769)
// All verse citations must resolve to this source

const WIKISOURCE_BASE = "https://en.wikisource.org/wiki";
const KJV_CANONICAL = "The_Holy_Bible_(King_James_Version,_1769)";

// Book name mapping: common names -> Wikisource URL segment
// Wikisource uses: Bible_(King_James)/Genesis etc.
const BOOK_SLUGS = {
  "Genesis": "Genesis", "Exodus": "Exodus", "Leviticus": "Leviticus", "Numbers": "Numbers",
  "Deuteronomy": "Deuteronomy", "Joshua": "Joshua", "Judges": "Judges", "Ruth": "Ruth",
  "1 Samuel": "1_Samuel", "2 Samuel": "2_Samuel", "1 Kings": "1_Kings", "2 Kings": "2_Kings",
  "1 Chronicles": "1_Chronicles", "2 Chronicles": "2_Chronicles", "Ezra": "Ezra", "Nehemiah": "Nehemiah",
  "Esther": "Esther", "Job": "Job", "Psalms": "Psalms", "Psalm": "Psalms",
  "Proverbs": "Proverbs", "Ecclesiastes": "Ecclesiastes", "Song of Solomon": "Song_of_Solomon",
  "Isaiah": "Isaiah", "Jeremiah": "Jeremiah", "Lamentations": "Lamentations", "Ezekiel": "Ezekiel",
  "Daniel": "Daniel", "Hosea": "Hosea", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Obadiah",
  "Jonah": "Jonah", "Micah": "Micah", "Nahum": "Nahum", "Habakkuk": "Habakkuk",
  "Zephaniah": "Zephaniah", "Haggai": "Haggai", "Zechariah": "Zechariah", "Malachi": "Malachi",
  "Matthew": "Matthew", "Mark": "Mark", "Luke": "Luke", "John": "John",
  "Acts": "Acts", "Romans": "Romans", "1 Corinthians": "1_Corinthians", "2 Corinthians": "2_Corinthians",
  "Galatians": "Galatians", "Ephesians": "Ephesians", "Philippians": "Philippians", "Colossians": "Colossians",
  "1 Thessalonians": "1_Thessalonians", "2 Thessalonians": "2_Thessalonians",
  "1 Timothy": "1_Timothy", "2 Timothy": "2_Timothy", "Titus": "Titus", "Philemon": "Philemon",
  "Hebrews": "Hebrews", "James": "James", "1 Peter": "1_Peter", "2 Peter": "2_Peter",
  "1 John": "1_John", "2 John": "2_John", "3 John": "3_John", "Jude": "Jude", "Revelation": "Revelation"
};

function normalizeBook(book) {
  // Handle "1Samuel" -> "1 Samuel" etc.
  let b = book.trim();
  b = b.replace(/^1\s*/i, "1 ").replace(/^2\s*/i, "2 ").replace(/^3\s*/i, "3 ");
  // Capitalize
  for (const [k, v] of Object.entries(BOOK_SLUGS)) {
    if (k.toLowerCase() === b.toLowerCase()) return k;
  }
  return b;
}

function getWikisourceUrl(book, chapter, verse = null) {
  const canonicalBook = normalizeBook(book);
  const slug = BOOK_SLUGS[canonicalBook];
  if (!slug) throw new Error(`Unknown book: ${book}`);
  let url = `${WIKISOURCE_BASE}/Bible_(King_James)/${slug}#${chapter}`;
  if (verse !== null) url += `:${verse}`;
  return url;
}

function getCanonicalReference() {
  return `${WIKISOURCE_BASE}/${KJV_CANONICAL}`;
}

function formatCitation(book, chapter, verseRange) {
  // verseRange can be "1", "1-2", "1,3,5"
  const canonBook = normalizeBook(book);
  return `${canonBook} ${chapter}:${verseRange} (KJV 1769)`;
}

function citationWithProvenance(book, chapter, verseRange) {
  const citation = formatCitation(book, chapter, verseRange);
  // Extract first verse for anchor
  const firstVerse = String(verseRange).split(/[-,]/)[0];
  const url = getWikisourceUrl(book, chapter, firstVerse);
  return {
    citation,
    url,
    canonical: getCanonicalReference(),
    provenanceNote: `Verbatim KJV 1769 via Wikisource: ${getCanonicalReference()}`
  };
}

export { WIKISOURCE_BASE, KJV_CANONICAL, BOOK_SLUGS, getWikisourceUrl, getCanonicalReference, formatCitation, citationWithProvenance, normalizeBook };
