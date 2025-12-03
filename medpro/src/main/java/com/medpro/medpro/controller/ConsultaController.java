package com.medpro.medpro.controller;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medpro.medpro.model.dto.DadosAgendamentoConsulta;
import com.medpro.medpro.model.dto.DadosCancelamentoConsulta;
import com.medpro.medpro.model.dto.DadosDetalhamentoConsulta;
import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.MedicoRepository;
import com.medpro.medpro.repository.PacienteRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("consultas")
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @PostMapping
    @Transactional
    public ResponseEntity agendar(@RequestBody @Valid DadosAgendamentoConsulta dados) {

        // validacao de o paciente existe
        if (!pacienteRepository.existsById(dados.idPaciente())) {
            return ResponseEntity.badRequest().body("Id do paciente informado não existe!");
        }

        Medico medico;

        // verificação para caso for passadoum medico especifico
        if (dados.idMedico() != null) {
            medico = medicoRepository.findById(dados.idMedico()).orElse(null);
            if (medico == null) {
                return ResponseEntity.badRequest().body("Id do médico informado não existe!");
            }
        } else {
            // quando a escolha for por especialidade de forma aleatoria
            if (dados.especialidade() == null) {
                return ResponseEntity.badRequest()
                        .body("Especialidade é obrigatória quando o médico não é informado!");
            }

            List<Medico> medicosDisponiveis = medicoRepository
                    .findAllByAtivoTrueAndEspecialidade(dados.especialidade());

            List<Medico> livres = medicosDisponiveis.stream()
                    .filter(m -> !consultaRepository
                            .existsByMedicoIdAndDataConsultaAndMotivoCancelamentoIsNull(
                                    m.getId(), dados.data()))
                    .toList();

            if (livres.isEmpty()) {
                return ResponseEntity.badRequest().body("Não existe médico disponível para esse horário!");
            }

            medico = livres.get(new Random().nextInt(livres.size()));
        }

        var dataConsulta = dados.data();
        var agora = LocalDateTime.now();

        // Consulta precisa ser marcada pelo menos 30min antes
        if (Duration.between(agora, dataConsulta).toMinutes() < 30) {
            return ResponseEntity.badRequest()
                    .body("Consulta deve ser agendada com antecedência mínima de 30 minutos.");
        }

        // Verifica o horario de funcionamento
        if (dataConsulta.getDayOfWeek() == DayOfWeek.SUNDAY ||
            dataConsulta.getHour() < 7 || dataConsulta.getHour() > 18) {
            return ResponseEntity.badRequest().body("Consulta fora do horário de funcionamento.");
        }

        //verifica se o paciente esta ativo ou nao
        var paciente = pacienteRepository.getReferenceById(dados.idPaciente());
        if (!paciente.getAtivo()) {
            return ResponseEntity.badRequest().body("Paciente não está ativo.");
        }
        //verifica se o meidco esta ativo ou nao
        if (!medico.getAtivo()) {
            return ResponseEntity.badRequest().body("Médico não está ativo.");
        }

        // verificação para nao marcar consulta no mesmo horario
        if (consultaRepository.existsByMedicoIdAndDataConsultaAndMotivoCancelamentoIsNull(
                medico.getId(), dataConsulta)) {
            return ResponseEntity.badRequest()
                    .body("Médico já possui outra consulta nesse mesmo horário.");
        }

        // *** REGRA NOVA: impedir consultas dentro da duração de 1 hora ***
        var inicioJanela = dataConsulta.minusMinutes(59);
        var fimJanela = dataConsulta.plusMinutes(59);

        if (consultaRepository.existsByMedicoIdAndDataConsultaBetween(
                medico.getId(), inicioJanela, fimJanela)) {
            return ResponseEntity.badRequest()
                    .body("O médico já possui outra consulta dentro da janela de 1 hora.");
        }

        // Impedir duas consultas no mesmo dia para um paciente
        var inicioDia = dataConsulta.withHour(7);
        var fimDia = dataConsulta.withHour(18);

        if (consultaRepository.existsByPacienteIdAndDataConsultaBetween(
                paciente.getId(), inicioDia, fimDia)) {
            return ResponseEntity.badRequest()
                    .body("Paciente já possui consulta agendada nesse dia.");
        }

        //criar consulta com o builder
        var consulta = Consulta.builder()
                .paciente(paciente)
                .medico(medico)
                .dataConsulta(dataConsulta)
                .build();

        consultaRepository.save(consulta);

        return ResponseEntity.ok(new DadosDetalhamentoConsulta(consulta));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity cancelar(@RequestBody @Valid DadosCancelamentoConsulta dados) {

        if (!consultaRepository.existsById(dados.idConsulta())) {
            return ResponseEntity.badRequest().body("Id da consulta não existe!");
        }

        var consulta = consultaRepository.getReferenceById(dados.idConsulta());

        // Cancelamento precisa de 24h de antecedência
        if (Duration.between(LocalDateTime.now(), consulta.getDataConsulta()).toHours() < 24) {
            return ResponseEntity.badRequest()
                    .body("Consulta só pode ser cancelada com antecedência mínima de 24h.");
        }

        consulta.setMotivoCancelamento(dados.motivo());

        return ResponseEntity.noContent().build();
    }
}
