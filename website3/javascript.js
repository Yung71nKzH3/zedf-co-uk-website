var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var horses = document.getElementsByClassName("horses");
  var dots = document.getElementsByClassName("dot");
  if (n > horses.length) {slideIndex = 1}
    if (n < 1) {slideIndex = horses.length}
    for (i = 0; i < horses.length; i++) {
      horses[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
    }
  horses[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

var figure = $(".video").hover( hoverVideo, hideVideo );

function hoverVideo(e) {  
    $('video', this).get(0).play(); 
}

function hideVideo(e) {
    $('video', this).get(0).pause(); 
}