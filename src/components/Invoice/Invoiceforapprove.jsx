import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import numberToWords from "number-to-words";
import logo from "../Images/logo.png";

// Stylesheet
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoImage: {
    width: 260,
    height: 60,
    resizeMode: "contain",
  },
  contactInfo: {
    fontSize: 10,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subSection: {
    marginBottom: 20,
    fontSize: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "14.28%",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "#d3d3d3",
  },
  tableCol: {
    width: "14.28%",
    borderStyle: "solid",
    borderWidth: 1,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #000",
  },
});

const InvoiceForApprove = ({ data }) => {
  const bill = data?.currentBill || {};
  const customer = bill.customer || {};
  const products = bill.products || [];
  const totalAmount = bill.TotalAmount || 0;
  const priceAfterDiscount = bill.priceAfterDiscount || 0;
  const discountAmount = totalAmount - priceAfterDiscount;
  const taxRate = 0.06; // 6%
  const cgstAmount = priceAfterDiscount * taxRate;
  const sgstAmount = cgstAmount;
  const totalTaxAmount = cgstAmount + sgstAmount;

  const amountInWords =
    totalAmount > 0 ? numberToWords.toWords(totalAmount) : "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={logo} style={styles.logoImage} />
          <View style={styles.contactInfo}>
            <Text>Jhaver Enterprises</Text>
            <Text>Email: info@jhaverenterprises.com</Text>
            <Text>GSTIN: 36BDOPJ3833D1ZA</Text>
            <Text>AWF15 NSL Icon, Rd No. 12, Hyderabad - 500034</Text>
          </View>
        </View>

        {/* Billing Info */}
        <Text style={styles.sectionTitle}>Billing Invoice</Text>
        <View style={styles.subSection}>
          <Text>Bill To:</Text>
          <Text>Name: {customer.customerName || "N/A"}</Text>
          <Text>Phone: {customer.customerPhone || "N/A"}</Text>
          <Text>Email: {customer.customerEmail || "N/A"}</Text>
          <Text>Date: {new Date(bill.dateOfBill).toLocaleDateString()}</Text>
          <Text>Invoice No: {bill.invoiceNo}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Product Type</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Size</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Style Coat</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Unit</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Price</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>

          {/* Products */}
          {products.map((product, productIndex) =>
            product.variants.map((variant, variantIndex) =>
              variant.variantSizes.map((size, sizeIndex) => (
                <View
                  key={`${productIndex}-${variantIndex}-${sizeIndex}`}
                  style={styles.tableRow}
                >
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {product.productType || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{size.size || "N/A"}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {size.styleCoat || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {size.billedQuantity || 0}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>pcs</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{product.price || 0}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {(product.price * size.billedQuantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            )
          )}
        </View>

        {/* Totals */}
        <View style={styles.subSection}>
          <Text>Total Amount: ₹{totalAmount}</Text>
          <Text>
            Discount: {bill.discountPercentage || 0}% (₹
            {discountAmount.toFixed(2)})
          </Text>
          <Text>Price After Discount: ₹{priceAfterDiscount.toFixed(2)}</Text>
          <Text>
            Tax: ₹{totalTaxAmount.toFixed(2)} (6% CGST: ₹{cgstAmount.toFixed(2)}
            , 6% SGST: ₹{sgstAmount.toFixed(2)})
          </Text>
          <Text>Invoice Total: ₹{priceAfterDiscount.toFixed(2)}</Text>
          <Text>
            Total Amount in Words:{" "}
            {amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)}{" "}
            only
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Bank Details: Account Name: Jhaver Enterprises | Account No: 123456789
          | IFSC: ABCD0123456
        </Text>
      </Page>
    </Document>
  );
};

export default InvoiceForApprove;
