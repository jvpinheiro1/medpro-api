package com.medpro.notifications.service;


import java.io.IOException;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.medpro.notifications.dto.UserRegisteredEvent;
import com.rabbitmq.client.Channel;

@Component
public class UserRegisteredListener {

    @RabbitListener(queues = "user.registration.notification")
    public void handleUserRegistered(UserRegisteredEvent event, Channel channel, @Header("amqp_deliveryTag") long tag) throws IOException {
        try{
            System.out.println("Novo usuario registrado " + event.login() + " com a role " + event.role());
            channel.basicAck(tag, false);
        } catch (Exception e) {
            channel.basicNack(tag, false, true);
        }
    }
}
