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
                var blob = new Blob([arrayBuffer],{type: 'image/jpeg'});
                JPEG.writeExifMetaData(
                    blob,
                    exifData,
                    function(error, imageBlob) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        
                        var fileReader = new FileReader();
                        fileReader.onload = function() {
                            var arrayBuffer = this.result;
                            zip.file(image.id + '.jpg', arrayBuffer);
                        };
                        fileReader.readAsArrayBuffer(imageBlob);
                        
                    }
                );
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