import { CertificateSummaryBuilder } from "./certificateSummaryBuilder";

describe("certificateSummaryBuilder", () => {

  const quickWallet = { publicKey: "OWNERKEY" };
  const content = <any>{ content: "content" };

  describe('It should build a certificate', () => {

    it("should be returning only set properties", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setContent(<any>{ 'mycontent': 'zefezf' }, true)
        .build();

      expect(arianeeCertificate.content).toBeDefined();
      expect(arianeeCertificate.hasOwnProperty('events')).toBeFalsy();
      expect(arianeeCertificate.hasOwnProperty('advanced')).toBeFalsy();
      expect(arianeeCertificate.hasOwnProperty('issuer')).toBeFalsy();
    });
  })
  describe('the owner', () => {

    it("should be the owner", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setOwner('OWNERKEY')
        .build();

      expect(arianeeCertificate.owner.isOwner).toBeTruthy();
    });

    it("should be not the owner", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setOwner('notTheOwner')
        .build();

      expect(arianeeCertificate.owner.isOwner).toBeFalsy();
    });
  })

});
