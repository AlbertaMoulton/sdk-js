import { expect, test, vi } from "vitest";
import { Client } from "../src/client";

test("pollMessages calls TeamGaga and returns response data", async () => {
  const fetchMock = vi.fn(
    async (_input: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) => {
      return Response.json({
        status: true,
        code: 1000,
        message: "Ok",
        data: { im: [], event: [] },
        request_id: "request-id",
      });
    },
  );

  const client = new Client({
    botToken: "token",
    fetch: fetchMock as unknown as typeof fetch,
  });

  const messages = await client.pollMessages({ limit: 10, filter: ["im"] });
  const [, init] = fetchMock.mock.calls[0] as Parameters<typeof fetch>;
  const headers = init?.headers;

  expect(messages).toEqual({ im: [], event: [] });
  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v1/messages?limit=10&filter%5B%5D=im"),
    expect.objectContaining({
      method: "GET",
    }),
  );
  expect(headers).toBeInstanceOf(Headers);
  expect((headers as Headers).get("Authorization")).toBe("Bot token");
});

test("sendMessage posts a text message", async () => {
  const fetchMock = vi.fn(
    async (_input: Parameters<typeof fetch>[0], _init?: Parameters<typeof fetch>[1]) => {
      return Response.json({
        status: true,
        code: 1000,
        message: "Ok",
        data: { message_id: "message-1" },
        request_id: "request-id",
      });
    },
  );

  const client = new Client({
    botToken: "token",
    fetch: fetchMock as unknown as typeof fetch,
  });

  const result = await client.sendMessage({
    channelId: "channel-1",
    content: "hello",
    quoteId: "message-0",
  });

  expect(result.message_id).toBe("message-1");
  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v1/messages"),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        channel_id: "channel-1",
        content: "hello",
        quote_id: "message-0",
        type: 0,
      }),
    }),
  );
});
