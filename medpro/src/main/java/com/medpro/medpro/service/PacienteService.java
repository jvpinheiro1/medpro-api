package com.medpro.medpro.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medpro.medpro.model.dto.DadosAtualizacaoPaciente;
import com.medpro.medpro.model.dto.DadosCadastroPaciente;
import com.medpro.medpro.model.dto.DadosDetalhamentoPaciente;
import com.medpro.medpro.model.dto.DadosListagemPaciente;
import com.medpro.medpro.model.entity.Paciente;
import com.medpro.medpro.model.entity.StatusConsulta;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.PacienteRepository;


@Service
public class PacienteService {

    private final ConsultaRepository consultaRepository;

    public PacienteService(PacienteRepository pacienteRepository, ConsultaRepository consultaRepository) {
        this.pacienteRepository = pacienteRepository;
        this.consultaRepository = consultaRepository;
    }
    private final PacienteRepository pacienteRepository;

    @Transactional
    public DadosDetalhamentoPaciente cadastrar(DadosCadastroPaciente dados) {
        var paciente = new Paciente(dados);
        pacienteRepository.save(paciente);
        return new DadosDetalhamentoPaciente(paciente);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemPaciente> listar(Pageable paginacao) {
        Page<DadosListagemPaciente> page = pacienteRepository.findAllByAtivoTrue(paginacao).map(DadosListagemPaciente::new);
        return page;
    }

    @Transactional
    public DadosDetalhamentoPaciente atualizar(DadosAtualizacaoPaciente dados) {
        if (!pacienteRepository.existsById(dados.id())) {
            throw new IllegalArgumentException("Paciente não encontrado!");
        }
        var paciente = pacienteRepository.getReferenceById(dados.id());
        paciente.atualizarInformacoes(dados);
        return new DadosDetalhamentoPaciente(paciente);
    }
    @Transactional
    public void excluir(Long id) {
        //consultar se tem consulta agendada para o paciente, se tiver, lançar uma exceção
        if (consultaRepository.existsByPacienteIdAndStatus(id, StatusConsulta.ATIVA)) {
            throw new IllegalArgumentException("Não é possível excluir um paciente com consultas agendadas!");
        }
        var paciente = pacienteRepository.getReferenceById(id);
        paciente.excluir();
    }
    @Transactional(readOnly = true)
    public DadosDetalhamentoPaciente detalhar(Long id) {
        var paciente = pacienteRepository.getReferenceById(id);
        return new DadosDetalhamentoPaciente(paciente);
    }

}
