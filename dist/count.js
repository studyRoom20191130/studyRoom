const fs = require('fs')


const showTotalHour = (list) => {
    let obj = {};
    let totalHour = 0
    for (const record of list) {
        let table = record.table;
        for (const signalRecord of table) {
            let studyContent = signalRecord.studyContent;
            totalHour += signalRecord.hourDuration
            if (studyContent.includes('-')) {
                let index = studyContent.indexOf('-');
                let key = studyContent.slice(0, index).trim();
                if (key in obj) {
                    obj[key] += signalRecord.hourDuration;
                } else {
                    obj[key] = signalRecord.hourDuration;
                }
            }
        }
    }
    return [obj, totalHour]
}

const writeFile = (fileName, content) => {
    fs.writeFile(fileName, content, {flag:"w"}, function (err) {
        if(err){
            return console.log(err);
        }
    })
}

const count = () => {
    // let fileName = `./static/json/2021/study-record-data/${user}.json`

    let userList = [ '点点',
        'LD',
        'Sean',
        'life',
        '亭川',
        '荒',
        'Ly',
    ]


    for (const user of userList) {
        let fileName = `./static/json/count2020/${user}.json`
        let data = fs.readFileSync(fileName,'utf-8');
        let dataArray = JSON.parse(data)
        let [totalHourObj, d] = showTotalHour(dataArray)
        let wr = `./static/json/2020/todo-count/${user}.json`
        let o = JSON.stringify(totalHourObj, null, '    ')
        writeFile(wr, o)
    }


    // for (const user of userList) {
    //     let fileName = `./static/json/count2021/${user}.json`
    //     let data = fs.readFileSync(fileName,'utf-8');
    //     let dataArray = JSON.parse(data)
    //     let [totalHourObj, d] = showTotalHour(dataArray)
    //     let wr = `./static/json/2021/todo-count/${user}.json`
    //     let o = JSON.stringify(totalHourObj, null, '    ')
    //     writeFile(wr, o)
    // }

}


const main = () => {
    count()
}


if (require.main === module) {
    main()
}