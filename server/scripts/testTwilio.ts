import twilio from "twilio";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testTwilioCredentials() {
  console.log("🔍 Testing Twilio Credentials...");
  console.log("");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(
    `TWILIO_SID: ${process.env.TWILIO_SID ? `${process.env.TWILIO_SID.substring(0, 8)}...` : "❌ NOT SET"}`,
  );
  console.log(
    `TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? `${process.env.TWILIO_AUTH_TOKEN.substring(0, 8)}...` : "❌ NOT SET"}`,
  );
  console.log("");

  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error("❌ Missing Twilio credentials in environment variables");
    process.exit(1);
  }

  try {
    // Test authentication by fetching account details
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    console.log("🔗 Testing Twilio connection...");
    const account = await client.api.accounts(process.env.TWILIO_SID).fetch();

    console.log("✅ Twilio Authentication Successful!");
    console.log(`Account SID: ${account.sid}`);
    console.log(`Account Status: ${account.status}`);
    console.log(`Account Type: ${account.type}`);
    console.log("");

    // Test phone numbers
    console.log("📞 Checking phone numbers...");
    const phoneNumbers = await client.incomingPhoneNumbers.list();

    if (phoneNumbers.length === 0) {
      console.log("⚠️  No phone numbers found in Twilio account");
    } else {
      console.log(`✅ Found ${phoneNumbers.length} phone numbers:`);
      phoneNumbers.forEach((number) => {
        console.log(`  - ${number.phoneNumber} (${number.friendlyName})`);
      });
    }

    console.log("");
    console.log("🎉 All Twilio tests passed! SMS should work correctly.");
  } catch (error: any) {
    console.error("❌ Twilio Authentication Failed!");
    console.error(`Error Code: ${error.code || "Unknown"}`);
    console.error(`Error Message: ${error.message}`);
    console.error("");

    if (error.code === 20003) {
      console.error("🔧 Fix: Check your Twilio Account SID and Auth Token");
      console.error("   1. Go to https://console.twilio.com");
      console.error("   2. Copy Account SID and Auth Token");
      console.error(
        "   3. Update your .env file or Netlify environment variables",
      );
    }

    process.exit(1);
  }
}

// Run the test
testTwilioCredentials();
