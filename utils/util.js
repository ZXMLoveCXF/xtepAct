const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getDateStr = n => {
  const arr = getDateArr(n);
  return arr[1] + '月' + arr[2] + '日';
}

const getDateStr2 = n => {
  const arr = getDateArr(n);
  return arr[0] + '年' + arr[1] + '月' + arr[2] + '日 ' + arr[3] + ':' + arr[4];
}

const getDateArr = n => {
  const time = new Date(n);
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  var timeArray = [year, month, date, formatNumber(hours), formatNumber(minutes), formatNumber(seconds)];
  return timeArray;
}

module.exports = {
  formatTime: formatTime,
  getDateStr: getDateStr,
  getDateStr2: getDateStr2
}
