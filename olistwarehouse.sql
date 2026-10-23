create database olist_warehouse;
use olist_warehouse;

create table Dim_customer(
customer_key int primary key auto_increment,
customer_id varchar(50) not null unique,
customer_unique_id varchar(50) not null unique,
customer_city varchar(100) not null,
customer_state varchar(50) not null,
customer_zip_code_prefix varchar(10) 
);

create table Dim_review(
review_key int primary key auto_increment,
review_id varchar(50) not null unique,
review_score int ,
review_comment_title varchar(255),
review_comment_message text,
review_creation_date datetime not null,
review_answer_timestamp datetime not null
);

create table Dim_date(
date_key int primary key auto_increment,
full_date datetime not null ,
day_of_date int not null,
month_of_date int not null,
month_name varchar(20) not null,
quarter_of_date int not null,
year_of_date int not null,
week_day varchar(20)
);
create table Dim_seller(
seller_key int primary key auto_increment,
seller_id varchar(50) not null unique,
seller_city varchar(100) not null,
seller_state varchar(50) not null,
selle_zip_code_prefix varchar(10)
);

create table Dim_product(
product_key int primary key auto_increment,
product_id varchar(50) not null unique,
product_name varchar(255) not null,
product_category varchar(100) not null,
product_describtion_length int,
product_photos_qty int,
product_weight_g  numeric(10,2) not null,
product_length_cm numeric(10,2) not null,
product_height_cm numeric(10,2) not null,
product_width_cm numeric(10,2) not null
);

create table Dim_payment(
payment_key int primary key auto_increment,
payment_type varchar(50) not null,
payment_installments int not null
);

create table fact_sales(
price numeric(10,2) not null,
quantity int not null,
total_price numeric(12,2) generated always as (price*quantity) stored,
freight_value numeric(10,2) not null,
payment_value numeric(12,2) not null,
customer_key int not null,
seller_key int not null,
product_key int not null,
payment_key int not null,
review_key int not null,
order_date_key int not null,
approved_date_key int not null,
carrier_date_key int not null,
delivered_date_key int not null,
estimated_delivery_date_key int not null,
constraint fk_customer_key foreign key (customer_key) references Dim_customer(customer_key),
constraint fk_seller_key foreign key (seller_key) references Dim_seller(seller_key),
constraint fk_product_key foreign key (product_key) references Dim_product(product_key),
constraint fk_payment_key foreign key (payment_key) references Dim_payment(payment_key),
constraint fk_review_key foreign key (review_key) references Dim_review(review_key),
constraint fk_order_date foreign key (order_date_key)references Dim_date(date_key),
constraint fk_approved_date foreign key (approved_date_key)references Dim_date(date_key),
constraint fk_carrier_date foreign key (carrier_date_key)references Dim_date(date_key),
constraint fk_delivered_date foreign key (delivered_date_key)references Dim_date(date_key),
constraint fk_estimated_delivery_date foreign key (estimated_delivery_date_key)references Dim_date(date_key)
);


