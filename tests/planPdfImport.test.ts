jest.mock("expo-file-system", () => ({
  File: class MockFile {
    constructor(private readonly uri: string) {}
    async base64() {
      return `native:${this.uri}`;
    }
  },
}));

jest.mock("react-native", () => ({
  Platform: { OS: "test" },
}));

import {
  arrayBufferToBase64,
  getImportPlanEndpoint,
  readPdfBase64FromUri,
} from "@/services/planPdfImport";

describe("plan PDF import service", () => {
  it("uses the local Expo API route when no hosted base URL is configured", () => {
    expect(getImportPlanEndpoint(undefined)).toBe("/api/import-plan");
    expect(getImportPlanEndpoint("   ")).toBe("/api/import-plan");
  });

  it("builds a hosted API route for native deployments", () => {
    expect(getImportPlanEndpoint("https://shapeiq.example.com/")).toBe(
      "https://shapeiq.example.com/api/import-plan",
    );
  });

  it("encodes ArrayBuffer payloads as base64", () => {
    const payload = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer;
    expect(arrayBufferToBase64(payload)).toBe("JVBERg==");
  });

  it("reads picked PDFs through fetch on web", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer,
    } as Response) as typeof fetch;

    try {
      await expect(readPdfBase64FromUri("blob:pdf", "web")).resolves.toBe("JVBERg==");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("reads picked PDFs through expo-file-system off web", async () => {
    await expect(readPdfBase64FromUri("file:///tmp/plan.pdf", "ios")).resolves.toBe(
      "native:file:///tmp/plan.pdf",
    );
  });
});
