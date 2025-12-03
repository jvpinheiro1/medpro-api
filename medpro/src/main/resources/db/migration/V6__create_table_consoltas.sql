create table consultas(

    id bigint not null auto_increment,
    paciente_id bigint not null,
    medico_id bigint not null,
    data_consulta datetime not null,
    status varchar(50) not null,
    motivo_cancelamento varchar(255),

    primary key(id),

    constraint fk_consulta_paciente 
        foreign key(paciente_id) references pacientes(id),

    constraint fk_consulta_medico
        foreign key(medico_id) references medicos(id)

);
