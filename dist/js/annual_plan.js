
const getBlob = () => {
    let arr = [
        {
            className: 'blob1',
            d: 'M480.8 168.7C524.5 210.6 543.4 285.2 528.9 353.7 514.5 422.2 466.7 484.5 409.7 502.2 352.6 519.8 286.4 492.8 237.5 458.3 188.6 423.8 157 381.8 142.2 331.7 127.4 281.7 129.2 223.5 158.3 184.9 187.4 146.2 243.7 127.1 306.1 122.2 368.5 117.3 437.1 126.7 480.8 168.7Z',
        }, {
            className: 'blob2',
            d: 'M416 239.2C456.5 303 499.5 371.5 480.6 428.2 461.7 485 380.8 530 297.8 531.3 214.8 532.5 129.7 490 93.7 423.4 57.8 356.8 71.1 266.2 113.7 201.1 156.2 136 228.1 96.5 283 106.3 337.8 116.2 375.6 175.3 416 239.2Z',
        }, {
            className: 'blob3',
            d: 'M477.2 201.2C504.4 244.7 483.6 319.3 446.1 379 408.5 438.7 354.3 483.3 293.8 486.9 233.3 490.5 166.6 453 139.9 399.6 113.2 346.2 126.5 276.8 159.8 229.8 193.2 182.7 246.6 157.8 310.8 151.6 375.1 145.3 450.1 157.7 477.2 201.2Z',
        }, {
            className: 'blob4',
            d: 'M411.4 166.7C442.3 193.1 463.7 230.2 462.6 265.2 461.5 300.2 437.9 333.1 419.7 373.2 401.4 413.2 388.5 460.4 355.4 488.1 322.2 515.8 268.9 524 224.8 507.5 180.7 491.1 146 450 112.1 402.9 78.3 355.8 45.4 302.5 50.6 253.1 55.8 203.6 99.2 158 147.1 134.6 195 111.2 247.5 110.1 293.9 117.4 340.3 124.7 380.6 140.3 411.4 166.7Z',
        }, {
            className: 'blob5',
            d: 'M441.7 222.8C479 282.7 501.2 355.8 475.1 398.9 449 442 374.5 455 312.4 447.8 250.3 440.7 200.7 413.3 161.4 362.7 122.2 312 93.3 238 118.1 185.3 143 132.7 221.5 101.3 286.9 108.9 352.3 116.5 404.5 163 441.7 222.8Z',
        }, {
            className: 'blob6',
            d: 'M492.7 188.9C535.8 263.5 547.4 356.5 510 425.7 472.6 495 386.3 540.5 304.9 537.7 223.5 534.8 147 483.7 118.1 419.3 89.3 355 108 277.5 146.3 205.8 184.5 134 242.3 68 308.5 63.1 374.8 58.2 449.5 114.3 492.7 188.9Z',
        }, {
            className: 'blob7',
            d: 'M449.5 177.2C485.4 225.8 500.5 287.5 483.9 334.8 467.4 382 419.3 414.9 370.7 433 322.1 451.1 273.1 454.4 221.4 438.8 169.8 423.3 115.5 388.9 103.6 343.1 91.8 297.3 122.4 240 162.2 190.6 202 141.2 251 99.6 303.9 96.5 356.8 93.4 413.6 128.7 449.5 177.2Z',
        }
    ]

    let index = getRandomInt(7)
    let r = arr[index]
    log('r', index)
    return r
}

const annualTemplate = (object) => {
    let o = object
    let blob = getBlob()
    let t = `
        <div class="blob">
            <svg  class='${blob.className}' xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600    600"><path d='${blob.d}' fill="#FE840E"/></svg>
            <h1 class="annual-${o.year}">${o.year}</h1>
        </div>
    `
    return t
}

const fakeData = () => {
    let result = [
        {
            year: 2021,
            studyDays: 2,
            userSum: 7,
            topThree: [{
                userId: 1,
                userName: 'Life',
                studyTimes: '0 小时',
            }, {
                userId: 3,
                userName: '风行',
                studyTimes: '0 小时',
            }],
            users: [{
                userId: 1,
                userName: 'Life',
            }, {
                userId: 3,
                userName: '风行',
            }]
        },
        {
            year: 2020,
            studyDays: 2,
            userSum: 7,
            topThree: [{
                userId: 1,
                userName: 'Life',
                studyTimes: '28 小时 28 分 28 秒',
            }, {
                userId: 2,
                userName: '肥皂',
                studyTimes: '20 小时 20 分 20 秒',
            }, {
                userId: 3,
                userName: '风行',
                studyTimes: '18 小时 18 分 18 秒',
            }],
            users: [{
                userId: 1,
                userName: 'Life',
            }, {
                userId: 2,
                userName: '肥皂',
            }, {
                userId: 3,
                userName: '风行',
            }]
        },
        {
            year: 2019,
            studyDays: 250,
            topThree: [{
                userId: 1,
                userName: 'Life',
                studyTimes: '1000 小时 10 分 10 秒',
            }, {
                userId: 2,
                userName: '肥皂',
                studyTimes: '888 小时 33 分 22 秒',
            }, {
                userId: 3,
                userName: '风行',
                studyTimes: '666 小时 23 分 33 秒',
            }],
            userSum: 16,
            users:  [{
                userId: 1,
                userName: 'Life',
                studyTimes: '1000 小时',
            }, {
                userId: 2,
                userName: '肥皂',
                studyTimes: '888 小时 33 分 22 秒',

            }, {
                userId: 3,
                userName: '风行',
                studyTimes: '666 小时 23 分 33 秒',
            }, {
                userId: 4,
                userName: '点点',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 5,
                userName: 'eddy',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 6,
                userName: '康康',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 7,
                userName: '曜',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 8,
                userName: '炒面',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 9,
                userName: '懒懒',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 3,
                userName: '相枫',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 10,
                userName: 'yyk',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 11,
                userName: 'mmxiao',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 12,
                userName: 'Allen',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 13,
                userName: 'bobo',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 14,
                userName: '线团猫',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 15,
                userName: '世终',
                studyTimes: '222 小时 22 分 22 秒',
            }, {
                userId: 16,
                userName: 'Clement',
                studyTimes: '222 小时 22 分 22 秒',
            }],
        },
    ]

    return result

}

const generateAnnual = () => {
    let array = fakeData()
    let html = ''
    array.forEach((obj) => {
        let t = annualTemplate(obj)
        html += t
    })
    let element = e('.blob-wrapper')
    appendHtml(element, html)
}


const __main = () => {
    generateAnnual()
}

__main()
