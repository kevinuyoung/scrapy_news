import path from 'path';
import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import request from 'request';
import segmentfaultModel from '../model/segmentfault.js';

let count = 0;
let repeatCount = 0;

let startHotPageNum = 1;
let startNewPageNum = 1;

let hotTimer = null;
let newTimer = null;

let setTotalNum = null;
let category = null;

let hotFinishedFlag = null;
let newFinishedFlag = null;

const randomCategory = () => {
  const random = Math.floor(Math.random() * 7);
  const { title, pageNum } = categoryObj[random];
  category =  title;
  setTotalNum = pageNum;
};

const initVariable = () => {
  count = 0;
  repeatCount = 0;
  startHotPageNum = 1;
  startNewPageNum = 1;
  hotTimer = null;
  newTimer = null;
  randomCategory();
};

const destoryVariable = () => {
  if (hotFinishedFlag && newFinishedFlag) {
    count = null;
    repeatCount = null;

    startHotPageNum = null;
    startNewPageNum = null;

    hotTimer = null;
    newTimer = null;

    setTotalNum = null;
    category = null;
  }
};

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
    // return minutes;
  }
  if (date.indexOf('小时') > 0) {
    // console.log('小时:');
    const time = currentDate.getTime();
    const hours = parseInt(date) * 60 * 60 * 1000;
    return new Date(time - hours);
    // return hours;
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
  return new Promise((resolve, reject)=> {
    superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        err.url = url;
        fs.appendFileSync('../segmentfault.error.log', `send Request error--- ${JSON.stringify(err)} \n`);
        return reject('error');
      }
      resolve(documents);
    })
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
  pageNum: 205
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

const forEachHotestUrl = () => {
  if (hotTimer) {
    clearTimeout(hotTimer);
    hotTimer = null;
  }
  if (startHotPageNum <= setTotalNum) {
    const randomDelay = Math.floor(Math.random() * 5000 + 1000);
    const url = `https://segmentfault.com/news/${category}?page=${startHotPageNum}`;
    console.log(`获取hot-segmentfault：${category},${randomDelay/1000}s 后，进入第${startHotPageNum}页，总页数为：${setTotalNum}页：\n`);
    console.log(url + '\n');

    hotTimer = setTimeout( () => {
      dataFromSegmentfault(url).then((documents)=> {
        filterData(documents, 'hot', category, url);
        forEachHotestUrl();
        startHotPageNum++;
      }).catch(err => {
        fs.appendFileSync('../segmentfault.error.log', `Link：${url} ${JSON.stringify(err)} error\n`);
        console.log(`*****获取 ==hot== ${category}**error*******`);
        forEachHotestUrl();
        startHotPageNum++;
      });
    }, randomDelay)
  } else {
    hotFinishedFlag = true;
    destoryVariable();
  }
};

const forEachNewestUrl = () => {
  if (newTimer) {
    clearTimeout(newTimer);
    newTimer = null;
  }
  if (startNewPageNum <= setTotalNum) {
    const randomDelay = Math.floor(Math.random() * 5000 + 1000);
    const url = `https://segmentfault.com/news/${category}/newest?page=${startNewPageNum}`;
    console.log(`获取new-segmentfault：${category},${randomDelay/1000}s 后，进入第${startNewPageNum}页，总页数为：${setTotalNum}页：\n`);
    console.log(url + '\n');

    newTimer = setTimeout( () => {
      dataFromSegmentfault(url).then((documents)=> {
        filterData(documents, 'new', category, url);
        forEachNewestUrl();
        startNewPageNum++;
      }).catch(err => {
        fs.appendFileSync('../segmentfault.error.log', `Link：${url} ${JSON.stringify(err)} error\n`);
        console.log(`*****获取 ==new== ${category}**error*******`);
        forEachNewestUrl();
        startNewPageNum++;
      });
    }, randomDelay);
  } else {
    newFinishedFlag = true;
    destoryVariable();
  }
};

const forEachUrl = () => {
  initVariable();
  forEachHotestUrl();
  // forEachNewestUrl();
};

const filterData = async (documents, type, category, url) => {
  // http://www.cnblogs.com/zichi/p/5135636.html 中文乱码？不，是 HTML 实体编码！解决exec正则匹配导致的问题
  const $ = cheerio.load(documents.text, {decodeEntities: false});
  const $news = $('.news__list');
  if ($news.length === 0) {
    console.log('fetch data from segmentfault：');
    console.log(`总共抓取文件：${count}`);
    console.log(`重复文件：${repeatCount}`);
    console.log(new Error('*********segmentfault again***********'));
  } else {
    const $newsList = $news.find('.news__item');
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
      let author = null
      try {
        author = execRes[4];
      } catch(err) {   
        console.log(err);
        continue;
      }
      const createDate = updateDate(execRes[6]) || new Date();

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
      await saveToCollections(params);
    }
  }
};

async function saveToCollections (params) {
  const { url, title } = params;
  let segmentfault = await segmentfaultModel.findOne({url});
  if (segmentfault) {
    return repeatCount++;
    // return console.log(`${category}---segmentfault: ${title} exists....`);
  }
  new segmentfaultModel(params).save((err, res) => {
    if (err) {
      fs.appendFileSync('../segmentfault.error.log', `${url} save error\n`);
      return console.log(err);
    }
    count++;
    console.log(`${category}---segmentfault: ${title} 保存成功....`);
  })
}

export default forEachUrl;
