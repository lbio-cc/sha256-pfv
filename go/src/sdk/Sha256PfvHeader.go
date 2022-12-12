package sdk

import (
	"fmt"
	"github.com/mdbox-web3/sha256-pfv/go/src/sdk/lib"
	"regexp"
	"strconv"
)

type Sha256PfvHeader struct {
	PartCount      int
	PartHashLength int
	cache          string
}

func NewSha256PfvHeader(partCount int, partHashLength int) Sha256PfvHeader {
	return Sha256PfvHeader{
		PartCount:      partCount,
		PartHashLength: partHashLength,
	}
}

func Sha256PfvHeaderFromString(hexString string) (Sha256PfvHeader, error) {
	reg := regexp.MustCompile(`^[0-9A-Fa-f]{2}$`)

	if !reg.Match([]byte(hexString)) {
		return Sha256PfvHeader{}, NewSha256PfvError("数据不正确", Sha256PfvError_PARAMS_INVALID)
	}

	value, err := strconv.ParseInt(hexString, 16, 32)
	if err != nil {
		return Sha256PfvHeader{}, NewSha256PfvError("数据不正确", Sha256PfvError_PARAMS_INVALID)
	}

	return Sha256PfvHeader{
		PartCount:      1 << (value >> 5),
		PartHashLength: int(value&0b11111) + 1,
	}, nil
}

// ToString 转化为字符串
func (header *Sha256PfvHeader) ToString() string {
	if header.cache == "" {
		header.calcCache()
	}

	return header.cache
}

// Valid 检测是否有效
func (header *Sha256PfvHeader) Valid() (bool, error) {
	if header.PartCount <= 0 || header.PartCount > lib.CONSTANT.PART_MAX_COUNT {
		return false, NewSha256PfvError("分块数量超出范围", Sha256PfvError_HEADER_PART_COUNT_INVALID)
	}
	if (header.PartCount & (header.PartCount - 1)) != 0 {
		return false, NewSha256PfvError("分块数量不是2^n", Sha256PfvError_HEADER_PART_COUNT_INVALID)
	}
	if header.PartHashLength < lib.CONSTANT.PART_HASH_MIN_LENGTH || header.PartHashLength > lib.CONSTANT.PART_HASH_MAX_LENGTH {
		return false, NewSha256PfvError("分块哈希长度太大或太小", Sha256PfvError_HEADER_PART_HASH_LENGTH_INVALID)
	}
	if header.PartHashLength * header.PartCount < lib.CONSTANT.COMPLETE_HASH_MIN_LENGTH {
        return false, NewSha256PfvError("完整哈希长度太短", Sha256PfvError_HEADER_PART_HASH_LENGTH_INVALID)
    }
	return true, nil
}

// 计算缓存
func (header *Sha256PfvHeader) calcCache() {
	if ok, _ := header.Valid(); ok {
		header.cache = fmt.Sprintf("%02x", lib.CalcDeBruijnBitPosition(int32(header.PartCount))<<5|(header.PartHashLength-1))
	} else {
		header.cache = ""
	}
}
