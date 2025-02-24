import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AirQualityModule } from './air-quality/air-quality.module';

@Module({
  imports: [UsersModule, PrismaModule, AirQualityModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
