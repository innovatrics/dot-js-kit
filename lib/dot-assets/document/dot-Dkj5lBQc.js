var ye = Object.defineProperty;
var jt = (a) => {
  throw TypeError(a);
};
var ve = (a, o, e) => o in a ? ye(a, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[o] = e;
var qn = (a, o, e) => ve(a, typeof o != "symbol" ? o + "" : o, e), Nt = (a, o, e) => o.has(a) || jt("Cannot " + e);
var H = (a, o, e) => (Nt(a, o, "read from private field"), e ? e.call(a) : o.get(a)), On = (a, o, e) => o.has(a) ? jt("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(a) : o.set(a, e), kn = (a, o, e, y) => (Nt(a, o, "write to private field"), y ? y.call(a, e) : o.set(a, e), e);
const Ht = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, ge = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class F extends Error {
  constructor(e, y) {
    super(e);
    qn(this, "cause");
    this.name = "AutoCaptureError", this.cause = y;
  }
  // Change this to Decorator when they will be in stable release
  static logError(e) {
  }
  static fromCameraError(e) {
    if (this.logError(e), e instanceof F)
      return e;
    let y;
    switch (e.name) {
      case "OverconstrainedError":
        y = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        y = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        y = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        y = "There is no camera available to you";
        break;
      default:
        y = "An unknown camera error has occurred";
        break;
    }
    return new F(y, e);
  }
  static fromError(e) {
    if (this.logError(e), e instanceof F)
      return e;
    const y = "An unexpected error has occurred";
    return new F(y);
  }
}
const we = {
  RGB: "RGB",
  RGBA: "RGBA"
};
var $, q, ln;
class Ae {
  constructor(o, e) {
    On(this, $);
    On(this, q);
    On(this, ln);
    kn(this, $, o), kn(this, q, this.allocate(e.length * e.BYTES_PER_ELEMENT)), kn(this, ln, this.allocate(e.length * e.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return H(this, q);
  }
  get bgr0ImagePointer() {
    return H(this, ln);
  }
  allocate(o) {
    return H(this, $)._malloc(o);
  }
  free() {
    H(this, $)._free(H(this, q)), H(this, $)._free(H(this, ln));
  }
  writeDataToMemory(o) {
    H(this, $).HEAPU8.set(o, H(this, q));
  }
}
$ = new WeakMap(), q = new WeakMap(), ln = new WeakMap();
class _e {
  constructor() {
    qn(this, "samWasmModule");
  }
  getOverriddenModules(o, e) {
    return {
      locateFile: (y) => new URL(e || y, o).href
    };
  }
  async handleMissingOrInvalidSamModule(o, e) {
    try {
      const y = await fetch(o);
      if (!y.ok)
        throw new F(
          `The path to ${e} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${o}`
        );
      const g = await y.arrayBuffer();
      if (!WebAssembly.validate(g))
        throw new F(
          `The provided ${e} is not a valid WASM module. Please check provided path to wasm files. Current path is ${o}`
        );
    } catch (y) {
      if (y instanceof F)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), y;
    }
  }
  async getSamWasmFileName() {
    return await ge() ? Ht.simd : Ht.sam;
  }
  async initSamModule(o, e) {
    if (this.samWasmModule)
      return;
    const y = await this.getSamWasmFileName(), g = this.getSamWasmFilePath(e, y);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(o, g));
    } catch {
      throw await this.handleMissingOrInvalidSamModule(g, y), new F("Could not init detector.");
    }
  }
  async getSamVersion() {
    var e;
    const o = await ((e = this.samWasmModule) == null ? void 0 : e.getInfoString());
    return o == null ? void 0 : o.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(o) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const e = new Ae(this.samWasmModule, o);
    return e.writeDataToMemory(o), e;
  }
  convertToSamColorImage(o, e) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const y = this.writeImageToMemory(o);
    return this.samWasmModule.convertToSamColorImage(
      e.width,
      e.height,
      y.rgbaImagePointer,
      we.RGBA,
      y.bgr0ImagePointer
    ), y;
  }
}
const Rn = (a, o) => Math.hypot(o.x - a.x, o.y - a.y), Ce = (a) => {
  const { bottomLeft: o, bottomRight: e, topLeft: y, topRight: g } = a, C = Rn(y, g), A = Rn(g, e), b = Rn(o, e), S = Rn(y, o);
  return Math.min(C, A, b, S);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const zt = Symbol("Comlink.proxy"), Ee = Symbol("Comlink.endpoint"), Te = Symbol("Comlink.releaseProxy"), nt = Symbol("Comlink.finalizer"), xn = Symbol("Comlink.thrown"), Bt = (a) => typeof a == "object" && a !== null || typeof a == "function", Pe = {
  canHandle: (a) => Bt(a) && a[zt],
  serialize(a) {
    const { port1: o, port2: e } = new MessageChannel();
    return et(a, o), [e, [e]];
  },
  deserialize(a) {
    return a.start(), Me(a);
  }
}, be = {
  canHandle: (a) => Bt(a) && xn in a,
  serialize({ value: a }) {
    let o;
    return a instanceof Error ? o = {
      isError: !0,
      value: {
        message: a.message,
        name: a.name,
        stack: a.stack
      }
    } : o = { isError: !1, value: a }, [o, []];
  },
  deserialize(a) {
    throw a.isError ? Object.assign(new Error(a.value.message), a.value) : a.value;
  }
}, Dt = /* @__PURE__ */ new Map([
  ["proxy", Pe],
  ["throw", be]
]);
function Se(a, o) {
  for (const e of a)
    if (o === e || e === "*" || e instanceof RegExp && e.test(o))
      return !0;
  return !1;
}
function et(a, o = globalThis, e = ["*"]) {
  o.addEventListener("message", function y(g) {
    if (!g || !g.data)
      return;
    if (!Se(e, g.origin)) {
      console.warn(`Invalid origin '${g.origin}' for comlink proxy`);
      return;
    }
    const { id: C, type: A, path: b } = Object.assign({ path: [] }, g.data), S = (g.data.argumentList || []).map(X);
    let E;
    try {
      const _ = b.slice(0, -1).reduce((P, L) => P[L], a), R = b.reduce((P, L) => P[L], a);
      switch (A) {
        case "GET":
          E = R;
          break;
        case "SET":
          _[b.slice(-1)[0]] = X(g.data.value), E = !0;
          break;
        case "APPLY":
          E = R.apply(_, S);
          break;
        case "CONSTRUCT":
          {
            const P = new R(...S);
            E = xe(P);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: P, port2: L } = new MessageChannel();
            et(a, L), E = Ie(P, [P]);
          }
          break;
        case "RELEASE":
          E = void 0;
          break;
        default:
          return;
      }
    } catch (_) {
      E = { value: _, [xn]: 0 };
    }
    Promise.resolve(E).catch((_) => ({ value: _, [xn]: 0 })).then((_) => {
      const [R, P] = jn(_);
      o.postMessage(Object.assign(Object.assign({}, R), { id: C }), P), A === "RELEASE" && (o.removeEventListener("message", y), Vt(o), nt in a && typeof a[nt] == "function" && a[nt]());
    }).catch((_) => {
      const [R, P] = jn({
        value: new TypeError("Unserializable return value"),
        [xn]: 0
      });
      o.postMessage(Object.assign(Object.assign({}, R), { id: C }), P);
    });
  }), o.start && o.start();
}
function We(a) {
  return a.constructor.name === "MessagePort";
}
function Vt(a) {
  We(a) && a.close();
}
function Me(a, o) {
  return tt(a, [], o);
}
function In(a) {
  if (a)
    throw new Error("Proxy has been released and is not useable");
}
function Gt(a) {
  return un(a, {
    type: "RELEASE"
  }).then(() => {
    Vt(a);
  });
}
const Fn = /* @__PURE__ */ new WeakMap(), Ln = "FinalizationRegistry" in globalThis && new FinalizationRegistry((a) => {
  const o = (Fn.get(a) || 0) - 1;
  Fn.set(a, o), o === 0 && Gt(a);
});
function Oe(a, o) {
  const e = (Fn.get(o) || 0) + 1;
  Fn.set(o, e), Ln && Ln.register(a, o, a);
}
function ke(a) {
  Ln && Ln.unregister(a);
}
function tt(a, o = [], e = function() {
}) {
  let y = !1;
  const g = new Proxy(e, {
    get(C, A) {
      if (In(y), A === Te)
        return () => {
          ke(g), Gt(a), y = !0;
        };
      if (A === "then") {
        if (o.length === 0)
          return { then: () => g };
        const b = un(a, {
          type: "GET",
          path: o.map((S) => S.toString())
        }).then(X);
        return b.then.bind(b);
      }
      return tt(a, [...o, A]);
    },
    set(C, A, b) {
      In(y);
      const [S, E] = jn(b);
      return un(a, {
        type: "SET",
        path: [...o, A].map((_) => _.toString()),
        value: S
      }, E).then(X);
    },
    apply(C, A, b) {
      In(y);
      const S = o[o.length - 1];
      if (S === Ee)
        return un(a, {
          type: "ENDPOINT"
        }).then(X);
      if (S === "bind")
        return tt(a, o.slice(0, -1));
      const [E, _] = Ut(b);
      return un(a, {
        type: "APPLY",
        path: o.map((R) => R.toString()),
        argumentList: E
      }, _).then(X);
    },
    construct(C, A) {
      In(y);
      const [b, S] = Ut(A);
      return un(a, {
        type: "CONSTRUCT",
        path: o.map((E) => E.toString()),
        argumentList: b
      }, S).then(X);
    }
  });
  return Oe(g, a), g;
}
function Re(a) {
  return Array.prototype.concat.apply([], a);
}
function Ut(a) {
  const o = a.map(jn);
  return [o.map((e) => e[0]), Re(o.map((e) => e[1]))];
}
const $t = /* @__PURE__ */ new WeakMap();
function Ie(a, o) {
  return $t.set(a, o), a;
}
function xe(a) {
  return Object.assign(a, { [zt]: !0 });
}
function jn(a) {
  for (const [o, e] of Dt)
    if (e.canHandle(a)) {
      const [y, g] = e.serialize(a);
      return [
        {
          type: "HANDLER",
          name: o,
          value: y
        },
        g
      ];
    }
  return [
    {
      type: "RAW",
      value: a
    },
    $t.get(a) || []
  ];
}
function X(a) {
  switch (a.type) {
    case "HANDLER":
      return Dt.get(a.name).deserialize(a.value);
    case "RAW":
      return a.value;
  }
}
function un(a, o, e) {
  return new Promise((y) => {
    const g = Fe();
    a.addEventListener("message", function C(A) {
      !A.data || !A.data.id || A.data.id !== g || (a.removeEventListener("message", C), y(A.data));
    }), a.start && a.start(), a.postMessage(Object.assign({ id: g }, o), e);
  });
}
function Fe() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var Le = function() {
  var a = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
  return function(o) {
    o = o || {};
    var e;
    e || (e = typeof o < "u" ? o : {});
    var y, g;
    e.ready = new Promise(function(n, t) {
      y = n, g = t;
    });
    var C = {}, A;
    for (A in e) e.hasOwnProperty(A) && (C[A] = e[A]);
    var b = "./this.program", S = !1, E = !1;
    S = typeof window == "object", E = typeof importScripts == "function";
    var _ = "", R;
    (S || E) && (E ? _ = self.location.href : document.currentScript && (_ = document.currentScript.src), a && (_ = a), _.indexOf("blob:") !== 0 ? _ = _.substr(0, _.lastIndexOf("/") + 1) : _ = "", E && (R = function(n) {
      var t = new XMLHttpRequest();
      return t.open("GET", n, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
    }));
    var P = e.printErr || console.warn.bind(console);
    for (A in C) C.hasOwnProperty(A) && (e[A] = C[A]);
    C = null, e.thisProgram && (b = e.thisProgram);
    var L;
    e.wasmBinary && (L = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, typeof WebAssembly != "object" && fn("no native wasm support detected");
    var Y, Nn = !1;
    function rt(n) {
      n || fn("Assertion failed: undefined");
    }
    var it = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
    function Yt(n, t, r) {
      var i = I;
      if (0 < r) {
        r = t + r - 1;
        for (var s = 0; s < n.length; ++s) {
          var u = n.charCodeAt(s);
          if (55296 <= u && 57343 >= u) {
            var c = n.charCodeAt(++s);
            u = 65536 + ((u & 1023) << 10) | c & 1023;
          }
          if (127 >= u) {
            if (t >= r) break;
            i[t++] = u;
          } else {
            if (2047 >= u) {
              if (t + 1 >= r) break;
              i[t++] = 192 | u >> 6;
            } else {
              if (65535 >= u) {
                if (t + 2 >= r) break;
                i[t++] = 224 | u >> 12;
              } else {
                if (t + 3 >= r) break;
                i[t++] = 240 | u >> 18, i[t++] = 128 | u >> 12 & 63;
              }
              i[t++] = 128 | u >> 6 & 63;
            }
            i[t++] = 128 | u & 63;
          }
        }
        i[t] = 0;
      }
    }
    var at = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0;
    function Zt(n, t) {
      for (var r = n >> 1, i = r + t / 2; !(r >= i) && gn[r]; ) ++r;
      if (r <<= 1, 32 < r - n && at) return at.decode(I.subarray(n, r));
      for (r = 0, i = ""; ; ) {
        var s = tn[n + 2 * r >> 1];
        if (s == 0 || r == t / 2) return i;
        ++r, i += String.fromCharCode(s);
      }
    }
    function Jt(n, t, r) {
      if (r === void 0 && (r = 2147483647), 2 > r) return 0;
      r -= 2;
      var i = t;
      r = r < 2 * n.length ? r / 2 : n.length;
      for (var s = 0; s < r; ++s) tn[t >> 1] = n.charCodeAt(s), t += 2;
      return tn[t >> 1] = 0, t - i;
    }
    function Kt(n) {
      return 2 * n.length;
    }
    function Qt(n, t) {
      for (var r = 0, i = ""; !(r >= t / 4); ) {
        var s = M[n + 4 * r >> 2];
        if (s == 0) break;
        ++r, 65536 <= s ? (s -= 65536, i += String.fromCharCode(55296 | s >> 10, 56320 | s & 1023)) : i += String.fromCharCode(s);
      }
      return i;
    }
    function Xt(n, t, r) {
      if (r === void 0 && (r = 2147483647), 4 > r) return 0;
      var i = t;
      r = i + r - 4;
      for (var s = 0; s < n.length; ++s) {
        var u = n.charCodeAt(s);
        if (55296 <= u && 57343 >= u) {
          var c = n.charCodeAt(++s);
          u = 65536 + ((u & 1023) << 10) | c & 1023;
        }
        if (M[t >> 2] = u, t += 4, t + 4 > r) break;
      }
      return M[t >> 2] = 0, t - i;
    }
    function qt(n) {
      for (var t = 0, r = 0; r < n.length; ++r) {
        var i = n.charCodeAt(r);
        55296 <= i && 57343 >= i && ++r, t += 4;
      }
      return t;
    }
    var nn, Z, I, tn, gn, M, U, ot, st;
    function ut(n) {
      nn = n, e.HEAP8 = Z = new Int8Array(n), e.HEAP16 = tn = new Int16Array(n), e.HEAP32 = M = new Int32Array(n), e.HEAPU8 = I = new Uint8Array(n), e.HEAPU16 = gn = new Uint16Array(n), e.HEAPU32 = U = new Uint32Array(n), e.HEAPF32 = ot = new Float32Array(n), e.HEAPF64 = st = new Float64Array(n);
    }
    var lt = e.INITIAL_MEMORY || 16777216;
    e.wasmMemory ? Y = e.wasmMemory : Y = new WebAssembly.Memory({ initial: lt / 65536, maximum: 32768 }), Y && (nn = Y.buffer), lt = nn.byteLength, ut(nn);
    var ct = [], ft = [], ne = [], dt = [];
    function te() {
      var n = e.preRun.shift();
      ct.unshift(n);
    }
    var J = 0, cn = null;
    e.preloadedImages = {}, e.preloadedAudios = {};
    function fn(n) {
      throw e.onAbort && e.onAbort(n), P(n), Nn = !0, n = new WebAssembly.RuntimeError("abort(" + n + "). Build with -s ASSERTIONS=1 for more info."), g(n), n;
    }
    function Hn(n) {
      var t = K;
      return String.prototype.startsWith ? t.startsWith(n) : t.indexOf(n) === 0;
    }
    function ht() {
      return Hn("data:application/octet-stream;base64,");
    }
    var K = "dot-sam.wasm";
    if (!ht()) {
      var mt = K;
      K = e.locateFile ? e.locateFile(mt, _) : _ + mt;
    }
    function pt() {
      try {
        if (L) return new Uint8Array(L);
        if (R) return R(K);
        throw "both async and sync fetching of the wasm failed";
      } catch (n) {
        fn(n);
      }
    }
    function ee() {
      return L || !S && !E || typeof fetch != "function" || Hn("file://") ? Promise.resolve().then(pt) : fetch(K, { credentials: "same-origin" }).then(function(n) {
        if (!n.ok) throw "failed to load wasm binary file at '" + K + "'";
        return n.arrayBuffer();
      }).catch(function() {
        return pt();
      });
    }
    function wn(n) {
      for (; 0 < n.length; ) {
        var t = n.shift();
        if (typeof t == "function") t(e);
        else {
          var r = t.Ba;
          typeof r == "number" ? t.ta === void 0 ? Un("v", r)() : Un("vi", r)(t.ta) : r(t.ta === void 0 ? null : t.ta);
        }
      }
    }
    function Un(n, t) {
      var r = [];
      return function() {
        r.length = arguments.length;
        for (var i = 0; i < arguments.length; i++) r[i] = arguments[i];
        return r && r.length ? e["dynCall_" + n].apply(null, [t].concat(r)) : e["dynCall_" + n].call(null, t);
      };
    }
    function re(n) {
      this.da = n - 16, this.Oa = function(t) {
        M[this.da + 8 >> 2] = t;
      }, this.La = function(t) {
        M[this.da + 0 >> 2] = t;
      }, this.Ma = function() {
        M[this.da + 4 >> 2] = 0;
      }, this.Ka = function() {
        Z[this.da + 12 >> 0] = 0;
      }, this.Na = function() {
        Z[this.da + 13 >> 0] = 0;
      }, this.Fa = function(t, r) {
        this.Oa(t), this.La(r), this.Ma(), this.Ka(), this.Na();
      };
    }
    function An() {
      return 0 < An.xa;
    }
    function zn(n) {
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
    var yt = void 0;
    function O(n) {
      for (var t = ""; I[n]; ) t += yt[I[n++]];
      return t;
    }
    var en = {}, Q = {}, _n = {};
    function Bn(n) {
      if (n === void 0) return "_unknown";
      n = n.replace(/[^a-zA-Z0-9_]/g, "$");
      var t = n.charCodeAt(0);
      return 48 <= t && 57 >= t ? "_" + n : n;
    }
    function Dn(n, t) {
      return n = Bn(n), new Function("body", "return function " + n + `() {
    "use strict";    return body.apply(this, arguments);
};
`)(t);
    }
    function Vn(n) {
      var t = Error, r = Dn(n, function(i) {
        this.name = n, this.message = i, i = Error(i).stack, i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return r.prototype = Object.create(t.prototype), r.prototype.constructor = r, r.prototype.toString = function() {
        return this.message === void 0 ? this.name : this.name + ": " + this.message;
      }, r;
    }
    var rn = void 0;
    function v(n) {
      throw new rn(n);
    }
    var vt = void 0;
    function Cn(n) {
      throw new vt(n);
    }
    function an(n, t, r) {
      function i(l) {
        l = r(l), l.length !== n.length && Cn("Mismatched type converter count");
        for (var m = 0; m < n.length; ++m) z(n[m], l[m]);
      }
      n.forEach(function(l) {
        _n[l] = t;
      });
      var s = Array(t.length), u = [], c = 0;
      t.forEach(function(l, m) {
        Q.hasOwnProperty(l) ? s[m] = Q[l] : (u.push(l), en.hasOwnProperty(l) || (en[l] = []), en[l].push(function() {
          s[m] = Q[l], ++c, c === u.length && i(s);
        }));
      }), u.length === 0 && i(s);
    }
    function z(n, t, r) {
      if (r = r || {}, !("argPackAdvance" in t)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var i = t.name;
      if (n || v('type "' + i + '" must have a positive integer typeid pointer'), Q.hasOwnProperty(n)) {
        if (r.Ea) return;
        v("Cannot register type '" + i + "' twice");
      }
      Q[n] = t, delete _n[n], en.hasOwnProperty(n) && (t = en[n], delete en[n], t.forEach(function(s) {
        s();
      }));
    }
    function ie(n) {
      return { count: n.count, oa: n.oa, pa: n.pa, da: n.da, fa: n.fa, ga: n.ga, ha: n.ha };
    }
    function Gn(n) {
      v(n.A.fa.ea.name + " instance already deleted");
    }
    var $n = !1;
    function gt() {
    }
    function wt(n) {
      --n.count.value, n.count.value === 0 && (n.ga ? n.ha.na(n.ga) : n.fa.ea.na(n.da));
    }
    function dn(n) {
      return typeof FinalizationGroup > "u" ? (dn = function(t) {
        return t;
      }, n) : ($n = new FinalizationGroup(function(t) {
        for (var r = t.next(); !r.done; r = t.next()) r = r.value, r.da ? wt(r) : console.warn("object already deleted: " + r.da);
      }), dn = function(t) {
        return $n.register(t, t.A, t.A), t;
      }, gt = function(t) {
        $n.unregister(t.A);
      }, dn(n));
    }
    var hn = void 0, mn = [];
    function Yn() {
      for (; mn.length; ) {
        var n = mn.pop();
        n.A.oa = !1, n.delete();
      }
    }
    function V() {
    }
    var At = {};
    function ae(n, t) {
      var r = e;
      if (r[n].ja === void 0) {
        var i = r[n];
        r[n] = function() {
          return r[n].ja.hasOwnProperty(arguments.length) || v("Function '" + t + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + r[n].ja + ")!"), r[n].ja[arguments.length].apply(this, arguments);
        }, r[n].ja = [], r[n].ja[i.ya] = i;
      }
    }
    function _t(n, t, r) {
      e.hasOwnProperty(n) ? ((r === void 0 || e[n].ja !== void 0 && e[n].ja[r] !== void 0) && v("Cannot register public name '" + n + "' twice"), ae(n, n), e.hasOwnProperty(r) && v("Cannot register multiple overloads of a function with the same number of arguments (" + r + ")!"), e[n].ja[r] = t) : (e[n] = t, r !== void 0 && (e[n].Ra = r));
    }
    function oe(n, t, r, i, s, u, c, l) {
      this.name = n, this.constructor = t, this.ma = r, this.na = i, this.ia = s, this.Ca = u, this.qa = c, this.Aa = l;
    }
    function En(n, t, r) {
      for (; t !== r; ) t.qa || v("Expected null or instance of " + r.name + ", got an instance of " + t.name), n = t.qa(n), t = t.ia;
      return n;
    }
    function se(n, t) {
      return t === null ? (this.ua && v("null is not a valid " + this.name), 0) : (t.A || v('Cannot pass "' + sn(t) + '" as a ' + this.name), t.A.da || v("Cannot pass deleted object as a pointer of type " + this.name), En(t.A.da, t.A.fa.ea, this.ea));
    }
    function ue(n, t) {
      if (t === null) {
        if (this.ua && v("null is not a valid " + this.name), this.sa) {
          var r = this.Ha();
          return n !== null && n.push(this.na, r), r;
        }
        return 0;
      }
      if (t.A || v('Cannot pass "' + sn(t) + '" as a ' + this.name), t.A.da || v("Cannot pass deleted object as a pointer of type " + this.name), !this.ra && t.A.fa.ra && v("Cannot convert argument of type " + (t.A.ha ? t.A.ha.name : t.A.fa.name) + " to parameter type " + this.name), r = En(t.A.da, t.A.fa.ea, this.ea), this.sa) switch (t.A.ga === void 0 && v("Passing raw pointer to smart pointer is illegal"), this.Pa) {
        case 0:
          t.A.ha === this ? r = t.A.ga : v("Cannot convert argument of type " + (t.A.ha ? t.A.ha.name : t.A.fa.name) + " to parameter type " + this.name);
          break;
        case 1:
          r = t.A.ga;
          break;
        case 2:
          if (t.A.ha === this) r = t.A.ga;
          else {
            var i = t.clone();
            r = this.Ia(r, on(function() {
              i.delete();
            })), n !== null && n.push(this.na, r);
          }
          break;
        default:
          v("Unsupporting sharing policy");
      }
      return r;
    }
    function le(n, t) {
      return t === null ? (this.ua && v("null is not a valid " + this.name), 0) : (t.A || v('Cannot pass "' + sn(t) + '" as a ' + this.name), t.A.da || v("Cannot pass deleted object as a pointer of type " + this.name), t.A.fa.ra && v("Cannot convert argument of type " + t.A.fa.name + " to parameter type " + this.name), En(t.A.da, t.A.fa.ea, this.ea));
    }
    function Tn(n) {
      return this.fromWireType(U[n >> 2]);
    }
    function Ct(n, t, r) {
      return t === r ? n : r.ia === void 0 ? null : (n = Ct(n, t, r.ia), n === null ? null : r.Aa(n));
    }
    var pn = {};
    function ce(n, t) {
      for (t === void 0 && v("ptr should not be undefined"); n.ia; ) t = n.qa(t), n = n.ia;
      return pn[t];
    }
    function Pn(n, t) {
      return t.fa && t.da || Cn("makeClassHandle requires ptr and ptrType"), !!t.ha != !!t.ga && Cn("Both smartPtrType and smartPtr must be specified"), t.count = { value: 1 }, dn(Object.create(n, { A: { value: t } }));
    }
    function B(n, t, r, i) {
      this.name = n, this.ea = t, this.ua = r, this.ra = i, this.sa = !1, this.na = this.Ia = this.Ha = this.wa = this.Pa = this.Ga = void 0, t.ia !== void 0 ? this.toWireType = ue : (this.toWireType = i ? se : le, this.ka = null);
    }
    function Et(n, t, r) {
      e.hasOwnProperty(n) || Cn("Replacing nonexistant public symbol"), e[n].ja !== void 0 && r !== void 0 ? e[n].ja[r] = t : (e[n] = t, e[n].ya = r);
    }
    function G(n, t) {
      n = O(n);
      var r = Un(n, t);
      return typeof r != "function" && v("unknown function pointer with signature " + n + ": " + t), r;
    }
    var Tt = void 0;
    function Pt(n) {
      n = Ft(n);
      var t = O(n);
      return D(n), t;
    }
    function yn(n, t) {
      function r(u) {
        s[u] || Q[u] || (_n[u] ? _n[u].forEach(r) : (i.push(u), s[u] = !0));
      }
      var i = [], s = {};
      throw t.forEach(r), new Tt(n + ": " + i.map(Pt).join([", "]));
    }
    function bt(n, t) {
      for (var r = [], i = 0; i < n; i++) r.push(M[(t >> 2) + i]);
      return r;
    }
    function bn(n) {
      for (; n.length; ) {
        var t = n.pop();
        n.pop()(t);
      }
    }
    function St(n, t, r) {
      return n instanceof Object || v(r + ' with invalid "this": ' + n), n instanceof t.ea.constructor || v(r + ' incompatible with "this" of type ' + n.constructor.name), n.A.da || v("cannot call emscripten binding method " + r + " on deleted object"), En(n.A.da, n.A.fa.ea, t.ea);
    }
    var Zn = [], x = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }];
    function Jn(n) {
      4 < n && --x[n].Ja === 0 && (x[n] = void 0, Zn.push(n));
    }
    function on(n) {
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
          var t = Zn.length ? Zn.pop() : x.length;
          return x[t] = { Ja: 1, value: n }, t;
      }
    }
    function sn(n) {
      if (n === null) return "null";
      var t = typeof n;
      return t === "object" || t === "array" || t === "function" ? n.toString() : "" + n;
    }
    function fe(n, t) {
      switch (t) {
        case 2:
          return function(r) {
            return this.fromWireType(ot[r >> 2]);
          };
        case 3:
          return function(r) {
            return this.fromWireType(st[r >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + n);
      }
    }
    function de(n) {
      var t = Function;
      if (!(t instanceof Function)) throw new TypeError("new_ called with constructor type " + typeof t + " which is not a function");
      var r = Dn(t.name || "unknownFunctionName", function() {
      });
      return r.prototype = t.prototype, r = new r(), n = t.apply(r, n), n instanceof Object ? n : r;
    }
    function he(n, t, r) {
      switch (t) {
        case 0:
          return r ? function(i) {
            return Z[i];
          } : function(i) {
            return I[i];
          };
        case 1:
          return r ? function(i) {
            return tn[i >> 1];
          } : function(i) {
            return gn[i >> 1];
          };
        case 2:
          return r ? function(i) {
            return M[i >> 2];
          } : function(i) {
            return U[i >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + n);
      }
    }
    function Kn(n) {
      return n || v("Cannot use deleted val. handle = " + n), x[n].value;
    }
    function Wt(n, t) {
      var r = Q[n];
      return r === void 0 && v(t + " has unknown type " + Pt(n)), r;
    }
    var me = {}, Mt = {};
    function Ot() {
      if (!Qn) {
        var n = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: b || "./this.program" }, t;
        for (t in Mt) n[t] = Mt[t];
        var r = [];
        for (t in n) r.push(t + "=" + n[t]);
        Qn = r;
      }
      return Qn;
    }
    var Qn, kt = [];
    function Rt(n) {
      var t = {}, r;
      for (r in n) (function(i) {
        var s = n[i];
        t[i] = typeof s == "function" ? function() {
          kt.push(i);
          try {
            return s.apply(null, arguments);
          } finally {
            if (Nn) return;
            var u = kt.pop();
            rt(u === i);
          }
        } : s;
      })(r);
      return t;
    }
    for (var It = Array(256), Sn = 0; 256 > Sn; ++Sn) It[Sn] = String.fromCharCode(Sn);
    yt = It, rn = e.BindingError = Vn("BindingError"), vt = e.InternalError = Vn("InternalError"), V.prototype.isAliasOf = function(n) {
      if (!(this instanceof V && n instanceof V)) return !1;
      var t = this.A.fa.ea, r = this.A.da, i = n.A.fa.ea;
      for (n = n.A.da; t.ia; ) r = t.qa(r), t = t.ia;
      for (; i.ia; ) n = i.qa(n), i = i.ia;
      return t === i && r === n;
    }, V.prototype.clone = function() {
      if (this.A.da || Gn(this), this.A.pa) return this.A.count.value += 1, this;
      var n = dn(Object.create(Object.getPrototypeOf(this), { A: { value: ie(this.A) } }));
      return n.A.count.value += 1, n.A.oa = !1, n;
    }, V.prototype.delete = function() {
      this.A.da || Gn(this), this.A.oa && !this.A.pa && v("Object already scheduled for deletion"), gt(this), wt(this.A), this.A.pa || (this.A.ga = void 0, this.A.da = void 0);
    }, V.prototype.isDeleted = function() {
      return !this.A.da;
    }, V.prototype.deleteLater = function() {
      return this.A.da || Gn(this), this.A.oa && !this.A.pa && v("Object already scheduled for deletion"), mn.push(this), mn.length === 1 && hn && hn(Yn), this.A.oa = !0, this;
    }, B.prototype.Da = function(n) {
      return this.wa && (n = this.wa(n)), n;
    }, B.prototype.va = function(n) {
      this.na && this.na(n);
    }, B.prototype.argPackAdvance = 8, B.prototype.readValueFromPointer = Tn, B.prototype.deleteObject = function(n) {
      n !== null && n.delete();
    }, B.prototype.fromWireType = function(n) {
      function t() {
        return this.sa ? Pn(this.ea.ma, { fa: this.Ga, da: r, ha: this, ga: n }) : Pn(this.ea.ma, { fa: this, da: n });
      }
      var r = this.Da(n);
      if (!r) return this.va(n), null;
      var i = ce(this.ea, r);
      if (i !== void 0)
        return i.A.count.value === 0 ? (i.A.da = r, i.A.ga = n, i.clone()) : (i = i.clone(), this.va(n), i);
      if (i = this.ea.Ca(r), i = At[i], !i) return t.call(this);
      i = this.ra ? i.za : i.pointerType;
      var s = Ct(r, this.ea, i.ea);
      return s === null ? t.call(this) : this.sa ? Pn(i.ea.ma, { fa: i, da: s, ha: this, ga: n }) : Pn(
        i.ea.ma,
        { fa: i, da: s }
      );
    }, e.getInheritedInstanceCount = function() {
      return Object.keys(pn).length;
    }, e.getLiveInheritedInstances = function() {
      var n = [], t;
      for (t in pn) pn.hasOwnProperty(t) && n.push(pn[t]);
      return n;
    }, e.flushPendingDeletes = Yn, e.setDelayFunction = function(n) {
      hn = n, mn.length && hn && hn(Yn);
    }, Tt = e.UnboundTypeError = Vn("UnboundTypeError"), e.count_emval_handles = function() {
      for (var n = 0, t = 5; t < x.length; ++t) x[t] !== void 0 && ++n;
      return n;
    }, e.get_first_emval = function() {
      for (var n = 5; n < x.length; ++n) if (x[n] !== void 0) return x[n];
      return null;
    }, ft.push({ Ba: function() {
      xt();
    } });
    var pe = {
      z: function(n) {
        return Wn(n + 16) + 16;
      },
      u: function(n, t, r) {
        throw new re(n).Fa(t, r), "uncaught_exception" in An ? An.xa++ : An.xa = 1, n;
      },
      w: function(n, t, r, i, s) {
        var u = zn(r);
        t = O(t), z(n, { name: t, fromWireType: function(c) {
          return !!c;
        }, toWireType: function(c, l) {
          return l ? i : s;
        }, argPackAdvance: 8, readValueFromPointer: function(c) {
          if (r === 1) var l = Z;
          else if (r === 2) l = tn;
          else if (r === 4) l = M;
          else throw new TypeError("Unknown boolean type size: " + t);
          return this.fromWireType(l[c >> u]);
        }, ka: null });
      },
      h: function(n, t, r, i, s, u, c, l, m, f, d, h, w) {
        d = O(d), u = G(s, u), l && (l = G(c, l)), f && (f = G(m, f)), w = G(h, w);
        var T = Bn(d);
        _t(T, function() {
          yn("Cannot construct " + d + " due to unbound types", [i]);
        }), an([n, t, r], i ? [i] : [], function(p) {
          if (p = p[0], i)
            var N = p.ea, W = N.ma;
          else W = V.prototype;
          p = Dn(T, function() {
            if (Object.getPrototypeOf(this) !== k) throw new rn("Use 'new' to construct " + d);
            if (j.la === void 0) throw new rn(d + " has no accessible constructor");
            var Lt = j.la[arguments.length];
            if (Lt === void 0) throw new rn("Tried to invoke ctor of " + d + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(j.la).toString() + ") parameters instead!");
            return Lt.apply(this, arguments);
          });
          var k = Object.create(W, { constructor: { value: p } });
          p.prototype = k;
          var j = new oe(d, p, k, w, N, u, l, f);
          N = new B(d, j, !0, !1), W = new B(d + "*", j, !1, !1);
          var vn = new B(d + " const*", j, !1, !0);
          return At[n] = { pointerType: W, za: vn }, Et(T, p), [N, W, vn];
        });
      },
      g: function(n, t, r, i, s, u) {
        rt(0 < t);
        var c = bt(t, r);
        s = G(i, s);
        var l = [u], m = [];
        an([], [n], function(f) {
          f = f[0];
          var d = "constructor " + f.name;
          if (f.ea.la === void 0 && (f.ea.la = []), f.ea.la[t - 1] !== void 0) throw new rn("Cannot register multiple constructors with identical number of parameters (" + (t - 1) + ") for class '" + f.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          return f.ea.la[t - 1] = function() {
            yn("Cannot construct " + f.name + " due to unbound types", c);
          }, an([], c, function(h) {
            return f.ea.la[t - 1] = function() {
              arguments.length !== t - 1 && v(d + " called with " + arguments.length + " arguments, expected " + (t - 1)), m.length = 0, l.length = t;
              for (var w = 1; w < t; ++w) l[w] = h[w].toWireType(
                m,
                arguments[w - 1]
              );
              return w = s.apply(null, l), bn(m), h[0].fromWireType(w);
            }, [];
          }), [];
        });
      },
      b: function(n, t, r, i, s, u, c, l, m, f) {
        t = O(t), s = G(i, s), an([], [n], function(d) {
          d = d[0];
          var h = d.name + "." + t, w = { get: function() {
            yn("Cannot access " + h + " due to unbound types", [r, c]);
          }, enumerable: !0, configurable: !0 };
          return m ? w.set = function() {
            yn("Cannot access " + h + " due to unbound types", [r, c]);
          } : w.set = function() {
            v(h + " is a read-only property");
          }, Object.defineProperty(d.ea.ma, t, w), an([], m ? [r, c] : [r], function(T) {
            var p = T[0], N = { get: function() {
              var k = St(this, d, h + " getter");
              return p.fromWireType(s(u, k));
            }, enumerable: !0 };
            if (m) {
              m = G(l, m);
              var W = T[1];
              N.set = function(k) {
                var j = St(this, d, h + " setter"), vn = [];
                m(f, j, W.toWireType(vn, k)), bn(vn);
              };
            }
            return Object.defineProperty(d.ea.ma, t, N), [];
          }), [];
        });
      },
      v: function(n, t) {
        t = O(t), z(n, { name: t, fromWireType: function(r) {
          var i = x[r].value;
          return Jn(r), i;
        }, toWireType: function(r, i) {
          return on(i);
        }, argPackAdvance: 8, readValueFromPointer: Tn, ka: null });
      },
      m: function(n, t, r) {
        r = zn(r), t = O(t), z(n, {
          name: t,
          fromWireType: function(i) {
            return i;
          },
          toWireType: function(i, s) {
            if (typeof s != "number" && typeof s != "boolean") throw new TypeError('Cannot convert "' + sn(s) + '" to ' + this.name);
            return s;
          },
          argPackAdvance: 8,
          readValueFromPointer: fe(t, r),
          ka: null
        });
      },
      c: function(n, t, r, i, s, u) {
        var c = bt(t, r);
        n = O(n), s = G(i, s), _t(n, function() {
          yn("Cannot call " + n + " due to unbound types", c);
        }, t - 1), an([], c, function(l) {
          var m = n, f = n;
          l = [l[0], null].concat(l.slice(1));
          var d = s, h = l.length;
          2 > h && v("argTypes array size mismatch! Must at least get return value and 'this' types!");
          for (var w = l[1] !== null && !1, T = !1, p = 1; p < l.length; ++p) if (l[p] !== null && l[p].ka === void 0) {
            T = !0;
            break;
          }
          var N = l[0].name !== "void", W = "", k = "";
          for (p = 0; p < h - 2; ++p) W += (p !== 0 ? ", " : "") + "arg" + p, k += (p !== 0 ? ", " : "") + "arg" + p + "Wired";
          f = "return function " + Bn(f) + "(" + W + `) {
if (arguments.length !== ` + (h - 2) + `) {
throwBindingError('function ` + f + " called with ' + arguments.length + ' arguments, expected " + (h - 2) + ` args!');
}
`, T && (f += `var destructors = [];
`);
          var j = T ? "destructors" : "null";
          for (W = "throwBindingError invoker fn runDestructors retType classParam".split(" "), d = [v, d, u, bn, l[0], l[1]], w && (f += "var thisWired = classParam.toWireType(" + j + `, this);
`), p = 0; p < h - 2; ++p) f += "var arg" + p + "Wired = argType" + p + ".toWireType(" + j + ", arg" + p + "); // " + l[p + 2].name + `
`, W.push("argType" + p), d.push(l[p + 2]);
          if (w && (k = "thisWired" + (0 < k.length ? ", " : "") + k), f += (N ? "var rv = " : "") + "invoker(fn" + (0 < k.length ? ", " : "") + k + `);
`, T) f += `runDestructors(destructors);
`;
          else for (p = w ? 1 : 2; p < l.length; ++p) h = p === 1 ? "thisWired" : "arg" + (p - 2) + "Wired", l[p].ka !== null && (f += h + "_dtor(" + h + "); // " + l[p].name + `
`, W.push(h + "_dtor"), d.push(l[p].ka));
          return N && (f += `var ret = retType.fromWireType(rv);
return ret;
`), W.push(f + `}
`), l = de(W).apply(null, d), Et(m, l, t - 1), [];
        });
      },
      e: function(n, t, r, i, s) {
        function u(f) {
          return f;
        }
        t = O(t), s === -1 && (s = 4294967295);
        var c = zn(r);
        if (i === 0) {
          var l = 32 - 8 * r;
          u = function(f) {
            return f << l >>> l;
          };
        }
        var m = t.indexOf("unsigned") != -1;
        z(n, { name: t, fromWireType: u, toWireType: function(f, d) {
          if (typeof d != "number" && typeof d != "boolean") throw new TypeError('Cannot convert "' + sn(d) + '" to ' + this.name);
          if (d < i || d > s) throw new TypeError('Passing a number "' + sn(d) + '" from JS side to C/C++ side to an argument of type "' + t + '", which is outside the valid range [' + i + ", " + s + "]!");
          return m ? d >>> 0 : d | 0;
        }, argPackAdvance: 8, readValueFromPointer: he(t, c, i !== 0), ka: null });
      },
      d: function(n, t, r) {
        function i(u) {
          u >>= 2;
          var c = U;
          return new s(nn, c[u + 1], c[u]);
        }
        var s = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t];
        r = O(r), z(n, { name: r, fromWireType: i, argPackAdvance: 8, readValueFromPointer: i }, { Ea: !0 });
      },
      n: function(n, t) {
        t = O(t);
        var r = t === "std::string";
        z(n, {
          name: t,
          fromWireType: function(i) {
            var s = U[i >> 2];
            if (r) for (var u = i + 4, c = 0; c <= s; ++c) {
              var l = i + 4 + c;
              if (c == s || I[l] == 0) {
                if (u) {
                  var m = u, f = I, d = m + (l - u);
                  for (u = m; f[u] && !(u >= d); ) ++u;
                  if (16 < u - m && f.subarray && it) m = it.decode(f.subarray(m, u));
                  else {
                    for (d = ""; m < u; ) {
                      var h = f[m++];
                      if (h & 128) {
                        var w = f[m++] & 63;
                        if ((h & 224) == 192) d += String.fromCharCode((h & 31) << 6 | w);
                        else {
                          var T = f[m++] & 63;
                          h = (h & 240) == 224 ? (h & 15) << 12 | w << 6 | T : (h & 7) << 18 | w << 12 | T << 6 | f[m++] & 63, 65536 > h ? d += String.fromCharCode(h) : (h -= 65536, d += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
                        }
                      } else d += String.fromCharCode(h);
                    }
                    m = d;
                  }
                } else m = "";
                if (p === void 0) var p = m;
                else p += "\0", p += m;
                u = l + 1;
              }
            }
            else {
              for (p = Array(s), c = 0; c < s; ++c) p[c] = String.fromCharCode(I[i + 4 + c]);
              p = p.join("");
            }
            return D(i), p;
          },
          toWireType: function(i, s) {
            s instanceof ArrayBuffer && (s = new Uint8Array(s));
            var u = typeof s == "string";
            u || s instanceof Uint8Array || s instanceof Uint8ClampedArray || s instanceof Int8Array || v("Cannot pass non-string to std::string");
            var c = (r && u ? function() {
              for (var f = 0, d = 0; d < s.length; ++d) {
                var h = s.charCodeAt(d);
                55296 <= h && 57343 >= h && (h = 65536 + ((h & 1023) << 10) | s.charCodeAt(++d) & 1023), 127 >= h ? ++f : f = 2047 >= h ? f + 2 : 65535 >= h ? f + 3 : f + 4;
              }
              return f;
            } : function() {
              return s.length;
            })(), l = Wn(4 + c + 1);
            if (U[l >> 2] = c, r && u) Yt(s, l + 4, c + 1);
            else if (u) for (u = 0; u < c; ++u) {
              var m = s.charCodeAt(u);
              255 < m && (D(l), v("String has UTF-16 code units that do not fit in 8 bits")), I[l + 4 + u] = m;
            }
            else for (u = 0; u < c; ++u) I[l + 4 + u] = s[u];
            return i !== null && i.push(D, l), l;
          },
          argPackAdvance: 8,
          readValueFromPointer: Tn,
          ka: function(i) {
            D(i);
          }
        });
      },
      j: function(n, t, r) {
        if (r = O(r), t === 2)
          var i = Zt, s = Jt, u = Kt, c = function() {
            return gn;
          }, l = 1;
        else t === 4 && (i = Qt, s = Xt, u = qt, c = function() {
          return U;
        }, l = 2);
        z(n, { name: r, fromWireType: function(m) {
          for (var f = U[m >> 2], d = c(), h, w = m + 4, T = 0; T <= f; ++T) {
            var p = m + 4 + T * t;
            (T == f || d[p >> l] == 0) && (w = i(w, p - w), h === void 0 ? h = w : (h += "\0", h += w), w = p + t);
          }
          return D(m), h;
        }, toWireType: function(m, f) {
          typeof f != "string" && v("Cannot pass non-string to C++ string type " + r);
          var d = u(f), h = Wn(4 + d + t);
          return U[h >> 2] = d >> l, s(f, h + 4, d + t), m !== null && m.push(D, h), h;
        }, argPackAdvance: 8, readValueFromPointer: Tn, ka: function(m) {
          D(m);
        } });
      },
      x: function(n, t) {
        t = O(t), z(n, { Qa: !0, name: t, argPackAdvance: 0, fromWireType: function() {
        }, toWireType: function() {
        } });
      },
      k: function(n, t, r) {
        n = Kn(n), t = Wt(t, "emval::as");
        var i = [], s = on(i);
        return M[r >> 2] = s, t.toWireType(i, n);
      },
      i: Jn,
      l: function(n, t) {
        return n = Kn(n), t = Kn(t), on(n[t]);
      },
      p: function(n) {
        var t = me[n];
        return on(t === void 0 ? O(n) : t);
      },
      o: function(n) {
        bn(x[n].value), Jn(n);
      },
      y: function(n, t) {
        return n = Wt(n, "_emval_take_value"), n = n.readValueFromPointer(t), on(n);
      },
      f: function() {
        fn();
      },
      q: function(n, t, r) {
        I.copyWithin(n, t, t + r);
      },
      r: function(n) {
        n >>>= 0;
        var t = I.length;
        if (2147483648 < n) return !1;
        for (var r = 1; 4 >= r; r *= 2) {
          var i = t * (1 + 0.2 / r);
          i = Math.min(i, n + 100663296), i = Math.max(16777216, n, i), 0 < i % 65536 && (i += 65536 - i % 65536);
          n: {
            try {
              Y.grow(Math.min(2147483648, i) - nn.byteLength + 65535 >>> 16), ut(Y.buffer);
              var s = 1;
              break n;
            } catch {
            }
            s = void 0;
          }
          if (s) return !0;
        }
        return !1;
      },
      s: function(n, t) {
        var r = 0;
        return Ot().forEach(function(i, s) {
          var u = t + r;
          for (s = M[n + 4 * s >> 2] = u, u = 0; u < i.length; ++u) Z[s++ >> 0] = i.charCodeAt(u);
          Z[s >> 0] = 0, r += i.length + 1;
        }), 0;
      },
      t: function(n, t) {
        var r = Ot();
        M[n >> 2] = r.length;
        var i = 0;
        return r.forEach(function(s) {
          i += s.length + 1;
        }), M[t >> 2] = i, 0;
      },
      a: Y
    };
    (function() {
      function n(u) {
        u = u.exports, u = Rt(u), e.asm = u, J--, e.monitorRunDependencies && e.monitorRunDependencies(J), J == 0 && cn && (u = cn, cn = null, u());
      }
      function t(u) {
        n(u.instance);
      }
      function r(u) {
        return ee().then(function(c) {
          return WebAssembly.instantiate(c, i);
        }).then(u, function(c) {
          P("failed to asynchronously prepare wasm: " + c), fn(c);
        });
      }
      var i = { a: pe };
      if (J++, e.monitorRunDependencies && e.monitorRunDependencies(J), e.instantiateWasm) try {
        var s = e.instantiateWasm(i, n);
        return s = Rt(s);
      } catch (u) {
        return P("Module.instantiateWasm callback failed with error: " + u), !1;
      }
      return function() {
        if (L || typeof WebAssembly.instantiateStreaming != "function" || ht() || Hn("file://") || typeof fetch != "function") return r(t);
        fetch(K, { credentials: "same-origin" }).then(function(u) {
          return WebAssembly.instantiateStreaming(u, i).then(t, function(c) {
            return P("wasm streaming compile failed: " + c), P("falling back to ArrayBuffer instantiation"), r(t);
          });
        });
      }(), {};
    })();
    var xt = e.___wasm_call_ctors = function() {
      return (xt = e.___wasm_call_ctors = e.asm.B).apply(null, arguments);
    }, Wn = e._malloc = function() {
      return (Wn = e._malloc = e.asm.C).apply(null, arguments);
    }, D = e._free = function() {
      return (D = e._free = e.asm.D).apply(null, arguments);
    }, Ft = e.___getTypeName = function() {
      return (Ft = e.___getTypeName = e.asm.E).apply(null, arguments);
    };
    e.___embind_register_native_and_builtin_types = function() {
      return (e.___embind_register_native_and_builtin_types = e.asm.F).apply(null, arguments);
    }, e.dynCall_ii = function() {
      return (e.dynCall_ii = e.asm.G).apply(null, arguments);
    }, e.dynCall_vi = function() {
      return (e.dynCall_vi = e.asm.H).apply(null, arguments);
    }, e.dynCall_i = function() {
      return (e.dynCall_i = e.asm.I).apply(null, arguments);
    }, e.dynCall_iii = function() {
      return (e.dynCall_iii = e.asm.J).apply(null, arguments);
    }, e.dynCall_viii = function() {
      return (e.dynCall_viii = e.asm.K).apply(null, arguments);
    }, e.dynCall_fii = function() {
      return (e.dynCall_fii = e.asm.L).apply(null, arguments);
    }, e.dynCall_viif = function() {
      return (e.dynCall_viif = e.asm.M).apply(null, arguments);
    }, e.dynCall_viiii = function() {
      return (e.dynCall_viiii = e.asm.N).apply(null, arguments);
    }, e.dynCall_viiiiii = function() {
      return (e.dynCall_viiiiii = e.asm.O).apply(null, arguments);
    }, e.dynCall_iiiiii = function() {
      return (e.dynCall_iiiiii = e.asm.P).apply(null, arguments);
    }, e.dynCall_viiiii = function() {
      return (e.dynCall_viiiii = e.asm.Q).apply(null, arguments);
    }, e.dynCall_iiiiiiii = function() {
      return (e.dynCall_iiiiiiii = e.asm.R).apply(null, arguments);
    }, e.dynCall_viiiiiii = function() {
      return (e.dynCall_viiiiiii = e.asm.S).apply(null, arguments);
    }, e.dynCall_viiiiiiiiidi = function() {
      return (e.dynCall_viiiiiiiiidi = e.asm.T).apply(null, arguments);
    }, e.dynCall_viiiiiiiidi = function() {
      return (e.dynCall_viiiiiiiidi = e.asm.U).apply(null, arguments);
    }, e.dynCall_viiiiiiiiii = function() {
      return (e.dynCall_viiiiiiiiii = e.asm.V).apply(null, arguments);
    }, e.dynCall_viiiiiiiii = function() {
      return (e.dynCall_viiiiiiiii = e.asm.W).apply(null, arguments);
    }, e.dynCall_viiiiiiii = function() {
      return (e.dynCall_viiiiiiii = e.asm.X).apply(null, arguments);
    }, e.dynCall_iiiiiii = function() {
      return (e.dynCall_iiiiiii = e.asm.Y).apply(null, arguments);
    }, e.dynCall_iiiii = function() {
      return (e.dynCall_iiiii = e.asm.Z).apply(null, arguments);
    }, e.dynCall_iiii = function() {
      return (e.dynCall_iiii = e.asm._).apply(null, arguments);
    }, e._asyncify_start_unwind = function() {
      return (e._asyncify_start_unwind = e.asm.$).apply(null, arguments);
    }, e._asyncify_stop_unwind = function() {
      return (e._asyncify_stop_unwind = e.asm.aa).apply(null, arguments);
    }, e._asyncify_start_rewind = function() {
      return (e._asyncify_start_rewind = e.asm.ba).apply(null, arguments);
    }, e._asyncify_stop_rewind = function() {
      return (e._asyncify_stop_rewind = e.asm.ca).apply(null, arguments);
    };
    var Mn;
    cn = function n() {
      Mn || Xn(), Mn || (cn = n);
    };
    function Xn() {
      function n() {
        if (!Mn && (Mn = !0, e.calledRun = !0, !Nn)) {
          if (wn(ft), wn(ne), y(e), e.onRuntimeInitialized && e.onRuntimeInitialized(), e.postRun) for (typeof e.postRun == "function" && (e.postRun = [e.postRun]); e.postRun.length; ) {
            var t = e.postRun.shift();
            dt.unshift(t);
          }
          wn(dt);
        }
      }
      if (!(0 < J)) {
        if (e.preRun) for (typeof e.preRun == "function" && (e.preRun = [e.preRun]); e.preRun.length; ) te();
        wn(ct), 0 < J || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            e.setStatus("");
          }, 1), n();
        }, 1)) : n());
      }
    }
    if (e.run = Xn, e.preInit) for (typeof e.preInit == "function" && (e.preInit = [e.preInit]); 0 < e.preInit.length; ) e.preInit.pop()();
    return Xn(), o.ready;
  };
}();
class je extends _e {
  getSamWasmFilePath(o, e) {
    return `${o}/document/wasm/${e}`;
  }
  fetchSamModule(o) {
    return Le(o);
  }
  parseRawData(o) {
    const { brightness: e, hotspots: y, sharpness: g } = o.params, C = {
      confidence: o.confidence / 1e3,
      topLeft: {
        x: o.x0,
        y: o.y0
      },
      topRight: {
        x: o.x1,
        y: o.y1
      },
      bottomRight: {
        x: o.x2,
        y: o.y2
      },
      bottomLeft: {
        x: o.x3,
        y: o.y3
      },
      brightness: e / 1e3,
      hotspots: y / 1e3,
      sharpness: g / 1e3
    };
    return {
      ...C,
      smallestEdge: Ce(C)
    };
  }
  async detect(o, e) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const y = this.convertToSamColorImage(o, e), g = this.samWasmModule.detectDocumentWithImageParameters(
      e.width,
      e.height,
      y.bgr0ImagePointer,
      0,
      // paramWidth should be 0 (default value)
      0,
      // paramHeight should be 0 (default value)
      0
      // documentDetectionOptions - speed option - set as "standard full method"
    );
    return y.free(), this.parseRawData(g);
  }
}
et(je);
