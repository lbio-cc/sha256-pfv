/**
 * @file Sha256Pfv 文件处理适配器
 * @author hkuclion@gmail.com
 */
import Sha256PfvException from "@/sdk/Sha256PfvException";

class FileWrapper{
	private readonly file: File;
	constructor(file:File) {
		this.file = file;
	}
	
	getSize(){
		return this.file.size;
	}
	
	getFileContent(offset:number, length:number): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsArrayBuffer(this.file.slice(offset, offset+length));
			reader.onload = function (){
				if(reader.result === null || typeof reader.result === "string"){
					reject(new Sha256PfvException("读文件错误", Sha256PfvException.FILE_IO_ERROR))
				}
				else{
					resolve(reader.result);
				}
			}
		})
	}
}


export default FileWrapper;