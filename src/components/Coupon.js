import React, { useState, useEffect } from 'react';
import api from "./api";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Typography,
    Button,
    Tabs,
    Tab,
    TextField,
    MenuItem,
} from "@mui/material";


function Coupon() {

    const [coupons, setCoupons] = useState();
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page
    const [selectedTab, setSelectedTab] = useState(0); // State for tab selection

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await api.get('coupon/all-coupons-data', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCoupons(response.data.coupons);
                console.log("coupons", response.data.coupons)
            } catch (error) {
                console.error('Error fetching quote orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, []);


    const handlePreviousPage = () => {
        setPage((prev) => Math.max(prev - 1, 0));
    };

    const handleNextPage = () => {
        setPage((prev) =>
            Math.min(prev + 1, Math.ceil(filteredCoupons.length / rowsPerPage) - 1)
        );
    };


    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        setPage(0); // Reset page when changing tabs
    };

    if (loading) {
        return (
            <div
                style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
            >
                <CircularProgress />
            </div>
        );
    }

    // Filter bills based on the selected tab 
    const statusOptions = ['pending', 'expired', 'used'];
    const filteredCoupons = coupons.filter(
        (coupon) => coupon.status === statusOptions[selectedTab]
    );

    const paginatedCoupon = filteredCoupons.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );


    return (
        <div className="main-content">
            <Paper sx={{ mt: 4, p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Coupons
                </Typography>

                {/* Tabs for filtering bill statuses */}
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                >
                    {statusOptions.map((status, index) => (
                        <Tab key={index} label={status} />
                    ))}
                </Tabs>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Coupon Code</TableCell>
                                <TableCell>Discount (%)</TableCell>
                                <TableCell>Expiry Date</TableCell>
                                {selectedTab === 2 && (
                                    <>
                                        <TableCell>Customer ID</TableCell>
                                        <TableCell>Order ID</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCoupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body1">No Data Available</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCoupon.map((coupon) => (
                                    <TableRow
                                        key={coupon._id}
                                        hover
                                        // onClick={() => handleRowClick(bill.billId)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{coupon.couponCode}</TableCell>
                                        <TableCell>{coupon.discountPercentage}</TableCell>
                                        <TableCell>
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </TableCell>
                                        {selectedTab === 2 && (
                                            <>
                                                <TableCell>{coupon.customerId}</TableCell>
                                                <TableCell>{coupon.orderId}</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Custom Pagination */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handlePreviousPage}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>
                    <Typography>
                        Page {page + 1} of {Math.ceil(filteredCoupons.length / rowsPerPage)}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleNextPage}
                        disabled={page >= Math.ceil(filteredCoupons.length / rowsPerPage) - 1}
                    >
                        Next
                    </Button>
                </div>
            </Paper>
        </div>
    )
}

export default Coupon