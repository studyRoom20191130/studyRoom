// 制定今日计划逻辑部分

// 输入框事件
const bindTodoInputEvent = () => {
    $("#input-todo").keyup(function(){
        if(event.keyCode == 13){
            const input = $("#input-todo")
            const val = input.val()
            saveTodoListInStorage(val)
            addHtmlToOlElement()
            input.val('')
        }
    })
}

// const getTodoList = () => {
//     let html = ''
//     const todoList = getLocalStorage('todoList') || []
//     for (val of todoList) {
//         html += `<li>${val}</li>`
//     }
//     appendHtml(e("#ol"), html)
// }

// 常用事项点击事件
const bindSpanClickEvent = () => {
    $('.not-center span').click(function(event){
        const val = event.target.innerHTML
        saveTodoListInStorage(val)
        addHtmlToOlElement()
    });
}

const getTodoListLength = () => {
    let t = getLocalStorage('todoList') || []
    return t.length - 1
}

const addHtmlToOlElement = () => {
    todoList = getLocalStorage('todoList') || []
    let html = ''
    for (var i = 0; i < todoList.length; i++) {
        let val = todoList[i]
        let index = i + 1
        html += `<li><div><span>${index}.</span><span>${val}</span></div><button class="btn btn-success btn-small">完成</button></li>`
    }
    $('ol').empty()
    appendHtml(e("#ol"), html)
}

const saveTodoListInStorage = (val) => {
    let todoList = getLocalStorage('todoList') || []
    todoList.push(val)
    setLocalStorage('todoList', todoList)
}

const bindClearButton = () => {
    log(1)
    $('#clear-button').click(function(){
        log(2)
        $("#ol").empty()
        localStorage.setItem('todoList', [])
    });
}


bindEvent(e('ol'), 'click', e => {
    if (e.target.classList.contains('btn')) {
        const button = $(e.target)
        button.text() === '完成' ? button.text('取消') : button.text('完成')
        let li = closestTag(e.target, 'li')
        let span = li.querySelectorAll('span')[1]
        toggleClass(span, 'text-decoration')
    }
})
