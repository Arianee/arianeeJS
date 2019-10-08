import { World } from "cucumber";
import { Wallet } from "../../../src/core/wallet";

export class CCStore{

    private users:Wallet[]=[];
    private tokens:number[]=[];

    public getUserWallet(userIndex:number):Wallet{
        return this.users[userIndex]
    }

    public storeWallet(userIndex:number,wallet:Wallet){
        this.users[userIndex]=wallet;
    }

    public getToken(tokenIndex){
        return this.tokens[tokenIndex];
    }

    public storeToken(tokenIndex,tokenId:number){
        this.tokens[tokenIndex]=tokenId;
    }
}
