module.exports = function tokenDto (model) {
  return { login: model.login, userID: model.userID };
}