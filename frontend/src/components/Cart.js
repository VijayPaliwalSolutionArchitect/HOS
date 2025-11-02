import React from 'react';

const Cart = ({ cartItems, onRemoveFromCart, onUpdateQuantity }) => {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.container}>
        <h2>Shopping Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Shopping Cart</h2>
      <div style={styles.cartItems}>
        {cartItems.map((item) => (
          <div key={item._id} style={styles.cartItem}>
            <div style={styles.itemInfo}>
              <h4>{item.name}</h4>
              <p style={styles.price}>${item.price.toFixed(2)}</p>
            </div>
            <div style={styles.quantityControl}>
              <button
                onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={styles.quantityButton}
              >
                -
              </button>
              <span style={styles.quantity}>{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                style={styles.quantityButton}
              >
                +
              </button>
            </div>
            <div style={styles.itemTotal}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button
              onClick={() => onRemoveFromCart(item._id)}
              style={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div style={styles.total}>
        <h3>Total: ${calculateTotal().toFixed(2)}</h3>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  cartItems: {
    marginTop: '20px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  itemInfo: {
    flex: 1,
  },
  price: {
    color: '#666',
    fontSize: '14px',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quantityButton: {
    width: '30px',
    height: '30px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  quantity: {
    minWidth: '30px',
    textAlign: 'center',
  },
  itemTotal: {
    fontWeight: 'bold',
    minWidth: '80px',
    textAlign: 'right',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  total: {
    marginTop: '20px',
    padding: '15px',
    borderTop: '2px solid #333',
    textAlign: 'right',
  },
};

export default Cart;
