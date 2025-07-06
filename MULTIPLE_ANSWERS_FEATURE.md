# Multiple Answers Feature Documentation

## Overview

The Online Test Management System (OTMS) now supports multiple choice questions where students can select multiple correct answers. This feature enhances the testing capabilities by allowing more complex question types beyond simple single-choice questions.

## Features

### 1. Question Types
- **Single Choice**: Traditional multiple choice with one correct answer
- **Multiple Choice**: Questions with multiple correct answers that students must select

### 2. Test Creation
- Teachers can choose between single and multiple choice when creating questions
- Visual interface with radio buttons for single choice and checkboxes for multiple choice
- Automatic validation to ensure at least one correct answer is selected

### 3. Test Taking
- Students see appropriate input controls (radio buttons vs checkboxes) based on question type
- Multiple answers are stored as arrays
- Navigation indicators show completion status for both question types

### 4. Scoring System
- **Single Choice**: Full points for correct answer, zero for incorrect
- **Multiple Choice**: Full points only if ALL correct answers are selected AND no incorrect answers are selected
- Partial credit is not awarded (all-or-nothing scoring)

### 5. Test Review
- Both students and teachers can review multiple choice questions
- Visual indicators show which options were correct vs student selections
- Clear display of multiple answers separated by commas

## Database Changes

### Schema Updates
The database schema has been updated to support multiple answers:

```sql
-- Migration script to update existing database
ALTER TABLE test_questions ADD COLUMN question_type VARCHAR(10) DEFAULT 'single';
ALTER TABLE test_questions ADD COLUMN answer_new TEXT[];
UPDATE test_questions SET answer_new = ARRAY[answer] WHERE answer IS NOT NULL;
ALTER TABLE test_questions DROP COLUMN answer;
ALTER TABLE test_questions RENAME COLUMN answer_new TO answer;
ALTER TABLE test_questions ALTER COLUMN answer SET NOT NULL;
ALTER TABLE test_questions ADD CONSTRAINT check_question_type CHECK (question_type IN ('single', 'multiple'));
```

### Updated Models
- `TestQuestion.answer`: Changed from `String` to `String[]`
- `TestQuestion.question_type`: New field with values 'single' or 'multiple'
- `StudentTest.answers`: Updated to store arrays of answers

## API Changes

### Test Creation
- **Endpoint**: `POST /api/teacher/test`
- **Changes**: Now accepts `question_type` and `answer` as array

### Test Taking
- **Endpoint**: `POST /api/student/tests/[test_id]`
- **Changes**: Handles both single and multiple answers in scoring logic

### Test Review
- **Endpoints**: 
  - `GET /api/student/test-result/[test_id]`
  - `GET /api/teacher/test-result/[test_id]/[student_id]`
- **Changes**: Returns arrays for `correct_answer` and `student_answer`

## User Interface Changes

### Test Creation Form
1. **Question Type Selection**: Radio buttons to choose between single and multiple choice
2. **Answer Selection**: Checkboxes for multiple choice, radio buttons for single choice
3. **Validation**: Ensures at least one correct answer is selected

### Test Taking Interface
1. **Dynamic Input Controls**: Radio buttons for single choice, checkboxes for multiple choice
2. **Answer Storage**: Handles both single strings and arrays
3. **Navigation**: Updated to check for valid answers in both formats

### Test Review Interface
1. **Answer Display**: Shows multiple answers separated by commas
2. **Visual Indicators**: Highlights correct and student-selected answers
3. **Comparison Logic**: Compares arrays for accuracy

## Scoring Algorithm

The scoring system uses the following logic for multiple choice questions:

```javascript
const isCorrect = correctAnswers.length === studentAnswers.length &&
  correctAnswers.every(ans => studentAnswers.includes(ans)) &&
  studentAnswers.every(ans => correctAnswers.includes(ans));
```

This ensures that:
- All correct answers must be selected
- No incorrect answers can be selected
- Order doesn't matter
- Partial credit is not awarded

## Migration Guide

### For Existing Data
1. Run the provided SQL migration script
2. Existing single-choice questions will be automatically converted
3. All existing test results will continue to work

### For New Tests
1. Use the updated test creation interface
2. Choose question type when creating questions
3. Select multiple correct answers for multiple choice questions

## Example Usage

### Creating a Multiple Choice Question
1. Navigate to test creation
2. Add a new question
3. Select "Multiple Choice" as question type
4. Enter question text and options
5. Check multiple correct answers
6. Set score and save

### Taking a Multiple Choice Test
1. Students see checkboxes for multiple choice questions
2. Can select multiple options
3. Must submit all answers to proceed
4. Navigation shows completion status

### Reviewing Multiple Choice Results
1. Correct answers are highlighted in green
2. Student selections are shown with checkmarks/crosses
3. Multiple answers are displayed as comma-separated lists
4. Score calculation considers all selected answers

## Benefits

1. **Enhanced Assessment**: More complex question types possible
2. **Better Learning**: Students must understand all correct aspects
3. **Flexible Testing**: Supports various educational scenarios
4. **Backward Compatibility**: Existing single-choice tests continue to work
5. **Clear Feedback**: Visual indicators help students understand mistakes

## Future Enhancements

1. **Partial Credit**: Award points for partially correct multiple choice answers
2. **Weighted Scoring**: Different weights for different correct answers
3. **Question Templates**: Pre-built multiple choice question templates
4. **Analytics**: Detailed analysis of multiple choice performance patterns
5. **Export Features**: Enhanced reporting for multiple choice questions

## Technical Notes

- All arrays are stored as PostgreSQL TEXT[] arrays
- JSON serialization handles array conversion automatically
- TypeScript interfaces have been updated for type safety
- Error handling includes validation for array operations
- Performance optimizations for array comparisons

## Support

For questions or issues with the multiple answers feature:
1. Check the migration script has been run
2. Verify database schema matches the updated Prisma schema
3. Ensure all API endpoints are updated
4. Test with both single and multiple choice questions 