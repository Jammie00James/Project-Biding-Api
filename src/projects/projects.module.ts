import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtService],
})
export class ProjectsModule {}
