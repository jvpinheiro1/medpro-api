package com.medpro.medpro.model.dto;

import com.medpro.medpro.model.entity.User;

public record DadosDetalhamentoUsuario(Long id, String login, String role, Long medicoId) {

    public DadosDetalhamentoUsuario(User user) {
        this(user.getId(), user.getLogin(), user.getRole().name(), user.getMedicoId());
    }

}
