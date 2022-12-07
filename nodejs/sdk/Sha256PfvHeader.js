let CONSTANT = require('./lib/constant');
let Sha256PfvUtility = require('./lib/Sha256PfvUtility');
const Sha256PfvException = require('./Sha256PfvException');

//Pfv哈希头部
class Sha256PfvHeader {
	constructor(partCount, partHashLength) {
		this.partCount = 0; //分块数量
		this.partHashLength = 0; //分块哈希长度
		this.cache = null; //生成字符串缓存
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

	//转化为字符串
	toString(){
		try {
			if (this.cache === null) this._calcCache();
			return this.cache;
		}
		catch (e){
			return '';
		}
	}
	
	//获取分块数
	getPartCount(){
		return this.partCount;
	}
	//设置分块数
	setPartCount(partCount){
		this.partCount = partCount >>> 0;
		this.cache = null
	}
	//获取分块哈希长度
	getPartHashLength(){
		return this.partHashLength;
	}
	//设置分块哈希长度
	setPartHashLength(partHashLength){
		this.partHashLength = partHashLength >>> 0;
		this.cache = null
	}
	
	//计算缓存
	_calcCache(){
		if (!this.valid()) this.cache = '';
		else this.cache = (Sha256PfvUtility.calcDeBruijnBitPosition(this.partCount) << 5 | (this.partHashLength - 1)).toString(16).padStart(2, '0');
	}
	
	//从字符串生成Sha256PfvHeader
	static fromString(hexString){
		if(!hexString.match(/^[0-9A-Fa-f]{2}$/)){
			throw new Sha256PfvException("数据不正确", Sha256PfvException.PARAMS_INVALID);
		}
		let value = parseInt(hexString,16);
		return new Sha256PfvHeader(1<<(value >>> 5), (value&0b11111) + 1);		
	}
}

module.exports = Sha256PfvHeader;