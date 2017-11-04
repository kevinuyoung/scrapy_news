import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * segmentfault
 *       title: 标题
 *      author: 作者
 *         url: 链接
 *      counts: 浏览数
 *        type: 热门或最新
 *    category: 类型
 *  createDate: 发表时间
 */
const segmentfaultSchema = new Schema({
  title: String,
  author: String,
  url: String,
  counts: Number,
  type: String,
  category: String,
  createDate: { type: Date, default: Date.now() }
});

const Segmentfault = mongoose.model('Segmentfault', segmentfaultSchema);

export default Segmentfault;
