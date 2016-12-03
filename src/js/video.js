function WSVideoPlayer(options) {
  var defaultOptions = {
    poster: '',
    src: '',
    container: '',
    autoPlay: false,
    loop: false,
    volumeValue: 5,
    pay: {
      isPaid: false,
      payUrl: ''
    }
  }
  if (!options.src) {
    throw new Error('must set the video source');
    return false;
  }
  if (!options.container || (typeof options.container !== 'string')) {
    throw new Error('container must be set and only be string!');
    return false;
  }
  this.options = $.extend({}, defaultOptions, options);
  this.video = null
  this.container = $('#' + options.container)
  this.isPlaying = false
  this.init();
}
function checkTouchEventSupported() {
  return ('ontouchstart' in window) || window.DocumentTouch && (document instanceof DocumentTouch);
}
function pauseEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}
function formatTime(timestamp) {
  let secs = parseInt(timestamp % 60);
  let mins = parseInt((timestamp / 60) % 60);
  secs = (`0${secs}`).slice(-2);
  mins = (`0${mins}`).slice(-2);
  return `${mins}:${secs}`;
}
function getEventPageX(evt) {
  let pageX;
  if (/^touch/ig.test(evt.type)) {
    if (evt.touches && evt.touches.length > 0) {
      let evtTouch = evt.touches[0];
      pageX = evtTouch.pageX;
    }
  } else {
    pageX = evt.pageX;
    if (!pageX) {
      pageX = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
    }
  }
  return pageX;
}
function launchFullScreen(elem) {
  if (!elem.fullscreenElement && // alternative standard method
    !elem.mozFullScreenElement && !elem.webkitFullscreenElement && !elem.msFullscreenElement) {
    var requestFullScreen = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
    requestFullScreen.call(elem);
  }
}
WSVideoPlayer.prototype.init = function () {
  // init templates
  // set video dom element
  //attach all events
  this.generateTemplate();
  this.attachEvents();
  if (this.options.autoPlay) {
    this.video.autoplay = true;
    this.isPlaying = true;
    this.play();
  }
  if (this.options.loop) {
    this.video.loop = true;
  }
  if (this.options.stickToTopWhenScroll) {
    this.setStickTopWhenScroll();
  }
}

WSVideoPlayer.prototype.generateTemplate = function () {
  const mediaTpl = `<div class="ws-video-player">
                <video poster="${this.options.poster}" src="${this.options.src}"></video>
            </div>`
  const template = `
      <div class="ws-video">
          <div class="ws-video-top">
            ${mediaTpl}
            <div class="ws-video-controls">
                <div class="ws-video-controls-body">
                    <div class="ws-video-play-pause">
                        <div class="ws-video-play">
                          <i class="iconfont">&#xe60a;</i>
                        </div>
                        <div class="ws-video-pause">
                          <i class="iconfont">&#xe60b;</i>
                        </div>
                    </div>
                    <span class="ws-video-currenttime">00:00</span>
                    <div class="ws-video-progress">
                        <div class="ws-video-progress-slider"></div>
                        <div class="ws-video-progress-bar"></div>
                        <div class="ws-video-progress-active-bar"></div>
                    </div>
                    <span class="ws-video-fulltime">00:00</span>
                    <button class="ws-video-fullscreen">
                      <i class="iconfont">&#xe608;</i>
                    </button>
                </div>
            </div>
          </div>
          <div class="ws-video-title">
            <span class="video-title-text">${this.options.title}</span>
          </div>
      </div>`;
  this.container.append(template);
  this.videoElem = this.container.find('video');
  this.video = this.videoElem[0];
  let width = this.container.width();
  this.video.width = width;
  this.videoConElem = this.container.find('.ws-video');
  this.videoTopElem = this.container.find('.ws-video-top');
  this.playAndPauseElem = this.container.find('.ws-video-play-pause');
  this.playElem = this.container.find('.ws-video-play');
  this.pauseElem = this.container.find('.ws-video-pause');
  this.currentTimeElem = this.container.find('.ws-video-currenttime');
  this.progress = this.container.find('.ws-video-progress');
  this.activeProgressbar = this.container.find('.ws-video-progress-active-bar');
  this.progressBar = this.container.find('.ws-video-progress-bar');
  this.progressbarSlider = this.container.find('.ws-video-progress-slider');
  this.fullTimeElem = this.container.find('.ws-video-fulltime');
  this.videoControlsElem = this.container.find('.ws-video-controls');
  this.fullScreenElem = this.container.find('.ws-video-fullscreen');
}

WSVideoPlayer.prototype.attachEvents = function () {
  let self = this;
  let isTouchEventSupported = checkTouchEventSupported();
  this.video.addEventListener('loadstart', function () {
    console.log('video start loading')
  }, false);
  this.video.addEventListener('loadedmetadata', function (e) {
    console.log('loaded meta data...')
    const dimensions = {
      width: self.video.videoWidth,
      height: self.video.videoHeight
    };
    // cache the original dimensions,
    self.videoDimensions = dimensions;
    self.styleVideoPlayer(dimensions);
    self.setDuration(self.video.duration);
    //check pay status
    self.checkPayStatus()

  }, false);

  this.video.addEventListener('durationchange', function () {
    console.log('duration change');
  }, false);

  this.video.addEventListener('loadeddata', function () {
    console.log('loaded data');
  }, false);
  this.video.addEventListener('play', function(e) {
    if (!self.options.pay.isPaid) {
      location.href = self.options.pay.payUrl
      return
    }
  })
  this.video.addEventListener('timeupdate', function (e) {
    //update currentTime
    let currentTime = self.video.currentTime;
    self.currentTimeElem.text(formatTime(currentTime));

    //update progress bar
    let duration = self.video.duration;

    let ratio = (currentTime / duration) * 100;
    self.activeProgressbar.css('width', ratio + '%');
    self.progressbarSlider.css('left', ratio + '%');

  }, false);

  this.video.addEventListener('ended', function () {
    self.isPlaying = false;
    self.playAndPauseElem.removeClass('is-playing');
  }, false);

  function handleProgressClickJump(e) {
    pauseEvent(e);
    let offset = self.progress.offset();
    let width = self.progress.width();
    let pageX = getEventPageX(e);
    let diffWidth = (pageX - offset.left);
    self.video.currentTime = (diffWidth / width) * self.video.duration;
  }
  if (isTouchEventSupported) {
    this.playElem[0].addEventListener('touchstart', function (e) {
      pauseEvent(e);
      self.play();
    }, false);
    this.pauseElem[0].addEventListener('touchstart', function (e) {
      pauseEvent(e);
      self.pause();
    }, false);
    this.activeProgressbar[0].addEventListener('touchstart', handleProgressClickJump, false);
    this.progressBar[0].addEventListener('touchstart', handleProgressClickJump, false);
    this.progressbarSlider[0].addEventListener('touchstart', handleProgressClickJump, false);
    this.fullScreenElem[0].addEventListener('touchstart', function (e) {
      pauseEvent(e);
      launchFullScreen(self.video)
    }, false);

  } else {
    this.playElem.on('click', function (e) {
      pauseEvent(e);
      self.play();
    });
    this.pauseElem.on('click', function (e) {
      pauseEvent(e);
      self.pause();
    });

    this.activeProgressbar.on('click', handleProgressClickJump);
    this.progressBar.on('click', handleProgressClickJump);
    this.progressbarSlider.on('click', handleProgressClickJump);

    this.fullScreenElem.on('click', function (e) {
      pauseEvent(e);
      launchFullScreen(self.video)
    });

  }

  //handle progress slider actions
  const slideMoveHandler = function (evt) {
    pauseEvent(evt);
    let offset = self.progress.offset();
    let width = self.progress.width();
    let pageX = getEventPageX(evt);
    let diffWidth = (pageX - offset.left);
    if (diffWidth <= 0) {
      diffWidth = 0
    }
    if (diffWidth >= width) {
      diffWidth = width;
    }
    let ratio = (diffWidth / width) * 100;
    self.progressbarSlider.css('left', ratio + '%');
    self.activeProgressbar.css('width', ratio + '%');
    let slideCurrentTime = (diffWidth / width) * self.video.duration;
    self.currentTimeElem.text(formatTime(slideCurrentTime));
    self.video.currentTime = slideCurrentTime;
  }

  //add touch events if touch supported
  if (isTouchEventSupported) {
    this.progressbarSlider[0].addEventListener('touchstart', function (evt) {
      evt.preventDefault();
      document.addEventListener('touchmove', slideMoveHandler, false);
    });
    document.addEventListener('touchend', function (evt) {
      evt.preventDefault();
      document.removeEventListener('touchmove', slideMoveHandler, false);
    }, false);
  } else {
    this.progressbarSlider.on('mousedown', function (evt) {
      document.addEventListener('mousemove', slideMoveHandler, false);
    });
    document.addEventListener('mouseup', function () {
      document.removeEventListener('mousemove', slideMoveHandler, false);
    }, false);
  }
}

WSVideoPlayer.prototype.styleVideoPlayer = function (dimensions, isRestyle=false) {
  // according to 16:9 ratio
  let width = this.container.width();
  if (isRestyle) {
    width = this.videoConElem.width();
  }
  let height = 9 * width / 16
  this.video.width = width;
  this.video.height = Math.floor(height + 1);//+1 for fix gutter around the video tag
  this.videoTopElem.css('height', height + 'px');
  this.videoTopElem.css('width', width + 'px');
}

WSVideoPlayer.prototype.checkPayStatus = function() {
  if (!this.options.pay.isPaid) {
    this.videoElem.removeAttr('src')
  }
}

WSVideoPlayer.prototype.restyleVideo = function() {
  this.styleVideoPlayer(this.videoDimensions, true);
}

WSVideoPlayer.prototype.setStickTopWhenScroll = function () {
  const self = this;
  if (checkTouchEventSupported()) {
    document.addEventListener('touchmove', function (e) {
      let containerOffset = self.container.offset();
      let scrollTop = $(document).scrollTop();
      if (scrollTop > containerOffset.top) {
        if (self.isPlaying) {
          if (!self.videoConElem.hasClass('ws-video-stick-top')) {
            $('.ws-video').removeClass('ws-video-stick-top');
            self.videoConElem.addClass('ws-video-stick-top');
            self.restyleVideo();
          }
        }
      } else {
        if (self.videoConElem.hasClass('ws-video-stick-top')) {
          self.videoConElem.removeClass('ws-video-stick-top');
          self.restyleVideo();
        }
      }
    }, false);
  } else {
    $(window).on('scroll', function (e) {
      let containerOffset = self.container.offset();
      let scrollTop = $(document).scrollTop();
      if (scrollTop > containerOffset.top) {
        if (self.isPlaying) {
          if (!self.videoConElem.hasClass('ws-video-stick-top')) {
            $('.ws-video').removeClass('ws-video-stick-top');
            self.videoConElem.addClass('ws-video-stick-top');
            self.restyleVideo();
          }
        }
      } else {
        if (self.videoConElem.hasClass('ws-video-stick-top')) {
          self.videoConElem.removeClass('ws-video-stick-top');
          self.restyleVideo();
        }
      }
    });
  }
}
WSVideoPlayer.prototype.play = function () {
  if (!this.options.pay.isPaid) {
    location.href = this.options.pay.payUrl
    return 
  } else {
    this.isPlaying = true;
    this.playAndPauseElem.addClass('is-playing');
    this.video.play();
  }
}
WSVideoPlayer.prototype.pause = function () {
  this.isPlaying = false;
  this.playAndPauseElem.removeClass('is-playing');
  this.video.pause();
}

WSVideoPlayer.prototype.setDuration = function (duration) {
  this.fullTimeElem.text(formatTime(duration));
}

module.exports = WSVideoPlayer;
