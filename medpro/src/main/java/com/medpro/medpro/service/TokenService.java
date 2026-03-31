package com.medpro.medpro.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.medpro.medpro.model.entity.User;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TokenService {

    private final String secretKey;

    public TokenService(@Value("${api.security.token.secret}") String secretKey) {
        this.secretKey = secretKey;
    }

    public String gerarToken(User usuario) {
         Algorithm algorithm = Algorithm.HMAC256(secretKey);
         return JWT.create()
                 .withIssuer("medpro-api")
                 .withSubject(usuario.getLogin())
                 .withClaim("role", usuario.getRole().name())
                 .withExpiresAt(LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00")))
                 .sign(algorithm);
    }

    public String validarToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            return JWT.require(algorithm)
                    .withIssuer("medpro-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return "";
        }
    }

    public String recuperarToken(HttpServletRequest request){
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

}
