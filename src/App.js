import React, { useState, useEffect, useCallback } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { AppBar, Toolbar, Typography, IconButton, Input} from '@mui/material';
import { CheckBoxOutlined, CheckBox, Delete, Edit } from '@mui/icons-material';
import RefreshButton from './RefreshButton';

import './App.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

function App() 
{
    const [items, setItems] = useState([]);
    const [inputData, setInputData] = useState({ description: '', isChecked: false });
    const [gridMaxHeight, setGridMaxHeight] = useState();
    const [domLayout, setDomLayout] = useState('autoHeight');
    const [editItem, setEditItem] = useState({ id: '', description: '' });
    const [editingItemId, setEditingItemId] = useState(null);

    const fetchItems = useCallback(() => 
    {
        fetch('https://ostoslista-sc-default-rtdb.europe-west1.firebasedatabase.app/.json')
        .then(response => 
        {
            if (!response.ok)
                throw new Error('Failed to fetch items.');
            return response.json();
        })
        .then(data => 
        {
            if (!data || !data.items)
                setItems([]);
            else addKeys(data);
        })
        .catch(err => console.error(err));
    }, []);
      

    const addKeys = (data) => 
    {
        const keys = Object.keys(data.items);
        const valueKeys = Object.values(data.items).map( (item, index) =>
            Object.assign({}, item, { id: keys[index] }) );
        setItems(valueKeys);
    };
      
    const addItem = (newItem) => 
    {
        fetch('https://ostoslista-sc-default-rtdb.europe-west1.firebasedatabase.app/items.json',
        {
            method: 'POST',
            body: JSON.stringify(newItem)
        })
        .then(_ => fetchItems())
        .catch(err => console.error(err))
    };

    const deleteItem = (id) => 
    {
        fetch(`https://ostoslista-sc-default-rtdb.europe-west1.firebasedatabase.app/items/${id}.json`, 
        {
            method: 'DELETE',
        })
        .then((response) => 
        {
            if (!response.ok)
                throw new Error('Failed to delete item.');
            return fetchItems();
        })
        .catch((err) => console.error(err));
    };

    const markItem = (state, id) => 
    {
        fetch(`https://ostoslista-sc-default-rtdb.europe-west1.firebasedatabase.app/items/${id}.json`, 
        {
            method: 'PATCH',
            body: JSON.stringify({ isChecked: !state }),
        })
            .then(() => fetchItems())
            .catch(err => console.error(err));
    };

    const updateGridHeight = (itemsCount) => 
    {
        if (itemsCount < 1)
            setGridMaxHeight('0em');
        else if (itemsCount < 2)
            setGridMaxHeight('3.7em');
        else if (itemsCount < 3) 
            setGridMaxHeight('7.4em');
        else 
        {
            setDomLayout('autoHeight');
            setGridMaxHeight();
        }
    };

    useEffect(() => { fetchItems(); }, [fetchItems]);
    useEffect(() => { updateGridHeight(items.length); }, [items]);

    const inputChanged = (event) => 
    {
        if (editItem.id) 
        {
          // Editing an existing item
          setEditItem({ ...editItem, description: event.target.value });
        } 
        else 
        {
          // Adding a new item
          setInputData({ ...inputData, [event.target.name]: event.target.value });
        }
    };

    const handleSubmit = () => {
        if (editItem.id) 
        {
          // Editing an existing item
          updateItem(editItem);
          setEditItem({ id: '', description: '' });
        } 
        else 
        {
          // Adding a new item
          addItem(inputData);
          setInputData({ description: '' });
        }
    };

    const updateItem = (id, updatedDescription) => {
        fetch(`https://ostoslista-sc-default-rtdb.europe-west1.firebasedatabase.app/items/${id}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ description: updatedDescription }),
        })
          .then(() => fetchItems())
          .catch((err) => console.error(err));
    };

    const cancelEditing = () => {
        setEditingItemId(null);
        setInputData({ description: '' });
    };
    
    const handleKeyDown = (event) => { if (event.key === 'Enter') { handleSubmit(); } };

    const localeText = 
    {
        noRowsToShow: 'Ei ostettavaa',
        loadingError: 'Virhe ladattaessa',
        loadingOoo: 'Ladataan...',
    };

    return (
        <div className="App"> 
            <AppBar position="static" sx={{ backgroundColor: '#070F2B' }}>
                <Toolbar>
                    <Typography variant="h5">Ostoslista</Typography>
                </Toolbar>
            </AppBar>
            <div className="container" >
                <div className="ag-theme-material">
                    <div style={{ maxHeight: gridMaxHeight, backgroundColor: '#535C91', color: 'antiquewhite' }}>
                        <AgGridReact 
                            rowData={items} 
                            domLayout={domLayout} 
                            localeText={localeText}
                            style={{ backgroundColor: '#535C91' }}
                        >
                            <AgGridColumn
                                field='isChecked' 
                                flex={1}
                                cellStyle={{ backgroundColor: '#535C91', color: 'antiquewhite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                cellRenderer={(params) => (
                                    <IconButton onClick={() => markItem(params.value, params.data.id)} size="small" color="success">
                                        {params.value ? <CheckBox /> : <CheckBoxOutlined />}
                                    </IconButton>
                                )}
                            />
                            <AgGridColumn
                                field='description'
                                cellClassRules={{ 'strikethrough': (params) => params.data.isChecked }}
                                flex={4}
                                cellStyle={{ backgroundColor: '#535C91', color: 'antiquewhite', display: 'flex', alignItems: 'left', justifyContent: 'left' }}
                                cellRenderer={(params) => (
                                    <>
                                        {editingItemId === params.data.id ? (
                                            <Input
                                                defaultValue={params.value}
                                                autoFocus
                                                onBlur={(e) => {
                                                    if (!e.currentTarget.contains(e.relatedTarget)) { cancelEditing(); }
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') 
                                                    {
                                                        setEditingItemId(null);
                                                        updateItem(params.data.id, event.target.value);
                                                    }
                                                }}
                                                sx={{ color: 'antiquewhite' }}
                                            />
                                        ) : (
                                            <div style={{ flex: 1, marginRight: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} onClick={() => setEditingItemId(params.data.id)}>
                                                {params.value}
                                            </div>
                                        )}
                                    </>
                                )}
                            />
                            <AgGridColumn
                                field='id'
                                flex={2}
                                cellStyle={{ backgroundColor: '#535C91', color: 'antiquewhite', display: 'flex', alignItems: 'left' }}
                                cellRenderer={(params) => (
                                    <div style={{ display: 'flex', alignItems: 'left' }}>
                                        <IconButton onClick={() => setEditingItemId(params.data.id)} size="small" color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => deleteItem(params.data.id)} 
                                            size="small" 
                                            sx={{ bgcolor: '#535C91' }}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </div>
                                )}
                            />
                        </AgGridReact>
                    </div>
                    <Input
                        className="input"
                        placeholder="Lisää uusi tuote"
                        name="description"
                        value={inputData.description}
                        onChange={inputChanged}
                        onSubmit={() => addItem(inputData)}
                        onKeyDown={handleKeyDown}
                        sx={{ color: 'antiquewhite' }}
                    />
                    <div className='refresh-button'>
                        <RefreshButton onClick={() => { fetchItems(); cancelEditing(); }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
