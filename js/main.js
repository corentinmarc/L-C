$(document).ready(function(){
	var canvas = document.getElementsByTagName('canvas')[0];					   
	var ctx = canvas.getContext('2d');
	
	//Loading information
	$('footer').append("<div id='li'></div>");
	$('#li').css({"position": "absolute","top": 10,"width": "100%","text-align": 'center',"height": 40,"right": 0,"font-family": "'Calibri', Arial, sans-serif","color": "#fff"});
	
	function LoadingInformation(){
		this.totalImg=46;
		this.imgLoaded=0;
		this.finishTimeZoom1=0;
		this.finishTimeZoom2=0;
		this.finishTime=0;
		this.startTime=0;
		this.percentage=0;
		
		this.init = function() {
			this.startTime = new Date().getTime();
		}
		this.getLoadingTimeZoom1 = function() {
			this.finishTimeZoom1 = new Date().getTime();
		}
		this.getLoadingTimeZoom2 = function() {
			this.finishTimeZoom2 = new Date().getTime();
		}
		this.getLoadingTime = function() {
			this.finishTime = new Date().getTime();
			$('#li').html("First Level Zoom Loaded in "+(this.finishTimeZoom1-this.startTime)/1000+
				"s __________ Second Level Zoom Loaded in "+(this.finishTimeZoom2-this.startTime)/1000+
				"s __________ Totally Loaded in "+(this.finishTime-this.startTime)/1000+"s");
		}
		this.incrementImgLoad = function() {
			this.imgLoaded++;
			this.percentage = Math.round(this.imgLoaded/this.totalImg*100);
			if(this.imgLoaded<1)
				$('#li').html("Loading... "+this.percentage+"%");
			else if(this.imgLoaded<10)
				$('#li').html("First Level Zoom Loaded in "+(this.finishTimeZoom1-this.startTime)/1000+
					"s __________Loading... "+this.percentage+"%");
			else if(this.imgLoaded<46)
				$('#li').html("First Level Zoom Loaded in "+(this.finishTimeZoom1-this.startTime)/1000+
					"s __________ Second Level Zoom Loaded in "+(this.finishTimeZoom2-this.startTime)/1000+
				"s __________Loading... "+this.percentage+"%");
			if(this.imgLoaded==46) this.getLoadingTime();
		}
	}
	var li = new LoadingInformation();
	li.init();
	
	//Frame Counter
	$('header').append("<div id='fc'></div>");
	$('#fc').css({"position": "absolute","top": 0,"width": 100,"height": 40,"right": 0,"font-family": "'Calibri', Arial, sans-serif","color": "#fff"});
		
	function FrameCounter(){
		this.time=0;
		this.oldTime=0;
		this.getFPS = function() {
			var fps = Math.round(1000/(this.time-this.oldTime));
			$('#fc').html("FPS : " + fps);
			return fps;
		}
	}
	var fc = new FrameCounter();
	
	function Viewport(){
		this.mosaicReelWidth=13500;
		this.mosaicReelHeight=9000;
		this.widthTuileZoom2=4500;
		this.heightTuileZoom2=3000;
		this.widthTuileZoom3=2250;
		this.heightTuileZoom3=1500;
		this.thumbSize=150;
		
		this.imgLoadStatus=0;//1 pour imgZoom1 loaded, 2 pour imgZoom2[] loaded, 3 pour imgZoom3[] loaded
		this.imgZoomStatus=0;
		this.mapLogoEnabled=false;
		this.mapRender=true;
		this.redrawActive=true;
		this.thumbZoomRender=true;
		this.thumbFocusedSrc=0;
		this.thumbFocusedNumber=0;
		this.oldThumbFocusedNumber=0
		this.thumbFocusedOffsetX=0; // Offset de l'image en X survolée dans la dalle 'thumbfocusedsrc'
		this.thumbFocusedOffsetY=0; // Offset de l'image en Y survolée dans la dalle 'thumbfocusedsrc'
		this.thumbHoverOnThumbRatioX=0; // Ratio de la position de la souris sur la vignette en survol en X
		this.thumbHoverOnThumbRatioY=0; // Ratio de la position de la souris sur la vignette en survol en Y
		
		this.centerX = 0;
		this.centerY = 0;
		this.zoom = 1;
		this.zoomCorrectionFactor = 1/6;
		this.zoomCurrentFactor = 1;
		this.borderLeft=0;
		this.borderTop=0;
		this.Xmin=0;
		this.Xmax=0;
		this.Ymin=0;
		this.Ymax=0;
		this.zoomLimited=false;
		
		this.mouseX=0;
		this.mouseY=0;
		this.mapHover=false;
		
		
		this.updateValues = function(){
			//console.log("update values");

			// Mise à jour du niveau de zoom ( 1, 2 ou 3)
			if(this.zoom>3 && this.imgLoadStatus==3 &&
				(canvas.height/vp.zoom/vp.zoomCorrectionFactor)<(1*this.heightTuileZoom3) && 
				(canvas.width/vp.zoom/vp.zoomCorrectionFactor)<(2*this.widthTuileZoom3) ){ // On ne veut pas dessiner plus de 2 lignes et 3 colonnes de dalles car lag
					this.imgZoomStatus=3;
					this.zoomCurrentFactor=6;
			}
			else{ 
				if(this.zoom>1 && this.imgLoadStatus>=2 &&
					(canvas.height/vp.zoom/vp.zoomCorrectionFactor)<(1*this.heightTuileZoom2) && 
					(canvas.width/vp.zoom/vp.zoomCorrectionFactor)<(2*this.widthTuileZoom2) ){ // On ne veut pas dessiner plus de 2 lignes et 3 colonnes de dalles car lag
						this.imgZoomStatus=2;
						this.zoomCurrentFactor=3;
				}
				else{
					this.imgZoomStatus=1;
					this.zoomCurrentFactor=1;
				}
			}
			
			this.Xmax=(vp.centerX*vp.mosaicReelWidth+(canvas.width/2/vp.zoom/vp.zoomCorrectionFactor));
			this.Xmin=(vp.centerX*vp.mosaicReelWidth-(canvas.width/2/vp.zoom/vp.zoomCorrectionFactor));
			this.Ymax=(vp.centerY*vp.mosaicReelHeight+(canvas.height/2/vp.zoom/vp.zoomCorrectionFactor));
			this.Ymin=(vp.centerY*vp.mosaicReelHeight-(canvas.height/2/vp.zoom/vp.zoomCorrectionFactor));
			
			// Mise à jour des position du canvas
			this.borderLeft = -(this.Xmin*this.zoom*this.zoomCorrectionFactor);
			this.borderTop = -(this.Ymin*this.zoom*this.zoomCorrectionFactor);	
			
			// Mise a jour du flag de rendu de map
			if(this.Xmin < 0 && //limite gauche
				this.Ymin < 0 && //limite haute
				this.Xmax > this.mosaicReelWidth && // limite droite
				this.Ymax > this.mosaicReelHeight) //limite basse
				{
					//console.log("non mapRender");
					this.mapRender=false;
				}
			else {
				//console.log("mapRender");
				this.mapRender=true;
			}
		}
	}
	var vp = new Viewport();
	
	// definit les fonction de transformation
	trackTransforms(ctx);	
	
	// represente le niveau de dezoom maximum
	var scaleRatioMax = 0.12;
	// represente le niveau de zoom maximum
	var scaleRatioMin = 12;
	var scaleRatioFullScreen;

	//represente le niveau de zoom actuel ( coeff a et d )
	var scaleEffective = 1;
	// represente la translation en x de l'image ( coeff e )
	var Tx = 0;
	// represente la translation en y de l'image ( coeff f )
	var Ty = 0;

	//Création des objets Image
	var imgZoom2Loaded =0;
	var imgZoom3Loaded =0;
	createImageObjects();
	
	// Chargement 1ere image
	loadImgs(1);
	
	// Lancement du chargement des parties d'image
	
	
	// Fonction permettant de charger les images des différents niveaux de zoom
	function loadImgs(imgZoom){
		switch(imgZoom){
			case 1:
				console.log("Loading imgZoom1 initialize");
				imgZoom1.src = 'img/mosaic/mosaicZoom1.jpg';
				imgZoom1.onload = function(){
					//console.log("imgZoom1 loaded");
					imgLoaded(1);
					li.incrementImgLoad();
				}
				break;
			case 2:
				console.log("Loading imgZoom2 initialize");
				for( i=0; i<9; i++ ){
					imgZoom2[i].src = 'img/mosaic/mosaicZoom2_0' + (i+1).toString() + '.jpg';
					//console.log(imgZoom2[i].src);
					
					imgZoom2[i].onload = function(){
						//console.log("imgZoom2[" + imgZoom2.indexOf(this) + "] loaded");
						imgLoaded(2);
						li.incrementImgLoad();
					}
				}
				break;
			case 3:
				console.log("Loading imgZoom3 initialize");
				for( i=0; i<36; i++ ){
					if(i < 9) imgZoom3[i].src = 'img/mosaic/mosaicZoom3_0' + (i+1).toString() + '.jpg';
					else imgZoom3[i].src = 'img/mosaic/mosaicZoom3_' + (i+1).toString() + '.jpg';
					//console.log(imgZoom3[i].src);
					
					imgZoom3[i].onload = function(){
						//console.log("imgZoom3[" + imgZoom3.indexOf(this) + "] loaded");
						imgLoaded(3);
						li.incrementImgLoad();
					}
				}
				break;
			case 'logoMap':
				console.log("loading imgLogoMap initialize");
				imgMapLogo.src='img/L&C_map_logo.png'
				imgMapLogo.onload = function(){
					vp.mapLogoEnabled=true;
				}
		}
	}
	
	// Fonction declenchée à chaque partie d'image chargée
	function imgLoaded(imgZoom){
		switch(imgZoom){
			case 1:
				vp.imgLoadStatus=1;
				li.getLoadingTimeZoom1();
			
				// initialisation du canvas html
				initCanvas(); 
				// Lancement de la boucle d'animation
				animloop();
				
				// Chargement du 2eme niveau de zoom
				loadImgs(2);
				// Chargement du logo pour la map
				loadImgs('logoMap');
				break;
			case 2:
				imgZoom2Loaded++;
				if(imgZoom2Loaded == 9){
					vp.imgLoadStatus=2;
					li.getLoadingTimeZoom2();

					// Niveau de zoom 2 chargé donc lancement du niveau 3
					loadImgs(3);
				}
			case 3:
				imgZoom3Loaded++;
				if(imgZoom3Loaded == 36){
					vp.imgLoadStatus=3;
				}
		}
	}
	
	// Fonction d'effacement
	function clear(){
		ctx.save();
		ctx.setTransform(1,0,0,1,0,0);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.restore();
	}
	
	// Fonction de redessin
	function redraw(){
		if(vp.redrawActive){
			//console.log("redrawing");
			
			// Clear the entire canvas
			clear();
			verifTransform();
			applyViewport();
			
			// Dessin si niveau de zoom de 1
			if(vp.imgZoomStatus==1)
				ctx.drawImage(imgZoom1,0,0);
				
			// Dessin si niveau de zoom de 2
			if(vp.imgZoomStatus==2){
				console.log("Zoom Level 2");
				for(i=0; i<3; i++){
					for(j=0; j<3; j++){
						if( vp.Xmin<(j+1)*vp.widthTuileZoom2 && vp.Xmax>j*vp.widthTuileZoom2 &&  // Test tuile horizontale
							vp.Ymin<(i+1)*vp.heightTuileZoom2 && vp.Ymax>i*vp.heightTuileZoom2 ){ // Test tuile verticale
								//console.log(i*3+j);
								ctx.drawImage(imgZoom2[i*3+j], j*2250, i*1500);
							}
					}
				}
			}
			
			// Dessin si niveau de zoom de 3
			if(vp.imgZoomStatus==3){
				console.log("Zoom Level 3");
				for(i=0; i<6; i++){
					for(j=0; j<6; j++){
						if( vp.Xmin<(j+1)*vp.widthTuileZoom3 && vp.Xmax>j*vp.widthTuileZoom3 &&  // Test tuile horizontale
							vp.Ymin<(i+1)*vp.heightTuileZoom3 && vp.Ymax>i*vp.heightTuileZoom3 ){ // Test tuile verticale
								//console.log(i*6+j);
								ctx.drawImage(imgZoom3[i*6+j], j*2250, i*1500);
							}
					}
				}
			}
			
			// Condition de rendu de la vignette Zoom
			if(vp.thumbZoomRender && !vp.mapHover)
				drawThumbZoom();	
			
			// Condition de rendu de la map
			if(vp.mapLogoEnabled && vp.mapRender)
				drawMap();
				
		}
	}
	
	// Fonction dessinant la map
	function drawMap(){
		mapWidth = 0.15*canvas.width;
		mapHeight = 2/3 * mapWidth;
		mapRectWidth=canvas.width/vp.mosaicReelWidth/(vp.zoom*vp.zoomCorrectionFactor) * mapWidth;
		mapRectHeight=mapRectWidth*(canvas.height/canvas.width);
		//console.log(mapRectWidth +"  /  " + mapRectHeight);
		
		ctx.save();
			// Dessin de la map
			ctx.setTransform(1,0,0,1,0,0);
			ctx.beginPath();
		    ctx.rect(	canvas.width - mapWidth - 10, 
		    			canvas.height - mapHeight - 10, 
		    			mapWidth, 
		    			mapHeight
		    );
		    // Remplissage + Ombre
		    ctx.fillStyle = 'black';
		    ctx.globalAlpha=0.7;
		    ctx.fill();
		    // Contour
		    ctx.lineWidth = 1;
		    ctx.strokeStyle = 'black';
		    ctx.globalAlpha=1;
		    ctx.stroke();
		    
		    //Dessin logo L&C
		    ctx.drawImage(imgMapLogo,
		    			canvas.width - mapWidth - 10, 
		    			canvas.height - mapHeight - 10, 
		    			mapWidth, 
		    			mapHeight
		    );
		    
		    //Dessin du rectangle de position
		    ctx.beginPath();
		    ctx.rect(	canvas.width - mapWidth - 10 + (vp.centerX*mapWidth) - mapRectWidth/2, 
		    			canvas.height - mapHeight - 10 + (vp.centerY*mapHeight) - mapRectHeight/2, 
		    			mapRectWidth, 
		    			mapRectHeight
		    );
		    // Remplissage + Ombre
		    ctx.fillStyle = 'white';
		    ctx.globalAlpha=0.5;
		    ctx.fill();
		    // Contour
		    ctx.lineWidth = 1;
		    ctx.strokeStyle = 'black';
		    ctx.globalAlpha=1;
		    ctx.stroke();
		    
	    ctx.restore();
	}
	
	
	durationAnimMax=0.15;
	delayStartAnim=0.1;
	durationAnimCurrent=0;
	timeStartAnim = 0;
	timeCurrent=0;
	function drawThumbZoom(){
		
		if(vp.thumbFocusedSrc!=0){
			
			// On remet l'anim à zero si on change de thumb survolée
			if(vp.thumbFocusedNumber!=vp.oldThumbFocusedNumber){
				//console.log("changement de thumb survolée");
				timeStartAnim = new Date().getTime();
			} 
			timeCurrent=new Date().getTime();
			
			// Dessin du thumbZoom
			ctx.save();
				
				ctx.setTransform(1,0,0,1,0,0);
				
				// Definition de la taille finale du zoom
				var thumbSizeMax = 150*vp.zoomCorrectionFactor*vp.zoom*1.5;
				if(thumbSizeMax<30) thumbSizeMax=0;
				else if(thumbSizeMax<100) thumbSizeMax=100;
				
				// Definition de la taille initiale du zoom
				var thumbSizeMin = vp.thumbSize*vp.zoom*vp.zoomCorrectionFactor;
				if(thumbSizeMax<30) thumbSizeMin=0;
				
				// Progression du timer de l'anim'
				durationAnimCurrent=(timeCurrent-timeStartAnim)/1000;
				if(durationAnimCurrent>durationAnimMax+delayStartAnim) durationAnimCurrent=durationAnimMax+delayStartAnim; // Stop l'anim
				if(durationAnimCurrent<delayStartAnim) durationAnimCurrent=0; // Delay
				
				// Mise a jour de la taille de la vignette en fonction du timer de l'anim et de la taille initiale (thumbSizeMin) et finale (thumbSizeMax)
				var thumbSize = thumbSizeMin + (thumbSizeMax-thumbSizeMin) * (durationAnimCurrent/(durationAnimMax+delayStartAnim))*(durationAnimCurrent/(durationAnimMax+delayStartAnim));
				
				// Determine la position des vignette pour un effet 'tirroir'
				var deltaPositionThumbX = (vp.thumbHoverOnThumbRatioX-0.5)*vp.thumbSize*vp.zoom*vp.zoomCorrectionFactor;
				var deltaPositionThumbY = (vp.thumbHoverOnThumbRatioY-0.5)*vp.thumbSize*vp.zoom*vp.zoomCorrectionFactor;
				var positionThumbX = vp.mouseX-thumbSize/2-deltaPositionThumbX;
				var positionThumbY = vp.mouseY-thumbSize/2-deltaPositionThumbY;
				
				ctx.beginPath();
			    ctx.rect(	positionThumbX, 
			    			positionThumbY, 
			    			thumbSize, 
			    			thumbSize
			    );
			    ctx.shadowOffsetX=10;
			    ctx.shadowOffsetY=10;
				ctx.shadowBlur = 30;
				ctx.shadowColor = "#111";
				ctx.globalAlpha=0.5;		
				ctx.fill();	    
				// Contour
			    ctx.lineWidth = 2;
			    ctx.strokeStyle = 'black';
			    ctx.globalAlpha=1;
			    ctx.stroke();
				
				// Image
				imgThumbZoom.src =  vp.thumbFocusedSrc;
				ctx.drawImage(imgThumbZoom,
								vp.thumbFocusedOffsetX,
				    			vp.thumbFocusedOffsetY,
				    			150,
				    			150,
				    			positionThumbX, 
				    			positionThumbY, 
				    			thumbSize, 
				    			thumbSize
				    );
				    
				// Cartouche de nom
				ctx.beginPath();
				ctx.rect(	positionThumbX, 
			    			positionThumbY+thumbSize*0.75, 
			    			thumbSize, 
				    		thumbSize*0.25
			    );
			    grad = ctx.createLinearGradient(0,positionThumbY+thumbSize*0.75,0,positionThumbY+thumbSize);
				grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
				grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.9)');
				grad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
			    //ctx.globalAlpha=0.6;		
				ctx.fillStyle=grad;	
				ctx.fill();  
				
				// nom
				ctx.globalAlpha=1;		
				ctx.font=thumbSize*0.10+'px Arial';
				ctx.fillStyle = '#fff';
      			ctx.fillText(	'Student n° : '+vp.thumbFocusedNumber, 
      							positionThumbX+thumbSize*0.1, 
			    				positionThumbY+thumbSize-thumbSize*0.1
			    );  

				
			ctx.restore();
		}
		else stepThumbZoom=0;
	}
	
	
	// Fonction d'animation
	function animloop(){
	  //console.log("animLoop");
	  fc.oldTime=fc.time;
	  fc.time= new Date().getTime();
	  fc.getFPS();
	  
      redraw();
      vp.updateValues();
      requestAnimFrame(animloop);
	};
	
	// Definition de la fonction requestAnimFrame
	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame || 
			  window.webkitRequestAnimationFrame || 
			  window.mozRequestAnimationFrame || 
			  window.oRequestAnimationFrame || 
			  window.msRequestAnimationFrame || 
			  function(/* function FrameRequestCallback */ callback){
				window.setTimeout(callback, 1000 / 60);
			  };
	})();
	
	// Gestion du drag
	var lastX=canvas.width/2, lastY=canvas.height/2;
	var dragStart,dragMapStart,dragged;
	$(canvas).on('mousedown',function(evt){
		document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
		// Drag sur la map
		if(	vp.mapRender && // map active
		(evt.pageX>canvas.width-mapWidth-10+canvas.offsetLeft && evt.pageX<canvas.width-10) &&
		(evt.pageY>canvas.height-mapHeight-10+canvas.offsetTop && evt.pageY<canvas.height-10+canvas.offsetTop) ){
			var centerX, centerY;
			centerX = (evt.pageX - (canvas.width-mapWidth-10+canvas.offsetLeft)) / mapWidth;
			centerY = (evt.pageY - (canvas.height-mapHeight-10+canvas.offsetTop)) / mapHeight;
			vp.centerX = centerX;
			vp.centerY = centerY;
			dragMapStart = true;
		}
		// Drag sur la dalle
		else{
			lastX = evt.pageX - canvas.offsetLeft;
			lastY = evt.pageY - canvas.offsetTop;
			applyViewport();
			dragStart = ctx.transformedPoint(lastX,lastY);
		}
		dragged = false;
	});
	
	$(canvas).on('mousemove',function(evt){
		vp.mouseX=evt.pageX - canvas.offsetLeft;
		vp.mouseY=evt.pageY - canvas.offsetTop;
		
		dragged = true;
		//Test mapHover
		if(	vp.mapRender  &&// map active
		(evt.pageX>canvas.width-mapWidth-10+canvas.offsetLeft && evt.pageX<canvas.width-10) &&
		(evt.pageY>canvas.height-mapHeight-10+canvas.offsetTop && evt.pageY<canvas.height-10+canvas.offsetTop) ){
			vp.mapHover=true;
			// Drag Map
			if( dragMapStart ){
				var centerX, centerY;
				centerX = (evt.pageX - (canvas.width-mapWidth-10+canvas.offsetLeft)) / mapWidth;
				centerY = (evt.pageY - (canvas.height-mapHeight-10+canvas.offsetTop)) / mapHeight;
				vp.centerX = centerX;
				vp.centerY = centerY;
			}
		}
		// Drag dalle
		else if (dragStart){
			lastX = evt.pageX - canvas.offsetLeft;
			lastY = evt.pageY - canvas.offsetTop;
			var pt = ctx.transformedPoint(lastX,lastY);
			var dragX = pt.x-dragStart.x;
			var dragY = pt.y-dragStart.y;
			vp.centerX = (canvas.width/2 - vp.borderLeft - dragX*vp.zoom/vp.zoomCurrentFactor) / (vp.mosaicReelWidth*vp.zoom*vp.zoomCorrectionFactor);
			vp.centerY = (canvas.height/2 - vp.borderTop - dragY*vp.zoom/vp.zoomCurrentFactor) / (vp.mosaicReelHeight*vp.zoom*vp.zoomCorrectionFactor);
		}
		else {
			vp.mapHover=false;
			vp.oldThumbFocusedNumber=vp.thumbFocusedNumber;
			
			lastX = evt.pageX - canvas.offsetLeft;
			lastY = evt.pageY - canvas.offsetTop;
			var pt = ctx.transformedPoint(lastX,lastY);
			
			// On determine la ligne et la colonne de l'image survolée puis la dalle à laquelle elle appartient
			var thumbHoverX = Math.floor(pt.x/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize);// Colonne de la thumbnail survolée
			var thumbHoverY = Math.floor(pt.y/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize);// Ligne de la thumbnail survolée
			// Determine les ratio du positionnement de la souris sur la vignette elle meme en X et Y
			vp.thumbHoverOnThumbRatioX = (pt.x/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize) - Math.floor(pt.x/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize);
			vp.thumbHoverOnThumbRatioY = (pt.y/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize) - Math.floor(pt.y/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize);
			// DEtermine le numero de la vignette survolée
			vp.thumbFocusedNumber=thumbHoverX+90*thumbHoverY;
			//console.log(thumbHoverX);
			//console.log(thumbHoverY);
			//console.log(thumbHoverOnThumbY);
			//console.log(vp.thumbFocusedNumber);
			var k = Math.floor(thumbHoverY/10);
			if(k>5 || k<0) k=100;
			var j = Math.floor(thumbHoverX/15);
			if(j>5 || j<0) j=100;
			var i = k*6 + j; // Numero de la dalle mosaicZoom3_i+1 contenant la thumbnail survolée
			if(i < 9 && i>=0) vp.thumbFocusedSrc = 'img/mosaic/mosaicZoom3_0' + (i+1).toString() + '.jpg';
					else if(i<36 && i>=0) vp.thumbFocusedSrc = 'img/mosaic/mosaicZoom3_' + (i+1).toString() + '.jpg';
					else vp.thumbFocusedSrc=0;
			//console.log(vp.thumbFocusedSrc);
			
			// On determine la position de cette image dans la dalle en question
			vp.thumbFocusedOffsetX = (thumbHoverX - Math.floor(thumbHoverX/15)*15)*150; // offset en X sur la dalle
			vp.thumbFocusedOffsetY = (thumbHoverY - Math.floor(thumbHoverY/10)*10)*150; // offset en Y sur la dalle
			//console.log(vp.thumbFocusedOffsetX);
			//console.log(vp.thumbFocusedOffsetY);
		}
	});
	
	$(canvas).on('mouseup',function(evt){
		dragStart = null;
		dragMapStart = null;
		//console.log((-vp.borderLeft)/vp.zoom + lastX/vp.zoom );
	});
	
	$(canvas).on('mouseleave',function(evt){
		dragStart = null;
		dragMapStart = null;
	});
	
	// Facteur de zoom 
	var scaleFactor = 1.05;
	
	// Fonction de zoom
	var zoom = function(clicks){
		applyViewport();
		var pt = ctx.transformedPoint(lastX,lastY);
		var factor = Math.pow(scaleFactor,clicks);
		var oldZoom = vp.zoom;
		var oldBL = vp.borderLeft;
		var oldBT = vp.borderTop;
		vp.zoom *= factor;
		//console.log(vp.zoom);
		if(!vp.zoomLimited){
			vp.centerX = (canvas.width/2 - lastX + (vp.zoom/oldZoom) * (lastX-oldBL)) / (vp.mosaicReelWidth*vp.zoom*vp.zoomCorrectionFactor);
			vp.centerY = (canvas.height/2 - lastY + (vp.zoom/oldZoom) * (lastY-oldBT)) / (vp.mosaicReelHeight*vp.zoom*vp.zoomCorrectionFactor);
		}
	}
	
	// Fonction gérant le scroll declenchant un zoom
	var handleScroll = function(evt){
		var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
		if (delta){
			lastX = evt.pageX - canvas.offsetLeft;
			lastY = evt.pageY - canvas.offsetTop;
			zoom(delta);
			
			// Determination de la vignette survolée
			vp.oldThumbFocusedNumber=vp.thumbFocusedNumber;
			
			lastX = evt.pageX - canvas.offsetLeft;
			lastY = evt.pageY - canvas.offsetTop;
			var pt = ctx.transformedPoint(lastX,lastY);
			
			// On determine la ligne et la colonne de l'image survolée puis la dalle à laquelle elle appartient
			var thumbHoverX = Math.floor(pt.x/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize);// Colonne de la thumbnail survolée
			var thumbHoverY = Math.floor(pt.y/(vp.zoomCurrentFactor*vp.zoomCorrectionFactor)/vp.thumbSize);// Ligne de la thumbnail survolée
			vp.thumbFocusedNumber=thumbHoverX+90*thumbHoverY;
			//console.log(thumbHoverX);
			//console.log(thumbHoverY);
			//console.log(vp.thumbFocusedNumber);
			var k = Math.floor(thumbHoverY/10);
			if(k>5 || k<0) k=100;
			var j = Math.floor(thumbHoverX/15);
			if(j>5 || j<0) j=100;
			var i = k*6 + j; // Numero de la dalle mosaicZoom3_i+1 contenant la thumbnail survolée
			if(i < 9 && i>=0) vp.thumbFocusedSrc = 'img/mosaic/mosaicZoom3_0' + (i+1).toString() + '.jpg';
					else if(i<36 && i>=0) vp.thumbFocusedSrc = 'img/mosaic/mosaicZoom3_' + (i+1).toString() + '.jpg';
					else vp.thumbFocusedSrc=0;
			//console.log(vp.thumbFocusedSrc);
			
			// On determine la position de cette image dans la dalle en question
			vp.thumbFocusedOffsetX = (thumbHoverX - Math.floor(thumbHoverX/15)*15)*150; // offset en X sur la dalle
			vp.thumbFocusedOffsetY = (thumbHoverY - Math.floor(thumbHoverY/10)*10)*150; // offset en Y sur la dalle
			//console.log(vp.thumbFocusedOffsetX);
			//console.log(vp.thumbFocusedOffsetY);
		}
		return evt.preventDefault() && false;
	};
	
	// Listener évènement scroll
	canvas.addEventListener('DOMMouseScroll',handleScroll,false);
	canvas.addEventListener('mousewheel',handleScroll,false);
		
	// trackTransforms(ctx) permet de définir un ensemble de fonctions de calcul matricielle adaptée au canvas
	function trackTransforms(ctx){
		
		// Création de l'élément svg permettant les manipulation de matrice
		var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
		
		// xform est une matrice SVG [2 x 3]
		xform = svg.createSVGMatrix();
		
		// getTransform()retourne la matrice xform
		ctx.getTransform = function(){ return xform; };
		
		// setTransform(a, b, c, d, e, f) permet d'initialiser la matrice xform coefficient par coefficient
		var setTransform = ctx.setTransform;
		ctx.setTransform = function(a,b,c,d,e,f){
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(ctx,a,b,c,d,e,f);
		};
		
		// savedTransforms est un tableau de xform qui sert de stack.
		var savedTransforms = [];
		
		// save() insere au sommet du stack savedTransform la matrice xform courante
		var save = ctx.save;
		ctx.save = function(){
			savedTransforms.push(xform.translate(0,0));
			return save.call(ctx);
		};

		// restore() remet xform à la derniere matrice stockée dans savedTransform
		var restore = ctx.restore;
		ctx.restore = function(){
			xform = savedTransforms.pop();
			return restore.call(ctx);
		};
		
		// scale(sx, sy) multiplie la matrice xform par un facteur en x et en y
		var scale = ctx.scale;
		ctx.scale = function(sx,sy){
			xform = xform.scaleNonUniform(sx,sy);
			return scale.call(ctx,sx,sy);
		};
		
		// rotate(radians) applique une rotation à la matrice xform
		var rotate = ctx.rotate;
		ctx.rotate = function(radians){
			xform = xform.rotate(radians*180/Math.PI);
			return rotate.call(ctx,radians);
		};
		
		// translate(dx, dy) applique une translation à la matrice xform
		var translate = ctx.translate;
		ctx.translate = function(dx,dy){
			xform = xform.translate(dx,dy);
			return translate.call(ctx,dx,dy);
		};
		
		// transform(a, b, c, d, e, f) permet de multiplier la matrice xform par une matrice définit coefficient par coefficient
		var transform = ctx.transform;
		ctx.transform = function(a,b,c,d,e,f){
			var m2 = svg.createSVGMatrix();
			m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
			xform = xform.multiply(m2);
			return transform.call(ctx,a,b,c,d,e,f);
		};
		
		// pt est un point SVG
		var pt  = svg.createSVGPoint();
		
		// transformedPoint(x, y) retourne le point placé en paramètre multiplié par la matrice xform
		ctx.transformedPoint = function(x,y){
			pt.x=x; pt.y=y;
			return pt.matrixTransform(xform.inverse());
		};
	};
	
	// Resize of canvas
	function resizeCanvas(){
		//console.log("resizeCanvas");
		if( $(window).innerWidth()/( $(window).innerHeight() - $('header').height() - $('footer').height() ) < 3/2 ){
			$(canvas).attr("width", $(window).innerWidth() );
			$(canvas).attr("height", $(window).innerWidth() / 3 * 2 );
			scaleRatioFullScreen = $(canvas).width()/(vp.mosaicReelWidth*vp.zoomCorrectionFactor);
			//console.log("largeurResizement");
		}
		else{
			$(canvas).attr("width", $(window).innerWidth() );
			$(canvas).attr("height", $(window).innerHeight() - $('header').height() - $('footer').height() );
			scaleRatioFullScreen = $(canvas).height()/(vp.mosaicReelHeight*vp.zoomCorrectionFactor);
			//console.log("hauteurResizement");
		}
		//console.log(scaleRatioFullScreen);
		scaleEffective = scaleRatioFullScreen;
		vp.zoom=scaleRatioFullScreen;
		vp.centerX=0.5;
		vp.centerY=0.5;
		vp.imgZoomStatus=1;
	}
	
	// Positionning the canvas element
	function positionningCanvas(){
		$(canvas).css({marginTop: ($(window).innerHeight() - $(canvas).attr("height")) / 2});
	}
	
	// Initialising the canvas element
	function initCanvas(){
		resizeCanvas();
		positionningCanvas();
		vp.zoom = scaleRatioFullScreen;
		vp.centerX=0.5;
		vp.centerY=0.5;
	}
	
	$(window).resize(function(){
		resizeCanvas();
		positionningCanvas();
		redraw();
	});
	
	function verifTransform(){
		
		//limite zoom
		if( vp.zoom >= scaleRatioMin || vp.zoom <= scaleRatioMax ){
			if( vp.zoom > scaleRatioMin ) vp.zoom = scaleRatioMin;
			if( vp.zoom < scaleRatioMax ) vp.zoom = scaleRatioMax;
			vp.zoomLimited = true;
		}
		else vp.zoomLimited = false;
		
		//limite gauche
		if( vp.centerX<0 ) vp.centerX=0;
		
		//limite haute
		if( vp.centerY<0 ) vp.centerY=0;
		
		//limite droite
		if( vp.centerX>1 ) vp.centerX=1;
		
		//limite basse
		if( vp.centerY>1 ) vp.centerY=1;
		
	}
	
	function applyViewport() {
		vp.updateValues();
		ctx.setTransform(vp.zoom/vp.zoomCurrentFactor, 0, 0, vp.zoom/vp.zoomCurrentFactor, vp.borderLeft, vp.borderTop);
	}
	
	// Fonction de creation des objets images	
	function createImageObjects(){
		imgZoom1 = new Image();
		imgZoom2 = new Array();
		for( i=0; i<9; i++ ){
			imgZoom2[i] = new Image();
		}
		imgZoom3 = new Array();
		for( i=0; i<36; i++ ){
			imgZoom3[i] = new Image();
		}
		imgMapLogo = new Image();
		imgThumbZoom = new Image();
	}
	
	// Fonction apparition menu secondaire
	$('#navSecondaire').hover(function(){
		$('body').toggleClass('secondMenuActive');
		vp.redrawActive= !vp.redrawActive;
		//console.log(vp.redrawActive);
	});
	
});