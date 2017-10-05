$(document).ready(function () {

    var config = {
        apiKey: "AIzaSyCyoSG6PlAbNFsQiD412QwOrZDhnE-WBiI",
        authDomain: "domainwars-6193c.firebaseapp.com",
        databaseURL: "https://domainwars-6193c.firebaseio.com",
        projectId: "domainwars-6193c",
        storageBucket: "domainwars-6193c.appspot.com",
        messagingSenderId: "15439536695"
    };

    firebase.initializeApp(config);

    var allCardsArray = [];
    var player, computer, currentUser;
    var waiting;
    var game;

    $("#signIn").hide();
    $("#roundUp").hide();
    $("#introArena").hide();
    $("#gameArena").hide();
    $("#modalButton").hide();
   
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

    $("#roundUp").on("click", function () {
        $("#roundUp").hide();
        $("#battleBoxPlayer").html("");
        $("#battleBoxComp").html("");

        $("#playerDiscard").html("<img class='hand' src='"+player.last.image+"'>" + "<h5>"+(player.discard.length + 1)+"</h5>");
        $("#compDiscard").html("<img class='hand' src='"+computer.last.image+"'>");
        $("#resultMessage").html("");

        updateCards();

        waiting = false;
    });

    $("#goToArena").on("click", function () {
        $.get("/deck/" + firebase.auth().currentUser.email, function (data) {
            console.log(data);
            if (data.length === 20) {
                window.location.assign("/arena");
            }
            else {
                $("#deckMessage").html("Deck too small, you need 20 cards");
            }
        });
    })

    $("#play").on("click", function(){
        var playerDeck = [];
        $.get("/deck/"+firebase.auth().currentUser.email, function(data){
            $("#introMessage").html(data.length);
            if (data.length != 20) {
                $("#introMessage").html("Your deck must be 20 cards to play, go back to Builder to add more cards!");
            }
            else {
                for (var i=0; i<data.length; i++) {
                    playerDeck.push(data[i]);
                }
                $("#gameArena").show();
                $("#introArena").hide();
                game = true;
                $.get("/allcards", function (data) {
                    allCardsArray = data;
                    setUpPlayers(playerDeck);
                    updateCards();
                });
            }
        })
    });

    $("#signInBtn").on("click", function () {
        event.preventDefault();

        var email = $("#signInEmail").val().trim();
        var password = $("#signInPass").val().trim();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            var user = firebase.auth().currentUser;
            currentUser = user.displayName;
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

    $("#signUpBtn").on("click", function () {
        event.preventDefault();

        var email = $("#signUpEmail").val().trim();
        var username = $("#signUpName").val().trim();
        var password = $("#signUpPass").val().trim();
        var checkPass = $("#passwordConfirm").val().trim();

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

                $.post("/signup", { email: email, username: username }, function(data) {

                })

                $.post("/createGameState", { email: email }, function(data){

                })

                // Clear input fields
                $("#signUpEmail, #signUpName, #signUpPass, #passwordConfirm").val("");

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

    $("#logOutBtn").on("click", function () {
        firebase.auth().signOut();
    });

    $("#switchToSignUp").on("click", function () {
        $("#signIn").hide();
        $("#signUp").show();
        $(".errMsg").html("");
    });

    $("#switchToSignIn").on("click", function () {
        $("#signIn").show();
        $("#signUp").hide();
        $(".errMsg").html("");
    });

    $(".playercard").on("click", function () {
        if (!waiting) {
            var num = ($(this).attr("data"));
            // Computer pick a random card
            var compChoice = Math.floor(Math.random() * (computer.hand.length));
            var compCard = computer.hand[compChoice];
            // Outcome is decided by battle function
            var outcome = battle(parseInt(player.hand[num].color.charAt(0)), player.hand[num].number,
                parseInt(compCard.color.charAt(0)), compCard.number);

            $("#battleBoxPlayer").html("<img id='playerDropBox' class='played' src='"+player.hand[num].image+"'>");
            $("#battleBoxComp").html("<img id='compDropBox' class='played' src='"+compCard.image+"'>");
            $("#hand"+num).hide();

            $("#comphand"+compChoice).hide();

            $("#roundUp").show();

            // Depending on outcome, call proper playCard functions on each player
            switch (outcome) {
                case "win":
                    $("#resultMessage").html(player.hand[num].name+" defeats "+compCard.name);
                    $("#battleBoxComp").css("color", "red");
                    $("#battleBoxPlayer").css("color", "white");
                    player.playCard(num, false);
                    computer.playCard(compChoice, true);
                    break;
                case "lose":
                    $("#resultMessage").html(compCard.name+" defeats "+player.hand[num].name);
                    $("#battleBoxPlayer").css("color", "red");
                    $("#battleBoxComp").css("color", "white");
                    player.playCard(num, true);
                    computer.playCard(compChoice, false);
                    break;
                case "draw":
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
            
            var gameState = {
                owner: firebase.auth().currentUser.email,
                gameInProgress: game,
                player: JSON.stringify(player),
                computer: JSON.stringify(computer) 
            }

            $.post("/updateGamestate", gameState, function(data){

            });
            console.log(outcome);
            console.log(player.cardCount);
            console.log(computer.cardCount);
            waiting = true;
        }
    })

    function battle(col_one, num_one, col_two, num_two) {
        switch (Math.abs(col_one - col_two)) {
            // Trump
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

    function gameOver(cardsLeft, compCardsLeft) {
        // Modal trigger
        $("#roundUp").hide();
        $("#modalButton").show();
        $.get("/profile/"+firebase.auth().currentUser.email, function(data){
            // If the player wins
            if (cardsLeft > 0) {
                $("#endMessage").html("You have won! Congratulations, keep up the good work.");
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

    function updateCards() {
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
        $("#playerDiscard").html("<img id='discard' src='"+player.last.image+"'>");
        $("#playerDeckNum").html("Deck: "+ player.deck.length);
        $("#playerDiscardNum").html("Discard: "+ player.discard.length);
        $("#compDeckNum").html("Deck: "+ computer.deck.length);
        $("#compDiscardNum").html("Discard: "+ computer.discard.length);
        $("#compDiscard").html("<img id='discard' src='"+computer.last.image+"'>");
    }

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

        player.shuffle();
        computer.shuffle();

        player.drawCard();
        player.drawCard();
        player.drawCard();
        computer.drawCard();
        computer.drawCard();
        computer.drawCard();
    }

    function updateGamestate(){
        $.get("/gamestate/"+firebase.auth().currentUser.email, function(data){
            if(data.player) {
                var tempplayer = JSON.parse(data.player);

                player = new Player(tempplayer.name, tempplayer.deck, tempplayer.hand, 
                    tempplayer.last, tempplayer.discard);
                player.cardCount = tempplayer.cardCount;
            }
            if(data.computer) {
                var tempcomputer = JSON.parse(data.computer);

                computer = new Player(tempcomputer.name, tempcomputer.deck, tempcomputer.hand, 
                    tempcomputer.last, tempcomputer.discard);
                computer.cardCount = tempcomputer.cardCount;
            }

            game = data.gameInProgress;

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

    function updateDeck() {

        $.get("/deck/"+firebase.auth().currentUser.email, function(data){
            
            for (var i=0; i<20; i++) {

                if (data[i]) {
                    $("#deckCard" + i).attr("datacol", data[i].color);
                    $("#deckCard" + i).attr("datanum", data[i].number);
                    $("#deckCard" + i).attr("datacardnum", data[i].cardNumber);
                    $("#deckCard" + i).html("<img class='deckCard' src='" + data[i].image + "'>");

                    $("#"+data[i].cardNumber).hide();
                }
                else {
                    $("#deckCard" + i).html("");
                }
            }
        })
    }

    function updateProfile() {
        $.get("/profile/"+firebase.auth().currentUser.email, function(data){
            $("#profileName").html(data.username);
            $("#profileWins").html("Wins: " + data.wins); 
            $("#profileLosses").html("Losses: " + data.losses); 
        })    
    }

    $(".deckCard").on("click", function() {
        var number = parseInt($(this).attr("datacardnum"));
        $("#"+number).show();

        var card = {
            color: $(this).attr("datacol"),
            number: $(this).attr("datanum"),
            owner: firebase.auth().currentUser.email
        }

        $.ajax({
            method: "DELETE",
            url: "/deletecard/" + card.color + "/" + card.number + "/" + card.owner,
            success: function (data) { },
            complete: function (data) {
                updateDeck();
            }
        })
    });

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

        $.post("/addcard", card, function(data){
            
            updateDeck();
        })

    });

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
});

