export const isErrorInstance = (errPayload):boolean => {
  const err = errPayload && errPayload.error ? errPayload.error : errPayload;
  if (err && err.message) {
    return true;
  } else {
    return false;
  }
};

export const getErrorMessage = (errPayload:any) => {
  const err = errPayload && errPayload.error ? errPayload.error : errPayload;
  return err.message;
};

const isInError = (errPayload:any, possibleMessages:string[]):boolean => {
  const message = getErrorMessage(errPayload);

  if (message && possibleMessages.length > 0) {
    return possibleMessages.find(d => message.includes(d)) !== undefined;
  } else {
    return false;
  }
};
export const isAlreadyKnown = (errPayload:any):boolean => {
  const possibleMessages = ['AlreadyKnown'];
  return isInError(errPayload, possibleMessages);
};

export const isAlreadyTxWithSameNonce = (errPayload:any):boolean => {
  const possibleMessages = ['FeeTooLowToCompete'];
  return isInError(errPayload, possibleMessages);
};

export const isNonceTooLow = (errPayload:any):boolean => {
  const possibleMessages = ['OldNonce'];
  return isInError(errPayload, possibleMessages);
};
