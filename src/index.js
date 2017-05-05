import { formatTime, isTouchSupported, fetchSource } from './utils'
import './index.scss'
const defaultOptions = {
}
class WSVideoPlayer {
  constructor(container, options = {}) {
    this.options = Object.assign({}, defaultOptions, options)
    this.container = container
    this.hasLoadMeta = false
    this.sliderMoving = false
    this.isFullScreen = false
    this.isPlaying = false
    this.loadTimer = null
    this.handleLoadedMetaData = this.handleLoadedMetaData.bind(this)
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this)
    this.handleEned = this.handleEned.bind(this)
    this.handleSliderDown = this.handleSliderDown.bind(this)
    this.handleWaiting = this.handleWaiting.bind(this)
    this.handlePlaying = this.handlePlaying.bind(this)
    this.handlePlay = this.handlePlay.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleToggleFullScreen = this.handleToggleFullScreen.bind(this)
    this.handleSliderMove = this.handleSliderMove.bind(this)
    this.handleSliderUp = this.handleSliderUp.bind(this)
    this.seekTo = this.seekTo.bind(this)
    this.setTemplate()
    this.attachEvents()
  }
  setTemplate() {
    const { width, poster } = this.options
    const tpl = `<div class="ryvideo">
      <div class="ryvideo-body">
        <div class="ryvideo-container" style="width: ${width}px; background-image: url('${poster}')">
          <video preload="auto" playsinline webkit-playsinline></video>
          <div class="ryvideo-controls">
            <div class="ryvideo-controls-inner">
              <div class="ryvideo-controls-play-pause">
                <a class="ryvideo-controls-play">
                  <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M404.48 762.368l307.2-250.368-307.2-250.368z"  /><path fill="#333333" d="M512 1024C229.888 1024 0 794.112 0 512S229.888 0 512 0s512 229.888 512 512-229.376 512-512 512z m0-988.16C249.344 35.84 35.84 249.344 35.84 512s213.504 476.16 476.16 476.16 476.16-213.504 476.16-476.16-213.504-476.16-476.16-476.16z"  /></svg>
                </a>
                <a class="ryvideo-controls-pause">
                  <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M327.68 272.896h101.888v478.72H327.68zM594.432 272.896H696.32v478.72h-101.888z"  /><path fill="#333333" d="M512 1024C229.888 1024 0 794.112 0 512S229.888 0 512 0s512 229.888 512 512-229.376 512-512 512z m0-988.16C249.344 35.84 35.84 249.344 35.84 512s213.504 476.16 476.16 476.16 476.16-213.504 476.16-476.16-213.504-476.16-476.16-476.16z"  /></svg>
                </a>
              </div>
              <span class="ryvideo-controls-currenttime">00:00</span>
              <div class="ryvideo-progress">
                <span class="ryvideo-progress-active"></span>
                <div class="ryvideo-progress-bar"></div>
                <span class="ryvideo-progress-slider"></span>
              </div>
              <span class="ryvideo-duration">00:00</span>
              <a class="ryvideo-controls-fullscreen">
                <span class="ryvideo-fullscreen-icon">
                  <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M0 85.504v852.992h1024V85.504H0z m529.92 788.992H66.048v-308.736h463.872v308.736z m433.664 4.096h-368.128V501.76H60.416V145.408h903.68v733.184z"  /><path fill="#333333" d="M839.168 217.6h-159.232v61.44h116.224L654.848 419.84l43.52 43.52L839.168 322.56v114.176h61.44V217.6z"  /></svg>
                </span>
                <span class="ryvideo-unfullscreen-icon">
                  <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M0 85.504v852.992h1024V85.504H0z m529.92 788.992H66.048v-308.736h463.872v308.736z m433.664 4.096h-368.128V501.76H60.416V145.408h903.68v733.184z"  /><path fill="#333333" d="M716.288 463.36H875.52v-61.44h-115.712L900.608 261.12l-43.008-43.52L716.288 358.4V244.224h-61.44v219.136z"  /></svg>
                </span>
              </a>
            </div>
          </div>
          <div class="ryvideo-loader">
            <div class="sk-fading-circle">
              <div class="sk-circle1 sk-circle"></div>
              <div class="sk-circle2 sk-circle"></div>
              <div class="sk-circle3 sk-circle"></div>
              <div class="sk-circle4 sk-circle"></div>
              <div class="sk-circle5 sk-circle"></div>
              <div class="sk-circle6 sk-circle"></div>
              <div class="sk-circle7 sk-circle"></div>
              <div class="sk-circle8 sk-circle"></div>
              <div class="sk-circle9 sk-circle"></div>
              <div class="sk-circle10 sk-circle"></div>
              <div class="sk-circle11 sk-circle"></div>
              <div class="sk-circle12 sk-circle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`

    this.container.innerHTML = tpl
    // set elements
    this.video = this.container.querySelector('video')
    this.wrapper = this.container.querySelector('.ryvideo')
    this.playAndPause = this.container.querySelector('.ryvideo-controls-play-pause')
    this.playBtn = this.container.querySelector('.ryvideo-controls-play')
    this.pauseBtn = this.container.querySelector('.ryvideo-controls-pause')
    this.progress = this.container.querySelector('.ryvideo-progress-bar')
    this.progressActive = this.container.querySelector('.ryvideo-progress-active')
    this.slider = this.container.querySelector('.ryvideo-progress-slider')
    this.currentTime = this.container.querySelector('.ryvideo-controls-currenttime')
    this.duration = this.container.querySelector('.ryvideo-duration')
    this.fullscreenBtn = this.container.querySelector('.ryvideo-controls-fullscreen')
    this.loader = this.container.querySelector('.ryvideo-loader')
  }
  attachEvents() {
    this.setVideoSource()
    this.video.addEventListener('loadedmetadata', this.handleLoadedMetaData, false)
    this.video.addEventListener('timeupdate', this.handleTimeUpdate, false)
    this.video.addEventListener('waiting', this.handleWaiting, false)
    this.video.addEventListener('playing', this.handlePlaying, false)
    this.video.addEventListener('ended', this.handleEned, false)
    this.playBtn.addEventListener('click', this.handlePlay, false)
    this.pauseBtn.addEventListener('click', this.handlePause, false)
    this.fullscreenBtn.addEventListener('click', this.handleToggleFullScreen, false)
    this.progress.addEventListener('click', this.seekTo, false)
    this.progressActive.addEventListener('click', this.seekTo, false)
    if (isTouchSupported()) {
      this.slider.addEventListener('touchstart', this.handleSliderDown, false)
    } else {
      this.slider.addEventListener('mousedown', this.handleSliderDown, false)
    }
  }
  setVideoSource() {
    const { src } = this.options
    const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
    if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
      const ms = new MediaSource()
      this.video.src = URL.createObjectURL(ms)
      ms.addEventListener('sourceopen', function() {
        const ms = this
        const sourceBuffer = ms.addSourceBuffer(mimeCodec)
        fetchSource(src).then(res => {
          sourceBuffer.addEventListener('updateend', () => {
            ms.endOfStream()
            this.video.play()
          })
          console.log(res)
          sourceBuffer.appendBuffer(res.data)
        })
      })
    } else {
      console.log('Unsupport MediaSource Or Codec')
      this.video.src = src
    }
  }
  handleLoadedMetaData() {
    this.hasLoadMeta = true
    this.duration.textContent = formatTime(this.video.duration)
  }
  handleTimeUpdate() {
    if (!this.sliderMoving) {
      this.currentTime.textContent = formatTime(this.video.currentTime)
      const rect = this.progress.getBoundingClientRect()
      let aw = parseFloat(this.video.currentTime / this.video.duration) * (rect.width - 16)
      if (aw > (rect.width - 16)) {
        aw = rect.width - 16
      }
      this.progressActive.style.width = aw + 'px'
      this.slider.style.left = aw + 'px'
    }
  }
  handleWaiting() {
    this.loadTimer = setTimeout(() => {
      this.loader.classList.add('show')
    }, 300)
  }
  handlePlaying() {
    if (this.loadTimer) clearTimeout(this.loadTimer)
    this.loader.classList.remove('show')
  }
  handleEned() {
    this.playAndPause.classList.remove('playing')
  }
  handlePlay() {
    const { onPlay } = this.options
    if (onPlay && typeof onPlay === 'function') {
      onPlay(this.video)
    } else {
      if (!this.video.currentSrc) {
        this.video.src = this.options.src
      }
      this.video.play()
      this.playAndPause.classList.add('playing')
      this.isPlaying = true
    }
  }
  handlePause() {
    this.video.pause()
    this.playAndPause.classList.remove('playing')
    this.isPlaying = false
  }
  handleToggleFullScreen() {
    if (this.isFullScreen) {
      this.isFullScreen = false
      this.fullscreenBtn.classList.remove('is-fullscreen')
      this.wrapper.classList.remove('fullscreen')
    } else {
      this.isFullScreen = true
      this.fullscreenBtn.classList.add('is-fullscreen')
      this.wrapper.classList.add('fullscreen')
    }
  }
  handleSliderDown() {
    if (!this.hasLoadMeta) return
    if (isTouchSupported()) {
      document.addEventListener('touchmove', this.handleSliderMove, false)
      document.addEventListener('touchend', this.handleSliderUp, false)
    } else {
      document.addEventListener('mousemove', this.handleSliderMove, false)
      document.addEventListener('mouseup', this.handleSliderUp, false)
    }
  }
  handleSliderMove(e) {
    if (!this.hasLoadMeta) return
    this.sliderMoveing = true
    let evt = e
    if (isTouchSupported()) {
      evt = e.touches[0]
    }
    this.setWhenSliderMove(evt)
  }
  handleSliderUp() {
    if (!this.hasLoadMeta) return
    this.sliderMoving = false
    if (!isTouchSupported()) {
      document.removeEventListener('mousemove', this.handleSliderMove, false)
      document.removeEventListener('mouseup', this.handleSliderUp, false)
    } else {
      document.removeEventListener('touchmove', this.handleSliderMove, false)
      document.removeEventListener('touchend', this.handleSliderUp, false)
    }
    if (this.goToCurrentTime) {
      this.video.currentTime = this.goToCurrentTime
      this.goToCurrentTime = null
    }
    if (this.isPlaying) {
      this.video.play()
      this.playAndPause.classList.add('playing')
    }
  }
  setWhenSliderMove(e) {
    this.video.pause()
    const rect = this.progress.getBoundingClientRect()
    let offset = e.pageX - rect.left
    if (offset < 0) {
      offset = 0
    }
    if (offset > (rect.width - 16)) {
      offset = rect.width - 16
    }
    this.progressActive.style.width = offset + 'px'
    this.slider.style.left = offset + 'px'
    this.goToCurrentTime = parseFloat((parseFloat(offset / (rect.width - 16)) * this.video.duration).toFixed(6))
    this.currentTime.textContent = formatTime(this.goToCurrentTime)
  }
  seekTo(e) {
    const rect = this.progress.getBoundingClientRect()
    let offset = e.pageX  - rect.left
    if (offset <= 0) {
      offset = 0
    }
    if (offset >= (rect.width -16)) {
      offset = rect.width -16
    }
    this.progressActive.style.width = offset + 'px'
    this.slider.style.left = offset + 'px'
    this.video.currentTime = parseFloat(offset / (rect.width - 16)) * this.video.duration
  }
}
window.WSVideoPlayer = WSVideoPlayer
export default WSVideoPlayer
