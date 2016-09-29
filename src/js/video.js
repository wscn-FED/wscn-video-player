(function (root, $) {
  function WSVideoPlayer(options) {
    var defaultOptions = {
      poster: '',
      src: '',
      container: '',
      autoPlay: false,
      loop: false,
      volumeValue: 5
    }
    if (!options.src) {
      throw new Error('must set the video source');
      return;
    }
    if (!options.container || (typeof options.container !== 'string')) {
      throw new Error('container must be set and only be string!');
      return;
    }
    this.options = $.extend({}, defaultOptions, options);
    this.video = null;
    this.container = $(`#${options.container}`);
    this.isPlaying = false;
    this.slideMoveHandler = null;
    this.slideMoveEndHandler = null;
    this.slideCurrentTime = null;
    this.init();
  }

  function isNotTouchEvent(e) {
    return e.touches.length > 1 || (e.type.toLowerCase() === 'touchedn' && e.touched.length > 0);
  }

  function formatTime(timestamp) {
    let secs = parseInt(timestamp % 60);
    let mins = parseInt((timestamp / 60) % 60);
    secs = (`0${secs}`).slice(-2);
    mins = (`0${mins}`).slice(-2);
    return `${mins}:${secs}`;
  }

  function setScrollStickToTopEvent() {
    let self = this;
    $(window).on('scroll', function (e) {
      let containerOffset = self.container.offset();
      let scrollTop = $(document).scrollTop();
      if (scrollTop > containerOffset.top) {
        if (self.isPlaying) {
          $('.ws-video').removeClass('ws-video-stick-top');
          self.videoConElem.addClass('ws-video-stick-top');
        }
      } else {
        self.videoConElem.removeClass('ws-video-stick-top');
      }
    });
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
    let template = `
        <div class="ws-video">
            <div class="ws-video-player">
                <video poster="${this.options.poster}">
                    <source src="${this.options.src}" type="video/mp4"></source>
                </video>
            </div>
            <div class="ws-video-controls">
                <div class="ws-video-controls-body">
                    <div class="ws-video-play-pause">
                        <button class="ws-video-play"></button>
                        <button class="ws-video-pause"></button>
                    </div>
                    <span class="ws-video-currenttime">00:00</span>
                    <div class="ws-video-progress">
                        <div class="ws-video-progress-slider"></div>
                        <div class="ws-video-progress-bar"></div>
                        <div class="ws-video-progress-active-bar"></div>
                    </div>
                    <span class="ws-video-fulltime">00:00</span>
                    <button class="ws-video-fullscreen"></button>
                </div>
            </div>
        </div>`;
    this.container.append(template);
    this.videoElem = this.container.find('video');
    this.video = this.videoElem[0];
    let width = this.container.width();
    this.video.width = width;
    this.videoConElem = this.container.find('.ws-video');
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
    this.video.addEventListener('loadstart', function () {
      console.log('video start loading')
    }, false);
    this.video.addEventListener('loadedmetadata', function (e) {
      console.log('loaded meta data...')
      let dimensions = {
        width: self.video.videoWidth,
        height: self.video.videoHeight
      };
      self.styleVideoPlayer(dimensions);
      self.setDuration(self.video.duration);
    }, false);

    this.video.addEventListener('durationchange', function () {
      console.log('duration change');
    }, false);

    this.video.addEventListener('loadeddata', function () {
      console.log('loaded data');
    }, false);

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

    this.playElem.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.play();
    });

    this.pauseElem.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.pause();
    });

    this.videoConElem.on('mouseleave', function (e) {
      if (self.options.controlDispearTime > 0) {
        setTimeout(function () {
          self.videoControlsElem.addClass('hide');
        }, self.options.controlDispearTime)
      }
    });

    this.videoConElem.on('mouseover', function (e) {
      self.videoControlsElem.removeClass('hide');
    });

    function handleProgressClickJump(e) {
      e.preventDefault();
      e.stopPropagation();
      let offset = self.progress.offset();
      let width = self.progress.width();
      let pageX = e.pageX;
      if (!pageX) {
        pageX = e.clientX + document.body.scrollLeft - document.body.clientLeft;
      }
      let diffWidth = (pageX - offset.left);
      self.video.currentTime = (diffWidth / width) * self.video.duration;
    }

    this.activeProgressbar.on('click', handleProgressClickJump);
    this.progressBar.on('click', handleProgressClickJump);

    this.fullScreenElem.on('click', function (e) {
      launchFullScreen(self.video)
    });

    self.slideMoveHandler = function (evt) {
      evt.stopPropagation();
      //here should pause the video
      self.video.pause();
      let offset = self.progress.offset();
      let width = self.progress.width();
      let pageX = evt.pageX;
      if (!pageX) {
        pageX = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
      }
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
      self.slideCurrentTime = (diffWidth / width) * self.video.duration;
      self.currentTimeElem.text(formatTime(self.slideCurrentTime));
    }

    self.slideMoveEndHandler = function (evt) {
      evt.stopPropagation();
      document.removeEventListener('mousemove', self.slideMoveHandler, false);
      self.video.currentTime = self.slideCurrentTime;
      self.slideCurrentTime = null;
      //if isPlaying should play again
      if (self.isPlaying) {
        self.video.play();
      }
    }

    this.progressbarSlider.on('mousedown', function (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      document.addEventListener('mousemove', self.slideMoveHandler, false);
      document.addEventListener('mouseup', self.slideMoveEndHandler, false);
    });

  }

  WSVideoPlayer.prototype.styleVideoPlayer = function (dimensions) {
    let width = this.container.width();
    let height = dimensions.height * (width / dimensions.width);
    this.video.width = width;
    this.video.height = height;
    this.videoConElem.css('height', height + 'px');
    this.videoConElem.css('width', width + 'px');
  }

  WSVideoPlayer.prototype.play = function () {
    this.isPlaying = true;
    this.playAndPauseElem.addClass('is-playing');
    this.video.play();
  }

  WSVideoPlayer.prototype.setStickTopWhenScroll = function () {
    setScrollStickToTopEvent.call(this);
  }

  WSVideoPlayer.prototype.pause = function () {
    this.isPlaying = false;
    this.playAndPauseElem.removeClass('is-playing');
    this.video.pause();
  }

  WSVideoPlayer.prototype.setDuration = function (duration) {
    this.fullTimeElem.text(formatTime(duration));
  }

  root.WSVideoPlayer = WSVideoPlayer;
})(window, jQuery);
