import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';

const QuoteOrderDetailsPage = () => {
  const { quoteId } = useParams();
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  const { userData } = useAuth();

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      try {
        const response = await api.get(`/dashboard/getQuoteDetails/${quoteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setQuoteDetails(response.data);
        } else {
          setError('No quote details found.');
        }
      } catch (error) {
        if (error.response) {
          setError(`Error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
          setError('No response received from server.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [quoteId, token]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!quoteDetails) {
    return <div>No quote details found.</div>;
  }
  const baseStyle = {
    transition: 'background-color 0.3s, color 0.3s',
    border: '2px solid #0056b3',
    color: "#0056b3"
  };
  return (
    <>
      <BackButton></BackButton>
      <Layout userName={userData.name}>
        <h3 className="text-center mb-3">Quote Details</h3>
        <div className="table-responsive">
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th scope="row">Quote ID</th>
                <td>{quoteDetails.quoteId}</td>
              </tr>
              <tr>
                <th scope="row">Date Received</th>
                <td>{new Date(quoteDetails.dateOfQuoteRecived).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th scope="row">Client Email</th>
                <td>{quoteDetails.userDetails.email}</td>
              </tr>
              <tr>
                <th scope="row">Client Phone</th>
                <td>{quoteDetails.userDetails.phoneNumber}</td>
              </tr>
              <tr>
                <th colSpan="2" className="text-center">Product Details</th>
              </tr>
              <tr>
                <th scope="row">Group</th>
                <td>{quoteDetails.productDetails.product.group}</td>
              </tr>
              <tr>
                <th scope="row">Category</th>
                <td>{quoteDetails.productDetails.product.category}</td>
              </tr>
              <tr>
                <th scope="row">SubCategory</th>
                <td>{quoteDetails.productDetails.product.subCategory}</td>
              </tr>
              <tr>
                <th scope="row">Product Type</th>
                <td>{quoteDetails.productDetails.product.productType}</td>
              </tr>
              <tr>
                <th scope="row">Gender</th>
                <td>{quoteDetails.productDetails.product.gender}</td>
              </tr>
              <tr>
                <th scope="row">Fit</th>
                <td>{quoteDetails.productDetails.product.fit}</td>
              </tr>
              <tr>
                <th scope="row">Neckline</th>
                <td>{quoteDetails.productDetails.product.neckline}</td>
              </tr>
              <tr>
                <th scope="row">Sleeves</th>
                <td>{quoteDetails.productDetails.product.sleeves}</td>
              </tr>
              <tr>
                <th scope="row">Color</th>
                <td>{quoteDetails.productDetails.color.name}</td>
              </tr>
              <tr>
                <th scope="row">Size</th>
                <td>{quoteDetails.productDetails.size}</td>
              </tr>
              <tr>
                <th scope="row">Quantity Required</th>
                <td>{quoteDetails.productDetails.quantityRequired}</td>
              </tr>
              <tr>
                <th scope="row">Logo URL</th>
                <td>
                  {quoteDetails.productDetails.logoUrl ? (
                    <a
                      href={quoteDetails.productDetails.logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn "
                      style={baseStyle}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#0056b3'; // Change to desired hover color
                        e.target.style.color = '#e2e6ea'; // Change to desired text color on hover
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#fff'; // Reset to original color
                        e.target.style.color = '#0056b3'; // Reset to original color

                      }}
                    >
                      Download Logo
                    </a>
                  ) : (
                    'Not Provided'
                  )}
                </td>
              </tr>
              <tr>
                <th scope="row">Logo Position</th>
                <td>{quoteDetails.productDetails.logoPosition || 'Not Provided'}</td>
              </tr>
              <tr>
                <th colSpan="2" className="text-center">Address Details</th>
              </tr>
              <tr>
                <th scope="row">Name</th>
                <td>{quoteDetails.addressDetails.name}</td>
              </tr>
              <tr>
                <th scope="row">Phone</th>
                <td>{quoteDetails.addressDetails.contactPhone}</td>
              </tr>
              <tr>
                <th scope="row">Email</th>
                <td>{quoteDetails.addressDetails.email}</td>
              </tr>
              <tr>
                <th scope="row">Organization</th>
                <td>{quoteDetails.addressDetails.organizationName}</td>
              </tr>
              <tr>
                <th scope="row">Street</th>
                <td>{quoteDetails.addressDetails.street}</td>
              </tr>
              <tr>
                <th scope="row">Lane</th>
                <td>{quoteDetails.addressDetails.lane}</td>
              </tr>
              <tr>
                <th scope="row">Postal Code</th>
                <td>{quoteDetails.addressDetails.postalCode}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layout>
    </>


  );
};

export default QuoteOrderDetailsPage;
