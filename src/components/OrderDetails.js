import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import api from './api'; // Adjust path if necessary
import './Loader.css'; // Ensure this CSS file exists and contains the loader styles
import { toast } from "react-toastify";
import BackButton from './BackButton';
import { jsPDF } from "jspdf"; // jsPDF for PDF generation
import html2canvas from "html2canvas"; // html2canvas for rendering HTML to image


import InvoiceForOrder from './Invoice/InvoiceForOrder';

const OrderDetails = ({ userName }) => {
  const { orderId } = useParams(); // Extract orderId from URL params
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingOrder, setIsTrackingOrder] = useState(false); // New state for tracking button

  const [predefinedDimensions, setPredefinedDimensions] = useState([]);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [customDimensions, setCustomDimensions] = useState({ length: '', breadth: '', height: '', weight: '' });
  const [showModal, setShowModal] = useState(false);
  const [usePredefined, setUsePredefined] = useState(true);
  const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

  // const location = useLocation();
  const navigate = useNavigate();
  // const { status } = location.state || { status: "Pending" };
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/dashboard/getOrderDetails/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrderDetails(response.data.orderDetails);

      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  useEffect(() => {
    const fetchPredefinedDimensions = async () => {
      try {
        const response = await api.get('/dashboard/predefined/boxes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPredefinedDimensions(response.data);
        console.log('Predefined Dimensions:', response.data);
      } catch (error) {
        console.error('Error fetching predefined dimensions:', error);
      }
    };

    fetchPredefinedDimensions();
  }, [token]);

  const handleAssignToShiprocket = () => {
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    setIsLoading(true);
    try {
      const data = usePredefined
        ? {
          boxLength: selectedDimension.boxLength,
          boxBreadth: selectedDimension.boxBreadth,
          boxHeight: selectedDimension.boxHeight,
          boxWeight: Number(customDimensions.weight)
        }
        : {
          boxLength: customDimensions.length,
          boxBreadth: customDimensions.breadth,
          boxHeight: customDimensions.height,
          boxWeight: customDimensions.weight,
        };

      // Validate data before sending it
      if (data.boxLength <= 0 || data.boxBreadth <= 0 || data.boxHeight <= 0 || data.boxWeight <= 0) {
        throw new Error('Dimensions and weight must be positive numbers.');
      }

      // Assign to Shiprocket
      const response = await api.post(`/dashboard/assignToShipRocket/${orderId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Shiprocket assignment successful:', response.data);

      // Generate Manifest
      await generateManifest(response.data.shiprocketOrderResponse.shipment_id, response.data.shiprocketOrderResponse.order_id); // Adjust this if shipment_id is in a different location in the response
    } catch (error) {
      console.error('Error assigning to Shiprocket:', error);
      alert(`Failed to assign order to Shiprocket. ${error.message || ''}`);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const generateManifest = async (shipmentId, shipment_orderId) => {
    setIsLoading(true); // Show the loading spinner
    try {
      const payload = {
        shipment_id: [shipmentId], // Shipment ID passed as an array
      };
      // const Shiptoken = process.env.REACT_APP_SHIPROCKET_TOKEN;
      const response = await api.post('/dashboard/manifests/generate', payload);

      console.log('Manifest generation successful:', response.data);

      if (response.data.status === 1 && response.data.manifest_url) {
        // If manifest generation is successful and URL is available
        const link = document.createElement('a');
        link.href = response.data.manifest_url;
        link.download = 'manifest.pdf'; // You can modify the filename as needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up the link element

        // Generate the invoice
        const invoiceResponse = await api.post(`/dashboard/print/invoice`, {
          ids: [shipment_orderId],
        });

        console.log("shiprocket_order_id", orderId)

        const { invoice_url } = invoiceResponse.data;

        console.log("invoice_url", invoice_url)

        // Fetch the invoice as a Blob
        const invoiceRes = await fetch(invoice_url);
        const originalBlob = await invoiceRes.blob();

        // Create a new Blob with the correct MIME type
        const correctedBlob = new Blob([originalBlob], { type: 'application/pdf' });

        // Function to generate custom invoice blob (this will be similar to generateInvoicePDFBlob)
        const generateCustomInvoiceBlob = async (orderDetails) => {
          // Render the React component to an HTML string (similar to what you already did)
          const invoiceHTMLString = ReactDOMServer.renderToString(
            <InvoiceForOrder data={orderDetails} />
          );

          const tempContainer = document.createElement("div");
          tempContainer.innerHTML = invoiceHTMLString;
          document.body.appendChild(tempContainer);

          try {
            const canvas = await html2canvas(tempContainer, {
              scale: 0.8,
              useCORS: true,
              logging: false,
            });

            document.body.removeChild(tempContainer);

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = 210;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            // Optional: Compress the PDF
            // pdf.compress();

            return pdf.output("blob");
          } catch (error) {
            console.error("Error generating the custom invoice PDF:", error);
            throw error;
          }
        };

        const customInvoiceBlob = await generateCustomInvoiceBlob(orderDetails);


        // Create FormData for sending the manifest to WhatsApp
        const whatsappFormData = new FormData();
        whatsappFormData.append(
          "file",
          customInvoiceBlob,
          `invoice-${orderDetails.orderId}.pdf`
        );
        whatsappFormData.append("messaging_product", "whatsapp");
        // Upload the manifest file to WhatsApp
        const fbResponse = await fetch(
          `https://graph.facebook.com/v13.0/${process.env.REACT_APP_WHATSAPP_ID}/media`,
          {
            method: "POST",
            body: whatsappFormData,
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_WHATSAPP_TOKEN}`,
            },
          }
        );

        if (!fbResponse.ok) {
          console.error(
            `HTTP error during Facebook Graph API request! Status: ${fbResponse.status}`
          );
        }

        const fbData = await fbResponse.json();
        const phoneNumber =
          orderDetails.userDetails.phoneNumber !== "N/A"
            ? orderDetails.userDetails.phoneNumber
            : orderDetails.addressDetails.phone;
        // Prepare WhatsApp message data
        const whatsappData = {
          messaging_product: "whatsapp",
          to: "91" + (phoneNumber), // Dynamically set the phone number
          type: "template",
          template: {
            name: "invoice_template", // Adjust the template name accordingly
            language: {
              code: "en",
            },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      id: fbData.id,
                    },
                  },
                ],
              },
            ],
          },
        };

        // Send the manifest to the customer via WhatsApp
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.REACT_APP_WHATSAPP_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(whatsappData),
          }
        );

        const whatsappResponseData = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
          console.error(
            `Error in sending WhatsApp message! status:${whatsappResponse.status}`
          );
          if (whatsappResponseData.error.message.includes("incapable")) {
            toast.error(
              `${phoneNumber} incapable of receiving WhatsApp message.`
            );
          }
        } else {
          toast.success("Manifest sent successfully via WhatsApp!");
        }

      } else {
        alert('Manifest generated but no URL available.');
      }
    } catch (error) {
      console.error('Error generating manifest:', error);
      alert('Failed to generate manifest.');
    } finally {
      setIsLoading(false); // Hide the loading spinner
      navigate(`/order-details/${orderId}`)
      const fetchOrderDetails = async () => {
        try {
          const response = await api.get(`/dashboard/getOrderDetails/${orderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOrderDetails(response.data.orderDetails);

        } catch (error) {
          console.error('Error fetching order details:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderDetails();
    }
  };



  const handleDimensionChange = (event) => {
    const selected = predefinedDimensions.find(d => d._id === event.target.value);
    setSelectedDimension(selected);
    setCustomDimensions({ ...customDimensions, weight: selected.boxWeight || customDimensions.weight }); // Update weight field with predefined weight if available
  };


  const handleCustomDimensionChange = (e) => {
    const { name, value } = e.target;
    setCustomDimensions(prevDimensions => ({
      ...prevDimensions,
      [name]: value === '' ? '' : Number(value),
    }));
  };

  //  for Button Section 
  const handleButtonClick = async (action) => {
    // const Shiptoken = process.env.REACT_APP_SHIPROCKET_TOKEN;
    try {
      switch (action) {
        case "trackOrder":
          setIsTrackingOrder(true);
          const awbCod = orderDetails.shiprocket_awb_code;
          await api.get(`/dashboard/track/awb/${awbCod}`);
          navigate(`/tracking/${awbCod}`);
          break;

        case "generateAndDownloadInvoice":
          setIsLoading(true);
          try {
            const invoiceResponse = await api.post(`/dashboard/print/invoice`, {
              ids: [orderDetails.shiprocket_order_id],
            });

            const { is_invoice_created, invoice_url } = invoiceResponse.data;

            if (is_invoice_created) {
              downloadFile(invoice_url); // Trigger the download immediately
            } else {
              alert("Invoice creation failed.");
            }
          } catch (error) {
            console.error("Error generating invoice:", error);
            alert("Error generating invoice.");
          } finally {
            setIsLoading(false);

          }
          break;

        case "downloadLabel":
          setIsLoading(true);
          try {
            const labelResponse = await api.post(`/dashboard/generate/label`, {
              shipment_id: [orderDetails.shiprocket_shipment_id],
            });

            const { label_created, label_url } = labelResponse.data;

            if (label_created) {
              downloadFile(label_url); // Trigger the download immediately
            } else {
              alert("Label creation failed.");
            }
          } catch (error) {
            console.error("Error generating label:", error);
            alert("Error generating label.");
          } finally {
            setIsLoading(false);
          }
          break;

        default:
          console.error('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling button click:', error);
      alert('An error occurred.');
    } finally {
      if (action === "trackOrder") {
        setIsTrackingOrder(false);
      }
    }
  };
  const downloadFile = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Function to generate the PDF Blob
  const generateInvoicePDFBlob = async (orderDetails) => {
    // Step 1: Render the React component to an HTML string
    const invoiceHTMLString = ReactDOMServer.renderToString(
      <InvoiceForOrder data={orderDetails} />
    );

    // Step 2: Create a temporary container for the rendered HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = invoiceHTMLString;
    document.body.appendChild(tempContainer);

    try {
      // Step 3: Use html2canvas to convert the rendered HTML into a canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 0.8, // Adjust scale for higher quality
        useCORS: true, // Ensure cross-origin content is included
        logging: false, // Disable console logs to reduce overhead
      });

      // Remove the temporary container after rendering
      document.body.removeChild(tempContainer);

      // Step 4: Convert the canvas to an image and add it to a jsPDF document
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      // Optional: Compress the PDF further by reducing the resolution of the PDF image
      // pdf.compress();
      // Step 5: Return the PDF as a blob
      return pdf.output("blob");
    } catch (error) {
      // Handle any errors that occur during the PDF generation process
      console.error("Error generating the invoice PDF:", error);
      throw error;
    }
  };

  // Function to handle invoice download
  const handleInvoiceDownload = async () => {
    try {
      // Step 1: Generate the PDF Blob using the invoice data
      const invoiceBlob = await generateInvoicePDFBlob(orderDetails);

      // Step 2: Create a temporary object URL for the PDF Blob
      const blobURL = URL.createObjectURL(invoiceBlob);

      // Step 3: Create a download link and trigger the download
      const downloadLink = document.createElement("a");
      downloadLink.href = blobURL;
      downloadLink.download = `OrderInvoice-${orderDetails.orderId || "Order"}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Step 4: Revoke the object URL to free memory
      URL.revokeObjectURL(blobURL);
    } catch (error) {
      // Handle any errors that occur during the download process
      console.error("Error generating or downloading the invoice:", error);
    }
  };
  // // Testing Whatsapp 



  // // Function to send invoice to WhatsApp using the generated custom invoice blob
  // const sendCustomInvoiceToWhatsApp = async (orderDetails) => {
  //   try {
  //     // Generate the custom invoice PDF Blob
  //     const customInvoiceBlob = await generateCustomInvoiceBlob(orderDetails);

  //     // Create FormData for sending the manifest to WhatsApp
  //     const whatsappFormData = new FormData();
  //     whatsappFormData.append(
  //       "file",
  //       customInvoiceBlob,
  //       `invoice-${orderDetails.orderId}.pdf`
  //     );
  //     whatsappFormData.append("messaging_product", "whatsapp");

  //     // Upload the invoice file to WhatsApp
  //     const fbResponse = await fetch(
  //       `https://graph.facebook.com/v13.0/${process.env.REACT_APP_WHATSAPP_ID}/media`,
  //       {
  //         method: "POST",
  //         body: whatsappFormData,
  //         headers: {
  //           Authorization: `Bearer ${process.env.REACT_APP_WHATSAPP_TOKEN}`,
  //         },
  //       }
  //     );

  //     if (!fbResponse.ok) {
  //       console.error(`Error during Facebook Graph API request! Status: ${fbResponse.status}`);
  //       return;
  //     }

  //     const fbData = await fbResponse.json();
  //     const phoneNumber =
  //       orderDetails.userDetails.phoneNumber !== "N/A"
  //         ? orderDetails.userDetails.phoneNumber
  //         : orderDetails.addressDetails.phone;
  //     // Prepare WhatsApp message data
  //     const whatsappData = {
  //       messaging_product: "whatsapp",
  //       to: "91" + (phoneNumber), // Default number if unavailable
  //       type: "template",
  //       template: {
  //         name: "invoice_template", // Adjust template name
  //         language: {
  //           code: "en",
  //         },
  //         components: [
  //           {
  //             type: "header",
  //             parameters: [
  //               {
  //                 type: "document",
  //                 document: {
  //                   id: fbData.id,
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     };

  //     // Send the invoice to WhatsApp
  //     const whatsappResponse = await fetch(
  //       `https://graph.facebook.com/v18.0/${process.env.REACT_APP_WHATSAPP_ID}/messages`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${process.env.REACT_APP_WHATSAPP_TOKEN}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(whatsappData),
  //       }
  //     );

  //     const whatsappResponseData = await whatsappResponse.json();

  //     if (!whatsappResponse.ok) {
  //       console.error(`Error in sending WhatsApp message! Status: ${whatsappResponse.status}`);
  //       if (whatsappResponseData.error.message.includes("incapable")) {
  //         toast.error(
  //           `${phoneNumber} incapable of receiving WhatsApp messages.`
  //         );
  //       }
  //     } else {
  //       toast.success("Invoice sent successfully via WhatsApp!");
  //     }
  //   } catch (error) {
  //     console.error("Error in sending invoice to WhatsApp:", error);
  //     toast.error("Error in sending the invoice to WhatsApp.");
  //   }
  // };

  // // Usage example:
  // // Assuming `orderDetails`, `shipmentId`, and `phoneNumber` are available
  // const handleSendInvoice = () => {
  //   sendCustomInvoiceToWhatsApp(orderDetails, orderDetails.userDetails.phoneNumber);
  // };


  const isTOGS = orderDetails?.products?.some((product) => product.group === "TOGS");

  return (
    <div className="main-content">
      <BackButton></BackButton>
      <div className="container-fluid">
        {isLoading ? (
          <div className="loader">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
        ) : (
          orderDetails && (
            <>
              <div className="row mb-3">
                <div className="col-12 col-md-6">
                  <strong>Customer Information</strong>
                  <div>
                    <strong>Name:</strong> {orderDetails.userDetails.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {orderDetails.userDetails.email}
                  </div>
                  <div>
                    <strong>Gender:</strong> {orderDetails.userDetails.gender}
                  </div>
                  <div>
                    <strong>Phone Number:</strong> {orderDetails.userDetails.phoneNumber}
                  </div>

                </div>
                <div className="col-12 col-md-6">
                  <strong>Shipping Address</strong>
                  <div>
                    <strong>Name:</strong> {orderDetails.addressDetails.firstName} {orderDetails.addressDetails.lastName}
                  </div>
                  <div>
                    <strong>Address:</strong> {orderDetails.addressDetails.address}, {orderDetails.addressDetails.city}, {orderDetails.addressDetails.state}, {orderDetails.addressDetails.pinCode}
                  </div>
                  <div>
                    <strong>Phone:</strong> {orderDetails.addressDetails.phone}
                  </div>
                  <div>
                    <strong>Email:</strong> {orderDetails.addressDetails.email}
                  </div>
                </div>
              </div>

              <h3 className="mb-3 text-center mt-5">Particular Order Details</h3>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date Of Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{orderDetails.orderId}</td>
                      <td>{new Date(orderDetails.dateOfOrder).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover mt-3 ">
                  <thead className="table-dark">
                    <tr className="text-center">
                      <th>Product Id</th>
                      <th>Group</th>
                      <th>Category</th>
                      <th>School Name</th>
                      <th>Sub Category</th>
                      <th>Type</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Logo Url</th>
                      <th>Logo Position</th>
                      <th>Slab Discount</th>
                      <th>Slab Discount %</th>
                      <th>Unit Price</th>
                      <th>Total(Total-Slab Discount)</th>

                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.products.map((product, index) => (
                      <tr key={index}>
                        <td className="text-center">{product.productId}</td>
                        <td className="text-center">{product.group}</td>
                        <td className="text-center">{product.productDetails.category}</td>
                        <td className="text-center">{product.productDetails?.schoolName || "N/A"}</td>
                        <td className='text-center'>{product.productDetails?.subCategory || "N/A"}</td>
                        <td className="text-center">{product.productDetails.productType}</td>
                        <td className="text-center">{product.color.name}</td>
                        <td className="text-center">{product.size}</td>
                        <td className="text-center">{product.quantityOrdered}</td>
                        <td className="text-center">
                          {product.logoUrl ? (
                            <a href={product.logoUrl} target="_blank"
                              rel="noopener noreferrer"
                              className="btn "

                            > <i className="bi bi-download"></i></a>
                          ) : (
                            <span>NA</span>
                          )}
                        </td>
                        <td className="text-center">
                          {product.logoPosition ? product.logoPosition : 'NA'}
                        </td>
                        <td className="text-center">₹ {product.slabDiscountAmount.toFixed(2)}</td>
                        <td className="text-center">{product.slabDiscountPercentage} %</td>
                        <td className="text-center"> ₹{product.price.toFixed(2)}</td>
                        <td className="text-center"> ₹{product.price.toFixed(2) * product.quantityOrdered - product.slabDiscountAmount.toFixed(2)}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              <div className="row mb-3">
                <div className="col-12">
                  <strong>Total Price:</strong> ₹{orderDetails.TotalAmount.toFixed(2)}
                </div>
                <div className="col-12 mt-2">
                  <strong>Total Slab Discount :</strong> -₹{orderDetails.
                    totalSlabDiscountAmount.toFixed(2)}
                </div>
                <div className="col-12 mt-2">
                  <strong>Price After Slab Discount:</strong> ₹{(orderDetails.TotalAmount - orderDetails.
                    totalSlabDiscountAmount).toFixed(2)}
                </div>
                <div className="col-12 mt-2">
                  <strong>Coupon Discount ({orderDetails.couponDiscountPercentage}% - Code: {orderDetails.couponCode}):</strong>
                  -₹{orderDetails.couponDiscountAmount.toFixed(2)}
                </div>
                <div className="col-12 mt-2">
                  <strong>Total Discount Amount:</strong> ₹{orderDetails.TotalDiscountAmount.toFixed(2)}
                </div>
                <div className="col-12 mt-2">
                  <strong>Total Price After Discount:</strong> ₹{orderDetails.TotalPriceAfterDiscount.toFixed(2)}
                </div>
              </div>


              <div className="row mb-3">
                <div className="col-12 text-md-end">
                  <strong>Delivery Status:</strong> {orderDetails.deliveryStatus}
                </div>
              </div>

              {/* Conditionally render the button based on the status */}
              {orderDetails.status === "Pending" && (
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <Button
                    className="btn btn-success px-3"
                    onClick={handleAssignToShiprocket}
                    disabled={isLoading}
                  >
                    Assign to Shiprocket
                  </Button>
                  <Button
                    className="btn btn-success px-3"
                    onClick={handleInvoiceDownload}
                  >
                    Download Custom Invoice
                  </Button>
                  {/* Uncomment if needed */}
                  {/* <button 
                 onClick={handleSendInvoice} 
                 className="btn btn-primary px-3"
               >
                 Send Invoice to WhatsApp
               </button> */}
                </div>

              )}
              {orderDetails.status === "Assigned" && (
                <div className="text-end mt-4">
                  <div className="d-flex flex-wrap justify-content-end gap-2">
                    <Button
                      className="btn btn-cyan"
                      onClick={() => handleButtonClick("trackOrder")}
                      disabled={isTrackingOrder}
                    >
                      {isTrackingOrder ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        "Track Order"
                      )}
                    </Button>

                    <Button
                      className="btn btn-green"
                      onClick={() => handleButtonClick("generateAndDownloadInvoice")}
                    >
                      Download Shiprocket Invoice
                    </Button>

                    <Button
                      className="btn btn-blue"
                      onClick={() => handleButtonClick("downloadLabel")}
                    >
                      Download Label
                    </Button>

                    <Button className="btn btn-blue" onClick={handleInvoiceDownload}>
                      Download Custom Invoice
                    </Button>
                  </div>
                </div>

              )}


              {/* Modal for Shiprocket assignment */}
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Assign to Shiprocket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Check
                      type="radio"
                      label="Use Predefined Dimensions"
                      name="dimensionOption"
                      checked={usePredefined}
                      onChange={() => setUsePredefined(true)}
                    />
                    {usePredefined && (
                      <>
                        <Form.Select onChange={handleDimensionChange}>
                          <option>Select predefined dimension</option>
                          {predefinedDimensions?.length > 0 ? (
                            predefinedDimensions.map(dimension => (
                              <option key={dimension._id} value={dimension._id}>
                                {`Length: ${dimension.boxLength} cm, Breadth: ${dimension.boxBreadth} cm, Height: ${dimension.boxHeight} cm`}
                              </option>
                            ))
                          ) : (
                            <option disabled>No predefined dimensions available</option>
                          )}
                        </Form.Select>
                        <Form.Group className="mt-2">
                          <Form.Label>Weight (kg)</Form.Label>
                          <Form.Control
                            type="number"
                            name="weight"
                            value={customDimensions.weight}
                            onChange={handleCustomDimensionChange}
                          />
                        </Form.Group>
                      </>
                    )}

                    <Form.Check
                      type="radio"
                      label="Use Custom Dimensions"
                      name="dimensionOption"
                      checked={!usePredefined}
                      onChange={() => setUsePredefined(false)}
                      className="mt-3"
                    />
                    {!usePredefined && (
                      <div>
                        <Form.Group className="mt-2">
                          <Form.Label>Length (cm)</Form.Label>
                          <Form.Control
                            type="number"
                            name="length"
                            value={customDimensions.length}
                            onChange={handleCustomDimensionChange}
                          />
                        </Form.Group>
                        <Form.Group className="mt-2">
                          <Form.Label>Breadth (cm)</Form.Label>
                          <Form.Control
                            type="number"
                            name="breadth"
                            value={customDimensions.breadth}
                            onChange={handleCustomDimensionChange}
                          />
                        </Form.Group>
                        <Form.Group className="mt-2">
                          <Form.Label>Height (cm)</Form.Label>
                          <Form.Control
                            type="number"
                            name="height"
                            value={customDimensions.height}
                            onChange={handleCustomDimensionChange}
                          />
                        </Form.Group>
                        <Form.Group className="mt-2">
                          <Form.Label>Weight (kg)</Form.Label>
                          <Form.Control
                            type="number"
                            name="weight"
                            value={customDimensions.weight}
                            onChange={handleCustomDimensionChange}
                          />
                        </Form.Group>
                      </div>
                    )}
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleModalSubmit} disabled={isLoading}>
                    Assign
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )
        )}

      </div>
    </div>
  );
};

export default OrderDetails;
