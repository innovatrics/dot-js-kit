var Fo = Object.defineProperty;
var or = (f) => {
  throw TypeError(f);
};
var xo = (f, s, r) => s in f ? Fo(f, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : f[s] = r;
var ze = (f, s, r) => xo(f, typeof s != "symbol" ? s + "" : s, r), ir = (f, s, r) => s.has(f) || or("Cannot " + r);
var ee = (f, s, r) => (ir(f, s, "read from private field"), r ? r.call(f) : s.get(f)), Ue = (f, s, r) => s.has(f) ? or("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(f) : s.set(f, r), Ve = (f, s, r, t) => (ir(f, s, "write to private field"), t ? t.call(f, r) : s.set(f, r), r);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Lr = Symbol("Comlink.proxy"), No = Symbol("Comlink.endpoint"), Wo = Symbol("Comlink.releaseProxy"), He = Symbol("Comlink.finalizer"), Ye = Symbol("Comlink.thrown"), _r = (f) => typeof f == "object" && f !== null || typeof f == "function", zo = {
  canHandle: (f) => _r(f) && f[Lr],
  serialize(f) {
    const { port1: s, port2: r } = new MessageChannel();
    return Pt(f, s), [r, [r]];
  },
  deserialize(f) {
    return f.start(), $o(f);
  }
}, Uo = {
  canHandle: (f) => _r(f) && Ye in f,
  serialize({ value: f }) {
    let s;
    return f instanceof Error ? s = {
      isError: !0,
      value: {
        message: f.message,
        name: f.name,
        stack: f.stack
      }
    } : s = { isError: !1, value: f }, [s, []];
  },
  deserialize(f) {
    throw f.isError ? Object.assign(new Error(f.value.message), f.value) : f.value;
  }
}, Rr = /* @__PURE__ */ new Map([
  ["proxy", zo],
  ["throw", Uo]
]);
function Vo(f, s) {
  for (const r of f)
    if (s === r || r === "*" || r instanceof RegExp && r.test(s))
      return !0;
  return !1;
}
function Pt(f, s = globalThis, r = ["*"]) {
  s.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!Vo(r, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: n, type: o, path: u } = Object.assign({ path: [] }, e.data), a = (e.data.argumentList || []).map(de);
    let y;
    try {
      const j = u.slice(0, -1).reduce((v, I) => v[I], f), h = u.reduce((v, I) => v[I], f);
      switch (o) {
        case "GET":
          y = h;
          break;
        case "SET":
          j[u.slice(-1)[0]] = de(e.data.value), y = !0;
          break;
        case "APPLY":
          y = h.apply(j, a);
          break;
        case "CONSTRUCT":
          {
            const v = new h(...a);
            y = Zo(v);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: v, port2: I } = new MessageChannel();
            Pt(f, I), y = Jo(v, [v]);
          }
          break;
        case "RELEASE":
          y = void 0;
          break;
        default:
          return;
      }
    } catch (j) {
      y = { value: j, [Ye]: 0 };
    }
    Promise.resolve(y).catch((j) => ({ value: j, [Ye]: 0 })).then((j) => {
      const [h, v] = Ke(j);
      s.postMessage(Object.assign(Object.assign({}, h), { id: n }), v), o === "RELEASE" && (s.removeEventListener("message", t), Fr(s), He in f && typeof f[He] == "function" && f[He]());
    }).catch((j) => {
      const [h, v] = Ke({
        value: new TypeError("Unserializable return value"),
        [Ye]: 0
      });
      s.postMessage(Object.assign(Object.assign({}, h), { id: n }), v);
    });
  }), s.start && s.start();
}
function Go(f) {
  return f.constructor.name === "MessagePort";
}
function Fr(f) {
  Go(f) && f.close();
}
function $o(f, s) {
  const r = /* @__PURE__ */ new Map();
  return f.addEventListener("message", function(e) {
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
  }), wt(f, r, [], s);
}
function Ge(f) {
  if (f)
    throw new Error("Proxy has been released and is not useable");
}
function xr(f) {
  return ve(f, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    Fr(f);
  });
}
const Je = /* @__PURE__ */ new WeakMap(), Ze = "FinalizationRegistry" in globalThis && new FinalizationRegistry((f) => {
  const s = (Je.get(f) || 0) - 1;
  Je.set(f, s), s === 0 && xr(f);
});
function Bo(f, s) {
  const r = (Je.get(s) || 0) + 1;
  Je.set(s, r), Ze && Ze.register(f, s, f);
}
function Ho(f) {
  Ze && Ze.unregister(f);
}
function wt(f, s, r = [], t = function() {
}) {
  let e = !1;
  const n = new Proxy(t, {
    get(o, u) {
      if (Ge(e), u === Wo)
        return () => {
          Ho(n), xr(f), s.clear(), e = !0;
        };
      if (u === "then") {
        if (r.length === 0)
          return { then: () => n };
        const a = ve(f, s, {
          type: "GET",
          path: r.map((y) => y.toString())
        }).then(de);
        return a.then.bind(a);
      }
      return wt(f, s, [...r, u]);
    },
    set(o, u, a) {
      Ge(e);
      const [y, j] = Ke(a);
      return ve(f, s, {
        type: "SET",
        path: [...r, u].map((h) => h.toString()),
        value: y
      }, j).then(de);
    },
    apply(o, u, a) {
      Ge(e);
      const y = r[r.length - 1];
      if (y === No)
        return ve(f, s, {
          type: "ENDPOINT"
        }).then(de);
      if (y === "bind")
        return wt(f, s, r.slice(0, -1));
      const [j, h] = ar(a);
      return ve(f, s, {
        type: "APPLY",
        path: r.map((v) => v.toString()),
        argumentList: j
      }, h).then(de);
    },
    construct(o, u) {
      Ge(e);
      const [a, y] = ar(u);
      return ve(f, s, {
        type: "CONSTRUCT",
        path: r.map((j) => j.toString()),
        argumentList: a
      }, y).then(de);
    }
  });
  return Bo(n, f), n;
}
function Yo(f) {
  return Array.prototype.concat.apply([], f);
}
function ar(f) {
  const s = f.map(Ke);
  return [s.map((r) => r[0]), Yo(s.map((r) => r[1]))];
}
const Nr = /* @__PURE__ */ new WeakMap();
function Jo(f, s) {
  return Nr.set(f, s), f;
}
function Zo(f) {
  return Object.assign(f, { [Lr]: !0 });
}
function Ke(f) {
  for (const [s, r] of Rr)
    if (r.canHandle(f)) {
      const [t, e] = r.serialize(f);
      return [
        {
          type: "HANDLER",
          name: s,
          value: t
        },
        e
      ];
    }
  return [
    {
      type: "RAW",
      value: f
    },
    Nr.get(f) || []
  ];
}
function de(f) {
  switch (f.type) {
    case "HANDLER":
      return Rr.get(f.name).deserialize(f.value);
    case "RAW":
      return f.value;
  }
}
function ve(f, s, r, t) {
  return new Promise((e) => {
    const n = Ko();
    s.set(n, e), f.start && f.start(), f.postMessage(Object.assign({ id: n }, r), t);
  });
}
function Ko() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const $e = 1e3, sr = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, qo = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
class $ extends Error {
  constructor(r, t) {
    super(r);
    ze(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(r) {
  }
  static fromCameraError(r) {
    if (this.logError(r), r instanceof $)
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
    return new $(t, r);
  }
  static fromError(r) {
    if (this.logError(r), r instanceof $)
      return r;
    const t = "An unexpected error has occurred";
    return new $(t);
  }
}
const Xo = {
  RGBA: "RGBA"
};
var le, pe, Oe;
class Qo {
  constructor(s, r) {
    Ue(this, le);
    Ue(this, pe);
    Ue(this, Oe);
    Ve(this, le, s), Ve(this, pe, this.allocate(r.length * r.BYTES_PER_ELEMENT)), Ve(this, Oe, this.allocate(r.length * r.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return ee(this, pe);
  }
  get bgr0ImagePointer() {
    return ee(this, Oe);
  }
  allocate(s) {
    return ee(this, le)._malloc(s);
  }
  free() {
    ee(this, le)._free(ee(this, pe)), ee(this, le)._free(ee(this, Oe));
  }
  writeDataToMemory(s) {
    ee(this, le).HEAPU8.set(s, ee(this, pe));
  }
}
le = new WeakMap(), pe = new WeakMap(), Oe = new WeakMap();
class ei {
  constructor() {
    ze(this, "samWasmModule");
  }
  getOverriddenModules(s, r) {
    return {
      locateFile: (t) => new URL(r || t, s).href
    };
  }
  async handleMissingOrInvalidSamModule(s, r) {
    try {
      const t = await fetch(s);
      if (!t.ok)
        throw new $(
          `The path to ${r} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${s}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new $(
          `The provided ${r} is not a valid WASM module. Please check provided path to wasm files. Current path is ${s}`
        );
    } catch (t) {
      if (t instanceof $)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await qo() ? sr.simd : sr.sam;
  }
  async initSamModule(s, r) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(r, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(s, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new $("Could not init detector.");
    }
  }
  terminateSamModule() {
    var s;
    (s = this.samWasmModule) == null || s.terminate();
  }
  async getSamVersion() {
    var r;
    const s = await ((r = this.samWasmModule) == null ? void 0 : r.getInfoString());
    return s == null ? void 0 : s.trim();
  }
  /*
   * In TS 5.2.0 was added special keyword "using" which could be perfect for this case.
   * Unfortunately, vite preact plugin does not support this version of TS yet.
   * Check possibility of using "using" keyword when vite preact plugin updates
   */
  writeImageToMemory(s) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const r = new Qo(this.samWasmModule, s);
    return r.writeDataToMemory(s), r;
  }
  convertToSamColorImage(s, r) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(s);
    return this.samWasmModule.convertToSamColorImage(
      r.width,
      r.height,
      t.rgbaImagePointer,
      Xo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(s, r, t) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(s, r), { bottomLeft: n, topLeft: o, topRight: u } = t, a = [
      o.x,
      // x
      o.y,
      // y
      u.x - o.x,
      // width
      n.y - o.y
      // height
    ], { height: y, width: j, x: h, y: v } = await this.samWasmModule.selectDetailRegion(
      r.width,
      r.height,
      e.bgr0ImagePointer,
      a
    );
    return e.free(), {
      height: y,
      width: j,
      shiftX: h,
      shiftY: v
    };
  }
  [He]() {
    this.terminateSamModule();
  }
}
const Be = (f, s) => Math.hypot(s.x - f.x, s.y - f.y), ti = (f) => {
  const { bottomLeft: s, bottomRight: r, topLeft: t, topRight: e } = f, n = Be(t, e), o = Be(e, r), u = Be(s, r), a = Be(t, s);
  return Math.min(n, o, u, a);
};
var be = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, lr = {}, ct = {}, ut, cr;
function ri() {
  if (cr) return ut;
  cr = 1, ut = f;
  function f(s, r) {
    for (var t = new Array(arguments.length - 1), e = 0, n = 2, o = !0; n < arguments.length; )
      t[e++] = arguments[n++];
    return new Promise(function(u, a) {
      t[e] = function(y) {
        if (o)
          if (o = !1, y)
            a(y);
          else {
            for (var j = new Array(arguments.length - 1), h = 0; h < j.length; )
              j[h++] = arguments[h];
            u.apply(null, j);
          }
      };
      try {
        s.apply(r || null, t);
      } catch (y) {
        o && (o = !1, a(y));
      }
    });
  }
  return ut;
}
var ur = {}, dr;
function ni() {
  return dr || (dr = 1, function(f) {
    var s = f;
    s.length = function(o) {
      var u = o.length;
      if (!u)
        return 0;
      for (var a = 0; --u % 4 > 1 && o.charAt(u) === "="; )
        ++a;
      return Math.ceil(o.length * 3) / 4 - a;
    };
    for (var r = new Array(64), t = new Array(123), e = 0; e < 64; )
      t[r[e] = e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e - 59 | 43] = e++;
    s.encode = function(o, u, a) {
      for (var y = null, j = [], h = 0, v = 0, I; u < a; ) {
        var S = o[u++];
        switch (v) {
          case 0:
            j[h++] = r[S >> 2], I = (S & 3) << 4, v = 1;
            break;
          case 1:
            j[h++] = r[I | S >> 4], I = (S & 15) << 2, v = 2;
            break;
          case 2:
            j[h++] = r[I | S >> 6], j[h++] = r[S & 63], v = 0;
            break;
        }
        h > 8191 && ((y || (y = [])).push(String.fromCharCode.apply(String, j)), h = 0);
      }
      return v && (j[h++] = r[I], j[h++] = 61, v === 1 && (j[h++] = 61)), y ? (h && y.push(String.fromCharCode.apply(String, j.slice(0, h))), y.join("")) : String.fromCharCode.apply(String, j.slice(0, h));
    };
    var n = "invalid encoding";
    s.decode = function(o, u, a) {
      for (var y = a, j = 0, h, v = 0; v < o.length; ) {
        var I = o.charCodeAt(v++);
        if (I === 61 && j > 1)
          break;
        if ((I = t[I]) === void 0)
          throw Error(n);
        switch (j) {
          case 0:
            h = I, j = 1;
            break;
          case 1:
            u[a++] = h << 2 | (I & 48) >> 4, h = I, j = 2;
            break;
          case 2:
            u[a++] = (h & 15) << 4 | (I & 60) >> 2, h = I, j = 3;
            break;
          case 3:
            u[a++] = (h & 3) << 6 | I, j = 0;
            break;
        }
      }
      if (j === 1)
        throw Error(n);
      return a - y;
    }, s.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  }(ur)), ur;
}
var dt, pr;
function oi() {
  if (pr) return dt;
  pr = 1, dt = f;
  function f() {
    this._listeners = {};
  }
  return f.prototype.on = function(s, r, t) {
    return (this._listeners[s] || (this._listeners[s] = [])).push({
      fn: r,
      ctx: t || this
    }), this;
  }, f.prototype.off = function(s, r) {
    if (s === void 0)
      this._listeners = {};
    else if (r === void 0)
      this._listeners[s] = [];
    else
      for (var t = this._listeners[s], e = 0; e < t.length; )
        t[e].fn === r ? t.splice(e, 1) : ++e;
    return this;
  }, f.prototype.emit = function(s) {
    var r = this._listeners[s];
    if (r) {
      for (var t = [], e = 1; e < arguments.length; )
        t.push(arguments[e++]);
      for (e = 0; e < r.length; )
        r[e].fn.apply(r[e++].ctx, t);
    }
    return this;
  }, dt;
}
var pt, fr;
function ii() {
  if (fr) return pt;
  fr = 1, pt = f(f);
  function f(n) {
    return typeof Float32Array < "u" ? function() {
      var o = new Float32Array([-0]), u = new Uint8Array(o.buffer), a = u[3] === 128;
      function y(I, S, L) {
        o[0] = I, S[L] = u[0], S[L + 1] = u[1], S[L + 2] = u[2], S[L + 3] = u[3];
      }
      function j(I, S, L) {
        o[0] = I, S[L] = u[3], S[L + 1] = u[2], S[L + 2] = u[1], S[L + 3] = u[0];
      }
      n.writeFloatLE = a ? y : j, n.writeFloatBE = a ? j : y;
      function h(I, S) {
        return u[0] = I[S], u[1] = I[S + 1], u[2] = I[S + 2], u[3] = I[S + 3], o[0];
      }
      function v(I, S) {
        return u[3] = I[S], u[2] = I[S + 1], u[1] = I[S + 2], u[0] = I[S + 3], o[0];
      }
      n.readFloatLE = a ? h : v, n.readFloatBE = a ? v : h;
    }() : function() {
      function o(a, y, j, h) {
        var v = y < 0 ? 1 : 0;
        if (v && (y = -y), y === 0)
          a(1 / y > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), j, h);
        else if (isNaN(y))
          a(2143289344, j, h);
        else if (y > 34028234663852886e22)
          a((v << 31 | 2139095040) >>> 0, j, h);
        else if (y < 11754943508222875e-54)
          a((v << 31 | Math.round(y / 1401298464324817e-60)) >>> 0, j, h);
        else {
          var I = Math.floor(Math.log(y) / Math.LN2), S = Math.round(y * Math.pow(2, -I) * 8388608) & 8388607;
          a((v << 31 | I + 127 << 23 | S) >>> 0, j, h);
        }
      }
      n.writeFloatLE = o.bind(null, s), n.writeFloatBE = o.bind(null, r);
      function u(a, y, j) {
        var h = a(y, j), v = (h >> 31) * 2 + 1, I = h >>> 23 & 255, S = h & 8388607;
        return I === 255 ? S ? NaN : v * (1 / 0) : I === 0 ? v * 1401298464324817e-60 * S : v * Math.pow(2, I - 150) * (S + 8388608);
      }
      n.readFloatLE = u.bind(null, t), n.readFloatBE = u.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var o = new Float64Array([-0]), u = new Uint8Array(o.buffer), a = u[7] === 128;
      function y(I, S, L) {
        o[0] = I, S[L] = u[0], S[L + 1] = u[1], S[L + 2] = u[2], S[L + 3] = u[3], S[L + 4] = u[4], S[L + 5] = u[5], S[L + 6] = u[6], S[L + 7] = u[7];
      }
      function j(I, S, L) {
        o[0] = I, S[L] = u[7], S[L + 1] = u[6], S[L + 2] = u[5], S[L + 3] = u[4], S[L + 4] = u[3], S[L + 5] = u[2], S[L + 6] = u[1], S[L + 7] = u[0];
      }
      n.writeDoubleLE = a ? y : j, n.writeDoubleBE = a ? j : y;
      function h(I, S) {
        return u[0] = I[S], u[1] = I[S + 1], u[2] = I[S + 2], u[3] = I[S + 3], u[4] = I[S + 4], u[5] = I[S + 5], u[6] = I[S + 6], u[7] = I[S + 7], o[0];
      }
      function v(I, S) {
        return u[7] = I[S], u[6] = I[S + 1], u[5] = I[S + 2], u[4] = I[S + 3], u[3] = I[S + 4], u[2] = I[S + 5], u[1] = I[S + 6], u[0] = I[S + 7], o[0];
      }
      n.readDoubleLE = a ? h : v, n.readDoubleBE = a ? v : h;
    }() : function() {
      function o(a, y, j, h, v, I) {
        var S = h < 0 ? 1 : 0;
        if (S && (h = -h), h === 0)
          a(0, v, I + y), a(1 / h > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), v, I + j);
        else if (isNaN(h))
          a(0, v, I + y), a(2146959360, v, I + j);
        else if (h > 17976931348623157e292)
          a(0, v, I + y), a((S << 31 | 2146435072) >>> 0, v, I + j);
        else {
          var L;
          if (h < 22250738585072014e-324)
            L = h / 5e-324, a(L >>> 0, v, I + y), a((S << 31 | L / 4294967296) >>> 0, v, I + j);
          else {
            var P = Math.floor(Math.log(h) / Math.LN2);
            P === 1024 && (P = 1023), L = h * Math.pow(2, -P), a(L * 4503599627370496 >>> 0, v, I + y), a((S << 31 | P + 1023 << 20 | L * 1048576 & 1048575) >>> 0, v, I + j);
          }
        }
      }
      n.writeDoubleLE = o.bind(null, s, 0, 4), n.writeDoubleBE = o.bind(null, r, 4, 0);
      function u(a, y, j, h, v) {
        var I = a(h, v + y), S = a(h, v + j), L = (S >> 31) * 2 + 1, P = S >>> 20 & 2047, k = 4294967296 * (S & 1048575) + I;
        return P === 2047 ? k ? NaN : L * (1 / 0) : P === 0 ? L * 5e-324 * k : L * Math.pow(2, P - 1075) * (k + 4503599627370496);
      }
      n.readDoubleLE = u.bind(null, t, 0, 4), n.readDoubleBE = u.bind(null, e, 4, 0);
    }(), n;
  }
  function s(n, o, u) {
    o[u] = n & 255, o[u + 1] = n >>> 8 & 255, o[u + 2] = n >>> 16 & 255, o[u + 3] = n >>> 24;
  }
  function r(n, o, u) {
    o[u] = n >>> 24, o[u + 1] = n >>> 16 & 255, o[u + 2] = n >>> 8 & 255, o[u + 3] = n & 255;
  }
  function t(n, o) {
    return (n[o] | n[o + 1] << 8 | n[o + 2] << 16 | n[o + 3] << 24) >>> 0;
  }
  function e(n, o) {
    return (n[o] << 24 | n[o + 1] << 16 | n[o + 2] << 8 | n[o + 3]) >>> 0;
  }
  return pt;
}
function mr(f) {
  throw new Error('Could not dynamically require "' + f + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ft, gr;
function ai() {
  if (gr) return ft;
  gr = 1, ft = f;
  function f(s) {
    try {
      if (typeof mr != "function")
        return null;
      var r = mr(s);
      return r && (r.length || Object.keys(r).length) ? r : null;
    } catch {
      return null;
    }
  }
  return ft;
}
var yr = {}, hr;
function si() {
  return hr || (hr = 1, function(f) {
    var s = f;
    s.length = function(r) {
      for (var t = 0, e = 0, n = 0; n < r.length; ++n)
        e = r.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (r.charCodeAt(n + 1) & 64512) === 56320 ? (++n, t += 4) : t += 3;
      return t;
    }, s.read = function(r, t, e) {
      var n = e - t;
      if (n < 1)
        return "";
      for (var o = null, u = [], a = 0, y; t < e; )
        y = r[t++], y < 128 ? u[a++] = y : y > 191 && y < 224 ? u[a++] = (y & 31) << 6 | r[t++] & 63 : y > 239 && y < 365 ? (y = ((y & 7) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, u[a++] = 55296 + (y >> 10), u[a++] = 56320 + (y & 1023)) : u[a++] = (y & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63, a > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, u)), a = 0);
      return o ? (a && o.push(String.fromCharCode.apply(String, u.slice(0, a))), o.join("")) : String.fromCharCode.apply(String, u.slice(0, a));
    }, s.write = function(r, t, e) {
      for (var n = e, o, u, a = 0; a < r.length; ++a)
        o = r.charCodeAt(a), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((u = r.charCodeAt(a + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (u & 1023), ++a, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - n;
    };
  }(yr)), yr;
}
var mt, br;
function li() {
  if (br) return mt;
  br = 1, mt = f;
  function f(s, r, t) {
    var e = t || 8192, n = e >>> 1, o = null, u = e;
    return function(a) {
      if (a < 1 || a > n)
        return s(a);
      u + a > e && (o = s(e), u = 0);
      var y = r.call(o, u, u += a);
      return u & 7 && (u = (u | 7) + 1), y;
    };
  }
  return mt;
}
var gt, vr;
function ci() {
  if (vr) return gt;
  vr = 1, gt = s;
  var f = fe();
  function s(n, o) {
    this.lo = n >>> 0, this.hi = o >>> 0;
  }
  var r = s.zero = new s(0, 0);
  r.toNumber = function() {
    return 0;
  }, r.zzEncode = r.zzDecode = function() {
    return this;
  }, r.length = function() {
    return 1;
  };
  var t = s.zeroHash = "\0\0\0\0\0\0\0\0";
  s.fromNumber = function(n) {
    if (n === 0)
      return r;
    var o = n < 0;
    o && (n = -n);
    var u = n >>> 0, a = (n - u) / 4294967296 >>> 0;
    return o && (a = ~a >>> 0, u = ~u >>> 0, ++u > 4294967295 && (u = 0, ++a > 4294967295 && (a = 0))), new s(u, a);
  }, s.from = function(n) {
    if (typeof n == "number")
      return s.fromNumber(n);
    if (f.isString(n))
      if (f.Long)
        n = f.Long.fromString(n);
      else
        return s.fromNumber(parseInt(n, 10));
    return n.low || n.high ? new s(n.low >>> 0, n.high >>> 0) : r;
  }, s.prototype.toNumber = function(n) {
    if (!n && this.hi >>> 31) {
      var o = ~this.lo + 1 >>> 0, u = ~this.hi >>> 0;
      return o || (u = u + 1 >>> 0), -(o + u * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, s.prototype.toLong = function(n) {
    return f.Long ? new f.Long(this.lo | 0, this.hi | 0, !!n) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!n };
  };
  var e = String.prototype.charCodeAt;
  return s.fromHash = function(n) {
    return n === t ? r : new s(
      (e.call(n, 0) | e.call(n, 1) << 8 | e.call(n, 2) << 16 | e.call(n, 3) << 24) >>> 0,
      (e.call(n, 4) | e.call(n, 5) << 8 | e.call(n, 6) << 16 | e.call(n, 7) << 24) >>> 0
    );
  }, s.prototype.toHash = function() {
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
  }, s.prototype.zzEncode = function() {
    var n = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ n) >>> 0, this.lo = (this.lo << 1 ^ n) >>> 0, this;
  }, s.prototype.zzDecode = function() {
    var n = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ n) >>> 0, this.hi = (this.hi >>> 1 ^ n) >>> 0, this;
  }, s.prototype.length = function() {
    var n = this.lo, o = (this.lo >>> 28 | this.hi << 4) >>> 0, u = this.hi >>> 24;
    return u === 0 ? o === 0 ? n < 16384 ? n < 128 ? 1 : 2 : n < 2097152 ? 3 : 4 : o < 16384 ? o < 128 ? 5 : 6 : o < 2097152 ? 7 : 8 : u < 128 ? 9 : 10;
  }, gt;
}
var Or;
function fe() {
  return Or || (Or = 1, function(f) {
    var s = f;
    s.asPromise = ri(), s.base64 = ni(), s.EventEmitter = oi(), s.float = ii(), s.inquire = ai(), s.utf8 = si(), s.pool = li(), s.LongBits = ci(), s.isNode = !!(typeof be < "u" && be && be.process && be.process.versions && be.process.versions.node), s.global = s.isNode && be || typeof window < "u" && window || typeof self < "u" && self || ct, s.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), s.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), s.isInteger = Number.isInteger || /* istanbul ignore next */
    function(e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    }, s.isString = function(e) {
      return typeof e == "string" || e instanceof String;
    }, s.isObject = function(e) {
      return e && typeof e == "object";
    }, s.isset = /**
    * Checks if a property on a message is considered to be present.
    * @param {Object} obj Plain object or message instance
    * @param {string} prop Property name
    * @returns {boolean} `true` if considered to be present, otherwise `false`
    */
    s.isSet = function(e, n) {
      var o = e[n];
      return o != null && e.hasOwnProperty(n) ? typeof o != "object" || (Array.isArray(o) ? o.length : Object.keys(o).length) > 0 : !1;
    }, s.Buffer = function() {
      try {
        var e = s.inquire("buffer").Buffer;
        return e.prototype.utf8Write ? e : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), s._Buffer_from = null, s._Buffer_allocUnsafe = null, s.newBuffer = function(e) {
      return typeof e == "number" ? s.Buffer ? s._Buffer_allocUnsafe(e) : new s.Array(e) : s.Buffer ? s._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
    }, s.Array = typeof Uint8Array < "u" ? Uint8Array : Array, s.Long = /* istanbul ignore next */
    s.global.dcodeIO && /* istanbul ignore next */
    s.global.dcodeIO.Long || /* istanbul ignore next */
    s.global.Long || s.inquire("long"), s.key2Re = /^true|false|0|1$/, s.key32Re = /^-?(?:0|[1-9][0-9]*)$/, s.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, s.longToHash = function(e) {
      return e ? s.LongBits.from(e).toHash() : s.LongBits.zeroHash;
    }, s.longFromHash = function(e, n) {
      var o = s.LongBits.fromHash(e);
      return s.Long ? s.Long.fromBits(o.lo, o.hi, n) : o.toNumber(!!n);
    };
    function r(e, n, o) {
      for (var u = Object.keys(n), a = 0; a < u.length; ++a)
        (e[u[a]] === void 0 || !o) && (e[u[a]] = n[u[a]]);
      return e;
    }
    s.merge = r, s.lcFirst = function(e) {
      return e.charAt(0).toLowerCase() + e.substring(1);
    };
    function t(e) {
      function n(o, u) {
        if (!(this instanceof n))
          return new n(o, u);
        Object.defineProperty(this, "message", { get: function() {
          return o;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, n) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), u && r(this, u);
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
    s.newError = t, s.ProtocolError = t("ProtocolError"), s.oneOfGetter = function(e) {
      for (var n = {}, o = 0; o < e.length; ++o)
        n[e[o]] = 1;
      return function() {
        for (var u = Object.keys(this), a = u.length - 1; a > -1; --a)
          if (n[u[a]] === 1 && this[u[a]] !== void 0 && this[u[a]] !== null)
            return u[a];
      };
    }, s.oneOfSetter = function(e) {
      return function(n) {
        for (var o = 0; o < e.length; ++o)
          e[o] !== n && delete this[e[o]];
      };
    }, s.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, s._configure = function() {
      var e = s.Buffer;
      if (!e) {
        s._Buffer_from = s._Buffer_allocUnsafe = null;
        return;
      }
      s._Buffer_from = e.from !== Uint8Array.from && e.from || /* istanbul ignore next */
      function(n, o) {
        return new e(n, o);
      }, s._Buffer_allocUnsafe = e.allocUnsafe || /* istanbul ignore next */
      function(n) {
        return new e(n);
      };
    };
  }(ct)), ct;
}
var yt, wr;
function Wr() {
  if (wr) return yt;
  wr = 1, yt = a;
  var f = fe(), s, r = f.LongBits, t = f.base64, e = f.utf8;
  function n(P, k, F) {
    this.fn = P, this.len = k, this.next = void 0, this.val = F;
  }
  function o() {
  }
  function u(P) {
    this.head = P.head, this.tail = P.tail, this.len = P.len, this.next = P.states;
  }
  function a() {
    this.len = 0, this.head = new n(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var y = function() {
    return f.Buffer ? function() {
      return (a.create = function() {
        return new s();
      })();
    } : function() {
      return new a();
    };
  };
  a.create = y(), a.alloc = function(P) {
    return new f.Array(P);
  }, f.Array !== Array && (a.alloc = f.pool(a.alloc, f.Array.prototype.subarray)), a.prototype._push = function(P, k, F) {
    return this.tail = this.tail.next = new n(P, k, F), this.len += k, this;
  };
  function j(P, k, F) {
    k[F] = P & 255;
  }
  function h(P, k, F) {
    for (; P > 127; )
      k[F++] = P & 127 | 128, P >>>= 7;
    k[F] = P;
  }
  function v(P, k) {
    this.len = P, this.next = void 0, this.val = k;
  }
  v.prototype = Object.create(n.prototype), v.prototype.fn = h, a.prototype.uint32 = function(P) {
    return this.len += (this.tail = this.tail.next = new v(
      (P = P >>> 0) < 128 ? 1 : P < 16384 ? 2 : P < 2097152 ? 3 : P < 268435456 ? 4 : 5,
      P
    )).len, this;
  }, a.prototype.int32 = function(P) {
    return P < 0 ? this._push(I, 10, r.fromNumber(P)) : this.uint32(P);
  }, a.prototype.sint32 = function(P) {
    return this.uint32((P << 1 ^ P >> 31) >>> 0);
  };
  function I(P, k, F) {
    for (; P.hi; )
      k[F++] = P.lo & 127 | 128, P.lo = (P.lo >>> 7 | P.hi << 25) >>> 0, P.hi >>>= 7;
    for (; P.lo > 127; )
      k[F++] = P.lo & 127 | 128, P.lo = P.lo >>> 7;
    k[F++] = P.lo;
  }
  a.prototype.uint64 = function(P) {
    var k = r.from(P);
    return this._push(I, k.length(), k);
  }, a.prototype.int64 = a.prototype.uint64, a.prototype.sint64 = function(P) {
    var k = r.from(P).zzEncode();
    return this._push(I, k.length(), k);
  }, a.prototype.bool = function(P) {
    return this._push(j, 1, P ? 1 : 0);
  };
  function S(P, k, F) {
    k[F] = P & 255, k[F + 1] = P >>> 8 & 255, k[F + 2] = P >>> 16 & 255, k[F + 3] = P >>> 24;
  }
  a.prototype.fixed32 = function(P) {
    return this._push(S, 4, P >>> 0);
  }, a.prototype.sfixed32 = a.prototype.fixed32, a.prototype.fixed64 = function(P) {
    var k = r.from(P);
    return this._push(S, 4, k.lo)._push(S, 4, k.hi);
  }, a.prototype.sfixed64 = a.prototype.fixed64, a.prototype.float = function(P) {
    return this._push(f.float.writeFloatLE, 4, P);
  }, a.prototype.double = function(P) {
    return this._push(f.float.writeDoubleLE, 8, P);
  };
  var L = f.Array.prototype.set ? function(P, k, F) {
    k.set(P, F);
  } : function(P, k, F) {
    for (var B = 0; B < P.length; ++B)
      k[F + B] = P[B];
  };
  return a.prototype.bytes = function(P) {
    var k = P.length >>> 0;
    if (!k)
      return this._push(j, 1, 0);
    if (f.isString(P)) {
      var F = a.alloc(k = t.length(P));
      t.decode(P, F, 0), P = F;
    }
    return this.uint32(k)._push(L, k, P);
  }, a.prototype.string = function(P) {
    var k = e.length(P);
    return k ? this.uint32(k)._push(e.write, k, P) : this._push(j, 1, 0);
  }, a.prototype.fork = function() {
    return this.states = new u(this), this.head = this.tail = new n(o, 0, 0), this.len = 0, this;
  }, a.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new n(o, 0, 0), this.len = 0), this;
  }, a.prototype.ldelim = function() {
    var P = this.head, k = this.tail, F = this.len;
    return this.reset().uint32(F), F && (this.tail.next = P.next, this.tail = k, this.len += F), this;
  }, a.prototype.finish = function() {
    for (var P = this.head.next, k = this.constructor.alloc(this.len), F = 0; P; )
      P.fn(P.val, k, F), F += P.len, P = P.next;
    return k;
  }, a._configure = function(P) {
    s = P, a.create = y(), s._configure();
  }, yt;
}
var ht, Pr;
function ui() {
  if (Pr) return ht;
  Pr = 1, ht = r;
  var f = Wr();
  (r.prototype = Object.create(f.prototype)).constructor = r;
  var s = fe();
  function r() {
    f.call(this);
  }
  r._configure = function() {
    r.alloc = s._Buffer_allocUnsafe, r.writeBytesBuffer = s.Buffer && s.Buffer.prototype instanceof Uint8Array && s.Buffer.prototype.set.name === "set" ? function(e, n, o) {
      n.set(e, o);
    } : function(e, n, o) {
      if (e.copy)
        e.copy(n, o, 0, e.length);
      else for (var u = 0; u < e.length; )
        n[o++] = e[u++];
    };
  }, r.prototype.bytes = function(e) {
    s.isString(e) && (e = s._Buffer_from(e, "base64"));
    var n = e.length >>> 0;
    return this.uint32(n), n && this._push(r.writeBytesBuffer, n, e), this;
  };
  function t(e, n, o) {
    e.length < 40 ? s.utf8.write(e, n, o) : n.utf8Write ? n.utf8Write(e, o) : n.write(e, o);
  }
  return r.prototype.string = function(e) {
    var n = s.Buffer.byteLength(e);
    return this.uint32(n), n && this._push(t, n, e), this;
  }, r._configure(), ht;
}
var bt, Ir;
function zr() {
  if (Ir) return bt;
  Ir = 1, bt = n;
  var f = fe(), s, r = f.LongBits, t = f.utf8;
  function e(h, v) {
    return RangeError("index out of range: " + h.pos + " + " + (v || 1) + " > " + h.len);
  }
  function n(h) {
    this.buf = h, this.pos = 0, this.len = h.length;
  }
  var o = typeof Uint8Array < "u" ? function(h) {
    if (h instanceof Uint8Array || Array.isArray(h))
      return new n(h);
    throw Error("illegal buffer");
  } : function(h) {
    if (Array.isArray(h))
      return new n(h);
    throw Error("illegal buffer");
  }, u = function() {
    return f.Buffer ? function(h) {
      return (n.create = function(v) {
        return f.Buffer.isBuffer(v) ? new s(v) : o(v);
      })(h);
    } : o;
  };
  n.create = u(), n.prototype._slice = f.Array.prototype.subarray || /* istanbul ignore next */
  f.Array.prototype.slice, n.prototype.uint32 = /* @__PURE__ */ function() {
    var h = 4294967295;
    return function() {
      if (h = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (h = (h | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (h = (h | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (h = (h | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (h = (h | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return h;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return h;
    };
  }(), n.prototype.int32 = function() {
    return this.uint32() | 0;
  }, n.prototype.sint32 = function() {
    var h = this.uint32();
    return h >>> 1 ^ -(h & 1) | 0;
  };
  function a() {
    var h = new r(0, 0), v = 0;
    if (this.len - this.pos > 4) {
      for (; v < 4; ++v)
        if (h.lo = (h.lo | (this.buf[this.pos] & 127) << v * 7) >>> 0, this.buf[this.pos++] < 128)
          return h;
      if (h.lo = (h.lo | (this.buf[this.pos] & 127) << 28) >>> 0, h.hi = (h.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return h;
      v = 0;
    } else {
      for (; v < 3; ++v) {
        if (this.pos >= this.len)
          throw e(this);
        if (h.lo = (h.lo | (this.buf[this.pos] & 127) << v * 7) >>> 0, this.buf[this.pos++] < 128)
          return h;
      }
      return h.lo = (h.lo | (this.buf[this.pos++] & 127) << v * 7) >>> 0, h;
    }
    if (this.len - this.pos > 4) {
      for (; v < 5; ++v)
        if (h.hi = (h.hi | (this.buf[this.pos] & 127) << v * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return h;
    } else
      for (; v < 5; ++v) {
        if (this.pos >= this.len)
          throw e(this);
        if (h.hi = (h.hi | (this.buf[this.pos] & 127) << v * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return h;
      }
    throw Error("invalid varint encoding");
  }
  n.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function y(h, v) {
    return (h[v - 4] | h[v - 3] << 8 | h[v - 2] << 16 | h[v - 1] << 24) >>> 0;
  }
  n.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return y(this.buf, this.pos += 4);
  }, n.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return y(this.buf, this.pos += 4) | 0;
  };
  function j() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new r(y(this.buf, this.pos += 4), y(this.buf, this.pos += 4));
  }
  return n.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var h = f.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, h;
  }, n.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var h = f.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, h;
  }, n.prototype.bytes = function() {
    var h = this.uint32(), v = this.pos, I = this.pos + h;
    if (I > this.len)
      throw e(this, h);
    if (this.pos += h, Array.isArray(this.buf))
      return this.buf.slice(v, I);
    if (v === I) {
      var S = f.Buffer;
      return S ? S.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, v, I);
  }, n.prototype.string = function() {
    var h = this.bytes();
    return t.read(h, 0, h.length);
  }, n.prototype.skip = function(h) {
    if (typeof h == "number") {
      if (this.pos + h > this.len)
        throw e(this, h);
      this.pos += h;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, n.prototype.skipType = function(h) {
    switch (h) {
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
        for (; (h = this.uint32() & 7) !== 4; )
          this.skipType(h);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + h + " at offset " + this.pos);
    }
    return this;
  }, n._configure = function(h) {
    s = h, n.create = u(), s._configure();
    var v = f.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    f.merge(n.prototype, {
      int64: function() {
        return a.call(this)[v](!1);
      },
      uint64: function() {
        return a.call(this)[v](!0);
      },
      sint64: function() {
        return a.call(this).zzDecode()[v](!1);
      },
      fixed64: function() {
        return j.call(this)[v](!0);
      },
      sfixed64: function() {
        return j.call(this)[v](!1);
      }
    });
  }, bt;
}
var vt, jr;
function di() {
  if (jr) return vt;
  jr = 1, vt = r;
  var f = zr();
  (r.prototype = Object.create(f.prototype)).constructor = r;
  var s = fe();
  function r(t) {
    f.call(this, t);
  }
  return r._configure = function() {
    s.Buffer && (r.prototype._slice = s.Buffer.prototype.slice);
  }, r.prototype.string = function() {
    var t = this.uint32();
    return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
  }, r._configure(), vt;
}
var Sr = {}, Ot, Cr;
function pi() {
  if (Cr) return Ot;
  Cr = 1, Ot = s;
  var f = fe();
  (s.prototype = Object.create(f.EventEmitter.prototype)).constructor = s;
  function s(r, t, e) {
    if (typeof r != "function")
      throw TypeError("rpcImpl must be a function");
    f.EventEmitter.call(this), this.rpcImpl = r, this.requestDelimited = !!t, this.responseDelimited = !!e;
  }
  return s.prototype.rpcCall = function r(t, e, n, o, u) {
    if (!o)
      throw TypeError("request must be specified");
    var a = this;
    if (!u)
      return f.asPromise(r, a, t, e, n, o);
    if (!a.rpcImpl) {
      setTimeout(function() {
        u(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return a.rpcImpl(
        t,
        e[a.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
        function(y, j) {
          if (y)
            return a.emit("error", y, t), u(y);
          if (j === null) {
            a.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(j instanceof n))
            try {
              j = n[a.responseDelimited ? "decodeDelimited" : "decode"](j);
            } catch (h) {
              return a.emit("error", h, t), u(h);
            }
          return a.emit("data", j, t), u(null, j);
        }
      );
    } catch (y) {
      a.emit("error", y, t), setTimeout(function() {
        u(y);
      }, 0);
      return;
    }
  }, s.prototype.end = function(r) {
    return this.rpcImpl && (r || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, Ot;
}
var Tr;
function fi() {
  return Tr || (Tr = 1, function(f) {
    var s = f;
    s.Service = pi();
  }(Sr)), Sr;
}
var kr, Dr;
function mi() {
  return Dr || (Dr = 1, kr = {}), kr;
}
var Ar;
function gi() {
  return Ar || (Ar = 1, function(f) {
    var s = f;
    s.build = "minimal", s.Writer = Wr(), s.BufferWriter = ui(), s.Reader = zr(), s.BufferReader = di(), s.util = fe(), s.rpc = fi(), s.roots = mi(), s.configure = r;
    function r() {
      s.util._configure(), s.Writer._configure(s.BufferWriter), s.Reader._configure(s.BufferReader);
    }
    r();
  }(lr)), lr;
}
var Er, Mr;
function yi() {
  return Mr || (Mr = 1, Er = gi()), Er;
}
var D = yi();
const g = D.Reader, E = D.Writer, d = D.util, i = D.roots.default || (D.roots.default = {});
i.dot = (() => {
  const f = {};
  return f.Content = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.token = d.newBuffer([]), s.prototype.iv = d.newBuffer([]), s.prototype.schemaVersion = 0, s.prototype.bytes = d.newBuffer([]), s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.token != null && Object.hasOwnProperty.call(r, "token") && t.uint32(
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
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.Content();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
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
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.token != null && r.hasOwnProperty("token") && !(r.token && typeof r.token.length == "number" || d.isString(r.token)) ? "token: buffer expected" : r.iv != null && r.hasOwnProperty("iv") && !(r.iv && typeof r.iv.length == "number" || d.isString(r.iv)) ? "iv: buffer expected" : r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && !d.isInteger(r.schemaVersion) ? "schemaVersion: integer expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || d.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.Content)
        return r;
      let t = new i.dot.Content();
      return r.token != null && (typeof r.token == "string" ? d.base64.decode(r.token, t.token = d.newBuffer(d.base64.length(r.token)), 0) : r.token.length >= 0 && (t.token = r.token)), r.iv != null && (typeof r.iv == "string" ? d.base64.decode(r.iv, t.iv = d.newBuffer(d.base64.length(r.iv)), 0) : r.iv.length >= 0 && (t.iv = r.iv)), r.schemaVersion != null && (t.schemaVersion = r.schemaVersion | 0), r.bytes != null && (typeof r.bytes == "string" ? d.base64.decode(r.bytes, t.bytes = d.newBuffer(d.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.token = "" : (e.token = [], t.bytes !== Array && (e.token = d.newBuffer(e.token))), t.bytes === String ? e.iv = "" : (e.iv = [], t.bytes !== Array && (e.iv = d.newBuffer(e.iv))), e.schemaVersion = 0, t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), r.token != null && r.hasOwnProperty("token") && (e.token = t.bytes === String ? d.base64.encode(r.token, 0, r.token.length) : t.bytes === Array ? Array.prototype.slice.call(r.token) : r.token), r.iv != null && r.hasOwnProperty("iv") && (e.iv = t.bytes === String ? d.base64.encode(r.iv, 0, r.iv.length) : t.bytes === Array ? Array.prototype.slice.call(r.iv) : r.iv), r.schemaVersion != null && r.hasOwnProperty("schemaVersion") && (e.schemaVersion = r.schemaVersion), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Content";
    }, s;
  }(), f.v4 = function() {
    const s = {};
    return s.MagnifEyeLivenessContent = function() {
      function r(e) {
        if (this.images = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.images = d.emptyArray, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.images != null && e.images.length)
          for (let o = 0; o < e.images.length; ++o)
            i.dot.Image.encode(e.images[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.images && a.images.length || (a.images = []), a.images.push(i.dot.Image.decode(e, e.uint32()));
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.images != null && e.hasOwnProperty("images")) {
          if (!Array.isArray(e.images))
            return "images: array expected";
          for (let n = 0; n < e.images.length; ++n) {
            let o = i.dot.Image.verify(e.images[n]);
            if (o)
              return "images." + o;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.MagnifEyeLivenessContent)
          return e;
        let n = new i.dot.v4.MagnifEyeLivenessContent();
        if (e.images) {
          if (!Array.isArray(e.images))
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: array expected");
          n.images = [];
          for (let o = 0; o < e.images.length; ++o) {
            if (typeof e.images[o] != "object")
              throw TypeError(".dot.v4.MagnifEyeLivenessContent.images: object expected");
            n.images[o] = i.dot.Image.fromObject(e.images[o]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.MagnifEyeLivenessContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.images = []), n.defaults && (o.metadata = null), e.images && e.images.length) {
          o.images = [];
          for (let u = 0; u < e.images.length; ++u)
            o.images[u] = i.dot.Image.toObject(e.images[u], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MagnifEyeLivenessContent";
      }, r;
    }(), s.Metadata = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.platform = 0, r.prototype.sessionToken = null, r.prototype.componentVersion = "", r.prototype.web = null, r.prototype.android = null, r.prototype.ios = null;
      let t;
      return Object.defineProperty(r.prototype, "_sessionToken", {
        get: d.oneOfGetter(t = ["sessionToken"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "metadata", {
        get: d.oneOfGetter(t = ["web", "android", "ios"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.platform != null && Object.hasOwnProperty.call(e, "platform") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.platform), e.web != null && Object.hasOwnProperty.call(e, "web") && i.dot.v4.WebMetadata.encode(e.web, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.android != null && Object.hasOwnProperty.call(e, "android") && i.dot.v4.AndroidMetadata.encode(e.android, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.ios != null && Object.hasOwnProperty.call(e, "ios") && i.dot.v4.IosMetadata.encode(e.ios, n.uint32(
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
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Metadata();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.platform = e.int32();
              break;
            }
            case 5: {
              a.sessionToken = e.string();
              break;
            }
            case 6: {
              a.componentVersion = e.string();
              break;
            }
            case 2: {
              a.web = i.dot.v4.WebMetadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.android = i.dot.v4.AndroidMetadata.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.ios = i.dot.v4.IosMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        if (e.sessionToken != null && e.hasOwnProperty("sessionToken") && (n._sessionToken = 1, !d.isString(e.sessionToken)))
          return "sessionToken: string expected";
        if (e.componentVersion != null && e.hasOwnProperty("componentVersion") && !d.isString(e.componentVersion))
          return "componentVersion: string expected";
        if (e.web != null && e.hasOwnProperty("web")) {
          n.metadata = 1;
          {
            let o = i.dot.v4.WebMetadata.verify(e.web);
            if (o)
              return "web." + o;
          }
        }
        if (e.android != null && e.hasOwnProperty("android")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let o = i.dot.v4.AndroidMetadata.verify(e.android);
            if (o)
              return "android." + o;
          }
        }
        if (e.ios != null && e.hasOwnProperty("ios")) {
          if (n.metadata === 1)
            return "metadata: multiple values";
          n.metadata = 1;
          {
            let o = i.dot.v4.IosMetadata.verify(e.ios);
            if (o)
              return "ios." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.Metadata)
          return e;
        let n = new i.dot.v4.Metadata();
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
          n.web = i.dot.v4.WebMetadata.fromObject(e.web);
        }
        if (e.android != null) {
          if (typeof e.android != "object")
            throw TypeError(".dot.v4.Metadata.android: object expected");
          n.android = i.dot.v4.AndroidMetadata.fromObject(e.android);
        }
        if (e.ios != null) {
          if (typeof e.ios != "object")
            throw TypeError(".dot.v4.Metadata.ios: object expected");
          n.ios = i.dot.v4.IosMetadata.fromObject(e.ios);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.platform = n.enums === String ? "WEB" : 0, o.componentVersion = ""), e.platform != null && e.hasOwnProperty("platform") && (o.platform = n.enums === String ? i.dot.Platform[e.platform] === void 0 ? e.platform : i.dot.Platform[e.platform] : e.platform), e.web != null && e.hasOwnProperty("web") && (o.web = i.dot.v4.WebMetadata.toObject(e.web, n), n.oneofs && (o.metadata = "web")), e.android != null && e.hasOwnProperty("android") && (o.android = i.dot.v4.AndroidMetadata.toObject(e.android, n), n.oneofs && (o.metadata = "android")), e.ios != null && e.hasOwnProperty("ios") && (o.ios = i.dot.v4.IosMetadata.toObject(e.ios, n), n.oneofs && (o.metadata = "ios")), e.sessionToken != null && e.hasOwnProperty("sessionToken") && (o.sessionToken = e.sessionToken, n.oneofs && (o._sessionToken = "sessionToken")), e.componentVersion != null && e.hasOwnProperty("componentVersion") && (o.componentVersion = e.componentVersion), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Metadata";
      }, r;
    }(), s.AndroidMetadata = function() {
      function r(e) {
        if (this.supportedAbis = [], this.digests = [], this.digestsWithTimestamp = [], this.dynamicCameraFrameProperties = {}, e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.supportedAbis = d.emptyArray, r.prototype.device = null, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = d.emptyArray, r.prototype.digestsWithTimestamp = d.emptyArray, r.prototype.dynamicCameraFrameProperties = d.emptyObject, r.prototype.tamperingIndicators = null, r.prototype.croppedYuv420Image = null, r.prototype.yuv420ImageCrop = null;
      let t;
      return Object.defineProperty(r.prototype, "_device", {
        get: d.oneOfGetter(t = ["device"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_camera", {
        get: d.oneOfGetter(t = ["camera"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: d.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_tamperingIndicators", {
        get: d.oneOfGetter(t = ["tamperingIndicators"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedYuv420Image", {
        get: d.oneOfGetter(t = ["croppedYuv420Image"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_yuv420ImageCrop", {
        get: d.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.supportedAbis != null && e.supportedAbis.length)
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
          for (let o = Object.keys(e.dynamicCameraFrameProperties), u = 0; u < o.length; ++u)
            n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[u]), i.dot.Int32List.encode(e.dynamicCameraFrameProperties[o[u]], n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork()).ldelim().ldelim();
        if (e.digestsWithTimestamp != null && e.digestsWithTimestamp.length)
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o)
            i.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && i.dot.v4.AndroidCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && i.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.tamperingIndicators != null && Object.hasOwnProperty.call(e, "tamperingIndicators") && n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).bytes(e.tamperingIndicators), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && i.dot.v4.Yuv420Image.encode(e.croppedYuv420Image, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && i.dot.v4.Yuv420ImageCrop.encode(e.yuv420ImageCrop, n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.AndroidMetadata(), y, j;
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
            case 1: {
              a.supportedAbis && a.supportedAbis.length || (a.supportedAbis = []), a.supportedAbis.push(e.string());
              break;
            }
            case 2: {
              a.device = e.string();
              break;
            }
            case 6: {
              a.camera = i.dot.v4.AndroidCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.digests && a.digests.length || (a.digests = []), a.digests.push(e.bytes());
              break;
            }
            case 5: {
              a.digestsWithTimestamp && a.digestsWithTimestamp.length || (a.digestsWithTimestamp = []), a.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              a.dynamicCameraFrameProperties === d.emptyObject && (a.dynamicCameraFrameProperties = {});
              let v = e.uint32() + e.pos;
              for (y = "", j = null; e.pos < v; ) {
                let I = e.uint32();
                switch (I >>> 3) {
                  case 1:
                    y = e.string();
                    break;
                  case 2:
                    j = i.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(I & 7);
                    break;
                }
              }
              a.dynamicCameraFrameProperties[y] = j;
              break;
            }
            case 8: {
              a.tamperingIndicators = e.bytes();
              break;
            }
            case 9: {
              a.croppedYuv420Image = i.dot.v4.Yuv420Image.decode(e, e.uint32());
              break;
            }
            case 10: {
              a.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.supportedAbis != null && e.hasOwnProperty("supportedAbis")) {
          if (!Array.isArray(e.supportedAbis))
            return "supportedAbis: array expected";
          for (let n = 0; n < e.supportedAbis.length; ++n)
            if (!d.isString(e.supportedAbis[n]))
              return "supportedAbis: string[] expected";
        }
        if (e.device != null && e.hasOwnProperty("device") && !d.isString(e.device))
          return "device: string expected";
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = i.dot.v4.AndroidCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = i.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || d.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let o = i.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.dynamicCameraFrameProperties != null && e.hasOwnProperty("dynamicCameraFrameProperties")) {
          if (!d.isObject(e.dynamicCameraFrameProperties))
            return "dynamicCameraFrameProperties: object expected";
          let n = Object.keys(e.dynamicCameraFrameProperties);
          for (let o = 0; o < n.length; ++o) {
            let u = i.dot.Int32List.verify(e.dynamicCameraFrameProperties[n[o]]);
            if (u)
              return "dynamicCameraFrameProperties." + u;
          }
        }
        if (e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && !(e.tamperingIndicators && typeof e.tamperingIndicators.length == "number" || d.isString(e.tamperingIndicators)))
          return "tamperingIndicators: buffer expected";
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let n = i.dot.v4.Yuv420Image.verify(e.croppedYuv420Image);
          if (n)
            return "croppedYuv420Image." + n;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let n = i.dot.v4.Yuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (n)
            return "yuv420ImageCrop." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.AndroidMetadata)
          return e;
        let n = new i.dot.v4.AndroidMetadata();
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
          n.camera = i.dot.v4.AndroidCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.AndroidMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = i.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.AndroidMetadata.digests: array expected");
          n.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? d.base64.decode(e.digests[o], n.digests[o] = d.newBuffer(d.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (n.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[o] = i.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
          }
        }
        if (e.dynamicCameraFrameProperties) {
          if (typeof e.dynamicCameraFrameProperties != "object")
            throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
          n.dynamicCameraFrameProperties = {};
          for (let o = Object.keys(e.dynamicCameraFrameProperties), u = 0; u < o.length; ++u) {
            if (typeof e.dynamicCameraFrameProperties[o[u]] != "object")
              throw TypeError(".dot.v4.AndroidMetadata.dynamicCameraFrameProperties: object expected");
            n.dynamicCameraFrameProperties[o[u]] = i.dot.Int32List.fromObject(e.dynamicCameraFrameProperties[o[u]]);
          }
        }
        if (e.tamperingIndicators != null && (typeof e.tamperingIndicators == "string" ? d.base64.decode(e.tamperingIndicators, n.tamperingIndicators = d.newBuffer(d.base64.length(e.tamperingIndicators)), 0) : e.tamperingIndicators.length >= 0 && (n.tamperingIndicators = e.tamperingIndicators)), e.croppedYuv420Image != null) {
          if (typeof e.croppedYuv420Image != "object")
            throw TypeError(".dot.v4.AndroidMetadata.croppedYuv420Image: object expected");
          n.croppedYuv420Image = i.dot.v4.Yuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.AndroidMetadata.yuv420ImageCrop: object expected");
          n.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.supportedAbis = [], o.digests = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.dynamicCameraFrameProperties = {}), e.supportedAbis && e.supportedAbis.length) {
          o.supportedAbis = [];
          for (let a = 0; a < e.supportedAbis.length; ++a)
            o.supportedAbis[a] = e.supportedAbis[a];
        }
        if (e.device != null && e.hasOwnProperty("device") && (o.device = e.device, n.oneofs && (o._device = "device")), e.digests && e.digests.length) {
          o.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            o.digests[a] = n.bytes === String ? d.base64.encode(e.digests[a], 0, e.digests[a].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[a]) : e.digests[a];
        }
        let u;
        if (e.dynamicCameraFrameProperties && (u = Object.keys(e.dynamicCameraFrameProperties)).length) {
          o.dynamicCameraFrameProperties = {};
          for (let a = 0; a < u.length; ++a)
            o.dynamicCameraFrameProperties[u[a]] = i.dot.Int32List.toObject(e.dynamicCameraFrameProperties[u[a]], n);
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            o.digestsWithTimestamp[a] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[a], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.AndroidCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.tamperingIndicators != null && e.hasOwnProperty("tamperingIndicators") && (o.tamperingIndicators = n.bytes === String ? d.base64.encode(e.tamperingIndicators, 0, e.tamperingIndicators.length) : n.bytes === Array ? Array.prototype.slice.call(e.tamperingIndicators) : e.tamperingIndicators, n.oneofs && (o._tamperingIndicators = "tamperingIndicators")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.Yuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = i.dot.v4.Yuv420ImageCrop.toObject(e.yuv420ImageCrop, n), n.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.AndroidMetadata";
      }, r;
    }(), s.AndroidCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && i.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.AndroidCamera();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = i.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !d.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.AndroidCamera)
          return t;
        let e = new i.dot.v4.AndroidCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.AndroidCamera.resolution: object expected");
          e.resolution = i.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = i.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AndroidCamera";
      }, r;
    }(), s.Yuv420Image = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = d.newBuffer([]), r.prototype.uPlane = d.newBuffer([]), r.prototype.vPlane = d.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && i.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Yuv420Image();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.size = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.yPlane = t.bytes();
              break;
            }
            case 3: {
              u.uPlane = t.bytes();
              break;
            }
            case 4: {
              u.vPlane = t.bytes();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = i.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || d.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uPlane != null && t.hasOwnProperty("uPlane") && !(t.uPlane && typeof t.uPlane.length == "number" || d.isString(t.uPlane)) ? "uPlane: buffer expected" : t.vPlane != null && t.hasOwnProperty("vPlane") && !(t.vPlane && typeof t.vPlane.length == "number" || d.isString(t.vPlane)) ? "vPlane: buffer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.Yuv420Image)
          return t;
        let e = new i.dot.v4.Yuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.Yuv420Image.size: object expected");
          e.size = i.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? d.base64.decode(t.yPlane, e.yPlane = d.newBuffer(d.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uPlane != null && (typeof t.uPlane == "string" ? d.base64.decode(t.uPlane, e.uPlane = d.newBuffer(d.base64.length(t.uPlane)), 0) : t.uPlane.length >= 0 && (e.uPlane = t.uPlane)), t.vPlane != null && (typeof t.vPlane == "string" ? d.base64.decode(t.vPlane, e.vPlane = d.newBuffer(d.base64.length(t.vPlane)), 0) : t.vPlane.length >= 0 && (e.vPlane = t.vPlane)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.size = null, e.bytes === String ? n.yPlane = "" : (n.yPlane = [], e.bytes !== Array && (n.yPlane = d.newBuffer(n.yPlane))), e.bytes === String ? n.uPlane = "" : (n.uPlane = [], e.bytes !== Array && (n.uPlane = d.newBuffer(n.uPlane))), e.bytes === String ? n.vPlane = "" : (n.vPlane = [], e.bytes !== Array && (n.vPlane = d.newBuffer(n.vPlane)))), t.size != null && t.hasOwnProperty("size") && (n.size = i.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (n.yPlane = e.bytes === String ? d.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uPlane != null && t.hasOwnProperty("uPlane") && (n.uPlane = e.bytes === String ? d.base64.encode(t.uPlane, 0, t.uPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uPlane) : t.uPlane), t.vPlane != null && t.hasOwnProperty("vPlane") && (n.vPlane = e.bytes === String ? d.base64.encode(t.vPlane, 0, t.vPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.vPlane) : t.vPlane), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420Image";
      }, r;
    }(), s.Yuv420ImageCrop = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.v4.Yuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && i.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Yuv420ImageCrop();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.image = i.dot.v4.Yuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = i.dot.v4.Yuv420Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = i.dot.PointInt.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.Yuv420ImageCrop)
          return t;
        let e = new i.dot.v4.Yuv420ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.Yuv420ImageCrop.image: object expected");
          e.image = i.dot.v4.Yuv420Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.Yuv420ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = i.dot.PointInt.fromObject(t.topLeftCorner);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (n.image = i.dot.v4.Yuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (n.topLeftCorner = i.dot.PointInt.toObject(t.topLeftCorner, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Yuv420ImageCrop";
      }, r;
    }(), s.IosMetadata = function() {
      function r(e) {
        if (this.architectureInfo = {}, this.digests = [], this.digestsWithTimestamp = [], this.isoValues = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraModelId = "", r.prototype.architectureInfo = d.emptyObject, r.prototype.camera = null, r.prototype.detectionNormalizedRectangle = null, r.prototype.digests = d.emptyArray, r.prototype.digestsWithTimestamp = d.emptyArray, r.prototype.isoValues = d.emptyArray, r.prototype.croppedYuv420Image = null, r.prototype.yuv420ImageCrop = null;
      let t;
      return Object.defineProperty(r.prototype, "_camera", {
        get: d.oneOfGetter(t = ["camera"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_detectionNormalizedRectangle", {
        get: d.oneOfGetter(t = ["detectionNormalizedRectangle"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedYuv420Image", {
        get: d.oneOfGetter(t = ["croppedYuv420Image"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_yuv420ImageCrop", {
        get: d.oneOfGetter(t = ["yuv420ImageCrop"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.cameraModelId != null && Object.hasOwnProperty.call(e, "cameraModelId") && n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(e.cameraModelId), e.architectureInfo != null && Object.hasOwnProperty.call(e, "architectureInfo"))
          for (let o = Object.keys(e.architectureInfo), u = 0; u < o.length; ++u)
            n.uint32(
              /* id 2, wireType 2 =*/
              18
            ).fork().uint32(
              /* id 1, wireType 2 =*/
              10
            ).string(o[u]).uint32(
              /* id 2, wireType 0 =*/
              16
            ).bool(e.architectureInfo[o[u]]).ldelim();
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
            i.dot.DigestWithTimestamp.encode(e.digestsWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.camera != null && Object.hasOwnProperty.call(e, "camera") && i.dot.v4.IosCamera.encode(e.camera, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.detectionNormalizedRectangle != null && Object.hasOwnProperty.call(e, "detectionNormalizedRectangle") && i.dot.RectangleDouble.encode(e.detectionNormalizedRectangle, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.croppedYuv420Image != null && Object.hasOwnProperty.call(e, "croppedYuv420Image") && i.dot.v4.IosYuv420Image.encode(e.croppedYuv420Image, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.yuv420ImageCrop != null && Object.hasOwnProperty.call(e, "yuv420ImageCrop") && i.dot.v4.IosYuv420ImageCrop.encode(e.yuv420ImageCrop, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.IosMetadata(), y, j;
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
            case 1: {
              a.cameraModelId = e.string();
              break;
            }
            case 2: {
              a.architectureInfo === d.emptyObject && (a.architectureInfo = {});
              let v = e.uint32() + e.pos;
              for (y = "", j = !1; e.pos < v; ) {
                let I = e.uint32();
                switch (I >>> 3) {
                  case 1:
                    y = e.string();
                    break;
                  case 2:
                    j = e.bool();
                    break;
                  default:
                    e.skipType(I & 7);
                    break;
                }
              }
              a.architectureInfo[y] = j;
              break;
            }
            case 6: {
              a.camera = i.dot.v4.IosCamera.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.detectionNormalizedRectangle = i.dot.RectangleDouble.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.digests && a.digests.length || (a.digests = []), a.digests.push(e.bytes());
              break;
            }
            case 5: {
              a.digestsWithTimestamp && a.digestsWithTimestamp.length || (a.digestsWithTimestamp = []), a.digestsWithTimestamp.push(i.dot.DigestWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              if (a.isoValues && a.isoValues.length || (a.isoValues = []), (h & 7) === 2) {
                let v = e.uint32() + e.pos;
                for (; e.pos < v; )
                  a.isoValues.push(e.int32());
              } else
                a.isoValues.push(e.int32());
              break;
            }
            case 8: {
              a.croppedYuv420Image = i.dot.v4.IosYuv420Image.decode(e, e.uint32());
              break;
            }
            case 9: {
              a.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && !d.isString(e.cameraModelId))
          return "cameraModelId: string expected";
        if (e.architectureInfo != null && e.hasOwnProperty("architectureInfo")) {
          if (!d.isObject(e.architectureInfo))
            return "architectureInfo: object expected";
          let n = Object.keys(e.architectureInfo);
          for (let o = 0; o < n.length; ++o)
            if (typeof e.architectureInfo[n[o]] != "boolean")
              return "architectureInfo: boolean{k:string} expected";
        }
        if (e.camera != null && e.hasOwnProperty("camera")) {
          let n = i.dot.v4.IosCamera.verify(e.camera);
          if (n)
            return "camera." + n;
        }
        if (e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle")) {
          let n = i.dot.RectangleDouble.verify(e.detectionNormalizedRectangle);
          if (n)
            return "detectionNormalizedRectangle." + n;
        }
        if (e.digests != null && e.hasOwnProperty("digests")) {
          if (!Array.isArray(e.digests))
            return "digests: array expected";
          for (let n = 0; n < e.digests.length; ++n)
            if (!(e.digests[n] && typeof e.digests[n].length == "number" || d.isString(e.digests[n])))
              return "digests: buffer[] expected";
        }
        if (e.digestsWithTimestamp != null && e.hasOwnProperty("digestsWithTimestamp")) {
          if (!Array.isArray(e.digestsWithTimestamp))
            return "digestsWithTimestamp: array expected";
          for (let n = 0; n < e.digestsWithTimestamp.length; ++n) {
            let o = i.dot.DigestWithTimestamp.verify(e.digestsWithTimestamp[n]);
            if (o)
              return "digestsWithTimestamp." + o;
          }
        }
        if (e.isoValues != null && e.hasOwnProperty("isoValues")) {
          if (!Array.isArray(e.isoValues))
            return "isoValues: array expected";
          for (let n = 0; n < e.isoValues.length; ++n)
            if (!d.isInteger(e.isoValues[n]))
              return "isoValues: integer[] expected";
        }
        if (e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image")) {
          let n = i.dot.v4.IosYuv420Image.verify(e.croppedYuv420Image);
          if (n)
            return "croppedYuv420Image." + n;
        }
        if (e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop")) {
          let n = i.dot.v4.IosYuv420ImageCrop.verify(e.yuv420ImageCrop);
          if (n)
            return "yuv420ImageCrop." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.IosMetadata)
          return e;
        let n = new i.dot.v4.IosMetadata();
        if (e.cameraModelId != null && (n.cameraModelId = String(e.cameraModelId)), e.architectureInfo) {
          if (typeof e.architectureInfo != "object")
            throw TypeError(".dot.v4.IosMetadata.architectureInfo: object expected");
          n.architectureInfo = {};
          for (let o = Object.keys(e.architectureInfo), u = 0; u < o.length; ++u)
            n.architectureInfo[o[u]] = !!e.architectureInfo[o[u]];
        }
        if (e.camera != null) {
          if (typeof e.camera != "object")
            throw TypeError(".dot.v4.IosMetadata.camera: object expected");
          n.camera = i.dot.v4.IosCamera.fromObject(e.camera);
        }
        if (e.detectionNormalizedRectangle != null) {
          if (typeof e.detectionNormalizedRectangle != "object")
            throw TypeError(".dot.v4.IosMetadata.detectionNormalizedRectangle: object expected");
          n.detectionNormalizedRectangle = i.dot.RectangleDouble.fromObject(e.detectionNormalizedRectangle);
        }
        if (e.digests) {
          if (!Array.isArray(e.digests))
            throw TypeError(".dot.v4.IosMetadata.digests: array expected");
          n.digests = [];
          for (let o = 0; o < e.digests.length; ++o)
            typeof e.digests[o] == "string" ? d.base64.decode(e.digests[o], n.digests[o] = d.newBuffer(d.base64.length(e.digests[o])), 0) : e.digests[o].length >= 0 && (n.digests[o] = e.digests[o]);
        }
        if (e.digestsWithTimestamp) {
          if (!Array.isArray(e.digestsWithTimestamp))
            throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: array expected");
          n.digestsWithTimestamp = [];
          for (let o = 0; o < e.digestsWithTimestamp.length; ++o) {
            if (typeof e.digestsWithTimestamp[o] != "object")
              throw TypeError(".dot.v4.IosMetadata.digestsWithTimestamp: object expected");
            n.digestsWithTimestamp[o] = i.dot.DigestWithTimestamp.fromObject(e.digestsWithTimestamp[o]);
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
          n.croppedYuv420Image = i.dot.v4.IosYuv420Image.fromObject(e.croppedYuv420Image);
        }
        if (e.yuv420ImageCrop != null) {
          if (typeof e.yuv420ImageCrop != "object")
            throw TypeError(".dot.v4.IosMetadata.yuv420ImageCrop: object expected");
          n.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.fromObject(e.yuv420ImageCrop);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        (n.arrays || n.defaults) && (o.digests = [], o.isoValues = [], o.digestsWithTimestamp = []), (n.objects || n.defaults) && (o.architectureInfo = {}), n.defaults && (o.cameraModelId = ""), e.cameraModelId != null && e.hasOwnProperty("cameraModelId") && (o.cameraModelId = e.cameraModelId);
        let u;
        if (e.architectureInfo && (u = Object.keys(e.architectureInfo)).length) {
          o.architectureInfo = {};
          for (let a = 0; a < u.length; ++a)
            o.architectureInfo[u[a]] = e.architectureInfo[u[a]];
        }
        if (e.digests && e.digests.length) {
          o.digests = [];
          for (let a = 0; a < e.digests.length; ++a)
            o.digests[a] = n.bytes === String ? d.base64.encode(e.digests[a], 0, e.digests[a].length) : n.bytes === Array ? Array.prototype.slice.call(e.digests[a]) : e.digests[a];
        }
        if (e.isoValues && e.isoValues.length) {
          o.isoValues = [];
          for (let a = 0; a < e.isoValues.length; ++a)
            o.isoValues[a] = e.isoValues[a];
        }
        if (e.digestsWithTimestamp && e.digestsWithTimestamp.length) {
          o.digestsWithTimestamp = [];
          for (let a = 0; a < e.digestsWithTimestamp.length; ++a)
            o.digestsWithTimestamp[a] = i.dot.DigestWithTimestamp.toObject(e.digestsWithTimestamp[a], n);
        }
        return e.camera != null && e.hasOwnProperty("camera") && (o.camera = i.dot.v4.IosCamera.toObject(e.camera, n), n.oneofs && (o._camera = "camera")), e.detectionNormalizedRectangle != null && e.hasOwnProperty("detectionNormalizedRectangle") && (o.detectionNormalizedRectangle = i.dot.RectangleDouble.toObject(e.detectionNormalizedRectangle, n), n.oneofs && (o._detectionNormalizedRectangle = "detectionNormalizedRectangle")), e.croppedYuv420Image != null && e.hasOwnProperty("croppedYuv420Image") && (o.croppedYuv420Image = i.dot.v4.IosYuv420Image.toObject(e.croppedYuv420Image, n), n.oneofs && (o._croppedYuv420Image = "croppedYuv420Image")), e.yuv420ImageCrop != null && e.hasOwnProperty("yuv420ImageCrop") && (o.yuv420ImageCrop = i.dot.v4.IosYuv420ImageCrop.toObject(e.yuv420ImageCrop, n), n.oneofs && (o._yuv420ImageCrop = "yuv420ImageCrop")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.IosMetadata";
      }, r;
    }(), s.IosCamera = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.resolution = null, r.prototype.rotationDegrees = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.resolution != null && Object.hasOwnProperty.call(t, "resolution") && i.dot.ImageSize.encode(t.resolution, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.rotationDegrees != null && Object.hasOwnProperty.call(t, "rotationDegrees") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.rotationDegrees), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosCamera();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.resolution = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.rotationDegrees = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.resolution != null && t.hasOwnProperty("resolution")) {
          let e = i.dot.ImageSize.verify(t.resolution);
          if (e)
            return "resolution." + e;
        }
        return t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && !d.isInteger(t.rotationDegrees) ? "rotationDegrees: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosCamera)
          return t;
        let e = new i.dot.v4.IosCamera();
        if (t.resolution != null) {
          if (typeof t.resolution != "object")
            throw TypeError(".dot.v4.IosCamera.resolution: object expected");
          e.resolution = i.dot.ImageSize.fromObject(t.resolution);
        }
        return t.rotationDegrees != null && (e.rotationDegrees = t.rotationDegrees | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.resolution = null, n.rotationDegrees = 0), t.resolution != null && t.hasOwnProperty("resolution") && (n.resolution = i.dot.ImageSize.toObject(t.resolution, e)), t.rotationDegrees != null && t.hasOwnProperty("rotationDegrees") && (n.rotationDegrees = t.rotationDegrees), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosCamera";
      }, r;
    }(), s.IosYuv420Image = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.size = null, r.prototype.yPlane = d.newBuffer([]), r.prototype.uvPlane = d.newBuffer([]), r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.size != null && Object.hasOwnProperty.call(t, "size") && i.dot.ImageSize.encode(t.size, e.uint32(
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
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosYuv420Image();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.size = i.dot.ImageSize.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.yPlane = t.bytes();
              break;
            }
            case 3: {
              u.uvPlane = t.bytes();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.size != null && t.hasOwnProperty("size")) {
          let e = i.dot.ImageSize.verify(t.size);
          if (e)
            return "size." + e;
        }
        return t.yPlane != null && t.hasOwnProperty("yPlane") && !(t.yPlane && typeof t.yPlane.length == "number" || d.isString(t.yPlane)) ? "yPlane: buffer expected" : t.uvPlane != null && t.hasOwnProperty("uvPlane") && !(t.uvPlane && typeof t.uvPlane.length == "number" || d.isString(t.uvPlane)) ? "uvPlane: buffer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosYuv420Image)
          return t;
        let e = new i.dot.v4.IosYuv420Image();
        if (t.size != null) {
          if (typeof t.size != "object")
            throw TypeError(".dot.v4.IosYuv420Image.size: object expected");
          e.size = i.dot.ImageSize.fromObject(t.size);
        }
        return t.yPlane != null && (typeof t.yPlane == "string" ? d.base64.decode(t.yPlane, e.yPlane = d.newBuffer(d.base64.length(t.yPlane)), 0) : t.yPlane.length >= 0 && (e.yPlane = t.yPlane)), t.uvPlane != null && (typeof t.uvPlane == "string" ? d.base64.decode(t.uvPlane, e.uvPlane = d.newBuffer(d.base64.length(t.uvPlane)), 0) : t.uvPlane.length >= 0 && (e.uvPlane = t.uvPlane)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.size = null, e.bytes === String ? n.yPlane = "" : (n.yPlane = [], e.bytes !== Array && (n.yPlane = d.newBuffer(n.yPlane))), e.bytes === String ? n.uvPlane = "" : (n.uvPlane = [], e.bytes !== Array && (n.uvPlane = d.newBuffer(n.uvPlane)))), t.size != null && t.hasOwnProperty("size") && (n.size = i.dot.ImageSize.toObject(t.size, e)), t.yPlane != null && t.hasOwnProperty("yPlane") && (n.yPlane = e.bytes === String ? d.base64.encode(t.yPlane, 0, t.yPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.yPlane) : t.yPlane), t.uvPlane != null && t.hasOwnProperty("uvPlane") && (n.uvPlane = e.bytes === String ? d.base64.encode(t.uvPlane, 0, t.uvPlane.length) : e.bytes === Array ? Array.prototype.slice.call(t.uvPlane) : t.uvPlane), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420Image";
      }, r;
    }(), s.IosYuv420ImageCrop = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.v4.IosYuv420Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && i.dot.PointInt.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.IosYuv420ImageCrop();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.image = i.dot.v4.IosYuv420Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.PointInt.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = i.dot.v4.IosYuv420Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = i.dot.PointInt.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.IosYuv420ImageCrop)
          return t;
        let e = new i.dot.v4.IosYuv420ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.IosYuv420ImageCrop.image: object expected");
          e.image = i.dot.v4.IosYuv420Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.IosYuv420ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = i.dot.PointInt.fromObject(t.topLeftCorner);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (n.image = i.dot.v4.IosYuv420Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (n.topLeftCorner = i.dot.PointInt.toObject(t.topLeftCorner, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.IosYuv420ImageCrop";
      }, r;
    }(), s.WebMetadata = function() {
      function r(e) {
        if (this.availableCameraProperties = [], this.hashedDetectedImages = [], this.hashedDetectedImagesWithTimestamp = [], this.detectionRecord = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.currentCameraProperties = null, r.prototype.availableCameraProperties = d.emptyArray, r.prototype.hashedDetectedImages = d.emptyArray, r.prototype.hashedDetectedImagesWithTimestamp = d.emptyArray, r.prototype.detectionRecord = d.emptyArray, r.prototype.croppedImage = null, r.prototype.croppedImageWithPosition = null, r.prototype.platformDetails = null;
      let t;
      return Object.defineProperty(r.prototype, "_croppedImage", {
        get: d.oneOfGetter(t = ["croppedImage"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_croppedImageWithPosition", {
        get: d.oneOfGetter(t = ["croppedImageWithPosition"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_platformDetails", {
        get: d.oneOfGetter(t = ["platformDetails"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.currentCameraProperties != null && Object.hasOwnProperty.call(e, "currentCameraProperties") && i.dot.v4.MediaTrackSettings.encode(e.currentCameraProperties, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.availableCameraProperties != null && e.availableCameraProperties.length)
          for (let o = 0; o < e.availableCameraProperties.length; ++o)
            i.dot.v4.CameraProperties.encode(e.availableCameraProperties[o], n.uint32(
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
            i.dot.v4.DetectedObject.encode(e.detectionRecord[o], n.uint32(
              /* id 4, wireType 2 =*/
              34
            ).fork()).ldelim();
        if (e.hashedDetectedImagesWithTimestamp != null && e.hashedDetectedImagesWithTimestamp.length)
          for (let o = 0; o < e.hashedDetectedImagesWithTimestamp.length; ++o)
            i.dot.v4.HashedDetectedImageWithTimestamp.encode(e.hashedDetectedImagesWithTimestamp[o], n.uint32(
              /* id 5, wireType 2 =*/
              42
            ).fork()).ldelim();
        return e.croppedImage != null && Object.hasOwnProperty.call(e, "croppedImage") && i.dot.Image.encode(e.croppedImage, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.croppedImageWithPosition != null && Object.hasOwnProperty.call(e, "croppedImageWithPosition") && i.dot.v4.ImageCrop.encode(e.croppedImageWithPosition, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.platformDetails != null && Object.hasOwnProperty.call(e, "platformDetails") && i.dot.v4.PlatformDetails.encode(e.platformDetails, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.WebMetadata();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.currentCameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.availableCameraProperties && a.availableCameraProperties.length || (a.availableCameraProperties = []), a.availableCameraProperties.push(i.dot.v4.CameraProperties.decode(e, e.uint32()));
              break;
            }
            case 3: {
              a.hashedDetectedImages && a.hashedDetectedImages.length || (a.hashedDetectedImages = []), a.hashedDetectedImages.push(e.string());
              break;
            }
            case 5: {
              a.hashedDetectedImagesWithTimestamp && a.hashedDetectedImagesWithTimestamp.length || (a.hashedDetectedImagesWithTimestamp = []), a.hashedDetectedImagesWithTimestamp.push(i.dot.v4.HashedDetectedImageWithTimestamp.decode(e, e.uint32()));
              break;
            }
            case 4: {
              a.detectionRecord && a.detectionRecord.length || (a.detectionRecord = []), a.detectionRecord.push(i.dot.v4.DetectedObject.decode(e, e.uint32()));
              break;
            }
            case 6: {
              a.croppedImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.croppedImageWithPosition = i.dot.v4.ImageCrop.decode(e, e.uint32());
              break;
            }
            case 8: {
              a.platformDetails = i.dot.v4.PlatformDetails.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties")) {
          let n = i.dot.v4.MediaTrackSettings.verify(e.currentCameraProperties);
          if (n)
            return "currentCameraProperties." + n;
        }
        if (e.availableCameraProperties != null && e.hasOwnProperty("availableCameraProperties")) {
          if (!Array.isArray(e.availableCameraProperties))
            return "availableCameraProperties: array expected";
          for (let n = 0; n < e.availableCameraProperties.length; ++n) {
            let o = i.dot.v4.CameraProperties.verify(e.availableCameraProperties[n]);
            if (o)
              return "availableCameraProperties." + o;
          }
        }
        if (e.hashedDetectedImages != null && e.hasOwnProperty("hashedDetectedImages")) {
          if (!Array.isArray(e.hashedDetectedImages))
            return "hashedDetectedImages: array expected";
          for (let n = 0; n < e.hashedDetectedImages.length; ++n)
            if (!d.isString(e.hashedDetectedImages[n]))
              return "hashedDetectedImages: string[] expected";
        }
        if (e.hashedDetectedImagesWithTimestamp != null && e.hasOwnProperty("hashedDetectedImagesWithTimestamp")) {
          if (!Array.isArray(e.hashedDetectedImagesWithTimestamp))
            return "hashedDetectedImagesWithTimestamp: array expected";
          for (let n = 0; n < e.hashedDetectedImagesWithTimestamp.length; ++n) {
            let o = i.dot.v4.HashedDetectedImageWithTimestamp.verify(e.hashedDetectedImagesWithTimestamp[n]);
            if (o)
              return "hashedDetectedImagesWithTimestamp." + o;
          }
        }
        if (e.detectionRecord != null && e.hasOwnProperty("detectionRecord")) {
          if (!Array.isArray(e.detectionRecord))
            return "detectionRecord: array expected";
          for (let n = 0; n < e.detectionRecord.length; ++n) {
            let o = i.dot.v4.DetectedObject.verify(e.detectionRecord[n]);
            if (o)
              return "detectionRecord." + o;
          }
        }
        if (e.croppedImage != null && e.hasOwnProperty("croppedImage")) {
          let n = i.dot.Image.verify(e.croppedImage);
          if (n)
            return "croppedImage." + n;
        }
        if (e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition")) {
          let n = i.dot.v4.ImageCrop.verify(e.croppedImageWithPosition);
          if (n)
            return "croppedImageWithPosition." + n;
        }
        if (e.platformDetails != null && e.hasOwnProperty("platformDetails")) {
          let n = i.dot.v4.PlatformDetails.verify(e.platformDetails);
          if (n)
            return "platformDetails." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.WebMetadata)
          return e;
        let n = new i.dot.v4.WebMetadata();
        if (e.currentCameraProperties != null) {
          if (typeof e.currentCameraProperties != "object")
            throw TypeError(".dot.v4.WebMetadata.currentCameraProperties: object expected");
          n.currentCameraProperties = i.dot.v4.MediaTrackSettings.fromObject(e.currentCameraProperties);
        }
        if (e.availableCameraProperties) {
          if (!Array.isArray(e.availableCameraProperties))
            throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: array expected");
          n.availableCameraProperties = [];
          for (let o = 0; o < e.availableCameraProperties.length; ++o) {
            if (typeof e.availableCameraProperties[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.availableCameraProperties: object expected");
            n.availableCameraProperties[o] = i.dot.v4.CameraProperties.fromObject(e.availableCameraProperties[o]);
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
            n.hashedDetectedImagesWithTimestamp[o] = i.dot.v4.HashedDetectedImageWithTimestamp.fromObject(e.hashedDetectedImagesWithTimestamp[o]);
          }
        }
        if (e.detectionRecord) {
          if (!Array.isArray(e.detectionRecord))
            throw TypeError(".dot.v4.WebMetadata.detectionRecord: array expected");
          n.detectionRecord = [];
          for (let o = 0; o < e.detectionRecord.length; ++o) {
            if (typeof e.detectionRecord[o] != "object")
              throw TypeError(".dot.v4.WebMetadata.detectionRecord: object expected");
            n.detectionRecord[o] = i.dot.v4.DetectedObject.fromObject(e.detectionRecord[o]);
          }
        }
        if (e.croppedImage != null) {
          if (typeof e.croppedImage != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImage: object expected");
          n.croppedImage = i.dot.Image.fromObject(e.croppedImage);
        }
        if (e.croppedImageWithPosition != null) {
          if (typeof e.croppedImageWithPosition != "object")
            throw TypeError(".dot.v4.WebMetadata.croppedImageWithPosition: object expected");
          n.croppedImageWithPosition = i.dot.v4.ImageCrop.fromObject(e.croppedImageWithPosition);
        }
        if (e.platformDetails != null) {
          if (typeof e.platformDetails != "object")
            throw TypeError(".dot.v4.WebMetadata.platformDetails: object expected");
          n.platformDetails = i.dot.v4.PlatformDetails.fromObject(e.platformDetails);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.availableCameraProperties = [], o.hashedDetectedImages = [], o.detectionRecord = [], o.hashedDetectedImagesWithTimestamp = []), n.defaults && (o.currentCameraProperties = null), e.currentCameraProperties != null && e.hasOwnProperty("currentCameraProperties") && (o.currentCameraProperties = i.dot.v4.MediaTrackSettings.toObject(e.currentCameraProperties, n)), e.availableCameraProperties && e.availableCameraProperties.length) {
          o.availableCameraProperties = [];
          for (let u = 0; u < e.availableCameraProperties.length; ++u)
            o.availableCameraProperties[u] = i.dot.v4.CameraProperties.toObject(e.availableCameraProperties[u], n);
        }
        if (e.hashedDetectedImages && e.hashedDetectedImages.length) {
          o.hashedDetectedImages = [];
          for (let u = 0; u < e.hashedDetectedImages.length; ++u)
            o.hashedDetectedImages[u] = e.hashedDetectedImages[u];
        }
        if (e.detectionRecord && e.detectionRecord.length) {
          o.detectionRecord = [];
          for (let u = 0; u < e.detectionRecord.length; ++u)
            o.detectionRecord[u] = i.dot.v4.DetectedObject.toObject(e.detectionRecord[u], n);
        }
        if (e.hashedDetectedImagesWithTimestamp && e.hashedDetectedImagesWithTimestamp.length) {
          o.hashedDetectedImagesWithTimestamp = [];
          for (let u = 0; u < e.hashedDetectedImagesWithTimestamp.length; ++u)
            o.hashedDetectedImagesWithTimestamp[u] = i.dot.v4.HashedDetectedImageWithTimestamp.toObject(e.hashedDetectedImagesWithTimestamp[u], n);
        }
        return e.croppedImage != null && e.hasOwnProperty("croppedImage") && (o.croppedImage = i.dot.Image.toObject(e.croppedImage, n), n.oneofs && (o._croppedImage = "croppedImage")), e.croppedImageWithPosition != null && e.hasOwnProperty("croppedImageWithPosition") && (o.croppedImageWithPosition = i.dot.v4.ImageCrop.toObject(e.croppedImageWithPosition, n), n.oneofs && (o._croppedImageWithPosition = "croppedImageWithPosition")), e.platformDetails != null && e.hasOwnProperty("platformDetails") && (o.platformDetails = i.dot.v4.PlatformDetails.toObject(e.platformDetails, n), n.oneofs && (o._platformDetails = "platformDetails")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.WebMetadata";
      }, r;
    }(), s.HashedDetectedImageWithTimestamp = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.imageHash = "", r.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.imageHash != null && Object.hasOwnProperty.call(t, "imageHash") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.imageHash), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).uint64(t.timestampMillis), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.HashedDetectedImageWithTimestamp();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.imageHash = t.string();
              break;
            }
            case 2: {
              u.timestampMillis = t.uint64();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.imageHash != null && t.hasOwnProperty("imageHash") && !d.isString(t.imageHash) ? "imageHash: string expected" : t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !d.isInteger(t.timestampMillis) && !(t.timestampMillis && d.isInteger(t.timestampMillis.low) && d.isInteger(t.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.HashedDetectedImageWithTimestamp)
          return t;
        let e = new i.dot.v4.HashedDetectedImageWithTimestamp();
        return t.imageHash != null && (e.imageHash = String(t.imageHash)), t.timestampMillis != null && (d.Long ? (e.timestampMillis = d.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new d.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if (e.defaults)
          if (n.imageHash = "", d.Long) {
            let o = new d.Long(0, 0, !0);
            n.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            n.timestampMillis = e.longs === String ? "0" : 0;
        return t.imageHash != null && t.hasOwnProperty("imageHash") && (n.imageHash = t.imageHash), t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? n.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : n.timestampMillis = e.longs === String ? d.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new d.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.HashedDetectedImageWithTimestamp";
      }, r;
    }(), s.MediaTrackSettings = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.aspectRatio = null, r.prototype.autoGainControl = null, r.prototype.channelCount = null, r.prototype.deviceId = null, r.prototype.displaySurface = null, r.prototype.echoCancellation = null, r.prototype.facingMode = null, r.prototype.frameRate = null, r.prototype.groupId = null, r.prototype.height = null, r.prototype.noiseSuppression = null, r.prototype.sampleRate = null, r.prototype.sampleSize = null, r.prototype.width = null, r.prototype.deviceName = null;
      let t;
      return Object.defineProperty(r.prototype, "_aspectRatio", {
        get: d.oneOfGetter(t = ["aspectRatio"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_autoGainControl", {
        get: d.oneOfGetter(t = ["autoGainControl"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_channelCount", {
        get: d.oneOfGetter(t = ["channelCount"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceId", {
        get: d.oneOfGetter(t = ["deviceId"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_displaySurface", {
        get: d.oneOfGetter(t = ["displaySurface"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_echoCancellation", {
        get: d.oneOfGetter(t = ["echoCancellation"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_facingMode", {
        get: d.oneOfGetter(t = ["facingMode"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_frameRate", {
        get: d.oneOfGetter(t = ["frameRate"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_groupId", {
        get: d.oneOfGetter(t = ["groupId"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_height", {
        get: d.oneOfGetter(t = ["height"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_noiseSuppression", {
        get: d.oneOfGetter(t = ["noiseSuppression"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleRate", {
        get: d.oneOfGetter(t = ["sampleRate"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_sampleSize", {
        get: d.oneOfGetter(t = ["sampleSize"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_width", {
        get: d.oneOfGetter(t = ["width"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_deviceName", {
        get: d.oneOfGetter(t = ["deviceName"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.aspectRatio != null && Object.hasOwnProperty.call(e, "aspectRatio") && n.uint32(
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
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.MediaTrackSettings();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.aspectRatio = e.double();
              break;
            }
            case 2: {
              a.autoGainControl = e.bool();
              break;
            }
            case 3: {
              a.channelCount = e.int32();
              break;
            }
            case 4: {
              a.deviceId = e.string();
              break;
            }
            case 5: {
              a.displaySurface = e.string();
              break;
            }
            case 6: {
              a.echoCancellation = e.bool();
              break;
            }
            case 7: {
              a.facingMode = e.string();
              break;
            }
            case 8: {
              a.frameRate = e.double();
              break;
            }
            case 9: {
              a.groupId = e.string();
              break;
            }
            case 10: {
              a.height = e.int32();
              break;
            }
            case 11: {
              a.noiseSuppression = e.bool();
              break;
            }
            case 12: {
              a.sampleRate = e.int32();
              break;
            }
            case 13: {
              a.sampleSize = e.int32();
              break;
            }
            case 14: {
              a.width = e.int32();
              break;
            }
            case 15: {
              a.deviceName = e.string();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        return typeof e != "object" || e === null ? "object expected" : e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && typeof e.aspectRatio != "number" ? "aspectRatio: number expected" : e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && typeof e.autoGainControl != "boolean" ? "autoGainControl: boolean expected" : e.channelCount != null && e.hasOwnProperty("channelCount") && !d.isInteger(e.channelCount) ? "channelCount: integer expected" : e.deviceId != null && e.hasOwnProperty("deviceId") && !d.isString(e.deviceId) ? "deviceId: string expected" : e.displaySurface != null && e.hasOwnProperty("displaySurface") && !d.isString(e.displaySurface) ? "displaySurface: string expected" : e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && typeof e.echoCancellation != "boolean" ? "echoCancellation: boolean expected" : e.facingMode != null && e.hasOwnProperty("facingMode") && !d.isString(e.facingMode) ? "facingMode: string expected" : e.frameRate != null && e.hasOwnProperty("frameRate") && typeof e.frameRate != "number" ? "frameRate: number expected" : e.groupId != null && e.hasOwnProperty("groupId") && !d.isString(e.groupId) ? "groupId: string expected" : e.height != null && e.hasOwnProperty("height") && !d.isInteger(e.height) ? "height: integer expected" : e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && typeof e.noiseSuppression != "boolean" ? "noiseSuppression: boolean expected" : e.sampleRate != null && e.hasOwnProperty("sampleRate") && !d.isInteger(e.sampleRate) ? "sampleRate: integer expected" : e.sampleSize != null && e.hasOwnProperty("sampleSize") && !d.isInteger(e.sampleSize) ? "sampleSize: integer expected" : e.width != null && e.hasOwnProperty("width") && !d.isInteger(e.width) ? "width: integer expected" : e.deviceName != null && e.hasOwnProperty("deviceName") && !d.isString(e.deviceName) ? "deviceName: string expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.MediaTrackSettings)
          return e;
        let n = new i.dot.v4.MediaTrackSettings();
        return e.aspectRatio != null && (n.aspectRatio = Number(e.aspectRatio)), e.autoGainControl != null && (n.autoGainControl = !!e.autoGainControl), e.channelCount != null && (n.channelCount = e.channelCount | 0), e.deviceId != null && (n.deviceId = String(e.deviceId)), e.displaySurface != null && (n.displaySurface = String(e.displaySurface)), e.echoCancellation != null && (n.echoCancellation = !!e.echoCancellation), e.facingMode != null && (n.facingMode = String(e.facingMode)), e.frameRate != null && (n.frameRate = Number(e.frameRate)), e.groupId != null && (n.groupId = String(e.groupId)), e.height != null && (n.height = e.height | 0), e.noiseSuppression != null && (n.noiseSuppression = !!e.noiseSuppression), e.sampleRate != null && (n.sampleRate = e.sampleRate | 0), e.sampleSize != null && (n.sampleSize = e.sampleSize | 0), e.width != null && (n.width = e.width | 0), e.deviceName != null && (n.deviceName = String(e.deviceName)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return e.aspectRatio != null && e.hasOwnProperty("aspectRatio") && (o.aspectRatio = n.json && !isFinite(e.aspectRatio) ? String(e.aspectRatio) : e.aspectRatio, n.oneofs && (o._aspectRatio = "aspectRatio")), e.autoGainControl != null && e.hasOwnProperty("autoGainControl") && (o.autoGainControl = e.autoGainControl, n.oneofs && (o._autoGainControl = "autoGainControl")), e.channelCount != null && e.hasOwnProperty("channelCount") && (o.channelCount = e.channelCount, n.oneofs && (o._channelCount = "channelCount")), e.deviceId != null && e.hasOwnProperty("deviceId") && (o.deviceId = e.deviceId, n.oneofs && (o._deviceId = "deviceId")), e.displaySurface != null && e.hasOwnProperty("displaySurface") && (o.displaySurface = e.displaySurface, n.oneofs && (o._displaySurface = "displaySurface")), e.echoCancellation != null && e.hasOwnProperty("echoCancellation") && (o.echoCancellation = e.echoCancellation, n.oneofs && (o._echoCancellation = "echoCancellation")), e.facingMode != null && e.hasOwnProperty("facingMode") && (o.facingMode = e.facingMode, n.oneofs && (o._facingMode = "facingMode")), e.frameRate != null && e.hasOwnProperty("frameRate") && (o.frameRate = n.json && !isFinite(e.frameRate) ? String(e.frameRate) : e.frameRate, n.oneofs && (o._frameRate = "frameRate")), e.groupId != null && e.hasOwnProperty("groupId") && (o.groupId = e.groupId, n.oneofs && (o._groupId = "groupId")), e.height != null && e.hasOwnProperty("height") && (o.height = e.height, n.oneofs && (o._height = "height")), e.noiseSuppression != null && e.hasOwnProperty("noiseSuppression") && (o.noiseSuppression = e.noiseSuppression, n.oneofs && (o._noiseSuppression = "noiseSuppression")), e.sampleRate != null && e.hasOwnProperty("sampleRate") && (o.sampleRate = e.sampleRate, n.oneofs && (o._sampleRate = "sampleRate")), e.sampleSize != null && e.hasOwnProperty("sampleSize") && (o.sampleSize = e.sampleSize, n.oneofs && (o._sampleSize = "sampleSize")), e.width != null && e.hasOwnProperty("width") && (o.width = e.width, n.oneofs && (o._width = "width")), e.deviceName != null && e.hasOwnProperty("deviceName") && (o.deviceName = e.deviceName, n.oneofs && (o._deviceName = "deviceName")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MediaTrackSettings";
      }, r;
    }(), s.ImageBitmap = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.width = 0, r.prototype.height = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.width != null && Object.hasOwnProperty.call(t, "width") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.width), t.height != null && Object.hasOwnProperty.call(t, "height") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.height), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.ImageBitmap();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.width = t.int32();
              break;
            }
            case 2: {
              u.height = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.width != null && t.hasOwnProperty("width") && !d.isInteger(t.width) ? "width: integer expected" : t.height != null && t.hasOwnProperty("height") && !d.isInteger(t.height) ? "height: integer expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.ImageBitmap)
          return t;
        let e = new i.dot.v4.ImageBitmap();
        return t.width != null && (e.width = t.width | 0), t.height != null && (e.height = t.height | 0), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.width = 0, n.height = 0), t.width != null && t.hasOwnProperty("width") && (n.width = t.width), t.height != null && t.hasOwnProperty("height") && (n.height = t.height), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageBitmap";
      }, r;
    }(), s.CameraProperties = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.cameraInitFrameResolution = null, r.prototype.cameraProperties = null;
      let t;
      return Object.defineProperty(r.prototype, "_cameraInitFrameResolution", {
        get: d.oneOfGetter(t = ["cameraInitFrameResolution"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.cameraInitFrameResolution != null && Object.hasOwnProperty.call(e, "cameraInitFrameResolution") && i.dot.v4.ImageBitmap.encode(e.cameraInitFrameResolution, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.cameraProperties != null && Object.hasOwnProperty.call(e, "cameraProperties") && i.dot.v4.MediaTrackSettings.encode(e.cameraProperties, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.CameraProperties();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.cameraInitFrameResolution = i.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.cameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution")) {
          let n = i.dot.v4.ImageBitmap.verify(e.cameraInitFrameResolution);
          if (n)
            return "cameraInitFrameResolution." + n;
        }
        if (e.cameraProperties != null && e.hasOwnProperty("cameraProperties")) {
          let n = i.dot.v4.MediaTrackSettings.verify(e.cameraProperties);
          if (n)
            return "cameraProperties." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.CameraProperties)
          return e;
        let n = new i.dot.v4.CameraProperties();
        if (e.cameraInitFrameResolution != null) {
          if (typeof e.cameraInitFrameResolution != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraInitFrameResolution: object expected");
          n.cameraInitFrameResolution = i.dot.v4.ImageBitmap.fromObject(e.cameraInitFrameResolution);
        }
        if (e.cameraProperties != null) {
          if (typeof e.cameraProperties != "object")
            throw TypeError(".dot.v4.CameraProperties.cameraProperties: object expected");
          n.cameraProperties = i.dot.v4.MediaTrackSettings.fromObject(e.cameraProperties);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.cameraProperties = null), e.cameraInitFrameResolution != null && e.hasOwnProperty("cameraInitFrameResolution") && (o.cameraInitFrameResolution = i.dot.v4.ImageBitmap.toObject(e.cameraInitFrameResolution, n), n.oneofs && (o._cameraInitFrameResolution = "cameraInitFrameResolution")), e.cameraProperties != null && e.hasOwnProperty("cameraProperties") && (o.cameraProperties = i.dot.v4.MediaTrackSettings.toObject(e.cameraProperties, n)), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.CameraProperties";
      }, r;
    }(), s.DetectedObject = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.brightness = 0, r.prototype.sharpness = 0, r.prototype.hotspots = 0, r.prototype.confidence = 0, r.prototype.faceSize = 0, r.prototype.faceCenter = null, r.prototype.smallestEdge = 0, r.prototype.bottomLeft = null, r.prototype.bottomRight = null, r.prototype.topLeft = null, r.prototype.topRight = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.brightness != null && Object.hasOwnProperty.call(t, "brightness") && e.uint32(
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
        ).float(t.faceSize), t.faceCenter != null && Object.hasOwnProperty.call(t, "faceCenter") && i.dot.v4.Point.encode(t.faceCenter, e.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), t.smallestEdge != null && Object.hasOwnProperty.call(t, "smallestEdge") && e.uint32(
          /* id 7, wireType 5 =*/
          61
        ).float(t.smallestEdge), t.bottomLeft != null && Object.hasOwnProperty.call(t, "bottomLeft") && i.dot.v4.Point.encode(t.bottomLeft, e.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), t.bottomRight != null && Object.hasOwnProperty.call(t, "bottomRight") && i.dot.v4.Point.encode(t.bottomRight, e.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), t.topLeft != null && Object.hasOwnProperty.call(t, "topLeft") && i.dot.v4.Point.encode(t.topLeft, e.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), t.topRight != null && Object.hasOwnProperty.call(t, "topRight") && i.dot.v4.Point.encode(t.topRight, e.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.DetectedObject();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.brightness = t.float();
              break;
            }
            case 2: {
              u.sharpness = t.float();
              break;
            }
            case 3: {
              u.hotspots = t.float();
              break;
            }
            case 4: {
              u.confidence = t.float();
              break;
            }
            case 5: {
              u.faceSize = t.float();
              break;
            }
            case 6: {
              u.faceCenter = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 7: {
              u.smallestEdge = t.float();
              break;
            }
            case 8: {
              u.bottomLeft = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 9: {
              u.bottomRight = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 10: {
              u.topLeft = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            case 11: {
              u.topRight = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
          let e = i.dot.v4.Point.verify(t.faceCenter);
          if (e)
            return "faceCenter." + e;
        }
        if (t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && typeof t.smallestEdge != "number")
          return "smallestEdge: number expected";
        if (t.bottomLeft != null && t.hasOwnProperty("bottomLeft")) {
          let e = i.dot.v4.Point.verify(t.bottomLeft);
          if (e)
            return "bottomLeft." + e;
        }
        if (t.bottomRight != null && t.hasOwnProperty("bottomRight")) {
          let e = i.dot.v4.Point.verify(t.bottomRight);
          if (e)
            return "bottomRight." + e;
        }
        if (t.topLeft != null && t.hasOwnProperty("topLeft")) {
          let e = i.dot.v4.Point.verify(t.topLeft);
          if (e)
            return "topLeft." + e;
        }
        if (t.topRight != null && t.hasOwnProperty("topRight")) {
          let e = i.dot.v4.Point.verify(t.topRight);
          if (e)
            return "topRight." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.DetectedObject)
          return t;
        let e = new i.dot.v4.DetectedObject();
        if (t.brightness != null && (e.brightness = Number(t.brightness)), t.sharpness != null && (e.sharpness = Number(t.sharpness)), t.hotspots != null && (e.hotspots = Number(t.hotspots)), t.confidence != null && (e.confidence = Number(t.confidence)), t.faceSize != null && (e.faceSize = Number(t.faceSize)), t.faceCenter != null) {
          if (typeof t.faceCenter != "object")
            throw TypeError(".dot.v4.DetectedObject.faceCenter: object expected");
          e.faceCenter = i.dot.v4.Point.fromObject(t.faceCenter);
        }
        if (t.smallestEdge != null && (e.smallestEdge = Number(t.smallestEdge)), t.bottomLeft != null) {
          if (typeof t.bottomLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomLeft: object expected");
          e.bottomLeft = i.dot.v4.Point.fromObject(t.bottomLeft);
        }
        if (t.bottomRight != null) {
          if (typeof t.bottomRight != "object")
            throw TypeError(".dot.v4.DetectedObject.bottomRight: object expected");
          e.bottomRight = i.dot.v4.Point.fromObject(t.bottomRight);
        }
        if (t.topLeft != null) {
          if (typeof t.topLeft != "object")
            throw TypeError(".dot.v4.DetectedObject.topLeft: object expected");
          e.topLeft = i.dot.v4.Point.fromObject(t.topLeft);
        }
        if (t.topRight != null) {
          if (typeof t.topRight != "object")
            throw TypeError(".dot.v4.DetectedObject.topRight: object expected");
          e.topRight = i.dot.v4.Point.fromObject(t.topRight);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.brightness = 0, n.sharpness = 0, n.hotspots = 0, n.confidence = 0, n.faceSize = 0, n.faceCenter = null, n.smallestEdge = 0, n.bottomLeft = null, n.bottomRight = null, n.topLeft = null, n.topRight = null), t.brightness != null && t.hasOwnProperty("brightness") && (n.brightness = e.json && !isFinite(t.brightness) ? String(t.brightness) : t.brightness), t.sharpness != null && t.hasOwnProperty("sharpness") && (n.sharpness = e.json && !isFinite(t.sharpness) ? String(t.sharpness) : t.sharpness), t.hotspots != null && t.hasOwnProperty("hotspots") && (n.hotspots = e.json && !isFinite(t.hotspots) ? String(t.hotspots) : t.hotspots), t.confidence != null && t.hasOwnProperty("confidence") && (n.confidence = e.json && !isFinite(t.confidence) ? String(t.confidence) : t.confidence), t.faceSize != null && t.hasOwnProperty("faceSize") && (n.faceSize = e.json && !isFinite(t.faceSize) ? String(t.faceSize) : t.faceSize), t.faceCenter != null && t.hasOwnProperty("faceCenter") && (n.faceCenter = i.dot.v4.Point.toObject(t.faceCenter, e)), t.smallestEdge != null && t.hasOwnProperty("smallestEdge") && (n.smallestEdge = e.json && !isFinite(t.smallestEdge) ? String(t.smallestEdge) : t.smallestEdge), t.bottomLeft != null && t.hasOwnProperty("bottomLeft") && (n.bottomLeft = i.dot.v4.Point.toObject(t.bottomLeft, e)), t.bottomRight != null && t.hasOwnProperty("bottomRight") && (n.bottomRight = i.dot.v4.Point.toObject(t.bottomRight, e)), t.topLeft != null && t.hasOwnProperty("topLeft") && (n.topLeft = i.dot.v4.Point.toObject(t.topLeft, e)), t.topRight != null && t.hasOwnProperty("topRight") && (n.topRight = i.dot.v4.Point.toObject(t.topRight, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DetectedObject";
      }, r;
    }(), s.Point = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.x = 0, r.prototype.y = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.x != null && Object.hasOwnProperty.call(t, "x") && e.uint32(
          /* id 1, wireType 5 =*/
          13
        ).float(t.x), t.y != null && Object.hasOwnProperty.call(t, "y") && e.uint32(
          /* id 2, wireType 5 =*/
          21
        ).float(t.y), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.Point();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.x = t.float();
              break;
            }
            case 2: {
              u.y = t.float();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.x != null && t.hasOwnProperty("x") && typeof t.x != "number" ? "x: number expected" : t.y != null && t.hasOwnProperty("y") && typeof t.y != "number" ? "y: number expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.Point)
          return t;
        let e = new i.dot.v4.Point();
        return t.x != null && (e.x = Number(t.x)), t.y != null && (e.y = Number(t.y)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.x = 0, n.y = 0), t.x != null && t.hasOwnProperty("x") && (n.x = e.json && !isFinite(t.x) ? String(t.x) : t.x), t.y != null && t.hasOwnProperty("y") && (n.y = e.json && !isFinite(t.y) ? String(t.y) : t.y), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.Point";
      }, r;
    }(), s.ImageCrop = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.image = null, r.prototype.topLeftCorner = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.Image.encode(t.image, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.topLeftCorner != null && Object.hasOwnProperty.call(t, "topLeftCorner") && i.dot.v4.Point.encode(t.topLeftCorner, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.ImageCrop();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.topLeftCorner = i.dot.v4.Point.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.image != null && t.hasOwnProperty("image")) {
          let e = i.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        if (t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner")) {
          let e = i.dot.v4.Point.verify(t.topLeftCorner);
          if (e)
            return "topLeftCorner." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.ImageCrop)
          return t;
        let e = new i.dot.v4.ImageCrop();
        if (t.image != null) {
          if (typeof t.image != "object")
            throw TypeError(".dot.v4.ImageCrop.image: object expected");
          e.image = i.dot.Image.fromObject(t.image);
        }
        if (t.topLeftCorner != null) {
          if (typeof t.topLeftCorner != "object")
            throw TypeError(".dot.v4.ImageCrop.topLeftCorner: object expected");
          e.topLeftCorner = i.dot.v4.Point.fromObject(t.topLeftCorner);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.image = null, n.topLeftCorner = null), t.image != null && t.hasOwnProperty("image") && (n.image = i.dot.Image.toObject(t.image, e)), t.topLeftCorner != null && t.hasOwnProperty("topLeftCorner") && (n.topLeftCorner = i.dot.v4.Point.toObject(t.topLeftCorner, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.ImageCrop";
      }, r;
    }(), s.PlatformDetails = function() {
      function r(e) {
        if (this.browserVersions = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.userAgent = "", r.prototype.platform = null, r.prototype.platformVersion = null, r.prototype.architecture = null, r.prototype.model = null, r.prototype.browserVersions = d.emptyArray;
      let t;
      return Object.defineProperty(r.prototype, "_platform", {
        get: d.oneOfGetter(t = ["platform"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_platformVersion", {
        get: d.oneOfGetter(t = ["platformVersion"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_architecture", {
        get: d.oneOfGetter(t = ["architecture"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_model", {
        get: d.oneOfGetter(t = ["model"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.userAgent != null && Object.hasOwnProperty.call(e, "userAgent") && n.uint32(
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
            i.dot.v4.BrowserVersion.encode(e.browserVersions[o], n.uint32(
              /* id 6, wireType 2 =*/
              50
            ).fork()).ldelim();
        return n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.PlatformDetails();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.userAgent = e.string();
              break;
            }
            case 2: {
              a.platform = e.string();
              break;
            }
            case 3: {
              a.platformVersion = e.string();
              break;
            }
            case 4: {
              a.architecture = e.string();
              break;
            }
            case 5: {
              a.model = e.string();
              break;
            }
            case 6: {
              a.browserVersions && a.browserVersions.length || (a.browserVersions = []), a.browserVersions.push(i.dot.v4.BrowserVersion.decode(e, e.uint32()));
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.userAgent != null && e.hasOwnProperty("userAgent") && !d.isString(e.userAgent))
          return "userAgent: string expected";
        if (e.platform != null && e.hasOwnProperty("platform") && !d.isString(e.platform))
          return "platform: string expected";
        if (e.platformVersion != null && e.hasOwnProperty("platformVersion") && !d.isString(e.platformVersion))
          return "platformVersion: string expected";
        if (e.architecture != null && e.hasOwnProperty("architecture") && !d.isString(e.architecture))
          return "architecture: string expected";
        if (e.model != null && e.hasOwnProperty("model") && !d.isString(e.model))
          return "model: string expected";
        if (e.browserVersions != null && e.hasOwnProperty("browserVersions")) {
          if (!Array.isArray(e.browserVersions))
            return "browserVersions: array expected";
          for (let n = 0; n < e.browserVersions.length; ++n) {
            let o = i.dot.v4.BrowserVersion.verify(e.browserVersions[n]);
            if (o)
              return "browserVersions." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.PlatformDetails)
          return e;
        let n = new i.dot.v4.PlatformDetails();
        if (e.userAgent != null && (n.userAgent = String(e.userAgent)), e.platform != null && (n.platform = String(e.platform)), e.platformVersion != null && (n.platformVersion = String(e.platformVersion)), e.architecture != null && (n.architecture = String(e.architecture)), e.model != null && (n.model = String(e.model)), e.browserVersions) {
          if (!Array.isArray(e.browserVersions))
            throw TypeError(".dot.v4.PlatformDetails.browserVersions: array expected");
          n.browserVersions = [];
          for (let o = 0; o < e.browserVersions.length; ++o) {
            if (typeof e.browserVersions[o] != "object")
              throw TypeError(".dot.v4.PlatformDetails.browserVersions: object expected");
            n.browserVersions[o] = i.dot.v4.BrowserVersion.fromObject(e.browserVersions[o]);
          }
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.browserVersions = []), n.defaults && (o.userAgent = ""), e.userAgent != null && e.hasOwnProperty("userAgent") && (o.userAgent = e.userAgent), e.platform != null && e.hasOwnProperty("platform") && (o.platform = e.platform, n.oneofs && (o._platform = "platform")), e.platformVersion != null && e.hasOwnProperty("platformVersion") && (o.platformVersion = e.platformVersion, n.oneofs && (o._platformVersion = "platformVersion")), e.architecture != null && e.hasOwnProperty("architecture") && (o.architecture = e.architecture, n.oneofs && (o._architecture = "architecture")), e.model != null && e.hasOwnProperty("model") && (o.model = e.model, n.oneofs && (o._model = "model")), e.browserVersions && e.browserVersions.length) {
          o.browserVersions = [];
          for (let u = 0; u < e.browserVersions.length; ++u)
            o.browserVersions[u] = i.dot.v4.BrowserVersion.toObject(e.browserVersions[u], n);
        }
        return o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PlatformDetails";
      }, r;
    }(), s.BrowserVersion = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.name = "", r.prototype.version = "", r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.name != null && Object.hasOwnProperty.call(t, "name") && e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).string(t.name), t.version != null && Object.hasOwnProperty.call(t, "version") && e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).string(t.version), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.BrowserVersion();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.name = t.string();
              break;
            }
            case 2: {
              u.version = t.string();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        return typeof t != "object" || t === null ? "object expected" : t.name != null && t.hasOwnProperty("name") && !d.isString(t.name) ? "name: string expected" : t.version != null && t.hasOwnProperty("version") && !d.isString(t.version) ? "version: string expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.BrowserVersion)
          return t;
        let e = new i.dot.v4.BrowserVersion();
        return t.name != null && (e.name = String(t.name)), t.version != null && (e.version = String(t.version)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.name = "", n.version = ""), t.name != null && t.hasOwnProperty("name") && (n.name = t.name), t.version != null && t.hasOwnProperty("version") && (n.version = t.version), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.BrowserVersion";
      }, r;
    }(), s.FaceContent = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.FaceContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = i.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.FaceContent)
          return e;
        let n = new i.dot.v4.FaceContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.FaceContent.image: object expected");
          n.image = i.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.FaceContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.FaceContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.FaceContent";
      }, r;
    }(), s.DocumentContent = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.DocumentContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = i.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.DocumentContent)
          return e;
        let n = new i.dot.v4.DocumentContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.DocumentContent.image: object expected");
          n.image = i.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.DocumentContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.DocumentContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.DocumentContent";
      }, r;
    }(), s.Blob = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.documentContent = null, r.prototype.eyeGazeLivenessContent = null, r.prototype.faceContent = null, r.prototype.magnifeyeLivenessContent = null, r.prototype.smileLivenessContent = null, r.prototype.palmContent = null, r.prototype.travelDocumentContent = null, r.prototype.multiRangeLivenessContent = null;
      let t;
      return Object.defineProperty(r.prototype, "blob", {
        get: d.oneOfGetter(t = ["documentContent", "eyeGazeLivenessContent", "faceContent", "magnifeyeLivenessContent", "smileLivenessContent", "palmContent", "travelDocumentContent", "multiRangeLivenessContent"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.documentContent != null && Object.hasOwnProperty.call(e, "documentContent") && i.dot.v4.DocumentContent.encode(e.documentContent, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.faceContent != null && Object.hasOwnProperty.call(e, "faceContent") && i.dot.v4.FaceContent.encode(e.faceContent, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.magnifeyeLivenessContent != null && Object.hasOwnProperty.call(e, "magnifeyeLivenessContent") && i.dot.v4.MagnifEyeLivenessContent.encode(e.magnifeyeLivenessContent, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.smileLivenessContent != null && Object.hasOwnProperty.call(e, "smileLivenessContent") && i.dot.v4.SmileLivenessContent.encode(e.smileLivenessContent, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.eyeGazeLivenessContent != null && Object.hasOwnProperty.call(e, "eyeGazeLivenessContent") && i.dot.v4.EyeGazeLivenessContent.encode(e.eyeGazeLivenessContent, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.palmContent != null && Object.hasOwnProperty.call(e, "palmContent") && i.dot.v4.PalmContent.encode(e.palmContent, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.travelDocumentContent != null && Object.hasOwnProperty.call(e, "travelDocumentContent") && i.dot.v4.TravelDocumentContent.encode(e.travelDocumentContent, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.multiRangeLivenessContent != null && Object.hasOwnProperty.call(e, "multiRangeLivenessContent") && i.dot.v4.MultiRangeLivenessContent.encode(e.multiRangeLivenessContent, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Blob();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.documentContent = i.dot.v4.DocumentContent.decode(e, e.uint32());
              break;
            }
            case 5: {
              a.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.faceContent = i.dot.v4.FaceContent.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.smileLivenessContent = i.dot.v4.SmileLivenessContent.decode(e, e.uint32());
              break;
            }
            case 6: {
              a.palmContent = i.dot.v4.PalmContent.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.travelDocumentContent = i.dot.v4.TravelDocumentContent.decode(e, e.uint32());
              break;
            }
            case 8: {
              a.multiRangeLivenessContent = i.dot.v4.MultiRangeLivenessContent.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        let n = {};
        if (e.documentContent != null && e.hasOwnProperty("documentContent")) {
          n.blob = 1;
          {
            let o = i.dot.v4.DocumentContent.verify(e.documentContent);
            if (o)
              return "documentContent." + o;
          }
        }
        if (e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.EyeGazeLivenessContent.verify(e.eyeGazeLivenessContent);
            if (o)
              return "eyeGazeLivenessContent." + o;
          }
        }
        if (e.faceContent != null && e.hasOwnProperty("faceContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.FaceContent.verify(e.faceContent);
            if (o)
              return "faceContent." + o;
          }
        }
        if (e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.MagnifEyeLivenessContent.verify(e.magnifeyeLivenessContent);
            if (o)
              return "magnifeyeLivenessContent." + o;
          }
        }
        if (e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.SmileLivenessContent.verify(e.smileLivenessContent);
            if (o)
              return "smileLivenessContent." + o;
          }
        }
        if (e.palmContent != null && e.hasOwnProperty("palmContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.PalmContent.verify(e.palmContent);
            if (o)
              return "palmContent." + o;
          }
        }
        if (e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.TravelDocumentContent.verify(e.travelDocumentContent);
            if (o)
              return "travelDocumentContent." + o;
          }
        }
        if (e.multiRangeLivenessContent != null && e.hasOwnProperty("multiRangeLivenessContent")) {
          if (n.blob === 1)
            return "blob: multiple values";
          n.blob = 1;
          {
            let o = i.dot.v4.MultiRangeLivenessContent.verify(e.multiRangeLivenessContent);
            if (o)
              return "multiRangeLivenessContent." + o;
          }
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.Blob)
          return e;
        let n = new i.dot.v4.Blob();
        if (e.documentContent != null) {
          if (typeof e.documentContent != "object")
            throw TypeError(".dot.v4.Blob.documentContent: object expected");
          n.documentContent = i.dot.v4.DocumentContent.fromObject(e.documentContent);
        }
        if (e.eyeGazeLivenessContent != null) {
          if (typeof e.eyeGazeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.eyeGazeLivenessContent: object expected");
          n.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.fromObject(e.eyeGazeLivenessContent);
        }
        if (e.faceContent != null) {
          if (typeof e.faceContent != "object")
            throw TypeError(".dot.v4.Blob.faceContent: object expected");
          n.faceContent = i.dot.v4.FaceContent.fromObject(e.faceContent);
        }
        if (e.magnifeyeLivenessContent != null) {
          if (typeof e.magnifeyeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.magnifeyeLivenessContent: object expected");
          n.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.fromObject(e.magnifeyeLivenessContent);
        }
        if (e.smileLivenessContent != null) {
          if (typeof e.smileLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.smileLivenessContent: object expected");
          n.smileLivenessContent = i.dot.v4.SmileLivenessContent.fromObject(e.smileLivenessContent);
        }
        if (e.palmContent != null) {
          if (typeof e.palmContent != "object")
            throw TypeError(".dot.v4.Blob.palmContent: object expected");
          n.palmContent = i.dot.v4.PalmContent.fromObject(e.palmContent);
        }
        if (e.travelDocumentContent != null) {
          if (typeof e.travelDocumentContent != "object")
            throw TypeError(".dot.v4.Blob.travelDocumentContent: object expected");
          n.travelDocumentContent = i.dot.v4.TravelDocumentContent.fromObject(e.travelDocumentContent);
        }
        if (e.multiRangeLivenessContent != null) {
          if (typeof e.multiRangeLivenessContent != "object")
            throw TypeError(".dot.v4.Blob.multiRangeLivenessContent: object expected");
          n.multiRangeLivenessContent = i.dot.v4.MultiRangeLivenessContent.fromObject(e.multiRangeLivenessContent);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return e.documentContent != null && e.hasOwnProperty("documentContent") && (o.documentContent = i.dot.v4.DocumentContent.toObject(e.documentContent, n), n.oneofs && (o.blob = "documentContent")), e.faceContent != null && e.hasOwnProperty("faceContent") && (o.faceContent = i.dot.v4.FaceContent.toObject(e.faceContent, n), n.oneofs && (o.blob = "faceContent")), e.magnifeyeLivenessContent != null && e.hasOwnProperty("magnifeyeLivenessContent") && (o.magnifeyeLivenessContent = i.dot.v4.MagnifEyeLivenessContent.toObject(e.magnifeyeLivenessContent, n), n.oneofs && (o.blob = "magnifeyeLivenessContent")), e.smileLivenessContent != null && e.hasOwnProperty("smileLivenessContent") && (o.smileLivenessContent = i.dot.v4.SmileLivenessContent.toObject(e.smileLivenessContent, n), n.oneofs && (o.blob = "smileLivenessContent")), e.eyeGazeLivenessContent != null && e.hasOwnProperty("eyeGazeLivenessContent") && (o.eyeGazeLivenessContent = i.dot.v4.EyeGazeLivenessContent.toObject(e.eyeGazeLivenessContent, n), n.oneofs && (o.blob = "eyeGazeLivenessContent")), e.palmContent != null && e.hasOwnProperty("palmContent") && (o.palmContent = i.dot.v4.PalmContent.toObject(e.palmContent, n), n.oneofs && (o.blob = "palmContent")), e.travelDocumentContent != null && e.hasOwnProperty("travelDocumentContent") && (o.travelDocumentContent = i.dot.v4.TravelDocumentContent.toObject(e.travelDocumentContent, n), n.oneofs && (o.blob = "travelDocumentContent")), e.multiRangeLivenessContent != null && e.hasOwnProperty("multiRangeLivenessContent") && (o.multiRangeLivenessContent = i.dot.v4.MultiRangeLivenessContent.toObject(e.multiRangeLivenessContent, n), n.oneofs && (o.blob = "multiRangeLivenessContent")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Blob";
      }, r;
    }(), s.TravelDocumentContent = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.ldsMasterFile = null, r.prototype.accessControlProtocolUsed = 0, r.prototype.authenticationStatus = null, r.prototype.metadata = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.ldsMasterFile != null && Object.hasOwnProperty.call(t, "ldsMasterFile") && i.dot.v4.LdsMasterFile.encode(t.ldsMasterFile, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.accessControlProtocolUsed != null && Object.hasOwnProperty.call(t, "accessControlProtocolUsed") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.accessControlProtocolUsed), t.authenticationStatus != null && Object.hasOwnProperty.call(t, "authenticationStatus") && i.dot.v4.AuthenticationStatus.encode(t.authenticationStatus, e.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), t.metadata != null && Object.hasOwnProperty.call(t, "metadata") && i.dot.v4.Metadata.encode(t.metadata, e.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.TravelDocumentContent();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.ldsMasterFile = i.dot.v4.LdsMasterFile.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.accessControlProtocolUsed = t.int32();
              break;
            }
            case 3: {
              u.authenticationStatus = i.dot.v4.AuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 4: {
              u.metadata = i.dot.v4.Metadata.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile")) {
          let e = i.dot.v4.LdsMasterFile.verify(t.ldsMasterFile);
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
          let e = i.dot.v4.AuthenticationStatus.verify(t.authenticationStatus);
          if (e)
            return "authenticationStatus." + e;
        }
        if (t.metadata != null && t.hasOwnProperty("metadata")) {
          let e = i.dot.v4.Metadata.verify(t.metadata);
          if (e)
            return "metadata." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.TravelDocumentContent)
          return t;
        let e = new i.dot.v4.TravelDocumentContent();
        if (t.ldsMasterFile != null) {
          if (typeof t.ldsMasterFile != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.ldsMasterFile: object expected");
          e.ldsMasterFile = i.dot.v4.LdsMasterFile.fromObject(t.ldsMasterFile);
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
          e.authenticationStatus = i.dot.v4.AuthenticationStatus.fromObject(t.authenticationStatus);
        }
        if (t.metadata != null) {
          if (typeof t.metadata != "object")
            throw TypeError(".dot.v4.TravelDocumentContent.metadata: object expected");
          e.metadata = i.dot.v4.Metadata.fromObject(t.metadata);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.ldsMasterFile = null, n.accessControlProtocolUsed = e.enums === String ? "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED" : 0, n.authenticationStatus = null, n.metadata = null), t.ldsMasterFile != null && t.hasOwnProperty("ldsMasterFile") && (n.ldsMasterFile = i.dot.v4.LdsMasterFile.toObject(t.ldsMasterFile, e)), t.accessControlProtocolUsed != null && t.hasOwnProperty("accessControlProtocolUsed") && (n.accessControlProtocolUsed = e.enums === String ? i.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] === void 0 ? t.accessControlProtocolUsed : i.dot.v4.AccessControlProtocol[t.accessControlProtocolUsed] : t.accessControlProtocolUsed), t.authenticationStatus != null && t.hasOwnProperty("authenticationStatus") && (n.authenticationStatus = i.dot.v4.AuthenticationStatus.toObject(t.authenticationStatus, e)), t.metadata != null && t.hasOwnProperty("metadata") && (n.metadata = i.dot.v4.Metadata.toObject(t.metadata, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.TravelDocumentContent";
      }, r;
    }(), s.LdsMasterFile = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.lds1eMrtdApplication = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.lds1eMrtdApplication != null && Object.hasOwnProperty.call(t, "lds1eMrtdApplication") && i.dot.v4.Lds1eMrtdApplication.encode(t.lds1eMrtdApplication, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.LdsMasterFile();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication")) {
          let e = i.dot.v4.Lds1eMrtdApplication.verify(t.lds1eMrtdApplication);
          if (e)
            return "lds1eMrtdApplication." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.LdsMasterFile)
          return t;
        let e = new i.dot.v4.LdsMasterFile();
        if (t.lds1eMrtdApplication != null) {
          if (typeof t.lds1eMrtdApplication != "object")
            throw TypeError(".dot.v4.LdsMasterFile.lds1eMrtdApplication: object expected");
          e.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.fromObject(t.lds1eMrtdApplication);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.lds1eMrtdApplication = null), t.lds1eMrtdApplication != null && t.hasOwnProperty("lds1eMrtdApplication") && (n.lds1eMrtdApplication = i.dot.v4.Lds1eMrtdApplication.toObject(t.lds1eMrtdApplication, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.LdsMasterFile";
      }, r;
    }(), s.Lds1eMrtdApplication = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.comHeaderAndDataGroupPresenceInformation = null, r.prototype.sodDocumentSecurityObject = null, r.prototype.dg1MachineReadableZoneInformation = null, r.prototype.dg2EncodedIdentificationFeaturesFace = null, r.prototype.dg3AdditionalIdentificationFeatureFingers = null, r.prototype.dg4AdditionalIdentificationFeatureIrises = null, r.prototype.dg5DisplayedPortrait = null, r.prototype.dg7DisplayedSignatureOrUsualMark = null, r.prototype.dg8DataFeatures = null, r.prototype.dg9StructureFeatures = null, r.prototype.dg10SubstanceFeatures = null, r.prototype.dg11AdditionalPersonalDetails = null, r.prototype.dg12AdditionalDocumentDetails = null, r.prototype.dg13OptionalDetails = null, r.prototype.dg14SecurityOptions = null, r.prototype.dg15ActiveAuthenticationPublicKeyInfo = null, r.prototype.dg16PersonsToNotify = null;
      let t;
      return Object.defineProperty(r.prototype, "_dg3AdditionalIdentificationFeatureFingers", {
        get: d.oneOfGetter(t = ["dg3AdditionalIdentificationFeatureFingers"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg4AdditionalIdentificationFeatureIrises", {
        get: d.oneOfGetter(t = ["dg4AdditionalIdentificationFeatureIrises"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg5DisplayedPortrait", {
        get: d.oneOfGetter(t = ["dg5DisplayedPortrait"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg7DisplayedSignatureOrUsualMark", {
        get: d.oneOfGetter(t = ["dg7DisplayedSignatureOrUsualMark"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg8DataFeatures", {
        get: d.oneOfGetter(t = ["dg8DataFeatures"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg9StructureFeatures", {
        get: d.oneOfGetter(t = ["dg9StructureFeatures"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg10SubstanceFeatures", {
        get: d.oneOfGetter(t = ["dg10SubstanceFeatures"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg11AdditionalPersonalDetails", {
        get: d.oneOfGetter(t = ["dg11AdditionalPersonalDetails"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg12AdditionalDocumentDetails", {
        get: d.oneOfGetter(t = ["dg12AdditionalDocumentDetails"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg13OptionalDetails", {
        get: d.oneOfGetter(t = ["dg13OptionalDetails"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg14SecurityOptions", {
        get: d.oneOfGetter(t = ["dg14SecurityOptions"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg15ActiveAuthenticationPublicKeyInfo", {
        get: d.oneOfGetter(t = ["dg15ActiveAuthenticationPublicKeyInfo"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_dg16PersonsToNotify", {
        get: d.oneOfGetter(t = ["dg16PersonsToNotify"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.comHeaderAndDataGroupPresenceInformation != null && Object.hasOwnProperty.call(e, "comHeaderAndDataGroupPresenceInformation") && i.dot.v4.Lds1ElementaryFile.encode(e.comHeaderAndDataGroupPresenceInformation, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.sodDocumentSecurityObject != null && Object.hasOwnProperty.call(e, "sodDocumentSecurityObject") && i.dot.v4.Lds1ElementaryFile.encode(e.sodDocumentSecurityObject, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.dg1MachineReadableZoneInformation != null && Object.hasOwnProperty.call(e, "dg1MachineReadableZoneInformation") && i.dot.v4.Lds1ElementaryFile.encode(e.dg1MachineReadableZoneInformation, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.dg2EncodedIdentificationFeaturesFace != null && Object.hasOwnProperty.call(e, "dg2EncodedIdentificationFeaturesFace") && i.dot.v4.Lds1ElementaryFile.encode(e.dg2EncodedIdentificationFeaturesFace, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), e.dg3AdditionalIdentificationFeatureFingers != null && Object.hasOwnProperty.call(e, "dg3AdditionalIdentificationFeatureFingers") && i.dot.v4.Lds1ElementaryFile.encode(e.dg3AdditionalIdentificationFeatureFingers, n.uint32(
          /* id 5, wireType 2 =*/
          42
        ).fork()).ldelim(), e.dg4AdditionalIdentificationFeatureIrises != null && Object.hasOwnProperty.call(e, "dg4AdditionalIdentificationFeatureIrises") && i.dot.v4.Lds1ElementaryFile.encode(e.dg4AdditionalIdentificationFeatureIrises, n.uint32(
          /* id 6, wireType 2 =*/
          50
        ).fork()).ldelim(), e.dg5DisplayedPortrait != null && Object.hasOwnProperty.call(e, "dg5DisplayedPortrait") && i.dot.v4.Lds1ElementaryFile.encode(e.dg5DisplayedPortrait, n.uint32(
          /* id 7, wireType 2 =*/
          58
        ).fork()).ldelim(), e.dg7DisplayedSignatureOrUsualMark != null && Object.hasOwnProperty.call(e, "dg7DisplayedSignatureOrUsualMark") && i.dot.v4.Lds1ElementaryFile.encode(e.dg7DisplayedSignatureOrUsualMark, n.uint32(
          /* id 8, wireType 2 =*/
          66
        ).fork()).ldelim(), e.dg8DataFeatures != null && Object.hasOwnProperty.call(e, "dg8DataFeatures") && i.dot.v4.Lds1ElementaryFile.encode(e.dg8DataFeatures, n.uint32(
          /* id 9, wireType 2 =*/
          74
        ).fork()).ldelim(), e.dg9StructureFeatures != null && Object.hasOwnProperty.call(e, "dg9StructureFeatures") && i.dot.v4.Lds1ElementaryFile.encode(e.dg9StructureFeatures, n.uint32(
          /* id 10, wireType 2 =*/
          82
        ).fork()).ldelim(), e.dg10SubstanceFeatures != null && Object.hasOwnProperty.call(e, "dg10SubstanceFeatures") && i.dot.v4.Lds1ElementaryFile.encode(e.dg10SubstanceFeatures, n.uint32(
          /* id 11, wireType 2 =*/
          90
        ).fork()).ldelim(), e.dg11AdditionalPersonalDetails != null && Object.hasOwnProperty.call(e, "dg11AdditionalPersonalDetails") && i.dot.v4.Lds1ElementaryFile.encode(e.dg11AdditionalPersonalDetails, n.uint32(
          /* id 12, wireType 2 =*/
          98
        ).fork()).ldelim(), e.dg12AdditionalDocumentDetails != null && Object.hasOwnProperty.call(e, "dg12AdditionalDocumentDetails") && i.dot.v4.Lds1ElementaryFile.encode(e.dg12AdditionalDocumentDetails, n.uint32(
          /* id 13, wireType 2 =*/
          106
        ).fork()).ldelim(), e.dg13OptionalDetails != null && Object.hasOwnProperty.call(e, "dg13OptionalDetails") && i.dot.v4.Lds1ElementaryFile.encode(e.dg13OptionalDetails, n.uint32(
          /* id 14, wireType 2 =*/
          114
        ).fork()).ldelim(), e.dg14SecurityOptions != null && Object.hasOwnProperty.call(e, "dg14SecurityOptions") && i.dot.v4.Lds1ElementaryFile.encode(e.dg14SecurityOptions, n.uint32(
          /* id 15, wireType 2 =*/
          122
        ).fork()).ldelim(), e.dg15ActiveAuthenticationPublicKeyInfo != null && Object.hasOwnProperty.call(e, "dg15ActiveAuthenticationPublicKeyInfo") && i.dot.v4.Lds1ElementaryFile.encode(e.dg15ActiveAuthenticationPublicKeyInfo, n.uint32(
          /* id 16, wireType 2 =*/
          130
        ).fork()).ldelim(), e.dg16PersonsToNotify != null && Object.hasOwnProperty.call(e, "dg16PersonsToNotify") && i.dot.v4.Lds1ElementaryFile.encode(e.dg16PersonsToNotify, n.uint32(
          /* id 17, wireType 2 =*/
          138
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 5: {
              a.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 6: {
              a.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 7: {
              a.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 8: {
              a.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 9: {
              a.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 10: {
              a.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 11: {
              a.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 12: {
              a.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 13: {
              a.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 14: {
              a.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 15: {
              a.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 16: {
              a.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            case 17: {
              a.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.comHeaderAndDataGroupPresenceInformation);
          if (n)
            return "comHeaderAndDataGroupPresenceInformation." + n;
        }
        if (e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.sodDocumentSecurityObject);
          if (n)
            return "sodDocumentSecurityObject." + n;
        }
        if (e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg1MachineReadableZoneInformation);
          if (n)
            return "dg1MachineReadableZoneInformation." + n;
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg2EncodedIdentificationFeaturesFace);
          if (n)
            return "dg2EncodedIdentificationFeaturesFace." + n;
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg3AdditionalIdentificationFeatureFingers);
          if (n)
            return "dg3AdditionalIdentificationFeatureFingers." + n;
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg4AdditionalIdentificationFeatureIrises);
          if (n)
            return "dg4AdditionalIdentificationFeatureIrises." + n;
        }
        if (e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg5DisplayedPortrait);
          if (n)
            return "dg5DisplayedPortrait." + n;
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg7DisplayedSignatureOrUsualMark);
          if (n)
            return "dg7DisplayedSignatureOrUsualMark." + n;
        }
        if (e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg8DataFeatures);
          if (n)
            return "dg8DataFeatures." + n;
        }
        if (e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg9StructureFeatures);
          if (n)
            return "dg9StructureFeatures." + n;
        }
        if (e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg10SubstanceFeatures);
          if (n)
            return "dg10SubstanceFeatures." + n;
        }
        if (e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg11AdditionalPersonalDetails);
          if (n)
            return "dg11AdditionalPersonalDetails." + n;
        }
        if (e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg12AdditionalDocumentDetails);
          if (n)
            return "dg12AdditionalDocumentDetails." + n;
        }
        if (e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg13OptionalDetails);
          if (n)
            return "dg13OptionalDetails." + n;
        }
        if (e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg14SecurityOptions);
          if (n)
            return "dg14SecurityOptions." + n;
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg15ActiveAuthenticationPublicKeyInfo);
          if (n)
            return "dg15ActiveAuthenticationPublicKeyInfo." + n;
        }
        if (e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify")) {
          let n = i.dot.v4.Lds1ElementaryFile.verify(e.dg16PersonsToNotify);
          if (n)
            return "dg16PersonsToNotify." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.Lds1eMrtdApplication)
          return e;
        let n = new i.dot.v4.Lds1eMrtdApplication();
        if (e.comHeaderAndDataGroupPresenceInformation != null) {
          if (typeof e.comHeaderAndDataGroupPresenceInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.comHeaderAndDataGroupPresenceInformation: object expected");
          n.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.fromObject(e.comHeaderAndDataGroupPresenceInformation);
        }
        if (e.sodDocumentSecurityObject != null) {
          if (typeof e.sodDocumentSecurityObject != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.sodDocumentSecurityObject: object expected");
          n.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.fromObject(e.sodDocumentSecurityObject);
        }
        if (e.dg1MachineReadableZoneInformation != null) {
          if (typeof e.dg1MachineReadableZoneInformation != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg1MachineReadableZoneInformation: object expected");
          n.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg1MachineReadableZoneInformation);
        }
        if (e.dg2EncodedIdentificationFeaturesFace != null) {
          if (typeof e.dg2EncodedIdentificationFeaturesFace != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg2EncodedIdentificationFeaturesFace: object expected");
          n.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg2EncodedIdentificationFeaturesFace);
        }
        if (e.dg3AdditionalIdentificationFeatureFingers != null) {
          if (typeof e.dg3AdditionalIdentificationFeatureFingers != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg3AdditionalIdentificationFeatureFingers: object expected");
          n.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg3AdditionalIdentificationFeatureFingers);
        }
        if (e.dg4AdditionalIdentificationFeatureIrises != null) {
          if (typeof e.dg4AdditionalIdentificationFeatureIrises != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg4AdditionalIdentificationFeatureIrises: object expected");
          n.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg4AdditionalIdentificationFeatureIrises);
        }
        if (e.dg5DisplayedPortrait != null) {
          if (typeof e.dg5DisplayedPortrait != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg5DisplayedPortrait: object expected");
          n.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg5DisplayedPortrait);
        }
        if (e.dg7DisplayedSignatureOrUsualMark != null) {
          if (typeof e.dg7DisplayedSignatureOrUsualMark != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg7DisplayedSignatureOrUsualMark: object expected");
          n.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg7DisplayedSignatureOrUsualMark);
        }
        if (e.dg8DataFeatures != null) {
          if (typeof e.dg8DataFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg8DataFeatures: object expected");
          n.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg8DataFeatures);
        }
        if (e.dg9StructureFeatures != null) {
          if (typeof e.dg9StructureFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg9StructureFeatures: object expected");
          n.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg9StructureFeatures);
        }
        if (e.dg10SubstanceFeatures != null) {
          if (typeof e.dg10SubstanceFeatures != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg10SubstanceFeatures: object expected");
          n.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg10SubstanceFeatures);
        }
        if (e.dg11AdditionalPersonalDetails != null) {
          if (typeof e.dg11AdditionalPersonalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg11AdditionalPersonalDetails: object expected");
          n.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg11AdditionalPersonalDetails);
        }
        if (e.dg12AdditionalDocumentDetails != null) {
          if (typeof e.dg12AdditionalDocumentDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg12AdditionalDocumentDetails: object expected");
          n.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg12AdditionalDocumentDetails);
        }
        if (e.dg13OptionalDetails != null) {
          if (typeof e.dg13OptionalDetails != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg13OptionalDetails: object expected");
          n.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg13OptionalDetails);
        }
        if (e.dg14SecurityOptions != null) {
          if (typeof e.dg14SecurityOptions != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg14SecurityOptions: object expected");
          n.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg14SecurityOptions);
        }
        if (e.dg15ActiveAuthenticationPublicKeyInfo != null) {
          if (typeof e.dg15ActiveAuthenticationPublicKeyInfo != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg15ActiveAuthenticationPublicKeyInfo: object expected");
          n.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg15ActiveAuthenticationPublicKeyInfo);
        }
        if (e.dg16PersonsToNotify != null) {
          if (typeof e.dg16PersonsToNotify != "object")
            throw TypeError(".dot.v4.Lds1eMrtdApplication.dg16PersonsToNotify: object expected");
          n.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.fromObject(e.dg16PersonsToNotify);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.comHeaderAndDataGroupPresenceInformation = null, o.sodDocumentSecurityObject = null, o.dg1MachineReadableZoneInformation = null, o.dg2EncodedIdentificationFeaturesFace = null), e.comHeaderAndDataGroupPresenceInformation != null && e.hasOwnProperty("comHeaderAndDataGroupPresenceInformation") && (o.comHeaderAndDataGroupPresenceInformation = i.dot.v4.Lds1ElementaryFile.toObject(e.comHeaderAndDataGroupPresenceInformation, n)), e.sodDocumentSecurityObject != null && e.hasOwnProperty("sodDocumentSecurityObject") && (o.sodDocumentSecurityObject = i.dot.v4.Lds1ElementaryFile.toObject(e.sodDocumentSecurityObject, n)), e.dg1MachineReadableZoneInformation != null && e.hasOwnProperty("dg1MachineReadableZoneInformation") && (o.dg1MachineReadableZoneInformation = i.dot.v4.Lds1ElementaryFile.toObject(e.dg1MachineReadableZoneInformation, n)), e.dg2EncodedIdentificationFeaturesFace != null && e.hasOwnProperty("dg2EncodedIdentificationFeaturesFace") && (o.dg2EncodedIdentificationFeaturesFace = i.dot.v4.Lds1ElementaryFile.toObject(e.dg2EncodedIdentificationFeaturesFace, n)), e.dg3AdditionalIdentificationFeatureFingers != null && e.hasOwnProperty("dg3AdditionalIdentificationFeatureFingers") && (o.dg3AdditionalIdentificationFeatureFingers = i.dot.v4.Lds1ElementaryFile.toObject(e.dg3AdditionalIdentificationFeatureFingers, n), n.oneofs && (o._dg3AdditionalIdentificationFeatureFingers = "dg3AdditionalIdentificationFeatureFingers")), e.dg4AdditionalIdentificationFeatureIrises != null && e.hasOwnProperty("dg4AdditionalIdentificationFeatureIrises") && (o.dg4AdditionalIdentificationFeatureIrises = i.dot.v4.Lds1ElementaryFile.toObject(e.dg4AdditionalIdentificationFeatureIrises, n), n.oneofs && (o._dg4AdditionalIdentificationFeatureIrises = "dg4AdditionalIdentificationFeatureIrises")), e.dg5DisplayedPortrait != null && e.hasOwnProperty("dg5DisplayedPortrait") && (o.dg5DisplayedPortrait = i.dot.v4.Lds1ElementaryFile.toObject(e.dg5DisplayedPortrait, n), n.oneofs && (o._dg5DisplayedPortrait = "dg5DisplayedPortrait")), e.dg7DisplayedSignatureOrUsualMark != null && e.hasOwnProperty("dg7DisplayedSignatureOrUsualMark") && (o.dg7DisplayedSignatureOrUsualMark = i.dot.v4.Lds1ElementaryFile.toObject(e.dg7DisplayedSignatureOrUsualMark, n), n.oneofs && (o._dg7DisplayedSignatureOrUsualMark = "dg7DisplayedSignatureOrUsualMark")), e.dg8DataFeatures != null && e.hasOwnProperty("dg8DataFeatures") && (o.dg8DataFeatures = i.dot.v4.Lds1ElementaryFile.toObject(e.dg8DataFeatures, n), n.oneofs && (o._dg8DataFeatures = "dg8DataFeatures")), e.dg9StructureFeatures != null && e.hasOwnProperty("dg9StructureFeatures") && (o.dg9StructureFeatures = i.dot.v4.Lds1ElementaryFile.toObject(e.dg9StructureFeatures, n), n.oneofs && (o._dg9StructureFeatures = "dg9StructureFeatures")), e.dg10SubstanceFeatures != null && e.hasOwnProperty("dg10SubstanceFeatures") && (o.dg10SubstanceFeatures = i.dot.v4.Lds1ElementaryFile.toObject(e.dg10SubstanceFeatures, n), n.oneofs && (o._dg10SubstanceFeatures = "dg10SubstanceFeatures")), e.dg11AdditionalPersonalDetails != null && e.hasOwnProperty("dg11AdditionalPersonalDetails") && (o.dg11AdditionalPersonalDetails = i.dot.v4.Lds1ElementaryFile.toObject(e.dg11AdditionalPersonalDetails, n), n.oneofs && (o._dg11AdditionalPersonalDetails = "dg11AdditionalPersonalDetails")), e.dg12AdditionalDocumentDetails != null && e.hasOwnProperty("dg12AdditionalDocumentDetails") && (o.dg12AdditionalDocumentDetails = i.dot.v4.Lds1ElementaryFile.toObject(e.dg12AdditionalDocumentDetails, n), n.oneofs && (o._dg12AdditionalDocumentDetails = "dg12AdditionalDocumentDetails")), e.dg13OptionalDetails != null && e.hasOwnProperty("dg13OptionalDetails") && (o.dg13OptionalDetails = i.dot.v4.Lds1ElementaryFile.toObject(e.dg13OptionalDetails, n), n.oneofs && (o._dg13OptionalDetails = "dg13OptionalDetails")), e.dg14SecurityOptions != null && e.hasOwnProperty("dg14SecurityOptions") && (o.dg14SecurityOptions = i.dot.v4.Lds1ElementaryFile.toObject(e.dg14SecurityOptions, n), n.oneofs && (o._dg14SecurityOptions = "dg14SecurityOptions")), e.dg15ActiveAuthenticationPublicKeyInfo != null && e.hasOwnProperty("dg15ActiveAuthenticationPublicKeyInfo") && (o.dg15ActiveAuthenticationPublicKeyInfo = i.dot.v4.Lds1ElementaryFile.toObject(e.dg15ActiveAuthenticationPublicKeyInfo, n), n.oneofs && (o._dg15ActiveAuthenticationPublicKeyInfo = "dg15ActiveAuthenticationPublicKeyInfo")), e.dg16PersonsToNotify != null && e.hasOwnProperty("dg16PersonsToNotify") && (o.dg16PersonsToNotify = i.dot.v4.Lds1ElementaryFile.toObject(e.dg16PersonsToNotify, n), n.oneofs && (o._dg16PersonsToNotify = "dg16PersonsToNotify")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1eMrtdApplication";
      }, r;
    }(), s.Lds1ElementaryFile = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.id = 0, r.prototype.bytes = null;
      let t;
      return Object.defineProperty(r.prototype, "_bytes", {
        get: d.oneOfGetter(t = ["bytes"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.id != null && Object.hasOwnProperty.call(e, "id") && n.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(e.id), e.bytes != null && Object.hasOwnProperty.call(e, "bytes") && n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).bytes(e.bytes), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Lds1ElementaryFile();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.id = e.int32();
              break;
            }
            case 2: {
              a.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return e.bytes != null && e.hasOwnProperty("bytes") && !(e.bytes && typeof e.bytes.length == "number" || d.isString(e.bytes)) ? "bytes: buffer expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.Lds1ElementaryFile)
          return e;
        let n = new i.dot.v4.Lds1ElementaryFile();
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
        return e.bytes != null && (typeof e.bytes == "string" ? d.base64.decode(e.bytes, n.bytes = d.newBuffer(d.base64.length(e.bytes)), 0) : e.bytes.length >= 0 && (n.bytes = e.bytes)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.id = n.enums === String ? "ID_UNSPECIFIED" : 0), e.id != null && e.hasOwnProperty("id") && (o.id = n.enums === String ? i.dot.v4.Lds1ElementaryFile.Id[e.id] === void 0 ? e.id : i.dot.v4.Lds1ElementaryFile.Id[e.id] : e.id), e.bytes != null && e.hasOwnProperty("bytes") && (o.bytes = n.bytes === String ? d.base64.encode(e.bytes, 0, e.bytes.length) : n.bytes === Array ? Array.prototype.slice.call(e.bytes) : e.bytes, n.oneofs && (o._bytes = "bytes")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.Lds1ElementaryFile";
      }, r.Id = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "ID_UNSPECIFIED"] = 0, n[e[1] = "ID_COM"] = 1, n[e[2] = "ID_SOD"] = 2, n[e[3] = "ID_DG1"] = 3, n[e[4] = "ID_DG2"] = 4, n[e[5] = "ID_DG3"] = 5, n[e[6] = "ID_DG4"] = 6, n[e[7] = "ID_DG5"] = 7, n[e[8] = "ID_DG7"] = 8, n[e[9] = "ID_DG8"] = 9, n[e[10] = "ID_DG9"] = 10, n[e[11] = "ID_DG10"] = 11, n[e[12] = "ID_DG11"] = 12, n[e[13] = "ID_DG12"] = 13, n[e[14] = "ID_DG13"] = 14, n[e[15] = "ID_DG14"] = 15, n[e[16] = "ID_DG15"] = 16, n[e[17] = "ID_DG16"] = 17, n;
      }(), r;
    }(), s.AccessControlProtocol = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "ACCESS_CONTROL_PROTOCOL_UNSPECIFIED"] = 0, t[r[1] = "ACCESS_CONTROL_PROTOCOL_BAC"] = 1, t[r[2] = "ACCESS_CONTROL_PROTOCOL_PACE"] = 2, t;
    }(), s.AuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.data = null, r.prototype.chip = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.data != null && Object.hasOwnProperty.call(t, "data") && i.dot.v4.DataAuthenticationStatus.encode(t.data, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.chip != null && Object.hasOwnProperty.call(t, "chip") && i.dot.v4.ChipAuthenticationStatus.encode(t.chip, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.AuthenticationStatus();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.data = i.dot.v4.DataAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.chip = i.dot.v4.ChipAuthenticationStatus.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.data != null && t.hasOwnProperty("data")) {
          let e = i.dot.v4.DataAuthenticationStatus.verify(t.data);
          if (e)
            return "data." + e;
        }
        if (t.chip != null && t.hasOwnProperty("chip")) {
          let e = i.dot.v4.ChipAuthenticationStatus.verify(t.chip);
          if (e)
            return "chip." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.AuthenticationStatus)
          return t;
        let e = new i.dot.v4.AuthenticationStatus();
        if (t.data != null) {
          if (typeof t.data != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.data: object expected");
          e.data = i.dot.v4.DataAuthenticationStatus.fromObject(t.data);
        }
        if (t.chip != null) {
          if (typeof t.chip != "object")
            throw TypeError(".dot.v4.AuthenticationStatus.chip: object expected");
          e.chip = i.dot.v4.ChipAuthenticationStatus.fromObject(t.chip);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.data = null, n.chip = null), t.data != null && t.hasOwnProperty("data") && (n.data = i.dot.v4.DataAuthenticationStatus.toObject(t.data, e)), t.chip != null && t.hasOwnProperty("chip") && (n.chip = i.dot.v4.ChipAuthenticationStatus.toObject(t.chip, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.AuthenticationStatus";
      }, r;
    }(), s.DataAuthenticationStatus = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.status = 0, r.prototype.protocol = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.status != null && Object.hasOwnProperty.call(t, "status") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.status), t.protocol != null && Object.hasOwnProperty.call(t, "protocol") && e.uint32(
          /* id 2, wireType 0 =*/
          16
        ).int32(t.protocol), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.DataAuthenticationStatus();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.status = t.int32();
              break;
            }
            case 2: {
              u.protocol = t.int32();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
        if (t instanceof i.dot.v4.DataAuthenticationStatus)
          return t;
        let e = new i.dot.v4.DataAuthenticationStatus();
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
        return e.defaults && (n.status = e.enums === String ? "STATUS_UNSPECIFIED" : 0, n.protocol = e.enums === String ? "PROTOCOL_UNSPECIFIED" : 0), t.status != null && t.hasOwnProperty("status") && (n.status = e.enums === String ? i.dot.v4.DataAuthenticationStatus.Status[t.status] === void 0 ? t.status : i.dot.v4.DataAuthenticationStatus.Status[t.status] : t.status), t.protocol != null && t.hasOwnProperty("protocol") && (n.protocol = e.enums === String ? i.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] === void 0 ? t.protocol : i.dot.v4.DataAuthenticationStatus.Protocol[t.protocol] : t.protocol), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.DataAuthenticationStatus";
      }, r.Status = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "STATUS_UNSPECIFIED"] = 0, e[t[1] = "STATUS_AUTHENTICATED"] = 1, e[t[2] = "STATUS_DENIED"] = 2, e[t[3] = "STATUS_AUTHORITY_CERTIFICATES_NOT_PROVIDED"] = 3, e;
      }(), r.Protocol = function() {
        const t = {}, e = Object.create(t);
        return e[t[0] = "PROTOCOL_UNSPECIFIED"] = 0, e[t[1] = "PROTOCOL_PASSIVE_AUTHENTICATION"] = 1, e;
      }(), r;
    }(), s.ChipAuthenticationStatus = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.status = 0, r.prototype.protocol = null, r.prototype.activeAuthenticationResponse = null;
      let t;
      return Object.defineProperty(r.prototype, "_protocol", {
        get: d.oneOfGetter(t = ["protocol"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_activeAuthenticationResponse", {
        get: d.oneOfGetter(t = ["activeAuthenticationResponse"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.status != null && Object.hasOwnProperty.call(e, "status") && n.uint32(
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
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.status = e.int32();
              break;
            }
            case 2: {
              a.protocol = e.int32();
              break;
            }
            case 3: {
              a.activeAuthenticationResponse = e.bytes();
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
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
        return e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && !(e.activeAuthenticationResponse && typeof e.activeAuthenticationResponse.length == "number" || d.isString(e.activeAuthenticationResponse)) ? "activeAuthenticationResponse: buffer expected" : null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.ChipAuthenticationStatus)
          return e;
        let n = new i.dot.v4.ChipAuthenticationStatus();
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
        return e.activeAuthenticationResponse != null && (typeof e.activeAuthenticationResponse == "string" ? d.base64.decode(e.activeAuthenticationResponse, n.activeAuthenticationResponse = d.newBuffer(d.base64.length(e.activeAuthenticationResponse)), 0) : e.activeAuthenticationResponse.length >= 0 && (n.activeAuthenticationResponse = e.activeAuthenticationResponse)), n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.status = n.enums === String ? "STATUS_UNSPECIFIED" : 0), e.status != null && e.hasOwnProperty("status") && (o.status = n.enums === String ? i.dot.v4.ChipAuthenticationStatus.Status[e.status] === void 0 ? e.status : i.dot.v4.ChipAuthenticationStatus.Status[e.status] : e.status), e.protocol != null && e.hasOwnProperty("protocol") && (o.protocol = n.enums === String ? i.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] === void 0 ? e.protocol : i.dot.v4.ChipAuthenticationStatus.Protocol[e.protocol] : e.protocol, n.oneofs && (o._protocol = "protocol")), e.activeAuthenticationResponse != null && e.hasOwnProperty("activeAuthenticationResponse") && (o.activeAuthenticationResponse = n.bytes === String ? d.base64.encode(e.activeAuthenticationResponse, 0, e.activeAuthenticationResponse.length) : n.bytes === Array ? Array.prototype.slice.call(e.activeAuthenticationResponse) : e.activeAuthenticationResponse, n.oneofs && (o._activeAuthenticationResponse = "activeAuthenticationResponse")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.ChipAuthenticationStatus";
      }, r.Status = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "STATUS_UNSPECIFIED"] = 0, n[e[1] = "STATUS_AUTHENTICATED"] = 1, n[e[2] = "STATUS_DENIED"] = 2, n[e[3] = "STATUS_NOT_SUPPORTED"] = 3, n;
      }(), r.Protocol = function() {
        const e = {}, n = Object.create(e);
        return n[e[0] = "PROTOCOL_UNSPECIFIED"] = 0, n[e[1] = "PROTOCOL_PACE_CHIP_AUTHENTICATION_MAPPING"] = 1, n[e[2] = "PROTOCOL_CHIP_AUTHENTICATION"] = 2, n[e[3] = "PROTOCOL_ACTIVE_AUTHENTICATION"] = 3, n;
      }(), r;
    }(), s.EyeGazeLivenessContent = function() {
      function r(e) {
        if (this.segments = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.segments = d.emptyArray, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_image", {
        get: d.oneOfGetter(t = ["image"]),
        set: d.oneOfSetter(t)
      }), Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.segments != null && e.segments.length)
          for (let o = 0; o < e.segments.length; ++o)
            i.dot.v4.EyeGazeLivenessSegment.encode(e.segments[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 3: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 1: {
              a.segments && a.segments.length || (a.segments = []), a.segments.push(i.dot.v4.EyeGazeLivenessSegment.decode(e, e.uint32()));
              break;
            }
            case 4: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = i.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.segments != null && e.hasOwnProperty("segments")) {
          if (!Array.isArray(e.segments))
            return "segments: array expected";
          for (let n = 0; n < e.segments.length; ++n) {
            let o = i.dot.v4.EyeGazeLivenessSegment.verify(e.segments[n]);
            if (o)
              return "segments." + o;
          }
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.EyeGazeLivenessContent)
          return e;
        let n = new i.dot.v4.EyeGazeLivenessContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.image: object expected");
          n.image = i.dot.Image.fromObject(e.image);
        }
        if (e.segments) {
          if (!Array.isArray(e.segments))
            throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: array expected");
          n.segments = [];
          for (let o = 0; o < e.segments.length; ++o) {
            if (typeof e.segments[o] != "object")
              throw TypeError(".dot.v4.EyeGazeLivenessContent.segments: object expected");
            n.segments[o] = i.dot.v4.EyeGazeLivenessSegment.fromObject(e.segments[o]);
          }
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.EyeGazeLivenessContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.segments = []), n.defaults && (o.metadata = null), e.segments && e.segments.length) {
          o.segments = [];
          for (let u = 0; u < e.segments.length; ++u)
            o.segments[u] = i.dot.v4.EyeGazeLivenessSegment.toObject(e.segments[u], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, n), n.oneofs && (o._image = "image")), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.EyeGazeLivenessContent";
      }, r;
    }(), s.EyeGazeLivenessSegment = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.corner = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.corner != null && Object.hasOwnProperty.call(t, "corner") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.corner), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.Image.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.EyeGazeLivenessSegment();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.corner = t.int32();
              break;
            }
            case 2: {
              u.image = i.dot.Image.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
          let e = i.dot.Image.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.EyeGazeLivenessSegment)
          return t;
        let e = new i.dot.v4.EyeGazeLivenessSegment();
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
          e.image = i.dot.Image.fromObject(t.image);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.corner = e.enums === String ? "TOP_LEFT" : 0, n.image = null), t.corner != null && t.hasOwnProperty("corner") && (n.corner = e.enums === String ? i.dot.v4.EyeGazeLivenessCorner[t.corner] === void 0 ? t.corner : i.dot.v4.EyeGazeLivenessCorner[t.corner] : t.corner), t.image != null && t.hasOwnProperty("image") && (n.image = i.dot.Image.toObject(t.image, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.EyeGazeLivenessSegment";
      }, r;
    }(), s.EyeGazeLivenessCorner = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "TOP_LEFT"] = 0, t[r[1] = "TOP_RIGHT"] = 1, t[r[2] = "BOTTOM_RIGHT"] = 2, t[r[3] = "BOTTOM_LEFT"] = 3, t;
    }(), s.MultiRangeLivenessContent = function() {
      function r(e) {
        if (this.stepResults = [], e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.stepResults = d.emptyArray, r.prototype.metadata = null, r.prototype.video = null, r.prototype.multiRangeLivenessMetadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        if (n || (n = E.create()), e.stepResults != null && e.stepResults.length)
          for (let o = 0; o < e.stepResults.length; ++o)
            i.dot.v4.MultiRangeLivenessStepResult.encode(e.stepResults[o], n.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.multiRangeLivenessMetadata != null && Object.hasOwnProperty.call(e, "multiRangeLivenessMetadata") && i.dot.v4.MultiRangeLivenessMetadata.encode(e.multiRangeLivenessMetadata, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.MultiRangeLivenessContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.stepResults && a.stepResults.length || (a.stepResults = []), a.stepResults.push(i.dot.v4.MultiRangeLivenessStepResult.decode(e, e.uint32()));
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.multiRangeLivenessMetadata = i.dot.v4.MultiRangeLivenessMetadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.stepResults != null && e.hasOwnProperty("stepResults")) {
          if (!Array.isArray(e.stepResults))
            return "stepResults: array expected";
          for (let n = 0; n < e.stepResults.length; ++n) {
            let o = i.dot.v4.MultiRangeLivenessStepResult.verify(e.stepResults[n]);
            if (o)
              return "stepResults." + o;
          }
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.multiRangeLivenessMetadata != null && e.hasOwnProperty("multiRangeLivenessMetadata")) {
          let n = i.dot.v4.MultiRangeLivenessMetadata.verify(e.multiRangeLivenessMetadata);
          if (n)
            return "multiRangeLivenessMetadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.MultiRangeLivenessContent)
          return e;
        let n = new i.dot.v4.MultiRangeLivenessContent();
        if (e.stepResults) {
          if (!Array.isArray(e.stepResults))
            throw TypeError(".dot.v4.MultiRangeLivenessContent.stepResults: array expected");
          n.stepResults = [];
          for (let o = 0; o < e.stepResults.length; ++o) {
            if (typeof e.stepResults[o] != "object")
              throw TypeError(".dot.v4.MultiRangeLivenessContent.stepResults: object expected");
            n.stepResults[o] = i.dot.v4.MultiRangeLivenessStepResult.fromObject(e.stepResults[o]);
          }
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.multiRangeLivenessMetadata != null) {
          if (typeof e.multiRangeLivenessMetadata != "object")
            throw TypeError(".dot.v4.MultiRangeLivenessContent.multiRangeLivenessMetadata: object expected");
          n.multiRangeLivenessMetadata = i.dot.v4.MultiRangeLivenessMetadata.fromObject(e.multiRangeLivenessMetadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        if ((n.arrays || n.defaults) && (o.stepResults = []), n.defaults && (o.metadata = null, o.multiRangeLivenessMetadata = null), e.stepResults && e.stepResults.length) {
          o.stepResults = [];
          for (let u = 0; u < e.stepResults.length; ++u)
            o.stepResults[u] = i.dot.v4.MultiRangeLivenessStepResult.toObject(e.stepResults[u], n);
        }
        return e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), e.multiRangeLivenessMetadata != null && e.hasOwnProperty("multiRangeLivenessMetadata") && (o.multiRangeLivenessMetadata = i.dot.v4.MultiRangeLivenessMetadata.toObject(e.multiRangeLivenessMetadata, n)), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.MultiRangeLivenessContent";
      }, r;
    }(), s.MultiRangeLivenessStepResult = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.challengeItem = 0, r.prototype.image = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.challengeItem != null && Object.hasOwnProperty.call(t, "challengeItem") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).int32(t.challengeItem), t.image != null && Object.hasOwnProperty.call(t, "image") && i.dot.ImageWithTimestamp.encode(t.image, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.MultiRangeLivenessStepResult();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.challengeItem = t.int32();
              break;
            }
            case 2: {
              u.image = i.dot.ImageWithTimestamp.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
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
          let e = i.dot.ImageWithTimestamp.verify(t.image);
          if (e)
            return "image." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.MultiRangeLivenessStepResult)
          return t;
        let e = new i.dot.v4.MultiRangeLivenessStepResult();
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
          e.image = i.dot.ImageWithTimestamp.fromObject(t.image);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.challengeItem = e.enums === String ? "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED" : 0, n.image = null), t.challengeItem != null && t.hasOwnProperty("challengeItem") && (n.challengeItem = e.enums === String ? i.dot.v4.MultiRangeLivenessChallengeItem[t.challengeItem] === void 0 ? t.challengeItem : i.dot.v4.MultiRangeLivenessChallengeItem[t.challengeItem] : t.challengeItem), t.image != null && t.hasOwnProperty("image") && (n.image = i.dot.ImageWithTimestamp.toObject(t.image, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessStepResult";
      }, r;
    }(), s.MultiRangeLivenessChallengeItem = function() {
      const r = {}, t = Object.create(r);
      return t[r[0] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_UNSPECIFIED"] = 0, t[r[1] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ZERO"] = 1, t[r[2] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_ONE"] = 2, t[r[3] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_TWO"] = 3, t[r[4] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_THREE"] = 4, t[r[5] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FOUR"] = 5, t[r[6] = "MULTI_RANGE_LIVENESS_CHALLENGE_ITEM_FIVE"] = 6, t;
    }(), s.MultiRangeLivenessMetadata = function() {
      function r(t) {
        if (this.detections = [], t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.detections = d.emptyArray, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        if (e || (e = E.create()), t.detections != null && t.detections.length)
          for (let n = 0; n < t.detections.length; ++n)
            i.dot.v4.FaceDetection.encode(t.detections[n], e.uint32(
              /* id 1, wireType 2 =*/
              10
            ).fork()).ldelim();
        return e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.MultiRangeLivenessMetadata();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.detections && u.detections.length || (u.detections = []), u.detections.push(i.dot.v4.FaceDetection.decode(t, t.uint32()));
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.detections != null && t.hasOwnProperty("detections")) {
          if (!Array.isArray(t.detections))
            return "detections: array expected";
          for (let e = 0; e < t.detections.length; ++e) {
            let n = i.dot.v4.FaceDetection.verify(t.detections[e]);
            if (n)
              return "detections." + n;
          }
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.MultiRangeLivenessMetadata)
          return t;
        let e = new i.dot.v4.MultiRangeLivenessMetadata();
        if (t.detections) {
          if (!Array.isArray(t.detections))
            throw TypeError(".dot.v4.MultiRangeLivenessMetadata.detections: array expected");
          e.detections = [];
          for (let n = 0; n < t.detections.length; ++n) {
            if (typeof t.detections[n] != "object")
              throw TypeError(".dot.v4.MultiRangeLivenessMetadata.detections: object expected");
            e.detections[n] = i.dot.v4.FaceDetection.fromObject(t.detections[n]);
          }
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if ((e.arrays || e.defaults) && (n.detections = []), t.detections && t.detections.length) {
          n.detections = [];
          for (let o = 0; o < t.detections.length; ++o)
            n.detections[o] = i.dot.v4.FaceDetection.toObject(t.detections[o], e);
        }
        return n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.MultiRangeLivenessMetadata";
      }, r;
    }(), s.FaceDetection = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, r.prototype.position = null, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.timestampMillis != null && Object.hasOwnProperty.call(t, "timestampMillis") && e.uint32(
          /* id 1, wireType 0 =*/
          8
        ).uint64(t.timestampMillis), t.position != null && Object.hasOwnProperty.call(t, "position") && i.dot.v4.FaceDetectionPosition.encode(t.position, e.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.FaceDetection();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.timestampMillis = t.uint64();
              break;
            }
            case 2: {
              u.position = i.dot.v4.FaceDetectionPosition.decode(t, t.uint32());
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && !d.isInteger(t.timestampMillis) && !(t.timestampMillis && d.isInteger(t.timestampMillis.low) && d.isInteger(t.timestampMillis.high)))
          return "timestampMillis: integer|Long expected";
        if (t.position != null && t.hasOwnProperty("position")) {
          let e = i.dot.v4.FaceDetectionPosition.verify(t.position);
          if (e)
            return "position." + e;
        }
        return null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.FaceDetection)
          return t;
        let e = new i.dot.v4.FaceDetection();
        if (t.timestampMillis != null && (d.Long ? (e.timestampMillis = d.Long.fromValue(t.timestampMillis)).unsigned = !0 : typeof t.timestampMillis == "string" ? e.timestampMillis = parseInt(t.timestampMillis, 10) : typeof t.timestampMillis == "number" ? e.timestampMillis = t.timestampMillis : typeof t.timestampMillis == "object" && (e.timestampMillis = new d.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0))), t.position != null) {
          if (typeof t.position != "object")
            throw TypeError(".dot.v4.FaceDetection.position: object expected");
          e.position = i.dot.v4.FaceDetectionPosition.fromObject(t.position);
        }
        return e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        if (e.defaults) {
          if (d.Long) {
            let o = new d.Long(0, 0, !0);
            n.timestampMillis = e.longs === String ? o.toString() : e.longs === Number ? o.toNumber() : o;
          } else
            n.timestampMillis = e.longs === String ? "0" : 0;
          n.position = null;
        }
        return t.timestampMillis != null && t.hasOwnProperty("timestampMillis") && (typeof t.timestampMillis == "number" ? n.timestampMillis = e.longs === String ? String(t.timestampMillis) : t.timestampMillis : n.timestampMillis = e.longs === String ? d.Long.prototype.toString.call(t.timestampMillis) : e.longs === Number ? new d.LongBits(t.timestampMillis.low >>> 0, t.timestampMillis.high >>> 0).toNumber(!0) : t.timestampMillis), t.position != null && t.hasOwnProperty("position") && (n.position = i.dot.v4.FaceDetectionPosition.toObject(t.position, e)), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetection";
      }, r;
    }(), s.FaceDetectionPosition = function() {
      function r(t) {
        if (t)
          for (let e = Object.keys(t), n = 0; n < e.length; ++n)
            t[e[n]] != null && (this[e[n]] = t[e[n]]);
      }
      return r.prototype.center = null, r.prototype.faceSizeToImageShorterSideRatio = 0, r.create = function(t) {
        return new r(t);
      }, r.encode = function(t, e) {
        return e || (e = E.create()), t.center != null && Object.hasOwnProperty.call(t, "center") && i.dot.PointDouble.encode(t.center, e.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), t.faceSizeToImageShorterSideRatio != null && Object.hasOwnProperty.call(t, "faceSizeToImageShorterSideRatio") && e.uint32(
          /* id 2, wireType 1 =*/
          17
        ).double(t.faceSizeToImageShorterSideRatio), e;
      }, r.encodeDelimited = function(t, e) {
        return this.encode(t, e).ldelim();
      }, r.decode = function(t, e, n) {
        t instanceof g || (t = g.create(t));
        let o = e === void 0 ? t.len : t.pos + e, u = new i.dot.v4.FaceDetectionPosition();
        for (; t.pos < o; ) {
          let a = t.uint32();
          if (a === n)
            break;
          switch (a >>> 3) {
            case 1: {
              u.center = i.dot.PointDouble.decode(t, t.uint32());
              break;
            }
            case 2: {
              u.faceSizeToImageShorterSideRatio = t.double();
              break;
            }
            default:
              t.skipType(a & 7);
              break;
          }
        }
        return u;
      }, r.decodeDelimited = function(t) {
        return t instanceof g || (t = new g(t)), this.decode(t, t.uint32());
      }, r.verify = function(t) {
        if (typeof t != "object" || t === null)
          return "object expected";
        if (t.center != null && t.hasOwnProperty("center")) {
          let e = i.dot.PointDouble.verify(t.center);
          if (e)
            return "center." + e;
        }
        return t.faceSizeToImageShorterSideRatio != null && t.hasOwnProperty("faceSizeToImageShorterSideRatio") && typeof t.faceSizeToImageShorterSideRatio != "number" ? "faceSizeToImageShorterSideRatio: number expected" : null;
      }, r.fromObject = function(t) {
        if (t instanceof i.dot.v4.FaceDetectionPosition)
          return t;
        let e = new i.dot.v4.FaceDetectionPosition();
        if (t.center != null) {
          if (typeof t.center != "object")
            throw TypeError(".dot.v4.FaceDetectionPosition.center: object expected");
          e.center = i.dot.PointDouble.fromObject(t.center);
        }
        return t.faceSizeToImageShorterSideRatio != null && (e.faceSizeToImageShorterSideRatio = Number(t.faceSizeToImageShorterSideRatio)), e;
      }, r.toObject = function(t, e) {
        e || (e = {});
        let n = {};
        return e.defaults && (n.center = null, n.faceSizeToImageShorterSideRatio = 0), t.center != null && t.hasOwnProperty("center") && (n.center = i.dot.PointDouble.toObject(t.center, e)), t.faceSizeToImageShorterSideRatio != null && t.hasOwnProperty("faceSizeToImageShorterSideRatio") && (n.faceSizeToImageShorterSideRatio = e.json && !isFinite(t.faceSizeToImageShorterSideRatio) ? String(t.faceSizeToImageShorterSideRatio) : t.faceSizeToImageShorterSideRatio), n;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(t) {
        return t === void 0 && (t = "type.googleapis.com"), t + "/dot.v4.FaceDetectionPosition";
      }, r;
    }(), s.SmileLivenessContent = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.neutralExpressionFaceImage = null, r.prototype.smileExpressionFaceImage = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.neutralExpressionFaceImage != null && Object.hasOwnProperty.call(e, "neutralExpressionFaceImage") && i.dot.Image.encode(e.neutralExpressionFaceImage, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.smileExpressionFaceImage != null && Object.hasOwnProperty.call(e, "smileExpressionFaceImage") && i.dot.Image.encode(e.smileExpressionFaceImage, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 4, wireType 2 =*/
          34
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.SmileLivenessContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.neutralExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.smileExpressionFaceImage = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 4: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage")) {
          let n = i.dot.Image.verify(e.neutralExpressionFaceImage);
          if (n)
            return "neutralExpressionFaceImage." + n;
        }
        if (e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage")) {
          let n = i.dot.Image.verify(e.smileExpressionFaceImage);
          if (n)
            return "smileExpressionFaceImage." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.SmileLivenessContent)
          return e;
        let n = new i.dot.v4.SmileLivenessContent();
        if (e.neutralExpressionFaceImage != null) {
          if (typeof e.neutralExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.neutralExpressionFaceImage: object expected");
          n.neutralExpressionFaceImage = i.dot.Image.fromObject(e.neutralExpressionFaceImage);
        }
        if (e.smileExpressionFaceImage != null) {
          if (typeof e.smileExpressionFaceImage != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.smileExpressionFaceImage: object expected");
          n.smileExpressionFaceImage = i.dot.Image.fromObject(e.smileExpressionFaceImage);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.SmileLivenessContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.neutralExpressionFaceImage = null, o.smileExpressionFaceImage = null, o.metadata = null), e.neutralExpressionFaceImage != null && e.hasOwnProperty("neutralExpressionFaceImage") && (o.neutralExpressionFaceImage = i.dot.Image.toObject(e.neutralExpressionFaceImage, n)), e.smileExpressionFaceImage != null && e.hasOwnProperty("smileExpressionFaceImage") && (o.smileExpressionFaceImage = i.dot.Image.toObject(e.smileExpressionFaceImage, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.SmileLivenessContent";
      }, r;
    }(), s.PalmContent = function() {
      function r(e) {
        if (e)
          for (let n = Object.keys(e), o = 0; o < n.length; ++o)
            e[n[o]] != null && (this[n[o]] = e[n[o]]);
      }
      r.prototype.image = null, r.prototype.video = null, r.prototype.metadata = null;
      let t;
      return Object.defineProperty(r.prototype, "_video", {
        get: d.oneOfGetter(t = ["video"]),
        set: d.oneOfSetter(t)
      }), r.create = function(e) {
        return new r(e);
      }, r.encode = function(e, n) {
        return n || (n = E.create()), e.image != null && Object.hasOwnProperty.call(e, "image") && i.dot.Image.encode(e.image, n.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork()).ldelim(), e.metadata != null && Object.hasOwnProperty.call(e, "metadata") && i.dot.v4.Metadata.encode(e.metadata, n.uint32(
          /* id 2, wireType 2 =*/
          18
        ).fork()).ldelim(), e.video != null && Object.hasOwnProperty.call(e, "video") && i.dot.Video.encode(e.video, n.uint32(
          /* id 3, wireType 2 =*/
          26
        ).fork()).ldelim(), n;
      }, r.encodeDelimited = function(e, n) {
        return this.encode(e, n).ldelim();
      }, r.decode = function(e, n, o) {
        e instanceof g || (e = g.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.PalmContent();
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.image = i.dot.Image.decode(e, e.uint32());
              break;
            }
            case 3: {
              a.video = i.dot.Video.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.metadata = i.dot.v4.Metadata.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof g || (e = new g(e)), this.decode(e, e.uint32());
      }, r.verify = function(e) {
        if (typeof e != "object" || e === null)
          return "object expected";
        if (e.image != null && e.hasOwnProperty("image")) {
          let n = i.dot.Image.verify(e.image);
          if (n)
            return "image." + n;
        }
        if (e.video != null && e.hasOwnProperty("video")) {
          let n = i.dot.Video.verify(e.video);
          if (n)
            return "video." + n;
        }
        if (e.metadata != null && e.hasOwnProperty("metadata")) {
          let n = i.dot.v4.Metadata.verify(e.metadata);
          if (n)
            return "metadata." + n;
        }
        return null;
      }, r.fromObject = function(e) {
        if (e instanceof i.dot.v4.PalmContent)
          return e;
        let n = new i.dot.v4.PalmContent();
        if (e.image != null) {
          if (typeof e.image != "object")
            throw TypeError(".dot.v4.PalmContent.image: object expected");
          n.image = i.dot.Image.fromObject(e.image);
        }
        if (e.video != null) {
          if (typeof e.video != "object")
            throw TypeError(".dot.v4.PalmContent.video: object expected");
          n.video = i.dot.Video.fromObject(e.video);
        }
        if (e.metadata != null) {
          if (typeof e.metadata != "object")
            throw TypeError(".dot.v4.PalmContent.metadata: object expected");
          n.metadata = i.dot.v4.Metadata.fromObject(e.metadata);
        }
        return n;
      }, r.toObject = function(e, n) {
        n || (n = {});
        let o = {};
        return n.defaults && (o.image = null, o.metadata = null), e.image != null && e.hasOwnProperty("image") && (o.image = i.dot.Image.toObject(e.image, n)), e.metadata != null && e.hasOwnProperty("metadata") && (o.metadata = i.dot.v4.Metadata.toObject(e.metadata, n)), e.video != null && e.hasOwnProperty("video") && (o.video = i.dot.Video.toObject(e.video, n), n.oneofs && (o._video = "video")), o;
      }, r.prototype.toJSON = function() {
        return this.constructor.toObject(this, D.util.toJSONOptions);
      }, r.getTypeUrl = function(e) {
        return e === void 0 && (e = "type.googleapis.com"), e + "/dot.v4.PalmContent";
      }, r;
    }(), s;
  }(), f.Image = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.bytes = d.newBuffer([]), s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.Image();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || d.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.Image)
        return r;
      let t = new i.dot.Image();
      return r.bytes != null && (typeof r.bytes == "string" ? d.base64.decode(r.bytes, t.bytes = d.newBuffer(d.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Image";
    }, s;
  }(), f.ImageWithTimestamp = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.image = null, s.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.image != null && Object.hasOwnProperty.call(r, "image") && i.dot.Image.encode(r.image, t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).fork()).ldelim(), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.ImageWithTimestamp();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.image = i.dot.Image.decode(r, r.uint32());
            break;
          }
          case 2: {
            o.timestampMillis = r.uint64();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.image != null && r.hasOwnProperty("image")) {
        let t = i.dot.Image.verify(r.image);
        if (t)
          return "image." + t;
      }
      return r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !d.isInteger(r.timestampMillis) && !(r.timestampMillis && d.isInteger(r.timestampMillis.low) && d.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.ImageWithTimestamp)
        return r;
      let t = new i.dot.ImageWithTimestamp();
      if (r.image != null) {
        if (typeof r.image != "object")
          throw TypeError(".dot.ImageWithTimestamp.image: object expected");
        t.image = i.dot.Image.fromObject(r.image);
      }
      return r.timestampMillis != null && (d.Long ? (t.timestampMillis = d.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new d.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (e.image = null, d.Long) {
          let n = new d.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.image != null && r.hasOwnProperty("image") && (e.image = i.dot.Image.toObject(r.image, t)), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? d.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new d.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageWithTimestamp";
    }, s;
  }(), f.ImageSize = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.width = 0, s.prototype.height = 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.width != null && Object.hasOwnProperty.call(r, "width") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.width), r.height != null && Object.hasOwnProperty.call(r, "height") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.height), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.ImageSize();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.width = r.int32();
            break;
          }
          case 2: {
            o.height = r.int32();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.width != null && r.hasOwnProperty("width") && !d.isInteger(r.width) ? "width: integer expected" : r.height != null && r.hasOwnProperty("height") && !d.isInteger(r.height) ? "height: integer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.ImageSize)
        return r;
      let t = new i.dot.ImageSize();
      return r.width != null && (t.width = r.width | 0), r.height != null && (t.height = r.height | 0), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.width = 0, e.height = 0), r.width != null && r.hasOwnProperty("width") && (e.width = r.width), r.height != null && r.hasOwnProperty("height") && (e.height = r.height), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.ImageSize";
    }, s;
  }(), f.Int32List = function() {
    function s(r) {
      if (this.items = [], r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.items = d.emptyArray, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      if (t || (t = E.create()), r.items != null && r.items.length) {
        t.uint32(
          /* id 1, wireType 2 =*/
          10
        ).fork();
        for (let e = 0; e < r.items.length; ++e)
          t.int32(r.items[e]);
        t.ldelim();
      }
      return t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.Int32List();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            if (o.items && o.items.length || (o.items = []), (u & 7) === 2) {
              let a = r.uint32() + r.pos;
              for (; r.pos < a; )
                o.items.push(r.int32());
            } else
              o.items.push(r.int32());
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      if (typeof r != "object" || r === null)
        return "object expected";
      if (r.items != null && r.hasOwnProperty("items")) {
        if (!Array.isArray(r.items))
          return "items: array expected";
        for (let t = 0; t < r.items.length; ++t)
          if (!d.isInteger(r.items[t]))
            return "items: integer[] expected";
      }
      return null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.Int32List)
        return r;
      let t = new i.dot.Int32List();
      if (r.items) {
        if (!Array.isArray(r.items))
          throw TypeError(".dot.Int32List.items: array expected");
        t.items = [];
        for (let e = 0; e < r.items.length; ++e)
          t.items[e] = r.items[e] | 0;
      }
      return t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if ((t.arrays || t.defaults) && (e.items = []), r.items && r.items.length) {
        e.items = [];
        for (let n = 0; n < r.items.length; ++n)
          e.items[n] = r.items[n];
      }
      return e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Int32List";
    }, s;
  }(), f.Platform = function() {
    const s = {}, r = Object.create(s);
    return r[s[0] = "WEB"] = 0, r[s[1] = "ANDROID"] = 1, r[s[2] = "IOS"] = 2, r;
  }(), f.RectangleDouble = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.left = 0, s.prototype.top = 0, s.prototype.right = 0, s.prototype.bottom = 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.left != null && Object.hasOwnProperty.call(r, "left") && t.uint32(
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
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.RectangleDouble();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
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
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.left != null && r.hasOwnProperty("left") && typeof r.left != "number" ? "left: number expected" : r.top != null && r.hasOwnProperty("top") && typeof r.top != "number" ? "top: number expected" : r.right != null && r.hasOwnProperty("right") && typeof r.right != "number" ? "right: number expected" : r.bottom != null && r.hasOwnProperty("bottom") && typeof r.bottom != "number" ? "bottom: number expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.RectangleDouble)
        return r;
      let t = new i.dot.RectangleDouble();
      return r.left != null && (t.left = Number(r.left)), r.top != null && (t.top = Number(r.top)), r.right != null && (t.right = Number(r.right)), r.bottom != null && (t.bottom = Number(r.bottom)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.left = 0, e.top = 0, e.right = 0, e.bottom = 0), r.left != null && r.hasOwnProperty("left") && (e.left = t.json && !isFinite(r.left) ? String(r.left) : r.left), r.top != null && r.hasOwnProperty("top") && (e.top = t.json && !isFinite(r.top) ? String(r.top) : r.top), r.right != null && r.hasOwnProperty("right") && (e.right = t.json && !isFinite(r.right) ? String(r.right) : r.right), r.bottom != null && r.hasOwnProperty("bottom") && (e.bottom = t.json && !isFinite(r.bottom) ? String(r.bottom) : r.bottom), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.RectangleDouble";
    }, s;
  }(), f.DigestWithTimestamp = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.digest = d.newBuffer([]), s.prototype.timestampMillis = d.Long ? d.Long.fromBits(0, 0, !0) : 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.digest != null && Object.hasOwnProperty.call(r, "digest") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.digest), r.timestampMillis != null && Object.hasOwnProperty.call(r, "timestampMillis") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).uint64(r.timestampMillis), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.DigestWithTimestamp();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.digest = r.bytes();
            break;
          }
          case 2: {
            o.timestampMillis = r.uint64();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.digest != null && r.hasOwnProperty("digest") && !(r.digest && typeof r.digest.length == "number" || d.isString(r.digest)) ? "digest: buffer expected" : r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && !d.isInteger(r.timestampMillis) && !(r.timestampMillis && d.isInteger(r.timestampMillis.low) && d.isInteger(r.timestampMillis.high)) ? "timestampMillis: integer|Long expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.DigestWithTimestamp)
        return r;
      let t = new i.dot.DigestWithTimestamp();
      return r.digest != null && (typeof r.digest == "string" ? d.base64.decode(r.digest, t.digest = d.newBuffer(d.base64.length(r.digest)), 0) : r.digest.length >= 0 && (t.digest = r.digest)), r.timestampMillis != null && (d.Long ? (t.timestampMillis = d.Long.fromValue(r.timestampMillis)).unsigned = !0 : typeof r.timestampMillis == "string" ? t.timestampMillis = parseInt(r.timestampMillis, 10) : typeof r.timestampMillis == "number" ? t.timestampMillis = r.timestampMillis : typeof r.timestampMillis == "object" && (t.timestampMillis = new d.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0))), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      if (t.defaults)
        if (t.bytes === String ? e.digest = "" : (e.digest = [], t.bytes !== Array && (e.digest = d.newBuffer(e.digest))), d.Long) {
          let n = new d.Long(0, 0, !0);
          e.timestampMillis = t.longs === String ? n.toString() : t.longs === Number ? n.toNumber() : n;
        } else
          e.timestampMillis = t.longs === String ? "0" : 0;
      return r.digest != null && r.hasOwnProperty("digest") && (e.digest = t.bytes === String ? d.base64.encode(r.digest, 0, r.digest.length) : t.bytes === Array ? Array.prototype.slice.call(r.digest) : r.digest), r.timestampMillis != null && r.hasOwnProperty("timestampMillis") && (typeof r.timestampMillis == "number" ? e.timestampMillis = t.longs === String ? String(r.timestampMillis) : r.timestampMillis : e.timestampMillis = t.longs === String ? d.Long.prototype.toString.call(r.timestampMillis) : t.longs === Number ? new d.LongBits(r.timestampMillis.low >>> 0, r.timestampMillis.high >>> 0).toNumber(!0) : r.timestampMillis), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.DigestWithTimestamp";
    }, s;
  }(), f.Video = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.bytes = d.newBuffer([]), s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.bytes != null && Object.hasOwnProperty.call(r, "bytes") && t.uint32(
        /* id 1, wireType 2 =*/
        10
      ).bytes(r.bytes), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.Video();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.bytes = r.bytes();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.bytes != null && r.hasOwnProperty("bytes") && !(r.bytes && typeof r.bytes.length == "number" || d.isString(r.bytes)) ? "bytes: buffer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.Video)
        return r;
      let t = new i.dot.Video();
      return r.bytes != null && (typeof r.bytes == "string" ? d.base64.decode(r.bytes, t.bytes = d.newBuffer(d.base64.length(r.bytes)), 0) : r.bytes.length >= 0 && (t.bytes = r.bytes)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (t.bytes === String ? e.bytes = "" : (e.bytes = [], t.bytes !== Array && (e.bytes = d.newBuffer(e.bytes)))), r.bytes != null && r.hasOwnProperty("bytes") && (e.bytes = t.bytes === String ? d.base64.encode(r.bytes, 0, r.bytes.length) : t.bytes === Array ? Array.prototype.slice.call(r.bytes) : r.bytes), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.Video";
    }, s;
  }(), f.PointInt = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.x = 0, s.prototype.y = 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.x != null && Object.hasOwnProperty.call(r, "x") && t.uint32(
        /* id 1, wireType 0 =*/
        8
      ).int32(r.x), r.y != null && Object.hasOwnProperty.call(r, "y") && t.uint32(
        /* id 2, wireType 0 =*/
        16
      ).int32(r.y), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.PointInt();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.x = r.int32();
            break;
          }
          case 2: {
            o.y = r.int32();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.x != null && r.hasOwnProperty("x") && !d.isInteger(r.x) ? "x: integer expected" : r.y != null && r.hasOwnProperty("y") && !d.isInteger(r.y) ? "y: integer expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.PointInt)
        return r;
      let t = new i.dot.PointInt();
      return r.x != null && (t.x = r.x | 0), r.y != null && (t.y = r.y | 0), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), r.x != null && r.hasOwnProperty("x") && (e.x = r.x), r.y != null && r.hasOwnProperty("y") && (e.y = r.y), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.PointInt";
    }, s;
  }(), f.PointDouble = function() {
    function s(r) {
      if (r)
        for (let t = Object.keys(r), e = 0; e < t.length; ++e)
          r[t[e]] != null && (this[t[e]] = r[t[e]]);
    }
    return s.prototype.x = 0, s.prototype.y = 0, s.create = function(r) {
      return new s(r);
    }, s.encode = function(r, t) {
      return t || (t = E.create()), r.x != null && Object.hasOwnProperty.call(r, "x") && t.uint32(
        /* id 1, wireType 1 =*/
        9
      ).double(r.x), r.y != null && Object.hasOwnProperty.call(r, "y") && t.uint32(
        /* id 2, wireType 1 =*/
        17
      ).double(r.y), t;
    }, s.encodeDelimited = function(r, t) {
      return this.encode(r, t).ldelim();
    }, s.decode = function(r, t, e) {
      r instanceof g || (r = g.create(r));
      let n = t === void 0 ? r.len : r.pos + t, o = new i.dot.PointDouble();
      for (; r.pos < n; ) {
        let u = r.uint32();
        if (u === e)
          break;
        switch (u >>> 3) {
          case 1: {
            o.x = r.double();
            break;
          }
          case 2: {
            o.y = r.double();
            break;
          }
          default:
            r.skipType(u & 7);
            break;
        }
      }
      return o;
    }, s.decodeDelimited = function(r) {
      return r instanceof g || (r = new g(r)), this.decode(r, r.uint32());
    }, s.verify = function(r) {
      return typeof r != "object" || r === null ? "object expected" : r.x != null && r.hasOwnProperty("x") && typeof r.x != "number" ? "x: number expected" : r.y != null && r.hasOwnProperty("y") && typeof r.y != "number" ? "y: number expected" : null;
    }, s.fromObject = function(r) {
      if (r instanceof i.dot.PointDouble)
        return r;
      let t = new i.dot.PointDouble();
      return r.x != null && (t.x = Number(r.x)), r.y != null && (t.y = Number(r.y)), t;
    }, s.toObject = function(r, t) {
      t || (t = {});
      let e = {};
      return t.defaults && (e.x = 0, e.y = 0), r.x != null && r.hasOwnProperty("x") && (e.x = t.json && !isFinite(r.x) ? String(r.x) : r.x), r.y != null && r.hasOwnProperty("y") && (e.y = t.json && !isFinite(r.y) ? String(r.y) : r.y), e;
    }, s.prototype.toJSON = function() {
      return this.constructor.toObject(this, D.util.toJSONOptions);
    }, s.getTypeUrl = function(r) {
      return r === void 0 && (r = "type.googleapis.com"), r + "/dot.PointDouble";
    }, s;
  }(), f;
})();
var hi = (() => {
  var f = import.meta.url;
  return async function(s = {}) {
    var r, t = s, e, n, o = new Promise((c, l) => {
      e = c, n = l;
    }), u = typeof window == "object", a = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var y = Object.assign({}, t), j = "./this.program", h = (c, l) => {
      throw l;
    }, v = "";
    function I(c) {
      return t.locateFile ? t.locateFile(c, v) : v + c;
    }
    var S, L;
    (u || a) && (a ? v = self.location.href : typeof document < "u" && document.currentScript && (v = document.currentScript.src), f && (v = f), v.startsWith("blob:") ? v = "" : v = v.slice(0, v.replace(/[?#].*/, "").lastIndexOf("/") + 1), a && (L = (c) => {
      var l = new XMLHttpRequest();
      return l.open("GET", c, !1), l.responseType = "arraybuffer", l.send(null), new Uint8Array(l.response);
    }), S = async (c) => {
      if (Tt(c))
        return new Promise((p, m) => {
          var b = new XMLHttpRequest();
          b.open("GET", c, !0), b.responseType = "arraybuffer", b.onload = () => {
            if (b.status == 200 || b.status == 0 && b.response) {
              p(b.response);
              return;
            }
            m(b.status);
          }, b.onerror = m, b.send(null);
        });
      var l = await fetch(c, { credentials: "same-origin" });
      if (l.ok)
        return l.arrayBuffer();
      throw new Error(l.status + " : " + l.url);
    }), t.print || console.log.bind(console);
    var P = t.printErr || console.error.bind(console);
    Object.assign(t, y), y = null, t.arguments && t.arguments, t.thisProgram && (j = t.thisProgram);
    var k = t.wasmBinary, F, B = !1, Te, Z, G, me, we, re, N, It, jt, St, Ct, Tt = (c) => c.startsWith("file://");
    function kt() {
      var c = F.buffer;
      t.HEAP8 = Z = new Int8Array(c), t.HEAP16 = me = new Int16Array(c), t.HEAPU8 = G = new Uint8Array(c), t.HEAPU16 = we = new Uint16Array(c), t.HEAP32 = re = new Int32Array(c), t.HEAPU32 = N = new Uint32Array(c), t.HEAPF32 = It = new Float32Array(c), t.HEAPF64 = Ct = new Float64Array(c), t.HEAP64 = jt = new BigInt64Array(c), t.HEAPU64 = St = new BigUint64Array(c);
    }
    function Ur() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          en(t.preRun.shift());
      At(Mt);
    }
    function Vr() {
      R.E();
    }
    function Gr() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Qr(t.postRun.shift());
      At(Et);
    }
    var ce = 0, Pe = null;
    function $r(c) {
      var l;
      ce++, (l = t.monitorRunDependencies) == null || l.call(t, ce);
    }
    function Br(c) {
      var p;
      if (ce--, (p = t.monitorRunDependencies) == null || p.call(t, ce), ce == 0 && Pe) {
        var l = Pe;
        Pe = null, l();
      }
    }
    function ke(c) {
      var p;
      (p = t.onAbort) == null || p.call(t, c), c = "Aborted(" + c + ")", P(c), B = !0, c += ". Build with -sASSERTIONS for more info.";
      var l = new WebAssembly.RuntimeError(c);
      throw n(l), l;
    }
    var qe;
    function Hr() {
      return t.locateFile ? I("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Yr(c) {
      if (c == qe && k)
        return new Uint8Array(k);
      if (L)
        return L(c);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Jr(c) {
      if (!k)
        try {
          var l = await S(c);
          return new Uint8Array(l);
        } catch {
        }
      return Yr(c);
    }
    async function Zr(c, l) {
      try {
        var p = await Jr(c), m = await WebAssembly.instantiate(p, l);
        return m;
      } catch (b) {
        P(`failed to asynchronously prepare wasm: ${b}`), ke(b);
      }
    }
    async function Kr(c, l, p) {
      if (!c && typeof WebAssembly.instantiateStreaming == "function" && !Tt(l))
        try {
          var m = fetch(l, { credentials: "same-origin" }), b = await WebAssembly.instantiateStreaming(m, p);
          return b;
        } catch (w) {
          P(`wasm streaming compile failed: ${w}`), P("falling back to ArrayBuffer instantiation");
        }
      return Zr(l, p);
    }
    function qr() {
      return { a: Do };
    }
    async function Xr() {
      function c(w, C) {
        return R = w.exports, R = A.instrumentWasmExports(R), F = R.D, kt(), R.J, Br(), R;
      }
      $r();
      function l(w) {
        return c(w.instance);
      }
      var p = qr();
      if (t.instantiateWasm)
        return new Promise((w, C) => {
          t.instantiateWasm(p, (O, T) => {
            c(O), w(O.exports);
          });
        });
      qe ?? (qe = Hr());
      try {
        var m = await Kr(k, qe, p), b = l(m);
        return b;
      } catch (w) {
        return n(w), Promise.reject(w);
      }
    }
    class Dt {
      constructor(l) {
        ze(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${l})`, this.status = l;
      }
    }
    var At = (c) => {
      for (; c.length > 0; )
        c.shift()(t);
    }, Et = [], Qr = (c) => Et.unshift(c), Mt = [], en = (c) => Mt.unshift(c), Lt = t.noExitRuntime || !0;
    class tn {
      constructor(l) {
        this.excPtr = l, this.ptr = l - 24;
      }
      set_type(l) {
        N[this.ptr + 4 >> 2] = l;
      }
      get_type() {
        return N[this.ptr + 4 >> 2];
      }
      set_destructor(l) {
        N[this.ptr + 8 >> 2] = l;
      }
      get_destructor() {
        return N[this.ptr + 8 >> 2];
      }
      set_caught(l) {
        l = l ? 1 : 0, Z[this.ptr + 12] = l;
      }
      get_caught() {
        return Z[this.ptr + 12] != 0;
      }
      set_rethrown(l) {
        l = l ? 1 : 0, Z[this.ptr + 13] = l;
      }
      get_rethrown() {
        return Z[this.ptr + 13] != 0;
      }
      init(l, p) {
        this.set_adjusted_ptr(0), this.set_type(l), this.set_destructor(p);
      }
      set_adjusted_ptr(l) {
        N[this.ptr + 16 >> 2] = l;
      }
      get_adjusted_ptr() {
        return N[this.ptr + 16 >> 2];
      }
    }
    var _t = 0, rn = (c, l, p) => {
      var m = new tn(c);
      throw m.init(l, p), _t = c, _t;
    }, nn = () => ke(""), De = (c) => {
      if (c === null)
        return "null";
      var l = typeof c;
      return l === "object" || l === "array" || l === "function" ? c.toString() : "" + c;
    }, on = () => {
      for (var c = new Array(256), l = 0; l < 256; ++l)
        c[l] = String.fromCharCode(l);
      Rt = c;
    }, Rt, z = (c) => {
      for (var l = "", p = c; G[p]; )
        l += Rt[G[p++]];
      return l;
    }, ge = {}, ue = {}, Ae = {}, ye, x = (c) => {
      throw new ye(c);
    }, Ft, Ee = (c) => {
      throw new Ft(c);
    }, he = (c, l, p) => {
      c.forEach((O) => Ae[O] = l);
      function m(O) {
        var T = p(O);
        T.length !== c.length && Ee("Mismatched type converter count");
        for (var _ = 0; _ < c.length; ++_)
          Y(c[_], T[_]);
      }
      var b = new Array(l.length), w = [], C = 0;
      l.forEach((O, T) => {
        ue.hasOwnProperty(O) ? b[T] = ue[O] : (w.push(O), ge.hasOwnProperty(O) || (ge[O] = []), ge[O].push(() => {
          b[T] = ue[O], ++C, C === w.length && m(b);
        }));
      }), w.length === 0 && m(b);
    };
    function an(c, l, p = {}) {
      var m = l.name;
      if (c || x(`type "${m}" must have a positive integer typeid pointer`), ue.hasOwnProperty(c)) {
        if (p.ignoreDuplicateRegistrations)
          return;
        x(`Cannot register type '${m}' twice`);
      }
      if (ue[c] = l, delete Ae[c], ge.hasOwnProperty(c)) {
        var b = ge[c];
        delete ge[c], b.forEach((w) => w());
      }
    }
    function Y(c, l, p = {}) {
      return an(c, l, p);
    }
    var xt = (c, l, p) => {
      switch (l) {
        case 1:
          return p ? (m) => Z[m] : (m) => G[m];
        case 2:
          return p ? (m) => me[m >> 1] : (m) => we[m >> 1];
        case 4:
          return p ? (m) => re[m >> 2] : (m) => N[m >> 2];
        case 8:
          return p ? (m) => jt[m >> 3] : (m) => St[m >> 3];
        default:
          throw new TypeError(`invalid integer width (${l}): ${c}`);
      }
    }, sn = (c, l, p, m, b) => {
      l = z(l);
      var w = l.indexOf("u") != -1;
      Y(c, { name: l, fromWireType: (C) => C, toWireType: function(C, O) {
        if (typeof O != "bigint" && typeof O != "number")
          throw new TypeError(`Cannot convert "${De(O)}" to ${this.name}`);
        return typeof O == "number" && (O = BigInt(O)), O;
      }, argPackAdvance: K, readValueFromPointer: xt(l, p, !w), destructorFunction: null });
    }, K = 8, ln = (c, l, p, m) => {
      l = z(l), Y(c, { name: l, fromWireType: function(b) {
        return !!b;
      }, toWireType: function(b, w) {
        return w ? p : m;
      }, argPackAdvance: K, readValueFromPointer: function(b) {
        return this.fromWireType(G[b]);
      }, destructorFunction: null });
    }, cn = (c) => ({ count: c.count, deleteScheduled: c.deleteScheduled, preservePointerOnDelete: c.preservePointerOnDelete, ptr: c.ptr, ptrType: c.ptrType, smartPtr: c.smartPtr, smartPtrType: c.smartPtrType }), Xe = (c) => {
      function l(p) {
        return p.$$.ptrType.registeredClass.name;
      }
      x(l(c) + " instance already deleted");
    }, Qe = !1, Nt = (c) => {
    }, un = (c) => {
      c.smartPtr ? c.smartPtrType.rawDestructor(c.smartPtr) : c.ptrType.registeredClass.rawDestructor(c.ptr);
    }, Wt = (c) => {
      c.count.value -= 1;
      var l = c.count.value === 0;
      l && un(c);
    }, zt = (c, l, p) => {
      if (l === p)
        return c;
      if (p.baseClass === void 0)
        return null;
      var m = zt(c, l, p.baseClass);
      return m === null ? null : p.downcast(m);
    }, Ut = {}, dn = {}, pn = (c, l) => {
      for (l === void 0 && x("ptr should not be undefined"); c.baseClass; )
        l = c.upcast(l), c = c.baseClass;
      return l;
    }, fn = (c, l) => (l = pn(c, l), dn[l]), Me = (c, l) => {
      (!l.ptrType || !l.ptr) && Ee("makeClassHandle requires ptr and ptrType");
      var p = !!l.smartPtrType, m = !!l.smartPtr;
      return p !== m && Ee("Both smartPtrType and smartPtr must be specified"), l.count = { value: 1 }, Ie(Object.create(c, { $$: { value: l, writable: !0 } }));
    };
    function mn(c) {
      var l = this.getPointee(c);
      if (!l)
        return this.destructor(c), null;
      var p = fn(this.registeredClass, l);
      if (p !== void 0) {
        if (p.$$.count.value === 0)
          return p.$$.ptr = l, p.$$.smartPtr = c, p.clone();
        var m = p.clone();
        return this.destructor(c), m;
      }
      function b() {
        return this.isSmartPointer ? Me(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: l, smartPtrType: this, smartPtr: c }) : Me(this.registeredClass.instancePrototype, { ptrType: this, ptr: c });
      }
      var w = this.registeredClass.getActualType(l), C = Ut[w];
      if (!C)
        return b.call(this);
      var O;
      this.isConst ? O = C.constPointerType : O = C.pointerType;
      var T = zt(l, this.registeredClass, O.registeredClass);
      return T === null ? b.call(this) : this.isSmartPointer ? Me(O.registeredClass.instancePrototype, { ptrType: O, ptr: T, smartPtrType: this, smartPtr: c }) : Me(O.registeredClass.instancePrototype, { ptrType: O, ptr: T });
    }
    var Ie = (c) => typeof FinalizationRegistry > "u" ? (Ie = (l) => l, c) : (Qe = new FinalizationRegistry((l) => {
      Wt(l.$$);
    }), Ie = (l) => {
      var p = l.$$, m = !!p.smartPtr;
      if (m) {
        var b = { $$: p };
        Qe.register(l, b, l);
      }
      return l;
    }, Nt = (l) => Qe.unregister(l), Ie(c)), gn = () => {
      Object.assign(Le.prototype, { isAliasOf(c) {
        if (!(this instanceof Le) || !(c instanceof Le))
          return !1;
        var l = this.$$.ptrType.registeredClass, p = this.$$.ptr;
        c.$$ = c.$$;
        for (var m = c.$$.ptrType.registeredClass, b = c.$$.ptr; l.baseClass; )
          p = l.upcast(p), l = l.baseClass;
        for (; m.baseClass; )
          b = m.upcast(b), m = m.baseClass;
        return l === m && p === b;
      }, clone() {
        if (this.$$.ptr || Xe(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var c = Ie(Object.create(Object.getPrototypeOf(this), { $$: { value: cn(this.$$) } }));
        return c.$$.count.value += 1, c.$$.deleteScheduled = !1, c;
      }, delete() {
        this.$$.ptr || Xe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), Nt(this), Wt(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Xe(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Le() {
    }
    var _e = (c, l) => Object.defineProperty(l, "name", { value: c }), yn = (c, l, p) => {
      if (c[l].overloadTable === void 0) {
        var m = c[l];
        c[l] = function(...b) {
          return c[l].overloadTable.hasOwnProperty(b.length) || x(`Function '${p}' called with an invalid number of arguments (${b.length}) - expects one of (${c[l].overloadTable})!`), c[l].overloadTable[b.length].apply(this, b);
        }, c[l].overloadTable = [], c[l].overloadTable[m.argCount] = m;
      }
    }, et = (c, l, p) => {
      t.hasOwnProperty(c) ? ((p === void 0 || t[c].overloadTable !== void 0 && t[c].overloadTable[p] !== void 0) && x(`Cannot register public name '${c}' twice`), yn(t, c, c), t[c].overloadTable.hasOwnProperty(p) && x(`Cannot register multiple overloads of a function with the same number of arguments (${p})!`), t[c].overloadTable[p] = l) : (t[c] = l, t[c].argCount = p);
    }, hn = 48, bn = 57, vn = (c) => {
      c = c.replace(/[^a-zA-Z0-9_]/g, "$");
      var l = c.charCodeAt(0);
      return l >= hn && l <= bn ? `_${c}` : c;
    };
    function On(c, l, p, m, b, w, C, O) {
      this.name = c, this.constructor = l, this.instancePrototype = p, this.rawDestructor = m, this.baseClass = b, this.getActualType = w, this.upcast = C, this.downcast = O, this.pureVirtualFunctions = [];
    }
    var Re = (c, l, p) => {
      for (; l !== p; )
        l.upcast || x(`Expected null or instance of ${p.name}, got an instance of ${l.name}`), c = l.upcast(c), l = l.baseClass;
      return c;
    };
    function wn(c, l) {
      if (l === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      l.$$ || x(`Cannot pass "${De(l)}" as a ${this.name}`), l.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var p = l.$$.ptrType.registeredClass, m = Re(l.$$.ptr, p, this.registeredClass);
      return m;
    }
    function Pn(c, l) {
      var p;
      if (l === null)
        return this.isReference && x(`null is not a valid ${this.name}`), this.isSmartPointer ? (p = this.rawConstructor(), c !== null && c.push(this.rawDestructor, p), p) : 0;
      (!l || !l.$$) && x(`Cannot pass "${De(l)}" as a ${this.name}`), l.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && l.$$.ptrType.isConst && x(`Cannot convert argument of type ${l.$$.smartPtrType ? l.$$.smartPtrType.name : l.$$.ptrType.name} to parameter type ${this.name}`);
      var m = l.$$.ptrType.registeredClass;
      if (p = Re(l.$$.ptr, m, this.registeredClass), this.isSmartPointer)
        switch (l.$$.smartPtr === void 0 && x("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            l.$$.smartPtrType === this ? p = l.$$.smartPtr : x(`Cannot convert argument of type ${l.$$.smartPtrType ? l.$$.smartPtrType.name : l.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            p = l.$$.smartPtr;
            break;
          case 2:
            if (l.$$.smartPtrType === this)
              p = l.$$.smartPtr;
            else {
              var b = l.clone();
              p = this.rawShare(p, J.toHandle(() => b.delete())), c !== null && c.push(this.rawDestructor, p);
            }
            break;
          default:
            x("Unsupporting sharing policy");
        }
      return p;
    }
    function In(c, l) {
      if (l === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      l.$$ || x(`Cannot pass "${De(l)}" as a ${this.name}`), l.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), l.$$.ptrType.isConst && x(`Cannot convert argument of type ${l.$$.ptrType.name} to parameter type ${this.name}`);
      var p = l.$$.ptrType.registeredClass, m = Re(l.$$.ptr, p, this.registeredClass);
      return m;
    }
    function Fe(c) {
      return this.fromWireType(N[c >> 2]);
    }
    var jn = () => {
      Object.assign(xe.prototype, { getPointee(c) {
        return this.rawGetPointee && (c = this.rawGetPointee(c)), c;
      }, destructor(c) {
        var l;
        (l = this.rawDestructor) == null || l.call(this, c);
      }, argPackAdvance: K, readValueFromPointer: Fe, fromWireType: mn });
    };
    function xe(c, l, p, m, b, w, C, O, T, _, M) {
      this.name = c, this.registeredClass = l, this.isReference = p, this.isConst = m, this.isSmartPointer = b, this.pointeeType = w, this.sharingPolicy = C, this.rawGetPointee = O, this.rawConstructor = T, this.rawShare = _, this.rawDestructor = M, !b && l.baseClass === void 0 ? m ? (this.toWireType = wn, this.destructorFunction = null) : (this.toWireType = In, this.destructorFunction = null) : this.toWireType = Pn;
    }
    var Vt = (c, l, p) => {
      t.hasOwnProperty(c) || Ee("Replacing nonexistent public symbol"), t[c].overloadTable !== void 0 && p !== void 0 ? t[c].overloadTable[p] = l : (t[c] = l, t[c].argCount = p);
    }, Sn = (c, l, p) => {
      c = c.replace(/p/g, "i");
      var m = t["dynCall_" + c];
      return m(l, ...p);
    }, Cn = (c, l, p = []) => {
      var m = Sn(c, l, p);
      return m;
    }, Tn = (c, l) => (...p) => Cn(c, l, p), ne = (c, l) => {
      c = z(c);
      function p() {
        return Tn(c, l);
      }
      var m = p();
      return typeof m != "function" && x(`unknown function pointer with signature ${c}: ${l}`), m;
    }, kn = (c, l) => {
      var p = _e(l, function(m) {
        this.name = l, this.message = m;
        var b = new Error(m).stack;
        b !== void 0 && (this.stack = this.toString() + `
` + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return p.prototype = Object.create(c.prototype), p.prototype.constructor = p, p.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, p;
    }, Gt, $t = (c) => {
      var l = Ao(c), p = z(l);
      return te(l), p;
    }, je = (c, l) => {
      var p = [], m = {};
      function b(w) {
        if (!m[w] && !ue[w]) {
          if (Ae[w]) {
            Ae[w].forEach(b);
            return;
          }
          p.push(w), m[w] = !0;
        }
      }
      throw l.forEach(b), new Gt(`${c}: ` + p.map($t).join([", "]));
    }, Dn = (c, l, p, m, b, w, C, O, T, _, M, W, U) => {
      M = z(M), w = ne(b, w), O && (O = ne(C, O)), _ && (_ = ne(T, _)), U = ne(W, U);
      var q = vn(M);
      et(q, function() {
        je(`Cannot construct ${M} due to unbound types`, [m]);
      }), he([c, l, p], m ? [m] : [], (X) => {
        var rr;
        X = X[0];
        var ie, H;
        m ? (ie = X.registeredClass, H = ie.instancePrototype) : H = Le.prototype;
        var Q = _e(M, function(...lt) {
          if (Object.getPrototypeOf(this) !== ae)
            throw new ye("Use 'new' to construct " + M);
          if (V.constructor_body === void 0)
            throw new ye(M + " has no accessible constructor");
          var nr = V.constructor_body[lt.length];
          if (nr === void 0)
            throw new ye(`Tried to invoke ctor of ${M} with invalid number of parameters (${lt.length}) - expected (${Object.keys(V.constructor_body).toString()}) parameters instead!`);
          return nr.apply(this, lt);
        }), ae = Object.create(H, { constructor: { value: Q } });
        Q.prototype = ae;
        var V = new On(M, Q, ae, U, ie, w, O, _);
        V.baseClass && ((rr = V.baseClass).__derivedClasses ?? (rr.__derivedClasses = []), V.baseClass.__derivedClasses.push(V));
        var se = new xe(M, V, !0, !1, !1), We = new xe(M + "*", V, !1, !1, !1), tr = new xe(M + " const*", V, !1, !0, !1);
        return Ut[c] = { pointerType: We, constPointerType: tr }, Vt(q, Q), [se, We, tr];
      });
    }, Bt = (c, l) => {
      for (var p = [], m = 0; m < c; m++)
        p.push(N[l + m * 4 >> 2]);
      return p;
    }, tt = (c) => {
      for (; c.length; ) {
        var l = c.pop(), p = c.pop();
        p(l);
      }
    };
    function An(c) {
      for (var l = 1; l < c.length; ++l)
        if (c[l] !== null && c[l].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Ne = (c) => {
      try {
        return c();
      } catch (l) {
        ke(l);
      }
    }, Ht = (c) => {
      if (c instanceof Dt || c == "unwind")
        return Te;
      h(1, c);
    }, Yt = 0, Jt = () => Lt || Yt > 0, Zt = (c) => {
      var l;
      Te = c, Jt() || ((l = t.onExit) == null || l.call(t, c), B = !0), h(c, new Dt(c));
    }, En = (c, l) => {
      Te = c, Zt(c);
    }, Mn = En, Ln = () => {
      if (!Jt())
        try {
          Mn(Te);
        } catch (c) {
          Ht(c);
        }
    }, Kt = (c) => {
      if (!B)
        try {
          c(), Ln();
        } catch (l) {
          Ht(l);
        }
    }, A = { instrumentWasmImports(c) {
      var l = /^(__asyncjs__.*)$/;
      for (let [p, m] of Object.entries(c))
        typeof m == "function" && (m.isAsync || l.test(p));
    }, instrumentWasmExports(c) {
      var l = {};
      for (let [p, m] of Object.entries(c))
        typeof m == "function" ? l[p] = (...b) => {
          A.exportCallStack.push(p);
          try {
            return m(...b);
          } finally {
            B || (A.exportCallStack.pop(), A.maybeStopUnwind());
          }
        } : l[p] = m;
      return l;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(c) {
      var l = A.callStackNameToId[c];
      return l === void 0 && (l = A.callStackId++, A.callStackNameToId[c] = l, A.callStackIdToName[l] = c), l;
    }, maybeStopUnwind() {
      A.currData && A.state === A.State.Unwinding && A.exportCallStack.length === 0 && (A.state = A.State.Normal, Ne(Lo), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((c, l) => {
        A.asyncPromiseHandlers = { resolve: c, reject: l };
      });
    }, allocateData() {
      var c = at(12 + A.StackSize);
      return A.setDataHeader(c, c + 12, A.StackSize), A.setDataRewindFunc(c), c;
    }, setDataHeader(c, l, p) {
      N[c >> 2] = l, N[c + 4 >> 2] = l + p;
    }, setDataRewindFunc(c) {
      var l = A.exportCallStack[0], p = A.getCallStackId(l);
      re[c + 8 >> 2] = p;
    }, getDataRewindFuncName(c) {
      var l = re[c + 8 >> 2], p = A.callStackIdToName[l];
      return p;
    }, getDataRewindFunc(c) {
      var l = R[c];
      return l;
    }, doRewind(c) {
      var l = A.getDataRewindFuncName(c), p = A.getDataRewindFunc(l);
      return p();
    }, handleSleep(c) {
      if (!B) {
        if (A.state === A.State.Normal) {
          var l = !1, p = !1;
          c((m = 0) => {
            if (!B && (A.handleSleepReturnValue = m, l = !0, !!p)) {
              A.state = A.State.Rewinding, Ne(() => _o(A.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var b, w = !1;
              try {
                b = A.doRewind(A.currData);
              } catch (T) {
                b = T, w = !0;
              }
              var C = !1;
              if (!A.currData) {
                var O = A.asyncPromiseHandlers;
                O && (A.asyncPromiseHandlers = null, (w ? O.reject : O.resolve)(b), C = !0);
              }
              if (w && !C)
                throw b;
            }
          }), p = !0, l || (A.state = A.State.Unwinding, A.currData = A.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Ne(() => Mo(A.currData)));
        } else A.state === A.State.Rewinding ? (A.state = A.State.Normal, Ne(Ro), te(A.currData), A.currData = null, A.sleepCallbacks.forEach(Kt)) : ke(`invalid state: ${A.state}`);
        return A.handleSleepReturnValue;
      }
    }, handleAsync(c) {
      return A.handleSleep((l) => {
        c().then(l);
      });
    } };
    function qt(c, l, p, m, b, w) {
      var C = l.length;
      C < 2 && x("argTypes array size mismatch! Must at least get return value and 'this' types!"), l[1];
      var O = An(l), T = l[0].name !== "void", _ = C - 2, M = new Array(_), W = [], U = [], q = function(...X) {
        U.length = 0;
        var ie;
        W.length = 1, W[0] = b;
        for (var H = 0; H < _; ++H)
          M[H] = l[H + 2].toWireType(U, X[H]), W.push(M[H]);
        var Q = m(...W);
        function ae(V) {
          if (O)
            tt(U);
          else
            for (var se = 2; se < l.length; se++) {
              var We = se === 1 ? ie : M[se - 2];
              l[se].destructorFunction !== null && l[se].destructorFunction(We);
            }
          if (T)
            return l[0].fromWireType(V);
        }
        return A.currData ? A.whenDone().then(ae) : ae(Q);
      };
      return _e(c, q);
    }
    var _n = (c, l, p, m, b, w) => {
      var C = Bt(l, p);
      b = ne(m, b), he([], [c], (O) => {
        O = O[0];
        var T = `constructor ${O.name}`;
        if (O.registeredClass.constructor_body === void 0 && (O.registeredClass.constructor_body = []), O.registeredClass.constructor_body[l - 1] !== void 0)
          throw new ye(`Cannot register multiple constructors with identical number of parameters (${l - 1}) for class '${O.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return O.registeredClass.constructor_body[l - 1] = () => {
          je(`Cannot construct ${O.name} due to unbound types`, C);
        }, he([], C, (_) => (_.splice(1, 0, null), O.registeredClass.constructor_body[l - 1] = qt(T, _, null, b, w), [])), [];
      });
    }, Xt = (c, l, p) => (c instanceof Object || x(`${p} with invalid "this": ${c}`), c instanceof l.registeredClass.constructor || x(`${p} incompatible with "this" of type ${c.constructor.name}`), c.$$.ptr || x(`cannot call emscripten binding method ${p} on deleted object`), Re(c.$$.ptr, c.$$.ptrType.registeredClass, l.registeredClass)), Rn = (c, l, p, m, b, w, C, O, T, _) => {
      l = z(l), b = ne(m, b), he([], [c], (M) => {
        M = M[0];
        var W = `${M.name}.${l}`, U = { get() {
          je(`Cannot access ${W} due to unbound types`, [p, C]);
        }, enumerable: !0, configurable: !0 };
        return T ? U.set = () => je(`Cannot access ${W} due to unbound types`, [p, C]) : U.set = (q) => x(W + " is a read-only property"), Object.defineProperty(M.registeredClass.instancePrototype, l, U), he([], T ? [p, C] : [p], (q) => {
          var X = q[0], ie = { get() {
            var Q = Xt(this, M, W + " getter");
            return X.fromWireType(b(w, Q));
          }, enumerable: !0 };
          if (T) {
            T = ne(O, T);
            var H = q[1];
            ie.set = function(Q) {
              var ae = Xt(this, M, W + " setter"), V = [];
              T(_, ae, H.toWireType(V, Q)), tt(V);
            };
          }
          return Object.defineProperty(M.registeredClass.instancePrototype, l, ie), [];
        }), [];
      });
    }, rt = [], oe = [], nt = (c) => {
      c > 9 && --oe[c + 1] === 0 && (oe[c] = void 0, rt.push(c));
    }, Fn = () => oe.length / 2 - 5 - rt.length, xn = () => {
      oe.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = Fn;
    }, J = { toValue: (c) => (c || x("Cannot use deleted val. handle = " + c), oe[c]), toHandle: (c) => {
      switch (c) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const l = rt.pop() || oe.length;
          return oe[l] = c, oe[l + 1] = 1, l;
        }
      }
    } }, Nn = { name: "emscripten::val", fromWireType: (c) => {
      var l = J.toValue(c);
      return nt(c), l;
    }, toWireType: (c, l) => J.toHandle(l), argPackAdvance: K, readValueFromPointer: Fe, destructorFunction: null }, Wn = (c) => Y(c, Nn), zn = (c, l, p) => {
      switch (l) {
        case 1:
          return p ? function(m) {
            return this.fromWireType(Z[m]);
          } : function(m) {
            return this.fromWireType(G[m]);
          };
        case 2:
          return p ? function(m) {
            return this.fromWireType(me[m >> 1]);
          } : function(m) {
            return this.fromWireType(we[m >> 1]);
          };
        case 4:
          return p ? function(m) {
            return this.fromWireType(re[m >> 2]);
          } : function(m) {
            return this.fromWireType(N[m >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${l}): ${c}`);
      }
    }, Un = (c, l, p, m) => {
      l = z(l);
      function b() {
      }
      b.values = {}, Y(c, { name: l, constructor: b, fromWireType: function(w) {
        return this.constructor.values[w];
      }, toWireType: (w, C) => C.value, argPackAdvance: K, readValueFromPointer: zn(l, p, m), destructorFunction: null }), et(l, b);
    }, ot = (c, l) => {
      var p = ue[c];
      return p === void 0 && x(`${l} has unknown type ${$t(c)}`), p;
    }, Vn = (c, l, p) => {
      var m = ot(c, "enum");
      l = z(l);
      var b = m.constructor, w = Object.create(m.constructor.prototype, { value: { value: p }, constructor: { value: _e(`${m.name}_${l}`, function() {
      }) } });
      b.values[p] = w, b[l] = w;
    }, Gn = (c, l) => {
      switch (l) {
        case 4:
          return function(p) {
            return this.fromWireType(It[p >> 2]);
          };
        case 8:
          return function(p) {
            return this.fromWireType(Ct[p >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${l}): ${c}`);
      }
    }, $n = (c, l, p) => {
      l = z(l), Y(c, { name: l, fromWireType: (m) => m, toWireType: (m, b) => b, argPackAdvance: K, readValueFromPointer: Gn(l, p), destructorFunction: null });
    }, Bn = (c) => {
      c = c.trim();
      const l = c.indexOf("(");
      return l === -1 ? c : c.slice(0, l);
    }, Hn = (c, l, p, m, b, w, C, O) => {
      var T = Bt(l, p);
      c = z(c), c = Bn(c), b = ne(m, b), et(c, function() {
        je(`Cannot call ${c} due to unbound types`, T);
      }, l - 1), he([], T, (_) => {
        var M = [_[0], null].concat(_.slice(1));
        return Vt(c, qt(c, M, null, b, w), l - 1), [];
      });
    }, Yn = (c, l, p, m, b) => {
      l = z(l);
      var w = (M) => M;
      if (m === 0) {
        var C = 32 - 8 * p;
        w = (M) => M << C >>> C;
      }
      var O = l.includes("unsigned"), T = (M, W) => {
      }, _;
      O ? _ = function(M, W) {
        return T(W, this.name), W >>> 0;
      } : _ = function(M, W) {
        return T(W, this.name), W;
      }, Y(c, { name: l, fromWireType: w, toWireType: _, argPackAdvance: K, readValueFromPointer: xt(l, p, m !== 0), destructorFunction: null });
    }, Jn = (c, l, p) => {
      var m = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], b = m[l];
      function w(C) {
        var O = N[C >> 2], T = N[C + 4 >> 2];
        return new b(Z.buffer, T, O);
      }
      p = z(p), Y(c, { name: p, fromWireType: w, argPackAdvance: K, readValueFromPointer: w }, { ignoreDuplicateRegistrations: !0 });
    }, Zn = (c, l, p, m) => {
      if (!(m > 0)) return 0;
      for (var b = p, w = p + m - 1, C = 0; C < c.length; ++C) {
        var O = c.charCodeAt(C);
        if (O >= 55296 && O <= 57343) {
          var T = c.charCodeAt(++C);
          O = 65536 + ((O & 1023) << 10) | T & 1023;
        }
        if (O <= 127) {
          if (p >= w) break;
          l[p++] = O;
        } else if (O <= 2047) {
          if (p + 1 >= w) break;
          l[p++] = 192 | O >> 6, l[p++] = 128 | O & 63;
        } else if (O <= 65535) {
          if (p + 2 >= w) break;
          l[p++] = 224 | O >> 12, l[p++] = 128 | O >> 6 & 63, l[p++] = 128 | O & 63;
        } else {
          if (p + 3 >= w) break;
          l[p++] = 240 | O >> 18, l[p++] = 128 | O >> 12 & 63, l[p++] = 128 | O >> 6 & 63, l[p++] = 128 | O & 63;
        }
      }
      return l[p] = 0, p - b;
    }, Kn = (c, l, p) => Zn(c, G, l, p), qn = (c) => {
      for (var l = 0, p = 0; p < c.length; ++p) {
        var m = c.charCodeAt(p);
        m <= 127 ? l++ : m <= 2047 ? l += 2 : m >= 55296 && m <= 57343 ? (l += 4, ++p) : l += 3;
      }
      return l;
    }, Qt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Xn = (c, l = 0, p = NaN) => {
      for (var m = l + p, b = l; c[b] && !(b >= m); ) ++b;
      if (b - l > 16 && c.buffer && Qt)
        return Qt.decode(c.subarray(l, b));
      for (var w = ""; l < b; ) {
        var C = c[l++];
        if (!(C & 128)) {
          w += String.fromCharCode(C);
          continue;
        }
        var O = c[l++] & 63;
        if ((C & 224) == 192) {
          w += String.fromCharCode((C & 31) << 6 | O);
          continue;
        }
        var T = c[l++] & 63;
        if ((C & 240) == 224 ? C = (C & 15) << 12 | O << 6 | T : C = (C & 7) << 18 | O << 12 | T << 6 | c[l++] & 63, C < 65536)
          w += String.fromCharCode(C);
        else {
          var _ = C - 65536;
          w += String.fromCharCode(55296 | _ >> 10, 56320 | _ & 1023);
        }
      }
      return w;
    }, Qn = (c, l) => c ? Xn(G, c, l) : "", eo = (c, l) => {
      l = z(l), Y(c, { name: l, fromWireType(p) {
        for (var m = N[p >> 2], b = p + 4, w, C, O = b, C = 0; C <= m; ++C) {
          var T = b + C;
          if (C == m || G[T] == 0) {
            var _ = T - O, M = Qn(O, _);
            w === void 0 ? w = M : (w += "\0", w += M), O = T + 1;
          }
        }
        return te(p), w;
      }, toWireType(p, m) {
        m instanceof ArrayBuffer && (m = new Uint8Array(m));
        var b, w = typeof m == "string";
        w || m instanceof Uint8Array || m instanceof Uint8ClampedArray || m instanceof Int8Array || x("Cannot pass non-string to std::string"), w ? b = qn(m) : b = m.length;
        var C = at(4 + b + 1), O = C + 4;
        if (N[C >> 2] = b, w)
          Kn(m, O, b + 1);
        else if (w)
          for (var T = 0; T < b; ++T) {
            var _ = m.charCodeAt(T);
            _ > 255 && (te(C), x("String has UTF-16 code units that do not fit in 8 bits")), G[O + T] = _;
          }
        else
          for (var T = 0; T < b; ++T)
            G[O + T] = m[T];
        return p !== null && p.push(te, C), C;
      }, argPackAdvance: K, readValueFromPointer: Fe, destructorFunction(p) {
        te(p);
      } });
    }, er = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, to = (c, l) => {
      for (var p = c, m = p >> 1, b = m + l / 2; !(m >= b) && we[m]; ) ++m;
      if (p = m << 1, p - c > 32 && er) return er.decode(G.subarray(c, p));
      for (var w = "", C = 0; !(C >= l / 2); ++C) {
        var O = me[c + C * 2 >> 1];
        if (O == 0) break;
        w += String.fromCharCode(O);
      }
      return w;
    }, ro = (c, l, p) => {
      if (p ?? (p = 2147483647), p < 2) return 0;
      p -= 2;
      for (var m = l, b = p < c.length * 2 ? p / 2 : c.length, w = 0; w < b; ++w) {
        var C = c.charCodeAt(w);
        me[l >> 1] = C, l += 2;
      }
      return me[l >> 1] = 0, l - m;
    }, no = (c) => c.length * 2, oo = (c, l) => {
      for (var p = 0, m = ""; !(p >= l / 4); ) {
        var b = re[c + p * 4 >> 2];
        if (b == 0) break;
        if (++p, b >= 65536) {
          var w = b - 65536;
          m += String.fromCharCode(55296 | w >> 10, 56320 | w & 1023);
        } else
          m += String.fromCharCode(b);
      }
      return m;
    }, io = (c, l, p) => {
      if (p ?? (p = 2147483647), p < 4) return 0;
      for (var m = l, b = m + p - 4, w = 0; w < c.length; ++w) {
        var C = c.charCodeAt(w);
        if (C >= 55296 && C <= 57343) {
          var O = c.charCodeAt(++w);
          C = 65536 + ((C & 1023) << 10) | O & 1023;
        }
        if (re[l >> 2] = C, l += 4, l + 4 > b) break;
      }
      return re[l >> 2] = 0, l - m;
    }, ao = (c) => {
      for (var l = 0, p = 0; p < c.length; ++p) {
        var m = c.charCodeAt(p);
        m >= 55296 && m <= 57343 && ++p, l += 4;
      }
      return l;
    }, so = (c, l, p) => {
      p = z(p);
      var m, b, w, C;
      l === 2 ? (m = to, b = ro, C = no, w = (O) => we[O >> 1]) : l === 4 && (m = oo, b = io, C = ao, w = (O) => N[O >> 2]), Y(c, { name: p, fromWireType: (O) => {
        for (var T = N[O >> 2], _, M = O + 4, W = 0; W <= T; ++W) {
          var U = O + 4 + W * l;
          if (W == T || w(U) == 0) {
            var q = U - M, X = m(M, q);
            _ === void 0 ? _ = X : (_ += "\0", _ += X), M = U + l;
          }
        }
        return te(O), _;
      }, toWireType: (O, T) => {
        typeof T != "string" && x(`Cannot pass non-string to C++ string type ${p}`);
        var _ = C(T), M = at(4 + _ + l);
        return N[M >> 2] = _ / l, b(T, M + 4, _ + l), O !== null && O.push(te, M), M;
      }, argPackAdvance: K, readValueFromPointer: Fe, destructorFunction(O) {
        te(O);
      } });
    }, lo = (c, l) => {
      l = z(l), Y(c, { isVoid: !0, name: l, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (p, m) => {
      } });
    }, co = () => {
      Lt = !1, Yt = 0;
    }, uo = (c, l, p) => {
      var m = [], b = c.toWireType(m, p);
      return m.length && (N[l >> 2] = J.toHandle(m)), b;
    }, po = (c, l, p) => (c = J.toValue(c), l = ot(l, "emval::as"), uo(l, p, c)), fo = (c, l) => (c = J.toValue(c), l = J.toValue(l), J.toHandle(c[l])), mo = {}, go = (c) => {
      var l = mo[c];
      return l === void 0 ? z(c) : l;
    }, yo = (c) => J.toHandle(go(c)), ho = (c) => {
      var l = J.toValue(c);
      tt(l), nt(c);
    }, bo = (c, l) => {
      c = ot(c, "_emval_take_value");
      var p = c.readValueFromPointer(l);
      return J.toHandle(p);
    }, Se = {}, vo = () => performance.now(), Oo = (c, l) => {
      if (Se[c] && (clearTimeout(Se[c].id), delete Se[c]), !l) return 0;
      var p = setTimeout(() => {
        delete Se[c], Kt(() => Eo(c, vo()));
      }, l);
      return Se[c] = { id: p, timeout_ms: l }, 0;
    }, wo = () => 2147483648, Po = (c, l) => Math.ceil(c / l) * l, Io = (c) => {
      var l = F.buffer, p = (c - l.byteLength + 65535) / 65536 | 0;
      try {
        return F.grow(p), kt(), 1;
      } catch {
      }
    }, jo = (c) => {
      var l = G.length;
      c >>>= 0;
      var p = wo();
      if (c > p)
        return !1;
      for (var m = 1; m <= 4; m *= 2) {
        var b = l * (1 + 0.2 / m);
        b = Math.min(b, c + 100663296);
        var w = Math.min(p, Po(Math.max(c, b), 65536)), C = Io(w);
        if (C)
          return !0;
      }
      return !1;
    }, it = {}, So = () => j || "./this.program", Ce = () => {
      if (!Ce.strings) {
        var c = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", l = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: c, _: So() };
        for (var p in it)
          it[p] === void 0 ? delete l[p] : l[p] = it[p];
        var m = [];
        for (var p in l)
          m.push(`${p}=${l[p]}`);
        Ce.strings = m;
      }
      return Ce.strings;
    }, Co = (c, l) => {
      for (var p = 0; p < c.length; ++p)
        Z[l++] = c.charCodeAt(p);
      Z[l] = 0;
    }, To = (c, l) => {
      var p = 0;
      return Ce().forEach((m, b) => {
        var w = l + p;
        N[c + b * 4 >> 2] = w, Co(m, w), p += m.length + 1;
      }), 0;
    }, ko = (c, l) => {
      var p = Ce();
      N[c >> 2] = p.length;
      var m = 0;
      return p.forEach((b) => m += b.length + 1), N[l >> 2] = m, 0;
    };
    on(), ye = t.BindingError = class extends Error {
      constructor(l) {
        super(l), this.name = "BindingError";
      }
    }, Ft = t.InternalError = class extends Error {
      constructor(l) {
        super(l), this.name = "InternalError";
      }
    }, gn(), jn(), Gt = t.UnboundTypeError = kn(Error, "UnboundTypeError"), xn();
    var Do = { g: rn, u: nn, n: sn, y: ln, f: Dn, d: _n, a: Rn, w: Wn, l: Un, h: Vn, m: $n, b: Hn, e: Yn, c: Jn, x: eo, i: so, z: lo, q: co, j: po, A: nt, k: fo, o: yo, C: ho, B: bo, r: Oo, v: jo, s: To, t: ko, p: Zt }, R = await Xr();
    R.E;
    var Ao = R.F, at = t._malloc = R.G, te = t._free = R.H, Eo = R.I;
    t.dynCall_v = R.K, t.dynCall_ii = R.L, t.dynCall_vi = R.M, t.dynCall_i = R.N, t.dynCall_iii = R.O, t.dynCall_viii = R.P, t.dynCall_fii = R.Q, t.dynCall_viif = R.R, t.dynCall_viiii = R.S, t.dynCall_viiiiii = R.T, t.dynCall_iiiiii = R.U, t.dynCall_viiiii = R.V, t.dynCall_iiiiiii = R.W, t.dynCall_iiiiiiii = R.X, t.dynCall_viiiiiii = R.Y, t.dynCall_viiiiiiiiidi = R.Z, t.dynCall_viiiiiiiidi = R._, t.dynCall_viiiiiiiiii = R.$, t.dynCall_viiiiiiiii = R.aa, t.dynCall_viiiiiiii = R.ba, t.dynCall_iiiii = R.ca, t.dynCall_iiii = R.da;
    var Mo = R.ea, Lo = R.fa, _o = R.ga, Ro = R.ha;
    function st() {
      if (ce > 0) {
        Pe = st;
        return;
      }
      if (Ur(), ce > 0) {
        Pe = st;
        return;
      }
      function c() {
        var l;
        t.calledRun = !0, !B && (Vr(), e(t), (l = t.onRuntimeInitialized) == null || l.call(t), Gr());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), c();
      }, 1)) : c();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return st(), r = o, r;
  };
})();
let bi = class extends ei {
  getSamWasmFilePath(s, r) {
    return `${s}/document/wasm/${r}`;
  }
  fetchSamModule(s) {
    return hi(s);
  }
  parseRawData(s) {
    const { brightness: r, hotspots: t, sharpness: e } = s.params, n = {
      confidence: s.confidence / $e,
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
      brightness: r / $e,
      hotspots: t / $e,
      sharpness: e / $e
    };
    return {
      ...n,
      smallestEdge: ti(n)
    };
  }
  async detect(s, r) {
    if (!this.samWasmModule)
      throw new $("SAM WASM module is not initialized");
    const t = this.convertToSamColorImage(s, r), e = this.samWasmModule.detectDocumentWithImageParameters(
      r.width,
      r.height,
      t.bgr0ImagePointer,
      0,
      // paramWidth should be 0 (default value)
      0,
      // paramHeight should be 0 (default value)
      0
      // documentDetectionOptions - speed option - set as "standard full method"
    );
    return t.free(), this.parseRawData(e);
  }
  async getOptimalRegionForCompressionDetection(s, r, t) {
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(
      s,
      r,
      t
    );
  }
};
class vi extends bi {
}
Pt(vi);
