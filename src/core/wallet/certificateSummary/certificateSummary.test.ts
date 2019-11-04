import { CertificateSummaryBuilder } from "./certificateSummaryBuilder";

describe("certificateSummaryBuilder", () => {
  const content = <any>{ content: "content" };

  describe("It should build a certificate", () => {
    it("should be returning only set properties", () => {
      const arianeeCertificate = new CertificateSummaryBuilder()
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
      const arianeeCertificate = new CertificateSummaryBuilder()
          .setOwner("OWNERKEY",'OWNERKEY')
          .build();

      expect(arianeeCertificate.owner.isOwner).toBeTruthy();
    });

    it("should be not the owner", () => {
      const arianeeCertificate = new CertificateSummaryBuilder()
        .setOwner("notTheOwner",'anotherPublicKey')
        .build();

      expect(arianeeCertificate.owner.isOwner).toBeFalsy();
    });
  });

  describe("certificateId",()=>{
    it("should have certificateId",()=>{
      const certificateId='222';

      const arianeeCertificate = new CertificateSummaryBuilder()
          .setCertificateId(certificateId)
          .setOwner("OWNERKEY",'anotherPublicKey')
          .build();

      expect(arianeeCertificate.certificateId).toBe(certificateId);
    });
  });

  describe("events", () => {
    it("should work with only arianeeEvents", () => {
      const arianeeCertificate = new CertificateSummaryBuilder()
        .setArianeeEvents([{ blockNumber: 0 }, { blockNumber: 2 }])
        .build();

      expect(arianeeCertificate.events.all).toEqual([
        { blockNumber: 0 },
        { blockNumber: 2 }
      ]);
    });

    it("should work with only events", () => {
      const arianeeCertificate = new CertificateSummaryBuilder()
        .setEvents([{ blockNumber: 1 }, { blockNumber: 0 }])
        .build();

      expect(arianeeCertificate.events.all).toEqual([
        { blockNumber: 0 },
        { blockNumber: 1 }
      ]);
    });

    it("should have all events sorted", () => {
      const arianeeCertificate = new CertificateSummaryBuilder()
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
