export function flatPromise () {
  let resolve, reject;

  const promise = new Promise((res, rej) => { // eslint-disable-line promise/param-names
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
