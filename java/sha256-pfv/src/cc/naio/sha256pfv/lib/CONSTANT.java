package cc.naio.sha256pfv.lib;

public class CONSTANT {
    public static final int FILE_BLOCK_SIZE = 4194304; // 4MB
    public static final int PART_MAX_COUNT=128;
    public static final int PART_HASH_MIN_LENGTH=8;
    public static final int PART_HASH_MAX_LENGTH=32;
    public static final int COMPACT_HASH_MIN_LENGTH=28;
    public static final String COMPACT_HEADER="00";
}
