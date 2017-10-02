var db = require("../models");

module.exports = function(app) {

    var userIn = false;

    app.get("/", function(req, res){
        
        res.render("index");
    });

    app.get("/allcards", function(req, res){
        var cardArray = [];
        db.cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                cardArray.push(cards[i].dataValues);
            }

            res.json(cardArray);
        })   
    })

    app.get("/profile", function(req, res){

        res.render("profile");
    });

    app.get("/arena", function(req, res){

        res.render("arena");
    });

    app.get("/deckbuilder", function(req, res){
        console.log("Query: " + req.query.username);
        var cardArray = [];
        var playerCards = []
        db.cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                cardArray.push(cards[i].dataValues);
            }

            db.Decks.findAll({ where: {owner: req.query.username}}).then(pc =>{
                for(var i=0; i<pc.length; i++){
                    playerCards.push(pc[i].dataValues);
                }
                res.render("deckbuilder", {cards: cardArray, pc: playerCards});
            })
        })
    });

    app.post("/signup/:user", function(req, res){

        db.Users.findOne({ where: {username: req.params.user} }).then(user => {
            console.log(user);
            if (user) {
                res.send(false);
            }
            else {
                db.Users.create({
                    username: req.body.username,
                    password: req.body.password
                })
                res.send(true);
            }
        }) 
    });

    app.post("/signin/:user", function(req, res){

        db.Users.findOne({ where: {username: req.params.user} }).then(user => {
            // User doesn't exists
            if (!user) {
                var result = {
                    success: false,
                    message: "User not found"
                }
                res.json(result);
            }
            // User does exist
            else {
                // Check passwords
                if (user.dataValues.password === req.body.password) {
                    var result = {
                        success: true,
                        message: ""
                    }
                    userIn = true;
                    res.json(result);
                }
                else {
                    var result = {
                        success: false,
                        message: "Password is incorrect"
                    }
                    res.json(result);
                }
            }
        });
    });

    app.post("/deckbuilder", function(req, res){
        console.log("creating");
        createAllCards();
        res.end();
    });

    app.post("/addcard", function(req, res){
        db.Decks.count({ where: {owner: req.body.owner}}).then(c => {
            if (c <= 20){
                db.Decks.findAll({ where: {
                                    color: req.body.color,
                                    number: req.body.number,
                                    owner: req.body.owner
                                    }
                }).then(cards =>{
                    if (!cards[0]) {
                        db.Decks.create({
                            color: req.body.color,
                            number: req.body.number,
                            image: req.body.image,
                            owner: req.body.owner
                        });
                        res.redirect("/deckbuilder");
                    }
                    else {
                        res.json({success: false, message: "You already have that card"});
                    }
                });
            }
            else {
                res.json({success: false, message: "You have 20 cards already"});
            }
        })

    })
};
// Create cards numbered 1-13 for each color in the colors array
function createAllCards() { 
    var imageSetOne = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetTwo = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetThree = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetFour = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetFive = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetSix = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetSeven = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imageSetEight = ["something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg", "something.jpg"];
    var imagesSet = [imageSetOne, imageSetTwo, imageSetThree, imageSetFour, imageSetFive, imageSetSix, imageSetSeven, imageSetEight]
    var colors = ["0red", "1orange", "2yellow", "3green", "4blue", "5purple", "6black", "7white"];
    for (var i=0; i<colors.length; i++) {
        for (var j=0; j<13; j++) {
            db.cards.create({
                color: colors[i],
                number: (j+1),
                image: imagesSet[i][j]
            });
        }
    }
}

