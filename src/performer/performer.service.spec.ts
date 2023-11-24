/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PerformerService } from './performer.service';
import { PerformerEntity } from './performer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PerformerService', () => {
  let service: PerformerService;
  let repository: Repository<PerformerEntity>;

  const seedDatabase = async () => {
    repository.clear();
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [PerformerService],
    }).compile();

    service = module.get<PerformerService>(PerformerService);
    repository = module.get<Repository<PerformerEntity>>(getRepositoryToken(PerformerEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
