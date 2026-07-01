import { describe, it } from "mocha";
import { assert } from "chai";

// test target
import ObjectDiff from "@/index";

const testOutput = (options: { output: ObjectDiff.Output }) => {
  const { output } = options;
  if (output === "detail")
    throw new Error(`テスト外のオプションです[output=${output}]`);

  const od = ObjectDiff({ output });
  it("equal", () => {
    const diff = od.diff({ old: 1, now: 1 });
    assert.isFalse(diff, "equal fail.");
  });
  it("diff", () => {
    const old = "string1";
    const now = "string2";
    const diff = od.diff({ old, now });
    if (diff) {
      if (output === "old") {
        assert.isOk(diff === old, "diff fail.");
      } else {
        assert.isOk(diff === now, "diff fail.");
      }
    } else {
      assert.isOk(diff, "diff fail.");
    }
  });
};

const testIgnore = () => {
  it("ignore=space", () => {
    const od = ObjectDiff({ ignore: ["white-space"] });
    let old, now;
    old = [" a a a "].join("\n");
    now = ["a a a"].join("\n");
    const diff = od.diff({ old, now });
    assert.isFalse(diff, "diff fail.");
  });

  it("ignore=new-line", () => {
    const od = ObjectDiff({ ignore: ["new-line"] });
    let old, now;
    old = ["row1", "row2", "row3"].join("\n");
    now = ["row1row2row3"].join("\n");
    const diff = od.diff({ old, now });
    assert.isFalse(diff, "diff fail.");
  });

  it("ignore=case-insensitive", () => {
    const od = ObjectDiff({ ignore: ["case-insensitive"] });
    let old, now;
    old = ["abc", "efg"].join("\n");
    now = ["ABC", "EFG"].join("\n");
    const diff = od.diff({ old, now });
    assert.isFalse(diff, "diff fail.");
  });

  it("ignore=option-all", () => {
    const od = ObjectDiff({
      ignore: ["white-space", "new-line", "case-insensitive"],
    });
    let old, now;
    old = [" a b c ", " e f g "].join("\n");
    now = ["ABCEFG"].join("\n");
    const diff = od.diff({ old, now });
    assert.isFalse(diff, "diff fail.");
  });
};

describe("ObjectDiff.ts", () => {
  describe("output=old", () => {
    testOutput({ output: "old" });
  });
  describe("output=now", () => {
    testOutput({ output: "now" });
  });
  describe("ignore", () => {
    testIgnore();
  });
});
