-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'athlete',
    "date_of_birth" DATE,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "age" INTEGER,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "tenant_unique_id" VARCHAR(255) NOT NULL,
    "emergency_contact_number" VARCHAR(20),
    "emergency_contact_name" VARCHAR(255),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_tenant_unique_id_idx" ON "public"."users"("tenant_unique_id");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "users_updated_at_idx" ON "public"."users"("updated_at");

-- CreateIndex
CREATE INDEX "idx_users_full_name" ON "public"."users"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "idx_users_age" ON "public"."users"("age");

-- CreateIndex
CREATE INDEX "tenants_name_idx" ON "public"."tenants"("name");

-- CreateIndex
CREATE INDEX "idx_tenants_location" ON "public"."tenants"("city", "state", "country");

-- CreateIndex
CREATE INDEX "tenants_is_active_idx" ON "public"."tenants"("is_active");

-- CreateIndex
CREATE INDEX "tenants_created_at_idx" ON "public"."tenants"("created_at");

-- CreateIndex
CREATE INDEX "tenants_updated_at_idx" ON "public"."tenants"("updated_at");
