var xo = Object.defineProperty;
var to = (u) => {
  throw TypeError(u);
};
var No = (u, s, r) => s in u ? xo(u, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : u[s] = r;
var Wt = (u, s, r) => No(u, typeof s != "symbol" ? s + "" : s, r), ro = (u, s, r) => s.has(u) || to("Cannot " + r);
var ge = (u, s, r) => (ro(u, s, "read from private field"), r ? r.call(u) : s.get(u)), Gt = (u, s, r) => s.has(u) ? to("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(u) : s.set(u, r), Ht = (u, s, r, t) => (ro(u, s, "write to private field"), t ? t.call(u, r) : s.set(u, r), r);
const no = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Wo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class ce extends Error {
  constructor(r, t) {
    super(r);
    Wt(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(r) {
  }
  static fromCameraError(r) {
    if (this.logError(r), r instanceof ce)
      return r;
    let t;
    switch (r.name) {
      case "OverconstrainedError":
        t = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        t = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        t = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        t = "There is no camera available to you";
        break;
      default:
        t = "An unknown camera error has occurred";
        break;
    }
    return new ce(t, r);
  }
  static fromError(r) {
    if (this.logError(r), r instanceof ce)
      return r;
    const t = "An unexpected error has occurred";
    return new ce(t);
  }
}
const Uo = {
  RGB: "RGB",
  RGBA: "RGBA"
};
var $e, Xe, rt;
class zo {
  constructor(s, r) {
    Gt(this, $e);
    Gt(this, Xe);
    Gt(this, rt);
    Ht(this, $e, s), Ht(this, Xe, this.allocate(r.length * r.BYTES_PER_ELEMENT)), Ht(this, rt, this.allocate(r.length * r.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return ge(this, Xe);
  }
  get bgr0ImagePointer() {
    return ge(this, rt);
  }
  allocate(s) {
    return ge(this, $e)._malloc(s);
  }
  free() {
    ge(this, $e)._free(ge(this, Xe)), ge(this, $e)._free(ge(this, rt));
  }
  writeDataToMemory(s) {
    ge(this, $e).HEAPU8.set(s, ge(this, Xe));
  }
}
$e = new WeakMap(), Xe = new WeakMap(), rt = new WeakMap();
class Go {
  constructor() {
    Wt(this, "samWasmModule");
  }
  getOverriddenModules(s, r) {
    return {
      locateFile: (t) => new URL(r || t, s).href
    };
  }
  async handleMissingOrInvalidSamModule(s, r) {
    try {
      const t = await fetch(s);
      if (!t.ok)
        throw new ce(
          `The path to ${r} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${s}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new ce(
          `The provided ${r} is not a valid WASM module. Please check provided path to wasm files. Current path is ${s}`
        );
    } catch (t) {
      if (t instanceof ce)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Wo() ? no.simd : no.sam;
  }
  async initSamModule(s, r) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(r, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(s, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new ce("Could not init detector.");
    }
  }
  terminateSamModule() {
    var s;
    (s = this.samWasmModule) == null || s.terminate();
  }
  async getSamVersion() {
    var r;
    const s = await ((r = this.samWasmModule) == null ? void 0 : r.getInfoString());
    return s == null ? void 0 : s.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(s) {
    if (!this.samWasmModule)
      throw new ce("SAM WASM module is not initialized");
    const r = new zo(this.samWasmModule, s);
    return r.writeDataToMemory(s), r;
  }
  convertToSamColorImage(s, r) {
    if (!this.samWasmModule)
      throw new ce("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(s);
    return this.samWasmModule.convertToSamColorImage(
      r.width,
      r.height,
      t.rgbaImagePointer,
      Uo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
}
const Ho = (u) => Number.parseFloat(u.toFixed(3)), Bo = (u, s) => Math.min(u, s);
var Ke = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Oo = {}, oo = {}, Vo = Jo;
function Jo(u, s) {
  for (var r = new Array(arguments.length - 1), t = 0, e = 2, n = !0; e < arguments.length; )
    r[t++] = arguments[e++];
  return new Promise(function(a, d) {
    r[t] = function(y) {
      if (n)
        if (n = !1, y)
          d(y);
        else {
          for (var O = new Array(arguments.length - 1), S = 0; S < O.length; )
            O[S++] = arguments[S];
          a.apply(null, O);
        }
    };
    try {
      u.apply(s || null, r);
    } catch (y) {
      n && (n = !1, d(y));
    }
  });
}
var wo = {};
(function(u) {
  var s = u;
  s.length = function(a) {
    var d = a.length;
    if (!d)
      return 0;
    for (var y = 0; --d % 4 > 1 && a.charAt(d) === "="; )
      ++y;
    return Math.ceil(a.length * 3) / 4 - y;
  };
  for (var r = new Array(64), t = new Array(123), e = 0; e < 64; )
    t[r[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
  s.encode = function(a, d, y) {
    for (var O = null, S = [], A = 0, k = 0, $; d < y; ) {
      var Q = a[d++];
      switch (k) {
        case 0:
          S[A++] = r[Q >> 2], $ = (Q & 3) << 4, k = 1;
          break;
        case 1:
          S[A++] = r[$ | Q >> 4], $ = (Q & 15) << 2, k = 2;
          break;
        case 2:
          S[A++] = r[$ | Q >> 6], S[A++] = r[Q & 63], k = 0;
          break;
      }
      A > 8191 && ((O || (O = [])).push(String.fromCharCode.apply(String, S)), A = 0);
    }
    return k && (S[A++] = r[$], S[A++] = 61, k === 1 && (S[A++] = 61)), O ? (A && O.push(String.fromCharCode.apply(String, S.slice(0, A))), O.join("")) : String.fromCharCode.apply(String, S.slice(0, A));
  };
  var n = "invalid encoding";
  s.decode = function(a, d, y) {
    for (var O = y, S = 0, A, k = 0; k < a.length; ) {
      var $ = a.charCodeAt(k++);
      if ($ === 61 && S > 1)
        break;
      if (($ = t[$]) === void 0)
        throw Error(n);
      switch (S) {
        case 0:
          A = $, S = 1;
          break;
        case 1:
          d[y++] = A << 2 | ($ & 48) >> 4, A = $, S = 2;
          break;
        case 2:
          d[y++] = (A & 15) << 4 | ($ & 60) >> 2, A = $, S = 3;
          break;
        case 3:
          d[y++] = (A & 3) << 6 | $, S = 0;
          break;
      }
    }
    if (S === 1)
      throw Error(n);
    return y - O;
  }, s.test = function(a) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(a);
  };
})(wo);
var Yo = qt;
function qt() {
  this._listeners = {};
}
qt.prototype.on = function(u, s, r) {
  return (this._listeners[u] || (this._listeners[u] = [])).push({
    fn: s,
    ctx: r || this
  }), this;
};
qt.prototype.off = function(u, s) {
  if (u === void 0)
    this._listeners = {};
  else if (s === void 0)
    this._listeners[u] = [];
  else
    for (var r = this._listeners[u], t = 0; t < r.length; )
      r[t].fn === s ? r.splice(t, 1) : ++t;
  return this;
};
qt.prototype.emit = function(u) {
  var s = this._listeners[u];
  if (s) {
    for (var r = [], t = 1; t < arguments.length; )
      r.push(arguments[t++]);
    for (t = 0; t < s.length; )
      s[t].fn.apply(s[t++].ctx, r);
  }
  return this;
};
var Zo = io(io);
function io(u) {
  return typeof Float32Array < "u" ? function() {
    var s = new Float32Array([-0]), r = new Uint8Array(s.buffer), t = r[3] === 128;
    function e(y, O, S) {
      s[0] = y, O[S] = r[0], O[S + 1] = r[1], O[S + 2] = r[2], O[S + 3] = r[3];
    }
    function n(y, O, S) {
      s[0] = y, O[S] = r[3], O[S + 1] = r[2], O[S + 2] = r[1], O[S + 3] = r[0];
    }
    u.writeFloatLE = t ? e : n, u.writeFloatBE = t ? n : e;
    function a(y, O) {
      return r[0] = y[O], r[1] = y[O + 1], r[2] = y[O + 2], r[3] = y[O + 3], s[0];
    }
    function d(y, O) {
      return r[3] = y[O], r[2] = y[O + 1], r[1] = y[O + 2], r[0] = y[O + 3], s[0];
    }
    u.readFloatLE = t ? a : d, u.readFloatBE = t ? d : a;
  }() : function() {
    function s(t, e, n, a) {
      var d = e < 0 ? 1 : 0;
      if (d && (e = -e), e === 0)
        t(1 / e > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), n, a);
      else if (isNaN(e))
        t(2143289344, n, a);
      else if (e > 34028234663852886e22)
        t((d << 31 | 2139095040) >>> 0, n, a);
      else if (e < 11754943508222875e-54)
        t((d << 31 | Math.round(e / 1401298464324817e-60)) >>> 0, n, a);
      else {
        var y = Math.floor(Math.log(e) / Math.LN2), O = Math.round(e * Math.pow(2, -y) * 8388608) & 8388607;
        t((d << 31 | y + 127 << 23 | O) >>> 0, n, a);
      }
    }
    u.writeFloatLE = s.bind(null, ao), u.writeFloatBE = s.bind(null, so);
    function r(t, e, n) {
      var a = t(e, n), d = (a >> 31) * 2 + 1, y = a >>> 23 & 255, O = a & 8388607;
      return y === 255 ? O ? NaN : d * (1 / 0) : y === 0 ? d * 1401298464324817e-60 * O : d * Math.pow(2, y - 150) * (O + 8388608);
    }
    u.readFloatLE = r.bind(null, lo), u.readFloatBE = r.bind(null, co);
  }(), typeof Float64Array < "u" ? function() {
    var s = new Float64Array([-0]), r = new Uint8Array(s.buffer), t = r[7] === 128;
    function e(y, O, S) {
      s[0] = y, O[S] = r[0], O[S + 1] = r[1], O[S + 2] = r[2], O[S + 3] = r[3], O[S + 4] = r[4], O[S + 5] = r[5], O[S + 6] = r[6], O[S + 7] = r[7];
    }
    function n(y, O, S) {
      s[0] = y, O[S] = r[7], O[S + 1] = r[6], O[S + 2] = r[5], O[S + 3] = r[4], O[S + 4] = r[3], O[S + 5] = r[2], O[S + 6] = r[1], O[S + 7] = r[0];
    }
    u.writeDoubleLE = t ? e : n, u.writeDoubleBE = t ? n : e;
    function a(y, O) {
      return r[0] = y[O], r[1] = y[O + 1], r[2] = y[O + 2], r[3] = y[O + 3], r[4] = y[O + 4], r[5] = y[O + 5], r[6] = y[O + 6], r[7] = y[O + 7], s[0];
    }
    function d(y, O) {
      return r[7] = y[O], r[6] = y[O + 1], r[5] = y[O + 2], r[4] = y[O + 3], r[3] = y[O + 4], r[2] = y[O + 5], r[1] = y[O + 6], r[0] = y[O + 7], s[0];
    }
    u.readDoubleLE = t ? a : d, u.readDoubleBE = t ? d : a;
  }() : function() {
    function s(t, e, n, a, d, y) {
      var O = a < 0 ? 1 : 0;
      if (O && (a = -a), a === 0)
        t(0, d, y + e), t(1 / a > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), d, y + n);
      else if (isNaN(a))
        t(0, d, y + e), t(2146959360, d, y + n);
      else if (a > 17976931348623157e292)
        t(0, d, y + e), t((O << 31 | 2146435072) >>> 0, d, y + n);
      else {
        var S;
        if (a < 22250738585072014e-324)
          S = a / 5e-324, t(S >>> 0, d, y + e), t((O << 31 | S / 4294967296) >>> 0, d, y + n);
        else {
          var A = Math.floor(Math.log(a) / Math.LN2);
          A === 1024 && (A = 1023), S = a * Math.pow(2, -A), t(S * 4503599627370496 >>> 0, d, y + e), t((O << 31 | A + 1023 << 20 | S * 1048576 & 1048575) >>> 0, d, y + n);
        }
      }
    }
    u.writeDoubleLE = s.bind(null, ao, 0, 4), u.writeDoubleBE = s.bind(null, so, 4, 0);
    function r(t, e, n, a, d) {
      var y = t(a, d + e), O = t(a, d + n), S = (O >> 31) * 2 + 1, A = O >>> 20 & 2047, k = 4294967296 * (O & 1048575) + y;
      return A === 2047 ? k ? NaN : S * (1 / 0) : A === 0 ? S * 5e-324 * k : S * Math.pow(2, A - 1075) * (k + 4503599627370496);
    }
    u.readDoubleLE = r.bind(null, lo, 0, 4), u.readDoubleBE = r.bind(null, co, 4, 0);
  }(), u;
}
function ao(u, s, r) {
  s[r] = u & 255, s[r + 1] = u >>> 8 & 255, s[r + 2] = u >>> 16 & 255, s[r + 3] = u >>> 24;
}
function so(u, s, r) {
  s[r] = u >>> 24, s[r + 1] = u >>> 16 & 255, s[r + 2] = u >>> 8 & 255, s[r + 3] = u & 255;
}
function lo(u, s) {
  return (u[s] | u[s + 1] << 8 | u[s + 2] << 16 | u[s + 3] << 24) >>> 0;
}
function co(u, s) {
  return (u[s] << 24 | u[s + 1] << 16 | u[s + 2] << 8 | u[s + 3]) >>> 0;
}
function uo(u) {
  throw new Error('Could not dynamically require "' + u + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Ko = qo;
function qo(u) {
  try {
    if (typeof uo != "function")
      return null;
    var s = uo(u);
    return s && (s.length || Object.keys(s).length) ? s : null;
  } catch {
    return null;
  }
}
var Po = {};
(function(u) {
  var s = u;
  s.length = function(r) {
    for (var t = 0, e = 0, n = 0; n < r.length; ++n)
      e = r.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (r.charCodeAt(n + 1) & 64512) === 56320 ? (++n, t += 4) : t += 3;
    return t;
  }, s.read = function(r, t, e) {
    var n = e - t;
    if (n < 1)
      return "";
    for (var a = null, d = [], y = 0, O; t < e; )
      O = r[t++], O < 128 ? d[y++] = O : O > 191 && O < 224 ? d[y++] = (O & 31) << 6 | r[t++] & 63 : O > 239 && O < 365 ? (O = ((O & 7) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, d[y++] = 55296 + (O >> 10), d[y++] = 56320 + (O & 1023)) : d[y++] = (O & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63, y > 8191 && ((a || (a = [])).push(String.fromCharCode.apply(String, d)), y = 0);
    return a ? (y && a.push(String.fromCharCode.apply(String, d.slice(0, y))), a.join("")) : String.fromCharCode.apply(String, d.slice(0, y));
  }, s.write = function(r, t, e) {
    for (var n = e, a, d, y = 0; y < r.length; ++y)
      a = r.charCodeAt(y), a < 128 ? t[e++] = a : a < 2048 ? (t[e++] = a >> 6 | 192, t[e++] = a & 63 | 128) : (a & 64512) === 55296 && ((d = r.charCodeAt(y + 1)) & 64512) === 56320 ? (a = 65536 + ((a & 1023) << 10) + (d & 1023), ++y, t[e++] = a >> 18 | 240, t[e++] = a >> 12 & 63 | 128, t[e++] = a >> 6 & 63 | 128, t[e++] = a & 63 | 128) : (t[e++] = a >> 12 | 224, t[e++] = a >> 6 & 63 | 128, t[e++] = a & 63 | 128);
    return e - n;
  };
})(Po);
var Xo = Qo;
function Qo(u, s, r) {
  var t = r || 8192, e = t >>> 1, n = null, a = t;
  return function(d) {
    if (d < 1 || d > e)
      return u(d);
    a + d > t && (n = u(t), a = 0);
    var y = s.call(n, a, a += d);
    return a & 7 && (a = (a | 7) + 1), y;
  };
}
var Un, fo;
function ei() {
  if (fo)
    return Un;
  fo = 1, Un = s;
  var u = et();
  function s(n, a) {
    this.lo = n >>> 0, this.hi = a >>> 0;
  }
  var r = s.zero = new s(0, 0);
  r.toNumber = function() {
    return 0;
  }, r.zzEncode = r.zzDecode = function() {
    return this;
  }, r.length = function() {
    return 1;
  };
  var t = s.zeroHash = "\0\0\0\0\0\0\0\0";
  s.fromNumber = function(n) {
    if (n === 0)
      return r;
    var a = n < 0;
    a && (n = -n);
    var d = n >>> 0, y = (n - d) / 4294967296 >>> 0;
    return a && (y = ~y >>> 0, d = ~d >>> 0, ++d > 4294967295 && (d = 0, ++y > 4294967295 && (y = 0))), new s(d, y);
  }, s.from = function(n) {
    if (typeof n == "number")
      return s.fromNumber(n);
    if (u.isString(n))
      if (u.Long)
        n = u.Long.fromString(n);
      else
        return s.fromNumber(parseInt(n, 10));
    return n.low || n.high ? new s(n.low >>> 0, n.high >>> 0) : r;
  }, s.prototype.toNumber = function(n) {
    if (!n && this.hi >>> 31) {
      var a = ~this.lo + 1 >>> 0, d = ~this.hi >>> 0;
      return a || (d = d + 1 >>> 0), -(a + d * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, s.prototype.toLong = function(n) {
    return u.Long ? new u.Long(this.lo | 0, this.hi | 0, !!n) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!n };
  };
  var e = String.prototype.charCodeAt;
  return s.fromHash = function(n) {
    return n === t ? r : new s(
      (e.call(n, 0) | e.call(n, 1) << 8 | e.call(n, 2) << 16 | e.call(n, 3) << 24) >>> 0,
      (e.call(n, 4) | e.call(n, 5) << 8 | e.call(n, 6) << 16 | e.call(n, 7) << 24) >>> 0
    );
  }, s.prototype.toHash = function() {
    return String.fromCharCode(
      this.lo & 255,
      this.lo >>> 8 & 255,
      this.lo >>> 16 & 255,
      this.lo >>> 24,
      this.hi & 255,
      this.hi >>> 8 & 255,
      this.hi >>> 16 & 255,
      this.hi >>> 24
    );
  }, s.prototype.zzEncode = function() {
    var n = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ n) >>> 0, this.lo = (this.lo << 1 ^ n) >>> 0, this;
  }, s.prototype.zzDecode = function() {
    var n = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ n) >>> 0, this.hi = (this.hi >>> 1 ^ n) >>> 0, this;
  }, s.prototype.length = function() {
    var n = this.lo, a = (this.lo >>> 28 | this.hi << 4) >>> 0, d = this.hi >>> 24;
    return d === 0 ? a === 0 ? n < 16384 ? n < 128 ? 1 : 2 : n < 2097152 ? 3 : 4 : a < 16384 ? a < 128 ? 5 : 6 : a < 2097152 ? 7 : 8 : d < 128 ? 9 : 10;
  }, Un;
}
var po;
function et() {
  return po || (po = 1, function(u) {
    var s = u;
    s.asPromise = Vo, s.base64 = wo, s.EventEmitter = Yo, s.float = Zo, s.inquire = Ko, s.utf8 = Po, s.pool = Xo, s.LongBits = ei(), s.isNode = !!(typeof Ke < "u" && Ke && Ke.process && Ke.process.versions && Ke.process.versions.node), s.global = s.isNode && Ke || typeof window < "u" && window || typeof self < "u" && self || Ke, s.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), s.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), s.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, s.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, s.isObject = function(e) {
      return e && typeof e == "object";
    }, s.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    s.isSet = function(e, n) {
      var a = e[n];
      return a != null && e.hasOwnProperty(n) ? typeof a != "object" || (Array.isArray(a) ? a.length : Object.keys(a).length) > 0 : !1;
    }, s.Buffer = function() {
      try {
        var e = s.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), s._Buffer_from = null, s._Buffer_allocUnsafe = null, s.newBuffer = function(e) {
      return typeof e == "number" ? s.Buffer ? s._Buffer_allocUnsafe(e) : new s.Array(e) : s.Buffer ? s._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, s.Array = typeof Uint8Array < "u" ? Uint8Array : Array, s.Long = /* istanbul ignore next */
    s.global.dcodeIO && /* istanbul ignore next */
    s.global.dcodeIO.Long || /* istanbul ignore next */
    s.global.Long || s.inquire("long"), s.key2Re = /^true|false|0|1$/, s.key32Re = /^-?(?:0|[1-9][0-9]*)$/, s.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, s.longToHash = function(e) {
      return e ? s.LongBits.from(e).toHash() : s.LongBits.zeroHash;
    }, s.longFromHash = function(e, n) {
      var a = s.LongBits.fromHash(e);
      return s.Long ? s.Long.fromBits(a.lo, a.hi, n) : a.toNumber(!!n);
    };
    function r(e, n, a) {
      for (var d = Object.keys(n), y = 0; y < d.length; ++y)
        (e[d[y]] === void 0 || !a) && (e[d[y]] = n[d[y]]);
      return e;
    }
    s.merge = r, s.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function n(a, d) {
        if (!(this instanceof n))
          return new n(a, d);
        Object.defineProperty(this, "message", { get: function() {
          return a;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, n) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), d && r(this, d);
      }
      return n.prototype = Object.create(Error.prototype, {
        constructor: {
          value: n,
          writable: !0,
          enumerable: !1,
          configurable: !0
        },
        name: {
          get: function() {
            return e;
          },
          set: void 0,
          enumerable: !1,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: !0
        },
        toString: {
          value: function() {
            return this.name + ": " + this.message;
          },
          writable: !0,
          enumerable: !1,
          configurable: !0
        }
      }), n;
    }
    s.newError = t, s.ProtocolError = t("ProtocolError"), s.oneOfGetter = function(e) {
      for (var n = {}, a = 0; a < e.length; ++a)
        n[e[a]] = 1;
      return function() {
        for (var d = Object.keys(this), y = d.length - 1; y > -1; --y)
          if (n[d[y]] === 1 && this[d[y]] !== void 0 && this[d[y]] !== null)
            return d[y];
      };
    }, s.oneOfSetter = function(e) {
      return function(n) {
        for (var a = 0; a < e.length; ++a)
          e[a] !== n && delete this[e[a]];
      };
    }, s.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, s._configure = function() {
      var e = s.Buffer;
      if (!e) {
        s._Buffer_from = s._Buffer_allocUnsafe = null;
        return;
      }
      s._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(n, a) {
        return new e(n, a);
      }, s._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(n) {
        return new e(n);
      };
    };
  }(oo)), oo;
}
var Co = L, ue = et(), Bn, Xt = ue.LongBits, mo = ue.base64, ho = ue.utf8;
function zt(u, s, r) {
  this.fn = u, this.len = s, this.next = void 0, this.val = r;
}
function Zn() {
}
function ti(u) {
  this.head = u.head, this.tail = u.tail, this.len = u.len, this.next = u.states;
}
function L() {
  this.len = 0, this.head = new zt(Zn, 0, 0), this.tail = this.head, this.states = null;
}
var So = function() {
  return ue.Buffer ? function() {
    return (L.create = function() {
      return new Bn();
    })();
  } : function() {
    return new L();
  };
};
L.create = So();
L.alloc = function(u) {
  return new ue.Array(u);
};
ue.Array !== Array && (L.alloc = ue.pool(L.alloc, ue.Array.prototype.subarray));
L.prototype._push = function(u, s, r) {
  return this.tail = this.tail.next = new zt(u, s, r), this.len += s, this;
};
function Kn(u, s, r) {
  s[r] = u & 255;
}
function ri(u, s, r) {
  for (; u > 127; )
    s[r++] = u & 127 | 128, u >>>= 7;
  s[r] = u;
}
function qn(u, s) {
  this.len = u, this.next = void 0, this.val = s;
}
qn.prototype = Object.create(zt.prototype);
qn.prototype.fn = ri;
L.prototype.uint32 = function(u) {
  return this.len += (this.tail = this.tail.next = new qn(
    (u = u >>> 0) < 128 ? 1 : u < 16384 ? 2 : u < 2097152 ? 3 : u < 268435456 ? 4 : 5,
    u
  )).len, this;
};
L.prototype.int32 = function(u) {
  return u < 0 ? this._push(Xn, 10, Xt.fromNumber(u)) : this.uint32(u);
};
L.prototype.sint32 = function(u) {
  return this.uint32((u << 1 ^ u >> 31) >>> 0);
};
function Xn(u, s, r) {
  for (; u.hi; )
    s[r++] = u.lo & 127 | 128, u.lo = (u.lo >>> 7 | u.hi << 25) >>> 0, u.hi >>>= 7;
  for (; u.lo > 127; )
    s[r++] = u.lo & 127 | 128, u.lo = u.lo >>> 7;
  s[r++] = u.lo;
}
L.prototype.uint64 = function(u) {
  var s = Xt.from(u);
  return this._push(Xn, s.length(), s);
};
L.prototype.int64 = L.prototype.uint64;
L.prototype.sint64 = function(u) {
  var s = Xt.from(u).zzEncode();
  return this._push(Xn, s.length(), s);
};
L.prototype.bool = function(u) {
  return this._push(Kn, 1, u ? 1 : 0);
};
function Vn(u, s, r) {
  s[r] = u & 255, s[r + 1] = u >>> 8 & 255, s[r + 2] = u >>> 16 & 255, s[r + 3] = u >>> 24;
}
L.prototype.fixed32 = function(u) {
  return this._push(Vn, 4, u >>> 0);
};
L.prototype.sfixed32 = L.prototype.fixed32;
L.prototype.fixed64 = function(u) {
  var s = Xt.from(u);
  return this._push(Vn, 4, s.lo)._push(Vn, 4, s.hi);
};
L.prototype.sfixed64 = L.prototype.fixed64;
L.prototype.float = function(u) {
  return this._push(ue.float.writeFloatLE, 4, u);
};
L.prototype.double = function(u) {
  return this._push(ue.float.writeDoubleLE, 8, u);
};
var ni = ue.Array.prototype.set ? function(u, s, r) {
  s.set(u, r);
} : function(u, s, r) {
  for (var t = 0; t < u.length; ++t)
    s[r + t] = u[t];
};
L.prototype.bytes = function(u) {
  var s = u.length >>> 0;
  if (!s)
    return this._push(Kn, 1, 0);
  if (ue.isString(u)) {
    var r = L.alloc(s = mo.length(u));
    mo.decode(u, r, 0), u = r;
  }
  return this.uint32(s)._push(ni, s, u);
};
L.prototype.string = function(u) {
  var s = ho.length(u);
  return s ? this.uint32(s)._push(ho.write, s, u) : this._push(Kn, 1, 0);
};
L.prototype.fork = function() {
  return this.states = new ti(this), this.head = this.tail = new zt(Zn, 0, 0), this.len = 0, this;
};
L.prototype.reset = function() {
  return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new zt(Zn, 0, 0), this.len = 0), this;
};
L.prototype.ldelim = function() {
  var u = this.head, s = this.tail, r = this.len;
  return this.reset().uint32(r), r && (this.tail.next = u.next, this.tail = s, this.len += r), this;
};
L.prototype.finish = function() {
  for (var u = this.head.next, s = this.constructor.alloc(this.len), r = 0; u; )
    u.fn(u.val, s, r), r += u.len, u = u.next;
  return s;
};
L._configure = function(u) {
  Bn = u, L.create = So(), Bn._configure();
};
var oi = be, Io = Co;
(be.prototype = Object.create(Io.prototype)).constructor = be;
var xe = et();
function be() {
  Io.call(this);
}
be._configure = function() {
  be.alloc = xe._Buffer_allocUnsafe, be.writeBytesBuffer = xe.Buffer && xe.Buffer.prototype instanceof Uint8Array && xe.Buffer.prototype.set.name === "set" ? function(u, s, r) {
    s.set(u, r);
  } : function(u, s, r) {
    if (u.copy)
      u.copy(s, r, 0, u.length);
    else
      for (var t = 0; t < u.length; )
        s[r++] = u[t++];
  };
};
be.prototype.bytes = function(u) {
  xe.isString(u) && (u = xe._Buffer_from(u, "base64"));
  var s = u.length >>> 0;
  return this.uint32(s), s && this._push(be.writeBytesBuffer, s, u), this;
};
function ii(u, s, r) {
  u.length < 40 ? xe.utf8.write(u, s, r) : s.utf8Write ? s.utf8Write(u, r) : s.write(u, r);
}
be.prototype.string = function(u) {
  var s = xe.Buffer.byteLength(u);
  return this.uint32(s), s && this._push(ii, s, u), this;
};
be._configure();
var jo = B, ve = et(), Jn, To = ve.LongBits, ai = ve.utf8;
function ye(u, s) {
  return RangeError("index out of range: " + u.pos + " + " + (s || 1) + " > " + u.len);
}
function B(u) {
  this.buf = u, this.pos = 0, this.len = u.length;
}
var yo = typeof Uint8Array < "u" ? function(u) {
  if (u instanceof Uint8Array || Array.isArray(u))
    return new B(u);
  throw Error("illegal buffer");
} : function(u) {
  if (Array.isArray(u))
    return new B(u);
  throw Error("illegal buffer");
}, Ao = function() {
  return ve.Buffer ? function(u) {
    return (B.create = function(s) {
      return ve.Buffer.isBuffer(s) ? new Jn(s) : yo(s);
    })(u);
  } : yo;
};
B.create = Ao();
B.prototype._slice = ve.Array.prototype.subarray || /* istanbul ignore next */
ve.Array.prototype.slice;
B.prototype.uint32 = /* @__PURE__ */ function() {
  var u = 4294967295;
  return function() {
    if (u = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (u = (u | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (u = (u | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (u = (u | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (u = (u | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128))
      return u;
    if ((this.pos += 5) > this.len)
      throw this.pos = this.len, ye(this, 10);
    return u;
  };
}();
B.prototype.int32 = function() {
  return this.uint32() | 0;
};
B.prototype.sint32 = function() {
  var u = this.uint32();
  return u >>> 1 ^ -(u & 1) | 0;
};
function zn() {
  var u = new To(0, 0), s = 0;
  if (this.len - this.pos > 4) {
    for (; s < 4; ++s)
      if (u.lo = (u.lo | (this.buf[this.pos] & 127) << s * 7) >>> 0, this.buf[this.pos++] < 128)
        return u;
    if (u.lo = (u.lo | (this.buf[this.pos] & 127) << 28) >>> 0, u.hi = (u.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
      return u;
    s = 0;
  } else {
    for (; s < 3; ++s) {
      if (this.pos >= this.len)
        throw ye(this);
      if (u.lo = (u.lo | (this.buf[this.pos] & 127) << s * 7) >>> 0, this.buf[this.pos++] < 128)
        return u;
    }
    return u.lo = (u.lo | (this.buf[this.pos++] & 127) << s * 7) >>> 0, u;
  }
  if (this.len - this.pos > 4) {
    for (; s < 5; ++s)
      if (u.hi = (u.hi | (this.buf[this.pos] & 127) << s * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
        return u;
  } else
    for (; s < 5; ++s) {
      if (this.pos >= this.len)
        throw ye(this);
      if (u.hi = (u.hi | (this.buf[this.pos] & 127) << s * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
        return u;
    }
  throw Error("invalid varint encoding");
}
B.prototype.bool = function() {
  return this.uint32() !== 0;
};
function Jt(u, s) {
  return (u[s - 4] | u[s - 3] << 8 | u[s - 2] << 16 | u[s - 1] << 24) >>> 0;
}
B.prototype.fixed32 = function() {
  if (this.pos + 4 > this.len)
    throw ye(this, 4);
  return Jt(this.buf, this.pos += 4);
};
B.prototype.sfixed32 = function() {
  if (this.pos + 4 > this.len)
    throw ye(this, 4);
  return Jt(this.buf, this.pos += 4) | 0;
};
function go() {
  if (this.pos + 8 > this.len)
    throw ye(this, 8);
  return new To(Jt(this.buf, this.pos += 4), Jt(this.buf, this.pos += 4));
}
B.prototype.float = function() {
  if (this.pos + 4 > this.len)
    throw ye(this, 4);
  var u = ve.float.readFloatLE(this.buf, this.pos);
  return this.pos += 4, u;
};
B.prototype.double = function() {
  if (this.pos + 8 > this.len)
    throw ye(this, 4);
  var u = ve.float.readDoubleLE(this.buf, this.pos);
  return this.pos += 8, u;
};
B.prototype.bytes = function() {
  var u = this.uint32(), s = this.pos, r = this.pos + u;
  if (r > this.len)
    throw ye(this, u);
  return this.pos += u, Array.isArray(this.buf) ? this.buf.slice(s, r) : s === r ? new this.buf.constructor(0) : this._slice.call(this.buf, s, r);
};
B.prototype.string = function() {
  var u = this.bytes();
  return ai.read(u, 0, u.length);
};
B.prototype.skip = function(u) {
  if (typeof u == "number") {
    if (this.pos + u > this.len)
      throw ye(this, u);
    this.pos += u;
  } else
    do
      if (this.pos >= this.len)
        throw ye(this);
    while (this.buf[this.pos++] & 128);
  return this;
};
B.prototype.skipType = function(u) {
  switch (u) {
    case 0:
      this.skip();
      break;
    case 1:
      this.skip(8);
      break;
    case 2:
      this.skip(this.uint32());
      break;
    case 3:
      for (; (u = this.uint32() & 7) !== 4; )
        this.skipType(u);
      break;
    case 5:
      this.skip(4);
      break;
    default:
      throw Error("invalid wire type " + u + " at offset " + this.pos);
  }
  return this;
};
B._configure = function(u) {
  Jn = u, B.create = Ao(), Jn._configure();
  var s = ve.Long ? "toLong" : (
    /* istanbul ignore next */
    "toNumber"
  );
  ve.merge(B.prototype, {
    int64: function() {
      return zn.call(this)[s](!1);
    },
    uint64: function() {
      return zn.call(this)[s](!0);
    },
    sint64: function() {
      return zn.call(this).zzDecode()[s](!1);
    },
    fixed64: function() {
      return go.call(this)[s](!0);
    },
    sfixed64: function() {
      return go.call(this)[s](!1);
    }
  });
};
var si = Qe, Do = jo;
(Qe.prototype = Object.create(Do.prototype)).constructor = Qe;
var bo = et();
function Qe(u) {
  Do.call(this, u);
}
Qe._configure = function() {
  bo.Buffer && (Qe.prototype._slice = bo.Buffer.prototype.slice);
};
Qe.prototype.string = function() {
  var u = this.uint32();
  return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + u, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + u, this.len));
};
Qe._configure();
var _o = {}, li = Ut, Qn = et();
(Ut.prototype = Object.create(Qn.EventEmitter.prototype)).constructor = Ut;
function Ut(u, s, r) {
  if (typeof u != "function")
    throw TypeError("rpcImpl must be a function");
  Qn.EventEmitter.call(this), this.rpcImpl = u, this.requestDelimited = !!s, this.responseDelimited = !!r;
}
Ut.prototype.rpcCall = function u(s, r, t, e, n) {
  if (!e)
    throw TypeError("request must be specified");
  var a = this;
  if (!n)
    return Qn.asPromise(u, a, s, r, t, e);
  if (!a.rpcImpl) {
    setTimeout(function() {
      n(Error("already ended"));
    }, 0);
    return;
  }
  try {
    return a.rpcImpl(
      s,
      r[a.requestDelimited ? "encodeDelimited" : "encode"](e).finish(),
      function(d, y) {
        if (d)
          return a.emit("error", d, s), n(d);
        if (y === null) {
          a.end(
            /* endedByRPC */
            !0
          );
          return;
        }
        if (!(y instanceof t))
          try {
            y = t[a.responseDelimited ? "decodeDelimited" : "decode"](y);
          } catch (O) {
            return a.emit("error", O, s), n(O);
          }
        return a.emit("data", y, s), n(null, y);
      }
    );
  } catch (d) {
    a.emit("error", d, s), setTimeout(function() {
      n(d);
    }, 0);
    return;
  }
};
Ut.prototype.end = function(u) {
  return this.rpcImpl && (u || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
};
(function(u) {
  var s = u;
  s.Service = li;
})(_o);
var ci = {};
(function(u) {
  var s = u;
  s.build = "minimal", s.Writer = Co, s.BufferWriter = oi, s.Reader = jo, s.BufferReader = si, s.util = et(), s.rpc = _o, s.roots = ci, s.configure = r;
  function r() {
    s.util._configure(), s.Writer._configure(s.BufferWriter), s.Reader._configure(s.BufferReader);
  }
  r();
})(Oo);
var E = Oo;
const v = E.Reader, R = E.Writer, m = E.util, c = E.roots.default || (E.roots.default = {});
c.dot = (() => {
  const u = {};
  return u.Content = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.token = m.newBuffer([]), s.prototype.iv = m.newBuffer([]), s.prototype.schemaVersion = 0, s.prototype.bytes = m.newBuffer([]), s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = R.create()), r.token != null && Object.hasOwnProperty.call(r, "token") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.token), r.iv != null && Object.hasOwnProperty.call(r, "iv") && t.uint32(
        /* id 2, wireType 2 =*/
        18
      ).bytes(r.iv), r.schemaVersion != null && Object.hasOwnProperty.call(r, "schemaVersion") && t.uint32(
        /* id 3, wireType 0 =*/
        24
      ).int32(r.schemaVersion), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 4, wireType 2 =*/
        34
      ).bytes(r.bytes), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t) {
      r instanceof v || (r = v.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new c.dot.Content();
      for (; r.pos < e; ) {
        let a = r.uint32();
        switch (a >>> 3) {
          case 1: {
            n.token = r.bytes();
            break;
          }
          case 2: {
            n.iv = r.bytes();
            break;
          }
          case 3: {
            n.schemaVersion = r.int32();
            break;
          }
          case 4: {
            n.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(a & 7);
            break;
        }
      }
      return n;
    }, s.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.token != null && r.hasOwnProperty("token") && !(r.token && typeof r.token.length == "number" || m.isString(r.token)) ? "token: buffer expected" : r.iv != null && r.hasOwnProperty("iv") && !(r.iv && typeof r.iv.length == "number" || m.isString(r.iv)) ? "iv: buffer expected" : r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && !m.isInteger(r.schemaVersion) ? "schemaVersion: integer expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || m.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof c.dot.Content)
        return r;
      let t = new c.dot.Content();
      return r.token != null && (typeof r.token == "string" ? m.base64.decode(r.token, t.token = m.newBuffer(m.base64.length(r.token)), 0) : r.token.length >= 0 && (t.token = r.token)), r.iv != null && (typeof r.iv == "string" ? m.base64.decode(r.iv, t.iv = m.newBuffer(m.base64.length(r.iv)), 0) : r.iv.length >= 0 && (t.iv = r.iv)), r.schemaVersion != null && (t.schemaVersion = r.schemaVersion | 0), r.bytes != null && (typeof r.bytes == "string" ? m.base64.decode(r.bytes, t.bytes = m.newBuffer(m.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = m.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = m.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = m.newBuffer(e.bytes)))), r.token != null && r.hasOwnProperty("token") && (e.token = t.bytes === String ? m.base64.encode(r.token, 0, r.token.length) : t.bytes === Array ? Array.prototype.slice.call(r.token) : r.token), r.iv != null && r.hasOwnProperty("iv") && (e.iv = t.bytes === String ? m.base64.encode(r.iv, 0, r.iv.length) : t.bytes === Array ? Array.prototype.slice.call(r.iv) : r.iv), r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && (e.schemaVersion = r.schemaVersion), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? m.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Content";
    }, s;
  }(), u.v4 = function() {
    const s = {};
    return s.MagnifEyeLivenessContent = function() {
      function r(t) {
        if (this.images = [], t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.images = m.emptyArray, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        if (e || (e = R.create()), t.images != null && t.images.length)
          for (let n = 0; n < t.images.length; ++n)
            c.dot.Image.encode(t.images[n], e.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.MagnifEyeLivenessContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.images && a.images.length || (a.images = []), a.images.push(c.dot.Image.decode(t, t.uint32()));
              break;
            }
            case 2: {
              a.metadata = c.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.images != null && t.hasOwnProperty("images")) {
          if (!Array.isArray(t.images))
            return "images: array expected";
          for (let e = 0; e < t.images.length; ++e) {
            let n = c.dot.Image.verify(t.images[e]);
            if (n)
              return "images." + n;
          }
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = c.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.MagnifEyeLivenessContent)
          return t;
        let e = new c.dot.v4.MagnifEyeLivenessContent();
        if (t.images) {
          if (!Array.isArray(t.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          e.images = [];
          for (let n = 0; n < t.images.length; ++n) {
            if (typeof t.images[n] != "object")
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            e.images[n] = c.dot.Image.fromObject(t.images[n]);
          }
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          e.metadata = c.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if ((e.arrays || e.defaults) && (n.images = []), e.defaults && (n.metadata = null), t.images && t.images.length) {
          n.images = [];
          for (let a = 0; a < t.images.length; ++a)
            n.images[a] = c.dot.Image.toObject(t.images[a], e);
        }
        return t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = c.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MagnifEyeLivenessContent";
      }, r;
    }(), s.Metadata = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.platform = 0, r.prototype.sessionToken = null, r.prototype.componentVersion = "", r.prototype.web = null, r.prototype.android = null, r.prototype.ios = null;
      let t;
      return Object.defineProperty(r.prototype, "_sessionToken", {
        get: m.oneOfGetter(t = ["sessionToken"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "metadata", {
        get: m.oneOfGetter(t = ["web", "android", "ios"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && c.dot.v4.WebMetadata.encode(e.web, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && c.dot.v4.AndroidMetadata.encode(e.android, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && c.dot.v4.IosMetadata.encode(e.ios, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.sessionToken != null && Object.hasOwnProperty.call(e, "sessionToken") && n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.sessionToken), e.componentVersion != null && Object.hasOwnProperty.call(e, "componentVersion") && n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).string(e.componentVersion), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.Metadata();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.platform = e.int32();
              break;
            }
            case 5: {
              d.sessionToken = e.string();
              break;
            }
            case 6: {
              d.componentVersion = e.string();
              break;
            }
            case 2: {
              d.web = c.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.android = c.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              d.ios = c.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let n = {};
        if (e.platform != null && e.hasOwnProperty("platform"))
          switch (e.platform) {
            default:
              return "platform: enum value expected";
            case 0:
            case 1:
            case 2:
              break;
          }
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (n._sessionToken = 1, !m.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !m.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && e.hasOwnProperty("web")) {
          n.metadata = 1;
          {
            let a = c.dot.v4.WebMetadata.verify(e.web);
            if (a)
              return "web." + a;
          }
        }
        if (e.android != null && e.hasOwnProperty("android")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let a = c.dot.v4.AndroidMetadata.verify(e.android);
            if (a)
              return "android." + a;
          }
        }
        if (e.ios != null && e.hasOwnProperty("ios")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let a = c.dot.v4.IosMetadata.verify(e.ios);
            if (a)
              return "ios." + a;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.Metadata)
          return e;
        let n = new c.dot.v4.Metadata();
        switch (e.platform) {
          default:
            if (typeof e.platform == "number") {
              n.platform = e.platform;
              break;
            }
            break;
          case "WEB":
          case 0:
            n.platform = 0;
            break;
          case "ANDROID":
          case 1:
            n.platform = 1;
            break;
          case "IOS":
          case 2:
            n.platform = 2;
            break;
        }
        if (e.sessionToken != null && (n.sessionToken = String(e.sessionToken)), e.componentVersion != null && (n.componentVersion = String(e.componentVersion)), e.web != null) {
          if (typeof e.web != "object")
            throw TypeError(".dot.v4.Metadata.web: object expected");
          n.web = c.dot.v4.WebMetadata.fromObject(e.web);
        }
        if (e.android != null) {
          if (typeof e.android != "object")
            throw TypeError(".dot.v4.Metadata.android: object expected");
          n.android = c.dot.v4.AndroidMetadata.fromObject(e.android);
        }
        if (e.ios != null) {
          if (typeof e.ios != "object")
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          n.ios = c.dot.v4.IosMetadata.fromObject(e.ios);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return n.defaults && (a.platform = n.enums === String ? "WEB" : 0, a.componentVersion = ""), e.platform != null && e.hasOwnProperty("platform") && (a.platform = n.enums === String ? c.dot.Platform[e.platform] === void 0 ? e.platform : c.dot.Platform[e.platform] : e.platform), e.web != null && e.hasOwnProperty("web") && (a.web = c.dot.v4.WebMetadata.toObject(e.web, n), n.oneofs && (a.metadata = "web")), e.android != null && e.hasOwnProperty("android") && (a.android = c.dot.v4.AndroidMetadata.toObject(e.android, n), n.oneofs && (a.metadata = "android")), e.ios != null && e.hasOwnProperty("ios") && (a.ios = c.dot.v4.IosMetadata.toObject(e.ios, n), n.oneofs && (a.metadata = "ios")), e.sessionToken != null && e.hasOwnProperty("sessionToken") && (a.sessionToken = e.sessionToken, n.oneofs && (a._sessionToken = "sessionToken")), e.componentVersion != null && e.hasOwnProperty("componentVersion") && (a.componentVersion = e.componentVersion), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, r;
    }(), s.AndroidMetadata = function() {
      function r(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.supportedAbis = m.emptyArray, r.prototype.device = null, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = m.emptyArray, r.prototype.digestsWithTimestamp = m.emptyArray, r.prototype.dynamicCameraFrameProperties = m.emptyObject, r.prototype.tamperingIndicators = null, r.prototype.croppedYuv420Image = null;
      let t;
      return Object.defineProperty(r.prototype, "_device", {
        get: m.oneOfGetter(t = ["device"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_camera", {
        get: m.oneOfGetter(t = ["camera"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: m.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_tamperingIndicators", {
        get: m.oneOfGetter(t = ["tamperingIndicators"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedYuv420Image", {
        get: m.oneOfGetter(t = ["croppedYuv420Image"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = R.create()), e.supportedAbis != null && e.supportedAbis.length)
          for (let a = 0; a < e.supportedAbis.length; ++a)
            n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(e.supportedAbis[a]);
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.device), e.digests != null && e.digests.length)
          for (let a = 0; a < e.digests.length; ++a)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[a]);
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties"))
          for (let a = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < a.length; ++d)
            n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(a[d]), c.dot.Int32List.encode(e.dynamicCameraFrameProperties[a[d]], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            c.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[a], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && c.dot.v4.AndroidCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && c.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && c.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.AndroidMetadata(), y, O;
        for (; e.pos < a; ) {
          let S = e.uint32();
          switch (S >>> 3) {
            case 1: {
              d.supportedAbis && d.supportedAbis.length || (d.supportedAbis = []), d.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              d.device = e.string();
              break;
            }
            case 6: {
              d.camera = c.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.detectionNormalizedRectangle = c.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.digests && d.digests.length || (d.digests = []), d.digests.push(e.bytes());
              break;
            }
            case 5: {
              d.digestsWithTimestamp && d.digestsWithTimestamp.length || (d.digestsWithTimestamp = []), d.digestsWithTimestamp.push(c.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              d.dynamicCameraFrameProperties === m.emptyObject && (d.dynamicCameraFrameProperties = {});
              let A = e.uint32() + e.pos;
              for (y = "", O = null; e.pos < A; ) {
                let k = e.uint32();
                switch (k >>> 3) {
                  case 1:
                    y = e.string();
                    break;
                  case 2:
                    O = c.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(k & 7);
                    break;
                }
              }
              d.dynamicCameraFrameProperties[y] = O;
              break;
            }
            case 8: {
              d.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              d.croppedYuv420Image = c.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(S & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let n = 0; n < e.supportedAbis.length; ++n)
            if (!m.isString(e.supportedAbis[n]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !m.isString(e.device))
          return "device: string expected";
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = c.dot.v4.AndroidCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = c.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || m.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let a = c.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (a)
              return "digestsWithTimestamp." + a;
          }
        }
        if (e.dynamicCameraFrameProperties != null && e.hasOwnProperty("dynamicCameraFrameProperties")) {
          if (!m.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let n = Object.keys(e.dynamicCameraFrameProperties);
          for (let a = 0; a < n.length; ++a) {
            let d = c.dot.Int32List.verify(e.dynamicCameraFrameProperties[n[a]]);
            if (d)
              return "dynamicCameraFrameProperties." + d;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || m.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let n = c.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (n)
            return "croppedYuv420Image." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.AndroidMetadata)
          return e;
        let n = new c.dot.v4.AndroidMetadata();
        if (e.supportedAbis) {
          if (!Array.isArray(e.supportedAbis))
            throw TypeError(".dot.v4.AndroidMetadata.supportedAbis: array expected");
          n.supportedAbis = [];
          for (let a = 0; a < e.supportedAbis.length; ++a)
            n.supportedAbis[a] = String(e.supportedAbis[a]);
        }
        if (e.device != null && (n.device = String(e.device)), e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.AndroidMetadata.camera: object expected");
          n.camera = c.dot.v4.AndroidCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = c.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          n.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            typeof e.digests[a] == "string" ? m.base64.decode(e.digests[a], n.digests[a] = m.newBuffer(m.base64.length(e.digests[a])), 0) : e.digests[a].length >= 0 && (n.digests[a] = e.digests[a]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a) {
            if (typeof e.digestsWithTimestamp[a] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[a] = c.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[a]);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (typeof e.dynamicCameraFrameProperties != "object")
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          n.dynamicCameraFrameProperties = {};
          for (let a = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < a.length; ++d) {
            if (typeof e.dynamicCameraFrameProperties[a[d]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            n.dynamicCameraFrameProperties[a[d]] = c.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[a[d]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? m.base64.decode(e.tamperingIndicators, n.tamperingIndicators = m.newBuffer(m.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (n.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          n.croppedYuv420Image = c.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        if ((n.arrays || n.defaults) && (a.supportedAbis = [], a.digests = [], a.digestsWithTimestamp = []), (n.objects || n.defaults) && (a.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          a.supportedAbis = [];
          for (let y = 0; y < e.supportedAbis.length; ++y)
            a.supportedAbis[y] = e.supportedAbis[y];
        }
        if (e.device != null && e.hasOwnProperty("device") && (a.device = e.device, n.oneofs && (a._device = "device")), e.digests && e.digests.length) {
          a.digests = [];
          for (let y = 0; y < e.digests.length; ++y)
            a.digests[y] = n.bytes === String ? m.base64.encode(e.digests[y], 0, e.digests[y].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[y]) : e.digests[y];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          a.dynamicCameraFrameProperties = {};
          for (let y = 0; y < d.length; ++y)
            a.dynamicCameraFrameProperties[d[y]] = c.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[y]], n);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          a.digestsWithTimestamp = [];
          for (let y = 0; y < e.digestsWithTimestamp.length; ++y)
            a.digestsWithTimestamp[y] = c.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[y], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (a.camera = c.dot.v4.AndroidCamera.toObject(e.camera, n), n.oneofs && (a._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (a.detectionNormalizedRectangle = c.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (a._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (a.tamperingIndicators = n.bytes === String ? m.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : n.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, n.oneofs && (a._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (a.croppedYuv420Image = c.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (a._croppedYuv420Image = "croppedYuv420Image")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, r;
    }(), s.AndroidCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && c.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.AndroidCamera();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.resolution = c.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = c.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !m.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.AndroidCamera)
          return t;
        let e = new c.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          e.resolution = c.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = c.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, r;
    }(), s.Yuv420Image = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = m.newBuffer([]), r.prototype.uPlane = m.newBuffer([]), r.prototype.vPlane = m.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && c.dot.ImageSize.encode(t.size, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(t.yPlane), t.uPlane != null && Object.hasOwnProperty.call(t, "uPlane") && e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(t.uPlane), t.vPlane != null && Object.hasOwnProperty.call(t, "vPlane") && e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).bytes(t.vPlane), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.Yuv420Image();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.size = c.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.yPlane = t.bytes();
              break;
            }
            case 3: {
              a.uPlane = t.bytes();
              break;
            }
            case 4: {
              a.vPlane = t.bytes();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = c.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || m.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || m.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || m.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.Yuv420Image)
          return t;
        let e = new c.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = c.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? m.base64.decode(t.yPlane, e.yPlane = m.newBuffer(m.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? m.base64.decode(t.uPlane, e.uPlane = m.newBuffer(m.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? m.base64.decode(t.vPlane, e.vPlane = m.newBuffer(m.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.size = null, e.bytes === String ? n.yPlane = "" : (n.yPlane = [], e.bytes !== Array && (n.yPlane = m.newBuffer(n.yPlane))), e.bytes === String ? n.uPlane = "" : (n.uPlane = [], e.bytes !== Array && (n.uPlane = m.newBuffer(n.uPlane))), e.bytes === String ? n.vPlane = "" : (n.vPlane = [], e.bytes !== Array && (n.vPlane = m.newBuffer(n.vPlane)))), t.size != null && t.hasOwnProperty("size") && (n.size = c.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (n.yPlane = e.bytes === String ? m.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (n.uPlane = e.bytes === String ? m.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (n.vPlane = e.bytes === String ? m.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, r;
    }(), s.IosMetadata = function() {
      function r(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.cameraModelId = "", r.prototype.architectureInfo = m.emptyObject, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = m.emptyArray, r.prototype.digestsWithTimestamp = m.emptyArray, r.prototype.isoValues = m.emptyArray;
      let t;
      return Object.defineProperty(r.prototype, "_camera", {
        get: m.oneOfGetter(t = ["camera"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: m.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = R.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let a = Object.keys(e.architectureInfo), d = 0; d < a.length; ++d)
            n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(a[d]).uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(e.architectureInfo[a[d]]).ldelim();
        if (e.digests != null && e.digests.length)
          for (let a = 0; a < e.digests.length; ++a)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[a]);
        if (e.isoValues != null && e.isoValues.length) {
          n.uint32(
            /* id 4, wireType 2 =*/
            34
          ).fork();
          for (let a = 0; a < e.isoValues.length; ++a)
            n.int32(e.isoValues[a]);
          n.ldelim();
        }
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            c.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[a], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && c.dot.v4.IosCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && c.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.IosMetadata(), y, O;
        for (; e.pos < a; ) {
          let S = e.uint32();
          switch (S >>> 3) {
            case 1: {
              d.cameraModelId = e.string();
              break;
            }
            case 2: {
              d.architectureInfo === m.emptyObject && (d.architectureInfo = {});
              let A = e.uint32() + e.pos;
              for (y = "", O = !1; e.pos < A; ) {
                let k = e.uint32();
                switch (k >>> 3) {
                  case 1:
                    y = e.string();
                    break;
                  case 2:
                    O = e.bool();
                    break;
                  default:
                    e.skipType(k & 7);
                    break;
                }
              }
              d.architectureInfo[y] = O;
              break;
            }
            case 6: {
              d.camera = c.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.detectionNormalizedRectangle = c.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.digests && d.digests.length || (d.digests = []), d.digests.push(e.bytes());
              break;
            }
            case 5: {
              d.digestsWithTimestamp && d.digestsWithTimestamp.length || (d.digestsWithTimestamp = []), d.digestsWithTimestamp.push(c.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (d.isoValues && d.isoValues.length || (d.isoValues = []), (S & 7) === 2) {
                let A = e.uint32() + e.pos;
                for (; e.pos < A; )
                  d.isoValues.push(e.int32());
              } else
                d.isoValues.push(e.int32());
              break;
            }
            default:
              e.skipType(S & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !m.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!m.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let n = Object.keys(e.architectureInfo);
          for (let a = 0; a < n.length; ++a)
            if (typeof e.architectureInfo[n[a]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = c.dot.v4.IosCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = c.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || m.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let a = c.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (a)
              return "digestsWithTimestamp." + a;
          }
        }
        if (e.isoValues != null && e.hasOwnProperty("isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let n = 0; n < e.isoValues.length; ++n)
            if (!m.isInteger(e.isoValues[n]))
              return "isoValues: integer[] expected";
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.IosMetadata)
          return e;
        let n = new c.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (n.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (typeof e.architectureInfo != "object")
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          n.architectureInfo = {};
          for (let a = Object.keys(e.architectureInfo), d = 0; d < a.length; ++d)
            n.architectureInfo[a[d]] = !!e.architectureInfo[a[d]];
        }
        if (e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          n.camera = c.dot.v4.IosCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = c.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          n.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            typeof e.digests[a] == "string" ? m.base64.decode(e.digests[a], n.digests[a] = m.newBuffer(m.base64.length(e.digests[a])), 0) : e.digests[a].length >= 0 && (n.digests[a] = e.digests[a]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a) {
            if (typeof e.digestsWithTimestamp[a] != "object")
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[a] = c.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[a]);
          }
        }
        if (e.isoValues) {
          if (!Array.isArray(e.isoValues))
            throw TypeError(".dot.v4.IosMetadata.isoValues: array expected");
          n.isoValues = [];
          for (let a = 0; a < e.isoValues.length; ++a)
            n.isoValues[a] = e.isoValues[a] | 0;
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        (n.arrays || n.defaults) && (a.digests = [], a.isoValues = [], a.digestsWithTimestamp = []), (n.objects || n.defaults) && (a.architectureInfo = {}), n.defaults && (a.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (a.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          a.architectureInfo = {};
          for (let y = 0; y < d.length; ++y)
            a.architectureInfo[d[y]] = e.architectureInfo[d[y]];
        }
        if (e.digests && e.digests.length) {
          a.digests = [];
          for (let y = 0; y < e.digests.length; ++y)
            a.digests[y] = n.bytes === String ? m.base64.encode(e.digests[y], 0, e.digests[y].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[y]) : e.digests[y];
        }
        if (e.isoValues && e.isoValues.length) {
          a.isoValues = [];
          for (let y = 0; y < e.isoValues.length; ++y)
            a.isoValues[y] = e.isoValues[y];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          a.digestsWithTimestamp = [];
          for (let y = 0; y < e.digestsWithTimestamp.length; ++y)
            a.digestsWithTimestamp[y] = c.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[y], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (a.camera = c.dot.v4.IosCamera.toObject(e.camera, n), n.oneofs && (a._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (a.detectionNormalizedRectangle = c.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (a._detectionNormalizedRectangle = "detectionNormalizedRectangle")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, r;
    }(), s.IosCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && c.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.IosCamera();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.resolution = c.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = c.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !m.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.IosCamera)
          return t;
        let e = new c.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          e.resolution = c.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = c.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, r;
    }(), s.WebMetadata = function() {
      function r(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.currentCameraProperties = null, r.prototype.availableCameraProperties = m.emptyArray, r.prototype.hashedDetectedImages = m.emptyArray, r.prototype.hashedDetectedImagesWithTimestamp = m.emptyArray, r.prototype.detectionRecord = m.emptyArray, r.prototype.croppedImage = null;
      let t;
      return Object.defineProperty(r.prototype, "_croppedImage", {
        get: m.oneOfGetter(t = ["croppedImage"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = R.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && c.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let a = 0; a < e.availableCameraProperties.length; ++a)
            c.dot.v4.CameraProperties.encode(e.availableCameraProperties[a], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
        if (e.hashedDetectedImages != null && e.hashedDetectedImages.length)
          for (let a = 0; a < e.hashedDetectedImages.length; ++a)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(e.hashedDetectedImages[a]);
        if (e.detectionRecord != null && e.detectionRecord.length)
          for (let a = 0; a < e.detectionRecord.length; ++a)
            c.dot.v4.DetectedObject.encode(e.detectionRecord[a], n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let a = 0; a < e.hashedDetectedImagesWithTimestamp.length; ++a)
            c.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[a], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && c.dot.Image.encode(e.croppedImage, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.WebMetadata();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.currentCameraProperties = c.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.availableCameraProperties && d.availableCameraProperties.length || (d.availableCameraProperties = []), d.availableCameraProperties.push(c.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              d.hashedDetectedImages && d.hashedDetectedImages.length || (d.hashedDetectedImages = []), d.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              d.hashedDetectedImagesWithTimestamp && d.hashedDetectedImagesWithTimestamp.length || (d.hashedDetectedImagesWithTimestamp = []), d.hashedDetectedImagesWithTimestamp.push(c.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              d.detectionRecord && d.detectionRecord.length || (d.detectionRecord = []), d.detectionRecord.push(c.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              d.croppedImage = c.dot.Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties")) {
          let n = c.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties);
          if (n)
            return "currentCameraProperties." + n;
        }
        if (e.availableCameraProperties != null && e.hasOwnProperty("availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let n = 0; n < e.availableCameraProperties.length; ++n) {
            let a = c.dot.v4.CameraProperties.verify(e.availableCameraProperties[n]);
            if (a)
              return "availableCameraProperties." + a;
          }
        }
        if (e.hashedDetectedImages != null && e.hasOwnProperty("hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let n = 0; n < e.hashedDetectedImages.length; ++n)
            if (!m.isString(e.hashedDetectedImages[n]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && e.hasOwnProperty("hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let n = 0; n < e.hashedDetectedImagesWithTimestamp.length; ++n) {
            let a = c.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[n]);
            if (a)
              return "hashedDetectedImagesWithTimestamp." + a;
          }
        }
        if (e.detectionRecord != null && e.hasOwnProperty("detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let n = 0; n < e.detectionRecord.length; ++n) {
            let a = c.dot.v4.DetectedObject.verify(e.detectionRecord[n]);
            if (a)
              return "detectionRecord." + a;
          }
        }
        if (e.croppedImage != null && e.hasOwnProperty("croppedImage")) {
          let n = c.dot.Image.verify(e.croppedImage);
          if (n)
            return "croppedImage." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.WebMetadata)
          return e;
        let n = new c.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (typeof e.currentCameraProperties != "object")
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          n.currentCameraProperties = c.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          n.availableCameraProperties = [];
          for (let a = 0; a < e.availableCameraProperties.length; ++a) {
            if (typeof e.availableCameraProperties[a] != "object")
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            n.availableCameraProperties[a] = c.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[a]);
          }
        }
        if (e.hashedDetectedImages) {
          if (!Array.isArray(e.hashedDetectedImages))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImages: array expected");
          n.hashedDetectedImages = [];
          for (let a = 0; a < e.hashedDetectedImages.length; ++a)
            n.hashedDetectedImages[a] = String(e.hashedDetectedImages[a]);
        }
        if (e.hashedDetectedImagesWithTimestamp) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: array expected");
          n.hashedDetectedImagesWithTimestamp = [];
          for (let a = 0; a < e.hashedDetectedImagesWithTimestamp.length; ++a) {
            if (typeof e.hashedDetectedImagesWithTimestamp[a] != "object")
              throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: object expected");
            n.hashedDetectedImagesWithTimestamp[a] = c.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[a]);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          n.detectionRecord = [];
          for (let a = 0; a < e.detectionRecord.length; ++a) {
            if (typeof e.detectionRecord[a] != "object")
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            n.detectionRecord[a] = c.dot.v4.DetectedObject.fromObject(e.detectionRecord[a]);
          }
        }
        if (e.croppedImage != null) {
          if (typeof e.croppedImage != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          n.croppedImage = c.dot.Image.fromObject(e.croppedImage);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        if ((n.arrays || n.defaults) && (a.availableCameraProperties = [], a.hashedDetectedImages = [], a.detectionRecord = [], a.hashedDetectedImagesWithTimestamp = []), n.defaults && (a.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (a.currentCameraProperties = c.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, n)), e.availableCameraProperties && e.availableCameraProperties.length) {
          a.availableCameraProperties = [];
          for (let d = 0; d < e.availableCameraProperties.length; ++d)
            a.availableCameraProperties[d] = c.dot.v4.CameraProperties.toObject(e.availableCameraProperties[d], n);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          a.hashedDetectedImages = [];
          for (let d = 0; d < e.hashedDetectedImages.length; ++d)
            a.hashedDetectedImages[d] = e.hashedDetectedImages[d];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          a.detectionRecord = [];
          for (let d = 0; d < e.detectionRecord.length; ++d)
            a.detectionRecord[d] = c.dot.v4.DetectedObject.toObject(e.detectionRecord[d], n);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          a.hashedDetectedImagesWithTimestamp = [];
          for (let d = 0; d < e.hashedDetectedImagesWithTimestamp.length; ++d)
            a.hashedDetectedImagesWithTimestamp[d] = c.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[d], n);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (a.croppedImage = c.dot.Image.toObject(e.croppedImage, n), n.oneofs && (a._croppedImage = "croppedImage")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, r;
    }(), s.HashedDetectedImageWithTimestamp = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.imageHash = "", r.prototype.timestampMillis = m.Long ? m.Long.fromBits(0, 0, !0) : 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.imageHash = t.string();
              break;
            }
            case 2: {
              a.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !m.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !m.isInteger(t.timestampMillis) && !(t.timestampMillis && m.isInteger(t.timestampMillis.low) && m.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new c.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (m.Long ? (e.timestampMillis = m.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new m.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if (e.defaults)
          if (n.imageHash = "", m.Long) {
            let a = new m.Long(0, 0, !0);
            n.timestampMillis = e.longs === String ? a.toString() : e.longs === Number ? a.toNumber() : a;
          } else
            n.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (n.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? n.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : n.timestampMillis = e.longs === String ? m.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new m.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, r;
    }(), s.MediaTrackSettings = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.aspectRatio = null, r.prototype.autoGainControl = null, r.prototype.channelCount = null, r.prototype.deviceId = null, r.prototype.displaySurface = null, r.prototype.echoCancellation = null, r.prototype.facingMode = null, r.prototype.frameRate = null, r.prototype.groupId = null, r.prototype.height = null, r.prototype.noiseSuppression = null, r.prototype.sampleRate = null, r.prototype.sampleSize = null, r.prototype.width = null, r.prototype.deviceName = null;
      let t;
      return Object.defineProperty(r.prototype, "_aspectRatio", {
        get: m.oneOfGetter(t = ["aspectRatio"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_autoGainControl", {
        get: m.oneOfGetter(t = ["autoGainControl"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_channelCount", {
        get: m.oneOfGetter(t = ["channelCount"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceId", {
        get: m.oneOfGetter(t = ["deviceId"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_displaySurface", {
        get: m.oneOfGetter(t = ["displaySurface"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_echoCancellation", {
        get: m.oneOfGetter(t = ["echoCancellation"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_facingMode", {
        get: m.oneOfGetter(t = ["facingMode"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_frameRate", {
        get: m.oneOfGetter(t = ["frameRate"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_groupId", {
        get: m.oneOfGetter(t = ["groupId"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_height", {
        get: m.oneOfGetter(t = ["height"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_noiseSuppression", {
        get: m.oneOfGetter(t = ["noiseSuppression"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleRate", {
        get: m.oneOfGetter(t = ["sampleRate"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleSize", {
        get: m.oneOfGetter(t = ["sampleSize"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_width", {
        get: m.oneOfGetter(t = ["width"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceName", {
        get: m.oneOfGetter(t = ["deviceName"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && n.uint32(
          /* id 1, wireType 1 =*/
          9
        ).double(e.aspectRatio), e.autoGainControl != null && Object.hasOwnProperty.call(e, "autoGainControl") && n.uint32(
          /* id 2, wireType 0 =*/
          16
        ).bool(e.autoGainControl), e.channelCount != null && Object.hasOwnProperty.call(e, "channelCount") && n.uint32(
          /* id 3, wireType 0 =*/
          24
        ).int32(e.channelCount), e.deviceId != null && Object.hasOwnProperty.call(e, "deviceId") && n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).string(e.deviceId), e.displaySurface != null && Object.hasOwnProperty.call(e, "displaySurface") && n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.displaySurface), e.echoCancellation != null && Object.hasOwnProperty.call(e, "echoCancellation") && n.uint32(
          /* id 6, wireType 0 =*/
          48
        ).bool(e.echoCancellation), e.facingMode != null && Object.hasOwnProperty.call(e, "facingMode") && n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).string(e.facingMode), e.frameRate != null && Object.hasOwnProperty.call(e, "frameRate") && n.uint32(
          /* id 8, wireType 1 =*/
          65
        ).double(e.frameRate), e.groupId != null && Object.hasOwnProperty.call(e, "groupId") && n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).string(e.groupId), e.height != null && Object.hasOwnProperty.call(e, "height") && n.uint32(
          /* id 10, wireType 0 =*/
          80
        ).int32(e.height), e.noiseSuppression != null && Object.hasOwnProperty.call(e, "noiseSuppression") && n.uint32(
          /* id 11, wireType 0 =*/
          88
        ).bool(e.noiseSuppression), e.sampleRate != null && Object.hasOwnProperty.call(e, "sampleRate") && n.uint32(
          /* id 12, wireType 0 =*/
          96
        ).int32(e.sampleRate), e.sampleSize != null && Object.hasOwnProperty.call(e, "sampleSize") && n.uint32(
          /* id 13, wireType 0 =*/
          104
        ).int32(e.sampleSize), e.width != null && Object.hasOwnProperty.call(e, "width") && n.uint32(
          /* id 14, wireType 0 =*/
          112
        ).int32(e.width), e.deviceName != null && Object.hasOwnProperty.call(e, "deviceName") && n.uint32(
          /* id 15, wireType 2 =*/
          122
        ).string(e.deviceName), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.MediaTrackSettings();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.aspectRatio = e.double();
              break;
            }
            case 2: {
              d.autoGainControl = e.bool();
              break;
            }
            case 3: {
              d.channelCount = e.int32();
              break;
            }
            case 4: {
              d.deviceId = e.string();
              break;
            }
            case 5: {
              d.displaySurface = e.string();
              break;
            }
            case 6: {
              d.echoCancellation = e.bool();
              break;
            }
            case 7: {
              d.facingMode = e.string();
              break;
            }
            case 8: {
              d.frameRate = e.double();
              break;
            }
            case 9: {
              d.groupId = e.string();
              break;
            }
            case 10: {
              d.height = e.int32();
              break;
            }
            case 11: {
              d.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              d.sampleRate = e.int32();
              break;
            }
            case 13: {
              d.sampleSize = e.int32();
              break;
            }
            case 14: {
              d.width = e.int32();
              break;
            }
            case 15: {
              d.deviceName = e.string();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !m.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !m.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !m.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !m.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !m.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !m.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !m.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !m.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !m.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !m.isString(e.deviceName) ? "deviceName: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.MediaTrackSettings)
          return e;
        let n = new c.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (n.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (n.autoGainControl = !!e.autoGainControl), e.channelCount != null && (n.channelCount = e.channelCount | 0), e.deviceId != null && (n.deviceId = String(e.deviceId)), e.displaySurface != null && (n.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (n.echoCancellation = !!e.echoCancellation), e.facingMode != null && (n.facingMode = String(e.facingMode)), e.frameRate != null && (n.frameRate = Number(e.frameRate)), e.groupId != null && (n.groupId = String(e.groupId)), e.height != null && (n.height = e.height | 0), e.noiseSuppression != null && (n.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (n.sampleRate = e.sampleRate | 0), e.sampleSize != null && (n.sampleSize = e.sampleSize | 0), e.width != null && (n.width = e.width | 0), e.deviceName != null && (n.deviceName = String(e.deviceName)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && (a.aspectRatio = n.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, n.oneofs && (a._aspectRatio = "aspectRatio")), e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && (a.autoGainControl = e.autoGainControl, n.oneofs && (a._autoGainControl = "autoGainControl")), e.channelCount != null && e.hasOwnProperty("channelCount") && (a.channelCount = e.channelCount, n.oneofs && (a._channelCount = "channelCount")), e.deviceId != null && e.hasOwnProperty("deviceId") && (a.deviceId = e.deviceId, n.oneofs && (a._deviceId = "deviceId")), e.displaySurface != null && e.hasOwnProperty("displaySurface") && (a.displaySurface = e.displaySurface, n.oneofs && (a._displaySurface = "displaySurface")), e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && (a.echoCancellation = e.echoCancellation, n.oneofs && (a._echoCancellation = "echoCancellation")), e.facingMode != null && e.hasOwnProperty("facingMode") && (a.facingMode = e.facingMode, n.oneofs && (a._facingMode = "facingMode")), e.frameRate != null && e.hasOwnProperty("frameRate") && (a.frameRate = n.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, n.oneofs && (a._frameRate = "frameRate")), e.groupId != null && e.hasOwnProperty("groupId") && (a.groupId = e.groupId, n.oneofs && (a._groupId = "groupId")), e.height != null && e.hasOwnProperty("height") && (a.height = e.height, n.oneofs && (a._height = "height")), e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && (a.noiseSuppression = e.noiseSuppression, n.oneofs && (a._noiseSuppression = "noiseSuppression")), e.sampleRate != null && e.hasOwnProperty("sampleRate") && (a.sampleRate = e.sampleRate, n.oneofs && (a._sampleRate = "sampleRate")), e.sampleSize != null && e.hasOwnProperty("sampleSize") && (a.sampleSize = e.sampleSize, n.oneofs && (a._sampleSize = "sampleSize")), e.width != null && e.hasOwnProperty("width") && (a.width = e.width, n.oneofs && (a._width = "width")), e.deviceName != null && e.hasOwnProperty("deviceName") && (a.deviceName = e.deviceName, n.oneofs && (a._deviceName = "deviceName")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, r;
    }(), s.ImageBitmap = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.width = 0, r.prototype.height = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.ImageBitmap();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.width = t.int32();
              break;
            }
            case 2: {
              a.height = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !m.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !m.isInteger(t.height) ? "height: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.ImageBitmap)
          return t;
        let e = new c.dot.v4.ImageBitmap();
        return t.width != null && (e.width = t.width | 0), t.height != null && (e.height = t.height | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.width = 0, n.height = 0), t.width != null && t.hasOwnProperty("width") && (n.width = t.width), t.height != null && t.hasOwnProperty("height") && (n.height = t.height), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, r;
    }(), s.CameraProperties = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.cameraInitFrameResolution = null, r.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(r.prototype, "_cameraInitFrameResolution", {
        get: m.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && c.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && c.dot.v4.MediaTrackSettings.encode(e.cameraProperties, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.CameraProperties();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.cameraInitFrameResolution = c.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.cameraProperties = c.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution")) {
          let n = c.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution);
          if (n)
            return "cameraInitFrameResolution." + n;
        }
        if (e.cameraProperties != null && e.hasOwnProperty("cameraProperties")) {
          let n = c.dot.v4.MediaTrackSettings.verify(e.cameraProperties);
          if (n)
            return "cameraProperties." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.CameraProperties)
          return e;
        let n = new c.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (typeof e.cameraInitFrameResolution != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          n.cameraInitFrameResolution = c.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution);
        }
        if (e.cameraProperties != null) {
          if (typeof e.cameraProperties != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          n.cameraProperties = c.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return n.defaults && (a.cameraProperties = null), e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution") && (a.cameraInitFrameResolution = c.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, n), n.oneofs && (a._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && e.hasOwnProperty("cameraProperties") && (a.cameraProperties = c.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, n)), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, r;
    }(), s.DetectedObject = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.brightness = 0, r.prototype.sharpness = 0, r.prototype.hotspots = 0, r.prototype.confidence = 0, r.prototype.faceSize = 0, r.prototype.faceCenter = null, r.prototype.smallestEdge = 0, r.prototype.bottomLeft = null, r.prototype.bottomRight = null, r.prototype.topLeft = null, r.prototype.topRight = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.brightness), t.sharpness != null && Object.hasOwnProperty.call(t, "sharpness") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.sharpness), t.hotspots != null && Object.hasOwnProperty.call(t, "hotspots") && e.uint32(
          /* id 3, wireType 5 =*/
          29
        ).float(t.hotspots), t.confidence != null && Object.hasOwnProperty.call(t, "confidence") && e.uint32(
          /* id 4, wireType 5 =*/
          37
        ).float(t.confidence), t.faceSize != null && Object.hasOwnProperty.call(t, "faceSize") && e.uint32(
          /* id 5, wireType 5 =*/
          45
        ).float(t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && c.dot.v4.Point.encode(t.faceCenter, e.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && e.uint32(
          /* id 7, wireType 5 =*/
          61
        ).float(t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && c.dot.v4.Point.encode(t.bottomLeft, e.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && c.dot.v4.Point.encode(t.bottomRight, e.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && c.dot.v4.Point.encode(t.topLeft, e.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && c.dot.v4.Point.encode(t.topRight, e.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.DetectedObject();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.brightness = t.float();
              break;
            }
            case 2: {
              a.sharpness = t.float();
              break;
            }
            case 3: {
              a.hotspots = t.float();
              break;
            }
            case 4: {
              a.confidence = t.float();
              break;
            }
            case 5: {
              a.faceSize = t.float();
              break;
            }
            case 6: {
              a.faceCenter = c.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 7: {
              a.smallestEdge = t.float();
              break;
            }
            case 8: {
              a.bottomLeft = c.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 9: {
              a.bottomRight = c.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 10: {
              a.topLeft = c.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 11: {
              a.topRight = c.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.brightness != null && t.hasOwnProperty("brightness") && typeof t.brightness != "number")
          return "brightness: number expected";
        if (t.sharpness != null && t.hasOwnProperty("sharpness") && typeof t.sharpness != "number")
          return "sharpness: number expected";
        if (t.hotspots != null && t.hasOwnProperty("hotspots") && typeof t.hotspots != "number")
          return "hotspots: number expected";
        if (t.confidence != null && t.hasOwnProperty("confidence") && typeof t.confidence != "number")
          return "confidence: number expected";
        if (t.faceSize != null && t.hasOwnProperty("faceSize") && typeof t.faceSize != "number")
          return "faceSize: number expected";
        if (t.faceCenter != null && t.hasOwnProperty("faceCenter")) {
          let e = c.dot.v4.Point.verify(t.faceCenter);
          if (e)
            return "faceCenter." + e;
        }
        if (t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && typeof t.smallestEdge != "number")
          return "smallestEdge: number expected";
        if (t.bottomLeft != null && t.hasOwnProperty("bottomLeft")) {
          let e = c.dot.v4.Point.verify(t.bottomLeft);
          if (e)
            return "bottomLeft." + e;
        }
        if (t.bottomRight != null && t.hasOwnProperty("bottomRight")) {
          let e = c.dot.v4.Point.verify(t.bottomRight);
          if (e)
            return "bottomRight." + e;
        }
        if (t.topLeft != null && t.hasOwnProperty("topLeft")) {
          let e = c.dot.v4.Point.verify(t.topLeft);
          if (e)
            return "topLeft." + e;
        }
        if (t.topRight != null && t.hasOwnProperty("topRight")) {
          let e = c.dot.v4.Point.verify(t.topRight);
          if (e)
            return "topRight." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.DetectedObject)
          return t;
        let e = new c.dot.v4.DetectedObject();
        if (t.brightness != null && (e.brightness = Number(t.brightness)), t.sharpness != null && (e.sharpness = Number(t.sharpness)), t.hotspots != null && (e.hotspots = Number(t.hotspots)), t.confidence != null && (e.confidence = Number(t.confidence)), t.faceSize != null && (e.faceSize = Number(t.faceSize)), t.faceCenter != null) {
          if (typeof t.faceCenter != "object")
            throw TypeError(".dot.v4.DetectedObject.faceCenter: object expected");
          e.faceCenter = c.dot.v4.Point.fromObject(t.faceCenter);
        }
        if (t.smallestEdge != null && (e.smallestEdge = Number(t.smallestEdge)), t.bottomLeft != null) {
          if (typeof t.bottomLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomLeft: object expected");
          e.bottomLeft = c.dot.v4.Point.fromObject(t.bottomLeft);
        }
        if (t.bottomRight != null) {
          if (typeof t.bottomRight != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomRight: object expected");
          e.bottomRight = c.dot.v4.Point.fromObject(t.bottomRight);
        }
        if (t.topLeft != null) {
          if (typeof t.topLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.topLeft: object expected");
          e.topLeft = c.dot.v4.Point.fromObject(t.topLeft);
        }
        if (t.topRight != null) {
          if (typeof t.topRight != "object")
            throw TypeError(".dot.v4.DetectedObject.topRight: object expected");
          e.topRight = c.dot.v4.Point.fromObject(t.topRight);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.brightness = 0, n.sharpness = 0, n.hotspots = 0, n.confidence = 0, n.faceSize = 0, n.faceCenter = null, n.smallestEdge = 0, n.bottomLeft = null, n.bottomRight = null, n.topLeft = null, n.topRight = null), t.brightness != null && t.hasOwnProperty("brightness") && (n.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && t.hasOwnProperty("sharpness") && (n.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && t.hasOwnProperty("hotspots") && (n.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && t.hasOwnProperty("confidence") && (n.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && t.hasOwnProperty("faceSize") && (n.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && t.hasOwnProperty("faceCenter") && (n.faceCenter = c.dot.v4.Point.toObject(t.faceCenter, e)), t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && (n.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && t.hasOwnProperty("bottomLeft") && (n.bottomLeft = c.dot.v4.Point.toObject(t.bottomLeft, e)), t.bottomRight != null && t.hasOwnProperty("bottomRight") && (n.bottomRight = c.dot.v4.Point.toObject(t.bottomRight, e)), t.topLeft != null && t.hasOwnProperty("topLeft") && (n.topLeft = c.dot.v4.Point.toObject(t.topLeft, e)), t.topRight != null && t.hasOwnProperty("topRight") && (n.topRight = c.dot.v4.Point.toObject(t.topRight, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, r;
    }(), s.Point = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.x = 0, r.prototype.y = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.Point();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.x = t.float();
              break;
            }
            case 2: {
              a.y = t.float();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.x != null && t.hasOwnProperty("x") && typeof t.x != "number" ? "x: number expected" : t.y != null && t.hasOwnProperty("y") && typeof t.y != "number" ? "y: number expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.Point)
          return t;
        let e = new c.dot.v4.Point();
        return t.x != null && (e.x = Number(t.x)), t.y != null && (e.y = Number(t.y)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.x = 0, n.y = 0), t.x != null && t.hasOwnProperty("x") && (n.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && t.hasOwnProperty("y") && (n.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, r;
    }(), s.FaceContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.FaceContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.image = c.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.metadata = c.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = c.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = c.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.FaceContent)
          return t;
        let e = new c.dot.v4.FaceContent();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          e.image = c.dot.Image.fromObject(t.image);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          e.metadata = c.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.metadata = null), t.image != null && t.hasOwnProperty("image") && (n.image = c.dot.Image.toObject(t.image, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = c.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceContent";
      }, r;
    }(), s.DocumentContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.DocumentContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.image = c.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.metadata = c.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = c.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = c.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.DocumentContent)
          return t;
        let e = new c.dot.v4.DocumentContent();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          e.image = c.dot.Image.fromObject(t.image);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          e.metadata = c.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.metadata = null), t.image != null && t.hasOwnProperty("image") && (n.image = c.dot.Image.toObject(t.image, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = c.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DocumentContent";
      }, r;
    }(), s.Blob = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.documentContent = null, r.prototype.eyeGazeLivenessContent = null, r.prototype.faceContent = null, r.prototype.magnifeyeLivenessContent = null, r.prototype.smileLivenessContent = null, r.prototype.palmContent = null, r.prototype.travelDocumentContent = null;
      let t;
      return Object.defineProperty(r.prototype, "blob", {
        get: m.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && c.dot.v4.DocumentContent.encode(e.documentContent, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && c.dot.v4.FaceContent.encode(e.faceContent, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && c.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && c.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && c.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && c.dot.v4.PalmContent.encode(e.palmContent, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && c.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.Blob();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.documentContent = c.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              d.eyeGazeLivenessContent = c.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.faceContent = c.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.magnifeyeLivenessContent = c.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              d.smileLivenessContent = c.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              d.palmContent = c.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.travelDocumentContent = c.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let n = {};
        if (e.documentContent != null && e.hasOwnProperty("documentContent")) {
          n.blob = 1;
          {
            let a = c.dot.v4.DocumentContent.verify(e.documentContent);
            if (a)
              return "documentContent." + a;
          }
        }
        if (e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let a = c.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent);
            if (a)
              return "eyeGazeLivenessContent." + a;
          }
        }
        if (e.faceContent != null && e.hasOwnProperty("faceContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let a = c.dot.v4.FaceContent.verify(e.faceContent);
            if (a)
              return "faceContent." + a;
          }
        }
        if (e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let a = c.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent);
            if (a)
              return "magnifeyeLivenessContent." + a;
          }
        }
        if (e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let a = c.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent);
            if (a)
              return "smileLivenessContent." + a;
          }
        }
        if (e.palmContent != null && e.hasOwnProperty("palmContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let a = c.dot.v4.PalmContent.verify(e.palmContent);
            if (a)
              return "palmContent." + a;
          }
        }
        if (e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let a = c.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent);
            if (a)
              return "travelDocumentContent." + a;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.Blob)
          return e;
        let n = new c.dot.v4.Blob();
        if (e.documentContent != null) {
          if (typeof e.documentContent != "object")
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          n.documentContent = c.dot.v4.DocumentContent.fromObject(e.documentContent);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (typeof e.eyeGazeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          n.eyeGazeLivenessContent = c.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent);
        }
        if (e.faceContent != null) {
          if (typeof e.faceContent != "object")
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          n.faceContent = c.dot.v4.FaceContent.fromObject(e.faceContent);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (typeof e.magnifeyeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          n.magnifeyeLivenessContent = c.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent);
        }
        if (e.smileLivenessContent != null) {
          if (typeof e.smileLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          n.smileLivenessContent = c.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent);
        }
        if (e.palmContent != null) {
          if (typeof e.palmContent != "object")
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          n.palmContent = c.dot.v4.PalmContent.fromObject(e.palmContent);
        }
        if (e.travelDocumentContent != null) {
          if (typeof e.travelDocumentContent != "object")
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          n.travelDocumentContent = c.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return e.documentContent != null && e.hasOwnProperty("documentContent") && (a.documentContent = c.dot.v4.DocumentContent.toObject(e.documentContent, n), n.oneofs && (a.blob = "documentContent")), e.faceContent != null && e.hasOwnProperty("faceContent") && (a.faceContent = c.dot.v4.FaceContent.toObject(e.faceContent, n), n.oneofs && (a.blob = "faceContent")), e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent") && (a.magnifeyeLivenessContent = c.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, n), n.oneofs && (a.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent") && (a.smileLivenessContent = c.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, n), n.oneofs && (a.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent") && (a.eyeGazeLivenessContent = c.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, n), n.oneofs && (a.blob = "eyeGazeLivenessContent")), e.palmContent != null && e.hasOwnProperty("palmContent") && (a.palmContent = c.dot.v4.PalmContent.toObject(e.palmContent, n), n.oneofs && (a.blob = "palmContent")), e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent") && (a.travelDocumentContent = c.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, n), n.oneofs && (a.blob = "travelDocumentContent")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, r;
    }(), s.TravelDocumentContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.ldsMasterFile = null, r.prototype.accessControlProtocolUsed = 0, r.prototype.authenticationStatus = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && c.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && c.dot.v4.AuthenticationStatus.encode(t.authenticationStatus, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.TravelDocumentContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.ldsMasterFile = c.dot.v4.LdsMasterFile.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              a.authenticationStatus = c.dot.v4.AuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 4: {
              a.metadata = c.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile")) {
          let e = c.dot.v4.LdsMasterFile.verify(t.ldsMasterFile);
          if (e)
            return "ldsMasterFile." + e;
        }
        if (t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed"))
          switch (t.accessControlProtocolUsed) {
            default:
              return "accessControlProtocolUsed: enum value expected";
            case 0:
            case 1:
            case 2:
              break;
          }
        if (t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus")) {
          let e = c.dot.v4.AuthenticationStatus.verify(t.authenticationStatus);
          if (e)
            return "authenticationStatus." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = c.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.TravelDocumentContent)
          return t;
        let e = new c.dot.v4.TravelDocumentContent();
        if (t.ldsMasterFile != null) {
          if (typeof t.ldsMasterFile != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.ldsMasterFile: object expected");
          e.ldsMasterFile = c.dot.v4.LdsMasterFile.fromObject(t.ldsMasterFile);
        }
        switch (t.accessControlProtocolUsed) {
          default:
            if (typeof t.accessControlProtocolUsed == "number") {
              e.accessControlProtocolUsed = t.accessControlProtocolUsed;
              break;
            }
            break;
          case "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED":
          case 0:
            e.accessControlProtocolUsed = 0;
            break;
          case "ACCESS_CONTROL_PROTOCOL_BAC":
          case 1:
            e.accessControlProtocolUsed = 1;
            break;
          case "ACCESS_CONTROL_PROTOCOL_PACE":
          case 2:
            e.accessControlProtocolUsed = 2;
            break;
        }
        if (t.authenticationStatus != null) {
          if (typeof t.authenticationStatus != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.authenticationStatus: object expected");
          e.authenticationStatus = c.dot.v4.AuthenticationStatus.fromObject(t.authenticationStatus);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.metadata: object expected");
          e.metadata = c.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.ldsMasterFile = null, n.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, n.authenticationStatus = null, n.metadata = null), t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile") && (n.ldsMasterFile = c.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e)), t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed") && (n.accessControlProtocolUsed = e.enums === String ? c.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : c.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus") && (n.authenticationStatus = c.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = c.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, r;
    }(), s.LdsMasterFile = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.lds1eMrtdApplication = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && c.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.LdsMasterFile();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.lds1eMrtdApplication = c.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication")) {
          let e = c.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication);
          if (e)
            return "lds1eMrtdApplication." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.LdsMasterFile)
          return t;
        let e = new c.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (typeof t.lds1eMrtdApplication != "object")
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          e.lds1eMrtdApplication = c.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication") && (n.lds1eMrtdApplication = c.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, r;
    }(), s.Lds1eMrtdApplication = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.comHeaderAndDataGroupPresenceInformation = null, r.prototype.sodDocumentSecurityObject = null, r.prototype.dg1MachineReadableZoneInformation = null, r.prototype.dg2EncodedIdentificationFeaturesFace = null, r.prototype.dg3AdditionalIdentificationFeatureFingers = null, r.prototype.dg4AdditionalIdentificationFeatureIrises = null, r.prototype.dg5DisplayedPortrait = null, r.prototype.dg7DisplayedSignatureOrUsualMark = null, r.prototype.dg8DataFeatures = null, r.prototype.dg9StructureFeatures = null, r.prototype.dg10SubstanceFeatures = null, r.prototype.dg11AdditionalPersonalDetails = null, r.prototype.dg12AdditionalDocumentDetails = null, r.prototype.dg13OptionalDetails = null, r.prototype.dg14SecurityOptions = null, r.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, r.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(r.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: m.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: m.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg5DisplayedPortrait", {
        get: m.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: m.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg8DataFeatures", {
        get: m.oneOfGetter(t = ["dg8DataFeatures"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg9StructureFeatures", {
        get: m.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg10SubstanceFeatures", {
        get: m.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg11AdditionalPersonalDetails", {
        get: m.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg12AdditionalDocumentDetails", {
        get: m.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg13OptionalDetails", {
        get: m.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg14SecurityOptions", {
        get: m.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: m.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg16PersonsToNotify", {
        get: m.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && c.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && c.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && c.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && c.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && c.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && c.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && c.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && c.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && c.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && c.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && c.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, n.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && c.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, n.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork()).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && c.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, n.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork()).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && c.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, n.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork()).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && c.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, n.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork()).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && c.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, n.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork()).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && c.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, n.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.comHeaderAndDataGroupPresenceInformation = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.sodDocumentSecurityObject = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.dg1MachineReadableZoneInformation = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              d.dg2EncodedIdentificationFeaturesFace = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              d.dg3AdditionalIdentificationFeatureFingers = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              d.dg4AdditionalIdentificationFeatureIrises = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.dg5DisplayedPortrait = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              d.dg7DisplayedSignatureOrUsualMark = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              d.dg8DataFeatures = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              d.dg9StructureFeatures = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              d.dg10SubstanceFeatures = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              d.dg11AdditionalPersonalDetails = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              d.dg12AdditionalDocumentDetails = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              d.dg13OptionalDetails = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              d.dg14SecurityOptions = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              d.dg15ActiveAuthenticationPublicKeyInfo = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              d.dg16PersonsToNotify = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation);
          if (n)
            return "comHeaderAndDataGroupPresenceInformation." + n;
        }
        if (e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject);
          if (n)
            return "sodDocumentSecurityObject." + n;
        }
        if (e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation);
          if (n)
            return "dg1MachineReadableZoneInformation." + n;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace);
          if (n)
            return "dg2EncodedIdentificationFeaturesFace." + n;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers);
          if (n)
            return "dg3AdditionalIdentificationFeatureFingers." + n;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises);
          if (n)
            return "dg4AdditionalIdentificationFeatureIrises." + n;
        }
        if (e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait);
          if (n)
            return "dg5DisplayedPortrait." + n;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark);
          if (n)
            return "dg7DisplayedSignatureOrUsualMark." + n;
        }
        if (e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures);
          if (n)
            return "dg8DataFeatures." + n;
        }
        if (e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures);
          if (n)
            return "dg9StructureFeatures." + n;
        }
        if (e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures);
          if (n)
            return "dg10SubstanceFeatures." + n;
        }
        if (e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails);
          if (n)
            return "dg11AdditionalPersonalDetails." + n;
        }
        if (e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails);
          if (n)
            return "dg12AdditionalDocumentDetails." + n;
        }
        if (e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails);
          if (n)
            return "dg13OptionalDetails." + n;
        }
        if (e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions);
          if (n)
            return "dg14SecurityOptions." + n;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo);
          if (n)
            return "dg15ActiveAuthenticationPublicKeyInfo." + n;
        }
        if (e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify")) {
          let n = c.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify);
          if (n)
            return "dg16PersonsToNotify." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.Lds1eMrtdApplication)
          return e;
        let n = new c.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (typeof e.comHeaderAndDataGroupPresenceInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          n.comHeaderAndDataGroupPresenceInformation = c.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (typeof e.sodDocumentSecurityObject != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          n.sodDocumentSecurityObject = c.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (typeof e.dg1MachineReadableZoneInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          n.dg1MachineReadableZoneInformation = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (typeof e.dg2EncodedIdentificationFeaturesFace != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          n.dg2EncodedIdentificationFeaturesFace = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (typeof e.dg3AdditionalIdentificationFeatureFingers != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          n.dg3AdditionalIdentificationFeatureFingers = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (typeof e.dg4AdditionalIdentificationFeatureIrises != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          n.dg4AdditionalIdentificationFeatureIrises = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (typeof e.dg5DisplayedPortrait != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          n.dg5DisplayedPortrait = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (typeof e.dg7DisplayedSignatureOrUsualMark != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          n.dg7DisplayedSignatureOrUsualMark = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark);
        }
        if (e.dg8DataFeatures != null) {
          if (typeof e.dg8DataFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          n.dg8DataFeatures = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures);
        }
        if (e.dg9StructureFeatures != null) {
          if (typeof e.dg9StructureFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          n.dg9StructureFeatures = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (typeof e.dg10SubstanceFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          n.dg10SubstanceFeatures = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (typeof e.dg11AdditionalPersonalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          n.dg11AdditionalPersonalDetails = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (typeof e.dg12AdditionalDocumentDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          n.dg12AdditionalDocumentDetails = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails);
        }
        if (e.dg13OptionalDetails != null) {
          if (typeof e.dg13OptionalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          n.dg13OptionalDetails = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails);
        }
        if (e.dg14SecurityOptions != null) {
          if (typeof e.dg14SecurityOptions != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          n.dg14SecurityOptions = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (typeof e.dg15ActiveAuthenticationPublicKeyInfo != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          n.dg15ActiveAuthenticationPublicKeyInfo = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo);
        }
        if (e.dg16PersonsToNotify != null) {
          if (typeof e.dg16PersonsToNotify != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          n.dg16PersonsToNotify = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return n.defaults && (a.comHeaderAndDataGroupPresenceInformation = null, a.sodDocumentSecurityObject = null, a.dg1MachineReadableZoneInformation = null, a.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation") && (a.comHeaderAndDataGroupPresenceInformation = c.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, n)), e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject") && (a.sodDocumentSecurityObject = c.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, n)), e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation") && (a.dg1MachineReadableZoneInformation = c.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, n)), e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace") && (a.dg2EncodedIdentificationFeaturesFace = c.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, n)), e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers") && (a.dg3AdditionalIdentificationFeatureFingers = c.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, n), n.oneofs && (a._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises") && (a.dg4AdditionalIdentificationFeatureIrises = c.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, n), n.oneofs && (a._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait") && (a.dg5DisplayedPortrait = c.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, n), n.oneofs && (a._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark") && (a.dg7DisplayedSignatureOrUsualMark = c.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, n), n.oneofs && (a._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures") && (a.dg8DataFeatures = c.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, n), n.oneofs && (a._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures") && (a.dg9StructureFeatures = c.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, n), n.oneofs && (a._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures") && (a.dg10SubstanceFeatures = c.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, n), n.oneofs && (a._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails") && (a.dg11AdditionalPersonalDetails = c.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, n), n.oneofs && (a._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails") && (a.dg12AdditionalDocumentDetails = c.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, n), n.oneofs && (a._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails") && (a.dg13OptionalDetails = c.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, n), n.oneofs && (a._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions") && (a.dg14SecurityOptions = c.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, n), n.oneofs && (a._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo") && (a.dg15ActiveAuthenticationPublicKeyInfo = c.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, n), n.oneofs && (a._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify") && (a.dg16PersonsToNotify = c.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, n), n.oneofs && (a._dg16PersonsToNotify = "dg16PersonsToNotify")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, r;
    }(), s.Lds1ElementaryFile = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.id = 0, r.prototype.bytes = null;
      let t;
      return Object.defineProperty(r.prototype, "_bytes", {
        get: m.oneOfGetter(t = ["bytes"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.Lds1ElementaryFile();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.id = e.int32();
              break;
            }
            case 2: {
              d.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.id != null && e.hasOwnProperty("id"))
          switch (e.id) {
            default:
              return "id: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
              break;
          }
        return e.bytes != null && e.hasOwnProperty("bytes") && !(e.bytes && typeof e.bytes.length == "number" || m.isString(e.bytes)) ? "bytes: buffer expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.Lds1ElementaryFile)
          return e;
        let n = new c.dot.v4.Lds1ElementaryFile();
        switch (e.id) {
          default:
            if (typeof e.id == "number") {
              n.id = e.id;
              break;
            }
            break;
          case "ID_UNSPECIFIED":
          case 0:
            n.id = 0;
            break;
          case "ID_COM":
          case 1:
            n.id = 1;
            break;
          case "ID_SOD":
          case 2:
            n.id = 2;
            break;
          case "ID_DG1":
          case 3:
            n.id = 3;
            break;
          case "ID_DG2":
          case 4:
            n.id = 4;
            break;
          case "ID_DG3":
          case 5:
            n.id = 5;
            break;
          case "ID_DG4":
          case 6:
            n.id = 6;
            break;
          case "ID_DG5":
          case 7:
            n.id = 7;
            break;
          case "ID_DG7":
          case 8:
            n.id = 8;
            break;
          case "ID_DG8":
          case 9:
            n.id = 9;
            break;
          case "ID_DG9":
          case 10:
            n.id = 10;
            break;
          case "ID_DG10":
          case 11:
            n.id = 11;
            break;
          case "ID_DG11":
          case 12:
            n.id = 12;
            break;
          case "ID_DG12":
          case 13:
            n.id = 13;
            break;
          case "ID_DG13":
          case 14:
            n.id = 14;
            break;
          case "ID_DG14":
          case 15:
            n.id = 15;
            break;
          case "ID_DG15":
          case 16:
            n.id = 16;
            break;
          case "ID_DG16":
          case 17:
            n.id = 17;
            break;
        }
        return e.bytes != null && (typeof e.bytes == "string" ? m.base64.decode(e.bytes, n.bytes = m.newBuffer(m.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (n.bytes = e.bytes)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return n.defaults && (a.id = n.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (a.id = n.enums === String ? c.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : c.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (a.bytes = n.bytes === String ? m.base64.encode(e.bytes, 0, e.bytes.length) : n.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, n.oneofs && (a._bytes = "bytes")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, r.Id = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "ID_UNSPECIFIED"] = 0, n[e[1] = "ID_COM"] = 1, n[e[2] = "ID_SOD"] = 2, n[e[3] = "ID_DG1"] = 3, n[e[4] = "ID_DG2"] = 4, n[e[5] = "ID_DG3"] = 5, n[e[6] = "ID_DG4"] = 6, n[e[7] = "ID_DG5"] = 7, n[e[8] = "ID_DG7"] = 8, n[e[9] = "ID_DG8"] = 9, n[e[10] = "ID_DG9"] = 10, n[e[11] = "ID_DG10"] = 11, n[e[12] = "ID_DG11"] = 12, n[e[13] = "ID_DG12"] = 13, n[e[14] = "ID_DG13"] = 14, n[e[15] = "ID_DG14"] = 15, n[e[16] = "ID_DG15"] = 16, n[e[17] = "ID_DG16"] = 17, n;
      }(), r;
    }(), s.AccessControlProtocol = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[r[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[r[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), s.AuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.data = null, r.prototype.chip = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && c.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && c.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.AuthenticationStatus();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.data = c.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.chip = c.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.data != null && t.hasOwnProperty("data")) {
          let e = c.dot.v4.DataAuthenticationStatus.verify(t.data);
          if (e)
            return "data." + e;
        }
        if (t.chip != null && t.hasOwnProperty("chip")) {
          let e = c.dot.v4.ChipAuthenticationStatus.verify(t.chip);
          if (e)
            return "chip." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.AuthenticationStatus)
          return t;
        let e = new c.dot.v4.AuthenticationStatus();
        if (t.data != null) {
          if (typeof t.data != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.data: object expected");
          e.data = c.dot.v4.DataAuthenticationStatus.fromObject(t.data);
        }
        if (t.chip != null) {
          if (typeof t.chip != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.chip: object expected");
          e.chip = c.dot.v4.ChipAuthenticationStatus.fromObject(t.chip);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.data = null, n.chip = null), t.data != null && t.hasOwnProperty("data") && (n.data = c.dot.v4.DataAuthenticationStatus.toObject(t.data, e)), t.chip != null && t.hasOwnProperty("chip") && (n.chip = c.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, r;
    }(), s.DataAuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.status = 0, r.prototype.protocol = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.DataAuthenticationStatus();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.status = t.int32();
              break;
            }
            case 2: {
              a.protocol = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.status != null && t.hasOwnProperty("status"))
          switch (t.status) {
            default:
              return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        if (t.protocol != null && t.hasOwnProperty("protocol"))
          switch (t.protocol) {
            default:
              return "protocol: enum value expected";
            case 0:
            case 1:
              break;
          }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.DataAuthenticationStatus)
          return t;
        let e = new c.dot.v4.DataAuthenticationStatus();
        switch (t.status) {
          default:
            if (typeof t.status == "number") {
              e.status = t.status;
              break;
            }
            break;
          case "STATUS_UNSPECIFIED":
          case 0:
            e.status = 0;
            break;
          case "STATUS_AUTHENTICATED":
          case 1:
            e.status = 1;
            break;
          case "STATUS_DENIED":
          case 2:
            e.status = 2;
            break;
          case "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED":
          case 3:
            e.status = 3;
            break;
        }
        switch (t.protocol) {
          default:
            if (typeof t.protocol == "number") {
              e.protocol = t.protocol;
              break;
            }
            break;
          case "PROTOCOL_UNSPECIFIED":
          case 0:
            e.protocol = 0;
            break;
          case "PROTOCOL_PASSIVE_AUTHENTICATION":
          case 1:
            e.protocol = 1;
            break;
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, n.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && t.hasOwnProperty("status") && (n.status = e.enums === String ? c.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : c.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && t.hasOwnProperty("protocol") && (n.protocol = e.enums === String ? c.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : c.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, r.Status = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      }(), r.Protocol = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      }(), r;
    }(), s.ChipAuthenticationStatus = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.status = 0, r.prototype.protocol = null, r.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(r.prototype, "_protocol", {
        get: m.oneOfGetter(t = ["protocol"]),
        set: m.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_activeAuthenticationResponse", {
        get: m.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = R.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.status), e.protocol != null && Object.hasOwnProperty.call(e, "protocol") && n.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(e.protocol), e.activeAuthenticationResponse != null && Object.hasOwnProperty.call(e, "activeAuthenticationResponse") && n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(e.activeAuthenticationResponse), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 1: {
              d.status = e.int32();
              break;
            }
            case 2: {
              d.protocol = e.int32();
              break;
            }
            case 3: {
              d.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.status != null && e.hasOwnProperty("status"))
          switch (e.status) {
            default:
              return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        if (e.protocol != null && e.hasOwnProperty("protocol"))
          switch (e.protocol) {
            default:
              return "protocol: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        return e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || m.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.ChipAuthenticationStatus)
          return e;
        let n = new c.dot.v4.ChipAuthenticationStatus();
        switch (e.status) {
          default:
            if (typeof e.status == "number") {
              n.status = e.status;
              break;
            }
            break;
          case "STATUS_UNSPECIFIED":
          case 0:
            n.status = 0;
            break;
          case "STATUS_AUTHENTICATED":
          case 1:
            n.status = 1;
            break;
          case "STATUS_DENIED":
          case 2:
            n.status = 2;
            break;
          case "STATUS_NOT_SUPPORTED":
          case 3:
            n.status = 3;
            break;
        }
        switch (e.protocol) {
          default:
            if (typeof e.protocol == "number") {
              n.protocol = e.protocol;
              break;
            }
            break;
          case "PROTOCOL_UNSPECIFIED":
          case 0:
            n.protocol = 0;
            break;
          case "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING":
          case 1:
            n.protocol = 1;
            break;
          case "PROTOCOL_CHIP_AUTHENTICATION":
          case 2:
            n.protocol = 2;
            break;
          case "PROTOCOL_ACTIVE_AUTHENTICATION":
          case 3:
            n.protocol = 3;
            break;
        }
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? m.base64.decode(e.activeAuthenticationResponse, n.activeAuthenticationResponse = m.newBuffer(m.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (n.activeAuthenticationResponse = e.activeAuthenticationResponse)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        return n.defaults && (a.status = n.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (a.status = n.enums === String ? c.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : c.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (a.protocol = n.enums === String ? c.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : c.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, n.oneofs && (a._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (a.activeAuthenticationResponse = n.bytes === String ? m.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : n.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, n.oneofs && (a._activeAuthenticationResponse = "activeAuthenticationResponse")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, r.Status = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "STATUS_UNSPECIFIED"] = 0, n[e[1] = "STATUS_AUTHENTICATED"] = 1, n[e[2] = "STATUS_DENIED"] = 2, n[e[3] = "STATUS_NOT_SUPPORTED"] = 3, n;
      }(), r.Protocol = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, n[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, n[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, n[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, n;
      }(), r;
    }(), s.EyeGazeLivenessContent = function() {
      function r(e) {
        if (this.segments = [], e)
          for (let n = Object.keys(e), a = 0; a < n.length; ++a)
            e[n[a]] != null && (this[n[a]] = e[n[a]]);
      }
      r.prototype.image = null, r.prototype.segments = m.emptyArray, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_image", {
        get: m.oneOfGetter(t = ["image"]),
        set: m.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = R.create()), e.segments != null && e.segments.length)
          for (let a = 0; a < e.segments.length; ++a)
            c.dot.v4.EyeGazeLivenessSegment.encode(e.segments[a], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && c.dot.Image.encode(e.image, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof v || (e = v.create(e));
        let a = n === void 0 ? e.len : e.pos + n, d = new c.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < a; ) {
          let y = e.uint32();
          switch (y >>> 3) {
            case 3: {
              d.image = c.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              d.segments && d.segments.length || (d.segments = []), d.segments.push(c.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 2: {
              d.metadata = c.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = c.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.segments != null && e.hasOwnProperty("segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let n = 0; n < e.segments.length; ++n) {
            let a = c.dot.v4.EyeGazeLivenessSegment.verify(e.segments[n]);
            if (a)
              return "segments." + a;
          }
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = c.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof c.dot.v4.EyeGazeLivenessContent)
          return e;
        let n = new c.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          n.image = c.dot.Image.fromObject(e.image);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          n.segments = [];
          for (let a = 0; a < e.segments.length; ++a) {
            if (typeof e.segments[a] != "object")
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            n.segments[a] = c.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[a]);
          }
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          n.metadata = c.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let a = {};
        if ((n.arrays || n.defaults) && (a.segments = []), n.defaults && (a.metadata = null), e.segments && e.segments.length) {
          a.segments = [];
          for (let d = 0; d < e.segments.length; ++d)
            a.segments[d] = c.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[d], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = c.dot.v4.Metadata.toObject(e.metadata, n)), e.image != null && e.hasOwnProperty("image") && (a.image = c.dot.Image.toObject(e.image, n), n.oneofs && (a._image = "image")), a;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, r;
    }(), s.EyeGazeLivenessSegment = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.corner = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.corner = t.int32();
              break;
            }
            case 2: {
              a.image = c.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.corner != null && t.hasOwnProperty("corner"))
          switch (t.corner) {
            default:
              return "corner: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = c.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.EyeGazeLivenessSegment)
          return t;
        let e = new c.dot.v4.EyeGazeLivenessSegment();
        switch (t.corner) {
          default:
            if (typeof t.corner == "number") {
              e.corner = t.corner;
              break;
            }
            break;
          case "TOP_LEFT":
          case 0:
            e.corner = 0;
            break;
          case "TOP_RIGHT":
          case 1:
            e.corner = 1;
            break;
          case "BOTTOM_RIGHT":
          case 2:
            e.corner = 2;
            break;
          case "BOTTOM_LEFT":
          case 3:
            e.corner = 3;
            break;
        }
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessSegment.image: object expected");
          e.image = c.dot.Image.fromObject(t.image);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.corner = e.enums === String ? "TOP_LEFT" : 0, n.image = null), t.corner != null && t.hasOwnProperty("corner") && (n.corner = e.enums === String ? c.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : c.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && t.hasOwnProperty("image") && (n.image = c.dot.Image.toObject(t.image, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, r;
    }(), s.EyeGazeLivenessCorner = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "TOP_LEFT"] = 0, t[r[1] = "TOP_RIGHT"] = 1, t[r[2] = "BOTTOM_RIGHT"] = 2, t[r[3] = "BOTTOM_LEFT"] = 3, t;
    }(), s.SmileLivenessContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.neutralExpressionFaceImage = null, r.prototype.smileExpressionFaceImage = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(t, "neutralExpressionFaceImage") && c.dot.Image.encode(t.neutralExpressionFaceImage, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.smileExpressionFaceImage != null && Object.hasOwnProperty.call(t, "smileExpressionFaceImage") && c.dot.Image.encode(t.smileExpressionFaceImage, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.SmileLivenessContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.neutralExpressionFaceImage = c.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.smileExpressionFaceImage = c.dot.Image.decode(t, t.uint32());
              break;
            }
            case 3: {
              a.metadata = c.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.neutralExpressionFaceImage != null && t.hasOwnProperty("neutralExpressionFaceImage")) {
          let e = c.dot.Image.verify(t.neutralExpressionFaceImage);
          if (e)
            return "neutralExpressionFaceImage." + e;
        }
        if (t.smileExpressionFaceImage != null && t.hasOwnProperty("smileExpressionFaceImage")) {
          let e = c.dot.Image.verify(t.smileExpressionFaceImage);
          if (e)
            return "smileExpressionFaceImage." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = c.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.SmileLivenessContent)
          return t;
        let e = new c.dot.v4.SmileLivenessContent();
        if (t.neutralExpressionFaceImage != null) {
          if (typeof t.neutralExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          e.neutralExpressionFaceImage = c.dot.Image.fromObject(t.neutralExpressionFaceImage);
        }
        if (t.smileExpressionFaceImage != null) {
          if (typeof t.smileExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          e.smileExpressionFaceImage = c.dot.Image.fromObject(t.smileExpressionFaceImage);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          e.metadata = c.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.neutralExpressionFaceImage = null, n.smileExpressionFaceImage = null, n.metadata = null), t.neutralExpressionFaceImage != null && t.hasOwnProperty("neutralExpressionFaceImage") && (n.neutralExpressionFaceImage = c.dot.Image.toObject(t.neutralExpressionFaceImage, e)), t.smileExpressionFaceImage != null && t.hasOwnProperty("smileExpressionFaceImage") && (n.smileExpressionFaceImage = c.dot.Image.toObject(t.smileExpressionFaceImage, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = c.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.SmileLivenessContent";
      }, r;
    }(), s.PalmContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = R.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof v || (t = v.create(t));
        let n = e === void 0 ? t.len : t.pos + e, a = new c.dot.v4.PalmContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              a.image = c.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              a.metadata = c.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = c.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = c.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof c.dot.v4.PalmContent)
          return t;
        let e = new c.dot.v4.PalmContent();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          e.image = c.dot.Image.fromObject(t.image);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          e.metadata = c.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.metadata = null), t.image != null && t.hasOwnProperty("image") && (n.image = c.dot.Image.toObject(t.image, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = c.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.PalmContent";
      }, r;
    }(), s;
  }(), u.Image = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.bytes = m.newBuffer([]), s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = R.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t) {
      r instanceof v || (r = v.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new c.dot.Image();
      for (; r.pos < e; ) {
        let a = r.uint32();
        switch (a >>> 3) {
          case 1: {
            n.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(a & 7);
            break;
        }
      }
      return n;
    }, s.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || m.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof c.dot.Image)
        return r;
      let t = new c.dot.Image();
      return r.bytes != null && (typeof r.bytes == "string" ? m.base64.decode(r.bytes, t.bytes = m.newBuffer(m.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = m.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? m.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Image";
    }, s;
  }(), u.ImageSize = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.width = 0, s.prototype.height = 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = R.create()), r.width != null && Object.hasOwnProperty.call(r, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.width), r.height != null && Object.hasOwnProperty.call(r, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.height), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t) {
      r instanceof v || (r = v.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new c.dot.ImageSize();
      for (; r.pos < e; ) {
        let a = r.uint32();
        switch (a >>> 3) {
          case 1: {
            n.width = r.int32();
            break;
          }
          case 2: {
            n.height = r.int32();
            break;
          }
          default:
            r.skipType(a & 7);
            break;
        }
      }
      return n;
    }, s.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.width != null && r.hasOwnProperty("width") && !m.isInteger(r.width) ? "width: integer expected" : r.height != null && r.hasOwnProperty("height") && !m.isInteger(r.height) ? "height: integer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof c.dot.ImageSize)
        return r;
      let t = new c.dot.ImageSize();
      return r.width != null && (t.width = r.width | 0), r.height != null && (t.height = r.height | 0), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), r.width != null && r.hasOwnProperty("width") && (e.width = r.width), r.height != null && r.hasOwnProperty("height") && (e.height = r.height), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageSize";
    }, s;
  }(), u.Int32List = function() {
    function s(r) {
      if (this.items = [], r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.items = m.emptyArray, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      if (t || (t = R.create()), r.items != null && r.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < r.items.length; ++e)
          t.int32(r.items[e]);
        t.ldelim();
      }
      return t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t) {
      r instanceof v || (r = v.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new c.dot.Int32List();
      for (; r.pos < e; ) {
        let a = r.uint32();
        switch (a >>> 3) {
          case 1: {
            if (n.items && n.items.length || (n.items = []), (a & 7) === 2) {
              let d = r.uint32() + r.pos;
              for (; r.pos < d; )
                n.items.push(r.int32());
            } else
              n.items.push(r.int32());
            break;
          }
          default:
            r.skipType(a & 7);
            break;
        }
      }
      return n;
    }, s.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.items != null && r.hasOwnProperty("items")) {
        if (!Array.isArray(r.items))
          return "items: array expected";
        for (let t = 0; t < r.items.length; ++t)
          if (!m.isInteger(r.items[t]))
            return "items: integer[] expected";
      }
      return null;
    }, s.fromObject = function(r) {
      if (r instanceof c.dot.Int32List)
        return r;
      let t = new c.dot.Int32List();
      if (r.items) {
        if (!Array.isArray(r.items))
          throw TypeError(".dot.Int32List.items: array expected");
        t.items = [];
        for (let e = 0; e < r.items.length; ++e)
          t.items[e] = r.items[e] | 0;
      }
      return t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), r.items && r.items.length) {
        e.items = [];
        for (let n = 0; n < r.items.length; ++n)
          e.items[n] = r.items[n];
      }
      return e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Int32List";
    }, s;
  }(), u.Platform = function() {
    const s = {}, r = Object.create(s);
    return r[s[0] = "WEB"] = 0, r[s[1] = "ANDROID"] = 1, r[s[2] = "IOS"] = 2, r;
  }(), u.RectangleDouble = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.left = 0, s.prototype.top = 0, s.prototype.right = 0, s.prototype.bottom = 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = R.create()), r.left != null && Object.hasOwnProperty.call(r, "left") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(r.left), r.top != null && Object.hasOwnProperty.call(r, "top") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(r.top), r.right != null && Object.hasOwnProperty.call(r, "right") && t.uint32(
        /* id 3, wireType 1 =*/
        25
      ).double(r.right), r.bottom != null && Object.hasOwnProperty.call(r, "bottom") && t.uint32(
        /* id 4, wireType 1 =*/
        33
      ).double(r.bottom), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t) {
      r instanceof v || (r = v.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new c.dot.RectangleDouble();
      for (; r.pos < e; ) {
        let a = r.uint32();
        switch (a >>> 3) {
          case 1: {
            n.left = r.double();
            break;
          }
          case 2: {
            n.top = r.double();
            break;
          }
          case 3: {
            n.right = r.double();
            break;
          }
          case 4: {
            n.bottom = r.double();
            break;
          }
          default:
            r.skipType(a & 7);
            break;
        }
      }
      return n;
    }, s.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.left != null && r.hasOwnProperty("left") && typeof r.left != "number" ? "left: number expected" : r.top != null && r.hasOwnProperty("top") && typeof r.top != "number" ? "top: number expected" : r.right != null && r.hasOwnProperty("right") && typeof r.right != "number" ? "right: number expected" : r.bottom != null && r.hasOwnProperty("bottom") && typeof r.bottom != "number" ? "bottom: number expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof c.dot.RectangleDouble)
        return r;
      let t = new c.dot.RectangleDouble();
      return r.left != null && (t.left = Number(r.left)), r.top != null && (t.top = Number(r.top)), r.right != null && (t.right = Number(r.right)), r.bottom != null && (t.bottom = Number(r.bottom)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), r.left != null && r.hasOwnProperty("left") && (e.left = t.json && !isFinite(r.left) ? String(r.left) : r.left), r.top != null && r.hasOwnProperty("top") && (e.top = t.json && !isFinite(r.top) ? String(r.top) : r.top), r.right != null && r.hasOwnProperty("right") && (e.right = t.json && !isFinite(r.right) ? String(r.right) : r.right), r.bottom != null && r.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(r.bottom) ? String(r.bottom) : r.bottom), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.RectangleDouble";
    }, s;
  }(), u.DigestWithTimestamp = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.digest = m.newBuffer([]), s.prototype.timestampMillis = m.Long ? m.Long.fromBits(0, 0, !0) : 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = R.create()), r.digest != null && Object.hasOwnProperty.call(r, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.digest), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t) {
      r instanceof v || (r = v.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new c.dot.DigestWithTimestamp();
      for (; r.pos < e; ) {
        let a = r.uint32();
        switch (a >>> 3) {
          case 1: {
            n.digest = r.bytes();
            break;
          }
          case 2: {
            n.timestampMillis = r.uint64();
            break;
          }
          default:
            r.skipType(a & 7);
            break;
        }
      }
      return n;
    }, s.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.digest != null && r.hasOwnProperty("digest") && !(r.digest && typeof r.digest.length == "number" || m.isString(r.digest)) ? "digest: buffer expected" : r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !m.isInteger(r.timestampMillis) && !(r.timestampMillis && m.isInteger(r.timestampMillis.low) && m.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof c.dot.DigestWithTimestamp)
        return r;
      let t = new c.dot.DigestWithTimestamp();
      return r.digest != null && (typeof r.digest == "string" ? m.base64.decode(r.digest, t.digest = m.newBuffer(m.base64.length(r.digest)), 0) : r.digest.length >= 0 && (t.digest = r.digest)), r.timestampMillis != null && (m.Long ? (t.timestampMillis = m.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new m.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = m.newBuffer(e.digest))), m.Long) {
          let n = new m.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.digest != null && r.hasOwnProperty("digest") && (e.digest = t.bytes === String ? m.base64.encode(r.digest, 0, r.digest.length) : t.bytes === Array ? Array.prototype.slice.call(r.digest) : r.digest), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? m.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new m.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.DigestWithTimestamp";
    }, s;
  }(), u;
})();
var ui = (() => {
  var u = import.meta.url;
  return async function(s = {}) {
    var r, t = s, e, n, a = new Promise((i, o) => {
      e = i, n = o;
    }), d = typeof window == "object", y = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var O = Object.assign({}, t), S = (i, o) => {
      throw o;
    }, A = "";
    function k(i) {
      return t.locateFile ? t.locateFile(i, A) : A + i;
    }
    var $, Q;
    (d || y) && (y ? A = self.location.href : typeof document < "u" && document.currentScript && (A = document.currentScript.src), u && (A = u), A.startsWith("blob:") ? A = "" : A = A.slice(0, A.replace(/[?#].*/, "").lastIndexOf("/") + 1), y && (Q = (i) => {
      var o = new XMLHttpRequest();
      return o.open("GET", i, !1), o.responseType = "arraybuffer", o.send(null), new Uint8Array(o.response);
    }), $ = async (i) => {
      if (st(i))
        return new Promise((l, f) => {
          var p = new XMLHttpRequest();
          p.open("GET", i, !0), p.responseType = "arraybuffer", p.onload = () => {
            if (p.status == 200 || p.status == 0 && p.response) {
              l(p.response);
              return;
            }
            f(p.status);
          }, p.onerror = f, p.send(null);
        });
      var o = await fetch(i, { credentials: "same-origin" });
      if (o.ok)
        return o.arrayBuffer();
      throw new Error(o.status + " : " + o.url);
    }), t.print || console.log.bind(console);
    var Oe = t.printErr || console.error.bind(console);
    Object.assign(t, O), O = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var we = t.wasmBinary, Pe, ee = !1, Ce, te, U, de, Se, re, _, nt, ot, it, at, st = (i) => i.startsWith("file://");
    function lt() {
      var i = Pe.buffer;
      t.HEAP8 = te = new Int8Array(i), t.HEAP16 = de = new Int16Array(i), t.HEAPU8 = U = new Uint8Array(i), t.HEAPU16 = Se = new Uint16Array(i), t.HEAP32 = re = new Int32Array(i), t.HEAPU32 = _ = new Uint32Array(i), t.HEAPF32 = nt = new Float32Array(i), t.HEAPF64 = at = new Float64Array(i), t.HEAP64 = ot = new BigInt64Array(i), t.HEAPU64 = it = new BigUint64Array(i);
    }
    function Qt() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          fr(t.preRun.shift());
      ut(ft);
    }
    function er() {
      j.A();
    }
    function tr() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          dr(t.postRun.shift());
      ut(dt);
    }
    var ne = 0, fe = null;
    function rr(i) {
      var o;
      ne++, (o = t.monitorRunDependencies) == null || o.call(t, ne);
    }
    function nr(i) {
      var l;
      if (ne--, (l = t.monitorRunDependencies) == null || l.call(t, ne), ne == 0 && fe) {
        var o = fe;
        fe = null, o();
      }
    }
    function Ie(i) {
      var l;
      (l = t.onAbort) == null || l.call(t, i), i = "Aborted(" + i + ")", Oe(i), ee = !0, i += ". Build with -sASSERTIONS for more info.";
      var o = new WebAssembly.RuntimeError(i);
      throw n(o), o;
    }
    var Ne;
    function or() {
      return t.locateFile ? k("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function ir(i) {
      if (i == Ne && we)
        return new Uint8Array(we);
      if (Q)
        return Q(i);
      throw "both async and sync fetching of the wasm failed";
    }
    async function ar(i) {
      if (!we)
        try {
          var o = await $(i);
          return new Uint8Array(o);
        } catch {
        }
      return ir(i);
    }
    async function sr(i, o) {
      try {
        var l = await ar(i), f = await WebAssembly.instantiate(l, o);
        return f;
      } catch (p) {
        Oe(`failed to asynchronously prepare wasm: ${p}`), Ie(p);
      }
    }
    async function lr(i, o, l) {
      if (!i && typeof WebAssembly.instantiateStreaming == "function" && !st(o))
        try {
          var f = fetch(o, { credentials: "same-origin" }), p = await WebAssembly.instantiateStreaming(f, l);
          return p;
        } catch (g) {
          Oe(`wasm streaming compile failed: ${g}`), Oe("falling back to ArrayBuffer instantiation");
        }
      return sr(o, l);
    }
    function cr() {
      return { a: Rn };
    }
    async function ur() {
      function i(g, b) {
        return j = g.exports, j = P.instrumentWasmExports(j), Pe = j.z, lt(), j.F, nr(), j;
      }
      rr();
      function o(g) {
        return i(g.instance);
      }
      var l = cr();
      if (t.instantiateWasm)
        return new Promise((g, b) => {
          t.instantiateWasm(l, (h, w) => {
            i(h), g(h.exports);
          });
        });
      Ne ?? (Ne = or());
      try {
        var f = await lr(we, Ne, l), p = o(f);
        return p;
      } catch (g) {
        return n(g), Promise.reject(g);
      }
    }
    class ct {
      constructor(o) {
        Wt(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${o})`, this.status = o;
      }
    }
    var ut = (i) => {
      for (; i.length > 0; )
        i.shift()(t);
    }, dt = [], dr = (i) => dt.unshift(i), ft = [], fr = (i) => ft.unshift(i), pt = t.noExitRuntime || !0;
    class pr {
      constructor(o) {
        this.excPtr = o, this.ptr = o - 24;
      }
      set_type(o) {
        _[this.ptr + 4 >> 2] = o;
      }
      get_type() {
        return _[this.ptr + 4 >> 2];
      }
      set_destructor(o) {
        _[this.ptr + 8 >> 2] = o;
      }
      get_destructor() {
        return _[this.ptr + 8 >> 2];
      }
      set_caught(o) {
        o = o ? 1 : 0, te[this.ptr + 12] = o;
      }
      get_caught() {
        return te[this.ptr + 12] != 0;
      }
      set_rethrown(o) {
        o = o ? 1 : 0, te[this.ptr + 13] = o;
      }
      get_rethrown() {
        return te[this.ptr + 13] != 0;
      }
      init(o, l) {
        this.set_adjusted_ptr(0), this.set_type(o), this.set_destructor(l);
      }
      set_adjusted_ptr(o) {
        _[this.ptr + 16 >> 2] = o;
      }
      get_adjusted_ptr() {
        return _[this.ptr + 16 >> 2];
      }
    }
    var mt = 0, mr = (i, o, l) => {
      var f = new pr(i);
      throw f.init(o, l), mt = i, mt;
    }, hr = () => Ie(""), je = (i) => {
      if (i === null)
        return "null";
      var o = typeof i;
      return o === "object" || o === "array" || o === "function" ? i.toString() : "" + i;
    }, yr = () => {
      for (var i = new Array(256), o = 0; o < 256; ++o)
        i[o] = String.fromCharCode(o);
      ht = i;
    }, ht, N = (i) => {
      for (var o = "", l = i; U[l]; )
        o += ht[U[l++]];
      return o;
    }, ae = {}, oe = {}, Te = {}, se, T = (i) => {
      throw new se(i);
    }, yt, Ae = (i) => {
      throw new yt(i);
    }, le = (i, o, l) => {
      i.forEach((h) => Te[h] = o);
      function f(h) {
        var w = l(h);
        w.length !== i.length && Ae("Mismatched type converter count");
        for (var I = 0; I < i.length; ++I)
          G(i[I], w[I]);
      }
      var p = new Array(o.length), g = [], b = 0;
      o.forEach((h, w) => {
        oe.hasOwnProperty(h) ? p[w] = oe[h] : (g.push(h), ae.hasOwnProperty(h) || (ae[h] = []), ae[h].push(() => {
          p[w] = oe[h], ++b, b === g.length && f(p);
        }));
      }), g.length === 0 && f(p);
    };
    function gr(i, o, l = {}) {
      var f = o.name;
      if (i || T(`type "${f}" must have a positive integer typeid pointer`), oe.hasOwnProperty(i)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        T(`Cannot register type '${f}' twice`);
      }
      if (oe[i] = o, delete Te[i], ae.hasOwnProperty(i)) {
        var p = ae[i];
        delete ae[i], p.forEach((g) => g());
      }
    }
    function G(i, o, l = {}) {
      return gr(i, o, l);
    }
    var gt = (i, o, l) => {
      switch (o) {
        case 1:
          return l ? (f) => te[f] : (f) => U[f];
        case 2:
          return l ? (f) => de[f >> 1] : (f) => Se[f >> 1];
        case 4:
          return l ? (f) => re[f >> 2] : (f) => _[f >> 2];
        case 8:
          return l ? (f) => ot[f >> 3] : (f) => it[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${o}): ${i}`);
      }
    }, br = (i, o, l, f, p) => {
      o = N(o);
      var g = o.indexOf("u") != -1;
      G(i, { name: o, fromWireType: (b) => b, toWireType: function(b, h) {
        if (typeof h != "bigint" && typeof h != "number")
          throw new TypeError(`Cannot convert "${je(h)}" to ${this.name}`);
        return typeof h == "number" && (h = BigInt(h)), h;
      }, argPackAdvance: V, readValueFromPointer: gt(o, l, !g), destructorFunction: null });
    }, V = 8, vr = (i, o, l, f) => {
      o = N(o), G(i, { name: o, fromWireType: function(p) {
        return !!p;
      }, toWireType: function(p, g) {
        return g ? l : f;
      }, argPackAdvance: V, readValueFromPointer: function(p) {
        return this.fromWireType(U[p]);
      }, destructorFunction: null });
    }, Or = (i) => ({ count: i.count, deleteScheduled: i.deleteScheduled, preservePointerOnDelete: i.preservePointerOnDelete, ptr: i.ptr, ptrType: i.ptrType, smartPtr: i.smartPtr, smartPtrType: i.smartPtrType }), We = (i) => {
      function o(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      T(o(i) + " instance already deleted");
    }, Ue = !1, bt = (i) => {
    }, wr = (i) => {
      i.smartPtr ? i.smartPtrType.rawDestructor(i.smartPtr) : i.ptrType.registeredClass.rawDestructor(i.ptr);
    }, vt = (i) => {
      i.count.value -= 1;
      var o = i.count.value === 0;
      o && wr(i);
    }, Ot = (i, o, l) => {
      if (o === l)
        return i;
      if (l.baseClass === void 0)
        return null;
      var f = Ot(i, o, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, wt = {}, Pr = {}, Cr = (i, o) => {
      for (o === void 0 && T("ptr should not be undefined"); i.baseClass; )
        o = i.upcast(o), i = i.baseClass;
      return o;
    }, Sr = (i, o) => (o = Cr(i, o), Pr[o]), De = (i, o) => {
      (!o.ptrType || !o.ptr) && Ae("makeClassHandle requires ptr and ptrType");
      var l = !!o.smartPtrType, f = !!o.smartPtr;
      return l !== f && Ae("Both smartPtrType and smartPtr must be specified"), o.count = { value: 1 }, pe(Object.create(i, { $$: { value: o, writable: !0 } }));
    };
    function Ir(i) {
      var o = this.getPointee(i);
      if (!o)
        return this.destructor(i), null;
      var l = Sr(this.registeredClass, o);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = o, l.$$.smartPtr = i, l.clone();
        var f = l.clone();
        return this.destructor(i), f;
      }
      function p() {
        return this.isSmartPointer ? De(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: o, smartPtrType: this, smartPtr: i }) : De(this.registeredClass.instancePrototype, { ptrType: this, ptr: i });
      }
      var g = this.registeredClass.getActualType(o), b = wt[g];
      if (!b)
        return p.call(this);
      var h;
      this.isConst ? h = b.constPointerType : h = b.pointerType;
      var w = Ot(o, this.registeredClass, h.registeredClass);
      return w === null ? p.call(this) : this.isSmartPointer ? De(h.registeredClass.instancePrototype, { ptrType: h, ptr: w, smartPtrType: this, smartPtr: i }) : De(h.registeredClass.instancePrototype, { ptrType: h, ptr: w });
    }
    var pe = (i) => typeof FinalizationRegistry > "u" ? (pe = (o) => o, i) : (Ue = new FinalizationRegistry((o) => {
      vt(o.$$);
    }), pe = (o) => {
      var l = o.$$, f = !!l.smartPtr;
      if (f) {
        var p = { $$: l };
        Ue.register(o, p, o);
      }
      return o;
    }, bt = (o) => Ue.unregister(o), pe(i)), _e = [], jr = () => {
      for (; _e.length; ) {
        var i = _e.pop();
        i.$$.deleteScheduled = !1, i.delete();
      }
    }, Pt, Tr = () => {
      Object.assign(ke.prototype, { isAliasOf(i) {
        if (!(this instanceof ke) || !(i instanceof ke))
          return !1;
        var o = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        i.$$ = i.$$;
        for (var f = i.$$.ptrType.registeredClass, p = i.$$.ptr; o.baseClass; )
          l = o.upcast(l), o = o.baseClass;
        for (; f.baseClass; )
          p = f.upcast(p), f = f.baseClass;
        return o === f && l === p;
      }, clone() {
        if (this.$$.ptr || We(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var i = pe(Object.create(Object.getPrototypeOf(this), { $$: { value: Or(this.$$) } }));
        return i.$$.count.value += 1, i.$$.deleteScheduled = !1, i;
      }, delete() {
        this.$$.ptr || We(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && T("Object already scheduled for deletion"), bt(this), vt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || We(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && T("Object already scheduled for deletion"), _e.push(this), _e.length === 1 && Pt && Pt(jr), this.$$.deleteScheduled = !0, this;
      } });
    };
    function ke() {
    }
    var ze = (i, o) => Object.defineProperty(o, "name", { value: i }), Ar = (i, o, l) => {
      if (i[o].overloadTable === void 0) {
        var f = i[o];
        i[o] = function(...p) {
          return i[o].overloadTable.hasOwnProperty(p.length) || T(`Function '${l}' called with an invalid number of arguments (${p.length}) - expects one of (${i[o].overloadTable})!`), i[o].overloadTable[p.length].apply(this, p);
        }, i[o].overloadTable = [], i[o].overloadTable[f.argCount] = f;
      }
    }, Ct = (i, o, l) => {
      t.hasOwnProperty(i) ? ((l === void 0 || t[i].overloadTable !== void 0 && t[i].overloadTable[l] !== void 0) && T(`Cannot register public name '${i}' twice`), Ar(t, i, i), t[i].overloadTable.hasOwnProperty(l) && T(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[i].overloadTable[l] = o) : (t[i] = o, t[i].argCount = l);
    }, Dr = 48, _r = 57, kr = (i) => {
      i = i.replace(/[^a-zA-Z0-9_]/g, "$");
      var o = i.charCodeAt(0);
      return o >= Dr && o <= _r ? `_${i}` : i;
    };
    function Er(i, o, l, f, p, g, b, h) {
      this.name = i, this.constructor = o, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = p, this.getActualType = g, this.upcast = b, this.downcast = h, this.pureVirtualFunctions = [];
    }
    var Ee = (i, o, l) => {
      for (; o !== l; )
        o.upcast || T(`Expected null or instance of ${l.name}, got an instance of ${o.name}`), i = o.upcast(i), o = o.baseClass;
      return i;
    };
    function Fr(i, o) {
      if (o === null)
        return this.isReference && T(`null is not a valid ${this.name}`), 0;
      o.$$ || T(`Cannot pass "${je(o)}" as a ${this.name}`), o.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Ee(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Rr(i, o) {
      var l;
      if (o === null)
        return this.isReference && T(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), i !== null && i.push(this.rawDestructor, l), l) : 0;
      (!o || !o.$$) && T(`Cannot pass "${je(o)}" as a ${this.name}`), o.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && o.$$.ptrType.isConst && T(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
      var f = o.$$.ptrType.registeredClass;
      if (l = Ee(o.$$.ptr, f, this.registeredClass), this.isSmartPointer)
        switch (o.$$.smartPtr === void 0 && T("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            o.$$.smartPtrType === this ? l = o.$$.smartPtr : T(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            l = o.$$.smartPtr;
            break;
          case 2:
            if (o.$$.smartPtrType === this)
              l = o.$$.smartPtr;
            else {
              var p = o.clone();
              l = this.rawShare(l, z.toHandle(() => p.delete())), i !== null && i.push(this.rawDestructor, l);
            }
            break;
          default:
            T("Unsupporting sharing policy");
        }
      return l;
    }
    function Mr(i, o) {
      if (o === null)
        return this.isReference && T(`null is not a valid ${this.name}`), 0;
      o.$$ || T(`Cannot pass "${je(o)}" as a ${this.name}`), o.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`), o.$$.ptrType.isConst && T(`Cannot convert argument of type ${o.$$.ptrType.name} to parameter type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Ee(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Fe(i) {
      return this.fromWireType(_[i >> 2]);
    }
    var Lr = () => {
      Object.assign(Re.prototype, { getPointee(i) {
        return this.rawGetPointee && (i = this.rawGetPointee(i)), i;
      }, destructor(i) {
        var o;
        (o = this.rawDestructor) == null || o.call(this, i);
      }, argPackAdvance: V, readValueFromPointer: Fe, fromWireType: Ir });
    };
    function Re(i, o, l, f, p, g, b, h, w, I, C) {
      this.name = i, this.registeredClass = o, this.isReference = l, this.isConst = f, this.isSmartPointer = p, this.pointeeType = g, this.sharingPolicy = b, this.rawGetPointee = h, this.rawConstructor = w, this.rawShare = I, this.rawDestructor = C, !p && o.baseClass === void 0 ? f ? (this.toWireType = Fr, this.destructorFunction = null) : (this.toWireType = Mr, this.destructorFunction = null) : this.toWireType = Rr;
    }
    var St = (i, o, l) => {
      t.hasOwnProperty(i) || Ae("Replacing nonexistent public symbol"), t[i].overloadTable !== void 0 && l !== void 0 ? t[i].overloadTable[l] = o : (t[i] = o, t[i].argCount = l);
    }, $r = (i, o, l) => {
      i = i.replace(/p/g, "i");
      var f = t["dynCall_" + i];
      return f(o, ...l);
    }, xr = (i, o, l = []) => {
      var f = $r(i, o, l);
      return f;
    }, Nr = (i, o) => (...l) => xr(i, o, l), K = (i, o) => {
      i = N(i);
      function l() {
        return Nr(i, o);
      }
      var f = l();
      return typeof f != "function" && T(`unknown function pointer with signature ${i}: ${o}`), f;
    }, Wr = (i, o) => {
      var l = ze(o, function(f) {
        this.name = o, this.message = f;
        var p = new Error(f).stack;
        p !== void 0 && (this.stack = this.toString() + `
` + p.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(i.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, It, jt = (i) => {
      var o = Mn(i), l = N(o);
      return J(o), l;
    }, me = (i, o) => {
      var l = [], f = {};
      function p(g) {
        if (!f[g] && !oe[g]) {
          if (Te[g]) {
            Te[g].forEach(p);
            return;
          }
          l.push(g), f[g] = !0;
        }
      }
      throw o.forEach(p), new It(`${i}: ` + l.map(jt).join([", "]));
    }, Ur = (i, o, l, f, p, g, b, h, w, I, C, D, F) => {
      C = N(C), g = K(p, g), h && (h = K(b, h)), I && (I = K(w, I)), F = K(D, F);
      var W = kr(C);
      Ct(W, function() {
        me(`Cannot construct ${C} due to unbound types`, [f]);
      }), le([i, o, l], f ? [f] : [], (H) => {
        var xt;
        H = H[0];
        var X, Y;
        f ? (X = H.registeredClass, Y = X.instancePrototype) : Y = ke.prototype;
        var x = ze(C, function(...Ze) {
          if (Object.getPrototypeOf(this) !== ie)
            throw new se("Use 'new' to construct " + C);
          if (M.constructor_body === void 0)
            throw new se(C + " has no accessible constructor");
          var Nt = M.constructor_body[Ze.length];
          if (Nt === void 0)
            throw new se(`Tried to invoke ctor of ${C} with invalid number of parameters (${Ze.length}) - expected (${Object.keys(M.constructor_body).toString()}) parameters instead!`);
          return Nt.apply(this, Ze);
        }), ie = Object.create(Y, { constructor: { value: x } });
        x.prototype = ie;
        var M = new Er(C, x, ie, F, X, g, h, I);
        M.baseClass && ((xt = M.baseClass).__derivedClasses ?? (xt.__derivedClasses = []), M.baseClass.__derivedClasses.push(M));
        var Ye = new Re(C, M, !0, !1, !1), Z = new Re(C + "*", M, !1, !1, !1), Le = new Re(C + " const*", M, !1, !0, !1);
        return wt[i] = { pointerType: Z, constPointerType: Le }, St(W, x), [Ye, Z, Le];
      });
    }, Tt = (i, o) => {
      for (var l = [], f = 0; f < i; f++)
        l.push(_[o + f * 4 >> 2]);
      return l;
    }, Ge = (i) => {
      for (; i.length; ) {
        var o = i.pop(), l = i.pop();
        l(o);
      }
    };
    function zr(i) {
      for (var o = 1; o < i.length; ++o)
        if (i[o] !== null && i[o].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Me = (i) => {
      try {
        return i();
      } catch (o) {
        Ie(o);
      }
    }, At = (i) => {
      if (i instanceof ct || i == "unwind")
        return Ce;
      S(1, i);
    }, Dt = 0, _t = () => pt || Dt > 0, kt = (i) => {
      var o;
      Ce = i, _t() || ((o = t.onExit) == null || o.call(t, i), ee = !0), S(i, new ct(i));
    }, Gr = (i, o) => {
      Ce = i, kt(i);
    }, Hr = Gr, Br = () => {
      if (!_t())
        try {
          Hr(Ce);
        } catch (i) {
          At(i);
        }
    }, Et = (i) => {
      if (!ee)
        try {
          i(), Br();
        } catch (o) {
          At(o);
        }
    }, P = { instrumentWasmImports(i) {
      var o = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(i))
        typeof f == "function" && (f.isAsync || o.test(l));
    }, instrumentWasmExports(i) {
      var o = {};
      for (let [l, f] of Object.entries(i))
        typeof f == "function" ? o[l] = (...p) => {
          P.exportCallStack.push(l);
          try {
            return f(...p);
          } finally {
            ee || (P.exportCallStack.pop(), P.maybeStopUnwind());
          }
        } : o[l] = f;
      return o;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(i) {
      var o = P.callStackNameToId[i];
      return o === void 0 && (o = P.callStackId++, P.callStackNameToId[i] = o, P.callStackIdToName[o] = i), o;
    }, maybeStopUnwind() {
      P.currData && P.state === P.State.Unwinding && P.exportCallStack.length === 0 && (P.state = P.State.Normal, Me(xn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((i, o) => {
        P.asyncPromiseHandlers = { resolve: i, reject: o };
      });
    }, allocateData() {
      var i = Ve(12 + P.StackSize);
      return P.setDataHeader(i, i + 12, P.StackSize), P.setDataRewindFunc(i), i;
    }, setDataHeader(i, o, l) {
      _[i >> 2] = o, _[i + 4 >> 2] = o + l;
    }, setDataRewindFunc(i) {
      var o = P.exportCallStack[0], l = P.getCallStackId(o);
      re[i + 8 >> 2] = l;
    }, getDataRewindFuncName(i) {
      var o = re[i + 8 >> 2], l = P.callStackIdToName[o];
      return l;
    }, getDataRewindFunc(i) {
      var o = j[i];
      return o;
    }, doRewind(i) {
      var o = P.getDataRewindFuncName(i), l = P.getDataRewindFunc(o);
      return l();
    }, handleSleep(i) {
      if (!ee) {
        if (P.state === P.State.Normal) {
          var o = !1, l = !1;
          i((f = 0) => {
            if (!ee && (P.handleSleepReturnValue = f, o = !0, !!l)) {
              P.state = P.State.Rewinding, Me(() => Nn(P.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var p, g = !1;
              try {
                p = P.doRewind(P.currData);
              } catch (w) {
                p = w, g = !0;
              }
              var b = !1;
              if (!P.currData) {
                var h = P.asyncPromiseHandlers;
                h && (P.asyncPromiseHandlers = null, (g ? h.reject : h.resolve)(p), b = !0);
              }
              if (g && !b)
                throw p;
            }
          }), l = !0, o || (P.state = P.State.Unwinding, P.currData = P.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Me(() => $n(P.currData)));
        } else P.state === P.State.Rewinding ? (P.state = P.State.Normal, Me(Wn), J(P.currData), P.currData = null, P.sleepCallbacks.forEach(Et)) : Ie(`invalid state: ${P.state}`);
        return P.handleSleepReturnValue;
      }
    }, handleAsync(i) {
      return P.handleSleep((o) => {
        i().then(o);
      });
    } };
    function Ft(i, o, l, f, p, g) {
      var b = o.length;
      b < 2 && T("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var h = o[1] !== null && l !== null, w = zr(o), I = o[0].name !== "void", C = b - 2, D = new Array(C), F = [], W = [], H = function(...X) {
        W.length = 0;
        var Y;
        F.length = h ? 2 : 1, F[0] = p, h && (Y = o[1].toWireType(W, this), F[1] = Y);
        for (var x = 0; x < C; ++x)
          D[x] = o[x + 2].toWireType(W, X[x]), F.push(D[x]);
        var ie = f(...F);
        function M(Ye) {
          if (w)
            Ge(W);
          else
            for (var Z = h ? 1 : 2; Z < o.length; Z++) {
              var Le = Z === 1 ? Y : D[Z - 2];
              o[Z].destructorFunction !== null && o[Z].destructorFunction(Le);
            }
          if (I)
            return o[0].fromWireType(Ye);
        }
        return P.currData ? P.whenDone().then(M) : M(ie);
      };
      return ze(i, H);
    }
    var Vr = (i, o, l, f, p, g) => {
      var b = Tt(o, l);
      p = K(f, p), le([], [i], (h) => {
        h = h[0];
        var w = `constructor ${h.name}`;
        if (h.registeredClass.constructor_body === void 0 && (h.registeredClass.constructor_body = []), h.registeredClass.constructor_body[o - 1] !== void 0)
          throw new se(`Cannot register multiple constructors with identical number of parameters (${o - 1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return h.registeredClass.constructor_body[o - 1] = () => {
          me(`Cannot construct ${h.name} due to unbound types`, b);
        }, le([], b, (I) => (I.splice(1, 0, null), h.registeredClass.constructor_body[o - 1] = Ft(w, I, null, p, g), [])), [];
      });
    }, Rt = (i, o, l) => (i instanceof Object || T(`${l} with invalid "this": ${i}`), i instanceof o.registeredClass.constructor || T(`${l} incompatible with "this" of type ${i.constructor.name}`), i.$$.ptr || T(`cannot call emscripten binding method ${l} on deleted object`), Ee(i.$$.ptr, i.$$.ptrType.registeredClass, o.registeredClass)), Jr = (i, o, l, f, p, g, b, h, w, I) => {
      o = N(o), p = K(f, p), le([], [i], (C) => {
        C = C[0];
        var D = `${C.name}.${o}`, F = { get() {
          me(`Cannot access ${D} due to unbound types`, [l, b]);
        }, enumerable: !0, configurable: !0 };
        return w ? F.set = () => me(`Cannot access ${D} due to unbound types`, [l, b]) : F.set = (W) => T(D + " is a read-only property"), Object.defineProperty(C.registeredClass.instancePrototype, o, F), le([], w ? [l, b] : [l], (W) => {
          var H = W[0], X = { get() {
            var x = Rt(this, C, D + " getter");
            return H.fromWireType(p(g, x));
          }, enumerable: !0 };
          if (w) {
            w = K(h, w);
            var Y = W[1];
            X.set = function(x) {
              var ie = Rt(this, C, D + " setter"), M = [];
              w(I, ie, Y.toWireType(M, x)), Ge(M);
            };
          }
          return Object.defineProperty(C.registeredClass.instancePrototype, o, X), [];
        }), [];
      });
    }, He = [], q = [], Be = (i) => {
      i > 9 && --q[i + 1] === 0 && (q[i] = void 0, He.push(i));
    }, Yr = () => q.length / 2 - 5 - He.length, Zr = () => {
      q.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Yr;
    }, z = { toValue: (i) => (i || T("Cannot use deleted val. handle = " + i), q[i]), toHandle: (i) => {
      switch (i) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const o = He.pop() || q.length;
          return q[o] = i, q[o + 1] = 1, o;
        }
      }
    } }, Kr = { name: "emscripten::val", fromWireType: (i) => {
      var o = z.toValue(i);
      return Be(i), o;
    }, toWireType: (i, o) => z.toHandle(o), argPackAdvance: V, readValueFromPointer: Fe, destructorFunction: null }, qr = (i) => G(i, Kr), Xr = (i, o) => {
      switch (o) {
        case 4:
          return function(l) {
            return this.fromWireType(nt[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(at[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${o}): ${i}`);
      }
    }, Qr = (i, o, l) => {
      o = N(o), G(i, { name: o, fromWireType: (f) => f, toWireType: (f, p) => p, argPackAdvance: V, readValueFromPointer: Xr(o, l), destructorFunction: null });
    }, en = (i) => {
      i = i.trim();
      const o = i.indexOf("(");
      return o === -1 ? i : i.slice(0, o);
    }, tn = (i, o, l, f, p, g, b, h) => {
      var w = Tt(o, l);
      i = N(i), i = en(i), p = K(f, p), Ct(i, function() {
        me(`Cannot call ${i} due to unbound types`, w);
      }, o - 1), le([], w, (I) => {
        var C = [I[0], null].concat(I.slice(1));
        return St(i, Ft(i, C, null, p, g), o - 1), [];
      });
    }, rn = (i, o, l, f, p) => {
      o = N(o);
      var g = (C) => C;
      if (f === 0) {
        var b = 32 - 8 * l;
        g = (C) => C << b >>> b;
      }
      var h = o.includes("unsigned"), w = (C, D) => {
      }, I;
      h ? I = function(C, D) {
        return w(D, this.name), D >>> 0;
      } : I = function(C, D) {
        return w(D, this.name), D;
      }, G(i, { name: o, fromWireType: g, toWireType: I, argPackAdvance: V, readValueFromPointer: gt(o, l, f !== 0), destructorFunction: null });
    }, nn = (i, o, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], p = f[o];
      function g(b) {
        var h = _[b >> 2], w = _[b + 4 >> 2];
        return new p(te.buffer, w, h);
      }
      l = N(l), G(i, { name: l, fromWireType: g, argPackAdvance: V, readValueFromPointer: g }, { ignoreDuplicateRegistrations: !0 });
    }, on = (i, o, l, f) => {
      if (!(f > 0)) return 0;
      for (var p = l, g = l + f - 1, b = 0; b < i.length; ++b) {
        var h = i.charCodeAt(b);
        if (h >= 55296 && h <= 57343) {
          var w = i.charCodeAt(++b);
          h = 65536 + ((h & 1023) << 10) | w & 1023;
        }
        if (h <= 127) {
          if (l >= g) break;
          o[l++] = h;
        } else if (h <= 2047) {
          if (l + 1 >= g) break;
          o[l++] = 192 | h >> 6, o[l++] = 128 | h & 63;
        } else if (h <= 65535) {
          if (l + 2 >= g) break;
          o[l++] = 224 | h >> 12, o[l++] = 128 | h >> 6 & 63, o[l++] = 128 | h & 63;
        } else {
          if (l + 3 >= g) break;
          o[l++] = 240 | h >> 18, o[l++] = 128 | h >> 12 & 63, o[l++] = 128 | h >> 6 & 63, o[l++] = 128 | h & 63;
        }
      }
      return o[l] = 0, l - p;
    }, an = (i, o, l) => on(i, U, o, l), sn = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f <= 127 ? o++ : f <= 2047 ? o += 2 : f >= 55296 && f <= 57343 ? (o += 4, ++l) : o += 3;
      }
      return o;
    }, Mt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, ln = (i, o = 0, l = NaN) => {
      for (var f = o + l, p = o; i[p] && !(p >= f); ) ++p;
      if (p - o > 16 && i.buffer && Mt)
        return Mt.decode(i.subarray(o, p));
      for (var g = ""; o < p; ) {
        var b = i[o++];
        if (!(b & 128)) {
          g += String.fromCharCode(b);
          continue;
        }
        var h = i[o++] & 63;
        if ((b & 224) == 192) {
          g += String.fromCharCode((b & 31) << 6 | h);
          continue;
        }
        var w = i[o++] & 63;
        if ((b & 240) == 224 ? b = (b & 15) << 12 | h << 6 | w : b = (b & 7) << 18 | h << 12 | w << 6 | i[o++] & 63, b < 65536)
          g += String.fromCharCode(b);
        else {
          var I = b - 65536;
          g += String.fromCharCode(55296 | I >> 10, 56320 | I & 1023);
        }
      }
      return g;
    }, cn = (i, o) => i ? ln(U, i, o) : "", un = (i, o) => {
      o = N(o), G(i, { name: o, fromWireType(l) {
        for (var f = _[l >> 2], p = l + 4, g, b, h = p, b = 0; b <= f; ++b) {
          var w = p + b;
          if (b == f || U[w] == 0) {
            var I = w - h, C = cn(h, I);
            g === void 0 ? g = C : (g += "\0", g += C), h = w + 1;
          }
        }
        return J(l), g;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var p, g = typeof f == "string";
        g || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || T("Cannot pass non-string to std::string"), g ? p = sn(f) : p = f.length;
        var b = Ve(4 + p + 1), h = b + 4;
        if (_[b >> 2] = p, g)
          an(f, h, p + 1);
        else if (g)
          for (var w = 0; w < p; ++w) {
            var I = f.charCodeAt(w);
            I > 255 && (J(b), T("String has UTF-16 code units that do not fit in 8 bits")), U[h + w] = I;
          }
        else
          for (var w = 0; w < p; ++w)
            U[h + w] = f[w];
        return l !== null && l.push(J, b), b;
      }, argPackAdvance: V, readValueFromPointer: Fe, destructorFunction(l) {
        J(l);
      } });
    }, Lt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, dn = (i, o) => {
      for (var l = i, f = l >> 1, p = f + o / 2; !(f >= p) && Se[f]; ) ++f;
      if (l = f << 1, l - i > 32 && Lt) return Lt.decode(U.subarray(i, l));
      for (var g = "", b = 0; !(b >= o / 2); ++b) {
        var h = de[i + b * 2 >> 1];
        if (h == 0) break;
        g += String.fromCharCode(h);
      }
      return g;
    }, fn = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 2) return 0;
      l -= 2;
      for (var f = o, p = l < i.length * 2 ? l / 2 : i.length, g = 0; g < p; ++g) {
        var b = i.charCodeAt(g);
        de[o >> 1] = b, o += 2;
      }
      return de[o >> 1] = 0, o - f;
    }, pn = (i) => i.length * 2, mn = (i, o) => {
      for (var l = 0, f = ""; !(l >= o / 4); ) {
        var p = re[i + l * 4 >> 2];
        if (p == 0) break;
        if (++l, p >= 65536) {
          var g = p - 65536;
          f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023);
        } else
          f += String.fromCharCode(p);
      }
      return f;
    }, hn = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 4) return 0;
      for (var f = o, p = f + l - 4, g = 0; g < i.length; ++g) {
        var b = i.charCodeAt(g);
        if (b >= 55296 && b <= 57343) {
          var h = i.charCodeAt(++g);
          b = 65536 + ((b & 1023) << 10) | h & 1023;
        }
        if (re[o >> 2] = b, o += 4, o + 4 > p) break;
      }
      return re[o >> 2] = 0, o - f;
    }, yn = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, o += 4;
      }
      return o;
    }, gn = (i, o, l) => {
      l = N(l);
      var f, p, g, b;
      o === 2 ? (f = dn, p = fn, b = pn, g = (h) => Se[h >> 1]) : o === 4 && (f = mn, p = hn, b = yn, g = (h) => _[h >> 2]), G(i, { name: l, fromWireType: (h) => {
        for (var w = _[h >> 2], I, C = h + 4, D = 0; D <= w; ++D) {
          var F = h + 4 + D * o;
          if (D == w || g(F) == 0) {
            var W = F - C, H = f(C, W);
            I === void 0 ? I = H : (I += "\0", I += H), C = F + o;
          }
        }
        return J(h), I;
      }, toWireType: (h, w) => {
        typeof w != "string" && T(`Cannot pass non-string to C++ string type ${l}`);
        var I = b(w), C = Ve(4 + I + o);
        return _[C >> 2] = I / o, p(w, C + 4, I + o), h !== null && h.push(J, C), C;
      }, argPackAdvance: V, readValueFromPointer: Fe, destructorFunction(h) {
        J(h);
      } });
    }, bn = (i, o) => {
      o = N(o), G(i, { isVoid: !0, name: o, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, vn = () => {
      pt = !1, Dt = 0;
    }, $t = (i, o) => {
      var l = oe[i];
      return l === void 0 && T(`${o} has unknown type ${jt(i)}`), l;
    }, On = (i, o, l) => {
      var f = [], p = i.toWireType(f, l);
      return f.length && (_[o >> 2] = z.toHandle(f)), p;
    }, wn = (i, o, l) => (i = z.toValue(i), o = $t(o, "emval::as"), On(o, l, i)), Pn = (i, o) => (i = z.toValue(i), o = z.toValue(o), z.toHandle(i[o])), Cn = {}, Sn = (i) => {
      var o = Cn[i];
      return o === void 0 ? N(i) : o;
    }, In = (i) => z.toHandle(Sn(i)), jn = (i) => {
      var o = z.toValue(i);
      Ge(o), Be(i);
    }, Tn = (i, o) => {
      i = $t(i, "_emval_take_value");
      var l = i.readValueFromPointer(o);
      return z.toHandle(l);
    }, he = {}, An = () => performance.now(), Dn = (i, o) => {
      if (he[i] && (clearTimeout(he[i].id), delete he[i]), !o) return 0;
      var l = setTimeout(() => {
        delete he[i], Et(() => Ln(i, An()));
      }, o);
      return he[i] = { id: l, timeout_ms: o }, 0;
    }, _n = () => 2147483648, kn = (i, o) => Math.ceil(i / o) * o, En = (i) => {
      var o = Pe.buffer, l = (i - o.byteLength + 65535) / 65536 | 0;
      try {
        return Pe.grow(l), lt(), 1;
      } catch {
      }
    }, Fn = (i) => {
      var o = U.length;
      i >>>= 0;
      var l = _n();
      if (i > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var p = o * (1 + 0.2 / f);
        p = Math.min(p, i + 100663296);
        var g = Math.min(l, kn(Math.max(i, p), 65536)), b = En(g);
        if (b)
          return !0;
      }
      return !1;
    };
    yr(), se = t.BindingError = class extends Error {
      constructor(o) {
        super(o), this.name = "BindingError";
      }
    }, yt = t.InternalError = class extends Error {
      constructor(o) {
        super(o), this.name = "InternalError";
      }
    }, Tr(), Lr(), It = t.UnboundTypeError = Wr(Error, "UnboundTypeError"), Zr();
    var Rn = { h: mr, t: hr, l: br, w: vr, f: Ur, e: Vr, a: Jr, u: qr, k: Qr, b: tn, d: rn, c: nn, v: un, g: gn, x: bn, q: vn, i: wn, y: Be, j: Pn, o: In, n: jn, m: Tn, r: Dn, s: Fn, p: kt }, j = await ur();
    j.A;
    var Mn = j.B, Ve = t._malloc = j.C, J = t._free = j.D, Ln = j.E;
    t.dynCall_v = j.G, t.dynCall_ii = j.H, t.dynCall_vi = j.I, t.dynCall_i = j.J, t.dynCall_iii = j.K, t.dynCall_viii = j.L, t.dynCall_fii = j.M, t.dynCall_viif = j.N, t.dynCall_viiii = j.O, t.dynCall_viiiiii = j.P, t.dynCall_iiiiii = j.Q, t.dynCall_viiiii = j.R, t.dynCall_iiiiiiii = j.S, t.dynCall_viiiiiii = j.T, t.dynCall_viiiiiiiiidi = j.U, t.dynCall_viiiiiiiidi = j.V, t.dynCall_viiiiiiiiii = j.W, t.dynCall_viiiiiiiii = j.X, t.dynCall_viiiiiiii = j.Y, t.dynCall_iiiiiii = j.Z, t.dynCall_iiiii = j._, t.dynCall_iiii = j.$;
    var $n = j.aa, xn = j.ba, Nn = j.ca, Wn = j.da;
    function Je() {
      if (ne > 0) {
        fe = Je;
        return;
      }
      if (Qt(), ne > 0) {
        fe = Je;
        return;
      }
      function i() {
        var o;
        t.calledRun = !0, !ee && (er(), e(t), (o = t.onRuntimeInitialized) == null || o.call(t), tr());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), i();
      }, 1)) : i();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return Je(), r = a, r;
  };
})();
function ko(u, s) {
  return Math.sqrt((u.x - s.x) ** 2 + (u.y - s.y) ** 2);
}
function di(u, s) {
  return {
    x: (u.x + s.x) / 2,
    y: (u.y + s.y) / 2
  };
}
function fi(u, s) {
  if (u.confidence <= 0 || s.confidence <= 0)
    return { x: 0, y: 0 };
  const r = ko(u.center, s.center), t = di(u.center, s.center);
  return {
    x: t.x,
    y: t.y + r / 4
    // calculation is taken from mobile team
  };
}
function pi(u, s, r) {
  if (u.confidence <= 0 || s.confidence <= 0)
    return 0;
  const t = ko(u.center, s.center), e = Bo(r.width, r.height);
  return Ho(t / e);
}
function Gn(u) {
  const { centerX: s, centerY: r, confidence: t, size: e, status: n } = u;
  return {
    center: {
      x: s,
      y: r
    },
    confidence: t / 1e3,
    status: n / 1e3,
    size: e
  };
}
class mi extends Go {
  getSamWasmFilePath(s, r) {
    return `${s}/face/wasm/${r}`;
  }
  fetchSamModule(s) {
    return ui(s);
  }
  parseRawData(s, r) {
    const { brightness: t, sharpness: e } = s.params, { bottomRightX: n, bottomRightY: a, leftEye: d, mouth: y, rightEye: O, topLeftX: S, topLeftY: A } = s, k = Gn(d), $ = Gn(O), Q = Gn(y);
    return {
      confidence: s.confidence / 1e3,
      topLeft: {
        x: S,
        y: A
      },
      bottomRight: {
        x: n,
        y: a
      },
      faceCenter: fi(k, $),
      faceSize: pi(k, $, r),
      leftEye: k,
      rightEye: $,
      mouth: Q,
      brightness: t / 1e3,
      sharpness: e / 1e3
    };
  }
  async detect(s, r, t) {
    if (!this.samWasmModule)
      throw new ce("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(s, r), n = this.samWasmModule.detectFacePartsWithImageParameters(
      r.width,
      r.height,
      e.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return e.free(), this.parseRawData(n, t);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Eo = Symbol("Comlink.proxy"), hi = Symbol("Comlink.endpoint"), yi = Symbol("Comlink.releaseProxy"), Hn = Symbol("Comlink.finalizer"), Vt = Symbol("Comlink.thrown"), Fo = (u) => typeof u == "object" && u !== null || typeof u == "function", gi = {
  canHandle: (u) => Fo(u) && u[Eo],
  serialize(u) {
    const { port1: s, port2: r } = new MessageChannel();
    return eo(u, s), [r, [r]];
  },
  deserialize(u) {
    return u.start(), wi(u);
  }
}, bi = {
  canHandle: (u) => Fo(u) && Vt in u,
  serialize({ value: u }) {
    let s;
    return u instanceof Error ? s = {
      isError: !0,
      value: {
        message: u.message,
        name: u.name,
        stack: u.stack
      }
    } : s = { isError: !1, value: u }, [s, []];
  },
  deserialize(u) {
    throw u.isError ? Object.assign(new Error(u.value.message), u.value) : u.value;
  }
}, Ro = /* @__PURE__ */ new Map([
  ["proxy", gi],
  ["throw", bi]
]);
function vi(u, s) {
  for (const r of u)
    if (s === r || r === "*" || r instanceof RegExp && r.test(s))
      return !0;
  return !1;
}
function eo(u, s = globalThis, r = ["*"]) {
  s.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!vi(r, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: n, type: a, path: d } = Object.assign({ path: [] }, e.data), y = (e.data.argumentList || []).map(qe);
    let O;
    try {
      const S = d.slice(0, -1).reduce((k, $) => k[$], u), A = d.reduce((k, $) => k[$], u);
      switch (a) {
        case "GET":
          O = A;
          break;
        case "SET":
          S[d.slice(-1)[0]] = qe(e.data.value), O = !0;
          break;
        case "APPLY":
          O = A.apply(S, y);
          break;
        case "CONSTRUCT":
          {
            const k = new A(...y);
            O = ji(k);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: k, port2: $ } = new MessageChannel();
            eo(u, $), O = Ii(k, [k]);
          }
          break;
        case "RELEASE":
          O = void 0;
          break;
        default:
          return;
      }
    } catch (S) {
      O = { value: S, [Vt]: 0 };
    }
    Promise.resolve(O).catch((S) => ({ value: S, [Vt]: 0 })).then((S) => {
      const [A, k] = Kt(S);
      s.postMessage(Object.assign(Object.assign({}, A), { id: n }), k), a === "RELEASE" && (s.removeEventListener("message", t), Mo(s), Hn in u && typeof u[Hn] == "function" && u[Hn]());
    }).catch((S) => {
      const [A, k] = Kt({
        value: new TypeError("Unserializable return value"),
        [Vt]: 0
      });
      s.postMessage(Object.assign(Object.assign({}, A), { id: n }), k);
    });
  }), s.start && s.start();
}
function Oi(u) {
  return u.constructor.name === "MessagePort";
}
function Mo(u) {
  Oi(u) && u.close();
}
function wi(u, s) {
  return Yn(u, [], s);
}
function Bt(u) {
  if (u)
    throw new Error("Proxy has been released and is not useable");
}
function Lo(u) {
  return tt(u, {
    type: "RELEASE"
  }).then(() => {
    Mo(u);
  });
}
const Yt = /* @__PURE__ */ new WeakMap(), Zt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((u) => {
  const s = (Yt.get(u) || 0) - 1;
  Yt.set(u, s), s === 0 && Lo(u);
});
function Pi(u, s) {
  const r = (Yt.get(s) || 0) + 1;
  Yt.set(s, r), Zt && Zt.register(u, s, u);
}
function Ci(u) {
  Zt && Zt.unregister(u);
}
function Yn(u, s = [], r = function() {
}) {
  let t = !1;
  const e = new Proxy(r, {
    get(n, a) {
      if (Bt(t), a === yi)
        return () => {
          Ci(e), Lo(u), t = !0;
        };
      if (a === "then") {
        if (s.length === 0)
          return { then: () => e };
        const d = tt(u, {
          type: "GET",
          path: s.map((y) => y.toString())
        }).then(qe);
        return d.then.bind(d);
      }
      return Yn(u, [...s, a]);
    },
    set(n, a, d) {
      Bt(t);
      const [y, O] = Kt(d);
      return tt(u, {
        type: "SET",
        path: [...s, a].map((S) => S.toString()),
        value: y
      }, O).then(qe);
    },
    apply(n, a, d) {
      Bt(t);
      const y = s[s.length - 1];
      if (y === hi)
        return tt(u, {
          type: "ENDPOINT"
        }).then(qe);
      if (y === "bind")
        return Yn(u, s.slice(0, -1));
      const [O, S] = vo(d);
      return tt(u, {
        type: "APPLY",
        path: s.map((A) => A.toString()),
        argumentList: O
      }, S).then(qe);
    },
    construct(n, a) {
      Bt(t);
      const [d, y] = vo(a);
      return tt(u, {
        type: "CONSTRUCT",
        path: s.map((O) => O.toString()),
        argumentList: d
      }, y).then(qe);
    }
  });
  return Pi(e, u), e;
}
function Si(u) {
  return Array.prototype.concat.apply([], u);
}
function vo(u) {
  const s = u.map(Kt);
  return [s.map((r) => r[0]), Si(s.map((r) => r[1]))];
}
const $o = /* @__PURE__ */ new WeakMap();
function Ii(u, s) {
  return $o.set(u, s), u;
}
function ji(u) {
  return Object.assign(u, { [Eo]: !0 });
}
function Kt(u) {
  for (const [s, r] of Ro)
    if (r.canHandle(u)) {
      const [t, e] = r.serialize(u);
      return [
        {
          type: "HANDLER",
          name: s,
          value: t
        },
        e
      ];
    }
  return [
    {
      type: "RAW",
      value: u
    },
    $o.get(u) || []
  ];
}
function qe(u) {
  switch (u.type) {
    case "HANDLER":
      return Ro.get(u.name).deserialize(u.value);
    case "RAW":
      return u.value;
  }
}
function tt(u, s, r) {
  return new Promise((t) => {
    const e = Ti();
    u.addEventListener("message", function n(a) {
      !a.data || !a.data.id || a.data.id !== e || (u.removeEventListener("message", n), t(a.data));
    }), u.start && u.start(), u.postMessage(Object.assign({ id: e }, s), r);
  });
}
function Ti() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var Ai = (() => {
  var u = import.meta.url;
  return async function(s = {}) {
    var r, t = s, e, n, a = new Promise((i, o) => {
      e = i, n = o;
    }), d = typeof window == "object", y = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var O = Object.assign({}, t), S = (i, o) => {
      throw o;
    }, A = "";
    function k(i) {
      return t.locateFile ? t.locateFile(i, A) : A + i;
    }
    var $, Q;
    (d || y) && (y ? A = self.location.href : typeof document < "u" && document.currentScript && (A = document.currentScript.src), u && (A = u), A.startsWith("blob:") ? A = "" : A = A.slice(0, A.replace(/[?#].*/, "").lastIndexOf("/") + 1), y && (Q = (i) => {
      var o = new XMLHttpRequest();
      return o.open("GET", i, !1), o.responseType = "arraybuffer", o.send(null), new Uint8Array(o.response);
    }), $ = async (i) => {
      if (st(i))
        return new Promise((l, f) => {
          var p = new XMLHttpRequest();
          p.open("GET", i, !0), p.responseType = "arraybuffer", p.onload = () => {
            if (p.status == 200 || p.status == 0 && p.response) {
              l(p.response);
              return;
            }
            f(p.status);
          }, p.onerror = f, p.send(null);
        });
      var o = await fetch(i, { credentials: "same-origin" });
      if (o.ok)
        return o.arrayBuffer();
      throw new Error(o.status + " : " + o.url);
    }), t.print || console.log.bind(console);
    var Oe = t.printErr || console.error.bind(console);
    Object.assign(t, O), O = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var we = t.wasmBinary, Pe, ee = !1, Ce, te, U, de, Se, re, _, nt, ot, it, at, st = (i) => i.startsWith("file://");
    function lt() {
      var i = Pe.buffer;
      t.HEAP8 = te = new Int8Array(i), t.HEAP16 = de = new Int16Array(i), t.HEAPU8 = U = new Uint8Array(i), t.HEAPU16 = Se = new Uint16Array(i), t.HEAP32 = re = new Int32Array(i), t.HEAPU32 = _ = new Uint32Array(i), t.HEAPF32 = nt = new Float32Array(i), t.HEAPF64 = at = new Float64Array(i), t.HEAP64 = ot = new BigInt64Array(i), t.HEAPU64 = it = new BigUint64Array(i);
    }
    function Qt() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          fr(t.preRun.shift());
      ut(ft);
    }
    function er() {
      j.A();
    }
    function tr() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          dr(t.postRun.shift());
      ut(dt);
    }
    var ne = 0, fe = null;
    function rr(i) {
      var o;
      ne++, (o = t.monitorRunDependencies) == null || o.call(t, ne);
    }
    function nr(i) {
      var l;
      if (ne--, (l = t.monitorRunDependencies) == null || l.call(t, ne), ne == 0 && fe) {
        var o = fe;
        fe = null, o();
      }
    }
    function Ie(i) {
      var l;
      (l = t.onAbort) == null || l.call(t, i), i = "Aborted(" + i + ")", Oe(i), ee = !0, i += ". Build with -sASSERTIONS for more info.";
      var o = new WebAssembly.RuntimeError(i);
      throw n(o), o;
    }
    var Ne;
    function or() {
      return t.locateFile ? k("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function ir(i) {
      if (i == Ne && we)
        return new Uint8Array(we);
      if (Q)
        return Q(i);
      throw "both async and sync fetching of the wasm failed";
    }
    async function ar(i) {
      if (!we)
        try {
          var o = await $(i);
          return new Uint8Array(o);
        } catch {
        }
      return ir(i);
    }
    async function sr(i, o) {
      try {
        var l = await ar(i), f = await WebAssembly.instantiate(l, o);
        return f;
      } catch (p) {
        Oe(`failed to asynchronously prepare wasm: ${p}`), Ie(p);
      }
    }
    async function lr(i, o, l) {
      if (!i && typeof WebAssembly.instantiateStreaming == "function" && !st(o))
        try {
          var f = fetch(o, { credentials: "same-origin" }), p = await WebAssembly.instantiateStreaming(f, l);
          return p;
        } catch (g) {
          Oe(`wasm streaming compile failed: ${g}`), Oe("falling back to ArrayBuffer instantiation");
        }
      return sr(o, l);
    }
    function cr() {
      return { a: Rn };
    }
    async function ur() {
      function i(g, b) {
        return j = g.exports, j = P.instrumentWasmExports(j), Pe = j.z, lt(), j.F, nr(), j;
      }
      rr();
      function o(g) {
        return i(g.instance);
      }
      var l = cr();
      if (t.instantiateWasm)
        return new Promise((g, b) => {
          t.instantiateWasm(l, (h, w) => {
            i(h), g(h.exports);
          });
        });
      Ne ?? (Ne = or());
      try {
        var f = await lr(we, Ne, l), p = o(f);
        return p;
      } catch (g) {
        return n(g), Promise.reject(g);
      }
    }
    class ct {
      constructor(o) {
        Wt(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${o})`, this.status = o;
      }
    }
    var ut = (i) => {
      for (; i.length > 0; )
        i.shift()(t);
    }, dt = [], dr = (i) => dt.unshift(i), ft = [], fr = (i) => ft.unshift(i), pt = t.noExitRuntime || !0;
    class pr {
      constructor(o) {
        this.excPtr = o, this.ptr = o - 24;
      }
      set_type(o) {
        _[this.ptr + 4 >> 2] = o;
      }
      get_type() {
        return _[this.ptr + 4 >> 2];
      }
      set_destructor(o) {
        _[this.ptr + 8 >> 2] = o;
      }
      get_destructor() {
        return _[this.ptr + 8 >> 2];
      }
      set_caught(o) {
        o = o ? 1 : 0, te[this.ptr + 12] = o;
      }
      get_caught() {
        return te[this.ptr + 12] != 0;
      }
      set_rethrown(o) {
        o = o ? 1 : 0, te[this.ptr + 13] = o;
      }
      get_rethrown() {
        return te[this.ptr + 13] != 0;
      }
      init(o, l) {
        this.set_adjusted_ptr(0), this.set_type(o), this.set_destructor(l);
      }
      set_adjusted_ptr(o) {
        _[this.ptr + 16 >> 2] = o;
      }
      get_adjusted_ptr() {
        return _[this.ptr + 16 >> 2];
      }
    }
    var mt = 0, mr = (i, o, l) => {
      var f = new pr(i);
      throw f.init(o, l), mt = i, mt;
    }, hr = () => Ie(""), je = (i) => {
      if (i === null)
        return "null";
      var o = typeof i;
      return o === "object" || o === "array" || o === "function" ? i.toString() : "" + i;
    }, yr = () => {
      for (var i = new Array(256), o = 0; o < 256; ++o)
        i[o] = String.fromCharCode(o);
      ht = i;
    }, ht, N = (i) => {
      for (var o = "", l = i; U[l]; )
        o += ht[U[l++]];
      return o;
    }, ae = {}, oe = {}, Te = {}, se, T = (i) => {
      throw new se(i);
    }, yt, Ae = (i) => {
      throw new yt(i);
    }, le = (i, o, l) => {
      i.forEach((h) => Te[h] = o);
      function f(h) {
        var w = l(h);
        w.length !== i.length && Ae("Mismatched type converter count");
        for (var I = 0; I < i.length; ++I)
          G(i[I], w[I]);
      }
      var p = new Array(o.length), g = [], b = 0;
      o.forEach((h, w) => {
        oe.hasOwnProperty(h) ? p[w] = oe[h] : (g.push(h), ae.hasOwnProperty(h) || (ae[h] = []), ae[h].push(() => {
          p[w] = oe[h], ++b, b === g.length && f(p);
        }));
      }), g.length === 0 && f(p);
    };
    function gr(i, o, l = {}) {
      var f = o.name;
      if (i || T(`type "${f}" must have a positive integer typeid pointer`), oe.hasOwnProperty(i)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        T(`Cannot register type '${f}' twice`);
      }
      if (oe[i] = o, delete Te[i], ae.hasOwnProperty(i)) {
        var p = ae[i];
        delete ae[i], p.forEach((g) => g());
      }
    }
    function G(i, o, l = {}) {
      return gr(i, o, l);
    }
    var gt = (i, o, l) => {
      switch (o) {
        case 1:
          return l ? (f) => te[f] : (f) => U[f];
        case 2:
          return l ? (f) => de[f >> 1] : (f) => Se[f >> 1];
        case 4:
          return l ? (f) => re[f >> 2] : (f) => _[f >> 2];
        case 8:
          return l ? (f) => ot[f >> 3] : (f) => it[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${o}): ${i}`);
      }
    }, br = (i, o, l, f, p) => {
      o = N(o);
      var g = o.indexOf("u") != -1;
      G(i, { name: o, fromWireType: (b) => b, toWireType: function(b, h) {
        if (typeof h != "bigint" && typeof h != "number")
          throw new TypeError(`Cannot convert "${je(h)}" to ${this.name}`);
        return typeof h == "number" && (h = BigInt(h)), h;
      }, argPackAdvance: V, readValueFromPointer: gt(o, l, !g), destructorFunction: null });
    }, V = 8, vr = (i, o, l, f) => {
      o = N(o), G(i, { name: o, fromWireType: function(p) {
        return !!p;
      }, toWireType: function(p, g) {
        return g ? l : f;
      }, argPackAdvance: V, readValueFromPointer: function(p) {
        return this.fromWireType(U[p]);
      }, destructorFunction: null });
    }, Or = (i) => ({ count: i.count, deleteScheduled: i.deleteScheduled, preservePointerOnDelete: i.preservePointerOnDelete, ptr: i.ptr, ptrType: i.ptrType, smartPtr: i.smartPtr, smartPtrType: i.smartPtrType }), We = (i) => {
      function o(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      T(o(i) + " instance already deleted");
    }, Ue = !1, bt = (i) => {
    }, wr = (i) => {
      i.smartPtr ? i.smartPtrType.rawDestructor(i.smartPtr) : i.ptrType.registeredClass.rawDestructor(i.ptr);
    }, vt = (i) => {
      i.count.value -= 1;
      var o = i.count.value === 0;
      o && wr(i);
    }, Ot = (i, o, l) => {
      if (o === l)
        return i;
      if (l.baseClass === void 0)
        return null;
      var f = Ot(i, o, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, wt = {}, Pr = {}, Cr = (i, o) => {
      for (o === void 0 && T("ptr should not be undefined"); i.baseClass; )
        o = i.upcast(o), i = i.baseClass;
      return o;
    }, Sr = (i, o) => (o = Cr(i, o), Pr[o]), De = (i, o) => {
      (!o.ptrType || !o.ptr) && Ae("makeClassHandle requires ptr and ptrType");
      var l = !!o.smartPtrType, f = !!o.smartPtr;
      return l !== f && Ae("Both smartPtrType and smartPtr must be specified"), o.count = { value: 1 }, pe(Object.create(i, { $$: { value: o, writable: !0 } }));
    };
    function Ir(i) {
      var o = this.getPointee(i);
      if (!o)
        return this.destructor(i), null;
      var l = Sr(this.registeredClass, o);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = o, l.$$.smartPtr = i, l.clone();
        var f = l.clone();
        return this.destructor(i), f;
      }
      function p() {
        return this.isSmartPointer ? De(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: o, smartPtrType: this, smartPtr: i }) : De(this.registeredClass.instancePrototype, { ptrType: this, ptr: i });
      }
      var g = this.registeredClass.getActualType(o), b = wt[g];
      if (!b)
        return p.call(this);
      var h;
      this.isConst ? h = b.constPointerType : h = b.pointerType;
      var w = Ot(o, this.registeredClass, h.registeredClass);
      return w === null ? p.call(this) : this.isSmartPointer ? De(h.registeredClass.instancePrototype, { ptrType: h, ptr: w, smartPtrType: this, smartPtr: i }) : De(h.registeredClass.instancePrototype, { ptrType: h, ptr: w });
    }
    var pe = (i) => typeof FinalizationRegistry > "u" ? (pe = (o) => o, i) : (Ue = new FinalizationRegistry((o) => {
      vt(o.$$);
    }), pe = (o) => {
      var l = o.$$, f = !!l.smartPtr;
      if (f) {
        var p = { $$: l };
        Ue.register(o, p, o);
      }
      return o;
    }, bt = (o) => Ue.unregister(o), pe(i)), _e = [], jr = () => {
      for (; _e.length; ) {
        var i = _e.pop();
        i.$$.deleteScheduled = !1, i.delete();
      }
    }, Pt, Tr = () => {
      Object.assign(ke.prototype, { isAliasOf(i) {
        if (!(this instanceof ke) || !(i instanceof ke))
          return !1;
        var o = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        i.$$ = i.$$;
        for (var f = i.$$.ptrType.registeredClass, p = i.$$.ptr; o.baseClass; )
          l = o.upcast(l), o = o.baseClass;
        for (; f.baseClass; )
          p = f.upcast(p), f = f.baseClass;
        return o === f && l === p;
      }, clone() {
        if (this.$$.ptr || We(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var i = pe(Object.create(Object.getPrototypeOf(this), { $$: { value: Or(this.$$) } }));
        return i.$$.count.value += 1, i.$$.deleteScheduled = !1, i;
      }, delete() {
        this.$$.ptr || We(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && T("Object already scheduled for deletion"), bt(this), vt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || We(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && T("Object already scheduled for deletion"), _e.push(this), _e.length === 1 && Pt && Pt(jr), this.$$.deleteScheduled = !0, this;
      } });
    };
    function ke() {
    }
    var ze = (i, o) => Object.defineProperty(o, "name", { value: i }), Ar = (i, o, l) => {
      if (i[o].overloadTable === void 0) {
        var f = i[o];
        i[o] = function(...p) {
          return i[o].overloadTable.hasOwnProperty(p.length) || T(`Function '${l}' called with an invalid number of arguments (${p.length}) - expects one of (${i[o].overloadTable})!`), i[o].overloadTable[p.length].apply(this, p);
        }, i[o].overloadTable = [], i[o].overloadTable[f.argCount] = f;
      }
    }, Ct = (i, o, l) => {
      t.hasOwnProperty(i) ? ((l === void 0 || t[i].overloadTable !== void 0 && t[i].overloadTable[l] !== void 0) && T(`Cannot register public name '${i}' twice`), Ar(t, i, i), t[i].overloadTable.hasOwnProperty(l) && T(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[i].overloadTable[l] = o) : (t[i] = o, t[i].argCount = l);
    }, Dr = 48, _r = 57, kr = (i) => {
      i = i.replace(/[^a-zA-Z0-9_]/g, "$");
      var o = i.charCodeAt(0);
      return o >= Dr && o <= _r ? `_${i}` : i;
    };
    function Er(i, o, l, f, p, g, b, h) {
      this.name = i, this.constructor = o, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = p, this.getActualType = g, this.upcast = b, this.downcast = h, this.pureVirtualFunctions = [];
    }
    var Ee = (i, o, l) => {
      for (; o !== l; )
        o.upcast || T(`Expected null or instance of ${l.name}, got an instance of ${o.name}`), i = o.upcast(i), o = o.baseClass;
      return i;
    };
    function Fr(i, o) {
      if (o === null)
        return this.isReference && T(`null is not a valid ${this.name}`), 0;
      o.$$ || T(`Cannot pass "${je(o)}" as a ${this.name}`), o.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Ee(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Rr(i, o) {
      var l;
      if (o === null)
        return this.isReference && T(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), i !== null && i.push(this.rawDestructor, l), l) : 0;
      (!o || !o.$$) && T(`Cannot pass "${je(o)}" as a ${this.name}`), o.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && o.$$.ptrType.isConst && T(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
      var f = o.$$.ptrType.registeredClass;
      if (l = Ee(o.$$.ptr, f, this.registeredClass), this.isSmartPointer)
        switch (o.$$.smartPtr === void 0 && T("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            o.$$.smartPtrType === this ? l = o.$$.smartPtr : T(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            l = o.$$.smartPtr;
            break;
          case 2:
            if (o.$$.smartPtrType === this)
              l = o.$$.smartPtr;
            else {
              var p = o.clone();
              l = this.rawShare(l, z.toHandle(() => p.delete())), i !== null && i.push(this.rawDestructor, l);
            }
            break;
          default:
            T("Unsupporting sharing policy");
        }
      return l;
    }
    function Mr(i, o) {
      if (o === null)
        return this.isReference && T(`null is not a valid ${this.name}`), 0;
      o.$$ || T(`Cannot pass "${je(o)}" as a ${this.name}`), o.$$.ptr || T(`Cannot pass deleted object as a pointer of type ${this.name}`), o.$$.ptrType.isConst && T(`Cannot convert argument of type ${o.$$.ptrType.name} to parameter type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Ee(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Fe(i) {
      return this.fromWireType(_[i >> 2]);
    }
    var Lr = () => {
      Object.assign(Re.prototype, { getPointee(i) {
        return this.rawGetPointee && (i = this.rawGetPointee(i)), i;
      }, destructor(i) {
        var o;
        (o = this.rawDestructor) == null || o.call(this, i);
      }, argPackAdvance: V, readValueFromPointer: Fe, fromWireType: Ir });
    };
    function Re(i, o, l, f, p, g, b, h, w, I, C) {
      this.name = i, this.registeredClass = o, this.isReference = l, this.isConst = f, this.isSmartPointer = p, this.pointeeType = g, this.sharingPolicy = b, this.rawGetPointee = h, this.rawConstructor = w, this.rawShare = I, this.rawDestructor = C, !p && o.baseClass === void 0 ? f ? (this.toWireType = Fr, this.destructorFunction = null) : (this.toWireType = Mr, this.destructorFunction = null) : this.toWireType = Rr;
    }
    var St = (i, o, l) => {
      t.hasOwnProperty(i) || Ae("Replacing nonexistent public symbol"), t[i].overloadTable !== void 0 && l !== void 0 ? t[i].overloadTable[l] = o : (t[i] = o, t[i].argCount = l);
    }, $r = (i, o, l) => {
      i = i.replace(/p/g, "i");
      var f = t["dynCall_" + i];
      return f(o, ...l);
    }, xr = (i, o, l = []) => {
      var f = $r(i, o, l);
      return f;
    }, Nr = (i, o) => (...l) => xr(i, o, l), K = (i, o) => {
      i = N(i);
      function l() {
        return Nr(i, o);
      }
      var f = l();
      return typeof f != "function" && T(`unknown function pointer with signature ${i}: ${o}`), f;
    }, Wr = (i, o) => {
      var l = ze(o, function(f) {
        this.name = o, this.message = f;
        var p = new Error(f).stack;
        p !== void 0 && (this.stack = this.toString() + `
` + p.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(i.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, It, jt = (i) => {
      var o = Mn(i), l = N(o);
      return J(o), l;
    }, me = (i, o) => {
      var l = [], f = {};
      function p(g) {
        if (!f[g] && !oe[g]) {
          if (Te[g]) {
            Te[g].forEach(p);
            return;
          }
          l.push(g), f[g] = !0;
        }
      }
      throw o.forEach(p), new It(`${i}: ` + l.map(jt).join([", "]));
    }, Ur = (i, o, l, f, p, g, b, h, w, I, C, D, F) => {
      C = N(C), g = K(p, g), h && (h = K(b, h)), I && (I = K(w, I)), F = K(D, F);
      var W = kr(C);
      Ct(W, function() {
        me(`Cannot construct ${C} due to unbound types`, [f]);
      }), le([i, o, l], f ? [f] : [], (H) => {
        var xt;
        H = H[0];
        var X, Y;
        f ? (X = H.registeredClass, Y = X.instancePrototype) : Y = ke.prototype;
        var x = ze(C, function(...Ze) {
          if (Object.getPrototypeOf(this) !== ie)
            throw new se("Use 'new' to construct " + C);
          if (M.constructor_body === void 0)
            throw new se(C + " has no accessible constructor");
          var Nt = M.constructor_body[Ze.length];
          if (Nt === void 0)
            throw new se(`Tried to invoke ctor of ${C} with invalid number of parameters (${Ze.length}) - expected (${Object.keys(M.constructor_body).toString()}) parameters instead!`);
          return Nt.apply(this, Ze);
        }), ie = Object.create(Y, { constructor: { value: x } });
        x.prototype = ie;
        var M = new Er(C, x, ie, F, X, g, h, I);
        M.baseClass && ((xt = M.baseClass).__derivedClasses ?? (xt.__derivedClasses = []), M.baseClass.__derivedClasses.push(M));
        var Ye = new Re(C, M, !0, !1, !1), Z = new Re(C + "*", M, !1, !1, !1), Le = new Re(C + " const*", M, !1, !0, !1);
        return wt[i] = { pointerType: Z, constPointerType: Le }, St(W, x), [Ye, Z, Le];
      });
    }, Tt = (i, o) => {
      for (var l = [], f = 0; f < i; f++)
        l.push(_[o + f * 4 >> 2]);
      return l;
    }, Ge = (i) => {
      for (; i.length; ) {
        var o = i.pop(), l = i.pop();
        l(o);
      }
    };
    function zr(i) {
      for (var o = 1; o < i.length; ++o)
        if (i[o] !== null && i[o].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Me = (i) => {
      try {
        return i();
      } catch (o) {
        Ie(o);
      }
    }, At = (i) => {
      if (i instanceof ct || i == "unwind")
        return Ce;
      S(1, i);
    }, Dt = 0, _t = () => pt || Dt > 0, kt = (i) => {
      var o;
      Ce = i, _t() || ((o = t.onExit) == null || o.call(t, i), ee = !0), S(i, new ct(i));
    }, Gr = (i, o) => {
      Ce = i, kt(i);
    }, Hr = Gr, Br = () => {
      if (!_t())
        try {
          Hr(Ce);
        } catch (i) {
          At(i);
        }
    }, Et = (i) => {
      if (!ee)
        try {
          i(), Br();
        } catch (o) {
          At(o);
        }
    }, P = { instrumentWasmImports(i) {
      var o = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(i))
        typeof f == "function" && (f.isAsync || o.test(l));
    }, instrumentWasmExports(i) {
      var o = {};
      for (let [l, f] of Object.entries(i))
        typeof f == "function" ? o[l] = (...p) => {
          P.exportCallStack.push(l);
          try {
            return f(...p);
          } finally {
            ee || (P.exportCallStack.pop(), P.maybeStopUnwind());
          }
        } : o[l] = f;
      return o;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(i) {
      var o = P.callStackNameToId[i];
      return o === void 0 && (o = P.callStackId++, P.callStackNameToId[i] = o, P.callStackIdToName[o] = i), o;
    }, maybeStopUnwind() {
      P.currData && P.state === P.State.Unwinding && P.exportCallStack.length === 0 && (P.state = P.State.Normal, Me(xn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((i, o) => {
        P.asyncPromiseHandlers = { resolve: i, reject: o };
      });
    }, allocateData() {
      var i = Ve(12 + P.StackSize);
      return P.setDataHeader(i, i + 12, P.StackSize), P.setDataRewindFunc(i), i;
    }, setDataHeader(i, o, l) {
      _[i >> 2] = o, _[i + 4 >> 2] = o + l;
    }, setDataRewindFunc(i) {
      var o = P.exportCallStack[0], l = P.getCallStackId(o);
      re[i + 8 >> 2] = l;
    }, getDataRewindFuncName(i) {
      var o = re[i + 8 >> 2], l = P.callStackIdToName[o];
      return l;
    }, getDataRewindFunc(i) {
      var o = j[i];
      return o;
    }, doRewind(i) {
      var o = P.getDataRewindFuncName(i), l = P.getDataRewindFunc(o);
      return l();
    }, handleSleep(i) {
      if (!ee) {
        if (P.state === P.State.Normal) {
          var o = !1, l = !1;
          i((f = 0) => {
            if (!ee && (P.handleSleepReturnValue = f, o = !0, !!l)) {
              P.state = P.State.Rewinding, Me(() => Nn(P.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var p, g = !1;
              try {
                p = P.doRewind(P.currData);
              } catch (w) {
                p = w, g = !0;
              }
              var b = !1;
              if (!P.currData) {
                var h = P.asyncPromiseHandlers;
                h && (P.asyncPromiseHandlers = null, (g ? h.reject : h.resolve)(p), b = !0);
              }
              if (g && !b)
                throw p;
            }
          }), l = !0, o || (P.state = P.State.Unwinding, P.currData = P.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Me(() => $n(P.currData)));
        } else P.state === P.State.Rewinding ? (P.state = P.State.Normal, Me(Wn), J(P.currData), P.currData = null, P.sleepCallbacks.forEach(Et)) : Ie(`invalid state: ${P.state}`);
        return P.handleSleepReturnValue;
      }
    }, handleAsync(i) {
      return P.handleSleep((o) => {
        i().then(o);
      });
    } };
    function Ft(i, o, l, f, p, g) {
      var b = o.length;
      b < 2 && T("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var h = o[1] !== null && l !== null, w = zr(o), I = o[0].name !== "void", C = b - 2, D = new Array(C), F = [], W = [], H = function(...X) {
        W.length = 0;
        var Y;
        F.length = h ? 2 : 1, F[0] = p, h && (Y = o[1].toWireType(W, this), F[1] = Y);
        for (var x = 0; x < C; ++x)
          D[x] = o[x + 2].toWireType(W, X[x]), F.push(D[x]);
        var ie = f(...F);
        function M(Ye) {
          if (w)
            Ge(W);
          else
            for (var Z = h ? 1 : 2; Z < o.length; Z++) {
              var Le = Z === 1 ? Y : D[Z - 2];
              o[Z].destructorFunction !== null && o[Z].destructorFunction(Le);
            }
          if (I)
            return o[0].fromWireType(Ye);
        }
        return P.currData ? P.whenDone().then(M) : M(ie);
      };
      return ze(i, H);
    }
    var Vr = (i, o, l, f, p, g) => {
      var b = Tt(o, l);
      p = K(f, p), le([], [i], (h) => {
        h = h[0];
        var w = `constructor ${h.name}`;
        if (h.registeredClass.constructor_body === void 0 && (h.registeredClass.constructor_body = []), h.registeredClass.constructor_body[o - 1] !== void 0)
          throw new se(`Cannot register multiple constructors with identical number of parameters (${o - 1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return h.registeredClass.constructor_body[o - 1] = () => {
          me(`Cannot construct ${h.name} due to unbound types`, b);
        }, le([], b, (I) => (I.splice(1, 0, null), h.registeredClass.constructor_body[o - 1] = Ft(w, I, null, p, g), [])), [];
      });
    }, Rt = (i, o, l) => (i instanceof Object || T(`${l} with invalid "this": ${i}`), i instanceof o.registeredClass.constructor || T(`${l} incompatible with "this" of type ${i.constructor.name}`), i.$$.ptr || T(`cannot call emscripten binding method ${l} on deleted object`), Ee(i.$$.ptr, i.$$.ptrType.registeredClass, o.registeredClass)), Jr = (i, o, l, f, p, g, b, h, w, I) => {
      o = N(o), p = K(f, p), le([], [i], (C) => {
        C = C[0];
        var D = `${C.name}.${o}`, F = { get() {
          me(`Cannot access ${D} due to unbound types`, [l, b]);
        }, enumerable: !0, configurable: !0 };
        return w ? F.set = () => me(`Cannot access ${D} due to unbound types`, [l, b]) : F.set = (W) => T(D + " is a read-only property"), Object.defineProperty(C.registeredClass.instancePrototype, o, F), le([], w ? [l, b] : [l], (W) => {
          var H = W[0], X = { get() {
            var x = Rt(this, C, D + " getter");
            return H.fromWireType(p(g, x));
          }, enumerable: !0 };
          if (w) {
            w = K(h, w);
            var Y = W[1];
            X.set = function(x) {
              var ie = Rt(this, C, D + " setter"), M = [];
              w(I, ie, Y.toWireType(M, x)), Ge(M);
            };
          }
          return Object.defineProperty(C.registeredClass.instancePrototype, o, X), [];
        }), [];
      });
    }, He = [], q = [], Be = (i) => {
      i > 9 && --q[i + 1] === 0 && (q[i] = void 0, He.push(i));
    }, Yr = () => q.length / 2 - 5 - He.length, Zr = () => {
      q.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Yr;
    }, z = { toValue: (i) => (i || T("Cannot use deleted val. handle = " + i), q[i]), toHandle: (i) => {
      switch (i) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const o = He.pop() || q.length;
          return q[o] = i, q[o + 1] = 1, o;
        }
      }
    } }, Kr = { name: "emscripten::val", fromWireType: (i) => {
      var o = z.toValue(i);
      return Be(i), o;
    }, toWireType: (i, o) => z.toHandle(o), argPackAdvance: V, readValueFromPointer: Fe, destructorFunction: null }, qr = (i) => G(i, Kr), Xr = (i, o) => {
      switch (o) {
        case 4:
          return function(l) {
            return this.fromWireType(nt[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(at[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${o}): ${i}`);
      }
    }, Qr = (i, o, l) => {
      o = N(o), G(i, { name: o, fromWireType: (f) => f, toWireType: (f, p) => p, argPackAdvance: V, readValueFromPointer: Xr(o, l), destructorFunction: null });
    }, en = (i) => {
      i = i.trim();
      const o = i.indexOf("(");
      return o === -1 ? i : i.slice(0, o);
    }, tn = (i, o, l, f, p, g, b, h) => {
      var w = Tt(o, l);
      i = N(i), i = en(i), p = K(f, p), Ct(i, function() {
        me(`Cannot call ${i} due to unbound types`, w);
      }, o - 1), le([], w, (I) => {
        var C = [I[0], null].concat(I.slice(1));
        return St(i, Ft(i, C, null, p, g), o - 1), [];
      });
    }, rn = (i, o, l, f, p) => {
      o = N(o);
      var g = (C) => C;
      if (f === 0) {
        var b = 32 - 8 * l;
        g = (C) => C << b >>> b;
      }
      var h = o.includes("unsigned"), w = (C, D) => {
      }, I;
      h ? I = function(C, D) {
        return w(D, this.name), D >>> 0;
      } : I = function(C, D) {
        return w(D, this.name), D;
      }, G(i, { name: o, fromWireType: g, toWireType: I, argPackAdvance: V, readValueFromPointer: gt(o, l, f !== 0), destructorFunction: null });
    }, nn = (i, o, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], p = f[o];
      function g(b) {
        var h = _[b >> 2], w = _[b + 4 >> 2];
        return new p(te.buffer, w, h);
      }
      l = N(l), G(i, { name: l, fromWireType: g, argPackAdvance: V, readValueFromPointer: g }, { ignoreDuplicateRegistrations: !0 });
    }, on = (i, o, l, f) => {
      if (!(f > 0)) return 0;
      for (var p = l, g = l + f - 1, b = 0; b < i.length; ++b) {
        var h = i.charCodeAt(b);
        if (h >= 55296 && h <= 57343) {
          var w = i.charCodeAt(++b);
          h = 65536 + ((h & 1023) << 10) | w & 1023;
        }
        if (h <= 127) {
          if (l >= g) break;
          o[l++] = h;
        } else if (h <= 2047) {
          if (l + 1 >= g) break;
          o[l++] = 192 | h >> 6, o[l++] = 128 | h & 63;
        } else if (h <= 65535) {
          if (l + 2 >= g) break;
          o[l++] = 224 | h >> 12, o[l++] = 128 | h >> 6 & 63, o[l++] = 128 | h & 63;
        } else {
          if (l + 3 >= g) break;
          o[l++] = 240 | h >> 18, o[l++] = 128 | h >> 12 & 63, o[l++] = 128 | h >> 6 & 63, o[l++] = 128 | h & 63;
        }
      }
      return o[l] = 0, l - p;
    }, an = (i, o, l) => on(i, U, o, l), sn = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f <= 127 ? o++ : f <= 2047 ? o += 2 : f >= 55296 && f <= 57343 ? (o += 4, ++l) : o += 3;
      }
      return o;
    }, Mt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, ln = (i, o = 0, l = NaN) => {
      for (var f = o + l, p = o; i[p] && !(p >= f); ) ++p;
      if (p - o > 16 && i.buffer && Mt)
        return Mt.decode(i.subarray(o, p));
      for (var g = ""; o < p; ) {
        var b = i[o++];
        if (!(b & 128)) {
          g += String.fromCharCode(b);
          continue;
        }
        var h = i[o++] & 63;
        if ((b & 224) == 192) {
          g += String.fromCharCode((b & 31) << 6 | h);
          continue;
        }
        var w = i[o++] & 63;
        if ((b & 240) == 224 ? b = (b & 15) << 12 | h << 6 | w : b = (b & 7) << 18 | h << 12 | w << 6 | i[o++] & 63, b < 65536)
          g += String.fromCharCode(b);
        else {
          var I = b - 65536;
          g += String.fromCharCode(55296 | I >> 10, 56320 | I & 1023);
        }
      }
      return g;
    }, cn = (i, o) => i ? ln(U, i, o) : "", un = (i, o) => {
      o = N(o), G(i, { name: o, fromWireType(l) {
        for (var f = _[l >> 2], p = l + 4, g, b, h = p, b = 0; b <= f; ++b) {
          var w = p + b;
          if (b == f || U[w] == 0) {
            var I = w - h, C = cn(h, I);
            g === void 0 ? g = C : (g += "\0", g += C), h = w + 1;
          }
        }
        return J(l), g;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var p, g = typeof f == "string";
        g || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || T("Cannot pass non-string to std::string"), g ? p = sn(f) : p = f.length;
        var b = Ve(4 + p + 1), h = b + 4;
        if (_[b >> 2] = p, g)
          an(f, h, p + 1);
        else if (g)
          for (var w = 0; w < p; ++w) {
            var I = f.charCodeAt(w);
            I > 255 && (J(b), T("String has UTF-16 code units that do not fit in 8 bits")), U[h + w] = I;
          }
        else
          for (var w = 0; w < p; ++w)
            U[h + w] = f[w];
        return l !== null && l.push(J, b), b;
      }, argPackAdvance: V, readValueFromPointer: Fe, destructorFunction(l) {
        J(l);
      } });
    }, Lt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, dn = (i, o) => {
      for (var l = i, f = l >> 1, p = f + o / 2; !(f >= p) && Se[f]; ) ++f;
      if (l = f << 1, l - i > 32 && Lt) return Lt.decode(U.subarray(i, l));
      for (var g = "", b = 0; !(b >= o / 2); ++b) {
        var h = de[i + b * 2 >> 1];
        if (h == 0) break;
        g += String.fromCharCode(h);
      }
      return g;
    }, fn = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 2) return 0;
      l -= 2;
      for (var f = o, p = l < i.length * 2 ? l / 2 : i.length, g = 0; g < p; ++g) {
        var b = i.charCodeAt(g);
        de[o >> 1] = b, o += 2;
      }
      return de[o >> 1] = 0, o - f;
    }, pn = (i) => i.length * 2, mn = (i, o) => {
      for (var l = 0, f = ""; !(l >= o / 4); ) {
        var p = re[i + l * 4 >> 2];
        if (p == 0) break;
        if (++l, p >= 65536) {
          var g = p - 65536;
          f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023);
        } else
          f += String.fromCharCode(p);
      }
      return f;
    }, hn = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 4) return 0;
      for (var f = o, p = f + l - 4, g = 0; g < i.length; ++g) {
        var b = i.charCodeAt(g);
        if (b >= 55296 && b <= 57343) {
          var h = i.charCodeAt(++g);
          b = 65536 + ((b & 1023) << 10) | h & 1023;
        }
        if (re[o >> 2] = b, o += 4, o + 4 > p) break;
      }
      return re[o >> 2] = 0, o - f;
    }, yn = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, o += 4;
      }
      return o;
    }, gn = (i, o, l) => {
      l = N(l);
      var f, p, g, b;
      o === 2 ? (f = dn, p = fn, b = pn, g = (h) => Se[h >> 1]) : o === 4 && (f = mn, p = hn, b = yn, g = (h) => _[h >> 2]), G(i, { name: l, fromWireType: (h) => {
        for (var w = _[h >> 2], I, C = h + 4, D = 0; D <= w; ++D) {
          var F = h + 4 + D * o;
          if (D == w || g(F) == 0) {
            var W = F - C, H = f(C, W);
            I === void 0 ? I = H : (I += "\0", I += H), C = F + o;
          }
        }
        return J(h), I;
      }, toWireType: (h, w) => {
        typeof w != "string" && T(`Cannot pass non-string to C++ string type ${l}`);
        var I = b(w), C = Ve(4 + I + o);
        return _[C >> 2] = I / o, p(w, C + 4, I + o), h !== null && h.push(J, C), C;
      }, argPackAdvance: V, readValueFromPointer: Fe, destructorFunction(h) {
        J(h);
      } });
    }, bn = (i, o) => {
      o = N(o), G(i, { isVoid: !0, name: o, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, vn = () => {
      pt = !1, Dt = 0;
    }, $t = (i, o) => {
      var l = oe[i];
      return l === void 0 && T(`${o} has unknown type ${jt(i)}`), l;
    }, On = (i, o, l) => {
      var f = [], p = i.toWireType(f, l);
      return f.length && (_[o >> 2] = z.toHandle(f)), p;
    }, wn = (i, o, l) => (i = z.toValue(i), o = $t(o, "emval::as"), On(o, l, i)), Pn = (i, o) => (i = z.toValue(i), o = z.toValue(o), z.toHandle(i[o])), Cn = {}, Sn = (i) => {
      var o = Cn[i];
      return o === void 0 ? N(i) : o;
    }, In = (i) => z.toHandle(Sn(i)), jn = (i) => {
      var o = z.toValue(i);
      Ge(o), Be(i);
    }, Tn = (i, o) => {
      i = $t(i, "_emval_take_value");
      var l = i.readValueFromPointer(o);
      return z.toHandle(l);
    }, he = {}, An = () => performance.now(), Dn = (i, o) => {
      if (he[i] && (clearTimeout(he[i].id), delete he[i]), !o) return 0;
      var l = setTimeout(() => {
        delete he[i], Et(() => Ln(i, An()));
      }, o);
      return he[i] = { id: l, timeout_ms: o }, 0;
    }, _n = () => 2147483648, kn = (i, o) => Math.ceil(i / o) * o, En = (i) => {
      var o = Pe.buffer, l = (i - o.byteLength + 65535) / 65536 | 0;
      try {
        return Pe.grow(l), lt(), 1;
      } catch {
      }
    }, Fn = (i) => {
      var o = U.length;
      i >>>= 0;
      var l = _n();
      if (i > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var p = o * (1 + 0.2 / f);
        p = Math.min(p, i + 100663296);
        var g = Math.min(l, kn(Math.max(i, p), 65536)), b = En(g);
        if (b)
          return !0;
      }
      return !1;
    };
    yr(), se = t.BindingError = class extends Error {
      constructor(o) {
        super(o), this.name = "BindingError";
      }
    }, yt = t.InternalError = class extends Error {
      constructor(o) {
        super(o), this.name = "InternalError";
      }
    }, Tr(), Lr(), It = t.UnboundTypeError = Wr(Error, "UnboundTypeError"), Zr();
    var Rn = { h: mr, t: hr, l: br, w: vr, f: Ur, e: Vr, a: Jr, u: qr, k: Qr, b: tn, d: rn, c: nn, v: un, g: gn, x: bn, q: vn, i: wn, y: Be, j: Pn, o: In, n: jn, m: Tn, r: Dn, s: Fn, p: kt }, j = await ur();
    j.A;
    var Mn = j.B, Ve = t._malloc = j.C, J = t._free = j.D, Ln = j.E;
    t.dynCall_v = j.G, t.dynCall_ii = j.H, t.dynCall_vi = j.I, t.dynCall_i = j.J, t.dynCall_iii = j.K, t.dynCall_viii = j.L, t.dynCall_fii = j.M, t.dynCall_viif = j.N, t.dynCall_viiii = j.O, t.dynCall_viiiiii = j.P, t.dynCall_iiiiii = j.Q, t.dynCall_viiiii = j.R, t.dynCall_iiiiiiii = j.S, t.dynCall_viiiiiii = j.T, t.dynCall_viiiiiiiiidi = j.U, t.dynCall_viiiiiiiidi = j.V, t.dynCall_viiiiiiiiii = j.W, t.dynCall_viiiiiiiii = j.X, t.dynCall_viiiiiiii = j.Y, t.dynCall_iiiiiii = j.Z, t.dynCall_iiiii = j._, t.dynCall_iiii = j.$;
    var $n = j.aa, xn = j.ba, Nn = j.ca, Wn = j.da;
    function Je() {
      if (ne > 0) {
        fe = Je;
        return;
      }
      if (Qt(), ne > 0) {
        fe = Je;
        return;
      }
      function i() {
        var o;
        t.calledRun = !0, !ee && (er(), e(t), (o = t.onRuntimeInitialized) == null || o.call(t), tr());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), i();
      }, 1)) : i();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return Je(), r = a, r;
  };
})();
class Di extends mi {
  getSamWasmFilePath(s, r) {
    return `${s}/magnifeye/wasm/${r}`;
  }
  fetchSamModule(s) {
    return Ai(s);
  }
}
eo(Di);
