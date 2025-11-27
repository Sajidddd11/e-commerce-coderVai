# Bulk SMS BD Integration

This project now includes a lightweight integration with [Bulk SMS BD](https://bulksmsbd.com/) so the Medusa backend can trigger SMS notifications directly from admin routes.

## Environment variables

Add the following keys to `.env` (already scaffolded):

```
BULKSMSBD_API_URL=http://bulksmsbd.net/api/smsapi
BULKSMSBD_BALANCE_URL=http://bulksmsbd.net/api/getBalanceApi
BULKSMSBD_API_KEY=<your-api-key>
BULKSMSBD_SENDER_ID=<approved-sender-id>
BULKSMSBD_DEFAULT_TYPE=text
BULKSMSBD_NOTIFY_ORDER_PLACED=true
BULKSMSBD_BRAND_NAME=Medusa Store
```

Ensure the server IP is whitelisted inside the Bulk SMS BD dashboard.

## Helper client

`src/lib/sms/bulk-sms-bd.ts` exports `getBulkSmsClient()`, which wraps the official HTTP API, normalizes responses, and exposes the following helpers:

- `send({ numbers, message })` — one-to-many (same message to many numbers).
- `sendCustomized({ payload })` — many-to-many (different messages per number).
- `getBalance()` — fetch current credit + validity.

## Admin API routes

Two admin routes are available for quick testing:

| Route | Method | Body / Description |
| ----- | ------ | ------------------ |
| `/admin/sms/send` | `POST` | `{ "numbers": ["88017..."], "message": "Hello from Medusa" }` |
| `/admin/sms/balance` | `GET` | Returns credits + raw gateway response. |

Example call:

```bash
curl -X POST http://localhost:9000/admin/sms/send \
  -H "Content-Type: application/json" \
  -d '{"numbers":["88017XXXXXXX"],"message":"Your Medusa order shipped."}'
```

All responses bubble up the Bulk SMS BD status code (e.g., `202` on success) so callers can branch on delivery status or inspect `raw` for debugging.

## Automatic order notifications

The subscriber in `src/subscribers/order-placed-sms.ts` listens to the `order.placed` event and automatically sends a confirmation SMS using the shipping (or billing) phone number on the order. Customize it with:

- `BULKSMSBD_NOTIFY_ORDER_PLACED=false` to turn the automation off without touching code.
- `BULKSMSBD_BRAND_NAME=Your Store` to adjust the brand name used inside the confirmation text.

Make sure your checkout flow captures a Bangladeshi phone number (e.g., `88017XXXXXXXX`) on the shipping address so the subscriber has a recipient.

