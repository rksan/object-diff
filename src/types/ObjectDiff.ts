/** 名前空間 */
declare namespace ObjectDiff {
  /** primitive 型 */
  type Primitive = null | string | number | boolean;

  /** 差分なし結果 */
  type False = false;

  /** 差分あり結果 */
  interface True {
    /** 旧 の 差分 */
    old: any;
    /** 新 の差分 */
    now: any;
    /** 旧 → 新 で追加された要素 */
    add: any;
    /** 旧 → 新 で変更された要素*/
    chg: any;
    /** 旧 → 新 で削除された要素 */
    del: any;
  }

  /** 差分結果 */
  type Result = False | True;

  /**
   * 差分結果出力オプション
   * - detail 両方 & 追加・変更・削除
   * - old 過去のみ
   * - now 現在のみ
   */
  type Output = "detail" | "old" | "now";

  /**
   * 比較オプション
   * - white-space 空白を無視
   * - case-insensitive 小/大文字を区別しない
   * - new-line 改行を無視
   */
  type Ignore = "white-space" | "case-insensitive" | "new-line";

  /**
   * 差分比較を実行する関数本体
   * @param {object} args 引数
   * @param {any} args.old 古い Object
   * @param {any} args.now 今の Object
   * @returns {Result}
   */
  type Fn = (args: { old: any; now: any }) => Result;

  interface Obj {
    get STRICT(): boolean;

    get DETAIL(): "detail";

    get OUTPUT(): Output;

    ignore: (word: Ignore) => string;

    /**
     * 差分結果を作成
     * @param {object} args
     * @param {boolean} args.result true : 差分あり、false : 差分なし
     * @param {any} [args.old] 古いオブジェクトの差分
     * @param {any} [args.now] 今のオブジェクトの差分
     * @param {any} [args.add] 追加された要素
     * @param {any} [args.chg] 変更された要素
     * @param {any} [args.del] 削除された要素
     * @param {Output} args.output 差分結果の出力オプション
     * @returns {Result} 差分結果
     */
    result: (args: {
      result: boolean;
      old?: any;
      now?: any;
      add?: any;
      chg?: any;
      del?: any;
      output: ObjectDiff.Output;
    }) => ObjectDiff.Result;

    /**
     * primitive 値の追加｜変更｜削除 を結果に展開
     * @param args
     * @param {boolean} args.result true : 差分あり、false : 差分なし
     * @param {any} [args.old] 古いオブジェクトの差分
     * @param {any} [args.now] 今のオブジェクトの差分
     * @param {Output} args.output 差分結果の出力オプション
     * @return {Result} 差分結果
     */
    unfoldACD: (args: {
      result: boolean;
      old?: any;
      now?: any;
      output: Output;
    }) => Result;

    /**
     * 要素が等しいか
     * @param {object} args
     * @param {any} args.old 古い要素
     * @param {any} args.now 今の要素
     * @returns {boolean} true : 等しい、false : 等しくない
     */
    equal: (args: { old: any; now: any }) => boolean;

    /**
     * Primitive の差分をとる
     * @param {object} args
     * @param {Primitive} args.old 古い値
     * @param {Primitive} args.now 今の値
     * @returns {Result} 差分結果
     */
    primitiveDiff: (args: {
      old: ObjectDiff.Primitive;
      now: ObjectDiff.Primitive;
    }) => ObjectDiff.Result;

    /**
     * Date の差分をとる
     * @param {object} args
     * @param {Date} args.old 古い値
     * @param {Date} args.now 今の値
     * @returns {DiffResult} 差分結果
     */
    dateDiff: (args: { old: Date; now: Date }) => ObjectDiff.Result;

    /**
     * Function の差分をとる
     * @param {object} args
     * @param {Function} args.old 古い値
     * @param {Function} args.now 今の値
     * @returns {Result} 差分結果
     */
    functionDiff: (args: { old: Function; now: Function }) => ObjectDiff.Result;

    /**
     * Object の差分をとる
     * @param {object} args
     * @param {any} args.old 古い値
     * @param {any} args.now 今の値
     * @returns {Result} 差分結果
     */
    objectDiff: (args: { olds: any; nows: any }) => ObjectDiff.Result;

    arrayDiff: (args: { olds: any[]; nows: any[] }) => ObjectDiff.Result;
  }

  type Static = Fn & Obj;

  /**
   * 差分比較関数を操作するオブジェクト
   * @interface
   * @method diff
   */
  interface Detail {
    get static(): Static;

    /**
     * 差分を取る関数
     * @param {object} args
     * @param {any} args.old 古い要素
     * @param {any} args.now 今の要素
     * @returns {DiffResult} 差分結果
     */
    diff(args: { old: any; now: any }): Result;
  }

  interface Any extends Detail {
    /**
     * 差分を取る関数
     * @param {object} args
     * @param {any} args.old 古い要素
     * @param {any} args.now 今の要素
     * @returns {DiffResult} 差分結果
     */
    diff(args: { old: any; now: any }): any;
  }
}

/**
 * オプションを指定して、差分比較関数をビルドする
 * @param {object} [options] オプション
 * @param {ObjectDiff.Output} [options.output] default "detail"
 * @param {boolean} [options.strict] true : 厳格モード、default : false
 * @param {ObjectDiff.Ignore[]} [options.ignore]
 * @return {ObjectDiff.Detail | ObjectDiff.Any} 差分比較関数
 */
type ObjectDiff = ((options: {
  output: "old" | "now";
  strict?: boolean;
  ignore?: ObjectDiff.Ignore[];
}) => ObjectDiff.Any) &
  ((options: {
    output?: "detail";
    strict?: boolean;
    ignore?: ObjectDiff.Ignore[];
  }) => ObjectDiff.Detail) &
  ((options?: {
    output?: ObjectDiff.Output;
    strict?: boolean;
    ignore?: ObjectDiff.Ignore[];
  }) => ObjectDiff.Detail | ObjectDiff.Any);

export = ObjectDiff;
