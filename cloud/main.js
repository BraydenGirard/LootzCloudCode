
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.job("spawnChests", function(request, status) {

  //All randoms between and including 1 - 100
  var weaponRandom = Math.floor(Math.random() * 100) + 1;
  var potionRandom = Math.floor(Math.random() * 100) + 1;
  var itemRandom = Math.floor(Math.random() * 100) + 1;

  //Loop for the number of chests total
  for(i=0; i<100; i++) {

    if(weaponRandom < 11) {
      //10% chance weapon random
    } else if(weaponRandom < 31) {
      //20% chance weapon random
    }
  }


  response.success("Chests spawned!");
});
