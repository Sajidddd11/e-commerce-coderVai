# SMS Integration Troubleshooting & Setup Guide

## 🚨 Critical Bugs Fixed

### 1. **POST Request Bug (FIXED)**
**Problem:** The code was sending POST requests with parameters in the URL query string instead of the request body.

**Before:**
```typescript
const url = `${apiUrl}?api_key=${key}&number=${phone}&message=${msg}`
fetch(url, { method: "POST" })  // ❌ Wrong!
```

**After:**
```typescript
const formData = new URLSearchParams({ api_key: key, number: phone, message: msg })
fetch(apiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: formData.toString()  // ✅ Correct!
})
```

### 2. **No Logging System (FIXED)**
Added comprehensive SMS logging to database with admin dashboard access.

### 3. **Phone Number Validation (FIXED)**
Added automatic validation and normalization for Bangladeshi phone numbers.

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration
The SMS log module needs to be registered in the database:

```bash
cd demo-clothing-store
npm run build
npm run start
```

The first startup will automatically create the `sms_log` table.

### Step 2: Verify Environment Variables
Check your `.env` file has these configured:

```env
BULKSMSBD_API_URL=http://bulksmsbd.net/api/smsapi
BULKSMSBD_BALANCE_URL=http://bulksmsbd.net/api/getBalanceApi
BULKSMSBD_API_KEY=your-api-key-here
BULKSMSBD_SENDER_ID=your-sender-id-here
BULKSMSBD_DEFAULT_TYPE=text
BULKSMSBD_NOTIFY_ORDER_PLACED=true
BULKSMSBD_BRAND_NAME=Your Store Name
```

### Step 3: Test SMS Sending

#### Test Balance Check
```bash
curl http://localhost:9000/admin/sms/balance
```

Expected response:
```json
{
  "success": true,
  "balance": 1234.50,
  "validity": "2025-12-31"
}
```

#### Test Manual SMS
```bash
curl -X POST http://localhost:9000/admin/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "numbers": ["8801712345678"],
    "message": "Test message from Medusa"
  }'
```

#### View SMS Logs
```bash
curl http://localhost:9000/admin/sms/logs
```

#### View SMS Statistics
```bash
curl http://localhost:9000/admin/sms/stats
```

---

## 🔍 Debugging Steps

### Check 1: Server Logs
When you place an order, check the server logs for these messages:

```
[Bulk SMS BD] order.placed payload: {"id":"order_123"}
[Bulk SMS BD] Fetching order order_123 with shipping/billing relations
[Bulk SMS BD] Loaded order order_123 display #1001
[Bulk SMS BD] Sending SMS for order 1001 to validated phone number
[Bulk SMS BD] Sending SMS request: {...}
[Bulk SMS BD] API Response: {...}
[Bulk SMS BD] Gateway response for order 1001: {...}
```

**Missing logs?** → The subscriber might not be triggering. Check:
- Is `BULKSMSBD_NOTIFY_ORDER_PLACED=true`?
- Did you restart the server after making changes?

### Check 2: Phone Number Format
The phone number in the order MUST be in one of these formats:
- `+8801712345678`
- `8801712345678`
- `01712345678`

Invalid formats will be rejected with a warning in logs:
```
[Bulk SMS BD] Order order_123 has invalid phone number: Invalid Bangladeshi phone number format
```

### Check 3: SMS Logs Database
Query the database to see all SMS attempts:

```bash
curl http://localhost:9000/admin/sms/logs?limit=10
```

Look at the `status` field:
- `sent` - Successfully submitted to gateway
- `failed` - Gateway rejected the message
- `pending` - Waiting to be sent (shouldn't happen with current implementation)

Check `response_code`:
- `202` - Success
- Other codes - Check `response_message` for details

### Check 4: Bulk SMS BD Account
Common issues:
- ❌ Insufficient balance
- ❌ IP not whitelisted
- ❌ Invalid API credentials
- ❌ Sender ID not approved

Verify by checking balance:
```bash
curl http://localhost:9000/admin/sms/balance
```

---

## 📊 Admin Dashboard Integration

### View Recent SMS Activity
```javascript
// In your admin dashboard
fetch('/admin/sms/logs?limit=20')
  .then(r => r.json())
  .then(data => {
    console.log(`Total SMS sent: ${data.count}`);
    console.log('Recent logs:', data.logs);
  });
```

### View Statistics
```javascript
fetch('/admin/sms/stats')
  .then(r => r.json())
  .then(data => {
    console.log('SMS Stats (30 days):', data.stats);
    console.log('Recent failures:', data.recent_failures);
  });
```

### Monitor Failed SMS
```javascript
fetch('/admin/sms/logs?status=failed&limit=50')
  .then(r => r.json())
  .then(data => {
    data.logs.forEach(log => {
      console.error(`Failed SMS to ${log.recipient}: ${log.response_message}`);
    });
  });
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "SMS log service not available"
**Symptom:** Warning in logs: `[Bulk SMS BD] SMS log service not available`

**Solution:** The SMS log module wasn't loaded. This is non-critical (SMS will still send), but to fix:
1. Verify `medusa-config.ts` includes the sms-log module
2. Restart the server
3. Check if the `sms_log` table exists in database

### Issue 2: SMS not sending on order placement
**Symptom:** Orders complete but no SMS is sent

**Checklist:**
- ✅ Is `BULKSMSBD_NOTIFY_ORDER_PLACED=true`?
- ✅ Does the order have a phone number in shipping or billing address?
- ✅ Is the phone number in valid format?
- ✅ Check server logs for `[Bulk SMS BD]` messages
- ✅ Check SMS logs: `curl http://localhost:9000/admin/sms/logs?limit=1`

### Issue 3: "Invalid phone number format"
**Symptom:** Log shows `Invalid Bangladeshi phone number format`

**Solution:** The phone number doesn't match Bangladeshi format.
- Valid: `8801712345678`, `+8801712345678`, `01712345678`
- Invalid: `1234567890`, `+1234567890`, `88012345` (too short)
- Valid operators: 013, 014, 015, 016, 017, 018, 019

Update the checkout form to validate phone numbers before submission.

### Issue 4: Gateway returns error
**Symptom:** SMS logs show `status: "failed"` with error message

**Common Errors:**
- `"Insufficient balance"` → Add credits to your Bulk SMS BD account
- `"Invalid API key"` → Check `BULKSMSBD_API_KEY` in `.env`
- `"IP not whitelisted"` → Add your server IP in Bulk SMS BD dashboard
- `"Invalid sender ID"` → Use an approved sender ID

### Issue 5: order.placed event not triggering
**Symptom:** No logs at all when order is placed

**Solution:**
1. Check if the subscriber file exists: `src/subscribers/order-placed-sms.ts`
2. Verify the subscriber exports a config with `event: "order.placed"`
3. Restart the server completely (Ctrl+C and restart)
4. Check if other subscribers are working
5. Test by placing a test order

---

## 📱 Testing Checklist

Before going to production, test these scenarios:

- [ ] Test balance check API
- [ ] Send manual SMS via admin API
- [ ] Place order with valid phone number → SMS should send
- [ ] Place order with invalid phone number → Should log error
- [ ] Place order without phone number → Should skip SMS
- [ ] Check SMS logs show all attempts
- [ ] Check SMS stats are accurate
- [ ] Verify failed SMS are logged correctly
- [ ] Test with phone in shipping address
- [ ] Test with phone in billing address only

---

## 🔐 Security Notes

- Phone numbers in logs are automatically masked (shows last 4 digits only)
- Keep your `BULKSMSBD_API_KEY` secret - never commit it to git
- Consider rotating API keys periodically
- Monitor SMS logs for suspicious activity
- Set up rate limiting if needed

---

## 📈 Next Steps

1. **Create Admin UI Widget** - Build a dashboard widget to display SMS stats
2. **Add SMS Templates** - Support multiple message templates for different scenarios
3. **Delivery Tracking** - Implement IPN callbacks for delivery confirmation
4. **Retry Logic** - Add automatic retry for failed SMS
5. **Analytics** - Track SMS conversion rates and engagement

---

## 🆘 Still Not Working?

1. Enable debug mode by checking server logs
2. Test the Bulk SMS BD API directly using curl:

```bash
curl -X POST http://bulksmsbd.net/api/smsapi \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=YOUR_KEY&type=text&senderid=YOUR_SENDER&number=8801712345678&message=Test"
```

3. Check database for SMS logs:
   - View all: `SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 10;`
   - Count by status: `SELECT status, COUNT(*) FROM sms_log GROUP BY status;`

4. If still stuck, check:
   - Server can reach `bulksmsbd.net` (not blocked by firewall)
   - Environment variables are loaded correctly
   - No errors in server startup logs

