-- Add rating category columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS rating_punctuality INTEGER,
ADD COLUMN IF NOT EXISTS rating_professionalism INTEGER,
ADD COLUMN IF NOT EXISTS rating_care_quality INTEGER,
ADD COLUMN IF NOT EXISTS rating_communication INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraints for rating categories (1-5 range)
ALTER TABLE reviews
ADD CONSTRAINT IF NOT EXISTS check_rating_punctuality CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
ADD CONSTRAINT IF NOT EXISTS check_rating_professionalism CHECK (rating_professionalism >= 1 AND rating_professionalism <= 5),
ADD CONSTRAINT IF NOT EXISTS check_rating_care_quality CHECK (rating_care_quality >= 1 AND rating_care_quality <= 5),
ADD CONSTRAINT IF NOT EXISTS check_rating_communication CHECK (rating_communication >= 1 AND rating_communication <= 5);
