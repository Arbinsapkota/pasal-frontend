import React, { useState } from "react";

interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  paymentMethod: "Credit Card" | "PayPal" | "Bank Transfer";
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  paymentDate: string;
}

const initialPayments: Payment[] = [
  {
    id: "PAY001",
    orderId: "ORD001",
    customerName: "Alice Johnson",
    amount: 99.99,
    paymentMethod: "Credit Card",
    status: "Completed",
    paymentDate: "2024-10-01",
  },
  {
    id: "PAY002",
    orderId: "ORD002",
    customerName: "Bob Smith",
    amount: 49.99,
    paymentMethod: "PayPal",
    status: "Pending",
    paymentDate: "2024-10-05",
  },
  {
    id: "PAY003",
    orderId: "ORD003",
    customerName: "Charlie Brown",
    amount: 19.99,
    paymentMethod: "Bank Transfer",
    status: "Failed",
    paymentDate: "2024-10-07",
  },
  {
    id: "PAY004",
    orderId: "ORD004",
    customerName: "Dana White",
    amount: 29.99,
    paymentMethod: "Credit Card",
    status: "Refunded",
    paymentDate: "2024-10-10",
  },
];

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleStatusChange = (
    paymentId: string,
    newStatus: Payment["status"]
  ) => {
    const updatedPayments = payments.map((payment) =>
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    );
    setPayments(updatedPayments);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Payment Management</h1>

      {/* Payment Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Payment ID
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Order ID
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Customer
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Amount
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Payment Method
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t">
                <td className="py-3 px-4 text-gray-700">{payment.id}</td>
                <td className="py-3 px-4 text-gray-700">{payment.orderId}</td>
                <td className="py-3 px-4 text-gray-700">
                  {payment.customerName}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {payment.paymentMethod}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.status === "Failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-4 flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(payment)}
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md"
                  >
                    View
                  </button>
                  <select
                    value={payment.status}
                    onChange={(e) =>
                      handleStatusChange(
                        payment.id,
                        e.target.value as Payment["status"]
                      )
                    }
                    className="p-1 border rounded-md"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
            <p>
              <strong>Payment ID:</strong> {selectedPayment.id}
            </p>
            <p>
              <strong>Order ID:</strong> {selectedPayment.orderId}
            </p>
            <p>
              <strong>Customer Name:</strong> {selectedPayment.customerName}
            </p>
            <p>
              <strong>Amount:</strong> ${selectedPayment.amount.toFixed(2)}
            </p>
            <p>
              <strong>Payment Method:</strong> {selectedPayment.paymentMethod}
            </p>
            <p>
              <strong>Status:</strong> {selectedPayment.status}
            </p>
            <p>
              <strong>Payment Date:</strong> {selectedPayment.paymentDate}
            </p>
            <button
              onClick={() => setSelectedPayment(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
