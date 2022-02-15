module.exports = function(obj, allowed) {
  filtred = {};

  Object.keys(obj).map(function(key) {
      if(allowed.includes(key)) {
        filtred[key] = obj[key];
      }
  });

  return filtred;
}