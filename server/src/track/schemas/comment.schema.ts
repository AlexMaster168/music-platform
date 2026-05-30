import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
   @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
   userId?: Types.ObjectId;

   @Prop({ required: true })
   username: string;

   @Prop({ required: true })
   text: string;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'Track' })
   trackId: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
