/**
 * Module for utilities methods dedicated to manipulating strings.
 * @module src/utils/strings/index.js
 */
const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

module.exports = {
  capitalize,
  camelToSnake(text) {
    return text.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },
  snakeToCamel(text) {
    return text
      .split('_')
      .map((w, i) => {
        return i === 0 ? w : capitalize(w);
      })
      .join('');
  },
};
