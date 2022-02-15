module.exports = function (sequelize, Sequelize) {
	const Statistics = sequelize.define('statistics', {
		regionID: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
		participantsQuantity: {
			type: Sequelize.INTEGER,
		},
		teamsQuantity: {
			type: Sequelize.INTEGER,
		},
		universitiesQuantity: {
			type: Sequelize.INTEGER,
		},
		ratingPlace: {
			type: Sequelize.INTEGER,
		},
	});

	return Statistics;
};
