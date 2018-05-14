chrome.browserAction.onClicked.addListener(function (tab) {
    localStorage.setItem("E-tab-statu","234565")
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message == 'Hello'){
            sendResponse('Hello from background.');
        }
    });
    chrome.tabs.create({ url: chrome.runtime.getURL('e-tab.html') });
});