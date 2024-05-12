export class FilterError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, FilterError);
    }
}

export class DataAddError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, DataAddError);
    }
}

export class ResultTooLargeError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, ResultTooLargeError);
    }
}