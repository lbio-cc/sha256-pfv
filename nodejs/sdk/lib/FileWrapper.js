const fs = require("fs");
const Sha256PfvException = require("../Sha256PfvException");

class FileWrapper{
	constructor(path) {
		if(!fs.existsSync(path)){
			throw new Sha256PfvException("未找到文件", Sha256PfvException.FILE_INVALID);
		}
		this.fileStat = fs.statSync(path);
		if(!this.fileStat.isFile()){
			throw new Sha256PfvException("文件路径为目录", Sha256PfvException.FILE_INVALID)
		}
		this.file = fs.openSync(path);
	}
	
	getSize(){
		return this.fileStat.size;
	}
	
	getFileContent(offset, length){
		let buffer= new Uint8Array(length);
		fs.readSync(this.file, buffer, 0, length, offset);
		return buffer;
	}
}


module.exports = FileWrapper;