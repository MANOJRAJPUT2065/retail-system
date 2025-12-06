const Sale = require('../models/Sale');
const { buildQuery, buildSort } = require('../utils/queryBuilder');

const getSales = async (page, limit, filters) => {
  try {
    const query = buildQuery(filters);
    const sort = buildSort(filters.sortBy, filters.sortOrder);

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Sale.countDocuments(query)
    ]);

    return {
      sales,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw new Error(`Error fetching sales: ${error.message}`);
  }
};

const getFilterOptions = async () => {
  try {
    const [
      regions,
      genders,
      categories,
      tags,
      paymentMethods,
      ageRange
    ] = await Promise.all([
      Sale.distinct('customerRegion'),
      Sale.distinct('gender'),
      Sale.distinct('productCategory'),
      Sale.distinct('tags'),
      Sale.distinct('paymentMethod'),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' }
          }
        }
      ])
    ]);

    // Flatten tags array
    const uniqueTags = [...new Set(tags.flat())];

    return {
      regions: regions.sort(),
      genders: genders.sort(),
      categories: categories.sort(),
      tags: uniqueTags.sort(),
      paymentMethods: paymentMethods.sort(),
      ageRange: ageRange[0] || { minAge: 0, maxAge: 100 }
    };
  } catch (error) {
    throw new Error(`Error fetching filter options: ${error.message}`);
  }
};

module.exports = {
  getSales,
  getFilterOptions
};

