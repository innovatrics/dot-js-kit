const uo = /* @__PURE__ */ Symbol("Comlink.proxy"), wo = /* @__PURE__ */ Symbol("Comlink.endpoint"), jo = /* @__PURE__ */ Symbol("Comlink.releaseProxy"), Et = /* @__PURE__ */ Symbol("Comlink.finalizer"), St = /* @__PURE__ */ Symbol("Comlink.thrown"), fo = (v) => typeof v == "object" && v !== null || typeof v == "function", Po = {
  canHandle: (v) => fo(v) && v[uo],
  serialize(v) {
    const { port1: u, port2: n } = new MessageChannel();
    return An(v, u), [n, [n]];
  },
  deserialize(v) {
    return v.start(), Eo(v);
  }
}, Io = {
  canHandle: (v) => fo(v) && St in v,
  serialize({ value: v }) {
    let u;
    return v instanceof Error ? u = {
      isError: !0,
      value: {
        message: v.message,
        name: v.name,
        stack: v.stack
      }
    } : u = { isError: !1, value: v }, [u, []];
  },
  deserialize(v) {
    throw v.isError ? Object.assign(new Error(v.value.message), v.value) : v.value;
  }
}, po = /* @__PURE__ */ new Map([
  ["proxy", Po],
  ["throw", Io]
]);
function Co(v, u) {
  for (const n of v)
    if (u === n || n === "*" || n instanceof RegExp && n.test(u))
      return !0;
  return !1;
}
function An(v, u = globalThis, n = ["*"]) {
  u.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!Co(n, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: r, type: o, path: i } = Object.assign({ path: [] }, e.data), d = (e.data.argumentList || []).map(Ve);
    let p;
    try {
      const O = i.slice(0, -1).reduce((j, P) => j[P], v), C = i.reduce((j, P) => j[P], v);
      switch (o) {
        case "GET":
          p = C;
          break;
        case "SET":
          O[i.slice(-1)[0]] = Ve(e.data.value), p = !0;
          break;
        case "APPLY":
          p = C.apply(O, d);
          break;
        case "CONSTRUCT":
          {
            const j = new C(...d);
            p = Lo(j);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: j, port2: P } = new MessageChannel();
            An(v, P), p = ko(j, [j]);
          }
          break;
        case "RELEASE":
          p = void 0;
          break;
        default:
          return;
      }
    } catch (O) {
      p = { value: O, [St]: 0 };
    }
    Promise.resolve(p).catch((O) => ({ value: O, [St]: 0 })).then((O) => {
      const [C, j] = kt(O);
      u.postMessage(Object.assign(Object.assign({}, C), { id: r }), j), o === "RELEASE" && (u.removeEventListener("message", t), mo(u), Et in v && typeof v[Et] == "function" && v[Et]());
    }).catch((O) => {
      const [C, j] = kt({
        value: new TypeError("Unserializable return value"),
        [St]: 0
      });
      u.postMessage(Object.assign(Object.assign({}, C), { id: r }), j);
    });
  }), u.start && u.start();
}
function xo(v) {
  return v.constructor.name === "MessagePort";
}
function mo(v) {
  xo(v) && v.close();
}
function Eo(v, u) {
  const n = /* @__PURE__ */ new Map();
  return v.addEventListener("message", function(e) {
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
  }), Rn(v, n, [], u);
}
function xt(v) {
  if (v)
    throw new Error("Proxy has been released and is not useable");
}
function ho(v) {
  return Ge(v, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    mo(v);
  });
}
const _t = /* @__PURE__ */ new WeakMap(), Tt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((v) => {
  const u = (_t.get(v) || 0) - 1;
  _t.set(v, u), u === 0 && ho(v);
});
function So(v, u) {
  const n = (_t.get(u) || 0) + 1;
  _t.set(u, n), Tt && Tt.register(v, u, v);
}
function _o(v) {
  Tt && Tt.unregister(v);
}
function Rn(v, u, n = [], t = function() {
}) {
  let e = !1;
  const r = new Proxy(t, {
    get(o, i) {
      if (xt(e), i === jo)
        return () => {
          _o(r), ho(v), u.clear(), e = !0;
        };
      if (i === "then") {
        if (n.length === 0)
          return { then: () => r };
        const d = Ge(v, u, {
          type: "GET",
          path: n.map((p) => p.toString())
        }).then(Ve);
        return d.then.bind(d);
      }
      return Rn(v, u, [...n, i]);
    },
    set(o, i, d) {
      xt(e);
      const [p, O] = kt(d);
      return Ge(v, u, {
        type: "SET",
        path: [...n, i].map((C) => C.toString()),
        value: p
      }, O).then(Ve);
    },
    apply(o, i, d) {
      xt(e);
      const p = n[n.length - 1];
      if (p === wo)
        return Ge(v, u, {
          type: "ENDPOINT"
        }).then(Ve);
      if (p === "bind")
        return Rn(v, u, n.slice(0, -1));
      const [O, C] = Mn(d);
      return Ge(v, u, {
        type: "APPLY",
        path: n.map((j) => j.toString()),
        argumentList: O
      }, C).then(Ve);
    },
    construct(o, i) {
      xt(e);
      const [d, p] = Mn(i);
      return Ge(v, u, {
        type: "CONSTRUCT",
        path: n.map((O) => O.toString()),
        argumentList: d
      }, p).then(Ve);
    }
  });
  return So(r, v), r;
}
function To(v) {
  return Array.prototype.concat.apply([], v);
}
function Mn(v) {
  const u = v.map(kt);
  return [u.map((n) => n[0]), To(u.map((n) => n[1]))];
}
const go = /* @__PURE__ */ new WeakMap();
function ko(v, u) {
  return go.set(v, u), v;
}
function Lo(v) {
  return Object.assign(v, { [uo]: !0 });
}
function kt(v) {
  for (const [u, n] of po)
    if (n.canHandle(v)) {
      const [t, e] = n.serialize(v);
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
      value: v
    },
    go.get(v) || []
  ];
}
function Ve(v) {
  switch (v.type) {
    case "HANDLER":
      return po.get(v.name).deserialize(v.value);
    case "RAW":
      return v.value;
  }
}
function Ge(v, u, n, t) {
  return new Promise((e) => {
    const r = Do();
    u.set(r, e), v.start && v.start(), v.postMessage(Object.assign({ id: r }, n), t);
  });
}
function Do() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const Ct = 1e3, Nn = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Ro = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class le extends Error {
  cause;
  constructor(u, n) {
    super(u), this.name = "AutoCaptureError", this.cause = n;
  }
  // Change this to Decorator when they will be in stable release
  static logError(u) {
  }
  static fromCameraError(u) {
    if (this.logError(u), u instanceof le)
      return u;
    let n;
    switch (u.name) {
      case "OverconstrainedError":
        n = "Minimum quality requirements are not met by your camera";
        break;
      case "NotReadableError":
      case "AbortError":
        n = "The webcam is already in use by another application";
        break;
      case "NotAllowedError":
        n = "To use your camera, you must allow permissions";
        break;
      case "NotFoundError":
        n = "There is no camera available to you";
        break;
      default:
        n = "An unknown camera error has occurred";
        break;
    }
    return new le(n, u);
  }
  static fromError(u) {
    if (this.logError(u), u instanceof le)
      return u;
    const n = "An unexpected error has occurred";
    return u instanceof Error ? new le(n, u) : typeof u == "string" ? new le(n, new Error(u)) : new le(n);
  }
}
const Ao = {
  RGBA: "RGBA"
};
class Fo {
  #e;
  #t;
  #r;
  constructor(u, n) {
    this.#e = u, this.#t = this.allocate(n.length * n.BYTES_PER_ELEMENT), this.#r = this.allocate(n.length * n.BYTES_PER_ELEMENT);
  }
  get rgbaImagePointer() {
    return this.#t;
  }
  get bgr0ImagePointer() {
    return this.#r;
  }
  allocate(u) {
    return this.#e._malloc(u);
  }
  free() {
    this.#e._free(this.#t), this.#e._free(this.#r);
  }
  writeDataToMemory(u) {
    this.#e.HEAPU8.set(u, this.#t);
  }
}
class Mo {
  samWasmModule;
  getOverriddenModules(u, n) {
    return {
      locateFile: (t) => new URL(n || t, u).href
    };
  }
  async handleMissingOrInvalidSamModule(u, n) {
    try {
      const t = await fetch(u);
      if (!t.ok)
        throw new le(
          `The path to ${n} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${u}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new le(
          `The provided ${n} is not a valid WASM module. Please check provided path to wasm files. Current path is ${u}`
        );
    } catch (t) {
      if (t instanceof le)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Ro() ? Nn.simd : Nn.sam;
  }
  async initSamModule(u, n) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(n, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(u, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new le("Could not init detector.");
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
  writeImageToMemory(u) {
    if (!this.samWasmModule)
      throw new le("SAM WASM module is not initialized");
    const n = new Fo(this.samWasmModule, u);
    return n.writeDataToMemory(u), n;
  }
  convertToSamColorImage(u, n) {
    if (!this.samWasmModule)
      throw new le("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(u);
    return this.samWasmModule.convertToSamColorImage(
      n.width,
      n.height,
      t.rgbaImagePointer,
      Ao.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(u, n, t) {
    if (!this.samWasmModule)
      throw new le("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(u, n), { bottomLeft: r, topLeft: o, topRight: i } = t, d = [
      o.x,
      // x
      o.y,
      // y
      i.x - o.x,
      // width
      r.y - o.y
      // height
    ], { height: p, width: O, x: C, y: j } = await this.samWasmModule.selectDetailRegion(
      n.width,
      n.height,
      e.bgr0ImagePointer,
      d
    );
    return e.free(), {
      height: p,
      width: O,
      shiftX: C,
      shiftY: j
    };
  }
  [Et]() {
    this.terminateSamModule();
  }
}
const Fn = (v) => Number.parseFloat(v.toFixed(3)), yo = (v, u) => Math.min(v, u);
function No(v, u) {
  const n = yo(u.width, u.height);
  return Fn(v * n);
}
const $o = (v) => JSON.parse(
  JSON.stringify(v, (u, n) => typeof n == "number" ? Fn(n) : n)
);
var ze = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, $n = {}, jn = {}, Pn, Wn;
function Wo() {
  if (Wn) return Pn;
  Wn = 1, Pn = v;
  function v(u, n) {
    for (var t = new Array(arguments.length - 1), e = 0, r = 2, o = !0; r < arguments.length; )
      t[e++] = arguments[r++];
    return new Promise(function(i, d) {
      t[e] = function(p) {
        if (o)
          if (o = !1, p)
            d(p);
          else {
            for (var O = new Array(arguments.length - 1), C = 0; C < O.length; )
              O[C++] = arguments[C];
            i.apply(null, O);
          }
      };
      try {
        u.apply(n || null, t);
      } catch (p) {
        o && (o = !1, d(p));
      }
    });
  }
  return Pn;
}
var Vn = {}, Un;
function Vo() {
  return Un || (Un = 1, (function(v) {
    var u = v;
    u.length = function(o) {
      var i = o.length;
      if (!i)
        return 0;
      for (var d = 0; --i % 4 > 1 && o.charAt(i) === "="; )
        ++d;
      return Math.ceil(o.length * 3) / 4 - d;
    };
    for (var n = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[n[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    u.encode = function(o, i, d) {
      for (var p = null, O = [], C = 0, j = 0, P; i < d; ) {
        var x = o[i++];
        switch (j) {
          case 0:
            O[C++] = n[x >> 2], P = (x & 3) << 4, j = 1;
            break;
          case 1:
            O[C++] = n[P | x >> 4], P = (x & 15) << 2, j = 2;
            break;
          case 2:
            O[C++] = n[P | x >> 6], O[C++] = n[x & 63], j = 0;
            break;
        }
        C > 8191 && ((p || (p = [])).push(String.fromCharCode.apply(String, O)), C = 0);
      }
      return j && (O[C++] = n[P], O[C++] = 61, j === 1 && (O[C++] = 61)), p ? (C && p.push(String.fromCharCode.apply(String, O.slice(0, C))), p.join("")) : String.fromCharCode.apply(String, O.slice(0, C));
    };
    var r = "invalid encoding";
    u.decode = function(o, i, d) {
      for (var p = d, O = 0, C, j = 0; j < o.length; ) {
        var P = o.charCodeAt(j++);
        if (P === 61 && O > 1)
          break;
        if ((P = t[P]) === void 0)
          throw Error(r);
        switch (O) {
          case 0:
            C = P, O = 1;
            break;
          case 1:
            i[d++] = C << 2 | (P & 48) >> 4, C = P, O = 2;
            break;
          case 2:
            i[d++] = (C & 15) << 4 | (P & 60) >> 2, C = P, O = 3;
            break;
          case 3:
            i[d++] = (C & 3) << 6 | P, O = 0;
            break;
        }
      }
      if (O === 1)
        throw Error(r);
      return d - p;
    }, u.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  })(Vn)), Vn;
}
var In, zn;
function Uo() {
  if (zn) return In;
  zn = 1, In = v;
  function v() {
    this._listeners = /* @__PURE__ */ Object.create(null);
  }
  return v.prototype.on = function(u, n, t) {
    return (this._listeners[u] || (this._listeners[u] = [])).push({
      fn: n,
      ctx: t || this
    }), this;
  }, v.prototype.off = function(u, n) {
    if (u === void 0)
      this._listeners = /* @__PURE__ */ Object.create(null);
    else if (n === void 0)
      this._listeners[u] = [];
    else {
      var t = this._listeners[u];
      if (!t)
        return this;
      for (var e = 0; e < t.length; )
        t[e].fn === n ? t.splice(e, 1) : ++e;
    }
    return this;
  }, v.prototype.emit = function(u) {
    var n = this._listeners[u];
    if (n) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < n.length; )
        n[e].fn.apply(n[e++].ctx, t);
    }
    return this;
  }, In;
}
var Cn, Gn;
function zo() {
  if (Gn) return Cn;
  Gn = 1, Cn = v(v);
  function v(r) {
    return typeof Float32Array < "u" ? (function() {
      var o = new Float32Array([-0]), i = new Uint8Array(o.buffer), d = i[3] === 128;
      function p(P, x, A) {
        o[0] = P, x[A] = i[0], x[A + 1] = i[1], x[A + 2] = i[2], x[A + 3] = i[3];
      }
      function O(P, x, A) {
        o[0] = P, x[A] = i[3], x[A + 1] = i[2], x[A + 2] = i[1], x[A + 3] = i[0];
      }
      r.writeFloatLE = d ? p : O, r.writeFloatBE = d ? O : p;
      function C(P, x) {
        return i[0] = P[x], i[1] = P[x + 1], i[2] = P[x + 2], i[3] = P[x + 3], o[0];
      }
      function j(P, x) {
        return i[3] = P[x], i[2] = P[x + 1], i[1] = P[x + 2], i[0] = P[x + 3], o[0];
      }
      r.readFloatLE = d ? C : j, r.readFloatBE = d ? j : C;
    })() : (function() {
      function o(d, p, O, C) {
        var j = p < 0 ? 1 : 0;
        if (j && (p = -p), p === 0)
          d(1 / p > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), O, C);
        else if (isNaN(p))
          d(2143289344, O, C);
        else if (p > 34028234663852886e22)
          d((j << 31 | 2139095040) >>> 0, O, C);
        else if (p < 11754943508222875e-54)
          d((j << 31 | Math.round(p / 1401298464324817e-60)) >>> 0, O, C);
        else {
          var P = Math.floor(Math.log(p) / Math.LN2), x = Math.round(p * Math.pow(2, -P) * 8388608) & 8388607;
          d((j << 31 | P + 127 << 23 | x) >>> 0, O, C);
        }
      }
      r.writeFloatLE = o.bind(null, u), r.writeFloatBE = o.bind(null, n);
      function i(d, p, O) {
        var C = d(p, O), j = (C >> 31) * 2 + 1, P = C >>> 23 & 255, x = C & 8388607;
        return P === 255 ? x ? NaN : j * (1 / 0) : P === 0 ? j * 1401298464324817e-60 * x : j * Math.pow(2, P - 150) * (x + 8388608);
      }
      r.readFloatLE = i.bind(null, t), r.readFloatBE = i.bind(null, e);
    })(), typeof Float64Array < "u" ? (function() {
      var o = new Float64Array([-0]), i = new Uint8Array(o.buffer), d = i[7] === 128;
      function p(P, x, A) {
        o[0] = P, x[A] = i[0], x[A + 1] = i[1], x[A + 2] = i[2], x[A + 3] = i[3], x[A + 4] = i[4], x[A + 5] = i[5], x[A + 6] = i[6], x[A + 7] = i[7];
      }
      function O(P, x, A) {
        o[0] = P, x[A] = i[7], x[A + 1] = i[6], x[A + 2] = i[5], x[A + 3] = i[4], x[A + 4] = i[3], x[A + 5] = i[2], x[A + 6] = i[1], x[A + 7] = i[0];
      }
      r.writeDoubleLE = d ? p : O, r.writeDoubleBE = d ? O : p;
      function C(P, x) {
        return i[0] = P[x], i[1] = P[x + 1], i[2] = P[x + 2], i[3] = P[x + 3], i[4] = P[x + 4], i[5] = P[x + 5], i[6] = P[x + 6], i[7] = P[x + 7], o[0];
      }
      function j(P, x) {
        return i[7] = P[x], i[6] = P[x + 1], i[5] = P[x + 2], i[4] = P[x + 3], i[3] = P[x + 4], i[2] = P[x + 5], i[1] = P[x + 6], i[0] = P[x + 7], o[0];
      }
      r.readDoubleLE = d ? C : j, r.readDoubleBE = d ? j : C;
    })() : (function() {
      function o(d, p, O, C, j, P) {
        var x = C < 0 ? 1 : 0;
        if (x && (C = -C), C === 0)
          d(0, j, P + p), d(1 / C > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), j, P + O);
        else if (isNaN(C))
          d(0, j, P + p), d(2146959360, j, P + O);
        else if (C > 17976931348623157e292)
          d(0, j, P + p), d((x << 31 | 2146435072) >>> 0, j, P + O);
        else {
          var A;
          if (C < 22250738585072014e-324)
            A = C / 5e-324, d(A >>> 0, j, P + p), d((x << 31 | A / 4294967296) >>> 0, j, P + O);
          else {
            var S = Math.floor(Math.log(C) / Math.LN2);
            S === 1024 && (S = 1023), A = C * Math.pow(2, -S), d(A * 4503599627370496 >>> 0, j, P + p), d((x << 31 | S + 1023 << 20 | A * 1048576 & 1048575) >>> 0, j, P + O);
          }
        }
      }
      r.writeDoubleLE = o.bind(null, u, 0, 4), r.writeDoubleBE = o.bind(null, n, 4, 0);
      function i(d, p, O, C, j) {
        var P = d(C, j + p), x = d(C, j + O), A = (x >> 31) * 2 + 1, S = x >>> 20 & 2047, R = 4294967296 * (x & 1048575) + P;
        return S === 2047 ? R ? NaN : A * (1 / 0) : S === 0 ? A * 5e-324 * R : A * Math.pow(2, S - 1075) * (R + 4503599627370496);
      }
      r.readDoubleLE = i.bind(null, t, 0, 4), r.readDoubleBE = i.bind(null, e, 4, 0);
    })(), r;
  }
  function u(r, o, i) {
    o[i] = r & 255, o[i + 1] = r >>> 8 & 255, o[i + 2] = r >>> 16 & 255, o[i + 3] = r >>> 24;
  }
  function n(r, o, i) {
    o[i] = r >>> 24, o[i + 1] = r >>> 16 & 255, o[i + 2] = r >>> 8 & 255, o[i + 3] = r & 255;
  }
  function t(r, o) {
    return (r[o] | r[o + 1] << 8 | r[o + 2] << 16 | r[o + 3] << 24) >>> 0;
  }
  function e(r, o) {
    return (r[o] << 24 | r[o + 1] << 16 | r[o + 2] << 8 | r[o + 3]) >>> 0;
  }
  return Cn;
}
var Bn = {}, Hn;
function Go() {
  return Hn || (Hn = 1, (function(v) {
    var u = v, n = 65533;
    u.length = function(t) {
      for (var e = 0, r = 0, o = 0; o < t.length; ++o)
        r = t.charCodeAt(o), r < 128 ? e += 1 : r < 2048 ? e += 2 : (r & 64512) === 55296 && (t.charCodeAt(o + 1) & 64512) === 56320 ? (++o, e += 4) : e += 3;
      return e;
    }, u.read = function(t, e, r) {
      if (r - e < 1)
        return "";
      for (var o = null, i = [], d = 0, p, O, C, j; e < r; )
        p = t[e++], p <= 127 ? i[d++] = p : p >= 192 && p < 224 ? (C = (p & 31) << 6 | t[e++] & 63, i[d++] = C >= 128 ? C : n) : p >= 224 && p < 240 ? (j = (p & 15) << 12 | (t[e++] & 63) << 6 | t[e++] & 63, i[d++] = j >= 2048 ? j : n) : p >= 240 && (O = (p & 7) << 18 | (t[e++] & 63) << 12 | (t[e++] & 63) << 6 | t[e++] & 63, O < 65536 || O > 1114111 ? i[d++] = n : (O -= 65536, i[d++] = 55296 + (O >> 10), i[d++] = 56320 + (O & 1023))), d > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, i.slice(0, d))), d = 0);
      return o ? (d && o.push(String.fromCharCode.apply(String, i.slice(0, d))), o.join("")) : String.fromCharCode.apply(String, i.slice(0, d));
    }, u.write = function(t, e, r) {
      for (var o = r, i, d, p = 0; p < t.length; ++p)
        i = t.charCodeAt(p), i < 128 ? e[r++] = i : i < 2048 ? (e[r++] = i >> 6 | 192, e[r++] = i & 63 | 128) : (i & 64512) === 55296 && ((d = t.charCodeAt(p + 1)) & 64512) === 56320 ? (i = 65536 + ((i & 1023) << 10) + (d & 1023), ++p, e[r++] = i >> 18 | 240, e[r++] = i >> 12 & 63 | 128, e[r++] = i >> 6 & 63 | 128, e[r++] = i & 63 | 128) : (e[r++] = i >> 12 | 224, e[r++] = i >> 6 & 63 | 128, e[r++] = i & 63 | 128);
      return r - o;
    };
  })(Bn)), Bn;
}
var xn, Yn;
function Bo() {
  if (Yn) return xn;
  Yn = 1, xn = v;
  function v(u, n, t) {
    var e = t || 8192, r = e >>> 1, o = null, i = e;
    return function(d) {
      if (d < 1 || d > r)
        return u(d);
      i + d > e && (o = u(e), i = 0);
      var p = n.call(o, i, i += d);
      return i & 7 && (i = (i | 7) + 1), p;
    };
  }
  return xn;
}
var En, Jn;
function Ho() {
  if (Jn) return En;
  Jn = 1, En = u;
  var v = Ue();
  function u(r, o) {
    this.lo = r >>> 0, this.hi = o >>> 0;
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
    var o = r < 0;
    o && (r = -r);
    var i = r >>> 0, d = (r - i) / 4294967296 >>> 0;
    return o && (d = ~d >>> 0, i = ~i >>> 0, ++i > 4294967295 && (i = 0, ++d > 4294967295 && (d = 0))), new u(i, d);
  }, u.from = function(r) {
    if (typeof r == "number")
      return u.fromNumber(r);
    if (v.isString(r))
      if (v.Long)
        r = v.Long.fromString(r);
      else
        return u.fromNumber(parseInt(r, 10));
    return r.low || r.high ? new u(r.low >>> 0, r.high >>> 0) : n;
  }, u.prototype.toNumber = function(r) {
    if (!r && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, i = ~this.hi >>> 0;
      return o || (i = i + 1 >>> 0), -(o + i * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, u.prototype.toLong = function(r) {
    return v.Long ? new v.Long(this.lo | 0, this.hi | 0, !!r) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!r };
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
    var r = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, i = this.hi >>> 24;
    return i === 0 ? o === 0 ? r < 16384 ? r < 128 ? 1 : 2 : r < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : i < 128 ? 9 : 10;
  }, En;
}
var qn, Zn;
function Yo() {
  return Zn || (Zn = 1, qn = {}), qn;
}
var Kn;
function Ue() {
  return Kn || (Kn = 1, (function(v) {
    var u = v;
    u.asPromise = Wo(), u.base64 = Vo(), u.EventEmitter = Uo(), u.float = zo(), u.utf8 = Go(), u.pool = Bo(), u.LongBits = Ho();
    function n(r) {
      return r === "__proto__" || r === "prototype" || r === "constructor";
    }
    u.isUnsafeProperty = n, u.isNode = !!(typeof ze < "u" && ze && ze.process && ze.process.versions && ze.process.versions.node), u.global = u.isNode && ze || typeof window < "u" && window || typeof self < "u" && self || jn, u.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), u.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), u.isInteger = Number.isInteger || /* istanbul ignore next */
    function(r) {
      return typeof r == "number" && isFinite(r) && Math.floor(r) === r;
    }, u.isString = function(r) {
      return typeof r == "string" || r instanceof String;
    }, u.isObject = function(r) {
      return r && typeof r == "object";
    }, u.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    u.isSet = function(r, o) {
      var i = r[o];
      return i != null && Object.hasOwnProperty.call(r, o) ? typeof i != "object" || (Array.isArray(i) ? i.length : Object.keys(i).length) > 0 : !1;
    }, u.Buffer = (function() {
      try {
        var r = u.global.Buffer;
        return r.prototype.utf8Write ? r : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    })(), u._Buffer_from = null, u._Buffer_allocUnsafe = null, u.newBuffer = function(r) {
      return typeof r == "number" ? u.Buffer ? u._Buffer_allocUnsafe(r) : new u.Array(r) : u.Buffer ? u._Buffer_from(r) : typeof Uint8Array > "u" ? r : new Uint8Array(r);
    }, u.Array = typeof Uint8Array < "u" ? Uint8Array : Array, u.Long = /* istanbul ignore next */
    u.global.dcodeIO && /* istanbul ignore next */
    u.global.dcodeIO.Long || /* istanbul ignore next */
    u.global.Long || (function() {
      try {
        var r = Yo();
        return r && r.isLong ? r : null;
      } catch {
        return null;
      }
    })(), u.key2Re = /^true|false|0|1$/, u.key32Re = /^-?(?:0|[1-9][0-9]*)$/, u.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, u.longToHash = function(r) {
      return r ? u.LongBits.from(r).toHash() : u.LongBits.zeroHash;
    }, u.longFromHash = function(r, o) {
      var i = u.LongBits.fromHash(r);
      return u.Long ? u.Long.fromBits(i.lo, i.hi, o) : i.toNumber(!!o);
    };
    function t(r) {
      var o = typeof arguments[arguments.length - 1] == "boolean", i = o ? arguments.length - 1 : arguments.length;
      o = o && arguments[arguments.length - 1];
      for (var d = 1; d < i; ++d) {
        var p = arguments[d];
        if (p)
          for (var O = Object.keys(p), C = 0; C < O.length; ++C)
            !n(O[C]) && (r[O[C]] === void 0 || !o) && (r[O[C]] = p[O[C]]);
      }
      return r;
    }
    u.merge = t, u.nestingLimit = 32, u.recursionLimit = 100, u.makeProp = function(r, o) {
      Object.defineProperty(r, o, {
        enumerable: !0,
        configurable: !0,
        writable: !0
      });
    }, u.lcFirst = function(r) {
      return r.charAt(0).toLowerCase() + r.substring(1);
    };
    function e(r) {
      function o(i, d) {
        if (!(this instanceof o))
          return new o(i, d);
        Object.defineProperty(this, "message", { get: function() {
          return i;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, o) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), d && t(this, d);
      }
      return o.prototype = Object.create(Error.prototype, {
        constructor: {
          value: o,
          writable: !0,
          enumerable: !1,
          configurable: !0
        },
        name: {
          get: function() {
            return r;
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
      }), o;
    }
    u.newError = e, u.ProtocolError = e("ProtocolError"), u.oneOfGetter = function(r) {
      for (var o = {}, i = 0; i < r.length; ++i)
        o[r[i]] = 1;
      return function() {
        for (var d = Object.keys(this), p = d.length - 1; p > -1; --p)
          if (o[d[p]] === 1 && this[d[p]] !== void 0 && this[d[p]] !== null)
            return d[p];
      };
    }, u.oneOfSetter = function(r) {
      return function(o) {
        for (var i = 0; i < r.length; ++i)
          r[i] !== o && delete this[r[i]];
      };
    }, u.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, u._configure = function() {
      var r = u.Buffer;
      if (!r) {
        u._Buffer_from = u._Buffer_allocUnsafe = null;
        return;
      }
      u._Buffer_from = r.from !== Uint8Array.from && r.from || /* istanbul ignore next */
      function(o, i) {
        return new r(o, i);
      }, u._Buffer_allocUnsafe = r.allocUnsafe || /* istanbul ignore next */
      function(o) {
        return new r(o);
      };
    };
  })(jn)), jn;
}
var Sn, Xn;
function bo() {
  if (Xn) return Sn;
  Xn = 1, Sn = d;
  var v = Ue(), u, n = v.LongBits, t = v.base64, e = v.utf8;
  function r(S, R, N) {
    this.fn = S, this.len = R, this.next = void 0, this.val = N;
  }
  function o() {
  }
  function i(S) {
    this.head = S.head, this.tail = S.tail, this.len = S.len, this.next = S.states;
  }
  function d() {
    this.len = 0, this.head = new r(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var p = function() {
    return v.Buffer ? function() {
      return (d.create = function() {
        return new u();
      })();
    } : function() {
      return new d();
    };
  };
  d.create = p(), d.alloc = function(S) {
    return new v.Array(S);
  }, v.Array !== Array && (d.alloc = v.pool(d.alloc, v.Array.prototype.subarray)), d.prototype._push = function(S, R, N) {
    return this.tail = this.tail.next = new r(S, R, N), this.len += R, this;
  };
  function O(S, R, N) {
    R[N] = S & 255;
  }
  function C(S, R, N) {
    for (; S > 127; )
      R[N++] = S & 127 | 128, S >>>= 7;
    R[N] = S;
  }
  function j(S, R) {
    this.len = S, this.next = void 0, this.val = R;
  }
  j.prototype = Object.create(r.prototype), j.prototype.fn = C, d.prototype.uint32 = function(S) {
    return this.len += (this.tail = this.tail.next = new j(
      (S = S >>> 0) < 128 ? 1 : S < 16384 ? 2 : S < 2097152 ? 3 : S < 268435456 ? 4 : 5,
      S
    )).len, this;
  }, d.prototype.int32 = function(S) {
    return (S |= 0) < 0 ? this._push(P, 10, n.fromNumber(S)) : this.uint32(S);
  }, d.prototype.sint32 = function(S) {
    return this.uint32((S << 1 ^ S >> 31) >>> 0);
  };
  function P(S, R, N) {
    for (var B = S.lo, J = S.hi; J; )
      R[N++] = B & 127 | 128, B = (B >>> 7 | J << 25) >>> 0, J >>>= 7;
    for (; B > 127; )
      R[N++] = B & 127 | 128, B = B >>> 7;
    R[N++] = B;
  }
  d.prototype.uint64 = function(S) {
    var R = n.from(S);
    return this._push(P, R.length(), R);
  }, d.prototype.int64 = d.prototype.uint64, d.prototype.sint64 = function(S) {
    var R = n.from(S).zzEncode();
    return this._push(P, R.length(), R);
  }, d.prototype.bool = function(S) {
    return this._push(O, 1, S ? 1 : 0);
  };
  function x(S, R, N) {
    R[N] = S & 255, R[N + 1] = S >>> 8 & 255, R[N + 2] = S >>> 16 & 255, R[N + 3] = S >>> 24;
  }
  d.prototype.fixed32 = function(S) {
    return this._push(x, 4, S >>> 0);
  }, d.prototype.sfixed32 = d.prototype.fixed32, d.prototype.fixed64 = function(S) {
    var R = n.from(S);
    return this._push(x, 4, R.lo)._push(x, 4, R.hi);
  }, d.prototype.sfixed64 = d.prototype.fixed64, d.prototype.float = function(S) {
    return this._push(v.float.writeFloatLE, 4, S);
  }, d.prototype.double = function(S) {
    return this._push(v.float.writeDoubleLE, 8, S);
  };
  var A = v.Array.prototype.set ? function(S, R, N) {
    R.set(S, N);
  } : function(S, R, N) {
    for (var B = 0; B < S.length; ++B)
      R[N + B] = S[B];
  };
  return d.prototype.bytes = function(S) {
    var R = S.length >>> 0;
    if (!R)
      return this._push(O, 1, 0);
    if (v.isString(S)) {
      var N = d.alloc(R = t.length(S));
      t.decode(S, N, 0), S = N;
    }
    return this.uint32(R)._push(A, R, S);
  }, d.prototype.string = function(S) {
    var R = e.length(S);
    return R ? this.uint32(R)._push(e.write, R, S) : this._push(O, 1, 0);
  }, d.prototype.fork = function() {
    return this.states = new i(this), this.head = this.tail = new r(o, 0, 0), this.len = 0, this;
  }, d.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new r(o, 0, 0), this.len = 0), this;
  }, d.prototype.ldelim = function() {
    var S = this.head, R = this.tail, N = this.len;
    return this.reset().uint32(N), N && (this.tail.next = S.next, this.tail = R, this.len += N), this;
  }, d.prototype.finish = function() {
    for (var S = this.head.next, R = this.constructor.alloc(this.len), N = 0; S; )
      S.fn(S.val, R, N), N += S.len, S = S.next;
    return R;
  }, d._configure = function(S) {
    u = S, d.create = p(), u._configure();
  }, Sn;
}
var _n, Qn;
function Jo() {
  if (Qn) return _n;
  Qn = 1, _n = n;
  var v = bo();
  (n.prototype = Object.create(v.prototype)).constructor = n;
  var u = Ue();
  function n() {
    v.call(this);
  }
  n._configure = function() {
    n.alloc = u._Buffer_allocUnsafe, n.writeBytesBuffer = u.Buffer && u.Buffer.prototype instanceof Uint8Array && u.Buffer.prototype.set.name === "set" ? function(e, r, o) {
      r.set(e, o);
    } : function(e, r, o) {
      if (e.copy)
        e.copy(r, o, 0, e.length);
      else for (var i = 0; i < e.length; )
        r[o++] = e[i++];
    };
  }, n.prototype.bytes = function(e) {
    u.isString(e) && (e = u._Buffer_from(e, "base64"));
    var r = e.length >>> 0;
    return this.uint32(r), r && this._push(n.writeBytesBuffer, r, e), this;
  };
  function t(e, r, o) {
    e.length < 40 ? u.utf8.write(e, r, o) : r.utf8Write ? r.utf8Write(e, o) : r.write(e, o);
  }
  return n.prototype.string = function(e) {
    var r = u.Buffer.byteLength(e);
    return this.uint32(r), r && this._push(t, r, e), this;
  }, n._configure(), _n;
}
var Tn, eo;
function vo() {
  if (eo) return Tn;
  eo = 1, Tn = r;
  var v = Ue(), u, n = v.LongBits, t = v.utf8;
  function e(j, P) {
    return RangeError("index out of range: " + j.pos + " + " + (P || 1) + " > " + j.len);
  }
  function r(j) {
    this.buf = j, this.pos = 0, this.len = j.length;
  }
  var o = typeof Uint8Array < "u" ? function(j) {
    if (j instanceof Uint8Array || Array.isArray(j))
      return new r(j);
    throw Error("illegal buffer");
  } : function(j) {
    if (Array.isArray(j))
      return new r(j);
    throw Error("illegal buffer");
  }, i = function() {
    return v.Buffer ? function(j) {
      return (r.create = function(P) {
        return v.Buffer.isBuffer(P) ? new u(P) : o(P);
      })(j);
    } : o;
  };
  r.create = i(), r.prototype._slice = v.Array.prototype.subarray || /* istanbul ignore next */
  v.Array.prototype.slice;
  function d(j) {
    for (var P = 0, x = 0; x < 4; ++x) {
      if (j.pos >= j.len)
        throw e(j);
      var A = j.buf[j.pos++];
      if (P = (P | (A & 127) << x * 7) >>> 0, A < 128)
        return P;
    }
    throw e(j);
  }
  r.prototype.uint32 = /* @__PURE__ */ (function() {
    var j = 4294967295;
    return function() {
      if (this.len - this.pos < 5) {
        if (this.pos >= this.len)
          throw e(this);
        if (this.buf[this.pos] >= 128)
          return d(this);
      }
      if (j = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (j = (j | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (j = (j | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (j = (j | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (j = (j | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return j;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return j;
    };
  })(), r.prototype.int32 = function() {
    return this.uint32() | 0;
  }, r.prototype.sint32 = function() {
    var j = this.uint32();
    return j >>> 1 ^ -(j & 1) | 0;
  };
  function p() {
    var j = new n(0, 0), P = 0;
    if (this.len - this.pos > 4) {
      for (; P < 4; ++P)
        if (j.lo = (j.lo | (this.buf[this.pos] & 127) << P * 7) >>> 0, this.buf[this.pos++] < 128)
          return j;
      if (j.lo = (j.lo | (this.buf[this.pos] & 127) << 28) >>> 0, j.hi = (j.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return j;
      P = 0;
    } else {
      for (; P < 3; ++P) {
        if (this.pos >= this.len)
          throw e(this);
        if (j.lo = (j.lo | (this.buf[this.pos] & 127) << P * 7) >>> 0, this.buf[this.pos++] < 128)
          return j;
      }
      return j.lo = (j.lo | (this.buf[this.pos++] & 127) << P * 7) >>> 0, j;
    }
    if (this.len - this.pos > 4) {
      for (; P < 5; ++P)
        if (j.hi = (j.hi | (this.buf[this.pos] & 127) << P * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return j;
    } else
      for (; P < 5; ++P) {
        if (this.pos >= this.len)
          throw e(this);
        if (j.hi = (j.hi | (this.buf[this.pos] & 127) << P * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return j;
      }
    throw Error("invalid varint encoding");
  }
  r.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function O(j, P) {
    return (j[P - 4] | j[P - 3] << 8 | j[P - 2] << 16 | j[P - 1] << 24) >>> 0;
  }
  r.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return O(this.buf, this.pos += 4);
  }, r.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return O(this.buf, this.pos += 4) | 0;
  };
  function C() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new n(O(this.buf, this.pos += 4), O(this.buf, this.pos += 4));
  }
  return r.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var j = v.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, j;
  }, r.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var j = v.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, j;
  }, r.prototype.bytes = function() {
    var j = this.uint32(), P = this.pos, x = this.pos + j;
    if (x > this.len)
      throw e(this, j);
    if (this.pos += j, Array.isArray(this.buf))
      return this.buf.slice(P, x);
    if (P === x) {
      var A = v.Buffer;
      return A ? A.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, P, x);
  }, r.prototype.string = function() {
    var j = this.bytes();
    return t.read(j, 0, j.length);
  }, r.prototype.skip = function(j) {
    if (typeof j == "number") {
      if (this.pos + j > this.len)
        throw e(this, j);
      this.pos += j;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, r.recursionLimit = v.recursionLimit, r.prototype.skipType = function(j, P) {
    if (P === void 0 && (P = 0), P > r.recursionLimit)
      throw Error("maximum nesting depth exceeded");
    switch (j) {
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
        for (; (j = this.uint32() & 7) !== 4; )
          this.skipType(j, P + 1);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + j + " at offset " + this.pos);
    }
    return this;
  }, r._configure = function(j) {
    u = j, r.create = i(), u._configure();
    var P = v.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    v.merge(r.prototype, {
      int64: function() {
        return p.call(this)[P](!1);
      },
      uint64: function() {
        return p.call(this)[P](!0);
      },
      sint64: function() {
        return p.call(this).zzDecode()[P](!1);
      },
      fixed64: function() {
        return C.call(this)[P](!0);
      },
      sfixed64: function() {
        return C.call(this)[P](!1);
      }
    });
  }, Tn;
}
var kn, to;
function qo() {
  if (to) return kn;
  to = 1, kn = n;
  var v = vo();
  (n.prototype = Object.create(v.prototype)).constructor = n;
  var u = Ue();
  function n(t) {
    v.call(this, t);
  }
  return n._configure = function() {
    u.Buffer && (n.prototype._slice = u.Buffer.prototype.slice);
  }, n.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, n._configure(), kn;
}
var ro = {}, Ln, no;
function Zo() {
  if (no) return Ln;
  no = 1, Ln = u;
  var v = Ue();
  (u.prototype = Object.create(v.EventEmitter.prototype)).constructor = u;
  function u(n, t, e) {
    if (typeof n != "function")
      throw TypeError("rpcImpl must be a function");
    v.EventEmitter.call(this), this.rpcImpl = n, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return u.prototype.rpcCall = function n(t, e, r, o, i) {
    if (!o)
      throw TypeError("request must be specified");
    var d = this;
    if (!i)
      return v.asPromise(n, d, t, e, r, o);
    if (!d.rpcImpl) {
      setTimeout(function() {
        i(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return d.rpcImpl(
        t,
        e[d.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(p, O) {
          if (p)
            return d.emit("error", p, t), i(p);
          if (O === null) {
            d.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(O instanceof r))
            try {
              O = r[d.responseDelimited ? "decodeDelimited" : "decode"](O);
            } catch (C) {
              return d.emit("error", C, t), i(C);
            }
          return d.emit("data", O, t), i(null, O);
        }
      );
    } catch (p) {
      d.emit("error", p, t), setTimeout(function() {
        i(p);
      }, 0);
      return;
    }
  }, u.prototype.end = function(n) {
    return this.rpcImpl && (n || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, Ln;
}
var oo;
function Ko() {
  return oo || (oo = 1, (function(v) {
    var u = v;
    u.Service = Zo();
  })(ro)), ro;
}
var io, ao;
function Xo() {
  return ao || (ao = 1, io = /* @__PURE__ */ Object.create(null)), io;
}
var so;
function Qo() {
  return so || (so = 1, (function(v) {
    var u = v;
    u.build = "minimal", u.Writer = bo(), u.BufferWriter = Jo(), u.Reader = vo(), u.BufferReader = qo(), u.util = Ue(), u.rpc = Ko(), u.roots = Xo(), u.configure = n;
    function n() {
      u.util._configure(), u.Writer._configure(u.BufferWriter), u.Reader._configure(u.BufferReader);
    }
    n();
  })($n)), $n;
}
var lo, co;
function ei() {
  return co || (co = 1, lo = Qo()), lo;
}
var D = ei();
D.util.Buffer = null;
D.configure();
const h = D.Reader, F = D.Writer, l = D.util, c = D.roots.default || (D.roots.default = {});
c.dot = (() => {
  const v = {};
  return v.Content = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.token = l.newBuffer([]), u.prototype.iv = l.newBuffer([]), u.prototype.schemaVersion = 0, u.prototype.bytes = l.newBuffer([]), u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.token != null && Object.hasOwnProperty.call(n, "token") && t.uint32(
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
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.Content(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.token = n.bytes();
            break;
          }
          case 2: {
            i.iv = n.bytes();
            break;
          }
          case 3: {
            i.schemaVersion = n.int32();
            break;
          }
          case 4: {
            i.bytes = n.bytes();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.token != null && Object.hasOwnProperty.call(n, "token") && !(n.token && typeof n.token.length == "number" || l.isString(n.token)) ? "token: buffer expected" : n.iv != null && Object.hasOwnProperty.call(n, "iv") && !(n.iv && typeof n.iv.length == "number" || l.isString(n.iv)) ? "iv: buffer expected" : n.schemaVersion != null && Object.hasOwnProperty.call(n, "schemaVersion") && !l.isInteger(n.schemaVersion) ? "schemaVersion: integer expected" : n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && !(n.bytes && typeof n.bytes.length == "number" || l.isString(n.bytes)) ? "bytes: buffer expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.Content)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.Content: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.Content();
      return n.token != null && (typeof n.token == "string" ? l.base64.decode(n.token, e.token = l.newBuffer(l.base64.length(n.token)), 0) : n.token.length >= 0 && (e.token = n.token)), n.iv != null && (typeof n.iv == "string" ? l.base64.decode(n.iv, e.iv = l.newBuffer(l.base64.length(n.iv)), 0) : n.iv.length >= 0 && (e.iv = n.iv)), n.schemaVersion != null && (e.schemaVersion = n.schemaVersion | 0), n.bytes != null && (typeof n.bytes == "string" ? l.base64.decode(n.bytes, e.bytes = l.newBuffer(l.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (e.bytes = n.bytes)), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (t.bytes === String ? r.token = "" : (r.token = [], t.bytes !== Array && (r.token = l.newBuffer(r.token))), t.bytes === String ? r.iv = "" : (r.iv = [], t.bytes !== Array && (r.iv = l.newBuffer(r.iv))), r.schemaVersion = 0, t.bytes === String ? r.bytes = "" : (r.bytes = [], t.bytes !== Array && (r.bytes = l.newBuffer(r.bytes)))), n.token != null && Object.hasOwnProperty.call(n, "token") && (r.token = t.bytes === String ? l.base64.encode(n.token, 0, n.token.length) : t.bytes === Array ? Array.prototype.slice.call(n.token) : n.token), n.iv != null && Object.hasOwnProperty.call(n, "iv") && (r.iv = t.bytes === String ? l.base64.encode(n.iv, 0, n.iv.length) : t.bytes === Array ? Array.prototype.slice.call(n.iv) : n.iv), n.schemaVersion != null && Object.hasOwnProperty.call(n, "schemaVersion") && (r.schemaVersion = n.schemaVersion), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && (r.bytes = t.bytes === String ? l.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Content";
    }, u;
  })(), v.v4 = (function() {
    const u = {};
    return u.MagnifEyeLivenessContent = (function() {
      function n(e) {
        if (this.images = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.images = l.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.images != null && e.images.length)
          for (let i = 0; i < e.images.length; ++i)
            c.dot.Image.encode(e.images[i], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork(), o + 1).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.MagnifEyeLivenessContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.images && p.images.length || (p.images = []), p.images.push(c.dot.Image.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 3: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.images != null && Object.hasOwnProperty.call(e, "images")) {
          if (!Array.isArray(e.images))
            return "images: array expected";
          for (let o = 0; o < e.images.length; ++o) {
            let i = c.dot.Image.verify(e.images[o], r + 1);
            if (i)
              return "images." + i;
          }
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.MagnifEyeLivenessContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.MagnifEyeLivenessContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.MagnifEyeLivenessContent();
        if (e.images) {
          if (!Array.isArray(e.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          o.images = [];
          for (let i = 0; i < e.images.length; ++i) {
            if (!l.isObject(e.images[i]))
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            o.images[i] = c.dot.Image.fromObject(e.images[i], r + 1);
          }
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        if ((r.arrays || r.defaults) && (i.images = []), r.defaults && (i.metadata = null), e.images && e.images.length) {
          i.images = [];
          for (let d = 0; d < e.images.length; ++d)
            i.images[d] = c.dot.Image.toObject(e.images[d], r, o + 1);
        }
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MagnifEyeLivenessContent";
      }, n;
    })(), u.Metadata = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.platform = 0, n.prototype.sessionToken = null, n.prototype.componentVersion = "", n.prototype.web = null, n.prototype.android = null, n.prototype.ios = null;
      let t;
      return Object.defineProperty(n.prototype, "_sessionToken", {
        get: l.oneOfGetter(t = ["sessionToken"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "metadata", {
        get: l.oneOfGetter(t = ["web", "android", "ios"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.platform != null && Object.hasOwnProperty.call(e, "platform") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && c.dot.v4.WebMetadata.encode(e.web, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && c.dot.v4.AndroidMetadata.encode(e.android, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && c.dot.v4.IosMetadata.encode(e.ios, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), e.sessionToken != null && Object.hasOwnProperty.call(e, "sessionToken") && r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).string(e.sessionToken), e.componentVersion != null && Object.hasOwnProperty.call(e, "componentVersion") && r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).string(e.componentVersion), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.Metadata(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.platform = e.int32();
              break;
            }
            case 5: {
              p.sessionToken = e.string();
              break;
            }
            case 6: {
              p.componentVersion = e.string();
              break;
            }
            case 2: {
              p.web = c.dot.v4.WebMetadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.android = c.dot.v4.AndroidMetadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.ios = c.dot.v4.IosMetadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        let o = {};
        if (e.platform != null && Object.hasOwnProperty.call(e, "platform"))
          switch (e.platform) {
            default:
              return "platform: enum value expected";
            case 0:
            case 1:
            case 2:
              break;
          }
        if (e.sessionToken != null && Object.hasOwnProperty.call(e, "sessionToken") && (o._sessionToken = 1, !l.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && Object.hasOwnProperty.call(e, "componentVersion") && !l.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && Object.hasOwnProperty.call(e, "web")) {
          o.metadata = 1;
          {
            let i = c.dot.v4.WebMetadata.verify(e.web, r + 1);
            if (i)
              return "web." + i;
          }
        }
        if (e.android != null && Object.hasOwnProperty.call(e, "android")) {
          if (o.metadata === 1)
            return "metadata: multiple values";
          o.metadata = 1;
          {
            let i = c.dot.v4.AndroidMetadata.verify(e.android, r + 1);
            if (i)
              return "android." + i;
          }
        }
        if (e.ios != null && Object.hasOwnProperty.call(e, "ios")) {
          if (o.metadata === 1)
            return "metadata: multiple values";
          o.metadata = 1;
          {
            let i = c.dot.v4.IosMetadata.verify(e.ios, r + 1);
            if (i)
              return "ios." + i;
          }
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.Metadata)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.Metadata: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.Metadata();
        switch (e.platform) {
          default:
            if (typeof e.platform == "number") {
              o.platform = e.platform;
              break;
            }
            break;
          case "WEB":
          case 0:
            o.platform = 0;
            break;
          case "ANDROID":
          case 1:
            o.platform = 1;
            break;
          case "IOS":
          case 2:
            o.platform = 2;
            break;
        }
        if (e.sessionToken != null && (o.sessionToken = String(e.sessionToken)), e.componentVersion != null && (o.componentVersion = String(e.componentVersion)), e.web != null) {
          if (!l.isObject(e.web))
            throw TypeError(".dot.v4.Metadata.web: object expected");
          o.web = c.dot.v4.WebMetadata.fromObject(e.web, r + 1);
        }
        if (e.android != null) {
          if (!l.isObject(e.android))
            throw TypeError(".dot.v4.Metadata.android: object expected");
          o.android = c.dot.v4.AndroidMetadata.fromObject(e.android, r + 1);
        }
        if (e.ios != null) {
          if (!l.isObject(e.ios))
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          o.ios = c.dot.v4.IosMetadata.fromObject(e.ios, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.platform = r.enums === String ? "WEB" : 0, i.componentVersion = ""), e.platform != null && Object.hasOwnProperty.call(e, "platform") && (i.platform = r.enums === String ? c.dot.Platform[e.platform] === void 0 ? e.platform : c.dot.Platform[e.platform] : e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && (i.web = c.dot.v4.WebMetadata.toObject(e.web, r, o + 1), r.oneofs && (i.metadata = "web")), e.android != null && Object.hasOwnProperty.call(e, "android") && (i.android = c.dot.v4.AndroidMetadata.toObject(e.android, r, o + 1), r.oneofs && (i.metadata = "android")), e.ios != null && Object.hasOwnProperty.call(e, "ios") && (i.ios = c.dot.v4.IosMetadata.toObject(e.ios, r, o + 1), r.oneofs && (i.metadata = "ios")), e.sessionToken != null && Object.hasOwnProperty.call(e, "sessionToken") && (i.sessionToken = e.sessionToken, r.oneofs && (i._sessionToken = "sessionToken")), e.componentVersion != null && Object.hasOwnProperty.call(e, "componentVersion") && (i.componentVersion = e.componentVersion), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, n;
    })(), u.AndroidMetadata = (function() {
      function n(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.supportedAbis = l.emptyArray, n.prototype.device = null, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = l.emptyArray, n.prototype.digestsWithTimestamp = l.emptyArray, n.prototype.dynamicCameraFrameProperties = l.emptyObject, n.prototype.tamperingIndicators = null, n.prototype.croppedYuv420Image = null, n.prototype.yuv420ImageCrop = null, n.prototype.androidId = null;
      let t;
      return Object.defineProperty(n.prototype, "_device", {
        get: l.oneOfGetter(t = ["device"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_camera", {
        get: l.oneOfGetter(t = ["camera"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: l.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_tamperingIndicators", {
        get: l.oneOfGetter(t = ["tamperingIndicators"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: l.oneOfGetter(t = ["croppedYuv420Image"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_yuv420ImageCrop", {
        get: l.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_androidId", {
        get: l.oneOfGetter(t = ["androidId"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.supportedAbis != null && e.supportedAbis.length)
          for (let i = 0; i < e.supportedAbis.length; ++i)
            r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(e.supportedAbis[i]);
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(e.device), e.digests != null && e.digests.length)
          for (let i = 0; i < e.digests.length; ++i)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[i]);
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties"))
          for (let i = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < i.length; ++d)
            r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(i[d]), c.dot.Int32List.encode(e.dynamicCameraFrameProperties[i[d]], r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork(), o + 1).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let i = 0; i < e.digestsWithTimestamp.length; ++i)
            c.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[i], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork(), o + 1).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && c.dot.v4.AndroidCamera.encode(e.camera, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork(), o + 1).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && c.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork(), o + 1).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && c.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork(), o + 1).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && c.dot.v4.Yuv420ImageCrop.encode(e.yuv420ImageCrop, r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork(), o + 1).ldelim(), e.androidId != null && Object.hasOwnProperty.call(e, "androidId") && r.uint32(
          /* id 11, wireType 2 =*/
          90
        ).string(e.androidId), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p, O, C;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.AndroidMetadata(); e.pos < d; ) {
          let j = e.uint32();
          if (j === o)
            break;
          switch (j >>> 3) {
            case 1: {
              p.supportedAbis && p.supportedAbis.length || (p.supportedAbis = []), p.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              p.device = e.string();
              break;
            }
            case 6: {
              p.camera = c.dot.v4.AndroidCamera.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 7: {
              p.detectionNormalizedRectangle = c.dot.RectangleDouble.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.digests && p.digests.length || (p.digests = []), p.digests.push(e.bytes());
              break;
            }
            case 5: {
              p.digestsWithTimestamp && p.digestsWithTimestamp.length || (p.digestsWithTimestamp = []), p.digestsWithTimestamp.push(c.dot.DigestWithTimestamp.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 4: {
              p.dynamicCameraFrameProperties === l.emptyObject && (p.dynamicCameraFrameProperties = {});
              let P = e.uint32() + e.pos;
              if (P > e.len)
                throw RangeError("index out of range");
              for (e.len = P, O = "", C = null; e.pos < P; ) {
                let x = e.uint32();
                switch (x >>> 3) {
                  case 1:
                    O = e.string();
                    break;
                  case 2:
                    C = c.dot.Int32List.decode(e, e.uint32(), void 0, i + 1);
                    break;
                  default:
                    e.skipType(x & 7, i);
                    break;
                }
              }
              if (e.pos !== P)
                throw RangeError("index out of range");
              e.len = d, O === "__proto__" && l.makeProp(p.dynamicCameraFrameProperties, O), p.dynamicCameraFrameProperties[O] = C;
              break;
            }
            case 8: {
              p.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              p.croppedYuv420Image = c.dot.v4.Yuv420Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 10: {
              p.yuv420ImageCrop = c.dot.v4.Yuv420ImageCrop.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 11: {
              p.androidId = e.string();
              break;
            }
            default:
              e.skipType(j & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.supportedAbis != null && Object.hasOwnProperty.call(e, "supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let o = 0; o < e.supportedAbis.length; ++o)
            if (!l.isString(e.supportedAbis[o]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && !l.isString(e.device))
          return "device: string expected";
        if (e.camera != null && Object.hasOwnProperty.call(e, "camera")) {
          let o = c.dot.v4.AndroidCamera.verify(e.camera, r + 1);
          if (o)
            return "camera." + o;
        }
        if (e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle")) {
          let o = c.dot.RectangleDouble.verify(e.detectionNormalizedRectangle, r + 1);
          if (o)
            return "detectionNormalizedRectangle." + o;
        }
        if (e.digests != null && Object.hasOwnProperty.call(e, "digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let o = 0; o < e.digests.length; ++o)
            if (!(e.digests[o] && typeof e.digests[o].length == "number" || l.isString(e.digests[o])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && Object.hasOwnProperty.call(e, "digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            let i = c.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[o], r + 1);
            if (i)
              return "digestsWithTimestamp." + i;
          }
        }
        if (e.dynamicCameraFrameProperties != null && Object.hasOwnProperty.call(e, "dynamicCameraFrameProperties")) {
          if (!l.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let o = Object.keys(e.dynamicCameraFrameProperties);
          for (let i = 0; i < o.length; ++i) {
            let d = c.dot.Int32List.verify(e.dynamicCameraFrameProperties[o[i]], r + 1);
            if (d)
              return "dynamicCameraFrameProperties." + d;
          }
        }
        if (e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || l.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image")) {
          let o = c.dot.v4.Yuv420Image.verify(e.croppedYuv420Image, r + 1);
          if (o)
            return "croppedYuv420Image." + o;
        }
        if (e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop")) {
          let o = c.dot.v4.Yuv420ImageCrop.verify(e.yuv420ImageCrop, r + 1);
          if (o)
            return "yuv420ImageCrop." + o;
        }
        return e.androidId != null && Object.hasOwnProperty.call(e, "androidId") && !l.isString(e.androidId) ? "androidId: string expected" : null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.AndroidMetadata)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.AndroidMetadata: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.AndroidMetadata();
        if (e.supportedAbis) {
          if (!Array.isArray(e.supportedAbis))
            throw TypeError(".dot.v4.AndroidMetadata.supportedAbis: array expected");
          o.supportedAbis = [];
          for (let i = 0; i < e.supportedAbis.length; ++i)
            o.supportedAbis[i] = String(e.supportedAbis[i]);
        }
        if (e.device != null && (o.device = String(e.device)), e.camera != null) {
          if (!l.isObject(e.camera))
            throw TypeError(".dot.v4.AndroidMetadata.camera: object expected");
          o.camera = c.dot.v4.AndroidCamera.fromObject(e.camera, r + 1);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (!l.isObject(e.detectionNormalizedRectangle))
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          o.detectionNormalizedRectangle = c.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle, r + 1);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          o.digests = [];
          for (let i = 0; i < e.digests.length; ++i)
            typeof e.digests[i] == "string" ? l.base64.decode(e.digests[i], o.digests[i] = l.newBuffer(l.base64.length(e.digests[i])), 0) : e.digests[i].length >= 0 && (o.digests[i] = e.digests[i]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          o.digestsWithTimestamp = [];
          for (let i = 0; i < e.digestsWithTimestamp.length; ++i) {
            if (!l.isObject(e.digestsWithTimestamp[i]))
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            o.digestsWithTimestamp[i] = c.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[i], r + 1);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (!l.isObject(e.dynamicCameraFrameProperties))
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          o.dynamicCameraFrameProperties = {};
          for (let i = Object.keys(e.dynamicCameraFrameProperties), d = 0; d < i.length; ++d) {
            if (i[d] === "__proto__" && l.makeProp(o.dynamicCameraFrameProperties, i[d]), !l.isObject(e.dynamicCameraFrameProperties[i[d]]))
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            o.dynamicCameraFrameProperties[i[d]] = c.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[i[d]], r + 1);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? l.base64.decode(e.tamperingIndicators, o.tamperingIndicators = l.newBuffer(l.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (o.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (!l.isObject(e.croppedYuv420Image))
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          o.croppedYuv420Image = c.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image, r + 1);
        }
        if (e.yuv420ImageCrop != null) {
          if (!l.isObject(e.yuv420ImageCrop))
            throw TypeError(".dot.v4.AndroidMetadata.yuv420ImageCrop: object expected");
          o.yuv420ImageCrop = c.dot.v4.Yuv420ImageCrop.fromObject(e.yuv420ImageCrop, r + 1);
        }
        return e.androidId != null && (o.androidId = String(e.androidId)), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        if ((r.arrays || r.defaults) && (i.supportedAbis = [], i.digests = [], i.digestsWithTimestamp = []), (r.objects || r.defaults) && (i.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          i.supportedAbis = [];
          for (let p = 0; p < e.supportedAbis.length; ++p)
            i.supportedAbis[p] = e.supportedAbis[p];
        }
        if (e.device != null && Object.hasOwnProperty.call(e, "device") && (i.device = e.device, r.oneofs && (i._device = "device")), e.digests && e.digests.length) {
          i.digests = [];
          for (let p = 0; p < e.digests.length; ++p)
            i.digests[p] = r.bytes === String ? l.base64.encode(e.digests[p], 0, e.digests[p].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[p]) : e.digests[p];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          i.dynamicCameraFrameProperties = {};
          for (let p = 0; p < d.length; ++p)
            d[p] === "__proto__" && l.makeProp(i.dynamicCameraFrameProperties, d[p]), i.dynamicCameraFrameProperties[d[p]] = c.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[p]], r, o + 1);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          i.digestsWithTimestamp = [];
          for (let p = 0; p < e.digestsWithTimestamp.length; ++p)
            i.digestsWithTimestamp[p] = c.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[p], r, o + 1);
        }
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && (i.camera = c.dot.v4.AndroidCamera.toObject(e.camera, r, o + 1), r.oneofs && (i._camera = "camera")), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && (i.detectionNormalizedRectangle = c.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r, o + 1), r.oneofs && (i._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && (i.tamperingIndicators = r.bytes === String ? l.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : r.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, r.oneofs && (i._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && (i.croppedYuv420Image = c.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, r, o + 1), r.oneofs && (i._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && (i.yuv420ImageCrop = c.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, r, o + 1), r.oneofs && (i._yuv420ImageCrop = "yuv420ImageCrop")), e.androidId != null && Object.hasOwnProperty.call(e, "androidId") && (i.androidId = e.androidId, r.oneofs && (i._androidId = "androidId")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, n;
    })(), u.AndroidCamera = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.resolution = null, n.prototype.rotationDegrees = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && c.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.AndroidCamera(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.resolution = c.dot.ImageSize.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.resolution != null && Object.hasOwnProperty.call(t, "resolution")) {
          let r = c.dot.ImageSize.verify(t.resolution, e + 1);
          if (r)
            return "resolution." + r;
        }
        return t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && !l.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.AndroidCamera)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.AndroidCamera: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (!l.isObject(t.resolution))
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          r.resolution = c.dot.ImageSize.fromObject(t.resolution, e + 1);
        }
        return t.rotationDegrees != null && (r.rotationDegrees = t.rotationDegrees | 0), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.resolution = null, o.rotationDegrees = 0), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && (o.resolution = c.dot.ImageSize.toObject(t.resolution, e, r + 1)), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && (o.rotationDegrees = t.rotationDegrees), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, n;
    })(), u.Yuv420Image = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = l.newBuffer([]), n.prototype.uPlane = l.newBuffer([]), n.prototype.vPlane = l.newBuffer([]), n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.size != null && Object.hasOwnProperty.call(t, "size") && c.dot.ImageSize.encode(t.size, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && e.uint32(
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
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.Yuv420Image(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.size = c.dot.ImageSize.decode(t, t.uint32(), void 0, o + 1);
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
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.size != null && Object.hasOwnProperty.call(t, "size")) {
          let r = c.dot.ImageSize.verify(t.size, e + 1);
          if (r)
            return "size." + r;
        }
        return t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || l.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && Object.hasOwnProperty.call(t, "uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || l.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && Object.hasOwnProperty.call(t, "vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || l.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.Yuv420Image)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.Yuv420Image: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (!l.isObject(t.size))
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          r.size = c.dot.ImageSize.fromObject(t.size, e + 1);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? l.base64.decode(t.yPlane, r.yPlane = l.newBuffer(l.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (r.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? l.base64.decode(t.uPlane, r.uPlane = l.newBuffer(l.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (r.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? l.base64.decode(t.vPlane, r.vPlane = l.newBuffer(l.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (r.vPlane = t.vPlane)), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.size = null, e.bytes === String ? o.yPlane = "" : (o.yPlane = [], e.bytes !== Array && (o.yPlane = l.newBuffer(o.yPlane))), e.bytes === String ? o.uPlane = "" : (o.uPlane = [], e.bytes !== Array && (o.uPlane = l.newBuffer(o.uPlane))), e.bytes === String ? o.vPlane = "" : (o.vPlane = [], e.bytes !== Array && (o.vPlane = l.newBuffer(o.vPlane)))), t.size != null && Object.hasOwnProperty.call(t, "size") && (o.size = c.dot.ImageSize.toObject(t.size, e, r + 1)), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && (o.yPlane = e.bytes === String ? l.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && Object.hasOwnProperty.call(t, "uPlane") && (o.uPlane = e.bytes === String ? l.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && Object.hasOwnProperty.call(t, "vPlane") && (o.vPlane = e.bytes === String ? l.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, n;
    })(), u.Yuv420ImageCrop = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.v4.Yuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && c.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.Yuv420ImageCrop(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.image = c.dot.v4.Yuv420Image.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.topLeftCorner = c.dot.PointInt.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.image != null && Object.hasOwnProperty.call(t, "image")) {
          let r = c.dot.v4.Yuv420Image.verify(t.image, e + 1);
          if (r)
            return "image." + r;
        }
        if (t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner")) {
          let r = c.dot.PointInt.verify(t.topLeftCorner, e + 1);
          if (r)
            return "topLeftCorner." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.Yuv420ImageCrop)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.Yuv420ImageCrop: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.Yuv420ImageCrop();
        if (t.image != null) {
          if (!l.isObject(t.image))
            throw TypeError(".dot.v4.Yuv420ImageCrop.image: object expected");
          r.image = c.dot.v4.Yuv420Image.fromObject(t.image, e + 1);
        }
        if (t.topLeftCorner != null) {
          if (!l.isObject(t.topLeftCorner))
            throw TypeError(".dot.v4.Yuv420ImageCrop.topLeftCorner: object expected");
          r.topLeftCorner = c.dot.PointInt.fromObject(t.topLeftCorner, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.image = null, o.topLeftCorner = null), t.image != null && Object.hasOwnProperty.call(t, "image") && (o.image = c.dot.v4.Yuv420Image.toObject(t.image, e, r + 1)), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && (o.topLeftCorner = c.dot.PointInt.toObject(t.topLeftCorner, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420ImageCrop";
      }, n;
    })(), u.IosMetadata = (function() {
      function n(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.cameraModelId = "", n.prototype.architectureInfo = l.emptyObject, n.prototype.camera = null, n.prototype.detectionNormalizedRectangle = null, n.prototype.digests = l.emptyArray, n.prototype.digestsWithTimestamp = l.emptyArray, n.prototype.isoValues = l.emptyArray, n.prototype.croppedYuv420Image = null, n.prototype.yuv420ImageCrop = null, n.prototype.identifierForVendor = null, n.prototype.tamperingIndicators = null;
      let t;
      return Object.defineProperty(n.prototype, "_camera", {
        get: l.oneOfGetter(t = ["camera"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_detectionNormalizedRectangle", {
        get: l.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedYuv420Image", {
        get: l.oneOfGetter(t = ["croppedYuv420Image"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_yuv420ImageCrop", {
        get: l.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_identifierForVendor", {
        get: l.oneOfGetter(t = ["identifierForVendor"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_tamperingIndicators", {
        get: l.oneOfGetter(t = ["tamperingIndicators"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let i = Object.keys(e.architectureInfo), d = 0; d < i.length; ++d)
            r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(i[d]).uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(e.architectureInfo[i[d]]).ldelim();
        if (e.digests != null && e.digests.length)
          for (let i = 0; i < e.digests.length; ++i)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).bytes(e.digests[i]);
        if (e.isoValues != null && e.isoValues.length) {
          r.uint32(
            /* id 4, wireType 2 =*/
            34
          ).fork();
          for (let i = 0; i < e.isoValues.length; ++i)
            r.int32(e.isoValues[i]);
          r.ldelim();
        }
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let i = 0; i < e.digestsWithTimestamp.length; ++i)
            c.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[i], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork(), o + 1).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && c.dot.v4.IosCamera.encode(e.camera, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork(), o + 1).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && c.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork(), o + 1).ldelim(), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && c.dot.v4.IosYuv420Image.encode(e.croppedYuv420Image, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork(), o + 1).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && c.dot.v4.IosYuv420ImageCrop.encode(e.yuv420ImageCrop, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork(), o + 1).ldelim(), e.identifierForVendor != null && Object.hasOwnProperty.call(e, "identifierForVendor") && r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).string(e.identifierForVendor), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && r.uint32(
          /* id 11, wireType 2 =*/
          90
        ).bytes(e.tamperingIndicators), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p, O, C;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.IosMetadata(); e.pos < d; ) {
          let j = e.uint32();
          if (j === o)
            break;
          switch (j >>> 3) {
            case 1: {
              p.cameraModelId = e.string();
              break;
            }
            case 2: {
              p.architectureInfo === l.emptyObject && (p.architectureInfo = {});
              let P = e.uint32() + e.pos;
              if (P > e.len)
                throw RangeError("index out of range");
              for (e.len = P, O = "", C = !1; e.pos < P; ) {
                let x = e.uint32();
                switch (x >>> 3) {
                  case 1:
                    O = e.string();
                    break;
                  case 2:
                    C = e.bool();
                    break;
                  default:
                    e.skipType(x & 7, i);
                    break;
                }
              }
              if (e.pos !== P)
                throw RangeError("index out of range");
              e.len = d, O === "__proto__" && l.makeProp(p.architectureInfo, O), p.architectureInfo[O] = C;
              break;
            }
            case 6: {
              p.camera = c.dot.v4.IosCamera.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 7: {
              p.detectionNormalizedRectangle = c.dot.RectangleDouble.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.digests && p.digests.length || (p.digests = []), p.digests.push(e.bytes());
              break;
            }
            case 5: {
              p.digestsWithTimestamp && p.digestsWithTimestamp.length || (p.digestsWithTimestamp = []), p.digestsWithTimestamp.push(c.dot.DigestWithTimestamp.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 4: {
              if (p.isoValues && p.isoValues.length || (p.isoValues = []), (j & 7) === 2) {
                let P = e.uint32() + e.pos;
                if (P > e.len)
                  throw RangeError("index out of range");
                for (e.len = P; e.pos < P; )
                  p.isoValues.push(e.int32());
                if (e.pos !== P)
                  throw RangeError("index out of range");
                e.len = d;
              } else
                p.isoValues.push(e.int32());
              break;
            }
            case 8: {
              p.croppedYuv420Image = c.dot.v4.IosYuv420Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 9: {
              p.yuv420ImageCrop = c.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 10: {
              p.identifierForVendor = e.string();
              break;
            }
            case 11: {
              p.tamperingIndicators = e.bytes();
              break;
            }
            default:
              e.skipType(j & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && !l.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo")) {
          if (!l.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let o = Object.keys(e.architectureInfo);
          for (let i = 0; i < o.length; ++i)
            if (typeof e.architectureInfo[o[i]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && Object.hasOwnProperty.call(e, "camera")) {
          let o = c.dot.v4.IosCamera.verify(e.camera, r + 1);
          if (o)
            return "camera." + o;
        }
        if (e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle")) {
          let o = c.dot.RectangleDouble.verify(e.detectionNormalizedRectangle, r + 1);
          if (o)
            return "detectionNormalizedRectangle." + o;
        }
        if (e.digests != null && Object.hasOwnProperty.call(e, "digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let o = 0; o < e.digests.length; ++o)
            if (!(e.digests[o] && typeof e.digests[o].length == "number" || l.isString(e.digests[o])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && Object.hasOwnProperty.call(e, "digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            let i = c.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[o], r + 1);
            if (i)
              return "digestsWithTimestamp." + i;
          }
        }
        if (e.isoValues != null && Object.hasOwnProperty.call(e, "isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let o = 0; o < e.isoValues.length; ++o)
            if (!l.isInteger(e.isoValues[o]))
              return "isoValues: integer[] expected";
        }
        if (e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image")) {
          let o = c.dot.v4.IosYuv420Image.verify(e.croppedYuv420Image, r + 1);
          if (o)
            return "croppedYuv420Image." + o;
        }
        if (e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop")) {
          let o = c.dot.v4.IosYuv420ImageCrop.verify(e.yuv420ImageCrop, r + 1);
          if (o)
            return "yuv420ImageCrop." + o;
        }
        return e.identifierForVendor != null && Object.hasOwnProperty.call(e, "identifierForVendor") && !l.isString(e.identifierForVendor) ? "identifierForVendor: string expected" : e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || l.isString(e.tamperingIndicators)) ? "tamperingIndicators: buffer expected" : null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.IosMetadata)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.IosMetadata: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (o.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (!l.isObject(e.architectureInfo))
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          o.architectureInfo = {};
          for (let i = Object.keys(e.architectureInfo), d = 0; d < i.length; ++d)
            i[d] === "__proto__" && l.makeProp(o.architectureInfo, i[d]), o.architectureInfo[i[d]] = !!e.architectureInfo[i[d]];
        }
        if (e.camera != null) {
          if (!l.isObject(e.camera))
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          o.camera = c.dot.v4.IosCamera.fromObject(e.camera, r + 1);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (!l.isObject(e.detectionNormalizedRectangle))
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          o.detectionNormalizedRectangle = c.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle, r + 1);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          o.digests = [];
          for (let i = 0; i < e.digests.length; ++i)
            typeof e.digests[i] == "string" ? l.base64.decode(e.digests[i], o.digests[i] = l.newBuffer(l.base64.length(e.digests[i])), 0) : e.digests[i].length >= 0 && (o.digests[i] = e.digests[i]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          o.digestsWithTimestamp = [];
          for (let i = 0; i < e.digestsWithTimestamp.length; ++i) {
            if (!l.isObject(e.digestsWithTimestamp[i]))
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            o.digestsWithTimestamp[i] = c.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[i], r + 1);
          }
        }
        if (e.isoValues) {
          if (!Array.isArray(e.isoValues))
            throw TypeError(".dot.v4.IosMetadata.isoValues: array expected");
          o.isoValues = [];
          for (let i = 0; i < e.isoValues.length; ++i)
            o.isoValues[i] = e.isoValues[i] | 0;
        }
        if (e.croppedYuv420Image != null) {
          if (!l.isObject(e.croppedYuv420Image))
            throw TypeError(".dot.v4.IosMetadata.croppedYuv420Image: object expected");
          o.croppedYuv420Image = c.dot.v4.IosYuv420Image.fromObject(e.croppedYuv420Image, r + 1);
        }
        if (e.yuv420ImageCrop != null) {
          if (!l.isObject(e.yuv420ImageCrop))
            throw TypeError(".dot.v4.IosMetadata.yuv420ImageCrop: object expected");
          o.yuv420ImageCrop = c.dot.v4.IosYuv420ImageCrop.fromObject(e.yuv420ImageCrop, r + 1);
        }
        return e.identifierForVendor != null && (o.identifierForVendor = String(e.identifierForVendor)), e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? l.base64.decode(e.tamperingIndicators, o.tamperingIndicators = l.newBuffer(l.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (o.tamperingIndicators = e.tamperingIndicators)), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        (r.arrays || r.defaults) && (i.digests = [], i.isoValues = [], i.digestsWithTimestamp = []), (r.objects || r.defaults) && (i.architectureInfo = {}), r.defaults && (i.cameraModelId = ""), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && (i.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          i.architectureInfo = {};
          for (let p = 0; p < d.length; ++p)
            d[p] === "__proto__" && l.makeProp(i.architectureInfo, d[p]), i.architectureInfo[d[p]] = e.architectureInfo[d[p]];
        }
        if (e.digests && e.digests.length) {
          i.digests = [];
          for (let p = 0; p < e.digests.length; ++p)
            i.digests[p] = r.bytes === String ? l.base64.encode(e.digests[p], 0, e.digests[p].length) : r.bytes === Array ? Array.prototype.slice.call(e.digests[p]) : e.digests[p];
        }
        if (e.isoValues && e.isoValues.length) {
          i.isoValues = [];
          for (let p = 0; p < e.isoValues.length; ++p)
            i.isoValues[p] = e.isoValues[p];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          i.digestsWithTimestamp = [];
          for (let p = 0; p < e.digestsWithTimestamp.length; ++p)
            i.digestsWithTimestamp[p] = c.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[p], r, o + 1);
        }
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && (i.camera = c.dot.v4.IosCamera.toObject(e.camera, r, o + 1), r.oneofs && (i._camera = "camera")), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && (i.detectionNormalizedRectangle = c.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, r, o + 1), r.oneofs && (i._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && (i.croppedYuv420Image = c.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, r, o + 1), r.oneofs && (i._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && (i.yuv420ImageCrop = c.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, r, o + 1), r.oneofs && (i._yuv420ImageCrop = "yuv420ImageCrop")), e.identifierForVendor != null && Object.hasOwnProperty.call(e, "identifierForVendor") && (i.identifierForVendor = e.identifierForVendor, r.oneofs && (i._identifierForVendor = "identifierForVendor")), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && (i.tamperingIndicators = r.bytes === String ? l.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : r.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, r.oneofs && (i._tamperingIndicators = "tamperingIndicators")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, n;
    })(), u.IosCamera = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.resolution = null, n.prototype.rotationDegrees = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && c.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.IosCamera(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.resolution = c.dot.ImageSize.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.resolution != null && Object.hasOwnProperty.call(t, "resolution")) {
          let r = c.dot.ImageSize.verify(t.resolution, e + 1);
          if (r)
            return "resolution." + r;
        }
        return t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && !l.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.IosCamera)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.IosCamera: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (!l.isObject(t.resolution))
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          r.resolution = c.dot.ImageSize.fromObject(t.resolution, e + 1);
        }
        return t.rotationDegrees != null && (r.rotationDegrees = t.rotationDegrees | 0), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.resolution = null, o.rotationDegrees = 0), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && (o.resolution = c.dot.ImageSize.toObject(t.resolution, e, r + 1)), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && (o.rotationDegrees = t.rotationDegrees), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, n;
    })(), u.IosYuv420Image = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.size = null, n.prototype.yPlane = l.newBuffer([]), n.prototype.uvPlane = l.newBuffer([]), n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.size != null && Object.hasOwnProperty.call(t, "size") && c.dot.ImageSize.encode(t.size, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(t.yPlane), t.uvPlane != null && Object.hasOwnProperty.call(t, "uvPlane") && e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).bytes(t.uvPlane), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.IosYuv420Image(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.size = c.dot.ImageSize.decode(t, t.uint32(), void 0, o + 1);
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
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.size != null && Object.hasOwnProperty.call(t, "size")) {
          let r = c.dot.ImageSize.verify(t.size, e + 1);
          if (r)
            return "size." + r;
        }
        return t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || l.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uvPlane != null && Object.hasOwnProperty.call(t, "uvPlane") && !(t.uvPlane && typeof t.uvPlane.length == "number" || l.isString(t.uvPlane)) ? "uvPlane: buffer expected" : null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.IosYuv420Image)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.IosYuv420Image: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.IosYuv420Image();
        if (t.size != null) {
          if (!l.isObject(t.size))
            throw TypeError(".dot.v4.IosYuv420Image.size: object expected");
          r.size = c.dot.ImageSize.fromObject(t.size, e + 1);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? l.base64.decode(t.yPlane, r.yPlane = l.newBuffer(l.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (r.yPlane = t.yPlane)), t.uvPlane != null && (typeof t.uvPlane == "string" ? l.base64.decode(t.uvPlane, r.uvPlane = l.newBuffer(l.base64.length(t.uvPlane)), 0) : t.uvPlane.length >= 0 && (r.uvPlane = t.uvPlane)), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.size = null, e.bytes === String ? o.yPlane = "" : (o.yPlane = [], e.bytes !== Array && (o.yPlane = l.newBuffer(o.yPlane))), e.bytes === String ? o.uvPlane = "" : (o.uvPlane = [], e.bytes !== Array && (o.uvPlane = l.newBuffer(o.uvPlane)))), t.size != null && Object.hasOwnProperty.call(t, "size") && (o.size = c.dot.ImageSize.toObject(t.size, e, r + 1)), t.yPlane != null && Object.hasOwnProperty.call(t, "yPlane") && (o.yPlane = e.bytes === String ? l.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uvPlane != null && Object.hasOwnProperty.call(t, "uvPlane") && (o.uvPlane = e.bytes === String ? l.base64.encode(t.uvPlane, 0, t.uvPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uvPlane) : t.uvPlane), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, n;
    })(), u.IosYuv420ImageCrop = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.v4.IosYuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && c.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.IosYuv420ImageCrop(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.image = c.dot.v4.IosYuv420Image.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.topLeftCorner = c.dot.PointInt.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.image != null && Object.hasOwnProperty.call(t, "image")) {
          let r = c.dot.v4.IosYuv420Image.verify(t.image, e + 1);
          if (r)
            return "image." + r;
        }
        if (t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner")) {
          let r = c.dot.PointInt.verify(t.topLeftCorner, e + 1);
          if (r)
            return "topLeftCorner." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.IosYuv420ImageCrop)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.IosYuv420ImageCrop: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.IosYuv420ImageCrop();
        if (t.image != null) {
          if (!l.isObject(t.image))
            throw TypeError(".dot.v4.IosYuv420ImageCrop.image: object expected");
          r.image = c.dot.v4.IosYuv420Image.fromObject(t.image, e + 1);
        }
        if (t.topLeftCorner != null) {
          if (!l.isObject(t.topLeftCorner))
            throw TypeError(".dot.v4.IosYuv420ImageCrop.topLeftCorner: object expected");
          r.topLeftCorner = c.dot.PointInt.fromObject(t.topLeftCorner, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.image = null, o.topLeftCorner = null), t.image != null && Object.hasOwnProperty.call(t, "image") && (o.image = c.dot.v4.IosYuv420Image.toObject(t.image, e, r + 1)), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && (o.topLeftCorner = c.dot.PointInt.toObject(t.topLeftCorner, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420ImageCrop";
      }, n;
    })(), u.WebMetadata = (function() {
      function n(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], this.optCheckResults = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.currentCameraProperties = null, n.prototype.availableCameraProperties = l.emptyArray, n.prototype.hashedDetectedImages = l.emptyArray, n.prototype.hashedDetectedImagesWithTimestamp = l.emptyArray, n.prototype.detectionRecord = l.emptyArray, n.prototype.croppedImage = null, n.prototype.croppedImageWithPosition = null, n.prototype.platformDetails = null, n.prototype.optCheckResults = l.emptyArray;
      let t;
      return Object.defineProperty(n.prototype, "_croppedImage", {
        get: l.oneOfGetter(t = ["croppedImage"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_croppedImageWithPosition", {
        get: l.oneOfGetter(t = ["croppedImageWithPosition"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_platformDetails", {
        get: l.oneOfGetter(t = ["platformDetails"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && c.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let i = 0; i < e.availableCameraProperties.length; ++i)
            c.dot.v4.CameraProperties.encode(e.availableCameraProperties[i], r.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork(), o + 1).ldelim();
        if (e.hashedDetectedImages != null && e.hashedDetectedImages.length)
          for (let i = 0; i < e.hashedDetectedImages.length; ++i)
            r.uint32(
              /* id 3, wireType 2 =*/
              26
            ).string(e.hashedDetectedImages[i]);
        if (e.detectionRecord != null && e.detectionRecord.length)
          for (let i = 0; i < e.detectionRecord.length; ++i)
            c.dot.v4.DetectedObject.encode(e.detectionRecord[i], r.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork(), o + 1).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let i = 0; i < e.hashedDetectedImagesWithTimestamp.length; ++i)
            c.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[i], r.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork(), o + 1).ldelim();
        if (e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && c.dot.Image.encode(e.croppedImage, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork(), o + 1).ldelim(), e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition") && c.dot.v4.ImageCrop.encode(e.croppedImageWithPosition, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork(), o + 1).ldelim(), e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails") && c.dot.v4.PlatformDetails.encode(e.platformDetails, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork(), o + 1).ldelim(), e.optCheckResults != null && e.optCheckResults.length)
          for (let i = 0; i < e.optCheckResults.length; ++i)
            c.dot.v4.CameraEvaluationResult.encode(e.optCheckResults[i], r.uint32(
              /* id 9, wireType 2 =*/
              74
            ).fork(), o + 1).ldelim();
        return r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.WebMetadata(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.currentCameraProperties = c.dot.v4.MediaTrackSettings.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.availableCameraProperties && p.availableCameraProperties.length || (p.availableCameraProperties = []), p.availableCameraProperties.push(c.dot.v4.CameraProperties.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 3: {
              p.hashedDetectedImages && p.hashedDetectedImages.length || (p.hashedDetectedImages = []), p.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              p.hashedDetectedImagesWithTimestamp && p.hashedDetectedImagesWithTimestamp.length || (p.hashedDetectedImagesWithTimestamp = []), p.hashedDetectedImagesWithTimestamp.push(c.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 4: {
              p.detectionRecord && p.detectionRecord.length || (p.detectionRecord = []), p.detectionRecord.push(c.dot.v4.DetectedObject.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 6: {
              p.croppedImage = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 7: {
              p.croppedImageWithPosition = c.dot.v4.ImageCrop.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 8: {
              p.platformDetails = c.dot.v4.PlatformDetails.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 9: {
              p.optCheckResults && p.optCheckResults.length || (p.optCheckResults = []), p.optCheckResults.push(c.dot.v4.CameraEvaluationResult.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties")) {
          let o = c.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties, r + 1);
          if (o)
            return "currentCameraProperties." + o;
        }
        if (e.availableCameraProperties != null && Object.hasOwnProperty.call(e, "availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let o = 0; o < e.availableCameraProperties.length; ++o) {
            let i = c.dot.v4.CameraProperties.verify(e.availableCameraProperties[o], r + 1);
            if (i)
              return "availableCameraProperties." + i;
          }
        }
        if (e.hashedDetectedImages != null && Object.hasOwnProperty.call(e, "hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let o = 0; o < e.hashedDetectedImages.length; ++o)
            if (!l.isString(e.hashedDetectedImages[o]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && Object.hasOwnProperty.call(e, "hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o) {
            let i = c.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[o], r + 1);
            if (i)
              return "hashedDetectedImagesWithTimestamp." + i;
          }
        }
        if (e.detectionRecord != null && Object.hasOwnProperty.call(e, "detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let o = 0; o < e.detectionRecord.length; ++o) {
            let i = c.dot.v4.DetectedObject.verify(e.detectionRecord[o], r + 1);
            if (i)
              return "detectionRecord." + i;
          }
        }
        if (e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage")) {
          let o = c.dot.Image.verify(e.croppedImage, r + 1);
          if (o)
            return "croppedImage." + o;
        }
        if (e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition")) {
          let o = c.dot.v4.ImageCrop.verify(e.croppedImageWithPosition, r + 1);
          if (o)
            return "croppedImageWithPosition." + o;
        }
        if (e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails")) {
          let o = c.dot.v4.PlatformDetails.verify(e.platformDetails, r + 1);
          if (o)
            return "platformDetails." + o;
        }
        if (e.optCheckResults != null && Object.hasOwnProperty.call(e, "optCheckResults")) {
          if (!Array.isArray(e.optCheckResults))
            return "optCheckResults: array expected";
          for (let o = 0; o < e.optCheckResults.length; ++o) {
            let i = c.dot.v4.CameraEvaluationResult.verify(e.optCheckResults[o], r + 1);
            if (i)
              return "optCheckResults." + i;
          }
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.WebMetadata)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.WebMetadata: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (!l.isObject(e.currentCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          o.currentCameraProperties = c.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties, r + 1);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          o.availableCameraProperties = [];
          for (let i = 0; i < e.availableCameraProperties.length; ++i) {
            if (!l.isObject(e.availableCameraProperties[i]))
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            o.availableCameraProperties[i] = c.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[i], r + 1);
          }
        }
        if (e.hashedDetectedImages) {
          if (!Array.isArray(e.hashedDetectedImages))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImages: array expected");
          o.hashedDetectedImages = [];
          for (let i = 0; i < e.hashedDetectedImages.length; ++i)
            o.hashedDetectedImages[i] = String(e.hashedDetectedImages[i]);
        }
        if (e.hashedDetectedImagesWithTimestamp) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: array expected");
          o.hashedDetectedImagesWithTimestamp = [];
          for (let i = 0; i < e.hashedDetectedImagesWithTimestamp.length; ++i) {
            if (!l.isObject(e.hashedDetectedImagesWithTimestamp[i]))
              throw TypeError(".dot.v4.WebMetadata.hashedDetectedImagesWithTimestamp: object expected");
            o.hashedDetectedImagesWithTimestamp[i] = c.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[i], r + 1);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          o.detectionRecord = [];
          for (let i = 0; i < e.detectionRecord.length; ++i) {
            if (!l.isObject(e.detectionRecord[i]))
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            o.detectionRecord[i] = c.dot.v4.DetectedObject.fromObject(e.detectionRecord[i], r + 1);
          }
        }
        if (e.croppedImage != null) {
          if (!l.isObject(e.croppedImage))
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          o.croppedImage = c.dot.Image.fromObject(e.croppedImage, r + 1);
        }
        if (e.croppedImageWithPosition != null) {
          if (!l.isObject(e.croppedImageWithPosition))
            throw TypeError(".dot.v4.WebMetadata.croppedImageWithPosition: object expected");
          o.croppedImageWithPosition = c.dot.v4.ImageCrop.fromObject(e.croppedImageWithPosition, r + 1);
        }
        if (e.platformDetails != null) {
          if (!l.isObject(e.platformDetails))
            throw TypeError(".dot.v4.WebMetadata.platformDetails: object expected");
          o.platformDetails = c.dot.v4.PlatformDetails.fromObject(e.platformDetails, r + 1);
        }
        if (e.optCheckResults) {
          if (!Array.isArray(e.optCheckResults))
            throw TypeError(".dot.v4.WebMetadata.optCheckResults: array expected");
          o.optCheckResults = [];
          for (let i = 0; i < e.optCheckResults.length; ++i) {
            if (!l.isObject(e.optCheckResults[i]))
              throw TypeError(".dot.v4.WebMetadata.optCheckResults: object expected");
            o.optCheckResults[i] = c.dot.v4.CameraEvaluationResult.fromObject(e.optCheckResults[i], r + 1);
          }
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        if ((r.arrays || r.defaults) && (i.availableCameraProperties = [], i.hashedDetectedImages = [], i.detectionRecord = [], i.hashedDetectedImagesWithTimestamp = [], i.optCheckResults = []), r.defaults && (i.currentCameraProperties = null), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && (i.currentCameraProperties = c.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, r, o + 1)), e.availableCameraProperties && e.availableCameraProperties.length) {
          i.availableCameraProperties = [];
          for (let d = 0; d < e.availableCameraProperties.length; ++d)
            i.availableCameraProperties[d] = c.dot.v4.CameraProperties.toObject(e.availableCameraProperties[d], r, o + 1);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          i.hashedDetectedImages = [];
          for (let d = 0; d < e.hashedDetectedImages.length; ++d)
            i.hashedDetectedImages[d] = e.hashedDetectedImages[d];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          i.detectionRecord = [];
          for (let d = 0; d < e.detectionRecord.length; ++d)
            i.detectionRecord[d] = c.dot.v4.DetectedObject.toObject(e.detectionRecord[d], r, o + 1);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          i.hashedDetectedImagesWithTimestamp = [];
          for (let d = 0; d < e.hashedDetectedImagesWithTimestamp.length; ++d)
            i.hashedDetectedImagesWithTimestamp[d] = c.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[d], r, o + 1);
        }
        if (e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && (i.croppedImage = c.dot.Image.toObject(e.croppedImage, r, o + 1), r.oneofs && (i._croppedImage = "croppedImage")), e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition") && (i.croppedImageWithPosition = c.dot.v4.ImageCrop.toObject(e.croppedImageWithPosition, r, o + 1), r.oneofs && (i._croppedImageWithPosition = "croppedImageWithPosition")), e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails") && (i.platformDetails = c.dot.v4.PlatformDetails.toObject(e.platformDetails, r, o + 1), r.oneofs && (i._platformDetails = "platformDetails")), e.optCheckResults && e.optCheckResults.length) {
          i.optCheckResults = [];
          for (let d = 0; d < e.optCheckResults.length; ++d)
            i.optCheckResults[d] = c.dot.v4.CameraEvaluationResult.toObject(e.optCheckResults[d], r, o + 1);
        }
        return i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, n;
    })(), u.HashedDetectedImageWithTimestamp = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.imageHash = "", n.prototype.timestampMillis = l.Long ? l.Long.fromBits(0, 0, !0) : 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.HashedDetectedImageWithTimestamp(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.imageHash = t.string();
              break;
            }
            case 2: {
              d.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        return typeof t != "object" || t === null ? "object expected" : (e === void 0 && (e = 0), e > l.recursionLimit ? "maximum nesting depth exceeded" : t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && !l.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && !l.isInteger(t.timestampMillis) && !(t.timestampMillis && l.isInteger(t.timestampMillis.low) && l.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null);
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.HashedDetectedImageWithTimestamp: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (r.imageHash = String(t.imageHash)), t.timestampMillis != null && (l.Long ? r.timestampMillis = l.Long.fromValue(t.timestampMillis, !0) : typeof t.timestampMillis == "string" ? r.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? r.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (r.timestampMillis = new l.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        if (e.defaults)
          if (o.imageHash = "", l.Long) {
            let i = new l.Long(0, 0, !0);
            o.timestampMillis = e.longs === String ? i.toString() : e.longs === Number ? i.toNumber() : typeof BigInt < "u" && e.longs === BigInt ? i.toBigInt() : i;
          } else
            o.timestampMillis = e.longs === String ? "0" : typeof BigInt < "u" && e.longs === BigInt ? BigInt("0") : 0;
        return t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && (o.imageHash = t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && (typeof BigInt < "u" && e.longs === BigInt ? o.timestampMillis = typeof t.timestampMillis == "number" ? BigInt(t.timestampMillis) : l.Long.fromBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0, !0).toBigInt() : typeof t.timestampMillis == "number" ? o.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : o.timestampMillis = e.longs === String ? l.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new l.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, n;
    })(), u.MediaTrackSettings = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.aspectRatio = null, n.prototype.autoGainControl = null, n.prototype.channelCount = null, n.prototype.deviceId = null, n.prototype.displaySurface = null, n.prototype.echoCancellation = null, n.prototype.facingMode = null, n.prototype.frameRate = null, n.prototype.groupId = null, n.prototype.height = null, n.prototype.noiseSuppression = null, n.prototype.sampleRate = null, n.prototype.sampleSize = null, n.prototype.width = null, n.prototype.deviceName = null;
      let t;
      return Object.defineProperty(n.prototype, "_aspectRatio", {
        get: l.oneOfGetter(t = ["aspectRatio"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_autoGainControl", {
        get: l.oneOfGetter(t = ["autoGainControl"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_channelCount", {
        get: l.oneOfGetter(t = ["channelCount"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceId", {
        get: l.oneOfGetter(t = ["deviceId"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_displaySurface", {
        get: l.oneOfGetter(t = ["displaySurface"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_echoCancellation", {
        get: l.oneOfGetter(t = ["echoCancellation"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_facingMode", {
        get: l.oneOfGetter(t = ["facingMode"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_frameRate", {
        get: l.oneOfGetter(t = ["frameRate"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_groupId", {
        get: l.oneOfGetter(t = ["groupId"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_height", {
        get: l.oneOfGetter(t = ["height"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_noiseSuppression", {
        get: l.oneOfGetter(t = ["noiseSuppression"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleRate", {
        get: l.oneOfGetter(t = ["sampleRate"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_sampleSize", {
        get: l.oneOfGetter(t = ["sampleSize"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_width", {
        get: l.oneOfGetter(t = ["width"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_deviceName", {
        get: l.oneOfGetter(t = ["deviceName"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && r.uint32(
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
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.MediaTrackSettings(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.aspectRatio = e.double();
              break;
            }
            case 2: {
              p.autoGainControl = e.bool();
              break;
            }
            case 3: {
              p.channelCount = e.int32();
              break;
            }
            case 4: {
              p.deviceId = e.string();
              break;
            }
            case 5: {
              p.displaySurface = e.string();
              break;
            }
            case 6: {
              p.echoCancellation = e.bool();
              break;
            }
            case 7: {
              p.facingMode = e.string();
              break;
            }
            case 8: {
              p.frameRate = e.double();
              break;
            }
            case 9: {
              p.groupId = e.string();
              break;
            }
            case 10: {
              p.height = e.int32();
              break;
            }
            case 11: {
              p.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              p.sampleRate = e.int32();
              break;
            }
            case 13: {
              p.sampleSize = e.int32();
              break;
            }
            case 14: {
              p.width = e.int32();
              break;
            }
            case 15: {
              p.deviceName = e.string();
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        return typeof e != "object" || e === null ? "object expected" : (r === void 0 && (r = 0), r > l.recursionLimit ? "maximum nesting depth exceeded" : e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && Object.hasOwnProperty.call(e, "autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && Object.hasOwnProperty.call(e, "channelCount") && !l.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && Object.hasOwnProperty.call(e, "deviceId") && !l.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && Object.hasOwnProperty.call(e, "displaySurface") && !l.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && Object.hasOwnProperty.call(e, "echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && Object.hasOwnProperty.call(e, "facingMode") && !l.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && Object.hasOwnProperty.call(e, "frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && Object.hasOwnProperty.call(e, "groupId") && !l.isString(e.groupId) ? "groupId: string expected" : e.height != null && Object.hasOwnProperty.call(e, "height") && !l.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && Object.hasOwnProperty.call(e, "noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && Object.hasOwnProperty.call(e, "sampleRate") && !l.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && Object.hasOwnProperty.call(e, "sampleSize") && !l.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && Object.hasOwnProperty.call(e, "width") && !l.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && Object.hasOwnProperty.call(e, "deviceName") && !l.isString(e.deviceName) ? "deviceName: string expected" : null);
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.MediaTrackSettings)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.MediaTrackSettings: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (o.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (o.autoGainControl = !!e.autoGainControl), e.channelCount != null && (o.channelCount = e.channelCount | 0), e.deviceId != null && (o.deviceId = String(e.deviceId)), e.displaySurface != null && (o.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (o.echoCancellation = !!e.echoCancellation), e.facingMode != null && (o.facingMode = String(e.facingMode)), e.frameRate != null && (o.frameRate = Number(e.frameRate)), e.groupId != null && (o.groupId = String(e.groupId)), e.height != null && (o.height = e.height | 0), e.noiseSuppression != null && (o.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (o.sampleRate = e.sampleRate | 0), e.sampleSize != null && (o.sampleSize = e.sampleSize | 0), e.width != null && (o.width = e.width | 0), e.deviceName != null && (o.deviceName = String(e.deviceName)), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && (i.aspectRatio = r.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, r.oneofs && (i._aspectRatio = "aspectRatio")), e.autoGainControl != null && Object.hasOwnProperty.call(e, "autoGainControl") && (i.autoGainControl = e.autoGainControl, r.oneofs && (i._autoGainControl = "autoGainControl")), e.channelCount != null && Object.hasOwnProperty.call(e, "channelCount") && (i.channelCount = e.channelCount, r.oneofs && (i._channelCount = "channelCount")), e.deviceId != null && Object.hasOwnProperty.call(e, "deviceId") && (i.deviceId = e.deviceId, r.oneofs && (i._deviceId = "deviceId")), e.displaySurface != null && Object.hasOwnProperty.call(e, "displaySurface") && (i.displaySurface = e.displaySurface, r.oneofs && (i._displaySurface = "displaySurface")), e.echoCancellation != null && Object.hasOwnProperty.call(e, "echoCancellation") && (i.echoCancellation = e.echoCancellation, r.oneofs && (i._echoCancellation = "echoCancellation")), e.facingMode != null && Object.hasOwnProperty.call(e, "facingMode") && (i.facingMode = e.facingMode, r.oneofs && (i._facingMode = "facingMode")), e.frameRate != null && Object.hasOwnProperty.call(e, "frameRate") && (i.frameRate = r.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, r.oneofs && (i._frameRate = "frameRate")), e.groupId != null && Object.hasOwnProperty.call(e, "groupId") && (i.groupId = e.groupId, r.oneofs && (i._groupId = "groupId")), e.height != null && Object.hasOwnProperty.call(e, "height") && (i.height = e.height, r.oneofs && (i._height = "height")), e.noiseSuppression != null && Object.hasOwnProperty.call(e, "noiseSuppression") && (i.noiseSuppression = e.noiseSuppression, r.oneofs && (i._noiseSuppression = "noiseSuppression")), e.sampleRate != null && Object.hasOwnProperty.call(e, "sampleRate") && (i.sampleRate = e.sampleRate, r.oneofs && (i._sampleRate = "sampleRate")), e.sampleSize != null && Object.hasOwnProperty.call(e, "sampleSize") && (i.sampleSize = e.sampleSize, r.oneofs && (i._sampleSize = "sampleSize")), e.width != null && Object.hasOwnProperty.call(e, "width") && (i.width = e.width, r.oneofs && (i._width = "width")), e.deviceName != null && Object.hasOwnProperty.call(e, "deviceName") && (i.deviceName = e.deviceName, r.oneofs && (i._deviceName = "deviceName")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, n;
    })(), u.ImageBitmap = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.width = 0, n.prototype.height = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.ImageBitmap(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.width = t.int32();
              break;
            }
            case 2: {
              d.height = t.int32();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        return typeof t != "object" || t === null ? "object expected" : (e === void 0 && (e = 0), e > l.recursionLimit ? "maximum nesting depth exceeded" : t.width != null && Object.hasOwnProperty.call(t, "width") && !l.isInteger(t.width) ? "width: integer expected" : t.height != null && Object.hasOwnProperty.call(t, "height") && !l.isInteger(t.height) ? "height: integer expected" : null);
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.ImageBitmap)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.ImageBitmap: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.ImageBitmap();
        return t.width != null && (r.width = t.width | 0), t.height != null && (r.height = t.height | 0), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.width = 0, o.height = 0), t.width != null && Object.hasOwnProperty.call(t, "width") && (o.width = t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && (o.height = t.height), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, n;
    })(), u.CameraProperties = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.cameraInitFrameResolution = null, n.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(n.prototype, "_cameraInitFrameResolution", {
        get: l.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && c.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && c.dot.v4.MediaTrackSettings.encode(e.cameraProperties, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.CameraProperties(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.cameraInitFrameResolution = c.dot.v4.ImageBitmap.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.cameraProperties = c.dot.v4.MediaTrackSettings.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution")) {
          let o = c.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution, r + 1);
          if (o)
            return "cameraInitFrameResolution." + o;
        }
        if (e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties")) {
          let o = c.dot.v4.MediaTrackSettings.verify(e.cameraProperties, r + 1);
          if (o)
            return "cameraProperties." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.CameraProperties)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.CameraProperties: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (!l.isObject(e.cameraInitFrameResolution))
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          o.cameraInitFrameResolution = c.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution, r + 1);
        }
        if (e.cameraProperties != null) {
          if (!l.isObject(e.cameraProperties))
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          o.cameraProperties = c.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.cameraProperties = null), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && (i.cameraInitFrameResolution = c.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, r, o + 1), r.oneofs && (i._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && (i.cameraProperties = c.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, r, o + 1)), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, n;
    })(), u.DetectedObject = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.brightness = 0, n.prototype.sharpness = 0, n.prototype.hotspots = 0, n.prototype.confidence = 0, n.prototype.faceSize = 0, n.prototype.faceCenter = null, n.prototype.smallestEdge = 0, n.prototype.bottomLeft = null, n.prototype.bottomRight = null, n.prototype.topLeft = null, n.prototype.topRight = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
        ).float(t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && c.dot.v4.Point.encode(t.faceCenter, e.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork(), r + 1).ldelim(), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && e.uint32(
          /* id 7, wireType 5 =*/
          61
        ).float(t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && c.dot.v4.Point.encode(t.bottomLeft, e.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork(), r + 1).ldelim(), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && c.dot.v4.Point.encode(t.bottomRight, e.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork(), r + 1).ldelim(), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && c.dot.v4.Point.encode(t.topLeft, e.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork(), r + 1).ldelim(), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && c.dot.v4.Point.encode(t.topRight, e.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.DetectedObject(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
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
              d.faceCenter = c.dot.v4.Point.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 7: {
              d.smallestEdge = t.float();
              break;
            }
            case 8: {
              d.bottomLeft = c.dot.v4.Point.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 9: {
              d.bottomRight = c.dot.v4.Point.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 10: {
              d.topLeft = c.dot.v4.Point.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 11: {
              d.topRight = c.dot.v4.Point.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && typeof t.brightness != "number")
          return "brightness: number expected";
        if (t.sharpness != null && Object.hasOwnProperty.call(t, "sharpness") && typeof t.sharpness != "number")
          return "sharpness: number expected";
        if (t.hotspots != null && Object.hasOwnProperty.call(t, "hotspots") && typeof t.hotspots != "number")
          return "hotspots: number expected";
        if (t.confidence != null && Object.hasOwnProperty.call(t, "confidence") && typeof t.confidence != "number")
          return "confidence: number expected";
        if (t.faceSize != null && Object.hasOwnProperty.call(t, "faceSize") && typeof t.faceSize != "number")
          return "faceSize: number expected";
        if (t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter")) {
          let r = c.dot.v4.Point.verify(t.faceCenter, e + 1);
          if (r)
            return "faceCenter." + r;
        }
        if (t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && typeof t.smallestEdge != "number")
          return "smallestEdge: number expected";
        if (t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft")) {
          let r = c.dot.v4.Point.verify(t.bottomLeft, e + 1);
          if (r)
            return "bottomLeft." + r;
        }
        if (t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight")) {
          let r = c.dot.v4.Point.verify(t.bottomRight, e + 1);
          if (r)
            return "bottomRight." + r;
        }
        if (t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft")) {
          let r = c.dot.v4.Point.verify(t.topLeft, e + 1);
          if (r)
            return "topLeft." + r;
        }
        if (t.topRight != null && Object.hasOwnProperty.call(t, "topRight")) {
          let r = c.dot.v4.Point.verify(t.topRight, e + 1);
          if (r)
            return "topRight." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.DetectedObject)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.DetectedObject: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.DetectedObject();
        if (t.brightness != null && (r.brightness = Number(t.brightness)), t.sharpness != null && (r.sharpness = Number(t.sharpness)), t.hotspots != null && (r.hotspots = Number(t.hotspots)), t.confidence != null && (r.confidence = Number(t.confidence)), t.faceSize != null && (r.faceSize = Number(t.faceSize)), t.faceCenter != null) {
          if (!l.isObject(t.faceCenter))
            throw TypeError(".dot.v4.DetectedObject.faceCenter: object expected");
          r.faceCenter = c.dot.v4.Point.fromObject(t.faceCenter, e + 1);
        }
        if (t.smallestEdge != null && (r.smallestEdge = Number(t.smallestEdge)), t.bottomLeft != null) {
          if (!l.isObject(t.bottomLeft))
            throw TypeError(".dot.v4.DetectedObject.bottomLeft: object expected");
          r.bottomLeft = c.dot.v4.Point.fromObject(t.bottomLeft, e + 1);
        }
        if (t.bottomRight != null) {
          if (!l.isObject(t.bottomRight))
            throw TypeError(".dot.v4.DetectedObject.bottomRight: object expected");
          r.bottomRight = c.dot.v4.Point.fromObject(t.bottomRight, e + 1);
        }
        if (t.topLeft != null) {
          if (!l.isObject(t.topLeft))
            throw TypeError(".dot.v4.DetectedObject.topLeft: object expected");
          r.topLeft = c.dot.v4.Point.fromObject(t.topLeft, e + 1);
        }
        if (t.topRight != null) {
          if (!l.isObject(t.topRight))
            throw TypeError(".dot.v4.DetectedObject.topRight: object expected");
          r.topRight = c.dot.v4.Point.fromObject(t.topRight, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.brightness = 0, o.sharpness = 0, o.hotspots = 0, o.confidence = 0, o.faceSize = 0, o.faceCenter = null, o.smallestEdge = 0, o.bottomLeft = null, o.bottomRight = null, o.topLeft = null, o.topRight = null), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && (o.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && Object.hasOwnProperty.call(t, "sharpness") && (o.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && Object.hasOwnProperty.call(t, "hotspots") && (o.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && Object.hasOwnProperty.call(t, "confidence") && (o.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && Object.hasOwnProperty.call(t, "faceSize") && (o.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && (o.faceCenter = c.dot.v4.Point.toObject(t.faceCenter, e, r + 1)), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && (o.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && (o.bottomLeft = c.dot.v4.Point.toObject(t.bottomLeft, e, r + 1)), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && (o.bottomRight = c.dot.v4.Point.toObject(t.bottomRight, e, r + 1)), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && (o.topLeft = c.dot.v4.Point.toObject(t.topLeft, e, r + 1)), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && (o.topRight = c.dot.v4.Point.toObject(t.topRight, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, n;
    })(), u.Point = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.x = 0, n.prototype.y = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.Point(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.x = t.float();
              break;
            }
            case 2: {
              d.y = t.float();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        return typeof t != "object" || t === null ? "object expected" : (e === void 0 && (e = 0), e > l.recursionLimit ? "maximum nesting depth exceeded" : t.x != null && Object.hasOwnProperty.call(t, "x") && typeof t.x != "number" ? "x: number expected" : t.y != null && Object.hasOwnProperty.call(t, "y") && typeof t.y != "number" ? "y: number expected" : null);
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.Point)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.Point: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.Point();
        return t.x != null && (r.x = Number(t.x)), t.y != null && (r.y = Number(t.y)), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.x = 0, o.y = 0), t.x != null && Object.hasOwnProperty.call(t, "x") && (o.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && (o.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, n;
    })(), u.ImageCrop = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.image = null, n.prototype.topLeftCorner = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && c.dot.v4.Point.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.ImageCrop(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.image = c.dot.Image.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.topLeftCorner = c.dot.v4.Point.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.image != null && Object.hasOwnProperty.call(t, "image")) {
          let r = c.dot.Image.verify(t.image, e + 1);
          if (r)
            return "image." + r;
        }
        if (t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner")) {
          let r = c.dot.v4.Point.verify(t.topLeftCorner, e + 1);
          if (r)
            return "topLeftCorner." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.ImageCrop)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.ImageCrop: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.ImageCrop();
        if (t.image != null) {
          if (!l.isObject(t.image))
            throw TypeError(".dot.v4.ImageCrop.image: object expected");
          r.image = c.dot.Image.fromObject(t.image, e + 1);
        }
        if (t.topLeftCorner != null) {
          if (!l.isObject(t.topLeftCorner))
            throw TypeError(".dot.v4.ImageCrop.topLeftCorner: object expected");
          r.topLeftCorner = c.dot.v4.Point.fromObject(t.topLeftCorner, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.image = null, o.topLeftCorner = null), t.image != null && Object.hasOwnProperty.call(t, "image") && (o.image = c.dot.Image.toObject(t.image, e, r + 1)), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && (o.topLeftCorner = c.dot.v4.Point.toObject(t.topLeftCorner, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageCrop";
      }, n;
    })(), u.PlatformDetails = (function() {
      function n(e) {
        if (this.browserVersions = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.userAgent = "", n.prototype.platform = null, n.prototype.platformVersion = null, n.prototype.architecture = null, n.prototype.model = null, n.prototype.browserVersions = l.emptyArray, n.prototype.installationId = null;
      let t;
      return Object.defineProperty(n.prototype, "_platform", {
        get: l.oneOfGetter(t = ["platform"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_platformVersion", {
        get: l.oneOfGetter(t = ["platformVersion"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_architecture", {
        get: l.oneOfGetter(t = ["architecture"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_model", {
        get: l.oneOfGetter(t = ["model"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_installationId", {
        get: l.oneOfGetter(t = ["installationId"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && r.uint32(
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
          for (let i = 0; i < e.browserVersions.length; ++i)
            c.dot.v4.BrowserVersion.encode(e.browserVersions[i], r.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork(), o + 1).ldelim();
        return e.installationId != null && Object.hasOwnProperty.call(e, "installationId") && r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).string(e.installationId), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.PlatformDetails(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.userAgent = e.string();
              break;
            }
            case 2: {
              p.platform = e.string();
              break;
            }
            case 3: {
              p.platformVersion = e.string();
              break;
            }
            case 4: {
              p.architecture = e.string();
              break;
            }
            case 5: {
              p.model = e.string();
              break;
            }
            case 6: {
              p.browserVersions && p.browserVersions.length || (p.browserVersions = []), p.browserVersions.push(c.dot.v4.BrowserVersion.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 7: {
              p.installationId = e.string();
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && !l.isString(e.userAgent))
          return "userAgent: string expected";
        if (e.platform != null && Object.hasOwnProperty.call(e, "platform") && !l.isString(e.platform))
          return "platform: string expected";
        if (e.platformVersion != null && Object.hasOwnProperty.call(e, "platformVersion") && !l.isString(e.platformVersion))
          return "platformVersion: string expected";
        if (e.architecture != null && Object.hasOwnProperty.call(e, "architecture") && !l.isString(e.architecture))
          return "architecture: string expected";
        if (e.model != null && Object.hasOwnProperty.call(e, "model") && !l.isString(e.model))
          return "model: string expected";
        if (e.browserVersions != null && Object.hasOwnProperty.call(e, "browserVersions")) {
          if (!Array.isArray(e.browserVersions))
            return "browserVersions: array expected";
          for (let o = 0; o < e.browserVersions.length; ++o) {
            let i = c.dot.v4.BrowserVersion.verify(e.browserVersions[o], r + 1);
            if (i)
              return "browserVersions." + i;
          }
        }
        return e.installationId != null && Object.hasOwnProperty.call(e, "installationId") && !l.isString(e.installationId) ? "installationId: string expected" : null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.PlatformDetails)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.PlatformDetails: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.PlatformDetails();
        if (e.userAgent != null && (o.userAgent = String(e.userAgent)), e.platform != null && (o.platform = String(e.platform)), e.platformVersion != null && (o.platformVersion = String(e.platformVersion)), e.architecture != null && (o.architecture = String(e.architecture)), e.model != null && (o.model = String(e.model)), e.browserVersions) {
          if (!Array.isArray(e.browserVersions))
            throw TypeError(".dot.v4.PlatformDetails.browserVersions: array expected");
          o.browserVersions = [];
          for (let i = 0; i < e.browserVersions.length; ++i) {
            if (!l.isObject(e.browserVersions[i]))
              throw TypeError(".dot.v4.PlatformDetails.browserVersions: object expected");
            o.browserVersions[i] = c.dot.v4.BrowserVersion.fromObject(e.browserVersions[i], r + 1);
          }
        }
        return e.installationId != null && (o.installationId = String(e.installationId)), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        if ((r.arrays || r.defaults) && (i.browserVersions = []), r.defaults && (i.userAgent = ""), e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && (i.userAgent = e.userAgent), e.platform != null && Object.hasOwnProperty.call(e, "platform") && (i.platform = e.platform, r.oneofs && (i._platform = "platform")), e.platformVersion != null && Object.hasOwnProperty.call(e, "platformVersion") && (i.platformVersion = e.platformVersion, r.oneofs && (i._platformVersion = "platformVersion")), e.architecture != null && Object.hasOwnProperty.call(e, "architecture") && (i.architecture = e.architecture, r.oneofs && (i._architecture = "architecture")), e.model != null && Object.hasOwnProperty.call(e, "model") && (i.model = e.model, r.oneofs && (i._model = "model")), e.browserVersions && e.browserVersions.length) {
          i.browserVersions = [];
          for (let d = 0; d < e.browserVersions.length; ++d)
            i.browserVersions[d] = c.dot.v4.BrowserVersion.toObject(e.browserVersions[d], r, o + 1);
        }
        return e.installationId != null && Object.hasOwnProperty.call(e, "installationId") && (i.installationId = e.installationId, r.oneofs && (i._installationId = "installationId")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PlatformDetails";
      }, n;
    })(), u.BrowserVersion = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.name = "", n.prototype.version = "", n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.name != null && Object.hasOwnProperty.call(t, "name") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(t.version), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.BrowserVersion(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.name = t.string();
              break;
            }
            case 2: {
              d.version = t.string();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        return typeof t != "object" || t === null ? "object expected" : (e === void 0 && (e = 0), e > l.recursionLimit ? "maximum nesting depth exceeded" : t.name != null && Object.hasOwnProperty.call(t, "name") && !l.isString(t.name) ? "name: string expected" : t.version != null && Object.hasOwnProperty.call(t, "version") && !l.isString(t.version) ? "version: string expected" : null);
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.BrowserVersion)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.BrowserVersion: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.BrowserVersion();
        return t.name != null && (r.name = String(t.name)), t.version != null && (r.version = String(t.version)), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.name = "", o.version = ""), t.name != null && Object.hasOwnProperty.call(t, "name") && (o.name = t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && (o.version = t.version), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.BrowserVersion";
      }, n;
    })(), u.CameraEvaluationResult = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.optSetting = null, n.prototype.afterOpt = null, n.prototype.beforeOpt = null;
      let t;
      return Object.defineProperty(n.prototype, "_optSetting", {
        get: l.oneOfGetter(t = ["optSetting"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_afterOpt", {
        get: l.oneOfGetter(t = ["afterOpt"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_beforeOpt", {
        get: l.oneOfGetter(t = ["beforeOpt"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.optSetting != null && Object.hasOwnProperty.call(e, "optSetting") && r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.optSetting), e.afterOpt != null && Object.hasOwnProperty.call(e, "afterOpt") && r.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(e.afterOpt), e.beforeOpt != null && Object.hasOwnProperty.call(e, "beforeOpt") && r.uint32(
          /* id 3, wireType 0 =*/
          24
        ).int32(e.beforeOpt), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.CameraEvaluationResult(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.optSetting = e.string();
              break;
            }
            case 2: {
              p.afterOpt = e.int32();
              break;
            }
            case 3: {
              p.beforeOpt = e.int32();
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        return typeof e != "object" || e === null ? "object expected" : (r === void 0 && (r = 0), r > l.recursionLimit ? "maximum nesting depth exceeded" : e.optSetting != null && Object.hasOwnProperty.call(e, "optSetting") && !l.isString(e.optSetting) ? "optSetting: string expected" : e.afterOpt != null && Object.hasOwnProperty.call(e, "afterOpt") && !l.isInteger(e.afterOpt) ? "afterOpt: integer expected" : e.beforeOpt != null && Object.hasOwnProperty.call(e, "beforeOpt") && !l.isInteger(e.beforeOpt) ? "beforeOpt: integer expected" : null);
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.CameraEvaluationResult)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.CameraEvaluationResult: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.CameraEvaluationResult();
        return e.optSetting != null && (o.optSetting = String(e.optSetting)), e.afterOpt != null && (o.afterOpt = e.afterOpt | 0), e.beforeOpt != null && (o.beforeOpt = e.beforeOpt | 0), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return e.optSetting != null && Object.hasOwnProperty.call(e, "optSetting") && (i.optSetting = e.optSetting, r.oneofs && (i._optSetting = "optSetting")), e.afterOpt != null && Object.hasOwnProperty.call(e, "afterOpt") && (i.afterOpt = e.afterOpt, r.oneofs && (i._afterOpt = "afterOpt")), e.beforeOpt != null && Object.hasOwnProperty.call(e, "beforeOpt") && (i.beforeOpt = e.beforeOpt, r.oneofs && (i._beforeOpt = "beforeOpt")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraEvaluationResult";
      }, n;
    })(), u.FaceContent = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.image != null && Object.hasOwnProperty.call(e, "image") && c.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.FaceContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.image = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.image != null && Object.hasOwnProperty.call(e, "image")) {
          let o = c.dot.Image.verify(e.image, r + 1);
          if (o)
            return "image." + o;
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.FaceContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.FaceContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.FaceContent();
        if (e.image != null) {
          if (!l.isObject(e.image))
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          o.image = c.dot.Image.fromObject(e.image, r + 1);
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.FaceContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.image = null, i.metadata = null), e.image != null && Object.hasOwnProperty.call(e, "image") && (i.image = c.dot.Image.toObject(e.image, r, o + 1)), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FaceContent";
      }, n;
    })(), u.DocumentContent = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.image != null && Object.hasOwnProperty.call(e, "image") && c.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.DocumentContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.image = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.image != null && Object.hasOwnProperty.call(e, "image")) {
          let o = c.dot.Image.verify(e.image, r + 1);
          if (o)
            return "image." + o;
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.DocumentContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.DocumentContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.DocumentContent();
        if (e.image != null) {
          if (!l.isObject(e.image))
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          o.image = c.dot.Image.fromObject(e.image, r + 1);
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.DocumentContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.image = null, i.metadata = null), e.image != null && Object.hasOwnProperty.call(e, "image") && (i.image = c.dot.Image.toObject(e.image, r, o + 1)), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.DocumentContent";
      }, n;
    })(), u.Blob = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.documentContent = null, n.prototype.eyeGazeLivenessContent = null, n.prototype.faceContent = null, n.prototype.fingersContent = null, n.prototype.magnifeyeLivenessContent = null, n.prototype.smileLivenessContent = null, n.prototype.palmContent = null, n.prototype.travelDocumentContent = null, n.prototype.multiRangeLivenessContent = null;
      let t;
      return Object.defineProperty(n.prototype, "blob", {
        get: l.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "fingersContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent", "multiRangeLivenessContent"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && c.dot.v4.DocumentContent.encode(e.documentContent, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && c.dot.v4.FaceContent.encode(e.faceContent, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && c.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && c.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && c.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork(), o + 1).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && c.dot.v4.PalmContent.encode(e.palmContent, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork(), o + 1).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && c.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork(), o + 1).ldelim(), e.multiRangeLivenessContent != null && Object.hasOwnProperty.call(e, "multiRangeLivenessContent") && c.dot.v4.MultiRangeLivenessContent.encode(e.multiRangeLivenessContent, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork(), o + 1).ldelim(), e.fingersContent != null && Object.hasOwnProperty.call(e, "fingersContent") && c.dot.v4.FingersContent.encode(e.fingersContent, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.Blob(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.documentContent = c.dot.v4.DocumentContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 5: {
              p.eyeGazeLivenessContent = c.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.faceContent = c.dot.v4.FaceContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 9: {
              p.fingersContent = c.dot.v4.FingersContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.magnifeyeLivenessContent = c.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.smileLivenessContent = c.dot.v4.SmileLivenessContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 6: {
              p.palmContent = c.dot.v4.PalmContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 7: {
              p.travelDocumentContent = c.dot.v4.TravelDocumentContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 8: {
              p.multiRangeLivenessContent = c.dot.v4.MultiRangeLivenessContent.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        let o = {};
        if (e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent")) {
          o.blob = 1;
          {
            let i = c.dot.v4.DocumentContent.verify(e.documentContent, r + 1);
            if (i)
              return "documentContent." + i;
          }
        }
        if (e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent, r + 1);
            if (i)
              return "eyeGazeLivenessContent." + i;
          }
        }
        if (e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.FaceContent.verify(e.faceContent, r + 1);
            if (i)
              return "faceContent." + i;
          }
        }
        if (e.fingersContent != null && Object.hasOwnProperty.call(e, "fingersContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.FingersContent.verify(e.fingersContent, r + 1);
            if (i)
              return "fingersContent." + i;
          }
        }
        if (e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent, r + 1);
            if (i)
              return "magnifeyeLivenessContent." + i;
          }
        }
        if (e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent, r + 1);
            if (i)
              return "smileLivenessContent." + i;
          }
        }
        if (e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.PalmContent.verify(e.palmContent, r + 1);
            if (i)
              return "palmContent." + i;
          }
        }
        if (e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent, r + 1);
            if (i)
              return "travelDocumentContent." + i;
          }
        }
        if (e.multiRangeLivenessContent != null && Object.hasOwnProperty.call(e, "multiRangeLivenessContent")) {
          if (o.blob === 1)
            return "blob: multiple values";
          o.blob = 1;
          {
            let i = c.dot.v4.MultiRangeLivenessContent.verify(e.multiRangeLivenessContent, r + 1);
            if (i)
              return "multiRangeLivenessContent." + i;
          }
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.Blob)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.Blob: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.Blob();
        if (e.documentContent != null) {
          if (!l.isObject(e.documentContent))
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          o.documentContent = c.dot.v4.DocumentContent.fromObject(e.documentContent, r + 1);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (!l.isObject(e.eyeGazeLivenessContent))
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          o.eyeGazeLivenessContent = c.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent, r + 1);
        }
        if (e.faceContent != null) {
          if (!l.isObject(e.faceContent))
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          o.faceContent = c.dot.v4.FaceContent.fromObject(e.faceContent, r + 1);
        }
        if (e.fingersContent != null) {
          if (!l.isObject(e.fingersContent))
            throw TypeError(".dot.v4.Blob.fingersContent: object expected");
          o.fingersContent = c.dot.v4.FingersContent.fromObject(e.fingersContent, r + 1);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (!l.isObject(e.magnifeyeLivenessContent))
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          o.magnifeyeLivenessContent = c.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent, r + 1);
        }
        if (e.smileLivenessContent != null) {
          if (!l.isObject(e.smileLivenessContent))
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          o.smileLivenessContent = c.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent, r + 1);
        }
        if (e.palmContent != null) {
          if (!l.isObject(e.palmContent))
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          o.palmContent = c.dot.v4.PalmContent.fromObject(e.palmContent, r + 1);
        }
        if (e.travelDocumentContent != null) {
          if (!l.isObject(e.travelDocumentContent))
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          o.travelDocumentContent = c.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent, r + 1);
        }
        if (e.multiRangeLivenessContent != null) {
          if (!l.isObject(e.multiRangeLivenessContent))
            throw TypeError(".dot.v4.Blob.multiRangeLivenessContent: object expected");
          o.multiRangeLivenessContent = c.dot.v4.MultiRangeLivenessContent.fromObject(e.multiRangeLivenessContent, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && (i.documentContent = c.dot.v4.DocumentContent.toObject(e.documentContent, r, o + 1), r.oneofs && (i.blob = "documentContent")), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && (i.faceContent = c.dot.v4.FaceContent.toObject(e.faceContent, r, o + 1), r.oneofs && (i.blob = "faceContent")), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && (i.magnifeyeLivenessContent = c.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, r, o + 1), r.oneofs && (i.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && (i.smileLivenessContent = c.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, r, o + 1), r.oneofs && (i.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && (i.eyeGazeLivenessContent = c.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, r, o + 1), r.oneofs && (i.blob = "eyeGazeLivenessContent")), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && (i.palmContent = c.dot.v4.PalmContent.toObject(e.palmContent, r, o + 1), r.oneofs && (i.blob = "palmContent")), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && (i.travelDocumentContent = c.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, r, o + 1), r.oneofs && (i.blob = "travelDocumentContent")), e.multiRangeLivenessContent != null && Object.hasOwnProperty.call(e, "multiRangeLivenessContent") && (i.multiRangeLivenessContent = c.dot.v4.MultiRangeLivenessContent.toObject(e.multiRangeLivenessContent, r, o + 1), r.oneofs && (i.blob = "multiRangeLivenessContent")), e.fingersContent != null && Object.hasOwnProperty.call(e, "fingersContent") && (i.fingersContent = c.dot.v4.FingersContent.toObject(e.fingersContent, r, o + 1), r.oneofs && (i.blob = "fingersContent")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, n;
    })(), u.TravelDocumentContent = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.ldsMasterFile = null, n.prototype.accessControlProtocolUsed = 0, n.prototype.authenticationStatus = null, n.prototype.metadata = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && c.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && c.dot.v4.AuthenticationStatus.encode(t.authenticationStatus, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), r + 1).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && c.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.TravelDocumentContent(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.ldsMasterFile = c.dot.v4.LdsMasterFile.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              d.authenticationStatus = c.dot.v4.AuthenticationStatus.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 4: {
              d.metadata = c.dot.v4.Metadata.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile")) {
          let r = c.dot.v4.LdsMasterFile.verify(t.ldsMasterFile, e + 1);
          if (r)
            return "ldsMasterFile." + r;
        }
        if (t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed"))
          switch (t.accessControlProtocolUsed) {
            default:
              return "accessControlProtocolUsed: enum value expected";
            case 0:
            case 1:
            case 2:
              break;
          }
        if (t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus")) {
          let r = c.dot.v4.AuthenticationStatus.verify(t.authenticationStatus, e + 1);
          if (r)
            return "authenticationStatus." + r;
        }
        if (t.metadata != null && Object.hasOwnProperty.call(t, "metadata")) {
          let r = c.dot.v4.Metadata.verify(t.metadata, e + 1);
          if (r)
            return "metadata." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.TravelDocumentContent)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.TravelDocumentContent: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.TravelDocumentContent();
        if (t.ldsMasterFile != null) {
          if (!l.isObject(t.ldsMasterFile))
            throw TypeError(".dot.v4.TravelDocumentContent.ldsMasterFile: object expected");
          r.ldsMasterFile = c.dot.v4.LdsMasterFile.fromObject(t.ldsMasterFile, e + 1);
        }
        switch (t.accessControlProtocolUsed) {
          default:
            if (typeof t.accessControlProtocolUsed == "number") {
              r.accessControlProtocolUsed = t.accessControlProtocolUsed;
              break;
            }
            break;
          case "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED":
          case 0:
            r.accessControlProtocolUsed = 0;
            break;
          case "ACCESS_CONTROL_PROTOCOL_BAC":
          case 1:
            r.accessControlProtocolUsed = 1;
            break;
          case "ACCESS_CONTROL_PROTOCOL_PACE":
          case 2:
            r.accessControlProtocolUsed = 2;
            break;
        }
        if (t.authenticationStatus != null) {
          if (!l.isObject(t.authenticationStatus))
            throw TypeError(".dot.v4.TravelDocumentContent.authenticationStatus: object expected");
          r.authenticationStatus = c.dot.v4.AuthenticationStatus.fromObject(t.authenticationStatus, e + 1);
        }
        if (t.metadata != null) {
          if (!l.isObject(t.metadata))
            throw TypeError(".dot.v4.TravelDocumentContent.metadata: object expected");
          r.metadata = c.dot.v4.Metadata.fromObject(t.metadata, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.ldsMasterFile = null, o.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, o.authenticationStatus = null, o.metadata = null), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && (o.ldsMasterFile = c.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e, r + 1)), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && (o.accessControlProtocolUsed = e.enums === String ? c.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : c.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && (o.authenticationStatus = c.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e, r + 1)), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && (o.metadata = c.dot.v4.Metadata.toObject(t.metadata, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, n;
    })(), u.LdsMasterFile = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.lds1eMrtdApplication = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && c.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.LdsMasterFile(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          p >>> 3 === 1 ? d.lds1eMrtdApplication = c.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32(), void 0, o + 1) : t.skipType(p & 7, o);
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication")) {
          let r = c.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication, e + 1);
          if (r)
            return "lds1eMrtdApplication." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.LdsMasterFile)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.LdsMasterFile: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (!l.isObject(t.lds1eMrtdApplication))
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          r.lds1eMrtdApplication = c.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && (o.lds1eMrtdApplication = c.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, n;
    })(), u.Lds1eMrtdApplication = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.comHeaderAndDataGroupPresenceInformation = null, n.prototype.sodDocumentSecurityObject = null, n.prototype.dg1MachineReadableZoneInformation = null, n.prototype.dg2EncodedIdentificationFeaturesFace = null, n.prototype.dg3AdditionalIdentificationFeatureFingers = null, n.prototype.dg4AdditionalIdentificationFeatureIrises = null, n.prototype.dg5DisplayedPortrait = null, n.prototype.dg7DisplayedSignatureOrUsualMark = null, n.prototype.dg8DataFeatures = null, n.prototype.dg9StructureFeatures = null, n.prototype.dg10SubstanceFeatures = null, n.prototype.dg11AdditionalPersonalDetails = null, n.prototype.dg12AdditionalDocumentDetails = null, n.prototype.dg13OptionalDetails = null, n.prototype.dg14SecurityOptions = null, n.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, n.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(n.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: l.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: l.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg5DisplayedPortrait", {
        get: l.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: l.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg8DataFeatures", {
        get: l.oneOfGetter(t = ["dg8DataFeatures"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg9StructureFeatures", {
        get: l.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg10SubstanceFeatures", {
        get: l.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg11AdditionalPersonalDetails", {
        get: l.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg12AdditionalDocumentDetails", {
        get: l.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg13OptionalDetails", {
        get: l.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg14SecurityOptions", {
        get: l.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: l.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_dg16PersonsToNotify", {
        get: l.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && c.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && c.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && c.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && c.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && c.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, r.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork(), o + 1).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && c.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, r.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork(), o + 1).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && c.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, r.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork(), o + 1).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && c.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, r.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork(), o + 1).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && c.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, r.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork(), o + 1).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && c.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, r.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork(), o + 1).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && c.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, r.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork(), o + 1).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && c.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, r.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork(), o + 1).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && c.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, r.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork(), o + 1).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && c.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, r.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork(), o + 1).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && c.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, r.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork(), o + 1).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && c.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, r.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork(), o + 1).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && c.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, r.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.Lds1eMrtdApplication(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.comHeaderAndDataGroupPresenceInformation = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.sodDocumentSecurityObject = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.dg1MachineReadableZoneInformation = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.dg2EncodedIdentificationFeaturesFace = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 5: {
              p.dg3AdditionalIdentificationFeatureFingers = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 6: {
              p.dg4AdditionalIdentificationFeatureIrises = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 7: {
              p.dg5DisplayedPortrait = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 8: {
              p.dg7DisplayedSignatureOrUsualMark = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 9: {
              p.dg8DataFeatures = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 10: {
              p.dg9StructureFeatures = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 11: {
              p.dg10SubstanceFeatures = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 12: {
              p.dg11AdditionalPersonalDetails = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 13: {
              p.dg12AdditionalDocumentDetails = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 14: {
              p.dg13OptionalDetails = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 15: {
              p.dg14SecurityOptions = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 16: {
              p.dg15ActiveAuthenticationPublicKeyInfo = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 17: {
              p.dg16PersonsToNotify = c.dot.v4.Lds1ElementaryFile.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation, r + 1);
          if (o)
            return "comHeaderAndDataGroupPresenceInformation." + o;
        }
        if (e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject, r + 1);
          if (o)
            return "sodDocumentSecurityObject." + o;
        }
        if (e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation, r + 1);
          if (o)
            return "dg1MachineReadableZoneInformation." + o;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace, r + 1);
          if (o)
            return "dg2EncodedIdentificationFeaturesFace." + o;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers, r + 1);
          if (o)
            return "dg3AdditionalIdentificationFeatureFingers." + o;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises, r + 1);
          if (o)
            return "dg4AdditionalIdentificationFeatureIrises." + o;
        }
        if (e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait, r + 1);
          if (o)
            return "dg5DisplayedPortrait." + o;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark, r + 1);
          if (o)
            return "dg7DisplayedSignatureOrUsualMark." + o;
        }
        if (e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures, r + 1);
          if (o)
            return "dg8DataFeatures." + o;
        }
        if (e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures, r + 1);
          if (o)
            return "dg9StructureFeatures." + o;
        }
        if (e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures, r + 1);
          if (o)
            return "dg10SubstanceFeatures." + o;
        }
        if (e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails, r + 1);
          if (o)
            return "dg11AdditionalPersonalDetails." + o;
        }
        if (e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails, r + 1);
          if (o)
            return "dg12AdditionalDocumentDetails." + o;
        }
        if (e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails, r + 1);
          if (o)
            return "dg13OptionalDetails." + o;
        }
        if (e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions, r + 1);
          if (o)
            return "dg14SecurityOptions." + o;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo, r + 1);
          if (o)
            return "dg15ActiveAuthenticationPublicKeyInfo." + o;
        }
        if (e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify")) {
          let o = c.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify, r + 1);
          if (o)
            return "dg16PersonsToNotify." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.Lds1eMrtdApplication)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.Lds1eMrtdApplication: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (!l.isObject(e.comHeaderAndDataGroupPresenceInformation))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          o.comHeaderAndDataGroupPresenceInformation = c.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation, r + 1);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (!l.isObject(e.sodDocumentSecurityObject))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          o.sodDocumentSecurityObject = c.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject, r + 1);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (!l.isObject(e.dg1MachineReadableZoneInformation))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          o.dg1MachineReadableZoneInformation = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation, r + 1);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (!l.isObject(e.dg2EncodedIdentificationFeaturesFace))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          o.dg2EncodedIdentificationFeaturesFace = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace, r + 1);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (!l.isObject(e.dg3AdditionalIdentificationFeatureFingers))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          o.dg3AdditionalIdentificationFeatureFingers = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers, r + 1);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (!l.isObject(e.dg4AdditionalIdentificationFeatureIrises))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          o.dg4AdditionalIdentificationFeatureIrises = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises, r + 1);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (!l.isObject(e.dg5DisplayedPortrait))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          o.dg5DisplayedPortrait = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait, r + 1);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (!l.isObject(e.dg7DisplayedSignatureOrUsualMark))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          o.dg7DisplayedSignatureOrUsualMark = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark, r + 1);
        }
        if (e.dg8DataFeatures != null) {
          if (!l.isObject(e.dg8DataFeatures))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          o.dg8DataFeatures = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures, r + 1);
        }
        if (e.dg9StructureFeatures != null) {
          if (!l.isObject(e.dg9StructureFeatures))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          o.dg9StructureFeatures = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures, r + 1);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (!l.isObject(e.dg10SubstanceFeatures))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          o.dg10SubstanceFeatures = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures, r + 1);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (!l.isObject(e.dg11AdditionalPersonalDetails))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          o.dg11AdditionalPersonalDetails = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails, r + 1);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (!l.isObject(e.dg12AdditionalDocumentDetails))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          o.dg12AdditionalDocumentDetails = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails, r + 1);
        }
        if (e.dg13OptionalDetails != null) {
          if (!l.isObject(e.dg13OptionalDetails))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          o.dg13OptionalDetails = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails, r + 1);
        }
        if (e.dg14SecurityOptions != null) {
          if (!l.isObject(e.dg14SecurityOptions))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          o.dg14SecurityOptions = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions, r + 1);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (!l.isObject(e.dg15ActiveAuthenticationPublicKeyInfo))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          o.dg15ActiveAuthenticationPublicKeyInfo = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo, r + 1);
        }
        if (e.dg16PersonsToNotify != null) {
          if (!l.isObject(e.dg16PersonsToNotify))
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          o.dg16PersonsToNotify = c.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.comHeaderAndDataGroupPresenceInformation = null, i.sodDocumentSecurityObject = null, i.dg1MachineReadableZoneInformation = null, i.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && (i.comHeaderAndDataGroupPresenceInformation = c.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, r, o + 1)), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && (i.sodDocumentSecurityObject = c.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, r, o + 1)), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && (i.dg1MachineReadableZoneInformation = c.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, r, o + 1)), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && (i.dg2EncodedIdentificationFeaturesFace = c.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, r, o + 1)), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && (i.dg3AdditionalIdentificationFeatureFingers = c.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, r, o + 1), r.oneofs && (i._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && (i.dg4AdditionalIdentificationFeatureIrises = c.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, r, o + 1), r.oneofs && (i._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && (i.dg5DisplayedPortrait = c.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, r, o + 1), r.oneofs && (i._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && (i.dg7DisplayedSignatureOrUsualMark = c.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, r, o + 1), r.oneofs && (i._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && (i.dg8DataFeatures = c.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, r, o + 1), r.oneofs && (i._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && (i.dg9StructureFeatures = c.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, r, o + 1), r.oneofs && (i._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && (i.dg10SubstanceFeatures = c.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, r, o + 1), r.oneofs && (i._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && (i.dg11AdditionalPersonalDetails = c.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, r, o + 1), r.oneofs && (i._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && (i.dg12AdditionalDocumentDetails = c.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, r, o + 1), r.oneofs && (i._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && (i.dg13OptionalDetails = c.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, r, o + 1), r.oneofs && (i._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && (i.dg14SecurityOptions = c.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, r, o + 1), r.oneofs && (i._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && (i.dg15ActiveAuthenticationPublicKeyInfo = c.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, r, o + 1), r.oneofs && (i._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && (i.dg16PersonsToNotify = c.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, r, o + 1), r.oneofs && (i._dg16PersonsToNotify = "dg16PersonsToNotify")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, n;
    })(), u.Lds1ElementaryFile = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.id = 0, n.prototype.bytes = null;
      let t;
      return Object.defineProperty(n.prototype, "_bytes", {
        get: l.oneOfGetter(t = ["bytes"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.id != null && Object.hasOwnProperty.call(e, "id") && r.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.Lds1ElementaryFile(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.id = e.int32();
              break;
            }
            case 2: {
              p.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.id != null && Object.hasOwnProperty.call(e, "id"))
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
        return e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && !(e.bytes && typeof e.bytes.length == "number" || l.isString(e.bytes)) ? "bytes: buffer expected" : null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.Lds1ElementaryFile)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.Lds1ElementaryFile: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.Lds1ElementaryFile();
        switch (e.id) {
          default:
            if (typeof e.id == "number") {
              o.id = e.id;
              break;
            }
            break;
          case "ID_UNSPECIFIED":
          case 0:
            o.id = 0;
            break;
          case "ID_COM":
          case 1:
            o.id = 1;
            break;
          case "ID_SOD":
          case 2:
            o.id = 2;
            break;
          case "ID_DG1":
          case 3:
            o.id = 3;
            break;
          case "ID_DG2":
          case 4:
            o.id = 4;
            break;
          case "ID_DG3":
          case 5:
            o.id = 5;
            break;
          case "ID_DG4":
          case 6:
            o.id = 6;
            break;
          case "ID_DG5":
          case 7:
            o.id = 7;
            break;
          case "ID_DG7":
          case 8:
            o.id = 8;
            break;
          case "ID_DG8":
          case 9:
            o.id = 9;
            break;
          case "ID_DG9":
          case 10:
            o.id = 10;
            break;
          case "ID_DG10":
          case 11:
            o.id = 11;
            break;
          case "ID_DG11":
          case 12:
            o.id = 12;
            break;
          case "ID_DG12":
          case 13:
            o.id = 13;
            break;
          case "ID_DG13":
          case 14:
            o.id = 14;
            break;
          case "ID_DG14":
          case 15:
            o.id = 15;
            break;
          case "ID_DG15":
          case 16:
            o.id = 16;
            break;
          case "ID_DG16":
          case 17:
            o.id = 17;
            break;
        }
        return e.bytes != null && (typeof e.bytes == "string" ? l.base64.decode(e.bytes, o.bytes = l.newBuffer(l.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (o.bytes = e.bytes)), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.id = r.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && Object.hasOwnProperty.call(e, "id") && (i.id = r.enums === String ? c.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : c.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && (i.bytes = r.bytes === String ? l.base64.encode(e.bytes, 0, e.bytes.length) : r.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, r.oneofs && (i._bytes = "bytes")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, n.Id = (function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "ID_UNSPECIFIED"] = 0, r[e[1] = "ID_COM"] = 1, r[e[2] = "ID_SOD"] = 2, r[e[3] = "ID_DG1"] = 3, r[e[4] = "ID_DG2"] = 4, r[e[5] = "ID_DG3"] = 5, r[e[6] = "ID_DG4"] = 6, r[e[7] = "ID_DG5"] = 7, r[e[8] = "ID_DG7"] = 8, r[e[9] = "ID_DG8"] = 9, r[e[10] = "ID_DG9"] = 10, r[e[11] = "ID_DG10"] = 11, r[e[12] = "ID_DG11"] = 12, r[e[13] = "ID_DG12"] = 13, r[e[14] = "ID_DG13"] = 14, r[e[15] = "ID_DG14"] = 15, r[e[16] = "ID_DG15"] = 16, r[e[17] = "ID_DG16"] = 17, r;
      })(), n;
    })(), u.AccessControlProtocol = (function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[n[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[n[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    })(), u.AuthenticationStatus = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.data = null, n.prototype.chip = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.data != null && Object.hasOwnProperty.call(t, "data") && c.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && c.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.AuthenticationStatus(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.data = c.dot.v4.DataAuthenticationStatus.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.chip = c.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.data != null && Object.hasOwnProperty.call(t, "data")) {
          let r = c.dot.v4.DataAuthenticationStatus.verify(t.data, e + 1);
          if (r)
            return "data." + r;
        }
        if (t.chip != null && Object.hasOwnProperty.call(t, "chip")) {
          let r = c.dot.v4.ChipAuthenticationStatus.verify(t.chip, e + 1);
          if (r)
            return "chip." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.AuthenticationStatus)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.AuthenticationStatus: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.AuthenticationStatus();
        if (t.data != null) {
          if (!l.isObject(t.data))
            throw TypeError(".dot.v4.AuthenticationStatus.data: object expected");
          r.data = c.dot.v4.DataAuthenticationStatus.fromObject(t.data, e + 1);
        }
        if (t.chip != null) {
          if (!l.isObject(t.chip))
            throw TypeError(".dot.v4.AuthenticationStatus.chip: object expected");
          r.chip = c.dot.v4.ChipAuthenticationStatus.fromObject(t.chip, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.data = null, o.chip = null), t.data != null && Object.hasOwnProperty.call(t, "data") && (o.data = c.dot.v4.DataAuthenticationStatus.toObject(t.data, e, r + 1)), t.chip != null && Object.hasOwnProperty.call(t, "chip") && (o.chip = c.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, n;
    })(), u.DataAuthenticationStatus = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.status = 0, n.prototype.protocol = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.DataAuthenticationStatus(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.status = t.int32();
              break;
            }
            case 2: {
              d.protocol = t.int32();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.status != null && Object.hasOwnProperty.call(t, "status"))
          switch (t.status) {
            default:
              return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        if (t.protocol != null && Object.hasOwnProperty.call(t, "protocol"))
          switch (t.protocol) {
            default:
              return "protocol: enum value expected";
            case 0:
            case 1:
              break;
          }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.DataAuthenticationStatus)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.DataAuthenticationStatus: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.DataAuthenticationStatus();
        switch (t.status) {
          default:
            if (typeof t.status == "number") {
              r.status = t.status;
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
          case "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED":
          case 3:
            r.status = 3;
            break;
        }
        switch (t.protocol) {
          default:
            if (typeof t.protocol == "number") {
              r.protocol = t.protocol;
              break;
            }
            break;
          case "PROTOCOL_UNSPECIFIED":
          case 0:
            r.protocol = 0;
            break;
          case "PROTOCOL_PASSIVE_AUTHENTICATION":
          case 1:
            r.protocol = 1;
            break;
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, o.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && Object.hasOwnProperty.call(t, "status") && (o.status = e.enums === String ? c.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : c.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && (o.protocol = e.enums === String ? c.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : c.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, n.Status = (function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      })(), n.Protocol = (function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      })(), n;
    })(), u.ChipAuthenticationStatus = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.status = 0, n.prototype.protocol = null, n.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(n.prototype, "_protocol", {
        get: l.oneOfGetter(t = ["protocol"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_activeAuthenticationResponse", {
        get: l.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.status != null && Object.hasOwnProperty.call(e, "status") && r.uint32(
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
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.ChipAuthenticationStatus(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.status = e.int32();
              break;
            }
            case 2: {
              p.protocol = e.int32();
              break;
            }
            case 3: {
              p.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.status != null && Object.hasOwnProperty.call(e, "status"))
          switch (e.status) {
            default:
              return "status: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        if (e.protocol != null && Object.hasOwnProperty.call(e, "protocol"))
          switch (e.protocol) {
            default:
              return "protocol: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        return e.activeAuthenticationResponse != null && Object.hasOwnProperty.call(e, "activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || l.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.ChipAuthenticationStatus)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.ChipAuthenticationStatus: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.ChipAuthenticationStatus();
        switch (e.status) {
          default:
            if (typeof e.status == "number") {
              o.status = e.status;
              break;
            }
            break;
          case "STATUS_UNSPECIFIED":
          case 0:
            o.status = 0;
            break;
          case "STATUS_AUTHENTICATED":
          case 1:
            o.status = 1;
            break;
          case "STATUS_DENIED":
          case 2:
            o.status = 2;
            break;
          case "STATUS_NOT_SUPPORTED":
          case 3:
            o.status = 3;
            break;
        }
        switch (e.protocol) {
          default:
            if (typeof e.protocol == "number") {
              o.protocol = e.protocol;
              break;
            }
            break;
          case "PROTOCOL_UNSPECIFIED":
          case 0:
            o.protocol = 0;
            break;
          case "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING":
          case 1:
            o.protocol = 1;
            break;
          case "PROTOCOL_CHIP_AUTHENTICATION":
          case 2:
            o.protocol = 2;
            break;
          case "PROTOCOL_ACTIVE_AUTHENTICATION":
          case 3:
            o.protocol = 3;
            break;
        }
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? l.base64.decode(e.activeAuthenticationResponse, o.activeAuthenticationResponse = l.newBuffer(l.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (o.activeAuthenticationResponse = e.activeAuthenticationResponse)), o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.status = r.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && Object.hasOwnProperty.call(e, "status") && (i.status = r.enums === String ? c.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : c.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && Object.hasOwnProperty.call(e, "protocol") && (i.protocol = r.enums === String ? c.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : c.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, r.oneofs && (i._protocol = "protocol")), e.activeAuthenticationResponse != null && Object.hasOwnProperty.call(e, "activeAuthenticationResponse") && (i.activeAuthenticationResponse = r.bytes === String ? l.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : r.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, r.oneofs && (i._activeAuthenticationResponse = "activeAuthenticationResponse")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, n.Status = (function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "STATUS_UNSPECIFIED"] = 0, r[e[1] = "STATUS_AUTHENTICATED"] = 1, r[e[2] = "STATUS_DENIED"] = 2, r[e[3] = "STATUS_NOT_SUPPORTED"] = 3, r;
      })(), n.Protocol = (function() {
        const e = {}, r = Object.create(e);
        return r[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, r[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, r[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, r[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, r;
      })(), n;
    })(), u.FingersContent = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.images = null, n.prototype.requestCaptureImage = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_requestCaptureImage", {
        get: l.oneOfGetter(t = ["requestCaptureImage"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.images != null && Object.hasOwnProperty.call(e, "images") && c.dot.v4.FingerImages.encode(e.images, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.requestCaptureImage != null && Object.hasOwnProperty.call(e, "requestCaptureImage") && c.dot.Image.encode(e.requestCaptureImage, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.FingersMetadata.encode(e.metadata, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.FingersContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.images = c.dot.v4.FingerImages.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.requestCaptureImage = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.metadata = c.dot.v4.FingersMetadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.images != null && Object.hasOwnProperty.call(e, "images")) {
          let o = c.dot.v4.FingerImages.verify(e.images, r + 1);
          if (o)
            return "images." + o;
        }
        if (e.requestCaptureImage != null && Object.hasOwnProperty.call(e, "requestCaptureImage")) {
          let o = c.dot.Image.verify(e.requestCaptureImage, r + 1);
          if (o)
            return "requestCaptureImage." + o;
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.FingersMetadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.FingersContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.FingersContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.FingersContent();
        if (e.images != null) {
          if (!l.isObject(e.images))
            throw TypeError(".dot.v4.FingersContent.images: object expected");
          o.images = c.dot.v4.FingerImages.fromObject(e.images, r + 1);
        }
        if (e.requestCaptureImage != null) {
          if (!l.isObject(e.requestCaptureImage))
            throw TypeError(".dot.v4.FingersContent.requestCaptureImage: object expected");
          o.requestCaptureImage = c.dot.Image.fromObject(e.requestCaptureImage, r + 1);
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.FingersContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.FingersContent.metadata: object expected");
          o.metadata = c.dot.v4.FingersMetadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.images = null, i.metadata = null), e.images != null && Object.hasOwnProperty.call(e, "images") && (i.images = c.dot.v4.FingerImages.toObject(e.images, r, o + 1)), e.requestCaptureImage != null && Object.hasOwnProperty.call(e, "requestCaptureImage") && (i.requestCaptureImage = c.dot.Image.toObject(e.requestCaptureImage, r, o + 1), r.oneofs && (i._requestCaptureImage = "requestCaptureImage")), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.FingersMetadata.toObject(e.metadata, r, o + 1)), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FingersContent";
      }, n;
    })(), u.FingerImages = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.index = null, n.prototype.middle = null, n.prototype.ring = null, n.prototype.little = null;
      let t;
      return Object.defineProperty(n.prototype, "_index", {
        get: l.oneOfGetter(t = ["index"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_middle", {
        get: l.oneOfGetter(t = ["middle"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_ring", {
        get: l.oneOfGetter(t = ["ring"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_little", {
        get: l.oneOfGetter(t = ["little"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.index != null && Object.hasOwnProperty.call(e, "index") && c.dot.Image.encode(e.index, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.middle != null && Object.hasOwnProperty.call(e, "middle") && c.dot.Image.encode(e.middle, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.ring != null && Object.hasOwnProperty.call(e, "ring") && c.dot.Image.encode(e.ring, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.little != null && Object.hasOwnProperty.call(e, "little") && c.dot.Image.encode(e.little, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.FingerImages(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.index = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.middle = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.ring = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.little = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.index != null && Object.hasOwnProperty.call(e, "index")) {
          let o = c.dot.Image.verify(e.index, r + 1);
          if (o)
            return "index." + o;
        }
        if (e.middle != null && Object.hasOwnProperty.call(e, "middle")) {
          let o = c.dot.Image.verify(e.middle, r + 1);
          if (o)
            return "middle." + o;
        }
        if (e.ring != null && Object.hasOwnProperty.call(e, "ring")) {
          let o = c.dot.Image.verify(e.ring, r + 1);
          if (o)
            return "ring." + o;
        }
        if (e.little != null && Object.hasOwnProperty.call(e, "little")) {
          let o = c.dot.Image.verify(e.little, r + 1);
          if (o)
            return "little." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.FingerImages)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.FingerImages: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.FingerImages();
        if (e.index != null) {
          if (!l.isObject(e.index))
            throw TypeError(".dot.v4.FingerImages.index: object expected");
          o.index = c.dot.Image.fromObject(e.index, r + 1);
        }
        if (e.middle != null) {
          if (!l.isObject(e.middle))
            throw TypeError(".dot.v4.FingerImages.middle: object expected");
          o.middle = c.dot.Image.fromObject(e.middle, r + 1);
        }
        if (e.ring != null) {
          if (!l.isObject(e.ring))
            throw TypeError(".dot.v4.FingerImages.ring: object expected");
          o.ring = c.dot.Image.fromObject(e.ring, r + 1);
        }
        if (e.little != null) {
          if (!l.isObject(e.little))
            throw TypeError(".dot.v4.FingerImages.little: object expected");
          o.little = c.dot.Image.fromObject(e.little, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return e.index != null && Object.hasOwnProperty.call(e, "index") && (i.index = c.dot.Image.toObject(e.index, r, o + 1), r.oneofs && (i._index = "index")), e.middle != null && Object.hasOwnProperty.call(e, "middle") && (i.middle = c.dot.Image.toObject(e.middle, r, o + 1), r.oneofs && (i._middle = "middle")), e.ring != null && Object.hasOwnProperty.call(e, "ring") && (i.ring = c.dot.Image.toObject(e.ring, r, o + 1), r.oneofs && (i._ring = "ring")), e.little != null && Object.hasOwnProperty.call(e, "little") && (i.little = c.dot.Image.toObject(e.little, r, o + 1), r.oneofs && (i._little = "little")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FingerImages";
      }, n;
    })(), u.FingersMetadata = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.common = null, n.prototype.yuv420ImageCropFingerType = null;
      let t;
      return Object.defineProperty(n.prototype, "_yuv420ImageCropFingerType", {
        get: l.oneOfGetter(t = ["yuv420ImageCropFingerType"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.common != null && Object.hasOwnProperty.call(e, "common") && c.dot.v4.Metadata.encode(e.common, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.yuv420ImageCropFingerType != null && Object.hasOwnProperty.call(e, "yuv420ImageCropFingerType") && r.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(e.yuv420ImageCropFingerType), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.FingersMetadata(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.common = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.yuv420ImageCropFingerType = e.int32();
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.common != null && Object.hasOwnProperty.call(e, "common")) {
          let o = c.dot.v4.Metadata.verify(e.common, r + 1);
          if (o)
            return "common." + o;
        }
        if (e.yuv420ImageCropFingerType != null && Object.hasOwnProperty.call(e, "yuv420ImageCropFingerType"))
          switch (e.yuv420ImageCropFingerType) {
            default:
              return "yuv420ImageCropFingerType: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
              break;
          }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.FingersMetadata)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.FingersMetadata: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.FingersMetadata();
        if (e.common != null) {
          if (!l.isObject(e.common))
            throw TypeError(".dot.v4.FingersMetadata.common: object expected");
          o.common = c.dot.v4.Metadata.fromObject(e.common, r + 1);
        }
        switch (e.yuv420ImageCropFingerType) {
          default:
            if (typeof e.yuv420ImageCropFingerType == "number") {
              o.yuv420ImageCropFingerType = e.yuv420ImageCropFingerType;
              break;
            }
            break;
          case "FINGER_TYPE_UNSPECIFIED":
          case 0:
            o.yuv420ImageCropFingerType = 0;
            break;
          case "FINGER_TYPE_INDEX":
          case 1:
            o.yuv420ImageCropFingerType = 1;
            break;
          case "FINGER_TYPE_MIDDLE":
          case 2:
            o.yuv420ImageCropFingerType = 2;
            break;
          case "FINGER_TYPE_RING":
          case 3:
            o.yuv420ImageCropFingerType = 3;
            break;
          case "FINGER_TYPE_LITTLE":
          case 4:
            o.yuv420ImageCropFingerType = 4;
            break;
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.common = null), e.common != null && Object.hasOwnProperty.call(e, "common") && (i.common = c.dot.v4.Metadata.toObject(e.common, r, o + 1)), e.yuv420ImageCropFingerType != null && Object.hasOwnProperty.call(e, "yuv420ImageCropFingerType") && (i.yuv420ImageCropFingerType = r.enums === String ? c.dot.v4.FingerType[e.yuv420ImageCropFingerType] === void 0 ? e.yuv420ImageCropFingerType : c.dot.v4.FingerType[e.yuv420ImageCropFingerType] : e.yuv420ImageCropFingerType, r.oneofs && (i._yuv420ImageCropFingerType = "yuv420ImageCropFingerType")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FingersMetadata";
      }, n;
    })(), u.FingerType = (function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "FINGER_TYPE_UNSPECIFIED"] = 0, t[n[1] = "FINGER_TYPE_INDEX"] = 1, t[n[2] = "FINGER_TYPE_MIDDLE"] = 2, t[n[3] = "FINGER_TYPE_RING"] = 3, t[n[4] = "FINGER_TYPE_LITTLE"] = 4, t;
    })(), u.EyeGazeLivenessContent = (function() {
      function n(e) {
        if (this.segments = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.segments = l.emptyArray, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_image", {
        get: l.oneOfGetter(t = ["image"]),
        set: l.oneOfSetter(t)
      }), Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.segments != null && e.segments.length)
          for (let i = 0; i < e.segments.length; ++i)
            c.dot.v4.EyeGazeLivenessSegment.encode(e.segments[i], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork(), o + 1).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && c.dot.Image.encode(e.image, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.EyeGazeLivenessContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 3: {
              p.image = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 1: {
              p.segments && p.segments.length || (p.segments = []), p.segments.push(c.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 4: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.image != null && Object.hasOwnProperty.call(e, "image")) {
          let o = c.dot.Image.verify(e.image, r + 1);
          if (o)
            return "image." + o;
        }
        if (e.segments != null && Object.hasOwnProperty.call(e, "segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let o = 0; o < e.segments.length; ++o) {
            let i = c.dot.v4.EyeGazeLivenessSegment.verify(e.segments[o], r + 1);
            if (i)
              return "segments." + i;
          }
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.EyeGazeLivenessContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.EyeGazeLivenessContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (!l.isObject(e.image))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          o.image = c.dot.Image.fromObject(e.image, r + 1);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          o.segments = [];
          for (let i = 0; i < e.segments.length; ++i) {
            if (!l.isObject(e.segments[i]))
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            o.segments[i] = c.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[i], r + 1);
          }
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        if ((r.arrays || r.defaults) && (i.segments = []), r.defaults && (i.metadata = null), e.segments && e.segments.length) {
          i.segments = [];
          for (let d = 0; d < e.segments.length; ++d)
            i.segments[d] = c.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[d], r, o + 1);
        }
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.image != null && Object.hasOwnProperty.call(e, "image") && (i.image = c.dot.Image.toObject(e.image, r, o + 1), r.oneofs && (i._image = "image")), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, n;
    })(), u.EyeGazeLivenessSegment = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.corner = 0, n.prototype.image = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.EyeGazeLivenessSegment(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.corner = t.int32();
              break;
            }
            case 2: {
              d.image = c.dot.Image.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.corner != null && Object.hasOwnProperty.call(t, "corner"))
          switch (t.corner) {
            default:
              return "corner: enum value expected";
            case 0:
            case 1:
            case 2:
            case 3:
              break;
          }
        if (t.image != null && Object.hasOwnProperty.call(t, "image")) {
          let r = c.dot.Image.verify(t.image, e + 1);
          if (r)
            return "image." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.EyeGazeLivenessSegment)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.EyeGazeLivenessSegment: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.EyeGazeLivenessSegment();
        switch (t.corner) {
          default:
            if (typeof t.corner == "number") {
              r.corner = t.corner;
              break;
            }
            break;
          case "TOP_LEFT":
          case 0:
            r.corner = 0;
            break;
          case "TOP_RIGHT":
          case 1:
            r.corner = 1;
            break;
          case "BOTTOM_RIGHT":
          case 2:
            r.corner = 2;
            break;
          case "BOTTOM_LEFT":
          case 3:
            r.corner = 3;
            break;
        }
        if (t.image != null) {
          if (!l.isObject(t.image))
            throw TypeError(".dot.v4.EyeGazeLivenessSegment.image: object expected");
          r.image = c.dot.Image.fromObject(t.image, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.corner = e.enums === String ? "TOP_LEFT" : 0, o.image = null), t.corner != null && Object.hasOwnProperty.call(t, "corner") && (o.corner = e.enums === String ? c.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : c.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && (o.image = c.dot.Image.toObject(t.image, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, n;
    })(), u.EyeGazeLivenessCorner = (function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "TOP_LEFT"] = 0, t[n[1] = "TOP_RIGHT"] = 1, t[n[2] = "BOTTOM_RIGHT"] = 2, t[n[3] = "BOTTOM_LEFT"] = 3, t;
    })(), u.MultiRangeLivenessContent = (function() {
      function n(e) {
        if (this.stepResults = [], e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.stepResults = l.emptyArray, n.prototype.metadata = null, n.prototype.video = null, n.prototype.multiRangeLivenessMetadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        if (e.stepResults != null && e.stepResults.length)
          for (let i = 0; i < e.stepResults.length; ++i)
            c.dot.v4.MultiRangeLivenessStepResult.encode(e.stepResults[i], r.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork(), o + 1).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.multiRangeLivenessMetadata != null && Object.hasOwnProperty.call(e, "multiRangeLivenessMetadata") && c.dot.v4.MultiRangeLivenessMetadata.encode(e.multiRangeLivenessMetadata, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.MultiRangeLivenessContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.stepResults && p.stepResults.length || (p.stepResults = []), p.stepResults.push(c.dot.v4.MultiRangeLivenessStepResult.decode(e, e.uint32(), void 0, i + 1));
              break;
            }
            case 2: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.multiRangeLivenessMetadata = c.dot.v4.MultiRangeLivenessMetadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.stepResults != null && Object.hasOwnProperty.call(e, "stepResults")) {
          if (!Array.isArray(e.stepResults))
            return "stepResults: array expected";
          for (let o = 0; o < e.stepResults.length; ++o) {
            let i = c.dot.v4.MultiRangeLivenessStepResult.verify(e.stepResults[o], r + 1);
            if (i)
              return "stepResults." + i;
          }
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.multiRangeLivenessMetadata != null && Object.hasOwnProperty.call(e, "multiRangeLivenessMetadata")) {
          let o = c.dot.v4.MultiRangeLivenessMetadata.verify(e.multiRangeLivenessMetadata, r + 1);
          if (o)
            return "multiRangeLivenessMetadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.MultiRangeLivenessContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.MultiRangeLivenessContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.MultiRangeLivenessContent();
        if (e.stepResults) {
          if (!Array.isArray(e.stepResults))
            throw TypeError(".dot.v4.MultiRangeLivenessContent.stepResults: array expected");
          o.stepResults = [];
          for (let i = 0; i < e.stepResults.length; ++i) {
            if (!l.isObject(e.stepResults[i]))
              throw TypeError(".dot.v4.MultiRangeLivenessContent.stepResults: object expected");
            o.stepResults[i] = c.dot.v4.MultiRangeLivenessStepResult.fromObject(e.stepResults[i], r + 1);
          }
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.MultiRangeLivenessContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.MultiRangeLivenessContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.multiRangeLivenessMetadata != null) {
          if (!l.isObject(e.multiRangeLivenessMetadata))
            throw TypeError(".dot.v4.MultiRangeLivenessContent.multiRangeLivenessMetadata: object expected");
          o.multiRangeLivenessMetadata = c.dot.v4.MultiRangeLivenessMetadata.fromObject(e.multiRangeLivenessMetadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        if ((r.arrays || r.defaults) && (i.stepResults = []), r.defaults && (i.metadata = null, i.multiRangeLivenessMetadata = null), e.stepResults && e.stepResults.length) {
          i.stepResults = [];
          for (let d = 0; d < e.stepResults.length; ++d)
            i.stepResults[d] = c.dot.v4.MultiRangeLivenessStepResult.toObject(e.stepResults[d], r, o + 1);
        }
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), e.multiRangeLivenessMetadata != null && Object.hasOwnProperty.call(e, "multiRangeLivenessMetadata") && (i.multiRangeLivenessMetadata = c.dot.v4.MultiRangeLivenessMetadata.toObject(e.multiRangeLivenessMetadata, r, o + 1)), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MultiRangeLivenessContent";
      }, n;
    })(), u.MultiRangeLivenessStepResult = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.challengeItem = 0, n.prototype.image = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.challengeItem != null && Object.hasOwnProperty.call(t, "challengeItem") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.challengeItem), t.image != null && Object.hasOwnProperty.call(t, "image") && c.dot.ImageWithTimestamp.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.MultiRangeLivenessStepResult(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.challengeItem = t.int32();
              break;
            }
            case 2: {
              d.image = c.dot.ImageWithTimestamp.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.challengeItem != null && Object.hasOwnProperty.call(t, "challengeItem"))
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
        if (t.image != null && Object.hasOwnProperty.call(t, "image")) {
          let r = c.dot.ImageWithTimestamp.verify(t.image, e + 1);
          if (r)
            return "image." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.MultiRangeLivenessStepResult)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.MultiRangeLivenessStepResult: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.MultiRangeLivenessStepResult();
        switch (t.challengeItem) {
          default:
            if (typeof t.challengeItem == "number") {
              r.challengeItem = t.challengeItem;
              break;
            }
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED":
          case 0:
            r.challengeItem = 0;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ZERO":
          case 1:
            r.challengeItem = 1;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ONE":
          case 2:
            r.challengeItem = 2;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_TWO":
          case 3:
            r.challengeItem = 3;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_THREE":
          case 4:
            r.challengeItem = 4;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FOUR":
          case 5:
            r.challengeItem = 5;
            break;
          case "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FIVE":
          case 6:
            r.challengeItem = 6;
            break;
        }
        if (t.image != null) {
          if (!l.isObject(t.image))
            throw TypeError(".dot.v4.MultiRangeLivenessStepResult.image: object expected");
          r.image = c.dot.ImageWithTimestamp.fromObject(t.image, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.challengeItem = e.enums === String ? "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED" : 0, o.image = null), t.challengeItem != null && Object.hasOwnProperty.call(t, "challengeItem") && (o.challengeItem = e.enums === String ? c.dot.v4.MultiRangeLivenessChallengeItem[t.challengeItem] === void 0 ? t.challengeItem : c.dot.v4.MultiRangeLivenessChallengeItem[t.challengeItem] : t.challengeItem), t.image != null && Object.hasOwnProperty.call(t, "image") && (o.image = c.dot.ImageWithTimestamp.toObject(t.image, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessStepResult";
      }, n;
    })(), u.MultiRangeLivenessChallengeItem = (function() {
      const n = {}, t = Object.create(n);
      return t[n[0] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED"] = 0, t[n[1] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ZERO"] = 1, t[n[2] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ONE"] = 2, t[n[3] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_TWO"] = 3, t[n[4] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_THREE"] = 4, t[n[5] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FOUR"] = 5, t[n[6] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FIVE"] = 6, t;
    })(), u.MultiRangeLivenessMetadata = (function() {
      function n(t) {
        if (this.detections = [], t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.detections = l.emptyArray, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        if (t.detections != null && t.detections.length)
          for (let o = 0; o < t.detections.length; ++o)
            c.dot.v4.FaceDetection.encode(t.detections[o], e.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork(), r + 1).ldelim();
        return e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.MultiRangeLivenessMetadata(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          p >>> 3 === 1 ? (d.detections && d.detections.length || (d.detections = []), d.detections.push(c.dot.v4.FaceDetection.decode(t, t.uint32(), void 0, o + 1))) : t.skipType(p & 7, o);
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.detections != null && Object.hasOwnProperty.call(t, "detections")) {
          if (!Array.isArray(t.detections))
            return "detections: array expected";
          for (let r = 0; r < t.detections.length; ++r) {
            let o = c.dot.v4.FaceDetection.verify(t.detections[r], e + 1);
            if (o)
              return "detections." + o;
          }
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.MultiRangeLivenessMetadata)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.MultiRangeLivenessMetadata: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.MultiRangeLivenessMetadata();
        if (t.detections) {
          if (!Array.isArray(t.detections))
            throw TypeError(".dot.v4.MultiRangeLivenessMetadata.detections: array expected");
          r.detections = [];
          for (let o = 0; o < t.detections.length; ++o) {
            if (!l.isObject(t.detections[o]))
              throw TypeError(".dot.v4.MultiRangeLivenessMetadata.detections: object expected");
            r.detections[o] = c.dot.v4.FaceDetection.fromObject(t.detections[o], e + 1);
          }
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        if ((e.arrays || e.defaults) && (o.detections = []), t.detections && t.detections.length) {
          o.detections = [];
          for (let i = 0; i < t.detections.length; ++i)
            o.detections[i] = c.dot.v4.FaceDetection.toObject(t.detections[i], e, r + 1);
        }
        return o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessMetadata";
      }, n;
    })(), u.FaceDetection = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.timestampMillis = l.Long ? l.Long.fromBits(0, 0, !0) : 0, n.prototype.position = null, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).uint64(t.timestampMillis), t.position != null && Object.hasOwnProperty.call(t, "position") && c.dot.v4.FaceDetectionPosition.encode(t.position, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), r + 1).ldelim(), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.FaceDetection(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.timestampMillis = t.uint64();
              break;
            }
            case 2: {
              d.position = c.dot.v4.FaceDetectionPosition.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && !l.isInteger(t.timestampMillis) && !(t.timestampMillis && l.isInteger(t.timestampMillis.low) && l.isInteger(t.timestampMillis.high)))
          return "timestampMillis: integer|Long expected";
        if (t.position != null && Object.hasOwnProperty.call(t, "position")) {
          let r = c.dot.v4.FaceDetectionPosition.verify(t.position, e + 1);
          if (r)
            return "position." + r;
        }
        return null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.FaceDetection)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.FaceDetection: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.FaceDetection();
        if (t.timestampMillis != null && (l.Long ? r.timestampMillis = l.Long.fromValue(t.timestampMillis, !0) : typeof t.timestampMillis == "string" ? r.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? r.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (r.timestampMillis = new l.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), t.position != null) {
          if (!l.isObject(t.position))
            throw TypeError(".dot.v4.FaceDetection.position: object expected");
          r.position = c.dot.v4.FaceDetectionPosition.fromObject(t.position, e + 1);
        }
        return r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        if (e.defaults) {
          if (l.Long) {
            let i = new l.Long(0, 0, !0);
            o.timestampMillis = e.longs === String ? i.toString() : e.longs === Number ? i.toNumber() : typeof BigInt < "u" && e.longs === BigInt ? i.toBigInt() : i;
          } else
            o.timestampMillis = e.longs === String ? "0" : typeof BigInt < "u" && e.longs === BigInt ? BigInt("0") : 0;
          o.position = null;
        }
        return t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && (typeof BigInt < "u" && e.longs === BigInt ? o.timestampMillis = typeof t.timestampMillis == "number" ? BigInt(t.timestampMillis) : l.Long.fromBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0, !0).toBigInt() : typeof t.timestampMillis == "number" ? o.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : o.timestampMillis = e.longs === String ? l.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new l.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), t.position != null && Object.hasOwnProperty.call(t, "position") && (o.position = c.dot.v4.FaceDetectionPosition.toObject(t.position, e, r + 1)), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetection";
      }, n;
    })(), u.FaceDetectionPosition = (function() {
      function n(t) {
        if (t)
          for (let e = Object.keys(t), r = 0; r < e.length; ++r)
            t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
      }
      return n.prototype.center = null, n.prototype.faceSizeToImageShorterSideRatio = 0, n.create = function(t) {
        return new n(t);
      }, n.encode = function(t, e, r) {
        if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        return t.center != null && Object.hasOwnProperty.call(t, "center") && c.dot.PointDouble.encode(t.center, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), r + 1).ldelim(), t.faceSizeToImageShorterSideRatio != null && Object.hasOwnProperty.call(t, "faceSizeToImageShorterSideRatio") && e.uint32(
          /* id 2, wireType 1 =*/
          17
        ).double(t.faceSizeToImageShorterSideRatio), e;
      }, n.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, n.decode = function(t, e, r, o) {
        if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let i, d;
        if (e === void 0)
          i = t.len;
        else {
          if (i = t.pos + e, i > t.len)
            throw RangeError("index out of range");
          e = t.len, t.len = i;
        }
        for (d = new c.dot.v4.FaceDetectionPosition(); t.pos < i; ) {
          let p = t.uint32();
          if (p === r)
            break;
          switch (p >>> 3) {
            case 1: {
              d.center = c.dot.PointDouble.decode(t, t.uint32(), void 0, o + 1);
              break;
            }
            case 2: {
              d.faceSizeToImageShorterSideRatio = t.double();
              break;
            }
            default:
              t.skipType(p & 7, o);
              break;
          }
        }
        if (e !== void 0) {
          if (t.pos !== i)
            throw RangeError("index out of range");
          t.len = e;
        }
        return d;
      }, n.decodeDelimited = function(t) {
        return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
      }, n.verify = function(t, e) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (t.center != null && Object.hasOwnProperty.call(t, "center")) {
          let r = c.dot.PointDouble.verify(t.center, e + 1);
          if (r)
            return "center." + r;
        }
        return t.faceSizeToImageShorterSideRatio != null && Object.hasOwnProperty.call(t, "faceSizeToImageShorterSideRatio") && typeof t.faceSizeToImageShorterSideRatio != "number" ? "faceSizeToImageShorterSideRatio: number expected" : null;
      }, n.fromObject = function(t, e) {
        if (t instanceof c.dot.v4.FaceDetectionPosition)
          return t;
        if (!l.isObject(t))
          throw TypeError(".dot.v4.FaceDetectionPosition: object expected");
        if (e === void 0 && (e = 0), e > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let r = new c.dot.v4.FaceDetectionPosition();
        if (t.center != null) {
          if (!l.isObject(t.center))
            throw TypeError(".dot.v4.FaceDetectionPosition.center: object expected");
          r.center = c.dot.PointDouble.fromObject(t.center, e + 1);
        }
        return t.faceSizeToImageShorterSideRatio != null && (r.faceSizeToImageShorterSideRatio = Number(t.faceSizeToImageShorterSideRatio)), r;
      }, n.toObject = function(t, e, r) {
        if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("max depth exceeded");
        let o = {};
        return e.defaults && (o.center = null, o.faceSizeToImageShorterSideRatio = 0), t.center != null && Object.hasOwnProperty.call(t, "center") && (o.center = c.dot.PointDouble.toObject(t.center, e, r + 1)), t.faceSizeToImageShorterSideRatio != null && Object.hasOwnProperty.call(t, "faceSizeToImageShorterSideRatio") && (o.faceSizeToImageShorterSideRatio = e.json && !isFinite(t.faceSizeToImageShorterSideRatio) ? String(t.faceSizeToImageShorterSideRatio) : t.faceSizeToImageShorterSideRatio), o;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetectionPosition";
      }, n;
    })(), u.SmileLivenessContent = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.neutralExpressionFaceImage = null, n.prototype.smileExpressionFaceImage = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && c.dot.Image.encode(e.neutralExpressionFaceImage, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage") && c.dot.Image.encode(e.smileExpressionFaceImage, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.SmileLivenessContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.neutralExpressionFaceImage = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.smileExpressionFaceImage = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 4: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage")) {
          let o = c.dot.Image.verify(e.neutralExpressionFaceImage, r + 1);
          if (o)
            return "neutralExpressionFaceImage." + o;
        }
        if (e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage")) {
          let o = c.dot.Image.verify(e.smileExpressionFaceImage, r + 1);
          if (o)
            return "smileExpressionFaceImage." + o;
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.SmileLivenessContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.SmileLivenessContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.SmileLivenessContent();
        if (e.neutralExpressionFaceImage != null) {
          if (!l.isObject(e.neutralExpressionFaceImage))
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          o.neutralExpressionFaceImage = c.dot.Image.fromObject(e.neutralExpressionFaceImage, r + 1);
        }
        if (e.smileExpressionFaceImage != null) {
          if (!l.isObject(e.smileExpressionFaceImage))
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          o.smileExpressionFaceImage = c.dot.Image.fromObject(e.smileExpressionFaceImage, r + 1);
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.SmileLivenessContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.neutralExpressionFaceImage = null, i.smileExpressionFaceImage = null, i.metadata = null), e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && (i.neutralExpressionFaceImage = c.dot.Image.toObject(e.neutralExpressionFaceImage, r, o + 1)), e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage") && (i.smileExpressionFaceImage = c.dot.Image.toObject(e.smileExpressionFaceImage, r, o + 1)), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.SmileLivenessContent";
      }, n;
    })(), u.PalmContent = (function() {
      function n(e) {
        if (e)
          for (let r = Object.keys(e), o = 0; o < r.length; ++o)
            e[r[o]] != null && r[o] !== "__proto__" && (this[r[o]] = e[r[o]]);
      }
      n.prototype.image = null, n.prototype.video = null, n.prototype.metadata = null;
      let t;
      return Object.defineProperty(n.prototype, "_video", {
        get: l.oneOfGetter(t = ["video"]),
        set: l.oneOfSetter(t)
      }), n.create = function(e) {
        return new n(e);
      }, n.encode = function(e, r, o) {
        if (r || (r = F.create()), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        return e.image != null && Object.hasOwnProperty.call(e, "image") && c.dot.Image.encode(e.image, r.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork(), o + 1).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && c.dot.v4.Metadata.encode(e.metadata, r.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork(), o + 1).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && c.dot.Video.encode(e.video, r.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork(), o + 1).ldelim(), r;
      }, n.encodeDelimited = function(e, r) {
        return this.encode(e, r).ldelim();
      }, n.decode = function(e, r, o, i) {
        if (e instanceof h || (e = h.create(e)), i === void 0 && (i = 0), i > h.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let d, p;
        if (r === void 0)
          d = e.len;
        else {
          if (d = e.pos + r, d > e.len)
            throw RangeError("index out of range");
          r = e.len, e.len = d;
        }
        for (p = new c.dot.v4.PalmContent(); e.pos < d; ) {
          let O = e.uint32();
          if (O === o)
            break;
          switch (O >>> 3) {
            case 1: {
              p.image = c.dot.Image.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 3: {
              p.video = c.dot.Video.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            case 2: {
              p.metadata = c.dot.v4.Metadata.decode(e, e.uint32(), void 0, i + 1);
              break;
            }
            default:
              e.skipType(O & 7, i);
              break;
          }
        }
        if (r !== void 0) {
          if (e.pos !== d)
            throw RangeError("index out of range");
          e.len = r;
        }
        return p;
      }, n.decodeDelimited = function(e) {
        return e instanceof h || (e = new h(e)), this.decode(e, e.uint32());
      }, n.verify = function(e, r) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          return "maximum nesting depth exceeded";
        if (e.image != null && Object.hasOwnProperty.call(e, "image")) {
          let o = c.dot.Image.verify(e.image, r + 1);
          if (o)
            return "image." + o;
        }
        if (e.video != null && Object.hasOwnProperty.call(e, "video")) {
          let o = c.dot.Video.verify(e.video, r + 1);
          if (o)
            return "video." + o;
        }
        if (e.metadata != null && Object.hasOwnProperty.call(e, "metadata")) {
          let o = c.dot.v4.Metadata.verify(e.metadata, r + 1);
          if (o)
            return "metadata." + o;
        }
        return null;
      }, n.fromObject = function(e, r) {
        if (e instanceof c.dot.v4.PalmContent)
          return e;
        if (!l.isObject(e))
          throw TypeError(".dot.v4.PalmContent: object expected");
        if (r === void 0 && (r = 0), r > l.recursionLimit)
          throw Error("maximum nesting depth exceeded");
        let o = new c.dot.v4.PalmContent();
        if (e.image != null) {
          if (!l.isObject(e.image))
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          o.image = c.dot.Image.fromObject(e.image, r + 1);
        }
        if (e.video != null) {
          if (!l.isObject(e.video))
            throw TypeError(".dot.v4.PalmContent.video: object expected");
          o.video = c.dot.Video.fromObject(e.video, r + 1);
        }
        if (e.metadata != null) {
          if (!l.isObject(e.metadata))
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          o.metadata = c.dot.v4.Metadata.fromObject(e.metadata, r + 1);
        }
        return o;
      }, n.toObject = function(e, r, o) {
        if (r || (r = {}), o === void 0 && (o = 0), o > l.recursionLimit)
          throw Error("max depth exceeded");
        let i = {};
        return r.defaults && (i.image = null, i.metadata = null), e.image != null && Object.hasOwnProperty.call(e, "image") && (i.image = c.dot.Image.toObject(e.image, r, o + 1)), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && (i.metadata = c.dot.v4.Metadata.toObject(e.metadata, r, o + 1)), e.video != null && Object.hasOwnProperty.call(e, "video") && (i.video = c.dot.Video.toObject(e.video, r, o + 1), r.oneofs && (i._video = "video")), i;
      }, n.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, n.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PalmContent";
      }, n;
    })(), u;
  })(), v.Image = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.bytes = l.newBuffer([]), u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.Image(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        d >>> 3 === 1 ? i.bytes = n.bytes() : n.skipType(d & 7, r);
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && !(n.bytes && typeof n.bytes.length == "number" || l.isString(n.bytes)) ? "bytes: buffer expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.Image)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.Image: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.Image();
      return n.bytes != null && (typeof n.bytes == "string" ? l.base64.decode(n.bytes, e.bytes = l.newBuffer(l.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (e.bytes = n.bytes)), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (t.bytes === String ? r.bytes = "" : (r.bytes = [], t.bytes !== Array && (r.bytes = l.newBuffer(r.bytes)))), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && (r.bytes = t.bytes === String ? l.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Image";
    }, u;
  })(), v.ImageWithTimestamp = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.image = null, u.prototype.timestampMillis = l.Long ? l.Long.fromBits(0, 0, !0) : 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.image != null && Object.hasOwnProperty.call(n, "image") && c.dot.Image.encode(n.image, t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).fork(), e + 1).ldelim(), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(n.timestampMillis), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.ImageWithTimestamp(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.image = c.dot.Image.decode(n, n.uint32(), void 0, r + 1);
            break;
          }
          case 2: {
            i.timestampMillis = n.uint64();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      if (typeof n != "object" || n === null)
        return "object expected";
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        return "maximum nesting depth exceeded";
      if (n.image != null && Object.hasOwnProperty.call(n, "image")) {
        let e = c.dot.Image.verify(n.image, t + 1);
        if (e)
          return "image." + e;
      }
      return n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && !l.isInteger(n.timestampMillis) && !(n.timestampMillis && l.isInteger(n.timestampMillis.low) && l.isInteger(n.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.ImageWithTimestamp)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.ImageWithTimestamp: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.ImageWithTimestamp();
      if (n.image != null) {
        if (!l.isObject(n.image))
          throw TypeError(".dot.ImageWithTimestamp.image: object expected");
        e.image = c.dot.Image.fromObject(n.image, t + 1);
      }
      return n.timestampMillis != null && (l.Long ? e.timestampMillis = l.Long.fromValue(n.timestampMillis, !0) : typeof n.timestampMillis == "string" ? e.timestampMillis = parseInt(n.timestampMillis, 10) : typeof n.timestampMillis == "number" ? e.timestampMillis = n.timestampMillis : typeof n.timestampMillis == "object" && (e.timestampMillis = new l.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0))), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      if (t.defaults)
        if (r.image = null, l.Long) {
          let o = new l.Long(0, 0, !0);
          r.timestampMillis = t.longs === String ? o.toString() : t.longs === Number ? o.toNumber() : typeof BigInt < "u" && t.longs === BigInt ? o.toBigInt() : o;
        } else
          r.timestampMillis = t.longs === String ? "0" : typeof BigInt < "u" && t.longs === BigInt ? BigInt("0") : 0;
      return n.image != null && Object.hasOwnProperty.call(n, "image") && (r.image = c.dot.Image.toObject(n.image, t, e + 1)), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && (typeof BigInt < "u" && t.longs === BigInt ? r.timestampMillis = typeof n.timestampMillis == "number" ? BigInt(n.timestampMillis) : l.Long.fromBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0, !0).toBigInt() : typeof n.timestampMillis == "number" ? r.timestampMillis = t.longs === String ? String(n.timestampMillis) : n.timestampMillis : r.timestampMillis = t.longs === String ? l.Long.prototype.toString.call(n.timestampMillis) : t.longs === Number ? new l.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0) : n.timestampMillis), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.ImageWithTimestamp";
    }, u;
  })(), v.ImageSize = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.width = 0, u.prototype.height = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.width != null && Object.hasOwnProperty.call(n, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.width), n.height != null && Object.hasOwnProperty.call(n, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.height), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.ImageSize(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.width = n.int32();
            break;
          }
          case 2: {
            i.height = n.int32();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.width != null && Object.hasOwnProperty.call(n, "width") && !l.isInteger(n.width) ? "width: integer expected" : n.height != null && Object.hasOwnProperty.call(n, "height") && !l.isInteger(n.height) ? "height: integer expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.ImageSize)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.ImageSize: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.ImageSize();
      return n.width != null && (e.width = n.width | 0), n.height != null && (e.height = n.height | 0), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (r.width = 0, r.height = 0), n.width != null && Object.hasOwnProperty.call(n, "width") && (r.width = n.width), n.height != null && Object.hasOwnProperty.call(n, "height") && (r.height = n.height), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.ImageSize";
    }, u;
  })(), v.Int32List = (function() {
    function u(n) {
      if (this.items = [], n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.items = l.emptyArray, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      if (n.items != null && n.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let r = 0; r < n.items.length; ++r)
          t.int32(n.items[r]);
        t.ldelim();
      }
      return t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.Int32List(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            if (i.items && i.items.length || (i.items = []), (d & 7) === 2) {
              let p = n.uint32() + n.pos;
              if (p > n.len)
                throw RangeError("index out of range");
              for (n.len = p; n.pos < p; )
                i.items.push(n.int32());
              if (n.pos !== p)
                throw RangeError("index out of range");
              n.len = o;
            } else
              i.items.push(n.int32());
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      if (typeof n != "object" || n === null)
        return "object expected";
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        return "maximum nesting depth exceeded";
      if (n.items != null && Object.hasOwnProperty.call(n, "items")) {
        if (!Array.isArray(n.items))
          return "items: array expected";
        for (let e = 0; e < n.items.length; ++e)
          if (!l.isInteger(n.items[e]))
            return "items: integer[] expected";
      }
      return null;
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.Int32List)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.Int32List: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.Int32List();
      if (n.items) {
        if (!Array.isArray(n.items))
          throw TypeError(".dot.Int32List.items: array expected");
        e.items = [];
        for (let r = 0; r < n.items.length; ++r)
          e.items[r] = n.items[r] | 0;
      }
      return e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      if ((t.arrays || t.defaults) && (r.items = []), n.items && n.items.length) {
        r.items = [];
        for (let o = 0; o < n.items.length; ++o)
          r.items[o] = n.items[o];
      }
      return r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.Int32List";
    }, u;
  })(), v.Platform = (function() {
    const u = {}, n = Object.create(u);
    return n[u[0] = "WEB"] = 0, n[u[1] = "ANDROID"] = 1, n[u[2] = "IOS"] = 2, n;
  })(), v.RectangleDouble = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.left = 0, u.prototype.top = 0, u.prototype.right = 0, u.prototype.bottom = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.left != null && Object.hasOwnProperty.call(n, "left") && t.uint32(
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
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.RectangleDouble(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.left = n.double();
            break;
          }
          case 2: {
            i.top = n.double();
            break;
          }
          case 3: {
            i.right = n.double();
            break;
          }
          case 4: {
            i.bottom = n.double();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.left != null && Object.hasOwnProperty.call(n, "left") && typeof n.left != "number" ? "left: number expected" : n.top != null && Object.hasOwnProperty.call(n, "top") && typeof n.top != "number" ? "top: number expected" : n.right != null && Object.hasOwnProperty.call(n, "right") && typeof n.right != "number" ? "right: number expected" : n.bottom != null && Object.hasOwnProperty.call(n, "bottom") && typeof n.bottom != "number" ? "bottom: number expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.RectangleDouble)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.RectangleDouble: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.RectangleDouble();
      return n.left != null && (e.left = Number(n.left)), n.top != null && (e.top = Number(n.top)), n.right != null && (e.right = Number(n.right)), n.bottom != null && (e.bottom = Number(n.bottom)), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (r.left = 0, r.top = 0, r.right = 0, r.bottom = 0), n.left != null && Object.hasOwnProperty.call(n, "left") && (r.left = t.json && !isFinite(n.left) ? String(n.left) : n.left), n.top != null && Object.hasOwnProperty.call(n, "top") && (r.top = t.json && !isFinite(n.top) ? String(n.top) : n.top), n.right != null && Object.hasOwnProperty.call(n, "right") && (r.right = t.json && !isFinite(n.right) ? String(n.right) : n.right), n.bottom != null && Object.hasOwnProperty.call(n, "bottom") && (r.bottom = t.json && !isFinite(n.bottom) ? String(n.bottom) : n.bottom), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.RectangleDouble";
    }, u;
  })(), v.DigestWithTimestamp = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.digest = l.newBuffer([]), u.prototype.timestampMillis = l.Long ? l.Long.fromBits(0, 0, !0) : 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.digest != null && Object.hasOwnProperty.call(n, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.digest), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(n.timestampMillis), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.DigestWithTimestamp(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.digest = n.bytes();
            break;
          }
          case 2: {
            i.timestampMillis = n.uint64();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.digest != null && Object.hasOwnProperty.call(n, "digest") && !(n.digest && typeof n.digest.length == "number" || l.isString(n.digest)) ? "digest: buffer expected" : n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && !l.isInteger(n.timestampMillis) && !(n.timestampMillis && l.isInteger(n.timestampMillis.low) && l.isInteger(n.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.DigestWithTimestamp)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.DigestWithTimestamp: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.DigestWithTimestamp();
      return n.digest != null && (typeof n.digest == "string" ? l.base64.decode(n.digest, e.digest = l.newBuffer(l.base64.length(n.digest)), 0) : n.digest.length >= 0 && (e.digest = n.digest)), n.timestampMillis != null && (l.Long ? e.timestampMillis = l.Long.fromValue(n.timestampMillis, !0) : typeof n.timestampMillis == "string" ? e.timestampMillis = parseInt(n.timestampMillis, 10) : typeof n.timestampMillis == "number" ? e.timestampMillis = n.timestampMillis : typeof n.timestampMillis == "object" && (e.timestampMillis = new l.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0))), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      if (t.defaults)
        if (t.bytes === String ? r.digest = "" : (r.digest = [], t.bytes !== Array && (r.digest = l.newBuffer(r.digest))), l.Long) {
          let o = new l.Long(0, 0, !0);
          r.timestampMillis = t.longs === String ? o.toString() : t.longs === Number ? o.toNumber() : typeof BigInt < "u" && t.longs === BigInt ? o.toBigInt() : o;
        } else
          r.timestampMillis = t.longs === String ? "0" : typeof BigInt < "u" && t.longs === BigInt ? BigInt("0") : 0;
      return n.digest != null && Object.hasOwnProperty.call(n, "digest") && (r.digest = t.bytes === String ? l.base64.encode(n.digest, 0, n.digest.length) : t.bytes === Array ? Array.prototype.slice.call(n.digest) : n.digest), n.timestampMillis != null && Object.hasOwnProperty.call(n, "timestampMillis") && (typeof BigInt < "u" && t.longs === BigInt ? r.timestampMillis = typeof n.timestampMillis == "number" ? BigInt(n.timestampMillis) : l.Long.fromBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0, !0).toBigInt() : typeof n.timestampMillis == "number" ? r.timestampMillis = t.longs === String ? String(n.timestampMillis) : n.timestampMillis : r.timestampMillis = t.longs === String ? l.Long.prototype.toString.call(n.timestampMillis) : t.longs === Number ? new l.LongBits(n.timestampMillis.low >>> 0, n.timestampMillis.high >>> 0).toNumber(!0) : n.timestampMillis), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.DigestWithTimestamp";
    }, u;
  })(), v.Video = (function() {
    function u(t) {
      if (t)
        for (let e = Object.keys(t), r = 0; r < e.length; ++r)
          t[e[r]] != null && e[r] !== "__proto__" && (this[e[r]] = t[e[r]]);
    }
    u.prototype.bytes = null, u.prototype.containerMp4 = null, u.prototype.streamH264 = null;
    let n;
    return Object.defineProperty(u.prototype, "_bytes", {
      get: l.oneOfGetter(n = ["bytes"]),
      set: l.oneOfSetter(n)
    }), Object.defineProperty(u.prototype, "content", {
      get: l.oneOfGetter(n = ["containerMp4", "streamH264"]),
      set: l.oneOfSetter(n)
    }), u.create = function(t) {
      return new u(t);
    }, u.encode = function(t, e, r) {
      if (e || (e = F.create()), r === void 0 && (r = 0), r > l.recursionLimit)
        throw Error("max depth exceeded");
      return t.bytes != null && Object.hasOwnProperty.call(t, "bytes") && e.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(t.bytes), t.containerMp4 != null && Object.hasOwnProperty.call(t, "containerMp4") && c.dot.VideoContainer.encode(t.containerMp4, e.uint32(
        /* id 2, wireType 2 =*/
        18
      ).fork(), r + 1).ldelim(), t.streamH264 != null && Object.hasOwnProperty.call(t, "streamH264") && c.dot.VideoStream.encode(t.streamH264, e.uint32(
        /* id 3, wireType 2 =*/
        26
      ).fork(), r + 1).ldelim(), e;
    }, u.encodeDelimited = function(t, e) {
      return this.encode(t, e).ldelim();
    }, u.decode = function(t, e, r, o) {
      if (t instanceof h || (t = h.create(t)), o === void 0 && (o = 0), o > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let i, d;
      if (e === void 0)
        i = t.len;
      else {
        if (i = t.pos + e, i > t.len)
          throw RangeError("index out of range");
        e = t.len, t.len = i;
      }
      for (d = new c.dot.Video(); t.pos < i; ) {
        let p = t.uint32();
        if (p === r)
          break;
        switch (p >>> 3) {
          case 1: {
            d.bytes = t.bytes();
            break;
          }
          case 2: {
            d.containerMp4 = c.dot.VideoContainer.decode(t, t.uint32(), void 0, o + 1);
            break;
          }
          case 3: {
            d.streamH264 = c.dot.VideoStream.decode(t, t.uint32(), void 0, o + 1);
            break;
          }
          default:
            t.skipType(p & 7, o);
            break;
        }
      }
      if (e !== void 0) {
        if (t.pos !== i)
          throw RangeError("index out of range");
        t.len = e;
      }
      return d;
    }, u.decodeDelimited = function(t) {
      return t instanceof h || (t = new h(t)), this.decode(t, t.uint32());
    }, u.verify = function(t, e) {
      if (typeof t != "object" || t === null)
        return "object expected";
      if (e === void 0 && (e = 0), e > l.recursionLimit)
        return "maximum nesting depth exceeded";
      let r = {};
      if (t.bytes != null && Object.hasOwnProperty.call(t, "bytes") && (r._bytes = 1, !(t.bytes && typeof t.bytes.length == "number" || l.isString(t.bytes))))
        return "bytes: buffer expected";
      if (t.containerMp4 != null && Object.hasOwnProperty.call(t, "containerMp4")) {
        r.content = 1;
        {
          let o = c.dot.VideoContainer.verify(t.containerMp4, e + 1);
          if (o)
            return "containerMp4." + o;
        }
      }
      if (t.streamH264 != null && Object.hasOwnProperty.call(t, "streamH264")) {
        if (r.content === 1)
          return "content: multiple values";
        r.content = 1;
        {
          let o = c.dot.VideoStream.verify(t.streamH264, e + 1);
          if (o)
            return "streamH264." + o;
        }
      }
      return null;
    }, u.fromObject = function(t, e) {
      if (t instanceof c.dot.Video)
        return t;
      if (!l.isObject(t))
        throw TypeError(".dot.Video: object expected");
      if (e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let r = new c.dot.Video();
      if (t.bytes != null && (typeof t.bytes == "string" ? l.base64.decode(t.bytes, r.bytes = l.newBuffer(l.base64.length(t.bytes)), 0) : t.bytes.length >= 0 && (r.bytes = t.bytes)), t.containerMp4 != null) {
        if (!l.isObject(t.containerMp4))
          throw TypeError(".dot.Video.containerMp4: object expected");
        r.containerMp4 = c.dot.VideoContainer.fromObject(t.containerMp4, e + 1);
      }
      if (t.streamH264 != null) {
        if (!l.isObject(t.streamH264))
          throw TypeError(".dot.Video.streamH264: object expected");
        r.streamH264 = c.dot.VideoStream.fromObject(t.streamH264, e + 1);
      }
      return r;
    }, u.toObject = function(t, e, r) {
      if (e || (e = {}), r === void 0 && (r = 0), r > l.recursionLimit)
        throw Error("max depth exceeded");
      let o = {};
      return t.bytes != null && Object.hasOwnProperty.call(t, "bytes") && (o.bytes = e.bytes === String ? l.base64.encode(t.bytes, 0, t.bytes.length) : e.bytes === Array ? Array.prototype.slice.call(t.bytes) : t.bytes, e.oneofs && (o._bytes = "bytes")), t.containerMp4 != null && Object.hasOwnProperty.call(t, "containerMp4") && (o.containerMp4 = c.dot.VideoContainer.toObject(t.containerMp4, e, r + 1), e.oneofs && (o.content = "containerMp4")), t.streamH264 != null && Object.hasOwnProperty.call(t, "streamH264") && (o.streamH264 = c.dot.VideoStream.toObject(t.streamH264, e, r + 1), e.oneofs && (o.content = "streamH264")), o;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(t) {
      return t === void 0 && (t = "type.googleapis.com"), t + "/dot.Video";
    }, u;
  })(), v.VideoContainer = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.bytes = l.newBuffer([]), u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.VideoContainer(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        d >>> 3 === 1 ? i.bytes = n.bytes() : n.skipType(d & 7, r);
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && !(n.bytes && typeof n.bytes.length == "number" || l.isString(n.bytes)) ? "bytes: buffer expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.VideoContainer)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.VideoContainer: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.VideoContainer();
      return n.bytes != null && (typeof n.bytes == "string" ? l.base64.decode(n.bytes, e.bytes = l.newBuffer(l.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (e.bytes = n.bytes)), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (t.bytes === String ? r.bytes = "" : (r.bytes = [], t.bytes !== Array && (r.bytes = l.newBuffer(r.bytes)))), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && (r.bytes = t.bytes === String ? l.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.VideoContainer";
    }, u;
  })(), v.VideoStream = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.bytes = l.newBuffer([]), u.prototype.frameRate = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(n.bytes), n.frameRate != null && Object.hasOwnProperty.call(n, "frameRate") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(n.frameRate), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.VideoStream(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.bytes = n.bytes();
            break;
          }
          case 2: {
            i.frameRate = n.double();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && !(n.bytes && typeof n.bytes.length == "number" || l.isString(n.bytes)) ? "bytes: buffer expected" : n.frameRate != null && Object.hasOwnProperty.call(n, "frameRate") && typeof n.frameRate != "number" ? "frameRate: number expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.VideoStream)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.VideoStream: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.VideoStream();
      return n.bytes != null && (typeof n.bytes == "string" ? l.base64.decode(n.bytes, e.bytes = l.newBuffer(l.base64.length(n.bytes)), 0) : n.bytes.length >= 0 && (e.bytes = n.bytes)), n.frameRate != null && (e.frameRate = Number(n.frameRate)), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (t.bytes === String ? r.bytes = "" : (r.bytes = [], t.bytes !== Array && (r.bytes = l.newBuffer(r.bytes))), r.frameRate = 0), n.bytes != null && Object.hasOwnProperty.call(n, "bytes") && (r.bytes = t.bytes === String ? l.base64.encode(n.bytes, 0, n.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(n.bytes) : n.bytes), n.frameRate != null && Object.hasOwnProperty.call(n, "frameRate") && (r.frameRate = t.json && !isFinite(n.frameRate) ? String(n.frameRate) : n.frameRate), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.VideoStream";
    }, u;
  })(), v.PointInt = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.x = 0, u.prototype.y = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.x != null && Object.hasOwnProperty.call(n, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(n.y), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.PointInt(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.x = n.int32();
            break;
          }
          case 2: {
            i.y = n.int32();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.x != null && Object.hasOwnProperty.call(n, "x") && !l.isInteger(n.x) ? "x: integer expected" : n.y != null && Object.hasOwnProperty.call(n, "y") && !l.isInteger(n.y) ? "y: integer expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.PointInt)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.PointInt: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.PointInt();
      return n.x != null && (e.x = n.x | 0), n.y != null && (e.y = n.y | 0), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (r.x = 0, r.y = 0), n.x != null && Object.hasOwnProperty.call(n, "x") && (r.x = n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && (r.y = n.y), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.PointInt";
    }, u;
  })(), v.PointDouble = (function() {
    function u(n) {
      if (n)
        for (let t = Object.keys(n), e = 0; e < t.length; ++e)
          n[t[e]] != null && t[e] !== "__proto__" && (this[t[e]] = n[t[e]]);
    }
    return u.prototype.x = 0, u.prototype.y = 0, u.create = function(n) {
      return new u(n);
    }, u.encode = function(n, t, e) {
      if (t || (t = F.create()), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      return n.x != null && Object.hasOwnProperty.call(n, "x") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(n.y), t;
    }, u.encodeDelimited = function(n, t) {
      return this.encode(n, t).ldelim();
    }, u.decode = function(n, t, e, r) {
      if (n instanceof h || (n = h.create(n)), r === void 0 && (r = 0), r > h.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let o, i;
      if (t === void 0)
        o = n.len;
      else {
        if (o = n.pos + t, o > n.len)
          throw RangeError("index out of range");
        t = n.len, n.len = o;
      }
      for (i = new c.dot.PointDouble(); n.pos < o; ) {
        let d = n.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            i.x = n.double();
            break;
          }
          case 2: {
            i.y = n.double();
            break;
          }
          default:
            n.skipType(d & 7, r);
            break;
        }
      }
      if (t !== void 0) {
        if (n.pos !== o)
          throw RangeError("index out of range");
        n.len = t;
      }
      return i;
    }, u.decodeDelimited = function(n) {
      return n instanceof h || (n = new h(n)), this.decode(n, n.uint32());
    }, u.verify = function(n, t) {
      return typeof n != "object" || n === null ? "object expected" : (t === void 0 && (t = 0), t > l.recursionLimit ? "maximum nesting depth exceeded" : n.x != null && Object.hasOwnProperty.call(n, "x") && typeof n.x != "number" ? "x: number expected" : n.y != null && Object.hasOwnProperty.call(n, "y") && typeof n.y != "number" ? "y: number expected" : null);
    }, u.fromObject = function(n, t) {
      if (n instanceof c.dot.PointDouble)
        return n;
      if (!l.isObject(n))
        throw TypeError(".dot.PointDouble: object expected");
      if (t === void 0 && (t = 0), t > l.recursionLimit)
        throw Error("maximum nesting depth exceeded");
      let e = new c.dot.PointDouble();
      return n.x != null && (e.x = Number(n.x)), n.y != null && (e.y = Number(n.y)), e;
    }, u.toObject = function(n, t, e) {
      if (t || (t = {}), e === void 0 && (e = 0), e > l.recursionLimit)
        throw Error("max depth exceeded");
      let r = {};
      return t.defaults && (r.x = 0, r.y = 0), n.x != null && Object.hasOwnProperty.call(n, "x") && (r.x = t.json && !isFinite(n.x) ? String(n.x) : n.x), n.y != null && Object.hasOwnProperty.call(n, "y") && (r.y = t.json && !isFinite(n.y) ? String(n.y) : n.y), r;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, u.getTypeUrl = function(n) {
      return n === void 0 && (n = "type.googleapis.com"), n + "/dot.PointDouble";
    }, u;
  })(), v;
})();
var ti = (() => {
  var v = import.meta.url;
  return (async function(u = {}) {
    var n, t = u, e, r, o = new Promise((s, a) => {
      e = s, r = a;
    }), i = typeof window == "object", d = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var p = Object.assign({}, t), O = (s, a) => {
      throw a;
    }, C = "";
    function j(s) {
      return t.locateFile ? t.locateFile(s, C) : C + s;
    }
    var P, x;
    (i || d) && (d ? C = self.location.href : typeof document < "u" && document.currentScript && (C = document.currentScript.src), v && (C = v), C.startsWith("blob:") ? C = "" : C = C.slice(0, C.replace(/[?#].*/, "").lastIndexOf("/") + 1), d && (x = (s) => {
      var a = new XMLHttpRequest();
      return a.open("GET", s, !1), a.responseType = "arraybuffer", a.send(null), new Uint8Array(a.response);
    }), P = async (s) => {
      if (qe(s))
        return new Promise((f, m) => {
          var g = new XMLHttpRequest();
          g.open("GET", s, !0), g.responseType = "arraybuffer", g.onload = () => {
            if (g.status == 200 || g.status == 0 && g.response) {
              f(g.response);
              return;
            }
            m(g.status);
          }, g.onerror = m, g.send(null);
        });
      var a = await fetch(s, { credentials: "same-origin" });
      if (a.ok)
        return a.arrayBuffer();
      throw new Error(a.status + " : " + a.url);
    }), t.print || console.log.bind(console);
    var A = t.printErr || console.error.bind(console);
    Object.assign(t, p), p = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var S = t.wasmBinary, R, N = !1, B, J, z, ce, pe, ee, $, Be, He, Ye, Je, qe = (s) => s.startsWith("file://");
    function Ze() {
      var s = R.buffer;
      t.HEAP8 = J = new Int8Array(s), t.HEAP16 = ce = new Int16Array(s), t.HEAPU8 = z = new Uint8Array(s), t.HEAPU16 = pe = new Uint16Array(s), t.HEAP32 = ee = new Int32Array(s), t.HEAPU32 = $ = new Uint32Array(s), t.HEAPF32 = Be = new Float32Array(s), t.HEAPF64 = Je = new Float64Array(s), t.HEAP64 = He = new BigInt64Array(s), t.HEAPU64 = Ye = new BigUint64Array(s);
    }
    function Lt() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Bt(t.preRun.shift());
      Xe(et);
    }
    function Dt() {
      k.C();
    }
    function Rt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Gt(t.postRun.shift());
      Xe(Qe);
    }
    var ae = 0, me = null;
    function At(s) {
      ae++, t.monitorRunDependencies?.(ae);
    }
    function Ft(s) {
      if (ae--, t.monitorRunDependencies?.(ae), ae == 0 && me) {
        var a = me;
        me = null, a();
      }
    }
    function be(s) {
      t.onAbort?.(s), s = "Aborted(" + s + ")", A(s), N = !0, s += ". Build with -sASSERTIONS for more info.";
      var a = new WebAssembly.RuntimeError(s);
      throw r(a), a;
    }
    var Te;
    function Mt() {
      return t.locateFile ? j("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Nt(s) {
      if (s == Te && S)
        return new Uint8Array(S);
      if (x)
        return x(s);
      throw "both async and sync fetching of the wasm failed";
    }
    async function $t(s) {
      if (!S)
        try {
          var a = await P(s);
          return new Uint8Array(a);
        } catch {
        }
      return Nt(s);
    }
    async function Wt(s, a) {
      try {
        var f = await $t(s), m = await WebAssembly.instantiate(f, a);
        return m;
      } catch (g) {
        A(`failed to asynchronously prepare wasm: ${g}`), be(g);
      }
    }
    async function Vt(s, a, f) {
      if (!s && typeof WebAssembly.instantiateStreaming == "function" && !qe(a))
        try {
          var m = fetch(a, { credentials: "same-origin" }), g = await WebAssembly.instantiateStreaming(m, f);
          return g;
        } catch (b) {
          A(`wasm streaming compile failed: ${b}`), A("falling back to ArrayBuffer instantiation");
        }
      return Wt(a, f);
    }
    function Ut() {
      return { a: hn };
    }
    async function zt() {
      function s(b, w) {
        return k = b.exports, k = E.instrumentWasmExports(k), R = k.B, Ze(), k.H, Ft(), k;
      }
      At();
      function a(b) {
        return s(b.instance);
      }
      var f = Ut();
      if (t.instantiateWasm)
        return new Promise((b, w) => {
          t.instantiateWasm(f, (y, I) => {
            s(y), b(y.exports);
          });
        });
      Te ??= Mt();
      try {
        var m = await Vt(S, Te, f), g = a(m);
        return g;
      } catch (b) {
        return r(b), Promise.reject(b);
      }
    }
    class Ke {
      name = "ExitStatus";
      constructor(a) {
        this.message = `Program terminated with exit(${a})`, this.status = a;
      }
    }
    var Xe = (s) => {
      for (; s.length > 0; )
        s.shift()(t);
    }, Qe = [], Gt = (s) => Qe.unshift(s), et = [], Bt = (s) => et.unshift(s), tt = t.noExitRuntime || !0;
    class Ht {
      constructor(a) {
        this.excPtr = a, this.ptr = a - 24;
      }
      set_type(a) {
        $[this.ptr + 4 >> 2] = a;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(a) {
        $[this.ptr + 8 >> 2] = a;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(a) {
        a = a ? 1 : 0, J[this.ptr + 12] = a;
      }
      get_caught() {
        return J[this.ptr + 12] != 0;
      }
      set_rethrown(a) {
        a = a ? 1 : 0, J[this.ptr + 13] = a;
      }
      get_rethrown() {
        return J[this.ptr + 13] != 0;
      }
      init(a, f) {
        this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(f);
      }
      set_adjusted_ptr(a) {
        $[this.ptr + 16 >> 2] = a;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var rt = 0, Yt = (s, a, f) => {
      var m = new Ht(s);
      throw m.init(a, f), rt = s, rt;
    }, Jt = () => be(""), ve = (s) => {
      if (s === null)
        return "null";
      var a = typeof s;
      return a === "object" || a === "array" || a === "function" ? s.toString() : "" + s;
    }, qt = () => {
      for (var s = new Array(256), a = 0; a < 256; ++a)
        s[a] = String.fromCharCode(a);
      nt = s;
    }, nt, W = (s) => {
      for (var a = "", f = s; z[f]; )
        a += nt[z[f++]];
      return a;
    }, de = {}, se = {}, Oe = {}, ue, L = (s) => {
      throw new ue(s);
    }, ot, we = (s) => {
      throw new ot(s);
    }, fe = (s, a, f) => {
      s.forEach((y) => Oe[y] = a);
      function m(y) {
        var I = f(y);
        I.length !== s.length && we("Mismatched type converter count");
        for (var T = 0; T < s.length; ++T)
          H(s[T], I[T]);
      }
      var g = new Array(a.length), b = [], w = 0;
      a.forEach((y, I) => {
        se.hasOwnProperty(y) ? g[I] = se[y] : (b.push(y), de.hasOwnProperty(y) || (de[y] = []), de[y].push(() => {
          g[I] = se[y], ++w, w === b.length && m(g);
        }));
      }), b.length === 0 && m(g);
    };
    function Zt(s, a, f = {}) {
      var m = a.name;
      if (s || L(`type "${m}" must have a positive integer typeid pointer`), se.hasOwnProperty(s)) {
        if (f.ignoreDuplicateRegistrations)
          return;
        L(`Cannot register type '${m}' twice`);
      }
      if (se[s] = a, delete Oe[s], de.hasOwnProperty(s)) {
        var g = de[s];
        delete de[s], g.forEach((b) => b());
      }
    }
    function H(s, a, f = {}) {
      return Zt(s, a, f);
    }
    var it = (s, a, f) => {
      switch (a) {
        case 1:
          return f ? (m) => J[m] : (m) => z[m];
        case 2:
          return f ? (m) => ce[m >> 1] : (m) => pe[m >> 1];
        case 4:
          return f ? (m) => ee[m >> 2] : (m) => $[m >> 2];
        case 8:
          return f ? (m) => He[m >> 3] : (m) => Ye[m >> 3];
        default:
          throw new TypeError(`invalid integer width (${a}): ${s}`);
      }
    }, Kt = (s, a, f, m, g) => {
      a = W(a);
      var b = a.indexOf("u") != -1;
      H(s, { name: a, fromWireType: (w) => w, toWireType: function(w, y) {
        if (typeof y != "bigint" && typeof y != "number")
          throw new TypeError(`Cannot convert "${ve(y)}" to ${this.name}`);
        return typeof y == "number" && (y = BigInt(y)), y;
      }, argPackAdvance: q, readValueFromPointer: it(a, f, !b), destructorFunction: null });
    }, q = 8, Xt = (s, a, f, m) => {
      a = W(a), H(s, { name: a, fromWireType: function(g) {
        return !!g;
      }, toWireType: function(g, b) {
        return b ? f : m;
      }, argPackAdvance: q, readValueFromPointer: function(g) {
        return this.fromWireType(z[g]);
      }, destructorFunction: null });
    }, Qt = (s) => ({ count: s.count, deleteScheduled: s.deleteScheduled, preservePointerOnDelete: s.preservePointerOnDelete, ptr: s.ptr, ptrType: s.ptrType, smartPtr: s.smartPtr, smartPtrType: s.smartPtrType }), ke = (s) => {
      function a(f) {
        return f.$$.ptrType.registeredClass.name;
      }
      L(a(s) + " instance already deleted");
    }, Le = !1, at = (s) => {
    }, er = (s) => {
      s.smartPtr ? s.smartPtrType.rawDestructor(s.smartPtr) : s.ptrType.registeredClass.rawDestructor(s.ptr);
    }, st = (s) => {
      s.count.value -= 1;
      var a = s.count.value === 0;
      a && er(s);
    }, lt = (s, a, f) => {
      if (a === f)
        return s;
      if (f.baseClass === void 0)
        return null;
      var m = lt(s, a, f.baseClass);
      return m === null ? null : f.downcast(m);
    }, ct = {}, tr = {}, rr = (s, a) => {
      for (a === void 0 && L("ptr should not be undefined"); s.baseClass; )
        a = s.upcast(a), s = s.baseClass;
      return a;
    }, nr = (s, a) => (a = rr(s, a), tr[a]), je = (s, a) => {
      (!a.ptrType || !a.ptr) && we("makeClassHandle requires ptr and ptrType");
      var f = !!a.smartPtrType, m = !!a.smartPtr;
      return f !== m && we("Both smartPtrType and smartPtr must be specified"), a.count = { value: 1 }, he(Object.create(s, { $$: { value: a, writable: !0 } }));
    };
    function or(s) {
      var a = this.getPointee(s);
      if (!a)
        return this.destructor(s), null;
      var f = nr(this.registeredClass, a);
      if (f !== void 0) {
        if (f.$$.count.value === 0)
          return f.$$.ptr = a, f.$$.smartPtr = s, f.clone();
        var m = f.clone();
        return this.destructor(s), m;
      }
      function g() {
        return this.isSmartPointer ? je(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: a, smartPtrType: this, smartPtr: s }) : je(this.registeredClass.instancePrototype, { ptrType: this, ptr: s });
      }
      var b = this.registeredClass.getActualType(a), w = ct[b];
      if (!w)
        return g.call(this);
      var y;
      this.isConst ? y = w.constPointerType : y = w.pointerType;
      var I = lt(a, this.registeredClass, y.registeredClass);
      return I === null ? g.call(this) : this.isSmartPointer ? je(y.registeredClass.instancePrototype, { ptrType: y, ptr: I, smartPtrType: this, smartPtr: s }) : je(y.registeredClass.instancePrototype, { ptrType: y, ptr: I });
    }
    var he = (s) => typeof FinalizationRegistry > "u" ? (he = (a) => a, s) : (Le = new FinalizationRegistry((a) => {
      st(a.$$);
    }), he = (a) => {
      var f = a.$$, m = !!f.smartPtr;
      if (m) {
        var g = { $$: f };
        Le.register(a, g, a);
      }
      return a;
    }, at = (a) => Le.unregister(a), he(s)), ir = () => {
      Object.assign(Pe.prototype, { isAliasOf(s) {
        if (!(this instanceof Pe) || !(s instanceof Pe))
          return !1;
        var a = this.$$.ptrType.registeredClass, f = this.$$.ptr;
        s.$$ = s.$$;
        for (var m = s.$$.ptrType.registeredClass, g = s.$$.ptr; a.baseClass; )
          f = a.upcast(f), a = a.baseClass;
        for (; m.baseClass; )
          g = m.upcast(g), m = m.baseClass;
        return a === m && f === g;
      }, clone() {
        if (this.$$.ptr || ke(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var s = he(Object.create(Object.getPrototypeOf(this), { $$: { value: Qt(this.$$) } }));
        return s.$$.count.value += 1, s.$$.deleteScheduled = !1, s;
      }, delete() {
        this.$$.ptr || ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && L("Object already scheduled for deletion"), at(this), st(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && L("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Pe() {
    }
    var Ie = (s, a) => Object.defineProperty(a, "name", { value: s }), ar = (s, a, f) => {
      if (s[a].overloadTable === void 0) {
        var m = s[a];
        s[a] = function(...g) {
          return s[a].overloadTable.hasOwnProperty(g.length) || L(`Function '${f}' called with an invalid number of arguments (${g.length}) - expects one of (${s[a].overloadTable})!`), s[a].overloadTable[g.length].apply(this, g);
        }, s[a].overloadTable = [], s[a].overloadTable[m.argCount] = m;
      }
    }, De = (s, a, f) => {
      t.hasOwnProperty(s) ? ((f === void 0 || t[s].overloadTable !== void 0 && t[s].overloadTable[f] !== void 0) && L(`Cannot register public name '${s}' twice`), ar(t, s, s), t[s].overloadTable.hasOwnProperty(f) && L(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`), t[s].overloadTable[f] = a) : (t[s] = a, t[s].argCount = f);
    }, sr = 48, lr = 57, cr = (s) => {
      s = s.replace(/[^a-zA-Z0-9_]/g, "$");
      var a = s.charCodeAt(0);
      return a >= sr && a <= lr ? `_${s}` : s;
    };
    function dr(s, a, f, m, g, b, w, y) {
      this.name = s, this.constructor = a, this.instancePrototype = f, this.rawDestructor = m, this.baseClass = g, this.getActualType = b, this.upcast = w, this.downcast = y, this.pureVirtualFunctions = [];
    }
    var Ce = (s, a, f) => {
      for (; a !== f; )
        a.upcast || L(`Expected null or instance of ${f.name}, got an instance of ${a.name}`), s = a.upcast(s), a = a.baseClass;
      return s;
    };
    function ur(s, a) {
      if (a === null)
        return this.isReference && L(`null is not a valid ${this.name}`), 0;
      a.$$ || L(`Cannot pass "${ve(a)}" as a ${this.name}`), a.$$.ptr || L(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, m = Ce(a.$$.ptr, f, this.registeredClass);
      return m;
    }
    function fr(s, a) {
      var f;
      if (a === null)
        return this.isReference && L(`null is not a valid ${this.name}`), this.isSmartPointer ? (f = this.rawConstructor(), s !== null && s.push(this.rawDestructor, f), f) : 0;
      (!a || !a.$$) && L(`Cannot pass "${ve(a)}" as a ${this.name}`), a.$$.ptr || L(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && a.$$.ptrType.isConst && L(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
      var m = a.$$.ptrType.registeredClass;
      if (f = Ce(a.$$.ptr, m, this.registeredClass), this.isSmartPointer)
        switch (a.$$.smartPtr === void 0 && L("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            a.$$.smartPtrType === this ? f = a.$$.smartPtr : L(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            f = a.$$.smartPtr;
            break;
          case 2:
            if (a.$$.smartPtrType === this)
              f = a.$$.smartPtr;
            else {
              var g = a.clone();
              f = this.rawShare(f, Y.toHandle(() => g.delete())), s !== null && s.push(this.rawDestructor, f);
            }
            break;
          default:
            L("Unsupporting sharing policy");
        }
      return f;
    }
    function pr(s, a) {
      if (a === null)
        return this.isReference && L(`null is not a valid ${this.name}`), 0;
      a.$$ || L(`Cannot pass "${ve(a)}" as a ${this.name}`), a.$$.ptr || L(`Cannot pass deleted object as a pointer of type ${this.name}`), a.$$.ptrType.isConst && L(`Cannot convert argument of type ${a.$$.ptrType.name} to parameter type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, m = Ce(a.$$.ptr, f, this.registeredClass);
      return m;
    }
    function xe(s) {
      return this.fromWireType($[s >> 2]);
    }
    var mr = () => {
      Object.assign(Ee.prototype, { getPointee(s) {
        return this.rawGetPointee && (s = this.rawGetPointee(s)), s;
      }, destructor(s) {
        this.rawDestructor?.(s);
      }, argPackAdvance: q, readValueFromPointer: xe, fromWireType: or });
    };
    function Ee(s, a, f, m, g, b, w, y, I, T, _) {
      this.name = s, this.registeredClass = a, this.isReference = f, this.isConst = m, this.isSmartPointer = g, this.pointeeType = b, this.sharingPolicy = w, this.rawGetPointee = y, this.rawConstructor = I, this.rawShare = T, this.rawDestructor = _, !g && a.baseClass === void 0 ? m ? (this.toWireType = ur, this.destructorFunction = null) : (this.toWireType = pr, this.destructorFunction = null) : this.toWireType = fr;
    }
    var dt = (s, a, f) => {
      t.hasOwnProperty(s) || we("Replacing nonexistent public symbol"), t[s].overloadTable !== void 0 && f !== void 0 ? t[s].overloadTable[f] = a : (t[s] = a, t[s].argCount = f);
    }, hr = (s, a, f) => {
      s = s.replace(/p/g, "i");
      var m = t["dynCall_" + s];
      return m(a, ...f);
    }, gr = (s, a, f = []) => {
      var m = hr(s, a, f);
      return m;
    }, yr = (s, a) => (...f) => gr(s, a, f), te = (s, a) => {
      s = W(s);
      function f() {
        return yr(s, a);
      }
      var m = f();
      return typeof m != "function" && L(`unknown function pointer with signature ${s}: ${a}`), m;
    }, br = (s, a) => {
      var f = Ie(a, function(m) {
        this.name = a, this.message = m;
        var g = new Error(m).stack;
        g !== void 0 && (this.stack = this.toString() + `
` + g.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return f.prototype = Object.create(s.prototype), f.prototype.constructor = f, f.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, f;
    }, ut, ft = (s) => {
      var a = gn(s), f = W(a);
      return Q(a), f;
    }, ge = (s, a) => {
      var f = [], m = {};
      function g(b) {
        if (!m[b] && !se[b]) {
          if (Oe[b]) {
            Oe[b].forEach(g);
            return;
          }
          f.push(b), m[b] = !0;
        }
      }
      throw a.forEach(g), new ut(`${s}: ` + f.map(ft).join([", "]));
    }, vr = (s, a, f, m, g, b, w, y, I, T, _, M, V) => {
      _ = W(_), b = te(g, b), y &&= te(w, y), T &&= te(I, T), V = te(M, V);
      var Z = cr(_);
      De(Z, function() {
        ge(`Cannot construct ${_} due to unbound types`, [m]);
      }), fe([s, a, f], m ? [m] : [], (K) => {
        K = K[0];
        var ne, G;
        m ? (ne = K.registeredClass, G = ne.instancePrototype) : G = Pe.prototype;
        var X = Ie(_, function(...We) {
          if (Object.getPrototypeOf(this) !== oe)
            throw new ue("Use 'new' to construct " + _);
          if (U.constructor_body === void 0)
            throw new ue(_ + " has no accessible constructor");
          var It = U.constructor_body[We.length];
          if (It === void 0)
            throw new ue(`Tried to invoke ctor of ${_} with invalid number of parameters (${We.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return It.apply(this, We);
        }), oe = Object.create(G, { constructor: { value: X } });
        X.prototype = oe;
        var U = new dr(_, X, oe, V, ne, b, y, T);
        U.baseClass && (U.baseClass.__derivedClasses ??= [], U.baseClass.__derivedClasses.push(U));
        var ie = new Ee(_, U, !0, !1, !1), _e = new Ee(_ + "*", U, !1, !1, !1), Pt = new Ee(_ + " const*", U, !1, !0, !1);
        return ct[s] = { pointerType: _e, constPointerType: Pt }, dt(Z, X), [ie, _e, Pt];
      });
    }, pt = (s, a) => {
      for (var f = [], m = 0; m < s; m++)
        f.push($[a + m * 4 >> 2]);
      return f;
    }, Re = (s) => {
      for (; s.length; ) {
        var a = s.pop(), f = s.pop();
        f(a);
      }
    };
    function Or(s) {
      for (var a = 1; a < s.length; ++a)
        if (s[a] !== null && s[a].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Se = (s) => {
      try {
        return s();
      } catch (a) {
        be(a);
      }
    }, mt = (s) => {
      if (s instanceof Ke || s == "unwind")
        return B;
      O(1, s);
    }, ht = 0, gt = () => tt || ht > 0, yt = (s) => {
      B = s, gt() || (t.onExit?.(s), N = !0), O(s, new Ke(s));
    }, wr = (s, a) => {
      B = s, yt(s);
    }, jr = wr, Pr = () => {
      if (!gt())
        try {
          jr(B);
        } catch (s) {
          mt(s);
        }
    }, bt = (s) => {
      if (!N)
        try {
          s(), Pr();
        } catch (a) {
          mt(a);
        }
    }, E = { instrumentWasmImports(s) {
      var a = /^(__asyncjs__.*)$/;
      for (let [f, m] of Object.entries(s))
        typeof m == "function" && (m.isAsync || a.test(f));
    }, instrumentWasmExports(s) {
      var a = {};
      for (let [f, m] of Object.entries(s))
        typeof m == "function" ? a[f] = (...g) => {
          E.exportCallStack.push(f);
          try {
            return m(...g);
          } finally {
            N || (E.exportCallStack.pop(), E.maybeStopUnwind());
          }
        } : a[f] = m;
      return a;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(s) {
      var a = E.callStackNameToId[s];
      return a === void 0 && (a = E.callStackId++, E.callStackNameToId[s] = a, E.callStackIdToName[a] = s), a;
    }, maybeStopUnwind() {
      E.currData && E.state === E.State.Unwinding && E.exportCallStack.length === 0 && (E.state = E.State.Normal, Se(vn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((s, a) => {
        E.asyncPromiseHandlers = { resolve: s, reject: a };
      });
    }, allocateData() {
      var s = Ne(12 + E.StackSize);
      return E.setDataHeader(s, s + 12, E.StackSize), E.setDataRewindFunc(s), s;
    }, setDataHeader(s, a, f) {
      $[s >> 2] = a, $[s + 4 >> 2] = a + f;
    }, setDataRewindFunc(s) {
      var a = E.exportCallStack[0], f = E.getCallStackId(a);
      ee[s + 8 >> 2] = f;
    }, getDataRewindFuncName(s) {
      var a = ee[s + 8 >> 2], f = E.callStackIdToName[a];
      return f;
    }, getDataRewindFunc(s) {
      var a = k[s];
      return a;
    }, doRewind(s) {
      var a = E.getDataRewindFuncName(s), f = E.getDataRewindFunc(a);
      return f();
    }, handleSleep(s) {
      if (!N) {
        if (E.state === E.State.Normal) {
          var a = !1, f = !1;
          s((m = 0) => {
            if (!N && (E.handleSleepReturnValue = m, a = !0, !!f)) {
              E.state = E.State.Rewinding, Se(() => On(E.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var g, b = !1;
              try {
                g = E.doRewind(E.currData);
              } catch (I) {
                g = I, b = !0;
              }
              var w = !1;
              if (!E.currData) {
                var y = E.asyncPromiseHandlers;
                y && (E.asyncPromiseHandlers = null, (b ? y.reject : y.resolve)(g), w = !0);
              }
              if (b && !w)
                throw g;
            }
          }), f = !0, a || (E.state = E.State.Unwinding, E.currData = E.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Se(() => bn(E.currData)));
        } else E.state === E.State.Rewinding ? (E.state = E.State.Normal, Se(wn), Q(E.currData), E.currData = null, E.sleepCallbacks.forEach(bt)) : be(`invalid state: ${E.state}`);
        return E.handleSleepReturnValue;
      }
    }, handleAsync(s) {
      return E.handleSleep((a) => {
        s().then(a);
      });
    } };
    function vt(s, a, f, m, g, b) {
      var w = a.length;
      w < 2 && L("argTypes array size mismatch! Must at least get return value and 'this' types!"), a[1];
      var y = Or(a), I = a[0].name !== "void", T = w - 2, _ = new Array(T), M = [], V = [], Z = function(...K) {
        V.length = 0;
        var ne;
        M.length = 1, M[0] = g;
        for (var G = 0; G < T; ++G)
          _[G] = a[G + 2].toWireType(V, K[G]), M.push(_[G]);
        var X = m(...M);
        function oe(U) {
          if (y)
            Re(V);
          else
            for (var ie = 2; ie < a.length; ie++) {
              var _e = ie === 1 ? ne : _[ie - 2];
              a[ie].destructorFunction !== null && a[ie].destructorFunction(_e);
            }
          if (I)
            return a[0].fromWireType(U);
        }
        return E.currData ? E.whenDone().then(oe) : oe(X);
      };
      return Ie(s, Z);
    }
    var Ir = (s, a, f, m, g, b) => {
      var w = pt(a, f);
      g = te(m, g), fe([], [s], (y) => {
        y = y[0];
        var I = `constructor ${y.name}`;
        if (y.registeredClass.constructor_body === void 0 && (y.registeredClass.constructor_body = []), y.registeredClass.constructor_body[a - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${a - 1}) for class '${y.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return y.registeredClass.constructor_body[a - 1] = () => {
          ge(`Cannot construct ${y.name} due to unbound types`, w);
        }, fe([], w, (T) => (T.splice(1, 0, null), y.registeredClass.constructor_body[a - 1] = vt(I, T, null, g, b), [])), [];
      });
    }, Ot = (s, a, f) => (s instanceof Object || L(`${f} with invalid "this": ${s}`), s instanceof a.registeredClass.constructor || L(`${f} incompatible with "this" of type ${s.constructor.name}`), s.$$.ptr || L(`cannot call emscripten binding method ${f} on deleted object`), Ce(s.$$.ptr, s.$$.ptrType.registeredClass, a.registeredClass)), Cr = (s, a, f, m, g, b, w, y, I, T) => {
      a = W(a), g = te(m, g), fe([], [s], (_) => {
        _ = _[0];
        var M = `${_.name}.${a}`, V = { get() {
          ge(`Cannot access ${M} due to unbound types`, [f, w]);
        }, enumerable: !0, configurable: !0 };
        return I ? V.set = () => ge(`Cannot access ${M} due to unbound types`, [f, w]) : V.set = (Z) => L(M + " is a read-only property"), Object.defineProperty(_.registeredClass.instancePrototype, a, V), fe([], I ? [f, w] : [f], (Z) => {
          var K = Z[0], ne = { get() {
            var X = Ot(this, _, M + " getter");
            return K.fromWireType(g(b, X));
          }, enumerable: !0 };
          if (I) {
            I = te(y, I);
            var G = Z[1];
            ne.set = function(X) {
              var oe = Ot(this, _, M + " setter"), U = [];
              I(T, oe, G.toWireType(U, X)), Re(U);
            };
          }
          return Object.defineProperty(_.registeredClass.instancePrototype, a, ne), [];
        }), [];
      });
    }, Ae = [], re = [], Fe = (s) => {
      s > 9 && --re[s + 1] === 0 && (re[s] = void 0, Ae.push(s));
    }, xr = () => re.length / 2 - 5 - Ae.length, Er = () => {
      re.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = xr;
    }, Y = { toValue: (s) => (s || L("Cannot use deleted val. handle = " + s), re[s]), toHandle: (s) => {
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
          const a = Ae.pop() || re.length;
          return re[a] = s, re[a + 1] = 1, a;
        }
      }
    } }, Sr = { name: "emscripten::val", fromWireType: (s) => {
      var a = Y.toValue(s);
      return Fe(s), a;
    }, toWireType: (s, a) => Y.toHandle(a), argPackAdvance: q, readValueFromPointer: xe, destructorFunction: null }, _r = (s) => H(s, Sr), Tr = (s, a, f) => {
      switch (a) {
        case 1:
          return f ? function(m) {
            return this.fromWireType(J[m]);
          } : function(m) {
            return this.fromWireType(z[m]);
          };
        case 2:
          return f ? function(m) {
            return this.fromWireType(ce[m >> 1]);
          } : function(m) {
            return this.fromWireType(pe[m >> 1]);
          };
        case 4:
          return f ? function(m) {
            return this.fromWireType(ee[m >> 2]);
          } : function(m) {
            return this.fromWireType($[m >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${a}): ${s}`);
      }
    }, kr = (s, a, f, m) => {
      a = W(a);
      function g() {
      }
      g.values = {}, H(s, { name: a, constructor: g, fromWireType: function(b) {
        return this.constructor.values[b];
      }, toWireType: (b, w) => w.value, argPackAdvance: q, readValueFromPointer: Tr(a, f, m), destructorFunction: null }), De(a, g);
    }, Me = (s, a) => {
      var f = se[s];
      return f === void 0 && L(`${a} has unknown type ${ft(s)}`), f;
    }, Lr = (s, a, f) => {
      var m = Me(s, "enum");
      a = W(a);
      var g = m.constructor, b = Object.create(m.constructor.prototype, { value: { value: f }, constructor: { value: Ie(`${m.name}_${a}`, function() {
      }) } });
      g.values[f] = b, g[a] = b;
    }, Dr = (s, a) => {
      switch (a) {
        case 4:
          return function(f) {
            return this.fromWireType(Be[f >> 2]);
          };
        case 8:
          return function(f) {
            return this.fromWireType(Je[f >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${a}): ${s}`);
      }
    }, Rr = (s, a, f) => {
      a = W(a), H(s, { name: a, fromWireType: (m) => m, toWireType: (m, g) => g, argPackAdvance: q, readValueFromPointer: Dr(a, f), destructorFunction: null });
    }, Ar = (s) => {
      s = s.trim();
      const a = s.indexOf("(");
      return a === -1 ? s : s.slice(0, a);
    }, Fr = (s, a, f, m, g, b, w, y) => {
      var I = pt(a, f);
      s = W(s), s = Ar(s), g = te(m, g), De(s, function() {
        ge(`Cannot call ${s} due to unbound types`, I);
      }, a - 1), fe([], I, (T) => {
        var _ = [T[0], null].concat(T.slice(1));
        return dt(s, vt(s, _, null, g, b), a - 1), [];
      });
    }, Mr = (s, a, f, m, g) => {
      a = W(a);
      var b = (_) => _;
      if (m === 0) {
        var w = 32 - 8 * f;
        b = (_) => _ << w >>> w;
      }
      var y = a.includes("unsigned"), I = (_, M) => {
      }, T;
      y ? T = function(_, M) {
        return I(M, this.name), M >>> 0;
      } : T = function(_, M) {
        return I(M, this.name), M;
      }, H(s, { name: a, fromWireType: b, toWireType: T, argPackAdvance: q, readValueFromPointer: it(a, f, m !== 0), destructorFunction: null });
    }, Nr = (s, a, f) => {
      var m = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], g = m[a];
      function b(w) {
        var y = $[w >> 2], I = $[w + 4 >> 2];
        return new g(J.buffer, I, y);
      }
      f = W(f), H(s, { name: f, fromWireType: b, argPackAdvance: q, readValueFromPointer: b }, { ignoreDuplicateRegistrations: !0 });
    }, $r = (s, a, f, m) => {
      if (!(m > 0)) return 0;
      for (var g = f, b = f + m - 1, w = 0; w < s.length; ++w) {
        var y = s.charCodeAt(w);
        if (y >= 55296 && y <= 57343) {
          var I = s.charCodeAt(++w);
          y = 65536 + ((y & 1023) << 10) | I & 1023;
        }
        if (y <= 127) {
          if (f >= b) break;
          a[f++] = y;
        } else if (y <= 2047) {
          if (f + 1 >= b) break;
          a[f++] = 192 | y >> 6, a[f++] = 128 | y & 63;
        } else if (y <= 65535) {
          if (f + 2 >= b) break;
          a[f++] = 224 | y >> 12, a[f++] = 128 | y >> 6 & 63, a[f++] = 128 | y & 63;
        } else {
          if (f + 3 >= b) break;
          a[f++] = 240 | y >> 18, a[f++] = 128 | y >> 12 & 63, a[f++] = 128 | y >> 6 & 63, a[f++] = 128 | y & 63;
        }
      }
      return a[f] = 0, f - g;
    }, Wr = (s, a, f) => $r(s, z, a, f), Vr = (s) => {
      for (var a = 0, f = 0; f < s.length; ++f) {
        var m = s.charCodeAt(f);
        m <= 127 ? a++ : m <= 2047 ? a += 2 : m >= 55296 && m <= 57343 ? (a += 4, ++f) : a += 3;
      }
      return a;
    }, wt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Ur = (s, a = 0, f = NaN) => {
      for (var m = a + f, g = a; s[g] && !(g >= m); ) ++g;
      if (g - a > 16 && s.buffer && wt)
        return wt.decode(s.subarray(a, g));
      for (var b = ""; a < g; ) {
        var w = s[a++];
        if (!(w & 128)) {
          b += String.fromCharCode(w);
          continue;
        }
        var y = s[a++] & 63;
        if ((w & 224) == 192) {
          b += String.fromCharCode((w & 31) << 6 | y);
          continue;
        }
        var I = s[a++] & 63;
        if ((w & 240) == 224 ? w = (w & 15) << 12 | y << 6 | I : w = (w & 7) << 18 | y << 12 | I << 6 | s[a++] & 63, w < 65536)
          b += String.fromCharCode(w);
        else {
          var T = w - 65536;
          b += String.fromCharCode(55296 | T >> 10, 56320 | T & 1023);
        }
      }
      return b;
    }, zr = (s, a) => s ? Ur(z, s, a) : "", Gr = (s, a) => {
      a = W(a), H(s, { name: a, fromWireType(f) {
        for (var m = $[f >> 2], g = f + 4, b, w, y = g, w = 0; w <= m; ++w) {
          var I = g + w;
          if (w == m || z[I] == 0) {
            var T = I - y, _ = zr(y, T);
            b === void 0 ? b = _ : (b += "\0", b += _), y = I + 1;
          }
        }
        return Q(f), b;
      }, toWireType(f, m) {
        m instanceof ArrayBuffer && (m = new Uint8Array(m));
        var g, b = typeof m == "string";
        b || m instanceof Uint8Array || m instanceof Uint8ClampedArray || m instanceof Int8Array || L("Cannot pass non-string to std::string"), b ? g = Vr(m) : g = m.length;
        var w = Ne(4 + g + 1), y = w + 4;
        if ($[w >> 2] = g, b)
          Wr(m, y, g + 1);
        else if (b)
          for (var I = 0; I < g; ++I) {
            var T = m.charCodeAt(I);
            T > 255 && (Q(w), L("String has UTF-16 code units that do not fit in 8 bits")), z[y + I] = T;
          }
        else
          for (var I = 0; I < g; ++I)
            z[y + I] = m[I];
        return f !== null && f.push(Q, w), w;
      }, argPackAdvance: q, readValueFromPointer: xe, destructorFunction(f) {
        Q(f);
      } });
    }, jt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Br = (s, a) => {
      for (var f = s, m = f >> 1, g = m + a / 2; !(m >= g) && pe[m]; ) ++m;
      if (f = m << 1, f - s > 32 && jt) return jt.decode(z.subarray(s, f));
      for (var b = "", w = 0; !(w >= a / 2); ++w) {
        var y = ce[s + w * 2 >> 1];
        if (y == 0) break;
        b += String.fromCharCode(y);
      }
      return b;
    }, Hr = (s, a, f) => {
      if (f ??= 2147483647, f < 2) return 0;
      f -= 2;
      for (var m = a, g = f < s.length * 2 ? f / 2 : s.length, b = 0; b < g; ++b) {
        var w = s.charCodeAt(b);
        ce[a >> 1] = w, a += 2;
      }
      return ce[a >> 1] = 0, a - m;
    }, Yr = (s) => s.length * 2, Jr = (s, a) => {
      for (var f = 0, m = ""; !(f >= a / 4); ) {
        var g = ee[s + f * 4 >> 2];
        if (g == 0) break;
        if (++f, g >= 65536) {
          var b = g - 65536;
          m += String.fromCharCode(55296 | b >> 10, 56320 | b & 1023);
        } else
          m += String.fromCharCode(g);
      }
      return m;
    }, qr = (s, a, f) => {
      if (f ??= 2147483647, f < 4) return 0;
      for (var m = a, g = m + f - 4, b = 0; b < s.length; ++b) {
        var w = s.charCodeAt(b);
        if (w >= 55296 && w <= 57343) {
          var y = s.charCodeAt(++b);
          w = 65536 + ((w & 1023) << 10) | y & 1023;
        }
        if (ee[a >> 2] = w, a += 4, a + 4 > g) break;
      }
      return ee[a >> 2] = 0, a - m;
    }, Zr = (s) => {
      for (var a = 0, f = 0; f < s.length; ++f) {
        var m = s.charCodeAt(f);
        m >= 55296 && m <= 57343 && ++f, a += 4;
      }
      return a;
    }, Kr = (s, a, f) => {
      f = W(f);
      var m, g, b, w;
      a === 2 ? (m = Br, g = Hr, w = Yr, b = (y) => pe[y >> 1]) : a === 4 && (m = Jr, g = qr, w = Zr, b = (y) => $[y >> 2]), H(s, { name: f, fromWireType: (y) => {
        for (var I = $[y >> 2], T, _ = y + 4, M = 0; M <= I; ++M) {
          var V = y + 4 + M * a;
          if (M == I || b(V) == 0) {
            var Z = V - _, K = m(_, Z);
            T === void 0 ? T = K : (T += "\0", T += K), _ = V + a;
          }
        }
        return Q(y), T;
      }, toWireType: (y, I) => {
        typeof I != "string" && L(`Cannot pass non-string to C++ string type ${f}`);
        var T = w(I), _ = Ne(4 + T + a);
        return $[_ >> 2] = T / a, g(I, _ + 4, T + a), y !== null && y.push(Q, _), _;
      }, argPackAdvance: q, readValueFromPointer: xe, destructorFunction(y) {
        Q(y);
      } });
    }, Xr = (s, a) => {
      a = W(a), H(s, { isVoid: !0, name: a, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (f, m) => {
      } });
    }, Qr = () => {
      tt = !1, ht = 0;
    }, en = (s, a, f) => {
      var m = [], g = s.toWireType(m, f);
      return m.length && ($[a >> 2] = Y.toHandle(m)), g;
    }, tn = (s, a, f) => (s = Y.toValue(s), a = Me(a, "emval::as"), en(a, f, s)), rn = (s, a) => (s = Y.toValue(s), a = Y.toValue(a), Y.toHandle(s[a])), nn = {}, on = (s) => {
      var a = nn[s];
      return a === void 0 ? W(s) : a;
    }, an = (s) => Y.toHandle(on(s)), sn = (s) => {
      var a = Y.toValue(s);
      Re(a), Fe(s);
    }, ln = (s, a) => {
      s = Me(s, "_emval_take_value");
      var f = s.readValueFromPointer(a);
      return Y.toHandle(f);
    }, ye = {}, cn = () => performance.now(), dn = (s, a) => {
      if (ye[s] && (clearTimeout(ye[s].id), delete ye[s]), !a) return 0;
      var f = setTimeout(() => {
        delete ye[s], bt(() => yn(s, cn()));
      }, a);
      return ye[s] = { id: f, timeout_ms: a }, 0;
    }, un = () => 2147483648, fn = (s, a) => Math.ceil(s / a) * a, pn = (s) => {
      var a = R.buffer, f = (s - a.byteLength + 65535) / 65536 | 0;
      try {
        return R.grow(f), Ze(), 1;
      } catch {
      }
    }, mn = (s) => {
      var a = z.length;
      s >>>= 0;
      var f = un();
      if (s > f)
        return !1;
      for (var m = 1; m <= 4; m *= 2) {
        var g = a * (1 + 0.2 / m);
        g = Math.min(g, s + 100663296);
        var b = Math.min(f, fn(Math.max(s, g), 65536)), w = pn(b);
        if (w)
          return !0;
      }
      return !1;
    };
    qt(), ue = t.BindingError = class extends Error {
      constructor(a) {
        super(a), this.name = "BindingError";
      }
    }, ot = t.InternalError = class extends Error {
      constructor(a) {
        super(a), this.name = "InternalError";
      }
    }, ir(), mr(), ut = t.UnboundTypeError = br(Error, "UnboundTypeError"), Er();
    var hn = { i: Yt, s: Jt, n: Kt, w: Xt, f: vr, d: Ir, a: Cr, u: _r, l: kr, g: Lr, m: Rr, b: Fr, e: Mr, c: Nr, v: Gr, h: Kr, x: Xr, q: Qr, j: tn, y: Fe, k: rn, o: an, A: sn, z: ln, r: dn, t: mn, p: yt }, k = await zt();
    k.C;
    var gn = k.D, Ne = t._malloc = k.E, Q = t._free = k.F, yn = k.G;
    t.dynCall_v = k.I, t.dynCall_ii = k.J, t.dynCall_vi = k.K, t.dynCall_i = k.L, t.dynCall_iii = k.M, t.dynCall_viii = k.N, t.dynCall_fii = k.O, t.dynCall_viif = k.P, t.dynCall_viiii = k.Q, t.dynCall_viiiiii = k.R, t.dynCall_iiiiii = k.S, t.dynCall_viiiii = k.T, t.dynCall_iiiiiii = k.U, t.dynCall_iiiiiiii = k.V, t.dynCall_viiiiiii = k.W, t.dynCall_viiiiiiiiidi = k.X, t.dynCall_viiiiiiiidi = k.Y, t.dynCall_viiiiiiiiii = k.Z, t.dynCall_viiiiiiiii = k._, t.dynCall_viiiiiiii = k.$, t.dynCall_iiiii = k.aa, t.dynCall_iiii = k.ba;
    var bn = k.ca, vn = k.da, On = k.ea, wn = k.fa;
    function $e() {
      if (ae > 0) {
        me = $e;
        return;
      }
      if (Lt(), ae > 0) {
        me = $e;
        return;
      }
      function s() {
        t.calledRun = !0, !N && (Dt(), e(t), t.onRuntimeInitialized?.(), Rt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), s();
      }, 1)) : s();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return $e(), n = o, n;
  });
})();
function Oo(v, u) {
  return Math.sqrt((v.x - u.x) ** 2 + (v.y - u.y) ** 2);
}
function ri(v, u) {
  return {
    x: (v.x + u.x) / 2,
    y: (v.y + u.y) / 2
  };
}
function ni(v, u) {
  if (v.confidence <= 0 || u.confidence <= 0)
    return { x: 0, y: 0 };
  const n = Oo(v.center, u.center), t = ri(v.center, u.center);
  return {
    x: t.x,
    y: t.y + n / 4
    // calculation is taken from mobile team
  };
}
function oi(v, u, n) {
  if (v.confidence <= 0 || u.confidence <= 0)
    return 0;
  const t = Oo(v.center, u.center), e = yo(n.width, n.height);
  return Fn(t / e);
}
function Dn(v) {
  const { centerX: u, centerY: n, confidence: t, size: e, status: r } = v;
  return {
    center: {
      x: u,
      y: n
    },
    confidence: t / Ct,
    status: r / Ct,
    size: e
  };
}
function ii(v, u) {
  const { faceCenter: n, faceSize: t } = v, e = No(t, u), r = {
    topLeft: {
      x: n.x - e,
      y: n.y - e
    },
    topRight: {
      x: n.x + e,
      y: n.y - e
    },
    bottomRight: {
      x: n.x + e,
      y: n.y + e
    },
    bottomLeft: {
      x: n.x - e,
      y: n.y + e
    }
  };
  return $o(r);
}
class ai extends Mo {
  getSamWasmFilePath(u, n) {
    return `${u}/face/wasm/${n}`;
  }
  fetchSamModule(u) {
    return ti(u);
  }
  parseRawData(u, n) {
    const { brightness: t, sharpness: e } = u.params, { bottomRightX: r, bottomRightY: o, leftEye: i, mouth: d, rightEye: p, topLeftX: O, topLeftY: C } = u, j = Dn(i), P = Dn(p), x = Dn(d);
    return {
      confidence: u.confidence / Ct,
      topLeft: {
        x: O,
        y: C
      },
      bottomRight: {
        x: r,
        y: o
      },
      faceCenter: ni(j, P),
      faceSize: oi(j, P, n),
      leftEye: j,
      rightEye: P,
      mouth: x,
      brightness: t / Ct,
      sharpness: e / Ct
    };
  }
  async detect(u, n, t) {
    if (!this.samWasmModule)
      throw new le("SAM WASM module is not initialized");
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
  async getOptimalRegionForCompressionDetection(u, n, t) {
    const e = ii(t, n);
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(u, n, e);
  }
}
var si = (() => {
  var v = import.meta.url;
  return (async function(u = {}) {
    var n, t = u, e, r, o = new Promise((s, a) => {
      e = s, r = a;
    }), i = typeof window == "object", d = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var p = Object.assign({}, t), O = (s, a) => {
      throw a;
    }, C = "";
    function j(s) {
      return t.locateFile ? t.locateFile(s, C) : C + s;
    }
    var P, x;
    (i || d) && (d ? C = self.location.href : typeof document < "u" && document.currentScript && (C = document.currentScript.src), v && (C = v), C.startsWith("blob:") ? C = "" : C = C.slice(0, C.replace(/[?#].*/, "").lastIndexOf("/") + 1), d && (x = (s) => {
      var a = new XMLHttpRequest();
      return a.open("GET", s, !1), a.responseType = "arraybuffer", a.send(null), new Uint8Array(a.response);
    }), P = async (s) => {
      if (qe(s))
        return new Promise((f, m) => {
          var g = new XMLHttpRequest();
          g.open("GET", s, !0), g.responseType = "arraybuffer", g.onload = () => {
            if (g.status == 200 || g.status == 0 && g.response) {
              f(g.response);
              return;
            }
            m(g.status);
          }, g.onerror = m, g.send(null);
        });
      var a = await fetch(s, { credentials: "same-origin" });
      if (a.ok)
        return a.arrayBuffer();
      throw new Error(a.status + " : " + a.url);
    }), t.print || console.log.bind(console);
    var A = t.printErr || console.error.bind(console);
    Object.assign(t, p), p = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var S = t.wasmBinary, R, N = !1, B, J, z, ce, pe, ee, $, Be, He, Ye, Je, qe = (s) => s.startsWith("file://");
    function Ze() {
      var s = R.buffer;
      t.HEAP8 = J = new Int8Array(s), t.HEAP16 = ce = new Int16Array(s), t.HEAPU8 = z = new Uint8Array(s), t.HEAPU16 = pe = new Uint16Array(s), t.HEAP32 = ee = new Int32Array(s), t.HEAPU32 = $ = new Uint32Array(s), t.HEAPF32 = Be = new Float32Array(s), t.HEAPF64 = Je = new Float64Array(s), t.HEAP64 = He = new BigInt64Array(s), t.HEAPU64 = Ye = new BigUint64Array(s);
    }
    function Lt() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Bt(t.preRun.shift());
      Xe(et);
    }
    function Dt() {
      k.C();
    }
    function Rt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Gt(t.postRun.shift());
      Xe(Qe);
    }
    var ae = 0, me = null;
    function At(s) {
      ae++, t.monitorRunDependencies?.(ae);
    }
    function Ft(s) {
      if (ae--, t.monitorRunDependencies?.(ae), ae == 0 && me) {
        var a = me;
        me = null, a();
      }
    }
    function be(s) {
      t.onAbort?.(s), s = "Aborted(" + s + ")", A(s), N = !0, s += ". Build with -sASSERTIONS for more info.";
      var a = new WebAssembly.RuntimeError(s);
      throw r(a), a;
    }
    var Te;
    function Mt() {
      return t.locateFile ? j("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Nt(s) {
      if (s == Te && S)
        return new Uint8Array(S);
      if (x)
        return x(s);
      throw "both async and sync fetching of the wasm failed";
    }
    async function $t(s) {
      if (!S)
        try {
          var a = await P(s);
          return new Uint8Array(a);
        } catch {
        }
      return Nt(s);
    }
    async function Wt(s, a) {
      try {
        var f = await $t(s), m = await WebAssembly.instantiate(f, a);
        return m;
      } catch (g) {
        A(`failed to asynchronously prepare wasm: ${g}`), be(g);
      }
    }
    async function Vt(s, a, f) {
      if (!s && typeof WebAssembly.instantiateStreaming == "function" && !qe(a))
        try {
          var m = fetch(a, { credentials: "same-origin" }), g = await WebAssembly.instantiateStreaming(m, f);
          return g;
        } catch (b) {
          A(`wasm streaming compile failed: ${b}`), A("falling back to ArrayBuffer instantiation");
        }
      return Wt(a, f);
    }
    function Ut() {
      return { a: hn };
    }
    async function zt() {
      function s(b, w) {
        return k = b.exports, k = E.instrumentWasmExports(k), R = k.B, Ze(), k.H, Ft(), k;
      }
      At();
      function a(b) {
        return s(b.instance);
      }
      var f = Ut();
      if (t.instantiateWasm)
        return new Promise((b, w) => {
          t.instantiateWasm(f, (y, I) => {
            s(y), b(y.exports);
          });
        });
      Te ??= Mt();
      try {
        var m = await Vt(S, Te, f), g = a(m);
        return g;
      } catch (b) {
        return r(b), Promise.reject(b);
      }
    }
    class Ke {
      name = "ExitStatus";
      constructor(a) {
        this.message = `Program terminated with exit(${a})`, this.status = a;
      }
    }
    var Xe = (s) => {
      for (; s.length > 0; )
        s.shift()(t);
    }, Qe = [], Gt = (s) => Qe.unshift(s), et = [], Bt = (s) => et.unshift(s), tt = t.noExitRuntime || !0;
    class Ht {
      constructor(a) {
        this.excPtr = a, this.ptr = a - 24;
      }
      set_type(a) {
        $[this.ptr + 4 >> 2] = a;
      }
      get_type() {
        return $[this.ptr + 4 >> 2];
      }
      set_destructor(a) {
        $[this.ptr + 8 >> 2] = a;
      }
      get_destructor() {
        return $[this.ptr + 8 >> 2];
      }
      set_caught(a) {
        a = a ? 1 : 0, J[this.ptr + 12] = a;
      }
      get_caught() {
        return J[this.ptr + 12] != 0;
      }
      set_rethrown(a) {
        a = a ? 1 : 0, J[this.ptr + 13] = a;
      }
      get_rethrown() {
        return J[this.ptr + 13] != 0;
      }
      init(a, f) {
        this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(f);
      }
      set_adjusted_ptr(a) {
        $[this.ptr + 16 >> 2] = a;
      }
      get_adjusted_ptr() {
        return $[this.ptr + 16 >> 2];
      }
    }
    var rt = 0, Yt = (s, a, f) => {
      var m = new Ht(s);
      throw m.init(a, f), rt = s, rt;
    }, Jt = () => be(""), ve = (s) => {
      if (s === null)
        return "null";
      var a = typeof s;
      return a === "object" || a === "array" || a === "function" ? s.toString() : "" + s;
    }, qt = () => {
      for (var s = new Array(256), a = 0; a < 256; ++a)
        s[a] = String.fromCharCode(a);
      nt = s;
    }, nt, W = (s) => {
      for (var a = "", f = s; z[f]; )
        a += nt[z[f++]];
      return a;
    }, de = {}, se = {}, Oe = {}, ue, L = (s) => {
      throw new ue(s);
    }, ot, we = (s) => {
      throw new ot(s);
    }, fe = (s, a, f) => {
      s.forEach((y) => Oe[y] = a);
      function m(y) {
        var I = f(y);
        I.length !== s.length && we("Mismatched type converter count");
        for (var T = 0; T < s.length; ++T)
          H(s[T], I[T]);
      }
      var g = new Array(a.length), b = [], w = 0;
      a.forEach((y, I) => {
        se.hasOwnProperty(y) ? g[I] = se[y] : (b.push(y), de.hasOwnProperty(y) || (de[y] = []), de[y].push(() => {
          g[I] = se[y], ++w, w === b.length && m(g);
        }));
      }), b.length === 0 && m(g);
    };
    function Zt(s, a, f = {}) {
      var m = a.name;
      if (s || L(`type "${m}" must have a positive integer typeid pointer`), se.hasOwnProperty(s)) {
        if (f.ignoreDuplicateRegistrations)
          return;
        L(`Cannot register type '${m}' twice`);
      }
      if (se[s] = a, delete Oe[s], de.hasOwnProperty(s)) {
        var g = de[s];
        delete de[s], g.forEach((b) => b());
      }
    }
    function H(s, a, f = {}) {
      return Zt(s, a, f);
    }
    var it = (s, a, f) => {
      switch (a) {
        case 1:
          return f ? (m) => J[m] : (m) => z[m];
        case 2:
          return f ? (m) => ce[m >> 1] : (m) => pe[m >> 1];
        case 4:
          return f ? (m) => ee[m >> 2] : (m) => $[m >> 2];
        case 8:
          return f ? (m) => He[m >> 3] : (m) => Ye[m >> 3];
        default:
          throw new TypeError(`invalid integer width (${a}): ${s}`);
      }
    }, Kt = (s, a, f, m, g) => {
      a = W(a);
      var b = a.indexOf("u") != -1;
      H(s, { name: a, fromWireType: (w) => w, toWireType: function(w, y) {
        if (typeof y != "bigint" && typeof y != "number")
          throw new TypeError(`Cannot convert "${ve(y)}" to ${this.name}`);
        return typeof y == "number" && (y = BigInt(y)), y;
      }, argPackAdvance: q, readValueFromPointer: it(a, f, !b), destructorFunction: null });
    }, q = 8, Xt = (s, a, f, m) => {
      a = W(a), H(s, { name: a, fromWireType: function(g) {
        return !!g;
      }, toWireType: function(g, b) {
        return b ? f : m;
      }, argPackAdvance: q, readValueFromPointer: function(g) {
        return this.fromWireType(z[g]);
      }, destructorFunction: null });
    }, Qt = (s) => ({ count: s.count, deleteScheduled: s.deleteScheduled, preservePointerOnDelete: s.preservePointerOnDelete, ptr: s.ptr, ptrType: s.ptrType, smartPtr: s.smartPtr, smartPtrType: s.smartPtrType }), ke = (s) => {
      function a(f) {
        return f.$$.ptrType.registeredClass.name;
      }
      L(a(s) + " instance already deleted");
    }, Le = !1, at = (s) => {
    }, er = (s) => {
      s.smartPtr ? s.smartPtrType.rawDestructor(s.smartPtr) : s.ptrType.registeredClass.rawDestructor(s.ptr);
    }, st = (s) => {
      s.count.value -= 1;
      var a = s.count.value === 0;
      a && er(s);
    }, lt = (s, a, f) => {
      if (a === f)
        return s;
      if (f.baseClass === void 0)
        return null;
      var m = lt(s, a, f.baseClass);
      return m === null ? null : f.downcast(m);
    }, ct = {}, tr = {}, rr = (s, a) => {
      for (a === void 0 && L("ptr should not be undefined"); s.baseClass; )
        a = s.upcast(a), s = s.baseClass;
      return a;
    }, nr = (s, a) => (a = rr(s, a), tr[a]), je = (s, a) => {
      (!a.ptrType || !a.ptr) && we("makeClassHandle requires ptr and ptrType");
      var f = !!a.smartPtrType, m = !!a.smartPtr;
      return f !== m && we("Both smartPtrType and smartPtr must be specified"), a.count = { value: 1 }, he(Object.create(s, { $$: { value: a, writable: !0 } }));
    };
    function or(s) {
      var a = this.getPointee(s);
      if (!a)
        return this.destructor(s), null;
      var f = nr(this.registeredClass, a);
      if (f !== void 0) {
        if (f.$$.count.value === 0)
          return f.$$.ptr = a, f.$$.smartPtr = s, f.clone();
        var m = f.clone();
        return this.destructor(s), m;
      }
      function g() {
        return this.isSmartPointer ? je(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: a, smartPtrType: this, smartPtr: s }) : je(this.registeredClass.instancePrototype, { ptrType: this, ptr: s });
      }
      var b = this.registeredClass.getActualType(a), w = ct[b];
      if (!w)
        return g.call(this);
      var y;
      this.isConst ? y = w.constPointerType : y = w.pointerType;
      var I = lt(a, this.registeredClass, y.registeredClass);
      return I === null ? g.call(this) : this.isSmartPointer ? je(y.registeredClass.instancePrototype, { ptrType: y, ptr: I, smartPtrType: this, smartPtr: s }) : je(y.registeredClass.instancePrototype, { ptrType: y, ptr: I });
    }
    var he = (s) => typeof FinalizationRegistry > "u" ? (he = (a) => a, s) : (Le = new FinalizationRegistry((a) => {
      st(a.$$);
    }), he = (a) => {
      var f = a.$$, m = !!f.smartPtr;
      if (m) {
        var g = { $$: f };
        Le.register(a, g, a);
      }
      return a;
    }, at = (a) => Le.unregister(a), he(s)), ir = () => {
      Object.assign(Pe.prototype, { isAliasOf(s) {
        if (!(this instanceof Pe) || !(s instanceof Pe))
          return !1;
        var a = this.$$.ptrType.registeredClass, f = this.$$.ptr;
        s.$$ = s.$$;
        for (var m = s.$$.ptrType.registeredClass, g = s.$$.ptr; a.baseClass; )
          f = a.upcast(f), a = a.baseClass;
        for (; m.baseClass; )
          g = m.upcast(g), m = m.baseClass;
        return a === m && f === g;
      }, clone() {
        if (this.$$.ptr || ke(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var s = he(Object.create(Object.getPrototypeOf(this), { $$: { value: Qt(this.$$) } }));
        return s.$$.count.value += 1, s.$$.deleteScheduled = !1, s;
      }, delete() {
        this.$$.ptr || ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && L("Object already scheduled for deletion"), at(this), st(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && L("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Pe() {
    }
    var Ie = (s, a) => Object.defineProperty(a, "name", { value: s }), ar = (s, a, f) => {
      if (s[a].overloadTable === void 0) {
        var m = s[a];
        s[a] = function(...g) {
          return s[a].overloadTable.hasOwnProperty(g.length) || L(`Function '${f}' called with an invalid number of arguments (${g.length}) - expects one of (${s[a].overloadTable})!`), s[a].overloadTable[g.length].apply(this, g);
        }, s[a].overloadTable = [], s[a].overloadTable[m.argCount] = m;
      }
    }, De = (s, a, f) => {
      t.hasOwnProperty(s) ? ((f === void 0 || t[s].overloadTable !== void 0 && t[s].overloadTable[f] !== void 0) && L(`Cannot register public name '${s}' twice`), ar(t, s, s), t[s].overloadTable.hasOwnProperty(f) && L(`Cannot register multiple overloads of a function with the same number of arguments (${f})!`), t[s].overloadTable[f] = a) : (t[s] = a, t[s].argCount = f);
    }, sr = 48, lr = 57, cr = (s) => {
      s = s.replace(/[^a-zA-Z0-9_]/g, "$");
      var a = s.charCodeAt(0);
      return a >= sr && a <= lr ? `_${s}` : s;
    };
    function dr(s, a, f, m, g, b, w, y) {
      this.name = s, this.constructor = a, this.instancePrototype = f, this.rawDestructor = m, this.baseClass = g, this.getActualType = b, this.upcast = w, this.downcast = y, this.pureVirtualFunctions = [];
    }
    var Ce = (s, a, f) => {
      for (; a !== f; )
        a.upcast || L(`Expected null or instance of ${f.name}, got an instance of ${a.name}`), s = a.upcast(s), a = a.baseClass;
      return s;
    };
    function ur(s, a) {
      if (a === null)
        return this.isReference && L(`null is not a valid ${this.name}`), 0;
      a.$$ || L(`Cannot pass "${ve(a)}" as a ${this.name}`), a.$$.ptr || L(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, m = Ce(a.$$.ptr, f, this.registeredClass);
      return m;
    }
    function fr(s, a) {
      var f;
      if (a === null)
        return this.isReference && L(`null is not a valid ${this.name}`), this.isSmartPointer ? (f = this.rawConstructor(), s !== null && s.push(this.rawDestructor, f), f) : 0;
      (!a || !a.$$) && L(`Cannot pass "${ve(a)}" as a ${this.name}`), a.$$.ptr || L(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && a.$$.ptrType.isConst && L(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
      var m = a.$$.ptrType.registeredClass;
      if (f = Ce(a.$$.ptr, m, this.registeredClass), this.isSmartPointer)
        switch (a.$$.smartPtr === void 0 && L("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            a.$$.smartPtrType === this ? f = a.$$.smartPtr : L(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            f = a.$$.smartPtr;
            break;
          case 2:
            if (a.$$.smartPtrType === this)
              f = a.$$.smartPtr;
            else {
              var g = a.clone();
              f = this.rawShare(f, Y.toHandle(() => g.delete())), s !== null && s.push(this.rawDestructor, f);
            }
            break;
          default:
            L("Unsupporting sharing policy");
        }
      return f;
    }
    function pr(s, a) {
      if (a === null)
        return this.isReference && L(`null is not a valid ${this.name}`), 0;
      a.$$ || L(`Cannot pass "${ve(a)}" as a ${this.name}`), a.$$.ptr || L(`Cannot pass deleted object as a pointer of type ${this.name}`), a.$$.ptrType.isConst && L(`Cannot convert argument of type ${a.$$.ptrType.name} to parameter type ${this.name}`);
      var f = a.$$.ptrType.registeredClass, m = Ce(a.$$.ptr, f, this.registeredClass);
      return m;
    }
    function xe(s) {
      return this.fromWireType($[s >> 2]);
    }
    var mr = () => {
      Object.assign(Ee.prototype, { getPointee(s) {
        return this.rawGetPointee && (s = this.rawGetPointee(s)), s;
      }, destructor(s) {
        this.rawDestructor?.(s);
      }, argPackAdvance: q, readValueFromPointer: xe, fromWireType: or });
    };
    function Ee(s, a, f, m, g, b, w, y, I, T, _) {
      this.name = s, this.registeredClass = a, this.isReference = f, this.isConst = m, this.isSmartPointer = g, this.pointeeType = b, this.sharingPolicy = w, this.rawGetPointee = y, this.rawConstructor = I, this.rawShare = T, this.rawDestructor = _, !g && a.baseClass === void 0 ? m ? (this.toWireType = ur, this.destructorFunction = null) : (this.toWireType = pr, this.destructorFunction = null) : this.toWireType = fr;
    }
    var dt = (s, a, f) => {
      t.hasOwnProperty(s) || we("Replacing nonexistent public symbol"), t[s].overloadTable !== void 0 && f !== void 0 ? t[s].overloadTable[f] = a : (t[s] = a, t[s].argCount = f);
    }, hr = (s, a, f) => {
      s = s.replace(/p/g, "i");
      var m = t["dynCall_" + s];
      return m(a, ...f);
    }, gr = (s, a, f = []) => {
      var m = hr(s, a, f);
      return m;
    }, yr = (s, a) => (...f) => gr(s, a, f), te = (s, a) => {
      s = W(s);
      function f() {
        return yr(s, a);
      }
      var m = f();
      return typeof m != "function" && L(`unknown function pointer with signature ${s}: ${a}`), m;
    }, br = (s, a) => {
      var f = Ie(a, function(m) {
        this.name = a, this.message = m;
        var g = new Error(m).stack;
        g !== void 0 && (this.stack = this.toString() + `
` + g.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return f.prototype = Object.create(s.prototype), f.prototype.constructor = f, f.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, f;
    }, ut, ft = (s) => {
      var a = gn(s), f = W(a);
      return Q(a), f;
    }, ge = (s, a) => {
      var f = [], m = {};
      function g(b) {
        if (!m[b] && !se[b]) {
          if (Oe[b]) {
            Oe[b].forEach(g);
            return;
          }
          f.push(b), m[b] = !0;
        }
      }
      throw a.forEach(g), new ut(`${s}: ` + f.map(ft).join([", "]));
    }, vr = (s, a, f, m, g, b, w, y, I, T, _, M, V) => {
      _ = W(_), b = te(g, b), y &&= te(w, y), T &&= te(I, T), V = te(M, V);
      var Z = cr(_);
      De(Z, function() {
        ge(`Cannot construct ${_} due to unbound types`, [m]);
      }), fe([s, a, f], m ? [m] : [], (K) => {
        K = K[0];
        var ne, G;
        m ? (ne = K.registeredClass, G = ne.instancePrototype) : G = Pe.prototype;
        var X = Ie(_, function(...We) {
          if (Object.getPrototypeOf(this) !== oe)
            throw new ue("Use 'new' to construct " + _);
          if (U.constructor_body === void 0)
            throw new ue(_ + " has no accessible constructor");
          var It = U.constructor_body[We.length];
          if (It === void 0)
            throw new ue(`Tried to invoke ctor of ${_} with invalid number of parameters (${We.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return It.apply(this, We);
        }), oe = Object.create(G, { constructor: { value: X } });
        X.prototype = oe;
        var U = new dr(_, X, oe, V, ne, b, y, T);
        U.baseClass && (U.baseClass.__derivedClasses ??= [], U.baseClass.__derivedClasses.push(U));
        var ie = new Ee(_, U, !0, !1, !1), _e = new Ee(_ + "*", U, !1, !1, !1), Pt = new Ee(_ + " const*", U, !1, !0, !1);
        return ct[s] = { pointerType: _e, constPointerType: Pt }, dt(Z, X), [ie, _e, Pt];
      });
    }, pt = (s, a) => {
      for (var f = [], m = 0; m < s; m++)
        f.push($[a + m * 4 >> 2]);
      return f;
    }, Re = (s) => {
      for (; s.length; ) {
        var a = s.pop(), f = s.pop();
        f(a);
      }
    };
    function Or(s) {
      for (var a = 1; a < s.length; ++a)
        if (s[a] !== null && s[a].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Se = (s) => {
      try {
        return s();
      } catch (a) {
        be(a);
      }
    }, mt = (s) => {
      if (s instanceof Ke || s == "unwind")
        return B;
      O(1, s);
    }, ht = 0, gt = () => tt || ht > 0, yt = (s) => {
      B = s, gt() || (t.onExit?.(s), N = !0), O(s, new Ke(s));
    }, wr = (s, a) => {
      B = s, yt(s);
    }, jr = wr, Pr = () => {
      if (!gt())
        try {
          jr(B);
        } catch (s) {
          mt(s);
        }
    }, bt = (s) => {
      if (!N)
        try {
          s(), Pr();
        } catch (a) {
          mt(a);
        }
    }, E = { instrumentWasmImports(s) {
      var a = /^(__asyncjs__.*)$/;
      for (let [f, m] of Object.entries(s))
        typeof m == "function" && (m.isAsync || a.test(f));
    }, instrumentWasmExports(s) {
      var a = {};
      for (let [f, m] of Object.entries(s))
        typeof m == "function" ? a[f] = (...g) => {
          E.exportCallStack.push(f);
          try {
            return m(...g);
          } finally {
            N || (E.exportCallStack.pop(), E.maybeStopUnwind());
          }
        } : a[f] = m;
      return a;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(s) {
      var a = E.callStackNameToId[s];
      return a === void 0 && (a = E.callStackId++, E.callStackNameToId[s] = a, E.callStackIdToName[a] = s), a;
    }, maybeStopUnwind() {
      E.currData && E.state === E.State.Unwinding && E.exportCallStack.length === 0 && (E.state = E.State.Normal, Se(vn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((s, a) => {
        E.asyncPromiseHandlers = { resolve: s, reject: a };
      });
    }, allocateData() {
      var s = Ne(12 + E.StackSize);
      return E.setDataHeader(s, s + 12, E.StackSize), E.setDataRewindFunc(s), s;
    }, setDataHeader(s, a, f) {
      $[s >> 2] = a, $[s + 4 >> 2] = a + f;
    }, setDataRewindFunc(s) {
      var a = E.exportCallStack[0], f = E.getCallStackId(a);
      ee[s + 8 >> 2] = f;
    }, getDataRewindFuncName(s) {
      var a = ee[s + 8 >> 2], f = E.callStackIdToName[a];
      return f;
    }, getDataRewindFunc(s) {
      var a = k[s];
      return a;
    }, doRewind(s) {
      var a = E.getDataRewindFuncName(s), f = E.getDataRewindFunc(a);
      return f();
    }, handleSleep(s) {
      if (!N) {
        if (E.state === E.State.Normal) {
          var a = !1, f = !1;
          s((m = 0) => {
            if (!N && (E.handleSleepReturnValue = m, a = !0, !!f)) {
              E.state = E.State.Rewinding, Se(() => On(E.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var g, b = !1;
              try {
                g = E.doRewind(E.currData);
              } catch (I) {
                g = I, b = !0;
              }
              var w = !1;
              if (!E.currData) {
                var y = E.asyncPromiseHandlers;
                y && (E.asyncPromiseHandlers = null, (b ? y.reject : y.resolve)(g), w = !0);
              }
              if (b && !w)
                throw g;
            }
          }), f = !0, a || (E.state = E.State.Unwinding, E.currData = E.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Se(() => bn(E.currData)));
        } else E.state === E.State.Rewinding ? (E.state = E.State.Normal, Se(wn), Q(E.currData), E.currData = null, E.sleepCallbacks.forEach(bt)) : be(`invalid state: ${E.state}`);
        return E.handleSleepReturnValue;
      }
    }, handleAsync(s) {
      return E.handleSleep((a) => {
        s().then(a);
      });
    } };
    function vt(s, a, f, m, g, b) {
      var w = a.length;
      w < 2 && L("argTypes array size mismatch! Must at least get return value and 'this' types!"), a[1];
      var y = Or(a), I = a[0].name !== "void", T = w - 2, _ = new Array(T), M = [], V = [], Z = function(...K) {
        V.length = 0;
        var ne;
        M.length = 1, M[0] = g;
        for (var G = 0; G < T; ++G)
          _[G] = a[G + 2].toWireType(V, K[G]), M.push(_[G]);
        var X = m(...M);
        function oe(U) {
          if (y)
            Re(V);
          else
            for (var ie = 2; ie < a.length; ie++) {
              var _e = ie === 1 ? ne : _[ie - 2];
              a[ie].destructorFunction !== null && a[ie].destructorFunction(_e);
            }
          if (I)
            return a[0].fromWireType(U);
        }
        return E.currData ? E.whenDone().then(oe) : oe(X);
      };
      return Ie(s, Z);
    }
    var Ir = (s, a, f, m, g, b) => {
      var w = pt(a, f);
      g = te(m, g), fe([], [s], (y) => {
        y = y[0];
        var I = `constructor ${y.name}`;
        if (y.registeredClass.constructor_body === void 0 && (y.registeredClass.constructor_body = []), y.registeredClass.constructor_body[a - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${a - 1}) for class '${y.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return y.registeredClass.constructor_body[a - 1] = () => {
          ge(`Cannot construct ${y.name} due to unbound types`, w);
        }, fe([], w, (T) => (T.splice(1, 0, null), y.registeredClass.constructor_body[a - 1] = vt(I, T, null, g, b), [])), [];
      });
    }, Ot = (s, a, f) => (s instanceof Object || L(`${f} with invalid "this": ${s}`), s instanceof a.registeredClass.constructor || L(`${f} incompatible with "this" of type ${s.constructor.name}`), s.$$.ptr || L(`cannot call emscripten binding method ${f} on deleted object`), Ce(s.$$.ptr, s.$$.ptrType.registeredClass, a.registeredClass)), Cr = (s, a, f, m, g, b, w, y, I, T) => {
      a = W(a), g = te(m, g), fe([], [s], (_) => {
        _ = _[0];
        var M = `${_.name}.${a}`, V = { get() {
          ge(`Cannot access ${M} due to unbound types`, [f, w]);
        }, enumerable: !0, configurable: !0 };
        return I ? V.set = () => ge(`Cannot access ${M} due to unbound types`, [f, w]) : V.set = (Z) => L(M + " is a read-only property"), Object.defineProperty(_.registeredClass.instancePrototype, a, V), fe([], I ? [f, w] : [f], (Z) => {
          var K = Z[0], ne = { get() {
            var X = Ot(this, _, M + " getter");
            return K.fromWireType(g(b, X));
          }, enumerable: !0 };
          if (I) {
            I = te(y, I);
            var G = Z[1];
            ne.set = function(X) {
              var oe = Ot(this, _, M + " setter"), U = [];
              I(T, oe, G.toWireType(U, X)), Re(U);
            };
          }
          return Object.defineProperty(_.registeredClass.instancePrototype, a, ne), [];
        }), [];
      });
    }, Ae = [], re = [], Fe = (s) => {
      s > 9 && --re[s + 1] === 0 && (re[s] = void 0, Ae.push(s));
    }, xr = () => re.length / 2 - 5 - Ae.length, Er = () => {
      re.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = xr;
    }, Y = { toValue: (s) => (s || L("Cannot use deleted val. handle = " + s), re[s]), toHandle: (s) => {
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
          const a = Ae.pop() || re.length;
          return re[a] = s, re[a + 1] = 1, a;
        }
      }
    } }, Sr = { name: "emscripten::val", fromWireType: (s) => {
      var a = Y.toValue(s);
      return Fe(s), a;
    }, toWireType: (s, a) => Y.toHandle(a), argPackAdvance: q, readValueFromPointer: xe, destructorFunction: null }, _r = (s) => H(s, Sr), Tr = (s, a, f) => {
      switch (a) {
        case 1:
          return f ? function(m) {
            return this.fromWireType(J[m]);
          } : function(m) {
            return this.fromWireType(z[m]);
          };
        case 2:
          return f ? function(m) {
            return this.fromWireType(ce[m >> 1]);
          } : function(m) {
            return this.fromWireType(pe[m >> 1]);
          };
        case 4:
          return f ? function(m) {
            return this.fromWireType(ee[m >> 2]);
          } : function(m) {
            return this.fromWireType($[m >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${a}): ${s}`);
      }
    }, kr = (s, a, f, m) => {
      a = W(a);
      function g() {
      }
      g.values = {}, H(s, { name: a, constructor: g, fromWireType: function(b) {
        return this.constructor.values[b];
      }, toWireType: (b, w) => w.value, argPackAdvance: q, readValueFromPointer: Tr(a, f, m), destructorFunction: null }), De(a, g);
    }, Me = (s, a) => {
      var f = se[s];
      return f === void 0 && L(`${a} has unknown type ${ft(s)}`), f;
    }, Lr = (s, a, f) => {
      var m = Me(s, "enum");
      a = W(a);
      var g = m.constructor, b = Object.create(m.constructor.prototype, { value: { value: f }, constructor: { value: Ie(`${m.name}_${a}`, function() {
      }) } });
      g.values[f] = b, g[a] = b;
    }, Dr = (s, a) => {
      switch (a) {
        case 4:
          return function(f) {
            return this.fromWireType(Be[f >> 2]);
          };
        case 8:
          return function(f) {
            return this.fromWireType(Je[f >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${a}): ${s}`);
      }
    }, Rr = (s, a, f) => {
      a = W(a), H(s, { name: a, fromWireType: (m) => m, toWireType: (m, g) => g, argPackAdvance: q, readValueFromPointer: Dr(a, f), destructorFunction: null });
    }, Ar = (s) => {
      s = s.trim();
      const a = s.indexOf("(");
      return a === -1 ? s : s.slice(0, a);
    }, Fr = (s, a, f, m, g, b, w, y) => {
      var I = pt(a, f);
      s = W(s), s = Ar(s), g = te(m, g), De(s, function() {
        ge(`Cannot call ${s} due to unbound types`, I);
      }, a - 1), fe([], I, (T) => {
        var _ = [T[0], null].concat(T.slice(1));
        return dt(s, vt(s, _, null, g, b), a - 1), [];
      });
    }, Mr = (s, a, f, m, g) => {
      a = W(a);
      var b = (_) => _;
      if (m === 0) {
        var w = 32 - 8 * f;
        b = (_) => _ << w >>> w;
      }
      var y = a.includes("unsigned"), I = (_, M) => {
      }, T;
      y ? T = function(_, M) {
        return I(M, this.name), M >>> 0;
      } : T = function(_, M) {
        return I(M, this.name), M;
      }, H(s, { name: a, fromWireType: b, toWireType: T, argPackAdvance: q, readValueFromPointer: it(a, f, m !== 0), destructorFunction: null });
    }, Nr = (s, a, f) => {
      var m = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], g = m[a];
      function b(w) {
        var y = $[w >> 2], I = $[w + 4 >> 2];
        return new g(J.buffer, I, y);
      }
      f = W(f), H(s, { name: f, fromWireType: b, argPackAdvance: q, readValueFromPointer: b }, { ignoreDuplicateRegistrations: !0 });
    }, $r = (s, a, f, m) => {
      if (!(m > 0)) return 0;
      for (var g = f, b = f + m - 1, w = 0; w < s.length; ++w) {
        var y = s.charCodeAt(w);
        if (y >= 55296 && y <= 57343) {
          var I = s.charCodeAt(++w);
          y = 65536 + ((y & 1023) << 10) | I & 1023;
        }
        if (y <= 127) {
          if (f >= b) break;
          a[f++] = y;
        } else if (y <= 2047) {
          if (f + 1 >= b) break;
          a[f++] = 192 | y >> 6, a[f++] = 128 | y & 63;
        } else if (y <= 65535) {
          if (f + 2 >= b) break;
          a[f++] = 224 | y >> 12, a[f++] = 128 | y >> 6 & 63, a[f++] = 128 | y & 63;
        } else {
          if (f + 3 >= b) break;
          a[f++] = 240 | y >> 18, a[f++] = 128 | y >> 12 & 63, a[f++] = 128 | y >> 6 & 63, a[f++] = 128 | y & 63;
        }
      }
      return a[f] = 0, f - g;
    }, Wr = (s, a, f) => $r(s, z, a, f), Vr = (s) => {
      for (var a = 0, f = 0; f < s.length; ++f) {
        var m = s.charCodeAt(f);
        m <= 127 ? a++ : m <= 2047 ? a += 2 : m >= 55296 && m <= 57343 ? (a += 4, ++f) : a += 3;
      }
      return a;
    }, wt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Ur = (s, a = 0, f = NaN) => {
      for (var m = a + f, g = a; s[g] && !(g >= m); ) ++g;
      if (g - a > 16 && s.buffer && wt)
        return wt.decode(s.subarray(a, g));
      for (var b = ""; a < g; ) {
        var w = s[a++];
        if (!(w & 128)) {
          b += String.fromCharCode(w);
          continue;
        }
        var y = s[a++] & 63;
        if ((w & 224) == 192) {
          b += String.fromCharCode((w & 31) << 6 | y);
          continue;
        }
        var I = s[a++] & 63;
        if ((w & 240) == 224 ? w = (w & 15) << 12 | y << 6 | I : w = (w & 7) << 18 | y << 12 | I << 6 | s[a++] & 63, w < 65536)
          b += String.fromCharCode(w);
        else {
          var T = w - 65536;
          b += String.fromCharCode(55296 | T >> 10, 56320 | T & 1023);
        }
      }
      return b;
    }, zr = (s, a) => s ? Ur(z, s, a) : "", Gr = (s, a) => {
      a = W(a), H(s, { name: a, fromWireType(f) {
        for (var m = $[f >> 2], g = f + 4, b, w, y = g, w = 0; w <= m; ++w) {
          var I = g + w;
          if (w == m || z[I] == 0) {
            var T = I - y, _ = zr(y, T);
            b === void 0 ? b = _ : (b += "\0", b += _), y = I + 1;
          }
        }
        return Q(f), b;
      }, toWireType(f, m) {
        m instanceof ArrayBuffer && (m = new Uint8Array(m));
        var g, b = typeof m == "string";
        b || m instanceof Uint8Array || m instanceof Uint8ClampedArray || m instanceof Int8Array || L("Cannot pass non-string to std::string"), b ? g = Vr(m) : g = m.length;
        var w = Ne(4 + g + 1), y = w + 4;
        if ($[w >> 2] = g, b)
          Wr(m, y, g + 1);
        else if (b)
          for (var I = 0; I < g; ++I) {
            var T = m.charCodeAt(I);
            T > 255 && (Q(w), L("String has UTF-16 code units that do not fit in 8 bits")), z[y + I] = T;
          }
        else
          for (var I = 0; I < g; ++I)
            z[y + I] = m[I];
        return f !== null && f.push(Q, w), w;
      }, argPackAdvance: q, readValueFromPointer: xe, destructorFunction(f) {
        Q(f);
      } });
    }, jt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Br = (s, a) => {
      for (var f = s, m = f >> 1, g = m + a / 2; !(m >= g) && pe[m]; ) ++m;
      if (f = m << 1, f - s > 32 && jt) return jt.decode(z.subarray(s, f));
      for (var b = "", w = 0; !(w >= a / 2); ++w) {
        var y = ce[s + w * 2 >> 1];
        if (y == 0) break;
        b += String.fromCharCode(y);
      }
      return b;
    }, Hr = (s, a, f) => {
      if (f ??= 2147483647, f < 2) return 0;
      f -= 2;
      for (var m = a, g = f < s.length * 2 ? f / 2 : s.length, b = 0; b < g; ++b) {
        var w = s.charCodeAt(b);
        ce[a >> 1] = w, a += 2;
      }
      return ce[a >> 1] = 0, a - m;
    }, Yr = (s) => s.length * 2, Jr = (s, a) => {
      for (var f = 0, m = ""; !(f >= a / 4); ) {
        var g = ee[s + f * 4 >> 2];
        if (g == 0) break;
        if (++f, g >= 65536) {
          var b = g - 65536;
          m += String.fromCharCode(55296 | b >> 10, 56320 | b & 1023);
        } else
          m += String.fromCharCode(g);
      }
      return m;
    }, qr = (s, a, f) => {
      if (f ??= 2147483647, f < 4) return 0;
      for (var m = a, g = m + f - 4, b = 0; b < s.length; ++b) {
        var w = s.charCodeAt(b);
        if (w >= 55296 && w <= 57343) {
          var y = s.charCodeAt(++b);
          w = 65536 + ((w & 1023) << 10) | y & 1023;
        }
        if (ee[a >> 2] = w, a += 4, a + 4 > g) break;
      }
      return ee[a >> 2] = 0, a - m;
    }, Zr = (s) => {
      for (var a = 0, f = 0; f < s.length; ++f) {
        var m = s.charCodeAt(f);
        m >= 55296 && m <= 57343 && ++f, a += 4;
      }
      return a;
    }, Kr = (s, a, f) => {
      f = W(f);
      var m, g, b, w;
      a === 2 ? (m = Br, g = Hr, w = Yr, b = (y) => pe[y >> 1]) : a === 4 && (m = Jr, g = qr, w = Zr, b = (y) => $[y >> 2]), H(s, { name: f, fromWireType: (y) => {
        for (var I = $[y >> 2], T, _ = y + 4, M = 0; M <= I; ++M) {
          var V = y + 4 + M * a;
          if (M == I || b(V) == 0) {
            var Z = V - _, K = m(_, Z);
            T === void 0 ? T = K : (T += "\0", T += K), _ = V + a;
          }
        }
        return Q(y), T;
      }, toWireType: (y, I) => {
        typeof I != "string" && L(`Cannot pass non-string to C++ string type ${f}`);
        var T = w(I), _ = Ne(4 + T + a);
        return $[_ >> 2] = T / a, g(I, _ + 4, T + a), y !== null && y.push(Q, _), _;
      }, argPackAdvance: q, readValueFromPointer: xe, destructorFunction(y) {
        Q(y);
      } });
    }, Xr = (s, a) => {
      a = W(a), H(s, { isVoid: !0, name: a, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (f, m) => {
      } });
    }, Qr = () => {
      tt = !1, ht = 0;
    }, en = (s, a, f) => {
      var m = [], g = s.toWireType(m, f);
      return m.length && ($[a >> 2] = Y.toHandle(m)), g;
    }, tn = (s, a, f) => (s = Y.toValue(s), a = Me(a, "emval::as"), en(a, f, s)), rn = (s, a) => (s = Y.toValue(s), a = Y.toValue(a), Y.toHandle(s[a])), nn = {}, on = (s) => {
      var a = nn[s];
      return a === void 0 ? W(s) : a;
    }, an = (s) => Y.toHandle(on(s)), sn = (s) => {
      var a = Y.toValue(s);
      Re(a), Fe(s);
    }, ln = (s, a) => {
      s = Me(s, "_emval_take_value");
      var f = s.readValueFromPointer(a);
      return Y.toHandle(f);
    }, ye = {}, cn = () => performance.now(), dn = (s, a) => {
      if (ye[s] && (clearTimeout(ye[s].id), delete ye[s]), !a) return 0;
      var f = setTimeout(() => {
        delete ye[s], bt(() => yn(s, cn()));
      }, a);
      return ye[s] = { id: f, timeout_ms: a }, 0;
    }, un = () => 2147483648, fn = (s, a) => Math.ceil(s / a) * a, pn = (s) => {
      var a = R.buffer, f = (s - a.byteLength + 65535) / 65536 | 0;
      try {
        return R.grow(f), Ze(), 1;
      } catch {
      }
    }, mn = (s) => {
      var a = z.length;
      s >>>= 0;
      var f = un();
      if (s > f)
        return !1;
      for (var m = 1; m <= 4; m *= 2) {
        var g = a * (1 + 0.2 / m);
        g = Math.min(g, s + 100663296);
        var b = Math.min(f, fn(Math.max(s, g), 65536)), w = pn(b);
        if (w)
          return !0;
      }
      return !1;
    };
    qt(), ue = t.BindingError = class extends Error {
      constructor(a) {
        super(a), this.name = "BindingError";
      }
    }, ot = t.InternalError = class extends Error {
      constructor(a) {
        super(a), this.name = "InternalError";
      }
    }, ir(), mr(), ut = t.UnboundTypeError = br(Error, "UnboundTypeError"), Er();
    var hn = { i: Yt, s: Jt, n: Kt, w: Xt, f: vr, d: Ir, a: Cr, u: _r, l: kr, g: Lr, m: Rr, b: Fr, e: Mr, c: Nr, v: Gr, h: Kr, x: Xr, q: Qr, j: tn, y: Fe, k: rn, o: an, A: sn, z: ln, r: dn, t: mn, p: yt }, k = await zt();
    k.C;
    var gn = k.D, Ne = t._malloc = k.E, Q = t._free = k.F, yn = k.G;
    t.dynCall_v = k.I, t.dynCall_ii = k.J, t.dynCall_vi = k.K, t.dynCall_i = k.L, t.dynCall_iii = k.M, t.dynCall_viii = k.N, t.dynCall_fii = k.O, t.dynCall_viif = k.P, t.dynCall_viiii = k.Q, t.dynCall_viiiiii = k.R, t.dynCall_iiiiii = k.S, t.dynCall_viiiii = k.T, t.dynCall_iiiiiii = k.U, t.dynCall_iiiiiiii = k.V, t.dynCall_viiiiiii = k.W, t.dynCall_viiiiiiiiidi = k.X, t.dynCall_viiiiiiiidi = k.Y, t.dynCall_viiiiiiiiii = k.Z, t.dynCall_viiiiiiiii = k._, t.dynCall_viiiiiiii = k.$, t.dynCall_iiiii = k.aa, t.dynCall_iiii = k.ba;
    var bn = k.ca, vn = k.da, On = k.ea, wn = k.fa;
    function $e() {
      if (ae > 0) {
        me = $e;
        return;
      }
      if (Lt(), ae > 0) {
        me = $e;
        return;
      }
      function s() {
        t.calledRun = !0, !N && (Dt(), e(t), t.onRuntimeInitialized?.(), Rt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), s();
      }, 1)) : s();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return $e(), n = o, n;
  });
})();
let li = class extends ai {
  getSamWasmFilePath(u, n) {
    return `${u}/magnifeye/wasm/${n}`;
  }
  fetchSamModule(u) {
    return si(u);
  }
};
class ci extends li {
}
An(ci);
