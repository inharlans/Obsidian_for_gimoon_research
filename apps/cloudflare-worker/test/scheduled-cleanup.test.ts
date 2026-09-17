import { describe, expect, it, vi } from "vitest";
import { runScheduledCleanup } from "../src/scheduled-cleanup.js";

describe("scheduled cleanup isolation", () => {
  it("runs every cleanup and reports failures without rejecting the cron event", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const finalTask = vi.fn(async () => undefined);

    await expect(runScheduledCleanup([
      { name: "provider", run: async () => { throw new TypeError("temporary failure"); } },
      { name: "transient", run: finalTask },
    ])).resolves.toBeUndefined();

    expect(finalTask).toHaveBeenCalledOnce();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('"task":"transient"'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('"error_name":"TypeError"'));
    info.mockRestore();
    error.mockRestore();
  });
});
