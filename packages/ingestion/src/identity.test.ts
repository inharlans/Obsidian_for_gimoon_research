import { describe, expect, it } from "vitest";
import { findIdentityMatches } from "./identity.js";

describe("identity resolution", () => {
  it("uses strong identifiers without relying on title", () => {
    const matches = findIdentityMatches(
      { title: "A title", externalIds: { doi: "10.1/example" } },
      [{ title: "A changed title", externalIds: { doi: "10.1/example" } }]
    );
    expect(matches[0]?.strength).toBe("strong");
  });

  it("only proposes weak matches", () => {
    const matches = findIdentityMatches(
      { title: "Adaptive memory for language agents", firstAuthor: "Kim", year: 2025 },
      [{ title: "Adaptive Memory for Language Agents", firstAuthor: "Kim", year: 2025 }]
    );
    expect(matches[0]?.strength).toBe("weak");
  });
});

