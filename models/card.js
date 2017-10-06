// Table that holds all the cards in the card deck
module.exports = function(sequelize, DataTypes) {
    var Cards = sequelize.define("Cards", {
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
      name: {
        type: DataTypes.STRING
      }

    },{timestamps: false});
    return Cards;
};