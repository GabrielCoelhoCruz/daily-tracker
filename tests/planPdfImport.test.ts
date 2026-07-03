jest.mock("expo-file-system", () => ({
  File: class MockFile {},
}));

import { getImportPlanEndpoint } from "@/services/planPdfImport";

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
});
