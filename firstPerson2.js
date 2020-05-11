var eventtouch = ('ontouchstart' in document.documentElement) ? true : false,
	eventclick = ( eventtouch ) ? 'tap' : 'click',
	eventstart = ( eventtouch ) ? 'touchstart' : 'mousedown',
	eventend = ( eventtouch ) ? 'touchend' : 'mouseup',
	eventmove = ( eventtouch ) ? 'touchmove' : 'mousemove';
	
	var trackListing = {
		"firearm" : {
			"shot" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/shot.mp3'),
			"empty" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/empty.mp3'),
			"miss" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/miss.mp3'),
			"reload" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/reload.mp3')
		},
		"enemy" : {
			"head" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/enemy_head_hit.mp3'),
			"headKill" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/enemy_head_kill.mp3'),
			"body" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/enemy_body.mp3')
		},
		"misc" : {
			"background" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/backgroundDining.mp3'),
			"backgroundDanger" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/backgroundDanger.mp3'),
			"gameover" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/death.mp3'),
			"healing" : ( eventtouch ) ? "" : new Audio('http://hogans.me.uk/ebuzzing/fps/sounds/healing.mp3')
		}
	};
		
	var sounds = (eventtouch) ? false : true;
	//sounds = false;
	
	var debug = false;
		

		var score = 0,
			loopStatus = false;
	shotsFired = 0,
	magazine = 15,
	magazineMax = 15,
	reloading = false;
	
	health = 10000;
	
	player = {
		"maxHealth" : ( debug ) ? 1000000000 : 6700,
		"health" : ( debug ) ? 1000000000 : 6700
	}
	
/* GAME SIZE */
var backgroundHeight,
	backgroundWidth;

var enemies = [],
	enemiesPain = [
		"Ouch",
		"Urgh!",
		"Hiss~",
		"Hnngh",
		"FFFUUU--"
	],
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
		"zombie" : {
			"health" : 400,
			"multiplier" : .67,
			"head" : 400,
			"body" : 120,
			"arm"  : 35,
			"leg"  : 60,
			"attackTime" : 2000,
			"attackDamage" : 230
		},
		"crimson" : {
			"health" : 700,
			"head" : 500,
			"body" : 140,
			"arm"  : 45,
			"leg"  : 70,
			"attackTime" : 1500,
			"attackDamage" : 330
		},
		"hunter" : {
			"health" : 900,
			"head" : 600,
			"body" : 150,
			"arm"  : 65,
			"leg"  : 80,
			"attackTime" : 1650,
			"attackDamage" : 430
		}
	};
	
	var gameover = false;
	var pause = false;
	
	
	//var enemyTimer = Math.floor(Math.random() * (2500 - 250 + 1)) + 250;

	function randomise(max,min){
		var value = Math.floor(Math.random() * (max - min + 1)) + min;
		
		return value;
	}

function init(){

$('<img/>').attr('src', 'http://hogans.me.uk/ebuzzing/fps/css/img/bg.jpg').on('load',function(){
			var image = $(this)[0],
				height = $(this)[0].height,
				width = $(this)[0].width;
			
			backgroundWidth = image.width;
			backgroundHeight = image.height;
			
			
			$(this).remove(); // prevent memory leaks as @benweet suggested
backgroundRatio();

	$('.screen-start').show();
	$('.loading').hide();
});
}

function startGame(){
$('.screen-start').hide();
beginInterval();


if( gameover == true ){
	score = 0;
	gameover = false;
	$('.gameover').remove();
}

playAudio(trackListing.misc.background);
$(trackListing.misc.background).animate({volume:.8},250);
trackListing.misc.background.loop = true;

}
	

	function unpauseGame(){
		setTimeout(function(){
			if( !gameover ){
				pause = false;
			}
		},1500);
	}
	
	function pauseGame(){
		if( !gameover ){
			pause = true;
		}
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
		//console.log("Loop Int: " + rand);
	}
	
	var p = 0;
	
	function beginInterval(){
		
		if( !loopStatus )
			loop();
		
		window.globalCounter = setInterval(function(){
			//console.log("INTERVAL");
			
			if( pause )
				return;
			
			$('.interval').html(p++);
			
			if( pause == true ){
				clearInterval(globalCounter);
				return;
			}
			
			
			//enemyTimer = Math.floor(Math.random() * (2500 - 250 + 1)) + 250;
			//console.log(enemyTimer);
			for( var i=0; i < enemies.length; i++ ){
				if( enemies[i].attack <= 0 ){
					
					for( var u=0; u < enemies.length; u++ ){
						if( enemies[i].uid == enemies[u].uid ){
							
					
							//console.log("ATTACK");
							//$('.bite').fadeIn(0);
							$('.bite').show();
							player.health = player.health - damageVariation(damageTable[enemies[u].type].attackDamage);
							//$('.health').html(player.health);
							//console.log("HEALTH : " + player.health);
							enemies[u].attack = damageTable[enemies[u].type].attackTime;
							setTimeout(function(){
								//$('.bite').stop(true,true).fadeOut(250);
								$('.bite').hide();
							},500);
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
				var percent = (enemies[i].attack / damageTable.zombie.attackTime ) * 100;
				var id = enemies[i].uid;
				//$('.enemy[data-uid="'+id+'"]').find('.attackin').html(enemies[i].attack + "ms");
				$('.enemy[data-uid="'+id+'"]').find('.attackin').css({
					"display":"block",
					"text-align":"center",
					"background":"rgba(255,0,0,.2)",
					"width":percent+"%",
					"height":"1em"
				});
			}
		}, 20);
	}


function gameOver(){
	gameover = true;
	loopStatus = false;
	$(trackListing.misc.background).animate({volume:0},250);
	playAudio(trackListing.misc.gameover);
	clearTimeout(window.globalCounter);
	$('body').append(
		  '<div class="gameover">'
		+	'<div class="gameover-copy">'
		+		'<h1 style="font-size:50px;color:#fff;">You scored: '+score+' kills</h1>'
		+		'<a href="#" class="restart" style="color:#fff;font-size:50px;">Retry</a>'
		+	'</div>'
		+ '</div>');
	
	$('.gameover').fadeIn(500, function(){
		$('.health-item').remove();
		$('.enemy').remove();
		enemies = [];
		magazine = magazineMax;
		$('.shots .magazine').css({
			left : 0
		});
		player.health = player.maxHealth;
	});
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
		if( evt !== undefined && evt.type == eventstart )
			evt.preventDefault();
	
		if( magazine >= magazineMax || pause == true )
			return;
		
		
		
		if( evt.keyCode == 67 ){
			cheat();
		}
		
		if( (evt.keyCode == 82 || evt.type == eventstart ) && reloading == false ){
			reloading = true;
			playAudio(trackListing.firearm.reload);
			$('.player-message').html("RELOADING...").fadeIn(0);
			
		$('.shots .magazine').animate({
			left : 0
		}, 750, "linear", function(){
			//console.log("reloaded");
			magazine = magazineMax;
			reloading = false;
			$('.player-message').hide();
			$('.firearm').removeClass("empty");
		});
		
		return;
			
		var reloadTime = (12 - $('.bulletcount-bullet').length) * 150;
		//console.log(reloadTime);	
			
			var bulletInsert = setInterval(function(){
				if( $('.bulletcount-bullet').length >= 12 )
					return;
					
				$('.shots').append('<span class="bulletcount-bullet"></span>');
				magazine++;
			}, 150);
			
			setTimeout(function(){
				reloading = false;
				
				clearInterval(bulletInsert);
				$('.player-message').hide();
			}, reloadTime + 50);
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
	
	if( magazine <= 0 && reloading == false ){
		playAudio(trackListing.firearm.empty);
		reloadPrompt();
		return;
	}else if( reloading == true ){
		return;
	}else{
		shotsFired++;
	}
	
	//if( $('.bulletcount-bullet').length >= 1 )
	//	$('.shots .bulletcount-bullet').get( 0 ).remove();
		
	//$('.shots .magazine')[0].style.left = $('.shots .magazine')[0].offsetLeft + $('.bulletcount-bullet')[0].offsetWidth + "px";
	$('.shots .magazine')[0].style.left = +$('.shots .magazine')[0].style.left.replace("px","") + $('.bulletcount-bullet')[0].offsetWidth +"px";
	
	$('.firearm').addClass("fire");
	setTimeout(function(){
		$('.firearm').removeClass("fire");
	},50);
	
	if( $(evt.target).hasClass("head") ){
		
		playAudio(trackListing.enemy.head);
	}else if( !$(evt.target).hasClass("body") && !$(evt.target).hasClass("arm") && !$(evt.target).hasClass("leg") ){
		playAudio(trackListing.firearm.miss);
	}else{
		playAudio(trackListing.enemy.body);
	}
	
	playAudio(trackListing.firearm.shot);
	
	//console.log("fire");
	magazine--;
	
	if( magazine <= 0 )
		$('.firearm').addClass("empty");
	//$('.shots').html("Shots remaining " + magazine);
	
	var clientX = evt.originalEvent.clientX;
	var clientY = evt.originalEvent.clientY;
	
	clientX = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientX - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetLeft) : (evt.originalEvent.x - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetLeft) || (evt.originalEvent.clientX - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetLeft);
	clientY = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientY - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetTop) : (evt.originalEvent.y - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetTop) || (evt.originalEvent.clientY - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetTop);
	
	//var scale = 
	var scale = 1 - (Math.floor((((window.innerHeight - clientY)) / window.innerHeight) * 100) / 100);
	var rand = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
	var miss = $('<div class="bullet-hole" style="top:' + clientY + 'px; left:' + clientX + 'px; transform:scale('+scale+');"></div>');
	var hit = $('<div class="blood-hole blood0' + rand + '" style="top:' + clientY + 'px; left:' + clientX + 'px;"></div>');
	
	
	if( $(evt.target).hasClass("hitbox") ){
		targetHit($(evt.target));
		
		
		$('.target-area').prepend(hit);
		
		//setTimeout(function(){
			
			if( eventtouch ){
				setTimeout(function(){
					$(hit).remove();
				},250);
			}else{
				$(hit).fadeOut(1000,function(){
					$(hit).remove();
				})
			}
		//},2000);
	}else if( $(evt.target).hasClass("health-item") ){
		healthItemEvent($(evt.target));
	}else{
		$('.target-area').prepend(miss);
		
		if( eventtouch ){
			setTimeout(function(){
				$(miss).remove();
			},250);
		}else{
			setTimeout(function(){
				$(miss).fadeOut(1000,function(){
					$(miss).remove();
				})
			},1000);
		}
	}
});

function reloadPrompt(){
	if( reloading == false ){
		$('.player-message').html('Reload!').fadeIn(0);
	}
}

$(document).on(eventmove,".target-area",function(evt){
	if( evt === undefined )
		return;
		
	var clientX = evt.originalEvent.clientX;
	var clientY = evt.originalEvent.clientY;
	
	clientX = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientX - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetLeft) : (evt.originalEvent.x - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetLeft) || (evt.originalEvent.clientX - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetLeft);
	clientY = ( eventtouch ) ? (evt.originalEvent.targetTouches[0].clientY - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetTop) : (evt.originalEvent.y - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetTop) || (evt.originalEvent.clientY - evt.originalEvent.currentTarget.querySelectorAll(".target-area")[0].offsetTop);
	
	
	var scale = 1 - (Math.floor((((window.innerHeight - clientY)) / window.innerHeight) * 100) / 100);
	
	var thirds = $('.target-area').outerWidth(true) / 3;
	
	//if( clientX < thirds )
	//	$('.firearm').attr("data-position","left");
	//else if( clientX > thirds*2 )
	//	$('.firearm').attr("data-position","right");
	//else
		$('.firearm').attr("data-position","center");
	
	$('.firearm').css({
		//'top':clientY,
		'left':clientX,
		//'transform' : 'scale(' + scale + ')'
	});
});

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

	function cancelAudio(){
		sounds = false;
		$(trackListing.misc.background).animate({volume:0},1000);
	}
	
	function fadeInAudio(){
		sounds = true;
		trackListing.misc.background.volume = 0;
		trackListing.misc.background.play();
		$(trackListing.misc.background).animate({volume:1},1000);
	}
	
	function audioFadeOut(track){
		if( track === undefined )
			return;
		
		$(track).animate({volume:0},1000);
	}
	
	function audioFadeIn(track){
		if( track === undefined )
			return;
			
		track.volume = 0;
		track.play();
		$(track).animate({volume:1},1000);
	}

//var intervall = setInterval(function(){
function enemyType(){
	var enemySelected,
		enemyClass = [
			["enemy01","zombie"],
			["enemy02","zombie"],
			["enemy04","zombie"],
			["enemy05","crimson"],
			["enemy03","hunter"]
		];
	
	if( score >= 60 ){
		enemyMaxCount = ( eventtouch ) ? 4 : 6;
		enemySelected = randomise(4,0);
	}else if( score >= 20 ){
		enemyMaxCount = ( eventtouch ) ? 3 : 5;
		enemySelected = randomise(3,0);
	}else{
		enemyMaxCount = ( eventtouch ) ? 2 : 4;
		enemySelected = randomise(2,0);
	}
	
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
	if( $('.enemy').length >= enemyMaxCount )
		return;
	
	//console.log("ID: " + uid + " POS: "+ ((positionX / window.innerWidth) * 100 ) + "%");
	var zindex;
	if( ((positionX / window.innerWidth) * 100 ) > 10 && ((positionX / window.innerWidth) * 100 ) < 20 ){
		positionY = damageVariation(16) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".65";
		zindex = 2;
	}else if( ((positionX / window.innerWidth) * 100 ) >= 20 && ((positionX / window.innerWidth) * 100 ) < 45 ){
		positionY = damageVariation(11) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".55";
		zindex = 0;
	}else if( ((positionX / window.innerWidth) * 100 ) >= 45 && ((positionX / window.innerWidth) * 100 ) < 55 ){
		positionY = damageVariation(17) + "%";
		positionX = (positionX / window.innerWidth ) * 100 + "%";
		scale = ".65";
		zindex = 1;
	}else if( ((positionX / window.innerWidth) * 100 ) >= 55 && ((positionX / window.innerWidth) * 100 ) < 65 ){
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
		//  '<div class="enemy ' + enemyStructure[0] + ' ' + enemyAnimClass[randomise(1,0)] + '" data-uid="' + uid + '" data-type="'+enemyStructure[1]+'" style="color:#fff;font-weight:bold;top:' + positionY + '; left:' + positionX + '; transform:scale('+scale+');">'
		  '<div class="enemy ' + enemyStructure[0] + '" data-uid="' + uid + '" data-type="'+enemyStructure[1]+'" style="color:#fff;font-weight:bold;top:' + positionY + '; left:' + positionX + '; z-index:'+zindex+';transform:scale('+scale+') translate3d(0,0,0);-webkit-transform:scale('+scale+') translate3d(0,0,0);">'
		+     '<span class="attackin" style="position:absolute;top:0;left:0;"></span>'
		+	  '<span class="hitbox head" data-event="head"></span>'
		+     '<span class="hitbox body" data-event="body"></span>'
		+     '<span class="hitbox arm left" data-event="arm"></span>'
		+     '<span class="hitbox arm right" data-event="arm"></span>'
		+     '<span class="hitbox leg left" data-event="leg"></span>'
		+     '<span class="hitbox leg right" data-event="leg"></span>'
		+ '</div>'
	);
	
	uid++;
	
	//for( var i=0; i < $('.e nemy').length; i++ ){
		enemies.push(
			{
				"uid" : enemyObject.attr('data-uid'),
				"type" : enemyObject.attr('data-type'),
				"health" : damageVariation(damageTable[enemyStructure[1]].health),
				"attack" : damageTable[enemyStructure[1]].attackTime
			}
		);
	//}
	
	// ADD BACK
	//enemyAttack(enemyObject);
	
	
	
	$('.target-area').prepend(enemyObject);
	}
	
	function damageVariation(damage){
		var min = damage - ((damage / 100) * randomise(6,1)),
			max = damage + ((damage / 100) * randomise(6,1));
			
		//console.log(randomise(damage, variation));
		return Math.floor(randomise(max, min));
	}
//},2500);

//setTimeout(function(){clearInterval(intervall);},1600);

//$(document).on("click",".hitbox",function(evt){
function targetHit(evt){
	if( evt === undefined )
		return;
	
	var enemy = $(evt).closest(".enemy"),
		type  = enemy.data("type");
	
	
	
	if( $(evt).hasClass("body") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].body));
		return;
	}else if( $(evt).hasClass("head") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].head));
		return;
	}else if( $(evt).hasClass("arm") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].arm));
		return;
	}else if( $(evt).hasClass("leg") ){
		targetUpdateEnemies(enemy, damageVariation(damageTable[type].leg));
		return;
	}
}
	function targetUpdateEnemies(target, damage){
		shakeBaby( target.get(0) );
		
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
		
		targetCheckHealth(enemies[i]);
	}

	function targetCheckHealth(enemy){
		//console.log("enemy: ");
		//console.log(enemy);
		//console.log(" Health: " + enemy.health);
		var $enemy = $('[data-uid="'+enemy.uid+'"]')
		if( enemy.health <= 0 ){
			score++;
			
			$enemy.find(".hitbox").remove();
			
			enemies.splice(enemies.indexOf(enemy),1);
			
			eventPercent(4, function(){healthItemCheck($enemy)});
			
			$enemy.fadeOut(250,function(){
				$(this).remove();
			});
		}else{
			//$enemy.prepend(
			//	enemiesPain[Math.floor(Math.random() * (enemiesPain.length - 0 + 1)) + 0]
			//);
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
		var pos = enemy.position(),
			offsetTop = $('.target-area').height() - $('.target-area').offset().top,
			offsetLeft = $('.target-area').width() - $('.target-area').offset().left,
			top = Math.floor((pos.top / offsetTop ) * 100) + "%",
			left = Math.floor((pos.left / offsetLeft ) * 100) + "%",
			healthItem = $('<div class="health-item" data-event="body"></div>').css({ "top":top, "left":left });
		
		top = randomise(58, 53) + "%";
		left = randomise(75, 20) + "%";
		
		if( enemy.data("type") == "zombie" ){
			healthItem = $('<div class="health-item"></div>').data("event","herb").css({ "top":top, "left":left });
		}else{
			healthItem = $('<div class="health-item health-mixed"></div>').data("event","herbMixed").css({ "top":top, "left":left });
		}
		
		//console.warn("healthItemCheck, temp removed.");
		$('.target-area').append( healthItem );
	}
	
		function healthItemEvent(herb, amount){
			if( amount === undefined ){
				console.warn("Healing value not set, check your damn code!");
				if( herb.data("event") == "herb" )
					amount = 500;
				else
					amount = 950;
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
			
			//if( 
		}
//});

var _reps = {};
function shakeBaby( ele ){

	//_reps[ ele ] = 100;
	_reps[ ele ] = 1;
	theShaker( ele );

}

function theShaker( ele ){

	if( _reps[ ele ] < 0 ) return;
	
	_reps[ ele ]--;
	
	//ele.style.transform = 'rotate(' + ( Math.round( Math.random() * 30 ) - 15 ) + 'deg)';
	
	
	// TEMP REMOVED
	//ele.style.transform = 'rotate(' + ( Math.round( Math.random() * 10 ) - 5 ) + 'deg)';
	//ele.style.webkitTransform = 'rotate(' + ( Math.round( Math.random() * 10 ) - 5 ) + 'deg)';
	
	setTimeout( theShaker , 20 , ele );

}

function backgroundRatio(){
	// if background aspect ratio is undefined, check here.
	//if( backgroundWidth === undefined ){
		
	//	getImageSize("http://hogans.me.uk/ebuzzing/fps/css/img/bg.jpg");
	//}
	//console.log("BG RATIO");
	
	
			alert(window.innerWidth + " " + window.orientation);
	
	var ratio = [window.innerWidth / backgroundWidth, window.innerHeight / backgroundHeight ];
	
	ratio = Math.min(ratio[0], ratio[1]);
	
	$('.target-area').css({
		"width" : Math.floor( backgroundWidth * ratio ) + "px",
		"height" : Math.floor( backgroundHeight * ratio ) + "px",
		"margin" : "0 auto"
	});
	
	
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
	setTimeout(function(){
	//alert("Height: " + window.innerHeight + ", Width: " + window.innerWidth);
	if( window.innerHeight > window.innerWidth ){
		$('.portrait').show();
		if( !gameover ){
			pauseGame();
		}
	}else{
		$('.portrait').hide();
		if( !gameover ){
			unpauseGame();
		}
	}
	
	//alert("Width: " + window.innerWidth + ", Height: " + window.innerHeight + ", Orientation: " + window.orientation );
	},300);
}

function preloadGraphics(){
	var graphics = [
		"http://hogans.me.uk/ebuzzing/fps/css/img/enemy01.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/enemy02.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/enemy03.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/enemy04.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/enemy05.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/blood01.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/blood02.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/blood03.png",
		"http://hogans.me.uk/ebuzzing/fps/css/img/blood04.png"
	];
	
	for( var i=0; i<graphics.length; i++ ){
		var image = new Image();
			image.src = graphics[i];
	}
}


$(document).ready(function(){
	preloadGraphics();
	
	$(document).on("click",".restart", function(evt){ evt.preventDefault(); startGame(); });
	
	$(document).on(eventstart,'.reload-button',reloadEvent);
	
	for( var i=0; i < magazine; i++ ){
		$('.shots .magazine').append('<span class="bulletcount-bullet"></span>');
	}
		
		orientationChange();
		backgroundRatio();		
		init();
			
	$(window).on("touchmove", 	function(e){
	e.preventDefault();
	});
	$(window).on("resize", 	backgroundRatio);
	$(window).on("orientationchange", orientationChange);
});