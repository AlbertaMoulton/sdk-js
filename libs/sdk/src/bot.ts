import { Client } from "./client";
import type { BotOptions, Message, StartOptions } from "./types";

export type MessageContext = {
  message: Message;
  text: string;
  reply: (content: string) => Promise<void>;
};

type MessageHandler = (ctx: MessageContext) => Promise<void> | void;

export class Bot {
  readonly client: Client;
  private readonly handlers: MessageHandler[] = [];

  constructor(options: BotOptions | string) {
    this.client = new Client(
      typeof options === "string" ? { botToken: options } : options,
    );
  }

  on(event: "message", handler: MessageHandler): this {
    this.handlers.push(handler);
    return this;
  }

  async start(options: StartOptions = {}): Promise<void> {
    const pollInterval = options.pollInterval ?? 3000;

    while (!options.signal?.aborted) {
      try {
        const messages = await this.client.pollMessages();

        for (const message of messages.im) {
          await this.handleMessage(message);
        }
      } catch (error) {
        console.error("Bot polling error:", error);
      }

      await sleep(pollInterval, options.signal);
    }
  }

  private async handleMessage(message: Message): Promise<void> {
    const ctx: MessageContext = {
      message,
      text: message.content,
      reply: async (content) => {
        await this.client.sendMessage({
          channelId: message.channel_id,
          content,
          quoteId: message.message_id,
        });
      },
    };

    for (const handler of this.handlers) {
      await handler(ctx);
    }
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
