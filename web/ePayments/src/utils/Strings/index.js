const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const utils = {
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

export default utils;
