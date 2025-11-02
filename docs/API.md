# API Documentation

Base URL: `http://localhost:5000/api`

## Products

### Get All Products

```http
GET /products
```

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "stock": number,
    "imageUrl": "string",
    "ratings": number,
    "numReviews": number,
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Get Product by ID

```http
GET /products/:id
```

**Parameters:**
- `id` (path) - Product ID

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "stock": number,
  "imageUrl": "string",
  "ratings": number,
  "numReviews": number,
  "createdAt": "date",
  "updatedAt": "date"
}
```

**Error Response:**
- `404` - Product not found

### Create Product

```http
POST /products
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "stock": number,
  "imageUrl": "string" (optional)
}
```

**Response:**
- `201` - Product created successfully
- `400` - Invalid request data

### Update Product

```http
PUT /products/:id
```

**Parameters:**
- `id` (path) - Product ID

**Request Body:**
```json
{
  "name": "string" (optional),
  "description": "string" (optional),
  "price": number (optional),
  "category": "string" (optional),
  "stock": number (optional),
  "imageUrl": "string" (optional)
}
```

**Response:**
- `200` - Product updated successfully
- `404` - Product not found
- `400` - Invalid request data

### Delete Product

```http
DELETE /products/:id
```

**Parameters:**
- `id` (path) - Product ID

**Response:**
- `200` - Product deleted successfully
- `404` - Product not found

## Orders

### Create Order

```http
POST /orders
```

**Request Body:**
```json
{
  "orderItems": [
    {
      "name": "string",
      "quantity": number,
      "price": number,
      "product": "string"
    }
  ],
  "shippingAddress": {
    "address": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string"
  },
  "paymentMethod": "string",
  "taxPrice": number,
  "shippingPrice": number,
  "totalPrice": number
}
```

**Response:**
- `201` - Order created successfully
- `400` - Invalid request data

### Get Order by ID

```http
GET /orders/:id
```

**Parameters:**
- `id` (path) - Order ID

**Response:**
```json
{
  "_id": "string",
  "user": "string",
  "orderItems": [...],
  "shippingAddress": {...},
  "paymentMethod": "string",
  "taxPrice": number,
  "shippingPrice": number,
  "totalPrice": number,
  "isPaid": boolean,
  "paidAt": "date",
  "isDelivered": boolean,
  "deliveredAt": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

**Error Response:**
- `404` - Order not found

### Get All Orders

```http
GET /orders
```

**Response:**
```json
[
  {
    "_id": "string",
    "user": {...},
    "orderItems": [...],
    "totalPrice": number,
    "isPaid": boolean,
    "isDelivered": boolean,
    "createdAt": "date"
  }
]
```

### Update Order to Paid

```http
PUT /orders/:id/pay
```

**Parameters:**
- `id` (path) - Order ID

**Request Body:**
```json
{
  "id": "string",
  "status": "string",
  "update_time": "string",
  "email_address": "string"
}
```

**Response:**
- `200` - Order updated successfully
- `404` - Order not found

### Update Order to Delivered

```http
PUT /orders/:id/deliver
```

**Parameters:**
- `id` (path) - Order ID

**Response:**
- `200` - Order updated successfully
- `404` - Order not found

## Error Responses

All endpoints may return the following error responses:

- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

## Data Validation

### Product Validation Rules
- `name`: Required, max 100 characters
- `description`: Required, max 2000 characters
- `price`: Required, must be >= 0
- `category`: Required
- `stock`: Required, must be >= 0

### Order Validation Rules
- `orderItems`: Required, must not be empty
- `shippingAddress`: All fields required
- `paymentMethod`: Required, must be one of: PayPal, Stripe, CreditCard
- `taxPrice`: Must be >= 0
- `shippingPrice`: Must be >= 0
- `totalPrice`: Must be >= 0
