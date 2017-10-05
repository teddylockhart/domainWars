$(document).ready(function () {

    // Use firebase for user authentication
    var config = {
        apiKey: "AIzaSyCyoSG6PlAbNFsQiD412QwOrZDhnE-WBiI",
        authDomain: "domainwars-6193c.firebaseapp.com",
        databaseURL: "https://domainwars-6193c.firebaseio.com",
        projectId: "domainwars-6193c",
        storageBucket: "domainwars-6193c.appspot.com",
        messagingSenderId: "15439536695"
    };
    firebase.initializeApp(config);
    // Create variables to be used clientside
    var allCardsArray = [];
    var player, computer, currentUser;
    var waiting;
    var game;
    // Hide the appropriate sections from the page until they are needed
    $("#signIn").hide();
    $("#roundUp").hide();
    $("#introArena").hide();
    $("#gameArena").hide();
    $("#modalButton").hide();
   // JQuery for the modal
    $('.modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '8%', // Starting top style attribute
        endingTop: '12%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            
            console.log(modal, trigger);
          }
      }
    );
    // This is the player object that holds all information for any player or computer in the game
    function Player(name, deck, hand, last, discard) {
        this.name = name;
        this.deck = deck;
        this.hand = hand;
        this.last = last;
        this.discard = discard;
        this.cardCount = this.deck.length;
        this.shuffle = function () {
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
        this.playCard = function (num, destroy) {
            if (!destroy) {
                if (this.cardCount >= 3) {
                    // Add the played card to the last played card area and discard array
                    this.last = this.hand[num];
                    this.discard.push(this.hand[num]);
                    // Remove the card from the hand array
                    this.hand.splice(num, 1);
                }
            }
            else {
                this.cardCount--;
                // Remove the card from the hand array
                this.hand.splice(num, 1);
            }

        }
        // Draw a card
        this.drawCard = function () {
            if (this.deck.length === 0) {
                this.deck = this.discard;
                this.shuffle();
                this.discard = [];
                this.last = {};
            }
            // You can only draw up to 3 cards
            if (this.hand.length < 3 && this.cardCount >= 3) {
                this.hand.push(this.deck[0]);
                this.deck.shift();
            }

        }
    }
    // This code is run when the "Next Round" button is pressed
    $("#roundUp").on("click", function () {
        // Hide the button and empty the battle boxes
        $("#roundUp").hide();
        $("#battleBoxPlayer").html("");
        $("#battleBoxComp").html("");
        // Update the players discard piles
        $("#playerDiscard").html("<img class='hand' src='"+player.last.image+"'>" + "<h5>"+(player.discard.length + 1)+"</h5>");
        $("#compDiscard").html("<img class='hand' src='"+computer.last.image+"'>");
        $("#resultMessage").html("");
        // Update the card images
        updateCards();
        // Tell the program that the player can now make another move
        waiting = false;
    });
    // This code is run when the user clicks on the Play button at the beginning of the arena
    $("#play").on("click", function(){
        // Create an array to hold the players cards
        var playerDeck = [];
        $.get("/deck/"+firebase.auth().currentUser.email, function(data){
            // Make sure the player has a deck of 20
            if (data.length != 20) {
                $("#introMessage").html("Your deck must be 20 cards to play, go back to Builder to add more cards!");
            }
            else {
                // If the deck is 20, populate the array with the cards from the database
                for (var i=0; i<data.length; i++) {
                    playerDeck.push(data[i]);
                }
                // Hide the intro box and show the arena
                $("#gameArena").show();
                $("#introArena").hide();
                // Set the game value to true so the app knows a game is running
                game = true;
                $.get("/allcards", function (data) {
                    // Fill allCardsArray with all the cards available so the computer can pick from them
                    allCardsArray = data;
                    // Setup the players, pass the players deck for object creation
                    setUpPlayers(playerDeck);
                    updateCards();
                });
            }
        })
    });
    // This code is run when a player signs in
    $("#signInBtn").on("click", function () {
        event.preventDefault();

        var email = $("#signInEmail").val().trim();
        var password = $("#signInPass").val().trim();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            var user = firebase.auth().currentUser;
            currentUser = user.displayName;
            // Send the user to their profile page
            window.location.assign("/profile");
            $("#signInEmail, #signInPass").val("");
        }).catch(function (error) {

            //  Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $(".errMsg").html(errorMessage);
            $("#signInEmail, #signInPass").val("");
        });


    });
    // This code is run when a player signs up
    $("#signUpBtn").on("click", function () {
        event.preventDefault();

        var email = $("#signUpEmail").val().trim();
        var username = $("#signUpName").val().trim();
        var password = $("#signUpPass").val().trim();
        var checkPass = $("#passwordConfirm").val().trim();
        // Handle some errors in information entry
        if (username === "") {
            $(".errMsg").html("Please enter a user name");
            $("#signUpPass, #passwordConfirm").val("");
        }
        else if (email === "") {
            $(".errMsg").html("Please enter an email address");
            $("#signUpPass, #passwordConfirm").val("");
        }
        else if (password === "") {
            $(".errMsg").html("Please enter a password");
            $("#signUpPass, #passwordConfirm").val("");
        }
        else if (password === checkPass) {
            firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {

                // Set users display name
                var user = firebase.auth().currentUser;
                user.updateProfile({
                    displayName: username
                }).catch(function (error) { });
                // Add the user to the database
                $.post("/signup", { email: email, username: username }, function(data) {

                })
                // Create a gamestate for the user
                $.post("/createGameState", { email: email }, function(data){

                })
                // Clear input fields
                $("#signUpEmail, #signUpName, #signUpPass, #passwordConfirm").val("");
                // Send the user to their profile page
                window.location.assign("/profile");

            }).catch(function (error) {

                //  Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                $(".errMsg").html(errorMessage);
                $("#signUpEmail, #signUpName, #signUpPass, #passwordConfirm").val("");
            });
        }
        else {
            $(".errMsg").html("Passwords do not match");
            $("#signUpEmail, #signUpName, #signUpPass, #passwordConfirm").val("");
        }
    });
    // This code handles a user logging out
    $("#logOutBtn").on("click", function () {
        firebase.auth().signOut();
    });
    // This code changes the sign in box to the sign up box
    $("#switchToSignUp").on("click", function () {
        $("#signIn").hide();
        $("#signUp").show();
        $(".errMsg").html("");
    });
    // This code changes the sign up box to the sign in box
    $("#switchToSignIn").on("click", function () {
        $("#signIn").show();
        $("#signUp").hide();
        $(".errMsg").html("");
    });
    // This code runs when a player clicks on one of their card, it handles the game logic
    $(".playercard").on("click", function () {
        // Make sure the game is ready for a card to be played
        if (!waiting) {
            // Set the card number the player chose
            var num = ($(this).attr("data"));
            // Computer picks a random card
            var compChoice = Math.floor(Math.random() * (computer.hand.length));
            var compCard = computer.hand[compChoice];
            // Outcome is decided by battle function
            var outcome = battle(parseInt(player.hand[num].color.charAt(0)), player.hand[num].number,
                parseInt(compCard.color.charAt(0)), compCard.number);
          
            // Put the played cards into the battle boxes
            $("#battleBoxPlayer").html("<img class='hand' src='"+player.hand[num].image+"'>");
            $("#battleBoxComp").html("<img class='hand' src='"+compCard.image+"'>");
            // Hide the played cards in the players' hands

            $("#hand"+num).hide();
            $("#comphand"+compChoice).hide();
            // Show the "Next Round" button
            $("#roundUp").show();
            // Depending on outcome, call proper playCard functions on each player
            switch (outcome) {
                case "win": // The player wins
                    $("#resultMessage").html(player.hand[num].name+" defeats "+compCard.name);
                    $("#battleBoxComp").css("color", "red");
                    $("#battleBoxPlayer").css("color", "white");
                    player.playCard(num, false);
                    computer.playCard(compChoice, true);
                    break;
                case "lose": // The computer wins
                    $("#resultMessage").html(compCard.name+" defeats "+player.hand[num].name);
                    $("#battleBoxPlayer").css("color", "red");
                    $("#battleBoxComp").css("color", "white");
                    player.playCard(num, true);
                    computer.playCard(compChoice, false);
                    break;
                case "draw": // It is a draw
                    $("#resultMessage").html("Draw!");
                    $("#battleBoxComp").css("color", "red");
                    $("#battleBoxPlayer").css("color", "red");
                    player.playCard(num, true);
                    computer.playCard(compChoice, true);
                    break;
            }
            // Check for game over
            if (player.cardCount === 0 || computer.cardCount === 0){
                gameOver(player.cardCount, computer.cardCount);
                game = false;
            }
            else {
                // Each player draws another card
                player.drawCard();
                computer.drawCard();
            }
            // Update the game state after each play
            var gameState = {
                owner: firebase.auth().currentUser.email,
                gameInProgress: game,
                player: JSON.stringify(player),
                computer: JSON.stringify(computer) 
            }
            $.post("/updateGamestate", gameState, function(data){});
            // Change the boolean that makes sure player doesn't submit moves too quickly
            waiting = true;
        }
    })
    // This code is run when a user clicks on one of the cards in their deck on the deckbuilder page,
    // deleting the card from their deck and adding it back to the card list
    $(".deckCard").on("click", function() {
        // Get the number of the card
        var number = parseInt($(this).attr("datacardnum"));
        // Show the card with the matching number in the card list
        $("#"+number).show();

        var card = {
            color: $(this).attr("datacol"),
            number: $(this).attr("datanum"),
            owner: firebase.auth().currentUser.email
        }
        // Delete the proper card from the users deck in the database
        $.ajax({
            method: "DELETE",
            url: "/deletecard/" + card.color + "/" + card.number + "/" + card.owner,
            success: function (data) { },
            complete: function (data) {
                updateDeck();
            }
        })
    });
    // This code is run when a user click on one of the cards in the card list, adding it to their deck.
    $(".deck").on("click", function() {
        var number = parseInt($(this).attr("id"));

        var card = {
            color: $(this).attr("datacol"),
            number: $(this).attr("datanum"),
            image: $(this).attr("dataimg"),
            owner: firebase.auth().currentUser.email,
            cardNumber: number,
            name: $(this).attr("dataname")
        }
        // Add the card to the deck database
        $.post("/addcard", card, function(data){
            // Update the images for the users deck and the card list on deckbuilder
            updateDeck();
        })
    });
    // This function takes two card colors and numbers, the first represents the players card, the second
    // represents the computers card, it then returns if the player won, lost, or it was a draw.
    function battle(col_one, num_one, col_two, num_two) {
        // Check the difference between the colors to determine how the winner is decided
        switch (Math.abs(col_one - col_two)) {
            // Trump card wins
            case 1:
            case 7:
                if (col_one === 0 && col_two === 7) {
                    return "lose";
                }
                else if (col_one > col_two) {
                    return "lose";
                }
                else if (col_one < col_two) {
                    return "win";
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
                var distToSeven_one = Math.abs(7 - num_one);
                var distToSeven_two = Math.abs(7 - num_two);
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
                var distToSeven_one = Math.abs(7 - num_one);
                var distToSeven_two = Math.abs(7 - num_two);
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
    // This function is run when the game is over, taking the amount of cards each player has left as
    // parameters to determine who won
    function gameOver(cardsLeft, compCardsLeft) {
        // Show the Results button that opens the modal and hide the Next Round button
        $("#roundUp").hide();
        $("#modalButton").show();
        $.get("/profile/"+firebase.auth().currentUser.email, function(data){
            // If the player wins
            if (cardsLeft > 0) {
                $("#endMessage").html("You have won! Congratulations, keep up the good work.");
                // Update the players win count
                var newWins = data.wins + 1;
                console.log("Win " + newWins);
                $.ajax({
                    method: "PUT",
                    url: "/player/" + firebase.auth().currentUser.email + "/win/" + newWins,
                    success: function (data) {},
                    complete: function (data) {}
                });
            }
            // If the player lost
            else if (compCardsLeft > 0) {
                $("#endMessage").html("You have been defeated! Better luck next time.");
                // Update the players loss count
                var newLosses = data.losses + 1;
                console.log("Loss " + newLosses);
                $.ajax({
                    method: "PUT",
                    url: "/player/" + firebase.auth().currentUser.email + "/lose/" + newLosses,
                    success: function (data) {},
                    complete: function (data) {}
                });
            }
            // If it was a draw
            else {
                $("#endMessage").html("The game has ended in a draw. Your win/loss record is not " +
                 "affected.");
            }
        })
    }
    // This function updates all of the html for the hands, decks, and discards
    function updateCards() {
        // This loop makes sure the right amount of cards get displayed in the hands
        for (var i = 0; i < 3; i++) {
            if (player.cardCount > i) {
                $("#playercard" + i).html("<img class='hand' id='hand" + i + "' src='"+player.hand[i].image+"'>");
            }
            else {
                $("#playercard" + i).hide();
            }
            if (computer.cardCount > i) {
                $("#computercard" + i).html("<img class='hand' id='comphand" + i + "' src='"+computer.hand[i].image+"'>");
            }
            else {
                $("#computercard" + i).hide();
            }
        }
        // Update the player and computer deck and discard areas
        $("#playerDiscard").html("<img id='discard' src='"+player.last.image+"'>");
        $("#playerDeckNum").html("Deck: "+ player.deck.length);
        $("#playerDiscardNum").html("Discard: "+ player.discard.length);
        $("#compDeckNum").html("Deck: "+ computer.deck.length);
        $("#compDiscardNum").html("Discard: "+ computer.discard.length);
        $("#compDiscard").html("<img id='discard' src='"+computer.last.image+"'>");
    }
    // This function creates the two player objects
    function setUpPlayers(playerDeck) {
        var cardNumbers = [];
        var computerDeck = [];
        // Create an array of 20 unique random numbers between 0-104
        while (cardNumbers.length < 20) {
            var randomnumber = Math.floor(Math.random() * 104)
            if (cardNumbers.indexOf(randomnumber) > -1) continue;
            cardNumbers[cardNumbers.length] = randomnumber;
        }
        // Use that array to pick cards for the computer from the database
        for (var i = 0; i < cardNumbers.length; i++) {
            computerDeck.push(allCardsArray[cardNumbers[i]]);
        }
        // Create two players
        player = new Player("Player", playerDeck, [], {}, []);
        computer = new Player("Computer", computerDeck, [], {}, []);
        // Shuffle the players decks
        player.shuffle();
        computer.shuffle();
        // Draw three cards for each player
        player.drawCard();
        player.drawCard();
        player.drawCard();
        computer.drawCard();
        computer.drawCard();
        computer.drawCard();
    }
    // This function updates the game state so a user doesn't lose their progress when the page is
    // refreshed or they log out and back on
    function updateGamestate(){
        // Get the information from the database about the users gamestate
        $.get("/gamestate/"+firebase.auth().currentUser.email, function(data){
            // Update the player
            if(data.player) {
                var tempplayer = JSON.parse(data.player);

                player = new Player(tempplayer.name, tempplayer.deck, tempplayer.hand, 
                    tempplayer.last, tempplayer.discard);
                player.cardCount = tempplayer.cardCount;
            }
            // Update the computer
            if(data.computer) {
                var tempcomputer = JSON.parse(data.computer);

                computer = new Player(tempcomputer.name, tempcomputer.deck, tempcomputer.hand, 
                    tempcomputer.last, tempcomputer.discard);
                computer.cardCount = tempcomputer.cardCount;
            }
            // Set the game variable to what it was last time the gamestate was updated
            game = data.gameInProgress;
            // Display the proper page based on if the game is in progress or not
            if (game) {
                $("#introArena").hide();
                $("#gameArena").show();
                updateCards();
            }
            else {
                $("#introArena").show();
                $("#gameArena").hide();
            }
        })
    }
    // This function updates the deck and card list on the deckbuilder page
    function updateDeck() {
        // Get the users deck from the database
        $.get("/deck/"+firebase.auth().currentUser.email, function(data){
            
            for (var i=0; i<20; i++) {
                // Check if there is a card, if there is, add it to the deck area and hide it from the 
                // card list area
                if (data[i]) {
                    $("#deckCard" + i).attr("datacol", data[i].color);
                    $("#deckCard" + i).attr("datanum", data[i].number);
                    $("#deckCard" + i).attr("datacardnum", data[i].cardNumber);
                    $("#deckCard" + i).html("<img class='deckCard' src='" + data[i].image + "'>");

                    $("#"+data[i].cardNumber).hide();
                }
                // If not, then make the div blank
                else {
                    $("#deckCard" + i).html("");
                }
            }
        })
    }
    // This function updates the users profile information. Name, wins, and losses are all tracked.
    function updateProfile() {
        $.get("/profile/"+firebase.auth().currentUser.email, function(data){
            $("#profileName").html(data.username);
            $("#profileWins").html("Wins: " + data.wins); 
            $("#profileLosses").html("Losses: " + data.losses); 
        })    
    }
    // Code to run when a user is logged in or out
    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {
            updateProfile();
            updateDeck();
            updateGamestate();
        } else {
            if (window.location.pathname != "/") {
                window.location.assign("/");
            }
        }
    });
    // Create cards numbered 1-13 for each color in the colors array
    function createAllCards() { 
        var imageSetOne = ["/assets/images/nintendo/N1.png", "/assets/images/nintendo/N2.png", "/assets/images/nintendo/N3.png", "/assets/images/nintendo/N4.png", "/assets/images/nintendo/N5.png", "/assets/images/nintendo/N6.png", "/assets/images/nintendo/N7.png", "/assets/images/nintendo/N8.png", "/assets/images/nintendo/N9.png", "/assets/images/nintendo/N10.png", "/assets/images/nintendo/N11.png", "/assets/images/nintendo/N12.png", "/assets/images/nintendo/N13.png"];
        var nameSetOne = ["Mario", "Luigi", "Peach", "Piranha Plant", "Rosalina", "Shy Guy", "King Boo", "Magikoopa", "Goomba", "Toad", "Donkey Kong", "Wario", "Bowser"];
        var imageSetTwo = ["/assets/images/disney/d1.png", "/assets/images/disney/d2.png", "/assets/images/disney/d3.png", "/assets/images/disney/d4.png", "/assets/images/disney/d5.png", "/assets/images/disney/d6.png", "/assets/images/disney/d7.png", "/assets/images/disney/d8.png", "/assets/images/disney/d9.png", "/assets/images/disney/d10.png", "/assets/images/disney/d11.png", "/assets/images/disney/d12.png", "/assets/images/disney/d13.png"];
        var nameSetTwo = ["Genie", "Jaffar", "Captain Hook", "Boo", "Nemo", "Peter Pan", "Simba", "Tick-Tock", "Randall", "Rattigan", "Snow White", "Ursula", "Belle"];
        var imageSetThree = ["/assets/images/pokemon/p1.png", "/assets/images/pokemon/p2.png", "/assets/images/pokemon/p3.png", "/assets/images/pokemon/p4.png", "/assets/images/pokemon/p5.png", "/assets/images/pokemon/p6.png", "/assets/images/pokemon/p7.png", "/assets/images/pokemon/p8.png", "/assets/images/pokemon/p9.png", "/assets/images/pokemon/p10.png", "/assets/images/pokemon/p11.png", "/assets/images/pokemon/p12.png", "/assets/images/pokemon/p13.png"];
        var nameSetThree = ["Absol", "Celebi", "Froakie", "Latias", "Lucario", "Pikachu", "Politoed", "Snorlax", "Spheal", "Vespiquen", "Volcarona", "Whimsicott", "Xerneas"];
        var imageSetFour = ["/assets/images/lastAirbender/la1.png", "/assets/images/lastAirbender/la2.png", "/assets/images/lastAirbender/la3.png", "/assets/images/lastAirbender/la4.png", "/assets/images/lastAirbender/la5.png", "/assets/images/lastAirbender/la6.png", "/assets/images/lastAirbender/la7.png", "/assets/images/lastAirbender/la8.png", "/assets/images/lastAirbender/la9.png", "/assets/images/lastAirbender/la10.png", "/assets/images/lastAirbender/la11.png", "/assets/images/lastAirbender/la12.png", "/assets/images/lastAirbender/la13.png"];
        var nameSetFour = ["Cabbage Man", "Aang", "Appa", "Azula", "Iroh", "Katara", "Momo", "Ozai", "Sokka", "Suki", "Mai & Ty Lee", "Toph", "Zuko"];
        var imageSetFive = ["/assets/images/rick&morty/rm1.png", "/assets/images/rick&morty/rm2.png", "/assets/images/rick&morty/rm3.png", "/assets/images/rick&morty/rm4.png", "/assets/images/rick&morty/rm5.png", "/assets/images/rick&morty/rm6.png", "/assets/images/rick&morty/rm7.png", "/assets/images/rick&morty/rm8.png", "/assets/images/rick&morty/rm9.png", "/assets/images/rick&morty/rm10.png", "/assets/images/rick&morty/rm11.png", "/assets/images/rick&morty/rm12.png", "/assets/images/rick&morty/rm13.png"];
        var nameSetFive = ["Beth", "Birdperson", "Fart", "Cromulon", "Jerry", "Morty", "Mr. Meeseeks", "Mr. Poopy Butthole", "Pickle Rick", "Rick", "Squanchy", "Summer", "Tiny Rick"];
        var imageSetSix = ["/assets/images/adventureTime/at1.png", "/assets/images/adventureTime/at2.png", "/assets/images/adventureTime/at3.png", "/assets/images/adventureTime/at4.png", "/assets/images/adventureTime/at5.png", "/assets/images/adventureTime/at6.png", "/assets/images/adventureTime/at7.png", "/assets/images/adventureTime/at8.png", "/assets/images/adventureTime/at9.png", "/assets/images/adventureTime/at10.png", "/assets/images/adventureTime/at11.png", "/assets/images/adventureTime/at12.png", "/assets/images/adventureTime/at13.png"];
        var nameSetSix = ["Bmo", "Flame Princess", "Grob Gob Glob Grod", "Gunter", "Ice King", "Jake", "Lemongrab", "The Lich", "Lumpy Space Princess", "Magic Man", "Marceline", "Princess Bubblegum", "Finn"];
        var imageSetSeven = ["/assets/images/league/l1.png", "/assets/images/league/l2.png", "/assets/images/league/l3.png", "/assets/images/league/l4.png", "/assets/images/league/l5.png", "/assets/images/league/l6.png", "/assets/images/league/l7.png", "/assets/images/league/l8.png", "/assets/images/league/l9.png", "/assets/images/league/l10.png", "/assets/images/league/l11.png", "/assets/images/league/l12.png", "/assets/images/league/l13.png"];
        var nameSetSeven = ["Warwick", "Elise", "Ekko", "Ashe", "Lucian", "Nocturne", "Ezreal", "Diana", "Poppy", "Shyvana", "Rengar", "Wukong", "Katarina"];
        var imageSetEight = ["/assets/images/fireEmblem/fe1.png", "/assets/images/fireEmblem/fe2.png", "/assets/images/fireEmblem/fe3.png", "/assets/images/fireEmblem/fe4.png", "/assets/images/fireEmblem/fe5.png", "/assets/images/fireEmblem/fe6.png", "/assets/images/fireEmblem/fe7.png", "/assets/images/fireEmblem/fe8.png", "/assets/images/fireEmblem/fe9.png", "/assets/images/fireEmblem/fe10.png", "/assets/images/fireEmblem/fe11.png", "/assets/images/fireEmblem/fe12.png", "/assets/images/fireEmblem/fe13.png"];
        var nameSetEight = ["Miriel", "Tiki", "Cherche", "Chrom", "Gaius", "Olivia", "Lon'qu", "Lucina", "Say'ri", "Sumia", "Vaike", "Henry", "Virion"];
        var imagesSet = [imageSetOne, imageSetTwo, imageSetThree, imageSetFour, imageSetFive, imageSetSix, imageSetSeven, imageSetEight];
        var namesSet = [nameSetOne, nameSetTwo, nameSetThree, nameSetFour, nameSetFive, nameSetSix, nameSetSeven, nameSetEight];
        var colors = ["0red", "1grey", "2blue", "3brown", "4green", "5orange", "6yellow", "7purple"];
        for (var i=0; i<colors.length; i++) {
            for (var j=0; j<13; j++) {
                console.log('INSERT INTO cards (color, number, image, name) VALUES ("'+colors[i]+'", '+(j+1)+', "'+imagesSet[i][j]+'", "'+namesSet[i][j]+'");');
            }
        }
    }
});

