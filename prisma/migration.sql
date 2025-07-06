-- Migration to support multiple answers for test questions
-- Run this SQL script in your PostgreSQL database

-- Step 1: Add question_type column with default value
ALTER TABLE test_questions ADD COLUMN question_type VARCHAR(10) DEFAULT 'single';

-- Step 2: Create a temporary column for the new answer structure
ALTER TABLE test_questions ADD COLUMN answer_new TEXT[];

-- Step 3: Convert existing single answers to arrays
UPDATE test_questions SET answer_new = ARRAY[answer] WHERE answer IS NOT NULL;

-- Step 4: Drop the old answer column
ALTER TABLE test_questions DROP COLUMN answer;

-- Step 5: Rename the new column to answer
ALTER TABLE test_questions RENAME COLUMN answer_new TO answer;

-- Step 6: Make answer column NOT NULL (since we have default values)
ALTER TABLE test_questions ALTER COLUMN answer SET NOT NULL;

-- Step 7: Add constraint to ensure question_type is either 'single' or 'multiple'
ALTER TABLE test_questions ADD CONSTRAINT check_question_type CHECK (question_type IN ('single', 'multiple')); 