const kr = /* @__PURE__ */ Symbol("Comlink.proxy"), kn = /* @__PURE__ */ Symbol("Comlink.endpoint"), On = /* @__PURE__ */ Symbol("Comlink.releaseProxy"), Me = /* @__PURE__ */ Symbol("Comlink.finalizer"), We = /* @__PURE__ */ Symbol("Comlink.thrown"), Or = (u) => typeof u == "object" && u !== null || typeof u == "function", Dn = {
  canHandle: (u) => Or(u) && u[kr],
  serialize(u) {
    const { port1: o, port2: f } = new MessageChannel();
    return Xe(u, o), [f, [f]];
  },
  deserialize(u) {
    return u.start(), Hn(u);
  }
}, In = {
  canHandle: (u) => Or(u) && We in u,
  serialize({ value: u }) {
    let o;
    return u instanceof Error ? o = {
      isError: !0,
      value: {
        message: u.message,
        name: u.name,
        stack: u.stack
      }
    } : o = { isError: !1, value: u }, [o, []];
  },
  deserialize(u) {
    throw u.isError ? Object.assign(new Error(u.value.message), u.value) : u.value;
  }
}, Dr = /* @__PURE__ */ new Map([
  ["proxy", Dn],
  ["throw", In]
]);
function xn(u, o) {
  for (const f of u)
    if (o === f || f === "*" || f instanceof RegExp && f.test(o))
      return !0;
  return !1;
}
function Xe(u, o = globalThis, f = ["*"]) {
  o.addEventListener("message", function i(y) {
    if (!y || !y.data)
      return;
    if (!xn(f, y.origin)) {
      console.warn(`Invalid origin '${y.origin}' for comlink proxy`);
      return;
    }
    const { id: w, type: E, path: S } = Object.assign({ path: [] }, y.data), T = (y.data.argumentList || []).map(Q);
    let P;
    try {
      const C = S.slice(0, -1).reduce((_, X) => _[X], u), A = S.reduce((_, X) => _[X], u);
      switch (E) {
        case "GET":
          P = A;
          break;
        case "SET":
          C[S.slice(-1)[0]] = Q(y.data.value), P = !0;
          break;
        case "APPLY":
          P = A.apply(C, T);
          break;
        case "CONSTRUCT":
          {
            const _ = new A(...T);
            P = Bn(_);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: _, port2: X } = new MessageChannel();
            Xe(u, X), P = Ln(_, [_]);
          }
          break;
        case "RELEASE":
          P = void 0;
          break;
        default:
          return;
      }
    } catch (C) {
      P = { value: C, [We]: 0 };
    }
    Promise.resolve(P).catch((C) => ({ value: C, [We]: 0 })).then((C) => {
      const [A, _] = Oe(C);
      o.postMessage(Object.assign(Object.assign({}, A), { id: w }), _), E === "RELEASE" && (o.removeEventListener("message", i), Ir(o), Me in u && typeof u[Me] == "function" && u[Me]());
    }).catch((C) => {
      const [A, _] = Oe({
        value: new TypeError("Unserializable return value"),
        [We]: 0
      });
      o.postMessage(Object.assign(Object.assign({}, A), { id: w }), _);
    });
  }), o.start && o.start();
}
function Un(u) {
  return u.constructor.name === "MessagePort";
}
function Ir(u) {
  Un(u) && u.close();
}
function Hn(u, o) {
  const f = /* @__PURE__ */ new Map();
  return u.addEventListener("message", function(y) {
    const { data: w } = y;
    if (!w || !w.id)
      return;
    const E = f.get(w.id);
    if (E)
      try {
        E(w);
      } finally {
        f.delete(w.id);
      }
  }), Ye(u, f, [], o);
}
function Se(u) {
  if (u)
    throw new Error("Proxy has been released and is not useable");
}
function xr(u) {
  return ae(u, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    Ir(u);
  });
}
const Fe = /* @__PURE__ */ new WeakMap(), ke = "FinalizationRegistry" in globalThis && new FinalizationRegistry((u) => {
  const o = (Fe.get(u) || 0) - 1;
  Fe.set(u, o), o === 0 && xr(u);
});
function Vn(u, o) {
  const f = (Fe.get(o) || 0) + 1;
  Fe.set(o, f), ke && ke.register(u, o, u);
}
function jn(u) {
  ke && ke.unregister(u);
}
function Ye(u, o, f = [], i = function() {
}) {
  let y = !1;
  const w = new Proxy(i, {
    get(E, S) {
      if (Se(y), S === On)
        return () => {
          jn(w), xr(u), o.clear(), y = !0;
        };
      if (S === "then") {
        if (f.length === 0)
          return { then: () => w };
        const T = ae(u, o, {
          type: "GET",
          path: f.map((P) => P.toString())
        }).then(Q);
        return T.then.bind(T);
      }
      return Ye(u, o, [...f, S]);
    },
    set(E, S, T) {
      Se(y);
      const [P, C] = Oe(T);
      return ae(u, o, {
        type: "SET",
        path: [...f, S].map((A) => A.toString()),
        value: P
      }, C).then(Q);
    },
    apply(E, S, T) {
      Se(y);
      const P = f[f.length - 1];
      if (P === kn)
        return ae(u, o, {
          type: "ENDPOINT"
        }).then(Q);
      if (P === "bind")
        return Ye(u, o, f.slice(0, -1));
      const [C, A] = Wr(T);
      return ae(u, o, {
        type: "APPLY",
        path: f.map((_) => _.toString()),
        argumentList: C
      }, A).then(Q);
    },
    construct(E, S) {
      Se(y);
      const [T, P] = Wr(S);
      return ae(u, o, {
        type: "CONSTRUCT",
        path: f.map((C) => C.toString()),
        argumentList: T
      }, P).then(Q);
    }
  });
  return Vn(w, u), w;
}
function Nn(u) {
  return Array.prototype.concat.apply([], u);
}
function Wr(u) {
  const o = u.map(Oe);
  return [o.map((f) => f[0]), Nn(o.map((f) => f[1]))];
}
const Ur = /* @__PURE__ */ new WeakMap();
function Ln(u, o) {
  return Ur.set(u, o), u;
}
function Bn(u) {
  return Object.assign(u, { [kr]: !0 });
}
function Oe(u) {
  for (const [o, f] of Dr)
    if (f.canHandle(u)) {
      const [i, y] = f.serialize(u);
      return [
        {
          type: "HANDLER",
          name: o,
          value: i
        },
        y
      ];
    }
  return [
    {
      type: "RAW",
      value: u
    },
    Ur.get(u) || []
  ];
}
function Q(u) {
  switch (u.type) {
    case "HANDLER":
      return Dr.get(u.name).deserialize(u.value);
    case "RAW":
      return u.value;
  }
}
function ae(u, o, f, i) {
  return new Promise((y) => {
    const w = zn();
    o.set(w, y), u.start && u.start(), u.postMessage(Object.assign({ id: w }, f), i);
  });
}
function zn() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
class F extends Error {
  cause;
  constructor(o, f) {
    super(o), this.name = "AutoCaptureError", this.cause = f;
  }
  // Change this to Decorator when they will be in stable release
  static logError(o) {
  }
  static fromCameraError(o) {
    if (this.logError(o), o instanceof F)
      return o;
    let f;
    switch (o.name) {
      case "OverconstrainedError":
        f = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        f = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        f = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        f = "There is no camera available to you";
        break;
      default:
        f = "An unknown camera error has occurred";
        break;
    }
    return new F(f, o);
  }
  static fromError(o) {
    if (this.logError(o), o instanceof F)
      return o;
    const f = "An unexpected error has occurred";
    return o instanceof Error ? new F(f, o) : typeof o == "string" ? new F(f, new Error(o)) : new F(f);
  }
}
const Ae = (u, o) => Math.hypot(o.x - u.x, o.y - u.y), Gn = (u) => {
  const { bottomLeft: o, bottomRight: f, topLeft: i, topRight: y } = u, w = Ae(i, y), E = Ae(y, f), S = Ae(o, f), T = Ae(i, o);
  return Math.min(w, E, S, T);
}, Re = 1e3, Fr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, qn = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), Yn = {
  RGBA: "RGBA"
};
class Xn {
  #e;
  #r;
  #t;
  constructor(o, f) {
    this.#e = o, this.#r = this.allocate(f.length * f.BYTES_PER_ELEMENT), this.#t = this.allocate(f.length * f.BYTES_PER_ELEMENT);
  }
  get rgbaImagePointer() {
    return this.#r;
  }
  get bgr0ImagePointer() {
    return this.#t;
  }
  allocate(o) {
    return this.#e._malloc(o);
  }
  free() {
    this.#e._free(this.#r), this.#e._free(this.#t);
  }
  writeDataToMemory(o) {
    this.#e.HEAPU8.set(o, this.#r);
  }
}
class Kn {
  samWasmModule;
  getOverriddenModules(o, f) {
    return {
      locateFile: (i) => new URL(f || i, o).href
    };
  }
  async handleMissingOrInvalidSamModule(o, f) {
    try {
      const i = await fetch(o);
      if (!i.ok)
        throw new F(
          `The path to ${f} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${o}`
        );
      const y = await i.arrayBuffer();
      if (!WebAssembly.validate(y))
        throw new F(
          `The provided ${f} is not a valid WASM module. Please check provided path to wasm files. Current path is ${o}`
        );
    } catch (i) {
      if (i instanceof F)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), i;
    }
  }
  async getSamWasmFileName() {
    return await qn() ? Fr.simd : Fr.sam;
  }
  async initSamModule(o, f) {
    if (this.samWasmModule)
      return;
    const i = await this.getSamWasmFileName(), y = this.getSamWasmFilePath(f, i);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(o, y)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(y, i), new F("Could not init detector.");
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
  writeImageToMemory(o) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const f = new Xn(this.samWasmModule, o);
    return f.writeDataToMemory(o), f;
  }
  convertToSamColorImage(o, f) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const i = this.writeImageToMemory(o);
    return this.samWasmModule.convertToSamColorImage(
      f.width,
      f.height,
      i.rgbaImagePointer,
      Yn.RGBA,
      i.bgr0ImagePointer
    ), i;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(o, f, i) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const y = this.convertToSamColorImage(o, f), { bottomLeft: w, topLeft: E, topRight: S } = i, T = [
      E.x,
      // x
      E.y,
      // y
      S.x - E.x,
      // width
      w.y - E.y
      // height
    ], { height: P, width: C, x: A, y: _ } = await this.samWasmModule.selectDetailRegion(
      f.width,
      f.height,
      y.bgr0ImagePointer,
      T
    );
    return y.free(), {
      height: P,
      width: C,
      shiftX: A,
      shiftY: _
    };
  }
  [Me]() {
    this.terminateSamModule();
  }
}
let Zn = class extends Kn {
  parseRawData(o) {
    const { brightness: f, hotspots: i, sharpness: y } = o.params, w = {
      confidence: o.confidence / Re,
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
      brightness: f / Re,
      hotspots: i / Re,
      sharpness: y / Re
    };
    return {
      ...w,
      smallestEdge: Gn(w)
    };
  }
  async detect(o, f, i) {
    if (!this.samWasmModule)
      throw new F("SAM WASM module is not initialized");
    const y = this.convertToSamColorImage(o, f), w = this.samWasmModule.detectDocumentWithImageParameters(
      f.width,
      f.height,
      y.bgr0ImagePointer,
      0,
      // paramWidth should be 0 (default value)
      0,
      // paramHeight should be 0 (default value)
      0
      // documentDetectionOptions - speed option - set as "standard full method"
    );
    return y.free(), this.parseRawData(w);
  }
  async getOptimalRegionForCompressionDetection(o, f, i) {
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(
      o,
      f,
      i
    );
  }
};
var Jn = (() => {
  var u = import.meta.url;
  return (async function(o = {}) {
    var f, i = o, y, w, E = new Promise((r, e) => {
      y = r, w = e;
    }), S = typeof window == "object", T = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var P = Object.assign({}, i), C = "./this.program", A = (r, e) => {
      throw e;
    }, _ = "";
    function X(r) {
      return i.locateFile ? i.locateFile(r, _) : _ + r;
    }
    var Ke, De;
    (S || T) && (T ? _ = self.location.href : typeof document < "u" && document.currentScript && (_ = document.currentScript.src), u && (_ = u), _.startsWith("blob:") ? _ = "" : _ = _.slice(0, _.replace(/[?#].*/, "").lastIndexOf("/") + 1), T && (De = (r) => {
      var e = new XMLHttpRequest();
      return e.open("GET", r, !1), e.responseType = "arraybuffer", e.send(null), new Uint8Array(e.response);
    }), Ke = async (r) => {
      if (rr(r))
        return new Promise((t, n) => {
          var a = new XMLHttpRequest();
          a.open("GET", r, !0), a.responseType = "arraybuffer", a.onload = () => {
            if (a.status == 200 || a.status == 0 && a.response) {
              t(a.response);
              return;
            }
            n(a.status);
          }, a.onerror = n, a.send(null);
        });
      var e = await fetch(r, { credentials: "same-origin" });
      if (e.ok)
        return e.arrayBuffer();
      throw new Error(e.status + " : " + e.url);
    }), i.print || console.log.bind(console);
    var fe = i.printErr || console.error.bind(console);
    Object.assign(i, P), P = null, i.arguments && i.arguments, i.thisProgram && (C = i.thisProgram);
    var de = i.wasmBinary, ve, K = !1, me, x, k, ee, ie, L, b, Ze, Je, Qe, er, rr = (r) => r.startsWith("file://");
    function tr() {
      var r = ve.buffer;
      i.HEAP8 = x = new Int8Array(r), i.HEAP16 = ee = new Int16Array(r), i.HEAPU8 = k = new Uint8Array(r), i.HEAPU16 = ie = new Uint16Array(r), i.HEAP32 = L = new Int32Array(r), i.HEAPU32 = b = new Uint32Array(r), i.HEAPF32 = Ze = new Float32Array(r), i.HEAPF64 = er = new Float64Array(r), i.HEAP64 = Je = new BigInt64Array(r), i.HEAPU64 = Qe = new BigUint64Array(r);
    }
    function Hr() {
      if (i.preRun)
        for (typeof i.preRun == "function" && (i.preRun = [i.preRun]); i.preRun.length; )
          Jr(i.preRun.shift());
      ar(sr);
    }
    function Vr() {
      h.E();
    }
    function jr() {
      if (i.postRun)
        for (typeof i.postRun == "function" && (i.postRun = [i.postRun]); i.postRun.length; )
          Zr(i.postRun.shift());
      ar(ir);
    }
    var Z = 0, se = null;
    function Nr(r) {
      Z++, i.monitorRunDependencies?.(Z);
    }
    function Lr(r) {
      if (Z--, i.monitorRunDependencies?.(Z), Z == 0 && se) {
        var e = se;
        se = null, e();
      }
    }
    function pe(r) {
      i.onAbort?.(r), r = "Aborted(" + r + ")", fe(r), K = !0, r += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(r);
      throw w(e), e;
    }
    var Ie;
    function Br() {
      return i.locateFile ? X("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function zr(r) {
      if (r == Ie && de)
        return new Uint8Array(de);
      if (De)
        return De(r);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Gr(r) {
      if (!de)
        try {
          var e = await Ke(r);
          return new Uint8Array(e);
        } catch {
        }
      return zr(r);
    }
    async function qr(r, e) {
      try {
        var t = await Gr(r), n = await WebAssembly.instantiate(t, e);
        return n;
      } catch (a) {
        fe(`failed to asynchronously prepare wasm: ${a}`), pe(a);
      }
    }
    async function Yr(r, e, t) {
      if (!r && typeof WebAssembly.instantiateStreaming == "function" && !rr(e))
        try {
          var n = fetch(e, { credentials: "same-origin" }), a = await WebAssembly.instantiateStreaming(n, t);
          return a;
        } catch (l) {
          fe(`wasm streaming compile failed: ${l}`), fe("falling back to ArrayBuffer instantiation");
        }
      return qr(e, t);
    }
    function Xr() {
      return { a: En };
    }
    async function Kr() {
      function r(l, c) {
        return h = l.exports, h = v.instrumentWasmExports(h), ve = h.D, tr(), h.J, Lr(), h;
      }
      Nr();
      function e(l) {
        return r(l.instance);
      }
      var t = Xr();
      if (i.instantiateWasm)
        return new Promise((l, c) => {
          i.instantiateWasm(t, (s, d) => {
            r(s), l(s.exports);
          });
        });
      Ie ??= Br();
      try {
        var n = await Yr(de, Ie, t), a = e(n);
        return a;
      } catch (l) {
        return w(l), Promise.reject(l);
      }
    }
    class nr {
      name = "ExitStatus";
      constructor(e) {
        this.message = `Program terminated with exit(${e})`, this.status = e;
      }
    }
    var ar = (r) => {
      for (; r.length > 0; )
        r.shift()(i);
    }, ir = [], Zr = (r) => ir.unshift(r), sr = [], Jr = (r) => sr.unshift(r), or = i.noExitRuntime || !0;
    class Qr {
      constructor(e) {
        this.excPtr = e, this.ptr = e - 24;
      }
      set_type(e) {
        b[this.ptr + 4 >> 2] = e;
      }
      get_type() {
        return b[this.ptr + 4 >> 2];
      }
      set_destructor(e) {
        b[this.ptr + 8 >> 2] = e;
      }
      get_destructor() {
        return b[this.ptr + 8 >> 2];
      }
      set_caught(e) {
        e = e ? 1 : 0, x[this.ptr + 12] = e;
      }
      get_caught() {
        return x[this.ptr + 12] != 0;
      }
      set_rethrown(e) {
        e = e ? 1 : 0, x[this.ptr + 13] = e;
      }
      get_rethrown() {
        return x[this.ptr + 13] != 0;
      }
      init(e, t) {
        this.set_adjusted_ptr(0), this.set_type(e), this.set_destructor(t);
      }
      set_adjusted_ptr(e) {
        b[this.ptr + 16 >> 2] = e;
      }
      get_adjusted_ptr() {
        return b[this.ptr + 16 >> 2];
      }
    }
    var lr = 0, et = (r, e, t) => {
      var n = new Qr(r);
      throw n.init(e, t), lr = r, lr;
    }, rt = () => pe(""), he = (r) => {
      if (r === null)
        return "null";
      var e = typeof r;
      return e === "object" || e === "array" || e === "function" ? r.toString() : "" + r;
    }, tt = () => {
      for (var r = new Array(256), e = 0; e < 256; ++e)
        r[e] = String.fromCharCode(e);
      ur = r;
    }, ur, R = (r) => {
      for (var e = "", t = r; k[t]; )
        e += ur[k[t++]];
      return e;
    }, re = {}, J = {}, ye = {}, te, g = (r) => {
      throw new te(r);
    }, cr, ge = (r) => {
      throw new cr(r);
    }, ne = (r, e, t) => {
      r.forEach((s) => ye[s] = e);
      function n(s) {
        var d = t(s);
        d.length !== r.length && ge("Mismatched type converter count");
        for (var p = 0; p < r.length; ++p)
          D(r[p], d[p]);
      }
      var a = new Array(e.length), l = [], c = 0;
      e.forEach((s, d) => {
        J.hasOwnProperty(s) ? a[d] = J[s] : (l.push(s), re.hasOwnProperty(s) || (re[s] = []), re[s].push(() => {
          a[d] = J[s], ++c, c === l.length && n(a);
        }));
      }), l.length === 0 && n(a);
    };
    function nt(r, e, t = {}) {
      var n = e.name;
      if (r || g(`type "${n}" must have a positive integer typeid pointer`), J.hasOwnProperty(r)) {
        if (t.ignoreDuplicateRegistrations)
          return;
        g(`Cannot register type '${n}' twice`);
      }
      if (J[r] = e, delete ye[r], re.hasOwnProperty(r)) {
        var a = re[r];
        delete re[r], a.forEach((l) => l());
      }
    }
    function D(r, e, t = {}) {
      return nt(r, e, t);
    }
    var fr = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? (n) => x[n] : (n) => k[n];
        case 2:
          return t ? (n) => ee[n >> 1] : (n) => ie[n >> 1];
        case 4:
          return t ? (n) => L[n >> 2] : (n) => b[n >> 2];
        case 8:
          return t ? (n) => Je[n >> 3] : (n) => Qe[n >> 3];
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, at = (r, e, t, n, a) => {
      e = R(e);
      var l = e.indexOf("u") != -1;
      D(r, { name: e, fromWireType: (c) => c, toWireType: function(c, s) {
        if (typeof s != "bigint" && typeof s != "number")
          throw new TypeError(`Cannot convert "${he(s)}" to ${this.name}`);
        return typeof s == "number" && (s = BigInt(s)), s;
      }, argPackAdvance: U, readValueFromPointer: fr(e, t, !l), destructorFunction: null });
    }, U = 8, it = (r, e, t, n) => {
      e = R(e), D(r, { name: e, fromWireType: function(a) {
        return !!a;
      }, toWireType: function(a, l) {
        return l ? t : n;
      }, argPackAdvance: U, readValueFromPointer: function(a) {
        return this.fromWireType(k[a]);
      }, destructorFunction: null });
    }, st = (r) => ({ count: r.count, deleteScheduled: r.deleteScheduled, preservePointerOnDelete: r.preservePointerOnDelete, ptr: r.ptr, ptrType: r.ptrType, smartPtr: r.smartPtr, smartPtrType: r.smartPtrType }), xe = (r) => {
      function e(t) {
        return t.$$.ptrType.registeredClass.name;
      }
      g(e(r) + " instance already deleted");
    }, Ue = !1, dr = (r) => {
    }, ot = (r) => {
      r.smartPtr ? r.smartPtrType.rawDestructor(r.smartPtr) : r.ptrType.registeredClass.rawDestructor(r.ptr);
    }, vr = (r) => {
      r.count.value -= 1;
      var e = r.count.value === 0;
      e && ot(r);
    }, mr = (r, e, t) => {
      if (e === t)
        return r;
      if (t.baseClass === void 0)
        return null;
      var n = mr(r, e, t.baseClass);
      return n === null ? null : t.downcast(n);
    }, pr = {}, lt = {}, ut = (r, e) => {
      for (e === void 0 && g("ptr should not be undefined"); r.baseClass; )
        e = r.upcast(e), r = r.baseClass;
      return e;
    }, ct = (r, e) => (e = ut(r, e), lt[e]), we = (r, e) => {
      (!e.ptrType || !e.ptr) && ge("makeClassHandle requires ptr and ptrType");
      var t = !!e.smartPtrType, n = !!e.smartPtr;
      return t !== n && ge("Both smartPtrType and smartPtr must be specified"), e.count = { value: 1 }, oe(Object.create(r, { $$: { value: e, writable: !0 } }));
    };
    function ft(r) {
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
      function a() {
        return this.isSmartPointer ? we(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: e, smartPtrType: this, smartPtr: r }) : we(this.registeredClass.instancePrototype, { ptrType: this, ptr: r });
      }
      var l = this.registeredClass.getActualType(e), c = pr[l];
      if (!c)
        return a.call(this);
      var s;
      this.isConst ? s = c.constPointerType : s = c.pointerType;
      var d = mr(e, this.registeredClass, s.registeredClass);
      return d === null ? a.call(this) : this.isSmartPointer ? we(s.registeredClass.instancePrototype, { ptrType: s, ptr: d, smartPtrType: this, smartPtr: r }) : we(s.registeredClass.instancePrototype, { ptrType: s, ptr: d });
    }
    var oe = (r) => typeof FinalizationRegistry > "u" ? (oe = (e) => e, r) : (Ue = new FinalizationRegistry((e) => {
      vr(e.$$);
    }), oe = (e) => {
      var t = e.$$, n = !!t.smartPtr;
      if (n) {
        var a = { $$: t };
        Ue.register(e, a, e);
      }
      return e;
    }, dr = (e) => Ue.unregister(e), oe(r)), dt = () => {
      Object.assign(_e.prototype, { isAliasOf(r) {
        if (!(this instanceof _e) || !(r instanceof _e))
          return !1;
        var e = this.$$.ptrType.registeredClass, t = this.$$.ptr;
        r.$$ = r.$$;
        for (var n = r.$$.ptrType.registeredClass, a = r.$$.ptr; e.baseClass; )
          t = e.upcast(t), e = e.baseClass;
        for (; n.baseClass; )
          a = n.upcast(a), n = n.baseClass;
        return e === n && t === a;
      }, clone() {
        if (this.$$.ptr || xe(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var r = oe(Object.create(Object.getPrototypeOf(this), { $$: { value: st(this.$$) } }));
        return r.$$.count.value += 1, r.$$.deleteScheduled = !1, r;
      }, delete() {
        this.$$.ptr || xe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), dr(this), vr(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || xe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function _e() {
    }
    var be = (r, e) => Object.defineProperty(e, "name", { value: r }), vt = (r, e, t) => {
      if (r[e].overloadTable === void 0) {
        var n = r[e];
        r[e] = function(...a) {
          return r[e].overloadTable.hasOwnProperty(a.length) || g(`Function '${t}' called with an invalid number of arguments (${a.length}) - expects one of (${r[e].overloadTable})!`), r[e].overloadTable[a.length].apply(this, a);
        }, r[e].overloadTable = [], r[e].overloadTable[n.argCount] = n;
      }
    }, He = (r, e, t) => {
      i.hasOwnProperty(r) ? ((t === void 0 || i[r].overloadTable !== void 0 && i[r].overloadTable[t] !== void 0) && g(`Cannot register public name '${r}' twice`), vt(i, r, r), i[r].overloadTable.hasOwnProperty(t) && g(`Cannot register multiple overloads of a function with the same number of arguments (${t})!`), i[r].overloadTable[t] = e) : (i[r] = e, i[r].argCount = t);
    }, mt = 48, pt = 57, ht = (r) => {
      r = r.replace(/[^a-zA-Z0-9_]/g, "$");
      var e = r.charCodeAt(0);
      return e >= mt && e <= pt ? `_${r}` : r;
    };
    function yt(r, e, t, n, a, l, c, s) {
      this.name = r, this.constructor = e, this.instancePrototype = t, this.rawDestructor = n, this.baseClass = a, this.getActualType = l, this.upcast = c, this.downcast = s, this.pureVirtualFunctions = [];
    }
    var $e = (r, e, t) => {
      for (; e !== t; )
        e.upcast || g(`Expected null or instance of ${t.name}, got an instance of ${e.name}`), r = e.upcast(r), e = e.baseClass;
      return r;
    };
    function gt(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${he(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = $e(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function wt(r, e) {
      var t;
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), this.isSmartPointer ? (t = this.rawConstructor(), r !== null && r.push(this.rawDestructor, t), t) : 0;
      (!e || !e.$$) && g(`Cannot pass "${he(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
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
              var a = e.clone();
              t = this.rawShare(t, I.toHandle(() => a.delete())), r !== null && r.push(this.rawDestructor, t);
            }
            break;
          default:
            g("Unsupporting sharing policy");
        }
      return t;
    }
    function _t(r, e) {
      if (e === null)
        return this.isReference && g(`null is not a valid ${this.name}`), 0;
      e.$$ || g(`Cannot pass "${he(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.ptrType.name} to parameter type ${this.name}`);
      var t = e.$$.ptrType.registeredClass, n = $e(e.$$.ptr, t, this.registeredClass);
      return n;
    }
    function Pe(r) {
      return this.fromWireType(b[r >> 2]);
    }
    var bt = () => {
      Object.assign(Ce.prototype, { getPointee(r) {
        return this.rawGetPointee && (r = this.rawGetPointee(r)), r;
      }, destructor(r) {
        this.rawDestructor?.(r);
      }, argPackAdvance: U, readValueFromPointer: Pe, fromWireType: ft });
    };
    function Ce(r, e, t, n, a, l, c, s, d, p, m) {
      this.name = r, this.registeredClass = e, this.isReference = t, this.isConst = n, this.isSmartPointer = a, this.pointeeType = l, this.sharingPolicy = c, this.rawGetPointee = s, this.rawConstructor = d, this.rawShare = p, this.rawDestructor = m, !a && e.baseClass === void 0 ? n ? (this.toWireType = gt, this.destructorFunction = null) : (this.toWireType = _t, this.destructorFunction = null) : this.toWireType = wt;
    }
    var hr = (r, e, t) => {
      i.hasOwnProperty(r) || ge("Replacing nonexistent public symbol"), i[r].overloadTable !== void 0 && t !== void 0 ? i[r].overloadTable[t] = e : (i[r] = e, i[r].argCount = t);
    }, $t = (r, e, t) => {
      r = r.replace(/p/g, "i");
      var n = i["dynCall_" + r];
      return n(e, ...t);
    }, Pt = (r, e, t = []) => {
      var n = $t(r, e, t);
      return n;
    }, Ct = (r, e) => (...t) => Pt(r, e, t), B = (r, e) => {
      r = R(r);
      function t() {
        return Ct(r, e);
      }
      var n = t();
      return typeof n != "function" && g(`unknown function pointer with signature ${r}: ${e}`), n;
    }, Tt = (r, e) => {
      var t = be(e, function(n) {
        this.name = e, this.message = n;
        var a = new Error(n).stack;
        a !== void 0 && (this.stack = this.toString() + `
` + a.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return t.prototype = Object.create(r.prototype), t.prototype.constructor = t, t.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, t;
    }, yr, gr = (r) => {
      var e = Sn(r), t = R(e);
      return N(e), t;
    }, le = (r, e) => {
      var t = [], n = {};
      function a(l) {
        if (!n[l] && !J[l]) {
          if (ye[l]) {
            ye[l].forEach(a);
            return;
          }
          t.push(l), n[l] = !0;
        }
      }
      throw e.forEach(a), new yr(`${r}: ` + t.map(gr).join([", "]));
    }, Et = (r, e, t, n, a, l, c, s, d, p, m, $, M) => {
      m = R(m), l = B(a, l), s &&= B(c, s), p &&= B(d, p), M = B($, M);
      var H = ht(m);
      He(H, function() {
        le(`Cannot construct ${m} due to unbound types`, [n]);
      }), ne([r, e, t], n ? [n] : [], (V) => {
        V = V[0];
        var G, O;
        n ? (G = V.registeredClass, O = G.instancePrototype) : O = _e.prototype;
        var j = be(m, function(...qe) {
          if (Object.getPrototypeOf(this) !== q)
            throw new te("Use 'new' to construct " + m);
          if (W.constructor_body === void 0)
            throw new te(m + " has no accessible constructor");
          var Mr = W.constructor_body[qe.length];
          if (Mr === void 0)
            throw new te(`Tried to invoke ctor of ${m} with invalid number of parameters (${qe.length}) - expected (${Object.keys(W.constructor_body).toString()}) parameters instead!`);
          return Mr.apply(this, qe);
        }), q = Object.create(O, { constructor: { value: j } });
        j.prototype = q;
        var W = new yt(m, j, q, M, G, l, s, p);
        W.baseClass && (W.baseClass.__derivedClasses ??= [], W.baseClass.__derivedClasses.push(W));
        var Y = new Ce(m, W, !0, !1, !1), Ee = new Ce(m + "*", W, !1, !1, !1), Rr = new Ce(m + " const*", W, !1, !0, !1);
        return pr[r] = { pointerType: Ee, constPointerType: Rr }, hr(H, j), [Y, Ee, Rr];
      });
    }, wr = (r, e) => {
      for (var t = [], n = 0; n < r; n++)
        t.push(b[e + n * 4 >> 2]);
      return t;
    }, Ve = (r) => {
      for (; r.length; ) {
        var e = r.pop(), t = r.pop();
        t(e);
      }
    };
    function St(r) {
      for (var e = 1; e < r.length; ++e)
        if (r[e] !== null && r[e].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Te = (r) => {
      try {
        return r();
      } catch (e) {
        pe(e);
      }
    }, _r = (r) => {
      if (r instanceof nr || r == "unwind")
        return me;
      A(1, r);
    }, br = 0, $r = () => or || br > 0, Pr = (r) => {
      me = r, $r() || (i.onExit?.(r), K = !0), A(r, new nr(r));
    }, At = (r, e) => {
      me = r, Pr(r);
    }, Rt = At, Mt = () => {
      if (!$r())
        try {
          Rt(me);
        } catch (r) {
          _r(r);
        }
    }, Cr = (r) => {
      if (!K)
        try {
          r(), Mt();
        } catch (e) {
          _r(e);
        }
    }, v = { instrumentWasmImports(r) {
      var e = /^(__asyncjs__.*)$/;
      for (let [t, n] of Object.entries(r))
        typeof n == "function" && (n.isAsync || e.test(t));
    }, instrumentWasmExports(r) {
      var e = {};
      for (let [t, n] of Object.entries(r))
        typeof n == "function" ? e[t] = (...a) => {
          v.exportCallStack.push(t);
          try {
            return n(...a);
          } finally {
            K || (v.exportCallStack.pop(), v.maybeStopUnwind());
          }
        } : e[t] = n;
      return e;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(r) {
      var e = v.callStackNameToId[r];
      return e === void 0 && (e = v.callStackId++, v.callStackNameToId[r] = e, v.callStackIdToName[e] = r), e;
    }, maybeStopUnwind() {
      v.currData && v.state === v.State.Unwinding && v.exportCallStack.length === 0 && (v.state = v.State.Normal, Te(Mn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((r, e) => {
        v.asyncPromiseHandlers = { resolve: r, reject: e };
      });
    }, allocateData() {
      var r = ze(12 + v.StackSize);
      return v.setDataHeader(r, r + 12, v.StackSize), v.setDataRewindFunc(r), r;
    }, setDataHeader(r, e, t) {
      b[r >> 2] = e, b[r + 4 >> 2] = e + t;
    }, setDataRewindFunc(r) {
      var e = v.exportCallStack[0], t = v.getCallStackId(e);
      L[r + 8 >> 2] = t;
    }, getDataRewindFuncName(r) {
      var e = L[r + 8 >> 2], t = v.callStackIdToName[e];
      return t;
    }, getDataRewindFunc(r) {
      var e = h[r];
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
              v.state = v.State.Rewinding, Te(() => Wn(v.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var a, l = !1;
              try {
                a = v.doRewind(v.currData);
              } catch (d) {
                a = d, l = !0;
              }
              var c = !1;
              if (!v.currData) {
                var s = v.asyncPromiseHandlers;
                s && (v.asyncPromiseHandlers = null, (l ? s.reject : s.resolve)(a), c = !0);
              }
              if (l && !c)
                throw a;
            }
          }), t = !0, e || (v.state = v.State.Unwinding, v.currData = v.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Te(() => Rn(v.currData)));
        } else v.state === v.State.Rewinding ? (v.state = v.State.Normal, Te(Fn), N(v.currData), v.currData = null, v.sleepCallbacks.forEach(Cr)) : pe(`invalid state: ${v.state}`);
        return v.handleSleepReturnValue;
      }
    }, handleAsync(r) {
      return v.handleSleep((e) => {
        r().then(e);
      });
    } };
    function Tr(r, e, t, n, a, l) {
      var c = e.length;
      c < 2 && g("argTypes array size mismatch! Must at least get return value and 'this' types!"), e[1];
      var s = St(e), d = e[0].name !== "void", p = c - 2, m = new Array(p), $ = [], M = [], H = function(...V) {
        M.length = 0;
        var G;
        $.length = 1, $[0] = a;
        for (var O = 0; O < p; ++O)
          m[O] = e[O + 2].toWireType(M, V[O]), $.push(m[O]);
        var j = n(...$);
        function q(W) {
          if (s)
            Ve(M);
          else
            for (var Y = 2; Y < e.length; Y++) {
              var Ee = Y === 1 ? G : m[Y - 2];
              e[Y].destructorFunction !== null && e[Y].destructorFunction(Ee);
            }
          if (d)
            return e[0].fromWireType(W);
        }
        return v.currData ? v.whenDone().then(q) : q(j);
      };
      return be(r, H);
    }
    var Wt = (r, e, t, n, a, l) => {
      var c = wr(e, t);
      a = B(n, a), ne([], [r], (s) => {
        s = s[0];
        var d = `constructor ${s.name}`;
        if (s.registeredClass.constructor_body === void 0 && (s.registeredClass.constructor_body = []), s.registeredClass.constructor_body[e - 1] !== void 0)
          throw new te(`Cannot register multiple constructors with identical number of parameters (${e - 1}) for class '${s.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return s.registeredClass.constructor_body[e - 1] = () => {
          le(`Cannot construct ${s.name} due to unbound types`, c);
        }, ne([], c, (p) => (p.splice(1, 0, null), s.registeredClass.constructor_body[e - 1] = Tr(d, p, null, a, l), [])), [];
      });
    }, Er = (r, e, t) => (r instanceof Object || g(`${t} with invalid "this": ${r}`), r instanceof e.registeredClass.constructor || g(`${t} incompatible with "this" of type ${r.constructor.name}`), r.$$.ptr || g(`cannot call emscripten binding method ${t} on deleted object`), $e(r.$$.ptr, r.$$.ptrType.registeredClass, e.registeredClass)), Ft = (r, e, t, n, a, l, c, s, d, p) => {
      e = R(e), a = B(n, a), ne([], [r], (m) => {
        m = m[0];
        var $ = `${m.name}.${e}`, M = { get() {
          le(`Cannot access ${$} due to unbound types`, [t, c]);
        }, enumerable: !0, configurable: !0 };
        return d ? M.set = () => le(`Cannot access ${$} due to unbound types`, [t, c]) : M.set = (H) => g($ + " is a read-only property"), Object.defineProperty(m.registeredClass.instancePrototype, e, M), ne([], d ? [t, c] : [t], (H) => {
          var V = H[0], G = { get() {
            var j = Er(this, m, $ + " getter");
            return V.fromWireType(a(l, j));
          }, enumerable: !0 };
          if (d) {
            d = B(s, d);
            var O = H[1];
            G.set = function(j) {
              var q = Er(this, m, $ + " setter"), W = [];
              d(p, q, O.toWireType(W, j)), Ve(W);
            };
          }
          return Object.defineProperty(m.registeredClass.instancePrototype, e, G), [];
        }), [];
      });
    }, je = [], z = [], Ne = (r) => {
      r > 9 && --z[r + 1] === 0 && (z[r] = void 0, je.push(r));
    }, kt = () => z.length / 2 - 5 - je.length, Ot = () => {
      z.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), i.count_emval_handles = kt;
    }, I = { toValue: (r) => (r || g("Cannot use deleted val. handle = " + r), z[r]), toHandle: (r) => {
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
          const e = je.pop() || z.length;
          return z[e] = r, z[e + 1] = 1, e;
        }
      }
    } }, Dt = { name: "emscripten::val", fromWireType: (r) => {
      var e = I.toValue(r);
      return Ne(r), e;
    }, toWireType: (r, e) => I.toHandle(e), argPackAdvance: U, readValueFromPointer: Pe, destructorFunction: null }, It = (r) => D(r, Dt), xt = (r, e, t) => {
      switch (e) {
        case 1:
          return t ? function(n) {
            return this.fromWireType(x[n]);
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
            return this.fromWireType(L[n >> 2]);
          } : function(n) {
            return this.fromWireType(b[n >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${e}): ${r}`);
      }
    }, Ut = (r, e, t, n) => {
      e = R(e);
      function a() {
      }
      a.values = {}, D(r, { name: e, constructor: a, fromWireType: function(l) {
        return this.constructor.values[l];
      }, toWireType: (l, c) => c.value, argPackAdvance: U, readValueFromPointer: xt(e, t, n), destructorFunction: null }), He(e, a);
    }, Le = (r, e) => {
      var t = J[r];
      return t === void 0 && g(`${e} has unknown type ${gr(r)}`), t;
    }, Ht = (r, e, t) => {
      var n = Le(r, "enum");
      e = R(e);
      var a = n.constructor, l = Object.create(n.constructor.prototype, { value: { value: t }, constructor: { value: be(`${n.name}_${e}`, function() {
      }) } });
      a.values[t] = l, a[e] = l;
    }, Vt = (r, e) => {
      switch (e) {
        case 4:
          return function(t) {
            return this.fromWireType(Ze[t >> 2]);
          };
        case 8:
          return function(t) {
            return this.fromWireType(er[t >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${e}): ${r}`);
      }
    }, jt = (r, e, t) => {
      e = R(e), D(r, { name: e, fromWireType: (n) => n, toWireType: (n, a) => a, argPackAdvance: U, readValueFromPointer: Vt(e, t), destructorFunction: null });
    }, Nt = (r) => {
      r = r.trim();
      const e = r.indexOf("(");
      return e === -1 ? r : r.slice(0, e);
    }, Lt = (r, e, t, n, a, l, c, s) => {
      var d = wr(e, t);
      r = R(r), r = Nt(r), a = B(n, a), He(r, function() {
        le(`Cannot call ${r} due to unbound types`, d);
      }, e - 1), ne([], d, (p) => {
        var m = [p[0], null].concat(p.slice(1));
        return hr(r, Tr(r, m, null, a, l), e - 1), [];
      });
    }, Bt = (r, e, t, n, a) => {
      e = R(e);
      var l = (m) => m;
      if (n === 0) {
        var c = 32 - 8 * t;
        l = (m) => m << c >>> c;
      }
      var s = e.includes("unsigned"), d = (m, $) => {
      }, p;
      s ? p = function(m, $) {
        return d($, this.name), $ >>> 0;
      } : p = function(m, $) {
        return d($, this.name), $;
      }, D(r, { name: e, fromWireType: l, toWireType: p, argPackAdvance: U, readValueFromPointer: fr(e, t, n !== 0), destructorFunction: null });
    }, zt = (r, e, t) => {
      var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], a = n[e];
      function l(c) {
        var s = b[c >> 2], d = b[c + 4 >> 2];
        return new a(x.buffer, d, s);
      }
      t = R(t), D(r, { name: t, fromWireType: l, argPackAdvance: U, readValueFromPointer: l }, { ignoreDuplicateRegistrations: !0 });
    }, Gt = (r, e, t, n) => {
      if (!(n > 0)) return 0;
      for (var a = t, l = t + n - 1, c = 0; c < r.length; ++c) {
        var s = r.charCodeAt(c);
        if (s >= 55296 && s <= 57343) {
          var d = r.charCodeAt(++c);
          s = 65536 + ((s & 1023) << 10) | d & 1023;
        }
        if (s <= 127) {
          if (t >= l) break;
          e[t++] = s;
        } else if (s <= 2047) {
          if (t + 1 >= l) break;
          e[t++] = 192 | s >> 6, e[t++] = 128 | s & 63;
        } else if (s <= 65535) {
          if (t + 2 >= l) break;
          e[t++] = 224 | s >> 12, e[t++] = 128 | s >> 6 & 63, e[t++] = 128 | s & 63;
        } else {
          if (t + 3 >= l) break;
          e[t++] = 240 | s >> 18, e[t++] = 128 | s >> 12 & 63, e[t++] = 128 | s >> 6 & 63, e[t++] = 128 | s & 63;
        }
      }
      return e[t] = 0, t - a;
    }, qt = (r, e, t) => Gt(r, k, e, t), Yt = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n <= 127 ? e++ : n <= 2047 ? e += 2 : n >= 55296 && n <= 57343 ? (e += 4, ++t) : e += 3;
      }
      return e;
    }, Sr = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Xt = (r, e = 0, t = NaN) => {
      for (var n = e + t, a = e; r[a] && !(a >= n); ) ++a;
      if (a - e > 16 && r.buffer && Sr)
        return Sr.decode(r.subarray(e, a));
      for (var l = ""; e < a; ) {
        var c = r[e++];
        if (!(c & 128)) {
          l += String.fromCharCode(c);
          continue;
        }
        var s = r[e++] & 63;
        if ((c & 224) == 192) {
          l += String.fromCharCode((c & 31) << 6 | s);
          continue;
        }
        var d = r[e++] & 63;
        if ((c & 240) == 224 ? c = (c & 15) << 12 | s << 6 | d : c = (c & 7) << 18 | s << 12 | d << 6 | r[e++] & 63, c < 65536)
          l += String.fromCharCode(c);
        else {
          var p = c - 65536;
          l += String.fromCharCode(55296 | p >> 10, 56320 | p & 1023);
        }
      }
      return l;
    }, Kt = (r, e) => r ? Xt(k, r, e) : "", Zt = (r, e) => {
      e = R(e), D(r, { name: e, fromWireType(t) {
        for (var n = b[t >> 2], a = t + 4, l, c, s = a, c = 0; c <= n; ++c) {
          var d = a + c;
          if (c == n || k[d] == 0) {
            var p = d - s, m = Kt(s, p);
            l === void 0 ? l = m : (l += "\0", l += m), s = d + 1;
          }
        }
        return N(t), l;
      }, toWireType(t, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var a, l = typeof n == "string";
        l || n instanceof Uint8Array || n instanceof Uint8ClampedArray || n instanceof Int8Array || g("Cannot pass non-string to std::string"), l ? a = Yt(n) : a = n.length;
        var c = ze(4 + a + 1), s = c + 4;
        if (b[c >> 2] = a, l)
          qt(n, s, a + 1);
        else if (l)
          for (var d = 0; d < a; ++d) {
            var p = n.charCodeAt(d);
            p > 255 && (N(c), g("String has UTF-16 code units that do not fit in 8 bits")), k[s + d] = p;
          }
        else
          for (var d = 0; d < a; ++d)
            k[s + d] = n[d];
        return t !== null && t.push(N, c), c;
      }, argPackAdvance: U, readValueFromPointer: Pe, destructorFunction(t) {
        N(t);
      } });
    }, Ar = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Jt = (r, e) => {
      for (var t = r, n = t >> 1, a = n + e / 2; !(n >= a) && ie[n]; ) ++n;
      if (t = n << 1, t - r > 32 && Ar) return Ar.decode(k.subarray(r, t));
      for (var l = "", c = 0; !(c >= e / 2); ++c) {
        var s = ee[r + c * 2 >> 1];
        if (s == 0) break;
        l += String.fromCharCode(s);
      }
      return l;
    }, Qt = (r, e, t) => {
      if (t ??= 2147483647, t < 2) return 0;
      t -= 2;
      for (var n = e, a = t < r.length * 2 ? t / 2 : r.length, l = 0; l < a; ++l) {
        var c = r.charCodeAt(l);
        ee[e >> 1] = c, e += 2;
      }
      return ee[e >> 1] = 0, e - n;
    }, en = (r) => r.length * 2, rn = (r, e) => {
      for (var t = 0, n = ""; !(t >= e / 4); ) {
        var a = L[r + t * 4 >> 2];
        if (a == 0) break;
        if (++t, a >= 65536) {
          var l = a - 65536;
          n += String.fromCharCode(55296 | l >> 10, 56320 | l & 1023);
        } else
          n += String.fromCharCode(a);
      }
      return n;
    }, tn = (r, e, t) => {
      if (t ??= 2147483647, t < 4) return 0;
      for (var n = e, a = n + t - 4, l = 0; l < r.length; ++l) {
        var c = r.charCodeAt(l);
        if (c >= 55296 && c <= 57343) {
          var s = r.charCodeAt(++l);
          c = 65536 + ((c & 1023) << 10) | s & 1023;
        }
        if (L[e >> 2] = c, e += 4, e + 4 > a) break;
      }
      return L[e >> 2] = 0, e - n;
    }, nn = (r) => {
      for (var e = 0, t = 0; t < r.length; ++t) {
        var n = r.charCodeAt(t);
        n >= 55296 && n <= 57343 && ++t, e += 4;
      }
      return e;
    }, an = (r, e, t) => {
      t = R(t);
      var n, a, l, c;
      e === 2 ? (n = Jt, a = Qt, c = en, l = (s) => ie[s >> 1]) : e === 4 && (n = rn, a = tn, c = nn, l = (s) => b[s >> 2]), D(r, { name: t, fromWireType: (s) => {
        for (var d = b[s >> 2], p, m = s + 4, $ = 0; $ <= d; ++$) {
          var M = s + 4 + $ * e;
          if ($ == d || l(M) == 0) {
            var H = M - m, V = n(m, H);
            p === void 0 ? p = V : (p += "\0", p += V), m = M + e;
          }
        }
        return N(s), p;
      }, toWireType: (s, d) => {
        typeof d != "string" && g(`Cannot pass non-string to C++ string type ${t}`);
        var p = c(d), m = ze(4 + p + e);
        return b[m >> 2] = p / e, a(d, m + 4, p + e), s !== null && s.push(N, m), m;
      }, argPackAdvance: U, readValueFromPointer: Pe, destructorFunction(s) {
        N(s);
      } });
    }, sn = (r, e) => {
      e = R(e), D(r, { isVoid: !0, name: e, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (t, n) => {
      } });
    }, on = () => {
      or = !1, br = 0;
    }, ln = (r, e, t) => {
      var n = [], a = r.toWireType(n, t);
      return n.length && (b[e >> 2] = I.toHandle(n)), a;
    }, un = (r, e, t) => (r = I.toValue(r), e = Le(e, "emval::as"), ln(e, t, r)), cn = (r, e) => (r = I.toValue(r), e = I.toValue(e), I.toHandle(r[e])), fn = {}, dn = (r) => {
      var e = fn[r];
      return e === void 0 ? R(r) : e;
    }, vn = (r) => I.toHandle(dn(r)), mn = (r) => {
      var e = I.toValue(r);
      Ve(e), Ne(r);
    }, pn = (r, e) => {
      r = Le(r, "_emval_take_value");
      var t = r.readValueFromPointer(e);
      return I.toHandle(t);
    }, ue = {}, hn = () => performance.now(), yn = (r, e) => {
      if (ue[r] && (clearTimeout(ue[r].id), delete ue[r]), !e) return 0;
      var t = setTimeout(() => {
        delete ue[r], Cr(() => An(r, hn()));
      }, e);
      return ue[r] = { id: t, timeout_ms: e }, 0;
    }, gn = () => 2147483648, wn = (r, e) => Math.ceil(r / e) * e, _n = (r) => {
      var e = ve.buffer, t = (r - e.byteLength + 65535) / 65536 | 0;
      try {
        return ve.grow(t), tr(), 1;
      } catch {
      }
    }, bn = (r) => {
      var e = k.length;
      r >>>= 0;
      var t = gn();
      if (r > t)
        return !1;
      for (var n = 1; n <= 4; n *= 2) {
        var a = e * (1 + 0.2 / n);
        a = Math.min(a, r + 100663296);
        var l = Math.min(t, wn(Math.max(r, a), 65536)), c = _n(l);
        if (c)
          return !0;
      }
      return !1;
    }, Be = {}, $n = () => C || "./this.program", ce = () => {
      if (!ce.strings) {
        var r = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", e = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: r, _: $n() };
        for (var t in Be)
          Be[t] === void 0 ? delete e[t] : e[t] = Be[t];
        var n = [];
        for (var t in e)
          n.push(`${t}=${e[t]}`);
        ce.strings = n;
      }
      return ce.strings;
    }, Pn = (r, e) => {
      for (var t = 0; t < r.length; ++t)
        x[e++] = r.charCodeAt(t);
      x[e] = 0;
    }, Cn = (r, e) => {
      var t = 0;
      return ce().forEach((n, a) => {
        var l = e + t;
        b[r + a * 4 >> 2] = l, Pn(n, l), t += n.length + 1;
      }), 0;
    }, Tn = (r, e) => {
      var t = ce();
      b[r >> 2] = t.length;
      var n = 0;
      return t.forEach((a) => n += a.length + 1), b[e >> 2] = n, 0;
    };
    tt(), te = i.BindingError = class extends Error {
      constructor(e) {
        super(e), this.name = "BindingError";
      }
    }, cr = i.InternalError = class extends Error {
      constructor(e) {
        super(e), this.name = "InternalError";
      }
    }, dt(), bt(), yr = i.UnboundTypeError = Tt(Error, "UnboundTypeError"), Ot();
    var En = { g: et, u: rt, n: at, y: it, f: Et, d: Wt, a: Ft, w: It, l: Ut, h: Ht, m: jt, b: Lt, e: Bt, c: zt, x: Zt, i: an, z: sn, q: on, j: un, A: Ne, k: cn, o: vn, C: mn, B: pn, r: yn, v: bn, s: Cn, t: Tn, p: Pr }, h = await Kr();
    h.E;
    var Sn = h.F, ze = i._malloc = h.G, N = i._free = h.H, An = h.I;
    i.dynCall_v = h.K, i.dynCall_ii = h.L, i.dynCall_vi = h.M, i.dynCall_i = h.N, i.dynCall_iii = h.O, i.dynCall_viii = h.P, i.dynCall_fii = h.Q, i.dynCall_viif = h.R, i.dynCall_viiii = h.S, i.dynCall_viiiiii = h.T, i.dynCall_iiiiii = h.U, i.dynCall_viiiii = h.V, i.dynCall_iiiiiii = h.W, i.dynCall_iiiiiiii = h.X, i.dynCall_viiiiiii = h.Y, i.dynCall_viiiiiiiiidi = h.Z, i.dynCall_viiiiiiiidi = h._, i.dynCall_viiiiiiiiii = h.$, i.dynCall_viiiiiiiii = h.aa, i.dynCall_viiiiiiii = h.ba, i.dynCall_iiiii = h.ca, i.dynCall_iiii = h.da;
    var Rn = h.ea, Mn = h.fa, Wn = h.ga, Fn = h.ha;
    function Ge() {
      if (Z > 0) {
        se = Ge;
        return;
      }
      if (Hr(), Z > 0) {
        se = Ge;
        return;
      }
      function r() {
        i.calledRun = !0, !K && (Vr(), y(i), i.onRuntimeInitialized?.(), jr());
      }
      i.setStatus ? (i.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => i.setStatus(""), 1), r();
      }, 1)) : r();
    }
    if (i.preInit)
      for (typeof i.preInit == "function" && (i.preInit = [i.preInit]); i.preInit.length > 0; )
        i.preInit.pop()();
    return Ge(), f = E, f;
  });
})();
class Qn extends Zn {
  fetchSamModule(o) {
    return Jn(o);
  }
  getSamWasmFilePath(o, f) {
    return `${o}/document/wasm/${f}`;
  }
}
Xe(Qn);
