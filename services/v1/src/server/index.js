//** Spins up the server */
const spinUpServer = () => {
  require('dotenv').config();
  const app = require('../../app.js');
  const config = require('../config');
  const dbConfig = require('../dal/config');
  dbConfig
    .getConnection()
    .sync()
    .then(async () => {
      console.log('Successful database connection.');
      app.listen(config.PORT, (error) => {
        if (error) {
          return console.error(`Server.listen error:`, error);
        }
        console.log(
          `${config.SERVICE_NAME} service listening on port ${config.PORT}`,
        );
      });
    })
    .catch((error) => {
      console.error('Unsuccessful database connection: ', error);
    });
};

spinUpServer();
