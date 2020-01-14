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
    // const studyDataList = getLocalStorage('studyDataList') || []
    // addHtmlToMainDiv(studyDataList)
    let today = moment().format("YYYY年MM月DD日")
    let data = {
        today,
    }
    $.ajax({
        //请求方式
        type : "POST",
        //请求的媒体类型
        contentType: "application/json;charset=UTF-8",
        //请求地址
        url : "/getStudyDataList",
        //数据，json字符串
        data : JSON.stringify(data),
        //请求成功
        success : function(result) {
            setLocalStorage('userInfo', result)
            window.location = "./html/index.html";
        },
        //请求失败，包含具体的错误信息
        error : function(e){
            swal({
                title: '提交失败',
                text: e,
                timer: 2000,
            }).then(function () {}, function () {})
        }
    })
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
