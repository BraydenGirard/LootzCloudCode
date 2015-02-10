Parse.Cloud.job("spawnChests", function(request, status) {

  var Chest = Parse.Object.extend("Chest");
  var result = [];
  var toSaves = [];
  var startIndex = 0;
  var stopIndex = 40;
  var time;

  var querySpawnLocationsCallback = function(res) {
    //console.log("Query found " + res.length + " item");
    var spawnRandom = Math.floor(Math.random() * 7) + 1;

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

      //Longitude and latitude reversed as they are backwards in the actual db
      var geoPoint = new Parse.GeoPoint({latitude: result[i].get("longitude"), longitude: result[i].get("latitude")})
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

    if(stopIndex >= toSaves.length) {
      stopIndex = toSaves.length;
      saveChests();
    }
    else {
      time = new Date().getTime() / 1000
      saveChests();
    }
  }

   var saveChests = function() {
    //Save array of all chests
    Parse.Object.saveAll(toSaves.slice(startIndex, stopIndex), {
      success: function(saveList) {
        console.log("The start index is: " + startIndex + " and stop is: " + stopIndex);
        console.log("There are: " + saveList.length + "items to save.");
        if(stopIndex === toSaves.length) {
          status.success("All chests spawned");
        }
        else {
          startIndex = startIndex + 40;
          stopIndex = stopIndex + 40;
          waitSave();
        }
      },
      error: function(error) {
        status.error("Unable to spawn chests. Error is: " + error.message);
      }
    });
  }

  var waitSave = function () {
    while(1===1) {
      if((time + 2) < (new Date().getTime() / 1000)) {
        console.log("1 min wait complete");
        time = new Date().getTime() / 1000;
        break;
      }
    }

    if(stopIndex < toSaves.length) {
      saveChests();
    }
    else {
      stopIndex = toSaves.length;
      saveChests();
    }
  }

  querySpawnLocations(false);

});

Parse.Cloud.job("removeChests", function(request, status) {

  var Chest = Parse.Object.extend("Chest");
  var chests = [];
  var startIndex = 0;
  var stopIndex = 40;
  var time;

  var queryChestsCallback = function(res) {

    chests = chests.concat(res);

    if (res.length === 1000) {
      queryChests(res[res.length-1].id);
    }
    else {
      if(stopIndex >= chests.length) {
        stopIndex = chests.length;
        removeChests();
      }
      else {
        time = new Date().getTime() / 1000
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

  var removeChests = function () {
    //Remove all chests
    Parse.Object.destroyAll(chests.slice(startIndex, stopIndex), {
      success: function(deleteList) {
        if(stopIndex === chests.length) {
          status.success("All chests removed");
        }
        else {
          startIndex = startIndex + 40;
          stopIndex = stopIndex + 40;
          waitRemove();
        }
      },
      error: function(error) {
        status.error("Unable to remove chests. Error is: " + error.message);
      }
    });
  }

  var waitRemove = function () {
    while(1===1) {
      if((time + 2) < (new Date().getTime() / 1000)) {
        time = new Date().getTime() / 1000;
        break;
      }
    }

    if(stopIndex < chests.length) {
      removeChests();
    }
    else {
      stopIndex = chests.length;
      removeChests();
    }
  }


  queryChests(false);
});
