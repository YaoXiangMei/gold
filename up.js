

const { deviceW, deviceH } = require('./config.js')
const {
    createCommonStore,
    INTERVAL_TIME_MIN,
    INTERVAL_TIME_MAX,
    ANIMATION_TIME_MIN,
    ANIMATION_TIME_MAX,
    ALIPAY_SWITCH_ACCOUNT,
    restartAlipay,
    checkAlipayPlay,
    isAlipay,
    killApp
} = require('./helper.js')



const commonStorage = createCommonStore()


const getSwipeOptions = () => {
   
    const xStartPoint = 300
    
    const startX = random(xStartPoint, deviceW - xStartPoint) // 起始位置x坐标
    const startY = random(deviceH - 500 - 100, deviceH - 600) // 起始位置y坐标
    // const endX = startX;  // 保持X坐标不变，实现垂直滑动
    const endX = random(xStartPoint - 60, xStartPoint + 60) // 结束位置x坐标
    const endY = random(200, 500)

    const animationTimeMin = Number(commonStorage.get(ANIMATION_TIME_MIN))
    const animationTimeMax = Number(commonStorage.get(ANIMATION_TIME_MAX))

    const duration = random(animationTimeMin, animationTimeMax) // 滑动持续时间，单位为毫秒

    return {
        startX,
        startY,
        endX,
        endY,
        duration
    }

}

const getSwipeOptions2 = () => {
   
    const centerX = deviceW / 2
    const centerY = deviceH / 2

    // 从中心向上取中心点80%作为结束位置最小值
    const endMinY = centerY - centerY * 0.8
    // 从中心向上取中心点40%作为结束位置最大值
    const endMaxY = centerY - centerY * 0.4

    // 从中心向下取中心点40%作为起始位置最小值
    const startMinY = centerY + centerY * 0.4
    // 从中心向下取中心点80%作为起始位置最大值
    const startMaxY = centerY + centerY * 0.5

    // 从中心向左取中心点40%作为起始位置最小值
    const startMinX = centerX - centerX * 0.2
    // 从中心向左取中心点80%作为起始位置最大值
    const startMaxX = centerX - centerX * 0.4
    // 从中心向右取中心点40%作为结束位置最小值
    const endMinX = centerX + centerX * 0.2
    // 从中心向右取中心点80%作为结束位置最大值
    const endMaxX = centerX + centerX * 0.4

    const startX = random(startMinX, startMaxX)
    const startY = random(startMinY, startMaxY)
    const endX = random(endMinX, endMaxX)
    const endY = random(endMinY, endMaxY)

    const animationTimeMin = Number(commonStorage.get(ANIMATION_TIME_MIN))
    const animationTimeMax = Number(commonStorage.get(ANIMATION_TIME_MAX))
    const duration = random(animationTimeMin, animationTimeMax) // 滑动持续时间，单位为毫秒

    return {
        startX,
        startY,
        endX,
        endY,
        duration
    }

}

const getToday = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}${month}${day}`
}

let timer = null
let status = 0
let startRunTime = 0


function generatePoints(startX, startY, endX, endY, numPoints) {
    let points = [];
    for (let i = 0; i <= numPoints; i++) {
        let t = i / numPoints;
        let x = startX + t * (endX - startX);
        let y = startY + t * (endY - startY);
        points.push([x, y]);
    }
    return points;
}

function simulateGesture(startX, startY, endX, endY, numPoints, duration) {
    let points = generatePoints(startX, startY, endX, endY, numPoints);
    let gestureArgs = points;
    gesture(duration, gestureArgs)
}

const start = (window) => {
    status = 1

    const { startX, startY, endX, endY, duration } = getSwipeOptions2()

    // console.log('上滑开始', startX, startY, endX, endY, duration)
    // swipe(startX, startY, endX, endY, duration)

    // 模拟手势(多个点)
    simulateGesture(startX, startY, endX, endY, 15, duration)
    
    ui.run(function(){
        window.upRunStatus.setText(status === 1 ? '运行中' : '已暂停')
    })

    const intervalTimeMin = Number(commonStorage.get(INTERVAL_TIME_MIN))
    const intervalTimeMax = Number(commonStorage.get(INTERVAL_TIME_MAX))
    
    if (intervalTimeMin < 0 || intervalTimeMax < 0 || intervalTimeMin > intervalTimeMax) {
        toast('上滑时间间隔配置错误')
        exit()
    }
    // const intervalTime = random(3000, 8000)
    const intervalTime = random(Number(intervalTimeMin), Number(intervalTimeMax))

    // console.log(intervalTime + '毫秒后上滑动再次运行')

    timer && clearTimeout(timer)
    timer = setTimeout(() => {
        start(window)
    }, intervalTime)

    // 检测直播
    livePlay(window)

    // 检测是否浏览完成了, 无法动态检测，所以用处不大
    aLipayBrowseed(window)

    // 检查是否是在播放页面
    checkAlipayPlay()

}

const recordRunTimeStart = (window) => {
    startRunTime = +Date.now()
    start(window)
}

const stop = (window) => {
    timer && clearTimeout(timer)
    status = 0
    startRunTime = +Date.now()
    ui.run(function(){
        window.upRunStatus.setText(status === 1 ? '运行中' : '已暂停')
        window.runingTime.setText('0')
    })
    console.log('上滑停止')
}

// 已经运行的时间
const getRunTime = (window) => {
    // 计算当前时间和startRunTime相差的时间
    const now = +Date.now()
    const diff = now - startRunTime
    const minutes = Math.floor(diff / 1000 / 60)
    const seconds = Math.floor(diff / 1000 % 60)
    const time = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    ui.run(function(){
        window.runingTime.setText(time)
    })
    // 不是支付宝包名，直接返回
    if (!isAlipay()) return
    const v = commonStorage.get(ALIPAY_SWITCH_ACCOUNT)
    if (minutes >= 60 && commonStorage.get(ALIPAY_SWITCH_ACCOUNT) == 1) {
        console.log('已经运行了60分钟')
        stop(window)
        sleep(1000)
        click('首页')
        restartAlipay()
        startRunTime = +Date.now()
        start(window)
    } else {
        operate3()
        randomOperation()
    }
}

// 判断是否是直播间
const livePlay = (window) => {
    setTimeout(() => {
        // 检测是否需要校验
        const validContainer = id('com.alipay.android.phone.thirdparty:id/process').findOnce()
        if (validContainer) {
            const bounds = validContainer.bounds()
            // 高度
            const height = bounds.bottom - bounds.top
        
            const sX = (bounds.left + height) / 2
            const sY = (bounds.top + bounds.bottom) / 2
            const eX = bounds.right
            const eY = (bounds.top + bounds.bottom) / 2

            swipe(sX, sY, eX, eY, random(700, 1000))
        }

        const live = textMatches(/.*进入直播间/).exists()
        if (live) {
            setTimeout(() => {
                start(window)
            }, 2000)
            return 
        }
    
        getRunTime(window)

    }, 1000)
}

// 随机上滑、暂停（点击）、长按快进
const randomOperation = () => {
    // 不是支付宝包名，直接返回
    if (!isAlipay()) return
    
    const num = random(1, 10)
    console.log(`num = ${num}, num <= 5 模拟轻摸屏幕`)
    // 模拟轻摸屏幕
    if (num <= 5) {
        console.log('轻摸了屏幕')
        swipe(deviceW / 2 + random(10, 20), deviceH - random(300, 400), deviceW / 2 - random(30, 40), deviceH - random(400, 500), 300)
        sleep(500)
    }

    // 只有小于等于2的时候才操作
    if(num > 2) return

    console.log('num小于等于2的时候才触发，点击暂停，下滑，长按快进')

    const code = random(1, 10)
    
    console.log(`code = ${code}`)

    if(code == 1){ // 点击暂停操作
        console.log('暂停')
        click(random(5, 10), deviceH / 2 + random(1, 80))
        sleep(1000)
        click(random(5, 10), deviceH / 2 + random(1, 80))
    } else if (code == 2) { // 下滑
        console.log('下滑')
        const { startX, startY, endX, endY, duration } = getSwipeOptions()
        swipe(endX, endY, startX, startY, duration)
    } else if (code == 3) { // 长按快进
        console.log('长按快进')
        const centerX = deviceW / 2
        const centerY = deviceH / 2
        const x = random(centerX - 50, centerX + 50)
        const y = random(centerY - 100, centerY + 100)
        press(x, y, random(1, 2) * 1000)
    }
}
// 判断支付宝是否全部刷完了
const aLipayBrowseed = (window) => {

    // 不是支付宝包名，直接返回
    if (!isAlipay()) return

    
    // const exists = text('明日可领').exists()
    const exists = textContains('明日可领').findOnce()
    if (!exists) return

    // 不是iqoo neo5 活力版 手机，直接返回
    if (device.model != 'V2118A') return

    // 不需要切换账号
    if (commonStorage.get(ALIPAY_SWITCH_ACCOUNT) == 0) {
        stop(window)
        sleep(3000)
        home()
        return
    }

    stop(window)

    // 获取年月日
    const today = getToday()
    let count = commonStorage.get(today, 0)
    // 只切换一个账号
    if (count >= 1) {
        stop(window)
        sleep(3000)
        home()
        return
    }
    commonStorage.put(today, count + 1)

    // 走切换账号的流程

    // 等待3秒
    sleep(3000)

    // 点击我的
    click('我的')

    // 等待3秒
    sleep(3000)

    // 点击设置
    const settingBounds = desc('设置').findOne().bounds()
    click(settingBounds.centerX(), settingBounds.centerY())

    // 等待3秒
    sleep(3000)

    // 写死，点击登录其他账号
    click(deviceW / 2, deviceH - 500)

    // 等待3秒
    sleep(3000)

    // 写死, 点击第二个账号
    click(60 + (1020 - 60) / 2, 996 + (1260 - 996) / 2)
    
    // 等待3秒
    sleep(3000)

    // 重新打开支付宝
    restartAlipay()

    // 等待3秒
    sleep(3000)
    // 重新开始
    startRunTime = +Date.now()
    start(window)
}

// 切换账号
const switchAccount = (window) => {
    const v = commonStorage.get(ALIPAY_SWITCH_ACCOUNT)
    commonStorage.put(ALIPAY_SWITCH_ACCOUNT, v == 0 ? 1 : 0)
    ui.run(function(){
        window.switchAccountStatus.setText(v == 0 ? '切换账号' : '不切换')
    })
}

// 支付宝3连
const operate3 = () => {
    // 不是支付宝包名，直接返回
    if (!isAlipay()) return

    const intervalMax = commonStorage.get(ALIPAY_3_OPERATE_INTERVAL_MAX)
    // 0的话标表示停止, 不进行三连操作
    if (intervalMax == 0) return
    const randomNum = random(1, Number(intervalMax))
    // 只有等于才进行操作
    if (randomNum != 1) return
    const t = random(1, 3)
    if (t === 1) {
        collect()
    } else if (t === 2) {
        praise()
    } else if (t === 3) {
        follow()
    }
}

// 关注
const follow = () => {
    const follow = id('com.alipay.android.living.dynamic:id/text_follow_text_view').findOnce()
    follow && follow.click()
}

// 点赞
const praise = () => {
    const praiseImage = id('com.alipay.android.living.dynamic:id/praise_image').findOnce()
    if (!praiseImage) return
    const bounds = praiseImage.bounds()
    if (!bounds) return
    const x = bounds.centerX()
    const y = bounds.centerY()
    click(x, y)
}
// 收藏
const collect = () => {
    const collect = id('com.alipay.android.living.dynamic:id/collect_container').findOnce()
    collect && collect.click()
}

module.exports = {
    recordRunTimeStart,
    start,
    stop,
    status,
    timer,
    switchAccount
}