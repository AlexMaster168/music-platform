import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type ListenHistoryDocument = HydratedDocument<ListenHistory>;

@Schema({ timestamps: true })
export class ListenHistory {
   @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
   userId: Types.ObjectId;

   @Prop({ type: SchemaTypes.ObjectId, ref: 'Track', required: true })
   trackId: Types.ObjectId;
}

export const ListenHistorySchema = SchemaFactory.createForClass(ListenHistory);
ListenHistorySchema.index({ userId: 1, createdAt: -1 });
