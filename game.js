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
		"gekimazumomiji":"sound/gekimazumomiji.wav",
		"kakusanakya":"sound/kakusanakya.wav",
		"kibou":"sound/kibou.mp3",
		"mukade":"sound/mukade.wav",
		"mukadeningen":"sound/mukadeningen.wav",
		"retrogamecenter2":"sound/retrogamecenter2.mp3",
		"teihyouka":"sound/teihyouka.wav",
	}
};
SoundManager.setVolumeMusic(0.5);

phina.define("MainScene",{
	superClass: 'DisplayScene',
	init: function()
	{
		this.superInit({
			width: WIDTH,
			height: HEIGHT,
		});
		SoundManager.playMusic("kibou");
		this.backgroundColor = '#ffffdd';
		
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
			.setSize(128,128)
			.addChildTo(this);
		
		this.bad = 0;
		this.badLabel = Label(this.bad)
			.setOrigin(0,0.5)
			.setPosition(WIDTH/2-20, 100)
			.addChildTo(this);
		Sprite("bad")
			.setOrigin(1,0.5)
			.setPosition(WIDTH/2-20,100)
			.setSize(32,32)
			.addChildTo(this);
		this.score = 0;
		this.scoreLabel = Label(this.score)
			.setPosition(WIDTH/2, 50)
			.addChildTo(this);
	},
	update: function(app)
	{
		if(this.stopFlag)
			return;
		var self = this;
		this.mito.setPosition(app.pointer.x, app.pointer.y);
		this.mukadeGroup.children.each(function (elem) {
			elem.rotation+=self.mukadeRotation;
        });

		if(app.frame % this.akagofreq == 0){
			var corner = Random.randint(0,3);
			var cornerX = [0,0,WIDTH,WIDTH];
			var cornerY = [0,HEIGHT,0,HEIGHT];
			
			var atan2 = Math.atan2(cornerY[corner] - this.nabe.y, cornerX[corner] - this.nabe.x);
			var nabe = Circle(this.nabe.x + Math.cos(atan2) * this.nabe.radius,	this.nabe.y + Math.sin(atan2) * this.nabe.radius, this.nabe.radius);
			
			var akago = Sprite("akago")
				.setPosition(cornerX[corner], cornerY[corner])
				.setSize(64,64)
				.addChildTo(this.akagoGroup);
			akago.tweener
			.to({
				x: nabe.x,
				y: nabe.y
			},this.akagoSpeed)
			.call(function () {
				self.score += 100*self.scoremag;
				akago.remove();
			});
			var momiji = Sprite("momiji")
				.setPosition(cornerX[corner], cornerY[corner])
				.setSize(64,64)
				.addChildTo(this.momijiGroup);
			momiji.tweener
			.to({
				x: nabe.x,
				y: nabe.y
			},this.akagoSpeed)
			.call(function () {
				SoundManager.play("gekimazumomiji");
				self.score -= 300*self.scoremag;
				self.bad += self.scoremag*10;
				momiji.remove();
			});
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
			.call(function () {
				mukade.remove();
			});
		}
		this.bad += this.beerGroup.children.length;
		
		this.badLabel.text = this.bad;
		
		this.score = Math.max(0,this.score);
		this.scoreLabel.text = this.score;
		
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
				self.exit({score:self.score,});
			});
			this.momijiGroup.children.each(function (elem) {
				elem.tweener.clear();
			});
			this.akagoGroup.children.each(function (elem) {
				elem.tweener.clear();
			});
			this.mukadeGroup.children.each(function (elem) {
				elem.tweener.clear();
			});
		}
	},
	onpointstart: function(app)
	{
		var self = this;
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
				self.akagofreq = Math.max(5,self.akagofreq-1);
				self.beerfreq = Math.max(80,self.beerfreq-4);
				self.mukadefreq = Math.max(100,self.mukadefreq-10);
				self.akagoSpeed = Math.max(2000,self.akagoSpeed-100);
				self.scoremag++;
				self.mukadeRotation *= 2;
				self.score *= 2;
                elem.remove();
            }
        });
		
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
		SoundManager.playMusic("retrogamecenter2");
		
		Sprite("nabe")
			.setPosition(this.gridX.center(),this.gridY.center())
			.setSize(256,256)
			.addChildTo(this);
			
		var label = Label("委員長の美味しいモツ鍋")
		.setPosition(this.gridX.center(),this.gridY.span(1.2))
		.addChildTo(this);
		label.fontSize = 100;
		label.fill = "green";
		
		Sprite("akago")
		.setPosition(this.gridX.span(4),this.gridY.span(3))
		.setSize(60,60)
		.addChildTo(this);
		label = Label("鍋に赤子の拳のようなモツを入れよう！")
		.setPosition(this.gridX.center(),this.gridY.span(3))
		.addChildTo(this)
		
		label.fontSize = 32;
		label = Label("もみじが入ると減点！Badも増えるぞ！")
		.setPosition(this.gridX.center(),this.gridY.span(4))
		.addChildTo(this)
		label.fontSize = 32;
		Sprite("momiji")
		.setPosition(this.gridX.span(4),this.gridY.span(4))
		.setSize(60,60)
		.addChildTo(this);
		
		this.mukade = Sprite("mukade")
		.setPosition(this.gridX.span(4),this.gridY.span(5))
		.setSize(60,60);
		label = Label("ムカデを取るといろいろ増えるぞ！")
		.setPosition(this.gridX.center(),this.gridY.span(5))
		.addChildTo(this)
		label.fontSize = 32;
		
		Sprite("beer")
		.setPosition(this.gridX.span(4),this.gridY.span(6))
		.setSize(60,60)
		.addChildTo(this);
		label = Label("ﾋﾞ…をわたくしで隠して風紀を守ろう！")
		.setPosition(this.gridX.center(),this.gridY.span(6))
		.addChildTo(this)
		label.fontSize = 32;
		
		Sprite("bad")
		.setPosition(this.gridX.span(4),this.gridY.span(7))
		.setSize(60,60)
		.addChildTo(this);
		label = Label("Badが2000以上付くとゲームオーバー")
		.setPosition(this.gridX.center(),this.gridY.span(7))
		.addChildTo(this)
		label.fontSize = 32;
		
		
		label = Label("SoundEffect 月ノ美兎")
		.setPosition(this.gridX.center(),this.gridY.span(12))
		.addChildTo(this);
		label.fontSize = 32;
		
		label = Label("Illustration いらすとや")
		.setPosition(this.gridX.center(),this.gridY.span(13))
		.addChildTo(this);
		label.fontSize = 32;
		
		label = Label("Music 甘茶の音楽工房")
		.setPosition(this.gridX.center(),this.gridY.span(14))
		.addChildTo(this);
		label.fontSize = 32;
		
		label = Label("Programming 結城ゆき")
		.setPosition(this.gridX.center(),this.gridY.span(15))
		.addChildTo(this);
		label.fontSize = 32;
		
		label = Label("連絡先 Twitter@YukiYukiVirtual")
		.setOrigin(0,1)
		.setPosition(this.gridX.span(0),this.gridY.span(16))
		.addChildTo(this);
		label.fontSize = 20;
		
		
		
		this.startLabel = Label("Start")
		.setPosition(this.gridX.center(),this.gridY.span(10))
		.addChildTo(this);
		this.startLabel.fontSize = 64;
		
		this.mito = Sprite("mito")
		.setSize(128,128)
		.addChildTo(this);
		
		this.mukade.addChildTo(this);
	},
	update: function(app)
	{
		this.mito.setPosition(app.pointer.x, app.pointer.y);
		this.mukade.rotation+=6;
		
		var cursor = Circle(app.pointer.x, app.pointer.y,0);
		var mukade = Circle(this.mukade.x, this.mukade.y, this.mukade.radius);
		var start = Circle(this.gridX.center(), this.gridY.center(), 128);
		if(Collision.testCircleCircle(cursor,mukade)){
			this.mukade.setScale(2,2);
		}else{
			this.mukade.setScale(1,1);
		}
		if(Collision.testCircleCircle(cursor,start)){
			this.startLabel.fill = "red";
		}else{
			this.startLabel.fill = "black";
		}
	},
	onpointstart: function(app)
	{
		var cursor = Circle(app.pointer.x, app.pointer.y,0);
		var mukade = Circle(this.mukade.x, this.mukade.y, this.mukade.radius);
		var start = Circle(this.gridX.center(), this.gridY.center(), 128);
		if(Collision.testCircleCircle(cursor,mukade)){
			window.open("https://twitter.com/mukade_ningen","_blank");
		}
		if(Collision.testCircleCircle(cursor,start)){
			this.exit();
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

		var text = 'モツを{0}個食べました！'.format(String(param.score).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
		shareButton.onclick = function()
		{
			var url = phina.social.Twitter.createURL({
				text: text,
				hashtags: ["委員長の美味しいモツ鍋"],
			});

			window.open(url, 'share window', 'width=480, height=320');
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
		var self = this;
		restartButton.onclick = function()
		{
			SoundManager.stopMusic();
			self.exit();
		}
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
		
		Sprite("mito")
		.setPosition(this.gridX.center(),this.gridY.span(9))
		.setSize(256,256)
		.addChildTo(this);
	},
});

phina.main(function()
{
	var app = GameApp({
		startLabel: 'title',
		width: WIDTH,
		height: HEIGHT,
		assets: ASSETS,
	});
	var locked = true;
	var f = function(e){
		if(locked){
			var s = phina.asset.Sound();
			s.loadFromBuffer();
			s.play();
			s.volume=0;
			s.stop();
			locked=false;
			app.domElement.removeEventListener('touchend', f);
		}
	};
	app.domElement.addEventListener('touchend',f);
	app.run();
});