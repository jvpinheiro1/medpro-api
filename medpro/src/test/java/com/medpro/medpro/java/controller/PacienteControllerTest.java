package com.medpro.medpro.java.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import com.medpro.medpro.controller.PacienteController;
import com.medpro.medpro.enums.EnumRole;
import com.medpro.medpro.model.dto.DadosAtualizacaoPaciente;
import com.medpro.medpro.model.dto.DadosCadastroPaciente;
import com.medpro.medpro.model.dto.DadosDetalhamentoPaciente;
import com.medpro.medpro.model.dto.DadosEndereco;
import com.medpro.medpro.model.entity.User;
import com.medpro.medpro.security.SecurityConfig;
import com.medpro.medpro.service.AuthService;
import com.medpro.medpro.service.PacienteService;
import com.medpro.medpro.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;

@WebMvcTest(PacienteController.class)
@AutoConfigureMockMvc
@AutoConfigureJsonTesters
@Import(SecurityConfig.class)
public class PacienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<DadosCadastroPaciente> dadosCadastroJson;

    @Autowired
    private JacksonTester<DadosAtualizacaoPaciente> dadosAtualizacaoJson;

    @MockitoBean
    private PacienteService pacienteService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private TokenService tokenService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User(1L, "admin", "password", EnumRole.ADMIN);
    }

    private void mockAutenticacao() {
        when(tokenService.recuperarToken(any(HttpServletRequest.class))).thenReturn("token");
        when(tokenService.validarToken("token")).thenReturn("admin");
        when(authService.loadUserByUsername("admin")).thenReturn(adminUser);
    }

    private DadosCadastroPaciente dadosCadastroValidos() {
        var endereco = new DadosEndereco("Rua A", "Centro", "12345678", "São Paulo", "SP", "10", null);
        return new DadosCadastroPaciente("João Silva", "joao@email.com", "11999999999", "12345678901", endereco);
    }

    private DadosDetalhamentoPaciente detalhamentoFake() {
        return new DadosDetalhamentoPaciente(1L, "João Silva", "joao@email.com", "11999999999", null);
    }

    // =========================================================
    // POST /pacientes (cadastrar)
    // =========================================================

    @Test
    @DisplayName("cadastrar - 403 quando sem autenticação")
    void cadastrar_cenario1() throws Exception {
        var response = mockMvc.perform(post("/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("cadastrar - 400 quando JSON vazio (campos obrigatórios ausentes)")
    void cadastrar_cenario2() throws Exception {
        mockAutenticacao();

        mockMvc.perform(post("/pacientes")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[*].campo", hasItem("nome")))
                .andExpect(jsonPath("$[*].campo", hasItem("email")))
                .andExpect(jsonPath("$[*].campo", hasItem("cpf")))
                .andExpect(jsonPath("$[*].campo", hasItem("endereco")));
    }

    @Test
    @DisplayName("cadastrar - 201 quando dados válidos")
    void cadastrar_cenario3() throws Exception {
        mockAutenticacao();
        when(pacienteService.cadastrar(any())).thenReturn(detalhamentoFake());

        var response = mockMvc.perform(post("/pacientes")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosCadastroJson.write(dadosCadastroValidos()).getJson()))
                .andReturn().getResponse();
        assertEquals(201, response.getStatus());
    }

    // =========================================================
    // GET /pacientes (listar)
    // =========================================================

    @Test
    @DisplayName("listar - 403 quando sem autenticação")
    void listar_cenario1() throws Exception {
        var response = mockMvc.perform(get("/pacientes"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("listar - 200 quando autenticado")
    void listar_cenario2() throws Exception {
        mockAutenticacao();
        when(pacienteService.listar(any())).thenReturn(Page.empty());

        var response = mockMvc.perform(get("/pacientes")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }

    // =========================================================
    // PUT /pacientes (atualizar)
    // =========================================================

    @Test
    @DisplayName("atualizar - 403 quando sem autenticação")
    void atualizar_cenario1() throws Exception {
        var response = mockMvc.perform(put("/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("atualizar - 400 quando id ausente")
    void atualizar_cenario2() throws Exception {
        mockAutenticacao();

        var response = mockMvc.perform(put("/pacientes")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("atualizar - 400 quando paciente não encontrado")
    void atualizar_cenario3() throws Exception {
        mockAutenticacao();
        when(pacienteService.atualizar(any()))
                .thenThrow(new IllegalArgumentException("Paciente não encontrado!"));

        var dados = new DadosAtualizacaoPaciente(99L, "Novo Nome", null, null);

        var response = mockMvc.perform(put("/pacientes")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAtualizacaoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("atualizar - 200 quando dados válidos")
    void atualizar_cenario4() throws Exception {
        mockAutenticacao();
        when(pacienteService.atualizar(any())).thenReturn(detalhamentoFake());

        var dados = new DadosAtualizacaoPaciente(1L, "Novo Nome", "11988887777", null);

        var response = mockMvc.perform(put("/pacientes")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAtualizacaoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }

    // =========================================================
    // DELETE /pacientes/{id} (excluir)
    // =========================================================

    @Test
    @DisplayName("excluir - 403 quando sem autenticação")
    void excluir_cenario1() throws Exception {
        var response = mockMvc.perform(delete("/pacientes/1"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("excluir - 400 quando paciente tem consultas ativas")
    void excluir_cenario2() throws Exception {
        mockAutenticacao();
        doThrow(new IllegalArgumentException("Não é possível excluir um paciente com consultas agendadas!"))
                .when(pacienteService).excluir(any());

        var response = mockMvc.perform(delete("/pacientes/1")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("excluir - 204 quando excluído com sucesso")
    void excluir_cenario3() throws Exception {
        mockAutenticacao();

        var response = mockMvc.perform(delete("/pacientes/1")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(204, response.getStatus());
    }

    // =========================================================
    // GET /pacientes/{id} (detalhar)
    // =========================================================

    @Test
    @DisplayName("detalhar - 403 quando sem autenticação")
    void detalhar_cenario1() throws Exception {
        var response = mockMvc.perform(get("/pacientes/1"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("detalhar - 200 quando paciente encontrado")
    void detalhar_cenario2() throws Exception {
        mockAutenticacao();
        when(pacienteService.detalhar(any())).thenReturn(detalhamentoFake());

        var response = mockMvc.perform(get("/pacientes/1")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }
}
