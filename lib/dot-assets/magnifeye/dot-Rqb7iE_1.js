var Eo = Object.defineProperty;
var Hn = (y) => {
  throw TypeError(y);
};
var Ro = (y, u, r) => u in y ? Eo(y, u, { enumerable: !0, configurable: !0, writable: !0, value: r }) : y[u] = r;
var At = (y, u, r) => Ro(y, typeof u != "symbol" ? u + "" : u, r), Yn = (y, u, r) => u.has(y) || Hn("Cannot " + r);
var ve = (y, u, r) => (Yn(y, u, "read from private field"), r ? r.call(y) : u.get(y)), Et = (y, u, r) => u.has(y) ? Hn("Cannot add the same private member more than once") : u instanceof WeakSet ? u.add(y) : u.set(y, r), Rt = (y, u, r, t) => (Yn(y, u, "write to private field"), t ? t.call(y, r) : u.set(y, r), r);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Po = Symbol("Comlink.proxy"), Mo = Symbol("Comlink.endpoint"), Fo = Symbol("Comlink.releaseProxy"), Ft = Symbol("Comlink.finalizer"), Lt = Symbol("Comlink.thrown"), Io = (y) => typeof y == "object" && y !== null || typeof y == "function", Lo = {
  canHandle: (y) => Io(y) && y[Po],
  serialize(y) {
    const { port1: u, port2: r } = new MessageChannel();
    return Gn(y, u), [r, [r]];
  },
  deserialize(y) {
    return y.start(), Wo(y);
  }
}, xo = {
  canHandle: (y) => Io(y) && Lt in y,
  serialize({ value: y }) {
    let u;
    return y instanceof Error ? u = {
      isError: !0,
      value: {
        message: y.message,
        name: y.name,
        stack: y.stack
      }
    } : u = { isError: !1, value: y }, [u, []];
  },
  deserialize(y) {
    throw y.isError ? Object.assign(new Error(y.value.message), y.value) : y.value;
  }
}, Co = /* @__PURE__ */ new Map([
  ["proxy", Lo],
  ["throw", xo]
]);
function No(y, u) {
  for (const r of y)
    if (u === r || r === "*" || r instanceof RegExp && r.test(u))
      return !0;
  return !1;
}
function Gn(y, u = globalThis, r = ["*"]) {
  u.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!No(r, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: n, type: o, path: d } = Object.assign({ path: [] }, e.data), c = (e.data.argumentList || []).map(ze);
    let w;
    try {
      const D = d.slice(0, -1).reduce((I, S) => I[S], y), b = d.reduce((I, S) => I[S], y);
      switch (o) {
        case "GET":
          w = b;
          break;
        case "SET":
          D[d.slice(-1)[0]] = ze(e.data.value), w = !0;
          break;
        case "APPLY":
          w = b.apply(D, c);
          break;
        case "CONSTRUCT":
          {
            const I = new b(...c);
            w = Bo(I);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: I, port2: S } = new MessageChannel();
            Gn(y, S), w = Go(I, [I]);
          }
          break;
        case "RELEASE":
          w = void 0;
          break;
        default:
          return;
      }
    } catch (D) {
      w = { value: D, [Lt]: 0 };
    }
    Promise.resolve(w).catch((D) => ({ value: D, [Lt]: 0 })).then((D) => {
      const [b, I] = $t(D);
      u.postMessage(Object.assign(Object.assign({}, b), { id: n }), I), o === "RELEASE" && (u.removeEventListener("message", t), jo(u), Ft in y && typeof y[Ft] == "function" && y[Ft]());
    }).catch((D) => {
      const [b, I] = $t({
        value: new TypeError("Unserializable return value"),
        [Lt]: 0
      });
      u.postMessage(Object.assign(Object.assign({}, b), { id: n }), I);
    });
  }), u.start && u.start();
}
function $o(y) {
  return y.constructor.name === "MessagePort";
}
function jo(y) {
  $o(y) && y.close();
}
function Wo(y, u) {
  const r = /* @__PURE__ */ new Map();
  return y.addEventListener("message", function(e) {
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
  }), zn(y, r, [], u);
}
function Mt(y) {
  if (y)
    throw new Error("Proxy has been released and is not useable");
}
function So(y) {
  return Ye(y, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    jo(y);
  });
}
const xt = /* @__PURE__ */ new WeakMap(), Nt = "FinalizationRegistry" in globalThis && new FinalizationRegistry((y) => {
  const u = (xt.get(y) || 0) - 1;
  xt.set(y, u), u === 0 && So(y);
});
function Uo(y, u) {
  const r = (xt.get(u) || 0) + 1;
  xt.set(u, r), Nt && Nt.register(y, u, y);
}
function Vo(y) {
  Nt && Nt.unregister(y);
}
function zn(y, u, r = [], t = function() {
}) {
  let e = !1;
  const n = new Proxy(t, {
    get(o, d) {
      if (Mt(e), d === Fo)
        return () => {
          Vo(n), So(y), u.clear(), e = !0;
        };
      if (d === "then") {
        if (r.length === 0)
          return { then: () => n };
        const c = Ye(y, u, {
          type: "GET",
          path: r.map((w) => w.toString())
        }).then(ze);
        return c.then.bind(c);
      }
      return zn(y, u, [...r, d]);
    },
    set(o, d, c) {
      Mt(e);
      const [w, D] = $t(c);
      return Ye(y, u, {
        type: "SET",
        path: [...r, d].map((b) => b.toString()),
        value: w
      }, D).then(ze);
    },
    apply(o, d, c) {
      Mt(e);
      const w = r[r.length - 1];
      if (w === Mo)
        return Ye(y, u, {
          type: "ENDPOINT"
        }).then(ze);
      if (w === "bind")
        return zn(y, u, r.slice(0, -1));
      const [D, b] = Jn(c);
      return Ye(y, u, {
        type: "APPLY",
        path: r.map((I) => I.toString()),
        argumentList: D
      }, b).then(ze);
    },
    construct(o, d) {
      Mt(e);
      const [c, w] = Jn(d);
      return Ye(y, u, {
        type: "CONSTRUCT",
        path: r.map((D) => D.toString()),
        argumentList: c
      }, w).then(ze);
    }
  });
  return Uo(n, y), n;
}
function zo(y) {
  return Array.prototype.concat.apply([], y);
}
function Jn(y) {
  const u = y.map($t);
  return [u.map((r) => r[0]), zo(u.map((r) => r[1]))];
}
const To = /* @__PURE__ */ new WeakMap();
function Go(y, u) {
  return To.set(y, u), y;
}
function Bo(y) {
  return Object.assign(y, { [Po]: !0 });
}
function $t(y) {
  for (const [u, r] of Co)
    if (r.canHandle(y)) {
      const [t, e] = r.serialize(y);
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
      value: y
    },
    To.get(y) || []
  ];
}
function ze(y) {
  switch (y.type) {
    case "HANDLER":
      return Co.get(y.name).deserialize(y.value);
    case "RAW":
      return y.value;
  }
}
function Ye(y, u, r, t) {
  return new Promise((e) => {
    const n = Ho();
    u.set(n, e), y.start && y.start(), y.postMessage(Object.assign({ id: n }, r), t);
  });
}
function Ho() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const _t = 1e3, Zn = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Yo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class fe extends Error {
  constructor(r, t) {
    super(r);
    At(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(r) {
  }
  static fromCameraError(r) {
    if (this.logError(r), r instanceof fe)
      return r;
    let t;
    switch (r.name) {
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
    return new fe(t, r);
  }
  static fromError(r) {
    if (this.logError(r), r instanceof fe)
      return r;
    const t = "An unexpected error has occurred";
    return new fe(t);
  }
}
const Jo = {
  RGBA: "RGBA"
};
var _e, Ge, Je;
class Zo {
  constructor(u, r) {
    Et(this, _e);
    Et(this, Ge);
    Et(this, Je);
    Rt(this, _e, u), Rt(this, Ge, this.allocate(r.length * r.BYTES_PER_ELEMENT)), Rt(this, Je, this.allocate(r.length * r.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return ve(this, Ge);
  }
  get bgr0ImagePointer() {
    return ve(this, Je);
  }
  allocate(u) {
    return ve(this, _e)._malloc(u);
  }
  free() {
    ve(this, _e)._free(ve(this, Ge)), ve(this, _e)._free(ve(this, Je));
  }
  writeDataToMemory(u) {
    ve(this, _e).HEAPU8.set(u, ve(this, Ge));
  }
}
_e = new WeakMap(), Ge = new WeakMap(), Je = new WeakMap();
class Ko {
  constructor() {
    At(this, "samWasmModule");
  }
  getOverriddenModules(u, r) {
    return {
      locateFile: (t) => new URL(r || t, u).href
    };
  }
  async handleMissingOrInvalidSamModule(u, r) {
    try {
      const t = await fetch(u);
      if (!t.ok)
        throw new fe(
          `The path to ${r} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${u}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new fe(
          `The provided ${r} is not a valid WASM module. Please check provided path to wasm files. Current path is ${u}`
        );
    } catch (t) {
      if (t instanceof fe)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Yo() ? Zn.simd : Zn.sam;
  }
  async initSamModule(u, r) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(r, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(u, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new fe("Could not init detector.");
    }
  }
  terminateSamModule() {
    var u;
    (u = this.samWasmModule) == null || u.terminate();
  }
  async getSamVersion() {
    var r;
    const u = await ((r = this.samWasmModule) == null ? void 0 : r.getInfoString());
    return u == null ? void 0 : u.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(u) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const r = new Zo(this.samWasmModule, u);
    return r.writeDataToMemory(u), r;
  }
  convertToSamColorImage(u, r) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(u);
    return this.samWasmModule.convertToSamColorImage(
      r.width,
      r.height,
      t.rgbaImagePointer,
      Jo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(u, r, t) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(u, r), { bottomLeft: n, topLeft: o, topRight: d } = t, c = [
      o.x,
      // x
      o.y,
      // y
      d.x - o.x,
      // width
      n.y - o.y
      // height
    ], { height: w, width: D, x: b, y: I } = await this.samWasmModule.selectDetailRegion(
      r.width,
      r.height,
      e.bgr0ImagePointer,
      c
    );
    return e.free(), {
      height: w,
      width: D,
      shiftX: b,
      shiftY: I
    };
  }
  [Ft]() {
    this.terminateSamModule();
  }
}
const Bn = (y) => Number.parseFloat(y.toFixed(3)), ko = (y, u) => Math.min(y, u);
function qo(y, u) {
  const r = ko(u.width, u.height);
  return Bn(y * r);
}
const Xo = (y) => JSON.parse(
  JSON.stringify(y, (u, r) => typeof r == "number" ? Bn(r) : r)
);
var He = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Kn = {}, An = {}, _n, qn;
function Qo() {
  if (qn) return _n;
  qn = 1, _n = y;
  function y(u, r) {
    for (var t = new Array(arguments.length - 1), e = 0, n = 2, o = !0; n < arguments.length; )
      t[e++] = arguments[n++];
    return new Promise(function(d, c) {
      t[e] = function(w) {
        if (o)
          if (o = !1, w)
            c(w);
          else {
            for (var D = new Array(arguments.length - 1), b = 0; b < D.length; )
              D[b++] = arguments[b];
            d.apply(null, D);
          }
      };
      try {
        u.apply(r || null, t);
      } catch (w) {
        o && (o = !1, c(w));
      }
    });
  }
  return _n;
}
var Xn = {}, Qn;
function ei() {
  return Qn || (Qn = 1, function(y) {
    var u = y;
    u.length = function(o) {
      var d = o.length;
      if (!d)
        return 0;
      for (var c = 0; --d % 4 > 1 && o.charAt(d) === "="; )
        ++c;
      return Math.ceil(o.length * 3) / 4 - c;
    };
    for (var r = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[r[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    u.encode = function(o, d, c) {
      for (var w = null, D = [], b = 0, I = 0, S; d < c; ) {
        var k = o[d++];
        switch (I) {
          case 0:
            D[b++] = r[k >> 2], S = (k & 3) << 4, I = 1;
            break;
          case 1:
            D[b++] = r[S | k >> 4], S = (k & 15) << 2, I = 2;
            break;
          case 2:
            D[b++] = r[S | k >> 6], D[b++] = r[k & 63], I = 0;
            break;
        }
        b > 8191 && ((w || (w = [])).push(String.fromCharCode.apply(String, D)), b = 0);
      }
      return I && (D[b++] = r[S], D[b++] = 61, I === 1 && (D[b++] = 61)), w ? (b && w.push(String.fromCharCode.apply(String, D.slice(0, b))), w.join("")) : String.fromCharCode.apply(String, D.slice(0, b));
    };
    var n = "invalid encoding";
    u.decode = function(o, d, c) {
      for (var w = c, D = 0, b, I = 0; I < o.length; ) {
        var S = o.charCodeAt(I++);
        if (S === 61 && D > 1)
          break;
        if ((S = t[S]) === void 0)
          throw Error(n);
        switch (D) {
          case 0:
            b = S, D = 1;
            break;
          case 1:
            d[c++] = b << 2 | (S & 48) >> 4, b = S, D = 2;
            break;
          case 2:
            d[c++] = (b & 15) << 4 | (S & 60) >> 2, b = S, D = 3;
            break;
          case 3:
            d[c++] = (b & 3) << 6 | S, D = 0;
            break;
        }
      }
      if (D === 1)
        throw Error(n);
      return c - w;
    }, u.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  }(Xn)), Xn;
}
var En, eo;
function ti() {
  if (eo) return En;
  eo = 1, En = y;
  function y() {
    this._listeners = {};
  }
  return y.prototype.on = function(u, r, t) {
    return (this._listeners[u] || (this._listeners[u] = [])).push({
      fn: r,
      ctx: t || this
    }), this;
  }, y.prototype.off = function(u, r) {
    if (u === void 0)
      this._listeners = {};
    else if (r === void 0)
      this._listeners[u] = [];
    else
      for (var t = this._listeners[u], e = 0; e < t.length; )
        t[e].fn === r ? t.splice(e, 1) : ++e;
    return this;
  }, y.prototype.emit = function(u) {
    var r = this._listeners[u];
    if (r) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < r.length; )
        r[e].fn.apply(r[e++].ctx, t);
    }
    return this;
  }, En;
}
var Rn, to;
function ri() {
  if (to) return Rn;
  to = 1, Rn = y(y);
  function y(n) {
    return typeof Float32Array < "u" ? function() {
      var o = new Float32Array([-0]), d = new Uint8Array(o.buffer), c = d[3] === 128;
      function w(S, k, F) {
        o[0] = S, k[F] = d[0], k[F + 1] = d[1], k[F + 2] = d[2], k[F + 3] = d[3];
      }
      function D(S, k, F) {
        o[0] = S, k[F] = d[3], k[F + 1] = d[2], k[F + 2] = d[1], k[F + 3] = d[0];
      }
      n.writeFloatLE = c ? w : D, n.writeFloatBE = c ? D : w;
      function b(S, k) {
        return d[0] = S[k], d[1] = S[k + 1], d[2] = S[k + 2], d[3] = S[k + 3], o[0];
      }
      function I(S, k) {
        return d[3] = S[k], d[2] = S[k + 1], d[1] = S[k + 2], d[0] = S[k + 3], o[0];
      }
      n.readFloatLE = c ? b : I, n.readFloatBE = c ? I : b;
    }() : function() {
      function o(c, w, D, b) {
        var I = w < 0 ? 1 : 0;
        if (I && (w = -w), w === 0)
          c(1 / w > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), D, b);
        else if (isNaN(w))
          c(2143289344, D, b);
        else if (w > 34028234663852886e22)
          c((I << 31 | 2139095040) >>> 0, D, b);
        else if (w < 11754943508222875e-54)
          c((I << 31 | Math.round(w / 1401298464324817e-60)) >>> 0, D, b);
        else {
          var S = Math.floor(Math.log(w) / Math.LN2), k = Math.round(w * Math.pow(2, -S) * 8388608) & 8388607;
          c((I << 31 | S + 127 << 23 | k) >>> 0, D, b);
        }
      }
      n.writeFloatLE = o.bind(null, u), n.writeFloatBE = o.bind(null, r);
      function d(c, w, D) {
        var b = c(w, D), I = (b >> 31) * 2 + 1, S = b >>> 23 & 255, k = b & 8388607;
        return S === 255 ? k ? NaN : I * (1 / 0) : S === 0 ? I * 1401298464324817e-60 * k : I * Math.pow(2, S - 150) * (k + 8388608);
      }
      n.readFloatLE = d.bind(null, t), n.readFloatBE = d.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var o = new Float64Array([-0]), d = new Uint8Array(o.buffer), c = d[7] === 128;
      function w(S, k, F) {
        o[0] = S, k[F] = d[0], k[F + 1] = d[1], k[F + 2] = d[2], k[F + 3] = d[3], k[F + 4] = d[4], k[F + 5] = d[5], k[F + 6] = d[6], k[F + 7] = d[7];
      }
      function D(S, k, F) {
        o[0] = S, k[F] = d[7], k[F + 1] = d[6], k[F + 2] = d[5], k[F + 3] = d[4], k[F + 4] = d[3], k[F + 5] = d[2], k[F + 6] = d[1], k[F + 7] = d[0];
      }
      n.writeDoubleLE = c ? w : D, n.writeDoubleBE = c ? D : w;
      function b(S, k) {
        return d[0] = S[k], d[1] = S[k + 1], d[2] = S[k + 2], d[3] = S[k + 3], d[4] = S[k + 4], d[5] = S[k + 5], d[6] = S[k + 6], d[7] = S[k + 7], o[0];
      }
      function I(S, k) {
        return d[7] = S[k], d[6] = S[k + 1], d[5] = S[k + 2], d[4] = S[k + 3], d[3] = S[k + 4], d[2] = S[k + 5], d[1] = S[k + 6], d[0] = S[k + 7], o[0];
      }
      n.readDoubleLE = c ? b : I, n.readDoubleBE = c ? I : b;
    }() : function() {
      function o(c, w, D, b, I, S) {
        var k = b < 0 ? 1 : 0;
        if (k && (b = -b), b === 0)
          c(0, I, S + w), c(1 / b > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), I, S + D);
        else if (isNaN(b))
          c(0, I, S + w), c(2146959360, I, S + D);
        else if (b > 17976931348623157e292)
          c(0, I, S + w), c((k << 31 | 2146435072) >>> 0, I, S + D);
        else {
          var F;
          if (b < 22250738585072014e-324)
            F = b / 5e-324, c(F >>> 0, I, S + w), c((k << 31 | F / 4294967296) >>> 0, I, S + D);
          else {
            var C = Math.floor(Math.log(b) / Math.LN2);
            C === 1024 && (C = 1023), F = b * Math.pow(2, -C), c(F * 4503599627370496 >>> 0, I, S + w), c((k << 31 | C + 1023 << 20 | F * 1048576 & 1048575) >>> 0, I, S + D);
          }
        }
      }
      n.writeDoubleLE = o.bind(null, u, 0, 4), n.writeDoubleBE = o.bind(null, r, 4, 0);
      function d(c, w, D, b, I) {
        var S = c(b, I + w), k = c(b, I + D), F = (k >> 31) * 2 + 1, C = k >>> 20 & 2047, R = 4294967296 * (k & 1048575) + S;
        return C === 2047 ? R ? NaN : F * (1 / 0) : C === 0 ? F * 5e-324 * R : F * Math.pow(2, C - 1075) * (R + 4503599627370496);
      }
      n.readDoubleLE = d.bind(null, t, 0, 4), n.readDoubleBE = d.bind(null, e, 4, 0);
    }(), n;
  }
  function u(n, o, d) {
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
  return Rn;
}
function ro(y) {
  throw new Error('Could not dynamically require "' + y + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Mn, no;
function ni() {
  if (no) return Mn;
  no = 1, Mn = y;
  function y(u) {
    try {
      if (typeof ro != "function")
        return null;
      var r = ro(u);
      return r && (r.length || Object.keys(r).length) ? r : null;
    } catch {
      return null;
    }
  }
  return Mn;
}
var oo = {}, io;
function oi() {
  return io || (io = 1, function(y) {
    var u = y;
    u.length = function(r) {
      for (var t = 0, e = 0, n = 0; n < r.length; ++n)
        e = r.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (r.charCodeAt(n + 1) & 64512) === 56320 ? (++n, t += 4) : t += 3;
      return t;
    }, u.read = function(r, t, e) {
      var n = e - t;
      if (n < 1)
        return "";
      for (var o = null, d = [], c = 0, w; t < e; )
        w = r[t++], w < 128 ? d[c++] = w : w > 191 && w < 224 ? d[c++] = (w & 31) << 6 | r[t++] & 63 : w > 239 && w < 365 ? (w = ((w & 7) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, d[c++] = 55296 + (w >> 10), d[c++] = 56320 + (w & 1023)) : d[c++] = (w & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63, c > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, d)), c = 0);
      return o ? (c && o.push(String.fromCharCode.apply(String, d.slice(0, c))), o.join("")) : String.fromCharCode.apply(String, d.slice(0, c));
    }, u.write = function(r, t, e) {
      for (var n = e, o, d, c = 0; c < r.length; ++c)
        o = r.charCodeAt(c), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((d = r.charCodeAt(c + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (d & 1023), ++c, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - n;
    };
  }(oo)), oo;
}
var Fn, ao;
function ii() {
  if (ao) return Fn;
  ao = 1, Fn = y;
  function y(u, r, t) {
    var e = t || 8192, n = e >>> 1, o = null, d = e;
    return function(c) {
      if (c < 1 || c > n)
        return u(c);
      d + c > e && (o = u(e), d = 0);
      var w = r.call(o, d, d += c);
      return d & 7 && (d = (d | 7) + 1), w;
    };
  }
  return Fn;
}
var Ln, so;
function ai() {
  if (so) return Ln;
  so = 1, Ln = u;
  var y = Be();
  function u(n, o) {
    this.lo = n >>> 0, this.hi = o >>> 0;
  }
  var r = u.zero = new u(0, 0);
  r.toNumber = function() {
    return 0;
  }, r.zzEncode = r.zzDecode = function() {
    return this;
  }, r.length = function() {
    return 1;
  };
  var t = u.zeroHash = "\0\0\0\0\0\0\0\0";
  u.fromNumber = function(n) {
    if (n === 0)
      return r;
    var o = n < 0;
    o && (n = -n);
    var d = n >>> 0, c = (n - d) / 4294967296 >>> 0;
    return o && (c = ~c >>> 0, d = ~d >>> 0, ++d > 4294967295 && (d = 0, ++c > 4294967295 && (c = 0))), new u(d, c);
  }, u.from = function(n) {
    if (typeof n == "number")
      return u.fromNumber(n);
    if (y.isString(n))
      if (y.Long)
        n = y.Long.fromString(n);
      else
        return u.fromNumber(parseInt(n, 10));
    return n.low || n.high ? new u(n.low >>> 0, n.high >>> 0) : r;
  }, u.prototype.toNumber = function(n) {
    if (!n && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, d = ~this.hi >>> 0;
      return o || (d = d + 1 >>> 0), -(o + d * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, u.prototype.toLong = function(n) {
    return y.Long ? new y.Long(this.lo | 0, this.hi | 0, !!n) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!n };
  };
  var e = String.prototype.charCodeAt;
  return u.fromHash = function(n) {
    return n === t ? r : new u(
      (e.call(n, 0) | e.call(n, 1) << 8 | e.call(n, 2) << 16 | e.call(n, 3) << 24) >>> 0,
      (e.call(n, 4) | e.call(n, 5) << 8 | e.call(n, 6) << 16 | e.call(n, 7) << 24) >>> 0
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
    var n = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ n) >>> 0, this.lo = (this.lo << 1 ^ n) >>> 0, this;
  }, u.prototype.zzDecode = function() {
    var n = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ n) >>> 0, this.hi = (this.hi >>> 1 ^ n) >>> 0, this;
  }, u.prototype.length = function() {
    var n = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, d = this.hi >>> 24;
    return d === 0 ? o === 0 ? n < 16384 ? n < 128 ? 1 : 2 : n < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : d < 128 ? 9 : 10;
  }, Ln;
}
var lo;
function Be() {
  return lo || (lo = 1, function(y) {
    var u = y;
    u.asPromise = Qo(), u.base64 = ei(), u.EventEmitter = ti(), u.float = ri(), u.inquire = ni(), u.utf8 = oi(), u.pool = ii(), u.LongBits = ai(), u.isNode = !!(typeof He < "u" && He && He.process && He.process.versions && He.process.versions.node), u.global = u.isNode && He || typeof window < "u" && window || typeof self < "u" && self || An, u.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), u.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), u.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, u.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, u.isObject = function(e) {
      return e && typeof e == "object";
    }, u.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    u.isSet = function(e, n) {
      var o = e[n];
      return o != null && e.hasOwnProperty(n) ? typeof o != "object" || (Array.isArray(o) ? o.length : Object.keys(o).length) > 0 : !1;
    }, u.Buffer = function() {
      try {
        var e = u.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), u._Buffer_from = null, u._Buffer_allocUnsafe = null, u.newBuffer = function(e) {
      return typeof e == "number" ? u.Buffer ? u._Buffer_allocUnsafe(e) : new u.Array(e) : u.Buffer ? u._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, u.Array = typeof Uint8Array < "u" ? Uint8Array : Array, u.Long = /* istanbul ignore next */
    u.global.dcodeIO && /* istanbul ignore next */
    u.global.dcodeIO.Long || /* istanbul ignore next */
    u.global.Long || u.inquire("long"), u.key2Re = /^true|false|0|1$/, u.key32Re = /^-?(?:0|[1-9][0-9]*)$/, u.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, u.longToHash = function(e) {
      return e ? u.LongBits.from(e).toHash() : u.LongBits.zeroHash;
    }, u.longFromHash = function(e, n) {
      var o = u.LongBits.fromHash(e);
      return u.Long ? u.Long.fromBits(o.lo, o.hi, n) : o.toNumber(!!n);
    };
    function r(e, n, o) {
      for (var d = Object.keys(n), c = 0; c < d.length; ++c)
        (e[d[c]] === void 0 || !o) && (e[d[c]] = n[d[c]]);
      return e;
    }
    u.merge = r, u.lcFirst = function(e) {
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
    u.newError = t, u.ProtocolError = t("ProtocolError"), u.oneOfGetter = function(e) {
      for (var n = {}, o = 0; o < e.length; ++o)
        n[e[o]] = 1;
      return function() {
        for (var d = Object.keys(this), c = d.length - 1; c > -1; --c)
          if (n[d[c]] === 1 && this[d[c]] !== void 0 && this[d[c]] !== null)
            return d[c];
      };
    }, u.oneOfSetter = function(e) {
      return function(n) {
        for (var o = 0; o < e.length; ++o)
          e[o] !== n && delete this[e[o]];
      };
    }, u.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, u._configure = function() {
      var e = u.Buffer;
      if (!e) {
        u._Buffer_from = u._Buffer_allocUnsafe = null;
        return;
      }
      u._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(n, o) {
        return new e(n, o);
      }, u._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(n) {
        return new e(n);
      };
    };
  }(An)), An;
}
var xn, co;
function Do() {
  if (co) return xn;
  co = 1, xn = c;
  var y = Be(), u, r = y.LongBits, t = y.base64, e = y.utf8;
  function n(C, R, N) {
    this.fn = C, this.len = R, this.next = void 0, this.val = N;
  }
  function o() {
  }
  function d(C) {
    this.head = C.head, this.tail = C.tail, this.len = C.len, this.next = C.states;
  }
  function c() {
    this.len = 0, this.head = new n(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var w = function() {
    return y.Buffer ? function() {
      return (c.create = function() {
        return new u();
      })();
    } : function() {
      return new c();
    };
  };
  c.create = w(), c.alloc = function(C) {
    return new y.Array(C);
  }, y.Array !== Array && (c.alloc = y.pool(c.alloc, y.Array.prototype.subarray)), c.prototype._push = function(C, R, N) {
    return this.tail = this.tail.next = new n(C, R, N), this.len += R, this;
  };
  function D(C, R, N) {
    R[N] = C & 255;
  }
  function b(C, R, N) {
    for (; C > 127; )
      R[N++] = C & 127 | 128, C >>>= 7;
    R[N] = C;
  }
  function I(C, R) {
    this.len = C, this.next = void 0, this.val = R;
  }
  I.prototype = Object.create(n.prototype), I.prototype.fn = b, c.prototype.uint32 = function(C) {
    return this.len += (this.tail = this.tail.next = new I(
      (C = C >>> 0) < 128 ? 1 : C < 16384 ? 2 : C < 2097152 ? 3 : C < 268435456 ? 4 : 5,
      C
    )).len, this;
  }, c.prototype.int32 = function(C) {
    return C < 0 ? this._push(S, 10, r.fromNumber(C)) : this.uint32(C);
  }, c.prototype.sint32 = function(C) {
    return this.uint32((C << 1 ^ C >> 31) >>> 0);
  };
  function S(C, R, N) {
    for (; C.hi; )
      R[N++] = C.lo & 127 | 128, C.lo = (C.lo >>> 7 | C.hi << 25) >>> 0, C.hi >>>= 7;
    for (; C.lo > 127; )
      R[N++] = C.lo & 127 | 128, C.lo = C.lo >>> 7;
    R[N++] = C.lo;
  }
  c.prototype.uint64 = function(C) {
    var R = r.from(C);
    return this._push(S, R.length(), R);
  }, c.prototype.int64 = c.prototype.uint64, c.prototype.sint64 = function(C) {
    var R = r.from(C).zzEncode();
    return this._push(S, R.length(), R);
  }, c.prototype.bool = function(C) {
    return this._push(D, 1, C ? 1 : 0);
  };
  function k(C, R, N) {
    R[N] = C & 255, R[N + 1] = C >>> 8 & 255, R[N + 2] = C >>> 16 & 255, R[N + 3] = C >>> 24;
  }
  c.prototype.fixed32 = function(C) {
    return this._push(k, 4, C >>> 0);
  }, c.prototype.sfixed32 = c.prototype.fixed32, c.prototype.fixed64 = function(C) {
    var R = r.from(C);
    return this._push(k, 4, R.lo)._push(k, 4, R.hi);
  }, c.prototype.sfixed64 = c.prototype.fixed64, c.prototype.float = function(C) {
    return this._push(y.float.writeFloatLE, 4, C);
  }, c.prototype.double = function(C) {
    return this._push(y.float.writeDoubleLE, 8, C);
  };
  var F = y.Array.prototype.set ? function(C, R, N) {
    R.set(C, N);
  } : function(C, R, N) {
    for (var se = 0; se < C.length; ++se)
      R[N + se] = C[se];
  };
  return c.prototype.bytes = function(C) {
    var R = C.length >>> 0;
    if (!R)
      return this._push(D, 1, 0);
    if (y.isString(C)) {
      var N = c.alloc(R = t.length(C));
      t.decode(C, N, 0), C = N;
    }
    return this.uint32(R)._push(F, R, C);
  }, c.prototype.string = function(C) {
    var R = e.length(C);
    return R ? this.uint32(R)._push(e.write, R, C) : this._push(D, 1, 0);
  }, c.prototype.fork = function() {
    return this.states = new d(this), this.head = this.tail = new n(o, 0, 0), this.len = 0, this;
  }, c.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new n(o, 0, 0), this.len = 0), this;
  }, c.prototype.ldelim = function() {
    var C = this.head, R = this.tail, N = this.len;
    return this.reset().uint32(N), N && (this.tail.next = C.next, this.tail = R, this.len += N), this;
  }, c.prototype.finish = function() {
    for (var C = this.head.next, R = this.constructor.alloc(this.len), N = 0; C; )
      C.fn(C.val, R, N), N += C.len, C = C.next;
    return R;
  }, c._configure = function(C) {
    u = C, c.create = w(), u._configure();
  }, xn;
}
var Nn, uo;
function si() {
  if (uo) return Nn;
  uo = 1, Nn = r;
  var y = Do();
  (r.prototype = Object.create(y.prototype)).constructor = r;
  var u = Be();
  function r() {
    y.call(this);
  }
  r._configure = function() {
    r.alloc = u._Buffer_allocUnsafe, r.writeBytesBuffer = u.Buffer && u.Buffer.prototype instanceof Uint8Array && u.Buffer.prototype.set.name === "set" ? function(e, n, o) {
      n.set(e, o);
    } : function(e, n, o) {
      if (e.copy)
        e.copy(n, o, 0, e.length);
      else for (var d = 0; d < e.length; )
        n[o++] = e[d++];
    };
  }, r.prototype.bytes = function(e) {
    u.isString(e) && (e = u._Buffer_from(e, "base64"));
    var n = e.length >>> 0;
    return this.uint32(n), n && this._push(r.writeBytesBuffer, n, e), this;
  };
  function t(e, n, o) {
    e.length < 40 ? u.utf8.write(e, n, o) : n.utf8Write ? n.utf8Write(e, o) : n.write(e, o);
  }
  return r.prototype.string = function(e) {
    var n = u.Buffer.byteLength(e);
    return this.uint32(n), n && this._push(t, n, e), this;
  }, r._configure(), Nn;
}
var $n, fo;
function Ao() {
  if (fo) return $n;
  fo = 1, $n = n;
  var y = Be(), u, r = y.LongBits, t = y.utf8;
  function e(b, I) {
    return RangeError("index out of range: " + b.pos + " + " + (I || 1) + " > " + b.len);
  }
  function n(b) {
    this.buf = b, this.pos = 0, this.len = b.length;
  }
  var o = typeof Uint8Array < "u" ? function(b) {
    if (b instanceof Uint8Array || Array.isArray(b))
      return new n(b);
    throw Error("illegal buffer");
  } : function(b) {
    if (Array.isArray(b))
      return new n(b);
    throw Error("illegal buffer");
  }, d = function() {
    return y.Buffer ? function(b) {
      return (n.create = function(I) {
        return y.Buffer.isBuffer(I) ? new u(I) : o(I);
      })(b);
    } : o;
  };
  n.create = d(), n.prototype._slice = y.Array.prototype.subarray || /* istanbul ignore next */
  y.Array.prototype.slice, n.prototype.uint32 = /* @__PURE__ */ function() {
    var b = 4294967295;
    return function() {
      if (b = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (b = (b | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (b = (b | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (b = (b | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (b = (b | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return b;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return b;
    };
  }(), n.prototype.int32 = function() {
    return this.uint32() | 0;
  }, n.prototype.sint32 = function() {
    var b = this.uint32();
    return b >>> 1 ^ -(b & 1) | 0;
  };
  function c() {
    var b = new r(0, 0), I = 0;
    if (this.len - this.pos > 4) {
      for (; I < 4; ++I)
        if (b.lo = (b.lo | (this.buf[this.pos] & 127) << I * 7) >>> 0, this.buf[this.pos++] < 128)
          return b;
      if (b.lo = (b.lo | (this.buf[this.pos] & 127) << 28) >>> 0, b.hi = (b.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return b;
      I = 0;
    } else {
      for (; I < 3; ++I) {
        if (this.pos >= this.len)
          throw e(this);
        if (b.lo = (b.lo | (this.buf[this.pos] & 127) << I * 7) >>> 0, this.buf[this.pos++] < 128)
          return b;
      }
      return b.lo = (b.lo | (this.buf[this.pos++] & 127) << I * 7) >>> 0, b;
    }
    if (this.len - this.pos > 4) {
      for (; I < 5; ++I)
        if (b.hi = (b.hi | (this.buf[this.pos] & 127) << I * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return b;
    } else
      for (; I < 5; ++I) {
        if (this.pos >= this.len)
          throw e(this);
        if (b.hi = (b.hi | (this.buf[this.pos] & 127) << I * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return b;
      }
    throw Error("invalid varint encoding");
  }
  n.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function w(b, I) {
    return (b[I - 4] | b[I - 3] << 8 | b[I - 2] << 16 | b[I - 1] << 24) >>> 0;
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
  function D() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new r(w(this.buf, this.pos += 4), w(this.buf, this.pos += 4));
  }
  return n.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var b = y.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, b;
  }, n.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var b = y.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, b;
  }, n.prototype.bytes = function() {
    var b = this.uint32(), I = this.pos, S = this.pos + b;
    if (S > this.len)
      throw e(this, b);
    if (this.pos += b, Array.isArray(this.buf))
      return this.buf.slice(I, S);
    if (I === S) {
      var k = y.Buffer;
      return k ? k.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, I, S);
  }, n.prototype.string = function() {
    var b = this.bytes();
    return t.read(b, 0, b.length);
  }, n.prototype.skip = function(b) {
    if (typeof b == "number") {
      if (this.pos + b > this.len)
        throw e(this, b);
      this.pos += b;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, n.prototype.skipType = function(b) {
    switch (b) {
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
        for (; (b = this.uint32() & 7) !== 4; )
          this.skipType(b);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + b + " at offset " + this.pos);
    }
    return this;
  }, n._configure = function(b) {
    u = b, n.create = d(), u._configure();
    var I = y.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    y.merge(n.prototype, {
      int64: function() {
        return c.call(this)[I](!1);
      },
      uint64: function() {
        return c.call(this)[I](!0);
      },
      sint64: function() {
        return c.call(this).zzDecode()[I](!1);
      },
      fixed64: function() {
        return D.call(this)[I](!0);
      },
      sfixed64: function() {
        return D.call(this)[I](!1);
      }
    });
  }, $n;
}
var Wn, po;
function li() {
  if (po) return Wn;
  po = 1, Wn = r;
  var y = Ao();
  (r.prototype = Object.create(y.prototype)).constructor = r;
  var u = Be();
  function r(t) {
    y.call(this, t);
  }
  return r._configure = function() {
    u.Buffer && (r.prototype._slice = u.Buffer.prototype.slice);
  }, r.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, r._configure(), Wn;
}
var mo = {}, Un, yo;
function ci() {
  if (yo) return Un;
  yo = 1, Un = u;
  var y = Be();
  (u.prototype = Object.create(y.EventEmitter.prototype)).constructor = u;
  function u(r, t, e) {
    if (typeof r != "function")
      throw TypeError("rpcImpl must be a function");
    y.EventEmitter.call(this), this.rpcImpl = r, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return u.prototype.rpcCall = function r(t, e, n, o, d) {
    if (!o)
      throw TypeError("request must be specified");
    var c = this;
    if (!d)
      return y.asPromise(r, c, t, e, n, o);
    if (!c.rpcImpl) {
      setTimeout(function() {
        d(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return c.rpcImpl(
        t,
        e[c.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(w, D) {
          if (w)
            return c.emit("error", w, t), d(w);
          if (D === null) {
            c.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(D instanceof n))
            try {
              D = n[c.responseDelimited ? "decodeDelimited" : "decode"](D);
            } catch (b) {
              return c.emit("error", b, t), d(b);
            }
          return c.emit("data", D, t), d(null, D);
        }
      );
    } catch (w) {
      c.emit("error", w, t), setTimeout(function() {
        d(w);
      }, 0);
      return;
    }
  }, u.prototype.end = function(r) {
    return this.rpcImpl && (r || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, Un;
}
var go;
function ui() {
  return go || (go = 1, function(y) {
    var u = y;
    u.Service = ci();
  }(mo)), mo;
}
var ho, vo;
function di() {
  return vo || (vo = 1, ho = {}), ho;
}
var bo;
function fi() {
  return bo || (bo = 1, function(y) {
    var u = y;
    u.build = "minimal", u.Writer = Do(), u.BufferWriter = si(), u.Reader = Ao(), u.BufferReader = li(), u.util = Be(), u.rpc = ui(), u.roots = di(), u.configure = r;
    function r() {
      u.util._configure(), u.Writer._configure(u.BufferWriter), u.Reader._configure(u.BufferReader);
    }
    r();
  }(Kn)), Kn;
}
var Oo, wo;
function pi() {
  return wo || (wo = 1, Oo = fi()), Oo;
}
var M = pi();
const v = M.Reader, x = M.Writer, p = M.util, s = M.roots.default || (M.roots.default = {});
s.dot = (() => {
  const y = {};
  return y.Content = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.token = p.newBuffer([]), u.prototype.iv = p.newBuffer([]), u.prototype.schemaVersion = 0, u.prototype.bytes = p.newBuffer([]), u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.token != null && Object.hasOwnProperty.call(r, "token") && t.uint32(
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
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.token != null && r.hasOwnProperty("token") && !(r.token && typeof r.token.length == "number" || p.isString(r.token)) ? "token: buffer expected" : r.iv != null && r.hasOwnProperty("iv") && !(r.iv && typeof r.iv.length == "number" || p.isString(r.iv)) ? "iv: buffer expected" : r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && !p.isInteger(r.schemaVersion) ? "schemaVersion: integer expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.Content)
        return r;
      let t = new s.dot.Content();
      return r.token != null && (typeof r.token == "string" ? p.base64.decode(r.token, t.token = p.newBuffer(p.base64.length(r.token)), 0) : r.token.length >= 0 && (t.token = r.token)), r.iv != null && (typeof r.iv == "string" ? p.base64.decode(r.iv, t.iv = p.newBuffer(p.base64.length(r.iv)), 0) : r.iv.length >= 0 && (t.iv = r.iv)), r.schemaVersion != null && (t.schemaVersion = r.schemaVersion | 0), r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = p.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = p.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.token != null && r.hasOwnProperty("token") && (e.token = t.bytes === String ? p.base64.encode(r.token, 0, r.token.length) : t.bytes === Array ? Array.prototype.slice.call(r.token) : r.token), r.iv != null && r.hasOwnProperty("iv") && (e.iv = t.bytes === String ? p.base64.encode(r.iv, 0, r.iv.length) : t.bytes === Array ? Array.prototype.slice.call(r.iv) : r.iv), r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && (e.schemaVersion = r.schemaVersion), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Content";
    }, u;
  }(), y.v4 = function() {
    const u = {};
    return u.MagnifEyeLivenessContent = function() {
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
        if (n || (n = x.create()), e.images != null && e.images.length)
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.images && c.images.length || (c.images = []), c.images.push(s.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MagnifEyeLivenessContent";
      }, r;
    }(), u.Metadata = function() {
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
        return n || (n = x.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.Metadata();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.platform = e.int32();
              break;
            }
            case 5: {
              c.sessionToken = e.string();
              break;
            }
            case 6: {
              c.componentVersion = e.string();
              break;
            }
            case 2: {
              c.web = s.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.android = s.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.ios = s.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, r;
    }(), u.AndroidMetadata = function() {
      function r(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.supportedAbis = p.emptyArray, r.prototype.device = null, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = p.emptyArray, r.prototype.digestsWithTimestamp = p.emptyArray, r.prototype.dynamicCameraFrameProperties = p.emptyObject, r.prototype.tamperingIndicators = null, r.prototype.croppedYuv420Image = null, r.prototype.yuv420ImageCrop = null;
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
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = x.create()), e.supportedAbis != null && e.supportedAbis.length)
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
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.AndroidMetadata(), w, D;
        for (; e.pos < d; ) {
          let b = e.uint32();
          if (b === o)
            break;
          switch (b >>> 3) {
            case 1: {
              c.supportedAbis && c.supportedAbis.length || (c.supportedAbis = []), c.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              c.device = e.string();
              break;
            }
            case 6: {
              c.camera = s.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.detectionNormalizedRectangle = s.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.digests && c.digests.length || (c.digests = []), c.digests.push(e.bytes());
              break;
            }
            case 5: {
              c.digestsWithTimestamp && c.digestsWithTimestamp.length || (c.digestsWithTimestamp = []), c.digestsWithTimestamp.push(s.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              c.dynamicCameraFrameProperties === p.emptyObject && (c.dynamicCameraFrameProperties = {});
              let I = e.uint32() + e.pos;
              for (w = "", D = null; e.pos < I; ) {
                let S = e.uint32();
                switch (S >>> 3) {
                  case 1:
                    w = e.string();
                    break;
                  case 2:
                    D = s.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(S & 7);
                    break;
                }
              }
              c.dynamicCameraFrameProperties[w] = D;
              break;
            }
            case 8: {
              c.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              c.croppedYuv420Image = s.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            case 10: {
              c.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(b & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return null;
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
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.supportedAbis = [], o.digests = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          o.supportedAbis = [];
          for (let c = 0; c < e.supportedAbis.length; ++c)
            o.supportedAbis[c] = e.supportedAbis[c];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, n.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let c = 0; c < e.digests.length; ++c)
            o.digests[c] = n.bytes === String ? p.base64.encode(e.digests[c], 0, e.digests[c].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[c]) : e.digests[c];
        }
        let d;
        if (e.dynamicCameraFrameProperties && (d = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let c = 0; c < d.length; ++c)
            o.dynamicCameraFrameProperties[d[c]] = s.dot.Int32List.toObject(e.dynamicCameraFrameProperties[d[c]], n);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let c = 0; c < e.digestsWithTimestamp.length; ++c)
            o.digestsWithTimestamp[c] = s.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[c], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = s.dot.v4.AndroidCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = s.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = n.bytes === String ? p.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : n.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, n.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = s.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = s.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, n), n.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, r;
    }(), u.AndroidCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && s.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.AndroidCamera();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.resolution = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, r;
    }(), u.Yuv420Image = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = p.newBuffer([]), r.prototype.uPlane = p.newBuffer([]), r.prototype.vPlane = p.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && s.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Yuv420Image();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
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
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, r;
    }(), u.Yuv420ImageCrop = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.v4.Yuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Yuv420ImageCrop();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.image = s.dot.v4.Yuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420ImageCrop";
      }, r;
    }(), u.IosMetadata = function() {
      function r(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraModelId = "", r.prototype.architectureInfo = p.emptyObject, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = p.emptyArray, r.prototype.digestsWithTimestamp = p.emptyArray, r.prototype.isoValues = p.emptyArray, r.prototype.croppedYuv420Image = null, r.prototype.yuv420ImageCrop = null;
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
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = x.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && n.uint32(
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
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.IosMetadata(), w, D;
        for (; e.pos < d; ) {
          let b = e.uint32();
          if (b === o)
            break;
          switch (b >>> 3) {
            case 1: {
              c.cameraModelId = e.string();
              break;
            }
            case 2: {
              c.architectureInfo === p.emptyObject && (c.architectureInfo = {});
              let I = e.uint32() + e.pos;
              for (w = "", D = !1; e.pos < I; ) {
                let S = e.uint32();
                switch (S >>> 3) {
                  case 1:
                    w = e.string();
                    break;
                  case 2:
                    D = e.bool();
                    break;
                  default:
                    e.skipType(S & 7);
                    break;
                }
              }
              c.architectureInfo[w] = D;
              break;
            }
            case 6: {
              c.camera = s.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.detectionNormalizedRectangle = s.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.digests && c.digests.length || (c.digests = []), c.digests.push(e.bytes());
              break;
            }
            case 5: {
              c.digestsWithTimestamp && c.digestsWithTimestamp.length || (c.digestsWithTimestamp = []), c.digestsWithTimestamp.push(s.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (c.isoValues && c.isoValues.length || (c.isoValues = []), (b & 7) === 2) {
                let I = e.uint32() + e.pos;
                for (; e.pos < I; )
                  c.isoValues.push(e.int32());
              } else
                c.isoValues.push(e.int32());
              break;
            }
            case 8: {
              c.croppedYuv420Image = s.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            case 9: {
              c.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(b & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return null;
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
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        (n.arrays || n.defaults) && (o.digests = [], o.isoValues = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.architectureInfo = {}), n.defaults && (o.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (o.cameraModelId = e.cameraModelId);
        let d;
        if (e.architectureInfo && (d = Object.keys(e.architectureInfo)).length) {
          o.architectureInfo = {};
          for (let c = 0; c < d.length; ++c)
            o.architectureInfo[d[c]] = e.architectureInfo[d[c]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let c = 0; c < e.digests.length; ++c)
            o.digests[c] = n.bytes === String ? p.base64.encode(e.digests[c], 0, e.digests[c].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[c]) : e.digests[c];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let c = 0; c < e.isoValues.length; ++c)
            o.isoValues[c] = e.isoValues[c];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let c = 0; c < e.digestsWithTimestamp.length; ++c)
            o.digestsWithTimestamp[c] = s.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[c], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = s.dot.v4.IosCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = s.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = s.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = s.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, n), n.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, r;
    }(), u.IosCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && s.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosCamera();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.resolution = s.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, r;
    }(), u.IosYuv420Image = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = p.newBuffer([]), r.prototype.uvPlane = p.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && s.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosYuv420Image();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
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
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, r;
    }(), u.IosYuv420ImageCrop = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.v4.IosYuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.IosYuv420ImageCrop();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.image = s.dot.v4.IosYuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420ImageCrop";
      }, r;
    }(), u.WebMetadata = function() {
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
        if (n || (n = x.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && s.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.WebMetadata();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.currentCameraProperties = s.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.availableCameraProperties && c.availableCameraProperties.length || (c.availableCameraProperties = []), c.availableCameraProperties.push(s.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              c.hashedDetectedImages && c.hashedDetectedImages.length || (c.hashedDetectedImages = []), c.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              c.hashedDetectedImagesWithTimestamp && c.hashedDetectedImagesWithTimestamp.length || (c.hashedDetectedImagesWithTimestamp = []), c.hashedDetectedImagesWithTimestamp.push(s.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              c.detectionRecord && c.detectionRecord.length || (c.detectionRecord = []), c.detectionRecord.push(s.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              c.croppedImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.croppedImageWithPosition = s.dot.v4.ImageCrop.decode(e, e.uint32());
              break;
            }
            case 8: {
              c.platformDetails = s.dot.v4.PlatformDetails.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, r;
    }(), u.HashedDetectedImageWithTimestamp = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.imageHash = "", r.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.imageHash = t.string();
              break;
            }
            case 2: {
              d.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, r;
    }(), u.MediaTrackSettings = function() {
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
        return n || (n = x.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.MediaTrackSettings();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.aspectRatio = e.double();
              break;
            }
            case 2: {
              c.autoGainControl = e.bool();
              break;
            }
            case 3: {
              c.channelCount = e.int32();
              break;
            }
            case 4: {
              c.deviceId = e.string();
              break;
            }
            case 5: {
              c.displaySurface = e.string();
              break;
            }
            case 6: {
              c.echoCancellation = e.bool();
              break;
            }
            case 7: {
              c.facingMode = e.string();
              break;
            }
            case 8: {
              c.frameRate = e.double();
              break;
            }
            case 9: {
              c.groupId = e.string();
              break;
            }
            case 10: {
              c.height = e.int32();
              break;
            }
            case 11: {
              c.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              c.sampleRate = e.int32();
              break;
            }
            case 13: {
              c.sampleSize = e.int32();
              break;
            }
            case 14: {
              c.width = e.int32();
              break;
            }
            case 15: {
              c.deviceName = e.string();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, r;
    }(), u.ImageBitmap = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.width = 0, r.prototype.height = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.ImageBitmap();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.width = t.int32();
              break;
            }
            case 2: {
              d.height = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, r;
    }(), u.CameraProperties = function() {
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
        return n || (n = x.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && s.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && s.dot.v4.MediaTrackSettings.encode(e.cameraProperties, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.CameraProperties();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.cameraInitFrameResolution = s.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.cameraProperties = s.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, r;
    }(), u.DetectedObject = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.brightness = 0, r.prototype.sharpness = 0, r.prototype.hotspots = 0, r.prototype.confidence = 0, r.prototype.faceSize = 0, r.prototype.faceCenter = null, r.prototype.smallestEdge = 0, r.prototype.bottomLeft = null, r.prototype.bottomRight = null, r.prototype.topLeft = null, r.prototype.topRight = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.DetectedObject();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
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
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, r;
    }(), u.Point = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.x = 0, r.prototype.y = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.Point();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.x = t.float();
              break;
            }
            case 2: {
              d.y = t.float();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, r;
    }(), u.ImageCrop = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && s.dot.v4.Point.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.ImageCrop();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.image = s.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.topLeftCorner = s.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageCrop";
      }, r;
    }(), u.PlatformDetails = function() {
      function r(e) {
        if (this.browserVersions = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.userAgent = "", r.prototype.platform = null, r.prototype.platformVersion = null, r.prototype.architecture = null, r.prototype.model = null, r.prototype.browserVersions = p.emptyArray;
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
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = x.create()), e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && n.uint32(
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
        return n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.PlatformDetails();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.userAgent = e.string();
              break;
            }
            case 2: {
              c.platform = e.string();
              break;
            }
            case 3: {
              c.platformVersion = e.string();
              break;
            }
            case 4: {
              c.architecture = e.string();
              break;
            }
            case 5: {
              c.model = e.string();
              break;
            }
            case 6: {
              c.browserVersions && c.browserVersions.length || (c.browserVersions = []), c.browserVersions.push(s.dot.v4.BrowserVersion.decode(e, e.uint32()));
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return null;
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
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.browserVersions = []), n.defaults && (o.userAgent = ""), e.userAgent != null && e.hasOwnProperty("userAgent") && (o.userAgent = e.userAgent), e.platform != null && e.hasOwnProperty("platform") && (o.platform = e.platform, n.oneofs && (o._platform = "platform")), e.platformVersion != null && e.hasOwnProperty("platformVersion") && (o.platformVersion = e.platformVersion, n.oneofs && (o._platformVersion = "platformVersion")), e.architecture != null && e.hasOwnProperty("architecture") && (o.architecture = e.architecture, n.oneofs && (o._architecture = "architecture")), e.model != null && e.hasOwnProperty("model") && (o.model = e.model, n.oneofs && (o._model = "model")), e.browserVersions && e.browserVersions.length) {
          o.browserVersions = [];
          for (let d = 0; d < e.browserVersions.length; ++d)
            o.browserVersions[d] = s.dot.v4.BrowserVersion.toObject(e.browserVersions[d], n);
        }
        return o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PlatformDetails";
      }, r;
    }(), u.BrowserVersion = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.name = "", r.prototype.version = "", r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.name != null && Object.hasOwnProperty.call(t, "name") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(t.version), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.BrowserVersion();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.name = t.string();
              break;
            }
            case 2: {
              d.version = t.string();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.BrowserVersion";
      }, r;
    }(), u.FaceContent = function() {
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
        return n || (n = x.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.FaceContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FaceContent";
      }, r;
    }(), u.DocumentContent = function() {
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
        return n || (n = x.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.DocumentContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.DocumentContent";
      }, r;
    }(), u.Blob = function() {
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
        return n || (n = x.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && s.dot.v4.DocumentContent.encode(e.documentContent, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.Blob();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.documentContent = s.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              c.eyeGazeLivenessContent = s.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.faceContent = s.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.magnifeyeLivenessContent = s.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.smileLivenessContent = s.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              c.palmContent = s.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.travelDocumentContent = s.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            case 8: {
              c.multiRangeLivenessContent = s.dot.v4.MultiRangeLivenessContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, r;
    }(), u.TravelDocumentContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.ldsMasterFile = null, r.prototype.accessControlProtocolUsed = 0, r.prototype.authenticationStatus = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && s.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
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
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.TravelDocumentContent();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
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
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, r;
    }(), u.LdsMasterFile = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.lds1eMrtdApplication = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && s.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.LdsMasterFile();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.lds1eMrtdApplication = s.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, r;
    }(), u.Lds1eMrtdApplication = function() {
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
        return n || (n = x.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && s.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.comHeaderAndDataGroupPresenceInformation = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.sodDocumentSecurityObject = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.dg1MachineReadableZoneInformation = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.dg2EncodedIdentificationFeaturesFace = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              c.dg3AdditionalIdentificationFeatureFingers = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              c.dg4AdditionalIdentificationFeatureIrises = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              c.dg5DisplayedPortrait = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              c.dg7DisplayedSignatureOrUsualMark = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              c.dg8DataFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              c.dg9StructureFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              c.dg10SubstanceFeatures = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              c.dg11AdditionalPersonalDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              c.dg12AdditionalDocumentDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              c.dg13OptionalDetails = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              c.dg14SecurityOptions = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              c.dg15ActiveAuthenticationPublicKeyInfo = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              c.dg16PersonsToNotify = s.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, r;
    }(), u.Lds1ElementaryFile = function() {
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
        return n || (n = x.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.Lds1ElementaryFile();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.id = e.int32();
              break;
            }
            case 2: {
              c.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, r.Id = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "ID_UNSPECIFIED"] = 0, n[e[1] = "ID_COM"] = 1, n[e[2] = "ID_SOD"] = 2, n[e[3] = "ID_DG1"] = 3, n[e[4] = "ID_DG2"] = 4, n[e[5] = "ID_DG3"] = 5, n[e[6] = "ID_DG4"] = 6, n[e[7] = "ID_DG5"] = 7, n[e[8] = "ID_DG7"] = 8, n[e[9] = "ID_DG8"] = 9, n[e[10] = "ID_DG9"] = 10, n[e[11] = "ID_DG10"] = 11, n[e[12] = "ID_DG11"] = 12, n[e[13] = "ID_DG12"] = 13, n[e[14] = "ID_DG13"] = 14, n[e[15] = "ID_DG14"] = 15, n[e[16] = "ID_DG15"] = 16, n[e[17] = "ID_DG16"] = 17, n;
      }(), r;
    }(), u.AccessControlProtocol = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[r[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[r[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), u.AuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.data = null, r.prototype.chip = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && s.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && s.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.AuthenticationStatus();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.data = s.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.chip = s.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, r;
    }(), u.DataAuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.status = 0, r.prototype.protocol = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.DataAuthenticationStatus();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.status = t.int32();
              break;
            }
            case 2: {
              d.protocol = t.int32();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, r.Status = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      }(), r.Protocol = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      }(), r;
    }(), u.ChipAuthenticationStatus = function() {
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
        return n || (n = x.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.status = e.int32();
              break;
            }
            case 2: {
              c.protocol = e.int32();
              break;
            }
            case 3: {
              c.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, r.Status = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "STATUS_UNSPECIFIED"] = 0, n[e[1] = "STATUS_AUTHENTICATED"] = 1, n[e[2] = "STATUS_DENIED"] = 2, n[e[3] = "STATUS_NOT_SUPPORTED"] = 3, n;
      }(), r.Protocol = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, n[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, n[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, n[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, n;
      }(), r;
    }(), u.EyeGazeLivenessContent = function() {
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
        if (n || (n = x.create()), e.segments != null && e.segments.length)
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 3: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              c.segments && c.segments.length || (c.segments = []), c.segments.push(s.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, r;
    }(), u.EyeGazeLivenessSegment = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.corner = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.corner = t.int32();
              break;
            }
            case 2: {
              d.image = s.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, r;
    }(), u.EyeGazeLivenessCorner = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "TOP_LEFT"] = 0, t[r[1] = "TOP_RIGHT"] = 1, t[r[2] = "BOTTOM_RIGHT"] = 2, t[r[3] = "BOTTOM_LEFT"] = 3, t;
    }(), u.MultiRangeLivenessContent = function() {
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
        if (n || (n = x.create()), e.stepResults != null && e.stepResults.length)
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.MultiRangeLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.stepResults && c.stepResults.length || (c.stepResults = []), c.stepResults.push(s.dot.v4.MultiRangeLivenessStepResult.decode(e, e.uint32()));
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.multiRangeLivenessMetadata = s.dot.v4.MultiRangeLivenessMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MultiRangeLivenessContent";
      }, r;
    }(), u.MultiRangeLivenessStepResult = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.challengeItem = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.challengeItem != null && Object.hasOwnProperty.call(t, "challengeItem") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.challengeItem), t.image != null && Object.hasOwnProperty.call(t, "image") && s.dot.ImageWithTimestamp.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.MultiRangeLivenessStepResult();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.challengeItem = t.int32();
              break;
            }
            case 2: {
              d.image = s.dot.ImageWithTimestamp.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessStepResult";
      }, r;
    }(), u.MultiRangeLivenessChallengeItem = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED"] = 0, t[r[1] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ZERO"] = 1, t[r[2] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ONE"] = 2, t[r[3] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_TWO"] = 3, t[r[4] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_THREE"] = 4, t[r[5] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FOUR"] = 5, t[r[6] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FIVE"] = 6, t;
    }(), u.MultiRangeLivenessMetadata = function() {
      function r(t) {
        if (this.detections = [], t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.detections = p.emptyArray, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        if (e || (e = x.create()), t.detections != null && t.detections.length)
          for (let n = 0; n < t.detections.length; ++n)
            s.dot.v4.FaceDetection.encode(t.detections[n], e.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.MultiRangeLivenessMetadata();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.detections && d.detections.length || (d.detections = []), d.detections.push(s.dot.v4.FaceDetection.decode(t, t.uint32()));
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessMetadata";
      }, r;
    }(), u.FaceDetection = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, r.prototype.position = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).uint64(t.timestampMillis), t.position != null && Object.hasOwnProperty.call(t, "position") && s.dot.v4.FaceDetectionPosition.encode(t.position, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.FaceDetection();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.timestampMillis = t.uint64();
              break;
            }
            case 2: {
              d.position = s.dot.v4.FaceDetectionPosition.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetection";
      }, r;
    }(), u.FaceDetectionPosition = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.center = null, r.prototype.faceSizeToImageShorterSideRatio = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = x.create()), t.center != null && Object.hasOwnProperty.call(t, "center") && s.dot.PointDouble.encode(t.center, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.faceSizeToImageShorterSideRatio != null && Object.hasOwnProperty.call(t, "faceSizeToImageShorterSideRatio") && e.uint32(
          /* id 2, wireType 1 =*/
          17
        ).double(t.faceSizeToImageShorterSideRatio), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof v || (t = v.create(t));
        let o = e === void 0 ? t.len : t.pos + e, d = new s.dot.v4.FaceDetectionPosition();
        for (; t.pos < o; ) {
          let c = t.uint32();
          if (c === n)
            break;
          switch (c >>> 3) {
            case 1: {
              d.center = s.dot.PointDouble.decode(t, t.uint32());
              break;
            }
            case 2: {
              d.faceSizeToImageShorterSideRatio = t.double();
              break;
            }
            default:
              t.skipType(c & 7);
              break;
          }
        }
        return d;
      }, r.decodeDelimited = function(t) {
        return t instanceof v || (t = new v(t)), this.decode(t, t.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetectionPosition";
      }, r;
    }(), u.SmileLivenessContent = function() {
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
        return n || (n = x.create()), e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && s.dot.Image.encode(e.neutralExpressionFaceImage, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.SmileLivenessContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.neutralExpressionFaceImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.smileExpressionFaceImage = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.SmileLivenessContent";
      }, r;
    }(), u.PalmContent = function() {
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
        return n || (n = x.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && s.dot.Image.encode(e.image, n.uint32(
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
        e instanceof v || (e = v.create(e));
        let d = n === void 0 ? e.len : e.pos + n, c = new s.dot.v4.PalmContent();
        for (; e.pos < d; ) {
          let w = e.uint32();
          if (w === o)
            break;
          switch (w >>> 3) {
            case 1: {
              c.image = s.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              c.video = s.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              c.metadata = s.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(w & 7);
              break;
          }
        }
        return c;
      }, r.decodeDelimited = function(e) {
        return e instanceof v || (e = new v(e)), this.decode(e, e.uint32());
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
        return this.constructor.toObject(this, M.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PalmContent";
      }, r;
    }(), u;
  }(), y.Image = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.bytes = p.newBuffer([]), u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.Image();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.Image)
        return r;
      let t = new s.dot.Image();
      return r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Image";
    }, u;
  }(), y.ImageWithTimestamp = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.image = null, u.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.image != null && Object.hasOwnProperty.call(r, "image") && s.dot.Image.encode(r.image, t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).fork()).ldelim(), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.image != null && r.hasOwnProperty("image")) {
        let t = s.dot.Image.verify(r.image);
        if (t)
          return "image." + t;
      }
      return r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !p.isInteger(r.timestampMillis) && !(r.timestampMillis && p.isInteger(r.timestampMillis.low) && p.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.ImageWithTimestamp)
        return r;
      let t = new s.dot.ImageWithTimestamp();
      if (r.image != null) {
        if (typeof r.image != "object")
          throw TypeError(".dot.ImageWithTimestamp.image: object expected");
        t.image = s.dot.Image.fromObject(r.image);
      }
      return r.timestampMillis != null && (p.Long ? (t.timestampMillis = p.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (e.image = null, p.Long) {
          let n = new p.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.image != null && r.hasOwnProperty("image") && (e.image = s.dot.Image.toObject(r.image, t)), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? p.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageWithTimestamp";
    }, u;
  }(), y.ImageSize = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.width = 0, u.prototype.height = 0, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.width != null && Object.hasOwnProperty.call(r, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.width), r.height != null && Object.hasOwnProperty.call(r, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.height), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.width != null && r.hasOwnProperty("width") && !p.isInteger(r.width) ? "width: integer expected" : r.height != null && r.hasOwnProperty("height") && !p.isInteger(r.height) ? "height: integer expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.ImageSize)
        return r;
      let t = new s.dot.ImageSize();
      return r.width != null && (t.width = r.width | 0), r.height != null && (t.height = r.height | 0), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), r.width != null && r.hasOwnProperty("width") && (e.width = r.width), r.height != null && r.hasOwnProperty("height") && (e.height = r.height), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageSize";
    }, u;
  }(), y.Int32List = function() {
    function u(r) {
      if (this.items = [], r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.items = p.emptyArray, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      if (t || (t = x.create()), r.items != null && r.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < r.items.length; ++e)
          t.int32(r.items[e]);
        t.ldelim();
      }
      return t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.Int32List();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            if (o.items && o.items.length || (o.items = []), (d & 7) === 2) {
              let c = r.uint32() + r.pos;
              for (; r.pos < c; )
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
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
    }, u.fromObject = function(r) {
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
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), r.items && r.items.length) {
        e.items = [];
        for (let n = 0; n < r.items.length; ++n)
          e.items[n] = r.items[n];
      }
      return e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Int32List";
    }, u;
  }(), y.Platform = function() {
    const u = {}, r = Object.create(u);
    return r[u[0] = "WEB"] = 0, r[u[1] = "ANDROID"] = 1, r[u[2] = "IOS"] = 2, r;
  }(), y.RectangleDouble = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.left = 0, u.prototype.top = 0, u.prototype.right = 0, u.prototype.bottom = 0, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.left != null && Object.hasOwnProperty.call(r, "left") && t.uint32(
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
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.left != null && r.hasOwnProperty("left") && typeof r.left != "number" ? "left: number expected" : r.top != null && r.hasOwnProperty("top") && typeof r.top != "number" ? "top: number expected" : r.right != null && r.hasOwnProperty("right") && typeof r.right != "number" ? "right: number expected" : r.bottom != null && r.hasOwnProperty("bottom") && typeof r.bottom != "number" ? "bottom: number expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.RectangleDouble)
        return r;
      let t = new s.dot.RectangleDouble();
      return r.left != null && (t.left = Number(r.left)), r.top != null && (t.top = Number(r.top)), r.right != null && (t.right = Number(r.right)), r.bottom != null && (t.bottom = Number(r.bottom)), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), r.left != null && r.hasOwnProperty("left") && (e.left = t.json && !isFinite(r.left) ? String(r.left) : r.left), r.top != null && r.hasOwnProperty("top") && (e.top = t.json && !isFinite(r.top) ? String(r.top) : r.top), r.right != null && r.hasOwnProperty("right") && (e.right = t.json && !isFinite(r.right) ? String(r.right) : r.right), r.bottom != null && r.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(r.bottom) ? String(r.bottom) : r.bottom), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.RectangleDouble";
    }, u;
  }(), y.DigestWithTimestamp = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.digest = p.newBuffer([]), u.prototype.timestampMillis = p.Long ? p.Long.fromBits(0, 0, !0) : 0, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.digest != null && Object.hasOwnProperty.call(r, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.digest), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.digest != null && r.hasOwnProperty("digest") && !(r.digest && typeof r.digest.length == "number" || p.isString(r.digest)) ? "digest: buffer expected" : r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !p.isInteger(r.timestampMillis) && !(r.timestampMillis && p.isInteger(r.timestampMillis.low) && p.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.DigestWithTimestamp)
        return r;
      let t = new s.dot.DigestWithTimestamp();
      return r.digest != null && (typeof r.digest == "string" ? p.base64.decode(r.digest, t.digest = p.newBuffer(p.base64.length(r.digest)), 0) : r.digest.length >= 0 && (t.digest = r.digest)), r.timestampMillis != null && (p.Long ? (t.timestampMillis = p.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = p.newBuffer(e.digest))), p.Long) {
          let n = new p.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.digest != null && r.hasOwnProperty("digest") && (e.digest = t.bytes === String ? p.base64.encode(r.digest, 0, r.digest.length) : t.bytes === Array ? Array.prototype.slice.call(r.digest) : r.digest), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? p.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new p.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.DigestWithTimestamp";
    }, u;
  }(), y.Video = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.bytes = p.newBuffer([]), u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new s.dot.Video();
      for (; r.pos < n; ) {
        let d = r.uint32();
        if (d === e)
          break;
        switch (d >>> 3) {
          case 1: {
            o.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(d & 7);
            break;
        }
      }
      return o;
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || p.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.Video)
        return r;
      let t = new s.dot.Video();
      return r.bytes != null && (typeof r.bytes == "string" ? p.base64.decode(r.bytes, t.bytes = p.newBuffer(p.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = p.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? p.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Video";
    }, u;
  }(), y.PointInt = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.x = 0, u.prototype.y = 0, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.x != null && Object.hasOwnProperty.call(r, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.x), r.y != null && Object.hasOwnProperty.call(r, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.y), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.x != null && r.hasOwnProperty("x") && !p.isInteger(r.x) ? "x: integer expected" : r.y != null && r.hasOwnProperty("y") && !p.isInteger(r.y) ? "y: integer expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.PointInt)
        return r;
      let t = new s.dot.PointInt();
      return r.x != null && (t.x = r.x | 0), r.y != null && (t.y = r.y | 0), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), r.x != null && r.hasOwnProperty("x") && (e.x = r.x), r.y != null && r.hasOwnProperty("y") && (e.y = r.y), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.PointInt";
    }, u;
  }(), y.PointDouble = function() {
    function u(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return u.prototype.x = 0, u.prototype.y = 0, u.create = function(r) {
      return new u(r);
    }, u.encode = function(r, t) {
      return t || (t = x.create()), r.x != null && Object.hasOwnProperty.call(r, "x") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(r.x), r.y != null && Object.hasOwnProperty.call(r, "y") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(r.y), t;
    }, u.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, u.decode = function(r, t, e) {
      r instanceof v || (r = v.create(r));
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
    }, u.decodeDelimited = function(r) {
      return r instanceof v || (r = new v(r)), this.decode(r, r.uint32());
    }, u.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.x != null && r.hasOwnProperty("x") && typeof r.x != "number" ? "x: number expected" : r.y != null && r.hasOwnProperty("y") && typeof r.y != "number" ? "y: number expected" : null;
    }, u.fromObject = function(r) {
      if (r instanceof s.dot.PointDouble)
        return r;
      let t = new s.dot.PointDouble();
      return r.x != null && (t.x = Number(r.x)), r.y != null && (t.y = Number(r.y)), t;
    }, u.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), r.x != null && r.hasOwnProperty("x") && (e.x = t.json && !isFinite(r.x) ? String(r.x) : r.x), r.y != null && r.hasOwnProperty("y") && (e.y = t.json && !isFinite(r.y) ? String(r.y) : r.y), e;
    }, u.prototype.toJSON = function() {
      return this.constructor.toObject(this, M.util.toJSONOptions);
    }, u.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.PointDouble";
    }, u;
  }(), y;
})();
var mi = (() => {
  var y = import.meta.url;
  return async function(u = {}) {
    var r, t = u, e, n, o = new Promise((a, i) => {
      e = a, n = i;
    }), d = typeof window == "object", c = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var w = Object.assign({}, t), D = (a, i) => {
      throw i;
    }, b = "";
    function I(a) {
      return t.locateFile ? t.locateFile(a, b) : b + a;
    }
    var S, k;
    (d || c) && (c ? b = self.location.href : typeof document < "u" && document.currentScript && (b = document.currentScript.src), y && (b = y), b.startsWith("blob:") ? b = "" : b = b.slice(0, b.replace(/[?#].*/, "").lastIndexOf("/") + 1), c && (k = (a) => {
      var i = new XMLHttpRequest();
      return i.open("GET", a, !1), i.responseType = "arraybuffer", i.send(null), new Uint8Array(i.response);
    }), S = async (a) => {
      if (Qe(a))
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
    var F = t.printErr || console.error.bind(console);
    Object.assign(t, w), w = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var C = t.wasmBinary, R, N = !1, se, X, z, le, pe, Q, $, Ze, Ke, qe, Xe, Qe = (a) => a.startsWith("file://");
    function et() {
      var a = R.buffer;
      t.HEAP8 = X = new Int8Array(a), t.HEAP16 = le = new Int16Array(a), t.HEAPU8 = z = new Uint8Array(a), t.HEAPU16 = pe = new Uint16Array(a), t.HEAP32 = Q = new Int32Array(a), t.HEAPU32 = $ = new Uint32Array(a), t.HEAPF32 = Ze = new Float32Array(a), t.HEAPF64 = Xe = new Float64Array(a), t.HEAP64 = Ke = new BigInt64Array(a), t.HEAPU64 = qe = new BigUint64Array(a);
    }
    function Wt() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Qt(t.preRun.shift());
      rt(ot);
    }
    function Ut() {
      _.C();
    }
    function Vt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Xt(t.postRun.shift());
      rt(nt);
    }
    var ie = 0, me = null;
    function zt(a) {
      var i;
      ie++, (i = t.monitorRunDependencies) == null || i.call(t, ie);
    }
    function Gt(a) {
      var l;
      if (ie--, (l = t.monitorRunDependencies) == null || l.call(t, ie), ie == 0 && me) {
        var i = me;
        me = null, i();
      }
    }
    function be(a) {
      var l;
      (l = t.onAbort) == null || l.call(t, a), a = "Aborted(" + a + ")", F(a), N = !0, a += ". Build with -sASSERTIONS for more info.";
      var i = new WebAssembly.RuntimeError(a);
      throw n(i), i;
    }
    var Ee;
    function Bt() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Ht(a) {
      if (a == Ee && C)
        return new Uint8Array(C);
      if (k)
        return k(a);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Yt(a) {
      if (!C)
        try {
          var i = await S(a);
          return new Uint8Array(i);
        } catch {
        }
      return Ht(a);
    }
    async function Jt(a, i) {
      try {
        var l = await Yt(a), f = await WebAssembly.instantiate(l, i);
        return f;
      } catch (m) {
        F(`failed to asynchronously prepare wasm: ${m}`), be(m);
      }
    }
    async function Zt(a, i, l) {
      if (!a && typeof WebAssembly.instantiateStreaming == "function" && !Qe(i))
        try {
          var f = fetch(i, { credentials: "same-origin" }), m = await WebAssembly.instantiateStreaming(f, l);
          return m;
        } catch (h) {
          F(`wasm streaming compile failed: ${h}`), F("falling back to ArrayBuffer instantiation");
        }
      return Jt(i, l);
    }
    function Kt() {
      return { a: In };
    }
    async function qt() {
      function a(h, O) {
        return _ = h.exports, _ = j.instrumentWasmExports(_), R = _.B, et(), _.H, Gt(), _;
      }
      zt();
      function i(h) {
        return a(h.instance);
      }
      var l = Kt();
      if (t.instantiateWasm)
        return new Promise((h, O) => {
          t.instantiateWasm(l, (g, P) => {
            a(g), h(g.exports);
          });
        });
      Ee ?? (Ee = Bt());
      try {
        var f = await Zt(C, Ee, l), m = i(f);
        return m;
      } catch (h) {
        return n(h), Promise.reject(h);
      }
    }
    class tt {
      constructor(i) {
        At(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${i})`, this.status = i;
      }
    }
    var rt = (a) => {
      for (; a.length > 0; )
        a.shift()(t);
    }, nt = [], Xt = (a) => nt.unshift(a), ot = [], Qt = (a) => ot.unshift(a), it = t.noExitRuntime || !0;
    class er {
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
    var at = 0, tr = (a, i, l) => {
      var f = new er(a);
      throw f.init(i, l), at = a, at;
    }, rr = () => be(""), Oe = (a) => {
      if (a === null)
        return "null";
      var i = typeof a;
      return i === "object" || i === "array" || i === "function" ? a.toString() : "" + a;
    }, nr = () => {
      for (var a = new Array(256), i = 0; i < 256; ++i)
        a[i] = String.fromCharCode(i);
      st = a;
    }, st, W = (a) => {
      for (var i = "", l = a; z[l]; )
        i += st[z[l++]];
      return i;
    }, ce = {}, ae = {}, we = {}, ue, E = (a) => {
      throw new ue(a);
    }, lt, Pe = (a) => {
      throw new lt(a);
    }, de = (a, i, l) => {
      a.forEach((g) => we[g] = i);
      function f(g) {
        var P = l(g);
        P.length !== a.length && Pe("Mismatched type converter count");
        for (var A = 0; A < a.length; ++A)
          B(a[A], P[A]);
      }
      var m = new Array(i.length), h = [], O = 0;
      i.forEach((g, P) => {
        ae.hasOwnProperty(g) ? m[P] = ae[g] : (h.push(g), ce.hasOwnProperty(g) || (ce[g] = []), ce[g].push(() => {
          m[P] = ae[g], ++O, O === h.length && f(m);
        }));
      }), h.length === 0 && f(m);
    };
    function or(a, i, l = {}) {
      var f = i.name;
      if (a || E(`type "${f}" must have a positive integer typeid pointer`), ae.hasOwnProperty(a)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        E(`Cannot register type '${f}' twice`);
      }
      if (ae[a] = i, delete we[a], ce.hasOwnProperty(a)) {
        var m = ce[a];
        delete ce[a], m.forEach((h) => h());
      }
    }
    function B(a, i, l = {}) {
      return or(a, i, l);
    }
    var ct = (a, i, l) => {
      switch (i) {
        case 1:
          return l ? (f) => X[f] : (f) => z[f];
        case 2:
          return l ? (f) => le[f >> 1] : (f) => pe[f >> 1];
        case 4:
          return l ? (f) => Q[f >> 2] : (f) => $[f >> 2];
        case 8:
          return l ? (f) => Ke[f >> 3] : (f) => qe[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${i}): ${a}`);
      }
    }, ir = (a, i, l, f, m) => {
      i = W(i);
      var h = i.indexOf("u") != -1;
      B(a, { name: i, fromWireType: (O) => O, toWireType: function(O, g) {
        if (typeof g != "bigint" && typeof g != "number")
          throw new TypeError(`Cannot convert "${Oe(g)}" to ${this.name}`);
        return typeof g == "number" && (g = BigInt(g)), g;
      }, argPackAdvance: Y, readValueFromPointer: ct(i, l, !h), destructorFunction: null });
    }, Y = 8, ar = (a, i, l, f) => {
      i = W(i), B(a, { name: i, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, h) {
        return h ? l : f;
      }, argPackAdvance: Y, readValueFromPointer: function(m) {
        return this.fromWireType(z[m]);
      }, destructorFunction: null });
    }, sr = (a) => ({ count: a.count, deleteScheduled: a.deleteScheduled, preservePointerOnDelete: a.preservePointerOnDelete, ptr: a.ptr, ptrType: a.ptrType, smartPtr: a.smartPtr, smartPtrType: a.smartPtrType }), Re = (a) => {
      function i(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      E(i(a) + " instance already deleted");
    }, Me = !1, ut = (a) => {
    }, lr = (a) => {
      a.smartPtr ? a.smartPtrType.rawDestructor(a.smartPtr) : a.ptrType.registeredClass.rawDestructor(a.ptr);
    }, dt = (a) => {
      a.count.value -= 1;
      var i = a.count.value === 0;
      i && lr(a);
    }, ft = (a, i, l) => {
      if (i === l)
        return a;
      if (l.baseClass === void 0)
        return null;
      var f = ft(a, i, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, pt = {}, cr = {}, ur = (a, i) => {
      for (i === void 0 && E("ptr should not be undefined"); a.baseClass; )
        i = a.upcast(i), a = a.baseClass;
      return i;
    }, dr = (a, i) => (i = ur(a, i), cr[i]), Ie = (a, i) => {
      (!i.ptrType || !i.ptr) && Pe("makeClassHandle requires ptr and ptrType");
      var l = !!i.smartPtrType, f = !!i.smartPtr;
      return l !== f && Pe("Both smartPtrType and smartPtr must be specified"), i.count = { value: 1 }, ye(Object.create(a, { $$: { value: i, writable: !0 } }));
    };
    function fr(a) {
      var i = this.getPointee(a);
      if (!i)
        return this.destructor(a), null;
      var l = dr(this.registeredClass, i);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = i, l.$$.smartPtr = a, l.clone();
        var f = l.clone();
        return this.destructor(a), f;
      }
      function m() {
        return this.isSmartPointer ? Ie(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: i, smartPtrType: this, smartPtr: a }) : Ie(this.registeredClass.instancePrototype, { ptrType: this, ptr: a });
      }
      var h = this.registeredClass.getActualType(i), O = pt[h];
      if (!O)
        return m.call(this);
      var g;
      this.isConst ? g = O.constPointerType : g = O.pointerType;
      var P = ft(i, this.registeredClass, g.registeredClass);
      return P === null ? m.call(this) : this.isSmartPointer ? Ie(g.registeredClass.instancePrototype, { ptrType: g, ptr: P, smartPtrType: this, smartPtr: a }) : Ie(g.registeredClass.instancePrototype, { ptrType: g, ptr: P });
    }
    var ye = (a) => typeof FinalizationRegistry > "u" ? (ye = (i) => i, a) : (Me = new FinalizationRegistry((i) => {
      dt(i.$$);
    }), ye = (i) => {
      var l = i.$$, f = !!l.smartPtr;
      if (f) {
        var m = { $$: l };
        Me.register(i, m, i);
      }
      return i;
    }, ut = (i) => Me.unregister(i), ye(a)), pr = () => {
      Object.assign(Ce.prototype, { isAliasOf(a) {
        if (!(this instanceof Ce) || !(a instanceof Ce))
          return !1;
        var i = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        a.$$ = a.$$;
        for (var f = a.$$.ptrType.registeredClass, m = a.$$.ptr; i.baseClass; )
          l = i.upcast(l), i = i.baseClass;
        for (; f.baseClass; )
          m = f.upcast(m), f = f.baseClass;
        return i === f && l === m;
      }, clone() {
        if (this.$$.ptr || Re(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var a = ye(Object.create(Object.getPrototypeOf(this), { $$: { value: sr(this.$$) } }));
        return a.$$.count.value += 1, a.$$.deleteScheduled = !1, a;
      }, delete() {
        this.$$.ptr || Re(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), ut(this), dt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Re(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ce() {
    }
    var je = (a, i) => Object.defineProperty(i, "name", { value: a }), mr = (a, i, l) => {
      if (a[i].overloadTable === void 0) {
        var f = a[i];
        a[i] = function(...m) {
          return a[i].overloadTable.hasOwnProperty(m.length) || E(`Function '${l}' called with an invalid number of arguments (${m.length}) - expects one of (${a[i].overloadTable})!`), a[i].overloadTable[m.length].apply(this, m);
        }, a[i].overloadTable = [], a[i].overloadTable[f.argCount] = f;
      }
    }, Fe = (a, i, l) => {
      t.hasOwnProperty(a) ? ((l === void 0 || t[a].overloadTable !== void 0 && t[a].overloadTable[l] !== void 0) && E(`Cannot register public name '${a}' twice`), mr(t, a, a), t[a].overloadTable.hasOwnProperty(l) && E(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[a].overloadTable[l] = i) : (t[a] = i, t[a].argCount = l);
    }, yr = 48, gr = 57, hr = (a) => {
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var i = a.charCodeAt(0);
      return i >= yr && i <= gr ? `_${a}` : a;
    };
    function vr(a, i, l, f, m, h, O, g) {
      this.name = a, this.constructor = i, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = m, this.getActualType = h, this.upcast = O, this.downcast = g, this.pureVirtualFunctions = [];
    }
    var Se = (a, i, l) => {
      for (; i !== l; )
        i.upcast || E(`Expected null or instance of ${l.name}, got an instance of ${i.name}`), a = i.upcast(a), i = i.baseClass;
      return a;
    };
    function br(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${Oe(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Se(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Or(a, i) {
      var l;
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), a !== null && a.push(this.rawDestructor, l), l) : 0;
      (!i || !i.$$) && E(`Cannot pass "${Oe(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.smartPtrType ? i.$$.smartPtrType.name : i.$$.ptrType.name} to parameter type ${this.name}`);
      var f = i.$$.ptrType.registeredClass;
      if (l = Se(i.$$.ptr, f, this.registeredClass), this.isSmartPointer)
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
              l = this.rawShare(l, H.toHandle(() => m.delete())), a !== null && a.push(this.rawDestructor, l);
            }
            break;
          default:
            E("Unsupporting sharing policy");
        }
      return l;
    }
    function wr(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${Oe(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.ptrType.name} to parameter type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Se(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Te(a) {
      return this.fromWireType($[a >> 2]);
    }
    var Pr = () => {
      Object.assign(ke.prototype, { getPointee(a) {
        return this.rawGetPointee && (a = this.rawGetPointee(a)), a;
      }, destructor(a) {
        var i;
        (i = this.rawDestructor) == null || i.call(this, a);
      }, argPackAdvance: Y, readValueFromPointer: Te, fromWireType: fr });
    };
    function ke(a, i, l, f, m, h, O, g, P, A, T) {
      this.name = a, this.registeredClass = i, this.isReference = l, this.isConst = f, this.isSmartPointer = m, this.pointeeType = h, this.sharingPolicy = O, this.rawGetPointee = g, this.rawConstructor = P, this.rawShare = A, this.rawDestructor = T, !m && i.baseClass === void 0 ? f ? (this.toWireType = br, this.destructorFunction = null) : (this.toWireType = wr, this.destructorFunction = null) : this.toWireType = Or;
    }
    var mt = (a, i, l) => {
      t.hasOwnProperty(a) || Pe("Replacing nonexistent public symbol"), t[a].overloadTable !== void 0 && l !== void 0 ? t[a].overloadTable[l] = i : (t[a] = i, t[a].argCount = l);
    }, Ir = (a, i, l) => {
      a = a.replace(/p/g, "i");
      var f = t["dynCall_" + a];
      return f(i, ...l);
    }, Cr = (a, i, l = []) => {
      var f = Ir(a, i, l);
      return f;
    }, jr = (a, i) => (...l) => Cr(a, i, l), ee = (a, i) => {
      a = W(a);
      function l() {
        return jr(a, i);
      }
      var f = l();
      return typeof f != "function" && E(`unknown function pointer with signature ${a}: ${i}`), f;
    }, Sr = (a, i) => {
      var l = je(i, function(f) {
        this.name = i, this.message = f;
        var m = new Error(f).stack;
        m !== void 0 && (this.stack = this.toString() + `
` + m.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(a.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, yt, gt = (a) => {
      var i = Cn(a), l = W(i);
      return q(i), l;
    }, ge = (a, i) => {
      var l = [], f = {};
      function m(h) {
        if (!f[h] && !ae[h]) {
          if (we[h]) {
            we[h].forEach(m);
            return;
          }
          l.push(h), f[h] = !0;
        }
      }
      throw i.forEach(m), new yt(`${a}: ` + l.map(gt).join([", "]));
    }, Tr = (a, i, l, f, m, h, O, g, P, A, T, L, U) => {
      T = W(T), h = ee(m, h), g && (g = ee(O, g)), A && (A = ee(P, A)), U = ee(L, U);
      var J = hr(T);
      Fe(J, function() {
        ge(`Cannot construct ${T} due to unbound types`, [f]);
      }), de([a, i, l], f ? [f] : [], (Z) => {
        var kt;
        Z = Z[0];
        var re, G;
        f ? (re = Z.registeredClass, G = re.instancePrototype) : G = Ce.prototype;
        var K = je(T, function(...Ve) {
          if (Object.getPrototypeOf(this) !== ne)
            throw new ue("Use 'new' to construct " + T);
          if (V.constructor_body === void 0)
            throw new ue(T + " has no accessible constructor");
          var Dt = V.constructor_body[Ve.length];
          if (Dt === void 0)
            throw new ue(`Tried to invoke ctor of ${T} with invalid number of parameters (${Ve.length}) - expected (${Object.keys(V.constructor_body).toString()}) parameters instead!`);
          return Dt.apply(this, Ve);
        }), ne = Object.create(G, { constructor: { value: K } });
        K.prototype = ne;
        var V = new vr(T, K, ne, U, re, h, g, A);
        V.baseClass && ((kt = V.baseClass).__derivedClasses ?? (kt.__derivedClasses = []), V.baseClass.__derivedClasses.push(V));
        var oe = new ke(T, V, !0, !1, !1), Ae = new ke(T + "*", V, !1, !1, !1), Tt = new ke(T + " const*", V, !1, !0, !1);
        return pt[a] = { pointerType: Ae, constPointerType: Tt }, mt(J, K), [oe, Ae, Tt];
      });
    }, ht = (a, i) => {
      for (var l = [], f = 0; f < a; f++)
        l.push($[i + f * 4 >> 2]);
      return l;
    }, Le = (a) => {
      for (; a.length; ) {
        var i = a.pop(), l = a.pop();
        l(i);
      }
    };
    function kr(a) {
      for (var i = 1; i < a.length; ++i)
        if (a[i] !== null && a[i].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var De = (a) => {
      try {
        return a();
      } catch (i) {
        be(i);
      }
    }, vt = (a) => {
      if (a instanceof tt || a == "unwind")
        return se;
      D(1, a);
    }, bt = 0, Ot = () => it || bt > 0, wt = (a) => {
      var i;
      se = a, Ot() || ((i = t.onExit) == null || i.call(t, a), N = !0), D(a, new tt(a));
    }, Dr = (a, i) => {
      se = a, wt(a);
    }, Ar = Dr, _r = () => {
      if (!Ot())
        try {
          Ar(se);
        } catch (a) {
          vt(a);
        }
    }, Pt = (a) => {
      if (!N)
        try {
          a(), _r();
        } catch (i) {
          vt(i);
        }
    }, j = { instrumentWasmImports(a) {
      var i = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(a))
        typeof f == "function" && (f.isAsync || i.test(l));
    }, instrumentWasmExports(a) {
      var i = {};
      for (let [l, f] of Object.entries(a))
        typeof f == "function" ? i[l] = (...m) => {
          j.exportCallStack.push(l);
          try {
            return f(...m);
          } finally {
            N || (j.exportCallStack.pop(), j.maybeStopUnwind());
          }
        } : i[l] = f;
      return i;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(a) {
      var i = j.callStackNameToId[a];
      return i === void 0 && (i = j.callStackId++, j.callStackNameToId[a] = i, j.callStackIdToName[i] = a), i;
    }, maybeStopUnwind() {
      j.currData && j.state === j.State.Unwinding && j.exportCallStack.length === 0 && (j.state = j.State.Normal, De(Tn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((a, i) => {
        j.asyncPromiseHandlers = { resolve: a, reject: i };
      });
    }, allocateData() {
      var a = We(12 + j.StackSize);
      return j.setDataHeader(a, a + 12, j.StackSize), j.setDataRewindFunc(a), a;
    }, setDataHeader(a, i, l) {
      $[a >> 2] = i, $[a + 4 >> 2] = i + l;
    }, setDataRewindFunc(a) {
      var i = j.exportCallStack[0], l = j.getCallStackId(i);
      Q[a + 8 >> 2] = l;
    }, getDataRewindFuncName(a) {
      var i = Q[a + 8 >> 2], l = j.callStackIdToName[i];
      return l;
    }, getDataRewindFunc(a) {
      var i = _[a];
      return i;
    }, doRewind(a) {
      var i = j.getDataRewindFuncName(a), l = j.getDataRewindFunc(i);
      return l();
    }, handleSleep(a) {
      if (!N) {
        if (j.state === j.State.Normal) {
          var i = !1, l = !1;
          a((f = 0) => {
            if (!N && (j.handleSleepReturnValue = f, i = !0, !!l)) {
              j.state = j.State.Rewinding, De(() => kn(j.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var m, h = !1;
              try {
                m = j.doRewind(j.currData);
              } catch (P) {
                m = P, h = !0;
              }
              var O = !1;
              if (!j.currData) {
                var g = j.asyncPromiseHandlers;
                g && (j.asyncPromiseHandlers = null, (h ? g.reject : g.resolve)(m), O = !0);
              }
              if (h && !O)
                throw m;
            }
          }), l = !0, i || (j.state = j.State.Unwinding, j.currData = j.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), De(() => Sn(j.currData)));
        } else j.state === j.State.Rewinding ? (j.state = j.State.Normal, De(Dn), q(j.currData), j.currData = null, j.sleepCallbacks.forEach(Pt)) : be(`invalid state: ${j.state}`);
        return j.handleSleepReturnValue;
      }
    }, handleAsync(a) {
      return j.handleSleep((i) => {
        a().then(i);
      });
    } };
    function It(a, i, l, f, m, h) {
      var O = i.length;
      O < 2 && E("argTypes array size mismatch! Must at least get return value and 'this' types!"), i[1];
      var g = kr(i), P = i[0].name !== "void", A = O - 2, T = new Array(A), L = [], U = [], J = function(...Z) {
        U.length = 0;
        var re;
        L.length = 1, L[0] = m;
        for (var G = 0; G < A; ++G)
          T[G] = i[G + 2].toWireType(U, Z[G]), L.push(T[G]);
        var K = f(...L);
        function ne(V) {
          if (g)
            Le(U);
          else
            for (var oe = 2; oe < i.length; oe++) {
              var Ae = oe === 1 ? re : T[oe - 2];
              i[oe].destructorFunction !== null && i[oe].destructorFunction(Ae);
            }
          if (P)
            return i[0].fromWireType(V);
        }
        return j.currData ? j.whenDone().then(ne) : ne(K);
      };
      return je(a, J);
    }
    var Er = (a, i, l, f, m, h) => {
      var O = ht(i, l);
      m = ee(f, m), de([], [a], (g) => {
        g = g[0];
        var P = `constructor ${g.name}`;
        if (g.registeredClass.constructor_body === void 0 && (g.registeredClass.constructor_body = []), g.registeredClass.constructor_body[i - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${i - 1}) for class '${g.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return g.registeredClass.constructor_body[i - 1] = () => {
          ge(`Cannot construct ${g.name} due to unbound types`, O);
        }, de([], O, (A) => (A.splice(1, 0, null), g.registeredClass.constructor_body[i - 1] = It(P, A, null, m, h), [])), [];
      });
    }, Ct = (a, i, l) => (a instanceof Object || E(`${l} with invalid "this": ${a}`), a instanceof i.registeredClass.constructor || E(`${l} incompatible with "this" of type ${a.constructor.name}`), a.$$.ptr || E(`cannot call emscripten binding method ${l} on deleted object`), Se(a.$$.ptr, a.$$.ptrType.registeredClass, i.registeredClass)), Rr = (a, i, l, f, m, h, O, g, P, A) => {
      i = W(i), m = ee(f, m), de([], [a], (T) => {
        T = T[0];
        var L = `${T.name}.${i}`, U = { get() {
          ge(`Cannot access ${L} due to unbound types`, [l, O]);
        }, enumerable: !0, configurable: !0 };
        return P ? U.set = () => ge(`Cannot access ${L} due to unbound types`, [l, O]) : U.set = (J) => E(L + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, i, U), de([], P ? [l, O] : [l], (J) => {
          var Z = J[0], re = { get() {
            var K = Ct(this, T, L + " getter");
            return Z.fromWireType(m(h, K));
          }, enumerable: !0 };
          if (P) {
            P = ee(g, P);
            var G = J[1];
            re.set = function(K) {
              var ne = Ct(this, T, L + " setter"), V = [];
              P(A, ne, G.toWireType(V, K)), Le(V);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, i, re), [];
        }), [];
      });
    }, xe = [], te = [], Ne = (a) => {
      a > 9 && --te[a + 1] === 0 && (te[a] = void 0, xe.push(a));
    }, Mr = () => te.length / 2 - 5 - xe.length, Fr = () => {
      te.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Mr;
    }, H = { toValue: (a) => (a || E("Cannot use deleted val. handle = " + a), te[a]), toHandle: (a) => {
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
          const i = xe.pop() || te.length;
          return te[i] = a, te[i + 1] = 1, i;
        }
      }
    } }, Lr = { name: "emscripten::val", fromWireType: (a) => {
      var i = H.toValue(a);
      return Ne(a), i;
    }, toWireType: (a, i) => H.toHandle(i), argPackAdvance: Y, readValueFromPointer: Te, destructorFunction: null }, xr = (a) => B(a, Lr), Nr = (a, i, l) => {
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
    }, $r = (a, i, l, f) => {
      i = W(i);
      function m() {
      }
      m.values = {}, B(a, { name: i, constructor: m, fromWireType: function(h) {
        return this.constructor.values[h];
      }, toWireType: (h, O) => O.value, argPackAdvance: Y, readValueFromPointer: Nr(i, l, f), destructorFunction: null }), Fe(i, m);
    }, $e = (a, i) => {
      var l = ae[a];
      return l === void 0 && E(`${i} has unknown type ${gt(a)}`), l;
    }, Wr = (a, i, l) => {
      var f = $e(a, "enum");
      i = W(i);
      var m = f.constructor, h = Object.create(f.constructor.prototype, { value: { value: l }, constructor: { value: je(`${f.name}_${i}`, function() {
      }) } });
      m.values[l] = h, m[i] = h;
    }, Ur = (a, i) => {
      switch (i) {
        case 4:
          return function(l) {
            return this.fromWireType(Ze[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(Xe[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${i}): ${a}`);
      }
    }, Vr = (a, i, l) => {
      i = W(i), B(a, { name: i, fromWireType: (f) => f, toWireType: (f, m) => m, argPackAdvance: Y, readValueFromPointer: Ur(i, l), destructorFunction: null });
    }, zr = (a) => {
      a = a.trim();
      const i = a.indexOf("(");
      return i === -1 ? a : a.slice(0, i);
    }, Gr = (a, i, l, f, m, h, O, g) => {
      var P = ht(i, l);
      a = W(a), a = zr(a), m = ee(f, m), Fe(a, function() {
        ge(`Cannot call ${a} due to unbound types`, P);
      }, i - 1), de([], P, (A) => {
        var T = [A[0], null].concat(A.slice(1));
        return mt(a, It(a, T, null, m, h), i - 1), [];
      });
    }, Br = (a, i, l, f, m) => {
      i = W(i);
      var h = (T) => T;
      if (f === 0) {
        var O = 32 - 8 * l;
        h = (T) => T << O >>> O;
      }
      var g = i.includes("unsigned"), P = (T, L) => {
      }, A;
      g ? A = function(T, L) {
        return P(L, this.name), L >>> 0;
      } : A = function(T, L) {
        return P(L, this.name), L;
      }, B(a, { name: i, fromWireType: h, toWireType: A, argPackAdvance: Y, readValueFromPointer: ct(i, l, f !== 0), destructorFunction: null });
    }, Hr = (a, i, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], m = f[i];
      function h(O) {
        var g = $[O >> 2], P = $[O + 4 >> 2];
        return new m(X.buffer, P, g);
      }
      l = W(l), B(a, { name: l, fromWireType: h, argPackAdvance: Y, readValueFromPointer: h }, { ignoreDuplicateRegistrations: !0 });
    }, Yr = (a, i, l, f) => {
      if (!(f > 0)) return 0;
      for (var m = l, h = l + f - 1, O = 0; O < a.length; ++O) {
        var g = a.charCodeAt(O);
        if (g >= 55296 && g <= 57343) {
          var P = a.charCodeAt(++O);
          g = 65536 + ((g & 1023) << 10) | P & 1023;
        }
        if (g <= 127) {
          if (l >= h) break;
          i[l++] = g;
        } else if (g <= 2047) {
          if (l + 1 >= h) break;
          i[l++] = 192 | g >> 6, i[l++] = 128 | g & 63;
        } else if (g <= 65535) {
          if (l + 2 >= h) break;
          i[l++] = 224 | g >> 12, i[l++] = 128 | g >> 6 & 63, i[l++] = 128 | g & 63;
        } else {
          if (l + 3 >= h) break;
          i[l++] = 240 | g >> 18, i[l++] = 128 | g >> 12 & 63, i[l++] = 128 | g >> 6 & 63, i[l++] = 128 | g & 63;
        }
      }
      return i[l] = 0, l - m;
    }, Jr = (a, i, l) => Yr(a, z, i, l), Zr = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f <= 127 ? i++ : f <= 2047 ? i += 2 : f >= 55296 && f <= 57343 ? (i += 4, ++l) : i += 3;
      }
      return i;
    }, jt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Kr = (a, i = 0, l = NaN) => {
      for (var f = i + l, m = i; a[m] && !(m >= f); ) ++m;
      if (m - i > 16 && a.buffer && jt)
        return jt.decode(a.subarray(i, m));
      for (var h = ""; i < m; ) {
        var O = a[i++];
        if (!(O & 128)) {
          h += String.fromCharCode(O);
          continue;
        }
        var g = a[i++] & 63;
        if ((O & 224) == 192) {
          h += String.fromCharCode((O & 31) << 6 | g);
          continue;
        }
        var P = a[i++] & 63;
        if ((O & 240) == 224 ? O = (O & 15) << 12 | g << 6 | P : O = (O & 7) << 18 | g << 12 | P << 6 | a[i++] & 63, O < 65536)
          h += String.fromCharCode(O);
        else {
          var A = O - 65536;
          h += String.fromCharCode(55296 | A >> 10, 56320 | A & 1023);
        }
      }
      return h;
    }, qr = (a, i) => a ? Kr(z, a, i) : "", Xr = (a, i) => {
      i = W(i), B(a, { name: i, fromWireType(l) {
        for (var f = $[l >> 2], m = l + 4, h, O, g = m, O = 0; O <= f; ++O) {
          var P = m + O;
          if (O == f || z[P] == 0) {
            var A = P - g, T = qr(g, A);
            h === void 0 ? h = T : (h += "\0", h += T), g = P + 1;
          }
        }
        return q(l), h;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var m, h = typeof f == "string";
        h || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || E("Cannot pass non-string to std::string"), h ? m = Zr(f) : m = f.length;
        var O = We(4 + m + 1), g = O + 4;
        if ($[O >> 2] = m, h)
          Jr(f, g, m + 1);
        else if (h)
          for (var P = 0; P < m; ++P) {
            var A = f.charCodeAt(P);
            A > 255 && (q(O), E("String has UTF-16 code units that do not fit in 8 bits")), z[g + P] = A;
          }
        else
          for (var P = 0; P < m; ++P)
            z[g + P] = f[P];
        return l !== null && l.push(q, O), O;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(l) {
        q(l);
      } });
    }, St = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Qr = (a, i) => {
      for (var l = a, f = l >> 1, m = f + i / 2; !(f >= m) && pe[f]; ) ++f;
      if (l = f << 1, l - a > 32 && St) return St.decode(z.subarray(a, l));
      for (var h = "", O = 0; !(O >= i / 2); ++O) {
        var g = le[a + O * 2 >> 1];
        if (g == 0) break;
        h += String.fromCharCode(g);
      }
      return h;
    }, en = (a, i, l) => {
      if (l ?? (l = 2147483647), l < 2) return 0;
      l -= 2;
      for (var f = i, m = l < a.length * 2 ? l / 2 : a.length, h = 0; h < m; ++h) {
        var O = a.charCodeAt(h);
        le[i >> 1] = O, i += 2;
      }
      return le[i >> 1] = 0, i - f;
    }, tn = (a) => a.length * 2, rn = (a, i) => {
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
    }, nn = (a, i, l) => {
      if (l ?? (l = 2147483647), l < 4) return 0;
      for (var f = i, m = f + l - 4, h = 0; h < a.length; ++h) {
        var O = a.charCodeAt(h);
        if (O >= 55296 && O <= 57343) {
          var g = a.charCodeAt(++h);
          O = 65536 + ((O & 1023) << 10) | g & 1023;
        }
        if (Q[i >> 2] = O, i += 4, i + 4 > m) break;
      }
      return Q[i >> 2] = 0, i - f;
    }, on = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, i += 4;
      }
      return i;
    }, an = (a, i, l) => {
      l = W(l);
      var f, m, h, O;
      i === 2 ? (f = Qr, m = en, O = tn, h = (g) => pe[g >> 1]) : i === 4 && (f = rn, m = nn, O = on, h = (g) => $[g >> 2]), B(a, { name: l, fromWireType: (g) => {
        for (var P = $[g >> 2], A, T = g + 4, L = 0; L <= P; ++L) {
          var U = g + 4 + L * i;
          if (L == P || h(U) == 0) {
            var J = U - T, Z = f(T, J);
            A === void 0 ? A = Z : (A += "\0", A += Z), T = U + i;
          }
        }
        return q(g), A;
      }, toWireType: (g, P) => {
        typeof P != "string" && E(`Cannot pass non-string to C++ string type ${l}`);
        var A = O(P), T = We(4 + A + i);
        return $[T >> 2] = A / i, m(P, T + 4, A + i), g !== null && g.push(q, T), T;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(g) {
        q(g);
      } });
    }, sn = (a, i) => {
      i = W(i), B(a, { isVoid: !0, name: i, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, ln = () => {
      it = !1, bt = 0;
    }, cn = (a, i, l) => {
      var f = [], m = a.toWireType(f, l);
      return f.length && ($[i >> 2] = H.toHandle(f)), m;
    }, un = (a, i, l) => (a = H.toValue(a), i = $e(i, "emval::as"), cn(i, l, a)), dn = (a, i) => (a = H.toValue(a), i = H.toValue(i), H.toHandle(a[i])), fn = {}, pn = (a) => {
      var i = fn[a];
      return i === void 0 ? W(a) : i;
    }, mn = (a) => H.toHandle(pn(a)), yn = (a) => {
      var i = H.toValue(a);
      Le(i), Ne(a);
    }, gn = (a, i) => {
      a = $e(a, "_emval_take_value");
      var l = a.readValueFromPointer(i);
      return H.toHandle(l);
    }, he = {}, hn = () => performance.now(), vn = (a, i) => {
      if (he[a] && (clearTimeout(he[a].id), delete he[a]), !i) return 0;
      var l = setTimeout(() => {
        delete he[a], Pt(() => jn(a, hn()));
      }, i);
      return he[a] = { id: l, timeout_ms: i }, 0;
    }, bn = () => 2147483648, On = (a, i) => Math.ceil(a / i) * i, wn = (a) => {
      var i = R.buffer, l = (a - i.byteLength + 65535) / 65536 | 0;
      try {
        return R.grow(l), et(), 1;
      } catch {
      }
    }, Pn = (a) => {
      var i = z.length;
      a >>>= 0;
      var l = bn();
      if (a > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var m = i * (1 + 0.2 / f);
        m = Math.min(m, a + 100663296);
        var h = Math.min(l, On(Math.max(a, m), 65536)), O = wn(h);
        if (O)
          return !0;
      }
      return !1;
    };
    nr(), ue = t.BindingError = class extends Error {
      constructor(i) {
        super(i), this.name = "BindingError";
      }
    }, lt = t.InternalError = class extends Error {
      constructor(i) {
        super(i), this.name = "InternalError";
      }
    }, pr(), Pr(), yt = t.UnboundTypeError = Sr(Error, "UnboundTypeError"), Fr();
    var In = { i: tr, s: rr, n: ir, w: ar, f: Tr, d: Er, a: Rr, u: xr, l: $r, g: Wr, m: Vr, b: Gr, e: Br, c: Hr, v: Xr, h: an, x: sn, q: ln, j: un, y: Ne, k: dn, o: mn, A: yn, z: gn, r: vn, t: Pn, p: wt }, _ = await qt();
    _.C;
    var Cn = _.D, We = t._malloc = _.E, q = t._free = _.F, jn = _.G;
    t.dynCall_v = _.I, t.dynCall_ii = _.J, t.dynCall_vi = _.K, t.dynCall_i = _.L, t.dynCall_iii = _.M, t.dynCall_viii = _.N, t.dynCall_fii = _.O, t.dynCall_viif = _.P, t.dynCall_viiii = _.Q, t.dynCall_viiiiii = _.R, t.dynCall_iiiiii = _.S, t.dynCall_viiiii = _.T, t.dynCall_iiiiiii = _.U, t.dynCall_iiiiiiii = _.V, t.dynCall_viiiiiii = _.W, t.dynCall_viiiiiiiiidi = _.X, t.dynCall_viiiiiiiidi = _.Y, t.dynCall_viiiiiiiiii = _.Z, t.dynCall_viiiiiiiii = _._, t.dynCall_viiiiiiii = _.$, t.dynCall_iiiii = _.aa, t.dynCall_iiii = _.ba;
    var Sn = _.ca, Tn = _.da, kn = _.ea, Dn = _.fa;
    function Ue() {
      if (ie > 0) {
        me = Ue;
        return;
      }
      if (Wt(), ie > 0) {
        me = Ue;
        return;
      }
      function a() {
        var i;
        t.calledRun = !0, !N && (Ut(), e(t), (i = t.onRuntimeInitialized) == null || i.call(t), Vt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), a();
      }, 1)) : a();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return Ue(), r = o, r;
  };
})();
function _o(y, u) {
  return Math.sqrt((y.x - u.x) ** 2 + (y.y - u.y) ** 2);
}
function yi(y, u) {
  return {
    x: (y.x + u.x) / 2,
    y: (y.y + u.y) / 2
  };
}
function gi(y, u) {
  if (y.confidence <= 0 || u.confidence <= 0)
    return { x: 0, y: 0 };
  const r = _o(y.center, u.center), t = yi(y.center, u.center);
  return {
    x: t.x,
    y: t.y + r / 4
    // calculation is taken from mobile team
  };
}
function hi(y, u, r) {
  if (y.confidence <= 0 || u.confidence <= 0)
    return 0;
  const t = _o(y.center, u.center), e = ko(r.width, r.height);
  return Bn(t / e);
}
function Vn(y) {
  const { centerX: u, centerY: r, confidence: t, size: e, status: n } = y;
  return {
    center: {
      x: u,
      y: r
    },
    confidence: t / _t,
    status: n / _t,
    size: e
  };
}
function vi(y, u) {
  const { faceCenter: r, faceSize: t } = y, e = qo(t, u), n = {
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
  return Xo(n);
}
class bi extends Ko {
  getSamWasmFilePath(u, r) {
    return `${u}/face/wasm/${r}`;
  }
  fetchSamModule(u) {
    return mi(u);
  }
  parseRawData(u, r) {
    const { brightness: t, sharpness: e } = u.params, { bottomRightX: n, bottomRightY: o, leftEye: d, mouth: c, rightEye: w, topLeftX: D, topLeftY: b } = u, I = Vn(d), S = Vn(w), k = Vn(c);
    return {
      confidence: u.confidence / _t,
      topLeft: {
        x: D,
        y: b
      },
      bottomRight: {
        x: n,
        y: o
      },
      faceCenter: gi(I, S),
      faceSize: hi(I, S, r),
      leftEye: I,
      rightEye: S,
      mouth: k,
      brightness: t / _t,
      sharpness: e / _t
    };
  }
  async detect(u, r, t) {
    if (!this.samWasmModule)
      throw new fe("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(u, r), n = this.samWasmModule.detectFacePartsWithImageParameters(
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
  async getOptimalRegionForCompressionDetection(u, r, t) {
    const e = vi(t, r);
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(u, r, e);
  }
}
var Oi = (() => {
  var y = import.meta.url;
  return async function(u = {}) {
    var r, t = u, e, n, o = new Promise((a, i) => {
      e = a, n = i;
    }), d = typeof window == "object", c = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var w = Object.assign({}, t), D = (a, i) => {
      throw i;
    }, b = "";
    function I(a) {
      return t.locateFile ? t.locateFile(a, b) : b + a;
    }
    var S, k;
    (d || c) && (c ? b = self.location.href : typeof document < "u" && document.currentScript && (b = document.currentScript.src), y && (b = y), b.startsWith("blob:") ? b = "" : b = b.slice(0, b.replace(/[?#].*/, "").lastIndexOf("/") + 1), c && (k = (a) => {
      var i = new XMLHttpRequest();
      return i.open("GET", a, !1), i.responseType = "arraybuffer", i.send(null), new Uint8Array(i.response);
    }), S = async (a) => {
      if (Qe(a))
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
    var F = t.printErr || console.error.bind(console);
    Object.assign(t, w), w = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var C = t.wasmBinary, R, N = !1, se, X, z, le, pe, Q, $, Ze, Ke, qe, Xe, Qe = (a) => a.startsWith("file://");
    function et() {
      var a = R.buffer;
      t.HEAP8 = X = new Int8Array(a), t.HEAP16 = le = new Int16Array(a), t.HEAPU8 = z = new Uint8Array(a), t.HEAPU16 = pe = new Uint16Array(a), t.HEAP32 = Q = new Int32Array(a), t.HEAPU32 = $ = new Uint32Array(a), t.HEAPF32 = Ze = new Float32Array(a), t.HEAPF64 = Xe = new Float64Array(a), t.HEAP64 = Ke = new BigInt64Array(a), t.HEAPU64 = qe = new BigUint64Array(a);
    }
    function Wt() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Qt(t.preRun.shift());
      rt(ot);
    }
    function Ut() {
      _.C();
    }
    function Vt() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Xt(t.postRun.shift());
      rt(nt);
    }
    var ie = 0, me = null;
    function zt(a) {
      var i;
      ie++, (i = t.monitorRunDependencies) == null || i.call(t, ie);
    }
    function Gt(a) {
      var l;
      if (ie--, (l = t.monitorRunDependencies) == null || l.call(t, ie), ie == 0 && me) {
        var i = me;
        me = null, i();
      }
    }
    function be(a) {
      var l;
      (l = t.onAbort) == null || l.call(t, a), a = "Aborted(" + a + ")", F(a), N = !0, a += ". Build with -sASSERTIONS for more info.";
      var i = new WebAssembly.RuntimeError(a);
      throw n(i), i;
    }
    var Ee;
    function Bt() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Ht(a) {
      if (a == Ee && C)
        return new Uint8Array(C);
      if (k)
        return k(a);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Yt(a) {
      if (!C)
        try {
          var i = await S(a);
          return new Uint8Array(i);
        } catch {
        }
      return Ht(a);
    }
    async function Jt(a, i) {
      try {
        var l = await Yt(a), f = await WebAssembly.instantiate(l, i);
        return f;
      } catch (m) {
        F(`failed to asynchronously prepare wasm: ${m}`), be(m);
      }
    }
    async function Zt(a, i, l) {
      if (!a && typeof WebAssembly.instantiateStreaming == "function" && !Qe(i))
        try {
          var f = fetch(i, { credentials: "same-origin" }), m = await WebAssembly.instantiateStreaming(f, l);
          return m;
        } catch (h) {
          F(`wasm streaming compile failed: ${h}`), F("falling back to ArrayBuffer instantiation");
        }
      return Jt(i, l);
    }
    function Kt() {
      return { a: In };
    }
    async function qt() {
      function a(h, O) {
        return _ = h.exports, _ = j.instrumentWasmExports(_), R = _.B, et(), _.H, Gt(), _;
      }
      zt();
      function i(h) {
        return a(h.instance);
      }
      var l = Kt();
      if (t.instantiateWasm)
        return new Promise((h, O) => {
          t.instantiateWasm(l, (g, P) => {
            a(g), h(g.exports);
          });
        });
      Ee ?? (Ee = Bt());
      try {
        var f = await Zt(C, Ee, l), m = i(f);
        return m;
      } catch (h) {
        return n(h), Promise.reject(h);
      }
    }
    class tt {
      constructor(i) {
        At(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${i})`, this.status = i;
      }
    }
    var rt = (a) => {
      for (; a.length > 0; )
        a.shift()(t);
    }, nt = [], Xt = (a) => nt.unshift(a), ot = [], Qt = (a) => ot.unshift(a), it = t.noExitRuntime || !0;
    class er {
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
    var at = 0, tr = (a, i, l) => {
      var f = new er(a);
      throw f.init(i, l), at = a, at;
    }, rr = () => be(""), Oe = (a) => {
      if (a === null)
        return "null";
      var i = typeof a;
      return i === "object" || i === "array" || i === "function" ? a.toString() : "" + a;
    }, nr = () => {
      for (var a = new Array(256), i = 0; i < 256; ++i)
        a[i] = String.fromCharCode(i);
      st = a;
    }, st, W = (a) => {
      for (var i = "", l = a; z[l]; )
        i += st[z[l++]];
      return i;
    }, ce = {}, ae = {}, we = {}, ue, E = (a) => {
      throw new ue(a);
    }, lt, Pe = (a) => {
      throw new lt(a);
    }, de = (a, i, l) => {
      a.forEach((g) => we[g] = i);
      function f(g) {
        var P = l(g);
        P.length !== a.length && Pe("Mismatched type converter count");
        for (var A = 0; A < a.length; ++A)
          B(a[A], P[A]);
      }
      var m = new Array(i.length), h = [], O = 0;
      i.forEach((g, P) => {
        ae.hasOwnProperty(g) ? m[P] = ae[g] : (h.push(g), ce.hasOwnProperty(g) || (ce[g] = []), ce[g].push(() => {
          m[P] = ae[g], ++O, O === h.length && f(m);
        }));
      }), h.length === 0 && f(m);
    };
    function or(a, i, l = {}) {
      var f = i.name;
      if (a || E(`type "${f}" must have a positive integer typeid pointer`), ae.hasOwnProperty(a)) {
        if (l.ignoreDuplicateRegistrations)
          return;
        E(`Cannot register type '${f}' twice`);
      }
      if (ae[a] = i, delete we[a], ce.hasOwnProperty(a)) {
        var m = ce[a];
        delete ce[a], m.forEach((h) => h());
      }
    }
    function B(a, i, l = {}) {
      return or(a, i, l);
    }
    var ct = (a, i, l) => {
      switch (i) {
        case 1:
          return l ? (f) => X[f] : (f) => z[f];
        case 2:
          return l ? (f) => le[f >> 1] : (f) => pe[f >> 1];
        case 4:
          return l ? (f) => Q[f >> 2] : (f) => $[f >> 2];
        case 8:
          return l ? (f) => Ke[f >> 3] : (f) => qe[f >> 3];
        default:
          throw new TypeError(`invalid integer width (${i}): ${a}`);
      }
    }, ir = (a, i, l, f, m) => {
      i = W(i);
      var h = i.indexOf("u") != -1;
      B(a, { name: i, fromWireType: (O) => O, toWireType: function(O, g) {
        if (typeof g != "bigint" && typeof g != "number")
          throw new TypeError(`Cannot convert "${Oe(g)}" to ${this.name}`);
        return typeof g == "number" && (g = BigInt(g)), g;
      }, argPackAdvance: Y, readValueFromPointer: ct(i, l, !h), destructorFunction: null });
    }, Y = 8, ar = (a, i, l, f) => {
      i = W(i), B(a, { name: i, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, h) {
        return h ? l : f;
      }, argPackAdvance: Y, readValueFromPointer: function(m) {
        return this.fromWireType(z[m]);
      }, destructorFunction: null });
    }, sr = (a) => ({ count: a.count, deleteScheduled: a.deleteScheduled, preservePointerOnDelete: a.preservePointerOnDelete, ptr: a.ptr, ptrType: a.ptrType, smartPtr: a.smartPtr, smartPtrType: a.smartPtrType }), Re = (a) => {
      function i(l) {
        return l.$$.ptrType.registeredClass.name;
      }
      E(i(a) + " instance already deleted");
    }, Me = !1, ut = (a) => {
    }, lr = (a) => {
      a.smartPtr ? a.smartPtrType.rawDestructor(a.smartPtr) : a.ptrType.registeredClass.rawDestructor(a.ptr);
    }, dt = (a) => {
      a.count.value -= 1;
      var i = a.count.value === 0;
      i && lr(a);
    }, ft = (a, i, l) => {
      if (i === l)
        return a;
      if (l.baseClass === void 0)
        return null;
      var f = ft(a, i, l.baseClass);
      return f === null ? null : l.downcast(f);
    }, pt = {}, cr = {}, ur = (a, i) => {
      for (i === void 0 && E("ptr should not be undefined"); a.baseClass; )
        i = a.upcast(i), a = a.baseClass;
      return i;
    }, dr = (a, i) => (i = ur(a, i), cr[i]), Ie = (a, i) => {
      (!i.ptrType || !i.ptr) && Pe("makeClassHandle requires ptr and ptrType");
      var l = !!i.smartPtrType, f = !!i.smartPtr;
      return l !== f && Pe("Both smartPtrType and smartPtr must be specified"), i.count = { value: 1 }, ye(Object.create(a, { $$: { value: i, writable: !0 } }));
    };
    function fr(a) {
      var i = this.getPointee(a);
      if (!i)
        return this.destructor(a), null;
      var l = dr(this.registeredClass, i);
      if (l !== void 0) {
        if (l.$$.count.value === 0)
          return l.$$.ptr = i, l.$$.smartPtr = a, l.clone();
        var f = l.clone();
        return this.destructor(a), f;
      }
      function m() {
        return this.isSmartPointer ? Ie(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: i, smartPtrType: this, smartPtr: a }) : Ie(this.registeredClass.instancePrototype, { ptrType: this, ptr: a });
      }
      var h = this.registeredClass.getActualType(i), O = pt[h];
      if (!O)
        return m.call(this);
      var g;
      this.isConst ? g = O.constPointerType : g = O.pointerType;
      var P = ft(i, this.registeredClass, g.registeredClass);
      return P === null ? m.call(this) : this.isSmartPointer ? Ie(g.registeredClass.instancePrototype, { ptrType: g, ptr: P, smartPtrType: this, smartPtr: a }) : Ie(g.registeredClass.instancePrototype, { ptrType: g, ptr: P });
    }
    var ye = (a) => typeof FinalizationRegistry > "u" ? (ye = (i) => i, a) : (Me = new FinalizationRegistry((i) => {
      dt(i.$$);
    }), ye = (i) => {
      var l = i.$$, f = !!l.smartPtr;
      if (f) {
        var m = { $$: l };
        Me.register(i, m, i);
      }
      return i;
    }, ut = (i) => Me.unregister(i), ye(a)), pr = () => {
      Object.assign(Ce.prototype, { isAliasOf(a) {
        if (!(this instanceof Ce) || !(a instanceof Ce))
          return !1;
        var i = this.$$.ptrType.registeredClass, l = this.$$.ptr;
        a.$$ = a.$$;
        for (var f = a.$$.ptrType.registeredClass, m = a.$$.ptr; i.baseClass; )
          l = i.upcast(l), i = i.baseClass;
        for (; f.baseClass; )
          m = f.upcast(m), f = f.baseClass;
        return i === f && l === m;
      }, clone() {
        if (this.$$.ptr || Re(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var a = ye(Object.create(Object.getPrototypeOf(this), { $$: { value: sr(this.$$) } }));
        return a.$$.count.value += 1, a.$$.deleteScheduled = !1, a;
      }, delete() {
        this.$$.ptr || Re(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), ut(this), dt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Re(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && E("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ce() {
    }
    var je = (a, i) => Object.defineProperty(i, "name", { value: a }), mr = (a, i, l) => {
      if (a[i].overloadTable === void 0) {
        var f = a[i];
        a[i] = function(...m) {
          return a[i].overloadTable.hasOwnProperty(m.length) || E(`Function '${l}' called with an invalid number of arguments (${m.length}) - expects one of (${a[i].overloadTable})!`), a[i].overloadTable[m.length].apply(this, m);
        }, a[i].overloadTable = [], a[i].overloadTable[f.argCount] = f;
      }
    }, Fe = (a, i, l) => {
      t.hasOwnProperty(a) ? ((l === void 0 || t[a].overloadTable !== void 0 && t[a].overloadTable[l] !== void 0) && E(`Cannot register public name '${a}' twice`), mr(t, a, a), t[a].overloadTable.hasOwnProperty(l) && E(`Cannot register multiple overloads of a function with the same number of arguments (${l})!`), t[a].overloadTable[l] = i) : (t[a] = i, t[a].argCount = l);
    }, yr = 48, gr = 57, hr = (a) => {
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var i = a.charCodeAt(0);
      return i >= yr && i <= gr ? `_${a}` : a;
    };
    function vr(a, i, l, f, m, h, O, g) {
      this.name = a, this.constructor = i, this.instancePrototype = l, this.rawDestructor = f, this.baseClass = m, this.getActualType = h, this.upcast = O, this.downcast = g, this.pureVirtualFunctions = [];
    }
    var Se = (a, i, l) => {
      for (; i !== l; )
        i.upcast || E(`Expected null or instance of ${l.name}, got an instance of ${i.name}`), a = i.upcast(a), i = i.baseClass;
      return a;
    };
    function br(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${Oe(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Se(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Or(a, i) {
      var l;
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), this.isSmartPointer ? (l = this.rawConstructor(), a !== null && a.push(this.rawDestructor, l), l) : 0;
      (!i || !i.$$) && E(`Cannot pass "${Oe(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.smartPtrType ? i.$$.smartPtrType.name : i.$$.ptrType.name} to parameter type ${this.name}`);
      var f = i.$$.ptrType.registeredClass;
      if (l = Se(i.$$.ptr, f, this.registeredClass), this.isSmartPointer)
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
              l = this.rawShare(l, H.toHandle(() => m.delete())), a !== null && a.push(this.rawDestructor, l);
            }
            break;
          default:
            E("Unsupporting sharing policy");
        }
      return l;
    }
    function wr(a, i) {
      if (i === null)
        return this.isReference && E(`null is not a valid ${this.name}`), 0;
      i.$$ || E(`Cannot pass "${Oe(i)}" as a ${this.name}`), i.$$.ptr || E(`Cannot pass deleted object as a pointer of type ${this.name}`), i.$$.ptrType.isConst && E(`Cannot convert argument of type ${i.$$.ptrType.name} to parameter type ${this.name}`);
      var l = i.$$.ptrType.registeredClass, f = Se(i.$$.ptr, l, this.registeredClass);
      return f;
    }
    function Te(a) {
      return this.fromWireType($[a >> 2]);
    }
    var Pr = () => {
      Object.assign(ke.prototype, { getPointee(a) {
        return this.rawGetPointee && (a = this.rawGetPointee(a)), a;
      }, destructor(a) {
        var i;
        (i = this.rawDestructor) == null || i.call(this, a);
      }, argPackAdvance: Y, readValueFromPointer: Te, fromWireType: fr });
    };
    function ke(a, i, l, f, m, h, O, g, P, A, T) {
      this.name = a, this.registeredClass = i, this.isReference = l, this.isConst = f, this.isSmartPointer = m, this.pointeeType = h, this.sharingPolicy = O, this.rawGetPointee = g, this.rawConstructor = P, this.rawShare = A, this.rawDestructor = T, !m && i.baseClass === void 0 ? f ? (this.toWireType = br, this.destructorFunction = null) : (this.toWireType = wr, this.destructorFunction = null) : this.toWireType = Or;
    }
    var mt = (a, i, l) => {
      t.hasOwnProperty(a) || Pe("Replacing nonexistent public symbol"), t[a].overloadTable !== void 0 && l !== void 0 ? t[a].overloadTable[l] = i : (t[a] = i, t[a].argCount = l);
    }, Ir = (a, i, l) => {
      a = a.replace(/p/g, "i");
      var f = t["dynCall_" + a];
      return f(i, ...l);
    }, Cr = (a, i, l = []) => {
      var f = Ir(a, i, l);
      return f;
    }, jr = (a, i) => (...l) => Cr(a, i, l), ee = (a, i) => {
      a = W(a);
      function l() {
        return jr(a, i);
      }
      var f = l();
      return typeof f != "function" && E(`unknown function pointer with signature ${a}: ${i}`), f;
    }, Sr = (a, i) => {
      var l = je(i, function(f) {
        this.name = i, this.message = f;
        var m = new Error(f).stack;
        m !== void 0 && (this.stack = this.toString() + `
` + m.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return l.prototype = Object.create(a.prototype), l.prototype.constructor = l, l.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, l;
    }, yt, gt = (a) => {
      var i = Cn(a), l = W(i);
      return q(i), l;
    }, ge = (a, i) => {
      var l = [], f = {};
      function m(h) {
        if (!f[h] && !ae[h]) {
          if (we[h]) {
            we[h].forEach(m);
            return;
          }
          l.push(h), f[h] = !0;
        }
      }
      throw i.forEach(m), new yt(`${a}: ` + l.map(gt).join([", "]));
    }, Tr = (a, i, l, f, m, h, O, g, P, A, T, L, U) => {
      T = W(T), h = ee(m, h), g && (g = ee(O, g)), A && (A = ee(P, A)), U = ee(L, U);
      var J = hr(T);
      Fe(J, function() {
        ge(`Cannot construct ${T} due to unbound types`, [f]);
      }), de([a, i, l], f ? [f] : [], (Z) => {
        var kt;
        Z = Z[0];
        var re, G;
        f ? (re = Z.registeredClass, G = re.instancePrototype) : G = Ce.prototype;
        var K = je(T, function(...Ve) {
          if (Object.getPrototypeOf(this) !== ne)
            throw new ue("Use 'new' to construct " + T);
          if (V.constructor_body === void 0)
            throw new ue(T + " has no accessible constructor");
          var Dt = V.constructor_body[Ve.length];
          if (Dt === void 0)
            throw new ue(`Tried to invoke ctor of ${T} with invalid number of parameters (${Ve.length}) - expected (${Object.keys(V.constructor_body).toString()}) parameters instead!`);
          return Dt.apply(this, Ve);
        }), ne = Object.create(G, { constructor: { value: K } });
        K.prototype = ne;
        var V = new vr(T, K, ne, U, re, h, g, A);
        V.baseClass && ((kt = V.baseClass).__derivedClasses ?? (kt.__derivedClasses = []), V.baseClass.__derivedClasses.push(V));
        var oe = new ke(T, V, !0, !1, !1), Ae = new ke(T + "*", V, !1, !1, !1), Tt = new ke(T + " const*", V, !1, !0, !1);
        return pt[a] = { pointerType: Ae, constPointerType: Tt }, mt(J, K), [oe, Ae, Tt];
      });
    }, ht = (a, i) => {
      for (var l = [], f = 0; f < a; f++)
        l.push($[i + f * 4 >> 2]);
      return l;
    }, Le = (a) => {
      for (; a.length; ) {
        var i = a.pop(), l = a.pop();
        l(i);
      }
    };
    function kr(a) {
      for (var i = 1; i < a.length; ++i)
        if (a[i] !== null && a[i].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var De = (a) => {
      try {
        return a();
      } catch (i) {
        be(i);
      }
    }, vt = (a) => {
      if (a instanceof tt || a == "unwind")
        return se;
      D(1, a);
    }, bt = 0, Ot = () => it || bt > 0, wt = (a) => {
      var i;
      se = a, Ot() || ((i = t.onExit) == null || i.call(t, a), N = !0), D(a, new tt(a));
    }, Dr = (a, i) => {
      se = a, wt(a);
    }, Ar = Dr, _r = () => {
      if (!Ot())
        try {
          Ar(se);
        } catch (a) {
          vt(a);
        }
    }, Pt = (a) => {
      if (!N)
        try {
          a(), _r();
        } catch (i) {
          vt(i);
        }
    }, j = { instrumentWasmImports(a) {
      var i = /^(__asyncjs__.*)$/;
      for (let [l, f] of Object.entries(a))
        typeof f == "function" && (f.isAsync || i.test(l));
    }, instrumentWasmExports(a) {
      var i = {};
      for (let [l, f] of Object.entries(a))
        typeof f == "function" ? i[l] = (...m) => {
          j.exportCallStack.push(l);
          try {
            return f(...m);
          } finally {
            N || (j.exportCallStack.pop(), j.maybeStopUnwind());
          }
        } : i[l] = f;
      return i;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(a) {
      var i = j.callStackNameToId[a];
      return i === void 0 && (i = j.callStackId++, j.callStackNameToId[a] = i, j.callStackIdToName[i] = a), i;
    }, maybeStopUnwind() {
      j.currData && j.state === j.State.Unwinding && j.exportCallStack.length === 0 && (j.state = j.State.Normal, De(Tn), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((a, i) => {
        j.asyncPromiseHandlers = { resolve: a, reject: i };
      });
    }, allocateData() {
      var a = We(12 + j.StackSize);
      return j.setDataHeader(a, a + 12, j.StackSize), j.setDataRewindFunc(a), a;
    }, setDataHeader(a, i, l) {
      $[a >> 2] = i, $[a + 4 >> 2] = i + l;
    }, setDataRewindFunc(a) {
      var i = j.exportCallStack[0], l = j.getCallStackId(i);
      Q[a + 8 >> 2] = l;
    }, getDataRewindFuncName(a) {
      var i = Q[a + 8 >> 2], l = j.callStackIdToName[i];
      return l;
    }, getDataRewindFunc(a) {
      var i = _[a];
      return i;
    }, doRewind(a) {
      var i = j.getDataRewindFuncName(a), l = j.getDataRewindFunc(i);
      return l();
    }, handleSleep(a) {
      if (!N) {
        if (j.state === j.State.Normal) {
          var i = !1, l = !1;
          a((f = 0) => {
            if (!N && (j.handleSleepReturnValue = f, i = !0, !!l)) {
              j.state = j.State.Rewinding, De(() => kn(j.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var m, h = !1;
              try {
                m = j.doRewind(j.currData);
              } catch (P) {
                m = P, h = !0;
              }
              var O = !1;
              if (!j.currData) {
                var g = j.asyncPromiseHandlers;
                g && (j.asyncPromiseHandlers = null, (h ? g.reject : g.resolve)(m), O = !0);
              }
              if (h && !O)
                throw m;
            }
          }), l = !0, i || (j.state = j.State.Unwinding, j.currData = j.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), De(() => Sn(j.currData)));
        } else j.state === j.State.Rewinding ? (j.state = j.State.Normal, De(Dn), q(j.currData), j.currData = null, j.sleepCallbacks.forEach(Pt)) : be(`invalid state: ${j.state}`);
        return j.handleSleepReturnValue;
      }
    }, handleAsync(a) {
      return j.handleSleep((i) => {
        a().then(i);
      });
    } };
    function It(a, i, l, f, m, h) {
      var O = i.length;
      O < 2 && E("argTypes array size mismatch! Must at least get return value and 'this' types!"), i[1];
      var g = kr(i), P = i[0].name !== "void", A = O - 2, T = new Array(A), L = [], U = [], J = function(...Z) {
        U.length = 0;
        var re;
        L.length = 1, L[0] = m;
        for (var G = 0; G < A; ++G)
          T[G] = i[G + 2].toWireType(U, Z[G]), L.push(T[G]);
        var K = f(...L);
        function ne(V) {
          if (g)
            Le(U);
          else
            for (var oe = 2; oe < i.length; oe++) {
              var Ae = oe === 1 ? re : T[oe - 2];
              i[oe].destructorFunction !== null && i[oe].destructorFunction(Ae);
            }
          if (P)
            return i[0].fromWireType(V);
        }
        return j.currData ? j.whenDone().then(ne) : ne(K);
      };
      return je(a, J);
    }
    var Er = (a, i, l, f, m, h) => {
      var O = ht(i, l);
      m = ee(f, m), de([], [a], (g) => {
        g = g[0];
        var P = `constructor ${g.name}`;
        if (g.registeredClass.constructor_body === void 0 && (g.registeredClass.constructor_body = []), g.registeredClass.constructor_body[i - 1] !== void 0)
          throw new ue(`Cannot register multiple constructors with identical number of parameters (${i - 1}) for class '${g.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return g.registeredClass.constructor_body[i - 1] = () => {
          ge(`Cannot construct ${g.name} due to unbound types`, O);
        }, de([], O, (A) => (A.splice(1, 0, null), g.registeredClass.constructor_body[i - 1] = It(P, A, null, m, h), [])), [];
      });
    }, Ct = (a, i, l) => (a instanceof Object || E(`${l} with invalid "this": ${a}`), a instanceof i.registeredClass.constructor || E(`${l} incompatible with "this" of type ${a.constructor.name}`), a.$$.ptr || E(`cannot call emscripten binding method ${l} on deleted object`), Se(a.$$.ptr, a.$$.ptrType.registeredClass, i.registeredClass)), Rr = (a, i, l, f, m, h, O, g, P, A) => {
      i = W(i), m = ee(f, m), de([], [a], (T) => {
        T = T[0];
        var L = `${T.name}.${i}`, U = { get() {
          ge(`Cannot access ${L} due to unbound types`, [l, O]);
        }, enumerable: !0, configurable: !0 };
        return P ? U.set = () => ge(`Cannot access ${L} due to unbound types`, [l, O]) : U.set = (J) => E(L + " is a read-only property"), Object.defineProperty(T.registeredClass.instancePrototype, i, U), de([], P ? [l, O] : [l], (J) => {
          var Z = J[0], re = { get() {
            var K = Ct(this, T, L + " getter");
            return Z.fromWireType(m(h, K));
          }, enumerable: !0 };
          if (P) {
            P = ee(g, P);
            var G = J[1];
            re.set = function(K) {
              var ne = Ct(this, T, L + " setter"), V = [];
              P(A, ne, G.toWireType(V, K)), Le(V);
            };
          }
          return Object.defineProperty(T.registeredClass.instancePrototype, i, re), [];
        }), [];
      });
    }, xe = [], te = [], Ne = (a) => {
      a > 9 && --te[a + 1] === 0 && (te[a] = void 0, xe.push(a));
    }, Mr = () => te.length / 2 - 5 - xe.length, Fr = () => {
      te.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Mr;
    }, H = { toValue: (a) => (a || E("Cannot use deleted val. handle = " + a), te[a]), toHandle: (a) => {
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
          const i = xe.pop() || te.length;
          return te[i] = a, te[i + 1] = 1, i;
        }
      }
    } }, Lr = { name: "emscripten::val", fromWireType: (a) => {
      var i = H.toValue(a);
      return Ne(a), i;
    }, toWireType: (a, i) => H.toHandle(i), argPackAdvance: Y, readValueFromPointer: Te, destructorFunction: null }, xr = (a) => B(a, Lr), Nr = (a, i, l) => {
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
    }, $r = (a, i, l, f) => {
      i = W(i);
      function m() {
      }
      m.values = {}, B(a, { name: i, constructor: m, fromWireType: function(h) {
        return this.constructor.values[h];
      }, toWireType: (h, O) => O.value, argPackAdvance: Y, readValueFromPointer: Nr(i, l, f), destructorFunction: null }), Fe(i, m);
    }, $e = (a, i) => {
      var l = ae[a];
      return l === void 0 && E(`${i} has unknown type ${gt(a)}`), l;
    }, Wr = (a, i, l) => {
      var f = $e(a, "enum");
      i = W(i);
      var m = f.constructor, h = Object.create(f.constructor.prototype, { value: { value: l }, constructor: { value: je(`${f.name}_${i}`, function() {
      }) } });
      m.values[l] = h, m[i] = h;
    }, Ur = (a, i) => {
      switch (i) {
        case 4:
          return function(l) {
            return this.fromWireType(Ze[l >> 2]);
          };
        case 8:
          return function(l) {
            return this.fromWireType(Xe[l >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${i}): ${a}`);
      }
    }, Vr = (a, i, l) => {
      i = W(i), B(a, { name: i, fromWireType: (f) => f, toWireType: (f, m) => m, argPackAdvance: Y, readValueFromPointer: Ur(i, l), destructorFunction: null });
    }, zr = (a) => {
      a = a.trim();
      const i = a.indexOf("(");
      return i === -1 ? a : a.slice(0, i);
    }, Gr = (a, i, l, f, m, h, O, g) => {
      var P = ht(i, l);
      a = W(a), a = zr(a), m = ee(f, m), Fe(a, function() {
        ge(`Cannot call ${a} due to unbound types`, P);
      }, i - 1), de([], P, (A) => {
        var T = [A[0], null].concat(A.slice(1));
        return mt(a, It(a, T, null, m, h), i - 1), [];
      });
    }, Br = (a, i, l, f, m) => {
      i = W(i);
      var h = (T) => T;
      if (f === 0) {
        var O = 32 - 8 * l;
        h = (T) => T << O >>> O;
      }
      var g = i.includes("unsigned"), P = (T, L) => {
      }, A;
      g ? A = function(T, L) {
        return P(L, this.name), L >>> 0;
      } : A = function(T, L) {
        return P(L, this.name), L;
      }, B(a, { name: i, fromWireType: h, toWireType: A, argPackAdvance: Y, readValueFromPointer: ct(i, l, f !== 0), destructorFunction: null });
    }, Hr = (a, i, l) => {
      var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], m = f[i];
      function h(O) {
        var g = $[O >> 2], P = $[O + 4 >> 2];
        return new m(X.buffer, P, g);
      }
      l = W(l), B(a, { name: l, fromWireType: h, argPackAdvance: Y, readValueFromPointer: h }, { ignoreDuplicateRegistrations: !0 });
    }, Yr = (a, i, l, f) => {
      if (!(f > 0)) return 0;
      for (var m = l, h = l + f - 1, O = 0; O < a.length; ++O) {
        var g = a.charCodeAt(O);
        if (g >= 55296 && g <= 57343) {
          var P = a.charCodeAt(++O);
          g = 65536 + ((g & 1023) << 10) | P & 1023;
        }
        if (g <= 127) {
          if (l >= h) break;
          i[l++] = g;
        } else if (g <= 2047) {
          if (l + 1 >= h) break;
          i[l++] = 192 | g >> 6, i[l++] = 128 | g & 63;
        } else if (g <= 65535) {
          if (l + 2 >= h) break;
          i[l++] = 224 | g >> 12, i[l++] = 128 | g >> 6 & 63, i[l++] = 128 | g & 63;
        } else {
          if (l + 3 >= h) break;
          i[l++] = 240 | g >> 18, i[l++] = 128 | g >> 12 & 63, i[l++] = 128 | g >> 6 & 63, i[l++] = 128 | g & 63;
        }
      }
      return i[l] = 0, l - m;
    }, Jr = (a, i, l) => Yr(a, z, i, l), Zr = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f <= 127 ? i++ : f <= 2047 ? i += 2 : f >= 55296 && f <= 57343 ? (i += 4, ++l) : i += 3;
      }
      return i;
    }, jt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Kr = (a, i = 0, l = NaN) => {
      for (var f = i + l, m = i; a[m] && !(m >= f); ) ++m;
      if (m - i > 16 && a.buffer && jt)
        return jt.decode(a.subarray(i, m));
      for (var h = ""; i < m; ) {
        var O = a[i++];
        if (!(O & 128)) {
          h += String.fromCharCode(O);
          continue;
        }
        var g = a[i++] & 63;
        if ((O & 224) == 192) {
          h += String.fromCharCode((O & 31) << 6 | g);
          continue;
        }
        var P = a[i++] & 63;
        if ((O & 240) == 224 ? O = (O & 15) << 12 | g << 6 | P : O = (O & 7) << 18 | g << 12 | P << 6 | a[i++] & 63, O < 65536)
          h += String.fromCharCode(O);
        else {
          var A = O - 65536;
          h += String.fromCharCode(55296 | A >> 10, 56320 | A & 1023);
        }
      }
      return h;
    }, qr = (a, i) => a ? Kr(z, a, i) : "", Xr = (a, i) => {
      i = W(i), B(a, { name: i, fromWireType(l) {
        for (var f = $[l >> 2], m = l + 4, h, O, g = m, O = 0; O <= f; ++O) {
          var P = m + O;
          if (O == f || z[P] == 0) {
            var A = P - g, T = qr(g, A);
            h === void 0 ? h = T : (h += "\0", h += T), g = P + 1;
          }
        }
        return q(l), h;
      }, toWireType(l, f) {
        f instanceof ArrayBuffer && (f = new Uint8Array(f));
        var m, h = typeof f == "string";
        h || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array || E("Cannot pass non-string to std::string"), h ? m = Zr(f) : m = f.length;
        var O = We(4 + m + 1), g = O + 4;
        if ($[O >> 2] = m, h)
          Jr(f, g, m + 1);
        else if (h)
          for (var P = 0; P < m; ++P) {
            var A = f.charCodeAt(P);
            A > 255 && (q(O), E("String has UTF-16 code units that do not fit in 8 bits")), z[g + P] = A;
          }
        else
          for (var P = 0; P < m; ++P)
            z[g + P] = f[P];
        return l !== null && l.push(q, O), O;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(l) {
        q(l);
      } });
    }, St = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Qr = (a, i) => {
      for (var l = a, f = l >> 1, m = f + i / 2; !(f >= m) && pe[f]; ) ++f;
      if (l = f << 1, l - a > 32 && St) return St.decode(z.subarray(a, l));
      for (var h = "", O = 0; !(O >= i / 2); ++O) {
        var g = le[a + O * 2 >> 1];
        if (g == 0) break;
        h += String.fromCharCode(g);
      }
      return h;
    }, en = (a, i, l) => {
      if (l ?? (l = 2147483647), l < 2) return 0;
      l -= 2;
      for (var f = i, m = l < a.length * 2 ? l / 2 : a.length, h = 0; h < m; ++h) {
        var O = a.charCodeAt(h);
        le[i >> 1] = O, i += 2;
      }
      return le[i >> 1] = 0, i - f;
    }, tn = (a) => a.length * 2, rn = (a, i) => {
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
    }, nn = (a, i, l) => {
      if (l ?? (l = 2147483647), l < 4) return 0;
      for (var f = i, m = f + l - 4, h = 0; h < a.length; ++h) {
        var O = a.charCodeAt(h);
        if (O >= 55296 && O <= 57343) {
          var g = a.charCodeAt(++h);
          O = 65536 + ((O & 1023) << 10) | g & 1023;
        }
        if (Q[i >> 2] = O, i += 4, i + 4 > m) break;
      }
      return Q[i >> 2] = 0, i - f;
    }, on = (a) => {
      for (var i = 0, l = 0; l < a.length; ++l) {
        var f = a.charCodeAt(l);
        f >= 55296 && f <= 57343 && ++l, i += 4;
      }
      return i;
    }, an = (a, i, l) => {
      l = W(l);
      var f, m, h, O;
      i === 2 ? (f = Qr, m = en, O = tn, h = (g) => pe[g >> 1]) : i === 4 && (f = rn, m = nn, O = on, h = (g) => $[g >> 2]), B(a, { name: l, fromWireType: (g) => {
        for (var P = $[g >> 2], A, T = g + 4, L = 0; L <= P; ++L) {
          var U = g + 4 + L * i;
          if (L == P || h(U) == 0) {
            var J = U - T, Z = f(T, J);
            A === void 0 ? A = Z : (A += "\0", A += Z), T = U + i;
          }
        }
        return q(g), A;
      }, toWireType: (g, P) => {
        typeof P != "string" && E(`Cannot pass non-string to C++ string type ${l}`);
        var A = O(P), T = We(4 + A + i);
        return $[T >> 2] = A / i, m(P, T + 4, A + i), g !== null && g.push(q, T), T;
      }, argPackAdvance: Y, readValueFromPointer: Te, destructorFunction(g) {
        q(g);
      } });
    }, sn = (a, i) => {
      i = W(i), B(a, { isVoid: !0, name: i, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (l, f) => {
      } });
    }, ln = () => {
      it = !1, bt = 0;
    }, cn = (a, i, l) => {
      var f = [], m = a.toWireType(f, l);
      return f.length && ($[i >> 2] = H.toHandle(f)), m;
    }, un = (a, i, l) => (a = H.toValue(a), i = $e(i, "emval::as"), cn(i, l, a)), dn = (a, i) => (a = H.toValue(a), i = H.toValue(i), H.toHandle(a[i])), fn = {}, pn = (a) => {
      var i = fn[a];
      return i === void 0 ? W(a) : i;
    }, mn = (a) => H.toHandle(pn(a)), yn = (a) => {
      var i = H.toValue(a);
      Le(i), Ne(a);
    }, gn = (a, i) => {
      a = $e(a, "_emval_take_value");
      var l = a.readValueFromPointer(i);
      return H.toHandle(l);
    }, he = {}, hn = () => performance.now(), vn = (a, i) => {
      if (he[a] && (clearTimeout(he[a].id), delete he[a]), !i) return 0;
      var l = setTimeout(() => {
        delete he[a], Pt(() => jn(a, hn()));
      }, i);
      return he[a] = { id: l, timeout_ms: i }, 0;
    }, bn = () => 2147483648, On = (a, i) => Math.ceil(a / i) * i, wn = (a) => {
      var i = R.buffer, l = (a - i.byteLength + 65535) / 65536 | 0;
      try {
        return R.grow(l), et(), 1;
      } catch {
      }
    }, Pn = (a) => {
      var i = z.length;
      a >>>= 0;
      var l = bn();
      if (a > l)
        return !1;
      for (var f = 1; f <= 4; f *= 2) {
        var m = i * (1 + 0.2 / f);
        m = Math.min(m, a + 100663296);
        var h = Math.min(l, On(Math.max(a, m), 65536)), O = wn(h);
        if (O)
          return !0;
      }
      return !1;
    };
    nr(), ue = t.BindingError = class extends Error {
      constructor(i) {
        super(i), this.name = "BindingError";
      }
    }, lt = t.InternalError = class extends Error {
      constructor(i) {
        super(i), this.name = "InternalError";
      }
    }, pr(), Pr(), yt = t.UnboundTypeError = Sr(Error, "UnboundTypeError"), Fr();
    var In = { i: tr, s: rr, n: ir, w: ar, f: Tr, d: Er, a: Rr, u: xr, l: $r, g: Wr, m: Vr, b: Gr, e: Br, c: Hr, v: Xr, h: an, x: sn, q: ln, j: un, y: Ne, k: dn, o: mn, A: yn, z: gn, r: vn, t: Pn, p: wt }, _ = await qt();
    _.C;
    var Cn = _.D, We = t._malloc = _.E, q = t._free = _.F, jn = _.G;
    t.dynCall_v = _.I, t.dynCall_ii = _.J, t.dynCall_vi = _.K, t.dynCall_i = _.L, t.dynCall_iii = _.M, t.dynCall_viii = _.N, t.dynCall_fii = _.O, t.dynCall_viif = _.P, t.dynCall_viiii = _.Q, t.dynCall_viiiiii = _.R, t.dynCall_iiiiii = _.S, t.dynCall_viiiii = _.T, t.dynCall_iiiiiii = _.U, t.dynCall_iiiiiiii = _.V, t.dynCall_viiiiiii = _.W, t.dynCall_viiiiiiiiidi = _.X, t.dynCall_viiiiiiiidi = _.Y, t.dynCall_viiiiiiiiii = _.Z, t.dynCall_viiiiiiiii = _._, t.dynCall_viiiiiiii = _.$, t.dynCall_iiiii = _.aa, t.dynCall_iiii = _.ba;
    var Sn = _.ca, Tn = _.da, kn = _.ea, Dn = _.fa;
    function Ue() {
      if (ie > 0) {
        me = Ue;
        return;
      }
      if (Wt(), ie > 0) {
        me = Ue;
        return;
      }
      function a() {
        var i;
        t.calledRun = !0, !N && (Ut(), e(t), (i = t.onRuntimeInitialized) == null || i.call(t), Vt());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), a();
      }, 1)) : a();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return Ue(), r = o, r;
  };
})();
let wi = class extends bi {
  getSamWasmFilePath(u, r) {
    return `${u}/magnifeye/wasm/${r}`;
  }
  fetchSamModule(u) {
    return Oi(u);
  }
};
class Pi extends wi {
}
Gn(Pi);
