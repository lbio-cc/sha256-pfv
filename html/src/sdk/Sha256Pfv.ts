/**
 * @file Sha256Pfv 主类
 * @author hkuclion@gmail.com
 */

import {Message, sha256} from 'js-sha256';
import Sha256PfvHeader from "./Sha256PfvHeader";
import Sha256PfvException from "./Sha256PfvException";
import CONSTANT from "./lib/constant";
import FileWrapper from "./lib/FileWrapper";
import Sha256PfvUtility from "./lib/Sha256PfvUtility";

enum Sha256PfvMode {
	MODE_COMPLETE = 'complete',//完整哈希模式
	MODE_COMPACT = 'compact',//精简哈希模式
}

class Sha256Pfv {
	//普通构造方法, 一般为内部使用
	private header: Sha256PfvHeader;
	private hashes: string[];
	private cache: string | null;
	private mode: Sha256PfvMode;
	constructor() {
		this.header = new Sha256PfvHeader();
		this.hashes = [];
		this.cache = null;
		this.mode = Sha256PfvMode.MODE_COMPLETE;
	}

	//检测格式是否有效
	valid():boolean {
		this.header.valid();
		if(this.mode === Sha256PfvMode.MODE_COMPLETE) {//完整哈希
			if (this.hashes.length !== this.header.getPartCount()) {//检查分块哈希数量
				throw new Sha256PfvException("哈希数据与分块数量不匹配", Sha256PfvException.PART_HASH_INCOMPLETE);
			}
			for(const hash of this.hashes){//检查分块哈希长度
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
	getMode():Sha256PfvMode{
		return this.mode;
	}
	
	//获取header
	getHeader():Sha256PfvHeader{
		return this.header;
	}
	
	//设置header
	_setHeader(header:Sha256PfvHeader):void{
		this.header = header;
		this.cache = null;
	}
	
	//添加分块哈希
	_addHash(hash:string):void{
		this.hashes.push(hash);
		this.cache = null;
	}
	
	//设置为精简哈希
	_setCompactHash(hash:string):void{
		this.mode = Sha256PfvMode.MODE_COMPACT;
		this.hashes = [hash];
		this.cache = null;
	}

	//转化为字符串
	toString() :string{
		try {
			if (this.cache === null) this._calcCache();
			return this.cache || "";
		}
		catch (e){
			return "";
		}
	}
	
	//计算缓存
	_calcCache():void{
		if (!this.valid()) this.cache = '';
		else{
			this.cache = this.header.toString() + this.hashes.join("");
			if(this.mode === Sha256PfvMode.MODE_COMPACT){
				this.cache = CONSTANT.COMPACT_HEADER + this.cache;
			}
		} 
	}

	//完整验算文件
	async completeVerifyFile(file:File):Promise<boolean> {
		this.valid();
		
		const fileWrapper = new FileWrapper(file);
		const fileSize = fileWrapper.getSize();

		const partCount = this.header.getPartCount();
		const partHashLength = this.header.getPartHashLength();
		const fileBlockSize = Math.ceil(fileSize / partCount)
		const hashes = [];
		for (let i = 0; i < partCount; i++) {
			const blockContent = await fileWrapper.getFileContent(i * fileBlockSize, fileBlockSize);
			console.log(blockContent.byteLength);
			hashes.push(sha256(blockContent).substring(0, partHashLength));
		}

		const localHash = this.hashes.join("");
		if(this.mode === Sha256PfvMode.MODE_COMPLETE) {
			return localHash === hashes.join("");
		}
		else{
			return localHash === sha256(this.header.toString() + hashes.join("")).substring(0, localHash.length)
		}
	}
	
	//快速验算文件 verifyPartCount:需要验算的分块数
	async fastVerifyFile(file:File, verifyPartCount:number):Promise<boolean>{
		if (!verifyPartCount || this.header.getPartCount() <= verifyPartCount){
			return this.completeVerifyFile(file);
		}
		
		this.valid();
		
		if(this.mode === Sha256PfvMode.MODE_COMPACT){
			throw new Sha256PfvException("精简哈希不支持快速验证",Sha256PfvException.METHOD_NOT_SUPPORTED);
		}

		const partCount = this.header.getPartCount();
		const partHashLength = this.header.getPartHashLength();

		const partIndexes = new Array(partCount).fill("").map((_,index)=>index);
		const verifyPartIndexes = Sha256PfvUtility.shuffleArray(partIndexes).slice(0, verifyPartCount);

		const fileWrapper = new FileWrapper(file);
		const fileSize = fileWrapper.getSize();
		const fileBlockSize = Math.ceil(fileSize / partCount);

		for(const verifyPartIndex of verifyPartIndexes){
			const blockContent = await fileWrapper.getFileContent(verifyPartIndex * fileBlockSize, fileBlockSize);
			if(sha256(blockContent).substring(0, partHashLength) !== this.hashes[verifyPartIndex]){
				return false;
			}
		}
		
		return true
	}
	
	//从文件生成Sha256PFV maxCompleteHashLength:最大哈希长度
	static async fromFile(file:File,maxCompleteHashLength:number):Promise<Sha256Pfv>{
		const fileWrapper = new FileWrapper(file);
		const fileSize = fileWrapper.getSize();

		let maxPart = Math.ceil(fileSize/ CONSTANT.FILE_BLOCK_SIZE);
		maxPart = (maxPart & (maxPart - 1)) === 0 ? maxPart : 1 << (Sha256PfvUtility.calcDeBruijnBitPosition(maxPart)+1);
		const maxAvailablePart = Sha256PfvUtility.floorToPowerOf2(((maxCompleteHashLength - 2)/8)>>>0);
		const partCount = Math.min(maxPart, maxAvailablePart, CONSTANT.PART_MAX_COUNT);
		const partHashLength = Math.min(Math.floor((maxCompleteHashLength - 2)/partCount), CONSTANT.PART_HASH_MAX_LENGTH);
		const instance = new this();
		instance.getHeader().setPartCount(partCount);
		instance.getHeader().setPartHashLength(partHashLength);

		const fileBlockSize = Math.ceil(fileSize / partCount)
		for(let i=0; i<partCount; i++){
			const blockContent = await fileWrapper.getFileContent(i*fileBlockSize, fileBlockSize);
			instance._addHash(sha256(blockContent).substring(0, partHashLength));
		}
		return instance;
	}
	
	//从字符串解析Sha256PFV
	static async fromString(hash:string):Promise<Sha256Pfv>{
		const instance = new this();
		if(hash.substring(0,2) === CONSTANT.COMPACT_HEADER){//compact
			const header = Sha256PfvHeader.fromString(hash.substring(2, 4));
			header.valid();
			instance._setHeader(header);
			instance._setCompactHash(hash.substring(4));
		}
		else {//complete
			const header = Sha256PfvHeader.fromString(hash.substring(0, 2));
			header.valid();
			instance._setHeader(header);

			const partCount = header.getPartCount();
			const partHashLength = header.getPartHashLength();
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
	compact(toLength:number):string{
		if(toLength < CONSTANT.COMPACT_HASH_MIN_LENGTH + 4){
			throw new Sha256PfvException("精简哈希长度太短",Sha256PfvException.PARAMS_INVALID);
		}
		
		if(this.toString().length<=toLength){
			return this.toString();
		}
		
		this._setCompactHash(sha256(this.toString()).substring(0, toLength - 4));
		return this.toString();
	}
}



export default Sha256Pfv;
