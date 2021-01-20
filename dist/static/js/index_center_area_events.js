// 评论功能
const bindMainArticleEvent = () => {
    bindEvent(e('body'), 'click', event => {
        let target = event.target
        // 展开收起评论区
        if (target.classList.contains('comments')) {
            $(target).next().toggle()
        }
        //发布评论
        if (target.classList.contains('comment-submit')) {
            sendComment(target, '')
        }

        // 发布回复
        if (target.classList.contains('reply-submit')) {
            sendComment(target, 'reply')
        }

        // 点击回复出现输入框
        if (target.classList.contains('reply-span')) {
            // 插入一个输入框
            let div = $(target).parent()[0]
            // 评论的人
            let commenter = getLocalStorage('userInfo').split('-')[0]
            // 被评论的人
            let user = div.dataset.user
            let replyer = $(div).children('span')[0].innerText.split(':')[0].trim()
            let input = `
                  <div class="edit-input" data-user="${user}" data-replyer="${replyer}">
                    <span class="comments-span">${commenter}</span> <textarea></textarea><button class="btn btn-common btn-new reply-submit">回复</button>
                </div>
            `
            $(div).append(input)
        }
    })
}

const sendComment = (target, reply) => {
    let div = $(target).parent()[0]
    let user = div.dataset.user
    if (user === '明日边缘') {
        user = 'life'
    }
    let fromIndexPage = true
    let commentTime = moment().format('YYYY-MM-DD HH:mm')
    let comment = reply + $(target).prev()[0].value
    let commenter = getLocalStorage('userInfo').split('-')[0]
    let replyer = div.dataset.replyer
    let data = {
        comment,
        user,
        commenter,
        fromIndexPage,
        commentTime,
        replyer,
    }
    ajax(data, "/sendComment", (res) => {
        addHtmlToMainDiv(res)
    })
}