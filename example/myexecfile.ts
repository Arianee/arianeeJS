import 'regenerator-runtime/runtime';

declare var ArianeeLib;

(async function () {
  const arianee = await new ArianeeLib
    .Arianee()
    .init('testnet');

  const wallet = arianee.fromRandomKey();

  const poa$ = wallet.requestPoa();

  const aria$ = wallet
    .requestAria()
    .then(i => console.log('success getting ARIA'))

  const approveStore$ = wallet
    .methods
    .approveStore()
    .then(i => console.log('success approve store'))

  await Promise.all([poa$, aria$, approveStore$]);

  await wallet.methods.buyCredits('certificate', 2)
    .then(i => console.log('success buying credits'))

  const el = document.createElement('div');
  el.setAttribute('id', 'successFullID');
  const element = document.getElementById('div1');
  el.textContent = 'SUCCESS';

  element.appendChild(el);
})();
