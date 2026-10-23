create view vw_revenue_by_year as
select dd.year_of_date, sum(fs.total_price) as yearly_revenue
from fact_sales fs
join dim_date dd
on fs.order_date_key = dd.date_key
group by dd.year_of_date
order by sum(fs.total_price) desc;


create view vw_top_revenue_by_quarter as
select dd.quarter_of_date,dd.year_of_date, sum(fs.total_price) as quarter_revenue
from fact_sales fs
join dim_date dd
on fs.order_date_key = dd.date_key
group by dd.quarter_of_date,dd.year_of_date
order by sum(fs.total_price) desc;



create view vw_revenue_by_weekday as
select dd.week_day, sum(fs.total_price) as weekday_revenue
from fact_sales fs
join dim_date dd
on fs.order_date_key = dd.date_key
group by dd.week_day
order by sum(fs.total_price) desc;



create view  vw_best_sales_months as
select dd.month_name ,dd.year_of_date,(fs.total_price ) as monthly_revenue
from fact_sales fs join dim_date dd
on fs.order_date_key = dd.date_key
group by dd.month_name ,dd.year_of_date
order by sum(fs.total_price) desc;






