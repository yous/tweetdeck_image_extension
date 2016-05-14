function makePreview(link) {
  var preview = document.createElement("div");
  preview.className = "js-media media-preview position-rel";

  var previewContainer = document.createElement("div");
  previewContainer.className = "js-media-preview-container position-rel margin-vm";

  var previewLink = document.createElement("a");
  previewLink.className = "js-media-image-link block med-link media-item is-zoomable";
  previewLink.href = link;
  previewLink.setAttribute("rel", "mediaPreview");
  previewLink.setAttribute("target", "_blank");
  previewLink.style = "background-image:url(" + link + ")";

  previewContainer.appendChild(previewLink);
  preview.appendChild(previewContainer);
  return preview;
}

function expandLinks(node) {
  var puushRegex = /https?:\/\/puu\.sh\/(?:[\w_]+\/)*[\w_]+\.(?:gif|jpe?g|png)/;

  var tweets = node.querySelectorAll(".tweet-text");
  for (var i = 0; i < tweets.length; i++) {
    var tweet = tweets[i];
    var links = tweet.querySelectorAll("a:not(.expanded)");
    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      var expandedURL = link.getAttribute("data-full-url");
      if (puushRegex.test(expandedURL)) {
        expandedURL = expandedURL.replace(/^http:\/\//, "https://");
        link.setAttribute("data-full-url", expandedURL);
        link.className += " expanded";
        var preview = makePreview(expandedURL);
        tweet.parentNode.insertBefore(preview, tweet.nextSibling);
      }
    }
  }
}

var mutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new mutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    for (var i = 0; i < mutation.addedNodes.length; i++) {
      if (mutation.addedNodes[i].nodeType === Node.ELEMENT_NODE) {
        expandLinks(mutation.addedNodes[i]);
      }
    }
  });
});

observer.observe(document, {
  childList: true,
  attributes: false,
  characterData: false,
  subtree: true
});

expandLinks(document);
