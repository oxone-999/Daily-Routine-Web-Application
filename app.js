const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

mongoose.connect("mongodb+srv://anuj-verma:anuj%40123@cluster0.supix.mongodb.net/toDoListDB", {
  useNewUrlParser: true
});

const toDoListSchema = {
  name: String
};

const list = mongoose.model("Item", toDoListSchema);

const item1 = new list({
  name: "Food"
});

const item2 = new list({
  name: "watch movie at 8"
});

const item3 = new list({
  name: "3 questions daily on interviewBit"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name : String,
  items : [toDoListSchema]
});

const customList = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  customList.findOne({name : customListName}, function(err,foundObj){
    if(!err)
    {
      if(!foundObj)
      {
        const lists = new customList({
          name : customListName,
          items : defaultItems
        });
        lists.save();
        res.redirect("/" + customListName);
      }
      else
      {
        res.render("list", {listTitle: foundObj.name,newListItems: foundObj.items});
      }
    }
  });

});

app.get("/", function(req, res) {

  list.find({}, function(err, items) {

    if(items.length === 0)
    {
      list.insertMany(defaultItems, function(err) {
        if (err) console.log(err);
        else console.log("Successfully Added to the DataBase");
      });
      res.redirect("/");
    }
    else res.render("list", {listTitle: "Today",newListItems: items});
  });

});

app.post("/delete", function(req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    list.findByIdAndRemove(checkedItemId, function(err) {
      if(err) console.log(err);
      if(!err)
      {
        console.log("Successfully deleted the item");
        res.redirect("/");
      }

    });

  }
  else
  {
    customList.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}}, function(err,foundList){
      if(!err) res.redirect("/" + listName);
    });
  }


});

app.post("/", function(req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  const itemN = new list({
    name: item
  });

  if(listName === "Today")
  {
    itemN.save();
    res.redirect("/");
  }
  else
  {
    customList.findOne({name : listName}, function(err, foundList){
      foundList.items.push(itemN);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server is running at port 3000");
});
