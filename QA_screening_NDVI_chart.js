var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 * https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED
 */
function maskS2clouds(image) {
  var date = image.get('system:time_start'); // otherwise, this property is lost
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000).set('system:time_start', date);
}


// access image collection, filter for location and range of dates
// use built-in cloud screening (tile and pixel level)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(geometry)
      .filterDate('2022-06-01', '2024-09-30')
      .select(['B8', 'B4','QA60'])
      // Pre-filter to get less cloudy granules.
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
      .map(maskS2clouds);

// center map; 
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
