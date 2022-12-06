package main

import (
	"fmt"
	"github.com/mdbox-web3/sha256-pfv/go/src/sdk"
)

func main() {
	filePath := "C:\\fontawesome-pro-5.15.3-web.zip"
	sha256pfv, err := sdk.Sha256PfvFromFile(filePath, 64)

	_, err = sha256pfv.Valid()

	if err != nil {
		fmt.Println(err)
	}

	fmt.Println(sha256pfv.ToString())

	result, err := sha256pfv.CompleteVerifyFile(filePath)
	fmt.Printf("CompleteVerifyFile: %v|%v\n", result, err)
	result, err = sha256pfv.FastVerifyFile(filePath, 3)
	fmt.Printf("FastVerifyFile%v|%v\n", result, err)

	sha256pfv.Compact(32)

	result, err = sha256pfv.CompleteVerifyFile(filePath)
	fmt.Printf("CompleteVerifyFile: %v|%v\n", result, err)
	result, err = sha256pfv.FastVerifyFile(filePath, 3)
	fmt.Printf("FastVerifyFile%v|%v\n", result, err)
}
