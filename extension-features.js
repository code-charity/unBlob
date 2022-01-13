/*--------------------------------------------------------------
>>> EXTENSION FEATURES
----------------------------------------------------------------
# Global variable
# Storage
	# Import
	# Change
# Events
	# Data
	# Features
# User interface
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

extension.prefix = 'unblob';








/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

document.addEventListener('storage-import', function () {
	var items = extension.storage.items;

	if (items.hasOwnProperty('hide_shortcut') === false) {
        items.hide_shortcut = {
            keys: {
                72: {
                    key: 'h'
                }
            }
        };
    }
});








/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# FEATURES
--------------------------------------------------------------*/

extension.events.features.hide_shortcut = function () {
    if (extension.videos.active) {
        extension.ui.actions.toggle();

        extension.ui.sleep();
    }
};


/*--------------------------------------------------------------
# MOUSE
--------------------------------------------------------------*/

extension.events.mouse.click = function (event) {
    if (extension.ui.hover(extension.ui.surface.getBoundingClientRect())) {
        extension.ui.actions.button();
    }

    if (
        extension.storage.items.hidden !== true &&
        extension.ui.hover(extension.ui.surface.getBoundingClientRect())
    ) {
        event.preventDefault();
        event.stopPropagation();

        return false;
    }
};








/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CREATE
--------------------------------------------------------------*/

document.addEventListener('ui-create', function (event) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	extension.ui.button = document.createElement('div');

    extension.ui.button.className = extension.prefix + '__button';

    svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
    path.setAttributeNS(null, 'd', 'M18 19H6a1 1 0 01-1-1V6c0-.6.5-1 1-1h5c.6 0 1-.5 1-1s-.5-1-1-1H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-6c0-.6-.5-1-1-1s-1 .5-1 1v5c0 .6-.5 1-1 1zM14 4c0 .6.5 1 1 1h2.6l-9.1 9.1a1 1 0 101.4 1.4l9.1-9V9c0 .6.5 1 1 1s1-.5 1-1V4c0-.6-.5-1-1-1h-5a1 1 0 00-1 1z');

    svg.appendChild(path);
    extension.ui.button.appendChild(svg);

    extension.ui.surface.appendChild(extension.ui.button);
});


/*--------------------------------------------------------------
# STYLES
--------------------------------------------------------------*/

document.addEventListener('ui-styles', function () {
	var storage = extension.storage.items;

    if (storage.background_color) {
        if (storage.hasOwnProperty('opacity')) {
            extension.ui.surface.style.setProperty('background-color', 'rgba(' + storage.background_color.join(',') + ',' + storage.opacity + ')', 'important');
        } else {
            extension.ui.surface.style.setProperty('background-color', 'rgba(' + storage.background_color.join(',') + ',0.8)', 'important');
        }
    }

    if (storage.text_color) {
        extension.ui.surface.style.setProperty('color', 'rgb(' + storage.text_color.join(',') + ')', 'important');
        extension.ui.surface.style.setProperty('--unblob-color', storage.text_color.join(','), 'important');
    }
});


/*--------------------------------------------------------------
# ACTIONS
--------------------------------------------------------------*/

extension.ui.actions.button = function () {
    console.log('button');
    var video = extension.videos.active,
        src = video.currentSrc;

    if (src.indexOf('blob:') !== 0) {
        window.open(src, '_blank');
    } else {
        window.dispatchEvent(new CustomEvent('unblob', {
            detail: video.src
        }));
    }
};






var script = document.createElement('script');

script.src = chrome.runtime.getURL('website-script.js');
script.addEventListener('load', function () {
    this.remove();
});

document.documentElement.appendChild(script);