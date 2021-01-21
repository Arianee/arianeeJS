import { ArianeeHttpClient } from './arianeeHttpClient';
import axios from 'axios';

jest.mock('axios');
const axiosMock: jest.Mock = (axios as any);
describe('ArianeeHttpClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('without interceptor', async (done) => {
    const arianeeHttpClient = new ArianeeHttpClient();
    axiosMock.mockImplementation(() => Promise.resolve({ data: 'my data' }));
    const data = await arianeeHttpClient.fetch('http://lemonde.fr');
    expect(data).toBe('my data');
    expect(axiosMock).toHaveBeenCalledTimes(1);
    expect(axiosMock).toHaveBeenCalledWith('http://lemonde.fr', ArianeeHttpClient.defaultConfig);
    done();
  });

  test('DEV with interceptor', async (done) => {
    const arianeeHttpClient = new ArianeeHttpClient()
      .setRequestInterceptor((url, config) => {
        return Promise.resolve({
          url: 'https://www.wikipedia.com', config
        });
      });

    await arianeeHttpClient.fetch('http://lemonde.fr');
    expect(axiosMock).toHaveBeenCalledTimes(1);
    expect(axiosMock.mock.calls[0][0]).toBe('https://www.wikipedia.com');
    done();
  });
});
