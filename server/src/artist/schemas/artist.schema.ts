import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type ArtistDocument = HydratedDocument<Artist>;

@Schema({ timestamps: true })
export class Artist {
   @Prop({ required: true, trim: true })
   name: string;

   @Prop()
   bio?: string;

   @Prop()
   avatar?: string;

   @Prop()
   banner?: string;

   @Prop({ type: [String], default: [] })
   genres: string[];

   @Prop({ type: [String], default: [] })
   languages: string[];

   @Prop({ default: 0 })
   followersCount: number;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
   ownerUserId?: Types.ObjectId;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
