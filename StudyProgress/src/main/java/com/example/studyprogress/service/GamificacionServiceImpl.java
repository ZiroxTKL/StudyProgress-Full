package com.example.studyprogress.service;

import com.example.studyprogress.model.Usuario;
import com.example.studyprogress.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GamificacionServiceImpl implements GamificacionService {

    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;

    public GamificacionServiceImpl(
            UsuarioRepository usuarioRepository,
            EntityManager entityManager
    ) {
        this.usuarioRepository = usuarioRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public Usuario sumarPuntos(
            Usuario usuario,
            int puntos
    ) {

        usuarioRepository.incrementarPuntos(usuario.getId(), puntos);
        Usuario actualizado = usuarioRepository.getReferenceById(usuario.getId());
        entityManager.refresh(actualizado);
        return actualizado;
    }

    @Override
    public String obtenerNivel(Usuario usuario) {

        int puntos = usuario.getPuntos();

        if (puntos >= 500) {
            return "AVANZADO";
        }

        if (puntos >= 200) {
            return "INTERMEDIO";
        }

        return "PRINCIPIANTE";
    }
}
