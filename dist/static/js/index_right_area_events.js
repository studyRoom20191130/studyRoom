// 页面右侧制定计划逻辑部分
const todoInit = () => {
    getGeneralTodo()
    shouldShowTodo()
    getTodoList()
}

const shouldShowTodo = () => {
    // 如果有计划，直接展示 totoList
    // 如果没有计划，显示制定计划按钮
    let todoList = ['daily', 'weekly']
    for (const type of todoList) {
        let storageKey = type + 'TodoList'
        let todoList = getLocalStorage(storageKey) || []
        let hasTodoList = todoList.length !== 0
        let word = type === 'daily' ? '今日' : '年度'
        let divClassName = `.make-${type}-plan`
        let btn = `#${type}-btn`
        if (hasTodoList) {
            $(btn).text(`收起${word}计划`);
            $(divClassName).toggle();
        } else {
            $(btn).text(`制定${word}计划`);
        }
    }
}

const getTodoList = () => {
    let todoList = ['daily', 'weekly']
    for (const type of todoList) {
        let parentElement = '#ol-' + type
        let storageKey = type + 'TodoList'
        let todoList = getLocalStorage(storageKey) || []
        addHtmlToOlElement(todoList, parentElement)
    }
}

const bindRightDivEvents = () => {
    bindEvent(e('.right'), 'click', event => {
        let target = event.target
        btnEvents(target)
        if (target.classList.contains('general-todo-span')) {
            spanClickEvents(target)
        }
        if (target.classList.contains('doing')) {

            spanDoingClickEvents(target)
        }
    })
    bindAll('.general-todo-span', 'keydown', event => {
        spanKeydownEvents(event)
    })
    bindAll('.general-todo-span', 'blur', event => {
        spanBlurEvents(event.target)
    })

    bindAll('.general-todo-span', 'blur', event => {
        spanBlurEvents(event.target)
    })
}

const spanDoingClickEvents = (target) => {
    copyTOLeft(target)
    editSpan(target)
}

const editSpan = (target) => {
    target.contentEditable = true;
    target.focus()
    target.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            target.contentEditable = false;
            updateTodolist(target);
        }
    })
}

const updateTodolist = (target) => {
    let dailyTodoList = getLocalStorage('dailyTodoList') || []
    let newValue = target.innerHTML
    let index = Number(target.dataset.index)
    dailyTodoList[index] = newValue
    if (newValue.length === 0) {
        dailyTodoList.splice(index, 1)
    }
    setLocalStorage('dailyTodoList', dailyTodoList)
    let parentElement = '#ol-daily'
    addHtmlToOlElement(dailyTodoList, parentElement, true)
}

const copyTOLeft = (target) => {
    let t = target.innerHTML
    let index = t.indexOf('-');
    t = t.slice(0, index + 1) + ' '
    $("#textarea-study-content").val(t)
}

// 2020年2月19号回来看的感想：封装抽象尼玛啊，自己写的都完全看不懂了……
const btnEvents = (target) => {
    let contains = target.classList.contains.bind(target.classList)
    let map = {
        'btn-callback': toggleBtnCallback,
        'clear-data': clearBtnCallback,
        'done': doneBtnCallback,
    }
    for (let key in map) {
        if (contains(key)) {
            map[key](target)
        }
    }
}

// 首页导航栏的每周计划点击事件
// const bindWeekTodo = () => {
//     bindEvent(e('#personal-page'), 'click', event => {
//         swal({
//             title: '展示每周计划，待开发',
//             text: '2秒后自动关闭',
//             timer: 2000,
//         }).then(function () {}, function () {})
//     })
// }

const bindOtherPersonalPage = () =>{
    if (!e('.personal-page')) {
        return
    }
    bindAll('.personal-page', 'click', event => {
        let username = event.target.innerHTML
        if (username.includes('明日边缘')) {
            username = 'life - '
        }
        setLocalStorage('personal', username)
        window.location = "personal.html";
    })
}

const toggleBtnCallback = (target) => {
    let type = target.dataset.type
    let id = `#${type}-btn`
    let button = $(id)
    let t1 = '今日'
    let t2 = 'daily'
    if (id === '#weekly-btn') {
        t1 = '年度'
        t2 = 'weekly'
    }
    button.text() === `收起${t1}计划` ? button.text(`制定${t1}计划`) : button.text(`收起${t1}计划`)
    $(`.make-${t2}-plan`).toggle();
}

const doneBtnCallback = (target) => {
    const button = $(target)
    button.text() === '完成' ? button.text('取消') : button.text('完成')
    let li = closestTag(target, 'li')
    let span = li.querySelector('span')
    toggleClass(span, 'text-decoration')
}

const clearBtnCallback = (target) => {
    let type = target.dataset.type + 'TodoList'
    let element = type === 'weeklyTodoList' ? '#ol-weekly' : '#ol-daily'
    $(element).empty()
    localStorage.setItem(type, [])
}

// 输入框事件
const bindTodoInputEvent = () => {
    // 这里应该用 dataset 的
    let inputList = ['daily', 'weekly']
    for (let type of inputList) {
        let inputId = '#input-todo-' + type
        let input = $(inputId)
        $(input).keyup(function(){
            if(event.keyCode === 13){
                let val = input.val()
                let parentElementId = '#ol-' + type
                addHtmlToOlElement(val, parentElementId)
                let storageKey = type + 'TodoList'
                saveTodoListInStorage(val, storageKey)
                input.val('')

                // 添加到常用事项
                let spanNode = `<span class="general-todo-span weekly">${val}</span>`
                let div = e(`.${type}-general-todo`)
                div.insertAdjacentHTML('beforeend', spanNode)
                let keyName = type === 'weekly' ?  'generalWeeklyTodoList' : 'generalTodoList'
                let generalTodoList = getLocalStorage(keyName)
                if (!generalTodoList.includes(val)) {
                    generalTodoList.unshift(val)
                    setLocalStorage(keyName, generalTodoList)
                }
            }
        })
    }
}

const addHtmlToOlElement = (todoList, element, removeInnerHTml = false) => {
    if (removeInnerHTml) {
        e(element).innerHTML = ''
    }
    todoList = Array.isArray(todoList) ? todoList : [todoList]
    let olContent = $(element).innerHTML || ''
    let html = ''
    let index = 0
    for (val of todoList) {
        html += `${olContent}<li><span class="doing" data-index=${index}>${val}</span></li>`
        index++
    }
    appendHtml(e(element), html)
}

const saveTodoListInStorage = (val, list) => {
    let dailyTodoList = getLocalStorage(list) || []
    dailyTodoList.push(val)
    setLocalStorage(list, dailyTodoList)
}
