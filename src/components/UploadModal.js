import React, { useState, useEffect } from 'react';
import './UploadModal.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import api from './api';

const UploadModal = ({ activeTab, setInventoryData }) => {
  const [file, setFile] = useState(null);
  const [schoolName, setSchoolName] = useState(''); // For selected store ID
  const [storeNames, setStoreNames] = useState([]); // State for fetched store names
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setSuccessMessage(''); // Clear previous success message
    setErrorMessage(''); // Clear previous error message
  };

  const handleSchoolNameChange = (event) => {
    setSchoolName(event.target.value); // Set store ID
  };

  const fetchStoreNames = async () => {
    const token = localStorage.getItem('authToken'); // Get the token from localStorage
    try {
      const response = await api.get('/store/store-names', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
      setStoreNames(response.data.StoreNameAndIds);
    } catch (error) {
      console.error('Error fetching store names:', error);
      setErrorMessage('Failed to fetch store names.');
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    if (activeTab === 'TOGS' && !schoolName) {
      setErrorMessage('Please select a school name.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Append school ID only for TOGS
    if (activeTab === 'TOGS') {
      formData.append('schoolName', schoolName); // Append selected storeId
    }

    let apiEndpoint = '';
    switch (activeTab) {
      case 'ELITE':
        apiEndpoint = '/bulkUpload/bulkUploadElites';
        break;
      case 'bulkUploadWorkWears':
        apiEndpoint = '/bulkUpload/bulkUploadWorkWears';
        break;
      case 'bulkUploadSpirits':
        apiEndpoint = '/bulkUpload/bulkUploadSpirits';
        break;
      case 'TOGS':
        apiEndpoint = '/bulkUpload/bulkUploadTogs';
        break;
      case 'bulkUploadShields':
        apiEndpoint = '/bulkUpload/bulkUploadShields';
        break;
      case 'HEAL':
        apiEndpoint = '/bulkUpload/bulkUploadHeals';
        break;
      default:
        setErrorMessage('Invalid category selected.');
        return;
    }
    const token = localStorage.getItem('authToken');
    setLoading(true); // Show loading indicator
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.post(apiEndpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setInventoryData(response.data);
      setSuccessMessage('File uploaded successfully!'); // Show success message
      setFile(null); // Clear the file input
      setUploadSuccess(true); // Trigger re-render

      const modalElement = document.getElementById('uploadModal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    } catch (error) {
      console.error('Error uploading file:', error);
      const errMsg = error.response?.data?.message || 'Error uploading file. Please try again.';
      setErrorMessage(errMsg); // Show error message in red
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleDownloadTemplate = () => {
    let csvTemplateUrl = '';
    switch (activeTab) {
      case 'ELITE':
        csvTemplateUrl = 'https://dresscode-buck.s3.ap-south-1.amazonaws.com/DresscodeEmptyCSVFiles/elite_products.csv';
        break;
      case 'bulkUploadWorkWears':
        csvTemplateUrl = '/path-to-workwears-template.csv';
        break;
      case 'bulkUploadSpirits':
        csvTemplateUrl = '/path-to-spirits-template.csv';
        break;
      case 'bulkUploadShields':
        csvTemplateUrl = '/path-to-shields-template.csv';
        break;
      case 'HEAL':
        csvTemplateUrl = 'https://dresscode-buck.s3.ap-south-1.amazonaws.com/DresscodeEmptyCSVFiles/heal_uniforms_data_final.csv';
        break;
      case 'TOGS':
        csvTemplateUrl = 'https://dresscode-buck.s3.ap-south-1.amazonaws.com/DresscodeEmptyCSVFiles/Togs_empty_CSV.csv';
        break;
      default:
        setErrorMessage('Invalid category selected.');
        return;
    }

    const link = document.createElement('a');
    link.href = csvTemplateUrl;
    link.download = csvTemplateUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (uploadSuccess) {
      window.location.reload();
    }
  }, [uploadSuccess]);

  // Fetch store names when activeTab is 'TOGS'
  useEffect(() => {
    if (activeTab === 'TOGS') {
      fetchStoreNames();
    }
  }, [activeTab]);

  return (
    <div className="modal fade" id="uploadModal" tabIndex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="uploadModalLabel">Bulk Upload</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            {loading && (
              <div className="text-center mb-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Category: {activeTab.replace(/_/g, ' ')}</label>
              </div>

              {/* Conditional dropdown for school name when activeTab is TOGS */}
              {activeTab === 'TOGS' && (
                <div className="mb-3">
                  <label htmlFor="schoolName" className="form-label">Select School Name</label>
                  <select
                    id="schoolName"
                    value={schoolName}
                    onChange={handleSchoolNameChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select School</option>
                    {storeNames.map((store) => (
                      <option key={store.storeId} value={store.storeName}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3 d-flex flex-column flex-md-row align-items-center">
                <label htmlFor="formFile" className="form-label me-3">Upload CSV file</label>
                <input
                  type="file"
                  id="formFile"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="form-control"
                  required
                />
                {/* {file && <span className="ms-2">{file.name}</span>} */}
              </div>

              <div className="mb-3">
                <button type="button" className="upload-link btn-link" onClick={handleDownloadTemplate}>
                  Click here to download empty CSV file template
                </button>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-light-green" disabled={loading}>
                  {loading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
