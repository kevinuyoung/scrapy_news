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
const segmentfaultSchema = new Schema({
  title: String,
  author: String,
  url: String,
  counts: Number,
  type: String,
  createDate: { type: Date, default: Date.now() }
});

const Segmentfault = mongoose.model('Segmentfault', segmentfaultSchema);

export default Segmentfault;
