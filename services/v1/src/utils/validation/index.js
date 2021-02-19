const Errors = require('../errors');

const extractErrorMessage = (errorObject) => {
  const { details } = errorObject;
  if (
    details.length === 0 ||
    details[0].message === undefined ||
    details[0].message === null
  ) {
    return null;
  }
  // NOTE: Escape characters included in message;
  return details[0].message;
};

module.exports = {
  validateRequestBody(joiSchema, requestBody) {
    const validationResult = joiSchema.validate(requestBody);
    if (!validationResult.error) {
      return validationResult;
    }
    Errors.General.logError(validationResult.error);
    let error = extractErrorMessage(validationResult.error);
    if (error == null) {
      error = Errors.Network.invalidRequest();
    }
    return { error };
  },
};
