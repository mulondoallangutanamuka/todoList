import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import  _ from "lodash";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://mulondoallan13:Mukisa19900*@todolist.kmtidfe.mongodb.net/todoList');

var itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name:"Welcome to Allan's todoList"
});

const item2 = new Item({
  name:"Hit the + item to add a new Item"
});

const item3 = new Item({
  name:"<--- Hit this to delete an item"
}); 

var defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List = mongoose.model("list", listSchema);



app.get("/", async (req, res) =>  {
  await Item.find({})
  .then((resolve)=>{
    if (resolve.length === 0){
      Item.insertMany(defaultItems)
      console.log("Success");

    }else{
      res.render("list", {listTitle: "Today", newListItems:resolve});
    }
  })
});
 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name  : itemName
  })

  

  if (listName === "Today"){
    item.save()
    .then((resolve)=>{
      res.redirect("/");
    })
  } else {
    List.findOne({ name: listName })
      .then((list) => {
          list.items.push(item);
          return list.save(); // Chain the save operation
      })
      .then((savedList) => {
        // Redirect only after the list is saved successfully
        // console.log(savedList)
        res.redirect("/" + listName);
      })
      .catch((error) => {
        // Handle errors appropriately (e.g., log, display error message)
        console.error("Error saving item:", error);
      });
  }})

app.post("/checked", function(req, res){

  const removeItemId = req.body.checkbox;
  let listName = req.body.listName; 

  if (listName === "Today"){
    Item.findByIdAndDelete(removeItemId)
    .then((result)=>{
      console.log("Success")
    })
    .catch((error)=>{
      res.send("Error")
    })
  
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:removeItemId}}})
    .then(()=>{
      res.redirect("/" + listName)
    })
  }
 

});


app.get("/:customListName", async function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName})
  .then((resolve)=>{
    if (!resolve ){
      const list = new List({
        name :customListName,
        items:defaultItems
      })
      List.insertMany([list])
      .then((saved)=>{
        console.log("saved")
        res.redirect("/"+customListName)
      })
      
  }else{
    res.render("list", {listTitle: resolve.name, newListItems:resolve.items});
  }
})
})

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
