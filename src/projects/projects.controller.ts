import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateBidDto, CreateProjectDto } from './dto/projects.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard)
  @Post('')
  async createProject(
    @Request() req,
    @Body(new ValidationPipe()) newDto: CreateProjectDto,
  ): Promise<any> {
    try {
      const user = req.user;
      const res = await this.projectsService.createProject(user, newDto);
      return res;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('')
  async listProjects(@Request() req): Promise<any> {
    try {
      const user = req.user;
      const res = await this.projectsService.listProjects(user);
      return res;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getProject(@Request() req): Promise<any> {
    try {
      const user = req.user;
      const id = req.id;
      const res = await this.projectsService.getProject(user, id);
      return res;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Post('bid')
  async createBid(
    @Request() req,
    @Body(new ValidationPipe()) newDto: CreateBidDto,
  ): Promise<any> {
    try {
      const user = req.user;
      const res = await this.projectsService.createBid(user, newDto);
      return res;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
