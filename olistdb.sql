create database olist1;
use olist1;

create table geolocation (
geolocation_zip_code_prefix varchar(10) primary key,
geolocation_lat numeric(10,8) not null ,
geolocation_lng numeric(11,8) not null ,
geolocation_city varchar(100),
geolocation_state varchar(50)
);

create table product_category(
product_category_name varchar(100) primary key,
product_category_name_english varchar(100)
);


create table product(
product_Id varchar(50) primary key,
product_name varchar(255) not null ,
product_describtion_length int ,
product_photos_qty int,
product_weight_g  numeric(10,2) not null,
product_length_cm numeric(10,2) not null,
product_height_cm numeric(10,2) not null,
product_width_cm numeric(10,2) not null,
product_category_name varchar(100) ,

constraint fk_category_name foreign key (product_category_name) references product_category(product_category_name)
);



create table seller(
seller_Id varchar(50) primary key,
seller_city varchar(100) not null,
seller_state varchar(50) not null,
seller_zip_code_prefix  varchar(10),
constraint fk_seller_zip_code foreign key(seller_zip_code_prefix) references geolocation(geolocation_zip_code_prefix)
);



create table customer (
customer_id varchar(50) primary key,
customer_unique_id varchar(50) unique not null,
customer_city varchar(100) not null,
customer_state varchar(50) not null,
customer_zip_code_prefix  varchar(10),
constraint fk_customer_zip_code foreign key(customer_zip_code_prefix) references geolocation(geolocation_zip_code_prefix) 
);


create table Orders (
order_id varchar(50) primary key ,
order_status varchar(50) not null,
order_approved_at datetime not null,
order_delivered_carrier_dateColumn datetime not null,
order_delivered_customer_date datetime not null,
order_estimated_delivery_date datetime not null,
order_purchase_timestamp datetime not null,
customer_id varchar(50),
constraint fk_customer_id foreign key (customer_id ) references customer(customer_id )
);

create table review(
review_id varchar(50) primary key ,
reviewScore int ,
review_comment_title varchar(255),
review_comment_message text ,
review_creation_date datetime not null,
review_answer_timestamp datetime not null,
order_id varchar(50),
constraint fk_order_id  foreign key (order_id) references Orders(order_id)
);

create table order_payment(
payment_sequential int not null,
payment_type varchar(50) not null,
payment_installments int not null,
payment_value numeric(10,2) not null,
order_id varchar(50) not null,
constraint fk_order_id2 foreign key(order_id)references Orders(order_id),
constraint pk_order_payment primary key(payment_sequential,order_id)
);

create table order_item(
order_item_id int not null ,
shipping_limit_date datetime not null,
price numeric(10,2) not null,
freight_value numeric(10,2),
seller_id varchar(50),
product_id varchar(50),
order_id varchar(50) not null,
constraint fk_seller_id2 foreign key(seller_id) references seller(seller_id),
constraint fk_product_id2 foreign key(product_id ) references product(product_id ),
constraint fk_order_id3 foreign key(order_id )references Orders(order_id),
constraint pk_order_item primary key(order_id,order_item_id )
);


