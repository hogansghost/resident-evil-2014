var eventtouch = ('ontouchstart' in document.documentElement) ? true : false,
	eventclick = ( eventtouch ) ? 'tap' : 'click',
	eventstart = ( eventtouch ) ? 'touchstart' : 'mousedown',
	eventend = ( eventtouch ) ? 'touchend' : 'mouseup',
	eventmove = ( eventtouch ) ? 'touchmove' : 'mousemove';
	
	
	
	var trackListing = {
		"firearm" : {
			"shot" : ( eventtouch ) ? "" : new Audio('sounds/shot.mp3'),
			"empty" : ( eventtouch ) ? "" : new Audio('sounds/empty.mp3'),
			"miss" : ( eventtouch ) ? "" : new Audio('sounds/miss.mp3'),
			"reload" : ( eventtouch ) ? "" : new Audio('sounds/reload.mp3')
		},
		"enemy" : {
			"head" : ( eventtouch ) ? "" : new Audio('sounds/enemy_head_hit.mp3'),
			"headKill" : ( eventtouch ) ? "" : new Audio('sounds/enemy_head_kill.mp3'),
			"body" : ( eventtouch ) ? "" : new Audio('sounds/enemy_body.mp3')
		},
		"misc" : {
			"background" : ( eventtouch ) ? "" : new Audio('sounds/backgroundDining.mp3'),
			"gameover" : ( eventtouch ) ? "" : new Audio('sounds/death.mp3'),
			"healing" : ( eventtouch ) ? "" : new Audio('sounds/healing.mp3')
		}
	};
		
	var sounds = (eventtouch) ? false : true;
		sounds = false;
	(eventtouch) ? $('.audio').hide() : $('.audio').show();
	
	var debug = false;
		

	var loopStatus = false,
	shotsFired = 0,
	magazine = 15,
	magazineMax = 15,
	reloadDuration = 750,
	reloading = false,
	
	
	player = {
		"maxHealth" : ( debug ) ? 1000000000 : 7500,
		"health" : ( debug ) ? 1000000000 : 7500,
		"score"  : {
			"total" : 0,
			"kills" : 0
		},
		"shots"   : {
			"head" : 0,
			"body" : 0,
			"arm"  : 0,
			"leg"  : 0,
			"miss" : 0,
			"total": 0
		}
	}
	
/* GAME SIZE */
var backgroundHeight,
	backgroundWidth;

var enemies = [],
	enemiesPosition = [
		{
			"top" : "80%",
			"left" : "10%",
			"scale" : "1"
		},{
			"top" : "50%",
			"left" : "40%",
			"scale" : "1"
		},{
			"top" : "30%",
			"left" : "60%",
			"scale" : "1"
		},{
			"top" : "40%",
			"left" : "5%",
			"scale" : "1"
		}
	],
	uid = 0,
	enemyMaxCount = 4,
	damageTable = {
		"damage" : {
			"head" : 600,
			"body" : 150,
			"arm"  : 65,
			"leg"  : 80
		},
		"score" : {
			"headKill" : 720,
			"head"     : 650,
			"body"     : 610,
			"arm"      : 415,
			"leg"      : 430
		},
		"zombie" : {
			"health" : 400,
			"multiplier" : .67,
			"scoreMulti" : .8,
			"head" : 400,
			"body" : 120,
			"arm"  : 35,
			"leg"  : 60,
			"attackTime" : 2000,
			"attackDamage" : 230
		},
		"crimson" : {
			"health" : 700,
			"scoreMulti" : .95,
			"head" : 500,
			"body" : 140,
			"arm"  : 45,
			"leg"  : 70,
			"attackTime" : 1500,
			"attackDamage" : 330
		},
		"hunter" : {
			"health" : 900,
			"scoreMulti" : 1.2,
			"head" : 600,
			"body" : 150,
			"arm"  : 65,
			"leg"  : 80,
			"attackTime" : 1650,
			"attackDamage" : 430
		}
	};
	
	var gameover = true;
	var pause = false;
	
	//var enemyTimer = Math.floor(Math.random() * (2500 - 250 + 1)) + 250;

	function randomise(max,min){
		var value = Math.floor(Math.random() * (max - min + 1)) + min;
		
		return value;
	}

function init(){

	//$('<img/>').attr('src', 'css/img/bg.jpg').on('load',function(){
		var imageSrc = ( eventtouch && window.innerWidth <= 900 ) ? 1 : 0, // Check whether mobile should be loaded.
			imageList = [
				[
					"css/img/background-sprite.jpg",
					"css/img/table.png",
					"css/img/enemy-sprite.png",
					"css/img/misc-sprite.png",
					"css/img/damage.png",
					"css/img/firearm-effects.png",
					"css/img/portrait-bg.png"
				],
				[
					"css/img/mob/mbackground-sprite.jpg",
					"css/img/mob/mmisc-sprite.png",
					"css/img/mob/mtable.png",
					"css/img/mob/menemy-sprite.png",
					"css/img/mob/mfirearm-effects.png",
					"css/img/mob/mdamage.png",
					"css/img/portrait-bg.png"
				]
			];
			
		var imageLength = imageList[imageSrc].length;
		var loadedCount = 0, errorCount = 0;

		var checkAllLoaded = function(){
			if (loadedCount + errorCount == imageLength ){
				console.log('All images loaded.');
				
				$('.slide').swipeCarousel();

				screenShow('start');
				
				$('.loading').hide();
			}
		};

		var onload = function(img){
				loadedCount++;
				
				if( img.currentTarget.attributes.src.value == imageList[imageSrc][0] ){
					
						
					backgroundRatio(img.currentTarget.width, img.currentTarget.width / 2);
				}
				
				checkAllLoaded();
			},
			onerror = function(){
				errorCount++;
				checkAllLoaded();
			};

		for( var i=0; i < imageLength; i++ ){
			var img = new Image();
				img.src = imageList[imageSrc][i];
				//img.onload = onload(img, imageList[imageSrc][i]);
				img.onload = onload;
				img.onerror = onerror;
				img = null; // Image is cached, remove from memory.
		}
}

function screenShow(screen){
	if( screen === undefined )
		return;
	
	$('.screen[data-screen-name="'+screen+'"]').show();
	$(window).trigger('resize');
	pauseGame();
}

function screenHide(screen){
	if( screen === undefined ){
		$('.screen').hide();
	}else{
		$('.screen[data-screen-name="'+screen+'"]').fadeOut(250);
	}
	
	unpauseGame();
}

function startGame(evt){

if( evt !== undefined )
	evt.preventDefault();

screenHide();

beginInterval();


if( gameover == true ){
	scoreReset();
	gameover = false;
}

if( sounds == true ){
	audioOn();
	playAudio(trackListing.misc.background);
	audioFadeIn(trackListing.misc.background);
	trackListing.misc.background.loop = true;
}

}
	

	function unpauseGame(){
		setTimeout(function(){
			if( !gameover ){
				pause = false;
			}
		},500);
	}
	
	function pauseGame(){
		pause = true;
	}
	
	function loop(){
		loopStatus = true;
	
		var rand = randomise(450,1200);
		setTimeout(function(){
			if( !gameover && loopStatus ){
				enemyCreate();
				loop();
			}
		}, randomise(450,1200));
	}
	
	var p = 0;
	
	function beginInterval(){
		
		if( !loopStatus )
			loop();
		
		console.log("INTERVAL");
		clearInterval(window.globalCounter);
		window.globalCounter = setInterval(function(){
		console.log("interval running");
			
			if( pause )
				return;
			
			$('.interval').html(p++);
			
			//if( pause == true ){
			//	clearInterval(window.globalCounter);
			//	return;
			//}
			
			
			for( var i=0; i < enemies.length; i++ ){
				if( enemies[i].attack <= 0 ){
					
					for( var u=0; u < enemies.length; u++ ){
						if( enemies[i].uid == enemies[u].uid ){
							
					
							//console.log("ATTACK");
							//$('.bite').fadeIn(0);
							$('.bite').addClass('bite-show');
							player.health = player.health - damageVariation(damageTable[enemies[u].type].attackDamage);
							//$('.health').html(player.health);
							//console.log("HEALTH : " + player.health);
							enemies[u].attack = damageTable[enemies[u].type].attackTime;
							setTimeout(function(){
								//$('.bite').stop(true,true).fadeOut(250);
								$('.bite').removeClass('bite-show');
							},450);
						}
					}
				}else{
					for( var u=0; u < enemies.length; u++ ){
						if( enemies[i].uid == enemies[u].uid ){
							enemies[i].attack = enemies[u].attack - 20;
						}
					}
				}
			}
			
			playerHealthCheck();
			
			
			
			
			
			
			
			for( var i=0; i < enemies.length; i++ ){
				var percent = (enemies[i].attack / damageTable.zombie.attackTime ) * 100
					offset = percent / 2;
				var id = enemies[i].uid;
				$('.enemy[data-uid="'+id+'"]').find('.attack-bar').css({
					'-webkit-transform' : 'translate3d(-'+offset+'%,0,0)',
					'-moz-transform' : 'translate3d(-'+offset+'%,0,0)',
					'transform' : 'translate3d(-'+offset+'%,0,0)',
					'background' : '-moz-linear-gradient(left,  rgba(255,0,0,.4) 0%, rgba(255,0,0,.4) '+percent+'%, rgba(0,0,0,0) '+percent+'%, rgba(0,0,0,0) 100%)',
					'background' : '-webkit-gradient(linear, left top, right top, color-stop(0%,rgba(255,0,0,.4)), color-stop('+percent+'%,rgba(255,0,0,.4)), color-stop('+percent+'%,rgba(0,0,0,0)), color-stop(100%,rgba(0,0,0,0)))',
					'background' : 'linear-gradient(to right,  rgba(255,0,0,.4) 0%, rgba(255,0,0,.4) '+percent+'%, rgba(0,0,0,0) '+percent+'%, rgba(0,0,0,0) 100%)'
				});
			}
		}, 20);
	}


function gameOver(){
	gameover = true;
	loopStatus = false;
	
	pauseGame();
	
	$(trackListing.misc.background).animate({volume:0},250);
	playAudio(trackListing.misc.gameover);
	clearTimeout(window.globalCounter);
	
		
	$('.screen-gameover .score-main').html(
			'<div class="score-block">'
		+		'<p>Score</p>'
		+		'<h1>'+player.score.total+'</h1>'
		+	'</div>'
		+	'<div class="score-block">'
		+		'<p>Accuracy</p>'
		+		'<h1>'+((player.shots.total <= 0 ) ? 0 : ((player.shots.total - player.shots.miss) / player.shots.total) * 100).toFixed(2)+'%</h1>'
		+	'</div>'
	);
	
	$('.screen-gameover .score-detail').html(
			'<div class="score-block">'
		+		'<div class="score-block"><p class="score-copy score-title">Head Shots:</p><h1 class="score-copy score-score">'+player.shots.head+'</h1></div>'
		+		'<div class="score-block"><p class="score-copy score-title">Body Shots:</p><h1 class="score-copy score-score">'+player.shots.body+'</h1></div>'
		+		'<div class="score-block"><p class="score-copy score-title">Leg Shots:</p><h1 class="score-copy score-score">'+player.shots.leg+'</h1></div>'
		+		'<div class="score-block"><p class="score-copy score-title">Arm Shots:</p><h1 class="score-copy score-score">'+player.shots.arm+'</h1></div>'
		+	'</div>'
	);
	
	$('.screen-gameover .slide').hide();
	
	$('.screen-gameover').fadeIn(1000, function(){
		gameReset();
		$('.screen-gameover .slide').fadeIn();
		$(window).trigger("resize");
	});
}

function gameReset(){
	$('.player-message').hide();
	$('.health-item').remove();
	$('.enemy').remove();
	$('.remove').remove();
	enemies = [];
	magazine = magazineMax;
	
	$('.reload').removeClass('reload');
	
	$('.shots .magazine').css({
		'-webkit-transform' : 'translate3d(0%,0,0)',
		'-moz-transform' : 'translate3d(0%,0,0)',
		'transform' : 'translate3d(0%,0,0)'
	});
	player.health = player.maxHealth;
}

function playerHealthCheck(){
	if( player.health <= 1000 ){
		$('body').data("health","danger");
		$('.health').removeClass("caution").addClass("danger");
		$('body').removeClass("caution").addClass("danger");
		
	}else if( player.health <= 5000 ){
		$('.health').removeClass("danger").addClass("caution");
		$('body').removeClass("danger").addClass("caution");
	}else{
		$('.health').removeClass("caution danger");
		$('body').removeClass("caution danger");
	}
	
	if( player.health <= 0 || gameover == true){
		gameOver();
		
	}
}

$(document).on("keydown",reloadEvent);

	function reloadEvent(evt){
		if( evt !== undefined )
			evt.preventDefault();
	
		if( pause == true )
			return;
		
		
		
		if( evt.keyCode == 67 ){
			cheat();
		}
		
		if( (evt.keyCode == 82 || evt.type == eventstart ) && reloading == false ){
			reloading = true;
			
			var removeLength = document.querySelectorAll('.remove').length;
			if( removeLength > 0 ){
				for( var i=0; i<removeLength; i++ ){
					document.querySelector('.target-area').removeChild(document.querySelector('.remove'));
				}
			}

			
			playAudio(trackListing.firearm.reload);
			$('.player-message').html("RELOADING...").fadeIn(0);
			$('.reload-button').removeClass("reload");
		
			$('.shots .magazine').css({
				'-webkit-transition' : reloadDuration + 'ms',
				'transition' : reloadDuration + 'ms',
				'-webkit-transform' : 'translate3d(0,0,0)',
				'-moz-transform' : 'translate3d(0,0,0)',
				'transform' : 'translate3d(0,0,0)'
			});
			
			setTimeout(function(){
				magazine = magazineMax;
				reloading = false;
				$('.player-message').hide();
				$('.firearm').removeClass("empty");
			}, reloadDuration);
		}
	}
	
		function reloadEnd(){
			reloading = false;
				
			
			clearInterval(bulletInsert);
			$('.player-message').hide();
		}

$(document).on(eventstart,".target-area",function(evt){
	if( evt === undefined || pause == true )
		return;
	
	if( $(evt.target).hasClass("health-item") ){
		healthItemEvent($(evt.target));
		return;
	}
	
	if( magazine <= 0 && reloading == false ){
		playAudio(trackListing.firearm.empty);
		reloadPrompt();
		return;
	}else if( reloading == true ){
		return;
	}
	
	
		player.shots.total++;
	
	var amount = (((magazineMax+1) - magazine) * $('.bulletcount-bullet')[0].offsetWidth) +"px";
	
	$('.shots .magazine').css({
		'-webkit-transition' : '0ms',
		'transition' : '0ms',
		'-webkit-transform' : 'translate3d('+amount+',0,0)',
		'-moz-transform' : 'translate3d('+amount+',0,0)',
		'transform' : 'translate3d('+amount+',0,0)'
	})
	
	$('.firearm').addClass("fire");
	setTimeout(function(){
		$('.firearm').removeClass("fire");
	},65);
	
	if( $(evt.target).hasClass("head") ){
		
		playAudio(trackListing.enemy.head);
		
		
	}else if( !$(evt.target).hasClass("hitbox") ){
		playAudio(trackListing.firearm.miss);
	}else{
		playAudio(trackListing.enemy.body);
	}
	
	playAudio(trackListing.firearm.shot);
	
	//console.log("fire");
	magazine--;
	
	if( magazine <= 0 )
		$('.firearm').addClass("empty");
		
	var area = document.querySelectorAll(".game-area")[0];
	var areaWidth  = area.offsetWidth;
	var areaHeight = area.offsetHeight;
	
	var offsetLeft  = area.offsetLeft;
	var offsetTop  = area.offsetTop;
	
	var clientX = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientX - offsetLeft) : (evt.originalEvent.pageX - offsetLeft);
	var clientY = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientY - offsetTop) : (evt.originalEvent.pageY - offsetTop);
	
	var clientXPer = ( clientX / areaWidth ) * 100 ;
	var clientYPer = ( clientY / areaHeight ) * 100 ;
	
	//var scale = 
	var scale = 1 - (Math.floor((((window.innerHeight - clientY)) / window.innerHeight) * 100) / 100);
	var rand = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
	/*
	ORIGINAL
	
	var miss = $('<div class="bullet-hole"></div>').css({ 'top':clientYPer, 'left':clientXPer, 'transform':'scale('+scale+')' });
	var hit = $('<div class="blood-hole blood0' + rand + '"></div>').css({ 'top':clientYPer, 'left':clientXPer });// style="top:' + clientY + 'px; left:' + clientX + 'px;"></div>');
	*/
	
	var miss = $('<div class="hit-element"><div class="bullet-hole"></div></div>').css({
			'-webkit-transform':'translate3d('+Math.floor(clientXPer)+'%,'+Math.floor(clientYPer)+'%,0)',
			'transform':'translate3d('+Math.floor(clientXPer)+'%,'+Math.floor(clientYPer)+'%,0)'
		});
	
	var hit = $('<div class="hit-element"><div class="blood-hole blood0' + rand + '"></div></div>').css({
			'-webkit-transform':'translate3d('+Math.floor(clientXPer)+'%,'+Math.floor(clientYPer)+'%,0)',
			'transform':'translate3d('+Math.floor(clientXPer)+'%,'+Math.floor(clientYPer)+'%,0)'
		});
	
	
	if( $(evt.target).hasClass("hitbox") ){
		targetHit($(evt.target));
		
		$('.target-area').prepend(hit);
		
		if( eventtouch ){
			setTimeout(function(){
				$(hit).css({'opacity':0}).addClass('remove');
			},250);
		}else{
			$(hit).fadeOut(1000,function(){
				$(hit).addClass('remove');
			})
		}
	}else if( $(evt.target).hasClass("health-item") ){
		healthItemEvent($(evt.target));
	}else{
		$('.target-area').prepend(miss);
		
		player.shots.miss++;
		
		if( eventtouch ){
			setTimeout(function(){
				$(miss).css({'opacity':0}).addClass('remove');
			},250);
		}else{
			setTimeout(function(){
				$(miss).fadeOut(1000,function(){
					$(miss).addClass('remove');
				})
			},1000);
		}
	}
});

function reloadPrompt(){
	if( reloading == false ){
		$('.player-message').html('Reload!').fadeIn(0);
		$('.reload-button').addClass("reload");
	}
}

$(document).on(eventmove,".target-area",function(evt){
	if( evt === undefined )
		return;
	
	var offset  = document.querySelectorAll(".game-area")[0].offsetLeft;
	var clientX = evt.originalEvent.clientX;
	var clientY = evt.originalEvent.clientY;
	
	clientX = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientX - offset) : (evt.originalEvent.pageX - offset);//(evt.originalEvent.x - offset) || (evt.originalEvent.pageX - offset);
	clientY = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientY) : (evt.originalEvent.pageY);//(evt.originalEvent.y - offset) || (evt.originalEvent.pageY - offset);
	
	
	var scale = 1 - (Math.floor((((window.innerHeight - clientY)) / window.innerHeight) * 100) / 100);
	
	var thirds = $('.target-area').outerWidth(true) / 3;
	
		$('.firearm').attr("data-position","center");
	
	$('.firearm').css({
		'left':clientX,
	});
});

$(document).on(eventstart, globalStart);
$(document).on(eventmove, globalMove);
$(document).on(eventend, globalEnd);
	
	var globalStartTime, globalEndTime, globalStartX, globalEndX, globalStartY, globalEndY
	
	function globalStart(evt){
		globalStartTime	= self.getEventPosition(evt)[0];
		globalStartX	= self.getEventPosition(evt)[1];
		globalStartY	= self.getEventPosition(evt)[2];		
	}
	
	function globalMove(evt){
		globalEndTime	= self.getEventPosition(evt)[0];
		globalEndX		= self.getEventPosition(evt)[1];
		globalEndY		= self.getEventPosition(evt)[2];
	}
	
	function globalEnd(evt){
		globalEndTime	= self.getEventPosition(evt)[0];
		globalEndX		= self.getEventPosition(evt)[1];
		globalEndY		= self.getEventPosition(evt)[2];
		
		
		if( globalDifference(globalStartY, globalEndY) <= 18 && globalDifference(globalStartX, globalEndX) <= 18 && globalDifference(globalStartTime, globalEndTime) <= 200 ){
			console.log($(evt.target));
			//$(evt.target).trigger(eventclick);
		}
	}
		
		function globalDifference(a, b){
			return Math.abs(Math.floor(a) - Math.floor(b));
		}
		
		function getEventPosition(evt){
			var self = this,
				globalTimestamp = evt.timeStamp,
				globalX,
				globalY;
				
				if( evt.type == eventend ){
					globalX = Math.floor( ( self.touch ) ? evt.originalEvent.changedTouches[0].clientX : evt.originalEvent.clientX );
					globalY = Math.floor( ( self.touch ) ? evt.originalEvent.changedTouches[0].clientY : evt.originalEvent.clientY );
				}else{
					globalX = Math.floor( ( self.touch ) ? evt.originalEvent.targetTouches[0].clientX : evt.originalEvent.clientX );
					globalY = Math.floor( ( self.touch ) ? evt.originalEvent.targetTouches[0].clientY : evt.originalEvent.clientY );
				}
			
			return [globalTimestamp, globalX, globalY];
		}

function playAudio(track){
	if( track === undefined || sounds == false )
		return;
	
	if( track.paused == false ){
		track.pause();
		track.currentTime = 0;
		track.play();
	}else{
		track.play();
	}
}

	function audioControls(evt){
		if( evt !== undefined )
			evt.preventDefault();
		
		if( sounds == false ){
			audioOn();
			$('.audio').html("mute");
		}else{
			audioOff();
			$('.audio').html("unmute");
		}
	}
	
	function audioOff(){
		sounds = false;
		
		$(trackListing.misc.background).stop(true,true).animate({volume:0},1000);
	}
	
	function audioOn(){
		sounds = true;
		
		if( gameover !== true ) {
			trackListing.misc.background.volume = 0;
			trackListing.misc.background.play();
			$(trackListing.misc.background).stop(true,true).animate({volume:1},1000);
		}
	}
	
	function audioFadeOut(track){
		if( track === undefined )
			return;
		
		$(track).stop(true,true).animate({volume:0},1000);
	}
	
	function audioFadeIn(track){
		if( track === undefined )
			return;
			
		track.volume = 0;
		track.play();
		$(track).stop(true,true).animate({volume:1},1000);
	}

//var intervall = setInterval(function(){
function enemyType(){
	var enemySelected,
		enemyClass = [
			["enemy01","zombie"],
			["enemy02","zombie"],
			["enemy03","zombie"],
			["enemy04","crimson"],
			["enemy05","hunter"]
		];
	
	if( player.score.kills >= 60 ){
		enemyMaxCount = ( eventtouch ) ? 4 : 6;
		enemySelected = randomise(4,0);
	}else if( player.score.kills >= 20 ){
		enemyMaxCount = ( eventtouch ) ? 3 : 5;
		enemySelected = randomise(3,0);
	}else{
		enemyMaxCount = ( eventtouch ) ? 2 : 4;
		enemySelected = randomise(2,0);
	}
	
	//EDIT enemyMaxCount = 1;
	
	return [enemyClass[enemySelected][0], enemyClass[enemySelected][1]];
}

function cheat(){
	player.health = 10000000000;
	magazine = 1000;
}

function enemyCreate(){
	if( gameover || pause )
		return;
	
	
	
	var maxH = $('.target-area').outerHeight(true) - 200;
	var maxW = $('.target-area').outerWidth(true) - 150;
	var positionX = Math.floor(Math.random() * (maxW - 30 + 1)) + 30;
	var positionY = "30%"; //250 + "px";//Math.floor(Math.random() * (maxH - 1 + 1)) + 1;
	var scale = 1;//1 - (Math.floor((((window.innerHeight - positionY)/2) / window.innerHeight) * 100) / 100);
	if( document.querySelectorAll('.target-area .enemy:not(.remove)').length >= enemyMaxCount )
		return;
	
	//console.log("ID: " + uid + " POS: "+ enemyPositionX + "%");
	var zindex,
		enemyPositionX = ((positionX / window.innerWidth) * 100 );
	if( enemyPositionX > 10 && enemyPositionX < 20 ){
		positionY = damageVariation(16) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".66";
		zindex = 2;
	}else if( enemyPositionX >= 20 && enemyPositionX < 35 ){
		positionY = damageVariation(8) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".55";
		zindex = 0;
	}else if( enemyPositionX >= 35 && enemyPositionX < 40 ){
	positionY = damageVariation(9) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".60";
		zindex = 0;
	}else if( enemyPositionX >= 30 && enemyPositionX < 45 ){
		positionY = damageVariation(11) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".65";
		zindex = 0;
	}else if( enemyPositionX >= 45 && enemyPositionX < 55 ){
		positionY = damageVariation(16) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".65";
		zindex = 1;
	}else if( enemyPositionX >= 55 && enemyPositionX < 65 ){
		positionY = damageVariation(19) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".75";
		zindex = 2;
	}else{
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		zindex = 3;
	}
	
	var enemyStructure = enemyType();
	
	var enemyAnimClass = [
		"enemyStagger01",
		"enemyStagger02",
		"enemyStagger03",
		"enemyStagger04"
	];
	
	var enemyObject = $(
		  '<div class="enemy ' + enemyStructure[0] + '" data-uid="' + uid + '" data-type="'+enemyStructure[1]+'" style="color:#fff;font-weight:bold;top:' + positionY + '; left:' + positionX + '; z-index:'+zindex+';transform:scale('+scale+') translate3d(0,0,0);-webkit-transform:scale('+scale+') translate3d(0,0,0);">'
		+     '<span class="attack-bar"></span>'
		+	  '<span class="hitbox head" data-event="head"></span>'
		+     '<span class="hitbox body" data-event="body"></span>'
		+     '<span class="hitbox arm left" data-event="arm"></span>'
		+     '<span class="hitbox arm right" data-event="arm"></span>'
		+     '<span class="hitbox leg left" data-event="leg"></span>'
		+     '<span class="hitbox leg right" data-event="leg"></span>'
		+ '</div>'
	);
	
	uid++;
	
		enemies.push(
			{
				"uid" : enemyObject.attr('data-uid'),
				"type" : enemyObject.attr('data-type'),
				"health" : damageVariation(damageTable[enemyStructure[1]].health),
				"attack" : damageTable[enemyStructure[1]].attackTime
			}
		);
	
	
	
	$('.target-area').prepend(enemyObject);
	}
	
	function damageVariation(damage){
		var min = damage - ((damage / 100) * randomise(6,1)),
			max = damage + ((damage / 100) * randomise(6,1));
			
		return Math.floor(randomise(max, min));
	}
	
	
function targetHit(evt){
	if( evt === undefined )
		return;
	
	var enemy = $(evt).closest(".enemy"),
		type  = enemy.data("type");
	
	
	
	if( $(evt).hasClass("body") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].body), "body");
		return;
	}else if( $(evt).hasClass("head") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].head), "head");
		return;
	}else if( $(evt).hasClass("arm") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].arm), "arm");
		return;
	}else if( $(evt).hasClass("leg") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].leg), "leg");
		return;
	}
}
	function targetUpdateEnemies(target, damage, area){
		//shakeBaby( target.get(0) );
		
		var enemiesTarget,
			enemiesCount = enemies.length;
			
			for( var i=0; i < enemiesCount; i++ ){
				if( enemies[i].uid == target.data('uid') ){
					enemiesTarget = enemies[i];
					enemies[i].health = enemies[i].health - damage;
					enemies[i].attack = ( enemies[i].attack >= damageTable[target.data('type')].attackTime ) ? damageTable[target.data('type')].attackTime : enemies[i].attack + 50;
					break;
				}
			}
		
		targetCheckHealth(enemies[i], area);
	}

	function targetCheckHealth(enemy, area){
		//console.log("enemy: ");
		//console.log(enemy);
		//console.log(" Health: " + enemy.health);
		
		
		if( area == "head" && enemy.health <= 0 ){
			scoreUpdate(damageTable.score.headKill, area);
		}else if( area == "head" ){
			scoreUpdate(damageTable.score[area], area);
		}else if( area == "body" ){
			scoreUpdate(damageTable.score[area], area);
		}else if( area == "arm" ){
			scoreUpdate(damageTable.score[area], area);
		}else if( area == "leg" ){
			scoreUpdate(damageTable.score[area], area);
		}
		
		if( enemy.health <= 0 ){
			enemyRemove(enemy);
			
			killsUpdate();
		}
	}
	
	function enemyRemove(enemy){
		if( enemy === undefined )
			return;
		
		var $enemy = $('[data-uid="'+enemy.uid+'"]');
		
		$enemy.find(".hitbox").remove();
		
		enemies.splice(enemies.indexOf(enemy),1);
		
		eventPercent(5, function(){healthItemCheck($enemy)});
		
		if( !eventtouch ){
			$enemy.fadeOut(250,function(){
				$(this).addClass('remove');
			});
		}else{
			$enemy.addClass('remove');
		}
	}
	
	function killsUpdate(){
		player.score.kills++;
	}
	
	function scoreUpdate(score, area){
		player.score.total += score;
		
		player.shots[area] += 1;
	}
	
	function scoreReset(){
		for (var key in player.score) {
			if (player.score.hasOwnProperty(key)) {
				player.score[key] = 0;
			}
		}
		
		for (var key in player.shots) {
			if (player.shots.hasOwnProperty(key)) {
				player.shots[key] = 0;
			}
		}
	}
	
	
	function eventPercent(chance, event){
		if( chance === undefined || event === undefined )
			return;
		
		var chanceCalc = randomise(100,0);
		
		if( chanceCalc > 0 && chanceCalc <= chance ){
			//console.log("Event");
			event();
		}
	}
	
	function healthItemCheck( enemy ){
		var healthItem = $('<div class="health-item" data-event="body"></div>').css({ "top":top, "left":left }),
			top = randomise(62, 57) + "%",
			left = randomise(75, 20) + "%";
		
		if( enemy.data("type") == "zombie" ){
			healthItem = $('<div class="health-item"></div>').data("event","herb").css({ "top":top, "left":left });
		}else{
			healthItem = $('<div class="health-item health-mixed"></div>').data("event","herbMixed").css({ "top":top, "left":left });
		}
		
		$('.target-area').append( healthItem );
	}
	
		function healthItemEvent(herb, amount){
			if( amount === undefined ){
				if( herb.data("event") == "herb" )
					amount = 600;
				else
					amount = 1050;
			}
			
			var currentHealth = player.health,
				newHealth = player.health + amount;
			
			if( newHealth >= player.maxHealth ){
				player.health = player.maxHealth;
			}else{
				player.health = newHealth;
			}
			
			// Plays healing sound.
			playAudio(trackListing.misc.healing);
			
			// Remove the herb from the game.
			$(herb).remove();
			
		}
		
		function playerHealth(amount, direction){
			var health = player.health;
			
		}
//});


function pageRatioRemove(){
	$('.game-container').css({
		"width"  : "auto",
		"height" : "auto"
	});
	
	$(window).off("resize", pageRatio);
}

function pageRatio(){
	$('.game-container').css({
		"width"  : window.innerWidth,
		"height" : window.innerHeight
	});
}

function backgroundRatio(width, height){
	
	if( width === undefined ){
		width = backgroundWidth;
		height = backgroundHeight;
	}else if( width == 0 ){
		width = 1280;
		height = 720;
	}else if( width !== undefined && height !== undefined ){
		backgroundWidth = width;
		backgroundHeight = height;
	}
	
	width = 1280;
	height = 720;
	
	var ratio = [window.innerWidth / width, window.innerHeight / height ];
	
	ratio = Math.min(ratio[0], ratio[1]);
	
	$('.game-align').css({
		"width" : Math.floor( width * ratio ) + "px",
		"height" : Math.floor( height * ratio ) + "px",
		"margin" : "0 auto"
	});
	
	if( eventtouch ){
		$('body').addClass("touch-check").removeClass("click-check");
	}else{
		$('body').removeClass("touch-check").addClass("click-check");
	}
	
}

function getImageSize( imageSrc ){

    //var imageSrc = document.getElementById('hello').style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];

    var image = new Image();
		image.src = imageSrc;
	
    backgroundWidth = image.width;
    backgroundHeight = image.height;
	
	//alert(backgroundWidth);
	
    //return [width,height];
}

function orientationChange(){
	if( window.innerHeight > window.innerWidth ){
		//$('.portrait').show();
			pauseGame();
		if( !gameover ){
		}
	}else{
		//$('.portrait').hide();
		if( !gameover ){
			unpauseGame();
		}
	}
}

function showInstructions(evt){
	evt.preventDefault();
	
	screenHide('gameover');
	screenShow('start');
}

$(document).ready(function(){
	pageRatio();
	$(window).on("resize focus", pageRatio);
	
	$(document).on("click",".restart", startGame);
	$(document).on("click",".instructions", showInstructions);
	
	$(document).on(eventstart,'.reload-button',reloadEvent);
	
	for( var i=0; i < magazine; i++ ){
		$('.shots .magazine').append('<span class="bulletcount-bullet"></span>');
	}
		
		orientationChange();
		init();
			
	$(window).on("touchmove", function(e){
		e.preventDefault();
	});
	$(window).on("resize", 	backgroundRatio);
	$(window).on("resize", orientationChange);
	
	
	
	
	$(document).on("click", '.audio', audioControls);
});


(function(){
	return;
		
    function ResidentClick(targetElement, options){
		var self = this;
		
		this.touch = ('ontouchstart' in document.documentElement) ? true : false,
		this.event = {
			click : ( self.touch ) ? 'tap' : 'click',
			start : ( self.touch ) ? 'touchstart' : 'mousedown',
			end   : ( self.touch ) ? 'touchend' : 'mouseup',
			move  : ( self.touch ) ? 'touchmove' : 'mousemove'
		},
		this.target = {
			touching : false,
			moving : false,
			starttouch : "",
			startX : "",
			startY : "",
			endtouch : "",
			endX : "",
			endY : ""
		},
		this.variable = {
			touching : false,
			currentPosition : "",
			pageCount : 1
		},
		this.html = {
			name : ".slide",
			elem : $(targetElement),
			page : $(targetElement).find('.slide-page'),
			rail : $(targetElement).find('.slide-rail'),
		},
		this.defaults = {
			current : 0,
			delay : 5000,
			transition: 500
		};
		
		this.options = $.extend({}, self.defaults, options);
		this.init();
    }
    ResidentClick.prototype = {
        init: function() {
            var self = this;
			
			this.bindEvents();
        },
        bindEvents: function() {
            var self = this;
			
			//$(document).on(self.event.move, self.interactMove.bind(self));
        }
    };
	
    $.fn.residentClick = function(options) {
        return this.each(function() {
            var sc = new ResidentClick(this, options);
        });
    };
})();