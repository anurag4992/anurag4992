const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://anurag4992:Anhourlat6@cluster0.j80jq.mongodb.net/listDB?retryWrites=true&w=majority");

const itemsSchema = {
    name: String

};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to todo list"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete a item"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("SuccessFully entered all in todolistDB");
                }
            });
        }

        res.render("list", { kindOfDay: "Today", itemsHere: foundItems });
    });

});

app.get("/:topic", function (req, res) {

    const customList = _.capitalize(req.params.topic);
    List.findOne({ name: customList }, function (err, lists) {
        if (!err) {
            if (!lists) {
                const list = new List({
                    name: customList,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + list.name);
            }
            else {
                res.render("list", { kindOfDay: lists.name, itemsHere: lists.items });
            }
        }
    });

});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const itemWhich = req.body.kindOfDay;

    const itemNew = new Item({
        name: itemName
    });

    if (itemWhich === "Today") {

        itemNew.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: itemWhich }, function (err, lists) {
            lists.items.push(itemNew);
            lists.save();
            res.redirect("/" + itemWhich);
        });

    }

});

app.post("/delete", function (req, res) {

    const checkedItem = req.body.checkbox;
    const listname = req.body.listName;

    if (listname === "Today") {
        Item.findByIdAndRemove(checkedItem, function (err) {
            if (!err) {
                res.redirect("/");
            }
            else {
                console.log(err);
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: checkedItem } } }, function (err, lists) {
            if (!err) {
                res.redirect("/" + listname);
            }
            else {
                console.log(err);
            }
        });
    }
    console.log("Jo mange " + listname + " se wo delete kr diye hain");

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function () {

    console.log("Server has started");

});