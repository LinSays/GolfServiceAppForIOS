export const formatNumber = (number) => {
  return ('0' + number).slice(-2)
}

export const isNumber = (str) => {
  if (typeof str === 'number') return true
  if (typeof str !== 'string') return false

  return !isNaN(str) && !isNaN(parseFloat(str))
}

export const validateEmail = (email) => {
  const expression =
    /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i
  return expression.test(String(email).toLowerCase())
}

export const validatePhoneNumber = (number) => {
  var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/
  return regexp.test(number)
}

export const formatDate = (date, type) => {
  const monthStrings = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const d = new Date(date)
  if (type === 'MMMM dd yyyy') {
    return `${monthStrings[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } else if (type === 'YYYY-MM-DD') {
    return `${d.getFullYear()}-${formatNumber(d.getMonth() + 1)}-${formatNumber(d.getDate())}`
  } else if (type === 'WD-DD-MM') {
    return `${weekDays[d.getDay()]} ${d.getDate()} ${monthStrings[d.getMonth()]}`
  }
}

export const formatTime = (dateString) => {
  const date = new Date(dateString)
  const hours =
    date.getHours() > 12 ? date.getHours() - 12 : date.getHours() == 0 ? 12 : date.getHours()
  const minutes = date.getMinutes()
  const ampm = date.getHours() > 11 ? 'PM' : 'AM'
  return `${hours}:${formatNumber(minutes)} ${ampm}`
}

/**
 * deep check for value in obj in obj in obj..
 * usage: isset(() => object.hi.woah.wheeeee)
 * @param {*} variable
 */

export const isset = (fn) => {
  let value
  try {
    value = fn()
  } catch (e) {
    value = undefined
  }
  return value !== undefined
}

export const getAvatarInitials = (textString) => {
  if (!textString) return ''
  const text = textString.trim()
  const textSplit = text.split(' ')

  if (textSplit.length <= 1) return text.charAt(0)

  const initials = textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0)

  return initials
}

export const getTimeDifference = (date) => {
  const now = new Date().getTime()
  const difference = now - date
  const seconds = Math.round(difference / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  return days >= 1
    ? `${days} days ago`
    : hours >= 1
    ? `${hours} hours ago`
    : minutes >= 1
    ? `${minutes} minutes ago`
    : `${seconds} seconds ago`
}

export const truncateText = (text, maxLength) =>
  text && text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text

export const getEndDateTime = (dateString, difference) => {
  const date = new Date(dateString).getTime()
  const endDateTime = date + difference * 60 * 60 * 1000
  return new Date(endDateTime).toISOString()
}

export const getPictureBySize = (url, width, height) => `${url}?width=${width}&height=${height}`

export const generateRandomDigits = String(Math.floor(100000 + Math.random() * 900000))

export const removeDuplicates = (data, key) => {
  return [...new Map(data.map((x) => [key(x), x])).values()]
}
