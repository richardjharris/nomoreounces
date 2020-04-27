var backgroundPage = chrome.extension.getBackgroundPage();

var checkboxOptions = backgroundPage.CHECKBOX_OPTIONS;

// Private to this page
const SAVED_MESSAGE_DISPLAY_TIME_MS = 4000;

// Save the form values to persistent storage and tell the user
// the save was successful
function saveOptions() {
  let options = {};
  for (let key of checkboxOptions) {
    options[key] = document.getElementById('opt-' + key).checked;
  }

  // Save the options to persistent storage
  chrome.storage.sync.set(options, () => {
    if (typeof saveOptions.timeout !== 'undefined') {
      clearTimeout(saveOptions.timeout);
    }

    let status = document.getElementById('status');
    status.innerHTML = 'OPTIONS SAVED';
    saveOptions.timeout = setTimeout(() => {
      status.innerHTML = '';
    }, SAVED_MESSAGE_DISPLAY_TIME_MS);
  });
}

// Load values from persistent storage and update the form, using
// defaults for the first run
function loadOptions() {
  console.log(backgroundPage);

  let defaults = backgroundPage.DEFAULT_OPTIONS;
  chrome.storage.sync.get(defaults, (result) => {
    for (let key of checkboxOptions) {
      document.getElementById('opt-' + key).checked = result[key];
    }
  });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);

chrome.storage.onChanged.addListener((changes, namespace) => {
  // Notify converted tabs that the options have changed
  for (let tabIndex of backgroundPage.convertedTabIndices) {
    chrome.tabs.sendMessage(tabIndex, { message: "optionsChanged" });
  }
});
