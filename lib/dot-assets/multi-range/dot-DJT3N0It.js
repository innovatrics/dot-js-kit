var In = Object.defineProperty;
var xr = (c) => {
  throw TypeError(c);
};
var Un = (c, o, s) => o in c ? In(c, o, { enumerable: !0, configurable: !0, writable: !0, value: s }) : c[o] = s;
var ke = (c, o, s) => Un(c, typeof o != "symbol" ? o + "" : o, s), Ir = (c, o, s) => o.has(c) || xr("Cannot " + s);
var V = (c, o, s) => (Ir(c, o, "read from private field"), s ? s.call(c) : o.get(c)), Me = (c, o, s) => o.has(c) ? xr("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(c) : o.set(c, s), De = (c, o, s, a) => (Ir(c, o, "write to private field"), a ? a.call(c, s) : o.set(c, s), s);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const jr = Symbol("Comlink.proxy"), Hn = Symbol("Comlink.endpoint"), jn = Symbol("Comlink.releaseProxy"), xe = Symbol("Comlink.finalizer"), Ie = Symbol("Comlink.thrown"), Nr = (c) => typeof c == "object" && c !== null || typeof c == "function", Nn = {
  canHandle: (c) => Nr(c) && c[jr],
  serialize(c) {
    const { port1: o, port2: s } = new MessageChannel();
    return Qe(c, o), [s, [s]];
  },
  deserialize(c) {
    return c.start(), zn(c);
  }
}, Vn = {
  canHandle: (c) => Nr(c) && Ie in c,
  serialize({ value: c }) {
    let o;
    return c instanceof Error ? o = {
      isError: !0,
      value: {
        message: c.message,
        name: c.name,
        stack: c.stack
      }
    } : o = { isError: !1, value: c }, [o, []];
  },
  deserialize(c) {
    throw c.isError ? Object.assign(new Error(c.value.message), c.value) : c.value;
  }
}, Vr = /* @__PURE__ */ new Map([
  ["proxy", Nn],
  ["throw", Vn]
]);
function Bn(c, o) {
  for (const s of c)
    if (o === s || s === "*" || s instanceof RegExp && s.test(o))
      return !0;
  return !1;
}
function Qe(c, o = globalThis, s = ["*"]) {
  o.addEventListener("message", function a(v) {
    if (!v || !v.data)
      return;
    if (!Bn(s, v.origin)) {
      console.warn(`Invalid origin '${v.origin}' for comlink proxy`);
      return;
    }
    const { id: w, type: S, path: A } = Object.assign({ path: [] }, v.data), E = (v.data.argumentList || []).map(re);
    let _;
    try {
      const $ = A.slice(0, -1).reduce((C, D) => C[D], c), b = A.reduce((C, D) => C[D], c);
      switch (S) {
        case "GET":
          _ = b;
          break;
        case "SET":
          $[A.slice(-1)[0]] = re(v.data.value), _ = !0;
          break;
        case "APPLY":
          _ = b.apply($, E);
          break;
        case "CONSTRUCT":
          {
            const C = new b(...E);
            _ = Jn(C);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: C, port2: D } = new MessageChannel();
            Qe(c, D), _ = qn(C, [C]);
          }
          break;
        case "RELEASE":
          _ = void 0;
          break;
        default:
          return;
      }
    } catch ($) {
      _ = { value: $, [Ie]: 0 };
    }
    Promise.resolve(_).catch(($) => ({ value: $, [Ie]: 0 })).then(($) => {
      const [b, C] = je($);
      o.postMessage(Object.assign(Object.assign({}, b), { id: w }), C), S === "RELEASE" && (o.removeEventListener("message", a), Br(o), xe in c && typeof c[xe] == "function" && c[xe]());
    }).catch(($) => {
      const [b, C] = je({
        value: new TypeError("Unserializable return value"),
        [Ie]: 0
      });
      o.postMessage(Object.assign(Object.assign({}, b), { id: w }), C);
    });
  }), o.start && o.start();
}
function Ln(c) {
  return c.constructor.name === "MessagePort";
}
function Br(c) {
  Ln(c) && c.close();
}
function zn(c, o) {
  const s = /* @__PURE__ */ new Map();
  return c.addEventListener("message", function(v) {
    const { data: w } = v;
    if (!w || !w.id)
      return;
    const S = s.get(w.id);
    if (S)
      try {
        S(w);
      } finally {
        s.delete(w.id);
      }
  }), Ze(c, s, [], o);
}
function Oe(c) {
  if (c)
    throw new Error("Proxy has been released and is not useable");
}
function Lr(c) {
  return oe(c, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    Br(c);
  });
}
const Ue = /* @__PURE__ */ new WeakMap(), He = "FinalizationRegistry" in globalThis && new FinalizationRegistry((c) => {
  const o = (Ue.get(c) || 0) - 1;
  Ue.set(c, o), o === 0 && Lr(c);
});
function Gn(c, o) {
  const s = (Ue.get(o) || 0) + 1;
  Ue.set(o, s), He && He.register(c, o, c);
}
function Yn(c) {
  He && He.unregister(c);
}
function Ze(c, o, s = [], a = function() {
}) {
  let v = !1;
  const w = new Proxy(a, {
    get(S, A) {
      if (Oe(v), A === jn)
        return () => {
          Yn(w), Lr(c), o.clear(), v = !0;
        };
      if (A === "then") {
        if (s.length === 0)
          return { then: () => w };
        const E = oe(c, o, {
          type: "GET",
          path: s.map((_) => _.toString())
        }).then(re);
        return E.then.bind(E);
      }
      return Ze(c, o, [...s, A]);
    },
    set(S, A, E) {
      Oe(v);
      const [_, $] = je(E);
      return oe(c, o, {
        type: "SET",
        path: [...s, A].map((b) => b.toString()),
        value: _
      }, $).then(re);
    },
    apply(S, A, E) {
      Oe(v);
      const _ = s[s.length - 1];
      if (_ === Hn)
        return oe(c, o, {
          type: "ENDPOINT"
        }).then(re);
      if (_ === "bind")
        return Ze(c, o, s.slice(0, -1));
      const [$, b] = Ur(E);
      return oe(c, o, {
        type: "APPLY",
        path: s.map((C) => C.toString()),
        argumentList: $
      }, b).then(re);
    },
    construct(S, A) {
      Oe(v);
      const [E, _] = Ur(A);
      return oe(c, o, {
        type: "CONSTRUCT",
        path: s.map(($) => $.toString()),
        argumentList: E
      }, _).then(re);
    }
  });
  return Gn(w, c), w;
}
function Xn(c) {
  return Array.prototype.concat.apply([], c);
}
function Ur(c) {
  const o = c.map(je);
  return [o.map((s) => s[0]), Xn(o.map((s) => s[1]))];
}
const zr = /* @__PURE__ */ new WeakMap();
function qn(c, o) {
  return zr.set(c, o), c;
}
function Jn(c) {
  return Object.assign(c, { [jr]: !0 });
}
function je(c) {
  for (const [o, s] of Vr)
    if (s.canHandle(c)) {
      const [a, v] = s.serialize(c);
      return [
        {
          type: "HANDLER",
          name: o,
          value: a
        },
        v
      ];
    }
  return [
    {
      type: "RAW",
      value: c
    },
    zr.get(c) || []
  ];
}
function re(c) {
  switch (c.type) {
    case "HANDLER":
      return Vr.get(c.name).deserialize(c.value);
    case "RAW":
      return c.value;
  }
}
function oe(c, o, s, a) {
  return new Promise((v) => {
    const w = Kn();
    o.set(w, v), c.start && c.start(), c.postMessage(Object.assign({ id: w }, s), a);
  });
}
function Kn() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
class M extends Error {
  constructor(s, a) {
    super(s);
    ke(this, "cause");
    this.name = "AutoCaptureError", this.cause = a;
  }
  // Change this to Decorator when they will be in stable release
  static logError(s) {
  }
  static fromCameraError(s) {
    if (this.logError(s), s instanceof M)
      return s;
    let a;
    switch (s.name) {
      case "OverconstrainedError":
        a = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        a = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        a = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        a = "There is no camera available to you";
        break;
      default:
        a = "An unknown camera error has occurred";
        break;
    }
    return new M(a, s);
  }
  static fromError(s) {
    if (this.logError(s), s instanceof M)
      return s;
    const a = "An unexpected error has occurred";
    return new M(a);
  }
}
const er = (c) => Number.parseFloat(c.toFixed(3)), Gr = (c, o) => Math.min(c, o);
function Zn(c, o) {
  const s = Gr(o.width, o.height);
  return er(c * s);
}
const he = 1e3, Hr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Qn = (c) => JSON.parse(
  JSON.stringify(c, (o, s) => typeof s == "number" ? er(s) : s)
);
function ea(c, o) {
  const { faceCenter: s, faceSize: a } = c, v = Zn(a, o), w = {
    topLeft: {
      x: s.x - v,
      y: s.y - v
    },
    topRight: {
      x: s.x + v,
      y: s.y - v
    },
    bottomRight: {
      x: s.x + v,
      y: s.y + v
    },
    bottomLeft: {
      x: s.x - v,
      y: s.y + v
    }
  };
  return Qn(w);
}
const ra = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), ta = {
  RGBA: "RGBA"
};
var K, te, ce;
class na {
  constructor(o, s) {
    Me(this, K);
    Me(this, te);
    Me(this, ce);
    De(this, K, o), De(this, te, this.allocate(s.length * s.BYTES_PER_ELEMENT)), De(this, ce, this.allocate(s.length * s.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return V(this, te);
  }
  get bgr0ImagePointer() {
    return V(this, ce);
  }
  allocate(o) {
    return V(this, K)._malloc(o);
  }
  free() {
    V(this, K)._free(V(this, te)), V(this, K)._free(V(this, ce));
  }
  writeDataToMemory(o) {
    V(this, K).HEAPU8.set(o, V(this, te));
  }
}
K = new WeakMap(), te = new WeakMap(), ce = new WeakMap();
class aa {
  constructor() {
    ke(this, "samWasmModule");
  }
  getOverriddenModules(o, s) {
    return {
      locateFile: (a) => new URL(s || a, o).href
    };
  }
  async handleMissingOrInvalidSamModule(o, s) {
    try {
      const a = await fetch(o);
      if (!a.ok)
        throw new M(
          `The path to ${s} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${o}`
        );
      const v = await a.arrayBuffer();
      if (!WebAssembly.validate(v))
        throw new M(
          `The provided ${s} is not a valid WASM module. Please check provided path to wasm files. Current path is ${o}`
        );
    } catch (a) {
      if (a instanceof M)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), a;
    }
  }
  async getSamWasmFileName() {
    return await ra() ? Hr.simd : Hr.sam;
  }
  async initSamModule(o, s) {
    if (this.samWasmModule)
      return;
    const a = await this.getSamWasmFileName(), v = this.getSamWasmFilePath(s, a);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(o, v)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(v, a), new M("Could not init detector.");
    }
  }
  terminateSamModule() {
    var o;
    (o = this.samWasmModule) == null || o.terminate();
  }
  async getSamVersion() {
    var s;
    const o = await ((s = this.samWasmModule) == null ? void 0 : s.getInfoString());
    return o == null ? void 0 : o.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(o) {
    if (!this.samWasmModule)
      throw new M("SAM WASM module is not initialized");
    const s = new na(this.samWasmModule, o);
    return s.writeDataToMemory(o), s;
  }
  convertToSamColorImage(o, s) {
    if (!this.samWasmModule)
      throw new M("SAM WASM module is not initialized");
    const a = this.writeImageToMemory(o);
    return this.samWasmModule.convertToSamColorImage(
      s.width,
      s.height,
      a.rgbaImagePointer,
      ta.RGBA,
      a.bgr0ImagePointer
    ), a;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(o, s, a) {
    if (!this.samWasmModule)
      throw new M("SAM WASM module is not initialized");
    const v = this.convertToSamColorImage(o, s), { bottomLeft: w, topLeft: S, topRight: A } = a, E = [
      S.x,
      // x
      S.y,
      // y
      A.x - S.x,
      // width
      w.y - S.y
      // height
    ], { height: _, width: $, x: b, y: C } = await this.samWasmModule.selectDetailRegion(
      s.width,
      s.height,
      v.bgr0ImagePointer,
      E
    );
    return v.free(), {
      height: _,
      width: $,
      shiftX: b,
      shiftY: C
    };
  }
  [xe]() {
    this.terminateSamModule();
  }
}
class ia extends aa {
  parseRawData(o, s) {
    const { brightness: a, sharpness: v } = o.params, { bottomRightX: w, bottomRightY: S, leftEye: A, mouth: E, rightEye: _, topLeftX: $, topLeftY: b } = o, C = this.normalizeRawFacePart(A), D = this.normalizeRawFacePart(_), le = this.normalizeRawFacePart(E);
    return {
      confidence: o.confidence / he,
      topLeft: {
        x: $,
        y: b
      },
      bottomRight: {
        x: w,
        y: S
      },
      faceCenter: this.calculateFaceCenter(C, D),
      faceSize: this.calculateFaceSize(C, D, s),
      leftEye: C,
      rightEye: D,
      mouth: le,
      brightness: a / he,
      sharpness: v / he
    };
  }
  async detect(o, s, a) {
    if (!this.samWasmModule)
      throw new M("SAM WASM module is not initialized");
    const v = this.convertToSamColorImage(o, s), w = this.samWasmModule.detectFacePartsWithImageParameters(
      s.width,
      s.height,
      v.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return v.free(), this.parseRawData(w, a);
  }
  async getOptimalRegionForCompressionDetection(o, s, a) {
    const v = ea(a, s);
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(o, s, v);
  }
  normalizeRawFacePart(o) {
    const { centerX: s, centerY: a, confidence: v, size: w, status: S } = o;
    return {
      center: {
        x: s,
        y: a
      },
      confidence: v / he,
      status: S / he,
      size: w
    };
  }
  calculateFaceSize(o, s, a) {
    if (o.confidence <= 0 || s.confidence <= 0)
      return 0;
    const v = this.getTwoPointsDistance(o.center, s.center), w = Gr(a.width, a.height);
    return er(v / w);
  }
  calculateFaceCenter(o, s) {
    if (o.confidence <= 0 || s.confidence <= 0)
      return { x: 0, y: 0 };
    const a = this.getTwoPointsDistance(o.center, s.center), v = this.getPointBetweenTwoPoints(o.center, s.center);
    return {
      x: v.x,
      y: v.y + a / 4
      // calculation is taken from mobile team
    };
  }
  getTwoPointsDistance(o, s) {
    return Math.sqrt((o.x - s.x) ** 2 + (o.y - s.y) ** 2);
  }
  getPointBetweenTwoPoints(o, s) {
    return {
      x: (o.x + s.x) / 2,
      y: (o.y + s.y) / 2
    };
  }
}
var sa = (() => {
  var c = import.meta.url;
  return async function(o = {}) {
    var s, a = o, v, w, S = new Promise((r, e) => {
      v = r, w = e;
    }), A = typeof window == "object", E = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var _ = Object.assign({}, a), $ = (r, e) => {
      throw e;
    }, b = "";
    function C(r) {
      return a.locateFile ? a.locateFile(r, b) : b + r;
    }
    var D, le;
    (A || E) && (E ? b = self.location.href : typeof document < "u" && document.currentScript && (b = document.currentScript.src), c && (b = c), b.startsWith("blob:") ? b = "" : b = b.slice(0, b.replace(/[?#].*/, "").lastIndexOf("/") + 1), E && (le = (r) => {
      var e = new XMLHttpRequest();
      return e.open("GET", r, !1), e.responseType = "arraybuffer", e.send(null), new Uint8Array(e.response);
    }), D = async (r) => {
      if (ir(r))
        return new Promise((t, n) => {
          var i = new XMLHttpRequest();
          i.open("GET", r, !0), i.responseType = "arraybuffer", i.onload = () => {
            if (i.status == 200 || i.status == 0 && i.response) {
              t(i.response);
              return;
            }
            n(i.status);
          }, i.onerror = n, i.send(null);
        });
      var e = await fetch(r, { credentials: "same-origin" });
      if (e.ok)
        return e.arrayBuffer();
      throw new Error(e.status + " : " + e.url);
    }), a.print || console.log.bind(console);
    var pe = a.printErr || console.error.bind(console);
    Object.assign(a, _), _ = null, a.arguments && a.arguments, a.thisProgram && a.thisProgram;
    var ye = a.wasmBinary, ge, Z = !1, we, L, k, ne, ue, z, T, rr, tr, nr, ar, ir = (r) => r.startsWith("file://");
    function sr() {
      var r = ge.buffer;
      a.HEAP8 = L = new Int8Array(r), a.HEAP16 = ne = new Int16Array(r), a.HEAPU8 = k = new Uint8Array(r), a.HEAPU16 = ue = new Uint16Array(r), a.HEAP32 = z = new Int32Array(r), a.HEAPU32 = T = new Uint32Array(r), a.HEAPF32 = rr = new Float32Array(r), a.HEAPF64 = ar = new Float64Array(r), a.HEAP64 = tr = new BigInt64Array(r), a.HEAPU64 = nr = new BigUint64Array(r);
    }
    function Yr() {
      if (a.preRun)
        for (typeof a.preRun == "function" && (a.preRun = [a.preRun]); a.preRun.length; )
          st(a.preRun.shift());
      cr(ur);
    }
    function Xr() {
      y.C();
    }
    function qr() {
      if (a.postRun)
        for (typeof a.postRun == "function" && (a.postRun = [a.postRun]); a.postRun.length; )
          it(a.postRun.shift());
      cr(lr);
    }
    var Q = 0, fe = null;
    function Jr(r) {
      var e;
      Q++, (e = a.monitorRunDependencies) == null || e.call(a, Q);
    }
    function Kr(r) {
      var t;
      if (Q--, (t = a.monitorRunDependencies) == null || t.call(a, Q), Q == 0 && fe) {
        var e = fe;
        fe = null, e();
      }
    }
    function be(r) {
      var t;
      (t = a.onAbort) == null || t.call(a, r), r = "Aborted(" + r + ")", pe(r), Z = !0, r += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(r);
      throw w(e), e;
    }
    var Ne;
    function Zr() {
      return a.locateFile ? C("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Qr(r) {
      if (r == Ne && ye)
        return new Uint8Array(ye);
      if (le)
        return le(r);
      throw "both async and sync fetching of the wasm failed";
    }
    async function et(r) {
      if (!ye)
        try {
          var e = await D(r);
          return new Uint8Array(e);
        } catch {
        }
      return Qr(r);
    }
    async function rt(r, e) {
      try {
        var t = await et(r), n = await WebAssembly.instantiate(t, e);
        return n;
      } catch (i) {
        pe(`failed to asynchronously prepare wasm: ${i}`), be(i);
      }
    }
    async function tt(r, e, t) {
      if (!r && typeof WebAssembly.instantiateStreaming == "function" && !ir(e))
        try {
          var n = fetch(e, { credentials: "same-origin" }), i = await WebAssembly.instantiateStreaming(n, t);
          return i;
        } catch (u) {
          pe(`wasm streaming compile failed: ${u}`), pe("falling back to ArrayBuffer instantiation");
        }
      return rt(e, t);
    }
    function nt() {
      return { a: Fn };
    }
    async function at() {
      function r(u, f) {
        return y = u.exports, y = m.instrumentWasmExports(y), ge = y.B, sr(), y.H, Kr(), y;
      }
      Jr();
      function e(u) {
        return r(u.instance);
      }
      var t = nt();
      if (a.instantiateWasm)
        return new Promise((u, f) => {
          a.instantiateWasm(t, (l, d) => {
            r(l), u(l.exports);
          });
        });
      Ne ?? (Ne = Zr());
      try {
        var n = await tt(ye, Ne, t), i = e(n);
        return i;
      } catch (u) {
        return w(u), Promise.reject(u);
      }
    }
    class or {
      constructor(e) {
        ke(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${e})`, this.status = e;
      }
    }
    var cr = (r) => {
      for (; r.length > 0; )
        r.shift()(a);
    }, lr = [], it = (r) => lr.unshift(r), ur = [], st = (r) => ur.unshift(r), fr = a.noExitRuntime || !0;
    class ot {
      constructor(e) {
        this.excPtr = e, this.ptr = e - 24;
      }
      set_type(e) {
        T[this.ptr + 4 >> 2] = e;
      }
      get_type() {
        return T[this.ptr + 4 >> 2];
      }
      set_destructor(e) {
        T[this.ptr + 8 >> 2] = e;
      }
      get_destructor() {
        return T[this.ptr + 8 >> 2];
      }
      set_caught(e) {
        e = e ? 1 : 0, L[this.ptr + 12] = e;
      }
      get_caught() {
        return L[this.ptr + 12] != 0;
      }
      set_rethrown(e) {
        e = e ? 1 : 0, L[this.ptr + 13] = e;
      }
      get_rethrown() {
        return L[this.ptr + 13] != 0;
      }
      init(e, t) {
        this.set_adjusted_ptr(0), this.set_type(e), this.set_destructor(t);
      }
      set_adjusted_ptr(e) {
        T[this.ptr + 16 >> 2] = e;
      }
      get_adjusted_ptr() {
        return T[this.ptr + 16 >> 2];
      }
    }
    var dr = 0, ct = (r, e, t) => {
      var n = new ot(r);
      throw n.init(e, t), dr = r, dr;
    }, lt = () => be(""), _e = (r) => {
      if (r === null)
        return "null";
      var e = typeof r;
      return e === "object" || e === "array" || e === "function" ? r.toString() : "" + r;
    }, ut = () => {
      for (var r = new Array(256), e = 0; e < 256; ++e)
        r[e] = String.fromCharCode(e);
      vr = r;
    }, vr, R = (r) => {
      for (var e = "", t = r; k[t]; )
        e += vr[k[t++]];
      return e;
    }, ae = {}, ee = {}, Pe = {}, ie, g = (r) => {
      throw new ie(r);
    }, mr, $e = (r) => {
      throw new mr(r);
    }, se = (r, e, t) => {
      r.forEach((l) => Pe[l] = e);
      function n(l) {
        var d = t(l);
        d.length !== r.length && $e("Mismatched type converter count");
        for (var p = 0; p < r.length; ++p)
          x(r[p], d[p]);
      }
      var i = new Array(e.length), u = [], f = 0;
      e.forEach((l, d) => {
        ee.hasOwnProperty(l) ? i[d] = ee[l] : (u.push(l), ae.hasOwnProperty(l) || (ae[l] = []), ae[l].push(() => {
          i[d] = ee[l], ++f, f === u.length && n(i);
        }));
      }), u.length === 0 && n(i);
    };
    function ft(r, e, t = {}) {
      var n = e.name;
      if (r || g(`type "${n}" must have a positive integer typeid pointer`), ee.hasOwnProperty(r)) {
        if (t.ignoreDuplicateRegistrations)
          return;
        g(`Cannot register type '${n}' twice`);
      }
      if (ee[r] = e, delete Pe[r], ae.hasOwnProperty(r)) {
        var i = ae[r];
        delete ae[r], i.forEach((u) => u());
      }
    }
    function x(r, e, t = {}) {
      return ft(r, e, t);
    }
    var hr = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? (n) => L[n] : (n) => k[n];
        case 2:
          return t ? (n) => ne[n >> 1] : (n) => ue[n >> 1];
        case 4:
          return t ? (n) => z[n >> 2] : (n) => T[n >> 2];
        case 8:
          return t ? (n) => tr[n >> 3] : (n) => nr[n >> 3];
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, dt = (r, e, t, n, i) => {
      e = R(e);
      var u = e.indexOf("u") != -1;
      x(r, { name: e, fromWireType: (f) => f, toWireType: function(f, l) {
        if (typeof l != "bigint" && typeof l != "number")
          throw new TypeError(`Cannot convert "${_e(l)}" to ${this.name}`);
        return typeof l == "number" && (l = BigInt(l)), l;
      }, argPackAdvance: U, readValueFromPointer: hr(e, t, !u), destructorFunction: null });
    }, U = 8, vt = (r, e, t, n) => {
      e = R(e), x(r, { name: e, fromWireType: function(i) {
        return !!i;
      }, toWireType: function(i, u) {
        return u ? t : n;
      }, argPackAdvance: U, readValueFromPointer: function(i) {
        return this.fromWireType(k[i]);
      }, destructorFunction: null });
    }, mt = (r) => ({ count: r.count, deleteScheduled: r.deleteScheduled, preservePointerOnDelete: r.preservePointerOnDelete, ptr: r.ptr, ptrType: r.ptrType, smartPtr: r.smartPtr, smartPtrType: r.smartPtrType }), Ve = (r) => {
      function e(t) {
        return t.$$.ptrType.registeredClass.name;
      }
      g(e(r) + " instance already deleted");
    }, Be = !1, pr = (r) => {
    }, ht = (r) => {
      r.smartPtr ? r.smartPtrType.rawDestructor(r.smartPtr) : r.ptrType.registeredClass.rawDestructor(r.ptr);
    }, yr = (r) => {
      r.count.value -= 1;
      var e = r.count.value === 0;
      e && ht(r);
    }, gr = (r, e, t) => {
      if (e === t)
        return r;
      if (t.baseClass === void 0)
        return null;
      var n = gr(r, e, t.baseClass);
      return n === null ? null : t.downcast(n);
    }, wr = {}, pt = {}, yt = (r, e) => {
      for (e === void 0 && g("ptr should not be undefined"); r.baseClass; )
        e = r.upcast(e), r = r.baseClass;
      return e;
    }, gt = (r, e) => (e = yt(r, e), pt[e]), Ce = (r, e) => {
      (!e.ptrType || !e.ptr) && $e("makeClassHandle requires ptr and ptrType");
      var t = !!e.smartPtrType, n = !!e.smartPtr;
      return t !== n && $e("Both smartPtrType and smartPtr must be specified"), e.count = { value: 1 }, de(Object.create(r, { $$: { value: e, writable: !0 } }));
    };
    function wt(r) {
      var e = this.getPointee(r);
      if (!e)
        return this.destructor(r), null;
      var t = gt(this.registeredClass, e);
      if (t !== void 0) {
        if (t.$$.count.value === 0)
          return t.$$.ptr = e, t.$$.smartPtr = r, t.clone();
        var n = t.clone();
        return this.destructor(r), n;
      }
      function i() {
        return this.isSmartPointer ? Ce(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: e, smartPtrType: this, smartPtr: r }) : Ce(this.registeredClass.instancePrototype, { ptrType: this, ptr: r });
      }
      var u = this.registeredClass.getActualType(e), f = wr[u];
      if (!f)
        return i.call(this);
      var l;
      this.isConst ? l = f.constPointerType : l = f.pointerType;
      var d = gr(e, this.registeredClass, l.registeredClass);
      return d === null ? i.call(this) : this.isSmartPointer ? Ce(l.registeredClass.instancePrototype, { ptrType: l, ptr: d, smartPtrType: this, smartPtr: r }) : Ce(l.registeredClass.instancePrototype, { ptrType: l, ptr: d });
    }
    var de = (r) => typeof FinalizationRegistry > "u" ? (de = (e) => e, r) : (Be = new FinalizationRegistry((e) => {
      yr(e.$$);
    }), de = (e) => {
      var t = e.$$, n = !!t.smartPtr;
      if (n) {
        var i = { $$: t };
        Be.register(e, i, e);
      }
      return e;
    }, pr = (e) => Be.unregister(e), de(r)), bt = () => {
      Object.assign(Te.prototype, { isAliasOf(r) {
        if (!(this instanceof Te) || !(r instanceof Te))
          return !1;
        var e = this.$$.ptrType.registeredClass, t = this.$$.ptr;
        r.$$ = r.$$;
        for (var n = r.$$.ptrType.registeredClass, i = r.$$.ptr; e.baseClass; )
          t = e.upcast(t), e = e.baseClass;
        for (; n.baseClass; )
          i = n.upcast(i), n = n.baseClass;
        return e === n && t === i;
      }, clone() {
        if (this.$$.ptr || Ve(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var r = de(Object.create(Object.getPrototypeOf(this), { $$: { value: mt(this.$$) } }));
        return r.$$.count.value += 1, r.$$.deleteScheduled = !1, r;
      }, delete() {
        this.$$.ptr || Ve(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), pr(this), yr(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Ve(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Te() {
    }
    var Se = (r, e) => Object.defineProperty(e, "name", { value: r }), _t = (r, e, t) => {
      if (r[e].overloadTable === void 0) {
        var n = r[e];
        r[e] = function(...i) {
          return r[e].overloadTable.hasOwnProperty(i.length) || g(`Function '${t}' called with an invalid number of arguments (${i.length}) - expects one of (${r[e].overloadTable})!`), r[e].overloadTable[i.length].apply(this, i);
        }, r[e].overloadTable = [], r[e].overloadTable[n.argCount] = n;
      }
    }, Le = (r, e, t) => {
      a.hasOwnProperty(r) ? ((t === void 0 || a[r].overloadTable !== void 0 && a[r].overloadTable[t] !== void 0) && g(`Cannot register public name '${r}' twice`), _t(a, r, r), a[r].overloadTable.hasOwnProperty(t) && g(`Cannot register multiple overloads of a function with the same number of arguments (${t})!`), a[r].overloadTable[t] = e) : (a[r] = e, a[r].argCount = t);
    }, Pt = 48, $t = 57, Ct = (r) => {
      r = r.replace(/[^a-zA-Z0-9_]/g, "$");
      var e = r.charCodeAt(0);
      return e >= Pt && e <= $t ? `_${r}` : r;
    };
    function Tt(r, e, t, n, i, u, f, l) {
      this.name = r, this.constructor = e, this.instancePrototype = t, this.rawDestructor = n, this.baseClass = i, this.getActualType = u, this.upcast = f, this.downcast = l, this.pureVirtualFunctions = [];
    }
    var Ee = (r, e, t) => {
      for (; e !== t; )
        e.upcast || g(`Expected null or instance of ${t.name}, got an instance of ${e.name}`), r = e.upcast(r), e = e.baseClass;
      return r;
    };
    function St(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${_e(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = Ee(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function Et(r, e) {
      var t;
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), this.isSmartPointer ? (t = this.rawConstructor(), r !== null && r.push(this.rawDestructor, t), t) : 0;
      (!e || !e.$$) && g(`Cannot pass "${_e(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
      var n = e.$$.ptrType.registeredClass;
      if (t = Ee(e.$$.ptr, n, this.registeredClass), this.isSmartPointer)
        switch (e.$$.smartPtr === void 0 && g("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            e.$$.smartPtrType === this ? t = e.$$.smartPtr : g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            t = e.$$.smartPtr;
            break;
          case 2:
            if (e.$$.smartPtrType === this)
              t = e.$$.smartPtr;
            else {
              var i = e.clone();
              t = this.rawShare(t, I.toHandle(() => i.delete())), r !== null && r.push(this.rawDestructor, t);
            }
            break;
          default:
            g("Unsupporting sharing policy");
        }
      return t;
    }
    function At(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${_e(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.ptrType.name} to parameter type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = Ee(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function Ae(r) {
      return this.fromWireType(T[r >> 2]);
    }
    var Rt = () => {
      Object.assign(Re.prototype, { getPointee(r) {
        return this.rawGetPointee && (r = this.rawGetPointee(r)), r;
      }, destructor(r) {
        var e;
        (e = this.rawDestructor) == null || e.call(this, r);
      }, argPackAdvance: U, readValueFromPointer: Ae, fromWireType: wt });
    };
    function Re(r, e, t, n, i, u, f, l, d, p, h) {
      this.name = r, this.registeredClass = e, this.isReference = t, this.isConst = n, this.isSmartPointer = i, this.pointeeType = u, this.sharingPolicy = f, this.rawGetPointee = l, this.rawConstructor = d, this.rawShare = p, this.rawDestructor = h, !i && e.baseClass === void 0 ? n ? (this.toWireType = St, this.destructorFunction = null) : (this.toWireType = At, this.destructorFunction = null) : this.toWireType = Et;
    }
    var br = (r, e, t) => {
      a.hasOwnProperty(r) || $e("Replacing nonexistent public symbol"), a[r].overloadTable !== void 0 && t !== void 0 ? a[r].overloadTable[t] = e : (a[r] = e, a[r].argCount = t);
    }, Ft = (r, e, t) => {
      r = r.replace(/p/g, "i");
      var n = a["dynCall_" + r];
      return n(e, ...t);
    }, Wt = (r, e, t = []) => {
      var n = Ft(r, e, t);
      return n;
    }, kt = (r, e) => (...t) => Wt(r, e, t), G = (r, e) => {
      r = R(r);
      function t() {
        return kt(r, e);
      }
      var n = t();
      return typeof n != "function" && g(`unknown function pointer with signature ${r}: ${e}`), n;
    }, Mt = (r, e) => {
      var t = Se(e, function(n) {
        this.name = e, this.message = n;
        var i = new Error(n).stack;
        i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return t.prototype = Object.create(r.prototype), t.prototype.constructor = t, t.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, t;
    }, _r, Pr = (r) => {
      var e = Wn(r), t = R(e);
      return B(e), t;
    }, ve = (r, e) => {
      var t = [], n = {};
      function i(u) {
        if (!n[u] && !ee[u]) {
          if (Pe[u]) {
            Pe[u].forEach(i);
            return;
          }
          t.push(u), n[u] = !0;
        }
      }
      throw e.forEach(i), new _r(`${r}: ` + t.map(Pr).join([", "]));
    }, Dt = (r, e, t, n, i, u, f, l, d, p, h, P, F) => {
      h = R(h), u = G(i, u), l && (l = G(f, l)), p && (p = G(d, p)), F = G(P, F);
      var H = Ct(h);
      Le(H, function() {
        ve(`Cannot construct ${h} due to unbound types`, [n]);
      }), se([r, e, t], n ? [n] : [], (j) => {
        var Dr;
        j = j[0];
        var X, O;
        n ? (X = j.registeredClass, O = X.instancePrototype) : O = Te.prototype;
        var N = Se(h, function(...Ke) {
          if (Object.getPrototypeOf(this) !== q)
            throw new ie("Use 'new' to construct " + h);
          if (W.constructor_body === void 0)
            throw new ie(h + " has no accessible constructor");
          var Or = W.constructor_body[Ke.length];
          if (Or === void 0)
            throw new ie(`Tried to invoke ctor of ${h} with invalid number of parameters (${Ke.length}) - expected (${Object.keys(W.constructor_body).toString()}) parameters instead!`);
          return Or.apply(this, Ke);
        }), q = Object.create(O, { constructor: { value: N } });
        N.prototype = q;
        var W = new Tt(h, N, q, F, X, u, l, p);
        W.baseClass && ((Dr = W.baseClass).__derivedClasses ?? (Dr.__derivedClasses = []), W.baseClass.__derivedClasses.push(W));
        var J = new Re(h, W, !0, !1, !1), We = new Re(h + "*", W, !1, !1, !1), Mr = new Re(h + " const*", W, !1, !0, !1);
        return wr[r] = { pointerType: We, constPointerType: Mr }, br(H, N), [J, We, Mr];
      });
    }, $r = (r, e) => {
      for (var t = [], n = 0; n < r; n++)
        t.push(T[e + n * 4 >> 2]);
      return t;
    }, ze = (r) => {
      for (; r.length; ) {
        var e = r.pop(), t = r.pop();
        t(e);
      }
    };
    function Ot(r) {
      for (var e = 1; e < r.length; ++e)
        if (r[e] !== null && r[e].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Fe = (r) => {
      try {
        return r();
      } catch (e) {
        be(e);
      }
    }, Cr = (r) => {
      if (r instanceof or || r == "unwind")
        return we;
      $(1, r);
    }, Tr = 0, Sr = () => fr || Tr > 0, Er = (r) => {
      var e;
      we = r, Sr() || ((e = a.onExit) == null || e.call(a, r), Z = !0), $(r, new or(r));
    }, xt = (r, e) => {
      we = r, Er(r);
    }, It = xt, Ut = () => {
      if (!Sr())
        try {
          It(we);
        } catch (r) {
          Cr(r);
        }
    }, Ar = (r) => {
      if (!Z)
        try {
          r(), Ut();
        } catch (e) {
          Cr(e);
        }
    }, m = { instrumentWasmImports(r) {
      var e = /^(__asyncjs__.*)$/;
      for (let [t, n] of Object.entries(r))
        typeof n == "function" && (n.isAsync || e.test(t));
    }, instrumentWasmExports(r) {
      var e = {};
      for (let [t, n] of Object.entries(r))
        typeof n == "function" ? e[t] = (...i) => {
          m.exportCallStack.push(t);
          try {
            return n(...i);
          } finally {
            Z || (m.exportCallStack.pop(), m.maybeStopUnwind());
          }
        } : e[t] = n;
      return e;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(r) {
      var e = m.callStackNameToId[r];
      return e === void 0 && (e = m.callStackId++, m.callStackNameToId[r] = e, m.callStackIdToName[e] = r), e;
    }, maybeStopUnwind() {
      m.currData && m.state === m.State.Unwinding && m.exportCallStack.length === 0 && (m.state = m.State.Normal, Fe(Dn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((r, e) => {
        m.asyncPromiseHandlers = { resolve: r, reject: e };
      });
    }, allocateData() {
      var r = qe(12 + m.StackSize);
      return m.setDataHeader(r, r + 12, m.StackSize), m.setDataRewindFunc(r), r;
    }, setDataHeader(r, e, t) {
      T[r >> 2] = e, T[r + 4 >> 2] = e + t;
    }, setDataRewindFunc(r) {
      var e = m.exportCallStack[0], t = m.getCallStackId(e);
      z[r + 8 >> 2] = t;
    }, getDataRewindFuncName(r) {
      var e = z[r + 8 >> 2], t = m.callStackIdToName[e];
      return t;
    }, getDataRewindFunc(r) {
      var e = y[r];
      return e;
    }, doRewind(r) {
      var e = m.getDataRewindFuncName(r), t = m.getDataRewindFunc(e);
      return t();
    }, handleSleep(r) {
      if (!Z) {
        if (m.state === m.State.Normal) {
          var e = !1, t = !1;
          r((n = 0) => {
            if (!Z && (m.handleSleepReturnValue = n, e = !0, !!t)) {
              m.state = m.State.Rewinding, Fe(() => On(m.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var i, u = !1;
              try {
                i = m.doRewind(m.currData);
              } catch (d) {
                i = d, u = !0;
              }
              var f = !1;
              if (!m.currData) {
                var l = m.asyncPromiseHandlers;
                l && (m.asyncPromiseHandlers = null, (u ? l.reject : l.resolve)(i), f = !0);
              }
              if (u && !f)
                throw i;
            }
          }), t = !0, e || (m.state = m.State.Unwinding, m.currData = m.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Fe(() => Mn(m.currData)));
        } else m.state === m.State.Rewinding ? (m.state = m.State.Normal, Fe(xn), B(m.currData), m.currData = null, m.sleepCallbacks.forEach(Ar)) : be(`invalid state: ${m.state}`);
        return m.handleSleepReturnValue;
      }
    }, handleAsync(r) {
      return m.handleSleep((e) => {
        r().then(e);
      });
    } };
    function Rr(r, e, t, n, i, u) {
      var f = e.length;
      f < 2 && g("argTypes array size mismatch! Must at least get return value and 'this' types!"), e[1];
      var l = Ot(e), d = e[0].name !== "void", p = f - 2, h = new Array(p), P = [], F = [], H = function(...j) {
        F.length = 0;
        var X;
        P.length = 1, P[0] = i;
        for (var O = 0; O < p; ++O)
          h[O] = e[O + 2].toWireType(F, j[O]), P.push(h[O]);
        var N = n(...P);
        function q(W) {
          if (l)
            ze(F);
          else
            for (var J = 2; J < e.length; J++) {
              var We = J === 1 ? X : h[J - 2];
              e[J].destructorFunction !== null && e[J].destructorFunction(We);
            }
          if (d)
            return e[0].fromWireType(W);
        }
        return m.currData ? m.whenDone().then(q) : q(N);
      };
      return Se(r, H);
    }
    var Ht = (r, e, t, n, i, u) => {
      var f = $r(e, t);
      i = G(n, i), se([], [r], (l) => {
        l = l[0];
        var d = `constructor ${l.name}`;
        if (l.registeredClass.constructor_body === void 0 && (l.registeredClass.constructor_body = []), l.registeredClass.constructor_body[e - 1] !== void 0)
          throw new ie(`Cannot register multiple constructors with identical number of parameters (${e - 1}) for class '${l.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return l.registeredClass.constructor_body[e - 1] = () => {
          ve(`Cannot construct ${l.name} due to unbound types`, f);
        }, se([], f, (p) => (p.splice(1, 0, null), l.registeredClass.constructor_body[e - 1] = Rr(d, p, null, i, u), [])), [];
      });
    }, Fr = (r, e, t) => (r instanceof Object || g(`${t} with invalid "this": ${r}`), r instanceof e.registeredClass.constructor || g(`${t} incompatible with "this" of type ${r.constructor.name}`), r.$$.ptr || g(`cannot call emscripten binding method ${t} on deleted object`), Ee(r.$$.ptr, r.$$.ptrType.registeredClass, e.registeredClass)), jt = (r, e, t, n, i, u, f, l, d, p) => {
      e = R(e), i = G(n, i), se([], [r], (h) => {
        h = h[0];
        var P = `${h.name}.${e}`, F = { get() {
          ve(`Cannot access ${P} due to unbound types`, [t, f]);
        }, enumerable: !0, configurable: !0 };
        return d ? F.set = () => ve(`Cannot access ${P} due to unbound types`, [t, f]) : F.set = (H) => g(P + " is a read-only property"), Object.defineProperty(h.registeredClass.instancePrototype, e, F), se([], d ? [t, f] : [t], (H) => {
          var j = H[0], X = { get() {
            var N = Fr(this, h, P + " getter");
            return j.fromWireType(i(u, N));
          }, enumerable: !0 };
          if (d) {
            d = G(l, d);
            var O = H[1];
            X.set = function(N) {
              var q = Fr(this, h, P + " setter"), W = [];
              d(p, q, O.toWireType(W, N)), ze(W);
            };
          }
          return Object.defineProperty(h.registeredClass.instancePrototype, e, X), [];
        }), [];
      });
    }, Ge = [], Y = [], Ye = (r) => {
      r > 9 && --Y[r + 1] === 0 && (Y[r] = void 0, Ge.push(r));
    }, Nt = () => Y.length / 2 - 5 - Ge.length, Vt = () => {
      Y.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), a.count_emval_handles = Nt;
    }, I = { toValue: (r) => (r || g("Cannot use deleted val. handle = " + r), Y[r]), toHandle: (r) => {
      switch (r) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const e = Ge.pop() || Y.length;
          return Y[e] = r, Y[e + 1] = 1, e;
        }
      }
    } }, Bt = { name: "emscripten::val", fromWireType: (r) => {
      var e = I.toValue(r);
      return Ye(r), e;
    }, toWireType: (r, e) => I.toHandle(e), argPackAdvance: U, readValueFromPointer: Ae, destructorFunction: null }, Lt = (r) => x(r, Bt), zt = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? function(n) {
            return this.fromWireType(L[n]);
          } : function(n) {
            return this.fromWireType(k[n]);
          };
        case 2:
          return t ? function(n) {
            return this.fromWireType(ne[n >> 1]);
          } : function(n) {
            return this.fromWireType(ue[n >> 1]);
          };
        case 4:
          return t ? function(n) {
            return this.fromWireType(z[n >> 2]);
          } : function(n) {
            return this.fromWireType(T[n >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, Gt = (r, e, t, n) => {
      e = R(e);
      function i() {
      }
      i.values = {}, x(r, { name: e, constructor: i, fromWireType: function(u) {
        return this.constructor.values[u];
      }, toWireType: (u, f) => f.value, argPackAdvance: U, readValueFromPointer: zt(e, t, n), destructorFunction: null }), Le(e, i);
    }, Xe = (r, e) => {
      var t = ee[r];
      return t === void 0 && g(`${e} has unknown type ${Pr(r)}`), t;
    }, Yt = (r, e, t) => {
      var n = Xe(r, "enum");
      e = R(e);
      var i = n.constructor, u = Object.create(n.constructor.prototype, { value: { value: t }, constructor: { value: Se(`${n.name}_${e}`, function() {
      }) } });
      i.values[t] = u, i[e] = u;
    }, Xt = (r, e) => {
      switch (e) {
        case 4:
          return function(t) {
            return this.fromWireType(rr[t >> 2]);
          };
        case 8:
          return function(t) {
            return this.fromWireType(ar[t >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${e}): ${r}`);
      }
    }, qt = (r, e, t) => {
      e = R(e), x(r, { name: e, fromWireType: (n) => n, toWireType: (n, i) => i, argPackAdvance: U, readValueFromPointer: Xt(e, t), destructorFunction: null });
    }, Jt = (r) => {
      r = r.trim();
      const e = r.indexOf("(");
      return e === -1 ? r : r.slice(0, e);
    }, Kt = (r, e, t, n, i, u, f, l) => {
      var d = $r(e, t);
      r = R(r), r = Jt(r), i = G(n, i), Le(r, function() {
        ve(`Cannot call ${r} due to unbound types`, d);
      }, e - 1), se([], d, (p) => {
        var h = [p[0], null].concat(p.slice(1));
        return br(r, Rr(r, h, null, i, u), e - 1), [];
      });
    }, Zt = (r, e, t, n, i) => {
      e = R(e);
      var u = (h) => h;
      if (n === 0) {
        var f = 32 - 8 * t;
        u = (h) => h << f >>> f;
      }
      var l = e.includes("unsigned"), d = (h, P) => {
      }, p;
      l ? p = function(h, P) {
        return d(P, this.name), P >>> 0;
      } : p = function(h, P) {
        return d(P, this.name), P;
      }, x(r, { name: e, fromWireType: u, toWireType: p, argPackAdvance: U, readValueFromPointer: hr(e, t, n !== 0), destructorFunction: null });
    }, Qt = (r, e, t) => {
      var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], i = n[e];
      function u(f) {
        var l = T[f >> 2], d = T[f + 4 >> 2];
        return new i(L.buffer, d, l);
      }
      t = R(t), x(r, { name: t, fromWireType: u, argPackAdvance: U, readValueFromPointer: u }, { ignoreDuplicateRegistrations: !0 });
    }, en = (r, e, t, n) => {
      if (!(n > 0)) return 0;
      for (var i = t, u = t + n - 1, f = 0; f < r.length; ++f) {
        var l = r.charCodeAt(f);
        if (l >= 55296 && l <= 57343) {
          var d = r.charCodeAt(++f);
          l = 65536 + ((l & 1023) << 10) | d & 1023;
        }
        if (l <= 127) {
          if (t >= u) break;
          e[t++] = l;
        } else if (l <= 2047) {
          if (t + 1 >= u) break;
          e[t++] = 192 | l >> 6, e[t++] = 128 | l & 63;
        } else if (l <= 65535) {
          if (t + 2 >= u) break;
          e[t++] = 224 | l >> 12, e[t++] = 128 | l >> 6 & 63, e[t++] = 128 | l & 63;
        } else {
          if (t + 3 >= u) break;
          e[t++] = 240 | l >> 18, e[t++] = 128 | l >> 12 & 63, e[t++] = 128 | l >> 6 & 63, e[t++] = 128 | l & 63;
        }
      }
      return e[t] = 0, t - i;
    }, rn = (r, e, t) => en(r, k, e, t), tn = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n <= 127 ? e++ : n <= 2047 ? e += 2 : n >= 55296 && n <= 57343 ? (e += 4, ++t) : e += 3;
      }
      return e;
    }, Wr = typeof TextDecoder < "u" ? new TextDecoder() : void 0, nn = (r, e = 0, t = NaN) => {
      for (var n = e + t, i = e; r[i] && !(i >= n); ) ++i;
      if (i - e > 16 && r.buffer && Wr)
        return Wr.decode(r.subarray(e, i));
      for (var u = ""; e < i; ) {
        var f = r[e++];
        if (!(f & 128)) {
          u += String.fromCharCode(f);
          continue;
        }
        var l = r[e++] & 63;
        if ((f & 224) == 192) {
          u += String.fromCharCode((f & 31) << 6 | l);
          continue;
        }
        var d = r[e++] & 63;
        if ((f & 240) == 224 ? f = (f & 15) << 12 | l << 6 | d : f = (f & 7) << 18 | l << 12 | d << 6 | r[e++] & 63, f < 65536)
          u += String.fromCharCode(f);
        else {
          var p = f - 65536;
          u += String.fromCharCode(55296 | p >> 10, 56320 | p & 1023);
        }
      }
      return u;
    }, an = (r, e) => r ? nn(k, r, e) : "", sn = (r, e) => {
      e = R(e), x(r, { name: e, fromWireType(t) {
        for (var n = T[t >> 2], i = t + 4, u, f, l = i, f = 0; f <= n; ++f) {
          var d = i + f;
          if (f == n || k[d] == 0) {
            var p = d - l, h = an(l, p);
            u === void 0 ? u = h : (u += "\0", u += h), l = d + 1;
          }
        }
        return B(t), u;
      }, toWireType(t, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var i, u = typeof n == "string";
        u || n instanceof Uint8Array || n instanceof Uint8ClampedArray || n instanceof Int8Array || g("Cannot pass non-string to std::string"), u ? i = tn(n) : i = n.length;
        var f = qe(4 + i + 1), l = f + 4;
        if (T[f >> 2] = i, u)
          rn(n, l, i + 1);
        else if (u)
          for (var d = 0; d < i; ++d) {
            var p = n.charCodeAt(d);
            p > 255 && (B(f), g("String has UTF-16 code units that do not fit in 8 bits")), k[l + d] = p;
          }
        else
          for (var d = 0; d < i; ++d)
            k[l + d] = n[d];
        return t !== null && t.push(B, f), f;
      }, argPackAdvance: U, readValueFromPointer: Ae, destructorFunction(t) {
        B(t);
      } });
    }, kr = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, on = (r, e) => {
      for (var t = r, n = t >> 1, i = n + e / 2; !(n >= i) && ue[n]; ) ++n;
      if (t = n << 1, t - r > 32 && kr) return kr.decode(k.subarray(r, t));
      for (var u = "", f = 0; !(f >= e / 2); ++f) {
        var l = ne[r + f * 2 >> 1];
        if (l == 0) break;
        u += String.fromCharCode(l);
      }
      return u;
    }, cn = (r, e, t) => {
      if (t ?? (t = 2147483647), t < 2) return 0;
      t -= 2;
      for (var n = e, i = t < r.length * 2 ? t / 2 : r.length, u = 0; u < i; ++u) {
        var f = r.charCodeAt(u);
        ne[e >> 1] = f, e += 2;
      }
      return ne[e >> 1] = 0, e - n;
    }, ln = (r) => r.length * 2, un = (r, e) => {
      for (var t = 0, n = ""; !(t >= e / 4); ) {
        var i = z[r + t * 4 >> 2];
        if (i == 0) break;
        if (++t, i >= 65536) {
          var u = i - 65536;
          n += String.fromCharCode(55296 | u >> 10, 56320 | u & 1023);
        } else
          n += String.fromCharCode(i);
      }
      return n;
    }, fn = (r, e, t) => {
      if (t ?? (t = 2147483647), t < 4) return 0;
      for (var n = e, i = n + t - 4, u = 0; u < r.length; ++u) {
        var f = r.charCodeAt(u);
        if (f >= 55296 && f <= 57343) {
          var l = r.charCodeAt(++u);
          f = 65536 + ((f & 1023) << 10) | l & 1023;
        }
        if (z[e >> 2] = f, e += 4, e + 4 > i) break;
      }
      return z[e >> 2] = 0, e - n;
    }, dn = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n >= 55296 && n <= 57343 && ++t, e += 4;
      }
      return e;
    }, vn = (r, e, t) => {
      t = R(t);
      var n, i, u, f;
      e === 2 ? (n = on, i = cn, f = ln, u = (l) => ue[l >> 1]) : e === 4 && (n = un, i = fn, f = dn, u = (l) => T[l >> 2]), x(r, { name: t, fromWireType: (l) => {
        for (var d = T[l >> 2], p, h = l + 4, P = 0; P <= d; ++P) {
          var F = l + 4 + P * e;
          if (P == d || u(F) == 0) {
            var H = F - h, j = n(h, H);
            p === void 0 ? p = j : (p += "\0", p += j), h = F + e;
          }
        }
        return B(l), p;
      }, toWireType: (l, d) => {
        typeof d != "string" && g(`Cannot pass non-string to C++ string type ${t}`);
        var p = f(d), h = qe(4 + p + e);
        return T[h >> 2] = p / e, i(d, h + 4, p + e), l !== null && l.push(B, h), h;
      }, argPackAdvance: U, readValueFromPointer: Ae, destructorFunction(l) {
        B(l);
      } });
    }, mn = (r, e) => {
      e = R(e), x(r, { isVoid: !0, name: e, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (t, n) => {
      } });
    }, hn = () => {
      fr = !1, Tr = 0;
    }, pn = (r, e, t) => {
      var n = [], i = r.toWireType(n, t);
      return n.length && (T[e >> 2] = I.toHandle(n)), i;
    }, yn = (r, e, t) => (r = I.toValue(r), e = Xe(e, "emval::as"), pn(e, t, r)), gn = (r, e) => (r = I.toValue(r), e = I.toValue(e), I.toHandle(r[e])), wn = {}, bn = (r) => {
      var e = wn[r];
      return e === void 0 ? R(r) : e;
    }, _n = (r) => I.toHandle(bn(r)), Pn = (r) => {
      var e = I.toValue(r);
      ze(e), Ye(r);
    }, $n = (r, e) => {
      r = Xe(r, "_emval_take_value");
      var t = r.readValueFromPointer(e);
      return I.toHandle(t);
    }, me = {}, Cn = () => performance.now(), Tn = (r, e) => {
      if (me[r] && (clearTimeout(me[r].id), delete me[r]), !e) return 0;
      var t = setTimeout(() => {
        delete me[r], Ar(() => kn(r, Cn()));
      }, e);
      return me[r] = { id: t, timeout_ms: e }, 0;
    }, Sn = () => 2147483648, En = (r, e) => Math.ceil(r / e) * e, An = (r) => {
      var e = ge.buffer, t = (r - e.byteLength + 65535) / 65536 | 0;
      try {
        return ge.grow(t), sr(), 1;
      } catch {
      }
    }, Rn = (r) => {
      var e = k.length;
      r >>>= 0;
      var t = Sn();
      if (r > t)
        return !1;
      for (var n = 1; n <= 4; n *= 2) {
        var i = e * (1 + 0.2 / n);
        i = Math.min(i, r + 100663296);
        var u = Math.min(t, En(Math.max(r, i), 65536)), f = An(u);
        if (f)
          return !0;
      }
      return !1;
    };
    ut(), ie = a.BindingError = class extends Error {
      constructor(e) {
        super(e), this.name = "BindingError";
      }
    }, mr = a.InternalError = class extends Error {
      constructor(e) {
        super(e), this.name = "InternalError";
      }
    }, bt(), Rt(), _r = a.UnboundTypeError = Mt(Error, "UnboundTypeError"), Vt();
    var Fn = { i: ct, s: lt, n: dt, w: vt, f: Dt, d: Ht, a: jt, u: Lt, l: Gt, g: Yt, m: qt, b: Kt, e: Zt, c: Qt, v: sn, h: vn, x: mn, q: hn, j: yn, y: Ye, k: gn, o: _n, A: Pn, z: $n, r: Tn, t: Rn, p: Er }, y = await at();
    y.C;
    var Wn = y.D, qe = a._malloc = y.E, B = a._free = y.F, kn = y.G;
    a.dynCall_v = y.I, a.dynCall_ii = y.J, a.dynCall_vi = y.K, a.dynCall_i = y.L, a.dynCall_iii = y.M, a.dynCall_viii = y.N, a.dynCall_fii = y.O, a.dynCall_viif = y.P, a.dynCall_viiii = y.Q, a.dynCall_viiiiii = y.R, a.dynCall_iiiiii = y.S, a.dynCall_viiiii = y.T, a.dynCall_iiiiiii = y.U, a.dynCall_iiiiiiii = y.V, a.dynCall_viiiiiii = y.W, a.dynCall_viiiiiiiiidi = y.X, a.dynCall_viiiiiiiidi = y.Y, a.dynCall_viiiiiiiiii = y.Z, a.dynCall_viiiiiiiii = y._, a.dynCall_viiiiiiii = y.$, a.dynCall_iiiii = y.aa, a.dynCall_iiii = y.ba;
    var Mn = y.ca, Dn = y.da, On = y.ea, xn = y.fa;
    function Je() {
      if (Q > 0) {
        fe = Je;
        return;
      }
      if (Yr(), Q > 0) {
        fe = Je;
        return;
      }
      function r() {
        var e;
        a.calledRun = !0, !Z && (Xr(), v(a), (e = a.onRuntimeInitialized) == null || e.call(a), qr());
      }
      a.setStatus ? (a.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => a.setStatus(""), 1), r();
      }, 1)) : r();
    }
    if (a.preInit)
      for (typeof a.preInit == "function" && (a.preInit = [a.preInit]); a.preInit.length > 0; )
        a.preInit.pop()();
    return Je(), s = S, s;
  };
})();
class oa extends ia {
  fetchSamModule(o) {
    return sa(o);
  }
  getSamWasmFilePath(o, s) {
    return `${o}/multi-range/wasm/${s}`;
  }
}
Qe(oa);
