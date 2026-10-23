create view vw_top_sellers_by_revenue as
select ds.seller_id, sum(fs.total_price) as seller_revenue
from fact_sales fs join dim_seller ds
on fs.seller_key = ds.seller_key
group by ds.seller_id
order by sum(fs.total_price) desc;




create view vw_top_sellers_by_products as
select ds.seller_id, sum(fs.quantity) as sold_products
from fact_sales fs join dim_seller ds 
on fs.seller_key=ds.seller_key
group by ds.seller_id
order by  sum(fs.quantity) desc;



create view vw_revenue_by_seller_state   as
select ds.seller_state ,sum(fs.total_price) as seller_state_revenue
from fact_sales fs join dim_seller ds
on ds.seller_key =fs.seller_key 
group by ds.seller_state 
order by  sum(fs.total_price) desc;



create view vw_revenue_by_seller_city  as
select ds.seller_city ,sum(fs.total_price) as seller_city_revenue
from fact_sales fs join dim_seller ds
on ds.seller_key =fs.seller_key 
group by ds.seller_city
order by  sum(fs.total_price) desc;



create view   vw_avg_revenue_per_each_seller as
select ds.seller_id , avg(fs.total_price) as avg_revenue_per_seller
from fact_sales fs join dim_seller ds
on ds.seller_key =fs.seller_key 
group by ds.seller_id;



create view  vw_avg_revenue_per_seller  as
select sum(total_price)/count(distinct seller_key) as avg_revenue_per_seller
from fact_sales;




