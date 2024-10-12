CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(225) NOT NULL,
    last_name VARCHAR(225) NOT NULL,
    email VARCHAR(225) NOT NULL,
    password VARCHAR(450) NOT NULL,
    reset_password_token VARCHAR(225),
    reset_password_expires TIMESTAMP
)