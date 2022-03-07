import { CertificateProofService } from './certificateProofService';

describe('CertificateProofService', () => {
  describe('create proof', () => {
    const createLinkMock = jest.fn();
    const certificateProofService = new CertificateProofService(undefined, undefined, undefined, undefined, undefined, { createLink: createLinkMock, createPassphrase: () => 'generatePassphrase' } as any);

    const handleSpy = jest.spyOn(certificateProofService as any, 'setPassphrase');
    handleSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    beforeEach(() => {
      createLinkMock.mockClear();
    });

    test('should create a valid proof link', async () => {
      await certificateProofService.createCertificateProofLink(12345, 'testtest');
      expect(handleSpy).toHaveBeenCalled();
      expect(createLinkMock).toHaveBeenCalledWith(12345, 'testtest', undefined, 'proof');
    });

    test('should create a valid proof link and generate passphrase if no one is provided', async () => {
      await certificateProofService.createCertificateProofLink(12345);
      expect(handleSpy).toHaveBeenCalled();
      expect(createLinkMock).toHaveBeenCalledWith(12345, 'generatePassphrase', undefined, 'proof');
    });

    test('should create valid link with custom domain if provided', async () => {
      await certificateProofService.createCertificateProofLink(12345, 'testtest', 'nft.arianee.com');
      expect(handleSpy).toHaveBeenCalled();
      expect(createLinkMock).toHaveBeenCalledWith(12345, 'testtest', 'nft.arianee.com', 'proof');
    });
  });
});
