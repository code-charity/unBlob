/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
1.0 Global variable
2.0 Modifiers
  2.1 Create object URL
  2.2 XMLHttpRequest
  2.3 Uint8Array
  2.4 Append buffer
3.0 User interface
  3.1 Create
  3.2 Resize
4.0 Media observer
5.0 Get bounding client rect
6.0 Mouse over
7.0 Initialization
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 GLOBAL VARIABLE
--------------------------------------------------------------------------------
The variable "unBlob" is used on the website side.
------------------------------------------------------------------------------*/

var unBlob = {
    active: false,
    blobs: '{}',
    media: '[]',
    mouse: '{x: 0,y: 0}',
    rects: '[]'
};


/*------------------------------------------------------------------------------
2.0 MODIFIERS
--------------------------------------------------------------------------------
The modification of JavaScript's standard, built-in objects.
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
2.1 CREATE OBJECT URL
--------------------------------------------------------------------------------
The modifier of the "URL.createObjectURL()" method.
------------------------------------------------------------------------------*/

unBlob.createObjectURL = function() {
    URL.createObjectURL = (function(original) {
        return function(source) {
            var value = original.apply(this, arguments);

            unBlob.blobs[value] = arguments[0];

            //console.log('createObjectURL', this, arguments);

            return value;
        };
    }(URL.createObjectURL));
};


/*------------------------------------------------------------------------------
2.2 XMLHttpRequest
--------------------------------------------------------------------------------
The modifier of the "XMLHttpRequest.prototype.open()" method.
------------------------------------------------------------------------------*/

unBlob.XMLHttpRequest = function() {
    XMLHttpRequest.prototype.open = (function(original) {
        return function() {
            this.addEventListener('load', function() {
                this.response.URL = this.responseURL;

                //console.log('XMLHttpRequest', this.response);
            });

            original.apply(this, arguments);
        };
    }(XMLHttpRequest.prototype.open));
};


/*------------------------------------------------------------------------------
2.3 UINT8ARRAY
--------------------------------------------------------------------------------
The modifier of the "Uint8Array()" constructor.
------------------------------------------------------------------------------*/

unBlob.Uint8Array = function() {
    Uint8Array.prototype.URL = '';

    Uint8Array = (function(original) {
        return function(buffer, byteOffset, length) {
            var object = new original(buffer, byteOffset, length);

            if (typeof buffer === 'object') {
                object.URL = buffer.URL;
            }

            //console.log('Uint8Array', object, arguments);

            return object;
        };
    }(Uint8Array));
};


/*------------------------------------------------------------------------------
2.4 APPENDBUFFER
--------------------------------------------------------------------------------
The modifier of the "SourceBuffer.appendBuffer()" method.
------------------------------------------------------------------------------*/

unBlob.appendBuffer = function() {
    SourceBuffer.prototype.appendBuffer = (function(original) {
        return function(source) {
            this.URL = source.URL;

            //console.log('appendBuffer', this, source.URL);

            original.apply(this, arguments);
        };
    }(SourceBuffer.prototype.appendBuffer));
};


/*------------------------------------------------------------------------------
3.0 USER INTERFACE
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
3.1 CREATE
------------------------------------------------------------------------------*/

unBlob.createUserInterface = function() {
    var container = document.createElement('div'),
        link = document.createElement('a');

    container.className = 'unblob-container--hidden';

    link.className = 'unblob-button'
    link.target = '_blank';
    link.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 19H6a1 1 0 01-1-1V6c0-.6.5-1 1-1h5c.6 0 1-.5 1-1s-.5-1-1-1H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-6c0-.6-.5-1-1-1s-1 .5-1 1v5c0 .6-.5 1-1 1zM14 4c0 .6.5 1 1 1h2.6l-9.1 9.1a1 1 0 101.4 1.4l9.1-9V9c0 .6.5 1 1 1s1-.5 1-1V4c0-.6-.5-1-1-1h-5a1 1 0 00-1 1z"/></svg>';

    container.appendChild(link);

    document.body.appendChild(container);

    unBlob.ui = container;
    unBlob.ui_link = link;
};


/*------------------------------------------------------------------------------
3.2 RESIZE
------------------------------------------------------------------------------*/


unBlob.resizeUserInterface = function() {
    if (unBlob.active) {
        var rect = unBlob.active;

        if (unBlob.ui.offsetLeft !== rect.left) {
            unBlob.ui.style.left = rect.left + 'px';
        }

        if (unBlob.ui.offsetTop !== rect.top) {
            unBlob.ui.style.top = rect.top + 'px';
        }

        if (unBlob.ui.offsetWidth !== rect.width) {
            unBlob.ui.style.width = rect.width + 'px';
        }

        if (unBlob.ui.offsetHeight !== rect.height) {
            unBlob.ui.style.height = rect.height + 'px';
        }
    }
};


/*------------------------------------------------------------------------------
4.0 MEDIA OBSERVER
------------------------------------------------------------------------------*/

unBlob.observe = function() {
    setInterval(function() {
        var elements = document.querySelectorAll('audio:not(.unblob-media),video:not(.unblob-media)');

        for (var i = 0, l = elements.length; i < l; i++) {
            var element = elements[i],
                data = element.getBoundingClientRect();

            element.classList.add('unblob-media');
            element.unblob_index = unBlob.rects.length;

            unBlob.media.push(element);

            unBlob.rects.push({
                index: unBlob.rects.length
            });

            element.addEventListener('timeupdate', function() {
                var data = this.getBoundingClientRect(),
                    rect = unBlob.rects[this.unblob_index];

                if (data && this.style.display != 'none') {

                    rect.left = data.left;
                    rect.top = data.top;
                    rect.width = data.width;
                    rect.height = data.height;

                    unBlob.resizeUserInterface();
                }
            });
        }
    }, 1000);
};


/*------------------------------------------------------------------------------
5.0 GET BOUNDING CLIENT RECT
------------------------------------------------------------------------------*/

unBlob.updateRects = function() {
    for (var i = 0, l = unBlob.media.length; i < l; i++) {
        var media = unBlob.media[i];

        if (media) {
            var rect = unBlob.rects[i],
                data = media.getBoundingClientRect();

            rect.left = data.left;
            rect.top = data.top;
            rect.width = data.width;
            rect.height = data.height;
        }
    }

    unBlob.resizeUserInterface();
};


/*------------------------------------------------------------------------------
6.0 MOUSE OVER
------------------------------------------------------------------------------*/

unBlob.mouseOver = function() {
    unBlob.active = false;

    for (var i = 0, l = unBlob.rects.length; i < l; i++) {
        var rect = unBlob.rects[i];

        if (
            unBlob.mouse.x > rect.left &&
            unBlob.mouse.y > rect.top &&
            unBlob.mouse.x < rect.left + rect.width &&
            unBlob.mouse.y < rect.top + rect.height
        ) {
            unBlob.active = rect;
        }
    }

    if (unBlob.active) {
        if (unBlob.ui && unBlob.ui.className !== 'unblob-container') {
            unBlob.ui.className = 'unblob-container';
        }

        var found = unBlob.blobs[unBlob.media[unBlob.active.index].src];

        if (
            found &&
            found.activeSourceBuffers &&
            found.activeSourceBuffers[0] &&
            found.activeSourceBuffers[0].URL
        ) {
            unBlob.ui_link.href = found.activeSourceBuffers[0].URL.replace(/(\&|\?)range\=[^&]*/, '');
        } else {
            unBlob.ui_link.href = unBlob.media[unBlob.active.index].src;
        }

        unBlob.resizeUserInterface();
    } else if (unBlob.ui && unBlob.ui.className !== 'unblob-container--hidden') {
        unBlob.ui.className = 'unblob-container--hidden';
    }
};


/*------------------------------------------------------------------------------
7.0 INITIALIZATION
------------------------------------------------------------------------------*/

unBlob.init = function() {
    this.createObjectURL();
    this.XMLHttpRequest();
    this.Uint8Array();
    this.appendBuffer();

    window.addEventListener('DOMContentLoaded', function() {
        unBlob.createUserInterface();
        unBlob.observe();

        setInterval(unBlob.mouseOver);

        window.addEventListener('popstate', unBlob.updateRects);
        window.addEventListener('scroll', unBlob.updateRects);

        window.addEventListener('mousemove', function(event) {
            unBlob.mouse.x = event.clientX;
            unBlob.mouse.y = event.clientY;
        });
    });
};