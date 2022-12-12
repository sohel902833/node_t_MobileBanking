
import {SHA256,enc} from 'crypto-js'

export const encryptText=(text:string):string=>{
    // const encrypted:string = cryptr.encrypt(text);
    const encrypted:any = SHA256(text);
    return encrypted;
}
export const decryptText=(encryptText:string):string=>{
    // const decrypted:string = cryptr.decrypt(encryptText);
    // return decrypted;
    return ""
}



// import {Rabbit} from 'crypto-js'

// export const encryptText=(text:string):string=>{
//     const encrypted:any = Rabbit.encrypt(text, "Secret");
//     return encrypted;
// }
// export const decryptText=(encryptText:string):string=>{
//     const decrypted:any = Rabbit.decrypt(encryptText, "Secret");
//     return decrypted;
// }