// Translation utility using free Google Translate gtx endpoint
// This module provides automatic translation functionality for tours and announcements
// NOTE: This uses Google's unofficial gtx endpoint which is free but may have limitations.
// For production use, consider migrating to Google Cloud Translation API or similar service.

// Allowed language codes for translation
const ALLOWED_LANGUAGES = ['en', 'th', 'zh'];

/**
 * Translate text using Google Translate's free gtx endpoint
 * @param {string} text - The text to translate
 * @param {string} targetLang - Target language code ('th' or 'zh')
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, targetLang, sourceLang = 'en') {
  // Return original text if no translation needed
  if (!text || sourceLang === targetLang) {
    return text;
  }

  // Validate language codes to prevent injection
  if (!ALLOWED_LANGUAGES.includes(sourceLang) || !ALLOWED_LANGUAGES.includes(targetLang)) {
    console.warn(`Invalid language codes: ${sourceLang} -> ${targetLang}. Allowed: ${ALLOWED_LANGUAGES.join(', ')}`);
    return text;
  }

  // Check text length to prevent URL length issues (limit to 4000 characters)
  if (text.length > 4000) {
    console.warn(`Text too long for translation (${text.length} characters). Returning original text.`);
    return text;
  }

  try {
    // Google Translate free gtx endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Translation failed for "${text.substring(0, 50)}..." to ${targetLang}:`, response.statusText);
      return text; // Return original text on error
    }

    const data = await response.json();

    // The gtx endpoint returns an array structure: [[[translated_text, original_text, ...]]]
    // We need to extract the translated text from the first element
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }

    console.warn(`Unexpected translation response format for "${text.substring(0, 50)}..." to ${targetLang}`);
    return text; // Return original text if response format is unexpected
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Translation timeout for "${text.substring(0, 50)}..." to ${targetLang}`);
    } else {
      console.error(`Translation error for "${text.substring(0, 50)}..." to ${targetLang}:`, error.message);
    }
    return text; // Return original text on error
  }
}

/**
 * Translate tour fields (title, description, location) into Thai and Chinese
 * @param {Object} tourData - Tour data with English fields
 * @returns {Promise<Object>} - Tour data with all language fields
 */
async function translateTourFields(tourData) {
  const { title, description, location } = tourData;

  try {
    // Translate all fields to both Thai and Chinese in parallel (6 requests total)
    const [title_th, description_th, location_th, title_zh, description_zh, location_zh] = await Promise.all([
      translateText(title, 'th'),
      translateText(description, 'th'),
      translateText(location, 'th'),
      translateText(title, 'zh'),
      translateText(description, 'zh'),
      translateText(location, 'zh')
    ]);

    return {
      ...tourData,
      // English fields
      title_en: title,
      description_en: description,
      location_en: location,
      // Thai fields
      title_th,
      description_th,
      location_th,
      // Chinese fields
      title_zh,
      description_zh,
      location_zh
    };
  } catch (error) {
    console.error('Error translating tour fields:', error);
    // Return original data with English fields set if translation fails
    return {
      ...tourData,
      title_en: title,
      description_en: description,
      location_en: location,
      title_th: title,
      description_th: description,
      location_th: location,
      title_zh: title,
      description_zh: description,
      location_zh: location
    };
  }
}

/**
 * Translate announcement message into Thai and Chinese
 * @param {string} message - Announcement message in English
 * @returns {Promise<Object>} - Object with message in all languages
 */
async function translateAnnouncementMessage(message) {
  try {
    // Translate to Thai and Chinese in parallel
    const [message_th, message_zh] = await Promise.all([
      translateText(message, 'th'),
      translateText(message, 'zh')
    ]);

    return {
      message_en: message,
      message_th,
      message_zh
    };
  } catch (error) {
    console.error('Error translating announcement message:', error);
    // Return original message for all languages if translation fails
    return {
      message_en: message,
      message_th: message,
      message_zh: message
    };
  }
}

/**
 * Translate review comment into Thai and Chinese
 * @param {string} comment - Review comment in English
 * @returns {Promise<Object>} - Object with comment in all languages
 */
async function translateReviewComment(comment) {
  try {
    // Translate to Thai and Chinese in parallel
    const [comment_th, comment_zh] = await Promise.all([
      translateText(comment, 'th'),
      translateText(comment, 'zh')
    ]);

    return {
      comment_en: comment,
      comment_th,
      comment_zh
    };
  } catch (error) {
    console.error('Error translating review comment:', error);
    // Return original comment for all languages if translation fails
    return {
      comment_en: comment,
      comment_th: comment,
      comment_zh: comment
    };
  }
}

export {
  translateText,
  translateTourFields,
  translateAnnouncementMessage,
  translateReviewComment
};
