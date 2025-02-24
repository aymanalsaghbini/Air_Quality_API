import { Test, TestingModule } from '@nestjs/testing';
import { AirQualityController } from './air-quality.controller';
import { AirQualityService } from './air-quality.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';
import { BadRequestException } from '@nestjs/common';

describe('AirQualityController', () => {
  let controller: AirQualityController;
  let airQualityService: AirQualityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirQualityController],
      providers: [
        {
          provide: AirQualityService,
          useValue: {
            uploadCSV: jest.fn().mockResolvedValue('File uploaded successfully'),
            getAirQualityData: jest.fn().mockResolvedValue([]),
            parseFilters: jest.fn(),
          },
        },
        { provide: Reflector, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AirQualityController>(AirQualityController);
    airQualityService = module.get<AirQualityService>(AirQualityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Reset spyOn methods
  });

  describe('getAirQualityData', () => {
    it('should call getAirQualityData service method with correct params', async () => {
      const query = { startDate: '2024-01-01', endDate: '2024-01-10', filters: undefined };
      const spy = jest.spyOn(airQualityService, 'getAirQualityData');

      await controller.getAirQualityData(query);

      expect(spy).toHaveBeenCalledWith(query.startDate, query.endDate, {});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if startDate or endDate is missing', async () => {
      const invalidQuery = { startDate: '', endDate: '' };
      await expect(controller.getAirQualityData(invalidQuery as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
