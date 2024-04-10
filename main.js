import './style.css';
import Phaser from 'phaser';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const speedDown = 200;

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan");
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan");

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 250;
    // this.target;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timedEvent;
    this.remainingTime;
    this.coinMusic;
    this.bgMusic;
    this.emitter;
    this.targets = null;
  }

  preload() {
    this.load.image("bg", "/assets/bg.jpg");
    this.load.image("basket", "/assets/basket.png");
    this.load.image("note", "/assets/note.png");
    this.load.image("coins", "/assets/coins.png");
    this.load.image("danger", "/assets/danger.png");
    this.load.image("home", "/assets/home.png");
    this.load.image("bag", "/assets/bag.png");
    this.load.audio("coin", "/assets/coin.mp3");
    // this.load.audio("bgMusic", "/assets/bgMusic.mp3");
    this.load.image("money", "/assets/money.png");
  }

  create() {

    this.scene.pause("scene-game");
    // game.scene.resume("scene-game");

    this.coinMusic = this.sound.add("coin");
    // this.bgMusic = this.sound.add("bgMusic");
    // this.bgMusic.play();
    // this.bgMusic.stop();
    this.background = this.add.tileSprite(0, 0, config.width, config.height, "bg");
    this.background.setOrigin(0, 0);
    
    this.player = this.physics.add.image(sizes.width/2 ,sizes.height - 100,"basket").setOrigin(0,0);
    // this.player.setScale(1.5);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    // this.player.setSize(80, 15).setOffset(10, 70);
    // this.player.setSize(this.player.width - this.player.width/4, this.player.height/6)
    //             .setOffset(this.player.width/10, this.player.height - this.player.height/10);

    // this.target = this.physics.add.image(0,0,this.getRandomTargetType()).setOrigin(0,0);
    this.targets = this.physics.add.group({
      key: this.getRandomTargetType(),
      repeat: Phaser.Math.Between(1, 5),
      setXY: { x: 12, y: 0, stepX: 70, stepY: 70 },
      setScale: { x: 1, y: 1 }
    });
    // this.target.setMaxVelocity(0, speedDown);

    // this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);
    this.targets.children.iterate(function (child) {
      // child.setVelocity(0, speedDown);
      child.setX(Phaser.Math.Between(0, sizes.width - child.displayWidth));
      child.setY(Phaser.Math.Between(-200, 0));
      child.setMaxVelocity(0, speedDown);
    });

    this.physics.add.collider(this.targets, this.player, this.targetHit, null, this);
    
    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(sizes.width - 200, 10, "Tax Benefits: 0", {
      font: "25px Arial",
      fill: "#ffffff"
    });
    this.textTime = this.add.text(10, 10, "Time: 00", {
      font: "25px Arial",
      fill: "#ffffff"
    });

    this.timedEvent = this.time.delayedCall(60000, this.gameOver, [], this);
    
    this.emitter = this.add.particles(0, 0, "money", {
      speed: 100,
      gravityY: speedDown - 200,
      scale: 0.04,
      duration: 100,
      emitting: false
    });
    this.emitter.startFollow(this.player, this.player.width / 2, this.player.height /2, true);
  }

  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime).toString()}`);

    // if(this.target.y >= sizes.height) {
    //   this.target.setX(this.getRandomX());
    //   this.target.setTexture(this.getRandomTargetType());
    //   this.target.setY(0);
    // }
    this.targets.children.iterate(function (target) {
      if (target.y >= sizes.height) {
          target.setX(Phaser.Math.Between(0, sizes.width - target.displayWidth));
          target.setY(Phaser.Math.Between(-200, 0));
          target.setTexture(this.getRandomTargetType());
      }
    }, this);
    
    const { left, right } = this.cursor;

    if(left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if(right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

  getRandomTargetType() {
    const targets = ["coins", "home", "bag", "danger"];
    return targets[Math.floor(Math.random() * targets.length)];
  }

  getRandomX() {
    return Phaser.Math.Between(0, config.width);
    // return Math.floor(Math.random() * sizes.width - 100);
  }

  targetHit(player, target) {
    this.coinMusic.play();
    this.emitter.start();
    this.updateScore(target);
    // this.target.setTexture(this.getRandomTargetType());
    // this.target.setY(0);
    // this.target.setX(this.getRandomX());
    target.setX(Phaser.Math.Between(0, sizes.width - target.displayWidth));
    target.setY(Phaser.Math.Between(-200, 0));
    target.setTexture(this.getRandomTargetType());
  }

  gameOver() {
    gameDiv.style.display = "none";
    gameEndDiv.style.display = "flex";
    this.sys.game.destroy(true);
    if(this.points >= 500) {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent = "Win!";
    } else {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent = "Lose!";
    }
  }

  updateScore(target) {
    const key = target?.texture?.key;
    console.log(key)
    switch (key) {
      case 'coins':
        this.points +=100;
        break;
      case 'home':
        this.points +=50;
        break;
      case 'bag':
        this.points +=150;
        break;
      case 'danger':
        this.points -=150;
        break;
      default:
        // this.points +=100;
        break;
    }
    this.textScore.setText(`Tax Benefits: ${this.points}`);
  }

}

const config = {
  type: Phaser.WEBGL,
  width: window.innerWidth,  
  height: window.innerHeight,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: false,
    }
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  gameDiv.style.display = "flex";
  game.scene.resume("scene-game");
});
