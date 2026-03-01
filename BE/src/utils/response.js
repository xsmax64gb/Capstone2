const ERROR_DEFINITIONS = {
  ER_DUP_ENTRY: {
    code: "ER_DUP_ENTRY",
    message: "Duplicate entry detected. The provided data already exists.",
  },
  AUTH_ERROR: {
    code: "AUTH_ERROR",
    message: "Authentication required. Please log in.",
  },
  TOKEN_EXPIRED: {
    code: "TOKEN_EXPIRED",
    message: "Your access token has expired. Please log in again.",
  },
  REFRESH_TOKEN_EXPIRED: {
    code: "REFRESH_TOKEN_EXPIRED",
    message: "Your refresh token has expired. Please log in again.",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "You do not have permission to access this resource.",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "The requested resource could not be found.",
  },
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "Something went wrong on our end.",
  },
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    message: "Invalid request. Some required parameters are missing or incorrect",
  },
};

/**
 * @typedef {keyof typeof ERROR_DEFINITIONS} ErrorKeys
 */

/** @type {Record<ErrorKeys, ErrorKeys>} */
const ERROR_TYPE = Object.freeze(Object.fromEntries(Object.keys(ERROR_DEFINITIONS).map((key) => [key, key])));

const createResponse = (res, statusCode, message, options = {}) => {
  const { data, errorType, errors } = options;

  const errorDefinition = errorType ? ERROR_DEFINITIONS[errorType] : null;
  const finalMessage = message || errorDefinition?.message || "An unknown error occurred.";
  const finalErrorType = errorDefinition?.code || errorType;

  const response = {
    status: statusCode < 400 ? "success" : "error",
    code: statusCode,
    message: finalMessage,
    ...(data && { data }),
    ...(finalErrorType && { errorType: finalErrorType }),
    ...(errors?.length && { errors }),
  };

  return res.status(statusCode).json(response);
};

const responseHandler = {
  success: (res, message = "Your request was processed successfully.", data) =>
    createResponse(res, 200, message, { data }),

  created: (res, message = "Your request was successful. The resource has been created.", data) =>
    createResponse(res, 201, message, { data }),

  badRequest: (res, message, errors = [], errorType = ERROR_TYPE.BAD_REQUEST) =>
    createResponse(res, 400, message, { errors, errorType }),

  unauthorized: (res, message, errorType = ERROR_TYPE.AUTH_ERROR) => createResponse(res, 401, message, { errorType }),

  forbidden: (res, message, errorType = ERROR_TYPE.FORBIDDEN) => createResponse(res, 403, message, { errorType }),

  notFound: (res, message, errorType = ERROR_TYPE.NOT_FOUND) => createResponse(res, 404, message, { errorType }),

  internalServerError: (res, message, errorType = ERROR_TYPE.SERVER_ERROR) =>
    createResponse(res, 500, message, { errorType }),
};

export default responseHandler;
export { ERROR_TYPE, ERROR_DEFINITIONS };