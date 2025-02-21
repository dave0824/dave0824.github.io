---
layout: post
title:  "接口的安全问题及接口对接"
data: 2020年11月25日16:17:50
categories: work
tags:  work RestTemplate
author: dave
---

* content
{:toc}
## 前言
API 接口的安全问题及接口对接




## API 接口的安全问题

所有的对外开放的接口都应该考虑接口的安全问题

- 请求身份是否合法？
- 请求参数是否被篡改？
- 请求是否唯一？

在APP开放API接口的设计中，由于大多数接口涉及到用户的个人信息以及产品的敏感数据，所以要对这些接口进行身份验证，为了安全起见让用户暴露的明文密码次数越少越好，然而客户端与服务器的交互在请求之间是无状态的，也就是说，当涉及到用户状态时，每次请求都要带上身份验证信息。

## API 接口的安全问题解决方案

### 请求身份

为开发者分配AccessKey（开发者标识，确保唯一）和SecretKey（用于接口加密，确保不易被穷举，生成算法不易被猜测）。

### 防止篡改

参数签名

- 按照请求参数名的字母升序排列非空请求参数（包含AccessKey），使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串stringA；
- 在stringA最后拼接上Secretkey得到字符串stringSignTemp；
- 对stringSignTemp进行MD5运算，并将得到的字符串所有字符转换为大写，得到sign值。

请求携带参数AccessKey和Sign，只有拥有合法的身份AccessKey和正确的签名Sign才能放行。这样就解决了身份验证和参数篡改问题，即使请求参数被劫持，由于获取不到SecretKey（仅作本地加密使用，不参与网络传输），无法伪造合法的请求。

### 重放攻击

虽然解决了请求参数被篡改的隐患，但是还存在着重复使用请求参数伪造二次请求的隐患。

timestamp+nonce方案

nonce指唯一的随机字符串，用来标识每个被签名的请求。通过为每个请求提供一个唯一的标识符，服务器能够防止请求被多次使用（记录所有用过的nonce以阻止它们被二次使用）。

然而，对服务器来说永久存储所有接收到的nonce的代价是非常大的。可以使用timestamp来优化nonce的存储。

假设允许客户端和服务端最多能存在15分钟的时间差，同时追踪记录在服务端的nonce集合。当有新的请求进入时，首先检查携带的timestamp是否在15分钟内，如超出时间范围，则拒绝，然后查询携带的nonce，如存在已有集合，则拒绝。否则，记录该nonce，并删除集合内时间戳大于15分钟的nonce（可以使用redis的expire，新增nonce的同时设置它的超时失效时间为15分钟）。

### 虽然解决了请求参数被篡改的隐患，但是还存在着重复使用请求参数伪造二次请求的隐患。

timestamp+nonce方案

nonce指唯一的随机字符串，用来标识每个被签名的请求。通过为每个请求提供一个唯一的标识符，服务器能够防止请求被多次使用（记录所有用过的nonce以阻止它们被二次使用）。

然而，对服务器来说永久存储所有接收到的nonce的代价是非常大的。可以使用timestamp来优化nonce的存储。

假设允许客户端和服务端最多能存在15分钟的时间差，同时追踪记录在服务端的nonce集合。当有新的请求进入时，首先检查携带的timestamp是否在15分钟内，如超出时间范围，则拒绝，然后查询携带的nonce，如存在已有集合，则拒绝。否则，记录该nonce，并删除集合内时间戳大于15分钟的nonce（可以使用redis的expire，新增nonce的同时设置它的超时失效时间为15分钟）。

#### 服务端

![apiTranster](https://github.com/dave0824/dave0824.github.io/blob/master/asset/work/apiTranster.jpg?raw=true)

## 代码演示

```java
// 	postForObject，无需设置请求头
public JSONObject test(Map<String ,Object> param){
		String url = url;
		param.put("appkey", corpKey);
		param.put("ts", System.currentTimeMillis()/1000);
		String signparam = SignUtil.createLinkString(param);
		signparam = signparam+"&secret="+corpSecret;
		param.put("sign", SignUtil.encode(signparam));
		logger.info("url:" + url + ">>param:" + JSONObject.toJSONString(param));
		return restTemplate.postForObject(url, param, JSONObject.class);
	}
```

**RestTemplate 相关移步 ** [RestTemplate详解](https://dave0824.gitee.io/2020/06/26/rest-template)

### 工具类

```java
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
public class SignUtil {

	/** 
	 * 把数组所有元素排序，并按照“参数=参数值”的模式用“&”字符拼接成字符串
	 * @param params 需要排序并参与字符拼接的参数组
	 * @return 拼接后字符串
	 */
	public static String createLinkString(Map<String, Object> params) {

		List<String> keys = new ArrayList<String>(params.keySet());
		Collections.sort(keys);

		StringBuilder sb = new StringBuilder();

		for (int i = 0; i < keys.size(); i++) {
			String key = keys.get(i);
			String value = String.valueOf(params.get(key));
			if(value != null && !value.trim().equals("")){
				if(sb.length() > 0)sb.append("&");
				sb.append(key + "=" + value.trim());
			}
		}
		return sb.toString();
	}

	/**
	 * MD5
	 * @param data
	 * @return
	 */
	public static String encode(String data) {
		StringBuffer buf = new StringBuffer("");
		try {
			MessageDigest md = MessageDigest.getInstance("MD5");
			try {
				md.update(data.getBytes("UTF-8"));
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			byte b[] = md.digest();
			int i;
			for (int offset = 0; offset < b.length; offset++) {
				i = b[offset];
				if (i < 0)
					i += 256;
				if (i < 16)
					buf.append("0");
				buf.append(Integer.toHexString(i));
			}
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return buf.toString();
	}	
}

```

