var Bo = Object.defineProperty;
var gr = (c) => {
  throw TypeError(c);
};
var Ho = (c, i, r) => i in c ? Bo(c, i, { enumerable: !0, configurable: !0, writable: !0, value: r }) : c[i] = r;
var Ze = (c, i, r) => Ho(c, typeof i != "symbol" ? i + "" : i, r), yr = (c, i, r) => i.has(c) || gr("Cannot " + r);
var Z = (c, i, r) => (yr(c, i, "read from private field"), r ? r.call(c) : i.get(c)), Ke = (c, i, r) => i.has(c) ? gr("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(c) : i.set(c, r), qe = (c, i, r, t) => (yr(c, i, "write to private field"), t ? t.call(c, r) : i.set(c, r), r);
const br = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Vo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class G extends Error {
  constructor(r, t) {
    super(r);
    Ze(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(r) {
  }
  static fromCameraError(r) {
    if (this.logError(r), r instanceof G)
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
    return new G(t, r);
  }
  static fromError(r) {
    if (this.logError(r), r instanceof G)
      return r;
    const t = "An unexpected error has occurred";
    return new G(t);
  }
}
const Jo = {
  RGB: "RGB",
  RGBA: "RGBA"
};
var se, ge, je;
class Yo {
  constructor(i, r) {
    Ke(this, se);
    Ke(this, ge);
    Ke(this, je);
    qe(this, se, i), qe(this, ge, this.allocate(r.length * r.BYTES_PER_ELEMENT)), qe(this, je, this.allocate(r.length * r.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return Z(this, ge);
  }
  get bgr0ImagePointer() {
    return Z(this, je);
  }
  allocate(i) {
    return Z(this, se)._malloc(i);
  }
  free() {
    Z(this, se)._free(Z(this, ge)), Z(this, se)._free(Z(this, je));
  }
  writeDataToMemory(i) {
    Z(this, se).HEAPU8.set(i, Z(this, ge));
  }
}
se = new WeakMap(), ge = new WeakMap(), je = new WeakMap();
class Zo {
  constructor() {
    Ze(this, "samWasmModule");
  }
  getOverriddenModules(i, r) {
    return {
      locateFile: (t) => new URL(r || t, i).href
    };
  }
  async handleMissingOrInvalidSamModule(i, r) {
    try {
      const t = await fetch(i);
      if (!t.ok)
        throw new G(
          `The path to ${r} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${i}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new G(
          `The provided ${r} is not a valid WASM module. Please check provided path to wasm files. Current path is ${i}`
        );
    } catch (t) {
      if (t instanceof G)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Vo() ? br.simd : br.sam;
  }
  async initSamModule(i, r) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(r, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(i, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new G("Could not init detector.");
    }
  }
  terminateSamModule() {
    var i;
    (i = this.samWasmModule) == null || i.terminate();
  }
  async getSamVersion() {
    var r;
    const i = await ((r = this.samWasmModule) == null ? void 0 : r.getInfoString());
    return i == null ? void 0 : i.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(i) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const r = new Yo(this.samWasmModule, i);
    return r.writeDataToMemory(i), r;
  }
  convertToSamColorImage(i, r) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(i);
    return this.samWasmModule.convertToSamColorImage(
      r.width,
      r.height,
      t.rgbaImagePointer,
      Jo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
}
const Xe = (c, i) => Math.hypot(i.x - c.x, i.y - c.y), Ko = (c) => {
  const { bottomLeft: i, bottomRight: r, topLeft: t, topRight: e } = c, n = Xe(t, e), o = Xe(e, r), d = Xe(i, r), f = Xe(t, i);
  return Math.min(n, o, d, f);
};
var me = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Mr = {}, vr = {}, qo = Xo;
function Xo(c, i) {
  for (var r = new Array(arguments.length - 1), t = 0, e = 2, n = !0; e < arguments.length; )
    r[t++] = arguments[e++];
  return new Promise(function(o, d) {
    r[t] = function(f) {
      if (n)
        if (n = !1, f)
          d(f);
        else {
          for (var y = new Array(arguments.length - 1), O = 0; O < y.length; )
            y[O++] = arguments[O];
          o.apply(null, y);
        }
    };
    try {
      c.apply(i || null, r);
    } catch (f) {
      n && (n = !1, d(f));
    }
  });
}
var Rr = {};
(function(c) {
  var i = c;
  i.length = function(o) {
    var d = o.length;
    if (!d)
      return 0;
    for (var f = 0; --d % 4 > 1 && o.charAt(d) === "="; )
      ++f;
    return Math.ceil(o.length * 3) / 4 - f;
  };
  for (var r = new Array(64), t = new Array(123), e = 0; e < 64; )
    t[r[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
  i.encode = function(o, d, f) {
    for (var y = null, O = [], I = 0, C = 0, _; d < f; ) {
      var X = o[d++];
      switch (C) {
        case 0:
          O[I++] = r[X >> 2], _ = (X & 3) << 4, C = 1;
          break;
        case 1:
          O[I++] = r[_ | X >> 4], _ = (X & 15) << 2, C = 2;
          break;
        case 2:
          O[I++] = r[_ | X >> 6], O[I++] = r[X & 63], C = 0;
          break;
      }
      I > 8191 && ((y || (y = [])).push(String.fromCharCode.apply(String, O)), I = 0);
    }
    return C && (O[I++] = r[_], O[I++] = 61, C === 1 && (O[I++] = 61)), y ? (I && y.push(String.fromCharCode.apply(String, O.slice(0, I))), y.join("")) : String.fromCharCode.apply(String, O.slice(0, I));
  };
  var n = "invalid encoding";
  i.decode = function(o, d, f) {
    for (var y = f, O = 0, I, C = 0; C < o.length; ) {
      var _ = o.charCodeAt(C++);
      if (_ === 61 && O > 1)
        break;
      if ((_ = t[_]) === void 0)
        throw Error(n);
      switch (O) {
        case 0:
          I = _, O = 1;
          break;
        case 1:
          d[f++] = I << 2 | (_ & 48) >> 4, I = _, O = 2;
          break;
        case 2:
          d[f++] = (I & 15) << 4 | (_ & 60) >> 2, I = _, O = 3;
          break;
        case 3:
          d[f++] = (I & 3) << 6 | _, O = 0;
          break;
      }
    }
    if (O === 1)
      throw Error(n);
    return f - y;
  }, i.test = function(o) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
  };
})(Rr);
var Qo = it;
function it() {
  this._listeners = {};
}
it.prototype.on = function(c, i, r) {
  return (this._listeners[c] || (this._listeners[c] = [])).push({
    fn: i,
    ctx: r || this
  }), this;
};
it.prototype.off = function(c, i) {
  if (c === void 0)
    this._listeners = {};
  else if (i === void 0)
    this._listeners[c] = [];
  else
    for (var r = this._listeners[c], t = 0; t < r.length; )
      r[t].fn === i ? r.splice(t, 1) : ++t;
  return this;
};
it.prototype.emit = function(c) {
  var i = this._listeners[c];
  if (i) {
    for (var r = [], t = 1; t < arguments.length; )
      r.push(arguments[t++]);
    for (t = 0; t < i.length; )
      i[t].fn.apply(i[t++].ctx, r);
  }
  return this;
};
var ei = Or(Or);
function Or(c) {
  return typeof Float32Array < "u" ? function() {
    var i = new Float32Array([-0]), r = new Uint8Array(i.buffer), t = r[3] === 128;
    function e(f, y, O) {
      i[0] = f, y[O] = r[0], y[O + 1] = r[1], y[O + 2] = r[2], y[O + 3] = r[3];
    }
    function n(f, y, O) {
      i[0] = f, y[O] = r[3], y[O + 1] = r[2], y[O + 2] = r[1], y[O + 3] = r[0];
    }
    c.writeFloatLE = t ? e : n, c.writeFloatBE = t ? n : e;
    function o(f, y) {
      return r[0] = f[y], r[1] = f[y + 1], r[2] = f[y + 2], r[3] = f[y + 3], i[0];
    }
    function d(f, y) {
      return r[3] = f[y], r[2] = f[y + 1], r[1] = f[y + 2], r[0] = f[y + 3], i[0];
    }
    c.readFloatLE = t ? o : d, c.readFloatBE = t ? d : o;
  }() : function() {
    function i(t, e, n, o) {
      var d = e < 0 ? 1 : 0;
      if (d && (e = -e), e === 0)
        t(1 / e > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), n, o);
      else if (isNaN(e))
        t(2143289344, n, o);
      else if (e > 34028234663852886e22)
        t((d << 31 | 2139095040) >>> 0, n, o);
      else if (e < 11754943508222875e-54)
        t((d << 31 | Math.round(e / 1401298464324817e-60)) >>> 0, n, o);
      else {
        var f = Math.floor(Math.log(e) / Math.LN2), y = Math.round(e * Math.pow(2, -f) * 8388608) & 8388607;
        t((d << 31 | f + 127 << 23 | y) >>> 0, n, o);
      }
    }
    c.writeFloatLE = i.bind(null, wr), c.writeFloatBE = i.bind(null, Pr);
    function r(t, e, n) {
      var o = t(e, n), d = (o >> 31) * 2 + 1, f = o >>> 23 & 255, y = o & 8388607;
      return f === 255 ? y ? NaN : d * (1 / 0) : f === 0 ? d * 1401298464324817e-60 * y : d * Math.pow(2, f - 150) * (y + 8388608);
    }
    c.readFloatLE = r.bind(null, jr), c.readFloatBE = r.bind(null, Ir);
  }(), typeof Float64Array < "u" ? function() {
    var i = new Float64Array([-0]), r = new Uint8Array(i.buffer), t = r[7] === 128;
    function e(f, y, O) {
      i[0] = f, y[O] = r[0], y[O + 1] = r[1], y[O + 2] = r[2], y[O + 3] = r[3], y[O + 4] = r[4], y[O + 5] = r[5], y[O + 6] = r[6], y[O + 7] = r[7];
    }
    function n(f, y, O) {
      i[0] = f, y[O] = r[7], y[O + 1] = r[6], y[O + 2] = r[5], y[O + 3] = r[4], y[O + 4] = r[3], y[O + 5] = r[2], y[O + 6] = r[1], y[O + 7] = r[0];
    }
    c.writeDoubleLE = t ? e : n, c.writeDoubleBE = t ? n : e;
    function o(f, y) {
      return r[0] = f[y], r[1] = f[y + 1], r[2] = f[y + 2], r[3] = f[y + 3], r[4] = f[y + 4], r[5] = f[y + 5], r[6] = f[y + 6], r[7] = f[y + 7], i[0];
    }
    function d(f, y) {
      return r[7] = f[y], r[6] = f[y + 1], r[5] = f[y + 2], r[4] = f[y + 3], r[3] = f[y + 4], r[2] = f[y + 5], r[1] = f[y + 6], r[0] = f[y + 7], i[0];
    }
    c.readDoubleLE = t ? o : d, c.readDoubleBE = t ? d : o;
  }() : function() {
    function i(t, e, n, o, d, f) {
      var y = o < 0 ? 1 : 0;
      if (y && (o = -o), o === 0)
        t(0, d, f + e), t(1 / o > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), d, f + n);
      else if (isNaN(o))
        t(0, d, f + e), t(2146959360, d, f + n);
      else if (o > 17976931348623157e292)
        t(0, d, f + e), t((y << 31 | 2146435072) >>> 0, d, f + n);
      else {
        var O;
        if (o < 22250738585072014e-324)
          O = o / 5e-324, t(O >>> 0, d, f + e), t((y << 31 | O / 4294967296) >>> 0, d, f + n);
        else {
          var I = Math.floor(Math.log(o) / Math.LN2);
          I === 1024 && (I = 1023), O = o * Math.pow(2, -I), t(O * 4503599627370496 >>> 0, d, f + e), t((y << 31 | I + 1023 << 20 | O * 1048576 & 1048575) >>> 0, d, f + n);
        }
      }
    }
    c.writeDoubleLE = i.bind(null, wr, 0, 4), c.writeDoubleBE = i.bind(null, Pr, 4, 0);
    function r(t, e, n, o, d) {
      var f = t(o, d + e), y = t(o, d + n), O = (y >> 31) * 2 + 1, I = y >>> 20 & 2047, C = 4294967296 * (y & 1048575) + f;
      return I === 2047 ? C ? NaN : O * (1 / 0) : I === 0 ? O * 5e-324 * C : O * Math.pow(2, I - 1075) * (C + 4503599627370496);
    }
    c.readDoubleLE = r.bind(null, jr, 0, 4), c.readDoubleBE = r.bind(null, Ir, 4, 0);
  }(), c;
}
function wr(c, i, r) {
  i[r] = c & 255, i[r + 1] = c >>> 8 & 255, i[r + 2] = c >>> 16 & 255, i[r + 3] = c >>> 24;
}
function Pr(c, i, r) {
  i[r] = c >>> 24, i[r + 1] = c >>> 16 & 255, i[r + 2] = c >>> 8 & 255, i[r + 3] = c & 255;
}
function jr(c, i) {
  return (c[i] | c[i + 1] << 8 | c[i + 2] << 16 | c[i + 3] << 24) >>> 0;
}
function Ir(c, i) {
  return (c[i] << 24 | c[i + 1] << 16 | c[i + 2] << 8 | c[i + 3]) >>> 0;
}
function Sr(c) {
  throw new Error('Could not dynamically require "' + c + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ti = ri;
function ri(c) {
  try {
    if (typeof Sr != "function")
      return null;
    var i = Sr(c);
    return i && (i.length || Object.keys(i).length) ? i : null;
  } catch {
    return null;
  }
}
var Lr = {};
(function(c) {
  var i = c;
  i.length = function(r) {
    for (var t = 0, e = 0, n = 0; n < r.length; ++n)
      e = r.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (r.charCodeAt(n + 1) & 64512) === 56320 ? (++n, t += 4) : t += 3;
    return t;
  }, i.read = function(r, t, e) {
    var n = e - t;
    if (n < 1)
      return "";
    for (var o = null, d = [], f = 0, y; t < e; )
      y = r[t++], y < 128 ? d[f++] = y : y > 191 && y < 224 ? d[f++] = (y & 31) << 6 | r[t++] & 63 : y > 239 && y < 365 ? (y = ((y & 7) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, d[f++] = 55296 + (y >> 10), d[f++] = 56320 + (y & 1023)) : d[f++] = (y & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63, f > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, d)), f = 0);
    return o ? (f && o.push(String.fromCharCode.apply(String, d.slice(0, f))), o.join("")) : String.fromCharCode.apply(String, d.slice(0, f));
  }, i.write = function(r, t, e) {
    for (var n = e, o, d, f = 0; f < r.length; ++f)
      o = r.charCodeAt(f), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((d = r.charCodeAt(f + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (d & 1023), ++f, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
    return e - n;
  };
})(Lr);
var ni = oi;
function oi(c, i, r) {
  var t = r || 8192, e = t >>> 1, n = null, o = t;
  return function(d) {
    if (d < 1 || d > e)
      return c(d);
    o + d > t && (n = c(t), o = 0);
    var f = i.call(n, o, o += d);
    return o & 7 && (o = (o | 7) + 1), f;
  };
}
var Ot, Cr;
function ii() {
  if (Cr)
    return Ot;
  Cr = 1, Ot = i;
  var c = be();
  function i(n, o) {
    this.lo = n >>> 0, this.hi = o >>> 0;
  }
  var r = i.zero = new i(0, 0);
  r.toNumber = function() {
    return 0;
  }, r.zzEncode = r.zzDecode = function() {
    return this;
  }, r.length = function() {
    return 1;
  };
  var t = i.zeroHash = "\0\0\0\0\0\0\0\0";
  i.fromNumber = function(n) {
    if (n === 0)
      return r;
    var o = n < 0;
    o && (n = -n);
    var d = n >>> 0, f = (n - d) / 4294967296 >>> 0;
    return o && (f = ~f >>> 0, d = ~d >>> 0, ++d > 4294967295 && (d = 0, ++f > 4294967295 && (f = 0))), new i(d, f);
  }, i.from = function(n) {
    if (typeof n == "number")
      return i.fromNumber(n);
    if (c.isString(n))
      if (c.Long)
        n = c.Long.fromString(n);
      else
        return i.fromNumber(parseInt(n, 10));
    return n.low || n.high ? new i(n.low >>> 0, n.high >>> 0) : r;
  }, i.prototype.toNumber = function(n) {
    if (!n && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, d = ~this.hi >>> 0;
      return o || (d = d + 1 >>> 0), -(o + d * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, i.prototype.toLong = function(n) {
    return c.Long ? new c.Long(this.lo | 0, this.hi | 0, !!n) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!n };
  };
  var e = String.prototype.charCodeAt;
  return i.fromHash = function(n) {
    return n === t ? r : new i(
      (e.call(n, 0) | e.call(n, 1) << 8 | e.call(n, 2) << 16 | e.call(n, 3) << 24) >>> 0,
      (e.call(n, 4) | e.call(n, 5) << 8 | e.call(n, 6) << 16 | e.call(n, 7) << 24) >>> 0
    );
  }, i.prototype.toHash = function() {
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
  }, i.prototype.zzEncode = function() {
    var n = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ n) >>> 0, this.lo = (this.lo << 1 ^ n) >>> 0, this;
  }, i.prototype.zzDecode = function() {
    var n = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ n) >>> 0, this.hi = (this.hi >>> 1 ^ n) >>> 0, this;
  }, i.prototype.length = function() {
    var n = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, d = this.hi >>> 24;
    return d === 0 ? o === 0 ? n < 16384 ? n < 128 ? 1 : 2 : n < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : d < 128 ? 9 : 10;
  }, Ot;
}
var Ar;
function be() {
  return Ar || (Ar = 1, function(c) {
    var i = c;
    i.asPromise = qo, i.base64 = Rr, i.EventEmitter = Qo, i.float = ei, i.inquire = ti, i.utf8 = Lr, i.pool = ni, i.LongBits = ii(), i.isNode = !!(typeof me < "u" && me && me.process && me.process.versions && me.process.versions.node), i.global = i.isNode && me || typeof window < "u" && window || typeof self < "u" && self || me, i.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), i.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), i.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, i.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, i.isObject = function(e) {
      return e && typeof e == "object";
    }, i.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    i.isSet = function(e, n) {
      var o = e[n];
      return o != null && e.hasOwnProperty(n) ? typeof o != "object" || (Array.isArray(o) ? o.length : Object.keys(o).length) > 0 : !1;
    }, i.Buffer = function() {
      try {
        var e = i.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), i._Buffer_from = null, i._Buffer_allocUnsafe = null, i.newBuffer = function(e) {
      return typeof e == "number" ? i.Buffer ? i._Buffer_allocUnsafe(e) : new i.Array(e) : i.Buffer ? i._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, i.Array = typeof Uint8Array < "u" ? Uint8Array : Array, i.Long = /* istanbul ignore next */
    i.global.dcodeIO && /* istanbul ignore next */
    i.global.dcodeIO.Long || /* istanbul ignore next */
    i.global.Long || i.inquire("long"), i.key2Re = /^true|false|0|1$/, i.key32Re = /^-?(?:0|[1-9][0-9]*)$/, i.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, i.longToHash = function(e) {
      return e ? i.LongBits.from(e).toHash() : i.LongBits.zeroHash;
    }, i.longFromHash = function(e, n) {
      var o = i.LongBits.fromHash(e);
      return i.Long ? i.Long.fromBits(o.lo, o.hi, n) : o.toNumber(!!n);
    };
    function r(e, n, o) {
      for (var d = Object.keys(n), f = 0; f < d.length; ++f)
        (e[d[f]] === void 0 || !o) && (e[d[f]] = n[d[f]]);
      return e;
    }
    i.merge = r, i.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function n(o, d) {
        if (!(this instanceof n))
          return new n(o, d);
        Object.defineProperty(this, "message", { get: function() {
          return o;
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
    i.newError = t, i.ProtocolError = t("ProtocolError"), i.oneOfGetter = function(e) {
      for (var n = {}, o = 0; o < e.length; ++o)
        n[e[o]] = 1;
      return function() {
        for (var d = Object.keys(this), f = d.length - 1; f > -1; --f)
          if (n[d[f]] === 1 && this[d[f]] !== void 0 && this[d[f]] !== null)
            return d[f];
      };
    }, i.oneOfSetter = function(e) {
      return function(n) {
        for (var o = 0; o < e.length; ++o)
          e[o] !== n && delete this[e[o]];
      };
    }, i.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, i._configure = function() {
      var e = i.Buffer;
      if (!e) {
        i._Buffer_from = i._Buffer_allocUnsafe = null;
        return;
      }
      i._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(n, o) {
        return new e(n, o);
      }, i._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(n) {
        return new e(n);
      };
    };
  }(vr)), vr;
}
var xr = F, B = be(), jt, at = B.LongBits, Dr = B.base64, Tr = B.utf8;
function Ee(c, i, r) {
  this.fn = c, this.len = i, this.next = void 0, this.val = r;
}
function At() {
}
function ai(c) {
  this.head = c.head, this.tail = c.tail, this.len = c.len, this.next = c.states;
}
function F() {
  this.len = 0, this.head = new Ee(At, 0, 0), this.tail = this.head, this.states = null;
}
var Nr = function() {
  return B.Buffer ? function() {
    return (F.create = function() {
      return new jt();
    })();
  } : function() {
    return new F();
  };
};
F.create = Nr();
F.alloc = function(c) {
  return new B.Array(c);
};
B.Array !== Array && (F.alloc = B.pool(F.alloc, B.Array.prototype.subarray));
F.prototype._push = function(c, i, r) {
  return this.tail = this.tail.next = new Ee(c, i, r), this.len += i, this;
};
function Dt(c, i, r) {
  i[r] = c & 255;
}
function si(c, i, r) {
  for (; c > 127; )
    i[r++] = c & 127 | 128, c >>>= 7;
  i[r] = c;
}
function Tt(c, i) {
  this.len = c, this.next = void 0, this.val = i;
}
Tt.prototype = Object.create(Ee.prototype);
Tt.prototype.fn = si;
F.prototype.uint32 = function(c) {
  return this.len += (this.tail = this.tail.next = new Tt(
    (c = c >>> 0) < 128 ? 1 : c < 16384 ? 2 : c < 2097152 ? 3 : c < 268435456 ? 4 : 5,
    c
  )).len, this;
};
F.prototype.int32 = function(c) {
  return c < 0 ? this._push(kt, 10, at.fromNumber(c)) : this.uint32(c);
};
F.prototype.sint32 = function(c) {
  return this.uint32((c << 1 ^ c >> 31) >>> 0);
};
function kt(c, i, r) {
  for (; c.hi; )
    i[r++] = c.lo & 127 | 128, c.lo = (c.lo >>> 7 | c.hi << 25) >>> 0, c.hi >>>= 7;
  for (; c.lo > 127; )
    i[r++] = c.lo & 127 | 128, c.lo = c.lo >>> 7;
  i[r++] = c.lo;
}
F.prototype.uint64 = function(c) {
  var i = at.from(c);
  return this._push(kt, i.length(), i);
};
F.prototype.int64 = F.prototype.uint64;
F.prototype.sint64 = function(c) {
  var i = at.from(c).zzEncode();
  return this._push(kt, i.length(), i);
};
F.prototype.bool = function(c) {
  return this._push(Dt, 1, c ? 1 : 0);
};
function It(c, i, r) {
  i[r] = c & 255, i[r + 1] = c >>> 8 & 255, i[r + 2] = c >>> 16 & 255, i[r + 3] = c >>> 24;
}
F.prototype.fixed32 = function(c) {
  return this._push(It, 4, c >>> 0);
};
F.prototype.sfixed32 = F.prototype.fixed32;
F.prototype.fixed64 = function(c) {
  var i = at.from(c);
  return this._push(It, 4, i.lo)._push(It, 4, i.hi);
};
F.prototype.sfixed64 = F.prototype.fixed64;
F.prototype.float = function(c) {
  return this._push(B.float.writeFloatLE, 4, c);
};
F.prototype.double = function(c) {
  return this._push(B.float.writeDoubleLE, 8, c);
};
var li = B.Array.prototype.set ? function(c, i, r) {
  i.set(c, r);
} : function(c, i, r) {
  for (var t = 0; t < c.length; ++t)
    i[r + t] = c[t];
};
F.prototype.bytes = function(c) {
  var i = c.length >>> 0;
  if (!i)
    return this._push(Dt, 1, 0);
  if (B.isString(c)) {
    var r = F.alloc(i = Dr.length(c));
    Dr.decode(c, r, 0), c = r;
  }
  return this.uint32(i)._push(li, i, c);
};
F.prototype.string = function(c) {
  var i = Tr.length(c);
  return i ? this.uint32(i)._push(Tr.write, i, c) : this._push(Dt, 1, 0);
};
F.prototype.fork = function() {
  return this.states = new ai(this), this.head = this.tail = new Ee(At, 0, 0), this.len = 0, this;
};
F.prototype.reset = function() {
  return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new Ee(At, 0, 0), this.len = 0), this;
};
F.prototype.ldelim = function() {
  var c = this.head, i = this.tail, r = this.len;
  return this.reset().uint32(r), r && (this.tail.next = c.next, this.tail = i, this.len += r), this;
};
F.prototype.finish = function() {
  for (var c = this.head.next, i = this.constructor.alloc(this.len), r = 0; c; )
    c.fn(c.val, i, r), r += c.len, c = c.next;
  return i;
};
F._configure = function(c) {
  jt = c, F.create = Nr(), jt._configure();
};
var ci = K, Wr = xr;
(K.prototype = Object.create(Wr.prototype)).constructor = K;
var le = be();
function K() {
  Wr.call(this);
}
K._configure = function() {
  K.alloc = le._Buffer_allocUnsafe, K.writeBytesBuffer = le.Buffer && le.Buffer.prototype instanceof Uint8Array && le.Buffer.prototype.set.name === "set" ? function(c, i, r) {
    i.set(c, r);
  } : function(c, i, r) {
    if (c.copy)
      c.copy(i, r, 0, c.length);
    else
      for (var t = 0; t < c.length; )
        i[r++] = c[t++];
  };
};
K.prototype.bytes = function(c) {
  le.isString(c) && (c = le._Buffer_from(c, "base64"));
  var i = c.length >>> 0;
  return this.uint32(i), i && this._push(K.writeBytesBuffer, i, c), this;
};
function di(c, i, r) {
  c.length < 40 ? le.utf8.write(c, i, r) : i.utf8Write ? i.utf8Write(c, r) : i.write(c, r);
}
K.prototype.string = function(c) {
  var i = le.Buffer.byteLength(c);
  return this.uint32(i), i && this._push(di, i, c), this;
};
K._configure();
var zr = L, q = be(), St, Ur = q.LongBits, ui = q.utf8;
function V(c, i) {
  return RangeError("index out of range: " + c.pos + " + " + (i || 1) + " > " + c.len);
}
function L(c) {
  this.buf = c, this.pos = 0, this.len = c.length;
}
var kr = typeof Uint8Array < "u" ? function(c) {
  if (c instanceof Uint8Array || Array.isArray(c))
    return new L(c);
  throw Error("illegal buffer");
} : function(c) {
  if (Array.isArray(c))
    return new L(c);
  throw Error("illegal buffer");
}, $r = function() {
  return q.Buffer ? function(c) {
    return (L.create = function(i) {
      return q.Buffer.isBuffer(i) ? new St(i) : kr(i);
    })(c);
  } : kr;
};
L.create = $r();
L.prototype._slice = q.Array.prototype.subarray || /* istanbul ignore next */
q.Array.prototype.slice;
L.prototype.uint32 = /* @__PURE__ */ function() {
  var c = 4294967295;
  return function() {
    if (c = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (c = (c | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (c = (c | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (c = (c | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (c = (c | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128))
      return c;
    if ((this.pos += 5) > this.len)
      throw this.pos = this.len, V(this, 10);
    return c;
  };
}();
L.prototype.int32 = function() {
  return this.uint32() | 0;
};
L.prototype.sint32 = function() {
  var c = this.uint32();
  return c >>> 1 ^ -(c & 1) | 0;
};
function wt() {
  var c = new Ur(0, 0), i = 0;
  if (this.len - this.pos > 4) {
    for (; i < 4; ++i)
      if (c.lo = (c.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0, this.buf[this.pos++] < 128)
        return c;
    if (c.lo = (c.lo | (this.buf[this.pos] & 127) << 28) >>> 0, c.hi = (c.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
      return c;
    i = 0;
  } else {
    for (; i < 3; ++i) {
      if (this.pos >= this.len)
        throw V(this);
      if (c.lo = (c.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0, this.buf[this.pos++] < 128)
        return c;
    }
    return c.lo = (c.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0, c;
  }
  if (this.len - this.pos > 4) {
    for (; i < 5; ++i)
      if (c.hi = (c.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
        return c;
  } else
    for (; i < 5; ++i) {
      if (this.pos >= this.len)
        throw V(this);
      if (c.hi = (c.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
        return c;
    }
  throw Error("invalid varint encoding");
}
L.prototype.bool = function() {
  return this.uint32() !== 0;
};
function tt(c, i) {
  return (c[i - 4] | c[i - 3] << 8 | c[i - 2] << 16 | c[i - 1] << 24) >>> 0;
}
L.prototype.fixed32 = function() {
  if (this.pos + 4 > this.len)
    throw V(this, 4);
  return tt(this.buf, this.pos += 4);
};
L.prototype.sfixed32 = function() {
  if (this.pos + 4 > this.len)
    throw V(this, 4);
  return tt(this.buf, this.pos += 4) | 0;
};
function Er() {
  if (this.pos + 8 > this.len)
    throw V(this, 8);
  return new Ur(tt(this.buf, this.pos += 4), tt(this.buf, this.pos += 4));
}
L.prototype.float = function() {
  if (this.pos + 4 > this.len)
    throw V(this, 4);
  var c = q.float.readFloatLE(this.buf, this.pos);
  return this.pos += 4, c;
};
L.prototype.double = function() {
  if (this.pos + 8 > this.len)
    throw V(this, 4);
  var c = q.float.readDoubleLE(this.buf, this.pos);
  return this.pos += 8, c;
};
L.prototype.bytes = function() {
  var c = this.uint32(), i = this.pos, r = this.pos + c;
  if (r > this.len)
    throw V(this, c);
  return this.pos += c, Array.isArray(this.buf) ? this.buf.slice(i, r) : i === r ? new this.buf.constructor(0) : this._slice.call(this.buf, i, r);
};
L.prototype.string = function() {
  var c = this.bytes();
  return ui.read(c, 0, c.length);
};
L.prototype.skip = function(c) {
  if (typeof c == "number") {
    if (this.pos + c > this.len)
      throw V(this, c);
    this.pos += c;
  } else
    do
      if (this.pos >= this.len)
        throw V(this);
    while (this.buf[this.pos++] & 128);
  return this;
};
L.prototype.skipType = function(c) {
  switch (c) {
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
      for (; (c = this.uint32() & 7) !== 4; )
        this.skipType(c);
      break;
    case 5:
      this.skip(4);
      break;
    default:
      throw Error("invalid wire type " + c + " at offset " + this.pos);
  }
  return this;
};
L._configure = function(c) {
  St = c, L.create = $r(), St._configure();
  var i = q.Long ? "toLong" : (
    /* istanbul ignore next */
    "toNumber"
  );
  q.merge(L.prototype, {
    int64: function() {
      return wt.call(this)[i](!1);
    },
    uint64: function() {
      return wt.call(this)[i](!0);
    },
    sint64: function() {
      return wt.call(this).zzDecode()[i](!1);
    },
    fixed64: function() {
      return Er.call(this)[i](!0);
    },
    sfixed64: function() {
      return Er.call(this)[i](!1);
    }
  });
};
var pi = ye, Gr = zr;
(ye.prototype = Object.create(Gr.prototype)).constructor = ye;
var Fr = be();
function ye(c) {
  Gr.call(this, c);
}
ye._configure = function() {
  Fr.Buffer && (ye.prototype._slice = Fr.Buffer.prototype.slice);
};
ye.prototype.string = function() {
  var c = this.uint32();
  return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + c, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + c, this.len));
};
ye._configure();
var Br = {}, fi = ke, Et = be();
(ke.prototype = Object.create(Et.EventEmitter.prototype)).constructor = ke;
function ke(c, i, r) {
  if (typeof c != "function")
    throw TypeError("rpcImpl must be a function");
  Et.EventEmitter.call(this), this.rpcImpl = c, this.requestDelimited = !!i, this.responseDelimited = !!r;
}
ke.prototype.rpcCall = function c(i, r, t, e, n) {
  if (!e)
    throw TypeError("request must be specified");
  var o = this;
  if (!n)
    return Et.asPromise(c, o, i, r, t, e);
  if (!o.rpcImpl) {
    setTimeout(function() {
      n(Error("already ended"));
    }, 0);
    return;
  }
  try {
    return o.rpcImpl(
      i,
      r[o.requestDelimited ? "encodeDelimited" : "encode"](e).finish(),
      function(d, f) {
        if (d)
          return o.emit("error", d, i), n(d);
        if (f === null) {
          o.end(
            /* endedByRPC */
            !0
          );
          return;
        }
        if (!(f instanceof t))
          try {
            f = t[o.responseDelimited ? "decodeDelimited" : "decode"](f);
          } catch (y) {
            return o.emit("error", y, i), n(y);
          }
        return o.emit("data", f, i), n(null, f);
      }
    );
  } catch (d) {
    o.emit("error", d, i), setTimeout(function() {
      n(d);
    }, 0);
    return;
  }
};
ke.prototype.end = function(c) {
  return this.rpcImpl && (c || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
};
(function(c) {
  var i = c;
  i.Service = fi;
})(Br);
var mi = {};
(function(c) {
  var i = c;
  i.build = "minimal", i.Writer = xr, i.BufferWriter = ci, i.Reader = zr, i.BufferReader = pi, i.util = be(), i.rpc = Br, i.roots = mi, i.configure = r;
  function r() {
    i.util._configure(), i.Writer._configure(i.BufferWriter), i.Reader._configure(i.BufferReader);
  }
  r();
})(Mr);
var T = Mr;
const h = T.Reader, E = T.Writer, p = T.util, a = T.roots.default || (T.roots.default = {});
a.dot = (() => {
  const c = {};
  return c.Content = function() {
    function i(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return i.prototype.token = p.newBuffer([]), i.prototype.iv = p.newBuffer([]), i.prototype.schemaVersion = 0, i.prototype.bytes = p.newBuffer([]), i.create = function(r) {
      return new i(r);
    }, i.encode = function(r, t) {
      return t || (t = E.create()), r.token != null && Object.hasOwnProperty.call(r, "token") && t.uint32(
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
    }, i.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, i.decode = function(r, t) {
      r instanceof h || (r = h.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new a.dot.Content();
      for (; r.pos < e; ) {
        let o = r.uint32();
        switch (o >>> 3) {
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
            r.skipType(o & 7);
            break;
        }
      }
      return n;
    }, i.decodeDelimited = function(r) {
      return r instanceof h || (r = new h(r)), this.decode(r, r.uint32());
    }, i.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.token != null && r.hasOwnProperty("token") && !(r.token && typeof r.token.length == "number" || p.isString(r.token)) ? "token: buffer expected" : r.iv != null && r.hasOwnProperty("iv") && !(r.iv && typeof r.iv.length == "number" || p.isString(r.iv)) ? "iv: buffer expected" : r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && !p.isInteger(r.schemaVersion) ? "schemaVersion: integer expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, i.fromObject = function(r) {
      if (r instanceof a.dot.Content)
        return r;
      let t = new a.dot.Content();
      return r.token != null && (typeof r.token == "string" ? p.base64.decode(r.token, t.token = p.newBuffer(p.base64.length(r.token)), 0) : r.token.length >= 0 && (t.token = r.token)), r.iv != null && (typeof r.iv == "string" ? p.base64.decode(r.iv, t.iv = p.newBuffer(p.base64.length(r.iv)), 0) : r.iv.length >= 0 && (t.iv = r.iv)), r.schemaVersion != null && (t.schemaVersion = r.schemaVersion | 0), r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, i.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = p.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = p.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.token != null && r.hasOwnProperty("token") && (e.token = t.bytes === String ? p.base64.encode(r.token, 0, r.token.length) : t.bytes === Array ? Array.prototype.slice.call(r.token) : r.token), r.iv != null && r.hasOwnProperty("iv") && (e.iv = t.bytes === String ? p.base64.encode(r.iv, 0, r.iv.length) : t.bytes === Array ? Array.prototype.slice.call(r.iv) : r.iv), r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && (e.schemaVersion = r.schemaVersion), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, i.prototype.toJSON = function() {
      return this.constructor.toObject(this, T.util.toJSONOptions);
    }, i.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Content";
    }, i;
  }(), c.v4 = function() {
    const i = {};
    return i.MagnifEyeLivenessContent = function() {
      function r(t) {
        if (this.images = [], t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.images = p.emptyArray, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        if (e || (e = E.create()), t.images != null && t.images.length)
          for (let n = 0; n < t.images.length; ++n)
            a.dot.Image.encode(t.images[n], e.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && a.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.MagnifEyeLivenessContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.images && o.images.length || (o.images = []), o.images.push(a.dot.Image.decode(t, t.uint32()));
              break;
            }
            case 2: {
              o.metadata = a.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.images != null && t.hasOwnProperty("images")) {
          if (!Array.isArray(t.images))
            return "images: array expected";
          for (let e = 0; e < t.images.length; ++e) {
            let n = a.dot.Image.verify(t.images[e]);
            if (n)
              return "images." + n;
          }
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = a.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.MagnifEyeLivenessContent)
          return t;
        let e = new a.dot.v4.MagnifEyeLivenessContent();
        if (t.images) {
          if (!Array.isArray(t.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          e.images = [];
          for (let n = 0; n < t.images.length; ++n) {
            if (typeof t.images[n] != "object")
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            e.images[n] = a.dot.Image.fromObject(t.images[n]);
          }
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          e.metadata = a.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if ((e.arrays || e.defaults) && (n.images = []), e.defaults && (n.metadata = null), t.images && t.images.length) {
          n.images = [];
          for (let o = 0; o < t.images.length; ++o)
            n.images[o] = a.dot.Image.toObject(t.images[o], e);
        }
        return t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = a.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MagnifEyeLivenessContent";
      }, r;
    }(), i.Metadata = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.platform = 0, r.prototype.sessionToken = null, r.prototype.componentVersion = "", r.prototype.web = null, r.prototype.android = null, r.prototype.ios = null;
      let t;
      return Object.defineProperty(r.prototype, "_sessionToken", {
        get: p.oneOfGetter(t = ["sessionToken"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "metadata", {
        get: p.oneOfGetter(t = ["web", "android", "ios"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && a.dot.v4.WebMetadata.encode(e.web, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && a.dot.v4.AndroidMetadata.encode(e.android, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && a.dot.v4.IosMetadata.encode(e.ios, n.uint32(
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
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.Metadata();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
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
              d.web = a.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.android = a.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              d.ios = a.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
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
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (n._sessionToken = 1, !p.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !p.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && e.hasOwnProperty("web")) {
          n.metadata = 1;
          {
            let o = a.dot.v4.WebMetadata.verify(e.web);
            if (o)
              return "web." + o;
          }
        }
        if (e.android != null && e.hasOwnProperty("android")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let o = a.dot.v4.AndroidMetadata.verify(e.android);
            if (o)
              return "android." + o;
          }
        }
        if (e.ios != null && e.hasOwnProperty("ios")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let o = a.dot.v4.IosMetadata.verify(e.ios);
            if (o)
              return "ios." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.Metadata)
          return e;
        let n = new a.dot.v4.Metadata();
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
          n.web = a.dot.v4.WebMetadata.fromObject(e.web);
        }
        if (e.android != null) {
          if (typeof e.android != "object")
            throw TypeError(".dot.v4.Metadata.android: object expected");
          n.android = a.dot.v4.AndroidMetadata.fromObject(e.android);
        }
        if (e.ios != null) {
          if (typeof e.ios != "object")
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          n.ios = a.dot.v4.IosMetadata.fromObject(e.ios);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.platform = n.enums === String ? "WEB" : 0, o.componentVersion = ""), e.platform != null && e.hasOwnProperty("platform") && (o.platform = n.enums === String ? a.dot.Platform[e.platform] === void 0 ? e.platform : a.dot.Platform[e.platform] : e.platform), e.web != null && e.hasOwnProperty("web") && (o.web = a.dot.v4.WebMetadata.toObject(e.web, n), n.oneofs && (o.metadata = "web")), e.android != null && e.hasOwnProperty("android") && (o.android = a.dot.v4.AndroidMetadata.toObject(e.android, n), n.oneofs && (o.metadata = "android")), e.ios != null && e.hasOwnProperty("ios") && (o.ios = a.dot.v4.IosMetadata.toObject(e.ios, n), n.oneofs && (o.metadata = "ios")), e.sessionToken != null && e.hasOwnProperty("sessionToken") && (o.sessionToken = e.sessionToken, n.oneofs && (o._sessionToken = "sessionToken")), e.componentVersion != null && e.hasOwnProperty("componentVersion") && (o.componentVersion = e.componentVersion), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, r;
    }(), i.AndroidMetadata = function() {
      function r(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.supportedAbis = p.emptyArray, r.prototype.device = null, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = p.emptyArray, r.prototype.digestsWithTimestamp = p.emptyArray, r.prototype.dynamicCameraFrameProperties = p.emptyObject, r.prototype.tamperingIndicators = null, r.prototype.croppedYuv420Image = null;
      let t;
      return Object.defineProperty(r.prototype, "_device", {
        get: p.oneOfGetter(t = ["device"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_camera", {
        get: p.oneOfGetter(t = ["camera"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: p.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_tamperingIndicators", {
        get: p.oneOfGetter(t = ["tamperingIndicators"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedYuv420Image", {
        get: p.oneOfGetter(t = ["croppedYuv420Image"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.supportedAbis != null && e.supportedAbis.length)
          for (let o = 0; o < e.supportedAbis.length; ++o)
            n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(e.supportedAbis[o]);
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.device), e.digests != null && e.digests.length)
          for (let o = 0; o < e.digests.length; ++o)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[o]);
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties"))
          for (let o = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < o.length; ++d)
            n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[d]), a.dot.Int32List.encode(e.dynamicCameraFrameProperties[o[d]], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            a.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && a.dot.v4.AndroidCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && a.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && a.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.AndroidMetadata(), f, y;
        for (; e.pos < o; ) {
          let O = e.uint32();
          switch (O >>> 3) {
            case 1: {
              d.supportedAbis && d.supportedAbis.length || (d.supportedAbis = []), d.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              d.device = e.string();
              break;
            }
            case 6: {
              d.camera = a.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.detectionNormalizedRectangle = a.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.digests && d.digests.length || (d.digests = []), d.digests.push(e.bytes());
              break;
            }
            case 5: {
              d.digestsWithTimestamp && d.digestsWithTimestamp.length || (d.digestsWithTimestamp = []), d.digestsWithTimestamp.push(a.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              d.dynamicCameraFrameProperties === p.emptyObject && (d.dynamicCameraFrameProperties = {});
              let I = e.uint32() + e.pos;
              for (f = "", y = null; e.pos < I; ) {
                let C = e.uint32();
                switch (C >>> 3) {
                  case 1:
                    f = e.string();
                    break;
                  case 2:
                    y = a.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(C & 7);
                    break;
                }
              }
              d.dynamicCameraFrameProperties[f] = y;
              break;
            }
            case 8: {
              d.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              d.croppedYuv420Image = a.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(O & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let n = 0; n < e.supportedAbis.length; ++n)
            if (!p.isString(e.supportedAbis[n]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !p.isString(e.device))
          return "device: string expected";
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = a.dot.v4.AndroidCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = a.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || p.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let o = a.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.dynamicCameraFrameProperties != null && e.hasOwnProperty("dynamicCameraFrameProperties")) {
          if (!p.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let n = Object.keys(e.dynamicCameraFrameProperties);
          for (let o = 0; o < n.length; ++o) {
            let d = a.dot.Int32List.verify(e.dynamicCameraFrameProperties[n[o]]);
            if (d)
              return "dynamicCameraFrameProperties." + d;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || p.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let n = a.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (n)
            return "croppedYuv420Image." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.AndroidMetadata)
          return e;
        let n = new a.dot.v4.AndroidMetadata();
        if (e.supportedAbis) {
          if (!Array.isArray(e.supportedAbis))
            throw TypeError(".dot.v4.AndroidMetadata.supportedAbis: array expected");
          n.supportedAbis = [];
          for (let o = 0; o < e.supportedAbis.length; ++o)
            n.supportedAbis[o] = String(e.supportedAbis[o]);
        }
        if (e.device != null && (n.device = String(e.device)), e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.AndroidMetadata.camera: object expected");
          n.camera = a.dot.v4.AndroidCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = a.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          n.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? p.base64.decode(e.digests[o], n.digests[o] = p.newBuffer(p.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (n.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[o] = a.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (typeof e.dynamicCameraFrameProperties != "object")
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          n.dynamicCameraFrameProperties = {};
          for (let o = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < o.length; ++d) {
            if (typeof e.dynamicCameraFrameProperties[o[d]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            n.dynamicCameraFrameProperties[o[d]] = a.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[o[d]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? p.base64.decode(e.tamperingIndicators, n.tamperingIndicators = p.newBuffer(p.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (n.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          n.croppedYuv420Image = a.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.supportedAbis = [], o.digests = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          o.supportedAbis = [];
          for (let f = 0; f < e.supportedAbis.length; ++f)
            o.supportedAbis[f] = e.supportedAbis[f];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, n.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let f = 0; f < e.digests.length; ++f)
            o.digests[f] = n.bytes === String ? p.base64.encode(e.digests[f], 0, e.digests[f].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[f]) : e.digests[f];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let f = 0; f < d.length; ++f)
            o.dynamicCameraFrameProperties[d[f]] = a.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[f]], n);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let f = 0; f < e.digestsWithTimestamp.length; ++f)
            o.digestsWithTimestamp[f] = a.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[f], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = a.dot.v4.AndroidCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = a.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = n.bytes === String ? p.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : n.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, n.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = a.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, r;
    }(), i.AndroidCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && a.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.AndroidCamera();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.resolution = a.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = a.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !p.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.AndroidCamera)
          return t;
        let e = new a.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          e.resolution = a.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = a.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, r;
    }(), i.Yuv420Image = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = p.newBuffer([]), r.prototype.uPlane = p.newBuffer([]), r.prototype.vPlane = p.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && a.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.Yuv420Image();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.size = a.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.yPlane = t.bytes();
              break;
            }
            case 3: {
              o.uPlane = t.bytes();
              break;
            }
            case 4: {
              o.vPlane = t.bytes();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = a.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || p.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || p.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || p.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.Yuv420Image)
          return t;
        let e = new a.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = a.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? p.base64.decode(t.yPlane, e.yPlane = p.newBuffer(p.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? p.base64.decode(t.uPlane, e.uPlane = p.newBuffer(p.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? p.base64.decode(t.vPlane, e.vPlane = p.newBuffer(p.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.size = null, e.bytes === String ? n.yPlane = "" : (n.yPlane = [], e.bytes !== Array && (n.yPlane = p.newBuffer(n.yPlane))), e.bytes === String ? n.uPlane = "" : (n.uPlane = [], e.bytes !== Array && (n.uPlane = p.newBuffer(n.uPlane))), e.bytes === String ? n.vPlane = "" : (n.vPlane = [], e.bytes !== Array && (n.vPlane = p.newBuffer(n.vPlane)))), t.size != null && t.hasOwnProperty("size") && (n.size = a.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (n.yPlane = e.bytes === String ? p.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (n.uPlane = e.bytes === String ? p.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (n.vPlane = e.bytes === String ? p.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, r;
    }(), i.IosMetadata = function() {
      function r(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraModelId = "", r.prototype.architectureInfo = p.emptyObject, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = p.emptyArray, r.prototype.digestsWithTimestamp = p.emptyArray, r.prototype.isoValues = p.emptyArray;
      let t;
      return Object.defineProperty(r.prototype, "_camera", {
        get: p.oneOfGetter(t = ["camera"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: p.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let o = Object.keys(e.architectureInfo), d = 0; d < o.length; ++d)
            n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[d]).uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(e.architectureInfo[o[d]]).ldelim();
        if (e.digests != null && e.digests.length)
          for (let o = 0; o < e.digests.length; ++o)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[o]);
        if (e.isoValues != null && e.isoValues.length) {
          n.uint32(
            /* id 4, wireType 2 =*/
            34
          ).fork();
          for (let o = 0; o < e.isoValues.length; ++o)
            n.int32(e.isoValues[o]);
          n.ldelim();
        }
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            a.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && a.dot.v4.IosCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && a.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.IosMetadata(), f, y;
        for (; e.pos < o; ) {
          let O = e.uint32();
          switch (O >>> 3) {
            case 1: {
              d.cameraModelId = e.string();
              break;
            }
            case 2: {
              d.architectureInfo === p.emptyObject && (d.architectureInfo = {});
              let I = e.uint32() + e.pos;
              for (f = "", y = !1; e.pos < I; ) {
                let C = e.uint32();
                switch (C >>> 3) {
                  case 1:
                    f = e.string();
                    break;
                  case 2:
                    y = e.bool();
                    break;
                  default:
                    e.skipType(C & 7);
                    break;
                }
              }
              d.architectureInfo[f] = y;
              break;
            }
            case 6: {
              d.camera = a.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.detectionNormalizedRectangle = a.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.digests && d.digests.length || (d.digests = []), d.digests.push(e.bytes());
              break;
            }
            case 5: {
              d.digestsWithTimestamp && d.digestsWithTimestamp.length || (d.digestsWithTimestamp = []), d.digestsWithTimestamp.push(a.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (d.isoValues && d.isoValues.length || (d.isoValues = []), (O & 7) === 2) {
                let I = e.uint32() + e.pos;
                for (; e.pos < I; )
                  d.isoValues.push(e.int32());
              } else
                d.isoValues.push(e.int32());
              break;
            }
            default:
              e.skipType(O & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !p.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!p.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let n = Object.keys(e.architectureInfo);
          for (let o = 0; o < n.length; ++o)
            if (typeof e.architectureInfo[n[o]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = a.dot.v4.IosCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = a.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || p.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let o = a.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.isoValues != null && e.hasOwnProperty("isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let n = 0; n < e.isoValues.length; ++n)
            if (!p.isInteger(e.isoValues[n]))
              return "isoValues: integer[] expected";
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.IosMetadata)
          return e;
        let n = new a.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (n.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (typeof e.architectureInfo != "object")
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          n.architectureInfo = {};
          for (let o = Object.keys(e.architectureInfo), d = 0; d < o.length; ++d)
            n.architectureInfo[o[d]] = !!e.architectureInfo[o[d]];
        }
        if (e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          n.camera = a.dot.v4.IosCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = a.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          n.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? p.base64.decode(e.digests[o], n.digests[o] = p.newBuffer(p.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (n.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[o] = a.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.isoValues) {
          if (!Array.isArray(e.isoValues))
            throw TypeError(".dot.v4.IosMetadata.isoValues: array expected");
          n.isoValues = [];
          for (let o = 0; o < e.isoValues.length; ++o)
            n.isoValues[o] = e.isoValues[o] | 0;
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        (n.arrays || n.defaults) && (o.digests = [], o.isoValues = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.architectureInfo = {}), n.defaults && (o.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (o.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          o.architectureInfo = {};
          for (let f = 0; f < d.length; ++f)
            o.architectureInfo[d[f]] = e.architectureInfo[d[f]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let f = 0; f < e.digests.length; ++f)
            o.digests[f] = n.bytes === String ? p.base64.encode(e.digests[f], 0, e.digests[f].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[f]) : e.digests[f];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let f = 0; f < e.isoValues.length; ++f)
            o.isoValues[f] = e.isoValues[f];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let f = 0; f < e.digestsWithTimestamp.length; ++f)
            o.digestsWithTimestamp[f] = a.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[f], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = a.dot.v4.IosCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = a.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, r;
    }(), i.IosCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && a.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.IosCamera();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.resolution = a.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = a.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !p.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.IosCamera)
          return t;
        let e = new a.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          e.resolution = a.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = a.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, r;
    }(), i.WebMetadata = function() {
      function r(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.currentCameraProperties = null, r.prototype.availableCameraProperties = p.emptyArray, r.prototype.hashedDetectedImages = p.emptyArray, r.prototype.hashedDetectedImagesWithTimestamp = p.emptyArray, r.prototype.detectionRecord = p.emptyArray, r.prototype.croppedImage = null;
      let t;
      return Object.defineProperty(r.prototype, "_croppedImage", {
        get: p.oneOfGetter(t = ["croppedImage"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && a.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let o = 0; o < e.availableCameraProperties.length; ++o)
            a.dot.v4.CameraProperties.encode(e.availableCameraProperties[o], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
        if (e.hashedDetectedImages != null && e.hashedDetectedImages.length)
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(e.hashedDetectedImages[o]);
        if (e.detectionRecord != null && e.detectionRecord.length)
          for (let o = 0; o < e.detectionRecord.length; ++o)
            a.dot.v4.DetectedObject.encode(e.detectionRecord[o], n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o)
            a.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && a.dot.Image.encode(e.croppedImage, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.WebMetadata();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
            case 1: {
              d.currentCameraProperties = a.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.availableCameraProperties && d.availableCameraProperties.length || (d.availableCameraProperties = []), d.availableCameraProperties.push(a.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              d.hashedDetectedImages && d.hashedDetectedImages.length || (d.hashedDetectedImages = []), d.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              d.hashedDetectedImagesWithTimestamp && d.hashedDetectedImagesWithTimestamp.length || (d.hashedDetectedImagesWithTimestamp = []), d.hashedDetectedImagesWithTimestamp.push(a.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              d.detectionRecord && d.detectionRecord.length || (d.detectionRecord = []), d.detectionRecord.push(a.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              d.croppedImage = a.dot.Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties")) {
          let n = a.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties);
          if (n)
            return "currentCameraProperties." + n;
        }
        if (e.availableCameraProperties != null && e.hasOwnProperty("availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let n = 0; n < e.availableCameraProperties.length; ++n) {
            let o = a.dot.v4.CameraProperties.verify(e.availableCameraProperties[n]);
            if (o)
              return "availableCameraProperties." + o;
          }
        }
        if (e.hashedDetectedImages != null && e.hasOwnProperty("hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let n = 0; n < e.hashedDetectedImages.length; ++n)
            if (!p.isString(e.hashedDetectedImages[n]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && e.hasOwnProperty("hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let n = 0; n < e.hashedDetectedImagesWithTimestamp.length; ++n) {
            let o = a.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[n]);
            if (o)
              return "hashedDetectedImagesWithTimestamp." + o;
          }
        }
        if (e.detectionRecord != null && e.hasOwnProperty("detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let n = 0; n < e.detectionRecord.length; ++n) {
            let o = a.dot.v4.DetectedObject.verify(e.detectionRecord[n]);
            if (o)
              return "detectionRecord." + o;
          }
        }
        if (e.croppedImage != null && e.hasOwnProperty("croppedImage")) {
          let n = a.dot.Image.verify(e.croppedImage);
          if (n)
            return "croppedImage." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.WebMetadata)
          return e;
        let n = new a.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (typeof e.currentCameraProperties != "object")
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          n.currentCameraProperties = a.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          n.availableCameraProperties = [];
          for (let o = 0; o < e.availableCameraProperties.length; ++o) {
            if (typeof e.availableCameraProperties[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            n.availableCameraProperties[o] = a.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[o]);
          }
        }
        if (e.hashedDetectedImages) {
          if (!Array.isArray(e.hashedDetectedImages))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImages: array expected");
          n.hashedDetectedImages = [];
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            n.hashedDetectedImages[o] = String(e.hashedDetectedImages[o]);
        }
        if (e.hashedDetectedImagesWithTimestamp) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: array expected");
          n.hashedDetectedImagesWithTimestamp = [];
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o) {
            if (typeof e.hashedDetectedImagesWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: object expected");
            n.hashedDetectedImagesWithTimestamp[o] = a.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[o]);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          n.detectionRecord = [];
          for (let o = 0; o < e.detectionRecord.length; ++o) {
            if (typeof e.detectionRecord[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            n.detectionRecord[o] = a.dot.v4.DetectedObject.fromObject(e.detectionRecord[o]);
          }
        }
        if (e.croppedImage != null) {
          if (typeof e.croppedImage != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          n.croppedImage = a.dot.Image.fromObject(e.croppedImage);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.availableCameraProperties = [], o.hashedDetectedImages = [], o.detectionRecord = [], o.hashedDetectedImagesWithTimestamp = []), n.defaults && (o.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (o.currentCameraProperties = a.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, n)), e.availableCameraProperties && e.availableCameraProperties.length) {
          o.availableCameraProperties = [];
          for (let d = 0; d < e.availableCameraProperties.length; ++d)
            o.availableCameraProperties[d] = a.dot.v4.CameraProperties.toObject(e.availableCameraProperties[d], n);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          o.hashedDetectedImages = [];
          for (let d = 0; d < e.hashedDetectedImages.length; ++d)
            o.hashedDetectedImages[d] = e.hashedDetectedImages[d];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          o.detectionRecord = [];
          for (let d = 0; d < e.detectionRecord.length; ++d)
            o.detectionRecord[d] = a.dot.v4.DetectedObject.toObject(e.detectionRecord[d], n);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          o.hashedDetectedImagesWithTimestamp = [];
          for (let d = 0; d < e.hashedDetectedImagesWithTimestamp.length; ++d)
            o.hashedDetectedImagesWithTimestamp[d] = a.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[d], n);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (o.croppedImage = a.dot.Image.toObject(e.croppedImage, n), n.oneofs && (o._croppedImage = "croppedImage")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, r;
    }(), i.HashedDetectedImageWithTimestamp = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.imageHash = "", r.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.imageHash = t.string();
              break;
            }
            case 2: {
              o.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !p.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !p.isInteger(t.timestampMillis) && !(t.timestampMillis && p.isInteger(t.timestampMillis.low) && p.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new a.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (p.Long ? (e.timestampMillis = p.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if (e.defaults)
          if (n.imageHash = "", p.Long) {
            let o = new p.Long(0, 0, !0);
            n.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            n.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (n.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? n.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : n.timestampMillis = e.longs === String ? p.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, r;
    }(), i.MediaTrackSettings = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.aspectRatio = null, r.prototype.autoGainControl = null, r.prototype.channelCount = null, r.prototype.deviceId = null, r.prototype.displaySurface = null, r.prototype.echoCancellation = null, r.prototype.facingMode = null, r.prototype.frameRate = null, r.prototype.groupId = null, r.prototype.height = null, r.prototype.noiseSuppression = null, r.prototype.sampleRate = null, r.prototype.sampleSize = null, r.prototype.width = null, r.prototype.deviceName = null;
      let t;
      return Object.defineProperty(r.prototype, "_aspectRatio", {
        get: p.oneOfGetter(t = ["aspectRatio"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_autoGainControl", {
        get: p.oneOfGetter(t = ["autoGainControl"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_channelCount", {
        get: p.oneOfGetter(t = ["channelCount"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceId", {
        get: p.oneOfGetter(t = ["deviceId"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_displaySurface", {
        get: p.oneOfGetter(t = ["displaySurface"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_echoCancellation", {
        get: p.oneOfGetter(t = ["echoCancellation"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_facingMode", {
        get: p.oneOfGetter(t = ["facingMode"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_frameRate", {
        get: p.oneOfGetter(t = ["frameRate"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_groupId", {
        get: p.oneOfGetter(t = ["groupId"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_height", {
        get: p.oneOfGetter(t = ["height"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_noiseSuppression", {
        get: p.oneOfGetter(t = ["noiseSuppression"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleRate", {
        get: p.oneOfGetter(t = ["sampleRate"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleSize", {
        get: p.oneOfGetter(t = ["sampleSize"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_width", {
        get: p.oneOfGetter(t = ["width"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceName", {
        get: p.oneOfGetter(t = ["deviceName"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && n.uint32(
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
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.MediaTrackSettings();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
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
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !p.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !p.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !p.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !p.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !p.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !p.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !p.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !p.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !p.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !p.isString(e.deviceName) ? "deviceName: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.MediaTrackSettings)
          return e;
        let n = new a.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (n.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (n.autoGainControl = !!e.autoGainControl), e.channelCount != null && (n.channelCount = e.channelCount | 0), e.deviceId != null && (n.deviceId = String(e.deviceId)), e.displaySurface != null && (n.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (n.echoCancellation = !!e.echoCancellation), e.facingMode != null && (n.facingMode = String(e.facingMode)), e.frameRate != null && (n.frameRate = Number(e.frameRate)), e.groupId != null && (n.groupId = String(e.groupId)), e.height != null && (n.height = e.height | 0), e.noiseSuppression != null && (n.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (n.sampleRate = e.sampleRate | 0), e.sampleSize != null && (n.sampleSize = e.sampleSize | 0), e.width != null && (n.width = e.width | 0), e.deviceName != null && (n.deviceName = String(e.deviceName)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && (o.aspectRatio = n.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, n.oneofs && (o._aspectRatio = "aspectRatio")), e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && (o.autoGainControl = e.autoGainControl, n.oneofs && (o._autoGainControl = "autoGainControl")), e.channelCount != null && e.hasOwnProperty("channelCount") && (o.channelCount = e.channelCount, n.oneofs && (o._channelCount = "channelCount")), e.deviceId != null && e.hasOwnProperty("deviceId") && (o.deviceId = e.deviceId, n.oneofs && (o._deviceId = "deviceId")), e.displaySurface != null && e.hasOwnProperty("displaySurface") && (o.displaySurface = e.displaySurface, n.oneofs && (o._displaySurface = "displaySurface")), e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && (o.echoCancellation = e.echoCancellation, n.oneofs && (o._echoCancellation = "echoCancellation")), e.facingMode != null && e.hasOwnProperty("facingMode") && (o.facingMode = e.facingMode, n.oneofs && (o._facingMode = "facingMode")), e.frameRate != null && e.hasOwnProperty("frameRate") && (o.frameRate = n.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, n.oneofs && (o._frameRate = "frameRate")), e.groupId != null && e.hasOwnProperty("groupId") && (o.groupId = e.groupId, n.oneofs && (o._groupId = "groupId")), e.height != null && e.hasOwnProperty("height") && (o.height = e.height, n.oneofs && (o._height = "height")), e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && (o.noiseSuppression = e.noiseSuppression, n.oneofs && (o._noiseSuppression = "noiseSuppression")), e.sampleRate != null && e.hasOwnProperty("sampleRate") && (o.sampleRate = e.sampleRate, n.oneofs && (o._sampleRate = "sampleRate")), e.sampleSize != null && e.hasOwnProperty("sampleSize") && (o.sampleSize = e.sampleSize, n.oneofs && (o._sampleSize = "sampleSize")), e.width != null && e.hasOwnProperty("width") && (o.width = e.width, n.oneofs && (o._width = "width")), e.deviceName != null && e.hasOwnProperty("deviceName") && (o.deviceName = e.deviceName, n.oneofs && (o._deviceName = "deviceName")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, r;
    }(), i.ImageBitmap = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.width = 0, r.prototype.height = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.ImageBitmap();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.width = t.int32();
              break;
            }
            case 2: {
              o.height = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !p.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !p.isInteger(t.height) ? "height: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.ImageBitmap)
          return t;
        let e = new a.dot.v4.ImageBitmap();
        return t.width != null && (e.width = t.width | 0), t.height != null && (e.height = t.height | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.width = 0, n.height = 0), t.width != null && t.hasOwnProperty("width") && (n.width = t.width), t.height != null && t.hasOwnProperty("height") && (n.height = t.height), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, r;
    }(), i.CameraProperties = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraInitFrameResolution = null, r.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(r.prototype, "_cameraInitFrameResolution", {
        get: p.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && a.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && a.dot.v4.MediaTrackSettings.encode(e.cameraProperties, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.CameraProperties();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
            case 1: {
              d.cameraInitFrameResolution = a.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.cameraProperties = a.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution")) {
          let n = a.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution);
          if (n)
            return "cameraInitFrameResolution." + n;
        }
        if (e.cameraProperties != null && e.hasOwnProperty("cameraProperties")) {
          let n = a.dot.v4.MediaTrackSettings.verify(e.cameraProperties);
          if (n)
            return "cameraProperties." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.CameraProperties)
          return e;
        let n = new a.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (typeof e.cameraInitFrameResolution != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          n.cameraInitFrameResolution = a.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution);
        }
        if (e.cameraProperties != null) {
          if (typeof e.cameraProperties != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          n.cameraProperties = a.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.cameraProperties = null), e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution") && (o.cameraInitFrameResolution = a.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, n), n.oneofs && (o._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && e.hasOwnProperty("cameraProperties") && (o.cameraProperties = a.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, n)), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, r;
    }(), i.DetectedObject = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.brightness = 0, r.prototype.sharpness = 0, r.prototype.hotspots = 0, r.prototype.confidence = 0, r.prototype.faceSize = 0, r.prototype.faceCenter = null, r.prototype.smallestEdge = 0, r.prototype.bottomLeft = null, r.prototype.bottomRight = null, r.prototype.topLeft = null, r.prototype.topRight = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
        ).float(t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && a.dot.v4.Point.encode(t.faceCenter, e.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && e.uint32(
          /* id 7, wireType 5 =*/
          61
        ).float(t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && a.dot.v4.Point.encode(t.bottomLeft, e.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && a.dot.v4.Point.encode(t.bottomRight, e.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && a.dot.v4.Point.encode(t.topLeft, e.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && a.dot.v4.Point.encode(t.topRight, e.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.DetectedObject();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.brightness = t.float();
              break;
            }
            case 2: {
              o.sharpness = t.float();
              break;
            }
            case 3: {
              o.hotspots = t.float();
              break;
            }
            case 4: {
              o.confidence = t.float();
              break;
            }
            case 5: {
              o.faceSize = t.float();
              break;
            }
            case 6: {
              o.faceCenter = a.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 7: {
              o.smallestEdge = t.float();
              break;
            }
            case 8: {
              o.bottomLeft = a.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 9: {
              o.bottomRight = a.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 10: {
              o.topLeft = a.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 11: {
              o.topRight = a.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
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
          let e = a.dot.v4.Point.verify(t.faceCenter);
          if (e)
            return "faceCenter." + e;
        }
        if (t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && typeof t.smallestEdge != "number")
          return "smallestEdge: number expected";
        if (t.bottomLeft != null && t.hasOwnProperty("bottomLeft")) {
          let e = a.dot.v4.Point.verify(t.bottomLeft);
          if (e)
            return "bottomLeft." + e;
        }
        if (t.bottomRight != null && t.hasOwnProperty("bottomRight")) {
          let e = a.dot.v4.Point.verify(t.bottomRight);
          if (e)
            return "bottomRight." + e;
        }
        if (t.topLeft != null && t.hasOwnProperty("topLeft")) {
          let e = a.dot.v4.Point.verify(t.topLeft);
          if (e)
            return "topLeft." + e;
        }
        if (t.topRight != null && t.hasOwnProperty("topRight")) {
          let e = a.dot.v4.Point.verify(t.topRight);
          if (e)
            return "topRight." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.DetectedObject)
          return t;
        let e = new a.dot.v4.DetectedObject();
        if (t.brightness != null && (e.brightness = Number(t.brightness)), t.sharpness != null && (e.sharpness = Number(t.sharpness)), t.hotspots != null && (e.hotspots = Number(t.hotspots)), t.confidence != null && (e.confidence = Number(t.confidence)), t.faceSize != null && (e.faceSize = Number(t.faceSize)), t.faceCenter != null) {
          if (typeof t.faceCenter != "object")
            throw TypeError(".dot.v4.DetectedObject.faceCenter: object expected");
          e.faceCenter = a.dot.v4.Point.fromObject(t.faceCenter);
        }
        if (t.smallestEdge != null && (e.smallestEdge = Number(t.smallestEdge)), t.bottomLeft != null) {
          if (typeof t.bottomLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomLeft: object expected");
          e.bottomLeft = a.dot.v4.Point.fromObject(t.bottomLeft);
        }
        if (t.bottomRight != null) {
          if (typeof t.bottomRight != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomRight: object expected");
          e.bottomRight = a.dot.v4.Point.fromObject(t.bottomRight);
        }
        if (t.topLeft != null) {
          if (typeof t.topLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.topLeft: object expected");
          e.topLeft = a.dot.v4.Point.fromObject(t.topLeft);
        }
        if (t.topRight != null) {
          if (typeof t.topRight != "object")
            throw TypeError(".dot.v4.DetectedObject.topRight: object expected");
          e.topRight = a.dot.v4.Point.fromObject(t.topRight);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.brightness = 0, n.sharpness = 0, n.hotspots = 0, n.confidence = 0, n.faceSize = 0, n.faceCenter = null, n.smallestEdge = 0, n.bottomLeft = null, n.bottomRight = null, n.topLeft = null, n.topRight = null), t.brightness != null && t.hasOwnProperty("brightness") && (n.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && t.hasOwnProperty("sharpness") && (n.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && t.hasOwnProperty("hotspots") && (n.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && t.hasOwnProperty("confidence") && (n.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && t.hasOwnProperty("faceSize") && (n.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && t.hasOwnProperty("faceCenter") && (n.faceCenter = a.dot.v4.Point.toObject(t.faceCenter, e)), t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && (n.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && t.hasOwnProperty("bottomLeft") && (n.bottomLeft = a.dot.v4.Point.toObject(t.bottomLeft, e)), t.bottomRight != null && t.hasOwnProperty("bottomRight") && (n.bottomRight = a.dot.v4.Point.toObject(t.bottomRight, e)), t.topLeft != null && t.hasOwnProperty("topLeft") && (n.topLeft = a.dot.v4.Point.toObject(t.topLeft, e)), t.topRight != null && t.hasOwnProperty("topRight") && (n.topRight = a.dot.v4.Point.toObject(t.topRight, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, r;
    }(), i.Point = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.x = 0, r.prototype.y = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.Point();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.x = t.float();
              break;
            }
            case 2: {
              o.y = t.float();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.x != null && t.hasOwnProperty("x") && typeof t.x != "number" ? "x: number expected" : t.y != null && t.hasOwnProperty("y") && typeof t.y != "number" ? "y: number expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.Point)
          return t;
        let e = new a.dot.v4.Point();
        return t.x != null && (e.x = Number(t.x)), t.y != null && (e.y = Number(t.y)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.x = 0, n.y = 0), t.x != null && t.hasOwnProperty("x") && (n.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && t.hasOwnProperty("y") && (n.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, r;
    }(), i.FaceContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && a.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && a.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.FaceContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.image = a.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.metadata = a.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = a.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = a.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.FaceContent)
          return t;
        let e = new a.dot.v4.FaceContent();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          e.image = a.dot.Image.fromObject(t.image);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          e.metadata = a.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.metadata = null), t.image != null && t.hasOwnProperty("image") && (n.image = a.dot.Image.toObject(t.image, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = a.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceContent";
      }, r;
    }(), i.DocumentContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && a.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && a.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.DocumentContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.image = a.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.metadata = a.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = a.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = a.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.DocumentContent)
          return t;
        let e = new a.dot.v4.DocumentContent();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          e.image = a.dot.Image.fromObject(t.image);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          e.metadata = a.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.metadata = null), t.image != null && t.hasOwnProperty("image") && (n.image = a.dot.Image.toObject(t.image, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = a.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DocumentContent";
      }, r;
    }(), i.Blob = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.documentContent = null, r.prototype.eyeGazeLivenessContent = null, r.prototype.faceContent = null, r.prototype.magnifeyeLivenessContent = null, r.prototype.smileLivenessContent = null, r.prototype.palmContent = null, r.prototype.travelDocumentContent = null;
      let t;
      return Object.defineProperty(r.prototype, "blob", {
        get: p.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && a.dot.v4.DocumentContent.encode(e.documentContent, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && a.dot.v4.FaceContent.encode(e.faceContent, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && a.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && a.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && a.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && a.dot.v4.PalmContent.encode(e.palmContent, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && a.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.Blob();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
            case 1: {
              d.documentContent = a.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              d.eyeGazeLivenessContent = a.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.faceContent = a.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.magnifeyeLivenessContent = a.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              d.smileLivenessContent = a.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              d.palmContent = a.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.travelDocumentContent = a.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let n = {};
        if (e.documentContent != null && e.hasOwnProperty("documentContent")) {
          n.blob = 1;
          {
            let o = a.dot.v4.DocumentContent.verify(e.documentContent);
            if (o)
              return "documentContent." + o;
          }
        }
        if (e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = a.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent);
            if (o)
              return "eyeGazeLivenessContent." + o;
          }
        }
        if (e.faceContent != null && e.hasOwnProperty("faceContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = a.dot.v4.FaceContent.verify(e.faceContent);
            if (o)
              return "faceContent." + o;
          }
        }
        if (e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = a.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent);
            if (o)
              return "magnifeyeLivenessContent." + o;
          }
        }
        if (e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = a.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent);
            if (o)
              return "smileLivenessContent." + o;
          }
        }
        if (e.palmContent != null && e.hasOwnProperty("palmContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = a.dot.v4.PalmContent.verify(e.palmContent);
            if (o)
              return "palmContent." + o;
          }
        }
        if (e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = a.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent);
            if (o)
              return "travelDocumentContent." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.Blob)
          return e;
        let n = new a.dot.v4.Blob();
        if (e.documentContent != null) {
          if (typeof e.documentContent != "object")
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          n.documentContent = a.dot.v4.DocumentContent.fromObject(e.documentContent);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (typeof e.eyeGazeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          n.eyeGazeLivenessContent = a.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent);
        }
        if (e.faceContent != null) {
          if (typeof e.faceContent != "object")
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          n.faceContent = a.dot.v4.FaceContent.fromObject(e.faceContent);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (typeof e.magnifeyeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          n.magnifeyeLivenessContent = a.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent);
        }
        if (e.smileLivenessContent != null) {
          if (typeof e.smileLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          n.smileLivenessContent = a.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent);
        }
        if (e.palmContent != null) {
          if (typeof e.palmContent != "object")
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          n.palmContent = a.dot.v4.PalmContent.fromObject(e.palmContent);
        }
        if (e.travelDocumentContent != null) {
          if (typeof e.travelDocumentContent != "object")
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          n.travelDocumentContent = a.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return e.documentContent != null && e.hasOwnProperty("documentContent") && (o.documentContent = a.dot.v4.DocumentContent.toObject(e.documentContent, n), n.oneofs && (o.blob = "documentContent")), e.faceContent != null && e.hasOwnProperty("faceContent") && (o.faceContent = a.dot.v4.FaceContent.toObject(e.faceContent, n), n.oneofs && (o.blob = "faceContent")), e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent") && (o.magnifeyeLivenessContent = a.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, n), n.oneofs && (o.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent") && (o.smileLivenessContent = a.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, n), n.oneofs && (o.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent") && (o.eyeGazeLivenessContent = a.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, n), n.oneofs && (o.blob = "eyeGazeLivenessContent")), e.palmContent != null && e.hasOwnProperty("palmContent") && (o.palmContent = a.dot.v4.PalmContent.toObject(e.palmContent, n), n.oneofs && (o.blob = "palmContent")), e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent") && (o.travelDocumentContent = a.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, n), n.oneofs && (o.blob = "travelDocumentContent")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, r;
    }(), i.TravelDocumentContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.ldsMasterFile = null, r.prototype.accessControlProtocolUsed = 0, r.prototype.authenticationStatus = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && a.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && a.dot.v4.AuthenticationStatus.encode(t.authenticationStatus, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && a.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.TravelDocumentContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.ldsMasterFile = a.dot.v4.LdsMasterFile.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              o.authenticationStatus = a.dot.v4.AuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 4: {
              o.metadata = a.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile")) {
          let e = a.dot.v4.LdsMasterFile.verify(t.ldsMasterFile);
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
          let e = a.dot.v4.AuthenticationStatus.verify(t.authenticationStatus);
          if (e)
            return "authenticationStatus." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = a.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.TravelDocumentContent)
          return t;
        let e = new a.dot.v4.TravelDocumentContent();
        if (t.ldsMasterFile != null) {
          if (typeof t.ldsMasterFile != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.ldsMasterFile: object expected");
          e.ldsMasterFile = a.dot.v4.LdsMasterFile.fromObject(t.ldsMasterFile);
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
          e.authenticationStatus = a.dot.v4.AuthenticationStatus.fromObject(t.authenticationStatus);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.metadata: object expected");
          e.metadata = a.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.ldsMasterFile = null, n.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, n.authenticationStatus = null, n.metadata = null), t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile") && (n.ldsMasterFile = a.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e)), t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed") && (n.accessControlProtocolUsed = e.enums === String ? a.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : a.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus") && (n.authenticationStatus = a.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = a.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, r;
    }(), i.LdsMasterFile = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.lds1eMrtdApplication = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && a.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.LdsMasterFile();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.lds1eMrtdApplication = a.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication")) {
          let e = a.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication);
          if (e)
            return "lds1eMrtdApplication." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.LdsMasterFile)
          return t;
        let e = new a.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (typeof t.lds1eMrtdApplication != "object")
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          e.lds1eMrtdApplication = a.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication") && (n.lds1eMrtdApplication = a.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, r;
    }(), i.Lds1eMrtdApplication = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.comHeaderAndDataGroupPresenceInformation = null, r.prototype.sodDocumentSecurityObject = null, r.prototype.dg1MachineReadableZoneInformation = null, r.prototype.dg2EncodedIdentificationFeaturesFace = null, r.prototype.dg3AdditionalIdentificationFeatureFingers = null, r.prototype.dg4AdditionalIdentificationFeatureIrises = null, r.prototype.dg5DisplayedPortrait = null, r.prototype.dg7DisplayedSignatureOrUsualMark = null, r.prototype.dg8DataFeatures = null, r.prototype.dg9StructureFeatures = null, r.prototype.dg10SubstanceFeatures = null, r.prototype.dg11AdditionalPersonalDetails = null, r.prototype.dg12AdditionalDocumentDetails = null, r.prototype.dg13OptionalDetails = null, r.prototype.dg14SecurityOptions = null, r.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, r.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(r.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: p.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: p.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg5DisplayedPortrait", {
        get: p.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: p.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg8DataFeatures", {
        get: p.oneOfGetter(t = ["dg8DataFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg9StructureFeatures", {
        get: p.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg10SubstanceFeatures", {
        get: p.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg11AdditionalPersonalDetails", {
        get: p.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg12AdditionalDocumentDetails", {
        get: p.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg13OptionalDetails", {
        get: p.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg14SecurityOptions", {
        get: p.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: p.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg16PersonsToNotify", {
        get: p.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && a.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && a.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && a.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && a.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && a.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && a.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && a.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && a.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && a.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && a.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && a.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, n.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && a.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, n.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork()).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && a.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, n.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork()).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && a.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, n.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork()).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && a.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, n.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork()).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && a.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, n.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork()).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && a.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, n.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
            case 1: {
              d.comHeaderAndDataGroupPresenceInformation = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              d.sodDocumentSecurityObject = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              d.dg1MachineReadableZoneInformation = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              d.dg2EncodedIdentificationFeaturesFace = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              d.dg3AdditionalIdentificationFeatureFingers = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              d.dg4AdditionalIdentificationFeatureIrises = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              d.dg5DisplayedPortrait = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              d.dg7DisplayedSignatureOrUsualMark = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              d.dg8DataFeatures = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              d.dg9StructureFeatures = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              d.dg10SubstanceFeatures = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              d.dg11AdditionalPersonalDetails = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              d.dg12AdditionalDocumentDetails = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              d.dg13OptionalDetails = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              d.dg14SecurityOptions = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              d.dg15ActiveAuthenticationPublicKeyInfo = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              d.dg16PersonsToNotify = a.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation);
          if (n)
            return "comHeaderAndDataGroupPresenceInformation." + n;
        }
        if (e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject);
          if (n)
            return "sodDocumentSecurityObject." + n;
        }
        if (e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation);
          if (n)
            return "dg1MachineReadableZoneInformation." + n;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace);
          if (n)
            return "dg2EncodedIdentificationFeaturesFace." + n;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers);
          if (n)
            return "dg3AdditionalIdentificationFeatureFingers." + n;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises);
          if (n)
            return "dg4AdditionalIdentificationFeatureIrises." + n;
        }
        if (e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait);
          if (n)
            return "dg5DisplayedPortrait." + n;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark);
          if (n)
            return "dg7DisplayedSignatureOrUsualMark." + n;
        }
        if (e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures);
          if (n)
            return "dg8DataFeatures." + n;
        }
        if (e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures);
          if (n)
            return "dg9StructureFeatures." + n;
        }
        if (e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures);
          if (n)
            return "dg10SubstanceFeatures." + n;
        }
        if (e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails);
          if (n)
            return "dg11AdditionalPersonalDetails." + n;
        }
        if (e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails);
          if (n)
            return "dg12AdditionalDocumentDetails." + n;
        }
        if (e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails);
          if (n)
            return "dg13OptionalDetails." + n;
        }
        if (e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions);
          if (n)
            return "dg14SecurityOptions." + n;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo);
          if (n)
            return "dg15ActiveAuthenticationPublicKeyInfo." + n;
        }
        if (e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify")) {
          let n = a.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify);
          if (n)
            return "dg16PersonsToNotify." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.Lds1eMrtdApplication)
          return e;
        let n = new a.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (typeof e.comHeaderAndDataGroupPresenceInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          n.comHeaderAndDataGroupPresenceInformation = a.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (typeof e.sodDocumentSecurityObject != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          n.sodDocumentSecurityObject = a.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (typeof e.dg1MachineReadableZoneInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          n.dg1MachineReadableZoneInformation = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (typeof e.dg2EncodedIdentificationFeaturesFace != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          n.dg2EncodedIdentificationFeaturesFace = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (typeof e.dg3AdditionalIdentificationFeatureFingers != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          n.dg3AdditionalIdentificationFeatureFingers = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (typeof e.dg4AdditionalIdentificationFeatureIrises != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          n.dg4AdditionalIdentificationFeatureIrises = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (typeof e.dg5DisplayedPortrait != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          n.dg5DisplayedPortrait = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (typeof e.dg7DisplayedSignatureOrUsualMark != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          n.dg7DisplayedSignatureOrUsualMark = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark);
        }
        if (e.dg8DataFeatures != null) {
          if (typeof e.dg8DataFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          n.dg8DataFeatures = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures);
        }
        if (e.dg9StructureFeatures != null) {
          if (typeof e.dg9StructureFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          n.dg9StructureFeatures = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (typeof e.dg10SubstanceFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          n.dg10SubstanceFeatures = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (typeof e.dg11AdditionalPersonalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          n.dg11AdditionalPersonalDetails = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (typeof e.dg12AdditionalDocumentDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          n.dg12AdditionalDocumentDetails = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails);
        }
        if (e.dg13OptionalDetails != null) {
          if (typeof e.dg13OptionalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          n.dg13OptionalDetails = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails);
        }
        if (e.dg14SecurityOptions != null) {
          if (typeof e.dg14SecurityOptions != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          n.dg14SecurityOptions = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (typeof e.dg15ActiveAuthenticationPublicKeyInfo != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          n.dg15ActiveAuthenticationPublicKeyInfo = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo);
        }
        if (e.dg16PersonsToNotify != null) {
          if (typeof e.dg16PersonsToNotify != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          n.dg16PersonsToNotify = a.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.comHeaderAndDataGroupPresenceInformation = null, o.sodDocumentSecurityObject = null, o.dg1MachineReadableZoneInformation = null, o.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation") && (o.comHeaderAndDataGroupPresenceInformation = a.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, n)), e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject") && (o.sodDocumentSecurityObject = a.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, n)), e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation") && (o.dg1MachineReadableZoneInformation = a.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, n)), e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace") && (o.dg2EncodedIdentificationFeaturesFace = a.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, n)), e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers") && (o.dg3AdditionalIdentificationFeatureFingers = a.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, n), n.oneofs && (o._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises") && (o.dg4AdditionalIdentificationFeatureIrises = a.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, n), n.oneofs && (o._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait") && (o.dg5DisplayedPortrait = a.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, n), n.oneofs && (o._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark") && (o.dg7DisplayedSignatureOrUsualMark = a.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, n), n.oneofs && (o._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures") && (o.dg8DataFeatures = a.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, n), n.oneofs && (o._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures") && (o.dg9StructureFeatures = a.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, n), n.oneofs && (o._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures") && (o.dg10SubstanceFeatures = a.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, n), n.oneofs && (o._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails") && (o.dg11AdditionalPersonalDetails = a.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, n), n.oneofs && (o._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails") && (o.dg12AdditionalDocumentDetails = a.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, n), n.oneofs && (o._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails") && (o.dg13OptionalDetails = a.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, n), n.oneofs && (o._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions") && (o.dg14SecurityOptions = a.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, n), n.oneofs && (o._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo") && (o.dg15ActiveAuthenticationPublicKeyInfo = a.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, n), n.oneofs && (o._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify") && (o.dg16PersonsToNotify = a.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, n), n.oneofs && (o._dg16PersonsToNotify = "dg16PersonsToNotify")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, r;
    }(), i.Lds1ElementaryFile = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.id = 0, r.prototype.bytes = null;
      let t;
      return Object.defineProperty(r.prototype, "_bytes", {
        get: p.oneOfGetter(t = ["bytes"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.Lds1ElementaryFile();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
            case 1: {
              d.id = e.int32();
              break;
            }
            case 2: {
              d.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
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
        return e.bytes != null && e.hasOwnProperty("bytes") && !(e.bytes && typeof e.bytes.length == "number" || p.isString(e.bytes)) ? "bytes: buffer expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.Lds1ElementaryFile)
          return e;
        let n = new a.dot.v4.Lds1ElementaryFile();
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
        return e.bytes != null && (typeof e.bytes == "string" ? p.base64.decode(e.bytes, n.bytes = p.newBuffer(p.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (n.bytes = e.bytes)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.id = n.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (o.id = n.enums === String ? a.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : a.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (o.bytes = n.bytes === String ? p.base64.encode(e.bytes, 0, e.bytes.length) : n.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, n.oneofs && (o._bytes = "bytes")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, r.Id = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "ID_UNSPECIFIED"] = 0, n[e[1] = "ID_COM"] = 1, n[e[2] = "ID_SOD"] = 2, n[e[3] = "ID_DG1"] = 3, n[e[4] = "ID_DG2"] = 4, n[e[5] = "ID_DG3"] = 5, n[e[6] = "ID_DG4"] = 6, n[e[7] = "ID_DG5"] = 7, n[e[8] = "ID_DG7"] = 8, n[e[9] = "ID_DG8"] = 9, n[e[10] = "ID_DG9"] = 10, n[e[11] = "ID_DG10"] = 11, n[e[12] = "ID_DG11"] = 12, n[e[13] = "ID_DG12"] = 13, n[e[14] = "ID_DG13"] = 14, n[e[15] = "ID_DG14"] = 15, n[e[16] = "ID_DG15"] = 16, n[e[17] = "ID_DG16"] = 17, n;
      }(), r;
    }(), i.AccessControlProtocol = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[r[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[r[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), i.AuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.data = null, r.prototype.chip = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && a.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && a.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.AuthenticationStatus();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.data = a.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.chip = a.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.data != null && t.hasOwnProperty("data")) {
          let e = a.dot.v4.DataAuthenticationStatus.verify(t.data);
          if (e)
            return "data." + e;
        }
        if (t.chip != null && t.hasOwnProperty("chip")) {
          let e = a.dot.v4.ChipAuthenticationStatus.verify(t.chip);
          if (e)
            return "chip." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.AuthenticationStatus)
          return t;
        let e = new a.dot.v4.AuthenticationStatus();
        if (t.data != null) {
          if (typeof t.data != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.data: object expected");
          e.data = a.dot.v4.DataAuthenticationStatus.fromObject(t.data);
        }
        if (t.chip != null) {
          if (typeof t.chip != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.chip: object expected");
          e.chip = a.dot.v4.ChipAuthenticationStatus.fromObject(t.chip);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.data = null, n.chip = null), t.data != null && t.hasOwnProperty("data") && (n.data = a.dot.v4.DataAuthenticationStatus.toObject(t.data, e)), t.chip != null && t.hasOwnProperty("chip") && (n.chip = a.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, r;
    }(), i.DataAuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.status = 0, r.prototype.protocol = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.DataAuthenticationStatus();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.status = t.int32();
              break;
            }
            case 2: {
              o.protocol = t.int32();
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
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
        if (t instanceof a.dot.v4.DataAuthenticationStatus)
          return t;
        let e = new a.dot.v4.DataAuthenticationStatus();
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
        return e.defaults && (n.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, n.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && t.hasOwnProperty("status") && (n.status = e.enums === String ? a.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : a.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && t.hasOwnProperty("protocol") && (n.protocol = e.enums === String ? a.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : a.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, r.Status = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      }(), r.Protocol = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      }(), r;
    }(), i.ChipAuthenticationStatus = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.status = 0, r.prototype.protocol = null, r.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(r.prototype, "_protocol", {
        get: p.oneOfGetter(t = ["protocol"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_activeAuthenticationResponse", {
        get: p.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && n.uint32(
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
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
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
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
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
        return e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || p.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.ChipAuthenticationStatus)
          return e;
        let n = new a.dot.v4.ChipAuthenticationStatus();
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
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? p.base64.decode(e.activeAuthenticationResponse, n.activeAuthenticationResponse = p.newBuffer(p.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (n.activeAuthenticationResponse = e.activeAuthenticationResponse)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.status = n.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (o.status = n.enums === String ? a.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : a.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (o.protocol = n.enums === String ? a.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : a.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, n.oneofs && (o._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (o.activeAuthenticationResponse = n.bytes === String ? p.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : n.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, n.oneofs && (o._activeAuthenticationResponse = "activeAuthenticationResponse")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, r.Status = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "STATUS_UNSPECIFIED"] = 0, n[e[1] = "STATUS_AUTHENTICATED"] = 1, n[e[2] = "STATUS_DENIED"] = 2, n[e[3] = "STATUS_NOT_SUPPORTED"] = 3, n;
      }(), r.Protocol = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, n[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, n[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, n[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, n;
      }(), r;
    }(), i.EyeGazeLivenessContent = function() {
      function r(e) {
        if (this.segments = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.segments = p.emptyArray, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_image", {
        get: p.oneOfGetter(t = ["image"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.segments != null && e.segments.length)
          for (let o = 0; o < e.segments.length; ++o)
            a.dot.v4.EyeGazeLivenessSegment.encode(e.segments[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && a.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && a.dot.Image.encode(e.image, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n) {
        e instanceof h || (e = h.create(e));
        let o = n === void 0 ? e.len : e.pos + n, d = new a.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < o; ) {
          let f = e.uint32();
          switch (f >>> 3) {
            case 3: {
              d.image = a.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              d.segments && d.segments.length || (d.segments = []), d.segments.push(a.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 2: {
              d.metadata = a.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(f & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = a.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.segments != null && e.hasOwnProperty("segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let n = 0; n < e.segments.length; ++n) {
            let o = a.dot.v4.EyeGazeLivenessSegment.verify(e.segments[n]);
            if (o)
              return "segments." + o;
          }
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = a.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof a.dot.v4.EyeGazeLivenessContent)
          return e;
        let n = new a.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          n.image = a.dot.Image.fromObject(e.image);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          n.segments = [];
          for (let o = 0; o < e.segments.length; ++o) {
            if (typeof e.segments[o] != "object")
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            n.segments[o] = a.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[o]);
          }
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          n.metadata = a.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.segments = []), n.defaults && (o.metadata = null), e.segments && e.segments.length) {
          o.segments = [];
          for (let d = 0; d < e.segments.length; ++d)
            o.segments[d] = a.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[d], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = a.dot.v4.Metadata.toObject(e.metadata, n)), e.image != null && e.hasOwnProperty("image") && (o.image = a.dot.Image.toObject(e.image, n), n.oneofs && (o._image = "image")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, r;
    }(), i.EyeGazeLivenessSegment = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.corner = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && a.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.corner = t.int32();
              break;
            }
            case 2: {
              o.image = a.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
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
          let e = a.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.EyeGazeLivenessSegment)
          return t;
        let e = new a.dot.v4.EyeGazeLivenessSegment();
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
          e.image = a.dot.Image.fromObject(t.image);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.corner = e.enums === String ? "TOP_LEFT" : 0, n.image = null), t.corner != null && t.hasOwnProperty("corner") && (n.corner = e.enums === String ? a.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : a.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && t.hasOwnProperty("image") && (n.image = a.dot.Image.toObject(t.image, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, r;
    }(), i.EyeGazeLivenessCorner = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "TOP_LEFT"] = 0, t[r[1] = "TOP_RIGHT"] = 1, t[r[2] = "BOTTOM_RIGHT"] = 2, t[r[3] = "BOTTOM_LEFT"] = 3, t;
    }(), i.SmileLivenessContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.neutralExpressionFaceImage = null, r.prototype.smileExpressionFaceImage = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(t, "neutralExpressionFaceImage") && a.dot.Image.encode(t.neutralExpressionFaceImage, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.smileExpressionFaceImage != null && Object.hasOwnProperty.call(t, "smileExpressionFaceImage") && a.dot.Image.encode(t.smileExpressionFaceImage, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && a.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.SmileLivenessContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.neutralExpressionFaceImage = a.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.smileExpressionFaceImage = a.dot.Image.decode(t, t.uint32());
              break;
            }
            case 3: {
              o.metadata = a.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.neutralExpressionFaceImage != null && t.hasOwnProperty("neutralExpressionFaceImage")) {
          let e = a.dot.Image.verify(t.neutralExpressionFaceImage);
          if (e)
            return "neutralExpressionFaceImage." + e;
        }
        if (t.smileExpressionFaceImage != null && t.hasOwnProperty("smileExpressionFaceImage")) {
          let e = a.dot.Image.verify(t.smileExpressionFaceImage);
          if (e)
            return "smileExpressionFaceImage." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = a.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.SmileLivenessContent)
          return t;
        let e = new a.dot.v4.SmileLivenessContent();
        if (t.neutralExpressionFaceImage != null) {
          if (typeof t.neutralExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          e.neutralExpressionFaceImage = a.dot.Image.fromObject(t.neutralExpressionFaceImage);
        }
        if (t.smileExpressionFaceImage != null) {
          if (typeof t.smileExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          e.smileExpressionFaceImage = a.dot.Image.fromObject(t.smileExpressionFaceImage);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          e.metadata = a.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.neutralExpressionFaceImage = null, n.smileExpressionFaceImage = null, n.metadata = null), t.neutralExpressionFaceImage != null && t.hasOwnProperty("neutralExpressionFaceImage") && (n.neutralExpressionFaceImage = a.dot.Image.toObject(t.neutralExpressionFaceImage, e)), t.smileExpressionFaceImage != null && t.hasOwnProperty("smileExpressionFaceImage") && (n.smileExpressionFaceImage = a.dot.Image.toObject(t.smileExpressionFaceImage, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = a.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.SmileLivenessContent";
      }, r;
    }(), i.PalmContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && a.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && a.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e) {
        t instanceof h || (t = h.create(t));
        let n = e === void 0 ? t.len : t.pos + e, o = new a.dot.v4.PalmContent();
        for (; t.pos < n; ) {
          let d = t.uint32();
          switch (d >>> 3) {
            case 1: {
              o.image = a.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              o.metadata = a.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(d & 7);
              break;
          }
        }
        return o;
      }, r.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = a.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = a.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof a.dot.v4.PalmContent)
          return t;
        let e = new a.dot.v4.PalmContent();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          e.image = a.dot.Image.fromObject(t.image);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          e.metadata = a.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.metadata = null), t.image != null && t.hasOwnProperty("image") && (n.image = a.dot.Image.toObject(t.image, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = a.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, T.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.PalmContent";
      }, r;
    }(), i;
  }(), c.Image = function() {
    function i(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return i.prototype.bytes = p.newBuffer([]), i.create = function(r) {
      return new i(r);
    }, i.encode = function(r, t) {
      return t || (t = E.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, i.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, i.decode = function(r, t) {
      r instanceof h || (r = h.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new a.dot.Image();
      for (; r.pos < e; ) {
        let o = r.uint32();
        switch (o >>> 3) {
          case 1: {
            n.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(o & 7);
            break;
        }
      }
      return n;
    }, i.decodeDelimited = function(r) {
      return r instanceof h || (r = new h(r)), this.decode(r, r.uint32());
    }, i.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, i.fromObject = function(r) {
      if (r instanceof a.dot.Image)
        return r;
      let t = new a.dot.Image();
      return r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, i.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, i.prototype.toJSON = function() {
      return this.constructor.toObject(this, T.util.toJSONOptions);
    }, i.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Image";
    }, i;
  }(), c.ImageSize = function() {
    function i(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return i.prototype.width = 0, i.prototype.height = 0, i.create = function(r) {
      return new i(r);
    }, i.encode = function(r, t) {
      return t || (t = E.create()), r.width != null && Object.hasOwnProperty.call(r, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.width), r.height != null && Object.hasOwnProperty.call(r, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.height), t;
    }, i.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, i.decode = function(r, t) {
      r instanceof h || (r = h.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new a.dot.ImageSize();
      for (; r.pos < e; ) {
        let o = r.uint32();
        switch (o >>> 3) {
          case 1: {
            n.width = r.int32();
            break;
          }
          case 2: {
            n.height = r.int32();
            break;
          }
          default:
            r.skipType(o & 7);
            break;
        }
      }
      return n;
    }, i.decodeDelimited = function(r) {
      return r instanceof h || (r = new h(r)), this.decode(r, r.uint32());
    }, i.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.width != null && r.hasOwnProperty("width") && !p.isInteger(r.width) ? "width: integer expected" : r.height != null && r.hasOwnProperty("height") && !p.isInteger(r.height) ? "height: integer expected" : null;
    }, i.fromObject = function(r) {
      if (r instanceof a.dot.ImageSize)
        return r;
      let t = new a.dot.ImageSize();
      return r.width != null && (t.width = r.width | 0), r.height != null && (t.height = r.height | 0), t;
    }, i.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), r.width != null && r.hasOwnProperty("width") && (e.width = r.width), r.height != null && r.hasOwnProperty("height") && (e.height = r.height), e;
    }, i.prototype.toJSON = function() {
      return this.constructor.toObject(this, T.util.toJSONOptions);
    }, i.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageSize";
    }, i;
  }(), c.Int32List = function() {
    function i(r) {
      if (this.items = [], r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return i.prototype.items = p.emptyArray, i.create = function(r) {
      return new i(r);
    }, i.encode = function(r, t) {
      if (t || (t = E.create()), r.items != null && r.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < r.items.length; ++e)
          t.int32(r.items[e]);
        t.ldelim();
      }
      return t;
    }, i.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, i.decode = function(r, t) {
      r instanceof h || (r = h.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new a.dot.Int32List();
      for (; r.pos < e; ) {
        let o = r.uint32();
        switch (o >>> 3) {
          case 1: {
            if (n.items && n.items.length || (n.items = []), (o & 7) === 2) {
              let d = r.uint32() + r.pos;
              for (; r.pos < d; )
                n.items.push(r.int32());
            } else
              n.items.push(r.int32());
            break;
          }
          default:
            r.skipType(o & 7);
            break;
        }
      }
      return n;
    }, i.decodeDelimited = function(r) {
      return r instanceof h || (r = new h(r)), this.decode(r, r.uint32());
    }, i.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.items != null && r.hasOwnProperty("items")) {
        if (!Array.isArray(r.items))
          return "items: array expected";
        for (let t = 0; t < r.items.length; ++t)
          if (!p.isInteger(r.items[t]))
            return "items: integer[] expected";
      }
      return null;
    }, i.fromObject = function(r) {
      if (r instanceof a.dot.Int32List)
        return r;
      let t = new a.dot.Int32List();
      if (r.items) {
        if (!Array.isArray(r.items))
          throw TypeError(".dot.Int32List.items: array expected");
        t.items = [];
        for (let e = 0; e < r.items.length; ++e)
          t.items[e] = r.items[e] | 0;
      }
      return t;
    }, i.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), r.items && r.items.length) {
        e.items = [];
        for (let n = 0; n < r.items.length; ++n)
          e.items[n] = r.items[n];
      }
      return e;
    }, i.prototype.toJSON = function() {
      return this.constructor.toObject(this, T.util.toJSONOptions);
    }, i.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Int32List";
    }, i;
  }(), c.Platform = function() {
    const i = {}, r = Object.create(i);
    return r[i[0] = "WEB"] = 0, r[i[1] = "ANDROID"] = 1, r[i[2] = "IOS"] = 2, r;
  }(), c.RectangleDouble = function() {
    function i(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return i.prototype.left = 0, i.prototype.top = 0, i.prototype.right = 0, i.prototype.bottom = 0, i.create = function(r) {
      return new i(r);
    }, i.encode = function(r, t) {
      return t || (t = E.create()), r.left != null && Object.hasOwnProperty.call(r, "left") && t.uint32(
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
    }, i.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, i.decode = function(r, t) {
      r instanceof h || (r = h.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new a.dot.RectangleDouble();
      for (; r.pos < e; ) {
        let o = r.uint32();
        switch (o >>> 3) {
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
            r.skipType(o & 7);
            break;
        }
      }
      return n;
    }, i.decodeDelimited = function(r) {
      return r instanceof h || (r = new h(r)), this.decode(r, r.uint32());
    }, i.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.left != null && r.hasOwnProperty("left") && typeof r.left != "number" ? "left: number expected" : r.top != null && r.hasOwnProperty("top") && typeof r.top != "number" ? "top: number expected" : r.right != null && r.hasOwnProperty("right") && typeof r.right != "number" ? "right: number expected" : r.bottom != null && r.hasOwnProperty("bottom") && typeof r.bottom != "number" ? "bottom: number expected" : null;
    }, i.fromObject = function(r) {
      if (r instanceof a.dot.RectangleDouble)
        return r;
      let t = new a.dot.RectangleDouble();
      return r.left != null && (t.left = Number(r.left)), r.top != null && (t.top = Number(r.top)), r.right != null && (t.right = Number(r.right)), r.bottom != null && (t.bottom = Number(r.bottom)), t;
    }, i.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), r.left != null && r.hasOwnProperty("left") && (e.left = t.json && !isFinite(r.left) ? String(r.left) : r.left), r.top != null && r.hasOwnProperty("top") && (e.top = t.json && !isFinite(r.top) ? String(r.top) : r.top), r.right != null && r.hasOwnProperty("right") && (e.right = t.json && !isFinite(r.right) ? String(r.right) : r.right), r.bottom != null && r.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(r.bottom) ? String(r.bottom) : r.bottom), e;
    }, i.prototype.toJSON = function() {
      return this.constructor.toObject(this, T.util.toJSONOptions);
    }, i.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.RectangleDouble";
    }, i;
  }(), c.DigestWithTimestamp = function() {
    function i(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return i.prototype.digest = p.newBuffer([]), i.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, i.create = function(r) {
      return new i(r);
    }, i.encode = function(r, t) {
      return t || (t = E.create()), r.digest != null && Object.hasOwnProperty.call(r, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.digest), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, i.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, i.decode = function(r, t) {
      r instanceof h || (r = h.create(r));
      let e = t === void 0 ? r.len : r.pos + t, n = new a.dot.DigestWithTimestamp();
      for (; r.pos < e; ) {
        let o = r.uint32();
        switch (o >>> 3) {
          case 1: {
            n.digest = r.bytes();
            break;
          }
          case 2: {
            n.timestampMillis = r.uint64();
            break;
          }
          default:
            r.skipType(o & 7);
            break;
        }
      }
      return n;
    }, i.decodeDelimited = function(r) {
      return r instanceof h || (r = new h(r)), this.decode(r, r.uint32());
    }, i.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.digest != null && r.hasOwnProperty("digest") && !(r.digest && typeof r.digest.length == "number" || p.isString(r.digest)) ? "digest: buffer expected" : r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !p.isInteger(r.timestampMillis) && !(r.timestampMillis && p.isInteger(r.timestampMillis.low) && p.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, i.fromObject = function(r) {
      if (r instanceof a.dot.DigestWithTimestamp)
        return r;
      let t = new a.dot.DigestWithTimestamp();
      return r.digest != null && (typeof r.digest == "string" ? p.base64.decode(r.digest, t.digest = p.newBuffer(p.base64.length(r.digest)), 0) : r.digest.length >= 0 && (t.digest = r.digest)), r.timestampMillis != null && (p.Long ? (t.timestampMillis = p.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, i.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = p.newBuffer(e.digest))), p.Long) {
          let n = new p.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.digest != null && r.hasOwnProperty("digest") && (e.digest = t.bytes === String ? p.base64.encode(r.digest, 0, r.digest.length) : t.bytes === Array ? Array.prototype.slice.call(r.digest) : r.digest), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? p.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, i.prototype.toJSON = function() {
      return this.constructor.toObject(this, T.util.toJSONOptions);
    }, i.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.DigestWithTimestamp";
    }, i;
  }(), c;
})();
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Hr = Symbol("Comlink.proxy"), hi = Symbol("Comlink.endpoint"), gi = Symbol("Comlink.releaseProxy"), Pt = Symbol("Comlink.finalizer"), et = Symbol("Comlink.thrown"), Vr = (c) => typeof c == "object" && c !== null || typeof c == "function", yi = {
  canHandle: (c) => Vr(c) && c[Hr],
  serialize(c) {
    const { port1: i, port2: r } = new MessageChannel();
    return Ft(c, i), [r, [r]];
  },
  deserialize(c) {
    return c.start(), wi(c);
  }
}, bi = {
  canHandle: (c) => Vr(c) && et in c,
  serialize({ value: c }) {
    let i;
    return c instanceof Error ? i = {
      isError: !0,
      value: {
        message: c.message,
        name: c.name,
        stack: c.stack
      }
    } : i = { isError: !1, value: c }, [i, []];
  },
  deserialize(c) {
    throw c.isError ? Object.assign(new Error(c.value.message), c.value) : c.value;
  }
}, Jr = /* @__PURE__ */ new Map([
  ["proxy", yi],
  ["throw", bi]
]);
function vi(c, i) {
  for (const r of c)
    if (i === r || r === "*" || r instanceof RegExp && r.test(i))
      return !0;
  return !1;
}
function Ft(c, i = globalThis, r = ["*"]) {
  i.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!vi(r, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: n, type: o, path: d } = Object.assign({ path: [] }, e.data), f = (e.data.argumentList || []).map(he);
    let y;
    try {
      const O = d.slice(0, -1).reduce((C, _) => C[_], c), I = d.reduce((C, _) => C[_], c);
      switch (o) {
        case "GET":
          y = I;
          break;
        case "SET":
          O[d.slice(-1)[0]] = he(e.data.value), y = !0;
          break;
        case "APPLY":
          y = I.apply(O, f);
          break;
        case "CONSTRUCT":
          {
            const C = new I(...f);
            y = Ci(C);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: C, port2: _ } = new MessageChannel();
            Ft(c, _), y = Si(C, [C]);
          }
          break;
        case "RELEASE":
          y = void 0;
          break;
        default:
          return;
      }
    } catch (O) {
      y = { value: O, [et]: 0 };
    }
    Promise.resolve(y).catch((O) => ({ value: O, [et]: 0 })).then((O) => {
      const [I, C] = ot(O);
      i.postMessage(Object.assign(Object.assign({}, I), { id: n }), C), o === "RELEASE" && (i.removeEventListener("message", t), Yr(i), Pt in c && typeof c[Pt] == "function" && c[Pt]());
    }).catch((O) => {
      const [I, C] = ot({
        value: new TypeError("Unserializable return value"),
        [et]: 0
      });
      i.postMessage(Object.assign(Object.assign({}, I), { id: n }), C);
    });
  }), i.start && i.start();
}
function Oi(c) {
  return c.constructor.name === "MessagePort";
}
function Yr(c) {
  Oi(c) && c.close();
}
function wi(c, i) {
  return Ct(c, [], i);
}
function Qe(c) {
  if (c)
    throw new Error("Proxy has been released and is not useable");
}
function Zr(c) {
  return Pe(c, {
    type: "RELEASE"
  }).then(() => {
    Yr(c);
  });
}
const rt = /* @__PURE__ */ new WeakMap(), nt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((c) => {
  const i = (rt.get(c) || 0) - 1;
  rt.set(c, i), i === 0 && Zr(c);
});
function Pi(c, i) {
  const r = (rt.get(i) || 0) + 1;
  rt.set(i, r), nt && nt.register(c, i, c);
}
function ji(c) {
  nt && nt.unregister(c);
}
function Ct(c, i = [], r = function() {
}) {
  let t = !1;
  const e = new Proxy(r, {
    get(n, o) {
      if (Qe(t), o === gi)
        return () => {
          ji(e), Zr(c), t = !0;
        };
      if (o === "then") {
        if (i.length === 0)
          return { then: () => e };
        const d = Pe(c, {
          type: "GET",
          path: i.map((f) => f.toString())
        }).then(he);
        return d.then.bind(d);
      }
      return Ct(c, [...i, o]);
    },
    set(n, o, d) {
      Qe(t);
      const [f, y] = ot(d);
      return Pe(c, {
        type: "SET",
        path: [...i, o].map((O) => O.toString()),
        value: f
      }, y).then(he);
    },
    apply(n, o, d) {
      Qe(t);
      const f = i[i.length - 1];
      if (f === hi)
        return Pe(c, {
          type: "ENDPOINT"
        }).then(he);
      if (f === "bind")
        return Ct(c, i.slice(0, -1));
      const [y, O] = _r(d);
      return Pe(c, {
        type: "APPLY",
        path: i.map((I) => I.toString()),
        argumentList: y
      }, O).then(he);
    },
    construct(n, o) {
      Qe(t);
      const [d, f] = _r(o);
      return Pe(c, {
        type: "CONSTRUCT",
        path: i.map((y) => y.toString()),
        argumentList: d
      }, f).then(he);
    }
  });
  return Pi(e, c), e;
}
function Ii(c) {
  return Array.prototype.concat.apply([], c);
}
function _r(c) {
  const i = c.map(ot);
  return [i.map((r) => r[0]), Ii(i.map((r) => r[1]))];
}
const Kr = /* @__PURE__ */ new WeakMap();
function Si(c, i) {
  return Kr.set(c, i), c;
}
function Ci(c) {
  return Object.assign(c, { [Hr]: !0 });
}
function ot(c) {
  for (const [i, r] of Jr)
    if (r.canHandle(c)) {
      const [t, e] = r.serialize(c);
      return [
        {
          type: "HANDLER",
          name: i,
          value: t
        },
        e
      ];
    }
  return [
    {
      type: "RAW",
      value: c
    },
    Kr.get(c) || []
  ];
}
function he(c) {
  switch (c.type) {
    case "HANDLER":
      return Jr.get(c.name).deserialize(c.value);
    case "RAW":
      return c.value;
  }
}
function Pe(c, i, r) {
  return new Promise((t) => {
    const e = Ai();
    c.addEventListener("message", function n(o) {
      !o.data || !o.data.id || o.data.id !== e || (c.removeEventListener("message", n), t(o.data));
    }), c.start && c.start(), c.postMessage(Object.assign({ id: e }, i), r);
  });
}
function Ai() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var Di = (() => {
  var c = import.meta.url;
  return async function(i = {}) {
    var r, t = i, e, n, o = new Promise((l, s) => {
      e = l, n = s;
    }), d = typeof window == "object", f = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var y = Object.assign({}, t), O = "./this.program", I = (l, s) => {
      throw s;
    }, C = "";
    function _(l) {
      return t.locateFile ? t.locateFile(l, C) : C + l;
    }
    var X, st;
    (d || f) && (f ? C = self.location.href : typeof document < "u" && document.currentScript && (C = document.currentScript.src), c && (C = c), C.startsWith("blob:") ? C = "" : C = C.slice(0, C.replace(/[?#].*/, "").lastIndexOf("/") + 1), f && (st = (l) => {
      var s = new XMLHttpRequest();
      return s.open("GET", l, !1), s.responseType = "arraybuffer", s.send(null), new Uint8Array(s.response);
    }), X = async (l) => {
      if (xt(l))
        return new Promise((u, m) => {
          var g = new XMLHttpRequest();
          g.open("GET", l, !0), g.responseType = "arraybuffer", g.onload = () => {
            if (g.status == 200 || g.status == 0 && g.response) {
              u(g.response);
              return;
            }
            m(g.status);
          }, g.onerror = m, g.send(null);
        });
      var s = await fetch(l, { credentials: "same-origin" });
      if (s.ok)
        return s.arrayBuffer();
      throw new Error(s.status + " : " + s.url);
    }), t.print || console.log.bind(console);
    var Fe = t.printErr || console.error.bind(console);
    Object.assign(t, y), y = null, t.arguments && t.arguments, t.thisProgram && (O = t.thisProgram);
    var _e = t.wasmBinary, Me, ce = !1, Re, Q, $, Ie, Le, de, M, _t, Mt, Rt, Lt, xt = (l) => l.startsWith("file://");
    function Nt() {
      var l = Me.buffer;
      t.HEAP8 = Q = new Int8Array(l), t.HEAP16 = Ie = new Int16Array(l), t.HEAPU8 = $ = new Uint8Array(l), t.HEAPU16 = Le = new Uint16Array(l), t.HEAP32 = de = new Int32Array(l), t.HEAPU32 = M = new Uint32Array(l), t.HEAPF32 = _t = new Float32Array(l), t.HEAPF64 = Lt = new Float64Array(l), t.HEAP64 = Mt = new BigInt64Array(l), t.HEAPU64 = Rt = new BigUint64Array(l);
    }
    function qr() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          un(t.preRun.shift());
      zt($t);
    }
    function Xr() {
      D.C();
    }
    function Qr() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          dn(t.postRun.shift());
      zt(Ut);
    }
    var ue = 0, Se = null;
    function en(l) {
      var s;
      ue++, (s = t.monitorRunDependencies) == null || s.call(t, ue);
    }
    function tn(l) {
      var u;
      if (ue--, (u = t.monitorRunDependencies) == null || u.call(t, ue), ue == 0 && Se) {
        var s = Se;
        Se = null, s();
      }
    }
    function xe(l) {
      var u;
      (u = t.onAbort) == null || u.call(t, l), l = "Aborted(" + l + ")", Fe(l), ce = !0, l += ". Build with -sASSERTIONS for more info.";
      var s = new WebAssembly.RuntimeError(l);
      throw n(s), s;
    }
    var lt;
    function rn() {
      return t.locateFile ? _("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function nn(l) {
      if (l == lt && _e)
        return new Uint8Array(_e);
      if (st)
        return st(l);
      throw "both async and sync fetching of the wasm failed";
    }
    async function on(l) {
      if (!_e)
        try {
          var s = await X(l);
          return new Uint8Array(s);
        } catch {
        }
      return nn(l);
    }
    async function an(l, s) {
      try {
        var u = await on(l), m = await WebAssembly.instantiate(u, s);
        return m;
      } catch (g) {
        Fe(`failed to asynchronously prepare wasm: ${g}`), xe(g);
      }
    }
    async function sn(l, s, u) {
      if (!l && typeof WebAssembly.instantiateStreaming == "function" && !xt(s))
        try {
          var m = fetch(s, { credentials: "same-origin" }), g = await WebAssembly.instantiateStreaming(m, u);
          return g;
        } catch (v) {
          Fe(`wasm streaming compile failed: ${v}`), Fe("falling back to ArrayBuffer instantiation");
        }
      return an(s, u);
    }
    function ln() {
      return { a: xo };
    }
    async function cn() {
      function l(v, w) {
        return D = v.exports, D = j.instrumentWasmExports(D), Me = D.B, Nt(), D.H, tn(), D;
      }
      en();
      function s(v) {
        return l(v.instance);
      }
      var u = ln();
      if (t.instantiateWasm)
        return new Promise((v, w) => {
          t.instantiateWasm(u, (b, P) => {
            l(b), v(b.exports);
          });
        });
      lt ?? (lt = rn());
      try {
        var m = await sn(_e, lt, u), g = s(m);
        return g;
      } catch (v) {
        return n(v), Promise.reject(v);
      }
    }
    class Wt {
      constructor(s) {
        Ze(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${s})`, this.status = s;
      }
    }
    var zt = (l) => {
      for (; l.length > 0; )
        l.shift()(t);
    }, Ut = [], dn = (l) => Ut.unshift(l), $t = [], un = (l) => $t.unshift(l), Gt = t.noExitRuntime || !0;
    class pn {
      constructor(s) {
        this.excPtr = s, this.ptr = s - 24;
      }
      set_type(s) {
        M[this.ptr + 4 >> 2] = s;
      }
      get_type() {
        return M[this.ptr + 4 >> 2];
      }
      set_destructor(s) {
        M[this.ptr + 8 >> 2] = s;
      }
      get_destructor() {
        return M[this.ptr + 8 >> 2];
      }
      set_caught(s) {
        s = s ? 1 : 0, Q[this.ptr + 12] = s;
      }
      get_caught() {
        return Q[this.ptr + 12] != 0;
      }
      set_rethrown(s) {
        s = s ? 1 : 0, Q[this.ptr + 13] = s;
      }
      get_rethrown() {
        return Q[this.ptr + 13] != 0;
      }
      init(s, u) {
        this.set_adjusted_ptr(0), this.set_type(s), this.set_destructor(u);
      }
      set_adjusted_ptr(s) {
        M[this.ptr + 16 >> 2] = s;
      }
      get_adjusted_ptr() {
        return M[this.ptr + 16 >> 2];
      }
    }
    var Bt = 0, fn = (l, s, u) => {
      var m = new pn(l);
      throw m.init(s, u), Bt = l, Bt;
    }, mn = () => xe(""), Ne = (l) => {
      if (l === null)
        return "null";
      var s = typeof l;
      return s === "object" || s === "array" || s === "function" ? l.toString() : "" + l;
    }, hn = () => {
      for (var l = new Array(256), s = 0; s < 256; ++s)
        l[s] = String.fromCharCode(s);
      Ht = l;
    }, Ht, z = (l) => {
      for (var s = "", u = l; $[u]; )
        s += Ht[$[u++]];
      return s;
    }, ve = {}, pe = {}, We = {}, Oe, k = (l) => {
      throw new Oe(l);
    }, Vt, ze = (l) => {
      throw new Vt(l);
    }, we = (l, s, u) => {
      l.forEach((b) => We[b] = s);
      function m(b) {
        var P = u(b);
        P.length !== l.length && ze("Mismatched type converter count");
        for (var A = 0; A < l.length; ++A)
          J(l[A], P[A]);
      }
      var g = new Array(s.length), v = [], w = 0;
      s.forEach((b, P) => {
        pe.hasOwnProperty(b) ? g[P] = pe[b] : (v.push(b), ve.hasOwnProperty(b) || (ve[b] = []), ve[b].push(() => {
          g[P] = pe[b], ++w, w === v.length && m(g);
        }));
      }), v.length === 0 && m(g);
    };
    function gn(l, s, u = {}) {
      var m = s.name;
      if (l || k(`type "${m}" must have a positive integer typeid pointer`), pe.hasOwnProperty(l)) {
        if (u.ignoreDuplicateRegistrations)
          return;
        k(`Cannot register type '${m}' twice`);
      }
      if (pe[l] = s, delete We[l], ve.hasOwnProperty(l)) {
        var g = ve[l];
        delete ve[l], g.forEach((v) => v());
      }
    }
    function J(l, s, u = {}) {
      return gn(l, s, u);
    }
    var Jt = (l, s, u) => {
      switch (s) {
        case 1:
          return u ? (m) => Q[m] : (m) => $[m];
        case 2:
          return u ? (m) => Ie[m >> 1] : (m) => Le[m >> 1];
        case 4:
          return u ? (m) => de[m >> 2] : (m) => M[m >> 2];
        case 8:
          return u ? (m) => Mt[m >> 3] : (m) => Rt[m >> 3];
        default:
          throw new TypeError(`invalid integer width (${s}): ${l}`);
      }
    }, yn = (l, s, u, m, g) => {
      s = z(s);
      var v = s.indexOf("u") != -1;
      J(l, { name: s, fromWireType: (w) => w, toWireType: function(w, b) {
        if (typeof b != "bigint" && typeof b != "number")
          throw new TypeError(`Cannot convert "${Ne(b)}" to ${this.name}`);
        return typeof b == "number" && (b = BigInt(b)), b;
      }, argPackAdvance: ee, readValueFromPointer: Jt(s, u, !v), destructorFunction: null });
    }, ee = 8, bn = (l, s, u, m) => {
      s = z(s), J(l, { name: s, fromWireType: function(g) {
        return !!g;
      }, toWireType: function(g, v) {
        return v ? u : m;
      }, argPackAdvance: ee, readValueFromPointer: function(g) {
        return this.fromWireType($[g]);
      }, destructorFunction: null });
    }, vn = (l) => ({ count: l.count, deleteScheduled: l.deleteScheduled, preservePointerOnDelete: l.preservePointerOnDelete, ptr: l.ptr, ptrType: l.ptrType, smartPtr: l.smartPtr, smartPtrType: l.smartPtrType }), ct = (l) => {
      function s(u) {
        return u.$$.ptrType.registeredClass.name;
      }
      k(s(l) + " instance already deleted");
    }, dt = !1, Yt = (l) => {
    }, On = (l) => {
      l.smartPtr ? l.smartPtrType.rawDestructor(l.smartPtr) : l.ptrType.registeredClass.rawDestructor(l.ptr);
    }, Zt = (l) => {
      l.count.value -= 1;
      var s = l.count.value === 0;
      s && On(l);
    }, Kt = (l, s, u) => {
      if (s === u)
        return l;
      if (u.baseClass === void 0)
        return null;
      var m = Kt(l, s, u.baseClass);
      return m === null ? null : u.downcast(m);
    }, qt = {}, wn = {}, Pn = (l, s) => {
      for (s === void 0 && k("ptr should not be undefined"); l.baseClass; )
        s = l.upcast(s), l = l.baseClass;
      return s;
    }, jn = (l, s) => (s = Pn(l, s), wn[s]), Ue = (l, s) => {
      (!s.ptrType || !s.ptr) && ze("makeClassHandle requires ptr and ptrType");
      var u = !!s.smartPtrType, m = !!s.smartPtr;
      return u !== m && ze("Both smartPtrType and smartPtr must be specified"), s.count = { value: 1 }, Ce(Object.create(l, { $$: { value: s, writable: !0 } }));
    };
    function In(l) {
      var s = this.getPointee(l);
      if (!s)
        return this.destructor(l), null;
      var u = jn(this.registeredClass, s);
      if (u !== void 0) {
        if (u.$$.count.value === 0)
          return u.$$.ptr = s, u.$$.smartPtr = l, u.clone();
        var m = u.clone();
        return this.destructor(l), m;
      }
      function g() {
        return this.isSmartPointer ? Ue(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: s, smartPtrType: this, smartPtr: l }) : Ue(this.registeredClass.instancePrototype, { ptrType: this, ptr: l });
      }
      var v = this.registeredClass.getActualType(s), w = qt[v];
      if (!w)
        return g.call(this);
      var b;
      this.isConst ? b = w.constPointerType : b = w.pointerType;
      var P = Kt(s, this.registeredClass, b.registeredClass);
      return P === null ? g.call(this) : this.isSmartPointer ? Ue(b.registeredClass.instancePrototype, { ptrType: b, ptr: P, smartPtrType: this, smartPtr: l }) : Ue(b.registeredClass.instancePrototype, { ptrType: b, ptr: P });
    }
    var Ce = (l) => typeof FinalizationRegistry > "u" ? (Ce = (s) => s, l) : (dt = new FinalizationRegistry((s) => {
      Zt(s.$$);
    }), Ce = (s) => {
      var u = s.$$, m = !!u.smartPtr;
      if (m) {
        var g = { $$: u };
        dt.register(s, g, s);
      }
      return s;
    }, Yt = (s) => dt.unregister(s), Ce(l)), $e = [], Sn = () => {
      for (; $e.length; ) {
        var l = $e.pop();
        l.$$.deleteScheduled = !1, l.delete();
      }
    }, Xt, Cn = () => {
      Object.assign(Ge.prototype, { isAliasOf(l) {
        if (!(this instanceof Ge) || !(l instanceof Ge))
          return !1;
        var s = this.$$.ptrType.registeredClass, u = this.$$.ptr;
        l.$$ = l.$$;
        for (var m = l.$$.ptrType.registeredClass, g = l.$$.ptr; s.baseClass; )
          u = s.upcast(u), s = s.baseClass;
        for (; m.baseClass; )
          g = m.upcast(g), m = m.baseClass;
        return s === m && u === g;
      }, clone() {
        if (this.$$.ptr || ct(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var l = Ce(Object.create(Object.getPrototypeOf(this), { $$: { value: vn(this.$$) } }));
        return l.$$.count.value += 1, l.$$.deleteScheduled = !1, l;
      }, delete() {
        this.$$.ptr || ct(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && k("Object already scheduled for deletion"), Yt(this), Zt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || ct(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && k("Object already scheduled for deletion"), $e.push(this), $e.length === 1 && Xt && Xt(Sn), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ge() {
    }
    var ut = (l, s) => Object.defineProperty(s, "name", { value: l }), An = (l, s, u) => {
      if (l[s].overloadTable === void 0) {
        var m = l[s];
        l[s] = function(...g) {
          return l[s].overloadTable.hasOwnProperty(g.length) || k(`Function '${u}' called with an invalid number of arguments (${g.length}) - expects one of (${l[s].overloadTable})!`), l[s].overloadTable[g.length].apply(this, g);
        }, l[s].overloadTable = [], l[s].overloadTable[m.argCount] = m;
      }
    }, Qt = (l, s, u) => {
      t.hasOwnProperty(l) ? ((u === void 0 || t[l].overloadTable !== void 0 && t[l].overloadTable[u] !== void 0) && k(`Cannot register public name '${l}' twice`), An(t, l, l), t[l].overloadTable.hasOwnProperty(u) && k(`Cannot register multiple overloads of a function with the same number of arguments (${u})!`), t[l].overloadTable[u] = s) : (t[l] = s, t[l].argCount = u);
    }, Dn = 48, Tn = 57, kn = (l) => {
      l = l.replace(/[^a-zA-Z0-9_]/g, "$");
      var s = l.charCodeAt(0);
      return s >= Dn && s <= Tn ? `_${l}` : l;
    };
    function En(l, s, u, m, g, v, w, b) {
      this.name = l, this.constructor = s, this.instancePrototype = u, this.rawDestructor = m, this.baseClass = g, this.getActualType = v, this.upcast = w, this.downcast = b, this.pureVirtualFunctions = [];
    }
    var Be = (l, s, u) => {
      for (; s !== u; )
        s.upcast || k(`Expected null or instance of ${u.name}, got an instance of ${s.name}`), l = s.upcast(l), s = s.baseClass;
      return l;
    };
    function Fn(l, s) {
      if (s === null)
        return this.isReference && k(`null is not a valid ${this.name}`), 0;
      s.$$ || k(`Cannot pass "${Ne(s)}" as a ${this.name}`), s.$$.ptr || k(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var u = s.$$.ptrType.registeredClass, m = Be(s.$$.ptr, u, this.registeredClass);
      return m;
    }
    function _n(l, s) {
      var u;
      if (s === null)
        return this.isReference && k(`null is not a valid ${this.name}`), this.isSmartPointer ? (u = this.rawConstructor(), l !== null && l.push(this.rawDestructor, u), u) : 0;
      (!s || !s.$$) && k(`Cannot pass "${Ne(s)}" as a ${this.name}`), s.$$.ptr || k(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && s.$$.ptrType.isConst && k(`Cannot convert argument of type ${s.$$.smartPtrType ? s.$$.smartPtrType.name : s.$$.ptrType.name} to parameter type ${this.name}`);
      var m = s.$$.ptrType.registeredClass;
      if (u = Be(s.$$.ptr, m, this.registeredClass), this.isSmartPointer)
        switch (s.$$.smartPtr === void 0 && k("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            s.$$.smartPtrType === this ? u = s.$$.smartPtr : k(`Cannot convert argument of type ${s.$$.smartPtrType ? s.$$.smartPtrType.name : s.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            u = s.$$.smartPtr;
            break;
          case 2:
            if (s.$$.smartPtrType === this)
              u = s.$$.smartPtr;
            else {
              var g = s.clone();
              u = this.rawShare(u, H.toHandle(() => g.delete())), l !== null && l.push(this.rawDestructor, u);
            }
            break;
          default:
            k("Unsupporting sharing policy");
        }
      return u;
    }
    function Mn(l, s) {
      if (s === null)
        return this.isReference && k(`null is not a valid ${this.name}`), 0;
      s.$$ || k(`Cannot pass "${Ne(s)}" as a ${this.name}`), s.$$.ptr || k(`Cannot pass deleted object as a pointer of type ${this.name}`), s.$$.ptrType.isConst && k(`Cannot convert argument of type ${s.$$.ptrType.name} to parameter type ${this.name}`);
      var u = s.$$.ptrType.registeredClass, m = Be(s.$$.ptr, u, this.registeredClass);
      return m;
    }
    function He(l) {
      return this.fromWireType(M[l >> 2]);
    }
    var Rn = () => {
      Object.assign(Ve.prototype, { getPointee(l) {
        return this.rawGetPointee && (l = this.rawGetPointee(l)), l;
      }, destructor(l) {
        var s;
        (s = this.rawDestructor) == null || s.call(this, l);
      }, argPackAdvance: ee, readValueFromPointer: He, fromWireType: In });
    };
    function Ve(l, s, u, m, g, v, w, b, P, A, S) {
      this.name = l, this.registeredClass = s, this.isReference = u, this.isConst = m, this.isSmartPointer = g, this.pointeeType = v, this.sharingPolicy = w, this.rawGetPointee = b, this.rawConstructor = P, this.rawShare = A, this.rawDestructor = S, !g && s.baseClass === void 0 ? m ? (this.toWireType = Fn, this.destructorFunction = null) : (this.toWireType = Mn, this.destructorFunction = null) : this.toWireType = _n;
    }
    var er = (l, s, u) => {
      t.hasOwnProperty(l) || ze("Replacing nonexistent public symbol"), t[l].overloadTable !== void 0 && u !== void 0 ? t[l].overloadTable[u] = s : (t[l] = s, t[l].argCount = u);
    }, Ln = (l, s, u) => {
      l = l.replace(/p/g, "i");
      var m = t["dynCall_" + l];
      return m(s, ...u);
    }, xn = (l, s, u = []) => {
      var m = Ln(l, s, u);
      return m;
    }, Nn = (l, s) => (...u) => xn(l, s, u), oe = (l, s) => {
      l = z(l);
      function u() {
        return Nn(l, s);
      }
      var m = u();
      return typeof m != "function" && k(`unknown function pointer with signature ${l}: ${s}`), m;
    }, Wn = (l, s) => {
      var u = ut(s, function(m) {
        this.name = s, this.message = m;
        var g = new Error(m).stack;
        g !== void 0 && (this.stack = this.toString() + `
` + g.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return u.prototype = Object.create(l.prototype), u.prototype.constructor = u, u.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, u;
    }, tr, rr = (l) => {
      var s = No(l), u = z(s);
      return te(s), u;
    }, Ae = (l, s) => {
      var u = [], m = {};
      function g(v) {
        if (!m[v] && !pe[v]) {
          if (We[v]) {
            We[v].forEach(g);
            return;
          }
          u.push(v), m[v] = !0;
        }
      }
      throw s.forEach(g), new tr(`${l}: ` + u.map(rr).join([", "]));
    }, zn = (l, s, u, m, g, v, w, b, P, A, S, R, x) => {
      S = z(S), v = oe(g, v), b && (b = oe(w, b)), A && (A = oe(P, A)), x = oe(R, x);
      var U = kn(S);
      Qt(U, function() {
        Ae(`Cannot construct ${S} due to unbound types`, [m]);
      }), we([l, s, u], m ? [m] : [], (Y) => {
        var mr;
        Y = Y[0];
        var ae, re;
        m ? (ae = Y.registeredClass, re = ae.instancePrototype) : re = Ge.prototype;
        var W = ut(S, function(...vt) {
          if (Object.getPrototypeOf(this) !== fe)
            throw new Oe("Use 'new' to construct " + S);
          if (N.constructor_body === void 0)
            throw new Oe(S + " has no accessible constructor");
          var hr = N.constructor_body[vt.length];
          if (hr === void 0)
            throw new Oe(`Tried to invoke ctor of ${S} with invalid number of parameters (${vt.length}) - expected (${Object.keys(N.constructor_body).toString()}) parameters instead!`);
          return hr.apply(this, vt);
        }), fe = Object.create(re, { constructor: { value: W } });
        W.prototype = fe;
        var N = new En(S, W, fe, x, ae, v, b, A);
        N.baseClass && ((mr = N.baseClass).__derivedClasses ?? (mr.__derivedClasses = []), N.baseClass.__derivedClasses.push(N));
        var bt = new Ve(S, N, !0, !1, !1), ne = new Ve(S + "*", N, !1, !1, !1), Ye = new Ve(S + " const*", N, !1, !0, !1);
        return qt[l] = { pointerType: ne, constPointerType: Ye }, er(U, W), [bt, ne, Ye];
      });
    }, nr = (l, s) => {
      for (var u = [], m = 0; m < l; m++)
        u.push(M[s + m * 4 >> 2]);
      return u;
    }, pt = (l) => {
      for (; l.length; ) {
        var s = l.pop(), u = l.pop();
        u(s);
      }
    };
    function Un(l) {
      for (var s = 1; s < l.length; ++s)
        if (l[s] !== null && l[s].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Je = (l) => {
      try {
        return l();
      } catch (s) {
        xe(s);
      }
    }, or = (l) => {
      if (l instanceof Wt || l == "unwind")
        return Re;
      I(1, l);
    }, ir = 0, ar = () => Gt || ir > 0, sr = (l) => {
      var s;
      Re = l, ar() || ((s = t.onExit) == null || s.call(t, l), ce = !0), I(l, new Wt(l));
    }, $n = (l, s) => {
      Re = l, sr(l);
    }, Gn = $n, Bn = () => {
      if (!ar())
        try {
          Gn(Re);
        } catch (l) {
          or(l);
        }
    }, lr = (l) => {
      if (!ce)
        try {
          l(), Bn();
        } catch (s) {
          or(s);
        }
    }, j = { instrumentWasmImports(l) {
      var s = /^(__asyncjs__.*)$/;
      for (let [u, m] of Object.entries(l))
        typeof m == "function" && (m.isAsync || s.test(u));
    }, instrumentWasmExports(l) {
      var s = {};
      for (let [u, m] of Object.entries(l))
        typeof m == "function" ? s[u] = (...g) => {
          j.exportCallStack.push(u);
          try {
            return m(...g);
          } finally {
            ce || (j.exportCallStack.pop(), j.maybeStopUnwind());
          }
        } : s[u] = m;
      return s;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(l) {
      var s = j.callStackNameToId[l];
      return s === void 0 && (s = j.callStackId++, j.callStackNameToId[l] = s, j.callStackIdToName[s] = l), s;
    }, maybeStopUnwind() {
      j.currData && j.state === j.State.Unwinding && j.exportCallStack.length === 0 && (j.state = j.State.Normal, Je(Uo), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((l, s) => {
        j.asyncPromiseHandlers = { resolve: l, reject: s };
      });
    }, allocateData() {
      var l = gt(12 + j.StackSize);
      return j.setDataHeader(l, l + 12, j.StackSize), j.setDataRewindFunc(l), l;
    }, setDataHeader(l, s, u) {
      M[l >> 2] = s, M[l + 4 >> 2] = s + u;
    }, setDataRewindFunc(l) {
      var s = j.exportCallStack[0], u = j.getCallStackId(s);
      de[l + 8 >> 2] = u;
    }, getDataRewindFuncName(l) {
      var s = de[l + 8 >> 2], u = j.callStackIdToName[s];
      return u;
    }, getDataRewindFunc(l) {
      var s = D[l];
      return s;
    }, doRewind(l) {
      var s = j.getDataRewindFuncName(l), u = j.getDataRewindFunc(s);
      return u();
    }, handleSleep(l) {
      if (!ce) {
        if (j.state === j.State.Normal) {
          var s = !1, u = !1;
          l((m = 0) => {
            if (!ce && (j.handleSleepReturnValue = m, s = !0, !!u)) {
              j.state = j.State.Rewinding, Je(() => $o(j.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var g, v = !1;
              try {
                g = j.doRewind(j.currData);
              } catch (P) {
                g = P, v = !0;
              }
              var w = !1;
              if (!j.currData) {
                var b = j.asyncPromiseHandlers;
                b && (j.asyncPromiseHandlers = null, (v ? b.reject : b.resolve)(g), w = !0);
              }
              if (v && !w)
                throw g;
            }
          }), u = !0, s || (j.state = j.State.Unwinding, j.currData = j.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Je(() => zo(j.currData)));
        } else j.state === j.State.Rewinding ? (j.state = j.State.Normal, Je(Go), te(j.currData), j.currData = null, j.sleepCallbacks.forEach(lr)) : xe(`invalid state: ${j.state}`);
        return j.handleSleepReturnValue;
      }
    }, handleAsync(l) {
      return j.handleSleep((s) => {
        l().then(s);
      });
    } };
    function cr(l, s, u, m, g, v) {
      var w = s.length;
      w < 2 && k("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var b = s[1] !== null && u !== null, P = Un(s), A = s[0].name !== "void", S = w - 2, R = new Array(S), x = [], U = [], Y = function(...ae) {
        U.length = 0;
        var re;
        x.length = b ? 2 : 1, x[0] = g, b && (re = s[1].toWireType(U, this), x[1] = re);
        for (var W = 0; W < S; ++W)
          R[W] = s[W + 2].toWireType(U, ae[W]), x.push(R[W]);
        var fe = m(...x);
        function N(bt) {
          if (P)
            pt(U);
          else
            for (var ne = b ? 1 : 2; ne < s.length; ne++) {
              var Ye = ne === 1 ? re : R[ne - 2];
              s[ne].destructorFunction !== null && s[ne].destructorFunction(Ye);
            }
          if (A)
            return s[0].fromWireType(bt);
        }
        return j.currData ? j.whenDone().then(N) : N(fe);
      };
      return ut(l, Y);
    }
    var Hn = (l, s, u, m, g, v) => {
      var w = nr(s, u);
      g = oe(m, g), we([], [l], (b) => {
        b = b[0];
        var P = `constructor ${b.name}`;
        if (b.registeredClass.constructor_body === void 0 && (b.registeredClass.constructor_body = []), b.registeredClass.constructor_body[s - 1] !== void 0)
          throw new Oe(`Cannot register multiple constructors with identical number of parameters (${s - 1}) for class '${b.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return b.registeredClass.constructor_body[s - 1] = () => {
          Ae(`Cannot construct ${b.name} due to unbound types`, w);
        }, we([], w, (A) => (A.splice(1, 0, null), b.registeredClass.constructor_body[s - 1] = cr(P, A, null, g, v), [])), [];
      });
    }, dr = (l, s, u) => (l instanceof Object || k(`${u} with invalid "this": ${l}`), l instanceof s.registeredClass.constructor || k(`${u} incompatible with "this" of type ${l.constructor.name}`), l.$$.ptr || k(`cannot call emscripten binding method ${u} on deleted object`), Be(l.$$.ptr, l.$$.ptrType.registeredClass, s.registeredClass)), Vn = (l, s, u, m, g, v, w, b, P, A) => {
      s = z(s), g = oe(m, g), we([], [l], (S) => {
        S = S[0];
        var R = `${S.name}.${s}`, x = { get() {
          Ae(`Cannot access ${R} due to unbound types`, [u, w]);
        }, enumerable: !0, configurable: !0 };
        return P ? x.set = () => Ae(`Cannot access ${R} due to unbound types`, [u, w]) : x.set = (U) => k(R + " is a read-only property"), Object.defineProperty(S.registeredClass.instancePrototype, s, x), we([], P ? [u, w] : [u], (U) => {
          var Y = U[0], ae = { get() {
            var W = dr(this, S, R + " getter");
            return Y.fromWireType(g(v, W));
          }, enumerable: !0 };
          if (P) {
            P = oe(b, P);
            var re = U[1];
            ae.set = function(W) {
              var fe = dr(this, S, R + " setter"), N = [];
              P(A, fe, re.toWireType(N, W)), pt(N);
            };
          }
          return Object.defineProperty(S.registeredClass.instancePrototype, s, ae), [];
        }), [];
      });
    }, ft = [], ie = [], mt = (l) => {
      l > 9 && --ie[l + 1] === 0 && (ie[l] = void 0, ft.push(l));
    }, Jn = () => ie.length / 2 - 5 - ft.length, Yn = () => {
      ie.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Jn;
    }, H = { toValue: (l) => (l || k("Cannot use deleted val. handle = " + l), ie[l]), toHandle: (l) => {
      switch (l) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const s = ft.pop() || ie.length;
          return ie[s] = l, ie[s + 1] = 1, s;
        }
      }
    } }, Zn = { name: "emscripten::val", fromWireType: (l) => {
      var s = H.toValue(l);
      return mt(l), s;
    }, toWireType: (l, s) => H.toHandle(s), argPackAdvance: ee, readValueFromPointer: He, destructorFunction: null }, Kn = (l) => J(l, Zn), qn = (l, s) => {
      switch (s) {
        case 4:
          return function(u) {
            return this.fromWireType(_t[u >> 2]);
          };
        case 8:
          return function(u) {
            return this.fromWireType(Lt[u >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${s}): ${l}`);
      }
    }, Xn = (l, s, u) => {
      s = z(s), J(l, { name: s, fromWireType: (m) => m, toWireType: (m, g) => g, argPackAdvance: ee, readValueFromPointer: qn(s, u), destructorFunction: null });
    }, Qn = (l) => {
      l = l.trim();
      const s = l.indexOf("(");
      return s === -1 ? l : l.slice(0, s);
    }, eo = (l, s, u, m, g, v, w, b) => {
      var P = nr(s, u);
      l = z(l), l = Qn(l), g = oe(m, g), Qt(l, function() {
        Ae(`Cannot call ${l} due to unbound types`, P);
      }, s - 1), we([], P, (A) => {
        var S = [A[0], null].concat(A.slice(1));
        return er(l, cr(l, S, null, g, v), s - 1), [];
      });
    }, to = (l, s, u, m, g) => {
      s = z(s);
      var v = (S) => S;
      if (m === 0) {
        var w = 32 - 8 * u;
        v = (S) => S << w >>> w;
      }
      var b = s.includes("unsigned"), P = (S, R) => {
      }, A;
      b ? A = function(S, R) {
        return P(R, this.name), R >>> 0;
      } : A = function(S, R) {
        return P(R, this.name), R;
      }, J(l, { name: s, fromWireType: v, toWireType: A, argPackAdvance: ee, readValueFromPointer: Jt(s, u, m !== 0), destructorFunction: null });
    }, ro = (l, s, u) => {
      var m = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], g = m[s];
      function v(w) {
        var b = M[w >> 2], P = M[w + 4 >> 2];
        return new g(Q.buffer, P, b);
      }
      u = z(u), J(l, { name: u, fromWireType: v, argPackAdvance: ee, readValueFromPointer: v }, { ignoreDuplicateRegistrations: !0 });
    }, no = (l, s, u, m) => {
      if (!(m > 0)) return 0;
      for (var g = u, v = u + m - 1, w = 0; w < l.length; ++w) {
        var b = l.charCodeAt(w);
        if (b >= 55296 && b <= 57343) {
          var P = l.charCodeAt(++w);
          b = 65536 + ((b & 1023) << 10) | P & 1023;
        }
        if (b <= 127) {
          if (u >= v) break;
          s[u++] = b;
        } else if (b <= 2047) {
          if (u + 1 >= v) break;
          s[u++] = 192 | b >> 6, s[u++] = 128 | b & 63;
        } else if (b <= 65535) {
          if (u + 2 >= v) break;
          s[u++] = 224 | b >> 12, s[u++] = 128 | b >> 6 & 63, s[u++] = 128 | b & 63;
        } else {
          if (u + 3 >= v) break;
          s[u++] = 240 | b >> 18, s[u++] = 128 | b >> 12 & 63, s[u++] = 128 | b >> 6 & 63, s[u++] = 128 | b & 63;
        }
      }
      return s[u] = 0, u - g;
    }, oo = (l, s, u) => no(l, $, s, u), io = (l) => {
      for (var s = 0, u = 0; u < l.length; ++u) {
        var m = l.charCodeAt(u);
        m <= 127 ? s++ : m <= 2047 ? s += 2 : m >= 55296 && m <= 57343 ? (s += 4, ++u) : s += 3;
      }
      return s;
    }, ur = typeof TextDecoder < "u" ? new TextDecoder() : void 0, ao = (l, s = 0, u = NaN) => {
      for (var m = s + u, g = s; l[g] && !(g >= m); ) ++g;
      if (g - s > 16 && l.buffer && ur)
        return ur.decode(l.subarray(s, g));
      for (var v = ""; s < g; ) {
        var w = l[s++];
        if (!(w & 128)) {
          v += String.fromCharCode(w);
          continue;
        }
        var b = l[s++] & 63;
        if ((w & 224) == 192) {
          v += String.fromCharCode((w & 31) << 6 | b);
          continue;
        }
        var P = l[s++] & 63;
        if ((w & 240) == 224 ? w = (w & 15) << 12 | b << 6 | P : w = (w & 7) << 18 | b << 12 | P << 6 | l[s++] & 63, w < 65536)
          v += String.fromCharCode(w);
        else {
          var A = w - 65536;
          v += String.fromCharCode(55296 | A >> 10, 56320 | A & 1023);
        }
      }
      return v;
    }, so = (l, s) => l ? ao($, l, s) : "", lo = (l, s) => {
      s = z(s), J(l, { name: s, fromWireType(u) {
        for (var m = M[u >> 2], g = u + 4, v, w, b = g, w = 0; w <= m; ++w) {
          var P = g + w;
          if (w == m || $[P] == 0) {
            var A = P - b, S = so(b, A);
            v === void 0 ? v = S : (v += "\0", v += S), b = P + 1;
          }
        }
        return te(u), v;
      }, toWireType(u, m) {
        m instanceof ArrayBuffer && (m = new Uint8Array(m));
        var g, v = typeof m == "string";
        v || m instanceof Uint8Array || m instanceof Uint8ClampedArray || m instanceof Int8Array || k("Cannot pass non-string to std::string"), v ? g = io(m) : g = m.length;
        var w = gt(4 + g + 1), b = w + 4;
        if (M[w >> 2] = g, v)
          oo(m, b, g + 1);
        else if (v)
          for (var P = 0; P < g; ++P) {
            var A = m.charCodeAt(P);
            A > 255 && (te(w), k("String has UTF-16 code units that do not fit in 8 bits")), $[b + P] = A;
          }
        else
          for (var P = 0; P < g; ++P)
            $[b + P] = m[P];
        return u !== null && u.push(te, w), w;
      }, argPackAdvance: ee, readValueFromPointer: He, destructorFunction(u) {
        te(u);
      } });
    }, pr = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, co = (l, s) => {
      for (var u = l, m = u >> 1, g = m + s / 2; !(m >= g) && Le[m]; ) ++m;
      if (u = m << 1, u - l > 32 && pr) return pr.decode($.subarray(l, u));
      for (var v = "", w = 0; !(w >= s / 2); ++w) {
        var b = Ie[l + w * 2 >> 1];
        if (b == 0) break;
        v += String.fromCharCode(b);
      }
      return v;
    }, uo = (l, s, u) => {
      if (u ?? (u = 2147483647), u < 2) return 0;
      u -= 2;
      for (var m = s, g = u < l.length * 2 ? u / 2 : l.length, v = 0; v < g; ++v) {
        var w = l.charCodeAt(v);
        Ie[s >> 1] = w, s += 2;
      }
      return Ie[s >> 1] = 0, s - m;
    }, po = (l) => l.length * 2, fo = (l, s) => {
      for (var u = 0, m = ""; !(u >= s / 4); ) {
        var g = de[l + u * 4 >> 2];
        if (g == 0) break;
        if (++u, g >= 65536) {
          var v = g - 65536;
          m += String.fromCharCode(55296 | v >> 10, 56320 | v & 1023);
        } else
          m += String.fromCharCode(g);
      }
      return m;
    }, mo = (l, s, u) => {
      if (u ?? (u = 2147483647), u < 4) return 0;
      for (var m = s, g = m + u - 4, v = 0; v < l.length; ++v) {
        var w = l.charCodeAt(v);
        if (w >= 55296 && w <= 57343) {
          var b = l.charCodeAt(++v);
          w = 65536 + ((w & 1023) << 10) | b & 1023;
        }
        if (de[s >> 2] = w, s += 4, s + 4 > g) break;
      }
      return de[s >> 2] = 0, s - m;
    }, ho = (l) => {
      for (var s = 0, u = 0; u < l.length; ++u) {
        var m = l.charCodeAt(u);
        m >= 55296 && m <= 57343 && ++u, s += 4;
      }
      return s;
    }, go = (l, s, u) => {
      u = z(u);
      var m, g, v, w;
      s === 2 ? (m = co, g = uo, w = po, v = (b) => Le[b >> 1]) : s === 4 && (m = fo, g = mo, w = ho, v = (b) => M[b >> 2]), J(l, { name: u, fromWireType: (b) => {
        for (var P = M[b >> 2], A, S = b + 4, R = 0; R <= P; ++R) {
          var x = b + 4 + R * s;
          if (R == P || v(x) == 0) {
            var U = x - S, Y = m(S, U);
            A === void 0 ? A = Y : (A += "\0", A += Y), S = x + s;
          }
        }
        return te(b), A;
      }, toWireType: (b, P) => {
        typeof P != "string" && k(`Cannot pass non-string to C++ string type ${u}`);
        var A = w(P), S = gt(4 + A + s);
        return M[S >> 2] = A / s, g(P, S + 4, A + s), b !== null && b.push(te, S), S;
      }, argPackAdvance: ee, readValueFromPointer: He, destructorFunction(b) {
        te(b);
      } });
    }, yo = (l, s) => {
      s = z(s), J(l, { isVoid: !0, name: s, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (u, m) => {
      } });
    }, bo = () => {
      Gt = !1, ir = 0;
    }, fr = (l, s) => {
      var u = pe[l];
      return u === void 0 && k(`${s} has unknown type ${rr(l)}`), u;
    }, vo = (l, s, u) => {
      var m = [], g = l.toWireType(m, u);
      return m.length && (M[s >> 2] = H.toHandle(m)), g;
    }, Oo = (l, s, u) => (l = H.toValue(l), s = fr(s, "emval::as"), vo(s, u, l)), wo = (l, s) => (l = H.toValue(l), s = H.toValue(s), H.toHandle(l[s])), Po = {}, jo = (l) => {
      var s = Po[l];
      return s === void 0 ? z(l) : s;
    }, Io = (l) => H.toHandle(jo(l)), So = (l) => {
      var s = H.toValue(l);
      pt(s), mt(l);
    }, Co = (l, s) => {
      l = fr(l, "_emval_take_value");
      var u = l.readValueFromPointer(s);
      return H.toHandle(u);
    }, De = {}, Ao = () => performance.now(), Do = (l, s) => {
      if (De[l] && (clearTimeout(De[l].id), delete De[l]), !s) return 0;
      var u = setTimeout(() => {
        delete De[l], lr(() => Wo(l, Ao()));
      }, s);
      return De[l] = { id: u, timeout_ms: s }, 0;
    }, To = () => 2147483648, ko = (l, s) => Math.ceil(l / s) * s, Eo = (l) => {
      var s = Me.buffer, u = (l - s.byteLength + 65535) / 65536 | 0;
      try {
        return Me.grow(u), Nt(), 1;
      } catch {
      }
    }, Fo = (l) => {
      var s = $.length;
      l >>>= 0;
      var u = To();
      if (l > u)
        return !1;
      for (var m = 1; m <= 4; m *= 2) {
        var g = s * (1 + 0.2 / m);
        g = Math.min(g, l + 100663296);
        var v = Math.min(u, ko(Math.max(l, g), 65536)), w = Eo(v);
        if (w)
          return !0;
      }
      return !1;
    }, ht = {}, _o = () => O || "./this.program", Te = () => {
      if (!Te.strings) {
        var l = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", s = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: l, _: _o() };
        for (var u in ht)
          ht[u] === void 0 ? delete s[u] : s[u] = ht[u];
        var m = [];
        for (var u in s)
          m.push(`${u}=${s[u]}`);
        Te.strings = m;
      }
      return Te.strings;
    }, Mo = (l, s) => {
      for (var u = 0; u < l.length; ++u)
        Q[s++] = l.charCodeAt(u);
      Q[s] = 0;
    }, Ro = (l, s) => {
      var u = 0;
      return Te().forEach((m, g) => {
        var v = s + u;
        M[l + g * 4 >> 2] = v, Mo(m, v), u += m.length + 1;
      }), 0;
    }, Lo = (l, s) => {
      var u = Te();
      M[l >> 2] = u.length;
      var m = 0;
      return u.forEach((g) => m += g.length + 1), M[s >> 2] = m, 0;
    };
    hn(), Oe = t.BindingError = class extends Error {
      constructor(s) {
        super(s), this.name = "BindingError";
      }
    }, Vt = t.InternalError = class extends Error {
      constructor(s) {
        super(s), this.name = "InternalError";
      }
    }, Cn(), Rn(), tr = t.UnboundTypeError = Wn(Error, "UnboundTypeError"), Yn();
    var xo = { h: fn, v: mn, l: yn, y: bn, f: zn, e: Hn, a: Vn, w: Kn, k: Xn, b: eo, d: to, c: ro, x: lo, g: go, z: yo, q: bo, i: Oo, A: mt, j: wo, o: Io, n: So, m: Co, r: Do, u: Fo, s: Ro, t: Lo, p: sr }, D = await cn();
    D.C;
    var No = D.D, gt = t._malloc = D.E, te = t._free = D.F, Wo = D.G;
    t.dynCall_v = D.I, t.dynCall_ii = D.J, t.dynCall_vi = D.K, t.dynCall_i = D.L, t.dynCall_iii = D.M, t.dynCall_viii = D.N, t.dynCall_fii = D.O, t.dynCall_viif = D.P, t.dynCall_viiii = D.Q, t.dynCall_viiiiii = D.R, t.dynCall_iiiiii = D.S, t.dynCall_viiiii = D.T, t.dynCall_iiiiiiii = D.U, t.dynCall_viiiiiii = D.V, t.dynCall_viiiiiiiiidi = D.W, t.dynCall_viiiiiiiidi = D.X, t.dynCall_viiiiiiiiii = D.Y, t.dynCall_viiiiiiiii = D.Z, t.dynCall_viiiiiiii = D._, t.dynCall_iiiiiii = D.$, t.dynCall_iiiii = D.aa, t.dynCall_iiii = D.ba;
    var zo = D.ca, Uo = D.da, $o = D.ea, Go = D.fa;
    function yt() {
      if (ue > 0) {
        Se = yt;
        return;
      }
      if (qr(), ue > 0) {
        Se = yt;
        return;
      }
      function l() {
        var s;
        t.calledRun = !0, !ce && (Xr(), e(t), (s = t.onRuntimeInitialized) == null || s.call(t), Qr());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), l();
      }, 1)) : l();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return yt(), r = o, r;
  };
})();
class Ti extends Zo {
  getSamWasmFilePath(i, r) {
    return `${i}/document/wasm/${r}`;
  }
  fetchSamModule(i) {
    return Di(i);
  }
  parseRawData(i) {
    const { brightness: r, hotspots: t, sharpness: e } = i.params, n = {
      confidence: i.confidence / 1e3,
      topLeft: {
        x: i.x0,
        y: i.y0
      },
      topRight: {
        x: i.x1,
        y: i.y1
      },
      bottomRight: {
        x: i.x2,
        y: i.y2
      },
      bottomLeft: {
        x: i.x3,
        y: i.y3
      },
      brightness: r / 1e3,
      hotspots: t / 1e3,
      sharpness: e / 1e3
    };
    return {
      ...n,
      smallestEdge: Ko(n)
    };
  }
  async detect(i, r) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(i, r), e = this.samWasmModule.detectDocumentWithImageParameters(
      r.width,
      r.height,
      t.bgr0ImagePointer,
      0,
      // paramWidth should be 0 (default value)
      0,
      // paramHeight should be 0 (default value)
      0
      // documentDetectionOptions - speed option - set as "standard full method"
    );
    return t.free(), this.parseRawData(e);
  }
}
Ft(Ti);
