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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/medicos/**", "/pacientes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/medicos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/medicos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/pacientes").hasAnyRole("ADMIN", "RECEPCIONISTA")
                .requestMatchers(HttpMethod.PUT, "/pacientes/**").hasAnyRole("ADMIN", "RECEPCIONISTA")
                .requestMatchers(HttpMethod.POST, "/consultas").hasAnyRole("ADMIN", "RECEPCIONISTA")
                .requestMatchers(HttpMethod.DELETE, "/consultas").hasAnyRole("ADMIN", "RECEPCIONISTA")
                .requestMatchers(HttpMethod.GET, "/**").authenticated()
                .anyRequest().authenticated())
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}