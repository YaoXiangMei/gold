

const { deviceW, deviceH } = require('./config.js')
const { createCommonStore, INTERVAL_TIME_MIN, INTERVAL_TIME_MAX, ANIMATION_TIME_MIN, ANIMATION_TIME_MAX, restartAlipay } = require('./helper.js')



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
function traverseChildren(view) {
    if (view) {
        // 遍历当前控件的所有直接子控件
        for (var i = 0; i < view.childCount(); i++) {
            var childView = view.child(i);
            // 打印子控件的类名
            console.log(childView.className());
            if (childView.className() === 'android.view.View') {
                // 如果子控件是View类型，则递归调用，遍历子控件的子控件
                console.log(childView, 'childView')
                console.log(childView.text(), 'childView.text')
            }
            // 递归调用，遍历子控件的子控件
            traverseChildren(childView);
        }
    }
}
const start = (window) => {
    // const today = getToday()
    // const store = storages.create(today)
    // store.remove(today)
    // return
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

    // 检测是否浏览完成了
    aLipayBrowseed(window)

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

// 判断支付宝是否全部刷完了
const aLipayBrowseed = (window) => {

    const packageName = currentPackage()
    // 不是支付宝包名，直接返回
    if (packageName !== 'com.eg.android.AlipayGphone') return

    // 不是iqoo neo5 活力版 手机，直接返回
    if (device.model != 'V2118A') return

    const exists = text('明日可领').exists()
    if (!exists) return

    stop(window)

    // 获取年月日
    const today = getToday()
    const store = storages.create(today)
    let count = store.get(today, 0)
    // 只切换一个账号
    if (count >= 1) {
        stop(window)
        return
    }
    store.put(today, count + 1)

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


module.exports = {
    start,
    stop,
    status,
    timer
}