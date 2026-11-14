package com.example.studyprogress.repository;

import com.example.studyprogress.model.Curso;
import com.example.studyprogress.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByCurso(Curso curso);

    List<Tarea> findByCursoAndCompletada(Curso curso, boolean completada);
    org.springframework.data.domain.Page<Tarea> findByCursoUsuarioEmailAndTituloContainingIgnoreCase(String email,String search,org.springframework.data.domain.Pageable pageable);
}