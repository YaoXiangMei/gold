

const { deviceW, deviceH } = require('./config.js')
const { createCommonStore, INTERVAL_TIME_MIN, INTERVAL_TIME_MAX, ANIMATION_TIME_MIN, ANIMATION_TIME_MAX } = require('./helper.js')



const commonStorage = createCommonStore()


const getSwipeOptions = () => {
   
    const startX = random(deviceW - 200, deviceW - 150) // 起始位置x坐标
    const startY = random(deviceH - 500 - 100, deviceH - 500) // 起始位置y坐标
    const endX = random(100, 200);  
    const endY = startY // 保持X坐标不变，实现水平滑动
    
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

    console.log('------------------')
    status = 1


    const { startX, startY, endX, endY, duration } = getSwipeOptions()

    console.log('左滑开始', startX, startY, endX, endY, duration)

    swipe(startX, startY, endX, endY, duration)
        
    
    ui.run(function(){
        window.leftRunStatus.setText(status === 1 ? '运行中' : '已暂停')
    })

    const intervalTimeMin = Number(commonStorage.get(INTERVAL_TIME_MIN))
    const intervalTimeMax = Number(commonStorage.get(INTERVAL_TIME_MAX))
    
    if (intervalTimeMin < 0 || intervalTimeMax < 0 || intervalTimeMin > intervalTimeMax) {
        toast('左滑时间间隔配置错误')
        exit()
    }
    // const intervalTime = random(3000, 8000)
    const intervalTime = random(Number(intervalTimeMin), Number(intervalTimeMax))

    console.log(intervalTime + '毫秒后左滑动再次运行')

    timer && clearTimeout(timer)
    timer = setTimeout(() => {
        start(window)
    }, intervalTime)

    console.log('------------------')

}

const stop = (window) => {
    timer && clearTimeout(timer)
    status = 0
    ui.run(function(){
        window.leftRunStatus.setText(status === 1 ? '运行中' : '已暂停')
    })
    console.log('左滑停止')
}


module.exports = {
    start,
    stop,
    status,
    timer
}