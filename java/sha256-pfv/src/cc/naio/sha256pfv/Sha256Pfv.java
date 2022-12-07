package cc.naio.sha256pfv;

import cc.naio.sha256pfv.lib.CONSTANT;
import cc.naio.sha256pfv.lib.FileWrapper;
import cc.naio.sha256pfv.lib.Sha256PfvUtility;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Sha256Pfv {
    public static final String MODE_COMPLETE = "complete";//完整哈希模式
    public static final String MODE_COMPACT = "compact";//精简哈希模式

    Sha256PfvHeader header;
    ArrayList<String> hashes;
    String cache;
    String mode;

    /**
     * 普通构造方法, 一般为内部使用
     */
    Sha256Pfv(){
        this.header = new Sha256PfvHeader();
        this.hashes = new ArrayList<>();
        this.cache = null;
        this.mode = Sha256Pfv.MODE_COMPLETE;
    }

    /**
     * @return true
     * @throws Sha256PfvException 无效异常
     * 检测格式是否有效
     */
    public boolean valid() throws Sha256PfvException {
        this.header.valid();
        if(this.mode.equals(Sha256Pfv.MODE_COMPLETE)) {
            if (this.hashes.size() != this.header.getPartCount()) {
                throw new Sha256PfvException("哈希数据与分块数量不匹配", Sha256PfvException.PART_HASH_INCOMPLETE);
            }
            for(String hash:this.hashes){
                if(hash.length() != this.header.getPartHashLength()){
                    throw new Sha256PfvException("哈希数据长度与分块哈希长度不匹配", Sha256PfvException.PART_HASH_INCOMPLETE);
                }
            }
        }
        else{
            if(this.hashes.size() != 1){
                throw new Sha256PfvException("精简哈希数据数量不正确", Sha256PfvException.PART_HASH_INCOMPLETE);
            }
            if(this.hashes.get(0).length() < CONSTANT.COMPACT_HASH_MIN_LENGTH){
                throw new Sha256PfvException("精简哈希长度太短", Sha256PfvException.PART_HASH_INCOMPLETE);
            }
        }

        return true;
    }

    /**
     * @return 返回当前模式
     */
    public String getMode() {
        return mode;
    }

    /**
     * @return 返回头部实例
     */
    public Sha256PfvHeader getHeader() {
        return header;
    }

    /**
     * @param header 替换头部实例
     */
    protected void setHeader(Sha256PfvHeader header) {
        this.header = header;
    }

    /**
     * @param hash 要添加的分块哈希
     */
    protected void addHash(String hash){
        hashes.add(hash);
    }

    /**
     * @param hash 精简哈希内容
     * 设置为精简哈希
     */
    protected void setCompactHash(String hash){
        this.mode = Sha256Pfv.MODE_COMPACT;
        this.hashes = new ArrayList<>();
        addHash(hash);
        this.cache = null;
    }

    /**
     * @return 转化为字符串
     */
    public String toString() {
        try {
            if (this.cache == null) this.calcCache();
            return this.cache;
        }
        catch (Sha256PfvException e){
            return "";
        }
    }

    /**
     * @throws Sha256PfvException 验证格式中抛出的错误
     * 计算字符串缓存
     */
    protected void calcCache() throws Sha256PfvException {
        if (!this.valid()) this.cache = "";
        else{
            this.cache = this.header.toString() + String.join("",this.hashes);
            if(this.mode.equals(Sha256Pfv.MODE_COMPACT)){
                this.cache = CONSTANT.COMPACT_HEADER + this.cache;
            }
        }
    }

    /**
     * @param filePath 待校验的文件路径
     * @return 是否验证通过
     * @throws Sha256PfvException 验证格式中抛出的错误
     */
    public boolean completeVerifyFile(String filePath) throws Sha256PfvException {
        this.valid();

        FileWrapper fileWrapper = new FileWrapper(filePath);
        long fileSize = fileWrapper.getSize();

        int partCount = this.header.getPartCount();
        int partHashLength = this.header.getPartHashLength();
        int fileBlockSize = (int) Math.ceil(fileSize / partCount);
        ArrayList<String> hashes = new ArrayList<>();
        for (int i = 0; i < partCount; i++) {
            byte[] blockContent = fileWrapper.getFileContent(i * fileBlockSize, fileBlockSize);
            String hash = Sha256PfvUtility.sha256Hash(blockContent);
            hashes.add(hash.substring(0, partHashLength));
        }

        String localHash = String.join("", this.hashes);
        if(this.mode.equals(Sha256Pfv.MODE_COMPLETE)) {
            return localHash.equals(String.join("", hashes));
        }
        else{
            return localHash.equals(Sha256PfvUtility.sha256Hash((this.header.toString() + String.join("", hashes)).getBytes()).substring(0, localHash.length()));
        }
    }

    /**
     * @param filePath 待校验的文件路径
     * @param verifyPartCount 需要验算的分块数
     * @return 是否验证通过
     * @throws Sha256PfvException 验证格式中抛出的错误
     */
    public boolean fastVerifyFile(String filePath, int verifyPartCount) throws Sha256PfvException {
        if (this.header.getPartCount() <= verifyPartCount){
            return this.completeVerifyFile(filePath);
        }

        this.valid();

        if(this.mode.equals(Sha256Pfv.MODE_COMPACT)){
            throw new Sha256PfvException("精简哈希不支持快速验证",Sha256PfvException.METHOD_NOT_SUPPORTED);
        }

        int partCount = this.header.getPartCount();
        int partHashLength = this.header.getPartHashLength();
        List<Integer> partIndexes = Arrays.stream(IntStream.range(0, partCount - 1).toArray()).boxed().collect(Collectors.toList());
        Collections.shuffle(partIndexes);
        List<Integer> verifyPartIndexes = partIndexes.subList(0, verifyPartCount);

        FileWrapper fileWrapper = new FileWrapper(filePath);
        long fileSize = fileWrapper.getSize();
        int fileBlockSize = (int) Math.ceil(fileSize / partCount);

        for (Integer verifyPartIndex : verifyPartIndexes) {
            byte[] blockContent = fileWrapper.getFileContent(verifyPartIndex * fileBlockSize, fileBlockSize);
            String hash = Sha256PfvUtility.sha256Hash(blockContent);
            if (!hash.substring(0, partHashLength).equals(this.hashes.get(verifyPartIndex))){
                return false;
            }
        }

        return true;

    }

    /**
     * @param filePath 待生成哈希的文件路径
     * @param maxCompleteHashLength 最大完整哈希长度
     * @return 生成的Sha256Pfv实例
     * @throws Sha256PfvException 文件操作中出现的错误
     */
    public static Sha256Pfv fromFile(String filePath,int maxCompleteHashLength) throws Sha256PfvException {
        FileWrapper fileWrapper = new FileWrapper(filePath);
        long fileSize = fileWrapper.getSize();

        int maxPart = (int) Math.ceil(fileSize/ CONSTANT.FILE_BLOCK_SIZE);
        maxPart = (maxPart & (maxPart - 1)) == 0 ? maxPart : 1 << (Sha256PfvUtility.calcDeBruijnBitPosition(maxPart)+1);
        int maxAvailablePart = Sha256PfvUtility.floorToPowerOf2((maxCompleteHashLength - 2) / 8);
        int partCount = Math.min(Math.min(maxPart, maxAvailablePart),CONSTANT.PART_MAX_COUNT);
        int partHashLength = Math.min((int) Math.floor((maxCompleteHashLength - 2)/partCount), CONSTANT.PART_HASH_MAX_LENGTH);
        Sha256Pfv instance = new Sha256Pfv();
        instance.getHeader().setPartCount(partCount);
        instance.getHeader().setPartHashLength(partHashLength);

        int fileBlockSize = (int)Math.ceil(fileSize / partCount);
        for (int i = 0; i < partCount; i++) {
            byte[] blockContent = fileWrapper.getFileContent(i * fileBlockSize, fileBlockSize);
            String hash = Sha256PfvUtility.sha256Hash(blockContent);
            instance.addHash(hash.substring(0, partHashLength));
        }
        return instance;
    }

    /**
     * @param hash 待解析的完整哈希或者精简哈希
     * @return 生成的Sha256Pfv实例
     * @throws Sha256PfvException 输入参数错误
     */
    public static Sha256Pfv fromString(String hash) throws Sha256PfvException {
        Sha256Pfv instance = new Sha256Pfv();
        if(hash.startsWith(CONSTANT.COMPACT_HEADER)){//compact
            Sha256PfvHeader header = Sha256PfvHeader.fromString(hash.substring(2, 4));
            header.valid();
            instance.setHeader(header);
            instance.setCompactHash(hash.substring(4));
        }
        else {//complete
            Sha256PfvHeader header = Sha256PfvHeader.fromString(hash.substring(0, 2));
            header.valid();
            instance.setHeader(header);

            int partCount = header.getPartCount();
            int partHashLength = header.getPartHashLength();
            if (hash.length() - 2 != partCount * partHashLength) {
                throw new Sha256PfvException("完整哈希位数不正确", Sha256PfvException.COMPLETE_HASH_INVALID);
            }

            for (int i = 0; i < partCount; i++) {
                instance.addHash(hash.substring(2 + i * partHashLength, 2 + (i + 1) * partHashLength));
            }
        }

        return instance;
    }

    /**
     * @param toLength 要压缩到的长度
     * @return 精简过的哈希字符串, 同时会修改原来的Sha256Pfv实例
     * @throws Sha256PfvException 参数错误
     */
    public String compact(int toLength) throws Sha256PfvException {
        if(toLength < CONSTANT.COMPACT_HASH_MIN_LENGTH+4){
            throw new Sha256PfvException("精简哈希长度太短",Sha256PfvException.PARAMS_INVALID);
        }

        if(this.toString().length() <= toLength){
            return this.toString();
        }

        this.setCompactHash(Sha256PfvUtility.sha256Hash(this.toString().getBytes()).substring(0, toLength - 4));
        return this.toString();
    }
}
