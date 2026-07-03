# Object-Diff

- node
- mjs
- cjs

# usage

```ts
// [TypeScript]
import ObjectDiff from "@rksan/ObjectDiff";

const old = {
  // a: "add-property",
  b: "change-property",
  c: "delete-property",
  d: "property",
};
const now = {
  a: "added-property",
  b: "changed-property",
  // c: "deleted-property",
  d: "property",
};

// Specify options, obtain a diff comparison object.
const controller = ObjectDiff({ strict: true });

// Retrieves the differences between objects.
const result = controller.diff({ old, now });

if (result) {
  // ---
  // exist diff.
  console.log("added property", result.add);
  // -> { a: "added-property" }
  console.log("changed property", result.chg);
  // -> { b: "changed-property" }
  console.log("deleted property", result.del);
  // -> { c: "delete-property" }
  console.log("diff old properties", result.old);
  // ->
  // {
  //   b: "change-property",
  //   c: "delete-property",
  // }
  console.log("diff now properties", diff.now);
  // ->
  // {
  //   a: "added-property",
  //   b: "changed-property",
  // }
} else {
  // ---
  // equal (no diff.)
  console.log("not diff.");
}
```

様々なデータ型に対応

```ts
const ctrl = ObjectDiff();

... JSON Primitive ...
const str = ctrl.diff({ old: "before", now: "after" });

const num = ctrl.diff({ old: 0, now: 1 });

const bol = ctrl.diff({ old: true, now: false});

const null = ctrl.diff({ old: null, now: null })

... Object ...
const obj = ctrl.diff({
  old: { a: "before", b: false, { c: 1 }, d: [1,2,3] },
  now:{ a: "after", b: true, { c: 2 }, d: [2,3,4] },
});

... Array ...
const ary = ctrl.diff({
  old: ["before", false, { c: 1 }, [1,2,3]],
  now: ["after", true, { c: 2 }, [2,3,4]],
});

... Date ...
const date = ctrl.diff({ old: new Date(), now: new Date() });
```

# install

```bash
npm i @rksan/ObjectDiff
```

# Requirement

- Node.js - v18

# syntax

## ObjectDiff( options? ) => Controller

```ts
const controller = ObjectDiff(options?: {
  output?: "old" | "now" | "detail";
  strict?: boolean;
  ignore?: [
    "white-space",
    "case-insensitive",
    "new-line"
  ];
});
```

### arguments

#### `options?`

##### `output?`

差分出力を変更するオプション

- `@type` `"old"` | `"now"` | `"detail"`
  - `old` 旧要素のみ
  - `now` 新要素のみ
  - `detail` 旧｜新、および追加｜変更｜削除
- `@default` `"detail"`

```ts
// [example.ts]

const old = { a: 1, b: 2 /*, c: 3*/ };
const now = { /*a: 1,*/ b: 2, c: 3 };

...

const result = ObjectDiff({ output: "old" }).diff({ old, now });

if(result){
  console.log(result); // -> { a:1 }
}
...

const result = ObjectDiff({ output: "now" }).diff({ old, now });

if(result){
  console.log(result); // -> { c:3 }
}

...

const result = ObjectDiff({ output: "detail" }).diff({ old, now });

if(result){
  console.log(result);
  // ->
  // {
  //   add: { c:3 },
  //   chg: undefined,
  //   del: { a:1 },
  //   old: { a:1 },
  //   now: { c:3 }
  // }
}
```

##### `strict?`

値の比較モードを変更するオプション

- `@type` `boolean`
  - `true` 厳格モード
  - `false` 普通モード
- `@default` `false`

```ts
// [example.ts]
const old = { a: true, b: 1, c: null };
const now = { a: "true", b: "1", c: "null" };

...

const result = ObjectDiff({ strict: false }).diff({ old, now });

// no diff.
console.log(result); // -> false

...

const result = ObjectDiff({ strict: true }).diff({ old, now });

if(result){
  // exist diff.
  console.log(result);
  // ->
  // {
  //   add: undefined,
  //   chg: { a: "true", b: "1", c: "null" },
  //   del: undefined,
  //   old: { a: true, b: 1, c: null },
  //   now: { a: "true", b: "1", c: "null" },
  // }
}
```

内部的に等号( `===` <-> `==` )を切り替えるだけです

```ts
if (strict) {
  return old === now;
} else {
  return old == now;
}
```

##### `ignore?`

テキスト比較で無視する要素のキーワード

- `@type string[]`
  - `"white-space"` 空白を無視
  - `"case-insensitive"` 小・大文字の区別を無視
  - `"new-line"` 改行を無視

###### `"white-space"`

全ての空白を無視

```ts
// [example.ts]

const old = { a: " a a a " };
const now = { a: "aaa" };

const result = ObjectDiff({ ignore: ["white-space"] }).diff({ old, now });

// no diff.
console.log(result); // -> false
```

##### `"case-insensitive"`

小文字・大文字の差異を無視

```ts
// [example.ts]
const old = { a: "aaabbbccc" };
const now = { a: "AAABBBCCC" };

const result = ObjectDiff({ ignore: ["case-insensitive"] }).diff({ old, now });

// no diff.
console.log(result); // -> false
```

###### `"new-line"`

全ての改行を無視

```ts
// [example.ts]

const old = { a: "aaa\nbbb\r\nbbb" };
const now = { a: "aaabbbccc" };

const result = ObjectDiff({ ignore: ["new-line"] }).diff({ old, now });

// no diff.
console.log(result); // -> false
```

### returns

差分比較関数を操作するオブジェクト

- `@type` `Controller`

## `ObjectDiff.Controller`

差分比較関数を操作するオブジェクト

### `.diff(args:{ old:any, now:any }) => Result`

差分を取る関数

```ts
const result = Controller.diff(args: {
  old: any,
  now: any,
});
```

#### `example`

```ts
const ctrl = ObjectDiff(options);

...

const result = ctrl.diff({ old, now });

if(result){
  console.log("exist diff.");
}else{
  console.log("no diff.");
}
```

#### `arguments`

- `@type {any} old` 比較する旧要素
- `@type {any} now` 比較する新要素

#### `returns`

比較結果のオブジェクト

- `@type {ObjectDiff.Result}`

## `ObjectDiff.Result`

```ts
const result: {
  add?: any;
  chg?: any;
  del?: any;
  old?: any;
  now?: any;
} = { ... };
```

### `properties`

- `@type {any} add?` 追加された要素
- `@type {any} chg?` 変更された要素
- `@type {any} del?` 削除された要素
- `@type {any} old?` 旧要素の内、変化がある要素
- `@type {any} now?` 新要素の内、変化がある要素

# history

- v1.0 new

# LICENSE

MIT

# Autor

(c) 2026 rksan
