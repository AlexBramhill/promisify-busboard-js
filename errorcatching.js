let p1 = new Promise(function (resolve, reject) {
  setTimeout(function () {
    if (Math.random() < 0.5) {
      // if (true) {
      resolve("success");
    } else {
      reject(new Error("p1 promise rejected"));
    }
  }, 500);
});

let p2 = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve();
  }, 1000);
}).then(function () {
  if (Math.random() < 0.5) {
    // if (false) {
    return "success";
  } else {
    throw new Error("p2 error thrown");
  }
});

// p1.then(
//   function (result) {
//     return p2;
//   },
//   function (err) {
//     console.log(`This is a console log!  ${err}`);
//     return p2;
//   }
// ).catch(function (err) {
//   console.log(`This is a console log! ${err}`);
// });

Promise.all([
  p1.catch((err) => {
    return err.message;
  }),
  p2.catch((err) => {
    return err.message;
  }),
]).then((values) => {
  console.log(values);
});
