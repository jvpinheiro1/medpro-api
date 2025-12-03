package com.medpro.medpro.model.dto;

import java.time.LocalDateTime;
import com.medpro.medpro.enums.Especialidade;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

public record DadosAgendamentoConsulta(
    Long idMedico, //pode ser null pois tem a opção de medico aleatório
    @NotNull Long idPaciente,
    @NotNull @Future LocalDateTime data,
    Especialidade especialidade 
) {}