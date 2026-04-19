'use strict';

exports.sequelize = {
  dialect: 'sqlite',
  storage: './database/parking.db',
  logging: false,
};

exports.cors = {
  origin: '*',
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
};

exports.security = {
  csrf: {
    enable: false,
  },
};
