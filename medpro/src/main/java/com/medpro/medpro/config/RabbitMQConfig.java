package com.medpro.medpro.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.medpro.medpro.model.dto.UserRegisteredEvent;

@Configuration
public class RabbitMQConfig {
   
    public static final String FILA_NOTIFICACAO = "user.registration.notification";
    public static final String EXCHANGE_NOTIFICAO = "user.registration.exchange";


    @Bean
    public Queue userRegisteredQueue() {
        var queue = new Queue(FILA_NOTIFICACAO, true);
        return queue;
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        var converter =  new Jackson2JsonMessageConverter();
        var typeMapper = new DefaultJackson2JavaTypeMapper();

        Map<String, Class<?>> dicionarioDeTipos = new HashMap<>();
        dicionarioDeTipos.put("UserRegisteredEvent", UserRegisteredEvent.class);
        typeMapper.setIdClassMapping(dicionarioDeTipos);
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    @Bean
    public FanoutExchange fanoutExchange() {
        var exchange = new FanoutExchange(EXCHANGE_NOTIFICAO);
        return exchange;
    }

    @Bean
    public Binding binding(Queue userRegisteredQueue, FanoutExchange fanoutExchange) {
        var binding = BindingBuilder.bind(userRegisteredQueue).to(fanoutExchange);
        return binding;
    }
}
