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

    $("#signIn").hide();
    $("#roundUp").hide();
    $("#outroArena").hide();
    // $("#introArena").hide();
    $("#gameArena").hide();
   
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

    function Player(name, deck) {
        this.name = name;
        this.deck = deck;
        this.hand = [];
        this.last = {};
        this.discard = [];
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
        $("#playerDiscard").html("<img id='hand' src='"+player.last.image+"'>");
        $("#compDiscard").html("<img id='hand' src='"+computer.last.image+"'>");
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

    $("#start").on("click", function () {
        $.post("/deckbuilder", function (data) {

        });
    });

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
            $(".errorMsg").html(errorMessage);
            $("#signInEmail, #signInPass").val("");
        });


    });

    $("#signUpBtn").on("click", function () {
        event.preventDefault();

        var email = $("#signUpEmail").val().trim();
        currentUser = $("#signUpName").val().trim();
        var password = $("#signUpPass").val().trim();
        var checkPass = $("#passwordConfirm").val().trim();

        if (currentUser === "") {
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
                    displayName: currentUser
                }).catch(function (error) { });

                $.post("/signup", { email: email }, function () {

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

            $("#battleBoxPlayer").html("<img id='hand' src='"+player.hand[num].image+"'>");
            $("#battleBoxComp").html("<img id='hand' src='"+compCard.image+"'>");
            $("#roundUp").show();

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
        for (var i = 0; i < 3; i++) {
            if (player.cardCount > i) {
                $("#playercard" + i).html("<img id='hand' src='"+player.hand[i].image+"'>");
            }
            else {
                $("#playercard" + i).html("No card left");
            }
            if (computer.cardCount > i) {
                $("#computercard" + i).html("<img id='hand' src='"+computer.hand[i].image+"'>");
            }
            else {
                $("#computercard" + i).html("No card left");
            }
        }
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
        player = new Player("Player", playerDeck);
        computer = new Player("Computer", computerDeck);

        player.shuffle();
        computer.shuffle();

        player.drawCard();
        player.drawCard();
        player.drawCard();
        computer.drawCard();
        computer.drawCard();
        computer.drawCard();
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
            cardNumber: number
        }

        $.post("/addcard", card, function(data){
            
            updateDeck();
        })

    });

    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {
            if (!currentUser) { currentUser = user.displayName; }

            updateDeck();
        } else {
            if (window.location.pathname != "/") {
                window.location.assign("/");
            }
        }
    });
});