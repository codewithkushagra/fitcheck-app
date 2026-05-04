-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
