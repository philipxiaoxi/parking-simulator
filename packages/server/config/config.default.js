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

// 静态文件服务配置
exports.static = {
  prefix: '/',
  dir: 'app/public',
  // 使用 alias 让根路径返回 index.html
  alias: {
    '/': '/index.html',
  },
};
