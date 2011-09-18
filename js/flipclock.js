function resetFlip() {
    $(".bottom .flip").toggleClass("active");
    var t = setTimeout("resetFlipTimeout()", 500);
}
function resetFlipTimeout() {
    $(".bottom .flip, .top .flip")
        .css('display', 'none')
        .toggleClass("active");
    
    // Until I find a way to remove the animation...
    setTimeout("unhide()", 500);
}
function unhide() {
    $(".bottom .flip, .top .flip").css("display", "block");    
    
    $("#flip").removeAttr("disabled");
}
$(document).ready(function() {
    $("#flip").click(function() {
        $("#flip").attr("disabled", "true");
        $(".top .flip").toggleClass('active');
        setTimeout('resetFlip()', 480);
    });
});
