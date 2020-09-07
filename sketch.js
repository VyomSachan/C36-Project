var dog,Dog_img,happyDog_img, database;
var foodS,foodStock;
var gameState, readGameState;
var fedTime, lastFed;
var feed, addFood;
var food;

function preload(){
  Dog_img = loadImage("Dog.png");
  happyDog_img = loadImage("happydog.png");
  bedroom_img = loadImage("Bed Room.png");
  garden_img = loadImage("Garden.png");
  washroom_img = loadImage("Wash Room.png");
}

function setup() {
  database = firebase.database();
  createCanvas(1000,630);

  food = new Food();

  readStock();
  
  dog = createSprite(800,200,150,150);
  dog.addImage(Dog_img);
  dog.scale=0.15;
  
  feed = createButton("Feed the dog");
  feed.position(700,95);
  feed.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(800,95);
  addFood.mousePressed(addFoods);

  readState();
}

function draw() {
  background(46,139,87);

  fedTime = database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed = data.val();
  });
 
  fill(255,255,254);
  textSize(15);
  if(lastFed >= 12){
    text("Last Feed : "+ lastFed % 12 + " PM", 250, 30);
  }
  else if(lastFed == 0){
    text("Last Feed : 12 AM", 250, 30);
  }
  else{
    text("Last Feed : "+ lastFed + " AM", 250, 30);
  }

  text("Stock left : "+ foodS, 500, 30);

  //To show if gameState not hungry or hungry
  if(gameState != "hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  }
  else{
    feed.show();
    addFood.show();
    dog.addImage(Dog_img);
  }

  //To give different backgrounds after different timings
  currentTime = hour();
  if(currentTime == lastFed + 1){
    updateState("playing");
    food.garden();
  }
  else if(currentTime == lastFed + 2){
    updateState("sleeping");
    food.bedroom();
  }
  else if(currentTime > lastFed + 2 && currentTime <= lastFed + 4){
    updateState("bathing");
    food.washroom();
  }
  else{
    updateState("hungry");
    food.display();
  }
 
  drawSprites();
}

//function to read food Stock
function readStock(){
  foodStock = database.ref('Food');
  foodStock.on("value", function(data){
    foodS = data.val();
    food.updateFoodStock(foodS);
  });
}


//function to update food stock and last fed time
function feedDog(){
  dog.addImage(happyDog_img);

  food.updateFoodStock(food.getFoodStock() - 1);
  database.ref('/').update({
    Food : food.getFoodStock(),
    FeedTime : hour()
  })
}

//function to add food in stock
function addFoods(){
  foodS++;
  database.ref('/').update({Food : foodS})
}

function readState(){
  readGameState = database.ref('gameState');
  readGameState.on("value", function (data){
    gameState = data.val();
    //console.log(gameState);
  })
}

function updateState(state){
  database.ref('/').update({gameState : state});
}