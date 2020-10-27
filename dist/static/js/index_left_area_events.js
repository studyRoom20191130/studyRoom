// 首页左边区域（开始学习、结束学习、补录时间）的功能逻辑

window.disabledSendAdditionalRecord = false;
window.firstEnter = true;

const bindLeftDivBtnEvent = () => {
  bindEvent(e('.left'), 'click', (event) => {
    let target = event.target;
    let contains = target.classList.contains.bind(target.classList);
    if (contains('btn')) {
      let button = target.dataset.button;
      if (button === 'start') {
        startBtnHandle();
      } else if (button === 'end') {
        endBtnHandle();
      } else if (button === 'additionalRecord') {
        additionalRecord();
      }
    }
  });
  bindTipEvent();
  bindAdditionalEndInput();
  bindTextareaEvent()

};

const bindTextareaEvent = () => {
    let textarea = e('#textarea-study-content')
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        window.firstEnter && event.preventDefault()
        window.firstEnter = false
        startBtnHandle();
      }
    });
}

const bindAdditionalEndInput = () => {
  let additionalEndInput = e('#additional-end');
  additionalEndInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendAdditionalRecord();
    }
  });
  additionalEndInput.addEventListener('blur', (event) => {
    sendAdditionalRecord();
  });
};

const checkAdditionalRecordValue = (val) => {
  let digt = '0123456789';
  for (const str of val) {
    if (!digt.includes(str) || val.length !== 4) {
      swal({
        title: '输入的补录时间格式不对',
        text: '2秒后自动关闭',
        timer: 2000,
      }).then(
        function () {},
        function () {}
      );
      return 'invalid';
    }
  }
};

const sendAdditionalRecord = () => {
  // 两秒内禁止调用函数
  if (window.disabledSendAdditionalRecord) {
    return;
  }
  setTimeout(() => {
    window.disabledSendAdditionalRecord = false;
  }, 2000);
  window.disabledSendAdditionalRecord = true;

  let s = $('#additional-start').val();
  let e = $('#additional-end').val();
  for (const val of [s, e]) {
    let checkResult = checkAdditionalRecordValue(val);
    if (checkResult === 'invalid') {
      return;
    }
  }

  if (s && e) {
    // 计算并转换时间数据
    let start = s.slice(0, 2) + ':' + s.slice(2);
    let end = e.slice(0, 2) + ':' + e.slice(2);
    window.initToggle = true;
    let segmentation = start + ' - ' + end;

    let [hourDuration, minuteDuration] = getDuration2(start, end);
    if (minuteDuration < 0) {
      swal({
        title: '输入时间错误，请确认输入是否正确',
        text: '2秒后自动关闭',
        timer: 2000,
      }).then(
        function () {},
        function () {}
      );
      return
    }
    if (minuteDuration > 200) {
      swal({
        title: '补录时间超过200分钟，请拆分细化后再补录',
        text: '2秒后自动关闭',
        timer: 2000,
      }).then(
        function () {},
        function () {}
      );
    }
    sendRecord(segmentation, minuteDuration, hourDuration);
    $('#additional-start').val('');
    $('#additional-end').val('');
    $('.other-time').toggle();
  } else {
    swal({
      title: '请填写开始和结束的时间',
      text: '2秒后自动关闭',
      timer: 2000,
    }).then(
      function () {},
      function () {}
    );
  }
};

const bindTipEvent = () => {
  if (!e('.tips')) {
    return;
  }
  bindEvent(e('.tips'), 'click', (event) => {
    let target = event.target;
    let div = $(target).parent()[0];
    div.remove();
    setLocalStorage('showTips5', 'notShow');
  });
};

const sendRecord = (segmentation, minuteDuration, hourDuration) => {
  let studyContent = $('#textarea-study-content').val();
  let user = getLocalStorage('userInfo').split('-')[0];
  let signature = getLocalStorage('signature') || '';
  let time = new Date();
  // let id = time.getTime();
  let today = moment().format('YYYY年MM月DD日');
  let expectation = $('#expectation').val();

  const singleRecord = {
    studyDate: getDate(), // 当天日期
    segmentation, // 12:30 - 13:30
    minuteDuration, // 60
    hourDuration, // 1
    studyContent, // 学习内容/备注
    expectation,
  };
  let userData = getLocalStorage('userInfo');
  const studyContentRecord = {
    userData,
    today,
    user,
    signature,
    // id,
    table: [singleRecord],
  };

  ajax(studyContentRecord, '/sendRecordData', (res) => {
    // 获取数据，更新页面
    let studyDataList = res || [];
    addHtmlToMainDiv(studyDataList);
    alertTip(singleRecord.minuteDuration);
    window.stopInterval = true;
    // 好像没有存签名的必要
    // let user = getLocalStorage('userInfo').split('-')[0];
    // for (const el of res) {
    //   if (user === el.user) {
    //     setLocalStorage('signature', el.signature);
    //   }
    // }
  }, 'stopInterval');
  getOnlineUser();
};

// 开始按钮防止重复点击
window.forbidStartBtnClick = false;
window.forbidEndBtnClick = true;
window.initToggle = true;

const startBtnHandle = () => {
  // 点击开始，开始计时
  if (window.forbidStartBtnClick) {
    return;
  }
  window.initToggle = true;
  window.forbidStartBtnClick = true;
  window.forbidEndBtnClick = false;
  start();
  window.startHourAndMinute = getNowHourAndMinute();
  window.startTime = getTime();
};

const additionalRecord = () => {
  let studyContent = e('#textarea-study-content').value;
  if (noStudyContent(studyContent)) {
    return;
  }
  $('.other-time').toggle();
};
const endBtnHandle = () => {
  if (window.forbidEndBtnClick) {
    swal({
      title: '先要开始，才能结束',
      text: '2秒后自动关闭',
      timer: 2000,
    }).then(
      function () {},
      function () {}
    );
    return;
  }
  window.forbidEndBtnClick = true;
  let studyContent = e('#textarea-study-content').value;
  if (noStudyContent(studyContent)) {
    return;
  }
  window.forbidStartBtnClick = false;
  window.firstEnter = true
  // 计算并转换时间数据
  let segmentation = getSegmentation();
  let [hourDuration, minuteDuration] = getDuration();
  sendRecord(segmentation, minuteDuration, hourDuration);
};

const alertTip = (minuteDuration) => {
  let tip = `本次学习 ${minuteDuration} 分钟~`;
  let m = Number(minuteDuration);
  if (m >= 60) {
    tip = `一口气竟然学了 ${minuteDuration} 分钟，好好休息一下~`;
  }
  Swal.fire(tip, `距离目标又缩短了 ${minuteDuration} 分钟的距离`, 'success');
};

// 拼接评论部分的 html
const getCommentHtml = (commentList, user) => {
  let comment = '';
  let commentArray = commentList || [];
  for (const obj of commentArray) {
    // 回复的评论
    if (obj.comment.includes('reply')) {
      let content = obj.comment.slice(5);
      comment += `<div data-user="${user}">
                            <span class="comments-span">${obj.commenter} </span>回复 <span class="comments-span">${obj.replyer}: </span><span>${content} </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--<span class="reply-span">回复</span>
                        </div>`;
    } else {
      // 单纯评论
      comment += `<div data-user="${user}">
                            <span class="comments-span">${obj.commenter}: </span><span>${obj.comment} </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--<span class="reply-span">回复</span>
                        </div>`;
    }
  }
  return comment;
};

// 把带 - 的数据找出来，拼成对象
const getprograssObj = (list) => {
  let prograssObj = {};
  for (const obj of list) {
    let s = obj.studyContent
    let index = s.indexOf('-');
    let key = s.slice(0, index).trim();// tf
    let time = obj.minuteDuration // 1-0
    if (key in prograssObj) {
      prograssObj[key] += time
    } else {
      prograssObj[key] = time
    }
  }
  return prograssObj
}


// 拼接表格数据部分的 html 并计算 分钟 和 小时
const getTrHtml = (list) => {
  let tr = `
        <tr class="success">
            <th>时间段</th>
            <th>时长</th>
            <th>预期</th>
            <th>内容/备注</th>
        </tr>`;
  let totalHour = 0;
  let totalMinitue = 0;
  let axeHour = 0;
  let tfHour = 0;


  for (const obj of list) {
    if (obj.studyContent.includes('axe')) {
      axeHour += obj.hourDuration;
    }
    if (obj.studyContent.includes('tf')) {
      tfHour += obj.hourDuration;
    }
    let expectation = '';
    if (obj.expectation) {
      expectation = obj.expectation + ' min';
    }
    tr += `<tr>
                    <td class="td-time">${obj.segmentation}</td>
                    <td class="td-hour">${obj.minuteDuration} min</td>
                    <td class="td-hour">${expectation} </td>
                    <td class="td-width">${obj.studyContent}</td>
                </tr>`;
    totalHour += obj.hourDuration;
    totalMinitue += obj.minuteDuration;
  }
  totalHour = totalHour.toFixed(1);
  return [tr, totalHour, totalMinitue, axeHour.toFixed(1), tfHour.toFixed(1)];
};

const generatePrograssHtml = (prograssObj, user) => {
  if (user !== getLocalStorage('userInfo').split('-')[0]) {
    return ''
  }
  let prograss = ``
  // 加载进度条的逻辑
  let dailyTodoList = getLocalStorage('dailyTodoList') || []
  let colorlist = ['pg-green', 'pg-blue', 'pg-yellow', 'pg-red', 'pg-lightgray']
  let colorIndex = 0
  for (const todo of dailyTodoList) {
    if (todo.includes('-')) {
      let index = todo.indexOf('-');
      let key = todo.slice(0, index).trim();
      let goalTime = todo.slice(index+1).trim()
      goalTime = Number(goalTime)
      for (const k in prograssObj) {
        if (k === key) {
          //    算百分比
          let persent = prograssObj[k] / goalTime
          // 转换百分比
          persent  = calculatePersent(persent, 2)
          prograss += `
            <div class="progress">
                <div class="progress-bar progress-bar-success ${colorlist[colorIndex]}" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: ${persent};">
                    ${key} - ${persent}
                </div>
            </div>
            `
        }
      }
      colorIndex++
    }
  }
  return prograss
}

const addHtmlToMainDiv = (studyDataList) => {
  // 增加龙王功能
  let dragonKingObj = {};
  let user = getLocalStorage('userInfo').split('-')[0];
  let isUser =
    user == 'life' || user == 'Hello' || user == 'hello' || user == 'H.K';
  // if(!isUser) {
  //     return
  // }

  let html = '';

  for (const studyData of studyDataList) {
    let signature = studyData.signature || '';
    let [tr, totalHour, totalMinitue, axeHour, tfHour] = getTrHtml(studyData.table);
    let s = studyData.user;
    let temp_s = studyData.user;
    if (s == 'H.K') {
      temp_s = 'H-K';
    }
    dragonKingObj[temp_s] = totalMinitue;
    let commentNum = studyData.commentArray
      ? `评论 (${studyData.commentArray.length})`
      : '评论';
    let comment = getCommentHtml(studyData.commentArray, s);

    let prograssObj = {}
    if (user === s) {
      prograssObj = getprograssObj(studyData.table, studyData.user)
    }

    let prograssHtml = generatePrograssHtml(prograssObj, studyData.user)
    let a = s == 'life' ? `<a class="personal-page">${s} - ${totalMinitue} min / ${totalHour} h (axe - ${axeHour} h, tf - ${tfHour} h)</a>` : `<a class="personal-page">${s} - ${totalMinitue} min / ${totalHour} h</a>
`
    html += `
        <article class="main-article">
            <div class="user-name title-weight ${temp_s}">
                ${a}
            </div>
            <div style="color: #409eff;margin: 5px 0;">${signature}</div>
            ${prograssHtml}
            

            <div class="study-record">
               <table class="table table-bordered table-striped table-hover table-condensed">
                   ${tr}
               </table>
            </div>
            <div class="comments">
                <img src="reply.png" class="reply-icon"> ${commentNum}
            </div>
            <div class="comments-zone">
                <div class="edit-input" data-user="${s}">
                    <span class="comments-span">${user}</span> <textarea></textarea><button class="btn btn-common btn-new comment-submit">发布</button>
                </div>
                <div class="comments-content">
                    ${comment}
                </div>
            </div>
        </article>`;
    tr = `
        <tr class="success">
            <th>时间段</th>
            <th>时长</th>
            <th>内容/备注</th>
        </tr>`;
    prograssHtml = ``
  }
  $('.main').empty();
  appendHtml(e('.main'), html);

  //
  commentDivHide();
  // 算出谁是龙王
  whoIsDragonKing(dragonKingObj);
  // 节点被重置了
  setTimeout(()=> bindOtherPersonalPage(), 200)
};

const commentDivHide = () => {
  if (window.initToggle && es('.comments-zone')) {
    for (const element of es('.comments-zone')) {
      $(element).toggle();
    }
    window.initToggle = false;
  }
};

const whoIsDragonKing = (dragonKingObj) => {
  let dragonKing = '';
  let num = -1;
  for (let [key, value] of Object.entries(dragonKingObj)) {
    if (value > num) {
      num = value;
      dragonKing = '.' + key;
    }
  }
  if (dragonKing) {
    $(dragonKing)
      .append(`<img src="dragon-king.png" style="width: 20px;height: 24.5px;margin-left: 5px;display: inline-block;
    padding-bottom: 6px;margin-bottom: 2px;">`);
  }
};

const addOnlineUser = (onlineUserList) => {
  let html = '';
  for (const user of onlineUserList) {
    html += `<div class="online-user">
                    <span class="user-circle"></span>
                    <a class="personal-page">${user}</a>
                </div>`;
  }

  $('.online').empty();
  appendHtml(e('.online'), html);
};

const getNowHourAndMinute = () => {
  return moment().format('HH:mm');
};

const getDuration = () => {
  let endTime = getTime();
  endTimeList = endTime.slice(11, 16).split(':');

  let [endHour, endMinute] = endTimeList;
  let [startHour, startMinute] = window.startTime.slice(11, 16).split(':');
  let hour = Number(endHour) - Number(startHour);

  // 23:00  -  00:20 这种情况
  if (startHour[0] === '2' && endHour[0] === '0') {
    hour = Number(endHour[1]) + 24 - Number(startHour);
  }

  let minutes = hour * 60;
  minutes += Number(endMinute) - Number(startMinute);
  hour = Number((minutes / 60).toFixed(2));
  return [hour, minutes];
};

// 直接复制上面的稍作修改
const getDuration2 = (start, end) => {
  let [endHour, endMinute] = end.split(':');
  let [startHour, startMinute] = start.split(':');

  let hour = Number(endHour) - Number(startHour);

  // 23:00  -  00:20 这种情况
  if (startHour[0] === '2' && endHour[0] === '0') {
    hour = Number(endHour[1]) + 24 - Number(startHour);
  }

  let minutes = hour * 60;
  minutes += Number(endMinute) - Number(startMinute);
  hour = Number((minutes / 60).toFixed(2));
  return [hour, minutes];
};

const getSegmentation = () => {
  let endHourAndMinute = getNowHourAndMinute();
  return window.startHourAndMinute + ' - ' + endHourAndMinute;
};

const getTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

const noStudyContent = (studyContent) => {
  if (studyContent.length === 0) {
    swal({
      title: '请输入学习内容或备注哦',
      text: '2秒后自动关闭',
      timer: 2000,
    }).then(
      function () {},
      function () {}
    );
    return true;
  }
  return false;
};

// 计时器的函数拿的网上的，先用着
let hour, minute, second; //时 分 秒
hour = minute = second = 0; //初始化
let millisecond = 0; //毫秒

let countIndex = 1; // 倒计时任务执行次数
let timeout = 250; // 触发倒计时任务的时间间隙

// 开始计时
const start = () => {
  window.stopInterval = false;
  window.getStartTime = new Date().getTime();
  startCountdown(timeout);
};

function startCountdown(interval) {
  if (window.stopInterval) {
    e('.timer').innerHTML = '';
    millisecond = hour = minute = second = 0;
    return;
  }
  setTimeout(() => {
    const endTime = new Date().getTime();
    // 偏差值
    let deviation = endTime - (window.getStartTime + countIndex * timeout);
    if (deviation < 0) {
      deviation = 0;
    }
    countIndex++;

    millisecond = millisecond + 250;
    if (millisecond >= 1000) {
      millisecond = 0;
      second = second + 1;
    }
    if (second >= 60) {
      second = 0;
      minute = minute + 1;
    }

    if (minute >= 60) {
      minute = 0;
      hour = hour + 1;
    }
    let arr = [hour, minute, second];
    arr = arr.map((val) => getZero(val));
    e('.timer').innerHTML = arr[0] + '时' + arr[1] + '分' + arr[2] + '秒';

    // 下一次倒计时
    startCountdown(timeout - deviation);
  }, interval);
}
