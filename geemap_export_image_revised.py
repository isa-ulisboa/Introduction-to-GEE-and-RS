# -*- coding: utf-8 -*-
"""
Uncomment the following line to install [geemap](https://geemap.org) if needed.
"""

# !pip install geemap

import ee
import geemap
import os

ee.Authenticate()
ee.Initialize(project='ee-my-mlc-math-isa-utl') # change project ID

Map = geemap.Map()
Map

"""## Download an ee.Image"""

image = ee.Image("LANDSAT/LE7_TOA_5YEAR/1999_2003")

landsat_vis = {"bands": ["B4", "B3", "B2"], "gamma": 1.4}
Map.addLayer(image, landsat_vis, "LE7_TOA_5YEAR/1999_2003", True, 0.7)

# Draw any shapes on the map using the Drawing tools before executing this code block
feature = Map.draw_last_feature

if feature is None:
    geom = ee.Geometry.Polygon(
        [
            [
                [-115.413031, 35.889467],
                [-115.413031, 36.543157],
                [-114.034328, 36.543157],
                [-114.034328, 35.889467],
                [-115.413031, 35.889467],
            ]
        ]
    )
    feature = ee.Feature(geom, {})

roi = feature.geometry()

"""### Exporting all bands as one single image"""

filename = "landsat.tif"
image = image.clip(roi).unmask()
geemap.ee_export_image(
    image, filename=filename, scale=90, region=roi, file_per_band=False
)

"""### Exporting each band as one image"""

geemap.ee_export_image(
    image, filename=filename, scale=90, region=roi, file_per_band=True
)

"""### Export an image to Google Drive"""

geemap.ee_export_image_to_drive(
    image, description="landsat", folder="export", region=roi, scale=30
)

"""## Download an ee.ImageCollection"""

import ee
import geemap
import os

loc = ee.Geometry.Point(-99.2222, 46.7816)
collection = (
    ee.ImageCollection("USDA/NAIP/DOQQ")
    .filterBounds(loc)
    .filterDate("2020-01-01", "2021-01-01")
    .filter(ee.Filter.listContains("system:band_names", "N"))
)

out_dir = '/content'

print(collection.aggregate_array("system:index").getInfo())

geemap.ee_export_image_collection(collection, out_dir=out_dir, scale=10)

geemap.ee_export_image_collection_to_drive(collection, folder="export", scale=10)

"""## Extract pixels as a Numpy array"""

import ee
import geemap
import numpy as np
import matplotlib.pyplot as plt

img = ee.Image("NASA/HLS/HLSS30/v002/T12RXT_20240425T174911").select(["B4", "B5", "B6"])

point=ee.Geometry.Point(-109.53, 29.19)
aoi=point.buffer(10000)

rgb_img = geemap.ee_to_numpy(img,region=aoi)
print(rgb_img.shape)

print(rgb_img.sum(axis=2))

# Scale the data to [0, 255] to show as an RGB image.
rgb_img_test = (255*(rgb_img[:, :, 0:3]-0.01)/0.18).astype("uint8")
plt.imshow(rgb_img_test)
plt.show()