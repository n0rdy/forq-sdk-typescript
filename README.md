# TypeScript SDK for Forq - Simple Message Queue powered by SQLite

Check out the [Forq project](https://forq.sh) for more information about the server itself.

## TypeScript SDK

The TypeScript SDK code is available at [GitHub](https://github.com/n0rdy/forq-sdk-typescript)

It is available in the [NPM registry](https://www.npmjs.com/package/@forq/sdk)

```bash
npm install @forq/sdk
```

### Producer

You can create a new producer by providing Forq server URL and auth secret:

```typescript
const producer = new ForqProducer(
    'https://your-forq-server.com',
    'your-auth-secret-min-32-chars-long'
);
```

You can then use the producer to send messages:

```typescript
const queueName = 'my-queue';
const newMessage: NewMessageRequest = {
    content: 'I am going on an adventure!',
    processAfter: 1757875397418,
};

async function sendMessageWithErrorHandling() {
    try {
        await producer.sendMessage(newMessage, 'my-queue');
    } catch (error) {
        if (error instanceof ForqError) {
            console.error(`ForqError: Status ${error.httpStatusCode} and error response ${error.errorResponse}`, error);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}
```

Or use `.then(...).catch(...)` if you prefer promises.

### Consumer

You can create a new consumer by providing Forq server URL and auth secret:

```typescript
const consumer = new ForqConsumer(
    'https://your-forq-server.com',
    'your-auth-secret-min-32-chars-long'
);
```

You can then use the consumer to fetch messages:

```typescript
try {
    const message: MessageResponse | null = await consumer.consumeOne('my-queue');

    if (message) {
        console.log('Message received:', message);
        console.log('Message ID:', message.id);
        console.log('Message content:', message.content);
        return message;
    } else {
        console.log('No messages available in queue');
        return null;
    }
} catch (error) {
    if (error instanceof ForqError) {
        console.error(`ForqError during consume: Status ${error.httpStatusCode} and error response ${error.errorResponse}`, error);
    } else {
        console.error('Unexpected error during consume:', error);
    }
    throw error;
}
```

Then you'll process the message.
If processing is successful, you have to acknowledge the message, otherwise it will be re-delivered after the max processing time.

```typescript
try {
    await consumer.ack('my-queue', messageId);
    console.log(`Message ${messageId} acknowledged successfully`);
} catch (error) {
    if (error instanceof ForqError) {
        console.error(`ForqError during ack: Status ${error.httpStatusCode} and error response ${error.errorResponse}`, error);
    } else {
        console.error('Unexpected error during ack:', error);
    }
    throw error;
}
```

If processing failed, you have to nack the message:

```typescript
try {
    await consumer.nack('my-queue', messageId);
    console.log(`Message ${messageId} nacked successfully`);
} catch (error) {
    if (error instanceof ForqError) {
        console.error(`ForqError during nack: Status ${error.httpStatusCode} and error response ${error.errorResponse}`, error);
    } else {
        console.error('Unexpected error during nack:', error);
    }
    throw error;
}
```
