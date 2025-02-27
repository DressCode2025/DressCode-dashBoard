import React, { useState, useEffect } from 'react';
import api from './api'; // Import your API module


const DownloadModal = ({ activeTab }) => {
    const [storeNames, setStoreNames] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'TOGS') {
            fetchStoreNames();
        }
    }, [activeTab]);

    const fetchStoreNames = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await api.get('/store/store-names', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStoreNames(response.data.StoreNameAndIds);
        } catch (error) {
            console.error('Error fetching store names:', error);
            setErrorMessage('Failed to fetch store names.');
        }
    };

    const handleSchoolChange = (event) => {
        setSelectedSchool(event.target.value);
    };

    const handleDownloadInventory = async () => {
        if (!selectedSchool) {
            setErrorMessage('Please select a school.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const token = localStorage.getItem('authToken');

            // Encode the school name for URL
            const encodedSchoolName = encodeURIComponent(selectedSchool);

            const response = await api.get(`/dashboard/downloadInventory/${encodedSchoolName}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob', // assuming you're downloading a CSV or file
            });

            // Create a download link and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Use decoded school name for the download file name
            link.setAttribute('download', `inventory_${selectedSchool}.csv`);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSelectedSchool(''); // Clear selection
        } catch (error) {
            console.error('Error downloading inventory:', error);
            setErrorMessage('Failed to download inventory.');
        } finally {
            setLoading(false);
        }
    };


    if (activeTab !== 'TOGS') return null; // Return null if active tab is not TOGS

    return (
        <div className="modal fade" id="downloadModal" tabIndex="-1" aria-labelledby="downloadModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="downloadModalLabel">Download Inventory</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                        {loading && (
                            <div className="text-center mb-3">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="schoolSelect" className="form-label">Select School</label>
                            <select
                                id="schoolSelect"
                                className="form-select"
                                value={selectedSchool}
                                onChange={handleSchoolChange}
                            >
                                <option value="">Select School</option>
                                {storeNames.map((store) => (
                                    <option key={store.storeId} value={store.storeName}>
                                        {store.storeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleDownloadInventory}
                                disabled={loading}
                            >
                                {loading ? 'Downloading...' : 'Download Inventory'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadModal;
