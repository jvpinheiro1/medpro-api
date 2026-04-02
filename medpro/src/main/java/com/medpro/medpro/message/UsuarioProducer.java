package com.medpro.medpro.message;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.medpro.medpro.config.RabbitMQConfig;
import com.medpro.medpro.model.dto.UserRegisteredEvent;

@Service
public class UsuarioProducer {

    private final RabbitTemplate rabbitTemplate;

    public UsuarioProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void enviarNotificacao(UserRegisteredEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.FILA_NOTIFICACAO, event);
    }

}
