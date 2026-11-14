package com.example.studyprogress.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.*;
@Configuration @EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwt;
    private final String origins;
    public SecurityConfig(JwtAuthenticationFilter jwt,@Value("${app.allowed-origins:http://localhost:5173}") String origins){this.jwt=jwt;this.origins=origins;}
    @Bean public SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception{
        http.csrf(c->c.disable()).cors(c->c.configurationSource(corsConfigurationSource()))
            .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a->a.requestMatchers("/health","/api/auth/**","/api/v1/auth/login","/api/v1/auth/registro","/api/v1/auth/refresh","/api/v1/auth/logout").permitAll()
                .requestMatchers("/api/usuarios/**","/api/email/**").hasRole("ADMIN").anyRequest().authenticated())
            .exceptionHandling(e->e.authenticationEntryPoint((q,r,x)->{r.setStatus(401);r.setContentType("application/json");r.getWriter().write("{\"status\":401,\"message\":\"Inicia sesión para continuar\"}");})
                .accessDeniedHandler((q,r,x)->{r.setStatus(403);r.setContentType("application/json");r.getWriter().write("{\"status\":403,\"message\":\"No tienes permiso para esta acción\"}");}))
            .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration c=new CorsConfiguration();c.setAllowedOrigins(Arrays.asList(origins.split(",")));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("Authorization","Content-Type","X-Client"));
        c.setAllowCredentials(true);c.setMaxAge(3600L);UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;
    }
}
