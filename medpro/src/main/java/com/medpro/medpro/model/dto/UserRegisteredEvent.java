package com.medpro.medpro.model.dto;

public record UserRegisteredEvent(String login, String role, Long medicoId) {

}
