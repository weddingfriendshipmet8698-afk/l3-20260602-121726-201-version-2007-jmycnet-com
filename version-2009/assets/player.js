(function () {
  function initMoviePlayer(options) {
    var container = document.getElementById(options.id);
    if (!container) {
      return;
    }

    var video = container.querySelector("video");
    var cover = container.querySelector(".player-cover");
    var started = false;
    var hls = null;

    function begin() {
      if (!video) {
        return;
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      container.classList.add("is-playing");
      if (cover) {
        cover.hidden = true;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
        video.load();
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        window.setTimeout(function () {
          video.play().catch(function () {});
        }, 500);
        return;
      }

      video.src = options.source;
      video.load();
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("ended", function () {
        if (hls) {
          hls.stopLoad();
        }
      });
    }
  }

  window.initMoviePlayer = initMoviePlayer;
})();
