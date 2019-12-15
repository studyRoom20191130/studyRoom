const bindOtherTime = () => {
    let btn = e('.btn-other-time')
    let div = e('.other-time')
    bindEvent(btn, 'click', (event) => {
        log('btn')
        // $('.other-time').toggleClass('hidden', false)
        let has = $('.other-time').hasClass('hidden')
        if (has) {
            $('.other-time').removeClass('hidden')
        } else {
            $('.other-time').addClass('hidden')
        }
    })
}

const bindPlanButton = () => {
    $(".plan-button").click(function(){
        const button = $(".button-text")
        button.text() === '收起计划' ? button.text('制定今日计划') : button.text('收起计划')
        $(".make-plan").toggle();
    });
}

const bindEvents = () => {
    bindOtherTime()
    bindPlanButton()
    bindTodoInputEvent()
    bindSpanClickEvent()
    bindClearButton()
}

const getTodoList = () => {
    const todoList = getLocalStorage('todoList') || []
    addHtmlToOlElement(todoList)
}

const getstudyDataList =() => {
    const studyDataList = getLocalStorage('studyDataList') || []
    addHtmlToMainDiv(studyDataList)
}

const shouldShowTodo = () => {
    // 如果有计划，直接展示 totoList
    // 如果没有计划，显示制定今日计划按钮
    const todoList = getLocalStorage('todoList') || []
    const hasTodoList = todoList.length === 0 ? false : true
    if (hasTodoList) {
        $(".button-text").text('收起计划');
        $(".make-plan").toggle();
    } else {
        $(".button-text").text('制定今日计划');
    }
}

const __main = () => {
    bindEvents()
    getstudyDataList()
    getTodoList()
    shouldShowTodo()
}

__main()
