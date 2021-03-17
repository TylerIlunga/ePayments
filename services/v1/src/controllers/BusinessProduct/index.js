/**
 * BusinessProduct Controller module.
 * @module src/controllers/BusinessProduct/index.js
 */
const generalConfig = require('../../config');
const { getSqlizeModule, BusinessProduct, User } = require('../../dal/config');
const { Errors, Strings, Validation } = require('../../utils');
const {
  createBusinessProductSchema,
  listBusinessProductsSchema,
  fetchBusinessProductSchema,
  updateBusinessProductSchema,
  deleteBusinessProductSchema,
} = require('../Middleware/BusinessProduct/validation');
const Op = getSqlizeModule().Op;

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
  async listBusinessProducts(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      listBusinessProductsSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const { userID, queryAttributes } = validationResult.value;
      // Verify User
      const businessUser = await User.findOne({ where: { id: userID } });
      if (businessUser === null) {
        throw { error: 'Account not found for the given user ID.' };
      }
      // List Products
      // NOTE: String attributes should contain the proper query (ex: "%GUM" or "GUM%")
      const whereAttributes = {};
      Object.keys(queryAttributes).forEach((attribute) => {
        let whereAttribute = {};
        console.log('typeof attribute', typeof attribute);
        if (typeof attribute === 'string') {
          whereAttribute[Op.like] = queryAttributes[attribute];
        }
        if (typeof attribute === 'number') {
          whereAttribute[Op.contains] = queryAttributes[attribute];
        }
        whereAttributes[Strings.camelToSnake(attribute)] = whereAttribute;
      });
      const products = await BusinessProduct.findAll({
        where: whereAttributes,
      });
      return res.json({ error: null, success: true, products });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  async fetchBusinessProduct(req, res) {},
  async updateBusinessProduct(req, res) {},
  async deleteBusinessProduct(req, res) {},
};
