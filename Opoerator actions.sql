 declare @Operator uniqueidentifier; SET @Operator = (select top 1 id from incidents where user_id = '25'); select  line_action, line_descr, line_timestamp from incident_handling where incident_id = @Operator