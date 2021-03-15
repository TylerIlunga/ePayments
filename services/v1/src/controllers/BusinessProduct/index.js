/**
 * BusinessProduct Controller module.
 * @module src/controllers/BusinessProduct/index.js
 */
const generalConfig = require('../../config');
const { BusinessProduct } = require('../../dal/config');
const { Errors, Generators, Validation } = require('../../utils');
const {
  createBusinessProductSchema,
} = require('../Middleware/BusinessProduct/validation');

module.exports = {
  /**
   * Creates a new Business Product for sale.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async createBusinessProduct(req, res) {},
  async listBusinessProducts(req, res) {},
  async fetchBusinessProduct(req, res) {},
  async updateBusinessProduct(req, res) {},
  async deleteBusinessProduct(req, res) {},
};
