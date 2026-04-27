import { expect, mock, test } from "bun:test";
import { Bot } from "../src/bot";

test("Bot turns incoming messages into message contexts", async () => {
  const abort = new AbortController();
  const fetchMock = mock(async (url: URL, init: RequestInit) => {
    if (init.method === "GET") {
      abort.abort();
      return Response.json({
        status: true,
        code: 1000,
        message: "Ok",
        data: {
          im: [
            {
              channel_id: "channel-1",
              user_id: "user-1",
              message_id: "message-1",
              channel_type: 0,
              content: "roll",
              created_at: "2026-04-27T00:00:00Z",
            },
          ],
          event: [],
        },
        request_id: "request-id",
      });
    }

    return Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { message_id: "reply-1" },
      request_id: "request-id",
    });
  });

  const bot = new Bot({
    botToken: "token",
    fetch: fetchMock as unknown as typeof fetch,
  });

  bot.on("message", async (ctx) => {
    if (ctx.text === "roll") {
      await ctx.reply("You rolled 4.");
    }
  });

  await bot.start({ pollInterval: 1, signal: abort.signal });

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(
    JSON.stringify({
      channel_id: "channel-1",
      content: "You rolled 4.",
      quote_id: "message-1",
      type: 0,
    }),
  );
});
