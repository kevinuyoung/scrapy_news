import request from 'request';
import juejinModel from '../model/juejin.js';

let count = 0;
let repeatCount = 0;

const filterData = (data, status) => {
  if (!data || !data.d ) {
    console.log('fetch data from juejin：');
    console.log(`总共抓取文件：${count}`);
    console.log(`重复文件：${repeatCount}`);
    process.exit(1);
  }
  const list = data.d.entrylist;
  // console.log(list)
  for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i];
    const { title, viewsCount, type, summaryInfo, user, objectId} = item;
    const { community, avatarLarge } = user;
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
      author: user.username,
      community: JSON.stringify(community),
      createDate: item.createdAt
    };
    saveToCollections(params);
  }
};

const fetcnDataFromRequest = (url, status) => {
  request({
    method: 'GET',
    url: url,
    json: 'Content-type: application/json'
  }, (error, res, data) => {
    filterData(data, status);
  })
};

/**
 * 最新链接 : 规则： 根据ISO时间，往前推一天
 * https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&before=2017-09-19T07%3A48%3A15.354Z&limit=20&tag=5597a05ae4b08a686ce56f6f
 *
 * 最热链接 : 规则： 随机生成before的值
 * https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&before=0.027320297817573&limit=20&tag=5597a05ae4b08a686ce56f6f
 */
const forEachHotestUrl = () => {
  const setTotalNum = 100;
  let random = null;
  for (let i = 0; i < setTotalNum; i++) {
    random = Math.floor(Math.random() * 100000000000000).toString();
    random = `0.${random}`;
    const url = `https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&before=${random}&limit=200&category=5562b415e4b00c57d9b94ac8`;
    fetcnDataFromRequest(url, 'hot');
  }
};

const forEachNewestUrl = () => {
  const setTotalNum = 2 * 365;
  let currentDate = new Date();
  const oneDay = 1 * 24 * 60 * 60 * 1000;
  for (let i = 0; i < setTotalNum; i++) {
    currentDate = currentDate - oneDay;
    const before = new Date(currentDate);
    const url = `https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&before=${encodeURIComponent(before.toISOString())}&limit=100&category=5562b415e4b00c57d9b94ac8`;
    // console.log(url);
    fetcnDataFromRequest(url, 'new');
  }
};

const dataFromJuejin = () => {
  forEachHotestUrl();
  forEachNewestUrl();
};

async function saveToCollections (params) {
  const { objectId, title, author } = params;
  let juejin = await juejinModel.findOne({objectId});
  if (juejin) {
    repeatCount++;
    return console.log(`${title} exists....`);
  }
  count++;
  console.log(`${author} ： ${title}`);
  return new juejinModel(params).save((err, res) => {
    if (err) {
      throw new Error(`save ${title} error...`);
    }
  })
}

export default dataFromJuejin;
