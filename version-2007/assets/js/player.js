import { H as Hls } from './hls-vendor.js';

(function () {
  const video = document.getElementById('movie-player');
  const button = document.getElementById('play-button');
  const status = document.getElementById('player-status');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-src');
  let initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initializePlayer() {
    if (initialized || !source) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('播放器已就绪');
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放器已就绪');
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放加载遇到问题，请刷新页面后重试');
        }
      });
      return;
    }

    video.src = source;
    setStatus('当前浏览器可能需要原生 HLS 支持');
  }

  function playVideo() {
    initializePlayer();
    const promise = video.play();

    if (promise && typeof promise.then === 'function') {
      promise
        .then(function () {
          if (button) {
            button.style.display = 'none';
          }
        })
        .catch(function () {
          setStatus('点击视频控件即可继续播放');
        });
    }
  }

  initializePlayer();

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (button) {
      button.style.display = 'none';
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.style.display = '';
    }
  });
})();
