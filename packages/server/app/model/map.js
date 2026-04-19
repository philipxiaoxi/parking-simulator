'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const Map = app.model.define('maps', {
    id: {
      type: STRING(36),
      primaryKey: true,
    },
    name: {
      type: STRING(100),
      allowNull: false,
    },
    description: {
      type: TEXT,
      allowNull: true,
    },
    version: {
      type: INTEGER,
      defaultValue: 1,
    },
    data: {
      type: TEXT,
      allowNull: false,
      comment: '完整地图 JSON 数据',
    },
    createdAt: {
      type: DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DATE,
      field: 'updated_at',
    },
  }, {
    timestamps: true,
    underscored: true,
  });

  return Map;
};
