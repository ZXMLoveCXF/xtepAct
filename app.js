//app.js
const config = require('./config');
var util = require('./utils/util');

App({
  config: config,
  util: util,
  isAllowLogin: false, //用户是否授权了获取信息
  globalData: {

  },
  onLaunch: function () {
    console.log('---------------------------- onLaunch --------------------------------')
    //登录一次
  },
  //存入缓存
  setCache: function (key, val) {
    wx.setStorageSync(config.cachePrefix + key, val)
  },
  //获取缓存
  getCache: function (key, val) {
    var res = wx.getStorageSync(config.cachePrefix + key)
    return res
  },
  //删除缓存
  delCache: function (key) {
    wx.removeStorageSync(config.cachePrefix + key)
  },
  //服务器请求数据
  /**
   * param url 请求的URL
   * param data 请求的参数 // json 格式
   * param succCallback 请求成功的回调函数
   * param failCallback  请求失败的回调函数
   * param method 请求方式，默认GET  // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
   */
  reqServerData: function (url, data, succCallback, failCallback, method) {
    method = method ? method : 'GET'
    var header = { 'Content-Type': 'application/json' }
    if (method == 'POST') {
      header = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    wx.request({
      url: url,
      data: data,
      method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: header, // 设置请求的 header
      success: function (res) {
        // success
        if (typeof succCallback == 'function') {
          succCallback(res)
        }
      },
      fail: function (res) {
        // fail
        if (typeof failCallback == 'function') {
          failCallback(res)
        }
      }
    })
  },
  //整套的用户登录逻辑
  userLogin: function (callback) {
    var that = this

    //if( ! this.globalData.userInfo){
    //调用登录接口
    wx.login({
      success: function (res) {
        console.log('-------------------login success --------------------')
        console.log(' code -------------' + res.code)
        //请求服务器发送code
        that.reqServerData(
          config.loginUrl,
          { code: res.code },
          function (re) {
            if (re.data.status == 0) {
              //'-------------------request server getToken --------------------')
              console.log('-------------------request server getToken --------------------')
              console.log(re);
              //记录token
              that.globalData.token = re.data.data.sessionId
              that.setCache('token', re.data.data.sessionId)
              that.setCache('time',new Date().getTime())
              that.getWxUser(callback)
            } else {
              console.log(re.data.err);
            }
          },
          function () {
            // fail
            console.log('REQUEST FAIL:::' + config.loginUrl + '----------------------');
          }
        )
      },
      fail: function () {
        console.log('wx login fail');
      }
    })
    //}else{
    //    if(typeof callback == 'function'){
    //        callback(this.globalData.userInfo)
    //    }
    //}
  },
  getWxUser: function (callback) {
    //获取微信用户信息
    var that = this
    wx.getUserInfo({
      success: function (res1) {
        console.log('-------------------getUserInfo success --------------------')
        console.log(res1)
        that.isAllowLogin = true //用户是否授权了获取信息
        that.initData(res1.iv, res1.encryptedData, callback)
      },
      fail: function () {
        that.hideLoading()
        var res = wx.getSystemInfoSync()
        if (res.SDKVersion >= '1.1.0') {
          that.reLogin(callback)
        } else {
          //that.reLogin(appid, shareuid, campusid, callback)
          that.showMsgModel('', '请升级微信')
        }
        console.log('wx.getUserInfo fail')
      }
    })
  },
  //
  reLogin: function (callback) {
    var that = this
    wx.openSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          that.userLogin(callback)
        } else {
          that.reLogin(callback)
        }
      }, fail: function (res) {
        that.reLogin(callback)
      }
    })
  },
  //初始化信息
  /**
   * iv wx.getUserInfo返回的信息，可以为空
   * callback 回调函数
   */
  initData: function (iv, encryptedData, callback) {
    //向服务器发送微信用户信息
    var that = this
    var cacheToken = this.getCache('token')

    //初始化参数
    console.log('-----------------------initUser param -------------------------')
    var param = {
      token: cacheToken,
      iv: iv ? iv : '',
      encryptedData: encryptedData ? encryptedData : '',
    }
    console.log(param)

    this.reqServerData(
      config.initUserUrl,
      param,
      function (res2) {
        console.log('------------------initUser success --------------------')
        console.log('-----------------res--')
        console.log(res2);
        //'-------------------sendUserdata success --------------------'
        if (res2.statusCode == 200) {
          if (res2.data.status == 0) {
            //that.globalData.userInfo = res2.data.data.user;
            that.setCache('initdata', res2.data.data)
            if (typeof callback == 'function') {
              callback()
            }
          }else {
            console.log(res2.data.data.status)
          }
        } else if (res2.statusCode == 50021){
          console.log('------------------重新登录--------------------')
          that.userLogin(callback)
        }  else {
          console.log(res2.err)
        }
      },
      function () {
        console.log('send User Data fail')
      }
    )
  },
  //同步APP信息
  syncAppInfo: function () {
    //获取微信用户信息
    var that = this
    var cacheToken = this.getCache('token')

    this.reqServerData(
      config.baseUrl + 'app/sync',
      { token: cacheToken },
      function (res2) {
        console.log('------------------syncAppInfo success --------------------')
        console.log('-----------------res--')
        console.log(res2);
        //'-------------------sendUserdata success --------------------'
        if (res2.statusCode == 200) {
          // if (res2.data.status == 0) {
          //   //that.globalData.userInfo = res2.data.data.user;
          //   var initData = that.getCache('initdata');
          //   var app = {
          //     uuid: res2.data.data.uuid,
          //     name: res2.data.data.name,
          //     address: res2.data.data.address,
          //     logo: res2.data.data.logo,
          //     telphone: res2.data.data.telphone,
          //     style: res2.data.data.style
          //   }
          //   initData.app = app
          //   that.setCache('initdata', initData)
          // } else {
          //   console.log(res2.data.data.status)
          // }
          if (res2.data.status == 40008) {
            that.userLogin();
          }
        } else {
          console.log(res2.err)
        }
      },
      function () {
        console.log('send User Data fail')
      }
    )
  },
  //检测登录信息
  /**
   * callback 回调函数
   */
  checkLogin: function (callback) {
    var that = this
    wx.checkSession({
      success: function () {
        console.log('---------------checksession SUCC------------------')
        //看token 是否存在
        var token = that.getCache('token')
        var time = that.getCache('time')
        var nowTime = new Date().getTime()
        var loginFlg = false
        if (time == '' || nowTime - time >= 24 * 60 * 60 * 1000) { //如果当前时间比缓存的时间大于等于1天，强制性调用一次登录
          loginFlg = true
        }
        console.log('-----------checksession cache-token -------------------')
        console.log(token)
        if (token && !loginFlg) {//不需要重新登录
          //看初始化信息是否存在
          var initData = that.getCache('initdata')
          console.log('-----------checksession cache-initData -------------------')
          console.log(initData)
          if (initData) { //初始化信息存在，不用执行任何登录操作
            //用 页面参数 和 缓存参数 对比 看参数是否有变化
            that.syncAppInfo()
            if (typeof callback == 'function') {
              callback()
            }
          } else {
            //重新初始化
            that.initData('', '', callback)
          }
        } else { //需要重新登录
          that.userLogin(callback)
        }
      },
      fail: function () { //需要重新登录
        console.log('---------------checksession FAIL------------------')
        that.userLogin(callback)
      }
    })
  },
  /**
   * 显示模态窗体
   * @param string title 标题
   * @param string content 内容
   * @param bool showCancel 是否显示取消按钮
  */
  showMsgModel: function (title, content, confirmCallback, showCancel, cancelCallback) {
    showCancel = showCancel ? showCancel : false
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      success: function (res) {
        if (res.confirm) {
          //console.log('用户点击确定')
          if (typeof confirmCallback == 'function') {
            confirmCallback()
          }
        } else if (res.cancel) {
          //console.log('用户点击取消')
          if (typeof cancelCallback == 'function') {
            cancelCallback()
          }
        }
      }
    })
  },
  //显示loadding
  /**
   * @param string title 文字
   * @param bool   mask  是否遮罩
   */
  showLoading: function (title, mask) {
    title = title ? title : '加载中'
    if (wx.canIUse('showLoading')) {
      mask = false//mask!=undefined ? mask : true
      wx.showLoading({
        title: title,
        mask: mask
      })
    } else {
      wx.showToast({
        title: title,
        icon: 'loading',
        duration: 200,
        mask: mask
      })
    }
  },
  //隐藏Loadding
  hideLoading: function () {
    if (wx.canIUse('hideLoading')) {
      wx.hideLoading()
    } else {
      wx.hideToast()
    }
  },
  //结果集第一层错误信息
  resErrMsg1: function (title, res, confirmCallback, showCancel, cancelCallback) {
    showCancel = showCancel ? showCancel : false
    wx.showModal({
      title: title,
      content: res.errMsg + '(statusCode=' + res.statusCode + ')',
      showCancel: showCancel,
      success: function (res) {
        if (res.confirm) {
          //console.log('用户点击确定')
          if (typeof confirmCallback == 'function') {
            confirmCallback()
          }
        } else if (res.cancel) {
          //console.log('用户点击取消')
          if (typeof cancelCallback == 'function') {
            cancelCallback()
          }
        }
      }

    })
  },
  //结果集第二层错误信息
  resErrMsg2: function (title, res, confirmCallback, showCancel, cancelCallback) {
    showCancel = showCancel ? showCancel : false
    wx.showModal({
      title: title,
      content: res.data.err + '(' + res.data.status + ')',
      showCancel: showCancel,
      success: function (res) {
        if (res.confirm) {
          //console.log('用户点击确定')
          if (typeof confirmCallback == 'function') {
            confirmCallback()
          }
        } else if (res.cancel) {
          //console.log('用户点击取消')
          if (typeof cancelCallback == 'function') {
            cancelCallback()
          }
        }
      }
    })
  },
  //拨打电话
  makeCallPhones: function (tel) {
    wx.makePhoneCall({
      phoneNumber: tel,
      success: function (res) {
        console.log('success');
      }
    })
  }
})