var Do = Object.defineProperty;
var Gn = (h) => {
  throw TypeError(h);
};
var ko = (h, u, n) => u in h ? Do(h, u, { enumerable: !0, configurable: !0, writable: !0, value: n }) : h[u] = n;
var kt = (h, u, n) => ko(h, typeof u != "symbol" ? u + "" : u, n), Bn = (h, u, n) => u.has(h) || Gn("Cannot " + n);
var ve = (h, u, n) => (Bn(h, u, "read from private field"), n ? n.call(h) : u.get(h)), _t = (h, u, n) => u.has(h) ? Gn("Cannot add the same private member more than once") : u instanceof WeakSet ? u.add(h) : u.set(h, n), Et = (h, u, n, t) => (Bn(h, u, "write to private field"), t ? t.call(h, n) : u.set(h, n), n);
const Hn = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, _o = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class fe extends Error {
  constructor(n, t) {
    super(n);
    kt(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(n) {
  }
  static fromCameraError(n) {
    if (this.logError(n), n instanceof fe)
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
    return new fe(t, n);
  }
  static fromError(n) {
    if (this.logError(n), n instanceof fe)
      return n;
    const t = "An unexpected error has occurred";
    return new fe(t);
  }
}
const Eo = {
  RGBA: "RGBA"
};
var _e, Ge, Je;
class Fo {
  constructor(u, n) {
    _t(this, _e);
    _t(this, Ge);
    _t(this, Je);
    Et(this, _e, u), Et(this, Ge, this.allocate(n.length * n.BYTES_PER_ELEMENT)), Et(this, Je, this.allocate(n.length * n.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return ve(this, Ge);
  }
  get bgr0ImagePointer() {
    return ve(this, Je);
  }
  allocate(u) {
    return ve(this, _e)._malloc(u);
  }
  free() {
    ve(this, _e)._free(ve(this, Ge)), ve(this, _e)._free(ve(this, Je));
  }
  writeDataToMemory(u) {
    ve(this, _e).HEAPU8.set(u, ve(this, Ge));
  }
}
_e = new WeakMap(), Ge = new WeakMap(), Je = new WeakMap();
class Ro {
  constructor() {
    kt(this, "samWasmModule");
  }
  getOverriddenModules(u, n) {
    return {
      locateFile: (t) => new URL(n || t, u).href
    };
  }
  async handleMissingOrInvalidSamModule(u, n) {
    try {
      const t = await fetch(u);
      if (!t.ok)
        throw new fe(
          `The path to ${n} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${u}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new fe(
          `The provided ${n} is not a valid WASM module. Please check provided path to wasm files. Current path is ${u}`
        );
    } catch (t) {
      if (t instanceof fe)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await _o() ? Hn.simd : Hn.sam;
  }
  async initSamModule(u, n) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(n, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(u, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new fe("Could not init detector.");
    }
  }
  terminateSamModule() {
    var u;
    (u = this.samWasmModule) == null || u.terminate();
  }
  async getSamVersion() {
    var n;
    const u = await ((n = this.samWasmModule) == null ? void 0 : n.getInfoString());
    return u == null ? void 0 : u.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(u) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const n = new Fo(this.samWasmModule, u);
    return n.writeDataToMemory(u), n;
  }
  convertToSamColorImage(u, n) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(u);
    return this.samWasmModule.convertToSamColorImage(
      n.width,
      n.height,
      t.rgbaImagePointer,
      Eo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetection(u, n) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(u, n), { height: e, width: r, x: a, y: d } = await this.samWasmModule.selectOptimalRegionForCompressionDetection(
      n.width,
      n.height,
      t.bgr0ImagePointer
    );
    return t.free(), {
      height: e,
      width: r,
      shiftX: a,
      shiftY: d
    };
  }
}
const Lo = (h) => Number.parseFloat(h.toFixed(3)), Mo = (h, u) => Math.min(h, u);
var He = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Yn = {}, An = {}, Dn, Jn;
function xo() {
  if (Jn) return Dn;
  Jn = 1, Dn = h;
  function h(u, n) {
    for (var t = new Array(arguments.length - 1), e = 0, r = 2, a = !0; r < arguments.length; )
      t[e++] = arguments[r++];
    return new Promise(function(d, c) {
      t[e] = function(w) {
        if (a)
          if (a = !1, w)
            c(w);
          else {
            for (var D = new Array(arguments.length - 1), v = 0; v < D.length; )
              D[v++] = arguments[v];
            d.apply(null, D);
          }
      };
      try {
        u.apply(n || null, t);
      } catch (w) {
        a && (a = !1, c(w));
      }
    });
  }
  return Dn;
}
var Zn = {}, Kn;
function $o() {
  return Kn || (Kn = 1, function(h) {
    var u = h;
    u.length = function(a) {
      var d = a.length;
      if (!d)
        return 0;
      for (var c = 0; --d % 4 > 1 && a.charAt(d) === "="; )
        ++c;
      return Math.ceil(a.length * 3) / 4 - c;
    };
    for (var n = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[n[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    u.encode = function(a, d, c) {
      for (var w = null, D = [], v = 0, I = 0, S; d < c; ) {
        var A = a[d++];
        switch (I) {
          case 0:
            D[v++] = n[A >> 2], S = (A & 3) << 4, I = 1;
            break;
          case 1:
            D[v++] = n[S | A >> 4], S = (A & 15) << 2, I = 2;
            break;
          case 2:
            D[v++] = n[S | A >> 6], D[v++] = n[A & 63], I = 0;
            break;
        }
        v > 8191 && ((w || (w = [])).push(String.fromCharCode.apply(String, D)), v = 0);
      }
      return I && (D[v++] = n[S], D[v++] = 61, I === 1 && (D[v++] = 61)), w ? (v && w.push(String.fromCharCode.apply(String, D.slice(0, v))), w.join("")) : String.fromCharCode.apply(String, D.slice(0, v));
    };
    var r = "invalid encoding";
    u.decode = function(a, d, c) {
      for (var w = c, D = 0, v, I = 0; I < a.length; ) {
        var S = a.charCodeAt(I++);
        if (S === 61 && D > 1)
          break;
        if ((S = t[S]) === void 0)
          throw Error(r);
        switch (D) {
          case 0:
            v = S, D = 1;
            break;
          case 1:
            d[c++] = v << 2 | (S & 48) >> 4, v = S, D = 2;
            break;
          case 2:
            d[c++] = (v & 15) << 4 | (S & 60) >> 2, v = S, D = 3;
            break;
          case 3:
            d[c++] = (v & 3) << 6 | S, D = 0;
            break;
        }
      }
      if (D === 1)
        throw Error(r);
      return c - w;
    }, u.test = function(a) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(a);
    };
  }(Zn)), Zn;
}
var kn, qn;
function No() {
  if (qn) return kn;
  qn = 1, kn = h;
  function h() {
    this._listeners = {};
  }
  return h.prototype.on = function(u, n, t) {
    return (this._listeners[u] || (this._listeners[u] = [])).push({
      fn: n,
      ctx: t || this
    }), this;
  }, h.prototype.off = function(u, n) {
    if (u === void 0)
      this._listeners = {};
    else if (n === void 0)
      this._listeners[u] = [];
    else
      for (var t = this._listeners[u], e = 0; e < t.length; )
        t[e].fn === n ? t.splice(e, 1) : ++e;
    return this;
  }, h.prototype.emit = function(u) {
    var n = this._listeners[u];
    if (n) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < n.length; )
        n[e].fn.apply(n[e++].ctx, t);
    }
    return this;
  }, kn;
}
var _n, Xn;
function Wo() {
  if (Xn) return _n;
  Xn = 1, _n = h(h);
  function h(r) {
    return typeof Float32Array < "u" ? function() {
      var a = new Float32Array([-0]), d = new Uint8Array(a.buffer), c = d[3] === 128;
      function w(S, A, R) {
        a[0] = S, A[R] = d[0], A[R + 1] = d[1], A[R + 2] = d[2], A[R + 3] = d[3];
      }
      function D(S, A, R) {
        a[0] = S, A[R] = d[3], A[R + 1] = d[2], A[R + 2] = d[1], A[R + 3] = d[0];
      }
      r.writeFloatLE = c ? w : D, r.writeFloatBE = c ? D : w;
      function v(S, A) {
        return d[0] = S[A], d[1] = S[A + 1], d[2] = S[A + 2], d[3] = S[A + 3], a[0];
      }
      function I(S, A) {
        return d[3] = S[A], d[2] = S[A + 1], d[1] = S[A + 2], d[0] = S[A + 3], a[0];
      }
      r.readFloatLE = c ? v : I, r.readFloatBE = c ? I : v;
    }() : function() {
      function a(c, w, D, v) {
        var I = w < 0 ? 1 : 0;
        if (I && (w = -w), w === 0)
          c(1 / w > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), D, v);
        else if (isNaN(w))
          c(2143289344, D, v);
        else if (w > 34028234663852886e22)
          c((I << 31 | 2139095040) >>> 0, D, v);
        else if (w < 11754943508222875e-54)
          c((I << 31 | Math.round(w / 1401298464324817e-60)) >>> 0, D, v);
        else {
          var S = Math.floor(Math.log(w) / Math.LN2), A = Math.round(w * Math.pow(2, -S) * 8388608) & 8388607;
          c((I << 31 | S + 127 << 23 | A) >>> 0, D, v);
        }
      }
      r.writeFloatLE = a.bind(null, u), r.writeFloatBE = a.bind(null, n);
      function d(c, w, D) {
        var v = c(w, D), I = (v >> 31) * 2 + 1, S = v >>> 23 & 255, A = v & 8388607;
        return S === 255 ? A ? NaN : I * (1 / 0) : S === 0 ? I * 1401298464324817e-60 * A : I * Math.pow(2, S - 150) * (A + 8388608);
      }
      r.readFloatLE = d.bind(null, t), r.readFloatBE = d.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var a = new Float64Array([-0]), d = new Uint8Array(a.buffer), c = d[7] === 128;
      function w(S, A, R) {
        a[0] = S, A[R] = d[0], A[R + 1] = d[1], A[R + 2] = d[2], A[R + 3] = d[3], A[R + 4] = d[4], A[R + 5] = d[5], A[R + 6] = d[6], A[R + 7] = d[7];
      }
      function D(S, A, R) {
        a[0] = S, A[R] = d[7], A[R + 1] = d[6], A[R + 2] = d[5], A[R + 3] = d[4], A[R + 4] = d[3], A[R + 5] = d[2], A[R + 6] = d[1], A[R + 7] = d[0];
      }
      r.writeDoubleLE = c ? w : D, r.writeDoubleBE = c ? D : w;
      function v(S, A) {
        return d[0] = S[A], d[1] = S[A + 1], d[2] = S[A + 2], d[3] = S[A + 3], d[4] = S[A + 4], d[5] = S[A + 5], d[6] = S[A + 6], d[7] = S[A + 7], a[0];
      }
      function I(S, A) {
        return d[7] = S[A], d[6] = S[A + 1], d[5] = S[A + 2], d[4] = S[A + 3], d[3] = S[A + 4], d[2] = S[A + 5], d[1] = S[A + 6], d[0] = S[A + 7], a[0];
      }
      r.readDoubleLE = c ? v : I, r.readDoubleBE = c ? I : v;
    }() : function() {
      function a(c, w, D, v, I, S) {
        var A = v < 0 ? 1 : 0;
        if (A && (v = -v), v === 0)
          c(0, I, S + w), c(1 / v > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), I, S + D);
        else if (isNaN(v))
          c(0, I, S + w), c(2146959360, I, S + D);
        else if (v > 17976931348623157e292)
          c(0, I, S + w), c((A << 31 | 2146435072) >>> 0, I, S + D);
        else {
          var R;
          if (v < 22250738585072014e-324)
            R = v / 5e-324, c(R >>> 0, I, S + w), c((A << 31 | R / 4294967296) >>> 0, I, S + D);
          else {
            var C = Math.floor(Math.log(v) / Math.LN2);
            C === 1024 && (C = 1023), R = v * Math.pow(2, -C), c(R * 4503599627370496 >>> 0, I, S + w), c((A << 31 | C + 1023 << 20 | R * 1048576 & 1048575) >>> 0, I, S + D);
          }
        }
      }
      r.writeDoubleLE = a.bind(null, u, 0, 4), r.writeDoubleBE = a.bind(null, n, 4, 0);
      function d(c, w, D, v, I) {
        var S = c(v, I + w), A = c(v, I + D), R = (A >> 31) * 2 + 1, C = A >>> 20 & 2047, F = 4294967296 * (A & 1048575) + S;
        return C === 2047 ? F ? NaN : R * (1 / 0) : C === 0 ? R * 5e-324 * F : R * Math.pow(2, C - 1075) * (F + 4503599627370496);
      }
      r.readDoubleLE = d.bind(null, t, 0, 4), r.readDoubleBE = d.bind(null, e, 4, 0);
    }(), r;
  }
  function u(r, a, d) {
    a[d] = r & 255, a[d + 1] = r >>> 8 & 255, a[d + 2] = r >>> 16 & 255, a[d + 3] = r >>> 24;
  }
  function n(r, a, d) {
    a[d] = r >>> 24, a[d + 1] = r >>> 16 & 255, a[d + 2] = r >>> 8 & 255, a[d + 3] = r & 255;
  }
  function t(r, a) {
    return (r[a] | r[a + 1] << 8 | r[a + 2] << 16 | r[a + 3] << 24) >>> 0;
  }
  function e(r, a) {
    return (r[a] << 24 | r[a + 1] << 16 | r[a + 2] << 8 | r[a + 3]) >>> 0;
  }
  return _n;
}
function Qn(h) {
  throw new Error('Could not dynamically require "' + h + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var En, eo;
function Uo() {
  if (eo) return En;
  eo = 1, En = h;
  function h(u) {
    try {
      if (typeof Qn != "function")
        return null;
      var n = Qn(u);
      return n && (n.length || Object.keys(n).length) ? n : null;
    } catch {
      return null;
    }
  }
  return En;
}
var to = {}, ro;
function Vo() {
  return ro || (ro = 1, function(h) {
    var u = h;
    u.length = function(n) {
      for (var t = 0, e = 0, r = 0; r < n.length; ++r)
        e = n.charCodeAt(r), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (n.charCodeAt(r + 1) & 64512) === 56320 ? (++r, t += 4) : t += 3;
      return t;
    }, u.read = function(n, t, e) {
      var r = e - t;
      if (r < 1)
        return "";
      for (var a = null, d = [], c = 0, w; t < e; )
        w = n[t++], w < 128 ? d[c++] = w : w > 191 && w < 224 ? d[c++] = (w & 31) << 6 | n[t++] & 63 : w > 239 && w < 365 ? (w = ((w & 7) << 18 | (n[t++] & 63) << 12 | (n[t++] & 63) << 6 | n[t++] & 63) - 65536, d[c++] = 55296 + (w >> 10), d[c++] = 56320 + (w & 1023)) : d[c++] = (w & 15) << 12 | (n[t++] & 63) << 6 | n[t++] & 63, c > 8191 && ((a || (a = [])).push(String.fromCharCode.apply(String, d)), c = 0);
      return a ? (c && a.push(String.fromCharCode.apply(String, d.slice(0, c))), a.join("")) : String.fromCharCode.apply(String, d.slice(0, c));
    }, u.write = function(n, t, e) {
      for (var r = e, a, d, c = 0; c < n.length; ++c)
        a = n.charCodeAt(c), a < 128 ? t[e++] = a : a < 2048 ? (t[e++] = a >> 6 | 192, t[e++] = a & 63 | 128) : (a & 64512) === 55296 && ((d = n.charCodeAt(c + 1)) & 64512) === 56320 ? (a = 65536 + ((a & 1023) << 10) + (d & 1023), ++c, t[e++] = a >> 18 | 240, t[e++] = a >> 12 & 63 | 128, t[e++] = a >> 6 & 63 | 128, t[e++] = a & 63 | 128) : (t[e++] = a >> 12 | 224, t[e++] = a >> 6 & 63 | 128, t[e++] = a & 63 | 128);
      return e - r;
    };
  }(to)), to;
}
var Fn, no;
function zo() {
  if (no) return Fn;
  no = 1, Fn = h;
  function h(u, n, t) {
    var e = t || 8192, r = e >>> 1, a = null, d = e;
    return function(c) {
      if (c < 1 || c > r)
        return u(c);
      d + c > e && (a = u(e), d = 0);
      var w = n.call(a, d, d += c);
      return d & 7 && (d = (d | 7) + 1), w;
    };
  }
  return Fn;
}
var Rn, oo;
function Go() {
  if (oo) return Rn;
  oo = 1, Rn = u;
  var h = Be();
  function u(r, a) {
    this.lo = r >>> 0, this.hi = a >>> 0;
  }
  var n = u.zero = new u(0, 0);
  n.toNumber = function() {
    return 0;
  }, n.zzEncode = n.zzDecode = function() {
    return this;
  }, n.length = function() {
    return 1;
  };
  var t = u.zeroHash = "\0\0\0\0\0\0\0\0";
  u.fromNumber = function(r) {
    if (r === 0)
      return n;
    var a = r < 0;
    a && (r = -r);
    var d = r >>> 0, c = (r - d) / 4294967296 >>> 0;
    return a && (c = ~c >>> 0, d = ~d >>> 0, ++d > 4294967295 && (d = 0, ++c > 4294967295 && (c = 0))), new u(d, c);
  }, u.from = function(r) {
    if (typeof r == "number")
      return u.fromNumber(r);
    if (h.isString(r))
      if (h.Long)
        r = h.Long.fromString(r);
      else
        return u.fromNumber(parseInt(r, 10));
    return r.low || r.high ? new u(r.low >>> 0, r.high >>> 0) : n;
  }, u.prototype.toNumber = function(r) {
    if (!r && this.hi >>> 31) {
      var a = ~this.lo + 1 >>> 0, d = ~this.hi >>> 0;
      return a || (d = d + 1 >>> 0), -(a + d * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, u.prototype.toLong = function(r) {
    return h.Long ? new h.Long(this.lo | 0, this.hi | 0, !!r) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!r };
  };
  var e = String.prototype.charCodeAt;
  return u.fromHash = function(r) {
    return r === t ? n : new u(
      (e.call(r, 0) | e.call(r, 1) << 8 | e.call(r, 2) << 16 | e.call(r, 3) << 24) >>> 0,
      (e.call(r, 4) | e.call(r, 5) << 8 | e.call(r, 6) << 16 | e.call(r, 7) << 24) >>> 0
    );
  }, u.prototype.toHash = function() {
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
  }, u.prototype.zzEncode = function() {
    var r = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ r) >>> 0, this.lo = (this.lo << 1 ^ r) >>> 0, this;
  }, u.prototype.zzDecode = function() {
    var r = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ r) >>> 0, this.hi = (this.hi >>> 1 ^ r) >>> 0, this;
  }, u.prototype.length = function() {
    var r = this.lo, a = (this.lo >>> 28 | this.hi << 4) >>> 0, d = this.hi >>> 24;
    return d === 0 ? a === 0 ? r < 16384 ? r < 128 ? 1 : 2 : r < 2097152 ? 3 : 4 : a < 16384 ? a < 128 ? 5 : 6 : a < 2097152 ? 7 : 8 : d < 128 ? 9 : 10;
  }, Rn;
}
var io;
function Be() {
  return io || (io = 1, function(h) {
    var u = h;
    u.asPromise = xo(), u.base64 = $o(), u.EventEmitter = No(), u.float = Wo(), u.inquire = Uo(), u.utf8 = Vo(), u.pool = zo(), u.LongBits = Go(), u.isNode = !!(typeof He < "u" && He && He.process && He.process.versions && He.process.versions.node), u.global = u.isNode && He || typeof window < "u" && window || typeof self < "u" && self || An, u.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), u.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), u.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, u.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, u.isObject = function(e) {
      return e && typeof e == "object";
    }, u.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    u.isSet = function(e, r) {
      var a = e[r];
      return a != null && e.hasOwnProperty(r) ? typeof a != "object" || (Array.isArray(a) ? a.length : Object.keys(a).length) > 0 : !1;
    }, u.Buffer = function() {
      try {
        var e = u.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), u._Buffer_from = null, u._Buffer_allocUnsafe = null, u.newBuffer = function(e) {
      return typeof e == "number" ? u.Buffer ? u._Buffer_allocUnsafe(e) : new u.Array(e) : u.Buffer ? u._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, u.Array = typeof Uint8Array < "u" ? Uint8Array : Array, u.Long = /* istanbul ignore next */
    u.global.dcodeIO && /* istanbul ignore next */
    u.global.dcodeIO.Long || /* istanbul ignore next */
    u.global.Long || u.inquire("long"), u.key2Re = /^true|false|0|1$/, u.key32Re = /^-?(?:0|[1-9][0-9]*)$/, u.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, u.longToHash = function(e) {
      return e ? u.LongBits.from(e).toHash() : u.LongBits.zeroHash;
    }, u.longFromHash = function(e, r) {
      var a = u.LongBits.fromHash(e);
      return u.Long ? u.Long.fromBits(a.lo, a.hi, r) : a.toNumber(!!r);
    };
    function n(e, r, a) {
      for (var d = Object.keys(r), c = 0; c < d.length; ++c)
        (e[d[c]] === void 0 || !a) && (e[d[c]] = r[d[c]]);
      return e;
    }
    u.merge = n, u.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function r(a, d) {
        if (!(this instanceof r))
          return new r(a, d);
        Object.defineProperty(this, "message", { get: function() {
          return a;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, r) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), d && n(this, d);
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
    u.newError = t, u.ProtocolError = t("ProtocolError"), u.oneOfGetter = function(e) {
      for (var r = {}, a = 0; a < e.length; ++a)
        r[e[a]] = 1;
      return function() {
        for (var d = Object.keys(this), c = d.length - 1; c > -1; --c)
          if (r[d[c]] === 1 && this[d[c]] !== void 0 && this[d[c]] !== null)
            return d[c];
      };
    }, u.oneOfSetter = function(e) {
      return function(r) {
        for (var a = 0; a < e.length; ++a)
          e[a] !== r && delete this[e[a]];
      };
    }, u.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, u._configure = function() {
      var e = u.Buffer;
      if (!e) {
        u._Buffer_from = u._Buffer_allocUnsafe = null;
        return;
      }
      u._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(r, a) {
        return new e(r, a);
      }, u._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(r) {
        return new e(r);
      };
    };
  }(An)), An;
}
var Ln, ao;
function Oo() {
  if (ao) return Ln;
  ao = 1, Ln = c;
  var h = Be(), u, n = h.LongBits, t = h.base64, e = h.utf8;
  function r(C, F, M) {
    this.fn = C, this.len = F, this.next = void 0, this.val = M;
  }
  function a() {
  }
  function d(C) {
    this.head = C.head, this.tail = C.tail, this.len = C.len, this.next = C.states;
  }
  function c() {
    this.len = 0, this.head = new r(a, 0, 0), this.tail = this.head, this.states = null;
  }
  var w = function() {
    return h.Buffer ? function() {
      return (c.create = function() {
        return new u();
      })();
    } : function() {
      return new c();
    };
  };
  c.create = w(), c.alloc = function(C) {
    return new h.Array(C);
  }, h.Array !== Array && (c.alloc = h.pool(c.alloc, h.Array.prototype.subarray)), c.prototype._push = function(C, F, M) {
    return this.tail = this.tail.next = new r(C, F, M), this.len += F, this;
  };
  function D(C, F, M) {
    F[M] = C & 255;
  }
  function v(C, F, M) {
    for (; C > 127; )
      F[M++] = C & 127 | 128, C >>>= 7;
    F[M] = C;
  }
  function I(C, F) {
    this.len = C, this.next = void 0, this.val = F;
  }
  I.prototype = Object.create(r.prototype), I.prototype.fn = v, c.prototype.uint32 = function(C) {
    return this.len += (this.tail = this.tail.next = new I(
      (C = C >>> 0) < 128 ? 1 : C < 16384 ? 2 : C < 2097152 ? 3 : C < 268435456 ? 4 : 5,
      C
    )).len, this;
  }, c.prototype.int32 = function(C) {
    return C < 0 ? this._push(S, 10, n.fromNumber(C)) : this.uint32(C);
  }, c.prototype.sint32 = function(C) {
    return this.uint32((C << 1 ^ C >> 31) >>> 0);
  };
  function S(C, F, M) {
    for (; C.hi; )
      F[M++] = C.lo & 127 | 128, C.lo = (C.lo >>> 7 | C.hi << 25) >>> 0, C.hi >>>= 7;
    for (; C.lo > 127; )
      F[M++] = C.lo & 127 | 128, C.lo = C.lo >>> 7;
    F[M++] = C.lo;
  }
  c.prototype.uint64 = function(C) {
    var F = n.from(C);
    return this._push(S, F.length(), F);
  }, c.prototype.int64 = c.prototype.uint64, c.prototype.sint64 = function(C) {
    var F = n.from(C).zzEncode();
    return this._push(S, F.length(), F);
  }, c.prototype.bool = function(C) {
    return this._push(D, 1, C ? 1 : 0);
  };
  function A(C, F, M) {
    F[M] = C & 255, F[M + 1] = C >>> 8 & 255, F[M + 2] = C >>> 16 & 255, F[M + 3] = C >>> 24;
  }
  c.prototype.fixed32 = function(C) {
    return this._push(A, 4, C >>> 0);
  }, c.prototype.sfixed32 = c.prototype.fixed32, c.prototype.fixed64 = function(C) {
    var F = n.from(C);
    return this._push(A, 4, F.lo)._push(A, 4, F.hi);
  }, c.prototype.sfixed64 = c.prototype.fixed64, c.prototype.float = function(C) {
    return this._push(h.float.writeFloatLE, 4, C);
  }, c.prototype.double = function(C) {
    return this._push(h.float.writeDoubleLE, 8, C);
  };
  var R = h.Array.prototype.set ? function(C, F, M) {
    F.set(C, M);
  } : function(C, F, M) {
    for (var se = 0; se < C.length; ++se)
      F[M + se] = C[se];
  };
  return c.prototype.bytes = function(C) {
    var F = C.length >>> 0;
    if (!F)
      return this._push(D, 1, 0);
    if (h.isString(C)) {
      var M = c.alloc(F = t.length(C));
      t.decode(C, M, 0), C = M;
    }
    return this.uint32(F)._push(R, F, C);
  }, c.prototype.string = function(C) {
    var F = e.length(C);
    return F ? this.uint32(F)._push(e.write, F, C) : this._push(D, 1, 0);
  }, c.prototype.fork = function() {
    return this.states = new d(this), this.head = this.tail = new r(a, 0, 0), this.len = 0, this;
  }, c.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new r(a, 0, 0), this.len = 0), this;
  }, c.prototype.ldelim = function() {
    var C = this.head, F = this.tail, M = this.len;
    return this.reset().uint32(M), M && (this.tail.next = C.next, this.tail = F, this.len += M), this;
  }, c.prototype.finish = function() {
    for (var C = this.head.next, F = this.constructor.alloc(this.len), M = 0; C; )
      C.fn(C.val, F, M), M += C.len, C = C.next;
    return F;
  }, c._configure = function(C) {
    u = C, c.create = w(), u._configure();
  }, Ln;
}
var Mn, so;
function Bo() {
  if (so) return Mn;
  so = 1, Mn = n;
  var h = Oo();
  (n.prototype = Object.create(h.prototype)).constructor = n;
  var u = Be();
  function n() {
    h.call(this);
  }
  n._configure = function() {
    n.alloc = u._Buffer_allocUnsafe, n.writeBytesBuffer = u.Buffer && u.Buffer.prototype instanceof Uint8Array && u.Buffer.prototype.set.name === "set" ? function(e, r, a) {
      r.set(e, a);
    } : function(e, r, a) {
      if (e.copy)
        e.copy(r, a, 0, e.length);
      else for (var d = 0; d < e.length; )
        r[a++] = e[d++];
    };
  }, n.prototype.bytes = function(e) {
    u.isString(e) && (e = u._Buffer_from(e, "base64"));
    var r = e.length >>> 0;
    return this.uint32(r), r && this._push(n.writeBytesBuffer, r, e), this;
  };
  function t(e, r, a) {
    e.length < 40 ? u.utf8.write(e, r, a) : r.utf8Write ? r.utf8Write(e, a) : r.write(e, a);
  }
  return n.prototype.string = function(e) {
    var r = u.Buffer.byteLength(e);
    return this.uint32(r), r && this._push(t, r, e), this;
  }, n._configure(), Mn;
}
var xn, lo;
function wo() {
  if (lo) return xn;
  lo = 1, xn = r;
  var h = Be(), u, n = h.LongBits, t = h.utf8;
  function e(v, I) {
    return RangeError("index out of range: " + v.pos + " + " + (I || 1) + " > " + v.len);
  }
  function r(v) {
    this.buf = v, this.pos = 0, this.len = v.length;
  }
  var a = typeof Uint8Array < "u" ? function(v) {
    if (v instanceof Uint8Array || Array.isArray(v))
      return new r(v);
    throw Error("illegal buffer");
  } : function(v) {
    if (Array.isArray(v))
      return new r(v);
    throw Error("illegal buffer");
  }, d = function() {
    return h.Buffer ? function(v) {
      return (r.create = function(I) {
        return h.Buffer.isBuffer(I) ? new u(I) : a(I);
      })(v);
    } : a;
  };
  r.create = d(), r.prototype._slice = h.Array.prototype.subarray || /* istanbul ignore next */
  h.Array.prototype.slice, r.prototype.uint32 = /* @__PURE__ */ function() {
    var v = 4294967295;
    return function() {
      if (v = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (v = (v | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (v = (v | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (v = (v | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (v = (v | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return v;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return v;
    };
  }(), r.prototype.int32 = function() {
    return this.uint32() | 0;
  }, r.prototype.sint32 = function() {
    var v = this.uint32();
    return v >>> 1 ^ -(v & 1) | 0;
  };
  function c() {
    var v = new n(0, 0), I = 0;
    if (this.len - this.pos > 4) {
      for (; I < 4; ++I)
        if (v.lo = (v.lo | (this.buf[this.pos] & 127) << I * 7) >>> 0, this.buf[this.pos++] < 128)
          return v;
      if (v.lo = (v.lo | (this.buf[this.pos] & 127) << 28) >>> 0, v.hi = (v.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return v;
      I = 0;
    } else {
      for (; I < 3; ++I) {
        if (this.pos >= this.len)
          throw e(this);
        if (v.lo = (v.lo | (this.buf[this.pos] & 127) << I * 7) >>> 0, this.buf[this.pos++] < 128)
          return v;
      }
      return v.lo = (v.lo | (this.buf[this.pos++] & 127) << I * 7) >>> 0, v;
    }
    if (this.len - this.pos > 4) {
      for (; I < 5; ++I)
        if (v.hi = (v.hi | (this.buf[this.pos] & 127) << I * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return v;
    } else
      for (; I < 5; ++I) {
        if (this.pos >= this.len)
          throw e(this);
        if (v.hi = (v.hi | (this.buf[this.pos] & 127) << I * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return v;
      }
    throw Error("invalid varint encoding");
  }
  r.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function w(v, I) {
    return (v[I - 4] | v[I - 3] << 8 | v[I - 2] << 16 | v[I - 1] << 24) >>> 0;
  }
  r.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return w(this.buf, this.pos += 4);
  }, r.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return w(this.buf, this.pos += 4) | 0;
  };
  function D() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new n(w(this.buf, this.pos += 4), w(this.buf, this.pos += 4));
  }
  return r.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var v = h.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, v;
  }, r.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var v = h.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, v;
  }, r.prototype.bytes = function() {
    var v = this.uint32(), I = this.pos, S = this.pos + v;
    if (S > this.len)
      throw e(this, v);
    if (this.pos += v, Array.isArray(this.buf))
      return this.buf.slice(I, S);
    if (I === S) {
      var A = h.Buffer;
      return A ? A.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, I, S);
  }, r.prototype.string = function() {
    var v = this.bytes();
    return t.read(v, 0, v.length);
  }, r.prototype.skip = function(v) {
    if (typeof v == "number") {
      if (this.pos + v > this.len)
        throw e(this, v);
      this.pos += v;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, r.prototype.skipType = function(v) {
    switch (v) {
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
        for (; (v = this.uint32() & 7) !== 4; )
          this.skipType(v);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + v + " at offset " + this.pos);
    }
    return this;
  }, r._configure = function(v) {
    u = v, r.create = d(), u._configure();
    var I = h.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    h.merge(r.prototype, {
      int64: function() {
        return c.call(this)[I](!1);
      },
      uint64: function() {
        return c.call(this)[I](!0);
      },
      sint64: function() {
        return c.call(this).zzDecode()[I](!1);
      },
      fixed64: function() {
        return D.call(this)[I](!0);
      },
      sfixed64: function() {
        return D.call(this)[I](!1);
      }
    });
  }, xn;
}
var $n, co;
function Ho() {
  if (co) return $n;
  co = 1, $n = n;
  var h = wo();
  (n.prototype = Object.create(h.prototype)).constructor = n;
  var u = Be();
  function n(t) {
    h.call(this, t);
  }
  return n._configure = function() {
    u.Buffer && (n.prototype._slice = u.Buffer.prototype.slice);
  }, n.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, n._configure(), $n;
}
var uo = {}, Nn, fo;
function Yo() {
  if (fo) return Nn;
  fo = 1, Nn = u;
  var h = Be();
  (u.prototype = Object.create(h.EventEmitter.prototype)).constructor = u;
  function u(n, t, e) {
    if (typeof n != "function")
      throw TypeError("rpcImpl must be a function");
    h.EventEmitter.call(this), this.rpcImpl = n, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return u.prototype.rpcCall = function n(t, e, r, a, d) {
    if (!a)
      throw TypeError("request must be specified");
    var c = this;
    if (!d)
      return h.asPromise(n, c, t, e, r, a);
    if (!c.rpcImpl) {
      setTimeout(function() {
        d(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return c.rpcImpl(
        t,
        e[c.requestDelimited ? "encodeDelimited" : "encode"](a).finish(),
        function(w, D) {
          if (w)
            return c.emit("error", w, t), d(w);
          if (D === null) {
            c.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(D instanceof r))
            try {
              D = r[c.responseDelimited ? "decodeDelimited" : "decode"](D);
            } catch (v) {
              return c.emit("error", v, t), d(v);
            }
          return c.emit("data", D, t), d(null, D);
        }
      );
    } catch (w) {
      c.emit("error", w, t), setTimeout(function() {
        d(w);
      }, 0);
      return;
    }
  }, u.prototype.end = function(n) {
    return this.rpcImpl && (n || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, Nn;
}
var po;
function Jo() {
  return po || (po = 1, function(h) {
    var u = h;
    u.Service = Yo();
  }(uo)), uo;
}
var mo, yo;
function Zo() {
  return yo || (yo = 1, mo = {}), mo;
}
var ho;
function Ko() {
  return ho || (ho = 1, function(h) {
    var u = h;
    u.build = "minimal", u.Writer = Oo(), u.BufferWriter = Bo(), u.Reader = wo(), u.BufferReader = Ho(), u.util = Be(), u.rpc = Jo(), u.roots = Zo(), u.configure = n;
    function n() {
      u.util._configure(), u.Writer._configure(u.BufferWriter), u.Reader._configure(u.BufferReader);
    }
    n();
  }(Yn)), Yn;
}
var go, vo;
function qo() {
  return vo || (vo = 1, go = Ko()), go;
}
var x = qo();
const O = x.Reader, N = x.Writer, p = x.util, s = x.roots.default || (x.roots.default = {});
s.dot = (() => {
  const h = {};
  return h.Content = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.token = p.newBuffer([]), u.prototype.iv = p.newBuffer([]), u.prototype.schemaVersion = 0, u.prototype.bytes = p.newBuffer([]), u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.token != null && Object.hasOwnProperty.call(n, "token") && t.uint32(
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
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.Content();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.token = n.bytes();
            break;
          }
          case 2: {
            a.iv = n.bytes();
            break;
          }
          case 3: {
            a.schemaVersion = n.int32();
            break;
          }
          case 4: {
            a.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.token != null && n.hasOwnProperty("token") && !(n.token && typeof n.token.length == "number" || p.isString(n.token)) ? "token: buffer expected" : n.iv != null && n.hasOwnProperty("iv") && !(n.iv && typeof n.iv.length == "number" || p.isString(n.iv)) ? "iv: buffer expected" : n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && !p.isInteger(n.schemaVersion) ? "schemaVersion: integer expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || p.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.Content)
        return n;
      let t = new s.dot.Content();
      return n.token != null && (typeof n.token == "string" ? p.base64.decode(n.token, t.token = p.newBuffer(p.base64.length(n.token)), 0) : n.token.length >= 0 && (t.token = n.token)), n.iv != null && (typeof n.iv == "string" ? p.base64.decode(n.iv, t.iv = p.newBuffer(p.base64.length(n.iv)), 0) : n.iv.length >= 0 && (t.iv = n.iv)), n.schemaVersion != null && (t.schemaVersion = n.schemaVersion | 0), n.bytes != null && (typeof n.bytes == "string" ? p.base64.decode(n.bytes, t.bytes = p.newBuffer(p.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = p.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = p.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), n.token != null && n.hasOwnProperty("token") && (e.token = t.bytes === String ? p.base64.encode(n.token, 0, n.token.length) : t.bytes === Array ? Array.prototype.slice.call(n.token) : n.token), n.iv != null && n.hasOwnProperty("iv") && (e.iv = t.bytes === String ? p.base64.encode(n.iv, 0, n.iv.length) : t.bytes === Array ? Array.prototype.slice.call(n.iv) : n.iv), n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && (e.schemaVersion = n.schemaVersion), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Content";
    }, u;
  }(), h.v4 = function() {
    const u = {};
    return u.MagnifEyeLivenessContent = function() {
      function n(e) {
        if (this.images = [], e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.images = p.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = N.create()), e.images != null && e.images.length)
          for (let a = 0; a < e.images.length; ++a)
            s.dot.Image.encode(e.images[a], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.images && c.images.length || (c.images = []), c.images.push(s.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.images != null && e.hasOwnProperty("images")) {
          if (!Array.isArray(e.images))
            return "images: array expected";
          for (let r = 0; r < e.images.length; ++r) {
            let a = s.dot.Image.verify(e.images[r]);
            if (a)
              return "images." + a;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = s.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = s.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.MagnifEyeLivenessContent)
          return e;
        let r = new s.dot.v4.MagnifEyeLivenessContent();
        if (e.images) {
          if (!Array.isArray(e.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          r.images = [];
          for (let a = 0; a < e.images.length; ++a) {
            if (typeof e.images[a] != "object")
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            r.images[a] = s.dot.Image.fromObject(e.images[a]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.video: object expected");
          r.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          r.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        if ((r.arrays || r.defaults) && (a.images = []), r.defaults && (a.metadata = null), e.images && e.images.length) {
          a.images = [];
          for (let d = 0; d < e.images.length; ++d)
            a.images[d] = s.dot.Image.toObject(e.images[d], r);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = s.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (a.video = s.dot.Video.toObject(e.video, r), r.oneofs && (a._video = "video")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MagnifEyeLivenessContent";
      }, n;
    }(), u.Metadata = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.platform = 0, n.prototype.sessionToken = null, n.prototype.componentVersion = "", n.prototype.web = null, n.prototype.android = null, n.prototype.ios = null;
      let t;
      return Object.defineProperty(n.prototype, "_sessionToken", {
        get: p.oneOfGetter(t = ["sessionToken"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "metadata", {
        get: p.oneOfGetter(t = ["web", "android", "ios"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && s.dot.v4.WebMetadata.encode(e.web, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && s.dot.v4.AndroidMetadata.encode(e.android, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && s.dot.v4.IosMetadata.encode(e.ios, r.uint32(
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
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.Metadata();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.platform = e.int32();
              break;
            }
            case 5: {
              c.sessionToken = e.string();
              break;
            }
            case 6: {
              c.componentVersion = e.string();
              break;
            }
            case 2: {
              c.web = s.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.android = s.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.ios = s.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
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
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (r._sessionToken = 1, !p.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !p.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && e.hasOwnProperty("web")) {
          r.metadata = 1;
          {
            let a = s.dot.v4.WebMetadata.verify(e.web);
            if (a)
              return "web." + a;
          }
        }
        if (e.android != null && e.hasOwnProperty("android")) {
          if (r.metadata === 1)
            return "metadata: multiple values";
          r.metadata = 1;
          {
            let a = s.dot.v4.AndroidMetadata.verify(e.android);
            if (a)
              return "android." + a;
          }
        }
        if (e.ios != null && e.hasOwnProperty("ios")) {
          if (r.metadata === 1)
            return "metadata: multiple values";
          r.metadata = 1;
          {
            let a = s.dot.v4.IosMetadata.verify(e.ios);
            if (a)
              return "ios." + a;
          }
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.Metadata)
          return e;
        let r = new s.dot.v4.Metadata();
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
          r.web = s.dot.v4.WebMetadata.fromObject(e.web);
        }
        if (e.android != null) {
          if (typeof e.android != "object")
            throw TypeError(".dot.v4.Metadata.android: object expected");
          r.android = s.dot.v4.AndroidMetadata.fromObject(e.android);
        }
        if (e.ios != null) {
          if (typeof e.ios != "object")
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          r.ios = s.dot.v4.IosMetadata.fromObject(e.ios);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.platform = r.enums === String ? "WEB" : 0, a.componentVersion = ""), e.platform != null && e.hasOwnProperty("platform") && (a.platform = r.enums === String ? s.dot.Platform[e.platform] === void 0 ? e.platform : s.dot.Platform[e.platform] : e.platform), e.web != null && e.hasOwnProperty("web") && (a.web = s.dot.v4.WebMetadata.toObject(e.web, r), r.oneofs && (a.metadata = "web")), e.android != null && e.hasOwnProperty("android") && (a.android = s.dot.v4.AndroidMetadata.toObject(e.android, r), r.oneofs && (a.metadata = "android")), e.ios != null && e.hasOwnProperty("ios") && (a.ios = s.dot.v4.IosMetadata.toObject(e.ios, r), r.oneofs && (a.metadata = "ios")), e.sessionToken != null && e.hasOwnProperty("sessionToken") && (a.sessionToken = e.sessionToken, r.oneofs && (a._sessionToken = "sessionToken")), e.componentVersion != null && e.hasOwnProperty("componentVersion") && (a.componentVersion = e.componentVersion), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, n;
    }(), u.AndroidMetadata = function() {
      function n(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.supportedAbis = p.emptyArray, n.prototype.device = null, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = p.emptyArray, n.prototype.digestsWithTimestamp = p.emptyArray, n.prototype.dynamicCameraFrameProperties = p.emptyObject, n.prototype.tamperingIndicators = null, n.prototype.croppedYuv420Image = null, n.prototype.yuv420ImageCrop = null;
      let t;
      return Object.defineProperty(n.prototype, "_device", {
        get: p.oneOfGetter(t = ["device"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_camera", {
        get: p.oneOfGetter(t = ["camera"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: p.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_tamperingIndicators", {
        get: p.oneOfGetter(t = ["tamperingIndicators"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: p.oneOfGetter(t = ["croppedYuv420Image"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_yuv420ImageCrop", {
        get: p.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = N.create()), e.supportedAbis != null && e.supportedAbis.length)
          for (let a = 0; a < e.supportedAbis.length; ++a)
            r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(e.supportedAbis[a]);
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.device), e.digests != null && e.digests.length)
          for (let a = 0; a < e.digests.length; ++a)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[a]);
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties"))
          for (let a = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < a.length; ++d)
            r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(a[d]), s.dot.Int32List.encode(e.dynamicCameraFrameProperties[a[d]], r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            s.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[a], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && s.dot.v4.AndroidCamera.encode(e.camera, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && s.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && s.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && s.dot.v4.Yuv420ImageCrop.encode(e.yuv420ImageCrop, r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.AndroidMetadata(), w, D;
        for (; e.pos < d; ) {
          let v = e.uint32();
          if (v === a)
            break;
          switch (v >>> 3) {
            case 1: {
              c.supportedAbis && c.supportedAbis.length || (c.supportedAbis = []), c.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              c.device = e.string();
              break;
            }
            case 6: {
              c.camera = s.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.detectionNormalizedRectangle = s.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.digests && c.digests.length || (c.digests = []), c.digests.push(e.bytes());
              break;
            }
            case 5: {
              c.digestsWithTimestamp && c.digestsWithTimestamp.length || (c.digestsWithTimestamp = []), c.digestsWithTimestamp.push(s.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              c.dynamicCameraFrameProperties === p.emptyObject && (c.dynamicCameraFrameProperties = {});
              let I = e.uint32() + e.pos;
              for (w = "", D = null; e.pos < I; ) {
                let S = e.uint32();
                switch (S >>> 3) {
                  case 1:
                    w = e.string();
                    break;
                  case 2:
                    D = s.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(S & 7);
                    break;
                }
              }
              c.dynamicCameraFrameProperties[w] = D;
              break;
            }
            case 8: {
              c.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              c.croppedYuv420Image = s.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            case 10: {
              c.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(v & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let r = 0; r < e.supportedAbis.length; ++r)
            if (!p.isString(e.supportedAbis[r]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !p.isString(e.device))
          return "device: string expected";
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let r = s.dot.v4.AndroidCamera.verify(e.camera);
          if (r)
            return "camera." + r;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let r = s.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (r)
            return "detectionNormalizedRectangle." + r;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let r = 0; r < e.digests.length; ++r)
            if (!(e.digests[r] && typeof e.digests[r].length == "number" || p.isString(e.digests[r])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let r = 0; r < e.digestsWithTimestamp.length; ++r) {
            let a = s.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[r]);
            if (a)
              return "digestsWithTimestamp." + a;
          }
        }
        if (e.dynamicCameraFrameProperties != null && e.hasOwnProperty("dynamicCameraFrameProperties")) {
          if (!p.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let r = Object.keys(e.dynamicCameraFrameProperties);
          for (let a = 0; a < r.length; ++a) {
            let d = s.dot.Int32List.verify(e.dynamicCameraFrameProperties[r[a]]);
            if (d)
              return "dynamicCameraFrameProperties." + d;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || p.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let r = s.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (r)
            return "croppedYuv420Image." + r;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let r = s.dot.v4.Yuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (r)
            return "yuv420ImageCrop." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.AndroidMetadata)
          return e;
        let r = new s.dot.v4.AndroidMetadata();
        if (e.supportedAbis) {
          if (!Array.isArray(e.supportedAbis))
            throw TypeError(".dot.v4.AndroidMetadata.supportedAbis: array expected");
          r.supportedAbis = [];
          for (let a = 0; a < e.supportedAbis.length; ++a)
            r.supportedAbis[a] = String(e.supportedAbis[a]);
        }
        if (e.device != null && (r.device = String(e.device)), e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.AndroidMetadata.camera: object expected");
          r.camera = s.dot.v4.AndroidCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          r.detectionNormalizedRectangle = s.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          r.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            typeof e.digests[a] == "string" ? p.base64.decode(e.digests[a], r.digests[a] = p.newBuffer(p.base64.length(e.digests[a])), 0) : e.digests[a].length >= 0 && (r.digests[a] = e.digests[a]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          r.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a) {
            if (typeof e.digestsWithTimestamp[a] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            r.digestsWithTimestamp[a] = s.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[a]);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (typeof e.dynamicCameraFrameProperties != "object")
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          r.dynamicCameraFrameProperties = {};
          for (let a = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < a.length; ++d) {
            if (typeof e.dynamicCameraFrameProperties[a[d]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            r.dynamicCameraFrameProperties[a[d]] = s.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[a[d]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? p.base64.decode(e.tamperingIndicators, r.tamperingIndicators = p.newBuffer(p.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (r.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          r.croppedYuv420Image = s.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.AndroidMetadata.yuv420ImageCrop: object expected");
          r.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        if ((r.arrays || r.defaults) && (a.supportedAbis = [], a.digests = [], a.digestsWithTimestamp = []), (r.objects || r.defaults) && (a.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          a.supportedAbis = [];
          for (let c = 0; c < e.supportedAbis.length; ++c)
            a.supportedAbis[c] = e.supportedAbis[c];
        }
        if (e.device != null && e.hasOwnProperty("device") && (a.device = e.device, r.oneofs && (a._device = "device")), e.digests && e.digests.length) {
          a.digests = [];
          for (let c = 0; c < e.digests.length; ++c)
            a.digests[c] = r.bytes === String ? p.base64.encode(e.digests[c], 0, e.digests[c].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[c]) : e.digests[c];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          a.dynamicCameraFrameProperties = {};
          for (let c = 0; c < d.length; ++c)
            a.dynamicCameraFrameProperties[d[c]] = s.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[c]], r);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          a.digestsWithTimestamp = [];
          for (let c = 0; c < e.digestsWithTimestamp.length; ++c)
            a.digestsWithTimestamp[c] = s.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[c], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (a.camera = s.dot.v4.AndroidCamera.toObject(e.camera, r), r.oneofs && (a._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (a.detectionNormalizedRectangle = s.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (a._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (a.tamperingIndicators = r.bytes === String ? p.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : r.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, r.oneofs && (a._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (a.croppedYuv420Image = s.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (a._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (a.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, r), r.oneofs && (a._yuv420ImageCrop = "yuv420ImageCrop")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, n;
    }(), u.AndroidCamera = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.resolution = null, n.prototype.rotationDegrees = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && s.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.AndroidCamera();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.resolution = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = s.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !p.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.AndroidCamera)
          return t;
        let e = new s.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          e.resolution = s.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.resolution = null, r.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (r.resolution = s.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (r.rotationDegrees = t.rotationDegrees), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, n;
    }(), u.Yuv420Image = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = p.newBuffer([]), n.prototype.uPlane = p.newBuffer([]), n.prototype.vPlane = p.newBuffer([]), n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && s.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Yuv420Image();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.size = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.yPlane = t.bytes();
              break;
            }
            case 3: {
              d.uPlane = t.bytes();
              break;
            }
            case 4: {
              d.vPlane = t.bytes();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = s.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || p.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || p.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || p.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.Yuv420Image)
          return t;
        let e = new s.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = s.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? p.base64.decode(t.yPlane, e.yPlane = p.newBuffer(p.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? p.base64.decode(t.uPlane, e.uPlane = p.newBuffer(p.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? p.base64.decode(t.vPlane, e.vPlane = p.newBuffer(p.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.size = null, e.bytes === String ? r.yPlane = "" : (r.yPlane = [], e.bytes !== Array && (r.yPlane = p.newBuffer(r.yPlane))), e.bytes === String ? r.uPlane = "" : (r.uPlane = [], e.bytes !== Array && (r.uPlane = p.newBuffer(r.uPlane))), e.bytes === String ? r.vPlane = "" : (r.vPlane = [], e.bytes !== Array && (r.vPlane = p.newBuffer(r.vPlane)))), t.size != null && t.hasOwnProperty("size") && (r.size = s.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (r.yPlane = e.bytes === String ? p.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (r.uPlane = e.bytes === String ? p.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (r.vPlane = e.bytes === String ? p.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, n;
    }(), u.Yuv420ImageCrop = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.v4.Yuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Yuv420ImageCrop();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.image = s.dot.v4.Yuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = s.dot.v4.Yuv420Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = s.dot.PointInt.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.Yuv420ImageCrop)
          return t;
        let e = new s.dot.v4.Yuv420ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.Yuv420ImageCrop.image: object expected");
          e.image = s.dot.v4.Yuv420Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.Yuv420ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = s.dot.PointInt.fromObject(t.topLeftCorner);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.image = null, r.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (r.image = s.dot.v4.Yuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (r.topLeftCorner = s.dot.PointInt.toObject(t.topLeftCorner, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420ImageCrop";
      }, n;
    }(), u.IosMetadata = function() {
      function n(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.cameraModelId = "", n.prototype.architectureInfo = p.emptyObject, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = p.emptyArray, n.prototype.digestsWithTimestamp = p.emptyArray, n.prototype.isoValues = p.emptyArray, n.prototype.croppedYuv420Image = null, n.prototype.yuv420ImageCrop = null;
      let t;
      return Object.defineProperty(n.prototype, "_camera", {
        get: p.oneOfGetter(t = ["camera"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: p.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: p.oneOfGetter(t = ["croppedYuv420Image"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_yuv420ImageCrop", {
        get: p.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = N.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let a = Object.keys(e.architectureInfo), d = 0; d < a.length; ++d)
            r.uint32(
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
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[a]);
        if (e.isoValues != null && e.isoValues.length) {
          r.uint32(
            /* id 4, wireType 2 =*/
            34
          ).fork();
          for (let a = 0; a < e.isoValues.length; ++a)
            r.int32(e.isoValues[a]);
          r.ldelim();
        }
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            s.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[a], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && s.dot.v4.IosCamera.encode(e.camera, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && s.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && s.dot.v4.IosYuv420Image.encode(e.croppedYuv420Image, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && s.dot.v4.IosYuv420ImageCrop.encode(e.yuv420ImageCrop, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.IosMetadata(), w, D;
        for (; e.pos < d; ) {
          let v = e.uint32();
          if (v === a)
            break;
          switch (v >>> 3) {
            case 1: {
              c.cameraModelId = e.string();
              break;
            }
            case 2: {
              c.architectureInfo === p.emptyObject && (c.architectureInfo = {});
              let I = e.uint32() + e.pos;
              for (w = "", D = !1; e.pos < I; ) {
                let S = e.uint32();
                switch (S >>> 3) {
                  case 1:
                    w = e.string();
                    break;
                  case 2:
                    D = e.bool();
                    break;
                  default:
                    e.skipType(S & 7);
                    break;
                }
              }
              c.architectureInfo[w] = D;
              break;
            }
            case 6: {
              c.camera = s.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.detectionNormalizedRectangle = s.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.digests && c.digests.length || (c.digests = []), c.digests.push(e.bytes());
              break;
            }
            case 5: {
              c.digestsWithTimestamp && c.digestsWithTimestamp.length || (c.digestsWithTimestamp = []), c.digestsWithTimestamp.push(s.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (c.isoValues && c.isoValues.length || (c.isoValues = []), (v & 7) === 2) {
                let I = e.uint32() + e.pos;
                for (; e.pos < I; )
                  c.isoValues.push(e.int32());
              } else
                c.isoValues.push(e.int32());
              break;
            }
            case 8: {
              c.croppedYuv420Image = s.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            case 9: {
              c.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(v & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !p.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!p.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let r = Object.keys(e.architectureInfo);
          for (let a = 0; a < r.length; ++a)
            if (typeof e.architectureInfo[r[a]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let r = s.dot.v4.IosCamera.verify(e.camera);
          if (r)
            return "camera." + r;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let r = s.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (r)
            return "detectionNormalizedRectangle." + r;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let r = 0; r < e.digests.length; ++r)
            if (!(e.digests[r] && typeof e.digests[r].length == "number" || p.isString(e.digests[r])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let r = 0; r < e.digestsWithTimestamp.length; ++r) {
            let a = s.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[r]);
            if (a)
              return "digestsWithTimestamp." + a;
          }
        }
        if (e.isoValues != null && e.hasOwnProperty("isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let r = 0; r < e.isoValues.length; ++r)
            if (!p.isInteger(e.isoValues[r]))
              return "isoValues: integer[] expected";
        }
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let r = s.dot.v4.IosYuv420Image.verify(e.croppedYuv420Image);
          if (r)
            return "croppedYuv420Image." + r;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let r = s.dot.v4.IosYuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (r)
            return "yuv420ImageCrop." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.IosMetadata)
          return e;
        let r = new s.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (r.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (typeof e.architectureInfo != "object")
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          r.architectureInfo = {};
          for (let a = Object.keys(e.architectureInfo), d = 0; d < a.length; ++d)
            r.architectureInfo[a[d]] = !!e.architectureInfo[a[d]];
        }
        if (e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          r.camera = s.dot.v4.IosCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          r.detectionNormalizedRectangle = s.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          r.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            typeof e.digests[a] == "string" ? p.base64.decode(e.digests[a], r.digests[a] = p.newBuffer(p.base64.length(e.digests[a])), 0) : e.digests[a].length >= 0 && (r.digests[a] = e.digests[a]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          r.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a) {
            if (typeof e.digestsWithTimestamp[a] != "object")
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            r.digestsWithTimestamp[a] = s.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[a]);
          }
        }
        if (e.isoValues) {
          if (!Array.isArray(e.isoValues))
            throw TypeError(".dot.v4.IosMetadata.isoValues: array expected");
          r.isoValues = [];
          for (let a = 0; a < e.isoValues.length; ++a)
            r.isoValues[a] = e.isoValues[a] | 0;
        }
        if (e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.IosMetadata.croppedYuv420Image: object expected");
          r.croppedYuv420Image = s.dot.v4.IosYuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.IosMetadata.yuv420ImageCrop: object expected");
          r.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        (r.arrays || r.defaults) && (a.digests = [], a.isoValues = [], a.digestsWithTimestamp = []), (r.objects || r.defaults) && (a.architectureInfo = {}), r.defaults && (a.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (a.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          a.architectureInfo = {};
          for (let c = 0; c < d.length; ++c)
            a.architectureInfo[d[c]] = e.architectureInfo[d[c]];
        }
        if (e.digests && e.digests.length) {
          a.digests = [];
          for (let c = 0; c < e.digests.length; ++c)
            a.digests[c] = r.bytes === String ? p.base64.encode(e.digests[c], 0, e.digests[c].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[c]) : e.digests[c];
        }
        if (e.isoValues && e.isoValues.length) {
          a.isoValues = [];
          for (let c = 0; c < e.isoValues.length; ++c)
            a.isoValues[c] = e.isoValues[c];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          a.digestsWithTimestamp = [];
          for (let c = 0; c < e.digestsWithTimestamp.length; ++c)
            a.digestsWithTimestamp[c] = s.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[c], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (a.camera = s.dot.v4.IosCamera.toObject(e.camera, r), r.oneofs && (a._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (a.detectionNormalizedRectangle = s.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (a._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (a.croppedYuv420Image = s.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (a._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (a.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, r), r.oneofs && (a._yuv420ImageCrop = "yuv420ImageCrop")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, n;
    }(), u.IosCamera = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.resolution = null, n.prototype.rotationDegrees = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && s.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosCamera();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.resolution = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = s.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !p.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.IosCamera)
          return t;
        let e = new s.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          e.resolution = s.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.resolution = null, r.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (r.resolution = s.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (r.rotationDegrees = t.rotationDegrees), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, n;
    }(), u.IosYuv420Image = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = p.newBuffer([]), n.prototype.uvPlane = p.newBuffer([]), n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && s.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosYuv420Image();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.size = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.yPlane = t.bytes();
              break;
            }
            case 3: {
              d.uvPlane = t.bytes();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = s.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || p.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uvPlane != null && t.hasOwnProperty("uvPlane") && !(t.uvPlane && typeof t.uvPlane.length == "number" || p.isString(t.uvPlane)) ? "uvPlane: buffer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.IosYuv420Image)
          return t;
        let e = new s.dot.v4.IosYuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.IosYuv420Image.size: object expected");
          e.size = s.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? p.base64.decode(t.yPlane, e.yPlane = p.newBuffer(p.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uvPlane != null && (typeof t.uvPlane == "string" ? p.base64.decode(t.uvPlane, e.uvPlane = p.newBuffer(p.base64.length(t.uvPlane)), 0) : t.uvPlane.length >= 0 && (e.uvPlane = t.uvPlane)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.size = null, e.bytes === String ? r.yPlane = "" : (r.yPlane = [], e.bytes !== Array && (r.yPlane = p.newBuffer(r.yPlane))), e.bytes === String ? r.uvPlane = "" : (r.uvPlane = [], e.bytes !== Array && (r.uvPlane = p.newBuffer(r.uvPlane)))), t.size != null && t.hasOwnProperty("size") && (r.size = s.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (r.yPlane = e.bytes === String ? p.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uvPlane != null && t.hasOwnProperty("uvPlane") && (r.uvPlane = e.bytes === String ? p.base64.encode(t.uvPlane, 0, t.uvPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uvPlane) : t.uvPlane), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, n;
    }(), u.IosYuv420ImageCrop = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.v4.IosYuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosYuv420ImageCrop();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.image = s.dot.v4.IosYuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = s.dot.v4.IosYuv420Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = s.dot.PointInt.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.IosYuv420ImageCrop)
          return t;
        let e = new s.dot.v4.IosYuv420ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.IosYuv420ImageCrop.image: object expected");
          e.image = s.dot.v4.IosYuv420Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.IosYuv420ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = s.dot.PointInt.fromObject(t.topLeftCorner);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.image = null, r.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (r.image = s.dot.v4.IosYuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (r.topLeftCorner = s.dot.PointInt.toObject(t.topLeftCorner, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420ImageCrop";
      }, n;
    }(), u.WebMetadata = function() {
      function n(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.currentCameraProperties = null, n.prototype.availableCameraProperties = p.emptyArray, n.prototype.hashedDetectedImages = p.emptyArray, n.prototype.hashedDetectedImagesWithTimestamp = p.emptyArray, n.prototype.detectionRecord = p.emptyArray, n.prototype.croppedImage = null, n.prototype.croppedImageWithPosition = null, n.prototype.platformDetails = null;
      let t;
      return Object.defineProperty(n.prototype, "_croppedImage", {
        get: p.oneOfGetter(t = ["croppedImage"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedImageWithPosition", {
        get: p.oneOfGetter(t = ["croppedImageWithPosition"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_platformDetails", {
        get: p.oneOfGetter(t = ["platformDetails"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = N.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && s.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let a = 0; a < e.availableCameraProperties.length; ++a)
            s.dot.v4.CameraProperties.encode(e.availableCameraProperties[a], r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
        if (e.hashedDetectedImages != null && e.hashedDetectedImages.length)
          for (let a = 0; a < e.hashedDetectedImages.length; ++a)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(e.hashedDetectedImages[a]);
        if (e.detectionRecord != null && e.detectionRecord.length)
          for (let a = 0; a < e.detectionRecord.length; ++a)
            s.dot.v4.DetectedObject.encode(e.detectionRecord[a], r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let a = 0; a < e.hashedDetectedImagesWithTimestamp.length; ++a)
            s.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[a], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && s.dot.Image.encode(e.croppedImage, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition") && s.dot.v4.ImageCrop.encode(e.croppedImageWithPosition, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails") && s.dot.v4.PlatformDetails.encode(e.platformDetails, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.WebMetadata();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.currentCameraProperties = s.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.availableCameraProperties && c.availableCameraProperties.length || (c.availableCameraProperties = []), c.availableCameraProperties.push(s.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              c.hashedDetectedImages && c.hashedDetectedImages.length || (c.hashedDetectedImages = []), c.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              c.hashedDetectedImagesWithTimestamp && c.hashedDetectedImagesWithTimestamp.length || (c.hashedDetectedImagesWithTimestamp = []), c.hashedDetectedImagesWithTimestamp.push(s.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              c.detectionRecord && c.detectionRecord.length || (c.detectionRecord = []), c.detectionRecord.push(s.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              c.croppedImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.croppedImageWithPosition = s.dot.v4.ImageCrop.decode(e, e.uint32());
              break;
            }
            case 8: {
              c.platformDetails = s.dot.v4.PlatformDetails.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties")) {
          let r = s.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties);
          if (r)
            return "currentCameraProperties." + r;
        }
        if (e.availableCameraProperties != null && e.hasOwnProperty("availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let r = 0; r < e.availableCameraProperties.length; ++r) {
            let a = s.dot.v4.CameraProperties.verify(e.availableCameraProperties[r]);
            if (a)
              return "availableCameraProperties." + a;
          }
        }
        if (e.hashedDetectedImages != null && e.hasOwnProperty("hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let r = 0; r < e.hashedDetectedImages.length; ++r)
            if (!p.isString(e.hashedDetectedImages[r]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && e.hasOwnProperty("hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let r = 0; r < e.hashedDetectedImagesWithTimestamp.length; ++r) {
            let a = s.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[r]);
            if (a)
              return "hashedDetectedImagesWithTimestamp." + a;
          }
        }
        if (e.detectionRecord != null && e.hasOwnProperty("detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let r = 0; r < e.detectionRecord.length; ++r) {
            let a = s.dot.v4.DetectedObject.verify(e.detectionRecord[r]);
            if (a)
              return "detectionRecord." + a;
          }
        }
        if (e.croppedImage != null && e.hasOwnProperty("croppedImage")) {
          let r = s.dot.Image.verify(e.croppedImage);
          if (r)
            return "croppedImage." + r;
        }
        if (e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition")) {
          let r = s.dot.v4.ImageCrop.verify(e.croppedImageWithPosition);
          if (r)
            return "croppedImageWithPosition." + r;
        }
        if (e.platformDetails != null && e.hasOwnProperty("platformDetails")) {
          let r = s.dot.v4.PlatformDetails.verify(e.platformDetails);
          if (r)
            return "platformDetails." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.WebMetadata)
          return e;
        let r = new s.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (typeof e.currentCameraProperties != "object")
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          r.currentCameraProperties = s.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          r.availableCameraProperties = [];
          for (let a = 0; a < e.availableCameraProperties.length; ++a) {
            if (typeof e.availableCameraProperties[a] != "object")
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            r.availableCameraProperties[a] = s.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[a]);
          }
        }
        if (e.hashedDetectedImages) {
          if (!Array.isArray(e.hashedDetectedImages))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImages: array expected");
          r.hashedDetectedImages = [];
          for (let a = 0; a < e.hashedDetectedImages.length; ++a)
            r.hashedDetectedImages[a] = String(e.hashedDetectedImages[a]);
        }
        if (e.hashedDetectedImagesWithTimestamp) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: array expected");
          r.hashedDetectedImagesWithTimestamp = [];
          for (let a = 0; a < e.hashedDetectedImagesWithTimestamp.length; ++a) {
            if (typeof e.hashedDetectedImagesWithTimestamp[a] != "object")
              throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: object expected");
            r.hashedDetectedImagesWithTimestamp[a] = s.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[a]);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          r.detectionRecord = [];
          for (let a = 0; a < e.detectionRecord.length; ++a) {
            if (typeof e.detectionRecord[a] != "object")
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            r.detectionRecord[a] = s.dot.v4.DetectedObject.fromObject(e.detectionRecord[a]);
          }
        }
        if (e.croppedImage != null) {
          if (typeof e.croppedImage != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          r.croppedImage = s.dot.Image.fromObject(e.croppedImage);
        }
        if (e.croppedImageWithPosition != null) {
          if (typeof e.croppedImageWithPosition != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImageWithPosition: object expected");
          r.croppedImageWithPosition = s.dot.v4.ImageCrop.fromObject(e.croppedImageWithPosition);
        }
        if (e.platformDetails != null) {
          if (typeof e.platformDetails != "object")
            throw TypeError(".dot.v4.WebMetadata.platformDetails: object expected");
          r.platformDetails = s.dot.v4.PlatformDetails.fromObject(e.platformDetails);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        if ((r.arrays || r.defaults) && (a.availableCameraProperties = [], a.hashedDetectedImages = [], a.detectionRecord = [], a.hashedDetectedImagesWithTimestamp = []), r.defaults && (a.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (a.currentCameraProperties = s.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, r)), e.availableCameraProperties && e.availableCameraProperties.length) {
          a.availableCameraProperties = [];
          for (let d = 0; d < e.availableCameraProperties.length; ++d)
            a.availableCameraProperties[d] = s.dot.v4.CameraProperties.toObject(e.availableCameraProperties[d], r);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          a.hashedDetectedImages = [];
          for (let d = 0; d < e.hashedDetectedImages.length; ++d)
            a.hashedDetectedImages[d] = e.hashedDetectedImages[d];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          a.detectionRecord = [];
          for (let d = 0; d < e.detectionRecord.length; ++d)
            a.detectionRecord[d] = s.dot.v4.DetectedObject.toObject(e.detectionRecord[d], r);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          a.hashedDetectedImagesWithTimestamp = [];
          for (let d = 0; d < e.hashedDetectedImagesWithTimestamp.length; ++d)
            a.hashedDetectedImagesWithTimestamp[d] = s.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[d], r);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (a.croppedImage = s.dot.Image.toObject(e.croppedImage, r), r.oneofs && (a._croppedImage = "croppedImage")), e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition") && (a.croppedImageWithPosition = s.dot.v4.ImageCrop.toObject(e.croppedImageWithPosition, r), r.oneofs && (a._croppedImageWithPosition = "croppedImageWithPosition")), e.platformDetails != null && e.hasOwnProperty("platformDetails") && (a.platformDetails = s.dot.v4.PlatformDetails.toObject(e.platformDetails, r), r.oneofs && (a._platformDetails = "platformDetails")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, n;
    }(), u.HashedDetectedImageWithTimestamp = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.imageHash = "", n.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.imageHash = t.string();
              break;
            }
            case 2: {
              d.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !p.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !p.isInteger(t.timestampMillis) && !(t.timestampMillis && p.isInteger(t.timestampMillis.low) && p.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new s.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (p.Long ? (e.timestampMillis = p.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        if (e.defaults)
          if (r.imageHash = "", p.Long) {
            let a = new p.Long(0, 0, !0);
            r.timestampMillis = e.longs === String ? a.toString() : e.longs === Number ? a.toNumber() : a;
          } else
            r.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (r.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? r.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : r.timestampMillis = e.longs === String ? p.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, n;
    }(), u.MediaTrackSettings = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.aspectRatio = null, n.prototype.autoGainControl = null, n.prototype.channelCount = null, n.prototype.deviceId = null, n.prototype.displaySurface = null, n.prototype.echoCancellation = null, n.prototype.facingMode = null, n.prototype.frameRate = null, n.prototype.groupId = null, n.prototype.height = null, n.prototype.noiseSuppression = null, n.prototype.sampleRate = null, n.prototype.sampleSize = null, n.prototype.width = null, n.prototype.deviceName = null;
      let t;
      return Object.defineProperty(n.prototype, "_aspectRatio", {
        get: p.oneOfGetter(t = ["aspectRatio"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_autoGainControl", {
        get: p.oneOfGetter(t = ["autoGainControl"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_channelCount", {
        get: p.oneOfGetter(t = ["channelCount"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceId", {
        get: p.oneOfGetter(t = ["deviceId"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_displaySurface", {
        get: p.oneOfGetter(t = ["displaySurface"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_echoCancellation", {
        get: p.oneOfGetter(t = ["echoCancellation"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_facingMode", {
        get: p.oneOfGetter(t = ["facingMode"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_frameRate", {
        get: p.oneOfGetter(t = ["frameRate"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_groupId", {
        get: p.oneOfGetter(t = ["groupId"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_height", {
        get: p.oneOfGetter(t = ["height"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_noiseSuppression", {
        get: p.oneOfGetter(t = ["noiseSuppression"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleRate", {
        get: p.oneOfGetter(t = ["sampleRate"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleSize", {
        get: p.oneOfGetter(t = ["sampleSize"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_width", {
        get: p.oneOfGetter(t = ["width"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceName", {
        get: p.oneOfGetter(t = ["deviceName"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && r.uint32(
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
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.MediaTrackSettings();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.aspectRatio = e.double();
              break;
            }
            case 2: {
              c.autoGainControl = e.bool();
              break;
            }
            case 3: {
              c.channelCount = e.int32();
              break;
            }
            case 4: {
              c.deviceId = e.string();
              break;
            }
            case 5: {
              c.displaySurface = e.string();
              break;
            }
            case 6: {
              c.echoCancellation = e.bool();
              break;
            }
            case 7: {
              c.facingMode = e.string();
              break;
            }
            case 8: {
              c.frameRate = e.double();
              break;
            }
            case 9: {
              c.groupId = e.string();
              break;
            }
            case 10: {
              c.height = e.int32();
              break;
            }
            case 11: {
              c.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              c.sampleRate = e.int32();
              break;
            }
            case 13: {
              c.sampleSize = e.int32();
              break;
            }
            case 14: {
              c.width = e.int32();
              break;
            }
            case 15: {
              c.deviceName = e.string();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !p.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !p.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !p.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !p.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !p.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !p.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !p.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !p.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !p.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !p.isString(e.deviceName) ? "deviceName: string expected" : null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.MediaTrackSettings)
          return e;
        let r = new s.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (r.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (r.autoGainControl = !!e.autoGainControl), e.channelCount != null && (r.channelCount = e.channelCount | 0), e.deviceId != null && (r.deviceId = String(e.deviceId)), e.displaySurface != null && (r.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (r.echoCancellation = !!e.echoCancellation), e.facingMode != null && (r.facingMode = String(e.facingMode)), e.frameRate != null && (r.frameRate = Number(e.frameRate)), e.groupId != null && (r.groupId = String(e.groupId)), e.height != null && (r.height = e.height | 0), e.noiseSuppression != null && (r.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (r.sampleRate = e.sampleRate | 0), e.sampleSize != null && (r.sampleSize = e.sampleSize | 0), e.width != null && (r.width = e.width | 0), e.deviceName != null && (r.deviceName = String(e.deviceName)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && (a.aspectRatio = r.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, r.oneofs && (a._aspectRatio = "aspectRatio")), e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && (a.autoGainControl = e.autoGainControl, r.oneofs && (a._autoGainControl = "autoGainControl")), e.channelCount != null && e.hasOwnProperty("channelCount") && (a.channelCount = e.channelCount, r.oneofs && (a._channelCount = "channelCount")), e.deviceId != null && e.hasOwnProperty("deviceId") && (a.deviceId = e.deviceId, r.oneofs && (a._deviceId = "deviceId")), e.displaySurface != null && e.hasOwnProperty("displaySurface") && (a.displaySurface = e.displaySurface, r.oneofs && (a._displaySurface = "displaySurface")), e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && (a.echoCancellation = e.echoCancellation, r.oneofs && (a._echoCancellation = "echoCancellation")), e.facingMode != null && e.hasOwnProperty("facingMode") && (a.facingMode = e.facingMode, r.oneofs && (a._facingMode = "facingMode")), e.frameRate != null && e.hasOwnProperty("frameRate") && (a.frameRate = r.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, r.oneofs && (a._frameRate = "frameRate")), e.groupId != null && e.hasOwnProperty("groupId") && (a.groupId = e.groupId, r.oneofs && (a._groupId = "groupId")), e.height != null && e.hasOwnProperty("height") && (a.height = e.height, r.oneofs && (a._height = "height")), e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && (a.noiseSuppression = e.noiseSuppression, r.oneofs && (a._noiseSuppression = "noiseSuppression")), e.sampleRate != null && e.hasOwnProperty("sampleRate") && (a.sampleRate = e.sampleRate, r.oneofs && (a._sampleRate = "sampleRate")), e.sampleSize != null && e.hasOwnProperty("sampleSize") && (a.sampleSize = e.sampleSize, r.oneofs && (a._sampleSize = "sampleSize")), e.width != null && e.hasOwnProperty("width") && (a.width = e.width, r.oneofs && (a._width = "width")), e.deviceName != null && e.hasOwnProperty("deviceName") && (a.deviceName = e.deviceName, r.oneofs && (a._deviceName = "deviceName")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, n;
    }(), u.ImageBitmap = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.width = 0, n.prototype.height = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.ImageBitmap();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.width = t.int32();
              break;
            }
            case 2: {
              d.height = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !p.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !p.isInteger(t.height) ? "height: integer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.ImageBitmap)
          return t;
        let e = new s.dot.v4.ImageBitmap();
        return t.width != null && (e.width = t.width | 0), t.height != null && (e.height = t.height | 0), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.width = 0, r.height = 0), t.width != null && t.hasOwnProperty("width") && (r.width = t.width), t.height != null && t.hasOwnProperty("height") && (r.height = t.height), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, n;
    }(), u.CameraProperties = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.cameraInitFrameResolution = null, n.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(n.prototype, "_cameraInitFrameResolution", {
        get: p.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && s.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && s.dot.v4.MediaTrackSettings.encode(e.cameraProperties, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.CameraProperties();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.cameraInitFrameResolution = s.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.cameraProperties = s.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution")) {
          let r = s.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution);
          if (r)
            return "cameraInitFrameResolution." + r;
        }
        if (e.cameraProperties != null && e.hasOwnProperty("cameraProperties")) {
          let r = s.dot.v4.MediaTrackSettings.verify(e.cameraProperties);
          if (r)
            return "cameraProperties." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.CameraProperties)
          return e;
        let r = new s.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (typeof e.cameraInitFrameResolution != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          r.cameraInitFrameResolution = s.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution);
        }
        if (e.cameraProperties != null) {
          if (typeof e.cameraProperties != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          r.cameraProperties = s.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.cameraProperties = null), e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution") && (a.cameraInitFrameResolution = s.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, r), r.oneofs && (a._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && e.hasOwnProperty("cameraProperties") && (a.cameraProperties = s.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, r)), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, n;
    }(), u.DetectedObject = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.brightness = 0, n.prototype.sharpness = 0, n.prototype.hotspots = 0, n.prototype.confidence = 0, n.prototype.faceSize = 0, n.prototype.faceCenter = null, n.prototype.smallestEdge = 0, n.prototype.bottomLeft = null, n.prototype.bottomRight = null, n.prototype.topLeft = null, n.prototype.topRight = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
        ).float(t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && s.dot.v4.Point.encode(t.faceCenter, e.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && e.uint32(
          /* id 7, wireType 5 =*/
          61
        ).float(t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && s.dot.v4.Point.encode(t.bottomLeft, e.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && s.dot.v4.Point.encode(t.bottomRight, e.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && s.dot.v4.Point.encode(t.topLeft, e.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && s.dot.v4.Point.encode(t.topRight, e.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.DetectedObject();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.brightness = t.float();
              break;
            }
            case 2: {
              d.sharpness = t.float();
              break;
            }
            case 3: {
              d.hotspots = t.float();
              break;
            }
            case 4: {
              d.confidence = t.float();
              break;
            }
            case 5: {
              d.faceSize = t.float();
              break;
            }
            case 6: {
              d.faceCenter = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 7: {
              d.smallestEdge = t.float();
              break;
            }
            case 8: {
              d.bottomLeft = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 9: {
              d.bottomRight = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 10: {
              d.topLeft = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 11: {
              d.topRight = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
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
          let e = s.dot.v4.Point.verify(t.faceCenter);
          if (e)
            return "faceCenter." + e;
        }
        if (t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && typeof t.smallestEdge != "number")
          return "smallestEdge: number expected";
        if (t.bottomLeft != null && t.hasOwnProperty("bottomLeft")) {
          let e = s.dot.v4.Point.verify(t.bottomLeft);
          if (e)
            return "bottomLeft." + e;
        }
        if (t.bottomRight != null && t.hasOwnProperty("bottomRight")) {
          let e = s.dot.v4.Point.verify(t.bottomRight);
          if (e)
            return "bottomRight." + e;
        }
        if (t.topLeft != null && t.hasOwnProperty("topLeft")) {
          let e = s.dot.v4.Point.verify(t.topLeft);
          if (e)
            return "topLeft." + e;
        }
        if (t.topRight != null && t.hasOwnProperty("topRight")) {
          let e = s.dot.v4.Point.verify(t.topRight);
          if (e)
            return "topRight." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.DetectedObject)
          return t;
        let e = new s.dot.v4.DetectedObject();
        if (t.brightness != null && (e.brightness = Number(t.brightness)), t.sharpness != null && (e.sharpness = Number(t.sharpness)), t.hotspots != null && (e.hotspots = Number(t.hotspots)), t.confidence != null && (e.confidence = Number(t.confidence)), t.faceSize != null && (e.faceSize = Number(t.faceSize)), t.faceCenter != null) {
          if (typeof t.faceCenter != "object")
            throw TypeError(".dot.v4.DetectedObject.faceCenter: object expected");
          e.faceCenter = s.dot.v4.Point.fromObject(t.faceCenter);
        }
        if (t.smallestEdge != null && (e.smallestEdge = Number(t.smallestEdge)), t.bottomLeft != null) {
          if (typeof t.bottomLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomLeft: object expected");
          e.bottomLeft = s.dot.v4.Point.fromObject(t.bottomLeft);
        }
        if (t.bottomRight != null) {
          if (typeof t.bottomRight != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomRight: object expected");
          e.bottomRight = s.dot.v4.Point.fromObject(t.bottomRight);
        }
        if (t.topLeft != null) {
          if (typeof t.topLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.topLeft: object expected");
          e.topLeft = s.dot.v4.Point.fromObject(t.topLeft);
        }
        if (t.topRight != null) {
          if (typeof t.topRight != "object")
            throw TypeError(".dot.v4.DetectedObject.topRight: object expected");
          e.topRight = s.dot.v4.Point.fromObject(t.topRight);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.brightness = 0, r.sharpness = 0, r.hotspots = 0, r.confidence = 0, r.faceSize = 0, r.faceCenter = null, r.smallestEdge = 0, r.bottomLeft = null, r.bottomRight = null, r.topLeft = null, r.topRight = null), t.brightness != null && t.hasOwnProperty("brightness") && (r.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && t.hasOwnProperty("sharpness") && (r.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && t.hasOwnProperty("hotspots") && (r.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && t.hasOwnProperty("confidence") && (r.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && t.hasOwnProperty("faceSize") && (r.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && t.hasOwnProperty("faceCenter") && (r.faceCenter = s.dot.v4.Point.toObject(t.faceCenter, e)), t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && (r.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && t.hasOwnProperty("bottomLeft") && (r.bottomLeft = s.dot.v4.Point.toObject(t.bottomLeft, e)), t.bottomRight != null && t.hasOwnProperty("bottomRight") && (r.bottomRight = s.dot.v4.Point.toObject(t.bottomRight, e)), t.topLeft != null && t.hasOwnProperty("topLeft") && (r.topLeft = s.dot.v4.Point.toObject(t.topLeft, e)), t.topRight != null && t.hasOwnProperty("topRight") && (r.topRight = s.dot.v4.Point.toObject(t.topRight, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, n;
    }(), u.Point = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.x = 0, n.prototype.y = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Point();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.x = t.float();
              break;
            }
            case 2: {
              d.y = t.float();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.x != null && t.hasOwnProperty("x") && typeof t.x != "number" ? "x: number expected" : t.y != null && t.hasOwnProperty("y") && typeof t.y != "number" ? "y: number expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.Point)
          return t;
        let e = new s.dot.v4.Point();
        return t.x != null && (e.x = Number(t.x)), t.y != null && (e.y = Number(t.y)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.x = 0, r.y = 0), t.x != null && t.hasOwnProperty("x") && (r.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && t.hasOwnProperty("y") && (r.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, n;
    }(), u.ImageCrop = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.v4.Point.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.ImageCrop();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.image = s.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = s.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = s.dot.v4.Point.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.ImageCrop)
          return t;
        let e = new s.dot.v4.ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.ImageCrop.image: object expected");
          e.image = s.dot.Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = s.dot.v4.Point.fromObject(t.topLeftCorner);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.image = null, r.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (r.image = s.dot.Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (r.topLeftCorner = s.dot.v4.Point.toObject(t.topLeftCorner, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageCrop";
      }, n;
    }(), u.PlatformDetails = function() {
      function n(e) {
        if (this.browserVersions = [], e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.userAgent = "", n.prototype.platform = null, n.prototype.platformVersion = null, n.prototype.architecture = null, n.prototype.model = null, n.prototype.browserVersions = p.emptyArray;
      let t;
      return Object.defineProperty(n.prototype, "_platform", {
        get: p.oneOfGetter(t = ["platform"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_platformVersion", {
        get: p.oneOfGetter(t = ["platformVersion"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_architecture", {
        get: p.oneOfGetter(t = ["architecture"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_model", {
        get: p.oneOfGetter(t = ["model"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = N.create()), e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && r.uint32(
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
          for (let a = 0; a < e.browserVersions.length; ++a)
            s.dot.v4.BrowserVersion.encode(e.browserVersions[a], r.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork()).ldelim();
        return r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.PlatformDetails();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.userAgent = e.string();
              break;
            }
            case 2: {
              c.platform = e.string();
              break;
            }
            case 3: {
              c.platformVersion = e.string();
              break;
            }
            case 4: {
              c.architecture = e.string();
              break;
            }
            case 5: {
              c.model = e.string();
              break;
            }
            case 6: {
              c.browserVersions && c.browserVersions.length || (c.browserVersions = []), c.browserVersions.push(s.dot.v4.BrowserVersion.decode(e, e.uint32()));
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.userAgent != null && e.hasOwnProperty("userAgent") && !p.isString(e.userAgent))
          return "userAgent: string expected";
        if (e.platform != null && e.hasOwnProperty("platform") && !p.isString(e.platform))
          return "platform: string expected";
        if (e.platformVersion != null && e.hasOwnProperty("platformVersion") && !p.isString(e.platformVersion))
          return "platformVersion: string expected";
        if (e.architecture != null && e.hasOwnProperty("architecture") && !p.isString(e.architecture))
          return "architecture: string expected";
        if (e.model != null && e.hasOwnProperty("model") && !p.isString(e.model))
          return "model: string expected";
        if (e.browserVersions != null && e.hasOwnProperty("browserVersions")) {
          if (!Array.isArray(e.browserVersions))
            return "browserVersions: array expected";
          for (let r = 0; r < e.browserVersions.length; ++r) {
            let a = s.dot.v4.BrowserVersion.verify(e.browserVersions[r]);
            if (a)
              return "browserVersions." + a;
          }
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.PlatformDetails)
          return e;
        let r = new s.dot.v4.PlatformDetails();
        if (e.userAgent != null && (r.userAgent = String(e.userAgent)), e.platform != null && (r.platform = String(e.platform)), e.platformVersion != null && (r.platformVersion = String(e.platformVersion)), e.architecture != null && (r.architecture = String(e.architecture)), e.model != null && (r.model = String(e.model)), e.browserVersions) {
          if (!Array.isArray(e.browserVersions))
            throw TypeError(".dot.v4.PlatformDetails.browserVersions: array expected");
          r.browserVersions = [];
          for (let a = 0; a < e.browserVersions.length; ++a) {
            if (typeof e.browserVersions[a] != "object")
              throw TypeError(".dot.v4.PlatformDetails.browserVersions: object expected");
            r.browserVersions[a] = s.dot.v4.BrowserVersion.fromObject(e.browserVersions[a]);
          }
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        if ((r.arrays || r.defaults) && (a.browserVersions = []), r.defaults && (a.userAgent = ""), e.userAgent != null && e.hasOwnProperty("userAgent") && (a.userAgent = e.userAgent), e.platform != null && e.hasOwnProperty("platform") && (a.platform = e.platform, r.oneofs && (a._platform = "platform")), e.platformVersion != null && e.hasOwnProperty("platformVersion") && (a.platformVersion = e.platformVersion, r.oneofs && (a._platformVersion = "platformVersion")), e.architecture != null && e.hasOwnProperty("architecture") && (a.architecture = e.architecture, r.oneofs && (a._architecture = "architecture")), e.model != null && e.hasOwnProperty("model") && (a.model = e.model, r.oneofs && (a._model = "model")), e.browserVersions && e.browserVersions.length) {
          a.browserVersions = [];
          for (let d = 0; d < e.browserVersions.length; ++d)
            a.browserVersions[d] = s.dot.v4.BrowserVersion.toObject(e.browserVersions[d], r);
        }
        return a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PlatformDetails";
      }, n;
    }(), u.BrowserVersion = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.name = "", n.prototype.version = "", n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.name != null && Object.hasOwnProperty.call(t, "name") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(t.version), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.BrowserVersion();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.name = t.string();
              break;
            }
            case 2: {
              d.version = t.string();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.name != null && t.hasOwnProperty("name") && !p.isString(t.name) ? "name: string expected" : t.version != null && t.hasOwnProperty("version") && !p.isString(t.version) ? "version: string expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.BrowserVersion)
          return t;
        let e = new s.dot.v4.BrowserVersion();
        return t.name != null && (e.name = String(t.name)), t.version != null && (e.version = String(t.version)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.name = "", r.version = ""), t.name != null && t.hasOwnProperty("name") && (r.name = t.name), t.version != null && t.hasOwnProperty("version") && (r.version = t.version), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.BrowserVersion";
      }, n;
    }(), u.FaceContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.FaceContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = s.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = s.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = s.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.FaceContent)
          return e;
        let r = new s.dot.v4.FaceContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          r.image = s.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.FaceContent.video: object expected");
          r.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          r.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.image = null, a.metadata = null), e.image != null && e.hasOwnProperty("image") && (a.image = s.dot.Image.toObject(e.image, r)), e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = s.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (a.video = s.dot.Video.toObject(e.video, r), r.oneofs && (a._video = "video")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FaceContent";
      }, n;
    }(), u.DocumentContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.DocumentContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = s.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = s.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = s.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.DocumentContent)
          return e;
        let r = new s.dot.v4.DocumentContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          r.image = s.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.DocumentContent.video: object expected");
          r.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          r.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.image = null, a.metadata = null), e.image != null && e.hasOwnProperty("image") && (a.image = s.dot.Image.toObject(e.image, r)), e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = s.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (a.video = s.dot.Video.toObject(e.video, r), r.oneofs && (a._video = "video")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.DocumentContent";
      }, n;
    }(), u.Blob = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.documentContent = null, n.prototype.eyeGazeLivenessContent = null, n.prototype.faceContent = null, n.prototype.magnifeyeLivenessContent = null, n.prototype.smileLivenessContent = null, n.prototype.palmContent = null, n.prototype.travelDocumentContent = null;
      let t;
      return Object.defineProperty(n.prototype, "blob", {
        get: p.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && s.dot.v4.DocumentContent.encode(e.documentContent, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && s.dot.v4.FaceContent.encode(e.faceContent, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && s.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && s.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && s.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && s.dot.v4.PalmContent.encode(e.palmContent, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && s.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.Blob();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.documentContent = s.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              c.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.faceContent = s.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.smileLivenessContent = s.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              c.palmContent = s.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.travelDocumentContent = s.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let r = {};
        if (e.documentContent != null && e.hasOwnProperty("documentContent")) {
          r.blob = 1;
          {
            let a = s.dot.v4.DocumentContent.verify(e.documentContent);
            if (a)
              return "documentContent." + a;
          }
        }
        if (e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let a = s.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent);
            if (a)
              return "eyeGazeLivenessContent." + a;
          }
        }
        if (e.faceContent != null && e.hasOwnProperty("faceContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let a = s.dot.v4.FaceContent.verify(e.faceContent);
            if (a)
              return "faceContent." + a;
          }
        }
        if (e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let a = s.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent);
            if (a)
              return "magnifeyeLivenessContent." + a;
          }
        }
        if (e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let a = s.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent);
            if (a)
              return "smileLivenessContent." + a;
          }
        }
        if (e.palmContent != null && e.hasOwnProperty("palmContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let a = s.dot.v4.PalmContent.verify(e.palmContent);
            if (a)
              return "palmContent." + a;
          }
        }
        if (e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent")) {
          if (r.blob === 1)
            return "blob: multiple values";
          r.blob = 1;
          {
            let a = s.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent);
            if (a)
              return "travelDocumentContent." + a;
          }
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.Blob)
          return e;
        let r = new s.dot.v4.Blob();
        if (e.documentContent != null) {
          if (typeof e.documentContent != "object")
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          r.documentContent = s.dot.v4.DocumentContent.fromObject(e.documentContent);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (typeof e.eyeGazeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          r.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent);
        }
        if (e.faceContent != null) {
          if (typeof e.faceContent != "object")
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          r.faceContent = s.dot.v4.FaceContent.fromObject(e.faceContent);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (typeof e.magnifeyeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          r.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent);
        }
        if (e.smileLivenessContent != null) {
          if (typeof e.smileLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          r.smileLivenessContent = s.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent);
        }
        if (e.palmContent != null) {
          if (typeof e.palmContent != "object")
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          r.palmContent = s.dot.v4.PalmContent.fromObject(e.palmContent);
        }
        if (e.travelDocumentContent != null) {
          if (typeof e.travelDocumentContent != "object")
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          r.travelDocumentContent = s.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return e.documentContent != null && e.hasOwnProperty("documentContent") && (a.documentContent = s.dot.v4.DocumentContent.toObject(e.documentContent, r), r.oneofs && (a.blob = "documentContent")), e.faceContent != null && e.hasOwnProperty("faceContent") && (a.faceContent = s.dot.v4.FaceContent.toObject(e.faceContent, r), r.oneofs && (a.blob = "faceContent")), e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent") && (a.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, r), r.oneofs && (a.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent") && (a.smileLivenessContent = s.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, r), r.oneofs && (a.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent") && (a.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, r), r.oneofs && (a.blob = "eyeGazeLivenessContent")), e.palmContent != null && e.hasOwnProperty("palmContent") && (a.palmContent = s.dot.v4.PalmContent.toObject(e.palmContent, r), r.oneofs && (a.blob = "palmContent")), e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent") && (a.travelDocumentContent = s.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, r), r.oneofs && (a.blob = "travelDocumentContent")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, n;
    }(), u.TravelDocumentContent = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.ldsMasterFile = null, n.prototype.accessControlProtocolUsed = 0, n.prototype.authenticationStatus = null, n.prototype.metadata = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && s.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && s.dot.v4.AuthenticationStatus.encode(t.authenticationStatus, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && s.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.TravelDocumentContent();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.ldsMasterFile = s.dot.v4.LdsMasterFile.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              d.authenticationStatus = s.dot.v4.AuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 4: {
              d.metadata = s.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile")) {
          let e = s.dot.v4.LdsMasterFile.verify(t.ldsMasterFile);
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
          let e = s.dot.v4.AuthenticationStatus.verify(t.authenticationStatus);
          if (e)
            return "authenticationStatus." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = s.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.TravelDocumentContent)
          return t;
        let e = new s.dot.v4.TravelDocumentContent();
        if (t.ldsMasterFile != null) {
          if (typeof t.ldsMasterFile != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.ldsMasterFile: object expected");
          e.ldsMasterFile = s.dot.v4.LdsMasterFile.fromObject(t.ldsMasterFile);
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
          e.authenticationStatus = s.dot.v4.AuthenticationStatus.fromObject(t.authenticationStatus);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.metadata: object expected");
          e.metadata = s.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.ldsMasterFile = null, r.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, r.authenticationStatus = null, r.metadata = null), t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile") && (r.ldsMasterFile = s.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e)), t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed") && (r.accessControlProtocolUsed = e.enums === String ? s.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : s.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus") && (r.authenticationStatus = s.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e)), t.metadata != null && t.hasOwnProperty("metadata") && (r.metadata = s.dot.v4.Metadata.toObject(t.metadata, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, n;
    }(), u.LdsMasterFile = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.lds1eMrtdApplication = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && s.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.LdsMasterFile();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication")) {
          let e = s.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication);
          if (e)
            return "lds1eMrtdApplication." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.LdsMasterFile)
          return t;
        let e = new s.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (typeof t.lds1eMrtdApplication != "object")
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          e.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication") && (r.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, n;
    }(), u.Lds1eMrtdApplication = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.comHeaderAndDataGroupPresenceInformation = null, n.prototype.sodDocumentSecurityObject = null, n.prototype.dg1MachineReadableZoneInformation = null, n.prototype.dg2EncodedIdentificationFeaturesFace = null, n.prototype.dg3AdditionalIdentificationFeatureFingers = null, n.prototype.dg4AdditionalIdentificationFeatureIrises = null, n.prototype.dg5DisplayedPortrait = null, n.prototype.dg7DisplayedSignatureOrUsualMark = null, n.prototype.dg8DataFeatures = null, n.prototype.dg9StructureFeatures = null, n.prototype.dg10SubstanceFeatures = null, n.prototype.dg11AdditionalPersonalDetails = null, n.prototype.dg12AdditionalDocumentDetails = null, n.prototype.dg13OptionalDetails = null, n.prototype.dg14SecurityOptions = null, n.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, n.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(n.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: p.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: p.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg5DisplayedPortrait", {
        get: p.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: p.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg8DataFeatures", {
        get: p.oneOfGetter(t = ["dg8DataFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg9StructureFeatures", {
        get: p.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg10SubstanceFeatures", {
        get: p.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg11AdditionalPersonalDetails", {
        get: p.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg12AdditionalDocumentDetails", {
        get: p.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg13OptionalDetails", {
        get: p.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg14SecurityOptions", {
        get: p.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: p.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg16PersonsToNotify", {
        get: p.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && s.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && s.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && s.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && s.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && s.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && s.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && s.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && s.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && s.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && s.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && s.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, r.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && s.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, r.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork()).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && s.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, r.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork()).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && s.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, r.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork()).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && s.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, r.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork()).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && s.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, r.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork()).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && s.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, r.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              c.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              c.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              c.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              c.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              c.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              c.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              c.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              c.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              c.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              c.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              c.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              c.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation);
          if (r)
            return "comHeaderAndDataGroupPresenceInformation." + r;
        }
        if (e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject);
          if (r)
            return "sodDocumentSecurityObject." + r;
        }
        if (e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation);
          if (r)
            return "dg1MachineReadableZoneInformation." + r;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace);
          if (r)
            return "dg2EncodedIdentificationFeaturesFace." + r;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers);
          if (r)
            return "dg3AdditionalIdentificationFeatureFingers." + r;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises);
          if (r)
            return "dg4AdditionalIdentificationFeatureIrises." + r;
        }
        if (e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait);
          if (r)
            return "dg5DisplayedPortrait." + r;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark);
          if (r)
            return "dg7DisplayedSignatureOrUsualMark." + r;
        }
        if (e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures);
          if (r)
            return "dg8DataFeatures." + r;
        }
        if (e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures);
          if (r)
            return "dg9StructureFeatures." + r;
        }
        if (e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures);
          if (r)
            return "dg10SubstanceFeatures." + r;
        }
        if (e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails);
          if (r)
            return "dg11AdditionalPersonalDetails." + r;
        }
        if (e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails);
          if (r)
            return "dg12AdditionalDocumentDetails." + r;
        }
        if (e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails);
          if (r)
            return "dg13OptionalDetails." + r;
        }
        if (e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions);
          if (r)
            return "dg14SecurityOptions." + r;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo);
          if (r)
            return "dg15ActiveAuthenticationPublicKeyInfo." + r;
        }
        if (e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify")) {
          let r = s.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify);
          if (r)
            return "dg16PersonsToNotify." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.Lds1eMrtdApplication)
          return e;
        let r = new s.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (typeof e.comHeaderAndDataGroupPresenceInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          r.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (typeof e.sodDocumentSecurityObject != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          r.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (typeof e.dg1MachineReadableZoneInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          r.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (typeof e.dg2EncodedIdentificationFeaturesFace != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          r.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (typeof e.dg3AdditionalIdentificationFeatureFingers != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          r.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (typeof e.dg4AdditionalIdentificationFeatureIrises != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          r.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (typeof e.dg5DisplayedPortrait != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          r.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (typeof e.dg7DisplayedSignatureOrUsualMark != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          r.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark);
        }
        if (e.dg8DataFeatures != null) {
          if (typeof e.dg8DataFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          r.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures);
        }
        if (e.dg9StructureFeatures != null) {
          if (typeof e.dg9StructureFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          r.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (typeof e.dg10SubstanceFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          r.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (typeof e.dg11AdditionalPersonalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          r.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (typeof e.dg12AdditionalDocumentDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          r.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails);
        }
        if (e.dg13OptionalDetails != null) {
          if (typeof e.dg13OptionalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          r.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails);
        }
        if (e.dg14SecurityOptions != null) {
          if (typeof e.dg14SecurityOptions != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          r.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (typeof e.dg15ActiveAuthenticationPublicKeyInfo != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          r.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo);
        }
        if (e.dg16PersonsToNotify != null) {
          if (typeof e.dg16PersonsToNotify != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          r.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.comHeaderAndDataGroupPresenceInformation = null, a.sodDocumentSecurityObject = null, a.dg1MachineReadableZoneInformation = null, a.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation") && (a.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, r)), e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject") && (a.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, r)), e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation") && (a.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, r)), e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace") && (a.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, r)), e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers") && (a.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, r), r.oneofs && (a._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises") && (a.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, r), r.oneofs && (a._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait") && (a.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, r), r.oneofs && (a._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark") && (a.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, r), r.oneofs && (a._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures") && (a.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, r), r.oneofs && (a._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures") && (a.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, r), r.oneofs && (a._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures") && (a.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, r), r.oneofs && (a._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails") && (a.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, r), r.oneofs && (a._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails") && (a.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, r), r.oneofs && (a._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails") && (a.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, r), r.oneofs && (a._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions") && (a.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, r), r.oneofs && (a._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo") && (a.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, r), r.oneofs && (a._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify") && (a.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, r), r.oneofs && (a._dg16PersonsToNotify = "dg16PersonsToNotify")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, n;
    }(), u.Lds1ElementaryFile = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.id = 0, n.prototype.bytes = null;
      let t;
      return Object.defineProperty(n.prototype, "_bytes", {
        get: p.oneOfGetter(t = ["bytes"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.Lds1ElementaryFile();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.id = e.int32();
              break;
            }
            case 2: {
              c.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
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
        return e.bytes != null && e.hasOwnProperty("bytes") && !(e.bytes && typeof e.bytes.length == "number" || p.isString(e.bytes)) ? "bytes: buffer expected" : null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.Lds1ElementaryFile)
          return e;
        let r = new s.dot.v4.Lds1ElementaryFile();
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
        return e.bytes != null && (typeof e.bytes == "string" ? p.base64.decode(e.bytes, r.bytes = p.newBuffer(p.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (r.bytes = e.bytes)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.id = r.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (a.id = r.enums === String ? s.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : s.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (a.bytes = r.bytes === String ? p.base64.encode(e.bytes, 0, e.bytes.length) : r.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, r.oneofs && (a._bytes = "bytes")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, n.Id = function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "ID_UNSPECIFIED"] = 0, r[e[1] = "ID_COM"] = 1, r[e[2] = "ID_SOD"] = 2, r[e[3] = "ID_DG1"] = 3, r[e[4] = "ID_DG2"] = 4, r[e[5] = "ID_DG3"] = 5, r[e[6] = "ID_DG4"] = 6, r[e[7] = "ID_DG5"] = 7, r[e[8] = "ID_DG7"] = 8, r[e[9] = "ID_DG8"] = 9, r[e[10] = "ID_DG9"] = 10, r[e[11] = "ID_DG10"] = 11, r[e[12] = "ID_DG11"] = 12, r[e[13] = "ID_DG12"] = 13, r[e[14] = "ID_DG13"] = 14, r[e[15] = "ID_DG14"] = 15, r[e[16] = "ID_DG15"] = 16, r[e[17] = "ID_DG16"] = 17, r;
      }(), n;
    }(), u.AccessControlProtocol = function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[n[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[n[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), u.AuthenticationStatus = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.data = null, n.prototype.chip = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && s.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && s.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.AuthenticationStatus();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.data = s.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.chip = s.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.data != null && t.hasOwnProperty("data")) {
          let e = s.dot.v4.DataAuthenticationStatus.verify(t.data);
          if (e)
            return "data." + e;
        }
        if (t.chip != null && t.hasOwnProperty("chip")) {
          let e = s.dot.v4.ChipAuthenticationStatus.verify(t.chip);
          if (e)
            return "chip." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.AuthenticationStatus)
          return t;
        let e = new s.dot.v4.AuthenticationStatus();
        if (t.data != null) {
          if (typeof t.data != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.data: object expected");
          e.data = s.dot.v4.DataAuthenticationStatus.fromObject(t.data);
        }
        if (t.chip != null) {
          if (typeof t.chip != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.chip: object expected");
          e.chip = s.dot.v4.ChipAuthenticationStatus.fromObject(t.chip);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.data = null, r.chip = null), t.data != null && t.hasOwnProperty("data") && (r.data = s.dot.v4.DataAuthenticationStatus.toObject(t.data, e)), t.chip != null && t.hasOwnProperty("chip") && (r.chip = s.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, n;
    }(), u.DataAuthenticationStatus = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.status = 0, n.prototype.protocol = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.DataAuthenticationStatus();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.status = t.int32();
              break;
            }
            case 2: {
              d.protocol = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
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
        if (t instanceof s.dot.v4.DataAuthenticationStatus)
          return t;
        let e = new s.dot.v4.DataAuthenticationStatus();
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
        return e.defaults && (r.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, r.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && t.hasOwnProperty("status") && (r.status = e.enums === String ? s.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : s.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && t.hasOwnProperty("protocol") && (r.protocol = e.enums === String ? s.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : s.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, n.Status = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      }(), n.Protocol = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      }(), n;
    }(), u.ChipAuthenticationStatus = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.status = 0, n.prototype.protocol = null, n.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(n.prototype, "_protocol", {
        get: p.oneOfGetter(t = ["protocol"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_activeAuthenticationResponse", {
        get: p.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && r.uint32(
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
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.status = e.int32();
              break;
            }
            case 2: {
              c.protocol = e.int32();
              break;
            }
            case 3: {
              c.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
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
        return e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || p.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.ChipAuthenticationStatus)
          return e;
        let r = new s.dot.v4.ChipAuthenticationStatus();
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
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? p.base64.decode(e.activeAuthenticationResponse, r.activeAuthenticationResponse = p.newBuffer(p.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (r.activeAuthenticationResponse = e.activeAuthenticationResponse)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.status = r.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (a.status = r.enums === String ? s.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : s.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (a.protocol = r.enums === String ? s.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : s.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, r.oneofs && (a._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (a.activeAuthenticationResponse = r.bytes === String ? p.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : r.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, r.oneofs && (a._activeAuthenticationResponse = "activeAuthenticationResponse")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, n.Status = function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "STATUS_UNSPECIFIED"] = 0, r[e[1] = "STATUS_AUTHENTICATED"] = 1, r[e[2] = "STATUS_DENIED"] = 2, r[e[3] = "STATUS_NOT_SUPPORTED"] = 3, r;
      }(), n.Protocol = function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, r[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, r[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, r[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, r;
      }(), n;
    }(), u.EyeGazeLivenessContent = function() {
      function n(e) {
        if (this.segments = [], e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.image = null, n.prototype.segments = p.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_image", {
        get: p.oneOfGetter(t = ["image"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = N.create()), e.segments != null && e.segments.length)
          for (let a = 0; a < e.segments.length; ++a)
            s.dot.v4.EyeGazeLivenessSegment.encode(e.segments[a], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 3: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              c.segments && c.segments.length || (c.segments = []), c.segments.push(s.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = s.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.segments != null && e.hasOwnProperty("segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let r = 0; r < e.segments.length; ++r) {
            let a = s.dot.v4.EyeGazeLivenessSegment.verify(e.segments[r]);
            if (a)
              return "segments." + a;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = s.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = s.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.EyeGazeLivenessContent)
          return e;
        let r = new s.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          r.image = s.dot.Image.fromObject(e.image);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          r.segments = [];
          for (let a = 0; a < e.segments.length; ++a) {
            if (typeof e.segments[a] != "object")
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            r.segments[a] = s.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[a]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.video: object expected");
          r.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          r.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        if ((r.arrays || r.defaults) && (a.segments = []), r.defaults && (a.metadata = null), e.segments && e.segments.length) {
          a.segments = [];
          for (let d = 0; d < e.segments.length; ++d)
            a.segments[d] = s.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[d], r);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = s.dot.v4.Metadata.toObject(e.metadata, r)), e.image != null && e.hasOwnProperty("image") && (a.image = s.dot.Image.toObject(e.image, r), r.oneofs && (a._image = "image")), e.video != null && e.hasOwnProperty("video") && (a.video = s.dot.Video.toObject(e.video, r), r.oneofs && (a._video = "video")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, n;
    }(), u.EyeGazeLivenessSegment = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.corner = 0, n.prototype.image = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e) {
        return e || (e = N.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r) {
        t instanceof O || (t = O.create(t));
        let a = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < a; ) {
          let c = t.uint32();
          if (c === r)
            break;
          switch (c >>> 3) {
            case 1: {
              d.corner = t.int32();
              break;
            }
            case 2: {
              d.image = s.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof O || (t = new O(t)), this.decode(t, t.uint32());
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
          let e = s.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, n.fromObject = function(t) {
        if (t instanceof s.dot.v4.EyeGazeLivenessSegment)
          return t;
        let e = new s.dot.v4.EyeGazeLivenessSegment();
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
          e.image = s.dot.Image.fromObject(t.image);
        }
        return e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.corner = e.enums === String ? "TOP_LEFT" : 0, r.image = null), t.corner != null && t.hasOwnProperty("corner") && (r.corner = e.enums === String ? s.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : s.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && t.hasOwnProperty("image") && (r.image = s.dot.Image.toObject(t.image, e)), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, n;
    }(), u.EyeGazeLivenessCorner = function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "TOP_LEFT"] = 0, t[n[1] = "TOP_RIGHT"] = 1, t[n[2] = "BOTTOM_RIGHT"] = 2, t[n[3] = "BOTTOM_LEFT"] = 3, t;
    }(), u.SmileLivenessContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.neutralExpressionFaceImage = null, n.prototype.smileExpressionFaceImage = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && s.dot.Image.encode(e.neutralExpressionFaceImage, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage") && s.dot.Image.encode(e.smileExpressionFaceImage, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.SmileLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.neutralExpressionFaceImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.smileExpressionFaceImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage")) {
          let r = s.dot.Image.verify(e.neutralExpressionFaceImage);
          if (r)
            return "neutralExpressionFaceImage." + r;
        }
        if (e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage")) {
          let r = s.dot.Image.verify(e.smileExpressionFaceImage);
          if (r)
            return "smileExpressionFaceImage." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = s.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = s.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.SmileLivenessContent)
          return e;
        let r = new s.dot.v4.SmileLivenessContent();
        if (e.neutralExpressionFaceImage != null) {
          if (typeof e.neutralExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          r.neutralExpressionFaceImage = s.dot.Image.fromObject(e.neutralExpressionFaceImage);
        }
        if (e.smileExpressionFaceImage != null) {
          if (typeof e.smileExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          r.smileExpressionFaceImage = s.dot.Image.fromObject(e.smileExpressionFaceImage);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.video: object expected");
          r.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          r.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.neutralExpressionFaceImage = null, a.smileExpressionFaceImage = null, a.metadata = null), e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage") && (a.neutralExpressionFaceImage = s.dot.Image.toObject(e.neutralExpressionFaceImage, r)), e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage") && (a.smileExpressionFaceImage = s.dot.Image.toObject(e.smileExpressionFaceImage, r)), e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = s.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (a.video = s.dot.Video.toObject(e.video, r), r.oneofs && (a._video = "video")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.SmileLivenessContent";
      }, n;
    }(), u.PalmContent = function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), a = 0; a < r.length; ++a)
            e[r[a]] != null && (this[r[a]] = e[r[a]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        return r || (r = N.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, a) {
        e instanceof O || (e = O.create(e));
        let d = r === void 0 ? e.len : e.pos + r, c = new s.dot.v4.PalmContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === a)
            break;
          switch (w >>> 3) {
            case 1: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, n.decodeDelimited = function(e) {
        return e instanceof O || (e = new O(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let r = s.dot.Image.verify(e.image);
          if (r)
            return "image." + r;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let r = s.dot.Video.verify(e.video);
          if (r)
            return "video." + r;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let r = s.dot.v4.Metadata.verify(e.metadata);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(e) {
        if (e instanceof s.dot.v4.PalmContent)
          return e;
        let r = new s.dot.v4.PalmContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          r.image = s.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.PalmContent.video: object expected");
          r.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          r.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let a = {};
        return r.defaults && (a.image = null, a.metadata = null), e.image != null && e.hasOwnProperty("image") && (a.image = s.dot.Image.toObject(e.image, r)), e.metadata != null && e.hasOwnProperty("metadata") && (a.metadata = s.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (a.video = s.dot.Video.toObject(e.video, r), r.oneofs && (a._video = "video")), a;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, x.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PalmContent";
      }, n;
    }(), u;
  }(), h.Image = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.bytes = p.newBuffer([]), u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.Image();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || p.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.Image)
        return n;
      let t = new s.dot.Image();
      return n.bytes != null && (typeof n.bytes == "string" ? p.base64.decode(n.bytes, t.bytes = p.newBuffer(p.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Image";
    }, u;
  }(), h.ImageSize = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.width = 0, u.prototype.height = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.width != null && Object.hasOwnProperty.call(n, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.width), n.height != null && Object.hasOwnProperty.call(n, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.height), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.ImageSize();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.width = n.int32();
            break;
          }
          case 2: {
            a.height = n.int32();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.width != null && n.hasOwnProperty("width") && !p.isInteger(n.width) ? "width: integer expected" : n.height != null && n.hasOwnProperty("height") && !p.isInteger(n.height) ? "height: integer expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.ImageSize)
        return n;
      let t = new s.dot.ImageSize();
      return n.width != null && (t.width = n.width | 0), n.height != null && (t.height = n.height | 0), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), n.width != null && n.hasOwnProperty("width") && (e.width = n.width), n.height != null && n.hasOwnProperty("height") && (e.height = n.height), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.ImageSize";
    }, u;
  }(), h.Int32List = function() {
    function u(n) {
      if (this.items = [], n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.items = p.emptyArray, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      if (t || (t = N.create()), n.items != null && n.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < n.items.length; ++e)
          t.int32(n.items[e]);
        t.ldelim();
      }
      return t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.Int32List();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            if (a.items && a.items.length || (a.items = []), (d & 7) === 2) {
              let c = n.uint32() + n.pos;
              for (; n.pos < c; )
                a.items.push(n.int32());
            } else
              a.items.push(n.int32());
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      if (typeof n != "object" || n === null)
        return "object expected";
      if (n.items != null && n.hasOwnProperty("items")) {
        if (!Array.isArray(n.items))
          return "items: array expected";
        for (let t = 0; t < n.items.length; ++t)
          if (!p.isInteger(n.items[t]))
            return "items: integer[] expected";
      }
      return null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.Int32List)
        return n;
      let t = new s.dot.Int32List();
      if (n.items) {
        if (!Array.isArray(n.items))
          throw TypeError(".dot.Int32List.items: array expected");
        t.items = [];
        for (let e = 0; e < n.items.length; ++e)
          t.items[e] = n.items[e] | 0;
      }
      return t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), n.items && n.items.length) {
        e.items = [];
        for (let r = 0; r < n.items.length; ++r)
          e.items[r] = n.items[r];
      }
      return e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Int32List";
    }, u;
  }(), h.Platform = function() {
    const u = {}, n = Object.create(u);
    return n[u[0] = "WEB"] = 0, n[u[1] = "ANDROID"] = 1, n[u[2] = "IOS"] = 2, n;
  }(), h.RectangleDouble = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.left = 0, u.prototype.top = 0, u.prototype.right = 0, u.prototype.bottom = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.left != null && Object.hasOwnProperty.call(n, "left") && t.uint32(
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
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.RectangleDouble();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.left = n.double();
            break;
          }
          case 2: {
            a.top = n.double();
            break;
          }
          case 3: {
            a.right = n.double();
            break;
          }
          case 4: {
            a.bottom = n.double();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.left != null && n.hasOwnProperty("left") && typeof n.left != "number" ? "left: number expected" : n.top != null && n.hasOwnProperty("top") && typeof n.top != "number" ? "top: number expected" : n.right != null && n.hasOwnProperty("right") && typeof n.right != "number" ? "right: number expected" : n.bottom != null && n.hasOwnProperty("bottom") && typeof n.bottom != "number" ? "bottom: number expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.RectangleDouble)
        return n;
      let t = new s.dot.RectangleDouble();
      return n.left != null && (t.left = Number(n.left)), n.top != null && (t.top = Number(n.top)), n.right != null && (t.right = Number(n.right)), n.bottom != null && (t.bottom = Number(n.bottom)), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), n.left != null && n.hasOwnProperty("left") && (e.left = t.json && !isFinite(n.left) ? String(n.left) : n.left), n.top != null && n.hasOwnProperty("top") && (e.top = t.json && !isFinite(n.top) ? String(n.top) : n.top), n.right != null && n.hasOwnProperty("right") && (e.right = t.json && !isFinite(n.right) ? String(n.right) : n.right), n.bottom != null && n.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(n.bottom) ? String(n.bottom) : n.bottom), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.RectangleDouble";
    }, u;
  }(), h.DigestWithTimestamp = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.digest = p.newBuffer([]), u.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.digest != null && Object.hasOwnProperty.call(n, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.digest), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(n.timestampMillis), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.DigestWithTimestamp();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.digest = n.bytes();
            break;
          }
          case 2: {
            a.timestampMillis = n.uint64();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.digest != null && n.hasOwnProperty("digest") && !(n.digest && typeof n.digest.length == "number" || p.isString(n.digest)) ? "digest: buffer expected" : n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && !p.isInteger(n.timestampMillis) && !(n.timestampMillis && p.isInteger(n.timestampMillis.low) && p.isInteger(n.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.DigestWithTimestamp)
        return n;
      let t = new s.dot.DigestWithTimestamp();
      return n.digest != null && (typeof n.digest == "string" ? p.base64.decode(n.digest, t.digest = p.newBuffer(p.base64.length(n.digest)), 0) : n.digest.length >= 0 && (t.digest = n.digest)), n.timestampMillis != null && (p.Long ? (t.timestampMillis = p.Long.fromValue(n.timestampMillis)).unsigned = !0 : typeof n.timestampMillis == "string" ? t.timestampMillis = parseInt(n.timestampMillis, 10) : typeof n.timestampMillis == "number" ? t.timestampMillis = n.timestampMillis : typeof n.timestampMillis == "object" && (t.timestampMillis = new p.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = p.newBuffer(e.digest))), p.Long) {
          let r = new p.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? r.toString() : t.longs === Number ? r.toNumber() : r;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return n.digest != null && n.hasOwnProperty("digest") && (e.digest = t.bytes === String ? p.base64.encode(n.digest, 0, n.digest.length) : t.bytes === Array ? Array.prototype.slice.call(n.digest) : n.digest), n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && (typeof n.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(n.timestampMillis) : n.timestampMillis : e.timestampMillis = t.longs === String ? p.Long.prototype.toString.call(n.timestampMillis) : t.longs === Number ? new p.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0) : n.timestampMillis), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.DigestWithTimestamp";
    }, u;
  }(), h.Video = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.bytes = p.newBuffer([]), u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.Video();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || p.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.Video)
        return n;
      let t = new s.dot.Video();
      return n.bytes != null && (typeof n.bytes == "string" ? p.base64.decode(n.bytes, t.bytes = p.newBuffer(p.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Video";
    }, u;
  }(), h.PointInt = function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.x = 0, u.prototype.y = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t) {
      return t || (t = N.create()), n.x != null && Object.hasOwnProperty.call(n, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.y), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e) {
      n instanceof O || (n = O.create(n));
      let r = t === void 0 ? n.len : n.pos + t, a = new s.dot.PointInt();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            a.x = n.int32();
            break;
          }
          case 2: {
            a.y = n.int32();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return a;
    }, u.decodeDelimited = function(n) {
      return n instanceof O || (n = new O(n)), this.decode(n, n.uint32());
    }, u.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.x != null && n.hasOwnProperty("x") && !p.isInteger(n.x) ? "x: integer expected" : n.y != null && n.hasOwnProperty("y") && !p.isInteger(n.y) ? "y: integer expected" : null;
    }, u.fromObject = function(n) {
      if (n instanceof s.dot.PointInt)
        return n;
      let t = new s.dot.PointInt();
      return n.x != null && (t.x = n.x | 0), n.y != null && (t.y = n.y | 0), t;
    }, u.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), n.x != null && n.hasOwnProperty("x") && (e.x = n.x), n.y != null && n.hasOwnProperty("y") && (e.y = n.y), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, x.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.PointInt";
    }, u;
  }(), h;
})();
var Xo = (() => {
  var h = import.meta.url;
  return async function(u = {}) {
    var n, t = u, e, r, a = new Promise((i, o) => {
      e = i, r = o;
    }), d = typeof window == "object", c = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var w = Object.assign({}, t), D = (i, o) => {
      throw o;
    }, v = "";
    function I(i) {
      return t.locateFile ? t.locateFile(i, v) : v + i;
    }
    var S, A;
    (d || c) && (c ? v = self.location.href : typeof document < "u" && document.currentScript && (v = document.currentScript.src), h && (v = h), v.startsWith("blob:") ? v = "" : v = v.slice(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1), c && (A = (i) => {
      var o = new XMLHttpRequest();
      return o.open("GET", i, !1), o.responseType = "arraybuffer", o.send(null), new Uint8Array(o.response);
    }), S = async (i) => {
      if (Qe(i))
        return new Promise((l, f) => {
          var m = new XMLHttpRequest();
          m.open("GET", i, !0), m.responseType = "arraybuffer", m.onload = () => {
            if (m.status == 200 || m.status == 0 && m.response) {
              l(m.response);
              return;
            }
            f(m.status);
          }, m.onerror = f, m.send(null);
        });
      var o = await fetch(i, { credentials: "same-origin" });
      if (o.ok)
        return o.arrayBuffer();
      throw new Error(o.status + " : " + o.url);
    }), t.print || console.log.bind(console);
    var R = t.printErr || console.error.bind(console);
    Object.assign(t, w), w = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var C = t.wasmBinary, F, M = !1, se, X, z, le, pe, Q, $, Ze, Ke, qe, Xe, Qe = (i) => i.startsWith("file://");
    function et() {
      var i = F.buffer;
      t.HEAP8 = X = new Int8Array(i), t.HEAP16 = le = new Int16Array(i), t.HEAPU8 = z = new Uint8Array(i), t.HEAPU16 = pe = new Uint16Array(i), t.HEAP32 = Q = new Int32Array(i), t.HEAPU32 = $ = new Uint32Array(i), t.HEAPF32 = Ze = new Float32Array(i), t.HEAPF64 = Xe = new Float64Array(i), t.HEAP64 = Ke = new BigInt64Array(i), t.HEAPU64 = qe = new BigUint64Array(i);
    }
    function $t() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          qt(t.preRun.shift());
      rt(ot);
    }
    function Nt() {
      _.C();
    }
    function Wt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Kt(t.postRun.shift());
      rt(nt);
    }
    var ie = 0, me = null;
    function Ut(i) {
      var o;
      ie++, (o = t.monitorRunDependencies) == null || o.call(t, ie);
    }
    function Vt(i) {
      var l;
      if (ie--, (l = t.monitorRunDependencies) == null || l.call(t, ie), ie == 0 && me) {
        var o = me;
        me = null, o();
      }
    }
    function be(i) {
      var l;
      (l = t.onAbort) == null || l.call(t, i), i = "Aborted(" + i + ")", R(i), M = !0, i += ". Build with -sASSERTIONS for more info.";
      var o = new WebAssembly.RuntimeError(i);
      throw r(o), o;
    }
    var Ee;
    function zt() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Gt(i) {
      if (i == Ee && C)
        return new Uint8Array(C);
      if (A)
        return A(i);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Bt(i) {
      if (!C)
        try {
          var o = await S(i);
          return new Uint8Array(o);
        } catch {
        }
      return Gt(i);
    }
    async function Ht(i, o) {
      try {
        var l = await Bt(i), f = await WebAssembly.instantiate(l, o);
        return f;
      } catch (m) {
        R(`failed to asynchronously prepare wasm: ${m}`), be(m);
      }
    }
    async function Yt(i, o, l) {
      if (!i && typeof WebAssembly.instantiateStreaming == "function" && !Qe(o))
        try {
          var f = fetch(o, { credentials: "same-origin" }), m = await WebAssembly.instantiateStreaming(f, l);
          return m;
        } catch (g) {
          R(`wasm streaming compile failed: ${g}`), R("falling back to ArrayBuffer instantiation");
        }
      return Ht(o, l);
    }
    function Jt() {
      return { a: wn };
    }
    async function Zt() {
      function i(g, b) {
        return _ = g.exports, _ = j.instrumentWasmExports(_), F = _.B, et(), _.H, Vt(), _;
      }
      Ut();
      function o(g) {
        return i(g.instance);
      }
      var l = Jt();
      if (t.instantiateWasm)
        return new Promise((g, b) => {
          t.instantiateWasm(l, (y, P) => {
            i(y), g(y.exports);
          });
        });
      Ee ?? (Ee = zt());
      try {
        var f = await Yt(C, Ee, l), m = o(f);
        return m;
      } catch (g) {
        return r(g), Promise.reject(g);
      }
    }
    class tt {
      constructor(o) {
        kt(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${o})`, this.status = o;
      }
    }
    var rt = (i) => {
      for (; i.length > 0; )
        i.shift()(t);
    }, nt = [], Kt = (i) => nt.unshift(i), ot = [], qt = (i) => ot.unshift(i), it = t.noExitRuntime || !0;
    class Xt {
      constructor(o) {
        this.excPtr = o, this.ptr = o - 24;
      }
      set_type(o) {
        $[this.ptr + 4 >> 2] = o;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(o) {
        $[this.ptr + 8 >> 2] = o;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(o) {
        o = o ? 1 : 0, X[this.ptr + 12] = o;
      }
      get_caught() {
        return X[this.ptr + 12] != 0;
      }
      set_rethrown(o) {
        o = o ? 1 : 0, X[this.ptr + 13] = o;
      }
      get_rethrown() {
        return X[this.ptr + 13] != 0;
      }
      init(o, l) {
        this.set_adjusted_ptr(0), this.set_type(o), this.set_destructor(l);
      }
      set_adjusted_ptr(o) {
        $[this.ptr + 16 >> 2] = o;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var at = 0, Qt = (i, o, l) => {
      var f = new Xt(i);
      throw f.init(o, l), at = i, at;
    }, er = () => be(""), Oe = (i) => {
      if (i === null)
        return "null";
      var o = typeof i;
      return o === "object" || o === "array" || o === "function" ? i.toString() : "" + i;
    }, tr = () => {
      for (var i = new Array(256), o = 0; o < 256; ++o)
        i[o] = String.fromCharCode(o);
      st = i;
    }, st, W = (i) => {
      for (var o = "", l = i; z[l]; )
        o += st[z[l++]];
      return o;
    }, ce = {}, ae = {}, we = {}, ue, E = (i) => {
      throw new ue(i);
    }, lt, Pe = (i) => {
      throw new lt(i);
    }, de = (i, o, l) => {
      i.forEach((y) => we[y] = o);
      function f(y) {
        var P = l(y);
        P.length !== i.length && Pe("Mismatched type converter count");
        for (var k = 0; k < i.length; ++k)
          B(i[k], P[k]);
      }
      var m = new Array(o.length), g = [], b = 0;
      o.forEach((y, P) => {
        ae.hasOwnProperty(y) ? m[P] = ae[y] : (g.push(y), ce.hasOwnProperty(y) || (ce[y] = []), ce[y].push(() => {
          m[P] = ae[y], ++b, b === g.length && f(m);
        }));
      }), g.length === 0 && f(m);
    };
    function rr(i, o, l = {}) {
      var f = o.name;
      if (i || E(`type "${f}" must have a positive integer typeid pointer`), ae.hasOwnProperty(i)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        E(`Cannot register type '${f}' twice`);
      }
      if (ae[i] = o, delete we[i], ce.hasOwnProperty(i)) {
        var m = ce[i];
        delete ce[i], m.forEach((g) => g());
      }
    }
    function B(i, o, l = {}) {
      return rr(i, o, l);
    }
    var ct = (i, o, l) => {
      switch (o) {
        case 1:
          return l ? (f) => X[f] : (f) => z[f];
        case 2:
          return l ? (f) => le[f >> 1] : (f) => pe[f >> 1];
        case 4:
          return l ? (f) => Q[f >> 2] : (f) => $[f >> 2];
        case 8:
          return l ? (f) => Ke[f >> 3] : (f) => qe[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${o}): ${i}`);
      }
    }, nr = (i, o, l, f, m) => {
      o = W(o);
      var g = o.indexOf("u") != -1;
      B(i, { name: o, fromWireType: (b) => b, toWireType: function(b, y) {
        if (typeof y != "bigint" && typeof y != "number")
          throw new TypeError(`Cannot convert "${Oe(y)}" to ${this.name}`);
        return typeof y == "number" && (y = BigInt(y)), y;
      }, argPackAdvance: Y, readValueFromPointer: ct(o, l, !g), destructorFunction: null });
    }, Y = 8, or = (i, o, l, f) => {
      o = W(o), B(i, { name: o, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, g) {
        return g ? l : f;
      }, argPackAdvance: Y, readValueFromPointer: function(m) {
        return this.fromWireType(z[m]);
      }, destructorFunction: null });
    }, ir = (i) => ({ count: i.count, deleteScheduled: i.deleteScheduled, preservePointerOnDelete: i.preservePointerOnDelete, ptr: i.ptr, ptrType: i.ptrType, smartPtr: i.smartPtr, smartPtrType: i.smartPtrType }), Fe = (i) => {
      function o(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      E(o(i) + " instance already deleted");
    }, Re = !1, ut = (i) => {
    }, ar = (i) => {
      i.smartPtr ? i.smartPtrType.rawDestructor(i.smartPtr) : i.ptrType.registeredClass.rawDestructor(i.ptr);
    }, dt = (i) => {
      i.count.value -= 1;
      var o = i.count.value === 0;
      o && ar(i);
    }, ft = (i, o, l) => {
      if (o === l)
        return i;
      if (l.baseClass === void 0)
        return null;
      var f = ft(i, o, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, pt = {}, sr = {}, lr = (i, o) => {
      for (o === void 0 && E("ptr should not be undefined"); i.baseClass; )
        o = i.upcast(o), i = i.baseClass;
      return o;
    }, cr = (i, o) => (o = lr(i, o), sr[o]), Ce = (i, o) => {
      (!o.ptrType || !o.ptr) && Pe("makeClassHandle requires ptr and ptrType");
      var l = !!o.smartPtrType, f = !!o.smartPtr;
      return l !== f && Pe("Both smartPtrType and smartPtr must be specified"), o.count = { value: 1 }, ye(Object.create(i, { $$: { value: o, writable: !0 } }));
    };
    function ur(i) {
      var o = this.getPointee(i);
      if (!o)
        return this.destructor(i), null;
      var l = cr(this.registeredClass, o);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = o, l.$$.smartPtr = i, l.clone();
        var f = l.clone();
        return this.destructor(i), f;
      }
      function m() {
        return this.isSmartPointer ? Ce(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: o, smartPtrType: this, smartPtr: i }) : Ce(this.registeredClass.instancePrototype, { ptrType: this, ptr: i });
      }
      var g = this.registeredClass.getActualType(o), b = pt[g];
      if (!b)
        return m.call(this);
      var y;
      this.isConst ? y = b.constPointerType : y = b.pointerType;
      var P = ft(o, this.registeredClass, y.registeredClass);
      return P === null ? m.call(this) : this.isSmartPointer ? Ce(y.registeredClass.instancePrototype, { ptrType: y, ptr: P, smartPtrType: this, smartPtr: i }) : Ce(y.registeredClass.instancePrototype, { ptrType: y, ptr: P });
    }
    var ye = (i) => typeof FinalizationRegistry > "u" ? (ye = (o) => o, i) : (Re = new FinalizationRegistry((o) => {
      dt(o.$$);
    }), ye = (o) => {
      var l = o.$$, f = !!l.smartPtr;
      if (f) {
        var m = { $$: l };
        Re.register(o, m, o);
      }
      return o;
    }, ut = (o) => Re.unregister(o), ye(i)), dr = () => {
      Object.assign(Ie.prototype, { isAliasOf(i) {
        if (!(this instanceof Ie) || !(i instanceof Ie))
          return !1;
        var o = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        i.$$ = i.$$;
        for (var f = i.$$.ptrType.registeredClass, m = i.$$.ptr; o.baseClass; )
          l = o.upcast(l), o = o.baseClass;
        for (; f.baseClass; )
          m = f.upcast(m), f = f.baseClass;
        return o === f && l === m;
      }, clone() {
        if (this.$$.ptr || Fe(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var i = ye(Object.create(Object.getPrototypeOf(this), { $$: { value: ir(this.$$) } }));
        return i.$$.count.value += 1, i.$$.deleteScheduled = !1, i;
      }, delete() {
        this.$$.ptr || Fe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), ut(this), dt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Fe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ie() {
    }
    var je = (i, o) => Object.defineProperty(o, "name", { value: i }), fr = (i, o, l) => {
      if (i[o].overloadTable === void 0) {
        var f = i[o];
        i[o] = function(...m) {
          return i[o].overloadTable.hasOwnProperty(m.length) || E(`Function '${l}' called with an invalid number of arguments (${m.length}) - expects one of (${i[o].overloadTable})!`), i[o].overloadTable[m.length].apply(this, m);
        }, i[o].overloadTable = [], i[o].overloadTable[f.argCount] = f;
      }
    }, Le = (i, o, l) => {
      t.hasOwnProperty(i) ? ((l === void 0 || t[i].overloadTable !== void 0 && t[i].overloadTable[l] !== void 0) && E(`Cannot register public name '${i}' twice`), fr(t, i, i), t[i].overloadTable.hasOwnProperty(l) && E(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[i].overloadTable[l] = o) : (t[i] = o, t[i].argCount = l);
    }, pr = 48, mr = 57, yr = (i) => {
      i = i.replace(/[^a-zA-Z0-9_]/g, "$");
      var o = i.charCodeAt(0);
      return o >= pr && o <= mr ? `_${i}` : i;
    };
    function hr(i, o, l, f, m, g, b, y) {
      this.name = i, this.constructor = o, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = m, this.getActualType = g, this.upcast = b, this.downcast = y, this.pureVirtualFunctions = [];
    }
    var Se = (i, o, l) => {
      for (; o !== l; )
        o.upcast || E(`Expected null or instance of ${l.name}, got an instance of ${o.name}`), i = o.upcast(i), o = o.baseClass;
      return i;
    };
    function gr(i, o) {
      if (o === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      o.$$ || E(`Cannot pass "${Oe(o)}" as a ${this.name}`), o.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Se(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function vr(i, o) {
      var l;
      if (o === null)
        return this.isReference && E(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), i !== null && i.push(this.rawDestructor, l), l) : 0;
      (!o || !o.$$) && E(`Cannot pass "${Oe(o)}" as a ${this.name}`), o.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && o.$$.ptrType.isConst && E(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
      var f = o.$$.ptrType.registeredClass;
      if (l = Se(o.$$.ptr, f, this.registeredClass), this.isSmartPointer)
        switch (o.$$.smartPtr === void 0 && E("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            o.$$.smartPtrType === this ? l = o.$$.smartPtr : E(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            l = o.$$.smartPtr;
            break;
          case 2:
            if (o.$$.smartPtrType === this)
              l = o.$$.smartPtr;
            else {
              var m = o.clone();
              l = this.rawShare(l, H.toHandle(() => m.delete())), i !== null && i.push(this.rawDestructor, l);
            }
            break;
          default:
            E("Unsupporting sharing policy");
        }
      return l;
    }
    function br(i, o) {
      if (o === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      o.$$ || E(`Cannot pass "${Oe(o)}" as a ${this.name}`), o.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), o.$$.ptrType.isConst && E(`Cannot convert argument of type ${o.$$.ptrType.name} to parameter type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Se(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Te(i) {
      return this.fromWireType($[i >> 2]);
    }
    var Or = () => {
      Object.assign(Ae.prototype, { getPointee(i) {
        return this.rawGetPointee && (i = this.rawGetPointee(i)), i;
      }, destructor(i) {
        var o;
        (o = this.rawDestructor) == null || o.call(this, i);
      }, argPackAdvance: Y, readValueFromPointer: Te, fromWireType: ur });
    };
    function Ae(i, o, l, f, m, g, b, y, P, k, T) {
      this.name = i, this.registeredClass = o, this.isReference = l, this.isConst = f, this.isSmartPointer = m, this.pointeeType = g, this.sharingPolicy = b, this.rawGetPointee = y, this.rawConstructor = P, this.rawShare = k, this.rawDestructor = T, !m && o.baseClass === void 0 ? f ? (this.toWireType = gr, this.destructorFunction = null) : (this.toWireType = br, this.destructorFunction = null) : this.toWireType = vr;
    }
    var mt = (i, o, l) => {
      t.hasOwnProperty(i) || Pe("Replacing nonexistent public symbol"), t[i].overloadTable !== void 0 && l !== void 0 ? t[i].overloadTable[l] = o : (t[i] = o, t[i].argCount = l);
    }, wr = (i, o, l) => {
      i = i.replace(/p/g, "i");
      var f = t["dynCall_" + i];
      return f(o, ...l);
    }, Pr = (i, o, l = []) => {
      var f = wr(i, o, l);
      return f;
    }, Cr = (i, o) => (...l) => Pr(i, o, l), ee = (i, o) => {
      i = W(i);
      function l() {
        return Cr(i, o);
      }
      var f = l();
      return typeof f != "function" && E(`unknown function pointer with signature ${i}: ${o}`), f;
    }, Ir = (i, o) => {
      var l = je(o, function(f) {
        this.name = o, this.message = f;
        var m = new Error(f).stack;
        m !== void 0 && (this.stack = this.toString() + `
` + m.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(i.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, yt, ht = (i) => {
      var o = Pn(i), l = W(o);
      return q(o), l;
    }, he = (i, o) => {
      var l = [], f = {};
      function m(g) {
        if (!f[g] && !ae[g]) {
          if (we[g]) {
            we[g].forEach(m);
            return;
          }
          l.push(g), f[g] = !0;
        }
      }
      throw o.forEach(m), new yt(`${i}: ` + l.map(ht).join([", "]));
    }, jr = (i, o, l, f, m, g, b, y, P, k, T, L, U) => {
      T = W(T), g = ee(m, g), y && (y = ee(b, y)), k && (k = ee(P, k)), U = ee(L, U);
      var J = yr(T);
      Le(J, function() {
        he(`Cannot construct ${T} due to unbound types`, [f]);
      }), de([i, o, l], f ? [f] : [], (Z) => {
        var At;
        Z = Z[0];
        var re, G;
        f ? (re = Z.registeredClass, G = re.instancePrototype) : G = Ie.prototype;
        var K = je(T, function(...Ve) {
          if (Object.getPrototypeOf(this) !== ne)
            throw new ue("Use 'new' to construct " + T);
          if (V.constructor_body === void 0)
            throw new ue(T + " has no accessible constructor");
          var Dt = V.constructor_body[Ve.length];
          if (Dt === void 0)
            throw new ue(`Tried to invoke ctor of ${T} with invalid number of parameters (${Ve.length}) - expected (${Object.keys(V.constructor_body).toString()}) parameters instead!`);
          return Dt.apply(this, Ve);
        }), ne = Object.create(G, { constructor: { value: K } });
        K.prototype = ne;
        var V = new hr(T, K, ne, U, re, g, y, k);
        V.baseClass && ((At = V.baseClass).__derivedClasses ?? (At.__derivedClasses = []), V.baseClass.__derivedClasses.push(V));
        var oe = new Ae(T, V, !0, !1, !1), ke = new Ae(T + "*", V, !1, !1, !1), Tt = new Ae(T + " const*", V, !1, !0, !1);
        return pt[i] = { pointerType: ke, constPointerType: Tt }, mt(J, K), [oe, ke, Tt];
      });
    }, gt = (i, o) => {
      for (var l = [], f = 0; f < i; f++)
        l.push($[o + f * 4 >> 2]);
      return l;
    }, Me = (i) => {
      for (; i.length; ) {
        var o = i.pop(), l = i.pop();
        l(o);
      }
    };
    function Sr(i) {
      for (var o = 1; o < i.length; ++o)
        if (i[o] !== null && i[o].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var De = (i) => {
      try {
        return i();
      } catch (o) {
        be(o);
      }
    }, vt = (i) => {
      if (i instanceof tt || i == "unwind")
        return se;
      D(1, i);
    }, bt = 0, Ot = () => it || bt > 0, wt = (i) => {
      var o;
      se = i, Ot() || ((o = t.onExit) == null || o.call(t, i), M = !0), D(i, new tt(i));
    }, Tr = (i, o) => {
      se = i, wt(i);
    }, Ar = Tr, Dr = () => {
      if (!Ot())
        try {
          Ar(se);
        } catch (i) {
          vt(i);
        }
    }, Pt = (i) => {
      if (!M)
        try {
          i(), Dr();
        } catch (o) {
          vt(o);
        }
    }, j = { instrumentWasmImports(i) {
      var o = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(i))
        typeof f == "function" && (f.isAsync || o.test(l));
    }, instrumentWasmExports(i) {
      var o = {};
      for (let [l, f] of Object.entries(i))
        typeof f == "function" ? o[l] = (...m) => {
          j.exportCallStack.push(l);
          try {
            return f(...m);
          } finally {
            M || (j.exportCallStack.pop(), j.maybeStopUnwind());
          }
        } : o[l] = f;
      return o;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(i) {
      var o = j.callStackNameToId[i];
      return o === void 0 && (o = j.callStackId++, j.callStackNameToId[i] = o, j.callStackIdToName[o] = i), o;
    }, maybeStopUnwind() {
      j.currData && j.state === j.State.Unwinding && j.exportCallStack.length === 0 && (j.state = j.State.Normal, De(jn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((i, o) => {
        j.asyncPromiseHandlers = { resolve: i, reject: o };
      });
    }, allocateData() {
      var i = We(12 + j.StackSize);
      return j.setDataHeader(i, i + 12, j.StackSize), j.setDataRewindFunc(i), i;
    }, setDataHeader(i, o, l) {
      $[i >> 2] = o, $[i + 4 >> 2] = o + l;
    }, setDataRewindFunc(i) {
      var o = j.exportCallStack[0], l = j.getCallStackId(o);
      Q[i + 8 >> 2] = l;
    }, getDataRewindFuncName(i) {
      var o = Q[i + 8 >> 2], l = j.callStackIdToName[o];
      return l;
    }, getDataRewindFunc(i) {
      var o = _[i];
      return o;
    }, doRewind(i) {
      var o = j.getDataRewindFuncName(i), l = j.getDataRewindFunc(o);
      return l();
    }, handleSleep(i) {
      if (!M) {
        if (j.state === j.State.Normal) {
          var o = !1, l = !1;
          i((f = 0) => {
            if (!M && (j.handleSleepReturnValue = f, o = !0, !!l)) {
              j.state = j.State.Rewinding, De(() => Sn(j.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var m, g = !1;
              try {
                m = j.doRewind(j.currData);
              } catch (P) {
                m = P, g = !0;
              }
              var b = !1;
              if (!j.currData) {
                var y = j.asyncPromiseHandlers;
                y && (j.asyncPromiseHandlers = null, (g ? y.reject : y.resolve)(m), b = !0);
              }
              if (g && !b)
                throw m;
            }
          }), l = !0, o || (j.state = j.State.Unwinding, j.currData = j.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), De(() => In(j.currData)));
        } else j.state === j.State.Rewinding ? (j.state = j.State.Normal, De(Tn), q(j.currData), j.currData = null, j.sleepCallbacks.forEach(Pt)) : be(`invalid state: ${j.state}`);
        return j.handleSleepReturnValue;
      }
    }, handleAsync(i) {
      return j.handleSleep((o) => {
        i().then(o);
      });
    } };
    function Ct(i, o, l, f, m, g) {
      var b = o.length;
      b < 2 && E("argTypes array size mismatch! Must at least get return value and 'this' types!"), o[1];
      var y = Sr(o), P = o[0].name !== "void", k = b - 2, T = new Array(k), L = [], U = [], J = function(...Z) {
        U.length = 0;
        var re;
        L.length = 1, L[0] = m;
        for (var G = 0; G < k; ++G)
          T[G] = o[G + 2].toWireType(U, Z[G]), L.push(T[G]);
        var K = f(...L);
        function ne(V) {
          if (y)
            Me(U);
          else
            for (var oe = 2; oe < o.length; oe++) {
              var ke = oe === 1 ? re : T[oe - 2];
              o[oe].destructorFunction !== null && o[oe].destructorFunction(ke);
            }
          if (P)
            return o[0].fromWireType(V);
        }
        return j.currData ? j.whenDone().then(ne) : ne(K);
      };
      return je(i, J);
    }
    var kr = (i, o, l, f, m, g) => {
      var b = gt(o, l);
      m = ee(f, m), de([], [i], (y) => {
        y = y[0];
        var P = `constructor ${y.name}`;
        if (y.registeredClass.constructor_body === void 0 && (y.registeredClass.constructor_body = []), y.registeredClass.constructor_body[o - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${o - 1}) for class '${y.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return y.registeredClass.constructor_body[o - 1] = () => {
          he(`Cannot construct ${y.name} due to unbound types`, b);
        }, de([], b, (k) => (k.splice(1, 0, null), y.registeredClass.constructor_body[o - 1] = Ct(P, k, null, m, g), [])), [];
      });
    }, It = (i, o, l) => (i instanceof Object || E(`${l} with invalid "this": ${i}`), i instanceof o.registeredClass.constructor || E(`${l} incompatible with "this" of type ${i.constructor.name}`), i.$$.ptr || E(`cannot call emscripten binding method ${l} on deleted object`), Se(i.$$.ptr, i.$$.ptrType.registeredClass, o.registeredClass)), _r = (i, o, l, f, m, g, b, y, P, k) => {
      o = W(o), m = ee(f, m), de([], [i], (T) => {
        T = T[0];
        var L = `${T.name}.${o}`, U = { get() {
          he(`Cannot access ${L} due to unbound types`, [l, b]);
        }, enumerable: !0, configurable: !0 };
        return P ? U.set = () => he(`Cannot access ${L} due to unbound types`, [l, b]) : U.set = (J) => E(L + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, o, U), de([], P ? [l, b] : [l], (J) => {
          var Z = J[0], re = { get() {
            var K = It(this, T, L + " getter");
            return Z.fromWireType(m(g, K));
          }, enumerable: !0 };
          if (P) {
            P = ee(y, P);
            var G = J[1];
            re.set = function(K) {
              var ne = It(this, T, L + " setter"), V = [];
              P(k, ne, G.toWireType(V, K)), Me(V);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, o, re), [];
        }), [];
      });
    }, xe = [], te = [], $e = (i) => {
      i > 9 && --te[i + 1] === 0 && (te[i] = void 0, xe.push(i));
    }, Er = () => te.length / 2 - 5 - xe.length, Fr = () => {
      te.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Er;
    }, H = { toValue: (i) => (i || E("Cannot use deleted val. handle = " + i), te[i]), toHandle: (i) => {
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
          const o = xe.pop() || te.length;
          return te[o] = i, te[o + 1] = 1, o;
        }
      }
    } }, Rr = { name: "emscripten::val", fromWireType: (i) => {
      var o = H.toValue(i);
      return $e(i), o;
    }, toWireType: (i, o) => H.toHandle(o), argPackAdvance: Y, readValueFromPointer: Te, destructorFunction: null }, Lr = (i) => B(i, Rr), Mr = (i, o, l) => {
      switch (o) {
        case 1:
          return l ? function(f) {
            return this.fromWireType(X[f]);
          } : function(f) {
            return this.fromWireType(z[f]);
          };
        case 2:
          return l ? function(f) {
            return this.fromWireType(le[f >> 1]);
          } : function(f) {
            return this.fromWireType(pe[f >> 1]);
          };
        case 4:
          return l ? function(f) {
            return this.fromWireType(Q[f >> 2]);
          } : function(f) {
            return this.fromWireType($[f >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${o}): ${i}`);
      }
    }, xr = (i, o, l, f) => {
      o = W(o);
      function m() {
      }
      m.values = {}, B(i, { name: o, constructor: m, fromWireType: function(g) {
        return this.constructor.values[g];
      }, toWireType: (g, b) => b.value, argPackAdvance: Y, readValueFromPointer: Mr(o, l, f), destructorFunction: null }), Le(o, m);
    }, Ne = (i, o) => {
      var l = ae[i];
      return l === void 0 && E(`${o} has unknown type ${ht(i)}`), l;
    }, $r = (i, o, l) => {
      var f = Ne(i, "enum");
      o = W(o);
      var m = f.constructor, g = Object.create(f.constructor.prototype, { value: { value: l }, constructor: { value: je(`${f.name}_${o}`, function() {
      }) } });
      m.values[l] = g, m[o] = g;
    }, Nr = (i, o) => {
      switch (o) {
        case 4:
          return function(l) {
            return this.fromWireType(Ze[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(Xe[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${o}): ${i}`);
      }
    }, Wr = (i, o, l) => {
      o = W(o), B(i, { name: o, fromWireType: (f) => f, toWireType: (f, m) => m, argPackAdvance: Y, readValueFromPointer: Nr(o, l), destructorFunction: null });
    }, Ur = (i) => {
      i = i.trim();
      const o = i.indexOf("(");
      return o === -1 ? i : i.slice(0, o);
    }, Vr = (i, o, l, f, m, g, b, y) => {
      var P = gt(o, l);
      i = W(i), i = Ur(i), m = ee(f, m), Le(i, function() {
        he(`Cannot call ${i} due to unbound types`, P);
      }, o - 1), de([], P, (k) => {
        var T = [k[0], null].concat(k.slice(1));
        return mt(i, Ct(i, T, null, m, g), o - 1), [];
      });
    }, zr = (i, o, l, f, m) => {
      o = W(o);
      var g = (T) => T;
      if (f === 0) {
        var b = 32 - 8 * l;
        g = (T) => T << b >>> b;
      }
      var y = o.includes("unsigned"), P = (T, L) => {
      }, k;
      y ? k = function(T, L) {
        return P(L, this.name), L >>> 0;
      } : k = function(T, L) {
        return P(L, this.name), L;
      }, B(i, { name: o, fromWireType: g, toWireType: k, argPackAdvance: Y, readValueFromPointer: ct(o, l, f !== 0), destructorFunction: null });
    }, Gr = (i, o, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], m = f[o];
      function g(b) {
        var y = $[b >> 2], P = $[b + 4 >> 2];
        return new m(X.buffer, P, y);
      }
      l = W(l), B(i, { name: l, fromWireType: g, argPackAdvance: Y, readValueFromPointer: g }, { ignoreDuplicateRegistrations: !0 });
    }, Br = (i, o, l, f) => {
      if (!(f > 0)) return 0;
      for (var m = l, g = l + f - 1, b = 0; b < i.length; ++b) {
        var y = i.charCodeAt(b);
        if (y >= 55296 && y <= 57343) {
          var P = i.charCodeAt(++b);
          y = 65536 + ((y & 1023) << 10) | P & 1023;
        }
        if (y <= 127) {
          if (l >= g) break;
          o[l++] = y;
        } else if (y <= 2047) {
          if (l + 1 >= g) break;
          o[l++] = 192 | y >> 6, o[l++] = 128 | y & 63;
        } else if (y <= 65535) {
          if (l + 2 >= g) break;
          o[l++] = 224 | y >> 12, o[l++] = 128 | y >> 6 & 63, o[l++] = 128 | y & 63;
        } else {
          if (l + 3 >= g) break;
          o[l++] = 240 | y >> 18, o[l++] = 128 | y >> 12 & 63, o[l++] = 128 | y >> 6 & 63, o[l++] = 128 | y & 63;
        }
      }
      return o[l] = 0, l - m;
    }, Hr = (i, o, l) => Br(i, z, o, l), Yr = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f <= 127 ? o++ : f <= 2047 ? o += 2 : f >= 55296 && f <= 57343 ? (o += 4, ++l) : o += 3;
      }
      return o;
    }, jt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Jr = (i, o = 0, l = NaN) => {
      for (var f = o + l, m = o; i[m] && !(m >= f); ) ++m;
      if (m - o > 16 && i.buffer && jt)
        return jt.decode(i.subarray(o, m));
      for (var g = ""; o < m; ) {
        var b = i[o++];
        if (!(b & 128)) {
          g += String.fromCharCode(b);
          continue;
        }
        var y = i[o++] & 63;
        if ((b & 224) == 192) {
          g += String.fromCharCode((b & 31) << 6 | y);
          continue;
        }
        var P = i[o++] & 63;
        if ((b & 240) == 224 ? b = (b & 15) << 12 | y << 6 | P : b = (b & 7) << 18 | y << 12 | P << 6 | i[o++] & 63, b < 65536)
          g += String.fromCharCode(b);
        else {
          var k = b - 65536;
          g += String.fromCharCode(55296 | k >> 10, 56320 | k & 1023);
        }
      }
      return g;
    }, Zr = (i, o) => i ? Jr(z, i, o) : "", Kr = (i, o) => {
      o = W(o), B(i, { name: o, fromWireType(l) {
        for (var f = $[l >> 2], m = l + 4, g, b, y = m, b = 0; b <= f; ++b) {
          var P = m + b;
          if (b == f || z[P] == 0) {
            var k = P - y, T = Zr(y, k);
            g === void 0 ? g = T : (g += "\0", g += T), y = P + 1;
          }
        }
        return q(l), g;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var m, g = typeof f == "string";
        g || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || E("Cannot pass non-string to std::string"), g ? m = Yr(f) : m = f.length;
        var b = We(4 + m + 1), y = b + 4;
        if ($[b >> 2] = m, g)
          Hr(f, y, m + 1);
        else if (g)
          for (var P = 0; P < m; ++P) {
            var k = f.charCodeAt(P);
            k > 255 && (q(b), E("String has UTF-16 code units that do not fit in 8 bits")), z[y + P] = k;
          }
        else
          for (var P = 0; P < m; ++P)
            z[y + P] = f[P];
        return l !== null && l.push(q, b), b;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(l) {
        q(l);
      } });
    }, St = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, qr = (i, o) => {
      for (var l = i, f = l >> 1, m = f + o / 2; !(f >= m) && pe[f]; ) ++f;
      if (l = f << 1, l - i > 32 && St) return St.decode(z.subarray(i, l));
      for (var g = "", b = 0; !(b >= o / 2); ++b) {
        var y = le[i + b * 2 >> 1];
        if (y == 0) break;
        g += String.fromCharCode(y);
      }
      return g;
    }, Xr = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 2) return 0;
      l -= 2;
      for (var f = o, m = l < i.length * 2 ? l / 2 : i.length, g = 0; g < m; ++g) {
        var b = i.charCodeAt(g);
        le[o >> 1] = b, o += 2;
      }
      return le[o >> 1] = 0, o - f;
    }, Qr = (i) => i.length * 2, en = (i, o) => {
      for (var l = 0, f = ""; !(l >= o / 4); ) {
        var m = Q[i + l * 4 >> 2];
        if (m == 0) break;
        if (++l, m >= 65536) {
          var g = m - 65536;
          f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023);
        } else
          f += String.fromCharCode(m);
      }
      return f;
    }, tn = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 4) return 0;
      for (var f = o, m = f + l - 4, g = 0; g < i.length; ++g) {
        var b = i.charCodeAt(g);
        if (b >= 55296 && b <= 57343) {
          var y = i.charCodeAt(++g);
          b = 65536 + ((b & 1023) << 10) | y & 1023;
        }
        if (Q[o >> 2] = b, o += 4, o + 4 > m) break;
      }
      return Q[o >> 2] = 0, o - f;
    }, rn = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, o += 4;
      }
      return o;
    }, nn = (i, o, l) => {
      l = W(l);
      var f, m, g, b;
      o === 2 ? (f = qr, m = Xr, b = Qr, g = (y) => pe[y >> 1]) : o === 4 && (f = en, m = tn, b = rn, g = (y) => $[y >> 2]), B(i, { name: l, fromWireType: (y) => {
        for (var P = $[y >> 2], k, T = y + 4, L = 0; L <= P; ++L) {
          var U = y + 4 + L * o;
          if (L == P || g(U) == 0) {
            var J = U - T, Z = f(T, J);
            k === void 0 ? k = Z : (k += "\0", k += Z), T = U + o;
          }
        }
        return q(y), k;
      }, toWireType: (y, P) => {
        typeof P != "string" && E(`Cannot pass non-string to C++ string type ${l}`);
        var k = b(P), T = We(4 + k + o);
        return $[T >> 2] = k / o, m(P, T + 4, k + o), y !== null && y.push(q, T), T;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(y) {
        q(y);
      } });
    }, on = (i, o) => {
      o = W(o), B(i, { isVoid: !0, name: o, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, an = () => {
      it = !1, bt = 0;
    }, sn = (i, o, l) => {
      var f = [], m = i.toWireType(f, l);
      return f.length && ($[o >> 2] = H.toHandle(f)), m;
    }, ln = (i, o, l) => (i = H.toValue(i), o = Ne(o, "emval::as"), sn(o, l, i)), cn = (i, o) => (i = H.toValue(i), o = H.toValue(o), H.toHandle(i[o])), un = {}, dn = (i) => {
      var o = un[i];
      return o === void 0 ? W(i) : o;
    }, fn = (i) => H.toHandle(dn(i)), pn = (i) => {
      var o = H.toValue(i);
      Me(o), $e(i);
    }, mn = (i, o) => {
      i = Ne(i, "_emval_take_value");
      var l = i.readValueFromPointer(o);
      return H.toHandle(l);
    }, ge = {}, yn = () => performance.now(), hn = (i, o) => {
      if (ge[i] && (clearTimeout(ge[i].id), delete ge[i]), !o) return 0;
      var l = setTimeout(() => {
        delete ge[i], Pt(() => Cn(i, yn()));
      }, o);
      return ge[i] = { id: l, timeout_ms: o }, 0;
    }, gn = () => 2147483648, vn = (i, o) => Math.ceil(i / o) * o, bn = (i) => {
      var o = F.buffer, l = (i - o.byteLength + 65535) / 65536 | 0;
      try {
        return F.grow(l), et(), 1;
      } catch {
      }
    }, On = (i) => {
      var o = z.length;
      i >>>= 0;
      var l = gn();
      if (i > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var m = o * (1 + 0.2 / f);
        m = Math.min(m, i + 100663296);
        var g = Math.min(l, vn(Math.max(i, m), 65536)), b = bn(g);
        if (b)
          return !0;
      }
      return !1;
    };
    tr(), ue = t.BindingError = class extends Error {
      constructor(o) {
        super(o), this.name = "BindingError";
      }
    }, lt = t.InternalError = class extends Error {
      constructor(o) {
        super(o), this.name = "InternalError";
      }
    }, dr(), Or(), yt = t.UnboundTypeError = Ir(Error, "UnboundTypeError"), Fr();
    var wn = { n: Qt, u: er, m: nr, x: or, f: jr, e: kr, a: _r, v: Lr, k: xr, g: $r, l: Wr, b: Vr, d: zr, c: Gr, w: Kr, h: nn, y: on, r: an, i: ln, z: $e, j: cn, p: fn, o: pn, A: mn, s: hn, t: On, q: wt }, _ = await Zt();
    _.C;
    var Pn = _.D, We = t._malloc = _.E, q = t._free = _.F, Cn = _.G;
    t.dynCall_v = _.I, t.dynCall_ii = _.J, t.dynCall_vi = _.K, t.dynCall_i = _.L, t.dynCall_iii = _.M, t.dynCall_viii = _.N, t.dynCall_fii = _.O, t.dynCall_viif = _.P, t.dynCall_viiii = _.Q, t.dynCall_viiiiii = _.R, t.dynCall_iiiiii = _.S, t.dynCall_viiiii = _.T, t.dynCall_iiiiiii = _.U, t.dynCall_iiiiiiii = _.V, t.dynCall_viiiiiii = _.W, t.dynCall_viiiiiiiiidi = _.X, t.dynCall_viiiiiiiidi = _.Y, t.dynCall_viiiiiiiiii = _.Z, t.dynCall_viiiiiiiii = _._, t.dynCall_viiiiiiii = _.$, t.dynCall_iiiii = _.aa, t.dynCall_iiii = _.ba;
    var In = _.ca, jn = _.da, Sn = _.ea, Tn = _.fa;
    function Ue() {
      if (ie > 0) {
        me = Ue;
        return;
      }
      if ($t(), ie > 0) {
        me = Ue;
        return;
      }
      function i() {
        var o;
        t.calledRun = !0, !M && (Nt(), e(t), (o = t.onRuntimeInitialized) == null || o.call(t), Wt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), i();
      }, 1)) : i();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return Ue(), n = a, n;
  };
})();
function Po(h, u) {
  return Math.sqrt((h.x - u.x) ** 2 + (h.y - u.y) ** 2);
}
function Qo(h, u) {
  return {
    x: (h.x + u.x) / 2,
    y: (h.y + u.y) / 2
  };
}
function ei(h, u) {
  if (h.confidence <= 0 || u.confidence <= 0)
    return { x: 0, y: 0 };
  const n = Po(h.center, u.center), t = Qo(h.center, u.center);
  return {
    x: t.x,
    y: t.y + n / 4
    // calculation is taken from mobile team
  };
}
function ti(h, u, n) {
  if (h.confidence <= 0 || u.confidence <= 0)
    return 0;
  const t = Po(h.center, u.center), e = Mo(n.width, n.height);
  return Lo(t / e);
}
function Wn(h) {
  const { centerX: u, centerY: n, confidence: t, size: e, status: r } = h;
  return {
    center: {
      x: u,
      y: n
    },
    confidence: t / 1e3,
    status: r / 1e3,
    size: e
  };
}
class ri extends Ro {
  getSamWasmFilePath(u, n) {
    return `${u}/face/wasm/${n}`;
  }
  fetchSamModule(u) {
    return Xo(u);
  }
  parseRawData(u, n) {
    const { brightness: t, sharpness: e } = u.params, { bottomRightX: r, bottomRightY: a, leftEye: d, mouth: c, rightEye: w, topLeftX: D, topLeftY: v } = u, I = Wn(d), S = Wn(w), A = Wn(c);
    return {
      confidence: u.confidence / 1e3,
      topLeft: {
        x: D,
        y: v
      },
      bottomRight: {
        x: r,
        y: a
      },
      faceCenter: ei(I, S),
      faceSize: ti(I, S, n),
      leftEye: I,
      rightEye: S,
      mouth: A,
      brightness: t / 1e3,
      sharpness: e / 1e3
    };
  }
  async detect(u, n, t) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(u, n), r = this.samWasmModule.detectFacePartsWithImageParameters(
      n.width,
      n.height,
      e.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return e.free(), this.parseRawData(r, t);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Co = Symbol("Comlink.proxy"), ni = Symbol("Comlink.endpoint"), oi = Symbol("Comlink.releaseProxy"), Un = Symbol("Comlink.finalizer"), Rt = Symbol("Comlink.thrown"), Io = (h) => typeof h == "object" && h !== null || typeof h == "function", ii = {
  canHandle: (h) => Io(h) && h[Co],
  serialize(h) {
    const { port1: u, port2: n } = new MessageChannel();
    return zn(h, u), [n, [n]];
  },
  deserialize(h) {
    return h.start(), ci(h);
  }
}, ai = {
  canHandle: (h) => Io(h) && Rt in h,
  serialize({ value: h }) {
    let u;
    return h instanceof Error ? u = {
      isError: !0,
      value: {
        message: h.message,
        name: h.name,
        stack: h.stack
      }
    } : u = { isError: !1, value: h }, [u, []];
  },
  deserialize(h) {
    throw h.isError ? Object.assign(new Error(h.value.message), h.value) : h.value;
  }
}, jo = /* @__PURE__ */ new Map([
  ["proxy", ii],
  ["throw", ai]
]);
function si(h, u) {
  for (const n of h)
    if (u === n || n === "*" || n instanceof RegExp && n.test(u))
      return !0;
  return !1;
}
function zn(h, u = globalThis, n = ["*"]) {
  u.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!si(n, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: r, type: a, path: d } = Object.assign({ path: [] }, e.data), c = (e.data.argumentList || []).map(ze);
    let w;
    try {
      const D = d.slice(0, -1).reduce((I, S) => I[S], h), v = d.reduce((I, S) => I[S], h);
      switch (a) {
        case "GET":
          w = v;
          break;
        case "SET":
          D[d.slice(-1)[0]] = ze(e.data.value), w = !0;
          break;
        case "APPLY":
          w = v.apply(D, c);
          break;
        case "CONSTRUCT":
          {
            const I = new v(...c);
            w = mi(I);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: I, port2: S } = new MessageChannel();
            zn(h, S), w = pi(I, [I]);
          }
          break;
        case "RELEASE":
          w = void 0;
          break;
        default:
          return;
      }
    } catch (D) {
      w = { value: D, [Rt]: 0 };
    }
    Promise.resolve(w).catch((D) => ({ value: D, [Rt]: 0 })).then((D) => {
      const [v, I] = xt(D);
      u.postMessage(Object.assign(Object.assign({}, v), { id: r }), I), a === "RELEASE" && (u.removeEventListener("message", t), So(u), Un in h && typeof h[Un] == "function" && h[Un]());
    }).catch((D) => {
      const [v, I] = xt({
        value: new TypeError("Unserializable return value"),
        [Rt]: 0
      });
      u.postMessage(Object.assign(Object.assign({}, v), { id: r }), I);
    });
  }), u.start && u.start();
}
function li(h) {
  return h.constructor.name === "MessagePort";
}
function So(h) {
  li(h) && h.close();
}
function ci(h, u) {
  const n = /* @__PURE__ */ new Map();
  return h.addEventListener("message", function(e) {
    const { data: r } = e;
    if (!r || !r.id)
      return;
    const a = n.get(r.id);
    if (a)
      try {
        a(r);
      } finally {
        n.delete(r.id);
      }
  }), Vn(h, n, [], u);
}
function Ft(h) {
  if (h)
    throw new Error("Proxy has been released and is not useable");
}
function To(h) {
  return Ye(h, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    So(h);
  });
}
const Lt = /* @__PURE__ */ new WeakMap(), Mt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((h) => {
  const u = (Lt.get(h) || 0) - 1;
  Lt.set(h, u), u === 0 && To(h);
});
function ui(h, u) {
  const n = (Lt.get(u) || 0) + 1;
  Lt.set(u, n), Mt && Mt.register(h, u, h);
}
function di(h) {
  Mt && Mt.unregister(h);
}
function Vn(h, u, n = [], t = function() {
}) {
  let e = !1;
  const r = new Proxy(t, {
    get(a, d) {
      if (Ft(e), d === oi)
        return () => {
          di(r), To(h), u.clear(), e = !0;
        };
      if (d === "then") {
        if (n.length === 0)
          return { then: () => r };
        const c = Ye(h, u, {
          type: "GET",
          path: n.map((w) => w.toString())
        }).then(ze);
        return c.then.bind(c);
      }
      return Vn(h, u, [...n, d]);
    },
    set(a, d, c) {
      Ft(e);
      const [w, D] = xt(c);
      return Ye(h, u, {
        type: "SET",
        path: [...n, d].map((v) => v.toString()),
        value: w
      }, D).then(ze);
    },
    apply(a, d, c) {
      Ft(e);
      const w = n[n.length - 1];
      if (w === ni)
        return Ye(h, u, {
          type: "ENDPOINT"
        }).then(ze);
      if (w === "bind")
        return Vn(h, u, n.slice(0, -1));
      const [D, v] = bo(c);
      return Ye(h, u, {
        type: "APPLY",
        path: n.map((I) => I.toString()),
        argumentList: D
      }, v).then(ze);
    },
    construct(a, d) {
      Ft(e);
      const [c, w] = bo(d);
      return Ye(h, u, {
        type: "CONSTRUCT",
        path: n.map((D) => D.toString()),
        argumentList: c
      }, w).then(ze);
    }
  });
  return ui(r, h), r;
}
function fi(h) {
  return Array.prototype.concat.apply([], h);
}
function bo(h) {
  const u = h.map(xt);
  return [u.map((n) => n[0]), fi(u.map((n) => n[1]))];
}
const Ao = /* @__PURE__ */ new WeakMap();
function pi(h, u) {
  return Ao.set(h, u), h;
}
function mi(h) {
  return Object.assign(h, { [Co]: !0 });
}
function xt(h) {
  for (const [u, n] of jo)
    if (n.canHandle(h)) {
      const [t, e] = n.serialize(h);
      return [
        {
          type: "HANDLER",
          name: u,
          value: t
        },
        e
      ];
    }
  return [
    {
      type: "RAW",
      value: h
    },
    Ao.get(h) || []
  ];
}
function ze(h) {
  switch (h.type) {
    case "HANDLER":
      return jo.get(h.name).deserialize(h.value);
    case "RAW":
      return h.value;
  }
}
function Ye(h, u, n, t) {
  return new Promise((e) => {
    const r = yi();
    u.set(r, e), h.start && h.start(), h.postMessage(Object.assign({ id: r }, n), t);
  });
}
function yi() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var hi = (() => {
  var h = import.meta.url;
  return async function(u = {}) {
    var n, t = u, e, r, a = new Promise((i, o) => {
      e = i, r = o;
    }), d = typeof window == "object", c = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var w = Object.assign({}, t), D = (i, o) => {
      throw o;
    }, v = "";
    function I(i) {
      return t.locateFile ? t.locateFile(i, v) : v + i;
    }
    var S, A;
    (d || c) && (c ? v = self.location.href : typeof document < "u" && document.currentScript && (v = document.currentScript.src), h && (v = h), v.startsWith("blob:") ? v = "" : v = v.slice(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1), c && (A = (i) => {
      var o = new XMLHttpRequest();
      return o.open("GET", i, !1), o.responseType = "arraybuffer", o.send(null), new Uint8Array(o.response);
    }), S = async (i) => {
      if (Qe(i))
        return new Promise((l, f) => {
          var m = new XMLHttpRequest();
          m.open("GET", i, !0), m.responseType = "arraybuffer", m.onload = () => {
            if (m.status == 200 || m.status == 0 && m.response) {
              l(m.response);
              return;
            }
            f(m.status);
          }, m.onerror = f, m.send(null);
        });
      var o = await fetch(i, { credentials: "same-origin" });
      if (o.ok)
        return o.arrayBuffer();
      throw new Error(o.status + " : " + o.url);
    }), t.print || console.log.bind(console);
    var R = t.printErr || console.error.bind(console);
    Object.assign(t, w), w = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var C = t.wasmBinary, F, M = !1, se, X, z, le, pe, Q, $, Ze, Ke, qe, Xe, Qe = (i) => i.startsWith("file://");
    function et() {
      var i = F.buffer;
      t.HEAP8 = X = new Int8Array(i), t.HEAP16 = le = new Int16Array(i), t.HEAPU8 = z = new Uint8Array(i), t.HEAPU16 = pe = new Uint16Array(i), t.HEAP32 = Q = new Int32Array(i), t.HEAPU32 = $ = new Uint32Array(i), t.HEAPF32 = Ze = new Float32Array(i), t.HEAPF64 = Xe = new Float64Array(i), t.HEAP64 = Ke = new BigInt64Array(i), t.HEAPU64 = qe = new BigUint64Array(i);
    }
    function $t() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          qt(t.preRun.shift());
      rt(ot);
    }
    function Nt() {
      _.C();
    }
    function Wt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Kt(t.postRun.shift());
      rt(nt);
    }
    var ie = 0, me = null;
    function Ut(i) {
      var o;
      ie++, (o = t.monitorRunDependencies) == null || o.call(t, ie);
    }
    function Vt(i) {
      var l;
      if (ie--, (l = t.monitorRunDependencies) == null || l.call(t, ie), ie == 0 && me) {
        var o = me;
        me = null, o();
      }
    }
    function be(i) {
      var l;
      (l = t.onAbort) == null || l.call(t, i), i = "Aborted(" + i + ")", R(i), M = !0, i += ". Build with -sASSERTIONS for more info.";
      var o = new WebAssembly.RuntimeError(i);
      throw r(o), o;
    }
    var Ee;
    function zt() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Gt(i) {
      if (i == Ee && C)
        return new Uint8Array(C);
      if (A)
        return A(i);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Bt(i) {
      if (!C)
        try {
          var o = await S(i);
          return new Uint8Array(o);
        } catch {
        }
      return Gt(i);
    }
    async function Ht(i, o) {
      try {
        var l = await Bt(i), f = await WebAssembly.instantiate(l, o);
        return f;
      } catch (m) {
        R(`failed to asynchronously prepare wasm: ${m}`), be(m);
      }
    }
    async function Yt(i, o, l) {
      if (!i && typeof WebAssembly.instantiateStreaming == "function" && !Qe(o))
        try {
          var f = fetch(o, { credentials: "same-origin" }), m = await WebAssembly.instantiateStreaming(f, l);
          return m;
        } catch (g) {
          R(`wasm streaming compile failed: ${g}`), R("falling back to ArrayBuffer instantiation");
        }
      return Ht(o, l);
    }
    function Jt() {
      return { a: wn };
    }
    async function Zt() {
      function i(g, b) {
        return _ = g.exports, _ = j.instrumentWasmExports(_), F = _.B, et(), _.H, Vt(), _;
      }
      Ut();
      function o(g) {
        return i(g.instance);
      }
      var l = Jt();
      if (t.instantiateWasm)
        return new Promise((g, b) => {
          t.instantiateWasm(l, (y, P) => {
            i(y), g(y.exports);
          });
        });
      Ee ?? (Ee = zt());
      try {
        var f = await Yt(C, Ee, l), m = o(f);
        return m;
      } catch (g) {
        return r(g), Promise.reject(g);
      }
    }
    class tt {
      constructor(o) {
        kt(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${o})`, this.status = o;
      }
    }
    var rt = (i) => {
      for (; i.length > 0; )
        i.shift()(t);
    }, nt = [], Kt = (i) => nt.unshift(i), ot = [], qt = (i) => ot.unshift(i), it = t.noExitRuntime || !0;
    class Xt {
      constructor(o) {
        this.excPtr = o, this.ptr = o - 24;
      }
      set_type(o) {
        $[this.ptr + 4 >> 2] = o;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(o) {
        $[this.ptr + 8 >> 2] = o;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(o) {
        o = o ? 1 : 0, X[this.ptr + 12] = o;
      }
      get_caught() {
        return X[this.ptr + 12] != 0;
      }
      set_rethrown(o) {
        o = o ? 1 : 0, X[this.ptr + 13] = o;
      }
      get_rethrown() {
        return X[this.ptr + 13] != 0;
      }
      init(o, l) {
        this.set_adjusted_ptr(0), this.set_type(o), this.set_destructor(l);
      }
      set_adjusted_ptr(o) {
        $[this.ptr + 16 >> 2] = o;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var at = 0, Qt = (i, o, l) => {
      var f = new Xt(i);
      throw f.init(o, l), at = i, at;
    }, er = () => be(""), Oe = (i) => {
      if (i === null)
        return "null";
      var o = typeof i;
      return o === "object" || o === "array" || o === "function" ? i.toString() : "" + i;
    }, tr = () => {
      for (var i = new Array(256), o = 0; o < 256; ++o)
        i[o] = String.fromCharCode(o);
      st = i;
    }, st, W = (i) => {
      for (var o = "", l = i; z[l]; )
        o += st[z[l++]];
      return o;
    }, ce = {}, ae = {}, we = {}, ue, E = (i) => {
      throw new ue(i);
    }, lt, Pe = (i) => {
      throw new lt(i);
    }, de = (i, o, l) => {
      i.forEach((y) => we[y] = o);
      function f(y) {
        var P = l(y);
        P.length !== i.length && Pe("Mismatched type converter count");
        for (var k = 0; k < i.length; ++k)
          B(i[k], P[k]);
      }
      var m = new Array(o.length), g = [], b = 0;
      o.forEach((y, P) => {
        ae.hasOwnProperty(y) ? m[P] = ae[y] : (g.push(y), ce.hasOwnProperty(y) || (ce[y] = []), ce[y].push(() => {
          m[P] = ae[y], ++b, b === g.length && f(m);
        }));
      }), g.length === 0 && f(m);
    };
    function rr(i, o, l = {}) {
      var f = o.name;
      if (i || E(`type "${f}" must have a positive integer typeid pointer`), ae.hasOwnProperty(i)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        E(`Cannot register type '${f}' twice`);
      }
      if (ae[i] = o, delete we[i], ce.hasOwnProperty(i)) {
        var m = ce[i];
        delete ce[i], m.forEach((g) => g());
      }
    }
    function B(i, o, l = {}) {
      return rr(i, o, l);
    }
    var ct = (i, o, l) => {
      switch (o) {
        case 1:
          return l ? (f) => X[f] : (f) => z[f];
        case 2:
          return l ? (f) => le[f >> 1] : (f) => pe[f >> 1];
        case 4:
          return l ? (f) => Q[f >> 2] : (f) => $[f >> 2];
        case 8:
          return l ? (f) => Ke[f >> 3] : (f) => qe[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${o}): ${i}`);
      }
    }, nr = (i, o, l, f, m) => {
      o = W(o);
      var g = o.indexOf("u") != -1;
      B(i, { name: o, fromWireType: (b) => b, toWireType: function(b, y) {
        if (typeof y != "bigint" && typeof y != "number")
          throw new TypeError(`Cannot convert "${Oe(y)}" to ${this.name}`);
        return typeof y == "number" && (y = BigInt(y)), y;
      }, argPackAdvance: Y, readValueFromPointer: ct(o, l, !g), destructorFunction: null });
    }, Y = 8, or = (i, o, l, f) => {
      o = W(o), B(i, { name: o, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, g) {
        return g ? l : f;
      }, argPackAdvance: Y, readValueFromPointer: function(m) {
        return this.fromWireType(z[m]);
      }, destructorFunction: null });
    }, ir = (i) => ({ count: i.count, deleteScheduled: i.deleteScheduled, preservePointerOnDelete: i.preservePointerOnDelete, ptr: i.ptr, ptrType: i.ptrType, smartPtr: i.smartPtr, smartPtrType: i.smartPtrType }), Fe = (i) => {
      function o(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      E(o(i) + " instance already deleted");
    }, Re = !1, ut = (i) => {
    }, ar = (i) => {
      i.smartPtr ? i.smartPtrType.rawDestructor(i.smartPtr) : i.ptrType.registeredClass.rawDestructor(i.ptr);
    }, dt = (i) => {
      i.count.value -= 1;
      var o = i.count.value === 0;
      o && ar(i);
    }, ft = (i, o, l) => {
      if (o === l)
        return i;
      if (l.baseClass === void 0)
        return null;
      var f = ft(i, o, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, pt = {}, sr = {}, lr = (i, o) => {
      for (o === void 0 && E("ptr should not be undefined"); i.baseClass; )
        o = i.upcast(o), i = i.baseClass;
      return o;
    }, cr = (i, o) => (o = lr(i, o), sr[o]), Ce = (i, o) => {
      (!o.ptrType || !o.ptr) && Pe("makeClassHandle requires ptr and ptrType");
      var l = !!o.smartPtrType, f = !!o.smartPtr;
      return l !== f && Pe("Both smartPtrType and smartPtr must be specified"), o.count = { value: 1 }, ye(Object.create(i, { $$: { value: o, writable: !0 } }));
    };
    function ur(i) {
      var o = this.getPointee(i);
      if (!o)
        return this.destructor(i), null;
      var l = cr(this.registeredClass, o);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = o, l.$$.smartPtr = i, l.clone();
        var f = l.clone();
        return this.destructor(i), f;
      }
      function m() {
        return this.isSmartPointer ? Ce(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: o, smartPtrType: this, smartPtr: i }) : Ce(this.registeredClass.instancePrototype, { ptrType: this, ptr: i });
      }
      var g = this.registeredClass.getActualType(o), b = pt[g];
      if (!b)
        return m.call(this);
      var y;
      this.isConst ? y = b.constPointerType : y = b.pointerType;
      var P = ft(o, this.registeredClass, y.registeredClass);
      return P === null ? m.call(this) : this.isSmartPointer ? Ce(y.registeredClass.instancePrototype, { ptrType: y, ptr: P, smartPtrType: this, smartPtr: i }) : Ce(y.registeredClass.instancePrototype, { ptrType: y, ptr: P });
    }
    var ye = (i) => typeof FinalizationRegistry > "u" ? (ye = (o) => o, i) : (Re = new FinalizationRegistry((o) => {
      dt(o.$$);
    }), ye = (o) => {
      var l = o.$$, f = !!l.smartPtr;
      if (f) {
        var m = { $$: l };
        Re.register(o, m, o);
      }
      return o;
    }, ut = (o) => Re.unregister(o), ye(i)), dr = () => {
      Object.assign(Ie.prototype, { isAliasOf(i) {
        if (!(this instanceof Ie) || !(i instanceof Ie))
          return !1;
        var o = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        i.$$ = i.$$;
        for (var f = i.$$.ptrType.registeredClass, m = i.$$.ptr; o.baseClass; )
          l = o.upcast(l), o = o.baseClass;
        for (; f.baseClass; )
          m = f.upcast(m), f = f.baseClass;
        return o === f && l === m;
      }, clone() {
        if (this.$$.ptr || Fe(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var i = ye(Object.create(Object.getPrototypeOf(this), { $$: { value: ir(this.$$) } }));
        return i.$$.count.value += 1, i.$$.deleteScheduled = !1, i;
      }, delete() {
        this.$$.ptr || Fe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), ut(this), dt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Fe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ie() {
    }
    var je = (i, o) => Object.defineProperty(o, "name", { value: i }), fr = (i, o, l) => {
      if (i[o].overloadTable === void 0) {
        var f = i[o];
        i[o] = function(...m) {
          return i[o].overloadTable.hasOwnProperty(m.length) || E(`Function '${l}' called with an invalid number of arguments (${m.length}) - expects one of (${i[o].overloadTable})!`), i[o].overloadTable[m.length].apply(this, m);
        }, i[o].overloadTable = [], i[o].overloadTable[f.argCount] = f;
      }
    }, Le = (i, o, l) => {
      t.hasOwnProperty(i) ? ((l === void 0 || t[i].overloadTable !== void 0 && t[i].overloadTable[l] !== void 0) && E(`Cannot register public name '${i}' twice`), fr(t, i, i), t[i].overloadTable.hasOwnProperty(l) && E(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[i].overloadTable[l] = o) : (t[i] = o, t[i].argCount = l);
    }, pr = 48, mr = 57, yr = (i) => {
      i = i.replace(/[^a-zA-Z0-9_]/g, "$");
      var o = i.charCodeAt(0);
      return o >= pr && o <= mr ? `_${i}` : i;
    };
    function hr(i, o, l, f, m, g, b, y) {
      this.name = i, this.constructor = o, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = m, this.getActualType = g, this.upcast = b, this.downcast = y, this.pureVirtualFunctions = [];
    }
    var Se = (i, o, l) => {
      for (; o !== l; )
        o.upcast || E(`Expected null or instance of ${l.name}, got an instance of ${o.name}`), i = o.upcast(i), o = o.baseClass;
      return i;
    };
    function gr(i, o) {
      if (o === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      o.$$ || E(`Cannot pass "${Oe(o)}" as a ${this.name}`), o.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Se(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function vr(i, o) {
      var l;
      if (o === null)
        return this.isReference && E(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), i !== null && i.push(this.rawDestructor, l), l) : 0;
      (!o || !o.$$) && E(`Cannot pass "${Oe(o)}" as a ${this.name}`), o.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && o.$$.ptrType.isConst && E(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
      var f = o.$$.ptrType.registeredClass;
      if (l = Se(o.$$.ptr, f, this.registeredClass), this.isSmartPointer)
        switch (o.$$.smartPtr === void 0 && E("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            o.$$.smartPtrType === this ? l = o.$$.smartPtr : E(`Cannot convert argument of type ${o.$$.smartPtrType ? o.$$.smartPtrType.name : o.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            l = o.$$.smartPtr;
            break;
          case 2:
            if (o.$$.smartPtrType === this)
              l = o.$$.smartPtr;
            else {
              var m = o.clone();
              l = this.rawShare(l, H.toHandle(() => m.delete())), i !== null && i.push(this.rawDestructor, l);
            }
            break;
          default:
            E("Unsupporting sharing policy");
        }
      return l;
    }
    function br(i, o) {
      if (o === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      o.$$ || E(`Cannot pass "${Oe(o)}" as a ${this.name}`), o.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), o.$$.ptrType.isConst && E(`Cannot convert argument of type ${o.$$.ptrType.name} to parameter type ${this.name}`);
      var l = o.$$.ptrType.registeredClass, f = Se(o.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Te(i) {
      return this.fromWireType($[i >> 2]);
    }
    var Or = () => {
      Object.assign(Ae.prototype, { getPointee(i) {
        return this.rawGetPointee && (i = this.rawGetPointee(i)), i;
      }, destructor(i) {
        var o;
        (o = this.rawDestructor) == null || o.call(this, i);
      }, argPackAdvance: Y, readValueFromPointer: Te, fromWireType: ur });
    };
    function Ae(i, o, l, f, m, g, b, y, P, k, T) {
      this.name = i, this.registeredClass = o, this.isReference = l, this.isConst = f, this.isSmartPointer = m, this.pointeeType = g, this.sharingPolicy = b, this.rawGetPointee = y, this.rawConstructor = P, this.rawShare = k, this.rawDestructor = T, !m && o.baseClass === void 0 ? f ? (this.toWireType = gr, this.destructorFunction = null) : (this.toWireType = br, this.destructorFunction = null) : this.toWireType = vr;
    }
    var mt = (i, o, l) => {
      t.hasOwnProperty(i) || Pe("Replacing nonexistent public symbol"), t[i].overloadTable !== void 0 && l !== void 0 ? t[i].overloadTable[l] = o : (t[i] = o, t[i].argCount = l);
    }, wr = (i, o, l) => {
      i = i.replace(/p/g, "i");
      var f = t["dynCall_" + i];
      return f(o, ...l);
    }, Pr = (i, o, l = []) => {
      var f = wr(i, o, l);
      return f;
    }, Cr = (i, o) => (...l) => Pr(i, o, l), ee = (i, o) => {
      i = W(i);
      function l() {
        return Cr(i, o);
      }
      var f = l();
      return typeof f != "function" && E(`unknown function pointer with signature ${i}: ${o}`), f;
    }, Ir = (i, o) => {
      var l = je(o, function(f) {
        this.name = o, this.message = f;
        var m = new Error(f).stack;
        m !== void 0 && (this.stack = this.toString() + `
` + m.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(i.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, yt, ht = (i) => {
      var o = Pn(i), l = W(o);
      return q(o), l;
    }, he = (i, o) => {
      var l = [], f = {};
      function m(g) {
        if (!f[g] && !ae[g]) {
          if (we[g]) {
            we[g].forEach(m);
            return;
          }
          l.push(g), f[g] = !0;
        }
      }
      throw o.forEach(m), new yt(`${i}: ` + l.map(ht).join([", "]));
    }, jr = (i, o, l, f, m, g, b, y, P, k, T, L, U) => {
      T = W(T), g = ee(m, g), y && (y = ee(b, y)), k && (k = ee(P, k)), U = ee(L, U);
      var J = yr(T);
      Le(J, function() {
        he(`Cannot construct ${T} due to unbound types`, [f]);
      }), de([i, o, l], f ? [f] : [], (Z) => {
        var At;
        Z = Z[0];
        var re, G;
        f ? (re = Z.registeredClass, G = re.instancePrototype) : G = Ie.prototype;
        var K = je(T, function(...Ve) {
          if (Object.getPrototypeOf(this) !== ne)
            throw new ue("Use 'new' to construct " + T);
          if (V.constructor_body === void 0)
            throw new ue(T + " has no accessible constructor");
          var Dt = V.constructor_body[Ve.length];
          if (Dt === void 0)
            throw new ue(`Tried to invoke ctor of ${T} with invalid number of parameters (${Ve.length}) - expected (${Object.keys(V.constructor_body).toString()}) parameters instead!`);
          return Dt.apply(this, Ve);
        }), ne = Object.create(G, { constructor: { value: K } });
        K.prototype = ne;
        var V = new hr(T, K, ne, U, re, g, y, k);
        V.baseClass && ((At = V.baseClass).__derivedClasses ?? (At.__derivedClasses = []), V.baseClass.__derivedClasses.push(V));
        var oe = new Ae(T, V, !0, !1, !1), ke = new Ae(T + "*", V, !1, !1, !1), Tt = new Ae(T + " const*", V, !1, !0, !1);
        return pt[i] = { pointerType: ke, constPointerType: Tt }, mt(J, K), [oe, ke, Tt];
      });
    }, gt = (i, o) => {
      for (var l = [], f = 0; f < i; f++)
        l.push($[o + f * 4 >> 2]);
      return l;
    }, Me = (i) => {
      for (; i.length; ) {
        var o = i.pop(), l = i.pop();
        l(o);
      }
    };
    function Sr(i) {
      for (var o = 1; o < i.length; ++o)
        if (i[o] !== null && i[o].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var De = (i) => {
      try {
        return i();
      } catch (o) {
        be(o);
      }
    }, vt = (i) => {
      if (i instanceof tt || i == "unwind")
        return se;
      D(1, i);
    }, bt = 0, Ot = () => it || bt > 0, wt = (i) => {
      var o;
      se = i, Ot() || ((o = t.onExit) == null || o.call(t, i), M = !0), D(i, new tt(i));
    }, Tr = (i, o) => {
      se = i, wt(i);
    }, Ar = Tr, Dr = () => {
      if (!Ot())
        try {
          Ar(se);
        } catch (i) {
          vt(i);
        }
    }, Pt = (i) => {
      if (!M)
        try {
          i(), Dr();
        } catch (o) {
          vt(o);
        }
    }, j = { instrumentWasmImports(i) {
      var o = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(i))
        typeof f == "function" && (f.isAsync || o.test(l));
    }, instrumentWasmExports(i) {
      var o = {};
      for (let [l, f] of Object.entries(i))
        typeof f == "function" ? o[l] = (...m) => {
          j.exportCallStack.push(l);
          try {
            return f(...m);
          } finally {
            M || (j.exportCallStack.pop(), j.maybeStopUnwind());
          }
        } : o[l] = f;
      return o;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(i) {
      var o = j.callStackNameToId[i];
      return o === void 0 && (o = j.callStackId++, j.callStackNameToId[i] = o, j.callStackIdToName[o] = i), o;
    }, maybeStopUnwind() {
      j.currData && j.state === j.State.Unwinding && j.exportCallStack.length === 0 && (j.state = j.State.Normal, De(jn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((i, o) => {
        j.asyncPromiseHandlers = { resolve: i, reject: o };
      });
    }, allocateData() {
      var i = We(12 + j.StackSize);
      return j.setDataHeader(i, i + 12, j.StackSize), j.setDataRewindFunc(i), i;
    }, setDataHeader(i, o, l) {
      $[i >> 2] = o, $[i + 4 >> 2] = o + l;
    }, setDataRewindFunc(i) {
      var o = j.exportCallStack[0], l = j.getCallStackId(o);
      Q[i + 8 >> 2] = l;
    }, getDataRewindFuncName(i) {
      var o = Q[i + 8 >> 2], l = j.callStackIdToName[o];
      return l;
    }, getDataRewindFunc(i) {
      var o = _[i];
      return o;
    }, doRewind(i) {
      var o = j.getDataRewindFuncName(i), l = j.getDataRewindFunc(o);
      return l();
    }, handleSleep(i) {
      if (!M) {
        if (j.state === j.State.Normal) {
          var o = !1, l = !1;
          i((f = 0) => {
            if (!M && (j.handleSleepReturnValue = f, o = !0, !!l)) {
              j.state = j.State.Rewinding, De(() => Sn(j.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var m, g = !1;
              try {
                m = j.doRewind(j.currData);
              } catch (P) {
                m = P, g = !0;
              }
              var b = !1;
              if (!j.currData) {
                var y = j.asyncPromiseHandlers;
                y && (j.asyncPromiseHandlers = null, (g ? y.reject : y.resolve)(m), b = !0);
              }
              if (g && !b)
                throw m;
            }
          }), l = !0, o || (j.state = j.State.Unwinding, j.currData = j.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), De(() => In(j.currData)));
        } else j.state === j.State.Rewinding ? (j.state = j.State.Normal, De(Tn), q(j.currData), j.currData = null, j.sleepCallbacks.forEach(Pt)) : be(`invalid state: ${j.state}`);
        return j.handleSleepReturnValue;
      }
    }, handleAsync(i) {
      return j.handleSleep((o) => {
        i().then(o);
      });
    } };
    function Ct(i, o, l, f, m, g) {
      var b = o.length;
      b < 2 && E("argTypes array size mismatch! Must at least get return value and 'this' types!"), o[1];
      var y = Sr(o), P = o[0].name !== "void", k = b - 2, T = new Array(k), L = [], U = [], J = function(...Z) {
        U.length = 0;
        var re;
        L.length = 1, L[0] = m;
        for (var G = 0; G < k; ++G)
          T[G] = o[G + 2].toWireType(U, Z[G]), L.push(T[G]);
        var K = f(...L);
        function ne(V) {
          if (y)
            Me(U);
          else
            for (var oe = 2; oe < o.length; oe++) {
              var ke = oe === 1 ? re : T[oe - 2];
              o[oe].destructorFunction !== null && o[oe].destructorFunction(ke);
            }
          if (P)
            return o[0].fromWireType(V);
        }
        return j.currData ? j.whenDone().then(ne) : ne(K);
      };
      return je(i, J);
    }
    var kr = (i, o, l, f, m, g) => {
      var b = gt(o, l);
      m = ee(f, m), de([], [i], (y) => {
        y = y[0];
        var P = `constructor ${y.name}`;
        if (y.registeredClass.constructor_body === void 0 && (y.registeredClass.constructor_body = []), y.registeredClass.constructor_body[o - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${o - 1}) for class '${y.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return y.registeredClass.constructor_body[o - 1] = () => {
          he(`Cannot construct ${y.name} due to unbound types`, b);
        }, de([], b, (k) => (k.splice(1, 0, null), y.registeredClass.constructor_body[o - 1] = Ct(P, k, null, m, g), [])), [];
      });
    }, It = (i, o, l) => (i instanceof Object || E(`${l} with invalid "this": ${i}`), i instanceof o.registeredClass.constructor || E(`${l} incompatible with "this" of type ${i.constructor.name}`), i.$$.ptr || E(`cannot call emscripten binding method ${l} on deleted object`), Se(i.$$.ptr, i.$$.ptrType.registeredClass, o.registeredClass)), _r = (i, o, l, f, m, g, b, y, P, k) => {
      o = W(o), m = ee(f, m), de([], [i], (T) => {
        T = T[0];
        var L = `${T.name}.${o}`, U = { get() {
          he(`Cannot access ${L} due to unbound types`, [l, b]);
        }, enumerable: !0, configurable: !0 };
        return P ? U.set = () => he(`Cannot access ${L} due to unbound types`, [l, b]) : U.set = (J) => E(L + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, o, U), de([], P ? [l, b] : [l], (J) => {
          var Z = J[0], re = { get() {
            var K = It(this, T, L + " getter");
            return Z.fromWireType(m(g, K));
          }, enumerable: !0 };
          if (P) {
            P = ee(y, P);
            var G = J[1];
            re.set = function(K) {
              var ne = It(this, T, L + " setter"), V = [];
              P(k, ne, G.toWireType(V, K)), Me(V);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, o, re), [];
        }), [];
      });
    }, xe = [], te = [], $e = (i) => {
      i > 9 && --te[i + 1] === 0 && (te[i] = void 0, xe.push(i));
    }, Er = () => te.length / 2 - 5 - xe.length, Fr = () => {
      te.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Er;
    }, H = { toValue: (i) => (i || E("Cannot use deleted val. handle = " + i), te[i]), toHandle: (i) => {
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
          const o = xe.pop() || te.length;
          return te[o] = i, te[o + 1] = 1, o;
        }
      }
    } }, Rr = { name: "emscripten::val", fromWireType: (i) => {
      var o = H.toValue(i);
      return $e(i), o;
    }, toWireType: (i, o) => H.toHandle(o), argPackAdvance: Y, readValueFromPointer: Te, destructorFunction: null }, Lr = (i) => B(i, Rr), Mr = (i, o, l) => {
      switch (o) {
        case 1:
          return l ? function(f) {
            return this.fromWireType(X[f]);
          } : function(f) {
            return this.fromWireType(z[f]);
          };
        case 2:
          return l ? function(f) {
            return this.fromWireType(le[f >> 1]);
          } : function(f) {
            return this.fromWireType(pe[f >> 1]);
          };
        case 4:
          return l ? function(f) {
            return this.fromWireType(Q[f >> 2]);
          } : function(f) {
            return this.fromWireType($[f >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${o}): ${i}`);
      }
    }, xr = (i, o, l, f) => {
      o = W(o);
      function m() {
      }
      m.values = {}, B(i, { name: o, constructor: m, fromWireType: function(g) {
        return this.constructor.values[g];
      }, toWireType: (g, b) => b.value, argPackAdvance: Y, readValueFromPointer: Mr(o, l, f), destructorFunction: null }), Le(o, m);
    }, Ne = (i, o) => {
      var l = ae[i];
      return l === void 0 && E(`${o} has unknown type ${ht(i)}`), l;
    }, $r = (i, o, l) => {
      var f = Ne(i, "enum");
      o = W(o);
      var m = f.constructor, g = Object.create(f.constructor.prototype, { value: { value: l }, constructor: { value: je(`${f.name}_${o}`, function() {
      }) } });
      m.values[l] = g, m[o] = g;
    }, Nr = (i, o) => {
      switch (o) {
        case 4:
          return function(l) {
            return this.fromWireType(Ze[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(Xe[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${o}): ${i}`);
      }
    }, Wr = (i, o, l) => {
      o = W(o), B(i, { name: o, fromWireType: (f) => f, toWireType: (f, m) => m, argPackAdvance: Y, readValueFromPointer: Nr(o, l), destructorFunction: null });
    }, Ur = (i) => {
      i = i.trim();
      const o = i.indexOf("(");
      return o === -1 ? i : i.slice(0, o);
    }, Vr = (i, o, l, f, m, g, b, y) => {
      var P = gt(o, l);
      i = W(i), i = Ur(i), m = ee(f, m), Le(i, function() {
        he(`Cannot call ${i} due to unbound types`, P);
      }, o - 1), de([], P, (k) => {
        var T = [k[0], null].concat(k.slice(1));
        return mt(i, Ct(i, T, null, m, g), o - 1), [];
      });
    }, zr = (i, o, l, f, m) => {
      o = W(o);
      var g = (T) => T;
      if (f === 0) {
        var b = 32 - 8 * l;
        g = (T) => T << b >>> b;
      }
      var y = o.includes("unsigned"), P = (T, L) => {
      }, k;
      y ? k = function(T, L) {
        return P(L, this.name), L >>> 0;
      } : k = function(T, L) {
        return P(L, this.name), L;
      }, B(i, { name: o, fromWireType: g, toWireType: k, argPackAdvance: Y, readValueFromPointer: ct(o, l, f !== 0), destructorFunction: null });
    }, Gr = (i, o, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], m = f[o];
      function g(b) {
        var y = $[b >> 2], P = $[b + 4 >> 2];
        return new m(X.buffer, P, y);
      }
      l = W(l), B(i, { name: l, fromWireType: g, argPackAdvance: Y, readValueFromPointer: g }, { ignoreDuplicateRegistrations: !0 });
    }, Br = (i, o, l, f) => {
      if (!(f > 0)) return 0;
      for (var m = l, g = l + f - 1, b = 0; b < i.length; ++b) {
        var y = i.charCodeAt(b);
        if (y >= 55296 && y <= 57343) {
          var P = i.charCodeAt(++b);
          y = 65536 + ((y & 1023) << 10) | P & 1023;
        }
        if (y <= 127) {
          if (l >= g) break;
          o[l++] = y;
        } else if (y <= 2047) {
          if (l + 1 >= g) break;
          o[l++] = 192 | y >> 6, o[l++] = 128 | y & 63;
        } else if (y <= 65535) {
          if (l + 2 >= g) break;
          o[l++] = 224 | y >> 12, o[l++] = 128 | y >> 6 & 63, o[l++] = 128 | y & 63;
        } else {
          if (l + 3 >= g) break;
          o[l++] = 240 | y >> 18, o[l++] = 128 | y >> 12 & 63, o[l++] = 128 | y >> 6 & 63, o[l++] = 128 | y & 63;
        }
      }
      return o[l] = 0, l - m;
    }, Hr = (i, o, l) => Br(i, z, o, l), Yr = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f <= 127 ? o++ : f <= 2047 ? o += 2 : f >= 55296 && f <= 57343 ? (o += 4, ++l) : o += 3;
      }
      return o;
    }, jt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Jr = (i, o = 0, l = NaN) => {
      for (var f = o + l, m = o; i[m] && !(m >= f); ) ++m;
      if (m - o > 16 && i.buffer && jt)
        return jt.decode(i.subarray(o, m));
      for (var g = ""; o < m; ) {
        var b = i[o++];
        if (!(b & 128)) {
          g += String.fromCharCode(b);
          continue;
        }
        var y = i[o++] & 63;
        if ((b & 224) == 192) {
          g += String.fromCharCode((b & 31) << 6 | y);
          continue;
        }
        var P = i[o++] & 63;
        if ((b & 240) == 224 ? b = (b & 15) << 12 | y << 6 | P : b = (b & 7) << 18 | y << 12 | P << 6 | i[o++] & 63, b < 65536)
          g += String.fromCharCode(b);
        else {
          var k = b - 65536;
          g += String.fromCharCode(55296 | k >> 10, 56320 | k & 1023);
        }
      }
      return g;
    }, Zr = (i, o) => i ? Jr(z, i, o) : "", Kr = (i, o) => {
      o = W(o), B(i, { name: o, fromWireType(l) {
        for (var f = $[l >> 2], m = l + 4, g, b, y = m, b = 0; b <= f; ++b) {
          var P = m + b;
          if (b == f || z[P] == 0) {
            var k = P - y, T = Zr(y, k);
            g === void 0 ? g = T : (g += "\0", g += T), y = P + 1;
          }
        }
        return q(l), g;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var m, g = typeof f == "string";
        g || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || E("Cannot pass non-string to std::string"), g ? m = Yr(f) : m = f.length;
        var b = We(4 + m + 1), y = b + 4;
        if ($[b >> 2] = m, g)
          Hr(f, y, m + 1);
        else if (g)
          for (var P = 0; P < m; ++P) {
            var k = f.charCodeAt(P);
            k > 255 && (q(b), E("String has UTF-16 code units that do not fit in 8 bits")), z[y + P] = k;
          }
        else
          for (var P = 0; P < m; ++P)
            z[y + P] = f[P];
        return l !== null && l.push(q, b), b;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(l) {
        q(l);
      } });
    }, St = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, qr = (i, o) => {
      for (var l = i, f = l >> 1, m = f + o / 2; !(f >= m) && pe[f]; ) ++f;
      if (l = f << 1, l - i > 32 && St) return St.decode(z.subarray(i, l));
      for (var g = "", b = 0; !(b >= o / 2); ++b) {
        var y = le[i + b * 2 >> 1];
        if (y == 0) break;
        g += String.fromCharCode(y);
      }
      return g;
    }, Xr = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 2) return 0;
      l -= 2;
      for (var f = o, m = l < i.length * 2 ? l / 2 : i.length, g = 0; g < m; ++g) {
        var b = i.charCodeAt(g);
        le[o >> 1] = b, o += 2;
      }
      return le[o >> 1] = 0, o - f;
    }, Qr = (i) => i.length * 2, en = (i, o) => {
      for (var l = 0, f = ""; !(l >= o / 4); ) {
        var m = Q[i + l * 4 >> 2];
        if (m == 0) break;
        if (++l, m >= 65536) {
          var g = m - 65536;
          f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023);
        } else
          f += String.fromCharCode(m);
      }
      return f;
    }, tn = (i, o, l) => {
      if (l ?? (l = 2147483647), l < 4) return 0;
      for (var f = o, m = f + l - 4, g = 0; g < i.length; ++g) {
        var b = i.charCodeAt(g);
        if (b >= 55296 && b <= 57343) {
          var y = i.charCodeAt(++g);
          b = 65536 + ((b & 1023) << 10) | y & 1023;
        }
        if (Q[o >> 2] = b, o += 4, o + 4 > m) break;
      }
      return Q[o >> 2] = 0, o - f;
    }, rn = (i) => {
      for (var o = 0, l = 0; l < i.length; ++l) {
        var f = i.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, o += 4;
      }
      return o;
    }, nn = (i, o, l) => {
      l = W(l);
      var f, m, g, b;
      o === 2 ? (f = qr, m = Xr, b = Qr, g = (y) => pe[y >> 1]) : o === 4 && (f = en, m = tn, b = rn, g = (y) => $[y >> 2]), B(i, { name: l, fromWireType: (y) => {
        for (var P = $[y >> 2], k, T = y + 4, L = 0; L <= P; ++L) {
          var U = y + 4 + L * o;
          if (L == P || g(U) == 0) {
            var J = U - T, Z = f(T, J);
            k === void 0 ? k = Z : (k += "\0", k += Z), T = U + o;
          }
        }
        return q(y), k;
      }, toWireType: (y, P) => {
        typeof P != "string" && E(`Cannot pass non-string to C++ string type ${l}`);
        var k = b(P), T = We(4 + k + o);
        return $[T >> 2] = k / o, m(P, T + 4, k + o), y !== null && y.push(q, T), T;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(y) {
        q(y);
      } });
    }, on = (i, o) => {
      o = W(o), B(i, { isVoid: !0, name: o, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, an = () => {
      it = !1, bt = 0;
    }, sn = (i, o, l) => {
      var f = [], m = i.toWireType(f, l);
      return f.length && ($[o >> 2] = H.toHandle(f)), m;
    }, ln = (i, o, l) => (i = H.toValue(i), o = Ne(o, "emval::as"), sn(o, l, i)), cn = (i, o) => (i = H.toValue(i), o = H.toValue(o), H.toHandle(i[o])), un = {}, dn = (i) => {
      var o = un[i];
      return o === void 0 ? W(i) : o;
    }, fn = (i) => H.toHandle(dn(i)), pn = (i) => {
      var o = H.toValue(i);
      Me(o), $e(i);
    }, mn = (i, o) => {
      i = Ne(i, "_emval_take_value");
      var l = i.readValueFromPointer(o);
      return H.toHandle(l);
    }, ge = {}, yn = () => performance.now(), hn = (i, o) => {
      if (ge[i] && (clearTimeout(ge[i].id), delete ge[i]), !o) return 0;
      var l = setTimeout(() => {
        delete ge[i], Pt(() => Cn(i, yn()));
      }, o);
      return ge[i] = { id: l, timeout_ms: o }, 0;
    }, gn = () => 2147483648, vn = (i, o) => Math.ceil(i / o) * o, bn = (i) => {
      var o = F.buffer, l = (i - o.byteLength + 65535) / 65536 | 0;
      try {
        return F.grow(l), et(), 1;
      } catch {
      }
    }, On = (i) => {
      var o = z.length;
      i >>>= 0;
      var l = gn();
      if (i > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var m = o * (1 + 0.2 / f);
        m = Math.min(m, i + 100663296);
        var g = Math.min(l, vn(Math.max(i, m), 65536)), b = bn(g);
        if (b)
          return !0;
      }
      return !1;
    };
    tr(), ue = t.BindingError = class extends Error {
      constructor(o) {
        super(o), this.name = "BindingError";
      }
    }, lt = t.InternalError = class extends Error {
      constructor(o) {
        super(o), this.name = "InternalError";
      }
    }, dr(), Or(), yt = t.UnboundTypeError = Ir(Error, "UnboundTypeError"), Fr();
    var wn = { n: Qt, u: er, m: nr, x: or, f: jr, e: kr, a: _r, v: Lr, k: xr, g: $r, l: Wr, b: Vr, d: zr, c: Gr, w: Kr, h: nn, y: on, r: an, i: ln, z: $e, j: cn, p: fn, o: pn, A: mn, s: hn, t: On, q: wt }, _ = await Zt();
    _.C;
    var Pn = _.D, We = t._malloc = _.E, q = t._free = _.F, Cn = _.G;
    t.dynCall_v = _.I, t.dynCall_ii = _.J, t.dynCall_vi = _.K, t.dynCall_i = _.L, t.dynCall_iii = _.M, t.dynCall_viii = _.N, t.dynCall_fii = _.O, t.dynCall_viif = _.P, t.dynCall_viiii = _.Q, t.dynCall_viiiiii = _.R, t.dynCall_iiiiii = _.S, t.dynCall_viiiii = _.T, t.dynCall_iiiiiii = _.U, t.dynCall_iiiiiiii = _.V, t.dynCall_viiiiiii = _.W, t.dynCall_viiiiiiiiidi = _.X, t.dynCall_viiiiiiiidi = _.Y, t.dynCall_viiiiiiiiii = _.Z, t.dynCall_viiiiiiiii = _._, t.dynCall_viiiiiiii = _.$, t.dynCall_iiiii = _.aa, t.dynCall_iiii = _.ba;
    var In = _.ca, jn = _.da, Sn = _.ea, Tn = _.fa;
    function Ue() {
      if (ie > 0) {
        me = Ue;
        return;
      }
      if ($t(), ie > 0) {
        me = Ue;
        return;
      }
      function i() {
        var o;
        t.calledRun = !0, !M && (Nt(), e(t), (o = t.onRuntimeInitialized) == null || o.call(t), Wt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), i();
      }, 1)) : i();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return Ue(), n = a, n;
  };
})();
class gi extends ri {
  getSamWasmFilePath(u, n) {
    return `${u}/smile/wasm/${n}`;
  }
  fetchSamModule(u) {
    return hi(u);
  }
}
zn(gi);
