/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { TrackEntity } from './track.entity';
import { AlbumEntity } from '../album/album.entity';

@Injectable()
export class TrackService {
    constructor(
        @InjectRepository(TrackEntity)
        private readonly trackRepository: Repository<TrackEntity>,

        @InjectRepository(AlbumEntity)
        private readonly albumRepository: Repository<AlbumEntity>
    ){}

    async create(albumid: string, track: TrackEntity): Promise<TrackEntity> {
        if (track.duracion <= 0)
            throw new BusinessLogicException("The track's duration must be positive", BusinessError.PRECONDITION_FAILED);

        const album: AlbumEntity = await this.albumRepository.findOne({where:{id: albumid}});
        if (!album)
            throw new BusinessLogicException("The album with the given id was not found", BusinessError.NOT_FOUND);

        track.album = album;

        return await this.trackRepository.save(track);
    }

    async findOne(id: string): Promise<TrackEntity> {
        const track: TrackEntity = await this.trackRepository.findOne({where: {id}, relations: ["album"] } );
        if (!track)
            throw new BusinessLogicException("The track with the given id was not found", BusinessError.NOT_FOUND);
    
        return track;
    }

    async findAll(): Promise<TrackEntity[]> {
        return await this.trackRepository.find({ relations: ["album"] });
    }
}
