const timeTemplate = (array) => {
  let learns = array;

  let r = '';
  learns.forEach((l) => {
    let expectation = '';
    if (l.expectation) {
      expectation = l.expectation + ' min';
    }
    let t = `
        <tr>
            <td class="td-start-end">
                <span>${l.segmentation}</span>
            </td>
            <td class="td-time">${l.minuteDuration} min</td>
            <td class="td-time">${expectation}</td>
            <td class="td-content">${l.studyContent}</td>
            <td class="td-others">
                <span>修改</span>
                <span>删除</span>
            </td>
        </tr>
        `;
    r += t;
  });
  return r;
};

const timelineTemplate = (object) => {
  let o = object;
  let t = '';
  if (o.table.length > 0) {
    //计算总当天总学习时间
    let totalMinitue = 0;
    let totalHour = 0;
    for (const obj of o.table) {
      totalMinitue += obj.minuteDuration;
      totalHour += obj.hourDuration;
    }
    totalHour = totalHour.toFixed(1);
    let all = timeTemplate(o.table);
    t = `
            <div class="timeline-item" date-is='${o.today}&nbsp;&nbsp;&nbsp;&nbsp;当天总共学习：${totalMinitue} min (${totalHour} h)'>
                <div class="study-record">
                    <table class="table table-bordered">
                        <tr class="head-tr">
                            <th>时间段</th>
                            <th>时长</th>
                            <th>预期</th>
                            <th>内容</th>
                            <th>操作</th>
                        </tr>
                        ${all}
                    </table>
                </div>

                <div class="message-bord">
                    <span class="">留言板</span>
                </div>


            </div>
        `;
  } else {
    t = `
            <div class="timeline-item" date-is='${o.date}&nbsp;&nbsp;&nbsp;&nbsp;${o.blessing}'>
                <div class="message-bord">
                    <span class="">留言板</span>
                </div>
            </div>
        `;
  }

  return t;
};

const getPersonalStudyData = () => {
  let user = getLocalStorage('personal').split('-')[0].trim();
  e('#user-name').innerHTML = user;
  let data = {
    user,
  };

  ajax(data, '/getPersonalStudyData', (res) => {
    generateTimeline(res);
    showTotalHour(res);
  });
};

const showTotalHour = (res) => {
  // expect {
  //   axe: 17.2;
  //   tf: 13;

  let obj = {};
  for (const record of res) {
    let table = record.table;
    for (const signalRecord of table) {
      let studyContent = signalRecord.studyContent;
      if (studyContent.includes('-')) {
        let index = studyContent.indexOf('-');
        let key = studyContent.slice(0, index).trim();
        if (key in obj) {
          obj[key] += signalRecord.hourDuration;
        } else {
          obj[key] = signalRecord.hourDuration;
        }
      }
    }
  }

  let html = `<br>
  <strong>加入自习室至今</strong>
  <br>`;

  let data = [];
  for (const key in obj) {
    const totalHour = Math.round(obj[key]);

    if (totalHour == 0) {
      continue;
    }

    let o = {
      name: key,
      value: totalHour,
    };
    data.push(o);

    html += `<div style="line-height: 30px;">
        <span class="">${key} - </span><span class="">共计 ${totalHour} 小时</span>
    </div>`;
  }
  html += `<div id="ect" style="width: 300px;height:200px;"></div>`;
  let leftDiv = e('.left');
  appendHtml(leftDiv, html);

  log('data', data);
  // ect
  let myChart = echarts.init(document.getElementById('ect'));
  option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    // legend: {
    //   orient: 'vertical',
    //   left: 10,
    //   data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
    // },
    series: [
      {
        name: '投入时长',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'left',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '30',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data,
      },
    ],
  };

  myChart.setOption(option);
};

const generateTimeline = (res) => {
  let array = res;
  let html = '';
  array.forEach((e) => {
    let t = timelineTemplate(e);
    html += t;
  });
  let last = `
        <div class="show-more">
            <a href="#">显示更多</a>
        </div>
    `;
  // 获取个性签名
  e('#user-sign').innerHTML = '点击编辑签名，按回车确认';
  if (res[0]) {
    e('#user-sign').innerHTML = res[0].signature || '点击编辑签名，按回车确认';
  }

  html = html + last;
  let container = e('.timeline-container');
  appendHtml(container, html);
};

const datePicker = () => {
  $('#datepicker').datepicker({
    onSelect: function (formattedDate, date, inst) {
      log('拿到日期', formattedDate, typeof formattedDate);
    },
  });
};

const bindWeekTodo = () => {
  bindEvent(e('#personal-page'), 'click', (event) => {
    swal({
      title: '展示每周计划，待开发',
      text: '2秒后自动关闭',
      timer: 2000,
    }).then(
      function () {},
      function () {}
    );
  });
};

const bindEvents = () => {
  bindWeekTodo();
  bindSignatureEvent();
};

const bindSignatureEvent = () => {
  let div = e('#user-sign');
  div.addEventListener('click', (event) => {
    div.contentEditable = true;
    div.focus();
    // 点击全选
    let range = document.createRange();
    range.selectNodeContents(div);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
  div.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      div.contentEditable = false;
      saveSignature(div);
    }
  });
  div.addEventListener('blur', (event) => {
    saveSignature(div);
  });
};

const saveSignature = (div) => {
  let signature = div.textContent;
  if (signature.trim()) {
    setLocalStorage('signature', signature);
  } else {
    div.textContent = '点击编辑签名，按回车确认';
  }
};

const __main = () => {
  getPersonalStudyData();
  datePicker();
  bindEvents();
};

__main();
