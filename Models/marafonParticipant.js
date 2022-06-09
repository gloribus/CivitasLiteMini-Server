module.exports = function (sequelize, Sequelize) {
	const MarafonParticipant = sequelize.define('marafonParticipant', {
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
		surname: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		telephone: {
			type: Sequelize.STRING(16),
			allowNull: false,
		},
		vkID: {
			type: Sequelize.INTEGER,
			allowNull: false,
			unique: false,
		},
		regionID: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		locality: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		school: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		grade: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		ideaID: {
			type: Sequelize.UUID,
			allowNull: true,
		},
		eventID: {
			type: Sequelize.STRING(255),
			allowNull: true,
		},
		serviceNote: {
			type: Sequelize.STRING(255),
			allowNull: true,
			defaultValue: null,
		},
		isAllowedMsgVK: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
		isDeleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
	});

	return MarafonParticipant;
};
