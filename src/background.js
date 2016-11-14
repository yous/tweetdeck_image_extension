chrome.runtime.onMessage.addListener(onRuntimeMessage);

function log () {
  var args = [(new Date()).toLocaleString() + " |"];
  for (var i = 0; i < arguments.length; i++)
    args.push(arguments[i]);

  console.log.apply(console, args);
};

function onRuntimeMessage (msg, sender, sendResponse) {
  if (chrome.runtime.lastError)
    log(chrome.runtime.lastError);            
  var key = msg.type;
  switch (key) {
    case "pixiv":
      var xhr = new XMLHttpRequest();
      xhr.open("GET", msg.url, true);
      xhr.onload = function(e) {
        var container = document.implementation.createHTMLDocument().documentElement;
        container.innerHTML = xhr.responseText;
        var imageURL = container.querySelector("meta[property=\"og:image\"]").content;
        var img = document.createElement("img");
        img.src = imageURL;
        img.onload = function(){
          var canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          var dataURL = canvas.toDataURL("image/png");
          log(dataURL);
          sendResponse({url: dataURL});
        }
        document.querySelector("body").appendChild(img);
      }
      xhr.send();
      break;
    default:
      log("Unknown message " + key);
      sendResponse({error: true});
      break;
  }
  return true;
};
