import {
 Body,
 Container,
 Head,
 Heading,
 Hr,
 Html,
 Preview,
 Section,
 Text,
 Link,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
 orderNumber: string;
 customerName: string;
 totalAmount: string;
 items: { name: string; quantity: number; price: string }[];
}

export const OrderConfirmationEmail = ({
 orderNumber,
 customerName,
 totalAmount,
 items,
}: OrderConfirmationEmailProps) => (
 <Html>
 <Head />
 <Preview>Order Confirmation - {orderNumber}</Preview>
 <Body style={main}>
 <Container style={container}>
 <Section style={header}>
 <Heading style={h1}>Ranote Exim</Heading>
 </Section>
 <Text style={text}>Hi {customerName},</Text>
 <Text style={text}>
 Thank you for your order! Your payment has been successfully processed and your order is now being prepared.
 </Text>
 <Section style={infoContainer}>
 <Text style={infoTitle}>Order Number: {orderNumber}</Text>
 <Text style={infoTitle}>Total Amount: {totalAmount}</Text>
 </Section>
 <Hr style={hr} />
 <Section>
 <Heading style={h2}>Order Details</Heading>
 {items.map((item, index) => (
 <div key={index} style={itemRow}>
 <Text style={itemText}>
 <strong>{item.name}</strong> x {item.quantity}
 </Text>
 <Text style={itemPrice}>{item.price}</Text>
 </div>
 ))}
 </Section>
 <Hr style={hr} />
 <Text style={footer}>
 If you have any questions, please contact our support team.
 <br />
 <Link href="https://ranote-exim.com/support" style={link}>
 Support Center
 </Link>
 </Text>
 </Container>
 </Body>
 </Html>
);

const main = {
 backgroundColor: "#f6f9fc",
 fontFamily:
 '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
 backgroundColor: "#ffffff",
 margin: "0 auto",
 padding: "20px 0 48px",
 marginBottom: "64px",
};

const header = {
 padding: "0 48px",
};

const h1 = {
 color: "#135bec",
 fontSize: "24px",
 fontWeight: "bold",
 textAlign: "center" as const,
 margin: "30px 0",
};

const h2 = {
 color: "#333",
 fontSize: "18px",
 fontWeight: "bold",
 margin: "20px 0",
};

const text = {
 color: "#333",
 fontSize: "16px",
 lineHeight: "26px",
 padding: "0 48px",
};

const infoContainer = {
 padding: "24px 48px",
 backgroundColor: "#f4f7ff",
 margin: "20px 0",
};

const infoTitle = {
 fontSize: "14px",
 fontWeight: "bold",
 margin: "4px 0",
};

const hr = {
 borderColor: "#e6ebf1",
 margin: "20px 0",
};

const itemRow = {
 display: "flex",
 justifyContent: "space-between",
 padding: "8px 48px",
};

const itemText = {
 fontSize: "14px",
 margin: "0",
};

const itemPrice = {
 fontSize: "14px",
 fontWeight: "bold",
 margin: "0",
};

const footer = {
 color: "#8898aa",
 fontSize: "12px",
 lineHeight: "16px",
 textAlign: "center" as const,
 padding: "0 48px",
};

const link = {
 color: "#135bec",
 textDecoration: "underline",
};
