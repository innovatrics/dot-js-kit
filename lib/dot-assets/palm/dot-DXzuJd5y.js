var So = Object.defineProperty;
var er = (p) => {
  throw TypeError(p);
};
var Co = (p, c, n) => c in p ? So(p, c, { enumerable: !0, configurable: !0, writable: !0, value: n }) : p[c] = n;
var xe = (p, c, n) => Co(p, typeof c != "symbol" ? c + "" : c, n), tr = (p, c, n) => c.has(p) || er("Cannot " + n);
var q = (p, c, n) => (tr(p, c, "read from private field"), n ? n.call(p) : c.get(p)), Ne = (p, c, n) => c.has(p) ? er("Cannot add the same private member more than once") : c instanceof WeakSet ? c.add(p) : c.set(p, n), We = (p, c, n, t) => (tr(p, c, "write to private field"), t ? t.call(p, n) : c.set(p, n), n);
const rr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Ao = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class V extends Error {
  constructor(n, t) {
    super(n);
    xe(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(n) {
  }
  static fromCameraError(n) {
    if (this.logError(n), n instanceof V)
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
    return new V(t, n);
  }
  static fromError(n) {
    if (this.logError(n), n instanceof V)
      return n;
    const t = "An unexpected error has occurred";
    return new V(t);
  }
}
const Do = {
  RGBA: "RGBA"
};
var ae, fe, ve;
class To {
  constructor(c, n) {
    Ne(this, ae);
    Ne(this, fe);
    Ne(this, ve);
    We(this, ae, c), We(this, fe, this.allocate(n.length * n.BYTES_PER_ELEMENT)), We(this, ve, this.allocate(n.length * n.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return q(this, fe);
  }
  get bgr0ImagePointer() {
    return q(this, ve);
  }
  allocate(c) {
    return q(this, ae)._malloc(c);
  }
  free() {
    q(this, ae)._free(q(this, fe)), q(this, ae)._free(q(this, ve));
  }
  writeDataToMemory(c) {
    q(this, ae).HEAPU8.set(c, q(this, fe));
  }
}
ae = new WeakMap(), fe = new WeakMap(), ve = new WeakMap();
class ko {
  constructor() {
    xe(this, "samWasmModule");
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
        throw new V(
          `The path to ${n} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${c}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new V(
          `The provided ${n} is not a valid WASM module. Please check provided path to wasm files. Current path is ${c}`
        );
    } catch (t) {
      if (t instanceof V)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Ao() ? rr.simd : rr.sam;
  }
  async initSamModule(c, n) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(n, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(c, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new V("Could not init detector.");
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
      throw new V("SAM WASM module is not initialized");
    const n = new To(this.samWasmModule, c);
    return n.writeDataToMemory(c), n;
  }
  convertToSamColorImage(c, n) {
    if (!this.samWasmModule)
      throw new V("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(c);
    return this.samWasmModule.convertToSamColorImage(
      n.width,
      n.height,
      t.rgbaImagePointer,
      Do.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
}
const ze = (p, c) => Math.hypot(c.x - p.x, c.y - p.y), Eo = (p) => {
  const { bottomLeft: c, bottomRight: n, topLeft: t, topRight: e } = p, r = ze(t, e), o = ze(e, n), d = ze(c, n), l = ze(t, c);
  return Math.min(r, o, d, l);
};
var ge = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, nr = {}, rt = {}, nt, or;
function Fo() {
  if (or) return nt;
  or = 1, nt = p;
  function p(c, n) {
    for (var t = new Array(arguments.length - 1), e = 0, r = 2, o = !0; r < arguments.length; )
      t[e++] = arguments[r++];
    return new Promise(function(d, l) {
      t[e] = function(y) {
        if (o)
          if (o = !1, y)
            l(y);
          else {
            for (var S = new Array(arguments.length - 1), m = 0; m < S.length; )
              S[m++] = arguments[m];
            d.apply(null, S);
          }
      };
      try {
        c.apply(n || null, t);
      } catch (y) {
        o && (o = !1, l(y));
      }
    });
  }
  return nt;
}
var ir = {}, ar;
function _o() {
  return ar || (ar = 1, function(p) {
    var c = p;
    c.length = function(o) {
      var d = o.length;
      if (!d)
        return 0;
      for (var l = 0; --d % 4 > 1 && o.charAt(d) === "="; )
        ++l;
      return Math.ceil(o.length * 3) / 4 - l;
    };
    for (var n = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[n[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    c.encode = function(o, d, l) {
      for (var y = null, S = [], m = 0, w = 0, j; d < l; ) {
        var I = o[d++];
        switch (w) {
          case 0:
            S[m++] = n[I >> 2], j = (I & 3) << 4, w = 1;
            break;
          case 1:
            S[m++] = n[j | I >> 4], j = (I & 15) << 2, w = 2;
            break;
          case 2:
            S[m++] = n[j | I >> 6], S[m++] = n[I & 63], w = 0;
            break;
        }
        m > 8191 && ((y || (y = [])).push(String.fromCharCode.apply(String, S)), m = 0);
      }
      return w && (S[m++] = n[j], S[m++] = 61, w === 1 && (S[m++] = 61)), y ? (m && y.push(String.fromCharCode.apply(String, S.slice(0, m))), y.join("")) : String.fromCharCode.apply(String, S.slice(0, m));
    };
    var r = "invalid encoding";
    c.decode = function(o, d, l) {
      for (var y = l, S = 0, m, w = 0; w < o.length; ) {
        var j = o.charCodeAt(w++);
        if (j === 61 && S > 1)
          break;
        if ((j = t[j]) === void 0)
          throw Error(r);
        switch (S) {
          case 0:
            m = j, S = 1;
            break;
          case 1:
            d[l++] = m << 2 | (j & 48) >> 4, m = j, S = 2;
            break;
          case 2:
            d[l++] = (m & 15) << 4 | (j & 60) >> 2, m = j, S = 3;
            break;
          case 3:
            d[l++] = (m & 3) << 6 | j, S = 0;
            break;
        }
      }
      if (S === 1)
        throw Error(r);
      return l - y;
    }, c.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  }(ir)), ir;
}
var ot, sr;
function Mo() {
  if (sr) return ot;
  sr = 1, ot = p;
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
  }, ot;
}
var it, lr;
function Ro() {
  if (lr) return it;
  lr = 1, it = p(p);
  function p(r) {
    return typeof Float32Array < "u" ? function() {
      var o = new Float32Array([-0]), d = new Uint8Array(o.buffer), l = d[3] === 128;
      function y(j, I, E) {
        o[0] = j, I[E] = d[0], I[E + 1] = d[1], I[E + 2] = d[2], I[E + 3] = d[3];
      }
      function S(j, I, E) {
        o[0] = j, I[E] = d[3], I[E + 1] = d[2], I[E + 2] = d[1], I[E + 3] = d[0];
      }
      r.writeFloatLE = l ? y : S, r.writeFloatBE = l ? S : y;
      function m(j, I) {
        return d[0] = j[I], d[1] = j[I + 1], d[2] = j[I + 2], d[3] = j[I + 3], o[0];
      }
      function w(j, I) {
        return d[3] = j[I], d[2] = j[I + 1], d[1] = j[I + 2], d[0] = j[I + 3], o[0];
      }
      r.readFloatLE = l ? m : w, r.readFloatBE = l ? w : m;
    }() : function() {
      function o(l, y, S, m) {
        var w = y < 0 ? 1 : 0;
        if (w && (y = -y), y === 0)
          l(1 / y > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), S, m);
        else if (isNaN(y))
          l(2143289344, S, m);
        else if (y > 34028234663852886e22)
          l((w << 31 | 2139095040) >>> 0, S, m);
        else if (y < 11754943508222875e-54)
          l((w << 31 | Math.round(y / 1401298464324817e-60)) >>> 0, S, m);
        else {
          var j = Math.floor(Math.log(y) / Math.LN2), I = Math.round(y * Math.pow(2, -j) * 8388608) & 8388607;
          l((w << 31 | j + 127 << 23 | I) >>> 0, S, m);
        }
      }
      r.writeFloatLE = o.bind(null, c), r.writeFloatBE = o.bind(null, n);
      function d(l, y, S) {
        var m = l(y, S), w = (m >> 31) * 2 + 1, j = m >>> 23 & 255, I = m & 8388607;
        return j === 255 ? I ? NaN : w * (1 / 0) : j === 0 ? w * 1401298464324817e-60 * I : w * Math.pow(2, j - 150) * (I + 8388608);
      }
      r.readFloatLE = d.bind(null, t), r.readFloatBE = d.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var o = new Float64Array([-0]), d = new Uint8Array(o.buffer), l = d[7] === 128;
      function y(j, I, E) {
        o[0] = j, I[E] = d[0], I[E + 1] = d[1], I[E + 2] = d[2], I[E + 3] = d[3], I[E + 4] = d[4], I[E + 5] = d[5], I[E + 6] = d[6], I[E + 7] = d[7];
      }
      function S(j, I, E) {
        o[0] = j, I[E] = d[7], I[E + 1] = d[6], I[E + 2] = d[5], I[E + 3] = d[4], I[E + 4] = d[3], I[E + 5] = d[2], I[E + 6] = d[1], I[E + 7] = d[0];
      }
      r.writeDoubleLE = l ? y : S, r.writeDoubleBE = l ? S : y;
      function m(j, I) {
        return d[0] = j[I], d[1] = j[I + 1], d[2] = j[I + 2], d[3] = j[I + 3], d[4] = j[I + 4], d[5] = j[I + 5], d[6] = j[I + 6], d[7] = j[I + 7], o[0];
      }
      function w(j, I) {
        return d[7] = j[I], d[6] = j[I + 1], d[5] = j[I + 2], d[4] = j[I + 3], d[3] = j[I + 4], d[2] = j[I + 5], d[1] = j[I + 6], d[0] = j[I + 7], o[0];
      }
      r.readDoubleLE = l ? m : w, r.readDoubleBE = l ? w : m;
    }() : function() {
      function o(l, y, S, m, w, j) {
        var I = m < 0 ? 1 : 0;
        if (I && (m = -m), m === 0)
          l(0, w, j + y), l(1 / m > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), w, j + S);
        else if (isNaN(m))
          l(0, w, j + y), l(2146959360, w, j + S);
        else if (m > 17976931348623157e292)
          l(0, w, j + y), l((I << 31 | 2146435072) >>> 0, w, j + S);
        else {
          var E;
          if (m < 22250738585072014e-324)
            E = m / 5e-324, l(E >>> 0, w, j + y), l((I << 31 | E / 4294967296) >>> 0, w, j + S);
          else {
            var O = Math.floor(Math.log(m) / Math.LN2);
            O === 1024 && (O = 1023), E = m * Math.pow(2, -O), l(E * 4503599627370496 >>> 0, w, j + y), l((I << 31 | O + 1023 << 20 | E * 1048576 & 1048575) >>> 0, w, j + S);
          }
        }
      }
      r.writeDoubleLE = o.bind(null, c, 0, 4), r.writeDoubleBE = o.bind(null, n, 4, 0);
      function d(l, y, S, m, w) {
        var j = l(m, w + y), I = l(m, w + S), E = (I >> 31) * 2 + 1, O = I >>> 20 & 2047, D = 4294967296 * (I & 1048575) + j;
        return O === 2047 ? D ? NaN : E * (1 / 0) : O === 0 ? E * 5e-324 * D : E * Math.pow(2, O - 1075) * (D + 4503599627370496);
      }
      r.readDoubleLE = d.bind(null, t, 0, 4), r.readDoubleBE = d.bind(null, e, 4, 0);
    }(), r;
  }
  function c(r, o, d) {
    o[d] = r & 255, o[d + 1] = r >>> 8 & 255, o[d + 2] = r >>> 16 & 255, o[d + 3] = r >>> 24;
  }
  function n(r, o, d) {
    o[d] = r >>> 24, o[d + 1] = r >>> 16 & 255, o[d + 2] = r >>> 8 & 255, o[d + 3] = r & 255;
  }
  function t(r, o) {
    return (r[o] | r[o + 1] << 8 | r[o + 2] << 16 | r[o + 3] << 24) >>> 0;
  }
  function e(r, o) {
    return (r[o] << 24 | r[o + 1] << 16 | r[o + 2] << 8 | r[o + 3]) >>> 0;
  }
  return it;
}
function cr(p) {
  throw new Error('Could not dynamically require "' + p + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var at, dr;
function Lo() {
  if (dr) return at;
  dr = 1, at = p;
  function p(c) {
    try {
      if (typeof cr != "function")
        return null;
      var n = cr(c);
      return n && (n.length || Object.keys(n).length) ? n : null;
    } catch {
      return null;
    }
  }
  return at;
}
var ur = {}, fr;
function xo() {
  return fr || (fr = 1, function(p) {
    var c = p;
    c.length = function(n) {
      for (var t = 0, e = 0, r = 0; r < n.length; ++r)
        e = n.charCodeAt(r), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (n.charCodeAt(r + 1) & 64512) === 56320 ? (++r, t += 4) : t += 3;
      return t;
    }, c.read = function(n, t, e) {
      var r = e - t;
      if (r < 1)
        return "";
      for (var o = null, d = [], l = 0, y; t < e; )
        y = n[t++], y < 128 ? d[l++] = y : y > 191 && y < 224 ? d[l++] = (y & 31) << 6 | n[t++] & 63 : y > 239 && y < 365 ? (y = ((y & 7) << 18 | (n[t++] & 63) << 12 | (n[t++] & 63) << 6 | n[t++] & 63) - 65536, d[l++] = 55296 + (y >> 10), d[l++] = 56320 + (y & 1023)) : d[l++] = (y & 15) << 12 | (n[t++] & 63) << 6 | n[t++] & 63, l > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, d)), l = 0);
      return o ? (l && o.push(String.fromCharCode.apply(String, d.slice(0, l))), o.join("")) : String.fromCharCode.apply(String, d.slice(0, l));
    }, c.write = function(n, t, e) {
      for (var r = e, o, d, l = 0; l < n.length; ++l)
        o = n.charCodeAt(l), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((d = n.charCodeAt(l + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (d & 1023), ++l, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - r;
    };
  }(ur)), ur;
}
var st, pr;
function No() {
  if (pr) return st;
  pr = 1, st = p;
  function p(c, n, t) {
    var e = t || 8192, r = e >>> 1, o = null, d = e;
    return function(l) {
      if (l < 1 || l > r)
        return c(l);
      d + l > e && (o = c(e), d = 0);
      var y = n.call(o, d, d += l);
      return d & 7 && (d = (d | 7) + 1), y;
    };
  }
  return st;
}
var lt, mr;
function Wo() {
  if (mr) return lt;
  mr = 1, lt = c;
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
    var d = r >>> 0, l = (r - d) / 4294967296 >>> 0;
    return o && (l = ~l >>> 0, d = ~d >>> 0, ++d > 4294967295 && (d = 0, ++l > 4294967295 && (l = 0))), new c(d, l);
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
      var o = ~this.lo + 1 >>> 0, d = ~this.hi >>> 0;
      return o || (d = d + 1 >>> 0), -(o + d * 4294967296);
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
    var r = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, d = this.hi >>> 24;
    return d === 0 ? o === 0 ? r < 16384 ? r < 128 ? 1 : 2 : r < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : d < 128 ? 9 : 10;
  }, lt;
}
var hr;
function pe() {
  return hr || (hr = 1, function(p) {
    var c = p;
    c.asPromise = Fo(), c.base64 = _o(), c.EventEmitter = Mo(), c.float = Ro(), c.inquire = Lo(), c.utf8 = xo(), c.pool = No(), c.LongBits = Wo(), c.isNode = !!(typeof ge < "u" && ge && ge.process && ge.process.versions && ge.process.versions.node), c.global = c.isNode && ge || typeof window < "u" && window || typeof self < "u" && self || rt, c.emptyArray = Object.freeze ? Object.freeze([]) : (
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
      for (var d = Object.keys(r), l = 0; l < d.length; ++l)
        (e[d[l]] === void 0 || !o) && (e[d[l]] = r[d[l]]);
      return e;
    }
    c.merge = n, c.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function r(o, d) {
        if (!(this instanceof r))
          return new r(o, d);
        Object.defineProperty(this, "message", { get: function() {
          return o;
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
    c.newError = t, c.ProtocolError = t("ProtocolError"), c.oneOfGetter = function(e) {
      for (var r = {}, o = 0; o < e.length; ++o)
        r[e[o]] = 1;
      return function() {
        for (var d = Object.keys(this), l = d.length - 1; l > -1; --l)
          if (r[d[l]] === 1 && this[d[l]] !== void 0 && this[d[l]] !== null)
            return d[l];
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
  }(rt)), rt;
}
var ct, yr;
function Tr() {
  if (yr) return ct;
  yr = 1, ct = l;
  var p = pe(), c, n = p.LongBits, t = p.base64, e = p.utf8;
  function r(O, D, M) {
    this.fn = O, this.len = D, this.next = void 0, this.val = M;
  }
  function o() {
  }
  function d(O) {
    this.head = O.head, this.tail = O.tail, this.len = O.len, this.next = O.states;
  }
  function l() {
    this.len = 0, this.head = new r(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var y = function() {
    return p.Buffer ? function() {
      return (l.create = function() {
        return new c();
      })();
    } : function() {
      return new l();
    };
  };
  l.create = y(), l.alloc = function(O) {
    return new p.Array(O);
  }, p.Array !== Array && (l.alloc = p.pool(l.alloc, p.Array.prototype.subarray)), l.prototype._push = function(O, D, M) {
    return this.tail = this.tail.next = new r(O, D, M), this.len += D, this;
  };
  function S(O, D, M) {
    D[M] = O & 255;
  }
  function m(O, D, M) {
    for (; O > 127; )
      D[M++] = O & 127 | 128, O >>>= 7;
    D[M] = O;
  }
  function w(O, D) {
    this.len = O, this.next = void 0, this.val = D;
  }
  w.prototype = Object.create(r.prototype), w.prototype.fn = m, l.prototype.uint32 = function(O) {
    return this.len += (this.tail = this.tail.next = new w(
      (O = O >>> 0) < 128 ? 1 : O < 16384 ? 2 : O < 2097152 ? 3 : O < 268435456 ? 4 : 5,
      O
    )).len, this;
  }, l.prototype.int32 = function(O) {
    return O < 0 ? this._push(j, 10, n.fromNumber(O)) : this.uint32(O);
  }, l.prototype.sint32 = function(O) {
    return this.uint32((O << 1 ^ O >> 31) >>> 0);
  };
  function j(O, D, M) {
    for (; O.hi; )
      D[M++] = O.lo & 127 | 128, O.lo = (O.lo >>> 7 | O.hi << 25) >>> 0, O.hi >>>= 7;
    for (; O.lo > 127; )
      D[M++] = O.lo & 127 | 128, O.lo = O.lo >>> 7;
    D[M++] = O.lo;
  }
  l.prototype.uint64 = function(O) {
    var D = n.from(O);
    return this._push(j, D.length(), D);
  }, l.prototype.int64 = l.prototype.uint64, l.prototype.sint64 = function(O) {
    var D = n.from(O).zzEncode();
    return this._push(j, D.length(), D);
  }, l.prototype.bool = function(O) {
    return this._push(S, 1, O ? 1 : 0);
  };
  function I(O, D, M) {
    D[M] = O & 255, D[M + 1] = O >>> 8 & 255, D[M + 2] = O >>> 16 & 255, D[M + 3] = O >>> 24;
  }
  l.prototype.fixed32 = function(O) {
    return this._push(I, 4, O >>> 0);
  }, l.prototype.sfixed32 = l.prototype.fixed32, l.prototype.fixed64 = function(O) {
    var D = n.from(O);
    return this._push(I, 4, D.lo)._push(I, 4, D.hi);
  }, l.prototype.sfixed64 = l.prototype.fixed64, l.prototype.float = function(O) {
    return this._push(p.float.writeFloatLE, 4, O);
  }, l.prototype.double = function(O) {
    return this._push(p.float.writeDoubleLE, 8, O);
  };
  var E = p.Array.prototype.set ? function(O, D, M) {
    D.set(O, M);
  } : function(O, D, M) {
    for (var X = 0; X < O.length; ++X)
      D[M + X] = O[X];
  };
  return l.prototype.bytes = function(O) {
    var D = O.length >>> 0;
    if (!D)
      return this._push(S, 1, 0);
    if (p.isString(O)) {
      var M = l.alloc(D = t.length(O));
      t.decode(O, M, 0), O = M;
    }
    return this.uint32(D)._push(E, D, O);
  }, l.prototype.string = function(O) {
    var D = e.length(O);
    return D ? this.uint32(D)._push(e.write, D, O) : this._push(S, 1, 0);
  }, l.prototype.fork = function() {
    return this.states = new d(this), this.head = this.tail = new r(o, 0, 0), this.len = 0, this;
  }, l.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new r(o, 0, 0), this.len = 0), this;
  }, l.prototype.ldelim = function() {
    var O = this.head, D = this.tail, M = this.len;
    return this.reset().uint32(M), M && (this.tail.next = O.next, this.tail = D, this.len += M), this;
  }, l.prototype.finish = function() {
    for (var O = this.head.next, D = this.constructor.alloc(this.len), M = 0; O; )
      O.fn(O.val, D, M), M += O.len, O = O.next;
    return D;
  }, l._configure = function(O) {
    c = O, l.create = y(), c._configure();
  }, ct;
}
var dt, gr;
function zo() {
  if (gr) return dt;
  gr = 1, dt = n;
  var p = Tr();
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
      else for (var d = 0; d < e.length; )
        r[o++] = e[d++];
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
  }, n._configure(), dt;
}
var ut, br;
function kr() {
  if (br) return ut;
  br = 1, ut = r;
  var p = pe(), c, n = p.LongBits, t = p.utf8;
  function e(m, w) {
    return RangeError("index out of range: " + m.pos + " + " + (w || 1) + " > " + m.len);
  }
  function r(m) {
    this.buf = m, this.pos = 0, this.len = m.length;
  }
  var o = typeof Uint8Array < "u" ? function(m) {
    if (m instanceof Uint8Array || Array.isArray(m))
      return new r(m);
    throw Error("illegal buffer");
  } : function(m) {
    if (Array.isArray(m))
      return new r(m);
    throw Error("illegal buffer");
  }, d = function() {
    return p.Buffer ? function(m) {
      return (r.create = function(w) {
        return p.Buffer.isBuffer(w) ? new c(w) : o(w);
      })(m);
    } : o;
  };
  r.create = d(), r.prototype._slice = p.Array.prototype.subarray || /* istanbul ignore next */
  p.Array.prototype.slice, r.prototype.uint32 = /* @__PURE__ */ function() {
    var m = 4294967295;
    return function() {
      if (m = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (m = (m | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (m = (m | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (m = (m | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (m = (m | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return m;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return m;
    };
  }(), r.prototype.int32 = function() {
    return this.uint32() | 0;
  }, r.prototype.sint32 = function() {
    var m = this.uint32();
    return m >>> 1 ^ -(m & 1) | 0;
  };
  function l() {
    var m = new n(0, 0), w = 0;
    if (this.len - this.pos > 4) {
      for (; w < 4; ++w)
        if (m.lo = (m.lo | (this.buf[this.pos] & 127) << w * 7) >>> 0, this.buf[this.pos++] < 128)
          return m;
      if (m.lo = (m.lo | (this.buf[this.pos] & 127) << 28) >>> 0, m.hi = (m.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return m;
      w = 0;
    } else {
      for (; w < 3; ++w) {
        if (this.pos >= this.len)
          throw e(this);
        if (m.lo = (m.lo | (this.buf[this.pos] & 127) << w * 7) >>> 0, this.buf[this.pos++] < 128)
          return m;
      }
      return m.lo = (m.lo | (this.buf[this.pos++] & 127) << w * 7) >>> 0, m;
    }
    if (this.len - this.pos > 4) {
      for (; w < 5; ++w)
        if (m.hi = (m.hi | (this.buf[this.pos] & 127) << w * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return m;
    } else
      for (; w < 5; ++w) {
        if (this.pos >= this.len)
          throw e(this);
        if (m.hi = (m.hi | (this.buf[this.pos] & 127) << w * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return m;
      }
    throw Error("invalid varint encoding");
  }
  r.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function y(m, w) {
    return (m[w - 4] | m[w - 3] << 8 | m[w - 2] << 16 | m[w - 1] << 24) >>> 0;
  }
  r.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return y(this.buf, this.pos += 4);
  }, r.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return y(this.buf, this.pos += 4) | 0;
  };
  function S() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new n(y(this.buf, this.pos += 4), y(this.buf, this.pos += 4));
  }
  return r.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var m = p.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, m;
  }, r.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var m = p.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, m;
  }, r.prototype.bytes = function() {
    var m = this.uint32(), w = this.pos, j = this.pos + m;
    if (j > this.len)
      throw e(this, m);
    if (this.pos += m, Array.isArray(this.buf))
      return this.buf.slice(w, j);
    if (w === j) {
      var I = p.Buffer;
      return I ? I.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, w, j);
  }, r.prototype.string = function() {
    var m = this.bytes();
    return t.read(m, 0, m.length);
  }, r.prototype.skip = function(m) {
    if (typeof m == "number") {
      if (this.pos + m > this.len)
        throw e(this, m);
      this.pos += m;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, r.prototype.skipType = function(m) {
    switch (m) {
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
        for (; (m = this.uint32() & 7) !== 4; )
          this.skipType(m);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + m + " at offset " + this.pos);
    }
    return this;
  }, r._configure = function(m) {
    c = m, r.create = d(), c._configure();
    var w = p.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    p.merge(r.prototype, {
      int64: function() {
        return l.call(this)[w](!1);
      },
      uint64: function() {
        return l.call(this)[w](!0);
      },
      sint64: function() {
        return l.call(this).zzDecode()[w](!1);
      },
      fixed64: function() {
        return S.call(this)[w](!0);
      },
      sfixed64: function() {
        return S.call(this)[w](!1);
      }
    });
  }, ut;
}
var ft, vr;
function Uo() {
  if (vr) return ft;
  vr = 1, ft = n;
  var p = kr();
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
  }, n._configure(), ft;
}
var Or = {}, pt, wr;
function $o() {
  if (wr) return pt;
  wr = 1, pt = c;
  var p = pe();
  (c.prototype = Object.create(p.EventEmitter.prototype)).constructor = c;
  function c(n, t, e) {
    if (typeof n != "function")
      throw TypeError("rpcImpl must be a function");
    p.EventEmitter.call(this), this.rpcImpl = n, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return c.prototype.rpcCall = function n(t, e, r, o, d) {
    if (!o)
      throw TypeError("request must be specified");
    var l = this;
    if (!d)
      return p.asPromise(n, l, t, e, r, o);
    if (!l.rpcImpl) {
      setTimeout(function() {
        d(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return l.rpcImpl(
        t,
        e[l.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(y, S) {
          if (y)
            return l.emit("error", y, t), d(y);
          if (S === null) {
            l.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(S instanceof r))
            try {
              S = r[l.responseDelimited ? "decodeDelimited" : "decode"](S);
            } catch (m) {
              return l.emit("error", m, t), d(m);
            }
          return l.emit("data", S, t), d(null, S);
        }
      );
    } catch (y) {
      l.emit("error", y, t), setTimeout(function() {
        d(y);
      }, 0);
      return;
    }
  }, c.prototype.end = function(n) {
    return this.rpcImpl && (n || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, pt;
}
var Pr;
function Go() {
  return Pr || (Pr = 1, function(p) {
    var c = p;
    c.Service = $o();
  }(Or)), Or;
}
var jr, Ir;
function Bo() {
  return Ir || (Ir = 1, jr = {}), jr;
}
var Sr;
function Vo() {
  return Sr || (Sr = 1, function(p) {
    var c = p;
    c.build = "minimal", c.Writer = Tr(), c.BufferWriter = zo(), c.Reader = kr(), c.BufferReader = Uo(), c.util = pe(), c.rpc = Go(), c.roots = Bo(), c.configure = n;
    function n() {
      c.util._configure(), c.Writer._configure(c.BufferWriter), c.Reader._configure(c.BufferReader);
    }
    n();
  }(nr)), nr;
}
var Cr, Ar;
function Ho() {
  return Ar || (Ar = 1, Cr = Vo()), Cr;
}
var _ = Ho();
const g = _.Reader, L = _.Writer, u = _.util, i = _.roots.default || (_.roots.default = {});
i.dot = (() => {
  const p = {};
  return p.Content = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.token = u.newBuffer([]), c.prototype.iv = u.newBuffer([]), c.prototype.schemaVersion = 0, c.prototype.bytes = u.newBuffer([]), c.create = function(n) {
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
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Content();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
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
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.token != null && n.hasOwnProperty("token") && !(n.token && typeof n.token.length == "number" || u.isString(n.token)) ? "token: buffer expected" : n.iv != null && n.hasOwnProperty("iv") && !(n.iv && typeof n.iv.length == "number" || u.isString(n.iv)) ? "iv: buffer expected" : n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && !u.isInteger(n.schemaVersion) ? "schemaVersion: integer expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || u.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.Content)
        return n;
      let t = new i.dot.Content();
      return n.token != null && (typeof n.token == "string" ? u.base64.decode(n.token, t.token = u.newBuffer(u.base64.length(n.token)), 0) : n.token.length >= 0 && (t.token = n.token)), n.iv != null && (typeof n.iv == "string" ? u.base64.decode(n.iv, t.iv = u.newBuffer(u.base64.length(n.iv)), 0) : n.iv.length >= 0 && (t.iv = n.iv)), n.schemaVersion != null && (t.schemaVersion = n.schemaVersion | 0), n.bytes != null && (typeof n.bytes == "string" ? u.base64.decode(n.bytes, t.bytes = u.newBuffer(u.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = u.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = u.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = u.newBuffer(e.bytes)))), n.token != null && n.hasOwnProperty("token") && (e.token = t.bytes === String ? u.base64.encode(n.token, 0, n.token.length) : t.bytes === Array ? Array.prototype.slice.call(n.token) : n.token), n.iv != null && n.hasOwnProperty("iv") && (e.iv = t.bytes === String ? u.base64.encode(n.iv, 0, n.iv.length) : t.bytes === Array ? Array.prototype.slice.call(n.iv) : n.iv), n.schemaVersion != null && n.hasOwnProperty("schemaVersion") && (e.schemaVersion = n.schemaVersion), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? u.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, _.util.toJSONOptions);
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
      n.prototype.images = u.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: u.oneOfGetter(t = ["video"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.images && l.images.length || (l.images = []), l.images.push(i.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              l.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
          for (let d = 0; d < e.images.length; ++d)
            o.images[d] = i.dot.Image.toObject(e.images[d], r);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["sessionToken"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "metadata", {
        get: u.oneOfGetter(t = ["web", "android", "ios"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.Metadata();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.platform = e.int32();
              break;
            }
            case 5: {
              l.sessionToken = e.string();
              break;
            }
            case 6: {
              l.componentVersion = e.string();
              break;
            }
            case 2: {
              l.web = i.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.android = i.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              l.ios = i.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (r._sessionToken = 1, !u.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !u.isString(e.componentVersion))
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, n;
    }(), c.AndroidMetadata = function() {
      function n(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.supportedAbis = u.emptyArray, n.prototype.device = null, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = u.emptyArray, n.prototype.digestsWithTimestamp = u.emptyArray, n.prototype.dynamicCameraFrameProperties = u.emptyObject, n.prototype.tamperingIndicators = null, n.prototype.croppedYuv420Image = null;
      let t;
      return Object.defineProperty(n.prototype, "_device", {
        get: u.oneOfGetter(t = ["device"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_camera", {
        get: u.oneOfGetter(t = ["camera"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: u.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_tamperingIndicators", {
        get: u.oneOfGetter(t = ["tamperingIndicators"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: u.oneOfGetter(t = ["croppedYuv420Image"]),
        set: u.oneOfSetter(t)
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
          for (let o = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < o.length; ++d)
            r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[d]), i.dot.Int32List.encode(e.dynamicCameraFrameProperties[o[d]], r.uint32(
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
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.AndroidMetadata(), y, S;
        for (; e.pos < d; ) {
          let m = e.uint32();
          if (m === o)
            break;
          switch (m >>> 3) {
            case 1: {
              l.supportedAbis && l.supportedAbis.length || (l.supportedAbis = []), l.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              l.device = e.string();
              break;
            }
            case 6: {
              l.camera = i.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              l.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.digests && l.digests.length || (l.digests = []), l.digests.push(e.bytes());
              break;
            }
            case 5: {
              l.digestsWithTimestamp && l.digestsWithTimestamp.length || (l.digestsWithTimestamp = []), l.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              l.dynamicCameraFrameProperties === u.emptyObject && (l.dynamicCameraFrameProperties = {});
              let w = e.uint32() + e.pos;
              for (y = "", S = null; e.pos < w; ) {
                let j = e.uint32();
                switch (j >>> 3) {
                  case 1:
                    y = e.string();
                    break;
                  case 2:
                    S = i.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(j & 7);
                    break;
                }
              }
              l.dynamicCameraFrameProperties[y] = S;
              break;
            }
            case 8: {
              l.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              l.croppedYuv420Image = i.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(m & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let r = 0; r < e.supportedAbis.length; ++r)
            if (!u.isString(e.supportedAbis[r]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !u.isString(e.device))
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
            if (!(e.digests[r] && typeof e.digests[r].length == "number" || u.isString(e.digests[r])))
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
          if (!u.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let r = Object.keys(e.dynamicCameraFrameProperties);
          for (let o = 0; o < r.length; ++o) {
            let d = i.dot.Int32List.verify(e.dynamicCameraFrameProperties[r[o]]);
            if (d)
              return "dynamicCameraFrameProperties." + d;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || u.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let r = i.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (r)
            return "croppedYuv420Image." + r;
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
            typeof e.digests[o] == "string" ? u.base64.decode(e.digests[o], r.digests[o] = u.newBuffer(u.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (r.digests[o] = e.digests[o]);
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
          for (let o = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < o.length; ++d) {
            if (typeof e.dynamicCameraFrameProperties[o[d]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            r.dynamicCameraFrameProperties[o[d]] = i.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[o[d]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? u.base64.decode(e.tamperingIndicators, r.tamperingIndicators = u.newBuffer(u.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (r.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          r.croppedYuv420Image = i.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.supportedAbis = [], o.digests = [], o.digestsWithTimestamp = []), (r.objects || r.defaults) && (o.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          o.supportedAbis = [];
          for (let l = 0; l < e.supportedAbis.length; ++l)
            o.supportedAbis[l] = e.supportedAbis[l];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, r.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let l = 0; l < e.digests.length; ++l)
            o.digests[l] = r.bytes === String ? u.base64.encode(e.digests[l], 0, e.digests[l].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[l]) : e.digests[l];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let l = 0; l < d.length; ++l)
            o.dynamicCameraFrameProperties[d[l]] = i.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[l]], r);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let l = 0; l < e.digestsWithTimestamp.length; ++l)
            o.digestsWithTimestamp[l] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[l], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.AndroidCamera.toObject(e.camera, r), r.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = r.bytes === String ? u.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : r.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, r.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.AndroidCamera();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = i.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !u.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, n;
    }(), c.Yuv420Image = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = u.newBuffer([]), n.prototype.uPlane = u.newBuffer([]), n.prototype.vPlane = u.newBuffer([]), n.create = function(t) {
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.Yuv420Image();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.size = i.dot.ImageSize.decode(t, t.uint32());
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
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = i.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || u.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || u.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || u.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.Yuv420Image)
          return t;
        let e = new i.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = i.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? u.base64.decode(t.yPlane, e.yPlane = u.newBuffer(u.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? u.base64.decode(t.uPlane, e.uPlane = u.newBuffer(u.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? u.base64.decode(t.vPlane, e.vPlane = u.newBuffer(u.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.size = null, e.bytes === String ? r.yPlane = "" : (r.yPlane = [], e.bytes !== Array && (r.yPlane = u.newBuffer(r.yPlane))), e.bytes === String ? r.uPlane = "" : (r.uPlane = [], e.bytes !== Array && (r.uPlane = u.newBuffer(r.uPlane))), e.bytes === String ? r.vPlane = "" : (r.vPlane = [], e.bytes !== Array && (r.vPlane = u.newBuffer(r.vPlane)))), t.size != null && t.hasOwnProperty("size") && (r.size = i.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (r.yPlane = e.bytes === String ? u.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (r.uPlane = e.bytes === String ? u.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (r.vPlane = e.bytes === String ? u.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, n;
    }(), c.IosMetadata = function() {
      function n(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.cameraModelId = "", n.prototype.architectureInfo = u.emptyObject, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = u.emptyArray, n.prototype.digestsWithTimestamp = u.emptyArray, n.prototype.isoValues = u.emptyArray, n.prototype.croppedYuv420Image = null;
      let t;
      return Object.defineProperty(n.prototype, "_camera", {
        get: u.oneOfGetter(t = ["camera"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: u.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: u.oneOfGetter(t = ["croppedYuv420Image"]),
        set: u.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r) {
        if (r || (r = L.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let o = Object.keys(e.architectureInfo), d = 0; d < o.length; ++d)
            r.uint32(
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
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.IosMetadata(), y, S;
        for (; e.pos < d; ) {
          let m = e.uint32();
          if (m === o)
            break;
          switch (m >>> 3) {
            case 1: {
              l.cameraModelId = e.string();
              break;
            }
            case 2: {
              l.architectureInfo === u.emptyObject && (l.architectureInfo = {});
              let w = e.uint32() + e.pos;
              for (y = "", S = !1; e.pos < w; ) {
                let j = e.uint32();
                switch (j >>> 3) {
                  case 1:
                    y = e.string();
                    break;
                  case 2:
                    S = e.bool();
                    break;
                  default:
                    e.skipType(j & 7);
                    break;
                }
              }
              l.architectureInfo[y] = S;
              break;
            }
            case 6: {
              l.camera = i.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              l.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.digests && l.digests.length || (l.digests = []), l.digests.push(e.bytes());
              break;
            }
            case 5: {
              l.digestsWithTimestamp && l.digestsWithTimestamp.length || (l.digestsWithTimestamp = []), l.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (l.isoValues && l.isoValues.length || (l.isoValues = []), (m & 7) === 2) {
                let w = e.uint32() + e.pos;
                for (; e.pos < w; )
                  l.isoValues.push(e.int32());
              } else
                l.isoValues.push(e.int32());
              break;
            }
            case 8: {
              l.croppedYuv420Image = i.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(m & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !u.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!u.isObject(e.architectureInfo))
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
            if (!(e.digests[r] && typeof e.digests[r].length == "number" || u.isString(e.digests[r])))
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
            if (!u.isInteger(e.isoValues[r]))
              return "isoValues: integer[] expected";
        }
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let r = i.dot.v4.IosYuv420Image.verify(e.croppedYuv420Image);
          if (r)
            return "croppedYuv420Image." + r;
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
          for (let o = Object.keys(e.architectureInfo), d = 0; d < o.length; ++d)
            r.architectureInfo[o[d]] = !!e.architectureInfo[o[d]];
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
            typeof e.digests[o] == "string" ? u.base64.decode(e.digests[o], r.digests[o] = u.newBuffer(u.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (r.digests[o] = e.digests[o]);
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
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        (r.arrays || r.defaults) && (o.digests = [], o.isoValues = [], o.digestsWithTimestamp = []), (r.objects || r.defaults) && (o.architectureInfo = {}), r.defaults && (o.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (o.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          o.architectureInfo = {};
          for (let l = 0; l < d.length; ++l)
            o.architectureInfo[d[l]] = e.architectureInfo[d[l]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let l = 0; l < e.digests.length; ++l)
            o.digests[l] = r.bytes === String ? u.base64.encode(e.digests[l], 0, e.digests[l].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[l]) : e.digests[l];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let l = 0; l < e.isoValues.length; ++l)
            o.isoValues[l] = e.isoValues[l];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let l = 0; l < e.digestsWithTimestamp.length; ++l)
            o.digestsWithTimestamp[l] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[l], r);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.IosCamera.toObject(e.camera, r), r.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r), r.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, r), r.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.IosCamera();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = i.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !u.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, n;
    }(), c.IosYuv420Image = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = u.newBuffer([]), n.prototype.uvPlane = u.newBuffer([]), n.create = function(t) {
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.IosYuv420Image();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.size = i.dot.ImageSize.decode(t, t.uint32());
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
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = i.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || u.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uvPlane != null && t.hasOwnProperty("uvPlane") && !(t.uvPlane && typeof t.uvPlane.length == "number" || u.isString(t.uvPlane)) ? "uvPlane: buffer expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosYuv420Image)
          return t;
        let e = new i.dot.v4.IosYuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.IosYuv420Image.size: object expected");
          e.size = i.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? u.base64.decode(t.yPlane, e.yPlane = u.newBuffer(u.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uvPlane != null && (typeof t.uvPlane == "string" ? u.base64.decode(t.uvPlane, e.uvPlane = u.newBuffer(u.base64.length(t.uvPlane)), 0) : t.uvPlane.length >= 0 && (e.uvPlane = t.uvPlane)), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        return e.defaults && (r.size = null, e.bytes === String ? r.yPlane = "" : (r.yPlane = [], e.bytes !== Array && (r.yPlane = u.newBuffer(r.yPlane))), e.bytes === String ? r.uvPlane = "" : (r.uvPlane = [], e.bytes !== Array && (r.uvPlane = u.newBuffer(r.uvPlane)))), t.size != null && t.hasOwnProperty("size") && (r.size = i.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (r.yPlane = e.bytes === String ? u.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uvPlane != null && t.hasOwnProperty("uvPlane") && (r.uvPlane = e.bytes === String ? u.base64.encode(t.uvPlane, 0, t.uvPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uvPlane) : t.uvPlane), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, n;
    }(), c.WebMetadata = function() {
      function n(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && (this[r[o]] = e[r[o]]);
      }
      n.prototype.currentCameraProperties = null, n.prototype.availableCameraProperties = u.emptyArray, n.prototype.hashedDetectedImages = u.emptyArray, n.prototype.hashedDetectedImagesWithTimestamp = u.emptyArray, n.prototype.detectionRecord = u.emptyArray, n.prototype.croppedImage = null;
      let t;
      return Object.defineProperty(n.prototype, "_croppedImage", {
        get: u.oneOfGetter(t = ["croppedImage"]),
        set: u.oneOfSetter(t)
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
        ).fork()).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o) {
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.WebMetadata();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.currentCameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.availableCameraProperties && l.availableCameraProperties.length || (l.availableCameraProperties = []), l.availableCameraProperties.push(i.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              l.hashedDetectedImages && l.hashedDetectedImages.length || (l.hashedDetectedImages = []), l.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              l.hashedDetectedImagesWithTimestamp && l.hashedDetectedImagesWithTimestamp.length || (l.hashedDetectedImagesWithTimestamp = []), l.hashedDetectedImagesWithTimestamp.push(i.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              l.detectionRecord && l.detectionRecord.length || (l.detectionRecord = []), l.detectionRecord.push(i.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              l.croppedImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
            if (!u.isString(e.hashedDetectedImages[r]))
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
        return r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        if ((r.arrays || r.defaults) && (o.availableCameraProperties = [], o.hashedDetectedImages = [], o.detectionRecord = [], o.hashedDetectedImagesWithTimestamp = []), r.defaults && (o.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (o.currentCameraProperties = i.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, r)), e.availableCameraProperties && e.availableCameraProperties.length) {
          o.availableCameraProperties = [];
          for (let d = 0; d < e.availableCameraProperties.length; ++d)
            o.availableCameraProperties[d] = i.dot.v4.CameraProperties.toObject(e.availableCameraProperties[d], r);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          o.hashedDetectedImages = [];
          for (let d = 0; d < e.hashedDetectedImages.length; ++d)
            o.hashedDetectedImages[d] = e.hashedDetectedImages[d];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          o.detectionRecord = [];
          for (let d = 0; d < e.detectionRecord.length; ++d)
            o.detectionRecord[d] = i.dot.v4.DetectedObject.toObject(e.detectionRecord[d], r);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          o.hashedDetectedImagesWithTimestamp = [];
          for (let d = 0; d < e.hashedDetectedImagesWithTimestamp.length; ++d)
            o.hashedDetectedImagesWithTimestamp[d] = i.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[d], r);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (o.croppedImage = i.dot.Image.toObject(e.croppedImage, r), r.oneofs && (o._croppedImage = "croppedImage")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, n;
    }(), c.HashedDetectedImageWithTimestamp = function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.imageHash = "", n.prototype.timestampMillis = u.Long ? u.Long.fromBits(0, 0, !0) : 0, n.create = function(t) {
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.imageHash = t.string();
              break;
            }
            case 2: {
              d.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !u.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !u.isInteger(t.timestampMillis) && !(t.timestampMillis && u.isInteger(t.timestampMillis.low) && u.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, n.fromObject = function(t) {
        if (t instanceof i.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new i.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (u.Long ? (e.timestampMillis = u.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new u.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, n.toObject = function(t, e) {
        e || (e = {});
        let r = {};
        if (e.defaults)
          if (r.imageHash = "", u.Long) {
            let o = new u.Long(0, 0, !0);
            r.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            r.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (r.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? r.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : r.timestampMillis = e.longs === String ? u.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new u.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), r;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["aspectRatio"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_autoGainControl", {
        get: u.oneOfGetter(t = ["autoGainControl"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_channelCount", {
        get: u.oneOfGetter(t = ["channelCount"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceId", {
        get: u.oneOfGetter(t = ["deviceId"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_displaySurface", {
        get: u.oneOfGetter(t = ["displaySurface"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_echoCancellation", {
        get: u.oneOfGetter(t = ["echoCancellation"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_facingMode", {
        get: u.oneOfGetter(t = ["facingMode"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_frameRate", {
        get: u.oneOfGetter(t = ["frameRate"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_groupId", {
        get: u.oneOfGetter(t = ["groupId"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_height", {
        get: u.oneOfGetter(t = ["height"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_noiseSuppression", {
        get: u.oneOfGetter(t = ["noiseSuppression"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleRate", {
        get: u.oneOfGetter(t = ["sampleRate"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleSize", {
        get: u.oneOfGetter(t = ["sampleSize"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_width", {
        get: u.oneOfGetter(t = ["width"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceName", {
        get: u.oneOfGetter(t = ["deviceName"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.MediaTrackSettings();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.aspectRatio = e.double();
              break;
            }
            case 2: {
              l.autoGainControl = e.bool();
              break;
            }
            case 3: {
              l.channelCount = e.int32();
              break;
            }
            case 4: {
              l.deviceId = e.string();
              break;
            }
            case 5: {
              l.displaySurface = e.string();
              break;
            }
            case 6: {
              l.echoCancellation = e.bool();
              break;
            }
            case 7: {
              l.facingMode = e.string();
              break;
            }
            case 8: {
              l.frameRate = e.double();
              break;
            }
            case 9: {
              l.groupId = e.string();
              break;
            }
            case 10: {
              l.height = e.int32();
              break;
            }
            case 11: {
              l.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              l.sampleRate = e.int32();
              break;
            }
            case 13: {
              l.sampleSize = e.int32();
              break;
            }
            case 14: {
              l.width = e.int32();
              break;
            }
            case 15: {
              l.deviceName = e.string();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, n.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !u.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !u.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !u.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !u.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !u.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !u.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !u.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !u.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !u.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !u.isString(e.deviceName) ? "deviceName: string expected" : null;
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.ImageBitmap();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.width = t.int32();
              break;
            }
            case 2: {
              d.height = t.int32();
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, n.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !u.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !u.isInteger(t.height) ? "height: integer expected" : null;
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.CameraProperties();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.cameraInitFrameResolution = i.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.cameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.DetectedObject();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
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
              d.faceCenter = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 7: {
              d.smallestEdge = t.float();
              break;
            }
            case 8: {
              d.bottomLeft = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 9: {
              d.bottomRight = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 10: {
              d.topLeft = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 11: {
              d.topRight = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.Point();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.x = t.float();
              break;
            }
            case 2: {
              d.y = t.float();
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
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
        get: u.oneOfGetter(t = ["video"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.FaceContent();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["video"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.DocumentContent();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.Blob();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.documentContent = i.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              l.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.faceContent = i.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              l.smileLivenessContent = i.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              l.palmContent = i.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              l.travelDocumentContent = i.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.TravelDocumentContent();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.ldsMasterFile = i.dot.v4.LdsMasterFile.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              d.authenticationStatus = i.dot.v4.AuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 4: {
              d.metadata = i.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.LdsMasterFile();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: u.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg5DisplayedPortrait", {
        get: u.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: u.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg8DataFeatures", {
        get: u.oneOfGetter(t = ["dg8DataFeatures"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg9StructureFeatures", {
        get: u.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg10SubstanceFeatures", {
        get: u.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg11AdditionalPersonalDetails", {
        get: u.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg12AdditionalDocumentDetails", {
        get: u.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg13OptionalDetails", {
        get: u.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg14SecurityOptions", {
        get: u.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: u.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg16PersonsToNotify", {
        get: u.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              l.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              l.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              l.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              l.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              l.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              l.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              l.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              l.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              l.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              l.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              l.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              l.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              l.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              l.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["bytes"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.Lds1ElementaryFile();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.id = e.int32();
              break;
            }
            case 2: {
              l.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return e.bytes != null && e.hasOwnProperty("bytes") && !(e.bytes && typeof e.bytes.length == "number" || u.isString(e.bytes)) ? "bytes: buffer expected" : null;
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
        return e.bytes != null && (typeof e.bytes == "string" ? u.base64.decode(e.bytes, r.bytes = u.newBuffer(u.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (r.bytes = e.bytes)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.id = r.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (o.id = r.enums === String ? i.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : i.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (o.bytes = r.bytes === String ? u.base64.encode(e.bytes, 0, e.bytes.length) : r.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, r.oneofs && (o._bytes = "bytes")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.AuthenticationStatus();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.data = i.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.chip = i.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.DataAuthenticationStatus();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.status = t.int32();
              break;
            }
            case 2: {
              d.protocol = t.int32();
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["protocol"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_activeAuthenticationResponse", {
        get: u.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.status = e.int32();
              break;
            }
            case 2: {
              l.protocol = e.int32();
              break;
            }
            case 3: {
              l.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || u.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
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
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? u.base64.decode(e.activeAuthenticationResponse, r.activeAuthenticationResponse = u.newBuffer(u.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (r.activeAuthenticationResponse = e.activeAuthenticationResponse)), r;
      }, n.toObject = function(e, r) {
        r || (r = {});
        let o = {};
        return r.defaults && (o.status = r.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (o.status = r.enums === String ? i.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : i.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (o.protocol = r.enums === String ? i.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : i.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, r.oneofs && (o._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (o.activeAuthenticationResponse = r.bytes === String ? u.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : r.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, r.oneofs && (o._activeAuthenticationResponse = "activeAuthenticationResponse")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
      n.prototype.image = null, n.prototype.segments = u.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_image", {
        get: u.oneOfGetter(t = ["image"]),
        set: u.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_video", {
        get: u.oneOfGetter(t = ["video"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 3: {
              l.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              l.segments && l.segments.length || (l.segments = []), l.segments.push(i.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              l.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
          for (let d = 0; d < e.segments.length; ++d)
            o.segments[d] = i.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[d], r);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, r)), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, r), r.oneofs && (o._image = "image")), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, r), r.oneofs && (o._video = "video")), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new i.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < o; ) {
          let l = t.uint32();
          if (l === r)
            break;
          switch (l >>> 3) {
            case 1: {
              d.corner = t.int32();
              break;
            }
            case 2: {
              d.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(l & 7);
              break;
          }
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["video"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.SmileLivenessContent();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.neutralExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.smileExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              l.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
        get: u.oneOfGetter(t = ["video"]),
        set: u.oneOfSetter(t)
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
        e instanceof g || (e = g.create(e));
        let d = r === void 0 ? e.len : e.pos + r, l = new i.dot.v4.PalmContent();
        for (; e.pos < d; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              l.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              l.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              l.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return l;
      }, n.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, _.util.toJSONOptions);
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
    return c.prototype.bytes = u.newBuffer([]), c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Image();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || u.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.Image)
        return n;
      let t = new i.dot.Image();
      return n.bytes != null && (typeof n.bytes == "string" ? u.base64.decode(n.bytes, t.bytes = u.newBuffer(u.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = u.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? u.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, _.util.toJSONOptions);
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
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.ImageSize();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.width = n.int32();
            break;
          }
          case 2: {
            o.height = n.int32();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.width != null && n.hasOwnProperty("width") && !u.isInteger(n.width) ? "width: integer expected" : n.height != null && n.hasOwnProperty("height") && !u.isInteger(n.height) ? "height: integer expected" : null;
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
      return this.constructor.toObject(this, _.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.ImageSize";
    }, c;
  }(), p.Int32List = function() {
    function c(n) {
      if (this.items = [], n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.items = u.emptyArray, c.create = function(n) {
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
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Int32List();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            if (o.items && o.items.length || (o.items = []), (d & 7) === 2) {
              let l = n.uint32() + n.pos;
              for (; n.pos < l; )
                o.items.push(n.int32());
            } else
              o.items.push(n.int32());
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      if (typeof n != "object" || n === null)
        return "object expected";
      if (n.items != null && n.hasOwnProperty("items")) {
        if (!Array.isArray(n.items))
          return "items: array expected";
        for (let t = 0; t < n.items.length; ++t)
          if (!u.isInteger(n.items[t]))
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
      return this.constructor.toObject(this, _.util.toJSONOptions);
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
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.RectangleDouble();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
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
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
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
      return this.constructor.toObject(this, _.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.RectangleDouble";
    }, c;
  }(), p.DigestWithTimestamp = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.digest = u.newBuffer([]), c.prototype.timestampMillis = u.Long ? u.Long.fromBits(0, 0, !0) : 0, c.create = function(n) {
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
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.DigestWithTimestamp();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.digest = n.bytes();
            break;
          }
          case 2: {
            o.timestampMillis = n.uint64();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.digest != null && n.hasOwnProperty("digest") && !(n.digest && typeof n.digest.length == "number" || u.isString(n.digest)) ? "digest: buffer expected" : n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && !u.isInteger(n.timestampMillis) && !(n.timestampMillis && u.isInteger(n.timestampMillis.low) && u.isInteger(n.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.DigestWithTimestamp)
        return n;
      let t = new i.dot.DigestWithTimestamp();
      return n.digest != null && (typeof n.digest == "string" ? u.base64.decode(n.digest, t.digest = u.newBuffer(u.base64.length(n.digest)), 0) : n.digest.length >= 0 && (t.digest = n.digest)), n.timestampMillis != null && (u.Long ? (t.timestampMillis = u.Long.fromValue(n.timestampMillis)).unsigned = !0 : typeof n.timestampMillis == "string" ? t.timestampMillis = parseInt(n.timestampMillis, 10) : typeof n.timestampMillis == "number" ? t.timestampMillis = n.timestampMillis : typeof n.timestampMillis == "object" && (t.timestampMillis = new u.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = u.newBuffer(e.digest))), u.Long) {
          let r = new u.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? r.toString() : t.longs === Number ? r.toNumber() : r;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return n.digest != null && n.hasOwnProperty("digest") && (e.digest = t.bytes === String ? u.base64.encode(n.digest, 0, n.digest.length) : t.bytes === Array ? Array.prototype.slice.call(n.digest) : n.digest), n.timestampMillis != null && n.hasOwnProperty("timestampMillis") && (typeof n.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(n.timestampMillis) : n.timestampMillis : e.timestampMillis = t.longs === String ? u.Long.prototype.toString.call(n.timestampMillis) : t.longs === Number ? new u.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0) : n.timestampMillis), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, _.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.DigestWithTimestamp";
    }, c;
  }(), p.Video = function() {
    function c(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && (this[t[e]] = n[t[e]]);
    }
    return c.prototype.bytes = u.newBuffer([]), c.create = function(n) {
      return new c(n);
    }, c.encode = function(n, t) {
      return t || (t = L.create()), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, c.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, c.decode = function(n, t, e) {
      n instanceof g || (n = g.create(n));
      let r = t === void 0 ? n.len : n.pos + t, o = new i.dot.Video();
      for (; n.pos < r; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(n) {
      return n instanceof g || (n = new g(n)), this.decode(n, n.uint32());
    }, c.verify = function(n) {
      return typeof n != "object" || n === null ? "object expected" : n.bytes != null && n.hasOwnProperty("bytes") && !(n.bytes && typeof n.bytes.length == "number" || u.isString(n.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(n) {
      if (n instanceof i.dot.Video)
        return n;
      let t = new i.dot.Video();
      return n.bytes != null && (typeof n.bytes == "string" ? u.base64.decode(n.bytes, t.bytes = u.newBuffer(u.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (t.bytes = n.bytes)), t;
    }, c.toObject = function(n, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = u.newBuffer(e.bytes)))), n.bytes != null && n.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? u.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, _.util.toJSONOptions);
    }, c.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Video";
    }, c;
  }(), p;
})();
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Er = Symbol("Comlink.proxy"), Jo = Symbol("Comlink.endpoint"), Yo = Symbol("Comlink.releaseProxy"), mt = Symbol("Comlink.finalizer"), $e = Symbol("Comlink.thrown"), Fr = (p) => typeof p == "object" && p !== null || typeof p == "function", Zo = {
  canHandle: (p) => Fr(p) && p[Er],
  serialize(p) {
    const { port1: c, port2: n } = new MessageChannel();
    return yt(p, c), [n, [n]];
  },
  deserialize(p) {
    return p.start(), Qo(p);
  }
}, Ko = {
  canHandle: (p) => Fr(p) && $e in p,
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
}, _r = /* @__PURE__ */ new Map([
  ["proxy", Zo],
  ["throw", Ko]
]);
function qo(p, c) {
  for (const n of p)
    if (c === n || n === "*" || n instanceof RegExp && n.test(c))
      return !0;
  return !1;
}
function yt(p, c = globalThis, n = ["*"]) {
  c.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!qo(n, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: r, type: o, path: d } = Object.assign({ path: [] }, e.data), l = (e.data.argumentList || []).map(ue);
    let y;
    try {
      const S = d.slice(0, -1).reduce((w, j) => w[j], p), m = d.reduce((w, j) => w[j], p);
      switch (o) {
        case "GET":
          y = m;
          break;
        case "SET":
          S[d.slice(-1)[0]] = ue(e.data.value), y = !0;
          break;
        case "APPLY":
          y = m.apply(S, l);
          break;
        case "CONSTRUCT":
          {
            const w = new m(...l);
            y = oi(w);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: w, port2: j } = new MessageChannel();
            yt(p, j), y = ni(w, [w]);
          }
          break;
        case "RELEASE":
          y = void 0;
          break;
        default:
          return;
      }
    } catch (S) {
      y = { value: S, [$e]: 0 };
    }
    Promise.resolve(y).catch((S) => ({ value: S, [$e]: 0 })).then((S) => {
      const [m, w] = Ve(S);
      c.postMessage(Object.assign(Object.assign({}, m), { id: r }), w), o === "RELEASE" && (c.removeEventListener("message", t), Mr(c), mt in p && typeof p[mt] == "function" && p[mt]());
    }).catch((S) => {
      const [m, w] = Ve({
        value: new TypeError("Unserializable return value"),
        [$e]: 0
      });
      c.postMessage(Object.assign(Object.assign({}, m), { id: r }), w);
    });
  }), c.start && c.start();
}
function Xo(p) {
  return p.constructor.name === "MessagePort";
}
function Mr(p) {
  Xo(p) && p.close();
}
function Qo(p, c) {
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
  }), ht(p, n, [], c);
}
function Ue(p) {
  if (p)
    throw new Error("Proxy has been released and is not useable");
}
function Rr(p) {
  return be(p, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    Mr(p);
  });
}
const Ge = /* @__PURE__ */ new WeakMap(), Be = "FinalizationRegistry" in globalThis && new FinalizationRegistry((p) => {
  const c = (Ge.get(p) || 0) - 1;
  Ge.set(p, c), c === 0 && Rr(p);
});
function ei(p, c) {
  const n = (Ge.get(c) || 0) + 1;
  Ge.set(c, n), Be && Be.register(p, c, p);
}
function ti(p) {
  Be && Be.unregister(p);
}
function ht(p, c, n = [], t = function() {
}) {
  let e = !1;
  const r = new Proxy(t, {
    get(o, d) {
      if (Ue(e), d === Yo)
        return () => {
          ti(r), Rr(p), c.clear(), e = !0;
        };
      if (d === "then") {
        if (n.length === 0)
          return { then: () => r };
        const l = be(p, c, {
          type: "GET",
          path: n.map((y) => y.toString())
        }).then(ue);
        return l.then.bind(l);
      }
      return ht(p, c, [...n, d]);
    },
    set(o, d, l) {
      Ue(e);
      const [y, S] = Ve(l);
      return be(p, c, {
        type: "SET",
        path: [...n, d].map((m) => m.toString()),
        value: y
      }, S).then(ue);
    },
    apply(o, d, l) {
      Ue(e);
      const y = n[n.length - 1];
      if (y === Jo)
        return be(p, c, {
          type: "ENDPOINT"
        }).then(ue);
      if (y === "bind")
        return ht(p, c, n.slice(0, -1));
      const [S, m] = Dr(l);
      return be(p, c, {
        type: "APPLY",
        path: n.map((w) => w.toString()),
        argumentList: S
      }, m).then(ue);
    },
    construct(o, d) {
      Ue(e);
      const [l, y] = Dr(d);
      return be(p, c, {
        type: "CONSTRUCT",
        path: n.map((S) => S.toString()),
        argumentList: l
      }, y).then(ue);
    }
  });
  return ei(r, p), r;
}
function ri(p) {
  return Array.prototype.concat.apply([], p);
}
function Dr(p) {
  const c = p.map(Ve);
  return [c.map((n) => n[0]), ri(c.map((n) => n[1]))];
}
const Lr = /* @__PURE__ */ new WeakMap();
function ni(p, c) {
  return Lr.set(p, c), p;
}
function oi(p) {
  return Object.assign(p, { [Er]: !0 });
}
function Ve(p) {
  for (const [c, n] of _r)
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
    Lr.get(p) || []
  ];
}
function ue(p) {
  switch (p.type) {
    case "HANDLER":
      return _r.get(p.name).deserialize(p.value);
    case "RAW":
      return p.value;
  }
}
function be(p, c, n, t) {
  return new Promise((e) => {
    const r = ii();
    c.set(r, e), p.start && p.start(), p.postMessage(Object.assign({ id: r }, n), t);
  });
}
function ii() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var ai = (() => {
  var p = import.meta.url;
  return async function(c = {}) {
    var n, t = c, e, r, o = new Promise((s, a) => {
      e = s, r = a;
    }), d = typeof window == "object", l = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var y = Object.assign({}, t), S = (s, a) => {
      throw a;
    }, m = "";
    function w(s) {
      return t.locateFile ? t.locateFile(s, m) : m + s;
    }
    var j, I;
    (d || l) && (l ? m = self.location.href : typeof document < "u" && document.currentScript && (m = document.currentScript.src), p && (m = p), m.startsWith("blob:") ? m = "" : m = m.slice(0, m.replace(/[?#].*/, "").lastIndexOf("/") + 1), l && (I = (s) => {
      var a = new XMLHttpRequest();
      return a.open("GET", s, !1), a.responseType = "arraybuffer", a.send(null), new Uint8Array(a.response);
    }), j = async (s) => {
      if (wt(s))
        return new Promise((f, h) => {
          var b = new XMLHttpRequest();
          b.open("GET", s, !0), b.responseType = "arraybuffer", b.onload = () => {
            if (b.status == 200 || b.status == 0 && b.response) {
              f(b.response);
              return;
            }
            h(b.status);
          }, b.onerror = h, b.send(null);
        });
      var a = await fetch(s, { credentials: "same-origin" });
      if (a.ok)
        return a.arrayBuffer();
      throw new Error(a.status + " : " + a.url);
    }), t.print || console.log.bind(console);
    var E = t.printErr || console.error.bind(console);
    Object.assign(t, y), y = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var O = t.wasmBinary, D, M = !1, X, se, G, Oe, Se, le, W, gt, bt, vt, Ot, wt = (s) => s.startsWith("file://");
    function Pt() {
      var s = D.buffer;
      t.HEAP8 = se = new Int8Array(s), t.HEAP16 = Oe = new Int16Array(s), t.HEAPU8 = G = new Uint8Array(s), t.HEAPU16 = Se = new Uint16Array(s), t.HEAP32 = le = new Int32Array(s), t.HEAPU32 = W = new Uint32Array(s), t.HEAPF32 = gt = new Float32Array(s), t.HEAPF64 = Ot = new Float64Array(s), t.HEAP64 = bt = new BigInt64Array(s), t.HEAPU64 = vt = new BigUint64Array(s);
    }
    function xr() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Kr(t.preRun.shift());
      It(Ct);
    }
    function Nr() {
      R.A();
    }
    function Wr() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Zr(t.postRun.shift());
      It(St);
    }
    var ce = 0, we = null;
    function zr(s) {
      var a;
      ce++, (a = t.monitorRunDependencies) == null || a.call(t, ce);
    }
    function Ur(s) {
      var f;
      if (ce--, (f = t.monitorRunDependencies) == null || f.call(t, ce), ce == 0 && we) {
        var a = we;
        we = null, a();
      }
    }
    function Ce(s) {
      var f;
      (f = t.onAbort) == null || f.call(t, s), s = "Aborted(" + s + ")", E(s), M = !0, s += ". Build with -sASSERTIONS for more info.";
      var a = new WebAssembly.RuntimeError(s);
      throw r(a), a;
    }
    var He;
    function $r() {
      return t.locateFile ? w("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Gr(s) {
      if (s == He && O)
        return new Uint8Array(O);
      if (I)
        return I(s);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Br(s) {
      if (!O)
        try {
          var a = await j(s);
          return new Uint8Array(a);
        } catch {
        }
      return Gr(s);
    }
    async function Vr(s, a) {
      try {
        var f = await Br(s), h = await WebAssembly.instantiate(f, a);
        return h;
      } catch (b) {
        E(`failed to asynchronously prepare wasm: ${b}`), Ce(b);
      }
    }
    async function Hr(s, a, f) {
      if (!s && typeof WebAssembly.instantiateStreaming == "function" && !wt(a))
        try {
          var h = fetch(a, { credentials: "same-origin" }), b = await WebAssembly.instantiateStreaming(h, f);
          return b;
        } catch (P) {
          E(`wasm streaming compile failed: ${P}`), E("falling back to ArrayBuffer instantiation");
        }
      return Vr(a, f);
    }
    function Jr() {
      return { a: bo };
    }
    async function Yr() {
      function s(P, C) {
        return R = P.exports, R = T.instrumentWasmExports(R), D = R.z, Pt(), R.F, Ur(), R;
      }
      zr();
      function a(P) {
        return s(P.instance);
      }
      var f = Jr();
      if (t.instantiateWasm)
        return new Promise((P, C) => {
          t.instantiateWasm(f, (v, A) => {
            s(v), P(v.exports);
          });
        });
      He ?? (He = $r());
      try {
        var h = await Hr(O, He, f), b = a(h);
        return b;
      } catch (P) {
        return r(P), Promise.reject(P);
      }
    }
    class jt {
      constructor(a) {
        xe(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${a})`, this.status = a;
      }
    }
    var It = (s) => {
      for (; s.length > 0; )
        s.shift()(t);
    }, St = [], Zr = (s) => St.unshift(s), Ct = [], Kr = (s) => Ct.unshift(s), At = t.noExitRuntime || !0;
    class qr {
      constructor(a) {
        this.excPtr = a, this.ptr = a - 24;
      }
      set_type(a) {
        W[this.ptr + 4 >> 2] = a;
      }
      get_type() {
        return W[this.ptr + 4 >> 2];
      }
      set_destructor(a) {
        W[this.ptr + 8 >> 2] = a;
      }
      get_destructor() {
        return W[this.ptr + 8 >> 2];
      }
      set_caught(a) {
        a = a ? 1 : 0, se[this.ptr + 12] = a;
      }
      get_caught() {
        return se[this.ptr + 12] != 0;
      }
      set_rethrown(a) {
        a = a ? 1 : 0, se[this.ptr + 13] = a;
      }
      get_rethrown() {
        return se[this.ptr + 13] != 0;
      }
      init(a, f) {
        this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(f);
      }
      set_adjusted_ptr(a) {
        W[this.ptr + 16 >> 2] = a;
      }
      get_adjusted_ptr() {
        return W[this.ptr + 16 >> 2];
      }
    }
    var Dt = 0, Xr = (s, a, f) => {
      var h = new qr(s);
      throw h.init(a, f), Dt = s, Dt;
    }, Qr = () => Ce(""), Ae = (s) => {
      if (s === null)
        return "null";
      var a = typeof s;
      return a === "object" || a === "array" || a === "function" ? s.toString() : "" + s;
    }, en = () => {
      for (var s = new Array(256), a = 0; a < 256; ++a)
        s[a] = String.fromCharCode(a);
      Tt = s;
    }, Tt, $ = (s) => {
      for (var a = "", f = s; G[f]; )
        a += Tt[G[f++]];
      return a;
    }, me = {}, de = {}, De = {}, he, x = (s) => {
      throw new he(s);
    }, kt, Te = (s) => {
      throw new kt(s);
    }, ye = (s, a, f) => {
      s.forEach((v) => De[v] = a);
      function h(v) {
        var A = f(v);
        A.length !== s.length && Te("Mismatched type converter count");
        for (var F = 0; F < s.length; ++F)
          J(s[F], A[F]);
      }
      var b = new Array(a.length), P = [], C = 0;
      a.forEach((v, A) => {
        de.hasOwnProperty(v) ? b[A] = de[v] : (P.push(v), me.hasOwnProperty(v) || (me[v] = []), me[v].push(() => {
          b[A] = de[v], ++C, C === P.length && h(b);
        }));
      }), P.length === 0 && h(b);
    };
    function tn(s, a, f = {}) {
      var h = a.name;
      if (s || x(`type "${h}" must have a positive integer typeid pointer`), de.hasOwnProperty(s)) {
        if (f.ignoreDuplicateRegistrations)
          return;
        x(`Cannot register type '${h}' twice`);
      }
      if (de[s] = a, delete De[s], me.hasOwnProperty(s)) {
        var b = me[s];
        delete me[s], b.forEach((P) => P());
      }
    }
    function J(s, a, f = {}) {
      return tn(s, a, f);
    }
    var Et = (s, a, f) => {
      switch (a) {
        case 1:
          return f ? (h) => se[h] : (h) => G[h];
        case 2:
          return f ? (h) => Oe[h >> 1] : (h) => Se[h >> 1];
        case 4:
          return f ? (h) => le[h >> 2] : (h) => W[h >> 2];
        case 8:
          return f ? (h) => bt[h >> 3] : (h) => vt[h >> 3];
        default:
          throw new TypeError(`invalid integer width (${a}): ${s}`);
      }
    }, rn = (s, a, f, h, b) => {
      a = $(a);
      var P = a.indexOf("u") != -1;
      J(s, { name: a, fromWireType: (C) => C, toWireType: function(C, v) {
        if (typeof v != "bigint" && typeof v != "number")
          throw new TypeError(`Cannot convert "${Ae(v)}" to ${this.name}`);
        return typeof v == "number" && (v = BigInt(v)), v;
      }, argPackAdvance: Q, readValueFromPointer: Et(a, f, !P), destructorFunction: null });
    }, Q = 8, nn = (s, a, f, h) => {
      a = $(a), J(s, { name: a, fromWireType: function(b) {
        return !!b;
      }, toWireType: function(b, P) {
        return P ? f : h;
      }, argPackAdvance: Q, readValueFromPointer: function(b) {
        return this.fromWireType(G[b]);
      }, destructorFunction: null });
    }, on = (s) => ({ count: s.count, deleteScheduled: s.deleteScheduled, preservePointerOnDelete: s.preservePointerOnDelete, ptr: s.ptr, ptrType: s.ptrType, smartPtr: s.smartPtr, smartPtrType: s.smartPtrType }), Je = (s) => {
      function a(f) {
        return f.$$.ptrType.registeredClass.name;
      }
      x(a(s) + " instance already deleted");
    }, Ye = !1, Ft = (s) => {
    }, an = (s) => {
      s.smartPtr ? s.smartPtrType.rawDestructor(s.smartPtr) : s.ptrType.registeredClass.rawDestructor(s.ptr);
    }, _t = (s) => {
      s.count.value -= 1;
      var a = s.count.value === 0;
      a && an(s);
    }, Mt = (s, a, f) => {
      if (a === f)
        return s;
      if (f.baseClass === void 0)
        return null;
      var h = Mt(s, a, f.baseClass);
      return h === null ? null : f.downcast(h);
    }, Rt = {}, sn = {}, ln = (s, a) => {
      for (a === void 0 && x("ptr should not be undefined"); s.baseClass; )
        a = s.upcast(a), s = s.baseClass;
      return a;
    }, cn = (s, a) => (a = ln(s, a), sn[a]), ke = (s, a) => {
      (!a.ptrType || !a.ptr) && Te("makeClassHandle requires ptr and ptrType");
      var f = !!a.smartPtrType, h = !!a.smartPtr;
      return f !== h && Te("Both smartPtrType and smartPtr must be specified"), a.count = { value: 1 }, Pe(Object.create(s, { $$: { value: a, writable: !0 } }));
    };
    function dn(s) {
      var a = this.getPointee(s);
      if (!a)
        return this.destructor(s), null;
      var f = cn(this.registeredClass, a);
      if (f !== void 0) {
        if (f.$$.count.value === 0)
          return f.$$.ptr = a, f.$$.smartPtr = s, f.clone();
        var h = f.clone();
        return this.destructor(s), h;
      }
      function b() {
        return this.isSmartPointer ? ke(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: a, smartPtrType: this, smartPtr: s }) : ke(this.registeredClass.instancePrototype, { ptrType: this, ptr: s });
      }
      var P = this.registeredClass.getActualType(a), C = Rt[P];
      if (!C)
        return b.call(this);
      var v;
      this.isConst ? v = C.constPointerType : v = C.pointerType;
      var A = Mt(a, this.registeredClass, v.registeredClass);
      return A === null ? b.call(this) : this.isSmartPointer ? ke(v.registeredClass.instancePrototype, { ptrType: v, ptr: A, smartPtrType: this, smartPtr: s }) : ke(v.registeredClass.instancePrototype, { ptrType: v, ptr: A });
    }
    var Pe = (s) => typeof FinalizationRegistry > "u" ? (Pe = (a) => a, s) : (Ye = new FinalizationRegistry((a) => {
      _t(a.$$);
    }), Pe = (a) => {
      var f = a.$$, h = !!f.smartPtr;
      if (h) {
        var b = { $$: f };
        Ye.register(a, b, a);
      }
      return a;
    }, Ft = (a) => Ye.unregister(a), Pe(s)), un = () => {
      Object.assign(Ee.prototype, { isAliasOf(s) {
        if (!(this instanceof Ee) || !(s instanceof Ee))
          return !1;
        var a = this.$$.ptrType.registeredClass, f = this.$$.ptr;
        s.$$ = s.$$;
        for (var h = s.$$.ptrType.registeredClass, b = s.$$.ptr; a.baseClass; )
          f = a.upcast(f), a = a.baseClass;
        for (; h.baseClass; )
          b = h.upcast(b), h = h.baseClass;
        return a === h && f === b;
      }, clone() {
        if (this.$$.ptr || Je(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var s = Pe(Object.create(Object.getPrototypeOf(this), { $$: { value: on(this.$$) } }));
        return s.$$.count.value += 1, s.$$.deleteScheduled = !1, s;
      }, delete() {
        this.$$.ptr || Je(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), Ft(this), _t(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Je(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ee() {
    }
    var Ze = (s, a) => Object.defineProperty(a, "name", { value: s }), fn = (s, a, f) => {
      if (s[a].overloadTable === void 0) {
        var h = s[a];
        s[a] = function(...b) {
          return s[a].overloadTable.hasOwnProperty(b.length) || x(`Function '${f}' called with an invalid number of arguments (${b.length}) - expects one of (${s[a].overloadTable})!`), s[a].overloadTable[b.length].apply(this, b);
        }, s[a].overloadTable = [], s[a].overloadTable[h.argCount] = h;
      }
    }, Lt = (s, a, f) => {
      t.hasOwnProperty(s) ? ((f === void 0 || t[s].overloadTable !== void 0 && t[s].overloadTable[f] !== void 0) && x(`Cannot register public name '${s}' twice`), fn(t, s, s), t[s].overloadTable.hasOwnProperty(f) && x(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`), t[s].overloadTable[f] = a) : (t[s] = a, t[s].argCount = f);
    }, pn = 48, mn = 57, hn = (s) => {
      s = s.replace(/[^a-zA-Z0-9_]/g, "$");
      var a = s.charCodeAt(0);
      return a >= pn && a <= mn ? `_${s}` : s;
    };
    function yn(s, a, f, h, b, P, C, v) {
      this.name = s, this.constructor = a, this.instancePrototype = f, this.rawDestructor = h, this.baseClass = b, this.getActualType = P, this.upcast = C, this.downcast = v, this.pureVirtualFunctions = [];
    }
    var Fe = (s, a, f) => {
      for (; a !== f; )
        a.upcast || x(`Expected null or instance of ${f.name}, got an instance of ${a.name}`), s = a.upcast(s), a = a.baseClass;
      return s;
    };
    function gn(s, a) {
      if (a === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      a.$$ || x(`Cannot pass "${Ae(a)}" as a ${this.name}`), a.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, h = Fe(a.$$.ptr, f, this.registeredClass);
      return h;
    }
    function bn(s, a) {
      var f;
      if (a === null)
        return this.isReference && x(`null is not a valid ${this.name}`), this.isSmartPointer ? (f = this.rawConstructor(), s !== null && s.push(this.rawDestructor, f), f) : 0;
      (!a || !a.$$) && x(`Cannot pass "${Ae(a)}" as a ${this.name}`), a.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && a.$$.ptrType.isConst && x(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
      var h = a.$$.ptrType.registeredClass;
      if (f = Fe(a.$$.ptr, h, this.registeredClass), this.isSmartPointer)
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
              f = this.rawShare(f, H.toHandle(() => b.delete())), s !== null && s.push(this.rawDestructor, f);
            }
            break;
          default:
            x("Unsupporting sharing policy");
        }
      return f;
    }
    function vn(s, a) {
      if (a === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      a.$$ || x(`Cannot pass "${Ae(a)}" as a ${this.name}`), a.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), a.$$.ptrType.isConst && x(`Cannot convert argument of type ${a.$$.ptrType.name} to parameter type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, h = Fe(a.$$.ptr, f, this.registeredClass);
      return h;
    }
    function _e(s) {
      return this.fromWireType(W[s >> 2]);
    }
    var On = () => {
      Object.assign(Me.prototype, { getPointee(s) {
        return this.rawGetPointee && (s = this.rawGetPointee(s)), s;
      }, destructor(s) {
        var a;
        (a = this.rawDestructor) == null || a.call(this, s);
      }, argPackAdvance: Q, readValueFromPointer: _e, fromWireType: dn });
    };
    function Me(s, a, f, h, b, P, C, v, A, F, k) {
      this.name = s, this.registeredClass = a, this.isReference = f, this.isConst = h, this.isSmartPointer = b, this.pointeeType = P, this.sharingPolicy = C, this.rawGetPointee = v, this.rawConstructor = A, this.rawShare = F, this.rawDestructor = k, !b && a.baseClass === void 0 ? h ? (this.toWireType = gn, this.destructorFunction = null) : (this.toWireType = vn, this.destructorFunction = null) : this.toWireType = bn;
    }
    var xt = (s, a, f) => {
      t.hasOwnProperty(s) || Te("Replacing nonexistent public symbol"), t[s].overloadTable !== void 0 && f !== void 0 ? t[s].overloadTable[f] = a : (t[s] = a, t[s].argCount = f);
    }, wn = (s, a, f) => {
      s = s.replace(/p/g, "i");
      var h = t["dynCall_" + s];
      return h(a, ...f);
    }, Pn = (s, a, f = []) => {
      var h = wn(s, a, f);
      return h;
    }, jn = (s, a) => (...f) => Pn(s, a, f), te = (s, a) => {
      s = $(s);
      function f() {
        return jn(s, a);
      }
      var h = f();
      return typeof h != "function" && x(`unknown function pointer with signature ${s}: ${a}`), h;
    }, In = (s, a) => {
      var f = Ze(a, function(h) {
        this.name = a, this.message = h;
        var b = new Error(h).stack;
        b !== void 0 && (this.stack = this.toString() + `
` + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return f.prototype = Object.create(s.prototype), f.prototype.constructor = f, f.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, f;
    }, Nt, Wt = (s) => {
      var a = vo(s), f = $(a);
      return ee(a), f;
    }, je = (s, a) => {
      var f = [], h = {};
      function b(P) {
        if (!h[P] && !de[P]) {
          if (De[P]) {
            De[P].forEach(b);
            return;
          }
          f.push(P), h[P] = !0;
        }
      }
      throw a.forEach(b), new Nt(`${s}: ` + f.map(Wt).join([", "]));
    }, Sn = (s, a, f, h, b, P, C, v, A, F, k, N, z) => {
      k = $(k), P = te(b, P), v && (v = te(C, v)), F && (F = te(A, F)), z = te(N, z);
      var Y = hn(k);
      Lt(Y, function() {
        je(`Cannot construct ${k} due to unbound types`, [h]);
      }), ye([s, a, f], h ? [h] : [], (Z) => {
        var Xt;
        Z = Z[0];
        var ne, B;
        h ? (ne = Z.registeredClass, B = ne.instancePrototype) : B = Ee.prototype;
        var K = Ze(k, function(...tt) {
          if (Object.getPrototypeOf(this) !== oe)
            throw new he("Use 'new' to construct " + k);
          if (U.constructor_body === void 0)
            throw new he(k + " has no accessible constructor");
          var Qt = U.constructor_body[tt.length];
          if (Qt === void 0)
            throw new he(`Tried to invoke ctor of ${k} with invalid number of parameters (${tt.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return Qt.apply(this, tt);
        }), oe = Object.create(B, { constructor: { value: K } });
        K.prototype = oe;
        var U = new yn(k, K, oe, z, ne, P, v, F);
        U.baseClass && ((Xt = U.baseClass).__derivedClasses ?? (Xt.__derivedClasses = []), U.baseClass.__derivedClasses.push(U));
        var ie = new Me(k, U, !0, !1, !1), Le = new Me(k + "*", U, !1, !1, !1), qt = new Me(k + " const*", U, !1, !0, !1);
        return Rt[s] = { pointerType: Le, constPointerType: qt }, xt(Y, K), [ie, Le, qt];
      });
    }, zt = (s, a) => {
      for (var f = [], h = 0; h < s; h++)
        f.push(W[a + h * 4 >> 2]);
      return f;
    }, Ke = (s) => {
      for (; s.length; ) {
        var a = s.pop(), f = s.pop();
        f(a);
      }
    };
    function Cn(s) {
      for (var a = 1; a < s.length; ++a)
        if (s[a] !== null && s[a].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Re = (s) => {
      try {
        return s();
      } catch (a) {
        Ce(a);
      }
    }, Ut = (s) => {
      if (s instanceof jt || s == "unwind")
        return X;
      S(1, s);
    }, $t = 0, Gt = () => At || $t > 0, Bt = (s) => {
      var a;
      X = s, Gt() || ((a = t.onExit) == null || a.call(t, s), M = !0), S(s, new jt(s));
    }, An = (s, a) => {
      X = s, Bt(s);
    }, Dn = An, Tn = () => {
      if (!Gt())
        try {
          Dn(X);
        } catch (s) {
          Ut(s);
        }
    }, Vt = (s) => {
      if (!M)
        try {
          s(), Tn();
        } catch (a) {
          Ut(a);
        }
    }, T = { instrumentWasmImports(s) {
      var a = /^(__asyncjs__.*)$/;
      for (let [f, h] of Object.entries(s))
        typeof h == "function" && (h.isAsync || a.test(f));
    }, instrumentWasmExports(s) {
      var a = {};
      for (let [f, h] of Object.entries(s))
        typeof h == "function" ? a[f] = (...b) => {
          T.exportCallStack.push(f);
          try {
            return h(...b);
          } finally {
            M || (T.exportCallStack.pop(), T.maybeStopUnwind());
          }
        } : a[f] = h;
      return a;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(s) {
      var a = T.callStackNameToId[s];
      return a === void 0 && (a = T.callStackId++, T.callStackNameToId[s] = a, T.callStackIdToName[a] = s), a;
    }, maybeStopUnwind() {
      T.currData && T.state === T.State.Unwinding && T.exportCallStack.length === 0 && (T.state = T.State.Normal, Re(Po), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((s, a) => {
        T.asyncPromiseHandlers = { resolve: s, reject: a };
      });
    }, allocateData() {
      var s = Qe(12 + T.StackSize);
      return T.setDataHeader(s, s + 12, T.StackSize), T.setDataRewindFunc(s), s;
    }, setDataHeader(s, a, f) {
      W[s >> 2] = a, W[s + 4 >> 2] = a + f;
    }, setDataRewindFunc(s) {
      var a = T.exportCallStack[0], f = T.getCallStackId(a);
      le[s + 8 >> 2] = f;
    }, getDataRewindFuncName(s) {
      var a = le[s + 8 >> 2], f = T.callStackIdToName[a];
      return f;
    }, getDataRewindFunc(s) {
      var a = R[s];
      return a;
    }, doRewind(s) {
      var a = T.getDataRewindFuncName(s), f = T.getDataRewindFunc(a);
      return f();
    }, handleSleep(s) {
      if (!M) {
        if (T.state === T.State.Normal) {
          var a = !1, f = !1;
          s((h = 0) => {
            if (!M && (T.handleSleepReturnValue = h, a = !0, !!f)) {
              T.state = T.State.Rewinding, Re(() => jo(T.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var b, P = !1;
              try {
                b = T.doRewind(T.currData);
              } catch (A) {
                b = A, P = !0;
              }
              var C = !1;
              if (!T.currData) {
                var v = T.asyncPromiseHandlers;
                v && (T.asyncPromiseHandlers = null, (P ? v.reject : v.resolve)(b), C = !0);
              }
              if (P && !C)
                throw b;
            }
          }), f = !0, a || (T.state = T.State.Unwinding, T.currData = T.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Re(() => wo(T.currData)));
        } else T.state === T.State.Rewinding ? (T.state = T.State.Normal, Re(Io), ee(T.currData), T.currData = null, T.sleepCallbacks.forEach(Vt)) : Ce(`invalid state: ${T.state}`);
        return T.handleSleepReturnValue;
      }
    }, handleAsync(s) {
      return T.handleSleep((a) => {
        s().then(a);
      });
    } };
    function Ht(s, a, f, h, b, P) {
      var C = a.length;
      C < 2 && x("argTypes array size mismatch! Must at least get return value and 'this' types!"), a[1];
      var v = Cn(a), A = a[0].name !== "void", F = C - 2, k = new Array(F), N = [], z = [], Y = function(...Z) {
        z.length = 0;
        var ne;
        N.length = 1, N[0] = b;
        for (var B = 0; B < F; ++B)
          k[B] = a[B + 2].toWireType(z, Z[B]), N.push(k[B]);
        var K = h(...N);
        function oe(U) {
          if (v)
            Ke(z);
          else
            for (var ie = 2; ie < a.length; ie++) {
              var Le = ie === 1 ? ne : k[ie - 2];
              a[ie].destructorFunction !== null && a[ie].destructorFunction(Le);
            }
          if (A)
            return a[0].fromWireType(U);
        }
        return T.currData ? T.whenDone().then(oe) : oe(K);
      };
      return Ze(s, Y);
    }
    var kn = (s, a, f, h, b, P) => {
      var C = zt(a, f);
      b = te(h, b), ye([], [s], (v) => {
        v = v[0];
        var A = `constructor ${v.name}`;
        if (v.registeredClass.constructor_body === void 0 && (v.registeredClass.constructor_body = []), v.registeredClass.constructor_body[a - 1] !== void 0)
          throw new he(`Cannot register multiple constructors with identical number of parameters (${a - 1}) for class '${v.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return v.registeredClass.constructor_body[a - 1] = () => {
          je(`Cannot construct ${v.name} due to unbound types`, C);
        }, ye([], C, (F) => (F.splice(1, 0, null), v.registeredClass.constructor_body[a - 1] = Ht(A, F, null, b, P), [])), [];
      });
    }, Jt = (s, a, f) => (s instanceof Object || x(`${f} with invalid "this": ${s}`), s instanceof a.registeredClass.constructor || x(`${f} incompatible with "this" of type ${s.constructor.name}`), s.$$.ptr || x(`cannot call emscripten binding method ${f} on deleted object`), Fe(s.$$.ptr, s.$$.ptrType.registeredClass, a.registeredClass)), En = (s, a, f, h, b, P, C, v, A, F) => {
      a = $(a), b = te(h, b), ye([], [s], (k) => {
        k = k[0];
        var N = `${k.name}.${a}`, z = { get() {
          je(`Cannot access ${N} due to unbound types`, [f, C]);
        }, enumerable: !0, configurable: !0 };
        return A ? z.set = () => je(`Cannot access ${N} due to unbound types`, [f, C]) : z.set = (Y) => x(N + " is a read-only property"), Object.defineProperty(k.registeredClass.instancePrototype, a, z), ye([], A ? [f, C] : [f], (Y) => {
          var Z = Y[0], ne = { get() {
            var K = Jt(this, k, N + " getter");
            return Z.fromWireType(b(P, K));
          }, enumerable: !0 };
          if (A) {
            A = te(v, A);
            var B = Y[1];
            ne.set = function(K) {
              var oe = Jt(this, k, N + " setter"), U = [];
              A(F, oe, B.toWireType(U, K)), Ke(U);
            };
          }
          return Object.defineProperty(k.registeredClass.instancePrototype, a, ne), [];
        }), [];
      });
    }, qe = [], re = [], Xe = (s) => {
      s > 9 && --re[s + 1] === 0 && (re[s] = void 0, qe.push(s));
    }, Fn = () => re.length / 2 - 5 - qe.length, _n = () => {
      re.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Fn;
    }, H = { toValue: (s) => (s || x("Cannot use deleted val. handle = " + s), re[s]), toHandle: (s) => {
      switch (s) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const a = qe.pop() || re.length;
          return re[a] = s, re[a + 1] = 1, a;
        }
      }
    } }, Mn = { name: "emscripten::val", fromWireType: (s) => {
      var a = H.toValue(s);
      return Xe(s), a;
    }, toWireType: (s, a) => H.toHandle(a), argPackAdvance: Q, readValueFromPointer: _e, destructorFunction: null }, Rn = (s) => J(s, Mn), Ln = (s, a) => {
      switch (a) {
        case 4:
          return function(f) {
            return this.fromWireType(gt[f >> 2]);
          };
        case 8:
          return function(f) {
            return this.fromWireType(Ot[f >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${a}): ${s}`);
      }
    }, xn = (s, a, f) => {
      a = $(a), J(s, { name: a, fromWireType: (h) => h, toWireType: (h, b) => b, argPackAdvance: Q, readValueFromPointer: Ln(a, f), destructorFunction: null });
    }, Nn = (s) => {
      s = s.trim();
      const a = s.indexOf("(");
      return a === -1 ? s : s.slice(0, a);
    }, Wn = (s, a, f, h, b, P, C, v) => {
      var A = zt(a, f);
      s = $(s), s = Nn(s), b = te(h, b), Lt(s, function() {
        je(`Cannot call ${s} due to unbound types`, A);
      }, a - 1), ye([], A, (F) => {
        var k = [F[0], null].concat(F.slice(1));
        return xt(s, Ht(s, k, null, b, P), a - 1), [];
      });
    }, zn = (s, a, f, h, b) => {
      a = $(a);
      var P = (k) => k;
      if (h === 0) {
        var C = 32 - 8 * f;
        P = (k) => k << C >>> C;
      }
      var v = a.includes("unsigned"), A = (k, N) => {
      }, F;
      v ? F = function(k, N) {
        return A(N, this.name), N >>> 0;
      } : F = function(k, N) {
        return A(N, this.name), N;
      }, J(s, { name: a, fromWireType: P, toWireType: F, argPackAdvance: Q, readValueFromPointer: Et(a, f, h !== 0), destructorFunction: null });
    }, Un = (s, a, f) => {
      var h = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], b = h[a];
      function P(C) {
        var v = W[C >> 2], A = W[C + 4 >> 2];
        return new b(se.buffer, A, v);
      }
      f = $(f), J(s, { name: f, fromWireType: P, argPackAdvance: Q, readValueFromPointer: P }, { ignoreDuplicateRegistrations: !0 });
    }, $n = (s, a, f, h) => {
      if (!(h > 0)) return 0;
      for (var b = f, P = f + h - 1, C = 0; C < s.length; ++C) {
        var v = s.charCodeAt(C);
        if (v >= 55296 && v <= 57343) {
          var A = s.charCodeAt(++C);
          v = 65536 + ((v & 1023) << 10) | A & 1023;
        }
        if (v <= 127) {
          if (f >= P) break;
          a[f++] = v;
        } else if (v <= 2047) {
          if (f + 1 >= P) break;
          a[f++] = 192 | v >> 6, a[f++] = 128 | v & 63;
        } else if (v <= 65535) {
          if (f + 2 >= P) break;
          a[f++] = 224 | v >> 12, a[f++] = 128 | v >> 6 & 63, a[f++] = 128 | v & 63;
        } else {
          if (f + 3 >= P) break;
          a[f++] = 240 | v >> 18, a[f++] = 128 | v >> 12 & 63, a[f++] = 128 | v >> 6 & 63, a[f++] = 128 | v & 63;
        }
      }
      return a[f] = 0, f - b;
    }, Gn = (s, a, f) => $n(s, G, a, f), Bn = (s) => {
      for (var a = 0, f = 0; f < s.length; ++f) {
        var h = s.charCodeAt(f);
        h <= 127 ? a++ : h <= 2047 ? a += 2 : h >= 55296 && h <= 57343 ? (a += 4, ++f) : a += 3;
      }
      return a;
    }, Yt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Vn = (s, a = 0, f = NaN) => {
      for (var h = a + f, b = a; s[b] && !(b >= h); ) ++b;
      if (b - a > 16 && s.buffer && Yt)
        return Yt.decode(s.subarray(a, b));
      for (var P = ""; a < b; ) {
        var C = s[a++];
        if (!(C & 128)) {
          P += String.fromCharCode(C);
          continue;
        }
        var v = s[a++] & 63;
        if ((C & 224) == 192) {
          P += String.fromCharCode((C & 31) << 6 | v);
          continue;
        }
        var A = s[a++] & 63;
        if ((C & 240) == 224 ? C = (C & 15) << 12 | v << 6 | A : C = (C & 7) << 18 | v << 12 | A << 6 | s[a++] & 63, C < 65536)
          P += String.fromCharCode(C);
        else {
          var F = C - 65536;
          P += String.fromCharCode(55296 | F >> 10, 56320 | F & 1023);
        }
      }
      return P;
    }, Hn = (s, a) => s ? Vn(G, s, a) : "", Jn = (s, a) => {
      a = $(a), J(s, { name: a, fromWireType(f) {
        for (var h = W[f >> 2], b = f + 4, P, C, v = b, C = 0; C <= h; ++C) {
          var A = b + C;
          if (C == h || G[A] == 0) {
            var F = A - v, k = Hn(v, F);
            P === void 0 ? P = k : (P += "\0", P += k), v = A + 1;
          }
        }
        return ee(f), P;
      }, toWireType(f, h) {
        h instanceof ArrayBuffer && (h = new Uint8Array(h));
        var b, P = typeof h == "string";
        P || h instanceof Uint8Array || h instanceof Uint8ClampedArray || h instanceof Int8Array || x("Cannot pass non-string to std::string"), P ? b = Bn(h) : b = h.length;
        var C = Qe(4 + b + 1), v = C + 4;
        if (W[C >> 2] = b, P)
          Gn(h, v, b + 1);
        else if (P)
          for (var A = 0; A < b; ++A) {
            var F = h.charCodeAt(A);
            F > 255 && (ee(C), x("String has UTF-16 code units that do not fit in 8 bits")), G[v + A] = F;
          }
        else
          for (var A = 0; A < b; ++A)
            G[v + A] = h[A];
        return f !== null && f.push(ee, C), C;
      }, argPackAdvance: Q, readValueFromPointer: _e, destructorFunction(f) {
        ee(f);
      } });
    }, Zt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Yn = (s, a) => {
      for (var f = s, h = f >> 1, b = h + a / 2; !(h >= b) && Se[h]; ) ++h;
      if (f = h << 1, f - s > 32 && Zt) return Zt.decode(G.subarray(s, f));
      for (var P = "", C = 0; !(C >= a / 2); ++C) {
        var v = Oe[s + C * 2 >> 1];
        if (v == 0) break;
        P += String.fromCharCode(v);
      }
      return P;
    }, Zn = (s, a, f) => {
      if (f ?? (f = 2147483647), f < 2) return 0;
      f -= 2;
      for (var h = a, b = f < s.length * 2 ? f / 2 : s.length, P = 0; P < b; ++P) {
        var C = s.charCodeAt(P);
        Oe[a >> 1] = C, a += 2;
      }
      return Oe[a >> 1] = 0, a - h;
    }, Kn = (s) => s.length * 2, qn = (s, a) => {
      for (var f = 0, h = ""; !(f >= a / 4); ) {
        var b = le[s + f * 4 >> 2];
        if (b == 0) break;
        if (++f, b >= 65536) {
          var P = b - 65536;
          h += String.fromCharCode(55296 | P >> 10, 56320 | P & 1023);
        } else
          h += String.fromCharCode(b);
      }
      return h;
    }, Xn = (s, a, f) => {
      if (f ?? (f = 2147483647), f < 4) return 0;
      for (var h = a, b = h + f - 4, P = 0; P < s.length; ++P) {
        var C = s.charCodeAt(P);
        if (C >= 55296 && C <= 57343) {
          var v = s.charCodeAt(++P);
          C = 65536 + ((C & 1023) << 10) | v & 1023;
        }
        if (le[a >> 2] = C, a += 4, a + 4 > b) break;
      }
      return le[a >> 2] = 0, a - h;
    }, Qn = (s) => {
      for (var a = 0, f = 0; f < s.length; ++f) {
        var h = s.charCodeAt(f);
        h >= 55296 && h <= 57343 && ++f, a += 4;
      }
      return a;
    }, eo = (s, a, f) => {
      f = $(f);
      var h, b, P, C;
      a === 2 ? (h = Yn, b = Zn, C = Kn, P = (v) => Se[v >> 1]) : a === 4 && (h = qn, b = Xn, C = Qn, P = (v) => W[v >> 2]), J(s, { name: f, fromWireType: (v) => {
        for (var A = W[v >> 2], F, k = v + 4, N = 0; N <= A; ++N) {
          var z = v + 4 + N * a;
          if (N == A || P(z) == 0) {
            var Y = z - k, Z = h(k, Y);
            F === void 0 ? F = Z : (F += "\0", F += Z), k = z + a;
          }
        }
        return ee(v), F;
      }, toWireType: (v, A) => {
        typeof A != "string" && x(`Cannot pass non-string to C++ string type ${f}`);
        var F = C(A), k = Qe(4 + F + a);
        return W[k >> 2] = F / a, b(A, k + 4, F + a), v !== null && v.push(ee, k), k;
      }, argPackAdvance: Q, readValueFromPointer: _e, destructorFunction(v) {
        ee(v);
      } });
    }, to = (s, a) => {
      a = $(a), J(s, { isVoid: !0, name: a, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (f, h) => {
      } });
    }, ro = () => {
      At = !1, $t = 0;
    }, Kt = (s, a) => {
      var f = de[s];
      return f === void 0 && x(`${a} has unknown type ${Wt(s)}`), f;
    }, no = (s, a, f) => {
      var h = [], b = s.toWireType(h, f);
      return h.length && (W[a >> 2] = H.toHandle(h)), b;
    }, oo = (s, a, f) => (s = H.toValue(s), a = Kt(a, "emval::as"), no(a, f, s)), io = (s, a) => (s = H.toValue(s), a = H.toValue(a), H.toHandle(s[a])), ao = {}, so = (s) => {
      var a = ao[s];
      return a === void 0 ? $(s) : a;
    }, lo = (s) => H.toHandle(so(s)), co = (s) => {
      var a = H.toValue(s);
      Ke(a), Xe(s);
    }, uo = (s, a) => {
      s = Kt(s, "_emval_take_value");
      var f = s.readValueFromPointer(a);
      return H.toHandle(f);
    }, Ie = {}, fo = () => performance.now(), po = (s, a) => {
      if (Ie[s] && (clearTimeout(Ie[s].id), delete Ie[s]), !a) return 0;
      var f = setTimeout(() => {
        delete Ie[s], Vt(() => Oo(s, fo()));
      }, a);
      return Ie[s] = { id: f, timeout_ms: a }, 0;
    }, mo = () => 2147483648, ho = (s, a) => Math.ceil(s / a) * a, yo = (s) => {
      var a = D.buffer, f = (s - a.byteLength + 65535) / 65536 | 0;
      try {
        return D.grow(f), Pt(), 1;
      } catch {
      }
    }, go = (s) => {
      var a = G.length;
      s >>>= 0;
      var f = mo();
      if (s > f)
        return !1;
      for (var h = 1; h <= 4; h *= 2) {
        var b = a * (1 + 0.2 / h);
        b = Math.min(b, s + 100663296);
        var P = Math.min(f, ho(Math.max(s, b), 65536)), C = yo(P);
        if (C)
          return !0;
      }
      return !1;
    };
    en(), he = t.BindingError = class extends Error {
      constructor(a) {
        super(a), this.name = "BindingError";
      }
    }, kt = t.InternalError = class extends Error {
      constructor(a) {
        super(a), this.name = "InternalError";
      }
    }, un(), On(), Nt = t.UnboundTypeError = In(Error, "UnboundTypeError"), _n();
    var bo = { h: Xr, t: Qr, l: rn, w: nn, f: Sn, e: kn, a: En, u: Rn, k: xn, b: Wn, d: zn, c: Un, v: Jn, g: eo, x: to, q: ro, i: oo, y: Xe, j: io, o: lo, n: co, m: uo, r: po, s: go, p: Bt }, R = await Yr();
    R.A;
    var vo = R.B, Qe = t._malloc = R.C, ee = t._free = R.D, Oo = R.E;
    t.dynCall_v = R.G, t.dynCall_ii = R.H, t.dynCall_vi = R.I, t.dynCall_i = R.J, t.dynCall_iii = R.K, t.dynCall_viii = R.L, t.dynCall_fii = R.M, t.dynCall_viif = R.N, t.dynCall_viiii = R.O, t.dynCall_viiiiii = R.P, t.dynCall_iiiiii = R.Q, t.dynCall_viiiii = R.R, t.dynCall_iiiiiiii = R.S, t.dynCall_viiiiiii = R.T, t.dynCall_viiiiiiiiidi = R.U, t.dynCall_viiiiiiiidi = R.V, t.dynCall_viiiiiiiiii = R.W, t.dynCall_viiiiiiiii = R.X, t.dynCall_viiiiiiii = R.Y, t.dynCall_iiiiiii = R.Z, t.dynCall_iiiii = R._, t.dynCall_iiii = R.$;
    var wo = R.aa, Po = R.ba, jo = R.ca, Io = R.da;
    function et() {
      if (ce > 0) {
        we = et;
        return;
      }
      if (xr(), ce > 0) {
        we = et;
        return;
      }
      function s() {
        var a;
        t.calledRun = !0, !M && (Nr(), e(t), (a = t.onRuntimeInitialized) == null || a.call(t), Wr());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), s();
      }, 1)) : s();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return et(), n = o, n;
  };
})();
class si extends ko {
  getSamWasmFilePath(c, n) {
    return `${c}/palm/wasm/${n}`;
  }
  fetchSamModule(c) {
    return ai(c);
  }
  parseRawData(c) {
    const { brightness: n, sharpness: t } = c.params, e = {
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
      sharpness: t / 1e3
    };
    return {
      ...e,
      smallestEdge: Eo(e)
    };
  }
  async detect(c, n) {
    if (!this.samWasmModule)
      throw new V("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(c, n), e = this.samWasmModule.detectPalmWithImageParameters(
      n.width,
      n.height,
      t.bgr0ImagePointer,
      0,
      // palmDetectionOptions
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return t.free(), this.parseRawData(e);
  }
}
yt(si);
