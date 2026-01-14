const Fr = /* @__PURE__ */ Symbol("Comlink.proxy"), En = /* @__PURE__ */ Symbol("Comlink.endpoint"), An = /* @__PURE__ */ Symbol("Comlink.releaseProxy"), Re = /* @__PURE__ */ Symbol("Comlink.finalizer"), Fe = /* @__PURE__ */ Symbol("Comlink.thrown"), Mr = (l) => typeof l == "object" && l !== null || typeof l == "function", Rn = {
  canHandle: (l) => Mr(l) && l[Fr],
  serialize(l) {
    const { port1: s, port2: o } = new MessageChannel();
    return Ge(l, s), [o, [o]];
  },
  deserialize(l) {
    return l.start(), kn(l);
  }
}, Fn = {
  canHandle: (l) => Mr(l) && Fe in l,
  serialize({ value: l }) {
    let s;
    return l instanceof Error ? s = {
      isError: !0,
      value: {
        message: l.message,
        name: l.name,
        stack: l.stack
      }
    } : s = { isError: !1, value: l }, [s, []];
  },
  deserialize(l) {
    throw l.isError ? Object.assign(new Error(l.value.message), l.value) : l.value;
  }
}, Wr = /* @__PURE__ */ new Map([
  ["proxy", Rn],
  ["throw", Fn]
]);
function Mn(l, s) {
  for (const o of l)
    if (s === o || o === "*" || o instanceof RegExp && o.test(s))
      return !0;
  return !1;
}
function Ge(l, s = globalThis, o = ["*"]) {
  s.addEventListener("message", function a(v) {
    if (!v || !v.data)
      return;
    if (!Mn(o, v.origin)) {
      console.warn(`Invalid origin '${v.origin}' for comlink proxy`);
      return;
    }
    const { id: w, type: S, path: A } = Object.assign({ path: [] }, v.data), E = (v.data.argumentList || []).map(Q);
    let _;
    try {
      const $ = A.slice(0, -1).reduce((C, D) => C[D], l), b = A.reduce((C, D) => C[D], l);
      switch (S) {
        case "GET":
          _ = b;
          break;
        case "SET":
          $[A.slice(-1)[0]] = Q(v.data.value), _ = !0;
          break;
        case "APPLY":
          _ = b.apply($, E);
          break;
        case "CONSTRUCT":
          {
            const C = new b(...E);
            _ = Un(C);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: C, port2: D } = new MessageChannel();
            Ge(l, D), _ = In(C, [C]);
          }
          break;
        case "RELEASE":
          _ = void 0;
          break;
        default:
          return;
      }
    } catch ($) {
      _ = { value: $, [Fe]: 0 };
    }
    Promise.resolve(_).catch(($) => ({ value: $, [Fe]: 0 })).then(($) => {
      const [b, C] = ke($);
      s.postMessage(Object.assign(Object.assign({}, b), { id: w }), C), S === "RELEASE" && (s.removeEventListener("message", a), kr(s), Re in l && typeof l[Re] == "function" && l[Re]());
    }).catch(($) => {
      const [b, C] = ke({
        value: new TypeError("Unserializable return value"),
        [Fe]: 0
      });
      s.postMessage(Object.assign(Object.assign({}, b), { id: w }), C);
    });
  }), s.start && s.start();
}
function Wn(l) {
  return l.constructor.name === "MessagePort";
}
function kr(l) {
  Wn(l) && l.close();
}
function kn(l, s) {
  const o = /* @__PURE__ */ new Map();
  return l.addEventListener("message", function(v) {
    const { data: w } = v;
    if (!w || !w.id)
      return;
    const S = o.get(w.id);
    if (S)
      try {
        S(w);
      } finally {
        o.delete(w.id);
      }
  }), ze(l, o, [], s);
}
function Ae(l) {
  if (l)
    throw new Error("Proxy has been released and is not useable");
}
function Dr(l) {
  return ae(l, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    kr(l);
  });
}
const Me = /* @__PURE__ */ new WeakMap(), We = "FinalizationRegistry" in globalThis && new FinalizationRegistry((l) => {
  const s = (Me.get(l) || 0) - 1;
  Me.set(l, s), s === 0 && Dr(l);
});
function Dn(l, s) {
  const o = (Me.get(s) || 0) + 1;
  Me.set(s, o), We && We.register(l, s, l);
}
function On(l) {
  We && We.unregister(l);
}
function ze(l, s, o = [], a = function() {
}) {
  let v = !1;
  const w = new Proxy(a, {
    get(S, A) {
      if (Ae(v), A === An)
        return () => {
          On(w), Dr(l), s.clear(), v = !0;
        };
      if (A === "then") {
        if (o.length === 0)
          return { then: () => w };
        const E = ae(l, s, {
          type: "GET",
          path: o.map((_) => _.toString())
        }).then(Q);
        return E.then.bind(E);
      }
      return ze(l, s, [...o, A]);
    },
    set(S, A, E) {
      Ae(v);
      const [_, $] = ke(E);
      return ae(l, s, {
        type: "SET",
        path: [...o, A].map((b) => b.toString()),
        value: _
      }, $).then(Q);
    },
    apply(S, A, E) {
      Ae(v);
      const _ = o[o.length - 1];
      if (_ === En)
        return ae(l, s, {
          type: "ENDPOINT"
        }).then(Q);
      if (_ === "bind")
        return ze(l, s, o.slice(0, -1));
      const [$, b] = Ar(E);
      return ae(l, s, {
        type: "APPLY",
        path: o.map((C) => C.toString()),
        argumentList: $
      }, b).then(Q);
    },
    construct(S, A) {
      Ae(v);
      const [E, _] = Ar(A);
      return ae(l, s, {
        type: "CONSTRUCT",
        path: o.map(($) => $.toString()),
        argumentList: E
      }, _).then(Q);
    }
  });
  return Dn(w, l), w;
}
function xn(l) {
  return Array.prototype.concat.apply([], l);
}
function Ar(l) {
  const s = l.map(ke);
  return [s.map((o) => o[0]), xn(s.map((o) => o[1]))];
}
const Or = /* @__PURE__ */ new WeakMap();
function In(l, s) {
  return Or.set(l, s), l;
}
function Un(l) {
  return Object.assign(l, { [Fr]: !0 });
}
function ke(l) {
  for (const [s, o] of Wr)
    if (o.canHandle(l)) {
      const [a, v] = o.serialize(l);
      return [
        {
          type: "HANDLER",
          name: s,
          value: a
        },
        v
      ];
    }
  return [
    {
      type: "RAW",
      value: l
    },
    Or.get(l) || []
  ];
}
function Q(l) {
  switch (l.type) {
    case "HANDLER":
      return Wr.get(l.name).deserialize(l.value);
    case "RAW":
      return l.value;
  }
}
function ae(l, s, o, a) {
  return new Promise((v) => {
    const w = Hn();
    s.set(w, v), l.start && l.start(), l.postMessage(Object.assign({ id: w }, o), a);
  });
}
function Hn() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
class k extends Error {
  cause;
  constructor(s, o) {
    super(s), this.name = "AutoCaptureError", this.cause = o;
  }
  // Change this to Decorator when they will be in stable release
  static logError(s) {
  }
  static fromCameraError(s) {
    if (this.logError(s), s instanceof k)
      return s;
    let o;
    switch (s.name) {
      case "OverconstrainedError":
        o = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        o = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        o = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        o = "There is no camera available to you";
        break;
      default:
        o = "An unknown camera error has occurred";
        break;
    }
    return new k(o, s);
  }
  static fromError(s) {
    if (this.logError(s), s instanceof k)
      return s;
    const o = "An unexpected error has occurred";
    return new k(o);
  }
}
const Ye = (l) => Number.parseFloat(l.toFixed(3)), xr = (l, s) => Math.min(l, s);
function jn(l, s) {
  const o = xr(s.width, s.height);
  return Ye(l * o);
}
const fe = 1e3, Rr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Vn = (l) => JSON.parse(
  JSON.stringify(l, (s, o) => typeof o == "number" ? Ye(o) : o)
);
function Nn(l, s) {
  const { faceCenter: o, faceSize: a } = l, v = jn(a, s), w = {
    topLeft: {
      x: o.x - v,
      y: o.y - v
    },
    topRight: {
      x: o.x + v,
      y: o.y - v
    },
    bottomRight: {
      x: o.x + v,
      y: o.y + v
    },
    bottomLeft: {
      x: o.x - v,
      y: o.y + v
    }
  };
  return Vn(w);
}
const Bn = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), Ln = {
  RGBA: "RGBA"
};
class zn {
  #e;
  #r;
  #t;
  constructor(s, o) {
    this.#e = s, this.#r = this.allocate(o.length * o.BYTES_PER_ELEMENT), this.#t = this.allocate(o.length * o.BYTES_PER_ELEMENT);
  }
  get rgbaImagePointer() {
    return this.#r;
  }
  get bgr0ImagePointer() {
    return this.#t;
  }
  allocate(s) {
    return this.#e._malloc(s);
  }
  free() {
    this.#e._free(this.#r), this.#e._free(this.#t);
  }
  writeDataToMemory(s) {
    this.#e.HEAPU8.set(s, this.#r);
  }
}
class Gn {
  samWasmModule;
  getOverriddenModules(s, o) {
    return {
      locateFile: (a) => new URL(o || a, s).href
    };
  }
  async handleMissingOrInvalidSamModule(s, o) {
    try {
      const a = await fetch(s);
      if (!a.ok)
        throw new k(
          `The path to ${o} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${s}`
        );
      const v = await a.arrayBuffer();
      if (!WebAssembly.validate(v))
        throw new k(
          `The provided ${o} is not a valid WASM module. Please check provided path to wasm files. Current path is ${s}`
        );
    } catch (a) {
      if (a instanceof k)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), a;
    }
  }
  async getSamWasmFileName() {
    return await Bn() ? Rr.simd : Rr.sam;
  }
  async initSamModule(s, o) {
    if (this.samWasmModule)
      return;
    const a = await this.getSamWasmFileName(), v = this.getSamWasmFilePath(o, a);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(s, v)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(v, a), new k("Could not init detector.");
    }
  }
  terminateSamModule() {
    this.samWasmModule?.terminate();
  }
  async getSamVersion() {
    return (await this.samWasmModule?.getInfoString())?.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(s) {
    if (!this.samWasmModule)
      throw new k("SAM WASM module is not initialized");
    const o = new zn(this.samWasmModule, s);
    return o.writeDataToMemory(s), o;
  }
  convertToSamColorImage(s, o) {
    if (!this.samWasmModule)
      throw new k("SAM WASM module is not initialized");
    const a = this.writeImageToMemory(s);
    return this.samWasmModule.convertToSamColorImage(
      o.width,
      o.height,
      a.rgbaImagePointer,
      Ln.RGBA,
      a.bgr0ImagePointer
    ), a;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(s, o, a) {
    if (!this.samWasmModule)
      throw new k("SAM WASM module is not initialized");
    const v = this.convertToSamColorImage(s, o), { bottomLeft: w, topLeft: S, topRight: A } = a, E = [
      S.x,
      // x
      S.y,
      // y
      A.x - S.x,
      // width
      w.y - S.y
      // height
    ], { height: _, width: $, x: b, y: C } = await this.samWasmModule.selectDetailRegion(
      o.width,
      o.height,
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
  [Re]() {
    this.terminateSamModule();
  }
}
class Yn extends Gn {
  parseRawData(s, o) {
    const { brightness: a, sharpness: v } = s.params, { bottomRightX: w, bottomRightY: S, leftEye: A, mouth: E, rightEye: _, topLeftX: $, topLeftY: b } = s, C = this.normalizeRawFacePart(A), D = this.normalizeRawFacePart(_), ie = this.normalizeRawFacePart(E);
    return {
      confidence: s.confidence / fe,
      topLeft: {
        x: $,
        y: b
      },
      bottomRight: {
        x: w,
        y: S
      },
      faceCenter: this.calculateFaceCenter(C, D),
      faceSize: this.calculateFaceSize(C, D, o),
      leftEye: C,
      rightEye: D,
      mouth: ie,
      brightness: a / fe,
      sharpness: v / fe
    };
  }
  async detect(s, o, a) {
    if (!this.samWasmModule)
      throw new k("SAM WASM module is not initialized");
    const v = this.convertToSamColorImage(s, o), w = this.samWasmModule.detectFacePartsWithImageParameters(
      o.width,
      o.height,
      v.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return v.free(), this.parseRawData(w, a);
  }
  async getOptimalRegionForCompressionDetection(s, o, a) {
    const v = Nn(a, o);
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(s, o, v);
  }
  normalizeRawFacePart(s) {
    const { centerX: o, centerY: a, confidence: v, size: w, status: S } = s;
    return {
      center: {
        x: o,
        y: a
      },
      confidence: v / fe,
      status: S / fe,
      size: w
    };
  }
  calculateFaceSize(s, o, a) {
    if (s.confidence <= 0 || o.confidence <= 0)
      return 0;
    const v = this.getTwoPointsDistance(s.center, o.center), w = xr(a.width, a.height);
    return Ye(v / w);
  }
  calculateFaceCenter(s, o) {
    if (s.confidence <= 0 || o.confidence <= 0)
      return { x: 0, y: 0 };
    const a = this.getTwoPointsDistance(s.center, o.center), v = this.getPointBetweenTwoPoints(s.center, o.center);
    return {
      x: v.x,
      y: v.y + a / 4
      // calculation is taken from mobile team
    };
  }
  getTwoPointsDistance(s, o) {
    return Math.sqrt((s.x - o.x) ** 2 + (s.y - o.y) ** 2);
  }
  getPointBetweenTwoPoints(s, o) {
    return {
      x: (s.x + o.x) / 2,
      y: (s.y + o.y) / 2
    };
  }
}
var Xn = (() => {
  var l = import.meta.url;
  return (async function(s = {}) {
    var o, a = s, v, w, S = new Promise((r, e) => {
      v = r, w = e;
    }), A = typeof window == "object", E = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var _ = Object.assign({}, a), $ = (r, e) => {
      throw e;
    }, b = "";
    function C(r) {
      return a.locateFile ? a.locateFile(r, b) : b + r;
    }
    var D, ie;
    (A || E) && (E ? b = self.location.href : typeof document < "u" && document.currentScript && (b = document.currentScript.src), l && (b = l), b.startsWith("blob:") ? b = "" : b = b.slice(0, b.replace(/[?#].*/, "").lastIndexOf("/") + 1), E && (ie = (r) => {
      var e = new XMLHttpRequest();
      return e.open("GET", r, !1), e.responseType = "arraybuffer", e.send(null), new Uint8Array(e.response);
    }), D = async (r) => {
      if (Ze(r))
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
    var de = a.printErr || console.error.bind(console);
    Object.assign(a, _), _ = null, a.arguments && a.arguments, a.thisProgram && a.thisProgram;
    var ve = a.wasmBinary, me, J = !1, he, B, W, ee, se, L, T, Xe, qe, Je, Ke, Ze = (r) => r.startsWith("file://");
    function Qe() {
      var r = me.buffer;
      a.HEAP8 = B = new Int8Array(r), a.HEAP16 = ee = new Int16Array(r), a.HEAPU8 = W = new Uint8Array(r), a.HEAPU16 = se = new Uint16Array(r), a.HEAP32 = L = new Int32Array(r), a.HEAPU32 = T = new Uint32Array(r), a.HEAPF32 = Xe = new Float32Array(r), a.HEAPF64 = Ke = new Float64Array(r), a.HEAP64 = qe = new BigInt64Array(r), a.HEAPU64 = Je = new BigUint64Array(r);
    }
    function Ir() {
      if (a.preRun)
        for (typeof a.preRun == "function" && (a.preRun = [a.preRun]); a.preRun.length; )
          Jr(a.preRun.shift());
      rr(nr);
    }
    function Ur() {
      y.C();
    }
    function Hr() {
      if (a.postRun)
        for (typeof a.postRun == "function" && (a.postRun = [a.postRun]); a.postRun.length; )
          qr(a.postRun.shift());
      rr(tr);
    }
    var K = 0, oe = null;
    function jr(r) {
      K++, a.monitorRunDependencies?.(K);
    }
    function Vr(r) {
      if (K--, a.monitorRunDependencies?.(K), K == 0 && oe) {
        var e = oe;
        oe = null, e();
      }
    }
    function pe(r) {
      a.onAbort?.(r), r = "Aborted(" + r + ")", de(r), J = !0, r += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(r);
      throw w(e), e;
    }
    var De;
    function Nr() {
      return a.locateFile ? C("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Br(r) {
      if (r == De && ve)
        return new Uint8Array(ve);
      if (ie)
        return ie(r);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Lr(r) {
      if (!ve)
        try {
          var e = await D(r);
          return new Uint8Array(e);
        } catch {
        }
      return Br(r);
    }
    async function zr(r, e) {
      try {
        var t = await Lr(r), n = await WebAssembly.instantiate(t, e);
        return n;
      } catch (i) {
        de(`failed to asynchronously prepare wasm: ${i}`), pe(i);
      }
    }
    async function Gr(r, e, t) {
      if (!r && typeof WebAssembly.instantiateStreaming == "function" && !Ze(e))
        try {
          var n = fetch(e, { credentials: "same-origin" }), i = await WebAssembly.instantiateStreaming(n, t);
          return i;
        } catch (u) {
          de(`wasm streaming compile failed: ${u}`), de("falling back to ArrayBuffer instantiation");
        }
      return zr(e, t);
    }
    function Yr() {
      return { a: bn };
    }
    async function Xr() {
      function r(u, f) {
        return y = u.exports, y = m.instrumentWasmExports(y), me = y.B, Qe(), y.H, Vr(), y;
      }
      jr();
      function e(u) {
        return r(u.instance);
      }
      var t = Yr();
      if (a.instantiateWasm)
        return new Promise((u, f) => {
          a.instantiateWasm(t, (c, d) => {
            r(c), u(c.exports);
          });
        });
      De ??= Nr();
      try {
        var n = await Gr(ve, De, t), i = e(n);
        return i;
      } catch (u) {
        return w(u), Promise.reject(u);
      }
    }
    class er {
      name = "ExitStatus";
      constructor(e) {
        this.message = `Program terminated with exit(${e})`, this.status = e;
      }
    }
    var rr = (r) => {
      for (; r.length > 0; )
        r.shift()(a);
    }, tr = [], qr = (r) => tr.unshift(r), nr = [], Jr = (r) => nr.unshift(r), ar = a.noExitRuntime || !0;
    class Kr {
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
        e = e ? 1 : 0, B[this.ptr + 12] = e;
      }
      get_caught() {
        return B[this.ptr + 12] != 0;
      }
      set_rethrown(e) {
        e = e ? 1 : 0, B[this.ptr + 13] = e;
      }
      get_rethrown() {
        return B[this.ptr + 13] != 0;
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
    var ir = 0, Zr = (r, e, t) => {
      var n = new Kr(r);
      throw n.init(e, t), ir = r, ir;
    }, Qr = () => pe(""), ye = (r) => {
      if (r === null)
        return "null";
      var e = typeof r;
      return e === "object" || e === "array" || e === "function" ? r.toString() : "" + r;
    }, et = () => {
      for (var r = new Array(256), e = 0; e < 256; ++e)
        r[e] = String.fromCharCode(e);
      sr = r;
    }, sr, R = (r) => {
      for (var e = "", t = r; W[t]; )
        e += sr[W[t++]];
      return e;
    }, re = {}, Z = {}, ge = {}, te, g = (r) => {
      throw new te(r);
    }, or, we = (r) => {
      throw new or(r);
    }, ne = (r, e, t) => {
      r.forEach((c) => ge[c] = e);
      function n(c) {
        var d = t(c);
        d.length !== r.length && we("Mismatched type converter count");
        for (var p = 0; p < r.length; ++p)
          x(r[p], d[p]);
      }
      var i = new Array(e.length), u = [], f = 0;
      e.forEach((c, d) => {
        Z.hasOwnProperty(c) ? i[d] = Z[c] : (u.push(c), re.hasOwnProperty(c) || (re[c] = []), re[c].push(() => {
          i[d] = Z[c], ++f, f === u.length && n(i);
        }));
      }), u.length === 0 && n(i);
    };
    function rt(r, e, t = {}) {
      var n = e.name;
      if (r || g(`type "${n}" must have a positive integer typeid pointer`), Z.hasOwnProperty(r)) {
        if (t.ignoreDuplicateRegistrations)
          return;
        g(`Cannot register type '${n}' twice`);
      }
      if (Z[r] = e, delete ge[r], re.hasOwnProperty(r)) {
        var i = re[r];
        delete re[r], i.forEach((u) => u());
      }
    }
    function x(r, e, t = {}) {
      return rt(r, e, t);
    }
    var cr = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? (n) => B[n] : (n) => W[n];
        case 2:
          return t ? (n) => ee[n >> 1] : (n) => se[n >> 1];
        case 4:
          return t ? (n) => L[n >> 2] : (n) => T[n >> 2];
        case 8:
          return t ? (n) => qe[n >> 3] : (n) => Je[n >> 3];
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, tt = (r, e, t, n, i) => {
      e = R(e);
      var u = e.indexOf("u") != -1;
      x(r, { name: e, fromWireType: (f) => f, toWireType: function(f, c) {
        if (typeof c != "bigint" && typeof c != "number")
          throw new TypeError(`Cannot convert "${ye(c)}" to ${this.name}`);
        return typeof c == "number" && (c = BigInt(c)), c;
      }, argPackAdvance: U, readValueFromPointer: cr(e, t, !u), destructorFunction: null });
    }, U = 8, nt = (r, e, t, n) => {
      e = R(e), x(r, { name: e, fromWireType: function(i) {
        return !!i;
      }, toWireType: function(i, u) {
        return u ? t : n;
      }, argPackAdvance: U, readValueFromPointer: function(i) {
        return this.fromWireType(W[i]);
      }, destructorFunction: null });
    }, at = (r) => ({ count: r.count, deleteScheduled: r.deleteScheduled, preservePointerOnDelete: r.preservePointerOnDelete, ptr: r.ptr, ptrType: r.ptrType, smartPtr: r.smartPtr, smartPtrType: r.smartPtrType }), Oe = (r) => {
      function e(t) {
        return t.$$.ptrType.registeredClass.name;
      }
      g(e(r) + " instance already deleted");
    }, xe = !1, lr = (r) => {
    }, it = (r) => {
      r.smartPtr ? r.smartPtrType.rawDestructor(r.smartPtr) : r.ptrType.registeredClass.rawDestructor(r.ptr);
    }, ur = (r) => {
      r.count.value -= 1;
      var e = r.count.value === 0;
      e && it(r);
    }, fr = (r, e, t) => {
      if (e === t)
        return r;
      if (t.baseClass === void 0)
        return null;
      var n = fr(r, e, t.baseClass);
      return n === null ? null : t.downcast(n);
    }, dr = {}, st = {}, ot = (r, e) => {
      for (e === void 0 && g("ptr should not be undefined"); r.baseClass; )
        e = r.upcast(e), r = r.baseClass;
      return e;
    }, ct = (r, e) => (e = ot(r, e), st[e]), be = (r, e) => {
      (!e.ptrType || !e.ptr) && we("makeClassHandle requires ptr and ptrType");
      var t = !!e.smartPtrType, n = !!e.smartPtr;
      return t !== n && we("Both smartPtrType and smartPtr must be specified"), e.count = { value: 1 }, ce(Object.create(r, { $$: { value: e, writable: !0 } }));
    };
    function lt(r) {
      var e = this.getPointee(r);
      if (!e)
        return this.destructor(r), null;
      var t = ct(this.registeredClass, e);
      if (t !== void 0) {
        if (t.$$.count.value === 0)
          return t.$$.ptr = e, t.$$.smartPtr = r, t.clone();
        var n = t.clone();
        return this.destructor(r), n;
      }
      function i() {
        return this.isSmartPointer ? be(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: e, smartPtrType: this, smartPtr: r }) : be(this.registeredClass.instancePrototype, { ptrType: this, ptr: r });
      }
      var u = this.registeredClass.getActualType(e), f = dr[u];
      if (!f)
        return i.call(this);
      var c;
      this.isConst ? c = f.constPointerType : c = f.pointerType;
      var d = fr(e, this.registeredClass, c.registeredClass);
      return d === null ? i.call(this) : this.isSmartPointer ? be(c.registeredClass.instancePrototype, { ptrType: c, ptr: d, smartPtrType: this, smartPtr: r }) : be(c.registeredClass.instancePrototype, { ptrType: c, ptr: d });
    }
    var ce = (r) => typeof FinalizationRegistry > "u" ? (ce = (e) => e, r) : (xe = new FinalizationRegistry((e) => {
      ur(e.$$);
    }), ce = (e) => {
      var t = e.$$, n = !!t.smartPtr;
      if (n) {
        var i = { $$: t };
        xe.register(e, i, e);
      }
      return e;
    }, lr = (e) => xe.unregister(e), ce(r)), ut = () => {
      Object.assign(_e.prototype, { isAliasOf(r) {
        if (!(this instanceof _e) || !(r instanceof _e))
          return !1;
        var e = this.$$.ptrType.registeredClass, t = this.$$.ptr;
        r.$$ = r.$$;
        for (var n = r.$$.ptrType.registeredClass, i = r.$$.ptr; e.baseClass; )
          t = e.upcast(t), e = e.baseClass;
        for (; n.baseClass; )
          i = n.upcast(i), n = n.baseClass;
        return e === n && t === i;
      }, clone() {
        if (this.$$.ptr || Oe(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var r = ce(Object.create(Object.getPrototypeOf(this), { $$: { value: at(this.$$) } }));
        return r.$$.count.value += 1, r.$$.deleteScheduled = !1, r;
      }, delete() {
        this.$$.ptr || Oe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), lr(this), ur(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Oe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function _e() {
    }
    var Pe = (r, e) => Object.defineProperty(e, "name", { value: r }), ft = (r, e, t) => {
      if (r[e].overloadTable === void 0) {
        var n = r[e];
        r[e] = function(...i) {
          return r[e].overloadTable.hasOwnProperty(i.length) || g(`Function '${t}' called with an invalid number of arguments (${i.length}) - expects one of (${r[e].overloadTable})!`), r[e].overloadTable[i.length].apply(this, i);
        }, r[e].overloadTable = [], r[e].overloadTable[n.argCount] = n;
      }
    }, Ie = (r, e, t) => {
      a.hasOwnProperty(r) ? ((t === void 0 || a[r].overloadTable !== void 0 && a[r].overloadTable[t] !== void 0) && g(`Cannot register public name '${r}' twice`), ft(a, r, r), a[r].overloadTable.hasOwnProperty(t) && g(`Cannot register multiple overloads of a function with the same number of arguments (${t})!`), a[r].overloadTable[t] = e) : (a[r] = e, a[r].argCount = t);
    }, dt = 48, vt = 57, mt = (r) => {
      r = r.replace(/[^a-zA-Z0-9_]/g, "$");
      var e = r.charCodeAt(0);
      return e >= dt && e <= vt ? `_${r}` : r;
    };
    function ht(r, e, t, n, i, u, f, c) {
      this.name = r, this.constructor = e, this.instancePrototype = t, this.rawDestructor = n, this.baseClass = i, this.getActualType = u, this.upcast = f, this.downcast = c, this.pureVirtualFunctions = [];
    }
    var $e = (r, e, t) => {
      for (; e !== t; )
        e.upcast || g(`Expected null or instance of ${t.name}, got an instance of ${e.name}`), r = e.upcast(r), e = e.baseClass;
      return r;
    };
    function pt(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${ye(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = $e(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function yt(r, e) {
      var t;
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), this.isSmartPointer ? (t = this.rawConstructor(), r !== null && r.push(this.rawDestructor, t), t) : 0;
      (!e || !e.$$) && g(`Cannot pass "${ye(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
      var n = e.$$.ptrType.registeredClass;
      if (t = $e(e.$$.ptr, n, this.registeredClass), this.isSmartPointer)
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
    function gt(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${ye(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.ptrType.name} to parameter type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = $e(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function Ce(r) {
      return this.fromWireType(T[r >> 2]);
    }
    var wt = () => {
      Object.assign(Te.prototype, { getPointee(r) {
        return this.rawGetPointee && (r = this.rawGetPointee(r)), r;
      }, destructor(r) {
        this.rawDestructor?.(r);
      }, argPackAdvance: U, readValueFromPointer: Ce, fromWireType: lt });
    };
    function Te(r, e, t, n, i, u, f, c, d, p, h) {
      this.name = r, this.registeredClass = e, this.isReference = t, this.isConst = n, this.isSmartPointer = i, this.pointeeType = u, this.sharingPolicy = f, this.rawGetPointee = c, this.rawConstructor = d, this.rawShare = p, this.rawDestructor = h, !i && e.baseClass === void 0 ? n ? (this.toWireType = pt, this.destructorFunction = null) : (this.toWireType = gt, this.destructorFunction = null) : this.toWireType = yt;
    }
    var vr = (r, e, t) => {
      a.hasOwnProperty(r) || we("Replacing nonexistent public symbol"), a[r].overloadTable !== void 0 && t !== void 0 ? a[r].overloadTable[t] = e : (a[r] = e, a[r].argCount = t);
    }, bt = (r, e, t) => {
      r = r.replace(/p/g, "i");
      var n = a["dynCall_" + r];
      return n(e, ...t);
    }, _t = (r, e, t = []) => {
      var n = bt(r, e, t);
      return n;
    }, Pt = (r, e) => (...t) => _t(r, e, t), z = (r, e) => {
      r = R(r);
      function t() {
        return Pt(r, e);
      }
      var n = t();
      return typeof n != "function" && g(`unknown function pointer with signature ${r}: ${e}`), n;
    }, $t = (r, e) => {
      var t = Pe(e, function(n) {
        this.name = e, this.message = n;
        var i = new Error(n).stack;
        i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return t.prototype = Object.create(r.prototype), t.prototype.constructor = t, t.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, t;
    }, mr, hr = (r) => {
      var e = _n(r), t = R(e);
      return N(e), t;
    }, le = (r, e) => {
      var t = [], n = {};
      function i(u) {
        if (!n[u] && !Z[u]) {
          if (ge[u]) {
            ge[u].forEach(i);
            return;
          }
          t.push(u), n[u] = !0;
        }
      }
      throw e.forEach(i), new mr(`${r}: ` + t.map(hr).join([", "]));
    }, Ct = (r, e, t, n, i, u, f, c, d, p, h, P, F) => {
      h = R(h), u = z(i, u), c &&= z(f, c), p &&= z(d, p), F = z(P, F);
      var H = mt(h);
      Ie(H, function() {
        le(`Cannot construct ${h} due to unbound types`, [n]);
      }), ne([r, e, t], n ? [n] : [], (j) => {
        j = j[0];
        var Y, O;
        n ? (Y = j.registeredClass, O = Y.instancePrototype) : O = _e.prototype;
        var V = Pe(h, function(...Le) {
          if (Object.getPrototypeOf(this) !== X)
            throw new te("Use 'new' to construct " + h);
          if (M.constructor_body === void 0)
            throw new te(h + " has no accessible constructor");
          var Er = M.constructor_body[Le.length];
          if (Er === void 0)
            throw new te(`Tried to invoke ctor of ${h} with invalid number of parameters (${Le.length}) - expected (${Object.keys(M.constructor_body).toString()}) parameters instead!`);
          return Er.apply(this, Le);
        }), X = Object.create(O, { constructor: { value: V } });
        V.prototype = X;
        var M = new ht(h, V, X, F, Y, u, c, p);
        M.baseClass && (M.baseClass.__derivedClasses ??= [], M.baseClass.__derivedClasses.push(M));
        var q = new Te(h, M, !0, !1, !1), Ee = new Te(h + "*", M, !1, !1, !1), Sr = new Te(h + " const*", M, !1, !0, !1);
        return dr[r] = { pointerType: Ee, constPointerType: Sr }, vr(H, V), [q, Ee, Sr];
      });
    }, pr = (r, e) => {
      for (var t = [], n = 0; n < r; n++)
        t.push(T[e + n * 4 >> 2]);
      return t;
    }, Ue = (r) => {
      for (; r.length; ) {
        var e = r.pop(), t = r.pop();
        t(e);
      }
    };
    function Tt(r) {
      for (var e = 1; e < r.length; ++e)
        if (r[e] !== null && r[e].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Se = (r) => {
      try {
        return r();
      } catch (e) {
        pe(e);
      }
    }, yr = (r) => {
      if (r instanceof er || r == "unwind")
        return he;
      $(1, r);
    }, gr = 0, wr = () => ar || gr > 0, br = (r) => {
      he = r, wr() || (a.onExit?.(r), J = !0), $(r, new er(r));
    }, St = (r, e) => {
      he = r, br(r);
    }, Et = St, At = () => {
      if (!wr())
        try {
          Et(he);
        } catch (r) {
          yr(r);
        }
    }, _r = (r) => {
      if (!J)
        try {
          r(), At();
        } catch (e) {
          yr(e);
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
            J || (m.exportCallStack.pop(), m.maybeStopUnwind());
          }
        } : e[t] = n;
      return e;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(r) {
      var e = m.callStackNameToId[r];
      return e === void 0 && (e = m.callStackId++, m.callStackNameToId[r] = e, m.callStackIdToName[e] = r), e;
    }, maybeStopUnwind() {
      m.currData && m.state === m.State.Unwinding && m.exportCallStack.length === 0 && (m.state = m.State.Normal, Se(Cn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((r, e) => {
        m.asyncPromiseHandlers = { resolve: r, reject: e };
      });
    }, allocateData() {
      var r = Ne(12 + m.StackSize);
      return m.setDataHeader(r, r + 12, m.StackSize), m.setDataRewindFunc(r), r;
    }, setDataHeader(r, e, t) {
      T[r >> 2] = e, T[r + 4 >> 2] = e + t;
    }, setDataRewindFunc(r) {
      var e = m.exportCallStack[0], t = m.getCallStackId(e);
      L[r + 8 >> 2] = t;
    }, getDataRewindFuncName(r) {
      var e = L[r + 8 >> 2], t = m.callStackIdToName[e];
      return t;
    }, getDataRewindFunc(r) {
      var e = y[r];
      return e;
    }, doRewind(r) {
      var e = m.getDataRewindFuncName(r), t = m.getDataRewindFunc(e);
      return t();
    }, handleSleep(r) {
      if (!J) {
        if (m.state === m.State.Normal) {
          var e = !1, t = !1;
          r((n = 0) => {
            if (!J && (m.handleSleepReturnValue = n, e = !0, !!t)) {
              m.state = m.State.Rewinding, Se(() => Tn(m.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var i, u = !1;
              try {
                i = m.doRewind(m.currData);
              } catch (d) {
                i = d, u = !0;
              }
              var f = !1;
              if (!m.currData) {
                var c = m.asyncPromiseHandlers;
                c && (m.asyncPromiseHandlers = null, (u ? c.reject : c.resolve)(i), f = !0);
              }
              if (u && !f)
                throw i;
            }
          }), t = !0, e || (m.state = m.State.Unwinding, m.currData = m.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Se(() => $n(m.currData)));
        } else m.state === m.State.Rewinding ? (m.state = m.State.Normal, Se(Sn), N(m.currData), m.currData = null, m.sleepCallbacks.forEach(_r)) : pe(`invalid state: ${m.state}`);
        return m.handleSleepReturnValue;
      }
    }, handleAsync(r) {
      return m.handleSleep((e) => {
        r().then(e);
      });
    } };
    function Pr(r, e, t, n, i, u) {
      var f = e.length;
      f < 2 && g("argTypes array size mismatch! Must at least get return value and 'this' types!"), e[1];
      var c = Tt(e), d = e[0].name !== "void", p = f - 2, h = new Array(p), P = [], F = [], H = function(...j) {
        F.length = 0;
        var Y;
        P.length = 1, P[0] = i;
        for (var O = 0; O < p; ++O)
          h[O] = e[O + 2].toWireType(F, j[O]), P.push(h[O]);
        var V = n(...P);
        function X(M) {
          if (c)
            Ue(F);
          else
            for (var q = 2; q < e.length; q++) {
              var Ee = q === 1 ? Y : h[q - 2];
              e[q].destructorFunction !== null && e[q].destructorFunction(Ee);
            }
          if (d)
            return e[0].fromWireType(M);
        }
        return m.currData ? m.whenDone().then(X) : X(V);
      };
      return Pe(r, H);
    }
    var Rt = (r, e, t, n, i, u) => {
      var f = pr(e, t);
      i = z(n, i), ne([], [r], (c) => {
        c = c[0];
        var d = `constructor ${c.name}`;
        if (c.registeredClass.constructor_body === void 0 && (c.registeredClass.constructor_body = []), c.registeredClass.constructor_body[e - 1] !== void 0)
          throw new te(`Cannot register multiple constructors with identical number of parameters (${e - 1}) for class '${c.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return c.registeredClass.constructor_body[e - 1] = () => {
          le(`Cannot construct ${c.name} due to unbound types`, f);
        }, ne([], f, (p) => (p.splice(1, 0, null), c.registeredClass.constructor_body[e - 1] = Pr(d, p, null, i, u), [])), [];
      });
    }, $r = (r, e, t) => (r instanceof Object || g(`${t} with invalid "this": ${r}`), r instanceof e.registeredClass.constructor || g(`${t} incompatible with "this" of type ${r.constructor.name}`), r.$$.ptr || g(`cannot call emscripten binding method ${t} on deleted object`), $e(r.$$.ptr, r.$$.ptrType.registeredClass, e.registeredClass)), Ft = (r, e, t, n, i, u, f, c, d, p) => {
      e = R(e), i = z(n, i), ne([], [r], (h) => {
        h = h[0];
        var P = `${h.name}.${e}`, F = { get() {
          le(`Cannot access ${P} due to unbound types`, [t, f]);
        }, enumerable: !0, configurable: !0 };
        return d ? F.set = () => le(`Cannot access ${P} due to unbound types`, [t, f]) : F.set = (H) => g(P + " is a read-only property"), Object.defineProperty(h.registeredClass.instancePrototype, e, F), ne([], d ? [t, f] : [t], (H) => {
          var j = H[0], Y = { get() {
            var V = $r(this, h, P + " getter");
            return j.fromWireType(i(u, V));
          }, enumerable: !0 };
          if (d) {
            d = z(c, d);
            var O = H[1];
            Y.set = function(V) {
              var X = $r(this, h, P + " setter"), M = [];
              d(p, X, O.toWireType(M, V)), Ue(M);
            };
          }
          return Object.defineProperty(h.registeredClass.instancePrototype, e, Y), [];
        }), [];
      });
    }, He = [], G = [], je = (r) => {
      r > 9 && --G[r + 1] === 0 && (G[r] = void 0, He.push(r));
    }, Mt = () => G.length / 2 - 5 - He.length, Wt = () => {
      G.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), a.count_emval_handles = Mt;
    }, I = { toValue: (r) => (r || g("Cannot use deleted val. handle = " + r), G[r]), toHandle: (r) => {
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
          const e = He.pop() || G.length;
          return G[e] = r, G[e + 1] = 1, e;
        }
      }
    } }, kt = { name: "emscripten::val", fromWireType: (r) => {
      var e = I.toValue(r);
      return je(r), e;
    }, toWireType: (r, e) => I.toHandle(e), argPackAdvance: U, readValueFromPointer: Ce, destructorFunction: null }, Dt = (r) => x(r, kt), Ot = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? function(n) {
            return this.fromWireType(B[n]);
          } : function(n) {
            return this.fromWireType(W[n]);
          };
        case 2:
          return t ? function(n) {
            return this.fromWireType(ee[n >> 1]);
          } : function(n) {
            return this.fromWireType(se[n >> 1]);
          };
        case 4:
          return t ? function(n) {
            return this.fromWireType(L[n >> 2]);
          } : function(n) {
            return this.fromWireType(T[n >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, xt = (r, e, t, n) => {
      e = R(e);
      function i() {
      }
      i.values = {}, x(r, { name: e, constructor: i, fromWireType: function(u) {
        return this.constructor.values[u];
      }, toWireType: (u, f) => f.value, argPackAdvance: U, readValueFromPointer: Ot(e, t, n), destructorFunction: null }), Ie(e, i);
    }, Ve = (r, e) => {
      var t = Z[r];
      return t === void 0 && g(`${e} has unknown type ${hr(r)}`), t;
    }, It = (r, e, t) => {
      var n = Ve(r, "enum");
      e = R(e);
      var i = n.constructor, u = Object.create(n.constructor.prototype, { value: { value: t }, constructor: { value: Pe(`${n.name}_${e}`, function() {
      }) } });
      i.values[t] = u, i[e] = u;
    }, Ut = (r, e) => {
      switch (e) {
        case 4:
          return function(t) {
            return this.fromWireType(Xe[t >> 2]);
          };
        case 8:
          return function(t) {
            return this.fromWireType(Ke[t >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${e}): ${r}`);
      }
    }, Ht = (r, e, t) => {
      e = R(e), x(r, { name: e, fromWireType: (n) => n, toWireType: (n, i) => i, argPackAdvance: U, readValueFromPointer: Ut(e, t), destructorFunction: null });
    }, jt = (r) => {
      r = r.trim();
      const e = r.indexOf("(");
      return e === -1 ? r : r.slice(0, e);
    }, Vt = (r, e, t, n, i, u, f, c) => {
      var d = pr(e, t);
      r = R(r), r = jt(r), i = z(n, i), Ie(r, function() {
        le(`Cannot call ${r} due to unbound types`, d);
      }, e - 1), ne([], d, (p) => {
        var h = [p[0], null].concat(p.slice(1));
        return vr(r, Pr(r, h, null, i, u), e - 1), [];
      });
    }, Nt = (r, e, t, n, i) => {
      e = R(e);
      var u = (h) => h;
      if (n === 0) {
        var f = 32 - 8 * t;
        u = (h) => h << f >>> f;
      }
      var c = e.includes("unsigned"), d = (h, P) => {
      }, p;
      c ? p = function(h, P) {
        return d(P, this.name), P >>> 0;
      } : p = function(h, P) {
        return d(P, this.name), P;
      }, x(r, { name: e, fromWireType: u, toWireType: p, argPackAdvance: U, readValueFromPointer: cr(e, t, n !== 0), destructorFunction: null });
    }, Bt = (r, e, t) => {
      var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], i = n[e];
      function u(f) {
        var c = T[f >> 2], d = T[f + 4 >> 2];
        return new i(B.buffer, d, c);
      }
      t = R(t), x(r, { name: t, fromWireType: u, argPackAdvance: U, readValueFromPointer: u }, { ignoreDuplicateRegistrations: !0 });
    }, Lt = (r, e, t, n) => {
      if (!(n > 0)) return 0;
      for (var i = t, u = t + n - 1, f = 0; f < r.length; ++f) {
        var c = r.charCodeAt(f);
        if (c >= 55296 && c <= 57343) {
          var d = r.charCodeAt(++f);
          c = 65536 + ((c & 1023) << 10) | d & 1023;
        }
        if (c <= 127) {
          if (t >= u) break;
          e[t++] = c;
        } else if (c <= 2047) {
          if (t + 1 >= u) break;
          e[t++] = 192 | c >> 6, e[t++] = 128 | c & 63;
        } else if (c <= 65535) {
          if (t + 2 >= u) break;
          e[t++] = 224 | c >> 12, e[t++] = 128 | c >> 6 & 63, e[t++] = 128 | c & 63;
        } else {
          if (t + 3 >= u) break;
          e[t++] = 240 | c >> 18, e[t++] = 128 | c >> 12 & 63, e[t++] = 128 | c >> 6 & 63, e[t++] = 128 | c & 63;
        }
      }
      return e[t] = 0, t - i;
    }, zt = (r, e, t) => Lt(r, W, e, t), Gt = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n <= 127 ? e++ : n <= 2047 ? e += 2 : n >= 55296 && n <= 57343 ? (e += 4, ++t) : e += 3;
      }
      return e;
    }, Cr = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Yt = (r, e = 0, t = NaN) => {
      for (var n = e + t, i = e; r[i] && !(i >= n); ) ++i;
      if (i - e > 16 && r.buffer && Cr)
        return Cr.decode(r.subarray(e, i));
      for (var u = ""; e < i; ) {
        var f = r[e++];
        if (!(f & 128)) {
          u += String.fromCharCode(f);
          continue;
        }
        var c = r[e++] & 63;
        if ((f & 224) == 192) {
          u += String.fromCharCode((f & 31) << 6 | c);
          continue;
        }
        var d = r[e++] & 63;
        if ((f & 240) == 224 ? f = (f & 15) << 12 | c << 6 | d : f = (f & 7) << 18 | c << 12 | d << 6 | r[e++] & 63, f < 65536)
          u += String.fromCharCode(f);
        else {
          var p = f - 65536;
          u += String.fromCharCode(55296 | p >> 10, 56320 | p & 1023);
        }
      }
      return u;
    }, Xt = (r, e) => r ? Yt(W, r, e) : "", qt = (r, e) => {
      e = R(e), x(r, { name: e, fromWireType(t) {
        for (var n = T[t >> 2], i = t + 4, u, f, c = i, f = 0; f <= n; ++f) {
          var d = i + f;
          if (f == n || W[d] == 0) {
            var p = d - c, h = Xt(c, p);
            u === void 0 ? u = h : (u += "\0", u += h), c = d + 1;
          }
        }
        return N(t), u;
      }, toWireType(t, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var i, u = typeof n == "string";
        u || n instanceof Uint8Array || n instanceof Uint8ClampedArray || n instanceof Int8Array || g("Cannot pass non-string to std::string"), u ? i = Gt(n) : i = n.length;
        var f = Ne(4 + i + 1), c = f + 4;
        if (T[f >> 2] = i, u)
          zt(n, c, i + 1);
        else if (u)
          for (var d = 0; d < i; ++d) {
            var p = n.charCodeAt(d);
            p > 255 && (N(f), g("String has UTF-16 code units that do not fit in 8 bits")), W[c + d] = p;
          }
        else
          for (var d = 0; d < i; ++d)
            W[c + d] = n[d];
        return t !== null && t.push(N, f), f;
      }, argPackAdvance: U, readValueFromPointer: Ce, destructorFunction(t) {
        N(t);
      } });
    }, Tr = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Jt = (r, e) => {
      for (var t = r, n = t >> 1, i = n + e / 2; !(n >= i) && se[n]; ) ++n;
      if (t = n << 1, t - r > 32 && Tr) return Tr.decode(W.subarray(r, t));
      for (var u = "", f = 0; !(f >= e / 2); ++f) {
        var c = ee[r + f * 2 >> 1];
        if (c == 0) break;
        u += String.fromCharCode(c);
      }
      return u;
    }, Kt = (r, e, t) => {
      if (t ??= 2147483647, t < 2) return 0;
      t -= 2;
      for (var n = e, i = t < r.length * 2 ? t / 2 : r.length, u = 0; u < i; ++u) {
        var f = r.charCodeAt(u);
        ee[e >> 1] = f, e += 2;
      }
      return ee[e >> 1] = 0, e - n;
    }, Zt = (r) => r.length * 2, Qt = (r, e) => {
      for (var t = 0, n = ""; !(t >= e / 4); ) {
        var i = L[r + t * 4 >> 2];
        if (i == 0) break;
        if (++t, i >= 65536) {
          var u = i - 65536;
          n += String.fromCharCode(55296 | u >> 10, 56320 | u & 1023);
        } else
          n += String.fromCharCode(i);
      }
      return n;
    }, en = (r, e, t) => {
      if (t ??= 2147483647, t < 4) return 0;
      for (var n = e, i = n + t - 4, u = 0; u < r.length; ++u) {
        var f = r.charCodeAt(u);
        if (f >= 55296 && f <= 57343) {
          var c = r.charCodeAt(++u);
          f = 65536 + ((f & 1023) << 10) | c & 1023;
        }
        if (L[e >> 2] = f, e += 4, e + 4 > i) break;
      }
      return L[e >> 2] = 0, e - n;
    }, rn = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n >= 55296 && n <= 57343 && ++t, e += 4;
      }
      return e;
    }, tn = (r, e, t) => {
      t = R(t);
      var n, i, u, f;
      e === 2 ? (n = Jt, i = Kt, f = Zt, u = (c) => se[c >> 1]) : e === 4 && (n = Qt, i = en, f = rn, u = (c) => T[c >> 2]), x(r, { name: t, fromWireType: (c) => {
        for (var d = T[c >> 2], p, h = c + 4, P = 0; P <= d; ++P) {
          var F = c + 4 + P * e;
          if (P == d || u(F) == 0) {
            var H = F - h, j = n(h, H);
            p === void 0 ? p = j : (p += "\0", p += j), h = F + e;
          }
        }
        return N(c), p;
      }, toWireType: (c, d) => {
        typeof d != "string" && g(`Cannot pass non-string to C++ string type ${t}`);
        var p = f(d), h = Ne(4 + p + e);
        return T[h >> 2] = p / e, i(d, h + 4, p + e), c !== null && c.push(N, h), h;
      }, argPackAdvance: U, readValueFromPointer: Ce, destructorFunction(c) {
        N(c);
      } });
    }, nn = (r, e) => {
      e = R(e), x(r, { isVoid: !0, name: e, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (t, n) => {
      } });
    }, an = () => {
      ar = !1, gr = 0;
    }, sn = (r, e, t) => {
      var n = [], i = r.toWireType(n, t);
      return n.length && (T[e >> 2] = I.toHandle(n)), i;
    }, on = (r, e, t) => (r = I.toValue(r), e = Ve(e, "emval::as"), sn(e, t, r)), cn = (r, e) => (r = I.toValue(r), e = I.toValue(e), I.toHandle(r[e])), ln = {}, un = (r) => {
      var e = ln[r];
      return e === void 0 ? R(r) : e;
    }, fn = (r) => I.toHandle(un(r)), dn = (r) => {
      var e = I.toValue(r);
      Ue(e), je(r);
    }, vn = (r, e) => {
      r = Ve(r, "_emval_take_value");
      var t = r.readValueFromPointer(e);
      return I.toHandle(t);
    }, ue = {}, mn = () => performance.now(), hn = (r, e) => {
      if (ue[r] && (clearTimeout(ue[r].id), delete ue[r]), !e) return 0;
      var t = setTimeout(() => {
        delete ue[r], _r(() => Pn(r, mn()));
      }, e);
      return ue[r] = { id: t, timeout_ms: e }, 0;
    }, pn = () => 2147483648, yn = (r, e) => Math.ceil(r / e) * e, gn = (r) => {
      var e = me.buffer, t = (r - e.byteLength + 65535) / 65536 | 0;
      try {
        return me.grow(t), Qe(), 1;
      } catch {
      }
    }, wn = (r) => {
      var e = W.length;
      r >>>= 0;
      var t = pn();
      if (r > t)
        return !1;
      for (var n = 1; n <= 4; n *= 2) {
        var i = e * (1 + 0.2 / n);
        i = Math.min(i, r + 100663296);
        var u = Math.min(t, yn(Math.max(r, i), 65536)), f = gn(u);
        if (f)
          return !0;
      }
      return !1;
    };
    et(), te = a.BindingError = class extends Error {
      constructor(e) {
        super(e), this.name = "BindingError";
      }
    }, or = a.InternalError = class extends Error {
      constructor(e) {
        super(e), this.name = "InternalError";
      }
    }, ut(), wt(), mr = a.UnboundTypeError = $t(Error, "UnboundTypeError"), Wt();
    var bn = { i: Zr, s: Qr, n: tt, w: nt, f: Ct, d: Rt, a: Ft, u: Dt, l: xt, g: It, m: Ht, b: Vt, e: Nt, c: Bt, v: qt, h: tn, x: nn, q: an, j: on, y: je, k: cn, o: fn, A: dn, z: vn, r: hn, t: wn, p: br }, y = await Xr();
    y.C;
    var _n = y.D, Ne = a._malloc = y.E, N = a._free = y.F, Pn = y.G;
    a.dynCall_v = y.I, a.dynCall_ii = y.J, a.dynCall_vi = y.K, a.dynCall_i = y.L, a.dynCall_iii = y.M, a.dynCall_viii = y.N, a.dynCall_fii = y.O, a.dynCall_viif = y.P, a.dynCall_viiii = y.Q, a.dynCall_viiiiii = y.R, a.dynCall_iiiiii = y.S, a.dynCall_viiiii = y.T, a.dynCall_iiiiiii = y.U, a.dynCall_iiiiiiii = y.V, a.dynCall_viiiiiii = y.W, a.dynCall_viiiiiiiiidi = y.X, a.dynCall_viiiiiiiidi = y.Y, a.dynCall_viiiiiiiiii = y.Z, a.dynCall_viiiiiiiii = y._, a.dynCall_viiiiiiii = y.$, a.dynCall_iiiii = y.aa, a.dynCall_iiii = y.ba;
    var $n = y.ca, Cn = y.da, Tn = y.ea, Sn = y.fa;
    function Be() {
      if (K > 0) {
        oe = Be;
        return;
      }
      if (Ir(), K > 0) {
        oe = Be;
        return;
      }
      function r() {
        a.calledRun = !0, !J && (Ur(), v(a), a.onRuntimeInitialized?.(), Hr());
      }
      a.setStatus ? (a.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => a.setStatus(""), 1), r();
      }, 1)) : r();
    }
    if (a.preInit)
      for (typeof a.preInit == "function" && (a.preInit = [a.preInit]); a.preInit.length > 0; )
        a.preInit.pop()();
    return Be(), o = S, o;
  });
})();
class qn extends Yn {
  fetchSamModule(s) {
    return Xn(s);
  }
  getSamWasmFilePath(s, o) {
    return `${s}/smile/wasm/${o}`;
  }
}
Ge(qn);
