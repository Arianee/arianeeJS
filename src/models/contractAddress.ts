export interface ContractAdresses {
    smartAssets: string;
    identity: string;
    aria: string;
    store: string;
    staking: string;
    creditHistory: string;
    whitelist: string;
    event: string;
    message: string;
    lost: string;
    updateSmartAssets: string;
}

export interface ContractAddressConvention {
    contractAdresses: ContractAdresses;
    httpProvider: string;
    gasStation: string;
    chainId: number;
}
