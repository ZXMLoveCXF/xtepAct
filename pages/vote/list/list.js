// pages/vote/list/list.js
// 获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 0, //总数
    pagesize: 10, //每页显示多少条
    curpage: 1, //当前页码
    isNeedScrollLoad: true, // 是否需要滚动加载，默认true
    isLoadding: true, // 是否加载中
    listData: [],
    scrollHeight: 0,
    isShowList: true,
    statusData: [
      { content: '进行中', status: '1', bgColor: '#54d386' },
      { content: '已结束', status: '2', bgColor: '#949494' }
    ]
  },

  /**
   * 活动预告
   */
  getList: function (page, isAppend) {

    app.showLoading()

    var that = this
    page = parseInt(page)
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/list',
      {
        token: token,
        page: page
      },
      function (res) {

        if (res.statusCode != 200) {
          that.setData({
            isShowList: false
          })
          app.hideLoading()
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          that.setData({
            isShowList: false
          })
          app.hideLoading()
          app.resErrMsg2('获取数据失败', res)
          return
        }

        var data = res.data.data
        var total = data.page.totalPages // 总页数
        var listData = data.list
        var viewListData = []

        for (var i = 0; i < listData.length; i++) {
          var item = listData[i]
          var statusObj = that.getStatus(item.status)
          var viteItem = {
            id: item.id,
            image: item.image,
            status: item.status,
            statusStr: statusObj.content,
            bgColor: statusObj.bgColor,
            startTime: item.startTime,
            endTime: item.endTime,
            userCount: item.userCount
          }
          viewListData.push(viteItem)
        }

        //是否拼接数据
        if (isAppend) {
          viewListData = that.data.listData.concat(viewListData)
        }

        if (page == 1 && listData.length == 0) {
          that.setData({
            isShowList: false
          })
        }

        //设置页面数据
        var curpage = that.data.curpage
        curpage = page
        that.setData({
          curpage: curpage,
          listData: viewListData,
          isNeedScrollLoad: total > page,
          isLoadding: false
        })
        app.hideLoading()

      }
    )
  },

  /**
   * 跳转活动详情页
   */
  toDetail: function (e) {

    var that = this
    var dataset = e.currentTarget.dataset
    var curStatus = dataset.status
    var curId = dataset.id

    wx.navigateTo({
      url: '/pages/vote/detail/detail?id=' + curId
    })

  },

  /**
   * 下拉刷新，加载更多
   */
  onReachBottom: function (e) {

    //是否需要滚动加载数据
    if (!this.data.isNeedScrollLoad) {
      return
    }

    //是否正在加载中
    if (this.data.isLoadding) {
      return
    }

    //加载数据
    var curpage = this.data.curpage
    curpage = curpage + 1

    var that = this
    that.loadPageData(curpage, true)
  },

  /**
   * 加载数据
   */
  loadPageData: function (page, isAppend) {
    this.getList(page, isAppend)
  },

  /**
   * 活动状态
   */
  getStatus: function (status) {
    var that = this
    for (var i = 1; i < that.data.statusData.length + 1; i++) {
      if (i == status) {
        return that.data.statusData[i - 1]
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    app.showLoading()

    var that = this

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight,
        })
      }
    })

    app.checkLogin(function () {
      that.loadPageData(1)
    })

  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    // 页面显示
    var that = this
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
})