INSERT INTO categories(id, name) VALUES(1, 'Nhẫn Cưới') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO categories(id, name) VALUES(2, 'Dây Chuyền') ON DUPLICATE KEY UPDATE name=name;

INSERT INTO products(name, price, description, category_id, image_url) VALUES
('Nhẫn Cưới Vàng 18K', 12500000, 'Nhẫn cưới kim cương Tình Yêu Vĩnh Cửu.', 1, 'url_hinh_anh_1.jpg'),
('Dây Chuyền Vàng Trắng', 8990000, 'Dây chuyền mặt đá Topaz tinh xảo.', 2, 'url_hinh_anh_2.jpg');