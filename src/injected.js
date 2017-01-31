/**
 * Make link use HTTPS.
 * @param {!string} link - The link to change.
 * @return {string} The HTTPS version of the given link.
 */
function forceHTTPS(link) {
  return link.replace(/^http:\/\//, "https://");
}

/**
 * Get a global variable outside the Chrome extension.
 * @param {!string} key - The unique key that will hold the variable. We add
 * prefix `tie-` and use it as the actual attribute name.
 * @param {!string} variable - The variable name to retrieve.
 * @return {*} The value of the variable.
 */
function retrieveVariable(key, variable) {
  var body = document.querySelector("body");
  var scriptContent = [
    "if (typeof " + variable + " !== 'undefined') {",
    "  var body = document.querySelector('body');",
    "  body.setAttribute('tie-" + key + "', JSON.stringify(" + variable + "));",
    "}",
  ].join("\n");
  var script = document.createElement("script");
  script.appendChild(document.createTextNode(scriptContent));
  body.appendChild(script);

  var result = JSON.parse(body.getAttribute("tie-" + key));
  body.removeAttribute("tie-" + key);
  body.removeChild(script);
  return result;
}

/**
 * Get the element of media preview.
 * @param {!string} link - The actual URL in the tweet.
 * @param {string} size - The column size. Can be `'small'`, `'medium'`,
 * '`large`', or `null`.
 * @param {!string} imgURL - The URL of the preview image.
 * @param {string} videoURL - The URL of the preview video.
 * @return {Element} The media preview.
 */
function makeMediaPreview(link, size, imgURL, videoURL) {
  var preview = document.createElement("div");
  preview.className = "js-media media-preview position-rel tie-expanded";

  var previewContainer = document.createElement("div");
  previewContainer.className =
      "js-media-preview-container position-rel margin-vm";
  if (videoURL) {
    previewContainer.className += " is-video";
  }

  var previewLink = document.createElement("a");
  previewLink.className = "js-media-image-link block med-link media-item";
  switch (size) {
    case "small":
    case "medium":
      previewLink.className += " media-size-" + size;
      break;
  }
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

/**
 * Get the element of media detail.
 * @param {!string} link - The actual URL in the tweet.
 * @param {!string} imgURL - The URL of the preview image.
 * @param {string} videoURL - The URL of the preview video.
 * @return {Element} The media detail.
 */
function makeMediaDetail(link, imgURL, videoURL) {
  var detail = document.createElement("div");
  // Actual className should be `js-tweet-media margin-v--15 margin-h--0`, but
  // the `js-tweet-media` doesn't have any related CSS, and every element with
  // `.js-tweet-media` will get replaced.
  detail.className = "margin-v--15 margin-h--0";

  var detailPreview = document.createElement("div");
  detailPreview.className =
      "js-media media-preview detail-preview tie-expanded";

  if (videoURL) {
    var previewPlayer = document.createElement("iframe");
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
    previewContainer.className =
        "js-media-preview-container position-rel margin-vm";

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

/**
 * Insert an element of media preview to the tweet.
 * @param {!Element} tweet - The tweet to insert a media preview.
 * @param {!string} link - The actual URL in the tweet.
 * @param {!string} imgURL - The URL of the preview image.
 * @param {string} videoURL - The URL of the preview video.
 * @return {void}
 */
function insertMediaPreview(tweet, link, imgURL, videoURL) {
  var column = null;
  var node = tweet;
  while (node) {
    if (node.hasAttribute("data-column")) {
      column = node.getAttribute("data-column");
      break;
    }
    node = node.parentNode;
  }
  var size = null;
  if (column) {
    size = retrieveVariable(
        column + "-media-preview-size",
        "TD.controller.columnManager.get('" + column +
            "').getMediaPreviewSize()"
    );
  }
  var preview = makeMediaPreview(link, size, imgURL, videoURL);
  var tweetBody = tweet.parentNode;
  var existingMedia = tweetBody.querySelectorAll(
      ":scope > .js-media.media-preview:not(.tie-expanded)");
  tweetBody.insertBefore(
      preview,
      existingMedia[existingMedia.length - 1] ||
          tweetBody.querySelector(":scope > .js-quote-detail.quoted-tweet") ||
          tweetBody.querySelector(":scope > .tweet-footer"));
}

/**
 * Insert an element of media detail to the tweet detail.
 * @param {!Element} tweetDetail - The tweet detail to insert a media detail.
 * @param {!string} link - The actual URL in the tweet.
 * @param {!string} imgURL - The URL of the preview image.
 * @param {string} videoURL - The URL of the preview video.
 * @return {void}
 */
function insertMediaDetail(tweetDetail, link, imgURL, videoURL) {
  var detail = makeMediaDetail(link, imgURL, videoURL);
  var tweet = tweetDetail.parentNode;
  var existingMedia = tweet.querySelectorAll(
      ":scope > .js-tweet-media:not(.tie-expanded)");
  tweet.insertBefore(
      detail,
      existingMedia[existingMedia.length - 1] || null);
}

/**
 * @callback openGraphCallback
 * @param {!Element} tweet - The tweet to insert an open graph media.
 * @param {!string} link - The actual URL in the tweet.
 * @param {!string} imageURL - The URL of the preview image.
 */

/**
 * Insert an open graph media to the tweet.
 * @param {!Element} tweet - The tweet to insert an open graph media.
 * @param {!string} link - The actual URL in the tweet.
 * @param {openGraphCallback} callback - The callback that inserts an open graph
 * media to tweet.
 * @return {void}
 */
function insertOpenGraphMedia(tweet, link, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", link, true);
  xhr.onload = function() {
    var container = document.implementation
        .createHTMLDocument()
        .documentElement;
    container.innerHTML = xhr.responseText;
    var imageURL =
        container.querySelector("meta[property=\"og:image\"]").content;
    callback(tweet, link, imageURL);
  };
  xhr.send();
}

/**
 * Find every links in an element and insert media previews or media details.
 * @param {!Element} node - An element to find links, insert media previews or
 * media details to.
 * @return {void}
 */
function expandLinks(node) {
  var puushRegex = new RegExp([
    /^https?:\/\/puu\.sh\//.source,
    /(?:[\w-]+\/)*[\w-]+\.(?:gif|jpe?g|png)/.source,
  ].join(""), "i");
  var instagramRegex = /^https?:\/\/(?:www\.)?instagram\.com\/p\/[\w-]+/i;
  var pixivRegex = new RegExp([
    /^https?:\/\/(?:www\.)?pixiv\.net\//.source,
    /member_illust\.php\?(?:[\w-=]*&)*illust_id=(\d+)(?:&|$)/.source,
  ].join(""), "i");
  var youtubeRegex = /^https:\/\/youtu\.be\/([\w-]+)/i;

  var tweets = node.querySelectorAll(
      ".js-stream-item-content .js-tweet.tweet .tweet-text");
  for (var i = 0; i < tweets.length; i++) {
    var tweet = tweets[i];
    var links = tweet.querySelectorAll("a:not(.tie-expanded)");
    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      var expandedURL = link.getAttribute("data-full-url");
      var imageURL;
      var videoURL;
      var illustId;
      var key;
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
        illustId = pixivRegex.exec(expandedURL)[1];
        imageURL = "http://embed.pixiv.net/decorate.php?illust_id=" + illustId;
        chrome.runtime.sendMessage(
            {type: "pixiv", url: imageURL}, null,
            function(resp) {
              if (!resp.hasOwnProperty("error")) {
                insertMediaPreview(tweet, expandedURL, resp.url);
              }
            }
        );
      } else if (youtubeRegex.test(expandedURL)) {
        link.className += " tie-expanded";
        key = youtubeRegex.exec(expandedURL)[1];
        imageURL = "https://img.youtube.com/vi/" + key + "/mqdefault.jpg";
        videoURL = "https://www.youtube.com/embed/" + key + "?autoplay=0";
        insertMediaPreview(tweet, expandedURL, imageURL, videoURL);
      }
    }
  }

  var tweetDetails = node.querySelectorAll(
      ".js-stream-item-content .js-tweet.tweet-detail .tweet-text");
  for (i = 0; i < tweetDetails.length; i++) {
    var tweetDetail = tweetDetails[i];
    links = tweetDetail.querySelectorAll("a:not(.tie-expanded)");
    for (j = 0; j < links.length; j++) {
      link = links[j];
      expandedURL = link.getAttribute("data-full-url");
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
        illustId = pixivRegex.exec(expandedURL)[1];
        imageURL = "http://embed.pixiv.net/decorate.php?illust_id=" + illustId;
        chrome.runtime.sendMessage(
            {type: "pixiv", url: imageURL}, null,
            function(resp) {
              if (!resp.hasOwnProperty("error")) {
                insertMediaDetail(tweetDetail, expandedURL, resp.url);
              }
            }
        );
      } else if (youtubeRegex.test(expandedURL)) {
        link.className += " tie-expanded";
        key = youtubeRegex.exec(expandedURL)[1];
        imageURL = "https://img.youtube.com/vi/" + key + "/mqdefault.jpg";
        videoURL = "https://www.youtube.com/embed/" + key + "?autoplay=0";
        insertMediaDetail(tweetDetail, expandedURL, imageURL, videoURL);
      }
    }
  }
}

var ActualMutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver;
var observer = new ActualMutationObserver(function(mutations) {
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
  subtree: true,
});

expandLinks(document);
