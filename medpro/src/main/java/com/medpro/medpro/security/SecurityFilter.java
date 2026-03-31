package com.medpro.medpro.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.medpro.medpro.model.entity.User;
import com.medpro.medpro.service.AuthService;
import com.medpro.medpro.service.TokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class SecurityFilter extends OncePerRequestFilter{

    private final TokenService tokenService;
    private final AuthService authService;

    public SecurityFilter(TokenService tokenService, AuthService authService) {
        this.tokenService = tokenService;
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws java.io.IOException, ServletException {
        var tokenJWT = tokenService.recuperarToken(request);
        if (tokenJWT != null) {
            var loginUsuario = tokenService.validarToken(tokenJWT);
            if (!loginUsuario.isEmpty()) {
                var userDetail =  (User) authService.loadUserByUsername(loginUsuario);
                var authentication = new UsernamePasswordAuthenticationToken(userDetail, null, userDetail.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }

}
