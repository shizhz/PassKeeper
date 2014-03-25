(function() {
    var root = this;

    chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
        console.log('BG Script: ' + request.action + ": " + request.args);
        console.log('BG Script: ' + sender.tab ? ' from content script: ' + sender.tab.url : 'from extension');
        sendResponse({hello: 'world'});
    } );
    console.log('BG Script loaded!');

}).call(this);
