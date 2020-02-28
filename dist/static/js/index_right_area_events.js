// 页面右侧制定计划逻辑部分
const todoInit = () => {
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
        let word = type === 'daily' ? '今日' : '本周'
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
        log('storageKey', storageKey)
        log('todoList', todoList)
        addHtmlToOlElement(todoList, parentElement)
    }
}

const bindRightDivEvents = () => {
    bindEvent(e('.right'), 'click', event => {
        let target = event.target
        btnEvents(target)
        spanClickEvents(target)
    })
}

// 常用事项点击事件
const spanClickEvents = (target) => {
    let div = $(target).parent()[0]
    let parentElementId = div.dataset.type
    let list = div.dataset.list
    if (parentElementId === '#ol-daily' || parentElementId === '#ol-weekly') {
        const val = target.innerHTML
        addHtmlToOlElement(val, parentElementId)
        saveTodoListInStorage(val, list)
    }
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

// 首页导航栏的个人主页点击事件
const bindWeekTodo = () => {
    bindEvent(e('#personal-page'), 'click', event => {
        swal({
            title: '展示每周计划，待开发',
            text: '2秒后自动关闭',
            timer: 2000,
        }).then(function () {}, function () {})
    })
}

const bindOtherPersonalPage = () =>{
    bindAll('.personal-page', 'click', event => {
        log('名字', event.target.innerHTML)
        setLocalStorage('personal', event.target.innerHTML)
    })
}

const toggleBtnCallback = (target) => {
    let type = target.dataset.type
    let id = `#${type}-btn`
    let button = $(id)
    let t1 = '今日'
    let t2 = 'daily'
    if (id === '#weekly-btn') {
        t1 = '本周'
        t2 = 'weekly'
    }
    log('t1', t1)
    log('t1', button.text() === `收起${t1}计划`)
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
    log('type', type)
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
            }
        })
    }
}

const addHtmlToOlElement = (todoList, element) => {
    todoList = Array.isArray(todoList) ? todoList : [todoList]
    let olContent = $(element).innerHTML || ''
    let html = ''
    for (val of todoList) {
        html += `${olContent}<li><span>${val}</span><button class="btn btn-common btn-new done">完成</button></li>`
    }
    appendHtml(e(element), html)
}

const saveTodoListInStorage = (val, list) => {
    let dailyTodoList = getLocalStorage(list) || []
    dailyTodoList.push(val)
    setLocalStorage(list, dailyTodoList)
}
