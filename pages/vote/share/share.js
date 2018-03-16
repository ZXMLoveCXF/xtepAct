// pages/vote/share/share.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHeight: 0,
    pageWidth: 0,
    isLoadding: true,
    defaultFace: 'http://xtepactive.image.alimmdn.com/logo.png@200w_200h',
    defaultNickname: '321GO',
    shareImage: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.showLoading('生成中')
    var shareType = options.type
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight,
          pageWidth: res.windowWidth
        });
      }
    })
    if (shareType == 'vote') {
      var imageUrl = that.getImageUrl(options.image)
      var codeUrl = that.getImageUrl(options.codeImage)
      var faceUrl = that.getImageUrl(options.face)
      var nickname = options.nickname
      var startTime = options.startTime
      var endTime = options.endTime
      console.log(options.codeImage)
      that.setData({
        imageUrl: imageUrl,
        codeUrl: codeUrl,
        startTime: startTime,
        endTime: endTime,
        faceUrl: faceUrl,
        nickname: nickname
      });
      that.drawActImage()
    }
  },
  /**
   * 画图(活动分享)
   */
  drawActImage: function () {
    var that = this
    var initData = app.getCache('initdata')
    var wxuser = initData.wxuser

    var tH = 50 //初始边距高度
    var tW = 10 //边距宽度

    var h = that.data.pageHeight - tH
    var w = that.data.pageWidth - tW
    var pH = (h - tH - tW) / 50 //单元高度
    var x = w / 2 //水平中心位置坐标
    var r = 4 * pH

    var imageW = w - 50
    var imageH = (w - 50) / 2

    var tH2 = tH + (12 * pH) + imageH //初始高度2
    var pH2 = ((h - tH - tW) - ((14 * pH) + imageH - tH)) / 20 //单元高度2

    var data = that.data

    const ctx = wx.createCanvasContext('myCanvas')
    ctx.setFillStyle('#92d2ff')
    ctx.fillRect(0, 0, w, h)
    // ctx.drawImage('/resources/images/share_img_bule.png', 0, 0, w, h)
    ctx.drawImage('/resources/images/share_img_white.png', tW, tH, w - (2 * tW), h - tH - tW)
    ctx.setFontSize(1.5 * pH)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('top')
    ctx.setFillStyle('#000000')
    ctx.fillText(data.nickname, x, tH + (7 * pH))
    ctx.setFillStyle('#4db0f4')
    ctx.setFontSize(1.8 * pH)
    ctx.fillText('我参与了首届颜值大赛', x, tH + (10 * pH))
    ctx.fillText('快来帮我投一票吧', x, tH + (13 * pH))
    ctx.setFillStyle('#000000')
    ctx.setTextAlign('center')
    ctx.setFontSize(1.5 * pH)
    ctx.fillText('长按识别小程序，马上参与', x, tH2 + (14 * pH2))

    wx.getImageInfo({
      src: data.imageUrl,
      success: function (res) {
        that.setData({
          image: res.path
        })
        wx.getImageInfo({
          src: data.faceUrl,
          success: function (res) {
            that.setData({
              face: res.path
            })
            wx.getImageInfo({
              src: data.codeUrl,
              success: function (res) {
                that.setData({
                  codeImage: res.path
                })
                //活动图片
                ctx.drawImage(that.data.image, 25, tH + (16.5 * pH), imageW, imageH)
                //小程序二维码
                ctx.drawImage(that.data.codeImage, x - (4 * pH2), tH2 + (5 * pH2), 8 * pH2, 8 * pH2)
                ctx.beginPath()
                ctx.arc(x, tH + (2 * pH), r + 5, 0, 2 * Math.PI)
                ctx.setFillStyle('#ffffff')
                ctx.fill()
                ctx.beginPath()
                ctx.arc(x, tH + (2 * pH), r, 0, 2 * Math.PI)
                ctx.setFillStyle('#ffffff')
                ctx.fill()
                ctx.clip()
                //发起人头像
                ctx.drawImage(that.data.face, x - r, tH + (2 * pH) - r, 2 * r, 2 * r)
                ctx.restore()
                ctx.draw()
                app.hideLoading()
                that.setData({
                  isLoadding: false
                })
              }
            })
          }
        })
      }
    })
  },
 
  /**
   * 保存图片到手机
   */
  saveImage: function () {
    var that = this
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          that.saveImageLocal();
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveImageLocal();
            }, fail() {
              wx.openSetting({
                success: function (res) {
                  if (res.authSetting['scope.writePhotosAlbum']) {
                    that.saveImageLocal();
                  }
                }, fail: function (res) {
                }
              })
            }
          })
        }
      }, fail: function (res) {
        wx.openSetting({
          success: function (res) {
            if (res.authSetting['scope.writePhotosAlbum']) {
              that.saveImageLocal();
            }
          }, fail: function (res) {
          }
        })
      }
    })

  },
  /**
   * 将图片保存到本地
   */
  saveImageLocal: function () {
    var that = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.pageWidth - 10,
      height: that.data.pageHeight,
      fileType: 'jpg',
      canvasId: 'myCanvas',
      quality: 1.0,
      success: function (res) {
        that.setData({
          canvasUrl: res.tempFilePath
        })
        wx.saveImageToPhotosAlbum({
          filePath: that.data.canvasUrl,
          success(res) {
            wx.showToast({
              title: '图片保存本地成功',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
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
})