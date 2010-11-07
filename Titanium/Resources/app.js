// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');


var url;

var imageWin = Titanium.UI.createWindow({  
    title:'Chosen Photo',
    backgroundColor:'#fff'
});


var imageView = Titanium.UI.createImageView({
	height:180,
	width:180,
	top:10,
	left:60,
	backgroundColor:'#999'
});

imageWin.add(imageView);

var inscriptionText = Titanium.UI.createLabel({
	width:290,
	height:100,
	top:200,
	color:'#336699',
	textAlign:'center'
});

imageWin.add(inscriptionText);

function translate(image)
{
	var ind=Titanium.UI.createProgressBar({
		width:200,
		height:50,
		min:0,
		max:1,
		value:0,
		style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
		top:175,
		message:'Uploading Image',
		font:{fontSize:12, fontWeight:'bold'},
		color:'#888'
	});

	imageView.add(ind);

	imageView.image = image;
	navGroup.open(imageWin);
	ind.show();

	var xhr = Titanium.Network.createHTTPClient();

	xhr.onerror = function(e)
	{
		Ti.UI.createAlertDialog({title:'Error', message:e.error}).show();
		Ti.API.info('IN ERROR ' + e.error);
	};
	xhr.setTimeout(20000);
	xhr.onload = function(e)
	{	
		try
		{
			var response = eval('('+this.responseText+')');
			
			ind.message = 'Image Uploaded';
			inscriptionText.text = response.text_english;
			url = response.tts_english;
		}
		catch(E){
			alert(E);
		}
	};
	xhr.onsendstream = function(e)
	{
		ind.value = e.progress ;
		Ti.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
	};
	// open the client
	xhr.open('POST','http://ocr.aicookbook.com/upload');
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    Ti.API.info('data '+ {data:image});
    Ti.API.info('xhr '+ xhr);
	// send the data
	xhr.send({data:image});
}

var playBtn = Titanium.UI.createButton({
	backgroundImage:'images/1288544387_player_play.png',
	height:32,
	width:32,
	top:300,
	left:136
});

playBtn.addEventListener('click',function(e)
{
   	Titanium.API.info("Play Audio");
	
	//
	//  PROGRESS BAR TO TRACK SOUND DURATION
	//
	var flexSpace = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

	// load from remote url
	var sound = Titanium.Media.createSound({url:url,preload:true});
	
	sound.play();
	
	
	var pb = Titanium.UI.createProgressBar({
		min:0,
		value:0,
		width:200
	});

	pb.max = sound.duration;
	
	
	//
	// PAUSE
	//
	var pause = Titanium.UI.createButton({
		backgroundImage:'images/1288544270_player_pause.png',
		height:32,
		width:32,
		right:0,
		top:10,
		selected:false
	});
	pause.addEventListener('click', function()
	{
		if(!pause.selected)
		{
			sound.pause();
			pause.selected=true;
			pause.backgroundImage = 'images/1288544387_player_play.png';
		}
		else
		{
			sound.play();
			pause.selected=false;
			pause.backgroundImage = 'images/1288544270_player_pause.png';
		}
	});


	//
	// STOP
	//
	var stop = Titanium.UI.createButton({
		backgroundImage:'images/1288544284_player_stop.png',
		height:32,
		width:32,
		right:0,
		top:60
	});
	stop.addEventListener('click', function()
	{
		sound.stop();
		pb.value = 0;
		imageWin.setToolbar(null,{animated:true});
	});
	imageWin.setToolbar([pause,stop, pb]);

	//
	// EVENTS
	//
	sound.addEventListener('complete', function()
	{
		Titanium.API.info('COMPLETE CALLED');

		pb.value = 0;
		imageWin.setToolbar(null,{animated:true});
	});
	sound.addEventListener('resume', function()
	{
		Titanium.API.info('RESUME CALLED');
	});
	pb.show();

	//
	// INTERVAL TO UPDATE PB
	//
	var i = setInterval(function()
	{
		if (sound.isPlaying())
		{
			pb.value = sound.time;

		}
	},500);

	//
	//  CLOSE EVENT - CANCEL INTERVAL
	//
	imageWin.addEventListener('close', function()
	{
		clearInterval(i);
	});
});

imageWin.add(playBtn);

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Upload a Photo',
    backgroundColor:'#fff'
});


var navGroup = Ti.UI.iPhone.createNavigationGroup({
	window:win1
});




var iconImgView = Titanium.UI.createImageView({
	image:'images/imgreadricon.jpg',
	height:51,
	width:197,
	top:40,
	left:61
});

win1.add(iconImgView);



var b2 = Titanium.UI.createButton({
	title:'Choose From Library',
	height:40,
	width:200,
	top:180
});


b2.addEventListener('click',function(e)
{
   Titanium.API.info("You chose from libaray");
   Titanium.Media.openPhotoGallery({
		success:function(event)
		{
			var cropRect = event.cropRect;
			var image = event.media;

			// set image view
			Ti.API.debug('Our type was: '+event.mediaType);
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
			{
				translate(image);
			}
			else
			{

			}

			Titanium.API.info('PHOTO GALLERY SUCCESS cropRect.x ' + cropRect.x + ' cropRect.y ' + cropRect.y  + ' cropRect.height ' + cropRect.height + ' cropRect.width ' + cropRect.width);

		},
		cancel:function()
		{

		},
		error:function(error)
		{
		},
		allowEditing:true,
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	});
});

win1.add(b2);

if(!Titanium.Media.NO_CAMERA)
{
	var b1 = Titanium.UI.createButton({
		title:'Take Photo',
		height:40,
		width:200,
		top:250
	});
	
	b1.addEventListener('click',function(e)
	{
	   	Titanium.API.info("You took a photo");

	   	Titanium.Media.showCamera({

			success:function(event)
			{
				var cropRect = event.cropRect;
				var image = event.media;

				Ti.API.debug('Our type was: '+event.mediaType);
				if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
				{
					translate(event.media);
				}
				else
				{
					alert("got the wrong type back ="+event.mediaType);
				}
			},
			cancel:function()
			{
			},
			error:function(error)
			{
				// create alert
				var a = Titanium.UI.createAlertDialog({title:'Camera'});

				// set message
				if (error.code == Titanium.Media.NO_CAMERA)
				{
					a.setMessage('Your device does not support a camera.');
				}
				else
				{
					a.setMessage('Unexpected error: ' + error.code);
				}

				// show alert
				a.show();
			},
			saveToPhotoGallery:true,
			allowEditing:true,
			mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
		});
	});

	win1.add(b1);
}

//This is the main window of the application
var main = Ti.UI.createWindow();
main.add(navGroup);
main.open();
