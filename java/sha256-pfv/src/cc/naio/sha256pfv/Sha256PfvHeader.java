package cc.naio.sha256pfv;

import cc.naio.sha256pfv.lib.CONSTANT;
import cc.naio.sha256pfv.lib.Sha256PfvUtility;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Sha256PfvHeader {
    protected int partCount; // 分块数量
    protected int partHashLength; //分块哈希长度
    protected String cache; //生成字符串缓存

    Sha256PfvHeader(){
        this.partCount = 0;
        this.partHashLength = 0;
        this.cache = null;
    }

    Sha256PfvHeader(int partCount, int partHashLength) {
        this();
        this.setPartCount(partCount);
        this.setPartHashLength(partHashLength);
    }

    int getPartCount(){
        return this.partCount;
    }
    void setPartCount(int partCount){
        this.partCount = partCount;
        this.cache = null;
    }

    int getPartHashLength(){
        return this.partHashLength;
    }
    void setPartHashLength(int partHashLength){
        this.partHashLength = partHashLength;
        this.cache = null;
    }

    /**
     * @return true
     * @throws Sha256PfvException 无效异常
     * 检测格式是否有效
     */
    boolean valid() throws Sha256PfvException {
        if(this.partCount <= 0 || this.partCount > CONSTANT.PART_MAX_COUNT){
            throw new Sha256PfvException("分块数量超出范围", Sha256PfvException.HEADER_PART_COUNT_INVALID);
        }
        if((this.partCount & (this.partCount - 1)) != 0){
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

    /**
     * @throws Sha256PfvException 验证格式中抛出的错误
     * 计算字符串缓存
     */
    protected void calcCache() throws Sha256PfvException {
        if (!this.valid()) this.cache = "";
        else this.cache = String.format("%02x",(Sha256PfvUtility.calcDeBruijnBitPosition(this.partCount) << 5 | (this.partHashLength - 1)));
    }

    /**
     * @return 转化为字符串
     */
    public String toString(){
        if(this.cache == null) {
            try {
                this.calcCache();
            } catch (Sha256PfvException e) {
                return "";
            }
        }
        return this.cache;
    }

    /**
     * @param hexString 待解析的字符串
     * @return 生成的Sha256PfvHeader实例
     * @throws Sha256PfvException 输入参数错误
     */
    public static Sha256PfvHeader fromString(String hexString) throws Sha256PfvException {
        Pattern pattern = Pattern.compile("^[0-9A-Fa-f]{2}$");
        Matcher matcher = pattern.matcher(hexString);
        if(!matcher.find()){
            throw new Sha256PfvException("数据不正确", Sha256PfvException.PARAMS_INVALID);
        }
        int value = Integer.parseInt(hexString,16);
        return new Sha256PfvHeader(1<<(value >>> 5), (value&0b11111) + 1);
    }
}
