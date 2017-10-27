import path from 'path';
import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import request from 'request';
import segmentfaultModel from '../model/segmentfault.js';

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
    console.log('年:');
    let replaceDate = date.replace(/年|月|日/g, '-');
    replaceDate = replaceDate.slice(0, replaceDate.length - 1);
    return new Date(replaceDate);
  }
  if (date.indexOf('分钟') > 0) {
    console.log('分钟:');
    const time = currentDate.getTime();
    const minutes = parseInt(date) * 60 * 1000;
    return new Date(time - minutes);
    return minutes;
  }
  if (date.indexOf('小时') > 0) {
    console.log('小时:');
    const time = currentDate.getTime();
    const hours = parseInt(date) * 60 * 60 * 1000;
    return new Date(time - hours);
    return hours;
  }
  if (date.indexOf('天') > 0) {
    console.log('天:');
    const time = currentDate.getTime();
    const days = parseInt(date) * 24 * 60 * 60 * 1000;
    return new Date(time - days);
  }
  if (date.indexOf('月') > 0) {
    console.log('月:');
    let replaceMonth = date.replace(/年|月|日/g, '-');
    replaceMonth = currentDate.getFullYear() + '-' + replaceMonth.slice(0, replaceMonth.length - 1);
    return new Date(replaceMonth);
  }
  if (date.indexOf('秒') || date.indexOf('刚刚')) {
    console.log('刚刚:');
    return currentDate;
  }
};

const dataFromSegmentfault = (url, type) => {
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }
      filterData(documents, type);
    })
};

/**
 * url = "https://segmentfault.com/news/frontend?page=1";         // 最热头条
 * url = "https://segmentfault.com/news/frontend/newest?page=1"; // 最新头条
 */
const setTotalNum = 100;
const forEachHotestUrl = () => {
  for (let i = 1; i <= setTotalNum; i++) {
    const url = `https://segmentfault.com/news/frontend?page=${i}`;
    dataFromSegmentfault(url, 'hot');
  }
};

const forEachNewestUrl = () => {
  for (let i = 1; i <= setTotalNum; i++) {
    const url = `https://segmentfault.com/news/frontend/newest?page=${i}`;
    dataFromSegmentfault(url, 'new');
  }
};

const forEachUrl = () => {
  forEachHotestUrl();
  forEachNewestUrl();
};

const filterData = (documents, type) => {
  // http://www.cnblogs.com/zichi/p/5135636.html 中文乱码？不，是 HTML 实体编码！解决exec正则匹配导致的问题
  const $ = cheerio.load(documents.text, {decodeEntities: false});
  const $news = $('.news__list');
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
      type
    };
    // console.log(title);
    saveToCollections(params);
  }
};

async function saveToCollections (params) {
  const { url } = params;
  let segmentfault = await segmentfaultModel.findOne({url});
  if (segmentfault) {
    return console.log(`${title} exists....`);
  }
  return new segmentfaultModel(params).save((err, res) => {
    if (err) {
      throw new Error(`save ${title} error...`);
    }
  })
}

export default forEachUrl;
