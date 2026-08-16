import {afterEach, describe, expect, it, vi} from "vitest";
import {ForqConsumer} from "./consumer";
import {ForqError} from "../api/errors";
import {ErrorCode, MessageResponse} from "../api/responses";

const SECRET = "test-secret-that-is-32-chars-long";
const BASE = "https://forq.example.com";

function mockFetch(status: number, body?: unknown) {
    const mock = vi.fn().mockResolvedValue({
        status,
        json: async () => body,
    });
    vi.stubGlobal("fetch", mock);
    return mock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("ForqConsumer", () => {
    it("consumeOne parses a message including the receipt", async () => {
        const fetchMock = mockFetch(200, {id: "msg-1", content: "hello", receipt: "1755366229123"});
        const consumer = new ForqConsumer(BASE, SECRET);

        const msg = await consumer.consumeOne("orders");

        expect(msg).toEqual({id: "msg-1", content: "hello", receipt: "1755366229123"});
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${BASE}/api/v1/queues/orders/messages`);
        expect(init.method).toBe("GET");
        expect(init.headers["X-API-Key"]).toBe(SECRET);
    });

    it("consumeOne returns null on 204", async () => {
        mockFetch(204);
        const consumer = new ForqConsumer(BASE, SECRET);

        expect(await consumer.consumeOne("orders")).toBeNull();
    });

    it("consumeOne throws ForqError with status and code on error", async () => {
        mockFetch(401, {code: ErrorCode.UNAUTHORIZED});
        const consumer = new ForqConsumer(BASE, SECRET);

        try {
            await consumer.consumeOne("orders");
            expect.unreachable("should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(ForqError);
            const err = e as ForqError;
            expect(err.httpStatusCode).toBe(401);
            expect(err.errorResponse.code).toBe(ErrorCode.UNAUTHORIZED);
        }
    });

    it("ack posts to the ack endpoint with the receipt header", async () => {
        const fetchMock = mockFetch(204);
        const consumer = new ForqConsumer(BASE, SECRET);
        const msg: MessageResponse = {id: "msg-1", content: "x", receipt: "1755366229123"};

        await consumer.ack("orders", msg);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${BASE}/api/v1/queues/orders/messages/msg-1/ack`);
        expect(init.method).toBe("POST");
        expect(init.headers["X-Forq-Receipt"]).toBe("1755366229123");
        expect(init.headers["X-API-Key"]).toBe(SECRET);
    });

    it("nack posts to the nack endpoint with the receipt header", async () => {
        const fetchMock = mockFetch(204);
        const consumer = new ForqConsumer(BASE, SECRET);
        const msg: MessageResponse = {id: "msg-1", content: "x", receipt: "1755366229123"};

        await consumer.nack("orders", msg);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${BASE}/api/v1/queues/orders/messages/msg-1/nack`);
        expect(init.headers["X-Forq-Receipt"]).toBe("1755366229123");
    });

    it("ack with a stale receipt surfaces not_found.message", async () => {
        mockFetch(404, {code: ErrorCode.NOT_FOUND_MESSAGE});
        const consumer = new ForqConsumer(BASE, SECRET);
        const msg: MessageResponse = {id: "msg-1", content: "x", receipt: "stale"};

        await expect(consumer.ack("orders", msg)).rejects.toMatchObject({
            httpStatusCode: 404,
            errorResponse: {code: ErrorCode.NOT_FOUND_MESSAGE},
        });
    });

    it("trims a trailing slash from the server URL", async () => {
        const fetchMock = mockFetch(204);
        const consumer = new ForqConsumer(BASE + "/", SECRET);

        await consumer.consumeOne("orders");

        expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/api/v1/queues/orders/messages`);
    });
});
