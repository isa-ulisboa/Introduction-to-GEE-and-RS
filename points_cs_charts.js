var multipoints =[[-9.18511947486878, 38.70673673565854],
         [-9.185698832015996, 38.707121861392295],
         [-9.184983887235997, 38.70708122565936]];

var geometry = ee.FeatureCollection(multipoints.map(function(p){
  var point = ee.Feature(ee.Geometry.Point(p), {})
  return point
}))

print(geometry)

// Cloud Score+ image collection. Note Cloud Score+ is produced from Sentinel-2
// Level 1C data and can be applied to either L1C or L2A collections.
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');

// Use 'cs' or 'cs_cdf', depending on your use case; see docs for guidance.
var QA_BAND = 'cs';
// The threshold for masking; values between 0.50 and 0.65 generally work well.
// Higher values will remove thin clouds, haze & cirrus shadows.
var CLEAR_THRESHOLD = 0.60;

// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(geometry)
      .filterDate('2022-06-01', '2024-09-30')
      .select(['B8', 'B4'])
      .linkCollection(csPlus, [QA_BAND])
      .map(function(img) {
        return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD));
    })


// center map; 16 is the zoom level; 17 would zoom in further
Map.centerObject(geometry, 16);

// print to console
print(S2);

// Add geometry to the map
Map.addLayer(geometry, {color: 'red'}, 'Vinha ISA');

// Add NDVI to one image
var add_ndvi_to_s2 = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands([ndvi]);
};

// Add NDVI to all images
var S2 = S2.map(add_ndvi_to_s2)

// Create chart with options
var chart =
    ui.Chart.image
        .seriesByRegion({
          imageCollection: S2,
          band: 'NDVI',
          regions: geometry,
          reducer: ee.Reducer.mean(),
          scale: 10,
          xProperty: 'system:time_start'
        })
        .setOptions({
          interpolateNulls: true,
          title: 'NDVI Value by Date',
          hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'NDVI',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 2,
          colors: ['blue','red','green'], //['blue', 'yellow', 'green','red','brown','purple'],
        });

print(chart);
