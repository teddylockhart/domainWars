module.exports = function(sequelize, DataTypes) {
    var Gamestate = sequelize.define("Gamestates", {
      owner: {
        type: DataTypes.STRING,
        allowNull: false
      },
      gameInProgress: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      player: {
        type: DataTypes.TEXT
      },
      computer: {
        type: DataTypes.TEXT
      }
    });
    return Gamestate;
};