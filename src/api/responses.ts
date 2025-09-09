export type MessageResponse = {
    id: string;
    content: string;
}

export type ErrorResponse = {
    code: ErrorCode;
}

export enum ErrorCode {
    BAD_REQUEST_CONTENT_EXCEEDS_LIMIT = "bad_request.body.content.exceeds_limit",
    BAD_REQUEST_PROCESS_AFTER_IN_PAST = "bad_request.body.processAfter.in_past",
    BAD_REQUEST_PROCESS_AFTER_TOO_FAR = "bad_request.body.processAfter.too_far",
    BAD_REQUEST_INVALID_BODY = "bad_request.body.invalid",
    BAD_REQUEST_DLQ_ONLY_OP = "bad_request.dlq_only_operation",
    UNAUTHORIZED = "unauthorized",
    NOT_FOUND_MESSAGE = "not_found.message",
    INTERNAL = "internal"
}