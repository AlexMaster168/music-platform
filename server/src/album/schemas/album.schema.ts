import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type AlbumDocument = HydratedDocument<Album>;

export const ALBUM_TYPES = ['album', 'single', 'ep'] as const;
export type AlbumType = (typeof ALBUM_TYPES)[number];

@Schema({ timestamps: true })
export class Album {
   @Prop({ required: true, trim: true })
   title: string;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'Artist', required: true })
   artistId: Types.ObjectId;

   @Prop()
   cover?: string;

   @Prop()
   releaseDate?: Date;

   @Prop({ default: 'album', enum: ALBUM_TYPES })
   type: AlbumType;

   @Prop()
   language?: string;

   @Prop({ type: [String], default: [] })
   genres: string[];
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
