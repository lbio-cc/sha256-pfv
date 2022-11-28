package demo;

import cc.naio.sha256pfv.Sha256Pfv;
import cc.naio.sha256pfv.Sha256PfvException;

public class Main {
    public static void main(String[] args){
        String filePath = "C:\\fontawesome-pro-5.15.3-web.zip";

        try {
            Sha256Pfv sha256Pfv = Sha256Pfv.fromFile(filePath, 64);
            System.out.println(sha256Pfv.toString());

            System.out.printf("completeVerifyFile:%b%n",sha256Pfv.completeVerifyFile(filePath));
            System.out.printf("fastVerifyFile:%b%n",sha256Pfv.fastVerifyFile(filePath,3));
            sha256Pfv.compact(32);
            System.out.printf("compact:%s%n",sha256Pfv.toString());
            System.out.printf("completeVerifyFile:%s%n",sha256Pfv.completeVerifyFile(filePath));

        } catch (Sha256PfvException e) {
            throw new RuntimeException(e);
        }
    }
}
