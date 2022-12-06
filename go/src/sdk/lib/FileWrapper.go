package lib

import (
	"bufio"
	"os"
)

type FileWrapper struct {
	Path   string
	file   *os.File
	reader *bufio.Reader
	stat   os.FileInfo
}

func NewFileWrapper(filePath string) *FileWrapper {
	fi, err := os.Open(filePath)
	if err != nil {
		panic(err)
	}

	stat, _ := os.Stat(filePath)

	return &FileWrapper{
		Path:   filePath,
		file:   fi,
		reader: bufio.NewReader(fi),
		stat:   stat,
	}
}

func (fw *FileWrapper) Close() {
	fw.file.Close()
}

func (fw *FileWrapper) Size() int64 {
	return fw.stat.Size()
}

func (fw *FileWrapper) FileContent(offset int64, length int64) []byte {
	buf := make([]byte, length)

	_, err := fw.file.Seek(offset, 0)
	if err != nil {
		return nil
	}
	_, err = fw.reader.Read(buf)
	if err != nil {
		return nil
	}

	return buf
}
