
const parity = require('./Parity');

function play() {
  //    while(true) {
  let dealOrder = gameParity.dealer.randomDealer();
  gameParity.judge.init(dealOrder[0], dealOrder[1]);
  gameParity.dealer.shuffle();
  gameParity.dealer.deal();
  gameParity.upperHandPlayer.sortHand();
  gameParity.lowerHandPlayer.sortHand();
  gameParity.judge.trump = gameParity.judge.leader.getTrump();
  gameParity.judge.parity = gameParity.judge.opponent.getParity();
  for (let i = 0; i < 15; i++) {
    gameParity.judge.setLeadCard(gameParity.judge.leader.getCard());
    gameParity.judge.setOpponentCard(gameParity.judge.opponent.getCard());

    let winningPlayer = gameParity.judge.getWinnerOfTrick();
    //      gameParity.judge.addTrickToPlayer(winningPlayer);
    console.log('Upper hand ' + gameParity.upperHandPlayer.getHand());
    console.log('Lower hand ' + gameParity.lowerHandPlayer.getHand());
  
  }
  //    }
}

play();
