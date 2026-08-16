import {afterEach, describe, expect, it, vi} from "vitest";
import {ForqProducer} from "./producer";
import {ForqError} from "../api/errors";
import {ErrorCode} from "../api/responses";
import {NewMessageRequest} from "../api/requests";

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

describe("ForqProducer", () => {
    it("sendMessage posts the JSON body with auth header", async () => {
        const fetchMock = mockFetch(204);
        const producer = new ForqProducer(BASE, SECRET);
        const msg: NewMessageRequest = {content: "hello", processAfter: 1755366229123};

        await producer.sendMessage(msg, "orders");

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${BASE}/api/v1/queues/orders/messages`);
        expect(init.method).toBe("POST");
        expect(init.headers["X-API-Key"]).toBe(SECRET);
        expect(init.headers["Content-Type"]).toBe("application/json");
        expect(JSON.parse(init.body)).toEqual({content: "hello", processAfter: 1755366229123});
    });

    it("sendMessage throws ForqError on error responses", async () => {
        mockFetch(400, {code: ErrorCode.BAD_REQUEST_PRODUCE_TO_DLQ});
        const producer = new ForqProducer(BASE, SECRET);

        try {
            await producer.sendMessage({content: "x"}, "orders-dlq");
            expect.unreachable("should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(ForqError);
            const err = e as ForqError;
            expect(err.httpStatusCode).toBe(400);
            expect(err.errorResponse.code).toBe(ErrorCode.BAD_REQUEST_PRODUCE_TO_DLQ);
        }
    });
});
