// pages/vote/userinfo/userinfo.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '', //活动id
    isShowDetail: false //是否展示详情
  },

  toHome: function(){
    var that = this
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 4]
    var prevPage1 = pages[pages.length - 3]
    if (prevPage){
      wx.navigateBack({
        delta: 2
      })
    }else if(prevPage1){
      wx.navigateBack({
        delta: 1
      })
    }else {
      wx.reLaunch({
        url: '/pages/vote/detail/detail?id='+that.data.id
      })
    }
  },

  /**
   * 跳转到活动介绍页
   */
  toIntro: function () {
    var that = this
    wx.navigateTo({
      url: '../../activity/introduce/introduce?url=' + that.data.markUrl,
    })
  },

  /**
   * 获取单个用户投票详情
   */
  getDetail: function () {
    app.showLoading()
    var that = this
    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    
    //活动id
    var vid = that.data.id
    //用户id
    var uid = that.data.uid

    app.reqServerData(
      app.config.baseUrl + 'vote/user/detail/' + uid,
      {
        token: token,
        vid: vid
      },
      function (res) {
        if (res.statusCode != 200) {
          that.setData({
            isShowDetail: true
          })
          app.hideLoading()
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          that.setData({
            isShowDetail: true
          })
          app.hideLoading()
          app.resErrMsg2('获取数据失败', res)
          return
        }

        var data = res.data.data
        that.setData({
          detail: data.obj,
          endFlg: data.endFlg,
          canVoteFlg: data.canVoteFlg,
          markUrl: data.markUrl,
          imgList: data.imgList,
          sharePicUrl: data.sharePicUrl,
          title: data.title,
          cover: data.cover
        })
        wx.stopPullDownRefresh()
        that.setData({
          isShowDetail: true
        })
        wx.setNavigationBarTitle({
          title: data.obj.id+'号 '+data.obj.name
        })

        app.hideLoading()
      }
    )
  },

  /**
   * 投票
   */
  vote: function (e) {

    var that = this
    var token = app.getCache('token')
    var vid = that.data.id
    var dataset = e.currentTarget.dataset
    var uid = dataset.id

    console.log(uid)

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/user/' + uid,
      {
        token: token,
        vid: vid
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
        that.setData({
          curId: uid
        })
        wx.showToast({
          title: "投票成功",
          icon: 'success',
          duration: 2000,
          mask: true
        })
        app.setCache('fresh-vote', true)
        that.getDetail()
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var id = options.id
    var uid = options.uid
    that.setData({
      id: id ? id : '2c939d8c61fa7e5d0161ff4936900001',
      uid: uid
    })
    app.checkLogin(function () {
      that.getDetail()
    })
  },

  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },

  /**
   * 分享操作
   */
  toShare: function (e) {
    var that = this
    that.util('close')
    console.log(that.data.title)
    wx.navigateTo({
      url: '../share/share?image=' + that.data.cover
      + '&codeImage=' + that.data.detail.erweimaUrl
      + '&face=' + that.data.detail.face 
      + '&nickname=' + that.data.detail.name
      + '&title=' + that.data.title
      + '&type=' + 'vote'
    })
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
    that.util('close')
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
    var that = this
    that.getDetail()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    // that.util('close')
    this.setData({
      showModalStatus: false
    });
    var initData = app.getCache('initdata')
    var wxuser = initData.wxuser
    return {
      title: wxuser.nickname + '邀你参与[321GO]' + '投票活动',
      imageUrl: that.data.sharePicUrl,
      path: '/pages/vote/userinfo/userinfo?uid=' + that.data.uid + '&id='+that.data.id,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }

  }
})