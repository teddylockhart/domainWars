module.exports = function(sequelize, DataTypes) {
    var Card = sequelize.define("cards", {
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
      }
    });
    return Card;
};