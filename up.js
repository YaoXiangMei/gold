

const { deviceW, deviceH } = require('./config.js')
const { createCommonStore, INTERVAL_TIME_MIN, INTERVAL_TIME_MAX, ANIMATION_TIME_MIN, ANIMATION_TIME_MAX, getStatusBarHeight } = require('./helper.js')



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

let timer = null
let status = 0
const start = (window) => {
    // console.log('------------------')
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
    livePlay(window)
    // console.log('------------------')

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
    timer
}