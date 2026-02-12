const fo = /* @__PURE__ */ Symbol("Comlink.proxy"), Po = /* @__PURE__ */ Symbol("Comlink.endpoint"), Io = /* @__PURE__ */ Symbol("Comlink.releaseProxy"), Tt = /* @__PURE__ */ Symbol("Comlink.finalizer"), kt = /* @__PURE__ */ Symbol("Comlink.thrown"), po = (g) => typeof g == "object" && g !== null || typeof g == "function", jo = {
  canHandle: (g) => po(g) && g[fo],
  serialize(g) {
    const { port1: c, port2: r } = new MessageChannel();
    return Ln(g, c), [r, [r]];
  },
  deserialize(g) {
    return g.start(), ko(g);
  }
}, Co = {
  canHandle: (g) => po(g) && kt in g,
  serialize({ value: g }) {
    let c;
    return g instanceof Error ? c = {
      isError: !0,
      value: {
        message: g.message,
        name: g.name,
        stack: g.stack
      }
    } : c = { isError: !1, value: g }, [c, []];
  },
  deserialize(g) {
    throw g.isError ? Object.assign(new Error(g.value.message), g.value) : g.value;
  }
}, mo = /* @__PURE__ */ new Map([
  ["proxy", jo],
  ["throw", Co]
]);
function So(g, c) {
  for (const r of g)
    if (c === r || r === "*" || r instanceof RegExp && r.test(c))
      return !0;
  return !1;
}
function Ln(g, c = globalThis, r = ["*"]) {
  c.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!So(r, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: n, type: o, path: d } = Object.assign({ path: [] }, e.data), u = (e.data.argumentList || []).map(Ve);
    let w;
    try {
      const A = d.slice(0, -1).reduce((I, S) => I[S], g), v = d.reduce((I, S) => I[S], g);
      switch (o) {
        case "GET":
          w = v;
          break;
        case "SET":
          A[d.slice(-1)[0]] = Ve(e.data.value), w = !0;
          break;
        case "APPLY":
          w = v.apply(A, u);
          break;
        case "CONSTRUCT":
          {
            const I = new v(...u);
            w = Mo(I);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: I, port2: S } = new MessageChannel();
            Ln(g, S), w = Eo(I, [I]);
          }
          break;
        case "RELEASE":
          w = void 0;
          break;
        default:
          return;
      }
    } catch (A) {
      w = { value: A, [kt]: 0 };
    }
    Promise.resolve(w).catch((A) => ({ value: A, [kt]: 0 })).then((A) => {
      const [v, I] = _t(A);
      c.postMessage(Object.assign(Object.assign({}, v), { id: n }), I), o === "RELEASE" && (c.removeEventListener("message", t), yo(c), Tt in g && typeof g[Tt] == "function" && g[Tt]());
    }).catch((A) => {
      const [v, I] = _t({
        value: new TypeError("Unserializable return value"),
        [kt]: 0
      });
      c.postMessage(Object.assign(Object.assign({}, v), { id: n }), I);
    });
  }), c.start && c.start();
}
function To(g) {
  return g.constructor.name === "MessagePort";
}
function yo(g) {
  To(g) && g.close();
}
function ko(g, c) {
  const r = /* @__PURE__ */ new Map();
  return g.addEventListener("message", function(e) {
    const { data: n } = e;
    if (!n || !n.id)
      return;
    const o = r.get(n.id);
    if (o)
      try {
        o(n);
      } finally {
        r.delete(n.id);
      }
  }), Fn(g, r, [], c);
}
function St(g) {
  if (g)
    throw new Error("Proxy has been released and is not useable");
}
function go(g) {
  return Ge(g, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    yo(g);
  });
}
const At = /* @__PURE__ */ new WeakMap(), Dt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((g) => {
  const c = (At.get(g) || 0) - 1;
  At.set(g, c), c === 0 && go(g);
});
function Ao(g, c) {
  const r = (At.get(c) || 0) + 1;
  At.set(c, r), Dt && Dt.register(g, c, g);
}
function Do(g) {
  Dt && Dt.unregister(g);
}
function Fn(g, c, r = [], t = function() {
}) {
  let e = !1;
  const n = new Proxy(t, {
    get(o, d) {
      if (St(e), d === Io)
        return () => {
          Do(n), go(g), c.clear(), e = !0;
        };
      if (d === "then") {
        if (r.length === 0)
          return { then: () => n };
        const u = Ge(g, c, {
          type: "GET",
          path: r.map((w) => w.toString())
        }).then(Ve);
        return u.then.bind(u);
      }
      return Fn(g, c, [...r, d]);
    },
    set(o, d, u) {
      St(e);
      const [w, A] = _t(u);
      return Ge(g, c, {
        type: "SET",
        path: [...r, d].map((v) => v.toString()),
        value: w
      }, A).then(Ve);
    },
    apply(o, d, u) {
      St(e);
      const w = r[r.length - 1];
      if (w === Po)
        return Ge(g, c, {
          type: "ENDPOINT"
        }).then(Ve);
      if (w === "bind")
        return Fn(g, c, r.slice(0, -1));
      const [A, v] = Nn(u);
      return Ge(g, c, {
        type: "APPLY",
        path: r.map((I) => I.toString()),
        argumentList: A
      }, v).then(Ve);
    },
    construct(o, d) {
      St(e);
      const [u, w] = Nn(d);
      return Ge(g, c, {
        type: "CONSTRUCT",
        path: r.map((A) => A.toString()),
        argumentList: u
      }, w).then(Ve);
    }
  });
  return Ao(n, g), n;
}
function _o(g) {
  return Array.prototype.concat.apply([], g);
}
function Nn(g) {
  const c = g.map(_t);
  return [c.map((r) => r[0]), _o(c.map((r) => r[1]))];
}
const ho = /* @__PURE__ */ new WeakMap();
function Eo(g, c) {
  return ho.set(g, c), g;
}
function Mo(g) {
  return Object.assign(g, { [fo]: !0 });
}
function _t(g) {
  for (const [c, r] of mo)
    if (r.canHandle(g)) {
      const [t, e] = r.serialize(g);
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
      value: g
    },
    ho.get(g) || []
  ];
}
function Ve(g) {
  switch (g.type) {
    case "HANDLER":
      return mo.get(g.name).deserialize(g.value);
    case "RAW":
      return g.value;
  }
}
function Ge(g, c, r, t) {
  return new Promise((e) => {
    const n = Ro();
    c.set(n, e), g.start && g.start(), g.postMessage(Object.assign({ id: n }, r), t);
  });
}
function Ro() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const Ct = 1e3, $n = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Fo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class fe extends Error {
  cause;
  constructor(c, r) {
    super(c), this.name = "AutoCaptureError", this.cause = r;
  }
  // Change this to Decorator when they will be in stable release
  static logError(c) {
  }
  static fromCameraError(c) {
    if (this.logError(c), c instanceof fe)
      return c;
    let r;
    switch (c.name) {
      case "OverconstrainedError":
        r = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        r = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        r = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        r = "There is no camera available to you";
        break;
      default:
        r = "An unknown camera error has occurred";
        break;
    }
    return new fe(r, c);
  }
  static fromError(c) {
    if (this.logError(c), c instanceof fe)
      return c;
    const r = "An unexpected error has occurred";
    return new fe(r);
  }
}
const Lo = {
  RGBA: "RGBA"
};
class xo {
  #e;
  #t;
  #r;
  constructor(c, r) {
    this.#e = c, this.#t = this.allocate(r.length * r.BYTES_PER_ELEMENT), this.#r = this.allocate(r.length * r.BYTES_PER_ELEMENT);
  }
  get rgbaImagePointer() {
    return this.#t;
  }
  get bgr0ImagePointer() {
    return this.#r;
  }
  allocate(c) {
    return this.#e._malloc(c);
  }
  free() {
    this.#e._free(this.#t), this.#e._free(this.#r);
  }
  writeDataToMemory(c) {
    this.#e.HEAPU8.set(c, this.#t);
  }
}
class No {
  samWasmModule;
  getOverriddenModules(c, r) {
    return {
      locateFile: (t) => new URL(r || t, c).href
    };
  }
  async handleMissingOrInvalidSamModule(c, r) {
    try {
      const t = await fetch(c);
      if (!t.ok)
        throw new fe(
          `The path to ${r} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${c}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new fe(
          `The provided ${r} is not a valid WASM module. Please check provided path to wasm files. Current path is ${c}`
        );
    } catch (t) {
      if (t instanceof fe)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Fo() ? $n.simd : $n.sam;
  }
  async initSamModule(c, r) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(r, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(c, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new fe("Could not init detector.");
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
  writeImageToMemory(c) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const r = new xo(this.samWasmModule, c);
    return r.writeDataToMemory(c), r;
  }
  convertToSamColorImage(c, r) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(c);
    return this.samWasmModule.convertToSamColorImage(
      r.width,
      r.height,
      t.rgbaImagePointer,
      Lo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(c, r, t) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(c, r), { bottomLeft: n, topLeft: o, topRight: d } = t, u = [
      o.x,
      // x
      o.y,
      // y
      d.x - o.x,
      // width
      n.y - o.y
      // height
    ], { height: w, width: A, x: v, y: I } = await this.samWasmModule.selectDetailRegion(
      r.width,
      r.height,
      e.bgr0ImagePointer,
      u
    );
    return e.free(), {
      height: w,
      width: A,
      shiftX: v,
      shiftY: I
    };
  }
  [Tt]() {
    this.terminateSamModule();
  }
}
const xn = (g) => Number.parseFloat(g.toFixed(3)), bo = (g, c) => Math.min(g, c);
function $o(g, c) {
  const r = bo(c.width, c.height);
  return xn(g * r);
}
const Wo = (g) => JSON.parse(
  JSON.stringify(g, (c, r) => typeof r == "number" ? xn(r) : r)
);
var ze = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Wn = {}, Pn = {}, In, Vn;
function Vo() {
  if (Vn) return In;
  Vn = 1, In = g;
  function g(c, r) {
    for (var t = new Array(arguments.length - 1), e = 0, n = 2, o = !0; n < arguments.length; )
      t[e++] = arguments[n++];
    return new Promise(function(d, u) {
      t[e] = function(w) {
        if (o)
          if (o = !1, w)
            u(w);
          else {
            for (var A = new Array(arguments.length - 1), v = 0; v < A.length; )
              A[v++] = arguments[v];
            d.apply(null, A);
          }
      };
      try {
        c.apply(r || null, t);
      } catch (w) {
        o && (o = !1, u(w));
      }
    });
  }
  return In;
}
var Un = {}, zn;
function Uo() {
  return zn || (zn = 1, (function(g) {
    var c = g;
    c.length = function(o) {
      var d = o.length;
      if (!d)
        return 0;
      for (var u = 0; --d % 4 > 1 && o.charAt(d) === "="; )
        ++u;
      return Math.ceil(o.length * 3) / 4 - u;
    };
    for (var r = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[r[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    c.encode = function(o, d, u) {
      for (var w = null, A = [], v = 0, I = 0, S; d < u; ) {
        var k = o[d++];
        switch (I) {
          case 0:
            A[v++] = r[k >> 2], S = (k & 3) << 4, I = 1;
            break;
          case 1:
            A[v++] = r[S | k >> 4], S = (k & 15) << 2, I = 2;
            break;
          case 2:
            A[v++] = r[S | k >> 6], A[v++] = r[k & 63], I = 0;
            break;
        }
        v > 8191 && ((w || (w = [])).push(String.fromCharCode.apply(String, A)), v = 0);
      }
      return I && (A[v++] = r[S], A[v++] = 61, I === 1 && (A[v++] = 61)), w ? (v && w.push(String.fromCharCode.apply(String, A.slice(0, v))), w.join("")) : String.fromCharCode.apply(String, A.slice(0, v));
    };
    var n = "invalid encoding";
    c.decode = function(o, d, u) {
      for (var w = u, A = 0, v, I = 0; I < o.length; ) {
        var S = o.charCodeAt(I++);
        if (S === 61 && A > 1)
          break;
        if ((S = t[S]) === void 0)
          throw Error(n);
        switch (A) {
          case 0:
            v = S, A = 1;
            break;
          case 1:
            d[u++] = v << 2 | (S & 48) >> 4, v = S, A = 2;
            break;
          case 2:
            d[u++] = (v & 15) << 4 | (S & 60) >> 2, v = S, A = 3;
            break;
          case 3:
            d[u++] = (v & 3) << 6 | S, A = 0;
            break;
        }
      }
      if (A === 1)
        throw Error(n);
      return u - w;
    }, c.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  })(Un)), Un;
}
var jn, Gn;
function zo() {
  if (Gn) return jn;
  Gn = 1, jn = g;
  function g() {
    this._listeners = {};
  }
  return g.prototype.on = function(c, r, t) {
    return (this._listeners[c] || (this._listeners[c] = [])).push({
      fn: r,
      ctx: t || this
    }), this;
  }, g.prototype.off = function(c, r) {
    if (c === void 0)
      this._listeners = {};
    else if (r === void 0)
      this._listeners[c] = [];
    else
      for (var t = this._listeners[c], e = 0; e < t.length; )
        t[e].fn === r ? t.splice(e, 1) : ++e;
    return this;
  }, g.prototype.emit = function(c) {
    var r = this._listeners[c];
    if (r) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < r.length; )
        r[e].fn.apply(r[e++].ctx, t);
    }
    return this;
  }, jn;
}
var Cn, Hn;
function Go() {
  if (Hn) return Cn;
  Hn = 1, Cn = g(g);
  function g(n) {
    return typeof Float32Array < "u" ? (function() {
      var o = new Float32Array([-0]), d = new Uint8Array(o.buffer), u = d[3] === 128;
      function w(S, k, L) {
        o[0] = S, k[L] = d[0], k[L + 1] = d[1], k[L + 2] = d[2], k[L + 3] = d[3];
      }
      function A(S, k, L) {
        o[0] = S, k[L] = d[3], k[L + 1] = d[2], k[L + 2] = d[1], k[L + 3] = d[0];
      }
      n.writeFloatLE = u ? w : A, n.writeFloatBE = u ? A : w;
      function v(S, k) {
        return d[0] = S[k], d[1] = S[k + 1], d[2] = S[k + 2], d[3] = S[k + 3], o[0];
      }
      function I(S, k) {
        return d[3] = S[k], d[2] = S[k + 1], d[1] = S[k + 2], d[0] = S[k + 3], o[0];
      }
      n.readFloatLE = u ? v : I, n.readFloatBE = u ? I : v;
    })() : (function() {
      function o(u, w, A, v) {
        var I = w < 0 ? 1 : 0;
        if (I && (w = -w), w === 0)
          u(1 / w > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), A, v);
        else if (isNaN(w))
          u(2143289344, A, v);
        else if (w > 34028234663852886e22)
          u((I << 31 | 2139095040) >>> 0, A, v);
        else if (w < 11754943508222875e-54)
          u((I << 31 | Math.round(w / 1401298464324817e-60)) >>> 0, A, v);
        else {
          var S = Math.floor(Math.log(w) / Math.LN2), k = Math.round(w * Math.pow(2, -S) * 8388608) & 8388607;
          u((I << 31 | S + 127 << 23 | k) >>> 0, A, v);
        }
      }
      n.writeFloatLE = o.bind(null, c), n.writeFloatBE = o.bind(null, r);
      function d(u, w, A) {
        var v = u(w, A), I = (v >> 31) * 2 + 1, S = v >>> 23 & 255, k = v & 8388607;
        return S === 255 ? k ? NaN : I * (1 / 0) : S === 0 ? I * 1401298464324817e-60 * k : I * Math.pow(2, S - 150) * (k + 8388608);
      }
      n.readFloatLE = d.bind(null, t), n.readFloatBE = d.bind(null, e);
    })(), typeof Float64Array < "u" ? (function() {
      var o = new Float64Array([-0]), d = new Uint8Array(o.buffer), u = d[7] === 128;
      function w(S, k, L) {
        o[0] = S, k[L] = d[0], k[L + 1] = d[1], k[L + 2] = d[2], k[L + 3] = d[3], k[L + 4] = d[4], k[L + 5] = d[5], k[L + 6] = d[6], k[L + 7] = d[7];
      }
      function A(S, k, L) {
        o[0] = S, k[L] = d[7], k[L + 1] = d[6], k[L + 2] = d[5], k[L + 3] = d[4], k[L + 4] = d[3], k[L + 5] = d[2], k[L + 6] = d[1], k[L + 7] = d[0];
      }
      n.writeDoubleLE = u ? w : A, n.writeDoubleBE = u ? A : w;
      function v(S, k) {
        return d[0] = S[k], d[1] = S[k + 1], d[2] = S[k + 2], d[3] = S[k + 3], d[4] = S[k + 4], d[5] = S[k + 5], d[6] = S[k + 6], d[7] = S[k + 7], o[0];
      }
      function I(S, k) {
        return d[7] = S[k], d[6] = S[k + 1], d[5] = S[k + 2], d[4] = S[k + 3], d[3] = S[k + 4], d[2] = S[k + 5], d[1] = S[k + 6], d[0] = S[k + 7], o[0];
      }
      n.readDoubleLE = u ? v : I, n.readDoubleBE = u ? I : v;
    })() : (function() {
      function o(u, w, A, v, I, S) {
        var k = v < 0 ? 1 : 0;
        if (k && (v = -v), v === 0)
          u(0, I, S + w), u(1 / v > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), I, S + A);
        else if (isNaN(v))
          u(0, I, S + w), u(2146959360, I, S + A);
        else if (v > 17976931348623157e292)
          u(0, I, S + w), u((k << 31 | 2146435072) >>> 0, I, S + A);
        else {
          var L;
          if (v < 22250738585072014e-324)
            L = v / 5e-324, u(L >>> 0, I, S + w), u((k << 31 | L / 4294967296) >>> 0, I, S + A);
          else {
            var j = Math.floor(Math.log(v) / Math.LN2);
            j === 1024 && (j = 1023), L = v * Math.pow(2, -j), u(L * 4503599627370496 >>> 0, I, S + w), u((k << 31 | j + 1023 << 20 | L * 1048576 & 1048575) >>> 0, I, S + A);
          }
        }
      }
      n.writeDoubleLE = o.bind(null, c, 0, 4), n.writeDoubleBE = o.bind(null, r, 4, 0);
      function d(u, w, A, v, I) {
        var S = u(v, I + w), k = u(v, I + A), L = (k >> 31) * 2 + 1, j = k >>> 20 & 2047, M = 4294967296 * (k & 1048575) + S;
        return j === 2047 ? M ? NaN : L * (1 / 0) : j === 0 ? L * 5e-324 * M : L * Math.pow(2, j - 1075) * (M + 4503599627370496);
      }
      n.readDoubleLE = d.bind(null, t, 0, 4), n.readDoubleBE = d.bind(null, e, 4, 0);
    })(), n;
  }
  function c(n, o, d) {
    o[d] = n & 255, o[d + 1] = n >>> 8 & 255, o[d + 2] = n >>> 16 & 255, o[d + 3] = n >>> 24;
  }
  function r(n, o, d) {
    o[d] = n >>> 24, o[d + 1] = n >>> 16 & 255, o[d + 2] = n >>> 8 & 255, o[d + 3] = n & 255;
  }
  function t(n, o) {
    return (n[o] | n[o + 1] << 8 | n[o + 2] << 16 | n[o + 3] << 24) >>> 0;
  }
  function e(n, o) {
    return (n[o] << 24 | n[o + 1] << 16 | n[o + 2] << 8 | n[o + 3]) >>> 0;
  }
  return Cn;
}
function Bn(g) {
  throw new Error('Could not dynamically require "' + g + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Sn, Yn;
function Ho() {
  if (Yn) return Sn;
  Yn = 1, Sn = g;
  function g(c) {
    try {
      if (typeof Bn != "function")
        return null;
      var r = Bn(c);
      return r && (r.length || Object.keys(r).length) ? r : null;
    } catch {
      return null;
    }
  }
  return Sn;
}
var Jn = {}, Zn;
function Bo() {
  return Zn || (Zn = 1, (function(g) {
    var c = g;
    c.length = function(r) {
      for (var t = 0, e = 0, n = 0; n < r.length; ++n)
        e = r.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (r.charCodeAt(n + 1) & 64512) === 56320 ? (++n, t += 4) : t += 3;
      return t;
    }, c.read = function(r, t, e) {
      var n = e - t;
      if (n < 1)
        return "";
      for (var o = null, d = [], u = 0, w; t < e; )
        w = r[t++], w < 128 ? d[u++] = w : w > 191 && w < 224 ? d[u++] = (w & 31) << 6 | r[t++] & 63 : w > 239 && w < 365 ? (w = ((w & 7) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, d[u++] = 55296 + (w >> 10), d[u++] = 56320 + (w & 1023)) : d[u++] = (w & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63, u > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, d)), u = 0);
      return o ? (u && o.push(String.fromCharCode.apply(String, d.slice(0, u))), o.join("")) : String.fromCharCode.apply(String, d.slice(0, u));
    }, c.write = function(r, t, e) {
      for (var n = e, o, d, u = 0; u < r.length; ++u)
        o = r.charCodeAt(u), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((d = r.charCodeAt(u + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (d & 1023), ++u, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - n;
    };
  })(Jn)), Jn;
}
var Tn, Kn;
function Yo() {
  if (Kn) return Tn;
  Kn = 1, Tn = g;
  function g(c, r, t) {
    var e = t || 8192, n = e >>> 1, o = null, d = e;
    return function(u) {
      if (u < 1 || u > n)
        return c(u);
      d + u > e && (o = c(e), d = 0);
      var w = r.call(o, d, d += u);
      return d & 7 && (d = (d | 7) + 1), w;
    };
  }
  return Tn;
}
var kn, qn;
function Jo() {
  if (qn) return kn;
  qn = 1, kn = c;
  var g = Ue();
  function c(n, o) {
    this.lo = n >>> 0, this.hi = o >>> 0;
  }
  var r = c.zero = new c(0, 0);
  r.toNumber = function() {
    return 0;
  }, r.zzEncode = r.zzDecode = function() {
    return this;
  }, r.length = function() {
    return 1;
  };
  var t = c.zeroHash = "\0\0\0\0\0\0\0\0";
  c.fromNumber = function(n) {
    if (n === 0)
      return r;
    var o = n < 0;
    o && (n = -n);
    var d = n >>> 0, u = (n - d) / 4294967296 >>> 0;
    return o && (u = ~u >>> 0, d = ~d >>> 0, ++d > 4294967295 && (d = 0, ++u > 4294967295 && (u = 0))), new c(d, u);
  }, c.from = function(n) {
    if (typeof n == "number")
      return c.fromNumber(n);
    if (g.isString(n))
      if (g.Long)
        n = g.Long.fromString(n);
      else
        return c.fromNumber(parseInt(n, 10));
    return n.low || n.high ? new c(n.low >>> 0, n.high >>> 0) : r;
  }, c.prototype.toNumber = function(n) {
    if (!n && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, d = ~this.hi >>> 0;
      return o || (d = d + 1 >>> 0), -(o + d * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, c.prototype.toLong = function(n) {
    return g.Long ? new g.Long(this.lo | 0, this.hi | 0, !!n) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!n };
  };
  var e = String.prototype.charCodeAt;
  return c.fromHash = function(n) {
    return n === t ? r : new c(
      (e.call(n, 0) | e.call(n, 1) << 8 | e.call(n, 2) << 16 | e.call(n, 3) << 24) >>> 0,
      (e.call(n, 4) | e.call(n, 5) << 8 | e.call(n, 6) << 16 | e.call(n, 7) << 24) >>> 0
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
    var n = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ n) >>> 0, this.lo = (this.lo << 1 ^ n) >>> 0, this;
  }, c.prototype.zzDecode = function() {
    var n = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ n) >>> 0, this.hi = (this.hi >>> 1 ^ n) >>> 0, this;
  }, c.prototype.length = function() {
    var n = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, d = this.hi >>> 24;
    return d === 0 ? o === 0 ? n < 16384 ? n < 128 ? 1 : 2 : n < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : d < 128 ? 9 : 10;
  }, kn;
}
var Xn;
function Ue() {
  return Xn || (Xn = 1, (function(g) {
    var c = g;
    c.asPromise = Vo(), c.base64 = Uo(), c.EventEmitter = zo(), c.float = Go(), c.inquire = Ho(), c.utf8 = Bo(), c.pool = Yo(), c.LongBits = Jo(), c.isNode = !!(typeof ze < "u" && ze && ze.process && ze.process.versions && ze.process.versions.node), c.global = c.isNode && ze || typeof window < "u" && window || typeof self < "u" && self || Pn, c.emptyArray = Object.freeze ? Object.freeze([]) : (
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
    c.isSet = function(e, n) {
      var o = e[n];
      return o != null && e.hasOwnProperty(n) ? typeof o != "object" || (Array.isArray(o) ? o.length : Object.keys(o).length) > 0 : !1;
    }, c.Buffer = (function() {
      try {
        var e = c.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    })(), c._Buffer_from = null, c._Buffer_allocUnsafe = null, c.newBuffer = function(e) {
      return typeof e == "number" ? c.Buffer ? c._Buffer_allocUnsafe(e) : new c.Array(e) : c.Buffer ? c._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, c.Array = typeof Uint8Array < "u" ? Uint8Array : Array, c.Long = /* istanbul ignore next */
    c.global.dcodeIO && /* istanbul ignore next */
    c.global.dcodeIO.Long || /* istanbul ignore next */
    c.global.Long || c.inquire("long"), c.key2Re = /^true|false|0|1$/, c.key32Re = /^-?(?:0|[1-9][0-9]*)$/, c.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, c.longToHash = function(e) {
      return e ? c.LongBits.from(e).toHash() : c.LongBits.zeroHash;
    }, c.longFromHash = function(e, n) {
      var o = c.LongBits.fromHash(e);
      return c.Long ? c.Long.fromBits(o.lo, o.hi, n) : o.toNumber(!!n);
    };
    function r(e, n, o) {
      for (var d = Object.keys(n), u = 0; u < d.length; ++u)
        (e[d[u]] === void 0 || !o) && (e[d[u]] = n[d[u]]);
      return e;
    }
    c.merge = r, c.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function n(o, d) {
        if (!(this instanceof n))
          return new n(o, d);
        Object.defineProperty(this, "message", { get: function() {
          return o;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, n) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), d && r(this, d);
      }
      return n.prototype = Object.create(Error.prototype, {
        constructor: {
          value: n,
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
      }), n;
    }
    c.newError = t, c.ProtocolError = t("ProtocolError"), c.oneOfGetter = function(e) {
      for (var n = {}, o = 0; o < e.length; ++o)
        n[e[o]] = 1;
      return function() {
        for (var d = Object.keys(this), u = d.length - 1; u > -1; --u)
          if (n[d[u]] === 1 && this[d[u]] !== void 0 && this[d[u]] !== null)
            return d[u];
      };
    }, c.oneOfSetter = function(e) {
      return function(n) {
        for (var o = 0; o < e.length; ++o)
          e[o] !== n && delete this[e[o]];
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
      function(n, o) {
        return new e(n, o);
      }, c._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(n) {
        return new e(n);
      };
    };
  })(Pn)), Pn;
}
var An, Qn;
function vo() {
  if (Qn) return An;
  Qn = 1, An = u;
  var g = Ue(), c, r = g.LongBits, t = g.base64, e = g.utf8;
  function n(j, M, N) {
    this.fn = j, this.len = M, this.next = void 0, this.val = N;
  }
  function o() {
  }
  function d(j) {
    this.head = j.head, this.tail = j.tail, this.len = j.len, this.next = j.states;
  }
  function u() {
    this.len = 0, this.head = new n(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var w = function() {
    return g.Buffer ? function() {
      return (u.create = function() {
        return new c();
      })();
    } : function() {
      return new u();
    };
  };
  u.create = w(), u.alloc = function(j) {
    return new g.Array(j);
  }, g.Array !== Array && (u.alloc = g.pool(u.alloc, g.Array.prototype.subarray)), u.prototype._push = function(j, M, N) {
    return this.tail = this.tail.next = new n(j, M, N), this.len += M, this;
  };
  function A(j, M, N) {
    M[N] = j & 255;
  }
  function v(j, M, N) {
    for (; j > 127; )
      M[N++] = j & 127 | 128, j >>>= 7;
    M[N] = j;
  }
  function I(j, M) {
    this.len = j, this.next = void 0, this.val = M;
  }
  I.prototype = Object.create(n.prototype), I.prototype.fn = v, u.prototype.uint32 = function(j) {
    return this.len += (this.tail = this.tail.next = new I(
      (j = j >>> 0) < 128 ? 1 : j < 16384 ? 2 : j < 2097152 ? 3 : j < 268435456 ? 4 : 5,
      j
    )).len, this;
  }, u.prototype.int32 = function(j) {
    return j < 0 ? this._push(S, 10, r.fromNumber(j)) : this.uint32(j);
  }, u.prototype.sint32 = function(j) {
    return this.uint32((j << 1 ^ j >> 31) >>> 0);
  };
  function S(j, M, N) {
    for (; j.hi; )
      M[N++] = j.lo & 127 | 128, j.lo = (j.lo >>> 7 | j.hi << 25) >>> 0, j.hi >>>= 7;
    for (; j.lo > 127; )
      M[N++] = j.lo & 127 | 128, j.lo = j.lo >>> 7;
    M[N++] = j.lo;
  }
  u.prototype.uint64 = function(j) {
    var M = r.from(j);
    return this._push(S, M.length(), M);
  }, u.prototype.int64 = u.prototype.uint64, u.prototype.sint64 = function(j) {
    var M = r.from(j).zzEncode();
    return this._push(S, M.length(), M);
  }, u.prototype.bool = function(j) {
    return this._push(A, 1, j ? 1 : 0);
  };
  function k(j, M, N) {
    M[N] = j & 255, M[N + 1] = j >>> 8 & 255, M[N + 2] = j >>> 16 & 255, M[N + 3] = j >>> 24;
  }
  u.prototype.fixed32 = function(j) {
    return this._push(k, 4, j >>> 0);
  }, u.prototype.sfixed32 = u.prototype.fixed32, u.prototype.fixed64 = function(j) {
    var M = r.from(j);
    return this._push(k, 4, M.lo)._push(k, 4, M.hi);
  }, u.prototype.sfixed64 = u.prototype.fixed64, u.prototype.float = function(j) {
    return this._push(g.float.writeFloatLE, 4, j);
  }, u.prototype.double = function(j) {
    return this._push(g.float.writeDoubleLE, 8, j);
  };
  var L = g.Array.prototype.set ? function(j, M, N) {
    M.set(j, N);
  } : function(j, M, N) {
    for (var se = 0; se < j.length; ++se)
      M[N + se] = j[se];
  };
  return u.prototype.bytes = function(j) {
    var M = j.length >>> 0;
    if (!M)
      return this._push(A, 1, 0);
    if (g.isString(j)) {
      var N = u.alloc(M = t.length(j));
      t.decode(j, N, 0), j = N;
    }
    return this.uint32(M)._push(L, M, j);
  }, u.prototype.string = function(j) {
    var M = e.length(j);
    return M ? this.uint32(M)._push(e.write, M, j) : this._push(A, 1, 0);
  }, u.prototype.fork = function() {
    return this.states = new d(this), this.head = this.tail = new n(o, 0, 0), this.len = 0, this;
  }, u.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new n(o, 0, 0), this.len = 0), this;
  }, u.prototype.ldelim = function() {
    var j = this.head, M = this.tail, N = this.len;
    return this.reset().uint32(N), N && (this.tail.next = j.next, this.tail = M, this.len += N), this;
  }, u.prototype.finish = function() {
    for (var j = this.head.next, M = this.constructor.alloc(this.len), N = 0; j; )
      j.fn(j.val, M, N), N += j.len, j = j.next;
    return M;
  }, u._configure = function(j) {
    c = j, u.create = w(), c._configure();
  }, An;
}
var Dn, eo;
function Zo() {
  if (eo) return Dn;
  eo = 1, Dn = r;
  var g = vo();
  (r.prototype = Object.create(g.prototype)).constructor = r;
  var c = Ue();
  function r() {
    g.call(this);
  }
  r._configure = function() {
    r.alloc = c._Buffer_allocUnsafe, r.writeBytesBuffer = c.Buffer && c.Buffer.prototype instanceof Uint8Array && c.Buffer.prototype.set.name === "set" ? function(e, n, o) {
      n.set(e, o);
    } : function(e, n, o) {
      if (e.copy)
        e.copy(n, o, 0, e.length);
      else for (var d = 0; d < e.length; )
        n[o++] = e[d++];
    };
  }, r.prototype.bytes = function(e) {
    c.isString(e) && (e = c._Buffer_from(e, "base64"));
    var n = e.length >>> 0;
    return this.uint32(n), n && this._push(r.writeBytesBuffer, n, e), this;
  };
  function t(e, n, o) {
    e.length < 40 ? c.utf8.write(e, n, o) : n.utf8Write ? n.utf8Write(e, o) : n.write(e, o);
  }
  return r.prototype.string = function(e) {
    var n = c.Buffer.byteLength(e);
    return this.uint32(n), n && this._push(t, n, e), this;
  }, r._configure(), Dn;
}
var _n, to;
function Oo() {
  if (to) return _n;
  to = 1, _n = n;
  var g = Ue(), c, r = g.LongBits, t = g.utf8;
  function e(v, I) {
    return RangeError("index out of range: " + v.pos + " + " + (I || 1) + " > " + v.len);
  }
  function n(v) {
    this.buf = v, this.pos = 0, this.len = v.length;
  }
  var o = typeof Uint8Array < "u" ? function(v) {
    if (v instanceof Uint8Array || Array.isArray(v))
      return new n(v);
    throw Error("illegal buffer");
  } : function(v) {
    if (Array.isArray(v))
      return new n(v);
    throw Error("illegal buffer");
  }, d = function() {
    return g.Buffer ? function(v) {
      return (n.create = function(I) {
        return g.Buffer.isBuffer(I) ? new c(I) : o(I);
      })(v);
    } : o;
  };
  n.create = d(), n.prototype._slice = g.Array.prototype.subarray || /* istanbul ignore next */
  g.Array.prototype.slice, n.prototype.uint32 = /* @__PURE__ */ (function() {
    var v = 4294967295;
    return function() {
      if (v = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (v = (v | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (v = (v | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (v = (v | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (v = (v | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return v;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return v;
    };
  })(), n.prototype.int32 = function() {
    return this.uint32() | 0;
  }, n.prototype.sint32 = function() {
    var v = this.uint32();
    return v >>> 1 ^ -(v & 1) | 0;
  };
  function u() {
    var v = new r(0, 0), I = 0;
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
  n.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function w(v, I) {
    return (v[I - 4] | v[I - 3] << 8 | v[I - 2] << 16 | v[I - 1] << 24) >>> 0;
  }
  n.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return w(this.buf, this.pos += 4);
  }, n.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return w(this.buf, this.pos += 4) | 0;
  };
  function A() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new r(w(this.buf, this.pos += 4), w(this.buf, this.pos += 4));
  }
  return n.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var v = g.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, v;
  }, n.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var v = g.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, v;
  }, n.prototype.bytes = function() {
    var v = this.uint32(), I = this.pos, S = this.pos + v;
    if (S > this.len)
      throw e(this, v);
    if (this.pos += v, Array.isArray(this.buf))
      return this.buf.slice(I, S);
    if (I === S) {
      var k = g.Buffer;
      return k ? k.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, I, S);
  }, n.prototype.string = function() {
    var v = this.bytes();
    return t.read(v, 0, v.length);
  }, n.prototype.skip = function(v) {
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
  }, n.prototype.skipType = function(v) {
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
  }, n._configure = function(v) {
    c = v, n.create = d(), c._configure();
    var I = g.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    g.merge(n.prototype, {
      int64: function() {
        return u.call(this)[I](!1);
      },
      uint64: function() {
        return u.call(this)[I](!0);
      },
      sint64: function() {
        return u.call(this).zzDecode()[I](!1);
      },
      fixed64: function() {
        return A.call(this)[I](!0);
      },
      sfixed64: function() {
        return A.call(this)[I](!1);
      }
    });
  }, _n;
}
var En, ro;
function Ko() {
  if (ro) return En;
  ro = 1, En = r;
  var g = Oo();
  (r.prototype = Object.create(g.prototype)).constructor = r;
  var c = Ue();
  function r(t) {
    g.call(this, t);
  }
  return r._configure = function() {
    c.Buffer && (r.prototype._slice = c.Buffer.prototype.slice);
  }, r.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, r._configure(), En;
}
var no = {}, Mn, oo;
function qo() {
  if (oo) return Mn;
  oo = 1, Mn = c;
  var g = Ue();
  (c.prototype = Object.create(g.EventEmitter.prototype)).constructor = c;
  function c(r, t, e) {
    if (typeof r != "function")
      throw TypeError("rpcImpl must be a function");
    g.EventEmitter.call(this), this.rpcImpl = r, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return c.prototype.rpcCall = function r(t, e, n, o, d) {
    if (!o)
      throw TypeError("request must be specified");
    var u = this;
    if (!d)
      return g.asPromise(r, u, t, e, n, o);
    if (!u.rpcImpl) {
      setTimeout(function() {
        d(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return u.rpcImpl(
        t,
        e[u.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(w, A) {
          if (w)
            return u.emit("error", w, t), d(w);
          if (A === null) {
            u.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(A instanceof n))
            try {
              A = n[u.responseDelimited ? "decodeDelimited" : "decode"](A);
            } catch (v) {
              return u.emit("error", v, t), d(v);
            }
          return u.emit("data", A, t), d(null, A);
        }
      );
    } catch (w) {
      u.emit("error", w, t), setTimeout(function() {
        d(w);
      }, 0);
      return;
    }
  }, c.prototype.end = function(r) {
    return this.rpcImpl && (r || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, Mn;
}
var io;
function Xo() {
  return io || (io = 1, (function(g) {
    var c = g;
    c.Service = qo();
  })(no)), no;
}
var ao, so;
function Qo() {
  return so || (so = 1, ao = {}), ao;
}
var lo;
function ei() {
  return lo || (lo = 1, (function(g) {
    var c = g;
    c.build = "minimal", c.Writer = vo(), c.BufferWriter = Zo(), c.Reader = Oo(), c.BufferReader = Ko(), c.util = Ue(), c.rpc = Xo(), c.roots = Qo(), c.configure = r;
    function r() {
      c.util._configure(), c.Writer._configure(c.BufferWriter), c.Reader._configure(c.BufferReader);
    }
    r();
  })(Wn)), Wn;
}
var co, uo;
function ti() {
  return uo || (uo = 1, co = ei()), co;
}
var R = ti();
const b = R.Reader, F = R.Writer, p = R.util, s = R.roots.default || (R.roots.default = {});
s.dot = (() => {
  const g = {};
  return g.Content = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.token = p.newBuffer([]), c.prototype.iv = p.newBuffer([]), c.prototype.schemaVersion = 0, c.prototype.bytes = p.newBuffer([]), c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.token != null && Object.hasOwnProperty.call(r, "token") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.token), r.iv != null && Object.hasOwnProperty.call(r, "iv") && t.uint32(
        /* id 2, wireType 2 =*/
        18
      ).bytes(r.iv), r.schemaVersion != null && Object.hasOwnProperty.call(r, "schemaVersion") && t.uint32(
        /* id 3, wireType 0 =*/
        24
      ).int32(r.schemaVersion), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 4, wireType 2 =*/
        34
      ).bytes(r.bytes), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.Content();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.token = r.bytes();
            break;
          }
          case 2: {
            o.iv = r.bytes();
            break;
          }
          case 3: {
            o.schemaVersion = r.int32();
            break;
          }
          case 4: {
            o.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.token != null && r.hasOwnProperty("token") && !(r.token && typeof r.token.length == "number" || p.isString(r.token)) ? "token: buffer expected" : r.iv != null && r.hasOwnProperty("iv") && !(r.iv && typeof r.iv.length == "number" || p.isString(r.iv)) ? "iv: buffer expected" : r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && !p.isInteger(r.schemaVersion) ? "schemaVersion: integer expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.Content)
        return r;
      let t = new s.dot.Content();
      return r.token != null && (typeof r.token == "string" ? p.base64.decode(r.token, t.token = p.newBuffer(p.base64.length(r.token)), 0) : r.token.length >= 0 && (t.token = r.token)), r.iv != null && (typeof r.iv == "string" ? p.base64.decode(r.iv, t.iv = p.newBuffer(p.base64.length(r.iv)), 0) : r.iv.length >= 0 && (t.iv = r.iv)), r.schemaVersion != null && (t.schemaVersion = r.schemaVersion | 0), r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = p.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = p.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.token != null && r.hasOwnProperty("token") && (e.token = t.bytes === String ? p.base64.encode(r.token, 0, r.token.length) : t.bytes === Array ? Array.prototype.slice.call(r.token) : r.token), r.iv != null && r.hasOwnProperty("iv") && (e.iv = t.bytes === String ? p.base64.encode(r.iv, 0, r.iv.length) : t.bytes === Array ? Array.prototype.slice.call(r.iv) : r.iv), r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && (e.schemaVersion = r.schemaVersion), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Content";
    }, c;
  })(), g.v4 = (function() {
    const c = {};
    return c.MagnifEyeLivenessContent = (function() {
      function r(e) {
        if (this.images = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.images = p.emptyArray, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.images != null && e.images.length)
          for (let o = 0; o < e.images.length; ++o)
            s.dot.Image.encode(e.images[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.images && u.images.length || (u.images = []), u.images.push(s.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.images != null && e.hasOwnProperty("images")) {
          if (!Array.isArray(e.images))
            return "images: array expected";
          for (let n = 0; n < e.images.length; ++n) {
            let o = s.dot.Image.verify(e.images[n]);
            if (o)
              return "images." + o;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.MagnifEyeLivenessContent)
          return e;
        let n = new s.dot.v4.MagnifEyeLivenessContent();
        if (e.images) {
          if (!Array.isArray(e.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          n.images = [];
          for (let o = 0; o < e.images.length; ++o) {
            if (typeof e.images[o] != "object")
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            n.images[o] = s.dot.Image.fromObject(e.images[o]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.images = []), n.defaults && (o.metadata = null), e.images && e.images.length) {
          o.images = [];
          for (let d = 0; d < e.images.length; ++d)
            o.images[d] = s.dot.Image.toObject(e.images[d], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MagnifEyeLivenessContent";
      }, r;
    })(), c.Metadata = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.platform = 0, r.prototype.sessionToken = null, r.prototype.componentVersion = "", r.prototype.web = null, r.prototype.android = null, r.prototype.ios = null;
      let t;
      return Object.defineProperty(r.prototype, "_sessionToken", {
        get: p.oneOfGetter(t = ["sessionToken"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "metadata", {
        get: p.oneOfGetter(t = ["web", "android", "ios"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && s.dot.v4.WebMetadata.encode(e.web, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && s.dot.v4.AndroidMetadata.encode(e.android, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && s.dot.v4.IosMetadata.encode(e.ios, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.sessionToken != null && Object.hasOwnProperty.call(e, "sessionToken") && n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.sessionToken), e.componentVersion != null && Object.hasOwnProperty.call(e, "componentVersion") && n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).string(e.componentVersion), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.Metadata();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.platform = e.int32();
              break;
            }
            case 5: {
              u.sessionToken = e.string();
              break;
            }
            case 6: {
              u.componentVersion = e.string();
              break;
            }
            case 2: {
              u.web = s.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.android = s.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              u.ios = s.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let n = {};
        if (e.platform != null && e.hasOwnProperty("platform"))
          switch (e.platform) {
            default:
              return "platform: enum value expected";
            case 0:
            case 1:
            case 2:
              break;
          }
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (n._sessionToken = 1, !p.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !p.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && e.hasOwnProperty("web")) {
          n.metadata = 1;
          {
            let o = s.dot.v4.WebMetadata.verify(e.web);
            if (o)
              return "web." + o;
          }
        }
        if (e.android != null && e.hasOwnProperty("android")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let o = s.dot.v4.AndroidMetadata.verify(e.android);
            if (o)
              return "android." + o;
          }
        }
        if (e.ios != null && e.hasOwnProperty("ios")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let o = s.dot.v4.IosMetadata.verify(e.ios);
            if (o)
              return "ios." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.Metadata)
          return e;
        let n = new s.dot.v4.Metadata();
        switch (e.platform) {
          default:
            if (typeof e.platform == "number") {
              n.platform = e.platform;
              break;
            }
            break;
          case "WEB":
          case 0:
            n.platform = 0;
            break;
          case "ANDROID":
          case 1:
            n.platform = 1;
            break;
          case "IOS":
          case 2:
            n.platform = 2;
            break;
        }
        if (e.sessionToken != null && (n.sessionToken = String(e.sessionToken)), e.componentVersion != null && (n.componentVersion = String(e.componentVersion)), e.web != null) {
          if (typeof e.web != "object")
            throw TypeError(".dot.v4.Metadata.web: object expected");
          n.web = s.dot.v4.WebMetadata.fromObject(e.web);
        }
        if (e.android != null) {
          if (typeof e.android != "object")
            throw TypeError(".dot.v4.Metadata.android: object expected");
          n.android = s.dot.v4.AndroidMetadata.fromObject(e.android);
        }
        if (e.ios != null) {
          if (typeof e.ios != "object")
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          n.ios = s.dot.v4.IosMetadata.fromObject(e.ios);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.platform = n.enums === String ? "WEB" : 0, o.componentVersion = ""), e.platform != null && e.hasOwnProperty("platform") && (o.platform = n.enums === String ? s.dot.Platform[e.platform] === void 0 ? e.platform : s.dot.Platform[e.platform] : e.platform), e.web != null && e.hasOwnProperty("web") && (o.web = s.dot.v4.WebMetadata.toObject(e.web, n), n.oneofs && (o.metadata = "web")), e.android != null && e.hasOwnProperty("android") && (o.android = s.dot.v4.AndroidMetadata.toObject(e.android, n), n.oneofs && (o.metadata = "android")), e.ios != null && e.hasOwnProperty("ios") && (o.ios = s.dot.v4.IosMetadata.toObject(e.ios, n), n.oneofs && (o.metadata = "ios")), e.sessionToken != null && e.hasOwnProperty("sessionToken") && (o.sessionToken = e.sessionToken, n.oneofs && (o._sessionToken = "sessionToken")), e.componentVersion != null && e.hasOwnProperty("componentVersion") && (o.componentVersion = e.componentVersion), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, r;
    })(), c.AndroidMetadata = (function() {
      function r(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.supportedAbis = p.emptyArray, r.prototype.device = null, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = p.emptyArray, r.prototype.digestsWithTimestamp = p.emptyArray, r.prototype.dynamicCameraFrameProperties = p.emptyObject, r.prototype.tamperingIndicators = null, r.prototype.croppedYuv420Image = null, r.prototype.yuv420ImageCrop = null, r.prototype.androidId = null;
      let t;
      return Object.defineProperty(r.prototype, "_device", {
        get: p.oneOfGetter(t = ["device"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_camera", {
        get: p.oneOfGetter(t = ["camera"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: p.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_tamperingIndicators", {
        get: p.oneOfGetter(t = ["tamperingIndicators"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedYuv420Image", {
        get: p.oneOfGetter(t = ["croppedYuv420Image"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_yuv420ImageCrop", {
        get: p.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_androidId", {
        get: p.oneOfGetter(t = ["androidId"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.supportedAbis != null && e.supportedAbis.length)
          for (let o = 0; o < e.supportedAbis.length; ++o)
            n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(e.supportedAbis[o]);
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.device), e.digests != null && e.digests.length)
          for (let o = 0; o < e.digests.length; ++o)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[o]);
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties"))
          for (let o = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < o.length; ++d)
            n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[d]), s.dot.Int32List.encode(e.dynamicCameraFrameProperties[o[d]], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            s.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && s.dot.v4.AndroidCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && s.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && s.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && s.dot.v4.Yuv420ImageCrop.encode(e.yuv420ImageCrop, n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.androidId != null && Object.hasOwnProperty.call(e, "androidId") && n.uint32(
          /* id 11, wireType 2 =*/
          90
        ).string(e.androidId), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.AndroidMetadata(), w, A;
        for (; e.pos < d; ) {
          let v = e.uint32();
          if (v === o)
            break;
          switch (v >>> 3) {
            case 1: {
              u.supportedAbis && u.supportedAbis.length || (u.supportedAbis = []), u.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              u.device = e.string();
              break;
            }
            case 6: {
              u.camera = s.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              u.detectionNormalizedRectangle = s.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.digests && u.digests.length || (u.digests = []), u.digests.push(e.bytes());
              break;
            }
            case 5: {
              u.digestsWithTimestamp && u.digestsWithTimestamp.length || (u.digestsWithTimestamp = []), u.digestsWithTimestamp.push(s.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              u.dynamicCameraFrameProperties === p.emptyObject && (u.dynamicCameraFrameProperties = {});
              let I = e.uint32() + e.pos;
              for (w = "", A = null; e.pos < I; ) {
                let S = e.uint32();
                switch (S >>> 3) {
                  case 1:
                    w = e.string();
                    break;
                  case 2:
                    A = s.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(S & 7);
                    break;
                }
              }
              u.dynamicCameraFrameProperties[w] = A;
              break;
            }
            case 8: {
              u.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              u.croppedYuv420Image = s.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            case 10: {
              u.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            case 11: {
              u.androidId = e.string();
              break;
            }
            default:
              e.skipType(v & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let n = 0; n < e.supportedAbis.length; ++n)
            if (!p.isString(e.supportedAbis[n]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !p.isString(e.device))
          return "device: string expected";
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = s.dot.v4.AndroidCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = s.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || p.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let o = s.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.dynamicCameraFrameProperties != null && e.hasOwnProperty("dynamicCameraFrameProperties")) {
          if (!p.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let n = Object.keys(e.dynamicCameraFrameProperties);
          for (let o = 0; o < n.length; ++o) {
            let d = s.dot.Int32List.verify(e.dynamicCameraFrameProperties[n[o]]);
            if (d)
              return "dynamicCameraFrameProperties." + d;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || p.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let n = s.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (n)
            return "croppedYuv420Image." + n;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let n = s.dot.v4.Yuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (n)
            return "yuv420ImageCrop." + n;
        }
        return e.androidId != null && e.hasOwnProperty("androidId") && !p.isString(e.androidId) ? "androidId: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.AndroidMetadata)
          return e;
        let n = new s.dot.v4.AndroidMetadata();
        if (e.supportedAbis) {
          if (!Array.isArray(e.supportedAbis))
            throw TypeError(".dot.v4.AndroidMetadata.supportedAbis: array expected");
          n.supportedAbis = [];
          for (let o = 0; o < e.supportedAbis.length; ++o)
            n.supportedAbis[o] = String(e.supportedAbis[o]);
        }
        if (e.device != null && (n.device = String(e.device)), e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.AndroidMetadata.camera: object expected");
          n.camera = s.dot.v4.AndroidCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = s.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          n.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? p.base64.decode(e.digests[o], n.digests[o] = p.newBuffer(p.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (n.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[o] = s.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (typeof e.dynamicCameraFrameProperties != "object")
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          n.dynamicCameraFrameProperties = {};
          for (let o = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < o.length; ++d) {
            if (typeof e.dynamicCameraFrameProperties[o[d]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            n.dynamicCameraFrameProperties[o[d]] = s.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[o[d]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? p.base64.decode(e.tamperingIndicators, n.tamperingIndicators = p.newBuffer(p.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (n.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          n.croppedYuv420Image = s.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.AndroidMetadata.yuv420ImageCrop: object expected");
          n.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return e.androidId != null && (n.androidId = String(e.androidId)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.supportedAbis = [], o.digests = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          o.supportedAbis = [];
          for (let u = 0; u < e.supportedAbis.length; ++u)
            o.supportedAbis[u] = e.supportedAbis[u];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, n.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let u = 0; u < e.digests.length; ++u)
            o.digests[u] = n.bytes === String ? p.base64.encode(e.digests[u], 0, e.digests[u].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[u]) : e.digests[u];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let u = 0; u < d.length; ++u)
            o.dynamicCameraFrameProperties[d[u]] = s.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[u]], n);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let u = 0; u < e.digestsWithTimestamp.length; ++u)
            o.digestsWithTimestamp[u] = s.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[u], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = s.dot.v4.AndroidCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = s.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = n.bytes === String ? p.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : n.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, n.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = s.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, n), n.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), e.androidId != null && e.hasOwnProperty("androidId") && (o.androidId = e.androidId, n.oneofs && (o._androidId = "androidId")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, r;
    })(), c.AndroidCamera = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && s.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.AndroidCamera();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.resolution = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = s.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !p.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.AndroidCamera)
          return t;
        let e = new s.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          e.resolution = s.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = s.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, r;
    })(), c.Yuv420Image = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = p.newBuffer([]), r.prototype.uPlane = p.newBuffer([]), r.prototype.vPlane = p.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && s.dot.ImageSize.encode(t.size, e.uint32(
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
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Yuv420Image();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
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
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = s.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || p.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || p.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || p.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.Yuv420Image)
          return t;
        let e = new s.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = s.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? p.base64.decode(t.yPlane, e.yPlane = p.newBuffer(p.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? p.base64.decode(t.uPlane, e.uPlane = p.newBuffer(p.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? p.base64.decode(t.vPlane, e.vPlane = p.newBuffer(p.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.size = null, e.bytes === String ? n.yPlane = "" : (n.yPlane = [], e.bytes !== Array && (n.yPlane = p.newBuffer(n.yPlane))), e.bytes === String ? n.uPlane = "" : (n.uPlane = [], e.bytes !== Array && (n.uPlane = p.newBuffer(n.uPlane))), e.bytes === String ? n.vPlane = "" : (n.vPlane = [], e.bytes !== Array && (n.vPlane = p.newBuffer(n.vPlane)))), t.size != null && t.hasOwnProperty("size") && (n.size = s.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (n.yPlane = e.bytes === String ? p.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (n.uPlane = e.bytes === String ? p.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (n.vPlane = e.bytes === String ? p.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, r;
    })(), c.Yuv420ImageCrop = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.v4.Yuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Yuv420ImageCrop();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.image = s.dot.v4.Yuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (n.image = s.dot.v4.Yuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (n.topLeftCorner = s.dot.PointInt.toObject(t.topLeftCorner, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420ImageCrop";
      }, r;
    })(), c.IosMetadata = (function() {
      function r(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraModelId = "", r.prototype.architectureInfo = p.emptyObject, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = p.emptyArray, r.prototype.digestsWithTimestamp = p.emptyArray, r.prototype.isoValues = p.emptyArray, r.prototype.croppedYuv420Image = null, r.prototype.yuv420ImageCrop = null, r.prototype.identifierForVendor = null;
      let t;
      return Object.defineProperty(r.prototype, "_camera", {
        get: p.oneOfGetter(t = ["camera"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: p.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedYuv420Image", {
        get: p.oneOfGetter(t = ["croppedYuv420Image"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_yuv420ImageCrop", {
        get: p.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_identifierForVendor", {
        get: p.oneOfGetter(t = ["identifierForVendor"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let o = Object.keys(e.architectureInfo), d = 0; d < o.length; ++d)
            n.uint32(
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
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[o]);
        if (e.isoValues != null && e.isoValues.length) {
          n.uint32(
            /* id 4, wireType 2 =*/
            34
          ).fork();
          for (let o = 0; o < e.isoValues.length; ++o)
            n.int32(e.isoValues[o]);
          n.ldelim();
        }
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            s.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && s.dot.v4.IosCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && s.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && s.dot.v4.IosYuv420Image.encode(e.croppedYuv420Image, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && s.dot.v4.IosYuv420ImageCrop.encode(e.yuv420ImageCrop, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.identifierForVendor != null && Object.hasOwnProperty.call(e, "identifierForVendor") && n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).string(e.identifierForVendor), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.IosMetadata(), w, A;
        for (; e.pos < d; ) {
          let v = e.uint32();
          if (v === o)
            break;
          switch (v >>> 3) {
            case 1: {
              u.cameraModelId = e.string();
              break;
            }
            case 2: {
              u.architectureInfo === p.emptyObject && (u.architectureInfo = {});
              let I = e.uint32() + e.pos;
              for (w = "", A = !1; e.pos < I; ) {
                let S = e.uint32();
                switch (S >>> 3) {
                  case 1:
                    w = e.string();
                    break;
                  case 2:
                    A = e.bool();
                    break;
                  default:
                    e.skipType(S & 7);
                    break;
                }
              }
              u.architectureInfo[w] = A;
              break;
            }
            case 6: {
              u.camera = s.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              u.detectionNormalizedRectangle = s.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.digests && u.digests.length || (u.digests = []), u.digests.push(e.bytes());
              break;
            }
            case 5: {
              u.digestsWithTimestamp && u.digestsWithTimestamp.length || (u.digestsWithTimestamp = []), u.digestsWithTimestamp.push(s.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (u.isoValues && u.isoValues.length || (u.isoValues = []), (v & 7) === 2) {
                let I = e.uint32() + e.pos;
                for (; e.pos < I; )
                  u.isoValues.push(e.int32());
              } else
                u.isoValues.push(e.int32());
              break;
            }
            case 8: {
              u.croppedYuv420Image = s.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            case 9: {
              u.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            case 10: {
              u.identifierForVendor = e.string();
              break;
            }
            default:
              e.skipType(v & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !p.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!p.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let n = Object.keys(e.architectureInfo);
          for (let o = 0; o < n.length; ++o)
            if (typeof e.architectureInfo[n[o]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = s.dot.v4.IosCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = s.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || p.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let o = s.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.isoValues != null && e.hasOwnProperty("isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let n = 0; n < e.isoValues.length; ++n)
            if (!p.isInteger(e.isoValues[n]))
              return "isoValues: integer[] expected";
        }
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let n = s.dot.v4.IosYuv420Image.verify(e.croppedYuv420Image);
          if (n)
            return "croppedYuv420Image." + n;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let n = s.dot.v4.IosYuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (n)
            return "yuv420ImageCrop." + n;
        }
        return e.identifierForVendor != null && e.hasOwnProperty("identifierForVendor") && !p.isString(e.identifierForVendor) ? "identifierForVendor: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.IosMetadata)
          return e;
        let n = new s.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (n.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (typeof e.architectureInfo != "object")
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          n.architectureInfo = {};
          for (let o = Object.keys(e.architectureInfo), d = 0; d < o.length; ++d)
            n.architectureInfo[o[d]] = !!e.architectureInfo[o[d]];
        }
        if (e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          n.camera = s.dot.v4.IosCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = s.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          n.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? p.base64.decode(e.digests[o], n.digests[o] = p.newBuffer(p.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (n.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[o] = s.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.isoValues) {
          if (!Array.isArray(e.isoValues))
            throw TypeError(".dot.v4.IosMetadata.isoValues: array expected");
          n.isoValues = [];
          for (let o = 0; o < e.isoValues.length; ++o)
            n.isoValues[o] = e.isoValues[o] | 0;
        }
        if (e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.IosMetadata.croppedYuv420Image: object expected");
          n.croppedYuv420Image = s.dot.v4.IosYuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.IosMetadata.yuv420ImageCrop: object expected");
          n.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return e.identifierForVendor != null && (n.identifierForVendor = String(e.identifierForVendor)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        (n.arrays || n.defaults) && (o.digests = [], o.isoValues = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.architectureInfo = {}), n.defaults && (o.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (o.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          o.architectureInfo = {};
          for (let u = 0; u < d.length; ++u)
            o.architectureInfo[d[u]] = e.architectureInfo[d[u]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let u = 0; u < e.digests.length; ++u)
            o.digests[u] = n.bytes === String ? p.base64.encode(e.digests[u], 0, e.digests[u].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[u]) : e.digests[u];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let u = 0; u < e.isoValues.length; ++u)
            o.isoValues[u] = e.isoValues[u];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let u = 0; u < e.digestsWithTimestamp.length; ++u)
            o.digestsWithTimestamp[u] = s.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[u], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = s.dot.v4.IosCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = s.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = s.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, n), n.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), e.identifierForVendor != null && e.hasOwnProperty("identifierForVendor") && (o.identifierForVendor = e.identifierForVendor, n.oneofs && (o._identifierForVendor = "identifierForVendor")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, r;
    })(), c.IosCamera = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && s.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosCamera();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.resolution = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = s.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !p.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.IosCamera)
          return t;
        let e = new s.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          e.resolution = s.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = s.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, r;
    })(), c.IosYuv420Image = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = p.newBuffer([]), r.prototype.uvPlane = p.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && s.dot.ImageSize.encode(t.size, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(t.yPlane), t.uvPlane != null && Object.hasOwnProperty.call(t, "uvPlane") && e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(t.uvPlane), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosYuv420Image();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
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
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = s.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || p.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uvPlane != null && t.hasOwnProperty("uvPlane") && !(t.uvPlane && typeof t.uvPlane.length == "number" || p.isString(t.uvPlane)) ? "uvPlane: buffer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.IosYuv420Image)
          return t;
        let e = new s.dot.v4.IosYuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.IosYuv420Image.size: object expected");
          e.size = s.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? p.base64.decode(t.yPlane, e.yPlane = p.newBuffer(p.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uvPlane != null && (typeof t.uvPlane == "string" ? p.base64.decode(t.uvPlane, e.uvPlane = p.newBuffer(p.base64.length(t.uvPlane)), 0) : t.uvPlane.length >= 0 && (e.uvPlane = t.uvPlane)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.size = null, e.bytes === String ? n.yPlane = "" : (n.yPlane = [], e.bytes !== Array && (n.yPlane = p.newBuffer(n.yPlane))), e.bytes === String ? n.uvPlane = "" : (n.uvPlane = [], e.bytes !== Array && (n.uvPlane = p.newBuffer(n.uvPlane)))), t.size != null && t.hasOwnProperty("size") && (n.size = s.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (n.yPlane = e.bytes === String ? p.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uvPlane != null && t.hasOwnProperty("uvPlane") && (n.uvPlane = e.bytes === String ? p.base64.encode(t.uvPlane, 0, t.uvPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uvPlane) : t.uvPlane), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, r;
    })(), c.IosYuv420ImageCrop = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.v4.IosYuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosYuv420ImageCrop();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.image = s.dot.v4.IosYuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (n.image = s.dot.v4.IosYuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (n.topLeftCorner = s.dot.PointInt.toObject(t.topLeftCorner, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420ImageCrop";
      }, r;
    })(), c.WebMetadata = (function() {
      function r(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.currentCameraProperties = null, r.prototype.availableCameraProperties = p.emptyArray, r.prototype.hashedDetectedImages = p.emptyArray, r.prototype.hashedDetectedImagesWithTimestamp = p.emptyArray, r.prototype.detectionRecord = p.emptyArray, r.prototype.croppedImage = null, r.prototype.croppedImageWithPosition = null, r.prototype.platformDetails = null;
      let t;
      return Object.defineProperty(r.prototype, "_croppedImage", {
        get: p.oneOfGetter(t = ["croppedImage"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedImageWithPosition", {
        get: p.oneOfGetter(t = ["croppedImageWithPosition"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_platformDetails", {
        get: p.oneOfGetter(t = ["platformDetails"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && s.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let o = 0; o < e.availableCameraProperties.length; ++o)
            s.dot.v4.CameraProperties.encode(e.availableCameraProperties[o], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim();
        if (e.hashedDetectedImages != null && e.hashedDetectedImages.length)
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            n.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(e.hashedDetectedImages[o]);
        if (e.detectionRecord != null && e.detectionRecord.length)
          for (let o = 0; o < e.detectionRecord.length; ++o)
            s.dot.v4.DetectedObject.encode(e.detectionRecord[o], n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o)
            s.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && s.dot.Image.encode(e.croppedImage, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition") && s.dot.v4.ImageCrop.encode(e.croppedImageWithPosition, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails") && s.dot.v4.PlatformDetails.encode(e.platformDetails, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.WebMetadata();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.currentCameraProperties = s.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.availableCameraProperties && u.availableCameraProperties.length || (u.availableCameraProperties = []), u.availableCameraProperties.push(s.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              u.hashedDetectedImages && u.hashedDetectedImages.length || (u.hashedDetectedImages = []), u.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              u.hashedDetectedImagesWithTimestamp && u.hashedDetectedImagesWithTimestamp.length || (u.hashedDetectedImagesWithTimestamp = []), u.hashedDetectedImagesWithTimestamp.push(s.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              u.detectionRecord && u.detectionRecord.length || (u.detectionRecord = []), u.detectionRecord.push(s.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              u.croppedImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 7: {
              u.croppedImageWithPosition = s.dot.v4.ImageCrop.decode(e, e.uint32());
              break;
            }
            case 8: {
              u.platformDetails = s.dot.v4.PlatformDetails.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties")) {
          let n = s.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties);
          if (n)
            return "currentCameraProperties." + n;
        }
        if (e.availableCameraProperties != null && e.hasOwnProperty("availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let n = 0; n < e.availableCameraProperties.length; ++n) {
            let o = s.dot.v4.CameraProperties.verify(e.availableCameraProperties[n]);
            if (o)
              return "availableCameraProperties." + o;
          }
        }
        if (e.hashedDetectedImages != null && e.hasOwnProperty("hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let n = 0; n < e.hashedDetectedImages.length; ++n)
            if (!p.isString(e.hashedDetectedImages[n]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && e.hasOwnProperty("hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let n = 0; n < e.hashedDetectedImagesWithTimestamp.length; ++n) {
            let o = s.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[n]);
            if (o)
              return "hashedDetectedImagesWithTimestamp." + o;
          }
        }
        if (e.detectionRecord != null && e.hasOwnProperty("detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let n = 0; n < e.detectionRecord.length; ++n) {
            let o = s.dot.v4.DetectedObject.verify(e.detectionRecord[n]);
            if (o)
              return "detectionRecord." + o;
          }
        }
        if (e.croppedImage != null && e.hasOwnProperty("croppedImage")) {
          let n = s.dot.Image.verify(e.croppedImage);
          if (n)
            return "croppedImage." + n;
        }
        if (e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition")) {
          let n = s.dot.v4.ImageCrop.verify(e.croppedImageWithPosition);
          if (n)
            return "croppedImageWithPosition." + n;
        }
        if (e.platformDetails != null && e.hasOwnProperty("platformDetails")) {
          let n = s.dot.v4.PlatformDetails.verify(e.platformDetails);
          if (n)
            return "platformDetails." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.WebMetadata)
          return e;
        let n = new s.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (typeof e.currentCameraProperties != "object")
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          n.currentCameraProperties = s.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          n.availableCameraProperties = [];
          for (let o = 0; o < e.availableCameraProperties.length; ++o) {
            if (typeof e.availableCameraProperties[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            n.availableCameraProperties[o] = s.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[o]);
          }
        }
        if (e.hashedDetectedImages) {
          if (!Array.isArray(e.hashedDetectedImages))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImages: array expected");
          n.hashedDetectedImages = [];
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            n.hashedDetectedImages[o] = String(e.hashedDetectedImages[o]);
        }
        if (e.hashedDetectedImagesWithTimestamp) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: array expected");
          n.hashedDetectedImagesWithTimestamp = [];
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o) {
            if (typeof e.hashedDetectedImagesWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: object expected");
            n.hashedDetectedImagesWithTimestamp[o] = s.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[o]);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          n.detectionRecord = [];
          for (let o = 0; o < e.detectionRecord.length; ++o) {
            if (typeof e.detectionRecord[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            n.detectionRecord[o] = s.dot.v4.DetectedObject.fromObject(e.detectionRecord[o]);
          }
        }
        if (e.croppedImage != null) {
          if (typeof e.croppedImage != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          n.croppedImage = s.dot.Image.fromObject(e.croppedImage);
        }
        if (e.croppedImageWithPosition != null) {
          if (typeof e.croppedImageWithPosition != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImageWithPosition: object expected");
          n.croppedImageWithPosition = s.dot.v4.ImageCrop.fromObject(e.croppedImageWithPosition);
        }
        if (e.platformDetails != null) {
          if (typeof e.platformDetails != "object")
            throw TypeError(".dot.v4.WebMetadata.platformDetails: object expected");
          n.platformDetails = s.dot.v4.PlatformDetails.fromObject(e.platformDetails);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.availableCameraProperties = [], o.hashedDetectedImages = [], o.detectionRecord = [], o.hashedDetectedImagesWithTimestamp = []), n.defaults && (o.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (o.currentCameraProperties = s.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, n)), e.availableCameraProperties && e.availableCameraProperties.length) {
          o.availableCameraProperties = [];
          for (let d = 0; d < e.availableCameraProperties.length; ++d)
            o.availableCameraProperties[d] = s.dot.v4.CameraProperties.toObject(e.availableCameraProperties[d], n);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          o.hashedDetectedImages = [];
          for (let d = 0; d < e.hashedDetectedImages.length; ++d)
            o.hashedDetectedImages[d] = e.hashedDetectedImages[d];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          o.detectionRecord = [];
          for (let d = 0; d < e.detectionRecord.length; ++d)
            o.detectionRecord[d] = s.dot.v4.DetectedObject.toObject(e.detectionRecord[d], n);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          o.hashedDetectedImagesWithTimestamp = [];
          for (let d = 0; d < e.hashedDetectedImagesWithTimestamp.length; ++d)
            o.hashedDetectedImagesWithTimestamp[d] = s.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[d], n);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (o.croppedImage = s.dot.Image.toObject(e.croppedImage, n), n.oneofs && (o._croppedImage = "croppedImage")), e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition") && (o.croppedImageWithPosition = s.dot.v4.ImageCrop.toObject(e.croppedImageWithPosition, n), n.oneofs && (o._croppedImageWithPosition = "croppedImageWithPosition")), e.platformDetails != null && e.hasOwnProperty("platformDetails") && (o.platformDetails = s.dot.v4.PlatformDetails.toObject(e.platformDetails, n), n.oneofs && (o._platformDetails = "platformDetails")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, r;
    })(), c.HashedDetectedImageWithTimestamp = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.imageHash = "", r.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.imageHash = t.string();
              break;
            }
            case 2: {
              d.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !p.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !p.isInteger(t.timestampMillis) && !(t.timestampMillis && p.isInteger(t.timestampMillis.low) && p.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new s.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (p.Long ? (e.timestampMillis = p.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if (e.defaults)
          if (n.imageHash = "", p.Long) {
            let o = new p.Long(0, 0, !0);
            n.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            n.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (n.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? n.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : n.timestampMillis = e.longs === String ? p.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, r;
    })(), c.MediaTrackSettings = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.aspectRatio = null, r.prototype.autoGainControl = null, r.prototype.channelCount = null, r.prototype.deviceId = null, r.prototype.displaySurface = null, r.prototype.echoCancellation = null, r.prototype.facingMode = null, r.prototype.frameRate = null, r.prototype.groupId = null, r.prototype.height = null, r.prototype.noiseSuppression = null, r.prototype.sampleRate = null, r.prototype.sampleSize = null, r.prototype.width = null, r.prototype.deviceName = null;
      let t;
      return Object.defineProperty(r.prototype, "_aspectRatio", {
        get: p.oneOfGetter(t = ["aspectRatio"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_autoGainControl", {
        get: p.oneOfGetter(t = ["autoGainControl"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_channelCount", {
        get: p.oneOfGetter(t = ["channelCount"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceId", {
        get: p.oneOfGetter(t = ["deviceId"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_displaySurface", {
        get: p.oneOfGetter(t = ["displaySurface"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_echoCancellation", {
        get: p.oneOfGetter(t = ["echoCancellation"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_facingMode", {
        get: p.oneOfGetter(t = ["facingMode"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_frameRate", {
        get: p.oneOfGetter(t = ["frameRate"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_groupId", {
        get: p.oneOfGetter(t = ["groupId"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_height", {
        get: p.oneOfGetter(t = ["height"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_noiseSuppression", {
        get: p.oneOfGetter(t = ["noiseSuppression"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleRate", {
        get: p.oneOfGetter(t = ["sampleRate"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleSize", {
        get: p.oneOfGetter(t = ["sampleSize"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_width", {
        get: p.oneOfGetter(t = ["width"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceName", {
        get: p.oneOfGetter(t = ["deviceName"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && n.uint32(
          /* id 1, wireType 1 =*/
          9
        ).double(e.aspectRatio), e.autoGainControl != null && Object.hasOwnProperty.call(e, "autoGainControl") && n.uint32(
          /* id 2, wireType 0 =*/
          16
        ).bool(e.autoGainControl), e.channelCount != null && Object.hasOwnProperty.call(e, "channelCount") && n.uint32(
          /* id 3, wireType 0 =*/
          24
        ).int32(e.channelCount), e.deviceId != null && Object.hasOwnProperty.call(e, "deviceId") && n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).string(e.deviceId), e.displaySurface != null && Object.hasOwnProperty.call(e, "displaySurface") && n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.displaySurface), e.echoCancellation != null && Object.hasOwnProperty.call(e, "echoCancellation") && n.uint32(
          /* id 6, wireType 0 =*/
          48
        ).bool(e.echoCancellation), e.facingMode != null && Object.hasOwnProperty.call(e, "facingMode") && n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).string(e.facingMode), e.frameRate != null && Object.hasOwnProperty.call(e, "frameRate") && n.uint32(
          /* id 8, wireType 1 =*/
          65
        ).double(e.frameRate), e.groupId != null && Object.hasOwnProperty.call(e, "groupId") && n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).string(e.groupId), e.height != null && Object.hasOwnProperty.call(e, "height") && n.uint32(
          /* id 10, wireType 0 =*/
          80
        ).int32(e.height), e.noiseSuppression != null && Object.hasOwnProperty.call(e, "noiseSuppression") && n.uint32(
          /* id 11, wireType 0 =*/
          88
        ).bool(e.noiseSuppression), e.sampleRate != null && Object.hasOwnProperty.call(e, "sampleRate") && n.uint32(
          /* id 12, wireType 0 =*/
          96
        ).int32(e.sampleRate), e.sampleSize != null && Object.hasOwnProperty.call(e, "sampleSize") && n.uint32(
          /* id 13, wireType 0 =*/
          104
        ).int32(e.sampleSize), e.width != null && Object.hasOwnProperty.call(e, "width") && n.uint32(
          /* id 14, wireType 0 =*/
          112
        ).int32(e.width), e.deviceName != null && Object.hasOwnProperty.call(e, "deviceName") && n.uint32(
          /* id 15, wireType 2 =*/
          122
        ).string(e.deviceName), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.MediaTrackSettings();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.aspectRatio = e.double();
              break;
            }
            case 2: {
              u.autoGainControl = e.bool();
              break;
            }
            case 3: {
              u.channelCount = e.int32();
              break;
            }
            case 4: {
              u.deviceId = e.string();
              break;
            }
            case 5: {
              u.displaySurface = e.string();
              break;
            }
            case 6: {
              u.echoCancellation = e.bool();
              break;
            }
            case 7: {
              u.facingMode = e.string();
              break;
            }
            case 8: {
              u.frameRate = e.double();
              break;
            }
            case 9: {
              u.groupId = e.string();
              break;
            }
            case 10: {
              u.height = e.int32();
              break;
            }
            case 11: {
              u.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              u.sampleRate = e.int32();
              break;
            }
            case 13: {
              u.sampleSize = e.int32();
              break;
            }
            case 14: {
              u.width = e.int32();
              break;
            }
            case 15: {
              u.deviceName = e.string();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !p.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !p.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !p.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !p.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !p.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !p.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !p.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !p.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !p.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !p.isString(e.deviceName) ? "deviceName: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.MediaTrackSettings)
          return e;
        let n = new s.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (n.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (n.autoGainControl = !!e.autoGainControl), e.channelCount != null && (n.channelCount = e.channelCount | 0), e.deviceId != null && (n.deviceId = String(e.deviceId)), e.displaySurface != null && (n.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (n.echoCancellation = !!e.echoCancellation), e.facingMode != null && (n.facingMode = String(e.facingMode)), e.frameRate != null && (n.frameRate = Number(e.frameRate)), e.groupId != null && (n.groupId = String(e.groupId)), e.height != null && (n.height = e.height | 0), e.noiseSuppression != null && (n.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (n.sampleRate = e.sampleRate | 0), e.sampleSize != null && (n.sampleSize = e.sampleSize | 0), e.width != null && (n.width = e.width | 0), e.deviceName != null && (n.deviceName = String(e.deviceName)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && (o.aspectRatio = n.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, n.oneofs && (o._aspectRatio = "aspectRatio")), e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && (o.autoGainControl = e.autoGainControl, n.oneofs && (o._autoGainControl = "autoGainControl")), e.channelCount != null && e.hasOwnProperty("channelCount") && (o.channelCount = e.channelCount, n.oneofs && (o._channelCount = "channelCount")), e.deviceId != null && e.hasOwnProperty("deviceId") && (o.deviceId = e.deviceId, n.oneofs && (o._deviceId = "deviceId")), e.displaySurface != null && e.hasOwnProperty("displaySurface") && (o.displaySurface = e.displaySurface, n.oneofs && (o._displaySurface = "displaySurface")), e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && (o.echoCancellation = e.echoCancellation, n.oneofs && (o._echoCancellation = "echoCancellation")), e.facingMode != null && e.hasOwnProperty("facingMode") && (o.facingMode = e.facingMode, n.oneofs && (o._facingMode = "facingMode")), e.frameRate != null && e.hasOwnProperty("frameRate") && (o.frameRate = n.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, n.oneofs && (o._frameRate = "frameRate")), e.groupId != null && e.hasOwnProperty("groupId") && (o.groupId = e.groupId, n.oneofs && (o._groupId = "groupId")), e.height != null && e.hasOwnProperty("height") && (o.height = e.height, n.oneofs && (o._height = "height")), e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && (o.noiseSuppression = e.noiseSuppression, n.oneofs && (o._noiseSuppression = "noiseSuppression")), e.sampleRate != null && e.hasOwnProperty("sampleRate") && (o.sampleRate = e.sampleRate, n.oneofs && (o._sampleRate = "sampleRate")), e.sampleSize != null && e.hasOwnProperty("sampleSize") && (o.sampleSize = e.sampleSize, n.oneofs && (o._sampleSize = "sampleSize")), e.width != null && e.hasOwnProperty("width") && (o.width = e.width, n.oneofs && (o._width = "width")), e.deviceName != null && e.hasOwnProperty("deviceName") && (o.deviceName = e.deviceName, n.oneofs && (o._deviceName = "deviceName")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, r;
    })(), c.ImageBitmap = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.width = 0, r.prototype.height = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.ImageBitmap();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.width = t.int32();
              break;
            }
            case 2: {
              d.height = t.int32();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !p.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !p.isInteger(t.height) ? "height: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.ImageBitmap)
          return t;
        let e = new s.dot.v4.ImageBitmap();
        return t.width != null && (e.width = t.width | 0), t.height != null && (e.height = t.height | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.width = 0, n.height = 0), t.width != null && t.hasOwnProperty("width") && (n.width = t.width), t.height != null && t.hasOwnProperty("height") && (n.height = t.height), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, r;
    })(), c.CameraProperties = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraInitFrameResolution = null, r.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(r.prototype, "_cameraInitFrameResolution", {
        get: p.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && s.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && s.dot.v4.MediaTrackSettings.encode(e.cameraProperties, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.CameraProperties();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.cameraInitFrameResolution = s.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.cameraProperties = s.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution")) {
          let n = s.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution);
          if (n)
            return "cameraInitFrameResolution." + n;
        }
        if (e.cameraProperties != null && e.hasOwnProperty("cameraProperties")) {
          let n = s.dot.v4.MediaTrackSettings.verify(e.cameraProperties);
          if (n)
            return "cameraProperties." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.CameraProperties)
          return e;
        let n = new s.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (typeof e.cameraInitFrameResolution != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          n.cameraInitFrameResolution = s.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution);
        }
        if (e.cameraProperties != null) {
          if (typeof e.cameraProperties != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          n.cameraProperties = s.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.cameraProperties = null), e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution") && (o.cameraInitFrameResolution = s.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, n), n.oneofs && (o._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && e.hasOwnProperty("cameraProperties") && (o.cameraProperties = s.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, n)), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, r;
    })(), c.DetectedObject = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.brightness = 0, r.prototype.sharpness = 0, r.prototype.hotspots = 0, r.prototype.confidence = 0, r.prototype.faceSize = 0, r.prototype.faceCenter = null, r.prototype.smallestEdge = 0, r.prototype.bottomLeft = null, r.prototype.bottomRight = null, r.prototype.topLeft = null, r.prototype.topRight = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.DetectedObject();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
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
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.brightness = 0, n.sharpness = 0, n.hotspots = 0, n.confidence = 0, n.faceSize = 0, n.faceCenter = null, n.smallestEdge = 0, n.bottomLeft = null, n.bottomRight = null, n.topLeft = null, n.topRight = null), t.brightness != null && t.hasOwnProperty("brightness") && (n.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && t.hasOwnProperty("sharpness") && (n.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && t.hasOwnProperty("hotspots") && (n.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && t.hasOwnProperty("confidence") && (n.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && t.hasOwnProperty("faceSize") && (n.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && t.hasOwnProperty("faceCenter") && (n.faceCenter = s.dot.v4.Point.toObject(t.faceCenter, e)), t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && (n.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && t.hasOwnProperty("bottomLeft") && (n.bottomLeft = s.dot.v4.Point.toObject(t.bottomLeft, e)), t.bottomRight != null && t.hasOwnProperty("bottomRight") && (n.bottomRight = s.dot.v4.Point.toObject(t.bottomRight, e)), t.topLeft != null && t.hasOwnProperty("topLeft") && (n.topLeft = s.dot.v4.Point.toObject(t.topLeft, e)), t.topRight != null && t.hasOwnProperty("topRight") && (n.topRight = s.dot.v4.Point.toObject(t.topRight, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, r;
    })(), c.Point = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.x = 0, r.prototype.y = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Point();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.x = t.float();
              break;
            }
            case 2: {
              d.y = t.float();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.x != null && t.hasOwnProperty("x") && typeof t.x != "number" ? "x: number expected" : t.y != null && t.hasOwnProperty("y") && typeof t.y != "number" ? "y: number expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.Point)
          return t;
        let e = new s.dot.v4.Point();
        return t.x != null && (e.x = Number(t.x)), t.y != null && (e.y = Number(t.y)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.x = 0, n.y = 0), t.x != null && t.hasOwnProperty("x") && (n.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && t.hasOwnProperty("y") && (n.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, r;
    })(), c.ImageCrop = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.v4.Point.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.ImageCrop();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.image = s.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (n.image = s.dot.Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (n.topLeftCorner = s.dot.v4.Point.toObject(t.topLeftCorner, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageCrop";
      }, r;
    })(), c.PlatformDetails = (function() {
      function r(e) {
        if (this.browserVersions = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.userAgent = "", r.prototype.platform = null, r.prototype.platformVersion = null, r.prototype.architecture = null, r.prototype.model = null, r.prototype.browserVersions = p.emptyArray, r.prototype.installationId = null;
      let t;
      return Object.defineProperty(r.prototype, "_platform", {
        get: p.oneOfGetter(t = ["platform"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_platformVersion", {
        get: p.oneOfGetter(t = ["platformVersion"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_architecture", {
        get: p.oneOfGetter(t = ["architecture"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_model", {
        get: p.oneOfGetter(t = ["model"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_installationId", {
        get: p.oneOfGetter(t = ["installationId"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.userAgent), e.platform != null && Object.hasOwnProperty.call(e, "platform") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.platform), e.platformVersion != null && Object.hasOwnProperty.call(e, "platformVersion") && n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).string(e.platformVersion), e.architecture != null && Object.hasOwnProperty.call(e, "architecture") && n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).string(e.architecture), e.model != null && Object.hasOwnProperty.call(e, "model") && n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.model), e.browserVersions != null && e.browserVersions.length)
          for (let o = 0; o < e.browserVersions.length; ++o)
            s.dot.v4.BrowserVersion.encode(e.browserVersions[o], n.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork()).ldelim();
        return e.installationId != null && Object.hasOwnProperty.call(e, "installationId") && n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).string(e.installationId), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.PlatformDetails();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.userAgent = e.string();
              break;
            }
            case 2: {
              u.platform = e.string();
              break;
            }
            case 3: {
              u.platformVersion = e.string();
              break;
            }
            case 4: {
              u.architecture = e.string();
              break;
            }
            case 5: {
              u.model = e.string();
              break;
            }
            case 6: {
              u.browserVersions && u.browserVersions.length || (u.browserVersions = []), u.browserVersions.push(s.dot.v4.BrowserVersion.decode(e, e.uint32()));
              break;
            }
            case 7: {
              u.installationId = e.string();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
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
          for (let n = 0; n < e.browserVersions.length; ++n) {
            let o = s.dot.v4.BrowserVersion.verify(e.browserVersions[n]);
            if (o)
              return "browserVersions." + o;
          }
        }
        return e.installationId != null && e.hasOwnProperty("installationId") && !p.isString(e.installationId) ? "installationId: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.PlatformDetails)
          return e;
        let n = new s.dot.v4.PlatformDetails();
        if (e.userAgent != null && (n.userAgent = String(e.userAgent)), e.platform != null && (n.platform = String(e.platform)), e.platformVersion != null && (n.platformVersion = String(e.platformVersion)), e.architecture != null && (n.architecture = String(e.architecture)), e.model != null && (n.model = String(e.model)), e.browserVersions) {
          if (!Array.isArray(e.browserVersions))
            throw TypeError(".dot.v4.PlatformDetails.browserVersions: array expected");
          n.browserVersions = [];
          for (let o = 0; o < e.browserVersions.length; ++o) {
            if (typeof e.browserVersions[o] != "object")
              throw TypeError(".dot.v4.PlatformDetails.browserVersions: object expected");
            n.browserVersions[o] = s.dot.v4.BrowserVersion.fromObject(e.browserVersions[o]);
          }
        }
        return e.installationId != null && (n.installationId = String(e.installationId)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.browserVersions = []), n.defaults && (o.userAgent = ""), e.userAgent != null && e.hasOwnProperty("userAgent") && (o.userAgent = e.userAgent), e.platform != null && e.hasOwnProperty("platform") && (o.platform = e.platform, n.oneofs && (o._platform = "platform")), e.platformVersion != null && e.hasOwnProperty("platformVersion") && (o.platformVersion = e.platformVersion, n.oneofs && (o._platformVersion = "platformVersion")), e.architecture != null && e.hasOwnProperty("architecture") && (o.architecture = e.architecture, n.oneofs && (o._architecture = "architecture")), e.model != null && e.hasOwnProperty("model") && (o.model = e.model, n.oneofs && (o._model = "model")), e.browserVersions && e.browserVersions.length) {
          o.browserVersions = [];
          for (let d = 0; d < e.browserVersions.length; ++d)
            o.browserVersions[d] = s.dot.v4.BrowserVersion.toObject(e.browserVersions[d], n);
        }
        return e.installationId != null && e.hasOwnProperty("installationId") && (o.installationId = e.installationId, n.oneofs && (o._installationId = "installationId")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PlatformDetails";
      }, r;
    })(), c.BrowserVersion = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.name = "", r.prototype.version = "", r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.name != null && Object.hasOwnProperty.call(t, "name") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(t.version), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.BrowserVersion();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.name = t.string();
              break;
            }
            case 2: {
              d.version = t.string();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.name != null && t.hasOwnProperty("name") && !p.isString(t.name) ? "name: string expected" : t.version != null && t.hasOwnProperty("version") && !p.isString(t.version) ? "version: string expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.BrowserVersion)
          return t;
        let e = new s.dot.v4.BrowserVersion();
        return t.name != null && (e.name = String(t.name)), t.version != null && (e.version = String(t.version)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.name = "", n.version = ""), t.name != null && t.hasOwnProperty("name") && (n.name = t.name), t.version != null && t.hasOwnProperty("version") && (n.version = t.version), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.BrowserVersion";
      }, r;
    })(), c.FaceContent = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.FaceContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = s.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.FaceContent)
          return e;
        let n = new s.dot.v4.FaceContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          n.image = s.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.FaceContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = s.dot.Image.toObject(e.image, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FaceContent";
      }, r;
    })(), c.DocumentContent = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.DocumentContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = s.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.DocumentContent)
          return e;
        let n = new s.dot.v4.DocumentContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          n.image = s.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.DocumentContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = s.dot.Image.toObject(e.image, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.DocumentContent";
      }, r;
    })(), c.Blob = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.documentContent = null, r.prototype.eyeGazeLivenessContent = null, r.prototype.faceContent = null, r.prototype.magnifeyeLivenessContent = null, r.prototype.smileLivenessContent = null, r.prototype.palmContent = null, r.prototype.travelDocumentContent = null, r.prototype.multiRangeLivenessContent = null;
      let t;
      return Object.defineProperty(r.prototype, "blob", {
        get: p.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent", "multiRangeLivenessContent"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && s.dot.v4.DocumentContent.encode(e.documentContent, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && s.dot.v4.FaceContent.encode(e.faceContent, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && s.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && s.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && s.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && s.dot.v4.PalmContent.encode(e.palmContent, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && s.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.multiRangeLivenessContent != null && Object.hasOwnProperty.call(e, "multiRangeLivenessContent") && s.dot.v4.MultiRangeLivenessContent.encode(e.multiRangeLivenessContent, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.Blob();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.documentContent = s.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              u.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.faceContent = s.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              u.smileLivenessContent = s.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              u.palmContent = s.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              u.travelDocumentContent = s.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            case 8: {
              u.multiRangeLivenessContent = s.dot.v4.MultiRangeLivenessContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let n = {};
        if (e.documentContent != null && e.hasOwnProperty("documentContent")) {
          n.blob = 1;
          {
            let o = s.dot.v4.DocumentContent.verify(e.documentContent);
            if (o)
              return "documentContent." + o;
          }
        }
        if (e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent);
            if (o)
              return "eyeGazeLivenessContent." + o;
          }
        }
        if (e.faceContent != null && e.hasOwnProperty("faceContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.FaceContent.verify(e.faceContent);
            if (o)
              return "faceContent." + o;
          }
        }
        if (e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent);
            if (o)
              return "magnifeyeLivenessContent." + o;
          }
        }
        if (e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent);
            if (o)
              return "smileLivenessContent." + o;
          }
        }
        if (e.palmContent != null && e.hasOwnProperty("palmContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.PalmContent.verify(e.palmContent);
            if (o)
              return "palmContent." + o;
          }
        }
        if (e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent);
            if (o)
              return "travelDocumentContent." + o;
          }
        }
        if (e.multiRangeLivenessContent != null && e.hasOwnProperty("multiRangeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = s.dot.v4.MultiRangeLivenessContent.verify(e.multiRangeLivenessContent);
            if (o)
              return "multiRangeLivenessContent." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.Blob)
          return e;
        let n = new s.dot.v4.Blob();
        if (e.documentContent != null) {
          if (typeof e.documentContent != "object")
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          n.documentContent = s.dot.v4.DocumentContent.fromObject(e.documentContent);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (typeof e.eyeGazeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          n.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent);
        }
        if (e.faceContent != null) {
          if (typeof e.faceContent != "object")
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          n.faceContent = s.dot.v4.FaceContent.fromObject(e.faceContent);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (typeof e.magnifeyeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          n.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent);
        }
        if (e.smileLivenessContent != null) {
          if (typeof e.smileLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          n.smileLivenessContent = s.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent);
        }
        if (e.palmContent != null) {
          if (typeof e.palmContent != "object")
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          n.palmContent = s.dot.v4.PalmContent.fromObject(e.palmContent);
        }
        if (e.travelDocumentContent != null) {
          if (typeof e.travelDocumentContent != "object")
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          n.travelDocumentContent = s.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent);
        }
        if (e.multiRangeLivenessContent != null) {
          if (typeof e.multiRangeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.multiRangeLivenessContent: object expected");
          n.multiRangeLivenessContent = s.dot.v4.MultiRangeLivenessContent.fromObject(e.multiRangeLivenessContent);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return e.documentContent != null && e.hasOwnProperty("documentContent") && (o.documentContent = s.dot.v4.DocumentContent.toObject(e.documentContent, n), n.oneofs && (o.blob = "documentContent")), e.faceContent != null && e.hasOwnProperty("faceContent") && (o.faceContent = s.dot.v4.FaceContent.toObject(e.faceContent, n), n.oneofs && (o.blob = "faceContent")), e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent") && (o.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, n), n.oneofs && (o.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent") && (o.smileLivenessContent = s.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, n), n.oneofs && (o.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent") && (o.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, n), n.oneofs && (o.blob = "eyeGazeLivenessContent")), e.palmContent != null && e.hasOwnProperty("palmContent") && (o.palmContent = s.dot.v4.PalmContent.toObject(e.palmContent, n), n.oneofs && (o.blob = "palmContent")), e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent") && (o.travelDocumentContent = s.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, n), n.oneofs && (o.blob = "travelDocumentContent")), e.multiRangeLivenessContent != null && e.hasOwnProperty("multiRangeLivenessContent") && (o.multiRangeLivenessContent = s.dot.v4.MultiRangeLivenessContent.toObject(e.multiRangeLivenessContent, n), n.oneofs && (o.blob = "multiRangeLivenessContent")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, r;
    })(), c.TravelDocumentContent = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.ldsMasterFile = null, r.prototype.accessControlProtocolUsed = 0, r.prototype.authenticationStatus = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && s.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
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
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.TravelDocumentContent();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
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
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.ldsMasterFile = null, n.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, n.authenticationStatus = null, n.metadata = null), t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile") && (n.ldsMasterFile = s.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e)), t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed") && (n.accessControlProtocolUsed = e.enums === String ? s.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : s.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus") && (n.authenticationStatus = s.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = s.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, r;
    })(), c.LdsMasterFile = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.lds1eMrtdApplication = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && s.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.LdsMasterFile();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          u >>> 3 === 1 ? d.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32()) : t.skipType(u & 7);
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication")) {
          let e = s.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication);
          if (e)
            return "lds1eMrtdApplication." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.LdsMasterFile)
          return t;
        let e = new s.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (typeof t.lds1eMrtdApplication != "object")
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          e.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication") && (n.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, r;
    })(), c.Lds1eMrtdApplication = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.comHeaderAndDataGroupPresenceInformation = null, r.prototype.sodDocumentSecurityObject = null, r.prototype.dg1MachineReadableZoneInformation = null, r.prototype.dg2EncodedIdentificationFeaturesFace = null, r.prototype.dg3AdditionalIdentificationFeatureFingers = null, r.prototype.dg4AdditionalIdentificationFeatureIrises = null, r.prototype.dg5DisplayedPortrait = null, r.prototype.dg7DisplayedSignatureOrUsualMark = null, r.prototype.dg8DataFeatures = null, r.prototype.dg9StructureFeatures = null, r.prototype.dg10SubstanceFeatures = null, r.prototype.dg11AdditionalPersonalDetails = null, r.prototype.dg12AdditionalDocumentDetails = null, r.prototype.dg13OptionalDetails = null, r.prototype.dg14SecurityOptions = null, r.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, r.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(r.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: p.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: p.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg5DisplayedPortrait", {
        get: p.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: p.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg8DataFeatures", {
        get: p.oneOfGetter(t = ["dg8DataFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg9StructureFeatures", {
        get: p.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg10SubstanceFeatures", {
        get: p.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg11AdditionalPersonalDetails", {
        get: p.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg12AdditionalDocumentDetails", {
        get: p.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg13OptionalDetails", {
        get: p.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg14SecurityOptions", {
        get: p.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: p.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg16PersonsToNotify", {
        get: p.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && s.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && s.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && s.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && s.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && s.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && s.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && s.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && s.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && s.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && s.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && s.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, n.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && s.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, n.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork()).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && s.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, n.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork()).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && s.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, n.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork()).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && s.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, n.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork()).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && s.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, n.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork()).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && s.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, n.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              u.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              u.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              u.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              u.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              u.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              u.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              u.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              u.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              u.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              u.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              u.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              u.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              u.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              u.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation);
          if (n)
            return "comHeaderAndDataGroupPresenceInformation." + n;
        }
        if (e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject);
          if (n)
            return "sodDocumentSecurityObject." + n;
        }
        if (e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation);
          if (n)
            return "dg1MachineReadableZoneInformation." + n;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace);
          if (n)
            return "dg2EncodedIdentificationFeaturesFace." + n;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers);
          if (n)
            return "dg3AdditionalIdentificationFeatureFingers." + n;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises);
          if (n)
            return "dg4AdditionalIdentificationFeatureIrises." + n;
        }
        if (e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait);
          if (n)
            return "dg5DisplayedPortrait." + n;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark);
          if (n)
            return "dg7DisplayedSignatureOrUsualMark." + n;
        }
        if (e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures);
          if (n)
            return "dg8DataFeatures." + n;
        }
        if (e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures);
          if (n)
            return "dg9StructureFeatures." + n;
        }
        if (e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures);
          if (n)
            return "dg10SubstanceFeatures." + n;
        }
        if (e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails);
          if (n)
            return "dg11AdditionalPersonalDetails." + n;
        }
        if (e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails);
          if (n)
            return "dg12AdditionalDocumentDetails." + n;
        }
        if (e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails);
          if (n)
            return "dg13OptionalDetails." + n;
        }
        if (e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions);
          if (n)
            return "dg14SecurityOptions." + n;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo);
          if (n)
            return "dg15ActiveAuthenticationPublicKeyInfo." + n;
        }
        if (e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify")) {
          let n = s.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify);
          if (n)
            return "dg16PersonsToNotify." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.Lds1eMrtdApplication)
          return e;
        let n = new s.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (typeof e.comHeaderAndDataGroupPresenceInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          n.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (typeof e.sodDocumentSecurityObject != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          n.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (typeof e.dg1MachineReadableZoneInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          n.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (typeof e.dg2EncodedIdentificationFeaturesFace != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          n.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (typeof e.dg3AdditionalIdentificationFeatureFingers != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          n.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (typeof e.dg4AdditionalIdentificationFeatureIrises != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          n.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (typeof e.dg5DisplayedPortrait != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          n.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (typeof e.dg7DisplayedSignatureOrUsualMark != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          n.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark);
        }
        if (e.dg8DataFeatures != null) {
          if (typeof e.dg8DataFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          n.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures);
        }
        if (e.dg9StructureFeatures != null) {
          if (typeof e.dg9StructureFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          n.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (typeof e.dg10SubstanceFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          n.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (typeof e.dg11AdditionalPersonalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          n.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (typeof e.dg12AdditionalDocumentDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          n.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails);
        }
        if (e.dg13OptionalDetails != null) {
          if (typeof e.dg13OptionalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          n.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails);
        }
        if (e.dg14SecurityOptions != null) {
          if (typeof e.dg14SecurityOptions != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          n.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (typeof e.dg15ActiveAuthenticationPublicKeyInfo != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          n.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo);
        }
        if (e.dg16PersonsToNotify != null) {
          if (typeof e.dg16PersonsToNotify != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          n.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.comHeaderAndDataGroupPresenceInformation = null, o.sodDocumentSecurityObject = null, o.dg1MachineReadableZoneInformation = null, o.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation") && (o.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, n)), e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject") && (o.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, n)), e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation") && (o.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, n)), e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace") && (o.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, n)), e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers") && (o.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, n), n.oneofs && (o._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises") && (o.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, n), n.oneofs && (o._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait") && (o.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, n), n.oneofs && (o._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark") && (o.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, n), n.oneofs && (o._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures") && (o.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, n), n.oneofs && (o._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures") && (o.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, n), n.oneofs && (o._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures") && (o.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, n), n.oneofs && (o._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails") && (o.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, n), n.oneofs && (o._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails") && (o.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, n), n.oneofs && (o._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails") && (o.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, n), n.oneofs && (o._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions") && (o.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, n), n.oneofs && (o._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo") && (o.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, n), n.oneofs && (o._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify") && (o.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, n), n.oneofs && (o._dg16PersonsToNotify = "dg16PersonsToNotify")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, r;
    })(), c.Lds1ElementaryFile = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.id = 0, r.prototype.bytes = null;
      let t;
      return Object.defineProperty(r.prototype, "_bytes", {
        get: p.oneOfGetter(t = ["bytes"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.Lds1ElementaryFile();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.id = e.int32();
              break;
            }
            case 2: {
              u.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
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
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.Lds1ElementaryFile)
          return e;
        let n = new s.dot.v4.Lds1ElementaryFile();
        switch (e.id) {
          default:
            if (typeof e.id == "number") {
              n.id = e.id;
              break;
            }
            break;
          case "ID_UNSPECIFIED":
          case 0:
            n.id = 0;
            break;
          case "ID_COM":
          case 1:
            n.id = 1;
            break;
          case "ID_SOD":
          case 2:
            n.id = 2;
            break;
          case "ID_DG1":
          case 3:
            n.id = 3;
            break;
          case "ID_DG2":
          case 4:
            n.id = 4;
            break;
          case "ID_DG3":
          case 5:
            n.id = 5;
            break;
          case "ID_DG4":
          case 6:
            n.id = 6;
            break;
          case "ID_DG5":
          case 7:
            n.id = 7;
            break;
          case "ID_DG7":
          case 8:
            n.id = 8;
            break;
          case "ID_DG8":
          case 9:
            n.id = 9;
            break;
          case "ID_DG9":
          case 10:
            n.id = 10;
            break;
          case "ID_DG10":
          case 11:
            n.id = 11;
            break;
          case "ID_DG11":
          case 12:
            n.id = 12;
            break;
          case "ID_DG12":
          case 13:
            n.id = 13;
            break;
          case "ID_DG13":
          case 14:
            n.id = 14;
            break;
          case "ID_DG14":
          case 15:
            n.id = 15;
            break;
          case "ID_DG15":
          case 16:
            n.id = 16;
            break;
          case "ID_DG16":
          case 17:
            n.id = 17;
            break;
        }
        return e.bytes != null && (typeof e.bytes == "string" ? p.base64.decode(e.bytes, n.bytes = p.newBuffer(p.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (n.bytes = e.bytes)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.id = n.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (o.id = n.enums === String ? s.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : s.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (o.bytes = n.bytes === String ? p.base64.encode(e.bytes, 0, e.bytes.length) : n.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, n.oneofs && (o._bytes = "bytes")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, r.Id = (function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "ID_UNSPECIFIED"] = 0, n[e[1] = "ID_COM"] = 1, n[e[2] = "ID_SOD"] = 2, n[e[3] = "ID_DG1"] = 3, n[e[4] = "ID_DG2"] = 4, n[e[5] = "ID_DG3"] = 5, n[e[6] = "ID_DG4"] = 6, n[e[7] = "ID_DG5"] = 7, n[e[8] = "ID_DG7"] = 8, n[e[9] = "ID_DG8"] = 9, n[e[10] = "ID_DG9"] = 10, n[e[11] = "ID_DG10"] = 11, n[e[12] = "ID_DG11"] = 12, n[e[13] = "ID_DG12"] = 13, n[e[14] = "ID_DG13"] = 14, n[e[15] = "ID_DG14"] = 15, n[e[16] = "ID_DG15"] = 16, n[e[17] = "ID_DG16"] = 17, n;
      })(), r;
    })(), c.AccessControlProtocol = (function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[r[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[r[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    })(), c.AuthenticationStatus = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.data = null, r.prototype.chip = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && s.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && s.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.AuthenticationStatus();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.data = s.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.chip = s.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.data = null, n.chip = null), t.data != null && t.hasOwnProperty("data") && (n.data = s.dot.v4.DataAuthenticationStatus.toObject(t.data, e)), t.chip != null && t.hasOwnProperty("chip") && (n.chip = s.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, r;
    })(), c.DataAuthenticationStatus = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.status = 0, r.prototype.protocol = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.DataAuthenticationStatus();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.status = t.int32();
              break;
            }
            case 2: {
              d.protocol = t.int32();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, n.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && t.hasOwnProperty("status") && (n.status = e.enums === String ? s.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : s.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && t.hasOwnProperty("protocol") && (n.protocol = e.enums === String ? s.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : s.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, r.Status = (function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      })(), r.Protocol = (function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      })(), r;
    })(), c.ChipAuthenticationStatus = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.status = 0, r.prototype.protocol = null, r.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(r.prototype, "_protocol", {
        get: p.oneOfGetter(t = ["protocol"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_activeAuthenticationResponse", {
        get: p.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.status), e.protocol != null && Object.hasOwnProperty.call(e, "protocol") && n.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(e.protocol), e.activeAuthenticationResponse != null && Object.hasOwnProperty.call(e, "activeAuthenticationResponse") && n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(e.activeAuthenticationResponse), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.status = e.int32();
              break;
            }
            case 2: {
              u.protocol = e.int32();
              break;
            }
            case 3: {
              u.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
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
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.ChipAuthenticationStatus)
          return e;
        let n = new s.dot.v4.ChipAuthenticationStatus();
        switch (e.status) {
          default:
            if (typeof e.status == "number") {
              n.status = e.status;
              break;
            }
            break;
          case "STATUS_UNSPECIFIED":
          case 0:
            n.status = 0;
            break;
          case "STATUS_AUTHENTICATED":
          case 1:
            n.status = 1;
            break;
          case "STATUS_DENIED":
          case 2:
            n.status = 2;
            break;
          case "STATUS_NOT_SUPPORTED":
          case 3:
            n.status = 3;
            break;
        }
        switch (e.protocol) {
          default:
            if (typeof e.protocol == "number") {
              n.protocol = e.protocol;
              break;
            }
            break;
          case "PROTOCOL_UNSPECIFIED":
          case 0:
            n.protocol = 0;
            break;
          case "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING":
          case 1:
            n.protocol = 1;
            break;
          case "PROTOCOL_CHIP_AUTHENTICATION":
          case 2:
            n.protocol = 2;
            break;
          case "PROTOCOL_ACTIVE_AUTHENTICATION":
          case 3:
            n.protocol = 3;
            break;
        }
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? p.base64.decode(e.activeAuthenticationResponse, n.activeAuthenticationResponse = p.newBuffer(p.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (n.activeAuthenticationResponse = e.activeAuthenticationResponse)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.status = n.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (o.status = n.enums === String ? s.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : s.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (o.protocol = n.enums === String ? s.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : s.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, n.oneofs && (o._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (o.activeAuthenticationResponse = n.bytes === String ? p.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : n.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, n.oneofs && (o._activeAuthenticationResponse = "activeAuthenticationResponse")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, r.Status = (function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "STATUS_UNSPECIFIED"] = 0, n[e[1] = "STATUS_AUTHENTICATED"] = 1, n[e[2] = "STATUS_DENIED"] = 2, n[e[3] = "STATUS_NOT_SUPPORTED"] = 3, n;
      })(), r.Protocol = (function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, n[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, n[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, n[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, n;
      })(), r;
    })(), c.EyeGazeLivenessContent = (function() {
      function r(e) {
        if (this.segments = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.segments = p.emptyArray, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_image", {
        get: p.oneOfGetter(t = ["image"]),
        set: p.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.segments != null && e.segments.length)
          for (let o = 0; o < e.segments.length; ++o)
            s.dot.v4.EyeGazeLivenessSegment.encode(e.segments[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 3: {
              u.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              u.segments && u.segments.length || (u.segments = []), u.segments.push(s.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = s.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.segments != null && e.hasOwnProperty("segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let n = 0; n < e.segments.length; ++n) {
            let o = s.dot.v4.EyeGazeLivenessSegment.verify(e.segments[n]);
            if (o)
              return "segments." + o;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.EyeGazeLivenessContent)
          return e;
        let n = new s.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          n.image = s.dot.Image.fromObject(e.image);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          n.segments = [];
          for (let o = 0; o < e.segments.length; ++o) {
            if (typeof e.segments[o] != "object")
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            n.segments[o] = s.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[o]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.segments = []), n.defaults && (o.metadata = null), e.segments && e.segments.length) {
          o.segments = [];
          for (let d = 0; d < e.segments.length; ++d)
            o.segments[d] = s.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[d], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.image != null && e.hasOwnProperty("image") && (o.image = s.dot.Image.toObject(e.image, n), n.oneofs && (o._image = "image")), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, r;
    })(), c.EyeGazeLivenessSegment = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.corner = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.corner = t.int32();
              break;
            }
            case 2: {
              d.image = s.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
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
      }, r.fromObject = function(t) {
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
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.corner = e.enums === String ? "TOP_LEFT" : 0, n.image = null), t.corner != null && t.hasOwnProperty("corner") && (n.corner = e.enums === String ? s.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : s.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && t.hasOwnProperty("image") && (n.image = s.dot.Image.toObject(t.image, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, r;
    })(), c.EyeGazeLivenessCorner = (function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "TOP_LEFT"] = 0, t[r[1] = "TOP_RIGHT"] = 1, t[r[2] = "BOTTOM_RIGHT"] = 2, t[r[3] = "BOTTOM_LEFT"] = 3, t;
    })(), c.MultiRangeLivenessContent = (function() {
      function r(e) {
        if (this.stepResults = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.stepResults = p.emptyArray, r.prototype.metadata = null, r.prototype.video = null, r.prototype.multiRangeLivenessMetadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = F.create()), e.stepResults != null && e.stepResults.length)
          for (let o = 0; o < e.stepResults.length; ++o)
            s.dot.v4.MultiRangeLivenessStepResult.encode(e.stepResults[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.multiRangeLivenessMetadata != null && Object.hasOwnProperty.call(e, "multiRangeLivenessMetadata") && s.dot.v4.MultiRangeLivenessMetadata.encode(e.multiRangeLivenessMetadata, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.MultiRangeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.stepResults && u.stepResults.length || (u.stepResults = []), u.stepResults.push(s.dot.v4.MultiRangeLivenessStepResult.decode(e, e.uint32()));
              break;
            }
            case 2: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 4: {
              u.multiRangeLivenessMetadata = s.dot.v4.MultiRangeLivenessMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.stepResults != null && e.hasOwnProperty("stepResults")) {
          if (!Array.isArray(e.stepResults))
            return "stepResults: array expected";
          for (let n = 0; n < e.stepResults.length; ++n) {
            let o = s.dot.v4.MultiRangeLivenessStepResult.verify(e.stepResults[n]);
            if (o)
              return "stepResults." + o;
          }
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.multiRangeLivenessMetadata != null && e.hasOwnProperty("multiRangeLivenessMetadata")) {
          let n = s.dot.v4.MultiRangeLivenessMetadata.verify(e.multiRangeLivenessMetadata);
          if (n)
            return "multiRangeLivenessMetadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.MultiRangeLivenessContent)
          return e;
        let n = new s.dot.v4.MultiRangeLivenessContent();
        if (e.stepResults) {
          if (!Array.isArray(e.stepResults))
            throw TypeError(".dot.v4.MultiRangeLivenessContent.stepResults: array expected");
          n.stepResults = [];
          for (let o = 0; o < e.stepResults.length; ++o) {
            if (typeof e.stepResults[o] != "object")
              throw TypeError(".dot.v4.MultiRangeLivenessContent.stepResults: object expected");
            n.stepResults[o] = s.dot.v4.MultiRangeLivenessStepResult.fromObject(e.stepResults[o]);
          }
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.multiRangeLivenessMetadata != null) {
          if (typeof e.multiRangeLivenessMetadata != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessContent.multiRangeLivenessMetadata: object expected");
          n.multiRangeLivenessMetadata = s.dot.v4.MultiRangeLivenessMetadata.fromObject(e.multiRangeLivenessMetadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.stepResults = []), n.defaults && (o.metadata = null, o.multiRangeLivenessMetadata = null), e.stepResults && e.stepResults.length) {
          o.stepResults = [];
          for (let d = 0; d < e.stepResults.length; ++d)
            o.stepResults[d] = s.dot.v4.MultiRangeLivenessStepResult.toObject(e.stepResults[d], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), e.multiRangeLivenessMetadata != null && e.hasOwnProperty("multiRangeLivenessMetadata") && (o.multiRangeLivenessMetadata = s.dot.v4.MultiRangeLivenessMetadata.toObject(e.multiRangeLivenessMetadata, n)), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MultiRangeLivenessContent";
      }, r;
    })(), c.MultiRangeLivenessStepResult = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.challengeItem = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.challengeItem != null && Object.hasOwnProperty.call(t, "challengeItem") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.challengeItem), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.ImageWithTimestamp.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.MultiRangeLivenessStepResult();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.challengeItem = t.int32();
              break;
            }
            case 2: {
              d.image = s.dot.ImageWithTimestamp.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.challengeItem != null && t.hasOwnProperty("challengeItem"))
          switch (t.challengeItem) {
            default:
              return "challengeItem: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
              break;
          }
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = s.dot.ImageWithTimestamp.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.MultiRangeLivenessStepResult)
          return t;
        let e = new s.dot.v4.MultiRangeLivenessStepResult();
        switch (t.challengeItem) {
          default:
            if (typeof t.challengeItem == "number") {
              e.challengeItem = t.challengeItem;
              break;
            }
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED":
          case 0:
            e.challengeItem = 0;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ZERO":
          case 1:
            e.challengeItem = 1;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ONE":
          case 2:
            e.challengeItem = 2;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_TWO":
          case 3:
            e.challengeItem = 3;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_THREE":
          case 4:
            e.challengeItem = 4;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FOUR":
          case 5:
            e.challengeItem = 5;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FIVE":
          case 6:
            e.challengeItem = 6;
            break;
        }
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessStepResult.image: object expected");
          e.image = s.dot.ImageWithTimestamp.fromObject(t.image);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.challengeItem = e.enums === String ? "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED" : 0, n.image = null), t.challengeItem != null && t.hasOwnProperty("challengeItem") && (n.challengeItem = e.enums === String ? s.dot.v4.MultiRangeLivenessChallengeItem[t.challengeItem] === void 0 ? t.challengeItem : s.dot.v4.MultiRangeLivenessChallengeItem[t.challengeItem] : t.challengeItem), t.image != null && t.hasOwnProperty("image") && (n.image = s.dot.ImageWithTimestamp.toObject(t.image, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessStepResult";
      }, r;
    })(), c.MultiRangeLivenessChallengeItem = (function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED"] = 0, t[r[1] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ZERO"] = 1, t[r[2] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ONE"] = 2, t[r[3] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_TWO"] = 3, t[r[4] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_THREE"] = 4, t[r[5] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FOUR"] = 5, t[r[6] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FIVE"] = 6, t;
    })(), c.MultiRangeLivenessMetadata = (function() {
      function r(t) {
        if (this.detections = [], t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.detections = p.emptyArray, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        if (e || (e = F.create()), t.detections != null && t.detections.length)
          for (let n = 0; n < t.detections.length; ++n)
            s.dot.v4.FaceDetection.encode(t.detections[n], e.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.MultiRangeLivenessMetadata();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          u >>> 3 === 1 ? (d.detections && d.detections.length || (d.detections = []), d.detections.push(s.dot.v4.FaceDetection.decode(t, t.uint32()))) : t.skipType(u & 7);
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.detections != null && t.hasOwnProperty("detections")) {
          if (!Array.isArray(t.detections))
            return "detections: array expected";
          for (let e = 0; e < t.detections.length; ++e) {
            let n = s.dot.v4.FaceDetection.verify(t.detections[e]);
            if (n)
              return "detections." + n;
          }
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.MultiRangeLivenessMetadata)
          return t;
        let e = new s.dot.v4.MultiRangeLivenessMetadata();
        if (t.detections) {
          if (!Array.isArray(t.detections))
            throw TypeError(".dot.v4.MultiRangeLivenessMetadata.detections: array expected");
          e.detections = [];
          for (let n = 0; n < t.detections.length; ++n) {
            if (typeof t.detections[n] != "object")
              throw TypeError(".dot.v4.MultiRangeLivenessMetadata.detections: object expected");
            e.detections[n] = s.dot.v4.FaceDetection.fromObject(t.detections[n]);
          }
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if ((e.arrays || e.defaults) && (n.detections = []), t.detections && t.detections.length) {
          n.detections = [];
          for (let o = 0; o < t.detections.length; ++o)
            n.detections[o] = s.dot.v4.FaceDetection.toObject(t.detections[o], e);
        }
        return n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessMetadata";
      }, r;
    })(), c.FaceDetection = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, r.prototype.position = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).uint64(t.timestampMillis), t.position != null && Object.hasOwnProperty.call(t, "position") && s.dot.v4.FaceDetectionPosition.encode(t.position, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.FaceDetection();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.timestampMillis = t.uint64();
              break;
            }
            case 2: {
              d.position = s.dot.v4.FaceDetectionPosition.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !p.isInteger(t.timestampMillis) && !(t.timestampMillis && p.isInteger(t.timestampMillis.low) && p.isInteger(t.timestampMillis.high)))
          return "timestampMillis: integer|Long expected";
        if (t.position != null && t.hasOwnProperty("position")) {
          let e = s.dot.v4.FaceDetectionPosition.verify(t.position);
          if (e)
            return "position." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.FaceDetection)
          return t;
        let e = new s.dot.v4.FaceDetection();
        if (t.timestampMillis != null && (p.Long ? (e.timestampMillis = p.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), t.position != null) {
          if (typeof t.position != "object")
            throw TypeError(".dot.v4.FaceDetection.position: object expected");
          e.position = s.dot.v4.FaceDetectionPosition.fromObject(t.position);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if (e.defaults) {
          if (p.Long) {
            let o = new p.Long(0, 0, !0);
            n.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            n.timestampMillis = e.longs === String ? "0" : 0;
          n.position = null;
        }
        return t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? n.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : n.timestampMillis = e.longs === String ? p.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new p.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), t.position != null && t.hasOwnProperty("position") && (n.position = s.dot.v4.FaceDetectionPosition.toObject(t.position, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetection";
      }, r;
    })(), c.FaceDetectionPosition = (function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.center = null, r.prototype.faceSizeToImageShorterSideRatio = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = F.create()), t.center != null && Object.hasOwnProperty.call(t, "center") && s.dot.PointDouble.encode(t.center, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.faceSizeToImageShorterSideRatio != null && Object.hasOwnProperty.call(t, "faceSizeToImageShorterSideRatio") && e.uint32(
          /* id 2, wireType 1 =*/
          17
        ).double(t.faceSizeToImageShorterSideRatio), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof b || (t = b.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.FaceDetectionPosition();
        for (; t.pos < o; ) {
          let u = t.uint32();
          if (u === n)
            break;
          switch (u >>> 3) {
            case 1: {
              d.center = s.dot.PointDouble.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.faceSizeToImageShorterSideRatio = t.double();
              break;
            }
            default:
              t.skipType(u & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.center != null && t.hasOwnProperty("center")) {
          let e = s.dot.PointDouble.verify(t.center);
          if (e)
            return "center." + e;
        }
        return t.faceSizeToImageShorterSideRatio != null && t.hasOwnProperty("faceSizeToImageShorterSideRatio") && typeof t.faceSizeToImageShorterSideRatio != "number" ? "faceSizeToImageShorterSideRatio: number expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof s.dot.v4.FaceDetectionPosition)
          return t;
        let e = new s.dot.v4.FaceDetectionPosition();
        if (t.center != null) {
          if (typeof t.center != "object")
            throw TypeError(".dot.v4.FaceDetectionPosition.center: object expected");
          e.center = s.dot.PointDouble.fromObject(t.center);
        }
        return t.faceSizeToImageShorterSideRatio != null && (e.faceSizeToImageShorterSideRatio = Number(t.faceSizeToImageShorterSideRatio)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.center = null, n.faceSizeToImageShorterSideRatio = 0), t.center != null && t.hasOwnProperty("center") && (n.center = s.dot.PointDouble.toObject(t.center, e)), t.faceSizeToImageShorterSideRatio != null && t.hasOwnProperty("faceSizeToImageShorterSideRatio") && (n.faceSizeToImageShorterSideRatio = e.json && !isFinite(t.faceSizeToImageShorterSideRatio) ? String(t.faceSizeToImageShorterSideRatio) : t.faceSizeToImageShorterSideRatio), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetectionPosition";
      }, r;
    })(), c.SmileLivenessContent = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.neutralExpressionFaceImage = null, r.prototype.smileExpressionFaceImage = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && s.dot.Image.encode(e.neutralExpressionFaceImage, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage") && s.dot.Image.encode(e.smileExpressionFaceImage, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.SmileLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.neutralExpressionFaceImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.smileExpressionFaceImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage")) {
          let n = s.dot.Image.verify(e.neutralExpressionFaceImage);
          if (n)
            return "neutralExpressionFaceImage." + n;
        }
        if (e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage")) {
          let n = s.dot.Image.verify(e.smileExpressionFaceImage);
          if (n)
            return "smileExpressionFaceImage." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.SmileLivenessContent)
          return e;
        let n = new s.dot.v4.SmileLivenessContent();
        if (e.neutralExpressionFaceImage != null) {
          if (typeof e.neutralExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          n.neutralExpressionFaceImage = s.dot.Image.fromObject(e.neutralExpressionFaceImage);
        }
        if (e.smileExpressionFaceImage != null) {
          if (typeof e.smileExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          n.smileExpressionFaceImage = s.dot.Image.fromObject(e.smileExpressionFaceImage);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.neutralExpressionFaceImage = null, o.smileExpressionFaceImage = null, o.metadata = null), e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage") && (o.neutralExpressionFaceImage = s.dot.Image.toObject(e.neutralExpressionFaceImage, n)), e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage") && (o.smileExpressionFaceImage = s.dot.Image.toObject(e.smileExpressionFaceImage, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.SmileLivenessContent";
      }, r;
    })(), c.PalmContent = (function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: p.oneOfGetter(t = ["video"]),
        set: p.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = F.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && s.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && s.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof b || (e = b.create(e));
        let d = n === void 0 ? e.len : e.pos + n, u = new s.dot.v4.PalmContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              u.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              u.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              u.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(e) {
        return e instanceof b || (e = new b(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = s.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = s.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = s.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof s.dot.v4.PalmContent)
          return e;
        let n = new s.dot.v4.PalmContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          n.image = s.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.PalmContent.video: object expected");
          n.video = s.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          n.metadata = s.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = s.dot.Image.toObject(e.image, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = s.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = s.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, R.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PalmContent";
      }, r;
    })(), c;
  })(), g.Image = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.bytes = p.newBuffer([]), c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.Image();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        d >>> 3 === 1 ? o.bytes = r.bytes() : r.skipType(d & 7);
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.Image)
        return r;
      let t = new s.dot.Image();
      return r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Image";
    }, c;
  })(), g.ImageWithTimestamp = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.image = null, c.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.image != null && Object.hasOwnProperty.call(r, "image") && s.dot.Image.encode(r.image, t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).fork()).ldelim(), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.ImageWithTimestamp();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.image = s.dot.Image.decode(r, r.uint32());
            break;
          }
          case 2: {
            o.timestampMillis = r.uint64();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.image != null && r.hasOwnProperty("image")) {
        let t = s.dot.Image.verify(r.image);
        if (t)
          return "image." + t;
      }
      return r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !p.isInteger(r.timestampMillis) && !(r.timestampMillis && p.isInteger(r.timestampMillis.low) && p.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.ImageWithTimestamp)
        return r;
      let t = new s.dot.ImageWithTimestamp();
      if (r.image != null) {
        if (typeof r.image != "object")
          throw TypeError(".dot.ImageWithTimestamp.image: object expected");
        t.image = s.dot.Image.fromObject(r.image);
      }
      return r.timestampMillis != null && (p.Long ? (t.timestampMillis = p.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (e.image = null, p.Long) {
          let n = new p.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.image != null && r.hasOwnProperty("image") && (e.image = s.dot.Image.toObject(r.image, t)), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? p.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageWithTimestamp";
    }, c;
  })(), g.ImageSize = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.width = 0, c.prototype.height = 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.width != null && Object.hasOwnProperty.call(r, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.width), r.height != null && Object.hasOwnProperty.call(r, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.height), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.ImageSize();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.width = r.int32();
            break;
          }
          case 2: {
            o.height = r.int32();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.width != null && r.hasOwnProperty("width") && !p.isInteger(r.width) ? "width: integer expected" : r.height != null && r.hasOwnProperty("height") && !p.isInteger(r.height) ? "height: integer expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.ImageSize)
        return r;
      let t = new s.dot.ImageSize();
      return r.width != null && (t.width = r.width | 0), r.height != null && (t.height = r.height | 0), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), r.width != null && r.hasOwnProperty("width") && (e.width = r.width), r.height != null && r.hasOwnProperty("height") && (e.height = r.height), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageSize";
    }, c;
  })(), g.Int32List = (function() {
    function c(r) {
      if (this.items = [], r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.items = p.emptyArray, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      if (t || (t = F.create()), r.items != null && r.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < r.items.length; ++e)
          t.int32(r.items[e]);
        t.ldelim();
      }
      return t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.Int32List();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            if (o.items && o.items.length || (o.items = []), (d & 7) === 2) {
              let u = r.uint32() + r.pos;
              for (; r.pos < u; )
                o.items.push(r.int32());
            } else
              o.items.push(r.int32());
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.items != null && r.hasOwnProperty("items")) {
        if (!Array.isArray(r.items))
          return "items: array expected";
        for (let t = 0; t < r.items.length; ++t)
          if (!p.isInteger(r.items[t]))
            return "items: integer[] expected";
      }
      return null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.Int32List)
        return r;
      let t = new s.dot.Int32List();
      if (r.items) {
        if (!Array.isArray(r.items))
          throw TypeError(".dot.Int32List.items: array expected");
        t.items = [];
        for (let e = 0; e < r.items.length; ++e)
          t.items[e] = r.items[e] | 0;
      }
      return t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), r.items && r.items.length) {
        e.items = [];
        for (let n = 0; n < r.items.length; ++n)
          e.items[n] = r.items[n];
      }
      return e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Int32List";
    }, c;
  })(), g.Platform = (function() {
    const c = {}, r = Object.create(c);
    return r[c[0] = "WEB"] = 0, r[c[1] = "ANDROID"] = 1, r[c[2] = "IOS"] = 2, r;
  })(), g.RectangleDouble = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.left = 0, c.prototype.top = 0, c.prototype.right = 0, c.prototype.bottom = 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.left != null && Object.hasOwnProperty.call(r, "left") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(r.left), r.top != null && Object.hasOwnProperty.call(r, "top") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(r.top), r.right != null && Object.hasOwnProperty.call(r, "right") && t.uint32(
        /* id 3, wireType 1 =*/
        25
      ).double(r.right), r.bottom != null && Object.hasOwnProperty.call(r, "bottom") && t.uint32(
        /* id 4, wireType 1 =*/
        33
      ).double(r.bottom), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.RectangleDouble();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.left = r.double();
            break;
          }
          case 2: {
            o.top = r.double();
            break;
          }
          case 3: {
            o.right = r.double();
            break;
          }
          case 4: {
            o.bottom = r.double();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.left != null && r.hasOwnProperty("left") && typeof r.left != "number" ? "left: number expected" : r.top != null && r.hasOwnProperty("top") && typeof r.top != "number" ? "top: number expected" : r.right != null && r.hasOwnProperty("right") && typeof r.right != "number" ? "right: number expected" : r.bottom != null && r.hasOwnProperty("bottom") && typeof r.bottom != "number" ? "bottom: number expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.RectangleDouble)
        return r;
      let t = new s.dot.RectangleDouble();
      return r.left != null && (t.left = Number(r.left)), r.top != null && (t.top = Number(r.top)), r.right != null && (t.right = Number(r.right)), r.bottom != null && (t.bottom = Number(r.bottom)), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), r.left != null && r.hasOwnProperty("left") && (e.left = t.json && !isFinite(r.left) ? String(r.left) : r.left), r.top != null && r.hasOwnProperty("top") && (e.top = t.json && !isFinite(r.top) ? String(r.top) : r.top), r.right != null && r.hasOwnProperty("right") && (e.right = t.json && !isFinite(r.right) ? String(r.right) : r.right), r.bottom != null && r.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(r.bottom) ? String(r.bottom) : r.bottom), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.RectangleDouble";
    }, c;
  })(), g.DigestWithTimestamp = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.digest = p.newBuffer([]), c.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.digest != null && Object.hasOwnProperty.call(r, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.digest), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.DigestWithTimestamp();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.digest = r.bytes();
            break;
          }
          case 2: {
            o.timestampMillis = r.uint64();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.digest != null && r.hasOwnProperty("digest") && !(r.digest && typeof r.digest.length == "number" || p.isString(r.digest)) ? "digest: buffer expected" : r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !p.isInteger(r.timestampMillis) && !(r.timestampMillis && p.isInteger(r.timestampMillis.low) && p.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.DigestWithTimestamp)
        return r;
      let t = new s.dot.DigestWithTimestamp();
      return r.digest != null && (typeof r.digest == "string" ? p.base64.decode(r.digest, t.digest = p.newBuffer(p.base64.length(r.digest)), 0) : r.digest.length >= 0 && (t.digest = r.digest)), r.timestampMillis != null && (p.Long ? (t.timestampMillis = p.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = p.newBuffer(e.digest))), p.Long) {
          let n = new p.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.digest != null && r.hasOwnProperty("digest") && (e.digest = t.bytes === String ? p.base64.encode(r.digest, 0, r.digest.length) : t.bytes === Array ? Array.prototype.slice.call(r.digest) : r.digest), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? p.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.DigestWithTimestamp";
    }, c;
  })(), g.Video = (function() {
    function c(t) {
      if (t)
        for (let e = Object.keys(t), n = 0; n < e.length; ++n)
          t[e[n]] != null && (this[e[n]] = t[e[n]]);
    }
    c.prototype.bytes = null, c.prototype.containerMp4 = null, c.prototype.streamH264 = null;
    let r;
    return Object.defineProperty(c.prototype, "_bytes", {
      get: p.oneOfGetter(r = ["bytes"]),
      set: p.oneOfSetter(r)
    }), Object.defineProperty(c.prototype, "content", {
      get: p.oneOfGetter(r = ["containerMp4", "streamH264"]),
      set: p.oneOfSetter(r)
    }), c.create = function(t) {
      return new c(t);
    }, c.encode = function(t, e) {
      return e || (e = F.create()), t.bytes != null && Object.hasOwnProperty.call(t, "bytes") && e.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(t.bytes), t.containerMp4 != null && Object.hasOwnProperty.call(t, "containerMp4") && s.dot.VideoContainer.encode(t.containerMp4, e.uint32(
        /* id 2, wireType 2 =*/
        18
      ).fork()).ldelim(), t.streamH264 != null && Object.hasOwnProperty.call(t, "streamH264") && s.dot.VideoStream.encode(t.streamH264, e.uint32(
        /* id 3, wireType 2 =*/
        26
      ).fork()).ldelim(), e;
    }, c.encodeDelimited = function(t, e) {
      return this.encode(t, e).ldelim();
    }, c.decode = function(t, e, n) {
      t instanceof b || (t = b.create(t));
      let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.Video();
      for (; t.pos < o; ) {
        let u = t.uint32();
        if (u === n)
          break;
        switch (u >>> 3) {
          case 1: {
            d.bytes = t.bytes();
            break;
          }
          case 2: {
            d.containerMp4 = s.dot.VideoContainer.decode(t, t.uint32());
            break;
          }
          case 3: {
            d.streamH264 = s.dot.VideoStream.decode(t, t.uint32());
            break;
          }
          default:
            t.skipType(u & 7);
            break;
        }
      }
      return d;
    }, c.decodeDelimited = function(t) {
      return t instanceof b || (t = new b(t)), this.decode(t, t.uint32());
    }, c.verify = function(t) {
      if (typeof t != "object" || t === null)
        return "object expected";
      let e = {};
      if (t.bytes != null && t.hasOwnProperty("bytes") && (e._bytes = 1, !(t.bytes && typeof t.bytes.length == "number" || p.isString(t.bytes))))
        return "bytes: buffer expected";
      if (t.containerMp4 != null && t.hasOwnProperty("containerMp4")) {
        e.content = 1;
        {
          let n = s.dot.VideoContainer.verify(t.containerMp4);
          if (n)
            return "containerMp4." + n;
        }
      }
      if (t.streamH264 != null && t.hasOwnProperty("streamH264")) {
        if (e.content === 1)
          return "content: multiple values";
        e.content = 1;
        {
          let n = s.dot.VideoStream.verify(t.streamH264);
          if (n)
            return "streamH264." + n;
        }
      }
      return null;
    }, c.fromObject = function(t) {
      if (t instanceof s.dot.Video)
        return t;
      let e = new s.dot.Video();
      if (t.bytes != null && (typeof t.bytes == "string" ? p.base64.decode(t.bytes, e.bytes = p.newBuffer(p.base64.length(t.bytes)), 0) : t.bytes.length >= 0 && (e.bytes = t.bytes)), t.containerMp4 != null) {
        if (typeof t.containerMp4 != "object")
          throw TypeError(".dot.Video.containerMp4: object expected");
        e.containerMp4 = s.dot.VideoContainer.fromObject(t.containerMp4);
      }
      if (t.streamH264 != null) {
        if (typeof t.streamH264 != "object")
          throw TypeError(".dot.Video.streamH264: object expected");
        e.streamH264 = s.dot.VideoStream.fromObject(t.streamH264);
      }
      return e;
    }, c.toObject = function(t, e) {
      e || (e = {});
      let n = {};
      return t.bytes != null && t.hasOwnProperty("bytes") && (n.bytes = e.bytes === String ? p.base64.encode(t.bytes, 0, t.bytes.length) : e.bytes === Array ? Array.prototype.slice.call(t.bytes) : t.bytes, e.oneofs && (n._bytes = "bytes")), t.containerMp4 != null && t.hasOwnProperty("containerMp4") && (n.containerMp4 = s.dot.VideoContainer.toObject(t.containerMp4, e), e.oneofs && (n.content = "containerMp4")), t.streamH264 != null && t.hasOwnProperty("streamH264") && (n.streamH264 = s.dot.VideoStream.toObject(t.streamH264, e), e.oneofs && (n.content = "streamH264")), n;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(t) {
      return t === void 0 && (t = "type.googleapis.com"), t + "/dot.Video";
    }, c;
  })(), g.VideoContainer = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.bytes = p.newBuffer([]), c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.VideoContainer();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        d >>> 3 === 1 ? o.bytes = r.bytes() : r.skipType(d & 7);
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.VideoContainer)
        return r;
      let t = new s.dot.VideoContainer();
      return r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.VideoContainer";
    }, c;
  })(), g.VideoStream = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.bytes = p.newBuffer([]), c.prototype.frameRate = 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), r.frameRate != null && Object.hasOwnProperty.call(r, "frameRate") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(r.frameRate), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.VideoStream();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.bytes = r.bytes();
            break;
          }
          case 2: {
            o.frameRate = r.double();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : r.frameRate != null && r.hasOwnProperty("frameRate") && typeof r.frameRate != "number" ? "frameRate: number expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.VideoStream)
        return r;
      let t = new s.dot.VideoStream();
      return r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), r.frameRate != null && (t.frameRate = Number(r.frameRate)), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes))), e.frameRate = 0), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), r.frameRate != null && r.hasOwnProperty("frameRate") && (e.frameRate = t.json && !isFinite(r.frameRate) ? String(r.frameRate) : r.frameRate), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.VideoStream";
    }, c;
  })(), g.PointInt = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.x = 0, c.prototype.y = 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.x != null && Object.hasOwnProperty.call(r, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.x), r.y != null && Object.hasOwnProperty.call(r, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.y), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.PointInt();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.x = r.int32();
            break;
          }
          case 2: {
            o.y = r.int32();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.x != null && r.hasOwnProperty("x") && !p.isInteger(r.x) ? "x: integer expected" : r.y != null && r.hasOwnProperty("y") && !p.isInteger(r.y) ? "y: integer expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.PointInt)
        return r;
      let t = new s.dot.PointInt();
      return r.x != null && (t.x = r.x | 0), r.y != null && (t.y = r.y | 0), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), r.x != null && r.hasOwnProperty("x") && (e.x = r.x), r.y != null && r.hasOwnProperty("y") && (e.y = r.y), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.PointInt";
    }, c;
  })(), g.PointDouble = (function() {
    function c(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return c.prototype.x = 0, c.prototype.y = 0, c.create = function(r) {
      return new c(r);
    }, c.encode = function(r, t) {
      return t || (t = F.create()), r.x != null && Object.hasOwnProperty.call(r, "x") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(r.x), r.y != null && Object.hasOwnProperty.call(r, "y") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(r.y), t;
    }, c.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, c.decode = function(r, t, e) {
      r instanceof b || (r = b.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.PointDouble();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.x = r.double();
            break;
          }
          case 2: {
            o.y = r.double();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, c.decodeDelimited = function(r) {
      return r instanceof b || (r = new b(r)), this.decode(r, r.uint32());
    }, c.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.x != null && r.hasOwnProperty("x") && typeof r.x != "number" ? "x: number expected" : r.y != null && r.hasOwnProperty("y") && typeof r.y != "number" ? "y: number expected" : null;
    }, c.fromObject = function(r) {
      if (r instanceof s.dot.PointDouble)
        return r;
      let t = new s.dot.PointDouble();
      return r.x != null && (t.x = Number(r.x)), r.y != null && (t.y = Number(r.y)), t;
    }, c.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), r.x != null && r.hasOwnProperty("x") && (e.x = t.json && !isFinite(r.x) ? String(r.x) : r.x), r.y != null && r.hasOwnProperty("y") && (e.y = t.json && !isFinite(r.y) ? String(r.y) : r.y), e;
    }, c.prototype.toJSON = function() {
      return this.constructor.toObject(this, R.util.toJSONOptions);
    }, c.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.PointDouble";
    }, c;
  })(), g;
})();
var ri = (() => {
  var g = import.meta.url;
  return (async function(c = {}) {
    var r, t = c, e, n, o = new Promise((a, i) => {
      e = a, n = i;
    }), d = typeof window == "object", u = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var w = Object.assign({}, t), A = (a, i) => {
      throw i;
    }, v = "";
    function I(a) {
      return t.locateFile ? t.locateFile(a, v) : v + a;
    }
    var S, k;
    (d || u) && (u ? v = self.location.href : typeof document < "u" && document.currentScript && (v = document.currentScript.src), g && (v = g), v.startsWith("blob:") ? v = "" : v = v.slice(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1), u && (k = (a) => {
      var i = new XMLHttpRequest();
      return i.open("GET", a, !1), i.responseType = "arraybuffer", i.send(null), new Uint8Array(i.response);
    }), S = async (a) => {
      if (Ze(a))
        return new Promise((l, f) => {
          var m = new XMLHttpRequest();
          m.open("GET", a, !0), m.responseType = "arraybuffer", m.onload = () => {
            if (m.status == 200 || m.status == 0 && m.response) {
              l(m.response);
              return;
            }
            f(m.status);
          }, m.onerror = f, m.send(null);
        });
      var i = await fetch(a, { credentials: "same-origin" });
      if (i.ok)
        return i.arrayBuffer();
      throw new Error(i.status + " : " + i.url);
    }), t.print || console.log.bind(console);
    var L = t.printErr || console.error.bind(console);
    Object.assign(t, w), w = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var j = t.wasmBinary, M, N = !1, se, X, z, le, pe, Q, $, He, Be, Ye, Je, Ze = (a) => a.startsWith("file://");
    function Ke() {
      var a = M.buffer;
      t.HEAP8 = X = new Int8Array(a), t.HEAP16 = le = new Int16Array(a), t.HEAPU8 = z = new Uint8Array(a), t.HEAPU16 = pe = new Uint16Array(a), t.HEAP32 = Q = new Int32Array(a), t.HEAPU32 = $ = new Uint32Array(a), t.HEAPF32 = He = new Float32Array(a), t.HEAPF64 = Je = new Float64Array(a), t.HEAP64 = Be = new BigInt64Array(a), t.HEAPU64 = Ye = new BigUint64Array(a);
    }
    function Et() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Ht(t.preRun.shift());
      Xe(et);
    }
    function Mt() {
      _.C();
    }
    function Rt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Gt(t.postRun.shift());
      Xe(Qe);
    }
    var ie = 0, me = null;
    function Ft(a) {
      ie++, t.monitorRunDependencies?.(ie);
    }
    function Lt(a) {
      if (ie--, t.monitorRunDependencies?.(ie), ie == 0 && me) {
        var i = me;
        me = null, i();
      }
    }
    function be(a) {
      t.onAbort?.(a), a = "Aborted(" + a + ")", L(a), N = !0, a += ". Build with -sASSERTIONS for more info.";
      var i = new WebAssembly.RuntimeError(a);
      throw n(i), i;
    }
    var De;
    function xt() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Nt(a) {
      if (a == De && j)
        return new Uint8Array(j);
      if (k)
        return k(a);
      throw "both async and sync fetching of the wasm failed";
    }
    async function $t(a) {
      if (!j)
        try {
          var i = await S(a);
          return new Uint8Array(i);
        } catch {
        }
      return Nt(a);
    }
    async function Wt(a, i) {
      try {
        var l = await $t(a), f = await WebAssembly.instantiate(l, i);
        return f;
      } catch (m) {
        L(`failed to asynchronously prepare wasm: ${m}`), be(m);
      }
    }
    async function Vt(a, i, l) {
      if (!a && typeof WebAssembly.instantiateStreaming == "function" && !Ze(i))
        try {
          var f = fetch(i, { credentials: "same-origin" }), m = await WebAssembly.instantiateStreaming(f, l);
          return m;
        } catch (h) {
          L(`wasm streaming compile failed: ${h}`), L("falling back to ArrayBuffer instantiation");
        }
      return Wt(i, l);
    }
    function Ut() {
      return { a: yn };
    }
    async function zt() {
      function a(h, O) {
        return _ = h.exports, _ = C.instrumentWasmExports(_), M = _.B, Ke(), _.H, Lt(), _;
      }
      Ft();
      function i(h) {
        return a(h.instance);
      }
      var l = Ut();
      if (t.instantiateWasm)
        return new Promise((h, O) => {
          t.instantiateWasm(l, (y, P) => {
            a(y), h(y.exports);
          });
        });
      De ??= xt();
      try {
        var f = await Vt(j, De, l), m = i(f);
        return m;
      } catch (h) {
        return n(h), Promise.reject(h);
      }
    }
    class qe {
      name = "ExitStatus";
      constructor(i) {
        this.message = `Program terminated with exit(${i})`, this.status = i;
      }
    }
    var Xe = (a) => {
      for (; a.length > 0; )
        a.shift()(t);
    }, Qe = [], Gt = (a) => Qe.unshift(a), et = [], Ht = (a) => et.unshift(a), tt = t.noExitRuntime || !0;
    class Bt {
      constructor(i) {
        this.excPtr = i, this.ptr = i - 24;
      }
      set_type(i) {
        $[this.ptr + 4 >> 2] = i;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(i) {
        $[this.ptr + 8 >> 2] = i;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(i) {
        i = i ? 1 : 0, X[this.ptr + 12] = i;
      }
      get_caught() {
        return X[this.ptr + 12] != 0;
      }
      set_rethrown(i) {
        i = i ? 1 : 0, X[this.ptr + 13] = i;
      }
      get_rethrown() {
        return X[this.ptr + 13] != 0;
      }
      init(i, l) {
        this.set_adjusted_ptr(0), this.set_type(i), this.set_destructor(l);
      }
      set_adjusted_ptr(i) {
        $[this.ptr + 16 >> 2] = i;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var rt = 0, Yt = (a, i, l) => {
      var f = new Bt(a);
      throw f.init(i, l), rt = a, rt;
    }, Jt = () => be(""), ve = (a) => {
      if (a === null)
        return "null";
      var i = typeof a;
      return i === "object" || i === "array" || i === "function" ? a.toString() : "" + a;
    }, Zt = () => {
      for (var a = new Array(256), i = 0; i < 256; ++i)
        a[i] = String.fromCharCode(i);
      nt = a;
    }, nt, W = (a) => {
      for (var i = "", l = a; z[l]; )
        i += nt[z[l++]];
      return i;
    }, ce = {}, ae = {}, Oe = {}, ue, E = (a) => {
      throw new ue(a);
    }, ot, we = (a) => {
      throw new ot(a);
    }, de = (a, i, l) => {
      a.forEach((y) => Oe[y] = i);
      function f(y) {
        var P = l(y);
        P.length !== a.length && we("Mismatched type converter count");
        for (var D = 0; D < a.length; ++D)
          H(a[D], P[D]);
      }
      var m = new Array(i.length), h = [], O = 0;
      i.forEach((y, P) => {
        ae.hasOwnProperty(y) ? m[P] = ae[y] : (h.push(y), ce.hasOwnProperty(y) || (ce[y] = []), ce[y].push(() => {
          m[P] = ae[y], ++O, O === h.length && f(m);
        }));
      }), h.length === 0 && f(m);
    };
    function Kt(a, i, l = {}) {
      var f = i.name;
      if (a || E(`type "${f}" must have a positive integer typeid pointer`), ae.hasOwnProperty(a)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        E(`Cannot register type '${f}' twice`);
      }
      if (ae[a] = i, delete Oe[a], ce.hasOwnProperty(a)) {
        var m = ce[a];
        delete ce[a], m.forEach((h) => h());
      }
    }
    function H(a, i, l = {}) {
      return Kt(a, i, l);
    }
    var it = (a, i, l) => {
      switch (i) {
        case 1:
          return l ? (f) => X[f] : (f) => z[f];
        case 2:
          return l ? (f) => le[f >> 1] : (f) => pe[f >> 1];
        case 4:
          return l ? (f) => Q[f >> 2] : (f) => $[f >> 2];
        case 8:
          return l ? (f) => Be[f >> 3] : (f) => Ye[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${i}): ${a}`);
      }
    }, qt = (a, i, l, f, m) => {
      i = W(i);
      var h = i.indexOf("u") != -1;
      H(a, { name: i, fromWireType: (O) => O, toWireType: function(O, y) {
        if (typeof y != "bigint" && typeof y != "number")
          throw new TypeError(`Cannot convert "${ve(y)}" to ${this.name}`);
        return typeof y == "number" && (y = BigInt(y)), y;
      }, argPackAdvance: Y, readValueFromPointer: it(i, l, !h), destructorFunction: null });
    }, Y = 8, Xt = (a, i, l, f) => {
      i = W(i), H(a, { name: i, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, h) {
        return h ? l : f;
      }, argPackAdvance: Y, readValueFromPointer: function(m) {
        return this.fromWireType(z[m]);
      }, destructorFunction: null });
    }, Qt = (a) => ({ count: a.count, deleteScheduled: a.deleteScheduled, preservePointerOnDelete: a.preservePointerOnDelete, ptr: a.ptr, ptrType: a.ptrType, smartPtr: a.smartPtr, smartPtrType: a.smartPtrType }), _e = (a) => {
      function i(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      E(i(a) + " instance already deleted");
    }, Ee = !1, at = (a) => {
    }, er = (a) => {
      a.smartPtr ? a.smartPtrType.rawDestructor(a.smartPtr) : a.ptrType.registeredClass.rawDestructor(a.ptr);
    }, st = (a) => {
      a.count.value -= 1;
      var i = a.count.value === 0;
      i && er(a);
    }, lt = (a, i, l) => {
      if (i === l)
        return a;
      if (l.baseClass === void 0)
        return null;
      var f = lt(a, i, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, ct = {}, tr = {}, rr = (a, i) => {
      for (i === void 0 && E("ptr should not be undefined"); a.baseClass; )
        i = a.upcast(i), a = a.baseClass;
      return i;
    }, nr = (a, i) => (i = rr(a, i), tr[i]), Pe = (a, i) => {
      (!i.ptrType || !i.ptr) && we("makeClassHandle requires ptr and ptrType");
      var l = !!i.smartPtrType, f = !!i.smartPtr;
      return l !== f && we("Both smartPtrType and smartPtr must be specified"), i.count = { value: 1 }, ye(Object.create(a, { $$: { value: i, writable: !0 } }));
    };
    function or(a) {
      var i = this.getPointee(a);
      if (!i)
        return this.destructor(a), null;
      var l = nr(this.registeredClass, i);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = i, l.$$.smartPtr = a, l.clone();
        var f = l.clone();
        return this.destructor(a), f;
      }
      function m() {
        return this.isSmartPointer ? Pe(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: i, smartPtrType: this, smartPtr: a }) : Pe(this.registeredClass.instancePrototype, { ptrType: this, ptr: a });
      }
      var h = this.registeredClass.getActualType(i), O = ct[h];
      if (!O)
        return m.call(this);
      var y;
      this.isConst ? y = O.constPointerType : y = O.pointerType;
      var P = lt(i, this.registeredClass, y.registeredClass);
      return P === null ? m.call(this) : this.isSmartPointer ? Pe(y.registeredClass.instancePrototype, { ptrType: y, ptr: P, smartPtrType: this, smartPtr: a }) : Pe(y.registeredClass.instancePrototype, { ptrType: y, ptr: P });
    }
    var ye = (a) => typeof FinalizationRegistry > "u" ? (ye = (i) => i, a) : (Ee = new FinalizationRegistry((i) => {
      st(i.$$);
    }), ye = (i) => {
      var l = i.$$, f = !!l.smartPtr;
      if (f) {
        var m = { $$: l };
        Ee.register(i, m, i);
      }
      return i;
    }, at = (i) => Ee.unregister(i), ye(a)), ir = () => {
      Object.assign(Ie.prototype, { isAliasOf(a) {
        if (!(this instanceof Ie) || !(a instanceof Ie))
          return !1;
        var i = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        a.$$ = a.$$;
        for (var f = a.$$.ptrType.registeredClass, m = a.$$.ptr; i.baseClass; )
          l = i.upcast(l), i = i.baseClass;
        for (; f.baseClass; )
          m = f.upcast(m), f = f.baseClass;
        return i === f && l === m;
      }, clone() {
        if (this.$$.ptr || _e(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var a = ye(Object.create(Object.getPrototypeOf(this), { $$: { value: Qt(this.$$) } }));
        return a.$$.count.value += 1, a.$$.deleteScheduled = !1, a;
      }, delete() {
        this.$$.ptr || _e(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), at(this), st(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || _e(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ie() {
    }
    var je = (a, i) => Object.defineProperty(i, "name", { value: a }), ar = (a, i, l) => {
      if (a[i].overloadTable === void 0) {
        var f = a[i];
        a[i] = function(...m) {
          return a[i].overloadTable.hasOwnProperty(m.length) || E(`Function '${l}' called with an invalid number of arguments (${m.length}) - expects one of (${a[i].overloadTable})!`), a[i].overloadTable[m.length].apply(this, m);
        }, a[i].overloadTable = [], a[i].overloadTable[f.argCount] = f;
      }
    }, Me = (a, i, l) => {
      t.hasOwnProperty(a) ? ((l === void 0 || t[a].overloadTable !== void 0 && t[a].overloadTable[l] !== void 0) && E(`Cannot register public name '${a}' twice`), ar(t, a, a), t[a].overloadTable.hasOwnProperty(l) && E(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[a].overloadTable[l] = i) : (t[a] = i, t[a].argCount = l);
    }, sr = 48, lr = 57, cr = (a) => {
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var i = a.charCodeAt(0);
      return i >= sr && i <= lr ? `_${a}` : a;
    };
    function ur(a, i, l, f, m, h, O, y) {
      this.name = a, this.constructor = i, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = m, this.getActualType = h, this.upcast = O, this.downcast = y, this.pureVirtualFunctions = [];
    }
    var Ce = (a, i, l) => {
      for (; i !== l; )
        i.upcast || E(`Expected null or instance of ${l.name}, got an instance of ${i.name}`), a = i.upcast(a), i = i.baseClass;
      return a;
    };
    function dr(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${ve(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Ce(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function fr(a, i) {
      var l;
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), a !== null && a.push(this.rawDestructor, l), l) : 0;
      (!i || !i.$$) && E(`Cannot pass "${ve(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.smartPtrType ? i.$$.smartPtrType.name : i.$$.ptrType.name} to parameter type ${this.name}`);
      var f = i.$$.ptrType.registeredClass;
      if (l = Ce(i.$$.ptr, f, this.registeredClass), this.isSmartPointer)
        switch (i.$$.smartPtr === void 0 && E("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            i.$$.smartPtrType === this ? l = i.$$.smartPtr : E(`Cannot convert argument of type ${i.$$.smartPtrType ? i.$$.smartPtrType.name : i.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            l = i.$$.smartPtr;
            break;
          case 2:
            if (i.$$.smartPtrType === this)
              l = i.$$.smartPtr;
            else {
              var m = i.clone();
              l = this.rawShare(l, B.toHandle(() => m.delete())), a !== null && a.push(this.rawDestructor, l);
            }
            break;
          default:
            E("Unsupporting sharing policy");
        }
      return l;
    }
    function pr(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${ve(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.ptrType.name} to parameter type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Ce(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Se(a) {
      return this.fromWireType($[a >> 2]);
    }
    var mr = () => {
      Object.assign(Te.prototype, { getPointee(a) {
        return this.rawGetPointee && (a = this.rawGetPointee(a)), a;
      }, destructor(a) {
        this.rawDestructor?.(a);
      }, argPackAdvance: Y, readValueFromPointer: Se, fromWireType: or });
    };
    function Te(a, i, l, f, m, h, O, y, P, D, T) {
      this.name = a, this.registeredClass = i, this.isReference = l, this.isConst = f, this.isSmartPointer = m, this.pointeeType = h, this.sharingPolicy = O, this.rawGetPointee = y, this.rawConstructor = P, this.rawShare = D, this.rawDestructor = T, !m && i.baseClass === void 0 ? f ? (this.toWireType = dr, this.destructorFunction = null) : (this.toWireType = pr, this.destructorFunction = null) : this.toWireType = fr;
    }
    var ut = (a, i, l) => {
      t.hasOwnProperty(a) || we("Replacing nonexistent public symbol"), t[a].overloadTable !== void 0 && l !== void 0 ? t[a].overloadTable[l] = i : (t[a] = i, t[a].argCount = l);
    }, yr = (a, i, l) => {
      a = a.replace(/p/g, "i");
      var f = t["dynCall_" + a];
      return f(i, ...l);
    }, gr = (a, i, l = []) => {
      var f = yr(a, i, l);
      return f;
    }, hr = (a, i) => (...l) => gr(a, i, l), ee = (a, i) => {
      a = W(a);
      function l() {
        return hr(a, i);
      }
      var f = l();
      return typeof f != "function" && E(`unknown function pointer with signature ${a}: ${i}`), f;
    }, br = (a, i) => {
      var l = je(i, function(f) {
        this.name = i, this.message = f;
        var m = new Error(f).stack;
        m !== void 0 && (this.stack = this.toString() + `
` + m.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(a.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, dt, ft = (a) => {
      var i = gn(a), l = W(i);
      return q(i), l;
    }, ge = (a, i) => {
      var l = [], f = {};
      function m(h) {
        if (!f[h] && !ae[h]) {
          if (Oe[h]) {
            Oe[h].forEach(m);
            return;
          }
          l.push(h), f[h] = !0;
        }
      }
      throw i.forEach(m), new dt(`${a}: ` + l.map(ft).join([", "]));
    }, vr = (a, i, l, f, m, h, O, y, P, D, T, x, V) => {
      T = W(T), h = ee(m, h), y &&= ee(O, y), D &&= ee(P, D), V = ee(x, V);
      var J = cr(T);
      Me(J, function() {
        ge(`Cannot construct ${T} due to unbound types`, [f]);
      }), de([a, i, l], f ? [f] : [], (Z) => {
        Z = Z[0];
        var re, G;
        f ? (re = Z.registeredClass, G = re.instancePrototype) : G = Ie.prototype;
        var K = je(T, function(...We) {
          if (Object.getPrototypeOf(this) !== ne)
            throw new ue("Use 'new' to construct " + T);
          if (U.constructor_body === void 0)
            throw new ue(T + " has no accessible constructor");
          var jt = U.constructor_body[We.length];
          if (jt === void 0)
            throw new ue(`Tried to invoke ctor of ${T} with invalid number of parameters (${We.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return jt.apply(this, We);
        }), ne = Object.create(G, { constructor: { value: K } });
        K.prototype = ne;
        var U = new ur(T, K, ne, V, re, h, y, D);
        U.baseClass && (U.baseClass.__derivedClasses ??= [], U.baseClass.__derivedClasses.push(U));
        var oe = new Te(T, U, !0, !1, !1), Ae = new Te(T + "*", U, !1, !1, !1), It = new Te(T + " const*", U, !1, !0, !1);
        return ct[a] = { pointerType: Ae, constPointerType: It }, ut(J, K), [oe, Ae, It];
      });
    }, pt = (a, i) => {
      for (var l = [], f = 0; f < a; f++)
        l.push($[i + f * 4 >> 2]);
      return l;
    }, Re = (a) => {
      for (; a.length; ) {
        var i = a.pop(), l = a.pop();
        l(i);
      }
    };
    function Or(a) {
      for (var i = 1; i < a.length; ++i)
        if (a[i] !== null && a[i].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var ke = (a) => {
      try {
        return a();
      } catch (i) {
        be(i);
      }
    }, mt = (a) => {
      if (a instanceof qe || a == "unwind")
        return se;
      A(1, a);
    }, yt = 0, gt = () => tt || yt > 0, ht = (a) => {
      se = a, gt() || (t.onExit?.(a), N = !0), A(a, new qe(a));
    }, wr = (a, i) => {
      se = a, ht(a);
    }, Pr = wr, Ir = () => {
      if (!gt())
        try {
          Pr(se);
        } catch (a) {
          mt(a);
        }
    }, bt = (a) => {
      if (!N)
        try {
          a(), Ir();
        } catch (i) {
          mt(i);
        }
    }, C = { instrumentWasmImports(a) {
      var i = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(a))
        typeof f == "function" && (f.isAsync || i.test(l));
    }, instrumentWasmExports(a) {
      var i = {};
      for (let [l, f] of Object.entries(a))
        typeof f == "function" ? i[l] = (...m) => {
          C.exportCallStack.push(l);
          try {
            return f(...m);
          } finally {
            N || (C.exportCallStack.pop(), C.maybeStopUnwind());
          }
        } : i[l] = f;
      return i;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(a) {
      var i = C.callStackNameToId[a];
      return i === void 0 && (i = C.callStackId++, C.callStackNameToId[a] = i, C.callStackIdToName[i] = a), i;
    }, maybeStopUnwind() {
      C.currData && C.state === C.State.Unwinding && C.exportCallStack.length === 0 && (C.state = C.State.Normal, ke(vn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((a, i) => {
        C.asyncPromiseHandlers = { resolve: a, reject: i };
      });
    }, allocateData() {
      var a = Ne(12 + C.StackSize);
      return C.setDataHeader(a, a + 12, C.StackSize), C.setDataRewindFunc(a), a;
    }, setDataHeader(a, i, l) {
      $[a >> 2] = i, $[a + 4 >> 2] = i + l;
    }, setDataRewindFunc(a) {
      var i = C.exportCallStack[0], l = C.getCallStackId(i);
      Q[a + 8 >> 2] = l;
    }, getDataRewindFuncName(a) {
      var i = Q[a + 8 >> 2], l = C.callStackIdToName[i];
      return l;
    }, getDataRewindFunc(a) {
      var i = _[a];
      return i;
    }, doRewind(a) {
      var i = C.getDataRewindFuncName(a), l = C.getDataRewindFunc(i);
      return l();
    }, handleSleep(a) {
      if (!N) {
        if (C.state === C.State.Normal) {
          var i = !1, l = !1;
          a((f = 0) => {
            if (!N && (C.handleSleepReturnValue = f, i = !0, !!l)) {
              C.state = C.State.Rewinding, ke(() => On(C.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var m, h = !1;
              try {
                m = C.doRewind(C.currData);
              } catch (P) {
                m = P, h = !0;
              }
              var O = !1;
              if (!C.currData) {
                var y = C.asyncPromiseHandlers;
                y && (C.asyncPromiseHandlers = null, (h ? y.reject : y.resolve)(m), O = !0);
              }
              if (h && !O)
                throw m;
            }
          }), l = !0, i || (C.state = C.State.Unwinding, C.currData = C.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), ke(() => bn(C.currData)));
        } else C.state === C.State.Rewinding ? (C.state = C.State.Normal, ke(wn), q(C.currData), C.currData = null, C.sleepCallbacks.forEach(bt)) : be(`invalid state: ${C.state}`);
        return C.handleSleepReturnValue;
      }
    }, handleAsync(a) {
      return C.handleSleep((i) => {
        a().then(i);
      });
    } };
    function vt(a, i, l, f, m, h) {
      var O = i.length;
      O < 2 && E("argTypes array size mismatch! Must at least get return value and 'this' types!"), i[1];
      var y = Or(i), P = i[0].name !== "void", D = O - 2, T = new Array(D), x = [], V = [], J = function(...Z) {
        V.length = 0;
        var re;
        x.length = 1, x[0] = m;
        for (var G = 0; G < D; ++G)
          T[G] = i[G + 2].toWireType(V, Z[G]), x.push(T[G]);
        var K = f(...x);
        function ne(U) {
          if (y)
            Re(V);
          else
            for (var oe = 2; oe < i.length; oe++) {
              var Ae = oe === 1 ? re : T[oe - 2];
              i[oe].destructorFunction !== null && i[oe].destructorFunction(Ae);
            }
          if (P)
            return i[0].fromWireType(U);
        }
        return C.currData ? C.whenDone().then(ne) : ne(K);
      };
      return je(a, J);
    }
    var jr = (a, i, l, f, m, h) => {
      var O = pt(i, l);
      m = ee(f, m), de([], [a], (y) => {
        y = y[0];
        var P = `constructor ${y.name}`;
        if (y.registeredClass.constructor_body === void 0 && (y.registeredClass.constructor_body = []), y.registeredClass.constructor_body[i - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${i - 1}) for class '${y.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return y.registeredClass.constructor_body[i - 1] = () => {
          ge(`Cannot construct ${y.name} due to unbound types`, O);
        }, de([], O, (D) => (D.splice(1, 0, null), y.registeredClass.constructor_body[i - 1] = vt(P, D, null, m, h), [])), [];
      });
    }, Ot = (a, i, l) => (a instanceof Object || E(`${l} with invalid "this": ${a}`), a instanceof i.registeredClass.constructor || E(`${l} incompatible with "this" of type ${a.constructor.name}`), a.$$.ptr || E(`cannot call emscripten binding method ${l} on deleted object`), Ce(a.$$.ptr, a.$$.ptrType.registeredClass, i.registeredClass)), Cr = (a, i, l, f, m, h, O, y, P, D) => {
      i = W(i), m = ee(f, m), de([], [a], (T) => {
        T = T[0];
        var x = `${T.name}.${i}`, V = { get() {
          ge(`Cannot access ${x} due to unbound types`, [l, O]);
        }, enumerable: !0, configurable: !0 };
        return P ? V.set = () => ge(`Cannot access ${x} due to unbound types`, [l, O]) : V.set = (J) => E(x + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, i, V), de([], P ? [l, O] : [l], (J) => {
          var Z = J[0], re = { get() {
            var K = Ot(this, T, x + " getter");
            return Z.fromWireType(m(h, K));
          }, enumerable: !0 };
          if (P) {
            P = ee(y, P);
            var G = J[1];
            re.set = function(K) {
              var ne = Ot(this, T, x + " setter"), U = [];
              P(D, ne, G.toWireType(U, K)), Re(U);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, i, re), [];
        }), [];
      });
    }, Fe = [], te = [], Le = (a) => {
      a > 9 && --te[a + 1] === 0 && (te[a] = void 0, Fe.push(a));
    }, Sr = () => te.length / 2 - 5 - Fe.length, Tr = () => {
      te.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Sr;
    }, B = { toValue: (a) => (a || E("Cannot use deleted val. handle = " + a), te[a]), toHandle: (a) => {
      switch (a) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const i = Fe.pop() || te.length;
          return te[i] = a, te[i + 1] = 1, i;
        }
      }
    } }, kr = { name: "emscripten::val", fromWireType: (a) => {
      var i = B.toValue(a);
      return Le(a), i;
    }, toWireType: (a, i) => B.toHandle(i), argPackAdvance: Y, readValueFromPointer: Se, destructorFunction: null }, Ar = (a) => H(a, kr), Dr = (a, i, l) => {
      switch (i) {
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
          throw new TypeError(`invalid integer width (${i}): ${a}`);
      }
    }, _r = (a, i, l, f) => {
      i = W(i);
      function m() {
      }
      m.values = {}, H(a, { name: i, constructor: m, fromWireType: function(h) {
        return this.constructor.values[h];
      }, toWireType: (h, O) => O.value, argPackAdvance: Y, readValueFromPointer: Dr(i, l, f), destructorFunction: null }), Me(i, m);
    }, xe = (a, i) => {
      var l = ae[a];
      return l === void 0 && E(`${i} has unknown type ${ft(a)}`), l;
    }, Er = (a, i, l) => {
      var f = xe(a, "enum");
      i = W(i);
      var m = f.constructor, h = Object.create(f.constructor.prototype, { value: { value: l }, constructor: { value: je(`${f.name}_${i}`, function() {
      }) } });
      m.values[l] = h, m[i] = h;
    }, Mr = (a, i) => {
      switch (i) {
        case 4:
          return function(l) {
            return this.fromWireType(He[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(Je[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${i}): ${a}`);
      }
    }, Rr = (a, i, l) => {
      i = W(i), H(a, { name: i, fromWireType: (f) => f, toWireType: (f, m) => m, argPackAdvance: Y, readValueFromPointer: Mr(i, l), destructorFunction: null });
    }, Fr = (a) => {
      a = a.trim();
      const i = a.indexOf("(");
      return i === -1 ? a : a.slice(0, i);
    }, Lr = (a, i, l, f, m, h, O, y) => {
      var P = pt(i, l);
      a = W(a), a = Fr(a), m = ee(f, m), Me(a, function() {
        ge(`Cannot call ${a} due to unbound types`, P);
      }, i - 1), de([], P, (D) => {
        var T = [D[0], null].concat(D.slice(1));
        return ut(a, vt(a, T, null, m, h), i - 1), [];
      });
    }, xr = (a, i, l, f, m) => {
      i = W(i);
      var h = (T) => T;
      if (f === 0) {
        var O = 32 - 8 * l;
        h = (T) => T << O >>> O;
      }
      var y = i.includes("unsigned"), P = (T, x) => {
      }, D;
      y ? D = function(T, x) {
        return P(x, this.name), x >>> 0;
      } : D = function(T, x) {
        return P(x, this.name), x;
      }, H(a, { name: i, fromWireType: h, toWireType: D, argPackAdvance: Y, readValueFromPointer: it(i, l, f !== 0), destructorFunction: null });
    }, Nr = (a, i, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], m = f[i];
      function h(O) {
        var y = $[O >> 2], P = $[O + 4 >> 2];
        return new m(X.buffer, P, y);
      }
      l = W(l), H(a, { name: l, fromWireType: h, argPackAdvance: Y, readValueFromPointer: h }, { ignoreDuplicateRegistrations: !0 });
    }, $r = (a, i, l, f) => {
      if (!(f > 0)) return 0;
      for (var m = l, h = l + f - 1, O = 0; O < a.length; ++O) {
        var y = a.charCodeAt(O);
        if (y >= 55296 && y <= 57343) {
          var P = a.charCodeAt(++O);
          y = 65536 + ((y & 1023) << 10) | P & 1023;
        }
        if (y <= 127) {
          if (l >= h) break;
          i[l++] = y;
        } else if (y <= 2047) {
          if (l + 1 >= h) break;
          i[l++] = 192 | y >> 6, i[l++] = 128 | y & 63;
        } else if (y <= 65535) {
          if (l + 2 >= h) break;
          i[l++] = 224 | y >> 12, i[l++] = 128 | y >> 6 & 63, i[l++] = 128 | y & 63;
        } else {
          if (l + 3 >= h) break;
          i[l++] = 240 | y >> 18, i[l++] = 128 | y >> 12 & 63, i[l++] = 128 | y >> 6 & 63, i[l++] = 128 | y & 63;
        }
      }
      return i[l] = 0, l - m;
    }, Wr = (a, i, l) => $r(a, z, i, l), Vr = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f <= 127 ? i++ : f <= 2047 ? i += 2 : f >= 55296 && f <= 57343 ? (i += 4, ++l) : i += 3;
      }
      return i;
    }, wt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Ur = (a, i = 0, l = NaN) => {
      for (var f = i + l, m = i; a[m] && !(m >= f); ) ++m;
      if (m - i > 16 && a.buffer && wt)
        return wt.decode(a.subarray(i, m));
      for (var h = ""; i < m; ) {
        var O = a[i++];
        if (!(O & 128)) {
          h += String.fromCharCode(O);
          continue;
        }
        var y = a[i++] & 63;
        if ((O & 224) == 192) {
          h += String.fromCharCode((O & 31) << 6 | y);
          continue;
        }
        var P = a[i++] & 63;
        if ((O & 240) == 224 ? O = (O & 15) << 12 | y << 6 | P : O = (O & 7) << 18 | y << 12 | P << 6 | a[i++] & 63, O < 65536)
          h += String.fromCharCode(O);
        else {
          var D = O - 65536;
          h += String.fromCharCode(55296 | D >> 10, 56320 | D & 1023);
        }
      }
      return h;
    }, zr = (a, i) => a ? Ur(z, a, i) : "", Gr = (a, i) => {
      i = W(i), H(a, { name: i, fromWireType(l) {
        for (var f = $[l >> 2], m = l + 4, h, O, y = m, O = 0; O <= f; ++O) {
          var P = m + O;
          if (O == f || z[P] == 0) {
            var D = P - y, T = zr(y, D);
            h === void 0 ? h = T : (h += "\0", h += T), y = P + 1;
          }
        }
        return q(l), h;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var m, h = typeof f == "string";
        h || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || E("Cannot pass non-string to std::string"), h ? m = Vr(f) : m = f.length;
        var O = Ne(4 + m + 1), y = O + 4;
        if ($[O >> 2] = m, h)
          Wr(f, y, m + 1);
        else if (h)
          for (var P = 0; P < m; ++P) {
            var D = f.charCodeAt(P);
            D > 255 && (q(O), E("String has UTF-16 code units that do not fit in 8 bits")), z[y + P] = D;
          }
        else
          for (var P = 0; P < m; ++P)
            z[y + P] = f[P];
        return l !== null && l.push(q, O), O;
      }, argPackAdvance: Y, readValueFromPointer: Se, destructorFunction(l) {
        q(l);
      } });
    }, Pt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Hr = (a, i) => {
      for (var l = a, f = l >> 1, m = f + i / 2; !(f >= m) && pe[f]; ) ++f;
      if (l = f << 1, l - a > 32 && Pt) return Pt.decode(z.subarray(a, l));
      for (var h = "", O = 0; !(O >= i / 2); ++O) {
        var y = le[a + O * 2 >> 1];
        if (y == 0) break;
        h += String.fromCharCode(y);
      }
      return h;
    }, Br = (a, i, l) => {
      if (l ??= 2147483647, l < 2) return 0;
      l -= 2;
      for (var f = i, m = l < a.length * 2 ? l / 2 : a.length, h = 0; h < m; ++h) {
        var O = a.charCodeAt(h);
        le[i >> 1] = O, i += 2;
      }
      return le[i >> 1] = 0, i - f;
    }, Yr = (a) => a.length * 2, Jr = (a, i) => {
      for (var l = 0, f = ""; !(l >= i / 4); ) {
        var m = Q[a + l * 4 >> 2];
        if (m == 0) break;
        if (++l, m >= 65536) {
          var h = m - 65536;
          f += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023);
        } else
          f += String.fromCharCode(m);
      }
      return f;
    }, Zr = (a, i, l) => {
      if (l ??= 2147483647, l < 4) return 0;
      for (var f = i, m = f + l - 4, h = 0; h < a.length; ++h) {
        var O = a.charCodeAt(h);
        if (O >= 55296 && O <= 57343) {
          var y = a.charCodeAt(++h);
          O = 65536 + ((O & 1023) << 10) | y & 1023;
        }
        if (Q[i >> 2] = O, i += 4, i + 4 > m) break;
      }
      return Q[i >> 2] = 0, i - f;
    }, Kr = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, i += 4;
      }
      return i;
    }, qr = (a, i, l) => {
      l = W(l);
      var f, m, h, O;
      i === 2 ? (f = Hr, m = Br, O = Yr, h = (y) => pe[y >> 1]) : i === 4 && (f = Jr, m = Zr, O = Kr, h = (y) => $[y >> 2]), H(a, { name: l, fromWireType: (y) => {
        for (var P = $[y >> 2], D, T = y + 4, x = 0; x <= P; ++x) {
          var V = y + 4 + x * i;
          if (x == P || h(V) == 0) {
            var J = V - T, Z = f(T, J);
            D === void 0 ? D = Z : (D += "\0", D += Z), T = V + i;
          }
        }
        return q(y), D;
      }, toWireType: (y, P) => {
        typeof P != "string" && E(`Cannot pass non-string to C++ string type ${l}`);
        var D = O(P), T = Ne(4 + D + i);
        return $[T >> 2] = D / i, m(P, T + 4, D + i), y !== null && y.push(q, T), T;
      }, argPackAdvance: Y, readValueFromPointer: Se, destructorFunction(y) {
        q(y);
      } });
    }, Xr = (a, i) => {
      i = W(i), H(a, { isVoid: !0, name: i, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, Qr = () => {
      tt = !1, yt = 0;
    }, en = (a, i, l) => {
      var f = [], m = a.toWireType(f, l);
      return f.length && ($[i >> 2] = B.toHandle(f)), m;
    }, tn = (a, i, l) => (a = B.toValue(a), i = xe(i, "emval::as"), en(i, l, a)), rn = (a, i) => (a = B.toValue(a), i = B.toValue(i), B.toHandle(a[i])), nn = {}, on = (a) => {
      var i = nn[a];
      return i === void 0 ? W(a) : i;
    }, an = (a) => B.toHandle(on(a)), sn = (a) => {
      var i = B.toValue(a);
      Re(i), Le(a);
    }, ln = (a, i) => {
      a = xe(a, "_emval_take_value");
      var l = a.readValueFromPointer(i);
      return B.toHandle(l);
    }, he = {}, cn = () => performance.now(), un = (a, i) => {
      if (he[a] && (clearTimeout(he[a].id), delete he[a]), !i) return 0;
      var l = setTimeout(() => {
        delete he[a], bt(() => hn(a, cn()));
      }, i);
      return he[a] = { id: l, timeout_ms: i }, 0;
    }, dn = () => 2147483648, fn = (a, i) => Math.ceil(a / i) * i, pn = (a) => {
      var i = M.buffer, l = (a - i.byteLength + 65535) / 65536 | 0;
      try {
        return M.grow(l), Ke(), 1;
      } catch {
      }
    }, mn = (a) => {
      var i = z.length;
      a >>>= 0;
      var l = dn();
      if (a > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var m = i * (1 + 0.2 / f);
        m = Math.min(m, a + 100663296);
        var h = Math.min(l, fn(Math.max(a, m), 65536)), O = pn(h);
        if (O)
          return !0;
      }
      return !1;
    };
    Zt(), ue = t.BindingError = class extends Error {
      constructor(i) {
        super(i), this.name = "BindingError";
      }
    }, ot = t.InternalError = class extends Error {
      constructor(i) {
        super(i), this.name = "InternalError";
      }
    }, ir(), mr(), dt = t.UnboundTypeError = br(Error, "UnboundTypeError"), Tr();
    var yn = { i: Yt, s: Jt, n: qt, w: Xt, f: vr, d: jr, a: Cr, u: Ar, l: _r, g: Er, m: Rr, b: Lr, e: xr, c: Nr, v: Gr, h: qr, x: Xr, q: Qr, j: tn, y: Le, k: rn, o: an, A: sn, z: ln, r: un, t: mn, p: ht }, _ = await zt();
    _.C;
    var gn = _.D, Ne = t._malloc = _.E, q = t._free = _.F, hn = _.G;
    t.dynCall_v = _.I, t.dynCall_ii = _.J, t.dynCall_vi = _.K, t.dynCall_i = _.L, t.dynCall_iii = _.M, t.dynCall_viii = _.N, t.dynCall_fii = _.O, t.dynCall_viif = _.P, t.dynCall_viiii = _.Q, t.dynCall_viiiiii = _.R, t.dynCall_iiiiii = _.S, t.dynCall_viiiii = _.T, t.dynCall_iiiiiii = _.U, t.dynCall_iiiiiiii = _.V, t.dynCall_viiiiiii = _.W, t.dynCall_viiiiiiiiidi = _.X, t.dynCall_viiiiiiiidi = _.Y, t.dynCall_viiiiiiiiii = _.Z, t.dynCall_viiiiiiiii = _._, t.dynCall_viiiiiiii = _.$, t.dynCall_iiiii = _.aa, t.dynCall_iiii = _.ba;
    var bn = _.ca, vn = _.da, On = _.ea, wn = _.fa;
    function $e() {
      if (ie > 0) {
        me = $e;
        return;
      }
      if (Et(), ie > 0) {
        me = $e;
        return;
      }
      function a() {
        t.calledRun = !0, !N && (Mt(), e(t), t.onRuntimeInitialized?.(), Rt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), a();
      }, 1)) : a();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return $e(), r = o, r;
  });
})();
function wo(g, c) {
  return Math.sqrt((g.x - c.x) ** 2 + (g.y - c.y) ** 2);
}
function ni(g, c) {
  return {
    x: (g.x + c.x) / 2,
    y: (g.y + c.y) / 2
  };
}
function oi(g, c) {
  if (g.confidence <= 0 || c.confidence <= 0)
    return { x: 0, y: 0 };
  const r = wo(g.center, c.center), t = ni(g.center, c.center);
  return {
    x: t.x,
    y: t.y + r / 4
    // calculation is taken from mobile team
  };
}
function ii(g, c, r) {
  if (g.confidence <= 0 || c.confidence <= 0)
    return 0;
  const t = wo(g.center, c.center), e = bo(r.width, r.height);
  return xn(t / e);
}
function Rn(g) {
  const { centerX: c, centerY: r, confidence: t, size: e, status: n } = g;
  return {
    center: {
      x: c,
      y: r
    },
    confidence: t / Ct,
    status: n / Ct,
    size: e
  };
}
function ai(g, c) {
  const { faceCenter: r, faceSize: t } = g, e = $o(t, c), n = {
    topLeft: {
      x: r.x - e,
      y: r.y - e
    },
    topRight: {
      x: r.x + e,
      y: r.y - e
    },
    bottomRight: {
      x: r.x + e,
      y: r.y + e
    },
    bottomLeft: {
      x: r.x - e,
      y: r.y + e
    }
  };
  return Wo(n);
}
class si extends No {
  getSamWasmFilePath(c, r) {
    return `${c}/face/wasm/${r}`;
  }
  fetchSamModule(c) {
    return ri(c);
  }
  parseRawData(c, r) {
    const { brightness: t, sharpness: e } = c.params, { bottomRightX: n, bottomRightY: o, leftEye: d, mouth: u, rightEye: w, topLeftX: A, topLeftY: v } = c, I = Rn(d), S = Rn(w), k = Rn(u);
    return {
      confidence: c.confidence / Ct,
      topLeft: {
        x: A,
        y: v
      },
      bottomRight: {
        x: n,
        y: o
      },
      faceCenter: oi(I, S),
      faceSize: ii(I, S, r),
      leftEye: I,
      rightEye: S,
      mouth: k,
      brightness: t / Ct,
      sharpness: e / Ct
    };
  }
  async detect(c, r, t) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(c, r), n = this.samWasmModule.detectFacePartsWithImageParameters(
      r.width,
      r.height,
      e.bgr0ImagePointer,
      0,
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
    return e.free(), this.parseRawData(n, t);
  }
  async getOptimalRegionForCompressionDetection(c, r, t) {
    const e = ai(t, r);
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(c, r, e);
  }
}
var li = (() => {
  var g = import.meta.url;
  return (async function(c = {}) {
    var r, t = c, e, n, o = new Promise((a, i) => {
      e = a, n = i;
    }), d = typeof window == "object", u = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var w = Object.assign({}, t), A = (a, i) => {
      throw i;
    }, v = "";
    function I(a) {
      return t.locateFile ? t.locateFile(a, v) : v + a;
    }
    var S, k;
    (d || u) && (u ? v = self.location.href : typeof document < "u" && document.currentScript && (v = document.currentScript.src), g && (v = g), v.startsWith("blob:") ? v = "" : v = v.slice(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1), u && (k = (a) => {
      var i = new XMLHttpRequest();
      return i.open("GET", a, !1), i.responseType = "arraybuffer", i.send(null), new Uint8Array(i.response);
    }), S = async (a) => {
      if (Ze(a))
        return new Promise((l, f) => {
          var m = new XMLHttpRequest();
          m.open("GET", a, !0), m.responseType = "arraybuffer", m.onload = () => {
            if (m.status == 200 || m.status == 0 && m.response) {
              l(m.response);
              return;
            }
            f(m.status);
          }, m.onerror = f, m.send(null);
        });
      var i = await fetch(a, { credentials: "same-origin" });
      if (i.ok)
        return i.arrayBuffer();
      throw new Error(i.status + " : " + i.url);
    }), t.print || console.log.bind(console);
    var L = t.printErr || console.error.bind(console);
    Object.assign(t, w), w = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var j = t.wasmBinary, M, N = !1, se, X, z, le, pe, Q, $, He, Be, Ye, Je, Ze = (a) => a.startsWith("file://");
    function Ke() {
      var a = M.buffer;
      t.HEAP8 = X = new Int8Array(a), t.HEAP16 = le = new Int16Array(a), t.HEAPU8 = z = new Uint8Array(a), t.HEAPU16 = pe = new Uint16Array(a), t.HEAP32 = Q = new Int32Array(a), t.HEAPU32 = $ = new Uint32Array(a), t.HEAPF32 = He = new Float32Array(a), t.HEAPF64 = Je = new Float64Array(a), t.HEAP64 = Be = new BigInt64Array(a), t.HEAPU64 = Ye = new BigUint64Array(a);
    }
    function Et() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Ht(t.preRun.shift());
      Xe(et);
    }
    function Mt() {
      _.C();
    }
    function Rt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Gt(t.postRun.shift());
      Xe(Qe);
    }
    var ie = 0, me = null;
    function Ft(a) {
      ie++, t.monitorRunDependencies?.(ie);
    }
    function Lt(a) {
      if (ie--, t.monitorRunDependencies?.(ie), ie == 0 && me) {
        var i = me;
        me = null, i();
      }
    }
    function be(a) {
      t.onAbort?.(a), a = "Aborted(" + a + ")", L(a), N = !0, a += ". Build with -sASSERTIONS for more info.";
      var i = new WebAssembly.RuntimeError(a);
      throw n(i), i;
    }
    var De;
    function xt() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Nt(a) {
      if (a == De && j)
        return new Uint8Array(j);
      if (k)
        return k(a);
      throw "both async and sync fetching of the wasm failed";
    }
    async function $t(a) {
      if (!j)
        try {
          var i = await S(a);
          return new Uint8Array(i);
        } catch {
        }
      return Nt(a);
    }
    async function Wt(a, i) {
      try {
        var l = await $t(a), f = await WebAssembly.instantiate(l, i);
        return f;
      } catch (m) {
        L(`failed to asynchronously prepare wasm: ${m}`), be(m);
      }
    }
    async function Vt(a, i, l) {
      if (!a && typeof WebAssembly.instantiateStreaming == "function" && !Ze(i))
        try {
          var f = fetch(i, { credentials: "same-origin" }), m = await WebAssembly.instantiateStreaming(f, l);
          return m;
        } catch (h) {
          L(`wasm streaming compile failed: ${h}`), L("falling back to ArrayBuffer instantiation");
        }
      return Wt(i, l);
    }
    function Ut() {
      return { a: yn };
    }
    async function zt() {
      function a(h, O) {
        return _ = h.exports, _ = C.instrumentWasmExports(_), M = _.B, Ke(), _.H, Lt(), _;
      }
      Ft();
      function i(h) {
        return a(h.instance);
      }
      var l = Ut();
      if (t.instantiateWasm)
        return new Promise((h, O) => {
          t.instantiateWasm(l, (y, P) => {
            a(y), h(y.exports);
          });
        });
      De ??= xt();
      try {
        var f = await Vt(j, De, l), m = i(f);
        return m;
      } catch (h) {
        return n(h), Promise.reject(h);
      }
    }
    class qe {
      name = "ExitStatus";
      constructor(i) {
        this.message = `Program terminated with exit(${i})`, this.status = i;
      }
    }
    var Xe = (a) => {
      for (; a.length > 0; )
        a.shift()(t);
    }, Qe = [], Gt = (a) => Qe.unshift(a), et = [], Ht = (a) => et.unshift(a), tt = t.noExitRuntime || !0;
    class Bt {
      constructor(i) {
        this.excPtr = i, this.ptr = i - 24;
      }
      set_type(i) {
        $[this.ptr + 4 >> 2] = i;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(i) {
        $[this.ptr + 8 >> 2] = i;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(i) {
        i = i ? 1 : 0, X[this.ptr + 12] = i;
      }
      get_caught() {
        return X[this.ptr + 12] != 0;
      }
      set_rethrown(i) {
        i = i ? 1 : 0, X[this.ptr + 13] = i;
      }
      get_rethrown() {
        return X[this.ptr + 13] != 0;
      }
      init(i, l) {
        this.set_adjusted_ptr(0), this.set_type(i), this.set_destructor(l);
      }
      set_adjusted_ptr(i) {
        $[this.ptr + 16 >> 2] = i;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var rt = 0, Yt = (a, i, l) => {
      var f = new Bt(a);
      throw f.init(i, l), rt = a, rt;
    }, Jt = () => be(""), ve = (a) => {
      if (a === null)
        return "null";
      var i = typeof a;
      return i === "object" || i === "array" || i === "function" ? a.toString() : "" + a;
    }, Zt = () => {
      for (var a = new Array(256), i = 0; i < 256; ++i)
        a[i] = String.fromCharCode(i);
      nt = a;
    }, nt, W = (a) => {
      for (var i = "", l = a; z[l]; )
        i += nt[z[l++]];
      return i;
    }, ce = {}, ae = {}, Oe = {}, ue, E = (a) => {
      throw new ue(a);
    }, ot, we = (a) => {
      throw new ot(a);
    }, de = (a, i, l) => {
      a.forEach((y) => Oe[y] = i);
      function f(y) {
        var P = l(y);
        P.length !== a.length && we("Mismatched type converter count");
        for (var D = 0; D < a.length; ++D)
          H(a[D], P[D]);
      }
      var m = new Array(i.length), h = [], O = 0;
      i.forEach((y, P) => {
        ae.hasOwnProperty(y) ? m[P] = ae[y] : (h.push(y), ce.hasOwnProperty(y) || (ce[y] = []), ce[y].push(() => {
          m[P] = ae[y], ++O, O === h.length && f(m);
        }));
      }), h.length === 0 && f(m);
    };
    function Kt(a, i, l = {}) {
      var f = i.name;
      if (a || E(`type "${f}" must have a positive integer typeid pointer`), ae.hasOwnProperty(a)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        E(`Cannot register type '${f}' twice`);
      }
      if (ae[a] = i, delete Oe[a], ce.hasOwnProperty(a)) {
        var m = ce[a];
        delete ce[a], m.forEach((h) => h());
      }
    }
    function H(a, i, l = {}) {
      return Kt(a, i, l);
    }
    var it = (a, i, l) => {
      switch (i) {
        case 1:
          return l ? (f) => X[f] : (f) => z[f];
        case 2:
          return l ? (f) => le[f >> 1] : (f) => pe[f >> 1];
        case 4:
          return l ? (f) => Q[f >> 2] : (f) => $[f >> 2];
        case 8:
          return l ? (f) => Be[f >> 3] : (f) => Ye[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${i}): ${a}`);
      }
    }, qt = (a, i, l, f, m) => {
      i = W(i);
      var h = i.indexOf("u") != -1;
      H(a, { name: i, fromWireType: (O) => O, toWireType: function(O, y) {
        if (typeof y != "bigint" && typeof y != "number")
          throw new TypeError(`Cannot convert "${ve(y)}" to ${this.name}`);
        return typeof y == "number" && (y = BigInt(y)), y;
      }, argPackAdvance: Y, readValueFromPointer: it(i, l, !h), destructorFunction: null });
    }, Y = 8, Xt = (a, i, l, f) => {
      i = W(i), H(a, { name: i, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, h) {
        return h ? l : f;
      }, argPackAdvance: Y, readValueFromPointer: function(m) {
        return this.fromWireType(z[m]);
      }, destructorFunction: null });
    }, Qt = (a) => ({ count: a.count, deleteScheduled: a.deleteScheduled, preservePointerOnDelete: a.preservePointerOnDelete, ptr: a.ptr, ptrType: a.ptrType, smartPtr: a.smartPtr, smartPtrType: a.smartPtrType }), _e = (a) => {
      function i(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      E(i(a) + " instance already deleted");
    }, Ee = !1, at = (a) => {
    }, er = (a) => {
      a.smartPtr ? a.smartPtrType.rawDestructor(a.smartPtr) : a.ptrType.registeredClass.rawDestructor(a.ptr);
    }, st = (a) => {
      a.count.value -= 1;
      var i = a.count.value === 0;
      i && er(a);
    }, lt = (a, i, l) => {
      if (i === l)
        return a;
      if (l.baseClass === void 0)
        return null;
      var f = lt(a, i, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, ct = {}, tr = {}, rr = (a, i) => {
      for (i === void 0 && E("ptr should not be undefined"); a.baseClass; )
        i = a.upcast(i), a = a.baseClass;
      return i;
    }, nr = (a, i) => (i = rr(a, i), tr[i]), Pe = (a, i) => {
      (!i.ptrType || !i.ptr) && we("makeClassHandle requires ptr and ptrType");
      var l = !!i.smartPtrType, f = !!i.smartPtr;
      return l !== f && we("Both smartPtrType and smartPtr must be specified"), i.count = { value: 1 }, ye(Object.create(a, { $$: { value: i, writable: !0 } }));
    };
    function or(a) {
      var i = this.getPointee(a);
      if (!i)
        return this.destructor(a), null;
      var l = nr(this.registeredClass, i);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = i, l.$$.smartPtr = a, l.clone();
        var f = l.clone();
        return this.destructor(a), f;
      }
      function m() {
        return this.isSmartPointer ? Pe(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: i, smartPtrType: this, smartPtr: a }) : Pe(this.registeredClass.instancePrototype, { ptrType: this, ptr: a });
      }
      var h = this.registeredClass.getActualType(i), O = ct[h];
      if (!O)
        return m.call(this);
      var y;
      this.isConst ? y = O.constPointerType : y = O.pointerType;
      var P = lt(i, this.registeredClass, y.registeredClass);
      return P === null ? m.call(this) : this.isSmartPointer ? Pe(y.registeredClass.instancePrototype, { ptrType: y, ptr: P, smartPtrType: this, smartPtr: a }) : Pe(y.registeredClass.instancePrototype, { ptrType: y, ptr: P });
    }
    var ye = (a) => typeof FinalizationRegistry > "u" ? (ye = (i) => i, a) : (Ee = new FinalizationRegistry((i) => {
      st(i.$$);
    }), ye = (i) => {
      var l = i.$$, f = !!l.smartPtr;
      if (f) {
        var m = { $$: l };
        Ee.register(i, m, i);
      }
      return i;
    }, at = (i) => Ee.unregister(i), ye(a)), ir = () => {
      Object.assign(Ie.prototype, { isAliasOf(a) {
        if (!(this instanceof Ie) || !(a instanceof Ie))
          return !1;
        var i = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        a.$$ = a.$$;
        for (var f = a.$$.ptrType.registeredClass, m = a.$$.ptr; i.baseClass; )
          l = i.upcast(l), i = i.baseClass;
        for (; f.baseClass; )
          m = f.upcast(m), f = f.baseClass;
        return i === f && l === m;
      }, clone() {
        if (this.$$.ptr || _e(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var a = ye(Object.create(Object.getPrototypeOf(this), { $$: { value: Qt(this.$$) } }));
        return a.$$.count.value += 1, a.$$.deleteScheduled = !1, a;
      }, delete() {
        this.$$.ptr || _e(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), at(this), st(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || _e(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ie() {
    }
    var je = (a, i) => Object.defineProperty(i, "name", { value: a }), ar = (a, i, l) => {
      if (a[i].overloadTable === void 0) {
        var f = a[i];
        a[i] = function(...m) {
          return a[i].overloadTable.hasOwnProperty(m.length) || E(`Function '${l}' called with an invalid number of arguments (${m.length}) - expects one of (${a[i].overloadTable})!`), a[i].overloadTable[m.length].apply(this, m);
        }, a[i].overloadTable = [], a[i].overloadTable[f.argCount] = f;
      }
    }, Me = (a, i, l) => {
      t.hasOwnProperty(a) ? ((l === void 0 || t[a].overloadTable !== void 0 && t[a].overloadTable[l] !== void 0) && E(`Cannot register public name '${a}' twice`), ar(t, a, a), t[a].overloadTable.hasOwnProperty(l) && E(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[a].overloadTable[l] = i) : (t[a] = i, t[a].argCount = l);
    }, sr = 48, lr = 57, cr = (a) => {
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var i = a.charCodeAt(0);
      return i >= sr && i <= lr ? `_${a}` : a;
    };
    function ur(a, i, l, f, m, h, O, y) {
      this.name = a, this.constructor = i, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = m, this.getActualType = h, this.upcast = O, this.downcast = y, this.pureVirtualFunctions = [];
    }
    var Ce = (a, i, l) => {
      for (; i !== l; )
        i.upcast || E(`Expected null or instance of ${l.name}, got an instance of ${i.name}`), a = i.upcast(a), i = i.baseClass;
      return a;
    };
    function dr(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${ve(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Ce(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function fr(a, i) {
      var l;
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), a !== null && a.push(this.rawDestructor, l), l) : 0;
      (!i || !i.$$) && E(`Cannot pass "${ve(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.smartPtrType ? i.$$.smartPtrType.name : i.$$.ptrType.name} to parameter type ${this.name}`);
      var f = i.$$.ptrType.registeredClass;
      if (l = Ce(i.$$.ptr, f, this.registeredClass), this.isSmartPointer)
        switch (i.$$.smartPtr === void 0 && E("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            i.$$.smartPtrType === this ? l = i.$$.smartPtr : E(`Cannot convert argument of type ${i.$$.smartPtrType ? i.$$.smartPtrType.name : i.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            l = i.$$.smartPtr;
            break;
          case 2:
            if (i.$$.smartPtrType === this)
              l = i.$$.smartPtr;
            else {
              var m = i.clone();
              l = this.rawShare(l, B.toHandle(() => m.delete())), a !== null && a.push(this.rawDestructor, l);
            }
            break;
          default:
            E("Unsupporting sharing policy");
        }
      return l;
    }
    function pr(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${ve(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.ptrType.name} to parameter type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Ce(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Se(a) {
      return this.fromWireType($[a >> 2]);
    }
    var mr = () => {
      Object.assign(Te.prototype, { getPointee(a) {
        return this.rawGetPointee && (a = this.rawGetPointee(a)), a;
      }, destructor(a) {
        this.rawDestructor?.(a);
      }, argPackAdvance: Y, readValueFromPointer: Se, fromWireType: or });
    };
    function Te(a, i, l, f, m, h, O, y, P, D, T) {
      this.name = a, this.registeredClass = i, this.isReference = l, this.isConst = f, this.isSmartPointer = m, this.pointeeType = h, this.sharingPolicy = O, this.rawGetPointee = y, this.rawConstructor = P, this.rawShare = D, this.rawDestructor = T, !m && i.baseClass === void 0 ? f ? (this.toWireType = dr, this.destructorFunction = null) : (this.toWireType = pr, this.destructorFunction = null) : this.toWireType = fr;
    }
    var ut = (a, i, l) => {
      t.hasOwnProperty(a) || we("Replacing nonexistent public symbol"), t[a].overloadTable !== void 0 && l !== void 0 ? t[a].overloadTable[l] = i : (t[a] = i, t[a].argCount = l);
    }, yr = (a, i, l) => {
      a = a.replace(/p/g, "i");
      var f = t["dynCall_" + a];
      return f(i, ...l);
    }, gr = (a, i, l = []) => {
      var f = yr(a, i, l);
      return f;
    }, hr = (a, i) => (...l) => gr(a, i, l), ee = (a, i) => {
      a = W(a);
      function l() {
        return hr(a, i);
      }
      var f = l();
      return typeof f != "function" && E(`unknown function pointer with signature ${a}: ${i}`), f;
    }, br = (a, i) => {
      var l = je(i, function(f) {
        this.name = i, this.message = f;
        var m = new Error(f).stack;
        m !== void 0 && (this.stack = this.toString() + `
` + m.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(a.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, dt, ft = (a) => {
      var i = gn(a), l = W(i);
      return q(i), l;
    }, ge = (a, i) => {
      var l = [], f = {};
      function m(h) {
        if (!f[h] && !ae[h]) {
          if (Oe[h]) {
            Oe[h].forEach(m);
            return;
          }
          l.push(h), f[h] = !0;
        }
      }
      throw i.forEach(m), new dt(`${a}: ` + l.map(ft).join([", "]));
    }, vr = (a, i, l, f, m, h, O, y, P, D, T, x, V) => {
      T = W(T), h = ee(m, h), y &&= ee(O, y), D &&= ee(P, D), V = ee(x, V);
      var J = cr(T);
      Me(J, function() {
        ge(`Cannot construct ${T} due to unbound types`, [f]);
      }), de([a, i, l], f ? [f] : [], (Z) => {
        Z = Z[0];
        var re, G;
        f ? (re = Z.registeredClass, G = re.instancePrototype) : G = Ie.prototype;
        var K = je(T, function(...We) {
          if (Object.getPrototypeOf(this) !== ne)
            throw new ue("Use 'new' to construct " + T);
          if (U.constructor_body === void 0)
            throw new ue(T + " has no accessible constructor");
          var jt = U.constructor_body[We.length];
          if (jt === void 0)
            throw new ue(`Tried to invoke ctor of ${T} with invalid number of parameters (${We.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return jt.apply(this, We);
        }), ne = Object.create(G, { constructor: { value: K } });
        K.prototype = ne;
        var U = new ur(T, K, ne, V, re, h, y, D);
        U.baseClass && (U.baseClass.__derivedClasses ??= [], U.baseClass.__derivedClasses.push(U));
        var oe = new Te(T, U, !0, !1, !1), Ae = new Te(T + "*", U, !1, !1, !1), It = new Te(T + " const*", U, !1, !0, !1);
        return ct[a] = { pointerType: Ae, constPointerType: It }, ut(J, K), [oe, Ae, It];
      });
    }, pt = (a, i) => {
      for (var l = [], f = 0; f < a; f++)
        l.push($[i + f * 4 >> 2]);
      return l;
    }, Re = (a) => {
      for (; a.length; ) {
        var i = a.pop(), l = a.pop();
        l(i);
      }
    };
    function Or(a) {
      for (var i = 1; i < a.length; ++i)
        if (a[i] !== null && a[i].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var ke = (a) => {
      try {
        return a();
      } catch (i) {
        be(i);
      }
    }, mt = (a) => {
      if (a instanceof qe || a == "unwind")
        return se;
      A(1, a);
    }, yt = 0, gt = () => tt || yt > 0, ht = (a) => {
      se = a, gt() || (t.onExit?.(a), N = !0), A(a, new qe(a));
    }, wr = (a, i) => {
      se = a, ht(a);
    }, Pr = wr, Ir = () => {
      if (!gt())
        try {
          Pr(se);
        } catch (a) {
          mt(a);
        }
    }, bt = (a) => {
      if (!N)
        try {
          a(), Ir();
        } catch (i) {
          mt(i);
        }
    }, C = { instrumentWasmImports(a) {
      var i = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(a))
        typeof f == "function" && (f.isAsync || i.test(l));
    }, instrumentWasmExports(a) {
      var i = {};
      for (let [l, f] of Object.entries(a))
        typeof f == "function" ? i[l] = (...m) => {
          C.exportCallStack.push(l);
          try {
            return f(...m);
          } finally {
            N || (C.exportCallStack.pop(), C.maybeStopUnwind());
          }
        } : i[l] = f;
      return i;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(a) {
      var i = C.callStackNameToId[a];
      return i === void 0 && (i = C.callStackId++, C.callStackNameToId[a] = i, C.callStackIdToName[i] = a), i;
    }, maybeStopUnwind() {
      C.currData && C.state === C.State.Unwinding && C.exportCallStack.length === 0 && (C.state = C.State.Normal, ke(vn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((a, i) => {
        C.asyncPromiseHandlers = { resolve: a, reject: i };
      });
    }, allocateData() {
      var a = Ne(12 + C.StackSize);
      return C.setDataHeader(a, a + 12, C.StackSize), C.setDataRewindFunc(a), a;
    }, setDataHeader(a, i, l) {
      $[a >> 2] = i, $[a + 4 >> 2] = i + l;
    }, setDataRewindFunc(a) {
      var i = C.exportCallStack[0], l = C.getCallStackId(i);
      Q[a + 8 >> 2] = l;
    }, getDataRewindFuncName(a) {
      var i = Q[a + 8 >> 2], l = C.callStackIdToName[i];
      return l;
    }, getDataRewindFunc(a) {
      var i = _[a];
      return i;
    }, doRewind(a) {
      var i = C.getDataRewindFuncName(a), l = C.getDataRewindFunc(i);
      return l();
    }, handleSleep(a) {
      if (!N) {
        if (C.state === C.State.Normal) {
          var i = !1, l = !1;
          a((f = 0) => {
            if (!N && (C.handleSleepReturnValue = f, i = !0, !!l)) {
              C.state = C.State.Rewinding, ke(() => On(C.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var m, h = !1;
              try {
                m = C.doRewind(C.currData);
              } catch (P) {
                m = P, h = !0;
              }
              var O = !1;
              if (!C.currData) {
                var y = C.asyncPromiseHandlers;
                y && (C.asyncPromiseHandlers = null, (h ? y.reject : y.resolve)(m), O = !0);
              }
              if (h && !O)
                throw m;
            }
          }), l = !0, i || (C.state = C.State.Unwinding, C.currData = C.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), ke(() => bn(C.currData)));
        } else C.state === C.State.Rewinding ? (C.state = C.State.Normal, ke(wn), q(C.currData), C.currData = null, C.sleepCallbacks.forEach(bt)) : be(`invalid state: ${C.state}`);
        return C.handleSleepReturnValue;
      }
    }, handleAsync(a) {
      return C.handleSleep((i) => {
        a().then(i);
      });
    } };
    function vt(a, i, l, f, m, h) {
      var O = i.length;
      O < 2 && E("argTypes array size mismatch! Must at least get return value and 'this' types!"), i[1];
      var y = Or(i), P = i[0].name !== "void", D = O - 2, T = new Array(D), x = [], V = [], J = function(...Z) {
        V.length = 0;
        var re;
        x.length = 1, x[0] = m;
        for (var G = 0; G < D; ++G)
          T[G] = i[G + 2].toWireType(V, Z[G]), x.push(T[G]);
        var K = f(...x);
        function ne(U) {
          if (y)
            Re(V);
          else
            for (var oe = 2; oe < i.length; oe++) {
              var Ae = oe === 1 ? re : T[oe - 2];
              i[oe].destructorFunction !== null && i[oe].destructorFunction(Ae);
            }
          if (P)
            return i[0].fromWireType(U);
        }
        return C.currData ? C.whenDone().then(ne) : ne(K);
      };
      return je(a, J);
    }
    var jr = (a, i, l, f, m, h) => {
      var O = pt(i, l);
      m = ee(f, m), de([], [a], (y) => {
        y = y[0];
        var P = `constructor ${y.name}`;
        if (y.registeredClass.constructor_body === void 0 && (y.registeredClass.constructor_body = []), y.registeredClass.constructor_body[i - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${i - 1}) for class '${y.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return y.registeredClass.constructor_body[i - 1] = () => {
          ge(`Cannot construct ${y.name} due to unbound types`, O);
        }, de([], O, (D) => (D.splice(1, 0, null), y.registeredClass.constructor_body[i - 1] = vt(P, D, null, m, h), [])), [];
      });
    }, Ot = (a, i, l) => (a instanceof Object || E(`${l} with invalid "this": ${a}`), a instanceof i.registeredClass.constructor || E(`${l} incompatible with "this" of type ${a.constructor.name}`), a.$$.ptr || E(`cannot call emscripten binding method ${l} on deleted object`), Ce(a.$$.ptr, a.$$.ptrType.registeredClass, i.registeredClass)), Cr = (a, i, l, f, m, h, O, y, P, D) => {
      i = W(i), m = ee(f, m), de([], [a], (T) => {
        T = T[0];
        var x = `${T.name}.${i}`, V = { get() {
          ge(`Cannot access ${x} due to unbound types`, [l, O]);
        }, enumerable: !0, configurable: !0 };
        return P ? V.set = () => ge(`Cannot access ${x} due to unbound types`, [l, O]) : V.set = (J) => E(x + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, i, V), de([], P ? [l, O] : [l], (J) => {
          var Z = J[0], re = { get() {
            var K = Ot(this, T, x + " getter");
            return Z.fromWireType(m(h, K));
          }, enumerable: !0 };
          if (P) {
            P = ee(y, P);
            var G = J[1];
            re.set = function(K) {
              var ne = Ot(this, T, x + " setter"), U = [];
              P(D, ne, G.toWireType(U, K)), Re(U);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, i, re), [];
        }), [];
      });
    }, Fe = [], te = [], Le = (a) => {
      a > 9 && --te[a + 1] === 0 && (te[a] = void 0, Fe.push(a));
    }, Sr = () => te.length / 2 - 5 - Fe.length, Tr = () => {
      te.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Sr;
    }, B = { toValue: (a) => (a || E("Cannot use deleted val. handle = " + a), te[a]), toHandle: (a) => {
      switch (a) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const i = Fe.pop() || te.length;
          return te[i] = a, te[i + 1] = 1, i;
        }
      }
    } }, kr = { name: "emscripten::val", fromWireType: (a) => {
      var i = B.toValue(a);
      return Le(a), i;
    }, toWireType: (a, i) => B.toHandle(i), argPackAdvance: Y, readValueFromPointer: Se, destructorFunction: null }, Ar = (a) => H(a, kr), Dr = (a, i, l) => {
      switch (i) {
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
          throw new TypeError(`invalid integer width (${i}): ${a}`);
      }
    }, _r = (a, i, l, f) => {
      i = W(i);
      function m() {
      }
      m.values = {}, H(a, { name: i, constructor: m, fromWireType: function(h) {
        return this.constructor.values[h];
      }, toWireType: (h, O) => O.value, argPackAdvance: Y, readValueFromPointer: Dr(i, l, f), destructorFunction: null }), Me(i, m);
    }, xe = (a, i) => {
      var l = ae[a];
      return l === void 0 && E(`${i} has unknown type ${ft(a)}`), l;
    }, Er = (a, i, l) => {
      var f = xe(a, "enum");
      i = W(i);
      var m = f.constructor, h = Object.create(f.constructor.prototype, { value: { value: l }, constructor: { value: je(`${f.name}_${i}`, function() {
      }) } });
      m.values[l] = h, m[i] = h;
    }, Mr = (a, i) => {
      switch (i) {
        case 4:
          return function(l) {
            return this.fromWireType(He[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(Je[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${i}): ${a}`);
      }
    }, Rr = (a, i, l) => {
      i = W(i), H(a, { name: i, fromWireType: (f) => f, toWireType: (f, m) => m, argPackAdvance: Y, readValueFromPointer: Mr(i, l), destructorFunction: null });
    }, Fr = (a) => {
      a = a.trim();
      const i = a.indexOf("(");
      return i === -1 ? a : a.slice(0, i);
    }, Lr = (a, i, l, f, m, h, O, y) => {
      var P = pt(i, l);
      a = W(a), a = Fr(a), m = ee(f, m), Me(a, function() {
        ge(`Cannot call ${a} due to unbound types`, P);
      }, i - 1), de([], P, (D) => {
        var T = [D[0], null].concat(D.slice(1));
        return ut(a, vt(a, T, null, m, h), i - 1), [];
      });
    }, xr = (a, i, l, f, m) => {
      i = W(i);
      var h = (T) => T;
      if (f === 0) {
        var O = 32 - 8 * l;
        h = (T) => T << O >>> O;
      }
      var y = i.includes("unsigned"), P = (T, x) => {
      }, D;
      y ? D = function(T, x) {
        return P(x, this.name), x >>> 0;
      } : D = function(T, x) {
        return P(x, this.name), x;
      }, H(a, { name: i, fromWireType: h, toWireType: D, argPackAdvance: Y, readValueFromPointer: it(i, l, f !== 0), destructorFunction: null });
    }, Nr = (a, i, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], m = f[i];
      function h(O) {
        var y = $[O >> 2], P = $[O + 4 >> 2];
        return new m(X.buffer, P, y);
      }
      l = W(l), H(a, { name: l, fromWireType: h, argPackAdvance: Y, readValueFromPointer: h }, { ignoreDuplicateRegistrations: !0 });
    }, $r = (a, i, l, f) => {
      if (!(f > 0)) return 0;
      for (var m = l, h = l + f - 1, O = 0; O < a.length; ++O) {
        var y = a.charCodeAt(O);
        if (y >= 55296 && y <= 57343) {
          var P = a.charCodeAt(++O);
          y = 65536 + ((y & 1023) << 10) | P & 1023;
        }
        if (y <= 127) {
          if (l >= h) break;
          i[l++] = y;
        } else if (y <= 2047) {
          if (l + 1 >= h) break;
          i[l++] = 192 | y >> 6, i[l++] = 128 | y & 63;
        } else if (y <= 65535) {
          if (l + 2 >= h) break;
          i[l++] = 224 | y >> 12, i[l++] = 128 | y >> 6 & 63, i[l++] = 128 | y & 63;
        } else {
          if (l + 3 >= h) break;
          i[l++] = 240 | y >> 18, i[l++] = 128 | y >> 12 & 63, i[l++] = 128 | y >> 6 & 63, i[l++] = 128 | y & 63;
        }
      }
      return i[l] = 0, l - m;
    }, Wr = (a, i, l) => $r(a, z, i, l), Vr = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f <= 127 ? i++ : f <= 2047 ? i += 2 : f >= 55296 && f <= 57343 ? (i += 4, ++l) : i += 3;
      }
      return i;
    }, wt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Ur = (a, i = 0, l = NaN) => {
      for (var f = i + l, m = i; a[m] && !(m >= f); ) ++m;
      if (m - i > 16 && a.buffer && wt)
        return wt.decode(a.subarray(i, m));
      for (var h = ""; i < m; ) {
        var O = a[i++];
        if (!(O & 128)) {
          h += String.fromCharCode(O);
          continue;
        }
        var y = a[i++] & 63;
        if ((O & 224) == 192) {
          h += String.fromCharCode((O & 31) << 6 | y);
          continue;
        }
        var P = a[i++] & 63;
        if ((O & 240) == 224 ? O = (O & 15) << 12 | y << 6 | P : O = (O & 7) << 18 | y << 12 | P << 6 | a[i++] & 63, O < 65536)
          h += String.fromCharCode(O);
        else {
          var D = O - 65536;
          h += String.fromCharCode(55296 | D >> 10, 56320 | D & 1023);
        }
      }
      return h;
    }, zr = (a, i) => a ? Ur(z, a, i) : "", Gr = (a, i) => {
      i = W(i), H(a, { name: i, fromWireType(l) {
        for (var f = $[l >> 2], m = l + 4, h, O, y = m, O = 0; O <= f; ++O) {
          var P = m + O;
          if (O == f || z[P] == 0) {
            var D = P - y, T = zr(y, D);
            h === void 0 ? h = T : (h += "\0", h += T), y = P + 1;
          }
        }
        return q(l), h;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var m, h = typeof f == "string";
        h || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || E("Cannot pass non-string to std::string"), h ? m = Vr(f) : m = f.length;
        var O = Ne(4 + m + 1), y = O + 4;
        if ($[O >> 2] = m, h)
          Wr(f, y, m + 1);
        else if (h)
          for (var P = 0; P < m; ++P) {
            var D = f.charCodeAt(P);
            D > 255 && (q(O), E("String has UTF-16 code units that do not fit in 8 bits")), z[y + P] = D;
          }
        else
          for (var P = 0; P < m; ++P)
            z[y + P] = f[P];
        return l !== null && l.push(q, O), O;
      }, argPackAdvance: Y, readValueFromPointer: Se, destructorFunction(l) {
        q(l);
      } });
    }, Pt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Hr = (a, i) => {
      for (var l = a, f = l >> 1, m = f + i / 2; !(f >= m) && pe[f]; ) ++f;
      if (l = f << 1, l - a > 32 && Pt) return Pt.decode(z.subarray(a, l));
      for (var h = "", O = 0; !(O >= i / 2); ++O) {
        var y = le[a + O * 2 >> 1];
        if (y == 0) break;
        h += String.fromCharCode(y);
      }
      return h;
    }, Br = (a, i, l) => {
      if (l ??= 2147483647, l < 2) return 0;
      l -= 2;
      for (var f = i, m = l < a.length * 2 ? l / 2 : a.length, h = 0; h < m; ++h) {
        var O = a.charCodeAt(h);
        le[i >> 1] = O, i += 2;
      }
      return le[i >> 1] = 0, i - f;
    }, Yr = (a) => a.length * 2, Jr = (a, i) => {
      for (var l = 0, f = ""; !(l >= i / 4); ) {
        var m = Q[a + l * 4 >> 2];
        if (m == 0) break;
        if (++l, m >= 65536) {
          var h = m - 65536;
          f += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023);
        } else
          f += String.fromCharCode(m);
      }
      return f;
    }, Zr = (a, i, l) => {
      if (l ??= 2147483647, l < 4) return 0;
      for (var f = i, m = f + l - 4, h = 0; h < a.length; ++h) {
        var O = a.charCodeAt(h);
        if (O >= 55296 && O <= 57343) {
          var y = a.charCodeAt(++h);
          O = 65536 + ((O & 1023) << 10) | y & 1023;
        }
        if (Q[i >> 2] = O, i += 4, i + 4 > m) break;
      }
      return Q[i >> 2] = 0, i - f;
    }, Kr = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, i += 4;
      }
      return i;
    }, qr = (a, i, l) => {
      l = W(l);
      var f, m, h, O;
      i === 2 ? (f = Hr, m = Br, O = Yr, h = (y) => pe[y >> 1]) : i === 4 && (f = Jr, m = Zr, O = Kr, h = (y) => $[y >> 2]), H(a, { name: l, fromWireType: (y) => {
        for (var P = $[y >> 2], D, T = y + 4, x = 0; x <= P; ++x) {
          var V = y + 4 + x * i;
          if (x == P || h(V) == 0) {
            var J = V - T, Z = f(T, J);
            D === void 0 ? D = Z : (D += "\0", D += Z), T = V + i;
          }
        }
        return q(y), D;
      }, toWireType: (y, P) => {
        typeof P != "string" && E(`Cannot pass non-string to C++ string type ${l}`);
        var D = O(P), T = Ne(4 + D + i);
        return $[T >> 2] = D / i, m(P, T + 4, D + i), y !== null && y.push(q, T), T;
      }, argPackAdvance: Y, readValueFromPointer: Se, destructorFunction(y) {
        q(y);
      } });
    }, Xr = (a, i) => {
      i = W(i), H(a, { isVoid: !0, name: i, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, Qr = () => {
      tt = !1, yt = 0;
    }, en = (a, i, l) => {
      var f = [], m = a.toWireType(f, l);
      return f.length && ($[i >> 2] = B.toHandle(f)), m;
    }, tn = (a, i, l) => (a = B.toValue(a), i = xe(i, "emval::as"), en(i, l, a)), rn = (a, i) => (a = B.toValue(a), i = B.toValue(i), B.toHandle(a[i])), nn = {}, on = (a) => {
      var i = nn[a];
      return i === void 0 ? W(a) : i;
    }, an = (a) => B.toHandle(on(a)), sn = (a) => {
      var i = B.toValue(a);
      Re(i), Le(a);
    }, ln = (a, i) => {
      a = xe(a, "_emval_take_value");
      var l = a.readValueFromPointer(i);
      return B.toHandle(l);
    }, he = {}, cn = () => performance.now(), un = (a, i) => {
      if (he[a] && (clearTimeout(he[a].id), delete he[a]), !i) return 0;
      var l = setTimeout(() => {
        delete he[a], bt(() => hn(a, cn()));
      }, i);
      return he[a] = { id: l, timeout_ms: i }, 0;
    }, dn = () => 2147483648, fn = (a, i) => Math.ceil(a / i) * i, pn = (a) => {
      var i = M.buffer, l = (a - i.byteLength + 65535) / 65536 | 0;
      try {
        return M.grow(l), Ke(), 1;
      } catch {
      }
    }, mn = (a) => {
      var i = z.length;
      a >>>= 0;
      var l = dn();
      if (a > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var m = i * (1 + 0.2 / f);
        m = Math.min(m, a + 100663296);
        var h = Math.min(l, fn(Math.max(a, m), 65536)), O = pn(h);
        if (O)
          return !0;
      }
      return !1;
    };
    Zt(), ue = t.BindingError = class extends Error {
      constructor(i) {
        super(i), this.name = "BindingError";
      }
    }, ot = t.InternalError = class extends Error {
      constructor(i) {
        super(i), this.name = "InternalError";
      }
    }, ir(), mr(), dt = t.UnboundTypeError = br(Error, "UnboundTypeError"), Tr();
    var yn = { i: Yt, s: Jt, n: qt, w: Xt, f: vr, d: jr, a: Cr, u: Ar, l: _r, g: Er, m: Rr, b: Lr, e: xr, c: Nr, v: Gr, h: qr, x: Xr, q: Qr, j: tn, y: Le, k: rn, o: an, A: sn, z: ln, r: un, t: mn, p: ht }, _ = await zt();
    _.C;
    var gn = _.D, Ne = t._malloc = _.E, q = t._free = _.F, hn = _.G;
    t.dynCall_v = _.I, t.dynCall_ii = _.J, t.dynCall_vi = _.K, t.dynCall_i = _.L, t.dynCall_iii = _.M, t.dynCall_viii = _.N, t.dynCall_fii = _.O, t.dynCall_viif = _.P, t.dynCall_viiii = _.Q, t.dynCall_viiiiii = _.R, t.dynCall_iiiiii = _.S, t.dynCall_viiiii = _.T, t.dynCall_iiiiiii = _.U, t.dynCall_iiiiiiii = _.V, t.dynCall_viiiiiii = _.W, t.dynCall_viiiiiiiiidi = _.X, t.dynCall_viiiiiiiidi = _.Y, t.dynCall_viiiiiiiiii = _.Z, t.dynCall_viiiiiiiii = _._, t.dynCall_viiiiiiii = _.$, t.dynCall_iiiii = _.aa, t.dynCall_iiii = _.ba;
    var bn = _.ca, vn = _.da, On = _.ea, wn = _.fa;
    function $e() {
      if (ie > 0) {
        me = $e;
        return;
      }
      if (Et(), ie > 0) {
        me = $e;
        return;
      }
      function a() {
        t.calledRun = !0, !N && (Mt(), e(t), t.onRuntimeInitialized?.(), Rt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), a();
      }, 1)) : a();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return $e(), r = o, r;
  });
})();
let ci = class extends si {
  getSamWasmFilePath(c, r) {
    return `${c}/magnifeye/wasm/${r}`;
  }
  fetchSamModule(c) {
    return li(c);
  }
};
class ui extends ci {
}
Ln(ui);
