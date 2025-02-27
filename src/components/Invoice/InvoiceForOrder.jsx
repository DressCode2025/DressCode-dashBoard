import React from "react";
import numberToWords from "number-to-words";
import logo from "../Images/logo.png"; // path to your logo image

const InvoiceForOrder = ({ data }) => {
  const orderDetails = data;
  const user = orderDetails.userDetails || {};
  const products = orderDetails.products || [];

  // Calculate totals
  const totalAmount = products.reduce(
    (sum, product) => sum + product.quantityOrdered * product.price,
    0
  );

  const slabDiscountAmount = orderDetails.totalSlabDiscountAmount || 0;
  const couponDiscountAmount = orderDetails.couponDiscountAmount || 0;
  const TotalDiscountAmount = orderDetails.TotalDiscountAmount || 0;
  const TotalPriceAfterDiscount = orderDetails.TotalPriceAfterDiscount || 0;

  const amountInWords =
    TotalPriceAfterDiscount > 0
      ? numberToWords.toWords(TotalPriceAfterDiscount)
      : "N/A";

  return (
    <div style={{ padding: "40px", width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "300px",
            height: "80px",
            objectFit: "contain",
            maxWidth: "100%",
          }}
        />
        <div style={{ textAlign: "right", fontSize: "20px" }}>
          <p style={{ margin: 0 }}>Jhaver Enterprises</p>
          <p style={{ margin: 0 }}>Email: info@jhaverenterprises.com</p>
          <p style={{ margin: 0 }}>GSTIN: 36BDOPJ3833D1ZA</p>
          <p style={{ margin: 0 }}>
            AWF15 NSL Icon, Rd No. 12, Hyderabad - 500034
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div>
        <p
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            textTransform: "uppercase",
          }}
        >
          Order Invoice
        </p>
        <div style={{ marginBottom: "30px", fontSize: "20px" }}>
          <p>Order ID: {orderDetails.orderId || "N/A"}</p>
          <p>Date: {new Date(orderDetails.dateOfOrder).toLocaleDateString()}</p>
          <p>Customer Name: {user.name || "N/A"}</p>
          <p>Customer Email: {user.email || "N/A"}</p>
          <p>Phone: {user.phoneNumber || "N/A"}</p>
        </div>
      </div>

      {/* Products Table */}
      <div
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "40px",
        }}
      >
        {/* Table Header */}
        <div style={{ display: "flex", backgroundColor: "#f2f2f2" }}>
          {[
            "Product",
            "School Name",
            "Color",
            "Size",
            "Quantity",
            "Slab Discount ",
            "Slab Discount %",
            "Unit Price",
            "Total(Total - Slab Discout)",
          ].map((header, index) => (
            <div
              key={index}
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "20px",
                backgroundColor: "#d3d3d3",
              }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Products Rows */}
        {products.map((product, index) => (
          <div key={index} style={{ display: "flex" }}>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {product.productDetails.productType || "N/A"}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {product.productDetails?.schoolName || "N/A"}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {product.color?.name || "N/A"}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {product.size || "N/A"}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {product.quantityOrdered || 0}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              ₹{product.slabDiscountAmount || 0}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {product.slabDiscountPercentage || 0} %
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              ₹{product.price || 0}
            </div>
            <div
              style={{
                width: "16.66%",
                border: "1px solid #d3d3d3",
                padding: "16px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              ₹
              {(
                product.quantityOrdered * product.price -
                product.slabDiscountAmount
              ).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div
        style={{
          fontSize: "22px",
          marginBottom: "40px",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          <p>Total Price: ₹{totalAmount.toFixed(2)}</p>
          <p>
            Total Slab Discount : -₹
            {slabDiscountAmount.toFixed(2)}
          </p>
          <p>
            Price After Slab Discount: ₹
            {(totalAmount - slabDiscountAmount).toFixed(2)}
          </p>
          <p>
            Coupon Discount ({orderDetails.couponDiscountPercentage}% - Code:{" "}
            {orderDetails.couponCode}): -₹{couponDiscountAmount.toFixed(2)}
          </p>
          <p>Total Discount Amount: ₹{TotalDiscountAmount.toFixed(2)}</p>
          <p>
            Total Price After Discount: ₹{TotalPriceAfterDiscount.toFixed(2)}
          </p>
        </div>

        <p style={{ fontWeight: "bold" }}>
          Grand Total: ₹{TotalPriceAfterDiscount.toFixed(2)}
        </p>
        <p style={{ fontWeight: "bold" }}>
          Total in Words:{" "}
          {amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} only
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: "14px",
          textAlign: "center",
          marginTop: "40px",
          paddingTop: "10px",
          borderTop: "1px solid #000",
        }}
      >
        <p>
          Bank Details: Account Name: Jhaver Enterprises | Account No: 123456789
          | IFSC: ABCD0123456
        </p>
      </div>
    </div>
  );
};

export default InvoiceForOrder;
