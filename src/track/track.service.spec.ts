/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { TrackService } from './track.service';
import { TrackEntity } from './track.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlbumEntity } from '../album/album.entity';
import { faker } from '@faker-js/faker';

describe('TrackService', () => {
  let service: TrackService;
  let trackRepository: Repository<TrackEntity>;
  let albumRepository: Repository<AlbumEntity>;
  let trackList: TrackEntity[];
  let album: AlbumEntity;

  const seedDatabase = async () => {
    trackRepository.clear();
    albumRepository.clear();

    album = await albumRepository.save({
      nombre: faker.lorem.sentence(),
      caratula: faker.image.url(),
      fecha_lanzamiento: faker.date.past(),
      descripcion: faker.lorem.paragraph(),
      tracks: [],
      performers: []
    });

    trackList = [];
    for (let i = 0; i < 10; i++) {
      const track: TrackEntity = await trackRepository.save({
        nombre: faker.lorem.sentence(),
        duracion: faker.number.int(),
        album: album
      });
      trackList.push(track);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TrackService],
    }).compile();

    service = module.get<TrackService>(TrackService);
    trackRepository = module.get<Repository<TrackEntity>>(getRepositoryToken(TrackEntity));
    albumRepository = module.get<Repository<AlbumEntity>>(getRepositoryToken(AlbumEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should return a new track', async () => {
    const track: TrackEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      duracion: faker.number.int(),
      album: null
    };

    const newTrack: TrackEntity = await service.create(album.id, track);
    expect(newTrack).not.toBeNull();

    const storedTrack: TrackEntity = await trackRepository.findOne({ where: { id: newTrack.id }, relations: ["album"] });
    expect(storedTrack).not.toBeNull();
    expect(storedTrack.nombre).toEqual(newTrack.nombre);
    expect(storedTrack.duracion).toEqual(newTrack.duracion);
    expect(storedTrack.album.id).toEqual(album.id);
  });

  it('create should throw an exception when the track duration is negative', async () => {
    const track: TrackEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      duracion: -1,
      album: album
    };

    await expect(service.create(album.id, track)).rejects.toHaveProperty('message', "The track's duration must be positive");
  });

  it('create should throw an exception when the album does not exist', async () => {
    const track: TrackEntity = {
      id: "",
      nombre: faker.lorem.sentence(),
      duracion: faker.number.int(),
      album: null
    };

    await expect(service.create("0", track)).rejects.toHaveProperty('message', "The album with the given id was not found");
  });

  it('findOne should return a track by id', async () => {
    const storedTrack: TrackEntity = trackList[0];
    const track: TrackEntity = await service.findOne(storedTrack.id);
    expect(track).not.toBeNull();
    expect(track.nombre).toEqual(storedTrack.nombre);
    expect(track.duracion).toEqual(storedTrack.duracion);
    expect(track.album.id).toEqual(storedTrack.album.id);
  });

  it('findOne should throw an exception when the track does not exist', async () => {
    await expect(service.findOne("0")).rejects.toHaveProperty('message', "The track with the given id was not found");
  });

  it('findAll should return all tracks', async () => {
    const tracks: TrackEntity[] = await service.findAll();
    expect(tracks).not.toBeNull();
    expect(tracks.length).toEqual(trackList.length);
  });

  it('findAll should return an empty list when there are no tracks', async () => {
    await trackRepository.clear();
    const tracks: TrackEntity[] = await service.findAll();
    expect(tracks).not.toBeNull();
    expect(tracks.length).toEqual(0);
  });
});

