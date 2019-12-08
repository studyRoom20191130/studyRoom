// 制定今日计划逻辑部分

// 输入框事件
const bindTodoInputEvent = () => {
    $("#input-todo").keyup(function(){
        if(event.keyCode == 13){
            const input = $("#input-todo")
            const val = input.val()
            addHtmlToOlElement(val)
            saveTodoListInStorage(val)
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
        addHtmlToOlElement(val)
        saveTodoListInStorage(val)
    });
}

const addHtmlToOlElement = (todoList) => {
    todoList = Array.isArray(todoList) ? todoList : [todoList]
    let olContent = $("#ol").innerHTML || ''
    let html = ''
    let index = 0
    for (val of todoList) {
        index++
        html += `${olContent}<li><span>${index}. ${val}</span><button class="btn btn-success btn-small">完成</button></li>`
    }
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
