import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
   @Prop({ required: true, trim: true })
   title: string;

   @Prop()
   description?: string;

   @Prop()
   cover?: string;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
   ownerId: Types.ObjectId;

   @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Track' }], default: [] })
   tracks: Types.ObjectId[];

   @Prop({ default: true })
   isPublic: boolean;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
