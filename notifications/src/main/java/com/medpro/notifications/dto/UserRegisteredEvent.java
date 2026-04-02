package com.medpro.notifications.dto;

public record UserRegisteredEvent(String login, String role, Long medicoId) {

}
