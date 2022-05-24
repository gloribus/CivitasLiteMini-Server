module.exports = function (sequelize, Sequelize) {
	const RegionStatistics = sequelize.define('regionStatistics', {
		regionID: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
		title: {
			type: Sequelize.STRING(255),
		},
		participantsCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		ideasCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		eventsCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		activeCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		without_accessCNT: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
	});

	return RegionStatistics;
};
