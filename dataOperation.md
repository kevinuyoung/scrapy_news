### 获取总数据
db.getCollection('segmentfaults').find({}).count();

### 表新增字段,并赋值
https://docs.mongodb.com/manual/reference/method/db.collection.update/#example
新增字段 category，并给所有数据赋值
db.segmentfaults.update({query}, {$set: { category: "frontend" }}, {multi: 1})