const Sha256Pfv = require("../sdk/Sha256Pfv");
const filePath = "C:\\fontawesome-pro-5.15.3-web.zip";
let sha256Pfv = Sha256Pfv.fromFile(filePath, 64);

console.log(sha256Pfv.toString());
console.log(`completeVerifyFile:${sha256Pfv.completeVerifyFile(filePath)}`);
console.log(`fastVerifyFile:${sha256Pfv.fastVerifyFile(filePath,3)}`);
sha256Pfv.compact(32);
console.log(`compact:${sha256Pfv.toString()}`);
console.log(`completeVerifyFile:${sha256Pfv.completeVerifyFile(filePath)}`);