const Fr = /* @__PURE__ */ Symbol("Comlink.proxy"), An = /* @__PURE__ */ Symbol("Comlink.endpoint"), Rn = /* @__PURE__ */ Symbol("Comlink.releaseProxy"), Re = /* @__PURE__ */ Symbol("Comlink.finalizer"), Me = /* @__PURE__ */ Symbol("Comlink.thrown"), kr = (c) => typeof c == "object" && c !== null || typeof c == "function", Mn = {
  canHandle: (c) => kr(c) && c[Fr],
  serialize(c) {
    const { port1: s, port2: u } = new MessageChannel();
    return qe(c, s), [u, [u]];
  },
  deserialize(c) {
    return c.start(), On(c);
  }
}, Wn = {
  canHandle: (c) => kr(c) && Me in c,
  serialize({ value: c }) {
    let s;
    return c instanceof Error ? s = {
      isError: !0,
      value: {
        message: c.message,
        name: c.name,
        stack: c.stack
      }
    } : s = { isError: !1, value: c }, [s, []];
  },
  deserialize(c) {
    throw c.isError ? Object.assign(new Error(c.value.message), c.value) : c.value;
  }
}, Or = /* @__PURE__ */ new Map([
  ["proxy", Mn],
  ["throw", Wn]
]);
function Fn(c, s) {
  for (const u of c)
    if (s === u || u === "*" || u instanceof RegExp && u.test(s))
      return !0;
  return !1;
}
function qe(c, s = globalThis, u = ["*"]) {
  s.addEventListener("message", function a(h) {
    if (!h || !h.data)
      return;
    if (!Fn(u, h.origin)) {
      console.warn(`Invalid origin '${h.origin}' for comlink proxy`);
      return;
    }
    const { id: w, type: C, path: S } = Object.assign({ path: [] }, h.data), E = (h.data.argumentList || []).map(Q);
    let P;
    try {
      const T = S.slice(0, -1).reduce((A, L) => A[L], c), b = S.reduce((A, L) => A[L], c);
      switch (C) {
        case "GET":
          P = b;
          break;
        case "SET":
          T[S.slice(-1)[0]] = Q(h.data.value), P = !0;
          break;
        case "APPLY":
          P = b.apply(T, E);
          break;
        case "CONSTRUCT":
          {
            const A = new b(...E);
            P = Un(A);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: A, port2: L } = new MessageChannel();
            qe(c, L), P = Hn(A, [A]);
          }
          break;
        case "RELEASE":
          P = void 0;
          break;
        default:
          return;
      }
    } catch (T) {
      P = { value: T, [Me]: 0 };
    }
    Promise.resolve(P).catch((T) => ({ value: T, [Me]: 0 })).then((T) => {
      const [b, A] = ke(T);
      s.postMessage(Object.assign(Object.assign({}, b), { id: w }), A), C === "RELEASE" && (s.removeEventListener("message", a), Dr(s), Re in c && typeof c[Re] == "function" && c[Re]());
    }).catch((T) => {
      const [b, A] = ke({
        value: new TypeError("Unserializable return value"),
        [Me]: 0
      });
      s.postMessage(Object.assign(Object.assign({}, b), { id: w }), A);
    });
  }), s.start && s.start();
}
function kn(c) {
  return c.constructor.name === "MessagePort";
}
function Dr(c) {
  kn(c) && c.close();
}
function On(c, s) {
  const u = /* @__PURE__ */ new Map();
  return c.addEventListener("message", function(h) {
    const { data: w } = h;
    if (!w || !w.id)
      return;
    const C = u.get(w.id);
    if (C)
      try {
        C(w);
      } finally {
        u.delete(w.id);
      }
  }), Ge(c, u, [], s);
}
function Ee(c) {
  if (c)
    throw new Error("Proxy has been released and is not useable");
}
function Ir(c) {
  return ae(c, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    Dr(c);
  });
}
const We = /* @__PURE__ */ new WeakMap(), Fe = "FinalizationRegistry" in globalThis && new FinalizationRegistry((c) => {
  const s = (We.get(c) || 0) - 1;
  We.set(c, s), s === 0 && Ir(c);
});
function Dn(c, s) {
  const u = (We.get(s) || 0) + 1;
  We.set(s, u), Fe && Fe.register(c, s, c);
}
function In(c) {
  Fe && Fe.unregister(c);
}
function Ge(c, s, u = [], a = function() {
}) {
  let h = !1;
  const w = new Proxy(a, {
    get(C, S) {
      if (Ee(h), S === Rn)
        return () => {
          In(w), Ir(c), s.clear(), h = !0;
        };
      if (S === "then") {
        if (u.length === 0)
          return { then: () => w };
        const E = ae(c, s, {
          type: "GET",
          path: u.map((P) => P.toString())
        }).then(Q);
        return E.then.bind(E);
      }
      return Ge(c, s, [...u, S]);
    },
    set(C, S, E) {
      Ee(h);
      const [P, T] = ke(E);
      return ae(c, s, {
        type: "SET",
        path: [...u, S].map((b) => b.toString()),
        value: P
      }, T).then(Q);
    },
    apply(C, S, E) {
      Ee(h);
      const P = u[u.length - 1];
      if (P === An)
        return ae(c, s, {
          type: "ENDPOINT"
        }).then(Q);
      if (P === "bind")
        return Ge(c, s, u.slice(0, -1));
      const [T, b] = Ar(E);
      return ae(c, s, {
        type: "APPLY",
        path: u.map((A) => A.toString()),
        argumentList: T
      }, b).then(Q);
    },
    construct(C, S) {
      Ee(h);
      const [E, P] = Ar(S);
      return ae(c, s, {
        type: "CONSTRUCT",
        path: u.map((T) => T.toString()),
        argumentList: E
      }, P).then(Q);
    }
  });
  return Dn(w, c), w;
}
function xn(c) {
  return Array.prototype.concat.apply([], c);
}
function Ar(c) {
  const s = c.map(ke);
  return [s.map((u) => u[0]), xn(s.map((u) => u[1]))];
}
const xr = /* @__PURE__ */ new WeakMap();
function Hn(c, s) {
  return xr.set(c, s), c;
}
function Un(c) {
  return Object.assign(c, { [Fr]: !0 });
}
function ke(c) {
  for (const [s, u] of Or)
    if (u.canHandle(c)) {
      const [a, h] = u.serialize(c);
      return [
        {
          type: "HANDLER",
          name: s,
          value: a
        },
        h
      ];
    }
  return [
    {
      type: "RAW",
      value: c
    },
    xr.get(c) || []
  ];
}
function Q(c) {
  switch (c.type) {
    case "HANDLER":
      return Or.get(c.name).deserialize(c.value);
    case "RAW":
      return c.value;
  }
}
function ae(c, s, u, a) {
  return new Promise((h) => {
    const w = Vn();
    s.set(w, h), c.start && c.start(), c.postMessage(Object.assign({ id: w }, u), a);
  });
}
function Vn() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
class R extends Error {
  cause;
  constructor(s, u) {
    super(s), this.name = "AutoCaptureError", this.cause = u;
  }
  // Change this to Decorator when they will be in stable release
  static logError(s) {
  }
  static fromCameraError(s) {
    if (this.logError(s), s instanceof R)
      return s;
    let u;
    switch (s.name) {
      case "OverconstrainedError":
        u = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        u = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        u = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        u = "There is no camera available to you";
        break;
      default:
        u = "An unknown camera error has occurred";
        break;
    }
    return new R(u, s);
  }
  static fromError(s) {
    if (this.logError(s), s instanceof R)
      return s;
    const u = "An unexpected error has occurred";
    return s instanceof Error ? new R(u, s) : typeof s == "string" ? new R(u, new Error(s)) : new R(u);
  }
}
const Se = (c, s) => Math.hypot(s.x - c.x, s.y - c.y), jn = (c) => {
  const { bottomLeft: s, bottomRight: u, topLeft: a, topRight: h } = c, w = Se(a, h), C = Se(h, u), S = Se(s, u), E = Se(a, s);
  return Math.min(w, C, S, E);
}, Ae = 1e3, Rr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Mr = {
  LEFT: "Left",
  RIGHT: "Right"
}, Wr = {
  PALMAR: "Palmar",
  DORSAL: "Dorsal"
}, Ln = {
  0: Mr.LEFT,
  1: Mr.RIGHT
}, Nn = {
  0: Wr.PALMAR,
  1: Wr.DORSAL
}, Bn = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), zn = {
  RGBA: "RGBA"
};
class Gn {
  #e;
  #r;
  #t;
  constructor(s, u) {
    this.#e = s, this.#r = this.allocate(u.length * u.BYTES_PER_ELEMENT), this.#t = this.allocate(u.length * u.BYTES_PER_ELEMENT);
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
class qn {
  samWasmModule;
  getOverriddenModules(s, u) {
    return {
      locateFile: (a) => new URL(u || a, s).href
    };
  }
  async handleMissingOrInvalidSamModule(s, u) {
    try {
      const a = await fetch(s);
      if (!a.ok)
        throw new R(
          `The path to ${u} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${s}`
        );
      const h = await a.arrayBuffer();
      if (!WebAssembly.validate(h))
        throw new R(
          `The provided ${u} is not a valid WASM module. Please check provided path to wasm files. Current path is ${s}`
        );
    } catch (a) {
      if (a instanceof R)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), a;
    }
  }
  async getSamWasmFileName() {
    return await Bn() ? Rr.simd : Rr.sam;
  }
  async initSamModule(s, u) {
    if (this.samWasmModule)
      return;
    const a = await this.getSamWasmFileName(), h = this.getSamWasmFilePath(u, a);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(s, h)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(h, a), new R("Could not init detector.");
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
      throw new R("SAM WASM module is not initialized");
    const u = new Gn(this.samWasmModule, s);
    return u.writeDataToMemory(s), u;
  }
  convertToSamColorImage(s, u) {
    if (!this.samWasmModule)
      throw new R("SAM WASM module is not initialized");
    const a = this.writeImageToMemory(s);
    return this.samWasmModule.convertToSamColorImage(
      u.width,
      u.height,
      a.rgbaImagePointer,
      zn.RGBA,
      a.bgr0ImagePointer
    ), a;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(s, u, a) {
    if (!this.samWasmModule)
      throw new R("SAM WASM module is not initialized");
    const h = this.convertToSamColorImage(s, u), { bottomLeft: w, topLeft: C, topRight: S } = a, E = [
      C.x,
      // x
      C.y,
      // y
      S.x - C.x,
      // width
      w.y - C.y
      // height
    ], { height: P, width: T, x: b, y: A } = await this.samWasmModule.selectDetailRegion(
      u.width,
      u.height,
      h.bgr0ImagePointer,
      E
    );
    return h.free(), {
      height: P,
      width: T,
      shiftX: b,
      shiftY: A
    };
  }
  [Re]() {
    this.terminateSamModule();
  }
}
let Yn = class extends qn {
  mapHandValue(s, u) {
    if (!(s.value in u))
      throw new R(`Invalid hand value: ${s.value}. Expected 0 or 1.`);
    return u[s.value];
  }
  parseRawData({ rawDetectedPalm: s, rawPalmAttributes: u }) {
    const { brightness: a, sharpness: h } = s.params, w = {
      confidence: s.confidence / Ae,
      topLeft: {
        x: s.x0,
        y: s.y0
      },
      topRight: {
        x: s.x1,
        y: s.y1
      },
      bottomRight: {
        x: s.x2,
        y: s.y2
      },
      bottomLeft: {
        x: s.x3,
        y: s.y3
      },
      brightness: a / Ae,
      sharpness: h / Ae
    };
    return {
      ...w,
      smallestEdge: jn(w),
      handOrientation: this.mapHandValue(u.handOrientation, Nn),
      handPosition: this.mapHandValue(u.handPosition, Ln),
      templateExtractionQuality: u.quality / Ae
    };
  }
  async detectPalmWithImageParameters(s, u) {
    if (!this.samWasmModule)
      throw new R("SAM WASM module is not initialized");
    return this.samWasmModule.detectPalmWithImageParameters(
      s.width,
      s.height,
      u.bgr0ImagePointer,
      0,
      // palmDetectionOptions
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
  }
  async detectPalmAttributes(s, u, a) {
    if (!this.samWasmModule)
      throw new R("SAM WASM module is not initialized");
    const h = [
      u.x0,
      u.y0,
      u.x1,
      u.y1,
      u.x2,
      u.y2,
      u.x3,
      u.y3
    ];
    return this.samWasmModule.detectPalmAttributes(
      s.width,
      s.height,
      a.bgr0ImagePointer,
      0,
      // options
      h
    );
  }
  async detect(s, u, a) {
    const h = this.convertToSamColorImage(s, u), w = await this.detectPalmWithImageParameters(u, h), C = await this.detectPalmAttributes(
      u,
      w,
      h
    );
    return h.free(), this.parseRawData({ rawDetectedPalm: w, rawPalmAttributes: C });
  }
  async getOptimalRegionForCompressionDetection(s, u, a) {
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(
      s,
      u,
      a
    );
  }
};
var Xn = (() => {
  var c = import.meta.url;
  return (async function(s = {}) {
    var u, a = s, h, w, C = new Promise((r, e) => {
      h = r, w = e;
    }), S = typeof window == "object", E = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var P = Object.assign({}, a), T = (r, e) => {
      throw e;
    }, b = "";
    function A(r) {
      return a.locateFile ? a.locateFile(r, b) : b + r;
    }
    var L, Oe;
    (S || E) && (E ? b = self.location.href : typeof document < "u" && document.currentScript && (b = document.currentScript.src), c && (b = c), b.startsWith("blob:") ? b = "" : b = b.slice(0, b.replace(/[?#].*/, "").lastIndexOf("/") + 1), E && (Oe = (r) => {
      var e = new XMLHttpRequest();
      return e.open("GET", r, !1), e.responseType = "arraybuffer", e.send(null), new Uint8Array(e.response);
    }), L = async (r) => {
      if (Je(r))
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
    var ce = a.printErr || console.error.bind(console);
    Object.assign(a, P), P = null, a.arguments && a.arguments, a.thisProgram && a.thisProgram;
    var fe = a.wasmBinary, de, K = !1, ve, N, k, ee, ie, B, $, Ye, Xe, Ke, Ze, Je = (r) => r.startsWith("file://");
    function Qe() {
      var r = de.buffer;
      a.HEAP8 = N = new Int8Array(r), a.HEAP16 = ee = new Int16Array(r), a.HEAPU8 = k = new Uint8Array(r), a.HEAPU16 = ie = new Uint16Array(r), a.HEAP32 = B = new Int32Array(r), a.HEAPU32 = $ = new Uint32Array(r), a.HEAPF32 = Ye = new Float32Array(r), a.HEAPF64 = Ze = new Float64Array(r), a.HEAP64 = Xe = new BigInt64Array(r), a.HEAPU64 = Ke = new BigUint64Array(r);
    }
    function Hr() {
      if (a.preRun)
        for (typeof a.preRun == "function" && (a.preRun = [a.preRun]); a.preRun.length; )
          Zr(a.preRun.shift());
      rr(nr);
    }
    function Ur() {
      y.C();
    }
    function Vr() {
      if (a.postRun)
        for (typeof a.postRun == "function" && (a.postRun = [a.postRun]); a.postRun.length; )
          Kr(a.postRun.shift());
      rr(tr);
    }
    var Z = 0, se = null;
    function jr(r) {
      Z++, a.monitorRunDependencies?.(Z);
    }
    function Lr(r) {
      if (Z--, a.monitorRunDependencies?.(Z), Z == 0 && se) {
        var e = se;
        se = null, e();
      }
    }
    function me(r) {
      a.onAbort?.(r), r = "Aborted(" + r + ")", ce(r), K = !0, r += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(r);
      throw w(e), e;
    }
    var De;
    function Nr() {
      return a.locateFile ? A("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Br(r) {
      if (r == De && fe)
        return new Uint8Array(fe);
      if (Oe)
        return Oe(r);
      throw "both async and sync fetching of the wasm failed";
    }
    async function zr(r) {
      if (!fe)
        try {
          var e = await L(r);
          return new Uint8Array(e);
        } catch {
        }
      return Br(r);
    }
    async function Gr(r, e) {
      try {
        var t = await zr(r), n = await WebAssembly.instantiate(t, e);
        return n;
      } catch (i) {
        ce(`failed to asynchronously prepare wasm: ${i}`), me(i);
      }
    }
    async function qr(r, e, t) {
      if (!r && typeof WebAssembly.instantiateStreaming == "function" && !Je(e))
        try {
          var n = fetch(e, { credentials: "same-origin" }), i = await WebAssembly.instantiateStreaming(n, t);
          return i;
        } catch (l) {
          ce(`wasm streaming compile failed: ${l}`), ce("falling back to ArrayBuffer instantiation");
        }
      return Gr(e, t);
    }
    function Yr() {
      return { a: _n };
    }
    async function Xr() {
      function r(l, f) {
        return y = l.exports, y = v.instrumentWasmExports(y), de = y.B, Qe(), y.H, Lr(), y;
      }
      jr();
      function e(l) {
        return r(l.instance);
      }
      var t = Yr();
      if (a.instantiateWasm)
        return new Promise((l, f) => {
          a.instantiateWasm(t, (o, d) => {
            r(o), l(o.exports);
          });
        });
      De ??= Nr();
      try {
        var n = await qr(fe, De, t), i = e(n);
        return i;
      } catch (l) {
        return w(l), Promise.reject(l);
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
    }, tr = [], Kr = (r) => tr.unshift(r), nr = [], Zr = (r) => nr.unshift(r), ar = a.noExitRuntime || !0;
    class Jr {
      constructor(e) {
        this.excPtr = e, this.ptr = e - 24;
      }
      set_type(e) {
        $[this.ptr + 4 >> 2] = e;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(e) {
        $[this.ptr + 8 >> 2] = e;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(e) {
        e = e ? 1 : 0, N[this.ptr + 12] = e;
      }
      get_caught() {
        return N[this.ptr + 12] != 0;
      }
      set_rethrown(e) {
        e = e ? 1 : 0, N[this.ptr + 13] = e;
      }
      get_rethrown() {
        return N[this.ptr + 13] != 0;
      }
      init(e, t) {
        this.set_adjusted_ptr(0), this.set_type(e), this.set_destructor(t);
      }
      set_adjusted_ptr(e) {
        $[this.ptr + 16 >> 2] = e;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var ir = 0, Qr = (r, e, t) => {
      var n = new Jr(r);
      throw n.init(e, t), ir = r, ir;
    }, et = () => me(""), pe = (r) => {
      if (r === null)
        return "null";
      var e = typeof r;
      return e === "object" || e === "array" || e === "function" ? r.toString() : "" + r;
    }, rt = () => {
      for (var r = new Array(256), e = 0; e < 256; ++e)
        r[e] = String.fromCharCode(e);
      sr = r;
    }, sr, M = (r) => {
      for (var e = "", t = r; k[t]; )
        e += sr[k[t++]];
      return e;
    }, re = {}, J = {}, he = {}, te, g = (r) => {
      throw new te(r);
    }, or, ye = (r) => {
      throw new or(r);
    }, ne = (r, e, t) => {
      r.forEach((o) => he[o] = e);
      function n(o) {
        var d = t(o);
        d.length !== r.length && ye("Mismatched type converter count");
        for (var p = 0; p < r.length; ++p)
          D(r[p], d[p]);
      }
      var i = new Array(e.length), l = [], f = 0;
      e.forEach((o, d) => {
        J.hasOwnProperty(o) ? i[d] = J[o] : (l.push(o), re.hasOwnProperty(o) || (re[o] = []), re[o].push(() => {
          i[d] = J[o], ++f, f === l.length && n(i);
        }));
      }), l.length === 0 && n(i);
    };
    function tt(r, e, t = {}) {
      var n = e.name;
      if (r || g(`type "${n}" must have a positive integer typeid pointer`), J.hasOwnProperty(r)) {
        if (t.ignoreDuplicateRegistrations)
          return;
        g(`Cannot register type '${n}' twice`);
      }
      if (J[r] = e, delete he[r], re.hasOwnProperty(r)) {
        var i = re[r];
        delete re[r], i.forEach((l) => l());
      }
    }
    function D(r, e, t = {}) {
      return tt(r, e, t);
    }
    var lr = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? (n) => N[n] : (n) => k[n];
        case 2:
          return t ? (n) => ee[n >> 1] : (n) => ie[n >> 1];
        case 4:
          return t ? (n) => B[n >> 2] : (n) => $[n >> 2];
        case 8:
          return t ? (n) => Xe[n >> 3] : (n) => Ke[n >> 3];
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, nt = (r, e, t, n, i) => {
      e = M(e);
      var l = e.indexOf("u") != -1;
      D(r, { name: e, fromWireType: (f) => f, toWireType: function(f, o) {
        if (typeof o != "bigint" && typeof o != "number")
          throw new TypeError(`Cannot convert "${pe(o)}" to ${this.name}`);
        return typeof o == "number" && (o = BigInt(o)), o;
      }, argPackAdvance: x, readValueFromPointer: lr(e, t, !l), destructorFunction: null });
    }, x = 8, at = (r, e, t, n) => {
      e = M(e), D(r, { name: e, fromWireType: function(i) {
        return !!i;
      }, toWireType: function(i, l) {
        return l ? t : n;
      }, argPackAdvance: x, readValueFromPointer: function(i) {
        return this.fromWireType(k[i]);
      }, destructorFunction: null });
    }, it = (r) => ({ count: r.count, deleteScheduled: r.deleteScheduled, preservePointerOnDelete: r.preservePointerOnDelete, ptr: r.ptr, ptrType: r.ptrType, smartPtr: r.smartPtr, smartPtrType: r.smartPtrType }), Ie = (r) => {
      function e(t) {
        return t.$$.ptrType.registeredClass.name;
      }
      g(e(r) + " instance already deleted");
    }, xe = !1, ur = (r) => {
    }, st = (r) => {
      r.smartPtr ? r.smartPtrType.rawDestructor(r.smartPtr) : r.ptrType.registeredClass.rawDestructor(r.ptr);
    }, cr = (r) => {
      r.count.value -= 1;
      var e = r.count.value === 0;
      e && st(r);
    }, fr = (r, e, t) => {
      if (e === t)
        return r;
      if (t.baseClass === void 0)
        return null;
      var n = fr(r, e, t.baseClass);
      return n === null ? null : t.downcast(n);
    }, dr = {}, ot = {}, lt = (r, e) => {
      for (e === void 0 && g("ptr should not be undefined"); r.baseClass; )
        e = r.upcast(e), r = r.baseClass;
      return e;
    }, ut = (r, e) => (e = lt(r, e), ot[e]), ge = (r, e) => {
      (!e.ptrType || !e.ptr) && ye("makeClassHandle requires ptr and ptrType");
      var t = !!e.smartPtrType, n = !!e.smartPtr;
      return t !== n && ye("Both smartPtrType and smartPtr must be specified"), e.count = { value: 1 }, oe(Object.create(r, { $$: { value: e, writable: !0 } }));
    };
    function ct(r) {
      var e = this.getPointee(r);
      if (!e)
        return this.destructor(r), null;
      var t = ut(this.registeredClass, e);
      if (t !== void 0) {
        if (t.$$.count.value === 0)
          return t.$$.ptr = e, t.$$.smartPtr = r, t.clone();
        var n = t.clone();
        return this.destructor(r), n;
      }
      function i() {
        return this.isSmartPointer ? ge(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: e, smartPtrType: this, smartPtr: r }) : ge(this.registeredClass.instancePrototype, { ptrType: this, ptr: r });
      }
      var l = this.registeredClass.getActualType(e), f = dr[l];
      if (!f)
        return i.call(this);
      var o;
      this.isConst ? o = f.constPointerType : o = f.pointerType;
      var d = fr(e, this.registeredClass, o.registeredClass);
      return d === null ? i.call(this) : this.isSmartPointer ? ge(o.registeredClass.instancePrototype, { ptrType: o, ptr: d, smartPtrType: this, smartPtr: r }) : ge(o.registeredClass.instancePrototype, { ptrType: o, ptr: d });
    }
    var oe = (r) => typeof FinalizationRegistry > "u" ? (oe = (e) => e, r) : (xe = new FinalizationRegistry((e) => {
      cr(e.$$);
    }), oe = (e) => {
      var t = e.$$, n = !!t.smartPtr;
      if (n) {
        var i = { $$: t };
        xe.register(e, i, e);
      }
      return e;
    }, ur = (e) => xe.unregister(e), oe(r)), ft = () => {
      Object.assign(we.prototype, { isAliasOf(r) {
        if (!(this instanceof we) || !(r instanceof we))
          return !1;
        var e = this.$$.ptrType.registeredClass, t = this.$$.ptr;
        r.$$ = r.$$;
        for (var n = r.$$.ptrType.registeredClass, i = r.$$.ptr; e.baseClass; )
          t = e.upcast(t), e = e.baseClass;
        for (; n.baseClass; )
          i = n.upcast(i), n = n.baseClass;
        return e === n && t === i;
      }, clone() {
        if (this.$$.ptr || Ie(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var r = oe(Object.create(Object.getPrototypeOf(this), { $$: { value: it(this.$$) } }));
        return r.$$.count.value += 1, r.$$.deleteScheduled = !1, r;
      }, delete() {
        this.$$.ptr || Ie(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), ur(this), cr(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Ie(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function we() {
    }
    var be = (r, e) => Object.defineProperty(e, "name", { value: r }), dt = (r, e, t) => {
      if (r[e].overloadTable === void 0) {
        var n = r[e];
        r[e] = function(...i) {
          return r[e].overloadTable.hasOwnProperty(i.length) || g(`Function '${t}' called with an invalid number of arguments (${i.length}) - expects one of (${r[e].overloadTable})!`), r[e].overloadTable[i.length].apply(this, i);
        }, r[e].overloadTable = [], r[e].overloadTable[n.argCount] = n;
      }
    }, He = (r, e, t) => {
      a.hasOwnProperty(r) ? ((t === void 0 || a[r].overloadTable !== void 0 && a[r].overloadTable[t] !== void 0) && g(`Cannot register public name '${r}' twice`), dt(a, r, r), a[r].overloadTable.hasOwnProperty(t) && g(`Cannot register multiple overloads of a function with the same number of arguments (${t})!`), a[r].overloadTable[t] = e) : (a[r] = e, a[r].argCount = t);
    }, vt = 48, mt = 57, pt = (r) => {
      r = r.replace(/[^a-zA-Z0-9_]/g, "$");
      var e = r.charCodeAt(0);
      return e >= vt && e <= mt ? `_${r}` : r;
    };
    function ht(r, e, t, n, i, l, f, o) {
      this.name = r, this.constructor = e, this.instancePrototype = t, this.rawDestructor = n, this.baseClass = i, this.getActualType = l, this.upcast = f, this.downcast = o, this.pureVirtualFunctions = [];
    }
    var _e = (r, e, t) => {
      for (; e !== t; )
        e.upcast || g(`Expected null or instance of ${t.name}, got an instance of ${e.name}`), r = e.upcast(r), e = e.baseClass;
      return r;
    };
    function yt(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${pe(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = _e(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function gt(r, e) {
      var t;
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), this.isSmartPointer ? (t = this.rawConstructor(), r !== null && r.push(this.rawDestructor, t), t) : 0;
      (!e || !e.$$) && g(`Cannot pass "${pe(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
      var n = e.$$.ptrType.registeredClass;
      if (t = _e(e.$$.ptr, n, this.registeredClass), this.isSmartPointer)
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
    function wt(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${pe(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.ptrType.name} to parameter type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = _e(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function Pe(r) {
      return this.fromWireType($[r >> 2]);
    }
    var bt = () => {
      Object.assign($e.prototype, { getPointee(r) {
        return this.rawGetPointee && (r = this.rawGetPointee(r)), r;
      }, destructor(r) {
        this.rawDestructor?.(r);
      }, argPackAdvance: x, readValueFromPointer: Pe, fromWireType: ct });
    };
    function $e(r, e, t, n, i, l, f, o, d, p, m) {
      this.name = r, this.registeredClass = e, this.isReference = t, this.isConst = n, this.isSmartPointer = i, this.pointeeType = l, this.sharingPolicy = f, this.rawGetPointee = o, this.rawConstructor = d, this.rawShare = p, this.rawDestructor = m, !i && e.baseClass === void 0 ? n ? (this.toWireType = yt, this.destructorFunction = null) : (this.toWireType = wt, this.destructorFunction = null) : this.toWireType = gt;
    }
    var vr = (r, e, t) => {
      a.hasOwnProperty(r) || ye("Replacing nonexistent public symbol"), a[r].overloadTable !== void 0 && t !== void 0 ? a[r].overloadTable[t] = e : (a[r] = e, a[r].argCount = t);
    }, _t = (r, e, t) => {
      r = r.replace(/p/g, "i");
      var n = a["dynCall_" + r];
      return n(e, ...t);
    }, Pt = (r, e, t = []) => {
      var n = _t(r, e, t);
      return n;
    }, $t = (r, e) => (...t) => Pt(r, e, t), z = (r, e) => {
      r = M(r);
      function t() {
        return $t(r, e);
      }
      var n = t();
      return typeof n != "function" && g(`unknown function pointer with signature ${r}: ${e}`), n;
    }, Ct = (r, e) => {
      var t = be(e, function(n) {
        this.name = e, this.message = n;
        var i = new Error(n).stack;
        i !== void 0 && (this.stack = this.toString() + `
` + i.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return t.prototype = Object.create(r.prototype), t.prototype.constructor = t, t.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, t;
    }, mr, pr = (r) => {
      var e = Pn(r), t = M(e);
      return j(e), t;
    }, le = (r, e) => {
      var t = [], n = {};
      function i(l) {
        if (!n[l] && !J[l]) {
          if (he[l]) {
            he[l].forEach(i);
            return;
          }
          t.push(l), n[l] = !0;
        }
      }
      throw e.forEach(i), new mr(`${r}: ` + t.map(pr).join([", "]));
    }, Tt = (r, e, t, n, i, l, f, o, d, p, m, _, W) => {
      m = M(m), l = z(i, l), o &&= z(f, o), p &&= z(d, p), W = z(_, W);
      var H = pt(m);
      He(H, function() {
        le(`Cannot construct ${m} due to unbound types`, [n]);
      }), ne([r, e, t], n ? [n] : [], (U) => {
        U = U[0];
        var q, O;
        n ? (q = U.registeredClass, O = q.instancePrototype) : O = we.prototype;
        var V = be(m, function(...ze) {
          if (Object.getPrototypeOf(this) !== Y)
            throw new te("Use 'new' to construct " + m);
          if (F.constructor_body === void 0)
            throw new te(m + " has no accessible constructor");
          var Sr = F.constructor_body[ze.length];
          if (Sr === void 0)
            throw new te(`Tried to invoke ctor of ${m} with invalid number of parameters (${ze.length}) - expected (${Object.keys(F.constructor_body).toString()}) parameters instead!`);
          return Sr.apply(this, ze);
        }), Y = Object.create(O, { constructor: { value: V } });
        V.prototype = Y;
        var F = new ht(m, V, Y, W, q, l, o, p);
        F.baseClass && (F.baseClass.__derivedClasses ??= [], F.baseClass.__derivedClasses.push(F));
        var X = new $e(m, F, !0, !1, !1), Te = new $e(m + "*", F, !1, !1, !1), Er = new $e(m + " const*", F, !1, !0, !1);
        return dr[r] = { pointerType: Te, constPointerType: Er }, vr(H, V), [X, Te, Er];
      });
    }, hr = (r, e) => {
      for (var t = [], n = 0; n < r; n++)
        t.push($[e + n * 4 >> 2]);
      return t;
    }, Ue = (r) => {
      for (; r.length; ) {
        var e = r.pop(), t = r.pop();
        t(e);
      }
    };
    function Et(r) {
      for (var e = 1; e < r.length; ++e)
        if (r[e] !== null && r[e].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Ce = (r) => {
      try {
        return r();
      } catch (e) {
        me(e);
      }
    }, yr = (r) => {
      if (r instanceof er || r == "unwind")
        return ve;
      T(1, r);
    }, gr = 0, wr = () => ar || gr > 0, br = (r) => {
      ve = r, wr() || (a.onExit?.(r), K = !0), T(r, new er(r));
    }, St = (r, e) => {
      ve = r, br(r);
    }, At = St, Rt = () => {
      if (!wr())
        try {
          At(ve);
        } catch (r) {
          yr(r);
        }
    }, _r = (r) => {
      if (!K)
        try {
          r(), Rt();
        } catch (e) {
          yr(e);
        }
    }, v = { instrumentWasmImports(r) {
      var e = /^(__asyncjs__.*)$/;
      for (let [t, n] of Object.entries(r))
        typeof n == "function" && (n.isAsync || e.test(t));
    }, instrumentWasmExports(r) {
      var e = {};
      for (let [t, n] of Object.entries(r))
        typeof n == "function" ? e[t] = (...i) => {
          v.exportCallStack.push(t);
          try {
            return n(...i);
          } finally {
            K || (v.exportCallStack.pop(), v.maybeStopUnwind());
          }
        } : e[t] = n;
      return e;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(r) {
      var e = v.callStackNameToId[r];
      return e === void 0 && (e = v.callStackId++, v.callStackNameToId[r] = e, v.callStackIdToName[e] = r), e;
    }, maybeStopUnwind() {
      v.currData && v.state === v.State.Unwinding && v.exportCallStack.length === 0 && (v.state = v.State.Normal, Ce(Tn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((r, e) => {
        v.asyncPromiseHandlers = { resolve: r, reject: e };
      });
    }, allocateData() {
      var r = Ne(12 + v.StackSize);
      return v.setDataHeader(r, r + 12, v.StackSize), v.setDataRewindFunc(r), r;
    }, setDataHeader(r, e, t) {
      $[r >> 2] = e, $[r + 4 >> 2] = e + t;
    }, setDataRewindFunc(r) {
      var e = v.exportCallStack[0], t = v.getCallStackId(e);
      B[r + 8 >> 2] = t;
    }, getDataRewindFuncName(r) {
      var e = B[r + 8 >> 2], t = v.callStackIdToName[e];
      return t;
    }, getDataRewindFunc(r) {
      var e = y[r];
      return e;
    }, doRewind(r) {
      var e = v.getDataRewindFuncName(r), t = v.getDataRewindFunc(e);
      return t();
    }, handleSleep(r) {
      if (!K) {
        if (v.state === v.State.Normal) {
          var e = !1, t = !1;
          r((n = 0) => {
            if (!K && (v.handleSleepReturnValue = n, e = !0, !!t)) {
              v.state = v.State.Rewinding, Ce(() => En(v.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var i, l = !1;
              try {
                i = v.doRewind(v.currData);
              } catch (d) {
                i = d, l = !0;
              }
              var f = !1;
              if (!v.currData) {
                var o = v.asyncPromiseHandlers;
                o && (v.asyncPromiseHandlers = null, (l ? o.reject : o.resolve)(i), f = !0);
              }
              if (l && !f)
                throw i;
            }
          }), t = !0, e || (v.state = v.State.Unwinding, v.currData = v.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Ce(() => Cn(v.currData)));
        } else v.state === v.State.Rewinding ? (v.state = v.State.Normal, Ce(Sn), j(v.currData), v.currData = null, v.sleepCallbacks.forEach(_r)) : me(`invalid state: ${v.state}`);
        return v.handleSleepReturnValue;
      }
    }, handleAsync(r) {
      return v.handleSleep((e) => {
        r().then(e);
      });
    } };
    function Pr(r, e, t, n, i, l) {
      var f = e.length;
      f < 2 && g("argTypes array size mismatch! Must at least get return value and 'this' types!"), e[1];
      var o = Et(e), d = e[0].name !== "void", p = f - 2, m = new Array(p), _ = [], W = [], H = function(...U) {
        W.length = 0;
        var q;
        _.length = 1, _[0] = i;
        for (var O = 0; O < p; ++O)
          m[O] = e[O + 2].toWireType(W, U[O]), _.push(m[O]);
        var V = n(..._);
        function Y(F) {
          if (o)
            Ue(W);
          else
            for (var X = 2; X < e.length; X++) {
              var Te = X === 1 ? q : m[X - 2];
              e[X].destructorFunction !== null && e[X].destructorFunction(Te);
            }
          if (d)
            return e[0].fromWireType(F);
        }
        return v.currData ? v.whenDone().then(Y) : Y(V);
      };
      return be(r, H);
    }
    var Mt = (r, e, t, n, i, l) => {
      var f = hr(e, t);
      i = z(n, i), ne([], [r], (o) => {
        o = o[0];
        var d = `constructor ${o.name}`;
        if (o.registeredClass.constructor_body === void 0 && (o.registeredClass.constructor_body = []), o.registeredClass.constructor_body[e - 1] !== void 0)
          throw new te(`Cannot register multiple constructors with identical number of parameters (${e - 1}) for class '${o.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return o.registeredClass.constructor_body[e - 1] = () => {
          le(`Cannot construct ${o.name} due to unbound types`, f);
        }, ne([], f, (p) => (p.splice(1, 0, null), o.registeredClass.constructor_body[e - 1] = Pr(d, p, null, i, l), [])), [];
      });
    }, $r = (r, e, t) => (r instanceof Object || g(`${t} with invalid "this": ${r}`), r instanceof e.registeredClass.constructor || g(`${t} incompatible with "this" of type ${r.constructor.name}`), r.$$.ptr || g(`cannot call emscripten binding method ${t} on deleted object`), _e(r.$$.ptr, r.$$.ptrType.registeredClass, e.registeredClass)), Wt = (r, e, t, n, i, l, f, o, d, p) => {
      e = M(e), i = z(n, i), ne([], [r], (m) => {
        m = m[0];
        var _ = `${m.name}.${e}`, W = { get() {
          le(`Cannot access ${_} due to unbound types`, [t, f]);
        }, enumerable: !0, configurable: !0 };
        return d ? W.set = () => le(`Cannot access ${_} due to unbound types`, [t, f]) : W.set = (H) => g(_ + " is a read-only property"), Object.defineProperty(m.registeredClass.instancePrototype, e, W), ne([], d ? [t, f] : [t], (H) => {
          var U = H[0], q = { get() {
            var V = $r(this, m, _ + " getter");
            return U.fromWireType(i(l, V));
          }, enumerable: !0 };
          if (d) {
            d = z(o, d);
            var O = H[1];
            q.set = function(V) {
              var Y = $r(this, m, _ + " setter"), F = [];
              d(p, Y, O.toWireType(F, V)), Ue(F);
            };
          }
          return Object.defineProperty(m.registeredClass.instancePrototype, e, q), [];
        }), [];
      });
    }, Ve = [], G = [], je = (r) => {
      r > 9 && --G[r + 1] === 0 && (G[r] = void 0, Ve.push(r));
    }, Ft = () => G.length / 2 - 5 - Ve.length, kt = () => {
      G.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), a.count_emval_handles = Ft;
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
          const e = Ve.pop() || G.length;
          return G[e] = r, G[e + 1] = 1, e;
        }
      }
    } }, Ot = { name: "emscripten::val", fromWireType: (r) => {
      var e = I.toValue(r);
      return je(r), e;
    }, toWireType: (r, e) => I.toHandle(e), argPackAdvance: x, readValueFromPointer: Pe, destructorFunction: null }, Dt = (r) => D(r, Ot), It = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? function(n) {
            return this.fromWireType(N[n]);
          } : function(n) {
            return this.fromWireType(k[n]);
          };
        case 2:
          return t ? function(n) {
            return this.fromWireType(ee[n >> 1]);
          } : function(n) {
            return this.fromWireType(ie[n >> 1]);
          };
        case 4:
          return t ? function(n) {
            return this.fromWireType(B[n >> 2]);
          } : function(n) {
            return this.fromWireType($[n >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, xt = (r, e, t, n) => {
      e = M(e);
      function i() {
      }
      i.values = {}, D(r, { name: e, constructor: i, fromWireType: function(l) {
        return this.constructor.values[l];
      }, toWireType: (l, f) => f.value, argPackAdvance: x, readValueFromPointer: It(e, t, n), destructorFunction: null }), He(e, i);
    }, Le = (r, e) => {
      var t = J[r];
      return t === void 0 && g(`${e} has unknown type ${pr(r)}`), t;
    }, Ht = (r, e, t) => {
      var n = Le(r, "enum");
      e = M(e);
      var i = n.constructor, l = Object.create(n.constructor.prototype, { value: { value: t }, constructor: { value: be(`${n.name}_${e}`, function() {
      }) } });
      i.values[t] = l, i[e] = l;
    }, Ut = (r, e) => {
      switch (e) {
        case 4:
          return function(t) {
            return this.fromWireType(Ye[t >> 2]);
          };
        case 8:
          return function(t) {
            return this.fromWireType(Ze[t >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${e}): ${r}`);
      }
    }, Vt = (r, e, t) => {
      e = M(e), D(r, { name: e, fromWireType: (n) => n, toWireType: (n, i) => i, argPackAdvance: x, readValueFromPointer: Ut(e, t), destructorFunction: null });
    }, jt = (r) => {
      r = r.trim();
      const e = r.indexOf("(");
      return e === -1 ? r : r.slice(0, e);
    }, Lt = (r, e, t, n, i, l, f, o) => {
      var d = hr(e, t);
      r = M(r), r = jt(r), i = z(n, i), He(r, function() {
        le(`Cannot call ${r} due to unbound types`, d);
      }, e - 1), ne([], d, (p) => {
        var m = [p[0], null].concat(p.slice(1));
        return vr(r, Pr(r, m, null, i, l), e - 1), [];
      });
    }, Nt = (r, e, t, n, i) => {
      e = M(e);
      var l = (m) => m;
      if (n === 0) {
        var f = 32 - 8 * t;
        l = (m) => m << f >>> f;
      }
      var o = e.includes("unsigned"), d = (m, _) => {
      }, p;
      o ? p = function(m, _) {
        return d(_, this.name), _ >>> 0;
      } : p = function(m, _) {
        return d(_, this.name), _;
      }, D(r, { name: e, fromWireType: l, toWireType: p, argPackAdvance: x, readValueFromPointer: lr(e, t, n !== 0), destructorFunction: null });
    }, Bt = (r, e, t) => {
      var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], i = n[e];
      function l(f) {
        var o = $[f >> 2], d = $[f + 4 >> 2];
        return new i(N.buffer, d, o);
      }
      t = M(t), D(r, { name: t, fromWireType: l, argPackAdvance: x, readValueFromPointer: l }, { ignoreDuplicateRegistrations: !0 });
    }, zt = (r, e, t, n) => {
      if (!(n > 0)) return 0;
      for (var i = t, l = t + n - 1, f = 0; f < r.length; ++f) {
        var o = r.charCodeAt(f);
        if (o >= 55296 && o <= 57343) {
          var d = r.charCodeAt(++f);
          o = 65536 + ((o & 1023) << 10) | d & 1023;
        }
        if (o <= 127) {
          if (t >= l) break;
          e[t++] = o;
        } else if (o <= 2047) {
          if (t + 1 >= l) break;
          e[t++] = 192 | o >> 6, e[t++] = 128 | o & 63;
        } else if (o <= 65535) {
          if (t + 2 >= l) break;
          e[t++] = 224 | o >> 12, e[t++] = 128 | o >> 6 & 63, e[t++] = 128 | o & 63;
        } else {
          if (t + 3 >= l) break;
          e[t++] = 240 | o >> 18, e[t++] = 128 | o >> 12 & 63, e[t++] = 128 | o >> 6 & 63, e[t++] = 128 | o & 63;
        }
      }
      return e[t] = 0, t - i;
    }, Gt = (r, e, t) => zt(r, k, e, t), qt = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n <= 127 ? e++ : n <= 2047 ? e += 2 : n >= 55296 && n <= 57343 ? (e += 4, ++t) : e += 3;
      }
      return e;
    }, Cr = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Yt = (r, e = 0, t = NaN) => {
      for (var n = e + t, i = e; r[i] && !(i >= n); ) ++i;
      if (i - e > 16 && r.buffer && Cr)
        return Cr.decode(r.subarray(e, i));
      for (var l = ""; e < i; ) {
        var f = r[e++];
        if (!(f & 128)) {
          l += String.fromCharCode(f);
          continue;
        }
        var o = r[e++] & 63;
        if ((f & 224) == 192) {
          l += String.fromCharCode((f & 31) << 6 | o);
          continue;
        }
        var d = r[e++] & 63;
        if ((f & 240) == 224 ? f = (f & 15) << 12 | o << 6 | d : f = (f & 7) << 18 | o << 12 | d << 6 | r[e++] & 63, f < 65536)
          l += String.fromCharCode(f);
        else {
          var p = f - 65536;
          l += String.fromCharCode(55296 | p >> 10, 56320 | p & 1023);
        }
      }
      return l;
    }, Xt = (r, e) => r ? Yt(k, r, e) : "", Kt = (r, e) => {
      e = M(e), D(r, { name: e, fromWireType(t) {
        for (var n = $[t >> 2], i = t + 4, l, f, o = i, f = 0; f <= n; ++f) {
          var d = i + f;
          if (f == n || k[d] == 0) {
            var p = d - o, m = Xt(o, p);
            l === void 0 ? l = m : (l += "\0", l += m), o = d + 1;
          }
        }
        return j(t), l;
      }, toWireType(t, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var i, l = typeof n == "string";
        l || n instanceof Uint8Array || n instanceof Uint8ClampedArray || n instanceof Int8Array || g("Cannot pass non-string to std::string"), l ? i = qt(n) : i = n.length;
        var f = Ne(4 + i + 1), o = f + 4;
        if ($[f >> 2] = i, l)
          Gt(n, o, i + 1);
        else if (l)
          for (var d = 0; d < i; ++d) {
            var p = n.charCodeAt(d);
            p > 255 && (j(f), g("String has UTF-16 code units that do not fit in 8 bits")), k[o + d] = p;
          }
        else
          for (var d = 0; d < i; ++d)
            k[o + d] = n[d];
        return t !== null && t.push(j, f), f;
      }, argPackAdvance: x, readValueFromPointer: Pe, destructorFunction(t) {
        j(t);
      } });
    }, Tr = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Zt = (r, e) => {
      for (var t = r, n = t >> 1, i = n + e / 2; !(n >= i) && ie[n]; ) ++n;
      if (t = n << 1, t - r > 32 && Tr) return Tr.decode(k.subarray(r, t));
      for (var l = "", f = 0; !(f >= e / 2); ++f) {
        var o = ee[r + f * 2 >> 1];
        if (o == 0) break;
        l += String.fromCharCode(o);
      }
      return l;
    }, Jt = (r, e, t) => {
      if (t ??= 2147483647, t < 2) return 0;
      t -= 2;
      for (var n = e, i = t < r.length * 2 ? t / 2 : r.length, l = 0; l < i; ++l) {
        var f = r.charCodeAt(l);
        ee[e >> 1] = f, e += 2;
      }
      return ee[e >> 1] = 0, e - n;
    }, Qt = (r) => r.length * 2, en = (r, e) => {
      for (var t = 0, n = ""; !(t >= e / 4); ) {
        var i = B[r + t * 4 >> 2];
        if (i == 0) break;
        if (++t, i >= 65536) {
          var l = i - 65536;
          n += String.fromCharCode(55296 | l >> 10, 56320 | l & 1023);
        } else
          n += String.fromCharCode(i);
      }
      return n;
    }, rn = (r, e, t) => {
      if (t ??= 2147483647, t < 4) return 0;
      for (var n = e, i = n + t - 4, l = 0; l < r.length; ++l) {
        var f = r.charCodeAt(l);
        if (f >= 55296 && f <= 57343) {
          var o = r.charCodeAt(++l);
          f = 65536 + ((f & 1023) << 10) | o & 1023;
        }
        if (B[e >> 2] = f, e += 4, e + 4 > i) break;
      }
      return B[e >> 2] = 0, e - n;
    }, tn = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n >= 55296 && n <= 57343 && ++t, e += 4;
      }
      return e;
    }, nn = (r, e, t) => {
      t = M(t);
      var n, i, l, f;
      e === 2 ? (n = Zt, i = Jt, f = Qt, l = (o) => ie[o >> 1]) : e === 4 && (n = en, i = rn, f = tn, l = (o) => $[o >> 2]), D(r, { name: t, fromWireType: (o) => {
        for (var d = $[o >> 2], p, m = o + 4, _ = 0; _ <= d; ++_) {
          var W = o + 4 + _ * e;
          if (_ == d || l(W) == 0) {
            var H = W - m, U = n(m, H);
            p === void 0 ? p = U : (p += "\0", p += U), m = W + e;
          }
        }
        return j(o), p;
      }, toWireType: (o, d) => {
        typeof d != "string" && g(`Cannot pass non-string to C++ string type ${t}`);
        var p = f(d), m = Ne(4 + p + e);
        return $[m >> 2] = p / e, i(d, m + 4, p + e), o !== null && o.push(j, m), m;
      }, argPackAdvance: x, readValueFromPointer: Pe, destructorFunction(o) {
        j(o);
      } });
    }, an = (r, e) => {
      e = M(e), D(r, { isVoid: !0, name: e, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (t, n) => {
      } });
    }, sn = () => {
      ar = !1, gr = 0;
    }, on = (r, e, t) => {
      var n = [], i = r.toWireType(n, t);
      return n.length && ($[e >> 2] = I.toHandle(n)), i;
    }, ln = (r, e, t) => (r = I.toValue(r), e = Le(e, "emval::as"), on(e, t, r)), un = (r, e) => (r = I.toValue(r), e = I.toValue(e), I.toHandle(r[e])), cn = {}, fn = (r) => {
      var e = cn[r];
      return e === void 0 ? M(r) : e;
    }, dn = (r) => I.toHandle(fn(r)), vn = (r) => {
      var e = I.toValue(r);
      Ue(e), je(r);
    }, mn = (r, e) => {
      r = Le(r, "_emval_take_value");
      var t = r.readValueFromPointer(e);
      return I.toHandle(t);
    }, ue = {}, pn = () => performance.now(), hn = (r, e) => {
      if (ue[r] && (clearTimeout(ue[r].id), delete ue[r]), !e) return 0;
      var t = setTimeout(() => {
        delete ue[r], _r(() => $n(r, pn()));
      }, e);
      return ue[r] = { id: t, timeout_ms: e }, 0;
    }, yn = () => 2147483648, gn = (r, e) => Math.ceil(r / e) * e, wn = (r) => {
      var e = de.buffer, t = (r - e.byteLength + 65535) / 65536 | 0;
      try {
        return de.grow(t), Qe(), 1;
      } catch {
      }
    }, bn = (r) => {
      var e = k.length;
      r >>>= 0;
      var t = yn();
      if (r > t)
        return !1;
      for (var n = 1; n <= 4; n *= 2) {
        var i = e * (1 + 0.2 / n);
        i = Math.min(i, r + 100663296);
        var l = Math.min(t, gn(Math.max(r, i), 65536)), f = wn(l);
        if (f)
          return !0;
      }
      return !1;
    };
    rt(), te = a.BindingError = class extends Error {
      constructor(e) {
        super(e), this.name = "BindingError";
      }
    }, or = a.InternalError = class extends Error {
      constructor(e) {
        super(e), this.name = "InternalError";
      }
    }, ft(), bt(), mr = a.UnboundTypeError = Ct(Error, "UnboundTypeError"), kt();
    var _n = { g: Qr, s: et, n: nt, w: at, f: Tt, d: Mt, a: Wt, u: Dt, l: xt, h: Ht, m: Vt, b: Lt, e: Nt, c: Bt, v: Kt, i: nn, x: an, q: sn, j: ln, y: je, k: un, o: dn, A: vn, z: mn, r: hn, t: bn, p: br }, y = await Xr();
    y.C;
    var Pn = y.D, Ne = a._malloc = y.E, j = a._free = y.F, $n = y.G;
    a.dynCall_v = y.I, a.dynCall_ii = y.J, a.dynCall_vi = y.K, a.dynCall_i = y.L, a.dynCall_iii = y.M, a.dynCall_viii = y.N, a.dynCall_fii = y.O, a.dynCall_viif = y.P, a.dynCall_viiii = y.Q, a.dynCall_viiiiii = y.R, a.dynCall_iiiiii = y.S, a.dynCall_viiiii = y.T, a.dynCall_iiiiiii = y.U, a.dynCall_iiiiiiii = y.V, a.dynCall_viiiiiii = y.W, a.dynCall_viiiiiiiiidi = y.X, a.dynCall_viiiiiiiidi = y.Y, a.dynCall_viiiiiiiiii = y.Z, a.dynCall_viiiiiiiii = y._, a.dynCall_viiiiiiii = y.$, a.dynCall_iiiii = y.aa, a.dynCall_iiii = y.ba;
    var Cn = y.ca, Tn = y.da, En = y.ea, Sn = y.fa;
    function Be() {
      if (Z > 0) {
        se = Be;
        return;
      }
      if (Hr(), Z > 0) {
        se = Be;
        return;
      }
      function r() {
        a.calledRun = !0, !K && (Ur(), h(a), a.onRuntimeInitialized?.(), Vr());
      }
      a.setStatus ? (a.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => a.setStatus(""), 1), r();
      }, 1)) : r();
    }
    if (a.preInit)
      for (typeof a.preInit == "function" && (a.preInit = [a.preInit]); a.preInit.length > 0; )
        a.preInit.pop()();
    return Be(), u = C, u;
  });
})();
class Kn extends Yn {
  fetchSamModule(s) {
    return Xn(s);
  }
  getSamWasmFilePath(s, u) {
    return `${s}/palm/wasm/${u}`;
  }
}
qe(Kn);
