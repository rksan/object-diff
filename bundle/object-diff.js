(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const util_1 = __importDefault(require("./util"));
const ObjectDiff = (options) => {
    const { output, strict, ignore } = options || {};
    const _DETAIL = "detail";
    const diffFn = ({ old, now }) => {
        const old_type = util_1.default.typeof(old);
        const now_type = util_1.default.typeof(now);
        if (old_type === now_type) {
            switch (old_type) {
                case "object":
                    return ObjectDiff.objectDiff({ olds: old, nows: now });
                case "array": {
                    const olds = old;
                    const nows = now;
                    return ObjectDiff.arrayDiff({ olds, nows });
                }
                case "date":
                    return ObjectDiff.dateDiff({ old, now });
                case "function":
                    return ObjectDiff.functionDiff({ old, now });
            }
            if (util_1.default.isPrimitive(old_type) && util_1.default.isPrimitive(now_type))
                return ObjectDiff.primitiveDiff({ old, now });
        }
        const equal = ObjectDiff.equal({ old, now });
        if (equal) {
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
    };
    const diffObj = {
        STRICT: (() => (strict === undefined ? false : strict))(),
        DETAIL: _DETAIL,
        OUTPUT: (() => (output === undefined ? _DETAIL : output))(),
        ignore: (word) => {
            let tmp = word;
            if (ignore) {
                if (ignore.includes("white-space"))
                    tmp = tmp.replaceAll(" ", "");
                if (ignore.includes("new-line"))
                    tmp = tmp.replaceAll("\r", "").replaceAll("\n", "");
                if (ignore.includes("case-insensitive"))
                    tmp = tmp.toLocaleLowerCase();
            }
            return tmp;
        },
        result: ({ result, old, now, add, chg, del, output, }) => {
            if (result === false) {
                return false;
            }
            switch (output) {
                case "old":
                    return old;
                case "now":
                    return now;
            }
            const diff = util_1.default.excludeUndefined({
                add,
                chg,
                del,
                old,
                now,
            });
            return diff;
        },
        unfoldACD: ({ result, old, now, output }) => {
            if (!util_1.default.isUndefined(old) && util_1.default.isUndefined(now)) {
                return ObjectDiff.result({
                    result,
                    del: old,
                    old,
                    now,
                    output,
                });
            }
            else if (util_1.default.isUndefined(old) && !util_1.default.isUndefined(now)) {
                return ObjectDiff.result({
                    result,
                    add: now,
                    old,
                    now,
                    output,
                });
            }
            return ObjectDiff.result({
                result,
                chg: now,
                old,
                now,
                output,
            });
        },
        equal: ({ old, now }) => {
            let left = old, right = now;
            let ltype = util_1.default.typeof(left), rtype = util_1.default.typeof(right);
            if (!ObjectDiff.STRICT) {
                const types = ["null", "boolean"];
                if (types.includes(ltype) || types.includes(rtype)) {
                    left = String(left);
                    ltype = "string";
                    right = String(right);
                    rtype = "string";
                }
            }
            if (util_1.default.typeof(left) === "string")
                left = ObjectDiff.ignore(left);
            if (util_1.default.typeof(right) === "string")
                right = ObjectDiff.ignore(right);
            return ObjectDiff.STRICT ? left === right : left == right;
        },
        primitiveDiff: ({ old, now }) => {
            if (ObjectDiff.equal({ old, now })) {
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
        dateDiff: ({ old, now }) => {
            if (old &&
                now &&
                ObjectDiff.equal({ old: old.getTime(), now: now.getTime() })) {
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
        functionDiff: ({ old, now }) => {
            if (old && now && ObjectDiff.equal({ old, now })) {
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
        objectDiff: ({ olds, nows }) => {
            const diff = {
                add: {},
                chg: {},
                del: {},
                old: {},
                now: {},
            };
            let count = 0;
            const oKeys = Object.keys(olds);
            const nKeys = Object.keys(nows);
            oKeys.forEach((oKey) => {
                const nIdx = nKeys.findIndex((nKey) => nKey === oKey);
                if (nIdx === -1) {
                    const del = { [oKey]: olds[oKey] };
                    const props = { del, old: del };
                    count = util_1.default.add_diff_obj({ diff, props, count });
                    return;
                }
                const result = ObjectDiff({ old: olds[oKey], now: nows[oKey] });
                if (result) {
                    const props = util_1.default.props_obj(oKey, result);
                    count = util_1.default.add_diff_obj({ diff, props, count });
                    return;
                }
            });
            nKeys.forEach((nKey) => {
                const oIdx = oKeys.findIndex((oKey) => oKey === nKey);
                if (oIdx === -1) {
                    const add = { [nKey]: nows[nKey] };
                    const props = { add, now: add };
                    count = util_1.default.add_diff_obj({ diff, props, count });
                    return;
                }
                oKeys.splice(oIdx, 1);
            });
            diff.now = util_1.default.originalOrder(nKeys, diff.now);
            if (0 < count) {
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
            return ObjectDiff.result({
                result: false,
                output: _DETAIL,
            });
        },
        arrayDiff: ({ olds, nows }) => {
            const diff = {
                old: [],
                now: [],
                add: [],
                chg: [],
                del: [],
            };
            let count = 0;
            const unmatchs = nows.slice();
            olds.filter((old) => {
                const nIdx = unmatchs.findIndex((now) => {
                    const result = ObjectDiff({ old, now });
                    if (result) {
                        return false;
                    }
                    return true;
                });
                if (-1 === nIdx) {
                    const props = { old, del: old };
                    count = util_1.default.add_diff_ary({ diff, props, count });
                    return false;
                }
                unmatchs.splice(nIdx, 1);
                return true;
            });
            unmatchs.forEach((now) => {
                const props = { now, add: now };
                count = util_1.default.add_diff_ary({ diff, props, count });
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
    const _objDiff = {
        static: ObjectDiff,
        diff: ({ old, now }) => {
            const diff = ObjectDiff({ old, now });
            if (diff) {
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
    };
    return ObjectDiff.OUTPUT === "detail"
        ? _objDiff
        : _objDiff;
};
module.exports = ObjectDiff;

},{"./util":3}],2:[function(require,module,exports){
"use strict";
/*! object-diff v1.0.0 @license MIT @author (c) 2026 rksan https://github.com/rksan */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ObjectDiff_1 = __importDefault(require("./ObjectDiff"));
module.exports = ObjectDiff_1.default;

},{"./ObjectDiff":1}],3:[function(require,module,exports){
"use strict";
const util = {
    isUndefined: (elem) => elem === undefined,
    hasLeastOne: (properties) => {
        for (let p in properties)
            return true;
        return false;
    },
    originalOrder: (originalKeys, properties) => {
        const original = {};
        originalKeys.forEach((key) => {
            if (Object.hasOwn(properties, key)) {
                Object.assign(original, { [key]: properties[key] });
            }
        });
        return original;
    },
    isPrimitive: (type) => {
        return ["string", "number", "boolean", "null"].includes(type);
    },
    objectIsEmpty: (obj) => {
        return !obj || !util.hasLeastOne(obj);
    },
    typeof: (item) => {
        if (item === null)
            return "null";
        const type = typeof item;
        if (Array.isArray(item))
            return "array";
        if (type === "object") {
            if (item instanceof Date)
                return "date";
            return type;
        }
        return type;
    },
    excludeUndefined: (properties) => {
        const result = {};
        if (properties)
            Object.keys(properties).forEach((key) => {
                if (util.isUndefined(properties[key]))
                    return;
                Object.assign(result, { [key]: properties[key] });
            });
        return result;
    },
    props_obj: (name, result) => {
        const { add, chg, del, old, now } = result;
        const props = {};
        if (!util.isUndefined(add))
            Object.assign(props, { add: { [name]: add } });
        if (!util.isUndefined(chg))
            Object.assign(props, { chg: { [name]: chg } });
        if (!util.isUndefined(del))
            Object.assign(props, { del: { [name]: del } });
        if (!util.isUndefined(old))
            Object.assign(props, { old: { [name]: old } });
        if (!util.isUndefined(now))
            Object.assign(props, { now: { [name]: now } });
        return props;
    },
    add_diff_obj: (args) => {
        const { diff, props } = args;
        Object.keys(props).forEach((key) => {
            if (util.isUndefined(props[key]))
                return;
            if (util.hasLeastOne(props[key]))
                Object.assign(diff[key], props[key]);
        });
        args.count++;
        return args.count;
    },
    add_diff_ary: (args) => {
        const { diff, props } = args;
        Object.keys(props).forEach((key) => {
            if (util.isUndefined(props[key]))
                return;
            if (!diff[key])
                diff[key] = [];
            diff[key].push(props[key]);
        });
        args.count++;
        return args.count;
    },
};
module.exports = util;

},{}]},{},[2]);
