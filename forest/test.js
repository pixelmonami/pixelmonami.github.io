var forest = new FuzzyForest(5);

function testFunctions(){
  console.log(forest.sigmoid(-10000));
  console.log(forest.sigmoid(10000));
  console.log(forest.sigmoid(0));

  console.log(forest.gauss(-9,.5));
  console.log(forest.gauss(10,.5));
  console.log(forest.gauss(0,.5));

  console.log(forest.getDistance(0,0,1,1));
}

function test(){
  //testFunctions();
  //console.log(forest.getAdjacentTrees(0,0));
  forest.step();
}

test()
