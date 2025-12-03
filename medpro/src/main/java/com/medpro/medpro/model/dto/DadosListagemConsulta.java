package com.medpro.medpro.model.dto;

import java.time.LocalDateTime;

import com.medpro.medpro.enums.Especialidade;
import com.medpro.medpro.enums.MotivoCancelamento;
import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.StatusConsulta;

public record DadosListagemConsulta(
        Long id,
        Long idPaciente,
        String nomePaciente,
        Long idMedico,
        String nomeMedico,
        Especialidade especialidade,
        LocalDateTime data, 
        StatusConsulta status,
        MotivoCancelamento motivoCancelamento
    ) {

    public DadosListagemConsulta(Consulta consulta) {
        this(
            consulta.getId(),
            consulta.getPaciente().getId(),
            consulta.getPaciente().getNome(),
            consulta.getMedico().getId(),
            consulta.getMedico().getNome(),
            consulta.getMedico().getEspecialidade(),
            consulta.getDataConsulta(),
            consulta.getStatus(),
            consulta.getMotivoCancelamento()
        );
    }
}