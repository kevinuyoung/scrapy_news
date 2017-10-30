import request from 'request';
import rp from 'request-promise';
import juejinModel from '../model/juejin.js';
import fs from 'fs';
console.log('.............engering..............');
let count = 0;
let repeatCount = 0;
let hotTimer = null;
let newTimer = null;
let categoryId = null;
let categoryTitle = null;

let startHotPageNum = 1;
let startNewPageNum = 1;
let setTotalNum = Math.floor(Math.random() * 50 + 1);


const initVariable = () => {
  count = 0;
  repeatCount = 0;
  startHotPageNum = 1;
  startNewPageNum = 1;
  setTotalNum = Math.floor(Math.random() * 50 + 1);
  randomCategory();
};

const filterData = (data, status) => {
  // console.log(data);
  if (!data || (data && data.m !== 'ok')) {
    console.log('fetch data from juejin：');
    console.log(`总共抓取文件：${count}`);
    console.log(`重复文件：${repeatCount}`);
    // process.exit(1);
    // clearTimer();
    console.log('***********下次就要5分钟更新一次了****************');
    // restartTimer = setTimeout(() => {
    //   const errorlog = `${new Date()}---${url}--开始更新了\n`;
    //   // fs.appendFileSync('error.log', errorlog);
    //   dataFromJuejin();
    // }, 5 * 60 * 1000);
    // forEachHotestUrl();
    // forEachNewestUrl();
    console.log(new Error('*********juejin again***********'));
    // throw new Error('*********juejin again***********');
    // throw new Error('*********again***********');
  } else {
    const list = data.d.entrylist;
  // console.log(list)
    for (let i = 0, len = list.length; i < len; i++) {
      const item = list[i];
      const { title, viewsCount, type, summaryInfo, user, objectId, category, tags} = item;
      const { community, avatarLarge } = user;
      const filterTags = tags.map((tag) => {
        return tag.title;
      });
      const fileterCateory = {
        id: category.id,
        name: category.name,
        title: category.title
      };
      let url = null;
      if (type === 'article') {
        url = `/entry/${item.objectId}/detail`;
      }
      if (type === 'post') {
        url = `/post/${item.objectId}`;
      }
      const params = {
        objectId,
        title,
        url,
        viewsCount,
        summaryInfo,
        avatarLarge,
        status,
        tags: filterTags,
        categoryId: category.id,
        category: fileterCateory,
        author: user.username,
        community: JSON.stringify(community),
        createDate: item.createdAt
      };
      saveToCollections(params);
    }
  }
};

const fetcnDataFromRequest = (url, status) => {
  console.log('entering.......request....');
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: url,
      json: 'Content-type: application/json'
    }, (error, res, data) => {
      if (error) {
        return reject(error)
      }
      resolve(data);
    })
  })
};

/**
 * 最新链接 : 规则： 根据ISO时间，往前推一天
 * https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&before=2017-09-19T07%3A48%3A15.354Z&limit=20&tag=5597a05ae4b08a686ce56f6f
 *
 * 最热链接 : 规则： 随机生成before的值
 * https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&before=0.027320297817573&limit=20&tag=5597a05ae4b08a686ce56f6f
 */
const categoryObj = [{
  id: '5562b415e4b00c57d9b94ac8',
  name: '前端',
  title: 'frontend'
},
{
  id: '5562b419e4b00c57d9b94ae2',
  name: '后端',
  title: 'backend'
},
{
  id: "5562b405e4b00c57d9b94a41",
  name: "iOS",
  title: "ios"
},
{
  id: "5562b410e4b00c57d9b94a92",
  name: "Android",
  title:"android"
},
{
  id: "57be7c18128fe1005fa902de",
  name: "人工智能",
  title: "ai"
},
{
  id: "5562b422e4b00c57d9b94b53",
  name: "工具资源",
  title: "freebie"
}];

const randomCategory = () => {
  const random = Math.floor(Math.random() * 6);
  const { title, id } = categoryObj[random];
  categoryId = id;
  categoryTitle = title;
};

const forEachHotestUrl = () => {
  const randomDelay = Math.floor(Math.random() * 2000 + 500);
  if (hotTimer) {
    clearTimeout(hotTimer);
    hotTimer = null;
  }
  if (startHotPageNum <= setTotalNum) {
    console.log(`again..${startHotPageNum}..hot..Total..${setTotalNum}`)
    hotTimer = setTimeout( ()=> {
      console.log('entering...setTimeout....')
      let random = Math.floor(Math.random() * 100000000000000).toString();
      let firstRandom = Math.floor(Math.random() * 10).toString();
      random = `${firstRandom}.${random}`;
      // 每页数据：随机10 - 50
      const limit = Math.floor(Math.random() * 50 + 10);
      const url = `https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&before=${random}&limit=${limit}&category=${categoryId}`;
      fetcnDataFromRequest(url).then((data) => {
        // console.log(data);
        filterData(data, 'hot');
        forEachHotestUrl();
        startHotPageNum++;
      }).catch(err =>{
        console.log(err);
      })
    }, randomDelay);
  }
 };

const forEachNewestUrl = () => {
  if (newTimer) {
    clearTimeout(newTimer);
    newTimer = null;
  }
  const randomDelay = Math.floor(Math.random() * 2000 + 500);
  if (startHotPageNum <= setTotalNum) {
    let currentDate = new Date();
    const oneDay = 1 * 24 * 60 * 60 * 1000;
    currentDate = currentDate - oneDay;
    const before = new Date(currentDate);
    console.log(`${categoryTitle}..${startNewPageNum}..new...Total....${setTotalNum}`)
    newTimer = setTimeout( ()=> {
      // 每页数据：随机10 - 50
      const limit = Math.floor(Math.random() * 50 + 10);
      const url = `https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&before=${encodeURIComponent(before.toISOString())}&limit=${limit}&category=${categoryId}`;
      fetcnDataFromRequest(url).then((data) => {
        // console.log(data);
        filterData(data, 'new');
        forEachNewestUrl();
        startNewPageNum++;
      }).catch(err =>{
        console.log(err);
      })
    }, randomDelay);
  }
};

const dataFromJuejin = () => {
  // console.log(`------------random delay ${randomDelay}s-------------`);
  initVariable();
  forEachHotestUrl();
  forEachNewestUrl();
};

async function saveToCollections (params) {
  const { objectId, title, author } = params;
  let juejin = await juejinModel.findOne({objectId});
  if (juejin) {
    // return console.log(`${categoryTitle}---juejin: ${title} exists....`);
    return repeatCount++;
  }
  return new juejinModel(params).save((err, res) => {
    if (err) {
      console.log(params)
      throw new Error(`save ${title} error...`);
    }
    count++;
    console.log(`juejin----: ${author} ： ${title} saves...`);
  })
}

export default dataFromJuejin;
