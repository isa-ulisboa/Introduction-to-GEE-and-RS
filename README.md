**UC Agricultura Digital**

Tutorial: Brief Introduction to the Google Earth Engine (October 2-9, 2024)

Main goal: learn how to use the GEE to create 10 meter resolution Sentinel-2 NDVI charts for chosen locations

Instructor: [Manuel Campagnolo ISA/ULisboa](https://www.cienciavitae.pt//en/7F18-3B3C-06BB)

---

Before the tutorial, please sign up for [Google Earth Engine](https://code.earthengine.google.com/).


---

The tutorial will be *hands-on* using the GEE code editor. The [guideline](tutorial.pdf) for the tutorial is a selection of pages from [https://developers.google.com/earth-engine](https://developers.google.com/earth-engine) where one can find code descriptions and examples that illustrate topics like finding and filtering data (spatially, temporally and spectrally), visualizing images, creating charts, creating new images and bands, screening images for clouds, and exporting data.

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

<details>
  
  <summary>Fully functional scripts </summary>

- Basic access to Sentinel-2 data: [basic_S2_composite.js](basic_S2_composite.js)
- Create basic Sentinel-2 (median) temporal composite: [basic_temporal_composite.js](basic_temporal_composite.js)
- Access Sentinel-2 data and create a basic NDVI chart: [basic_S2_composite.js](basic_S2_composite.js) 
- Access Sentinel-2 data and create a basic NDVI chart with built-in cloud screening: [QA_screening_NDVI_chart.js](QA_screening_NDVI_chart.js)
- Access Sentinel-2 data and create a basic NDVI chart with cs-Plus cloud screening: [csPlus_screening_NDVI_chart.js](csPlus_screening_NDVI_chart.js)
- Access Sentinel-2 data and create a multi-point NDVI chart with cs-Plus cloud screening: [points_cs_charts.js](points_cs_charts.js)

</details>

---
## Tutorial topics



### Access image collection (Sentinel-2)
<details>
  
  <summary>Access, filter and plot Sentinel-2 image collection</summary>

The following script accesses Sentinel-2, level 2A images and it filters by dates and by bounds: here, the region of interest `geometry` is a single point defined by its coordinates. All Sentinel-2 tiles that *intersect* the geometry are selected. `CLOUDY_PIXEL_PERCENTAGE` is an `Image` property and can be used to sort or filter the `ImageCollection`. Note that sorting the collection by the property `CLOUDY_PIXEL_PERCENTAGE` should be applied last since it is computationally more demanding.

```
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
```

If you want to plot a false color composite, you can use instead
```
Map.addLayer(S2.first(), {bands: ['B8', 'B4', 'B3'], min: [0,0,0], max: [4500, 3500, 3500]}, 'Sentinel-2 level 2A RGB=843');
```

</details>


### Create simple (median) temporal composite; temporal reducer
<details>
  
  <summary> Select images with low cloud cover and combine them into a single image </summary>

The idea is to filter the Sentinel-2 image collection using the property `CLOUDY_PIXEL_PERCENTAGE`. Only images with less than 1% cloud cover are selected. Then selected images are combined with a *temporal reducer* which can be for instance the `mean` or the `median`.

```
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


Suggestions: 
1. Try using other properties for filtering;
2. Use the  `Inspector` tool to check the pixel values inside and outside the clipped image.

</details>

### Create a new band (e.g. NDVI) and add it to the image
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

### Create a basic temporal chart for NDVI 

<details>
  
  <summary> Function, map and temporal chart </summary>

The idea is to add the NDVI band to each image of a Sentinel-2 collection, and plot the NDVI values at a certain location along time with `ui.Chart.image.seriesByRegion`: see https://developers.google.com/earth-engine/guides/charts_overview and https://developers.google.com/earth-engine/guides/charts_image_collection for an overview of charts in GEE.

```
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

### Cloud screening at the pixel level; Sentinel-2 built-in screening with QA band

<details>
  
  <summary> Cloud screening with Sentinel-2 QA band </summary>

```
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
```
</details>

### Cloud screening at the pixel level; Cloud Score+ image collection for Sentinel-2

<details>
  
  <summary> Cloud screening with Cloud Score+ </summary>

Cloud Score+ is a Google product that is derived from Sentinel-2 [https://ieeexplore.ieee.org/document/10208818] and that can be combined with Sentinel-2 imagery to mask pixels with cloud score above some given threshold. The code below uses the `linkCollection` method to combine the Sentinel-2 collection with the Cloud Score+ collection. By default, the match is based on the `system:index` image property.

```
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
// sort by percentage of clouds (most cloudier first)
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

### Create NDVI charts for a set of locations
<details>
  
  <summary> Multi-point NDVI charts with Cloud Score+ screening </summary>

The 
```
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

```
</details>

### Export an image to Google Drive as a geotiff file
<details>
  
  <summary> Export.image.toDrive </summary>

```
// export to drive
// Set the export "scale" and "crs" parameters.
Export.image.toDrive({
  image: S2clear,
  description: 'S2_alcoutim',
  folder: 'curso_terra',
  region: alcoutim,
  scale: 10,
  crs: 'EPSG:3763'
});
```

Suggestion: Try exporting `solar_farms` to *shapefile* following instructions on https://developers.google.com/earth-engine/guides/exporting_tables.


</details>

