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
        const url = `${this.forqServerUrl}/api/v1/queues/${queueName}/messages`;

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

    async ack(queueName: string, messageId: string): Promise<void> {
        const url = `${this.forqServerUrl}/api/v1/queues/${queueName}/messages/${messageId}/ack`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': this.authSecret
            }
        });

        if (response.status === 204) {
            return;
        }
        const errorResponse = await response.json();
        throw new ForqError(response.status, errorResponse);
    }

    async nack(queueName: string, messageId: string): Promise<void> {
        const url = `${this.forqServerUrl}/api/v1/queues/${queueName}/messages/${messageId}/nack`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': this.authSecret
            }
        });

        if (response.status === 204) {
            return;
        }
        const errorResponse = await response.json();
        throw new ForqError(response.status, errorResponse);
    }
}