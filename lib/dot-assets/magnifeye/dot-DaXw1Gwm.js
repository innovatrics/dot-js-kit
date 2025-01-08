var he = Object.defineProperty;
var ee = (s) => {
  throw TypeError(s);
};
var pe = (s, c, e) => c in s ? he(s, c, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[c] = e;
var Qt = (s, c, e) => pe(s, typeof c != "symbol" ? c + "" : c, e), re = (s, c, e) => c.has(s) || ee("Cannot " + e);
var fn = (s, c, e) => (re(s, c, "read from private field"), e ? e.call(s) : c.get(s)), Ct = (s, c, e) => c.has(s) ? ee("Cannot add the same private member more than once") : c instanceof WeakSet ? c.add(s) : c.set(s, e), bt = (s, c, e, g) => (re(s, c, "write to private field"), g ? g.call(s, e) : c.set(s, e), e);
const ie = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, ye = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class nn extends Error {
  constructor(e, g) {
    super(e);
    Qt(this, "cause");
    this.name = "AutoCaptureError", this.cause = g;
  }
  // Change this to Decorator when they will be in stable release
  static logError(e) {
  }
  static fromCameraError(e) {
    if (this.logError(e), e instanceof nn)
      return e;
    let g;
    switch (e.name) {
      case "OverconstrainedError":
        g = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        g = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        g = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        g = "There is no camera available to you";
        break;
      default:
        g = "An unknown camera error has occurred";
        break;
    }
    return new nn(g, e);
  }
  static fromError(e) {
    if (this.logError(e), e instanceof nn)
      return e;
    const g = "An unexpected error has occurred";
    return new nn(g);
  }
}
const me = {
  RGB: "RGB",
  RGBA: "RGBA"
};
var En, Dn, Ln;
class ve {
  constructor(c, e) {
    Ct(this, En);
    Ct(this, Dn);
    Ct(this, Ln);
    bt(this, En, c), bt(this, Dn, this.allocate(e.length * e.BYTES_PER_ELEMENT)), bt(this, Ln, this.allocate(e.length * e.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return fn(this, Dn);
  }
  get bgr0ImagePointer() {
    return fn(this, Ln);
  }
  allocate(c) {
    return fn(this, En)._malloc(c);
  }
  free() {
    fn(this, En)._free(fn(this, Dn)), fn(this, En)._free(fn(this, Ln));
  }
  writeDataToMemory(c) {
    fn(this, En).HEAPU8.set(c, fn(this, Dn));
  }
}
En = new WeakMap(), Dn = new WeakMap(), Ln = new WeakMap();
class ge {
  constructor() {
    Qt(this, "samWasmModule");
  }
  getOverriddenModules(c, e) {
    return {
      locateFile: (g) => new URL(e || g, c).href
    };
  }
  async handleMissingOrInvalidSamModule(c, e) {
    try {
      const g = await fetch(c);
      if (!g.ok)
        throw new nn(
          `The path to ${e} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${c}`
        );
      const C = await g.arrayBuffer();
      if (!WebAssembly.validate(C))
        throw new nn(
          `The provided ${e} is not a valid WASM module. Please check provided path to wasm files. Current path is ${c}`
        );
    } catch (g) {
      if (g instanceof nn)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), g;
    }
  }
  async getSamWasmFileName() {
    return await ye() ? ie.simd : ie.sam;
  }
  async initSamModule(c, e) {
    if (this.samWasmModule)
      return;
    const g = await this.getSamWasmFileName(), C = this.getSamWasmFilePath(e, g);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(c, C));
    } catch {
      throw await this.handleMissingOrInvalidSamModule(C, g), new nn("Could not init detector.");
    }
  }
  async getSamVersion() {
    var e;
    const c = await ((e = this.samWasmModule) == null ? void 0 : e.getInfoString());
    return c == null ? void 0 : c.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(c) {
    if (!this.samWasmModule)
      throw new nn("SAM WASM module is not initialized");
    const e = new ve(this.samWasmModule, c);
    return e.writeDataToMemory(c), e;
  }
  convertToSamColorImage(c, e) {
    if (!this.samWasmModule)
      throw new nn("SAM WASM module is not initialized");
    const g = this.writeImageToMemory(c);
    return this.samWasmModule.convertToSamColorImage(
      e.width,
      e.height,
      g.rgbaImagePointer,
      me.RGBA,
      g.bgr0ImagePointer
    ), g;
  }
}
const we = (s) => Number.parseFloat(s.toFixed(3)), _e = (s, c) => Math.min(s, c);
var Ce = function() {
  var s = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
  return function(c) {
    c = c || {};
    var e;
    e || (e = typeof c < "u" ? c : {});
    var g, C;
    e.ready = new Promise(function(n, t) {
      g = n, C = t;
    });
    var P = {}, b;
    for (b in e) e.hasOwnProperty(b) && (P[b] = e[b]);
    var j = !1, S = !1;
    j = typeof window == "object", S = typeof importScripts == "function";
    var _ = "", M;
    (j || S) && (S ? _ = self.location.href : document.currentScript && (_ = document.currentScript.src), s && (_ = s), _.indexOf("blob:") !== 0 ? _ = _.substr(0, _.lastIndexOf("/") + 1) : _ = "", S && (M = function(n) {
      var t = new XMLHttpRequest();
      return t.open("GET", n, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
    }));
    var I = e.printErr || console.warn.bind(console);
    for (b in P) P.hasOwnProperty(b) && (e[b] = P[b]);
    P = null;
    var W;
    e.wasmBinary && (W = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, typeof WebAssembly != "object" && rn("no native wasm support detected");
    var k, dn = !1;
    function zn(n) {
      n || rn("Assertion failed: undefined");
    }
    var Vn = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
    function Ot(n, t, r) {
      var i = O;
      if (0 < r) {
        r = t + r - 1;
        for (var a = 0; a < n.length; ++a) {
          var o = n.charCodeAt(a);
          if (55296 <= o && 57343 >= o) {
            var l = n.charCodeAt(++a);
            o = 65536 + ((o & 1023) << 10) | l & 1023;
          }
          if (127 >= o) {
            if (t >= r) break;
            i[t++] = o;
          } else {
            if (2047 >= o) {
              if (t + 1 >= r) break;
              i[t++] = 192 | o >> 6;
            } else {
              if (65535 >= o) {
                if (t + 2 >= r) break;
                i[t++] = 224 | o >> 12;
              } else {
                if (t + 3 >= r) break;
                i[t++] = 240 | o >> 18, i[t++] = 128 | o >> 12 & 63;
              }
              i[t++] = 128 | o >> 6 & 63;
            }
            i[t++] = 128 | o & 63;
          }
        }
        i[t] = 0;
      }
    }
    var Gn = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0;
    function St(n, t) {
      for (var r = n >> 1, i = r + t / 2; !(r >= i) && hn[r]; ) ++r;
      if (r <<= 1, 32 < r - n && Gn) return Gn.decode(O.subarray(n, r));
      for (r = 0, i = ""; ; ) {
        var a = J[n + 2 * r >> 1];
        if (a == 0 || r == t / 2) return i;
        ++r, i += String.fromCharCode(a);
      }
    }
    function kt(n, t, r) {
      if (r === void 0 && (r = 2147483647), 2 > r) return 0;
      r -= 2;
      var i = t;
      r = r < 2 * n.length ? r / 2 : n.length;
      for (var a = 0; a < r; ++a) J[t >> 1] = n.charCodeAt(a), t += 2;
      return J[t >> 1] = 0, t - i;
    }
    function Rt(n) {
      return 2 * n.length;
    }
    function Mt(n, t) {
      for (var r = 0, i = ""; !(r >= t / 4); ) {
        var a = x[n + 4 * r >> 2];
        if (a == 0) break;
        ++r, 65536 <= a ? (a -= 65536, i += String.fromCharCode(55296 | a >> 10, 56320 | a & 1023)) : i += String.fromCharCode(a);
      }
      return i;
    }
    function It(n, t, r) {
      if (r === void 0 && (r = 2147483647), 4 > r) return 0;
      var i = t;
      r = i + r - 4;
      for (var a = 0; a < n.length; ++a) {
        var o = n.charCodeAt(a);
        if (55296 <= o && 57343 >= o) {
          var l = n.charCodeAt(++a);
          o = 65536 + ((o & 1023) << 10) | l & 1023;
        }
        if (x[t >> 2] = o, t += 4, t + 4 > r) break;
      }
      return x[t >> 2] = 0, t - i;
    }
    function xt(n) {
      for (var t = 0, r = 0; r < n.length; ++r) {
        var i = n.charCodeAt(r);
        55296 <= i && 57343 >= i && ++r, t += 4;
      }
      return t;
    }
    var $, tn, O, J, hn, x, N, Yn, $n;
    function Jn(n) {
      $ = n, e.HEAP8 = tn = new Int8Array(n), e.HEAP16 = J = new Int16Array(n), e.HEAP32 = x = new Int32Array(n), e.HEAPU8 = O = new Uint8Array(n), e.HEAPU16 = hn = new Uint16Array(n), e.HEAPU32 = N = new Uint32Array(n), e.HEAPF32 = Yn = new Float32Array(n), e.HEAPF64 = $n = new Float64Array(n);
    }
    var Zn = e.INITIAL_MEMORY || 16777216;
    e.wasmMemory ? k = e.wasmMemory : k = new WebAssembly.Memory({ initial: Zn / 65536, maximum: 32768 }), k && ($ = k.buffer), Zn = $.byteLength, Jn($);
    var Xn = [], Qn = [], Ft = [], Kn = [];
    function jt() {
      var n = e.preRun.shift();
      Xn.unshift(n);
    }
    var V = 0, en = null;
    e.preloadedImages = {}, e.preloadedAudios = {};
    function rn(n) {
      throw e.onAbort && e.onAbort(n), I(n), dn = !0, n = new WebAssembly.RuntimeError("abort(" + n + "). Build with -s ASSERTIONS=1 for more info."), C(n), n;
    }
    function Pn(n) {
      var t = G;
      return String.prototype.startsWith ? t.startsWith(n) : t.indexOf(n) === 0;
    }
    function qn() {
      return Pn("data:application/octet-stream;base64,");
    }
    var G = "dot-sam.wasm";
    if (!qn()) {
      var nt = G;
      G = e.locateFile ? e.locateFile(nt, _) : _ + nt;
    }
    function tt() {
      try {
        if (W) return new Uint8Array(W);
        if (M) return M(G);
        throw "both async and sync fetching of the wasm failed";
      } catch (n) {
        rn(n);
      }
    }
    function Ut() {
      return W || !j && !S || typeof fetch != "function" || Pn("file://") ? Promise.resolve().then(tt) : fetch(G, { credentials: "same-origin" }).then(function(n) {
        if (!n.ok) throw "failed to load wasm binary file at '" + G + "'";
        return n.arrayBuffer();
      }).catch(function() {
        return tt();
      });
    }
    function pn(n) {
      for (; 0 < n.length; ) {
        var t = n.shift();
        if (typeof t == "function") t(e);
        else {
          var r = t.Aa;
          typeof r == "number" ? t.sa === void 0 ? Wn("v", r)() : Wn("vi", r)(t.sa) : r(t.sa === void 0 ? null : t.sa);
        }
      }
    }
    function Wn(n, t) {
      var r = [];
      return function() {
        r.length = arguments.length;
        for (var i = 0; i < arguments.length; i++) r[i] = arguments[i];
        return r && r.length ? e["dynCall_" + n].apply(null, [t].concat(r)) : e["dynCall_" + n].call(null, t);
      };
    }
    function Nt(n) {
      this.ca = n - 16, this.Na = function(t) {
        x[this.ca + 8 >> 2] = t;
      }, this.Ka = function(t) {
        x[this.ca + 0 >> 2] = t;
      }, this.La = function() {
        x[this.ca + 4 >> 2] = 0;
      }, this.Ja = function() {
        tn[this.ca + 12 >> 0] = 0;
      }, this.Ma = function() {
        tn[this.ca + 13 >> 0] = 0;
      }, this.Ea = function(t, r) {
        this.Na(t), this.Ka(r), this.La(), this.Ja(), this.Ma();
      };
    }
    function yn() {
      return 0 < yn.wa;
    }
    function On(n) {
      switch (n) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + n);
      }
    }
    var et = void 0;
    function T(n) {
      for (var t = ""; O[n]; ) t += et[O[n++]];
      return t;
    }
    var Z = {}, Y = {}, mn = {};
    function Sn(n) {
      if (n === void 0) return "_unknown";
      n = n.replace(/[^a-zA-Z0-9_]/g, "$");
      var t = n.charCodeAt(0);
      return 48 <= t && 57 >= t ? "_" + n : n;
    }
    function kn(n, t) {
      return n = Sn(n), new Function("body", "return function " + n + `() {
    "use strict";    return body.apply(this, arguments);
};
`)(t);
    }
    function Rn(n) {
      var t = Error, r = kn(n, function(i) {
        this.name = n, this.message = i, i = Error(i).stack, i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return r.prototype = Object.create(t.prototype), r.prototype.constructor = r, r.prototype.toString = function() {
        return this.message === void 0 ? this.name : this.name + ": " + this.message;
      }, r;
    }
    var X = void 0;
    function m(n) {
      throw new X(n);
    }
    var rt = void 0;
    function vn(n) {
      throw new rt(n);
    }
    function Q(n, t, r) {
      function i(u) {
        u = r(u), u.length !== n.length && vn("Mismatched type converter count");
        for (var p = 0; p < n.length; ++p) B(n[p], u[p]);
      }
      n.forEach(function(u) {
        mn[u] = t;
      });
      var a = Array(t.length), o = [], l = 0;
      t.forEach(function(u, p) {
        Y.hasOwnProperty(u) ? a[p] = Y[u] : (o.push(u), Z.hasOwnProperty(u) || (Z[u] = []), Z[u].push(function() {
          a[p] = Y[u], ++l, l === o.length && i(a);
        }));
      }), o.length === 0 && i(a);
    }
    function B(n, t, r) {
      if (r = r || {}, !("argPackAdvance" in t)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var i = t.name;
      if (n || m('type "' + i + '" must have a positive integer typeid pointer'), Y.hasOwnProperty(n)) {
        if (r.Da) return;
        m("Cannot register type '" + i + "' twice");
      }
      Y[n] = t, delete mn[n], Z.hasOwnProperty(n) && (t = Z[n], delete Z[n], t.forEach(function(a) {
        a();
      }));
    }
    function Bt(n) {
      return { count: n.count, na: n.na, oa: n.oa, ca: n.ca, ea: n.ea, fa: n.fa, ga: n.ga };
    }
    function Mn(n) {
      m(n.ba.ea.da.name + " instance already deleted");
    }
    var In = !1;
    function it() {
    }
    function at(n) {
      --n.count.value, n.count.value === 0 && (n.fa ? n.ga.ma(n.fa) : n.ea.da.ma(n.ca));
    }
    function an(n) {
      return typeof FinalizationGroup > "u" ? (an = function(t) {
        return t;
      }, n) : (In = new FinalizationGroup(function(t) {
        for (var r = t.next(); !r.done; r = t.next()) r = r.value, r.ca ? at(r) : console.warn("object already deleted: " + r.ca);
      }), an = function(t) {
        return In.register(t, t.ba, t.ba), t;
      }, it = function(t) {
        In.unregister(t.ba);
      }, an(n));
    }
    var on = void 0, un = [];
    function xn() {
      for (; un.length; ) {
        var n = un.pop();
        n.ba.na = !1, n.delete();
      }
    }
    function L() {
    }
    var ot = {};
    function Dt(n, t) {
      var r = e;
      if (r[n].ia === void 0) {
        var i = r[n];
        r[n] = function() {
          return r[n].ia.hasOwnProperty(arguments.length) || m("Function '" + t + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + r[n].ia + ")!"), r[n].ia[arguments.length].apply(this, arguments);
        }, r[n].ia = [], r[n].ia[i.xa] = i;
      }
    }
    function ut(n, t, r) {
      e.hasOwnProperty(n) ? ((r === void 0 || e[n].ia !== void 0 && e[n].ia[r] !== void 0) && m("Cannot register public name '" + n + "' twice"), Dt(n, n), e.hasOwnProperty(r) && m("Cannot register multiple overloads of a function with the same number of arguments (" + r + ")!"), e[n].ia[r] = t) : (e[n] = t, r !== void 0 && (e[n].Qa = r));
    }
    function Ht(n, t, r, i, a, o, l, u) {
      this.name = n, this.constructor = t, this.la = r, this.ma = i, this.ha = a, this.Ba = o, this.pa = l, this.za = u;
    }
    function gn(n, t, r) {
      for (; t !== r; ) t.pa || m("Expected null or instance of " + r.name + ", got an instance of " + t.name), n = t.pa(n), t = t.ha;
      return n;
    }
    function Lt(n, t) {
      return t === null ? (this.ta && m("null is not a valid " + this.name), 0) : (t.ba || m('Cannot pass "' + q(t) + '" as a ' + this.name), t.ba.ca || m("Cannot pass deleted object as a pointer of type " + this.name), gn(t.ba.ca, t.ba.ea.da, this.da));
    }
    function zt(n, t) {
      if (t === null) {
        if (this.ta && m("null is not a valid " + this.name), this.ra) {
          var r = this.Ga();
          return n !== null && n.push(this.ma, r), r;
        }
        return 0;
      }
      if (t.ba || m('Cannot pass "' + q(t) + '" as a ' + this.name), t.ba.ca || m("Cannot pass deleted object as a pointer of type " + this.name), !this.qa && t.ba.ea.qa && m("Cannot convert argument of type " + (t.ba.ga ? t.ba.ga.name : t.ba.ea.name) + " to parameter type " + this.name), r = gn(t.ba.ca, t.ba.ea.da, this.da), this.ra) switch (t.ba.fa === void 0 && m("Passing raw pointer to smart pointer is illegal"), this.Oa) {
        case 0:
          t.ba.ga === this ? r = t.ba.fa : m("Cannot convert argument of type " + (t.ba.ga ? t.ba.ga.name : t.ba.ea.name) + " to parameter type " + this.name);
          break;
        case 1:
          r = t.ba.fa;
          break;
        case 2:
          if (t.ba.ga === this) r = t.ba.fa;
          else {
            var i = t.clone();
            r = this.Ha(r, K(function() {
              i.delete();
            })), n !== null && n.push(this.ma, r);
          }
          break;
        default:
          m("Unsupporting sharing policy");
      }
      return r;
    }
    function Vt(n, t) {
      return t === null ? (this.ta && m("null is not a valid " + this.name), 0) : (t.ba || m('Cannot pass "' + q(t) + '" as a ' + this.name), t.ba.ca || m("Cannot pass deleted object as a pointer of type " + this.name), t.ba.ea.qa && m("Cannot convert argument of type " + t.ba.ea.name + " to parameter type " + this.name), gn(t.ba.ca, t.ba.ea.da, this.da));
    }
    function wn(n) {
      return this.fromWireType(N[n >> 2]);
    }
    function st(n, t, r) {
      return t === r ? n : r.ha === void 0 ? null : (n = st(n, t, r.ha), n === null ? null : r.za(n));
    }
    var sn = {};
    function Gt(n, t) {
      for (t === void 0 && m("ptr should not be undefined"); n.ha; ) t = n.pa(t), n = n.ha;
      return sn[t];
    }
    function _n(n, t) {
      return t.ea && t.ca || vn("makeClassHandle requires ptr and ptrType"), !!t.ga != !!t.fa && vn("Both smartPtrType and smartPtr must be specified"), t.count = { value: 1 }, an(Object.create(n, { ba: { value: t } }));
    }
    function D(n, t, r, i) {
      this.name = n, this.da = t, this.ta = r, this.qa = i, this.ra = !1, this.ma = this.Ha = this.Ga = this.va = this.Oa = this.Fa = void 0, t.ha !== void 0 ? this.toWireType = zt : (this.toWireType = i ? Lt : Vt, this.ja = null);
    }
    function ct(n, t, r) {
      e.hasOwnProperty(n) || vn("Replacing nonexistant public symbol"), e[n].ia !== void 0 && r !== void 0 ? e[n].ia[r] = t : (e[n] = t, e[n].xa = r);
    }
    function z(n, t) {
      n = T(n);
      var r = Wn(n, t);
      return typeof r != "function" && m("unknown function pointer with signature " + n + ": " + t), r;
    }
    var lt = void 0;
    function ft(n) {
      n = wt(n);
      var t = T(n);
      return H(n), t;
    }
    function cn(n, t) {
      function r(o) {
        a[o] || Y[o] || (mn[o] ? mn[o].forEach(r) : (i.push(o), a[o] = !0));
      }
      var i = [], a = {};
      throw t.forEach(r), new lt(n + ": " + i.map(ft).join([", "]));
    }
    function dt(n, t) {
      for (var r = [], i = 0; i < n; i++) r.push(x[(t >> 2) + i]);
      return r;
    }
    function Cn(n) {
      for (; n.length; ) {
        var t = n.pop();
        n.pop()(t);
      }
    }
    function ht(n, t, r) {
      return n instanceof Object || m(r + ' with invalid "this": ' + n), n instanceof t.da.constructor || m(r + ' incompatible with "this" of type ' + n.constructor.name), n.ba.ca || m("cannot call emscripten binding method " + r + " on deleted object"), gn(n.ba.ca, n.ba.ea.da, t.da);
    }
    var Fn = [], R = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }];
    function jn(n) {
      4 < n && --R[n].Ia === 0 && (R[n] = void 0, Fn.push(n));
    }
    function K(n) {
      switch (n) {
        case void 0:
          return 1;
        case null:
          return 2;
        case !0:
          return 3;
        case !1:
          return 4;
        default:
          var t = Fn.length ? Fn.pop() : R.length;
          return R[t] = { Ia: 1, value: n }, t;
      }
    }
    function q(n) {
      if (n === null) return "null";
      var t = typeof n;
      return t === "object" || t === "array" || t === "function" ? n.toString() : "" + n;
    }
    function Yt(n, t) {
      switch (t) {
        case 2:
          return function(r) {
            return this.fromWireType(Yn[r >> 2]);
          };
        case 3:
          return function(r) {
            return this.fromWireType($n[r >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + n);
      }
    }
    function $t(n) {
      var t = Function;
      if (!(t instanceof Function)) throw new TypeError("new_ called with constructor type " + typeof t + " which is not a function");
      var r = kn(t.name || "unknownFunctionName", function() {
      });
      return r.prototype = t.prototype, r = new r(), n = t.apply(r, n), n instanceof Object ? n : r;
    }
    function Jt(n, t, r) {
      switch (t) {
        case 0:
          return r ? function(i) {
            return tn[i];
          } : function(i) {
            return O[i];
          };
        case 1:
          return r ? function(i) {
            return J[i >> 1];
          } : function(i) {
            return hn[i >> 1];
          };
        case 2:
          return r ? function(i) {
            return x[i >> 2];
          } : function(i) {
            return N[i >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + n);
      }
    }
    function Un(n) {
      return n || m("Cannot use deleted val. handle = " + n), R[n].value;
    }
    function pt(n, t) {
      var r = Y[n];
      return r === void 0 && m(t + " has unknown type " + ft(n)), r;
    }
    var Zt = {}, yt = [];
    function mt(n) {
      var t = {}, r;
      for (r in n) (function(i) {
        var a = n[i];
        t[i] = typeof a == "function" ? function() {
          yt.push(i);
          try {
            return a.apply(null, arguments);
          } finally {
            if (dn) return;
            var o = yt.pop();
            zn(o === i);
          }
        } : a;
      })(r);
      return t;
    }
    for (var vt = Array(256), bn = 0; 256 > bn; ++bn) vt[bn] = String.fromCharCode(bn);
    et = vt, X = e.BindingError = Rn("BindingError"), rt = e.InternalError = Rn("InternalError"), L.prototype.isAliasOf = function(n) {
      if (!(this instanceof L && n instanceof L)) return !1;
      var t = this.ba.ea.da, r = this.ba.ca, i = n.ba.ea.da;
      for (n = n.ba.ca; t.ha; ) r = t.pa(r), t = t.ha;
      for (; i.ha; ) n = i.pa(n), i = i.ha;
      return t === i && r === n;
    }, L.prototype.clone = function() {
      if (this.ba.ca || Mn(this), this.ba.oa) return this.ba.count.value += 1, this;
      var n = an(Object.create(Object.getPrototypeOf(this), { ba: { value: Bt(this.ba) } }));
      return n.ba.count.value += 1, n.ba.na = !1, n;
    }, L.prototype.delete = function() {
      this.ba.ca || Mn(this), this.ba.na && !this.ba.oa && m("Object already scheduled for deletion"), it(this), at(this.ba), this.ba.oa || (this.ba.fa = void 0, this.ba.ca = void 0);
    }, L.prototype.isDeleted = function() {
      return !this.ba.ca;
    }, L.prototype.deleteLater = function() {
      return this.ba.ca || Mn(this), this.ba.na && !this.ba.oa && m("Object already scheduled for deletion"), un.push(this), un.length === 1 && on && on(xn), this.ba.na = !0, this;
    }, D.prototype.Ca = function(n) {
      return this.va && (n = this.va(n)), n;
    }, D.prototype.ua = function(n) {
      this.ma && this.ma(n);
    }, D.prototype.argPackAdvance = 8, D.prototype.readValueFromPointer = wn, D.prototype.deleteObject = function(n) {
      n !== null && n.delete();
    }, D.prototype.fromWireType = function(n) {
      function t() {
        return this.ra ? _n(this.da.la, { ea: this.Fa, ca: r, ga: this, fa: n }) : _n(this.da.la, { ea: this, ca: n });
      }
      var r = this.Ca(n);
      if (!r) return this.ua(n), null;
      var i = Gt(this.da, r);
      if (i !== void 0)
        return i.ba.count.value === 0 ? (i.ba.ca = r, i.ba.fa = n, i.clone()) : (i = i.clone(), this.ua(n), i);
      if (i = this.da.Ba(r), i = ot[i], !i) return t.call(this);
      i = this.qa ? i.ya : i.pointerType;
      var a = st(r, this.da, i.da);
      return a === null ? t.call(this) : this.ra ? _n(i.da.la, { ea: i, ca: a, ga: this, fa: n }) : _n(
        i.da.la,
        { ea: i, ca: a }
      );
    }, e.getInheritedInstanceCount = function() {
      return Object.keys(sn).length;
    }, e.getLiveInheritedInstances = function() {
      var n = [], t;
      for (t in sn) sn.hasOwnProperty(t) && n.push(sn[t]);
      return n;
    }, e.flushPendingDeletes = xn, e.setDelayFunction = function(n) {
      on = n, un.length && on && on(xn);
    }, lt = e.UnboundTypeError = Rn("UnboundTypeError"), e.count_emval_handles = function() {
      for (var n = 0, t = 5; t < R.length; ++t) R[t] !== void 0 && ++n;
      return n;
    }, e.get_first_emval = function() {
      for (var n = 5; n < R.length; ++n) if (R[n] !== void 0) return R[n];
      return null;
    }, Qn.push({ Aa: function() {
      gt();
    } });
    var Xt = {
      x: function(n) {
        return An(n + 16) + 16;
      },
      s: function(n, t, r) {
        throw new Nt(n).Ea(t, r), "uncaught_exception" in yn ? yn.wa++ : yn.wa = 1, n;
      },
      u: function(n, t, r, i, a) {
        var o = On(r);
        t = T(t), B(n, { name: t, fromWireType: function(l) {
          return !!l;
        }, toWireType: function(l, u) {
          return u ? i : a;
        }, argPackAdvance: 8, readValueFromPointer: function(l) {
          if (r === 1) var u = tn;
          else if (r === 2) u = J;
          else if (r === 4) u = x;
          else throw new TypeError("Unknown boolean type size: " + t);
          return this.fromWireType(u[l >> o]);
        }, ja: null });
      },
      h: function(n, t, r, i, a, o, l, u, p, f, d, h, v) {
        d = T(d), o = z(a, o), u && (u = z(l, u)), f && (f = z(p, f)), v = z(h, v);
        var w = Sn(d);
        ut(w, function() {
          cn("Cannot construct " + d + " due to unbound types", [i]);
        }), Q([n, t, r], i ? [i] : [], function(y) {
          if (y = y[0], i)
            var U = y.da, A = U.la;
          else A = L.prototype;
          y = kn(w, function() {
            if (Object.getPrototypeOf(this) !== E) throw new X("Use 'new' to construct " + d);
            if (F.ka === void 0) throw new X(d + " has no accessible constructor");
            var _t = F.ka[arguments.length];
            if (_t === void 0) throw new X("Tried to invoke ctor of " + d + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(F.ka).toString() + ") parameters instead!");
            return _t.apply(this, arguments);
          });
          var E = Object.create(A, { constructor: { value: y } });
          y.prototype = E;
          var F = new Ht(d, y, E, v, U, o, u, f);
          U = new D(d, F, !0, !1), A = new D(d + "*", F, !1, !1);
          var ln = new D(d + " const*", F, !1, !0);
          return ot[n] = { pointerType: A, ya: ln }, ct(w, y), [U, A, ln];
        });
      },
      g: function(n, t, r, i, a, o) {
        zn(0 < t);
        var l = dt(t, r);
        a = z(i, a);
        var u = [o], p = [];
        Q([], [n], function(f) {
          f = f[0];
          var d = "constructor " + f.name;
          if (f.da.ka === void 0 && (f.da.ka = []), f.da.ka[t - 1] !== void 0) throw new X("Cannot register multiple constructors with identical number of parameters (" + (t - 1) + ") for class '" + f.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          return f.da.ka[t - 1] = function() {
            cn("Cannot construct " + f.name + " due to unbound types", l);
          }, Q([], l, function(h) {
            return f.da.ka[t - 1] = function() {
              arguments.length !== t - 1 && m(d + " called with " + arguments.length + " arguments, expected " + (t - 1)), p.length = 0, u.length = t;
              for (var v = 1; v < t; ++v) u[v] = h[v].toWireType(
                p,
                arguments[v - 1]
              );
              return v = a.apply(null, u), Cn(p), h[0].fromWireType(v);
            }, [];
          }), [];
        });
      },
      b: function(n, t, r, i, a, o, l, u, p, f) {
        t = T(t), a = z(i, a), Q([], [n], function(d) {
          d = d[0];
          var h = d.name + "." + t, v = { get: function() {
            cn("Cannot access " + h + " due to unbound types", [r, l]);
          }, enumerable: !0, configurable: !0 };
          return p ? v.set = function() {
            cn("Cannot access " + h + " due to unbound types", [r, l]);
          } : v.set = function() {
            m(h + " is a read-only property");
          }, Object.defineProperty(d.da.la, t, v), Q([], p ? [r, l] : [r], function(w) {
            var y = w[0], U = { get: function() {
              var E = ht(this, d, h + " getter");
              return y.fromWireType(a(o, E));
            }, enumerable: !0 };
            if (p) {
              p = z(u, p);
              var A = w[1];
              U.set = function(E) {
                var F = ht(this, d, h + " setter"), ln = [];
                p(f, F, A.toWireType(ln, E)), Cn(ln);
              };
            }
            return Object.defineProperty(d.da.la, t, U), [];
          }), [];
        });
      },
      t: function(n, t) {
        t = T(t), B(n, { name: t, fromWireType: function(r) {
          var i = R[r].value;
          return jn(r), i;
        }, toWireType: function(r, i) {
          return K(i);
        }, argPackAdvance: 8, readValueFromPointer: wn, ja: null });
      },
      m: function(n, t, r) {
        r = On(r), t = T(t), B(n, {
          name: t,
          fromWireType: function(i) {
            return i;
          },
          toWireType: function(i, a) {
            if (typeof a != "number" && typeof a != "boolean") throw new TypeError('Cannot convert "' + q(a) + '" to ' + this.name);
            return a;
          },
          argPackAdvance: 8,
          readValueFromPointer: Yt(t, r),
          ja: null
        });
      },
      c: function(n, t, r, i, a, o) {
        var l = dt(t, r);
        n = T(n), a = z(i, a), ut(n, function() {
          cn("Cannot call " + n + " due to unbound types", l);
        }, t - 1), Q([], l, function(u) {
          var p = n, f = n;
          u = [u[0], null].concat(u.slice(1));
          var d = a, h = u.length;
          2 > h && m("argTypes array size mismatch! Must at least get return value and 'this' types!");
          for (var v = u[1] !== null && !1, w = !1, y = 1; y < u.length; ++y) if (u[y] !== null && u[y].ja === void 0) {
            w = !0;
            break;
          }
          var U = u[0].name !== "void", A = "", E = "";
          for (y = 0; y < h - 2; ++y) A += (y !== 0 ? ", " : "") + "arg" + y, E += (y !== 0 ? ", " : "") + "arg" + y + "Wired";
          f = "return function " + Sn(f) + "(" + A + `) {
if (arguments.length !== ` + (h - 2) + `) {
throwBindingError('function ` + f + " called with ' + arguments.length + ' arguments, expected " + (h - 2) + ` args!');
}
`, w && (f += `var destructors = [];
`);
          var F = w ? "destructors" : "null";
          for (A = "throwBindingError invoker fn runDestructors retType classParam".split(" "), d = [m, d, o, Cn, u[0], u[1]], v && (f += "var thisWired = classParam.toWireType(" + F + `, this);
`), y = 0; y < h - 2; ++y) f += "var arg" + y + "Wired = argType" + y + ".toWireType(" + F + ", arg" + y + "); // " + u[y + 2].name + `
`, A.push("argType" + y), d.push(u[y + 2]);
          if (v && (E = "thisWired" + (0 < E.length ? ", " : "") + E), f += (U ? "var rv = " : "") + "invoker(fn" + (0 < E.length ? ", " : "") + E + `);
`, w) f += `runDestructors(destructors);
`;
          else for (y = v ? 1 : 2; y < u.length; ++y) h = y === 1 ? "thisWired" : "arg" + (y - 2) + "Wired", u[y].ja !== null && (f += h + "_dtor(" + h + "); // " + u[y].name + `
`, A.push(h + "_dtor"), d.push(u[y].ja));
          return U && (f += `var ret = retType.fromWireType(rv);
return ret;
`), A.push(f + `}
`), u = $t(A).apply(null, d), ct(p, u, t - 1), [];
        });
      },
      e: function(n, t, r, i, a) {
        function o(f) {
          return f;
        }
        t = T(t), a === -1 && (a = 4294967295);
        var l = On(r);
        if (i === 0) {
          var u = 32 - 8 * r;
          o = function(f) {
            return f << u >>> u;
          };
        }
        var p = t.indexOf("unsigned") != -1;
        B(n, { name: t, fromWireType: o, toWireType: function(f, d) {
          if (typeof d != "number" && typeof d != "boolean") throw new TypeError('Cannot convert "' + q(d) + '" to ' + this.name);
          if (d < i || d > a) throw new TypeError('Passing a number "' + q(d) + '" from JS side to C/C++ side to an argument of type "' + t + '", which is outside the valid range [' + i + ", " + a + "]!");
          return p ? d >>> 0 : d | 0;
        }, argPackAdvance: 8, readValueFromPointer: Jt(t, l, i !== 0), ja: null });
      },
      d: function(n, t, r) {
        function i(o) {
          o >>= 2;
          var l = N;
          return new a($, l[o + 1], l[o]);
        }
        var a = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t];
        r = T(r), B(n, { name: r, fromWireType: i, argPackAdvance: 8, readValueFromPointer: i }, { Da: !0 });
      },
      n: function(n, t) {
        t = T(t);
        var r = t === "std::string";
        B(n, {
          name: t,
          fromWireType: function(i) {
            var a = N[i >> 2];
            if (r) for (var o = i + 4, l = 0; l <= a; ++l) {
              var u = i + 4 + l;
              if (l == a || O[u] == 0) {
                if (o) {
                  var p = o, f = O, d = p + (u - o);
                  for (o = p; f[o] && !(o >= d); ) ++o;
                  if (16 < o - p && f.subarray && Vn) p = Vn.decode(f.subarray(p, o));
                  else {
                    for (d = ""; p < o; ) {
                      var h = f[p++];
                      if (h & 128) {
                        var v = f[p++] & 63;
                        if ((h & 224) == 192) d += String.fromCharCode((h & 31) << 6 | v);
                        else {
                          var w = f[p++] & 63;
                          h = (h & 240) == 224 ? (h & 15) << 12 | v << 6 | w : (h & 7) << 18 | v << 12 | w << 6 | f[p++] & 63, 65536 > h ? d += String.fromCharCode(h) : (h -= 65536, d += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
                        }
                      } else d += String.fromCharCode(h);
                    }
                    p = d;
                  }
                } else p = "";
                if (y === void 0) var y = p;
                else y += "\0", y += p;
                o = u + 1;
              }
            }
            else {
              for (y = Array(a), l = 0; l < a; ++l) y[l] = String.fromCharCode(O[i + 4 + l]);
              y = y.join("");
            }
            return H(i), y;
          },
          toWireType: function(i, a) {
            a instanceof ArrayBuffer && (a = new Uint8Array(a));
            var o = typeof a == "string";
            o || a instanceof Uint8Array || a instanceof Uint8ClampedArray || a instanceof Int8Array || m("Cannot pass non-string to std::string");
            var l = (r && o ? function() {
              for (var f = 0, d = 0; d < a.length; ++d) {
                var h = a.charCodeAt(d);
                55296 <= h && 57343 >= h && (h = 65536 + ((h & 1023) << 10) | a.charCodeAt(++d) & 1023), 127 >= h ? ++f : f = 2047 >= h ? f + 2 : 65535 >= h ? f + 3 : f + 4;
              }
              return f;
            } : function() {
              return a.length;
            })(), u = An(4 + l + 1);
            if (N[u >> 2] = l, r && o) Ot(a, u + 4, l + 1);
            else if (o) for (o = 0; o < l; ++o) {
              var p = a.charCodeAt(o);
              255 < p && (H(u), m("String has UTF-16 code units that do not fit in 8 bits")), O[u + 4 + o] = p;
            }
            else for (o = 0; o < l; ++o) O[u + 4 + o] = a[o];
            return i !== null && i.push(H, u), u;
          },
          argPackAdvance: 8,
          readValueFromPointer: wn,
          ja: function(i) {
            H(i);
          }
        });
      },
      j: function(n, t, r) {
        if (r = T(r), t === 2)
          var i = St, a = kt, o = Rt, l = function() {
            return hn;
          }, u = 1;
        else t === 4 && (i = Mt, a = It, o = xt, l = function() {
          return N;
        }, u = 2);
        B(n, { name: r, fromWireType: function(p) {
          for (var f = N[p >> 2], d = l(), h, v = p + 4, w = 0; w <= f; ++w) {
            var y = p + 4 + w * t;
            (w == f || d[y >> u] == 0) && (v = i(v, y - v), h === void 0 ? h = v : (h += "\0", h += v), v = y + t);
          }
          return H(p), h;
        }, toWireType: function(p, f) {
          typeof f != "string" && m("Cannot pass non-string to C++ string type " + r);
          var d = o(f), h = An(4 + d + t);
          return N[h >> 2] = d >> u, a(f, h + 4, d + t), p !== null && p.push(H, h), h;
        }, argPackAdvance: 8, readValueFromPointer: wn, ja: function(p) {
          H(p);
        } });
      },
      v: function(n, t) {
        t = T(t), B(n, { Pa: !0, name: t, argPackAdvance: 0, fromWireType: function() {
        }, toWireType: function() {
        } });
      },
      k: function(n, t, r) {
        n = Un(n), t = pt(t, "emval::as");
        var i = [], a = K(i);
        return x[r >> 2] = a, t.toWireType(i, n);
      },
      i: jn,
      l: function(n, t) {
        return n = Un(n), t = Un(t), K(n[t]);
      },
      p: function(n) {
        var t = Zt[n];
        return K(t === void 0 ? T(n) : t);
      },
      o: function(n) {
        Cn(R[n].value), jn(n);
      },
      w: function(n, t) {
        return n = pt(n, "_emval_take_value"), n = n.readValueFromPointer(t), K(n);
      },
      f: function() {
        rn();
      },
      q: function(n, t, r) {
        O.copyWithin(n, t, t + r);
      },
      r: function(n) {
        n >>>= 0;
        var t = O.length;
        if (2147483648 < n) return !1;
        for (var r = 1; 4 >= r; r *= 2) {
          var i = t * (1 + 0.2 / r);
          i = Math.min(i, n + 100663296), i = Math.max(16777216, n, i), 0 < i % 65536 && (i += 65536 - i % 65536);
          n: {
            try {
              k.grow(Math.min(2147483648, i) - $.byteLength + 65535 >>> 16), Jn(k.buffer);
              var a = 1;
              break n;
            } catch {
            }
            a = void 0;
          }
          if (a) return !0;
        }
        return !1;
      },
      a: k
    };
    (function() {
      function n(o) {
        o = o.exports, o = mt(o), e.asm = o, V--, e.monitorRunDependencies && e.monitorRunDependencies(V), V == 0 && en && (o = en, en = null, o());
      }
      function t(o) {
        n(o.instance);
      }
      function r(o) {
        return Ut().then(function(l) {
          return WebAssembly.instantiate(l, i);
        }).then(o, function(l) {
          I("failed to asynchronously prepare wasm: " + l), rn(l);
        });
      }
      var i = { a: Xt };
      if (V++, e.monitorRunDependencies && e.monitorRunDependencies(V), e.instantiateWasm) try {
        var a = e.instantiateWasm(i, n);
        return a = mt(a);
      } catch (o) {
        return I("Module.instantiateWasm callback failed with error: " + o), !1;
      }
      return function() {
        if (W || typeof WebAssembly.instantiateStreaming != "function" || qn() || Pn("file://") || typeof fetch != "function") return r(t);
        fetch(G, { credentials: "same-origin" }).then(function(o) {
          return WebAssembly.instantiateStreaming(o, i).then(t, function(l) {
            return I("wasm streaming compile failed: " + l), I("falling back to ArrayBuffer instantiation"), r(t);
          });
        });
      }(), {};
    })();
    var gt = e.___wasm_call_ctors = function() {
      return (gt = e.___wasm_call_ctors = e.asm.z).apply(null, arguments);
    }, An = e._malloc = function() {
      return (An = e._malloc = e.asm.A).apply(null, arguments);
    }, H = e._free = function() {
      return (H = e._free = e.asm.B).apply(null, arguments);
    }, wt = e.___getTypeName = function() {
      return (wt = e.___getTypeName = e.asm.C).apply(null, arguments);
    };
    e.___embind_register_native_and_builtin_types = function() {
      return (e.___embind_register_native_and_builtin_types = e.asm.D).apply(null, arguments);
    }, e.dynCall_ii = function() {
      return (e.dynCall_ii = e.asm.E).apply(null, arguments);
    }, e.dynCall_vi = function() {
      return (e.dynCall_vi = e.asm.F).apply(null, arguments);
    }, e.dynCall_i = function() {
      return (e.dynCall_i = e.asm.G).apply(null, arguments);
    }, e.dynCall_iii = function() {
      return (e.dynCall_iii = e.asm.H).apply(null, arguments);
    }, e.dynCall_viii = function() {
      return (e.dynCall_viii = e.asm.I).apply(null, arguments);
    }, e.dynCall_fii = function() {
      return (e.dynCall_fii = e.asm.J).apply(null, arguments);
    }, e.dynCall_viif = function() {
      return (e.dynCall_viif = e.asm.K).apply(null, arguments);
    }, e.dynCall_viiii = function() {
      return (e.dynCall_viiii = e.asm.L).apply(null, arguments);
    }, e.dynCall_viiiiii = function() {
      return (e.dynCall_viiiiii = e.asm.M).apply(null, arguments);
    }, e.dynCall_iiiiii = function() {
      return (e.dynCall_iiiiii = e.asm.N).apply(null, arguments);
    }, e.dynCall_viiiii = function() {
      return (e.dynCall_viiiii = e.asm.O).apply(null, arguments);
    }, e.dynCall_iiiiiiii = function() {
      return (e.dynCall_iiiiiiii = e.asm.P).apply(null, arguments);
    }, e.dynCall_viiiiiii = function() {
      return (e.dynCall_viiiiiii = e.asm.Q).apply(null, arguments);
    }, e.dynCall_viiiiiiiiidi = function() {
      return (e.dynCall_viiiiiiiiidi = e.asm.R).apply(null, arguments);
    }, e.dynCall_viiiiiiiidi = function() {
      return (e.dynCall_viiiiiiiidi = e.asm.S).apply(null, arguments);
    }, e.dynCall_viiiiiiiiii = function() {
      return (e.dynCall_viiiiiiiiii = e.asm.T).apply(null, arguments);
    }, e.dynCall_viiiiiiiii = function() {
      return (e.dynCall_viiiiiiiii = e.asm.U).apply(null, arguments);
    }, e.dynCall_viiiiiiii = function() {
      return (e.dynCall_viiiiiiii = e.asm.V).apply(null, arguments);
    }, e.dynCall_iiiiiii = function() {
      return (e.dynCall_iiiiiii = e.asm.W).apply(null, arguments);
    }, e.dynCall_iiiii = function() {
      return (e.dynCall_iiiii = e.asm.X).apply(null, arguments);
    }, e.dynCall_iiii = function() {
      return (e.dynCall_iiii = e.asm.Y).apply(null, arguments);
    }, e._asyncify_start_unwind = function() {
      return (e._asyncify_start_unwind = e.asm.Z).apply(null, arguments);
    }, e._asyncify_stop_unwind = function() {
      return (e._asyncify_stop_unwind = e.asm._).apply(null, arguments);
    }, e._asyncify_start_rewind = function() {
      return (e._asyncify_start_rewind = e.asm.$).apply(null, arguments);
    }, e._asyncify_stop_rewind = function() {
      return (e._asyncify_stop_rewind = e.asm.aa).apply(null, arguments);
    };
    var Tn;
    en = function n() {
      Tn || Nn(), Tn || (en = n);
    };
    function Nn() {
      function n() {
        if (!Tn && (Tn = !0, e.calledRun = !0, !dn)) {
          if (pn(Qn), pn(Ft), g(e), e.onRuntimeInitialized && e.onRuntimeInitialized(), e.postRun) for (typeof e.postRun == "function" && (e.postRun = [e.postRun]); e.postRun.length; ) {
            var t = e.postRun.shift();
            Kn.unshift(t);
          }
          pn(Kn);
        }
      }
      if (!(0 < V)) {
        if (e.preRun) for (typeof e.preRun == "function" && (e.preRun = [e.preRun]); e.preRun.length; ) jt();
        pn(Xn), 0 < V || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            e.setStatus("");
          }, 1), n();
        }, 1)) : n());
      }
    }
    if (e.run = Nn, e.preInit) for (typeof e.preInit == "function" && (e.preInit = [e.preInit]); 0 < e.preInit.length; ) e.preInit.pop()();
    return Nn(), c.ready;
  };
}();
function oe(s, c) {
  return Math.sqrt((s.x - c.x) ** 2 + (s.y - c.y) ** 2);
}
function be(s, c) {
  return {
    x: (s.x + c.x) / 2,
    y: (s.y + c.y) / 2
  };
}
function Ae(s, c) {
  if (s.confidence <= 0 || c.confidence <= 0)
    return { x: 0, y: 0 };
  const e = oe(s.center, c.center), g = be(s.center, c.center);
  return {
    x: g.x,
    y: g.y + e / 4
    // calculation is taken from mobile team
  };
}
function Te(s, c, e) {
  if (s.confidence <= 0 || c.confidence <= 0)
    return 0;
  const g = oe(s.center, c.center), C = _e(e.width, e.height);
  return we(g / C);
}
function Kt(s) {
  const { centerX: c, centerY: e, confidence: g, size: C, status: P } = s;
  return {
    center: {
      x: c,
      y: e
    },
    confidence: g / 1e3,
    status: P / 1e3,
    size: C
  };
}
class Ee extends ge {
  getSamWasmFilePath(c, e) {
    return `${c}/face/wasm/${e}`;
  }
  fetchSamModule(c) {
    return Ce(c);
  }
  parseRawData(c, e) {
    const { brightness: g, sharpness: C } = c.params, { bottomRightX: P, bottomRightY: b, leftEye: j, mouth: S, rightEye: _, topLeftX: M, topLeftY: I } = c, W = Kt(j), k = Kt(_), dn = Kt(S);
    return {
      confidence: c.confidence / 1e3,
      topLeft: {
        x: M,
        y: I
      },
      bottomRight: {
        x: P,
        y: b
      },
      faceCenter: Ae(W, k),
      faceSize: Te(W, k, e),
      leftEye: W,
      rightEye: k,
      mouth: dn,
      brightness: g / 1e3,
      sharpness: C / 1e3
    };
  }
  async detect(c, e, g) {
    if (!this.samWasmModule)
      throw new nn("SAM WASM module is not initialized");
    const C = this.convertToSamColorImage(c, e), P = this.samWasmModule.detectFacePartsWithImageParameters(
      e.width,
      e.height,
      C.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return C.free(), this.parseRawData(P, g);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const ue = Symbol("Comlink.proxy"), Pe = Symbol("Comlink.endpoint"), We = Symbol("Comlink.releaseProxy"), qt = Symbol("Comlink.finalizer"), Tt = Symbol("Comlink.thrown"), se = (s) => typeof s == "object" && s !== null || typeof s == "function", Oe = {
  canHandle: (s) => se(s) && s[ue],
  serialize(s) {
    const { port1: c, port2: e } = new MessageChannel();
    return te(s, c), [e, [e]];
  },
  deserialize(s) {
    return s.start(), Me(s);
  }
}, Se = {
  canHandle: (s) => se(s) && Tt in s,
  serialize({ value: s }) {
    let c;
    return s instanceof Error ? c = {
      isError: !0,
      value: {
        message: s.message,
        name: s.name,
        stack: s.stack
      }
    } : c = { isError: !1, value: s }, [c, []];
  },
  deserialize(s) {
    throw s.isError ? Object.assign(new Error(s.value.message), s.value) : s.value;
  }
}, ce = /* @__PURE__ */ new Map([
  ["proxy", Oe],
  ["throw", Se]
]);
function ke(s, c) {
  for (const e of s)
    if (c === e || e === "*" || e instanceof RegExp && e.test(c))
      return !0;
  return !1;
}
function te(s, c = globalThis, e = ["*"]) {
  c.addEventListener("message", function g(C) {
    if (!C || !C.data)
      return;
    if (!ke(e, C.origin)) {
      console.warn(`Invalid origin '${C.origin}' for comlink proxy`);
      return;
    }
    const { id: P, type: b, path: j } = Object.assign({ path: [] }, C.data), S = (C.data.argumentList || []).map(Bn);
    let _;
    try {
      const M = j.slice(0, -1).reduce((W, k) => W[k], s), I = j.reduce((W, k) => W[k], s);
      switch (b) {
        case "GET":
          _ = I;
          break;
        case "SET":
          M[j.slice(-1)[0]] = Bn(C.data.value), _ = !0;
          break;
        case "APPLY":
          _ = I.apply(M, S);
          break;
        case "CONSTRUCT":
          {
            const W = new I(...S);
            _ = Ue(W);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: W, port2: k } = new MessageChannel();
            te(s, k), _ = je(W, [W]);
          }
          break;
        case "RELEASE":
          _ = void 0;
          break;
        default:
          return;
      }
    } catch (M) {
      _ = { value: M, [Tt]: 0 };
    }
    Promise.resolve(_).catch((M) => ({ value: M, [Tt]: 0 })).then((M) => {
      const [I, W] = Wt(M);
      c.postMessage(Object.assign(Object.assign({}, I), { id: P }), W), b === "RELEASE" && (c.removeEventListener("message", g), le(c), qt in s && typeof s[qt] == "function" && s[qt]());
    }).catch((M) => {
      const [I, W] = Wt({
        value: new TypeError("Unserializable return value"),
        [Tt]: 0
      });
      c.postMessage(Object.assign(Object.assign({}, I), { id: P }), W);
    });
  }), c.start && c.start();
}
function Re(s) {
  return s.constructor.name === "MessagePort";
}
function le(s) {
  Re(s) && s.close();
}
function Me(s, c) {
  return ne(s, [], c);
}
function At(s) {
  if (s)
    throw new Error("Proxy has been released and is not useable");
}
function fe(s) {
  return Hn(s, {
    type: "RELEASE"
  }).then(() => {
    le(s);
  });
}
const Et = /* @__PURE__ */ new WeakMap(), Pt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((s) => {
  const c = (Et.get(s) || 0) - 1;
  Et.set(s, c), c === 0 && fe(s);
});
function Ie(s, c) {
  const e = (Et.get(c) || 0) + 1;
  Et.set(c, e), Pt && Pt.register(s, c, s);
}
function xe(s) {
  Pt && Pt.unregister(s);
}
function ne(s, c = [], e = function() {
}) {
  let g = !1;
  const C = new Proxy(e, {
    get(P, b) {
      if (At(g), b === We)
        return () => {
          xe(C), fe(s), g = !0;
        };
      if (b === "then") {
        if (c.length === 0)
          return { then: () => C };
        const j = Hn(s, {
          type: "GET",
          path: c.map((S) => S.toString())
        }).then(Bn);
        return j.then.bind(j);
      }
      return ne(s, [...c, b]);
    },
    set(P, b, j) {
      At(g);
      const [S, _] = Wt(j);
      return Hn(s, {
        type: "SET",
        path: [...c, b].map((M) => M.toString()),
        value: S
      }, _).then(Bn);
    },
    apply(P, b, j) {
      At(g);
      const S = c[c.length - 1];
      if (S === Pe)
        return Hn(s, {
          type: "ENDPOINT"
        }).then(Bn);
      if (S === "bind")
        return ne(s, c.slice(0, -1));
      const [_, M] = ae(j);
      return Hn(s, {
        type: "APPLY",
        path: c.map((I) => I.toString()),
        argumentList: _
      }, M).then(Bn);
    },
    construct(P, b) {
      At(g);
      const [j, S] = ae(b);
      return Hn(s, {
        type: "CONSTRUCT",
        path: c.map((_) => _.toString()),
        argumentList: j
      }, S).then(Bn);
    }
  });
  return Ie(C, s), C;
}
function Fe(s) {
  return Array.prototype.concat.apply([], s);
}
function ae(s) {
  const c = s.map(Wt);
  return [c.map((e) => e[0]), Fe(c.map((e) => e[1]))];
}
const de = /* @__PURE__ */ new WeakMap();
function je(s, c) {
  return de.set(s, c), s;
}
function Ue(s) {
  return Object.assign(s, { [ue]: !0 });
}
function Wt(s) {
  for (const [c, e] of ce)
    if (e.canHandle(s)) {
      const [g, C] = e.serialize(s);
      return [
        {
          type: "HANDLER",
          name: c,
          value: g
        },
        C
      ];
    }
  return [
    {
      type: "RAW",
      value: s
    },
    de.get(s) || []
  ];
}
function Bn(s) {
  switch (s.type) {
    case "HANDLER":
      return ce.get(s.name).deserialize(s.value);
    case "RAW":
      return s.value;
  }
}
function Hn(s, c, e) {
  return new Promise((g) => {
    const C = Ne();
    s.addEventListener("message", function P(b) {
      !b.data || !b.data.id || b.data.id !== C || (s.removeEventListener("message", P), g(b.data));
    }), s.start && s.start(), s.postMessage(Object.assign({ id: C }, c), e);
  });
}
function Ne() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var Be = function() {
  var s = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
  return function(c) {
    c = c || {};
    var e;
    e || (e = typeof c < "u" ? c : {});
    var g, C;
    e.ready = new Promise(function(n, t) {
      g = n, C = t;
    });
    var P = {}, b;
    for (b in e) e.hasOwnProperty(b) && (P[b] = e[b]);
    var j = !1, S = !1;
    j = typeof window == "object", S = typeof importScripts == "function";
    var _ = "", M;
    (j || S) && (S ? _ = self.location.href : document.currentScript && (_ = document.currentScript.src), s && (_ = s), _.indexOf("blob:") !== 0 ? _ = _.substr(0, _.lastIndexOf("/") + 1) : _ = "", S && (M = function(n) {
      var t = new XMLHttpRequest();
      return t.open("GET", n, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
    }));
    var I = e.printErr || console.warn.bind(console);
    for (b in P) P.hasOwnProperty(b) && (e[b] = P[b]);
    P = null;
    var W;
    e.wasmBinary && (W = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, typeof WebAssembly != "object" && rn("no native wasm support detected");
    var k, dn = !1;
    function zn(n) {
      n || rn("Assertion failed: undefined");
    }
    var Vn = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
    function Ot(n, t, r) {
      var i = O;
      if (0 < r) {
        r = t + r - 1;
        for (var a = 0; a < n.length; ++a) {
          var o = n.charCodeAt(a);
          if (55296 <= o && 57343 >= o) {
            var l = n.charCodeAt(++a);
            o = 65536 + ((o & 1023) << 10) | l & 1023;
          }
          if (127 >= o) {
            if (t >= r) break;
            i[t++] = o;
          } else {
            if (2047 >= o) {
              if (t + 1 >= r) break;
              i[t++] = 192 | o >> 6;
            } else {
              if (65535 >= o) {
                if (t + 2 >= r) break;
                i[t++] = 224 | o >> 12;
              } else {
                if (t + 3 >= r) break;
                i[t++] = 240 | o >> 18, i[t++] = 128 | o >> 12 & 63;
              }
              i[t++] = 128 | o >> 6 & 63;
            }
            i[t++] = 128 | o & 63;
          }
        }
        i[t] = 0;
      }
    }
    var Gn = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0;
    function St(n, t) {
      for (var r = n >> 1, i = r + t / 2; !(r >= i) && hn[r]; ) ++r;
      if (r <<= 1, 32 < r - n && Gn) return Gn.decode(O.subarray(n, r));
      for (r = 0, i = ""; ; ) {
        var a = J[n + 2 * r >> 1];
        if (a == 0 || r == t / 2) return i;
        ++r, i += String.fromCharCode(a);
      }
    }
    function kt(n, t, r) {
      if (r === void 0 && (r = 2147483647), 2 > r) return 0;
      r -= 2;
      var i = t;
      r = r < 2 * n.length ? r / 2 : n.length;
      for (var a = 0; a < r; ++a) J[t >> 1] = n.charCodeAt(a), t += 2;
      return J[t >> 1] = 0, t - i;
    }
    function Rt(n) {
      return 2 * n.length;
    }
    function Mt(n, t) {
      for (var r = 0, i = ""; !(r >= t / 4); ) {
        var a = x[n + 4 * r >> 2];
        if (a == 0) break;
        ++r, 65536 <= a ? (a -= 65536, i += String.fromCharCode(55296 | a >> 10, 56320 | a & 1023)) : i += String.fromCharCode(a);
      }
      return i;
    }
    function It(n, t, r) {
      if (r === void 0 && (r = 2147483647), 4 > r) return 0;
      var i = t;
      r = i + r - 4;
      for (var a = 0; a < n.length; ++a) {
        var o = n.charCodeAt(a);
        if (55296 <= o && 57343 >= o) {
          var l = n.charCodeAt(++a);
          o = 65536 + ((o & 1023) << 10) | l & 1023;
        }
        if (x[t >> 2] = o, t += 4, t + 4 > r) break;
      }
      return x[t >> 2] = 0, t - i;
    }
    function xt(n) {
      for (var t = 0, r = 0; r < n.length; ++r) {
        var i = n.charCodeAt(r);
        55296 <= i && 57343 >= i && ++r, t += 4;
      }
      return t;
    }
    var $, tn, O, J, hn, x, N, Yn, $n;
    function Jn(n) {
      $ = n, e.HEAP8 = tn = new Int8Array(n), e.HEAP16 = J = new Int16Array(n), e.HEAP32 = x = new Int32Array(n), e.HEAPU8 = O = new Uint8Array(n), e.HEAPU16 = hn = new Uint16Array(n), e.HEAPU32 = N = new Uint32Array(n), e.HEAPF32 = Yn = new Float32Array(n), e.HEAPF64 = $n = new Float64Array(n);
    }
    var Zn = e.INITIAL_MEMORY || 16777216;
    e.wasmMemory ? k = e.wasmMemory : k = new WebAssembly.Memory({ initial: Zn / 65536, maximum: 32768 }), k && ($ = k.buffer), Zn = $.byteLength, Jn($);
    var Xn = [], Qn = [], Ft = [], Kn = [];
    function jt() {
      var n = e.preRun.shift();
      Xn.unshift(n);
    }
    var V = 0, en = null;
    e.preloadedImages = {}, e.preloadedAudios = {};
    function rn(n) {
      throw e.onAbort && e.onAbort(n), I(n), dn = !0, n = new WebAssembly.RuntimeError("abort(" + n + "). Build with -s ASSERTIONS=1 for more info."), C(n), n;
    }
    function Pn(n) {
      var t = G;
      return String.prototype.startsWith ? t.startsWith(n) : t.indexOf(n) === 0;
    }
    function qn() {
      return Pn("data:application/octet-stream;base64,");
    }
    var G = "dot-sam.wasm";
    if (!qn()) {
      var nt = G;
      G = e.locateFile ? e.locateFile(nt, _) : _ + nt;
    }
    function tt() {
      try {
        if (W) return new Uint8Array(W);
        if (M) return M(G);
        throw "both async and sync fetching of the wasm failed";
      } catch (n) {
        rn(n);
      }
    }
    function Ut() {
      return W || !j && !S || typeof fetch != "function" || Pn("file://") ? Promise.resolve().then(tt) : fetch(G, { credentials: "same-origin" }).then(function(n) {
        if (!n.ok) throw "failed to load wasm binary file at '" + G + "'";
        return n.arrayBuffer();
      }).catch(function() {
        return tt();
      });
    }
    function pn(n) {
      for (; 0 < n.length; ) {
        var t = n.shift();
        if (typeof t == "function") t(e);
        else {
          var r = t.Aa;
          typeof r == "number" ? t.sa === void 0 ? Wn("v", r)() : Wn("vi", r)(t.sa) : r(t.sa === void 0 ? null : t.sa);
        }
      }
    }
    function Wn(n, t) {
      var r = [];
      return function() {
        r.length = arguments.length;
        for (var i = 0; i < arguments.length; i++) r[i] = arguments[i];
        return r && r.length ? e["dynCall_" + n].apply(null, [t].concat(r)) : e["dynCall_" + n].call(null, t);
      };
    }
    function Nt(n) {
      this.ca = n - 16, this.Na = function(t) {
        x[this.ca + 8 >> 2] = t;
      }, this.Ka = function(t) {
        x[this.ca + 0 >> 2] = t;
      }, this.La = function() {
        x[this.ca + 4 >> 2] = 0;
      }, this.Ja = function() {
        tn[this.ca + 12 >> 0] = 0;
      }, this.Ma = function() {
        tn[this.ca + 13 >> 0] = 0;
      }, this.Ea = function(t, r) {
        this.Na(t), this.Ka(r), this.La(), this.Ja(), this.Ma();
      };
    }
    function yn() {
      return 0 < yn.wa;
    }
    function On(n) {
      switch (n) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + n);
      }
    }
    var et = void 0;
    function T(n) {
      for (var t = ""; O[n]; ) t += et[O[n++]];
      return t;
    }
    var Z = {}, Y = {}, mn = {};
    function Sn(n) {
      if (n === void 0) return "_unknown";
      n = n.replace(/[^a-zA-Z0-9_]/g, "$");
      var t = n.charCodeAt(0);
      return 48 <= t && 57 >= t ? "_" + n : n;
    }
    function kn(n, t) {
      return n = Sn(n), new Function("body", "return function " + n + `() {
    "use strict";    return body.apply(this, arguments);
};
`)(t);
    }
    function Rn(n) {
      var t = Error, r = kn(n, function(i) {
        this.name = n, this.message = i, i = Error(i).stack, i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return r.prototype = Object.create(t.prototype), r.prototype.constructor = r, r.prototype.toString = function() {
        return this.message === void 0 ? this.name : this.name + ": " + this.message;
      }, r;
    }
    var X = void 0;
    function m(n) {
      throw new X(n);
    }
    var rt = void 0;
    function vn(n) {
      throw new rt(n);
    }
    function Q(n, t, r) {
      function i(u) {
        u = r(u), u.length !== n.length && vn("Mismatched type converter count");
        for (var p = 0; p < n.length; ++p) B(n[p], u[p]);
      }
      n.forEach(function(u) {
        mn[u] = t;
      });
      var a = Array(t.length), o = [], l = 0;
      t.forEach(function(u, p) {
        Y.hasOwnProperty(u) ? a[p] = Y[u] : (o.push(u), Z.hasOwnProperty(u) || (Z[u] = []), Z[u].push(function() {
          a[p] = Y[u], ++l, l === o.length && i(a);
        }));
      }), o.length === 0 && i(a);
    }
    function B(n, t, r) {
      if (r = r || {}, !("argPackAdvance" in t)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var i = t.name;
      if (n || m('type "' + i + '" must have a positive integer typeid pointer'), Y.hasOwnProperty(n)) {
        if (r.Da) return;
        m("Cannot register type '" + i + "' twice");
      }
      Y[n] = t, delete mn[n], Z.hasOwnProperty(n) && (t = Z[n], delete Z[n], t.forEach(function(a) {
        a();
      }));
    }
    function Bt(n) {
      return { count: n.count, na: n.na, oa: n.oa, ca: n.ca, ea: n.ea, fa: n.fa, ga: n.ga };
    }
    function Mn(n) {
      m(n.ba.ea.da.name + " instance already deleted");
    }
    var In = !1;
    function it() {
    }
    function at(n) {
      --n.count.value, n.count.value === 0 && (n.fa ? n.ga.ma(n.fa) : n.ea.da.ma(n.ca));
    }
    function an(n) {
      return typeof FinalizationGroup > "u" ? (an = function(t) {
        return t;
      }, n) : (In = new FinalizationGroup(function(t) {
        for (var r = t.next(); !r.done; r = t.next()) r = r.value, r.ca ? at(r) : console.warn("object already deleted: " + r.ca);
      }), an = function(t) {
        return In.register(t, t.ba, t.ba), t;
      }, it = function(t) {
        In.unregister(t.ba);
      }, an(n));
    }
    var on = void 0, un = [];
    function xn() {
      for (; un.length; ) {
        var n = un.pop();
        n.ba.na = !1, n.delete();
      }
    }
    function L() {
    }
    var ot = {};
    function Dt(n, t) {
      var r = e;
      if (r[n].ia === void 0) {
        var i = r[n];
        r[n] = function() {
          return r[n].ia.hasOwnProperty(arguments.length) || m("Function '" + t + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + r[n].ia + ")!"), r[n].ia[arguments.length].apply(this, arguments);
        }, r[n].ia = [], r[n].ia[i.xa] = i;
      }
    }
    function ut(n, t, r) {
      e.hasOwnProperty(n) ? ((r === void 0 || e[n].ia !== void 0 && e[n].ia[r] !== void 0) && m("Cannot register public name '" + n + "' twice"), Dt(n, n), e.hasOwnProperty(r) && m("Cannot register multiple overloads of a function with the same number of arguments (" + r + ")!"), e[n].ia[r] = t) : (e[n] = t, r !== void 0 && (e[n].Qa = r));
    }
    function Ht(n, t, r, i, a, o, l, u) {
      this.name = n, this.constructor = t, this.la = r, this.ma = i, this.ha = a, this.Ba = o, this.pa = l, this.za = u;
    }
    function gn(n, t, r) {
      for (; t !== r; ) t.pa || m("Expected null or instance of " + r.name + ", got an instance of " + t.name), n = t.pa(n), t = t.ha;
      return n;
    }
    function Lt(n, t) {
      return t === null ? (this.ta && m("null is not a valid " + this.name), 0) : (t.ba || m('Cannot pass "' + q(t) + '" as a ' + this.name), t.ba.ca || m("Cannot pass deleted object as a pointer of type " + this.name), gn(t.ba.ca, t.ba.ea.da, this.da));
    }
    function zt(n, t) {
      if (t === null) {
        if (this.ta && m("null is not a valid " + this.name), this.ra) {
          var r = this.Ga();
          return n !== null && n.push(this.ma, r), r;
        }
        return 0;
      }
      if (t.ba || m('Cannot pass "' + q(t) + '" as a ' + this.name), t.ba.ca || m("Cannot pass deleted object as a pointer of type " + this.name), !this.qa && t.ba.ea.qa && m("Cannot convert argument of type " + (t.ba.ga ? t.ba.ga.name : t.ba.ea.name) + " to parameter type " + this.name), r = gn(t.ba.ca, t.ba.ea.da, this.da), this.ra) switch (t.ba.fa === void 0 && m("Passing raw pointer to smart pointer is illegal"), this.Oa) {
        case 0:
          t.ba.ga === this ? r = t.ba.fa : m("Cannot convert argument of type " + (t.ba.ga ? t.ba.ga.name : t.ba.ea.name) + " to parameter type " + this.name);
          break;
        case 1:
          r = t.ba.fa;
          break;
        case 2:
          if (t.ba.ga === this) r = t.ba.fa;
          else {
            var i = t.clone();
            r = this.Ha(r, K(function() {
              i.delete();
            })), n !== null && n.push(this.ma, r);
          }
          break;
        default:
          m("Unsupporting sharing policy");
      }
      return r;
    }
    function Vt(n, t) {
      return t === null ? (this.ta && m("null is not a valid " + this.name), 0) : (t.ba || m('Cannot pass "' + q(t) + '" as a ' + this.name), t.ba.ca || m("Cannot pass deleted object as a pointer of type " + this.name), t.ba.ea.qa && m("Cannot convert argument of type " + t.ba.ea.name + " to parameter type " + this.name), gn(t.ba.ca, t.ba.ea.da, this.da));
    }
    function wn(n) {
      return this.fromWireType(N[n >> 2]);
    }
    function st(n, t, r) {
      return t === r ? n : r.ha === void 0 ? null : (n = st(n, t, r.ha), n === null ? null : r.za(n));
    }
    var sn = {};
    function Gt(n, t) {
      for (t === void 0 && m("ptr should not be undefined"); n.ha; ) t = n.pa(t), n = n.ha;
      return sn[t];
    }
    function _n(n, t) {
      return t.ea && t.ca || vn("makeClassHandle requires ptr and ptrType"), !!t.ga != !!t.fa && vn("Both smartPtrType and smartPtr must be specified"), t.count = { value: 1 }, an(Object.create(n, { ba: { value: t } }));
    }
    function D(n, t, r, i) {
      this.name = n, this.da = t, this.ta = r, this.qa = i, this.ra = !1, this.ma = this.Ha = this.Ga = this.va = this.Oa = this.Fa = void 0, t.ha !== void 0 ? this.toWireType = zt : (this.toWireType = i ? Lt : Vt, this.ja = null);
    }
    function ct(n, t, r) {
      e.hasOwnProperty(n) || vn("Replacing nonexistant public symbol"), e[n].ia !== void 0 && r !== void 0 ? e[n].ia[r] = t : (e[n] = t, e[n].xa = r);
    }
    function z(n, t) {
      n = T(n);
      var r = Wn(n, t);
      return typeof r != "function" && m("unknown function pointer with signature " + n + ": " + t), r;
    }
    var lt = void 0;
    function ft(n) {
      n = wt(n);
      var t = T(n);
      return H(n), t;
    }
    function cn(n, t) {
      function r(o) {
        a[o] || Y[o] || (mn[o] ? mn[o].forEach(r) : (i.push(o), a[o] = !0));
      }
      var i = [], a = {};
      throw t.forEach(r), new lt(n + ": " + i.map(ft).join([", "]));
    }
    function dt(n, t) {
      for (var r = [], i = 0; i < n; i++) r.push(x[(t >> 2) + i]);
      return r;
    }
    function Cn(n) {
      for (; n.length; ) {
        var t = n.pop();
        n.pop()(t);
      }
    }
    function ht(n, t, r) {
      return n instanceof Object || m(r + ' with invalid "this": ' + n), n instanceof t.da.constructor || m(r + ' incompatible with "this" of type ' + n.constructor.name), n.ba.ca || m("cannot call emscripten binding method " + r + " on deleted object"), gn(n.ba.ca, n.ba.ea.da, t.da);
    }
    var Fn = [], R = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }];
    function jn(n) {
      4 < n && --R[n].Ia === 0 && (R[n] = void 0, Fn.push(n));
    }
    function K(n) {
      switch (n) {
        case void 0:
          return 1;
        case null:
          return 2;
        case !0:
          return 3;
        case !1:
          return 4;
        default:
          var t = Fn.length ? Fn.pop() : R.length;
          return R[t] = { Ia: 1, value: n }, t;
      }
    }
    function q(n) {
      if (n === null) return "null";
      var t = typeof n;
      return t === "object" || t === "array" || t === "function" ? n.toString() : "" + n;
    }
    function Yt(n, t) {
      switch (t) {
        case 2:
          return function(r) {
            return this.fromWireType(Yn[r >> 2]);
          };
        case 3:
          return function(r) {
            return this.fromWireType($n[r >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + n);
      }
    }
    function $t(n) {
      var t = Function;
      if (!(t instanceof Function)) throw new TypeError("new_ called with constructor type " + typeof t + " which is not a function");
      var r = kn(t.name || "unknownFunctionName", function() {
      });
      return r.prototype = t.prototype, r = new r(), n = t.apply(r, n), n instanceof Object ? n : r;
    }
    function Jt(n, t, r) {
      switch (t) {
        case 0:
          return r ? function(i) {
            return tn[i];
          } : function(i) {
            return O[i];
          };
        case 1:
          return r ? function(i) {
            return J[i >> 1];
          } : function(i) {
            return hn[i >> 1];
          };
        case 2:
          return r ? function(i) {
            return x[i >> 2];
          } : function(i) {
            return N[i >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + n);
      }
    }
    function Un(n) {
      return n || m("Cannot use deleted val. handle = " + n), R[n].value;
    }
    function pt(n, t) {
      var r = Y[n];
      return r === void 0 && m(t + " has unknown type " + ft(n)), r;
    }
    var Zt = {}, yt = [];
    function mt(n) {
      var t = {}, r;
      for (r in n) (function(i) {
        var a = n[i];
        t[i] = typeof a == "function" ? function() {
          yt.push(i);
          try {
            return a.apply(null, arguments);
          } finally {
            if (dn) return;
            var o = yt.pop();
            zn(o === i);
          }
        } : a;
      })(r);
      return t;
    }
    for (var vt = Array(256), bn = 0; 256 > bn; ++bn) vt[bn] = String.fromCharCode(bn);
    et = vt, X = e.BindingError = Rn("BindingError"), rt = e.InternalError = Rn("InternalError"), L.prototype.isAliasOf = function(n) {
      if (!(this instanceof L && n instanceof L)) return !1;
      var t = this.ba.ea.da, r = this.ba.ca, i = n.ba.ea.da;
      for (n = n.ba.ca; t.ha; ) r = t.pa(r), t = t.ha;
      for (; i.ha; ) n = i.pa(n), i = i.ha;
      return t === i && r === n;
    }, L.prototype.clone = function() {
      if (this.ba.ca || Mn(this), this.ba.oa) return this.ba.count.value += 1, this;
      var n = an(Object.create(Object.getPrototypeOf(this), { ba: { value: Bt(this.ba) } }));
      return n.ba.count.value += 1, n.ba.na = !1, n;
    }, L.prototype.delete = function() {
      this.ba.ca || Mn(this), this.ba.na && !this.ba.oa && m("Object already scheduled for deletion"), it(this), at(this.ba), this.ba.oa || (this.ba.fa = void 0, this.ba.ca = void 0);
    }, L.prototype.isDeleted = function() {
      return !this.ba.ca;
    }, L.prototype.deleteLater = function() {
      return this.ba.ca || Mn(this), this.ba.na && !this.ba.oa && m("Object already scheduled for deletion"), un.push(this), un.length === 1 && on && on(xn), this.ba.na = !0, this;
    }, D.prototype.Ca = function(n) {
      return this.va && (n = this.va(n)), n;
    }, D.prototype.ua = function(n) {
      this.ma && this.ma(n);
    }, D.prototype.argPackAdvance = 8, D.prototype.readValueFromPointer = wn, D.prototype.deleteObject = function(n) {
      n !== null && n.delete();
    }, D.prototype.fromWireType = function(n) {
      function t() {
        return this.ra ? _n(this.da.la, { ea: this.Fa, ca: r, ga: this, fa: n }) : _n(this.da.la, { ea: this, ca: n });
      }
      var r = this.Ca(n);
      if (!r) return this.ua(n), null;
      var i = Gt(this.da, r);
      if (i !== void 0)
        return i.ba.count.value === 0 ? (i.ba.ca = r, i.ba.fa = n, i.clone()) : (i = i.clone(), this.ua(n), i);
      if (i = this.da.Ba(r), i = ot[i], !i) return t.call(this);
      i = this.qa ? i.ya : i.pointerType;
      var a = st(r, this.da, i.da);
      return a === null ? t.call(this) : this.ra ? _n(i.da.la, { ea: i, ca: a, ga: this, fa: n }) : _n(
        i.da.la,
        { ea: i, ca: a }
      );
    }, e.getInheritedInstanceCount = function() {
      return Object.keys(sn).length;
    }, e.getLiveInheritedInstances = function() {
      var n = [], t;
      for (t in sn) sn.hasOwnProperty(t) && n.push(sn[t]);
      return n;
    }, e.flushPendingDeletes = xn, e.setDelayFunction = function(n) {
      on = n, un.length && on && on(xn);
    }, lt = e.UnboundTypeError = Rn("UnboundTypeError"), e.count_emval_handles = function() {
      for (var n = 0, t = 5; t < R.length; ++t) R[t] !== void 0 && ++n;
      return n;
    }, e.get_first_emval = function() {
      for (var n = 5; n < R.length; ++n) if (R[n] !== void 0) return R[n];
      return null;
    }, Qn.push({ Aa: function() {
      gt();
    } });
    var Xt = {
      x: function(n) {
        return An(n + 16) + 16;
      },
      s: function(n, t, r) {
        throw new Nt(n).Ea(t, r), "uncaught_exception" in yn ? yn.wa++ : yn.wa = 1, n;
      },
      u: function(n, t, r, i, a) {
        var o = On(r);
        t = T(t), B(n, { name: t, fromWireType: function(l) {
          return !!l;
        }, toWireType: function(l, u) {
          return u ? i : a;
        }, argPackAdvance: 8, readValueFromPointer: function(l) {
          if (r === 1) var u = tn;
          else if (r === 2) u = J;
          else if (r === 4) u = x;
          else throw new TypeError("Unknown boolean type size: " + t);
          return this.fromWireType(u[l >> o]);
        }, ja: null });
      },
      h: function(n, t, r, i, a, o, l, u, p, f, d, h, v) {
        d = T(d), o = z(a, o), u && (u = z(l, u)), f && (f = z(p, f)), v = z(h, v);
        var w = Sn(d);
        ut(w, function() {
          cn("Cannot construct " + d + " due to unbound types", [i]);
        }), Q([n, t, r], i ? [i] : [], function(y) {
          if (y = y[0], i)
            var U = y.da, A = U.la;
          else A = L.prototype;
          y = kn(w, function() {
            if (Object.getPrototypeOf(this) !== E) throw new X("Use 'new' to construct " + d);
            if (F.ka === void 0) throw new X(d + " has no accessible constructor");
            var _t = F.ka[arguments.length];
            if (_t === void 0) throw new X("Tried to invoke ctor of " + d + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(F.ka).toString() + ") parameters instead!");
            return _t.apply(this, arguments);
          });
          var E = Object.create(A, { constructor: { value: y } });
          y.prototype = E;
          var F = new Ht(d, y, E, v, U, o, u, f);
          U = new D(d, F, !0, !1), A = new D(d + "*", F, !1, !1);
          var ln = new D(d + " const*", F, !1, !0);
          return ot[n] = { pointerType: A, ya: ln }, ct(w, y), [U, A, ln];
        });
      },
      g: function(n, t, r, i, a, o) {
        zn(0 < t);
        var l = dt(t, r);
        a = z(i, a);
        var u = [o], p = [];
        Q([], [n], function(f) {
          f = f[0];
          var d = "constructor " + f.name;
          if (f.da.ka === void 0 && (f.da.ka = []), f.da.ka[t - 1] !== void 0) throw new X("Cannot register multiple constructors with identical number of parameters (" + (t - 1) + ") for class '" + f.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          return f.da.ka[t - 1] = function() {
            cn("Cannot construct " + f.name + " due to unbound types", l);
          }, Q([], l, function(h) {
            return f.da.ka[t - 1] = function() {
              arguments.length !== t - 1 && m(d + " called with " + arguments.length + " arguments, expected " + (t - 1)), p.length = 0, u.length = t;
              for (var v = 1; v < t; ++v) u[v] = h[v].toWireType(
                p,
                arguments[v - 1]
              );
              return v = a.apply(null, u), Cn(p), h[0].fromWireType(v);
            }, [];
          }), [];
        });
      },
      b: function(n, t, r, i, a, o, l, u, p, f) {
        t = T(t), a = z(i, a), Q([], [n], function(d) {
          d = d[0];
          var h = d.name + "." + t, v = { get: function() {
            cn("Cannot access " + h + " due to unbound types", [r, l]);
          }, enumerable: !0, configurable: !0 };
          return p ? v.set = function() {
            cn("Cannot access " + h + " due to unbound types", [r, l]);
          } : v.set = function() {
            m(h + " is a read-only property");
          }, Object.defineProperty(d.da.la, t, v), Q([], p ? [r, l] : [r], function(w) {
            var y = w[0], U = { get: function() {
              var E = ht(this, d, h + " getter");
              return y.fromWireType(a(o, E));
            }, enumerable: !0 };
            if (p) {
              p = z(u, p);
              var A = w[1];
              U.set = function(E) {
                var F = ht(this, d, h + " setter"), ln = [];
                p(f, F, A.toWireType(ln, E)), Cn(ln);
              };
            }
            return Object.defineProperty(d.da.la, t, U), [];
          }), [];
        });
      },
      t: function(n, t) {
        t = T(t), B(n, { name: t, fromWireType: function(r) {
          var i = R[r].value;
          return jn(r), i;
        }, toWireType: function(r, i) {
          return K(i);
        }, argPackAdvance: 8, readValueFromPointer: wn, ja: null });
      },
      m: function(n, t, r) {
        r = On(r), t = T(t), B(n, {
          name: t,
          fromWireType: function(i) {
            return i;
          },
          toWireType: function(i, a) {
            if (typeof a != "number" && typeof a != "boolean") throw new TypeError('Cannot convert "' + q(a) + '" to ' + this.name);
            return a;
          },
          argPackAdvance: 8,
          readValueFromPointer: Yt(t, r),
          ja: null
        });
      },
      c: function(n, t, r, i, a, o) {
        var l = dt(t, r);
        n = T(n), a = z(i, a), ut(n, function() {
          cn("Cannot call " + n + " due to unbound types", l);
        }, t - 1), Q([], l, function(u) {
          var p = n, f = n;
          u = [u[0], null].concat(u.slice(1));
          var d = a, h = u.length;
          2 > h && m("argTypes array size mismatch! Must at least get return value and 'this' types!");
          for (var v = u[1] !== null && !1, w = !1, y = 1; y < u.length; ++y) if (u[y] !== null && u[y].ja === void 0) {
            w = !0;
            break;
          }
          var U = u[0].name !== "void", A = "", E = "";
          for (y = 0; y < h - 2; ++y) A += (y !== 0 ? ", " : "") + "arg" + y, E += (y !== 0 ? ", " : "") + "arg" + y + "Wired";
          f = "return function " + Sn(f) + "(" + A + `) {
if (arguments.length !== ` + (h - 2) + `) {
throwBindingError('function ` + f + " called with ' + arguments.length + ' arguments, expected " + (h - 2) + ` args!');
}
`, w && (f += `var destructors = [];
`);
          var F = w ? "destructors" : "null";
          for (A = "throwBindingError invoker fn runDestructors retType classParam".split(" "), d = [m, d, o, Cn, u[0], u[1]], v && (f += "var thisWired = classParam.toWireType(" + F + `, this);
`), y = 0; y < h - 2; ++y) f += "var arg" + y + "Wired = argType" + y + ".toWireType(" + F + ", arg" + y + "); // " + u[y + 2].name + `
`, A.push("argType" + y), d.push(u[y + 2]);
          if (v && (E = "thisWired" + (0 < E.length ? ", " : "") + E), f += (U ? "var rv = " : "") + "invoker(fn" + (0 < E.length ? ", " : "") + E + `);
`, w) f += `runDestructors(destructors);
`;
          else for (y = v ? 1 : 2; y < u.length; ++y) h = y === 1 ? "thisWired" : "arg" + (y - 2) + "Wired", u[y].ja !== null && (f += h + "_dtor(" + h + "); // " + u[y].name + `
`, A.push(h + "_dtor"), d.push(u[y].ja));
          return U && (f += `var ret = retType.fromWireType(rv);
return ret;
`), A.push(f + `}
`), u = $t(A).apply(null, d), ct(p, u, t - 1), [];
        });
      },
      e: function(n, t, r, i, a) {
        function o(f) {
          return f;
        }
        t = T(t), a === -1 && (a = 4294967295);
        var l = On(r);
        if (i === 0) {
          var u = 32 - 8 * r;
          o = function(f) {
            return f << u >>> u;
          };
        }
        var p = t.indexOf("unsigned") != -1;
        B(n, { name: t, fromWireType: o, toWireType: function(f, d) {
          if (typeof d != "number" && typeof d != "boolean") throw new TypeError('Cannot convert "' + q(d) + '" to ' + this.name);
          if (d < i || d > a) throw new TypeError('Passing a number "' + q(d) + '" from JS side to C/C++ side to an argument of type "' + t + '", which is outside the valid range [' + i + ", " + a + "]!");
          return p ? d >>> 0 : d | 0;
        }, argPackAdvance: 8, readValueFromPointer: Jt(t, l, i !== 0), ja: null });
      },
      d: function(n, t, r) {
        function i(o) {
          o >>= 2;
          var l = N;
          return new a($, l[o + 1], l[o]);
        }
        var a = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t];
        r = T(r), B(n, { name: r, fromWireType: i, argPackAdvance: 8, readValueFromPointer: i }, { Da: !0 });
      },
      n: function(n, t) {
        t = T(t);
        var r = t === "std::string";
        B(n, {
          name: t,
          fromWireType: function(i) {
            var a = N[i >> 2];
            if (r) for (var o = i + 4, l = 0; l <= a; ++l) {
              var u = i + 4 + l;
              if (l == a || O[u] == 0) {
                if (o) {
                  var p = o, f = O, d = p + (u - o);
                  for (o = p; f[o] && !(o >= d); ) ++o;
                  if (16 < o - p && f.subarray && Vn) p = Vn.decode(f.subarray(p, o));
                  else {
                    for (d = ""; p < o; ) {
                      var h = f[p++];
                      if (h & 128) {
                        var v = f[p++] & 63;
                        if ((h & 224) == 192) d += String.fromCharCode((h & 31) << 6 | v);
                        else {
                          var w = f[p++] & 63;
                          h = (h & 240) == 224 ? (h & 15) << 12 | v << 6 | w : (h & 7) << 18 | v << 12 | w << 6 | f[p++] & 63, 65536 > h ? d += String.fromCharCode(h) : (h -= 65536, d += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
                        }
                      } else d += String.fromCharCode(h);
                    }
                    p = d;
                  }
                } else p = "";
                if (y === void 0) var y = p;
                else y += "\0", y += p;
                o = u + 1;
              }
            }
            else {
              for (y = Array(a), l = 0; l < a; ++l) y[l] = String.fromCharCode(O[i + 4 + l]);
              y = y.join("");
            }
            return H(i), y;
          },
          toWireType: function(i, a) {
            a instanceof ArrayBuffer && (a = new Uint8Array(a));
            var o = typeof a == "string";
            o || a instanceof Uint8Array || a instanceof Uint8ClampedArray || a instanceof Int8Array || m("Cannot pass non-string to std::string");
            var l = (r && o ? function() {
              for (var f = 0, d = 0; d < a.length; ++d) {
                var h = a.charCodeAt(d);
                55296 <= h && 57343 >= h && (h = 65536 + ((h & 1023) << 10) | a.charCodeAt(++d) & 1023), 127 >= h ? ++f : f = 2047 >= h ? f + 2 : 65535 >= h ? f + 3 : f + 4;
              }
              return f;
            } : function() {
              return a.length;
            })(), u = An(4 + l + 1);
            if (N[u >> 2] = l, r && o) Ot(a, u + 4, l + 1);
            else if (o) for (o = 0; o < l; ++o) {
              var p = a.charCodeAt(o);
              255 < p && (H(u), m("String has UTF-16 code units that do not fit in 8 bits")), O[u + 4 + o] = p;
            }
            else for (o = 0; o < l; ++o) O[u + 4 + o] = a[o];
            return i !== null && i.push(H, u), u;
          },
          argPackAdvance: 8,
          readValueFromPointer: wn,
          ja: function(i) {
            H(i);
          }
        });
      },
      j: function(n, t, r) {
        if (r = T(r), t === 2)
          var i = St, a = kt, o = Rt, l = function() {
            return hn;
          }, u = 1;
        else t === 4 && (i = Mt, a = It, o = xt, l = function() {
          return N;
        }, u = 2);
        B(n, { name: r, fromWireType: function(p) {
          for (var f = N[p >> 2], d = l(), h, v = p + 4, w = 0; w <= f; ++w) {
            var y = p + 4 + w * t;
            (w == f || d[y >> u] == 0) && (v = i(v, y - v), h === void 0 ? h = v : (h += "\0", h += v), v = y + t);
          }
          return H(p), h;
        }, toWireType: function(p, f) {
          typeof f != "string" && m("Cannot pass non-string to C++ string type " + r);
          var d = o(f), h = An(4 + d + t);
          return N[h >> 2] = d >> u, a(f, h + 4, d + t), p !== null && p.push(H, h), h;
        }, argPackAdvance: 8, readValueFromPointer: wn, ja: function(p) {
          H(p);
        } });
      },
      v: function(n, t) {
        t = T(t), B(n, { Pa: !0, name: t, argPackAdvance: 0, fromWireType: function() {
        }, toWireType: function() {
        } });
      },
      k: function(n, t, r) {
        n = Un(n), t = pt(t, "emval::as");
        var i = [], a = K(i);
        return x[r >> 2] = a, t.toWireType(i, n);
      },
      i: jn,
      l: function(n, t) {
        return n = Un(n), t = Un(t), K(n[t]);
      },
      p: function(n) {
        var t = Zt[n];
        return K(t === void 0 ? T(n) : t);
      },
      o: function(n) {
        Cn(R[n].value), jn(n);
      },
      w: function(n, t) {
        return n = pt(n, "_emval_take_value"), n = n.readValueFromPointer(t), K(n);
      },
      f: function() {
        rn();
      },
      q: function(n, t, r) {
        O.copyWithin(n, t, t + r);
      },
      r: function(n) {
        n >>>= 0;
        var t = O.length;
        if (2147483648 < n) return !1;
        for (var r = 1; 4 >= r; r *= 2) {
          var i = t * (1 + 0.2 / r);
          i = Math.min(i, n + 100663296), i = Math.max(16777216, n, i), 0 < i % 65536 && (i += 65536 - i % 65536);
          n: {
            try {
              k.grow(Math.min(2147483648, i) - $.byteLength + 65535 >>> 16), Jn(k.buffer);
              var a = 1;
              break n;
            } catch {
            }
            a = void 0;
          }
          if (a) return !0;
        }
        return !1;
      },
      a: k
    };
    (function() {
      function n(o) {
        o = o.exports, o = mt(o), e.asm = o, V--, e.monitorRunDependencies && e.monitorRunDependencies(V), V == 0 && en && (o = en, en = null, o());
      }
      function t(o) {
        n(o.instance);
      }
      function r(o) {
        return Ut().then(function(l) {
          return WebAssembly.instantiate(l, i);
        }).then(o, function(l) {
          I("failed to asynchronously prepare wasm: " + l), rn(l);
        });
      }
      var i = { a: Xt };
      if (V++, e.monitorRunDependencies && e.monitorRunDependencies(V), e.instantiateWasm) try {
        var a = e.instantiateWasm(i, n);
        return a = mt(a);
      } catch (o) {
        return I("Module.instantiateWasm callback failed with error: " + o), !1;
      }
      return function() {
        if (W || typeof WebAssembly.instantiateStreaming != "function" || qn() || Pn("file://") || typeof fetch != "function") return r(t);
        fetch(G, { credentials: "same-origin" }).then(function(o) {
          return WebAssembly.instantiateStreaming(o, i).then(t, function(l) {
            return I("wasm streaming compile failed: " + l), I("falling back to ArrayBuffer instantiation"), r(t);
          });
        });
      }(), {};
    })();
    var gt = e.___wasm_call_ctors = function() {
      return (gt = e.___wasm_call_ctors = e.asm.z).apply(null, arguments);
    }, An = e._malloc = function() {
      return (An = e._malloc = e.asm.A).apply(null, arguments);
    }, H = e._free = function() {
      return (H = e._free = e.asm.B).apply(null, arguments);
    }, wt = e.___getTypeName = function() {
      return (wt = e.___getTypeName = e.asm.C).apply(null, arguments);
    };
    e.___embind_register_native_and_builtin_types = function() {
      return (e.___embind_register_native_and_builtin_types = e.asm.D).apply(null, arguments);
    }, e.dynCall_ii = function() {
      return (e.dynCall_ii = e.asm.E).apply(null, arguments);
    }, e.dynCall_vi = function() {
      return (e.dynCall_vi = e.asm.F).apply(null, arguments);
    }, e.dynCall_i = function() {
      return (e.dynCall_i = e.asm.G).apply(null, arguments);
    }, e.dynCall_iii = function() {
      return (e.dynCall_iii = e.asm.H).apply(null, arguments);
    }, e.dynCall_viii = function() {
      return (e.dynCall_viii = e.asm.I).apply(null, arguments);
    }, e.dynCall_fii = function() {
      return (e.dynCall_fii = e.asm.J).apply(null, arguments);
    }, e.dynCall_viif = function() {
      return (e.dynCall_viif = e.asm.K).apply(null, arguments);
    }, e.dynCall_viiii = function() {
      return (e.dynCall_viiii = e.asm.L).apply(null, arguments);
    }, e.dynCall_viiiiii = function() {
      return (e.dynCall_viiiiii = e.asm.M).apply(null, arguments);
    }, e.dynCall_iiiiii = function() {
      return (e.dynCall_iiiiii = e.asm.N).apply(null, arguments);
    }, e.dynCall_viiiii = function() {
      return (e.dynCall_viiiii = e.asm.O).apply(null, arguments);
    }, e.dynCall_iiiiiiii = function() {
      return (e.dynCall_iiiiiiii = e.asm.P).apply(null, arguments);
    }, e.dynCall_viiiiiii = function() {
      return (e.dynCall_viiiiiii = e.asm.Q).apply(null, arguments);
    }, e.dynCall_viiiiiiiiidi = function() {
      return (e.dynCall_viiiiiiiiidi = e.asm.R).apply(null, arguments);
    }, e.dynCall_viiiiiiiidi = function() {
      return (e.dynCall_viiiiiiiidi = e.asm.S).apply(null, arguments);
    }, e.dynCall_viiiiiiiiii = function() {
      return (e.dynCall_viiiiiiiiii = e.asm.T).apply(null, arguments);
    }, e.dynCall_viiiiiiiii = function() {
      return (e.dynCall_viiiiiiiii = e.asm.U).apply(null, arguments);
    }, e.dynCall_viiiiiiii = function() {
      return (e.dynCall_viiiiiiii = e.asm.V).apply(null, arguments);
    }, e.dynCall_iiiiiii = function() {
      return (e.dynCall_iiiiiii = e.asm.W).apply(null, arguments);
    }, e.dynCall_iiiii = function() {
      return (e.dynCall_iiiii = e.asm.X).apply(null, arguments);
    }, e.dynCall_iiii = function() {
      return (e.dynCall_iiii = e.asm.Y).apply(null, arguments);
    }, e._asyncify_start_unwind = function() {
      return (e._asyncify_start_unwind = e.asm.Z).apply(null, arguments);
    }, e._asyncify_stop_unwind = function() {
      return (e._asyncify_stop_unwind = e.asm._).apply(null, arguments);
    }, e._asyncify_start_rewind = function() {
      return (e._asyncify_start_rewind = e.asm.$).apply(null, arguments);
    }, e._asyncify_stop_rewind = function() {
      return (e._asyncify_stop_rewind = e.asm.aa).apply(null, arguments);
    };
    var Tn;
    en = function n() {
      Tn || Nn(), Tn || (en = n);
    };
    function Nn() {
      function n() {
        if (!Tn && (Tn = !0, e.calledRun = !0, !dn)) {
          if (pn(Qn), pn(Ft), g(e), e.onRuntimeInitialized && e.onRuntimeInitialized(), e.postRun) for (typeof e.postRun == "function" && (e.postRun = [e.postRun]); e.postRun.length; ) {
            var t = e.postRun.shift();
            Kn.unshift(t);
          }
          pn(Kn);
        }
      }
      if (!(0 < V)) {
        if (e.preRun) for (typeof e.preRun == "function" && (e.preRun = [e.preRun]); e.preRun.length; ) jt();
        pn(Xn), 0 < V || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            e.setStatus("");
          }, 1), n();
        }, 1)) : n());
      }
    }
    if (e.run = Nn, e.preInit) for (typeof e.preInit == "function" && (e.preInit = [e.preInit]); 0 < e.preInit.length; ) e.preInit.pop()();
    return Nn(), c.ready;
  };
}();
class De extends Ee {
  getSamWasmFilePath(c, e) {
    return `${c}/magnifeye/wasm/${e}`;
  }
  fetchSamModule(c) {
    return Be(c);
  }
}
te(De);
