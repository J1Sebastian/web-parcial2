/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AlbumService } from './album.service';
import { AlbumEntity } from './album.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('AlbumService', () => {
  let service: AlbumService;
  let repository: Repository<AlbumEntity>;
  let albumList: AlbumEntity[];

  const seedDatabase = async () => {
    repository.clear();
    albumList = [];

    for(let i = 0; i < 10; i++) {
      const album: AlbumEntity = await repository.save({
        nombre: faker.lorem.sentence(),
        caratula: faker.image.url(),
        fecha_lanzamiento: faker.date.past(),
        descripcion: faker.lorem.paragraph()});
      
      albumList.push(album);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AlbumService],
    }).compile();

    service = module.get<AlbumService>(AlbumService);
    repository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should return a new album', async () => {
    const album: AlbumEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: faker.lorem.paragraph(),
      tracks: [],
      performers: []
    };

    const newAlbum: AlbumEntity = await service.create(album);
    expect(newAlbum).not.toBeNull();

    const storedAlbum: AlbumEntity = await repository.findOne({where: {id: newAlbum.id}});
    expect(storedAlbum).not.toBeNull();
    expect(storedAlbum.nombre).toEqual(newAlbum.nombre);
    expect(storedAlbum.caratula).toEqual(newAlbum.caratula);
    expect(storedAlbum.fecha_lanzamiento).toEqual(newAlbum.fecha_lanzamiento);
    expect(storedAlbum.descripcion).toEqual(newAlbum.descripcion);
  });

  it('create should throw an exception when the album description is empty', async () => {
    const album: AlbumEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: "",
      tracks: [],
      performers: []
    };

    await expect(() => service.create(album)).rejects.toHaveProperty("message", "The album's description cannot be empty")
  });

  it('create should throw an exception when the album name is empty', async () => {
    const album: AlbumEntity = {
      id: "",
      nombre: "",
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: faker.lorem.paragraph(),
      tracks: [],
      performers: []
    };

    await expect(() => service.create(album)).rejects.toHaveProperty("message", "The album's name cannot be empty")
  });
    
});
