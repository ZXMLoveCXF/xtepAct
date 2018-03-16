// const util = require('../../utils/util.js');

// 获取应用实例
var app = getApp()

Page({
  data: {
    navData: [
      { title: '活动预告', active: false, sign: 'preList' },
      { title: '进行中', active: true, sign: 'ingList' },
      { title: '已结束', active: false, sign: 'endList' }
    ],
    curNavIndex: 1, // 当前tab索引
    curNavName: '进行中的活动', // 当前tab选中的名称
    preListData: [], //活动预告活动列表
    ingListData: [], // 进行中活动列表
    endListData: [], // 已结束活动列表
    hasMore: true, // !true?"没有更多数据了":''
    scrollHeight: 0, // 页面高度
    total: 0, // 总数
    pagesize: 10, // 每页显示多少条
    curpages: [1, 1, 1], // 当前页码
    isNeedScrollLoad: true, // 是否需要滚动加载，默认true
    isLoadding: true, // 是否加载中
    isShowList: true, // 是否展示列表,
    showLoading: false
  },

  /**
   * 顶部菜单切换
   */
  switchNavData: function (e) {

    var that = this
    var dataset = e.currentTarget.dataset

    //菜单焦点变化
    var curNavIndex = dataset.index

    that.setData({
      isShowList: true,
      isLoadding: true
    })

    var navData = that.data.navData
    for (var i = 0, len = navData.length; i < len; ++i) {
      if (i == curNavIndex) {
        navData[i].active = true
        that.setData({
          curNavName: navData[i].title + (navData[i].title == '活动预告'?'':'的活动')
        }); 
      } else {
        navData[i].active = false
      }
    }
    that.setData({
      navData: navData,
      curNavIndex: curNavIndex
    }); 

    //页面内容数据变化
    if (curNavIndex == 0) {
      that.getPreList(1)
    } else if (curNavIndex == 1) {
      that.getIngList(1)
    } else if (curNavIndex == 2) {
      that.getEndList(1)
    }

    //loaddding
    app.hideLoading()
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    // 验证登录
    app.checkLogin(function () {
      // 加载数据
      that.loadPageData(1)
      // 停止下拉刷新
      wx.stopPullDownRefresh() 
    })
  },
  //展示加载gif
  showLoadingImg: function(){
    var that = this
    that.setData({
      showLoading: true
    })
  },
  //隐藏加载gif
  hideLoadingImg: function () {
    var that = this
    setTimeout(function () {
      that.setData({
        showLoading: false
      });
    }, 2000);
  },

  /**
   * 活动预告
   */
  getPreList: function (page, isAppend) {

    var that = this

    app.showLoading()

    //设置加载中状态
    // that.setData({ isLoadding: true })

    page = parseInt(page)
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'active/prevuelist',
      {
        token: token,
        page: page
      },
      function (res) {

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
            openTime: item.openTime,
            userCount: item.userCount,
            nickname: item.nickname,
            face: item.face,
            isActiveColor: item.isActiveColor
          }
          viewListData.push(viteItem)
        }

        //是否拼接数据
        if (isAppend) {
          viewListData = that.data.ingListData.concat(viewListData)
        }

        if (page == 1 && viewListData.length == 0) {
          that.setData({
            isShowList: false
          })
        } else {
          that.setData({
            isShowList: true
          })
        }

        //设置页面数据
        var curpages = that.data.curpages
        curpages[0] = page
        that.setData({
          curpages: curpages,
          preListData: viewListData,
          isNeedScrollLoad: total > page,
          isLoadding: false,
          hasMore: total > page
        })

      }
    )   
  },

  /**
   * 进行中活动
   */
  getIngList: function (page, isAppend) {

    var that = this

    app.showLoading()

    //设置加载中状态
    // that.setData({ isLoadding: true })

    page = parseInt(page) 
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'active/inglist',
      {
        token: token,
        page: page
      },
      function (res) {

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
        var total = data.page.totalPages // 总页数
        var listData = data.list
        var viewListData = []

        for (var i = 0; i < listData.length; i++) {
          var item = listData[i]
          var statusObj = that.getStatus(item.status)
          var viteItem = {
            id: item.id,
            image: item.image,
            status:item.status,
            statusStr: statusObj.content,
            bgColor: statusObj.bgColor,
            startTime: item.startTime,
            endTime: item.endTime,
            openTime: item.openTime,
            userCount: item.userCount,
            nickname: item.nickname,
            face: item.face,
            isActiveColor: item.isActiveColor
          }
          viewListData.push(viteItem)
        }

        //是否拼接数据
        if (isAppend) {
          viewListData = that.data.ingListData.concat(viewListData)
        }

        if (page == 1 && viewListData.length == 0) {
          that.setData({
            isShowList: false
          })
        } else {
          that.setData({
            isShowList: true
          })
        }

        //设置页面数据
        var curpages = that.data.curpages
        curpages[1] = page
        that.setData({
          curpages: curpages,
          ingListData: viewListData,
          isNeedScrollLoad: total > page,
          isLoadding: false,
          hasMore: total > page
        })

      }
    )
  },

  /**
   * 已结束活动
   */
  getEndList: function (page, isAppend) {

    var that = this

    app.showLoading()

    //设置加载中状态
    // that.setData({ isLoadding: true })

    page = parseInt(page)
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    //请求已结束数据
    app.reqServerData(
      app.config.baseUrl + 'active/endlist',
      {
        token: token,
        page: page
      },
      function (res) {
        //hide loadding
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
        //total
        var total = data.page.totalPages
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
            openTime: item.openTime,
            userCount: item.userCount,
            nickname: item.nickname,
            face: item.face,
            isActiveColor: item.isActiveColor
          }
          viewListData.push(viteItem)
        }
        

        //是否拼接数据
        if (isAppend) {
          viewListData = that.data.endListData.concat(viewListData)
        }

        if (page == 1 && viewListData.length == 0) {
          that.setData({
            isShowList: false
          })
        } else {
          that.setData({
            isShowList: true
          })
        }

        //设置页面数据
        var curpages = that.data.curpages
        curpages[2] = page
        that.setData({
          curpages: curpages,
          endListData: viewListData,
          isNeedScrollLoad: total > page,
          isLoadding: false,
          hasMore: total > page
        })

      }
    )
  },

  /**
   * 活动状态
   */
  getStatus: function(status){
    var that = this
    for(var i=1 ; i<that.data.statusData.length + 1 ; i++){
      if (i == status){
        return that.data.statusData[i-1]
      }
    }
  },

  /**
   * 下拉刷新，加载更多
   */
  onReachBottom: function (e) {

    var navbarindex = this.data.curNavIndex

    //是否需要滚动加载数据
    if (!this.data.isNeedScrollLoad) {
      return
    }

    //是否正在加载中
    if (this.data.isLoadding) {
      return
    }

    //设置显示滚动加载状态
    this.setData({
      hasMore: true
    })

    //加载数据
    var curpage = 1
    var curpages = this.data.curpages
    if(navbarindex == 1){
      curpage = curpages[1] + 1
      curpages[1] = curpage
    }else if(navbarindex == 2){
      curpage = curpages[2] + 1
      curpages[2] = curpage
    }

    var that = this
    app.showLoading()

    that.loadPageData(curpage, true)
    
  },

  /**
   * 加载数据
   */
  loadPageData: function (page, isAppend) {
    if (this.data.curNavIndex == 0) { //加载活动预告
      this.getPreList(page, isAppend)
    }else if (this.data.curNavIndex == 1) { //加载进行中活动
      this.getIngList(page, isAppend)
    } else if (this.data.curNavIndex == 2) { //加载已结束活动
      this.getEndList(page, isAppend)
    }

    //顶部菜单
    var navData = this.data.navData
    navData[this.data.curNavIndex].active = true
    this.setData({
      navData: navData
    })

  },

  /**
   * 跳转活动详情页
   */
  toDetail: function (e) {
    var that = this
    var curNavIndex = that.data.curNavIndex
    var dataset = e.currentTarget.dataset
    var curStatus = dataset.status
    var index = dataset.index
    var curId = dataset.id

    // 将当前选中的活动加入缓存
    app.setCache("curact", {
      curNavIndex: curNavIndex,
      index: index,
      id: curId,
      isChange: false
    })

    // 如果活动状态是（未报名、已报名、未开奖、未开始（新增）），就跳转到活动详情页
    if (curStatus == '1' || curStatus == '2' || curStatus == '3' || curStatus == '7'){
      wx.navigateTo({
        url: '../activity/detail/detail?id=' + curId
      })
    } else {// 如果活动状态是（未中奖、已中奖、已结束），就跳转到活动中奖结果页
      wx.navigateTo({
        url: '../activity/result/result?id=' + curId
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        })
      }
    })
    that.setData({
      statusData: [
        { content: '未参与', status: '1', bgColor: '#4bb0f4' },
        { content: '已参与', status: '2', bgColor: '#54d386' },
        { content: '待开奖', status: '3', bgColor: '#949494' },
        { content: '未中奖', status: '4', bgColor: '#949494' },
        { content: '已中奖', status: '5', bgColor: '#e64240' },
        { content: '已结束', status: '6', bgColor: '#949494' },
        { content: '未开始', status: '7', bgColor: '#949494' },
      ]
    })
    // 验证登录
    app.checkLogin(function () {
      // 加载数据
      app.showLoading()
      that.loadPageData(1)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示
    var that = this
    // var isFresh = app.getCache('isFresh')
    // //如果需要刷新页面
    // if (isFresh) {
    //   app.showLoading()
    //   app.delCache('isFresh')
    //   var navData = that.data.navData
    //   var curNavIndex = that.data.curNavIndex
    //   navData[0].active = true
    //   navData[1].active = false
    //   that.setData({
    //     navData: navData,
    //     curNavIndex: 0
    //   })
    //   app.checkLogin(function () {
    //     that.loadPageData(1)
    //   })
    // } else {
    //   //不需要刷新页面，直接返回，获取缓存中的活动对象，判断是否需要更新活动状态
    //   var curact = app.getCache('curact')
    //   if (curact && curact.isChange) {
    //     var curNavIndex = that.data.curNavIndex
    //     var index = curact.index
    //     var data = curact.data
    //     var list = []
    //     if (curNavIndex == 0) {
    //       list = that.data.ingListData
    //     } else {
    //       list = that.data.endListData
    //     }
    //     list[index].status = data.status
    //     list[index].statusStr = data.statusStr
    //     list[index].bgColor = data.bgColor
    //     list[index].userCount = data.userCount
    //     curact.isChange = false
    //     app.setCache('curact', curact)
    //     if (curNavIndex == 0) {
    //       that.setData({
    //         ingListData: list
    //       })
    //     } else {
    //       that.setData({
    //         endListData: list
    //       })
    //     }
    //   }
    // }
    var curact = app.getCache('curact')
    if (curact && curact.isChange) {
      var curNavIndex = that.data.curNavIndex
      var index = curact.index
      var data = curact.data
      var list = []
      if (curNavIndex == 0) {
        list = that.data.preListData
      } else if (curNavIndex == 1) {
        list = that.data.ingListData
      } else {
        list = that.data.endListData
      }
      list[index].status = data.status
      list[index].statusStr = data.statusStr
      list[index].bgColor = data.bgColor
      list[index].userCount = data.userCount
      curact.isChange = false
      app.setCache('curact', curact)
      if (curNavIndex == 0) {
        that.setData({
          ingListData: list
        })
      } else {
        that.setData({
          endListData: list
        })
      }
    }
  },

  onReady: function () {
    // 页面渲染完成
  },

  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  },
})