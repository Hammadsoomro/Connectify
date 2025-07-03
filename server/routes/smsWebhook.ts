import express from "express";
const router = express.Router();

router.post("/twilio-sms", (req, res) => {
  const { From, Body } = req.body;

  // TODO: Map 'From' to contactId from DB
  const contactId = mapPhoneToContactId(From); // implement this function

  const message = {
    contactId,
    content: Body,
    timestamp: new Date().toISOString(),
    isOutgoing: false,
    type: "text",
  };

  // Emit to frontend via Socket.IO
  req.app.get("io").emit("incomingSMS", message);

  res.send("<Response></Response>");
});

export default router;