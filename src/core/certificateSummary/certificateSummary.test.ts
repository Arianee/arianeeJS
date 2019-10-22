import { CertificateSummaryBuilder } from "./certificateSummaryBuilder";

describe("certificateSummaryBuilder", () => {
  const quickWallet = { publicKey: "OWNERKEY" };
  const content = <any>{ content: "content" };

  describe("It should build a certificate", () => {
    it("should be returning only set properties", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setContent(<any>{ mycontent: "zefezf" }, true)
        .build();

      expect(arianeeCertificate.content).toBeDefined();
      expect(arianeeCertificate.hasOwnProperty("events")).toBeFalsy();
      expect(arianeeCertificate.hasOwnProperty("advanced")).toBeFalsy();
      expect(arianeeCertificate.hasOwnProperty("issuer")).toBeFalsy();
    });
  });
  describe("the owner", () => {
    it("should be the owner", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setOwner("OWNERKEY")
        .build();

      expect(arianeeCertificate.owner.isOwner).toBeTruthy();
    });

    it("should be not the owner", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setOwner("notTheOwner")
        .build();

      expect(arianeeCertificate.owner.isOwner).toBeFalsy();
    });
  });

  describe("events", () => {
    it("should work with only arianeeEvents", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setArianeeEvents([{ blockNumber: 0 }, { blockNumber: 2 }])
        .build();

      expect(arianeeCertificate.events.all).toEqual([
        { blockNumber: 0 },
        { blockNumber: 2 }
      ]);
    });

    it("should work with only events", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setEvents([{ blockNumber: 1 }, { blockNumber: 0 }])
        .build();

      expect(arianeeCertificate.events.all).toEqual([
        { blockNumber: 0 },
        { blockNumber: 1 }
      ]);
    });

    it("should have all events sorted", () => {
      const arianeeCertificate = new CertificateSummaryBuilder(<any>quickWallet)
        .setArianeeEvents([{ blockNumber: 0 }, { blockNumber: 2 }])
        .setEvents([{ blockNumber: 1 }])
        .build();

      expect(arianeeCertificate.events.all).toEqual([
        { blockNumber: 0 },
        { blockNumber: 1 },
        { blockNumber: 2 }
      ]);
    });
  });
});
