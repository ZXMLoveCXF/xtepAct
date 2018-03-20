// pages/activity/result/result.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:{},
    noWinImg:'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180116151805VIgoCSle.png',
    userList:[],
    isShowList:true,
    isLoadding: true,
    showModalStatus: false,
    showModalStatus1: false,
    listWidth: 690,
    addressBtnStr: '点击填写收货信息',
    joinFlg: false,
    receiveBtnColor: '#4db0f4',
    receiveBtnName: '立即兑奖',
    isReceive: false //是否兑奖
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  powerDrawer1: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util1(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });

    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;

    // 第3步：执行第一组动画：Y轴偏移240px后(盒子高度是240px)，停  
    animation.translateY(240).step();

    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {
      // 执行第二组动画：Y轴不偏移，停  
      animation.translateY(0).step()
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setData({
        animationData: animation
      })
      //关闭抽屉  
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)

    // 显示抽屉  
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  },
  util1: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData1: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData1: animation
      }) 
      //关闭抽屉  
      if (currentStatu == "close") {
        this.setData({
          showModalStatus1: false
        });
      }
    }.bind(this), 200)

    // 显示抽屉  
    if (currentStatu == "open") {
      this.setData({
        showModalStatus1: true
      });
    }
  },
  toAddress: function (e) {
    var that = this
    wx.navigateTo({
      url: '../address/address?id=' + that.data.id
    })
  },
  getResult: function(id){
    var that = this
    var type = that.data.type
    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    var url = type&&type=='1'?'active/ing/detail/':'active/end/detail/'
    //请求中奖详情
    app.reqServerData(
      app.config.baseUrl + url + id,
      {
        token: token
      },
      function (res) {
        var resultObj = {}
        //hide loadding
        app.hideLoading()
        console.log(res)
        if (res.statusCode != 200) {
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          //未达到最低参与用户数
          if (res.data.status == '50014'){
            resultObj = {
              isWin: false
            }
            that.setData({
              isShowList: false,
              result: resultObj,
              isLoadding: false
            })
            // app.showMsgModel('提示', res.data.err)
          }else{
            app.resErrMsg2('获取数据失败', res)
          }
          return
        }

        var data = res.data.data

        //设置页面数据
        if (data.winningFlg || data.winningFlg == 1){
          resultObj = {
            id: data.gift.id,
            cover: data.gift.cover,
            title: data.gift.title,
            isWin: data.winningFlg,
            hadAddrFlg: data.hadAddrFlg
          }
        }else {
          resultObj = {
            isWin: data.winningFlg
          }
        }
        
        that.setData({
          result: resultObj,
          userList: data.list,
          isLoadding: false,
          codeImage: data.lotteryPicUrl,
          listWidth: data.list.length<5?(138*data.list.length):690,
          addressBtnStr: '点击'+(data.hadAddrFlg?'查看':'填写')+'收货地址',
          joinFlg: data.joinFlg,
          receiveBtnColor: data.receiveFlg && data.receiveFlg == 1 ? '#c1c1c1' : '#4db0f4',
          receiveBtnName: data.receiveFlg && data.receiveFlg == 1 ? '已兑奖' : '立即兑奖',
          isReceive: data.receiveFlg && data.receiveFlg == 1 ? 'none' : '',
          kilometre: data.kilometre
        })
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.showLoading()
    var that = this
    var id = options.id
    var type = options.type 
    that.setData({
      type: type?type:'2'
    })

    console.log(that.data.type)

    //  这里要注意，微信的scroll-view必须要设置高度才能监听滚动事件，所以，需要在页面的onLoad事件中给scroll-view的高度赋值
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          id: id,
          scrollHeight: (res.windowHeight-50)
        });
      }
    })
    app.checkLogin(function () {
      that.getResult(id)
    })
  },
  toList: function (e) {
    // app.setCache('isFresh', true)
    // wx.navigateBack({
    //   delta: 1
    // })
    wx.reLaunch({
      url: '../../index/index'
    })
  },
  toDetail: function (e) {
    var that = this
    var id = that.data.id
    wx.redirectTo({
      url: '../detail/detail?id=' + id
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
    var that = this
    var isSaveAddress = app.getCache('save-address')
    if (isSaveAddress){
      wx.showToast({
        title: "提交成功",
        icon: 'success',
        duration: 1000
      })
      app.delCache('save-address')
    }
    that.setData({
      showModalStatus: false,
      showModalStatus1: false
    });
  },

  /**
   * 复选框事件
   */
  checkboxChange: function(e){
    var that = this
    that.setData({
      checkSelect: e.detail.value.length>0?true:false
    })
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
    * 分享操作
    */
  toShare: function (e) {
    var that = this
    wx.navigateTo({
      url: '../share/share?cover=' + that.data.result.cover + '&title=' + that.data.result.title
      +'&codeImage=' + that.data.codeImage + '&type=' + 'gift'
    })
  },
  /**
    * 兑奖
    */
  receive: function(){
    var that = this
    var checkSelect = that.data.checkSelect
    if (!checkSelect){
      return
    }
    var token = app.getCache('token')
    that.util1('close')
    app.reqServerData(
      app.config.baseUrl + 'active/receive/gift/' + that.data.id,
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
        that.setData({
          receiveBtnColor: '#c1c1c1',
          receiveBtnName: '已兑奖',
          isReceive: 'none'
        })
        wx.showToast({
          title: "兑奖成功",
          icon: 'success',
          duration: 1000
        })
      }
    )
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    var initData = app.getCache('initdata')
    var wxuser = initData.wxuser
    return {
      title: wxuser.nickname + '邀你参与[321GO]' + '活动',
      // imageUrl: '',
      path: '/pages/index/index',
      success: function (res) {
        // 分享成功
        console.log('---share succ----')
      },
      fail: function (res) {
        // 分享失败
        console.log('---share fail----')
      }
    }
  }
})