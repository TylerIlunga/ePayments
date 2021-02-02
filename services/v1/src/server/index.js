//** Spins up the server */
const spinUpServer = () => {
  require('dotenv').config();
  const app = require('../../app.js');
  const config = require('../config');
  app.listen(config.PORT, (error) => {
    if (error) {
      return console.error(`Server.listen error:`, error);
    }
    console.log(
      `${config.SERVICE_NAME} service listening on port ${config.PORT}`,
    );
  });
};

spinUpServer();
