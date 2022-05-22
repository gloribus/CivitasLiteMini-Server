module.exports = function (sequelize, Sequelize) {
	const Event = sequelize.define('event', {
		// Регион (-) последотовательный символ алфавита или число (33-1 33-a | 33-b | 33-c)
		id: {
			type: Sequelize.STRING(255),
			required: true,
			primaryKey: true,
			allowNull: false,
		},
		userID: {
			type: Sequelize.UUID,
			required: true,
			allowNull: false,
		},
		regionID: {
			type: Sequelize.INTEGER,
			required: true,
			allowNull: false,
		},
		locality: {
			type: Sequelize.STRING(255),
			required: true,
			allowNull: false,
		},
		school: {
			type: Sequelize.STRING(255),
			required: true,
			allowNull: false,
		},
		ideasCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		participantsCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		isDeleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
	});
	return Event;
};
