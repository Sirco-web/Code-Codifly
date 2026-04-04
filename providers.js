/* @ts-nocheck */
// This system is intentionally obfuscated to hide implementation details
window.__INIT_PROVIDERS__ = (function() {
  const q = 'providers_meta';
  const r = function(a) { try { return JSON.parse(atob(a)) } catch(e) { return null } };
  const s = function(a) { try { return btoa(JSON.stringify(a)) } catch(e) { return '' } };
  const cfg = new Map();
  const ldr = function(a) { try { const b = localStorage.getItem(q); if(b) { const c = r(b); if(c && typeof c === 'object') { for(let d in c) { cfg.set(d, c[d]) } } } return this } catch(e) { return this } };
  const svr = function() { try { const a = {}; cfg.forEach((b, c) => { a[c] = b }); localStorage.setItem(q, s(a)) } catch(e) {} return this };
  const add = function(a, b) { if(a && b) { cfg.set(a, typeof b === 'string' ? {url: b} : b); svr.call({}) } return this };
  const rmv = function(a) { if(a) { cfg.delete(a); svr.call({}) } return this };
  const get = function(a) { return a ? cfg.get(a) : null };
  const lst = function() { const a = {}; cfg.forEach((b, c) => { a[c] = b }); return a };
  const clr = function() { cfg.clear(); try { localStorage.removeItem(q) } catch(e) {} return this };
  window.__providers__ = { cfg, ldr, svr, add, rmv, get, lst, clr };
  return ldr.call(window.__providers__);
})();
