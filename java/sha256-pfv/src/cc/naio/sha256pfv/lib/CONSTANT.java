package cc.naio.sha256pfv.lib;

public class CONSTANT {
    public static final int FILE_BLOCK_SIZE = 4194304; // 文件分块大小:4MB
    public static final int PART_MAX_COUNT=128; // 最大分块数量
    public static final int PART_HASH_MIN_LENGTH=8; // 分块哈希最小长度
    public static final int PART_HASH_MAX_LENGTH=32; // 分块哈希最大长度
    public static final int COMPACT_HASH_MIN_LENGTH=28; // 精简哈希哈希部分最小长度
    public static final int COMPLETE_HASH_MIN_LENGTH=30; // 完整哈希哈希部分最小总长度
    public static final String COMPACT_HEADER="00"; // 精简哈希头部
}
