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
    this.deal_points = 0;
    this.total_points = 0;
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
    let clubs = this.hand.filter(e => e[0] == 'c');
    let diamonds = this.hand.filter(e => e[0] == 'd');
    let spades = this.hand.filter(e => e[0] == 's');
    let hearts = this.hand.filter(e => e[0] == 'h');
    let jokers = this.hand.filter(e => e[0] == 'j');

    if (clubs.length > 0) {
      clubs.sort();
      clubs.reverse();
    }
    if (diamonds.length > 0) {
      diamonds.sort();
      diamonds.reverse();
    }

    if (spades.length > 0) {
      spades.sort();
      spades.reverse();
    }

    if (hearts.length > 0) {
      hearts.sort();
      hearts.reverse();
    }

    if (this.judge.getTrump() == undefined) {
      this.hand = [];
      this.hand = this.hand.concat(jokers);
      this.hand = this.hand.concat(clubs);
      this.hand = this.hand.concat(diamonds);
      this.hand = this.hand.concat(spades);
      this.hand = this.hand.concat(hearts);
    } else {
      let result = [];
      if (this.judge.getTrump() == 'c') {
        if (this.hand.includes('jk_r')) {
          clubs.unshift('jk_r');
        }
        if (this.hand.includes('jk_b')) {
          clubs.unshift('jk_b');
        }
        result = result.concat(clubs);
        result = result.concat(diamonds);
        result = result.concat(spades);
        result = result.concat(hearts);
      } else if (this.judge.getTrump() == 'd') {
        if (this.hand.includes('jk_b')) {
          diamonds.unshift('jk_b');
        }
        if (this.hand.includes('jk_r')) {
          diamonds.unshift('jk_r');
        }
        result = result.concat(diamonds);
        result = result.concat(spades);
        result = result.concat(hearts);
        result = result.concat(clubs);
      } else if (this.judge.getTrump() == 's') {
        if (this.hand.includes('jk_r')) {
          spades.unshift('jk_r');
        }
        if (this.hand.includes('jk_b')) {
          spades.unshift('jk_b');
        }
        result = result.concat(spades);
        result = result.concat(hearts);
        result = result.concat(clubs);
        result = result.concat(diamonds);
      } else if (this.judge.getTrump() == 'h') {
        if (this.hand.includes('jk_b')) {
          hearts.unshift('jk_b');
        }
        if (this.hand.includes('jk_r')) {
          hearts.unshift('jk_r');
        }
        result = result.concat(hearts);
        result = result.concat(clubs);
        result = result.concat(diamonds);
        result = result.concat(spades);
      }
      this.hand = result;
    }
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

  clearHand() {
    this.hand = [];
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

    if (this.level == 3) {
      // Setup simulation to play with two ramdom (level 1) AI's
      this.simulateJudgeParity = new JudgeParity();
      this.simulateGameParity = new GameParity(1, 1, this.simulateJudgeParity);
    }
  }

  setAiLevel(nr) {
    this.level = nr;
  }

  getTrump() {
    switch (this.level) {
      case 1:
        return this.getTrump1();
      case 2:
        return this.getTrump2();
      case 3:
        return this.getTrump2();
      case 4:
        return this.getTrump2();
    }
  }

  getParity() {
    switch (this.level) {
      case 1:
        return this.getParity1();
      case 2:
        return this.getParity1();
      case 3:
        return this.getParity3();
      case 4:
        return this.getParity3();
    }
  }

  getCard() {
    switch (this.level) {
      case 1:
        return this.getCard1();
      case 2:
        return this.getCard2();
      case 3:
        return this.getCard3();
      case 4:
        return this.getCard4();
    }
  }

  getTrump1() {
    let a = ['c', 'd', 'h', 's'];
    return a[Math.floor(Math.random() * a.length)];
  }

  getTrump2() {
    // Count hearts
    let color_count = {'c': 0, 'd': 0, 'h': 0, 's': 0};
    this.hand.forEach(e => {
      color_count[cardColor(e)] += cardValue(e);
    });
    // Find out color with highest sum
    let max = 0;
    let max_color = '';
    for (const property in color_count) {
      if (color_count[property] > max) {
        max = color_count[property];
        max_color = property
      }
    }
    return max_color;
  }

  getParity1() {
    let a = [EVEN, ODD];
    return a[Math.floor(Math.random() * a.length)];
  }

  getParity3() {
    // Upperhand is the opponent and should choose parity and thereafter the
    // leader plays the first card.
    let localJudgeParity = new JudgeParity();
    let localGameParity = new GameParity(1, 1, localJudgeParity);
    localGameParity.judge.setTrump(globalGameParity.judge.getTrump());
    localGameParity.upperHandPlayer.setName('Opponent');
    localGameParity.lowerHandPlayer.setName('Leader');

    let testingParity = ODD;
    let nr_of_odd_games_won = 0;
    let nr_of_even_games_won = 0;

    for (let i = 0; i < 1000; i++) {
      if (testingParity == ODD) {
        testingParity = EVEN;
      } else {
        testingParity = ODD;
      }
      localJudgeParity.init(
          localGameParity.upperHandPlayer, localGameParity.lowerHandPlayer);
      localGameParity.newSingleDeal();  // Clears tricks
      localGameParity.judge.leader.hand = this.judge.leader.hand.slice();
      localGameParity.judge.opponent.hand = this.judge.opponent.hand.slice();
      localGameParity.judge.setParity(testingParity);

      // Play a single deal
      while (!localGameParity.judge.isEndOfSingleDeal()) {
        let lCard = localGameParity.judge.leader.getCard();
        localGameParity.judge.setLeadCard(lCard);
        let oCard = localGameParity.judge.opponent.getCard();
        localGameParity.judge.setOpponentCard(oCard);
        let winningPlayer = localGameParity.judge.getWinnerOfTrick();
        winningPlayer.addTrick([
          localGameParity.judge.getLeadCard(),
          localGameParity.judge.getOpponentCard()
        ]);
      }

      localGameParity.judge.setTotalPoints();

      if (localGameParity.lowerHandPlayer.deal_points >
              localGameParity.upperHandPlayer.deal_points &&
          testingParity == ODD) {
        nr_of_odd_games_won++;
      } else if (
          localGameParity.lowerHandPlayer.deal_points >
              localGameParity.upperHandPlayer.deal_points &&
          testingParity == EVEN) {
        nr_of_even_games_won++;
      }
    }
    if (nr_of_odd_games_won > nr_of_even_games_won) {
      return ODD;
    } else {
      return EVEN;
    }
  }

  // getCard1() chooses a random valid card to play
  getCard1() {
    let possible = this.judge.getPossibleCardsToPlay(this);
    let rand_card_pos = Math.floor(Math.random() * possible.length);
    let card_id = possible[rand_card_pos];
    this.removeCard(card_id);
    return card_id;
  }

  // getCard2() chooses the highest valid card to play. If it isn't the leader.
  // Play the highest card if it will win, otherwise play the lowest card.
  getCard2() {
    let card_id;
    if (this == this.judge.leader) {
      let possible = this.judge.getPossibleCardsToPlay(this);
      possible = possible.sort().reverse();
      card_id = possible[0];
    } else {
      let possible = this.judge.getPossibleCardsToPlay(this);
      possible = possible.sort().reverse();
      card_id = possible[0];
      if (cardValue(this.judge.leadCard) > cardValue(card_id)) {
        // Play a lower card if possible
        possible.reverse();
        card_id = possible[0];
      }

      // Play a low trump if possible.
      let trumps = [];
      possible.forEach(e => {
        if (cardColor(e) == this.judge.trump) {
          trumps.push(e);
        }
      });
      if (trumps.length != 0) {
        card_id = trumps.sort()[0];
      }
    }
    this.removeCard(card_id);
    return card_id;
  }

  // Simulates a bunch of games with current hands. Chooses to play the card
  // that takes the most tricks and has correct parity. If correct parity was
  // not discovered choose the card that leads to most tricks (to minimize
  // opponent points).
  // Let this player be the simulator upper hand player
  getCard3() {
    let possible = this.judge.getPossibleCardsToPlay(this);

    let a = [];  // Array of results for each card

    let simulator_rounds = 10;
    let points_correct_parity = 55;
    let points_per_trick = 3;

    possible.forEach(current_card => {
      a.push(this.simulatePlayCard(
          current_card, simulator_rounds, points_correct_parity,
          points_per_trick));
    });

    // Find the card with highest score
    let max = ['', 0];
    for (let i = 0; i < a.length; i++) {
      if (a[i][1] >= max[1]) {
        max[0] = a[i][0];
        max[1] = a[i][1];
      }
    }

    this.removeCard(max[0]);
    return max[0];
  }

  simulatePlayCard(
      current_card, times, points_correct_parity, points_per_trick) {
    let trick_table = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.simulateGameParity.judge.setTrump(this.judge.trump);
    this.simulateGameParity.judge.setParity(this.judge.parity);
    this.simulateGameParity.upperHandPlayer.setName('Sim Upper');
    this.simulateGameParity.lowerHandPlayer.setName('Sim Lower');

    for (let i = 0; i < times; i++) {
      // Setup the simulator game to reflect the main game
      if (this == this.judge.leader) {  // this is the player with AI level 3
        this.simulateGameParity.judge.leader =
            this.simulateGameParity.lowerHandPlayer;
        this.simulateGameParity.judge.opponent =
            this.simulateGameParity.upperHandPlayer;
      } else {
        this.simulateGameParity.judge.leader =
            this.simulateGameParity.upperHandPlayer;
        this.simulateGameParity.judge.opponent =
            this.simulateGameParity.lowerHandPlayer;
      }
      this.simulateGameParity.judge.leader.hand =
          this.judge.leader.hand.slice();
      this.simulateGameParity.judge.opponent.hand =
          this.judge.opponent.hand.slice();

      this.simulateGameParity.judge.leader.tricks =
          this.judge.leader.tricks.slice();
      this.simulateGameParity.judge.opponent.tricks =
          this.judge.opponent.tricks.slice();

      if (this == this.judge.leader) {
        // No card has been played. This AI will lead into the first trick. Set
        // current card to the lead card and ask the AI simulator to play the
        // opponent card.
        this.simulateGameParity.judge.setLeadCard(current_card);
        this.simulateGameParity.lowerHandPlayer.removeCard(current_card);
        let oCard = this.simulateGameParity.judge.opponent.getCard();
        this.simulateGameParity.judge.setOpponentCard(oCard);
      } else {
        // Set simulator lead card to be the current lead card. The card has
        // already been played in this moment.
        let lCard = this.judge.getLeadCard();
        this.simulateGameParity.judge.setLeadCard(lCard);
        this.simulateGameParity.judge.setOpponentCard(current_card);
        this.simulateGameParity.lowerHandPlayer.removeCard(current_card);
      }

      let winningPlayer = this.simulateGameParity.judge.getWinnerOfTrick();
      //      console.log('winner of first trick is ' +
      //      winningPlayer.getName());
      winningPlayer.addTrick([
        this.simulateGameParity.judge.getLeadCard(),
        this.simulateGameParity.judge.getOpponentCard()
      ]);

      // Test play the rest of the hand with
      while (!this.simulateGameParity.judge.isEndOfSingleDeal()) {
        //        console.log(
        //            'Leader in sub game is ' +
        //            this.simulateGameParity.judge.leader.getName());
        let lCard = this.simulateGameParity.judge.leader.getCard();
        if (lCard == undefined) {
          console.log('Error');
        }
        this.simulateGameParity.judge.setLeadCard(lCard);
        let oCard = this.simulateGameParity.judge.opponent.getCard();
        this.simulateGameParity.judge.setOpponentCard(oCard);
        //        console.log('Cards played ' + lCard + ' - ' + oCard);
        let winningPlayer = this.simulateGameParity.judge.getWinnerOfTrick();
        //        console.log('winner of trick is ' + winningPlayer.getName());
        winningPlayer.addTrick([
          this.simulateGameParity.judge.getLeadCard(),
          this.simulateGameParity.judge.getOpponentCard()
        ]);
      }

      let won_tricks = this.simulateGameParity.lowerHandPlayer.getNrOfTricks();
      trick_table[won_tricks]++;
    }

    //
    // Draw conclusions about the above simulations
    //
    let max_points = 0;
    for (let i = 0; i < trick_table.length; i++) {
      let points = 0;

      // Set points for correct parity
      if (i % 2 == 0 && this.simulateGameParity.judge.parity == EVEN) {
        points = points_correct_parity;
      } else if (i % 2 != 0 && this.simulateGameParity.judge.parity == ODD) {
        points = points_correct_parity;
      }

      // Set points per trick
      points += points_per_trick * i;

      // Multiplicate with the % of chance this occurs
      points *= trick_table[i] / times;

      if (points >= max_points) {
        max_points = points;
      }
    }
    return [current_card, max_points];
  }
}  // End of class Ai

/**
 * @classdesc
 * The artificial intelligence
 *
 * Tries to play as smart as Ola Wistedt can program it.
 *
 * @class Human
 * @extends Player
 * @constructor
 *
 */
class Human extends Player {
  constructor(judge) {
    super(judge);
  }

  getCard(card_id) {
    let possible = this.judge.getPossibleCardsToPlay(this);
    if (!possible.includes(card_id)) {
      return false;
    }
    this.removeCard(card_id);
    return true;
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
    this.leadCard;
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

  getTrump() {
    return this.trump;
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
      if (cardColor(this.leadCard) == 'j' && cardColor(e) == 'j') {
        possible.push(e);
      }
      if (cardColor(this.leadCard) == 'j' && cardColor(e) == this.trump) {
        possible.push(e);
      }
      if (cardColor(this.leadCard) == this.trump && cardColor(e) == 'j') {
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
        cardColor(this.leadCard) != 'j' &&
        cardValue(this.opponentCard) > cardValue(this.leadCard)) {
      this.switchLeader();
    } else if (
        cardColor(this.opponentCard) == this.trump &&
        cardColor(this.leadCard) != 'j' &&
        cardColor(this.leadCard) != this.trump) {
      this.switchLeader();
    } else if (
        cardColor(this.opponentCard) == 'j' &&
        this.leadCard != this.high_joker) {
      this.switchLeader();
    }

    return this.leader;
  }

  isEndOfSingleDeal() {
    return this.leader.getNrOfTricks() + this.opponent.getNrOfTricks() == 15
  }

  // setDealPoints() returns the points of the leading player.
  setDealPoints() {
    if (!this.isEndOfSingleDeal()) {
      assert(false, 'Trying to set points but single deal is not over.');
    }

    if (this.parity == EVEN) {
      if (this.leader.getNrOfTricks() % 2 == 0) {
        this.leader.deal_points += this.leader.getNrOfTricks() + 10;
      } else {
        this.opponent.deal_points += this.opponent.getNrOfTricks() + 10;
      }
    } else {  // ODD parity
      if (this.leader.getNrOfTricks() % 2 == 1) {
        this.leader.deal_points += this.leader.getNrOfTricks() + 10;
      } else {
        this.opponent.deal_points += this.opponent.getNrOfTricks() + 10;
      }
    }
    return this.getMaxPoints();
  }

  // setPoints() returns the points of the leading player.
  setTotalPoints() {
    this.setDealPoints();
    this.leader.total_points += this.leader.deal_points;
    this.opponent.total_points += this.opponent.deal_points;
    return this.getMaxPoints();
  }

  getMaxPoints() {
    if (this.leader.total_points > this.opponent.total_points) {
      return this.leader.total_points;
    } else {
      return this.opponent.total_points;
    }
  }
}

/**
 * @classdesc
 * The dealer
 *
 * @class Dealer
 * @extends Nothing
 * @constructor
 *
 */
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

  nextDealer() {
    let index_current_dealer =
        this.arrayOfPlayers.indexOf(this.current_dealer);
    let next_dealer_index =
        (index_current_dealer + 1) % this.arrayOfPlayers.length;
    this.current_dealer = this.arrayOfPlayers[next_dealer_index];

    this.clearHands();
  }

  getDealer() {
    return this.current_dealer;
  }

  getEldest() {
    return this.arrayOfPlayers[(this.arrayOfPlayers.indexOf(this.current_dealer) + 1) %
        this.arrayOfPlayers.length];
  }

  clearHands() {
    this.arrayOfPlayers.forEach(p => {
      p.clearHand();
    });
  }

  /**
   *
   * @param {number} similar : How many cards to deal at a time.
   * @param {number} total : The total number of cards to deal to each
   *     player.
   */
  deal(similar, total) {
    assert(
        similar == 1, 'No support for deal more than one card at a time yet.');

    let index_current_dealer =
        this.arrayOfPlayers.indexOf(this.current_dealer);

    for (let i = 0; i < total * this.arrayOfPlayers.length; i++) {
      this.arrayOfPlayers[(i + index_current_dealer + 1) % this.arrayOfPlayers.length]
          .addCard(this.deck.pop());
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

}  // End of class Dealer

/**
 * @classdesc
 * The Parity dealer
 *
 * @class ParityDealer
 * @extends Dealer
 * @constructor
 *
 */
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

/**
 * @classdesc
 * The game
 *
 * @class Game
 * @extends Nothing
 * @constructor
 *
 */
class Game {
  constructor(judge) {
    this.judge = judge;
  }

  singleDeal(similar, total) {
    this.dealer.deal(similar, total);
  }
}

/**
 * @classdesc
 * The Parity game
 *
 * @class GameParity
 * @extends Game
 * @constructor
 *
 */
class GameParity extends Game {
  constructor(upper_hand_ai_level, lower_hand_ai_level, judge) {
    super(judge);
    if (upper_hand_ai_level == 0) {
      this.upperHandPlayer = new Human(this.judge);
    } else {
      this.upperHandPlayer = new Ai(upper_hand_ai_level, this.judge);
    }
    if (lower_hand_ai_level == 0) {
      this.lowerHandPlayer = new Human(this.judge);
    } else {
      this.lowerHandPlayer = new Ai(lower_hand_ai_level, this.judge);
    }
    let a = [this.upperHandPlayer, this.lowerHandPlayer];
    this.dealer = new ParityDealer(a);
  }
  setAiLevel(level) {
    this.upperHandPlayer.setAiLevel(level);
  }
  newGame() {
    let dealOrder = this.dealer.randomDealer();
    this.judge.init(dealOrder[0], dealOrder[1]);
    this.upperHandPlayer.clearTricks();
    this.lowerHandPlayer.clearTricks();
    this.upperHandPlayer.deal_points = 0;
    this.lowerHandPlayer.deal_points = 0;
    this.upperHandPlayer.total_points = 0;
    this.lowerHandPlayer.total_points = 0;
    this.dealer.clearHands();
  }
  newSingleDeal() {
    this.upperHandPlayer.deal_points = 0;
    this.lowerHandPlayer.deal_points = 0;
    this.upperHandPlayer.clearTricks();
    this.lowerHandPlayer.clearTricks();
  }
}

// These global variables is used by the GUI and command line versions of
// Parity.
globalJudgeParity = new JudgeParity();
let level = 0;  // Human player
let level_ai = 3;
if (TEST) {
  level = 1;  // AI level 1 player
  level_ai = 1;
}
globalGameParity = new GameParity(level_ai, level, globalJudgeParity);

module.exports = GameParity;