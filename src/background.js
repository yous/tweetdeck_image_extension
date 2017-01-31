chrome.runtime.onMessage.addListener(onRuntimeMessage);

/**
 * @callback sendResponse
 * @param {object} resp
 * @param {string=} resp.url - The URL of the preview image.
 * @param {boolean=} resp.error - The indicator whether there is an error.
 */

/**
 * Message handler for background jobs.
 * @param {Object} msg - The message sent by the calling script.
 * @param {string} msg.type - The label for the site that we request to.
 * @param {string} msg.url - The URL of a page that contains the preview image.
 * @param {chrome.runtime.MessageSender} sender - An object containing
 * information about the script context that sent a message or request.
 * @param {sendResponse} sendResponse - A function to send a response.
 * @return {boolean} True.
 */
function onRuntimeMessage(msg, sender, sendResponse) {
  var key = msg.type;
  switch (key) {
    case "pixiv":
      var img = document.createElement("img");
      img.src = msg.url;
      img.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        sendResponse({url: dataURL});
        document.querySelector("body").removeChild(img);
      };
      img.onerror = function() {
        sendResponse({error: true});
        document.querySelector("body").removeChild(img);
      };
      document.querySelector("body").appendChild(img);
      break;
    default:
      sendResponse({error: true});
      break;
  }
  return true;
}
