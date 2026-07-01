/*! object-diff v1.0.0 @license MIT @author (c) 2026 rksan https://github.com/rksan */
// @ts-check
"use strict";
import type ObjectDiff from "@/types/ObjectDiff";
import util from "@/util";

const ObjectDiff: ObjectDiff = (options?: {
  output?: ObjectDiff.Output;
  strict?: boolean;
  ignore?: ObjectDiff.Ignore[];
}): ObjectDiff.Detail | ObjectDiff.Any => {
  const { output, strict, ignore } = options || {};

  const _DETAIL: "detail" = "detail";

  const diffFn: ObjectDiff.Fn = ({ old, now }): ObjectDiff.Result => {
    const old_type = util.typeof(old);
    const now_type = util.typeof(now);

    // ---
    // compare process
    if (old_type === now_type) {
      // same type
      switch (old_type) {
        case "object":
          return ObjectDiff.objectDiff({ olds: old, nows: now });
        case "array": {
          const olds = /** @type {any[]} */ old;
          const nows = /** @type {any[]} */ now;
          return ObjectDiff.arrayDiff({ olds, nows });
        }
        case "date":
          return ObjectDiff.dateDiff({ old, now });
        case "function":
          return ObjectDiff.functionDiff({ old, now });
      }

      // primitive
      if (util.isPrimitive(old_type) && util.isPrimitive(now_type))
        return ObjectDiff.primitiveDiff({ old, now });
    }

    const equal = ObjectDiff.equal({ old, now });
    if (equal) {
      // equal
      return ObjectDiff.result({
        result: false,
        output: _DETAIL,
      });
    }

    // diff exist
    return ObjectDiff.unfoldACD({
      result: true,
      old,
      now,
      output: _DETAIL,
    });
  };

  const diffObj: ObjectDiff.Obj = {
    STRICT: (() => (strict === undefined ? false : strict))(),

    DETAIL: _DETAIL,

    OUTPUT: (() => (output === undefined ? _DETAIL : output))(),

    ignore: (word: string): string => {
      let tmp = word;

      if (ignore) {
        if (ignore.includes("white-space")) tmp = tmp.replaceAll(" ", "");
        if (ignore.includes("new-line"))
          tmp = tmp.replaceAll("\r", "").replaceAll("\n", "");
        if (ignore.includes("case-insensitive")) tmp = tmp.toLocaleLowerCase();
      }

      return tmp;
    },

    result: ({
      result,
      old,
      now,
      add,
      chg,
      del,
      output,
    }): ObjectDiff.Result => {
      if (result === false) {
        // equal
        return false;
      }

      switch (output) {
        case "old":
          return old;
        case "now":
          return now;
      }

      const diff = util.excludeUndefined({
        add,
        chg,
        del,
        old,
        now,
      });

      return diff as ObjectDiff.Result;
    },

    unfoldACD: ({ result, old, now, output }): ObjectDiff.Result => {
      if (!util.isUndefined(old) && util.isUndefined(now)) {
        // [delete]
        return ObjectDiff.result({
          result,
          del: old,
          old,
          now,
          output,
        });
      } else if (util.isUndefined(old) && !util.isUndefined(now)) {
        // [add]
        return ObjectDiff.result({
          result,
          add: now,
          old,
          now,
          output,
        });
      }

      // [change]
      return ObjectDiff.result({
        result,
        chg: now,
        old,
        now,
        output,
      });
    },

    equal: ({ old, now }): boolean => {
      let left = old,
        right = now;
      let ltype = util.typeof(left),
        rtype = util.typeof(right);

      if (!ObjectDiff.STRICT) {
        const types = ["null", "boolean"];
        if (types.includes(ltype) || types.includes(rtype)) {
          left = String(left);
          ltype = "string";
          right = String(right);
          rtype = "string";
        }
      }

      if (util.typeof(left) === "string") left = ObjectDiff.ignore(left);
      if (util.typeof(right) === "string") right = ObjectDiff.ignore(right);

      return ObjectDiff.STRICT ? left === right : left == right;
    },

    primitiveDiff: ({ old, now }): ObjectDiff.Result => {
      if (ObjectDiff.equal({ old, now })) {
        // equal
        return ObjectDiff.result({
          result: false,
          output: _DETAIL,
        });
      }

      return ObjectDiff.unfoldACD({
        result: true,
        old,
        now,
        output: _DETAIL,
      });
    },

    dateDiff: ({ old, now }): ObjectDiff.Result => {
      if (
        old &&
        now &&
        ObjectDiff.equal({ old: old.getTime(), now: now.getTime() })
      ) {
        // equal
        return ObjectDiff.result({
          result: false,
          output: _DETAIL,
        });
      }

      return ObjectDiff.unfoldACD({
        result: true,
        old,
        now,
        output: _DETAIL,
      });
    },

    functionDiff: ({ old, now }): ObjectDiff.Result => {
      if (old && now && ObjectDiff.equal({ old, now })) {
        // equal
        return ObjectDiff.result({
          result: false,
          output: _DETAIL,
        });
      }

      return ObjectDiff.unfoldACD({
        result: true,
        old,
        now,
        output: _DETAIL,
      });
    },

    objectDiff: ({ olds, nows }): ObjectDiff.Result => {
      const diff = {
        add: {} as any,
        chg: {} as any,
        del: {} as any,
        old: {} as any,
        now: {} as any,
      };
      let count = 0;

      const oKeys = Object.keys(olds);
      const nKeys = Object.keys(nows);

      oKeys.forEach((oKey) => {
        const nIdx = nKeys.findIndex((nKey) => nKey === oKey);
        if (nIdx === -1) {
          // [deleted]
          const del = { [oKey]: olds[oKey] };
          const props = { del, old: del };
          count = util.add_diff_obj({ diff, props, count });
          // [end]
          return;
        }

        const result = ObjectDiff({ old: olds[oKey], now: nows[oKey] });
        if (result) {
          // [changed]
          const props = util.props_obj(oKey, result);
          count = util.add_diff_obj({ diff, props, count });
          // [end]
          return;
        }
      });

      nKeys.forEach((nKey) => {
        const oIdx = oKeys.findIndex((oKey) => oKey === nKey);
        if (oIdx === -1) {
          // [added] now.
          const add = { [nKey]: nows[nKey] };
          const props = { add, now: add };
          count = util.add_diff_obj({ diff, props, count });
          // [end]
          return;
        }
        // exclude from olds
        oKeys.splice(oIdx, 1);
      });

      diff.now = util.originalOrder(nKeys, diff.now);

      if (0 < count) {
        // diff exist
        return ObjectDiff.result({
          result: true,
          old: diff.old,
          now: diff.now,
          add: diff.add,
          chg: diff.chg,
          del: diff.del,
          output: _DETAIL,
        });
      }

      // equal
      return ObjectDiff.result({
        result: false,
        output: _DETAIL,
      });
    },

    arrayDiff: ({ olds, nows }): ObjectDiff.Result => {
      const diff = {
        old: [] as any[],
        now: [] as any[],
        add: [] as any[],
        chg: [] as any[],
        del: [] as any[],
      };
      let count = 0;

      const unmatchs = nows.slice();

      olds.filter((old: any) => {
        // <nTmps>
        // ? include in now
        const nIdx = unmatchs.findIndex((now: any) => {
          const result = ObjectDiff({ old, now });
          if (result) {
            // [different]
            return false;
          }
          // equal
          return true;
        });
        // </nTmps>

        // old is not include in nows
        if (-1 === nIdx) {
          // [delete]
          const props = { old, del: old };
          // diff exist
          count = util.add_diff_ary({ diff, props, count });
          // exclude from old.
          return false;
        }

        unmatchs.splice(nIdx, 1);

        // equal
        return true;
      });

      unmatchs.forEach((now) => {
        // [add]
        const props = { now, add: now };
        // diff
        count = util.add_diff_ary({ diff, props, count });
      });

      if (0 < count) {
        return ObjectDiff.result({
          result: true,
          add: diff.add,
          del: diff.del,
          old: diff.old,
          now: diff.now,
          output: _DETAIL,
        });
      }

      return ObjectDiff.result({
        result: false,
        output: _DETAIL,
      });
    },
  };

  const ObjectDiff = Object.assign(diffFn, diffObj);

  const _objDiff: ObjectDiff.Detail = {
    static: ObjectDiff,
    diff: ({ old, now }): ObjectDiff.Result => {
      const diff = ObjectDiff({ old, now });
      if (diff) {
        // diff exist
        return ObjectDiff.result({
          result: true,
          old: diff.old,
          now: diff.now,
          add: diff.add,
          chg: diff.chg,
          del: diff.del,
          output: ObjectDiff.OUTPUT,
        });
      }
      return ObjectDiff.result({
        result: false,
        output: ObjectDiff.OUTPUT,
      });
    },
  } as ObjectDiff.Detail;

  return ObjectDiff.OUTPUT === "detail"
    ? _objDiff
    : (_objDiff as ObjectDiff.Any);
};

export = ObjectDiff;
