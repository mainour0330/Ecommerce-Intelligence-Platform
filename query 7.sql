create view vw_revenue_by_payment_type as
select dpay.payment_type, sum(fs.payment_value) as payment_type_revenue
from fact_sales fs
join dim_payment dpay
on fs.payment_key=dpay.payment_key
group by dpay.payment_type
order by sum(fs.payment_value) desc;




create view vw_products_by_payment_type as
select dpay.payment_type, sum(fs.quantity) as sold_products
from fact_sales fs
join dim_payment dpay
on fs.payment_key=dpay.payment_key
group by dpay.payment_type
order by sum(fs.quantity) desc;




create view vw_avg_installments as 
select avg(payment_installments) as avg_installments
from dim_payment;

create view vw_installments_distribution  as 
select  payment_installments ,count(*) as payments_count
 from  dim_payment 
 group by payment_installments 
 order by count(*)  desc;
 
 
 create view vw_most_used_payment_types as
select dpay.payment_type , count(*) as usage_count
from fact_sales fs
join dim_payment dpay
on fs.payment_key=dpay.payment_key
group by dpay.payment_type
order by count(*) desc;


