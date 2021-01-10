/*------------------------------------------------------------------------------
>>> UNBLOB
--------------------------------------------------------------------------------
# Global variables
# User interface
# Search videos
# Update rects
# On mouse over
# Initialization
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
# GLOBAL VARIABLES
------------------------------------------------------------------------------*/

var ui = false,
    ui_link = false;
videos = [],
    rects = [],
    mouse = {
        x: 0,
        y: 0
    };


/*------------------------------------------------------------------------------
# USER INTERFACE
------------------------------------------------------------------------------*/

function createUI() {
    ui = document.createElement('div');
    ui_link = document.createElement('a');

    ui.className = 'unblob-outline unblob-outline--hidden';
    ui_link.className = 'unblob-button'

    ui_link.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 19H6a1 1 0 01-1-1V6c0-.6.5-1 1-1h5c.6 0 1-.5 1-1s-.5-1-1-1H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-6c0-.6-.5-1-1-1s-1 .5-1 1v5c0 .6-.5 1-1 1zM14 4c0 .6.5 1 1 1h2.6l-9.1 9.1a1 1 0 101.4 1.4l9.1-9V9c0 .6.5 1 1 1s1-.5 1-1V4c0-.6-.5-1-1-1h-5a1 1 0 00-1 1z"/></svg>';

    ui.appendChild(ui_link);

    document.body.appendChild(ui);
}

function resizeUI(rect) {
    if (ui.offsetLeft !== rect.left) {
        ui.style.left = rect.left + 'px';
    }

    if (ui.offsetTop !== rect.top) {
        ui.style.top = rect.top + 'px';
    }

    if (ui.offsetWidth !== rect.width) {
        ui.style.width = rect.width + 'px';
    }

    if (ui.offsetHeight !== rect.height) {
        ui.style.height = rect.height + 'px';
    }
}


/*------------------------------------------------------------------------------
# SEARCH VIDEOS
------------------------------------------------------------------------------*/

function searchVideos() {
    var unlisted_video = document.querySelector('video:not(.unblob-video)');

    if (unlisted_video) {
        unlisted_video.classList.add('unblob-video');

        videos.push(unlisted_video);
        rects.push({
            index: rects.length
        });

        updateRects();
    }
}


/*------------------------------------------------------------------------------
# UPDATE RECTS
------------------------------------------------------------------------------*/

function updateRects() {
    for (var i = 0, l = videos.length; i < l; i++) {
        var video = videos[i];

        if (video) {
            var rect = rects[i],
                data = video.getBoundingClientRect();

            rect.left = data.left;
            rect.top = data.top;
            rect.width = data.width;
            rect.height = data.height;
        }
    }

    isHover();
}

window.addEventListener('scroll', updateRects);
window.addEventListener('mousewheel', updateRects);

window.addEventListener('resize', function() {
    setTimeout(function() {
        updateRects();
    }, 100);
});


/*------------------------------------------------------------------------------
# ON MOUSE OVER
------------------------------------------------------------------------------*/

function isHover() {
    var active = false;

    for (var i = 0, l = rects.length; i < l; i++) {
        var rect = rects[i];

        if (
            mouse.x > rect.left &&
            mouse.y > rect.top &&
            mouse.x < rect.left + rect.width &&
            mouse.y < rect.top + rect.height
        ) {
            active = rect;
        }
    }

    if (active) {
        if (ui) {
            ui.classList.remove('unblob-outline--hidden');
        }

        ui_link.href = videos[active.index].src;

        resizeUI(active);
    } else if (ui) {
        ui.classList.add('unblob-outline--hidden');
    }
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    isHover();
});


/*------------------------------------------------------------------------------
# INITIALIZATION
------------------------------------------------------------------------------*/

window.addEventListener('DOMContentLoaded', function() {
    createUI();

    setInterval(searchVideos, 1000);
});