功能待做清单
1.每隔15分钟自动刷新首页数据（

2.显示当前在线同学

3.将自己作为首页的第一栏（此条暂时不做）

4.添加个人主页功能

5.评论及消息提醒功能

6.用数据库代替现在的 json 文件

7.点击右侧常用计划自动补充到左侧学习内容（右键时）

8.个人主页导出功能

9.个人主页的个性签名功能

10.个人主页增加年度计划中已完成的事项展示看板

11.导航栏增加 周计划 选项，类似 trello 可以查看自习室内同学的每周计划

12.当天学习时间最多的同学名字后面跟一个龙王标识（

13.免点击 开始 结束 方案：写完 学习内容后 按 F2（具体按哪个键可以再研究），开始计时，再按 F2，结束学习，这样可以避免移动光标去点击按钮

/static/js 里的逻辑文件简介
首页分左中右三个区域，中间为数据展示，左右为逻辑交互
首页逻辑入口文件 main.js
首页左侧逻辑 index_left_area_events.js（加塞了点击人名跳转个人主页的点击事件）
首页右侧逻辑 index_right_area_events.js
node 接口逻辑 express_demo.js
辅助函数 utils.js
问题
1.使用原生 js ，不能很好的实现组件化，再加上文件分散，逻辑分散，导致其他人很难阅读、维护、扩展（我本人现在已经有点看不懂了）

2.文件命名没有经过仔细思考，不能很好的表达出意图，比如左侧的逻辑文件应该命名为 index_left_area_events.js，对应的右侧的应为 index_right_area_events.js

3.界面很丑

使用的辅助工具
1.jQuery
2.moment.js
3.按钮样式 http://simurai.com/archive/buttons/#
4.bootstrap