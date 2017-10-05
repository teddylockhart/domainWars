var db = require("../models");

module.exports = function(app) {

    app.get("/", function(req, res){
        
        res.render("index");
    });

    app.get("/allcards", function(req, res){
        var cardArray = [];
        db.Cards.findAll().then(cards => {
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
       
        var cardArray1 = []; 
        var cardArray2 = []; 
        var cardArray3 = []; 
        var cardArray4 = []; 
        var cardArray5 = []; 
        var cardArray6 = []; 
        var cardArray7 = []; 
        var cardArray8 = [];
        
        db.Cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                if ((i/13) < 1) {cardArray1.push(cards[i].dataValues);}
                else if ((i/13) < 2) {cardArray2.push(cards[i].dataValues);}
                else if ((i/13) < 3) {cardArray3.push(cards[i].dataValues);}
                else if ((i/13) < 4) {cardArray4.push(cards[i].dataValues);}
                else if ((i/13) < 5) {cardArray5.push(cards[i].dataValues);}
                else if ((i/13) < 6) {cardArray6.push(cards[i].dataValues);}
                else if ((i/13) < 7) {cardArray7.push(cards[i].dataValues);}
                else if ((i/13) < 7) {cardArray8.push(cards[i].dataValues);}
            }


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

    app.get("/deck/:user", function(req, res){
        var userCards = [];
        db.Decks.findAll({where: {owner: req.params.user}}).then(cards => {
            for(var i=0; i<cards.length; i++){
                userCards.push(cards[i].dataValues);
            }

            res.json(userCards);
        })
    })

    app.get("/profile/:user", function(req, res){
        db.Users.findOne({where: {email: req.params.user}}).then(user => {
            res.json(user);
        })
    })

    app.get("/gamestate/:user", function(req, res){
        db.Gamestates.findOne({where: {owner: req.params.user}}).then(user => {
            res.json(user);
        })
    })

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
                    losses: 0
                })
                res.send(true);
            }
        }) 
    });

    app.post("/updateGamestate/", function(req, res){
        db.Gamestates.update({ gameInProgress: req.body.gameInProgress,
                            player: req.body.player,
                            computer: req.body.computer}, {
                                where: {owner: req.body.owner}
                            }).then(user =>{
                                res.end();
                            });
    });

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

    app.post("/deckbuilder", function(req, res){
        console.log("creating");
        createAllCards();
        res.end();
    });

    app.post("/addcard", function(req, res){    
        db.Decks.count({ where: {owner: req.body.owner}}).then(c => {
            if (c < 20){
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
                            owner: req.body.owner,
                            cardNumber: req.body.cardNumber
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

    });

    app.put("/player/:user/:result/:num", function(req, res){
        if (req.params.result === "win") {
            db.Users.update({ wins: req.params.num}, {
                where: {email: req.params.user}
            }).then(user =>{
                res.end();
            })
        }
        else {
            db.Users.update({ losses: req.params.num}, {
                where: {email: req.params.user}
            }).then(user =>{
                res.end();
            })
        }
    });

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
// Create cards numbered 1-13 for each color in the colors array
function createAllCards() { 
    var imageSetOne = ["/assets/images/nintendo/N1.png", "/assets/images/nintendo/N2.png", "/assets/images/nintendo/N3.png", "/assets/images/nintendo/N4.png", "/assets/images/nintendo/N5.png", "/assets/images/nintendo/N6.png", "/assets/images/nintendo/N7.png", "/assets/images/nintendo/N8.png", "/assets/images/nintendo/N9.png", "/assets/images/nintendo/N10.png", "/assets/images/nintendo/N11.png", "/assets/images/nintendo/N12.png", "/assets/images/nintendo/N13.png"];
    var imageSetTwo = ["/assets/images/disney/d1.png", "/assets/images/disney/d2.png", "/assets/images/disney/d3.png", "/assets/images/disney/d4.png", "/assets/images/disney/d5.png", "/assets/images/disney/d6.png", "/assets/images/disney/d7.png", "/assets/images/disney/d8.png", "/assets/images/disney/d9.png", "/assets/images/disney/d10.png", "/assets/images/disney/d11.png", "/assets/images/disney/d12.png", "/assets/images/disney/d13.png"];
    var imageSetThree = ["/assets/images/pokemon/p1.png", "/assets/images/pokemon/p2.png", "/assets/images/pokemon/p3.png", "/assets/images/pokemon/p4.png", "/assets/images/pokemon/p5.png", "/assets/images/pokemon/p6.png", "/assets/images/pokemon/p7.png", "/assets/images/pokemon/p8.png", "/assets/images/pokemon/p9.png", "/assets/images/pokemon/p10.png", "/assets/images/pokemon/p11.png", "/assets/images/pokemon/p12.png", "/assets/images/pokemon/p13.png"];
    var imageSetFour = ["/assets/images/lastAirbender/la1.png", "/assets/images/lastAirbender/la2.png", "/assets/images/lastAirbender/la3.png", "/assets/images/lastAirbender/la4.png", "/assets/images/lastAirbender/la5.png", "/assets/images/lastAirbender/la6.png", "/assets/images/lastAirbender/la7.png", "/assets/images/lastAirbender/la8.png", "/assets/images/lastAirbender/la9.png", "/assets/images/lastAirbender/la10.png", "/assets/images/lastAirbender/la11.png", "/assets/images/lastAirbender/la12.png", "/assets/images/lastAirbender/la13.png"];
    var imageSetFive = ["/assets/images/rick&morty/rm1.png", "/assets/images/rick&morty/rm2.png", "/assets/images/rick&morty/rm3.png", "/assets/images/rick&morty/rm4.png", "/assets/images/rick&morty/rm5.png", "/assets/images/rick&morty/rm6.png", "/assets/images/rick&morty/rm7.png", "/assets/images/rick&morty/rm8.png", "/assets/images/rick&morty/rm9.png", "/assets/images/rick&morty/rm10.png", "/assets/images/rick&morty/rm11.png", "/assets/images/rick&morty/rm12.png", "/assets/images/rick&morty/rm13.png"];
    var imageSetSix = ["/assets/images/adventureTime/at1.png", "/assets/images/adventureTime/at2.png", "/assets/images/adventureTime/at3.png", "/assets/images/adventureTime/at4.png", "/assets/images/adventureTime/at5.png", "/assets/images/adventureTime/at6.png", "/assets/images/adventureTime/at7.png", "/assets/images/adventureTime/at8.png", "/assets/images/adventureTime/at9.png", "/assets/images/adventureTime/at10.png", "/assets/images/adventureTime/at11.png", "/assets/images/adventureTime/at12.png", "/assets/images/adventureTime/at13.png"];
    var imageSetSeven = ["/assets/images/league/l1.png", "/assets/images/league/l2.png", "/assets/images/league/l3.png", "/assets/images/league/l4.png", "/assets/images/league/l5.png", "/assets/images/league/l6.png", "/assets/images/league/l7.png", "/assets/images/league/l8.png", "/assets/images/league/l9.png", "/assets/images/league/l10.png", "/assets/images/league/l11.png", "/assets/images/league/l12.png", "/assets/images/league/l13.png"];
    var imageSetEight = ["/assets/images/fireEmblem/fe1.png", "/assets/images/fireEmblem/fe2.png", "/assets/images/fireEmblem/fe3.png", "/assets/images/fireEmblem/fe4.png", "/assets/images/fireEmblem/fe5.png", "/assets/images/fireEmblem/fe6.png", "/assets/images/fireEmblem/fe7.png", "/assets/images/fireEmblem/fe8.png", "/assets/images/fireEmblem/fe9.png", "/assets/images/fireEmblem/fe10.png", "/assets/images/fireEmblem/fe11.png", "/assets/images/fireEmblem/fe12.png", "/assets/images/fireEmblem/fe13.png"];
    var imagesSet = [imageSetOne, imageSetTwo, imageSetThree, imageSetFour, imageSetFive, imageSetSix, imageSetSeven, imageSetEight]
    var colors = ["0red", "1grey", "2blue", "3brown", "4green", "5orange", "6yellow", "7purple"];
    for (var i=0; i<colors.length; i++) {
        for (var j=0; j<13; j++) {
            db.Cards.create({
                color: colors[i],
                number: (j+1),
                image: imagesSet[i][j]
            });
        }
    }
}

