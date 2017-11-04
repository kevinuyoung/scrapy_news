import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * juejin
 *    objectId: 用户ID
 *       title: 用户昵称
 *      author: 用户密码
 * avatarLarge: 头像
 *         url: 用户邮箱
 *  viewsCount: 用户注册时间
 *      status: 热门或最新
 *   community: 用户信息
 * summaryInfo: 文章简介
 *  categoryId: 类型ID
 *    category: 类型
 *        tags: 文章所属标签
 *  createDate: 发布时间
 */
const juejinSchema = new Schema({
  objectId: String,
  title: String,
  author: String,
  avatarLarge: String,
  url: String,
  viewsCount: Number,
  status: String,
  community: String,
  summaryInfo: String,
  categoryId: String,
  category: Schema.Types.Mixed,
  tags: Array,
  createDate: { type: Date, default: Date.now() }
});

const Juejin = mongoose.model('Juejin', juejinSchema);

export default Juejin;
