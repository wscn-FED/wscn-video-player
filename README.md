# WS Video Player

--------------------------------------------------------------------------------

## Quick start

```html
<div id="video"></div>



<script src="jquery.min.js"></script>
<script src="./dist/ws-video-player.min.js></script>
<script type="text/javascript">
  $(function() {
    var video = new WSVideoPlayer({
            container: 'video',
            src: 'http://7xj610.com1.z0.glb.clouddn.com/what-most-schools-dont-teach.mp4',
            poster: 'http://7xj610.com1.z0.glb.clouddn.com/Rectangle-poster.png',
            autoPlay: false,
            loop: true,  
            controlDispearTime: 2000,
            stickToTopWhenScroll: true
        });
  });
</script>
```

## About options

```
container: the container of your video in the html (essential)

src: your video source url(mp4) (essential)

poster: video poster (optional)

autoPlay: set video autoplay (optional defualt: false)

loop: if loop playing video (optional defaul: false)

controlDispearTime: how long when the controls fadeout (optional default: 2000, if set -1 imply not dispear)

stickToTopWhenScroll: when scroll page to overlap video whether stick to top window (optional default: false)
```

## Dev

`$ npm install`

`$ npm run dev`

`$ npm run build` (for production)
