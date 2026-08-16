export type MessageResponse = {
    id: string;
    content: string;
    /**
     * Identifies this particular delivery of the message and is required by
     * the Forq server on ack/nack. Opaque - do not parse it.
     */
    receipt: string;
}

export type ErrorResponse = {
    code: ErrorCode;
}

export enum ErrorCode {
    BAD_REQUEST_CONTENT_EXCEEDS_LIMIT = "bad_request.body.content.exceeds_limit",
    BAD_REQUEST_PROCESS_AFTER_IN_PAST = "bad_request.body.processAfter.in_past",
    BAD_REQUEST_PROCESS_AFTER_TOO_FAR = "bad_request.body.processAfter.too_far",
    BAD_REQUEST_INVALID_BODY = "bad_request.body.invalid",
    BAD_REQUEST_INVALID_QUEUE_NAME = "bad_request.queue.invalid_name",
    BAD_REQUEST_INVALID_MESSAGE_ID = "bad_request.messageId.invalid",
    BAD_REQUEST_PRODUCE_TO_DLQ = "bad_request.queue.produce_to_dlq",
    BAD_REQUEST_DLQ_ONLY_OP = "bad_request.dlq_only_operation",
    BAD_REQUEST_RECEIPT_MISSING = "bad_request.receipt.missing",
    BAD_REQUEST_RECEIPT_INVALID = "bad_request.receipt.invalid",
    UNAUTHORIZED = "unauthorized",
    TOO_MANY_REQUESTS = "too_many_requests",
    NOT_FOUND_MESSAGE = "not_found.message",
    INTERNAL = "internal"
}