delete
  FROM [axxon_psim].[dbo].[PROTOCOL]

  where timestamp >= '2023-02-20 19:20:00.000' and timestamp <= '2023-02-20 19:59:04.680' and text_info like '%Town Square%'


  select count(param1), param1
FROM sales
GROUP BY partner_id
