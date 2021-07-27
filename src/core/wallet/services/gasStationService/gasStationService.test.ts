import { GasStationService } from './gasStationService';

describe('gas station service', () => {
  describe('gas station url is defined', () => {
    it('should return default gasPrice if gas station not working', async () => {
      const gasStationService = new GasStationService({
        arianeeConfiguration: {
          gasStationURL: 'https://www.myGasStation.com',
          transactionOptions: {
            gasPrice: 42
          }
        }
      } as any,
          {
            fetch: () => {
              return Promise.reject({ message: 'mock to pretend gas station is not working' });
            }
          }as any
      );

      const gasPrice = await gasStationService.fetchGas();
      expect(gasPrice).toBe(42);
    });
    it('should return gas station data *20%', async () => {
      const gasStationService = new GasStationService({
        arianeeConfiguration: {
          gasStationURL: 'https://www.myGasStation.com',
          transactionOptions: {
            gasPrice: 42
          }
        }
      } as any,
          {
            fetch: () => {
              return Promise.resolve(
                {
                  standard: 10
                }
              );
            }
          }as any
      );

      const gasPrice = await gasStationService.fetchGas();
      expect(gasPrice).toBe('12000000000');
    });
  });
  describe('gas station url is not defined', () => {
    it('should return default gasPrice',
      async () => {
        const gasStationService = new GasStationService({
          arianeeConfiguration: {
            transactionOptions: {
              gasPrice: 42
            }
          }
        } as any,
          {
            fetch: () => {
              return Promise.resolve({
                standard: 10
              });
            }
          }as any
        );

        const gasPrice = await gasStationService.fetchGas();
        expect(gasPrice).toBe(42);
      });
  });
});
