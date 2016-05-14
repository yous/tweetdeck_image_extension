function makeMediaPreview(link) {
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

function makeMediaDetail(link) {
  var detail = document.createElement("div");
  detail.className = "tweet-detail-media";

  var detailPreview = document.createElement("div");
  detailPreview.className = "js-media media-preview detail-preview";

  var previewContainer = document.createElement("div");
  previewContainer.className = "js-media-preview-container position-rel margin-vm";

  var previewLink = document.createElement("a");
  previewLink.className = "js-media-image-link block med-link media-item is-zoomable";
  previewLink.href = link;
  previewLink.setAttribute("rel", "mediaPreview");
  previewLink.setAttribute("target", "_blank");

  var previewImage = document.createElement("img");
  previewImage.className = "media-img";
  previewImage.src = link;
  previewImage.alt = "Media preview";

  previewLink.appendChild(previewImage);
  previewContainer.appendChild(previewLink);
  detailPreview.appendChild(previewContainer);
  detail.appendChild(detailPreview);
  return detail;
}

function expandLinks(node) {
  var puushRegex = /https?:\/\/puu\.sh\/(?:[\w_]+\/)*[\w_]+\.(?:gif|jpe?g|png)/;

  var tweets = node.querySelectorAll(".js-tweet.tweet .tweet-text");
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
        var preview = makeMediaPreview(expandedURL);
        tweet.parentNode.insertBefore(
          preview,
          tweet.parentNode.querySelector(".tweet-footer")
        );
      }
    }
  }

  var tweetDetails = node.querySelectorAll(".js-tweet.tweet-detail .tweet-text");
  for (var i = 0; i < tweetDetails.length; i++) {
    var tweetDetail = tweetDetails[i];
    var links = tweetDetail.querySelectorAll("a:not(.expanded)");
    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      var expandedURL = link.getAttribute("data-full-url");
      if (puushRegex.test(expandedURL)) {
        expandedURL = expandedURL.replace(/^http:\/\//, "https://");
        link.setAttribute("data-full-url", expandedURL);
        link.className += " expanded";
        var detail = makeMediaDetail(expandedURL);
        tweetDetail.parentNode.insertBefore(
          detail,
          tweetDetail.parentNode.querySelector(".js-tweet-media.tweet-detail-media")
        );
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
