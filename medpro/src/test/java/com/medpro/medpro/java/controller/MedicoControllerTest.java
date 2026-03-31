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

import com.medpro.medpro.controller.MedicoController;
import com.medpro.medpro.enums.EnumRole;
import com.medpro.medpro.enums.Especialidade;
import com.medpro.medpro.model.dto.DadosAtualizacaoMedico;
import com.medpro.medpro.model.dto.DadosCadastroMedico;
import com.medpro.medpro.model.dto.DadosDetalhamentoMedico;
import com.medpro.medpro.model.dto.DadosEndereco;
import com.medpro.medpro.model.entity.User;
import com.medpro.medpro.security.SecurityConfig;
import com.medpro.medpro.service.AuthService;
import com.medpro.medpro.service.MedicoService;
import com.medpro.medpro.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;

@WebMvcTest(MedicoController.class)
@AutoConfigureMockMvc
@AutoConfigureJsonTesters
@Import(SecurityConfig.class)
public class MedicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JacksonTester<DadosCadastroMedico> dadosCadastroMedicoJson;

    @Autowired
    private JacksonTester<DadosAtualizacaoMedico> dadosAtualizacaoMedicoJson;

    @MockitoBean
    private MedicoService medicoService;

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

    private DadosCadastroMedico dadosCadastroValidos() {
        var endereco = new DadosEndereco("Rua A", "Centro", "12345678", "SP", "SP", "1", null);
        return new DadosCadastroMedico("Dr. Teste", "dr@teste.com", "11999999999", "123456",
                Especialidade.CARDIOLOGIA, endereco);
    }

    private DadosDetalhamentoMedico detalhamentoFake() {
        return new DadosDetalhamentoMedico(1L, "Dr. Teste", "dr@teste.com", "11999999999", "123456",
                Especialidade.CARDIOLOGIA, null);
    }

    // =========================================================
    // POST /medicos/cadastro (cadastrar)
    // =========================================================

    @Test
    @DisplayName("cadastrar - 403 quando sem autenticação")
    void cadastrar_cenario1() throws Exception {
        var response = mockMvc.perform(post("/medicos/cadastro")).andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("cadastrar - 400 quando JSON vazio (campos obrigatórios ausentes)")
    void cadastrar_cenario2() throws Exception {
        mockAutenticacao();

        mockMvc.perform(post("/medicos/cadastro")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[*].campo", hasItem("crm")))
                .andExpect(jsonPath("$[*].campo", hasItem("nome")))
                .andExpect(jsonPath("$[*].campo", hasItem("especialidade")))
                .andExpect(jsonPath("$[*].campo", hasItem("endereco")));
    }

    @Test
    @DisplayName("cadastrar - 201 quando dados válidos")
    void cadastrar_cenario3() throws Exception {
        mockAutenticacao();
        when(medicoService.cadastrar(any())).thenReturn(detalhamentoFake());

        var response = mockMvc.perform(post("/medicos/cadastro")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosCadastroMedicoJson.write(dadosCadastroValidos()).getJson()))
                .andReturn().getResponse();
        assertEquals(201, response.getStatus());
    }

    // =========================================================
    // GET /medicos (listar)
    // =========================================================

    @Test
    @DisplayName("listar - 403 quando sem autenticação")
    void listar_cenario1() throws Exception {
        var response = mockMvc.perform(get("/medicos")).andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("listar - 200 quando autenticado")
    void listar_cenario2() throws Exception {
        mockAutenticacao();
        when(medicoService.listar(any())).thenReturn(Page.empty());

        var response = mockMvc.perform(get("/medicos")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }

    // =========================================================
    // PUT /medicos (atualizar)
    // =========================================================

    @Test
    @DisplayName("atualizar - 403 quando sem autenticação")
    void atualizar_cenario1() throws Exception {
        var response = mockMvc.perform(put("/medicos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("atualizar - 400 quando id ausente")
    void atualizar_cenario2() throws Exception {
        mockAutenticacao();

        var response = mockMvc.perform(put("/medicos")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("atualizar - 400 quando médico não encontrado")
    void atualizar_cenario3() throws Exception {
        mockAutenticacao();
        when(medicoService.atualizar(any()))
                .thenThrow(new IllegalArgumentException("Médico não encontrado!"));

        var dados = new DadosAtualizacaoMedico(99L, "Novo Nome", null, null);

        var response = mockMvc.perform(put("/medicos")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAtualizacaoMedicoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("atualizar - 200 quando dados válidos")
    void atualizar_cenario4() throws Exception {
        mockAutenticacao();
        when(medicoService.atualizar(any())).thenReturn(detalhamentoFake());

        var dados = new DadosAtualizacaoMedico(1L, "Dr. Teste Atualizado", "11988887777", null);

        var response = mockMvc.perform(put("/medicos")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(dadosAtualizacaoMedicoJson.write(dados).getJson()))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }

    // =========================================================
    // DELETE /medicos/{id} (excluir)
    // =========================================================

    @Test
    @DisplayName("excluir - 403 quando sem autenticação")
    void excluir_cenario1() throws Exception {
        var response = mockMvc.perform(delete("/medicos/1")).andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("excluir - 400 quando médico tem consultas ativas")
    void excluir_cenario2() throws Exception {
        mockAutenticacao();
        doThrow(new IllegalArgumentException("Não é possível excluir um médico com consultas agendadas!"))
                .when(medicoService).excluir(any());

        var response = mockMvc.perform(delete("/medicos/1")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(400, response.getStatus());
    }

    @Test
    @DisplayName("excluir - 204 quando excluído com sucesso")
    void excluir_cenario3() throws Exception {
        mockAutenticacao();

        var response = mockMvc.perform(delete("/medicos/1")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(204, response.getStatus());
    }

    // =========================================================
    // GET /medicos/{id} (detalhar)
    // =========================================================

    @Test
    @DisplayName("detalhar - 403 quando sem autenticação")
    void detalhar_cenario1() throws Exception {
        var response = mockMvc.perform(get("/medicos/1")).andReturn().getResponse();
        assertEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("detalhar - 200 quando médico encontrado")
    void detalhar_cenario2() throws Exception {
        mockAutenticacao();
        when(medicoService.detalhar(any())).thenReturn(detalhamentoFake());

        var response = mockMvc.perform(get("/medicos/1")
                .header("Authorization", "Bearer token"))
                .andReturn().getResponse();
        assertEquals(200, response.getStatus());
    }
}
