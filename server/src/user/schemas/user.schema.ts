import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
   @Prop({ required: true, unique: true, lowercase: true, trim: true })
   email: string;

   @Prop({ required: true })
   passwordHash: string;

   @Prop({ required: true })
   displayName: string;

   @Prop()
   avatar?: string;

   @Prop({ default: 'user', enum: ['user', 'admin'] })
   role: string;

   @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Track' }], default: [] })
   likedTracks: Types.ObjectId[];

   @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Artist' }], default: [] })
   followingArtists: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Никогда не отдаём наружу хеш пароля
UserSchema.set('toJSON', {
   transform: (_doc: Document, ret: Record<string, any>) => {
      delete ret.passwordHash;
      return ret;
   },
});
