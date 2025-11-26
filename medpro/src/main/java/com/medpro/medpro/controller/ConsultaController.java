package com.medpro.medpro.controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medpro.medpro.model.dto.CancelamentoConsulta;
import com.medpro.medpro.model.entity.StatusConsulta;
import com.medpro.medpro.repository.ConsultaRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaRepository consultaRepository;

    @PutMapping("/cancelar")
    public ResponseEntity<Object> cancelarConsulta(@RequestBody CancelamentoConsulta dto) {

        var consulta = consultaRepository.findById(dto.idConsulta())
                .orElse(null);

        if (consulta == null) {
            return ResponseEntity.badRequest()
                    .body("Consulta não encontrada.");
        }

        // Retorna erro 400 e a mensagem caso o motivo do cancelamento for null 
        if (dto.motivo() == null) {
            return ResponseEntity.badRequest()
                    .body("É obrigatório informar o motivo do cancelamento.");
        }

        // Permite cancelar apenas com 24h de antecedencia
        LocalDateTime agora = LocalDateTime.now();
        if (consulta.getData_consulta().isBefore(agora.plusHours(24))) {
            return ResponseEntity.badRequest()
                    .body("A consulta só poderá ser cancelada com 24 horas de antecedência.");
        }

        // Cancelamento
        consulta.setStatus(StatusConsulta.CANCELADA);
        consulta.setMotivoCancelamento(dto.motivo());

        consultaRepository.save(consulta);

        return ResponseEntity.ok("Consulta cancelada com sucesso.");
    }
}
