/**
 * @file Sha256Pfv 主类
 * @author hkuclion@gmail.com
 */

const Sha256PfvHeader = require("./Sha256PfvHeader");
const FileWrapper = require("./lib/FileWrapper");
const CONSTANT = require("./lib/constant");
const Sha256PfvUtility = require("./lib/Sha256PfvUtility");
const hasha = require('hasha');
const Sha256PfvException = require("./Sha256PfvException");

class Sha256Pfv {
	//普通构造方法, 一般为内部使用
	constructor() {
		this.header = new Sha256PfvHeader();
		this.hashes = [];
		this.cache = null;
		this.mode = Sha256Pfv.MODE_COMPLETE;
	}

	//检测格式是否有效
	valid() {
		this.header.valid();
		if(this.mode === Sha256Pfv.MODE_COMPLETE) {//完整哈希
			if (this.hashes.length !== this.header.getPartCount()) {//检查分块哈希数量
				throw new Sha256PfvException("哈希数据与分块数量不匹配", Sha256PfvException.PART_HASH_INCOMPLETE);
			}
			for(let hash of this.hashes){//检查分块哈希长度
				if(hash.length !== this.header.getPartHashLength()){
					throw new Sha256PfvException("哈希数据长度与分块哈希长度不匹配", Sha256PfvException.PART_HASH_INCOMPLETE);
				}
			}
		}
		else{//精简哈希
			if(this.hashes.length !== 1){//检查分块哈希数量
				throw new Sha256PfvException("精简哈希数据数量不正确", Sha256PfvException.PART_HASH_INCOMPLETE);
			}
			if(this.hashes[0].length < CONSTANT.COMPACT_HASH_MIN_LENGTH){//检查分块哈希长度
				throw new Sha256PfvException("精简哈希长度太短", Sha256PfvException.PART_HASH_INCOMPLETE);
			}
		}
		
		return true;
	}
	
	//获取当前模式
	getMode(){
		return this.mode;
	}
	
	//获取header
	getHeader(){
		return this.header;
	}
	
	//设置header
	_setHeader(header){
		this.header = header;
		this.cache = null;
	}
	
	//添加分块哈希
	_addHash(hash){
		this.hashes.push(hash);
		this.cache = null;
	}
	
	//设置为精简哈希
	_setCompactHash(hash){
		this.mode = Sha256Pfv.MODE_COMPACT;
		this.hashes = [hash];
		this.cache = null;
	}

	//转化为字符串
	toString() {
		try {
			if (this.cache === null) this._calcCache();
			return this.cache;
		}
		catch (e){
			return '';
		}
	}
	
	//计算缓存
	_calcCache(){
		if (!this.valid()) this.cache = '';
		else{
			this.cache = this.header.toString() + this.hashes.join("");
			if(this.mode === Sha256Pfv.MODE_COMPACT){
				this.cache = CONSTANT.COMPACT_HEADER + this.cache;
			}
		} 
	}

	//完整验算文件
	completeVerifyFile(filePath) {
		this.valid();
		
		let fileWrapper = new FileWrapper(filePath);
		let fileSize = fileWrapper.getSize();
		
		let partCount = this.header.getPartCount();
		let partHashLength = this.header.getPartHashLength();
		let fileBlockSize = Math.ceil(fileSize / partCount)
		let hashes = [];
		for (let i = 0; i < partCount; i++) {
			let blockContent = fileWrapper.getFileContent(i * fileBlockSize, fileBlockSize);
			hashes.push(hasha(blockContent, {algorithm:'sha256'}).substring(0, partHashLength));
		}

		let localHash = this.hashes.join("");
		if(this.mode === Sha256Pfv.MODE_COMPLETE) {
			return localHash === hashes.join("");
		}
		else{
			return localHash === hasha(this.header.toString() + hashes.join(""), {algorithm:'sha256'}).substring(0, localHash.length)
		}
	}
	
	//快速验算文件 verifyPartCount:需要验算的分块数
	fastVerifyFile(filePath, verifyPartCount){
		if (!verifyPartCount || this.header.getPartCount() <= verifyPartCount){
			return this.completeVerifyFile(filePath);
		}
		
		this.valid();
		
		if(this.mode === Sha256Pfv.MODE_COMPACT){
			throw new Sha256PfvException("精简哈希不支持快速验证",Sha256PfvException.METHOD_NOT_SUPPORTED);
		}

		let partCount = this.header.getPartCount();
		let partHashLength = this.header.getPartHashLength();
		
		let partIndexes = new Array(partCount).fill("").map((_,index)=>index);
		let verifyPartIndexes = Sha256PfvUtility.shuffleArray(partIndexes).slice(0, verifyPartCount);

		let fileWrapper = new FileWrapper(filePath);
		let fileSize = fileWrapper.getSize();
		let fileBlockSize = Math.ceil(fileSize / partCount);

		for(let verifyPartIndex of verifyPartIndexes){
			let blockContent = fileWrapper.getFileContent(verifyPartIndex * fileBlockSize, fileBlockSize);
			if(hasha(blockContent, {algorithm:'sha256'}).substring(0, partHashLength) !== this.hashes[verifyPartIndex]){
				return false;
			}
		}
		
		return true
	}
	
	//从文件生成Sha256PFV maxCompleteHashLength:最大哈希长度
	static fromFile(filePath,maxCompleteHashLength){
		let fileWrapper = new FileWrapper(filePath);
		let fileSize = fileWrapper.getSize();

		let maxPart = Math.ceil(fileSize/ CONSTANT.FILE_BLOCK_SIZE);
		maxPart = (maxPart & (maxPart - 1)) === 0 ? maxPart : 1 << (Sha256PfvUtility.calcDeBruijnBitPosition(maxPart)+1);
		let maxAvailablePart = Sha256PfvUtility.floorToPowerOf2(((maxCompleteHashLength - 2)/8)>>>0);
		let partCount = Math.min(maxPart, maxAvailablePart, CONSTANT.PART_MAX_COUNT);
		let partHashLength = Math.min(Math.floor((maxCompleteHashLength - 2)/partCount), CONSTANT.PART_HASH_MAX_LENGTH);
		let instance = new this();
		instance.getHeader().setPartCount(partCount);
		instance.getHeader().setPartHashLength(partHashLength);
		
		let fileBlockSize = Math.ceil(fileSize / partCount)
		for(let i=0; i<partCount; i++){
			let blockContent = fileWrapper.getFileContent(i*fileBlockSize, fileBlockSize);
			instance._addHash(hasha(blockContent,{algorithm:'sha256'}).substring(0, partHashLength));
		}
		return instance;
	}
	
	//从字符串解析Sha256PFV
	static fromString(hash){
		let instance = new this();
		if(hash.substring(0,2) === CONSTANT.COMPACT_HEADER){//compact
			let header = Sha256PfvHeader.fromString(hash.substring(2, 4));
			header.valid();
			instance._setHeader(header);
			instance._setCompactHash(hash.substring(4));
		}
		else {//complete
			let header = Sha256PfvHeader.fromString(hash.substring(0, 2));
			header.valid();
			instance._setHeader(header);

			let partCount = header.getPartCount();
			let partHashLength = header.getPartHashLength();
			if (hash.length - 2 !== partCount * partHashLength) {
				throw new Sha256PfvException("完整哈希位数不正确", Sha256PfvException.COMPLETE_HASH_INVALID);
			}

			for (let i = 0; i < partCount; i++) {
				instance._addHash(hash.substring(2 + i * partHashLength, 2 + (i + 1) * partHashLength));
			}
		}

		return instance;
	}
	
	//生成精简哈希
	compact(toLength){
		if(toLength < CONSTANT.COMPACT_HASH_MIN_LENGTH + 4){
			throw new Sha256PfvException("精简哈希长度太短",Sha256PfvException.PARAMS_INVALID);
		}
		
		if(this.toString().length <= toLength){
			return this.toString();
		}
		
		this._setCompactHash(hasha(this.toString(), {algorithm:'sha256'}).substring(0, toLength - 4));
		return this.toString();
	}
}

Sha256Pfv.MODE_COMPLETE = 'complete';//完整哈希模式
Sha256Pfv.MODE_COMPACT = 'compact';//精简哈希模式

module.exports = Sha256Pfv
