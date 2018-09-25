module.exports = () => {
    process.env.APPLICATION_SERVER = process.env.CUSTOMCONNSTR_APP_SERVER;
    process.env.APPLICATION_SERVER_USER = process.env.CUSTOMCONNSTR_APP_SERVER_USER;
    process.env.APPLICATION_SERVER_PASS = process.env.CUSTOMCONNSTR_APP_SERVER_PASS;
    process.env.MY_DB_USER = process.env.MYSQLCONNSTR_USER;
    process.env.MY_DB_PASS = process.env.MYSQLCONNSTR_PASS;
    process.env.MY_DB = process.env.MYSQLCONNSTR_DB;
    process.env.MS_API_ENDPOINT = process.env.APPLICATIONSETTING_MS_API_ENDPOINT;
    process.env.MS_SUBSCRIPTION_KEY = process.env.APPLICATIONSETTING_MS_SUBSCRIPTION_KEY;
    process.env.ENVIRONMENT = process.env.APPLICATIONSETTING_ENV;
}