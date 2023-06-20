export const EWMA = (alpha: number, prev: number, next: number) => {
  return alpha * prev + (1 - alpha) * next;
};
