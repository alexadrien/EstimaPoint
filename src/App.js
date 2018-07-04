import React, {Component} from 'react';
import './App.css';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import find from 'lodash/find';
import {Container, Button, AppBar, ButtonsContainer, PointButton, CalcResult} from "./App.style";

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
    boards: [],
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
    this.setState({
      boards: allBoards,
    });
  };

  downloadCards = async () => {
    const lists = await window.Trello.get(`boards/${this.state.boardId}/lists`);
    const estimapointList = find(lists, {name: 'EstimaPoint'});
    const cards = await window.Trello.get(`lists/${estimapointList.id}/cards`);
    this.setState({cards: cards});
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
    if (currentCard.clicked) {
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
          {!this.state.logged && (
            <Toolbar>
              <Typography variant="subheading" color="inherit">
                Please login
              </Typography>
            </Toolbar>
          )}
          {this.state.logged && !this.state.boardId && this.state.boards.length > 0 && (
            <Toolbar>
              <Typography variant="subheading" color="inherit">
                Please select a board
              </Typography>
            </Toolbar>
          )}
          {((this.state.logged && this.state.boards.length === 0) || (this.state.boardId && this.state.cards.length === 0)) && (
            <Toolbar>
              <Typography variant="subheading" color="inherit">
                Please wait
              </Typography>
            </Toolbar>
          )}
        </AppBar>
        {!this.state.logged && (
          <Button variant="contained" onClick={this.authorizeTrello}>
            Connect to Trello
          </Button>
        )}
        {!this.state.boardId && this.state.logged && (
          <List component="nav">
            {this.state.boards.map((board) => (
              <React.Fragment>
                <ListItem button key={board.id}>
                  <ListItemText primary={board.name} onClick={async () => {
                    await this.setState({boardId: board.id});
                    this.downloadCards()
                  }}
                  />
                </ListItem>
                <Divider/>
              </React.Fragment>
            ))
            }
          </List>

        )}
        {this.state.boardId && (
          <ButtonsContainer>
            {this.state.cards.length > 0 && (
              <CalcResult>
                <Typography variant="title">{this.calculateResult()}</Typography>
              </CalcResult>
            )}
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
        )}

      </Container>
    );
  }
}

export default App;
