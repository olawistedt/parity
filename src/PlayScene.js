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
const SPEED = 0;
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
    this.load.image('button_ok', 'assets/buttons/button_ok.png');
    this.load.image('button_odd', 'assets/buttons/button_odd.png');
    this.load.image('button_even', 'assets/buttons/button_even.png');
    this.load.image('button_clubs', 'assets/buttons/button_clubs.png');
    this.load.image('button_diamonds', 'assets/buttons/button_diamonds.png');
    this.load.image('button_hearts', 'assets/buttons/button_hearts.png');
    this.load.image('button_spades', 'assets/buttons/button_spades.png');
  }

  create() {
    this.add.tileSprite(
        0, 0, this.game.renderer.width * 2, this.game.renderer.height * 2,
        'cloth');  // Add the background

    this.trumpText = this.add
                         .text(
                             this.game.renderer.width / 2,
                             this.game.renderer.height / 2, '#Placeholder#', {
                               fontFamily: '"Arial"',
                               fontSize: '40px',
                               depth: 100
                               //                  backgroundColor: '#0'
                             })
                         .setOrigin(0.5)
                         .setVisible(false);

    // Talk to the game engine begins
    let dealOrder = globalGameParity.dealer.randomDealer();
    globalGameParity.judge.init(dealOrder[0], dealOrder[1]);
    globalGameParity.dealer.shuffle();
    globalGameParity.upperHandPlayer.setName('Computer');
    globalGameParity.lowerHandPlayer.setName('Ola');
    let deck_pos;
    if (globalGameParity.dealer.current_dealer ==
        globalGameParity.lowerHandPlayer) {
      deck_pos = 1;
    } else {
      deck_pos = -1;
    }
    // Talk to the game engine ends


    //
    // Place the deck
    //
    for (let i = CARD_PARITY_IDS.length - 1; i > -1; i--) {
      let card_id = globalGameParity.dealer.deck[i];

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
  // Deal the 30 cards to the upper and lower hands.
  /////////////////////////////////////////////////////////////////////
  deal() {
    let dealTween = [];
    for (let i = CARD_PARITY_IDS.length - 1; i > -1; i--) {
      let card_id = globalGameParity.dealer.deck[i];

      let y_base = 0;
      if ((i % 2 != 0 &&
           globalGameParity.upperHandPlayer ==
               globalGameParity.dealer.current_dealer) ||
          (i % 2 == 0 &&
           globalGameParity.lowerHandPlayer ==
               globalGameParity.dealer.current_dealer)) {
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

          globalGameParity.dealer.deal();

          this.placeCardsNice();
          //          this.emitter.on('placed_cards_nice', () => {
          //            this.emitter.off('placed_cards_nice');
          //            this.emitter.emit('begin_round');
          //          }, this);
          // this.decideTrumpAndParity();
          this.playCards();

        }
      });
    }
    dealTween[0].play();
  }

  placeCardsNice() {
    globalGameParity.upperHandPlayer.sortHand();
    globalGameParity.lowerHandPlayer.sortHand();

    console.log(
        'Upper hand ' + globalGameParity.upperHandPlayer.getName() + ' ' +
        globalGameParity.upperHandPlayer.getHand());
    console.log(
        'Lower hand ' + globalGameParity.lowerHandPlayer.getName() + ' ' +
        globalGameParity.lowerHandPlayer.getHand());

    if (globalGameParity.upperHandPlayer.getHand().length == 0) {
      return;
    }


    let upperTween;
    let lowerTween;
    for (let i = 0; i < globalGameParity.upperHandPlayer.getHand().length;
         i++) {
      upperTween = this.tweens.add({
        targets:
            this.sprites_hash[globalGameParity.upperHandPlayer.getHand()[i]],
        x: game.renderer.width / 2 -
            2 *
                this.sprites_hash[globalGameParity.upperHandPlayer
                                      .getHand()[i]]
                    .width +
            i * HAND_DIST_BETWEEN_CARDS,
        y: HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });

      lowerTween = this.tweens.add({
        targets:
            this.sprites_hash[globalGameParity.lowerHandPlayer.getHand()[i]],
        x: game.renderer.width / 2 -
            2 *
                this.sprites_hash[globalGameParity.lowerHandPlayer
                                      .getHand()[i]]
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

  decideTrumpAndParity() {
    globalGameParity.judge.setTrump(globalGameParity.judge.leader.getTrump());
    globalGameParity.judge.setParity(
        globalGameParity.judge.opponent.getParity());

    if (globalGameParity.judge.dealer == globalGameParity.lowerHandPlayer) {
      let trump = globalGameParity.upperHandPlayer.getTrump();
      this.trumpText.setText(
          'AI NOMINATES THE TRUMP SUIT ' + colorFullName(trump) +
          '\n                   STATE ODD OR EVEN');
      this.trumpText.setVisible(true);
      globalGameParity.judge.setTrump(trump);
      console.log('Upper hand chooses trump ' + trump);
      let button_odd = this.add.image(0, 0, 'button_odd')
                           .setVisible(true)
                           .setY(this.game.renderer.height / 2 + 100)
                           .setX(this.game.renderer.width / 2 - 125)
                           .setInteractive();
      button_odd.on('pointerdown', () => {
        button_even.destroy();
        button_odd.destroy();
        this.trumpText.setVisible(false);
        globalGameParity.judge.setParity(ODD);
        this.playCards();
      });
      let button_even = this.add.image(0, 0, 'button_even')
                            .setVisible(true)
                            .setY(this.game.renderer.height / 2 + 100)
                            .setX(this.game.renderer.width / 2 + 125)
                            .setInteractive();

      button_even.on('pointerdown', () => {
        button_even.destroy();
        button_odd.destroy();
        this.trumpText.setVisible(false);
        globalGameParity.judge.setParity(EVEN);
        this.playCards();
      });
    } else {
      let trump;
      this.trumpText.setText('NOMINATE THE TRUMP SUIT');
      this.trumpText.setVisible(true);

      // Common function for all cases when the user choose trump
      let pointerDownCommon =
          () => {
            button_clubs.destroy();
            button_diamonds.destroy();
            button_hearts.destroy();
            button_spades.destroy();

            let parity = globalGameParity.judge.opponent.getParity();
            globalGameParity.judge.setParity(parity);
            if (parity == ODD) {
              this.trumpText.setText('AI STATES ODD PARITY');
            } else {
              this.trumpText.setText('AI STATES EVEN PARITY');
            }
            let button_ok = this.add.image(0, 0, 'button_ok')
                                .setVisible(true)
                                .setY(this.game.renderer.height / 2 + 100)
                                .setX(this.game.renderer.width / 2)
                                .setInteractive();

            button_ok.on('pointerdown', () => {
              button_ok.destroy();
              this.trumpText.setVisible(false);
              this.playCards();
            });
          }

      let button_clubs = this.add.image(0, 0, 'button_clubs')
                             .setVisible(true)
                             .setY(this.game.renderer.height / 2 + 50)
                             .setX(this.game.renderer.width / 2)
                             .setInteractive();

      button_clubs.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('c');
      });
      let button_diamonds = this.add.image(0, 0, 'button_diamonds')
                                .setVisible(true)
                                .setY(this.game.renderer.height / 2 + 110)
                                .setX(this.game.renderer.width / 2)
                                .setInteractive();

      button_diamonds.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('d');
      });
      let button_hearts = this.add.image(0, 0, 'button_hearts')
                              .setVisible(true)
                              .setY(this.game.renderer.height / 2 + 170)
                              .setX(this.game.renderer.width / 2)
                              .setInteractive();

      button_hearts.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('h');
      });
      let button_spades = this.add.image(0, 0, 'button_spades')
                              .setVisible(true)
                              .setY(this.game.renderer.height / 2 + 230)
                              .setX(this.game.renderer.width / 2)
                              .setInteractive();
      button_spades.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('s');
      });

      globalGameParity.judge.setTrump(trump);
      console.log('Lower hand chooses trump ' + trump);
    }
  }

  playCards() {
//    for(let i = 0; i < 15; i++) {
      if(globalGameParity.judge.leader == globalGameParity.upperHandPlayer) {

        // Play upper hand to table
        let upper_hand_card = globalGameParity.judge.leader.getCard();
        globalGameParity.judge.setLeadCard(upper_hand_card);
        let ai_sprite = this.sprites_hash[upper_hand_card];
        let playUpperToTable = this.tweens.create({
          targets: ai_sprite,
          y: this.game.renderer.height / 2,
          x: this.game.renderer.width / 2 + 40 * -1, // Place the card to the left
          duration: SPEED * 3,
          ease: 'Linear',
          depth: 1 + -1 // Depth 0 is set for the bottom card
        });
    
        this.showFront(upper_hand_card);
        playUpperToTable.play(); // Play the tween
        playUpperToTable.on('complete', () => {
          console.log('Time to play the user card.')
        });
      } else {
        // Play lower hand to table

      }
      // let lCard = globalGameParity.judge.leader.getCard();
      // globalGameParity.judge.setLeadCard(lCard);
      // let oCard = globalGameParity.judge.opponent.getCard();
      // globalGameParity.judge.setOpponentCard(oCard);
//}

  }

  cardIsPressed(sprite) {
    console.log('Pointer down on card ' + sprite.name);
    if( globalGameParity.lowerHandPlayer.getCard(sprite.name) ) {
      let playLowerToTable = this.tweens.create({
        targets: sprite,
        y: this.game.renderer.height / 2,
        x: this.game.renderer.width / 2,
        duration: SPEED * 3,
        ease: 'Linear',
        depth: 1 + 1
      });

      playLowerToTable.play();
      this.lower_hand_ids.forEach(e => {
        let s = this.sprites_hash[e];
        s.disableInteractive();
      });

    }


  }
}