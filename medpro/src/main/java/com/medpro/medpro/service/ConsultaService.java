package com.medpro.medpro.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medpro.medpro.model.dto.DadosAgendamentoConsulta;
import com.medpro.medpro.model.dto.DadosCancelamentoConsulta;
import com.medpro.medpro.model.dto.DadosDetalhamentoConsulta;
import com.medpro.medpro.model.dto.DadosListagemConsulta;
import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.model.entity.Paciente;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.MedicoRepository;
import com.medpro.medpro.repository.PacienteRepository;


@Service
public class ConsultaService {

    public ConsultaService(PacienteRepository pacienteRepository, ConsultaRepository consultaRepository,
            MedicoRepository medicoRepository) {
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
        this.medicoRepository = medicoRepository;
    }

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;
    private final MedicoRepository medicoRepository;

    @Transactional
    public DadosDetalhamentoConsulta agendar(DadosAgendamentoConsulta dados) {
        Medico medico;
        Paciente paciente;
        // Verificar se o paciente existe
        if (dados.idPaciente() != null){
            paciente = pacienteRepository.findById(dados.idPaciente()).orElseThrow(() -> new IllegalArgumentException("Id do paciente informado não existe!"));
        }else {
            throw new IllegalArgumentException("Id do paciente é obrigatório!"); 
        }
        // Verificar se o médico existe (se fornecido)
        if (dados.idMedico() != null) {
            medico = medicoRepository.findById(dados.idMedico()).orElseThrow(() -> new IllegalArgumentException("Id do médico informado não existe!"));
            } else {
            // Verificar se a especialidade foi fornecida
            if (dados.especialidade() == null) {
                throw new IllegalArgumentException("Especialidade é obrigatória quando o médico não é informado!"); 
            }else {
                // Verificar se há médicos disponíveis para a especialidade e data
                var medicosDisponiveis = medicoRepository.findAllByAtivoTrueAndEspecialidade(dados.especialidade());
                var livres = medicosDisponiveis.stream()
                        .filter(m -> !consultaRepository.existsByMedicoIdAndDataConsultaAndMotivoCancelamentoIsNull(m.getId(), dados.data()))
                        .toList();
                if (livres.isEmpty()) {
                    throw new IllegalArgumentException("Não há médicos disponíveis para a especialidade e data informadas!"); 
                }
                medico = livres.get(new Random().nextInt(livres.size())); 
            }
        }
        LocalDateTime dataConsulta = dados.data();
        LocalDateTime agora = LocalDateTime.now();

        if (Duration.between(agora, dataConsulta).toMinutes() < 30) {
            throw new IllegalArgumentException("Consulta deve ser agendada com pelo menos 30 minutos de antecedência!");
        }
        if (dataConsulta.getDayOfWeek() == DayOfWeek.SUNDAY || dataConsulta.getHour() < 7 || dataConsulta.getHour() > 18) {
            throw new IllegalArgumentException("Consulta fora do horário de funcionamento!");
        }

        if (!paciente.getAtivo()) {
            throw new IllegalArgumentException("Paciente não está ativo!");
        }
        if (!medico.getAtivo()) {
            throw new IllegalArgumentException("Médico não está ativo!");
        }

        if (consultaRepository.existsByMedicoIdAndDataConsultaAndMotivoCancelamentoIsNull(medico.getId(), dataConsulta)) {
            throw new IllegalArgumentException("Já existe uma consulta agendada para esse médico no mesmo horário!");
        }

        LocalDateTime inicioConsulta = dataConsulta.minusMinutes(59);
        var fimConsulta = dataConsulta.plusMinutes(59);
        
        if (consultaRepository.existsByMedicoIdAndDataConsultaBetween(medico.getId(), inicioConsulta, fimConsulta)) {
            throw new IllegalArgumentException("Já existe uma consulta agendada para esse médico em horário próximo!");
        }

        var inicioDia = dataConsulta.withHour(7);
        var fimDia = dataConsulta.withHour(18);
        if (consultaRepository.existsByPacienteIdAndDataConsultaBetween(paciente.getId(), inicioDia, fimDia)) {
            throw new IllegalArgumentException("Paciente já possui consulta agendada nesse dia!");
        }
        var consulta = new Consulta(paciente, medico, dataConsulta); 
        consultaRepository.save(consulta);
        return new DadosDetalhamentoConsulta(consulta); 
    }
    @Transactional
    public void cancelar(DadosCancelamentoConsulta dados) {
        Consulta consulta = consultaRepository.findById(dados.idConsulta()).orElseThrow(() -> new IllegalArgumentException("Id da consulta não existe!"));
        if (Duration.between(LocalDateTime.now(), consulta.getDataConsulta()).toHours() < 24) {
            throw new IllegalArgumentException("Consulta só pode ser cancelada com antecedência mínima de 24h.");
        }
        consulta.setMotivoCancelamento(dados.motivo());
    }

    @Transactional
    public Page<DadosListagemConsulta> listar(Pageable paginacao) {
        Page<DadosListagemConsulta> page = consultaRepository.findAll(paginacao).map(DadosListagemConsulta::new);
        return page;
    }

}
