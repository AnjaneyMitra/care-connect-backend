-- AlterTable
ALTER TABLE "nanny_details" ADD COLUMN     "acceptance_rate" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN     "is_available_now" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "service_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parent_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "duration_hours" DECIMAL(4,2) NOT NULL,
    "num_children" INTEGER NOT NULL,
    "children_ages" JSONB,
    "special_requirements" TEXT,
    "location_lat" DECIMAL(10,8) NOT NULL,
    "location_lng" DECIMAL(11,8) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "current_assignment_id" UUID,
    "max_hourly_rate" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "request_id" UUID NOT NULL,
    "nanny_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_deadline" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "responded_at" TIMESTAMPTZ(6),
    "rank_position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
