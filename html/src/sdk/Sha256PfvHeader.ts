//Pfv哈希头部
import Sha256PfvException from "./Sha256PfvException";
import Sha256PfvUtility from "./lib/Sha256PfvUtility";
import CONSTANT from "./lib/constant";

export default class Sha256PfvHeader {
	private partCount: number;
	private partHashLength: number;
	private cache: string | null;
    constructor(partCount?: number, partHashLength?: number) {
        this.partCount = 0; //分块数量
        this.partHashLength = 0; //分块哈希长度
        this.cache = null; //生成字符串缓存
        if (partCount) {
            this.setPartCount(partCount);
        }
        if (partHashLength) {
            this.setPartHashLength(partHashLength)
        }
    }

    //检测是否有效
    valid():boolean {
        if (this.partCount <= 0 || this.partCount > CONSTANT.PART_MAX_COUNT) {
            throw new Sha256PfvException("分块数量超出范围", Sha256PfvException.HEADER_PART_COUNT_INVALID);
        }
        if ((this.partCount & (this.partCount - 1)) !== 0) {
            throw new Sha256PfvException("分块数量不是2^n", Sha256PfvException.HEADER_PART_COUNT_INVALID);
        }
        if (this.partHashLength < CONSTANT.PART_HASH_MIN_LENGTH || this.partHashLength > CONSTANT.PART_HASH_MAX_LENGTH) {
            throw new Sha256PfvException("分块哈希长度太大或太小", Sha256PfvException.HEADER_PART_HASH_LENGTH_INVALID);
        }
        if (this.partHashLength * this.partCount < CONSTANT.COMPLETE_HASH_MIN_LENGTH){
            throw new Sha256PfvException("完整哈希长度太短", Sha256PfvException.HEADER_PART_HASH_LENGTH_INVALID);
        }
        return true;
    }

    //转化为字符串
    toString():string {
        try {
            if (this.cache === null) this._calcCache();
            return this.cache || "";
        } catch (e) {
            return '';
        }
    }

    //获取分块数
    getPartCount():number {
        return this.partCount;
    }

    //设置分块数
    setPartCount(partCount:number):void {
        this.partCount = partCount >>> 0;
        this.cache = null
    }

    //获取分块哈希长度
    getPartHashLength():number {
        return this.partHashLength;
    }

    //设置分块哈希长度
    setPartHashLength(partHashLength:number):void {
        this.partHashLength = partHashLength >>> 0;
        this.cache = null
    }

    //计算缓存
    _calcCache():void {
        if (!this.valid()) this.cache = '';
        else this.cache = (Sha256PfvUtility.calcDeBruijnBitPosition(this.partCount) << 5 | (this.partHashLength - 1)).toString(16).padStart(2, '0');
    }

    //从字符串生成Sha256PfvHeader
    static fromString(hexString:string):Sha256PfvHeader {
        if (!hexString.match(/^[0-9A-Fa-f]{2}$/)) {
            throw new Sha256PfvException("数据不正确", Sha256PfvException.PARAMS_INVALID);
        }
        const value = parseInt(hexString, 16);
        return new Sha256PfvHeader(1 << (value >>> 5), (value & 0b11111) + 1);
    }
}