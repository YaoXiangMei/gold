

const { deviceW, deviceH } = require('./config.js')
const { createCommonStore, killApp, openAlipay, restartAlipay } = require('./helper.js')
const up = require('./up.js')



const commonStorage = createCommonStore()

/* 
* 判断当前时间是否在指定时间范围内
* @param {number} startHour - 开始小时
* @param {number} startMinute - 开始分钟
* @param {number} endHour - 结束小时
* @param {number} endMinute - 结束分钟
*/
function isCurrentTimeBetween(startHour, startMinute, endHour, endMinute) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 将开始和结束时间转换为分钟
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    // 将当前时间转换为分钟
    const currentTotalMinutes = currentHour * 60 + currentMinute

    // 检查当前时间是否在指定时间之间
    // 注意：这里假设开始和结束时间是在同一天内
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes
}

let timer = null
let status = 0
const start = (window) => {
   // 检测时间是否在00:01-01:00之间
   if (isCurrentTimeBetween(0, 1, 1, 0)) {
        openAlipay()
        up.start(window)
        status = 0
    } else {
        status = 1
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
            start(window)
        }, 5000)
    }
    ui.run(function() {
        window.planRunStatus.setText(status == 1 ? '已开启' : '已关闭')
    })

}

const stop = (window) => {
    timer && clearTimeout(timer)
    status = 0
    ui.run(function(){
        window.planRunStatus.setText(status == 1 ? '已开启' : '已关闭')
    })
    console.log('上滑停止')
}

module.exports = {
    start,
    stop,
    status,
    timer
}