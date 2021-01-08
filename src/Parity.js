/**
 * @author       Ola Wistedt <ola@witech.se>
 * @copyright    2020 Ola Wistedt.
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

class Player {
  constructor(judge) {
    this.hand = [];
    this.judge = judge;
  }

  /**
   * @param {string} card_id : The card id to add to this players hand.
   */
  addCard(card_id) {
    this.hand.push(card_id);
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

  getCard1() {
    let possible = this.judge.getPossibleCardsToPlay(this);
    let rand_card = Math.floor(Math.random() * possible.length);
    return possible[rand_card];
  }
}

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
  }

  /**
   *
   * @param {string} card : The lead card.
   */
  setLeadCard(card) {
    this.leadCard = card;
  }

  setOpponentCard(card) {
    this.opponentCard = card;
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
    this.leader = this.opponent;
  }

  getWinnerOfTrick() {
    if (cardColor(this.opponent) == cardColor(this.leader) &&
        cardValue(this.opponent) > cardValue(this.leader)) {
      return this.opponent;
    } else {
      return this.leader;
    }

    if (cardColor(this.opponent) != cardColor(this.leader) &&
        cardColor(this.opponent) == this.trump) {
      return this.opponent;
    }
    return this.leader;
  }
}

class JudgeParity extends Judge {
  constructor() {
    super();
  }
  /**
   *
   * @param {Array} player : The cards for this player
   */
  getPossibleCardsToPlay(player) {
    if (player == this.leader) {
      return player.hand;
    }

    // You must follow suite if possible
    let possible = [];
    player.hand.forEach(e => {
      if (cardColor(e) == cardColor(this.leadCard)) {
        possible.push(e);
      }
    });

    if (possible == []) {
      possible = player.hand;
    }

    return possible;
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

  play() {
    //    while(true) {
    let dealOrder = this.dealer.randomDealer();
    this.judge.init(dealOrder[0], dealOrder[1]);
    this.dealer.shuffle();
    this.dealer.deal();
    this.upperHandPlayer.sortHand();
    this.lowerHandPlayer.sortHand();
    console.log('Upper hand ' + this.upperHandPlayer.getHand());
    console.log('Lower hand ' + this.lowerHandPlayer.getHand());
    this.judge.trump = this.judge.leader.getTrump();
    this.judge.parity = this.judge.opponent.getParity();
    for (let i = 0; i < 15; i++) {
      this.judge.setLeadCard(this.judge.leader.getCard());
      this.judge.setOpponentCard(this.judge.opponent.getCard());

      let winningPlayer = this.judge.getWinnerOfTrick();
      //      this.judge.addTrickToPlayer(winningPlayer);
    }
    //    }
  }
}

// Uncomment these to run without GUI
judgeParity = new JudgeParity();
gameParity = new GameParity(judgeParity);
//gameParity.play();
