import type {MessageResponse} from "../api/responses";
import {ForqError} from "../api/errors";

export class ForqConsumer {
    constructor(
        private readonly forqServerUrl: string,
        private readonly authSecret: string
    ) {
        this.forqServerUrl = forqServerUrl.replace(/\/$/, '');
    }

    async consumeOne(queueName: string): Promise<MessageResponse | null> {
        const url = `${this.forqServerUrl}/api/v1/queues/${encodeURIComponent(queueName)}/messages`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': this.authSecret
            }
        });

        if (response.status === 204) {
            // no message available
            return null;
        }
        if (response.status === 200) {
            return await response.json() as MessageResponse;
        }
        const errorResponse = await response.json();
        throw new ForqError(response.status, errorResponse);
    }

    /**
     * Acknowledges the given message as successfully processed. The message's
     * receipt fences the ack to this exact delivery: if the message exceeded
     * the visibility timeout and was redelivered to another consumer, the ack
     * fails with a not_found.message error instead of affecting the other
     * delivery.
     */
    async ack(queueName: string, message: MessageResponse): Promise<void> {
        validateMessage(message);
        const url = `${this.forqServerUrl}/api/v1/queues/${encodeURIComponent(queueName)}/messages/${encodeURIComponent(message.id)}/ack`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': this.authSecret,
                'X-Forq-Receipt': message.receipt
            }
        });

        if (response.status === 204) {
            return;
        }
        const errorResponse = await response.json();
        throw new ForqError(response.status, errorResponse);
    }

    /**
     * Reports the given message as failed to process, scheduling a retry (or
     * a DLQ move once attempts are exhausted). Like ack, it is fenced to this
     * exact delivery via the message's receipt.
     */
    async nack(queueName: string, message: MessageResponse): Promise<void> {
        validateMessage(message);
        const url = `${this.forqServerUrl}/api/v1/queues/${encodeURIComponent(queueName)}/messages/${encodeURIComponent(message.id)}/nack`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': this.authSecret,
                'X-Forq-Receipt': message.receipt
            }
        });

        if (response.status === 204) {
            return;
        }
        const errorResponse = await response.json();
        throw new ForqError(response.status, errorResponse);
    }
}
// fail fast with a clear error instead of sending the literal string
// "undefined" as an id or receipt (possible for callers outside TypeScript's
// type checking)
function validateMessage(message: MessageResponse): void {
    if (!message?.id || !message?.receipt) {
        throw new Error('message must carry id and receipt - pass the message returned by consumeOne');
    }
}
