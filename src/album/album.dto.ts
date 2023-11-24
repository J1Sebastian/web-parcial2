/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AlbumDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsUrl()
  @IsNotEmpty()
  readonly caratula: string;

  @IsNotEmpty()
  readonly fecha_lanzamiento: Date;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;
}
