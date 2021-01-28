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
const TEST = false;
const SPEED = 400;  // Good for playing live is 400
const UPPER_HAND_IS_DEALER = -1;
const LOWER_HAND_IS_DEALER = 1;
const FRONT_FRAME = 0;
const BACK_FRAME = 1;
const HAND_DIST_FROM_HORISONTAL_BORDERS = 150;
const HAND_DIST_FROM_VERTICAL_BORDERS = 110;
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

    // Images
    this.load.image('cloth', 'assets/tilesets/bgslagrn.jpg');
    this.load.image('button_ok', 'assets/buttons/button_ok.png');
    this.load.image('button_odd', 'assets/buttons/button_odd.png');
    this.load.image('button_even', 'assets/buttons/button_even.png');
    this.load.image('button_clubs', 'assets/buttons/button_clubs.png');
    this.load.image('button_diamonds', 'assets/buttons/button_diamonds.png');
    this.load.image('button_hearts', 'assets/buttons/button_hearts.png');
    this.load.image('button_spades', 'assets/buttons/button_spades.png');

    // Audios
    this.load.audio('wrong_card', ['assets/sound/wrong_card.mp3']);
  }

  create() {
    this.add.tileSprite(
        0, 0, this.game.renderer.width * 2, this.game.renderer.height * 2,
        'cloth');  // Add the background

    this.snd_wrong_card = this.sound.add('wrong_card');

    this.chooseTrumpAndParityText =
        this.add
            .text(
                this.game.renderer.width / 2, this.game.renderer.height / 2,
                '#Placeholder#', {
                  fontFamily: '"Arial"',
                  fontSize: '40px',
                  depth: 100
                  // backgroundColor: '#0'
                })
            .setOrigin(0.5)
            .setVisible(false);

    this.showTrumpText =
        this.add
            .text(this.game.renderer.width - 100, 23, 'Trump', {
              fontFamily: '"Arial"',
              fontSize: '12px',
              depth: 100
              // backgroundColor: '#0'
            })
            .setOrigin(0.5)
            .setVisible(true);

    this.showParityText =
        this.add
            .text(this.game.renderer.width - 100, 37, 'Parity', {
              fontFamily: '"Arial"',
              fontSize: '12px',
              depth: 100
              // backgroundColor: '#0'
            })
            .setOrigin(0.5)
            .setVisible(true);

    this.showUpperNrOfTricks =
        this.add
            .text(this.game.renderer.width - 250, 400, '0', {
              fontFamily: '"Arial"',
              fontSize: '24px',
              depth: 100
              // backgroundColor: '#0'
            })
            .setOrigin(0.5)
            .setVisible(true);

    this.showLowerNrOfTricks = this.add
                                   .text(
                                       this.game.renderer.width - 250,
                                       this.game.renderer.height - 400, '0', {
                                         fontFamily: '"Arial"',
                                         fontSize: '24px',
                                         depth: 100
                                         // backgroundColor: '#0'
                                       })
                                   .setOrigin(0.5)
                                   .setVisible(true);

    // Talk to the game engine begins
    let dealOrder = globalGameParity.dealer.randomDealer();
    globalGameParity.judge.init(dealOrder[0], dealOrder[1]);
    globalGameParity.newSingleDeal();
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
      this.sprites_hash[card_id].setScale(.80);
      this.sprites_hash[card_id].setX(
          80 + (CARD_PARITY_IDS.length - i) / 3);  // x value
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
    this.max_depth = 4;
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

      let x_value =
          HAND_DIST_FROM_VERTICAL_BORDERS + i / 2 * HAND_DIST_BETWEEN_CARDS;

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
          this.decideTrumpAndParity();
        }
      });
    }
    dealTween[0].play();
  }

  placeCardsNice() {
    globalGameParity.upperHandPlayer.sortHand();
    globalGameParity.lowerHandPlayer.sortHand();

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
        x: HAND_DIST_FROM_VERTICAL_BORDERS + i * HAND_DIST_BETWEEN_CARDS,
        y: HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });

      lowerTween = this.tweens.add({
        targets:
            this.sprites_hash[globalGameParity.lowerHandPlayer.getHand()[i]],
        x: HAND_DIST_FROM_VERTICAL_BORDERS + i * HAND_DIST_BETWEEN_CARDS,
        y: this.game.renderer.height - HAND_DIST_FROM_HORISONTAL_BORDERS,
        duration: SPEED / 2,
        ease: 'Linear',
        depth: i
      });
    }
  }

  decideTrumpAndParity() {
    if (globalGameParity.judge.dealer == globalGameParity.lowerHandPlayer) {
      let trump = globalGameParity.upperHandPlayer.getTrump();
      this.chooseTrumpAndParityText.setText(
          'AI NOMINATES THE TRUMP SUIT ' + colorFullName(trump) +
          '\n                   STATE ODD OR EVEN');
      this.chooseTrumpAndParityText.setVisible(true);
      globalGameParity.judge.setTrump(trump);
      //      console.log('Upper hand chooses trump ' + trump);
      let button_odd = this.add.image(0, 0, 'button_odd')
                           .setVisible(true)
                           .setY(this.game.renderer.height / 2 + 100)
                           .setX(this.game.renderer.width / 2 - 125)
                           .setInteractive();
      button_odd.on('pointerdown', () => {
        button_even.destroy();
        button_odd.destroy();
        this.chooseTrumpAndParityText.setVisible(false);
        globalGameParity.judge.setParity(ODD);
        this.displayTrumpAndParity();
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
        this.chooseTrumpAndParityText.setVisible(false);
        globalGameParity.judge.setParity(EVEN);
        this.displayTrumpAndParity();
        this.playCards();
      });
      if (TEST) {
        button_odd.emit('pointerdown');
      }
    } else {
      this.chooseTrumpAndParityText.setText('NOMINATE THE TRUMP SUIT');
      this.chooseTrumpAndParityText.setVisible(true);

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
              this.chooseTrumpAndParityText.setText('AI STATES ODD PARITY');
            } else {
              this.chooseTrumpAndParityText.setText('AI STATES EVEN PARITY');
            }
            let button_ok = this.add.image(0, 0, 'button_ok')
                                .setVisible(true)
                                .setY(this.game.renderer.height / 2 + 100)
                                .setX(this.game.renderer.width / 2)
                                .setInteractive();

            button_ok.on('pointerdown', () => {
              button_ok.destroy();
              this.chooseTrumpAndParityText.setVisible(false);
              this.displayTrumpAndParity();
              this.playCards();
            });
            if (TEST) {
              button_ok.emit('pointerdown');
            }
          }

      let button_clubs = this.add.image(0, 0, 'button_clubs')
                             .setVisible(true)
                             .setY(this.game.renderer.height / 2 + 70)
                             .setX(this.game.renderer.width / 2)
                             .setInteractive();

      button_clubs.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('c');
      });
      let button_diamonds = this.add.image(0, 0, 'button_diamonds')
                                .setVisible(true)
                                .setY(this.game.renderer.height / 2 + 130)
                                .setX(this.game.renderer.width / 2)
                                .setInteractive();

      button_diamonds.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('d');
      });
      let button_hearts = this.add.image(0, 0, 'button_hearts')
                              .setVisible(true)
                              .setY(this.game.renderer.height / 2 + 190)
                              .setX(this.game.renderer.width / 2)
                              .setInteractive();

      button_hearts.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('h');
      });
      let button_spades = this.add.image(0, 0, 'button_spades')
                              .setVisible(true)
                              .setY(this.game.renderer.height / 2 + 250)
                              .setX(this.game.renderer.width / 2)
                              .setInteractive();
      button_spades.on('pointerdown', () => {
        pointerDownCommon();
        globalGameParity.judge.setTrump('s');
      });
      if (TEST) {
        button_clubs.emit('pointerdown');
      }
      //      console.log('Lower hand chooses trump ' + trump);
    }
  }

  displayTrumpAndParity() {
    if (globalGameParity.judge.parity == EVEN) {
      this.showParityText.setText('EVEN');
    } else {
      this.showParityText.setText('ODD');
    }
  }

  playCards() {
    this.showTrumpText.setText(colorFullName(globalGameParity.judge.trump));
    if (globalGameParity.judge.leader == globalGameParity.upperHandPlayer) {
      // Play upper hand to table
      let upper_hand_card = globalGameParity.judge.leader.getCard();
      globalGameParity.judge.setLeadCard(upper_hand_card);
      let ai_sprite = this.sprites_hash[upper_hand_card];
      let playUpperToTable = this.tweens.add({
        targets: ai_sprite,
        y: this.game.renderer.height / 2,
        x: this.game.renderer.width / 2 +
            40 * -1,  // Place the card to the left
        duration: SPEED * 3,
        ease: 'Linear',
        depth: 0  // Depth 0 is set for the bottom card
      });

      this.showFront(upper_hand_card);
      playUpperToTable.on('complete', () => {
        //        console.log('Time to play the user card.');
        this.lower_hand_ids.forEach(e => {
          let s = this.sprites_hash[e];
          s.setInteractive();
        });
      });
    } else {
      // Play lower hand to table
      this.lower_hand_ids.forEach(e => {
        let s = this.sprites_hash[e];
        s.setInteractive();
      });
      if(TEST) {
        let card_id = globalGameParity.lowerHandPlayer.getCard();
        this.sprites_hash[card_id].emit('pointerdown');
      }
    }
  }

  playUpperHandAfterLowerHand() {
    // Play upper hand to table
    let upper_hand_card = globalGameParity.judge.opponent.getCard();
    globalGameParity.judge.setOpponentCard(upper_hand_card);
    let ai_sprite = this.sprites_hash[upper_hand_card];
    let playUpperToTable = this.tweens.add({
      targets: ai_sprite,
      y: this.game.renderer.height / 2,
      x: this.game.renderer.width / 2 + 40 * 1,  // Place the card to the left
      duration: SPEED * 3,
      ease: 'Linear',
      depth: 2  // Depth 1 is set for the top card
    });
    playUpperToTable.on('complete', () => {
      this.getTrick();
      this.placeCardsNice();
    });
    this.showFront(ai_sprite.name)
  }

  cardIsPressed(sprite) {
    //    console.log('Pointer down on card ' + sprite.name);
    if (globalGameParity.lowerHandPlayer.getCard(sprite.name)) {
      if (globalGameParity.judge.leader == globalGameParity.lowerHandPlayer) {
        globalGameParity.judge.setLeadCard(sprite.name);
      } else {
        globalGameParity.judge.setOpponentCard(sprite.name);
      }
      let playLowerToTable = this.tweens.add({
        targets: sprite,
        y: this.game.renderer.height / 2,
        x: this.game.renderer.width / 2,
        duration: SPEED * 3,
        ease: 'Linear',
        depth: 1
      });

      this.lower_hand_ids.forEach(e => {
        let s = this.sprites_hash[e];
        s.disableInteractive();
      });

      playLowerToTable.on('complete', () => {
        if (globalGameParity.judge.leader ==
            globalGameParity.lowerHandPlayer) {
          this.playUpperHandAfterLowerHand();
        } else {
          this.getTrick();
          this.placeCardsNice();
        }
      });
    } else {  // The card pressed cannot be played.
      this.snd_wrong_card.play();
    }
  }

  getTrick() {
    let winningPlayer = globalGameParity.judge.getWinnerOfTrick();
    winningPlayer.addTrick([
      globalGameParity.judge.getLeadCard(),
      globalGameParity.judge.getOpponentCard()
    ]);
    this.showUpperNrOfTricks.setText(
        globalGameParity.upperHandPlayer.getNrOfTricks());
    this.showLowerNrOfTricks.setText(
        globalGameParity.lowerHandPlayer.getNrOfTricks());
    this.showBack(globalGameParity.judge.getLeadCard());
    this.showBack(globalGameParity.judge.getOpponentCard());
    console.log(
        'Cards played: Lead card ' + globalGameParity.judge.getLeadCard() +
        ' : Opponent card ' + globalGameParity.judge.getOpponentCard());
    let winner_y;
    if (winningPlayer == globalGameParity.upperHandPlayer) {
      winner_y = TRICKS_FROM_HORISONTAL_BORDER +
          20 * globalGameParity.upperHandPlayer.getNrOfTricks();
    } else {
      winner_y = this.game.renderer.height - TRICKS_FROM_HORISONTAL_BORDER -
          20 * globalGameParity.lowerHandPlayer.getNrOfTricks();
    }

    this.max_depth++;
    let timer = this.time.delayedCall(SPEED * 4, () => {
      let getTrick = this.tweens.add({
        targets: [
          this.sprites_hash[globalGameParity.judge.leadCard],
          this.sprites_hash[globalGameParity.judge.opponentCard]
        ],
        x: this.game.renderer.width - 150,
        y: winner_y,
        duration: SPEED * 3,
        ease: 'Linear',
        depth: this.max_depth,
        angle: 90
      });
      getTrick.on('complete', () => {
        if (!globalGameParity.judge.isEndOfSingleDeal()) {
          this.playCards();
        } else {
          let timer = this.time.delayedCall(SPEED * 4, () => {
            globalGameParity.judge.setTotalPoints();
            this.scene.start('SCORE');
          });
        }
      });
    });
  }

  showFront(card_id) {
    let anim = this.anims_hash[card_id];
    let frame;
    try {
      frame = anim.getFrameAt(FRONT_FRAME);
      this.sprites_hash[card_id].anims.setCurrentFrame(frame);
    } catch (err) {
      console.log('ERROR: showFront' + err);
    }
  }

  showBack(card_id) {
    let anim = this.anims_hash[card_id];
    let frame;
    try {
      frame = anim.getFrameAt(BACK_FRAME);
      this.sprites_hash[card_id].anims.setCurrentFrame(frame);
    } catch (err) {
      console.log('ERROR: showBack' + err);
    }
  }
}