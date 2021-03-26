/**
 * BusinessProduct Controller module.
 * @module src/controllers/BusinessProduct/index.js
 */
module.exports = {
  async createBusinessTransaction(req, res) {
    res.send('create');
  },
  async listBusinessTransactions(req, res) {
    // TODO: Handle Pagination (just add pageNumber(offset), pageSize(limit) with bounds)
    res.send('list');
  },
  async fetchBusinessTransaction(req, res) {
    res.send('fetch');
  },
  async updateBusinessTransaction(req, res) {
    // Possible only an internal call via SQL (sensitive data)
    res.send('update');
  },
  async deleteBusinessTransaction(req, res) {
    // Possible only an internal call via SQL (sensitive data)
    res.send('delete');
  },
};
