export function getRandomInt (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function getRandomCharacter (letterOnly = false) {
  let randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  if (letterOnly) {
    randomChars = randomChars.substring(0, 26);
  }
  return randomChars.charAt(Math.floor(Math.random() * randomChars.length));
}
