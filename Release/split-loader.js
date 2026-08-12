(function(){
  'use strict';

  var CDN_BASE = 'https://cdn.jsdelivr.net/gh/StaticQuasar931/AdVenture-Capitalist@main/';
  var LOCAL_BASE = new URL('../', document.currentScript.src).href;
  var localHost = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  var ASSET_BASE = /^https?:\/\//i.test(location.href) && !localHost ? CDN_BASE : LOCAL_BASE;

  window.StaticQuasarAssetBase = ASSET_BASE;

  function normalize(path){
    return String(path || '').replace(/^\.\//, '').replace(/^\//, '');
  }

  function getPartUrls(path, count){
    var urls = [];
    for (var i = 0; i < count; i++) {
      urls.push(ASSET_BASE + normalize(path) + '.part' + String(i).padStart(2, '0'));
    }
    return urls;
  }

  function setStatus(message){
    if (window.Module && typeof window.Module.setStatus === 'function') {
      window.Module.setStatus(message);
    }
  }

  function fetchArrayBuffer(url, label, loadedCount, totalCount){
    return fetch(url, { cache: 'force-cache' }).then(function(response){
      if (!response.ok) throw new Error('Unable to load ' + label + ': ' + response.status + ' ' + url);
      setStatus('Downloading ' + label + '... (' + loadedCount + '/' + totalCount + ')');
      return response.arrayBuffer();
    });
  }

  function fetchText(url, label, loadedCount, totalCount){
    return fetch(url, { cache: 'force-cache' }).then(function(response){
      if (!response.ok) throw new Error('Unable to load ' + label + ': ' + response.status + ' ' + url);
      setStatus('Downloading ' + label + '... (' + loadedCount + '/' + totalCount + ')');
      return response.text();
    });
  }

  window.StaticQuasarLoadSplitData = function(path, count){
    var urls = getPartUrls(path, count);
    var chain = Promise.resolve();
    var buffers = [];
    urls.forEach(function(url, index){
      chain = chain.then(function(){
        return fetchArrayBuffer(url, 'data', index + 1, urls.length).then(function(buffer){
          buffers.push(buffer);
        });
      });
    });
    return chain.then(function(){
      return new Blob(buffers, { type: 'application/octet-stream' }).arrayBuffer();
    });
  };

  window.StaticQuasarLoadSplitScript = function(path, count){
    var urls = getPartUrls(path, count);
    var chain = Promise.resolve();
    var chunks = [];
    urls.forEach(function(url, index){
      chain = chain.then(function(){
        return fetchText(url, 'code', index + 1, urls.length).then(function(text){
          chunks.push(text);
        });
      });
    });
    return chain.then(function(){
      return new Promise(function(resolve, reject){
        var blob = new Blob(chunks, { type: 'text/javascript' });
        var src = URL.createObjectURL(blob);
        var script = document.createElement('script');
        script.src = src;
        script.onload = function(){ URL.revokeObjectURL(src); resolve(); };
        script.onerror = function(){ URL.revokeObjectURL(src); reject(new Error('Unable to execute ' + path)); };
        document.body.appendChild(script);
      });
    });
  };
})();


