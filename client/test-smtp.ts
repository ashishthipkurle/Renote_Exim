import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as path from "path";

// Load the .env file from the client directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testEmail() {
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("User:", process.env.SMTP_USER);
  console.log("Pass:", process.env.SMTP_PASS ? "********" : "NOT SET");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: 465,
    secure: true, // port 465 requires SSL
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  try {
    console.log("\nAttempting to verify connection...");
    await transporter.verify();
    console.log("Connection verified successfully!");

    console.log("\nAttempting to send test email...");
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Test Email from Ranote",
      text: "If you get this, SMTP is working!",
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error: any) {
    console.error("\nERROR DETAILS:");
    console.error(error.message);
    if (error.response) console.error("Response:", error.response);
    if (error.code) console.error("Code:", error.code);
    if (error.command) console.error("Command:", error.command);
  }
}

testEmail();
