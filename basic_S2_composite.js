var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(geometry)
                .filterDate('2024-06-01', '2024-09-30')
                .select(['B8', 'B4', 'B3','B2'])
                .sort('CLOUDY_PIXEL_PERCENTAGE',true);

// center map; 11 is the zoom level; 12 would zoom in further
Map.centerObject(geometry, 16);

// add true color composite layer to the map
Map.addLayer(S2.first(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500}, 'Sentinel-2 level 2A RGB=432');

// print to console
print(S2);

// Add geometry to the map
Map.addLayer(geometry, {color: 'red'}, 'Vinha ISA');
