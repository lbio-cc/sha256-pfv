const {BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const Sha256Pfv = require('../../../nodejs/sdk/Sha256Pfv');

const windowStateKeeper = require('electron-window-state');

let windowState = windowStateKeeper({
	defaultWidth:1280,
	defaultHeight:720,
	file:'window_'+ path.basename(__dirname)+'.json'
});

module.exports = function(){
	let window = new BrowserWindow({
		x:windowState.x,
		y:windowState.y,
		width:windowState.width,
		height:windowState.height,
		show:false,
		webPreferences:{
			preload: path.join(__dirname, 'preload.js'),
		}
	});

	windowState.manage(window);
	require('./menu')(window);

	/*window.loadURL(url.format({
		pathname:path.join(__dirname,'view','index.html'),
		protocol:'file:',
		slashes:true
	}));*/
	window.loadURL('http://localhost:8080');

	//window.on('ready-to-show', () => {
	window.webContents.on('did-finish-load', () => {
		window.show();
		window.focus();
	});

	return window;
};

ipcMain.handle('showOpenDialog',(event, options)=>{
	return dialog.showOpenDialog(options);
})

ipcMain.handle('getSha256PfvInfo',(event, sha256PfvHexString)=>{
	let info = {
		partCount:0,
		partHashLength:0,
		mode:'complete',
		valid:true,
	};
	try{
		let sha256Pfv = Sha256Pfv.fromString(sha256PfvHexString);
		sha256Pfv.valid()
		info.partCount = sha256Pfv.getHeader().getPartCount();
		info.partHashLength = sha256Pfv.getHeader().getPartHashLength();
		info.mode = sha256Pfv.getMode();
	}
	catch (e){
		info.valid = false;
		info.error = e.message;
	}
	return info;
})

ipcMain.handle('completeVerifySha256PfvByFile',(event, filePath, sha256PfvHexString) =>{
	let info = {
		valid:true,
		result:false,
	}

	try {
		let sha256Pfv = Sha256Pfv.fromString(sha256PfvHexString);
		sha256Pfv.valid()
		info.result = sha256Pfv.completeVerifyFile(filePath);
	} catch (e) {
		info.valid = false;
		info.error = e.message;
	}
	return info;
});

ipcMain.handle('computeSha256PfvByFile', (event, filePath, maxCompleteHashLength) => {
	let info = {
		valid:true,
		result:'',
	}

	try {
		let sha256Pfv = Sha256Pfv.fromFile(filePath, maxCompleteHashLength);
		info.result = sha256Pfv.toString();
	} catch (e) {
		info.valid = false;
		info.error = e.message;
	}
	return info;
});
