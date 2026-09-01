package com.backend.codemind.config;

import com.backend.codemind.security.GitHubOauth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.*;
import org.springframework.validation.annotation.Validated;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GitHubOauth2UserService gitHubOauth2UserService;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationSuccessHandler oauth2SuccessHandler,
                                                   AuthenticationFailureHandler oauth2FailureHandler){
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf->csrf.disable())
                .sessionManagement(session->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth->auth
                        .requestMatchers(
                                "/api/auth/login-url",
                                "/login/oauth2/**",
                                "/error"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth->oauth
                        .userInfoEndpoint(userInfo->userInfo
                                .userService(gitHubOauth2UserService)
                        ).successHandler(oauth2SuccessHandler)
                        .failureHandler(oauth2FailureHandler)

                )
                .exceptionHandling(ex->ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .logout(logout->logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(((request,
                                                response, authentication) ->
                                response.setStatus(HttpStatus.NO_CONTENT.value()))
                        )
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("CODEMIND_SESSION")
                )
                .build();
    }

    @Bean
    public AuthenticationSuccessHandler successHandler(@Value("${app.frontend-url}:http://localhost:3000")
                                                           String frontendUrl){
        SimpleUrlAuthenticationSuccessHandler handler=new SimpleUrlAuthenticationSuccessHandler();
        handler.setDefaultTargetUrl(frontendUrl+"/auth/callbacl");
        return handler;
    }

    @Bean
    public AuthenticationFailureHandler failureHandler(@Value("${app.frontend-url}:http://localhost:3000")
                                                           String frontendUrl){
        SimpleUrlAuthenticationFailureHandler handler=new SimpleUrlAuthenticationFailureHandler();
        handler.setDefaultFailureUrl(frontendUrl+"/login?error=oauth_failure");
        return handler;
    }
}
