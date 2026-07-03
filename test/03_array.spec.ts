import { describe, it } from "mocha";
import { assert } from "chai";

// test target
import ObjectDiff from "@/index";

const testStrict = (options: { strict?: boolean }) => {
  const { strict } = options || { strict: false };
  const controller = ObjectDiff({ strict });

  const _compare = (diff: any, org: any) =>
    JSON.stringify(diff) == JSON.stringify(org);

  describe("array", () => {
    it("equal", () => {
      let old, now;
      if (strict) {
        old = [1, "string", false, { a: 1, b: "b", c: true }, [1, 2, 3]];
        now = [1, "string", false, { a: 1, b: "b", c: true }, [1, 2, 3]];
      } else {
        old = [1, "string", false, { a: 1, b: "b", c: true }, [1, 2, 3]];
        now = [
          "1",
          "string",
          "false",
          { a: "1", b: "b", c: "true" },
          ["1", "2", "3"],
        ];
      }
      const diff = controller.diff({ old, now });

      assert.isFalse(diff, "equal fail.");
    });
    it("diff-primitive", () => {
      let old, now;
      old = [2, 3, 4, 5];
      now = [1, 2, 4, 6, 7];
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(_compare(diff.add, [1, 6, 7]), "diff.add");
        assert.isOk(diff.chg === undefined, "diff.chg");
        assert.isOk(_compare(diff.del, [3, 5]), "diff.del");
        assert.isOk(_compare(diff.old, [3, 5]), "diff.old");
        assert.isOk(_compare(diff.now, [1, 6, 7]), "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
    it("diff-oject-array", () => {
      let old, now;
      old = [
        /* { a: 1 }, */
        { b: true },
        { c: "string" },
        { d: { e: null, f: null } },
      ];
      now = [
        { a: 1 },
        { b: true },
        /* c: "string" }, */
        { d: { e: null } },
      ];
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(_compare(diff.add, [now[0], now[2]]), "diff.add");
        assert.isOk(diff.chg === undefined, "diff.chg");
        assert.isOk(_compare(diff.del, [old[1], old[2]]), "diff.del");
        assert.isOk(_compare(diff.old, [old[1], old[2]]), "diff.old");
        assert.isOk(_compare(diff.now, [now[0], now[2]]), "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });
};

describe("ObjectDiff.ts", () => {
  describe("strict=true", () => {
    testStrict({ strict: true });
  });
});
