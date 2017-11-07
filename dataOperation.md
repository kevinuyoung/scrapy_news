### 获取总数据
db.getCollection('segmentfaults').find({}).count();

### 表新增字段,并赋值
https://docs.mongodb.com/manual/reference/method/db.collection.update/#example
新增字段 category，并给所有数据赋值
db.segmentfaults.update({query}, {$set: { category: "frontend" }}, {multi: ##1})

### 导出数据库之后，将数据库压缩为zip包，随后放置在另外一台机器导入数据
- 将zip解压后发现，有json和bson后缀文件，只需倒入到各个表就可以。
 mongorestore -d scrapynews /Users/simon/doc/scrapynews/juejins.bson
 
mongorestore -d scrapynews /root/scrapy_news/data/juejins.bson
mongorestore -d scrapynews /root/scrapy_news/data/segmentfaults.bson

### 获取总数据
db.getCollection('segmentfaults').find({}).count();

### 表新增字段,并赋值
https://docs.mongodb.com/manual/reference/method/db.collection.update/#example
新增字段 category，并给所有数据赋值
db.segmentfaults.update({query}, {$set: { category: "frontend" }}, {multi: 1})

db.juejins.find().count()
db.segmentfaults.find().count()

## 删除数据库
use dataName;
db.dropDatabase();

## 导出数据库
mongodump  -d mockdata /Users/kai/practice

## 导入数据库
mongorestore -d mockdata /Users/kai/practice/mockdata


```js
这种延迟是错误的，这个导致的后果就是，假设有1000个请求，隔了两秒后，所有的请求依旧 全部发送出去了。
而理想的结果是，没发送一个请求隔2s.

for (let i = 1; i <= setTotalNum; i++) {
    const url = `https://segmentfault.com/news/${category}?page=${i}`;
    // const data = await dataFromSegmentfault(url, 'hot');
    setTimeout(()=> {
      sendRequestToSegmentfault(url, 'hot');
    }, 2000)
  }

```