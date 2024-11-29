

// "ui";
// ui.layout(
//     <vertical>
//         <text textSize="16sp" textColor="black" text="上滑配置"/>
//         <input id="upIntervalTimeMin" inputType="number" hint="间隔时间最小值" />
//         <input id="upIntervalTimeMax" inputType="number" hint="间隔时间最大值" />
//         <button id="upConfirmConfig" text="确定"/>
//     </vertical>
// )

const { deviceW, deviceH } = require('./config.js')
const {
        createCommonStore,
        updateCommonStoreTime,
        INTERVAL_TIME_MIN,
        INTERVAL_TIME_MAX,
        ANIMATION_TIME_MIN,
        ANIMATION_TIME_MAX,
        ALIPAY_3_OPERATE_INTERVAL_MAX,
        draw
    } = require('./helper.js')
const up = require('./up.js')
const upPlan = require('./up-plan.js')

const { getStatusBarHeight, getNavigationBarHeight } = require('./helper.js')

// 检查悬浮窗
if (!floaty.checkPermission()) {
    // 没有悬浮窗权限，提示用户并跳转请求
    // const floatFlag = confirm('本脚本需要悬浮窗权限来显示悬浮窗，请在随后的界面中允许并重新运行本脚本。')
    // if (floatFlag) {
    //     floaty.requestPermission()
    // }
    // exit()
    //申请悬浮窗
    const floatFlag = confirm('本脚本需要悬浮窗权限来显示悬浮窗，请在随后的界面中允许并重新运行本脚本。')
    if (floatFlag) {
        importClass(android.content.Intent)
        importClass(android.net.Uri)
        importClass(android.provider.Settings)
        const intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse('package:' + context.getPackageName()))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        app.startActivity(intent)
    }
    exit()
} else {
    toastLog('已有悬浮窗权限')
}

// 检测无障碍服务
if (auto.service == null) {
    const activityFlag = confirm('无障碍服务未开启,点击确定跳转开启')
    if (activityFlag) {
        app.startActivity({
            action: 'android.settings.ACCESSIBILITY_SETTINGS'
        })
    }
    exit()
}

const floatLeft = 35
const floatPadding = 20

const floatW = deviceW - floatLeft * 2 - 100

wx = 0
wy = getStatusBarHeight() + getNavigationBarHeight()

const createHighWindow = () => {
    const highWindow = floaty.rawWindow(
        <frame id="container" w="{{floatW}}px" marginLeft="{{floatLeft}}px" padding="{{floatPadding}}px" bg="#90000000">
            <vertical id="content">
                <horizontal>
                    <text textColor="#ffffff">全局配置</text>
                </horizontal>
                <horizontal>
                    <text textColor="#ffffff">间隔时间最小值：</text>
                    <button id="intervalTimeMinMinus" padding="0" width="100px" h='90px'>-</button>
                    <text id="intervalTimeMin" textColor="#ffffff"></text>
                    <button id="intervalTimeMinPlus" padding="0" width="100px" h='90px'>+</button>
                </horizontal>
                <horizontal>
                    <text textColor="#ffffff">间隔时间最大值：</text>
                    <button id="intervalTimeMaxMinus" padding="0"  width="100px" h='90px'>-</button>
                    <text id="intervalTimeMax" textColor="#ffffff"></text>
                    <button id="intervalTimeMaxPlus" padding="0" width="100px" h='90px'>+</button>
                </horizontal>
                <horizontal>
                    <text textColor="#ffffff">动画时间最小值：</text>
                    <button id="animationTimeMinMinus" padding="0" width="100px" h='90px'>-</button>
                    <text id="animationTimeMin" textColor="#ffffff"></text>
                    <button id="animationTimeMinPlus" padding="0" width="100px" h='90px'>+</button>
                </horizontal>
                <horizontal>
                    <text textColor="#ffffff">动画时间最大值：</text>
                    <button id="animationTimeMaxMinus" padding="0"  width="100px" h='90px'>-</button>
                    <text id="animationTimeMax" textColor="#ffffff"></text>
                    <button id="animationTimeMaxPlus" padding="0" width="100px" h='90px'>+</button>
                </horizontal>
                <horizontal h="5px" bg="#ffffff"></horizontal>
                <horizontal>
                    <text textColor="#ffffff">上滑：</text>
                    <button id="upStartBtn" padding="0" width="120px" h='90px'>开始</button>
                    <button id="upStopBtn" padding="0" width="120px" h='90px'>暂停</button>
                    <text textColor="#ffffff" marginLeft="6">状态：</text>
                    <text id="upRunStatus" textColor="#ffffff">已暂停</text>
                </horizontal>
                <horizontal h="5px" bg="#ffffff"></horizontal>
                <horizontal>
                    <text textColor="#ffffff">定时开启：</text>
                    <button id="planStartBtn" padding="0" width="120px" h='90px'>开始</button>
                    <button id="planStopBtn" padding="0" width="120px" h='90px'>暂停</button>
                    <text textColor="#ffffff" marginLeft="6">状态：</text>
                    <text id="planRunStatus" textColor="#ffffff">已暂停</text>
                </horizontal>
                <horizontal h="5px" bg="#ffffff"></horizontal>
                <horizontal>
                    <button id="moveBtn" padding="0" width="120px" h='90px'>拖动</button>
                    <button id="closeBtn" padding="0" width="200px" h='90px'>关闭浮窗</button>
                    <button id="hideBtn" padding="0" width="250px" h='90px'>隐藏浮窗</button>
                </horizontal>
            </vertical>
        </frame>
    )

    // 上滑操作
    highWindow.upStartBtn.click(() => {
        setTimeout(() => {
            up.start(highWindow)
        }, 300)
    })

    highWindow.upStopBtn.click(() => {
        setTimeout(() => {
            up.stop(highWindow)
        }, 300)
    })


    highWindow.closeBtn.click(() => {
        setTimeout(() => {
            highWindow.close()
        }, 300)
    })
    highWindow.hideBtn.click(() => {
        ui.run(() => {
            // highWindow.warp.setVisibility(8)
            // highWindow.close()
            highWindow.setPosition(-deviceW, -deviceH)
            createVisibleFloatWindow()
        })
    })

    highWindow.intervalTimeMinMinus.click(() => {
        updateCommonStoreTime(INTERVAL_TIME_MIN, 'minus')
        setInit()
    })
    highWindow.intervalTimeMinPlus.click(() => {
        updateCommonStoreTime(INTERVAL_TIME_MIN, 'plus')
        setInit()
    })

    highWindow.intervalTimeMaxMinus.click(() => {
        updateCommonStoreTime(INTERVAL_TIME_MAX, 'minus')
        setInit()
    })
    highWindow.intervalTimeMaxPlus.click(() => {
        updateCommonStoreTime(INTERVAL_TIME_MAX, 'plus')
        setInit()
    })
    

    highWindow.animationTimeMinMinus.click(() => {
        updateCommonStoreTime(ANIMATION_TIME_MIN, 'minus', 10)
        setInit()
    })
    highWindow.animationTimeMinPlus.click(() => {
        updateCommonStoreTime(ANIMATION_TIME_MIN, 'plus', 10)
        setInit()
    })

    highWindow.animationTimeMaxMinus.click(() => {
        updateCommonStoreTime(ANIMATION_TIME_MAX, 'minus', 10)
        setInit()
    })
    highWindow.animationTimeMaxPlus.click(() => {
        updateCommonStoreTime(ANIMATION_TIME_MAX, 'plus', 10)
        setInit()
    })

    let upPlanTimer = null
    let upPlanStatus = 0 
    function isCurrentTimeBetween(startHour, startMinute, endHour, endMinute) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
    
        // 将开始和结束时间转换为分钟
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;
    
        // 将当前时间转换为分钟
        const currentTotalMinutes = currentHour * 60 + currentMinute;
    
        // 检查当前时间是否在指定时间之间
        // 注意：这里假设开始和结束时间是在同一天内
        return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
    }
    const planUp = () => {
        // 检测时间是否在00:01-01:00之间
        if (isCurrentTimeBetween(0, 1, 1, 0)) {
            // 回到主屏幕
            home()
            // 等待两秒
            sleep(2000)
            // 打开支付宝
            app.launch('com.eg.android.AlipayGphone')
            // 等待5秒
            sleep(5000)
            // 打开视频tab
            click('视频')
            // 等待5秒
            sleep(5000)
            // 点击上滑
            up.start(highWindow)
            upPlanStatus = 0
        } else {
            upPlanStatus = 1
            upPlanTimer && clearTimeout(upPlanTimer)
            upPlanTimer = setTimeout(() => {
                planUp()
            }, 5000)
        }
        ui.run(() => {
            highWindow.planRunStatus.setText(upPlanStatus ? '定时任务开启' : '定时任务关闭')
        })
    }

    // 定时任务开启
    highWindow.planStartBtn.click(() => {
        setTimeout(() => {
            planUp()
        }, 300)
    })
    // 定时任务关闭
    highWindow.planStopBtn.click(() => {
        setTimeout(() => {
            upPlanStatus = 0
            clearTimeout(upPlanTimer)
            ui.run(() => {
                highWindow.planRunStatus.setText(upPlanStatus ? '定时任务开启' : '定时任务关闭')
            })
        }, 300)
    })


    ui.run(() => {
        highWindow.setPosition(wx, wy)
    })



    draw('moveBtn', highWindow, highWindow, wx, wy)

    const setInit = () => {
        const commonStore = createCommonStore()
        ui.run(() => {
            highWindow.intervalTimeMin.setText(commonStore.get(INTERVAL_TIME_MIN).toString())
            highWindow.intervalTimeMax.setText(commonStore.get(INTERVAL_TIME_MAX).toString())
            highWindow.animationTimeMin.setText(commonStore.get(ANIMATION_TIME_MIN).toString())
            highWindow.animationTimeMax.setText(commonStore.get(ANIMATION_TIME_MAX).toString())
        })
    }

    setInit()
    return highWindow
}

let highWindow = createHighWindow()

const createVisibleFloatWindow = () => {
    const window = floaty.rawWindow(
        <horizontal bg="#90000000">
            <button id="showBtn" padding="0" width="120px" h='90px'>显示</button>
            <button id="drawBtn" padding="0" width="120px" h='90px'>拖动</button>
        </horizontal>
    )
    ui.run(() => {
        window.setPosition(wx, wy)
    })
    window.showBtn.click(() => {
        ui.run(() => {
            highWindow.setPosition(wx, wy)
            window.close()
        })
    })
    draw('drawBtn', window, window, wx, wy)
}


// 保持屏幕常亮
device.keepScreenDim()

setInterval(() => {}, 1000)