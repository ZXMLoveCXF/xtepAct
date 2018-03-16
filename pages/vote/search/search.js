// pages/vote/search/search.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '2c939d8c61fa7e5d0161ff4936900001',
    curId: '', //当前点击项
    curNavIndex: 0,  //当前tab索引
    total: 0, //总数
    pagesize: 10, //每页显示多少条
    curpage: 1, //当前页码
    isNeedScrollLoad: true, // 是否需要滚动加载，默认true
    isLoadding: true, // 是否加载中
    listData: [],
    scrollHeight: 0,
    isShowList: true
  },

  toDetail: function (e) {
    var that = this
    var dataset = e.currentTarget.dataset
    var uid = dataset.id
    wx.navigateTo({
      url: '../userinfo/userinfo?uid=' + uid,
    })
  }, 

  /**
   * 最新参赛+搜索
   */
  getList: function (page, isAppend) {
    app.showLoading()
    var that = this
    page = parseInt(page)
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    var id = that.data.id
    var search = that.data.search

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/user/list',
      {
        token: token,
        page: page,
        vid: id,
        search: search=='undefined'||!search?'':search
      },
      function (res) {

        app.hideLoading()

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

        if(page == 1 && listData.length == 0){
          that.setData({
            isShowList: false
          })
        }

        for (var i = 0; i < listData.length; i++) {
          var item = listData[i]
          var viteItem = {
            id: item.id,
            cover: item.cover,
            name: item.name,
            voteNum: item.voteNum,
            schoolName: item.schoolName,
            voteFlg: item.voteFlg
          }
          viewListData.push(viteItem)
        }

        //是否拼接数据
        if (isAppend) {
          viewListData = that.data.listData.concat(viewListData)
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
   * 投票
   */
  vote: function (e) {

    console.log('=====================投票开始========================')

    var that = this
    var token = app.getCache('token')
    var id = that.data.id
    var dataset = e.currentTarget.dataset
    var obj = dataset.obj
    console.log(obj)
    if (obj.voteFlg == 2) {
      app.showMsgModel('提示', '今天投票数已用完')
      return false;
    }
    var uid = obj.id
    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/user/' + uid,
      {
        token: token,
        vid: id
      },
      function (res) {
        if (res.statusCode != 200) {
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          if (res.data.status == '50028') {
            app.showMsgModel('提示', res.data.err)
            return
          }
          app.resErrMsg2('获取数据失败', res)
          return
        }
        var data = res.data.data

        if (that.data.curNavIndex == 0) {
          var arr = that.data.listData
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == uid) {
              arr[i].voteFlg = 1
              arr[i].voteNum = arr[i].voteNum + 1
              break
            }
          }
          that.setData({
            listData: arr
          })
        } else if (that.data.curNavIndex == 1) {
          var arr = that.data.rankData
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == uid) {
              arr[i].voteFlg = 1
              arr[i].voteNum = arr[i].voteNum + 1
              break
            }
          }
          that.setData({
            rankData: arr
          })
        }

        obj.voteFlg = 1

        wx.showToast({
          title: data,
          icon: 'success',
          duration: 2000,
          mask: true
        })
        console.log('=====================投票成功========================')
      }
    )
  },

  /**
   * 下拉刷新，加载更多
   */
  onReachBottom: function (e) {

    console.log('上拉刷新')

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
    app.showLoading()
    that.loadPageData(curpage, true)
  },

  /**
   * 加载数据
   */
  loadPageData: function (page, isAppend) {
    this.getList(page, isAppend)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var search = options.search
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight,
          search: search
        })
      }
    })
    app.checkLogin(function () {
      that.getList(1)
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
    var freshVote = app.getCache('fresh-vote')
    if (freshVote) {
      that.getList(1)
      app.delCache('fresh-vote')
    }
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