/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AlbumPerformerService } from './album-performer.service';
import { PerformerEntity } from '../performer/performer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlbumEntity } from '../album/album.entity';
import { faker } from '@faker-js/faker';

describe('AlbumPerformerService', () => {
  let service: AlbumPerformerService;
  let albumRepository: Repository<AlbumEntity>;
  let performerRepository: Repository<PerformerEntity>;
  let performerList: PerformerEntity[];

  const seedDatabase = async () => {
    albumRepository.clear();
    performerRepository.clear();

    performerList = [];
    for (let i = 0; i < 3; i++) {
      const performer: PerformerEntity = await performerRepository.save({
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
      providers: [AlbumPerformerService],
    }).compile();

    service = module.get<AlbumPerformerService>(AlbumPerformerService);
    albumRepository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
    performerRepository = module.get<Repository<PerformerEntity>>(getRepositoryToken(PerformerEntity));

    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addPerformerToAlbum should add a performer to an album', async () => {
    const newPerformer: PerformerEntity = await performerRepository.save({
      nombre: faker.lorem.sentence(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence({ min: 1, max: 2 }),
    });

    const newAlbum: AlbumEntity = await albumRepository.save({
      nombre: faker.lorem.sentence(),
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: faker.lorem.paragraph(),
    });

    const result: AlbumEntity = await service.addPerformerToAlbum(newAlbum.id, newPerformer.id);

    expect(result).not.toBeNull();
    expect(result.performers).not.toBeNull();
    expect(result.performers.length).toBe(1);
    expect(result.performers[0]).not.toBeNull();
    expect(result.performers[0].nombre).toEqual(newPerformer.nombre);
    expect(result.performers[0].imagen).toEqual(newPerformer.imagen);
    expect(result.performers[0].descripcion).toEqual(newPerformer.descripcion);
  });

  it('addPerformerToAlbum should throw an exception if the performer does not exist', async () => {
    const newAlbum: AlbumEntity = await albumRepository.save({
      nombre: faker.lorem.sentence(),
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: faker.lorem.paragraph(),
    });

    await expect(service.addPerformerToAlbum(newAlbum.id, "0")).rejects.toHaveProperty("message", "The performer with the given id was not found");
  });

  it('addPerformerToAlbum should throw an exception if the album does not exist', async () => {
    const newPerformer: PerformerEntity = await performerRepository.save({
      nombre: faker.lorem.sentence(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence({ min: 1, max: 2 }),
    });

    await expect(service.addPerformerToAlbum("0", newPerformer.id)).rejects.toHaveProperty("message", "The album with the given id was not found");
  });

  it('addPerformerToAlbum should throw an exception if the album already has 3 performers', async () => {
    const newPerformer: PerformerEntity = await performerRepository.save({
      nombre: faker.lorem.sentence(),
      imagen: faker.image.url(),
      descripcion: faker.lorem.sentence({ min: 1, max: 2 }),
    });

    const newAlbum: AlbumEntity = await albumRepository.save({
      nombre: faker.lorem.sentence(),
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: faker.lorem.paragraph(),
      performers: performerList
    });

    await expect(service.addPerformerToAlbum(newAlbum.id, newPerformer.id)).rejects.toHaveProperty("message", "The album cannot have more than 3 performers associated");
  });

  
});
