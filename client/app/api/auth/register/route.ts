import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";
import { nhost } from "@/lib/nhost";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const validatedData = registerSchema.parse(body);

 // Nhost v4 SDK throws on error, so we need try-catch here
 let result: any;
 try {
 result = await nhost.auth.signUpEmailPassword({
 email: validatedData.email,
 password: validatedData.password,
 options: {
 metadata: {
 name: validatedData.name,
 role: validatedData.role,
 companyName: validatedData.companyName,
 country: validatedData.country,
 phone: validatedData.phone,
 },
 },
 });
 } catch (signupError: any) {
 // SDK threw an error - extract the message
 const msg = signupError?.body?.message || signupError?.message || "Registration failed";
 console.error("Nhost signup threw:", msg);
 return NextResponse.json({ error: msg }, { status: 400 });
 }

 const error = result.error || result.body?.error;
 const session = result.session || result.body?.session;
 const mfa = result.mfa || result.body?.mfa;

 const userId = session?.user?.id || result?.user?.id || result?.body?.user?.id;
 const userEmail = session?.user?.email || result?.user?.email || result?.body?.user?.email || validatedData.email;


 if (error) {
 return NextResponse.json(
 { error: error?.message ?? "Registration failed" },
 { status: 400 }
 );
 }

 // Create the profile and auto-sync
 if (userId) {
 try {
 const prismaModule = await import("@/lib/prisma");

 // Create/update public profile
 await prismaModule.prisma.user.upsert({
 where: { id: userId },
 update: {
 name: validatedData.name,
 email: validatedData.email,
 role: validatedData.role,
 businessName: validatedData.companyName || null,
 country: validatedData.country,
 phone: validatedData.phone || null,
 },
 create: {
 id: userId,
 name: validatedData.name,
 email: validatedData.email,
 role: validatedData.role,
 businessName: validatedData.companyName || null,
 country: validatedData.country,
 phone: validatedData.phone || null,
 verificationStatus: "VERIFIED", 
 },
 });

 // Welcome notification
 try {
 await prismaModule.prisma.notification.create({
 data: {
 userId: userId,
 type: "ORDER_UPDATE",
 title: "Welcome to Renote Exim!",
 message: `Welcome ${validatedData.name ?? ""}! Your account has been created successfully.`,
 },
 });
 } catch (e) {
 console.warn("Welcome notification failed:", e);
 }
 } catch (e: any) {
 console.warn("Prisma sync failed during registration:", e.message);
 }
 }

 // Return session or perform auto-login
 if (session?.accessToken) {
 const response = NextResponse.json(
 {
 message: "Registration successful",
 user: { id: userId, name: validatedData.name, email: userEmail, role: validatedData.role },
 token: session.accessToken,
 },
 { status: 201 }
 );
 
 response.cookies.set(AUTH_COOKIE_NAME, session.accessToken, AUTH_COOKIE_OPTIONS);
 return response;
 }

 if (userId) {
 try {
 const loginResult = await nhost.auth.signInEmailPassword({
 email: validatedData.email,
 password: validatedData.password,
 });

 if (loginResult.session?.accessToken) {
 const response = NextResponse.json(
 {
 message: "Registration successful",
 user: { id: userId, name: validatedData.name, email: userEmail, role: validatedData.role },
 token: loginResult.session.accessToken,
 },
 { status: 201 }
 );
 
 response.cookies.set(AUTH_COOKIE_NAME, loginResult.session.accessToken, AUTH_COOKIE_OPTIONS);
 return response;
 }
 } catch (e) {
 console.warn("Auto-login failed:", e);
 }
 }

 // Fallback: registration worked but no session
 return NextResponse.json(
 { message: "Registration successful. Please log in." },
 { status: 201 }
 );

 } catch (error: any) {
 if (error instanceof z.ZodError) {
 return NextResponse.json(
 { error: "Validation failed", details: error.errors },
 { status: 400 }
 );
 }

 console.error("Registration error:", error?.message || error);
 return NextResponse.json(
 { error: error?.message || "Internal server error" },
 { status: 500 }
 );
 }
}
