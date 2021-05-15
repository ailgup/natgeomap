  function downloadURL(dataurl, filename) {
  var a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", filename);
  a.click();
  console.log("clicked");
}
(function () {
  document.getElementById("urlform").onsubmit = function (evt) {
    evt.preventDefault();
    var url = document.getElementById("url").value;
    window.location.hash = url;
	ZoomManager.proxy_tiles="https://ophir.alwaysdata.net/dezoomify/proxy.php";
    ZoomManager.open(url);
	

	
    return false;
  }

  // allow to set the URL to be dezoomed by setting the URL hash
  var startURL = window.location.hash.slice(1);
  if (startURL) {
    document.getElementById("url").value = startURL;
  }

  
})();
