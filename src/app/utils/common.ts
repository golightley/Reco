import * as _ from 'lodash'

const extend = (obj, exObj) => {
  return _.extend(obj, exObj)
}

const isEmpty = obj => {
  return _.isEmpty(obj)
}

const calcDiffDays = (date1, date2) => {
  const diffc = date1.getTime() - date2.getTime()
  const days = Math.floor(diffc / (1000 * 60 * 60 * 24))
  return days
}

const formatTime = date => {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  const strTime = hours + ':' + minutes + '' + ampm
  return strTime
}

const isNotEmpty = obj => {
  return !isEmpty(obj)
}

const upperCase = val => {
  return _.upperCase(val)
}

const stringifySubObj = obj => {
  return _.mapValues(obj, item => {
    if (_.isObject(item)) {
      item = JSON.stringify(item)
    }
    return item
  })
}

const range = max => {
  return _.range(max)
}

const clone = obj => {
  return _.clone(obj)
}

const makeUniqueId = length => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export {
  extend,
  isEmpty,
  calcDiffDays,
  formatTime,
  isNotEmpty,
  upperCase,
  stringifySubObj,
  range,
  clone,
  makeUniqueId
}
