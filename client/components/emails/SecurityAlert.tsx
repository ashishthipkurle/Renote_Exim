import {
 Body,
 Container,
 Head,
 Heading,
 Html,
 Preview,
 Section,
 Text,
 Link,
 Button,
} from "@react-email/components";
import * as React from "react";

interface SecurityAlertEmailProps {
 userName: string;
 alertType: "MFA_ENABLED" | "MFA_DISABLED" | "NEW_LOGIN" | "PASSWORD_CHANGED";
 details: string;
}

export const SecurityAlertEmail = ({
 userName,
 alertType,
 details,
}: SecurityAlertEmailProps) => {
 const getTitle = () => {
 switch (alertType) {
 case "MFA_ENABLED": return "Multi-Factor Authentication Enabled";
 case "MFA_DISABLED": return "Multi-Factor Authentication Disabled";
 case "NEW_LOGIN": return "New Login Detected";
 case "PASSWORD_CHANGED": return "Password Changed Successfully";
 default: return "Security Alert";
 }
 };

 return (
 <Html>
 <Head />
 <Preview>Security Alert: {getTitle()}</Preview>
 <Body style={main}>
 <Container style={container}>
 <Heading style={h1}>Security Alert</Heading>
 <Text style={text}>Hi {userName},</Text>
 <Text style={text}>
 This is a security notification regarding your Ranote Exim account:
 </Text>
 <Section style={alertBox}>
 <Text style={alertTitle}>{getTitle()}</Text>
 <Text style={alertDetail}>{details}</Text>
 </Section>
 <Text style={text}>
 If you did not authorize this change or login, please secure your account immediately by changing your password and contacting support.
 </Text>
 <Section style={btnContainer}>
 <Button style={button} href="https://ranote-exim.com/dashboard/settings/security">
 Review Security Settings
 </Button>
 </Section>
 <Text style={footer}>
 Secure your trade, stay vigilant.
 <br />
 Ranote Exim Security Team
 </Text>
 </Container>
 </Body>
 </Html>
 );
};

const main = {
 backgroundColor: "#f6f9fc",
 fontFamily:
 '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
 backgroundColor: "#ffffff",
 margin: "0 auto",
 padding: "20px 0 48px",
};

const h1 = {
 color: "#d93025",
 fontSize: "24px",
 fontWeight: "bold",
 textAlign: "center" as const,
 margin: "30px 0",
};

const text = {
 color: "#333",
 fontSize: "16px",
 lineHeight: "26px",
 padding: "0 48px",
};

const alertBox = {
 padding: "24px 48px",
 backgroundColor: "#fff2f0",
 margin: "20px 0",
 borderLeft: "4px solid #d93025",
};

const alertTitle = {
 fontSize: "16px",
 fontWeight: "bold",
 margin: "0",
 color: "#d93025",
};

const alertDetail = {
 fontSize: "14px",
 margin: "8px 0 0",
 color: "#333",
};

const btnContainer = {
 textAlign: "center" as const,
 padding: "20px 0",
};

const button = {
 backgroundColor: "#135bec",
 borderRadius: "8px",
 color: "#fff",
 fontSize: "16px",
 fontWeight: "bold",
 textDecoration: "none",
 textAlign: "center" as const,
 display: "block",
 padding: "12px 24px",
};

const footer = {
 color: "#8898aa",
 fontSize: "12px",
 lineHeight: "16px",
 textAlign: "center" as const,
 padding: "0 48px",
 marginTop: "40px",
};
