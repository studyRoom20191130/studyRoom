// 页面右侧制定计划逻辑部分
const todoInit = () => {
    shouldShowTodo()
    getTodoList()
}
const shouldShowTodo = () => {
    // 如果有计划，直接展示 totoList
    // 如果没有计划，显示制定计划按钮
    let map = [
        {
            type: 'todoListDaily',
            element: 'daily',
            word: '今日',
        },
        {
            type: 'todoListWeekly',
            element: 'weekly',
            word: '本周',
        },
    ]
    for (obj of map) {
        const  todoList = getLocalStorage(obj.type) || []
        const hasTodoList = todoList.length === 0 ? false : true
        if (hasTodoList) {
            $(`#${obj.element}-btn`).text(`收起${obj.word}计划`);
            $(`.make-${obj.element}-plan`).toggle();
        } else {
            $(`#${obj.element}-btn`).text(`制定${obj.word}计划`);
        }
    }
}

const getTodoList = () => {
    let map = [
        {
            type: 'todoListDaily',
            element: '#ol',
        },
        {
            type: 'todoListWeekly',
            element: '#ol-weekly',
        },
    ]
    for (obj of map) {
        const  todoList = getLocalStorage(obj.type) || []
        addHtmlToOlElement(todoList, obj.element)
    }
}

const bindRightDivBtnEvent = () => {
    bindEvent(e('.right'), 'click', event => {
        let target = event.target
        let type = target.dataset.type
        let contains = target.classList.contains.bind(target.classList)
        let map = {
            'btn-callback': btnCallback,
            'clear-data': clearBtnCallback
        }
        for (let key in map) {
            if (contains(key)) {
                map[key](type)
            }
        }
    })
}

const clearBtnCallback = (type) => {
        let element = type === 'todoListWeekly' ? '#ol-weekly' : '#ol'
        $(element).empty()
        localStorage.setItem(type, [])
}

// 输入框事件
const bindTodoInputEvent = () => {
    // 这里用 dataset 优化
    let inputList = [
        {
            element: "#input-todo-daily",
            ol: "#ol",
            todoList: "todoListDaily",
        },
        {
            element: "#input-todo-weekly",
            ol: "#ol-weekly",
            todoList: "todoListWeekly",
        },
    ]
    for (let obj of inputList) {
        $(obj.element).keyup(function(){
            if(event.keyCode == 13){
                let input = $(obj.element)
                let val = input.val()
                log(2, obj.ol)
                addHtmlToOlElement(val, obj.ol)
                saveTodoListInStorage(val, obj.todoList)
                input.val('')
            }
        })
    }
}

const btnCallback = (type) => {
        let id = `#${type}-btn`
        let button = $(id)
        let t1 = '今日'
        let t2 = 'daily'
        if (id === '#weekly-btn') {
            t1 = '本周'
            t2 = 'weekly'
        }
        button.text() === `收起${t1}计划` ? button.text(`制定${t1}计划`) : button.text(`收起${t1}计划`)
        $(`.make-${t2}-plan`).toggle();
}

// 常用事项点击事件
const bindSpanClickEvent = () => {
    $('.not-center span').click(function(event){
        const val = event.target.innerHTML
        addHtmlToOlElement(val)
        saveTodoListDailyInStorage(val)
    });
}

const addHtmlToOlElement = (todoList, element) => {
    todoList = Array.isArray(todoList) ? todoList : [todoList]
    let olContent = $(element).innerHTML || ''
    let html = ''
    for (val of todoList) {
        html += `${olContent}<li><span>${val}</span><button class="btn btn-success btn-small">完成</button></li>`
    }
    appendHtml(e(element), html)
}

const saveTodoListInStorage = (val, type) => {
    let todoListDaily = getLocalStorage(type) || []
    todoListDaily.push(val)
    setLocalStorage(type, todoListDaily)
}

bindEvent(e('ol'), 'click', e => {
    if (e.target.classList.contains('btn')) {
        const button = $(e.target)
        button.text() === '完成' ? button.text('取消') : button.text('完成')
        let li = closestTag(e.target, 'li')
        let span = li.querySelector('span')
        toggleClass(span, 'text-decoration')
    }
})
