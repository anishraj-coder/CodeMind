package com.backend.codemind.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AppConfig {

    @Bean("indexingExecutor")
    public Executor indexingExecutor(){
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
