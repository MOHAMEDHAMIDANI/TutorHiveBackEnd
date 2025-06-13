import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    const countUser = await this.repository.count({
      where: {
        id: RoleEnum.user,
      },
    });

    if (!countUser) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.user,
          name: 'User',
        }),
      );
    }

    const countAdmin = await this.repository.count({
      where: {
        id: RoleEnum.admin,
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.admin,
          name: 'Admin',
        }),
      );
    }

    const countTutor = await this.repository.count({
      where: {
        id: RoleEnum.tutor,
      },
    });

    if (!countTutor) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.tutor,
          name: 'Tutor',
        }),
      );
    }

    const countStudent = await this.repository.count({
      where: {
        id: RoleEnum.student,
      },
    });

    if (!countStudent) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.student,
          name: 'Student',
        }),
      );
    }

    const countGuest = await this.repository.count({
      where: {
        id: RoleEnum.guest,
      },
    });

    if (!countGuest) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.guest,
          name: 'Guest',
        }),
      );
    }
  }
}
