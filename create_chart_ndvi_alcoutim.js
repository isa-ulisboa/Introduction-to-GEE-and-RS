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

// Feature Collection of solar farm locations     
var solar_farms = ee.FeatureCollection([
        ee.Feature(ee.Geometry.Point([-7.581315725226887, 37.44977560189899]),{name: 'vicentes', color: 'blue'}),
        ee.Feature(ee.Geometry.Point([-7.613073079963215, 37.449980021136575]),{name: 'pereiro', color: 'yellow'}),
        ee.Feature(ee.Geometry.Point([-7.693075049521815, 37.383792590263845]),{name: 'zambujal', color: 'green'}),
        ee.Feature(ee.Geometry.Point([-7.673361113945973, 37.45563071528393]),{name: 'viçoso', color: 'red'}),
        ee.Feature(ee.Geometry.Point([-7.715182889197569, 37.41416981246133]),{name: 'santa_justa', color: 'brown'}),
        ee.Feature(ee.Geometry.Point([-7.537620761881514, 37.45729422065703]),{name: 'corte', color: 'purple'}),
        ]);

// Sentinel-2 level 2A collection filtered for low cloud cover
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .select(['B4','B8'])
                .filterBounds(alcoutim)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1));

// This function adds an NDVI band
var add_ndvi_to_s2 = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands([ndvi]);
};


// Use map to apply function to all images in S2
var S2 = S2.map(add_ndvi_to_s2)

var chart =
    ui.Chart.image
        .seriesByRegion({
          imageCollection: S2,
          band: 'NDVI',
          regions: solar_farms,
          reducer: ee.Reducer.mean(),
          scale: 10,
          seriesProperty: 'name',
          xProperty: 'system:time_start'
        })
        .setOptions({
          title: 'NDVI Value by Date',
          hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'NDVI',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 2,
          colors: ['blue', 'yellow', 'green','red','brown','purple'],
        });
        
print(chart);

Map.addLayer(solar_farms,{},'Solar farms')
Map.addLayer(alcoutim,{color: 'gray', opacity: 0.3}, 'Alcoutim')
