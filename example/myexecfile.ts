declare var ArianeeLib;

const waitFor = (n = 8000) => {
        console.log('waiting')
  
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
  
            resolve('foo');
          }, n);
        });
      }
  
      async function myTest() {
        var wallet = ArianeeLib.Arianee()
          .fromRandomKey();
  
        console.log(wallet.publicKey)
  
        await wallet.getFaucet();
  
        await waitFor(7000);
  
        await wallet
          .getAria()
          .then(i => console.log("success getting ARIA"))
          .catch(i => console.log("error getting ARIA"));
  
        await waitFor(7000);
  
        console.log(wallet.storeContract.options.address);
        await wallet.ariaContract.methods
          .approve(
            wallet.storeContract.options.address,
            "10000000000000000000000000000"
          ).send()
          .then(i => console.log("success approve store"))
          .catch(i => console.log("error approve store"));
  
        await wallet.storeContract.methods.buyCredit(0, 5, wallet.publicKey).send()
          .then(i => console.log("success buying credits"))
          .catch(i => console.log("error buying credits"))
  
        const el = document.createElement("div")
        el.setAttribute("id", "successFullID");
        const element = document.getElementById("div1");
        await waitFor(7000);
        element.appendChild(el);
  
      }
  
      myTest();