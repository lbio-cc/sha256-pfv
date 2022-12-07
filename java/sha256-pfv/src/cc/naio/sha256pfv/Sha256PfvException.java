package cc.naio.sha256pfv;

public class Sha256PfvException extends Exception{
    public static final int PARAMS_INVALID = 1;//参数错误
    public static final int METHOD_NOT_SUPPORTED = 2;//不支持的方法

    public static final int HEADER_PART_COUNT_INVALID = 100;//分块哈希数量无效
    public static final int HEADER_PART_HASH_LENGTH_INVALID = 101;//分块哈希长度无效
    
    public static final int FILE_INVALID = 200; //不是文件
    public static final int FILE_NOT_FOUND = 201; //找不到文件
    public static final int FILE_IO_ERROR = 202; //文件读写错误
    
    public static final int PART_HASH_INCOMPLETE = 300;//分块哈希不完整
    public static final int COMPLETE_HASH_INVALID = 301;//完整哈希无效
    
    
    protected int code;
    public Sha256PfvException(String message, int code){
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
