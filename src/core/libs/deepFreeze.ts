export const deepFreeze = objectToFreeze => {
  for (const [key, value] of Object.entries(objectToFreeze)) {
    if (Object.prototype.hasOwnProperty.call(objectToFreeze, key) && typeof value === 'object' && value !== null) {
      deepFreeze(value);
    }
  }
  Object.freeze(objectToFreeze);
  return objectToFreeze;
};
