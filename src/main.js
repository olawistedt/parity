// This is for auto completion
/** @type {import("../../../phaser")} */

const CST = {
  SCENES: {
    PLAY: 'PLAY',
    scene: [PlayScene],
  }
}

let game = new Phaser.Game({
//  width: 1536,  // Ipad 4 width
//  height: 2048, // Ipad 4 height
  width: 1536 * 0.55,
  height: 2048 * 0.55,
//  width: window.innerWidth * 1.00,
//  height: window.innerHeight * 1.00,
//  scale: {mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH},
  audio: {disableWebAudio: true},

  scene: [
    PlayScene,
    ScoreScene,
  ],
})
