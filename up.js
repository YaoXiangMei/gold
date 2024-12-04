

const { deviceW, deviceH } = require('./config.js')
const { createCommonStore, INTERVAL_TIME_MIN, INTERVAL_TIME_MAX, ANIMATION_TIME_MIN, ANIMATION_TIME_MAX, ALIPAY_SWITCH_ACCOUNT, restartAlipay, checkAlipayPlay } = require('./helper.js')



const commonStorage = createCommonStore()


const getSwipeOptions = () => {
   
    const xStartPoint = 300
    
    const startX = random(xStartPoint, deviceW - xStartPoint) // 起始位置x坐标
    const startY = random(deviceH - 500 - 100, deviceH - 500) // 起始位置y坐标
    // const endX = startX;  // 保持X坐标不变，实现垂直滑动
    const endX = random(xStartPoint - 10, xStartPoint + 10) // 结束位置x坐标
    const endY = random(300, 400)

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

const start = (window) => {
   
    status = 1

    const { startX, startY, endX, endY, duration } = getSwipeOptions()

    // console.log('上滑开始', startX, startY, endX, endY, duration)

    swipe(startX, startY, endX, endY, duration)
        
    
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

    // 检测是否浏览完成了
    aLipayBrowseed(window)

    // 检查是否是在播放页面
    checkAlipayPlay()

}

const stop = (window) => {
    timer && clearTimeout(timer)
    status = 0
    ui.run(function(){
        window.upRunStatus.setText(status === 1 ? '运行中' : '已暂停')
    })
    console.log('上滑停止')
}

// 判断是否是直播间
const livePlay = (window) => {
    setTimeout(() => {
        const live = text('点击进入直播间').exists()
        if (live) {
            // console.log('检测到直播间')
            setTimeout(() => {
                start(window)
            }, 2000)
            return 
        }
        operate3()
    }, 1000)
}

// 判断支付宝是否全部刷完了
const aLipayBrowseed = (window) => {

    const packageName = currentPackage()
    // 不是支付宝包名，直接返回
    if (packageName !== 'com.eg.android.AlipayGphone') return

    // 不是iqoo neo5 活力版 手机，直接返回
    if (device.model != 'V2118A') return

    // const exists = text('明日可领').exists()
    const exists = textContains('明日可领').findOnce()
    if (!exists) return

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
    const b = desc('设置').findOne().bounds()
    click(b.centerX(), b.centerY())

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
    const intervalMax = commonStorage.get(ALIPAY_3_OPERATE_INTERVAL_MAX)
    // 0的话标表示停止
    if (intervalMax == 0) return
    const randomNum = random(1, Number(intervalMax))
    if (randomNum != 1) return
    // const policy = {
    //     1: '收藏',
    //     2: '点赞',
    //     3: '关注'
    // }
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
    start,
    stop,
    status,
    timer,
    switchAccount
}