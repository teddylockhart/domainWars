// Table that holds all the users emails, usernames, wins and losses
module.exports = function(sequelize, DataTypes) {
    var Users = sequelize.define("Users", {
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      wins: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      losses: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      record: {
        type: DataTypes.INTEGER
      }
    });
    return Users;
};