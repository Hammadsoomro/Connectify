# Sub-Account Debug Checklist ✅

## Current Fixes Applied:

### 1. **Phone Number Loading Enhanced** ✅

- Added comprehensive logging to phone number loading
- Added retry logic with 3 attempts
- Better error handling for sub-accounts
- Enhanced server-side logging

### 2. **App Hanging/Clicks Fixed** ✅

- Reduced aggressive polling from 3s to 10s
- Added document.hasFocus() check
- Added click delays to prevent UI blocking
- Better state management

### 3. **User Model Verified** ✅

- assignedNumbers field exists in User schema
- Proper array of strings configuration

## Debug Steps to Check:

### **Check Sub-Account Assignment in Database**

1. **Verify admin assigned numbers to sub-account**:

   ```javascript
   // Check if sub-account has assignedNumbers in database
   db.users.findOne({ email: "sub-account-email" });
   // Should show: assignedNumbers: ["+16138017161"] or similar
   ```

2. **Check phone number exists**:
   ```javascript
   // Verify phone number exists in database
   db.phonenumbers.findOne({ number: "+16138017161" });
   // Should show active phone number
   ```

### **Check Browser Console Logs**

After logging in as sub-account, check console for these logs:

1. **Profile Loading**:

   ```
   Loading user profile...
   Profile loaded: [email] sub-account
   ```

2. **Phone Number Loading**:

   ```
   Attempting to load phone numbers (attempt 1)...
   Getting phone numbers for user: [email], role: sub-account
   Sub-account assigned numbers: ["+16138017161"]
   Sub-account found 1 assigned phone numbers
   Loaded 1 phone numbers: [array]
   ```

3. **If No Numbers**:
   ```
   No assigned numbers found for sub-account
   No phone numbers assigned to this account
   ```

### **Check Network Tab**

1. **Phone Numbers API Call**:

   - Should return 200 with phone numbers array
   - If 404: "No phone numbers assigned"
   - If 500: Server error

2. **Profile API Call**:
   - Should return 200 with user profile
   - Should show role: "sub-account"

## Expected Behavior After Fixes:

### **If Numbers Are Assigned** ✅

1. Sub-account logs in successfully
2. Profile loads (no errors)
3. Phone numbers load with retry logic
4. Dropdown shows assigned number (not "Select a number...")
5. Contacts load for that number
6. Conversations work normally

### **If Numbers Not Assigned** ✅

1. Sub-account logs in successfully
2. Profile loads (no errors)
3. Phone numbers return 404 "No phone numbers assigned"
4. UI shows "Contact your admin" message
5. No crashes or hanging

## Troubleshooting:

### **If Still Shows "Select a number..."**

1. Check browser console for phone number loading logs
2. Verify assignedNumbers field in database for sub-account
3. Check if phone number exists in PhoneNumber collection

### **If App Still Hangs**

1. Check browser console for JavaScript errors
2. Look for infinite loops in polling
3. Check if clicks trigger console logs

### **If Conversations Close Immediately**

1. Check console for message loading errors
2. Verify active phone number is set
3. Check API responses for contacts/messages

## Quick Admin Fix:

If sub-account still has no numbers, admin should:

1. **Go to Admin Dashboard**
2. **Find the sub-account**
3. **Assign phone number** (+16138017161)
4. **Sub-account should refresh/re-login**

## Test Results Expected:

- ✅ **No "Select a number..."** when numbers assigned
- ✅ **No app hanging** on any clicks
- ✅ **Conversations stay open** when clicked
- ✅ **Real-time messaging** works smoothly
- ✅ **All clicks responsive** immediately

The comprehensive fixes should resolve all the reported issues!
