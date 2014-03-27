(function() {
    var root = this;

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('BG Script: ' + request.action + ": " + request.args);
        console.log('BG Script: ' + sender.tab ? ' from content script: ' + sender.tab.url : 'from extension');
        sendResponse({
            hello: 'world'
        });

        var google = new OAuth2('google', {
            client_id: '952993494713-h12m6utvq8g8d8et8n2i68plbrr6cr4d.apps.googleusercontent.com',
            api_scope: 'https://www.googleapis.com/auth/drive.file'
        });

        google.authorize(
            function() {
                //var TASK_CREATE_URL = 'https://www.googleapis.com/tasks/v1/lists/@default/tasks';
                var TASK_CREATE_URL = 'https://www.googleapis.com/drive/v2/changes';

                function createTodo(task) {
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function(event) {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                console.log(xhr.responseText);
                            } else {
                                console.log('other status code: ' + xhr.status);
                            }
                        }
                    };

                    //var message = JSON.stringify({
                    //title: task
                    //});

                    xhr.open('GET', TASK_CREATE_URL, true);

                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Authorization', 'OAuth ' + google.getAccessToken());

                    xhr.send();
                }
            });
    });
    console.log('BG Script loaded!');

}).call(this);
