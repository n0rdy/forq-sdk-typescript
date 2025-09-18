import type {NewMessageRequest} from "../api/requests";
import {ForqError} from "../api/errors";

export class ForqProducer {
    constructor(
        private readonly forqServerUrl: string,
        private readonly authSecret: string
    ) {
        this.forqServerUrl = forqServerUrl.replace(/\/$/, '');
    }

    async sendMessage(newMessage: NewMessageRequest, queueName: string): Promise<void> {
        const url = `${this.forqServerUrl}/api/v1/queues/${queueName}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': this.authSecret
            },
            body: JSON.stringify(newMessage)
        });

        if (response.status === 204) {
            return;
        }
        const errorResponse = await response.json();
        throw new ForqError(response.status, errorResponse);
    }
}