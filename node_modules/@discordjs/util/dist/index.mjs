var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

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
export {
  isEquatable,
  isJSONEncodable,
  lazy,
  range
};
//# sourceMappingURL=index.mjs.map