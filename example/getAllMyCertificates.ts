import {CreateWalletWithPOAAndAria} from "../src/e2e/utils/create-wallet";

export const getAllCertificates = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const result = await wallet.methods.getMyCertificates({
    isRequestable: false,
    content: false,
    issuer: true,
    owner: false,
    events: false,
    advanced: false,
  });
  console.log("result", result);
};
