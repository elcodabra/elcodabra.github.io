;(function(){
  const URLS = {
    PLAYER: 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/codey.png',
    BARRIER: 'https://image.flaticon.com/icons/svg/1666/1666553.svg',
    FAILURE_IMG: 'images/failure.png',
  }
  const CANVAS = {
    WIDTH: 800,
    LENGTH: 3600,
    HEIGHT: 400,
  }
  const styles = {
    text: {
      fontFamily: 'Roboto',
      // fontStyle: 'bold',
      fontSize: 20,
      backgroundColor: 'black',
      // stroke: 'red',
      // strokeThickness: 2,
      padding: { x: 1, y: 5 }
    },
  }
  const gameState = {
    BADGES_COUNT: 10,
    BARRIERS_COUNT: 5,
    jump: 5,
    velocity: 1,
    score: 0,
    gameOver: false,
  }

  function preload() {
    this.load.image('codey', URLS.PLAYER)
    this.load.svg('barrier', URLS.BARRIER, {width: 40, height: 40})
    this.load.spritesheet('failure', URLS.FAILURE_IMG, { frameWidth: 480, frameHeight: 270 })
  }

  function create() {
    this.cameras.main.setBounds(0, 0, CANVAS.LENGTH, CANVAS.HEIGHT)
    gameState.cursors = this.input.keyboard.createCursorKeys()

    const graphics = this.add.graphics()
    graphics.fillStyle(0x6666ff)
    graphics.fillRect(0, 0, 40, 40)
    graphics.generateTexture("star", 40, 40)
    graphics.destroy()

    const stepX = (CANVAS.LENGTH - 2 * CANVAS.WIDTH) / gameState.BADGES_COUNT
    // gameState.items = this.physics.add.staticGroup({
    gameState.items = this.physics.add.group({
      key: 'star',
      allowGravity: false,
      repeat: gameState.BADGES_COUNT,
      setXY: { x: CANVAS.WIDTH, y: CANVAS.HEIGHT, stepX }, // stepY
    })
    gameState.items.children.iterate(function (child) {
      // child.body.setBoundsRectangle(rect)
      child.x = child.x + Phaser.Math.Between(50, stepX)
      child.y = child.y - Phaser.Math.Between(50, CANVAS.HEIGHT)
    })

    const stepXBarrier = (CANVAS.LENGTH - 2 * CANVAS.WIDTH) / gameState.BARRIERS_COUNT

    gameState.barriers = this.physics.add.group({
      key: 'barrier',
      allowGravity: false,
      repeat: gameState.BARRIERS_COUNT,
      setXY: { x: CANVAS.WIDTH, y: CANVAS.HEIGHT, stepX: stepXBarrier }, // stepY
    })
    gameState.barriers.children.iterate(function (child) {
      //child.body.setAllowGravity(false)
      child.x = child.x + Phaser.Math.Between(50, stepX)
      child.y = child.y - Phaser.Math.Between(50, CANVAS.HEIGHT)
    })

    // The player and its settings
    gameState.player = this.physics.add.sprite(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, 'codey')

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

    gameState.sprite = this.add.sprite(0, CANVAS.HEIGHT / 2, 'failure').setDisplaySize(CANVAS.WIDTH, CANVAS.HEIGHT) // .setOrigin(0)
    gameState.sprite.setVisible(false)

    gameState.scoreText = this.add.text(10, 10, 'Score:' + gameState.score, styles.text)
    gameState.restartButton = this.add.text(0, CANVAS.HEIGHT / 2, 'Restart', styles.text)
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
    width: CANVAS.WIDTH,
    height: CANVAS.HEIGHT,
    backgroundColor: '0xdda0dd',
    physics: {
      default: 'arcade',
      arcade: {
        x: 0,
        y: 0,
        width: CANVAS.LENGTH - CANVAS.WIDTH / 2,
        height: CANVAS.HEIGHT,
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