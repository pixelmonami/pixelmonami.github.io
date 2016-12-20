var forest;
$(document).ready(function(e){
  var nutrientCells = [];
  var sunlightCells = [];
  var waterCells = [];
  var ageCells = [];
  var two;

  var msg = "Not started";
  var msg1;
  var hasStarted = false;

  var N = 12;
  var SIZE = 25;
  var DELAY = 60;
  var WIDTH,HEIGHT;
  var ONE = parseInt("ffffff",16);
  var ZERO = parseInt("000000",16);

  function init(){
    // Make an instance of two and place it on the page.
    var elem = document.getElementById('forestContainer');
    WIDTH = elem.offsetWidth;
    HEIGHT = elem.offsetHeight;
    var params = { width: WIDTH, height: HEIGHT,fullscreen:true, type:Two.Types.webgl };
    two = new Two(params).appendTo(elem);
    forest = new FuzzyForest(N);
    drawBackground();
    two.update();
  }
  init();

  function drawBackground(){
    cells = new Array(N);
    var nutrientGroup = two.makeGroup();
    var sunlightGroup = two.makeGroup();
    var waterGroup = two.makeGroup();
    var ageGroup = two.makeGroup();
    for(var i = 0; i < N; i++){
      var y = i * SIZE;
      nutrientCells[i] = new Array(N);
      sunlightCells[i] = new Array(N);
      waterCells[i] = new Array(N);
      ageCells[i] = new Array(N);
      for(var j = 0; j < N; j++){
        var x = j * SIZE;
        nutrientCells[i][j] = two.makeRectangle(x,y,SIZE,SIZE);
        sunlightCells[i][j] = two.makeRectangle(x,y,SIZE,SIZE);
        waterCells[i][j] = two.makeRectangle(x,y,SIZE,SIZE);
        ageCells[i][j] = two.makeRectangle(x,y,SIZE,SIZE);
      }
      nutrientGroup.add(nutrientCells[i]);
      sunlightGroup.add(sunlightCells[i]);
      waterGroup.add(waterCells[i]);
      ageGroup.add(ageCells[i]);
    }
    x = SIZE/2;
    y = SIZE/2;
    nutrientGroup.translation.set(x,y);
    x = SIZE/2 + SIZE + N * SIZE;
    y = SIZE/2;
    sunlightGroup.translation.set(x,y);
    x = SIZE/2;
    y = SIZE/2 + SIZE + N * SIZE;
    waterGroup.translation.set(x,y);
    x = SIZE/2 + SIZE + N * SIZE;
    y = SIZE/2 + SIZE + N * SIZE;
    ageGroup.translation.set(x,y);

    textBox = two.makeText(msg,x+50+SIZE,y+N*SIZE,'normal');
    textBox1 = two.makeText(msg1,x+50+SIZE,y+15+N*SIZE,'normal');
    textBox2 = two.makeText(msg1,x+500+SIZE,y+50+N*SIZE,'normal');
    textBox3 = two.makeText(msg1,x+500+SIZE,y+90+N*SIZE,'normal');
    textBox4 = two.makeText(msg1,x+500+SIZE,y+130+N*SIZE,'normal');
  }
  var generationCount = 0;
  two.bind('update', function(frameCount) {
    if(frameCount%DELAY == 0){
      //console.log(frameCount);
      if(hasStarted){
        msg = "Generations: "+generationCount++;
        textBox.value = msg;
        forest.step();
      }
      for(var i = 0; i < N; i++){
        for(var j = 0; j < N; j++){
          nutrientCells[i][j].fill = interpolate(forest.nutrients[i][j]);
          sunlightCells[i][j].fill = interpolate(forest.sunlight[i][j]);
          waterCells[i][j].fill = interpolate(forest.water[i][j]);
          ageCells[i][j].fill = interpolate(forest.age[i][j]);
        }
      }
      showHover();
    }
  }).play();

  function interpolate(t){
    return "#"+parseInt(t*ZERO + (1-t) * ONE).toString(16);
  }

  $("#forestContainer").click(function(e){
    x = SIZE + N * SIZE;
    y = SIZE + N * SIZE;
    cellX = parseInt((e.pageX - x)/SIZE);
    cellY = parseInt((e.pageY - y)/SIZE);
    if(cellX >= 0 && cellX < N && cellY >= 0 && cellY < N){
      forest.age[cellY][cellX] = 0;
      hasStarted = true;
    }
  })

  function showHover(){
    if(hoverX >= 0 && hoverX < N && hoverY >= 0 && hoverY < N){
      msg1 = forest.age[hoverY][hoverX];
      // msg1 = forest.age[cellX][cellY];
      textBox1.value = msg1;
    }
    else{
      textBox1.value = "For age matrix only";
    }
  }
  var hoverX= 0, hoverY = 0;
  $("#forestContainer").mousemove(function(f){
    x = SIZE + N * SIZE;
    y = SIZE + N * SIZE;
    hoverX = parseInt((f.pageX - x)/SIZE);
    hoverY = parseInt((f.pageY - y)/SIZE);
  });
  textBox2.value = "Basic Cellular Automata Simulation. Click on the age matrix to start simulating. Simulate the best arrange for maximum generation(age) of the matrix index(tree)";
  textBox3.value = "From right to left and then down - Matrix 1: NUTRIENTS PARAMETER, Matrix 2: SUNLIGHT PARAMETER, Matrix 3: WATER PARAMETER, Matrix 4: Age Count.";
  textBox4.value = " Click on the indices of age matrix. It will result in the changes in the three mentioned parameter and also show the number of generation(age) that cell(tree) will live with the arrangement of cells made by the user on clicking the age(4th) matrix. After clicking dead cell(tree) will become BLACK";
});
