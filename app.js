import express from 'express';
import path from 'path';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import request from 'request';

const app = express();

const data = [];


const temp = ['1小时前', '2016年12月30日', '20分钟前', '6月22日', '6天前'];
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
// for (let i = 0, len = temp.length; i < len; i++) {
//   let res = updateToGMT(temp[i]);
//   console.log(res);
// }
//https://segmentfault.com/t/javascript/blogs?page=1
//https://segmentfault.com/news/frontend?page=1
/**
 * [description]
 * scrapy news from segmentfault
 */
const dataFromSegmentfault = () => {
  // const url = "https://segmentfault.com/t/javascript/blogs?page=1";
  // 小于1天，用 小时
  // 小于7天，就 天，
  // 大于等于 7天， 用 月份/日期
  // 不在今年， 用 年/月/日
  // const url = "https://segmentfault.com/news/frontend?page=1";  // 最热头条
  const url = "https://segmentfault.com/news/frontend/newest?page=1"; // 最新头条
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }

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

        const pattern = /(<a)(.*?)(>)(.*?)(<\/a>)(.*?)(\s+.*?)/;
        const execRes = pattern.exec(metaHtml);
        const author = execRes[4];
        const createDate = updateDate(execRes[6]);

        let counts = $item.find('.news__bookmark-text').text();
        if (counts.indexOf('k') > 0) {
          counts = parseFloat(counts) * 1000;
        }
        counts = parseInt(counts);
        const hotNumber = $item.find('.news__bookmark-text').text();
        data.push({
          title,
          author,
          url,
          createDate,
          counts
        })
      }
      console.log(data);
      // const $blog = $('#blog');
      // const $articles = $blog.find('.stream-list__item');
      // console.log($articles);
      // console.log($articles.length);
      // for(let i = 0; i < $articles.length; i++) {
      //   // const temp = {};
      //   const $index = $articles.eq(i);
      //   const title = $index.find('.title a').text();
      //   const url = $index.find('h2.title a').attr('href');
      //   const author = $index.find('ul.author img').attr('alt');
      //   const desc = $index.find('.excerpt').text();
      //   console.log(url);
      //   console.log(author);
      //   console.log(desc);
      //   data.push({title,url,author,desc});
      // }
      // console.log(data);
    })
};

const fetcnDataFromRequest = (url) => {
  console.log(url);
  request({
    method: 'GET',
    url: url,
    json: 'Content-type: application/json'
  }, (error, res, data) => {
    console.log('-----------------------');
    // const resData = JSON.parse(data);
    // const list = JSON.parse(data).d.entrylist;
    const list = data.d.entrylist;
    const result = [];
    for (let i = 0, len = list.length; i < len; i++) {
      const item = list[i];
      const title = item.title;
      const viewCount = item.viewsCount;
      const createDate = item.updatedAt;

      const user = item.user;
      const author = user.username;
      const userCommunity = JSON.stringify(user.community);
      const type = item.type;

      let url = '';
      if (type === 'article') {
        url = `/entry/${item.objectId}/detail`;
      }
      if (type === 'post') {
        url = `/post/${item.objectId}`;
      }
      result.push({
        title,
        author,
        url,
        viewCount,
        createDate,
        userCommunity
      });
    }
    console.log(result);
  })
};

const dataFromJuejin = () => {
  // 最新 链接
  // https://timeline-merger-ms.juejin.im/v1/get_entry_by_timeline?src=web&before=2017-09-19T07%3A48%3A15.354Z&limit=20&tag=5597a05ae4b08a686ce56f6f

  // 最热链接
  // https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&before=0.027320297817573&limit=20&tag=5597a05ae4b08a686ce56f6f

  // const url = "https://juejin.im/welcome/frontend";
  // let random = Math.floor(Math.random() * 100000000000000).toString();
  let random = null;
  for (let i = 0; i < 2; i++) {
    random = Math.floor(Math.random() * 100000000000000).toString();
    random = `0.${random}`;
    const url = `https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&before=${random}&limit=2&category=5562b415e4b00c57d9b94ac8`;
    fetcnDataFromRequest(url);
  }
  // superAgent
  //   .get(url)
  //   .end((err, result) => {
  //     if (err) {
  //       return console.log(err);
  //     }
  //     console.log(result.text);
  //     const data = result.text;
  //     // console.log(data.entrylist);
  //   })
};
dataFromJuejin();
// cnblogs
const dataFromCnblogs = () => {
  const url = "https://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=1&ParentCategoryId=0";
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }
      // console.log(documents.text);
      const $ = cheerio.load(documents.text);
      const $blog = $('#post_list');
      const articles = $blog.find('a');
      console.log(articles);
      console.log(articles.length);
    })
};

const dataFromGithub = () => {
  // 所有语言
  // https://github.com/trending' // 默认今天 ?since=weekly  daily monthly

  const url = 'https://github.com/trending/css?since=weekly'; //daily  monthly

};

// dataFromSegmentfault();
// dataFromCnblogs();



const server = app.listen(7000, function () {
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', 'localhost', port);
});