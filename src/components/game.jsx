import React, { Component } from 'react';
import Row from './row';
import Cell from './cell';
import Footer from './footer';

import _ from 'lodash';

class Game extends Component {
  constructor(props) {
    super(props);

    this.matrix = [];

    for (let r = 0; r < this.props.rows; r++) {
      let row = [];
      for (let c = 0; c < this.props.columns; c++) {
        row.push(`${r}${c}`);
      }
      this.matrix.push(row);
    }
    let flatMatrix = _.flatten(this.matrix); //this will break all arrays into one
    this.activeCells = _.sampleSize(flatMatrix, this.props.activeCellsCount); //will pick random cells

    this.state = { gameState: 'ready', wrongGuesses: [], correctGuesses: [] };
  }

  componentDidMount() {
    /* setTimeout(() => this.setState({ gameState: 'memorize' }), 2000);
    setTimeout(() => this.setState({ gameState: 'recall' }), 4000);*/

    //Using Below approach to make sure recall is called only is memorize is successful
    //2nd arg of setState() takes a callback func which is executed only when setState is successfully complete
    this.memorizeTimerId = setTimeout(() => {
      this.setState({ gameState: 'memorize' }, () => {
        this.recallTimerId = setTimeout(this.startRecallMode.bind(this), 2000);
      });
    }, 2000);
  }

  componentWillUnmount() {
    clearTimeout(this.memorizeTimerId);
    clearTimeout(this.recallTimerId);
    this.finishGame();
  }

  finishGame(gameState) {
    clearInterval(this.playTimerId);
    return gameState;
  }

  startRecallMode() {
    this.setState({ gameState: 'recall' });
    this.secondsRemaining = this.props.timeoutSeconds;
    setInterval(() => {
      if (--this.secondsRemaining === 0) {
        this.setState({ gameState: this.finishGame('lost') });
      }
    }, 1000); //every second reduce 1sec from remaing time and check if remaining ===0 and mark lost
  }

  recordGuess = ({ cellId, userGuessIsCorrect }) => {
    let { wrongGuesses, correctGuesses, gameState } = this.state;
    if (userGuessIsCorrect) {
      correctGuesses.push(cellId);
      if (correctGuesses.length === this.props.activeCellsCount) {
        gameState = this.finishGame('won');
      }
    } else {
      wrongGuesses.push(cellId);
      if (wrongGuesses.length > this.props.allowedWrongAttempts) {
        gameState = this.finishGame('lost');
      }
    }
    this.setState({ correctGuesses, wrongGuesses, gameState });
  };

  render() {
    let showActiveCells =
      //check if state is memorize or lost then only display active cells
      ['memorize', 'lost'].indexOf(this.state.gameState) >= 0;

    return (
      //row-> will hv each array ; ri -> wl be that arry's index

      <div className="grid">
        {this.matrix.map((row, ri) => (
          <Row key={ri}>
            {row.map((cellId) => (
              <Cell
                key={cellId}
                id={cellId}
                {...this.state}
                activeCells={this.activeCells}
                recordGuess={this.recordGuess}
                showActiveCells={showActiveCells}
              />
            ))}
          </Row>
        ))}
        <Footer
          {...this.state}
          activeCellsCount={this.props.activeCellsCount}
          playAgain={this.props.createNewGame}
        />
      </div>
    );
  }
}

Game.defaultProps = {
  allowedWrongAttempts: 2,
  timeoutSeconds: 10,
};

export default Game;
