package com.medpro.medpro.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medpro.medpro.enums.EnumRole;
import com.medpro.medpro.message.UsuarioProducer;
import com.medpro.medpro.model.dto.DadosCadastroUsuario;
import com.medpro.medpro.model.dto.DadosDetalhamentoUsuario;
import com.medpro.medpro.model.dto.UserRegisteredEvent;
import com.medpro.medpro.model.entity.User;
import com.medpro.medpro.repository.MedicoRepository;
import com.medpro.medpro.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MedicoRepository medicoRepository;
    private final UsuarioProducer usuarioProducer;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, MedicoRepository medicoRepository, UsuarioProducer usuarioProducer) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.medicoRepository = medicoRepository;
        this.usuarioProducer = usuarioProducer;
    }

    @Transactional
    public DadosDetalhamentoUsuario cadastrar(DadosCadastroUsuario dados) {
        if (dados.role().equals(EnumRole.MEDICO.name())) {
            if(dados.medicoId() == null) {
                throw new IllegalArgumentException("O Id do médico deve ser fornecido para o papel MEDICO");
            }
            if (!medicoRepository.existsById(dados.medicoId())) {
                throw new IllegalArgumentException("O Id do médico fornecido não existe!");
            }
        }
        String senhaCriptografada = passwordEncoder.encode(dados.password());
        var user = new User(dados.login(), senhaCriptografada, EnumRole.valueOf(dados.role()), dados.medicoId());

        userRepository.save(user);
        usuarioProducer.enviarNotificacao(criarEvento(user));
        return new DadosDetalhamentoUsuario(user);
    }

    private UserRegisteredEvent criarEvento(User user) {
        return new UserRegisteredEvent(user.getLogin(), user.getRole().name(), user.getMedicoId());
    }

    public Page<DadosDetalhamentoUsuario> listar(Pageable paginacao) {
        Page<DadosDetalhamentoUsuario> page = userRepository.findAll(paginacao).map(DadosDetalhamentoUsuario::new);
        return page;
    }
}
