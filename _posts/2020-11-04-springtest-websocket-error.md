---
layout: post
title:  "引入WebSocket后SpringBoot测试报错解决"
data: 2020年11月4日14:45:52
categories: SpringBoot
tags:  SpringBoot websocket error
author: dave
---

* content
{:toc}
## 前言
spring boot 运行测试类时出现：Error creating bean with name 'serverEndpointExporter' 错误，记录解决方法。




## 产生原因
websocket是需要依赖tomcat等容器的启动。所以在测试过程中我们要真正的启动一个tomcat作为容器，不然会报错。

![ServerEndpoint](https://github.com/dave0824/dave0824.github.io/blob/master/asset/springboot/websocket/ServerEndpoint.png?raw=true)

就是这个注解出现问题

## 解决方法

1. 将 @RunWith(SpringRunner.class) 去掉即可,但是这种方式会有局限，比如下方你要@Authwired一个类的时候会报错。

![solve1](https://github.com/dave0824/dave0824.github.io/blob/master/asset/springboot/websocket/solve1.png?raw=true)

2. 在SpringBootTest后加上 (webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) 即可

```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TestTask {

}

```
