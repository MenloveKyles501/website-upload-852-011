(function () {
  var box = document.querySelector('[data-player-box]');

  if (!box) {
    return;
  }

  var video = box.querySelector('video');
  var cover = box.querySelector('[data-player-cover]');
  var button = box.querySelector('[data-player-button]');
  var stream = video ? video.getAttribute('data-stream') : '';
  var hls = null;
  var ready = false;

  var load = function () {
    if (!video || !stream || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  };

  var start = function () {
    load();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        video.controls = true;
      });
    }
  };

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      start();
    });
  }

  if (cover) {
    cover.addEventListener('click', function () {
      start();
    });
  }

  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });
})();
