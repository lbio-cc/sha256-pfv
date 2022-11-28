package cc.naio.sha256pfv;

public class Sha256PfvException extends Exception{
    public static final int PARAMS_INVALID = 1;
    public static final int METHOD_NOT_SUPPORTED = 2;

    public static final int HEADER_PART_COUNT_INVALID = 100;
    public static final int HEADER_PART_HASH_LENGTH_INVALID = 101;
    
    public static final int FILE_INVALID = 200;
    public static final int FILE_NOT_FOUND = 201;
    public static final int FILE_IO_ERROR = 202;
    
    public static final int PART_HASH_INCOMPLETE = 300;
    public static final int COMPLETE_HASH_INVALID = 301;
    
    
    protected int code;
    public Sha256PfvException(String message, int code){
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
