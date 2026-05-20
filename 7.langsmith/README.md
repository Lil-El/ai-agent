# LangSmith

RAG 评估：

整理一批问题和对应的标准答案，挨个拿去提问 Agent，对比实际回答和标准回答的差距，以此来完成打分评判。

直接借助 LangSmith 来实现，用里面的 dataset 专门管理评测数据集，统一存放各类问题与标准答案。

再通过 evaluation 配置好各类评估指标与打分规则，就能自动批量发起测试，对照实际输出和标准答案，按照不同维度自动完成评分，高效完成整套 RAG 效果评估。

## Milvus

使用的版本是 v3.0，支持新增集合字段等功能。之前使用的是 v2.6。

## Run

1. npm run milvus:insert 插入数据
  1. npm run milvus:index 修改索引
  2. npm run milvus:query 查询数据
2. npm run agent 查询多条问题
3. npm run sm:dataset 上传数据集
4. npm run sm:eval 评估任务