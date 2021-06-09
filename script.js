require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/dijit/LayerList",
  "esri/dijit/Search",
  "esri/dijit/Popup",
  "esri/dijit/PopupTemplate"
], function (
  Map,
  FeatureLayer,
  LayerList,
  Search,
  Popup,
  PopupTemplate
) {
  /************************************************************
   * Creates a new WebMap instance. A WebMap must reference
   * a PortalItem ID that represents a WebMap saved to
   * arcgis.com or an on-premise portal.
   *
   * To load a WebMap from an on-premise portal, set the portal
   * url with esriConfig.portalUrl.
   ************************************************************/
  var map = new Map("viewDiv",{
    basemap: "streets",
    //basemap: "topo-vector"
    zoom: 8,
    center: [-71.085421, 42.34745],
    popup: {
      actions: [],
      alignment: "auto",
      dockOptions: {
        buttonEnabled: false,
        // Disable the dock button so users cannot undock the popup
        // Dock the popup when the size of the view is less than or equal to 600x1000 pixels
        breakpoint: {
          width: 0,
          height: 0
        }
      },
      visibleElements: {
        closeButton: false
      }
    }
  });
  var template = {
    title: "",
    content: buildPopupContent
  };
  
  function buildPopupContent(event){
	  
      var title = event.attributes.MapTitle;
      var code = event.attributes.ProdCode;
      var fid = event.attributes.FID;

        console.log("F:" + fid + " T:" + title + " C:" + code);
        var div = document.createElement("div");
        div.className = "";
        div.innerHTML =
          "<div style='margin: 0px;' onclick=\"open_popup('" +
          code +
          '\')" class="popup-link">' +
          //'<h3>'+title +'</h3>'+
          '<img class="esriPopupMediaImage" src="http://images.natgeomaps.com/PROD_SM_250px/' +
          code +
          '_0_SM.jpg" style="height: 250px;width: 110px;"></div>';
        return div;
      
    
  }

  var trailsMapsStyle = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [79, 129, 83, 0.25],
      outline: {
        // makes the outlines of all features consistently light gray
        color: [79, 129, 83, 0.5],
        width: 2
      }
    }
  };
  var adventureMapsStyle = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [153, 85, 144, 0.203922],
      outline: {
        // makes the outlines of all features consistently light gray
        color: [56, 168, 0, 0.5],
        width: 2
      }
    }
  };
  var localMapsStyle = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [113, 63, 35, 0.25],
      outline: {
        // makes the outlines of all features consistently light gray
        color: [113, 63, 35, 0.5],
        width: 2
      }
    }
  };
  var labelClass = {
    // autocasts as new LabelClass()
    symbol: {
      type: "text", // autocasts as new TextSymbol()
      //color: "green",
      font: {
        // autocast as new Font()
        //family: "Playfair Display",
        size: 6,
        weight: "bold"
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.MapTitle"
    }
  };
  var featureLayer = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/TI_BdryPoly/FeatureServer/0/",{
    name: "Trails Illustrated",
    outFields: ["FID", "MapNumb", "MapTitle", "ProdCode"],
    labelingInfo: [labelClass],
    infoTemplate: template,
    renderer: trailsMapsStyle
  });

  var adventureMaps = new FeatureLayer( "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/AD_BdryPoly/FeatureServer/0/",{
    name: "Adventure Maps",
    visible: false,     
    outFields: ["*"],
    infoTemplate: template,
    renderer: adventureMapsStyle
  });

  var localMaps = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/LCT_BdryPoly/FeatureServer/0/",{
    name: "Local Maps",
    visible: false,
    outFields: ["*"],
    infoTemplate: template,
    renderer: localMapsStyle
  });
  var cityMaps = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/DC_Point/FeatureServer/0/",{
    name: "City Maps",
    visible: false,
    style: "circle",
            size: 6,
            color: [255, 0, 0],      
    outFields: ["*"],
    infoTemplate: template
  });

  map.addLayer(featureLayer);
  map.addLayer(adventureMaps);
  map.addLayer(localMaps);
  map.addLayer(cityMaps);
  // Create the MapView
 /* var view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 8,
    center: [-71.085421, 42.34745],
    popup: {
      actions: [],
      alignment: "auto",
      dockOptions: {
        buttonEnabled: false,
        // Disable the dock button so users cannot undock the popup
        // Dock the popup when the size of the view is less than or equal to 600x1000 pixels
        breakpoint: {
          width: 0,
          height: 0
        }
      },
      visibleElements: {
        closeButton: false
      }
    }
  });*/
  var searchWidget = new Search({
    map: map,
    sources: [
      {
        layer: featureLayer,
        searchFields: ["MapTitle", "ProdCode"],
        suggestionTemplate: "{MapTitle} ({ProdCode})",
        exactMatch: false,
        outFields: ["MapTitle", "ProdCode"],
        placeholder: "Search Maps"
      }
    ],
    includeDefaultSources: false
  });
  searchWidget.startup();
 /*
  map.graphicsLayerIds.forEach(function (arrayItem) {
    console.log("A:"+arrayItem);
    var element = document.createElement("div");
	console.log("b");
    var layer = map.getLayer(arrayItem);
	
    
    console.log(layer.url);
    if (layer.visible) {
      element.style = "-webkit-filter: grayscale(0);";
    } else {
      element.style = "-webkit-filter: grayscale(1);";
    }
    element.id = "layer-button-" + layer.title;
    element.className = "layer-button";
    var map_images = [
      {
        name: "Trails Illustrated",
        featureUrl:"https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/TI_BdryPoly/FeatureServer/0/",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/trails-illustrated-maps.png"
      },
      {
        name: "City Maps",
        featureUrl:"https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/DC_Point/FeatureServer/0/",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/city-destination-maps.png"
      },
      {
        name: "Local Maps",
        featureUrl:"https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/LCT_BdryPoly/FeatureServer/0/",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/local-trails.png"
      },
      {
        name: "Adventure Maps",
        featureUrl:"https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/AD_BdryPoly/FeatureServer/0/",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/adventure-maps.png"
      }
    ];
    //var url = map_images.find((x) => x.featureUrl === layer.url).url;
    var url = map_images.find(function(x){return x.featureUrl === layer.url;}).url;
	element.innerHTML =
      '<img src="' + url + '" height=50px><br>' + "Name needed";
    element.addEventListener("click", function (evt) {
      layer.visible = !layer.visible;
      if (layer.visible) {
        element.style = "-webkit-filter: grayscale(0);";
      } else {
        element.style = "-webkit-filter: grayscale(1);";
      }
    });
    document.getElementById("layerlistdiv").appendChild(element);

    if (layer.visible) {
      console.log(layer.displayField);
    }
  });
  var element = document.createElement("div");
  element.id = "sidenav-button";
  element.className =
    "esri-icon-layers esri-widget--button esri-widget esri-interactive";
  element.addEventListener("click", function (evt) {
    openNav();
  });
  document.getElementsByTagName('body')[0].appendChild(element);
*/
});
//});


function open_popup(code) {
  var modal = document.getElementById("Modal");
  modal.style.visibility = "visible";
  initMap("https://images.natgeomaps.com/PROD_ZOOM/" + code, 2, "_1");
}

$(".Close").click(function () {
  var modal = document.getElementById("Modal");
  modal.style.visibility = "hidden";
});

$(document).keydown(function (e) {
  if (e.keyCode == 27) {
    var modal = document.getElementById("Modal");
    modal.style.visibility = "hidden";
  }
});

function initMap(product_code, num_images, first_image) {
  console.log(product_code);
  if (typeof num_images === "undefined") {
    num_images = 1;
  }
  if (typeof first_image === "undefined") {
    first_image = "_0";
  }

  first_image = parseInt(first_image.substring(1));
  /*
  var links = "";
  var i;
  for (i = first_image; i < first_image + num_images; i++) {
    var image_path = product_code + "_" + i;
    links +=
      '<a href="#" data-image-path="' +
      image_path +
      '"><img src="' +
      image_path +
      '/TileGroup0/0-0-0.jpg"/></a>';
  }

  $("#chooser").html(links);
  $("#chooser a").on("click", function (e) {
    var path = $(this).data("image-path");

    $.ajax({
      url:
        "https://ophir.alwaysdata.net/dezoomify/proxy.php?url=" +
        path +
        "/ImageProperties.xml",
      //type: 'GET',
      //crossDomain: true,
      dataType: "html"
    }).done(function (result) {
      var options = "zImageProperties=" + result.replace(/"/g, "'");
      Z.Viewer.setImagePath(path, options);
    });
    e.preventDefault();
  });
*/
	var xhttp = new XMLHttpRequest();
	console.log("a");
	xhttp.onreadystatechange = function() {
	console.log("e: R["+this.readyState+"]");
	if (this.readyState==4){
		console.log(" S:["+this.status+"]");
	}
		if (this.readyState == 4 && this.status == 200) {
				console.log("f");
			var result = xhttp.responseText;
			console.log(result.replace(/"/g, "'"));

			viewer = OpenSeadragon({
			  id: "modal-map",
			  prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/",
			  tileSources: [
				{
				  type: "zoomifytileservice",
				  width: parseInt(result.split('WIDTH="')[1].split('"')[0]),
				  height: parseInt(result.split('HEIGHT="')[1].split('"')[0]),
				  tilesUrl: product_code + "_" + first_image + "/"
				}
			  ]
			});
		console.log("viewing");
	  }
	  else{
		  console.log("X"+xhttp.responseText);
	  }
	};
		console.log("b");
	xhttp.open("GET", /*"https://ophir.alwaysdata.net/dezoomify/proxy.php?url=" +
      product_code +
      "_" +
      first_image +
      "/ImageProperties.xml"*/"https://ailgup.bitbucket.io", true);
	console.log("c");
	xhttp.send();
		console.log("d");
}
$(".esri-icon-download").click(function () {
  
  var win = window.open('https://ailgup.github.io/natgeomap/dezoomify.html#'+Z.Viewer.getImagePath()+'/ImageProperties.xml', '_blank');
  if (win) {
      //Browser has allowed it to be opened
      win.focus();
  } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
  }
});
$(".esri-icon-swap").click(function () {
  console.log("flip");
  var url = Z.Viewer.getImagePath();
  var cur = url.slice(-1);
  console.log("url:" + url + " cur:" + cur);
  if (cur === "1") {
    getAjaxandSetImagePath(url.slice(0, -2), "2");
  }
  if (cur === "2") {
    getAjaxandSetImagePath(url.slice(0, -2), "1");
  }
});
function getAjaxandSetImagePath(url, first_image) {
  $.ajax({
    url:
      "https://ophir.alwaysdata.net/dezoomify/proxy.php?url=" +
      url +
      "_" +
      first_image +
      "/ImageProperties.xml",
    //type: 'GET',
    //crossDomain: true,
    dataType: "html"
  }).done(function (result) {
    var options =
      "zToolbarInternal=1&" +
      "zMousePan=1&" +
      "zMouseWheel=1&" +
      //"zDoubleClickZoom=1&" +
      "zNavigatorVisible=0&" +
      "zImageProperties=" +
      result.replace(/"/g, "'");
    console.log("path:" + url + "_" + first_image);
    Z.showImage("modal-map", url + "_" + first_image, options);
  });
}
$("#expand-one").click(function () {
  $("#chooser").slideDown();
});
$("#expand-one").mouseleave(function () {
  $("#chooser").slideUp();
});
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("sidebar").style.width = "250px";
  document.getElementById("viewDiv").style.marginLeft = "250px";
  document.getElementById("layerlistdiv").style.display = "block";
  document.getElementById("sidenav-button").style.display = "none";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("sidebar").style.width = "0px";
  document.getElementById("viewDiv").style.marginLeft = "0px";
  document.getElementById("sidenav-button").style.display = "block";
  document.getElementById("layerlistdiv").style.display = "none";
}