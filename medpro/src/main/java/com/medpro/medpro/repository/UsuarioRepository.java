package com.medpro.medpro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medpro.medpro.model.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);
}
