**UC Agricultura Digital**

Tutorial: Brief Introduction to the Google Earth Engine (September, 15-22, 2025)

Main goal: learn how to use the GEE to create 10 meter resolution Sentinel-2 NDVI time series charts for chosen locations

Instructor: [Manuel Campagnolo ISA/ULisboa (mlc@isa.ulisboa.pt)](https://www.cienciavitae.pt//en/7F18-3B3C-06BB)

---

Before the tutorial, please sign up for [Google Earth Engine](https://code.earthengine.google.com/).

---

The tutorial will be *hands-on* using the GEE code editor. See [https://developers.google.com/earth-engine](https://developers.google.com/earth-engine) for code descriptions and examples that illustrate topics like finding and filtering data (spatially, temporally and spectrally), visualizing images, creating charts, creating new images and bands, screening images for clouds, and exporting data.

<details>
  
  <summary>Geospatial processing services</summary>
  
The GEE is one of several available **geospatial processing services** ofering a public data catalog, compute infrastructure and geospatial APIs:
1. Google Earth Engine (Google Cloud)
2. Microsoft Planetary Computer (Azure)
3. Amazon Web Services (AWS) GeoSpatial Services
4. [Copernicus Data Space Ecosystem](https://jupyterhub.dataspace.copernicus.eu), mostly for Sentinel imagery
5. ...
</details>


<details>
  
  <summary>Google Code Editor and documentation</summary>

In this tutorial we will focus on the **GEE code editor**, which just requires a browser and do not require installing any other software in the local machine. Scripts are written in *javascript* in the code editor and personnal data can either be stored in the user's Earth Engine account (up to 250 Mb) or in Google drive.

The code editor is available at https://code.earthengine.google.com 
![Alt text](https://developers.google.com/static/earth-engine/images/Code_editor_diagram.png "Code editor")

The sections of the Google Earth Engine documentation that are the most relevant for this tutorial are:
- https://developers.google.com/earth-engine/guides/getstarted
- https://developers.google.com/earth-engine/guides/playground (intro to code editor) 
- https://developers.google.com/earth-engine/guides/getstarted#earth-engine-data-structures (image and feature data structures)
- https://developers.google.com/earth-engine/guides/getstarted#finding-images,-image-collections-and-feature-collections (finding collections and images)
- https://developers.google.com/earth-engine/guides/image_overview (image and image collection)
- https://developers.google.com/earth-engine/guides/ic_reducing (reducing an image collection)
- https://developers.google.com/earth-engine/tutorials/tutorial_api_05?hl=en#masking (masking an image)
- https://developers.google.com/earth-engine/guides/image_visualization (image visualization)
- https://developers.google.com/earth-engine/guides/image_math (mathematical operations with images)
- https://developers.google.com/earth-engine/apidocs/ee-image-addbands (add bands to image)
- https://developers.google.com/earth-engine/guides/charts_overview (charts)
- https://developers.google.com/earth-engine/guides/charts_image_collection (image collection charts)
- https://developers.google.com/earth-engine/guides/exporting_images (exporting image to drive)

</details>

---
## Tutorial topics

### 1. Open session in the Code Editor

- Go to https://code.earthengine.google.com, choose account and Cloud project, and log in. 

### 2. Access image collection (Sentinel-2)
<details>
  
  <summary>Access, filter and plot Sentinel-2 image collection</summary>

For each script listed below, you can copy the script, paste it in the Code Editor and run it. You can then make changes to the script to test different parameter or instructions. You can save the script and give it a name in the Code Editor. You can also share it with the *Get link* button. For instance the first script is available here [GEE link](https://code.earthengine.google.com/ccb1c9392950c87058bd3bf2553fc09c?noload=true).

All available data sets can be found in the [Earth Engine Data Catalog](https://developers.google.com/earth-engine/datasets). Look for *Sentinel 2* for different nominal Sentinel-2 products and some derived ones. In particular, we will explore the product [COPERNICUS_S2_SR_HARMONIZED](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED) and the derived product [Cloud Score+ S2_HARMONIZED V1](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_CLOUD_SCORE_PLUS_V1_S2_HARMONIZED).

The script accesses Sentinel-2, level 2A images and it filters by dates and by bounds: here, the region of interest `geometry` is a single point defined by its coordinates. All Sentinel-2 tiles that *intersect* the geometry are selected. `CLOUDY_PIXEL_PERCENTAGE` is an `Image` property and can be used to sort or filter the `ImageCollection`. Note that sorting the collection by the property `CLOUDY_PIXEL_PERCENTAGE` should be applied last since it is computationally more demanding.

```
// ROI: in this case it is a single point determined by its longitude and latitude
var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(geometry)
                .filterDate('2024-06-01', '2024-09-30')
                .select(['B8', 'B4', 'B3','B2'])
                .sort('CLOUDY_PIXEL_PERCENTAGE',true);

// center map; 16 is the zoom level; 17 would zoom in further
Map.centerObject(geometry, 16);

// add true color composite layer to the map
Map.addLayer(S2.first(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500}, 'Sentinel-2 level 2A RGB=432');

// print to console
print(S2);

// Add geometry to the map
Map.addLayer(geometry, {color: 'red'}, 'Vinha ISA');
```

If you want to plot a false color composite, you can use instead
```
Map.addLayer(S2.first(), {bands: ['B8', 'B4', 'B3'], min: [0,0,0], max: [4500, 3500, 3500]}, 'Sentinel-2 level 2A RGB=843');
```

</details>


### 3. Create simple (median) temporal composite; understand what is a reduction
<details>
  
  <summary> Select images with low cloud cover and combine them into a single image </summary>

  * [GEE link](https://code.earthengine.google.com/aca2a78c9a479bd273e1f3848a871729?noload=true)

The idea is to filter the Sentinel-2 image collection using the property `CLOUDY_PIXEL_PERCENTAGE`. Only images with less than 10% cloud cover are selected. Then selected images are combined with a *temporal reducer* which can be for instance the `mean` or the `median`.

```
// ROI: in this case it is a single point determined by its longitude and latitude
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

```

![Alt text](https://developers.google.com/static/earth-engine/images/Reduce_ImageCollection.png "Image collection reduction")


In the example above, `median` is applied to all values of the image collection for the same pixel.  As a result, the date for each pixel of the reduced image can be distinct: for instance for one pixel the median value could correspond to `2022-01-05` while for a neighbor pixel the date could be , say, `2022-02-10'.

</details>

### 4. How to create a new band (e.g. NDVI) and add it to the image
<details>
  
  <summary> Create an index with normalized difference; add index to image bands</summary>

In remote sensing, it is very common to use an operation called *normalized difference* between two bands to compute an index. The most well-known index is the NDVI which measures the *greenness* of the land cover. 

We could created those indices with an expression or we can simply use the *normalized difference* operation available in GEE (see [https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference](https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference)).

```
// image needs to be defined, and has to have bands names B8 and B4

// create new band NDVI: notice that values are between -1 and 1.
var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

// add band to image
image = image.addBands([ndvi])
```
</details>

### 5. Create a basic temporal chart for NDVI (noisy chart with no preprocessing)

<details>
  
  <summary> Function, map and temporal chart </summary>

* [GEE link](https://code.earthengine.google.com/ce3bdfe65c7957f6dc69fcd3ab8690ad?noload=true)

The idea is to add the NDVI band to each image of a Sentinel-2 collection, and plot the NDVI values at a certain location along time with `ui.Chart.image.seriesByRegion`: see https://developers.google.com/earth-engine/guides/charts_overview and https://developers.google.com/earth-engine/guides/charts_image_collection for an overview of charts in GEE.

```
// ROI: in this case it is a single point determined by its longitude and latitude
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
```

</details>

### 6. NDVI chart with cloud screening at the pixel level with Sentinel-2 QA band

<details>
  
  <summary> Cloud screening with Sentinel-2 QA band </summary>

* [GEE link](https://code.earthengine.google.com/b99f30aeb6f9b583c5330f1e389d3c38?noload=true)

In this script, we filter clouds using two distinct strategies:
  - Using the property `CLOUDY_PIXEL_PERCENTAGE` for the whole tile: we select only tiles that have a cloud cover under a certain threshold we define;
  - Using the built-in *band* `QA60` of the Sentinel-2 Surface Reflectance product; this allow us to mask individual pixels within an image independently of the cloud cover.
  
```
var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// Cloud Masking with the SCL Band (Level-2A Products); the idea is to mask out pixels classified as clouds,shadows, ...
function maskClouds(image) {
  var scl = image.select('SCL');
  // Keep pixels classified as vegetation, water, bare soil, etc. (non-cloud)
  var mask = scl.neq(3)  // Shadow
           .and(scl.neq(8)) // Clouds
           .and(scl.neq(9)) // Cirrus
           .and(scl.neq(10)); // Snow
  return image.updateMask(mask);
}

// access image collection, filter for location and range of dates
// use built-in cloud screening (tile and pixel level)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(geometry)
      .filterDate('2022-06-01', '2025-09-30')
      .select(['B8', 'B4','SCL'])
      // Pre-filter to get less cloudy granules.
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
      .map(maskClouds);

// center map; 11 is the zoom level; 12 would zoom in further
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
```

</details>

### 7. Improved NDVI chart with cloud screening at the pixel level with Cloud Score+ for Sentinel-2

<details>
  
  <summary> Cloud screening with Cloud Score+ </summary>

* [GEE link](https://code.earthengine.google.com/e0ae77714f821964624366747f239286?noload=true)
  
Cloud Score+ is a Google product that is derived from Sentinel-2 [https://ieeexplore.ieee.org/document/10208818] and that can be combined with Sentinel-2 imagery to mask pixels with cloud score above some given threshold. The code below uses the `linkCollection` method to combine the Sentinel-2 collection with the Cloud Score+ collection. By default, the match is based on the `system:index` image property.

```
// ROI: in this case it is a single point determined by its longitude and latitude
var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// Cloud Score+ image collection. Note Cloud Score+ is produced from Sentinel-2
// Level 1C data and can be applied to either L1C or L2A collections.
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');

// Use 'cs' or 'cs_cdf', depending on your use case; see docs for guidance.
var QA_BAND = 'cs';
// The threshold for masking; values between 0.50 and 0.65 generally work well.
// Higher values will remove thin clouds, haze & cirrus shadows.
var CLEAR_THRESHOLD = 0.60;

// access image collection, filter for location and range of dates
// link S2 collection with csPlus and update mask using QA_band
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(geometry)
      .filterDate('2022-06-01', '2024-09-30')
      .select(['B8', 'B4'])
      .linkCollection(csPlus, [QA_BAND])
      .map(function(img) {
        return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD));
    })

// print to console
print(S2);

// center map; 11 is the zoom level; 12 would zoom in further
Map.centerObject(geometry, 16);

// Add geometry to the map
Map.addLayer(geometry, {color: 'red'}, 'Vinha ISA');

// Function adds an NDVI band to an image
var add_ndvi_to_s2 = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands([ndvi]);
};

// add NDVI band to each image
var S2 = S2.map(add_ndvi_to_s2)

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
        
print(chart);
```

</details>

### 8. Create NDVI charts for a set of locations
<details>
  
  <summary> Multi-point NDVI charts with Cloud Score+ screening </summary>

* [GEE link](https://code.earthengine.google.com/e56c71cc7333ea27f1e803155d13aded?noload=true)

The Google Code Editor allows us to digitize geometries (points, lines or polygons) and add those geometries to our scripts. This can be used to extract a list of point coordinates. Then, the coordinates can be copied into a list and used to define a feature collection.

```
// ROI: in this case it is a feature collection of points
// Firstly, we obtain a list os points possibly by digitizing with the code editor interactive tools
var multipoints =[[-9.18511947486878, 38.70673673565854],
         [-9.185698832015996, 38.707121861392295],
         [-9.184983887235997, 38.70708122565936]];

// the following code read each point from the list, and adds it as a `ee.Geometry.Point` to a feature collection. 
// As a result, the variable  `geometry` below is a feature collection of single part point geometries.
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
      .filterDate('2022-06-01', '2025-08-30')
      .select(['B8', 'B4'])
      .linkCollection(csPlus, [QA_BAND])
      .map(function(img) {
        return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD));
    })


// center map; 16 is the zoom level; 17 would zoom in further
Map.centerObject(geometry, 16);

// print to console
print(S2);

// Add geometry to the map; each feature with a corresponding color
// define function for that task
function addColoredFeatures(geometry, colors) {
  var featuresList = geometry.toList(geometry.size());
  for (var i = 0; i < colors.length; i++) {
    var feature = ee.Feature(featuresList.get(i));
    Map.addLayer(feature, {color: colors[i]}, 'Feature ' + (i+1));
  }
}
// apply function with the chosen list of colors (that match the chart below)
addColoredFeatures(geometry, ['blue','red','green'])

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
          colors: ['blue','red','green'], 
        });
        
print(chart);

```
</details>

### 9. Create NDVI charts for a set of parcels, with one chart per land use
<details>
  
  <summary> Spatial reduction </summary>

The first step that needs to be performed is to upload the shapefile that defines the parcels into GEE. This is done in tab **Assets**. We want to upload the shapefile with is zipped into `Vineyard_2castas.zip` available at (Vineyard_2castas.zip)

```
// the ROI is now defined by Feature Collection 'castas'

// Cloud Score+ image collection. Note Cloud Score+ is produced from Sentinel-2
// Level 1C data and can be applied to either L1C or L2A collections.
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');
// Use 'cs' or 'cs_cdf', depending on your use case; see docs for guidance.
var QA_BAND = 'cs';
// The threshold for masking; values between 0.50 and 0.65 generally work well.
// Higher values will remove thin clouds, haze & cirrus shadows.
var CLEAR_THRESHOLD = 0.60;

// access image collection, filter for location and range of dates
// link S2 collection with csPlus and update mask using QA_band
// compute NDVI for every image from B4 and B8
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterDate('2022-01-01', '2025-08-30')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
      .filterBounds(castas)
      .select(['B8', 'B4','B3','B2'])
      .linkCollection(csPlus, [QA_BAND])
      .map(function(img) {
        return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD));
      })
      .map(function(image) {
                  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
                  return image.addBands(ndvi);
      });

// center map; 16 is the zoom level; 17 would zoom in further
Map.centerObject(castas, 16);

// add true color composite layer to the map
Map.addLayer(S2.first(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500}, 'Sentinel-2 level 2A RGB==432');

// print to console
print(S2);

Map.addLayer(castas, {color: 'white'})

// apply negative buffer to all features (optional)
var castas = castas.map(function(feature) {
  return feature.buffer(-5);
});

// Compose chart per 'Casta'
var chart = ui.Chart.image.seriesByRegion({
  imageCollection: S2.select('NDVI'),
  band: 'NDVI',
  regions: castas,
  reducer: ee.Reducer.mean(),
  scale: 10,
  seriesProperty: 'Casta',
  xProperty: 'system:time_start'
}).setOptions({
  title: 'Mean NDVI by Casta',
  hAxis: {title: 'Date'},
  vAxis: {title: 'NDVI'},
  lineWidth: 3,
  colors: ['red', 'blue'],
  interpolateNulls: true
});

print(chart);
```

</details>

### 10. Export an image to Google Drive as a geotiff file
<details>
  
  <summary> Export.image.toDrive </summary>

A common use of the Google Earth Engine is to access and preprocess image collections. Then the preprocessed data can be saved in Google Drive and used for further processing.

In this exercise, we download a time composite of a Sentinel image, after masking cloudy pixels, and performing a temporal reduction with the **median** for a region defined by a 1km buffer around a given location location.

[GEE link](https://code.earthengine.google.com/8c939309e948b0d9ea86dffea4c34c41?noload=true)
  
```
// ROI: in this case it is a single point determined by its longitude and latitude
var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// Cloud Score+ image collection. Note Cloud Score+ is produced from Sentinel-2
// Level 1C data and can be applied to either L1C or L2A collections.
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');

// Use 'cs' or 'cs_cdf', depending on your use case; see docs for guidance.
var QA_BAND = 'cs';
// The threshold for masking; values between 0.50 and 0.65 generally work well.
// Higher values will remove thin clouds, haze & cirrus shadows.
var CLEAR_THRESHOLD = 0.60;

// access image collection, filter for location and range of dates
// link S2 collection with csPlus and update mask using QA_band
// at the end, create a single image  by reducing with median
var S2clear = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(geometry)
      .filterDate('2024-07-30', '2024-09-30')
      .select(['B8', 'B4','B3'])
      .linkCollection(csPlus, [QA_BAND])
      .map(function(img) {
        return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD))})
      .median();

// export to drive
// Set the export "scale" and "crs" parameters
// The defined region means that the exported image is going to be 2000 m wide
Export.image.toDrive({
  image: S2clear,
  description: 'S2_screened_for_clouds', // file name
  folder: 'agricultura_digital', 
  region: geometry.buffer(1000), 
  scale: 10,
  crs: 'EPSG:3763' // Portuguese official CRS (meters)
});
```

Suggestion: Try exporting geometry to *shapefile* following instructions on https://developers.google.com/earth-engine/guides/exporting_tables.


</details>
