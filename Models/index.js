'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'Config/', env, 'DB.json'));
const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	config
);
const db = {};

fs.readdirSync(__dirname)
	.filter(function (file) {
		return file.indexOf('.') !== 0 && file !== 'index.js';
	})
	.forEach(function (file) {
		const model = require(path.join(__dirname, file))(
			sequelize,
			Sequelize.DataTypes
		);
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db);
	}
});

/* db.marafonIdea.hasOne(db.event, { foreignKey: 'id' });
db.event.belongsTo(db.marafonIdea, { foreignKey: 'eventID' });
 */

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//Associations
//Token
//db.token.hasOne(db.user);

//Users
//db.user.belongsTo(db.token);

module.exports = db;
