let message = document.querySelector('#message');
let button = document.querySelector('#refresh-data');

function createMap(earthGeoData, platesGeoData) {

    let markerSize = (size => size * 3);
    let markerColor = ( size => {
        if (size <= 1) {
            return  "#ADFF2F";

        } else if (size <=2 ) {
            return "#9ACD32";

        } else if (size <= 3) {
            return "#FFFF00";

        } else if (size <= 4) {
            return "#ffd700";

        } else if (size <= 5) {
            return "#FFA500";
        } else {
            return "#FF0000";
        }
    });    

    let basicMap = L.map('basicMap', {
        center: [0, 0],
        zoom: 3
        
    });

    let earthPlates =  L.geoJSON(platesGeoData).addTo(basicMap);

    let earthquakes =  L.geoJSON(earthGeoData, {
        pointToLayer: ((feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.properties.mag),
                fillOpacity: 0.8,
                color: markerColor(feature.properties.mag),               
                opacity: 1
            });

        }),
        onEachFeature: ((feature, layer) => {
            layer.bindPopup(`<h3> ${feature.properties.place}</h3><hr><p><strong>When:</strong> ${new Date(feature.properties.time)}</p><p><strong> Magnitude:</strong>${feature.properties.mag }</p>`)
        })
    }).addTo(basicMap);    

    let grayLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 14,
        id: 'mapbox.light',
        noWrap: true,
        accessToken: API_KEY
    }).addTo(basicMap);

    let satelliteLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 14,
        id: 'mapbox.streets-satellite',
        noWrap: true,
        accessToken: API_KEY
    }).addTo(basicMap); 

    let outDoorLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 14,
        id: 'mapbox.outdoors',
        noWrap: true,
        accessToken: API_KEY
    }).addTo(basicMap); 

    let legend = L.control({position: 'bottomright'})
    legend.onAdd = (map => {

        let div = L.DomUtil.create('div', 'info legend');
        let magnitutes = [0, 1, 2, 3, 4, 5];

        magnitutes.forEach((item,index) => {
            div.innerHTML += `<i style="background:${markerColor(item + 1)}"></i> ${item} ${index < magnitutes.length -1 ? '- ' + (index+1) : '+'}<br>`            
        })

        return div;
    });

    legend.addTo(basicMap);

    let baseMaps = {
        Grayscale: grayLayer,
        Satellite: satelliteLayer,
        Outdoor: outDoorLayer
    }

    let overlayMaps = {
        'Earthquakes': earthquakes,
        'Fault Lines': earthPlates
    }

    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(basicMap);
}

function run() {
    const earthQuakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
    const platesURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

    fetch(earthQuakeURL)
        .then(response => response.json())
        .then(data => {
            let earthData = data;

            fetch(platesURL)
                .then(response => response.json())
                .then(data => {
                    let platesData = data;

                    createMap(earthData.features, platesData.features);
                })
        });
        
    message.textContent = `Last updated : ${new Date()}`;
}

function init() {
    button.addEventListener('click', run);
    run();
}

init();
