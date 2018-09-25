module.exports = () => {
    process.env.APP_SERVER = process.env.CUSTOMCONNSTR_APP_SERVER;
    process.env.APP_SERVER_USER = process.env.CUSTOMCONNSTR_APP_SERVER_USER;
    process.env.APP_SERVER_PASS = process.env.CUSTOMCONNSTR_APP_SERVER_PASS;
    process.env.DB_USER = process.env.MYSQLCONNSTR_USER;
    process.env.DB_PASS = process.env.MYSQLCONNSTR_PASS;
    process.env.DB = process.env.MYSQLCONNSTR_DB;
    process.env.MS_API_ENDPOINT = process.env.APPSETTING_MS_API_ENDPOINT;
    process.env.MS_SUBSCRIPTION_KEY = process.env.APPSETTING_MS_SUBSCRIPTION_KEY;
    process.env.ENVIRONMENT = process.env.APPSETTING_ENV;
}