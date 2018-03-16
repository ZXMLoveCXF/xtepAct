// pages/activity/address/address.js

//获取应用实例
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isDisabled: false,
    showModalStatus: false,
    isLoadding: true,
    defaultMark: '请输入备注',
  },
  /**
   * 初始化活动地址
   */
  initAddress: function () {
    var that = this
    var token = app.getCache('token')
    app.reqServerData(
      app.config.baseUrl + 'active/address/',
      {
        token: token,
        activeid: that.data.id
      },
      function (res) {
        console.log("--------------------初始化活动地址-----------------------")
        console.log(res)
        app.hideLoading()
        if (res.statusCode != 200) {
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          app.resErrMsg2('获取数据失败', res)
          return
        }
        var data = res.data.data
        if (data.defaultMark){
          that.setData({
            defaultMark: data.defaultMark
          })
        }
        
        //如果存在历史地址
        if (data.hadAddressFlg){
          that.setData({
            formData: data.obj,
            isLoadding: false,
            defaultMark: data.defaultMark
          })
        }else {
          //调用微信的获取绑定地址的方法
          that.setData({
            isLoadding: false
          })
          wx.chooseAddress({
            success: function (res) {
              console.log('-----------------微信收货地址--------------------------')
              console.log(res)
              var addressInfo = (res.provinceName?res.provinceName:'') 
                  + (res.cityName?res.cityName:'') 
                  + (res.countyName?res.countyName:'') 
                  + (res.detailInfo?res.detailInfo:'')
              that.setData({
                formData: {
                  contact: res.userName,
                  phone: res.telNumber,
                  address: addressInfo
                }
              })
            },fail: function(res){
              that.setData({
                isLoadding: false
              })
            }
          })
        }
      }
    )
  },
  /**
   * 获取用户的收货地址
   */
  getAddress: function(){
    var that = this
    var token = app.getCache('token')
    app.showLoading()
    app.reqServerData(
      app.config.baseUrl + 'active/address/detail/',
      {
        token: token,
        activeid: that.data.id
      },
      function (res) {
        console.log("----------------------获取用户的收货地址--------------------------")
        console.log(res)
        if (res.statusCode != 200) {
          app.hideLoading()
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          app.hideLoading()
          app.resErrMsg2('获取数据失败', res)
          return
        }
        var data = res.data.data
        console.log(data)
        if (!data.obj.phone){
          that.initAddress()
          that.setData({
            showModalStatus: true
          })
        }else{
          that.setData({
            formData: data.obj,
            isDisabled: true,
            isLoadding: false
          })
          app.hideLoading()
        }
      }
    )
  },
  /**
   * 提交表单数据
   */
  formSubmit: function (e) {
    var that = this
    app.showLoading('提交中',true)
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    console.log('form发生了submit事件，携带formid为：', e.detail.formId)

    if (!that.checkData(e.detail.value)){
      app.hideLoading()
      return
    }
    
    var formData = e.detail.value
    var token = app.getCache('token')
    formData.token = token
    formData.activeid = that.data.id
    app.reqServerData(
      app.config.baseUrl + 'active/address/save/',
      formData,
      function (res) {
        //hide loadding
        app.hideLoading()
        console.log(res)
        if (res.statusCode != 200) {
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          app.resErrMsg2('获取数据失败', res)
          return
        }
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2]; //上一个页面
        if(prevPage){
          prevPage.setData({
            addressBtnStr: '点击查看收货地址'
          })
          app.setCache('save-address', true)
          wx.navigateBack()
        }
      },
      function(res){
        app.showMsgModel('提示', '请求失败')
      },
      'POST'
    )
  },
  /**
   * 验证表单参数
   */
  checkData:function(data){
    var that = this
    if (that.validatemcontact(data.contact) && that.validatemobile(data.phone) && that.validatemaddress(data.address) 
      && that.validatemark(data.mark)){
      return true
    }
    return false
  },
  /**
   * 验证联系人
   */
  validatemcontact: function (contact) {
    if (contact.length == 0) {
      app.showMsgModel('提示', '请输入联系人')
      return false;
    }
    return true;
  },
  /**
   * 验证地址
   */
  validatemaddress: function (address) {
    if (address.length == 0) {
      app.showMsgModel('提示', '请输入地址')
      return false;
    }
    return true;
  },
  /**
   * 验证备注
   */
  validatemark: function (mark) {
    if (mark.length == 0) {
      app.showMsgModel('提示', '请输入备注')
      return false;
    }
    return true;
  },
  /**
   * 验证手机号
   */
  validatemobile: function (phone) {
    if (phone.length == 0) {
      app.showMsgModel('提示', '请输入手机号')
      return false;
    }
    if (phone.length != 11) {
      app.showMsgModel('提示', '手机号长度不对哦~')
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(phone)) {
      app.showMsgModel('提示', '手机号格式不对哦~')
      return false;
    }
    return true;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //  这里要注意，微信的scroll-view必须要设置高度才能监听滚动事件，所以，需要在页面的onLoad事件中给scroll-view的高度赋值
    var that = this;
    var id = options.id
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          id: id,
          scrollHeight: (res.windowHeight),
        });
      }
    })
    var that = this
    app.checkLogin(function () {
      that.getAddress()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})