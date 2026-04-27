import type {
  PollMessagesOptions,
  PullMessagesResponse,
  SendMessageParams,
  SendMessageResponse,
  TeamGagaApiResponse,
  TeamGagaClientOptions,
} from "./types";

const DEFAULT_BASE_URL = "https://open.teamgaga.com";

export class TeamGagaClient {
  private readonly botToken: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: TeamGagaClientOptions) {
    this.botToken = options.botToken;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetch ?? fetch;
  }

  async pollMessages(
    options: PollMessagesOptions = {},
  ): Promise<PullMessagesResponse> {
    const url = new URL("/bot/v1/messages", this.baseUrl);

    if (options.limit !== undefined) {
      url.searchParams.set("limit", String(options.limit));
    }

    for (const filter of options.filter ?? []) {
      url.searchParams.append("filter", filter);
    }

    const result = await this.request<PullMessagesResponse>(url, {
      method: "GET",
    });

    return result;
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>("/bot/v1/messages", {
      method: "POST",
      body: JSON.stringify({
        channel_id: params.channelId,
        content: params.content,
        quote_id: params.quoteId,
        type: params.type ?? 0,
      }),
    });
  }

  private async request<T>(
    pathOrUrl: string | URL,
    init: RequestInit,
  ): Promise<T> {
    const url =
      pathOrUrl instanceof URL ? pathOrUrl : new URL(pathOrUrl, this.baseUrl);

    const response = await this.fetchImpl(url, {
      ...init,
      headers: {
        Authorization: `Bot ${this.botToken}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`TeamGaga API error: ${response.status}`);
    }

    const result = (await response.json()) as TeamGagaApiResponse<T>;

    if (!result.status) {
      throw new Error(`TeamGaga API error ${result.code}: ${result.message}`);
    }

    return result.data;
  }
}
