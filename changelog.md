#  Release notes

**version**: v0.43.0

## **chore (13):**
 - chore(version): bump to version 1.0.0
 - chore(getMyCertificates): improve error log
 - chore(logs): add logs for fetch certificate
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

## **fix (25):**
 - fix(batch): fix batch script + add example
 - fix(createCertificate): return directly deeplink
 - fix(proof): Correct message error
 - fix(getCertificate): translate certificate only if user query needs content
 - fix(query): advanced is always defined in query
 - fix(typing): fix typescript error on CertificateSummary
 - fix(getIdentity): Fix getIdentity when waiting identity is default
 - fix(fromArianeeVault): remove bdhvault in walletBuilder and add a setter in ArianeeWallet
 - fix(getMyCertificates): certificates are ordered by date of ownership
 - fix(events): pass certificated id to getCertificateTransfertEvents
 - fix(getIdentity): fix to be retrocompatible
 - fix(getCertificate): waiting identity was always verified&#x3D;false
 - fix(store): change namespace to avoid conflict
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

## **feat (47):**
 - feat(createCertificate): Create certificate batch
 - feat(getCertificate): return deepLink
 - feat(recoverCertificate): issuer can recover certificate
 - feat(destroyCertificate): user can destroy a certificate
 - feat(web3customProviders): on init can overide web3customprovider
 - feat(identity): getIdentity reject if no id and store does not store error.
 - feat(getCertificate): rpcEndpoint can be overide in query
 - feat(getMyCertificates): language can be chosen in query
 - feat(events): create events and store events content in rpc
 - feat(transferCertificate): passphrase can only be used once to request certificate
 - feat(rewardadresses): reward and bdh reward can be set on init arianee
 - feat(createCertificate): method to store content in rpc server
 - feat(fromArianeeVault): be able to sign transaction in arianee vault
 - feat(getCertificate): add imprint to certificate summary
 - feat(getCertificate): query object is every to sub functions
 - feat(getCertificate): getMyCertificateIds is stored and can be refresh
 - feat(message): get message sender authorization + add&#x2F;remove sender from blacklist
 - feat(proof): Return proof creation timestamp
 - feat(store): can pass parameter force refresh to identity
 - feat(getCertificate): getCertificate with waiting identity + global option setter
 - feat(store): remove http cache on rpc and simple http cache
 - feat(eventWatcher): add blockchain event watcher
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

## **test (9):**
 - test(e2e): get identity is not defined in testnet
 - test(firefox): e2e test on firefox
 - test(getCertificate): create e2e test for waiting identity
 - test(eventWatcher): add unit test to eventWatcher
 - test(ci): add gitool to project and ci
 - test(tnr): test public key private key from same mnemonic
 - test(travis): speed up job with caches
 - test(uat): improve performance on getAria, getFaucet and browser tests
 - test(e2e): add test browser

## **docs (1):**
 - docs(changelog): add gt changlog in npm script

## **refactor (5):**
 - refactor: boolean &#x3D;&gt; extendedBoolean
 - refactor: change certificate param &#x3D;&gt; content param in createCertificate
 - refactor: isCertificateProofValid return false instead of catch
 - refactor: proof link with suffix
 - refactor(wallet): remove extends and create a WalletCustomMethods class







