create view vw_avg_review_score as
select avg(review_score) as avg_review_score
from dim_review;


create view vw_review_score_distribution as
select review_score , count(*) as reviews_count
from dim_review
group by review_score 
order by count(*) desc;

create view vw_bad_review_score as
select count(*) as bad_reviews 
from dim_review
where review_score in(1,2);


create view vw_top_bad_reviewed_products as
select dp.product_name ,count(dr.review_score) as product_bad_reviews
from fact_sales fs 
join dim_product dp
on fs.product_key=dp.product_key
join dim_review dr
on fs.review_key=dr.review_key
where dr.review_score <=2
group by dp.product_name
order by count(dr.review_score) desc;


create view vw_average_review_score_products as
select dp.product_name,avg(dr.review_score) as avg_review_score
from fact_sales fs
join dim_product dp
on fs.product_key =dp.product_key
join dim_review dr
on fs.review_key =dr.review_key
group by dp.product_name
order by avg(dr.review_score) ;