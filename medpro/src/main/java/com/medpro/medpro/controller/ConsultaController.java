package com.medpro.medpro.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medpro.medpro.model.dto.DadosAgendamentoConsulta;
import com.medpro.medpro.model.dto.DadosCancelamentoConsulta;
import com.medpro.medpro.model.dto.DadosDetalhamentoConsulta;
import com.medpro.medpro.model.dto.DadosListagemConsulta;
import com.medpro.medpro.service.ConsultaService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("consultas")
public class ConsultaController {

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    private final ConsultaService consultaService;

    @PostMapping
    public ResponseEntity<DadosDetalhamentoConsulta> agendar(@RequestBody @Valid DadosAgendamentoConsulta dados) {        
        DadosDetalhamentoConsulta dadosDetalhamentoConsulta = consultaService.agendar(dados);
        return ResponseEntity.status(201).body(dadosDetalhamentoConsulta);
    }

    @DeleteMapping
    public ResponseEntity<Void> cancelar(@RequestBody @Valid DadosCancelamentoConsulta dados) {
        consultaService.cancelar(dados);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<DadosListagemConsulta>> listar(@PageableDefault(size = 10, sort = {"dataConsulta"}) Pageable paginacao) {
        Page<DadosListagemConsulta> page = consultaService.listar(paginacao);
        return ResponseEntity.ok(page);
    }
}
