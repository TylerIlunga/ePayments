// TODO: JSDOC Module Header
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
      .map((w) => capitalize(w))
      .join('');
  },
};
