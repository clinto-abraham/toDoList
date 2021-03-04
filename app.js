//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});  //useNewUrlParser: true is used for avoiding the deprecation warning
const itemsSchema = {
  name: String 
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({name: "Hey, today's do list. Deploy code base."});
const item2 = new Item({name: "Hit the + button to add a new item"});
const item3 = new Item({name: "<-- Hit this to delete an item."});
const defaultItems = [item1, item2, item3];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];



app.get("/", function(req, res) {
  const day = date.getDate();

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Successfully saved the default items to DB.");  
        } 
        res.redirect("/");
      });
    
    } else{
    res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item_nth = new Item({name:itemName});
  item_nth.save();
  res.redirect("/");

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("successfully removed the checked item from the item list!!!");
      res.redirect("/");
    } 
    
  });

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
