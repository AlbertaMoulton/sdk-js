# TeamGaga SDK for JavaScript

JavaScript and TypeScript SDK for the TeamGaga Open Platform.

## Install

```bash
bun add @teamgaga/sdk
```

## Bot Example

```ts
import { Bot } from "@teamgaga/sdk";

const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

bot.on("message", async (ctx) => {
  if (ctx.text !== "roll") return;

  const point = Math.floor(Math.random() * 6) + 1;
  await ctx.reply(`You rolled ${point}.`);
});

bot.start({ pollInterval: 3000 });
```

TeamGaga bots currently receive messages by polling. Keep `pollInterval` at `3000` milliseconds or higher unless you have a good reason to change it.

## API Client Example

```ts
import { TeamGagaClient } from "@teamgaga/sdk";

const client = new TeamGagaClient({
  botToken: process.env.TEAMGAGA_BOT_TOKEN!,
});

const messages = await client.pollMessages();

await client.sendMessage({
  channelId: messages.im[0].channel_id,
  content: "Hello from TeamGaga SDK.",
  quoteId: messages.im[0].message_id,
});
```
