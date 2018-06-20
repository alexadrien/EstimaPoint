import React, {Component} from 'react';
import './App.css';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {Container, Button, AppBar, ErrorMessage, ButtonsContainer, PointButton, CalcResult} from "./App.style";

const formatTicketTitle = (ticketTitle) => {
  var ticketRegex = /\((.*)\)(.*)/g;
  var match = ticketRegex.exec(ticketTitle);
  console.log(ticketTitle, match);
  return {
    name: match[2],
    points: parseFloat(match[1])
  };
};

class App extends Component {
  state = {
    logged: false,
    boardExist: false,
    boardId: null,
    cards: [],
  };

  authorizeTrello = () => {
    window.Trello.authorize({
      type: 'popup',
      name: 'EstimaPoint',
      scope: {
        read: 'true',
        write: 'true'
      },
      expiration: '1day',
      success: (() => {
        this.setState({logged: true});
        this.checkBoard();
      }),
      error: (() => {
        this.setState({logged: false});
      })
    });
  };

  checkBoard = async () => {
    const me = await window.Trello.members.get("me");
    const allBoards = await Promise.all(me.idBoards.map((boardId) => window.Trello.boards.get(boardId)));
    const matchingBoard = allBoards.filter(({name}) => (name.indexOf("[EstimaPoint] AAA") > -1));
    if (matchingBoard.length >= 0) {
      this.setState({
        boardExist: true,
        boardId: matchingBoard[0].id
      });
      this.downloadCards();
    }
  };

  downloadCards = async () => {
    const cards = await window.Trello.get(`boards/${this.state.boardId}/cards`);
    this.setState({cards});
  };

  toggleCardState = (cardId) => {
    const newCards = this.state.cards.map(card => {
      if (card.id === cardId) {
        card.clicked = !card.clicked;
      }
      return card;
    });
    this.setState({cards: newCards});
  };

  calculateResult = () => (this.state.cards.reduce((counter, currentCard) => {
    if(currentCard.clicked){
      const {points} = formatTicketTitle(currentCard.name);
      return (counter + points);
    } else {
      return counter;
    }
  }, 0));

  render() {
    return (
      <Container>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              EstimaPoint
            </Typography>
          </Toolbar>
          {this.state.logged && (
            <Toolbar>
              <Typography variant="subheading" color="inherit">
                Logged
              </Typography>
            </Toolbar>
          )}
          {this.state.boardExist && this.state.logged && (
            <Toolbar>
              <Typography variant="subtitle" color="inherit">
                Board found
              </Typography>
            </Toolbar>
          )}
        </AppBar>
        {!this.state.logged && (
          <Button variant="contained" onClick={this.authorizeTrello}>
            Connect to Trello
          </Button>
        )}
        {!this.state.boardExist && this.state.logged && (
          <ErrorMessage variant="title" color="inherit">
            Please create a board with this name in your Trello Board :
            <Typography variant="headline" align="center">[EstimaPoint] AAA</Typography>
          </ErrorMessage>
        )}
        <ButtonsContainer>
          <CalcResult>
            <Typography variant="title">{this.calculateResult()}</Typography>
          </CalcResult>
          {this.state.cards.map(card => {
            return (
              <PointButton
                variant="contained"
                key={card.id}
                onClick={() => this.toggleCardState(card.id)}
                color={card.clicked ? "secondary" : "primary"}>
                {card.name}
              </PointButton>
            )
          })}
        </ButtonsContainer>
      </Container>
    );
  }
}

export default App;
