export type MiniAppMethod =
  | "getOauthCode"
  | "getUserId"
  | "getUserInfo"
  | "getSystemInfo"
  | "getCommunityId";

export type MiniAppBridge = {
  postMessage(message: string): void;
};

export type MiniAppSDKOptions = {
  bridgeName?: string;
};

export type MiniAppRequest = {
  callback: string;   // callback function unique id
  api: MiniAppMethod; // api name
  params?: Record<string, unknown>; // params of calling api
};

export type MiniAppNativeError = {
  code?: string;
  message?: string;
};

export type MiniAppUserInfo = Record<string, unknown>;
export type MiniAppSystemInfo = Record<string, unknown>;

type PendingRequest = {
  resolve(value: unknown): void;
  reject(reason: unknown): void;
};

export type MiniAppSDKError = Error & {
  code?: string;
};

export type MiniAppSDK = {
  readonly bridgeName: string;
  getOauthCode(): Promise<string>;
  getUserId(): Promise<string>;
  getUserInfo(): Promise<MiniAppUserInfo>;
  getSystemInfo(): Promise<MiniAppSystemInfo>;
  getCommunityId(): Promise<string>;
  resolve(id: string, value: unknown): void;
  reject(id: string, error: MiniAppNativeError | string): void;
};

const DEFAULT_BRIDGE_NAME = "tgg";
const REQUEST_ID_PREFIX = "teamgaga-miniapp";

const getRuntimeGlobal = (): Record<string, unknown> => {
  if (typeof globalThis !== "undefined") {
    return globalThis as Record<string, unknown>;
  }

  if (typeof self !== "undefined") {
    return self as unknown as Record<string, unknown>;
  }

  if (typeof window !== "undefined") {
    return window as unknown as Record<string, unknown>;
  }

  return {};
};

export const createMiniAppSDK = (options: MiniAppSDKOptions = {}): MiniAppSDK => {
  const bridgeName = options.bridgeName ?? DEFAULT_BRIDGE_NAME;
  const pendingRequests: Record<string, PendingRequest | undefined> = {};
  let pendingRequestCount = 0;

  const createRequestId = (): string => `${REQUEST_ID_PREFIX}-${pendingRequestCount + 1}`;

  const resolve = (id: string, value: unknown): void => {
    const pendingRequest = pendingRequests[id];
    if (!pendingRequest) {
      return;
    }

    delete pendingRequests[id];
    pendingRequestCount -= 1;
    pendingRequest.resolve(value);
  };

  const reject = (id: string, error: MiniAppNativeError | string): void => {
    const pendingRequest = pendingRequests[id];
    if (!pendingRequest) {
      return;
    }

    delete pendingRequests[id];
    pendingRequestCount -= 1;
    pendingRequest.reject(toMiniAppError(error));
  };

  const invoke = <T>(method: MiniAppMethod): Promise<T> => {
    const bridge = getRuntimeGlobal()[bridgeName] as MiniAppBridge | undefined;

    if (!bridge || typeof bridge.postMessage !== "function") {
      return Promise.reject(createMiniAppError("TeamGaga miniapp bridge is unavailable"));
    }

    const request: MiniAppRequest = {
      id: createRequestId(),
      method,
    };

    return new Promise<T>((resolve, reject) => {
      pendingRequests[request.id] = {
        resolve: resolve as (value: unknown) => void,
        reject,
      };
      pendingRequestCount += 1;

      try {
        bridge.postMessage(JSON.stringify(request));
      } catch (error) {
        delete pendingRequests[request.id];
        pendingRequestCount -= 1;
        reject(error);
      }
    });
  };

  return {
    bridgeName,
    getOauthCode: () => invoke<string>("getOauthCode"),
    getUserId: () => invoke<string>("getUserId"),
    getUserInfo: () => invoke<MiniAppUserInfo>("getUserInfo"),
    getSystemInfo: () => invoke<MiniAppSystemInfo>("getSystemInfo"),
    getCommunityId: () => invoke<string>("getCommunityId"),
    resolve,
    reject,
  };
};

const createMiniAppError = (message: string, code?: string): MiniAppSDKError => {
  const error = new Error(message) as MiniAppSDKError;
  error.name = "MiniAppSDKError";
  error.code = code;
  return error;
};

const toMiniAppError = (error: MiniAppNativeError | string): MiniAppSDKError => {
  if (typeof error === "string") {
    return createMiniAppError(error);
  }

  return createMiniAppError(error.message ?? "TeamGaga miniapp bridge request failed", error.code);
};

export const TeamGagaMiniApp = createMiniAppSDK();

getRuntimeGlobal().TeamGagaMiniApp = TeamGagaMiniApp;

export const getOauthCode = (): Promise<string> => TeamGagaMiniApp.getOauthCode();

export const getUserId = (): Promise<string> => TeamGagaMiniApp.getUserId();

export const getUserInfo = (): Promise<MiniAppUserInfo> => TeamGagaMiniApp.getUserInfo();

export const getSystemInfo = (): Promise<MiniAppSystemInfo> => TeamGagaMiniApp.getSystemInfo();

export const getCommunityId = (): Promise<string> => TeamGagaMiniApp.getCommunityId();
