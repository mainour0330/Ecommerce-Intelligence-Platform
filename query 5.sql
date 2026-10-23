create view vw_avg_freight_value as
select avg(freight_value) as avg_freight_value
from fact_sales;

create view vw_freight_by_months as 
select dd.month_name ,dd.year_of_date,
sum( fs.freight_value) as freight_by_month
from fact_sales fs join dim_date dd 
on dd.date_key=fs.order_date_key 
group by dd.month_name ,dd.year_of_date ;



create view vw_late_deliveries_count as 
select count(*) as late_deliveries 
from fact_sales fs join dim_date dd 
on dd.date_key = fs.delivered_date_key
join dim_date ed 
on ed.date_key=fs.estimated_delivery_date_key
where dd.full_date >ed.full_date;

create view vw_late_deliveries_by_state as
select dc.customer_state,count(*) as late_deliveries
from fact_sales fs
join dim_customer dc
on fs.customer_key=dc.customer_key
join dim_date delivered 
on fs.delivered_date_key=delivered.date_key
join dim_date estimated
on fs.estimated_delivery_date_key=estimated.date_key
where delivered.full_date>estimated.full_date
group by dc.customer_state
order by late_deliveries desc;


create view vw_delivery_delay_details as
select dc.customer_state , delivered.full_date,estimated.full_date,
(delivered.full_date-estimated.full_date) as delay_days
from fact_sales fs
join dim_customer dc
on fs.customer_key=dc.customer_key
join dim_date delivered
on fs.delivered_date_key=delivered.date_key
join dim_date estimated
on fs.estimated_delivery_date_key=estimated.date_key
where delivered.full_date>estimated.full_date;

create view vw_delivery_delay_details as
select dc.customer_state , delivered.full_date as delivered_date
,estimated.full_date as estimated_date ,
datediff(
delivered.full_date,
estimated.full_date
) as delay_days
from fact_sales fs
join dim_customer dc
on fs.customer_key=dc.customer_key
join dim_date delivered
on fs.delivered_date_key=delivered.date_key
join dim_date estimated
on fs.estimated_delivery_date_key=estimated.date_key
where delivered.full_date>estimated.full_date;



create view vw_avg_delivery_time as
select avg(DATEDIFF(delivered.full_date,ordered.full_date)) 
as avg_delivery_days
from fact_sales fs
join dim_date ordered
on fs.order_date_key =ordered.date_key
join dim_date delivered
on fs.delivered_date_key =delivered.date_key;











