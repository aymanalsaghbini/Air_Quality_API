import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Assuming your PrismaService is in this path

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
