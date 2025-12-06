const buildQuery = (filters) => {
  const query = {};

  // Search: Customer Name or Phone Number (case-insensitive)
  if (filters.search) {
    query.$or = [
      { customerName: { $regex: filters.search, $options: 'i' } },
      { phoneNumber: { $regex: filters.search, $options: 'i' } }
    ];
  }

  // Customer Region filter
  if (filters.regions && filters.regions.length > 0) {
    query.customerRegion = { $in: filters.regions };
  }

  // Gender filter
  if (filters.genders && filters.genders.length > 0) {
    query.gender = { $in: filters.genders };
  }

  // Age Range filter
  if (filters.ageMin !== null || filters.ageMax !== null) {
    query.age = {};
    if (filters.ageMin !== null) {
      query.age.$gte = filters.ageMin;
    }
    if (filters.ageMax !== null) {
      query.age.$lte = filters.ageMax;
    }
  }

  // Product Category filter
  if (filters.categories && filters.categories.length > 0) {
    query.productCategory = { $in: filters.categories };
  }

  // Tags filter (array contains any of the selected tags)
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Payment Method filter
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    query.paymentMethod = { $in: filters.paymentMethods };
  }

  // Date Range filter
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) {
      query.date.$gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      // Set to end of day
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      query.date.$lte = endDate;
    }
  }

  return query;
};

const buildSort = (sortBy, sortOrder) => {
  const sort = {};
  
  switch (sortBy) {
    case 'date':
      sort.date = sortOrder;
      break;
    case 'quantity':
      sort.quantity = sortOrder;
      break;
    case 'customerName':
      sort.customerName = sortOrder;
      break;
    default:
      sort.date = -1; // Default: newest first
  }

  return sort;
};

module.exports = {
  buildQuery,
  buildSort
};

