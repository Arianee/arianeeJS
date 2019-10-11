import Contract from "web3/eth/contract";
import { Transaction, TransactionObject } from "web3/eth/types";
import { ServicesHub } from "../servicesHub";
import ArianeeWallet from "../wallet";
import { flatPromise } from "./flat-promise";

export class ArianeeContract<ContractImplementation extends Contract> {
    public key: ContractImplementation;

    public constructor(private contract: Contract, private wallet: ArianeeWallet, private arianeeState: ServicesHub) {
        if (contract === undefined) {
            throw new Error("contract is undefined");
        }
        this.key = <ContractImplementation>contract;
        Object.keys(this.key.methods).forEach((method) => {
            const b = contract.methods[method];
            if (!method.startsWith("0")) {
                this.key.methods[method] = (...args) => {
                    return {
                        ...b.bind(b)(...args),
                        send: (transaction: Transaction) => this.overideSend(transaction, b.bind(b)(...args)),
                    };

                };
            }
        });
    }
    public makeArianee(): ContractImplementation {
        return this.key;
    }

    /**
     * arianeeSignMetamask
     * @param nonce
     * @param contractAddress
     * @param data
     */
    public arianeeSignMetamask(transaction): Promise<any> {
        const { resolve, promise, reject } = flatPromise();

        this.arianeeState.web3.eth.sendTransaction(transaction, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }

        });

        return promise;
    }

    private overideSend = async (transaction: Transaction, data: TransactionObject<any>): Promise<any> => {
        const nonce = await this.arianeeState.web3.eth
            .getTransactionCount(this.wallet.publicKey, "pending");

        const encodeABI = data.encodeABI();
        const defaultTransaction = {
            nonce,
            chainId: this.arianeeState.contracts.arianeeConfig.chainId,
            from: this.wallet.publicKey,
            data: encodeABI,
            to: this.contract.options.address,
            gasLimit: 2000000,
            gasPrice: this.arianeeState.web3.utils.toWei("1", "gwei"),
        };
        const mergedTransaction = { ...defaultTransaction, ...transaction };
        const { resolve, reject, promise } = flatPromise();

        // if (this.arianeeProtocolInstance.isMetamaskProvider) {
        //     return this.arianeeSignMetamask(mergedTransaction);
        //} else {

        this.wallet.account
            .signTransaction(mergedTransaction)
            .then((result) => {
                return this.arianeeState.web3.eth.sendSignedTransaction(result.rawTransaction)
                    .on("confirmation", (confirmationNumber, receipt) => {
                        resolve({
                            result,
                            confirmationNumber,
                            receipt
                        });
                    });
            }).catch((err) => {
                console.error(err);
                reject(err);
            });

        return promise;
        // }
    }
}
