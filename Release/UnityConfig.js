function CompatibilityCheck(){
  var hasWebGL = (function(){
    if (!window.WebGLRenderingContext) return false;
    var canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  })();
  if (!hasWebGL) console.log('WebGL support was not detected. The game may not start in this browser.');
}
CompatibilityCheck();

var didShowErrorMessage = false;
if (typeof window.onerror !== 'function') {
  window.onerror = function UnityErrorHandler(err, url, line){
    console.log('Unity runtime error:', err, url, line);
    if (didShowErrorMessage) return;
    didShowErrorMessage = true;
    if (window.Module && typeof window.Module.setStatus === 'function') {
      window.Module.setStatus('Runtime error. Check the console.');
    }
  };
}

function SetFullscreen(fullscreen){
  if (typeof JSEvents === 'undefined') {
    console.log('Player not loaded yet.');
    return;
  }
  var tmp = JSEvents.canPerformEventHandlerRequests;
  JSEvents.canPerformEventHandlerRequests = function(){ return 1; };
  Module.cwrap('SetFullscreen', 'void', ['number'])(fullscreen);
  JSEvents.canPerformEventHandlerRequests = tmp;
}
