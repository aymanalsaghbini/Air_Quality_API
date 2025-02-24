import {
  Controller,
  Post,
  Get,
  Query,
  HttpException,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AirQualityService } from './air-quality.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as fs from 'fs';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { GetAirQualityDataDto } from './dto/air-quality.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Air Quality')
@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data') // Define that the request consumes multipart/form-data
  @ApiOperation({ summary: 'Upload a CSV file for air quality data' })
  @ApiBody({
    description: 'CSV file to upload',
    type: 'multipart/form-data', // Specify type as 'string' since the file is sent as binary data
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protect with JWT and roles guard
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads', // Save files in the 'uploads' folder as backup
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype !== 'text/csv') {
          return cb(
            new BadRequestException('Invalid file type. Only CSV files are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or file is empty',
  })
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded.');
      }

      // Validate file size (check if empty)
      const stats = fs.statSync(file.path);
      if (stats.size === 0) {
        throw new BadRequestException('Uploaded file is empty.');
      }

      // Call the service method and return success message
      const message = await this.airQualityService.uploadCSV(file);
      return { message };
    } catch (error) {
      // Log the error and send a detailed response to the client
      // If the error is already a BadRequestException, throw it as it is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // For unexpected errors, throw a generic Internal Server Error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('data')
  @ApiOperation({
    summary: 'Get air quality data with optional filters and operators',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2004-03-11',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2004-03-01',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    example: 'co_gt:gte:2.0,nmhc_gt:lt:100',
    description:
      'Optional filters in "param:operator:value" format. Example: "co_gt:gte:2.0,nmhc_gt:lt:100"',
  })
  @ApiResponse({ status: 200, description: 'Successfully fetched data' })
  async getAirQualityData(@Query() query: GetAirQualityDataDto) {
    const { startDate, endDate, filters } = query;

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required.');
    }

    let parsedFilters = {};

    if (filters) {
      parsedFilters = await this.airQualityService.parseFilters(filters);
    }

    return this.airQualityService.getAirQualityData(startDate, endDate, parsedFilters);
  }
}
