/*--------------------------------------------------------------
>>> UNBLOB
----------------------------------------------------------------
# Global variable
# DOM Observer
# Updaters
# User Interface
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var unblob = {
    active: false,
    cursor: {
        x: 0,
        y: 0
    },
    videos: [],
    rects: [],
    ui: document.createElement('div')
};


/*--------------------------------------------------------------
# DOM OBSERVER
--------------------------------------------------------------*/

unblob.mutations = new MutationObserver(function (mutationList) {
    for (var i = 0, l = mutationList.length; i < l; i++) {
        var mutation = mutationList[i];

        if (mutation.type === 'childList') {
            for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
                this.update('added', mutation.addedNodes[j]);
            }

            for (var j = 0, k = mutation.removedNodes.length; j < k; j++) {
                var node = mutation.removedNodes[j];

                this.update('removed', node);

                if (node === unblob.ui && document.body) {
                    unblob.ui.append();
                }
            }
        }
    }
});


/*--------------------------------------------------------------
# UPDATERS
--------------------------------------------------------------*/

unblob.update = function () {
    unblob.rects.update();
    unblob.cursor.update();
    unblob.ui.update();
};

unblob.cursor.update = function () {
    var active = false;

    for (var i = 0, l = unblob.rects.length; i < l; i++) {
        var rect = unblob.rects[i];

        if (
            this.x > rect.left &&
            this.y > rect.top &&
            this.x < rect.left + rect.width &&
            this.y < rect.top + rect.height
        ) {
            active = rect;
        }
    }

    if (unblob.active !== active) {
        unblob.active = active;
    }
};

unblob.mutations.update = function (type, node) {
    var children = node.children;

    if (node.nodeName === 'VIDEO') {
        unblob.videos.update(type, node);
    } else if (node.nodeName === 'BODY') {
        unblob.ui.append();
    }

    if (children) {
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];

            unblob.mutations.update(type, child);
        }
    }
};

unblob.videos.update = function (type, node) {
    var index = unblob.videos.indexOf(node);

    if (type === 'added') {
        if (index === -1) {
            var parent = node.parentNode;

            while (parent && parent !== document.body) {
                parent = parent.parentNode;

                parent.removeEventListener('scroll', unblob.update, true);
                parent.addEventListener('scroll', unblob.update, true);
            }

            unblob.videos.push(node);
            unblob.rects.push(node.getBoundingClientRect());

            node.removeEventListener('resize', unblob.update, true);
            node.addEventListener('resize', unblob.update, true);
        }
    } else if (type === 'removed') {
        if (index !== -1) {
            unblob.videos.splice(index, 1);
            unblob.rects.splice(index, 1);
        }
    }
};

unblob.rects.update = function () {
    for (var i = 0, l = this.length; i < l; i++) {
        this[i] = unblob.videos[i].getBoundingClientRect();
    }
};


/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

unblob.ui.append = function () {
    if (document.body.children.length === 0) {
        document.body.appendChild(this);
    } else {
        document.body.insertBefore(this, document.body.children[0]);
    }
};

unblob.ui.create = function () {
    var button = document.createElement('div'),
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    this.className = 'unblob';
    button.className = 'unblob__button';

    svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
    path.setAttributeNS(null, 'd', 'M18 19H6a1 1 0 01-1-1V6c0-.6.5-1 1-1h5c.6 0 1-.5 1-1s-.5-1-1-1H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-6c0-.6-.5-1-1-1s-1 .5-1 1v5c0 .6-.5 1-1 1zM14 4c0 .6.5 1 1 1h2.6l-9.1 9.1a1 1 0 101.4 1.4l9.1-9V9c0 .6.5 1 1 1s1-.5 1-1V4c0-.6-.5-1-1-1h-5a1 1 0 00-1 1z');

    svg.appendChild(path);
    button.appendChild(svg);
    this.appendChild(button);
};

unblob.ui.update = function () {
    if (unblob.active) {
        this.style.left = unblob.active.left + 'px';
        this.style.top = unblob.active.top + 'px';
        this.style.width = unblob.active.width + 'px';
        this.style.height = unblob.active.height + 'px';

        this.show();
    } else {
        this.hide();
    }
};

unblob.ui.show = function () {
    this.classList.add('unblob--visible');
};

unblob.ui.hide = function () {
    this.classList.remove('unblob--visible');
};

unblob.ui.click = function (event) {
    var video = unblob.videos[unblob.rects.indexOf(unblob.active)],
        src = video.currentSrc;

    if (src.indexOf('blob:') !== 0) {
        window.open(src, '_blank');
    } else {
        window.dispatchEvent(new CustomEvent('unblob', {
            detail: video.src
        }));
    }

    //console.log(video, src);
};

unblob.ui.prevent = function (event) {
    if (unblob.active) {
        var x = unblob.active.left + 16,
            y = unblob.active.top + 16;

        if (
            event.clientX >= x &&
            event.clientY >= y &&
            event.clientX <= x + 40 &&
            event.clientY <= y + 40
        ) {
            event.preventDefault();
            event.stopPropagation();

            if (event.type === 'click') {
                unblob.ui.click();
            }

            return false;
        }
    }
};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

unblob.mutations.observe(document, {
    childList: true,
    subtree: true
});

unblob.ui.create();

window.addEventListener('mousemove', function (event) {
    unblob.cursor.x = event.clientX;
    unblob.cursor.y = event.clientY;

    unblob.update();
});

document.addEventListener('mouseleave', function (event) {
    unblob.ui.hide();
});

document.addEventListener('mouseenter', function (event) {
    unblob.update();
});

window.addEventListener('scroll', function (event) {
    unblob.update();
});

window.addEventListener('mousedown', unblob.ui.prevent, true);
window.addEventListener('mouseup', unblob.ui.prevent, true);
window.addEventListener('click', unblob.ui.prevent, true);

var script = document.createElement('script');

script.src = chrome.runtime.getURL('website-script.js');
script.addEventListener('load', function () {
    this.remove();
});

document.documentElement.appendChild(script);