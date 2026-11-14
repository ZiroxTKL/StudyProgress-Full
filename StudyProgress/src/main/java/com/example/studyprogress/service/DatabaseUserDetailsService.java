package com.example.studyprogress.service;

import com.example.studyprogress.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UsuarioRepository users;
    public DatabaseUserDetailsService(UsuarioRepository users) { this.users = users; }
    @Override
    public UserDetails loadUserByUsername(String email) {
        var user = users.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return User.withUsername(user.getEmail()).password(user.getPassword())
                .roles(user.getRol()).build();
    }
}
