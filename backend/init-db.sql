-- Script d'initialisation pour PostgreSQL (Render)
-- Exécuter ce script dans le Shell de la base de données Render

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'proprietaire',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area DECIMAL(10, 2),
    type VARCHAR(50) DEFAULT 'Location',
    status VARCHAR(50) DEFAULT 'Disponible',
    property_category VARCHAR(50) DEFAULT 'famille',
    max_occupants INTEGER DEFAULT 0,
    is_furnished BOOLEAN DEFAULT FALSE,
    price_per_person DECIMAL(10, 2) DEFAULT 0,
    is_student BOOLEAN DEFAULT FALSE,
    main_image TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    is_boosted BOOLEAN DEFAULT FALSE,
    boost_start_date TIMESTAMP,
    boost_end_date TIMESTAMP,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties (id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rental_requests (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties (id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer un utilisateur admin par défaut
INSERT INTO
    users (
        username,
        email,
        password,
        role
    )
VALUES (
        'Tadmin',
        'admin@tsamssira.com',
        '$2a$10$YourHashedPasswordHere',
        'admin'
    ) ON CONFLICT (username) DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_properties_user ON properties (user_id);

CREATE INDEX IF NOT EXISTS idx_properties_boosted ON properties (is_boosted);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages (receiver_id);