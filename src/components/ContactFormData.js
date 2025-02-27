import React, { useState, useEffect } from 'react';
import api from './api';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';

import { Button, Snackbar, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const ContactFormData = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [formData, setFormData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Number of items per page
    const { userData } = useAuth();
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const response = await api.get('/dashboard/get-contacts', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("FormData", response)
                setFormData(response.data.data);
            } catch (error) {
                console.error('Error fetching quote orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormData();
    }, [token]);

    // Pagination logic
    const indexOfLastForm = currentPage * itemsPerPage;
    const indexOfFirstForm = indexOfLastForm - itemsPerPage;
    const currentForm = formData.slice(indexOfFirstForm, indexOfLastForm);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDownload = async () => {
        try {
            const response = await api.get('/dashboard/download-contacts', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' // Ensures proper file handling
            });

            // Create a CSV file URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'contacts_list.csv'); // Changed to CSV format
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            // Show success Snackbar
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Error downloading contacts:', error);
        }
    };
    // Close Snackbar function
    const handleClose = () => {
        setOpenSnackbar(false);
    };


    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="sr-only"></span>
                </div>
            </div>
        );
    }

    return (
        <Layout userName={userData.name}>
            <h3 className="text-center mb-3">Contact form list</h3>

            {/* Download Button (Material-UI) */}
            <Button
                variant="contained"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleDownload}
                sx={{ position: "absolute", top: 10, right: 10 }}
            >
                Download
            </Button>


            {/* Snackbar for success message */}
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    Contacts downloaded successfully!
                </Alert>
            </Snackbar>


            {formData.length === 0 ? (
                <div className="text-center">
                    <p>No contacts list available.</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="table table-striped sticky-header">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Category</th>
                                    <th>Organization</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentForm.map((form, index) => (
                                    <tr key="" style={{ cursor: 'pointer' }}>
                                        <td>{index + 1 + indexOfFirstForm}</td>
                                        <td>{form.name}</td>
                                        <td>{form.email}</td>
                                        <td>{form.mobile}</td>
                                        <td>{form.category}</td>
                                        <td>{form.organization}</td>
                                        <td>{form.message}</td>
                                        <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {[...Array(Math.ceil(formData.length / itemsPerPage)).keys()].map((pageNumber) => (
                                <li key={pageNumber} className={`page-item ${currentPage === pageNumber + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(pageNumber + 1)}>
                                        {pageNumber + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </>
            )}
        </Layout>
    )
}

export default ContactFormData