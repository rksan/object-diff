import { describe, it } from "mocha";
import { assert } from "chai";

// test target
import { sample } from "@/index";

describe("index.ts", () => {
  it("sample()", () => {
    assert.isOk(sample());
  });
});
