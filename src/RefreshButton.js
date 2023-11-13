import React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';

const RefreshButton = ({ onClick }) => 
{
    return (
        <Fab color="primary" aria-label="Refresh" onClick={onClick}>
            <RefreshIcon />
        </Fab>
    );
};

export default RefreshButton;