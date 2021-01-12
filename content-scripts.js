/*------------------------------------------------------------------------------
>>> UNBLOB
--------------------------------------------------------------------------------
# Global variables
# Inject script
# User interface
# Search videos
# Update rects
# On mouse over
# Initialization
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
# GLOBAL VARIABLES
------------------------------------------------------------------------------*/

var unBlob_blobs = {},
    ui = false,
    ui_link = false,
    videos = [],
    rects = [],
    mouse = {
        x: 0,
        y: 0
    };


/*------------------------------------------------------------------------------
# INJECT SCRIPT
------------------------------------------------------------------------------*/

function injectScript(string) {
    var script = document.createElement('script');

    script.textContent = string;

    document.documentElement.appendChild(script);

    //script.remove();
}


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

        var found = unBlob_blobs[videos[active.index].src];

        if (found) {
            ui_link.href = found;
        } else {
            ui_link.href = videos[active.index].src;
        }

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

injectScript(`
    var unBlob_blobs = {};

    XMLHttpRequestPrototypeOpen = XMLHttpRequest.prototype.open;
    SourceBufferPrototypeAppendBuffer = SourceBuffer.prototype.appendBuffer;

    MediaSource.prototype.blobSrc = false;
    ArrayBuffer.prototype.URL = false;
    SourceBuffer.prototype.URL = false;
    Uint8Array.prototype.URL = false;


    URL.createObjectURL = (function(original) {
        return function() {
            var result = original.apply(this, arguments);
            
            //console.log('createObjectURL', arguments, result);

            this.blobSrc = result;

            unBlob_blobs[result] = arguments[0];
            //unBlob_blobs[result] = arguments[0].sourceBuffers[0].URL.replace(/(\\&|\\?)range\\=[^&]*/, '');
            
            return result;
        }
    })(URL.createObjectURL);


    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            this.response.URL = this.responseURL;

            //console.log('XMLHttpRequest', this.response);
        });

        XMLHttpRequestPrototypeOpen.apply(this, arguments, arguments.callee);
    };


    Uint8Array = (function(Uint8Array) {
        return function(buffer, byteOffset, length) {
            var a;

            a = new Uint8Array(buffer, byteOffset, length);

            a.URL = buffer.URL;

            //console.log('Uint8Array', a);

            return a;
        };
    }(Uint8Array));


    SourceBuffer.prototype.appendBuffer = function() {
        var a = SourceBufferPrototypeAppendBuffer.apply(this, arguments);

        this.URL = arguments[0].URL;

        //console.log('SourceBuffer', arguments, a);

        var data = {};

        for (var key in unBlob_blobs) {
            var item = unBlob_blobs[key];

            if (
                item.sourceBuffers &&
                item.sourceBuffers[0] &&
                item.sourceBuffers[0].URL
            ) {
                data[key] = item.sourceBuffers[0].URL.replace(/(\\&|\\?)range\\=[^&]*/, '');
            }
        }

        document.dispatchEvent(new CustomEvent('unblob-updated-source-buffer', {
            detail: data
        }));
    };
`);

document.addEventListener('unblob-updated-source-buffer', function(event) {
    unBlob_blobs = event.detail;
});