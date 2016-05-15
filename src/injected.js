function makeMediaPreview(link, imgURL) {
  var preview = document.createElement("div");
  preview.className = "js-media media-preview position-rel";

  var previewContainer = document.createElement("div");
  previewContainer.className = "js-media-preview-container position-rel margin-vm";

  var previewLink = document.createElement("a");
  previewLink.className = "js-media-image-link block med-link media-item";
  previewLink.href = link;
  previewLink.setAttribute("rel", "url");
  previewLink.setAttribute("target", "_blank");
  previewLink.style = "background-image:url(" + imgURL + ")";

  previewContainer.appendChild(previewLink);
  preview.appendChild(previewContainer);
  return preview;
}

function makeMediaDetail(link, imgURL) {
  var detail = document.createElement("div");
  detail.className = ".js-tweet-media tweet-detail-media";

  var detailPreview = document.createElement("div");
  detailPreview.className = "js-media media-preview detail-preview";

  var previewContainer = document.createElement("div");
  previewContainer.className = "js-media-preview-container position-rel margin-vm";

  var previewLink = document.createElement("a");
  previewLink.className = "js-media-image-link block med-link media-item";
  previewLink.href = link;
  previewLink.setAttribute("rel", "url");
  previewLink.setAttribute("target", "_blank");

  var previewImage = document.createElement("img");
  previewImage.className = "media-img";
  previewImage.src = imgURL;
  previewImage.alt = "Media preview";

  previewLink.appendChild(previewImage);
  previewContainer.appendChild(previewLink);
  detailPreview.appendChild(previewContainer);
  detail.appendChild(detailPreview);
  return detail;
}

function expandLinks(node) {
  var puushRegex = /https?:\/\/puu\.sh\/(?:[\w_]+\/)*[\w_]+\.(?:gif|jpe?g|png)/;
  var instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/p\/\w+/;

  var tweets = node.querySelectorAll(".js-stream-item-content .js-tweet.tweet .tweet-text");
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
        var preview = makeMediaPreview(expandedURL, expandedURL);
        tweet.parentNode.insertBefore(
          preview,
          tweet.parentNode.querySelector(".tweet-footer")
        );
      } else if (instagramRegex.test(expandedURL)) {
        expandedURL = expandedURL.replace(/^http:\/\//, "https://");
        link.setAttribute("data-full-url", expandedURL);
        link.className += " expanded";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", expandedURL, true);
        xhr.onload = function(e) {
          var container = document.implementation.createHTMLDocument().documentElement;
          container.innerHTML = xhr.responseText;
          var imageURL = container.querySelector("meta[property=\"og:image\"]").content;
          var preview = makeMediaPreview(expandedURL, imageURL);
          tweet.parentNode.insertBefore(
            preview,
            tweet.parentNode.querySelector(".tweet-footer")
          );
        };
        xhr.send();
      }
    }
  }

  var tweetDetails = node.querySelectorAll(".js-stream-item-content .js-tweet.tweet-detail .tweet-text");
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
        var detail = makeMediaDetail(expandedURL, expandedURL);
        tweetDetail.parentNode.insertBefore(
          detail,
          tweetDetail.parentNode.querySelector(".js-tweet-media.tweet-detail-media")
        );
      } else if (instagramRegex.test(expandedURL)) {
        expandedURL = expandedURL.replace(/^http:\/\//, "https://");
        link.setAttribute("data-full-url", expandedURL);
        link.className += " expanded";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", expandedURL, true);
        xhr.onload = function(e) {
          var container = document.implementation.createHTMLDocument().documentElement;
          container.innerHTML = xhr.responseText;
          var imageURL = container.querySelector("meta[property=\"og:image\"]").content;
          var detail = makeMediaDetail(expandedURL, imageURL);
          tweetDetail.parentNode.insertBefore(
            detail,
            tweetDetail.parentNode.querySelector(".js-tweet-media.tweet-detail-media")
          );
        }
        xhr.send();
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
