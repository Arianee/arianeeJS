#  Release notes

**hash**: e8f672312c52753a528c65a5b78c1744e4841ee2
**date**: 2019-10-08 15:55:18 +0200

## **feat (25):**
 - feat(store): Add store for web3 call #81
 - feat: expose getIdentity method
 - feat(chain): return chain name when wallet&#39;s current chain is not the same
 - feat(send): request poa before send transaction in overridesend
 - feat: add timestamp to events
 - feat(events): get pending status in arianee events #92
 - feat: expose utilsService in wallet
 - feat(certificate): certificateSummary has cerficiatedId property
 - feat(certificates): certificates are ordered by ownership date desc
 - feat(network): arianeejs can be run on arianeeTestnet
 - feat(certificate): getMyCertificates groupBy issuers
 - feat: rename getAria requestAria getFaucet requestPoa
 - feat(certificate): getAllMyCertificate accept query parameters
 - feat(init): connectToProtocol is deprecated in favor of init
 - feat(certificate): optimize data query
 - feat(requestToken): method isRequestable + .call is overiden
 - feat(fetch): implement cache manager
 - feat(event): can get arianee events #5
 - feat(config): faucet url and deepLink in configurations
 - feat(createWallet): from mnemonic
 - feat(identity): identity return a clean and typed object
 - feat(proof): user can read a proof send by an owner #9
 - feat(config): get adresses from remote
 - feat(transfer): user can make transfer of certificate with passphrase
 - feat(readme): make a simple and clear readme

## **test (5):**
 - test(ci): add gitool to project and ci
 - test(tnr): test public key private key from same mnemonic
 - test(travis): speed up job with caches
 - test(uat): improve performance on getAria, getFaucet and browser tests
 - test(e2e): add test browser

## **fix (12):**
 - fix(rpc): rpc call throw error if in error to allow get fallback
 - fix(deeplink): remove &#x2F; to mainnet deeplink
 - fix: send back address in identity
 - fix: change key for fetch with cache
 - fix(rpcCache): rpc cache is now based on method and url + add simple cache override
 - fix(arianee): a wallet can be instantiate from same arianee lib
 - fix(arianee): a wallet can be instantiate from same arianee lib
 - fix(identity): identity content interface is updated with v2
 - fix:  param in myexample.ts
 - fix(mainnet): can connect to mainnet even without events
 - fix(urlParsed): stop using URL and use parsedURL polyfill
 - fix(e2e): add e2e test for create certificate

## **chore (10):**
 - chore: add blockchain event typing
 - chore: add eslint
 - chore: update web3 to 1.2.2
 - chore(readme): update readme and add arianee doc link
 - chore(myexample): put each function in a file
 - chore(lint): fix lint and prettier
 - chore(lint): add indent in tslint
 - chore: parallel test 8 &#x3D;&gt; 4
 - chore(tslint): add tslint &amp; tslint check in test
 - chore(ci): remove unecessary script

## **refactor (5):**
 - refactor: boolean &#x3D;&gt; extendedBoolean
 - refactor: change certificate param &#x3D;&gt; content param in createCertificate
 - refactor: isCertificateProofValid return false instead of catch
 - refactor: proof link with suffix
 - refactor(wallet): remove extends and create a WalletCustomMethods class







