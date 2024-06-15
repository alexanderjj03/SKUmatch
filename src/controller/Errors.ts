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

export class DataPersistError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, DataPersistError);
    }
}

export class ResultTooLargeError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, ResultTooLargeError);
    }
}

export class NoResultsError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, NoResultsError);
    }
}

export class DatabaseError extends Error {
    constructor(message?: string) {
        super(message);
        Error.captureStackTrace(this, DatabaseError);
    }
}