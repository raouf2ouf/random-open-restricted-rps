"use client";

import { Link } from "@nextui-org/react";
import "./page.scss";
function App() {
  return (
    <div className="page home-page">
      <div className="section">
        <div className="title">Random Open Restricted RPS (ROR RPS)</div>
        <div className="subtitle">
          A <em>Prouvably fair</em> multiplayer <em>Card Game</em>
        </div>
        <div className="content tldr">
          <p>
            <strong>TLDR;</strong> A multiplayer Card Game based on Rock Paper
            Scissors. Players join by providing a collateral and recieve{" "}
            <em>6 random (hidden) cards</em> (a collection of Rock, Paper,
            Scissors cards), <em>3 stars</em> and a certain amount of{" "}
            <em>in-game cash</em>. Players play matches by chosing a card and
            betting a number of stars. They can also buy and sell cards. At the
            end of the game, if a player has no more cards, he can redeem his
            stars for collateral. The fairness of the game is proven by the
            blockchain and any cheating can be automatically detected.
          </p>
        </div>
        <div className="subsection-title">Introduction</div>
        <div className="content">
          <p>
            <Link
              isExternal
              showAnchorIcon
              href="https://en.wikipedia.org/wiki/Rock_paper_scissors"
            >
              Rock, Paper, Scissors [RPS]
            </Link>{" "}
            is one the most iconic and played games all over the world (there is
            even an{" "}
            <Link
              isExternal
              showAnchorIcon
              href="https://wrpsa.com/rock-paper-scissors-tournaments/"
            >
              RPS World Championship
            </Link>
            ). However, there was always a debate on wether it is a game of{" "}
            <em>chance</em> or a game of <em>skill</em> ?
          </p>
          <p>
            <em>Restricted Random RPS</em> [RRPS] is a variant that adds
            complexity and amplifies the role of chance and skill. It is
            inspired by the famous{" "}
            <Link
              isExternal
              showAnchorIcon
              href="https://kaiji.fandom.com/wiki/Restricted_Rock_Paper_Scissors"
            >
              Resctricted RPS
            </Link>{" "}
            from the manga{" "}
            <Link
              isExternal
              showAnchorIcon
              href="https://kaiji.fandom.com/wiki/Kaiji_Wiki"
            >
              Kaiji
            </Link>
          </p>
        </div>

        <div className="subsection-title">How to play</div>
        <div className="content">
          <p>
            A game starts when a game master provides a hidden shuffled Deck of{" "}
            <em>36 cards</em> (12 Rock, 12 Paper, 12 Scissors) [the fairness of
            this deck (and of the game master) will be checked by the blockchain
            at the end of game]. You start by joining a game and providing a{" "}
            <em>collateral</em> for which you will recieve:
          </p>
          <ul>
            <li>
              <em>6 cards: </em> a collection of Rock, Paper, Scissors cards
              that are only known to you!
            </li>
            <li>
              <em>3 stars: </em> used to bet when you play a card. They are
              redeemable for collateral at the end of the game.
            </li>
            {/* <li>
              <em>In-game Cash: </em> used to buy and sell cards. You can only
              redeem stars if you have no cards in you hand!
            </li> */}
          </ul>
          <p>
            After which you can <em>offer</em> or <em>answer</em> a match: a
            match is offered by placing a hidden card and a bet (number of
            stars). Other players can answer your match by placing a card and
            bet at least equal to the minimum you indicated.
          </p>
        </div>

        <div className="subsection-title">How to win [or lose]</div>
        <div className="content">
          <ul>
            <li>
              You <em>win a game</em> when you have <em>at least 3 stars </em>
              and <em>no cards</em> at the end of the game. For each star above
              3 you will recieve additional collateral.
            </li>
            <li>
              You <em>lose a game </em>
              when you have <em>less than 3 stars</em> at the end of the game
              (you will still recieve part of your collateral for each star you
              have).
            </li>
            <li>
              You <em>draw a game</em> when you have more than 3 stars and at{" "}
              <em>least 1 card</em>. You will only recieve the collateral you
              used.
            </li>
          </ul>
        </div>
        <div className="subsection-title">
          Strategies and How to understand the UI
        </div>
        <div className="content">
          <p>
            Counter-intuitively, your aim should be to get rid of your cards as
            fast as possible once you have at least 3 stars. In order to do so,
            you can offer or answer matches (or pay others to take your cards by
            setting a negative number when you offer your cards). Before
            answering a match, you should have a look at the right section of
            the UI, you will see how many cards the player already played,
            sometimes you can even predict the card played by your opponent.
          </p>
          <p>
            You can see your hand for this game on the left menu along with a
            graph of you winnings (or losses).
          </p>
        </div>
        <div className="subsection-title">Cheat Detection and Fairness</div>
        <div className="content">
          <p></p>
        </div>
      </div>
    </div>
  );
}

export default App;
