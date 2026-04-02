import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({
  collection: 'articles',
  versionKey: false,
})
export class Article {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  lang: string;

  @Prop()
  lang_stat: string;

  @Prop()
  date: Date;

  @Prop()
  featured: boolean;

  @Prop()
  published: boolean;

  @Prop()
  isReport: boolean;

  @Prop()
  thumbnail: string;

  @Prop()
  thumbnailNew: string;

  @Prop({ type: Object })
  category: any;

  @Prop({ type: Object })
  author: any;

  @Prop({ type: Array })
  blocks: any[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);