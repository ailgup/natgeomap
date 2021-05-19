$(document).ready(function () {});
var map;
require([
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/widgets/Editor",
  "esri/views/MapView",
  "esri/widgets/LayerList",
  "esri/popup/content/AttachmentsContent",
  "esri/popup/content/TextContent",
  "esri/widgets/Search"
], function (
  Map,
  FeatureLayer,
  Editor,
  MapView,
  LayerList,
  AttachmentsContent,
  TextContent,
  Search
) {
  /************************************************************
   * Creates a new WebMap instance. A WebMap must reference
   * a PortalItem ID that represents a WebMap saved to
   * arcgis.com or an on-premise portal.
   *
   * To load a WebMap from an on-premise portal, set the portal
   * url with esriConfig.portalUrl.
   ************************************************************/
  const map = new Map({
    basemap: "streets"
    //basemap: "topo-vector"
  });
  const template = {
    title: "",
    content: buildPopupContent
  };
  
  function buildPopupContent(event){
      console.dir(event);
      const { graphic } = event;
      var title = graphic.attributes.MapTitle;
      var code = graphic.attributes.ProdCode;
      var fid = graphic.attributes.FID;

      console.log(code);
      if (title === undefined) {
        var prom = graphic.layer.queryFeatures().then(function (results) {
          results.features.forEach(function (f) {
            if (f.attributes.FID === fid) {
              console.log("FOUND");
              title = f.attributes.MapTitle;
              code = f.attributes.ProdCode;
              console.log("F:" + fid + " T:" + title + " C:" + code);
            }
          });
        });
              var div = document.createElement("div");
              div.className = "";
              div.innerHTML =
                "<div style='width:fit-content;margin: 0px;' onclick=\"open_popup('" +
                code +
                '\')" class="popup-link">' +
                //'<h3>'+title +'</h3>'+
                '<img class="esriPopupMediaImage" height="100%" src="http://images.natgeomaps.com/PROD_SM_250px/' +
                code +
                '_0_SM.jpg" style=""></div>';
       
        graphic.popupTemplate = {content:div};
        console.dir(graphic);
        return;
        }
        
     else {
        console.log("F:" + fid + " T:" + title + " C:" + code);
        var div = document.createElement("div");
        div.className = "";
        div.innerHTML =
          "<div style='width:fit-content;margin: 0px;' onclick=\"open_popup('" +
          code +
          '\')" class="popup-link">' +
          //'<h3>'+title +'</h3>'+
          '<img class="esriPopupMediaImage" height="100%" src="http://images.natgeomaps.com/PROD_SM_250px/' +
          code +
          '_0_SM.jpg" style=""></div>';
        return div;
      }
    
  };

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
      color: [255, 255, 0, 0.203922],
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
  const labelClass = {
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
  const featureLayer = new FeatureLayer({
    title: "Trails Illustrated",
    url:
      "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/TI_BdryPoly/FeatureServer/0/",
    outFields: ["FID", "MapNumb", "MapTitle", "ProdCode"],
    labelingInfo: [labelClass],
    popupTemplate: template,
    renderer: trailsMapsStyle
  });

  const adventureMaps = new FeatureLayer({
    title: "Adventure Maps",
    visible: false,
    url:
      "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/AD_BdryPoly/FeatureServer/0/",
    outFields: ["*"],
    popupTemplate: template,
    renderer: adventureMapsStyle
  });

  const localMaps = new FeatureLayer({
    title: "Local Maps",
    visible: false,
    url:
      "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/LCT_BdryPoly/FeatureServer/0/",
    outFields: ["*"],
    popupTemplate: template,
    renderer: localMapsStyle
  });
  const cityMaps = new FeatureLayer({
    title: "City Maps",
    visible: false,
    url:
      "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/DC_Point/FeatureServer/0/",
    outFields: ["*"],
    popupTemplate: template
  });

  map.add(featureLayer);
  map.add(adventureMaps);
  map.add(localMaps);
  map.add(cityMaps);
  // Create the MapView
  const view = new MapView({
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
  });
  var searchWidget = new Search({
    view: view,
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
  view.when(function () {
    /* var layerList = new LayerList({
      view: view,
      container: layerlistdiv
    });*/
    view.ui.add(searchWidget, {
      position: "top-right",
      index: 0
    });
    // Add widget to the top right corner of the view
    //view.ui.add(layerList, "top-right");
  });

  view.ui.move("zoom", "top-right");
  map.layers.forEach(function (arrayItem) {
    var element = document.createElement("div");
    if (arrayItem.visible) {
      element.style = "-webkit-filter: grayscale(0);";
    } else {
      element.style = "-webkit-filter: grayscale(1);";
    }
    element.id = "layer-button-" + arrayItem.title;
    element.className = "layer-button";
    let map_images = [
      {
        name: "Trails Illustrated",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/trails-illustrated-maps.png"
      },
      {
        name: "City Maps",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/city-destination-maps.png"
      },
      {
        name: "Local Maps",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/local-trails.png"
      },
      {
        name: "Adventure Maps",
        url:
          "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/adventure-maps.png"
      }
    ];
    let url = map_images.find((x) => x.name === arrayItem.title).url;
    element.innerHTML =
      '<img src="' + url + '" height=50px><br>' + arrayItem.title;
    element.addEventListener("click", function (evt) {
      arrayItem.visible = !arrayItem.visible;
      if (arrayItem.visible) {
        element.style = "-webkit-filter: grayscale(0);";
      } else {
        element.style = "-webkit-filter: grayscale(1);";
      }
    });
    document.getElementById("layerlistdiv").appendChild(element);

    if (arrayItem.visible) {
      console.log(arrayItem.title);
    }
  });
  var element = document.createElement("div");
  element.id = "sidenav-button";
  element.className =
    "esri-icon-layers esri-widget--button esri-widget esri-interactive";
  element.addEventListener("click", function (evt) {
    openNav();
  });
  view.ui.add(element, "top-left");
});
//});
function open_popup(code) {
  var modal = document.getElementById("Modal");
  modal.style.display = "block";
  initMap("https://images.natgeomaps.com/PROD_ZOOM/" + code, 2, "_1");
}

$(".Close").click(function () {
  var modal = document.getElementById("Modal");
  modal.style.display = "none";
});

$(document).keydown(function (e) {
  if (e.keyCode == 27) {
    var modal = document.getElementById("Modal");
    modal.style.display = "none";
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
  var links = "";

  for (var i = first_image; i < first_image + num_images; i++) {
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

  $.ajax({
    url:
      "https://ophir.alwaysdata.net/dezoomify/proxy.php?url=" +
      product_code +
      "_" +
      first_image +
      "/ImageProperties.xml",
    //type: 'GET',
    //crossDomain: true,
    dataType: "html"
  }).done(function (result) {
    console.log(result.replace(/"/g, "'"));

    Z.showImage(
      "modal-map",
      product_code + "_" + first_image,
      "zToolbarInternal=1&" +
        "zMousePan=1&" +
        "zMouseWheel=1&" +
        //"zDoubleClickZoom=1&" +
        "zNavigatorVisible=0&" +
        "zImageProperties=" +
        result.replace(/"/g, "'")
    );

    //Z.Viewer.autoResizeViewer();
  });
}
$(".esri-icon-swap").click(function () {
  console.log("flip");
  let url = Z.Viewer.getImagePath();
  let cur = url.slice(-1);
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