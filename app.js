import express from 'express';
import path from 'path';
import superAgent from 'superagent';
import cheerio from 'cheerio';

const app = express();

const data = [];
//https://segmentfault.com/t/javascript/blogs?page=1
const dataFromSegmentfault = () => {
  const url = "https://segmentfault.com/t/javascript/blogs?page=1";
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }
      // console.log(documents.text);
      const $ = cheerio.load(documents.text);
      const $blog = $('#blog');
      const $articles = $blog.find('.stream-list__item');
      console.log($articles);
      console.log($articles.length);
      for(let i = 0; i < $articles.length; i++) {
        // const temp = {};
        const $index = $articles.eq(i);
        const title = $index.find('.title a').text();
        const url = $index.find('h2.title a').attr('href');
        const author = $index.find('ul.author img').attr('alt');
        const desc = $index.find('.excerpt').text();
        console.log(url);
        console.log(author);
        console.log(desc);
        data.push({title,url,author,desc});
      }
      console.log(data);
    })
};

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


dataFromSegmentfault();
// dataFromCnblogs();



const server = app.listen(7000, function () {
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', 'localhost', port);
});