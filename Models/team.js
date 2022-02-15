module.exports = function (sequelize, Sequelize) {
	const Team = sequelize.define('team', {
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			allowNull: false,
			unique: true,
			defaultValue: Sequelize.UUIDV1,
		},
		name: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		regionID: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		universityName: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		facultyName: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		score: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		membersQuantity: {
			type: Sequelize.INTEGER,
		},
		isDeleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
	});

	return Team;
};
