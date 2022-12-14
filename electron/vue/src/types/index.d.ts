import {computeSha256PfvResult, showOpenDialogOptions, verifySha256PfvResult} from "@/types/electron";

export {};

declare global {
    interface Window{
        showOpenDialog: (options: showOpenDialogOptions)=>Promise<showOpenDialogResult>;
        getSha256PfvInfo : (sha256PfvHexString: string)=>Promise<getSha256PfvInfoResult>;
        completeVerifySha256PfvByFile: (filePath:string, sha256PfvHexString: string)=>Promise<verifySha256PfvResult>;
        computeSha256PfvByFile: (filePath: string, maxCompleteHashLength: number) => Promise<computeSha256PfvResult>;
    }
}