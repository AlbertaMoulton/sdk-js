export type ClientOptions = {
  botToken: string;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export type TeamGagaApiResponse<T> = {
  status: boolean;
  code: number;
  message: string;
  data: T;
  request_id: string;
};

export type Message = {
  community_id?: string;
  channel_id: string;
  user_id: string;
  message_id: string;
  channel_type: number;
  attachments?: string | null;
  author?: unknown;
  content: string;
  created_at: string;
};

export type Event = {
  action: string;
  data: unknown;
  channel_id?: string | null;
  community_bots?: number[] | null;
  community_id?: string | null;
  created_at?: string | null;
  message_id?: string | null;
  user_id?: string | null;
};

export type PullMessagesResponse = {
  im: Message[];
  event: Event[];
};

export type SendMessageParams = {
  channelId: string;
  content: string;
  quoteId?: string;
  type?: number;
};

export type SendMessageResponse = {
  message_id: string;
};

export type PollMessagesOptions = {
  limit?: number;
  filter?: Array<"im" | "event">;
};

export type BotOptions = ClientOptions & {
  botId?: string;
};

export type StartOptions = {
  pollInterval?: number;
  signal?: AbortSignal;
};
