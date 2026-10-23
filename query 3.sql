	create view vw_top_cities_by_revenue as
	select dc.customer_city,
	sum( fs.payment_value) as city_revenue
	from fact_sales fs join dim_customer dc 
	on dc.customer_key = fs.customer_key 
	group by dc.customer_city 
	order by sum( fs.payment_value) desc ;




	create view vw_top_states_by_revenue as
	select dc.customer_state, sum(fs.payment_value) as state_revenue
	from fact_sales fs join dim_customer dc 
	on fs.customer_key =dc.customer_key
	group by dc.customer_state
	order by sum(fs.payment_value) desc ;


	create view vw_city_state_revenue as
	select dc.customer_city,dc.customer_state,sum(fs.payment_value) as city_state_revenue
	from fact_sales fs join dim_customer dc 
	on fs.customer_key =dc.customer_key
	group by dc.customer_city,dc.customer_state;





	create view vw_products_sold_by_city as
	select dc.customer_city ,sum(fs.quantity) as sold_products
	from fact_sales fs join dim_customer dc
	on fs.customer_key = dc.customer_key
	group by dc.customer_city  order by  sum(fs.quantity) desc ;



	create view vw_products_sold_by_city_by_product as
	select dc.customer_city,dp.product_name,sum(fs.quantity) as sold_products
	from fact_sales fs 
	join dim_customer dc
	on fs.customer_key = dc.customer_key
	join dim_product dp 
	on fs.product_key=dp.product_key
	group by dc.customer_city,dp.product_name;








