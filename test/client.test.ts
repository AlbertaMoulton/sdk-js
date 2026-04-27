import { expect, mock, test } from "bun:test";
import { TeamGagaClient } from "../src/client";

test("pollMessages calls TeamGaga and returns response data", async () => {
  const fetchMock = mock(async () => {
    return Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { im: [], event: [] },
      request_id: "request-id",
    });
  });

  const client = new TeamGagaClient({
    botToken: "token",
    fetch: fetchMock as unknown as typeof fetch,
  });

  const messages = await client.pollMessages({ limit: 10, filter: ["im"] });

  expect(messages).toEqual({ im: [], event: [] });
  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v1/messages?limit=10&filter=im"),
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({ Authorization: "Bot token" }),
    }),
  );
});

test("sendMessage posts a text message", async () => {
  const fetchMock = mock(async () => {
    return Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { message_id: "message-1" },
      request_id: "request-id",
    });
  });

  const client = new TeamGagaClient({
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
