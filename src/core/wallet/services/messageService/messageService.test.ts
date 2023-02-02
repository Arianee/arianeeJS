import { MessageService } from './messageService';

describe('Message Service', () => {
  const mockMessageFactory = () => ({
    certificateId: '477240924',
    to: '0x4967f96A952096Cb1802D375cB70314f8729A977',
    from: '0x57F5111A7e997a7Ba63CC8976C92decbd86C1B08',
    messageId: 274101524,
    issuer:
      {
        isIdentityVerified: true,
        isIdentityAuthentic: true,
        imprint:
          '0x1632d4104f25f2491ccedb3f328668ef7b8be84f45316c86ee869b5e71adb0ab',
        identity:
          {
            data: [Object],
            isAuthentic: true,
            isApproved: true,
            imprint:
              '0x1632d4104f25f2491ccedb3f328668ef7b8be84f45316c86ee869b5e71adb0ab',
            address: '0x57F5111A7e997a7Ba63CC8976C92decbd86C1B08'
          }
      },
    content:
      {
        data: {
          $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
          language: 'description default',
          title: 'title default',
          content: 'content default',
          i18n:
            [{
              language: 'fr-FR',
              title: 'mon titre FR',
              content: 'content FR',
              externalContents: []
            },
            {
              language: 'ko-KR',
              title: 'titre KO',
              content: 'content KO',
              externalContents: []
            }]
        },
        imprint:
          '0xd33c7276bddca27f629849b8c2e577be6059ef429a060217e49b4179614b2835',
        isAuthentic: true
      },
    timestamp: 1599123240000,
    isRead: false
  });

  it('should create', () => {
    const messageService = new MessageService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    expect(messageService).toBeDefined();
  });

  it('should not translate if no query', async (done) => {
    const messageService = new MessageService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const mockMessage = mockMessageFactory();
    messageService.fetchRawMessage = jest.fn().mockImplementation(() => Promise.resolve(mockMessage));

    const message = await messageService.fetchMessage({ messageId: 274101524 });

    expect(message).toEqual(mockMessageFactory());
    done();
  });
  it('should translate if  query', async (done) => {
    const storeGetMock = jest.fn();
    const messageService = new MessageService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        get: storeGetMock
      } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
    const mockMessage = mockMessageFactory();

    storeGetMock.mockImplementation(() => Promise.resolve(mockMessage));
    const message = await messageService.getMessage({ messageId: 274101524, query: { advanced: { languages: ['fr'] } } });

    expect(message.content.data.content).toBe('content FR');
    expect(message.content.data.title).toBe('mon titre FR');
    expect(message.content.data.language).toBe('fr-FR');
    done();
  });
});
