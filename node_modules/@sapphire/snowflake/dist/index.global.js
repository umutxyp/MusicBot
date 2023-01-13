var SapphireSnowflake = (function (exports) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });

  // src/lib/Snowflake.ts
  var ProcessId = 1n;
  var WorkerId = 0n;
  var _increment, _epoch;
  var Snowflake = class {
    constructor(epoch) {
      __publicField(this, "decode", this.deconstruct);
      __privateAdd(this, _increment, 0n);
      __privateAdd(this, _epoch, void 0);
      __privateSet(this, _epoch, BigInt(epoch instanceof Date ? epoch.getTime() : epoch));
    }
    get epoch() {
      return __privateGet(this, _epoch);
    }
    generate({ increment, timestamp = Date.now(), workerId = WorkerId, processId = ProcessId } = {}) {
      if (timestamp instanceof Date)
        timestamp = BigInt(timestamp.getTime());
      else if (typeof timestamp === "number")
        timestamp = BigInt(timestamp);
      else if (typeof timestamp !== "bigint") {
        throw new TypeError(`"timestamp" argument must be a number, bigint, or Date (received ${typeof timestamp})`);
      }
      if (typeof increment === "bigint" && increment >= 4095n)
        increment = 0n;
      else {
        increment = __privateWrapper(this, _increment)._++;
        if (__privateGet(this, _increment) >= 4095n)
          __privateSet(this, _increment, 0n);
      }
      return timestamp - __privateGet(this, _epoch) << 22n | (workerId & 0b11111n) << 17n | (processId & 0b11111n) << 12n | increment;
    }
    deconstruct(id) {
      const bigIntId = BigInt(id);
      return {
        id: bigIntId,
        timestamp: (bigIntId >> 22n) + __privateGet(this, _epoch),
        workerId: bigIntId >> 17n & 0b11111n,
        processId: bigIntId >> 12n & 0b11111n,
        increment: bigIntId & 0b111111111111n,
        epoch: __privateGet(this, _epoch)
      };
    }
    timestampFrom(id) {
      return Number((BigInt(id) >> 22n) + __privateGet(this, _epoch));
    }
    static compare(a, b) {
      if (typeof a === "bigint" || typeof b === "bigint") {
        if (typeof a === "string")
          a = BigInt(a);
        else if (typeof b === "string")
          b = BigInt(b);
        return a === b ? 0 : a < b ? -1 : 1;
      }
      return a === b ? 0 : a.length < b.length ? -1 : a.length > b.length ? 1 : a < b ? -1 : 1;
    }
  };
  __name(Snowflake, "Snowflake");
  _increment = new WeakMap();
  _epoch = new WeakMap();

  // src/lib/DiscordSnowflake.ts
  var DiscordSnowflake = new Snowflake(1420070400000n);

  // src/lib/TwitterSnowflake.ts
  var TwitterSnowflake = new Snowflake(1288834974657n);

  exports.DiscordSnowflake = DiscordSnowflake;
  exports.Snowflake = Snowflake;
  exports.TwitterSnowflake = TwitterSnowflake;

  return exports;

})({});
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.global.js.map