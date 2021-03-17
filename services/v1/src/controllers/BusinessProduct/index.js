/**
 * BusinessProduct Controller module.
 * @module src/controllers/BusinessProduct/index.js
 */
const generalConfig = require('../../config');
const { BusinessProduct, User } = require('../../dal/config');
const { Errors, Validation } = require('../../utils');
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
  async createBusinessProduct(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      createBusinessProductSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        userID,
        sku,
        label,
        description,
        price,
        inventoryCount,
      } = validationResult.value;
      // Verify User
      const businessUser = await User.findOne({ where: { id: userID } });
      if (businessUser === null) {
        throw { error: 'Account not found for the given user ID.' };
      }
      // Verify unique sku (generated)
      const persistedSku = await BusinessProduct.findOne({ where: { sku } });
      if (persistedSku !== null) {
        throw { error: 'Product already exists.' };
      }
      // Create new Product
      const newBusinessProduct = await BusinessProduct.create({
        sku,
        label,
        description,
        price,
        user_id: userID,
        inventory_count: inventoryCount,
      });
      console.log('new business product created! ID: ', newBusinessProduct.id);
      return res.json({ error: null, success: true });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  async listBusinessProducts(req, res) {},
  async fetchBusinessProduct(req, res) {},
  async updateBusinessProduct(req, res) {},
  async deleteBusinessProduct(req, res) {},
};
