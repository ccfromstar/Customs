DROP VIEW IF EXISTS `v_input_customs`;
CREATE VIEW v_input_customs
AS
SELECT a.*,b.state as docstate
FROM input_customs a
LEFT JOIN input_form b
ON a.input_number = b.number;