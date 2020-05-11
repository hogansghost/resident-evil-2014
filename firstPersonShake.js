var score = 0,
	shotsFired = 0;
$('.score').html(score);
$('.shots').html(shotsFired);

var enemies = [];

$(document).on("click",".target-area",function(evt){
	if( evt === undefined )
		return;
		
	console.log("fire");
	shotsFired++;
	$('.shots').html(shotsFired);
	
	var clientX = evt.originalEvent.clientX;
	var clientY = evt.originalEvent.clientY;
	
	var miss = $('<div class="bullet-hole" style="top:' + clientY + 'px; left:' + clientX + 'px;"></div>');
	var hit = $('<div class="blood-hole" style="top:' + clientY + 'px; left:' + clientX + 'px;"></div>');
	
	if( $(evt.target).hasClass("hitbox") ){
		score++;
		$('.score').html(score);
		
		$('.target-area').prepend(hit);
		
		setTimeout(function(){
			$(hit).fadeOut(1000,function(){
				$(this).remove();
			})
		},2000);
	}else{
	
	$('.target-area').prepend(miss);
		setTimeout(function(){
			$(miss).fadeOut(500,function(){
				$(this).remove();
			})
		},1000);
	}
});

$(document).on("mousemove",".target-area",function(evt){
	if( evt === undefined )
		return;
		
	var clientX = evt.originalEvent.clientX;
	var clientY = evt.originalEvent.clientY;
	
	$('.firearm').css({
		'top':clientY,
		'left':clientX
	});
});

var intervall = setInterval(function(){
	var maxH = $('.target-area').outerHeight(true) - 200;
	var maxW = $('.target-area').outerWidth(true) - 300;
	
	var positionX = Math.floor(Math.random() * (maxW - 1 + 1)) + 1;
	var positionY = Math.floor(Math.random() * (maxH - 1 + 1)) + 1;
	
	if( $('.enemy').length >= 10 )
		return;
	
	$('.target-area').append('<div class="enemy" style="top:' + positionY + 'px; left:' + positionX + 'px;"><span class="hitbox head"></span><span class="hitbox body"></span></div>');
},1500);

//setTimeout(function(){clearInterval(intervall);},1600);

$(document).on("click",".hitbox",function(evt){
	if( evt === undefined )
		return;
	var enemy = $(this).closest(".enemy");
	
	
	
	if( $(this).hasClass("body") && ! enemy.attr('data-dmg') ){
		shakeBaby( enemy.get(0) );
		enemy.attr('data-dmg',"true");
		return;
	}
		
	if( $(this).hasClass("head") || ($(this).hasClass("body") && enemy.attr('data-dmg') == "true" )){
		enemy.html("IM DEAD");
		
		enemy.css({"background-image":"url(css/img/enemy-headless.png)"});

		setTimeout(function(){
			enemy.remove();
		}, 750);
	}
});

var _reps = {};
function shakeBaby( ele ){

	_reps[ ele ] = 100;
	theShaker( ele );

}

function theShaker( ele ){
	if( _reps[ ele ] < 0 ) return;
	
	_reps[ ele ]--;
	
	ele.style.transform = 'rotate(' + ( Math.round( Math.random() * 30 ) - 15 ) + 'deg)';
	
	setTimeout( theShaker , 20 , ele );
}