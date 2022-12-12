export const getRandomNumber = (min?: number, max?: number) => {
  const minm = min ? min : 100000;
  const maxm = max ? max : 999999;
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
};
