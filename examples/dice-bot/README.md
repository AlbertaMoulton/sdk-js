# TeamGaga Dice Bot Example

A tiny TeamGaga bot example built with `@teamgaga/sdk`.

## Setup

```bash
vp install
cp examples/dice-bot/.env.sample examples/dice-bot/.env
```

Fill in `.env`:

```text
TEAMGAGA_BOT_ID=<YOUR_BOT_ID>
TEAMGAGA_BOT_TOKEN=<YOUR_BOT_TOKEN>
POLL_INTERVAL_MS=3000
```

## Run

```bash
vp run dice-bot#start
```

## Chat Command

```text
@{!YOUR_BOT_ID} roll
```

Example reply:

```text
You rolled 4.
```
