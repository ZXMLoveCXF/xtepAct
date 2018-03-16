// pages/mine/mine.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {},
    hiddenFlg: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.getDetail()
  },

  toShop: function(){
    wx.navigateTo({
      url: '../activity/introduce/introduce?url=' + 'https://weixin.xtep.com.cn/mobile/4/32147?vid=37844'
    })
  },

  to321go: function () {
    wx.navigateTo({
      url: '../activity/introduce/introduce?url=' + 'https://data.321go.com/intro'
    })
  },

  /**
   * 跳转到活动列表
   */
  myAct: function(e){

    var dataset = e.currentTarget.dataset
    var type = dataset.type

    wx.navigateTo({
      url: 'actList/actList?type='+type
    })
  },

  /**
   * 获取个人详情
   */
  getDetail: function (id) {
    var that = this
    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    //请求活动详情
    app.reqServerData(
      app.config.baseUrl + 'user/profile/',
      {
        token: token
      },
      function (res) {
        if (res.statusCode != 200) {
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          app.resErrMsg2('获取数据失败', res)
          return
        }

        var data = res.data.data
        console.log(data)
        that.setData({
          joinNum: data.joinNum,
          winningNum: data.winningNum,
          face: data.wxuser.face,
          nickname: data.wxuser.nickname,
          hiddenFlg: data.hiddenFlg
        })
      }
    )
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

  /**
   * 用户点击右上角分享
  onShareAppMessage: function () {

  } */
})