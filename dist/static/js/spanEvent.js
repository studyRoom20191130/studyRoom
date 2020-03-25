const getGeneralTodo = () => {
    // 写一些常用事项到 storage 作为初始化
    let generalTodoList = getLocalStorage('generalTodoList')
    if (!generalTodoList) {
        generalTodoList =[
            '看《代码大全》',
            '看《高级程序设计》',
            '跟 B 站直播',
            '看《ES6 标准入门》',
            '写斧头作业',
            '看 chat',
            '复习视频',
        ]
        setLocalStorage('generalTodoList', generalTodoList)
    }

    let spanNode = ''
    for (let innerHtml of generalTodoList) {
        spanNode += `<span class="general-todo-span">${innerHtml}</span>`
    }
    $(".daily-general-todo").empty()
    appendHtml(e(".daily-general-todo"), spanNode)

    // 无脑复制
    let generalWeeklyTodoList = getLocalStorage('generalWeeklyTodoList')
    if (!generalWeeklyTodoList) {
        generalWeeklyTodoList =[
            '看《代码大全》',
            '看《高级程序设计》',
            '跟 B 站直播',
            '看《ES6 标准入门》',
            '写斧头作业',
            '看 chat',
            '复习视频',
        ]
        setLocalStorage('generalWeeklyTodoList', generalWeeklyTodoList)
    }
    let spanNodeWeekly = ''
    for (let innerHtml of generalWeeklyTodoList) {
        spanNodeWeekly += `<span class="general-todo-span weekly">${innerHtml}</span>`
    }
    $(".weekly-general-todo").empty()
    appendHtml(e(".weekly-general-todo"), spanNodeWeekly)
}


window.clickNum  = 0
window.oldTodo = ''
window.enterKeydown = false
window.editMod = false

// 常用事项点击事件
const spanClickEvents = (target) => {
    window.clickNum += 1
    setTimeout(() => {
        // 单击添加到上方
        if (window.clickNum === 1 ) {
            if (window.editMod) {
                return
            }
            let div = $(target).parent()[0]
            let parentElementId = div.dataset.type
            let list = div.dataset.list
            if (parentElementId === '#ol-daily' || parentElementId === '#ol-weekly') {
                const val = target.innerHTML
                addHtmlToOlElement(val, parentElementId)
                saveTodoListInStorage(val, list)
            }
        }
        // 双击编辑
        if (window.clickNum === 2) {
            window.editMod = true
            target.contentEditable = true
            target.focus()
            // 点击全选
            let range = document.createRange();
            range.selectNodeContents(target);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            window.oldTodo = target.innerHTML
            target.style.background = '#fff'
            target.style.color = 'black'
        }
        // 三击删除
        if (window.clickNum === 3) {
            target.remove()
            window.oldTodo = target.innerHTML
            let newTodo = target.innerHTML
            let keyName = target.classList.contains('weekly') ? 'generalWeeklyTodoList' : 'generalTodoList'
            let generalTodoList = getLocalStorage(keyName)
            let index = generalTodoList.findIndex(value => {
                return value === window.oldTodo
            })
            window.oldTodo = ''
            generalTodoList.splice(index, 1)
            setLocalStorage(keyName, generalTodoList)
        }
        window.clickNum  = 0
    }, 450)
}

const spanKeydownEvents = (event) => {
    let target = event.target
    if (event.key === 'Enter') {
        window.enterKeydown = true
        event.preventDefault()
        target.contentEditable = false
        window.editMod = false
        updateDailyTodo(target)
    }
}

const spanBlurEvents = (target) => {
    if (window.enterKeydown) {
        window.enterKeydown = false
        return
    }
    window.editMod = false
    updateDailyTodo(target)
}

const updateDailyTodo  = (target) => {
    target.style.background = 'hsl(39, 100%, 50%)'
    target.style.color = '#fff'
    let newTodo = target.innerHTML
    let keyName = target.classList.contains('weekly') ? 'generalWeeklyTodoList' : 'generalTodoList'
    let generalTodoList = getLocalStorage(keyName)
    let index = generalTodoList.findIndex(value => {
        return value === window.oldTodo
    })

    window.oldTodo = ''
    generalTodoList.splice(index, 1)
    generalTodoList.unshift(newTodo)
    setLocalStorage(keyName, generalTodoList)
}