package com.medpro.medpro.model.dto;

import com.medpro.medpro.model.entity.MotivoCancelamento;

public record CancelamentoConsulta(Long idConsulta, MotivoCancelamento motivo) {
    
}
