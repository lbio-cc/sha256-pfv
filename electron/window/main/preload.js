const electron = require('electron');
const { contextBridge, ipcRenderer } = electron;

ipcRenderer.on('console.log',(ev,...args)=>{
	console.log(...args);
});

contextBridge.exposeInMainWorld('showOpenDialog', function(options = {}){
	let default_options = {};
	return ipcRenderer.invoke('showOpenDialog', { ...default_options, ...options })
});

contextBridge.exposeInMainWorld('getSha256PfvInfo', function (sha256PfvHexString) {
	return ipcRenderer.invoke('getSha256PfvInfo', sha256PfvHexString)
});

contextBridge.exposeInMainWorld('completeVerifySha256PfvByFile', function (filePath, sha256PfvHexString) {
	return ipcRenderer.invoke('completeVerifySha256PfvByFile', filePath, sha256PfvHexString)
});

contextBridge.exposeInMainWorld('computeSha256PfvByFile', function (filePath, maxCompleteHashLength){
	return ipcRenderer.invoke('computeSha256PfvByFile', filePath, maxCompleteHashLength)
})