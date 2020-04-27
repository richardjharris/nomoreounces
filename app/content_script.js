// (Content script)
// Performs the recipe conversion (US -> UK) on the current page

var config = {};

var excludeElements = ['script', 'style', 'iframe', 'canvas', 'a'];

// Walk node tree converting all relevant parts
function walkTree(node) {
    if (node.nodeType === Element.ELEMENT_NODE
        && excludeElements.indexOf(node.tagName.toLowerCase()) === -1) {
        for (let child of node.childNodes) {
            walkTree(child);
        }
    }
    else if (node.nodeType === Element.TEXT_NODE) {
        let converted = convertRecipeText(node.textContent);
        if (converted && converted != node.textContent) {
            let convertedNode = document.createElement("span");
            convertedNode.innerHTML = converted;
            // Indicate to user that text was converted
            // TODO highlight only converted section (diff?)
            convertedNode.style.backgroundColor = '#fafad2';
            // was replaceNode?
            node.parentNode.replaceChild(convertedNode, node);
        }
    }
}

// Don't convert more than once
if (window.noMoreOuncesConverted === undefined) {
    // Listen for messages from the background code
    chrome.runtime.onMessage.addListener((data, sender) => {
        if (data.message === "optionsChanged") {
            // This message means we've performed a conversion but the options have
            // changed, so we should reconvert.
            // For now we just reload the page
            location.reload();
        }
    });

    // Get all stored configuration, then perform the conversion
    chrome.storage.sync.get(null, (result) => {
        config = result;

        window.noMoreOuncesConverted = true;
        walkTree(document.body);
    });
}
