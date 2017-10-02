var db = require("../models");

module.exports = function(app) {

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

    app.get("/arena", function(req, res){

        res.render("arena");
    });

    app.get("/deckbuilder", function(req, res){
        
        var cardArray = [];
        db.cards.findAll().then(cards => {
            for(var i=0; i<cards.length; i++){
                cardArray.push(cards[i].dataValues);
            }

            res.render("deckbuilder", {cards: cardArray});
        })
        
    });

    app.post("/deckbuilder", function(req, res){
        console.log("creating");
        createAllCards();
        res.end();
    });
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

