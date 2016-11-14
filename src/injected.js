function forceHTTPS(link) {
  return link.replace(/^http:\/\//, "https://");
}

function makeMediaPreview(link, imgURL, videoURL) {
  var preview = document.createElement("div");
  preview.className = "js-media media-preview position-rel tie-expanded";

  var previewContainer = document.createElement("div");
  previewContainer.className = "js-media-preview-container position-rel margin-vm";
  if (videoURL) {
    previewContainer.className += " is-video";
  }

  var previewLink = document.createElement("a");
  previewLink.className = "js-media-image-link block med-link media-item";
  previewLink.href = link;
  previewLink.setAttribute("rel", "url");
  previewLink.setAttribute("target", "_blank");
  previewLink.style = "background-image:url(" + imgURL + ")";

  if (videoURL) {
    var previewOverlay = document.createElement("div");
    previewOverlay.className = "video-overlay icon-with-bg-round";

    var previewIconBg = document.createElement("i");
    previewIconBg.className = "icon icon-bg-dot icon-twitter-blue-color";

    var previewIcon = document.createElement("i");
    previewIcon.className = "icon icon-play-video";

    previewOverlay.appendChild(previewIconBg);
    previewOverlay.appendChild(previewIcon);
    previewLink.appendChild(previewOverlay);
  }

  previewContainer.appendChild(previewLink);
  preview.appendChild(previewContainer);
  return preview;
}

function makeMediaDetail(link, imgURL, videoURL) {
  var detail = document.createElement("div");
  detail.className = "js-tweet-media margin-v--15 margin-h--0";

  var detailPreview = document.createElement("div");
  detailPreview.className = "js-media media-preview detail-preview tie-expanded";

  if (videoURL) {
    previewPlayer = document.createElement("iframe");
    previewPlayer.className = "youtube-player";
    previewPlayer.setAttribute("type", "text/html");
    previewPlayer.width = "100%";
    previewPlayer.height = "auto";
    previewPlayer.src = videoURL;
    previewPlayer.allowFullscreen = true;
    previewPlayer.frameBorder = "0";

    detailPreview.appendChild(previewPlayer);
  } else {
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
  }
  detail.appendChild(detailPreview);
  return detail;
}

function insertMediaPreview(tweet, link, imgURL, videoURL) {
  var preview = makeMediaPreview(link, imgURL, videoURL);
  var tweetBody = tweet.parentNode;
  var existingMedia = tweetBody.querySelectorAll(".js-media.media-preview:not(.tie-expanded)");
  tweetBody.insertBefore(
    preview,
    existingMedia[existingMedia.length - 1] || tweetBody.querySelector(".tweet-footer")
  );
}

function insertMediaDetail(tweetDetail, link, imgURL, videoURL) {
  var detail = makeMediaDetail(link, imgURL, videoURL);
  var tweet = tweetDetail.parentNode;
  var existingMedia = tweet.querySelectorAll(".js-tweet-media:not(.tie-expanded)");
  tweet.insertBefore(
    detail,
    existingMedia[existingMedia.length - 1] || null
  );
}

function insertOpenGraphMedia(tweet, link, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", link, true);
  xhr.onload = function(e) {
    var container = document.implementation.createHTMLDocument().documentElement;
    container.innerHTML = xhr.responseText;
    var imageURL = container.querySelector("meta[property=\"og:image\"]").content;
    callback(tweet, link, imageURL);
  }
  xhr.send();
}

function expandLinks(node) {
  var puushRegex = /https?:\/\/puu\.sh\/(?:[\w-]+\/)*[\w-]+\.(?:gif|jpe?g|png)/i;
  var instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/p\/[\w-]+/i;
  var pixivRegex = /https?:\/\/(?:www\.)?pixiv\.net\/member_illust\.php[\?\w_=&]+/i;
  var youtubeRegex = /https:\/\/youtu\.be\/([\w-]+)/i;


  var tweets = node.querySelectorAll(".js-stream-item-content .js-tweet.tweet .tweet-text");
  for (var i = 0; i < tweets.length; i++) {
    var tweet = tweets[i];
    var links = tweet.querySelectorAll("a:not(.tie-expanded)");
    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      var expandedURL = link.getAttribute("data-full-url");
      if (puushRegex.test(expandedURL)) {
        expandedURL = forceHTTPS(expandedURL);
        link.setAttribute("data-full-url", expandedURL);
        link.className += " tie-expanded";
        insertMediaPreview(tweet, expandedURL, expandedURL);
      } else if (instagramRegex.test(expandedURL)) {
        expandedURL = forceHTTPS(expandedURL);
        link.setAttribute("data-full-url", expandedURL);
        link.className += " tie-expanded";
        insertOpenGraphMedia(tweet, expandedURL, insertMediaPreview);
      } else if (pixivRegex.test(expandedURL)) {
        expandedURL = forceHTTPS(expandedURL);
        link.setAttribute("data-full-url", expandedURL);
        link.className += " tie-expanded";
        chrome.runtime.sendMessage({type: "pixiv", url: expandedURL}, null, function(resp) {
          var imageURL = resp.url;
          var videoURL = null;
          insertMediaPreview(tweet, expandedURL, resp.url, null);
        });
      } else if (youtubeRegex.test(expandedURL)) {
        link.className += " tie-expanded";
        var key = youtubeRegex.exec(expandedURL)[1];
        var imageURL = "https://img.youtube.com/vi/" + key + "/mqdefault.jpg";
        var videoURL = "https://www.youtube.com/embed/" + key + "?autoplay=0";
        insertMediaPreview(tweet, expandedURL, imageURL, videoURL);
      }
    }
  }

  var tweetDetails = node.querySelectorAll(".js-stream-item-content .js-tweet.tweet-detail .tweet-text");
  for (var i = 0; i < tweetDetails.length; i++) {
    var tweetDetail = tweetDetails[i];
    var links = tweetDetail.querySelectorAll("a:not(.tie-expanded)");
    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      var expandedURL = link.getAttribute("data-full-url");
      if (puushRegex.test(expandedURL)) {
        expandedURL = forceHTTPS(expandedURL);
        link.setAttribute("data-full-url", expandedURL);
        link.className += " tie-expanded";
        insertMediaDetail(tweetDetail, expandedURL, expandedURL);
      } else if (instagramRegex.test(expandedURL)) {
        expandedURL = forceHTTPS(expandedURL);
        link.setAttribute("data-full-url", expandedURL);
        link.className += " tie-expanded";
        insertOpenGraphMedia(tweetDetail, expandedURL, insertMediaDetail);
      } else if (pixivRegex.test(expandedURL)) {
        expandedURL = forceHTTPS(expandedURL);
        link.setAttribute("data-full-url", expandedURL);
        link.className += " tie-expanded";
        chrome.runtime.sendMessage({type: "pixiv", url: expandedURL}, null, function(resp) {
          var imageURL = resp.url;
          var videoURL = null;
          insertMediaDetail(tweetDetail, expandedURL, imageURL, videoURL);
        });
      } else if (youtubeRegex.test(expandedURL)) {
        link.className += " tie-expanded";
        var key = youtubeRegex.exec(expandedURL)[1];
        var imageURL = "https://img.youtube.com/vi/" + key + "/mqdefault.jpg";
        var videoURL = "https://www.youtube.com/embed/" + key + "?autoplay=0";
        insertMediaDetail(tweetDetail, expandedURL, imageURL, videoURL);
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
