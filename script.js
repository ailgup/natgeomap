if (navigator.onLine) {
    require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/dijit/LayerList",
        "esri/dijit/Search",
        "esri/dijit/Popup",
        "esri/dijit/PopupTemplate",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "esri/symbols/TextSymbol",
        "esri/layers/LabelClass",
        "esri/symbols/SimpleMarkerSymbol",
		"esri/tasks/query"
    ], function(
        Map,
        FeatureLayer,
        LayerList,
        Search,
        Popup,
        PopupTemplate,
        SimpleRenderer,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        TextSymbol,
        LabelClass,
        SimpleMarkerSymbol,
		Query
    ) {


        var map = new Map("viewDiv", {
            basemap: "streets",
            //basemap: "topo-vector"
            center: [-71.085421, 42.34745],
            zoom: 8,
            showLabels: true,
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

        function buildPopupContent(event) {

            var title = event.attributes.MapTitle;
            var code = event.attributes.ProdCode;
            var fid = event.attributes.FID;
			
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

        // create a text symbol to define the style of labels
        var statesLabel = new TextSymbol().setColor(new Color("#666"));
        statesLabel.font.setFamily("times");


        //create instance of LabelClass (note: multiple LabelClasses can be passed in as an array)
        var labelClass = new LabelClass({
            "labelExpressionInfo": {
                "value": "{MapTitle}"
            }
        });
        labelClass.symbol = statesLabel; // symbol also can be set in LabelClass' json

        var trailsMapsStyle = new SimpleRenderer(
            new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([79, 129, 83, 1]), 2),
                new Color([79, 129, 83, 0.25])
            ));
        var adventureMapsStyle = new SimpleRenderer(
            new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([153, 85, 144, 1]), 2),
                new Color([153, 85, 144, 0.203922])
            ));
        var localMapsStyle = new SimpleRenderer(
            new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([113, 63, 35, 1]), 2),
                new Color([113, 63, 35, 0.25])
            ));
        var cityMapsStyle = new SimpleRenderer(
            new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 20,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([143, 25, 30]), 1),
                new Color([143, 25, 30, 0.5])));
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
        var tiMaps = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/TI_BdryPoly/FeatureServer/0/", {
            name: "Trails Illustrated",
            outFields: ["FID", "MapNumb", "MapTitle", "ProdCode"],
            labelingInfo: [labelClass],
            infoTemplate: template
        });
		console.log(tiMaps.getField("FID"));
        var adventureMaps = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/AD_BdryPoly/FeatureServer/0/", {
            name: "Adventure Maps",
            visible: false,
            outFields: ["*"],
            labelingInfo: [labelClass],
            infoTemplate: template
        });

        var localMaps = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/LCT_BdryPoly/FeatureServer/0/", {
            name: "Local Maps",
            visible: false,
            outFields: ["*"],
            labelingInfo: [labelClass],
            infoTemplate: template
        });
        var cityMaps = new FeatureLayer("https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/DC_Point/FeatureServer/0/", {
            name: "City Maps",
            visible: false,
            labelingInfo: [labelClass],
            style: "circle",
            size: 6,
            color: [255, 0, 0],
            outFields: ["*"],
            infoTemplate: template
        });

        tiMaps.setRenderer(trailsMapsStyle);
        adventureMaps.setRenderer(adventureMapsStyle);
        localMaps.setRenderer(localMapsStyle);
        cityMaps.setRenderer(cityMapsStyle);

        tiMaps.setLabelingInfo([labelClass]);
        adventureMaps.setLabelingInfo([labelClass]);
        localMaps.setLabelingInfo([labelClass]);


        map.addLayer(tiMaps);
        map.addLayer(adventureMaps);
        map.addLayer(localMaps);
        map.addLayer(cityMaps);

		
		/* run this code to build JSON for pulling down map dimensions */
			/*
			
			
		var query = new Query();
		query.where="1=1";
		query.outFields = [ "ProdCode" ];
		var a = []
		// Query for the features with the given object ID
		tiMaps.queryFeatures(query, function(featureSet) {
			featureSet.features.forEach(function(f){
				a.push(f.attributes.ProdCode);	  
		  });
		  fetchURLsAndCreateJSON(a)
		});
		
		
			  */
		/* end of JSON Fetch*/
		
		
        var searchWidget = new Search({
            map: map,
            sources: [{
                featureLayer: tiMaps,
                searchFields: ["MapTitle", "ProdCode"],
                suggestionTemplate: "${MapTitle} (${ProdCode})",
                exactMatch: false,
                outFields: ["MapTitle", "ProdCode"],
                placeholder: "Search Maps",
                enableSuggestions: true
            }],
            includeDefaultSources: false
        }, "ui-dijit-search");
        searchWidget.startup();

        map.graphicsLayerIds.forEach(function(arrayItem) {
            var element = document.createElement("div");
            var layer = map.getLayer(arrayItem);

            if (layer.visible) {
				
				element.style = "-webkit-filter: grayscale(0);";
            } else {
                element.style = "-webkit-filter: grayscale(1);";
            }
            element.id = "layer-button-" + layer.title;
            element.className = "layer-button";
            var map_images = [{
                    name: "Trails Illustrated",
                    featureUrl: "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/TI_BdryPoly/FeatureServer/0/",
                    url: "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/trails-illustrated-maps.png"
                },
                {
                    name: "City Maps",
                    featureUrl: "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/DC_Point/FeatureServer/0/",
                    url: "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/city-destination-maps.png"
                },
                {
                    name: "Local Maps",
                    featureUrl: "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/LCT_BdryPoly/FeatureServer/0/",
                    url: "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/local-trails.png"
                },
                {
                    name: "Adventure Maps",
                    featureUrl: "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/AD_BdryPoly/FeatureServer/0/",
                    url: "https://www.natgeomaps.com/pub/media/wysiwyg/infortis/brands/adventure-maps.png"
                }
            ];
			
            var i;
            var url = "none";
            for (i = 0; i < map_images.length; i++) {
                if (map_images[i].featureUrl === layer.url) {
                    url = map_images[i].url;
                    break;
                }
            }
            element.innerHTML =
                '<img src="' + url + '" height=50px><br>';
            element.addEventListener("click", function(evt) {
				
                if (layer.visible) {
                    layer.hide();
                    element.style = "-webkit-filter: grayscale(1);";
                } else {
                    layer.show();
                    element.style = "-webkit-filter: grayscale(0);";
                }
            });
            document.getElementById("layerlistdiv").appendChild(element);

        });
        var element = document.createElement("div");
        element.id = "sidenav-button";
        element.className =
            "esri-icon-layers esri-widget--button esri-widget esri-interactive";
        element.addEventListener("click", function(evt) {
            openNav();
        });
        document.getElementsByTagName('body')[0].appendChild(element);

		

    });
} //end of online
else {
    //offline
    $("#viewDiv").html("<h3>OFFLINE</h3><br><button id='button'>Open</button><input id='file-input' type='file' name='name' style='display: none;' />");
    $('#button').on('click', function() {
        //$('#file-input').trigger('click');
    });


}
//});


function open_popup(code) {
    var modal = document.getElementById("Modal");
    modal.style.visibility = "visible";
    initMap(code, 2, "_1");
}

$(".Close").click(function() {
    viewer.destroy();
    var modal = document.getElementById("Modal");
    modal.style.visibility = "hidden";
});

$(document).keydown(function(e) {
    if (e.keyCode == 27) {
        var modal = document.getElementById("Modal");
        modal.style.visibility = "hidden";
    }
});

function initMap(product_code, num_images, first_image) {
	
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
var prefix = ((location.protocol === "https:") ? 'https:' : 'http:');

    $.ajax({
        //url: prefix+'//api.codetabs.com/v1/proxy/?quest=' + product_code + "_" + first_image + "/ImageProperties.xml",
        url: "https://ailgup.github.io/natgeomap/data_output.json",
        type: 'GET',
        async: true,
        success: function(result) {
			
			console.log(result);
			//result = JSON.parse(result);
			var found = result.filter(function(item) { return item.img.id === product_code; });

			console.log(found);
			console.log(found[0].img.data[1].WIDTH);
            

			viewer = OpenSeadragon({
				id: "modal-map",
				prefixUrl: "https://ailgup.github.io/natgeomap/images/",
				sequenceMode: true,
				maxZoomPixelRatio: 5,
				zoomInButton:   "zoom-in",
				zoomOutButton:  "zoom-out",
				homeButton:     "home",
				fullPageButton: "full-page",
				nextButton:     "next",
				previousButton: "previous",
				tileSources: [{
						type: "zoomifytileservice",
						width: parseInt(found[0].img.data[1].WIDTH),
						height: parseInt(found[0].img.data[1].HEIGHT),
						tilesUrl: "https://images.natgeomaps.com/PROD_ZOOM/"+product_code + "_" + first_image + "/"
					},

					{
						type: "zoomifytileservice",
						width: parseInt(found[0].img.data[2].WIDTH),
						height: parseInt(found[0].img.data[2].HEIGHT),
						tilesUrl: "https://images.natgeomaps.com/PROD_ZOOM/"+product_code + "_" + (first_image + 1) + "/"
					}
				]
			});
			
					

        }
    });



}
$(".esri-icon-download").click(function() {

    var win = window.open('https://ailgup.github.io/natgeomap/dezoomify.html#' + Z.Viewer.getImagePath() + '/ImageProperties.xml', '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Please allow popups for this website');
    }
});

$("#expand-one").click(function() {
    $("#chooser").slideDown();
});
$("#expand-one").mouseleave(function() {
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

function fetchURLsAndCreateJSON(urls) {
  const data = [];

  function downloadJSON(jsonData) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();

    URL.revokeObjectURL(url);
  }
	data.push(urls);
	
      const jsonData = JSON.stringify(data);
      downloadJSON(jsonData);

}




