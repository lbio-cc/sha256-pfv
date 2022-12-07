class Sha256PfvException extends Error{
	constructor(message, code) {
		super(message);
		this.code = code;
	}
	
	getMessage(){
		return this.message;
	}
	
	getCode(){
		return this.code;
	}
}

Sha256PfvException.PARAMS_INVALID = 1; //参数错误
Sha256PfvException.METHOD_NOT_SUPPORTED = 2; //不支持的方法


Sha256PfvException.HEADER_PART_COUNT_INVALID = 100; //分块哈希数量无效
Sha256PfvException.HEADER_PART_HASH_LENGTH_INVALID = 101; //分块哈希长度无效

Sha256PfvException.FILE_INVALID = 200; //文件无法访问
Sha256PfvException.FILE_NOT_FOUND = 201; //找不到文件
Sha256PfvException.FILE_IO_ERROR = 202; //找不到文件

Sha256PfvException.PART_HASH_INCOMPLETE = 300; //分块哈希不完整
Sha256PfvException.COMPLETE_HASH_INVALID = 301; //完整哈希无效



module.exports = Sha256PfvException;