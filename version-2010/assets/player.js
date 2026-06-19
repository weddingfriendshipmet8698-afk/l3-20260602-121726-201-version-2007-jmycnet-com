import { H as Hls } from './hls-vendor-dru42stk.js';

function initializePlayer(card) {
  const video = card.querySelector('[data-video]');
  const startButton = card.querySelector('[data-player-start]');
  const overlay = card.querySelector('[data-player-overlay]');
  const status = card.querySelector('[data-player-status]');
  const source = video ? video.dataset.src : '';
  let attached = false;
  let hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function attachSource() {
    if (!video || !source || attached) {
      return;
    }

    attached = true;
    setStatus('正在加载播放源...');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪');
      });
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络波动，正在重试...');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码重试中...');
          hls.recoverMediaError();
        } else {
          setStatus('当前浏览器无法继续播放该源');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('播放源已就绪');
    } else {
      video.src = source;
      setStatus('已尝试使用浏览器原生播放器');
    }
  }

  async function play() {
    if (!video) {
      return;
    }
    attachSource();
    try {
      await video.play();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus('正在播放');
    } catch (error) {
      setStatus('点击播放器控制栏可继续播放');
    }
  }

  if (startButton) {
    startButton.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
    video.addEventListener('ended', function () {
      setStatus('播放结束');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-card]').forEach(initializePlayer);
});
