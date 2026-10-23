create view vw_top_selling_products as
select fs.product_key,dp.product_name, 
sum(fs.quantity) as total_sold_products
from fact_sales fs join dim_product dp 
on fs.product_key=dp.product_key
group by fs.product_key ,dp.product_name 
order by  sum(fs.quantity) desc limit 20;



create view vw_revenue_by_category as 
select dp.product_category, 
sum(fs.payment_value)as Revenue_by_Category
from fact_sales fs join dim_product dp 
on fs.product_key =dp.product_key 
group by dp.product_category ;



create view vw_products_count_by_category as 
select dp.product_category, 
sum(fs.quantity)as sold_products
from fact_sales fs join dim_product dp 
on fs.product_key =dp.product_key 
group by dp.product_category ;



