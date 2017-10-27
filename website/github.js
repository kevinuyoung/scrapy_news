import path from 'path';
import fs from 'fs';
import superAgent from 'superagent';
import cheerio from 'cheerio';
import request from 'request';

const dataFromGithub = () => {
  // 所有语言 热门
  // https://github.com/trending' // 默认今天 ?since=weekly  daily monthly

  const url = 'https://github.com/trending/javascript?since=weekly'; //daily  monthly
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }
      const $ = cheerio.load(documents.text);
      const $repo = $('.repo-list');
      const $repoList = $repo.find('li');
      console.log($repoList.length);
      const result = [];

      for(let i = 0; i < $repoList.length; i++) {
        const $item = $repoList.eq(i);
        const title = ($item.find('.d-inline-block h3 a').text()).replace(/\n*/g,'');
        const url = $item.find('.d-inline-block h3 a').attr('href');
        const desc = ($item.find('.py-1 p').text()).replace(/\n*/g,'');;
        const type = $item.find('.text-gray .d-inline-block span').text();
        const stars = ($item.find('.text-gray a.muted-link').eq(0).text()).replace(/\n*\s*/g,'');
        const forks = ($item.find('.text-gray a.muted-link').eq(1).text()).replace(/\n*\s*/g,'');
        result.push({title,url,desc,stars, forks});
      }
      console.log(result);
  })
};

export default dataFromGithub;