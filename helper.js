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
const intervalTimeMinDefault = 2000
const intervalTimeMaxDefault = 9000
// 动画运行时间
const ANIMATION_TIME_MIN = 'ANIMATION_TIME_MIN'
const ANIMATION_TIME_MAX = 'ANIMATION_TIME_MAX'
const animationTimeMinDefault = 110
const animationTimeMaxDefault = 130

// 支付宝点赞的随机数
const ALIPAY_3_OPERATE_INTERVAL_MAX = 'ALIPAY_3_OPERATE_INTERVAL_MAX'
const alipay3OperateIntervalMaxDefault = 5 // 随机1 - x之间的数

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
    draw
}