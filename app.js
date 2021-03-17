//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const date = require(__dirname + "/date.js");
var today = date.getDate();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex : true
});  //useNewUrlParser: true is used for avoiding the deprecation warning


const itemsSchema = {
  name: String 
};

const Item = mongoose.model("Item", itemsSchema);  // Collections name is Items, so we use singular form in model as 'Item'

const item1 = new Item({name: "Hey, today's do list. Deploy code base."});
const item2 = new Item({name: "Hit the + button to add a new item"});
const item3 = new Item({name: "<-- Hit this to delete an item."});
const defaultItems = [item1, item2, item3];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);


app.get("/", function(req, res) {
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
    res.render("list", {
        listTitle: today, 
        newListItems: foundItems
    });
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const item = new Item( { name: itemName } );
  
  const listName = req.body.list;
  console.log(listName);

  if (listName === today){
    item.save();
    res.redirect("/");
  } else {
     List.find({name : listName }, function(err, foundList){
      if (err){
        console.log(err);
      } else { 
      console.log(item);
      console.log(items);
      foundList.items.push(item);
      foundList.save();
     
      res.redirect('/' + listName);
      }
    });

  }
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
  const listName = req.body.listName;
  if(listName === today){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("successfully removed the checked item from the item list!!!");
        res.redirect("/");
      } 
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull : {_id : checkedItemId}}, function(err){
      if(!err){
        res.redirect('/' + listName);
      }
    });
  }
  
});


app.get('/:customListName', function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if (!foundList){
        console.log("data doesn't exist");
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        }); 
        list.save();
        res.redirect('/' + customListName);
      } else {
        console.log('the searched data exist in the mongoDB');
        // show the existing list
        res.render('list', {
          listTitle: foundList.name, 
          newListItems: foundList.items
        });
      }
    } else {
      console.log(err);
    }
  });  
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
