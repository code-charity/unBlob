/*------------------------------------------------------------------------------
>>> unBlob
--------------------------------------------------------------------------------
1.0 Global variables
2.0 Observer
3.0 UI
4.0 Mouse
5.0 Keyboard
6.0 Init
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 GLOBAL VARIABLES
------------------------------------------------------------------------------*/

var elements = {},
    ui = false,
    link = false,
    values = {};

var boundingRects = [],
    mouse = [],
    activeElement;

function isset(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
}


/*------------------------------------------------------------------------------
0.0 INJECT SCRIPT
------------------------------------------------------------------------------*/

function injectScript(string) {
    var script = document.createElement('script');

    script.textContent = string;

    document.documentElement.appendChild(script);

    script.remove();
}


/*------------------------------------------------------------------------------
2.0 OBSERVER
------------------------------------------------------------------------------*/

function observer() {
    if (document.querySelector('video:not(.unblob)')) {
        var videos = document.querySelectorAll('video:not(.unblob)');

        for (var i = 0, l = videos.length; i < l; i++) {
            var video = videos[i];

            video.classList.add('unblob');
            video.dataset.unblobIndex = boundingRects.length;

            boundingRects.push([0, 0, 0, 0]);
        }
    }
}

function updateBoundingRect(target) {
    var bounding_rect = target.getBoundingClientRect();

    boundingRects[target.dataset.unblobIndex] = [
        bounding_rect.left,
        bounding_rect.top,
        bounding_rect.width,
        bounding_rect.height
    ];

    resizeUI();
}

function updateBoundingRectAll() {
    if (document.querySelector('.unblob')) {
        var videos = document.querySelectorAll('.unblob');

        for (var i = 0, l = videos.length; i < l; i++) {
            updateBoundingRect(videos[i]);
        }
    }

    videosDetection();
}

function videoDetection(target) {
    var found = false,
        x = mouse[0],
        y = mouse[1],
        bounding_rect = boundingRects[target.dataset.unblobIndex];

    if (
        x >= bounding_rect[0] &&
        y >= bounding_rect[1] &&
        x < bounding_rect[0] + bounding_rect[2] &&
        y < bounding_rect[1] + bounding_rect[3]
    ) {
        found = target;
    }

    if (found) {
        activeElement = found;
        link.href = activeElement.src;
        updateBoundingRect(target);
        resizeUI();

        ui.classList.remove('unblob--hidden');
    } else if (activeElement) {
        activeElement = undefined;

        ui.classList.add('unblob--hidden');
    }
}

function videosDetection() {
    if (document.querySelector('.unblob')) {
        var videos = document.querySelectorAll('.unblob'),
            found = false,
            x = mouse[0],
            y = mouse[1];

        for (var i = 0, l = videos.length; i < l; i++) {
            var bounding_rect = boundingRects[videos[i].dataset.unblobIndex];

            if (
                x >= bounding_rect[0] &&
                y >= bounding_rect[1] &&
                x < bounding_rect[0] + bounding_rect[2] &&
                y < bounding_rect[1] + bounding_rect[3]
            ) {
                found = videos[i];
            }
        }

        if (found) {
            activeElement = found;
            link.href = activeElement.src;

            ui.classList.remove('unblob__outline--hidden');
        } else if (activeElement) {
            activeElement = undefined;

            ui.classList.add('unblob__outline--hidden');
        }
    }
}


/*------------------------------------------------------------------------------
3.0 UI
------------------------------------------------------------------------------*/

function createUI() {
    ui = document.createElement('div');
    link = document.createElement('a');

    ui.className = 'unblob__outline unblob__outline--hidden';
    link.className = 'unblob__button'

    link.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 19H6a1 1 0 01-1-1V6c0-.6.5-1 1-1h5c.6 0 1-.5 1-1s-.5-1-1-1H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-6c0-.6-.5-1-1-1s-1 .5-1 1v5c0 .6-.5 1-1 1zM14 4c0 .6.5 1 1 1h2.6l-9.1 9.1a1 1 0 101.4 1.4l9.1-9V9c0 .6.5 1 1 1s1-.5 1-1V4c0-.6-.5-1-1-1h-5a1 1 0 00-1 1z"/></svg>';

    ui.appendChild(link);

    document.body.appendChild(ui);
}

function resizeUI() {
    if (isset(activeElement)) {
        var bounding_rect = boundingRects[activeElement.dataset.unblobIndex];

        if (!ui || !(ui || {}).parentNode) {
            createUI();
        }

        if (ui.offsetLeft !== bounding_rect[0]) {
            ui.style.left = bounding_rect[0] + 'px';
        }

        if (ui.offsetTop !== bounding_rect[1]) {
            ui.style.top = bounding_rect[1] + 'px';
        }

        if (ui.offsetWidth !== bounding_rect[2]) {
            ui.style.width = bounding_rect[2] + 'px';
        }

        if (ui.offsetHeight !== bounding_rect[3]) {
            ui.style.height = bounding_rect[3] + 'px';
        }
    }
}


/*------------------------------------------------------------------------------
4.0 MOUSE
------------------------------------------------------------------------------*/

window.addEventListener('mousemove', function(event) {
    mouse[0] = event.clientX;
    mouse[1] = event.clientY;

    videosDetection();
});


/*------------------------------------------------------------------------------
6.0 INIT
------------------------------------------------------------------------------*/

window.addEventListener('resize', function() {
    setTimeout(function() {
        updateBoundingRectAll();
    }, 100);
});

window.addEventListener('scroll', updateBoundingRectAll);
window.addEventListener('mousewheel', updateBoundingRectAll);

window.addEventListener('DOMContentLoaded', function() {
    createUI();

    observer();

    setInterval(observer, 1000);
});








/*injectScript(`
	URL.createObjectURL = (function(original) {
	    return function() {
	    	var result = original.apply(this, arguments);

	        console.log(arguments, result);

	        return result;
	    }
	})(URL.createObjectURL);

	XMLHttpRequest.prototype.open = (function(original) {
	    return function() {
	    	console.log(arguments[1]);

	        return original.apply(this, arguments);
	    }
	})(XMLHttpRequest.prototype.open);
`);*/









chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'media-url') {
        console.log('BACKGROUND', request.url);
    }
});