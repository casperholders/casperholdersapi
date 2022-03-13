'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class deploys extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  deploys.init({
    hash: {
      type: DataTypes.STRING, allowNull: false, primaryKey: true
    },
    deploy: DataTypes.JSONB
  }, {
    sequelize,
    tableName: 'deploys',
    modelName: 'Deploy',
    timestamps: false,
  });
  return deploys;
};