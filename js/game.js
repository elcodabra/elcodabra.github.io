;(function(){
  const gameState = {
    CANVAS_WIDTH: 800,
    CANVAS_LENGTH: 3600,
    CANVAS_HEIGHT: 400,
    BADGES_COUNT: 10,
    BARRIERS_COUNT: 5,
    jump: 5,
    velocity: 1,
    score: 0,
    gameOver: false,
    textStyle: {
      fontFamily: 'Helvetica',
      // fontStyle: 'bold',
      fontSize: 20,
      backgroundColor: 'black',
      // stroke: 'red',
      // strokeThickness: 2,
      padding: { x: 1, y: 5 }
    },
  }

  function preload() {
    this.load.image('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/codey.png')
    this.load.svg('barrier', 'https://image.flaticon.com/icons/svg/1666/1666553.svg', {width: 40, height: 40})
    this.load.spritesheet('failure', 'images/failure.png', { frameWidth: 480, frameHeight: 270 })
  }

  function create() {
    this.cameras.main.setBounds(0, 0, gameState.CANVAS_LENGTH, gameState.CANVAS_HEIGHT)
    gameState.cursors = this.input.keyboard.createCursorKeys()

    const graphics = this.add.graphics()
    graphics.fillStyle(0x6666ff)
    graphics.fillRect(0, 0, 40, 40)
    graphics.generateTexture("star", 40, 40)
    graphics.destroy()

    const stepX = (gameState.CANVAS_LENGTH - 2 * gameState.CANVAS_WIDTH) / gameState.BADGES_COUNT
    // gameState.items = this.physics.add.staticGroup({
    gameState.items = this.physics.add.group({
      key: 'star',
      allowGravity: false,
      repeat: gameState.BADGES_COUNT,
      setXY: { x: gameState.CANVAS_WIDTH, y: gameState.CANVAS_HEIGHT, stepX }, // stepY
    })
    gameState.items.children.iterate(function (child) {
      // child.body.setBoundsRectangle(rect)
      child.x = child.x + Phaser.Math.Between(50, stepX)
      child.y = child.y - Phaser.Math.Between(50, gameState.CANVAS_HEIGHT)
    })

    const stepXBarrier = (gameState.CANVAS_LENGTH - 2 * gameState.CANVAS_WIDTH) / gameState.BARRIERS_COUNT

    gameState.barriers = this.physics.add.group({
      key: 'barrier',
      allowGravity: false,
      repeat: gameState.BARRIERS_COUNT,
      setXY: { x: gameState.CANVAS_WIDTH, y: gameState.CANVAS_HEIGHT, stepX: stepXBarrier }, // stepY
    })
    gameState.barriers.children.iterate(function (child) {
      //child.body.setAllowGravity(false)
      child.x = child.x + Phaser.Math.Between(50, stepX)
      child.y = child.y - Phaser.Math.Between(50, gameState.CANVAS_HEIGHT)
    })

    // The player and its settings
    gameState.player = this.physics.add.sprite(gameState.CANVAS_WIDTH / 2, gameState.CANVAS_HEIGHT / 2, 'codey')

    //  Player physics properties. Give the little guy a slight bounce.
    gameState.player.setBounce(0.7)
    gameState.player.setCollideWorldBounds(true)

    this.physics.add.overlap(gameState.player, gameState.items, collectStar, null, this)
    this.physics.add.overlap(gameState.player, gameState.barriers, collectBarrier, null, this)

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('failure'),
      frameRate: 20,
      repeat: -1,
    })

    gameState.sprite = this.add.sprite(0, gameState.CANVAS_HEIGHT / 2, 'failure').setDisplaySize(gameState.CANVAS_WIDTH, gameState.CANVAS_HEIGHT) // .setOrigin(0)
    gameState.sprite.setVisible(false)

    gameState.scoreText = this.add.text(10, 10, 'Score:' + gameState.score, gameState.textStyle)
    gameState.restartButton = this.add.text(0, gameState.CANVAS_HEIGHT / 2, 'Restart', gameState.textStyle)
    gameState.restartButton.setInteractive()
    gameState.restartButton.setVisible(false)
    gameState.restartButton.on('pointerup', () => {
      gameState.gameOver = false
      gameState.score = 0
      this.scene.restart()
    })
  }

  function update() {
    if (gameState.gameOver) {
      gameState.restartButton.setVisible(true)
      // this.scene.pause() // this.scene.stop()
      return
    }
    if (gameState.player.body.onWall()) {
      gameState.restartButton.setText('Success! Restart?')
      gameState.restartButton.x = gameState.player.x - gameState.restartButton.width / 2
      gameState.gameOver = true
    }
    if (gameState.cursors.space.isDown) {
      gameState.player.y -= gameState.jump
    }

    gameState.player.x += gameState.velocity
    gameState.scoreText.x += gameState.velocity
    this.cameras.main.scrollX += gameState.velocity
  }

  function collectBarrier (player, barrier) {
    //  Show the whole animation sheet
    gameState.sprite.x = player.x //  - gameState.sprite.width / 2
    gameState.sprite.anims.play('walk', true)
    gameState.sprite.setVisible(true)

    gameState.restartButton.setText('Deadline! Restart?')
    gameState.restartButton.x = player.x - gameState.restartButton.width / 2
    gameState.gameOver = true
  }

  function collectStar (player, star) {
    star.disableBody(true, true);
    player.setSize(player.width, player.height + 1)

    //  Add and update the score
    gameState.score += 1
    gameState.scoreText.setText('Score:' + gameState.score)
  }

  const config = {
    type: Phaser.AUTO,
    width: gameState.CANVAS_WIDTH,
    height: gameState.CANVAS_HEIGHT,
    backgroundColor: '0xdda0dd',
    physics: {
      default: 'arcade',
      arcade: {
        x: 0,
        y: 0,
        width: gameState.CANVAS_LENGTH - gameState.CANVAS_WIDTH / 2,
        height: gameState.CANVAS_HEIGHT,
        gravity: {
          y: 400
        },
        debug: true,
      },
    },
    scene: {
      preload,
      create,
      update,
    }
  }

  const game = new Phaser.Game(config)
})()