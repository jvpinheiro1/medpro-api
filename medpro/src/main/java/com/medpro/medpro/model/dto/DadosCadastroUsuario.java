package com.medpro.medpro.model.dto;

import io.micrometer.common.lang.NonNull;
import jakarta.validation.constraints.Min;

public record DadosCadastroUsuario(@NonNull String login, @NonNull String password, @NonNull String role,@Min(1) Long medicoId) {

}
