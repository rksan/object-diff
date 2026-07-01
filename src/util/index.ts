// @ts-check
import util from "./types/util";

const util: util = {
  isUndefined: (elem) => elem === undefined,

  hasLeastOne: (properties: any) => {
    for (let p in properties) return true;
    return false;
  },

  originalOrder: (originalKeys: string[], properties: any) => {
    const original = {};
    originalKeys.forEach((key) => {
      if (Object.hasOwn(properties, key)) {
        Object.assign(original, { [key]: properties[key] });
      }
    });
    return original;
  },

  isPrimitive: (type: string): boolean => {
    return ["string", "number", "boolean", "null"].includes(type);
  },

  objectIsEmpty: (obj: any): boolean => {
    return !obj || !util.hasLeastOne(obj);
  },

  typeof: (
    item: any,
  ):
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "null"
    | "object"
    | "array"
    | "function"
    | "symbol"
    | "undefined"
    | "date" => {
    if (item === null) return "null";

    const type = typeof item;

    if (Array.isArray(item)) return "array";
    if (type === "object") {
      if (item instanceof Date) return "date";
      return type;
    }

    return type;
  },

  excludeUndefined: (properties: any): unknown => {
    const result = {};
    if (properties)
      Object.keys(properties).forEach((key) => {
        if (util.isUndefined(properties[key])) return;
        Object.assign(result, { [key]: properties[key] });
      });
    return result;
  },

  props_obj: (
    name: string,
    result: { add?: any; chg?: any; del?: any; old?: any; now?: any },
  ): { [key: string]: any } => {
    const { add, chg, del, old, now } = result;
    const props = {};
    if (!util.isUndefined(add)) Object.assign(props, { add: { [name]: add } });
    if (!util.isUndefined(chg)) Object.assign(props, { chg: { [name]: chg } });
    if (!util.isUndefined(del)) Object.assign(props, { del: { [name]: del } });
    if (!util.isUndefined(old)) Object.assign(props, { old: { [name]: old } });
    if (!util.isUndefined(now)) Object.assign(props, { now: { [name]: now } });
    return props;
  },

  add_diff_obj: (args: {
    diff: { [key: string]: any };
    props: { [key: string]: any };
    count: number;
  }) => {
    const { diff, props } = args;

    Object.keys(props).forEach((key) => {
      if (util.isUndefined(props[key])) return; // non proces
      if (util.hasLeastOne(props[key])) Object.assign(diff[key], props[key]);
    });

    // diff count up
    args.count++;

    return args.count;
  },

  add_diff_ary: (args: {
    diff: { [key: string]: any[] | undefined };
    props: { [key: string]: any[] | undefined };
    count: number;
  }) => {
    const { diff, props } = args;

    Object.keys(props).forEach((key) => {
      if (util.isUndefined(props[key])) return;
      if (!diff[key]) diff[key] = [];
      diff[key].push(props[key]);
    });

    // diff count up
    args.count++;

    return args.count;
  },
};

export = util;
