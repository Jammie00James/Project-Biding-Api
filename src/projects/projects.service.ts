import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient, PROJECT_STATUS, User, USER_ROLE } from '@prisma/client';
import { CreateBidDto, CreateProjectDto } from './dto/projects.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ProjectsService {
  private prisma = new PrismaClient();

  async createProject(user: User, input: CreateProjectDto): Promise<any> {
    if (user.role !== USER_ROLE.HOMEOWNER)
      throw new UnauthorizedException('Only Home Owners Allowed');

    const project = await this.prisma.project.create({
      data: {
        title: input.title,
        description: input.description,
        location: input.location,
        userId: user.id,
      },
    });

    if (input.milestones.length > 0) {
      for (const milestone of input.milestones) {
        await this.prisma.milestone.create({
          data: {
            title: milestone.title,
            note: milestone.note,
            projectId: project.id,
          },
        });
      }
    }

    return {
      message: 'success',
      project,
      milestones: input.milestones,
    };
  }

  async listProjects(user: User): Promise<any> {
    if (user.role === USER_ROLE.HOMEOWNER) {
      const projects = await this.prisma.project.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
        },
      });

      return {
        message: 'success',
        projects,
      };
    } else {
      const projects = await this.prisma.project.findMany({
        where: {
          status: PROJECT_STATUS.OPEN,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
        },
      });

      return {
        message: 'success',
        projects,
      };
    }
  }

  async getProject(user: User, id: string): Promise<any> {
    if (user.role === USER_ROLE.HOMEOWNER) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: id,
          userId: user.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          status: true,
          created_at: true,
          bids: true,
          milestones: true,
        },
      });

      if (!project) throw new NotFoundException('project not found');

      return {
        message: 'success',
        project,
      };
    } else {
      const project = await this.prisma.project.findFirst({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          status: true,
          created_at: true,
          milestones: true,
        },
      });
      if (!project) throw new NotFoundException('project not found');

      return {
        message: 'success',
        project,
      };
    }
  }

  async createBid(user: User, input: CreateBidDto): Promise<any> {
    if (user.role === USER_ROLE.HOMEOWNER)
      throw new UnauthorizedException(
        'Only COntactors and project managers Allowed',
      );

    const project = await this.prisma.project.findFirst({
      where: {
        id: input.projectId,
      },
    });

    if (!project) throw new NotFoundException('project not found');

    await this.prisma.bid.create({
      data: {
        projectId: input.projectId,
        price: input.price,
        duration: input.duration,
        note: input.note,
        userId: user.id,
      },
    });

    return {
      message: 'success',
    };
  }
}
