"use strict";
const { Sequelize } = require("sequelize");
const name = "20220312221304-create-deploys.js";


async function up({ context: queryInterface }) {
  await queryInterface.createTable("deploys", {
    hash: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    deploy: Sequelize.JSONB,
    deployResult: Sequelize.JSONB,
  });
}


async function down({ context: queryInterface }) {
  await queryInterface.dropTable("deploys");
}

module.exports = { name, up, down };