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

        var cardArray = [];
        var playerCards = []
        db.Cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                cardArray.push(cards[i].dataValues);
            }

            res.render("deckbuilder", {cards: cardArray});
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

    app.post("/signup", function(req, res){

        db.Users.findOne({ where: {email: req.body.email} }).then(user => {

            if (user) {
                res.send(false);
            }
            else {
                db.Users.create({
                    email: req.body.email,
                    wins: 0,
                    losses: 0
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
    var imageSetFive = ["/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png"];
    var imageSetSix = ["/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png"];
    var imageSetSeven = ["/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png"];
    var imageSetEight = ["/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png", "/assets/images/1AdventureTime.png"];
    var imagesSet = [imageSetOne, imageSetTwo, imageSetThree, imageSetFour, imageSetFive, imageSetSix, imageSetSeven, imageSetEight]
    var colors = ["0red", "1grey", "2blue", "3brown", "4blue", "5purple", "6black", "7white"];
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

