import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { CloudinaryProvider } from 'src/common/cloudinary/cloudinary.provider';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryProvider],
  exports: [UsersService],
})
export class UsersModule {}
