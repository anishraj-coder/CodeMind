package com.backend.codemind.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

@Configuration
public class LibConfig {
    @Bean
    public TextEncryptor textEncryptor(@Value("${app.crypto.password}")String password,
                                       @Value("${app.crypto.salt}")String salt){
        return Encryptors.delux(password,salt);

    }


    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestClient.Builder restClientBuilder(){
        return RestClient.builder();
    }



}
