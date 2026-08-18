UPDATE "Registration"
SET "email" = lower("email");

UPDATE "Registration"
SET "phone" = CASE
  WHEN left("phone", 1) = '+' THEN '+' || regexp_replace("phone", '\D', '', 'g')
  ELSE regexp_replace("phone", '\D', '', 'g')
END;

DELETE FROM "Registration" AS later
USING "Registration" AS earlier
WHERE later.id <> earlier.id
  AND later."createdAt" > earlier."createdAt"
  AND later."email" = earlier."email";

DELETE FROM "Registration" AS later
USING "Registration" AS earlier
WHERE later.id <> earlier.id
  AND later."createdAt" > earlier."createdAt"
  AND later."phone" = earlier."phone";

CREATE UNIQUE INDEX "Registration_phone_key" ON "Registration"("phone");
