import { describe, expect, it } from "vitest";
import { createPaperKgServer } from "./server.js";

describe("PaperKG MCP", () => {
  it("exports a server factory", () => {
    expect(typeof createPaperKgServer).toBe("function");
  });
});

