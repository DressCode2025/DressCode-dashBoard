import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const EditModal = ({ show, handleClose, handleSave, item }) => {
  const [price, setPrice] = useState(item.price);
  const [quantity, setQuantity] = useState(item.quantity);

  const onSave = () => {
    handleSave({ ...item, price: parseFloat(price), quantity: parseInt(quantity, 10) });
    handleClose();
  };

  return (
    <Dialog open={show} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <form>
          <TextField
            label="Category"
            value={item.pCategory}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="S Category"
            value={item.sCategory}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Gender"
            value={item.gender}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="TOW"
            value={item.pattern}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="P Name"
            value={item.pName}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="P ID"
            value={item.pId}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Fabric"
            value={item.fabric}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Color"
            value={item.color}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Size"
            value={item.size}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            margin="normal"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModal;
