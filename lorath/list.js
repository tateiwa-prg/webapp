$(document).ready(function() {
    table_header_fixed();
});

//table ヘッダー固定
function table_header_fixed(){
    var tableSheet = $('table.sheet');
    //var offset = tableSheet.offset();
    $('.fixheader').width(tableSheet.width());
  
    $(window).scroll(function () {
        if($(window).scrollTop() > tableSheet.offset().top
        && $(window).scrollTop() < (tableSheet.offset().top + tableSheet.height() ) ) {
            var fixheaderTop = $(window).scrollTop();
            $('.fixheader').show();
        } else {
            $('.fixheader').hide();
        }
    });
    $(window).resize(function() {
        $('.fixheader').width(tableSheet.width());
    });
}

//ajax通信 GET
function ajax_get(pass) {
  return $.ajax({
    contentType: "application/json",
    dataType: "json",
    type: "GET",
    url: pass
  });
}
//ajax通信 POST
function ajax_post(pass, body) {
  return $.ajax({
    contentType: "application/json",
    data: JSON.stringify(body),
    dataType: "json",
    type: "POST",
    url: pass
  });
}
