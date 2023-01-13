"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  isEquatable: () => isEquatable,
  isJSONEncodable: () => isJSONEncodable,
  lazy: () => lazy,
  range: () => range
});
module.exports = __toCommonJS(src_exports);

// src/functions/lazy.ts
function lazy(cb) {
  let defaultValue;
  return () => defaultValue ??= cb();
}
__name(lazy, "lazy");

// src/functions/range.ts
function range(start, end, step = 1) {
  return Array.from({ length: (end - start) / step + 1 }, (_, index) => start + index * step);
}
__name(range, "range");

// src/JSONEncodable.ts
function isJSONEncodable(maybeEncodable) {
  return maybeEncodable !== null && typeof maybeEncodable === "object" && "toJSON" in maybeEncodable;
}
__name(isJSONEncodable, "isJSONEncodable");

// src/Equatable.ts
function isEquatable(maybeEquatable) {
  return maybeEquatable !== null && typeof maybeEquatable === "object" && "equals" in maybeEquatable;
}
__name(isEquatable, "isEquatable");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isEquatable,
  isJSONEncodable,
  lazy,
  range
});
//# sourceMappingURL=index.js.map