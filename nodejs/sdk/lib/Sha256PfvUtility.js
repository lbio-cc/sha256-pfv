let MultiplyDeBruijnBitPosition2 = [0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9];

class Sha256PfvUtility{
	//使用DeBruijn计算1在32bit中的哪一位
	static calcDeBruijnBitPosition(input){
		input = this.floorToPowerOf2(input);
		return MultiplyDeBruijnBitPosition2[((input * 0b00000111011111001011010100110001) >>> 27)&0b11111];
	}
	
	static floorToPowerOf2(input){
		input |= (input >> 1);
		input |= (input >> 2);
		input |= (input >> 4);
		input |= (input >> 8);
		input |= (input >> 16);
		return input - (input >>> 1);
	}
	
	static shuffleArray(array){
		let n = array.length, random;
		while (0 !== n) {
			random = (Math.random() * n--) >>> 0; // 无符号右移位运算符向下取整
			[array[n], array[random]] = [array[random], array[n]] // ES6的结构赋值实现变量互换
		}
		return array;
	}
}

module.exports = Sha256PfvUtility;