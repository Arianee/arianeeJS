export const isPrivateKeyValid = (privateKey: string): boolean => {
  const isLength = privateKey.length === 66;
  const isHexaPrefix = privateKey.startsWith('0x');

  return isLength && isHexaPrefix;
};
