export enum ICard {
  ROCK = 0,
  PAPER,
  SCISSORS,
}

export const cardToType = (card: ICard) => {
  if (card == ICard.ROCK) return "rock";
  if (card == ICard.PAPER) return "paper";
  return "scissors";
};
