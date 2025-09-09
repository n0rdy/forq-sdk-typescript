export type NewMessageRequest = {
    content: string;
    processAfter?: number; // timestamp in milliseconds
}