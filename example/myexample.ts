import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';
import { blockchainEventsName } from '../src/models/blockchainEventsName';
import { BlockchainEventWatcherEnum } from '../src/models/enum';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.readOnlyWallet();

  wallet.customWatch({
    contract: wallet.contracts.messageContract,
    filter: { _tokenId: '20130517' },
    blockchainEvent: blockchainEventsName.message.MessageSent,
    eventNames: ['messageReceiveOnTokenId']
  }).on('messageReceiveOnTokenId', () => {
    console.log('hey');
  });
})();
