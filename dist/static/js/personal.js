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
  let leftDiv = e('.detail');
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

const renderUserInfo = (obj) => {
  // 获取个性签名
  let signature = '点击编辑签名，按回车确认'
  let src = ''
  if (obj) {
    signature = obj.signature || '点击编辑签名，按回车确认'
    src = obj.hero
  }
  let img = src ? `<img class="hero-img" id="user-info-hero" src="./img/hero/${src}" >`
      : `<img class="hero-img hide" id="user-info-hero" src="./img/hero/${src}" >`
  let html = `
      ${img}
      <span class="user-name" id="user-name">${user}</span>
      <span class="user-sign" id="user-sign">${signature}</span>
  `
  appendHtml(e('#user-info'), html)
  bindSignatureEvent()
  cancelHero()
}


const generateTimeline = (res) => {
  let array = res;
  let html = '';
  // 如果返回的是全部数据
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

  renderUserInfo(res[0])


  html = html + last;
  let container = e('.timeline-container');
  appendHtml(container, html);
};

// const datePicker = () => {
//   $('#datepicker').datepicker({
//     onSelect: function (formattedDate, date, inst) {
//     },
//   });
// };

const bindWeekTodo = () => {
  bindEvent(e('#personal-page'), 'click', (event) => {
    alertMsg('展示每周计划，待开发')
  });
};

const bindLoadMore = () => {
  if (window.responseAllData && window.num != 30) {
    alertMsg('已加载全部数据')
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


const bindSlideToggle= () => {
  let div = e('#slide-toggle');
  div.addEventListener('click', (event) => {
  //    点击的时候，增加一个
    let detail = e('.detail')
    let hero = e('.hero-pick')
    toggleClass(detail, 'animate-left')
    toggleClass(detail, 'tran')
    toggleClass(hero, 'animate-right')
    toggleClass(hero, 'tran')
    event.target.innerHTML = event.target.innerHTML === '选择英雄' ? '返回看板' : '选择英雄'
    let tip = e('#hero-tip')
    // event.target.innerHTML === '选择英雄' ? removeClass(tip, 'hide') : addClasstip, 'hide')
    toggleClass(tip, 'hide')
  //
  //   let left = e('.timeline-container')
  //   toggleClass(left, 'timeline-container2')
  });
}

const cancelHero = () => {
  if (notUserSelf()) {
    return
  }
  let s = e('#cancel-hero')
  s.addEventListener('click', (event) => {
    let img = e('#user-info-hero')
    if (img.classList.contains('hide')) {
      return
    }
    let data = {
      hero: '',
      user,
    }
    ajax(data, '/chooseHero', (r) => {
      addClass(img, 'hide')
    });
  });
}


const bigHeroImgToggle = (event) => {
  let target = event.target
  let parent = closestClass(target, 'hero-avatar-container')
  let b = parent.querySelector('.big-hero')
  toggleClass(b, 'hide')
}

const bindHeroMouseEvent = () => {
  let s = ('.small-hero')
  bindAll(s, 'mouseover', bigHeroImgToggle)
  bindAll(s, 'mouseout', bigHeroImgToggle)
}


const chooseHeroApi = (event) => {
  if (notUserSelf()) {
    return
  }
  let target = event.target
  let hero = target.dataset.hero
  
  let data = {
    hero,
    user,
  }
  ajax(data, '/chooseHero', (r) => {
    let img = e('#user-info-hero')
    img.src = `./img/hero/${hero}`
    if (img.classList.contains('hide')) {
        removeClass(img, 'hide')
    }
  });

}

const chooseHero = () => {
  let s = ('.small-hero')
  bindAll(s, 'click', chooseHeroApi)
}

const heroImgListHardCode = () => {
  const heroImgList = [
    'blhu.jpg',
    'baihu2.jpg',
    'blhu3.png',
    'ifmo.jpg',
    'burfui.jpg',
    'bynv.jpg',
    'dashu.jpg',
    'dibu.jpg',
    'ljmk.jpg',
    'nqtb.jpg',
    'sf.jpg',
    'sf2.jpg',
    'slark.jpg',
    'spe.jpg',
    'ta.jpg',
    'uvren.jpg',
    'aa.png',
    'bh.png',
    'carl.png',
    'honv.png',
    'spe2.png',
    'ta2.png',
    '/pkm/pkm6.jpg',
    '/pkm/pkm8.jpg',
    '/pkm/pkm7.png',
    '/pkm/pkm13.jpg',
    '/pkm/pkm9.png',
    '/pkm/pkm2.png',
    '/pkm/pkm3.png',
    '/pkm/pkm4.jpg',
    '/pkm/pkm10.png',
    '/pkm/pkm11.jpg',
    '/pkm/pkm12.jpg',
  ]
  return heroImgList
}

const renderHeroAvatar = () => {
  const heroImgList = heroImgListHardCode()
  let html = ''
  for (const hero of heroImgList) {
    html += `
    <div class="hero-avatar-container">
              <div class="hero-avatar pointer small-hero" >
                <img data-hero=${hero} src="./img/hero/${hero}" >
              </div>

              <div class="big-hero hide">
                <img src="./img/hero/${hero}"/>
              </div>
            </div>
    `
  }

  appendHtml(e('.hero-pick'), html)
  bindHeroMouseEvent()
  chooseHero()
}



const bindEvents = () => {
  bindWeekTodo();
  bindSlideToggle()
}

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

const notUserSelf = () => {
  let self = getLocalStorage('userInfo').split('-')[0].trim()
  return user !== self
}

const saveSignature = (div) => {
  if (notUserSelf()) {
      return
  }
  if (window.disabledSignature) {
    setTimeout(()=> window.disabledSignature = false, 2000)
    return
  }
  let signature = div.textContent;
  if (signature.trim()) {
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
  window.user = getLocalStorage('personal').split('-')[0].trim()
  getPersonalStudyData();
  // datePicker();
  bindEvents();
  renderHeroAvatar()
};

__main();
