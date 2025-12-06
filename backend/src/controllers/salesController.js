const salesService = require('../services/salesService');

const getSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      regions,
      genders,
      ageMin,
      ageMax,
      categories,
      tags,
      paymentMethods,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      search,
      regions: regions ? regions.split(',') : [],
      genders: genders ? genders.split(',') : [],
      ageMin: ageMin ? parseInt(ageMin) : null,
      ageMax: ageMax ? parseInt(ageMax) : null,
      categories: categories ? categories.split(',') : [],
      tags: tags ? tags.split(',') : [],
      paymentMethods: paymentMethods ? paymentMethods.split(',') : [],
      dateFrom: dateFrom ? new Date(dateFrom) : null,
      dateTo: dateTo ? new Date(dateTo) : null,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1
    };

    const result = await salesService.getSales(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const options = await salesService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
};

module.exports = {
  getSales,
  getFilterOptions
};

