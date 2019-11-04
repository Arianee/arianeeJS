import { ProtocolConfigurationBuilder } from './protocolConfigurationBuilder';

describe('ProtocolConfigurationBuilder', () => {
  test('it should not build before all properties are checked', () => {
    const isReady = new ProtocolConfigurationBuilder().isReadyForBuild()
      .isValid;

    expect(isReady).toBe(false);
  });
  test('it should  build if all properties are checked', () => {
    const protocolBuilder = new ProtocolConfigurationBuilder();
    const contracts = [
      'store',
      'aria',
      'smartAsset',
      'identity',
      'staking',
      'whitelist',
      'creditHistory'
    ];

    contracts.forEach(contract => {
      protocolBuilder.setSmartContractConfiguration(contract, {}, '');
    });

    const isReady = protocolBuilder
      .setFaucetUrl('')
      .setWeb3HttpProvider('', 12)
      .isReadyForBuild().isValid;

    expect(isReady).toBe(true);
  });
});
