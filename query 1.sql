create view vw_total_revenue as
select sum(payment_value) as Total_revenue from fact_sales;


create view vw_revenue_by_month as
select sum( payment_value) as Revenue_by_month,month_name,year_of_date
from fact_sales fs
join dim_date dd on fs.approved_date_key=dd.date_key
group by month_name, year_of_date;


create view vw_total_products as
select sum(quantity) as Total_Products
 from fact_sales ;
 
 create view vw_products_by_month as
 select sum(quantity) as Products_by_Month,month_name,year_of_date
 from fact_sales fs join dim_date dd
 on fs.order_date_key = dd.date_key
group by month_name ,year_of_date;


create view vw_avg_transaction_value as
select avg(payment_value) as Average_Transaction_Value
from fact_sales;
 
 
 
 
 
