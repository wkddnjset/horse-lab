-- Add 3 new strategy types: pace, course, weight
-- Drop existing CHECK constraint and recreate with expanded values

ALTER TABLE strategy_predictions
  DROP CONSTRAINT IF EXISTS strategy_predictions_strategy_type_check;

ALTER TABLE strategy_predictions
  ADD CONSTRAINT strategy_predictions_strategy_type_check
  CHECK (strategy_type IN ('stats', 'record', 'chemistry', 'health', 'pace', 'course', 'weight'));
