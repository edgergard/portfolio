/**
 * Field diagnostics, active only with `?debug` in the URL (phones have no devtools). Runs in
 * <head> so it sees every WebGL draw, context loss and error from the first frame; the overlay
 * (DebugOverlay) reads window.__dbg once a second. A no-op on normal visits.
 */
export const DEBUG_SCRIPT = `(function(){try{
if(!/[?&]debug(=|&|$)/.test(location.search))return;
var d=window.__dbg={errors:[],lost:[],draws:new Map(),ids:0};
var tag=function(c){if(!c.__dbgId)c.__dbgId=++d.ids;return c;};
[window.WebGLRenderingContext,window.WebGL2RenderingContext].forEach(function(C){if(!C)return;var P=C.prototype;
['drawElements','drawArrays'].forEach(function(m){var o=P[m];P[m]=function(){var c=tag(this.canvas);d.draws.set(c,(d.draws.get(c)||0)+1);return o.apply(this,arguments);};});});
document.addEventListener('webglcontextlost',function(e){d.lost.push(Math.round(performance.now()/100)/10+'s');},true);
addEventListener('error',function(e){d.errors.push(String(e.message||e.type).slice(0,140));});
addEventListener('unhandledrejection',function(e){d.errors.push('rejection: '+String(e.reason&&e.reason.message||e.reason).slice(0,140));});
var w=console.warn,er=console.error;
console.warn=function(){d.errors.push('warn: '+[].slice.call(arguments).join(' ').slice(0,140));return w.apply(console,arguments);};
console.error=function(){d.errors.push('error: '+[].slice.call(arguments).join(' ').slice(0,140));return er.apply(console,arguments);};
}catch(e){}})();`;
