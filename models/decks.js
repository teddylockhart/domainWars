// Table that holds all the cards in every users decklist
module.exports = function(sequelize, DataTypes) {
    var Decks = sequelize.define("Decks", {
      color: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        len: [1, 13]
      },
      image: {
        type: DataTypes.STRING
      },
      owner: {
          type: DataTypes.STRING
      },
      cardNumber: {
          type: DataTypes.INTEGER
      },
      name: {
          type: DataTypes.STRING
      }
    });
    return Decks;
};