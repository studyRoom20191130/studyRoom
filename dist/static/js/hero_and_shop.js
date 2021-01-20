const calculateScore = (members) => {
    let score = 0
    for (const member of members) {
        for (const t of member.table) {
            score += t.hourDuration
        }
    }
    return score.toFixed(0)
}


const membersHtml = (members) => {
    let d = ``
    for (const member of members) {
        d += `
    <div><img src=./img/hero/${member.hero}></div>
    `
    }
    return d
}

const renderLeftNav = (members) => {
    let score = calculateScore(members)
    let html = membersHtml(members)
    html += `<div class="score">${score}</div>`
    e('.left-members').innerHTML = ''
    appendHtml(e('.left-members'), html)
}

const renderRightNav = (members) => {
    let score = calculateScore(members)
    let html = `<div class="score">${score}</div>`
    html += membersHtml(members)
    e('.right-members').innerHTML = ''
    appendHtml(e('.right-members'), html)
}

const splitMembers = (members) => {
    let l = members.length
    let leftIndex = Math.floor(l / 2)
    let left_members = members.slice(0, leftIndex)
    let right_members = members.slice(leftIndex)
    return [left_members, right_members]
}

const processMembers = (studyDataList) => {
    let members = []
    for (const studyData of studyDataList) {
        let hero = studyData.hero
        if (hero) {
            members.push(studyData)
        }
    }
    return members
}

const renderNavHero = (studyDataList) => {
    console.log("studyDataList", studyDataList)
    let members = processMembers(studyDataList)
    let [left_members, right_members] = splitMembers(members)
    renderLeftNav(left_members)
    renderRightNav(right_members)
}


// 控制商店或 编辑器的显示
const bindShopToggleEvent = () => {
    window.addEventListener('keydown', (event) => {
        if (event.code=== 'F4') {
            $('#shop').toggleClass('show-shop')
        }
        if (event.code=== 'F2') {
            $('.code-mirror-div').toggleClass('show-code-mirror')
        }
    })
}


// 点击选择装备, 如果时间够, 就向后台发送接口
// 拿到所有时间, 如果所有时间 - (weaponList.length * 60) >= 60, 就可以购买装备
// 后台记录到 weaponList 里
// 每次把这个 weaponList 发过来, 渲染到页面上

const canChooseWeapon = (src) => {
    if (src.includes('water')) {
        return true
    }
    if (window.weapon === undefined) {
        alertMsg('时间不足, 无法购买')
        return
    }
    console.log("window.weapon.split('-')", window.weapon.split('-'))
    window.weapon.split('-')
    let a = window.weapon.split('-').filter(el => {
        return !el.includes('water')
    })
    console.log("a", a)
    let len = a.length - 1

    // return true
    return window.totalMinitue - (len * 60) >= 60
}

const renderWeaponImg = (weapon) => {
    let img = `<img src="./img/weapon/${weapon}">`
    let user = getLocalStorage('userInfo').split('-')[0]
    appendHtml(e(`#${user}-signature-weapon`), img)
}

const chooseWeaponEvent = () => {
    let shop = e('#shop')
    bindEvent(shop, 'click', (event) => {
        let target = event.target
        if (canChooseWeapon(target.src)) {
            let weapon = target.dataset.weapon
            window.weapon += weapon + '-'
            let data = {
                weapon,
                user: getLocalStorage('userInfo').split('-')[0],
            }
            if (target.tagName === 'IMG') {
                ajax(data, '/chooseWeapon', (r) => {})
                renderWeaponImg(weapon)
            }
        } else {
            alertMsg('时间不足, 无法购买')
        }

    })
}

const weaponImgListHardCode = () => {
    const weaponImgList = [
        'blink_lg.png',
        'butterfly_lg.png',
        'blade_mail_lg.png',
        'black_king_bar_lg.png',
        'abyssal_blade_lg.png',
        'dagon_lg.png',
        'desolator_lg.png',
        'echo_sabre_lg.png',
        'lotus_orb_lg.png',
        'maelstrom_lg.png',
        'manta_lg.png',
        'mjollnir_lg.png',
        'monkey_king_bar_lg.png',
        'moon_shard_lg.png',
        'silver_edge_lg.png',
        'rapier_lg.png',
        'skadi_lg.png',
        'ultimate_scepter_lg.png',
        'bloodthorn_lg.png',
        'satanic_lg.png',
        'radiance_lg.png',
        'octarine_core_lg.png',
        'refresher_lg.png',
        'travel_boots_lg.png',
        'water1.png',
        'water2.png',
        'water3.png',
        'water4.png',
    ]
    return weaponImgList
}



const renderShop = () => {
    let weaponImgList = weaponImgListHardCode()
    let html = ''
    for (const weapon of weaponImgList) {
        html += `
            <img data-weapon="${weapon}" src="./img/weapon/${weapon}">
        `
    }
    appendHtml(e('#shop'), html)
}
