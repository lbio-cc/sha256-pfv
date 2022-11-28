let CONSTANT = require('./lib/constant');
let Sha256PfvUtility = require('./lib/Sha256PfvUtility');
const Sha256PfvException = require('./Sha256PfvException');

//Pfv哈希头部
class Sha256PfvHeader {
	constructor(partCount, partHashLength) {
		this.partCount = 0;
		this.partHashLength = 0;
		this.cache = null;
		if(partCount) {
			this.setPartCount(partCount);
		}
		if(partHashLength) {
			this.setPartHashLength(partHashLength)
		}
	}
	
	//检测是否有效
	valid(){
		if(this.partCount <= 0 || this.partCount > CONSTANT.PART_MAX_COUNT){
			throw new Sha256PfvException("分块数量超出范围", Sha256PfvException.HEADER_PART_COUNT_INVALID);
		}
		if((this.partCount & (this.partCount - 1)) !== 0){
			throw new Sha256PfvException("分块数量不是2^n", Sha256PfvException.HEADER_PART_COUNT_INVALID);
		}
		if (this.partHashLength < CONSTANT.PART_HASH_MIN_LENGTH || this.partHashLength > CONSTANT.PART_HASH_MAX_LENGTH) {
			throw new Sha256PfvException("分块哈希长度超出范围", Sha256PfvException.HEADER_PART_HASH_LENGTH_INVALID);
		}
		return true;
	}
	
	toString(){
		try {
			if (this.cache === null) this.calcCache();
			return this.cache;
		}
		catch (e){
			return '';
		}
	}
	
	getPartCount(){
		return this.partCount;
	}
	setPartCount(partCount){
		this.partCount = partCount >>> 0;
		this.cache = null
	}
	getPartHashLength(){
		return this.partHashLength;
	}
	setPartHashLength(partHashLength){
		this.partHashLength = partHashLength >>> 0;
		this.cache = null
	}
	
	calcCache(){
		if (!this.valid()) this.cache = '';
		else this.cache = (Sha256PfvUtility.calcDeBruijnBitPosition(this.partCount) << 5 | (this.partHashLength - 1)).toString(16).padStart(2, '0');
	}
	
	static fromString(hexString){
		if(!hexString.match(/^[0-9A-Fa-f]{2}$/)){
			throw new Sha256PfvException("数据不正确", Sha256PfvException.PARAMS_INVALID);
		}
		let value = parseInt(hexString,16);
		return new Sha256PfvHeader(1<<(value >>> 5), (value&0b11111) + 1);		
	}
}

module.exports = Sha256PfvHeader;