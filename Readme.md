# 文档 
[文档链接](http://doc.autoxjs.com/#/)
[文档链接](https://docs.autojs6.com/#/overview)

```javascript
// 每日签到弹窗的位置
    // const top = (deviceH * 0.76302) + getStatusBarHeight()
    // 提示重新开始新一轮的弹窗位置
    const top = (deviceH * 0.69302) + getStatusBarHeight()
    var w = floaty.window(
        <frame gravity="center" bg="#ffffff">
          <text id="text">悬浮文字</text>
        </frame>
      );
      console.log(top)
      w.setPosition(deviceW / 2, top)
```