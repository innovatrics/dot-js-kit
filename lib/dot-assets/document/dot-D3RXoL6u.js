var Mo = Object.defineProperty;
var nr = (p) => {
  throw TypeError(p);
};
var Ro = (p, c, n) => c in p ? Mo(p, c, { enumerable: !0, configurable: !0, writable: !0, value: n }) : p[c] = n;
var ze = (p, c, n) => Ro(p, typeof c != "symbol" ? c + "" : c, n), or = (p, c, n) => c.has(p) || nr("Cannot " + n);
var ee = (p, c, n) => (or(p, c, "read from private field"), n ? n.call(p) : c.get(p)), Ve = (p, c, n) => c.has(p) ? nr("Cannot add the same private member more than once") : c instanceof WeakSet ? c.add(p) : c.set(p, n), Ue = (p, c, n, t) => (or(p, c, "write to private field"), t ? t.call(p, n) : c.set(p, n), n);
const ir = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, xo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class $ extends Error {
  constructor(n, t) {
    super(n);
    ze(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(n) {
  }
  static fromCameraError(n) {
    if (this.logError(n), n instanceof $)
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
    return new $(t, n);
  }
  static fromError(n) {
    if (this.logError(n), n instanceof $)
      return n;
    const t = "An unexpected error has occurred";
    return new $(t);
  }
}
const No = {
  RGBA: "RGBA"
};
var le, fe, Oe;
class Wo {
  constructor(c, n) {
    Ve(this, le);
    Ve(this, fe);
    Ve(this, Oe);
    Ue(this, le, c), Ue(this, fe, this.allocate(n.length * n.BYTES_PER_ELEMENT)), Ue(this, Oe, this.allocate(n.length * n.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return ee(this, fe);
  }
  get bgr0ImagePointer() {
    return ee(this, Oe);
  }
  allocate(c) {
    return ee(this, le)._malloc(c);
  }
  free() {
    ee(this, le)._free(ee(this, fe)), ee(this, le)._free(ee(this, Oe));
  }
  writeDataToMemory(c) {
    ee(this, le).HEAPU8.set(c, ee(this, fe));
  }
}
le = new WeakMap(), fe = new WeakMap(), Oe = new WeakMap();
class zo {
  constructor() {
    ze(this, "samWasmModule");
  }
  getOverriddenModules(c, n) {
    return {
      locateFile: (t) => new URL(n || t, c).href
    };
  }
  async handleMissingOrInvalidSamModule(c, n) {
    try {
      const t = await fetch(c);
      if (!t.ok)
        throw new $(
          `The path to ${n} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${c}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new $(
          `The provided ${n} is not a valid WASM module. Please check provided path to wasm files. Current path is ${c}`
        );
    } catch (t) {
      if (t instanceof $)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await xo() ? ir.simd : ir.sam;
  }
  async initSamModule(c, n) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(n, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(c, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new $("Could not init detector.");
    }
  }
  terminateSamModule() {
    var c;
    (c = this.samWasmModule) == null || c.terminate();
  }
  async getSamVersion() {
    var n;
    const c = await ((n = this.samWasmModule) == null ? void 0 : n.getInfoString());
    return c == null ? void 0 : c.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(c) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const n = new Wo(this.samWasmModule, c);
    return n.writeDataToMemory(c), n;
  }
  convertToSamColorImage(c, n) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(c);
    return this.samWasmModule.convertToSamColorImage(
      n.width,
      n.height,
      t.rgbaImagePointer,
      No.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetection(c, n) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(c, n), { height: e, width: r, x: o, y: u } = await this.samWasmModule.selectOptimalRegionForCompressionDetection(
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
const Ge = (p, c) => Math.hypot(c.x - p.x, c.y - p.y), Vo = (p) => {
  const { bottomLeft: c, bottomRight: n, topLeft: t, topRight: e } = p, r = Ge(t, e), o = Ge(e, n), u = Ge(c, n), s = Ge(t, c);
  return Math.min(r, o, u, s);
};
var be = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, ar = {}, st = {}, lt, sr;
function Uo() {
  if (sr) return lt;
  sr = 1, lt = p;
  function p(c, n) {
    for (var t = new Array(arguments.length - 1), e = 0, r = 2, o = !0; r < arguments.length; )
      t[e++] = arguments[r++];
    return new Promise(function(u, s) {
      t[e] = function(g) {
        if (o)
          if (o = !1, g)
            s(g);
          else {
            for (var S = new Array(arguments.length - 1), h = 0; h < S.length; )
              S[h++] = arguments[h];
            u.apply(null, S);
          }
      };
      try {
        c.apply(n || null, t);
      } catch (g) {
        o && (o = !1, s(g));
      }
    });
  }
  return lt;
}
var lr = {}, cr;
function Go() {
  return cr || (cr = 1, function(p) {
    var c = p;
    c.length = function(o) {
      var u = o.length;
      if (!u)
        return 0;
      for (var s = 0; --u % 4 > 1 && o.charAt(u) === "="; )
        ++s;
      return Math.ceil(o.length * 3) / 4 - s;
    };
    for (var n = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[n[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    c.encode = function(o, u, s) {
      for (var g = null, S = [], h = 0, O = 0, I; u < s; ) {
        var j = o[u++];
        switch (O) {
          case 0:
            S[h++] = n[j >> 2], I = (j & 3) << 4, O = 1;
            break;
          case 1:
            S[h++] = n[I | j >> 4], I = (j & 15) << 2, O = 2;
            break;
          case 2:
            S[h++] = n[I | j >> 6], S[h++] = n[j & 63], O = 0;
            break;
        }
        h > 8191 && ((g || (g = [])).push(String.fromCharCode.apply(String, S)), h = 0);
      }
      return O && (S[h++] = n[I], S[h++] = 61, O === 1 && (S[h++] = 61)), g ? (h && g.push(String.fromCharCode.apply(String, S.slice(0, h))), g.join("")) : String.fromCharCode.apply(String, S.slice(0, h));
    };
    var r = "invalid encoding";
    c.decode = function(o, u, s) {
      for (var g = s, S = 0, h, O = 0; O < o.length; ) {
        var I = o.charCodeAt(O++);
        if (I === 61 && S > 1)
          break;
        if ((I = t[I]) === void 0)
          throw Error(r);
        switch (S) {
          case 0:
            h = I, S = 1;
            break;
          case 1:
            u[s++] = h << 2 | (I & 48) >> 4, h = I, S = 2;
            break;
          case 2:
            u[s++] = (h & 15) << 4 | (I & 60) >> 2, h = I, S = 3;
            break;
          case 3:
            u[s++] = (h & 3) << 6 | I, S = 0;
            break;
        }
      }
      if (S === 1)
        throw Error(r);
      return s - g;
    }, c.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  }(lr)), lr;
}
var ct, ur;
function $o() {
  if (ur) return ct;
  ur = 1, ct = p;
  function p() {
    this._listeners = {};
  }
  return p.prototype.on = function(c, n, t) {
    return (this._listeners[c] || (this._listeners[c] = [])).push({
      fn: n,
      ctx: t || this
    }), this;
  }, p.prototype.off = function(c, n) {
    if (c === void 0)
      this._listeners = {};
    else if (n === void 0)
      this._listeners[c] = [];
    else
      for (var t = this._listeners[c], e = 0; e < t.length; )
        t[e].fn === n ? t.splice(e, 1) : ++e;
    return this;
  }, p.prototype.emit = function(c) {
    var n = this._listeners[c];
    if (n) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < n.length; )
        n[e].fn.apply(n[e++].ctx, t);
    }
    return this;
  }, ct;
}
var ut, dr;
function Bo() {
  if (dr) return ut;
  dr = 1, ut = p(p);
  function p(r) {
    return typeof Float32Array < "u" ? function() {
      var o = new Float32Array([-0]), u = new Uint8Array(o.buffer), s = u[3] === 128;
      function g(I, j, F) {
        o[0] = I, j[F] = u[0], j[F + 1] = u[1], j[F + 2] = u[2], j[F + 3] = u[3];
      }
      function S(I, j, F) {
        o[0] = I, j[F] = u[3], j[F + 1] = u[2], j[F + 2] = u[1], j[F + 3] = u[0];
      }
      r.writeFloatLE = s ? g : S, r.writeFloatBE = s ? S : g;
      function h(I, j) {
        return u[0] = I[j], u[1] = I[j + 1], u[2] = I[j + 2], u[3] = I[j + 3], o[0];
      }
      function O(I, j) {
        return u[3] = I[j], u[2] = I[j + 1], u[1] = I[j + 2], u[0] = I[j + 3], o[0];
      }
      r.readFloatLE = s ? h : O, r.readFloatBE = s ? O : h;
    }() : function() {
      function o(s, g, S, h) {
        var O = g < 0 ? 1 : 0;
        if (O && (g = -g), g === 0)
          s(1 / g > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), S, h);
        else if (isNaN(g))
          s(2143289344, S, h);
        else if (g > 34028234663852886e22)
          s((O << 31 | 2139095040) >>> 0, S, h);
        else if (g < 11754943508222875e-54)
          s((O << 31 | Math.round(g / 1401298464324817e-60)) >>> 0, S, h);
        else {
          var I = Math.floor(Math.log(g) / Math.LN2), j = Math.round(g * Math.pow(2, -I) * 8388608) & 8388607;
          s((O << 31 | I + 127 << 23 | j) >>> 0, S, h);
        }
      }
      r.writeFloatLE = o.bind(null, c), r.writeFloatBE = o.bind(null, n);
      function u(s, g, S) {
        var h = s(g, S), O = (h >> 31) * 2 + 1, I = h >>> 23 & 255, j = h & 8388607;
        return I === 255 ? j ? NaN : O * (1 / 0) : I === 0 ? O * 1401298464324817e-60 * j : O * Math.pow(2, I - 150) * (j + 8388608);
      }
      r.readFloatLE = u.bind(null, t), r.readFloatBE = u.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var o = new Float64Array([-0]), u = new Uint8Array(o.buffer), s = u[7] === 128;
      function g(I, j, F) {
        o[0] = I, j[F] = u[0], j[F + 1] = u[1], j[F + 2] = u[2], j[F + 3] = u[3], j[F + 4] = u[4], j[F + 5] = u[5], j[F + 6] = u[6], j[F + 7] = u[7];
      }
      function S(I, j, F) {
        o[0] = I, j[F] = u[7], j[F + 1] = u[6], j[F + 2] = u[5], j[F + 3] = u[4], j[F + 4] = u[3], j[F + 5] = u[2], j[F + 6] = u[1], j[F + 7] = u[0];
      }
      r.writeDoubleLE = s ? g : S, r.writeDoubleBE = s ? S : g;
      function h(I, j) {
        return u[0] = I[j], u[1] = I[j + 1], u[2] = I[j + 2], u[3] = I[j + 3], u[4] = I[j + 4], u[5] = I[j + 5], u[6] = I[j + 6], u[7] = I[j + 7], o[0];
      }
      function O(I, j) {
        return u[7] = I[j], u[6] = I[j + 1], u[5] = I[j + 2], u[4] = I[j + 3], u[3] = I[j + 4], u[2] = I[j + 5], u[1] = I[j + 6], u[0] = I[j + 7], o[0];
      }
      r.readDoubleLE = s ? h : O, r.readDoubleBE = s ? O : h;
    }() : function() {
      function o(s, g, S, h, O, I) {
        var j = h < 0 ? 1 : 0;
        if (j && (h = -h), h === 0)
          s(0, O, I + g), s(1 / h > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), O, I + S);
        else if (isNaN(h))
          s(0, O, I + g), s(2146959360, O, I + S);
        else if (h > 17976931348623157e292)
          s(0, O, I + g), s((j << 31 | 2146435072) >>> 0, O, I + S);
        else {
          var F;
          if (h < 22250738585072014e-324)
            F = h / 5e-324, s(F >>> 0, O, I + g), s((j << 31 | F / 4294967296) >>> 0, O, I + S);
          else {
            var P = Math.floor(Math.log(h) / Math.LN2);
            P === 1024 && (P = 1023), F = h * Math.pow(2, -P), s(F * 4503599627370496 >>> 0, O, I + g), s((j << 31 | P + 1023 << 20 | F * 1048576 & 1048575) >>> 0, O, I + S);
          }
        }
      }
      r.writeDoubleLE = o.bind(null, c, 0, 4), r.writeDoubleBE = o.bind(null, n, 4, 0);
      function u(s, g, S, h, O) {
        var I = s(h, O + g), j = s(h, O + S), F = (j >> 31) * 2 + 1, P = j >>> 20 & 2047, D = 4294967296 * (j & 1048575) + I;
        return P === 2047 ? D ? NaN : F * (1 / 0) : P === 0 ? F * 5e-324 * D : F * Math.pow(2, P - 1075) * (D + 4503599627370496);
      }
      r.readDoubleLE = u.bind(null, t, 0, 4), r.readDoubleBE = u.bind(null, e, 4, 0);
    }(), r;
  }
  function c(r, o, u) {
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
  return ut;
}
function fr(p) {
  throw new Error('Could not dynamically require "' + p + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var dt, pr;
function Ho() {
  if (pr) return dt;
  pr = 1, dt = p;
  function p(c) {
    try {
      if (typeof fr != "function")
        return null;
      var n = fr(c);
      return n && (n.length || Object.keys(n).length) ? n : null;
    } catch {
      return null;
    }
  }
  return dt;
}
var mr = {}, yr;
function Yo() {
  return yr || (yr = 1, function(p) {
    var c = p;
    c.length = function(n) {
      for (var t = 0, e = 0, r = 0; r < n.length; ++r)
        e = n.charCodeAt(r), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (n.charCodeAt(r + 1) & 64512) === 56320 ? (++r, t += 4) : t += 3;
      return t;
    }, c.read = function(n, t, e) {
      var r = e - t;
      if (r < 1)
        return "";
      for (var o = null, u = [], s = 0, g; t < e; )
        g = n[t++], g < 128 ? u[s++] = g : g > 191 && g < 224 ? u[s++] = (g & 31) << 6 | n[t++] & 63 : g > 239 && g < 365 ? (g = ((g & 7) << 18 | (n[t++] & 63) << 12 | (n[t++] & 63) << 6 | n[t++] & 63) - 65536, u[s++] = 55296 + (g >> 10), u[s++] = 56320 + (g & 1023)) : u[s++] = (g & 15) << 12 | (n[t++] & 63) << 6 | n[t++] & 63, s > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, u)), s = 0);
      return o ? (s && o.push(String.fromCharCode.apply(String, u.slice(0, s))), o.join("")) : String.fromCharCode.apply(String, u.slice(0, s));
    }, c.write = function(n, t, e) {
      for (var r = e, o, u, s = 0; s < n.length; ++s)
        o = n.charCodeAt(s), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((u = n.charCodeAt(s + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (u & 1023), ++s, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - r;
    };
  }(mr)), mr;
}
var ft, hr;
function Jo() {
  if (hr) return ft;
  hr = 1, ft = p;
  function p(c, n, t) {
    var e = t || 8192, r = e >>> 1, o = null, u = e;
    return function(s) {
      if (s < 1 || s > r)
        return c(s);
      u + s > e && (o = c(e), u = 0);
      var g = n.call(o, u, u += s);
      return u & 7 && (u = (u | 7) + 1), g;
    };
  }
  return ft;
}
var pt, gr;
function Zo() {
  if (gr) return pt;
  gr = 1, pt = c;
  var p = pe();
  function c(r, o) {
    this.lo = r >>> 0, this.hi = o >>> 0;
  }
  var n = c.zero = new c(0, 0);
  n.toNumber = function() {
    return 0;
  }, n.zzEncode = n.zzDecode = function() {
    return this;
  }, n.length = function() {
    return 1;
  };
  var t = c.zeroHash = "\0\0\0\0\0\0\0\0";
  c.fromNumber = function(r) {
    if (r === 0)
      return n;
    var o = r < 0;
    o && (r = -r);
    var u = r >>> 0, s = (r - u) / 4294967296 >>> 0;
    return o && (s = ~s >>> 0, u = ~u >>> 0, ++u > 4294967295 && (u = 0, ++s > 4294967295 && (s = 0))), new c(u, s);
  }, c.from = function(r) {
    if (typeof r == "number")
      return c.fromNumber(r);
    if (p.isString(r))
      if (p.Long)
        r = p.Long.fromString(r);
      else
        return c.fromNumber(parseInt(r, 10));
    return r.low || r.high ? new c(r.low >>> 0, r.high >>> 0) : n;
  }, c.prototype.toNumber = function(r) {
    if (!r && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, u = ~this.hi >>> 0;
      return o || (u = u + 1 >>> 0), -(o + u * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, c.prototype.toLong = function(r) {
    return p.Long ? new p.Long(this.lo | 0, this.hi | 0, !!r) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!r };
  };
  var e = String.prototype.charCodeAt;
  return c.fromHash = function(r) {
    return r === t ? n : new c(
      (e.call(r, 0) | e.call(r, 1) << 8 | e.call(r, 2) << 16 | e.call(r, 3) << 24) >>> 0,
      (e.call(r, 4) | e.call(r, 5) << 8 | e.call(r, 6) << 16 | e.call(r, 7) << 24) >>> 0
    );
  }, c.prototype.toHash = function() {
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
  }, c.prototype.zzEncode = function() {
    var r = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ r) >>> 0, this.lo = (this.lo << 1 ^ r) >>> 0, this;
  }, c.prototype.zzDecode = function() {
    var r = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ r) >>> 0, this.hi = (this.hi >>> 1 ^ r) >>> 0, this;
  }, c.prototype.length = function() {
    var r = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, u = this.hi >>> 24;
    return u === 0 ? o === 0 ? r < 16384 ? r < 128 ? 1 : 2 : r < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : u < 128 ? 9 : 10;
  }, pt;
}
var br;
function pe() {
  return br || (br = 1, function(p) {
    var c = p;
    c.asPromise = Uo(), c.base64 = Go(), c.EventEmitter = $o(), c.float = Bo(), c.inquire = Ho(), c.utf8 = Yo(), c.pool = Jo(), c.LongBits = Zo(), c.isNode = !!(typeof be < "u" && be && be.process && be.process.versions && be.process.versions.node), c.global = c.isNode && be || typeof window < "u" && window || typeof self < "u" && self || st, c.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), c.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), c.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, c.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, c.isObject = function(e) {
      return e && typeof e == "object";
    }, c.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    c.isSet = function(e, r) {
      var o = e[r];
      return o != null && e.hasOwnProperty(r) ? typeof o != "object" || (Array.isArray(o) ? o.length : Object.keys(o).length) > 0 : !1;
    }, c.Buffer = function() {
      try {
        var e = c.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), c._Buffer_from = null, c._Buffer_allocUnsafe = null, c.newBuffer = function(e) {
      return typeof e == "number" ? c.Buffer ? c._Buffer_allocUnsafe(e) : new c.Array(e) : c.Buffer ? c._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, c.Array = typeof Uint8Array < "u" ? Uint8Array : Array, c.Long = /* istanbul ignore next */
    c.global.dcodeIO && /* istanbul ignore next */
    c.global.dcodeIO.Long || /* istanbul ignore next */
    c.global.Long || c.inquire("long"), c.key2Re = /^true|false|0|1$/, c.key32Re = /^-?(?:0|[1-9][0-9]*)$/, c.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, c.longToHash = function(e) {
      return e ? c.LongBits.from(e).toHash() : c.LongBits.zeroHash;
    }, c.longFromHash = function(e, r) {
      var o = c.LongBits.fromHash(e);
      return c.Long ? c.Long.fromBits(o.lo, o.hi, r) : o.toNumber(!!r);
    };
    function n(e, r, o) {
      for (var u = Object.keys(r), s = 0; s < u.length; ++s)
        (e[u[s]] === void 0 || !o) && (e[u[s]] = r[u[s]]);
      return e;
    }
    c.merge = n, c.lcFirst = function(e) {
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
    c.newError = t, c.ProtocolError = t("ProtocolError"), c.oneOfGetter = function(e) {
      for (var r = {}, o = 0; o < e.length; ++o)
        r[e[o]] = 1;
      return function() {
        for (var u = Object.keys(this), s = u.length - 1; s > -1; --s)
          if (r[u[s]] === 1 && this[u[s]] !== void 0 && this[u[s]] !== null)
            return u[s];
      };
    }, c.oneOfSetter = function(e) {
      return function(r) {
        for (var o = 0; o < e.length; ++o)
          e[o] !== r && delete this[e[o]];
      };
    }, c.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, c._configure = function() {
      var e = c.Buffer;
      if (!e) {
        c._Buffer_from = c._Buffer_allocUnsafe = null;
        return;
      }
      c._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(r, o) {
        return new e(r, o);
      }, c._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(r) {
        return new e(r);
      };
    };
  }(st)), st;
}
var mt, vr;
function Fr() {
  if (vr) return mt;
  vr = 1, mt = s;
  var p = pe(), c, n = p.LongBits, t = p.base64, e = p.utf8;
  function r(P, D, R) {
    this.fn = P, this.len = D, this.next = void 0, this.val = R;
  }
  function o() {
  }
  function u(P) {
    this.head = P.head, this.tail = P.tail, this.len = P.len, this.next = P.states;
  }
  function s() {
    this.len = 0, this.head = new r(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var g = function() {
    return p.Buffer ? function() {
      return (s.create = function() {
        return new c();
      })();
    } : function() {
      return new s();
    };
  };
  s.create = g(), s.alloc = function(P) {
    return new p.Array(P);
  }, p.Array !== Array && (s.alloc = p.pool(s.alloc, p.Array.prototype.subarray)), s.prototype._push = function(P, D, R) {
    return this.tail = this.tail.next = new r(P, D, R), this.len += D, this;
  };
  function S(P, D, R) {
    D[R] = P & 255;
  }
  function h(P, D, R) {
    for (; P > 127; )
      D[R++] = P & 127 | 128, P >>>= 7;
    D[R] = P;
  }
  function O(P, D) {
    this.len = P, this.next = void 0, this.val = D;
  }
  O.prototype = Object.create(r.prototype), O.prototype.fn = h, s.prototype.uint32 = function(P) {
    return this.len += (this.tail = this.tail.next = new O(
      (P = P >>> 0) < 128 ? 1 : P < 16384 ? 2 : P < 2097152 ? 3 : P < 268435456 ? 4 : 5,
      P
    )).len, this;
  }, s.prototype.int32 = function(P) {
    return P < 0 ? this._push(I, 10, n.fromNumber(P)) : this.uint32(P);
  }, s.prototype.sint32 = function(P) {
    return this.uint32((P << 1 ^ P >> 31) >>> 0);
  };
  function I(P, D, R) {
    for (; P.hi; )
      D[R++] = P.lo & 127 | 128, P.lo = (P.lo >>> 7 | P.hi << 25) >>> 0, P.hi >>>= 7;
    for (; P.lo > 127; )
      D[R++] = P.lo & 127 | 128, P.lo = P.lo >>> 7;
    D[R++] = P.lo;
  }
  s.prototype.uint64 = function(P) {
    var D = n.from(P);
    return this._push(I, D.length(), D);
  }, s.prototype.int64 = s.prototype.uint64, s.prototype.sint64 = function(P) {
    var D = n.from(P).zzEncode();
    return this._push(I, D.length(), D);
  }, s.prototype.bool = function(P) {
    return this._push(S, 1, P ? 1 : 0);
  };
  function j(P, D, R) {
    D[R] = P & 255, D[R + 1] = P >>> 8 & 255, D[R + 2] = P >>> 16 & 255, D[R + 3] = P >>> 24;
  }
  s.prototype.fixed32 = function(P) {
    return this._push(j, 4, P >>> 0);
  }, s.prototype.sfixed32 = s.prototype.fixed32, s.prototype.fixed64 = function(P) {
    var D = n.from(P);
    return this._push(j, 4, D.lo)._push(j, 4, D.hi);
  }, s.prototype.sfixed64 = s.prototype.fixed64, s.prototype.float = function(P) {
    return this._push(p.float.writeFloatLE, 4, P);
  }, s.prototype.double = function(P) {
    return this._push(p.float.writeDoubleLE, 8, P);
  };
  var F = p.Array.prototype.set ? function(P, D, R) {
    D.set(P, R);
  } : function(P, D, R) {
    for (var B = 0; B < P.length; ++B)
      D[R + B] = P[B];
  };
  return s.prototype.bytes = function(P) {
    var D = P.length >>> 0;
    if (!D)
      return this._push(S, 1, 0);
    if (p.isString(P)) {
      var R = s.alloc(D = t.length(P));
      t.decode(P, R, 0), P = R;
    }
    return this.uint32(D)._push(F, D, P);
  }, s.prototype.string = function(P) {
    var D = e.length(P);
    return D ? this.uint32(D)._push(e.write, D, P) : this._push(S, 1, 0);
  }, s.prototype.fork = function() {
    return this.states = new u(this), this.head = this.tail = new r(o, 0, 0), this.len = 0, this;
  }, s.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new r(o, 0, 0), this.len = 0), this;
  }, s.prototype.ldelim = function() {
    var P = this.head, D = this.tail, R = this.len;
    return this.reset().uint32(R), R && (this.tail.next = P.next, this.tail = D, this.len += R), this;
  }, s.prototype.finish = function() {
    for (var P = this.head.next, D = this.constructor.alloc(this.len), R = 0; P; )
      P.fn(P.val, D, R), R += P.len, P = P.next;
    return D;
  }, s._configure = function(P) {
    c = P, s.create = g(), c._configure();
  }, mt;
}
var yt, Or;
function Ko() {
  if (Or) return yt;
  Or = 1, yt = n;
  var p = Fr();
  (n.prototype = Object.create(p.prototype)).constructor = n;
  var c = pe();
  function n() {
    p.call(this);
  }
  n._configure = function() {
    n.alloc = c._Buffer_allocUnsafe, n.writeBytesBuffer = c.Buffer && c.Buffer.prototype instanceof Uint8Array && c.Buffer.prototype.set.name === "set" ? function(e, r, o) {
      r.set(e, o);
    } : function(e, r, o) {
      if (e.copy)
        e.copy(r, o, 0, e.length);
      else for (var u = 0; u < e.length; )
        r[o++] = e[u++];
    };
  }, n.prototype.bytes = function(e) {
    c.isString(e) && (e = c._Buffer_from(e, "base64"));
    var r = e.length >>> 0;
    return this.uint32(r), r && this._push(n.writeBytesBuffer, r, e), this;
  };
  function t(e, r, o) {
    e.length < 40 ? c.utf8.write(e, r, o) : r.utf8Write ? r.utf8Write(e, o) : r.write(e, o);
  }
  return n.prototype.string = function(e) {
    var r = c.Buffer.byteLength(e);
    return this.uint32(r), r && this._push(t, r, e), this;
  }, n._configure(), yt;
}
var ht, wr;
function _r() {
  if (wr) return ht;
  wr = 1, ht = r;
  var p = pe(), c, n = p.LongBits, t = p.utf8;
  function e(h, O) {
    return RangeError("index out of range: " + h.pos + " + " + (O || 1) + " > " + h.len);
  }
  function r(h) {
    this.buf = h, this.pos = 0, this.len = h.length;
  }
  var o = typeof Uint8Array < "u" ? function(h) {
    if (h instanceof Uint8Array || Array.isArray(h))
      return new r(h);
    throw Error("illegal buffer");
  } : function(h) {
    if (Array.isArray(h))
      return new r(h);
    throw Error("illegal buffer");
  }, u = function() {
    return p.Buffer ? function(h) {
      return (r.create = function(O) {
        return p.Buffer.isBuffer(O) ? new c(O) : o(O);
      })(h);
    } : o;
  };
  r.create = u(), r.prototype._slice = p.Array.prototype.subarray || /* istanbul ignore next */
  p.Array.prototype.slice, r.prototype.uint32 = /* @__PURE__ */ function() {
    var h = 4294967295;
    return function() {
      if (h = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (h = (h | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (h = (h | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (h = (h | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (h = (h | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return h;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return h;
    };
  }(), r.prototype.int32 = function() {
    return this.uint32() | 0;
  }, r.prototype.sint32 = function() {
    var h = this.uint32();
    return h >>> 1 ^ -(h & 1) | 0;
  };
  function s() {
    var h = new n(0, 0), O = 0;
    if (this.len - this.pos > 4) {
      for (; O < 4; ++O)
        if (h.lo = (h.lo | (this.buf[this.pos] & 127) << O * 7) >>> 0, this.buf[this.pos++] < 128)
          return h;
      if (h.lo = (h.lo | (this.buf[this.pos] & 127) << 28) >>> 0, h.hi = (h.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return h;
      O = 0;
    } else {
      for (; O < 3; ++O) {
        if (this.pos >= this.len)
          throw e(this);
        if (h.lo = (h.lo | (this.buf[this.pos] & 127) << O * 7) >>> 0, this.buf[this.pos++] < 128)
          return h;
      }
      return h.lo = (h.lo | (this.buf[this.pos++] & 127) << O * 7) >>> 0, h;
    }
    if (this.len - this.pos > 4) {
      for (; O < 5; ++O)
        if (h.hi = (h.hi | (this.buf[this.pos] & 127) << O * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return h;
    } else
      for (; O < 5; ++O) {
        if (this.pos >= this.len)
          throw e(this);
        if (h.hi = (h.hi | (this.buf[this.pos] & 127) << O * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return h;
      }
    throw Error("invalid varint encoding");
  }
  r.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function g(h, O) {
    return (h[O - 4] | h[O - 3] << 8 | h[O - 2] << 16 | h[O - 1] << 24) >>> 0;
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
    var h = p.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, h;
  }, r.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var h = p.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, h;
  }, r.prototype.bytes = function() {
    var h = this.uint32(), O = this.pos, I = this.pos + h;
    if (I > this.len)
      throw e(this, h);
    if (this.pos += h, Array.isArray(this.buf))
      return this.buf.slice(O, I);
    if (O === I) {
      var j = p.Buffer;
      return j ? j.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, O, I);
  }, r.prototype.string = function() {
    var h = this.bytes();
    return t.read(h, 0, h.length);
  }, r.prototype.skip = function(h) {
    if (typeof h == "number") {
      if (this.pos + h > this.len)
        throw e(this, h);
      this.pos += h;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, r.prototype.skipType = function(h) {
    switch (h) {
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
        for (; (h = this.uint32() & 7) !== 4; )
          this.skipType(h);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + h + " at offset " + this.pos);
    }
    return this;
  }, r._configure = function(h) {
    c = h, r.create = u(), c._configure();
    var O = p.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    p.merge(r.prototype, {
      int64: function() {
        return s.call(this)[O](!1);
      },
      uint64: function() {
        return s.call(this)[O](!0);
      },
      sint64: function() {
        return s.call(this).zzDecode()[O](!1);
      },
      fixed64: function() {
        return S.call(this)[O](!0);
      },
      sfixed64: function() {
        return S.call(this)[O](!1);
      }
    });
  }, ht;
}
var gt, Pr;
function qo() {
  if (Pr) return gt;
  Pr = 1, gt = n;
  var p = _r();
  (n.prototype = Object.create(p.prototype)).constructor = n;
  var c = pe();
  function n(t) {
    p.call(this, t);
  }
  return n._configure = function() {
    c.Buffer && (n.prototype._slice = c.Buffer.prototype.slice);
  }, n.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, n._configure(), gt;
}
var Ir = {}, bt, jr;
function Xo() {
  if (jr) return bt;
  jr = 1, bt = c;
  var p = pe();
  (c.prototype = Object.create(p.EventEmitter.prototype)).constructor = c;
  function c(n, t, e) {
    if (typeof n != "function")
      throw TypeError("rpcImpl must be a function");
    p.EventEmitter.call(this), this.rpcImpl = n, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return c.prototype.rpcCall = function n(t, e, r, o, u) {
    if (!o)
      throw TypeError("request must be specified");
    var s = this;
    if (!u)
      return p.asPromise(n, s, t, e, r, o);
    if (!s.rpcImpl) {
      setTimeout(function() {
        u(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return s.rpcImpl(
        t,
        e[s.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(g, S) {
          if (g)
            return s.emit("error", g, t), u(g);
          if (S === null) {
            s.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(S instanceof r))
            try {
              S = r[s.responseDelimited ? "decodeDelimited" : "decode"](S);
            } catch (h) {
              return s.emit("error", h, t), u(h);
            }
          return s.emit("data", S, t), u(null, S);
        }
      );
    } catch (g) {
      s.emit("error", g, t), setTimeout(function() {
        u(g);
      }, 0);
      return;
    }
  }, c.prototype.end = function(n) {
    return this.rpcImpl && (n || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, bt;
}
var Cr;
function Qo() {
  return Cr || (Cr = 1, function(p) {
    var c = p;
    c.Service = Xo();
  }(Ir)), Ir;
}
var Sr, Ar;
function ei() {
  return Ar || (Ar = 1, Sr = {}), Sr;
}
var Dr;
function ti() {
  return Dr || (Dr = 1, function(p) {
    var c = p;
    c.build = "minimal", c.Writer = Fr(), c.BufferWriter = Ko(), c.Reader = _r(), c.BufferReader = qo(), c.util = pe(), c.rpc = Qo(), c.roots = ei(), c.configure = n;
    function n() {
      c.util._configure(), c.Writer._configure(c.BufferWriter), c.Reader._configure(c.BufferReader);
    }
    n();
  }(ar)), ar;
}
var kr, Tr;
function ri() {
  return Tr || (Tr = 1, kr = ti()), kr;
}
var E = ri();
const y = E.Reader, L = E.Writer, d = E.util, i = E.roots.default || (E.roots.default = {});
i.dot = (() => {
  const p = {};
  return p.Content = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.token = d.newBuffer([]), c.prototype.iv = d.newBuffer([]), c.prototype.schemaVersion = 0, c.prototype.bytes = d.newBuffer([]), c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
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
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.token != null && n.hasOwnProperty("token") && !(n.token && typeof n.token.length == "number" || d.isString(n.token)) ? "token: buffer expected" : n.iv != null && n.hasOwnProperty("iv") && !(n.iv && typeof n.iv.length == "number" || d.isString(n.iv)) ? "iv: buffer expected" : n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && !d.isInteger(n.schemaVersion) ? "schemaVersion: integer expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || d.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.Content)
        return n;
      let t = new i.dot.Content();
      return n.token != null && (typeof n.token == "string" ? d.base64.decode(n.token, t.token = d.newBuffer(d.base64.length(n.token)), 0) : n.token.length >= 0 && (t.token = n.token)), n.iv != null && (typeof n.iv == "string" ? d.base64.decode(n.iv, t.iv = d.newBuffer(d.base64.length(n.iv)), 0) : n.iv.length >= 0 && (t.iv = n.iv)), n.schemaVersion != null && (t.schemaVersion = n.schemaVersion | 0), n.bytes != null && (typeof n.bytes == "string" ? d.base64.decode(n.bytes, t.bytes = d.newBuffer(d.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = d.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = d.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), n.token != null && n.hasOwnProperty("token") && (e.token = t.bytes === String ? d.base64.encode(n.token, 0, n.token.length) : t.bytes === Array ? Array.prototype.slice.call(n.token) : n.token), n.iv != null && n.hasOwnProperty("iv") && (e.iv = t.bytes === String ? d.base64.encode(n.iv, 0, n.iv.length) : t.bytes === Array ? Array.prototype.slice.call(n.iv) : n.iv), n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && (e.schemaVersion = n.schemaVersion), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Content";
    }, c;
  }(), p.v4 = function() {
    const c = {};
    return c.MagnifEyeLivenessContent = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.images && s.images.length || (s.images = []), s.images.push(i.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              s.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.Metadata = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.Metadata();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.platform = e.int32();
              break;
            }
            case 5: {
              s.sessionToken = e.string();
              break;
            }
            case 6: {
              s.componentVersion = e.string();
              break;
            }
            case 2: {
              s.web = i.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.android = i.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              s.ios = i.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.AndroidMetadata = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.AndroidMetadata(), g, S;
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
            case 1: {
              s.supportedAbis && s.supportedAbis.length || (s.supportedAbis = []), s.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              s.device = e.string();
              break;
            }
            case 6: {
              s.camera = i.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              s.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.digests && s.digests.length || (s.digests = []), s.digests.push(e.bytes());
              break;
            }
            case 5: {
              s.digestsWithTimestamp && s.digestsWithTimestamp.length || (s.digestsWithTimestamp = []), s.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              s.dynamicCameraFrameProperties === d.emptyObject && (s.dynamicCameraFrameProperties = {});
              let O = e.uint32() + e.pos;
              for (g = "", S = null; e.pos < O; ) {
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
              s.dynamicCameraFrameProperties[g] = S;
              break;
            }
            case 8: {
              s.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              s.croppedYuv420Image = i.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            case 10: {
              s.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(h & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
          for (let s = 0; s < e.supportedAbis.length; ++s)
            o.supportedAbis[s] = e.supportedAbis[s];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, r.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let s = 0; s < e.digests.length; ++s)
            o.digests[s] = r.bytes === String ? d.base64.encode(e.digests[s], 0, e.digests[s].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[s]) : e.digests[s];
        }
        let u;
        if (e.dynamicCameraFrameProperties && (u = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let s = 0; s < u.length; ++s)
            o.dynamicCameraFrameProperties[u[s]] = i.dot.Int32List.toObject(e.dynamicCameraFrameProperties[u[s]], r);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let s = 0; s < e.digestsWithTimestamp.length; ++s)
            o.digestsWithTimestamp[s] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[s], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.AndroidCamera.toObject(e.camera, r), r.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = r.bytes === String ? d.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : r.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, r.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, r), r.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, n;
    }(), c.AndroidCamera = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.AndroidCamera();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.Yuv420Image = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Yuv420Image();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
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
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.Yuv420ImageCrop = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Yuv420ImageCrop();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.image = i.dot.v4.Yuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.IosMetadata = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.IosMetadata(), g, S;
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
            case 1: {
              s.cameraModelId = e.string();
              break;
            }
            case 2: {
              s.architectureInfo === d.emptyObject && (s.architectureInfo = {});
              let O = e.uint32() + e.pos;
              for (g = "", S = !1; e.pos < O; ) {
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
              s.architectureInfo[g] = S;
              break;
            }
            case 6: {
              s.camera = i.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              s.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.digests && s.digests.length || (s.digests = []), s.digests.push(e.bytes());
              break;
            }
            case 5: {
              s.digestsWithTimestamp && s.digestsWithTimestamp.length || (s.digestsWithTimestamp = []), s.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (s.isoValues && s.isoValues.length || (s.isoValues = []), (h & 7) === 2) {
                let O = e.uint32() + e.pos;
                for (; e.pos < O; )
                  s.isoValues.push(e.int32());
              } else
                s.isoValues.push(e.int32());
              break;
            }
            case 8: {
              s.croppedYuv420Image = i.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            case 9: {
              s.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(h & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
          for (let s = 0; s < u.length; ++s)
            o.architectureInfo[u[s]] = e.architectureInfo[u[s]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let s = 0; s < e.digests.length; ++s)
            o.digests[s] = r.bytes === String ? d.base64.encode(e.digests[s], 0, e.digests[s].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[s]) : e.digests[s];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let s = 0; s < e.isoValues.length; ++s)
            o.isoValues[s] = e.isoValues[s];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let s = 0; s < e.digestsWithTimestamp.length; ++s)
            o.digestsWithTimestamp[s] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[s], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.IosCamera.toObject(e.camera, r), r.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, r), r.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, E.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, n;
    }(), c.IosCamera = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosCamera();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.IosYuv420Image = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosYuv420Image();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
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
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.IosYuv420ImageCrop = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosYuv420ImageCrop();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.image = i.dot.v4.IosYuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.WebMetadata = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.WebMetadata();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.currentCameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.availableCameraProperties && s.availableCameraProperties.length || (s.availableCameraProperties = []), s.availableCameraProperties.push(i.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              s.hashedDetectedImages && s.hashedDetectedImages.length || (s.hashedDetectedImages = []), s.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              s.hashedDetectedImagesWithTimestamp && s.hashedDetectedImagesWithTimestamp.length || (s.hashedDetectedImagesWithTimestamp = []), s.hashedDetectedImagesWithTimestamp.push(i.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              s.detectionRecord && s.detectionRecord.length || (s.detectionRecord = []), s.detectionRecord.push(i.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              s.croppedImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 7: {
              s.croppedImageWithPosition = i.dot.v4.ImageCrop.decode(e, e.uint32());
              break;
            }
            case 8: {
              s.platformDetails = i.dot.v4.PlatformDetails.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.HashedDetectedImageWithTimestamp = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.imageHash = t.string();
              break;
            }
            case 2: {
              u.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.MediaTrackSettings = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.MediaTrackSettings();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.aspectRatio = e.double();
              break;
            }
            case 2: {
              s.autoGainControl = e.bool();
              break;
            }
            case 3: {
              s.channelCount = e.int32();
              break;
            }
            case 4: {
              s.deviceId = e.string();
              break;
            }
            case 5: {
              s.displaySurface = e.string();
              break;
            }
            case 6: {
              s.echoCancellation = e.bool();
              break;
            }
            case 7: {
              s.facingMode = e.string();
              break;
            }
            case 8: {
              s.frameRate = e.double();
              break;
            }
            case 9: {
              s.groupId = e.string();
              break;
            }
            case 10: {
              s.height = e.int32();
              break;
            }
            case 11: {
              s.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              s.sampleRate = e.int32();
              break;
            }
            case 13: {
              s.sampleSize = e.int32();
              break;
            }
            case 14: {
              s.width = e.int32();
              break;
            }
            case 15: {
              s.deviceName = e.string();
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.ImageBitmap = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.ImageBitmap();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.width = t.int32();
              break;
            }
            case 2: {
              u.height = t.int32();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.CameraProperties = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.CameraProperties();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.cameraInitFrameResolution = i.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.cameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.DetectedObject = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.DetectedObject();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
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
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.Point = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Point();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.x = t.float();
              break;
            }
            case 2: {
              u.y = t.float();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.ImageCrop = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.ImageCrop();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.PlatformDetails = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.PlatformDetails();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.userAgent = e.string();
              break;
            }
            case 2: {
              s.platform = e.string();
              break;
            }
            case 3: {
              s.platformVersion = e.string();
              break;
            }
            case 4: {
              s.architecture = e.string();
              break;
            }
            case 5: {
              s.model = e.string();
              break;
            }
            case 6: {
              s.browserVersions && s.browserVersions.length || (s.browserVersions = []), s.browserVersions.push(i.dot.v4.BrowserVersion.decode(e, e.uint32()));
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.BrowserVersion = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.BrowserVersion();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.name = t.string();
              break;
            }
            case 2: {
              u.version = t.string();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.FaceContent = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.FaceContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.DocumentContent = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.DocumentContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.Blob = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.Blob();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.documentContent = i.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              s.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.faceContent = i.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              s.smileLivenessContent = i.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              s.palmContent = i.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              s.travelDocumentContent = i.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.TravelDocumentContent = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.TravelDocumentContent();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
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
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.LdsMasterFile = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.LdsMasterFile();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.Lds1eMrtdApplication = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              s.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              s.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              s.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              s.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              s.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              s.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              s.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              s.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              s.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              s.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              s.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              s.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              s.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              s.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.Lds1ElementaryFile = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.Lds1ElementaryFile();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.id = e.int32();
              break;
            }
            case 2: {
              s.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.AccessControlProtocol = function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[n[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[n[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), c.AuthenticationStatus = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.AuthenticationStatus();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.data = i.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.chip = i.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.DataAuthenticationStatus = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.DataAuthenticationStatus();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.status = t.int32();
              break;
            }
            case 2: {
              u.protocol = t.int32();
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.ChipAuthenticationStatus = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.status = e.int32();
              break;
            }
            case 2: {
              s.protocol = e.int32();
              break;
            }
            case 3: {
              s.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.EyeGazeLivenessContent = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 3: {
              s.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              s.segments && s.segments.length || (s.segments = []), s.segments.push(i.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              s.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.EyeGazeLivenessSegment = function() {
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
        t instanceof y || (t = y.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < o; ) {
          let s = t.uint32();
          if (s === r)
            break;
          switch (s >>> 3) {
            case 1: {
              u.corner = t.int32();
              break;
            }
            case 2: {
              u.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(s & 7);
              break;
          }
        }
        return u;
      }, n.decodeDelimited = function(t) {
        return t instanceof y || (t = new y(t)), this.decode(t, t.uint32());
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
    }(), c.EyeGazeLivenessCorner = function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "TOP_LEFT"] = 0, t[n[1] = "TOP_RIGHT"] = 1, t[n[2] = "BOTTOM_RIGHT"] = 2, t[n[3] = "BOTTOM_LEFT"] = 3, t;
    }(), c.SmileLivenessContent = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.SmileLivenessContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.neutralExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.smileExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              s.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c.PalmContent = function() {
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
        e instanceof y || (e = y.create(e));
        let u = r === void 0 ? e.len : e.pos + r, s = new i.dot.v4.PalmContent();
        for (; e.pos < u; ) {
          let g = e.uint32();
          if (g === o)
            break;
          switch (g >>> 3) {
            case 1: {
              s.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              s.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              s.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(g & 7);
              break;
          }
        }
        return s;
      }, n.decodeDelimited = function(e) {
        return e instanceof y || (e = new y(e)), this.decode(e, e.uint32());
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
    }(), c;
  }(), p.Image = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.bytes = d.newBuffer([]), c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || d.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.Image)
        return n;
      let t = new i.dot.Image();
      return n.bytes != null && (typeof n.bytes == "string" ? d.base64.decode(n.bytes, t.bytes = d.newBuffer(d.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Image";
    }, c;
  }(), p.ImageSize = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.width = 0, c.prototype.height = 0, c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.width != null && Object.hasOwnProperty.call(n, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.width), n.height != null && Object.hasOwnProperty.call(n, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.height), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.width != null && n.hasOwnProperty("width") && !d.isInteger(n.width) ? "width: integer expected" : n.height != null && n.hasOwnProperty("height") && !d.isInteger(n.height) ? "height: integer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.ImageSize)
        return n;
      let t = new i.dot.ImageSize();
      return n.width != null && (t.width = n.width | 0), n.height != null && (t.height = n.height | 0), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), n.width != null && n.hasOwnProperty("width") && (e.width = n.width), n.height != null && n.hasOwnProperty("height") && (e.height = n.height), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.ImageSize";
    }, c;
  }(), p.Int32List = function() {
    function c(n) {
      if (this.items = [], n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.items = d.emptyArray, c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
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
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Int32List();
      for (; n.pos < r; ) {
        let u = n.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            if (o.items && o.items.length || (o.items = []), (u & 7) === 2) {
              let s = n.uint32() + n.pos;
              for (; n.pos < s; )
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
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
    }, c.fromObject = function(n) {
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
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), n.items && n.items.length) {
        e.items = [];
        for (let r = 0; r < n.items.length; ++r)
          e.items[r] = n.items[r];
      }
      return e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Int32List";
    }, c;
  }(), p.Platform = function() {
    const c = {}, n = Object.create(c);
    return n[c[0] = "WEB"] = 0, n[c[1] = "ANDROID"] = 1, n[c[2] = "IOS"] = 2, n;
  }(), p.RectangleDouble = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.left = 0, c.prototype.top = 0, c.prototype.right = 0, c.prototype.bottom = 0, c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
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
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.left != null && n.hasOwnProperty("left") && typeof n.left != "number" ? "left: number expected" : n.top != null && n.hasOwnProperty("top") && typeof n.top != "number" ? "top: number expected" : n.right != null && n.hasOwnProperty("right") && typeof n.right != "number" ? "right: number expected" : n.bottom != null && n.hasOwnProperty("bottom") && typeof n.bottom != "number" ? "bottom: number expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.RectangleDouble)
        return n;
      let t = new i.dot.RectangleDouble();
      return n.left != null && (t.left = Number(n.left)), n.top != null && (t.top = Number(n.top)), n.right != null && (t.right = Number(n.right)), n.bottom != null && (t.bottom = Number(n.bottom)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), n.left != null && n.hasOwnProperty("left") && (e.left = t.json && !isFinite(n.left) ? String(n.left) : n.left), n.top != null && n.hasOwnProperty("top") && (e.top = t.json && !isFinite(n.top) ? String(n.top) : n.top), n.right != null && n.hasOwnProperty("right") && (e.right = t.json && !isFinite(n.right) ? String(n.right) : n.right), n.bottom != null && n.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(n.bottom) ? String(n.bottom) : n.bottom), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.RectangleDouble";
    }, c;
  }(), p.DigestWithTimestamp = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.digest = d.newBuffer([]), c.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.digest != null && Object.hasOwnProperty.call(n, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.digest), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(n.timestampMillis), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.digest != null && n.hasOwnProperty("digest") && !(n.digest && typeof n.digest.length == "number" || d.isString(n.digest)) ? "digest: buffer expected" : n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && !d.isInteger(n.timestampMillis) && !(n.timestampMillis && d.isInteger(n.timestampMillis.low) && d.isInteger(n.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.DigestWithTimestamp)
        return n;
      let t = new i.dot.DigestWithTimestamp();
      return n.digest != null && (typeof n.digest == "string" ? d.base64.decode(n.digest, t.digest = d.newBuffer(d.base64.length(n.digest)), 0) : n.digest.length >= 0 && (t.digest = n.digest)), n.timestampMillis != null && (d.Long ? (t.timestampMillis = d.Long.fromValue(n.timestampMillis)).unsigned = !0 : typeof n.timestampMillis == "string" ? t.timestampMillis = parseInt(n.timestampMillis, 10) : typeof n.timestampMillis == "number" ? t.timestampMillis = n.timestampMillis : typeof n.timestampMillis == "object" && (t.timestampMillis = new d.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = d.newBuffer(e.digest))), d.Long) {
          let r = new d.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? r.toString() : t.longs === Number ? r.toNumber() : r;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return n.digest != null && n.hasOwnProperty("digest") && (e.digest = t.bytes === String ? d.base64.encode(n.digest, 0, n.digest.length) : t.bytes === Array ? Array.prototype.slice.call(n.digest) : n.digest), n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && (typeof n.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(n.timestampMillis) : n.timestampMillis : e.timestampMillis = t.longs === String ? d.Long.prototype.toString.call(n.timestampMillis) : t.longs === Number ? new d.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0) : n.timestampMillis), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.DigestWithTimestamp";
    }, c;
  }(), p.Video = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.bytes = d.newBuffer([]), c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || d.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.Video)
        return n;
      let t = new i.dot.Video();
      return n.bytes != null && (typeof n.bytes == "string" ? d.base64.decode(n.bytes, t.bytes = d.newBuffer(d.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Video";
    }, c;
  }(), p.PointInt = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.x = 0, c.prototype.y = 0, c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.x != null && Object.hasOwnProperty.call(n, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.y), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof y || (n = y.create(n));
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
    }, c.decodeDelimited = function(n) {
      return n instanceof y || (n = new y(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.x != null && n.hasOwnProperty("x") && !d.isInteger(n.x) ? "x: integer expected" : n.y != null && n.hasOwnProperty("y") && !d.isInteger(n.y) ? "y: integer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.PointInt)
        return n;
      let t = new i.dot.PointInt();
      return n.x != null && (t.x = n.x | 0), n.y != null && (t.y = n.y | 0), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), n.x != null && n.hasOwnProperty("x") && (e.x = n.x), n.y != null && n.hasOwnProperty("y") && (e.y = n.y), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, E.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.PointInt";
    }, c;
  }(), p;
})();
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Lr = Symbol("Comlink.proxy"), ni = Symbol("Comlink.endpoint"), oi = Symbol("Comlink.releaseProxy"), vt = Symbol("Comlink.finalizer"), Be = Symbol("Comlink.thrown"), Mr = (p) => typeof p == "object" && p !== null || typeof p == "function", ii = {
  canHandle: (p) => Mr(p) && p[Lr],
  serialize(p) {
    const { port1: c, port2: n } = new MessageChannel();
    return wt(p, c), [n, [n]];
  },
  deserialize(p) {
    return p.start(), ci(p);
  }
}, ai = {
  canHandle: (p) => Mr(p) && Be in p,
  serialize({ value: p }) {
    let c;
    return p instanceof Error ? c = {
      isError: !0,
      value: {
        message: p.message,
        name: p.name,
        stack: p.stack
      }
    } : c = { isError: !1, value: p }, [c, []];
  },
  deserialize(p) {
    throw p.isError ? Object.assign(new Error(p.value.message), p.value) : p.value;
  }
}, Rr = /* @__PURE__ */ new Map([
  ["proxy", ii],
  ["throw", ai]
]);
function si(p, c) {
  for (const n of p)
    if (c === n || n === "*" || n instanceof RegExp && n.test(c))
      return !0;
  return !1;
}
function wt(p, c = globalThis, n = ["*"]) {
  c.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!si(n, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: r, type: o, path: u } = Object.assign({ path: [] }, e.data), s = (e.data.argumentList || []).map(de);
    let g;
    try {
      const S = u.slice(0, -1).reduce((O, I) => O[I], p), h = u.reduce((O, I) => O[I], p);
      switch (o) {
        case "GET":
          g = h;
          break;
        case "SET":
          S[u.slice(-1)[0]] = de(e.data.value), g = !0;
          break;
        case "APPLY":
          g = h.apply(S, s);
          break;
        case "CONSTRUCT":
          {
            const O = new h(...s);
            g = mi(O);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: O, port2: I } = new MessageChannel();
            wt(p, I), g = pi(O, [O]);
          }
          break;
        case "RELEASE":
          g = void 0;
          break;
        default:
          return;
      }
    } catch (S) {
      g = { value: S, [Be]: 0 };
    }
    Promise.resolve(g).catch((S) => ({ value: S, [Be]: 0 })).then((S) => {
      const [h, O] = Je(S);
      c.postMessage(Object.assign(Object.assign({}, h), { id: r }), O), o === "RELEASE" && (c.removeEventListener("message", t), xr(c), vt in p && typeof p[vt] == "function" && p[vt]());
    }).catch((S) => {
      const [h, O] = Je({
        value: new TypeError("Unserializable return value"),
        [Be]: 0
      });
      c.postMessage(Object.assign(Object.assign({}, h), { id: r }), O);
    });
  }), c.start && c.start();
}
function li(p) {
  return p.constructor.name === "MessagePort";
}
function xr(p) {
  li(p) && p.close();
}
function ci(p, c) {
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
  }), Ot(p, n, [], c);
}
function $e(p) {
  if (p)
    throw new Error("Proxy has been released and is not useable");
}
function Nr(p) {
  return ve(p, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    xr(p);
  });
}
const He = /* @__PURE__ */ new WeakMap(), Ye = "FinalizationRegistry" in globalThis && new FinalizationRegistry((p) => {
  const c = (He.get(p) || 0) - 1;
  He.set(p, c), c === 0 && Nr(p);
});
function ui(p, c) {
  const n = (He.get(c) || 0) + 1;
  He.set(c, n), Ye && Ye.register(p, c, p);
}
function di(p) {
  Ye && Ye.unregister(p);
}
function Ot(p, c, n = [], t = function() {
}) {
  let e = !1;
  const r = new Proxy(t, {
    get(o, u) {
      if ($e(e), u === oi)
        return () => {
          di(r), Nr(p), c.clear(), e = !0;
        };
      if (u === "then") {
        if (n.length === 0)
          return { then: () => r };
        const s = ve(p, c, {
          type: "GET",
          path: n.map((g) => g.toString())
        }).then(de);
        return s.then.bind(s);
      }
      return Ot(p, c, [...n, u]);
    },
    set(o, u, s) {
      $e(e);
      const [g, S] = Je(s);
      return ve(p, c, {
        type: "SET",
        path: [...n, u].map((h) => h.toString()),
        value: g
      }, S).then(de);
    },
    apply(o, u, s) {
      $e(e);
      const g = n[n.length - 1];
      if (g === ni)
        return ve(p, c, {
          type: "ENDPOINT"
        }).then(de);
      if (g === "bind")
        return Ot(p, c, n.slice(0, -1));
      const [S, h] = Er(s);
      return ve(p, c, {
        type: "APPLY",
        path: n.map((O) => O.toString()),
        argumentList: S
      }, h).then(de);
    },
    construct(o, u) {
      $e(e);
      const [s, g] = Er(u);
      return ve(p, c, {
        type: "CONSTRUCT",
        path: n.map((S) => S.toString()),
        argumentList: s
      }, g).then(de);
    }
  });
  return ui(r, p), r;
}
function fi(p) {
  return Array.prototype.concat.apply([], p);
}
function Er(p) {
  const c = p.map(Je);
  return [c.map((n) => n[0]), fi(c.map((n) => n[1]))];
}
const Wr = /* @__PURE__ */ new WeakMap();
function pi(p, c) {
  return Wr.set(p, c), p;
}
function mi(p) {
  return Object.assign(p, { [Lr]: !0 });
}
function Je(p) {
  for (const [c, n] of Rr)
    if (n.canHandle(p)) {
      const [t, e] = n.serialize(p);
      return [
        {
          type: "HANDLER",
          name: c,
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
    Wr.get(p) || []
  ];
}
function de(p) {
  switch (p.type) {
    case "HANDLER":
      return Rr.get(p.name).deserialize(p.value);
    case "RAW":
      return p.value;
  }
}
function ve(p, c, n, t) {
  return new Promise((e) => {
    const r = yi();
    c.set(r, e), p.start && p.start(), p.postMessage(Object.assign({ id: r }, n), t);
  });
}
function yi() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var hi = (() => {
  var p = import.meta.url;
  return async function(c = {}) {
    var n, t = c, e, r, o = new Promise((l, a) => {
      e = l, r = a;
    }), u = typeof window == "object", s = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var g = Object.assign({}, t), S = "./this.program", h = (l, a) => {
      throw a;
    }, O = "";
    function I(l) {
      return t.locateFile ? t.locateFile(l, O) : O + l;
    }
    var j, F;
    (u || s) && (s ? O = self.location.href : typeof document < "u" && document.currentScript && (O = document.currentScript.src), p && (O = p), O.startsWith("blob:") ? O = "" : O = O.slice(0, O.replace(/[?#].*/, "").lastIndexOf("/") + 1), s && (F = (l) => {
      var a = new XMLHttpRequest();
      return a.open("GET", l, !1), a.responseType = "arraybuffer", a.send(null), new Uint8Array(a.response);
    }), j = async (l) => {
      if (St(l))
        return new Promise((f, m) => {
          var b = new XMLHttpRequest();
          b.open("GET", l, !0), b.responseType = "arraybuffer", b.onload = () => {
            if (b.status == 200 || b.status == 0 && b.response) {
              f(b.response);
              return;
            }
            m(b.status);
          }, b.onerror = m, b.send(null);
        });
      var a = await fetch(l, { credentials: "same-origin" });
      if (a.ok)
        return a.arrayBuffer();
      throw new Error(a.status + " : " + a.url);
    }), t.print || console.log.bind(console);
    var P = t.printErr || console.error.bind(console);
    Object.assign(t, g), g = null, t.arguments && t.arguments, t.thisProgram && (S = t.thisProgram);
    var D = t.wasmBinary, R, B = !1, Ae, Z, G, me, we, re, N, Pt, It, jt, Ct, St = (l) => l.startsWith("file://");
    function At() {
      var l = R.buffer;
      t.HEAP8 = Z = new Int8Array(l), t.HEAP16 = me = new Int16Array(l), t.HEAPU8 = G = new Uint8Array(l), t.HEAPU16 = we = new Uint16Array(l), t.HEAP32 = re = new Int32Array(l), t.HEAPU32 = N = new Uint32Array(l), t.HEAPF32 = Pt = new Float32Array(l), t.HEAPF64 = Ct = new Float64Array(l), t.HEAP64 = It = new BigInt64Array(l), t.HEAPU64 = jt = new BigUint64Array(l);
    }
    function zr() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Qr(t.preRun.shift());
      kt(Et);
    }
    function Vr() {
      M.E();
    }
    function Ur() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Xr(t.postRun.shift());
      kt(Tt);
    }
    var ce = 0, Pe = null;
    function Gr(l) {
      var a;
      ce++, (a = t.monitorRunDependencies) == null || a.call(t, ce);
    }
    function $r(l) {
      var f;
      if (ce--, (f = t.monitorRunDependencies) == null || f.call(t, ce), ce == 0 && Pe) {
        var a = Pe;
        Pe = null, a();
      }
    }
    function De(l) {
      var f;
      (f = t.onAbort) == null || f.call(t, l), l = "Aborted(" + l + ")", P(l), B = !0, l += ". Build with -sASSERTIONS for more info.";
      var a = new WebAssembly.RuntimeError(l);
      throw r(a), a;
    }
    var Ze;
    function Br() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Hr(l) {
      if (l == Ze && D)
        return new Uint8Array(D);
      if (F)
        return F(l);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Yr(l) {
      if (!D)
        try {
          var a = await j(l);
          return new Uint8Array(a);
        } catch {
        }
      return Hr(l);
    }
    async function Jr(l, a) {
      try {
        var f = await Yr(l), m = await WebAssembly.instantiate(f, a);
        return m;
      } catch (b) {
        P(`failed to asynchronously prepare wasm: ${b}`), De(b);
      }
    }
    async function Zr(l, a, f) {
      if (!l && typeof WebAssembly.instantiateStreaming == "function" && !St(a))
        try {
          var m = fetch(a, { credentials: "same-origin" }), b = await WebAssembly.instantiateStreaming(m, f);
          return b;
        } catch (w) {
          P(`wasm streaming compile failed: ${w}`), P("falling back to ArrayBuffer instantiation");
        }
      return Jr(a, f);
    }
    function Kr() {
      return { a: Do };
    }
    async function qr() {
      function l(w, C) {
        return M = w.exports, M = k.instrumentWasmExports(M), R = M.D, At(), M.J, $r(), M;
      }
      Gr();
      function a(w) {
        return l(w.instance);
      }
      var f = Kr();
      if (t.instantiateWasm)
        return new Promise((w, C) => {
          t.instantiateWasm(f, (v, A) => {
            l(v), w(v.exports);
          });
        });
      Ze ?? (Ze = Br());
      try {
        var m = await Zr(D, Ze, f), b = a(m);
        return b;
      } catch (w) {
        return r(w), Promise.reject(w);
      }
    }
    class Dt {
      constructor(a) {
        ze(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${a})`, this.status = a;
      }
    }
    var kt = (l) => {
      for (; l.length > 0; )
        l.shift()(t);
    }, Tt = [], Xr = (l) => Tt.unshift(l), Et = [], Qr = (l) => Et.unshift(l), Ft = t.noExitRuntime || !0;
    class en {
      constructor(a) {
        this.excPtr = a, this.ptr = a - 24;
      }
      set_type(a) {
        N[this.ptr + 4 >> 2] = a;
      }
      get_type() {
        return N[this.ptr + 4 >> 2];
      }
      set_destructor(a) {
        N[this.ptr + 8 >> 2] = a;
      }
      get_destructor() {
        return N[this.ptr + 8 >> 2];
      }
      set_caught(a) {
        a = a ? 1 : 0, Z[this.ptr + 12] = a;
      }
      get_caught() {
        return Z[this.ptr + 12] != 0;
      }
      set_rethrown(a) {
        a = a ? 1 : 0, Z[this.ptr + 13] = a;
      }
      get_rethrown() {
        return Z[this.ptr + 13] != 0;
      }
      init(a, f) {
        this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(f);
      }
      set_adjusted_ptr(a) {
        N[this.ptr + 16 >> 2] = a;
      }
      get_adjusted_ptr() {
        return N[this.ptr + 16 >> 2];
      }
    }
    var _t = 0, tn = (l, a, f) => {
      var m = new en(l);
      throw m.init(a, f), _t = l, _t;
    }, rn = () => De(""), ke = (l) => {
      if (l === null)
        return "null";
      var a = typeof l;
      return a === "object" || a === "array" || a === "function" ? l.toString() : "" + l;
    }, nn = () => {
      for (var l = new Array(256), a = 0; a < 256; ++a)
        l[a] = String.fromCharCode(a);
      Lt = l;
    }, Lt, z = (l) => {
      for (var a = "", f = l; G[f]; )
        a += Lt[G[f++]];
      return a;
    }, ye = {}, ue = {}, Te = {}, he, x = (l) => {
      throw new he(l);
    }, Mt, Ee = (l) => {
      throw new Mt(l);
    }, ge = (l, a, f) => {
      l.forEach((v) => Te[v] = a);
      function m(v) {
        var A = f(v);
        A.length !== l.length && Ee("Mismatched type converter count");
        for (var _ = 0; _ < l.length; ++_)
          Y(l[_], A[_]);
      }
      var b = new Array(a.length), w = [], C = 0;
      a.forEach((v, A) => {
        ue.hasOwnProperty(v) ? b[A] = ue[v] : (w.push(v), ye.hasOwnProperty(v) || (ye[v] = []), ye[v].push(() => {
          b[A] = ue[v], ++C, C === w.length && m(b);
        }));
      }), w.length === 0 && m(b);
    };
    function on(l, a, f = {}) {
      var m = a.name;
      if (l || x(`type "${m}" must have a positive integer typeid pointer`), ue.hasOwnProperty(l)) {
        if (f.ignoreDuplicateRegistrations)
          return;
        x(`Cannot register type '${m}' twice`);
      }
      if (ue[l] = a, delete Te[l], ye.hasOwnProperty(l)) {
        var b = ye[l];
        delete ye[l], b.forEach((w) => w());
      }
    }
    function Y(l, a, f = {}) {
      return on(l, a, f);
    }
    var Rt = (l, a, f) => {
      switch (a) {
        case 1:
          return f ? (m) => Z[m] : (m) => G[m];
        case 2:
          return f ? (m) => me[m >> 1] : (m) => we[m >> 1];
        case 4:
          return f ? (m) => re[m >> 2] : (m) => N[m >> 2];
        case 8:
          return f ? (m) => It[m >> 3] : (m) => jt[m >> 3];
        default:
          throw new TypeError(`invalid integer width (${a}): ${l}`);
      }
    }, an = (l, a, f, m, b) => {
      a = z(a);
      var w = a.indexOf("u") != -1;
      Y(l, { name: a, fromWireType: (C) => C, toWireType: function(C, v) {
        if (typeof v != "bigint" && typeof v != "number")
          throw new TypeError(`Cannot convert "${ke(v)}" to ${this.name}`);
        return typeof v == "number" && (v = BigInt(v)), v;
      }, argPackAdvance: K, readValueFromPointer: Rt(a, f, !w), destructorFunction: null });
    }, K = 8, sn = (l, a, f, m) => {
      a = z(a), Y(l, { name: a, fromWireType: function(b) {
        return !!b;
      }, toWireType: function(b, w) {
        return w ? f : m;
      }, argPackAdvance: K, readValueFromPointer: function(b) {
        return this.fromWireType(G[b]);
      }, destructorFunction: null });
    }, ln = (l) => ({ count: l.count, deleteScheduled: l.deleteScheduled, preservePointerOnDelete: l.preservePointerOnDelete, ptr: l.ptr, ptrType: l.ptrType, smartPtr: l.smartPtr, smartPtrType: l.smartPtrType }), Ke = (l) => {
      function a(f) {
        return f.$$.ptrType.registeredClass.name;
      }
      x(a(l) + " instance already deleted");
    }, qe = !1, xt = (l) => {
    }, cn = (l) => {
      l.smartPtr ? l.smartPtrType.rawDestructor(l.smartPtr) : l.ptrType.registeredClass.rawDestructor(l.ptr);
    }, Nt = (l) => {
      l.count.value -= 1;
      var a = l.count.value === 0;
      a && cn(l);
    }, Wt = (l, a, f) => {
      if (a === f)
        return l;
      if (f.baseClass === void 0)
        return null;
      var m = Wt(l, a, f.baseClass);
      return m === null ? null : f.downcast(m);
    }, zt = {}, un = {}, dn = (l, a) => {
      for (a === void 0 && x("ptr should not be undefined"); l.baseClass; )
        a = l.upcast(a), l = l.baseClass;
      return a;
    }, fn = (l, a) => (a = dn(l, a), un[a]), Fe = (l, a) => {
      (!a.ptrType || !a.ptr) && Ee("makeClassHandle requires ptr and ptrType");
      var f = !!a.smartPtrType, m = !!a.smartPtr;
      return f !== m && Ee("Both smartPtrType and smartPtr must be specified"), a.count = { value: 1 }, Ie(Object.create(l, { $$: { value: a, writable: !0 } }));
    };
    function pn(l) {
      var a = this.getPointee(l);
      if (!a)
        return this.destructor(l), null;
      var f = fn(this.registeredClass, a);
      if (f !== void 0) {
        if (f.$$.count.value === 0)
          return f.$$.ptr = a, f.$$.smartPtr = l, f.clone();
        var m = f.clone();
        return this.destructor(l), m;
      }
      function b() {
        return this.isSmartPointer ? Fe(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: a, smartPtrType: this, smartPtr: l }) : Fe(this.registeredClass.instancePrototype, { ptrType: this, ptr: l });
      }
      var w = this.registeredClass.getActualType(a), C = zt[w];
      if (!C)
        return b.call(this);
      var v;
      this.isConst ? v = C.constPointerType : v = C.pointerType;
      var A = Wt(a, this.registeredClass, v.registeredClass);
      return A === null ? b.call(this) : this.isSmartPointer ? Fe(v.registeredClass.instancePrototype, { ptrType: v, ptr: A, smartPtrType: this, smartPtr: l }) : Fe(v.registeredClass.instancePrototype, { ptrType: v, ptr: A });
    }
    var Ie = (l) => typeof FinalizationRegistry > "u" ? (Ie = (a) => a, l) : (qe = new FinalizationRegistry((a) => {
      Nt(a.$$);
    }), Ie = (a) => {
      var f = a.$$, m = !!f.smartPtr;
      if (m) {
        var b = { $$: f };
        qe.register(a, b, a);
      }
      return a;
    }, xt = (a) => qe.unregister(a), Ie(l)), mn = () => {
      Object.assign(_e.prototype, { isAliasOf(l) {
        if (!(this instanceof _e) || !(l instanceof _e))
          return !1;
        var a = this.$$.ptrType.registeredClass, f = this.$$.ptr;
        l.$$ = l.$$;
        for (var m = l.$$.ptrType.registeredClass, b = l.$$.ptr; a.baseClass; )
          f = a.upcast(f), a = a.baseClass;
        for (; m.baseClass; )
          b = m.upcast(b), m = m.baseClass;
        return a === m && f === b;
      }, clone() {
        if (this.$$.ptr || Ke(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var l = Ie(Object.create(Object.getPrototypeOf(this), { $$: { value: ln(this.$$) } }));
        return l.$$.count.value += 1, l.$$.deleteScheduled = !1, l;
      }, delete() {
        this.$$.ptr || Ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), xt(this), Nt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function _e() {
    }
    var Le = (l, a) => Object.defineProperty(a, "name", { value: l }), yn = (l, a, f) => {
      if (l[a].overloadTable === void 0) {
        var m = l[a];
        l[a] = function(...b) {
          return l[a].overloadTable.hasOwnProperty(b.length) || x(`Function '${f}' called with an invalid number of arguments (${b.length}) - expects one of (${l[a].overloadTable})!`), l[a].overloadTable[b.length].apply(this, b);
        }, l[a].overloadTable = [], l[a].overloadTable[m.argCount] = m;
      }
    }, Xe = (l, a, f) => {
      t.hasOwnProperty(l) ? ((f === void 0 || t[l].overloadTable !== void 0 && t[l].overloadTable[f] !== void 0) && x(`Cannot register public name '${l}' twice`), yn(t, l, l), t[l].overloadTable.hasOwnProperty(f) && x(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`), t[l].overloadTable[f] = a) : (t[l] = a, t[l].argCount = f);
    }, hn = 48, gn = 57, bn = (l) => {
      l = l.replace(/[^a-zA-Z0-9_]/g, "$");
      var a = l.charCodeAt(0);
      return a >= hn && a <= gn ? `_${l}` : l;
    };
    function vn(l, a, f, m, b, w, C, v) {
      this.name = l, this.constructor = a, this.instancePrototype = f, this.rawDestructor = m, this.baseClass = b, this.getActualType = w, this.upcast = C, this.downcast = v, this.pureVirtualFunctions = [];
    }
    var Me = (l, a, f) => {
      for (; a !== f; )
        a.upcast || x(`Expected null or instance of ${f.name}, got an instance of ${a.name}`), l = a.upcast(l), a = a.baseClass;
      return l;
    };
    function On(l, a) {
      if (a === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      a.$$ || x(`Cannot pass "${ke(a)}" as a ${this.name}`), a.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, m = Me(a.$$.ptr, f, this.registeredClass);
      return m;
    }
    function wn(l, a) {
      var f;
      if (a === null)
        return this.isReference && x(`null is not a valid ${this.name}`), this.isSmartPointer ? (f = this.rawConstructor(), l !== null && l.push(this.rawDestructor, f), f) : 0;
      (!a || !a.$$) && x(`Cannot pass "${ke(a)}" as a ${this.name}`), a.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && a.$$.ptrType.isConst && x(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
      var m = a.$$.ptrType.registeredClass;
      if (f = Me(a.$$.ptr, m, this.registeredClass), this.isSmartPointer)
        switch (a.$$.smartPtr === void 0 && x("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            a.$$.smartPtrType === this ? f = a.$$.smartPtr : x(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            f = a.$$.smartPtr;
            break;
          case 2:
            if (a.$$.smartPtrType === this)
              f = a.$$.smartPtr;
            else {
              var b = a.clone();
              f = this.rawShare(f, J.toHandle(() => b.delete())), l !== null && l.push(this.rawDestructor, f);
            }
            break;
          default:
            x("Unsupporting sharing policy");
        }
      return f;
    }
    function Pn(l, a) {
      if (a === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      a.$$ || x(`Cannot pass "${ke(a)}" as a ${this.name}`), a.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), a.$$.ptrType.isConst && x(`Cannot convert argument of type ${a.$$.ptrType.name} to parameter type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, m = Me(a.$$.ptr, f, this.registeredClass);
      return m;
    }
    function Re(l) {
      return this.fromWireType(N[l >> 2]);
    }
    var In = () => {
      Object.assign(xe.prototype, { getPointee(l) {
        return this.rawGetPointee && (l = this.rawGetPointee(l)), l;
      }, destructor(l) {
        var a;
        (a = this.rawDestructor) == null || a.call(this, l);
      }, argPackAdvance: K, readValueFromPointer: Re, fromWireType: pn });
    };
    function xe(l, a, f, m, b, w, C, v, A, _, T) {
      this.name = l, this.registeredClass = a, this.isReference = f, this.isConst = m, this.isSmartPointer = b, this.pointeeType = w, this.sharingPolicy = C, this.rawGetPointee = v, this.rawConstructor = A, this.rawShare = _, this.rawDestructor = T, !b && a.baseClass === void 0 ? m ? (this.toWireType = On, this.destructorFunction = null) : (this.toWireType = Pn, this.destructorFunction = null) : this.toWireType = wn;
    }
    var Vt = (l, a, f) => {
      t.hasOwnProperty(l) || Ee("Replacing nonexistent public symbol"), t[l].overloadTable !== void 0 && f !== void 0 ? t[l].overloadTable[f] = a : (t[l] = a, t[l].argCount = f);
    }, jn = (l, a, f) => {
      l = l.replace(/p/g, "i");
      var m = t["dynCall_" + l];
      return m(a, ...f);
    }, Cn = (l, a, f = []) => {
      var m = jn(l, a, f);
      return m;
    }, Sn = (l, a) => (...f) => Cn(l, a, f), ne = (l, a) => {
      l = z(l);
      function f() {
        return Sn(l, a);
      }
      var m = f();
      return typeof m != "function" && x(`unknown function pointer with signature ${l}: ${a}`), m;
    }, An = (l, a) => {
      var f = Le(a, function(m) {
        this.name = a, this.message = m;
        var b = new Error(m).stack;
        b !== void 0 && (this.stack = this.toString() + `
` + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return f.prototype = Object.create(l.prototype), f.prototype.constructor = f, f.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, f;
    }, Ut, Gt = (l) => {
      var a = ko(l), f = z(a);
      return te(a), f;
    }, je = (l, a) => {
      var f = [], m = {};
      function b(w) {
        if (!m[w] && !ue[w]) {
          if (Te[w]) {
            Te[w].forEach(b);
            return;
          }
          f.push(w), m[w] = !0;
        }
      }
      throw a.forEach(b), new Ut(`${l}: ` + f.map(Gt).join([", "]));
    }, Dn = (l, a, f, m, b, w, C, v, A, _, T, W, V) => {
      T = z(T), w = ne(b, w), v && (v = ne(C, v)), _ && (_ = ne(A, _)), V = ne(W, V);
      var q = bn(T);
      Xe(q, function() {
        je(`Cannot construct ${T} due to unbound types`, [m]);
      }), ge([l, a, f], m ? [m] : [], (X) => {
        var tr;
        X = X[0];
        var ie, H;
        m ? (ie = X.registeredClass, H = ie.instancePrototype) : H = _e.prototype;
        var Q = Le(T, function(...at) {
          if (Object.getPrototypeOf(this) !== ae)
            throw new he("Use 'new' to construct " + T);
          if (U.constructor_body === void 0)
            throw new he(T + " has no accessible constructor");
          var rr = U.constructor_body[at.length];
          if (rr === void 0)
            throw new he(`Tried to invoke ctor of ${T} with invalid number of parameters (${at.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return rr.apply(this, at);
        }), ae = Object.create(H, { constructor: { value: Q } });
        Q.prototype = ae;
        var U = new vn(T, Q, ae, V, ie, w, v, _);
        U.baseClass && ((tr = U.baseClass).__derivedClasses ?? (tr.__derivedClasses = []), U.baseClass.__derivedClasses.push(U));
        var se = new xe(T, U, !0, !1, !1), We = new xe(T + "*", U, !1, !1, !1), er = new xe(T + " const*", U, !1, !0, !1);
        return zt[l] = { pointerType: We, constPointerType: er }, Vt(q, Q), [se, We, er];
      });
    }, $t = (l, a) => {
      for (var f = [], m = 0; m < l; m++)
        f.push(N[a + m * 4 >> 2]);
      return f;
    }, Qe = (l) => {
      for (; l.length; ) {
        var a = l.pop(), f = l.pop();
        f(a);
      }
    };
    function kn(l) {
      for (var a = 1; a < l.length; ++a)
        if (l[a] !== null && l[a].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Ne = (l) => {
      try {
        return l();
      } catch (a) {
        De(a);
      }
    }, Bt = (l) => {
      if (l instanceof Dt || l == "unwind")
        return Ae;
      h(1, l);
    }, Ht = 0, Yt = () => Ft || Ht > 0, Jt = (l) => {
      var a;
      Ae = l, Yt() || ((a = t.onExit) == null || a.call(t, l), B = !0), h(l, new Dt(l));
    }, Tn = (l, a) => {
      Ae = l, Jt(l);
    }, En = Tn, Fn = () => {
      if (!Yt())
        try {
          En(Ae);
        } catch (l) {
          Bt(l);
        }
    }, Zt = (l) => {
      if (!B)
        try {
          l(), Fn();
        } catch (a) {
          Bt(a);
        }
    }, k = { instrumentWasmImports(l) {
      var a = /^(__asyncjs__.*)$/;
      for (let [f, m] of Object.entries(l))
        typeof m == "function" && (m.isAsync || a.test(f));
    }, instrumentWasmExports(l) {
      var a = {};
      for (let [f, m] of Object.entries(l))
        typeof m == "function" ? a[f] = (...b) => {
          k.exportCallStack.push(f);
          try {
            return m(...b);
          } finally {
            B || (k.exportCallStack.pop(), k.maybeStopUnwind());
          }
        } : a[f] = m;
      return a;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(l) {
      var a = k.callStackNameToId[l];
      return a === void 0 && (a = k.callStackId++, k.callStackNameToId[l] = a, k.callStackIdToName[a] = l), a;
    }, maybeStopUnwind() {
      k.currData && k.state === k.State.Unwinding && k.exportCallStack.length === 0 && (k.state = k.State.Normal, Ne(Fo), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((l, a) => {
        k.asyncPromiseHandlers = { resolve: l, reject: a };
      });
    }, allocateData() {
      var l = ot(12 + k.StackSize);
      return k.setDataHeader(l, l + 12, k.StackSize), k.setDataRewindFunc(l), l;
    }, setDataHeader(l, a, f) {
      N[l >> 2] = a, N[l + 4 >> 2] = a + f;
    }, setDataRewindFunc(l) {
      var a = k.exportCallStack[0], f = k.getCallStackId(a);
      re[l + 8 >> 2] = f;
    }, getDataRewindFuncName(l) {
      var a = re[l + 8 >> 2], f = k.callStackIdToName[a];
      return f;
    }, getDataRewindFunc(l) {
      var a = M[l];
      return a;
    }, doRewind(l) {
      var a = k.getDataRewindFuncName(l), f = k.getDataRewindFunc(a);
      return f();
    }, handleSleep(l) {
      if (!B) {
        if (k.state === k.State.Normal) {
          var a = !1, f = !1;
          l((m = 0) => {
            if (!B && (k.handleSleepReturnValue = m, a = !0, !!f)) {
              k.state = k.State.Rewinding, Ne(() => _o(k.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
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
          }), f = !0, a || (k.state = k.State.Unwinding, k.currData = k.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Ne(() => Eo(k.currData)));
        } else k.state === k.State.Rewinding ? (k.state = k.State.Normal, Ne(Lo), te(k.currData), k.currData = null, k.sleepCallbacks.forEach(Zt)) : De(`invalid state: ${k.state}`);
        return k.handleSleepReturnValue;
      }
    }, handleAsync(l) {
      return k.handleSleep((a) => {
        l().then(a);
      });
    } };
    function Kt(l, a, f, m, b, w) {
      var C = a.length;
      C < 2 && x("argTypes array size mismatch! Must at least get return value and 'this' types!"), a[1];
      var v = kn(a), A = a[0].name !== "void", _ = C - 2, T = new Array(_), W = [], V = [], q = function(...X) {
        V.length = 0;
        var ie;
        W.length = 1, W[0] = b;
        for (var H = 0; H < _; ++H)
          T[H] = a[H + 2].toWireType(V, X[H]), W.push(T[H]);
        var Q = m(...W);
        function ae(U) {
          if (v)
            Qe(V);
          else
            for (var se = 2; se < a.length; se++) {
              var We = se === 1 ? ie : T[se - 2];
              a[se].destructorFunction !== null && a[se].destructorFunction(We);
            }
          if (A)
            return a[0].fromWireType(U);
        }
        return k.currData ? k.whenDone().then(ae) : ae(Q);
      };
      return Le(l, q);
    }
    var _n = (l, a, f, m, b, w) => {
      var C = $t(a, f);
      b = ne(m, b), ge([], [l], (v) => {
        v = v[0];
        var A = `constructor ${v.name}`;
        if (v.registeredClass.constructor_body === void 0 && (v.registeredClass.constructor_body = []), v.registeredClass.constructor_body[a - 1] !== void 0)
          throw new he(`Cannot register multiple constructors with identical number of parameters (${a - 1}) for class '${v.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return v.registeredClass.constructor_body[a - 1] = () => {
          je(`Cannot construct ${v.name} due to unbound types`, C);
        }, ge([], C, (_) => (_.splice(1, 0, null), v.registeredClass.constructor_body[a - 1] = Kt(A, _, null, b, w), [])), [];
      });
    }, qt = (l, a, f) => (l instanceof Object || x(`${f} with invalid "this": ${l}`), l instanceof a.registeredClass.constructor || x(`${f} incompatible with "this" of type ${l.constructor.name}`), l.$$.ptr || x(`cannot call emscripten binding method ${f} on deleted object`), Me(l.$$.ptr, l.$$.ptrType.registeredClass, a.registeredClass)), Ln = (l, a, f, m, b, w, C, v, A, _) => {
      a = z(a), b = ne(m, b), ge([], [l], (T) => {
        T = T[0];
        var W = `${T.name}.${a}`, V = { get() {
          je(`Cannot access ${W} due to unbound types`, [f, C]);
        }, enumerable: !0, configurable: !0 };
        return A ? V.set = () => je(`Cannot access ${W} due to unbound types`, [f, C]) : V.set = (q) => x(W + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, a, V), ge([], A ? [f, C] : [f], (q) => {
          var X = q[0], ie = { get() {
            var Q = qt(this, T, W + " getter");
            return X.fromWireType(b(w, Q));
          }, enumerable: !0 };
          if (A) {
            A = ne(v, A);
            var H = q[1];
            ie.set = function(Q) {
              var ae = qt(this, T, W + " setter"), U = [];
              A(_, ae, H.toWireType(U, Q)), Qe(U);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, a, ie), [];
        }), [];
      });
    }, et = [], oe = [], tt = (l) => {
      l > 9 && --oe[l + 1] === 0 && (oe[l] = void 0, et.push(l));
    }, Mn = () => oe.length / 2 - 5 - et.length, Rn = () => {
      oe.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Mn;
    }, J = { toValue: (l) => (l || x("Cannot use deleted val. handle = " + l), oe[l]), toHandle: (l) => {
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
          const a = et.pop() || oe.length;
          return oe[a] = l, oe[a + 1] = 1, a;
        }
      }
    } }, xn = { name: "emscripten::val", fromWireType: (l) => {
      var a = J.toValue(l);
      return tt(l), a;
    }, toWireType: (l, a) => J.toHandle(a), argPackAdvance: K, readValueFromPointer: Re, destructorFunction: null }, Nn = (l) => Y(l, xn), Wn = (l, a, f) => {
      switch (a) {
        case 1:
          return f ? function(m) {
            return this.fromWireType(Z[m]);
          } : function(m) {
            return this.fromWireType(G[m]);
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
            return this.fromWireType(N[m >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${a}): ${l}`);
      }
    }, zn = (l, a, f, m) => {
      a = z(a);
      function b() {
      }
      b.values = {}, Y(l, { name: a, constructor: b, fromWireType: function(w) {
        return this.constructor.values[w];
      }, toWireType: (w, C) => C.value, argPackAdvance: K, readValueFromPointer: Wn(a, f, m), destructorFunction: null }), Xe(a, b);
    }, rt = (l, a) => {
      var f = ue[l];
      return f === void 0 && x(`${a} has unknown type ${Gt(l)}`), f;
    }, Vn = (l, a, f) => {
      var m = rt(l, "enum");
      a = z(a);
      var b = m.constructor, w = Object.create(m.constructor.prototype, { value: { value: f }, constructor: { value: Le(`${m.name}_${a}`, function() {
      }) } });
      b.values[f] = w, b[a] = w;
    }, Un = (l, a) => {
      switch (a) {
        case 4:
          return function(f) {
            return this.fromWireType(Pt[f >> 2]);
          };
        case 8:
          return function(f) {
            return this.fromWireType(Ct[f >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${a}): ${l}`);
      }
    }, Gn = (l, a, f) => {
      a = z(a), Y(l, { name: a, fromWireType: (m) => m, toWireType: (m, b) => b, argPackAdvance: K, readValueFromPointer: Un(a, f), destructorFunction: null });
    }, $n = (l) => {
      l = l.trim();
      const a = l.indexOf("(");
      return a === -1 ? l : l.slice(0, a);
    }, Bn = (l, a, f, m, b, w, C, v) => {
      var A = $t(a, f);
      l = z(l), l = $n(l), b = ne(m, b), Xe(l, function() {
        je(`Cannot call ${l} due to unbound types`, A);
      }, a - 1), ge([], A, (_) => {
        var T = [_[0], null].concat(_.slice(1));
        return Vt(l, Kt(l, T, null, b, w), a - 1), [];
      });
    }, Hn = (l, a, f, m, b) => {
      a = z(a);
      var w = (T) => T;
      if (m === 0) {
        var C = 32 - 8 * f;
        w = (T) => T << C >>> C;
      }
      var v = a.includes("unsigned"), A = (T, W) => {
      }, _;
      v ? _ = function(T, W) {
        return A(W, this.name), W >>> 0;
      } : _ = function(T, W) {
        return A(W, this.name), W;
      }, Y(l, { name: a, fromWireType: w, toWireType: _, argPackAdvance: K, readValueFromPointer: Rt(a, f, m !== 0), destructorFunction: null });
    }, Yn = (l, a, f) => {
      var m = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], b = m[a];
      function w(C) {
        var v = N[C >> 2], A = N[C + 4 >> 2];
        return new b(Z.buffer, A, v);
      }
      f = z(f), Y(l, { name: f, fromWireType: w, argPackAdvance: K, readValueFromPointer: w }, { ignoreDuplicateRegistrations: !0 });
    }, Jn = (l, a, f, m) => {
      if (!(m > 0)) return 0;
      for (var b = f, w = f + m - 1, C = 0; C < l.length; ++C) {
        var v = l.charCodeAt(C);
        if (v >= 55296 && v <= 57343) {
          var A = l.charCodeAt(++C);
          v = 65536 + ((v & 1023) << 10) | A & 1023;
        }
        if (v <= 127) {
          if (f >= w) break;
          a[f++] = v;
        } else if (v <= 2047) {
          if (f + 1 >= w) break;
          a[f++] = 192 | v >> 6, a[f++] = 128 | v & 63;
        } else if (v <= 65535) {
          if (f + 2 >= w) break;
          a[f++] = 224 | v >> 12, a[f++] = 128 | v >> 6 & 63, a[f++] = 128 | v & 63;
        } else {
          if (f + 3 >= w) break;
          a[f++] = 240 | v >> 18, a[f++] = 128 | v >> 12 & 63, a[f++] = 128 | v >> 6 & 63, a[f++] = 128 | v & 63;
        }
      }
      return a[f] = 0, f - b;
    }, Zn = (l, a, f) => Jn(l, G, a, f), Kn = (l) => {
      for (var a = 0, f = 0; f < l.length; ++f) {
        var m = l.charCodeAt(f);
        m <= 127 ? a++ : m <= 2047 ? a += 2 : m >= 55296 && m <= 57343 ? (a += 4, ++f) : a += 3;
      }
      return a;
    }, Xt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, qn = (l, a = 0, f = NaN) => {
      for (var m = a + f, b = a; l[b] && !(b >= m); ) ++b;
      if (b - a > 16 && l.buffer && Xt)
        return Xt.decode(l.subarray(a, b));
      for (var w = ""; a < b; ) {
        var C = l[a++];
        if (!(C & 128)) {
          w += String.fromCharCode(C);
          continue;
        }
        var v = l[a++] & 63;
        if ((C & 224) == 192) {
          w += String.fromCharCode((C & 31) << 6 | v);
          continue;
        }
        var A = l[a++] & 63;
        if ((C & 240) == 224 ? C = (C & 15) << 12 | v << 6 | A : C = (C & 7) << 18 | v << 12 | A << 6 | l[a++] & 63, C < 65536)
          w += String.fromCharCode(C);
        else {
          var _ = C - 65536;
          w += String.fromCharCode(55296 | _ >> 10, 56320 | _ & 1023);
        }
      }
      return w;
    }, Xn = (l, a) => l ? qn(G, l, a) : "", Qn = (l, a) => {
      a = z(a), Y(l, { name: a, fromWireType(f) {
        for (var m = N[f >> 2], b = f + 4, w, C, v = b, C = 0; C <= m; ++C) {
          var A = b + C;
          if (C == m || G[A] == 0) {
            var _ = A - v, T = Xn(v, _);
            w === void 0 ? w = T : (w += "\0", w += T), v = A + 1;
          }
        }
        return te(f), w;
      }, toWireType(f, m) {
        m instanceof ArrayBuffer && (m = new Uint8Array(m));
        var b, w = typeof m == "string";
        w || m instanceof Uint8Array || m instanceof Uint8ClampedArray || m instanceof Int8Array || x("Cannot pass non-string to std::string"), w ? b = Kn(m) : b = m.length;
        var C = ot(4 + b + 1), v = C + 4;
        if (N[C >> 2] = b, w)
          Zn(m, v, b + 1);
        else if (w)
          for (var A = 0; A < b; ++A) {
            var _ = m.charCodeAt(A);
            _ > 255 && (te(C), x("String has UTF-16 code units that do not fit in 8 bits")), G[v + A] = _;
          }
        else
          for (var A = 0; A < b; ++A)
            G[v + A] = m[A];
        return f !== null && f.push(te, C), C;
      }, argPackAdvance: K, readValueFromPointer: Re, destructorFunction(f) {
        te(f);
      } });
    }, Qt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, eo = (l, a) => {
      for (var f = l, m = f >> 1, b = m + a / 2; !(m >= b) && we[m]; ) ++m;
      if (f = m << 1, f - l > 32 && Qt) return Qt.decode(G.subarray(l, f));
      for (var w = "", C = 0; !(C >= a / 2); ++C) {
        var v = me[l + C * 2 >> 1];
        if (v == 0) break;
        w += String.fromCharCode(v);
      }
      return w;
    }, to = (l, a, f) => {
      if (f ?? (f = 2147483647), f < 2) return 0;
      f -= 2;
      for (var m = a, b = f < l.length * 2 ? f / 2 : l.length, w = 0; w < b; ++w) {
        var C = l.charCodeAt(w);
        me[a >> 1] = C, a += 2;
      }
      return me[a >> 1] = 0, a - m;
    }, ro = (l) => l.length * 2, no = (l, a) => {
      for (var f = 0, m = ""; !(f >= a / 4); ) {
        var b = re[l + f * 4 >> 2];
        if (b == 0) break;
        if (++f, b >= 65536) {
          var w = b - 65536;
          m += String.fromCharCode(55296 | w >> 10, 56320 | w & 1023);
        } else
          m += String.fromCharCode(b);
      }
      return m;
    }, oo = (l, a, f) => {
      if (f ?? (f = 2147483647), f < 4) return 0;
      for (var m = a, b = m + f - 4, w = 0; w < l.length; ++w) {
        var C = l.charCodeAt(w);
        if (C >= 55296 && C <= 57343) {
          var v = l.charCodeAt(++w);
          C = 65536 + ((C & 1023) << 10) | v & 1023;
        }
        if (re[a >> 2] = C, a += 4, a + 4 > b) break;
      }
      return re[a >> 2] = 0, a - m;
    }, io = (l) => {
      for (var a = 0, f = 0; f < l.length; ++f) {
        var m = l.charCodeAt(f);
        m >= 55296 && m <= 57343 && ++f, a += 4;
      }
      return a;
    }, ao = (l, a, f) => {
      f = z(f);
      var m, b, w, C;
      a === 2 ? (m = eo, b = to, C = ro, w = (v) => we[v >> 1]) : a === 4 && (m = no, b = oo, C = io, w = (v) => N[v >> 2]), Y(l, { name: f, fromWireType: (v) => {
        for (var A = N[v >> 2], _, T = v + 4, W = 0; W <= A; ++W) {
          var V = v + 4 + W * a;
          if (W == A || w(V) == 0) {
            var q = V - T, X = m(T, q);
            _ === void 0 ? _ = X : (_ += "\0", _ += X), T = V + a;
          }
        }
        return te(v), _;
      }, toWireType: (v, A) => {
        typeof A != "string" && x(`Cannot pass non-string to C++ string type ${f}`);
        var _ = C(A), T = ot(4 + _ + a);
        return N[T >> 2] = _ / a, b(A, T + 4, _ + a), v !== null && v.push(te, T), T;
      }, argPackAdvance: K, readValueFromPointer: Re, destructorFunction(v) {
        te(v);
      } });
    }, so = (l, a) => {
      a = z(a), Y(l, { isVoid: !0, name: a, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (f, m) => {
      } });
    }, lo = () => {
      Ft = !1, Ht = 0;
    }, co = (l, a, f) => {
      var m = [], b = l.toWireType(m, f);
      return m.length && (N[a >> 2] = J.toHandle(m)), b;
    }, uo = (l, a, f) => (l = J.toValue(l), a = rt(a, "emval::as"), co(a, f, l)), fo = (l, a) => (l = J.toValue(l), a = J.toValue(a), J.toHandle(l[a])), po = {}, mo = (l) => {
      var a = po[l];
      return a === void 0 ? z(l) : a;
    }, yo = (l) => J.toHandle(mo(l)), ho = (l) => {
      var a = J.toValue(l);
      Qe(a), tt(l);
    }, go = (l, a) => {
      l = rt(l, "_emval_take_value");
      var f = l.readValueFromPointer(a);
      return J.toHandle(f);
    }, Ce = {}, bo = () => performance.now(), vo = (l, a) => {
      if (Ce[l] && (clearTimeout(Ce[l].id), delete Ce[l]), !a) return 0;
      var f = setTimeout(() => {
        delete Ce[l], Zt(() => To(l, bo()));
      }, a);
      return Ce[l] = { id: f, timeout_ms: a }, 0;
    }, Oo = () => 2147483648, wo = (l, a) => Math.ceil(l / a) * a, Po = (l) => {
      var a = R.buffer, f = (l - a.byteLength + 65535) / 65536 | 0;
      try {
        return R.grow(f), At(), 1;
      } catch {
      }
    }, Io = (l) => {
      var a = G.length;
      l >>>= 0;
      var f = Oo();
      if (l > f)
        return !1;
      for (var m = 1; m <= 4; m *= 2) {
        var b = a * (1 + 0.2 / m);
        b = Math.min(b, l + 100663296);
        var w = Math.min(f, wo(Math.max(l, b), 65536)), C = Po(w);
        if (C)
          return !0;
      }
      return !1;
    }, nt = {}, jo = () => S || "./this.program", Se = () => {
      if (!Se.strings) {
        var l = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: l, _: jo() };
        for (var f in nt)
          nt[f] === void 0 ? delete a[f] : a[f] = nt[f];
        var m = [];
        for (var f in a)
          m.push(`${f}=${a[f]}`);
        Se.strings = m;
      }
      return Se.strings;
    }, Co = (l, a) => {
      for (var f = 0; f < l.length; ++f)
        Z[a++] = l.charCodeAt(f);
      Z[a] = 0;
    }, So = (l, a) => {
      var f = 0;
      return Se().forEach((m, b) => {
        var w = a + f;
        N[l + b * 4 >> 2] = w, Co(m, w), f += m.length + 1;
      }), 0;
    }, Ao = (l, a) => {
      var f = Se();
      N[l >> 2] = f.length;
      var m = 0;
      return f.forEach((b) => m += b.length + 1), N[a >> 2] = m, 0;
    };
    nn(), he = t.BindingError = class extends Error {
      constructor(a) {
        super(a), this.name = "BindingError";
      }
    }, Mt = t.InternalError = class extends Error {
      constructor(a) {
        super(a), this.name = "InternalError";
      }
    }, mn(), In(), Ut = t.UnboundTypeError = An(Error, "UnboundTypeError"), Rn();
    var Do = { n: tn, w: rn, m: an, z: sn, f: Dn, e: _n, a: Ln, x: Nn, k: zn, g: Vn, l: Gn, b: Bn, d: Hn, c: Yn, y: Qn, h: ao, A: so, r: lo, i: uo, B: tt, j: fo, p: yo, o: ho, C: go, s: vo, v: Io, t: So, u: Ao, q: Jt }, M = await qr();
    M.E;
    var ko = M.F, ot = t._malloc = M.G, te = t._free = M.H, To = M.I;
    t.dynCall_v = M.K, t.dynCall_ii = M.L, t.dynCall_vi = M.M, t.dynCall_i = M.N, t.dynCall_iii = M.O, t.dynCall_viii = M.P, t.dynCall_fii = M.Q, t.dynCall_viif = M.R, t.dynCall_viiii = M.S, t.dynCall_viiiiii = M.T, t.dynCall_iiiiii = M.U, t.dynCall_viiiii = M.V, t.dynCall_iiiiiii = M.W, t.dynCall_iiiiiiii = M.X, t.dynCall_viiiiiii = M.Y, t.dynCall_viiiiiiiiidi = M.Z, t.dynCall_viiiiiiiidi = M._, t.dynCall_viiiiiiiiii = M.$, t.dynCall_viiiiiiiii = M.aa, t.dynCall_viiiiiiii = M.ba, t.dynCall_iiiii = M.ca, t.dynCall_iiii = M.da;
    var Eo = M.ea, Fo = M.fa, _o = M.ga, Lo = M.ha;
    function it() {
      if (ce > 0) {
        Pe = it;
        return;
      }
      if (zr(), ce > 0) {
        Pe = it;
        return;
      }
      function l() {
        var a;
        t.calledRun = !0, !B && (Vr(), e(t), (a = t.onRuntimeInitialized) == null || a.call(t), Ur());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), l();
      }, 1)) : l();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return it(), n = o, n;
  };
})();
class gi extends zo {
  getSamWasmFilePath(c, n) {
    return `${c}/document/wasm/${n}`;
  }
  fetchSamModule(c) {
    return hi(c);
  }
  parseRawData(c) {
    const { brightness: n, hotspots: t, sharpness: e } = c.params, r = {
      confidence: c.confidence / 1e3,
      topLeft: {
        x: c.x0,
        y: c.y0
      },
      topRight: {
        x: c.x1,
        y: c.y1
      },
      bottomRight: {
        x: c.x2,
        y: c.y2
      },
      bottomLeft: {
        x: c.x3,
        y: c.y3
      },
      brightness: n / 1e3,
      hotspots: t / 1e3,
      sharpness: e / 1e3
    };
    return {
      ...r,
      smallestEdge: Vo(r)
    };
  }
  async detect(c, n) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(c, n), e = this.samWasmModule.detectDocumentWithImageParameters(
      n.width,
      n.height,
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
wt(gi);
