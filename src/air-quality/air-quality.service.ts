import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { AirQualityData } from '@prisma/client';
import { logger } from 'src/common/logger/winston-logger';

@Injectable()
export class AirQualityService {
  constructor(private prisma: PrismaService) {}

  async getTableColumns() {
    const firstRecord = await this.prisma.airQualityData.findFirst();
    return firstRecord ? Object.keys(firstRecord) : []; // Returns column names dynamically
  }

  async uploadCSV(file: Express.Multer.File): Promise<{ message: string; data: any[] }> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const requiredColumns = [
        'Date',
        'Time',
        'CO(GT)',
        'PT08.S1(CO)',
        'NMHC(GT)',
        'C6H6(GT)',
        'PT08.S2(NMHC)',
        'NOx(GT)',
        'PT08.S3(NOx)',
        'NO2(GT)',
        'PT08.S4(NO2)',
        'PT08.S5(O3)',
        'T',
        'RH',
        'AH',
      ];

      fs.createReadStream(file.path)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          logger.log('Raw Parsed Row:', row); // Debugging log

          // ✅ Validate required columns exist in the CSV header
          const missingColumns = requiredColumns.filter((col) => !(col in row));

          if (missingColumns.length > 0) {
            logger.error(`Missing required columns: ${missingColumns.join(', ')}`);
            reject(
              new BadRequestException(`Missing required columns: ${missingColumns.join(', ')}`),
            );
          }

          try {
            // ✅ Remove empty fields (_15, _16, etc.)
            Object.keys(row).forEach((key) => {
              if (!row[key].trim()) delete row[key];
            });

            if (!row['Date'] || !row['Time']) {
              const errorMessage = `Missing Date or Time field in row: ${JSON.stringify(row)}`;
              logger.error(errorMessage);
              throw new Error(errorMessage);
            }

            // ✅ Convert time format (21.00.00 → 21:00:00)
            const timeStr = row['Time'].trim().replace(/\./g, ':');

            // ✅ Convert date format (DD/MM/YYYY → YYYY-MM-DD)
            const dateParts = row['Date'].trim().split('/');
            if (dateParts.length !== 3) throw new Error(`Invalid date format: ${row['Date']}`);
            const formattedDate = new Date(
              Date.UTC(
                parseInt(dateParts[2]), // Year
                parseInt(dateParts[1]) - 1, // Month (0-indexed)
                parseInt(dateParts[0]), // Day
                parseInt(timeStr.split(':')[0]), // Hour
                parseInt(timeStr.split(':')[1]), // Minute
                parseInt(timeStr.split(':')[2]), // Second
                0, // Millisecond
              ),
            );

            // ✅ Convert comma-decimal values to numbers
            const parseNumber = (value: string) => parseFloat(value.replace(',', '.')) || null;

            results.push({
              date: formattedDate,
              time: timeStr,
              co_gt: parseNumber(row['CO(GT)']),
              pt08_s1_co: parseNumber(row['PT08.S1(CO)']),
              nmhc_gt: parseNumber(row['NMHC(GT)']),
              c6h6_gt: parseNumber(row['C6H6(GT)']),
              pt08_s2_nmhc: parseNumber(row['PT08.S2(NMHC)']),
              nox_gt: parseNumber(row['NOx(GT)']),
              pt08_s3_nox: parseNumber(row['PT08.S3(NOx)']),
              no2_gt: parseNumber(row['NO2(GT)']),
              pt08_s4_no2: parseNumber(row['PT08.S4(NO2)']),
              pt08_s5_o3: parseNumber(row['PT08.S5(O3)']),
              t: parseNumber(row['T']),
              rh: parseNumber(row['RH']),
              ah: parseNumber(row['AH']),
            });
          } catch (error) {
            logger.error(`Error parsing row: ${JSON.stringify(row)} Error: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            logger.log('Final Parsed Data:', results);

            if (results.length > 0) {
              for (const data of results) {
                const existingRecord = await this.prisma.airQualityData.findFirst({
                  where: { date: data.date },
                  select: { id: true }, // Get only the ID of the existing record
                });

                if (existingRecord) {
                  // If the record exists, update it using its ID
                  await this.prisma.airQualityData.update({
                    where: { id: existingRecord.id },
                    data,
                  });
                } else {
                  // If the record doesn't exist, create a new one
                  await this.prisma.airQualityData.create({
                    data,
                  });
                }
              }
            }
            const message = `CSV file processed successfully, ${results.length} records added.`;
            logger.info(message);
            resolve({
              message: message,
              data: results, // Return the uploaded data
            });
          } catch (error) {
            const message = `Database insertion error: ${error.message}`;
            logger.error(message);
            reject(message);
          }
        })
        .on('error', (error) => {
          const message = `CSV parsing error: ${error.message}`;
          logger.error(message);
          reject(message);
        });
    });
  }

  async getAirQualityData(
    startDate: string,
    endDate: string,
    filters: Record<string, { operator: string; value: number }> = {},
  ): Promise<AirQualityData[]> {
    // Convert startDate and endDate to Date objects
    const start = new Date(startDate).toISOString();
    // const end = new Date(endDate).toISOString();
    const end = new Date(endDate + 'T23:59:59.999Z').toISOString(); // Extend to the full day
    const whereCondition: any = {
      date: {
        gte: start,
        lt: end,
      },
    };

    const parseFilter = (operator: string, value: number) => {
      switch (operator) {
        case 'gte':
        case 'lte':
        case 'gt':
        case 'lt':
          return { [operator]: value };
        default:
          return { equals: value };
      }
    };

    // Apply filters dynamically
    for (const [param, { operator, value }] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        console.log(`Applying filter - Param: ${param}, Operator: ${operator}, Value: ${value}`);
        whereCondition[param] = parseFilter(operator, value);
      }
    }

    return await this.prisma.airQualityData.findMany({
      where: whereCondition,
    });
  }

  async parseFilters(filters: string): Promise<any> {
    const validColumns = await this.getTableColumns();
    const parsedFilters = filters.split(',').reduce((acc, filter) => {
      const [param, operator, value] = filter.split(':');

      if (!validColumns.includes(param)) {
        throw new BadRequestException(
          `Invalid parameter ${param} for filter. Allowed parameters: ${validColumns.join(', ')}`,
        );
      }

      const validOperators = ['gte', 'lte', 'gt', 'lt'];
      if (!validOperators.includes(operator)) {
        throw new BadRequestException(`Invalid operator ${operator} for filter ${filter}`);
      }

      if (isNaN(parseFloat(value))) {
        throw new BadRequestException(`Invalid value ${value} for filter ${filter}`);
      }

      acc[param] = { operator, value: parseFloat(value) };
      return acc;
    }, {});
    return parsedFilters;
  }
}
