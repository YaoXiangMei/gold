const { deviceW, deviceH } = require('./config.js')

// 获取状态栏高度
const getStatusBarHeight = () => {
    const resourceId = context.getResources().getIdentifier('status_bar_height', 'dimen', 'android')
    let statusBarHeight = 0
    if (resourceId > 0) {
        statusBarHeight = context.getResources().getDimensionPixelSize(resourceId)
    } else {
        // 这里的density是屏幕密度，可以通过device.info.density获取。
        // 25dp是状态栏的标准高度，单位是dp（密度无关像素），通过乘以屏幕密度可以转换成像素值。
        statusBarHeight = Math.round(25 * device.info.density)
    }
    return statusBarHeight
}

// 获取顶部导航栏的高度
const getNavigationBarHeight = () => {
    const resourceId = context.getResources().getIdentifier('navigation_bar_height', 'dimen', 'android')
    let navigationBarHeight = 0
    if (resourceId > 0) {
        navigationBarHeight = context.getResources().getDimensionPixelSize(resourceId);
    }
    return navigationBarHeight
}

// 再次执行时间间隔
const INTERVAL_TIME_MIN = 'INTERVAL_TIME_MIN'
const INTERVAL_TIME_MAX = 'INTERVAL_TIME_MAX'
const intervalTimeMinDefault = 10000
const intervalTimeMaxDefault = 15000
// 动画运行时间
const ANIMATION_TIME_MIN = 'ANIMATION_TIME_MIN'
const ANIMATION_TIME_MAX = 'ANIMATION_TIME_MAX'
const animationTimeMinDefault = 110
const animationTimeMaxDefault = 300

// 支付宝点赞的随机数
const ALIPAY_3_OPERATE_INTERVAL_MAX = 'ALIPAY_3_OPERATE_INTERVAL_MAX'
const alipay3OperateIntervalMaxDefault = 0 // 随机1 - x之间的数，0表示不随机

// 支付宝是否需要切换账号
const ALIPAY_SWITCH_ACCOUNT = 'ALIPAY_SWITCH_ACCOUNT'
const ALIPAY_SWITCH_ACCOUNT_DEFAULT = 0 // 0表示不切换，1表示切换

const createCommonStore = () => {
    const storage = storages.create('common')
    storage.get(INTERVAL_TIME_MIN) || storage.put(INTERVAL_TIME_MIN, intervalTimeMinDefault)
    storage.get(INTERVAL_TIME_MAX) || storage.put(INTERVAL_TIME_MAX, intervalTimeMaxDefault)
    storage.get(ANIMATION_TIME_MIN) || storage.put(ANIMATION_TIME_MIN, animationTimeMinDefault)
    storage.get(ANIMATION_TIME_MAX) || storage.put(ANIMATION_TIME_MAX, animationTimeMaxDefault)

    if (storage.get(ALIPAY_3_OPERATE_INTERVAL_MAX) === undefined) {
        storage.put(ALIPAY_3_OPERATE_INTERVAL_MAX, alipay3OperateIntervalMaxDefault)
    } else {
        storage.put(ALIPAY_3_OPERATE_INTERVAL_MAX, storage.get(ALIPAY_3_OPERATE_INTERVAL_MAX))
    }
    // storage.get(ALIPAY_3_OPERATE_INTERVAL_MAX) || storage.put(ALIPAY_3_OPERATE_INTERVAL_MAX, alipay3OperateIntervalMaxDefault)
    if (storage.get(ALIPAY_SWITCH_ACCOUNT) === undefined) {
        storage.put(ALIPAY_SWITCH_ACCOUNT, ALIPAY_SWITCH_ACCOUNT_DEFAULT)
    } else {
        storage.put(ALIPAY_SWITCH_ACCOUNT, storage.get(ALIPAY_SWITCH_ACCOUNT))
    }
    return storage
}


const updateCommonStoreTime = (field, operation, step) => {
    const fields = [INTERVAL_TIME_MIN, INTERVAL_TIME_MAX, ANIMATION_TIME_MIN, ANIMATION_TIME_MAX, ALIPAY_3_OPERATE_INTERVAL_MAX]
    const operations = ['plus', 'minus']
    if (fields.indexOf(field) === -1) return toast('字段名不对')
    if (operations.indexOf(operation) === -1) return toast('操作符不对')
    const storage = createCommonStore()
    const value = storage.get(field)
    if (value === undefined) return toast('没有这个字段')
    if (step == undefined) {
        step = 1000
    }
    const newValue = operation === 'plus' ? value + step : value - step
    if (field !== ALIPAY_3_OPERATE_INTERVAL_MAX && newValue <= 0) return toast('不能小于等于0')
    // 支付宝点赞的随机数
    if (field === ALIPAY_3_OPERATE_INTERVAL_MAX && newValue < 0) return toast('不能小于0')

    if (field === INTERVAL_TIME_MIN && newValue > storage.get(INTERVAL_TIME_MAX)) return toast('最小值不能大于最大值')
    if (field === INTERVAL_TIME_MAX && newValue < storage.get(INTERVAL_TIME_MIN)) return toast('最大值不能小于最小值')
    if (field === ANIMATION_TIME_MIN && newValue > storage.get(ANIMATION_TIME_MAX)) return toast('最小值不能大于最大值')
    if (field === ANIMATION_TIME_MAX && newValue < storage.get(ANIMATION_TIME_MIN)) return toast('最大值不能小于最小值')
    storage.put(field, newValue)
}


const draw = (control, targetControl, floatWindowControl, initX, initY) => {

    let downX = 0
    let downY = 0
    let distX = 0
    let distY = 0

    floatWindowControl[control].setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                downX = event.getRawX()
                downY = event.getRawY()
                return true
            case event.ACTION_MOVE:
                distX = event.getRawX() - downX
                distY = event.getRawY() - downY
                targetControl.setPosition(initX + distX, initY + distY)
                return true
            case event.ACTION_UP:
                initX += distX
                initY += distY
                return true
        }
        return true
    })
}

// 关闭app
function killApp(appName) {//填写包名或app名称都可以
    var name = getPackageName(appName);//通过app名称获取包名
    if(!name){//如果无法获取到包名，判断是否填写的就是包名
        if(getAppName(appName)){
            name = appName;//如果填写的就是包名，将包名赋值给变量
        }else{
            return false;
        } 
    }

    app.openAppSetting(name);//通过包名打开应用的详情页(设置页)
    text(app.getAppName(name)).waitFor();//通过包名获取已安装的应用名称，判断是否已经跳转至该app的应用设置界面
    sleep(500);//稍微休息一下，不然看不到运行过程，自己用时可以删除这行
    let stopBtn = textMatches(/(.*强.*|.*停.*|.*结.*)/).findOne();//在app的应用设置界面找寻包含“强”，“停”，“结”，“行”的控件


    if (stopBtn.enabled()) {//判断控件是否已启用（想要关闭的app是否运行）
        stopBtn.parent().click();//结束应用的控件如果无法点击，需要在布局中找寻它的父控件，如果还无法点击，再上一级控件，本案例就是控件无法点击
        sleep(2000)
        const sure = textMatches(/(.*确定.*)/).findOne()
        const bounds = sure.bounds()
        sleep(2000)
        click(bounds.centerX(),bounds.centerY())
        log(app.getAppName(name) + '应用已被关闭')
        sleep(2000)
        back()
        sleep(2000)
    } else {
        log(app.getAppName(name) + '应用不能被正常关闭或不在后台运行')
        back();
        sleep(2000)
    }
}

// 关闭app
function closeCurrentApp() {
    const startY = random(deviceH - 500 - 100, deviceH - 600) // 起始位置y坐标
    const endY = random(200, 500)

    // 打开多任务栏
   gestures([0, 300, [0, deviceH], [deviceW - 100, deviceH - 600], [deviceW - 200, deviceH - 500]])
   sleep(2000)
   // 关闭最右的任务
   console.log(deviceW - 30, startY, deviceW - 25, endY)
   swipe(deviceW - 30, startY, deviceW - 25, endY, 200)
   sleep(2000)
   // 回到主页
   home()
}

// 打开支付宝
function openAlipay() {
    // 等待3秒
    sleep(3000)
    // 回到主屏幕
    home()
    // 等待两秒
    sleep(3000)
    // 打开支付宝
    app.launch('com.eg.android.AlipayGphone')
    // 等待5秒
    sleep(5000)
    // 打开视频tab
    click('视频')
    // 等待5秒
    sleep(5000)
    // 点击x掉签到弹窗
    click(5, deviceH / 2)
    // 等待3秒
    sleep(3000)
}

// 重启支付宝
function restartAlipay() {
    // 等待3秒
    sleep(3000)
    home()
    // 等待3秒
    sleep(3000)
    // 关闭支付宝
    killApp('com.eg.android.AlipayGphone')
    // 等待3秒
    home()
    // 等待3秒
    sleep(3000)
    // 打开支付宝
    openAlipay()
}

// 重新打开支付宝
function resetOpenAlipay() {
    // 等待3秒
    sleep(3000)
    closeCurrentApp()
    // 等待3秒
    sleep(3000)
    home()
    // 等待3秒
    sleep(3000)
    // 打开支付宝
    openAlipay()
}

let levelPlayCount = 0
// 检测如果在支付宝并且不是在播放页面，则重新打开支付宝
function checkAlipayPlay() {
    // console.log('checkAlipayPlay')
    const packageName = currentPackage()
    // 不是支付宝包名，直接返回
    if (packageName !== 'com.eg.android.AlipayGphone') return

    // 如果不在播放页面，则重新打开支付宝
    const  tabContainer = id('com.alipay.android.living.dynamic:id/tab_container').exists()
    if (tabContainer) return

    levelPlayCount++
    
    // 累计到了5次，则重启支付宝
    if (levelPlayCount > 5) {
        levelPlayCount = 0
        restartAlipay()
    }
}

module.exports = {
    getStatusBarHeight,
    getNavigationBarHeight,
    createCommonStore,
    updateCommonStoreTime,
    INTERVAL_TIME_MIN,
    INTERVAL_TIME_MAX,
    ANIMATION_TIME_MIN,
    ANIMATION_TIME_MAX,
    ALIPAY_3_OPERATE_INTERVAL_MAX,
    ALIPAY_SWITCH_ACCOUNT,
    draw,
    killApp,
    closeCurrentApp,
    openAlipay,
    restartAlipay,
    resetOpenAlipay,
    checkAlipayPlay
}