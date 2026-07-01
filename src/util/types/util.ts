type util = {
  /** 要素が undefined か？ */
  isUndefined: (elem: any) => boolean;

  /** 最低１つ以上のプロパティを保持したオブジェクトか */
  hasLeastOne: (properties: any) => boolean;

  /** originalKeys の順番に プロパティを並べ替える */
  originalOrder: (originalKeys: string[], properties: any) => any;

  /** Primitive な型か？ */
  isPrimitive: (type: string) => boolean;

  /** 空のオブジェクトか？ */
  objectIsEmpty: (obj: any) => boolean;

  /** 型を返す */
  typeof: (
    item: any,
  ) =>
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
    | "date";

  /** 値が定義されていない(=undefined)プロパティを除外したオブジェクトを返す */
  excludeUndefined: (properties: any) => unknown;

  /**
   * { [result.key]: { [name]:result.val } }
   * @param name props の プロパティ名
   * @param result 結果オブジェクト
   * @returns {{ [key: string]: any }}
   */
  props_obj: (name: string, result: any) => { [key: string]: any };

  /** diff に props を追加し、count++ する */
  add_diff_obj: (args: {
    diff: { [key: string]: any };
    props: { [key: string]: any };
    count: number;
  }) => number;

  /** diff に props を追加し、count++ する */
  add_diff_ary: (args: {
    diff: { [key: string]: any[] | undefined };
    props: { [key: string]: any | undefined };
    count: number;
  }) => number;
};

export = util;
