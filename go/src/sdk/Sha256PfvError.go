package sdk

import "fmt"

type Sha256PfvErrorCode int

const (
	Sha256PfvError_PARAMS_INVALID                  Sha256PfvErrorCode = 1   //参数错误
	Sha256PfvError_METHOD_NOT_SUPPORTED                               = 2   //不支持的方法
	Sha256PfvError_HEADER_PART_COUNT_INVALID                          = 100 //分块哈希数量无效
	Sha256PfvError_HEADER_PART_HASH_LENGTH_INVALID                    = 101 //分块哈希长度无效
	Sha256PfvError_FILE_INVALID                                       = 200 //文件无法访问
	Sha256PfvError_FILE_NOT_FOUND                                     = 201 //找不到文件
	Sha256PfvError_FILE_IO_ERROR                                      = 202 //找不到文件
	Sha256PfvError_PART_HASH_INCOMPLETE                               = 300 //分块哈希不完整
	Sha256PfvError_COMPLETE_HASH_INVALID                              = 301 //完整哈希无效
)

type sha256PfvError struct {
	msg  string
	code Sha256PfvErrorCode
}

func NewSha256PfvError(msg string, code Sha256PfvErrorCode) error {
	return &sha256PfvError{
		msg:  msg,
		code: code,
	}
}

func (e *sha256PfvError) Error() string {
	return fmt.Sprintf("Sha256PfvError code:%d,msg:%v", e.code, e.msg)
}

func (e *sha256PfvError) getCode() Sha256PfvErrorCode {
	return e.code
}
