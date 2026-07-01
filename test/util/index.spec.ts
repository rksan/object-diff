import { describe, it } from "mocha";
import { assert } from "chai";

// test target
import type ObjectDiff from "@/ObjectDiff";
import util from "../../src/util";

describe("util.ts", () => {
  it("util.hasLeastOne()", () => {
    assert.isOk(util.hasLeastOne({ one: "" })), "fail.";
    assert.isOk(!util.hasLeastOne({}), "fail.");
  });

  it("util.isPrimitive()", () => {
    assert.isOk(util.isPrimitive("string"), "fail.");
    assert.isOk(!util.isPrimitive("object"), "fail.");
  });

  it("util.objectIsEmpty()", () => {
    assert.isOk(!util.objectIsEmpty({ one: "" }), "fail.");
    assert.isOk(util.objectIsEmpty({}), "fail.");
  });

  it("util.typeof()", () => {
    assert.isOk(util.typeof(null) === "null", "null fail.");
    assert.isOk(util.typeof("") === "string", "string fail.");
    assert.isOk(util.typeof(0) === "number", "number fail.");
    assert.isOk(util.typeof(false) === "boolean", "boolean fail.");
    assert.isOk(util.typeof(new Date()) === "date", "date fail.");
    assert.isOk(util.typeof(() => true) === "function", "function fail.");
    assert.isOk(util.typeof({}) === "object", "object fail.");
    assert.isOk(util.typeof([]) === "array", "array fail.");
    assert.isOk(
      util.typeof(BigInt.asIntN(64, 2n)) === "bigint",
      "bigint fail.",
    );
    assert.isOk(util.typeof(Symbol()) === "symbol", "Symbol fail.");
  });

  describe("util.excludeUndefined()", () => {
    it("empty", () => {
      const diff = util.excludeUndefined(undefined) as ObjectDiff.Result;
      if (diff) {
        assert.isObject(diff);
      } else {
        assert.isNotOk(diff, "diff fail.");
      }
    });
    it("else", () => {
      const diff = util.excludeUndefined({
        one: undefined,
        two: {},
        three: { a: 1 },
        four: { a: undefined },
      }) as ObjectDiff.Result;
      if (diff) {
        assert.isOk(!Object.hasOwn(diff, "one"), "diff.one");
        assert.isOk(Object.hasOwn(diff, "two"), "diff.two");
        assert.isOk(Object.hasOwn(diff, "three"), "diff.three");
        assert.isOk(Object.hasOwn(diff, "four"), "diff.four");
      } else {
        assert.isNotOk(diff, "diff fail.");
      }
    });
  });
  it("util.add_diff_obj()", () => {
    const diff = { one: {}, two: {}, three: {} };
    let count = 0;
    let one, four;
    count = util.add_diff_obj({
      diff,
      props: {
        one,
        two: {},
        three: { a: 1 },
        four,
      },
      count,
    });
    if (diff) {
      assert.isOk(Object.hasOwn(diff, "one"), "diff.one");
      assert.isOk(Object.hasOwn(diff, "two"), "diff.two");
      assert.isOk(Object.hasOwn(diff, "three"), "diff.three");
      assert.isOk(!Object.hasOwn(diff, "four"), "diff.four");
    } else {
      assert.isNotOk(diff, "fail.");
    }
  });
  it("util.add_diff_ary()", () => {
    const diff = { one: [], two: [], three: [] };
    let count = 0;

    count = util.add_diff_ary({
      diff,
      props: {
        two: [],
        three: ["a"],
        old: undefined,
        now: [],
      },
      count,
    });
    if (diff) {
      assert.isOk(Object.hasOwn(diff, "one"), "diff.one");
      assert.isOk(Object.hasOwn(diff, "two"), "diff.two");
      assert.isOk(Object.hasOwn(diff, "three"), "diff.three");
      assert.isOk(!Object.hasOwn(diff, "old"), "diff.old");
      assert.isOk(Object.hasOwn(diff, "now"), "diff.now");
    } else {
      assert.isNotOk(diff, "fail.");
    }
  });
});
