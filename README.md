**UC Agricultura Digital**

Tutorial: Brief Introduction to the Google Earth Engine ( ?? set 2024)

Instructor: [Manuel Campagnolo ISA/ULisboa](https://www.cienciavitae.pt//en/7F18-3B3C-06BB)

---

Before the tutorial, please sign up for [Google Earth Engine](https://code.earthengine.google.com/).


---

The tutorial will be *hands-on* using the GEE code editor. The [guideline](tutorial.pdf) for the tutorial is a selection of pages from [https://developers.google.com/earth-engine](https://developers.google.com/earth-engine) where one can find code descriptions and examples that illustrate topics like finding and filtering data (spatially, temporally and spectrally), visualizing images, creating charts, creating new images and bands, and exporting data.

<details>
  <summary>Geospatial processing services</summary>
  
The GEE is one of several available **geospatial processing services** ofering a public data catalog, compute infrastructure and geospatial APIs:
1. Google Earth Engine (Google Cloud)
2. Microsoft Planetary Computer (Azure)
3. Amazon Web Services (AWS) GeoSpatial Services
4. Copernicus Data Space Ecosystem, mostly for Sentinel imagery
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

- Use Sentinel 2 time series of NDVI and locations of solar farms to create a temporal chart and estimate when solar farms were build: [create_chart_ndvi.js](create_chart_ndvi.js)
- Export Sentinel-2 image to Google drive: [export_S2_to_drive.js](export_S2_to_drive.js)

</details>

---
## Tutorial topics



### Access image collection (Sentinel-2)
<details>
  <summary>Access, filter and plot Sentinel-2 image collection</summary>

The following script accesses Sentinel-2, level 2A images and it filters by dates and by bounds: here, the region of interest ROI is a single point defined by its coordinates. All Sentinel-2 tiles that *intersect* the geometry are selected. `CLOUDY_PIXEL_PERCENTAGE` is an `Image` property and can be used to sort or filter the `ImageCollection` (this operation should come at the end).

```
// create point geometry from longitude and latitude
var geometry = ee.Geometry.Point([-9.18498, 38.70708]);

// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(geometry)
                .filterDate('2024-06-01', '2024-09-18')
                .sort('CLOUDY_PIXEL_PERCENTAGE',true)
                .first();

// center map; 11 is the zoom level; 12 would zoom in further
Map.centerObject(geometry, 16);

// add layers
Map.addLayer(S2, {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500}, 'Sentinel-2 level 2A RGB=432');

// print to console
print(S2);

// Add geometry to the map
Map.addLayer(geometry, {color: 'red'}, 'Vinha ISA');
```

If you want to plot a false color composite, you can use instead
```
Map.addLayer(S2, {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}, 'Sentinel-2 level 2A RGB=843');
```

</details>


### Create single image and select bands
<details>
  <summary> Select images with low cloud cover and combine them into a single image </summary>

The idea is to filter the Sentinel-2 image collection using the property `CLOUDY_PIXEL_PERCENTAGE`. Only images with less than 1% cloud cover are selected. Then selected images are combined with a *temporal reducer* which can be for instance the `mean` or the `median`.

```
// First, import 'alcoutim'

// access image collection, select 10 m bands, filter for location and range of dates
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

// simple set of parameters for visualization
var vizParams={bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}

// add layer
Map.addLayer(S2alcoutim, vizParams, 'Sentinel-2 level 2A');

```

![Alt text](https://developers.google.com/static/earth-engine/images/Reduce_ImageCollection.png "Image collection reduction")


Suggestions: 
1. Try using other properties for filtering;
2. Use the  `Inspector` tool to check the pixel values inside and outside the clipped image.

</details>

### Image vizualization and masking
<details>
  <summary> Additional parameters for image visualization; updateMask; palette </summary>

As described in  [https://developers.google.com/earth-engine/guides/image_visualization](https://developers.google.com/earth-engine/guides/image_visualization) there are many parameters for visualizaton. Some of them accept a single value to be applied to all bands, or a list of three values to be applied to the RGB bands. Typically, one creates a *dictionary* of parameters and then used it with `Map.addLayer()` or with `image.visualize()`.

```
// Define the visualization parameters.
var vizParams = {
  bands: ['B8', 'B4', 'B3'],
  min: 0,
  max: [5000,4000,4000],
  opacity: 0.7
};

// add layer
Map.addLayer(S2alcoutim, vizParams, 'S2 Alcoutim');
```

If one wants to **visualize only the pixels that satisfy some particular condition**, one can use method `updateMask` as in the following example, where we look at pixels that have a very low reflectance in the near infrared (nir) which corresponds to band 8 in Sentinel-2. The idea is to create a new image `nir` with only that band using method `select('B8')` and then visualize only pixels in `nir` that satisfy the condition ${\rm nir} < 800$, i.e. reflectance below 8%.

```
// Extra lines of script to create a map of low NIR values (water bodies)
// create new image with just one band
var nir = S2alcoutim.select('B8');

// Update mask so only pixels with value below 800 are not masked
var nirLow = nir.updateMask(nir.lt(800));

// This palette indicates the colors associated to the minimum and maximum values
var vizNir={min:0, max: 800, palette: ['00FFFF', '0000FF']}; // cyan to blue

// Visualize nirMasked so pixels with NIR close to zero are shown in cyan and pixels with NIR close to 8% are showed in blue
Map.addLayer(nirLow, vizNir, 'NIR below 8% (water bodies)');
```
</details>

### Create a new band and add it to the image; create mask from bands
<details>
  <summary> Create an index with normalized difference; add index to image bands; create and apply mask for solar panels</summary>

In remote sensing, it is very common to use an operation called *normalized difference* between two bands to compute an index. The most well-known index is the NDVI which measures the *greenness* of the land cover. Here, we also create an index that will help discriminate solar panels from other land cover types. Towards that end, we consider bands `B2` and `B3` from which we compute the new band `ndgb`. 

We could created those indices with an expression or we can simply use the *normalized difference* operation available in GEE (see [https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference](https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference)).

```
// create new images for NDGB and NDVI: notice that values are between -1 and 1.
var ndgb = S2alcoutim.normalizedDifference(['B3', 'B2']).rename('NDGB');
var ndvi = S2alcoutim.normalizedDifference(['B8', 'B4']).rename('NDVI');

// add band to image
S2alcoutim = S2alcoutim.addBands([ndgb,ndvi])

// create mask from bands
var maskSP=S2alcoutim.select('B8').gt(1000)
          .and(S2alcoutim.select('B3').lt(1250))
          .and(S2alcoutim.select('B8').lt(1800))
          .and(S2alcoutim.select('NDGB').lt(0.13))
          .and(S2alcoutim.select('NDVI').lt(0.15))

// define visualization parameters so the color depends on the value of B3, ranging from red (B3=0) to brown (B3=1250)
var vizParams={bands: ['B3'], min:500, max: 1250, palette: ['FF0000', '964B00']} // red and brown
// Instead of adding the whole S2alcoutim image, this masks the pixels in maskSP first
Map.addLayer(S2alcoutim.updateMask(maskSP), vizParams , 'Solar Panels');

```

</details>

### Create Feature Collection with one point feature per solar farm
<details>
  <summary> Use the interactive `Geometry Imports` </summary>

The goal is to create a feature collection of points. Each point represents the location of a solar farm. Points have a geometry and may have properties.

```
var solar_farms = ee.FeatureCollection([
        ee.Feature(ee.Geometry.Point([-7.581315725226887, 37.44977560189899]),{name: 'vicentes', color: 'blue'}),
        ee.Feature(ee.Geometry.Point([-7.613073079963215, 37.449980021136575]),{name: 'pereiro', color: 'yellow'}),
        ee.Feature(ee.Geometry.Point([-7.693075049521815, 37.383792590263845]),{name: 'zambujal', color: 'green'}),
        ee.Feature(ee.Geometry.Point([-7.673361113945973, 37.45563071528393]),{name: 'viçoso', color: 'red'}),
        ee.Feature(ee.Geometry.Point([-7.715182889197569, 37.41416981246133]),{name: 'santa_justa', color: 'brown'}),
        ee.Feature(ee.Geometry.Point([-7.537620761881514, 37.45729422065703]),{name: 'corte', color: 'purple'}),
        ]);
```
</details>

### Create a temporal chart for NDVI at each location
<details>
  <summary> Use ui.Chart.image.seriesByRegion, function, map </summary>

```
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .select(['B4','B8'])
                .filterBounds(alcoutim)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1));

// This function adds an NDVI band
var add_ndvi_to_s2 = function(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands([ndvi]);
};

// apply function to all images in the collection
var S2 = S2.map(add_ndvi_to_s2)

// create chart
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

// print chart
print(chart);
```

</details>


### Export an to Google Drive as a geotiff file
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

### Advanced topic: display point locations from feature collection as layers with name and color
<details>
  <summary> Explore Feature Collection, lists, and getInfo() </summary>

Let's create a layer per location from the Feature Collection `solar_farms`, and use the properties `name` and `color` for each layer, to make it easier to associate each chart to the corressponding location.

```
// Map over the feature collection to extract geometry, name and color properties as lists
var featureList = solar_farms.toList(solar_farms.size());
var geometries = featureList.map(function(feature) {
  return ee.Feature(feature).geometry();
});
var names = featureList.map(function(feature) {
  return ee.Feature(feature).get('name');
});
var colors = featureList.map(function(feature) {
  return ee.Feature(feature).get('color');
});
// Iterate over geometries and names
for (var i = 0; i < geometries.length().getInfo(); i++) {
  // Get the geometry and name for the current iteration
  var geometry = ee.Geometry(geometries.get(i));
  var nome = names.get(i).getInfo();
  var color = colors.get(i).getInfo();
  // Create a point feature using the geometry
  var point = ee.Feature(geometry, {'name' : nome});
  // Add the point layer to the map with the name as the layer label
  Map.addLayer(point, {color: color}, nome);
}
```
</details>

