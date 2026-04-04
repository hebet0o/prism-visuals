// Utility functions for the application

/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - The text to convert
 * @returns {string} - The slugified version
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}