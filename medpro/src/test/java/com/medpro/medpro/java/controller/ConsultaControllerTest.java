package com.medpro.medpro.java.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.medpro.medpro.controller.ConsultaController;
import com.medpro.medpro.enums.EnumRole;
import com.medpro.medpro.enums.Especialidade;
import com.medpro.medpro.enums.MotivoCancelamento;
import com.medpro.medpro.model.dto.DadosAgendamentoConsulta;
import com.medpro.medpro.model.dto.DadosCancelamentoConsulta;
import com.medpro.medpro.model.dto.DadosDetalhamentoConsulta;
import com.medpro.medpro.model.entity.User;
import com.medpro.medpro.security.SecurityConfig;
import com.medpro.medpro.service.AuthService;
import com.medpro.medpro.service.ConsultaService;
import com.medpro.medpro.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;

@WebMvcTest(ConsultaController.class)
@AutoConfigureMockMvc
@AutoConfigureJsonTesters
@Import(SecurityConfig.class)
public class ConsultaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<DadosAgendamentoConsulta> dadosAgendamentoJson;

    @Autowired
    private JacksonTester<DadosCancelamentoConsulta> dadosCancelamentoJson;

    @MockitoBean
    private ConsultaService consultaService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private TokenService tokenService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("admin", "password", EnumRole.ADMIN, null);
        adminUser.setId(1L);
    }

    private void mockAutenticacao() {
        when(tokenService.recuperarToken(any(HttpServletRequest.class))).thenReturn("token");
        when(tokenService.validarToken("token")).thenReturn("admin");
        when(authService.loadUserByUsername("admin")).thenReturn(adminUser);
    }

    // =========================================================
    // POST /consultas (agendar)
    // =========================================================

    @Test
    @DisplayName("agendar - 403 quando sem autenticação")
    void agendar_cenario1() throws Exception {
        var response = mockMvc.perform(post("/consultas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("agendar - 400 quando campos obrigatórios ausentes (idPaciente e data nulos)")
    void agendar_cenario2() throws Exception {
        mockAutenticacao();

        mockMvc.perform(post("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[*].campo", hasItem("idPaciente")))
                .andExpect(jsonPath("$[*].campo", hasItem("data")));
    }

    @Test
    @DisplayName("agendar - 400 quando paciente não está ativo")
    void agendar_cenario3() throws Exception {
        mockAutenticacao();
        when(consultaService.agendar(any()))
                .thenThrow(new IllegalArgumentException("Paciente não está ativo!"));

        var dados = new DadosAgendamentoConsulta(1L, 1L,
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0),
                Especialidade.CARDIOLOGIA);

        var response = mockMvc.perform(post("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAgendamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("agendar - 400 quando consulta fora do horário de funcionamento")
    void agendar_cenario4() throws Exception {
        mockAutenticacao();
        when(consultaService.agendar(any()))
                .thenThrow(new IllegalArgumentException("Consulta fora do horário de funcionamento!"));

        var dados = new DadosAgendamentoConsulta(1L, 1L,
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0),
                Especialidade.CARDIOLOGIA);

        var response = mockMvc.perform(post("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAgendamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("agendar - 400 quando paciente já possui consulta no dia")
    void agendar_cenario5() throws Exception {
        mockAutenticacao();
        when(consultaService.agendar(any()))
                .thenThrow(new IllegalArgumentException("Paciente já possui consulta agendada nesse dia!"));

        var dados = new DadosAgendamentoConsulta(null, 1L,
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0),
                Especialidade.CARDIOLOGIA);

        var response = mockMvc.perform(post("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAgendamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("agendar - 201 quando dados válidos")
    void agendar_cenario6() throws Exception {
        mockAutenticacao();
        var dataConsulta = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        when(consultaService.agendar(any()))
                .thenReturn(new DadosDetalhamentoConsulta(1L, 1L, 1L, dataConsulta));

        var dados = new DadosAgendamentoConsulta(1L, 1L, dataConsulta, Especialidade.CARDIOLOGIA);

        var response = mockMvc.perform(post("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAgendamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(201, response.getStatus());
    }

    // =========================================================
    // DELETE /consultas (cancelar)
    // =========================================================

    @Test
    @DisplayName("cancelar - 403 quando sem autenticação")
    void cancelar_cenario1() throws Exception {
        var response = mockMvc.perform(delete("/consultas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("cancelar - 400 quando campos obrigatórios ausentes (idConsulta e motivo nulos)")
    void cancelar_cenario2() throws Exception {
        mockAutenticacao();

        var response = mockMvc.perform(delete("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("cancelar - 400 quando consulta dentro de 24h")
    void cancelar_cenario3() throws Exception {
        mockAutenticacao();
        doThrow(new IllegalArgumentException("Consulta só pode ser cancelada com antecedência mínima de 24h."))
                .when(consultaService).cancelar(any());

        var dados = new DadosCancelamentoConsulta(1L, MotivoCancelamento.PACIENTE_DESISTIU);

        var response = mockMvc.perform(delete("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosCancelamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("cancelar - 400 quando consulta não existe")
    void cancelar_cenario4() throws Exception {
        mockAutenticacao();
        doThrow(new IllegalArgumentException("Id da consulta não existe!"))
                .when(consultaService).cancelar(any());

        var dados = new DadosCancelamentoConsulta(99L, MotivoCancelamento.OUTROS);

        var response = mockMvc.perform(delete("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosCancelamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("cancelar - 204 quando dados válidos")
    void cancelar_cenario5() throws Exception {
        mockAutenticacao();

        var dados = new DadosCancelamentoConsulta(1L, MotivoCancelamento.PACIENTE_DESISTIU);

        var response = mockMvc.perform(delete("/consultas")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosCancelamentoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(204, response.getStatus());
    }

    // =========================================================
    // GET /consultas (listar)
    // =========================================================

    @Test
    @DisplayName("listar - 403 quando sem autenticação")
    void listar_cenario1() throws Exception {
        var response = mockMvc.perform(get("/consultas"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("listar - 200 quando autenticado")
    void listar_cenario2() throws Exception {
        mockAutenticacao();
        when(consultaService.listar(any())).thenReturn(Page.empty());

        var response = mockMvc.perform(get("/consultas")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }
}
