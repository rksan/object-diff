import { describe, it } from "mocha";
import { assert } from "chai";

// test target
import ObjectDiff from "@/index";

const testStrict = (options: { strict?: boolean }) => {
  const { strict } = options || { strict: false };
  const od = ObjectDiff({ strict });

  const _compare = (diff: any, org: any) =>
    JSON.stringify(diff) == JSON.stringify(org);

  describe("object", () => {
    it("empty", () => {
      let old, now;

      old = {};
      now = {};

      const diff = od.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("equal", () => {
      let old, now;

      if (strict) {
        old = { a: 1, b: "b", c: false, d: null, e: { f: true } };
        now = { a: 1, b: "b", c: false, d: null, e: { f: true } };
      } else {
        old = { a: 1, b: "b", c: true, d: null, e: { f: true } };
        now = { a: "1", b: "b", c: "true", d: "null", e: { f: "true" } };
      }

      const diff = od.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("diff-nest", () => {
      let old, now;
      old = { a: { /*    */ c: null, d: null, e: null } };
      now = { a: { b: null, c: "aa", /*    */ e: null } };

      const diff = od.diff({ old, now });
      if (diff) {
        assert.isOk(_compare(diff.add, { a: { b: now.a.b } }), "diff.add");
        assert.isOk(_compare(diff.chg, { a: { c: now.a.c } }), "diff.chg");
        assert.isOk(_compare(diff.del, { a: { d: old.a.d } }), "diff.del");
        assert.isOk(
          _compare(diff.old, { a: { c: old.a.c, d: old.a.d } }),
          "diff.old",
        );
        assert.isOk(
          _compare(diff.now, { a: { b: now.a.b, c: now.a.c } }),
          "diff.now",
        );
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
    it("diff-any", () => {
      let old, now;
      old = {
        b: "b",
        c: false,
        d: null,
        e: { f: null, g: null },
        h: [1, 2, 3],
      };
      now = { a: 1, b: "chg", d: null, e: { f: null }, h: [1, 2, 3] };

      const diff = od.diff({ old, now });

      if (diff) {
        assert.isOk(_compare(diff.add.a, now.a), "diff.add");
        assert.isOk(_compare(diff.chg.b, now.b), "diff.chg");
        assert.isOk(_compare(diff.del.c, old.c), "diff.del");
        assert.isOk(
          _compare(diff.old, { b: old.b, c: old.c, e: { g: old.e.g } }),
          "diff.old",
        );
        assert.isOk(
          _compare(diff.now, { a: now.a, b: now.b, e: {} }),
          "diff.now",
        );
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });
};

describe("ObjectDiff.ts", () => {
  describe("strict=false", () => {
    testStrict({ strict: false });
  });
  describe("strict=true", () => {
    testStrict({ strict: true });
  });
});
