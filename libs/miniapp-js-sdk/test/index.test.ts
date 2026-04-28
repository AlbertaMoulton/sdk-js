import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  TeamGagaMiniApp,
  createMiniAppSDK,
  getCommunityId,
  getOauthCode,
  getSystemInfo,
  getUserId,
  getUserInfo,
} from "../src/index";

type TestGlobal = typeof globalThis & Record<string, unknown>;

const testGlobal = globalThis as TestGlobal;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  delete testGlobal.tgg;
});

test("calls the Flutter WebView bridge with request id and method name", async () => {
  const messages: unknown[] = [];
  testGlobal.tgg = {
    postMessage(message: string) {
      messages.push(JSON.parse(message));
    },
  };

  const promise = getUserId();

  expect(messages).toEqual([
    {
      id: "teamgaga-miniapp-1",
      method: "getUserId",
    },
  ]);

  TeamGagaMiniApp.resolve("teamgaga-miniapp-1", "user-123");

  await expect(promise).resolves.toBe("user-123");
});

test("exposes all known miniapp API methods", () => {
  expect(getOauthCode).toEqual(expect.any(Function));
  expect(getUserId).toEqual(expect.any(Function));
  expect(getUserInfo).toEqual(expect.any(Function));
  expect(getSystemInfo).toEqual(expect.any(Function));
  expect(getCommunityId).toEqual(expect.any(Function));
});

test("rejects pending calls when native side reports an error", async () => {
  testGlobal.tgg = {
    postMessage() {},
  };

  const promise = getOauthCode();

  TeamGagaMiniApp.reject("teamgaga-miniapp-1", {
    message: "OAuth is unavailable",
    code: "OAUTH_UNAVAILABLE",
  });

  await expect(promise).rejects.toMatchObject({
    message: "OAuth is unavailable",
    code: "OAUTH_UNAVAILABLE",
  });
});

test("rejects when bridge is unavailable", async () => {
  await expect(getCommunityId()).rejects.toThrow("TeamGaga miniapp bridge is unavailable");
});

test("allows custom bridge names for host integration tests", async () => {
  const messages: unknown[] = [];
  testGlobal.CustomMiniAppBridge = {
    postMessage(message: string) {
      messages.push(JSON.parse(message));
    },
  };

  const sdk = createMiniAppSDK({ bridgeName: "CustomMiniAppBridge" });
  const promise = sdk.getSystemInfo();

  expect(messages).toEqual([
    {
      id: "teamgaga-miniapp-1",
      method: "getSystemInfo",
    },
  ]);

  sdk.resolve("teamgaga-miniapp-1", {
    platform: "ios",
    appVersion: "1.0.0",
  });

  await expect(promise).resolves.toEqual({
    platform: "ios",
    appVersion: "1.0.0",
  });

  delete testGlobal.CustomMiniAppBridge;
});
