-- Ranote Exim Database Migration
-- Generated from Prisma schema
-- Run this against your PostgreSQL database

-- Create enums
CREATE TYPE "Role" AS ENUM ('USER', 'EXPORTER', 'IMPORTER', 'ADMIN');
CREATE TYPE "ProductCategory" AS ENUM ('CHEMICALS', 'MACHINES', 'TEXTILES', 'MEDICAL', 'HANDICRAFTS', 'FOOD', 'ELECTRONICS', 'AUTOMOTIVE', 'CONSTRUCTION', 'AGRICULTURE', 'OTHER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DISPUTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED');
CREATE TYPE "ShipmentStatus" AS ENUM ('PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'RETURNED');
CREATE TYPE "DocumentType" AS ENUM ('BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'IMPORT_EXPORT_LICENSE', 'CERTIFICATE_OF_ORIGIN', 'QUALITY_CERTIFICATE', 'INSURANCE_DOCUMENT', 'INVOICE', 'PACKING_LIST', 'BILL_OF_LADING', 'OTHER');
CREATE TYPE "NotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'MESSAGE_RECEIVED', 'PAYMENT_RECEIVED', 'DOCUMENT_VERIFIED', 'ACCOUNT_VERIFIED', 'GENERAL');

-- Create Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'IMPORTER',
    "companyName" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create Products table
CREATE TABLE "products" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "exporterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "minOrderQty" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "hsCode" TEXT,
    "images" TEXT[],
    "certifications" TEXT[],
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Create Orders table
CREATE TABLE "orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderNumber" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "importerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Create Shipments table
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "estimatedDelivery" TIMESTAMP(3) NOT NULL,
    "actualDelivery" TIMESTAMP(3),
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PREPARING',
    "currentLocation" TEXT,
    "statusHistory" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- Create Messages table
CREATE TABLE "messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "orderId" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Create Documents table
CREATE TABLE "documents" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- Create Notifications table
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE UNIQUE INDEX "shipments_orderId_key" ON "shipments"("orderId");
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");

-- Create performance indexes
CREATE INDEX "products_exporterId_idx" ON "products"("exporterId");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_available_idx" ON "products"("available");
CREATE INDEX "orders_productId_idx" ON "orders"("productId");
CREATE INDEX "orders_importerId_idx" ON "orders"("importerId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "shipments_userId_idx" ON "shipments"("userId");
CREATE INDEX "shipments_status_idx" ON "shipments"("status");
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");
CREATE INDEX "messages_orderId_idx" ON "messages"("orderId");
CREATE INDEX "documents_ownerId_idx" ON "documents"("ownerId");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- Add foreign key constraints
ALTER TABLE "products" ADD CONSTRAINT "products_exporterId_fkey" FOREIGN KEY ("exporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_importerId_fkey" FOREIGN KEY ("importerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
