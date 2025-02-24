import { Test, TestingModule } from '@nestjs/testing';
import { AirQualityService } from './air-quality.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AirQualityService', () => {
  let service: AirQualityService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirQualityService, PrismaService],
    }).compile();

    service = module.get<AirQualityService>(AirQualityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTableColumns', () => {
    it('should return column names dynamically', async () => {
      jest
        .spyOn(prismaService.airQualityData, 'findFirst')
        .mockResolvedValueOnce({ id: 1, date: new Date(), co_gt: 2.5 } as any);

      const columns = await service.getTableColumns();
      expect(columns).toEqual(['id', 'date', 'co_gt']);
    });

    it('should return an empty array if no data exists', async () => {
      jest.spyOn(prismaService.airQualityData, 'findFirst').mockResolvedValueOnce(null);

      const columns = await service.getTableColumns();
      expect(columns).toEqual([]);
    });
  });

  describe('uploadCSV', () => {
    it('should reject if required columns are missing', async () => {
      const mockFile = { path: 'test.csv' } as Express.Multer.File;
      const mockReadStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') callback({}); // Empty row (missing columns)
          if (event === 'end') callback();
          return mockReadStream;
        }),
      };

      jest.spyOn(require('fs'), 'createReadStream').mockReturnValue(mockReadStream as any);

      await expect(service.uploadCSV(mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAirQualityData', () => {
    it('should return filtered air quality data', async () => {
      const mockData = [
        { id: 1, date: new Date(), co_gt: 2.5 },
        { id: 2, date: new Date(), co_gt: 3.1 },
      ];

      jest.spyOn(prismaService.airQualityData, 'findMany').mockResolvedValueOnce(mockData as any);

      const result = await service.getAirQualityData('2024-01-01', '2024-01-31', {});
      expect(result).toEqual(mockData);
    });
  });
});
