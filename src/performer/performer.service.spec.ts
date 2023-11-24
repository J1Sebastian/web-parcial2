/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PerformerService } from './performer.service';
import { PerformerEntity } from './performer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('PerformerService', () => {
  let service: PerformerService;
  let repository: Repository<PerformerEntity>;
  let performerList: PerformerEntity[];

  const seedDatabase = async () => {
    repository.clear();
    performerList = [];
    for (let i = 0; i < 10; i++) {
      const performer: PerformerEntity = await repository.save({
        nombre: faker.lorem.sentence(),
        imagen: faker.image.url(),
        descripcion: faker.lorem.sentence({ min: 1, max: 2 }),
        albums: []
      });
      performerList.push(performer);
    }
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

  it('create should return a new performer', async () => {
    const performer: PerformerEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence({ min: 1, max: 2 }),
      albums: []
    };

    const newPerformer: PerformerEntity = await service.create(performer);
    expect(newPerformer).not.toBeNull();

    const storedPerformer: PerformerEntity = await repository.findOne({where: {id: newPerformer.id}});
    expect(storedPerformer).not.toBeNull();
    expect(storedPerformer.nombre).toEqual(newPerformer.nombre);
    expect(storedPerformer.imagen).toEqual(newPerformer.imagen);
    expect(storedPerformer.descripcion).toEqual(newPerformer.descripcion);
  });

  it('create should throw an exception when the performer description is longer than 100 characters', async () => {
    const performer: PerformerEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      imagen: faker.image.url(),
      descripcion: faker.string.sample(101),
      albums: []
    };
    await expect(service.create(performer)).rejects.toHaveProperty('message', "The performer's description must be less than 100 characters");
  });

  it('findOne should return a performer by id', async () => {
    const storedPerformer: PerformerEntity = performerList[0];
    const performer: PerformerEntity = await service.findOne(storedPerformer.id);
    expect(performer).not.toBeNull();
    expect(performer.nombre).toEqual(storedPerformer.nombre);
    expect(performer.imagen).toEqual(storedPerformer.imagen);
    expect(performer.descripcion).toEqual(storedPerformer.descripcion);
  });

  it('findOne should throw an exception when the performer does not exist', async () => {
    await expect(service.findOne("0")).rejects.toHaveProperty('message', "The performer with the given id was not found");
  });

  it('findAll should return all performers', async () => {
    const performers: PerformerEntity[] = await service.findAll();
    expect(performers).not.toBeNull();
    expect(performers.length).toEqual(performerList.length);
  });

  it('findAll should return an empty list when there are no performers', async () => {
    repository.clear();
    const performers: PerformerEntity[] = await service.findAll();
    expect(performers).not.toBeNull();
    expect(performers.length).toEqual(0);
  });
});
