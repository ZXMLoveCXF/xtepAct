const dateUtil = require('../../../utils/util.js');

//获取应用实例
var app = getApp()

Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    isNeedScrollLoad: true, //是否需要滚动加载；默认true。
    isLoadding: true,
    act: {},
    btn: {},
    taskList: [],
    isClick: false,
    showModalStatus:false,
    isAuthPhone:false, //是否授权过获取手机号,
    hiddenFlg:false, //是否隐藏,
    shareImage: '', //分享图片,
    countDownTime: '00:00:00', //倒计时
    isCount: true, //是否倒计时
    ruleTitle: '获奖条件',
    showQuesMark: false, //是否显示获奖条件提示框
    hideBtn: false
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
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
   * 设置按钮是否可点击
   */
  setClick: function (isClick) {
    var that = this
    that.setData({
      isClick: isClick
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.showLoading()
    var that = this
    var id = options.id
    that.setData({
      btn: {
        btnName: '马上参与',
        btnBgColor: '#4bb0f4',
        btnColor: '#fff',
      },
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

    var authPhone = app.getCache('auth-phone')
    if(authPhone){
      this.setData({
        isAuthPhone: true
      });
    }
    
    //  这里要注意，微信的scroll-view必须要设置高度才能监听滚动事件，所以，需要在页面的onLoad事件中给scroll-view的高度赋值
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: (res.windowHeight - 50),
          system: res.system
        });
      }
    })
    
    app.checkLogin(function () {
      that.getDetail(id)
    })
  },
  /**
   * 获取活动状态参数
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
   * 获取活动详情
   */
  getDetail: function (id){
    var that = this
    var token = app.getCache('token')
    var initData = app.getCache('initdata')
    //请求活动详情
    app.reqServerData(
      app.config.baseUrl + 'active/detail/' + id,
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
        var data = res.data.data.obj
        var assist = res.data.data.assist
        var prizeList = res.data.data.imgList //奖品图片列表

        if (data.status == '4' || data.status == '5'){
          that.setData({
            btn: {
              btnName: '查看开奖情况',
              btnBgColor: '#e8e8e8',
              btnColor: '#7f7f7f',
            }
          })
        } else if (data.status == '7') {
          that.setData({
            btn: {
              btnName: '未开始',
              btnBgColor: '#e8e8e8',
              btnColor: '#7f7f7f',
            }
          })
        } else if (data.status == '6') {
          that.setData({
            btn: {
              btnName: '活动已结束',
              btnBgColor: '#e8e8e8',
              btnColor: '#7f7f7f',
            }
          })
        }else if (data.status != '1'){
          that.setData({
            btn: {
              btnName: '待开奖',
              btnBgColor: '#e8e8e8',
              btnColor: '#7f7f7f',
            }
          })
        }
        //设置页面数据
        var statusObj = that.getStatus(data.status)

        that.setData({
          act:{
            id: data.id,
            image: data.image,
            bgColor: statusObj.bgColor,
            statusStr: statusObj.content,
            status: data.status,
            isActiveColor: data.isActiveColor,
            userCount: data.userCount,
            face: data.face,
            nickname: data.nickname,
            openTime: data.openTime,
            startTime: data.startTime,
            endTime: data.endTime,
            remind: data.remind,
            erweimaUrl: data.erweimaUrl,
            hiddenFlg: res.data.data.hiddenFlg=='undefined'?false:res.data.data.hiddenFlg,
            sharePicUrl: data.sharePicUrl,
            runUrl: res.data.data.url,
            actInfo: data.mark,
            prizeList: prizeList,
            type: res.data.data.multiPrizeFlg == '1' ? '3' : data.activeType, //活动类型
            resCount: data.diffUserNum, //还需要XX人参加，奖品数才增加
            prizeNum: data.lotteryPrizeNum, //奖品总数
            perUserNum: data.perUserNum, //每增加XX人，奖品数量增加
            isInvite: (data.status == '3' || data.status == '4'
              || data.status == '5' || data.status == '6'
              || data.status == '7') ? false : true //是否可以邀请
          },
          directJoinFlg:!assist||data.status=='4'||data.status=='5'||data.status=='6'?'2':assist.directJoinFlg,
          isCount: data.status=='4'||data.status=='5'||data.status=='6'?false:true,
          ruleTitle: data.activeType == '1' ? '获奖条件':'活动说明',
          multiPrizeFlg: res.data.data.multiPrizeFlg,//是否多礼品活动 0否 1是，如果值等于1 ，按照1.5的原型处理
          title1: res.data.data.title1,
          title2: res.data.data.title2,
          kilometre: data.kilometre,
          isComp: data.kilometrePercent >= 100 ? true : false, //是否完成里程 1.5版本
          isLotto: (data.status == '4' || data.status == '5' || data.status == '6')?true:false //是否开奖 1.5版本
        })

        if (res.data.data.multiPrizeFlg == '1' && data.status != '1' && data.status != '6'){
          that.setData({
            hideBtn: true
          })
        }

        //活动倒计时
        if(data.diffTime){
          that.getTimeDown(data.diffTime)
        }

        //设置活动任务列表
        var taskListData = []
      
        taskListData.push(
          {
            content: data.needUserMark,
            value: data.userCount,
            per: data.userPercent,
            icon: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/20180223172559rW7DouZG.png',
            type: 'share',
            taskClass: (data.status == '3' || data.status == '4' 
                || data.status == '5' || data.status == '6' 
                || data.status == '7') ? 'off' : 'on'
          }
        )
        
        if (!that.data.act.hiddenFlg) {
          taskListData.push(
            {
              content: data.kilometreMark,
              value: data.kilometre,
              per: data.kilometrePercent,
              type: 'run',
              icon: 'http://xtep321go-live.image.alimmdn.com/image/system/users/admin/201803011413011ZEn4ZZw.png',
              taskClass: (data.status == '1' || data.status == '3' 
                || data.status == '4' || data.status == '5' 
                || data.status == '6' || data.status == '7') ? 'off' : 'on'
            }
          )
        }

        that.setData({
          taskList: taskListData
        })

        that.setLoading()

        //加载分享图片
        if(data.sharePicUrl){
          wx.getImageInfo({
            src: that.getImageUrl(data.sharePicUrl),
            success: function (res) {
              that.setData({
                shareImage: res.path
              })
            }
          })
        }
      }
    )
  },  
  /**
   * 设置加载状态
   */
  setLoading: function () {
    var that = this
    that.setData({
      isLoadding: false
    })
    app.hideLoading()
  },
  /**
   * 将url为http的转为https
   */
  getImageUrl: function (url) {
    var returnUrl = ''
    if (url.indexOf('https') != -1) {
      return url
    }
    returnUrl = 'https://' + url.split('://')[1]
    return returnUrl
  },
  /**
   * 显示获奖条件提示框
   */
  showQuesMark: function(){
    var that = this
    if (!that.data.showQuesMark) {
      that.setData({
        showQuesMark: true
      })
      setTimeout(function () {
        that.setData({
          showQuesMark: false
        })
      }, 3000)
    }
  },
  /**
   * 跳转中奖结果页面
   */
  toResult: function(e){
    var that = this
    var idx = e.currentTarget.dataset.idx;
    var status = that.data.act.status
    console.log(e.currentTarget.dataset.idx)
    var str = ''
    if (idx == 1){
      str = "&type=1"
    }
    wx.redirectTo({
      url: '../result/result?id=' + that.data.act.id + '&status=' + that.data.act.status + str
    })
  },
  /**
   * 参与活动
   */
  toJoin: function (e) {
    var that = this
    that.setClick(true)
    var status = that.data.act.status
    var joinFlg = that.data.directJoinFlg
    if (status != '1' && status != '4' && status != '5'){
      return;
    }
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    console.log('form发生了submit事件，携带formid为：', e.detail.formId)
    if (joinFlg == '0'){
      //需要去绑定的手机号
      wx.navigateTo({
        url: '../join/join?id=' + that.data.act.id
      })
    } else if (joinFlg == '1'){
      that.joinAct(e.detail.formId)
    } else if (joinFlg == '2') {
      //查看中奖结果
      wx.redirectTo({
        url: '../result/result?id=' + that.data.act.id + '&status=' + that.data.act.status
      })
    }
  },
  /**
   * 已绑定手机号，直接加入活动
   */
  joinAct: function (formId){
    app.showLoading('保存中', true)
    var that = this
    var token = app.getCache('token')
    //报名活动
    app.reqServerData(
      app.config.baseUrl + 'active/join',
      {
        token: token,
        activeid: that.data.act.id,
        formid: formId
      },
      function (res) {
        //hide loadding
        app.hideLoading()
        that.setClick(false)
        if (res.statusCode != 200) {
          app.resErrMsg1('请求错误', res)
          return
        }
        if (res.data.status != 0) {
          app.resErrMsg2('请求失败', res)
          return
        }
        var data = res.data.data.obj
        var taskList = that.data.taskList
        var act = that.data.act
        taskList[0].per = data.userPercent
        taskList[0].value = data.userNum
        taskList[0].taskClass = 'on'
        if (taskList.length>1) {
          taskList[1].taskClass = 'on'
        }
        act.userCount = data.userNum
        act.status = '2'
        act.statusStr = '已参与'
        act.bgColor = '#54d386'
        
        //判断活动类型,1表示用户数满足最少用户，2表示用户数累加
        if(data.activeType == '2'){
          act.prizeNum = data.lotteryPrizeNum
          act.resCount = data.diffUserNum
        }

        that.setData({
          taskList: taskList,
          act: act,
          btn: {
            btnName: '待开奖',
            btnBgColor: '#e8e8e8',
            btnColor: '#7f7f7f',
          },
        })

        //1.5版本隐藏按钮
        if (that.data.multiPrizeFlg == '1'){
          that.setData({
            hideBtn: true
          })
        }

        //修改首页的活动状态
        var curact = app.getCache("curact")
        if (curact) {
          //如果缓存中的活动id与当前页面的活动id想等
          if (curact.id == that.data.act.id) {
            var actData = {
              status: '2',
              statusStr: '已参与',
              bgColor: '#54d386',
              userCount: data.userNum
            }
            curact.isChange = true
            curact.data = actData
            app.setCache('curact', curact)
          }
        }
        wx.showToast({
          title: '报名成功',
          icon: 'success',
          duration: 1500
        })
      }
    )
  },
  toIntroduce: function(){
    var that = this
    wx.navigateTo({
      url: '../introduce/introduce?url='+that.data.act.runUrl
    })
  },
  /**
   * 分享操作
   */
  toShare: function (e) {
    var that = this
    that.util('close')
    wx.navigateTo({
      url: '../share/share?image=' + that.data.act.image + '&userCount=' + that.data.act.userCount + '&startTime=' + that.data.act.startTime + '&endTime=' + that.data.act.endTime + '&codeImage=' + that.data.act.erweimaUrl + '&face=' + that.data.act.face + '&nickname=' + that.data.act.nickname+'&type='+'act'
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this
    that.setClick(false)
    var isJoinActivity = app.getCache('join-activity')
    if (isJoinActivity) {
      // that.onLoad()
      wx.showToast({
        title: '报名成功',
        icon: 'success',
        duration: 1000
      })
      app.delCache('join-activity')
    }
    that.util('close')

    that.setData({
      isCount: true
    })

  },
  onHide: function () {
    // 页面隐藏
    var that = this
    // that.setData({
    //   isCount: false
    // })
  },
  onUnload: function () {
    // 页面关闭
    var that = this
    that.setData({
      isCount: false
    })
  },
  getPhoneNumber: function (e) {
    var that = this
    // console.log(e.detail.errMsg)
    // console.log(e.detail.iv)
    // console.log(e.detail.encryptedData)
    if (e.detail.errMsg.indexOf('fail') != -1 || !e.detail.encryptedData || !e.detail.iv) {
      //需要去绑定的手机号
      wx.navigateTo({
        url: '../join/join?id=' + that.data.act.id
      })
    } else {
      var token = app.getCache('token')
      app.reqServerData(
        app.config.baseUrl + 'wx/decrypt/phone/',
        {
          token: token,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        },
        function (res) {
          if (res.statusCode != 200) {
            app.resErrMsg1('请求错误', res)
            return
          }
          if (res.data.status != 0) {
            app.resErrMsg2('获取手机号失败', res)
            return
          }
          var phone = res.data.data
          app.setCache('auth-phone', phone)
          wx.navigateTo({
            url: '../join/join?id=' + that.data.act.id
          })
        }
      )
    }  
    
  },
  //时间倒计时
  getTimeDown: function (second) {
    // var totalSecond = 1505540080 - Date.parse(new Date()) / 1000;

    if(second <= 0){
      return
    }

    var interval = setInterval(function () {
      var that = this
      var isCount = that.data.isCount
      if(!isCount){
        clearInterval(interval);
        return
      }

      // 天数位  
      // var day = Math.floor(second / 3600 / 24);
      // var dayStr = day.toString();
      // if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((second) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((second - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
      var sec = second - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownTime: hrStr+':'+minStr+':'+secStr
      });
      second--;
      if (second < 0) {
        clearInterval(interval);
        wx.redirectTo({
          url: '../detail/detail?id=' + that.data.act.id
        })
      }
    }.bind(this), 1000);
  }, 
  onShareAppMessage: function () {
    var that = this
    that.util('close')
    var initData = app.getCache('initdata')
    var wxuser = initData.wxuser
    var shareImage = '';
    if(that.data.shareImage){
      shareImage = that.data.shareImage
    }else {
      shareImage = that.data.act.sharePicUrl
    }
    return {
      title: wxuser.nickname + '邀你参与[321GO]' + '活动',
      imageUrl: shareImage,
      path: '/pages/activity/detail/detail?id='+that.data.act.id,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
    
  }
})