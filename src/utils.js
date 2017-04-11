function formatTime(num) {
  const temp = parseFloat(num)
  let secs = parseInt(temp % 60)
  let mins = parseInt((temp / 60) % 60)
  secs = `0${secs}`.slice(-2)
  mins = `0${mins}`.slice(-2)
  return `${mins}:${secs}`
}

function isTouchSupported() {
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch) {
    return true
  }
  return false
}

export { formatTime, isTouchSupported }
