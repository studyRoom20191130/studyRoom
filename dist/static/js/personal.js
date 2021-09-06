const timeTemplate = (array, hasExpectationTime) => {
  let learns = array;
  let summarys = []
  let r = '';
  let afternoonTr = true
  let nightTr = true

  for (const l of learns) {
    let c = l.studyContent
    if ((c.slice(0, 2) === '总结' && c[2] === ' ' && c[3] === '-')  || (c.slice(0, 2) === '总结' && c[2] === '-')) {
      summarys.push(c)
      continue
    }
    let expectation = '';
    if (l.expectation) {
      expectation = l.expectation + ' min';
    }
    let expectationTr = hasExpectationTime ? `<td class="td-hour">${expectation} </td>` : ''

    let time = Number(l.segmentation.slice(0, 2))
    if (time > 12 && afternoonTr) {
      r += emptyTr('下午', expectationTr)
      afternoonTr = false
    }

    if (time > 17 && nightTr) {
      r += emptyTr('晚上', expectationTr)
      nightTr = false
    }
    let bgColor = addBgColor(c)
    let t = `
        <tr style="background: ${bgColor}">
            <td class="td-time">
                <span>${l.segmentation}</span>
            </td>
            <td class="td-hour">${l.minuteDuration} min</td>
            ${expectationTr}
            <td class="td-width">${c}</td>
        </tr>
        `;
    r += t;
  }
  return [r, summarys]
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
    let hasExpectationTime = hasExpectation(o.table)
    let trHead = resetTr(hasExpectationTime)
    let today = o.today.replace('年', '-').replace('月', '-').replace('日', ' 日报')
    var [all, summarys]  = timeTemplate(o.table, hasExpectationTime)


    let itemHtml = generateItemHtml(o.table)
    t = `
        
            <div class="timeline-item" date-is='${today}&nbsp;&nbsp;&nbsp;&nbsp; 记录时长：${totalHour} h ${itemHtml}'>
                <div class="study-record">
                    <table class="table table-bordered">
                        ${trHead}
                        ${all}
                    </table>
                </div>
            </div>
        `;
  }
  
  t += summaryHtml(summarys)

  return t;
}




const summaryHtml = (summarys) => {
  let h = ``
  if (!summarys) {
    return h
  }
  let len = summarys.length
  if (len === 0) {
      return h
  }
  for (let i = 0; i < len; i++) {
    let summary = summarys[i].split('-')[1].trim()
    console.log("summary", summary)
    h += `<div class="summary-content">${i + 1}. ${summary}</div>`
  }

  return `<div class="summary">
    <div class="font-bold bottom-border">总结</div>
        ${h}
  </div>`
}

const getPersonalStudyData = () => {
  let data = {
    user,
    num: window.num,
    year: window.tableYear,
  };

  ajax(data, '/getPersonalStudyData', (res) => {
    generateTimeline(res);
    // 生成节点之后再绑定事件
    bindLoadMore()
    window.totalHourObj = res[0].totalHourObj
    if (window.init) {
      showTotalHour()
      window.init = false
    }

  });
}

const getTableSpan = () => {
  let years = [2021, 2020]
  let html = ``
  for (const y of years) {
    if (window.tableYear == y) {
      html += `<span class="active-year year-span">${y}</span>`
    } else {
      html += `<span class="year-span">${y}</span>`
    }
  }
  return html
}

const getSpan = () => {
  let years = [2021, 2020, '全部']
  let html = ``
  for (const y of years) {
    if (window.year == y) {
      html += `<span class="active-year year-span">${y}</span>`
    } else {
      html += `<span class="year-span">${y}</span>`
    }
  }
  return html
}

const concatObj = () => {
  let o1 = window.totalHourObj['2020']
  let o2 = window.totalHourObj['2021']
  let result = {}
  for (const o1Key in o1) {
    if (o1Key in o2) {
      result[o1Key] = o1[o1Key] + o2[o1Key]
    } else {
      result[o1Key] = o1[o1Key]
    }
  }
  for (const o2Key in o2) {
    if (!(o2Key in result)) {
      result[o2Key] = o1[o2Key]
    }
  }
  return result
}

const getTotalHour = (obj) => {
  let totalHour = 0
  for (const objKey in obj) {
    if (obj[objKey]) {
      totalHour += obj[objKey]
    }
  }
  return totalHour.toFixed(0)
}

const replaceKeyValue = (obj) => {
  let o = {}
  for (const objKey in obj) {
    let k = obj[objKey].toFixed(0)
    o[k] = objKey
  }
  return o
}

const sortObj = (obj) => {
  obj = replaceKeyValue(obj)
  let arr=[]
  for(var key in obj){
    arr.push(parseInt(key))
  }
  arr = arr.sort(function(a, b){return b - a})
  return [arr, obj]
}

const showTotalHour = (year=new Date().getFullYear()) => {
  let span = getSpan()
  let obj = window.totalHourObj[year]

  if (window.year == '全部') {
    obj = concatObj()
  }

  let totalHour = getTotalHour(obj)

  let html = `<br>
      <div class="years">
        ${span}
      </div>
      <div class="totalHour">
        总投入：${totalHour} 小时
      </div>
 `

  let data = []
  let [sortArr, sortedObj]= sortObj(obj)
  for (const totalHour of sortArr) {


    if (totalHour == 0 || !totalHour) {
      continue;
    }

    let o = {
      name: sortedObj[totalHour],
      value: totalHour,
    };
    data.push(o);

    html += `<div style="line-height: 30px;">
        <span class="">${sortedObj[totalHour]} - </span><span class="">${totalHour} 小时</span>
    </div>`;
  }
  html += `<div id="ect" style="width: 300px;height:200px;"></div>`;
  let leftDiv = e('.detail');
  leftDiv.innerHTML = ''
  appendHtml(leftDiv, html);
  bindYear()
  // ect
  let myChart = echarts.init(document.getElementById('ect'));
  option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
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


const bindYear = () => {
  bindEvent(e('.years'), 'click', (event) => {
    let target = event.target
    let contains = target.classList.contains.bind(target.classList);
    if (contains('year-span')) {
      let y = target.innerHTML
      if (window.year === y) {
        return
      }
      window.year = y
      showTotalHour(y)
    }
  })
}

const bindTableYear = () => {
  bindEvent(e('.table-years'), 'click', (event) => {
    let target = event.target
    let contains = target.classList.contains.bind(target.classList);
    if (contains('year-span')) {
      let y = target.innerHTML
      if (window.tableYear === y) {
        return
      }
      window.tableYear = y
      window.num = 30
      // 发接口请求
      getPersonalStudyData()
    }
  })
}



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
  e('#user-info').innerHTML = ''
  appendHtml(e('#user-info'), html)
  bindSignatureEvent()
  cancelHero()
}


const generateTimeline = (res) => {
  if (res.length == 0) {
    return
  }
  let array = res
  let span = getTableSpan()
  let html = `<div class="years table-years">
        ${span}
      </div>`
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
  let container = e('.timeline-container')
  container.innerHTML = ''
  appendHtml(container, html)
  bindTableYear()
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
    'dmdm.jpg',
    'LD.jpg',
    'clement.jpg',
    'momo.jpg',
    'muuj.jpg',
    'Yan.png',
    'tyir.jpg',
    'vovo.png',
    'life.jpg',
    'zelda.jpg',
      'sans.jpg',
      'shui.jpg',
    'yoking.png',
    'magw.jpg',
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
  window.year = new Date().getFullYear()
  window.tableYear = new Date().getFullYear()
  window.user = getLocalStorage('personal').split('-')[0].trim()
  window.init = true
  getPersonalStudyData()
  // datePicker();
  bindEvents();
  renderHeroAvatar()
};

__main();
