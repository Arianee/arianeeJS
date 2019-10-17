import { World } from "cucumber";
import { ArianeeWallet } from "../../../src/core/wallet";

export class CCStore {

    private users: ArianeeWallet[] = [];
    private tokens: number[] = [];
    private cache = {};

    public getUserWallet(userIndex: number): ArianeeWallet {
        return this.users[userIndex];
    }

    public storeWallet(userIndex: number, wallet: ArianeeWallet) {
        this.users[userIndex] = wallet;
    }

    public getToken(tokenIndex) {
        return this.tokens[tokenIndex];
    }

    public storeToken(tokenIndex, certificateId: number) {
        this.tokens[tokenIndex] = certificateId;
    }

    public storeCustom(key, value) {
        this.cache[key] = value;
    }

    public getCustom(key): any {
        return this.cache[key];
    }
}
