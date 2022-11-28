package cc.naio.sha256pfv.lib;

import cc.naio.sha256pfv.Sha256PfvException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class Sha256PfvUtility {
    protected static MessageDigest sha256Digest;

    static {
        try {
            sha256Digest = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    protected final static int[] MultiplyDeBruijnBitPosition2 = {0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9};


    public static int calcDeBruijnBitPosition(int input){
        input = floorToPowerOf2(input);
        return MultiplyDeBruijnBitPosition2[((input * 0b00000111011111001011010100110001) >>> 27)&0b11111];
    }

    public static int floorToPowerOf2(int input){
        input |= (input >> 1);
        input |= (input >> 2);
        input |= (input >> 4);
        input |= (input >> 8);
        input |= (input >> 16);
        return input - (input >>> 1);
    }

    public static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public static String sha256Hash(byte[] content){
        return bytesToHex(sha256Digest.digest(content));
    }
}
