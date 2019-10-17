/*
import { CreateWalletWithPOAAndAria } from "./utils/create-wallet";

    const [wallet1, wallet2] = await Promise.all([
        CreateWalletWithPOAAndAria(
            "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
        ),
        CreateWalletWithPOAAndAria(
            "0x1ad5d1387e5aad7b2a8185b9396366ddad0c158b848ed7b60f7226b5e4e5034e"
        )
    ]);

    it('should create and transfert a certificate', async (callback) => {
        console.log("##########################");
        console.log("wallets with POA and faucet have been initialized");
        console.log("##########################");
        console.log("");

        await wallet1.storeContract.methods.buyCredit(0, 5, wallet1.publicKey).send();

        console.log("hydrate starting");
        const hash = wallet1.web3.utils.keccak256(`ezofnzefon${Date.now()}`);
        const result = await wallet1.methods.createCertificate({
            uri: "https://api.myjson.com/bins/cf4ph",
            hash
        });

        const { certificateId, passphrase } = result;
        console.log(certificateId)
        console.log("hydrate ending");
        console.log(`https://arian.ee/${certificateId},${passphrase}`);

        const nextOwnerWallet = wallet2;

        await nextOwnerWallet
            .getFaucet()
            .then(i => console.log("nextOwnerWallet sucess getting faucet"))
            .catch(i => console.log("nextOwnerWallet error getting faucet"));

        await wallet1.smartAssetContract.methods
            .ownerOf(certificateId)
            .call()
            .then(currentOwner => {
                expect(currentOwner).toBe(wallet1.publicKey)
            });

        console.log("startint request token");
        await nextOwnerWallet.methods
            .requestCertificateOwnership(certificateId, passphrase)
            .then(i => console.log("successss requesting token"));

        const owner = await wallet1.smartAssetContract.methods
            .ownerOf(certificateId)
            .call();

        expect(owner).toBe(nextOwnerWallet.publicKey)

        await wallet2.getCertificate(certificateId)
            .then(i => console.log(i.isOwner))

        console.log("FINISH!!");
        callback()

    }, 100000000)

    */