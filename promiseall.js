let p1 = Promise.resolve(4);
let p2 = Promise.resolve(8);

// // As then
// p1.then(function (result1) {
//   return p2.then(function (result2) {
//     console.log(result1 + result2);
//   });
// });

// As all
Promise.all([p1, p2]).then(([result1, result2]) => {
  console.log(result1 + result2);
});

// Promise all fails fast, which is preferable
