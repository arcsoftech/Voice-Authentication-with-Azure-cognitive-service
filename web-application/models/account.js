module.exports = function (sequelize, Sequelize) {
    const schema = {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        firstname: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        lastname: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        username: {
            type: Sequelize.TEXT
        },

        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        profileId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        voiceEnrolledCount: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        voicePhrase: {
            type: Sequelize.STRING,
            allowNull: true
        },
        last_login: {
            type: Sequelize.DATE
        },

        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }


    }
    let Account = sequelize.define('Account', schema, {
        timestamps: true
    });

    return Account;
}