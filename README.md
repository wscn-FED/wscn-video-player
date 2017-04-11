# WS Video Player

--------------------------------------------------------------------------------

## Quick start

```html
<div id="video-player"></div>

<script src="./dist/ws-video.js></script>
<script type="text/javascript">
  window.onload = function() {
    var container = document.querySelector('#video-player')
    new WSVideoPlayer(container, {
      src: 'http://ocphdh79p.bkt.clouddn.com/be3edbea13dd99f485f5e3ad3d15579c.mp4',
      poster: 'http://ocphdh79p.bkt.clouddn.com/cheap-thrills.png',
      autoPlay: false,
      loop: false
    })
  }
</script>
```

## Screen Shot

![shot](./screen/shot.png)


## About options

## Dev

`$ npm install`

`$ npm run dev`

`$ npm run build` (for production)
