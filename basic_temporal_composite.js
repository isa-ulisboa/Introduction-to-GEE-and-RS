var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// access image collection, select 10 m bands, filter for location and range of dates
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .select(['B2','B3','B4','B8'])
                .filterBounds(geometry)
                .filterDate('2024-01-01', '2024-03-01')

// filter using property
var filtered = S2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

// reduce image collection to image
var S2clear=filtered.median()

// center map; 13 is the zoom level; 14 would zoom in more
Map.centerObject(geometry, 13);

// simple set of parameters for visualization
var vizParams={bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}

// add layer
Map.addLayer(S2clear, vizParams, 'Sentinel-2 level 2A, RGB=843, Jan 1-Mar 1, 2024');
