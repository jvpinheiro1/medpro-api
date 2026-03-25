create table usuarios(

    id bigint not null generated always as identity,
    email varchar(100) not null,
    senha varchar(255) not null,
    role varchar(30) not null,

    primary key(id),
    constraint uk_usuarios_email unique(email)

);
