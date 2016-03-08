# Facebook Image Downloader
> Download images from your Facebook albums with correct timestamps

This tool allows you to download batches of photos from your Facebook account,
with correct timestamps and location EXIF data. This is particularly useful if
you want to move your pictures to Google Photos, which uses the data to
categorize the photos.

## Try it out!

In the near future I'll be publishing this tool as a Github Pages tool. At that
time you can find it at:

https://jehna.github.io/facebook-image-downloader/

Just log in and try it out! It's free and everything.

## Developing

If you'd like to build the project yourself, you'll need to install the project
by cloning the repository and installing the Grunt modules:

```shell
git clone https://github.com/jehna/facebook-image-downloader.git
cd facebook-image-downloader/
npm install
```

The previous code downloads the project to a folder and installs the required
dependencies from npm package manager.

### Build and livereload

To see the changes and build the project, you can type the following command:

```shell
grunt serve
```

It compiles the source files from `app/` folder to `dist` folder, starts a local
dev server, opens up your default browser and connects livereload to the site.

So after you have the `grunt` running, all your file changes are automatically
pushed to the browser.

### Publishing

To build the distribution version, you can run the following command:

```shell
grunt build
```

This builds and minifies the project to `dist/` folder.

## Features

This tool will let you:
* Log in with your Facebook credentials
* Select the Facebook photo album you want to download photos from
* Select the photos you want to download

After that it will:
* Download the full-size photos from Facebook
* Add the proper EXIF location data if available
* Set the image file's creation & modification dates to the date you uploaded
  the image to Facebook
* Rename the image to the Facebook photo's description or id
* ZIP all the files
* Prompt for you to download the ZIP file

## Contributing

If you'd like to contribute, please open an issue or fork the repository and use
a feature branch. Pull requests are warmly welcome.

## Licensing

The code in this project is licensed under MIT license.
