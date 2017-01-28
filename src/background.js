chrome.runtime.onMessage.addListener(onRuntimeMessage);

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
