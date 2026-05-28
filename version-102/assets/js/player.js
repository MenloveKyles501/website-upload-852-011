import { H as Hls } from './vendor/hls-vendor-dru42stk.js';

function setStatus(box, message) {
    var status = box.querySelector('[data-player-status]');

    if (status) {
        status.textContent = message;
    }
}

function hideOverlay(box) {
    var overlay = box.querySelector('[data-player-overlay]');

    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function startPlayer(box) {
    var video = box.querySelector('video');
    var source = box.getAttribute('data-video-src');

    if (!video || !source) {
        setStatus(box, '当前影片暂未配置播放地址。');
        return;
    }

    hideOverlay(box);
    setStatus(box, '正在加载高清播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
                setStatus(box, '请点击播放器上的播放按钮继续播放。');
            });
        }, { once: true });
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(box, '播放源已就绪，正在开始播放。');
            video.play().catch(function () {
                setStatus(box, '请点击播放器上的播放按钮继续播放。');
            });
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setStatus(box, '播放源加载失败，请刷新页面或稍后再试。');
                hls.destroy();
            }
        });
        return;
    }

    setStatus(box, '当前浏览器不支持 HLS 播放，请更换现代浏览器。');
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
        var button = box.querySelector('[data-player-start]');
        var video = box.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                startPlayer(box);
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                hideOverlay(box);
            });
        }
    });
});
