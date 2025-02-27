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
// Create styles similar to the image
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
  logo: {
    fontSize: 24,
    color: "#FF4500",
    fontWeight: "bold",
  },
  logoImage: {
    width: 260, // Adjust the width according to your logo size
    height: 60, // Adjust the height according to your logo size
    resizeMode: "contain", // Keep the aspect ratio of the image
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
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
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "#d3d3d3",
  },
  tableCol: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  paymentDetails: {
    fontSize: 10,
    marginBottom: 10,
  },
  hsnRow: {
    flexDirection: "row",
    marginBottom: 10,
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

const Invoice = ({ data }) => {
  // Ensure data is defined to prevent errors
  const customerDetails = data?.customerDetails || {};
  const billedProducts = data?.billedProducts || [];
  const priceAfterDiscount = data?.priceAfterDiscount; // Assuming this is your discounted price
  const taxRate = 0.06; // 6%

  const cgstAmount = priceAfterDiscount * taxRate; // Calculate CGST
  const sgstAmount = cgstAmount; // SGST is the same as CGST
  const totalTaxAmount = cgstAmount + sgstAmount; // Total tax
  const totalAmount = data?.totalAmount || 0;
  // Convert totalAmount to words
  const amountInWords =
    totalAmount > 0 ? numberToWords.toWords(totalAmount) : "N/A";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={logo} // Using the imported PNG file
            style={styles.logoImage} // Define the size and styling for the logo
          />
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
          <View>
            <Text>Bill To:</Text>
            <Text>Name: {customerDetails?.customerName || "N/A"}</Text>
            <Text>Location: {customerDetails?.customerPhone || "N/A"}</Text>
          </View>
          <View>
            <Text>
              Date: {new Date(data?.dateOfBill).toLocaleDateString() || "N/A"}
            </Text>
            <Text>Invoice No: {data?.invoiceNo || "N/A"}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.subSection}>
          <Text>Contact: {customerDetails?.customerPhone || "N/A"}</Text>
          <Text>Email: {customerDetails?.customerEmail || "N/A"}</Text>
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
              <Text style={styles.tableCell}>Price (Incl. 12% GST)</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Total Price</Text>
            </View>
          </View>

          {/* Billed Products with GST Calculation */}
          {billedProducts?.map((product, productIndex) =>
            product.variants.map((variant, variantIndex) =>
              variant.variantSizes.map((size, sizeIndex) => {
                return (
                  <View
                    key={`${productIndex}-${variantIndex}-${sizeIndex}`}
                    style={styles.tableRow}
                  >
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>
                        {product?.productType || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>
                        {size?.size || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>
                        {size?.styleCoat || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>
                        {size?.billedQuantity || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>pcs</Text>
                    </View>
                    <View style={styles.tableCol}>
                      {/* Show price excluding GST */}
                      <Text style={styles.tableCell}>
                        {product?.price || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      {/* Show total price including GST */}
                      <Text style={styles.tableCell}>
                        {(product?.price * size?.billedQuantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )
          )}
        </View>

        {/* Invoice Totals */}
        <View style={styles.subSection}>
          <Text>Total Amount: {totalAmount || "N/A"}</Text>
          <Text>
            Total Amount in Words:{" "}
            {amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)}{" "}
            only
          </Text>
        </View>

        <View style={styles.subSection}>
          <Text>Payment Mode: {data?.modeOfPayment || "N/A"}</Text>
          <Text>
            Discount: {data?.discountPercentage || "N/A"}% &nbsp;(
            {(totalAmount - data?.priceAfterDiscount)?.toFixed(2)})
          </Text>

          <Text>Price After Discount: {data?.priceAfterDiscount || "N/A"}</Text>
          <Text>Invoice Total: {data?.priceAfterDiscount || "N/A"}</Text>
        </View>

        {/* HSN/SAC */}
        <View style={styles.hsnRow}>
          <Text>HSN/SAC: 90184900</Text>
          <Text style={{ marginLeft: "auto" }}>
            <Text>
              Total Tax Amount: {totalTaxAmount.toFixed(2)} (6% CGST{" "}
              {cgstAmount.toFixed(2)}, 6% SGST {sgstAmount.toFixed(2)})
            </Text>
          </Text>
          {/* <Text>Total Amount : {totalAmount}</Text> */}
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

export default Invoice;
