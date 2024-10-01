var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(geometry)
      .filterDate('2022-06-01', '2024-09-30')
      .select(['B8', 'B4'])

// center map; 16 is the zoom level; 17 would zoom in further
Map.centerObject(geometry, 16);

// print to console
print(S2);

// Add geometry to the map
Map.addLayer(geometry, {color: 'red'}, 'Vinha ISA');

// Function that adds an NDVI band to an image with B4 and B8
var add_ndvi_to_s2 = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands([ndvi]);
};

// Add NDVI to all the images of the collection
var S2 = S2.map(add_ndvi_to_s2)

// Create chart
var chart =
    ui.Chart.image
        .seriesByRegion({
          imageCollection: S2,
          band: 'NDVI',
          regions: geometry,
          reducer: ee.Reducer.mean(),
          scale: 10,
          xProperty: 'system:time_start'
        });

print(chart);
