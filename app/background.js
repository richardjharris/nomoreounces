var DEFAULT_OPTIONS = {
    'convert-spoons': false,
    'gas-mark': false,
    'print-original': true,
};
var CHECKBOX_OPTIONS = ['convert-spoons', 'gas-mark', 'print-original'];

// Track converted tabs, so we can redo them when options are updated
// XXX this is never removed from. Maybe there's a better way to handle this...
var convertedTabIndices = [];

// Conversion involves injecting custom JS into the page
function onClick(tab) {
    chrome.tabs.insertCSS(tab.id, { file: "content_script.css" });
    chrome.tabs.executeScript(tab.id, { file: "convert.bundle.js" });
    chrome.tabs.executeScript(tab.id, { file: "content_script.js" });
    convertedTabIndices.push(tab.id);
}

// Set any missing options (when upgrading or first run)
chrome.storage.local.get(DEFAULT_OPTIONS, (result) => {
    chrome.storage.local.set(result, () => {
        chrome.browserAction.onClicked.addListener(onClick);
    });
});
