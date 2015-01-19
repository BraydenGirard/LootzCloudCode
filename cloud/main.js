
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.job("spawnChests", function(request, status) {

  var result = [];

  var processCallback = function(res) {
    result = result.concat(res);
    if (res.length === 1000) {
      process(res[res.length-1].id);
      return;
    }

    // do something about the result, result is all the object you needed.
    status.success("final length " + result.length);
  }
  var process = function(skip) {

    var query = new Parse.Query("SpawnLocations");

    if (skip) {
      console.log("in if");
      query.greaterThan("objectId", skip);
    }
    query.limit(1000);
    query.ascending("objectId");
    query.find().then(function querySuccess(res) {
      processCallback(res);
    }, function queryFailed(reason) {
      status.error("query unsuccessful, length of result " + result.length + ", error:" + error.code + " " + error.message);
    });
  }
  process(false);


  var Chest = Parse.Object.extend("Chest");
  var toSaves = [];

  //Loop for the number of total locations
  for(i=0; i<result.length; i++) {
    var weaponRandom = Math.floor(Math.random() * 100) + 1;
    var otherRandom = Math.floor(Math.random() * 100) + 1;
    var aChest = new Chest();
    aChest.set("location") = new Parse.GeoPoint({latitude: result[i].get("latitude"), longitude: result[i].get("longitude")});

    if(weaponRandom < 5) {
      //4% chance weapon random
      var weaponUltraRareRandom = Math.floor(Math.random() * 4) + 1;

      if(weaponUltraRareRandom === 1) {
        //1% Staff
      } else if(weaponUltraRareRandom === 2) {
        //1% Axe
      } else if(weaponUltraRareRandom === 3) {
        //1% Armour
      } else if(weaponUltraRareRandom === 4) {
        //1% Long Shield
      }
    } else if(weaponRandom < 11) {
      //6% chance weapon random
      var weaponRareRandom = Math.floor(Math.random() * 3) + 1;

      if(weaponRareRandom === 1) {
        //2% Staff
      } else if(weaponRareRandom === 2) {
        //2% Axe
      } else if(weaponRareRandom === 3) {
        //2% Armour
      }
    } else if(weaponRandom < 19) {
      //8% Sword
    } else if(weaponRandom < 29) {
      //10% Bow
    } else if(weaponRandom < 41) {
      //12% Dagger
    } else if(weaponRandom < 61) {
      //20% Spear
    } else {
      //40% Toy Sword
    }

    if(otherRandom < 31) {
      //30% chance potion
      var potionRandom = Math.floor(Math.random() * 3) + 1;

      if(potionRandom === 1) {
        //10% Health
      } else if(potionRandom === 2) {
        //10% Energy
      } else if(potionRandom === 3) {
        //10% Armour
      }
    } else if(otherRandom < 61) {
      //30% chance special item
      var itemRandom = Math.floor(Math.random() * 3) + 1;

      if(itemRandom === 1) {
        //10% Map
      } else if(itemRandom === 2) {
        //10% Loot Bag
      } else if(itemRandom === 3) {
        //10% Bounty
      }
    } else {
      //Nothing
    }

    //Push chest to array for saving
    toSaves.push(aChest);
  }

  //Save array of all chests
  Parse.Object.saveAll(toSaves, {
    success: function(saveList) {
      response.success("All chests spawned");
    },
    error: function(error) {
      response.error("Unable to spawn chests.")
    }
  }

});
