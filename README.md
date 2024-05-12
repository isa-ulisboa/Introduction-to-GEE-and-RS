**Academia Terra**

Tutorial: Introduction to the Google Earth Engine for monitoring the environment (May 14, 2024)

Instructor: [Manuel Campagnolo ISA/ULisboa](https://www.cienciavitae.pt//en/7F18-3B3C-06BB)

---

Before the tutorial, please sign up for [Google Earth Engine](https://code.earthengine.google.com/).

Data set to upload to GEE: Município de Alcoutim from CAOP 2023 in shapefile format [Alcoutim.zip](alcoutim.zip)

---

The tutorial will be *hands-on* using the GEE code editor. The [guideline](tutorial.pdf) for the tutorial is a selection of pages from [https://developers.google.com/earth-engine](https://developers.google.com/earth-engine) where one can find code descriptions and examples that illustrate topics like finding and filtering data (spatially, temporally and spectrally), visualizing images, creating charts, creating new images and bands, and exporting data.


---

### Import asset
<details>
  <summary>Import asset: shapefile for município de Alcoutim</summary>

1. Go to assets on the GEE code editor;
2. Click `New` and choose `Shape files`;
3. Select the files for the shapefile (at least `.dbf`, `.prj`, `.shp` and `.shx`)
4. Click `Upload`
5. Go to `Tasks` and confirm that the table is *ingested*.

The asset should then be available in  `LEGACY ASSETS`. It can be imported to the script with `Import`. You can change the *table* name, to define your own variable of type `FeatureCollection`. The line of code that will be something like
```
var alcoutim = ee.FeatureCollection("users/mlc-edu-ulisboa-pt/alcoutim")
```
  
</details>

### Access image collection (Sentinel-2)
<details>
  <summary>Access, filter and plot Sentinel-2 image collection</summary>

The following script uses the `alcoutim` variable, so that needs to be defined first. 

Then it accesses Sentinel-2, level 2A images and it folters by dates and by bounds. Alll Sentinel-2 tiles that *intersect* the region are selected. `CLOUDY_PIXEL_PERCENTAGE` is an `Image` property and can be used to sort or filter the `ImageCollection` (this operation should come at the end).

```
// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(alcoutim)
                .filterDate('2023-06-01', '2023-08-31')
                .sort('CLOUDY_PIXEL_PERCENTAGE',false);

// center map; 11 is the zoom level; 12 would zoom in further
Map.centerObject(S2, 11);

// add layers
Map.addLayer(S2, {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500}, 'Sentinel-2 level 2A RGB=432');

// print to console
print(S2);

// Add Alcotim to the map
Map.addLayer(alcoutim, {color: 'gray'}, 'Alcoutim');
```

If you want to plot a false color composite, you can use instead
```
Map.addLayer(S2, {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}, 'Sentinel-2 level 2A RGB=843');
```

</details>


### Create single image
<details>
  <summary> Select images with low cloud cover and combine them into a single image </summary>

The idea is to filter the Sentinel-2 image collection using the property `CLOUDY_PIXEL_PERCENTAGE`. Only images with less than 1% cloud cover are selected. Then selected images are combined with a *temporal reducer* which can be for instance the `mean` or the `median`.

```
// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(alcoutim)
                .filterDate('2023-06-01', '2023-08-31')

// filter using property
var filtered = S2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1));

// reduce image collection to image
var S2clear=filtered.median()

// Clip using feature collection
var S2alcoutim=S2clear.clip(alcoutim)

// Center map
Map.centerObject(S2, 11);

// add layer
Map.addLayer(S2alcoutim, {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}, 'Sentinel-2 level 2A');

// print to console
print(S2alcoutim);

// Add Alcotim to the map
Map.addLayer(alcoutim, {color: 'gray'}, 'Alcoutim');
```

![Alt text](https://developers.google.com/static/earth-engine/images/Reduce_ImageCollection.png "Image collection reduction")


Suggestions: 
1. Try using other properties for filtering;
2. Use the  `Inspector` tool to check the pixel values inside and outside the clipped image.

</details>

### Image vizualization
<details>
  <summary> Additional parameters for image visualization </summary>

As described in  [https://developers.google.com/earth-engine/guides/image_visualization](https://developers.google.com/earth-engine/guides/image_visualization) there are many parameters for visualizaton. Many of them accept a single value to be applied to all bands, or a list of three values to be applied to the RGB bands. Typically, one creates a *dictionary* of parameters and then used it with `Map.addLayer()` or with `image.visualize()`.

```
// Define the visualization parameters.
var vizParams = {
  bands: ['B8', 'B4', 'B3'],
  min: 0,
  max: [5000,4000,4000],
  opacity: 0.7
};

// add layer
Map.addLayer(S2alcoutim, vizParams, 'Sentinel-2 level 2A');
```

If one wants to visualize only the pixels that satisfy some particular condition, one can use method `updateMask` as in the following example, where we look at pixels that have a very low reflectance in the near infrared (nir) which corresponds to band 8 in Sentinel-2. The idea is to create a new image `nir` with only that band using method `select('B8')` and then visualize only pixels in `nir` that satisfy the condition ${\rm nir} < 800$, i.e. reflectance below 0.08%.

```
// Add Alcotim to the map
Map.addLayer(alcoutim, {color: 'gray', opacity: 0.3}, 'Alcoutim');

// create new image with just one band
var nir = S2alcoutim.select('B8');

// Update mask so only pixels with value below 800 are not masked
var nirMasked = nir.updateMask(nir.lt(800));

// This palette indicates the colors associated to the minimum and maximum values
var vizNir={min:0, max: 800, palette: ['00FFFF', '0000FF']};

// Visualize nirMasked
Map.addLayer(nirMasked, vizNir, 'NIR masked');
```
</details>

### Create a new band and add it to the image
<details>
  <summary> Create an index with normalized difference </summary>

In remote sensing, it is very common to use an operation called *normalized difference* between two bands to compute an index. The most well-known index is the NDVI which measures the *greenness* of the land cover. Here, we are going to create an index that, hopefully, will allow us to discriminate solar panels from other land cover types. Towards that end, we consider bands `B2` and `B3` from which we compute the new band `ndgb`. We could created it with an expression  or just use the *normalized difference* operation available in GEE (see [https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference](https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference)).

```
var ndgb = S2alcoutim.normalizedDifference(['B3', 'B2']).rename('NDGB');

S2alcoutim = S2alcoutim.addBands([ndgb]).select(['B2','B3','B4','B8','NDGB'])

print(S2alcoutim)

var vizParams={bands: ['NDGB'],min: 0, max: 1}

Map.addLayer(S2alcoutim, vizParams, 'Sentinel-2 level 2A');

// é preciso também limitar a banda B2 a ser inferior a ~1100 pois estradas tendem a ter uma reflectância maior em B2
// é preciso relazar 0.08 para ~0.1 pois os paineis solares a norte estão mais espaçados


// Update mask so only pixels with value below 800 are not masked
var ndgbMasked = ndgb.updateMask(ndgb.lte(0.08));

// This palette indicates the colors associated to the minimum and maximum values
var vizNDGB={min:0, max: 0.08, palette: ['00FFFF', '0000FF']};

Map.addLayer(ndgbMasked, vizNDGB, 'NDGB masked');



```

</details>

# Create temporal composite
<details>
  <summary> ... </summary>

</details>

# Create temporal composite
<details>
  <summary> ... </summary>

</details>

# Create temporal composite
<details>
  <summary> ... </summary>

</details>

# Create temporal composite
<details>
  <summary> ... </summary>

</details>

# Create temporal composite
<details>
  <summary> ... </summary>

</details>

# Create temporal composite
<details>
  <summary> ... </summary>

</details>


