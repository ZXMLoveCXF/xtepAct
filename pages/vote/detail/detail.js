// pages/vote/detail/detail.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   * status:
   * 1表示未开始的投票 
   * 2表示进行中的投票 
   * 3表示已结束的投票 
   * 当status=2，joinFlg=false，显示按钮我要报名，
   * joinFlg=true，显示按钮我的投票，
   * 当status=3，joinFlg=false，显示按钮中奖名单，
   * joinFlg=true，显示中奖名单，我的投票两个按钮
   */
  data: {
    vote: {
      bannerUrl: '', //banner
      joinUserNum: 0, //投票参与人数
      time: 0, //倒计时
      markUrl: '', //活动介绍url,
    },
    navData: [
      { title: '最新参赛', active: true, sign: 'newList' },
      { title: '排行榜', active: false, sign: 'rankList' }
    ],
    nav1Data: [
      { title: '最美运动女神', active: true, sign: 'beList' },
      { title: '最帅运动男神', active: false, sign: 'hanList' }
    ],
    id: '', //活动id
    curNavIndex: 0,  //当前tab索引
    curNav1Index: 0, //排行榜子tab的索引
    gender: 0, //当前选中的性别
    total: 0, //总数
    pagesize: 10, //每页显示多少条
    curpage: 1, //当前页码
    isNeedScrollLoad: true, // 是否需要滚动加载，默认true
    isLoadding: true, // 是否加载中
    countDownDay: '00',
    countDownHour: '00',
    countDownMin: '00',
    countDownSec: '00',
    isCount: true, //是否倒计时
    joinFlg: true, //当前用户是否参与标记
    status: 0,
    listData: [],
    rankData: [],
    isShowList: true, //是否显示列表
    isReCount: true, //是否重新倒计时
    isShowBtn: false,
    searchValue: '',
    isShowPage: false
    , uid: 0
  },

  /**
   * 初始化
   */
  init: function () {
    var that = this
    that.setData({
      navData: [
        { title: '最新参赛', active: true, sign: 'newList' },
        { title: '排行榜', active: false, sign: 'rankList' }
      ],
      nav1Data: [
        { title: '最美运动女神', active: true, sign: 'beList' },
        { title: '最帅运动男神', active: false, sign: 'hanList' }
      ],
      curNavIndex: 0,  //当前tab索引
      curNav1Index: 0, //排行榜子tab的索引
      gender: 0, //当前选中的性别
      curpage: 1, //当前页码
      isNeedScrollLoad: true, // 是否需要滚动加载，默认true
      isLoadding: true, // 是否加载中
      listData: [],
      rankData: [],
      searchValue: ''
    })
    that.getVote()
    that.loadPageData(1)
  },

  /**
   * 跳转中奖名单
   */
  toLotto: function () {
    var that = this
    wx.navigateTo({
      url: '../rank/rank?id=' + that.data.id,
    })
  },

  /**
   * 跳转报名页面
   */
  toJoin: function () {
    var that = this
    wx.navigateTo({
      url: '../join/join?id=' + that.data.id + '&isSchoolVote=' + that.data.vote.isSchoolVote
    })
  },

  /**
   * 菜单切换
   */
  switchNavData: function (e) {

    var that = this
    var dataset = e.currentTarget.dataset

    //菜单焦点变化
    var curNavIndex = dataset.index

    if (curNavIndex == this.data.curNavIndex) {
      return;
    }

    app.showLoading()

    that.setData({
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
    if (curNavIndex == 0) {
      that.getList(1)
    } else if (curNavIndex == 1) {
      that.getRank(1)
    }

  },

  /**
   * 菜单切换
   */
  switchNav1Data: function (e) {

    var that = this
    var dataset = e.currentTarget.dataset

    //菜单焦点变化
    var curNavIndex = dataset.index

    if (curNavIndex == this.data.curNav1Index) {
      return;
    }

    app.showLoading()

    that.setData({
      isLoadding: true
    })

    var navData = that.data.nav1Data
    for (var i = 0, len = navData.length; i < len; ++i) {
      if (i == curNavIndex) {
        navData[i].active = true
      } else {
        navData[i].active = false
      }
    }

    that.setData({
      nav1Data: navData,
      curNav1Index: curNavIndex,
      gender: curNavIndex == 0 ? '0' : '1'
    });

    //页面内容数据变化
    that.getRank(1)

  },

  /**
   * 跳转到活动介绍页
   */
  toIntro: function () {
    var that = this
    wx.navigateTo({
      url: '../../activity/introduce/introduce?url=' + that.data.vote.markUrl,
    })
  },

  toDetail: function (e) {
    var that = this
    var dataset = e.currentTarget.dataset
    var uid = dataset.id
    wx.navigateTo({
      url: '../userinfo/userinfo?uid=' + uid + '&id=' + that.data.id,
    })
  },

  /**
   * 获取投票详情
   */
  getVote: function (id) {
    var that = this
    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    //请求活动详情
    var id = that.data.id
    app.reqServerData(
      app.config.baseUrl + 'vote/detail/' + id,
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
        that.setData({
          vote: data.vote,
          status: data.status,
          joinFlg: data.joinFlg,
          vuid: data.vuid,
          isShowBtn: true,
          sharePicUrl: data.sharePicUrl
        })

        wx.setNavigationBarTitle({
          title: data.vote.title
        })

        //活动倒计时(活动未结束)
        if (that.data.isReCount && data.status != '3') {
          that.getTimeDown(data.vote.time)
        }

      }
    )
  },

  //时间倒计时
  getTimeDown: function (second) {
    // var totalSecond = 1505540080 - Date.parse(new Date()) / 1000;

    if (second <= 0) {
      return
    }

    var interval = setInterval(function () {
      var that = this
      var isCount = that.data.isCount
      if (!isCount) {
        clearInterval(interval);
        return
      }

      // 天数位  
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownDay: dayStr,
        countDownHour: hrStr,
        countDownMin: minStr,
        countDownSec: secStr
      });
      second--;
      if (second < 0) {
        clearInterval(interval);
      }
    }.bind(this), 1000);
  },

  /**
   * 最新参赛+搜索
   */
  getList: function (page, isAppend) {

    var that = this

    page = parseInt(page)
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    var id = that.data.id

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/user/list',
      {
        token: token,
        page: page,
        vid: id
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

        that.setData({
          isShowList: (page == 1 && listData.length == 0) ? false : true
        })

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
          isLoadding: false,
          isShowPage: true
        })
        wx.stopPullDownRefresh()
      }
    )
  },

  /**
   * 排行榜
   */
  getRank: function (page, isAppend) {

    var that = this

    page = parseInt(page)
    page = page ? page : 1

    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    var id = that.data.id
    var gender = that.data.gender

    //请求进行中列表数据
    app.reqServerData(
      app.config.baseUrl + 'vote/ranking/list',
      {
        token: token,
        page: page,
        vid: id,
        gender: gender
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

        that.setData({
          isShowList: (page == 1 && listData.length == 0) ? false : true
        })

        for (var i = 0; i < listData.length; i++) {
          var item = listData[i]
          var viteItem = {
            id: item.id,
            cover: item.cover,
            name: item.name,
            voteNum: item.voteNum,
            schoolName: item.schoolName,
            voteFlg: item.voteFlg,
            num: item.num,
            bgColor: item.num > 3 ? '#fccf00' : '#ee0b12',
            isTop3: item.num < 4
          }

            viewListData.push(viteItem)

        }

        //是否拼接数据
        if (isAppend) {
          viewListData = that.data.rankData.concat(viewListData)
        }

        //设置页面数据
        var curpage = that.data.curpage
        curpage = page
        that.setData({
          curpage: curpage,
          rankData: viewListData,
          isNeedScrollLoad: total > page,
          isLoadding: false
        })

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
    if (obj.voteFlg == 2) {
      app.showMsgModel('提示', '今天投票数已用完，每天最多投三票')
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
   * 搜素参赛者
   */
  search: function () {
    var that = this
    wx.navigateTo({
      url: '../search/search?search=' + this.data.searchValue + '&id=' + that.data.id,
    })
  },

  searchValue: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  /**
   * 下拉刷新，加载更多
   */
  onReachBottom: function (e) {

    console.log('上拉刷新')

    var navbarindex = this.data.curNavIndex

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
    if (this.data.curNavIndex == 0) {
      this.getList(page, isAppend)
    } else if (this.data.curNavIndex == 1) {
      this.getRank(page, isAppend)
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var id = options.id
    that.setData({
      id: id ? id : '2c939d8c61fa7e5d0161ff4936900001'
    })
    app.showLoading()
    app.checkLogin(function () {
      that.getVote()
      var curpage = that.data.curpage
      that.loadPageData(curpage, true)
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
      that.init()
      app.delCache('fresh-vote')
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this
    that.setData({
      isReCount: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this
    that.setData({
      isCount: false
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    that.init()
  },

  /**
   * 用户点击右上角分享
   */
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    var initData = app.getCache('initdata')
    var wxuser = initData.wxuser
    console.log(that.data.sharePicUrl)
    return {
      title: wxuser.nickname + '邀你参与[321GO]' + '投票活动',
      imageUrl: that.data.sharePicUrl,
      path: '/pages/vote/detail/detail?id=' + that.data.id,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }

  }
})