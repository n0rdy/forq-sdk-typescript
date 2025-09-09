import type {ErrorResponse} from "./responses";

export class ForqError extends Error {
    public readonly httpStatusCode: number;
    public readonly errorResponse: ErrorResponse;

    constructor(httpStatusCode: number, errorResponse: ErrorResponse) {
        super(`Forq API error: ${errorResponse.code} (HTTP ${httpStatusCode})`);
        this.name = 'ForqError';
        this.httpStatusCode = httpStatusCode;
        this.errorResponse = errorResponse;
    }
}
