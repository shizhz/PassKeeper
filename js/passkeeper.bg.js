(function() {
    var root = this;

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('BG Script: ' + request.action + ": " + request.args);
        console.log('BG Script: ' + sender.tab ? ' from content script: ' + sender.tab.url : 'from extension');
        sendResponse({
            hello: 'world'
        });
    });
    console.log('BG Script loaded!');

}).call(this);

var oauth = ChromeExOAuth.initBackgroundPage({
    'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
    'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
    'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
    'consumer_key': 'anonymous',
    'consumer_secret': 'anonymous',
    'scope': 'https://www.googleapis.com/auth/drive.file',
    'app_name': 'PassKeeper'
});

function callback(resp, xhr) {
    // ... Process text response ...
    console.log('resp');
};

function onAuthorized() {
    //    var url = 'https://docs.google.com/feeds/default/private/full';
    var url = 'https://www.googleapis.com/drive/v2/changes';
    var request = {
        'method': 'GET',
        'parameters': {
            'includeDeleted': true,
            'includeSubscribed': true
            // 'alt': 'json'
        }
    };

    // Send: GET https://docs.google.com/feeds/default/private/full?alt=json
    oauth.sendSignedRequest(url, callback, request);
};

oauth.authorize(onAuthorized);
