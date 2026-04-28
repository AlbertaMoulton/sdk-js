import { REQUEST_ID_PREFIX } from "./constants";
import { createMiniAppError, toMiniAppError } from "./errors";
import { getRuntimeGlobal } from "./runtime";
import type { MiniAppBridge, MiniAppMethod, MiniAppNativeError, MiniAppRequest } from "./types";

type PendingRequest = {
  resolve(value: unknown): void;
  reject(reason: unknown): void;
};

export type MiniAppBridgeClient = {
  invoke<T>(method: MiniAppMethod): Promise<T>;
  resolve(id: string, value: unknown): void;
  reject(id: string, error: MiniAppNativeError | string): void;
};

export const createBridgeClient = (bridgeName: string): MiniAppBridgeClient => {
  const pendingRequests: Record<string, PendingRequest | undefined> = {};
  let requestSequence = 0;

  const createCallbackId = (): string => {
    requestSequence += 1;
    return `${REQUEST_ID_PREFIX}${requestSequence}`;
  };

  const getBridge = (): MiniAppBridge | undefined => {
    const bridge = getRuntimeGlobal()[bridgeName] as MiniAppBridge | undefined;

    if (!bridge || typeof bridge.postMessage !== "function") {
      return undefined;
    }

    return bridge;
  };

  const resolve = (id: string, value: unknown): void => {
    const pendingRequest = pendingRequests[id];
    if (!pendingRequest) {
      return;
    }

    delete pendingRequests[id];
    pendingRequest.resolve(value);
  };

  const reject = (id: string, error: MiniAppNativeError | string): void => {
    const pendingRequest = pendingRequests[id];
    if (!pendingRequest) {
      return;
    }

    delete pendingRequests[id];
    pendingRequest.reject(toMiniAppError(error));
  };

  const invoke = <T>(method: MiniAppMethod): Promise<T> => {
    const bridge = getBridge();

    if (!bridge) {
      return Promise.reject(createMiniAppError("TeamGaga miniapp bridge is unavailable"));
    }

    const request: MiniAppRequest = {
      callback: createCallbackId(),
      api: method,
    };

    return new Promise<T>((resolve, reject) => {
      pendingRequests[request.callback] = {
        resolve: resolve as (value: unknown) => void,
        reject,
      };

      try {
        bridge.postMessage(JSON.stringify(request));
      } catch (error) {
        delete pendingRequests[request.callback];
        reject(error);
      }
    });
  };

  return {
    invoke,
    resolve,
    reject,
  };
};
