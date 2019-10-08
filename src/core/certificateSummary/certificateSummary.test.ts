import { CertificateSummaryBuilder } from "./certificateSummaryBuilder";

describe("It should build a certificate", () => {
  const quickWallet = { publicKey: "OWNERKEY" };
  const content = <any>{ content: "content" };

  it("should be the owner of certificate", () => {
    const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
      .setOwner(quickWallet.publicKey)
      .setIsCertificateValid(true)
      .setContent(<any>{ content: "content" })
      .build();

    expect(arianeeCertificate.isOwner).toBe(true);
    expect(arianeeCertificate.content).toEqual(content);
  });

  it("should be the owner of certificate", () => {
    const arianeeCertificate = new CertificateSummaryBuilder(<any>{
      publicKey: "zefozef"
    })

      .setOwner(quickWallet.publicKey)
      .setIsCertificateValid(true)
      .setContent(<any>{ content: "content" })
      .build();

    expect(arianeeCertificate.isOwner).toBe(false);
    expect(arianeeCertificate.content).toEqual(content);
  });
});
