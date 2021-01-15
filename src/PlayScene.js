//
// _____        _____  _____ _________     __
// |  __ \ /\   |  __ \|_   _|__   __\ \   / /
// | |__) /  \  | |__) | | |    | |   \ \_/ /
// |  ___/ /\ \ |  _  /  | |    | |    \   /
// | |  / ____ \| | \ \ _| |_   | |     | |
// |_| /_/    \_\_|  \_\_____|  |_|     |_|
//
// A card game developed by David Parlett and implemented as computer game by
// Ola Wistedt
//

alert /** @type {import("../typings")} */

'use strict';

// Use shift-F5 to reload program
const SPEED = 300;
const UPPER_HAND_IS_DEALER = -1;
const LOWER_HAND_IS_DEALER = 1;
const FRONT_FRAME = 0;
const BACK_FRAME = 1;
const HAND_DIST_FROM_HORISONTAL_BORDERS = 150;
const HAND_DIST_FROM_VERTICAL_BORDERS = 200;
const HAND_DIST_BETWEEN_CARDS = 50;
const TRICKS_FROM_HORISONTAL_BORDER = 350;

class PlayScene extends Phaser.Scene {
  constructor() {
    super({key: 'PLAY'});

    this.sprites_hash = {};  // All sprites with 3 characters as keys
    this.anims_hash = {};  // All sprites has an animation with front and back.
  }

  init(data) {
    this.lower_hand_ids = [];
  }

  preload() {
    preloadCards(this);
    this.load.image('cloth', 'assets/tilesets/bgslagrn.jpg');
  }

  create() {
    this.add.tileSprite(
        0, 0, this.game.renderer.width * 2, this.game.renderer.height * 2,
        'cloth');  // Add the background


    // Talk to the game engine begins
    let dealOrder = gameParity.dealer.randomDealer();
    gameParity.judge.init(dealOrder[0], dealOrder[1]);
    gameParity.dealer.shuffle();
    gameParity.upperHandPlayer.setName('Computer');
    gameParity.lowerHandPlayer.setName('Ola');
    let deck_pos;
    if(gameParity.dealer.current_dealer == gameParity.lowerHandPlayer) {
      deck_pos = 1;
    } else {
      deck_pos = -1;
    }
    // Talk to the game engine ends


    //
    // Place the deck
    //
    for (let i = CARD_PARITY_IDS.length - 1; i > -1; i--) {
      let card_id = gameParity.dealer.deck[i];

      this.sprites_hash[card_id] = this.add.sprite(
          -1000, -1000,
          'back');  // Create sprites, and display them outside the screen.

      this.sprites_hash[card_id].setX(
          70 + (CARD_PARITY_IDS.length - i) / 3);  // x value
      this.sprites_hash[card_id].setY(
          this.game.renderer.height / 2 + (CARD_PARITY_IDS.length - i) / 3 +
          deck_pos * 200);  // y value}

      this.anims.create({
        key: 'anim_key_' + card_id,
        frames: [{key: card_id}, {key: 'back'}],
      });
      this.anims_hash[card_id] = this.anims.get('anim_key_' + card_id);
      this.sprites_hash[card_id].setName(card_id);  // Sprite name
    }

    this.deal();
  }

  /////////////////////////////////////////////////////////////////////
  // Deal the 30 cards to the upper and lower hand.
  /////////////////////////////////////////////////////////////////////
  deal() {
    let dealTween = [];
    for (let i = CARD_PARITY_IDS.length - 1; i > -1; i--) {
      let card_id = gameParity.dealer.deck[i];

      let y_base = 0;
      if ((i % 2 != 0 &&
           gameParity.upperHandPlayer == gameParity.dealer.current_dealer) ||
          (i % 2 == 0 &&
           gameParity.lowerHandPlayer == gameParity.dealer.current_dealer)) {
        y_base = HAND_DIST_FROM_HORISONTAL_BORDERS;
      } else {
        this.lower_hand_ids.push(card_id);
        this.sprites_hash[card_id].setInteractive();
        this.sprites_hash[card_id].on(
            'pointerdown',
            () => {this.cardIsPressed(this.sprites_hash[card_id])}, this);

        y_base = this.game.renderer.height - HAND_DIST_FROM_HORISONTAL_BORDERS;
      }

      let x_value = game.renderer.width / 2 -
          2 * this.sprites_hash[card_id].width +
          i / 2 * HAND_DIST_BETWEEN_CARDS;

      dealTween[i] = this.tweens.create({
        targets: this.sprites_hash[card_id],
        y: y_base,
        x: x_value,
        duration: SPEED,
        ease: 'Linear',
        depth: i
      })

      dealTween[i].on('complete', () => {
        if (i != CARD_PARITY_IDS.length - 1) {  // The cards to be dealth
          dealTween[i + 1].play();
        } else {
          // Turn the lower hand cards to show front
          this.lower_hand_ids.forEach(e => {
            this.showFront(e);
          });

          gameParity.dealer.deal();

          this.placeCardsNice();
          //          this.emitter.on('placed_cards_nice', () => {
          //            this.emitter.off('placed_cards_nice');
          //            this.emitter.emit('begin_round');
          //          }, this);
        }
      });
    }
    dealTween[0].play();
  }

  placeCardsNice() {
    gameParity.upperHandPlayer.sortHand();
    gameParity.lowerHandPlayer.sortHand();

    console.log(
        'Upper hand ' + gameParity.upperHandPlayer.getName() + ' ' +
        gameParity.upperHandPlayer.getHand());
    console.log(
        'Lower hand ' + gameParity.lowerHandPlayer.getName() + ' ' +
        gameParity.lowerHandPlayer.getHand());

    if (gameParity.upperHandPlayer.getHand().length == 0) {
      return;
    }


    let upperTween;
    let lowerTween;
    for (let i = 0; i < gameParity.upperHandPlayer.getHand().length; i++) {
      upperTween = this.tweens.add({
        targets: this.sprites_hash[gameParity.upperHandPlayer.getHand()[i]],
        x: game.renderer.width / 2 -
            2 *
                this.sprites_hash[gameParity.upperHandPlayer.getHand()[i]]
                    .width +
            i * HAND_DIST_BETWEEN_CARDS,
        y: HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });

      lowerTween = this.tweens.add({
        targets: this.sprites_hash[gameParity.lowerHandPlayer.getHand()[i]],
        x: game.renderer.width / 2 -
            2 *
                this.sprites_hash[gameParity.lowerHandPlayer.getHand()[i]]
                    .width +
            i * HAND_DIST_BETWEEN_CARDS,
        y: this.game.renderer.height - HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });
    }
    //    upperTween.on('complete', () => {lowerTween.on('complete', () => {
    //                                this.emitter.emit('placed_cards_nice');
    //                              })});
  }

  showFront(card_id) {
    let anim = this.anims_hash[card_id];
    let frame;
    try {
      frame = anim.getFrameAt(FRONT_FRAME);
      this.sprites_hash[card_id].anims.setCurrentFrame(frame);
    } catch (err) {
      console.log(err);
    }
  }

  cardIsPressed(s) {
    console.log('Pointer down on card ' + s.name);
  }
}