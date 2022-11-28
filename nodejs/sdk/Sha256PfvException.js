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

Sha256PfvException.PARAMS_INVALID = 1;
Sha256PfvException.METHOD_NOT_SUPPORTED = 2;


Sha256PfvException.HEADER_PART_COUNT_INVALID = 100;
Sha256PfvException.HEADER_PART_HASH_LENGTH_INVALID = 101;

Sha256PfvException.FILE_INVALID = 200;
Sha256PfvException.FILE_NOT_FOUND = 201;

Sha256PfvException.PART_HASH_INCOMPLETE = 300;
Sha256PfvException.COMPLETE_HASH_INVALID = 301;



module.exports = Sha256PfvException;