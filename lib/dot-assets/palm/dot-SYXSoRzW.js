var Eo = Object.defineProperty;
var tr = (f) => {
  throw TypeError(f);
};
var Mo = (f, s, r) => s in f ? Eo(f, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : f[s] = r;
var Ne = (f, s, r) => Mo(f, typeof s != "symbol" ? s + "" : s, r), rr = (f, s, r) => s.has(f) || tr("Cannot " + r);
var X = (f, s, r) => (rr(f, s, "read from private field"), r ? r.call(f) : s.get(f)), We = (f, s, r) => s.has(f) ? tr("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(f) : s.set(f, r), ze = (f, s, r, t) => (rr(f, s, "write to private field"), t ? t.call(f, r) : s.set(f, r), r);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Mr = Symbol("Comlink.proxy"), Lo = Symbol("Comlink.endpoint"), Ro = Symbol("Comlink.releaseProxy"), $e = Symbol("Comlink.finalizer"), Be = Symbol("Comlink.thrown"), Lr = (f) => typeof f == "object" && f !== null || typeof f == "function", _o = {
  canHandle: (f) => Lr(f) && f[Mr],
  serialize(f) {
    const { port1: s, port2: r } = new MessageChannel();
    return vt(f, s), [r, [r]];
  },
  deserialize(f) {
    return f.start(), Wo(f);
  }
}, Fo = {
  canHandle: (f) => Lr(f) && Be in f,
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
  ["proxy", _o],
  ["throw", Fo]
]);
function xo(f, s) {
  for (const r of f)
    if (s === r || r === "*" || r instanceof RegExp && r.test(s))
      return !0;
  return !1;
}
function vt(f, s = globalThis, r = ["*"]) {
  s.addEventListener("message", function t(e) {
    if (!e || !e.data)
      return;
    if (!xo(r, e.origin)) {
      console.warn(`Invalid origin '${e.origin}' for comlink proxy`);
      return;
    }
    const { id: n, type: o, path: u } = Object.assign({ path: [] }, e.data), a = (e.data.argumentList || []).map(de);
    let h;
    try {
      const S = u.slice(0, -1).reduce((w, I) => w[I], f), y = u.reduce((w, I) => w[I], f);
      switch (o) {
        case "GET":
          h = y;
          break;
        case "SET":
          S[u.slice(-1)[0]] = de(e.data.value), h = !0;
          break;
        case "APPLY":
          h = y.apply(S, a);
          break;
        case "CONSTRUCT":
          {
            const w = new y(...a);
            h = $o(w);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: w, port2: I } = new MessageChannel();
            vt(f, I), h = Go(w, [w]);
          }
          break;
        case "RELEASE":
          h = void 0;
          break;
        default:
          return;
      }
    } catch (S) {
      h = { value: S, [Be]: 0 };
    }
    Promise.resolve(h).catch((S) => ({ value: S, [Be]: 0 })).then((S) => {
      const [y, w] = Je(S);
      s.postMessage(Object.assign(Object.assign({}, y), { id: n }), w), o === "RELEASE" && (s.removeEventListener("message", t), _r(s), $e in f && typeof f[$e] == "function" && f[$e]());
    }).catch((S) => {
      const [y, w] = Je({
        value: new TypeError("Unserializable return value"),
        [Be]: 0
      });
      s.postMessage(Object.assign(Object.assign({}, y), { id: n }), w);
    });
  }), s.start && s.start();
}
function No(f) {
  return f.constructor.name === "MessagePort";
}
function _r(f) {
  No(f) && f.close();
}
function Wo(f, s) {
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
  }), bt(f, r, [], s);
}
function Ve(f) {
  if (f)
    throw new Error("Proxy has been released and is not useable");
}
function Fr(f) {
  return ve(f, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    _r(f);
  });
}
const He = /* @__PURE__ */ new WeakMap(), Ye = "FinalizationRegistry" in globalThis && new FinalizationRegistry((f) => {
  const s = (He.get(f) || 0) - 1;
  He.set(f, s), s === 0 && Fr(f);
});
function zo(f, s) {
  const r = (He.get(s) || 0) + 1;
  He.set(s, r), Ye && Ye.register(f, s, f);
}
function Vo(f) {
  Ye && Ye.unregister(f);
}
function bt(f, s, r = [], t = function() {
}) {
  let e = !1;
  const n = new Proxy(t, {
    get(o, u) {
      if (Ve(e), u === Ro)
        return () => {
          Vo(n), Fr(f), s.clear(), e = !0;
        };
      if (u === "then") {
        if (r.length === 0)
          return { then: () => n };
        const a = ve(f, s, {
          type: "GET",
          path: r.map((h) => h.toString())
        }).then(de);
        return a.then.bind(a);
      }
      return bt(f, s, [...r, u]);
    },
    set(o, u, a) {
      Ve(e);
      const [h, S] = Je(a);
      return ve(f, s, {
        type: "SET",
        path: [...r, u].map((y) => y.toString()),
        value: h
      }, S).then(de);
    },
    apply(o, u, a) {
      Ve(e);
      const h = r[r.length - 1];
      if (h === Lo)
        return ve(f, s, {
          type: "ENDPOINT"
        }).then(de);
      if (h === "bind")
        return bt(f, s, r.slice(0, -1));
      const [S, y] = nr(a);
      return ve(f, s, {
        type: "APPLY",
        path: r.map((w) => w.toString()),
        argumentList: S
      }, y).then(de);
    },
    construct(o, u) {
      Ve(e);
      const [a, h] = nr(u);
      return ve(f, s, {
        type: "CONSTRUCT",
        path: r.map((S) => S.toString()),
        argumentList: a
      }, h).then(de);
    }
  });
  return zo(n, f), n;
}
function Uo(f) {
  return Array.prototype.concat.apply([], f);
}
function nr(f) {
  const s = f.map(Je);
  return [s.map((r) => r[0]), Uo(s.map((r) => r[1]))];
}
const xr = /* @__PURE__ */ new WeakMap();
function Go(f, s) {
  return xr.set(f, s), f;
}
function $o(f) {
  return Object.assign(f, { [Mr]: !0 });
}
function Je(f) {
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
    xr.get(f) || []
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
    const n = Bo();
    s.set(n, e), f.start && f.start(), f.postMessage(Object.assign({ id: n }, r), t);
  });
}
function Bo() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const Ue = 1e3, or = {
  simd: "sam_simd.wasm",
  sam: "sam.wasm"
}, Ho = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), ir = {
  LEFT: "Left",
  RIGHT: "Right"
}, ar = {
  PALMAR: "Palmar",
  DORSAL: "Dorsal"
};
class G extends Error {
  constructor(r, t) {
    super(r);
    Ne(this, "cause");
    this.name = "AutoCaptureError", this.cause = t;
  }
  // Change this to Decorator when they will be in stable release
  static logError(r) {
  }
  static fromCameraError(r) {
    if (this.logError(r), r instanceof G)
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
    return new G(t, r);
  }
  static fromError(r) {
    if (this.logError(r), r instanceof G)
      return r;
    const t = "An unexpected error has occurred";
    return new G(t);
  }
}
const Yo = {
  RGBA: "RGBA"
}, Jo = {
  0: ir.LEFT,
  1: ir.RIGHT
}, Zo = {
  0: ar.PALMAR,
  1: ar.DORSAL
};
var le, pe, Oe;
class Ko {
  constructor(s, r) {
    We(this, le);
    We(this, pe);
    We(this, Oe);
    ze(this, le, s), ze(this, pe, this.allocate(r.length * r.BYTES_PER_ELEMENT)), ze(this, Oe, this.allocate(r.length * r.BYTES_PER_ELEMENT));
  }
  get rgbaImagePointer() {
    return X(this, pe);
  }
  get bgr0ImagePointer() {
    return X(this, Oe);
  }
  allocate(s) {
    return X(this, le)._malloc(s);
  }
  free() {
    X(this, le)._free(X(this, pe)), X(this, le)._free(X(this, Oe));
  }
  writeDataToMemory(s) {
    X(this, le).HEAPU8.set(s, X(this, pe));
  }
}
le = new WeakMap(), pe = new WeakMap(), Oe = new WeakMap();
class qo {
  constructor() {
    Ne(this, "samWasmModule");
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
        throw new G(
          `The path to ${r} is incorrect or the module is missing. Please check provided path to wasm files. Current path is ${s}`
        );
      const e = await t.arrayBuffer();
      if (!WebAssembly.validate(e))
        throw new G(
          `The provided ${r} is not a valid WASM module. Please check provided path to wasm files. Current path is ${s}`
        );
    } catch (t) {
      if (t instanceof G)
        throw console.error(
          "You can find more information about how to host wasm files here: https://developers.innovatrics.com/digital-onboarding/technical/remote/dot-web-document/latest/documentation/#_hosting_sam_wasm"
        ), t;
    }
  }
  async getSamWasmFileName() {
    return await Ho() ? or.simd : or.sam;
  }
  async initSamModule(s, r) {
    if (this.samWasmModule)
      return;
    const t = await this.getSamWasmFileName(), e = this.getSamWasmFilePath(r, t);
    try {
      this.samWasmModule = await this.fetchSamModule(this.getOverriddenModules(s, e)), this.samWasmModule.init();
    } catch {
      throw await this.handleMissingOrInvalidSamModule(e, t), new G("Could not init detector.");
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
      throw new G("SAM WASM module is not initialized");
    const r = new Ko(this.samWasmModule, s);
    return r.writeDataToMemory(s), r;
  }
  convertToSamColorImage(s, r) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const t = this.writeImageToMemory(s);
    return this.samWasmModule.convertToSamColorImage(
      r.width,
      r.height,
      t.rgbaImagePointer,
      Yo.RGBA,
      t.bgr0ImagePointer
    ), t;
  }
  async getOptimalRegionForCompressionDetectionFromDetectionCorners(s, r, t) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const e = this.convertToSamColorImage(s, r), { bottomLeft: n, topLeft: o, topRight: u } = t, a = [
      o.x,
      // x
      o.y,
      // y
      u.x - o.x,
      // width
      n.y - o.y
      // height
    ], { height: h, width: S, x: y, y: w } = await this.samWasmModule.selectDetailRegion(
      r.width,
      r.height,
      e.bgr0ImagePointer,
      a
    );
    return e.free(), {
      height: h,
      width: S,
      shiftX: y,
      shiftY: w
    };
  }
  [$e]() {
    this.terminateSamModule();
  }
}
const Ge = (f, s) => Math.hypot(s.x - f.x, s.y - f.y), Xo = (f) => {
  const { bottomLeft: s, bottomRight: r, topLeft: t, topRight: e } = f, n = Ge(t, e), o = Ge(e, r), u = Ge(s, r), a = Ge(t, s);
  return Math.min(n, o, u, a);
};
var be = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, sr = {}, at = {}, st, lr;
function Qo() {
  if (lr) return st;
  lr = 1, st = f;
  function f(s, r) {
    for (var t = new Array(arguments.length - 1), e = 0, n = 2, o = !0; n < arguments.length; )
      t[e++] = arguments[n++];
    return new Promise(function(u, a) {
      t[e] = function(h) {
        if (o)
          if (o = !1, h)
            a(h);
          else {
            for (var S = new Array(arguments.length - 1), y = 0; y < S.length; )
              S[y++] = arguments[y];
            u.apply(null, S);
          }
      };
      try {
        s.apply(r || null, t);
      } catch (h) {
        o && (o = !1, a(h));
      }
    });
  }
  return st;
}
var cr = {}, ur;
function ei() {
  return ur || (ur = 1, function(f) {
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
      for (var h = null, S = [], y = 0, w = 0, I; u < a; ) {
        var j = o[u++];
        switch (w) {
          case 0:
            S[y++] = r[j >> 2], I = (j & 3) << 4, w = 1;
            break;
          case 1:
            S[y++] = r[I | j >> 4], I = (j & 15) << 2, w = 2;
            break;
          case 2:
            S[y++] = r[I | j >> 6], S[y++] = r[j & 63], w = 0;
            break;
        }
        y > 8191 && ((h || (h = [])).push(String.fromCharCode.apply(String, S)), y = 0);
      }
      return w && (S[y++] = r[I], S[y++] = 61, w === 1 && (S[y++] = 61)), h ? (y && h.push(String.fromCharCode.apply(String, S.slice(0, y))), h.join("")) : String.fromCharCode.apply(String, S.slice(0, y));
    };
    var n = "invalid encoding";
    s.decode = function(o, u, a) {
      for (var h = a, S = 0, y, w = 0; w < o.length; ) {
        var I = o.charCodeAt(w++);
        if (I === 61 && S > 1)
          break;
        if ((I = t[I]) === void 0)
          throw Error(n);
        switch (S) {
          case 0:
            y = I, S = 1;
            break;
          case 1:
            u[a++] = y << 2 | (I & 48) >> 4, y = I, S = 2;
            break;
          case 2:
            u[a++] = (y & 15) << 4 | (I & 60) >> 2, y = I, S = 3;
            break;
          case 3:
            u[a++] = (y & 3) << 6 | I, S = 0;
            break;
        }
      }
      if (S === 1)
        throw Error(n);
      return a - h;
    }, s.test = function(o) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o);
    };
  }(cr)), cr;
}
var lt, dr;
function ti() {
  if (dr) return lt;
  dr = 1, lt = f;
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
  }, lt;
}
var ct, pr;
function ri() {
  if (pr) return ct;
  pr = 1, ct = f(f);
  function f(n) {
    return typeof Float32Array < "u" ? function() {
      var o = new Float32Array([-0]), u = new Uint8Array(o.buffer), a = u[3] === 128;
      function h(I, j, L) {
        o[0] = I, j[L] = u[0], j[L + 1] = u[1], j[L + 2] = u[2], j[L + 3] = u[3];
      }
      function S(I, j, L) {
        o[0] = I, j[L] = u[3], j[L + 1] = u[2], j[L + 2] = u[1], j[L + 3] = u[0];
      }
      n.writeFloatLE = a ? h : S, n.writeFloatBE = a ? S : h;
      function y(I, j) {
        return u[0] = I[j], u[1] = I[j + 1], u[2] = I[j + 2], u[3] = I[j + 3], o[0];
      }
      function w(I, j) {
        return u[3] = I[j], u[2] = I[j + 1], u[1] = I[j + 2], u[0] = I[j + 3], o[0];
      }
      n.readFloatLE = a ? y : w, n.readFloatBE = a ? w : y;
    }() : function() {
      function o(a, h, S, y) {
        var w = h < 0 ? 1 : 0;
        if (w && (h = -h), h === 0)
          a(1 / h > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), S, y);
        else if (isNaN(h))
          a(2143289344, S, y);
        else if (h > 34028234663852886e22)
          a((w << 31 | 2139095040) >>> 0, S, y);
        else if (h < 11754943508222875e-54)
          a((w << 31 | Math.round(h / 1401298464324817e-60)) >>> 0, S, y);
        else {
          var I = Math.floor(Math.log(h) / Math.LN2), j = Math.round(h * Math.pow(2, -I) * 8388608) & 8388607;
          a((w << 31 | I + 127 << 23 | j) >>> 0, S, y);
        }
      }
      n.writeFloatLE = o.bind(null, s), n.writeFloatBE = o.bind(null, r);
      function u(a, h, S) {
        var y = a(h, S), w = (y >> 31) * 2 + 1, I = y >>> 23 & 255, j = y & 8388607;
        return I === 255 ? j ? NaN : w * (1 / 0) : I === 0 ? w * 1401298464324817e-60 * j : w * Math.pow(2, I - 150) * (j + 8388608);
      }
      n.readFloatLE = u.bind(null, t), n.readFloatBE = u.bind(null, e);
    }(), typeof Float64Array < "u" ? function() {
      var o = new Float64Array([-0]), u = new Uint8Array(o.buffer), a = u[7] === 128;
      function h(I, j, L) {
        o[0] = I, j[L] = u[0], j[L + 1] = u[1], j[L + 2] = u[2], j[L + 3] = u[3], j[L + 4] = u[4], j[L + 5] = u[5], j[L + 6] = u[6], j[L + 7] = u[7];
      }
      function S(I, j, L) {
        o[0] = I, j[L] = u[7], j[L + 1] = u[6], j[L + 2] = u[5], j[L + 3] = u[4], j[L + 4] = u[3], j[L + 5] = u[2], j[L + 6] = u[1], j[L + 7] = u[0];
      }
      n.writeDoubleLE = a ? h : S, n.writeDoubleBE = a ? S : h;
      function y(I, j) {
        return u[0] = I[j], u[1] = I[j + 1], u[2] = I[j + 2], u[3] = I[j + 3], u[4] = I[j + 4], u[5] = I[j + 5], u[6] = I[j + 6], u[7] = I[j + 7], o[0];
      }
      function w(I, j) {
        return u[7] = I[j], u[6] = I[j + 1], u[5] = I[j + 2], u[4] = I[j + 3], u[3] = I[j + 4], u[2] = I[j + 5], u[1] = I[j + 6], u[0] = I[j + 7], o[0];
      }
      n.readDoubleLE = a ? y : w, n.readDoubleBE = a ? w : y;
    }() : function() {
      function o(a, h, S, y, w, I) {
        var j = y < 0 ? 1 : 0;
        if (j && (y = -y), y === 0)
          a(0, w, I + h), a(1 / y > 0 ? (
            /* positive */
            0
          ) : (
            /* negative 0 */
            2147483648
          ), w, I + S);
        else if (isNaN(y))
          a(0, w, I + h), a(2146959360, w, I + S);
        else if (y > 17976931348623157e292)
          a(0, w, I + h), a((j << 31 | 2146435072) >>> 0, w, I + S);
        else {
          var L;
          if (y < 22250738585072014e-324)
            L = y / 5e-324, a(L >>> 0, w, I + h), a((j << 31 | L / 4294967296) >>> 0, w, I + S);
          else {
            var O = Math.floor(Math.log(y) / Math.LN2);
            O === 1024 && (O = 1023), L = y * Math.pow(2, -O), a(L * 4503599627370496 >>> 0, w, I + h), a((j << 31 | O + 1023 << 20 | L * 1048576 & 1048575) >>> 0, w, I + S);
          }
        }
      }
      n.writeDoubleLE = o.bind(null, s, 0, 4), n.writeDoubleBE = o.bind(null, r, 4, 0);
      function u(a, h, S, y, w) {
        var I = a(y, w + h), j = a(y, w + S), L = (j >> 31) * 2 + 1, O = j >>> 20 & 2047, k = 4294967296 * (j & 1048575) + I;
        return O === 2047 ? k ? NaN : L * (1 / 0) : O === 0 ? L * 5e-324 * k : L * Math.pow(2, O - 1075) * (k + 4503599627370496);
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
  return ct;
}
function fr(f) {
  throw new Error('Could not dynamically require "' + f + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ut, mr;
function ni() {
  if (mr) return ut;
  mr = 1, ut = f;
  function f(s) {
    try {
      if (typeof fr != "function")
        return null;
      var r = fr(s);
      return r && (r.length || Object.keys(r).length) ? r : null;
    } catch {
      return null;
    }
  }
  return ut;
}
var gr = {}, yr;
function oi() {
  return yr || (yr = 1, function(f) {
    var s = f;
    s.length = function(r) {
      for (var t = 0, e = 0, n = 0; n < r.length; ++n)
        e = r.charCodeAt(n), e < 128 ? t += 1 : e < 2048 ? t += 2 : (e & 64512) === 55296 && (r.charCodeAt(n + 1) & 64512) === 56320 ? (++n, t += 4) : t += 3;
      return t;
    }, s.read = function(r, t, e) {
      var n = e - t;
      if (n < 1)
        return "";
      for (var o = null, u = [], a = 0, h; t < e; )
        h = r[t++], h < 128 ? u[a++] = h : h > 191 && h < 224 ? u[a++] = (h & 31) << 6 | r[t++] & 63 : h > 239 && h < 365 ? (h = ((h & 7) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, u[a++] = 55296 + (h >> 10), u[a++] = 56320 + (h & 1023)) : u[a++] = (h & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63, a > 8191 && ((o || (o = [])).push(String.fromCharCode.apply(String, u)), a = 0);
      return o ? (a && o.push(String.fromCharCode.apply(String, u.slice(0, a))), o.join("")) : String.fromCharCode.apply(String, u.slice(0, a));
    }, s.write = function(r, t, e) {
      for (var n = e, o, u, a = 0; a < r.length; ++a)
        o = r.charCodeAt(a), o < 128 ? t[e++] = o : o < 2048 ? (t[e++] = o >> 6 | 192, t[e++] = o & 63 | 128) : (o & 64512) === 55296 && ((u = r.charCodeAt(a + 1)) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (u & 1023), ++a, t[e++] = o >> 18 | 240, t[e++] = o >> 12 & 63 | 128, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128) : (t[e++] = o >> 12 | 224, t[e++] = o >> 6 & 63 | 128, t[e++] = o & 63 | 128);
      return e - n;
    };
  }(gr)), gr;
}
var dt, hr;
function ii() {
  if (hr) return dt;
  hr = 1, dt = f;
  function f(s, r, t) {
    var e = t || 8192, n = e >>> 1, o = null, u = e;
    return function(a) {
      if (a < 1 || a > n)
        return s(a);
      u + a > e && (o = s(e), u = 0);
      var h = r.call(o, u, u += a);
      return u & 7 && (u = (u | 7) + 1), h;
    };
  }
  return dt;
}
var pt, br;
function ai() {
  if (br) return pt;
  br = 1, pt = s;
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
  }, pt;
}
var vr;
function fe() {
  return vr || (vr = 1, function(f) {
    var s = f;
    s.asPromise = Qo(), s.base64 = ei(), s.EventEmitter = ti(), s.float = ri(), s.inquire = ni(), s.utf8 = oi(), s.pool = ii(), s.LongBits = ai(), s.isNode = !!(typeof be < "u" && be && be.process && be.process.versions && be.process.versions.node), s.global = s.isNode && be || typeof window < "u" && window || typeof self < "u" && self || at, s.emptyArray = Object.freeze ? Object.freeze([]) : (
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
  }(at)), at;
}
var ft, Or;
function Nr() {
  if (Or) return ft;
  Or = 1, ft = a;
  var f = fe(), s, r = f.LongBits, t = f.base64, e = f.utf8;
  function n(O, k, _) {
    this.fn = O, this.len = k, this.next = void 0, this.val = _;
  }
  function o() {
  }
  function u(O) {
    this.head = O.head, this.tail = O.tail, this.len = O.len, this.next = O.states;
  }
  function a() {
    this.len = 0, this.head = new n(o, 0, 0), this.tail = this.head, this.states = null;
  }
  var h = function() {
    return f.Buffer ? function() {
      return (a.create = function() {
        return new s();
      })();
    } : function() {
      return new a();
    };
  };
  a.create = h(), a.alloc = function(O) {
    return new f.Array(O);
  }, f.Array !== Array && (a.alloc = f.pool(a.alloc, f.Array.prototype.subarray)), a.prototype._push = function(O, k, _) {
    return this.tail = this.tail.next = new n(O, k, _), this.len += k, this;
  };
  function S(O, k, _) {
    k[_] = O & 255;
  }
  function y(O, k, _) {
    for (; O > 127; )
      k[_++] = O & 127 | 128, O >>>= 7;
    k[_] = O;
  }
  function w(O, k) {
    this.len = O, this.next = void 0, this.val = k;
  }
  w.prototype = Object.create(n.prototype), w.prototype.fn = y, a.prototype.uint32 = function(O) {
    return this.len += (this.tail = this.tail.next = new w(
      (O = O >>> 0) < 128 ? 1 : O < 16384 ? 2 : O < 2097152 ? 3 : O < 268435456 ? 4 : 5,
      O
    )).len, this;
  }, a.prototype.int32 = function(O) {
    return O < 0 ? this._push(I, 10, r.fromNumber(O)) : this.uint32(O);
  }, a.prototype.sint32 = function(O) {
    return this.uint32((O << 1 ^ O >> 31) >>> 0);
  };
  function I(O, k, _) {
    for (; O.hi; )
      k[_++] = O.lo & 127 | 128, O.lo = (O.lo >>> 7 | O.hi << 25) >>> 0, O.hi >>>= 7;
    for (; O.lo > 127; )
      k[_++] = O.lo & 127 | 128, O.lo = O.lo >>> 7;
    k[_++] = O.lo;
  }
  a.prototype.uint64 = function(O) {
    var k = r.from(O);
    return this._push(I, k.length(), k);
  }, a.prototype.int64 = a.prototype.uint64, a.prototype.sint64 = function(O) {
    var k = r.from(O).zzEncode();
    return this._push(I, k.length(), k);
  }, a.prototype.bool = function(O) {
    return this._push(S, 1, O ? 1 : 0);
  };
  function j(O, k, _) {
    k[_] = O & 255, k[_ + 1] = O >>> 8 & 255, k[_ + 2] = O >>> 16 & 255, k[_ + 3] = O >>> 24;
  }
  a.prototype.fixed32 = function(O) {
    return this._push(j, 4, O >>> 0);
  }, a.prototype.sfixed32 = a.prototype.fixed32, a.prototype.fixed64 = function(O) {
    var k = r.from(O);
    return this._push(j, 4, k.lo)._push(j, 4, k.hi);
  }, a.prototype.sfixed64 = a.prototype.fixed64, a.prototype.float = function(O) {
    return this._push(f.float.writeFloatLE, 4, O);
  }, a.prototype.double = function(O) {
    return this._push(f.float.writeDoubleLE, 8, O);
  };
  var L = f.Array.prototype.set ? function(O, k, _) {
    k.set(O, _);
  } : function(O, k, _) {
    for (var Q = 0; Q < O.length; ++Q)
      k[_ + Q] = O[Q];
  };
  return a.prototype.bytes = function(O) {
    var k = O.length >>> 0;
    if (!k)
      return this._push(S, 1, 0);
    if (f.isString(O)) {
      var _ = a.alloc(k = t.length(O));
      t.decode(O, _, 0), O = _;
    }
    return this.uint32(k)._push(L, k, O);
  }, a.prototype.string = function(O) {
    var k = e.length(O);
    return k ? this.uint32(k)._push(e.write, k, O) : this._push(S, 1, 0);
  }, a.prototype.fork = function() {
    return this.states = new u(this), this.head = this.tail = new n(o, 0, 0), this.len = 0, this;
  }, a.prototype.reset = function() {
    return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new n(o, 0, 0), this.len = 0), this;
  }, a.prototype.ldelim = function() {
    var O = this.head, k = this.tail, _ = this.len;
    return this.reset().uint32(_), _ && (this.tail.next = O.next, this.tail = k, this.len += _), this;
  }, a.prototype.finish = function() {
    for (var O = this.head.next, k = this.constructor.alloc(this.len), _ = 0; O; )
      O.fn(O.val, k, _), _ += O.len, O = O.next;
    return k;
  }, a._configure = function(O) {
    s = O, a.create = h(), s._configure();
  }, ft;
}
var mt, wr;
function si() {
  if (wr) return mt;
  wr = 1, mt = r;
  var f = Nr();
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
  }, r._configure(), mt;
}
var gt, Pr;
function Wr() {
  if (Pr) return gt;
  Pr = 1, gt = n;
  var f = fe(), s, r = f.LongBits, t = f.utf8;
  function e(y, w) {
    return RangeError("index out of range: " + y.pos + " + " + (w || 1) + " > " + y.len);
  }
  function n(y) {
    this.buf = y, this.pos = 0, this.len = y.length;
  }
  var o = typeof Uint8Array < "u" ? function(y) {
    if (y instanceof Uint8Array || Array.isArray(y))
      return new n(y);
    throw Error("illegal buffer");
  } : function(y) {
    if (Array.isArray(y))
      return new n(y);
    throw Error("illegal buffer");
  }, u = function() {
    return f.Buffer ? function(y) {
      return (n.create = function(w) {
        return f.Buffer.isBuffer(w) ? new s(w) : o(w);
      })(y);
    } : o;
  };
  n.create = u(), n.prototype._slice = f.Array.prototype.subarray || /* istanbul ignore next */
  f.Array.prototype.slice, n.prototype.uint32 = /* @__PURE__ */ function() {
    var y = 4294967295;
    return function() {
      if (y = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (y = (y | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (y = (y | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (y = (y | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (y = (y | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128)) return y;
      if ((this.pos += 5) > this.len)
        throw this.pos = this.len, e(this, 10);
      return y;
    };
  }(), n.prototype.int32 = function() {
    return this.uint32() | 0;
  }, n.prototype.sint32 = function() {
    var y = this.uint32();
    return y >>> 1 ^ -(y & 1) | 0;
  };
  function a() {
    var y = new r(0, 0), w = 0;
    if (this.len - this.pos > 4) {
      for (; w < 4; ++w)
        if (y.lo = (y.lo | (this.buf[this.pos] & 127) << w * 7) >>> 0, this.buf[this.pos++] < 128)
          return y;
      if (y.lo = (y.lo | (this.buf[this.pos] & 127) << 28) >>> 0, y.hi = (y.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
        return y;
      w = 0;
    } else {
      for (; w < 3; ++w) {
        if (this.pos >= this.len)
          throw e(this);
        if (y.lo = (y.lo | (this.buf[this.pos] & 127) << w * 7) >>> 0, this.buf[this.pos++] < 128)
          return y;
      }
      return y.lo = (y.lo | (this.buf[this.pos++] & 127) << w * 7) >>> 0, y;
    }
    if (this.len - this.pos > 4) {
      for (; w < 5; ++w)
        if (y.hi = (y.hi | (this.buf[this.pos] & 127) << w * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return y;
    } else
      for (; w < 5; ++w) {
        if (this.pos >= this.len)
          throw e(this);
        if (y.hi = (y.hi | (this.buf[this.pos] & 127) << w * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
          return y;
      }
    throw Error("invalid varint encoding");
  }
  n.prototype.bool = function() {
    return this.uint32() !== 0;
  };
  function h(y, w) {
    return (y[w - 4] | y[w - 3] << 8 | y[w - 2] << 16 | y[w - 1] << 24) >>> 0;
  }
  n.prototype.fixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return h(this.buf, this.pos += 4);
  }, n.prototype.sfixed32 = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    return h(this.buf, this.pos += 4) | 0;
  };
  function S() {
    if (this.pos + 8 > this.len)
      throw e(this, 8);
    return new r(h(this.buf, this.pos += 4), h(this.buf, this.pos += 4));
  }
  return n.prototype.float = function() {
    if (this.pos + 4 > this.len)
      throw e(this, 4);
    var y = f.float.readFloatLE(this.buf, this.pos);
    return this.pos += 4, y;
  }, n.prototype.double = function() {
    if (this.pos + 8 > this.len)
      throw e(this, 4);
    var y = f.float.readDoubleLE(this.buf, this.pos);
    return this.pos += 8, y;
  }, n.prototype.bytes = function() {
    var y = this.uint32(), w = this.pos, I = this.pos + y;
    if (I > this.len)
      throw e(this, y);
    if (this.pos += y, Array.isArray(this.buf))
      return this.buf.slice(w, I);
    if (w === I) {
      var j = f.Buffer;
      return j ? j.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, w, I);
  }, n.prototype.string = function() {
    var y = this.bytes();
    return t.read(y, 0, y.length);
  }, n.prototype.skip = function(y) {
    if (typeof y == "number") {
      if (this.pos + y > this.len)
        throw e(this, y);
      this.pos += y;
    } else
      do
        if (this.pos >= this.len)
          throw e(this);
      while (this.buf[this.pos++] & 128);
    return this;
  }, n.prototype.skipType = function(y) {
    switch (y) {
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
        for (; (y = this.uint32() & 7) !== 4; )
          this.skipType(y);
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error("invalid wire type " + y + " at offset " + this.pos);
    }
    return this;
  }, n._configure = function(y) {
    s = y, n.create = u(), s._configure();
    var w = f.Long ? "toLong" : (
      /* istanbul ignore next */
      "toNumber"
    );
    f.merge(n.prototype, {
      int64: function() {
        return a.call(this)[w](!1);
      },
      uint64: function() {
        return a.call(this)[w](!0);
      },
      sint64: function() {
        return a.call(this).zzDecode()[w](!1);
      },
      fixed64: function() {
        return S.call(this)[w](!0);
      },
      sfixed64: function() {
        return S.call(this)[w](!1);
      }
    });
  }, gt;
}
var yt, Ir;
function li() {
  if (Ir) return yt;
  Ir = 1, yt = r;
  var f = Wr();
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
  }, r._configure(), yt;
}
var jr = {}, ht, Sr;
function ci() {
  if (Sr) return ht;
  Sr = 1, ht = s;
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
        function(h, S) {
          if (h)
            return a.emit("error", h, t), u(h);
          if (S === null) {
            a.end(
              /* endedByRPC */
              !0
            );
            return;
          }
          if (!(S instanceof n))
            try {
              S = n[a.responseDelimited ? "decodeDelimited" : "decode"](S);
            } catch (y) {
              return a.emit("error", y, t), u(y);
            }
          return a.emit("data", S, t), u(null, S);
        }
      );
    } catch (h) {
      a.emit("error", h, t), setTimeout(function() {
        u(h);
      }, 0);
      return;
    }
  }, s.prototype.end = function(r) {
    return this.rpcImpl && (r || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
  }, ht;
}
var Cr;
function ui() {
  return Cr || (Cr = 1, function(f) {
    var s = f;
    s.Service = ci();
  }(jr)), jr;
}
var Tr, kr;
function di() {
  return kr || (kr = 1, Tr = {}), Tr;
}
var Dr;
function pi() {
  return Dr || (Dr = 1, function(f) {
    var s = f;
    s.build = "minimal", s.Writer = Nr(), s.BufferWriter = si(), s.Reader = Wr(), s.BufferReader = li(), s.util = fe(), s.rpc = ui(), s.roots = di(), s.configure = r;
    function r() {
      s.util._configure(), s.Writer._configure(s.BufferWriter), s.Reader._configure(s.BufferReader);
    }
    r();
  }(sr)), sr;
}
var Ar, Er;
function fi() {
  return Er || (Er = 1, Ar = pi()), Ar;
}
var D = fi();
const m = D.Reader, E = D.Writer, d = D.util, i = D.roots.default || (D.roots.default = {});
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.MagnifEyeLivenessContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Metadata();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.AndroidMetadata(), h, S;
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
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
              let w = e.uint32() + e.pos;
              for (h = "", S = null; e.pos < w; ) {
                let I = e.uint32();
                switch (I >>> 3) {
                  case 1:
                    h = e.string();
                    break;
                  case 2:
                    S = i.dot.Int32List.decode(e, e.uint32());
                    break;
                  default:
                    e.skipType(I & 7);
                    break;
                }
              }
              a.dynamicCameraFrameProperties[h] = S;
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
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.IosMetadata(), h, S;
        for (; e.pos < u; ) {
          let y = e.uint32();
          if (y === o)
            break;
          switch (y >>> 3) {
            case 1: {
              a.cameraModelId = e.string();
              break;
            }
            case 2: {
              a.architectureInfo === d.emptyObject && (a.architectureInfo = {});
              let w = e.uint32() + e.pos;
              for (h = "", S = !1; e.pos < w; ) {
                let I = e.uint32();
                switch (I >>> 3) {
                  case 1:
                    h = e.string();
                    break;
                  case 2:
                    S = e.bool();
                    break;
                  default:
                    e.skipType(I & 7);
                    break;
                }
              }
              a.architectureInfo[h] = S;
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
              if (a.isoValues && a.isoValues.length || (a.isoValues = []), (y & 7) === 2) {
                let w = e.uint32() + e.pos;
                for (; e.pos < w; )
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
              e.skipType(y & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.WebMetadata();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.MediaTrackSettings();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.CameraProperties();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
            case 1: {
              a.cameraInitFrameResolution = i.dot.v4.ImageBitmap.decode(e, e.uint32());
              break;
            }
            case 2: {
              a.cameraProperties = i.dot.v4.MediaTrackSettings.decode(e, e.uint32());
              break;
            }
            default:
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.PlatformDetails();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.FaceContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.DocumentContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Blob();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Lds1eMrtdApplication();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.Lds1ElementaryFile();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
            case 1: {
              a.id = e.int32();
              break;
            }
            case 2: {
              a.bytes = e.bytes();
              break;
            }
            default:
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.ChipAuthenticationStatus();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.EyeGazeLivenessContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.MultiRangeLivenessContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        t instanceof m || (t = m.create(t));
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
        return t instanceof m || (t = new m(t)), this.decode(t, t.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.SmileLivenessContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
        e instanceof m || (e = m.create(e));
        let u = n === void 0 ? e.len : e.pos + n, a = new i.dot.v4.PalmContent();
        for (; e.pos < u; ) {
          let h = e.uint32();
          if (h === o)
            break;
          switch (h >>> 3) {
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
              e.skipType(h & 7);
              break;
          }
        }
        return a;
      }, r.decodeDelimited = function(e) {
        return e instanceof m || (e = new m(e)), this.decode(e, e.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
      r instanceof m || (r = m.create(r));
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
      return r instanceof m || (r = new m(r)), this.decode(r, r.uint32());
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
var mi = (() => {
  var f = import.meta.url;
  return async function(s = {}) {
    var r, t = s, e, n, o = new Promise((c, l) => {
      e = c, n = l;
    }), u = typeof window == "object", a = typeof WorkerGlobalScope < "u";
    typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var h = Object.assign({}, t), S = (c, l) => {
      throw l;
    }, y = "";
    function w(c) {
      return t.locateFile ? t.locateFile(c, y) : y + c;
    }
    var I, j;
    (u || a) && (a ? y = self.location.href : typeof document < "u" && document.currentScript && (y = document.currentScript.src), f && (y = f), y.startsWith("blob:") ? y = "" : y = y.slice(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1), a && (j = (c) => {
      var l = new XMLHttpRequest();
      return l.open("GET", c, !1), l.responseType = "arraybuffer", l.send(null), new Uint8Array(l.response);
    }), I = async (c) => {
      if (jt(c))
        return new Promise((p, g) => {
          var b = new XMLHttpRequest();
          b.open("GET", c, !0), b.responseType = "arraybuffer", b.onload = () => {
            if (b.status == 200 || b.status == 0 && b.response) {
              p(b.response);
              return;
            }
            g(b.status);
          }, b.onerror = g, b.send(null);
        });
      var l = await fetch(c, { credentials: "same-origin" });
      if (l.ok)
        return l.arrayBuffer();
      throw new Error(l.status + " : " + l.url);
    }), t.print || console.log.bind(console);
    var L = t.printErr || console.error.bind(console);
    Object.assign(t, h), h = null, t.arguments && t.arguments, t.thisProgram && t.thisProgram;
    var O = t.wasmBinary, k, _ = !1, Q, te, $, me, we, re, W, Ot, wt, Pt, It, jt = (c) => c.startsWith("file://");
    function St() {
      var c = k.buffer;
      t.HEAP8 = te = new Int8Array(c), t.HEAP16 = me = new Int16Array(c), t.HEAPU8 = $ = new Uint8Array(c), t.HEAPU16 = we = new Uint16Array(c), t.HEAP32 = re = new Int32Array(c), t.HEAPU32 = W = new Uint32Array(c), t.HEAPF32 = Ot = new Float32Array(c), t.HEAPF64 = It = new Float64Array(c), t.HEAP64 = wt = new BigInt64Array(c), t.HEAPU64 = Pt = new BigUint64Array(c);
    }
    function zr() {
      if (t.preRun)
        for (typeof t.preRun == "function" && (t.preRun = [t.preRun]); t.preRun.length; )
          Qr(t.preRun.shift());
      Tt(Dt);
    }
    function Vr() {
      F.C();
    }
    function Ur() {
      if (t.postRun)
        for (typeof t.postRun == "function" && (t.postRun = [t.postRun]); t.postRun.length; )
          Xr(t.postRun.shift());
      Tt(kt);
    }
    var ce = 0, Pe = null;
    function Gr(c) {
      var l;
      ce++, (l = t.monitorRunDependencies) == null || l.call(t, ce);
    }
    function $r(c) {
      var p;
      if (ce--, (p = t.monitorRunDependencies) == null || p.call(t, ce), ce == 0 && Pe) {
        var l = Pe;
        Pe = null, l();
      }
    }
    function Ce(c) {
      var p;
      (p = t.onAbort) == null || p.call(t, c), c = "Aborted(" + c + ")", L(c), _ = !0, c += ". Build with -sASSERTIONS for more info.";
      var l = new WebAssembly.RuntimeError(c);
      throw n(l), l;
    }
    var Ze;
    function Br() {
      return t.locateFile ? w("dot-sam.wasm") : new URL("dot-sam.wasm", import.meta.url).href;
    }
    function Hr(c) {
      if (c == Ze && O)
        return new Uint8Array(O);
      if (j)
        return j(c);
      throw "both async and sync fetching of the wasm failed";
    }
    async function Yr(c) {
      if (!O)
        try {
          var l = await I(c);
          return new Uint8Array(l);
        } catch {
        }
      return Hr(c);
    }
    async function Jr(c, l) {
      try {
        var p = await Yr(c), g = await WebAssembly.instantiate(p, l);
        return g;
      } catch (b) {
        L(`failed to asynchronously prepare wasm: ${b}`), Ce(b);
      }
    }
    async function Zr(c, l, p) {
      if (!c && typeof WebAssembly.instantiateStreaming == "function" && !jt(l))
        try {
          var g = fetch(l, { credentials: "same-origin" }), b = await WebAssembly.instantiateStreaming(g, p);
          return b;
        } catch (P) {
          L(`wasm streaming compile failed: ${P}`), L("falling back to ArrayBuffer instantiation");
        }
      return Jr(l, p);
    }
    function Kr() {
      return { a: jo };
    }
    async function qr() {
      function c(P, C) {
        return F = P.exports, F = A.instrumentWasmExports(F), k = F.B, St(), F.H, $r(), F;
      }
      Gr();
      function l(P) {
        return c(P.instance);
      }
      var p = Kr();
      if (t.instantiateWasm)
        return new Promise((P, C) => {
          t.instantiateWasm(p, (v, T) => {
            c(v), P(v.exports);
          });
        });
      Ze ?? (Ze = Br());
      try {
        var g = await Zr(O, Ze, p), b = l(g);
        return b;
      } catch (P) {
        return n(P), Promise.reject(P);
      }
    }
    class Ct {
      constructor(l) {
        Ne(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${l})`, this.status = l;
      }
    }
    var Tt = (c) => {
      for (; c.length > 0; )
        c.shift()(t);
    }, kt = [], Xr = (c) => kt.unshift(c), Dt = [], Qr = (c) => Dt.unshift(c), At = t.noExitRuntime || !0;
    class en {
      constructor(l) {
        this.excPtr = l, this.ptr = l - 24;
      }
      set_type(l) {
        W[this.ptr + 4 >> 2] = l;
      }
      get_type() {
        return W[this.ptr + 4 >> 2];
      }
      set_destructor(l) {
        W[this.ptr + 8 >> 2] = l;
      }
      get_destructor() {
        return W[this.ptr + 8 >> 2];
      }
      set_caught(l) {
        l = l ? 1 : 0, te[this.ptr + 12] = l;
      }
      get_caught() {
        return te[this.ptr + 12] != 0;
      }
      set_rethrown(l) {
        l = l ? 1 : 0, te[this.ptr + 13] = l;
      }
      get_rethrown() {
        return te[this.ptr + 13] != 0;
      }
      init(l, p) {
        this.set_adjusted_ptr(0), this.set_type(l), this.set_destructor(p);
      }
      set_adjusted_ptr(l) {
        W[this.ptr + 16 >> 2] = l;
      }
      get_adjusted_ptr() {
        return W[this.ptr + 16 >> 2];
      }
    }
    var Et = 0, tn = (c, l, p) => {
      var g = new en(c);
      throw g.init(l, p), Et = c, Et;
    }, rn = () => Ce(""), Te = (c) => {
      if (c === null)
        return "null";
      var l = typeof c;
      return l === "object" || l === "array" || l === "function" ? c.toString() : "" + c;
    }, nn = () => {
      for (var c = new Array(256), l = 0; l < 256; ++l)
        c[l] = String.fromCharCode(l);
      Mt = c;
    }, Mt, z = (c) => {
      for (var l = "", p = c; $[p]; )
        l += Mt[$[p++]];
      return l;
    }, ge = {}, ue = {}, ke = {}, ye, x = (c) => {
      throw new ye(c);
    }, Lt, De = (c) => {
      throw new Lt(c);
    }, he = (c, l, p) => {
      c.forEach((v) => ke[v] = l);
      function g(v) {
        var T = p(v);
        T.length !== c.length && De("Mismatched type converter count");
        for (var R = 0; R < c.length; ++R)
          H(c[R], T[R]);
      }
      var b = new Array(l.length), P = [], C = 0;
      l.forEach((v, T) => {
        ue.hasOwnProperty(v) ? b[T] = ue[v] : (P.push(v), ge.hasOwnProperty(v) || (ge[v] = []), ge[v].push(() => {
          b[T] = ue[v], ++C, C === P.length && g(b);
        }));
      }), P.length === 0 && g(b);
    };
    function on(c, l, p = {}) {
      var g = l.name;
      if (c || x(`type "${g}" must have a positive integer typeid pointer`), ue.hasOwnProperty(c)) {
        if (p.ignoreDuplicateRegistrations)
          return;
        x(`Cannot register type '${g}' twice`);
      }
      if (ue[c] = l, delete ke[c], ge.hasOwnProperty(c)) {
        var b = ge[c];
        delete ge[c], b.forEach((P) => P());
      }
    }
    function H(c, l, p = {}) {
      return on(c, l, p);
    }
    var Rt = (c, l, p) => {
      switch (l) {
        case 1:
          return p ? (g) => te[g] : (g) => $[g];
        case 2:
          return p ? (g) => me[g >> 1] : (g) => we[g >> 1];
        case 4:
          return p ? (g) => re[g >> 2] : (g) => W[g >> 2];
        case 8:
          return p ? (g) => wt[g >> 3] : (g) => Pt[g >> 3];
        default:
          throw new TypeError(`invalid integer width (${l}): ${c}`);
      }
    }, an = (c, l, p, g, b) => {
      l = z(l);
      var P = l.indexOf("u") != -1;
      H(c, { name: l, fromWireType: (C) => C, toWireType: function(C, v) {
        if (typeof v != "bigint" && typeof v != "number")
          throw new TypeError(`Cannot convert "${Te(v)}" to ${this.name}`);
        return typeof v == "number" && (v = BigInt(v)), v;
      }, argPackAdvance: J, readValueFromPointer: Rt(l, p, !P), destructorFunction: null });
    }, J = 8, sn = (c, l, p, g) => {
      l = z(l), H(c, { name: l, fromWireType: function(b) {
        return !!b;
      }, toWireType: function(b, P) {
        return P ? p : g;
      }, argPackAdvance: J, readValueFromPointer: function(b) {
        return this.fromWireType($[b]);
      }, destructorFunction: null });
    }, ln = (c) => ({ count: c.count, deleteScheduled: c.deleteScheduled, preservePointerOnDelete: c.preservePointerOnDelete, ptr: c.ptr, ptrType: c.ptrType, smartPtr: c.smartPtr, smartPtrType: c.smartPtrType }), Ke = (c) => {
      function l(p) {
        return p.$$.ptrType.registeredClass.name;
      }
      x(l(c) + " instance already deleted");
    }, qe = !1, _t = (c) => {
    }, cn = (c) => {
      c.smartPtr ? c.smartPtrType.rawDestructor(c.smartPtr) : c.ptrType.registeredClass.rawDestructor(c.ptr);
    }, Ft = (c) => {
      c.count.value -= 1;
      var l = c.count.value === 0;
      l && cn(c);
    }, xt = (c, l, p) => {
      if (l === p)
        return c;
      if (p.baseClass === void 0)
        return null;
      var g = xt(c, l, p.baseClass);
      return g === null ? null : p.downcast(g);
    }, Nt = {}, un = {}, dn = (c, l) => {
      for (l === void 0 && x("ptr should not be undefined"); c.baseClass; )
        l = c.upcast(l), c = c.baseClass;
      return l;
    }, pn = (c, l) => (l = dn(c, l), un[l]), Ae = (c, l) => {
      (!l.ptrType || !l.ptr) && De("makeClassHandle requires ptr and ptrType");
      var p = !!l.smartPtrType, g = !!l.smartPtr;
      return p !== g && De("Both smartPtrType and smartPtr must be specified"), l.count = { value: 1 }, Ie(Object.create(c, { $$: { value: l, writable: !0 } }));
    };
    function fn(c) {
      var l = this.getPointee(c);
      if (!l)
        return this.destructor(c), null;
      var p = pn(this.registeredClass, l);
      if (p !== void 0) {
        if (p.$$.count.value === 0)
          return p.$$.ptr = l, p.$$.smartPtr = c, p.clone();
        var g = p.clone();
        return this.destructor(c), g;
      }
      function b() {
        return this.isSmartPointer ? Ae(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: l, smartPtrType: this, smartPtr: c }) : Ae(this.registeredClass.instancePrototype, { ptrType: this, ptr: c });
      }
      var P = this.registeredClass.getActualType(l), C = Nt[P];
      if (!C)
        return b.call(this);
      var v;
      this.isConst ? v = C.constPointerType : v = C.pointerType;
      var T = xt(l, this.registeredClass, v.registeredClass);
      return T === null ? b.call(this) : this.isSmartPointer ? Ae(v.registeredClass.instancePrototype, { ptrType: v, ptr: T, smartPtrType: this, smartPtr: c }) : Ae(v.registeredClass.instancePrototype, { ptrType: v, ptr: T });
    }
    var Ie = (c) => typeof FinalizationRegistry > "u" ? (Ie = (l) => l, c) : (qe = new FinalizationRegistry((l) => {
      Ft(l.$$);
    }), Ie = (l) => {
      var p = l.$$, g = !!p.smartPtr;
      if (g) {
        var b = { $$: p };
        qe.register(l, b, l);
      }
      return l;
    }, _t = (l) => qe.unregister(l), Ie(c)), mn = () => {
      Object.assign(Ee.prototype, { isAliasOf(c) {
        if (!(this instanceof Ee) || !(c instanceof Ee))
          return !1;
        var l = this.$$.ptrType.registeredClass, p = this.$$.ptr;
        c.$$ = c.$$;
        for (var g = c.$$.ptrType.registeredClass, b = c.$$.ptr; l.baseClass; )
          p = l.upcast(p), l = l.baseClass;
        for (; g.baseClass; )
          b = g.upcast(b), g = g.baseClass;
        return l === g && p === b;
      }, clone() {
        if (this.$$.ptr || Ke(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var c = Ie(Object.create(Object.getPrototypeOf(this), { $$: { value: ln(this.$$) } }));
        return c.$$.count.value += 1, c.$$.deleteScheduled = !1, c;
      }, delete() {
        this.$$.ptr || Ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), _t(this), Ft(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || Ke(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && x("Object already scheduled for deletion"), this.$$.deleteScheduled = !0, this;
      } });
    };
    function Ee() {
    }
    var Me = (c, l) => Object.defineProperty(l, "name", { value: c }), gn = (c, l, p) => {
      if (c[l].overloadTable === void 0) {
        var g = c[l];
        c[l] = function(...b) {
          return c[l].overloadTable.hasOwnProperty(b.length) || x(`Function '${p}' called with an invalid number of arguments (${b.length}) - expects one of (${c[l].overloadTable})!`), c[l].overloadTable[b.length].apply(this, b);
        }, c[l].overloadTable = [], c[l].overloadTable[g.argCount] = g;
      }
    }, Xe = (c, l, p) => {
      t.hasOwnProperty(c) ? ((p === void 0 || t[c].overloadTable !== void 0 && t[c].overloadTable[p] !== void 0) && x(`Cannot register public name '${c}' twice`), gn(t, c, c), t[c].overloadTable.hasOwnProperty(p) && x(`Cannot register multiple overloads of a function with the same number of arguments (${p})!`), t[c].overloadTable[p] = l) : (t[c] = l, t[c].argCount = p);
    }, yn = 48, hn = 57, bn = (c) => {
      c = c.replace(/[^a-zA-Z0-9_]/g, "$");
      var l = c.charCodeAt(0);
      return l >= yn && l <= hn ? `_${c}` : c;
    };
    function vn(c, l, p, g, b, P, C, v) {
      this.name = c, this.constructor = l, this.instancePrototype = p, this.rawDestructor = g, this.baseClass = b, this.getActualType = P, this.upcast = C, this.downcast = v, this.pureVirtualFunctions = [];
    }
    var Le = (c, l, p) => {
      for (; l !== p; )
        l.upcast || x(`Expected null or instance of ${p.name}, got an instance of ${l.name}`), c = l.upcast(c), l = l.baseClass;
      return c;
    };
    function On(c, l) {
      if (l === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      l.$$ || x(`Cannot pass "${Te(l)}" as a ${this.name}`), l.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var p = l.$$.ptrType.registeredClass, g = Le(l.$$.ptr, p, this.registeredClass);
      return g;
    }
    function wn(c, l) {
      var p;
      if (l === null)
        return this.isReference && x(`null is not a valid ${this.name}`), this.isSmartPointer ? (p = this.rawConstructor(), c !== null && c.push(this.rawDestructor, p), p) : 0;
      (!l || !l.$$) && x(`Cannot pass "${Te(l)}" as a ${this.name}`), l.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && l.$$.ptrType.isConst && x(`Cannot convert argument of type ${l.$$.smartPtrType ? l.$$.smartPtrType.name : l.$$.ptrType.name} to parameter type ${this.name}`);
      var g = l.$$.ptrType.registeredClass;
      if (p = Le(l.$$.ptr, g, this.registeredClass), this.isSmartPointer)
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
              p = this.rawShare(p, Y.toHandle(() => b.delete())), c !== null && c.push(this.rawDestructor, p);
            }
            break;
          default:
            x("Unsupporting sharing policy");
        }
      return p;
    }
    function Pn(c, l) {
      if (l === null)
        return this.isReference && x(`null is not a valid ${this.name}`), 0;
      l.$$ || x(`Cannot pass "${Te(l)}" as a ${this.name}`), l.$$.ptr || x(`Cannot pass deleted object as a pointer of type ${this.name}`), l.$$.ptrType.isConst && x(`Cannot convert argument of type ${l.$$.ptrType.name} to parameter type ${this.name}`);
      var p = l.$$.ptrType.registeredClass, g = Le(l.$$.ptr, p, this.registeredClass);
      return g;
    }
    function Re(c) {
      return this.fromWireType(W[c >> 2]);
    }
    var In = () => {
      Object.assign(_e.prototype, { getPointee(c) {
        return this.rawGetPointee && (c = this.rawGetPointee(c)), c;
      }, destructor(c) {
        var l;
        (l = this.rawDestructor) == null || l.call(this, c);
      }, argPackAdvance: J, readValueFromPointer: Re, fromWireType: fn });
    };
    function _e(c, l, p, g, b, P, C, v, T, R, M) {
      this.name = c, this.registeredClass = l, this.isReference = p, this.isConst = g, this.isSmartPointer = b, this.pointeeType = P, this.sharingPolicy = C, this.rawGetPointee = v, this.rawConstructor = T, this.rawShare = R, this.rawDestructor = M, !b && l.baseClass === void 0 ? g ? (this.toWireType = On, this.destructorFunction = null) : (this.toWireType = Pn, this.destructorFunction = null) : this.toWireType = wn;
    }
    var Wt = (c, l, p) => {
      t.hasOwnProperty(c) || De("Replacing nonexistent public symbol"), t[c].overloadTable !== void 0 && p !== void 0 ? t[c].overloadTable[p] = l : (t[c] = l, t[c].argCount = p);
    }, jn = (c, l, p) => {
      c = c.replace(/p/g, "i");
      var g = t["dynCall_" + c];
      return g(l, ...p);
    }, Sn = (c, l, p = []) => {
      var g = jn(c, l, p);
      return g;
    }, Cn = (c, l) => (...p) => Sn(c, l, p), ne = (c, l) => {
      c = z(c);
      function p() {
        return Cn(c, l);
      }
      var g = p();
      return typeof g != "function" && x(`unknown function pointer with signature ${c}: ${l}`), g;
    }, Tn = (c, l) => {
      var p = Me(l, function(g) {
        this.name = l, this.message = g;
        var b = new Error(g).stack;
        b !== void 0 && (this.stack = this.toString() + `
` + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return p.prototype = Object.create(c.prototype), p.prototype.constructor = p, p.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, p;
    }, zt, Vt = (c) => {
      var l = So(c), p = z(l);
      return ee(l), p;
    }, je = (c, l) => {
      var p = [], g = {};
      function b(P) {
        if (!g[P] && !ue[P]) {
          if (ke[P]) {
            ke[P].forEach(b);
            return;
          }
          p.push(P), g[P] = !0;
        }
      }
      throw l.forEach(b), new zt(`${c}: ` + p.map(Vt).join([", "]));
    }, kn = (c, l, p, g, b, P, C, v, T, R, M, N, V) => {
      M = z(M), P = ne(b, P), v && (v = ne(C, v)), R && (R = ne(T, R)), V = ne(N, V);
      var Z = bn(M);
      Xe(Z, function() {
        je(`Cannot construct ${M} due to unbound types`, [g]);
      }), he([c, l, p], g ? [g] : [], (K) => {
        var Qt;
        K = K[0];
        var ie, B;
        g ? (ie = K.registeredClass, B = ie.instancePrototype) : B = Ee.prototype;
        var q = Me(M, function(...it) {
          if (Object.getPrototypeOf(this) !== ae)
            throw new ye("Use 'new' to construct " + M);
          if (U.constructor_body === void 0)
            throw new ye(M + " has no accessible constructor");
          var er = U.constructor_body[it.length];
          if (er === void 0)
            throw new ye(`Tried to invoke ctor of ${M} with invalid number of parameters (${it.length}) - expected (${Object.keys(U.constructor_body).toString()}) parameters instead!`);
          return er.apply(this, it);
        }), ae = Object.create(B, { constructor: { value: q } });
        q.prototype = ae;
        var U = new vn(M, q, ae, V, ie, P, v, R);
        U.baseClass && ((Qt = U.baseClass).__derivedClasses ?? (Qt.__derivedClasses = []), U.baseClass.__derivedClasses.push(U));
        var se = new _e(M, U, !0, !1, !1), xe = new _e(M + "*", U, !1, !1, !1), Xt = new _e(M + " const*", U, !1, !0, !1);
        return Nt[c] = { pointerType: xe, constPointerType: Xt }, Wt(Z, q), [se, xe, Xt];
      });
    }, Ut = (c, l) => {
      for (var p = [], g = 0; g < c; g++)
        p.push(W[l + g * 4 >> 2]);
      return p;
    }, Qe = (c) => {
      for (; c.length; ) {
        var l = c.pop(), p = c.pop();
        p(l);
      }
    };
    function Dn(c) {
      for (var l = 1; l < c.length; ++l)
        if (c[l] !== null && c[l].destructorFunction === void 0)
          return !0;
      return !1;
    }
    var Fe = (c) => {
      try {
        return c();
      } catch (l) {
        Ce(l);
      }
    }, Gt = (c) => {
      if (c instanceof Ct || c == "unwind")
        return Q;
      S(1, c);
    }, $t = 0, Bt = () => At || $t > 0, Ht = (c) => {
      var l;
      Q = c, Bt() || ((l = t.onExit) == null || l.call(t, c), _ = !0), S(c, new Ct(c));
    }, An = (c, l) => {
      Q = c, Ht(c);
    }, En = An, Mn = () => {
      if (!Bt())
        try {
          En(Q);
        } catch (c) {
          Gt(c);
        }
    }, Yt = (c) => {
      if (!_)
        try {
          c(), Mn();
        } catch (l) {
          Gt(l);
        }
    }, A = { instrumentWasmImports(c) {
      var l = /^(__asyncjs__.*)$/;
      for (let [p, g] of Object.entries(c))
        typeof g == "function" && (g.isAsync || l.test(p));
    }, instrumentWasmExports(c) {
      var l = {};
      for (let [p, g] of Object.entries(c))
        typeof g == "function" ? l[p] = (...b) => {
          A.exportCallStack.push(p);
          try {
            return g(...b);
          } finally {
            _ || (A.exportCallStack.pop(), A.maybeStopUnwind());
          }
        } : l[p] = g;
      return l;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(c) {
      var l = A.callStackNameToId[c];
      return l === void 0 && (l = A.callStackId++, A.callStackNameToId[c] = l, A.callStackIdToName[l] = c), l;
    }, maybeStopUnwind() {
      A.currData && A.state === A.State.Unwinding && A.exportCallStack.length === 0 && (A.state = A.State.Normal, Fe(ko), typeof Fibers < "u" && Fibers.trampoline());
    }, whenDone() {
      return new Promise((c, l) => {
        A.asyncPromiseHandlers = { resolve: c, reject: l };
      });
    }, allocateData() {
      var c = nt(12 + A.StackSize);
      return A.setDataHeader(c, c + 12, A.StackSize), A.setDataRewindFunc(c), c;
    }, setDataHeader(c, l, p) {
      W[c >> 2] = l, W[c + 4 >> 2] = l + p;
    }, setDataRewindFunc(c) {
      var l = A.exportCallStack[0], p = A.getCallStackId(l);
      re[c + 8 >> 2] = p;
    }, getDataRewindFuncName(c) {
      var l = re[c + 8 >> 2], p = A.callStackIdToName[l];
      return p;
    }, getDataRewindFunc(c) {
      var l = F[c];
      return l;
    }, doRewind(c) {
      var l = A.getDataRewindFuncName(c), p = A.getDataRewindFunc(l);
      return p();
    }, handleSleep(c) {
      if (!_) {
        if (A.state === A.State.Normal) {
          var l = !1, p = !1;
          c((g = 0) => {
            if (!_ && (A.handleSleepReturnValue = g, l = !0, !!p)) {
              A.state = A.State.Rewinding, Fe(() => Do(A.currData)), typeof MainLoop < "u" && MainLoop.func && MainLoop.resume();
              var b, P = !1;
              try {
                b = A.doRewind(A.currData);
              } catch (T) {
                b = T, P = !0;
              }
              var C = !1;
              if (!A.currData) {
                var v = A.asyncPromiseHandlers;
                v && (A.asyncPromiseHandlers = null, (P ? v.reject : v.resolve)(b), C = !0);
              }
              if (P && !C)
                throw b;
            }
          }), p = !0, l || (A.state = A.State.Unwinding, A.currData = A.allocateData(), typeof MainLoop < "u" && MainLoop.func && MainLoop.pause(), Fe(() => To(A.currData)));
        } else A.state === A.State.Rewinding ? (A.state = A.State.Normal, Fe(Ao), ee(A.currData), A.currData = null, A.sleepCallbacks.forEach(Yt)) : Ce(`invalid state: ${A.state}`);
        return A.handleSleepReturnValue;
      }
    }, handleAsync(c) {
      return A.handleSleep((l) => {
        c().then(l);
      });
    } };
    function Jt(c, l, p, g, b, P) {
      var C = l.length;
      C < 2 && x("argTypes array size mismatch! Must at least get return value and 'this' types!"), l[1];
      var v = Dn(l), T = l[0].name !== "void", R = C - 2, M = new Array(R), N = [], V = [], Z = function(...K) {
        V.length = 0;
        var ie;
        N.length = 1, N[0] = b;
        for (var B = 0; B < R; ++B)
          M[B] = l[B + 2].toWireType(V, K[B]), N.push(M[B]);
        var q = g(...N);
        function ae(U) {
          if (v)
            Qe(V);
          else
            for (var se = 2; se < l.length; se++) {
              var xe = se === 1 ? ie : M[se - 2];
              l[se].destructorFunction !== null && l[se].destructorFunction(xe);
            }
          if (T)
            return l[0].fromWireType(U);
        }
        return A.currData ? A.whenDone().then(ae) : ae(q);
      };
      return Me(c, Z);
    }
    var Ln = (c, l, p, g, b, P) => {
      var C = Ut(l, p);
      b = ne(g, b), he([], [c], (v) => {
        v = v[0];
        var T = `constructor ${v.name}`;
        if (v.registeredClass.constructor_body === void 0 && (v.registeredClass.constructor_body = []), v.registeredClass.constructor_body[l - 1] !== void 0)
          throw new ye(`Cannot register multiple constructors with identical number of parameters (${l - 1}) for class '${v.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return v.registeredClass.constructor_body[l - 1] = () => {
          je(`Cannot construct ${v.name} due to unbound types`, C);
        }, he([], C, (R) => (R.splice(1, 0, null), v.registeredClass.constructor_body[l - 1] = Jt(T, R, null, b, P), [])), [];
      });
    }, Zt = (c, l, p) => (c instanceof Object || x(`${p} with invalid "this": ${c}`), c instanceof l.registeredClass.constructor || x(`${p} incompatible with "this" of type ${c.constructor.name}`), c.$$.ptr || x(`cannot call emscripten binding method ${p} on deleted object`), Le(c.$$.ptr, c.$$.ptrType.registeredClass, l.registeredClass)), Rn = (c, l, p, g, b, P, C, v, T, R) => {
      l = z(l), b = ne(g, b), he([], [c], (M) => {
        M = M[0];
        var N = `${M.name}.${l}`, V = { get() {
          je(`Cannot access ${N} due to unbound types`, [p, C]);
        }, enumerable: !0, configurable: !0 };
        return T ? V.set = () => je(`Cannot access ${N} due to unbound types`, [p, C]) : V.set = (Z) => x(N + " is a read-only property"), Object.defineProperty(M.registeredClass.instancePrototype, l, V), he([], T ? [p, C] : [p], (Z) => {
          var K = Z[0], ie = { get() {
            var q = Zt(this, M, N + " getter");
            return K.fromWireType(b(P, q));
          }, enumerable: !0 };
          if (T) {
            T = ne(v, T);
            var B = Z[1];
            ie.set = function(q) {
              var ae = Zt(this, M, N + " setter"), U = [];
              T(R, ae, B.toWireType(U, q)), Qe(U);
            };
          }
          return Object.defineProperty(M.registeredClass.instancePrototype, l, ie), [];
        }), [];
      });
    }, et = [], oe = [], tt = (c) => {
      c > 9 && --oe[c + 1] === 0 && (oe[c] = void 0, et.push(c));
    }, _n = () => oe.length / 2 - 5 - et.length, Fn = () => {
      oe.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), t.count_emval_handles = _n;
    }, Y = { toValue: (c) => (c || x("Cannot use deleted val. handle = " + c), oe[c]), toHandle: (c) => {
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
          const l = et.pop() || oe.length;
          return oe[l] = c, oe[l + 1] = 1, l;
        }
      }
    } }, xn = { name: "emscripten::val", fromWireType: (c) => {
      var l = Y.toValue(c);
      return tt(c), l;
    }, toWireType: (c, l) => Y.toHandle(l), argPackAdvance: J, readValueFromPointer: Re, destructorFunction: null }, Nn = (c) => H(c, xn), Wn = (c, l, p) => {
      switch (l) {
        case 1:
          return p ? function(g) {
            return this.fromWireType(te[g]);
          } : function(g) {
            return this.fromWireType($[g]);
          };
        case 2:
          return p ? function(g) {
            return this.fromWireType(me[g >> 1]);
          } : function(g) {
            return this.fromWireType(we[g >> 1]);
          };
        case 4:
          return p ? function(g) {
            return this.fromWireType(re[g >> 2]);
          } : function(g) {
            return this.fromWireType(W[g >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${l}): ${c}`);
      }
    }, zn = (c, l, p, g) => {
      l = z(l);
      function b() {
      }
      b.values = {}, H(c, { name: l, constructor: b, fromWireType: function(P) {
        return this.constructor.values[P];
      }, toWireType: (P, C) => C.value, argPackAdvance: J, readValueFromPointer: Wn(l, p, g), destructorFunction: null }), Xe(l, b);
    }, rt = (c, l) => {
      var p = ue[c];
      return p === void 0 && x(`${l} has unknown type ${Vt(c)}`), p;
    }, Vn = (c, l, p) => {
      var g = rt(c, "enum");
      l = z(l);
      var b = g.constructor, P = Object.create(g.constructor.prototype, { value: { value: p }, constructor: { value: Me(`${g.name}_${l}`, function() {
      }) } });
      b.values[p] = P, b[l] = P;
    }, Un = (c, l) => {
      switch (l) {
        case 4:
          return function(p) {
            return this.fromWireType(Ot[p >> 2]);
          };
        case 8:
          return function(p) {
            return this.fromWireType(It[p >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${l}): ${c}`);
      }
    }, Gn = (c, l, p) => {
      l = z(l), H(c, { name: l, fromWireType: (g) => g, toWireType: (g, b) => b, argPackAdvance: J, readValueFromPointer: Un(l, p), destructorFunction: null });
    }, $n = (c) => {
      c = c.trim();
      const l = c.indexOf("(");
      return l === -1 ? c : c.slice(0, l);
    }, Bn = (c, l, p, g, b, P, C, v) => {
      var T = Ut(l, p);
      c = z(c), c = $n(c), b = ne(g, b), Xe(c, function() {
        je(`Cannot call ${c} due to unbound types`, T);
      }, l - 1), he([], T, (R) => {
        var M = [R[0], null].concat(R.slice(1));
        return Wt(c, Jt(c, M, null, b, P), l - 1), [];
      });
    }, Hn = (c, l, p, g, b) => {
      l = z(l);
      var P = (M) => M;
      if (g === 0) {
        var C = 32 - 8 * p;
        P = (M) => M << C >>> C;
      }
      var v = l.includes("unsigned"), T = (M, N) => {
      }, R;
      v ? R = function(M, N) {
        return T(N, this.name), N >>> 0;
      } : R = function(M, N) {
        return T(N, this.name), N;
      }, H(c, { name: l, fromWireType: P, toWireType: R, argPackAdvance: J, readValueFromPointer: Rt(l, p, g !== 0), destructorFunction: null });
    }, Yn = (c, l, p) => {
      var g = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], b = g[l];
      function P(C) {
        var v = W[C >> 2], T = W[C + 4 >> 2];
        return new b(te.buffer, T, v);
      }
      p = z(p), H(c, { name: p, fromWireType: P, argPackAdvance: J, readValueFromPointer: P }, { ignoreDuplicateRegistrations: !0 });
    }, Jn = (c, l, p, g) => {
      if (!(g > 0)) return 0;
      for (var b = p, P = p + g - 1, C = 0; C < c.length; ++C) {
        var v = c.charCodeAt(C);
        if (v >= 55296 && v <= 57343) {
          var T = c.charCodeAt(++C);
          v = 65536 + ((v & 1023) << 10) | T & 1023;
        }
        if (v <= 127) {
          if (p >= P) break;
          l[p++] = v;
        } else if (v <= 2047) {
          if (p + 1 >= P) break;
          l[p++] = 192 | v >> 6, l[p++] = 128 | v & 63;
        } else if (v <= 65535) {
          if (p + 2 >= P) break;
          l[p++] = 224 | v >> 12, l[p++] = 128 | v >> 6 & 63, l[p++] = 128 | v & 63;
        } else {
          if (p + 3 >= P) break;
          l[p++] = 240 | v >> 18, l[p++] = 128 | v >> 12 & 63, l[p++] = 128 | v >> 6 & 63, l[p++] = 128 | v & 63;
        }
      }
      return l[p] = 0, p - b;
    }, Zn = (c, l, p) => Jn(c, $, l, p), Kn = (c) => {
      for (var l = 0, p = 0; p < c.length; ++p) {
        var g = c.charCodeAt(p);
        g <= 127 ? l++ : g <= 2047 ? l += 2 : g >= 55296 && g <= 57343 ? (l += 4, ++p) : l += 3;
      }
      return l;
    }, Kt = typeof TextDecoder < "u" ? new TextDecoder() : void 0, qn = (c, l = 0, p = NaN) => {
      for (var g = l + p, b = l; c[b] && !(b >= g); ) ++b;
      if (b - l > 16 && c.buffer && Kt)
        return Kt.decode(c.subarray(l, b));
      for (var P = ""; l < b; ) {
        var C = c[l++];
        if (!(C & 128)) {
          P += String.fromCharCode(C);
          continue;
        }
        var v = c[l++] & 63;
        if ((C & 224) == 192) {
          P += String.fromCharCode((C & 31) << 6 | v);
          continue;
        }
        var T = c[l++] & 63;
        if ((C & 240) == 224 ? C = (C & 15) << 12 | v << 6 | T : C = (C & 7) << 18 | v << 12 | T << 6 | c[l++] & 63, C < 65536)
          P += String.fromCharCode(C);
        else {
          var R = C - 65536;
          P += String.fromCharCode(55296 | R >> 10, 56320 | R & 1023);
        }
      }
      return P;
    }, Xn = (c, l) => c ? qn($, c, l) : "", Qn = (c, l) => {
      l = z(l), H(c, { name: l, fromWireType(p) {
        for (var g = W[p >> 2], b = p + 4, P, C, v = b, C = 0; C <= g; ++C) {
          var T = b + C;
          if (C == g || $[T] == 0) {
            var R = T - v, M = Xn(v, R);
            P === void 0 ? P = M : (P += "\0", P += M), v = T + 1;
          }
        }
        return ee(p), P;
      }, toWireType(p, g) {
        g instanceof ArrayBuffer && (g = new Uint8Array(g));
        var b, P = typeof g == "string";
        P || g instanceof Uint8Array || g instanceof Uint8ClampedArray || g instanceof Int8Array || x("Cannot pass non-string to std::string"), P ? b = Kn(g) : b = g.length;
        var C = nt(4 + b + 1), v = C + 4;
        if (W[C >> 2] = b, P)
          Zn(g, v, b + 1);
        else if (P)
          for (var T = 0; T < b; ++T) {
            var R = g.charCodeAt(T);
            R > 255 && (ee(C), x("String has UTF-16 code units that do not fit in 8 bits")), $[v + T] = R;
          }
        else
          for (var T = 0; T < b; ++T)
            $[v + T] = g[T];
        return p !== null && p.push(ee, C), C;
      }, argPackAdvance: J, readValueFromPointer: Re, destructorFunction(p) {
        ee(p);
      } });
    }, qt = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, eo = (c, l) => {
      for (var p = c, g = p >> 1, b = g + l / 2; !(g >= b) && we[g]; ) ++g;
      if (p = g << 1, p - c > 32 && qt) return qt.decode($.subarray(c, p));
      for (var P = "", C = 0; !(C >= l / 2); ++C) {
        var v = me[c + C * 2 >> 1];
        if (v == 0) break;
        P += String.fromCharCode(v);
      }
      return P;
    }, to = (c, l, p) => {
      if (p ?? (p = 2147483647), p < 2) return 0;
      p -= 2;
      for (var g = l, b = p < c.length * 2 ? p / 2 : c.length, P = 0; P < b; ++P) {
        var C = c.charCodeAt(P);
        me[l >> 1] = C, l += 2;
      }
      return me[l >> 1] = 0, l - g;
    }, ro = (c) => c.length * 2, no = (c, l) => {
      for (var p = 0, g = ""; !(p >= l / 4); ) {
        var b = re[c + p * 4 >> 2];
        if (b == 0) break;
        if (++p, b >= 65536) {
          var P = b - 65536;
          g += String.fromCharCode(55296 | P >> 10, 56320 | P & 1023);
        } else
          g += String.fromCharCode(b);
      }
      return g;
    }, oo = (c, l, p) => {
      if (p ?? (p = 2147483647), p < 4) return 0;
      for (var g = l, b = g + p - 4, P = 0; P < c.length; ++P) {
        var C = c.charCodeAt(P);
        if (C >= 55296 && C <= 57343) {
          var v = c.charCodeAt(++P);
          C = 65536 + ((C & 1023) << 10) | v & 1023;
        }
        if (re[l >> 2] = C, l += 4, l + 4 > b) break;
      }
      return re[l >> 2] = 0, l - g;
    }, io = (c) => {
      for (var l = 0, p = 0; p < c.length; ++p) {
        var g = c.charCodeAt(p);
        g >= 55296 && g <= 57343 && ++p, l += 4;
      }
      return l;
    }, ao = (c, l, p) => {
      p = z(p);
      var g, b, P, C;
      l === 2 ? (g = eo, b = to, C = ro, P = (v) => we[v >> 1]) : l === 4 && (g = no, b = oo, C = io, P = (v) => W[v >> 2]), H(c, { name: p, fromWireType: (v) => {
        for (var T = W[v >> 2], R, M = v + 4, N = 0; N <= T; ++N) {
          var V = v + 4 + N * l;
          if (N == T || P(V) == 0) {
            var Z = V - M, K = g(M, Z);
            R === void 0 ? R = K : (R += "\0", R += K), M = V + l;
          }
        }
        return ee(v), R;
      }, toWireType: (v, T) => {
        typeof T != "string" && x(`Cannot pass non-string to C++ string type ${p}`);
        var R = C(T), M = nt(4 + R + l);
        return W[M >> 2] = R / l, b(T, M + 4, R + l), v !== null && v.push(ee, M), M;
      }, argPackAdvance: J, readValueFromPointer: Re, destructorFunction(v) {
        ee(v);
      } });
    }, so = (c, l) => {
      l = z(l), H(c, { isVoid: !0, name: l, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (p, g) => {
      } });
    }, lo = () => {
      At = !1, $t = 0;
    }, co = (c, l, p) => {
      var g = [], b = c.toWireType(g, p);
      return g.length && (W[l >> 2] = Y.toHandle(g)), b;
    }, uo = (c, l, p) => (c = Y.toValue(c), l = rt(l, "emval::as"), co(l, p, c)), po = (c, l) => (c = Y.toValue(c), l = Y.toValue(l), Y.toHandle(c[l])), fo = {}, mo = (c) => {
      var l = fo[c];
      return l === void 0 ? z(c) : l;
    }, go = (c) => Y.toHandle(mo(c)), yo = (c) => {
      var l = Y.toValue(c);
      Qe(l), tt(c);
    }, ho = (c, l) => {
      c = rt(c, "_emval_take_value");
      var p = c.readValueFromPointer(l);
      return Y.toHandle(p);
    }, Se = {}, bo = () => performance.now(), vo = (c, l) => {
      if (Se[c] && (clearTimeout(Se[c].id), delete Se[c]), !l) return 0;
      var p = setTimeout(() => {
        delete Se[c], Yt(() => Co(c, bo()));
      }, l);
      return Se[c] = { id: p, timeout_ms: l }, 0;
    }, Oo = () => 2147483648, wo = (c, l) => Math.ceil(c / l) * l, Po = (c) => {
      var l = k.buffer, p = (c - l.byteLength + 65535) / 65536 | 0;
      try {
        return k.grow(p), St(), 1;
      } catch {
      }
    }, Io = (c) => {
      var l = $.length;
      c >>>= 0;
      var p = Oo();
      if (c > p)
        return !1;
      for (var g = 1; g <= 4; g *= 2) {
        var b = l * (1 + 0.2 / g);
        b = Math.min(b, c + 100663296);
        var P = Math.min(p, wo(Math.max(c, b), 65536)), C = Po(P);
        if (C)
          return !0;
      }
      return !1;
    };
    nn(), ye = t.BindingError = class extends Error {
      constructor(l) {
        super(l), this.name = "BindingError";
      }
    }, Lt = t.InternalError = class extends Error {
      constructor(l) {
        super(l), this.name = "InternalError";
      }
    }, mn(), In(), zt = t.UnboundTypeError = Tn(Error, "UnboundTypeError"), Fn();
    var jo = { g: tn, s: rn, n: an, w: sn, f: kn, d: Ln, a: Rn, u: Nn, l: zn, h: Vn, m: Gn, b: Bn, e: Hn, c: Yn, v: Qn, i: ao, x: so, q: lo, j: uo, y: tt, k: po, o: go, A: yo, z: ho, r: vo, t: Io, p: Ht }, F = await qr();
    F.C;
    var So = F.D, nt = t._malloc = F.E, ee = t._free = F.F, Co = F.G;
    t.dynCall_v = F.I, t.dynCall_ii = F.J, t.dynCall_vi = F.K, t.dynCall_i = F.L, t.dynCall_iii = F.M, t.dynCall_viii = F.N, t.dynCall_fii = F.O, t.dynCall_viif = F.P, t.dynCall_viiii = F.Q, t.dynCall_viiiiii = F.R, t.dynCall_iiiiii = F.S, t.dynCall_viiiii = F.T, t.dynCall_iiiiiii = F.U, t.dynCall_iiiiiiii = F.V, t.dynCall_viiiiiii = F.W, t.dynCall_viiiiiiiiidi = F.X, t.dynCall_viiiiiiiidi = F.Y, t.dynCall_viiiiiiiiii = F.Z, t.dynCall_viiiiiiiii = F._, t.dynCall_viiiiiiii = F.$, t.dynCall_iiiii = F.aa, t.dynCall_iiii = F.ba;
    var To = F.ca, ko = F.da, Do = F.ea, Ao = F.fa;
    function ot() {
      if (ce > 0) {
        Pe = ot;
        return;
      }
      if (zr(), ce > 0) {
        Pe = ot;
        return;
      }
      function c() {
        var l;
        t.calledRun = !0, !_ && (Vr(), e(t), (l = t.onRuntimeInitialized) == null || l.call(t), Ur());
      }
      t.setStatus ? (t.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => t.setStatus(""), 1), c();
      }, 1)) : c();
    }
    if (t.preInit)
      for (typeof t.preInit == "function" && (t.preInit = [t.preInit]); t.preInit.length > 0; )
        t.preInit.pop()();
    return ot(), r = o, r;
  };
})();
let gi = class extends qo {
  getSamWasmFilePath(s, r) {
    return `${s}/palm/wasm/${r}`;
  }
  fetchSamModule(s) {
    return mi(s);
  }
  mapHandValue(s, r) {
    if (!(s.value in r))
      throw new G(`Invalid hand value: ${s.value}. Expected 0 or 1.`);
    return r[s.value];
  }
  parseRawData({ rawDetectedPalm: s, rawPalmAttributes: r }) {
    const { brightness: t, sharpness: e } = s.params, n = {
      confidence: s.confidence / Ue,
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
      brightness: t / Ue,
      sharpness: e / Ue
    };
    return {
      ...n,
      smallestEdge: Xo(n),
      handOrientation: this.mapHandValue(r.handOrientation, Zo),
      handPosition: this.mapHandValue(r.handPosition, Jo),
      quality: r.quality / Ue
    };
  }
  async detectPalmWithImageParameters(s, r) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    return this.samWasmModule.detectPalmWithImageParameters(
      s.width,
      s.height,
      r.bgr0ImagePointer,
      0,
      // palmDetectionOptions
      0,
      // paramWidth should be 0 (default value)
      0
      // paramHeight should be 0 (default value)
    );
  }
  async detectPalmAttributes(s, r, t) {
    if (!this.samWasmModule)
      throw new G("SAM WASM module is not initialized");
    const e = [
      r.x0,
      r.y0,
      r.x1,
      r.y1,
      r.x2,
      r.y2,
      r.x3,
      r.y3
    ];
    return this.samWasmModule.detectPalmAttributes(
      s.width,
      s.height,
      t.bgr0ImagePointer,
      0,
      // options
      e
    );
  }
  async detect(s, r) {
    const t = this.convertToSamColorImage(s, r), e = await this.detectPalmWithImageParameters(r, t), n = await this.detectPalmAttributes(
      r,
      e,
      t
    );
    return t.free(), this.parseRawData({ rawDetectedPalm: e, rawPalmAttributes: n });
  }
  async getOptimalRegionForCompressionDetection(s, r, t) {
    return super.getOptimalRegionForCompressionDetectionFromDetectionCorners(
      s,
      r,
      t
    );
  }
};
class yi extends gi {
}
vt(yi);
