class Sha256PfvException extends Error{
	readonly code: number;
	constructor(message:string, code:number) {
		super(message);
		this.code = code;
	}
	
	static PARAMS_INVALID = 1;//参数错误
	static METHOD_NOT_SUPPORTED = 2//不支持的方法
	
	static HEADER_PART_COUNT_INVALID = 100; //分块哈希数量无效
	static HEADER_PART_HASH_LENGTH_INVALID = 101; //分块哈希长度无效

	static FILE_INVALID = 200; //文件无法访问
	static FILE_NOT_FOUND = 201; //找不到文件
	static FILE_IO_ERROR = 202; //找不到文件

	static PART_HASH_INCOMPLETE = 300; //分块哈希不完整
	static COMPLETE_HASH_INVALID = 301; //完整哈希无效
}

export default Sha256PfvException;