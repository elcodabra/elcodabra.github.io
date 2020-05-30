;(function(){
  const STACK = ['HTML', 'CSS', 'JS', 'NPM', 'SASS', 'BEM', 'GIT', 'SEO', 'DOM', 'AJAX', 'Webpack', 'React', 'Angular', 'Redux', 'Jest', 'TS', 'Next', 'PWA', 'WS', 'SW']
  const URLS = {
    PLAYER: 'images/codey.png',
    BARRIER: 'images/deadline_sprite.png',
    FAILURE_IMG: 'images/failure.png',
    BACKGROUND_IMG: 'images/scene.svg',
  }
  const CANVAS = {
    WIDTH: 800,
    HEIGHT: 400,
    LENGTH: STACK.length * 300,
  }
  const GAME = {
    JUMP: 5,
    VELOCITY: 1,
    SCORE: 0,
  }
  const styles = {
    root: {
      backgroundColor: '#fff',
      canvasStyle: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);',
    },
    item: {
      fontFamily: 'Roboto',
      color: '#ffffff',
      backgroundColor: '#7e0cf5',
      align: 'center',
      fontSize: 20,
      fixedWidth: 85,
      fixedHeight: 35,
      padding: { x: 2, y: 5 },
    },
    text: {
      fontFamily: 'Roboto',
      // fontStyle: 'bold',
      fontSize: 20,
      backgroundColor: '#000',
      // stroke: 'red',
      // strokeThickness: 2,
      padding: { x: 2, y: 5 },
    },
    button: {
      fontFamily: 'Roboto',
      fontSize: 20,
      fontStyle: 'bold',
      backgroundColor: '#7e0cf5',
      // stroke: '#000',
      // strokeThickness: 1,
      padding: { x: 10, y: 10 },
      fixedWidth: 200,
      // fixedHeight: 50,
      align: 'center',
      resolution: 1,
    },
  }
  const gameState = {
    BADGES_COUNT: STACK.length,
    BARRIERS_COUNT: 10,
    jump: GAME.JUMP,
    velocity: GAME.VELOCITY,
    score: GAME.SCORE,
    playerScale: 1,
    gameOver: false,
    paused: true,
  }
  const config = {
    type: Phaser.AUTO,
    width: CANVAS.WIDTH,
    height: CANVAS.HEIGHT,
    backgroundColor: styles.root.backgroundColor,
    canvasStyle: styles.root.canvasStyle,
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
        debug: false,
      },
    },
    scene: {
      preload,
      create,
      update,
    }
  }

  const game = new Phaser.Game(config)

  function createButton(x, y, text, visible, onClick) {
    const scale = 1.2
    const button = this.add.text(x || (CANVAS.WIDTH / 2 - styles.button.fixedWidth / 2), y || (CANVAS.HEIGHT / 2 - 20), text, styles.button)
      .setInteractive({ useHandCursor: true })
      .setVisible(visible)
      .on('pointerup', function() {
        this.setAlpha(0.5)
        onClick()
      })
      .on('pointerover', function() {
        this
          .setScale(scale)
          .setResolution(scale)
          .setX(this.x - this.width * (scale - 1) / 2)
      })
      .on('pointerout', function() {
        this
          .setScale(1)
          .setResolution(1)
          .setX(this.x + this.width * (scale - 1) / 2)
      })

    return button
  }

  function preload() {
    this.load.svg('background', URLS.BACKGROUND_IMG, { width: 800, height: 100 })
    this.load.image('codey', URLS.PLAYER)
    this.load.spritesheet('barrier', URLS.BARRIER, { frameWidth: 88, frameHeight: 136 })
    // this.load.spritesheet('failure', URLS.FAILURE_IMG, { frameWidth: 480, frameHeight: 270 })
  }
  function create() {
    createButton = createButton.bind(this)

    this.cameras.main.setBounds(0, 0, CANVAS.LENGTH, CANVAS.HEIGHT)
    gameState.cursors = this.input.keyboard.createCursorKeys()
    gameState.activePointer = this.input.activePointer

    // background
    this.add.tileSprite(200, CANVAS.HEIGHT + 20, 2 * CANVAS.LENGTH, 200, 'background')

    const graphics = this.add.graphics()
      // .fillStyle(styles.item.backgroundColor)
      .fillRect(0, 0, styles.item.fixedWidth, styles.item.fixedHeight)
      .generateTexture("star", styles.item.fixedWidth, styles.item.fixedHeight)
      .destroy()

    gameState.skills = []
    const stepX = (CANVAS.LENGTH - 2 * CANVAS.WIDTH) / gameState.BADGES_COUNT
    // gameState.items = this.physics.add.staticGroup({
    gameState.items = this.physics.add.group({
      key: 'star',
      allowGravity: false,
      repeat: gameState.BADGES_COUNT - 1,
      setXY: { x: CANVAS.WIDTH, y: CANVAS.HEIGHT, stepX }, // stepY
    })
    gameState.items.children.iterate((child, index) => {
      // child.body.setBoundsRectangle(rect)
      child.x = child.x + Phaser.Math.Between(50, stepX)
      child.y = child.y - Phaser.Math.Between(50, CANVAS.HEIGHT - styles.item.fixedHeight)
      child.setData('index', index)
      gameState.skills.push(this.add.text(child.x - styles.item.fixedWidth / 2 + 5, child.y - 13, STACK[index], styles.item))
    })

    const stepXBarrier = (CANVAS.LENGTH - 2 * CANVAS.WIDTH) / gameState.BARRIERS_COUNT

    this.anims.create({
      key: 'tickDeadline',
      frames: this.anims.generateFrameNumbers('barrier', { start: 0, end: 4 }),
      frameRate: 5,
      repeat: -1
    })

    gameState.barriers = this.physics.add.group({
      key: 'barrier',
      allowGravity: false,
      repeat: gameState.BARRIERS_COUNT,
      setScale: { x: 0.5, y: 0.5 },
      setXY: { x: CANVAS.WIDTH, y: CANVAS.HEIGHT, stepX: stepXBarrier }, // stepY
    })
    gameState.barriers.children.iterate(child => {
      //child.body.setAllowGravity(false)
      child.x = child.x + Phaser.Math.Between(50, stepX)
      child.y = child.y - Phaser.Math.Between(50, CANVAS.HEIGHT)
      child.play('tickDeadline')
    })

    // The player and its settings
    gameState.player = this.physics.add.sprite(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, 'codey')
      .setBounce(0.7)
      .setCollideWorldBounds(true)

    this.physics.add.overlap(gameState.player, gameState.items, collectStar, null, this)
    this.physics.add.overlap(gameState.player, gameState.barriers, collectBarrier, null, this)

    /*
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('failure'),
      frameRate: 20,
      repeat: -1,
    })

    gameState.sprite = this.add.sprite(0, CANVAS.HEIGHT / 2, 'failure')
      .setDisplaySize(CANVAS.WIDTH, CANVAS.HEIGHT)
      .setVisible(false)
      // .setOrigin(0)
    */

    gameState.scoreText = this.add.text(10, 10, 'Score:' + gameState.score, styles.text)

    gameState.startButton = createButton(false, false, 'START', gameState.paused, () => {
      gameState.paused = false
      gameState.startButton.setVisible(false)
    })

    gameState.restartButton = createButton(false, false, 'Restart', false, () => {
      gameState.gameOver = false
      gameState.score = GAME.SCORE
      gameState.jump = GAME.JUMP
      gameState.velocity = GAME.VELOCITY
      gameState.playerScale = 1
      this.scene.restart()
    })
  }

  function update() {
    if (!gameState.paused && !gameState.gameOver) {
      gameState.velocity += 0.001
      gameState.player.x += gameState.velocity
      gameState.scoreText.x += gameState.velocity
      this.cameras.main.scrollX += gameState.velocity
    }

    if (gameState.gameOver) {
      gameState.restartButton.setVisible(true)
      // this.scene.pause() // this.scene.stop()
      return
    }
    if (gameState.player.body.onWall()) {
      gameState.restartButton
        .setText('Success! Restart?')
        .setX(gameState.player.x - gameState.restartButton.width / 2)

      gameState.gameOver = true
    }
    if (gameState.cursors.space.isDown || gameState.activePointer.isDown) {
      gameState.player.y -= gameState.jump
    }
  }

  function collectBarrier (player, barrier) {
    /*
    gameState.sprite
      .setX(player.x) //  - gameState.sprite.width / 2
      .anims.play('walk', true)
      .setVisible(true)
    */

    gameState.restartButton
      .setText('Deadline! Restart?')
      .setX(player.x - gameState.restartButton.width / 2)
      .setVisible(true)

    gameState.gameOver = true
  }
  function collectStar (player, star) {
    gameState.skills[star.getData('index')].setVisible(false)
    star.disableBody(true, true)
    gameState.playerScale += 0.01
    player.setScale(gameState.playerScale)

    //  Add and update the score
    gameState.score += 1
    gameState.scoreText.setText('Score:' + gameState.score)
  }
})()