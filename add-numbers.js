// Quick script to add phone numbers to admin account
const phoneNumbers = [
  {
    number: "+16138017161",
    userId: "6864ccc578cb079edda3ec7a", // Admin user ID from previous response
    twilioSid: `PN${Date.now()}1`,
    isActive: true,
    location: "North America",
    country: "United States",
    type: "local",
    price: "$1.00",
    status: "active",
    purchasedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    number: "+15878573620",
    userId: "6864ccc578cb079edda3ec7a",
    twilioSid: `PN${Date.now()}2`,
    isActive: false,
    location: "North America",
    country: "United States",
    type: "local",
    price: "$1.00",
    status: "active",
    purchasedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    number: "+19032705603",
    userId: "6864ccc578cb079edda3ec7a",
    twilioSid: `PN${Date.now()}3`,
    isActive: false,
    location: "North America",
    country: "United States",
    type: "local",
    price: "$1.00",
    status: "active",
    purchasedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

console.log("Phone numbers to add:", phoneNumbers);
console.log("✅ Add these to the PhoneNumber collection manually");
