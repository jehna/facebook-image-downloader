'use strict';

var images;
var percentLoadedRemaining;
var zip;

function loadedAllImages() {
    //var $container = $('#select-images');
    //var i = 0;
    //var $row;
    
    images.forEach(function(image) {
        /*if (i % 3 === 0) {
            $row = $('<div class="row" />').appendTo($container);
        }
        
        var $col = $('<div class="col-md-4" />').appendTo($row);
        $('<img />').attr('src', image.picture).appendTo($col);
        
        i++;*/
        
        
        var exifData = {};
        if(image.created_time) {
            exifData.DateTime = exifData.DateTimeOriginal = image.created_time;
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
                zeroth[piexif.ImageIFD.Make] = 'Make';
                zeroth[piexif.ImageIFD.XResolution] = [777, 1];
                zeroth[piexif.ImageIFD.YResolution] = [777, 1];
                zeroth[piexif.ImageIFD.Software] = 'Piexifjs';
                exif[piexif.ExifIFD.DateTimeOriginal] = '2010:10:10 10:10:10';
                exif[piexif.ExifIFD.LensMake] = 'LensMake';
                gps[piexif.GPSIFD.GPSDateStamp] = '1999:99:99 99:99:99';
                var exifObj = {'0th':zeroth, 'Exif':exif, 'GPS':gps};
                var exifStr = piexif.dump(exifObj);
                
                var exifModified = piexif.insert(exifStr, 'data:image/jpeg;base64,' + base64);
                
                zip.file(image.id + '.jpg', exifModified.slice(23), {base64: true});
            }
        };
        request.send(null);
        
        return false;
    });
    //$row.appendTo($container);
}

function loadNextImages(paging) {
    var params = { limit: 5 };
    if (paging) {
        params.after = paging.cursors.after;
    } else {
        images = [];
        percentLoadedRemaining = 1;
    }
    FB.api('/me/photos', 'GET', params, function(response) {
        console.log(response);
        images = images.concat(response.data);
        
        if (response.paging) {
            setTimeout(function() {
                loadNextImages(response.paging);
            },1);
            
            percentLoadedRemaining *= 0.8; 
        } else {
            percentLoadedRemaining = 0;
            loadedAllImages();
        }
        
        $('#progressbar').css({ width: (1-percentLoadedRemaining)*100 + '%' });
        
    });
}


$(function() {
    
    $('#input-url').change(function() {
        
    });
});

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            $('.login').hide();
            $('#app').show();
            
            loadNextImages();
        }
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '483759105134186',
        xfbml      : true,
        version    : 'v2.3'
    });
    
    checkLoginState();
};