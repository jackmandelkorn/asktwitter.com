$(window).on("scroll resize",function() {
	var cards = document.getElementsByClassName("card-main");
  var mobile = false;
  if (!mobile) {
    for (var i = 0; i < cards.length; i++) {
      updateScroll(cards[i]);
    }
  }
});

function updateScroll(obj) {
	var offset = (($(window).scrollTop() - $(obj).offset().top) / (obj.clientHeight - window.innerHeight));
  if (offset > 0) {
  	if (offset < 1) {
    	changeTransform(obj,offset);
    }
    else {
    	changeTransform(obj,1);
    }
  }
  else {
    	changeTransform(obj,0);
  }
}

function changeTransform(obj,offset) {
	var children = obj.childNodes;
      for (var i = 0; i < children.length; i++) {
      	var value = ((obj.clientHeight - children[i].clientHeight) * offset);
      	$(children[i]).css('transform',('translateY(' + value + 'px)'));
      }
}
