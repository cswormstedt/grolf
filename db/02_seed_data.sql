INSERT INTO players (id, name, index) VALUES
('P1', 'Sean', 7.2),
('P2', 'Hoff', 11.4),
('P3', 'Ty', 11.4),
('P4', 'JD', 11.6),
('P5', 'Dylan', 12.8),
('P6', 'Norm', 25.0);

INSERT INTO courses (id, name, par, rating, slope) VALUES
('diamond_springs', 'Diamond Springs', 72, 71.1, 130),
('harbor_shores', 'Harbor Shores', 71, 70.0, 135),
('the_patriot', 'The Patriot', 72, 71.5, 135);

INSERT INTO course_holes (course_id, hole_number, par, handicap) VALUES
('diamond_springs',1,4,8), ('diamond_springs',2,4,14), ('diamond_springs',3,4,6),
('diamond_springs',4,5,16), ('diamond_springs',5,3,10), ('diamond_springs',6,4,2),
('diamond_springs',7,3,18), ('diamond_springs',8,5,12), ('diamond_springs',9,4,4),
('diamond_springs',10,4,3), ('diamond_springs',11,5,13), ('diamond_springs',12,4,15),
('diamond_springs',13,4,9), ('diamond_springs',14,3,17), ('diamond_springs',15,4,11),
('diamond_springs',16,5,1), ('diamond_springs',17,3,5), ('diamond_springs',18,4,7);

INSERT INTO course_holes (course_id, hole_number, par, handicap) VALUES
('harbor_shores',1,4,11), ('harbor_shores',2,3,17), ('harbor_shores',3,4,15),
('harbor_shores',4,3,5), ('harbor_shores',5,5,7), ('harbor_shores',6,4,3),
('harbor_shores',7,4,1), ('harbor_shores',8,4,9), ('harbor_shores',9,5,13),
('harbor_shores',10,5,12), ('harbor_shores',11,3,18), ('harbor_shores',12,4,10),
('harbor_shores',13,3,16), ('harbor_shores',14,4,4), ('harbor_shores',15,5,8),
('harbor_shores',16,4,2), ('harbor_shores',17,3,14), ('harbor_shores',18,4,6);

INSERT INTO course_holes (course_id, hole_number, par, handicap) VALUES
('the_patriot',1,4,10), ('the_patriot',2,5,18), ('the_patriot',3,4,6),
('the_patriot',4,3,14), ('the_patriot',5,4,2), ('the_patriot',6,5,12),
('the_patriot',7,3,16), ('the_patriot',8,4,4), ('the_patriot',9,4,8),
('the_patriot',10,4,3), ('the_patriot',11,4,13), ('the_patriot',12,3,15),
('the_patriot',13,5,11), ('the_patriot',14,4,7), ('the_patriot',15,3,9),
('the_patriot',16,4,1), ('the_patriot',17,4,5), ('the_patriot',18,5,17);

INSERT INTO rounds (id, course_id) VALUES
(1, 'diamond_springs'),
(2, 'harbor_shores'),
(3, 'the_patriot');

INSERT INTO round_groups (round_id, group_number, player_id) VALUES
-- Round 1
(1,1,'P1'), (1,1,'P2'), (1,1,'P3'),
(1,2,'P4'), (1,2,'P5'), (1,2,'P6'),

-- Round 2
(2,1,'P1'), (2,1,'P2'), (2,1,'P3'),
(2,2,'P4'), (2,2,'P5'), (2,2,'P6'),

-- Round 3
(3,1,'P1'), (3,1,'P2'), (3,1,'P3'),
(3,2,'P4'), (3,2,'P5'), (3,2,'P6');
