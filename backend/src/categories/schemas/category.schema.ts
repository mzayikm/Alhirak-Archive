import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  collection: 'categories',
  versionKey: false,
})
export class Category {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  color: string;

  @Prop({ required: true })
  orderIndex: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);