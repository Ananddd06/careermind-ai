/**
 * Utility functions for client-side RAG (Retrieval-Augmented Generation)
 */

/**
 * Splits text into chunks of roughly equal size with overlap
 */
export function chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): string[] {
  if (!text) return [];
  
  // Clean up whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;
    let isLastChunk = false;
    
    // If we're not at the end of the text, try to find a natural boundary (sentence, period, or space)
    if (endIndex < cleanText.length) {
      // Find the last period, question mark, exclamation mark, or newline in the range [endIndex - 150, endIndex + 50]
      const searchStart = Math.max(startIndex, endIndex - 150);
      const searchEnd = Math.min(cleanText.length, endIndex + 50);
      const sub = cleanText.substring(searchStart, searchEnd);
      
      const lastSentenceBoundary = Math.max(
        sub.lastIndexOf(". "),
        sub.lastIndexOf("? "),
        sub.lastIndexOf("! ")
      );

      if (lastSentenceBoundary !== -1) {
        endIndex = searchStart + lastSentenceBoundary + 1;
      } else {
        // Fall back to last space
        const lastSpace = sub.lastIndexOf(" ");
        if (lastSpace !== -1) {
          endIndex = searchStart + lastSpace;
        }
      }
    } else {
      endIndex = cleanText.length;
      isLastChunk = true;
    }

    chunks.push(cleanText.substring(startIndex, endIndex).trim());
    
    if (isLastChunk) {
      break;
    }

    const nextStartIndex = endIndex - chunkOverlap;
    // Safety check to prevent going backward or looping
    if (nextStartIndex <= startIndex) {
      startIndex = endIndex;
    } else {
      startIndex = nextStartIndex;
    }
  }

  return chunks.filter(c => c.length > 50);
}

/**
 * Performs a keyword-frequency search (TF-IDF-like) over text chunks
 */
export function searchChunks(query: string, chunks: string[], topK: number = 3): string[] {
  if (!query || chunks.length === 0) return [];

  // Stopwords list to filter out common English words
  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "to", "for", "of", "with", "by", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in",
    "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there",
    "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other",
    "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "s", "t", "can", "will", "just", "don", "should", "now", "i", "me", "my", "myself", "we",
    "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him",
    "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them",
    "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those"
  ]);

  // Clean and tokenize query
  const cleanTokens = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(token => token.length > 2 && !stopwords.has(token));

  const queryTokens = cleanTokens(query);
  
  if (queryTokens.length === 0) {
    // If no searchable terms are found, fall back to simple substring match check with original query
    const lowerQuery = query.toLowerCase();
    const scored = chunks.map((chunk, idx) => {
      const score = chunk.toLowerCase().includes(lowerQuery) ? 10 : 0;
      return { chunk, score, idx };
    });
    const filtered = scored.filter(item => item.score > 0);
    if (filtered.length > 0) {
      return filtered.sort((a, b) => b.score - a.score).slice(0, topK).map(item => item.chunk);
    }
    return chunks.slice(0, topK);
  }

  // Score each chunk
  const scoredChunks = chunks.map((chunk, idx) => {
    const chunkLower = chunk.toLowerCase();
    const chunkTokens = chunkLower.replace(/[^\w\s]/g, " ").split(/\s+/);
    
    let score = 0;
    
    queryTokens.forEach(token => {
      // Find term frequency in this chunk
      const tf = chunkTokens.filter(t => t === token).length;
      if (tf > 0) {
        score += tf * 2.0; // term matches add weight
      }
      
      // Extra points for phrase matching / sequence matching
      if (chunkLower.includes(token)) {
        score += 0.5;
      }
    });

    // Length normalization: divide by log of word count to prevent favoring long chunks excessively
    const wordCount = chunkTokens.length;
    const lengthNorm = Math.log(10 + wordCount);
    const finalScore = score / lengthNorm;

    return { chunk, score: finalScore, idx };
  });

  // Filter chunks with positive scores and sort them descending
  const matched = scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matched.length === 0) {
    // Return first topK chunks as default context if no keywords matched
    return chunks.slice(0, topK);
  }

  return matched.slice(0, topK).map(item => item.chunk);
}
