// Approximate boundary of the Município de Alcoutim
var alcoutim = ee.Geometry.Polygon(
        [[[-7.896672414445414, 37.41096552821506],
          [-7.893239186906351, 37.389146295558945],
          [-7.867146657609476, 37.375506049351095],
          [-7.814961599015726, 37.371686335804405],
          [-7.771016286515726, 37.37277770237958],
          [-7.736684011125101, 37.32310445134313],
          [-7.734624074601664, 37.2963437062762],
          [-7.691365407609476, 37.29033488301589],
          [-7.682439016007914, 37.27613030208597],
          [-7.667332814836039, 37.272305533768424],
          [-7.637120412492289, 37.273944743984686],
          [-7.626134084367289, 37.283779255738736],
          [-7.626134084367289, 37.295797469448715],
          [-7.629567311906351, 37.313275080396856],
          [-7.621327565812601, 37.33129461182027],
          [-7.608281301164164, 37.346034650821245],
          [-7.604161428117289, 37.37004925617076],
          [-7.550603078507914, 37.3880551671706],
          [-7.481938527726664, 37.36568353582952],
          [-7.435246633195414, 37.36568353582952],
          [-7.435933278703226, 37.39460169929086],
          [-7.446919606828226, 37.430597405408825],
          [-7.459279225968851, 37.48128926177791],
          [-7.488118337296976, 37.52541223232815],
          [-7.540303395890726, 37.53085770414304],
          [-7.584935353898539, 37.52813501792689],
          [-7.622700856828226, 37.500902690138446],
          [-7.633687184953226, 37.50961811615973],
          [-7.695485280656351, 37.510162796502684],
          [-7.760029958390726, 37.49164143520329],
          [-7.834187673234476, 37.46058061169676],
          [-7.895985768937601, 37.438230634285944]]]);

// access image collection, select 10 m bands, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .select(['B2','B3','B4','B8'])
                .filterBounds(alcoutim)
                .filterDate('2023-06-01', '2023-08-31')

// filter using property
var filtered = S2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1));

// reduce image collection to image
var S2clear=filtered.median()

// clip image using feature collection, just for visualization
var S2alcoutim=S2clear.clip(alcoutim)

// center map
Map.centerObject(S2, 11);

// define visualization parameters.
var vizParams = {
  bands: ['B8', 'B4', 'B3'],
  min: 0,
  max: [5000,4000,4000],
  opacity: 0.6
};

// add layer
Map.addLayer(S2alcoutim, vizParams, 'S2 Alcoutim, opacity=0.7');

// compute indices
var ndgb = S2alcoutim.normalizedDifference(['B3', 'B2']).rename('NDGB');
var ndvi = S2alcoutim.normalizedDifference(['B8', 'B4']).rename('NDVI');

// add new bands
S2alcoutim = S2alcoutim.addBands([ndgb,ndvi])

// create mask for solar panels
var maskSP=S2alcoutim.select('B8').gt(1000)
          .and(S2alcoutim.select('B3').lt(1250))
          .and(S2alcoutim.select('B8').lt(1800))
          .and(S2alcoutim.select('NDGB').lt(0.13))
          .and(S2alcoutim.select('NDVI').lt(0.15))

// display mask 
var vizParams={bands: ['B3'],min:500, max: 1150, palette: ['red', 'brown']}
Map.addLayer(S2alcoutim.updateMask(maskSP), vizParams , 'Solar Panels');
