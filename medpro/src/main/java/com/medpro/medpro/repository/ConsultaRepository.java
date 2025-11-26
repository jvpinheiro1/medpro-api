package com.medpro.medpro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medpro.medpro.model.entity.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Long>{
    
}
