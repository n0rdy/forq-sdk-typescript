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
    processAfter: Date.now() + 3_600_000, // optional: deliver in 1 hour; omit for immediate delivery
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
        // message.receipt is the opaque delivery receipt - the SDK sends it on ack/nack for you
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
    await consumer.ack('my-queue', message);
    console.log(`Message ${message.id} acknowledged successfully`);
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
    await consumer.nack('my-queue', message);
    console.log(`Message ${message.id} nacked successfully`);
} catch (error) {
    if (error instanceof ForqError) {
        console.error(`ForqError during nack: Status ${error.httpStatusCode} and error response ${error.errorResponse}`, error);
    } else {
        console.error('Unexpected error during nack:', error);
    }
    throw error;
}
```

`ack` and `nack` take the whole `MessageResponse` (not just the ID) because the server requires the delivery
receipt from the consume response - the SDK sends it for you via the `X-Forq-Receipt` header. It fences the
ack/nack to that exact delivery, so a late ack/nack from a consumer that exceeded the max processing time
cannot affect a redelivery owned by another consumer.
