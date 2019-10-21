import { ArianeeHttpClient } from "./arianeeHttpClient";

const mockResponse = "mockResponse";

const countMock = jest.fn();
const url = "https://myurl.com/zef";

jest.mock("axios", () => url => {
  countMock(url);

  return new Promise((resolve, reject) => {
    // simulate real promise
    setTimeout(() => {
      resolve({ data: mockResponse });
    });
  });
});

describe("ArianeeHttpClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetch", () => {
    it("should", async () => {
      const httpClient = new ArianeeHttpClient();
      const result = await httpClient.fetch(url);
      expect(countMock).toHaveBeenCalledTimes(1);
      expect(countMock).toHaveBeenCalledWith(url);

      expect(result).toBe(mockResponse);
    });

    it("should fetch twice with 2 calls", async () => {
      const httpClient = new ArianeeHttpClient();
      const result = await httpClient.fetch(url);
      await httpClient.fetch(url);
      expect(countMock).toHaveBeenCalledWith(url);
      expect(countMock).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockResponse);
    });
  });
  describe("fetchWithCache", () => {
    it("should fetch onne", async () => {
      const httpClient = new ArianeeHttpClient();
      const result = await httpClient.fetchWithCache(url);
      expect(countMock).toHaveBeenCalledWith(url);
      expect(countMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });
    it("should fetch once with 2 calls at same time", async () => {
      const httpClient = new ArianeeHttpClient();
      httpClient.fetchWithCache(url);
      httpClient.fetchWithCache(url);

      const result = await httpClient.fetchWithCache(url);
      expect(countMock).toHaveBeenCalledWith(url);
      expect(countMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });

    it("should fetch once with 2 calls one after the other", async () => {
      const httpClient = new ArianeeHttpClient();
      await httpClient.fetchWithCache(url);
      expect(countMock).toHaveBeenCalledTimes(1);

      const result = await httpClient.fetchWithCache(url);
      await httpClient.fetchWithCache(url);

      expect(countMock).toHaveBeenCalledWith(url);
      expect(countMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });
  });
});
