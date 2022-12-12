/**
 * @file Sha256Pfv 常量定义
 * @author hkuclion@gmail.com
 */

const CONSTANT = {
	FILE_BLOCK_SIZE:4194304,    // 文件分块大小:4MB
	PART_MAX_COUNT:128,         // 最大分块数量
	PART_HASH_MIN_LENGTH:8,     // 分块哈希最小长度
	PART_HASH_MAX_LENGTH:32,    // 分块哈希最大长度
	COMPACT_HASH_MIN_LENGTH:28, // 精简哈希哈希部分最小长度
	COMPLETE_HASH_MIN_LENGTH:30,// 完整哈希哈希部分最小总长度
	COMPACT_HEADER:'00',        // 精简哈希头部
}

export default CONSTANT;