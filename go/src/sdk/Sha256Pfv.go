package sdk

import (
	"crypto/sha256"
	"fmt"
	"github.com/mdbox-web3/sha256-pfv/go/src/sdk/lib"
	"math"
	"math/rand"
	"strings"
	"time"
)

type Sha256Pfv struct {
	cache  string
	header Sha256PfvHeader
	hashes []string
	mode   Sha256PfvMode
}

type Sha256PfvMode string

const (
	Sha256PfvMode_Complete Sha256PfvMode = "complete"
	Sha256PfvMode_Compact  Sha256PfvMode = "compact"
)

func Sha256PfvFromFile(filePath string, maxCompleteHashLength int) (Sha256Pfv, error) {
	instance := Sha256Pfv{
		mode: Sha256PfvMode_Complete,
	}

	fileWrapper := lib.NewFileWrapper(filePath)
	fileSize := fileWrapper.Size()

	maxPart := int32(math.Ceil(float64(fileSize) / float64(lib.CONSTANT.FILE_BLOCK_SIZE)))
	if (maxPart & (maxPart - 1)) != 0 {
		maxPart = 1 << (lib.CalcDeBruijnBitPosition(maxPart) + 1)
	}
	maxAvailablePart := lib.FloorToPowerOf2(((int32(maxCompleteHashLength) - 2) / 8) >> 0)
	partCount := int(math.Min(math.Min(float64(maxPart), float64(maxAvailablePart)), float64(lib.CONSTANT.PART_MAX_COUNT)))
	partHashLength := int(math.Min(math.Floor(float64((maxCompleteHashLength-2)/partCount)), float64(lib.CONSTANT.PART_HASH_MAX_LENGTH)))
	instance.header = NewSha256PfvHeader(partCount, partHashLength)

	fileBlockSize := int64(math.Ceil(float64(fileSize) / float64(partCount)))
	for i := 0; i < partCount; i++ {
		blockContent := fileWrapper.FileContent(int64(i)*fileBlockSize, fileBlockSize)
		instance.addHash(fmt.Sprintf("%x", sha256.Sum256(blockContent))[0:partHashLength])
	}

	return instance, nil
}

func Sha256PfvFromString(hash string) (Sha256Pfv, error) {
	instance := Sha256Pfv{
		mode: Sha256PfvMode_Complete,
	}
	if hash[0:2] == lib.CONSTANT.COMPACT_HEADER {
		header, err := Sha256PfvHeaderFromString(hash[2:4])
		if err != nil {
			return instance, err
		}
		_, err = header.Valid()
		if err != nil {
			return instance, err
		}

		instance.mode = Sha256PfvMode_Compact
		instance.header = header
		instance.setCompactHash(hash[4:])
	} else {
		header, err := Sha256PfvHeaderFromString(hash[0:2])
		if err != nil {
			return instance, err
		}
		_, err = header.Valid()
		if err != nil {
			return instance, err
		}

		instance.header = header
		partCount := header.PartCount
		partHashLength := header.PartHashLength
		if len(hash)-2 != partCount*partHashLength {
			return instance, NewSha256PfvError("完整哈希位数不正确", Sha256PfvError_COMPLETE_HASH_INVALID)
		}

		for i := 0; i < partCount; i++ {
			instance.addHash(hash[2+i*partHashLength : 2+(i+1)*partHashLength])
		}
	}

	return instance, nil
}

func (pfv *Sha256Pfv) Valid() (bool, error) {
	if _, err := pfv.header.Valid(); err != nil {
		return false, err
	}

	if pfv.mode == Sha256PfvMode_Complete {
		if len(pfv.hashes) != pfv.header.PartCount {
			return false, NewSha256PfvError("哈希数据与分块数量不匹配", Sha256PfvError_PART_HASH_INCOMPLETE)
		}
	} else {
		if len(pfv.hashes) != 1 {
			return false, NewSha256PfvError("精简哈希数据数量不正确", Sha256PfvError_PART_HASH_INCOMPLETE)
		}
		if len(pfv.hashes[0]) < lib.CONSTANT.COMPACT_HASH_MIN_LENGTH-4 {
			return false, NewSha256PfvError("精简哈希长度太短", Sha256PfvError_PART_HASH_INCOMPLETE)
		}
	}

	return true, nil
}

func (pfv *Sha256Pfv) Mode() Sha256PfvMode {
	return pfv.mode
}

func (pfv *Sha256Pfv) addHash(hash string) {
	pfv.hashes = append(pfv.hashes, hash)
}

func (pfv *Sha256Pfv) setCompactHash(hash string) {
	pfv.mode = Sha256PfvMode_Compact
	pfv.hashes = []string{hash}
	pfv.cache = ""
}

func (pfv *Sha256Pfv) ToString() string {
	if pfv.cache == "" {
		pfv.calcCache()
	}

	return pfv.cache
}

func (pfv *Sha256Pfv) calcCache() {
	if ok, _ := pfv.Valid(); ok {
		pfv.cache = pfv.header.ToString() + strings.Join(pfv.hashes, "")
		if pfv.mode == Sha256PfvMode_Compact {
			pfv.cache = lib.CONSTANT.COMPACT_HEADER + pfv.cache
		}
	} else {
		pfv.cache = ""
	}
}

func (pfv *Sha256Pfv) CompleteVerifyFile(filePath string) (bool, error) {
	if _, err := pfv.Valid(); err != nil {
		return false, err
	}

	fileWrapper := lib.NewFileWrapper(filePath)
	fileSize := fileWrapper.Size()

	partCount := pfv.header.PartCount
	partHashLength := pfv.header.PartHashLength

	hashes := make([]string, partCount)

	fileBlockSize := int64(math.Ceil(float64(fileSize) / float64(partCount)))
	for i := 0; i < partCount; i++ {
		blockContent := fileWrapper.FileContent(int64(i)*fileBlockSize, fileBlockSize)
		hashes = append(hashes, fmt.Sprintf("%x", sha256.Sum256(blockContent))[0:partHashLength])
	}

	localHash := strings.Join(pfv.hashes, "")
	if pfv.mode == Sha256PfvMode_Complete {
		return localHash == strings.Join(hashes, ""), nil
	} else {
		return localHash == fmt.Sprintf("%x", sha256.Sum256([]byte(pfv.header.ToString()+strings.Join(hashes, ""))))[0:len(localHash)], nil
	}
}

func (pfv *Sha256Pfv) FastVerifyFile(filePath string, verifyPartCount int) (bool, error) {
	if pfv.header.PartCount <= verifyPartCount {
		return pfv.CompleteVerifyFile(filePath)
	}

	if pfv.mode == Sha256PfvMode_Compact {
		return false, NewSha256PfvError("精简哈希不支持快速验证", Sha256PfvError_METHOD_NOT_SUPPORTED)
	}

	if _, err := pfv.Valid(); err != nil {
		return false, err
	}

	fileWrapper := lib.NewFileWrapper(filePath)
	fileSize := fileWrapper.Size()

	partCount := pfv.header.PartCount
	partHashLength := pfv.header.PartHashLength

	partIndexes := make([]int, partCount)
	for i := range partIndexes {
		partIndexes[i] = i
	}
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(partIndexes), func(i, j int) { partIndexes[i], partIndexes[j] = partIndexes[j], partIndexes[i] })

	fileBlockSize := int64(math.Ceil(float64(fileSize) / float64(partCount)))
	for i, verifyPartIndex := range partIndexes {
		if i >= verifyPartCount {
			break
		}

		blockContent := fileWrapper.FileContent(int64(verifyPartIndex)*fileBlockSize, fileBlockSize)
		if fmt.Sprintf("%x", sha256.Sum256(blockContent))[0:partHashLength] != pfv.hashes[verifyPartIndex] {
			return false, nil
		}
	}

	return true, nil
}

func (pfv *Sha256Pfv) Compact(toLength int) (string, error) {
	if toLength < lib.CONSTANT.COMPACT_HASH_MIN_LENGTH+4 {
		return "", NewSha256PfvError("精简哈希长度太短", Sha256PfvError_PARAMS_INVALID)
	}

	if len(pfv.ToString()) > toLength {
		pfv.setCompactHash(fmt.Sprintf("%x", sha256.Sum256([]byte(pfv.ToString())))[0 : toLength-4])
	}

	return pfv.ToString(), nil
}
