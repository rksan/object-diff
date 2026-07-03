import { describe, it } from "mocha";
import { assert } from "chai";

// test target
import ObjectDiff from "@/index";

const testStrict = (options: { strict?: boolean }) => {
  const { strict } = options || { strict: false };
  const controller = ObjectDiff({ strict });

  describe("null", () => {
    it("equal", () => {
      let old, now;
      if (strict) {
        old = null;
        now = null;
      } else {
        old = null;
        now = "null";
      }
      const diff = controller.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("add", () => {
      const old = undefined;
      const now = null;
      const diff = controller.diff({ old, now });
      if (diff) {
        console.log("diff", diff);
        assert.isOk(diff.add === now, "diff.add");
        assert.isOk(diff.chg === undefined, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
    it("delete", () => {
      const old = null;
      const now = undefined;
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === undefined, "diff.chg");
        assert.isOk(diff.del === old, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
    it("change", () => {
      const old = 1;
      const now = null;
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === now, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });
  describe("string", () => {
    it("equal", () => {
      const old = "string1";
      const now = "string1";
      const diff = controller.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("diff", () => {
      const old = "string1";
      const now = "string2";
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === now, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });
  describe("number", () => {
    it("equal", () => {
      let old, now;
      if (strict) {
        old = 987.654;
        now = old;
      } else {
        old = 987.654;
        now = String(old);
      }
      const diff = controller.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("diff", () => {
      let old, now;
      if (strict) {
        old = 1234567;
        now = String(old);
      } else {
        old = 1234567;
        now = 2345678;
      }
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === now, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });
  describe("boolean", () => {
    it("equal", () => {
      let old, now;
      if (strict) {
        old = true;
        now = true;
      } else {
        old = false;
        now = "false";
      }
      const diff = controller.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("diff", () => {
      let old, now;
      if (strict) {
        old = true;
        now = "true";
      } else {
        old = true;
        now = false;
      }
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === now, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });

  describe("date", () => {
    const dt = new Date();
    it("equal", () => {
      let old, now;
      old = new Date(dt.toISOString());
      now = new Date(dt.toISOString());
      const diff = controller.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("diff", () => {
      let old, now;
      old = new Date(dt.toISOString());
      now = new Date();
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === now, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
      } else {
        assert.isOk(diff, "diff fail.");
      }
    });
  });

  describe("function", () => {
    it("equal", () => {
      const old = () => true;
      const now = old;
      const diff = controller.diff({ old, now });
      assert.isFalse(diff, "equal fail.");
    });
    it("diff", () => {
      const old = () => true;
      const now = () => false;
      const diff = controller.diff({ old, now });
      if (diff) {
        assert.isOk(diff.add === undefined, "diff.add");
        assert.isOk(diff.chg === now, "diff.chg");
        assert.isOk(diff.del === undefined, "diff.del");
        assert.isOk(diff.old === old, "diff.old");
        assert.isOk(diff.now === now, "diff.now");
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
