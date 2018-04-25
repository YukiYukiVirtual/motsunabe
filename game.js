(function(){
	phina.globalize();
	var WIDTH = 1280;
	var HEIGHT = 960;

	var ASSETS = {
		"image":{
			"mito":"image/mito.png",
			"akago":"image/akago.png",
			"beer":"image/beer.png",
			"mukade":"image/mukade.png",
			"momiji":"image/momiji.png",
			"nabe":"image/nabe.png",
			"bad":"image/bad.png",
		},
		"sound":{
			"bi":"sound/bi.wav",
			"gekimazu":"sound/gekimazu.wav",
			"kakusanakya":"sound/kakusanakya.wav",
			"kibou":"sound/kibou.mp3",
			"mukade":"sound/mukade.wav",
			"mukadeningen":"sound/mukadeningen.wav",
			"retrogamecenter2":"sound/retrogamecenter2.mp3",
			"teihyouka":"sound/teihyouka.wav",
		},
	};
	SoundManager.setVolumeMusic(0.5);

	phina.define("MainScene",{
		superClass: "DisplayScene",
		init: function(param)
		{
			this.superInit({
				width: WIDTH,
				height: HEIGHT,
			});
			this.backgroundColor = "#ffffdd";
			SoundManager.playMusic("kibou");
			
			this.stopFlag = false;
			
			this.akagofreq = 15;
			this.beerfreq = 100;
			this.mukadefreq = 200;
			this.akagoSpeed = 3000;
			this.mukadeSpeed = 2000;
			this.scoremag = 1;
			this.mukadeRotation = 6;
			
			this.nabe = Sprite("nabe")
				.setPosition(this.gridX.center(),this.gridY.center())
				.setSize(256,256)
				.addChildTo(this);
			this.beerGroup = DisplayElement().addChildTo(this);
			this.mukadeGroup = DisplayElement().addChildTo(this);
			this.akagoGroup = DisplayElement().addChildTo(this);
			this.momijiGroup = DisplayElement().addChildTo(this);
			this.mito = Sprite("mito")
				.setPosition(param.x, param.y)
				.setSize(128,128)
				.addChildTo(this);
				
			this.badLabel = Label("")
				.setOrigin(0,0.5)
				.setPosition(WIDTH/2-20, 100)
				.addChildTo(this);
			Sprite("bad")
				.setOrigin(1,0.5)
				.setPosition(WIDTH/2-20,100)
				.setSize(32,32)
				.addChildTo(this);
			this.scoreLabel = Label("")
				.setPosition(WIDTH/2, 50)
				.addChildTo(this);
			
			this.score = bigInt();
			this.bad = 0;
			this.mukadeCount = 0;
		},
		update: function(app)
		{
			if(this.stopFlag)
				return;
			if(this.bad >= 2000){
				this.stopFlag = true;
				SoundManager.stopMusic();
				var rect = RectangleShape()
				.setPosition(this.gridX.center(),this.gridY.center())
				.setSize(WIDTH,HEIGHT)
				.addChildTo(this);
				rect.fill = "black";
				rect.stroke = "black";
				rect.alpha = 0;
				rect.tweener
				.to({alpha:1},3000)
				.call(function(){
					this.exit({
						score: this.scoreLabel.text,
						bad: this.bad,
						mukade: this.mukadeCount,
					});
				}.bind(this));
				this.momijiGroup.children.each(function (elem) {
					elem.tweener.clear();
				});
				this.akagoGroup.children.each(function (elem) {
					elem.tweener.clear();
				});
				this.mukadeGroup.children.each(function (elem) {
					elem.tweener.clear();
				});
				return;
			}
			this.mito.tweener
				.clear()
				.to({
					x: app.pointer.x,
					y: app.pointer.y,
				},app.deltaTime * 1.2);
			this.mukadeGroup.children.each(function (elem) {
				elem.rotation+=this.mukadeRotation;
			}.bind(this));

			if(app.frame % this.akagofreq == 0){
				var corner = Random.randint(0,3);
				var cornerX = [0,0,WIDTH,WIDTH];
				var cornerY = [0,HEIGHT,0,HEIGHT];
				
				var atan2 = Math.atan2(cornerY[corner] - this.nabe.y, cornerX[corner] - this.nabe.x);
				var nabe = Vector2(this.nabe.x + Math.cos(atan2) * this.nabe.radius/2,	this.nabe.y + this.nabe.radius/4 + Math.sin(atan2) * this.nabe.radius/2);
				var akago = Sprite("akago")
					.setPosition(cornerX[corner], cornerY[corner])
					.setSize(64,64)
					.addChildTo(this.akagoGroup);
				akago.tweener
				.to({
					x: nabe.x,
					y: nabe.y
				},this.akagoSpeed)
				.call(function(){
					this.score = this.score.add(100 * this.scoremag);
					this.bad -= this.scoremag;
					akago.remove();
				}.bind(this));
				var momiji = Sprite("momiji")
					.setPosition(cornerX[corner], cornerY[corner])
					.setSize(64,64)
					.addChildTo(this.momijiGroup);
				momiji.tweener
				.to({
					x: nabe.x,
					y: nabe.y
				},this.akagoSpeed)
				.call(function(){
					SoundManager.play("gekimazu");
					this.score = this.score.subtract(100 * this.scoremag);
					this.bad += this.scoremag * 10;
					momiji.remove();
				}.bind(this));
			}
			if(Random.randint(0,this.beerfreq) == 0)
			{
				SoundManager.play("bi");
				var beer = Sprite("beer")
					.setPosition(Random.randint(100, WIDTH-100),Random.randint(100, HEIGHT-100))
					.setSize(128,128)
					.addChildTo(this.beerGroup);
			}
			if(Random.randint(0,this.mukadefreq) == 0)
			{
				SoundManager.play("mukade");
				var corner = Random.randint(0,3);
				var cornerX = [0,100,WIDTH,100];
				var cornerY = [100,HEIGHT,100,0];
				var mukade = Sprite("mukade")
					.setPosition(cornerX[corner],cornerY[corner])
					.setSize(64,64)
					.addChildTo(this.mukadeGroup);
				mukade.tweener
				.to({
					x: cornerX[(corner+2)%4],
					y: cornerY[(corner+2)%4]
				},this.mukadeSpeed)
				.call(function(){
					mukade.remove();
				});
			}
			
			this.bad = Math.max(0,this.bad);
			this.bad += this.beerGroup.children.length;
		},
		_accessor: {
			score: {
				get: function(){
					return this._score;
				},
				set: function(x){
					this._score = x;
					this.scoreLabel.text = x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
				},
			},
			bad: {
				get: function(){
					return this._bad;
				},
				set: function(x){
					this._bad = x;
					this.badLabel.text = x;
				},
			},
		},
		onenterframe: function(app)
		{
			var mito = Circle(this.mito.x, this.mito.y, this.mito.radius);
			this.momijiGroup.children.each(function (elem) {
				var momiji = Circle(elem.x, elem.y, elem.radius); 
				if (Collision.testCircleCircle(mito, momiji)) {
					elem.remove();
				}
			});
			this.beerGroup.children.each(function (elem) {
				var beer = Circle(elem.x, elem.y, elem.radius); 
				if (Collision.testCircleCircle(mito, beer)) {
					elem.remove();
					SoundManager.play("kakusanakya");
				}
			});
			this.mukadeGroup.children.each(function (elem) {
				var mukade = Circle(elem.x, elem.y, elem.radius); 
				if (Collision.testCircleCircle(mito, mukade)) {
					SoundManager.play("mukadeningen");
					this.akagofreq = Math.max(5,this.akagofreq-1);
					this.beerfreq = Math.max(80,this.beerfreq-4);
					this.mukadefreq = Math.max(100,this.mukadefreq-10);
					this.akagoSpeed = Math.max(1500,this.akagoSpeed-100);
					this.scoremag++;
					this.mukadeRotation *= 2;
					this.score = this.score.multiply(2);
					this.mukadeCount++;
					elem.remove();
				}
			}.bind(this));
			
		}
	});

	phina.define("TitleScene",{
		superClass: "DisplayScene",
		init: function()
		{
			this.superInit({
				width: WIDTH,
				height: HEIGHT,
			});
			this.backgroundColor = "#ffffdd";
			if(phina.isMobile())
			{
				var self = this;
				function clickevent(){
					SoundManager.playMusic("retrogamecenter2");
					self.removeEventListener("click",clickevent);
				};
				this.addEventListener("click",clickevent);
			}
			else
			{
				SoundManager.playMusic("retrogamecenter2");
			}
			this.stopFlag = false;
			
			Sprite("nabe")
				.setPosition(this.gridX.center(),this.gridY.center())
				.setSize(256,256)
				.addChildTo(this);
				
			var label = Label("委員長の美味しいモツ鍋")
			.setPosition(this.gridX.center(),this.gridY.span(1.2))
			.addChildTo(this);
			label.fontSize = 100;
			label.fill = "green";
			
			var dfontsize = 32;
			
			Sprite("akago")
			.setPosition(this.gridX.span(4),this.gridY.span(3))
			.setSize(60,60)
			.addChildTo(this);
			label = Label("鍋に赤子の拳のようなモツを入れよう！")
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(4)+dfontsize,this.gridY.span(3))
			.addChildTo(this);
			label.fontSize = dfontsize;
			
			Sprite("momiji")
			.setPosition(this.gridX.span(4),this.gridY.span(4))
			.setSize(60,60)
			.addChildTo(this);
			label = Label("もみじをクリックで取り除け！")
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(4)+dfontsize,this.gridY.span(4))
			.addChildTo(this);
			label.fontSize = dfontsize;
			
			this.mukade = Sprite("mukade")
			.setPosition(this.gridX.span(4),this.gridY.span(5))
			.setSize(60,60)
			.setInteractive(true)
			.addChildTo(this);
			this.mukade.onpointover = function()
			{
				this.setScale(2,2);
			}
			this.mukade.onpointout = function()
			{
				this.setScale(1,1);
			}
			this.mukade.onclick = function()
			{
				window.open("https://twitter.com/mukade_ningen","_blank");
			};
			label = Label("ムカデを取るといろいろ増えるぞ！")
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(4)+dfontsize,this.gridY.span(5))
			.addChildTo(this);
			label.fontSize = dfontsize;
			
			Sprite("beer")
			.setPosition(this.gridX.span(4),this.gridY.span(6))
			.setSize(60,60)
			.addChildTo(this);
			label = Label("ﾋﾞ…をわたくしで隠して風紀を守ろう！")
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(4)+dfontsize,this.gridY.span(6))
			.addChildTo(this);
			label.fontSize = dfontsize;
			
			Sprite("bad")
			.setPosition(this.gridX.span(4),this.gridY.span(7))
			.setSize(60,60)
			.addChildTo(this);
			label = Label("Badが2000以上付くとゲームオーバー")
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(4)+dfontsize,this.gridY.span(7))
			.addChildTo(this);
			label.fontSize = dfontsize;
			
			
			label = Label("\
			SoundEffect 月ノ美兎\n\
			Illustration いらすとや\n\
			Music 甘茶の音楽工房\n\
			Programming 結城ゆき\n\
			")
			.setOrigin(0.5,1)
			.setPosition(this.gridX.center(),this.gridY.span(16))
			.addChildTo(this);
			label.fontSize = 30;
			
			label = Label("連絡先 Twitter@YukiYukiVirtual")
			.setOrigin(0,1)
			.setPosition(this.gridX.span(0),this.gridY.span(16))
			.addChildTo(this);
			label.fontSize = 20;
			
			label = Label("lastModified:"+document.lastModified)
			.setOrigin(1,1)
			.setPosition(this.gridX.span(16),this.gridY.span(16))
			.addChildTo(this);
			label.fontSize = 20;
			
			
			var startButton = Button({
				text: "Start",
				fontSize: 64,
				width: 128,
				height: 128,
				fill: "transparent",
				fontColor: "black",
			})
			.setPosition(this.gridX.center(),this.gridY.span(11))
			.addChildTo(this);
			startButton.onclick = function()
			{
				SoundManager.stopMusic();
				this.stopFlag = true;
			}.bind(this)
			startButton.onpointover = function()
			{
				this.fontColor = "red";
			}
			startButton.onpointout = function()
			{
				this.fontColor = "black";
			}
			
			this.mito = Sprite("mito")
			.setSize(128,128)
			.addChildTo(this);
			
			this.mukade.addChildTo(this);
		},
		update: function(app)
		{
			this.mito.tweener
				.clear()
				.to({
					x: app.pointer.x,
					y: app.pointer.y,
				},app.deltaTime * 1.2);
			this.mukade.rotation+=6;
			if(this.stopFlag){
				SoundManager.stopMusic();
				this.exit({
					x: app.pointer.x,
					y: app.pointer.y,
				});
			}
		},
	});

	phina.define("ResultScene",{
		superClass: "DisplayScene",
		init: function(param)
		{
			this.superInit({
				width: WIDTH,
				height: HEIGHT,
			});
			this.backgroundColor = "#ffffdd";
			SoundManager.playMusic("teihyouka",0,false);
			
			var shareButton = Button({
				text: "シェアする",
				fontSize: 64,
				width: 350,
				height: 80,
			})
			.setPosition(this.gridX.center(),this.gridY.span(14))
			.addChildTo(this);

			var text = "モツを{0}個食べました！".format(param.score);
			shareButton.onclick = function()
			{
				var url = phina.social.Twitter.createURL({
					text: text + (phina.isMobile()?"(モバイルから)":""),
					hashtags: ["委員長の美味しいモツ鍋"],
				});

				window.open(url, "share window", "width=480, height=320");
			};
			
			var restartButton = Button({
				text: "もういちど",
				fontSize: 64,
				width: 350,
				height: 80,
				fill: "transparent",
				fontColor: "black",
			})
			.setPosition(this.gridX.center(),this.gridY.span(12))
			.addChildTo(this);
			restartButton.onclick = function()
			{
				SoundManager.stopMusic();
				this.exit();
			}.bind(this)
			restartButton.onpointover = function()
			{
				this.fontColor = "red";
			}
			restartButton.onpointout = function()
			{
				this.fontColor = "black";
			}
			
			var label = Label("ゲームオーバー")
			.setPosition(this.gridX.center(),this.gridY.span(3))
			.addChildTo(this);
			label.fontSize = 128;
			label.fill = "green";
			
			label = Label(text)
			.setPosition(this.gridX.center(),this.gridY.span(6))
			.addChildTo(this);
			label.fontSize = 64;
			
			var bfontsize = 48
			this.bad = Sprite("bad")
			.setPosition(this.gridX.span(4),this.gridY.span(9))
			.setSize(60,60)
			.setInteractive(true)
			.addChildTo(this);
			this.badLabel = Label(param.bad)
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(4)+bfontsize,this.gridY.span(9))
			.addChildTo(this);
			label.fontSize = bfontsize;
			this.bad.onpointover = function()
			{
				this.setScale(2,2);
			}
			this.bad.onpointout = function()
			{
				this.setScale(1,1);
			}
			this.bad.onclick = function()
			{
				SoundManager.stopMusic();
				SoundManager.playMusic("teihyouka",0,false);
				this.badLabel.text = parseInt(this.badLabel.text)+1;
			}.bind(this);
			
			this.mukade = Sprite("mukade")
			.setPosition(this.gridX.span(11),this.gridY.span(9))
			.setSize(60,60)
			.setInteractive(true)
			.addChildTo(this);
			label = Label(param.mukade)
			.setOrigin(0,0.5)
			.setPosition(this.gridX.span(11)+bfontsize,this.gridY.span(9))
			.addChildTo(this);
			label.fontSize = bfontsize;
			this.mukade.onpointover = function()
			{
				this.setScale(2,2);
			}
			this.mukade.onpointout = function()
			{
				this.setScale(1,1);
			}
			this.mukade.onclick = function()
			{
				window.open("https://twitter.com/mukade_ningen","_blank");
			};
			
			Sprite("mito")
			.setPosition(this.gridX.center(),this.gridY.span(9))
			.setSize(256,256)
			.addChildTo(this);
		},
	});

	phina.main(function()
	{
		var app = GameApp({
			startLabel: "title",
			width: WIDTH,
			height: HEIGHT,
			assets: ASSETS,
		});
		app.run();
	});
})();