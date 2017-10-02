var config = {
    apiKey: "AIzaSyCyoSG6PlAbNFsQiD412QwOrZDhnE-WBiI",
    authDomain: "domainwars-6193c.firebaseapp.com",
    databaseURL: "https://domainwars-6193c.firebaseio.com",
    projectId: "domainwars-6193c",
    storageBucket: "domainwars-6193c.appspot.com",
    messagingSenderId: "15439536695"
};

firebase.initializeApp(config);
var database = firebase.database();

var allCardsArray = [];
var player, computer;

function Player(name, deck) {
    this.name = name;
    this.deck = deck;
    this.hand = [];
    this.last = {};
    this.discard = [];
    this.cardCount = this.deck.length;
    this.shuffle = function(){
        var currentIndex = this.deck.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randomIndex];
            this.deck[randomIndex] = temporaryValue;
        }
    }
    // Play a card, paramaters represent position in hand and boolean if card is destroyed
    this.playCard = function(num, destroy){
        if (!destroy){
            if (this.cardCount >= 3) {
                // Add the played card to the last played card area and discard array
                this.last = this.hand[num];
                this.discard.push(this.hand[num]);
                // Remove the card from the hand array
                this.hand.splice(num,1);
            }
        }
        else {
            this.cardCount--;
            // Remove the card from the hand array
            this.hand.splice(num,1);
        }
        
    }
    this.drawCard = function(){
        if (this.deck.length === 0) {
            this.deck = this.discard;
            this.shuffle();
            this.discard = [];
            this.last = {};
        }
        // You can only draw up to 3 cards
        if (this.hand.length < 3 && this.cardCount >= 3){
            this.hand.push(this.deck[0]);   
            this.deck.shift();
        }
        
    }
}

$("#start").on("click", function(){
    $.post("/deckbuilder", function(data) {

    });
});

$("#arena").on("click", function(){
    $.get("/allcards", function(data){  
        allCardsArray = data; 
        console.log("Cards loaded");
    })
});

$("#setup").on("click", function(){
    setUpPlayers();
    console.log("Players setup");
    console.log(player);
    console.log(computer);
})

$("#battle").on("click", function(){
    updateCards();
})

$(".playercard").on("click", function(){
    var num = ($(this).attr("data"));
    // Computer pick a random card
    var compChoice = Math.floor(Math.random()*(computer.hand.length));
    var compCard = computer.hand[compChoice];
    // Outcome is decided by battle function
    var outcome = battle(parseInt(player.hand[num].color.charAt(0)), player.hand[num].number, 
                        parseInt(compCard.color.charAt(0)), compCard.number);
    console.log("Player played: " + player.hand[num].color + " " + player.hand[num].number);
    console.log("Computer played: " + compCard.color + " " + compCard.number);
    console.log(outcome);
    // Depending on outcome, call proper playCard functions on each player
    switch (outcome) {
        case "win":
            player.playCard(num, false);
            computer.playCard(compChoice, true);
            break;
        case "lose":
            player.playCard(num, true);
            computer.playCard(compChoice, false);
            break;
        case "draw":
            player.playCard(num, false);
            computer.playCard(compChoice, false);
            break;
    }
    // Each player draws another card
    player.drawCard();
    computer.drawCard();
    console.log(player);
    console.log(computer);
    // Update the html
    updateCards();
})

function battle(col_one, num_one, col_two, num_two){
    switch(Math.abs(col_one - col_two)){
        // Trump
        case 1:
        case 7:
            if (col_one === 0 && col_two === 7) {
                return "win";
            }
            else if (col_one > col_two) {
                return "win";
            }
            else if (col_one < col_two) {
                return "lose";
            }
            break;
        // Smaller number wins
        case 2:
        case 6:
            if (num_one < num_two) {
                return "win";
            }
            else if (num_one > num_two) {
                return "lose";
            }
            else {
                return "draw";
            }
        // Bigger number wins
        case 3:
        case 5:
            if (num_one > num_two) {
                return "win";
            }
            else if (num_one < num_two) {
                return "lose";
            }
            else {
                return "draw";
            }
            break;
        // Closest to 7 wins
        case 0:
            var distToSeven_one = Math.abs(6 - num_one);
            var distToSeven_two = Math.abs(6 - num_two);
            if (distToSeven_one === distToSeven_two) {
                return "draw";
            }
            else if (distToSeven_one < distToSeven_two) {
                return "win";
            }
            else if (distToSeven_one > distToSeven_two) {
                return "lose";
            }
        // Furthest from 7 wins
        case 4:
            var distToSeven_one = Math.abs(6 - num_one);
            var distToSeven_two = Math.abs(6 - num_two);
            if (distToSeven_one === distToSeven_two) {
                return "draw";
            }
            else if (distToSeven_one > distToSeven_two) {
                return "win";
            }
            else if (distToSeven_one < distToSeven_two) {
                return "lose";
            }
    }
}

function updateCards() {
    for (var i=0; i<3; i++) {
        if (player.cardCount > i){
            $("#playercard" + i).html("<p>" + player.hand[i].color + "</p><p>" + 
                player.hand[i].number + "</p><p>" + player.hand[i].image);
        }
        else {
            $("#playercard" + i).html("No card left");
        }
        if (computer.cardCount > i){
            $("#computercard" + i).html("<p>" + computer.hand[i].color + "</p><p>" + 
                computer.hand[i].number + "</p><p>" + computer.hand[i].image);
        }
        else {
            $("#computercard" + i).html("No card left");
        }
    }
}

function setUpPlayers(){
    // Create an array of 20 unique random numbers between 0-104
    var cardNumbers = [];
    var deck1 = [];
    var deck2 = [];
    while(cardNumbers.length < 20){
        var randomnumber = Math.floor(Math.random()*104)
        if(cardNumbers.indexOf(randomnumber) > -1) continue;
        cardNumbers[cardNumbers.length] = randomnumber;
    }
    // Use that array to pick cards from the database
    for (var i=0; i<cardNumbers.length; i++) {
        deck1.push(allCardsArray[cardNumbers[i]]);
    }
    // Do it again for another player
    while(cardNumbers.length < 20){
        var randomnumber = Math.floor(Math.random()*104)
        if(cardNumbers.indexOf(randomnumber) > -1) continue;
        cardNumbers[cardNumbers.length] = randomnumber;
    }
    for (var i=0; i<cardNumbers.length; i++) {
        deck2.push(allCardsArray[cardNumbers[i]]);
    }
    // Create two players
    player = new Player("Player", deck1);
    computer = new Player("Computer", deck2);

    player.shuffle();
    computer.shuffle();

    player.drawCard();
    player.drawCard();
    player.drawCard();
    computer.drawCard();
    computer.drawCard();
    computer.drawCard();
}

$(".card").on("click", function() {
    console.log($(this).attr("datacol"));
    console.log($(this).attr("datanum"));

});