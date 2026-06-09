CREATE INDEX "software_approved_category_idx" ON "software"("approved", "category");
CREATE INDEX "software_approved_status_idx" ON "software"("approved", "status");
CREATE INDEX "software_created_at_idx" ON "software"("created_at");

CREATE INDEX "systems_type_idx" ON "systems"("type");

CREATE INDEX "platforms_group_idx" ON "platforms"("group");

CREATE INDEX "hardware_primary_platform_id_idx" ON "hardware"("primary_platform_id");
CREATE INDEX "hardware_type_idx" ON "hardware"("type");

CREATE INDEX "hardware_platforms_platform_id_idx" ON "hardware_platforms"("platform_id");

CREATE INDEX "tags_approved_idx" ON "tags"("approved");

CREATE INDEX "software_systems_system_id_idx" ON "software_systems"("system_id");
CREATE INDEX "software_platforms_platform_id_idx" ON "software_platforms"("platform_id");
CREATE INDEX "software_hardware_hardware_id_idx" ON "software_hardware"("hardware_id");
CREATE INDEX "software_tags_tag_id_approved_idx" ON "software_tags"("tag_id", "approved");

CREATE INDEX "ratings_hardware_id_idx" ON "ratings"("hardware_id");
CREATE INDEX "ratings_created_at_idx" ON "ratings"("created_at");

CREATE INDEX "submissions_status_type_created_at_idx" ON "submissions"("status", "type", "created_at");
CREATE INDEX "submissions_submitted_by_status_idx" ON "submissions"("submitted_by", "status");

CREATE INDEX "reports_status_target_type_created_at_idx" ON "reports"("status", "target_type", "created_at");
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");
CREATE INDEX "reports_reported_user_id_idx" ON "reports"("reported_user_id");

CREATE INDEX "UserList_is_public_created_at_idx" ON "UserList"("is_public", "created_at");
CREATE INDEX "UserList_owner_id_created_at_idx" ON "UserList"("owner_id", "created_at");

CREATE INDEX "UserListEntry_list_id_sort_order_idx" ON "UserListEntry"("list_id", "sort_order");
CREATE INDEX "UserListEntry_software_id_idx" ON "UserListEntry"("software_id");
CREATE INDEX "UserListEntry_hardware_id_idx" ON "UserListEntry"("hardware_id");

CREATE INDEX "UserListSave_list_id_idx" ON "UserListSave"("list_id");
