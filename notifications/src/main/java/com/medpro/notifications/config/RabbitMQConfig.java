package com.medpro.notifications.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.medpro.notifications.dto.UserRegisteredEvent;

@Configuration
public class RabbitMQConfig {
    @Bean
    public MessageConverter receberMensagem(){
        var typeMapper = new DefaultJackson2JavaTypeMapper();
        Map<String, Class<?>> idClassMapping = new HashMap<>(); 
        idClassMapping.put("UserRegisteredEvent", UserRegisteredEvent.class);
        typeMapper.setIdClassMapping(idClassMapping);
        var converter =  new Jackson2JsonMessageConverter();
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }


}
