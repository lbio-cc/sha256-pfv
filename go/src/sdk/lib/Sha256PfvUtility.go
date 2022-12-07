package lib

var MultiplyDeBruijnBitPosition2 = [32]int{0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9}

// 使用DeBruijn计算1在32bit中的哪一位
func CalcDeBruijnBitPosition(input int32) int {
	input = FloorToPowerOf2(input)
	return MultiplyDeBruijnBitPosition2[((input*0b00000111011111001011010100110001)>>27)&0b11111]
}

// 向下取整到2的n次方
func FloorToPowerOf2(input int32) int32 {
	input |= input >> 1
	input |= input >> 2
	input |= input >> 4
	input |= input >> 8
	input |= input >> 16
	return input - (input >> 1)
}
