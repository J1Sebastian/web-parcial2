/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AlbumService } from './album.service';
import { AlbumEntity } from './album.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { TrackEntity } from '../track/track.entity';

describe('AlbumService', () => {
  let service: AlbumService;
  let albumRepository: Repository<AlbumEntity>;
  let trackRepository: Repository<TrackEntity>;
  let albumList: AlbumEntity[];
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let track: TrackEntity;

  const seedDatabase = async () => {
    albumRepository.clear();
    trackRepository.clear();
    
    albumList = [];
    for(let i = 0; i < 10; i++) {
      const album: AlbumEntity = await albumRepository.save({
        nombre: faker.lorem.sentence(),
        caratula: faker.image.url(),
        fecha_lanzamiento: faker.date.past(),
        descripcion: faker.lorem.paragraph(),
        tracks: [],
        performers: []});
      
      albumList.push(album);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AlbumService],
    }).compile();

    service = module.get<AlbumService>(AlbumService);
    albumRepository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
    trackRepository = module.get<Repository<TrackEntity>>(getRepositoryToken(TrackEntity));
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

    const storedAlbum: AlbumEntity = await albumRepository.findOne({where: {id: newAlbum.id}});
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
  
  it('findOne should return an album by id', async () => {
    const storedAlbum: AlbumEntity = albumList[0];
    const album: AlbumEntity = await service.findOne(storedAlbum.id);
    expect(album).not.toBeNull();
    expect(album.nombre).toEqual(storedAlbum.nombre);
    expect(album.caratula).toEqual(storedAlbum.caratula);
    expect(album.fecha_lanzamiento).toEqual(storedAlbum.fecha_lanzamiento);
    expect(album.descripcion).toEqual(storedAlbum.descripcion);
  }); 

  it('findOne should throw an exception when the album does not exist', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The album with the given id was not found")
  });

  it('findAll should return all albums', async () => {
    const albums: AlbumEntity[] = await service.findAll();
    expect(albums).not.toBeNull();
    expect(albums.length).toEqual(albumList.length);
  });

  it('findAll should return an empty list when there are no albums', async () => {
    await albumRepository.clear();
    const albums: AlbumEntity[] = await service.findAll();
    expect(albums).not.toBeNull();
    expect(albums.length).toEqual(0);
  });

  it('delete should remove an album', async () => {
    const storedAlbum: AlbumEntity = albumList[1];
    await service.delete(storedAlbum.id);
    const album: AlbumEntity = await albumRepository.findOne({where: {id: storedAlbum.id}});
    expect(album).toBeNull();
  });

  it('delete should throw an exception when the album does not exist', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The album with the given id was not found")
  });

  it('delete should throw an exception when the album has tracks', async () => {
    track = await trackRepository.save({
      nombre: faker.lorem.sentence(),
      duracion: faker.number.int(),
      album: albumList[0],
      performers: []
    });
    const storedAlbum: AlbumEntity = albumList[0];
    await expect(() => service.delete(storedAlbum.id)).rejects.toHaveProperty("message", "The album has tracks, it cannot be deleted")
  });
}); 
