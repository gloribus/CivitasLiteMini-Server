module.exports = function(sequelize, Sequelize) {
  const Token = sequelize.define('token', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      //FK для модели User
      userID: {
        type: Sequelize.UUID,
      },
      refreshToken: {
        type: Sequelize.STRING, 
        required: true
      },
  });

  return Token;
}
