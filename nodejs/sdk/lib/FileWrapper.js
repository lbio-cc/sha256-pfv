/**
 * @file Sha256Pfv 文件处理适配器
 * @author hkuclion@gmail.com
 */

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
		try {
			fs.readSync(this.file, buffer, 0, length, offset);
		}
		catch (e){
			throw new Sha256PfvException("读文件错误", Sha256PfvException.FILE_IO_ERROR)
		}
		return buffer;
	}
}


module.exports = FileWrapper;