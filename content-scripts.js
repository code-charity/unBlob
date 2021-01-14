/*------------------------------------------------------------------------------
>>> TABLE OF CONTENTS:
--------------------------------------------------------------------------------
1.0 Inject script
2.0 Initialization
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 INJECT SCRIPT
------------------------------------------------------------------------------*/

function injectScript(string) {
    var script = document.createElement('script');

    script.textContent = string;

    document.documentElement.appendChild(script);

    script.remove();
}


/*------------------------------------------------------------------------------
2.0 INITIALIZATION
------------------------------------------------------------------------------*/

(function() {
    var textContent = 'var unBlob={';

    for (var key in unBlob) {
        textContent += key + ': ' + unBlob[key] + ',';
    }

    textContent += '};unBlob.init();';

    injectScript(textContent);
})();