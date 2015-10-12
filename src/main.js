$(function () {
  var PHOTO_INTERVAL = 5000;
  var PHOTO_ANGLE_VARIANCE = 30;
  var photoList = null;
  var $leftPanel = $('.left-panel');
  var interval = null;

  function tossPhoto() {
    var src = photoList[Math.floor(Math.random() * photoList.length)];
    var $img = $('<img>').attr('src',src);
    var $photo = $('<div>').addClass('polaroid');
    var rotation = (Math.random() * PHOTO_ANGLE_VARIANCE - PHOTO_ANGLE_VARIANCE/2)+'deg';
    var x = Math.random() * $leftPanel.width()/2 + $leftPanel.width() / 2;
    var y = $leftPanel.height() * .25 + Math.random() * $leftPanel.height() * .5;
    $photo.append($img);
    $photo.css({
      transform: 'rotate('+rotation+') translate(-50%,-50%)',
      top: y,
      left: x
    });
    $leftPanel.append($photo);
    if ($('.polaroid').length >= 10) {
      clearInterval(interval);
      interval = null;
    }
  }

  $.get('/images.json').then(function (data) {
    photoList = data;
    tossPhoto();
    interval = setInterval(tossPhoto, PHOTO_INTERVAL);
  });
});
