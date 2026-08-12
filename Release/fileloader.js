var Module;
if (typeof Module === 'undefined') {
  Module = eval('(function(){ try { return Module || {}; } catch(e) { return {}; } })()');
}
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;

(function(){
  var PACKAGE_NAME = 'webgl.data';
  var REMOTE_PACKAGE_SIZE = 94384055;
  var fetched = null;
  var fetchedCallback = null;

  function reportProgress(loaded, total){
    if (Module.setStatus) Module.setStatus('Downloading data... (' + loaded + '/' + total + ')');
  }

  function handleError(error){
    console.error('package error:', error);
    if (Module.setStatus) Module.setStatus('Data load failed. Check the console.');
  }

  function fetchRemotePackage(callback){
    if (typeof window.StaticQuasarLoadSplitData === 'function') {
      window.StaticQuasarLoadSplitData('Release/webgl.data', 6).then(callback).catch(handleError);
      return;
    }

    var xhr = new XMLHttpRequest();
    var packageName = (Module.filePackagePrefixURL || '') + PACKAGE_NAME;
    xhr.open('GET', packageName, true);
    xhr.responseType = 'arraybuffer';
    xhr.onprogress = function(event){
      reportProgress(event.loaded || 0, event.total || REMOTE_PACKAGE_SIZE);
    };
    xhr.onload = function(){ callback(xhr.response); };
    xhr.onerror = handleError;
    xhr.send(null);
  }

  fetchRemotePackage(function(data){
    if (fetchedCallback) {
      fetchedCallback(data);
      fetchedCallback = null;
    } else {
      fetched = data;
    }
  });

  function runWithFS(){
    function assert(check, msg){ if (!check) throw msg + new Error().stack; }

    Module.FS_createPath('/', 'Il2CppData', true, true);
    Module.FS_createPath('/Il2CppData', 'Metadata', true, true);
    Module.FS_createPath('/', 'Resources', true, true);

    function DataRequest(start, end, crunched, audio){
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }

    DataRequest.prototype = {
      requests: {},
      open: function(mode, name){
        this.name = name;
        this.requests[name] = this;
        Module.addRunDependency('fp ' + this.name);
      },
      send: function(){},
      onload: function(){
        var byteArray = this.byteArray.subarray(this.start, this.end);
        this.finish(byteArray);
      },
      finish: function(byteArray){
        var that = this;
        Module.FS_createPreloadedFile(this.name, null, byteArray, true, true, function(){
          Module.removeRunDependency('fp ' + that.name);
        }, function(){
          if (that.audio) {
            Module.removeRunDependency('fp ' + that.name);
          } else {
            Module.printErr('Preloading file ' + that.name + ' failed');
          }
        }, false, true);
        this.requests[this.name] = null;
      }
    };

    new DataRequest(0,450096,0,0).open('GET','/level0');
    new DataRequest(450096,881888,0,0).open('GET','/level1');
    new DataRequest(881888,946172,0,0).open('GET','/mainData');
    new DataRequest(946172,959387,0,0).open('GET','/methods_pointedto_by_uievents.xml');
    new DataRequest(959387,1144731,0,0).open('GET','/resources.assets');
    new DataRequest(1144731,4930535,0,0).open('GET','/sharedassets0.assets');
    new DataRequest(4930535,53349371,0,0).open('GET','/sharedassets1.assets');
    new DataRequest(53349371,56827461,0,0).open('GET','/sharedassets1.resource');
    new DataRequest(56827461,81798217,0,0).open('GET','/sharedassets2.assets');
    new DataRequest(81798217,88548383,0,0).open('GET','/sharedassets2.resource');
    new DataRequest(88548383,92306367,0,0).open('GET','/Il2CppData/Metadata/global-metadata.dat');
    new DataRequest(92306367,93881403,0,0).open('GET','/Resources/unity_default_resources');
    new DataRequest(93881403,94384055,0,0).open('GET','/Resources/unity_builtin_extra');

    function processPackageData(arrayBuffer){
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      DataRequest.prototype.byteArray = byteArray;
      DataRequest.prototype.requests['/level0'].onload();
      DataRequest.prototype.requests['/level1'].onload();
      DataRequest.prototype.requests['/mainData'].onload();
      DataRequest.prototype.requests['/methods_pointedto_by_uievents.xml'].onload();
      DataRequest.prototype.requests['/resources.assets'].onload();
      DataRequest.prototype.requests['/sharedassets0.assets'].onload();
      DataRequest.prototype.requests['/sharedassets1.assets'].onload();
      DataRequest.prototype.requests['/sharedassets1.resource'].onload();
      DataRequest.prototype.requests['/sharedassets2.assets'].onload();
      DataRequest.prototype.requests['/sharedassets2.resource'].onload();
      DataRequest.prototype.requests['/Il2CppData/Metadata/global-metadata.dat'].onload();
      DataRequest.prototype.requests['/Resources/unity_default_resources'].onload();
      DataRequest.prototype.requests['/Resources/unity_builtin_extra'].onload();
      Module.removeRunDependency('datafile_webgl.data');
    }

    Module.addRunDependency('datafile_webgl.data');
    if (!Module.preloadResults) Module.preloadResults = {};
    Module.preloadResults[PACKAGE_NAME] = { fromCache: false };
    if (fetched) {
      processPackageData(fetched);
      fetched = null;
    } else {
      fetchedCallback = processPackageData;
    }
  }

  if (Module.calledRun) {
    runWithFS();
  } else {
    if (!Module.preRun) Module.preRun = [];
    Module.preRun.push(runWithFS);
  }
})();
