import appConfig from './appConfigurations';

import ariaV1 from '@arianee/arianee-abi/abi/js/V1/Aria';
import creditHistoryV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeCreditHistory';
import eventArianeeV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeEvent';
import identityV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeIdentity';
import smartAssetV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeSmartAsset';
import stakingV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeStaking';
import storeV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeStore';
import whitelistV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeWhitelist';
import lostV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeLost';
import messageV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeMessage';
import userActionV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeUserAction';
import updateSmartAssetsV1 from '@arianee/arianee-abi/abi/js/V1/ArianeeUpdate';

import ariaV2 from '@arianee/arianee-abi/abi/js/V2/Aria';
import creditHistoryV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeCreditHistory';
import eventArianeeV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeEvent';
import identityV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeIdentity';
import smartAssetV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeSmartAsset';
import stakingV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeStaking';
import storeV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeStore';
import whitelistV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeWhitelist';
import lostV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeLost';
import messageV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeMessage';
import userActionV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeUserAction';
import updateSmartAssetsV2 from '@arianee/arianee-abi/abi/js/V2/ArianeeUpdate';


const contracts = {
  1:{
    identity: identityV1,
    store : storeV1,
    smartAsset : smartAssetV1,
    aria: ariaV1,
    eventArianee : eventArianeeV1,
    creditHistory : creditHistoryV1,
    whitelist : whitelistV1,
    staking : stakingV1,
    lost : lostV1,
    message : messageV1,
    userAction : userActionV1,
    updateSmartAssets : updateSmartAssetsV1
  },
  2:{
    identity: identityV2,
    store : storeV2,
    smartAsset : smartAssetV2,
    aria: ariaV2,
    eventArianee : eventArianeeV2,
    creditHistory : creditHistoryV2,
    whitelist : whitelistV2,
    staking : stakingV2,
    lost : lostV2,
    message : messageV2,
    userAction : userActionV2,
    updateSmartAssets : updateSmartAssetsV2
  }
}

export {
  appConfig,
  contracts
};
