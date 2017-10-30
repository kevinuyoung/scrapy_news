import path from 'path';
import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import request from 'request';
import segmentfaultModel from '../model/segmentfault.js';

let count = 0;
let repeatCount = 0;

let totalNewsList = 0;

let hotTimer = null;
let newTimer = null;

const initVariable = () => {
  count = 0;
  repeatCount = 0;
  totalNewsList = 0;
  hotTimer = null;
  newTimer = null;
};

const clearTimer = () => {
  if (hotTimer) {
    clearTimeout(hotTimer);
  }
  if (newTimer) {
    clearTimeout(newTimer);
  }
};
// clearTimer();
/**
 * segmentfault的时间设置问题：
 * 小于1天，用 小时
 * 小于7天，就 天，
 * 大于等于 7天， 用 月份/日期
 * 不在今年， 用 年/月/日
 * exemple array: const temp = ['1小时前', '2016年12月30日', '20分钟前', '6月22日', '6天前'];
 */
const updateDate = (date) => {
  const currentDate = new Date();
  if (date.indexOf('年') > 0) {
    // console.log('年:');
    let replaceDate = date.replace(/年|月|日/g, '-');
    replaceDate = replaceDate.slice(0, replaceDate.length - 1);
    return new Date(replaceDate);
  }
  if (date.indexOf('分钟') > 0) {
    // console.log('分钟:');
    const time = currentDate.getTime();
    const minutes = parseInt(date) * 60 * 1000;
    return new Date(time - minutes);
    return minutes;
  }
  if (date.indexOf('小时') > 0) {
    // console.log('小时:');
    const time = currentDate.getTime();
    const hours = parseInt(date) * 60 * 60 * 1000;
    return new Date(time - hours);
    return hours;
  }
  if (date.indexOf('天') > 0) {
    // console.log('天:');
    const time = currentDate.getTime();
    const days = parseInt(date) * 24 * 60 * 60 * 1000;
    return new Date(time - days);
  }
  if (date.indexOf('月') > 0) {
    // console.log('月:');
    let replaceMonth = date.replace(/年|月|日/g, '-');
    replaceMonth = currentDate.getFullYear() + '-' + replaceMonth.slice(0, replaceMonth.length - 1);
    return new Date(replaceMonth);
  }
  if (date.indexOf('秒') || date.indexOf('刚刚')) {
    // console.log('刚刚:');
    return currentDate;
  }
};

const dataFromSegmentfault = (url, type, category) => {
  clearTimer();
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        err.url = url;
        // fs.appendFileSync('error.log', JSON.stringify(err) + '\n');
        console.log(url);
        // 这里如果不做处理，程序错误的时候，直接打印日志，不会再次执行下一轮代码拉取。
        // 采取做法，强制开始新的一轮
        // return forEachUrl();
        return console.log('*******error*******');

        // return console.log(err);
      }
      filterData(documents, type, category, url);
    })
};

/**
 * url = "https://segmentfault.com/news/frontend?page=1";         // 最热头条
 * url = "https://segmentfault.com/news/frontend/newest?page=1"; // 最新头条
 * 最新比最热多一页
 */

const categoryObj = [{
  name: '前端',
  title: 'frontend',
  pageNum: 1
},
{
  name: '后端',
  title: 'backend',
  pageNum: 164
},
{
  name: "IOS",
  title: "ios",
  pageNum: 15
},
{
  name: "Android",
  title:"android",
  pageNum: 53
},
{
  name: "安全",
  title:"netsec",
  pageNum: 13,
},
{
  name: "人工智能",
  title: "ai",
  pageNum: 6
},
{
  name: "工具资源",
  title: "tools",
  pageNum: 28
}];

let setTotalNum = null;
let category = null;

const randomCategory = () => {
  const random = Math.floor(Math.random() * 7);
  const { title, pageNum } = categoryObj[random];
  category =  'tools';
  setTotalNum = 28;
  initVariable(category, setTotalNum);
};

const forEachHotestUrl = () => {
  for (let i = 1; i <= setTotalNum; i++) {
    const url = `https://segmentfault.com/news/${category}?page=${i}`;
    // console.log(url);
    hotTimer = setTimeout(() => {
      dataFromSegmentfault(url, 'hot', category);
    }, 2000);
  }
};

const forEachNewestUrl = () => {
  for (let i = 1; i <= (setTotalNum + 1); i++) {
    const url = `https://segmentfault.com/news/${category}/newest?page=${i}`;
    newTimer = setTimeout(() => {
      dataFromSegmentfault(url, 'new', category);
    }, 2000);
  }
};

const forEachUrl = () => {
  randomCategory();
  forEachHotestUrl();
  forEachNewestUrl();
};

const filterData = (documents, type, category, url) => {
  // http://www.cnblogs.com/zichi/p/5135636.html 中文乱码？不，是 HTML 实体编码！解决exec正则匹配导致的问题
  const $ = cheerio.load(documents.text, {decodeEntities: false});
  const $news = $('.news__list');
  console.log('==========${news}========', $news.length);
  if ($news.length === 0) {
    console.log(url);
    clearTimer();
    // console.log('segmentfault fetch data finished');
    console.log('fetch data from segmentfault：');
    console.log(`总共抓取文件：${count}`);
    console.log(`重复文件：${repeatCount}`);
    // forEachUrl();
    process.exit(1);
    // throw new Error('*********segmentfault again***********');
  } else {
    const $newsList = $news.find('.news__item');
    totalNewsList += totalNewsList + $newsList.length;
    for (let i = 0, len = $newsList.length; i < len; i++) {
      const $item = $newsList.eq(i);
      const $title = $item.find('.news__item-title a');

      const title = $title.text();
      const url = $title.attr('href');

      const $meta = $item.find('.news__item-meta span').eq(0);
      let metaHtml = $meta.html();
      metaHtml = metaHtml.replace(/\n/g, '');

      const pattern = /(<a)(.*?)(>)(.*?)(<\/a>)(.+)(\s+.*?)/;
      const execRes = pattern.exec(metaHtml);
      const author = execRes[4];
      const createDate = updateDate(execRes[6]);

      let counts = $item.find('.news__bookmark-text').text();
      if (counts.indexOf('k') > 0) {
        counts = parseFloat(counts) * 1000;
      }
      counts = parseInt(counts) || 0;
      const hotNumber = $item.find('.news__bookmark-text').text();
      const params = {
        title,
        author,
        url,
        createDate,
        counts,
        category,
        type
      };
      // console.log(title);
      saveToCollections(params);
    }
  }
};

/**
 * [description] 判断拉取这一类型 数据是否完毕，
 * 例如： 拉取 frontend这一类型数据， 总页数为205页，每页为 30 条数据，执行两次for循环， 
 * 也就是最多数据为 205 * 30 * 2， 但是并不保证最后一页数据一定为 30条数据，也有可能小于 30
 * 因此，每一次循环都会 根据拉取的 新数据 + 重复数据 是否 和总数相等，如果相等，则进行下一轮
 * @return {[type]} [description]
 */
const checkIsFetchFinished = () => {
  if (count + repeatCount === totalNewsList) {
    console.log('************不好意思，开启下一轮**********************');
  }
  forEachUrl();
};

async function saveToCollections (params) {
  const { url, title } = params;
  let segmentfault = await segmentfaultModel.findOne({url});
  if (segmentfault) {
    repeatCount++;
    return checkIsFetchFinished();
    // return console.log(`${category}---segmentfault: ${title} exists....`);
  }
  new segmentfaultModel(params).save((err, res) => {
    if (err) {
      throw new Error(`save ${title} error...`);
    }
    count++;
    return checkIsFetchFinished();
  })
}

export default forEachUrl;
