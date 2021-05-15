var zoomify = (function () { //Code isolation
	return {
		"name": "Zoomify",
		"description": "Most commmon zoomable image format",
		"urls": [
			/ImageProperties\.xml(\?.*)?$/,
			/\/TileGroup\d+\/\d+-\d+-\d+.jpg$/,
			/biblio\.unibe\.ch\/web-apps\/maps\/zoomify\.php/,
			/bspe-p-pub\.paris\.fr\/MDBGED\/zoomify-BFS\.aspx/,
			/ngv\.vic\.gov\.au\/explore\/collection\/work/,
			/artandarchitecture\.org\.uk\/images\/zoom/
		],
		"contents": [
			/zoomifyImagePath=/,
			/showImage\(/,
			/accessnumber=/,
			/ete-openlayers-src/,
			/type['"]?\s*:\s*['"]zoomifytileservice/
		],
		"findFile": function getZoomifyPath(baseUrl, callback) {
			if (baseUrl.match(/ImageProperties\.xml(\?.*)?$/)) {
				return callback(baseUrl);
			}

			function foundZoomifyPath(zoomifyPath) {
				var sep = zoomifyPath[zoomifyPath.length - 1] == '/' ? '' : '/';
				return callback(zoomifyPath + sep + "ImageProperties.xml");
			}

			var tileUrlMatch = baseUrl.match(/.*(?=\/TileGroup\d+\/\d+-\d+-\d+.jpg$)/);
			if (tileUrlMatch) return foundZoomifyPath(tileUrlMatch[0]);

			ZoomManager.getFile(baseUrl, { type: "htmltext" }, function (text, xhr) {
				// for the zoomify flash player, the path is in the zoomifyImagePath
				// attribute of a tag
				// In the HTML5 zoomify player, the path is the second argument
				// to a JS function called showImage
				var zRegs = [
					/zoomifyImagePath=([^\'"&]*)[\'"&]|showImage\([^),]*,\s*["']([^'"]*)/g,
					/type['"]?\s*:\s*['"]zoomifytileservice[\s\S]*tilesUrl["']?\s*:\s*["']([^'"]+)/g
				]
				var matchPath;
				var foundPaths = [];
				for (var z = 0; z < zRegs.length; z++) {
					while ((matchPath = zRegs[z].exec(text)) != null) {
						for (var i = 1; i < matchPath.length; i++) {
							var path = matchPath[i];
							if (path && foundPaths.indexOf(path) === -1) {
								foundPaths.push(path);
							}
						}
					}
				}
				if (foundPaths.length > 0) return foundPaths.forEach(foundZoomifyPath);

				// Fluid engage zoomify
				var fluidMatch = text.match(/accessnumber=([^"&\s']+)/i);
				if (fluidMatch) {
					var xmlBrokerPath = "/scripts/XMLBroker.new.php" +
						"?Lang=2&contentType=IMAGES&contentID=" +
						fluidMatch[1];
					var url = ZoomManager.resolveRelative(xmlBrokerPath, baseUrl);
					return ZoomManager.getFile(url, { type: "xml" }, function (xml, xhr) {
						var pathElem = xml.querySelector("imagefile[format=zoomify]");
						return foundZoomifyPath(pathElem.firstChild.nodeValue);
					});
				}
				// Universitätsbibliothek
				var unibeMatch = text.match(/url = '([^']*)'/);
				if (~baseUrl.indexOf("biblio.unibe.ch/web-apps/maps/zoomify.php") &&
					unibeMatch) {
					var url = ZoomManager.resolveRelative(unibeMatch[1], baseUrl);
					return foundZoomifyPath(url);
				}

				// Openlayers
				var olMatch = text.match(/<[^>]*class="ete-openlayers-src"[^>]*>(.*?)<\/.*>/);
				if (olMatch) {
					return foundZoomifyPath(olMatch[1]);
				}

				// National Gallery of Victoria (NGV)
				var ngvMatch = text.match(/var url = '(.*?)'/);
				if (~baseUrl.indexOf("ngv.vic.gov.au") && ngvMatch) {
					return foundZoomifyPath(ngvMatch[1]);
				}

				// If nothing was found, but the page contains an iframe, follow the iframe
				var iframeMatch = text.match(/<iframe[^>]*src=["']([^"']*)/);
				if (iframeMatch) {
					var url = ZoomManager.resolveRelative(iframeMatch[1], baseUrl);
					return getZoomifyPath(url, callback);
				}

				var eteMatch = text.match(/<url>(.*)<\/url>/);
				if (eteMatch) {
					return foundZoomifyPath(eteMatch[1]);
				}

				// If no zoomify path was found in the page, then assume that
				// the url that was given is the path itself
				return foundZoomifyPath(baseUrl);
			});
		},
		"open": function (url) {
			ZoomManager.getFile(url, { type: "xml" }, function (xml, xhr) {
				var infos = xml.getElementsByTagName("IMAGE_PROPERTIES")[0];
				if (!infos) return ZoomManager.error("Invalid zoomify XML info file: " + url);
				var data = {};
				data.origin = url;
				data.width = parseInt(infos.getAttribute("WIDTH"));
				data.height = parseInt(infos.getAttribute("HEIGHT"));
				data.tileSize = parseInt(infos.getAttribute("TILESIZE"));
				data.numTiles = parseInt(infos.getAttribute("NUMTILES")); //Total number of tiles (for all zoom levels)
				data.zoomFactor = 2; //Zooming factor between two consecutive zoom levels

				var w = data.width, h = data.height,
					ntiles = 0,
					maxZoom = ZoomManager.findMaxZoom(data);
				for (var z = 0; z <= maxZoom; z++) {
					ntiles += Math.ceil(w / data.tileSize) * Math.ceil(h / data.tileSize);
					w /= 2; h /= 2;
				}
				if (ntiles !== data.numTiles) {
					// The computed zoom level was incorrect.
					// When zoomify generates the zoom levels, it MAY stop creating new zoom
					// levels when a zoomlevel has one of its dimensions that rounds down to TILESIZE.
					var size = Math.max(data.width, data.height);
					data.maxZoomLevel = Math.ceil(Math.log(size / (data.tileSize + 1)) / Math.LN2);
				}
				ZoomManager.readyToRender(data);
			});
		},
		"getTileURL": function (col, row, zoom, data) {
			var totalTiles = data.nbrTilesX * data.nbrTilesY;
			var tileGroup = Math.floor((data.numTiles - totalTiles + col + row * data.nbrTilesX) / 256);
			return "TileGroup" + tileGroup + "/" + zoom + "-" + col + "-" + row + ".jpg";
		}
	};
})();
ZoomManager.addDezoomer(zoomify);
