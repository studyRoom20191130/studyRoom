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

const getPersonalStudyData = (num) => {
  let user = getLocalStorage('personal').split('-')[0].trim();
  e('#user-name').innerHTML = user;
  let data = {
    user,
    num
  };

  ajax(data, '/getPersonalStudyData', (res) => {
    generateTimeline(res);
    // 生成节点之后再绑定事件
    bindLoadMore()
    showTotalHour(res);
  });
};

const showTotalHour = (res) => {
  // expect {
  //   axe: 17.2;
  //   tf: 13;

  let obj = res[0].totalHourObj
  log('obj', obj)
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
  // 如果返回的是全部数据
  log('res', res)
  if (array[0].responseAllData) {
    window.responseAllData = true
    $('.timeline-container').empty()
  }
  array.forEach((e) => {
    let t = timelineTemplate(e);
    html += t;
  });

  let last = `
        <div class="show-more">
            <a>往后加载30天</a>
            <a>加载全部</a>
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

const bindLoadMore = () => {
  if (window.responseAllData && window.num != 30) {
    swal({
      title: '已加载全部数据',
      text: '2秒后自动关闭',
      timer: 2000,
    }).then(
        function () {},
        function () {}
    );
  }
  bindEvent(e('.show-more'), 'click', (event) => {
    let a = event.target.innerHTML
    if (a !== '往后加载30天' && a !== '加载全部') {
      return
    }
    if (a === '往后加载30天') {
      window.num += 30
    }
    if (a === '加载全部') {
      window.num = 'all'
    }
  //  清空数据并 发请求
  //  把最底部的节点删除
  //  拼接传过来的30条数据
  //  加上底部节点，并绑定事件
    $(".show-more").remove();

    getPersonalStudyData(window.num)
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
  if (window.disabledSignature) {
    setTimeout(()=> window.disabledSignature = false, 2000)
    return
  }
  let signature = div.textContent;
  if (signature.trim()) {
    // setLocalStorage('signature', signature);
    let user = getLocalStorage('userInfo').split('-')[0];
    let data = {
      signature,
      user,
    };
    ajax(data, '/saveSignature');
  } else {
    div.textContent = '点击编辑签名，按回车确认';
  }
  window.disabledSignature = true
};


const __main = () => {
  window.disabledSignature = false
  window.num = 30
  window.responseAllData = false
  getPersonalStudyData();
  datePicker();
  bindEvents();
};

__main();
