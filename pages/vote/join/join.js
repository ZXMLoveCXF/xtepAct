// pages/vote/join/join.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholder: '写下你的个人简介，让更多人为你投票。',
    imageList: [],
    uploadedIds: [],
    uploadedImgs: [],
    isShowAddImg: true,
    imgNum: 0,
    id: '', //活动id
    count: 6
  },

  /**
   * 提交表单数据
   */
  formSubmit: function (e) {
    var that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    console.log('form发生了submit事件，携带formid为：', e.detail.formId)

    if (!that.checkData(e.detail.value)) {
      app.hideLoading()
      return
    }
    wx.showModal({
      title: '提示',
      content: '提交报名后不可再进行修改,确定提交报名？',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {

          var formData = e.detail.value
          var token = app.getCache('token')
          formData.token = token
          formData.vid = that.data.id
          formData.formId = e.detail.formId

          console.log(formData)

          var uploadedIds = that.data.uploadedIds
          var imgids = (uploadedIds.length > 0 ? uploadedIds.join('|') : '')
          formData.imgids = imgids

          app.reqServerData(
            app.config.baseUrl + 'vote/join/',
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
                if (res.data.status == '50025') {
                  app.showMsgModel('报名失败', res.data.err)
                  return
                }
                app.resErrMsg2('报名失败失败', res)
                return
              }
              app.setCache('fresh-vote', true)
              wx.showToast({
                icon: "success",
                title: res.data.data,
                duration: 2000,
              })
              setTimeout(function(){
                wx.navigateBack({
                  delta: 1
                })
              },2000)
              
            },
            function (res) {
              app.showMsgModel('提示', '请求失败')
            },
            'POST'
          )
          
        } else if (res.cancel) {
          //console.log('用户点击取消')
          return
        }
      }
    })

  },

  /**
   * 验证表单参数
   */
  checkData: function (data) {
    var that = this
    if (that.data.isSchoolVote == '1'){
      if (that.validatemcontact(data.name) && that.validateage(data.age) && that.validatemobile(data.mobile)
        && that.validateschool(data.schoolName) && that.validatemark(data.mark) && that.validateimage()) {
        return true
      }
      return false
    }else {
      if (that.validatemcontact(data.name) && that.validatemobile(data.mobile)
       && that.validatemark(data.mark) && that.validateimage()) {
        return true
      }
      return false
    }
    
  },
  /**
   * 验证联系人
   */
  validatemcontact: function (contact) {
    if (contact.length == 0) {
      app.showMsgModel('提示', '请输入姓名')
      return false;
    }
    return true;
  },
  /**
   * 验证图片
   */
  validateimage: function (contact) {
    var that = this
    var uploadedIds = that.data.uploadedIds
    if (uploadedIds.length == 0) {
      app.showMsgModel('提示', '请上传照片')
      return false;
    }
    return true;
  },
  /**
   * 验证地址
   */
  validateschool: function (schoolName) {
    if (schoolName.length == 0) {
      app.showMsgModel('提示', '请输入学校')
      return false;
    }
    return true;
  },
  /**
   * 验证年龄
   */
  validateage: function (age) {
    if (age.length == 0) {
      app.showMsgModel('提示', '请输入年龄')
      return false;
    }
    return true;
  },
  /**
   * 验证备注
   */
  validatemark: function (mark) {
    if (mark.length == 0) {
      app.showMsgModel('提示', '请输入个人简介')
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
    var that = this
    var id = options.id
    var isSchoolVote = options.isSchoolVote
    that.setData({
      id: id ? id : '2c939d8c61fa7e5d0161ff4936900001',
      isSchoolVote: isSchoolVote
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
    uploadedImgs = [], 
    uploadedIds = []
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
   * 选择图片
   */
  chooseImage: function(){
    var that = this
    var count = that.data.count
    var imgNum = that.data.imgNum
    wx.chooseImage({
      count: count-imgNum, // 一次最多可以选择2张图片一起上传
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        if(that.data.imageList.length + res.tempFilePaths.length > 6){
          app.showMsgModel('请求失败', '一次只能上传6张图片哦~')
          return
        }
        that.setData({
          imgNum: that.data.uploadedImgs.length + res.tempFilePaths.length
        })
        upload(that, res.tempFilePaths)
      }
    })
  },
  previewImage: function (e) {
    console.log('预览功能开启')
    var that = this;
    var dataid = e.currentTarget.dataset.id;
    var uploadedImgs = that.data.uploadedImgs;
    wx.previewImage({
      current: uploadedImgs[dataid],
      urls: this.data.uploadedImgs
    });
  }
})

var uploadedImgs = [], uploadedIds = []

function upload(page, pathes) {
  wx.showToast({
    icon: "loading",
    title: "正在上传"
  })

  var path = pathes.shift(pathes)

  var initData = app.getCache('initdata')
  var token = app.getCache('token')
  wx.uploadFile({
    url: app.config.baseUrl + 'image/upload',
    filePath: path,
    name: 'file',
    header: { "Content-Type": "multipart/form-data" },
    formData: {
      token: token
    },
    success: function (res) {
      console.log('---------------------------UPLOAD complete');
      console.log(res);
      if (res.statusCode != 200) {
        app.showMsgModel('上传失败', res.errMsg + '(statusCode=' + res.statusCode + ')')
        return
      }

      var data = JSON.parse(res.data)
      if (data.status != 0) {
        app.showMsgModel('上传失败', 'status=' + res.data.status)
        return
      }

      var data = data.data
      uploadedIds.push(data.id)
      uploadedImgs.push(path)
      console.log(uploadedImgs)
      console.log(uploadedIds)
      page.setData({  //上传成功修改显示图片
        uploadedIds: uploadedIds,
        uploadedImgs: uploadedImgs,
        isShowAddImg: (uploadedIds.length < 6)
      })

      //继续上传
      if (pathes.length > 0) {
        upload(page, pathes)
      }
    },
    fail: function (e) {
      console.log(e);
      wx.showModal({
        title: '提示',
        content: '上传失败(' + e.errMsg + '), 上传已被终止, 请重新上传',
        showCancel: false
      })
    },
    complete: function () {
      wx.hideToast();  //隐藏Toast
    }
  })
}