declare var ArianeeLib;

(async function () {
  const arianee = await new ArianeeLib
    .Arianee()
    .init();

  const wallet = arianee.fromRandomKey();

  await wallet.requestPoa();

  await wallet
    .requestAria()
    .then(i => console.log("success getting ARIA"))
    .catch(i => console.log("error getting ARIA"));

  await wallet.ariaContract.methods
    .approve(
      wallet.storeContract.options.address,
      "10000000000000000000000000000"
    ).send()
    .then(i => console.log("success approve store"))
    .catch(i => console.log("error approve store"));

  await wallet.storeContract.methods.buyCredit(0, 5, wallet.publicKey).send()
    .then(i => console.log("success buying credits"))
    .catch(i => console.log("error buying credits"));

  const el = document.createElement("div");
  el.setAttribute("id", "successFullID");
  const element = document.getElementById("div1");
  el.textContent = "SUCCESS";

  element.appendChild(el);
})();
