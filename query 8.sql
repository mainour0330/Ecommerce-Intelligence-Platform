create view vw_top_customers_by_revenue as 
select dc.customer_id,sum(fs.payment_value) as customer_revenue
from fact_sales fs
join dim_customer dc
on fs.customer_key=dc.customer_key
group by  dc.customer_id
order by sum(fs.payment_value) desc;



create view vw_top_customers_by_products as 
select dc.customer_id,sum(fs.quantity) as purchased_products
from fact_sales fs
join dim_customer dc
on fs.customer_key=dc.customer_key
group by  dc.customer_id
order by sum(fs.quantity) desc;






create view vw_avg_revenue_per_each_customer as 
select dc.customer_id,avg(fs.payment_value) as purchased_products
from fact_sales fs
join dim_customer dc
on fs.customer_key=dc.customer_key
group by  dc.customer_id;




create view vw_customers_by_state as
select customer_state, count(*) as customers_count
from dim_customer
group by customer_state
order by count(*) desc;


create view vw_customers_by_city as
select customer_city, count(*) as customers_count
from dim_customer
group by customer_city
order by count(*) desc;






create view vw_avg_products_per_customer as
select sum(quantity) / count(distinct customer_key)as avg_products_per_customer
from fact_sales;