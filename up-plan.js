

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
    }, 1000)
}

module.exports = {
    start,
    stop,
    status,
    timer
}