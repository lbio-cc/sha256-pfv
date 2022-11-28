package cc.naio.sha256pfv.lib;

import cc.naio.sha256pfv.Sha256PfvException;

import java.io.*;

public class FileWrapper {
    File file;
    RandomAccessFile randomAccessFile;

    public FileWrapper(String path) throws Sha256PfvException {
        file = new File(path);
        if(!file.exists()){
            throw new Sha256PfvException("未找到文件", Sha256PfvException.FILE_INVALID);
        }
        if(!file.isFile()){
            throw new Sha256PfvException("文件路径为目录", Sha256PfvException.FILE_INVALID);
        }
        try {
            randomAccessFile = new RandomAccessFile(file,"r");
        }
        catch (FileNotFoundException e){
            throw new Sha256PfvException("未找到文件", Sha256PfvException.FILE_INVALID);
        }
    }

    public long getSize(){
        return file.length();
    }

    public byte[] getFileContent(long offset, int length) throws Sha256PfvException {
        try {
            int readLength = (int)Math.min(file.length() - offset, length);

            byte[] buffer = new byte[readLength];
            randomAccessFile.seek(offset);
            randomAccessFile.read(buffer, 0, readLength);
            return buffer;
        }
        catch (IOException e){
            throw new Sha256PfvException("读文件错误:"+e.getMessage(), Sha256PfvException.FILE_IO_ERROR);
        }
    }
}
