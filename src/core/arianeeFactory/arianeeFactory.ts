import * as configProd from "../../configuration/prod";
import { ProtocolConfigurationBuilder } from "../protocolConfigurationBuilder/protocolConfigurationBuilder";

import { ArianeeWalletBuilder } from "../wallet/walletBuilder";

export const ArianeeFactory = (confOverride?): ArianeeWalletBuilder => {

    const conf = confOverride ? confOverride : configProd;

    return new ProtocolConfigurationBuilder()
        .setConfig(conf.arianJSON)
        .setIdentityAbi(conf.arianeeIdentity)
        .setStoreAbi(conf.arianeeStore)
        .setTokenAbi(conf.arianeeToken)
        .setAria(conf.arianeeAria)
        .setCreditHistory(conf.arianeeCreditHistory)
        .setStaking(conf.arianeeStacking)
        .setEventArianee(conf.arianeeEvent)
        .setWhiteList(conf.arianeeWhiteList)
        .build();
};
