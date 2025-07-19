Fonda Summer School, Ponta Delgada, July 2025 

Tutorial on remote sensing and Google Earth Engine (July 21, 2025)

Instructor: [Manuel Campagnolo ISA/ULisboa](https://www.cienciavitae.pt//en/7F18-3B3C-06BB)

---

Considering [assessment quiz results](Student_Assessment_Quiz.pdf) and time limitations, we'll focus on the following topics:
- accessing and processing data
- using Python API and geemap
- image preprocessing 
- combine satellite raster data with other geospatial data
- temporal profiles 

Before the tutorial, please sign up for Google Earth Engine and create Google Cloud project at [Earth Engine](https://console.cloud.google.com/earth-engine/welcome ).

---

Topics:

<details>
  
  <summary>Geospatial processing services</summary>
  
The GEE is one of several available **geospatial processing services** offering a public data catalog, compute infrastructure and geospatial APIs:
1. Google Earth Engine (Google Cloud)
2. Microsoft Planetary Computer (Azure)
3. Amazon Web Services (AWS) GeoSpatial Services
4. [Copernicus Data Space Ecosystem](https://jupyterhub.dataspace.copernicus.eu), mostly for Sentinel imagery
5. ...
</details>

<details>
  
  <summary>Earth Engine Code Editor and documentation</summary>

 The Code Editor provides the Earth Engine JavaScript client library plus:
 - Display of geographic data on the *Map*.
 - The `ui` package for creating user interfaces for Earth Engine apps
 - Other functions specific to the Code Editor (e.g. `print()`).

Scripts are written in *javascript* and uploaded data can either be stored in the user's Earth Engine account (up to 250 Mb) or in Google drive. The code editor is available at https://code.earthengine.google.com  

![Alt text](https://developers.google.com/static/earth-engine/images/Code_editor_diagram.png "Code editor")

**To do:** Access GEE code editor, check what is your project ID, and see how to access datasets at https://developers.google.com/earth-engine/datasets (or https://gee-community-catalog.org/)

</details>


<details>
  
  <summary>Example: access, filter and create layer from Sentinel-2 image collection</summary>
  
[Open script on GGE code editor](https://code.earthengine.google.com/307ecc36c256f4490beb4483e6797f40?noload=true)

The script accesses Sentinel-2, level 2A images and it filters by dates and by bounds: here, the region of interest `geometry` is a single point defined by its coordinates. All Sentinel-2 tiles that *intersect* the geometry are selected. `CLOUDY_PIXEL_PERCENTAGE` is an `Image` property and can be used to sort or filter the `ImageCollection`. Note that sorting the collection by the property `CLOUDY_PIXEL_PERCENTAGE` should be applied last since it is computationally more demanding. 

```
// ROI: in this case it is a single point determined by its longitude and latitude
var geometry = ee.Geometry.Point([-25.7, 37.8]);

// access image collection, filter for location and range of dates
// sort by percentage of clouds (most cloudier first)
var S2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(geometry)
                .filterDate('2024-06-01', '2024-09-30')
                .select(['B8', 'B4', 'B3','B2'])
                .sort('CLOUDY_PIXEL_PERCENTAGE',true);

// center map; 16 is the zoom level; 17 would zoom in further
Map.centerObject(geometry, 12);

// add true color composite layer to the map
Map.addLayer(S2.first(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500}, 'Sentinel-2 level 2A RGB=432');

// print to console
print(S2);
```

If you want to plot a false color composite, you can use instead
```
Map.addLayer(S2.first(), {bands: ['B8', 'B4', 'B3'], min: [0,0,0], max: [4500, 3500, 3500]}, 'Sentinel-2 level 2A RGB=843');
```
</details>


<details>
  
  <summary>(Optional) Upload a shapefile to Earth Engine and use it as the ROI</summary>

1. Go to assets on the GEE code editor;
2. Click `New` and choose `Shape files`;
3. Select the files for the shapefile (either `.zip`or at least `.dbf`, `.prj`, `.shp` and `.shx`)
4. Click `Upload`
5. Go to `Tasks` and confirm that the table is *ingested*.

The asset should then be available in  `ASSETS`. It can be imported to the script with `Import`. You can change the *table* name, to define your own variable of type `FeatureCollection`. The line of code in your script will be something like:
```
// Import the vector asset as a FeatureCollection
var saoMiguelCounties = ee.FeatureCollection('projects/ee-my-mlc-math-isa-utl/assets/saomiguel_counties_latlong_');
```
You can also:
```
// Center the map on São Miguel 
Map.centerObject(saoMiguelCounties, 12);

// Add the asset to the map
Map.addLayer(saoMiguelCounties, {}, 'São Miguel Counties');
```

If you do not have a shapefile that defines your ROI, you can build one: just execute this [script](create_shapefile_ponta_Delgada.ipynb) on Google Colab.

</details>


<details>
  
  <summary>Earth Engine Python API and geemap</summary>

The open source Python Client library translate Earth Engine code into request objects sent to Earth Engine servers: 
  - `ee` package for formulating requests to Earth Engine. 
  - Export of data to Google Drive, Cloud Storage or Earth Engine assets.

**To do**: Create a jupyter notebook . Suggestion: you can create an execute your notebook in **Google Colab**.
</details>



The tutorial will be *hands-on* using either 
1. The GEE code editor (javascript). The [guideline](tutorial_v1.pdf) for the tutorial is a selection of pages from [https://developers.google.com/earth-engine](https://developers.google.com/earth-engine) where one can find code descriptions and examples that illustrate topics like finding and filtering data (spatially, temporally and spectrally), visualizing images, creating charts, creating new images and bands, and exporting data.
2.  The Python API and [geemap](https://geemap.org/). Recommended tutorial [Earth Engine and Geemap Workshop at CVPR Conference 2025](https://www.youtube.com/watch?v=Us6MaBsL4cg)

---

Earth Engine Data Catalog:
1. [https://developers.google.com/earth-engine/datasets](https://developers.google.com/earth-engine/datasets)
2. [GEE community catalog](https://gee-community-catalog.org/)

Interesting links for geospatial:
- [OpenGeos](https://github.com/opengeos): geemap, GeoAI, ...

Advanced processing examples
- [GeoAI Tutorial 19: Train a Segmentation Model for Objection Detection from Remote Sensing Imagery](https://www.youtube.com/watch?v=l8DY166eAWI)
