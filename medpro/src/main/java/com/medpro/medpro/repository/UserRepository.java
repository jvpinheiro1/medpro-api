package com.medpro.medpro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medpro.medpro.model.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLogin(String login);

}
