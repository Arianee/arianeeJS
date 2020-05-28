export const deepFreeze = objectToFreeze => {
  for (const [key, value] of Object.entries(objectToFreeze)) {
    if (Object.prototype.hasOwnProperty.call(objectToFreeze, key) && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  Object.freeze(objectToFreeze);
  return objectToFreeze;
};
