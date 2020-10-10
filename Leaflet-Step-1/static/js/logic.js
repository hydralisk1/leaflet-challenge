// Function running initially
function init(){
    var baseUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";
    // Today
    var today = new Date();
    // The date a week ago
    var aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);
    
    // Function that makes date type to string of 'YYYY-mm-dd' type
    var getDateString = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Send a query to get earthquake information from a week ago to today
    d3.json(`${baseUrl}&starttime=${getDateString(aWeekAgo)}&endtime=${getDateString(today)}`, data =>{
        // Set markers
        var earthquakes = L.geoJSON(data.features, {
            // Make markers circle shapes
            pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
                // Radii of markers are their magnitude level
                radius: feature.properties.mag*5,
                // Fill colors depending on the earthquake depths
                fillColor: getColor(feature.geometry.coordinates[2]),
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }),
            onEachFeature: (feature, layer) => {
                // Popups when the markers get clicked
                layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                Date : ${getDateString(new Date(feature.properties.time))}<br>
                Mag. : ${feature.properties.mag}<br>
                Depth: ${feature.geometry.coordinates[2]}`);
            }
        });

        renderMap(earthquakes);
    });
}

// Function to render a map
function renderMap(earthquakes){
    // Map type: lightmap
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var myMap = L.map("mapid", {
        center: [39.83, -98.58],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });

    // Making a legend
    var legend = L.control({position: "bottomright"});
    
    legend.onAdd = () => {
        var div = L.DomUtil.create("div", "info legend");
        var depthLv = [-10, 10, 30, 50, 70, 90];
        for(var i = 0;i < depthLv.length;i++){
            div.innerHTML += '<i style="background:'+getColor(depthLv[i]+1)+'"></i>'
                             + depthLv[i] + (depthLv[i+1] ? '&ndash;' + depthLv[i+1] + '<br>' :
                             '+');
        }

        return div;
    };

    legend.addTo(myMap);
}

// Function to provide colors to the legend and the markers
function getColor(d){
    return d > 90 ? "#ff5f65" :
           d > 70 ? "#fca35d" :
           d > 50 ? "#fdb72a" :
           d > 30 ? "#f7db11" :
           d > 10 ? "#dcf400" : "#a3f600";
}

init();