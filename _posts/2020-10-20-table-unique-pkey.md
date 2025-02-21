---
layout: post
title:  "表主键自增出现违反唯一约束"
data: 2020年10月20日17:08:10
categories: sql
tags:  sql
author: dave
---

* content
{:toc}
## 前言
后台出现违反了唯一性约束错误，记录下这个问题解决办法




## 描述
后台报错duplicate key value violates unique constraint device_id_key.这个错误意思是,重复的键值违反了唯一性约束.也就是device表中的id违反了唯一性约束.

>
出现的原因是: 以user表为列子.id是唯一的且id在数据库中是自增的. 而现在数据库中存在的id的值大于了id现在应该自增的值.比如现在数据库user表中现在的id是100,而id自增才增长到95.那你在添加一条数据的时候,id是96,id为96的这条数据已经有了,所以id就违反了唯一性约束.
>

## 解决
1.先要查看这张表中已经存在的id的最大值是多少. 直接在数据库连接工具中输入sql查询.

```sql
Select max(id) from user;
```
2.查询这张表的id的自增序列是多少.

```sql
 Select nextval('user_id_seq');
```

3.如果这张表的id的最大值大于 id的自增序列的值.那就证明添加的时候会出现id被占用,而导致id违反唯一性约束的问题. 我们只需要重新给id的自增序列赋值,赋一个大于现在表中id的最大值就可以了.

```sql
SELECT setval('user_id_seq', xxx);
```

4.在重新查询一下,id的自增序列的值是多少,如果和上一步我们设置的值一样的话,就没有问题了.

```sql
 Select nextval('user_id_seq');
```

## 修改脚本
public 为名称空间

```sql
SELECT
        'alter sequence public.' || TABLEname || '_id_seq restart with 20001; '
FROM
        pg_tables
WHERE
        tableowner = 'postgres'
AND SCHEMANAME = 'public'
```
