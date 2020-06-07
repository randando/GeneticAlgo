var population;
var lifespan = 300;
var count = 0;
var target;
var maxforce = 0.2;

//Some infos...
var offset = 5;
var countreach = 0;
var maxcount = 0;
var gennumber = 0;
var toptime = 10000;
var topper;
var simOver;

//GA vars
var generations;
var mutation_rate;
var crossover_rate;
//var pop_size = 50;

function setup() {
  let cnv = createCanvas(700, 500);
  cnv.parent('cnv_holder');
  target = createVector(width*2/3, 150);
  resetSketch();
}

const updateChart = () =>{
  //Add new data point
  Plotly.extendTraces('chart',{y:[[countreach]]},[0]);
  //Offset x-axis
  if(gennumber >= offset){
    Plotly.relayout('chart',{
      'xaxis.range' : [gennumber-offset,gennumber+1],
    });
  }
}

const resetChart = () =>{
  //yikes....
}

const resetSketch = (size) =>{
  let pop_size;
  if(size){
    pop_size = size
  }else{
    pop_size = 50
  }
  population = new Population(pop_size);
  simOver = false;
  count = 0;
  gennumber = 0;

  //GA vars
  generations = app.foo[0].val;
  mutation_rate = app.foo[1].val;
  crossover_rate = app.foo[2].val;

  //Graph stuff
  let layout = {
    title:'Success Rate',
    xaxis:{
      title:'Gen Number',
      range: [0,offset],
      showlegend: false
    },
    yaxis:{
      title:'Pop. Size',
      range: [0, pop_size]
    }
  }

  let trace = {    
    y:[0],
    mode: 'lines'
  }
  Plotly.plot('chart', [trace], layout);
}

function draw() {
  background(0,128,128);
  population.run();
  count++;
  if(count === lifespan){
    //End of algo
    if(!simOver){
      population.evaluate();
      population.selection();
      updateChart();
      gennumber++;
    }
    if(gennumber>=generations){
      simOver = true;
      //Pause animation
      noLoop();
      //Trace maxcount line
      Plotly.relayout('chart', {
        'shapes[0]': {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: maxcount,
          x1: 1,
          y1: maxcount,
          name: 'Maximum count',
          line:{
            color: 'rgb(255,0,0)',
            width: 1
          }
        }
      });
    }
    //Reset counters
    count = 0;
    countreach = 0;
  }
  //Target
  ellipse(target.x, target.y, 30, 30);
  noStroke();
}

const inc = (title) =>{
  let groot = app.foo.filter(obj =>{
    return obj.title===title
  })[0]
  let temp = Number( (groot.val + groot.step).toFixed(2) );
  if(temp <= groot.limit){
    groot.val = temp;
    resetSketch();
  }else{
    //tooltip...
  }
}

const dec = (title) =>{
  let groot = app.foo.filter(obj =>{
    return obj.title===title
  })[0]
  let temp = Number( (groot.val - groot.step).toFixed(2) );
  if(temp > 0){
    groot.val = temp;
    resetSketch();
  }else{
    //tooltip...
  }
}

function Population(size){
  this.rockets = [];
  this.popsize = size;
  this.matingPool = [];

  for(var i=0; i<this.popsize; i++){
        this.rockets[i] = new Rocket();
  }

  this.run = () =>{
    for(var i=0;i<this.popsize; i++){
      this.rockets[i].update();
      this.rockets[i].show();
    }
  }

  this.evaluate = () =>{
    let maxfit = 0;
    for(var i=0; i<this.popsize; i++){
      this.rockets[i].calcFitness();
      if(this.rockets[i].fitness > maxfit){
        maxfit = this.rockets[i].fitness;
      }
    }
    //Assign fitness value to each member
    for(var i=0; i<this.popsize; i++){
      this.rockets[i].fitness /= maxfit;
    }
    //Reset and populate mating pool
    this.matingPool = [];
    for(var i=0; i<this.popsize; i++){
      var n = this.rockets[i].fitness * 100;
      for(var j=0; j<n; j++){
        this.matingPool.push(this.rockets[i]);
      }
    }
  }

  this.selection = () =>{
    let newRockets = [];
    for(var i=0; i<this.rockets.length; i++){
      let parentA = random(this.matingPool).dna;
      let child;
      if(random(1) < crossover_rate){
        let parentB = random(this.matingPool).dna;
        child = parentA.crossover(parentB);
      }else{
        child = parentA;
      }
      child.mutation();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }
}

function Rocket(dna){
  this.pos = createVector(width/3, height*2/3);
  this.vel = createVector();
  this.acc = createVector();
  this.fitness;
  this.start;
  this.end;
  this.completed = false;
  this.crashed = false;
  this.wallcrashed = false;

  if(dna){
    this.dna = dna;
  }else{
    this.dna = new DNA();
  }
  this.start = millis();

  this.applyForce = (force) =>{
    this.acc.add(force);
  }

  this.calcFitness = () =>{
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d,0,width,width,0);
    if(this.completed){
      this.fitness *= 9;
      countreach++;
      //Useful data
      if(countreach > maxcount){
        maxcount = countreach;
      }
    }
    if(this.crashed){
      this.fitness /= 2;
    }
  }

  this.update = () =>{
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    //Target reached?
    if(d<25){
      this.completed = true;
      //Fastest becomes topper
      var time = millis() - this.start;
      if(time < toptime){
        toptime = time;
        topper = new Rocket(this.dna);
        //this.fitness *= 10
      }
      this.pos = target.copy();
    }

    //Frame boundaries
    if(this.pos.x > width || this.pos.x < 0){
      this.crashed = true;
    }
    if(this.pos.y > height || this.pos.y < 0){
      this.crashed = true;
    }
    this.applyForce(this.dna.genes[count]);
    if(!this.completed && !this.crashed){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  }

  this.show = () =>{
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0,0, 15, 5);
    pop();
  }
}

function DNA(genes){
  if(genes){
    this.genes = genes;
  }else{
    this.genes = [];
    for(var i=0; i<lifespan; i++){
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }

  //Single point based
  this.crossover = (partner) =>{
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for(var i=0; i<this.genes.length; i++){
      if(i<mid){
        newgenes[i] = this.genes[i];
      }else{
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }

  //Optional crossover method...

  this.mutation = () =>{
    for(var i=0; i<this.genes.length; i++){
      if(random(1) < mutation_rate){
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }
}
