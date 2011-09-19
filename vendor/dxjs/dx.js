var Dx = {};

var ua = navigator.userAgent.toLowerCase();

Dx.android = ua.indexOf("android") > -1;
Dx.iPad = ua.indexOf("ipad") > -1;
Dx.iPhone = ua.indexOf("iphone") > -1;
Dx.iOS = Dx.iPad || Dx.iPhone;
Dx.mobile = Dx.iPad || Dx.iPhone || Dx.android;
Dx.desktop = !Dx.mobile;

// Add class to document element
Dx.addClassToHtml = function(cls) {
    var docElement = document.documentElement;
    docElement.className += ' ' + cls;
};

if (Dx.android) Dx.addClassToHtml("dx-android");
if (Dx.iPad) Dx.addClassToHtml("dx-ipad");
if (Dx.iPhone) Dx.addClassToHtml("dx-iphone");
if (Dx.iOS) Dx.addClassToHtml("dx-ios");
if (Dx.mobile) Dx.addClassToHtml("dx-mobile");
if (Dx.desktop) Dx.addClassToHtml("dx-desktop");


