/**
 * This file contains the game logic for Parity. There are also some classes
 * common to all trick taking games with trump.
 *
 * @author       Ola Wistedt <ola@witech.se>
 * @copyright    2021 Ola Wistedt.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */


function assert(condition, message) {
  if (!condition) {
    message = message || 'Assertion failed';
    if (typeof Error !== 'undefined') {
      throw new Error(message);
    }
    throw message;  // Fallback
  }
}

const EVEN = 0;
const ODD = 1;

// Thirty cards, consisting of A-K-Q-J-10-5-2 in each suit plus two Jokers,
const CARD_PARITY_IDS = [
  'c02', 'c05', 'c10', 'c11', 'c12', 'c13', 'c14', 'd02', 'd05',  'd10',
  'd11', 'd12', 'd13', 'd14', 'h02', 'h05', 'h10', 'h11', 'h12',  'h13',
  'h14', 's02', 's05', 's10', 's11', 's12', 's13', 's14', 'jk_b', 'jk_r'
];

cardValue =
    function(card) {
  return parseInt(card[1] + card[2]);
}

cardColor =
    function(card) {
  return card[0];
}

/**
 * @classdesc
 * A trick taking game player
 *
 * @class Player
 * @constructor
 *
 * @param {class Judge} judge - The judge of game rules:
 */
class Player {
  constructor(judge) {
    this.name = 'Unknown';
    this.hand = [];
    this.judge = judge;
    this.tricks = [];
  }

  setName(n) {
    this.name = n;
  }

  getName() {
    return this.name;
  }

  /**
   * @param {string} card_id : The card id to add to this players hand.
   */
  addCard(card_id) {
    this.hand.push(card_id);
  }

  removeCard(card_id) {
    let index = this.hand.indexOf(card_id);
    this.hand.splice(index, 1);
  }

  /**
   * @returns {Array} an array of cards that this player owns.
   */
  getHand() {
    return this.hand;
  }

  sortHand() {
    this.hand.sort();
    this.hand.reverse();
  }

  addTrick(trick) {
    this.tricks.push(trick);
  }

  getNrOfTricks() {
    return this.tricks.length;
  }

  clearTricks() {
    this.tricks = [];
  }
}

/**
 * @classdesc
 * The artificial intelligence
 *
 * Tries to play as smart as Ola Wistedt can program it.
 *
 * @class Ai
 * @extends Player
 * @constructor
 *
 * @param {number} level - The level of the Ai:
 */
class Ai extends Player {
  /**
   * @param {number} level the level of the AI.
   */
  constructor(level, judge) {
    super(judge);
    this.level = level;
  }
  getCard() {
    switch (this.level) {
      case 1:
        return this.getCard1();
      case 2:
        return this.getCard2();
      case 3:
        return this.getCard3();
    }
  }

  getTrump() {
    let a = ['c', 'd', 'h', 's'];
    return a[Math.floor(Math.random() * a.length)];
  }

  getParity() {
    let a = [EVEN, ODD];
    return a[Math.floor(Math.random() * a.length)];
  }

  // getCard1() chooses a random valid card to play
  getCard1() {
    let possible = this.judge.getPossibleCardsToPlay(this);
    let rand_card_pos = Math.floor(Math.random() * possible.length);
    let card_id = possible[rand_card_pos];
    this.removeCard(card_id);
    return card_id;
  }
}

/**
 * @classdesc
 * The judge
 *
 * @class Judge
 * @extends Nothing
 * @constructor
 *
 */
class Judge {
  constructor() {
    this.dealer;
    this.eldest;
    this.opponent;
    this.leader;
    this.trump;
    this.leaderCard;
    this.opponentCard;
  }

  init(dealer, eldest) {
    this.dealer = dealer;
    this.eldest = eldest;
    this.leader = this.eldest;
    this.opponent = this.dealer;
    this.leader.clearTricks();
    this.opponent.clearTricks();
  }

  /**
   *
   * @param {string} card : The lead card.
   */
  setLeadCard(card) {
    this.leadCard = card;
  }

  getLeadCard() {
    return this.leadCard;
  }

  setOpponentCard(card) {
    this.opponentCard = card;
  }

  getOpponentCard() {
    return this.opponentCard;
  }

  getPossibleCardsToPlay(player) {
    assert(false);
  }

  setTrump(color) {
    this.trump = color;
  }

  /**
   * Just change the leader (two players)
   */
  switchLeader() {
    let tmp;
    tmp = this.opponent;
    this.opponent = this.leader;
    this.leader = tmp;
  }
}

/**
 * @classdesc
 * The judge that can Parity game rules.
 *
 * @class JudgeParity
 * @extends Judge
 * @constructor
 *
 */
class JudgeParity extends Judge {
  constructor() {
    super();
    this.high_joker;
    this.low_joker;
    this.parity;
  }

  setTrump(color) {
    super.setTrump(color);
    if (color == 'h' || color == 'd') {
      this.high_joker = 'jk_r';
      this.low_joker = 'jk_b';
    } else {
      this.high_joker = 'jk_b';
      this.low_joker = 'jk_r';
    }
  }

  setParity(p) {
    this.parity = p;
  }

  /**
   *
   * @param {Array} player : The cards for this player
   */
  getPossibleCardsToPlay(player) {
    if (player == this.leader) {
      return player.hand;
    }

    let possible = [];

    // Same suit
    player.hand.forEach(e => {
      if (cardColor(e) == cardColor(this.leadCard)) {
        possible.push(e);
      }
    });

    // Any card can be played
    if (possible.length == 0) {
      possible = player.hand;
    }

    return possible;
  }

  // Side effect: Sets the leader of next round.
  getWinnerOfTrick() {
    if (cardColor(this.opponentCard) == cardColor(this.leadCard) &&
        cardValue(this.opponentCard) > cardValue(this.leadCard)) {
      this.switchLeader();
    } else if (
        cardColor(this.opponentCard) == this.trump &&
        cardColor(this.leadCard) != this.trump) {
      this.switchLeader();
    } else if (
        this.opponentCard == this.low_joker &&
        this.leadCard != this.high_joker) {
      this.switchLeader();
    } else if (this.opponentCard == this.high_joker) {
      this.switchLeader();
    }

    return this.leader;
  }
}

class Dealer {
  constructor(arrayOfPlayers) {
    this.arrayOfPlayers = arrayOfPlayers;
    this.deck = [];
    this.current_dealer = 0;
  }

  randomDealer() {
    let dealer_nr = Math.floor(Math.random() * this.arrayOfPlayers.length);
    let b = [];  // Array of the order, with dealer first.
    for (let i = 0; i < this.arrayOfPlayers.length; i++) {
      b.push(
          this.arrayOfPlayers[(dealer_nr + i) % this.arrayOfPlayers.length]);
    }
    this.current_dealer = b[0];
    return b;
  }

  /**
   *
   * @param {number} similar : How many cards to deal at a time.
   * @param {number} total : The total number of cards to deal to each player.
   */
  deal(similar, total) {
    assert(
        similar == 1, 'No support for deal more than one card at a time yet.');

    for (let i = 0; i < total * this.arrayOfPlayers.length; i++) {
      this.arrayOfPlayers[i % 2].addCard(this.deck.shift());
    }
  }

  shuffle(arrayOfCards) {
    let temp_ids = arrayOfCards.slice();  // Copy by value.
    for (let i = arrayOfCards.length - 1; i > -1; i--) {
      // Pick a random card from the card_array.
      let card_nr = Math.floor(Math.random() * temp_ids.length);
      let card_id = temp_ids.splice(card_nr, 1)[0];  // Remove card from deck.
      this.deck.push(card_id);
    }
  }
}

class ParityDealer extends Dealer {
  constructor(arrayOfPlayers) {
    super(arrayOfPlayers);
  }

  shuffle() {
    super.shuffle(CARD_PARITY_IDS);
  }

  deal() {
    super.deal(1, 15);
  }
}

class Game {
  constructor(judge) {
    this.judge = judge;
  }

  initPartie() {
    this.upperHandPlayer = new Ai(1, this.judge);
    this.lowerHandPlayer = new Ai(1, this.judge);
  }

  singleDeal(similar, total) {
    this.dealer.deal(similar, total);
  }
}

class GameParity extends Game {
  constructor(judge) {
    super(judge);
    super.initPartie();
    let a = [this.upperHandPlayer, this.lowerHandPlayer];
    this.dealer = new ParityDealer(a);
  }
}

// These global variables is used by the GUI and command line versions of
// Parity.
judgeParity = new JudgeParity();
gameParity = new GameParity(judgeParity);
