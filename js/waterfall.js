/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

  /**
     * 内容JSON
     */
  var demoContent = [

      {
          demo_link: 'https://demo.stylefeng.cn/',
          img_link: 'https://camo.githubusercontent.com/4eb41152d88bcd2692ebf99230c5d1a0eb0a9b66/68747470733a2f2f6769742e6f736368696e612e6e65742f75706c6f6164732f696d616765732f323031372f303532362f3130333832325f35386664356439315f3535313230332e706e67',
          code_link: 'https://github.com/stylefeng/Guns',
          title: 'Guns Java项目快速开发手架',
          core_tech: 'SpringBoot',
          description: '适合企业后台管理网站的快速开发场景，不论是对于单体和微服务都有支持，主要功能有：系统管理、代码生成、SSO单点登录、短信。授权、任务调度等'
      },
      {
          demo_link: 'https://pig4cloud.com/',
          img_link: 'https://mmbiz.qpic.cn/mmbiz_png/iaIdQfEric9TyibW29gc9tAJBaicjO0dDWsho5ZWnncKHr0ibfa9uia2icApfO7FKuhaVmeHjIjqHpTQVkJ5ibric913eLw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
          code_link: 'https://gitee.com/log4j/pig',
          title: 'Pig Java项目快速开发手架',
          core_tech: 'SpringCloud',
          description: '基于 Spring Cloud Hoxton 、Spring Boot 2.2、 OAuth2 的 RBAC 权限管理系统'
      },
      {
          demo_link: 'http://ruoyi.vip/',
          img_link: 'https://mmbiz.qpic.cn/mmbiz_png/iaIdQfEric9TyibW29gc9tAJBaicjO0dDWshTkK4wNLz0P9HRAfxv4spaoJw2btEKHqQIlFmXicWbmj1yCrhdMKZDAQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
          code_link: 'https://gitee.com/y_project/RuoYi',
          title: 'RuoYi Java项目快速开发手架',
          core_tech: 'SpringBoot',
          description: 'RuoYi 一款基于基于 SpringBoot 的权限管理系统 易读易懂、界面简洁美观，直接运行即可用 。'
      },
      {
          demo_link: 'http://boot.jeecg.com',
          img_link: 'https://mmbiz.qpic.cn/mmbiz_png/iaIdQfEric9TyibW29gc9tAJBaicjO0dDWshJicEqAdYpK8eibcjoRrQCwsLNLsvPvHQYttAUP8PKMgFOhkKQQLofwAg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
          code_link: 'https://gitee.com/jeecg/jeecg-boot',
          title: 'Jeecg-boot Java项目快速开发手架',
          core_tech: 'SpringBoot',
          description: 'Jeecg-Boot 快速开发平台，可以应用在任何 J2EE 项目的开发中，尤其适合企业信息管理系统（MIS）、内部办公系统（OA）、企业资源计划系统（ERP）、客户关系管理系统（CRM）等，其半智能手工 Merge 的开发方式，可以显著提高开发效率 70%以上，极大降低开发成本。'
      },
      {
          demo_link: 'https://www.oschina.net/p/iBase4J',
          img_link: 'https://mmbiz.qpic.cn/mmbiz_png/iaIdQfEric9TyibW29gc9tAJBaicjO0dDWshXEsF80cOL0JkFIVdmCiatn9ggOXiaQEyIn5UH3U4ohdG2njK4LPdjybw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
          code_link: 'https://gitee.com/iBase4J/iBase4J',
          title: 'iBase4J Java项目快速开发手架',
          core_tech: 'SpringBoot',
          description: '这个项目一般般，分布式架构，但是用的是 Dubbo,适用分布式企业管理系统的场景。'
      }
  ];

  contentInit(demoContent) //内容初始化
  waitImgsLoad() //等待图片加载，并执行布局初始化
}());

/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
  // var htmlArr = [];
  // for (var i = 0; i < content.length; i++) {
  //     htmlArr.push('<div class="grid-item">')
  //     htmlArr.push('<a class="a-img" href="'+content[i].demo_link+'">')
  //     htmlArr.push('<img src="'+content[i].img_link+'">')
  //     htmlArr.push('</a>')
  //     htmlArr.push('<h3 class="demo-title">')
  //     htmlArr.push('<a href="'+content[i].demo_link+'">'+content[i].title+'</a>')
  //     htmlArr.push('</h3>')
  //     htmlArr.push('<p>主要技术：'+content[i].core_tech+'</p>')
  //     htmlArr.push('<p>'+content[i].description)
  //     htmlArr.push('<a href="'+content[i].code_link+'">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>')
  //     htmlArr.push('</p>')
  //     htmlArr.push('</div>')
  // }
  // var htmlStr = htmlArr.join('')
  var htmlStr = ''
  for (var i = 0; i < content.length; i++) {
    htmlStr += '<div class="grid-item">' + '   <a class="a-img" href="' + content[i].demo_link + '">' + '       <img src="' + content[i].img_link + '">' + '   </a>' + '   <h3 class="demo-title">' + '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' + '   </h3>' + '   <p>主要技术：' + content[i].core_tech + '</p>' + '   <p>' + content[i].description + '       <a href="' + content[i].code_link + '">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>' + '   </p>' + '</div>'
  }
  var grid = document.querySelector('.grid')
  grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
  var imgs = document.querySelectorAll('.grid img')
  var totalImgs = imgs.length
  var count = 0
  //console.log(imgs)
  for (var i = 0; i < totalImgs; i++) {
    if (imgs[i].complete) {
      //console.log('complete');
      count++
    } else {
      imgs[i].onload = function() {
        // alert('onload')
        count++
        //console.log('onload' + count)
        if (count == totalImgs) {
          //console.log('onload---bbbbbbbb')
          initGrid()
        }
      }
    }
  }
  if (count == totalImgs) {
    //console.log('---bbbbbbbb')
    initGrid()
  }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
  var msnry = new Masonry('.grid', {
    // options
    itemSelector: '.grid-item',
    columnWidth: 250,
    isFitWidth: true,
    gutter: 20
  })
}
