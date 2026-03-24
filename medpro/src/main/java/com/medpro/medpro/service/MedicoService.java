package com.medpro.medpro.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medpro.medpro.model.dto.DadosAtualizacaoMedico;
import com.medpro.medpro.model.dto.DadosCadastroMedico;
import com.medpro.medpro.model.dto.DadosDetalhamentoMedico;
import com.medpro.medpro.model.dto.DadosListagemMedico;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.model.entity.StatusConsulta;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.MedicoRepository;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final ConsultaRepository consultaRepository;

    public MedicoService(MedicoRepository medicoRepository, ConsultaRepository consultaRepository) {
        this.medicoRepository = medicoRepository;
        this.consultaRepository = consultaRepository;
    }

    @Transactional
    public DadosDetalhamentoMedico cadastrar(DadosCadastroMedico dados) {
        var medico = new Medico(dados);
        medicoRepository.save(medico);
        return new DadosDetalhamentoMedico(medico);
    }

    @Transactional(readOnly = true)
    public Page<DadosListagemMedico> listar(Pageable paginacao) {
        return medicoRepository.findAllByAtivoTrue(paginacao).map(DadosListagemMedico::new);
    }

    @Transactional
    public DadosDetalhamentoMedico atualizar(DadosAtualizacaoMedico dados) {
        if (!medicoRepository.existsById(dados.id())) {
            throw new IllegalArgumentException("Médico não encontrado!");
        }
        var medico = medicoRepository.getReferenceById(dados.id());
        medico.atualizarInformacoes(dados);
        return new DadosDetalhamentoMedico(medico);
    }

    @Transactional
    public void excluir(Long id) {
        // Consultar se tem consulta agendada para o médico, se tiver, lançar uma exceção
        if (consultaRepository.existsByMedicoIdAndStatus(id, StatusConsulta.ATIVA)) {
            throw new IllegalArgumentException("Não é possível excluir um médico com consultas agendadas!");
        }
        var medico = medicoRepository.getReferenceById(id);
        medico.excluir();
    }

    @Transactional(readOnly = true)
    public DadosDetalhamentoMedico detalhar(Long id) {
        var medico = medicoRepository.getReferenceById(id);
        return new DadosDetalhamentoMedico(medico);
    }
}
