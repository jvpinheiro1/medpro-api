create table usuarios(

    id bigint not null generated always as identity,
    login varchar(100) not null,
    password varchar(255) not null,
    role varchar(30) not null,

    primary key(id),
    constraint uk_usuarios_login unique(login)
);