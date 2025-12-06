import '../styles/SalesTable.css';

const SalesTable = ({ sales }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="sales-table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Region</th>
            <th>Product</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price/Unit</th>
            <th>Discount</th>
            <th>Final Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr key={sale._id || index}>
              <td>{formatDate(sale.date)}</td>
              <td>{sale.customerName}</td>
              <td>{sale.phoneNumber}</td>
              <td>{sale.customerRegion}</td>
              <td>{sale.productName}</td>
              <td>{sale.productCategory}</td>
              <td>{sale.quantity}</td>
              <td>{formatCurrency(sale.pricePerUnit)}</td>
              <td>{sale.discountPercentage}%</td>
              <td className="amount">{formatCurrency(sale.finalAmount)}</td>
              <td>{sale.paymentMethod}</td>
              <td>
                <span className={`status status-${sale.orderStatus.toLowerCase()}`}>
                  {sale.orderStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;

