var db = require("../models");

module.exports = function(app) {
    // HTML route for the signin/signup page
    app.get("/", function(req, res){
        res.render("index");
    });
    // HTML route for the profile page
    app.get("/profile", function(req, res){
        res.render("profile");
    });
    // HTML route for the arena page
    app.get("/arena", function(req, res){
        res.render("arena");
    });
    // HTML route for the deckbuilder page
    app.get("/deckbuilder", function(req, res){
       // Create an array to hold each deck
        var cardArray1 = []; 
        var cardArray2 = []; 
        var cardArray3 = []; 
        var cardArray4 = []; 
        var cardArray5 = []; 
        var cardArray6 = []; 
        var cardArray7 = []; 
        var cardArray8 = [];
        // Populate the arrays with the card information
        db.Cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                if ((i/13) < 1) {cardArray1.push(cards[i].dataValues);}
                else if ((i/13) < 2) {cardArray2.push(cards[i].dataValues);}
                else if ((i/13) < 3) {cardArray3.push(cards[i].dataValues);}
                else if ((i/13) < 4) {cardArray4.push(cards[i].dataValues);}
                else if ((i/13) < 5) {cardArray5.push(cards[i].dataValues);}
                else if ((i/13) < 6) {cardArray6.push(cards[i].dataValues);}
                else if ((i/13) < 7) {cardArray7.push(cards[i].dataValues);}
                else if ((i/13) < 8) {cardArray8.push(cards[i].dataValues);}
            }
            // Render the deckbuilder.handlebars page with all 8 decks passed to it
            res.render("deckbuilder", {group1: cardArray1,
                                    group2: cardArray2,
                                    group3: cardArray3,
                                    group4: cardArray4,
                                    group5: cardArray5,
                                    group6: cardArray6,
                                    group7: cardArray7,
                                    group8: cardArray8});
        })
    });
    // HTML route for the records page
    app.get("/records", function(req, res){
        db.Users.findAll({order: [['record', 'DESC']]}).then(users =>{
            var top5 = [];
            for (var i=0; i<5; i++){
                top5.push(users[i]);
            }
            res.render("records", {top5: top5});
        })
    })
    // API route that gets all the cards from the database
    app.get("/allcards", function(req, res){
        var cardArray = [];
        db.Cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                cardArray.push(cards[i].dataValues);
            }

            res.json(cardArray);
        })   
    })
    // API route to get the deck for the user specified in the parameters
    app.get("/deck/:user", function(req, res){
        var userCards = [];
        db.Decks.findAll({where: {owner: req.params.user}}).then(cards => {
            for(var i=0; i<cards.length; i++){
                userCards.push(cards[i].dataValues);
            }
            res.json(userCards);
        })
    })
    // API route to get the profile information for the user specified in the parameters
    app.get("/profile/:user", function(req, res){
        db.Users.findOne({where: {email: req.params.user}}).then(user => {
            res.json(user);
        })
    })
    // API route to get the gamestate for the user specified in the parameters
    app.get("/gamestate/:user", function(req, res){
        db.Gamestates.findOne({where: {owner: req.params.user}}).then(user => {
            res.json(user);
        })
    })
    // API route that creates a user in the database as long as they don't already exist
    app.post("/signup", function(req, res){
        db.Users.findOne({ where: {email: req.body.email} }).then(user => {
            if (user) {
                res.send(false);
            }
            else {
                db.Users.create({
                    email: req.body.email,
                    username: req.body.username,
                    wins: 0,
                    losses: 0,
                    record: 0
                })
                res.send(true);
            }
        }) 
    });
    // API route that updates the gamestate for the user specified in the req.body
    app.post("/updateGamestate", function(req, res){
        db.Gamestates.update({ gameInProgress: req.body.gameInProgress,
                            player: req.body.player,
                            computer: req.body.computer}, {
                                where: {owner: req.body.owner}
                            }).then(user =>{
                                res.end();
                            });
    });
    // API route that creates a database for a user if one does not already exist
    app.post("/createGameState", function(req, res){
        db.Gamestates.findOne({ where: {owner: req.body.email}}).then(user => {
            if (user) {
                res.send(false);
            }
            else {
                db.Gamestates.create({
                    owner: req.body.email,
                    gameInProgress: false
                });
                res.send(true);
            }
        });
    });
    // API route that adds a card to a players decklist
    app.post("/addcard", function(req, res){    
        // Make sure the user doesn't have 20 cards already
        db.Decks.count({ where: {owner: req.body.owner}}).then(c => {
            if (c < 20){
                // Check if the card is in the decklist already
                db.Decks.findAll({ where: {
                                    color: req.body.color,
                                    number: req.body.number,
                                    owner: req.body.owner
                                    }
                }).then(cards =>{
                    if (!cards[0]) {
                        // If it's not, then create it in the database
                        db.Cards.findOne({where: {id: req.body.cardNumber}}).then(card =>{
                            db.Decks.create({
                                color: req.body.color,
                                number: req.body.number,
                                image: req.body.image,
                                owner: req.body.owner,
                                cardNumber: req.body.cardNumber,
                                name: card.name
                            });
                            res.redirect("/deckbuilder");
                        })   
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
    });
    // API route that updates a users wins or losses based on the information in the parameters
    app.put("/player/:user/:result/:num/:record", function(req, res){
        if (req.params.result === "win") {
            db.Users.update({ wins: req.params.num, record: req.params.record}, {
                where: {email: req.params.user}
            }).then(user =>{
                res.end();
            })
        }
        else {
            db.Users.update({ losses: req.params.num, record: req.params.record}, {
                where: {email: req.params.user}
            }).then(user =>{
                res.end();
            })
        }
    });
    // API route that deletes the card with information specified in the parameters
    app.delete("/deletecard/:color/:number/:owner", function(req, res){
        db.Decks.destroy({where: {
            color: req.params.color,
            number: req.params.number,
            owner: req.params.owner
        }}).then(results =>{
            res.end();
        });
    })
};