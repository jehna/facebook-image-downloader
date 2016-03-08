'use strict';

var images;
var percentLoadedRemaining;
var zip;

var selectedImages = [];

var TARGET_IMAGE_WIDTH = 400;

function loadedAllImages() {
    $('.progress').hide();
    $('#select-images-to-download').show();
    selectedImages = [];
    $('#download-btn').hide();
    
    var $container = $('#select-images').show().html('');
    var imgCol = 0;
    var $row;
    
    images.forEach(function(image) {
        if (imgCol % 3 === 0) {
            $row = $('<div class="row" />').appendTo($container);
        }
        
        var displayImage = image.images[0];
        for (var i = 1; i < image.images.length; i++) {
            if (Math.abs(displayImage.width - TARGET_IMAGE_WIDTH) < Math.abs(image.images[i] - TARGET_IMAGE_WIDTH)) {
                displayImage = image.images[i];
            }
        }
        
        var $col = $('<div class="col-md-4" />').appendTo($row);
        $('<img class="img-rounded thumb" />')
        .css('background-image', 'url('+displayImage.source+')')
        .appendTo($col)
        .click(function() {
            if (selectedImages.indexOf(image) === -1) {
                $col.addClass('selected');
                selectedImages.push(image);
            } else {
                $col.removeClass('selected');
                selectedImages.splice(selectedImages.indexOf(image), 1);
            }
            if (selectedImages.length > 0) {
                $('#download-btn').show()
                .text('Download ' + selectedImages.length + ' images');
            } else {
                $('#download-btn').hide();
            }
        });
        
        imgCol++;
        
        return false;
    });
    $row.appendTo($container);
}

function loadNextImages(url, paging) {
    var params = {
        limit: 5,
        fields: 'created_time,source,place{location{latitude,longitude}},name,id,images'
    };
    if (paging) {
        params.after = paging.cursors.after;
    } else {
        images = [];
        percentLoadedRemaining = 1;
        $('.progress').show();
        $('#progressbar').css({ width: '0%' }).show();
    }
    FB.api('/'+url, 'GET', params, function(response) {
        console.log(response);
        images = images.concat(response.data);
        
        if (response.paging) {
            setTimeout(function() {
                loadNextImages(url, response.paging);
            },1);
            
            percentLoadedRemaining *= 0.8; 
        } else {
            percentLoadedRemaining = 0;
            loadedAllImages();
        }
        
        $('#progressbar').css({ width: (1-percentLoadedRemaining)*100 + '%' });
        
    });
}

function downloadImages() {
    selectedImages.forEach(function(image) {
        
        var exifData = {};
        if(image.created_time) {
            exifData.DateTime = exifData.DateTimeOriginal = image.created_time;
        }
        
        var largestImage = image.images[0];
        for (var i = 1; i < image.images.length; i++) {
            if (image.images[i].width > largestImage.width) {
                largestImage = image.images[i];
            }
        }
        
        zip = new JSZip();
        
        var request = new XMLHttpRequest();
        request.open('GET', image.source, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            if ( this.readyState === 4 && this.status === 200 ) {
                var arrayBuffer = request.response; // Note: not request.responseText
                
                var binary = '';
                var bytes = new Uint8Array( arrayBuffer );
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode( bytes[ i ] );
                }
                var base64 = window.btoa( binary );
                
                var zeroth = {};
                var exif = {};
                var gps = {};
                if (image.created_time) {
                    exif[piexif.ExifIFD.DateTimeOriginal] = image.created_time;
                    gps[piexif.GPSIFD.GPSDateStamp] = image.created_time;
                }
                if (image.place && image.place.location && image.place.location.latitude && image.place.location.longitude) {
                    console.log('Got lat&lng');
                    gps[piexif.GPSIFD.GPSDestLatitude] = image.place.location.latitude;
                    gps[piexif.GPSIFD.GPSDestLongitude] = image.place.location.longitude;
                }
                
                var exifObj = {'0th':zeroth, 'Exif':exif, 'GPS':gps};
                var exifStr = piexif.dump(exifObj);
                
                var exifModified = piexif.insert(exifStr, 'data:image/jpeg;base64,' + base64);
                
                var fileName = (image.name ? image.name.substr(0,100).replace(/[\/\\]/g, '') : image.id);
                var suffix = '';
                var suffixNum = 0;
                var ext = '.jpg';
                
                while (zip.files[fileName + suffix + ext]) {
                    suffix = '_' + (++suffixNum);
                }
                
                zip.file(
                    fileName + suffix + ext,
                    exifModified.slice(23),
                    {
                        base64: true,
                        date: image.created_time ? new Date(image.created_time) : new Date()
                    }
                );
                
                if (Object.keys(zip.files).length === selectedImages.length) {
                    // All loaded, let's fire download
                    var content = zip.generate({type:'blob'});
                    // see FileSaver.js
                    saveAs(content, 'download.zip');
                }
            }
        };
        request.send(null);
    });
}

$(function() {
    $('#download-btn').click(function() {
        downloadImages();
    });
});

function loadAlbums() {
    FB.api('/me/albums', 'GET', null, function(response) {
        console.log(response);
        var $albums = $('#albums');
        response.data.forEach(function(album) {
            $('<option />')
            .text(album.name)
            .attr('value', album.id)
            .appendTo($albums);
        });
        $albums.change(function() {
            var albumID = $(this).val();
            if (albumID === '-1') {
                loadNextImages('me/photos?type=tagged');
            } else {
                loadNextImages(albumID + '/photos');
            }
        });
    });
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            $('.login').hide();
            $('#app').show();
            loadAlbums();
        }
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '483759105134186',
        xfbml      : true,
        version    : 'v2.5'
    });
    
    checkLoginState();
};
