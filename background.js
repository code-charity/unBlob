function requestListener(request) {
    var responseHeaders = request.responseHeaders;

    if (responseHeaders) {
        for (var i = 0, l = responseHeaders.length; i < l; i++) {
            if (responseHeaders[i].name === 'content-type') {
                if (
                    responseHeaders[i].value.indexOf('video') !== -1 ||
                    responseHeaders[i].value.indexOf('audio') !== -1
                ) {
                    console.log(request.url, request);
                    chrome.tabs.sendMessage(request.tabId, {
                        action: 'media-url',
                        url: request.url
                    });
                }
            }
        }
    }
}

chrome.webRequest.onCompleted.addListener(requestListener, {
    urls: ['<all_urls>']
}, ['responseHeaders']);