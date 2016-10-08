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
container: video容器（必需）

src: video source的链接(必需)

poster: video poster (可选)

autoPlay: 自动播放video (可选 默认不自动播放 false)

loop: 循环播放视频 (可选 默认不循环 false)

controlDispearTime: 视频控制bar隐藏 (可选 默认2秒即 2000, 如果设为负值如-1 不隐藏)

stickToTopWhenScroll: 滚动播放视频位置，是否视频固定在左上角(可选 默认false)
```

## Dev

`$ npm install`

`$ npm run dev`

`$ npm run build` (for production)
