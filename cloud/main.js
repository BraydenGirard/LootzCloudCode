Parse.Cloud.job("spawnChests", function(request, status) {

  var Chest = Parse.Object.extend("Chest");
  var result = [];
  var toSaves = [];
  var startIndex = 0;
  var stopIndex = 1800;
  var time;

  var querySpawnLocationsCallback = function(res) {
    //console.log("Query found " + res.length + " item");
    var spawnRandom = Math.floor(Math.random() * 3) + 1;

    if(spawnRandom === 1) {
      result = result.concat(res);
    }

    //console.log("Result length after concat " + result.length);
    if (res.length === 1000) {
      querySpawnLocations(res[res.length-1].id);
    }
    else {
      rng();
    }
  }

  var querySpawnLocations = function(skip) {

    var query = new Parse.Query("SpawnLocations");

    if (skip) {
      //console.log("In if, more than 1000 objects, do skip");
      query.greaterThan("objectId", skip);
    }
    query.limit(1000);
    query.ascending("objectId");
    query.find().then(function querySuccess(res) {
      querySpawnLocationsCallback(res);
    }, function queryFailed(reason) {
      status.error("query unsuccessful, length of result " + result.length + ", error:" + error.code + " " + error.message);
    });
  }

  var rng = function() {
    console.log("Result length is: " + result.length + " before the loop");
    //Loop for the number of total locations
    for(i=0; i<result.length; i++) {
      //console.log("In for loop, iteration: " + i);
      var weaponRandom = Math.floor(Math.random() * 100) + 1;
      var goldRandom = Math.floor(Math.random() * 100) + 1;
      var otherRandom = Math.floor(Math.random() * 100) + 1;
      var aChest = new Chest();
      var geoPoint = new Parse.GeoPoint({latitude: result[i].get("latitude"), longitude: result[i].get("longitude")})
      aChest.set("location", geoPoint);

      if(weaponRandom < 5) {
        //4% chance weapon random
        var weaponUltraRareRandom = Math.floor(Math.random() * 4) + 1;

        if(weaponUltraRareRandom === 1) {
          //1% Staff
          aChest.set("weapon", "Staff");
        } else if(weaponUltraRareRandom === 2) {
          //1% Axe
          aChest.set("weapon", "Axe");
        } else if(weaponUltraRareRandom === 3) {
          //1% Armour
          aChest.set("weapon", "Body_Armour");
        } else if(weaponUltraRareRandom === 4) {
          //1% Large Shield
          aChest.set("weapon", "Large_Shield");
        }
      } else if(weaponRandom < 11) {
        //6% chance weapon random
        var weaponRareRandom = Math.floor(Math.random() * 3) + 1;

        if(weaponRareRandom === 1) {
          //2% Mace
          aChest.set("weapon", "Mace");
        } else if(weaponRareRandom === 2) {
          //2% Helmet
          aChest.set("weapon", "Helmet");
        } else if(weaponRareRandom === 3) {
          //2% Small Shield
          aChest.set("weapon", "Small_Shield");
        }
      } else if(weaponRandom < 19) {
        //8% Sword
        aChest.set("weapon", "Sword");
      } else if(weaponRandom < 29) {
        //10% Bow
        aChest.set("weapon", "Bow");
      } else if(weaponRandom < 41) {
        //12% Dagger
        aChest.set("weapon", "Dagger");
      } else if(weaponRandom < 61) {
        //20% Spear
        aChest.set("weapon", "Spear");
      } else {
        //40% Toy Sword
        aChest.set("weapon", "Toy_Sword");
      }

      if(goldRandom < 3 && weaponRandom < 61) {
        aChest.set("weaponGold", true);
      }
      else {
        aChest.set("weaponGold", false);
      }

      if(otherRandom < 31) {
        //30% chance potion
        var potionRandom = Math.floor(Math.random() * 3) + 1;

        if(potionRandom === 1) {
          //10% Health
          aChest.set("item", "Health_Potion");
        } else if(potionRandom === 2) {
          //10% Energy
          aChest.set("item", "Energy_Potion");
        } else if(potionRandom === 3) {
          //10% Clarity
          aChest.set("item", "Clarity_Potion");
        }
      }

      aChest.set("gold", Math.floor(Math.random() * 100) + 1);

      //Push chest to array for saving
      toSaves.push(aChest);

      //console.log("Location of chest " + i + " " + toSaves[i].get("location"));
      //console.log("Amount of gold in chest " + i + " " + toSaves[i].get("gold"));

    }

    console.log("Number of items to be saved: " + toSaves.length);

    if(stopIndex >= toSave.length - 1) {
      stopIndex = -1;
      save();
    }
    else {
      save();

      time = new Date().getTime() / 1000

      while(stopIndex < toSave.length - 1) {
        if((time + 60) < (new Date().getTime() / 1000)) {
          console.log("1 min wait complete");
          time = new Date().getTime() / 1000;
          save();
        }
      }
      stopIndex = -1;
      save();
      }

    status.success("All chests spawned");
  }

  function save() {
    //Save array of all chests
    Parse.Object.saveAll(toSaves.slice(startIndex, stopIndex), {
      success: function(saveList) {
        if(stopIndex === -1) {
          status.success("All chests spawned");
        }
        startIndex + 1800;
        stopIndex + 1800;
      },
      error: function(error) {
        status.error("Unable to spawn chests. Error is: " + error.message);
      }
    });
  }

  querySpawnLocations(false);

});

Parse.Cloud.job("removeChests", function(request, status) {

  var Chest = Parse.Object.extend("Chest");
  var chests = [];
  var startIndex = 0;
  var stopIndex = 1800;
  var time;

  var queryChestsCallback = function(res) {

    chests = chests.concat(res);

    if (res.length === 1000) {
      queryChests(res[res.length-1].id);
    }
    else {
      if(stopIndex >= chests.length - 1) {
        stopIndex = -1;
        removeChests();
      }
      else {
        removeChests();

        time = new Date().getTime() / 1000

        while(stopIndex < chests.length - 1) {
          if((time + 60) < (new Date().getTime() / 1000)) {
            console.log("1 min wait complete");
            time = new Date().getTime() / 1000;
            removeChests();
          }
        }
        stopIndex = -1;
        removeChests();
        }
    }
  }

  var queryChests = function(skip) {

    var query = new Parse.Query("Chest");

    if (skip) {
      //console.log("In if, more than 1000 objects, do skip");
      query.greaterThan("objectId", skip);
    }
    query.limit(1000);
    query.ascending("objectId");
    query.find().then(function querySuccess(res) {
      queryChestsCallback(res);
    }, function queryFailed(reason) {
      status.error("query unsuccessful, length of result " + result.length + ", error:" + error.code + " " + error.message);
    });
  }

  function removeChests() {
    //Remove all chests
    Parse.Object.destroyAll(chests.slice(startIndex, stopIndex), {
      success: function(deleteList) {
        if(stopIndex === -1) {
          status.success("All chests removed");
        }
        startIndex + 1800;
        stopIndex + 1800;
      },
      error: function(error) {
        status.error("Unable to remove chests. Error is: " + error.message);
      }
    });
  }

  queryChests(false);
});
