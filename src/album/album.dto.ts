/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AlbumDto {
  @IsString()
  readonly nombre: string;

  @IsUrl()
  @IsNotEmpty()
  readonly caratula: string;

  @IsNotEmpty()
  readonly fecha_lanzamiento: Date;

  @IsString()
  readonly descripcion: string;
}
