Fonda Summer School, Ponta Delgada, July 2025: Improving Nitrogen Budgets via Satellite Data

Tutorial on remote sensing and Google Earth Engine (July 21, 2025)

Instructor: [Manuel Campagnolo ISA/ULisboa](https://www.cienciavitae.pt//en/7F18-3B3C-06BB)

---

Considering [assessment quiz results](Student_Assessment_Quiz.pdf) and time limitations, we'll focus on the following general topics:
- accessing and processing data
- using Python API and geemap
- combine satellite raster data with other geospatial data
- image preprocessing 
- temporal profiles 

Required: sign up for Google Earth Engine and create Google Cloud project at [Earth Engine](https://console.cloud.google.com/earth-engine/welcome).

---
## Access to the Earth Engine

1. The [GEE code editor](https://code.earthengine.google.com/) (javascript). The main reference is [https://developers.google.com/earth-engine](https://developers.google.com/earth-engine). I selected some basic topics and combined them in this [guideline (pdf)](tutorial_v1.pdf). Exercises and code on topics like finding and filtering data (spatially, temporally and spectrally), visualizing images, creating charts, creating new images and bands, and exporting data are available at [Smooth introduction to the GEE code editor with examples](cloud_screening_and_temporal_charts_with_code_editor.md).
2.  The [Python API](https://developers.google.com/earth-engine/tutorials/community/intro-to-python-api) and [geemap](https://geemap.org/). Most recent available geemap tutorial: [Earth Engine and Geemap Workshop at CVPR Conference 2025](https://www.youtube.com/watch?v=Us6MaBsL4cg)

---

## Tutorial topics

<details>
  
  <summary>Geospatial processing services</summary>
  
The GEE is one of several available **geospatial processing services** offering a public data catalog, compute infrastructure and geospatial APIs:
1. Google Earth Engine (Google Cloud)
2. Microsoft Planetary Computer (Azure)
3. Amazon Web Services (AWS) GeoSpatial Services
4. [Copernicus Data Space Ecosystem](https://jupyterhub.dataspace.copernicus.eu), mostly for Sentinel imagery
5. ...
</details>

---

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

---

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

For further exercises with Sentinel-2, see [Smooth introduction to the GEE code editor with examples](cloud_screening_and_temporal_charts_with_code_editor.md).

</details>

---

<details>
  
  <summary>(Optional) Upload a shapefile into Earth Engine</summary>

Often, you need to define your region of interest (ROI). This can be a single point which is easy to define on the code editor or it can be a complicated geometry that is available as a shapefile.

Let's suppose you want to upload you own shapefile so it become available for processing in GEE. Use your own shapefile or, if you prefer, download this shapefile that delineates the [Ponta Delgada county](saomiguel_counties_latlong_.zip). Note: This shapefile was created in Google Colab with this [script](create_shapefile_ponta_Delgada.ipynb), so it can be easily adapted.

1. Go to assets on the GEE code editor;
2. Click `New` and choose `Shape files`;
3. Select the files for the shapefile (either `.zip` or at least `.dbf`, `.prj`, `.shp` and `.shx`)
4. Click `Upload`
5. Go to `Tasks` and confirm that the table is *ingested*.

The asset should then become available in your Earth Engine `ASSETS`. It can be imported to the script and adapted into smth like:
```
// Import the vector asset as a FeatureCollection
var saoMiguelCounties = ee.FeatureCollection('projects/ee-my-mlc-math-isa-utl/assets/saomiguel_counties_latlong_');
```
(Optional) you can also:
```
// Center the map on São Miguel 
Map.centerObject(saoMiguelCounties, 12);
// Add the asset to the map
Map.addLayer(saoMiguelCounties, {}, 'São Miguel Counties');
```

</details>

---

<details>
  
  <summary>Earth Engine Python API and geemap</summary>

The open source Python Client library translate Earth Engine code into request objects sent to Earth Engine servers: 
  - `ee` package for formulating requests to Earth Engine. 
  - Export of data to Google Drive, Cloud Storage or Earth Engine assets.

To be able to use the Python API you need first to authenticate and initialize your project:
```
# Import the API
import ee
# Trigger the authentication flow.
ee.Authenticate()
# Initialize the library.
ee.Initialize(project='my-project') # replace 'my-project' by your own project ID
```

**To do**: run the notebook [setup the Earth Engine Python API in Colab](https://github.com/google/earthengine-community/blob/master/guides/linked/ee-api-colab-setup.ipynb)

</details>

---

<details>
  
  <summary>(Advanced) Uploading a local shapefile into Google Earth Engine with Python</summary>

Directly uploading a shapefile from your local drive to Google Earth Engine as an asset cannot be done solely with `ee` or `geemap` in Python. However, an automated workflow is possible through a combination of Google Cloud Storage (GCS), the Earth Engine CLI, and Python scripting:
- geemap: Lets you visualize and manipulate shapefiles in-memory in Earth Engine FeatureCollections—great for immediate analysis but does not persist data as an Earth Engine asset for future use.
- Earth Engine Python API: Does not support direct asset upload from your local drive.
- Asset uploads: Must use either the web-based Asset Manager or automate the workflow via GCS and the Earth Engine CLI, both of which can be wrapped in Python scripts.

Note: `geemap` provides session-based (i.e. not persistent) tools to upload georeferenced data:
- `csv_to_ee`: convert a CSV containing point coordinates (latitude and longitude) into an Earth Engine FeatureCollection within your Python environment. Input: A CSV file (can be a local path or URL) that includes columns for latitude and longitude. Output: An in-memory Earth Engine FeatureCollection created from the CSV points. See https://geemap.org/notebooks/74_csv_to_points/
- `shp_to_ee`:  import a local shapefile and convert it into an Earth Engine FeatureCollection within a Python environment such as Jupyter Notebook. For advanced control (such as GeoDataFrame transformations), consider loading with geopandas and then converting using `geemap.gdf_to_ee`.

**To do**: adapt the following code and execute to read a local shapefile and map it in your notebook.
```
countries_path = '/path/to/countries.shp'
countries_fc = geemap.shp_to_ee(countries_path)
Map = geemap.Map()
Map.addLayer(countries_fc, {}, 'Countries')
Map
```

This is especially useful for quickly bringing tabular point data into your Earth Engine workflow. The resulting FeatureCollection is not persisted as a Google Earth Engine asset; it is only available for use in your current Python or notebook session.


</details>

---


<details>
  
  <summary>Export images with geemap</summary>

**To do**: Execute [notebook to read and export images or image collections with geemap](https://geemap.org/notebooks/11_export_image/). 

Warning: You may run into errors when trying to execute the code. To prevent that, you must make some changes in the code to address the following issues. A clean script is available [here](geemap_export_image_revised.py).
1. You need to authenticate and initialize your project
  ```
  ee.Authenticate()
  ee.Initialize(project='my-project') # replace 'my-project' by your own project ID
  ```
2. Adapt `out_dir`. For instance `out_dir = '/content'` if you want to save the tif file to the Colab environment.
3. After your tif file is saved in the  Colab environment, you can either
- download manually to your local machine; or
- use `files.download` as in
  ```
  from google.colab import files
  files.download(filename) # local filename
  ```
4. File size limit. If you get an error message because the amount of data is too large, you can create a smaller file to export by increasing the `scale` as in `geemap.ee_export_image_collection(collection, out_dir=out_dir, scale=100)`

5. In section *Extract pixels as a Numpy array*, replace existing code by the following:
  ```
  import ee
  import geemap
  import numpy as np
  import matplotlib.pyplot as plt
  # read Harmonized Landsat Sentinel-2 (HLS)  image (resolution 30 m)
  img = ee.Image("NASA/HLS/HLSS30/v002/T12RXT_20240425T174911").select(["B4", "B5", "B6"])
  # define buffer within the image
  point=ee.Geometry.Point(-109.53, 29.19)
  aoi=point.buffer(10000)
  # create numpy array
  rgb_img = geemap.ee_to_numpy(img,region=aoi)
  print(rgb_img.shape)
  # Scale the data to [0, 255] to show as an RGB image.
  rgb_img_test = (255*(rgb_img[:, :, 0:3]-0.01)/0.18).astype("uint8")
  plt.imshow(rgb_img_test)
  plt.show()
  ```
</details>

---


<details>
  
  <summary>Exercise: LAI/FPAR imagery</summary>

Access VNP15A2H: LAI/FPAR 8-Day L4 Global 500m SIN Grid data for a given location and plot LAI and FPAR along time.

</details>




---

## Some useful links:

1. Earth Engine Data Catalog: [https://developers.google.com/earth-engine/datasets](https://developers.google.com/earth-engine/datasets)
2. Community catalog with a large variety of data sets: [GEE community catalog](https://gee-community-catalog.org/)
3. Geospatial processing packages: [OpenGeos](https://github.com/opengeos): geemap, GeoAI, ...

Note: When using GEE we are limited by the available data. For instance, [RS for Satellite Monitoring of Ammonia](https://www.frontiersplanetprize.org/news/blog-post-title-four-93k9t-87bsr-ae4yh-m3ktl-cpyt3-93cnl-e2s6n-xd3kd-rhwkr-ztcnp-gdcdd-ynhz5-r6kpe-mnkb2-jwljh-8yhsy-wxezp-xyf4l-5kbwa-4x9ba-3wnd8) relies on  Infrared Atmospheric Sounding Interferometer (IASI) (on Metop European satellites), which is not available in earth engine catalog.
