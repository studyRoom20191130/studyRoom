// const bindOtherTime = () => {
//     let btn = e('.btn-other-time')
//     let div = e('.other-time')
//     bindEvent(btn, 'click', (event) => {
//         log('btn')
//         // $('.other-time').toggleClass('hidden', false)
//         let has = $('.other-time').hasClass('hidden')
//         if (has) {
//             $('.other-time').removeClass('hidden')
//         } else {
//             $('.other-time').addClass('hidden')
//         }
//     })
// }

const bindEvents = () => {
  setTimeout(() => {
    // bindOtherTime()
    bindTodoInputEvent();
    bindLeftDivBtnEvent();
    bindRightDivEvents();
    // bindWeekTodo()
    bindOtherPersonalPage();
    bindMainArticleEvent();
  }, 1500);
};

const getstudyDataList = () => {
  let today = moment().format('YYYY年MM月DD日');
  let user = getLocalStorage('userInfo').split('-')[0];
  let data = {
    today,
    user,
  };
  ajax(data, '/getStudyDataList', (res) => {
    let studyDataList = [];
    if (res) {
      studyDataList = JSON.parse(res);
    }
    addHtmlToMainDiv(studyDataList);
  });
};

const autoRefresh = () => {
  let 每十五分钟自动刷新一次 = 1000 * 60 * 15;
  setInterval(() => dataInit(), 每十五分钟自动刷新一次);
};

const dataInit = () => {
  // 第一次创建当天记录文件的时候会清空在线人员名单，但是无法保证清空和写入的先后顺序
  getstudyDataList();

  // 所以用延时来确保先清空后写入
  setTimeout(() => {
    getOnlineUser();
  }, 50);
};

const getOnlineUser = () => {
  let user = getLocalStorage('userInfo').split('-')[0];
  let data = {
    user,
  };
  ajax(data, '/getOnlineUser', (res) => {
    let onlineUserList = res || [];
    addOnlineUser(onlineUserList);
  });
};

const removeOfflineUser = () => {
  window.onbeforeunload = () => {
    let user = getLocalStorage('userInfo').split('-')[0];
    let data = {
      user,
    };
    ajax(data, '/removeOfflineUser', (res) => {});
  };
};

const showTips = () => {
  let shouldShowTips = getLocalStorage('showTips5') || 'show';
  if (shouldShowTips === 'show') {
    let html = `
        <br>
        <div style="text-align: left">

            <hr>
            <p>在在线名单或中间表格点击名字，进入个人主页</p>
            <p>如果使用了 axe - 作业， 重写guagame - 视频1这种格式</p>
            <p>那么可以看到进入自习室至今在 axe 和 重写guagame 投入的总时长</p>
            <hr>
            <p>右侧 todo 事项，单击、双击、三击黄色常用事项，分别对应添加、编辑和删除</p>
            <hr>
            <p>新增了预期字段，输入预期完成时间，比如 30</p>
            <hr>
            <p>新增了补录功能</p>
            <p>输入了补录的结束时间后直接按回车或点击输入框外完成补录</p>
            <hr>
            <p class="tips" style="text-decoration: underline;cursor: pointer">不再提示</p>
        </div>
        <br><br><br><br><br><br><br>`;
    let div = e(`.right`);
    div.insertAdjacentHTML('beforeend', html);
  }
};

const calculateTimeGoesBy = () => {
  let remaing = getBeforeDate(`${new Date().getFullYear()},12,31`)
  let r = (365 - remaing) / 365
  // 转换百分比
  r  = calculatePersent(r, 3)
  $('.time-goes-by').css('width',r);
  e('.time-goes-by').innerHTML = '2020 已过去 ' +  r
}

const addMailBtn = () => {
  let user = getLocalStorage('userInfo').split('-')[0]
  if (user === 'life') {
    let html = `<button id="send-mail" style="margin-right: 28px;position: fixed;bottom: 0;right: 0;" class="btn btn-common  btn-new ">邮件</button>`
    appendHtml(e('.right'), html);
    bindEvent(e('#send-mail'), 'click', (event) => {
      ajax({}, '/sendMail', (res) => {
        log(res)
      });
    })
  }
}

const __main = () => {
  // 数据初始化
  dataInit();
  // 右侧 todo 数据初始化
  todoInit();
  // 轮询
  // autoRefresh()
  // 关闭页面回调，移除在线
  removeOfflineUser();
  // 绑定页面所需的所有事件
  bindEvents();
  //展现更新提示
  showTips();
  // 显示年度进度条
  calculateTimeGoesBy()

  addMailBtn()
};

__main();
