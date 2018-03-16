const dateUtil = require('../../../utils/util.js');

//获取应用实例
var app = getApp()

Page({
  data: {
    id: '',
    phone: '',
    code: '',
    isShow: true,
    countdown: 60,
    isGetCode: false,
    isClick: false
  },
  /**
   * 60s倒计时方法
   */
  settime: function(){
    var that = this
    if (that.data.countdown == 0) {
      that.setData({
        isShow: true,
        countdown: 60
      })
      return;
    } else {
      var time = that.data.countdown - 1
      that.setData({
        isShow: false,
        countdown: time
      })
      console.log(time)
    }
    setTimeout(function () {
      that.settime(that)
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //  这里要注意，微信的scroll-view必须要设置高度才能监听滚动事件，所以，需要在页面的onLoad事件中给scroll-view的高度赋值
    var that = this
    var id = options.id
    var authPhone = app.getCache('auth-phone')
    console.log('--------------------auth-phone--------------------------')
    console.log(authPhone)
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          id: id,
          scrollHeight: (res.windowHeight - 50),
          phone: !authPhone?'':authPhone,
          navData: [
            { title: '进行中', active: true, sign: 'campuslist' },
            { title: '已结束', active: false, sign: 'teacherlist' }
          ]
        });
      }
    })
  },
  /**
   * 验证码60s倒计时
   */
  clickVerify: function () {
    var that = this;
    // 将获取验证码按钮隐藏60s，60s后再次显示
    that.setData({
      isShow: (!that.data.isShow)  //false
    })
    that.settime();
  },
  /**
   * 设置按钮是否可点击
   */
  setClick: function (isClick) {
    var that = this
    that.setData({
      isClick: isClick
    })
  },
  /**
   * 手机号绑定
   */
  phoneInput: function(e){
    this.setData({
      phone: e.detail.value
    })
  },
  /**
   * 验证码绑定
   */
  codeInput: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  /**
   * 设置验证码按钮是否可点击
   */
  setGetCode: function(isGetCode){
    var that = this
    that.setData({
      isGetCode: isGetCode
    })
  },
  /**
   * 激活手机号+报名活动
   */
  toBind: function(e){
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    console.log('form发生了submit事件，携带formid为：', e.detail.formId)
    var that = this
    that.setClick(true)
    var token = app.getCache('token')
    if (this.validatemobile(this.data.phone) && this.validatecode(this.data.code)){
      app.showLoading('保存中', true)
      app.reqServerData(
        app.config.baseUrl + 'user/bindmobile/',
        {
          token: token,
          mobile: that.data.phone,
          code: that.data.code
        },
        function (res) {
          console.log(res)
          if (res.statusCode != 200) {
            app.hideLoading()
            that.setClick(false)
            app.resErrMsg1('请求错误', res)
            return
          }
          if (res.data.status != 0) {
            app.hideLoading()
            that.setClick(false)
            app.resErrMsg2('激活手机号失败', res)
            return
          }
          that.toJoin(e.detail.formId)
        },
        function(){},
        'POST'
      )
    }
  },
  /**
   * 报名活动
   */
  toJoin: function (formId) {
    var that = this
    var token = app.getCache('token')
    app.reqServerData(
      app.config.baseUrl + 'active/join/',
      {
        token: token,
        activeid: that.data.id,
        formid: formId
      },
      function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          app.hideLoading()
          that.setClick(false)
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          app.hideLoading()
          that.setClick(false)
          app.resErrMsg2('报名失败', res)
          return
        }
        var data = res.data.data.obj
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上一个页面
        var actObj = prevPage.data.act
        var taskList = prevPage.data.taskList
        actObj.status = '2'
        actObj.statusStr = '已参与'
        actObj.bgColor = '#54d386'
        actObj.userCount = data.userNum
        taskList[0].value = data.userNum
        taskList[0].per = data.userPercent
        taskList[0].taskClass = 'on'
        if (taskList.length>1) {
           taskList[1].taskClass = 'on'
        }
        
        //判断活动类型,1表示用户数满足最少用户，2表示用户数累加
        if (data.activeType == '2') {
          actObj.prizeNum = data.lotteryPrizeNum
          actObj.resCount = data.diffUserNum
        }

        prevPage.setData({
          act: actObj,
          taskList: taskList,
          btn: {
            btnName: '待开奖',
            btnBgColor: '#e8e8e8',
            btnColor: '#7f7f7f',
          },
        })
        //修改首页的活动状态
        var curact = app.getCache("curact")
        if(curact){
          //如果缓存中的活动id与当前页面的活动id想等
          if(curact.id == that.data.id){
            var actData = {
              status : '2',
              statusStr : '已参与',
              bgColor : '#54d386',
              userCount: data.userNum
            }
            curact.isChange = true
            curact.data = actData
            app.setCache('curact', curact)
          }
        }

        app.setCache('join-activity', true)
        wx.navigateBack()
      }
    )
  },
  /**
   * 验证手机号
   */
  validatemobile: function (mobile) {
    if (mobile.length == 0) {
      app.showMsgModel('提示', '未输入手机号！')
      return false;
    }
    if (mobile.length != 11) {
      app.showMsgModel('提示', '手机号长度有误！')
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mobile)) {
      app.showMsgModel('提示', '手机号格式有误！')
      return false;
    }
    return true;
  },
  /**
   * 验证手机验证码
   */
  validatecode: function (code) {
    if (code.length == 0) {
      app.showMsgModel('提示', '未输入验证码！')
      return false;
    }
    if (code.length != 4) {
      app.showMsgModel('提示', '验证码长度有误！')
      return false;
    }
    return true;
  },
  /**
   * 获取手机验证码
   */
  getCode: function(){
    var that = this
    that.setGetCode(true)
    var token = app.getCache('token')
    if (!this.validatemobile(this.data.phone)){
      that.setGetCode(false)
      return
    }
    app.reqServerData(
      app.config.baseUrl + 'sms/sendcode/',
      {
        token: token,
        mobile: that.data.phone
      },
      function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          that.setGetCode(false)
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          that.setGetCode(false)
          app.resErrMsg2('发送验证码失败', res)
          return
        }
        that.clickVerify()
        wx.showToast({
          title: '验证码发送成功',
          icon: 'success',
          duration: 2000
        })
        that.setGetCode(false)
      }
    )
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this
    that.setClick(false)
    app.checkLogin(function () {
      
    })
  },
  onHide: function () {
    // 页面隐藏
    var that = this
    that.setData({
      countdown: 0
    })
  },
  onUnload: function () {
    // 页面关闭
    var that = this
    that.setData({
      countdown: 0
    })
  },
})