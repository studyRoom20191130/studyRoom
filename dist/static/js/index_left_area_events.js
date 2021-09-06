// 首页左边区域（开始学习、结束学习、补录时间）的功能逻辑

window.disabledSendAdditionalRecord = false;
window.firstEnter = true;


const initEditor = () => {
    let myTextarea = document.getElementById("editor")
    let editor = CodeMirror.fromTextArea(myTextarea, {
        lineNumbers: true,	// 行号
        // mode:'text/javascript',         // 语言
        // theme: "base16-light",	// 主题
        theme: "duotone-light",	// 主题
        indentUnit: 4,      // 缩进
        cursorHeight: 0.85, // 光标高度
    })
    // 设置代码框的长宽
    editor.setSize('100%', '200px')

    editor.on("blur", function () {
        setLocalStorage('todoDetail', editor.getValue())

    });

    // 初始化代码内容
    let todoDetail = getLocalStorage('todoDetail')

    if (todoDetail) {
        editor.setValue(todoDetail)
    }
    if (!todoDetail) {
        let msg =
            `F2切换，这里可以添加待做明细，例如：
    
axe 
  8.3
  10
  
fep 
  作业
  
工作
  xxx
  yyy`
        editor.setValue(msg)
    }


    return editor
}

const bindLeftDivBtnEvent = () => {
    bindEvent(e('.left'), 'click', (event) => {
        let target = event.target;
        let contains = target.classList.contains.bind(target.classList);
        if (contains('btn')) {
            let button = target.dataset.button;
            if (button === 'start') {
                startBtnHandle();
            } else if (button === 'end') {
                endBtnHandle()
            } else if (button === 'additionalRecord') {
                additionalRecord();
            }
        }
    });
    bindTipEvent();
    bindAdditionalEndInput();
    bindTextareaEvent()
    bindEscEvent()
    bindNavToggle()
}

const bindNavToggle = () => {
    bindEvent(e('.nav-toggle-container'), 'click', (event) => {
        toggleClass(e('.mode-toggle-circle'), 'mode-toggle-close')
        toggleClass(e('.left-members'), 'transparent')
        toggleClass(e('.right-members'), 'transparent')

    });
}

const bindEscEvent = () => {
    window.addEventListener('keydown', (event) => {
        if (event.code === 'Escape') {
            endBtnHandle()
        }
    })
}


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
            alertMsg('输入的补录时间格式不对')
            return true
        }
    }
}

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
        let invalid = checkAdditionalRecordValue(val)
        if (invalid) {
            return
        }
    }

    if (s && e) {
        // 计算并转换时间数据
        window.initToggle = true;

        sendRecord(s, e);
        $('#additional-start').val('');
        $('#additional-end').val('');
        $('.other-time').toggle();
    } else {
        alertMsg('请填写开始和结束的时间')
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

const sendRecord = (start, end) => {
    let studyContent = $('#textarea-study-content').val();
    studyContent = studyContent.replaceAll('\n', '<br>')
    let user = getLocalStorage('userInfo').split('-')[0]
    let signature = getLocalStorage('signature') || '';
    let expectation = $('#expectation').val();

    let studyContentRecord = {
        user,
        signature,
        studyContent, // 学习内容/备注
        expectation,
        s: start,
        e: end,
    }


    ajax(studyContentRecord, '/endCountTime', (res) => {
        // 获取数据，更新页面
        // console.log("res", res)
        if (res.errMsg) {
            alertMsg(res.errMsg)
            return
        }
        let studyDataList = res || []
        addHtmlToMainDiv(studyDataList)
        renderNavHero(studyDataList)
        renderOnlineUser(studyDataList)
        alertTip(studyDataList)
        updateYearlyProgass(studyDataList)
        window.stopInterval = true;
    }, 'stopInterval');
};

const updateYearlyProgass = (studyDataList) => {
    let s = studyDataList[0]
    let yearlyObj = s.yearlyObj

    let prograssHtml = generatePrograssHtml(yearlyObj, s.user, 'weekly')
    e('.yearly-prograss-container').innerHTML = ''
    appendHtml(e('.yearly-prograss-container'), prograssHtml);
}

// 开始按钮防止重复点击
window.forbidStartBtnClick = false;
window.forbidEndBtnClick = true;
window.initToggle = true;
window.imgList = []

const startBtnHandle = () => {
    // 点击开始，开始计时
    if (window.forbidStartBtnClick) {
        return;
    }
    window.initToggle = true
    window.forbidStartBtnClick = true
    window.forbidEndBtnClick = false
    window.stopInterval = false
    countInit()
    startCountdown(0)

    // 2021-3-26 改成往后端发送接口
    ajax({user: getLocalStorage('userInfo').split('-')[0]}, '/startCountTime');
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
        alertMsg('先要开始，才能结束')
        return
    }
    window.forbidEndBtnClick = true;
    let studyContent = e('#textarea-study-content').value;
    if (noStudyContent(studyContent)) {
        return;
    }
    window.forbidStartBtnClick = false
    window.firstEnter = true
    sendRecord()
};

const alertTip = (list) => {
    let current = list[0].table.slice(-1)
    let minuteDuration = current[0].minuteDuration
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
    let commentNum = commentList
        ? `评论 (${commentList.length})`
        : '评论';
    return [comment, commentNum];
};

// 2021-7-27
const isShow = (firstObj) => {

    let afternoonStatus = true
    let nightStatus = true

    if (!firstObj) {
        return [false, false]
    }

    let time = Number(firstObj.segmentation.slice(0, 2))
    // 如果第一条已经是下午，那就不要展示
    if (time > 12) {
        afternoonStatus = false
    }
    // 如果第一条已经是晚上，那就不要展示
    if (time > 17) {
        nightStatus = false
    }
    return [afternoonStatus, nightStatus]
}

// 拼接表格数据部分的 html 并计算 分钟 和 小时
const getTrHtml = (list) => {

    let hasExpectationTime = hasExpectation(list)
    let tr = resetTr(hasExpectationTime)
    let totalHour = 0;
    let totalMinitue = 0;
    let afternoonTr = true
    let nightTr = true
    let [afternoonStatus, nightStatus] = isShow(list[0])

    for (const obj of list) {
        let expectation = '';
        if (obj.expectation) {
            expectation = obj.expectation + ' min';
        }
        let expectationTr = hasExpectationTime ? `<td class="td-hour">${expectation} </td>` : ''

        let time = Number(obj.segmentation.slice(0, 2))

        if (time > 12 && afternoonTr && afternoonStatus) {
            tr += emptyTr('下午', expectationTr)
            afternoonTr = false
        }


        if (time > 17 && nightTr && nightStatus) {
            tr += emptyTr('晚上', expectationTr)
            nightTr = false
        }

        let bgColor = addBgColor(obj.studyContent)

        tr += `<tr style="background: ${bgColor}">
                    <td class="td-time">${obj.segmentation}</td>
                    <td class="td-hour">${obj.minuteDuration} min</td>
                    ${expectationTr}
                    <td class="td-width">${obj.studyContent}</td>
                </tr>`;
        if (obj.studyContent.includes('浪费时间')) {
            continue
        }
        totalHour += obj.hourDuration;
        totalMinitue += obj.minuteDuration;
    }
    totalHour = totalHour.toFixed(1)
    return [tr, totalHour, totalMinitue]
};


const generatePrograssHtml = (prograssObj, user, type = 'daily') => {
    if (user !== getLocalStorage('userInfo').split('-')[0]) {
        return ''
    }
    let prograss = ``
    // 加载进度条的逻辑
    let dailyTodoList = getLocalStorage(`${type}TodoList`) || []
    let colorlist = ['pg-green', 'pg-blue', 'pg-yellow', 'pg-red', 'pg-lightgray']
    let colorIndex = 0
    for (const todo of dailyTodoList) {
        if (todo.includes('-')) {
            let index = todo.indexOf('-');
            let key = todo.slice(0, index).trim();
            let goalTime = todo.slice(index + 1).trim()
            goalTime = Number(goalTime)
            for (const k in prograssObj) {
                if (k === key) {
                    //  算百分比
                    let currentPrograss = prograssObj[k]
                    let [persent, styleWidth] = calPersent(currentPrograss, goalTime)
                    prograss += `
            <div class="progress">
                <div class="progress-bar progress-bar-success ${colorlist[colorIndex]}" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: ${styleWidth};">
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

const processName = (user) => {
    let s = user
    let temp_s = user
    if (s == 'H.K') {
        temp_s = 'H-K'
    }
    if (s == 'life') {
        temp_s = '明日边缘'
    }
    if (s.includes('Clement') ) {
        temp_s = '竹林 | Clement'
    }

    return temp_s
}

const makeObj = (studyDataList) => {
    // 增加龙王功能
    let dragonKingObj = {}
    // 重写在线功能
    let onlineObj = {}
    for (const studyData of studyDataList) {
        let [tr, totalHour, totalMinitue] = getTrHtml(studyData.table);
        let username = processName(studyData.user)
        dragonKingObj[username] = totalMinitue;
        if (totalHour in onlineObj) {
            // let key = Number(totalHour) + 0.11
            let key = totalHour + '_' + username
            onlineObj[key] = username
        } else {
            onlineObj[totalHour] = username
        }

    }
    return {dragonKingObj, onlineObj}
}


const makeSvgAndPrograssObj = (user, username, studyData) => {
    let svg = ''
    let prograssObj = {}
    if (username === '明日边缘') {
        username = 'life'
    }
    if (user === username) {
        prograssObj = getprograssObj(studyData.table)
        svg = imgSvg()
    }
    return [svg, prograssObj]
}

const generateWeaponImgs = (weapon) => {
    if (!weapon) {
        return ''
    }
    let weaponList = weapon.split('-')
    let html = ``
    for (const weapon of weaponList) {
        if (weapon) {
            html += `<img src="./img/weapon/${weapon}">`
        }
    }

    return html
}

const processWeaponData = (studyData, user, totalMinitue) => {
    let weapon = studyData.weapon
    let weaponImgs = generateWeaponImgs(weapon)
    if (studyData.user === user) {
        window.totalMinitue = totalMinitue
        window.weapon = weapon || ''
    }
    return weaponImgs
}



// 生成用户的 a 标签
const generateATag = (studyData, username, totalMinitue, totalHour) => {
    let src = studyData.hero
    let img = src ? `<img class="hero-img-index" src="./img/hero/${src}" >` : ''
    let a = `${img}<a class="personal-page">${username} - ${totalMinitue} min / ${totalHour} h `
    let itemHtml = generateItemHtml(studyData.table)
    a += itemHtml + '</a>'
    return a
}



// 每一个用户的 表格html
const userTableHtml = (studyData) => {
    let h = ''
    let signature = studyData.signature || '';

    if (signature.includes('点击编辑')) {
        signature = ''
    }
    let [tr, totalHour, totalMinitue] = getTrHtml(studyData.table);

    let username = processName(studyData.user)
    let user = getLocalStorage('userInfo').split('-')[0]
    let weaponImgs = processWeaponData(studyData, user, totalMinitue)
    let [comment, commentNum] = getCommentHtml(studyData.commentArray, username);
    let [svg, prograssObj] = makeSvgAndPrograssObj(user, username, studyData)
    let prograssHtml = generatePrograssHtml(prograssObj, studyData.user) || ''


    let a = generateATag(studyData, username, totalMinitue, totalHour)
    h = `
        <article class="main-article">
            <div class="user-name title-weight ${username}">
                ${a} ${svg}
            </div>
            <div id="${studyData.user}-signature-weapon" class="weapons" style="color: #409eff;margin: 5px 0;">${signature}${weaponImgs}</div>
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
                <div class="edit-input" data-user="${username}">
                    <span class="comments-span">${user}</span> <textarea></textarea><button class="btn btn-common btn-new comment-submit">发布</button>
                </div>
                <div class="comments-content">
                    ${comment}
                </div>
            </div>
        </article>`
    return h
}

const addHtmlToMainDiv = (studyDataList) => {
    let html = ''
    for (const studyData of studyDataList) {
        let userTable = userTableHtml(studyData)
        html += userTable
    }
    $('.main').empty();
    appendHtml(e('.main'), html);

    //
    commentDivHide();
    // 算出谁是龙王
    whoIsDragonKing(studyDataList);

    // 节点被重置了
    setTimeout(() => bindOtherPersonalPage(), 200)
    // 绑定生成日报事件
    bindEventDailyReport()
    bindEventEditAndDelete()
}

const updateContentAjax = (newContent, oldContent) => {
    let user = getLocalStorage('userInfo').split('-')[0]
    let data = {
        oldContent,
        newContent,
        user,
    }
    ajax(data, '/updateContent', (res) => {
        // console.log("res", res)
    })
}

const updateContent = (target, oldContent) => {
    let content = target.innerHTML
    if (content == oldContent) {
        return
    }
    if (content == '') {
        //    询问是否删除
        swal({
            text: "确定删除本条记录？",
            showCancelButton: true,
        }).then((value) => {
            if (value.value) {
                //    delete
                updateContentAjax(content, oldContent)
                let parent = $(target).parent()[0]
                parent.remove()
            }
        })
        return
    }
    updateContentAjax(content, oldContent)
}
const editTr = (target) => {
    target.contentEditable = true
    target.focus()
    let oldContent = target.innerHTML
    // target.addEventListener('keydown', (event) => {
    //     if (event.key === 'Enter') {
    //         editSpanEventCallback(target, event)
    //     }
    // })
    target.addEventListener('blur', (event) => {
        updateContent(target, oldContent)
    })
}

const bindEventEditAndDelete = () => {

    bindAll('.td-width', 'click', (event) => {
        // 如果不是用户自己的，就返回
        let target = event.target
        let parent = closest(target, '.main-article')
        let userId = parent.children[1].id
        let user = getLocalStorage('userInfo').split('-')[0]
        if (!userId.includes(user)) {
            return
        }
        editTr(target)
    })
}

const commentDivHide = () => {
    if (window.initToggle && es('.comments-zone')) {
        for (const element of es('.comments-zone')) {
            $(element).toggle();
        }
        window.initToggle = false;
    }
};

const whoIsDragonKing = (studyDataList) => {
    let {dragonKingObj} = makeObj(studyDataList)
    let dragonKing = '';
    let num = -1;
    for (let [key, value] of Object.entries(dragonKingObj)) {
        if (value > num) {
            num = value;
            dragonKing = '.' + key;
        }
    }
    if (dragonKing.includes('Clement')) {
        return
    }
    if (dragonKing) {
        $(dragonKing)
            .append(`<img src="dragon-king.png" style="width: 20px;height: 24.5px;margin-left: 5px;display: inline-block;
    padding-bottom: 6px;margin-bottom: 2px;">`);
    }
};

const sortOnlineObj = (onlineObj) => {
    let arr = [];
    for (var key in onlineObj) {
        arr.push(key)
    }
    arr = arr.sort().reverse()
    return arr
}

const onlineHtml = (arr, onlineObj) => {
    let html = '';
    for (const index in arr) {
        let img = ``
        if (index == 0) {
            img = `<img src="dragon-king.png" style="width: 20px;height: 24.5px;margin-left: 5px;display: inline-block;
        padding-bottom: 6px;">`
        }
        let key = arr[index]
        let username = onlineObj[key]
        if (key.includes('_')) {
            key = key.split('_')[0]
        }
        html += `<div class="online-user">
                    <span class="user-circle"></span>
                    <a class="personal-page">${username} - ${key} h${img}</a> 
                </div>`;
    }
    return html
}

const renderOnlineUser = (studyDataList) => {
    let {onlineObj} = makeObj(studyDataList)
    let arr = sortOnlineObj(onlineObj)
    let html = onlineHtml(arr, onlineObj)
    $('.online').empty();
    appendHtml(e('.online'), html);
};

const noStudyContent = (studyContent) => {
    if (studyContent.length === 0) {
        alertMsg('请输入学习内容或备注哦')
        return true;
    }
    return false;
};

// 计时器的函数拿的网上的，先用着


const countInit = () => {
    window.hour = 0
    window.minute = 0
    window.second = -1
}

function startCountdown(interval = 1000) {
    if (window.stopInterval) {
        e('.timer').innerHTML = '';
        return;
    }
    setTimeout(() => {
        second++
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
        startCountdown()
    }, interval);
}
