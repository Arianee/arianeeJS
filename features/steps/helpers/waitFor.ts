export const waitFor = (n = 8000) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('foo');
    }, n);
  });
};
