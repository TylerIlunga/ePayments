/**
 * Controller module for BusinessProduct endpoints.
 * @module src/controllers/BusinessProduct/index.js
 */
const {
  getSqlizeModule,
  getConnection,
  BusinessProduct,
  BusinessTransaction,
  User,
} = require('../../dal/config');

const { Errors, Strings, Validation } = require('../../utils');
const {
  createBusinessProductSchema,
  listBusinessProductsSchema,
  fetchBusinessProductSchema,
  updateBusinessProductSchema,
  deleteBusinessProductSchema,
  importBusinessProductsSchema,
} = require('../../middleware/BusinessProduct/validation');
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
        businessID,
        sku,
        label,
        description,
        price,
        category,
        inventoryCount,
      } = validationResult.value;
      // Verify User
      const businessUser = await User.findOne({ where: { id: businessID } });
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
        category,
        user_id: businessID,
        inventory_count: inventoryCount,
      });
      console.log('new business product created! ID: ', newBusinessProduct.id);
      return res.json({ error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Imports/Persists a list of business products
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {Array} list of JSON objects
   */
  async importBusinessProducts(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      importBusinessProductsSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    let transaction;
    try {
      const { businessID, products } = validationResult.value;
      // Verify User
      const businessUser = await User.findOne({ where: { id: businessID } });
      if (businessUser === null) {
        throw { error: 'Account not found for the given user ID.' };
      }

      transaction = await getConnection().transaction();

      const createBusinessProductPromises = [];
      products.forEach((product) => {
        createBusinessProductPromises.push(
          new Promise(async (resolve, reject) => {
            try {
              // Verify unique sku (generated)
              const persistedSku = await BusinessProduct.findOne({
                where: { sku: product.sku },
              });
              if (persistedSku !== null) {
                throw {
                  error: `Product with the sku ${product.sku} already exists.`,
                };
              }

              // Create new Product
              await BusinessProduct.create(
                { ...product, user_id: businessID },
                { transaction },
              );

              resolve(null);
            } catch (error) {
              reject(error);
            }
          }),
        );
      });

      await Promise.all(createBusinessProductPromises);

      await transaction.commit();

      console.log('import completed successfully!');

      return res.json({ error: null, success: true });
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }

      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Lists Business Products based on the given query attributes.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {Array} list of JSON objects
   */
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
      const { businessID, queryAttributes } = validationResult.value;
      // Verify User
      const businessUser = await User.findOne({ where: { id: businessID } });
      if (businessUser === null) {
        throw { error: 'Account not found for the given user ID.' };
      }
      // List Products
      // NOTE: String attributes should contain the proper query syntax (ex: "%GUM" or "GUM%")
      const sqlAttributes = {
        where: { user_id: businessID },
        order: [['created_at', 'ASC']],
      };

      // Given a range of dates?
      if (validationResult.value.betweenDates !== undefined) {
        const { betweenDates } = validationResult.value;
        sqlAttributes.where.created_at = {
          [Op.between]: [betweenDates.start, betweenDates.end],
        };
      }

      const attributes = Object.keys(queryAttributes);
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        if (attribute === 'offset' || attribute === 'limit') {
          sqlAttributes[attribute] = queryAttributes[attribute];
          continue;
        }
        if (attribute === 'order') {
          sqlAttributes.order[0][1] = queryAttributes[attribute];
          continue;
        }
        if (typeof attribute === 'string') {
          let whereAttribute = {};
          whereAttribute[Op.like] = queryAttributes[attribute];
          sqlAttributes.where[Strings.camelToSnake(attribute)] = whereAttribute;
        }
        if (typeof attribute === 'number') {
          let whereAttribute = {};
          whereAttribute[Op.contains] = queryAttributes[attribute];
          sqlAttributes.where[Strings.camelToSnake(attribute)] = whereAttribute;
        }
      }

      const products = await BusinessProduct.findAll(sqlAttributes);

      return res.json({ error: null, success: true, products });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Fetches a Business Product for given ids and sku.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async fetchBusinessProduct(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      fetchBusinessProductSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        businessID,
        businessProductID,
        sku,
        withTransactions,
      } = validationResult.value;
      // Verify User
      const businessUser = await User.findOne({ where: { id: businessID } });
      if (businessUser === null) {
        throw { error: 'Account not found for the given user ID.' };
      }
      // Fetch Business Proudct
      const businessProduct = await BusinessProduct.findOne({
        where: { sku, id: businessProductID, user_id: businessID },
      });
      if (businessProduct === null) {
        throw { error: 'Product does not exist for the given information.' };
      }

      let transactions = [];

      if (withTransactions) {
        // If required fetch five recent transactions for that product
        transactions = await BusinessTransaction.findAll({
          where: { product_id: businessProductID },
          limit: 5,
          order: [['created_at', 'DESC']],
        });
      }

      // Respond
      return res.json({
        error: null,
        success: true,
        product: businessProduct,
        transactions,
      });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Updates a Business Product for the given attributes.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async updateBusinessProduct(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      updateBusinessProductSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        businessID,
        businessProductID,
        sku,
        updates,
      } = validationResult.value;
      // Locate Business Product
      const businessProduct = await BusinessProduct.findOne({
        where: { sku, id: businessProductID, user_id: businessID },
      });
      if (businessProduct === null) {
        throw { error: 'Product does not exist for the given information.' };
      }
      // Iterate through updated product features and apply to existing product
      Object.keys(updates).forEach((productFeature) => {
        if (
          updates[productFeature] !== null &&
          updates[productFeature] !== undefined
        ) {
          businessProduct[Strings.camelToSnake(productFeature)] =
            updates[productFeature];
        }
      });
      // Persist updated Business Product
      await businessProduct.save();
      return res.json({ error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Deletes a Business Product.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async deleteBusinessProduct(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      deleteBusinessProductSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const { businessID, businessProductID, sku } = validationResult.value;
      // Delete Business Product
      await BusinessProduct.destroy({
        where: { sku, id: businessProductID, user_id: businessID },
      });
      return res.json({ error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
};
