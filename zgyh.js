

const { deviceW, deviceH } = require('./config.js')

const { createCommonStore, INTERVAL_TIME_MIN, INTERVAL_TIME_MAX, ANIMATION_TIME_MIN, ANIMATION_TIME_MAX } = require('./helper.js')

const commonStorage = createCommonStore()

const getSwipeOptions = () => {
    
    // 以分辨率1080 * 2408为例
    // 重新开始按钮的位置300, 1470到700, 1590之间

    // const topStart = deviceH * 0.610 + 5 // 不准
    const topStart = deviceH * 0.655
    const topEnd = deviceH * 0.660
    const leftStart = deviceW * 0.277 + 5
    const leftEnd = deviceW * 0.645 - 5

    const startX = random(leftStart, leftEnd) // 起始位置x坐标
    const startY = random(topStart, topEnd) // 起始位置y坐标
   

    return {
        startX,
        startY,
    }
    // return {
    //     startX: 519,
    //     startY: 1609,
    // }

}

let timer = null
let status = 0
const start = (window) => {

    // console.log('------------------')
    status = 1

    const { startX, startY } = getSwipeOptions()
    console.log(startX, startY)

    click(startX, startY)

    ui.run(function(){
        window.zgyhRunStart.setText(status === 1 ? '运行中' : '已暂停')
    })

    const intervalTimeMin = Number(commonStorage.get(INTERVAL_TIME_MIN))
    const intervalTimeMax = Number(commonStorage.get(INTERVAL_TIME_MAX))
    
    if (intervalTimeMin < 0 || intervalTimeMax < 0 || intervalTimeMin > intervalTimeMax) {
        toast('上滑时间间隔配置错误')
        exit()
    }
    // const intervalTime = random(3000, 8000)
    const intervalTime = random(Number(intervalTimeMin), Number(intervalTimeMax))

    console.log(intervalTime + '毫秒后点击再次运行')

    timer && clearTimeout(timer)
    timer = setTimeout(() => {
        start(window)
    }, intervalTime)

    // console.log('------------------')

}

const stop = (window) => {
    timer && clearTimeout(timer)
    status = 0
    ui.run(function(){
        window.zgyhRunStart.setText(status === 1 ? '运行中' : '已暂停')
    })
    console.log('点击停止')
}


module.exports = {
    start,
    stop,
    status,
    timer,
}