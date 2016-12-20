var FuzzyForest = function(N){
  this.N = N;
  this.range = 2;
  this.deathAge = .8;
  this.ageRate = .005;
  this.amplification = 12.5;
  this.init = function(){
    this.nutrients = new Array(N);
    this.sunlight = new Array(N);
    this.water = new Array(N);
    this.age = new Array(N);
    for(var i = 0; i < this.N;i++){
      this.nutrients[i] = new Array(N);
      this.sunlight[i] = new Array(N);
      this.water[i] = new Array(N);
      this.age[i] = new Array(N);
    }
    for(var i = 0; i < this.N;i++){
      for(var j = 0; j < this.N;j++){
        var t = (i * this.N + j) / (this.N * this.N);
        this.nutrients[i][j] = t;
        this.sunlight[i][j] = .5;
        this.water[i][j] = t;
        this.age[i][j] = 1;
      }
    }
  //  this.age[0][0] = 0;
  //  this.age[9][9] = 0;
  }
  this.init();

  this.updateNutrientMatrix = function(i,j){
    var nutrientConsumption = 0;
    var nutrientSupply = 0;
    var adjacentTrees = this.getAdjacentTrees(i,j);
    for(var tree = 0; tree < adjacentTrees.length; tree++){
      var x = adjacentTrees[tree][0];
      var y = adjacentTrees[tree][1];
      var distanceFactor = this.getDistance(i,j,x,y);
      //console.log(distanceFactor);
      if(distanceFactor == 0) continue;
      nutrientConsumption += this.age[x][y] > this.deathAge?
      0 : this.gauss(this.age[x][y]*this.amplification,this.amplification/2)/distanceFactor;
      nutrientSupply += this.age[x][y] > this.deathAge?
      (1-((this.age[x][y]-this.deathAge)/(1-this.deathAge)))/distanceFactor : 0;
    }
    if(nutrientSupply)
    this.nutrients[i][j] = this.sigmoid(nutrientSupply - nutrientConsumption)*.5+this.nutrients[i][j]*.5;

  }
  this.updateWaterMatrix = function(i,j){
    var cumulativeFactor = 0;
    var adjacentTrees = this.getAdjacentTrees(i,j);
    for(var tree = 0; tree < adjacentTrees.length; tree++){
      var x = adjacentTrees[tree][0];
      var y = adjacentTrees[tree][1];
      if(this.age[x][y] == 1) continue;
      var distanceFactor = 1/this.getDistance(i,j,x,y);
      var ageFactor = this.sigmoid(this.age[x][y]/this.deathAge);
      cumulativeFactor += distanceFactor * ageFactor;
      //console.log("(%d,%d): %f",i,j,cumulativeFactor);
    }
    if(cumulativeFactor)
    this.water[i][j] = (1 - this.sigmoid(cumulativeFactor))*.5+this.water[i][j]*.5;
  }
  this.updateSunlightMatrix = function(i,j){
    var cumulativeFactor = 0;
    var adjacentTrees = this.getAdjacentTrees(i,j);
    for(var tree = 0; tree < adjacentTrees.length; tree++){
      var x = adjacentTrees[tree][0];
      var y = adjacentTrees[tree][1];
      if(this.age[x][y] == 1) continue;
      var ageFactor = this.gauss(this.age[x][y]*this.amplification,this.amplification/2);
      var distanceFactor = 1/this.getDistance(i,j,x,y);
      //console.log("(%d,%d): %f,%f",i,j,ageFactor,distanceFactor);
      cumulativeFactor += ageFactor * distanceFactor;
    }
    if(cumulativeFactor)
      this.sunlight[i][j] = 1 - this.sigmoid(cumulativeFactor);
  }

  this.updateAgeMatrix = function(i,j){
    var rate = Math.pow(this.nutrients[i][j] * this.water[i][j] * this.sunlight[i][j],1/9);

    if(this.age[i][j] < 1){
      var increment = 100 * (1-rate) * this.ageRate;
      console.log(rate+"\t"+increment);

      this.age[i][j] += increment;
    }
    if(this.age[i][j] > 1){
      this.age[i][j] = 1;
    }
    // if(this.age[i][j] <= 0.5)
    // {
    //   this.age[i][j] = this.age[i][j];
    //   this.age[i-1][j] = 0;
    //   this.age[i+1][j] = 0;
    //   this.age[i][j+1] = 0;
    //   this.age[i][j-1] = 0;
    //   this.age[i-1][j-1] = 0;
    //   this.age[i-1][j+1] = 0;
    //   this.age[i+1][j+1] = 0;
    //   this.age[i+1][j-1] = 0;
    //
    // }
    // if(this.age[i][j] > 0.5)
    // {
    //   this.age[i][j] = this.age[i][j];
    //   this.age[i-1][j] = 0.1;
    //   this.age[i+1][j] = 0.1;
    //   this.age[i][j+1] = 0.1;
    //   this.age[i][j-1] = 0.1;
    //   this.age[i-1][j-1] = 0.1;
    //   this.age[i-1][j+1] = 0.1;
    //   this.age[i+1][j+1] = 0.1;
    //   this.age[i+1][j-1] = 0.1;
    //
    // }
  }


  this.step = function(){
    for(var i = 0; i < this.N; i++){
      for(var j = 0; j < this.N; j++){
        this.updateNutrientMatrix(i,j);
        this.updateSunlightMatrix(i,j);
        this.updateWaterMatrix(i,j);
      }
    }
    for(var i = 0; i < this.N; i++){
      for(var j = 0; j < this.N; j++){
        this.updateAgeMatrix(i,j);
      }
    }
  }

  this.getDistance = function(x1,y1,x2,y2){
    var x = x1-x2;
    var y = y1-y2;
    var d = Math.sqrt(x*x+y*y);
    //console.log("(%d,%d)(%d,%d)%f",x1,y1,x2,y2,d);
    return d;
  }
  this.getAdjacentTrees = function(i,j){
    var adj = [];
    //console.log("-------- %d %d",i,j);
    for(var x = i - this.range; x <= i + this.range; x++){
      if(x < 0 || x >= this.N) continue;
      for(var y = j - this.range; y <= j + this.range; y++){
        if(y < 0 || y >= this.N) continue;
        if(x == i && y == j) continue;
        adj.push([x,y]);
        //console.log("%d,%d",x,y);
      }
    }
    return adj;
  }

  this.gauss = function(x,mean){
    x-=mean;
    return Math.exp(-(x*x));
  }
  this.sigmoid = function(x){
    return 1/(1+Math.exp(-x));
  }
  this.linear = function(t,s,f){
    return (1-t) * s + t * f;
  }
}
