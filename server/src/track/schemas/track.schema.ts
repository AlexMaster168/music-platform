import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type TrackDocument = HydratedDocument<Track>;

@Schema({ timestamps: true })
export class Track {
   @Prop({ required: true, trim: true })
   name: string;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'Artist', required: true })
   artistId: Types.ObjectId;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'Album' })
   albumId?: Types.ObjectId;

   @Prop({ required: true })
   audio: string;

   @Prop()
   picture?: string;

   @Prop({ default: 0 })
   duration: number;

   @Prop({ default: 0 })
   listens: number;

   @Prop({ type: [String], default: [] })
   genres: string[];

   @Prop()
   language?: string;

   @Prop({ default: false })
   isCover: boolean;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'Track' })
   originalTrackId?: Types.ObjectId;

   @Prop()
   lyrics?: string;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
   uploadedBy?: Types.ObjectId;

   @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Comment' }], default: [] })
   comments: Types.ObjectId[];
}

export const TrackSchema = SchemaFactory.createForClass(Track);
