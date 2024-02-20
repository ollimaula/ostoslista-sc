import React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';

const RefreshButton = ({ onClick }) => 
{
    return (
        <Fab color="primary" aria-label="Refresh" onClick={onClick} sx={{ backgroundColor: '#535C91' }}>
            <RefreshIcon />
        </Fab>
    );
};

export default RefreshButton;
