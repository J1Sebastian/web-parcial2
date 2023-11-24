/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AlbumPerformerService } from './album-performer.service';

@Module({
  providers: [AlbumPerformerService]
})
export class AlbumPerformerModule {}
