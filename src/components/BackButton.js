import React from 'react';
import { useNavigate } from 'react-router-dom';
// import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

const buttonStyles = {
    padding: '0px',
    backgroundColor: 'transparent',
    color: '#20248a',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    marginBottom: '10px',
};

function BackButton() {

    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1); // Navigate to the previous page in the history
    };

    return (
        <button onClick={handleBackClick} style={buttonStyles}>
            <KeyboardBackspaceIcon></KeyboardBackspaceIcon> Back
        </button>
    )
}

export default BackButton