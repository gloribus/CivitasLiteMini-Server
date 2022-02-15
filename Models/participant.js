module.exports = function (sequelize, Sequelize) {
	const Participant = sequelize.define('participant', {
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			allowNull: false,
			unique: true,
			defaultValue: Sequelize.UUIDV1,
		},
		teamID: {
			type: Sequelize.UUID,
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
		birthday: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		socialLink: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		regionID: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		teamName: {
			type: Sequelize.STRING(255),
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
		isDeleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
	});

	return Participant;
};
