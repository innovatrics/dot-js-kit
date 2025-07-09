var To = Object.defineProperty;
var er = (p) => {
  throw TypeError(p);
};
var Eo = (p, l, n) => l in p ? To(p, l, { enumerable: !0, configurable: !0, writable: !0, value: n }) : p[l] = n;
var Ne = (p, l, n) => Eo(p, typeof l != "symbol" ? l + "" : l, n), tr = (p, l, n) => l.has(p) || er("Cannot " + n);
var X = (p, l, n) => (tr(p, l, "read from private field"), n ? n.call(p) : l.get(p)), We = (p, l, n) => l.has(p) ? er("Cannot add the same private member more than once") : l instanceof WeakSet ? l.add(p) : l.set(p, n), ze = (p, l, n, t) => (tr(p, l, "write to private field"), t ? t.call(p, n) : l.set(p, n), n);
const rr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Fo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), nr = {
  LEFT: "Left",
  RIGHT: "Right"
}, or = {
  PALMAR: "Palmar",
  DORSAL: "Dorsal"
};
class G extends Error {
  constructor(n, t) {
    super(n);
    Ne(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(n) {
  }
  static fromCameraError(n) {
    if (this.logError(n), n instanceof G)
      return n;
    let t;
    switch (n.name) {
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
    return new G(t, n);
  }
  static fromError(n) {
    if (this.logError(n), n instanceof G)
      return n;
    const t = "An unexpected error has occurred";
    return new G(t);
  }
}
const _o = {
  RGBA: "RGBA"
}, Lo = {
  0: nr.LEFT,
  1: nr.RIGHT
}, Mo = {
  0: or.PALMAR,
  1: or.DORSAL
};
var le, fe, Oe;
class Ro {
  constructor(l, n) {
    We(this, le);
    We(this, fe);
    We(this, Oe);
    ze(this, le, l), ze(this, fe, this.allocate(n.length * n.BYTES_PER_ELEMENT)), ze(this, Oe, this.allocate(n.length * n.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return X(this, fe);
  }
  get bgr0ImagePointer() {
    return X(this, Oe);
  }
  allocate(l) {
    return X(this, le)._malloc(l);
  }
  free() {
    X(this, le)._free(X(this, fe)), X(this, le)._free(X(this, Oe));
  }
  writeDataToMemory(l) {
    X(this, le).HEAPU8.set(l, X(this, fe));
  }
}
le = new WeakMap(), fe = new WeakMap(), Oe = new WeakMap();
class xo {
  constructor() {
    Ne(this, "samWasmModule");
  }
  getOverriddenModules(l, n) {
    return {
      locateFile: (t) => new URL(n || t, l).href
    };
  }
  async handleMissingOrInvalidSamModule(l, n) {
    try {
      const t = await fetch(l);
      if (!t.ok)
        throw new G(
          `The path to ${n} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${l}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new G(
          `The provided ${n} is not a valid WASM module. Please check provided path to wasm files. Current path is ${l}`
        );
    } catch (t) {
      if (t instanceof G)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Fo() ? rr.simd : rr.sam;
  }
  async initSamModule(l, n) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(n, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(l, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new G("Could not init detector.");
    }
  }
  terminateSamModule() {
    var l;
    (l = this.samWasmModule) == null || l.terminate();
  }
  async getSamVersion() {
    var n;
    const l = await ((n = this.samWasmModule) == null ? void 0 : n.getInfoString());
    return l == null ? void 0 : l.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(l) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const n = new Ro(this.samWasmModule, l);
    return n.writeDataToMemory(l), n;
  }
  convertToSamColorImage(l, n) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(l);
    return this.samWasmModule.convertToSamColorImage(
      n.width,
      n.height,
      t.rgbaImagePointer,
      _o.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetection(l, n) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(l, n), { height: e, width: r, x: o, y: u } = await this.samWasmModule.selectOptimalRegionForCompressionDetection(
      n.width,
      n.height,
      t.bgr0ImagePointer
    );
    return t.free(), {
      height: e,
      width: r,
      shiftX: o,
      shiftY: u
    };
  }
}
const Ve = (p, l) => Math.hypot(l.x - p.x, l.y - p.y), No = (p) => {
  const { bottomLeft: l, bottomRight: n, topLeft: t, topRight: e } = p, r = Ve(t, e), o = Ve(e, n), u = Ve(l, n), a = Ve(t, l);
  return Math.min(r, o, u, a);
};
var be = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, ir = {}, ot = {}, it, ar;
function Wo() {
  if (ar) return it;
  ar = 1, it = p;
  function p(l, n) {
    for (var t = new Array(arguments.length - 1), e = 0, r = 2, o = !0; r < arguments.length; )
      t[e++] = arguments[r++];
    return new Promise(function(u, a) {
      t[e] = function(g) {
        if (o)
          if (o = !1, g)
            a(g);
          else {
            for (var S = new Array(arguments.length - 1), y = 0; y < S.length; )
              S[y++] = arguments[y];
            u.apply(null, S);
          }
      };
      try {
        l.apply(n || null, t);
      } catch (g) {
        o && (o = !1, a(g));
      }
    });
  }
  return it;
}
var sr = {}, lr;
function zo() {
  return lr || (lr = 1, function(p) {
    var l = p;
    l.length = function(o) {
      var u = o.length;
      if (!u)
        return 0;
      for (var a = 0; --u % 4 > 1 && o.charAt(u) === "="; )
        ++a;
      return Math.ceil(o.length * 3) / 4 - a;
    };
    for (var n = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[n[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    l.encode = function(o, u, a) {
      for (var g = null, S = [], y = 0, P = 0, I; u < a; ) {
        var j = o[u++];
        switch (P) {
          case 0:
            S[y++] = n[j >> 2], I = (j & 3) << 4, P = 1;
            break;
          case 1:
            S[y++] = n[I | j >> 4], I = (j & 15) << 2, P = 2;
            break;
          case 2:
            S[y++] = n[I | j >> 6], S[y++] = n[j & 63], P = 0;
            break;
        }
        y > 8191 && ((g || (g = [])).push(String.fromCharCode.apply(String, S)), y = 0);
      }
      return P && (S[y++] = n[I], S[y++] = 61, P === 1 && (S[y++] = 61)), g ? (y && g.push(String.fromCharCode.apply(String, S.slice(0, y))), g.join("")) : String.fromCharCode.apply(String, S.slice(0, y));
    };
    var r = "invalid encoding";
    l.decode = function(o, u, a) {
      for (var g = a, S = 0, y, P = 0; P < o.length; ) {
        var I = o.charCodeAt(P++);
        if (I === 61 && S > 1)
          break;
        if ((I = t[I]) === void 0)
          throw Error(r);
        switch (S) {
          case 0:
            y = I, S = 1;
            break;
          case 1:
            u[a++] = y << 2 | (I & 48) >> 4, y = I, S = 2;
            break;
          case 2:
            u[a++] = (y & 15) << 4 | (I & 60) >> 2, y = I, S = 3;
            break;
          case 3:
            u[a++] = (y & 3) << 6 | I, S = 0;
            break;
        }
      }
      if (S === 1)
        throw Error(r);
      return a - g;
    }, l.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  }(sr)), sr;
}
var at, cr;
function Vo() {
  if (cr) return at;
  cr = 1, at = p;
  function p() {
    this._listeners = {};
  }
  return p.prototype.on = function(l, n, t) {
    return (this._listeners[l] || (this._listeners[l] = [])).push({
      fn: n,
      ctx: t || this
    }), this;
  }, p.prototype.off = function(l, n) {
    if (l === void 0)
      this._listeners = {};
    else if (n === void 0)
      this._listeners[l] = [];
    else
      for (var t = this._listeners[l], e = 0; e < t.length; )
        t[e].fn === n ? t.splice(e, 1) : ++e;
    return this;
  }, p.prototype.emit = function(l) {
    var n = this._listeners[l];
    if (n) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < n.length; )
        n[e].fn.apply(n[e++].ctx, t);
    }
    return this;
  }, at;
}
var st, ur;
function Uo() {
  if (ur) return st;
  ur = 1, st = p(p);
  function p(r) {
    return typeof Float32Array < "u" ? function() {
      var o = new Float32Array([-0]), u = new Uint8Array(o.buffer), a = u[3] === 128;
      function g(I, j, F) {
        o[0] = I, j[F] = u[0], j[F + 1] = u[1], j[F + 2] = u[2], j[F + 3] = u[3];
      }
      function S(I, j, F) {
        o[0] = I, j[F] = u[3], j[F + 1] = u[2], j[F + 2] = u[1], j[F + 3] = u[0];
      }
      r.writeFloatLE = a ? g : S, r.writeFloatBE = a ? S : g;
      function y(I, j) {
        return u[0] = I[j], u[1] = I[j + 1], u[2] = I[j + 2], u[3] = I[j + 3], o[0];
      }
      function P(I, j) {
        return u[3] = I[j], u[2] = I[j + 1], u[1] = I[j + 2], u[0] = I[j + 3], o[0];
      }
      r.readFloatLE = a ? y : P, r.readFloatBE = a ? P : y;
    }() : function() {
      function o(a, g, S, y) {
        var P = g < 0 ? 1 : 0;
        if (P && (g = -g), g === 0)
          a(1 / g > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), S, y);
        else if (isNaN(g))
          a(2143289344, S, y);
        else if (g > 34028234663852886e22)
          a((P << 31 | 2139095040) >>> 0, S, y);
        else if (g < 11754943508222875e-54)
          a((P << 31 | Math.round(g / 1401298464324817e-60)) >>> 0, S, y);
        else {
          var I = Math.floor(Math.log(g) / Math.LN2), j = Math.round(g * Math.pow(2, -I) * 8388608) & 8388607;
          a((P << 31 | I + 127 << 23 | j) >>> 0, S, y);
        }
      }
      r.writeFloatLE = o.bind(null, l), r.writeFloatBE = o.bind(null, n);
      function u(a, g, S) {
        var y = a(g, S), P = (y >> 31) * 2 + 1, I = y >>> 23 & 255, j = y & 8388607;
        return I === 255 ? j ? NaN : P * (1 / 0) : I === 0 ? P * 1401298464324817e-60 * j : P * Math.pow(2, I - 150) * (j + 8388608);
      }
      r.readFloatLE = u.bind(null, t), r.readFloatBE = u.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var o = new Float64Array([-0]), u = new Uint8Array(o.buffer), a = u[7] === 128;
      function g(I, j, F) {
        o[0] = I, j[F] = u[0], j[F + 1] = u[1], j[F + 2] = u[2], j[F + 3] = u[3], j[F + 4] = u[4], j[F + 5] = u[5], j[F + 6] = u[6], j[F + 7] = u[7];
      }
      function S(I, j, F) {
        o[0] = I, j[F] = u[7], j[F + 1] = u[6], j[F + 2] = u[5], j[F + 3] = u[4], j[F + 4] = u[3], j[F + 5] = u[2], j[F + 6] = u[1], j[F + 7] = u[0];
      }
      r.writeDoubleLE = a ? g : S, r.writeDoubleBE = a ? S : g;
      function y(I, j) {
        return u[0] = I[j], u[1] = I[j + 1], u[2] = I[j + 2], u[3] = I[j + 3], u[4] = I[j + 4], u[5] = I[j + 5], u[6] = I[j + 6], u[7] = I[j + 7], o[0];
      }
      function P(I, j) {
        return u[7] = I[j], u[6] = I[j + 1], u[5] = I[j + 2], u[4] = I[j + 3], u[3] = I[j + 4], u[2] = I[j + 5], u[1] = I[j + 6], u[0] = I[j + 7], o[0];
      }
      r.readDoubleLE = a ? y : P, r.readDoubleBE = a ? P : y;
    }() : function() {
      function o(a, g, S, y, P, I) {
        var j = y < 0 ? 1 : 0;
        if (j && (y = -y), y === 0)
          a(0, P, I + g), a(1 / y > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), P, I + S);
        else if (isNaN(y))
          a(0, P, I + g), a(2146959360, P, I + S);
        else if (y > 17976931348623157e292)
          a(0, P, I + g), a((j << 31 | 2146435072) >>> 0, P, I + S);
        else {
          var F;
          if (y < 22250738585072014e-324)
            F = y / 5e-324, a(F >>> 0, P, I + g), a((j << 31 | F / 4294967296) >>> 0, P, I + S);
          else {
            var O = Math.floor(Math.log(y) / Math.LN2);
            O === 1024 && (O = 1023), F = y * Math.pow(2, -O), a(F * 4503599627370496 >>> 0, P, I + g), a((j << 31 | O + 1023 << 20 | F * 1048576 & 1048575) >>> 0, P, I + S);
          }
        }
      }
      r.writeDoubleLE = o.bind(null, l, 0, 4), r.writeDoubleBE = o.bind(null, n, 4, 0);
      function u(a, g, S, y, P) {
        var I = a(y, P + g), j = a(y, P + S), F = (j >> 31) * 2 + 1, O = j >>> 20 & 2047, D = 4294967296 * (j & 1048575) + I;
        return O === 2047 ? D ? NaN : F * (1 / 0) : O === 0 ? F * 5e-324 * D : F * Math.pow(2, O - 1075) * (D + 4503599627370496);
      }
      r.readDoubleLE = u.bind(null, t, 0, 4), r.readDoubleBE = u.bind(null, e, 4, 0);
    }(), r;
  }
  function l(r, o, u) {
    o[u] = r & 255, o[u + 1] = r >>> 8 & 255, o[u + 2] = r >>> 16 & 255, o[u + 3] = r >>> 24;
  }
  function n(r, o, u) {
    o[u] = r >>> 24, o[u + 1] = r >>> 16 & 255, o[u + 2] = r >>> 8 & 255, o[u + 3] = r & 255;
  }
  function t(r, o) {
    return (r[o] | r[o + 1] << 8 | r[o + 2] << 16 | r[o + 3] << 24) >>> 0;
  }
  function e(r, o) {
    return (r[o] << 24 | r[o + 1] << 16 | r[o + 2] << 8 | r[o + 3]) >>> 0;
  }
  return st;
}
function dr(p) {
  throw new Error('Could not dynamically require "' + p + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var lt, fr;
function Go() {
  if (fr) return lt;
  fr = 1, lt = p;
  function p(l) {
    try {
      if (typeof dr != "function")
        return null;
      var n = dr(l);
      return n && (n.length || Object.keys(n).length) ? n : null;
    } catch {
      return null;
    }
  }
  return lt;
}
var pr = {}, mr;
function $o() {
  return mr || (mr = 1, function(p) {
    var l = p;
    l.length = function(n) {
      for (var t = 0, e = 0, r = 0; r < n.length; ++r)
        e = n.charCodeAt(r), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (n.charCodeAt(r + 1) & 64512) === 56320 ? (++r, t += 4) : t += 3;
      return t;
    }, l.read = function(n, t, e) {
      var r = e - t;
      if (r < 1)
        return "";
      for (var o = null, u = [], a = 0, g; t < e; )
        g = n[t++], g < 128 ? u[a++] = g : g > 191 && g < 224 ? u[a++] = (g & 31) << 6 | n[t++] & 63 : g > 239 && g < 365 ? (g = ((g & 7) << 18 | (n[t++] & 63) << 12 | (n[t++] & 63) << 6 | n[t++] & 63) - 65536, u[a++] = 55296 + (g >> 10), u[a++] = 56320 + (g & 1023)) : u[a++] = (g & 15) << 12 | (n[t++] & 63) << 6 | n[t++] & 63, a > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, u)), a = 0);
      return o ? (a && o.push(String.fromCharCode.apply(String, u.slice(0, a))), o.join("")) : String.fromCharCode.apply(String, u.slice(0, a));
    }, l.write = function(n, t, e) {
      for (var r = e, o, u, a = 0; a < n.length; ++a)
        o = n.charCodeAt(a), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((u = n.charCodeAt(a + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (u & 1023), ++a, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - r;
    };
  }(pr)), pr;
}
var ct, yr;
function Bo() {
  if (yr) return ct;
  yr = 1, ct = p;
  function p(l, n, t) {
    var e = t || 8192, r = e >>> 1, o = null, u = e;
    return function(a) {
      if (a < 1 || a > r)
        return l(a);
      u + a > e && (o = l(e), u = 0);
      var g = n.call(o, u, u += a);
      return u & 7 && (u = (u | 7) + 1), g;
    };
  }
  return ct;
}
var ut, hr;
function Ho() {
  if (hr) return ut;
  hr = 1, ut = l;
  var p = pe();
  function l(r, o) {
    this.lo = r >>> 0, this.hi = o >>> 0;
  }
  var n = l.zero = new l(0, 0);
  n.toNumber = function() {
    return 0;
  }, n.zzEncode = n.zzDecode = function() {
    return this;
  }, n.length = function() {
    return 1;
  };
  var t = l.zeroHash = "\0\0\0\0\0\0\0\0";
  l.fromNumber = function(r) {
    if (r === 0)
      return n;
    var o = r < 0;
    o && (r = -r);
    var u = r >>> 0, a = (r - u) / 4294967296 >>> 0;
    return o && (a = ~a >>> 0, u = ~u >>> 0, ++u > 4294967295 && (u = 0, ++a > 4294967295 && (a = 0))), new l(u, a);
  }, l.from = function(r) {
    if (typeof r == "number")
      return l.fromNumber(r);
    if (p.isString(r))
      if (p.Long)
        r = p.Long.fromString(r);
      else
        return l.fromNumber(parseInt(r, 10));
    return r.low || r.high ? new l(r.low >>> 0, r.high >>> 0) : n;
  }, l.prototype.toNumber = function(r) {
    if (!r && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, u = ~this.hi >>> 0;
      return o || (u = u + 1 >>> 0), -(o + u * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, l.prototype.toLong = function(r) {
    return p.Long ? new p.Long(this.lo | 0, this.hi | 0, !!r) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!r };
  };
  var e = String.prototype.charCodeAt;
  return l.fromHash = function(r) {
    return r === t ? n : new l(
      (e.call(r, 0) | e.call(r, 1) << 8 | e.call(r, 2) << 16 | e.call(r, 3) << 24) >>> 0,
      (e.call(r, 4) | e.call(r, 5) << 8 | e.call(r, 6) << 16 | e.call(r, 7) << 24) >>> 0
    );
  }, l.prototype.toHash = function() {
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
  }, l.prototype.zzEncode = function() {
    var r = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ r) >>> 0, this.lo = (this.lo << 1 ^ r) >>> 0, this;
  }, l.prototype.zzDecode = function() {
    var r = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ r) >>> 0, this.hi = (this.hi >>> 1 ^ r) >>> 0, this;
  }, l.prototype.length = function() {
    var r = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, u = this.hi >>> 24;
    return u === 0 ? o === 0 ? r < 16384 ? r < 128 ? 1 : 2 : r < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : u < 128 ? 9 : 10;
  }, ut;
}
var gr;
function pe() {
  return gr || (gr = 1, function(p) {
    var l = p;
    l.asPromise = Wo(), l.base64 = zo(), l.EventEmitter = Vo(), l.float = Uo(), l.inquire = Go(), l.utf8 = $o(), l.pool = Bo(), l.LongBits = Ho(), l.isNode = !!(typeof be < "u" && be && be.process && be.process.versions && be.process.versions.node), l.global = l.isNode && be || typeof window < "u" && window || typeof self < "u" && self || ot, l.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), l.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), l.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, l.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, l.isObject = function(e) {
      return e && typeof e == "object";
    }, l.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    l.isSet = function(e, r) {
      var o = e[r];
      return o != null && e.hasOwnProperty(r) ? typeof o != "object" || (Array.isArray(o) ? o.length : Object.keys(o).length) > 0 : !1;
    }, l.Buffer = function() {
      try {
        var e = l.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), l._Buffer_from = null, l._Buffer_allocUnsafe = null, l.newBuffer = function(e) {
      return typeof e == "number" ? l.Buffer ? l._Buffer_allocUnsafe(e) : new l.Array(e) : l.Buffer ? l._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, l.Array = typeof Uint8Array < "u" ? Uint8Array : Array, l.Long = /* istanbul ignore next */
    l.global.dcodeIO && /* istanbul ignore next */
    l.global.dcodeIO.Long || /* istanbul ignore next */
    l.global.Long || l.inquire("long"), l.key2Re = /^true|false|0|1$/, l.key32Re = /^-?(?:0|[1-9][0-9]*)$/, l.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, l.longToHash = function(e) {
      return e ? l.LongBits.from(e).toHash() : l.LongBits.zeroHash;
    }, l.longFromHash = function(e, r) {
      var o = l.LongBits.fromHash(e);
      return l.Long ? l.Long.fromBits(o.lo, o.hi, r) : o.toNumber(!!r);
    };
    function n(e, r, o) {
      for (var u = Object.keys(r), a = 0; a < u.length; ++a)
        (e[u[a]] === void 0 || !o) && (e[u[a]] = r[u[a]]);
      return e;
    }
    l.merge = n, l.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function r(o, u) {
        if (!(this instanceof r))
          return new r(o, u);
        Object.defineProperty(this, "message", { get: function() {
          return o;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, r) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), u && n(this, u);
      }
      return r.prototype = Object.create(Error.prototype, {
        constructor: {
          value: r,
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
      }), r;
    }
    l.newError = t, l.ProtocolError = t("ProtocolError"), l.oneOfGetter = function(e) {
      for (var r = {}, o = 0; o < e.length; ++o)
        r[e[o]] = 1;
      return function() {
        for (var u = Object.keys(this), a = u.length - 1; a > -1; --a)
          if (r[u[a]] === 1 && this[u[a]] !== void 0 && this[u[a]] !== null)
            return u[a];
      };
    }, l.oneOfSetter = function(e) {
      return function(r) {
        for (var o = 0; o < e.length; ++o)
          e[o] !== r && delete this[e[o]];
      };
    }, l.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, l._configure = function() {
      var e = l.Buffer;
      if (!e) {
        l._Buffer_from = l._Buffer_allocUnsafe = null;
        return;
      }
      l._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(r, o) {
        return new e(r, o);
      }, l._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(r) {
        return new e(r);
      };
    };
  }(ot)), ot;
}
var dt, br;
function Er() {
  if (br) return dt;
  br = 1, dt = a;
  var p = pe(), l, n = p.LongBits, t = p.base64, e = p.utf8;
  function r(O, D, M) {
    this.fn = O, this.len = D, this.next = void 0, this.val = M;
  }
  function o() {
  }
  function u(O) {
    this.head = O.head, this.tail = O.tail, this.len = O.len, this.next = O.states;
  }
  function a() {
    this.len = 0, this.head = new r(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var g = function() {
    return p.Buffer ? function() {
      return (a.create = function() {
        return new l();
      })();
    } : function() {
      return new a();
    };
  };
  a.create = g(), a.alloc = function(O) {
    return new p.Array(O);
  }, p.Array !== Array && (a.alloc = p.pool(a.alloc, p.Array.prototype.subarray)), a.prototype._push = function(O, D, M) {
    return this.tail = this.tail.next = new r(O, D, M), this.len += D, this;
  };
  function S(O, D, M) {
    D[M] = O & 255;
  }
  function y(O, D, M) {
    for (; O > 127; )
      D[M++] = O & 127 | 128, O >>>= 7;
    D[M] = O;
  }
  function P(O, D) {
    this.len = O, this.next = void 0, this.val = D;
  }
  P.prototype = Object.create(r.prototype), P.prototype.fn = y, a.prototype.uint32 = function(O) {
    return this.len += (this.tail = this.tail.next = new P(
      (O = O >>> 0) < 128 ? 1 : O < 16384 ? 2 : O < 2097152 ? 3 : O < 268435456 ? 4 : 5,
      O
    )).len, this;
  }, a.prototype.int32 = function(O) {
    return O < 0 ? this._push(I, 10, n.fromNumber(O)) : this.uint32(O);
  }, a.prototype.sint32 = function(O) {
    return this.uint32((O << 1 ^ O >> 31) >>> 0);
  };
  function I(O, D, M) {
    for (; O.hi; )
      D[M++] = O.lo & 127 | 128, O.lo = (O.lo >>> 7 | O.hi << 25) >>> 0, O.hi >>>= 7;
    for (; O.lo > 127; )
      D[M++] = O.lo & 127 | 128, O.lo = O.lo >>> 7;
    D[M++] = O.lo;
  }
  a.prototype.uint64 = function(O) {
    var D = n.from(O);
    return this._push(I, D.length(), D);
  }, a.prototype.int64 = a.prototype.uint64, a.prototype.sint64 = function(O) {
    var D = n.from(O).zzEncode();
    return this._push(I, D.length(), D);
  }, a.prototype.bool = function(O) {
    return this._push(S, 1, O ? 1 : 0);
  };
  function j(O, D, M) {
    D[M] = O & 255, D[M + 1] = O >>> 8 & 255, D[M + 2] = O >>> 16 & 255, D[M + 3] = O >>> 24;
  }
  a.prototype.fixed32 = function(O) {
    return this._push(j, 4, O >>> 0);
  }, a.prototype.sfixed32 = a.prototype.fixed32, a.prototype.fixed64 = function(O) {
    var D = n.from(O);
    return this._push(j, 4, D.lo)._push(j, 4, D.hi);
  }, a.prototype.sfixed64 = a.prototype.fixed64, a.prototype.float = function(O) {
    return this._push(p.float.writeFloatLE, 4, O);
  }, a.prototype.double = function(O) {
    return this._push(p.float.writeDoubleLE, 8, O);
  };
  var F = p.Array.prototype.set ? function(O, D, M) {
    D.set(O, M);
  } : function(O, D, M) {
    for (var Q = 0; Q < O.length; ++Q)
      D[M + Q] = O[Q];
  };
  return a.prototype.bytes = function(O) {
    var D = O.length >>> 0;
    if (!D)
      return this._push(S, 1, 0);
    if (p.isString(O)) {
      var M = a.alloc(D = t.length(O));
      t.decode(O, M, 0), O = M;
    }
    return this.uint32(D)._push(F, D, O);
  }, a.prototype.string = function(O) {
    var D = e.length(O);
    return D ? this.uint32(D)._push(e.write, D, O) : this._push(S, 1, 0);
  }, a.prototype.fork = function() {
    return this.states = new u(this), this.head = this.tail = new r(o, 0, 0), this.len = 0, this;
  }, a.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new r(o, 0, 0), this.len = 0), this;
  }, a.prototype.ldelim = function() {
    var O = this.head, D = this.tail, M = this.len;
    return this.reset().uint32(M), M && (this.tail.next = O.next, this.tail = D, this.len += M), this;
  }, a.prototype.finish = function() {
    for (var O = this.head.next, D = this.constructor.alloc(this.len), M = 0; O; )
      O.fn(O.val, D, M), M += O.len, O = O.next;
    return D;
  }, a._configure = function(O) {
    l = O, a.create = g(), l._configure();
  }, dt;
}
var ft, vr;
function Yo() {
  if (vr) return ft;
  vr = 1, ft = n;
  var p = Er();
  (n.prototype = Object.create(p.prototype)).constructor = n;
  var l = pe();
  function n() {
    p.call(this);
  }
  n._configure = function() {
    n.alloc = l._Buffer_allocUnsafe, n.writeBytesBuffer = l.Buffer && l.Buffer.prototype instanceof Uint8Array && l.Buffer.prototype.set.name === "set" ? function(e, r, o) {
      r.set(e, o);
    } : function(e, r, o) {
      if (e.copy)
        e.copy(r, o, 0, e.length);
      else for (var u = 0; u < e.length; )
        r[o++] = e[u++];
    };
  }, n.prototype.bytes = function(e) {
    l.isString(e) && (e = l._Buffer_from(e, "base64"));
    var r = e.length >>> 0;
    return this.uint32(r), r && this._push(n.writeBytesBuffer, r, e), this;
  };
  function t(e, r, o) {
    e.length < 40 ? l.utf8.write(e, r, o) : r.utf8Write ? r.utf8Write(e, o) : r.write(e, o);
  }
  return n.prototype.string = function(e) {
    var r = l.Buffer.byteLength(e);
    return this.uint32(r), r && this._push(t, r, e), this;
  }, n._configure(), ft;
}
var pt, Or;
function Fr() {
  if (Or) return pt;
  Or = 1, pt = r;
  var p = pe(), l, n = p.LongBits, t = p.utf8;
  function e(y, P) {
    return RangeError("index out of range: " + y.pos + " + " + (P || 1) + " > " + y.len);
  }
  function r(y) {
    this.buf = y, this.pos = 0, this.len = y.length;
  }
  var o = typeof Uint8Array < "u" ? function(y) {
    if (y instanceof Uint8Array || Array.isArray(y))
      return new r(y);
    throw Error("illegal buffer");
  } : function(y) {
    if (Array.isArray(y))
      return new r(y);
    throw Error("illegal buffer");
  }, u = function() {
    return p.Buffer ? function(y) {
      return (r.create = function(P) {
        return p.Buffer.isBuffer(P) ? new l(P) : o(P);
      })(y);
    } : o;
  };
  r.create = u(), r.prototype._slice = p.Array.prototype.subarray || /* istanbul ignore next */
  p.Array.prototype.slice, r.prototype.uint32 = /* @__PURE__ */ function() {
    var y = 4294967295;
    return function() {
      if (y = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (y = (y | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (y = (y | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (y = (y | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (y = (y | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return y;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return y;
    };
  }(), r.prototype.int32 = function() {
    return this.uint32() | 0;
  }, r.prototype.sint32 = function() {
    var y = this.uint32();
    return y >>> 1 ^ -(y & 1) | 0;
  };
  function a() {
    var y = new n(0, 0), P = 0;
    if (this.len - this.pos > 4) {
      for (; P < 4; ++P)
        if (y.lo = (y.lo | (this.buf[this.pos] & 127) << P * 7) >>> 0, this.buf[this.pos++] < 128)
          return y;
      if (y.lo = (y.lo | (this.buf[this.pos] & 127) << 28) >>> 0, y.hi = (y.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return y;
      P = 0;
    } else {
      for (; P < 3; ++P) {
        if (this.pos >= this.len)
          throw e(this);
        if (y.lo = (y.lo | (this.buf[this.pos] & 127) << P * 7) >>> 0, this.buf[this.pos++] < 128)
          return y;
      }
      return y.lo = (y.lo | (this.buf[this.pos++] & 127) << P * 7) >>> 0, y;
    }
    if (this.len - this.pos > 4) {
      for (; P < 5; ++P)
        if (y.hi = (y.hi | (this.buf[this.pos] & 127) << P * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return y;
    } else
      for (; P < 5; ++P) {
        if (this.pos >= this.len)
          throw e(this);
        if (y.hi = (y.hi | (this.buf[this.pos] & 127) << P * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return y;
      }
    throw Error("invalid varint encoding");
  }
  r.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function g(y, P) {
    return (y[P - 4] | y[P - 3] << 8 | y[P - 2] << 16 | y[P - 1] << 24) >>> 0;
  }
  r.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return g(this.buf, this.pos += 4);
  }, r.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return g(this.buf, this.pos += 4) | 0;
  };
  function S() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new n(g(this.buf, this.pos += 4), g(this.buf, this.pos += 4));
  }
  return r.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var y = p.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, y;
  }, r.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var y = p.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, y;
  }, r.prototype.bytes = function() {
    var y = this.uint32(), P = this.pos, I = this.pos + y;
    if (I > this.len)
      throw e(this, y);
    if (this.pos += y, Array.isArray(this.buf))
      return this.buf.slice(P, I);
    if (P === I) {
      var j = p.Buffer;
      return j ? j.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, P, I);
  }, r.prototype.string = function() {
    var y = this.bytes();
    return t.read(y, 0, y.length);
  }, r.prototype.skip = function(y) {
    if (typeof y == "number") {
      if (this.pos + y > this.len)
        throw e(this, y);
      this.pos += y;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, r.prototype.skipType = function(y) {
    switch (y) {
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
        for (; (y = this.uint32() & 7) !== 4; )
          this.skipType(y);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + y + " at offset " + this.pos);
    }
    return this;
  }, r._configure = function(y) {
    l = y, r.create = u(), l._configure();
    var P = p.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    p.merge(r.prototype, {
      int64: function() {
        return a.call(this)[P](!1);
      },
      uint64: function() {
        return a.call(this)[P](!0);
      },
      sint64: function() {
        return a.call(this).zzDecode()[P](!1);
      },
      fixed64: function() {
        return S.call(this)[P](!0);
      },
      sfixed64: function() {
        return S.call(this)[P](!1);
      }
    });
  }, pt;
}
var mt, wr;
function Jo() {
  if (wr) return mt;
  wr = 1, mt = n;
  var p = Fr();
  (n.prototype = Object.create(p.prototype)).constructor = n;
  var l = pe();
  function n(t) {
    p.call(this, t);
  }
  return n._configure = function() {
    l.Buffer && (n.prototype._slice = l.Buffer.prototype.slice);
  }, n.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, n._configure(), mt;
}
var Pr = {}, yt, Ir;
function Zo() {
  if (Ir) return yt;
  Ir = 1, yt = l;
  var p = pe();
  (l.prototype = Object.create(p.EventEmitter.prototype)).constructor = l;
  function l(n, t, e) {
    if (typeof n != "function")
      throw TypeError("rpcImpl must be a function");
    p.EventEmitter.call(this), this.rpcImpl = n, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return l.prototype.rpcCall = function n(t, e, r, o, u) {
    if (!o)
      throw TypeError("request must be specified");
    var a = this;
    if (!u)
      return p.asPromise(n, a, t, e, r, o);
    if (!a.rpcImpl) {
      setTimeout(function() {
        u(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return a.rpcImpl(
        t,
        e[a.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(g, S) {
          if (g)
            return a.emit("error", g, t), u(g);
          if (S === null) {
            a.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(S instanceof r))
            try {
              S = r[a.responseDelimited ? "decodeDelimited" : "decode"](S);
            } catch (y) {
              return a.emit("error", y, t), u(y);
            }
          return a.emit("data", S, t), u(null, S);
        }
      );
    } catch (g) {
      a.emit("error", g, t), setTimeout(function() {
        u(g);
      }, 0);
      return;
    }
  }, l.prototype.end = function(n) {
    return this.rpcImpl && (n || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, yt;
}
var jr;
function Ko() {
  return jr || (jr = 1, function(p) {
    var l = p;
    l.Service = Zo();
  }(Pr)), Pr;
}
var Cr, Sr;
function qo() {
  return Sr || (Sr = 1, Cr = {}), Cr;
}
var Ar;
function Xo() {
  return Ar || (Ar = 1, function(p) {
    var l = p;
    l.build = "minimal", l.Writer = Er(), l.BufferWriter = Yo(), l.Reader = Fr(), l.BufferReader = Jo(), l.util = pe(), l.rpc = Ko(), l.roots = qo(), l.configure = n;
    function n() {
      l.util._configure(), l.Writer._configure(l.BufferWriter), l.Reader._configure(l.BufferReader);
    }
    n();
  }(ir)), ir;
}
var Dr, kr;
function Qo() {
  return kr || (kr = 1, Dr = Xo()), Dr;
}
var E = Qo();
const h = E.Reader, L = E.Writer, d = E.util, i = E.roots.default || (E.roots.default = {});
i.dot = (() => {
  const p = {};
  return p.Content = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.token = d.newBuffer([]), l.prototype.iv = d.newBuffer([]), l.prototype.schemaVersion = 0, l.prototype.bytes = d.newBuffer([]), l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.token != null && Object.hasOwnProperty.call(n, "token") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.token), n.iv != null && Object.hasOwnProperty.call(n, "iv") && t.uint32(
        /* id 2, wireType 2 =*/
        18
      ).bytes(n.iv), n.schemaVersion != null && Object.hasOwnProperty.call(n, "schemaVersion") && t.uint32(
        /* id 3, wireType 0 =*/
        24
      ).int32(n.schemaVersion), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 4, wireType 2 =*/
        34
      ).bytes(n.bytes), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Content();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.token = n.bytes();
            break;
          }
          case 2: {
            o.iv = n.bytes();
            break;
          }
          case 3: {
            o.schemaVersion = n.int32();
            break;
          }
          case 4: {
            o.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.token != null && n.hasOwnProperty("token") && !(n.token && typeof n.token.length == "number" || d.isString(n.token)) ? "token: buffer expected" : n.iv != null && n.hasOwnProperty("iv") && !(n.iv && typeof n.iv.length == "number" || d.isString(n.iv)) ? "iv: buffer expected" : n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && !d.isInteger(n.schemaVersion) ? "schemaVersion: integer expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || d.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.Content)
        return n;
      let t = new i.dot.Content();
      return n.token != null && (typeof n.token == "string" ? d.base64.decode(n.token, t.token = d.newBuffer(d.base64.length(n.token)), 0) : n.token.length >= 0 && (t.token = n.token)), n.iv != null && (typeof n.iv == "string" ? d.base64.decode(n.iv, t.iv = d.newBuffer(d.base64.length(n.iv)), 0) : n.iv.length >= 0 && (t.iv = n.iv)), n.schemaVersion != null && (t.schemaVersion = n.schemaVersion | 0), n.bytes != null && (typeof n.bytes == "string" ? d.base64.decode(n.bytes, t.bytes = d.newBuffer(d.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = d.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = d.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), n.token != null && n.hasOwnProperty("token") && (e.token = t.bytes === String ? d.base64.encode(n.token, 0, n.token.length) : t.bytes === Array ? Array.prototype.slice.call(n.token) : n.token), n.iv != null && n.hasOwnProperty("iv") && (e.iv = t.bytes === String ? d.base64.encode(n.iv, 0, n.iv.length) : t.bytes === Array ? Array.prototype.slice.call(n.iv) : n.iv), n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && (e.schemaVersion = n.schemaVersion), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Content";
    }, l;
  }(), p.v4 = function() {
    const l = {};
    return l.MagnifEyeLivenessContent = function() {
      function n(e) {
        if (this.images = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.images = d.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.images != null && e.images.length)
          for (let o = 0; o < e.images.length; ++o)
            i.dot.Image.encode(e.images[o], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.images && a.images.length || (a.images = []), a.images.push(i.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.images != null && e.hasOwnProperty("images")) {
          if (!Array.isArray(e.images))
            return "images: array expected";
          for (let r = 0; r < e.images.length; ++r) {
            let o = i.dot.Image.verify(e.images[r]);
            if (o)
              return "images." + o;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = i.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = i.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.MagnifEyeLivenessContent)
          return e;
        let r = new i.dot.v4.MagnifEyeLivenessContent();
        if (e.images) {
          if (!Array.isArray(e.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          r.images = [];
          for (let o = 0; o < e.images.length; ++o) {
            if (typeof e.images[o] != "object")
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            r.images[o] = i.dot.Image.fromObject(e.images[o]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.video: object expected");
          r.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          r.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.images = []), r.defaults && (o.metadata = null), e.images && e.images.length) {
          o.images = [];
          for (let u = 0; u < e.images.length; ++u)
            o.images[u] = i.dot.Image.toObject(e.images[u], r);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MagnifEyeLivenessContent";
      }, n;
    }(), l.Metadata = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.platform = 0, n.prototype.sessionToken = null, n.prototype.componentVersion = "", n.prototype.web = null, n.prototype.android = null, n.prototype.ios = null;
      let t;
      return Object.defineProperty(n.prototype, "_sessionToken", {
        get: d.oneOfGetter(t = ["sessionToken"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "metadata", {
        get: d.oneOfGetter(t = ["web", "android", "ios"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && i.dot.v4.WebMetadata.encode(e.web, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && i.dot.v4.AndroidMetadata.encode(e.android, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && i.dot.v4.IosMetadata.encode(e.ios, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.sessionToken != null && Object.hasOwnProperty.call(e, "sessionToken") && r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.sessionToken), e.componentVersion != null && Object.hasOwnProperty.call(e, "componentVersion") && r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).string(e.componentVersion), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.Metadata();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.platform = e.int32();
              break;
            }
            case 5: {
              a.sessionToken = e.string();
              break;
            }
            case 6: {
              a.componentVersion = e.string();
              break;
            }
            case 2: {
              a.web = i.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.android = i.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.ios = i.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let r = {};
        if (e.platform != null && e.hasOwnProperty("platform"))
          switch (e.platform) {
            default:
              return "platform: enum value expected";
            case 0:
            case 1:
            case 2:
              break;
          }
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (r._sessionToken = 1, !d.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !d.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && e.hasOwnProperty("web")) {
          r.metadata = 1;
          {
            let o = i.dot.v4.WebMetadata.verify(e.web);
            if (o)
              return "web." + o;
          }
        }
        if (e.android != null && e.hasOwnProperty("android")) {
          if (r.metadata === 1)
            return "metadata: multiple values";
          r.metadata = 1;
          {
            let o = i.dot.v4.AndroidMetadata.verify(e.android);
            if (o)
              return "android." + o;
          }
        }
        if (e.ios != null && e.hasOwnProperty("ios")) {
          if (r.metadata === 1)
            return "metadata: multiple values";
          r.metadata = 1;
          {
            let o = i.dot.v4.IosMetadata.verify(e.ios);
            if (o)
              return "ios." + o;
          }
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.Metadata)
          return e;
        let r = new i.dot.v4.Metadata();
        switch (e.platform) {
          default:
            if (typeof e.platform == "number") {
              r.platform = e.platform;
              break;
            }
            break;
          case "WEB":
          case 0:
            r.platform = 0;
            break;
          case "ANDROID":
          case 1:
            r.platform = 1;
            break;
          case "IOS":
          case 2:
            r.platform = 2;
            break;
        }
        if (e.sessionToken != null && (r.sessionToken = String(e.sessionToken)), e.componentVersion != null && (r.componentVersion = String(e.componentVersion)), e.web != null) {
          if (typeof e.web != "object")
            throw TypeError(".dot.v4.Metadata.web: object expected");
          r.web = i.dot.v4.WebMetadata.fromObject(e.web);
        }
        if (e.android != null) {
          if (typeof e.android != "object")
            throw TypeError(".dot.v4.Metadata.android: object expected");
          r.android = i.dot.v4.AndroidMetadata.fromObject(e.android);
        }
        if (e.ios != null) {
          if (typeof e.ios != "object")
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          r.ios = i.dot.v4.IosMetadata.fromObject(e.ios);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.platform = r.enums === String ? "WEB" : 0, o.componentVersion = ""), e.platform != null && e.hasOwnProperty("platform") && (o.platform = r.enums === String ? i.dot.Platform[e.platform] === void 0 ? e.platform : i.dot.Platform[e.platform] : e.platform), e.web != null && e.hasOwnProperty("web") && (o.web = i.dot.v4.WebMetadata.toObject(e.web, r), r.oneofs && (o.metadata = "web")), e.android != null && e.hasOwnProperty("android") && (o.android = i.dot.v4.AndroidMetadata.toObject(e.android, r), r.oneofs && (o.metadata = "android")), e.ios != null && e.hasOwnProperty("ios") && (o.ios = i.dot.v4.IosMetadata.toObject(e.ios, r), r.oneofs && (o.metadata = "ios")), e.sessionToken != null && e.hasOwnProperty("sessionToken") && (o.sessionToken = e.sessionToken, r.oneofs && (o._sessionToken = "sessionToken")), e.componentVersion != null && e.hasOwnProperty("componentVersion") && (o.componentVersion = e.componentVersion), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, n;
    }(), l.AndroidMetadata = function() {
      function n(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.supportedAbis = d.emptyArray, n.prototype.device = null, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = d.emptyArray, n.prototype.digestsWithTimestamp = d.emptyArray, n.prototype.dynamicCameraFrameProperties = d.emptyObject, n.prototype.tamperingIndicators = null, n.prototype.croppedYuv420Image = null, n.prototype.yuv420ImageCrop = null;
      let t;
      return Object.defineProperty(n.prototype, "_device", {
        get: d.oneOfGetter(t = ["device"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_camera", {
        get: d.oneOfGetter(t = ["camera"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: d.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_tamperingIndicators", {
        get: d.oneOfGetter(t = ["tamperingIndicators"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: d.oneOfGetter(t = ["croppedYuv420Image"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_yuv420ImageCrop", {
        get: d.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.supportedAbis != null && e.supportedAbis.length)
          for (let o = 0; o < e.supportedAbis.length; ++o)
            r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(e.supportedAbis[o]);
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.device), e.digests != null && e.digests.length)
          for (let o = 0; o < e.digests.length; ++o)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[o]);
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties"))
          for (let o = Object.keys(e.dynamicCameraFrameProperties), u = 0; u < o.length; ++u)
            r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[u]), i.dot.Int32List.encode(e.dynamicCameraFrameProperties[o[u]], r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            i.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && i.dot.v4.AndroidCamera.encode(e.camera, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && i.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && i.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && i.dot.v4.Yuv420ImageCrop.encode(e.yuv420ImageCrop, r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.AndroidMetadata(), g, S;
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.supportedAbis && a.supportedAbis.length || (a.supportedAbis = []), a.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              a.device = e.string();
              break;
            }
            case 6: {
              a.camera = i.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.digests && a.digests.length || (a.digests = []), a.digests.push(e.bytes());
              break;
            }
            case 5: {
              a.digestsWithTimestamp && a.digestsWithTimestamp.length || (a.digestsWithTimestamp = []), a.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              a.dynamicCameraFrameProperties === d.emptyObject && (a.dynamicCameraFrameProperties = {});
              let P = e.uint32() + e.pos;
              for (g = "", S = null; e.pos < P; ) {
                let I = e.uint32();
                switch (I >>> 3) {
                  case 1:
                    g = e.string();
                    break;
                  case 2:
                    S = i.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(I & 7);
                    break;
                }
              }
              a.dynamicCameraFrameProperties[g] = S;
              break;
            }
            case 8: {
              a.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              a.croppedYuv420Image = i.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            case 10: {
              a.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let r = 0; r < e.supportedAbis.length; ++r)
            if (!d.isString(e.supportedAbis[r]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !d.isString(e.device))
          return "device: string expected";
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let r = i.dot.v4.AndroidCamera.verify(e.camera);
          if (r)
            return "camera." + r;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let r = i.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (r)
            return "detectionNormalizedRectangle." + r;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let r = 0; r < e.digests.length; ++r)
            if (!(e.digests[r] && typeof e.digests[r].length == "number" || d.isString(e.digests[r])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let r = 0; r < e.digestsWithTimestamp.length; ++r) {
            let o = i.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[r]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.dynamicCameraFrameProperties != null && e.hasOwnProperty("dynamicCameraFrameProperties")) {
          if (!d.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let r = Object.keys(e.dynamicCameraFrameProperties);
          for (let o = 0; o < r.length; ++o) {
            let u = i.dot.Int32List.verify(e.dynamicCameraFrameProperties[r[o]]);
            if (u)
              return "dynamicCameraFrameProperties." + u;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || d.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let r = i.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (r)
            return "croppedYuv420Image." + r;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let r = i.dot.v4.Yuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (r)
            return "yuv420ImageCrop." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.AndroidMetadata)
          return e;
        let r = new i.dot.v4.AndroidMetadata();
        if (e.supportedAbis) {
          if (!Array.isArray(e.supportedAbis))
            throw TypeError(".dot.v4.AndroidMetadata.supportedAbis: array expected");
          r.supportedAbis = [];
          for (let o = 0; o < e.supportedAbis.length; ++o)
            r.supportedAbis[o] = String(e.supportedAbis[o]);
        }
        if (e.device != null && (r.device = String(e.device)), e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.AndroidMetadata.camera: object expected");
          r.camera = i.dot.v4.AndroidCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          r.detectionNormalizedRectangle = i.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          r.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? d.base64.decode(e.digests[o], r.digests[o] = d.newBuffer(d.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (r.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          r.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            r.digestsWithTimestamp[o] = i.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (typeof e.dynamicCameraFrameProperties != "object")
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          r.dynamicCameraFrameProperties = {};
          for (let o = Object.keys(e.dynamicCameraFrameProperties), u = 0; u < o.length; ++u) {
            if (typeof e.dynamicCameraFrameProperties[o[u]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            r.dynamicCameraFrameProperties[o[u]] = i.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[o[u]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? d.base64.decode(e.tamperingIndicators, r.tamperingIndicators = d.newBuffer(d.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (r.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          r.croppedYuv420Image = i.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.AndroidMetadata.yuv420ImageCrop: object expected");
          r.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.supportedAbis = [], o.digests = [], o.digestsWithTimestamp = []), (r.objects || r.defaults) && (o.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          o.supportedAbis = [];
          for (let a = 0; a < e.supportedAbis.length; ++a)
            o.supportedAbis[a] = e.supportedAbis[a];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, r.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            o.digests[a] = r.bytes === String ? d.base64.encode(e.digests[a], 0, e.digests[a].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[a]) : e.digests[a];
        }
        let u;
        if (e.dynamicCameraFrameProperties && (u = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let a = 0; a < u.length; ++a)
            o.dynamicCameraFrameProperties[u[a]] = i.dot.Int32List.toObject(e.dynamicCameraFrameProperties[u[a]], r);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            o.digestsWithTimestamp[a] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[a], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.AndroidCamera.toObject(e.camera, r), r.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = r.bytes === String ? d.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : r.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, r.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, r), r.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, n;
    }(), l.AndroidCamera = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.resolution = null, n.prototype.rotationDegrees = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && i.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.AndroidCamera();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = i.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !d.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.AndroidCamera)
          return t;
        let e = new i.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          e.resolution = i.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.resolution = null, r.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (r.resolution = i.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (r.rotationDegrees = t.rotationDegrees), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, n;
    }(), l.Yuv420Image = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = d.newBuffer([]), n.prototype.uPlane = d.newBuffer([]), n.prototype.vPlane = d.newBuffer([]), n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && i.dot.ImageSize.encode(t.size, e.uint32(
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
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Yuv420Image();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.size = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.yPlane = t.bytes();
              break;
            }
            case 3: {
              u.uPlane = t.bytes();
              break;
            }
            case 4: {
              u.vPlane = t.bytes();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = i.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || d.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || d.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || d.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.Yuv420Image)
          return t;
        let e = new i.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = i.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? d.base64.decode(t.yPlane, e.yPlane = d.newBuffer(d.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? d.base64.decode(t.uPlane, e.uPlane = d.newBuffer(d.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? d.base64.decode(t.vPlane, e.vPlane = d.newBuffer(d.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.size = null, e.bytes === String ? r.yPlane = "" : (r.yPlane = [], e.bytes !== Array && (r.yPlane = d.newBuffer(r.yPlane))), e.bytes === String ? r.uPlane = "" : (r.uPlane = [], e.bytes !== Array && (r.uPlane = d.newBuffer(r.uPlane))), e.bytes === String ? r.vPlane = "" : (r.vPlane = [], e.bytes !== Array && (r.vPlane = d.newBuffer(r.vPlane)))), t.size != null && t.hasOwnProperty("size") && (r.size = i.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (r.yPlane = e.bytes === String ? d.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (r.uPlane = e.bytes === String ? d.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (r.vPlane = e.bytes === String ? d.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, n;
    }(), l.Yuv420ImageCrop = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.v4.Yuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && i.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Yuv420ImageCrop();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.image = i.dot.v4.Yuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = i.dot.v4.Yuv420Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = i.dot.PointInt.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.Yuv420ImageCrop)
          return t;
        let e = new i.dot.v4.Yuv420ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.Yuv420ImageCrop.image: object expected");
          e.image = i.dot.v4.Yuv420Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.Yuv420ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = i.dot.PointInt.fromObject(t.topLeftCorner);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.image = null, r.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (r.image = i.dot.v4.Yuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (r.topLeftCorner = i.dot.PointInt.toObject(t.topLeftCorner, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420ImageCrop";
      }, n;
    }(), l.IosMetadata = function() {
      function n(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.cameraModelId = "", n.prototype.architectureInfo = d.emptyObject, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = d.emptyArray, n.prototype.digestsWithTimestamp = d.emptyArray, n.prototype.isoValues = d.emptyArray, n.prototype.croppedYuv420Image = null, n.prototype.yuv420ImageCrop = null;
      let t;
      return Object.defineProperty(n.prototype, "_camera", {
        get: d.oneOfGetter(t = ["camera"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: d.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: d.oneOfGetter(t = ["croppedYuv420Image"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_yuv420ImageCrop", {
        get: d.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let o = Object.keys(e.architectureInfo), u = 0; u < o.length; ++u)
            r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[u]).uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(e.architectureInfo[o[u]]).ldelim();
        if (e.digests != null && e.digests.length)
          for (let o = 0; o < e.digests.length; ++o)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[o]);
        if (e.isoValues != null && e.isoValues.length) {
          r.uint32(
            /* id 4, wireType 2 =*/
            34
          ).fork();
          for (let o = 0; o < e.isoValues.length; ++o)
            r.int32(e.isoValues[o]);
          r.ldelim();
        }
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            i.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && i.dot.v4.IosCamera.encode(e.camera, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && i.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && i.dot.v4.IosYuv420Image.encode(e.croppedYuv420Image, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && i.dot.v4.IosYuv420ImageCrop.encode(e.yuv420ImageCrop, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.IosMetadata(), g, S;
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.cameraModelId = e.string();
              break;
            }
            case 2: {
              a.architectureInfo === d.emptyObject && (a.architectureInfo = {});
              let P = e.uint32() + e.pos;
              for (g = "", S = !1; e.pos < P; ) {
                let I = e.uint32();
                switch (I >>> 3) {
                  case 1:
                    g = e.string();
                    break;
                  case 2:
                    S = e.bool();
                    break;
                  default:
                    e.skipType(I & 7);
                    break;
                }
              }
              a.architectureInfo[g] = S;
              break;
            }
            case 6: {
              a.camera = i.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.digests && a.digests.length || (a.digests = []), a.digests.push(e.bytes());
              break;
            }
            case 5: {
              a.digestsWithTimestamp && a.digestsWithTimestamp.length || (a.digestsWithTimestamp = []), a.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (a.isoValues && a.isoValues.length || (a.isoValues = []), (y & 7) === 2) {
                let P = e.uint32() + e.pos;
                for (; e.pos < P; )
                  a.isoValues.push(e.int32());
              } else
                a.isoValues.push(e.int32());
              break;
            }
            case 8: {
              a.croppedYuv420Image = i.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            case 9: {
              a.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !d.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!d.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let r = Object.keys(e.architectureInfo);
          for (let o = 0; o < r.length; ++o)
            if (typeof e.architectureInfo[r[o]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let r = i.dot.v4.IosCamera.verify(e.camera);
          if (r)
            return "camera." + r;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let r = i.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (r)
            return "detectionNormalizedRectangle." + r;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let r = 0; r < e.digests.length; ++r)
            if (!(e.digests[r] && typeof e.digests[r].length == "number" || d.isString(e.digests[r])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let r = 0; r < e.digestsWithTimestamp.length; ++r) {
            let o = i.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[r]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.isoValues != null && e.hasOwnProperty("isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let r = 0; r < e.isoValues.length; ++r)
            if (!d.isInteger(e.isoValues[r]))
              return "isoValues: integer[] expected";
        }
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let r = i.dot.v4.IosYuv420Image.verify(e.croppedYuv420Image);
          if (r)
            return "croppedYuv420Image." + r;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let r = i.dot.v4.IosYuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (r)
            return "yuv420ImageCrop." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.IosMetadata)
          return e;
        let r = new i.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (r.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (typeof e.architectureInfo != "object")
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          r.architectureInfo = {};
          for (let o = Object.keys(e.architectureInfo), u = 0; u < o.length; ++u)
            r.architectureInfo[o[u]] = !!e.architectureInfo[o[u]];
        }
        if (e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          r.camera = i.dot.v4.IosCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          r.detectionNormalizedRectangle = i.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          r.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? d.base64.decode(e.digests[o], r.digests[o] = d.newBuffer(d.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (r.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          r.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            r.digestsWithTimestamp[o] = i.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.isoValues) {
          if (!Array.isArray(e.isoValues))
            throw TypeError(".dot.v4.IosMetadata.isoValues: array expected");
          r.isoValues = [];
          for (let o = 0; o < e.isoValues.length; ++o)
            r.isoValues[o] = e.isoValues[o] | 0;
        }
        if (e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.IosMetadata.croppedYuv420Image: object expected");
          r.croppedYuv420Image = i.dot.v4.IosYuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.IosMetadata.yuv420ImageCrop: object expected");
          r.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        (r.arrays || r.defaults) && (o.digests = [], o.isoValues = [], o.digestsWithTimestamp = []), (r.objects || r.defaults) && (o.architectureInfo = {}), r.defaults && (o.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (o.cameraModelId = e.cameraModelId);
        let u;
        if (e.architectureInfo && (u = Object.keys(e.architectureInfo)).length) {
          o.architectureInfo = {};
          for (let a = 0; a < u.length; ++a)
            o.architectureInfo[u[a]] = e.architectureInfo[u[a]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            o.digests[a] = r.bytes === String ? d.base64.encode(e.digests[a], 0, e.digests[a].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[a]) : e.digests[a];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let a = 0; a < e.isoValues.length; ++a)
            o.isoValues[a] = e.isoValues[a];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            o.digestsWithTimestamp[a] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[a], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.IosCamera.toObject(e.camera, r), r.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, r), r.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, n;
    }(), l.IosCamera = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.resolution = null, n.prototype.rotationDegrees = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && i.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosCamera();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = i.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !d.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosCamera)
          return t;
        let e = new i.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          e.resolution = i.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.resolution = null, r.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (r.resolution = i.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (r.rotationDegrees = t.rotationDegrees), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, n;
    }(), l.IosYuv420Image = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = d.newBuffer([]), n.prototype.uvPlane = d.newBuffer([]), n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && i.dot.ImageSize.encode(t.size, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(t.yPlane), t.uvPlane != null && Object.hasOwnProperty.call(t, "uvPlane") && e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(t.uvPlane), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosYuv420Image();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.size = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.yPlane = t.bytes();
              break;
            }
            case 3: {
              u.uvPlane = t.bytes();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = i.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || d.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uvPlane != null && t.hasOwnProperty("uvPlane") && !(t.uvPlane && typeof t.uvPlane.length == "number" || d.isString(t.uvPlane)) ? "uvPlane: buffer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosYuv420Image)
          return t;
        let e = new i.dot.v4.IosYuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.IosYuv420Image.size: object expected");
          e.size = i.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? d.base64.decode(t.yPlane, e.yPlane = d.newBuffer(d.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uvPlane != null && (typeof t.uvPlane == "string" ? d.base64.decode(t.uvPlane, e.uvPlane = d.newBuffer(d.base64.length(t.uvPlane)), 0) : t.uvPlane.length >= 0 && (e.uvPlane = t.uvPlane)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.size = null, e.bytes === String ? r.yPlane = "" : (r.yPlane = [], e.bytes !== Array && (r.yPlane = d.newBuffer(r.yPlane))), e.bytes === String ? r.uvPlane = "" : (r.uvPlane = [], e.bytes !== Array && (r.uvPlane = d.newBuffer(r.uvPlane)))), t.size != null && t.hasOwnProperty("size") && (r.size = i.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (r.yPlane = e.bytes === String ? d.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uvPlane != null && t.hasOwnProperty("uvPlane") && (r.uvPlane = e.bytes === String ? d.base64.encode(t.uvPlane, 0, t.uvPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uvPlane) : t.uvPlane), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, n;
    }(), l.IosYuv420ImageCrop = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.v4.IosYuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && i.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosYuv420ImageCrop();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.image = i.dot.v4.IosYuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = i.dot.v4.IosYuv420Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = i.dot.PointInt.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosYuv420ImageCrop)
          return t;
        let e = new i.dot.v4.IosYuv420ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.IosYuv420ImageCrop.image: object expected");
          e.image = i.dot.v4.IosYuv420Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.IosYuv420ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = i.dot.PointInt.fromObject(t.topLeftCorner);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.image = null, r.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (r.image = i.dot.v4.IosYuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (r.topLeftCorner = i.dot.PointInt.toObject(t.topLeftCorner, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420ImageCrop";
      }, n;
    }(), l.WebMetadata = function() {
      function n(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.currentCameraProperties = null, n.prototype.availableCameraProperties = d.emptyArray, n.prototype.hashedDetectedImages = d.emptyArray, n.prototype.hashedDetectedImagesWithTimestamp = d.emptyArray, n.prototype.detectionRecord = d.emptyArray, n.prototype.croppedImage = null, n.prototype.croppedImageWithPosition = null, n.prototype.platformDetails = null;
      let t;
      return Object.defineProperty(n.prototype, "_croppedImage", {
        get: d.oneOfGetter(t = ["croppedImage"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedImageWithPosition", {
        get: d.oneOfGetter(t = ["croppedImageWithPosition"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_platformDetails", {
        get: d.oneOfGetter(t = ["platformDetails"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && i.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let o = 0; o < e.availableCameraProperties.length; ++o)
            i.dot.v4.CameraProperties.encode(e.availableCameraProperties[o], r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
        if (e.hashedDetectedImages != null && e.hashedDetectedImages.length)
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(e.hashedDetectedImages[o]);
        if (e.detectionRecord != null && e.detectionRecord.length)
          for (let o = 0; o < e.detectionRecord.length; ++o)
            i.dot.v4.DetectedObject.encode(e.detectionRecord[o], r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o)
            i.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[o], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && i.dot.Image.encode(e.croppedImage, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition") && i.dot.v4.ImageCrop.encode(e.croppedImageWithPosition, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails") && i.dot.v4.PlatformDetails.encode(e.platformDetails, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.WebMetadata();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.currentCameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.availableCameraProperties && a.availableCameraProperties.length || (a.availableCameraProperties = []), a.availableCameraProperties.push(i.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              a.hashedDetectedImages && a.hashedDetectedImages.length || (a.hashedDetectedImages = []), a.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              a.hashedDetectedImagesWithTimestamp && a.hashedDetectedImagesWithTimestamp.length || (a.hashedDetectedImagesWithTimestamp = []), a.hashedDetectedImagesWithTimestamp.push(i.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              a.detectionRecord && a.detectionRecord.length || (a.detectionRecord = []), a.detectionRecord.push(i.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              a.croppedImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.croppedImageWithPosition = i.dot.v4.ImageCrop.decode(e, e.uint32());
              break;
            }
            case 8: {
              a.platformDetails = i.dot.v4.PlatformDetails.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties")) {
          let r = i.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties);
          if (r)
            return "currentCameraProperties." + r;
        }
        if (e.availableCameraProperties != null && e.hasOwnProperty("availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let r = 0; r < e.availableCameraProperties.length; ++r) {
            let o = i.dot.v4.CameraProperties.verify(e.availableCameraProperties[r]);
            if (o)
              return "availableCameraProperties." + o;
          }
        }
        if (e.hashedDetectedImages != null && e.hasOwnProperty("hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let r = 0; r < e.hashedDetectedImages.length; ++r)
            if (!d.isString(e.hashedDetectedImages[r]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && e.hasOwnProperty("hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let r = 0; r < e.hashedDetectedImagesWithTimestamp.length; ++r) {
            let o = i.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[r]);
            if (o)
              return "hashedDetectedImagesWithTimestamp." + o;
          }
        }
        if (e.detectionRecord != null && e.hasOwnProperty("detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let r = 0; r < e.detectionRecord.length; ++r) {
            let o = i.dot.v4.DetectedObject.verify(e.detectionRecord[r]);
            if (o)
              return "detectionRecord." + o;
          }
        }
        if (e.croppedImage != null && e.hasOwnProperty("croppedImage")) {
          let r = i.dot.Image.verify(e.croppedImage);
          if (r)
            return "croppedImage." + r;
        }
        if (e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition")) {
          let r = i.dot.v4.ImageCrop.verify(e.croppedImageWithPosition);
          if (r)
            return "croppedImageWithPosition." + r;
        }
        if (e.platformDetails != null && e.hasOwnProperty("platformDetails")) {
          let r = i.dot.v4.PlatformDetails.verify(e.platformDetails);
          if (r)
            return "platformDetails." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.WebMetadata)
          return e;
        let r = new i.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (typeof e.currentCameraProperties != "object")
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          r.currentCameraProperties = i.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          r.availableCameraProperties = [];
          for (let o = 0; o < e.availableCameraProperties.length; ++o) {
            if (typeof e.availableCameraProperties[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            r.availableCameraProperties[o] = i.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[o]);
          }
        }
        if (e.hashedDetectedImages) {
          if (!Array.isArray(e.hashedDetectedImages))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImages: array expected");
          r.hashedDetectedImages = [];
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            r.hashedDetectedImages[o] = String(e.hashedDetectedImages[o]);
        }
        if (e.hashedDetectedImagesWithTimestamp) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: array expected");
          r.hashedDetectedImagesWithTimestamp = [];
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o) {
            if (typeof e.hashedDetectedImagesWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: object expected");
            r.hashedDetectedImagesWithTimestamp[o] = i.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[o]);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          r.detectionRecord = [];
          for (let o = 0; o < e.detectionRecord.length; ++o) {
            if (typeof e.detectionRecord[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            r.detectionRecord[o] = i.dot.v4.DetectedObject.fromObject(e.detectionRecord[o]);
          }
        }
        if (e.croppedImage != null) {
          if (typeof e.croppedImage != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          r.croppedImage = i.dot.Image.fromObject(e.croppedImage);
        }
        if (e.croppedImageWithPosition != null) {
          if (typeof e.croppedImageWithPosition != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImageWithPosition: object expected");
          r.croppedImageWithPosition = i.dot.v4.ImageCrop.fromObject(e.croppedImageWithPosition);
        }
        if (e.platformDetails != null) {
          if (typeof e.platformDetails != "object")
            throw TypeError(".dot.v4.WebMetadata.platformDetails: object expected");
          r.platformDetails = i.dot.v4.PlatformDetails.fromObject(e.platformDetails);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.availableCameraProperties = [], o.hashedDetectedImages = [], o.detectionRecord = [], o.hashedDetectedImagesWithTimestamp = []), r.defaults && (o.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (o.currentCameraProperties = i.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, r)), e.availableCameraProperties && e.availableCameraProperties.length) {
          o.availableCameraProperties = [];
          for (let u = 0; u < e.availableCameraProperties.length; ++u)
            o.availableCameraProperties[u] = i.dot.v4.CameraProperties.toObject(e.availableCameraProperties[u], r);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          o.hashedDetectedImages = [];
          for (let u = 0; u < e.hashedDetectedImages.length; ++u)
            o.hashedDetectedImages[u] = e.hashedDetectedImages[u];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          o.detectionRecord = [];
          for (let u = 0; u < e.detectionRecord.length; ++u)
            o.detectionRecord[u] = i.dot.v4.DetectedObject.toObject(e.detectionRecord[u], r);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          o.hashedDetectedImagesWithTimestamp = [];
          for (let u = 0; u < e.hashedDetectedImagesWithTimestamp.length; ++u)
            o.hashedDetectedImagesWithTimestamp[u] = i.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[u], r);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (o.croppedImage = i.dot.Image.toObject(e.croppedImage, r), r.oneofs && (o._croppedImage = "croppedImage")), e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition") && (o.croppedImageWithPosition = i.dot.v4.ImageCrop.toObject(e.croppedImageWithPosition, r), r.oneofs && (o._croppedImageWithPosition = "croppedImageWithPosition")), e.platformDetails != null && e.hasOwnProperty("platformDetails") && (o.platformDetails = i.dot.v4.PlatformDetails.toObject(e.platformDetails, r), r.oneofs && (o._platformDetails = "platformDetails")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, n;
    }(), l.HashedDetectedImageWithTimestamp = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.imageHash = "", n.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.imageHash = t.string();
              break;
            }
            case 2: {
              u.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !d.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !d.isInteger(t.timestampMillis) && !(t.timestampMillis && d.isInteger(t.timestampMillis.low) && d.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new i.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (d.Long ? (e.timestampMillis = d.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new d.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        if (e.defaults)
          if (r.imageHash = "", d.Long) {
            let o = new d.Long(0, 0, !0);
            r.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            r.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (r.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? r.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : r.timestampMillis = e.longs === String ? d.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new d.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, n;
    }(), l.MediaTrackSettings = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.aspectRatio = null, n.prototype.autoGainControl = null, n.prototype.channelCount = null, n.prototype.deviceId = null, n.prototype.displaySurface = null, n.prototype.echoCancellation = null, n.prototype.facingMode = null, n.prototype.frameRate = null, n.prototype.groupId = null, n.prototype.height = null, n.prototype.noiseSuppression = null, n.prototype.sampleRate = null, n.prototype.sampleSize = null, n.prototype.width = null, n.prototype.deviceName = null;
      let t;
      return Object.defineProperty(n.prototype, "_aspectRatio", {
        get: d.oneOfGetter(t = ["aspectRatio"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_autoGainControl", {
        get: d.oneOfGetter(t = ["autoGainControl"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_channelCount", {
        get: d.oneOfGetter(t = ["channelCount"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceId", {
        get: d.oneOfGetter(t = ["deviceId"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_displaySurface", {
        get: d.oneOfGetter(t = ["displaySurface"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_echoCancellation", {
        get: d.oneOfGetter(t = ["echoCancellation"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_facingMode", {
        get: d.oneOfGetter(t = ["facingMode"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_frameRate", {
        get: d.oneOfGetter(t = ["frameRate"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_groupId", {
        get: d.oneOfGetter(t = ["groupId"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_height", {
        get: d.oneOfGetter(t = ["height"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_noiseSuppression", {
        get: d.oneOfGetter(t = ["noiseSuppression"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleRate", {
        get: d.oneOfGetter(t = ["sampleRate"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleSize", {
        get: d.oneOfGetter(t = ["sampleSize"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_width", {
        get: d.oneOfGetter(t = ["width"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceName", {
        get: d.oneOfGetter(t = ["deviceName"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && r.uint32(
          /* id 1, wireType 1 =*/
          9
        ).double(e.aspectRatio), e.autoGainControl != null && Object.hasOwnProperty.call(e, "autoGainControl") && r.uint32(
          /* id 2, wireType 0 =*/
          16
        ).bool(e.autoGainControl), e.channelCount != null && Object.hasOwnProperty.call(e, "channelCount") && r.uint32(
          /* id 3, wireType 0 =*/
          24
        ).int32(e.channelCount), e.deviceId != null && Object.hasOwnProperty.call(e, "deviceId") && r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).string(e.deviceId), e.displaySurface != null && Object.hasOwnProperty.call(e, "displaySurface") && r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.displaySurface), e.echoCancellation != null && Object.hasOwnProperty.call(e, "echoCancellation") && r.uint32(
          /* id 6, wireType 0 =*/
          48
        ).bool(e.echoCancellation), e.facingMode != null && Object.hasOwnProperty.call(e, "facingMode") && r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).string(e.facingMode), e.frameRate != null && Object.hasOwnProperty.call(e, "frameRate") && r.uint32(
          /* id 8, wireType 1 =*/
          65
        ).double(e.frameRate), e.groupId != null && Object.hasOwnProperty.call(e, "groupId") && r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).string(e.groupId), e.height != null && Object.hasOwnProperty.call(e, "height") && r.uint32(
          /* id 10, wireType 0 =*/
          80
        ).int32(e.height), e.noiseSuppression != null && Object.hasOwnProperty.call(e, "noiseSuppression") && r.uint32(
          /* id 11, wireType 0 =*/
          88
        ).bool(e.noiseSuppression), e.sampleRate != null && Object.hasOwnProperty.call(e, "sampleRate") && r.uint32(
          /* id 12, wireType 0 =*/
          96
        ).int32(e.sampleRate), e.sampleSize != null && Object.hasOwnProperty.call(e, "sampleSize") && r.uint32(
          /* id 13, wireType 0 =*/
          104
        ).int32(e.sampleSize), e.width != null && Object.hasOwnProperty.call(e, "width") && r.uint32(
          /* id 14, wireType 0 =*/
          112
        ).int32(e.width), e.deviceName != null && Object.hasOwnProperty.call(e, "deviceName") && r.uint32(
          /* id 15, wireType 2 =*/
          122
        ).string(e.deviceName), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.MediaTrackSettings();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.aspectRatio = e.double();
              break;
            }
            case 2: {
              a.autoGainControl = e.bool();
              break;
            }
            case 3: {
              a.channelCount = e.int32();
              break;
            }
            case 4: {
              a.deviceId = e.string();
              break;
            }
            case 5: {
              a.displaySurface = e.string();
              break;
            }
            case 6: {
              a.echoCancellation = e.bool();
              break;
            }
            case 7: {
              a.facingMode = e.string();
              break;
            }
            case 8: {
              a.frameRate = e.double();
              break;
            }
            case 9: {
              a.groupId = e.string();
              break;
            }
            case 10: {
              a.height = e.int32();
              break;
            }
            case 11: {
              a.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              a.sampleRate = e.int32();
              break;
            }
            case 13: {
              a.sampleSize = e.int32();
              break;
            }
            case 14: {
              a.width = e.int32();
              break;
            }
            case 15: {
              a.deviceName = e.string();
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !d.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !d.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !d.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !d.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !d.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !d.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !d.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !d.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !d.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !d.isString(e.deviceName) ? "deviceName: string expected" : null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.MediaTrackSettings)
          return e;
        let r = new i.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (r.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (r.autoGainControl = !!e.autoGainControl), e.channelCount != null && (r.channelCount = e.channelCount | 0), e.deviceId != null && (r.deviceId = String(e.deviceId)), e.displaySurface != null && (r.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (r.echoCancellation = !!e.echoCancellation), e.facingMode != null && (r.facingMode = String(e.facingMode)), e.frameRate != null && (r.frameRate = Number(e.frameRate)), e.groupId != null && (r.groupId = String(e.groupId)), e.height != null && (r.height = e.height | 0), e.noiseSuppression != null && (r.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (r.sampleRate = e.sampleRate | 0), e.sampleSize != null && (r.sampleSize = e.sampleSize | 0), e.width != null && (r.width = e.width | 0), e.deviceName != null && (r.deviceName = String(e.deviceName)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && (o.aspectRatio = r.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, r.oneofs && (o._aspectRatio = "aspectRatio")), e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && (o.autoGainControl = e.autoGainControl, r.oneofs && (o._autoGainControl = "autoGainControl")), e.channelCount != null && e.hasOwnProperty("channelCount") && (o.channelCount = e.channelCount, r.oneofs && (o._channelCount = "channelCount")), e.deviceId != null && e.hasOwnProperty("deviceId") && (o.deviceId = e.deviceId, r.oneofs && (o._deviceId = "deviceId")), e.displaySurface != null && e.hasOwnProperty("displaySurface") && (o.displaySurface = e.displaySurface, r.oneofs && (o._displaySurface = "displaySurface")), e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && (o.echoCancellation = e.echoCancellation, r.oneofs && (o._echoCancellation = "echoCancellation")), e.facingMode != null && e.hasOwnProperty("facingMode") && (o.facingMode = e.facingMode, r.oneofs && (o._facingMode = "facingMode")), e.frameRate != null && e.hasOwnProperty("frameRate") && (o.frameRate = r.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, r.oneofs && (o._frameRate = "frameRate")), e.groupId != null && e.hasOwnProperty("groupId") && (o.groupId = e.groupId, r.oneofs && (o._groupId = "groupId")), e.height != null && e.hasOwnProperty("height") && (o.height = e.height, r.oneofs && (o._height = "height")), e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && (o.noiseSuppression = e.noiseSuppression, r.oneofs && (o._noiseSuppression = "noiseSuppression")), e.sampleRate != null && e.hasOwnProperty("sampleRate") && (o.sampleRate = e.sampleRate, r.oneofs && (o._sampleRate = "sampleRate")), e.sampleSize != null && e.hasOwnProperty("sampleSize") && (o.sampleSize = e.sampleSize, r.oneofs && (o._sampleSize = "sampleSize")), e.width != null && e.hasOwnProperty("width") && (o.width = e.width, r.oneofs && (o._width = "width")), e.deviceName != null && e.hasOwnProperty("deviceName") && (o.deviceName = e.deviceName, r.oneofs && (o._deviceName = "deviceName")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, n;
    }(), l.ImageBitmap = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.width = 0, n.prototype.height = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.ImageBitmap();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.width = t.int32();
              break;
            }
            case 2: {
              u.height = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !d.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !d.isInteger(t.height) ? "height: integer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.ImageBitmap)
          return t;
        let e = new i.dot.v4.ImageBitmap();
        return t.width != null && (e.width = t.width | 0), t.height != null && (e.height = t.height | 0), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.width = 0, r.height = 0), t.width != null && t.hasOwnProperty("width") && (r.width = t.width), t.height != null && t.hasOwnProperty("height") && (r.height = t.height), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, n;
    }(), l.CameraProperties = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.cameraInitFrameResolution = null, n.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(n.prototype, "_cameraInitFrameResolution", {
        get: d.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && i.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && i.dot.v4.MediaTrackSettings.encode(e.cameraProperties, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.CameraProperties();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.cameraInitFrameResolution = i.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.cameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution")) {
          let r = i.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution);
          if (r)
            return "cameraInitFrameResolution." + r;
        }
        if (e.cameraProperties != null && e.hasOwnProperty("cameraProperties")) {
          let r = i.dot.v4.MediaTrackSettings.verify(e.cameraProperties);
          if (r)
            return "cameraProperties." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.CameraProperties)
          return e;
        let r = new i.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (typeof e.cameraInitFrameResolution != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          r.cameraInitFrameResolution = i.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution);
        }
        if (e.cameraProperties != null) {
          if (typeof e.cameraProperties != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          r.cameraProperties = i.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.cameraProperties = null), e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution") && (o.cameraInitFrameResolution = i.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, r), r.oneofs && (o._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && e.hasOwnProperty("cameraProperties") && (o.cameraProperties = i.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, r)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, n;
    }(), l.DetectedObject = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.brightness = 0, n.prototype.sharpness = 0, n.prototype.hotspots = 0, n.prototype.confidence = 0, n.prototype.faceSize = 0, n.prototype.faceCenter = null, n.prototype.smallestEdge = 0, n.prototype.bottomLeft = null, n.prototype.bottomRight = null, n.prototype.topLeft = null, n.prototype.topRight = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
        ).float(t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && i.dot.v4.Point.encode(t.faceCenter, e.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && e.uint32(
          /* id 7, wireType 5 =*/
          61
        ).float(t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && i.dot.v4.Point.encode(t.bottomLeft, e.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && i.dot.v4.Point.encode(t.bottomRight, e.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && i.dot.v4.Point.encode(t.topLeft, e.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && i.dot.v4.Point.encode(t.topRight, e.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.DetectedObject();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.brightness = t.float();
              break;
            }
            case 2: {
              u.sharpness = t.float();
              break;
            }
            case 3: {
              u.hotspots = t.float();
              break;
            }
            case 4: {
              u.confidence = t.float();
              break;
            }
            case 5: {
              u.faceSize = t.float();
              break;
            }
            case 6: {
              u.faceCenter = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 7: {
              u.smallestEdge = t.float();
              break;
            }
            case 8: {
              u.bottomLeft = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 9: {
              u.bottomRight = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 10: {
              u.topLeft = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 11: {
              u.topRight = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
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
          let e = i.dot.v4.Point.verify(t.faceCenter);
          if (e)
            return "faceCenter." + e;
        }
        if (t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && typeof t.smallestEdge != "number")
          return "smallestEdge: number expected";
        if (t.bottomLeft != null && t.hasOwnProperty("bottomLeft")) {
          let e = i.dot.v4.Point.verify(t.bottomLeft);
          if (e)
            return "bottomLeft." + e;
        }
        if (t.bottomRight != null && t.hasOwnProperty("bottomRight")) {
          let e = i.dot.v4.Point.verify(t.bottomRight);
          if (e)
            return "bottomRight." + e;
        }
        if (t.topLeft != null && t.hasOwnProperty("topLeft")) {
          let e = i.dot.v4.Point.verify(t.topLeft);
          if (e)
            return "topLeft." + e;
        }
        if (t.topRight != null && t.hasOwnProperty("topRight")) {
          let e = i.dot.v4.Point.verify(t.topRight);
          if (e)
            return "topRight." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.DetectedObject)
          return t;
        let e = new i.dot.v4.DetectedObject();
        if (t.brightness != null && (e.brightness = Number(t.brightness)), t.sharpness != null && (e.sharpness = Number(t.sharpness)), t.hotspots != null && (e.hotspots = Number(t.hotspots)), t.confidence != null && (e.confidence = Number(t.confidence)), t.faceSize != null && (e.faceSize = Number(t.faceSize)), t.faceCenter != null) {
          if (typeof t.faceCenter != "object")
            throw TypeError(".dot.v4.DetectedObject.faceCenter: object expected");
          e.faceCenter = i.dot.v4.Point.fromObject(t.faceCenter);
        }
        if (t.smallestEdge != null && (e.smallestEdge = Number(t.smallestEdge)), t.bottomLeft != null) {
          if (typeof t.bottomLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomLeft: object expected");
          e.bottomLeft = i.dot.v4.Point.fromObject(t.bottomLeft);
        }
        if (t.bottomRight != null) {
          if (typeof t.bottomRight != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomRight: object expected");
          e.bottomRight = i.dot.v4.Point.fromObject(t.bottomRight);
        }
        if (t.topLeft != null) {
          if (typeof t.topLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.topLeft: object expected");
          e.topLeft = i.dot.v4.Point.fromObject(t.topLeft);
        }
        if (t.topRight != null) {
          if (typeof t.topRight != "object")
            throw TypeError(".dot.v4.DetectedObject.topRight: object expected");
          e.topRight = i.dot.v4.Point.fromObject(t.topRight);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.brightness = 0, r.sharpness = 0, r.hotspots = 0, r.confidence = 0, r.faceSize = 0, r.faceCenter = null, r.smallestEdge = 0, r.bottomLeft = null, r.bottomRight = null, r.topLeft = null, r.topRight = null), t.brightness != null && t.hasOwnProperty("brightness") && (r.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && t.hasOwnProperty("sharpness") && (r.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && t.hasOwnProperty("hotspots") && (r.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && t.hasOwnProperty("confidence") && (r.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && t.hasOwnProperty("faceSize") && (r.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && t.hasOwnProperty("faceCenter") && (r.faceCenter = i.dot.v4.Point.toObject(t.faceCenter, e)), t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && (r.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && t.hasOwnProperty("bottomLeft") && (r.bottomLeft = i.dot.v4.Point.toObject(t.bottomLeft, e)), t.bottomRight != null && t.hasOwnProperty("bottomRight") && (r.bottomRight = i.dot.v4.Point.toObject(t.bottomRight, e)), t.topLeft != null && t.hasOwnProperty("topLeft") && (r.topLeft = i.dot.v4.Point.toObject(t.topLeft, e)), t.topRight != null && t.hasOwnProperty("topRight") && (r.topRight = i.dot.v4.Point.toObject(t.topRight, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, n;
    }(), l.Point = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.x = 0, n.prototype.y = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Point();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.x = t.float();
              break;
            }
            case 2: {
              u.y = t.float();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.x != null && t.hasOwnProperty("x") && typeof t.x != "number" ? "x: number expected" : t.y != null && t.hasOwnProperty("y") && typeof t.y != "number" ? "y: number expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.Point)
          return t;
        let e = new i.dot.v4.Point();
        return t.x != null && (e.x = Number(t.x)), t.y != null && (e.y = Number(t.y)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.x = 0, r.y = 0), t.x != null && t.hasOwnProperty("x") && (r.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && t.hasOwnProperty("y") && (r.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, n;
    }(), l.ImageCrop = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && i.dot.v4.Point.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.ImageCrop();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = i.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = i.dot.v4.Point.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.ImageCrop)
          return t;
        let e = new i.dot.v4.ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.ImageCrop.image: object expected");
          e.image = i.dot.Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = i.dot.v4.Point.fromObject(t.topLeftCorner);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.image = null, r.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (r.image = i.dot.Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (r.topLeftCorner = i.dot.v4.Point.toObject(t.topLeftCorner, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageCrop";
      }, n;
    }(), l.PlatformDetails = function() {
      function n(e) {
        if (this.browserVersions = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.userAgent = "", n.prototype.platform = null, n.prototype.platformVersion = null, n.prototype.architecture = null, n.prototype.model = null, n.prototype.browserVersions = d.emptyArray;
      let t;
      return Object.defineProperty(n.prototype, "_platform", {
        get: d.oneOfGetter(t = ["platform"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_platformVersion", {
        get: d.oneOfGetter(t = ["platformVersion"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_architecture", {
        get: d.oneOfGetter(t = ["architecture"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_model", {
        get: d.oneOfGetter(t = ["model"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.userAgent), e.platform != null && Object.hasOwnProperty.call(e, "platform") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.platform), e.platformVersion != null && Object.hasOwnProperty.call(e, "platformVersion") && r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).string(e.platformVersion), e.architecture != null && Object.hasOwnProperty.call(e, "architecture") && r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).string(e.architecture), e.model != null && Object.hasOwnProperty.call(e, "model") && r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.model), e.browserVersions != null && e.browserVersions.length)
          for (let o = 0; o < e.browserVersions.length; ++o)
            i.dot.v4.BrowserVersion.encode(e.browserVersions[o], r.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork()).ldelim();
        return r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.PlatformDetails();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.userAgent = e.string();
              break;
            }
            case 2: {
              a.platform = e.string();
              break;
            }
            case 3: {
              a.platformVersion = e.string();
              break;
            }
            case 4: {
              a.architecture = e.string();
              break;
            }
            case 5: {
              a.model = e.string();
              break;
            }
            case 6: {
              a.browserVersions && a.browserVersions.length || (a.browserVersions = []), a.browserVersions.push(i.dot.v4.BrowserVersion.decode(e, e.uint32()));
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.userAgent != null && e.hasOwnProperty("userAgent") && !d.isString(e.userAgent))
          return "userAgent: string expected";
        if (e.platform != null && e.hasOwnProperty("platform") && !d.isString(e.platform))
          return "platform: string expected";
        if (e.platformVersion != null && e.hasOwnProperty("platformVersion") && !d.isString(e.platformVersion))
          return "platformVersion: string expected";
        if (e.architecture != null && e.hasOwnProperty("architecture") && !d.isString(e.architecture))
          return "architecture: string expected";
        if (e.model != null && e.hasOwnProperty("model") && !d.isString(e.model))
          return "model: string expected";
        if (e.browserVersions != null && e.hasOwnProperty("browserVersions")) {
          if (!Array.isArray(e.browserVersions))
            return "browserVersions: array expected";
          for (let r = 0; r < e.browserVersions.length; ++r) {
            let o = i.dot.v4.BrowserVersion.verify(e.browserVersions[r]);
            if (o)
              return "browserVersions." + o;
          }
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.PlatformDetails)
          return e;
        let r = new i.dot.v4.PlatformDetails();
        if (e.userAgent != null && (r.userAgent = String(e.userAgent)), e.platform != null && (r.platform = String(e.platform)), e.platformVersion != null && (r.platformVersion = String(e.platformVersion)), e.architecture != null && (r.architecture = String(e.architecture)), e.model != null && (r.model = String(e.model)), e.browserVersions) {
          if (!Array.isArray(e.browserVersions))
            throw TypeError(".dot.v4.PlatformDetails.browserVersions: array expected");
          r.browserVersions = [];
          for (let o = 0; o < e.browserVersions.length; ++o) {
            if (typeof e.browserVersions[o] != "object")
              throw TypeError(".dot.v4.PlatformDetails.browserVersions: object expected");
            r.browserVersions[o] = i.dot.v4.BrowserVersion.fromObject(e.browserVersions[o]);
          }
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.browserVersions = []), r.defaults && (o.userAgent = ""), e.userAgent != null && e.hasOwnProperty("userAgent") && (o.userAgent = e.userAgent), e.platform != null && e.hasOwnProperty("platform") && (o.platform = e.platform, r.oneofs && (o._platform = "platform")), e.platformVersion != null && e.hasOwnProperty("platformVersion") && (o.platformVersion = e.platformVersion, r.oneofs && (o._platformVersion = "platformVersion")), e.architecture != null && e.hasOwnProperty("architecture") && (o.architecture = e.architecture, r.oneofs && (o._architecture = "architecture")), e.model != null && e.hasOwnProperty("model") && (o.model = e.model, r.oneofs && (o._model = "model")), e.browserVersions && e.browserVersions.length) {
          o.browserVersions = [];
          for (let u = 0; u < e.browserVersions.length; ++u)
            o.browserVersions[u] = i.dot.v4.BrowserVersion.toObject(e.browserVersions[u], r);
        }
        return o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PlatformDetails";
      }, n;
    }(), l.BrowserVersion = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.name = "", n.prototype.version = "", n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.name != null && Object.hasOwnProperty.call(t, "name") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(t.version), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.BrowserVersion();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.name = t.string();
              break;
            }
            case 2: {
              u.version = t.string();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.name != null && t.hasOwnProperty("name") && !d.isString(t.name) ? "name: string expected" : t.version != null && t.hasOwnProperty("version") && !d.isString(t.version) ? "version: string expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.BrowserVersion)
          return t;
        let e = new i.dot.v4.BrowserVersion();
        return t.name != null && (e.name = String(t.name)), t.version != null && (e.version = String(t.version)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.name = "", r.version = ""), t.name != null && t.hasOwnProperty("name") && (r.name = t.name), t.version != null && t.hasOwnProperty("version") && (r.version = t.version), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.BrowserVersion";
      }, n;
    }(), l.FaceContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.FaceContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = i.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = i.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = i.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.FaceContent)
          return e;
        let r = new i.dot.v4.FaceContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          r.image = i.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.FaceContent.video: object expected");
          r.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          r.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, r)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FaceContent";
      }, n;
    }(), l.DocumentContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.DocumentContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = i.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = i.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = i.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.DocumentContent)
          return e;
        let r = new i.dot.v4.DocumentContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          r.image = i.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.DocumentContent.video: object expected");
          r.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          r.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, r)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.DocumentContent";
      }, n;
    }(), l.Blob = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.documentContent = null, n.prototype.eyeGazeLivenessContent = null, n.prototype.faceContent = null, n.prototype.magnifeyeLivenessContent = null, n.prototype.smileLivenessContent = null, n.prototype.palmContent = null, n.prototype.travelDocumentContent = null;
      let t;
      return Object.defineProperty(n.prototype, "blob", {
        get: d.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && i.dot.v4.DocumentContent.encode(e.documentContent, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && i.dot.v4.FaceContent.encode(e.faceContent, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && i.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && i.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && i.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && i.dot.v4.PalmContent.encode(e.palmContent, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && i.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.Blob();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.documentContent = i.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              a.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.faceContent = i.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.smileLivenessContent = i.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              a.palmContent = i.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.travelDocumentContent = i.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let r = {};
        if (e.documentContent != null && e.hasOwnProperty("documentContent")) {
          r.blob = 1;
          {
            let o = i.dot.v4.DocumentContent.verify(e.documentContent);
            if (o)
              return "documentContent." + o;
          }
        }
        if (e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let o = i.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent);
            if (o)
              return "eyeGazeLivenessContent." + o;
          }
        }
        if (e.faceContent != null && e.hasOwnProperty("faceContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let o = i.dot.v4.FaceContent.verify(e.faceContent);
            if (o)
              return "faceContent." + o;
          }
        }
        if (e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let o = i.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent);
            if (o)
              return "magnifeyeLivenessContent." + o;
          }
        }
        if (e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let o = i.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent);
            if (o)
              return "smileLivenessContent." + o;
          }
        }
        if (e.palmContent != null && e.hasOwnProperty("palmContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let o = i.dot.v4.PalmContent.verify(e.palmContent);
            if (o)
              return "palmContent." + o;
          }
        }
        if (e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let o = i.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent);
            if (o)
              return "travelDocumentContent." + o;
          }
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.Blob)
          return e;
        let r = new i.dot.v4.Blob();
        if (e.documentContent != null) {
          if (typeof e.documentContent != "object")
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          r.documentContent = i.dot.v4.DocumentContent.fromObject(e.documentContent);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (typeof e.eyeGazeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          r.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent);
        }
        if (e.faceContent != null) {
          if (typeof e.faceContent != "object")
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          r.faceContent = i.dot.v4.FaceContent.fromObject(e.faceContent);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (typeof e.magnifeyeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          r.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent);
        }
        if (e.smileLivenessContent != null) {
          if (typeof e.smileLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          r.smileLivenessContent = i.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent);
        }
        if (e.palmContent != null) {
          if (typeof e.palmContent != "object")
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          r.palmContent = i.dot.v4.PalmContent.fromObject(e.palmContent);
        }
        if (e.travelDocumentContent != null) {
          if (typeof e.travelDocumentContent != "object")
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          r.travelDocumentContent = i.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return e.documentContent != null && e.hasOwnProperty("documentContent") && (o.documentContent = i.dot.v4.DocumentContent.toObject(e.documentContent, r), r.oneofs && (o.blob = "documentContent")), e.faceContent != null && e.hasOwnProperty("faceContent") && (o.faceContent = i.dot.v4.FaceContent.toObject(e.faceContent, r), r.oneofs && (o.blob = "faceContent")), e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent") && (o.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, r), r.oneofs && (o.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent") && (o.smileLivenessContent = i.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, r), r.oneofs && (o.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent") && (o.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, r), r.oneofs && (o.blob = "eyeGazeLivenessContent")), e.palmContent != null && e.hasOwnProperty("palmContent") && (o.palmContent = i.dot.v4.PalmContent.toObject(e.palmContent, r), r.oneofs && (o.blob = "palmContent")), e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent") && (o.travelDocumentContent = i.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, r), r.oneofs && (o.blob = "travelDocumentContent")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, n;
    }(), l.TravelDocumentContent = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.ldsMasterFile = null, n.prototype.accessControlProtocolUsed = 0, n.prototype.authenticationStatus = null, n.prototype.metadata = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && i.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && i.dot.v4.AuthenticationStatus.encode(t.authenticationStatus, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && i.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.TravelDocumentContent();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.ldsMasterFile = i.dot.v4.LdsMasterFile.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              u.authenticationStatus = i.dot.v4.AuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 4: {
              u.metadata = i.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile")) {
          let e = i.dot.v4.LdsMasterFile.verify(t.ldsMasterFile);
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
          let e = i.dot.v4.AuthenticationStatus.verify(t.authenticationStatus);
          if (e)
            return "authenticationStatus." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = i.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.TravelDocumentContent)
          return t;
        let e = new i.dot.v4.TravelDocumentContent();
        if (t.ldsMasterFile != null) {
          if (typeof t.ldsMasterFile != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.ldsMasterFile: object expected");
          e.ldsMasterFile = i.dot.v4.LdsMasterFile.fromObject(t.ldsMasterFile);
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
          e.authenticationStatus = i.dot.v4.AuthenticationStatus.fromObject(t.authenticationStatus);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.metadata: object expected");
          e.metadata = i.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.ldsMasterFile = null, r.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, r.authenticationStatus = null, r.metadata = null), t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile") && (r.ldsMasterFile = i.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e)), t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed") && (r.accessControlProtocolUsed = e.enums === String ? i.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : i.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus") && (r.authenticationStatus = i.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e)), t.metadata != null && t.hasOwnProperty("metadata") && (r.metadata = i.dot.v4.Metadata.toObject(t.metadata, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, n;
    }(), l.LdsMasterFile = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.lds1eMrtdApplication = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && i.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.LdsMasterFile();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication")) {
          let e = i.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication);
          if (e)
            return "lds1eMrtdApplication." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.LdsMasterFile)
          return t;
        let e = new i.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (typeof t.lds1eMrtdApplication != "object")
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          e.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication") && (r.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, n;
    }(), l.Lds1eMrtdApplication = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.comHeaderAndDataGroupPresenceInformation = null, n.prototype.sodDocumentSecurityObject = null, n.prototype.dg1MachineReadableZoneInformation = null, n.prototype.dg2EncodedIdentificationFeaturesFace = null, n.prototype.dg3AdditionalIdentificationFeatureFingers = null, n.prototype.dg4AdditionalIdentificationFeatureIrises = null, n.prototype.dg5DisplayedPortrait = null, n.prototype.dg7DisplayedSignatureOrUsualMark = null, n.prototype.dg8DataFeatures = null, n.prototype.dg9StructureFeatures = null, n.prototype.dg10SubstanceFeatures = null, n.prototype.dg11AdditionalPersonalDetails = null, n.prototype.dg12AdditionalDocumentDetails = null, n.prototype.dg13OptionalDetails = null, n.prototype.dg14SecurityOptions = null, n.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, n.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(n.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: d.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: d.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg5DisplayedPortrait", {
        get: d.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: d.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg8DataFeatures", {
        get: d.oneOfGetter(t = ["dg8DataFeatures"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg9StructureFeatures", {
        get: d.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg10SubstanceFeatures", {
        get: d.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg11AdditionalPersonalDetails", {
        get: d.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg12AdditionalDocumentDetails", {
        get: d.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg13OptionalDetails", {
        get: d.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg14SecurityOptions", {
        get: d.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: d.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg16PersonsToNotify", {
        get: d.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && i.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && i.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && i.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && i.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && i.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && i.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && i.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && i.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && i.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && i.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && i.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, r.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && i.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, r.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork()).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && i.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, r.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork()).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && i.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, r.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork()).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && i.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, r.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork()).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && i.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, r.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork()).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && i.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, r.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              a.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              a.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              a.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              a.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              a.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              a.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              a.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              a.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              a.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              a.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              a.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              a.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation);
          if (r)
            return "comHeaderAndDataGroupPresenceInformation." + r;
        }
        if (e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject);
          if (r)
            return "sodDocumentSecurityObject." + r;
        }
        if (e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation);
          if (r)
            return "dg1MachineReadableZoneInformation." + r;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace);
          if (r)
            return "dg2EncodedIdentificationFeaturesFace." + r;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers);
          if (r)
            return "dg3AdditionalIdentificationFeatureFingers." + r;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises);
          if (r)
            return "dg4AdditionalIdentificationFeatureIrises." + r;
        }
        if (e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait);
          if (r)
            return "dg5DisplayedPortrait." + r;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark);
          if (r)
            return "dg7DisplayedSignatureOrUsualMark." + r;
        }
        if (e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures);
          if (r)
            return "dg8DataFeatures." + r;
        }
        if (e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures);
          if (r)
            return "dg9StructureFeatures." + r;
        }
        if (e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures);
          if (r)
            return "dg10SubstanceFeatures." + r;
        }
        if (e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails);
          if (r)
            return "dg11AdditionalPersonalDetails." + r;
        }
        if (e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails);
          if (r)
            return "dg12AdditionalDocumentDetails." + r;
        }
        if (e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails);
          if (r)
            return "dg13OptionalDetails." + r;
        }
        if (e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions);
          if (r)
            return "dg14SecurityOptions." + r;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo);
          if (r)
            return "dg15ActiveAuthenticationPublicKeyInfo." + r;
        }
        if (e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify")) {
          let r = i.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify);
          if (r)
            return "dg16PersonsToNotify." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.Lds1eMrtdApplication)
          return e;
        let r = new i.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (typeof e.comHeaderAndDataGroupPresenceInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          r.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (typeof e.sodDocumentSecurityObject != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          r.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (typeof e.dg1MachineReadableZoneInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          r.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (typeof e.dg2EncodedIdentificationFeaturesFace != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          r.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (typeof e.dg3AdditionalIdentificationFeatureFingers != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          r.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (typeof e.dg4AdditionalIdentificationFeatureIrises != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          r.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (typeof e.dg5DisplayedPortrait != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          r.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (typeof e.dg7DisplayedSignatureOrUsualMark != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          r.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark);
        }
        if (e.dg8DataFeatures != null) {
          if (typeof e.dg8DataFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          r.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures);
        }
        if (e.dg9StructureFeatures != null) {
          if (typeof e.dg9StructureFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          r.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (typeof e.dg10SubstanceFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          r.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (typeof e.dg11AdditionalPersonalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          r.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (typeof e.dg12AdditionalDocumentDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          r.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails);
        }
        if (e.dg13OptionalDetails != null) {
          if (typeof e.dg13OptionalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          r.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails);
        }
        if (e.dg14SecurityOptions != null) {
          if (typeof e.dg14SecurityOptions != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          r.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (typeof e.dg15ActiveAuthenticationPublicKeyInfo != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          r.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo);
        }
        if (e.dg16PersonsToNotify != null) {
          if (typeof e.dg16PersonsToNotify != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          r.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.comHeaderAndDataGroupPresenceInformation = null, o.sodDocumentSecurityObject = null, o.dg1MachineReadableZoneInformation = null, o.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation") && (o.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, r)), e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject") && (o.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, r)), e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation") && (o.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, r)), e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace") && (o.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, r)), e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers") && (o.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, r), r.oneofs && (o._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises") && (o.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, r), r.oneofs && (o._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait") && (o.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, r), r.oneofs && (o._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark") && (o.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, r), r.oneofs && (o._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures") && (o.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, r), r.oneofs && (o._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures") && (o.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, r), r.oneofs && (o._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures") && (o.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, r), r.oneofs && (o._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails") && (o.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, r), r.oneofs && (o._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails") && (o.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, r), r.oneofs && (o._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails") && (o.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, r), r.oneofs && (o._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions") && (o.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, r), r.oneofs && (o._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo") && (o.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, r), r.oneofs && (o._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify") && (o.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, r), r.oneofs && (o._dg16PersonsToNotify = "dg16PersonsToNotify")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, n;
    }(), l.Lds1ElementaryFile = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.id = 0, n.prototype.bytes = null;
      let t;
      return Object.defineProperty(n.prototype, "_bytes", {
        get: d.oneOfGetter(t = ["bytes"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.Lds1ElementaryFile();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.id = e.int32();
              break;
            }
            case 2: {
              a.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
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
        return e.bytes != null && e.hasOwnProperty("bytes") && !(e.bytes && typeof e.bytes.length == "number" || d.isString(e.bytes)) ? "bytes: buffer expected" : null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.Lds1ElementaryFile)
          return e;
        let r = new i.dot.v4.Lds1ElementaryFile();
        switch (e.id) {
          default:
            if (typeof e.id == "number") {
              r.id = e.id;
              break;
            }
            break;
          case "ID_UNSPECIFIED":
          case 0:
            r.id = 0;
            break;
          case "ID_COM":
          case 1:
            r.id = 1;
            break;
          case "ID_SOD":
          case 2:
            r.id = 2;
            break;
          case "ID_DG1":
          case 3:
            r.id = 3;
            break;
          case "ID_DG2":
          case 4:
            r.id = 4;
            break;
          case "ID_DG3":
          case 5:
            r.id = 5;
            break;
          case "ID_DG4":
          case 6:
            r.id = 6;
            break;
          case "ID_DG5":
          case 7:
            r.id = 7;
            break;
          case "ID_DG7":
          case 8:
            r.id = 8;
            break;
          case "ID_DG8":
          case 9:
            r.id = 9;
            break;
          case "ID_DG9":
          case 10:
            r.id = 10;
            break;
          case "ID_DG10":
          case 11:
            r.id = 11;
            break;
          case "ID_DG11":
          case 12:
            r.id = 12;
            break;
          case "ID_DG12":
          case 13:
            r.id = 13;
            break;
          case "ID_DG13":
          case 14:
            r.id = 14;
            break;
          case "ID_DG14":
          case 15:
            r.id = 15;
            break;
          case "ID_DG15":
          case 16:
            r.id = 16;
            break;
          case "ID_DG16":
          case 17:
            r.id = 17;
            break;
        }
        return e.bytes != null && (typeof e.bytes == "string" ? d.base64.decode(e.bytes, r.bytes = d.newBuffer(d.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (r.bytes = e.bytes)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.id = r.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (o.id = r.enums === String ? i.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : i.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (o.bytes = r.bytes === String ? d.base64.encode(e.bytes, 0, e.bytes.length) : r.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, r.oneofs && (o._bytes = "bytes")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, n.Id = function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "ID_UNSPECIFIED"] = 0, r[e[1] = "ID_COM"] = 1, r[e[2] = "ID_SOD"] = 2, r[e[3] = "ID_DG1"] = 3, r[e[4] = "ID_DG2"] = 4, r[e[5] = "ID_DG3"] = 5, r[e[6] = "ID_DG4"] = 6, r[e[7] = "ID_DG5"] = 7, r[e[8] = "ID_DG7"] = 8, r[e[9] = "ID_DG8"] = 9, r[e[10] = "ID_DG9"] = 10, r[e[11] = "ID_DG10"] = 11, r[e[12] = "ID_DG11"] = 12, r[e[13] = "ID_DG12"] = 13, r[e[14] = "ID_DG13"] = 14, r[e[15] = "ID_DG14"] = 15, r[e[16] = "ID_DG15"] = 16, r[e[17] = "ID_DG16"] = 17, r;
      }(), n;
    }(), l.AccessControlProtocol = function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[n[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[n[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), l.AuthenticationStatus = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.data = null, n.prototype.chip = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && i.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && i.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.AuthenticationStatus();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.data = i.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.chip = i.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.data != null && t.hasOwnProperty("data")) {
          let e = i.dot.v4.DataAuthenticationStatus.verify(t.data);
          if (e)
            return "data." + e;
        }
        if (t.chip != null && t.hasOwnProperty("chip")) {
          let e = i.dot.v4.ChipAuthenticationStatus.verify(t.chip);
          if (e)
            return "chip." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.AuthenticationStatus)
          return t;
        let e = new i.dot.v4.AuthenticationStatus();
        if (t.data != null) {
          if (typeof t.data != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.data: object expected");
          e.data = i.dot.v4.DataAuthenticationStatus.fromObject(t.data);
        }
        if (t.chip != null) {
          if (typeof t.chip != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.chip: object expected");
          e.chip = i.dot.v4.ChipAuthenticationStatus.fromObject(t.chip);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.data = null, r.chip = null), t.data != null && t.hasOwnProperty("data") && (r.data = i.dot.v4.DataAuthenticationStatus.toObject(t.data, e)), t.chip != null && t.hasOwnProperty("chip") && (r.chip = i.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, n;
    }(), l.DataAuthenticationStatus = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.status = 0, n.prototype.protocol = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.DataAuthenticationStatus();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.status = t.int32();
              break;
            }
            case 2: {
              u.protocol = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
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
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.DataAuthenticationStatus)
          return t;
        let e = new i.dot.v4.DataAuthenticationStatus();
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
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, r.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && t.hasOwnProperty("status") && (r.status = e.enums === String ? i.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : i.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && t.hasOwnProperty("protocol") && (r.protocol = e.enums === String ? i.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : i.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, n.Status = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      }(), n.Protocol = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      }(), n;
    }(), l.ChipAuthenticationStatus = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.status = 0, n.prototype.protocol = null, n.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(n.prototype, "_protocol", {
        get: d.oneOfGetter(t = ["protocol"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_activeAuthenticationResponse", {
        get: d.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.status), e.protocol != null && Object.hasOwnProperty.call(e, "protocol") && r.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(e.protocol), e.activeAuthenticationResponse != null && Object.hasOwnProperty.call(e, "activeAuthenticationResponse") && r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(e.activeAuthenticationResponse), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.status = e.int32();
              break;
            }
            case 2: {
              a.protocol = e.int32();
              break;
            }
            case 3: {
              a.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
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
        return e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || d.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.ChipAuthenticationStatus)
          return e;
        let r = new i.dot.v4.ChipAuthenticationStatus();
        switch (e.status) {
          default:
            if (typeof e.status == "number") {
              r.status = e.status;
              break;
            }
            break;
          case "STATUS_UNSPECIFIED":
          case 0:
            r.status = 0;
            break;
          case "STATUS_AUTHENTICATED":
          case 1:
            r.status = 1;
            break;
          case "STATUS_DENIED":
          case 2:
            r.status = 2;
            break;
          case "STATUS_NOT_SUPPORTED":
          case 3:
            r.status = 3;
            break;
        }
        switch (e.protocol) {
          default:
            if (typeof e.protocol == "number") {
              r.protocol = e.protocol;
              break;
            }
            break;
          case "PROTOCOL_UNSPECIFIED":
          case 0:
            r.protocol = 0;
            break;
          case "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING":
          case 1:
            r.protocol = 1;
            break;
          case "PROTOCOL_CHIP_AUTHENTICATION":
          case 2:
            r.protocol = 2;
            break;
          case "PROTOCOL_ACTIVE_AUTHENTICATION":
          case 3:
            r.protocol = 3;
            break;
        }
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? d.base64.decode(e.activeAuthenticationResponse, r.activeAuthenticationResponse = d.newBuffer(d.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (r.activeAuthenticationResponse = e.activeAuthenticationResponse)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.status = r.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (o.status = r.enums === String ? i.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : i.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (o.protocol = r.enums === String ? i.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : i.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, r.oneofs && (o._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (o.activeAuthenticationResponse = r.bytes === String ? d.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : r.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, r.oneofs && (o._activeAuthenticationResponse = "activeAuthenticationResponse")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, n.Status = function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "STATUS_UNSPECIFIED"] = 0, r[e[1] = "STATUS_AUTHENTICATED"] = 1, r[e[2] = "STATUS_DENIED"] = 2, r[e[3] = "STATUS_NOT_SUPPORTED"] = 3, r;
      }(), n.Protocol = function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, r[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, r[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, r[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, r;
      }(), n;
    }(), l.EyeGazeLivenessContent = function() {
      function n(e) {
        if (this.segments = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.segments = d.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_image", {
        get: d.oneOfGetter(t = ["image"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.segments != null && e.segments.length)
          for (let o = 0; o < e.segments.length; ++o)
            i.dot.v4.EyeGazeLivenessSegment.encode(e.segments[o], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 3: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              a.segments && a.segments.length || (a.segments = []), a.segments.push(i.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = i.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.segments != null && e.hasOwnProperty("segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let r = 0; r < e.segments.length; ++r) {
            let o = i.dot.v4.EyeGazeLivenessSegment.verify(e.segments[r]);
            if (o)
              return "segments." + o;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = i.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = i.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.EyeGazeLivenessContent)
          return e;
        let r = new i.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          r.image = i.dot.Image.fromObject(e.image);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          r.segments = [];
          for (let o = 0; o < e.segments.length; ++o) {
            if (typeof e.segments[o] != "object")
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            r.segments[o] = i.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[o]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.video: object expected");
          r.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          r.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.segments = []), r.defaults && (o.metadata = null), e.segments && e.segments.length) {
          o.segments = [];
          for (let u = 0; u < e.segments.length; ++u)
            o.segments[u] = i.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[u], r);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, r), r.oneofs && (o._image = "image")), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, n;
    }(), l.EyeGazeLivenessSegment = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.corner = 0, n.prototype.image = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = L.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof h || (t = h.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === r)
            break;
          switch (a >>> 3) {
            case 1: {
              u.corner = t.int32();
              break;
            }
            case 2: {
              u.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
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
          let e = i.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.EyeGazeLivenessSegment)
          return t;
        let e = new i.dot.v4.EyeGazeLivenessSegment();
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
          e.image = i.dot.Image.fromObject(t.image);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.corner = e.enums === String ? "TOP_LEFT" : 0, r.image = null), t.corner != null && t.hasOwnProperty("corner") && (r.corner = e.enums === String ? i.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : i.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && t.hasOwnProperty("image") && (r.image = i.dot.Image.toObject(t.image, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, n;
    }(), l.EyeGazeLivenessCorner = function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "TOP_LEFT"] = 0, t[n[1] = "TOP_RIGHT"] = 1, t[n[2] = "BOTTOM_RIGHT"] = 2, t[n[3] = "BOTTOM_LEFT"] = 3, t;
    }(), l.SmileLivenessContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.neutralExpressionFaceImage = null, n.prototype.smileExpressionFaceImage = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && i.dot.Image.encode(e.neutralExpressionFaceImage, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage") && i.dot.Image.encode(e.smileExpressionFaceImage, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.SmileLivenessContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.neutralExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.smileExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage")) {
          let r = i.dot.Image.verify(e.neutralExpressionFaceImage);
          if (r)
            return "neutralExpressionFaceImage." + r;
        }
        if (e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage")) {
          let r = i.dot.Image.verify(e.smileExpressionFaceImage);
          if (r)
            return "smileExpressionFaceImage." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = i.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = i.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.SmileLivenessContent)
          return e;
        let r = new i.dot.v4.SmileLivenessContent();
        if (e.neutralExpressionFaceImage != null) {
          if (typeof e.neutralExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          r.neutralExpressionFaceImage = i.dot.Image.fromObject(e.neutralExpressionFaceImage);
        }
        if (e.smileExpressionFaceImage != null) {
          if (typeof e.smileExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          r.smileExpressionFaceImage = i.dot.Image.fromObject(e.smileExpressionFaceImage);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.video: object expected");
          r.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          r.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.neutralExpressionFaceImage = null, o.smileExpressionFaceImage = null, o.metadata = null), e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage") && (o.neutralExpressionFaceImage = i.dot.Image.toObject(e.neutralExpressionFaceImage, r)), e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage") && (o.smileExpressionFaceImage = i.dot.Image.toObject(e.smileExpressionFaceImage, r)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.SmileLivenessContent";
      }, n;
    }(), l.PalmContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = L.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof h || (e = h.create(e));
        let u = r === void 0 ? e.len : e.pos + r, a = new i.dot.v4.PalmContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return a;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = i.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = i.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = i.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof i.dot.v4.PalmContent)
          return e;
        let r = new i.dot.v4.PalmContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          r.image = i.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.PalmContent.video: object expected");
          r.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          r.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, r)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PalmContent";
      }, n;
    }(), l;
  }(), p.Image = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.bytes = d.newBuffer([]), l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Image();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || d.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.Image)
        return n;
      let t = new i.dot.Image();
      return n.bytes != null && (typeof n.bytes == "string" ? d.base64.decode(n.bytes, t.bytes = d.newBuffer(d.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Image";
    }, l;
  }(), p.ImageSize = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.width = 0, l.prototype.height = 0, l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.width != null && Object.hasOwnProperty.call(n, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.width), n.height != null && Object.hasOwnProperty.call(n, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.height), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.ImageSize();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.width = n.int32();
            break;
          }
          case 2: {
            o.height = n.int32();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.width != null && n.hasOwnProperty("width") && !d.isInteger(n.width) ? "width: integer expected" : n.height != null && n.hasOwnProperty("height") && !d.isInteger(n.height) ? "height: integer expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.ImageSize)
        return n;
      let t = new i.dot.ImageSize();
      return n.width != null && (t.width = n.width | 0), n.height != null && (t.height = n.height | 0), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), n.width != null && n.hasOwnProperty("width") && (e.width = n.width), n.height != null && n.hasOwnProperty("height") && (e.height = n.height), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.ImageSize";
    }, l;
  }(), p.Int32List = function() {
    function l(n) {
      if (this.items = [], n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.items = d.emptyArray, l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      if (t || (t = L.create()), n.items != null && n.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < n.items.length; ++e)
          t.int32(n.items[e]);
        t.ldelim();
      }
      return t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Int32List();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            if (o.items && o.items.length || (o.items = []), (u & 7) === 2) {
              let a = n.uint32() + n.pos;
              for (; n.pos < a; )
                o.items.push(n.int32());
            } else
              o.items.push(n.int32());
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      if (typeof n != "object" || n === null)
        return "object expected";
      if (n.items != null && n.hasOwnProperty("items")) {
        if (!Array.isArray(n.items))
          return "items: array expected";
        for (let t = 0; t < n.items.length; ++t)
          if (!d.isInteger(n.items[t]))
            return "items: integer[] expected";
      }
      return null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.Int32List)
        return n;
      let t = new i.dot.Int32List();
      if (n.items) {
        if (!Array.isArray(n.items))
          throw TypeError(".dot.Int32List.items: array expected");
        t.items = [];
        for (let e = 0; e < n.items.length; ++e)
          t.items[e] = n.items[e] | 0;
      }
      return t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), n.items && n.items.length) {
        e.items = [];
        for (let r = 0; r < n.items.length; ++r)
          e.items[r] = n.items[r];
      }
      return e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Int32List";
    }, l;
  }(), p.Platform = function() {
    const l = {}, n = Object.create(l);
    return n[l[0] = "WEB"] = 0, n[l[1] = "ANDROID"] = 1, n[l[2] = "IOS"] = 2, n;
  }(), p.RectangleDouble = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.left = 0, l.prototype.top = 0, l.prototype.right = 0, l.prototype.bottom = 0, l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.left != null && Object.hasOwnProperty.call(n, "left") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(n.left), n.top != null && Object.hasOwnProperty.call(n, "top") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(n.top), n.right != null && Object.hasOwnProperty.call(n, "right") && t.uint32(
        /* id 3, wireType 1 =*/
        25
      ).double(n.right), n.bottom != null && Object.hasOwnProperty.call(n, "bottom") && t.uint32(
        /* id 4, wireType 1 =*/
        33
      ).double(n.bottom), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.RectangleDouble();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.left = n.double();
            break;
          }
          case 2: {
            o.top = n.double();
            break;
          }
          case 3: {
            o.right = n.double();
            break;
          }
          case 4: {
            o.bottom = n.double();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.left != null && n.hasOwnProperty("left") && typeof n.left != "number" ? "left: number expected" : n.top != null && n.hasOwnProperty("top") && typeof n.top != "number" ? "top: number expected" : n.right != null && n.hasOwnProperty("right") && typeof n.right != "number" ? "right: number expected" : n.bottom != null && n.hasOwnProperty("bottom") && typeof n.bottom != "number" ? "bottom: number expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.RectangleDouble)
        return n;
      let t = new i.dot.RectangleDouble();
      return n.left != null && (t.left = Number(n.left)), n.top != null && (t.top = Number(n.top)), n.right != null && (t.right = Number(n.right)), n.bottom != null && (t.bottom = Number(n.bottom)), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), n.left != null && n.hasOwnProperty("left") && (e.left = t.json && !isFinite(n.left) ? String(n.left) : n.left), n.top != null && n.hasOwnProperty("top") && (e.top = t.json && !isFinite(n.top) ? String(n.top) : n.top), n.right != null && n.hasOwnProperty("right") && (e.right = t.json && !isFinite(n.right) ? String(n.right) : n.right), n.bottom != null && n.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(n.bottom) ? String(n.bottom) : n.bottom), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.RectangleDouble";
    }, l;
  }(), p.DigestWithTimestamp = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.digest = d.newBuffer([]), l.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.digest != null && Object.hasOwnProperty.call(n, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.digest), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(n.timestampMillis), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.DigestWithTimestamp();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.digest = n.bytes();
            break;
          }
          case 2: {
            o.timestampMillis = n.uint64();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.digest != null && n.hasOwnProperty("digest") && !(n.digest && typeof n.digest.length == "number" || d.isString(n.digest)) ? "digest: buffer expected" : n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && !d.isInteger(n.timestampMillis) && !(n.timestampMillis && d.isInteger(n.timestampMillis.low) && d.isInteger(n.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.DigestWithTimestamp)
        return n;
      let t = new i.dot.DigestWithTimestamp();
      return n.digest != null && (typeof n.digest == "string" ? d.base64.decode(n.digest, t.digest = d.newBuffer(d.base64.length(n.digest)), 0) : n.digest.length >= 0 && (t.digest = n.digest)), n.timestampMillis != null && (d.Long ? (t.timestampMillis = d.Long.fromValue(n.timestampMillis)).unsigned = !0 : typeof n.timestampMillis == "string" ? t.timestampMillis = parseInt(n.timestampMillis, 10) : typeof n.timestampMillis == "number" ? t.timestampMillis = n.timestampMillis : typeof n.timestampMillis == "object" && (t.timestampMillis = new d.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = d.newBuffer(e.digest))), d.Long) {
          let r = new d.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? r.toString() : t.longs === Number ? r.toNumber() : r;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return n.digest != null && n.hasOwnProperty("digest") && (e.digest = t.bytes === String ? d.base64.encode(n.digest, 0, n.digest.length) : t.bytes === Array ? Array.prototype.slice.call(n.digest) : n.digest), n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && (typeof n.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(n.timestampMillis) : n.timestampMillis : e.timestampMillis = t.longs === String ? d.Long.prototype.toString.call(n.timestampMillis) : t.longs === Number ? new d.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0) : n.timestampMillis), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.DigestWithTimestamp";
    }, l;
  }(), p.Video = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.bytes = d.newBuffer([]), l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Video();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || d.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.Video)
        return n;
      let t = new i.dot.Video();
      return n.bytes != null && (typeof n.bytes == "string" ? d.base64.decode(n.bytes, t.bytes = d.newBuffer(d.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Video";
    }, l;
  }(), p.PointInt = function() {
    function l(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return l.prototype.x = 0, l.prototype.y = 0, l.create = function(n) {
      return new l(n);
    }, l.encode = function(n, t) {
      return t || (t = L.create()), n.x != null && Object.hasOwnProperty.call(n, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.y), t;
    }, l.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, l.decode = function(n, t, e) {
      n instanceof h || (n = h.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.PointInt();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.x = n.int32();
            break;
          }
          case 2: {
            o.y = n.int32();
            break;
          }
          default:
            n.skipType(u & 7);
            break;
        }
      }
      return o;
    }, l.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, l.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.x != null && n.hasOwnProperty("x") && !d.isInteger(n.x) ? "x: integer expected" : n.y != null && n.hasOwnProperty("y") && !d.isInteger(n.y) ? "y: integer expected" : null;
    }, l.fromObject = function(n) {
      if (n instanceof i.dot.PointInt)
        return n;
      let t = new i.dot.PointInt();
      return n.x != null && (t.x = n.x | 0), n.y != null && (t.y = n.y | 0), t;
    }, l.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), n.x != null && n.hasOwnProperty("x") && (e.x = n.x), n.y != null && n.hasOwnProperty("y") && (e.y = n.y), e;
    }, l.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, l.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.PointInt";
    }, l;
  }(), p;
})();
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const _r = Symbol("Comlink.proxy"), ei = Symbol("Comlink.endpoint"), ti = Symbol("Comlink.releaseProxy"), ht = Symbol("Comlink.finalizer"), Ge = Symbol("Comlink.thrown"), Lr = (p) => typeof p == "object" && p !== null || typeof p == "function", ri = {
  canHandle: (p) => Lr(p) && p[_r],
  serialize(p) {
    const { port1: l, port2: n } = new MessageChannel();
    return bt(p, l), [n, [n]];
  },
  deserialize(p) {
    return p.start(), ai(p);
  }
}, ni = {
  canHandle: (p) => Lr(p) && Ge in p,
  serialize({ value: p }) {
    let l;
    return p instanceof Error ? l = {
      isError: !0,
      value: {
        message: p.message,
        name: p.name,
        stack: p.stack
      }
    } : l = { isError: !1, value: p }, [l, []];
  },
  deserialize(p) {
    throw p.isError ? Object.assign(new Error(p.value.message), p.value) : p.value;
  }
}, Mr = /* @__PURE__ */ new Map([
  ["proxy", ri],
  ["throw", ni]
]);
function oi(p, l) {
  for (const n of p)
    if (l === n || n === "*" || n instanceof RegExp && n.test(l))
      return !0;
  return !1;
}
function bt(p, l = globalThis, n = ["*"]) {
  l.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!oi(n, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: r, type: o, path: u } = Object.assign({ path: [] }, e.data), a = (e.data.argumentList || []).map(de);
    let g;
    try {
      const S = u.slice(0, -1).reduce((P, I) => P[I], p), y = u.reduce((P, I) => P[I], p);
      switch (o) {
        case "GET":
          g = y;
          break;
        case "SET":
          S[u.slice(-1)[0]] = de(e.data.value), g = !0;
          break;
        case "APPLY":
          g = y.apply(S, a);
          break;
        case "CONSTRUCT":
          {
            const P = new y(...a);
            g = di(P);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: P, port2: I } = new MessageChannel();
            bt(p, I), g = ui(P, [P]);
          }
          break;
        case "RELEASE":
          g = void 0;
          break;
        default:
          return;
      }
    } catch (S) {
      g = { value: S, [Ge]: 0 };
    }
    Promise.resolve(g).catch((S) => ({ value: S, [Ge]: 0 })).then((S) => {
      const [y, P] = He(S);
      l.postMessage(Object.assign(Object.assign({}, y), { id: r }), P), o === "RELEASE" && (l.removeEventListener("message", t), Rr(l), ht in p && typeof p[ht] == "function" && p[ht]());
    }).catch((S) => {
      const [y, P] = He({
        value: new TypeError("Unserializable return value"),
        [Ge]: 0
      });
      l.postMessage(Object.assign(Object.assign({}, y), { id: r }), P);
    });
  }), l.start && l.start();
}
function ii(p) {
  return p.constructor.name === "MessagePort";
}
function Rr(p) {
  ii(p) && p.close();
}
function ai(p, l) {
  const n = /* @__PURE__ */ new Map();
  return p.addEventListener("message", function(e) {
    const { data: r } = e;
    if (!r || !r.id)
      return;
    const o = n.get(r.id);
    if (o)
      try {
        o(r);
      } finally {
        n.delete(r.id);
      }
  }), gt(p, n, [], l);
}
function Ue(p) {
  if (p)
    throw new Error("Proxy has been released and is not useable");
}
function xr(p) {
  return ve(p, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    Rr(p);
  });
}
const $e = /* @__PURE__ */ new WeakMap(), Be = "FinalizationRegistry" in globalThis && new FinalizationRegistry((p) => {
  const l = ($e.get(p) || 0) - 1;
  $e.set(p, l), l === 0 && xr(p);
});
function si(p, l) {
  const n = ($e.get(l) || 0) + 1;
  $e.set(l, n), Be && Be.register(p, l, p);
}
function li(p) {
  Be && Be.unregister(p);
}
function gt(p, l, n = [], t = function() {
}) {
  let e = !1;
  const r = new Proxy(t, {
    get(o, u) {
      if (Ue(e), u === ti)
        return () => {
          li(r), xr(p), l.clear(), e = !0;
        };
      if (u === "then") {
        if (n.length === 0)
          return { then: () => r };
        const a = ve(p, l, {
          type: "GET",
          path: n.map((g) => g.toString())
        }).then(de);
        return a.then.bind(a);
      }
      return gt(p, l, [...n, u]);
    },
    set(o, u, a) {
      Ue(e);
      const [g, S] = He(a);
      return ve(p, l, {
        type: "SET",
        path: [...n, u].map((y) => y.toString()),
        value: g
      }, S).then(de);
    },
    apply(o, u, a) {
      Ue(e);
      const g = n[n.length - 1];
      if (g === ei)
        return ve(p, l, {
          type: "ENDPOINT"
        }).then(de);
      if (g === "bind")
        return gt(p, l, n.slice(0, -1));
      const [S, y] = Tr(a);
      return ve(p, l, {
        type: "APPLY",
        path: n.map((P) => P.toString()),
        argumentList: S
      }, y).then(de);
    },
    construct(o, u) {
      Ue(e);
      const [a, g] = Tr(u);
      return ve(p, l, {
        type: "CONSTRUCT",
        path: n.map((S) => S.toString()),
        argumentList: a
      }, g).then(de);
    }
  });
  return si(r, p), r;
}
function ci(p) {
  return Array.prototype.concat.apply([], p);
}
function Tr(p) {
  const l = p.map(He);
  return [l.map((n) => n[0]), ci(l.map((n) => n[1]))];
}
const Nr = /* @__PURE__ */ new WeakMap();
function ui(p, l) {
  return Nr.set(p, l), p;
}
function di(p) {
  return Object.assign(p, { [_r]: !0 });
}
function He(p) {
  for (const [l, n] of Mr)
    if (n.canHandle(p)) {
      const [t, e] = n.serialize(p);
      return [
        {
          type: "HANDLER",
          name: l,
          value: t
        },
        e
      ];
    }
  return [
    {
      type: "RAW",
      value: p
    },
    Nr.get(p) || []
  ];
}
function de(p) {
  switch (p.type) {
    case "HANDLER":
      return Mr.get(p.name).deserialize(p.value);
    case "RAW":
      return p.value;
  }
}
function ve(p, l, n, t) {
  return new Promise((e) => {
    const r = fi();
    l.set(r, e), p.start && p.start(), p.postMessage(Object.assign({ id: r }, n), t);
  });
}
function fi() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var pi = (() => {
  var p = import.meta.url;
  return async function(l = {}) {
    var n, t = l, e, r, o = new Promise((c, s) => {
      e = c, r = s;
    }), u = typeof window == "object", a = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var g = Object.assign({}, t), S = (c, s) => {
      throw s;
    }, y = "";
    function P(c) {
      return t.locateFile ? t.locateFile(c, y) : y + c;
    }
    var I, j;
    (u || a) && (a ? y = self.location.href : typeof document < "u" && document.currentScript && (y = document.currentScript.src), p && (y = p), y.startsWith("blob:") ? y = "" : y = y.slice(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1), a && (j = (c) => {
      var s = new XMLHttpRequest();
      return s.open("GET", c, !1), s.responseType = "arraybuffer", s.send(null), new Uint8Array(s.response);
    }), I = async (c) => {
      if (It(c))
        return new Promise((f, m) => {
          var b = new XMLHttpRequest();
          b.open("GET", c, !0), b.responseType = "arraybuffer", b.onload = () => {
            if (b.status == 200 || b.status == 0 && b.response) {
              f(b.response);
              return;
            }
            m(b.status);
          }, b.onerror = m, b.send(null);
        });
      var s = await fetch(c, { credentials: "same-origin" });
      if (s.ok)
        return s.arrayBuffer();
      throw new Error(s.status + " : " + s.url);
    }), t.print || console.log.bind(console);
    var F = t.printErr || console.error.bind(console);
    Object.assign(t, g), g = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var O = t.wasmBinary, D, M = !1, Q, te, $, me, we, re, W, vt, Ot, wt, Pt, It = (c) => c.startsWith("file://");
    function jt() {
      var c = D.buffer;
      t.HEAP8 = te = new Int8Array(c), t.HEAP16 = me = new Int16Array(c), t.HEAPU8 = $ = new Uint8Array(c), t.HEAPU16 = we = new Uint16Array(c), t.HEAP32 = re = new Int32Array(c), t.HEAPU32 = W = new Uint32Array(c), t.HEAPF32 = vt = new Float32Array(c), t.HEAPF64 = Pt = new Float64Array(c), t.HEAP64 = Ot = new BigInt64Array(c), t.HEAPU64 = wt = new BigUint64Array(c);
    }
    function Wr() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Xr(t.preRun.shift());
      St(Dt);
    }
    function zr() {
      R.C();
    }
    function Vr() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          qr(t.postRun.shift());
      St(At);
    }
    var ce = 0, Pe = null;
    function Ur(c) {
      var s;
      ce++, (s = t.monitorRunDependencies) == null || s.call(t, ce);
    }
    function Gr(c) {
      var f;
      if (ce--, (f = t.monitorRunDependencies) == null || f.call(t, ce), ce == 0 && Pe) {
        var s = Pe;
        Pe = null, s();
      }
    }
    function Se(c) {
      var f;
      (f = t.onAbort) == null || f.call(t, c), c = "Aborted(" + c + ")", F(c), M = !0, c += ". Build with -sASSERTIONS for more info.";
      var s = new WebAssembly.RuntimeError(c);
      throw r(s), s;
    }
    var Ye;
    function $r() {
      return t.locateFile ? P("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Br(c) {
      if (c == Ye && O)
        return new Uint8Array(O);
      if (j)
        return j(c);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Hr(c) {
      if (!O)
        try {
          var s = await I(c);
          return new Uint8Array(s);
        } catch {
        }
      return Br(c);
    }
    async function Yr(c, s) {
      try {
        var f = await Hr(c), m = await WebAssembly.instantiate(f, s);
        return m;
      } catch (b) {
        F(`failed to asynchronously prepare wasm: ${b}`), Se(b);
      }
    }
    async function Jr(c, s, f) {
      if (!c && typeof WebAssembly.instantiateStreaming == "function" && !It(s))
        try {
          var m = fetch(s, { credentials: "same-origin" }), b = await WebAssembly.instantiateStreaming(m, f);
          return b;
        } catch (w) {
          F(`wasm streaming compile failed: ${w}`), F("falling back to ArrayBuffer instantiation");
        }
      return Yr(s, f);
    }
    function Zr() {
      return { a: Io };
    }
    async function Kr() {
      function c(w, C) {
        return R = w.exports, R = k.instrumentWasmExports(R), D = R.B, jt(), R.H, Gr(), R;
      }
      Ur();
      function s(w) {
        return c(w.instance);
      }
      var f = Zr();
      if (t.instantiateWasm)
        return new Promise((w, C) => {
          t.instantiateWasm(f, (v, A) => {
            c(v), w(v.exports);
          });
        });
      Ye ?? (Ye = $r());
      try {
        var m = await Jr(O, Ye, f), b = s(m);
        return b;
      } catch (w) {
        return r(w), Promise.reject(w);
      }
    }
    class Ct {
      constructor(s) {
        Ne(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${s})`, this.status = s;
      }
    }
    var St = (c) => {
      for (; c.length > 0; )
        c.shift()(t);
    }, At = [], qr = (c) => At.unshift(c), Dt = [], Xr = (c) => Dt.unshift(c), kt = t.noExitRuntime || !0;
    class Qr {
      constructor(s) {
        this.excPtr = s, this.ptr = s - 24;
      }
      set_type(s) {
        W[this.ptr + 4 >> 2] = s;
      }
      get_type() {
        return W[this.ptr + 4 >> 2];
      }
      set_destructor(s) {
        W[this.ptr + 8 >> 2] = s;
      }
      get_destructor() {
        return W[this.ptr + 8 >> 2];
      }
      set_caught(s) {
        s = s ? 1 : 0, te[this.ptr + 12] = s;
      }
      get_caught() {
        return te[this.ptr + 12] != 0;
      }
      set_rethrown(s) {
        s = s ? 1 : 0, te[this.ptr + 13] = s;
      }
      get_rethrown() {
        return te[this.ptr + 13] != 0;
      }
      init(s, f) {
        this.set_adjusted_ptr(0), this.set_type(s), this.set_destructor(f);
      }
      set_adjusted_ptr(s) {
        W[this.ptr + 16 >> 2] = s;
      }
      get_adjusted_ptr() {
        return W[this.ptr + 16 >> 2];
      }
    }
    var Tt = 0, en = (c, s, f) => {
      var m = new Qr(c);
      throw m.init(s, f), Tt = c, Tt;
    }, tn = () => Se(""), Ae = (c) => {
      if (c === null)
        return "null";
      var s = typeof c;
      return s === "object" || s === "array" || s === "function" ? c.toString() : "" + c;
    }, rn = () => {
      for (var c = new Array(256), s = 0; s < 256; ++s)
        c[s] = String.fromCharCode(s);
      Et = c;
    }, Et, z = (c) => {
      for (var s = "", f = c; $[f]; )
        s += Et[$[f++]];
      return s;
    }, ye = {}, ue = {}, De = {}, he, x = (c) => {
      throw new he(c);
    }, Ft, ke = (c) => {
      throw new Ft(c);
    }, ge = (c, s, f) => {
      c.forEach((v) => De[v] = s);
      function m(v) {
        var A = f(v);
        A.length !== c.length && ke("Mismatched type converter count");
        for (var _ = 0; _ < c.length; ++_)
          H(c[_], A[_]);
      }
      var b = new Array(s.length), w = [], C = 0;
      s.forEach((v, A) => {
        ue.hasOwnProperty(v) ? b[A] = ue[v] : (w.push(v), ye.hasOwnProperty(v) || (ye[v] = []), ye[v].push(() => {
          b[A] = ue[v], ++C, C === w.length && m(b);
        }));
      }), w.length === 0 && m(b);
    };
    function nn(c, s, f = {}) {
      var m = s.name;
      if (c || x(`type "${m}" must have a positive integer typeid pointer`), ue.hasOwnProperty(c)) {
        if (f.ignoreDuplicateRegistrations)
          return;
        x(`Cannot register type '${m}' twice`);
      }
      if (ue[c] = s, delete De[c], ye.hasOwnProperty(c)) {
        var b = ye[c];
        delete ye[c], b.forEach((w) => w());
      }
    }
    function H(c, s, f = {}) {
      return nn(c, s, f);
    }
    var _t = (c, s, f) => {
      switch (s) {
        case 1:
          return f ? (m) => te[m] : (m) => $[m];
        case 2:
          return f ? (m) => me[m >> 1] : (m) => we[m >> 1];
        case 4:
          return f ? (m) => re[m >> 2] : (m) => W[m >> 2];
        case 8:
          return f ? (m) => Ot[m >> 3] : (m) => wt[m >> 3];
        default:
          throw new TypeError(`invalid integer width (${s}): ${c}`);
      }
    }, on = (c, s, f, m, b) => {
      s = z(s);
      var w = s.indexOf("u") != -1;
      H(c, { name: s, fromWireType: (C) => C, toWireType: function(C, v) {
        if (typeof v != "bigint" && typeof v != "number")
          throw new TypeError(`Cannot convert "${Ae(v)}" to ${this.name}`);
        return typeof v == "number" && (v = BigInt(v)), v;
      }, argPackAdvance: J, readValueFromPointer: _t(s, f, !w), destructorFunction: null });
    }, J = 8, an = (c, s, f, m) => {
      s = z(s), H(c, { name: s, fromWireType: function(b) {
        return !!b;
      }, toWireType: function(b, w) {
        return w ? f : m;
      }, argPackAdvance: J, readValueFromPointer: function(b) {
        return this.fromWireType($[b]);
      }, destructorFunction: null });
    }, sn = (c) => ({ count: c.count, deleteScheduled: c.deleteScheduled, preservePointerOnDelete: c.preservePointerOnDelete, ptr: c.ptr, ptrType: c.ptrType, smartPtr: c.smartPtr, smartPtrType: c.smartPtrType }), Je = (c) => {
      function s(f) {
        return f.$$.ptrType.registeredClass.name;
      }
      x(s(c) + " instance already deleted");
    }, Ze = !1, Lt = (c) => {
    }, ln = (c) => {
      c.smartPtr ? c.smartPtrType.rawDestructor(c.smartPtr) : c.ptrType.registeredClass.rawDestructor(c.ptr);
    }, Mt = (c) => {
      c.count.value -= 1;
      var s = c.count.value === 0;
      s && ln(c);
    }, Rt = (c, s, f) => {
      if (s === f)
        return c;
      if (f.baseClass === void 0)
        return null;
      var m = Rt(c, s, f.baseClass);
      return m === null ? null : f.downcast(m);
    }, xt = {}, cn = {}, un = (c, s) => {
      for (s === void 0 && x("ptr should not be undefined"); c.baseClass; )
        s = c.upcast(s), c = c.baseClass;
      return s;
    }, dn = (c, s) => (s = un(c, s), cn[s]), Te = (c, s) => {
      (!s.ptrType || !s.ptr) && ke("makeClassHandle requires ptr and ptrType");
      var f = !!s.smartPtrType, m = !!s.smartPtr;
      return f !== m && ke("Both smartPtrType and smartPtr must be specified"), s.count = { value: 1 }, Ie(Object.create(c, { $$: { value: s, writable: !0 } }));
    };
    function fn(c) {
      var s = this.getPointee(c);
      if (!s)
        return this.destructor(c), null;
      var f = dn(this.registeredClass, s);
      if (f !== void 0) {
        if (f.$$.count.value === 0)
          return f.$$.ptr = s, f.$$.smartPtr = c, f.clone();
        var m = f.clone();
        return this.destructor(c), m;
      }
      function b() {
        return this.isSmartPointer ? Te(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: s, smartPtrType: this, smartPtr: c }) : Te(this.registeredClass.instancePrototype, { ptrType: this, ptr: c });
      }
      var w = this.registeredClass.getActualType(s), C = xt[w];
      if (!C)
        return b.call(this);
      var v;
      this.isConst ? v = C.constPointerType : v = C.pointerType;
      var A = Rt(s, this.registeredClass, v.registeredClass);
      return A === null ? b.call(this) : this.isSmartPointer ? Te(v.registeredClass.instancePrototype, { ptrType: v, ptr: A, smartPtrType: this, smartPtr: c }) : Te(v.registeredClass.instancePrototype, { ptrType: v, ptr: A });
    }
    var Ie = (c) => typeof FinalizationRegistry > "u" ? (Ie = (s) => s, c) : (Ze = new FinalizationRegistry((s) => {
      Mt(s.$$);
    }), Ie = (s) => {
      var f = s.$$, m = !!f.smartPtr;
      if (m) {
        var b = { $$: f };
        Ze.register(s, b, s);
      }
      return s;
    }, Lt = (s) => Ze.unregister(s), Ie(c)), pn = () => {
      Object.assign(Ee.prototype, { isAliasOf(c) {
        if (!(this instanceof Ee) || !(c instanceof Ee))
          return !1;
        var s = this.$$.ptrType.registeredClass, f = this.$$.ptr;
        c.$$ = c.$$;
        for (var m = c.$$.ptrType.registeredClass, b = c.$$.ptr; s.baseClass; )
          f = s.upcast(f), s = s.baseClass;
        for (; m.baseClass; )
          b = m.upcast(b), m = m.baseClass;
        return s === m && f === b;
      }, clone() {
        if (this.$$.ptr || Je(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var c = Ie(Object.create(Object.getPrototypeOf(this), { $$: { value: sn(this.$$) } }));
        return c.$$.count.value += 1, c.$$.deleteScheduled = !1, c;
      }, delete() {
        this.$$.ptr || Je(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), Lt(this), Mt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Je(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ee() {
    }
    var Fe = (c, s) => Object.defineProperty(s, "name", { value: c }), mn = (c, s, f) => {
      if (c[s].overloadTable === void 0) {
        var m = c[s];
        c[s] = function(...b) {
          return c[s].overloadTable.hasOwnProperty(b.length) || x(`Function '${f}' called with an invalid number of arguments (${b.length}) - expects one of (${c[s].overloadTable})!`), c[s].overloadTable[b.length].apply(this, b);
        }, c[s].overloadTable = [], c[s].overloadTable[m.argCount] = m;
      }
    }, Ke = (c, s, f) => {
      t.hasOwnProperty(c) ? ((f === void 0 || t[c].overloadTable !== void 0 && t[c].overloadTable[f] !== void 0) && x(`Cannot register public name '${c}' twice`), mn(t, c, c), t[c].overloadTable.hasOwnProperty(f) && x(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`), t[c].overloadTable[f] = s) : (t[c] = s, t[c].argCount = f);
    }, yn = 48, hn = 57, gn = (c) => {
      c = c.replace(/[^a-zA-Z0-9_]/g, "$");
      var s = c.charCodeAt(0);
      return s >= yn && s <= hn ? `_${c}` : c;
    };
    function bn(c, s, f, m, b, w, C, v) {
      this.name = c, this.constructor = s, this.instancePrototype = f, this.rawDestructor = m, this.baseClass = b, this.getActualType = w, this.upcast = C, this.downcast = v, this.pureVirtualFunctions = [];
    }
    var _e = (c, s, f) => {
      for (; s !== f; )
        s.upcast || x(`Expected null or instance of ${f.name}, got an instance of ${s.name}`), c = s.upcast(c), s = s.baseClass;
      return c;
    };
    function vn(c, s) {
      if (s === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      s.$$ || x(`Cannot pass "${Ae(s)}" as a ${this.name}`), s.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var f = s.$$.ptrType.registeredClass, m = _e(s.$$.ptr, f, this.registeredClass);
      return m;
    }
    function On(c, s) {
      var f;
      if (s === null)
        return this.isReference && x(`null is not a valid ${this.name}`), this.isSmartPointer ? (f = this.rawConstructor(), c !== null && c.push(this.rawDestructor, f), f) : 0;
      (!s || !s.$$) && x(`Cannot pass "${Ae(s)}" as a ${this.name}`), s.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && s.$$.ptrType.isConst && x(`Cannot convert argument of type ${s.$$.smartPtrType ? s.$$.smartPtrType.name : s.$$.ptrType.name} to parameter type ${this.name}`);
      var m = s.$$.ptrType.registeredClass;
      if (f = _e(s.$$.ptr, m, this.registeredClass), this.isSmartPointer)
        switch (s.$$.smartPtr === void 0 && x("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            s.$$.smartPtrType === this ? f = s.$$.smartPtr : x(`Cannot convert argument of type ${s.$$.smartPtrType ? s.$$.smartPtrType.name : s.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            f = s.$$.smartPtr;
            break;
          case 2:
            if (s.$$.smartPtrType === this)
              f = s.$$.smartPtr;
            else {
              var b = s.clone();
              f = this.rawShare(f, Y.toHandle(() => b.delete())), c !== null && c.push(this.rawDestructor, f);
            }
            break;
          default:
            x("Unsupporting sharing policy");
        }
      return f;
    }
    function wn(c, s) {
      if (s === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      s.$$ || x(`Cannot pass "${Ae(s)}" as a ${this.name}`), s.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), s.$$.ptrType.isConst && x(`Cannot convert argument of type ${s.$$.ptrType.name} to parameter type ${this.name}`);
      var f = s.$$.ptrType.registeredClass, m = _e(s.$$.ptr, f, this.registeredClass);
      return m;
    }
    function Le(c) {
      return this.fromWireType(W[c >> 2]);
    }
    var Pn = () => {
      Object.assign(Me.prototype, { getPointee(c) {
        return this.rawGetPointee && (c = this.rawGetPointee(c)), c;
      }, destructor(c) {
        var s;
        (s = this.rawDestructor) == null || s.call(this, c);
      }, argPackAdvance: J, readValueFromPointer: Le, fromWireType: fn });
    };
    function Me(c, s, f, m, b, w, C, v, A, _, T) {
      this.name = c, this.registeredClass = s, this.isReference = f, this.isConst = m, this.isSmartPointer = b, this.pointeeType = w, this.sharingPolicy = C, this.rawGetPointee = v, this.rawConstructor = A, this.rawShare = _, this.rawDestructor = T, !b && s.baseClass === void 0 ? m ? (this.toWireType = vn, this.destructorFunction = null) : (this.toWireType = wn, this.destructorFunction = null) : this.toWireType = On;
    }
    var Nt = (c, s, f) => {
      t.hasOwnProperty(c) || ke("Replacing nonexistent public symbol"), t[c].overloadTable !== void 0 && f !== void 0 ? t[c].overloadTable[f] = s : (t[c] = s, t[c].argCount = f);
    }, In = (c, s, f) => {
      c = c.replace(/p/g, "i");
      var m = t["dynCall_" + c];
      return m(s, ...f);
    }, jn = (c, s, f = []) => {
      var m = In(c, s, f);
      return m;
    }, Cn = (c, s) => (...f) => jn(c, s, f), ne = (c, s) => {
      c = z(c);
      function f() {
        return Cn(c, s);
      }
      var m = f();
      return typeof m != "function" && x(`unknown function pointer with signature ${c}: ${s}`), m;
    }, Sn = (c, s) => {
      var f = Fe(s, function(m) {
        this.name = s, this.message = m;
        var b = new Error(m).stack;
        b !== void 0 && (this.stack = this.toString() + `
` + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return f.prototype = Object.create(c.prototype), f.prototype.constructor = f, f.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, f;
    }, Wt, zt = (c) => {
      var s = jo(c), f = z(s);
      return ee(s), f;
    }, je = (c, s) => {
      var f = [], m = {};
      function b(w) {
        if (!m[w] && !ue[w]) {
          if (De[w]) {
            De[w].forEach(b);
            return;
          }
          f.push(w), m[w] = !0;
        }
      }
      throw s.forEach(b), new Wt(`${c}: ` + f.map(zt).join([", "]));
    }, An = (c, s, f, m, b, w, C, v, A, _, T, N, V) => {
      T = z(T), w = ne(b, w), v && (v = ne(C, v)), _ && (_ = ne(A, _)), V = ne(N, V);
      var Z = gn(T);
      Ke(Z, function() {
        je(`Cannot construct ${T} due to unbound types`, [m]);
      }), ge([c, s, f], m ? [m] : [], (K) => {
        var Xt;
        K = K[0];
        var ie, B;
        m ? (ie = K.registeredClass, B = ie.instancePrototype) : B = Ee.prototype;
        var q = Fe(T, function(...nt) {
          if (Object.getPrototypeOf(this) !== ae)
            throw new he("Use 'new' to construct " + T);
          if (U.constructor_body === void 0)
            throw new he(T + " has no accessible constructor");
          var Qt = U.constructor_body[nt.length];
          if (Qt === void 0)
            throw new he(`Tried to invoke ctor of ${T} with invalid number of parameters (${nt.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return Qt.apply(this, nt);
        }), ae = Object.create(B, { constructor: { value: q } });
        q.prototype = ae;
        var U = new bn(T, q, ae, V, ie, w, v, _);
        U.baseClass && ((Xt = U.baseClass).__derivedClasses ?? (Xt.__derivedClasses = []), U.baseClass.__derivedClasses.push(U));
        var se = new Me(T, U, !0, !1, !1), xe = new Me(T + "*", U, !1, !1, !1), qt = new Me(T + " const*", U, !1, !0, !1);
        return xt[c] = { pointerType: xe, constPointerType: qt }, Nt(Z, q), [se, xe, qt];
      });
    }, Vt = (c, s) => {
      for (var f = [], m = 0; m < c; m++)
        f.push(W[s + m * 4 >> 2]);
      return f;
    }, qe = (c) => {
      for (; c.length; ) {
        var s = c.pop(), f = c.pop();
        f(s);
      }
    };
    function Dn(c) {
      for (var s = 1; s < c.length; ++s)
        if (c[s] !== null && c[s].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Re = (c) => {
      try {
        return c();
      } catch (s) {
        Se(s);
      }
    }, Ut = (c) => {
      if (c instanceof Ct || c == "unwind")
        return Q;
      S(1, c);
    }, Gt = 0, $t = () => kt || Gt > 0, Bt = (c) => {
      var s;
      Q = c, $t() || ((s = t.onExit) == null || s.call(t, c), M = !0), S(c, new Ct(c));
    }, kn = (c, s) => {
      Q = c, Bt(c);
    }, Tn = kn, En = () => {
      if (!$t())
        try {
          Tn(Q);
        } catch (c) {
          Ut(c);
        }
    }, Ht = (c) => {
      if (!M)
        try {
          c(), En();
        } catch (s) {
          Ut(s);
        }
    }, k = { instrumentWasmImports(c) {
      var s = /^(__asyncjs__.*)$/;
      for (let [f, m] of Object.entries(c))
        typeof m == "function" && (m.isAsync || s.test(f));
    }, instrumentWasmExports(c) {
      var s = {};
      for (let [f, m] of Object.entries(c))
        typeof m == "function" ? s[f] = (...b) => {
          k.exportCallStack.push(f);
          try {
            return m(...b);
          } finally {
            M || (k.exportCallStack.pop(), k.maybeStopUnwind());
          }
        } : s[f] = m;
      return s;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(c) {
      var s = k.callStackNameToId[c];
      return s === void 0 && (s = k.callStackId++, k.callStackNameToId[c] = s, k.callStackIdToName[s] = c), s;
    }, maybeStopUnwind() {
      k.currData && k.state === k.State.Unwinding && k.exportCallStack.length === 0 && (k.state = k.State.Normal, Re(Ao), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((c, s) => {
        k.asyncPromiseHandlers = { resolve: c, reject: s };
      });
    }, allocateData() {
      var c = tt(12 + k.StackSize);
      return k.setDataHeader(c, c + 12, k.StackSize), k.setDataRewindFunc(c), c;
    }, setDataHeader(c, s, f) {
      W[c >> 2] = s, W[c + 4 >> 2] = s + f;
    }, setDataRewindFunc(c) {
      var s = k.exportCallStack[0], f = k.getCallStackId(s);
      re[c + 8 >> 2] = f;
    }, getDataRewindFuncName(c) {
      var s = re[c + 8 >> 2], f = k.callStackIdToName[s];
      return f;
    }, getDataRewindFunc(c) {
      var s = R[c];
      return s;
    }, doRewind(c) {
      var s = k.getDataRewindFuncName(c), f = k.getDataRewindFunc(s);
      return f();
    }, handleSleep(c) {
      if (!M) {
        if (k.state === k.State.Normal) {
          var s = !1, f = !1;
          c((m = 0) => {
            if (!M && (k.handleSleepReturnValue = m, s = !0, !!f)) {
              k.state = k.State.Rewinding, Re(() => Do(k.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var b, w = !1;
              try {
                b = k.doRewind(k.currData);
              } catch (A) {
                b = A, w = !0;
              }
              var C = !1;
              if (!k.currData) {
                var v = k.asyncPromiseHandlers;
                v && (k.asyncPromiseHandlers = null, (w ? v.reject : v.resolve)(b), C = !0);
              }
              if (w && !C)
                throw b;
            }
          }), f = !0, s || (k.state = k.State.Unwinding, k.currData = k.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Re(() => So(k.currData)));
        } else k.state === k.State.Rewinding ? (k.state = k.State.Normal, Re(ko), ee(k.currData), k.currData = null, k.sleepCallbacks.forEach(Ht)) : Se(`invalid state: ${k.state}`);
        return k.handleSleepReturnValue;
      }
    }, handleAsync(c) {
      return k.handleSleep((s) => {
        c().then(s);
      });
    } };
    function Yt(c, s, f, m, b, w) {
      var C = s.length;
      C < 2 && x("argTypes array size mismatch! Must at least get return value and 'this' types!"), s[1];
      var v = Dn(s), A = s[0].name !== "void", _ = C - 2, T = new Array(_), N = [], V = [], Z = function(...K) {
        V.length = 0;
        var ie;
        N.length = 1, N[0] = b;
        for (var B = 0; B < _; ++B)
          T[B] = s[B + 2].toWireType(V, K[B]), N.push(T[B]);
        var q = m(...N);
        function ae(U) {
          if (v)
            qe(V);
          else
            for (var se = 2; se < s.length; se++) {
              var xe = se === 1 ? ie : T[se - 2];
              s[se].destructorFunction !== null && s[se].destructorFunction(xe);
            }
          if (A)
            return s[0].fromWireType(U);
        }
        return k.currData ? k.whenDone().then(ae) : ae(q);
      };
      return Fe(c, Z);
    }
    var Fn = (c, s, f, m, b, w) => {
      var C = Vt(s, f);
      b = ne(m, b), ge([], [c], (v) => {
        v = v[0];
        var A = `constructor ${v.name}`;
        if (v.registeredClass.constructor_body === void 0 && (v.registeredClass.constructor_body = []), v.registeredClass.constructor_body[s - 1] !== void 0)
          throw new he(`Cannot register multiple constructors with identical number of parameters (${s - 1}) for class '${v.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return v.registeredClass.constructor_body[s - 1] = () => {
          je(`Cannot construct ${v.name} due to unbound types`, C);
        }, ge([], C, (_) => (_.splice(1, 0, null), v.registeredClass.constructor_body[s - 1] = Yt(A, _, null, b, w), [])), [];
      });
    }, Jt = (c, s, f) => (c instanceof Object || x(`${f} with invalid "this": ${c}`), c instanceof s.registeredClass.constructor || x(`${f} incompatible with "this" of type ${c.constructor.name}`), c.$$.ptr || x(`cannot call emscripten binding method ${f} on deleted object`), _e(c.$$.ptr, c.$$.ptrType.registeredClass, s.registeredClass)), _n = (c, s, f, m, b, w, C, v, A, _) => {
      s = z(s), b = ne(m, b), ge([], [c], (T) => {
        T = T[0];
        var N = `${T.name}.${s}`, V = { get() {
          je(`Cannot access ${N} due to unbound types`, [f, C]);
        }, enumerable: !0, configurable: !0 };
        return A ? V.set = () => je(`Cannot access ${N} due to unbound types`, [f, C]) : V.set = (Z) => x(N + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, s, V), ge([], A ? [f, C] : [f], (Z) => {
          var K = Z[0], ie = { get() {
            var q = Jt(this, T, N + " getter");
            return K.fromWireType(b(w, q));
          }, enumerable: !0 };
          if (A) {
            A = ne(v, A);
            var B = Z[1];
            ie.set = function(q) {
              var ae = Jt(this, T, N + " setter"), U = [];
              A(_, ae, B.toWireType(U, q)), qe(U);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, s, ie), [];
        }), [];
      });
    }, Xe = [], oe = [], Qe = (c) => {
      c > 9 && --oe[c + 1] === 0 && (oe[c] = void 0, Xe.push(c));
    }, Ln = () => oe.length / 2 - 5 - Xe.length, Mn = () => {
      oe.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Ln;
    }, Y = { toValue: (c) => (c || x("Cannot use deleted val. handle = " + c), oe[c]), toHandle: (c) => {
      switch (c) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const s = Xe.pop() || oe.length;
          return oe[s] = c, oe[s + 1] = 1, s;
        }
      }
    } }, Rn = { name: "emscripten::val", fromWireType: (c) => {
      var s = Y.toValue(c);
      return Qe(c), s;
    }, toWireType: (c, s) => Y.toHandle(s), argPackAdvance: J, readValueFromPointer: Le, destructorFunction: null }, xn = (c) => H(c, Rn), Nn = (c, s, f) => {
      switch (s) {
        case 1:
          return f ? function(m) {
            return this.fromWireType(te[m]);
          } : function(m) {
            return this.fromWireType($[m]);
          };
        case 2:
          return f ? function(m) {
            return this.fromWireType(me[m >> 1]);
          } : function(m) {
            return this.fromWireType(we[m >> 1]);
          };
        case 4:
          return f ? function(m) {
            return this.fromWireType(re[m >> 2]);
          } : function(m) {
            return this.fromWireType(W[m >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${s}): ${c}`);
      }
    }, Wn = (c, s, f, m) => {
      s = z(s);
      function b() {
      }
      b.values = {}, H(c, { name: s, constructor: b, fromWireType: function(w) {
        return this.constructor.values[w];
      }, toWireType: (w, C) => C.value, argPackAdvance: J, readValueFromPointer: Nn(s, f, m), destructorFunction: null }), Ke(s, b);
    }, et = (c, s) => {
      var f = ue[c];
      return f === void 0 && x(`${s} has unknown type ${zt(c)}`), f;
    }, zn = (c, s, f) => {
      var m = et(c, "enum");
      s = z(s);
      var b = m.constructor, w = Object.create(m.constructor.prototype, { value: { value: f }, constructor: { value: Fe(`${m.name}_${s}`, function() {
      }) } });
      b.values[f] = w, b[s] = w;
    }, Vn = (c, s) => {
      switch (s) {
        case 4:
          return function(f) {
            return this.fromWireType(vt[f >> 2]);
          };
        case 8:
          return function(f) {
            return this.fromWireType(Pt[f >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${s}): ${c}`);
      }
    }, Un = (c, s, f) => {
      s = z(s), H(c, { name: s, fromWireType: (m) => m, toWireType: (m, b) => b, argPackAdvance: J, readValueFromPointer: Vn(s, f), destructorFunction: null });
    }, Gn = (c) => {
      c = c.trim();
      const s = c.indexOf("(");
      return s === -1 ? c : c.slice(0, s);
    }, $n = (c, s, f, m, b, w, C, v) => {
      var A = Vt(s, f);
      c = z(c), c = Gn(c), b = ne(m, b), Ke(c, function() {
        je(`Cannot call ${c} due to unbound types`, A);
      }, s - 1), ge([], A, (_) => {
        var T = [_[0], null].concat(_.slice(1));
        return Nt(c, Yt(c, T, null, b, w), s - 1), [];
      });
    }, Bn = (c, s, f, m, b) => {
      s = z(s);
      var w = (T) => T;
      if (m === 0) {
        var C = 32 - 8 * f;
        w = (T) => T << C >>> C;
      }
      var v = s.includes("unsigned"), A = (T, N) => {
      }, _;
      v ? _ = function(T, N) {
        return A(N, this.name), N >>> 0;
      } : _ = function(T, N) {
        return A(N, this.name), N;
      }, H(c, { name: s, fromWireType: w, toWireType: _, argPackAdvance: J, readValueFromPointer: _t(s, f, m !== 0), destructorFunction: null });
    }, Hn = (c, s, f) => {
      var m = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], b = m[s];
      function w(C) {
        var v = W[C >> 2], A = W[C + 4 >> 2];
        return new b(te.buffer, A, v);
      }
      f = z(f), H(c, { name: f, fromWireType: w, argPackAdvance: J, readValueFromPointer: w }, { ignoreDuplicateRegistrations: !0 });
    }, Yn = (c, s, f, m) => {
      if (!(m > 0)) return 0;
      for (var b = f, w = f + m - 1, C = 0; C < c.length; ++C) {
        var v = c.charCodeAt(C);
        if (v >= 55296 && v <= 57343) {
          var A = c.charCodeAt(++C);
          v = 65536 + ((v & 1023) << 10) | A & 1023;
        }
        if (v <= 127) {
          if (f >= w) break;
          s[f++] = v;
        } else if (v <= 2047) {
          if (f + 1 >= w) break;
          s[f++] = 192 | v >> 6, s[f++] = 128 | v & 63;
        } else if (v <= 65535) {
          if (f + 2 >= w) break;
          s[f++] = 224 | v >> 12, s[f++] = 128 | v >> 6 & 63, s[f++] = 128 | v & 63;
        } else {
          if (f + 3 >= w) break;
          s[f++] = 240 | v >> 18, s[f++] = 128 | v >> 12 & 63, s[f++] = 128 | v >> 6 & 63, s[f++] = 128 | v & 63;
        }
      }
      return s[f] = 0, f - b;
    }, Jn = (c, s, f) => Yn(c, $, s, f), Zn = (c) => {
      for (var s = 0, f = 0; f < c.length; ++f) {
        var m = c.charCodeAt(f);
        m <= 127 ? s++ : m <= 2047 ? s += 2 : m >= 55296 && m <= 57343 ? (s += 4, ++f) : s += 3;
      }
      return s;
    }, Zt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Kn = (c, s = 0, f = NaN) => {
      for (var m = s + f, b = s; c[b] && !(b >= m); ) ++b;
      if (b - s > 16 && c.buffer && Zt)
        return Zt.decode(c.subarray(s, b));
      for (var w = ""; s < b; ) {
        var C = c[s++];
        if (!(C & 128)) {
          w += String.fromCharCode(C);
          continue;
        }
        var v = c[s++] & 63;
        if ((C & 224) == 192) {
          w += String.fromCharCode((C & 31) << 6 | v);
          continue;
        }
        var A = c[s++] & 63;
        if ((C & 240) == 224 ? C = (C & 15) << 12 | v << 6 | A : C = (C & 7) << 18 | v << 12 | A << 6 | c[s++] & 63, C < 65536)
          w += String.fromCharCode(C);
        else {
          var _ = C - 65536;
          w += String.fromCharCode(55296 | _ >> 10, 56320 | _ & 1023);
        }
      }
      return w;
    }, qn = (c, s) => c ? Kn($, c, s) : "", Xn = (c, s) => {
      s = z(s), H(c, { name: s, fromWireType(f) {
        for (var m = W[f >> 2], b = f + 4, w, C, v = b, C = 0; C <= m; ++C) {
          var A = b + C;
          if (C == m || $[A] == 0) {
            var _ = A - v, T = qn(v, _);
            w === void 0 ? w = T : (w += "\0", w += T), v = A + 1;
          }
        }
        return ee(f), w;
      }, toWireType(f, m) {
        m instanceof ArrayBuffer && (m = new Uint8Array(m));
        var b, w = typeof m == "string";
        w || m instanceof Uint8Array || m instanceof Uint8ClampedArray || m instanceof Int8Array || x("Cannot pass non-string to std::string"), w ? b = Zn(m) : b = m.length;
        var C = tt(4 + b + 1), v = C + 4;
        if (W[C >> 2] = b, w)
          Jn(m, v, b + 1);
        else if (w)
          for (var A = 0; A < b; ++A) {
            var _ = m.charCodeAt(A);
            _ > 255 && (ee(C), x("String has UTF-16 code units that do not fit in 8 bits")), $[v + A] = _;
          }
        else
          for (var A = 0; A < b; ++A)
            $[v + A] = m[A];
        return f !== null && f.push(ee, C), C;
      }, argPackAdvance: J, readValueFromPointer: Le, destructorFunction(f) {
        ee(f);
      } });
    }, Kt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Qn = (c, s) => {
      for (var f = c, m = f >> 1, b = m + s / 2; !(m >= b) && we[m]; ) ++m;
      if (f = m << 1, f - c > 32 && Kt) return Kt.decode($.subarray(c, f));
      for (var w = "", C = 0; !(C >= s / 2); ++C) {
        var v = me[c + C * 2 >> 1];
        if (v == 0) break;
        w += String.fromCharCode(v);
      }
      return w;
    }, eo = (c, s, f) => {
      if (f ?? (f = 2147483647), f < 2) return 0;
      f -= 2;
      for (var m = s, b = f < c.length * 2 ? f / 2 : c.length, w = 0; w < b; ++w) {
        var C = c.charCodeAt(w);
        me[s >> 1] = C, s += 2;
      }
      return me[s >> 1] = 0, s - m;
    }, to = (c) => c.length * 2, ro = (c, s) => {
      for (var f = 0, m = ""; !(f >= s / 4); ) {
        var b = re[c + f * 4 >> 2];
        if (b == 0) break;
        if (++f, b >= 65536) {
          var w = b - 65536;
          m += String.fromCharCode(55296 | w >> 10, 56320 | w & 1023);
        } else
          m += String.fromCharCode(b);
      }
      return m;
    }, no = (c, s, f) => {
      if (f ?? (f = 2147483647), f < 4) return 0;
      for (var m = s, b = m + f - 4, w = 0; w < c.length; ++w) {
        var C = c.charCodeAt(w);
        if (C >= 55296 && C <= 57343) {
          var v = c.charCodeAt(++w);
          C = 65536 + ((C & 1023) << 10) | v & 1023;
        }
        if (re[s >> 2] = C, s += 4, s + 4 > b) break;
      }
      return re[s >> 2] = 0, s - m;
    }, oo = (c) => {
      for (var s = 0, f = 0; f < c.length; ++f) {
        var m = c.charCodeAt(f);
        m >= 55296 && m <= 57343 && ++f, s += 4;
      }
      return s;
    }, io = (c, s, f) => {
      f = z(f);
      var m, b, w, C;
      s === 2 ? (m = Qn, b = eo, C = to, w = (v) => we[v >> 1]) : s === 4 && (m = ro, b = no, C = oo, w = (v) => W[v >> 2]), H(c, { name: f, fromWireType: (v) => {
        for (var A = W[v >> 2], _, T = v + 4, N = 0; N <= A; ++N) {
          var V = v + 4 + N * s;
          if (N == A || w(V) == 0) {
            var Z = V - T, K = m(T, Z);
            _ === void 0 ? _ = K : (_ += "\0", _ += K), T = V + s;
          }
        }
        return ee(v), _;
      }, toWireType: (v, A) => {
        typeof A != "string" && x(`Cannot pass non-string to C++ string type ${f}`);
        var _ = C(A), T = tt(4 + _ + s);
        return W[T >> 2] = _ / s, b(A, T + 4, _ + s), v !== null && v.push(ee, T), T;
      }, argPackAdvance: J, readValueFromPointer: Le, destructorFunction(v) {
        ee(v);
      } });
    }, ao = (c, s) => {
      s = z(s), H(c, { isVoid: !0, name: s, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (f, m) => {
      } });
    }, so = () => {
      kt = !1, Gt = 0;
    }, lo = (c, s, f) => {
      var m = [], b = c.toWireType(m, f);
      return m.length && (W[s >> 2] = Y.toHandle(m)), b;
    }, co = (c, s, f) => (c = Y.toValue(c), s = et(s, "emval::as"), lo(s, f, c)), uo = (c, s) => (c = Y.toValue(c), s = Y.toValue(s), Y.toHandle(c[s])), fo = {}, po = (c) => {
      var s = fo[c];
      return s === void 0 ? z(c) : s;
    }, mo = (c) => Y.toHandle(po(c)), yo = (c) => {
      var s = Y.toValue(c);
      qe(s), Qe(c);
    }, ho = (c, s) => {
      c = et(c, "_emval_take_value");
      var f = c.readValueFromPointer(s);
      return Y.toHandle(f);
    }, Ce = {}, go = () => performance.now(), bo = (c, s) => {
      if (Ce[c] && (clearTimeout(Ce[c].id), delete Ce[c]), !s) return 0;
      var f = setTimeout(() => {
        delete Ce[c], Ht(() => Co(c, go()));
      }, s);
      return Ce[c] = { id: f, timeout_ms: s }, 0;
    }, vo = () => 2147483648, Oo = (c, s) => Math.ceil(c / s) * s, wo = (c) => {
      var s = D.buffer, f = (c - s.byteLength + 65535) / 65536 | 0;
      try {
        return D.grow(f), jt(), 1;
      } catch {
      }
    }, Po = (c) => {
      var s = $.length;
      c >>>= 0;
      var f = vo();
      if (c > f)
        return !1;
      for (var m = 1; m <= 4; m *= 2) {
        var b = s * (1 + 0.2 / m);
        b = Math.min(b, c + 100663296);
        var w = Math.min(f, Oo(Math.max(c, b), 65536)), C = wo(w);
        if (C)
          return !0;
      }
      return !1;
    };
    rn(), he = t.BindingError = class extends Error {
      constructor(s) {
        super(s), this.name = "BindingError";
      }
    }, Ft = t.InternalError = class extends Error {
      constructor(s) {
        super(s), this.name = "InternalError";
      }
    }, pn(), Pn(), Wt = t.UnboundTypeError = Sn(Error, "UnboundTypeError"), Mn();
    var Io = { n: en, u: tn, m: on, x: an, f: An, e: Fn, a: _n, v: xn, k: Wn, g: zn, l: Un, b: $n, d: Bn, c: Hn, w: Xn, h: io, y: ao, r: so, i: co, z: Qe, j: uo, p: mo, o: yo, A: ho, s: bo, t: Po, q: Bt }, R = await Kr();
    R.C;
    var jo = R.D, tt = t._malloc = R.E, ee = t._free = R.F, Co = R.G;
    t.dynCall_v = R.I, t.dynCall_ii = R.J, t.dynCall_vi = R.K, t.dynCall_i = R.L, t.dynCall_iii = R.M, t.dynCall_viii = R.N, t.dynCall_fii = R.O, t.dynCall_viif = R.P, t.dynCall_viiii = R.Q, t.dynCall_viiiiii = R.R, t.dynCall_iiiiii = R.S, t.dynCall_viiiii = R.T, t.dynCall_iiiiiii = R.U, t.dynCall_iiiiiiii = R.V, t.dynCall_viiiiiii = R.W, t.dynCall_viiiiiiiiidi = R.X, t.dynCall_viiiiiiiidi = R.Y, t.dynCall_viiiiiiiiii = R.Z, t.dynCall_viiiiiiiii = R._, t.dynCall_viiiiiiii = R.$, t.dynCall_iiiii = R.aa, t.dynCall_iiii = R.ba;
    var So = R.ca, Ao = R.da, Do = R.ea, ko = R.fa;
    function rt() {
      if (ce > 0) {
        Pe = rt;
        return;
      }
      if (Wr(), ce > 0) {
        Pe = rt;
        return;
      }
      function c() {
        var s;
        t.calledRun = !0, !M && (zr(), e(t), (s = t.onRuntimeInitialized) == null || s.call(t), Vr());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), c();
      }, 1)) : c();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return rt(), n = o, n;
  };
})();
class mi extends xo {
  getSamWasmFilePath(l, n) {
    return `${l}/palm/wasm/${n}`;
  }
  fetchSamModule(l) {
    return pi(l);
  }
  mapHandValue(l, n) {
    if (!(l.value in n))
      throw new G(`Invalid hand value: ${l.value}. Expected 0 or 1.`);
    return n[l.value];
  }
  parseRawData({ rawDetectedPalm: l, rawPalmAttributes: n }) {
    const { brightness: t, sharpness: e } = l.params, r = {
      confidence: l.confidence / 1e3,
      topLeft: {
        x: l.x0,
        y: l.y0
      },
      topRight: {
        x: l.x1,
        y: l.y1
      },
      bottomRight: {
        x: l.x2,
        y: l.y2
      },
      bottomLeft: {
        x: l.x3,
        y: l.y3
      },
      brightness: t / 1e3,
      sharpness: e / 1e3
    };
    return {
      ...r,
      smallestEdge: No(r),
      handOrientation: this.mapHandValue(n.handOrientation, Mo),
      handPosition: this.mapHandValue(n.handPosition, Lo),
      quality: n.quality / 1e3
    };
  }
  async detectPalmWithImageParameters(l, n) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    return this.samWasmModule.detectPalmWithImageParameters(
      l.width,
      l.height,
      n.bgr0ImagePointer,
      0,
      // palmDetectionOptions
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
  }
  async detectPalmAttributes(l, n, t) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const e = [
      n.x0,
      n.y0,
      n.x1,
      n.y1,
      n.x2,
      n.y2,
      n.x3,
      n.y3
    ];
    return this.samWasmModule.detectPalmAttributes(
      l.width,
      l.height,
      t.bgr0ImagePointer,
      0,
      // options
      e
    );
  }
  async detect(l, n) {
    const t = this.convertToSamColorImage(l, n), e = await this.detectPalmWithImageParameters(n, t), r = await this.detectPalmAttributes(
      n,
      e,
      t
    );
    return t.free(), this.parseRawData({ rawDetectedPalm: e, rawPalmAttributes: r });
  }
}
bt(mi);
