package com.example.SEPDrive.config;

import com.example.SEPDrive.config.filter.JwtFilter;
import com.example.SEPDrive.service.myUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private myUserDetailsService myUserDetailsService ;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    @Qualifier("delegatedAuthEntryPoint")
    private AuthenticationEntryPoint authenticationEntryPoint;





    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationEntryPoint authenticationEntryPoint) throws Exception {

     return http

        .csrf(custmizer -> custmizer.disable())
             .cors(Customizer.withDefaults())
        .authorizeHttpRequests(requests -> requests.requestMatchers("v1/auth/**").permitAll()
                .anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults())
             .formLogin(Customizer.withDefaults())
             .logout(Customizer.withDefaults())
             .authenticationProvider(authenticationProvider())
             .sessionManagement(session ->
               session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
             .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
             .exceptionHandling(exception -> exception
             .authenticationEntryPoint(authenticationEntryPoint))
             .build();


    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        authProvider.setUserDetailsService(myUserDetailsService);

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationmanager(AuthenticationConfiguration configuration) throws Exception {
       return configuration.getAuthenticationManager();


    }
}
