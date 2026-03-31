ALTER TABLE users ADD COLUMN medico_id BIGINT;

ALTER TABLE users ADD CONSTRAINT fk_users_medico_id FOREIGN KEY (medico_id) REFERENCES medicos(id);