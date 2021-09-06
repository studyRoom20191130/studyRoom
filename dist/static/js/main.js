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
    bindTodoInputEvent()
    bindLeftDivBtnEvent()
    bindRightDivEvents()
    // bindWeekTodo()
    bindOtherPersonalPage()
    bindMainArticleEvent()
    bindEventLoadedShareImage()
    bindShopToggleEvent()
    chooseWeaponEvent()
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
      renderOnlineUser(studyDataList)
    }
    addHtmlToMainDiv(studyDataList);
  });
};

const calculateTimeGoesBy = () => {
  let year = new Date().getFullYear()
  let remaing = getBeforeDate(`${year},12,31`)
  let r = (365 - remaing) / 365
  // 转换百分比
  r  = calculatePersent(r, 3)
  $('.time-goes-by').css('width',r);
  e('.time-goes-by').innerHTML = `${year} 已过去${r}`
}

const addMailBtn = () => {
  let user = getLocalStorage('userInfo').split('-')[0]
  if (user === 'life') {
    let html = `<button id="send-mail" style="margin-right: 28px;position: fixed;bottom: 0;right: 0;" class="btn btn-common  btn-new ">邮件</button>`
    appendHtml(e('.right'), html);
    bindEvent(e('#send-mail'), 'click', (event) => {
      let mailUsers = JSON.parse(localStorage.getItem('mailUsers'))
      let mailAddress = JSON.parse(localStorage.getItem('mailAddress'))
      var data = {
        mailUsers,
        mailAddress,
      }
      ajax(data, '/sendMail', (res) => {
        log(res)
      });
    })
  }
}

const __main = () => {
  // 数据初始化
  getstudyDataList();
  // 右侧 todo 数据初始化
  todoInit();

  // 绑定页面所需的所有事件
  bindEvents();
  // 显示年度进度条
  calculateTimeGoesBy()

  addMailBtn()

  generateDailyDiv()
  renderShop()
  initEditor()
};

__main();
