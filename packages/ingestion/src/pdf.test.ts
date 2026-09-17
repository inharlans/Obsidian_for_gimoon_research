import { describe, expect, it } from "vitest";
import { safePdfLoadOptions } from "./pdf.js";

describe("safePdfLoadOptions", () => {
  it("keeps untrusted PDFs out of XFA and worker-fetch execution paths", () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const options = safePdfLoadOptions(bytes);

    expect(options.data).toBe(bytes);
    expect(options.enableXfa).toBe(false);
    expect(options.useWorkerFetch).toBe(false);
  });
});
