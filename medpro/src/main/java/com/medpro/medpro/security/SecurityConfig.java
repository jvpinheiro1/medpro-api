package com.medpro.medpro.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.medpro.medpro.service.AuthService;
import com.medpro.medpro.service.TokenService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final TokenService tokenService;
    private final AuthService authService;

    SecurityConfig(TokenService tokenService, AuthService authService) {
        this.tokenService = tokenService;
        this.authService = authService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers(HttpMethod.POST, "/users").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/consultas/**").hasAnyRole("ADMIN", "RECEPCIONISTA", "MEDICO")
            .requestMatchers("/consultas/**").hasAnyRole("ADMIN", "RECEPCIONISTA")
            .requestMatchers(HttpMethod.GET, "/medicos").hasAnyRole("ADMIN", "RECEPCIONISTA", "MEDICO")
            .requestMatchers(HttpMethod.POST, "/medicos").hasRole("ADMIN")
            .requestMatchers("/medicos/**").hasAnyRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/pacientes").hasAnyRole("ADMIN", "RECEPCIONISTA", "MEDICO")
            .requestMatchers("/pacientes/**").hasAnyRole("ADMIN", "RECEPCIONISTA")
            .requestMatchers(HttpMethod.POST, "/auth/login"
            ).permitAll()
            .anyRequest().authenticated())
            .addFilterBefore(new SecurityFilter(tokenService, authService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Configura o AuthenticationManager para ser usado no AuthController
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}