package com.medpro.medpro.model.dto;

import java.time.LocalDateTime;

import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.StatusConsulta;

public record DadosListagemConsulta(Long idPaciente, Long idMedico, LocalDateTime dataConsulta, StatusConsulta status) {
    public DadosListagemConsulta(Consulta consulta) {
        this(consulta.getMedico().getId(), consulta.getPaciente().getId(), consulta.getDataConsulta(), consulta.getStatus());
    }
}
