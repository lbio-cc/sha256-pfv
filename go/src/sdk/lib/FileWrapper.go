package lib

import (
	"bufio"
	"github.com/mdbox-web3/sha256-pfv/go/src/sdk"
	"os"
)

type FileWrapper struct {
	Path   string
	file   *os.File
	reader *bufio.Reader
	stat   os.FileInfo
}

func NewFileWrapper(filePath string) (*FileWrapper, error) {
	fi, err := os.Open(filePath)
	if err != nil {
		return nil, sdk.NewSha256PfvError("未找到文件", sdk.Sha256PfvError_FILE_NOT_FOUND)
	}

	stat, _ := os.Stat(filePath)

	if stat.IsDir() {
		return nil, sdk.NewSha256PfvError("路径为目录", sdk.Sha256PfvError_FILE_INVALID)
	}

	return &FileWrapper{
		Path:   filePath,
		file:   fi,
		reader: bufio.NewReader(fi),
		stat:   stat,
	}, nil
}

func (fw *FileWrapper) Close() {
	fw.file.Close()
}

func (fw *FileWrapper) Size() int64 {
	return fw.stat.Size()
}

func (fw *FileWrapper) FileContent(offset int64, length int64) ([]byte, error) {
	buf := make([]byte, length)

	_, err := fw.file.Seek(offset, 0)
	if err != nil {
		return nil, sdk.NewSha256PfvError("读文件错误", sdk.Sha256PfvError_FILE_IO_ERROR)
	}
	_, err = fw.reader.Read(buf)
	if err != nil {
		return nil, sdk.NewSha256PfvError("读文件错误", sdk.Sha256PfvError_FILE_IO_ERROR)
	}

	return buf, nil
}
