// pages/vote/rank/rank.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
      navData: [
        { title: '最美运动女神', active: true, sign: 'beList' },
        { title: '最帅运动男神', active: false, sign: 'hanList' }
      ],
      id: '2c939d8c61fa7e5d0161ff4936900001',
      curNavIndex: 0,
      isLoadding: true, // 是否加载中
      scrollHeight: 0,
      isShowList: true,
      // listData: [
      //   {
      //     ranking: 1,
      //     face: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180308095653UpmcBVTB.png',
      //     name: '啦啦1',
      //     gender: '1',
      //     schoolName: '厦门大学1',
      //     voteNum: 11111
      //   },
      //   {
      //     ranking: 2,
      //     face: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180308095653UpmcBVTB.png',
      //     name: '啦啦1',
      //     gender: '1',
      //     schoolName: '厦门大学1',
      //     voteNum: 11111
      //   },
      //   {
      //     ranking: 2,
      //     face: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180308095653UpmcBVTB.png',
      //     name: '啦啦1',
      //     gender: '1',
      //     schoolName: '厦门大学1',
      //     voteNum: 11111
      //   },
      //   {
      //     ranking: 1,
      //     face: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180308095653UpmcBVTB.png',
      //     name: '啦啦1',
      //     gender: '0',
      //     schoolName: '厦门大学1',
      //     voteNum: 11111
      //   },
      //   {
      //     ranking: 6,
      //     face: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180308095653UpmcBVTB.png',
      //     name: '啦啦1',
      //     gender: '1',
      //     schoolName: '厦门大学1',
      //     voteNum: 11111
      //   }
      // ]
  },

  /**
   * 菜单切换
   */
  switchNavData: function (e) {

    var that = this
    var dataset = e.currentTarget.dataset

    //菜单焦点变化
    var curNavIndex = dataset.index

    if(curNavIndex == that.data.curNavIndex){
      return
    }

    app.showLoading()

    that.setData({
      listData: [],
      isLoadding: true
    })

    var navData = that.data.navData
    for (var i = 0, len = navData.length; i < len; ++i) {
      if (i == curNavIndex) {
        navData[i].active = true
      } else {
        navData[i].active = false
      }
    }

    that.setData({
      navData: navData,
      curNavIndex: curNavIndex
    });

    //页面内容数据变化
    that.getList()

  },

  /**
   * 中奖名单
   */
  getList: function () {

    var that = this

    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    var vid = that.data.id
    var gender = that.data.curNavIndex

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/lottery/list',
      {
        token: token,
        vid: vid,
        gender: gender
      },
      function (res) {

        app.hideLoading()

        if (res.statusCode != 200) {
          that.setData({
            isShowList: false
          })
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          that.setData({
            isShowList: false
          })
          app.resErrMsg2('获取数据失败', res)
          return
        }

        var data = res.data.data
        var listData = data.list
        var viewListData = []

        that.setData({
          isShowList: listData.length == 0 ? false : true
        })

        for (var i = 0; i < listData.length; i++) {
          var item = listData[i]
          var viteItem = {
            ranking: item.ranking,
            face: item.face,
            gender: item.gender,
            voteNum: item.voteNum,
            name: item.name,
            schoolName: item.schoolName
          }
          viewListData.push(viteItem)
        }

        //设置页面数据
        that.setData({
          listData: viewListData,
          isLoadding: false
        })

      }
    )
  },

  /**
   * 下拉刷新，加载更多
   */
  onReachBottom: function (e) {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        })
      }
    })
    app.checkLogin(function () {
      that.getList()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})