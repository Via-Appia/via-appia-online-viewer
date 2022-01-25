# Via Appia Viewer

> [Beginner Tutorial](./TUTORIAL.MD)

![Netlify Status](https://api.netlify.com/api/v1/badges/ff9d22c2-1548-448b-a6c8-f54573e6df3e/deploy-status)

Previous project (2015-2016): https://github.com/Via-Appia/PattyVis

## Build Setup

Enable `eslint --fix on file save` in your code editor.

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# generate static project
$ yarn generate
```
ok


Archeological pointcloud viewer for use in a museum setting. Based on storylines (narratives) that are defined by an artist or expert, a user should be able to view multiple _storylines_ , all consisting of multiple _pages_.

## high resolution pointcloud locally:

You need to download and place the pointclouds data into the `/static/pointclouds/highres`.  
The structure looks like:

![img.png](img.png)

## Upload the PointCloud data in cloud storage

*   You need to have installed locally [gsutils](https://cloud.google.com/storage/docs/gsutil_install)
*   log in you google account to get writing permissions
*   Navigate to the root where the data folder is placed and start the copy of the files to the google cloud storage: 

```shell
gsutil -m cp -r ./data gs://via-appia-20540.appspot.com
```

*    Access the cloud storage dashboard [here](https://console.cloud.google.com/storage/browser/via-appia-20540.appspot.com)

# Enable settings locally

You can change local setting by creating a `.env` file and enabling the settings you want to have:

```shell
LOCAL_POINTCLUDS = true
POINTS_BUDGET = 1000000
```

## Converting big LAS files to LAZ and viewing it in Potree Desktop

To visualize point clouds, which are usually in .las format, in potree they need to be covertered using the potree converter tooling. Using the the [PotreeConverter 2](https://github.com/potree/PotreeConverter/releases/tag/2.0) is a good option, since it generated only 3 files. However, it does not compress these files which results in  a converted point cloud which will be as big as the original LAS file. It therefore makes sense to use the .laz conversion from the [PotreeConverter 1.7](https://github.com/potree/PotreeConverter/releases/tag/1.7). Converting a LAS file (in our case 21GB) to LAZ for potree is easiest using windows. It is possible to compile the PotreeConverter and LasZIP for Linux and Mac but you have to do it yourself. 

### What you need:

*   Your LAS file(s), (in our case has been a 21GB size files).
*   Lastools
    *   Download here https://rapidlasso.com/lastools/     
*   PotreeConverter
    *   Download here [PotreeConverter\_1.7\_windows\_x64.zip](https://github.com/potree/PotreeConverter/releases/tag/1.7)
*   Potree Desktop (optional, use it to test your converted files)
    *   Web: [https://github.com/potree/PotreeDesktop/releases/tag/1.8](https://github.com/potree/PotreeDesktop/releases/tag/1.8)
    *   File: [**PotreeDesktop\_1.8\_windows\_x64.zip**](https://github.com/potree/PotreeDesktop/releases/download/1.8/PotreeDesktop_1.8_windows_x64.zip)

First we need to merge the various .las files (if any) into one file. To do so we use lastools. Browse to the bin folder and run: 

`las2las -i C:\\...\\001.las C:\\...\\002.las C:\\...\\003.las ... -merged -o C:\\...\\merged.las`   

Next we need to convert this .las to using the potree converter 1.7 and specifically indicate that it need to be compressed as .laz .

Navigate to the folder where PotreeConverter is, and run the command (replace the \<names>):

`./PotreeConverter.exe .\<fileName>.las -o ./<outputDirectory> --output-format LAZ`

Once the process has finished, you can drag and drop the new output directory to PotreeDesktop 1.8 to test it. In our repository the files need to be placed in `\static\pointclouds\highres\` .
