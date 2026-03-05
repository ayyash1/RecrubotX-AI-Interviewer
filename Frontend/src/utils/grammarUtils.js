/**
 * Basic grammar correction utility.
 * fast, lightweight, and local.
 * 
 * @param {string} text - The text to correct.
 * @returns {string} - The corrected text.
 */
export const correctGrammar = (text) => {
    if (!text) return "";

    let corrected = text;

    // 1. Capitalize the first letter of the sentence
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);

    // 2. Fix isolated lowercase "i" to "I"
    // Matches " i " surrounded by spaces or punctuation
    corrected = corrected.replace(/\b(i)\b/g, "I");

    // 3. Fix spacing around punctuation (basic)
    // Ensure space after period, comma, question mark if missing
    corrected = corrected.replace(/([.,?])(?=[a-zA-Z])/g, "$1 ");

    // 4. Common spelling fixes (very limited set for now to avoid false positives)
    const commonTypos = {
        "teh": "the",
        "dont": "don't",
        "cant": "can't",
        "wont": "won't",
        "im": "I'm",
        "ive": "I've",
        "id": "I'd",
        "wiill": "will",
        "thier": "their",
        "recive": "receive"
    };

    // Replace words found in the map
    Object.keys(commonTypos).forEach(typo => {
        const regex = new RegExp(`\\b${typo}\\b`, 'gi');
        corrected = corrected.replace(regex, (match) => {
             // Preserve casing of the match if possible, but usually we just want the fixed version
             // If the match was capitalized, capitalize the replacement
             const replacement = commonTypos[typo];
             return match[0] === match[0].toUpperCase() ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
        });
    });

    // 5. Ensure ending punctuation if it looks like a complete sentence (and doesn't have one)
    // This is a bit risky for streaming text chunks, so we might want to apply this only on the specific finalized chunks.
    // For live captioning, we might want to skip this or only apply it if the chunk ends significantly.
    // For now, let's keep it simple and NOT force punctuation on every chunk to avoid "Hello." "How." "Are."
    
    return corrected;
};
