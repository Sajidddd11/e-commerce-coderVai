# SMS Admin API Endpoints

This directory contains admin API endpoints for managing SMS functionality.

## Available Endpoints

### 1. Send SMS
**POST** `/admin/sms/send`

Send SMS messages to one or more recipients.

**Request Body:**
```json
{
  "numbers": ["8801712345678", "8801812345679"],
  "message": "Your order has been shipped!",
  "senderId": "optional-sender-id",
  "type": "text"
}
```

**Response:**
```json
{
  "message": "Submitted Successfully",
  "code": 202,
  "success": true,
  "raw": "...",
  "data": {...}
}
```

### 2. Check Balance
**GET** `/admin/sms/balance`

Check your Bulk SMS BD account balance and validity.

**Response:**
```json
{
  "message": "Balance retrieved successfully",
  "code": 200,
  "success": true,
  "balance": 1234.50,
  "validity": "2025-12-31",
  "raw": "...",
  "data": {...}
}
```

### 3. View SMS Logs
**GET** `/admin/sms/logs`

View SMS delivery logs with filtering options.

**Query Parameters:**
- `limit` (default: 50) - Number of records to return
- `offset` (default: 0) - Pagination offset
- `status` - Filter by status: pending, sent, failed, delivered
- `order_id` - Filter by order ID

**Response:**
```json
{
  "logs": [
    {
      "id": "sms_log_123",
      "recipient": "8801712345678",
      "message": "Your order #1001 was placed successfully.",
      "sender_id": "8809648904226",
      "sms_type": "text",
      "status": "sent",
      "response_code": 202,
      "response_message": "Submitted Successfully",
      "order_id": "order_123",
      "created_at": "2025-11-26T10:30:00Z",
      "updated_at": "2025-11-26T10:30:00Z"
    }
  ],
  "count": 150,
  "limit": 50,
  "offset": 0
}
```

### 4. SMS Statistics
**GET** `/admin/sms/stats`

Get SMS delivery statistics for the last 30 days.

**Response:**
```json
{
  "stats": {
    "total": 500,
    "sent": 480,
    "failed": 15,
    "pending": 3,
    "delivered": 450
  },
  "recent_failures": [
    {
      "id": "sms_log_456",
      "recipient": "8801912345678",
      "response_message": "Invalid number",
      "created_at": "2025-11-26T09:15:00Z"
    }
  ]
}
```

## Phone Number Format

All phone numbers are automatically validated and normalized to Bangladeshi format:
- Accepted formats: `+8801XXXXXXXXX`, `8801XXXXXXXXX`, `01XXXXXXXXX`
- Normalized format: `8801XXXXXXXXX`
- Valid operators: 013, 014, 015, 016, 017, 018, 019

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "message": "Invalid phone number format. Must be a valid mobile number (013-019)"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to send SMS via Bulk SMS BD"
}
```

**502 Bad Gateway:**
```json
{
  "message": "SMS gateway error message",
  "code": 500,
  "success": false
}
```

