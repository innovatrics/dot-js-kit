var me = Object.defineProperty;
var It = (i) => {
  throw TypeError(i);
};
var ye = (i, o, e) => o in i ? me(i, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[o] = e;
var Zn = (i, o, e) => ye(i, typeof o != "symbol" ? o + "" : o, e), Ft = (i, o, e) => o.has(i) || It("Cannot " + e);
var N = (i, o, e) => (Ft(i, o, "read from private field"), e ? e.call(i) : o.get(i)), On = (i, o, e) => o.has(i) ? It("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(i) : o.set(i, e), xn = (i, o, e, h) => (Ft(i, o, "write to private field"), h ? h.call(i, e) : o.set(i, e), e);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Bt = Symbol("Comlink.proxy"), pe = Symbol("Comlink.endpoint"), ve = Symbol("Comlink.releaseProxy"), Kn = Symbol("Comlink.finalizer"), In = Symbol("Comlink.thrown"), Nt = (i) => typeof i == "object" && i !== null || typeof i == "function", ge = {
  canHandle: (i) => Nt(i) && i[Bt],
  serialize(i) {
    const { port1: o, port2: e } = new MessageChannel();
    return tt(i, o), [e, [e]];
  },
  deserialize(i) {
    return i.start(), _e(i);
  }
}, we = {
  canHandle: (i) => Nt(i) && In in i,
  serialize({ value: i }) {
    let o;
    return i instanceof Error ? o = {
      isError: !0,
      value: {
        message: i.message,
        name: i.name,
        stack: i.stack
      }
    } : o = { isError: !1, value: i }, [o, []];
  },
  deserialize(i) {
    throw i.isError ? Object.assign(new Error(i.value.message), i.value) : i.value;
  }
}, Lt = /* @__PURE__ */ new Map([
  ["proxy", ge],
  ["throw", we]
]);
function be(i, o) {
  for (const e of i)
    if (o === e || e === "*" || e instanceof RegExp && e.test(o))
      return !0;
  return !1;
}
function tt(i, o = globalThis, e = ["*"]) {
  o.addEventListener("message", function h(g) {
    if (!g || !g.data)
      return;
    if (!be(e, g.origin)) {
      console.warn(`Invalid origin '${g.origin}' for comlink proxy`);
      return;
    }
    const { id: _, type: b, path: S } = Object.assign({ path: [] }, g.data), E = (g.data.argumentList || []).map(Q);
    let C;
    try {
      const T = S.slice(0, -1).reduce((A, M) => A[M], i), W = S.reduce((A, M) => A[M], i);
      switch (b) {
        case "GET":
          C = W;
          break;
        case "SET":
          T[S.slice(-1)[0]] = Q(g.data.value), C = !0;
          break;
        case "APPLY":
          C = W.apply(T, E);
          break;
        case "CONSTRUCT":
          {
            const A = new W(...E);
            C = Se(A);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: A, port2: M } = new MessageChannel();
            tt(i, M), C = Pe(A, [A]);
          }
          break;
        case "RELEASE":
          C = void 0;
          break;
        default:
          return;
      }
    } catch (T) {
      C = { value: T, [In]: 0 };
    }
    Promise.resolve(C).catch((T) => ({ value: T, [In]: 0 })).then((T) => {
      const [W, A] = Un(T);
      o.postMessage(Object.assign(Object.assign({}, W), { id: _ }), A), b === "RELEASE" && (o.removeEventListener("message", h), zt(o), Kn in i && typeof i[Kn] == "function" && i[Kn]());
    }).catch((T) => {
      const [W, A] = Un({
        value: new TypeError("Unserializable return value"),
        [In]: 0
      });
      o.postMessage(Object.assign(Object.assign({}, W), { id: _ }), A);
    });
  }), o.start && o.start();
}
function Ce(i) {
  return i.constructor.name === "MessagePort";
}
function zt(i) {
  Ce(i) && i.close();
}
function _e(i, o) {
  return nt(i, [], o);
}
function Rn(i) {
  if (i)
    throw new Error("Proxy has been released and is not useable");
}
function Dt(i) {
  return on(i, {
    type: "RELEASE"
  }).then(() => {
    zt(i);
  });
}
const Fn = /* @__PURE__ */ new WeakMap(), jn = "FinalizationRegistry" in globalThis && new FinalizationRegistry((i) => {
  const o = (Fn.get(i) || 0) - 1;
  Fn.set(i, o), o === 0 && Dt(i);
});
function Ae(i, o) {
  const e = (Fn.get(o) || 0) + 1;
  Fn.set(o, e), jn && jn.register(i, o, i);
}
function Ee(i) {
  jn && jn.unregister(i);
}
function nt(i, o = [], e = function() {
}) {
  let h = !1;
  const g = new Proxy(e, {
    get(_, b) {
      if (Rn(h), b === ve)
        return () => {
          Ee(g), Dt(i), h = !0;
        };
      if (b === "then") {
        if (o.length === 0)
          return { then: () => g };
        const S = on(i, {
          type: "GET",
          path: o.map((E) => E.toString())
        }).then(Q);
        return S.then.bind(S);
      }
      return nt(i, [...o, b]);
    },
    set(_, b, S) {
      Rn(h);
      const [E, C] = Un(S);
      return on(i, {
        type: "SET",
        path: [...o, b].map((T) => T.toString()),
        value: E
      }, C).then(Q);
    },
    apply(_, b, S) {
      Rn(h);
      const E = o[o.length - 1];
      if (E === pe)
        return on(i, {
          type: "ENDPOINT"
        }).then(Q);
      if (E === "bind")
        return nt(i, o.slice(0, -1));
      const [C, T] = jt(S);
      return on(i, {
        type: "APPLY",
        path: o.map((W) => W.toString()),
        argumentList: C
      }, T).then(Q);
    },
    construct(_, b) {
      Rn(h);
      const [S, E] = jt(b);
      return on(i, {
        type: "CONSTRUCT",
        path: o.map((C) => C.toString()),
        argumentList: S
      }, E).then(Q);
    }
  });
  return Ae(g, i), g;
}
function Te(i) {
  return Array.prototype.concat.apply([], i);
}
function jt(i) {
  const o = i.map(Un);
  return [o.map((e) => e[0]), Te(o.map((e) => e[1]))];
}
const Ht = /* @__PURE__ */ new WeakMap();
function Pe(i, o) {
  return Ht.set(i, o), i;
}
function Se(i) {
  return Object.assign(i, { [Bt]: !0 });
}
function Un(i) {
  for (const [o, e] of Lt)
    if (e.canHandle(i)) {
      const [h, g] = e.serialize(i);
      return [
        {
          type: "HANDLER",
          name: o,
          value: h
        },
        g
      ];
    }
  return [
    {
      type: "RAW",
      value: i
    },
    Ht.get(i) || []
  ];
}
function Q(i) {
  switch (i.type) {
    case "HANDLER":
      return Lt.get(i.name).deserialize(i.value);
    case "RAW":
      return i.value;
  }
}
function on(i, o, e) {
  return new Promise((h) => {
    const g = We();
    i.addEventListener("message", function _(b) {
      !b.data || !b.data.id || b.data.id !== g || (i.removeEventListener("message", _), h(b.data));
    }), i.start && i.start(), i.postMessage(Object.assign({ id: g }, o), e);
  });
}
function We() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const gn = 1e3, Ut = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Me = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class F extends Error {
  constructor(e, h) {
    super(e);
    Zn(this, "cause");
    this.name = "AutoCaptureError", this.cause = h;
  }
  // Change this to Decorator when they will be in stable release
  static logError(e) {
  }
  static fromCameraError(e) {
    if (this.logError(e), e instanceof F)
      return e;
    let h;
    switch (e.name) {
      case "OverconstrainedError":
        h = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        h = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        h = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        h = "There is no camera available to you";
        break;
      default:
        h = "An unknown camera error has occurred";
        break;
    }
    return new F(h, e);
  }
  static fromError(e) {
    if (this.logError(e), e instanceof F)
      return e;
    const h = "An unexpected error has occurred";
    return new F(h);
  }
}
const ke = {
  RGB: "RGB",
  RGBA: "RGBA"
};
var Y, Z, sn;
class Oe {
  constructor(o, e) {
    On(this, Y);
    On(this, Z);
    On(this, sn);
    xn(this, Y, o), xn(this, Z, this.allocate(e.length * e.BYTES_PER_ELEMENT)), xn(this, sn, this.allocate(e.length * e.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return N(this, Z);
  }
  get bgr0ImagePointer() {
    return N(this, sn);
  }
  allocate(o) {
    return N(this, Y)._malloc(o);
  }
  free() {
    N(this, Y)._free(N(this, Z)), N(this, Y)._free(N(this, sn));
  }
  writeDataToMemory(o) {
    N(this, Y).HEAPU8.set(o, N(this, Z));
  }
}
Y = new WeakMap(), Z = new WeakMap(), sn = new WeakMap();
class xe {
  constructor() {
    Zn(this, "samWasmModule");
  }
  getOverriddenModules(o, e) {
    return {
      locateFile: (h) => new URL(e || h, o).href
    };
  }
  async handleMissingOrInvalidSamModule(o, e) {
    try {
      const h = await fetch(o);
      if (!h.ok)
        throw new F(
          `The path to ${e} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${o}`
        );
      const g = await h.arrayBuffer();
      if (!WebAssembly.validate(g))
        throw new F(
          `The provided ${e} is not a valid WASM module. Please check provided path to wasm files. Current path is ${o}`
        );
    } catch (h) {
      if (h instanceof F)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), h;
    }
  }
  async getSamWasmFileName() {
    return await Me() ? Ut.simd : Ut.sam;
  }
  async initSamModule(o, e) {
    if (this.samWasmModule)
      return;
    const h = await this.getSamWasmFileName(), g = this.getSamWasmFilePath(e, h);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(o, g));
    } catch {
      throw await this.handleMissingOrInvalidSamModule(g, h), new F("Could not init detector.");
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
    const e = new Oe(this.samWasmModule, o);
    return e.writeDataToMemory(o), e;
  }
  convertToSamColorImage(o, e) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const h = this.writeImageToMemory(o);
    return this.samWasmModule.convertToSamColorImage(
      e.width,
      e.height,
      h.rgbaImagePointer,
      ke.RGBA,
      h.bgr0ImagePointer
    ), h;
  }
}
const Re = (i) => Number.parseFloat(i.toFixed(3)), Ie = (i, o) => Math.min(i, o);
var Fe = function() {
  var i = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
  return function(o) {
    o = o || {};
    var e;
    e || (e = typeof o < "u" ? o : {});
    var h, g;
    e.ready = new Promise(function(n, t) {
      h = n, g = t;
    });
    var _ = {}, b;
    for (b in e) e.hasOwnProperty(b) && (_[b] = e[b]);
    var S = !1, E = !1;
    S = typeof window == "object", E = typeof importScripts == "function";
    var C = "", T;
    (S || E) && (E ? C = self.location.href : document.currentScript && (C = document.currentScript.src), i && (C = i), C.indexOf("blob:") !== 0 ? C = C.substr(0, C.lastIndexOf("/") + 1) : C = "", E && (T = function(n) {
      var t = new XMLHttpRequest();
      return t.open("GET", n, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
    }));
    var W = e.printErr || console.warn.bind(console);
    for (b in _) _.hasOwnProperty(b) && (e[b] = _[b]);
    _ = null;
    var A;
    e.wasmBinary && (A = e.wasmBinary), e.noExitRuntime && e.noExitRuntime, typeof WebAssembly != "object" && fn("no native wasm support detected");
    var M, un = !1;
    function et(n) {
      n || fn("Assertion failed: undefined");
    }
    var rt = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
    function Gt(n, t, r) {
      var a = R;
      if (0 < r) {
        r = t + r - 1;
        for (var s = 0; s < n.length; ++s) {
          var u = n.charCodeAt(s);
          if (55296 <= u && 57343 >= u) {
            var l = n.charCodeAt(++s);
            u = 65536 + ((u & 1023) << 10) | l & 1023;
          }
          if (127 >= u) {
            if (t >= r) break;
            a[t++] = u;
          } else {
            if (2047 >= u) {
              if (t + 1 >= r) break;
              a[t++] = 192 | u >> 6;
            } else {
              if (65535 >= u) {
                if (t + 2 >= r) break;
                a[t++] = 224 | u >> 12;
              } else {
                if (t + 3 >= r) break;
                a[t++] = 240 | u >> 18, a[t++] = 128 | u >> 12 & 63;
              }
              a[t++] = 128 | u >> 6 & 63;
            }
            a[t++] = 128 | u & 63;
          }
        }
        a[t] = 0;
      }
    }
    var at = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0;
    function Yt(n, t) {
      for (var r = n >> 1, a = r + t / 2; !(r >= a) && wn[r]; ) ++r;
      if (r <<= 1, 32 < r - n && at) return at.decode(R.subarray(n, r));
      for (r = 0, a = ""; ; ) {
        var s = q[n + 2 * r >> 1];
        if (s == 0 || r == t / 2) return a;
        ++r, a += String.fromCharCode(s);
      }
    }
    function $t(n, t, r) {
      if (r === void 0 && (r = 2147483647), 2 > r) return 0;
      r -= 2;
      var a = t;
      r = r < 2 * n.length ? r / 2 : n.length;
      for (var s = 0; s < r; ++s) q[t >> 1] = n.charCodeAt(s), t += 2;
      return q[t >> 1] = 0, t - a;
    }
    function Xt(n) {
      return 2 * n.length;
    }
    function Jt(n, t) {
      for (var r = 0, a = ""; !(r >= t / 4); ) {
        var s = j[n + 4 * r >> 2];
        if (s == 0) break;
        ++r, 65536 <= s ? (s -= 65536, a += String.fromCharCode(55296 | s >> 10, 56320 | s & 1023)) : a += String.fromCharCode(s);
      }
      return a;
    }
    function Qt(n, t, r) {
      if (r === void 0 && (r = 2147483647), 4 > r) return 0;
      var a = t;
      r = a + r - 4;
      for (var s = 0; s < n.length; ++s) {
        var u = n.charCodeAt(s);
        if (55296 <= u && 57343 >= u) {
          var l = n.charCodeAt(++s);
          u = 65536 + ((u & 1023) << 10) | l & 1023;
        }
        if (j[t >> 2] = u, t += 4, t + 4 > r) break;
      }
      return j[t >> 2] = 0, t - a;
    }
    function Zt(n) {
      for (var t = 0, r = 0; r < n.length; ++r) {
        var a = n.charCodeAt(r);
        55296 <= a && 57343 >= a && ++r, t += 4;
      }
      return t;
    }
    var K, cn, R, q, wn, j, L, it, ot;
    function st(n) {
      K = n, e.HEAP8 = cn = new Int8Array(n), e.HEAP16 = q = new Int16Array(n), e.HEAP32 = j = new Int32Array(n), e.HEAPU8 = R = new Uint8Array(n), e.HEAPU16 = wn = new Uint16Array(n), e.HEAPU32 = L = new Uint32Array(n), e.HEAPF32 = it = new Float32Array(n), e.HEAPF64 = ot = new Float64Array(n);
    }
    var ut = e.INITIAL_MEMORY || 16777216;
    e.wasmMemory ? M = e.wasmMemory : M = new WebAssembly.Memory({ initial: ut / 65536, maximum: 32768 }), M && (K = M.buffer), ut = K.byteLength, st(K);
    var ct = [], lt = [], Kt = [], ft = [];
    function qt() {
      var n = e.preRun.shift();
      ct.unshift(n);
    }
    var $ = 0, ln = null;
    e.preloadedImages = {}, e.preloadedAudios = {};
    function fn(n) {
      throw e.onAbort && e.onAbort(n), W(n), un = !0, n = new WebAssembly.RuntimeError("abort(" + n + "). Build with -s ASSERTIONS=1 for more info."), g(n), n;
    }
    function Bn(n) {
      var t = X;
      return String.prototype.startsWith ? t.startsWith(n) : t.indexOf(n) === 0;
    }
    function dt() {
      return Bn("data:application/octet-stream;base64,");
    }
    var X = "dot-sam.wasm";
    if (!dt()) {
      var ht = X;
      X = e.locateFile ? e.locateFile(ht, C) : C + ht;
    }
    function mt() {
      try {
        if (A) return new Uint8Array(A);
        if (T) return T(X);
        throw "both async and sync fetching of the wasm failed";
      } catch (n) {
        fn(n);
      }
    }
    function ne() {
      return A || !S && !E || typeof fetch != "function" || Bn("file://") ? Promise.resolve().then(mt) : fetch(X, { credentials: "same-origin" }).then(function(n) {
        if (!n.ok) throw "failed to load wasm binary file at '" + X + "'";
        return n.arrayBuffer();
      }).catch(function() {
        return mt();
      });
    }
    function bn(n) {
      for (; 0 < n.length; ) {
        var t = n.shift();
        if (typeof t == "function") t(e);
        else {
          var r = t.Aa;
          typeof r == "number" ? t.sa === void 0 ? Nn("v", r)() : Nn("vi", r)(t.sa) : r(t.sa === void 0 ? null : t.sa);
        }
      }
    }
    function Nn(n, t) {
      var r = [];
      return function() {
        r.length = arguments.length;
        for (var a = 0; a < arguments.length; a++) r[a] = arguments[a];
        return r && r.length ? e["dynCall_" + n].apply(null, [t].concat(r)) : e["dynCall_" + n].call(null, t);
      };
    }
    function te(n) {
      this.ca = n - 16, this.Na = function(t) {
        j[this.ca + 8 >> 2] = t;
      }, this.Ka = function(t) {
        j[this.ca + 0 >> 2] = t;
      }, this.La = function() {
        j[this.ca + 4 >> 2] = 0;
      }, this.Ja = function() {
        cn[this.ca + 12 >> 0] = 0;
      }, this.Ma = function() {
        cn[this.ca + 13 >> 0] = 0;
      }, this.Ea = function(t, r) {
        this.Na(t), this.Ka(r), this.La(), this.Ja(), this.Ma();
      };
    }
    function Cn() {
      return 0 < Cn.wa;
    }
    function Ln(n) {
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
      for (var t = ""; R[n]; ) t += yt[R[n++]];
      return t;
    }
    var nn = {}, J = {}, _n = {};
    function zn(n) {
      if (n === void 0) return "_unknown";
      n = n.replace(/[^a-zA-Z0-9_]/g, "$");
      var t = n.charCodeAt(0);
      return 48 <= t && 57 >= t ? "_" + n : n;
    }
    function Dn(n, t) {
      return n = zn(n), new Function("body", "return function " + n + `() {
    "use strict";    return body.apply(this, arguments);
};
`)(t);
    }
    function Hn(n) {
      var t = Error, r = Dn(n, function(a) {
        this.name = n, this.message = a, a = Error(a).stack, a !== void 0 && (this.stack = this.toString() + `
` + a.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return r.prototype = Object.create(t.prototype), r.prototype.constructor = r, r.prototype.toString = function() {
        return this.message === void 0 ? this.name : this.name + ": " + this.message;
      }, r;
    }
    var tn = void 0;
    function v(n) {
      throw new tn(n);
    }
    var pt = void 0;
    function An(n) {
      throw new pt(n);
    }
    function en(n, t, r) {
      function a(c) {
        c = r(c), c.length !== n.length && An("Mismatched type converter count");
        for (var y = 0; y < n.length; ++y) z(n[y], c[y]);
      }
      n.forEach(function(c) {
        _n[c] = t;
      });
      var s = Array(t.length), u = [], l = 0;
      t.forEach(function(c, y) {
        J.hasOwnProperty(c) ? s[y] = J[c] : (u.push(c), nn.hasOwnProperty(c) || (nn[c] = []), nn[c].push(function() {
          s[y] = J[c], ++l, l === u.length && a(s);
        }));
      }), u.length === 0 && a(s);
    }
    function z(n, t, r) {
      if (r = r || {}, !("argPackAdvance" in t)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var a = t.name;
      if (n || v('type "' + a + '" must have a positive integer typeid pointer'), J.hasOwnProperty(n)) {
        if (r.Da) return;
        v("Cannot register type '" + a + "' twice");
      }
      J[n] = t, delete _n[n], nn.hasOwnProperty(n) && (t = nn[n], delete nn[n], t.forEach(function(s) {
        s();
      }));
    }
    function ee(n) {
      return { count: n.count, na: n.na, oa: n.oa, ca: n.ca, ea: n.ea, fa: n.fa, ga: n.ga };
    }
    function Vn(n) {
      v(n.ba.ea.da.name + " instance already deleted");
    }
    var Gn = !1;
    function vt() {
    }
    function gt(n) {
      --n.count.value, n.count.value === 0 && (n.fa ? n.ga.ma(n.fa) : n.ea.da.ma(n.ca));
    }
    function dn(n) {
      return typeof FinalizationGroup > "u" ? (dn = function(t) {
        return t;
      }, n) : (Gn = new FinalizationGroup(function(t) {
        for (var r = t.next(); !r.done; r = t.next()) r = r.value, r.ca ? gt(r) : console.warn("object already deleted: " + r.ca);
      }), dn = function(t) {
        return Gn.register(t, t.ba, t.ba), t;
      }, vt = function(t) {
        Gn.unregister(t.ba);
      }, dn(n));
    }
    var hn = void 0, mn = [];
    function Yn() {
      for (; mn.length; ) {
        var n = mn.pop();
        n.ba.na = !1, n.delete();
      }
    }
    function V() {
    }
    var wt = {};
    function re(n, t) {
      var r = e;
      if (r[n].ia === void 0) {
        var a = r[n];
        r[n] = function() {
          return r[n].ia.hasOwnProperty(arguments.length) || v("Function '" + t + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + r[n].ia + ")!"), r[n].ia[arguments.length].apply(this, arguments);
        }, r[n].ia = [], r[n].ia[a.xa] = a;
      }
    }
    function bt(n, t, r) {
      e.hasOwnProperty(n) ? ((r === void 0 || e[n].ia !== void 0 && e[n].ia[r] !== void 0) && v("Cannot register public name '" + n + "' twice"), re(n, n), e.hasOwnProperty(r) && v("Cannot register multiple overloads of a function with the same number of arguments (" + r + ")!"), e[n].ia[r] = t) : (e[n] = t, r !== void 0 && (e[n].Qa = r));
    }
    function ae(n, t, r, a, s, u, l, c) {
      this.name = n, this.constructor = t, this.la = r, this.ma = a, this.ha = s, this.Ba = u, this.pa = l, this.za = c;
    }
    function En(n, t, r) {
      for (; t !== r; ) t.pa || v("Expected null or instance of " + r.name + ", got an instance of " + t.name), n = t.pa(n), t = t.ha;
      return n;
    }
    function ie(n, t) {
      return t === null ? (this.ta && v("null is not a valid " + this.name), 0) : (t.ba || v('Cannot pass "' + an(t) + '" as a ' + this.name), t.ba.ca || v("Cannot pass deleted object as a pointer of type " + this.name), En(t.ba.ca, t.ba.ea.da, this.da));
    }
    function oe(n, t) {
      if (t === null) {
        if (this.ta && v("null is not a valid " + this.name), this.ra) {
          var r = this.Ga();
          return n !== null && n.push(this.ma, r), r;
        }
        return 0;
      }
      if (t.ba || v('Cannot pass "' + an(t) + '" as a ' + this.name), t.ba.ca || v("Cannot pass deleted object as a pointer of type " + this.name), !this.qa && t.ba.ea.qa && v("Cannot convert argument of type " + (t.ba.ga ? t.ba.ga.name : t.ba.ea.name) + " to parameter type " + this.name), r = En(t.ba.ca, t.ba.ea.da, this.da), this.ra) switch (t.ba.fa === void 0 && v("Passing raw pointer to smart pointer is illegal"), this.Oa) {
        case 0:
          t.ba.ga === this ? r = t.ba.fa : v("Cannot convert argument of type " + (t.ba.ga ? t.ba.ga.name : t.ba.ea.name) + " to parameter type " + this.name);
          break;
        case 1:
          r = t.ba.fa;
          break;
        case 2:
          if (t.ba.ga === this) r = t.ba.fa;
          else {
            var a = t.clone();
            r = this.Ha(r, rn(function() {
              a.delete();
            })), n !== null && n.push(this.ma, r);
          }
          break;
        default:
          v("Unsupporting sharing policy");
      }
      return r;
    }
    function se(n, t) {
      return t === null ? (this.ta && v("null is not a valid " + this.name), 0) : (t.ba || v('Cannot pass "' + an(t) + '" as a ' + this.name), t.ba.ca || v("Cannot pass deleted object as a pointer of type " + this.name), t.ba.ea.qa && v("Cannot convert argument of type " + t.ba.ea.name + " to parameter type " + this.name), En(t.ba.ca, t.ba.ea.da, this.da));
    }
    function Tn(n) {
      return this.fromWireType(L[n >> 2]);
    }
    function Ct(n, t, r) {
      return t === r ? n : r.ha === void 0 ? null : (n = Ct(n, t, r.ha), n === null ? null : r.za(n));
    }
    var yn = {};
    function ue(n, t) {
      for (t === void 0 && v("ptr should not be undefined"); n.ha; ) t = n.pa(t), n = n.ha;
      return yn[t];
    }
    function Pn(n, t) {
      return t.ea && t.ca || An("makeClassHandle requires ptr and ptrType"), !!t.ga != !!t.fa && An("Both smartPtrType and smartPtr must be specified"), t.count = { value: 1 }, dn(Object.create(n, { ba: { value: t } }));
    }
    function D(n, t, r, a) {
      this.name = n, this.da = t, this.ta = r, this.qa = a, this.ra = !1, this.ma = this.Ha = this.Ga = this.va = this.Oa = this.Fa = void 0, t.ha !== void 0 ? this.toWireType = oe : (this.toWireType = a ? ie : se, this.ja = null);
    }
    function _t(n, t, r) {
      e.hasOwnProperty(n) || An("Replacing nonexistant public symbol"), e[n].ia !== void 0 && r !== void 0 ? e[n].ia[r] = t : (e[n] = t, e[n].xa = r);
    }
    function G(n, t) {
      n = O(n);
      var r = Nn(n, t);
      return typeof r != "function" && v("unknown function pointer with signature " + n + ": " + t), r;
    }
    var At = void 0;
    function Et(n) {
      n = xt(n);
      var t = O(n);
      return H(n), t;
    }
    function pn(n, t) {
      function r(u) {
        s[u] || J[u] || (_n[u] ? _n[u].forEach(r) : (a.push(u), s[u] = !0));
      }
      var a = [], s = {};
      throw t.forEach(r), new At(n + ": " + a.map(Et).join([", "]));
    }
    function Tt(n, t) {
      for (var r = [], a = 0; a < n; a++) r.push(j[(t >> 2) + a]);
      return r;
    }
    function Sn(n) {
      for (; n.length; ) {
        var t = n.pop();
        n.pop()(t);
      }
    }
    function Pt(n, t, r) {
      return n instanceof Object || v(r + ' with invalid "this": ' + n), n instanceof t.da.constructor || v(r + ' incompatible with "this" of type ' + n.constructor.name), n.ba.ca || v("cannot call emscripten binding method " + r + " on deleted object"), En(n.ba.ca, n.ba.ea.da, t.da);
    }
    var $n = [], I = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }];
    function Xn(n) {
      4 < n && --I[n].Ia === 0 && (I[n] = void 0, $n.push(n));
    }
    function rn(n) {
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
          var t = $n.length ? $n.pop() : I.length;
          return I[t] = { Ia: 1, value: n }, t;
      }
    }
    function an(n) {
      if (n === null) return "null";
      var t = typeof n;
      return t === "object" || t === "array" || t === "function" ? n.toString() : "" + n;
    }
    function ce(n, t) {
      switch (t) {
        case 2:
          return function(r) {
            return this.fromWireType(it[r >> 2]);
          };
        case 3:
          return function(r) {
            return this.fromWireType(ot[r >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + n);
      }
    }
    function le(n) {
      var t = Function;
      if (!(t instanceof Function)) throw new TypeError("new_ called with constructor type " + typeof t + " which is not a function");
      var r = Dn(t.name || "unknownFunctionName", function() {
      });
      return r.prototype = t.prototype, r = new r(), n = t.apply(r, n), n instanceof Object ? n : r;
    }
    function fe(n, t, r) {
      switch (t) {
        case 0:
          return r ? function(a) {
            return cn[a];
          } : function(a) {
            return R[a];
          };
        case 1:
          return r ? function(a) {
            return q[a >> 1];
          } : function(a) {
            return wn[a >> 1];
          };
        case 2:
          return r ? function(a) {
            return j[a >> 2];
          } : function(a) {
            return L[a >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + n);
      }
    }
    function Jn(n) {
      return n || v("Cannot use deleted val. handle = " + n), I[n].value;
    }
    function St(n, t) {
      var r = J[n];
      return r === void 0 && v(t + " has unknown type " + Et(n)), r;
    }
    var de = {}, Wt = [];
    function Mt(n) {
      var t = {}, r;
      for (r in n) (function(a) {
        var s = n[a];
        t[a] = typeof s == "function" ? function() {
          Wt.push(a);
          try {
            return s.apply(null, arguments);
          } finally {
            if (un) return;
            var u = Wt.pop();
            et(u === a);
          }
        } : s;
      })(r);
      return t;
    }
    for (var kt = Array(256), Wn = 0; 256 > Wn; ++Wn) kt[Wn] = String.fromCharCode(Wn);
    yt = kt, tn = e.BindingError = Hn("BindingError"), pt = e.InternalError = Hn("InternalError"), V.prototype.isAliasOf = function(n) {
      if (!(this instanceof V && n instanceof V)) return !1;
      var t = this.ba.ea.da, r = this.ba.ca, a = n.ba.ea.da;
      for (n = n.ba.ca; t.ha; ) r = t.pa(r), t = t.ha;
      for (; a.ha; ) n = a.pa(n), a = a.ha;
      return t === a && r === n;
    }, V.prototype.clone = function() {
      if (this.ba.ca || Vn(this), this.ba.oa) return this.ba.count.value += 1, this;
      var n = dn(Object.create(Object.getPrototypeOf(this), { ba: { value: ee(this.ba) } }));
      return n.ba.count.value += 1, n.ba.na = !1, n;
    }, V.prototype.delete = function() {
      this.ba.ca || Vn(this), this.ba.na && !this.ba.oa && v("Object already scheduled for deletion"), vt(this), gt(this.ba), this.ba.oa || (this.ba.fa = void 0, this.ba.ca = void 0);
    }, V.prototype.isDeleted = function() {
      return !this.ba.ca;
    }, V.prototype.deleteLater = function() {
      return this.ba.ca || Vn(this), this.ba.na && !this.ba.oa && v("Object already scheduled for deletion"), mn.push(this), mn.length === 1 && hn && hn(Yn), this.ba.na = !0, this;
    }, D.prototype.Ca = function(n) {
      return this.va && (n = this.va(n)), n;
    }, D.prototype.ua = function(n) {
      this.ma && this.ma(n);
    }, D.prototype.argPackAdvance = 8, D.prototype.readValueFromPointer = Tn, D.prototype.deleteObject = function(n) {
      n !== null && n.delete();
    }, D.prototype.fromWireType = function(n) {
      function t() {
        return this.ra ? Pn(this.da.la, { ea: this.Fa, ca: r, ga: this, fa: n }) : Pn(this.da.la, { ea: this, ca: n });
      }
      var r = this.Ca(n);
      if (!r) return this.ua(n), null;
      var a = ue(this.da, r);
      if (a !== void 0)
        return a.ba.count.value === 0 ? (a.ba.ca = r, a.ba.fa = n, a.clone()) : (a = a.clone(), this.ua(n), a);
      if (a = this.da.Ba(r), a = wt[a], !a) return t.call(this);
      a = this.qa ? a.ya : a.pointerType;
      var s = Ct(r, this.da, a.da);
      return s === null ? t.call(this) : this.ra ? Pn(a.da.la, { ea: a, ca: s, ga: this, fa: n }) : Pn(
        a.da.la,
        { ea: a, ca: s }
      );
    }, e.getInheritedInstanceCount = function() {
      return Object.keys(yn).length;
    }, e.getLiveInheritedInstances = function() {
      var n = [], t;
      for (t in yn) yn.hasOwnProperty(t) && n.push(yn[t]);
      return n;
    }, e.flushPendingDeletes = Yn, e.setDelayFunction = function(n) {
      hn = n, mn.length && hn && hn(Yn);
    }, At = e.UnboundTypeError = Hn("UnboundTypeError"), e.count_emval_handles = function() {
      for (var n = 0, t = 5; t < I.length; ++t) I[t] !== void 0 && ++n;
      return n;
    }, e.get_first_emval = function() {
      for (var n = 5; n < I.length; ++n) if (I[n] !== void 0) return I[n];
      return null;
    }, lt.push({ Aa: function() {
      Ot();
    } });
    var he = {
      x: function(n) {
        return Mn(n + 16) + 16;
      },
      s: function(n, t, r) {
        throw new te(n).Ea(t, r), "uncaught_exception" in Cn ? Cn.wa++ : Cn.wa = 1, n;
      },
      u: function(n, t, r, a, s) {
        var u = Ln(r);
        t = O(t), z(n, { name: t, fromWireType: function(l) {
          return !!l;
        }, toWireType: function(l, c) {
          return c ? a : s;
        }, argPackAdvance: 8, readValueFromPointer: function(l) {
          if (r === 1) var c = cn;
          else if (r === 2) c = q;
          else if (r === 4) c = j;
          else throw new TypeError("Unknown boolean type size: " + t);
          return this.fromWireType(c[l >> u]);
        }, ja: null });
      },
      h: function(n, t, r, a, s, u, l, c, y, f, d, m, w) {
        d = O(d), u = G(s, u), c && (c = G(l, c)), f && (f = G(y, f)), w = G(m, w);
        var P = zn(d);
        bt(P, function() {
          pn("Cannot construct " + d + " due to unbound types", [a]);
        }), en([n, t, r], a ? [a] : [], function(p) {
          if (p = p[0], a)
            var B = p.da, k = B.la;
          else k = V.prototype;
          p = Dn(P, function() {
            if (Object.getPrototypeOf(this) !== x) throw new tn("Use 'new' to construct " + d);
            if (U.ka === void 0) throw new tn(d + " has no accessible constructor");
            var Rt = U.ka[arguments.length];
            if (Rt === void 0) throw new tn("Tried to invoke ctor of " + d + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(U.ka).toString() + ") parameters instead!");
            return Rt.apply(this, arguments);
          });
          var x = Object.create(k, { constructor: { value: p } });
          p.prototype = x;
          var U = new ae(d, p, x, w, B, u, c, f);
          B = new D(d, U, !0, !1), k = new D(d + "*", U, !1, !1);
          var vn = new D(d + " const*", U, !1, !0);
          return wt[n] = { pointerType: k, ya: vn }, _t(P, p), [B, k, vn];
        });
      },
      g: function(n, t, r, a, s, u) {
        et(0 < t);
        var l = Tt(t, r);
        s = G(a, s);
        var c = [u], y = [];
        en([], [n], function(f) {
          f = f[0];
          var d = "constructor " + f.name;
          if (f.da.ka === void 0 && (f.da.ka = []), f.da.ka[t - 1] !== void 0) throw new tn("Cannot register multiple constructors with identical number of parameters (" + (t - 1) + ") for class '" + f.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          return f.da.ka[t - 1] = function() {
            pn("Cannot construct " + f.name + " due to unbound types", l);
          }, en([], l, function(m) {
            return f.da.ka[t - 1] = function() {
              arguments.length !== t - 1 && v(d + " called with " + arguments.length + " arguments, expected " + (t - 1)), y.length = 0, c.length = t;
              for (var w = 1; w < t; ++w) c[w] = m[w].toWireType(
                y,
                arguments[w - 1]
              );
              return w = s.apply(null, c), Sn(y), m[0].fromWireType(w);
            }, [];
          }), [];
        });
      },
      b: function(n, t, r, a, s, u, l, c, y, f) {
        t = O(t), s = G(a, s), en([], [n], function(d) {
          d = d[0];
          var m = d.name + "." + t, w = { get: function() {
            pn("Cannot access " + m + " due to unbound types", [r, l]);
          }, enumerable: !0, configurable: !0 };
          return y ? w.set = function() {
            pn("Cannot access " + m + " due to unbound types", [r, l]);
          } : w.set = function() {
            v(m + " is a read-only property");
          }, Object.defineProperty(d.da.la, t, w), en([], y ? [r, l] : [r], function(P) {
            var p = P[0], B = { get: function() {
              var x = Pt(this, d, m + " getter");
              return p.fromWireType(s(u, x));
            }, enumerable: !0 };
            if (y) {
              y = G(c, y);
              var k = P[1];
              B.set = function(x) {
                var U = Pt(this, d, m + " setter"), vn = [];
                y(f, U, k.toWireType(vn, x)), Sn(vn);
              };
            }
            return Object.defineProperty(d.da.la, t, B), [];
          }), [];
        });
      },
      t: function(n, t) {
        t = O(t), z(n, { name: t, fromWireType: function(r) {
          var a = I[r].value;
          return Xn(r), a;
        }, toWireType: function(r, a) {
          return rn(a);
        }, argPackAdvance: 8, readValueFromPointer: Tn, ja: null });
      },
      m: function(n, t, r) {
        r = Ln(r), t = O(t), z(n, {
          name: t,
          fromWireType: function(a) {
            return a;
          },
          toWireType: function(a, s) {
            if (typeof s != "number" && typeof s != "boolean") throw new TypeError('Cannot convert "' + an(s) + '" to ' + this.name);
            return s;
          },
          argPackAdvance: 8,
          readValueFromPointer: ce(t, r),
          ja: null
        });
      },
      c: function(n, t, r, a, s, u) {
        var l = Tt(t, r);
        n = O(n), s = G(a, s), bt(n, function() {
          pn("Cannot call " + n + " due to unbound types", l);
        }, t - 1), en([], l, function(c) {
          var y = n, f = n;
          c = [c[0], null].concat(c.slice(1));
          var d = s, m = c.length;
          2 > m && v("argTypes array size mismatch! Must at least get return value and 'this' types!");
          for (var w = c[1] !== null && !1, P = !1, p = 1; p < c.length; ++p) if (c[p] !== null && c[p].ja === void 0) {
            P = !0;
            break;
          }
          var B = c[0].name !== "void", k = "", x = "";
          for (p = 0; p < m - 2; ++p) k += (p !== 0 ? ", " : "") + "arg" + p, x += (p !== 0 ? ", " : "") + "arg" + p + "Wired";
          f = "return function " + zn(f) + "(" + k + `) {
if (arguments.length !== ` + (m - 2) + `) {
throwBindingError('function ` + f + " called with ' + arguments.length + ' arguments, expected " + (m - 2) + ` args!');
}
`, P && (f += `var destructors = [];
`);
          var U = P ? "destructors" : "null";
          for (k = "throwBindingError invoker fn runDestructors retType classParam".split(" "), d = [v, d, u, Sn, c[0], c[1]], w && (f += "var thisWired = classParam.toWireType(" + U + `, this);
`), p = 0; p < m - 2; ++p) f += "var arg" + p + "Wired = argType" + p + ".toWireType(" + U + ", arg" + p + "); // " + c[p + 2].name + `
`, k.push("argType" + p), d.push(c[p + 2]);
          if (w && (x = "thisWired" + (0 < x.length ? ", " : "") + x), f += (B ? "var rv = " : "") + "invoker(fn" + (0 < x.length ? ", " : "") + x + `);
`, P) f += `runDestructors(destructors);
`;
          else for (p = w ? 1 : 2; p < c.length; ++p) m = p === 1 ? "thisWired" : "arg" + (p - 2) + "Wired", c[p].ja !== null && (f += m + "_dtor(" + m + "); // " + c[p].name + `
`, k.push(m + "_dtor"), d.push(c[p].ja));
          return B && (f += `var ret = retType.fromWireType(rv);
return ret;
`), k.push(f + `}
`), c = le(k).apply(null, d), _t(y, c, t - 1), [];
        });
      },
      e: function(n, t, r, a, s) {
        function u(f) {
          return f;
        }
        t = O(t), s === -1 && (s = 4294967295);
        var l = Ln(r);
        if (a === 0) {
          var c = 32 - 8 * r;
          u = function(f) {
            return f << c >>> c;
          };
        }
        var y = t.indexOf("unsigned") != -1;
        z(n, { name: t, fromWireType: u, toWireType: function(f, d) {
          if (typeof d != "number" && typeof d != "boolean") throw new TypeError('Cannot convert "' + an(d) + '" to ' + this.name);
          if (d < a || d > s) throw new TypeError('Passing a number "' + an(d) + '" from JS side to C/C++ side to an argument of type "' + t + '", which is outside the valid range [' + a + ", " + s + "]!");
          return y ? d >>> 0 : d | 0;
        }, argPackAdvance: 8, readValueFromPointer: fe(t, l, a !== 0), ja: null });
      },
      d: function(n, t, r) {
        function a(u) {
          u >>= 2;
          var l = L;
          return new s(K, l[u + 1], l[u]);
        }
        var s = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t];
        r = O(r), z(n, { name: r, fromWireType: a, argPackAdvance: 8, readValueFromPointer: a }, { Da: !0 });
      },
      n: function(n, t) {
        t = O(t);
        var r = t === "std::string";
        z(n, {
          name: t,
          fromWireType: function(a) {
            var s = L[a >> 2];
            if (r) for (var u = a + 4, l = 0; l <= s; ++l) {
              var c = a + 4 + l;
              if (l == s || R[c] == 0) {
                if (u) {
                  var y = u, f = R, d = y + (c - u);
                  for (u = y; f[u] && !(u >= d); ) ++u;
                  if (16 < u - y && f.subarray && rt) y = rt.decode(f.subarray(y, u));
                  else {
                    for (d = ""; y < u; ) {
                      var m = f[y++];
                      if (m & 128) {
                        var w = f[y++] & 63;
                        if ((m & 224) == 192) d += String.fromCharCode((m & 31) << 6 | w);
                        else {
                          var P = f[y++] & 63;
                          m = (m & 240) == 224 ? (m & 15) << 12 | w << 6 | P : (m & 7) << 18 | w << 12 | P << 6 | f[y++] & 63, 65536 > m ? d += String.fromCharCode(m) : (m -= 65536, d += String.fromCharCode(55296 | m >> 10, 56320 | m & 1023));
                        }
                      } else d += String.fromCharCode(m);
                    }
                    y = d;
                  }
                } else y = "";
                if (p === void 0) var p = y;
                else p += "\0", p += y;
                u = c + 1;
              }
            }
            else {
              for (p = Array(s), l = 0; l < s; ++l) p[l] = String.fromCharCode(R[a + 4 + l]);
              p = p.join("");
            }
            return H(a), p;
          },
          toWireType: function(a, s) {
            s instanceof ArrayBuffer && (s = new Uint8Array(s));
            var u = typeof s == "string";
            u || s instanceof Uint8Array || s instanceof Uint8ClampedArray || s instanceof Int8Array || v("Cannot pass non-string to std::string");
            var l = (r && u ? function() {
              for (var f = 0, d = 0; d < s.length; ++d) {
                var m = s.charCodeAt(d);
                55296 <= m && 57343 >= m && (m = 65536 + ((m & 1023) << 10) | s.charCodeAt(++d) & 1023), 127 >= m ? ++f : f = 2047 >= m ? f + 2 : 65535 >= m ? f + 3 : f + 4;
              }
              return f;
            } : function() {
              return s.length;
            })(), c = Mn(4 + l + 1);
            if (L[c >> 2] = l, r && u) Gt(s, c + 4, l + 1);
            else if (u) for (u = 0; u < l; ++u) {
              var y = s.charCodeAt(u);
              255 < y && (H(c), v("String has UTF-16 code units that do not fit in 8 bits")), R[c + 4 + u] = y;
            }
            else for (u = 0; u < l; ++u) R[c + 4 + u] = s[u];
            return a !== null && a.push(H, c), c;
          },
          argPackAdvance: 8,
          readValueFromPointer: Tn,
          ja: function(a) {
            H(a);
          }
        });
      },
      j: function(n, t, r) {
        if (r = O(r), t === 2)
          var a = Yt, s = $t, u = Xt, l = function() {
            return wn;
          }, c = 1;
        else t === 4 && (a = Jt, s = Qt, u = Zt, l = function() {
          return L;
        }, c = 2);
        z(n, { name: r, fromWireType: function(y) {
          for (var f = L[y >> 2], d = l(), m, w = y + 4, P = 0; P <= f; ++P) {
            var p = y + 4 + P * t;
            (P == f || d[p >> c] == 0) && (w = a(w, p - w), m === void 0 ? m = w : (m += "\0", m += w), w = p + t);
          }
          return H(y), m;
        }, toWireType: function(y, f) {
          typeof f != "string" && v("Cannot pass non-string to C++ string type " + r);
          var d = u(f), m = Mn(4 + d + t);
          return L[m >> 2] = d >> c, s(f, m + 4, d + t), y !== null && y.push(H, m), m;
        }, argPackAdvance: 8, readValueFromPointer: Tn, ja: function(y) {
          H(y);
        } });
      },
      v: function(n, t) {
        t = O(t), z(n, { Pa: !0, name: t, argPackAdvance: 0, fromWireType: function() {
        }, toWireType: function() {
        } });
      },
      k: function(n, t, r) {
        n = Jn(n), t = St(t, "emval::as");
        var a = [], s = rn(a);
        return j[r >> 2] = s, t.toWireType(a, n);
      },
      i: Xn,
      l: function(n, t) {
        return n = Jn(n), t = Jn(t), rn(n[t]);
      },
      p: function(n) {
        var t = de[n];
        return rn(t === void 0 ? O(n) : t);
      },
      o: function(n) {
        Sn(I[n].value), Xn(n);
      },
      w: function(n, t) {
        return n = St(n, "_emval_take_value"), n = n.readValueFromPointer(t), rn(n);
      },
      f: function() {
        fn();
      },
      q: function(n, t, r) {
        R.copyWithin(n, t, t + r);
      },
      r: function(n) {
        n >>>= 0;
        var t = R.length;
        if (2147483648 < n) return !1;
        for (var r = 1; 4 >= r; r *= 2) {
          var a = t * (1 + 0.2 / r);
          a = Math.min(a, n + 100663296), a = Math.max(16777216, n, a), 0 < a % 65536 && (a += 65536 - a % 65536);
          n: {
            try {
              M.grow(Math.min(2147483648, a) - K.byteLength + 65535 >>> 16), st(M.buffer);
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
      a: M
    };
    (function() {
      function n(u) {
        u = u.exports, u = Mt(u), e.asm = u, $--, e.monitorRunDependencies && e.monitorRunDependencies($), $ == 0 && ln && (u = ln, ln = null, u());
      }
      function t(u) {
        n(u.instance);
      }
      function r(u) {
        return ne().then(function(l) {
          return WebAssembly.instantiate(l, a);
        }).then(u, function(l) {
          W("failed to asynchronously prepare wasm: " + l), fn(l);
        });
      }
      var a = { a: he };
      if ($++, e.monitorRunDependencies && e.monitorRunDependencies($), e.instantiateWasm) try {
        var s = e.instantiateWasm(a, n);
        return s = Mt(s);
      } catch (u) {
        return W("Module.instantiateWasm callback failed with error: " + u), !1;
      }
      return function() {
        if (A || typeof WebAssembly.instantiateStreaming != "function" || dt() || Bn("file://") || typeof fetch != "function") return r(t);
        fetch(X, { credentials: "same-origin" }).then(function(u) {
          return WebAssembly.instantiateStreaming(u, a).then(t, function(l) {
            return W("wasm streaming compile failed: " + l), W("falling back to ArrayBuffer instantiation"), r(t);
          });
        });
      }(), {};
    })();
    var Ot = e.___wasm_call_ctors = function() {
      return (Ot = e.___wasm_call_ctors = e.asm.z).apply(null, arguments);
    }, Mn = e._malloc = function() {
      return (Mn = e._malloc = e.asm.A).apply(null, arguments);
    }, H = e._free = function() {
      return (H = e._free = e.asm.B).apply(null, arguments);
    }, xt = e.___getTypeName = function() {
      return (xt = e.___getTypeName = e.asm.C).apply(null, arguments);
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
    var kn;
    ln = function n() {
      kn || Qn(), kn || (ln = n);
    };
    function Qn() {
      function n() {
        if (!kn && (kn = !0, e.calledRun = !0, !un)) {
          if (bn(lt), bn(Kt), h(e), e.onRuntimeInitialized && e.onRuntimeInitialized(), e.postRun) for (typeof e.postRun == "function" && (e.postRun = [e.postRun]); e.postRun.length; ) {
            var t = e.postRun.shift();
            ft.unshift(t);
          }
          bn(ft);
        }
      }
      if (!(0 < $)) {
        if (e.preRun) for (typeof e.preRun == "function" && (e.preRun = [e.preRun]); e.preRun.length; ) qt();
        bn(ct), 0 < $ || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            e.setStatus("");
          }, 1), n();
        }, 1)) : n());
      }
    }
    if (e.run = Qn, e.preInit) for (typeof e.preInit == "function" && (e.preInit = [e.preInit]); 0 < e.preInit.length; ) e.preInit.pop()();
    return Qn(), o.ready;
  };
}();
function Vt(i, o) {
  return Math.sqrt((i.x - o.x) ** 2 + (i.y - o.y) ** 2);
}
function je(i, o) {
  return {
    x: (i.x + o.x) / 2,
    y: (i.y + o.y) / 2
  };
}
function Ue(i, o) {
  if (i.confidence <= 0 || o.confidence <= 0)
    return { x: 0, y: 0 };
  const e = Vt(i.center, o.center), h = je(i.center, o.center);
  return {
    x: h.x,
    y: h.y + e / 4
    // calculation is taken from mobile team
  };
}
function Be(i, o, e) {
  if (i.confidence <= 0 || o.confidence <= 0)
    return 0;
  const h = Vt(i.center, o.center), g = Ie(e.width, e.height);
  return Re(h / g);
}
function qn(i) {
  const { centerX: o, centerY: e, confidence: h, size: g, status: _ } = i;
  return {
    center: {
      x: o,
      y: e
    },
    confidence: h / gn,
    status: _ / gn,
    size: g
  };
}
let Ne = class extends xe {
  getSamWasmFilePath(o, e) {
    return `${o}/face/wasm/${e}`;
  }
  fetchSamModule(o) {
    return Fe(o);
  }
  parseRawData(o, e) {
    const { brightness: h, sharpness: g } = o.params, { bottomRightX: _, bottomRightY: b, leftEye: S, mouth: E, rightEye: C, topLeftX: T, topLeftY: W } = o, A = qn(S), M = qn(C), un = qn(E);
    return {
      confidence: o.confidence / gn,
      topLeft: {
        x: T,
        y: W
      },
      bottomRight: {
        x: _,
        y: b
      },
      faceCenter: Ue(A, M),
      faceSize: Be(A, M, e),
      leftEye: A,
      rightEye: M,
      mouth: un,
      brightness: h / gn,
      sharpness: g / gn
    };
  }
  async detect(o, e, h) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const g = this.convertToSamColorImage(o, e), _ = this.samWasmModule.detectFacePartsWithImageParameters(
      e.width,
      e.height,
      g.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return g.free(), this.parseRawData(_, h);
  }
};
class Le extends Ne {
}
tt(Le);
