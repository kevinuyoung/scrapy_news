import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * 用户表
 *   userid: 用户ID
 * username: 用户昵称
 * password: 用户密码
 *     mark: 用户自我介绍
 *    email: 用户邮箱
 *  regDate: 用户注册时间
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
  createDate: { type: Date, default: Date.now() }
});

const Juejin = mongoose.model('Juejin', juejinSchema);

export default Juejin;
